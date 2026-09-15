// AUTO-RECORDED from test-plans/Profile/verify-secondary-qualifications-in-progress.md
// Source: Azure DevOps test plan #99437, suite #104586, test case #104624
// The .md plan is canonical. AI-repair will patch failing lines in this file.
// Do not hand-edit unless you are also updating the .md plan.
//
// Sibling of PROFILE-104623 (Complete + Date Obtained). This case covers the
// In Progress status instead. Helpers below are the same ones proven working
// against the QA environment while repairing PROFILE-104623 on 2026-07-16.

import { test, expect, Page, Locator } from '@playwright/test';

const APP_URL = 'https://pd-recruitment-publicportal-1-qa.shesha.app/';
const APPLICANT = { user: 'Fred', password: 'Metaganemr%03' };
const INSTITUTION = 'Tshwane High School';
const QUALIFICATION_NAME = 'NSC';

async function loginAsFred(page: Page) {
  await page.goto(`${APP_URL}login`);
  await page.locator('input[type="text"]').first().fill(APPLICANT.user);
  await page.locator('input[type="password"]').first().fill(APPLICANT.password);
  await page.getByRole('button', { name: /sign in/i }).click();
  await page.waitForURL(url => !url.href.includes('/login'), { timeout: 30000 });
  await page.waitForLoadState('networkidle');
}

async function goToSecondaryQualifications(page: Page) {
  await page.getByRole('link', { name: 'Manage Profile' }).click();
  await page.waitForLoadState('networkidle');
  await page.getByRole('button', { name: 'Secondary Qualifications' }).click();
  await page.waitForTimeout(1000);
  // The tab occasionally requires a second click to actually swap the panel content.
  if (!(await page.getByRole('heading', { name: 'Secondary Qualifications' }).isVisible().catch(() => false))) {
    await page.getByRole('button', { name: 'Secondary Qualifications' }).click();
    await page.waitForTimeout(1500);
  }
}

function fieldInput(page: Page, label: string): Locator {
  return page.getByText(label, { exact: false }).last().locator('xpath=following::input[1]');
}

function antCombo(page: Page, label: string): Locator {
  return page.getByText(label, { exact: false }).last().locator('xpath=following::*[contains(concat(" ", normalize-space(@class), " "), " ant-select ")][1]');
}

// Types searchTerm to filter the (possibly virtualized) option list down to a
// single match, then selects it via keyboard. The filtered option's DOM node
// is reported by Playwright as hidden (rc-virtual-list renders it off the
// visible viewport), so a click-based selection times out waiting for
// visibility; Enter selects the highlighted option regardless.
async function selectAntOption(page: Page, combo: Locator, searchTerm: string) {
  await combo.click();
  await page.waitForTimeout(300);
  await combo.locator('input').focus();
  await page.keyboard.press('Control+A');
  await page.keyboard.press('Backspace');
  await page.keyboard.type(searchTerm);
  await page.waitForTimeout(400);
  await page.keyboard.press('Enter');
  await page.waitForTimeout(800);
}

test.describe('PROFILE-104624 — Verify Secondary Qualifications In Progress', () => {
  test.describe.configure({ mode: 'serial' });

  test('TC-01: Login as Fred', async ({ page }) => {
    // STEP 1-5: NAVIGATE, TYPE Username/Password, CLICK Sign In
    await loginAsFred(page);
    // ASSERT (BLOCKING) URL no longer contains /login and Dashboard is visible
    await expect(page).not.toHaveURL(/login/i);
    await expect(page.getByText('Your Dashboard')).toBeVisible({ timeout: 30000 });
  });

  test('TC-02: Click on Secondary Qualifications tab', async ({ page }) => {
    await loginAsFred(page);
    // STEP: CLICK Manage Profile, then CLICK the Secondary Qualifications step
    await goToSecondaryQualifications(page);
    // ASSERT (BLOCKING) Secondary Qualifications heading visible
    await expect(page.getByRole('heading', { name: 'Secondary Qualifications' })).toBeVisible({ timeout: 15000 });
  });

  test('TC-03: Populate Institution and Qualification Name', async ({ page }) => {
    await loginAsFred(page);
    await goToSecondaryQualifications(page);
    // STEP: TYPE institution and qualification name
    const institutionField = fieldInput(page, 'Institution');
    await institutionField.fill(INSTITUTION);
    const qualNameField = fieldInput(page, 'Qualification Name');
    await qualNameField.fill(QUALIFICATION_NAME);
    // ASSERT (BLOCKING) both fields contain the typed values
    await expect(institutionField).toHaveValue(INSTITUTION);
    await expect(qualNameField).toHaveValue(QUALIFICATION_NAME);
  });

  test('TC-04: Qualification Type dropdown', async ({ page }) => {
    await loginAsFred(page);
    await goToSecondaryQualifications(page);
    const qualTypeCombo = antCombo(page, 'Qualification Type');
    // STEP: CLICK dropdown, SELECT "Higher Certificates..."
    await selectAntOption(page, qualTypeCombo, 'Higher');
    // ASSERT (BLOCKING) field displays the selected option
    await expect(qualTypeCombo.locator('.ant-select-selection-item')).toContainText('Higher Certificates');
  });

  test('TC-05: Qualification Status In Progress', async ({ page }) => {
    await loginAsFred(page);
    await goToSecondaryQualifications(page);
    const qualStatusCombo = antCombo(page, 'Qualification Status');
    // STEP: CLICK dropdown, SELECT "In Progress"
    await qualStatusCombo.click();
    await page.waitForTimeout(500);
    // "In Progress" is the 1st of 2 options. A single ArrowDown highlights it
    // (the combo opens with nothing highlighted); Enter confirms.
    await page.keyboard.press('ArrowDown');
    await page.waitForTimeout(150);
    await page.keyboard.press('Enter');
    await page.waitForTimeout(800);
    // ASSERT (BLOCKING) status shows In Progress; Next enabled
    await expect(qualStatusCombo.locator('.ant-select-selection-item')).toHaveText('In Progress');
    await expect(page.getByRole('button', { name: 'Next', exact: true })).toBeEnabled();
    // ASSERT Date Obtained field is not revealed (In Progress keeps it hidden,
    // though its label/input remain in the DOM rather than being removed)
    await expect(page.getByText('Date Obtained', { exact: false })).not.toBeVisible();
  });

  test('TC-06: Click Next button', async ({ page }) => {
    await loginAsFred(page);
    await goToSecondaryQualifications(page);
    const qualStatusCombo = antCombo(page, 'Qualification Status');
    await qualStatusCombo.click();
    await page.waitForTimeout(500);
    await page.keyboard.press('ArrowDown');
    await page.waitForTimeout(150);
    await page.keyboard.press('Enter');
    await page.waitForTimeout(800);

    // STEP: CLICK the Next button
    await page.getByRole('button', { name: 'Next', exact: true }).click();
    await page.waitForTimeout(1500);
    // ASSERT (BLOCKING) Tertiary Qualifications heading is visible
    await expect(page.getByRole('heading', { name: 'Tertiary Qualifications' })).toBeVisible({ timeout: 15000 });
  });
});
