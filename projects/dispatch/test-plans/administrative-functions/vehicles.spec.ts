// AUTO-RECORDED from test-plans/administrative-functions/vehicles.md
// Source: Azure DevOps test plan #65099, suite #65149 (2.4 Vehicles)
// The .md plan is canonical. AI-repair will patch failing lines in this file.
//
// Selectors recorded live against NC Dispatch QA on 2026-06-25. Vehicles is a form-dialog grid:
// Add New opens "Add New Vehicle"; rows expose a magnifying-glass details link (/vehicle-details?id=…)
// and an edit pencil (…&mode=edit). Details/edit view actions are .sha-toolbar-btn (Back/Edit/Save/
// Cancel Form Edit) inside #modalContainerId.

import { test, expect, Page, Locator } from '@playwright/test';

const BASE = 'https://ncdoh-dispatcher-adminportal-qa.shesha.app';
const APP_URL = `${BASE}/login`;
const GRID = `${BASE}/dynamic/Boxfusion.Ems/vehicles`;
const ADMIN = { user: 'Admin', password: '123qwe' };
const DETAILS = 'a[href*="vehicle-details"]:not([href*="mode=edit"])';

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
}

async function searchGrid(page: Page, term: string) {
  const box = page.getByRole('textbox').first();
  await box.click();
  await box.fill(term);
  await page.getByRole('button', { name: 'search' }).click();
  await page.waitForTimeout(2500);
}

// Details/edit view content lives in #modalContainerId; action buttons carry .sha-toolbar-btn (the
// bare "edit" pencil there is a form-designer control, not an action) — match by exact text.
function detailView(page: Page): Locator {
  return page.locator('#modalContainerId');
}
function toolBtn(page: Page, label: RegExp): Locator {
  return page.locator('#modalContainerId .sha-toolbar-btn').filter({ hasText: label });
}

// --- create-dialog helpers (scope by form-item label so the right field/select is hit) ---
function formItem(modal: Locator, label: string): Locator {
  return modal.locator('.ant-form-item').filter({ hasText: label }).first();
}
async function pickFirstOption(page: Page, modal: Locator, label: string) {
  await formItem(modal, label).locator('.ant-select-selector').click();
  // Wait for a real (visible) option to render, then select via keyboard — clicking the option
  // directly is flaky (rc-virtual-list renders the active option off-screen / mid-animation).
  await page.locator('.ant-select-dropdown:not(.ant-select-dropdown-hidden) .ant-select-item-option').first()
    .waitFor({ state: 'visible', timeout: 10000 });
  await page.keyboard.press('ArrowDown');
  await page.keyboard.press('Enter');
}

// For large async-loading reference selects (e.g. Station): type to filter, wait for a match, select.
async function pickByTyping(page: Page, modal: Locator, label: string, term: string) {
  await formItem(modal, label).locator('.ant-select-selector').click();
  await page.keyboard.type(term);
  await page.locator('.ant-select-dropdown:not(.ant-select-dropdown-hidden) .ant-select-item-option', { hasText: term })
    .first()
    .waitFor({ state: 'visible', timeout: 10000 });
  await page.keyboard.press('ArrowDown');
  await page.keyboard.press('Enter');
}

