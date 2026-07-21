// AUTO-RECORDED from test-plans/administrative-functions/shifts.md
// Source: Azure DevOps test plan #65099, suite #65139 (2.15 Shifts)
// The .md plan is canonical. AI-repair will patch failing lines in this file.
//
// Selectors recorded live against NC Dispatch QA on 2026-06-25. Shifts is a form-dialog grid in the
// boxfusion.shiftmanagement module: rows expose magnifying-glass + edit-pencil links (both
// /shifts-details-view?id=…; edit adds &mode=edit). Details/edit actions are .sha-toolbar-btn
// (Back/Edit/Save/Cancel Form Edit) in #modalContainerId. Edit form: Shift Name* (free text,
// pre-populated), Shift Category* (select, pre-populated), Shift Start Time*, Shift End Time*.
// Shift Name is the field tweaked for save/cancel cases.

import { test, expect, Page, Locator } from '@playwright/test';

const BASE = 'https://ncdoh-dispatcher-adminportal-qa.shesha.app';
const APP_URL = `${BASE}/login`;
const GRID = `${BASE}/dynamic/boxfusion.shiftmanagement/shift-table`;
const ADMIN = { user: 'Admin', password: '123qwe' };
const DETAILS = 'a[href*="shifts-details-view"]:not([href*="mode=edit"])';
const ROW_EDIT = 'a[href*="shifts-details-view"][href*="mode=edit"]';

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
  // Shifts grid rows load asynchronously — wait for detail links before clicking them.
  await expect(page.locator(DETAILS).first()).toBeVisible({ timeout: 30000 });
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
// Shift Name — free-text field on the edit form, pre-populated, no uniqueness/format constraint.
function shiftNameField(page: Page): Locator {
  return detailView(page).locator('.ant-form-item').filter({ hasText: 'Shift Name' }).getByRole('textbox').first();
}

