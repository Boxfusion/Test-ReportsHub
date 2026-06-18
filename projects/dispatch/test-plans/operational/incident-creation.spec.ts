// AUTO-RECORDED from test-plans/operational/incident-creation.md
// Source: NC Dispatch operational flow — Call Taker logs an incident.
// The .md plan is canonical. AI-repair will patch failing lines in this file.
//
// This test CREATES a new incident on QA each run (stateful). It logs in as the Call Taker role
// (NEW is disabled for Admin), expands the incident list panel so the NEW button isn't overlapped
// by the Resources/map/sidebar panels, opens NEW -> Incident, fills the required fields, saves, and
// asserts the new incident opens with a REF heading. NO `networkidle` waits — this Shesha app holds
// background connections open and never settles, so waits are on concrete elements.

import { test, expect, Page } from '@playwright/test';

const BASE = 'https://ncdoh-dispatcher-adminportal-qa.shesha.app';
const CALL_TAKER = { user: 'autotestcalltaker', password: '123qwe' };

async function login(page: Page, user: string, password: string) {
  await page.goto(`${BASE}/login`);
  await page.getByPlaceholder('Username').fill(user);
  await page.getByPlaceholder('Password').fill(password);
  await page.getByRole('button', { name: 'Sign In' }).click();
  await page.waitForURL((url) => !url.href.includes('/login'), { timeout: 30000 });
}

// AntD select: click the container that shows the given placeholder/value text, then pick the option.
async function pickSelect(page: Page, currentText: string, optionTitle: string) {
  await page.locator('.ant-select').filter({ hasText: currentText }).first().click();
  await page.getByTitle(optionTitle, { exact: true }).first().click();
}

// Selecting an address near existing incidents pops a "Possible Duplicate Incidents" modal that blocks
// the rest of the form. Dismiss it if it appears (timing varies, so this is best-effort).
async function dismissDuplicateModal(page: Page) {
  const modal = page.locator('.ant-modal-content', { hasText: 'Possible Duplicate Incidents' });
  if (await modal.isVisible().catch(() => false)) {
    await modal.locator('.ant-modal-close').click().catch(() => {});
    await modal.waitFor({ state: 'hidden', timeout: 8000 }).catch(() => {});
  }
}

test.describe('Operational — Create Incident (Call Taker)', () => {

  test('TC-01: Call Taker logs a new incident', async ({ page }) => {
    test.setTimeout(120_000);
    // A wide viewport keeps the dashboard panels from overlapping the NEW button.
    await page.setViewportSize({ width: 1920, height: 1080 });

    await login(page, CALL_TAKER.user, CALL_TAKER.password);

    // Dispatcher dashboard
    await expect(page.getByRole('heading', { name: 'Incidents' })).toBeVisible({ timeout: 30000 });

    // STEP: expand the incident list panel FIRST (otherwise NEW is overlapped and unclickable)
    await page.locator('#incidentListPanelId_toggleButton').click();

    // STEP: NEW -> Incident. The dropdown menu is flaky (overlapping panels can intercept / close it),
    // so retry the open+click as a unit until the create form appears.
    const incidentItem = page.getByRole('menuitem', { name: 'Incident', exact: true });
    await expect(async () => {
      await page.getByRole('button', { name: 'NEW down' }).click();
      await incidentItem.click({ timeout: 3000 });
    }).toPass({ timeout: 30000 });

    // ASSERT the create form opened
    await expect(page.getByRole('heading', { name: 'Add a New Incident' })).toBeVisible({ timeout: 30000 });

    // STEP: Caller Number — use a unique number each run. A previously-used number triggers an
    // "Existing Reporter Number" confirmation modal whose overlay then blocks the rest of the form.
    const callerNumber = '082' + String(Date.now()).slice(-7);
    await page.getByRole('textbox', { name: 'Reporter number' }).fill(callerNumber);

    // STEP: Address via Google Places autocomplete
    const addr = page.getByRole('textbox', { name: 'Search Address' });
    await addr.click();
    await addr.fill('North Cape Mall, Kimberley');
    const addrOption = page.getByRole('option', { name: /North Cape Mall.*Kimberley/i }).first();
    await addrOption.waitFor({ state: 'visible', timeout: 20000 });
    await addrOption.click();
    await dismissDuplicateModal(page);

    // STEP: Call Type (searchable) — pick our "Heart Attack" call type; Call Triage auto-fills from it.
    await page.locator('.ant-select').filter({ hasText: 'Call Type' }).first().click();
    await page.keyboard.type('Heart Attack');
    await page.getByTitle('Heart Attack', { exact: true }).first().click();
    await dismissDuplicateModal(page);

    // STEP: Case Type + Location Type
    await pickSelect(page, 'Select Case Type', 'MVAPVA');
    await pickSelect(page, 'Select Location Type', 'Urban');

    // STEP: Incident Notes (optional)
    await page.getByRole('textbox', { name: 'Notes' }).fill('Allure spec — Call Taker incident at North Cape Mall.');

    // STEP: Save
    await page.getByRole('button', { name: 'Save Incident' }).click();

    // ASSERT (BLOCKING) the new incident opened with a REF heading and shows the Call Type.
    await expect(page.getByRole('heading', { name: /REF:\s*\d{4,}\/\d+/ })).toBeVisible({ timeout: 30000 });
    await expect(page.getByText('Heart Attack').first()).toBeVisible({ timeout: 15000 });
  });
});
