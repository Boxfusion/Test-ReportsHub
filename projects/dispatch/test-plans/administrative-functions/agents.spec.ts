// AUTO-RECORDED from test-plans/administrative-functions/agents.md
// Source: Azure DevOps test plan #65099, suite #65140 (2.14 Agents)
// The .md plan is canonical. AI-repair will patch failing lines in this file.
//
// Selectors recorded live against NC Dispatch QA on 2026-06-25. Agents ("All Agents") is a form-dialog
// grid: Add New opens "Add New Agent"; rows expose magnifying-glass + edit-pencil links (both route to
// /agent-roles-detailsV2?id=…; edit adds &mode=edit). Details/edit view actions are .sha-toolbar-btn
// (Back/Edit/Save/Cancel Form Edit) inside #modalContainerId.

import { test, expect, Page, Locator } from '@playwright/test';

const BASE = 'https://ncdoh-dispatcher-adminportal-qa.shesha.app';
const APP_URL = `${BASE}/login`;
const GRID = `${BASE}/dynamic/Boxfusion.Dispatcher/agent-roles-table`;
const ADMIN = { user: 'Admin', password: '123qwe' };
const DETAILS = 'a[href*="agent-roles-detailsV2"]:not([href*="mode=edit"])';
const ROW_EDIT = 'a[href*="agent-roles-detailsV2"][href*="mode=edit"]';

async function login(page: Page) {
  await page.goto(APP_URL);
  // The login page occasionally renders blank on first paint — reload once if the form isn't there.
  const user = page.getByPlaceholder('Username');
  try {
    await expect(user).toBeVisible({ timeout: 15000 });
  } catch {
    await page.reload();
    await expect(user).toBeVisible({ timeout: 20000 });
  }
  await user.fill(ADMIN.user);
  await page.getByPlaceholder('Password').fill(ADMIN.password);
  await page.getByRole('button', { name: 'Sign In' }).click();
  await page.waitForURL((url) => !url.href.includes('/login'), { timeout: 30000 });
}

async function gotoGrid(page: Page) {
  await page.goto(GRID);
  await expect(page.getByRole('table')).toBeVisible({ timeout: 30000 });
  await expect(page.getByRole('textbox').first()).toBeVisible({ timeout: 30000 });
  // The Agents grid loads its rows asynchronously and slowly (~5-8s) — wait for the row detail
  // links so subsequent magnifying-glass / edit-pencil clicks don't race the load.
  await expect(page.locator('a[href*="agent-roles-detailsV2"]').first()).toBeVisible({ timeout: 30000 });
}

async function searchGrid(page: Page, term: string) {
  const box = page.getByRole('textbox').first();
  await box.click();
  await box.fill(term);
  await page.getByRole('button', { name: 'search' }).click();
  await page.waitForTimeout(2500);
}

function detailView(page: Page): Locator {
  return page.locator('#modalContainerId');
}
function toolBtn(page: Page, label: RegExp): Locator {
  return page.locator('#modalContainerId .sha-toolbar-btn').filter({ hasText: label });
}
// Surname — a free-text field on the agent edit form with no uniqueness/format constraint (unlike
// Username / Email / Mobile) — safe to tweak for save/cancel cases.
function surnameField(page: Page): Locator {
  return detailView(page).locator('.ant-form-item').filter({ hasText: 'Surname' }).getByRole('textbox');
}