test.describe('ADMIN-2.15 — Shifts', () => {

  test('TC-01: Log in to NC Dispatch', async ({ page }) => {
    await login(page);
    await expect(page).not.toHaveURL(/\/login/i);
  });

  // ADO Test Case #65914: https://dev.azure.com/boxfusion/pd-dispatcher-V2/_workitems/edit/65914
  test('TC-02: Search for a shift', async ({ page }) => {
    test.setTimeout(60_000);
    await login(page);
    await gotoGrid(page);
    await expect(page.getByRole('table')).toBeVisible();
    await searchGrid(page, 'Shift');
    await expect(page.getByRole('cell', { name: /Shift/ }).first()).toBeVisible({ timeout: 15000 });
  });

  // ADO Test Case #65915: https://dev.azure.com/boxfusion/pd-dispatcher-V2/_workitems/edit/65915
  test('TC-03: Open Add Shift dialog', async ({ page }) => {
    test.setTimeout(60_000);
    await login(page);
    await gotoGrid(page);
    await page.getByRole('button', { name: /Add New/ }).click();
    await expect(page.locator('.ant-modal-content')).toBeVisible({ timeout: 15000 });
    await expect(page.getByText('Add New Shift')).toBeVisible();
  });

  // ADO Test Case #65916: https://dev.azure.com/boxfusion/pd-dispatcher-V2/_workitems/edit/65916
  test('TC-04: Export shifts', async ({ page }) => {
    test.setTimeout(60_000);
    await login(page);
    await gotoGrid(page);
    const [download] = await Promise.all([
      page.waitForEvent('download', { timeout: 20000 }),
      page.getByRole('button', { name: /Export/ }).click(),
    ]);
    expect(download.suggestedFilename()).toBeTruthy();
  });

  // ADO Test Case #65917: https://dev.azure.com/boxfusion/pd-dispatcher-V2/_workitems/edit/65917
  test('TC-05: View shift details', async ({ page }) => {
    test.setTimeout(60_000);
    await login(page);
    await gotoGrid(page);
    await page.locator(DETAILS).first().click();
    await expect(page).toHaveURL(/shifts-details-view/);
    await expect(toolBtn(page, /^Edit$/)).toBeVisible({ timeout: 15000 });
  });

  // ADO Test Case #65918: https://dev.azure.com/boxfusion/pd-dispatcher-V2/_workitems/edit/65918
  test('TC-06: Edit shift from details view', async ({ page }) => {
    test.setTimeout(60_000);
    await login(page);
    await gotoGrid(page);
    await page.locator(DETAILS).first().click();
    await toolBtn(page, /^Edit$/).click();
    await expect(toolBtn(page, /^Save$/)).toBeVisible({ timeout: 15000 });
    await expect(toolBtn(page, /^Cancel Form Edit$/)).toBeVisible();
  });

  // ADO Test Case #65919: https://dev.azure.com/boxfusion/pd-dispatcher-V2/_workitems/edit/65919
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

  // ADO Test Case #65920: https://dev.azure.com/boxfusion/pd-dispatcher-V2/_workitems/edit/65920
  test('TC-08: Save edit in details view', async ({ page }) => {
    test.setTimeout(60_000);
    await login(page);
    await gotoGrid(page);
    await page.locator(DETAILS).first().click();
    await toolBtn(page, /^Edit$/).click();
    await expect(toolBtn(page, /^Save$/)).toBeVisible({ timeout: 15000 });
    // STEP: MODIFY the Shift Name field
    const name = shiftNameField(page);
    // Bounded toggle (not an unbounded append): appending each run eventually overflows the
    // field's server-side length limit → 500. Oscillate a ' x' suffix instead.
    const _cur = await name.inputValue();
    await name.fill(_cur.endsWith(' x') ? _cur.slice(0, -2) : _cur + ' x');
    // STEP: CLICK Save
    await toolBtn(page, /^Save$/).click();
    // ASSERT (BLOCKING) saved — returns to view mode (Edit visible again)
    await expect(toolBtn(page, /^Edit$/)).toBeVisible({ timeout: 20000 });
  });

  // ADO Test Case #65921: https://dev.azure.com/boxfusion/pd-dispatcher-V2/_workitems/edit/65921
  test('TC-09: Edit shift from index', async ({ page }) => {
    test.setTimeout(60_000);
    await login(page);
    await gotoGrid(page);
    await page.locator(ROW_EDIT).first().click();
    await expect(page).toHaveURL(/mode=edit/);
    await expect(toolBtn(page, /^Save$/)).toBeVisible({ timeout: 15000 });
  });

  // ADO Test Case #65922: https://dev.azure.com/boxfusion/pd-dispatcher-V2/_workitems/edit/65922
  test('TC-10: Save edit from index edit view', async ({ page }) => {
    test.setTimeout(60_000);
    await login(page);
    await gotoGrid(page);
    await page.locator(ROW_EDIT).first().click();
    await expect(toolBtn(page, /^Save$/)).toBeVisible({ timeout: 15000 });
    // STEP: MODIFY the Shift Name field then Save
    const name = shiftNameField(page);
    // Bounded toggle (not an unbounded append): appending each run eventually overflows the
    // field's server-side length limit → 500. Oscillate a ' x' suffix instead.
    const _cur = await name.inputValue();
    await name.fill(_cur.endsWith(' x') ? _cur.slice(0, -2) : _cur + ' x');
    await toolBtn(page, /^Save$/).click();
    await expect(toolBtn(page, /^Edit$/)).toBeVisible({ timeout: 20000 });
  });

  // ADO Test Case #65923: https://dev.azure.com/boxfusion/pd-dispatcher-V2/_workitems/edit/65923
  test('TC-11: Cancel edit from index edit view', async ({ page }) => {
    test.setTimeout(60_000);
    await login(page);
    await gotoGrid(page);
    await page.locator(ROW_EDIT).first().click();
    await expect(toolBtn(page, /^Cancel Form Edit$/)).toBeVisible({ timeout: 15000 });
    await toolBtn(page, /^Cancel Form Edit$/).click();
    await expect(toolBtn(page, /^Edit$/)).toBeVisible({ timeout: 15000 });
    await expect(toolBtn(page, /^Save$/)).toHaveCount(0);
  });
});