test.describe('ADMIN-2.4 — Vehicles', () => {

  test('TC-01: Log in to NC Dispatch', async ({ page }) => {
    await login(page);
    await expect(page).not.toHaveURL(/\/login/i);
  });

  // ADO Test Case #65739: https://dev.azure.com/boxfusion/pd-dispatcher-V2/_workitems/edit/65739
  test('TC-02: Search for a vehicle by registration number', async ({ page }) => {
    test.setTimeout(60_000);
    await login(page);
    await gotoGrid(page);
    await expect(page.getByRole('table')).toBeVisible();
    await searchGrid(page, 'NC');
    await expect(page.getByRole('cell', { name: /NC/ }).first()).toBeVisible({ timeout: 15000 });
  });

  // ADO Test Case #65740: https://dev.azure.com/boxfusion/pd-dispatcher-V2/_workitems/edit/65740
  test('TC-03: Search by vehicle type or station', async ({ page }) => {
    test.setTimeout(60_000);
    await login(page);
    await gotoGrid(page);
    await searchGrid(page, 'Kimberley');
    await expect(page.getByRole('cell', { name: /Kimberley/ }).first()).toBeVisible({ timeout: 15000 });
  });

  // ADO Test Case #65741: https://dev.azure.com/boxfusion/pd-dispatcher-V2/_workitems/edit/65741
  test("TC-04: Click on 'Add New' button", async ({ page }) => {
    test.setTimeout(60_000);
    await login(page);
    await gotoGrid(page);
    await page.getByRole('button', { name: /Add New/ }).click();
    await expect(page.locator('.ant-modal-content')).toBeVisible({ timeout: 15000 });
    await expect(page.getByText('Add New Vehicle')).toBeVisible();
  });

  // ADO Test Case #65742: https://dev.azure.com/boxfusion/pd-dispatcher-V2/_workitems/edit/65742
  test('TC-05: Add new vehicle with valid data', async ({ page }) => {
    test.setTimeout(120_000);
    await login(page);
    await gotoGrid(page);
    const stamp = Date.now().toString().slice(-9);
    const reg = `QAV${stamp}`;
    const d = new Date();
    const today = `${String(d.getDate()).padStart(2, '0')}/${String(d.getMonth() + 1).padStart(2, '0')}/${d.getFullYear()}`;
    await page.getByRole('button', { name: /Add New/ }).click();
    const modal = page.locator('.ant-modal-content');
    await expect(modal).toBeVisible({ timeout: 15000 });
    // STEP: registration + odometer + date
    await formItem(modal, 'Vehicle Registration').getByRole('textbox').fill(reg);
    await formItem(modal, 'Odometer Reading').getByRole('spinbutton').fill('12345');
    const dateField = formItem(modal, 'Odometer Reading Date').locator('input').first();
    await dateField.click();
    await dateField.fill(today);
    await dateField.press('Enter');
    // STEP: required selects (real clicks, pick first available option)
    await pickFirstOption(page, modal, 'Vehicle Type');
    await pickFirstOption(page, modal, 'Driver Skill Type');
    await pickByTyping(page, modal, 'Station', 'Kimberley');
    await pickFirstOption(page, modal, 'Vehicle Status');
    // STEP: capacity
    await formItem(modal, 'Vehicle Capacity').getByRole('spinbutton').fill('4');
    // STEP: save
    await modal.getByRole('button', { name: 'OK' }).click();
    await expect(modal).toBeHidden({ timeout: 20000 });
    // STEP: search the new registration + ASSERT (BLOCKING) it is listed
    await searchGrid(page, reg);
    await expect(page.getByRole('cell', { name: reg }).first()).toBeVisible({ timeout: 20000 });
  });

  // ADO Test Case #65744: https://dev.azure.com/boxfusion/pd-dispatcher-V2/_workitems/edit/65744
  test('TC-06: View vehicle details', async ({ page }) => {
    test.setTimeout(60_000);
    await login(page);
    await gotoGrid(page);
    await page.locator(DETAILS).first().click();
    await expect(page).toHaveURL(/vehicle-details/);
    await expect(toolBtn(page, /^Edit$/)).toBeVisible({ timeout: 15000 });
  });

  // ADO Test Case #65745: https://dev.azure.com/boxfusion/pd-dispatcher-V2/_workitems/edit/65745
  test('TC-07: Return to vehicle list from details view', async ({ page }) => {
    test.setTimeout(60_000);
    await login(page);
    await gotoGrid(page);
    await page.locator(DETAILS).first().click();
    const back = detailView(page).getByRole('button', { name: 'Back' })
      .or(detailView(page).getByRole('link', { name: 'Back' }));
    await expect(back).toBeVisible({ timeout: 15000 });
    await back.click();
    await expect(page.getByRole('table')).toBeVisible({ timeout: 20000 });
  });

  // ADO Test Case #65746: https://dev.azure.com/boxfusion/pd-dispatcher-V2/_workitems/edit/65746
  test('TC-08: Edit vehicle from details view', async ({ page }) => {
    test.setTimeout(60_000);
    await login(page);
    await gotoGrid(page);
    await page.locator(DETAILS).first().click();
    await toolBtn(page, /^Edit$/).click();
    await expect(toolBtn(page, /^Save$/)).toBeVisible({ timeout: 15000 });
    await expect(toolBtn(page, /^Cancel Form Edit$/)).toBeVisible();
  });

  // ADO Test Case #65747: https://dev.azure.com/boxfusion/pd-dispatcher-V2/_workitems/edit/65747
  test('TC-09: Cancel vehicle edit', async ({ page }) => {
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

  // ADO Test Case #65748: https://dev.azure.com/boxfusion/pd-dispatcher-V2/_workitems/edit/65748
  test('TC-10: Save vehicle edit', async ({ page }) => {
    test.setTimeout(60_000);
    await login(page);
    await gotoGrid(page);
    await page.locator(DETAILS).first().click();
    await toolBtn(page, /^Edit$/).click();
    await expect(toolBtn(page, /^Save$/)).toBeVisible({ timeout: 15000 });
    // STEP: MODIFY a field — bump the Odometer Reading spinbutton
    const odo = detailView(page).getByRole('spinbutton').first();
    await odo.click();
    await odo.fill('99999');
    // STEP: CLICK Save
    await toolBtn(page, /^Save$/).click();
    // ASSERT (BLOCKING) saved — returns to view mode (Edit visible again)
    await expect(toolBtn(page, /^Edit$/)).toBeVisible({ timeout: 20000 });
  });

  // ADO Test Case #65749: https://dev.azure.com/boxfusion/pd-dispatcher-V2/_workitems/edit/65749
  test('TC-11: Edit vehicle using edit icon', async ({ page }) => {
    test.setTimeout(60_000);
    await login(page);
    await gotoGrid(page);
    await page.locator('a[href*="vehicle-details"][href*="mode=edit"]').first().click();
    await expect(page).toHaveURL(/mode=edit/);
    await expect(toolBtn(page, /^Save$/)).toBeVisible({ timeout: 15000 });
  });
});