test.describe('ADMIN-2.14 — Agents', () => {

  test('TC-01: Log in to NC Dispatch', async ({ page }) => {
    await login(page);
    await expect(page).not.toHaveURL(/\/login/i);
  });

  // ADO Test Case #65898: https://dev.azure.com/boxfusion/pd-dispatcher-V2/_workitems/edit/65898
  test('TC-02: Search for an agent', async ({ page }) => {
    test.setTimeout(60_000);
    await login(page);
    await gotoGrid(page);
    await expect(page.getByRole('table')).toBeVisible();
    await searchGrid(page, 'Auto');
    await expect(page.getByRole('cell', { name: /Auto/ }).first()).toBeVisible({ timeout: 15000 });
  });

  // ADO Test Case #65899: https://dev.azure.com/boxfusion/pd-dispatcher-V2/_workitems/edit/65899
  test('TC-03: Open Add Agent dialog', async ({ page }) => {
    test.setTimeout(60_000);
    await login(page);
    await gotoGrid(page);
    await page.getByRole('button', { name: /Add New/ }).click();
    await expect(page.locator('.ant-modal-content')).toBeVisible({ timeout: 15000 });
    await expect(page.getByText('Add New Agent')).toBeVisible();
  });

  // ADO Test Case #65900: https://dev.azure.com/boxfusion/pd-dispatcher-V2/_workitems/edit/65900
  test('TC-04: Export agents', async ({ page }) => {
    test.setTimeout(60_000);
    await login(page);
    await gotoGrid(page);
    const [download] = await Promise.all([
      page.waitForEvent('download', { timeout: 20000 }),
      page.getByRole('button', { name: /Export/ }).click(),
    ]);
    expect(download.suggestedFilename()).toBeTruthy();
  });

  // ADO Test Case #65901: https://dev.azure.com/boxfusion/pd-dispatcher-V2/_workitems/edit/65901
  test('TC-05: View agent details', async ({ page }) => {
    test.setTimeout(60_000);
    await login(page);
    await gotoGrid(page);
    await page.locator(DETAILS).first().click();
    await expect(page).toHaveURL(/agent-roles-detailsV2/);
    await expect(toolBtn(page, /^Edit$/)).toBeVisible({ timeout: 15000 });
  });

  // ADO Test Case #65902: https://dev.azure.com/boxfusion/pd-dispatcher-V2/_workitems/edit/65902
  test('TC-06: Edit agent from details view', async ({ page }) => {
    test.setTimeout(60_000);
    await login(page);
    await gotoGrid(page);
    await page.locator(DETAILS).first().click();
    await toolBtn(page, /^Edit$/).click();
    await expect(toolBtn(page, /^Save$/)).toBeVisible({ timeout: 15000 });
    await expect(toolBtn(page, /^Cancel Form Edit$/)).toBeVisible();
  });

  // ADO Test Case #65903: https://dev.azure.com/boxfusion/pd-dispatcher-V2/_workitems/edit/65903
  test('TC-07: Cancel edit in details view', async ({ page }) => {
    test.setTimeout(60_000);
    await login(page);
    await gotoGrid(page);
    await page.locator(DETAILS).first().click();
    await toolBtn(page, /^Edit$/).click();
    await expect(toolBtn(page, /^Cancel Form Edit$/)).toBeVisible({ timeout: 15000 });
    await toolBtn(page, /^Cancel Form Edit$/).click();
    await expect(toolBtn(page, /^Edit$/)).toBeVisible({ timeout: 15000 });
    await expect(toolBtn(page, /^Save$/)).toHaveCount(0);
  });

  // ADO Test Case #65904: https://dev.azure.com/boxfusion/pd-dispatcher-V2/_workitems/edit/65904
  test('TC-08: Save edit in details view', async ({ page }) => {
    test.setTimeout(60_000);
    await login(page);
    await gotoGrid(page);
    await page.locator(DETAILS).first().click();
    await toolBtn(page, /^Edit$/).click();
    await expect(toolBtn(page, /^Save$/)).toBeVisible({ timeout: 15000 });
    // STEP: MODIFY the Surname field
    const surname = surnameField(page);
    await surname.click();
    await surname.press('End');
    await surname.pressSequentially(' x');
    // STEP: CLICK Save
    await toolBtn(page, /^Save$/).click();
    // ASSERT (BLOCKING) saved — returns to view mode (Edit visible again)
    await expect(toolBtn(page, /^Edit$/)).toBeVisible({ timeout: 20000 });
  });

  // ADO Test Case #65905: https://dev.azure.com/boxfusion/pd-dispatcher-V2/_workitems/edit/65905
  test('TC-09: Edit agent from index', async ({ page }) => {
    test.setTimeout(60_000);
    await login(page);
    await gotoGrid(page);
    // STEP: CLICK the first row's edit-pencil link (routes to mode=edit)
    await page.locator(ROW_EDIT).first().click();
    await expect(page).toHaveURL(/mode=edit/);
    await expect(toolBtn(page, /^Save$/)).toBeVisible({ timeout: 15000 });
  });

  // ADO Test Case #65906: https://dev.azure.com/boxfusion/pd-dispatcher-V2/_workitems/edit/65906
  test('TC-10: Save edit from index edit view', async ({ page }) => {
    test.setTimeout(60_000);
    await login(page);
    await gotoGrid(page);
    await page.locator(ROW_EDIT).first().click();
    await expect(toolBtn(page, /^Save$/)).toBeVisible({ timeout: 15000 });
    // STEP: MODIFY the Surname field then Save
    const surname = surnameField(page);
    await surname.click();
    await surname.press('End');
    await surname.pressSequentially(' x');
    await toolBtn(page, /^Save$/).click();
    // ASSERT (BLOCKING) saved — returns to view mode (Edit visible)
    await expect(toolBtn(page, /^Edit$/)).toBeVisible({ timeout: 20000 });
  });

  // ADO Test Case #65907: https://dev.azure.com/boxfusion/pd-dispatcher-V2/_workitems/edit/65907
  test('TC-11: Cancel edit from index edit view', async ({ page }) => {
    test.setTimeout(60_000);
    await login(page);
    await gotoGrid(page);
    await page.locator(ROW_EDIT).first().click();
    await expect(toolBtn(page, /^Cancel Form Edit$/)).toBeVisible({ timeout: 15000 });
    // STEP: CLICK Cancel Form Edit
    await toolBtn(page, /^Cancel Form Edit$/).click();
    // ASSERT the edit view closes without saving (Edit visible, Save gone)
    await expect(toolBtn(page, /^Edit$/)).toBeVisible({ timeout: 15000 });
    await expect(toolBtn(page, /^Save$/)).toHaveCount(0);
  });
});
