// AUTO-RECORDED from test-plans/administrative-functions/shift-assignment.md
// Source: Azure DevOps test plan #65099, suite #65138 (2.16 Shift Assignment)
// The .md plan is canonical. AI-repair will patch failing lines in this file.
//
// Selectors recorded live against NC Dispatch QA on 2026-06-25. Shift Assignment is a form-dialog
// grid: rows expose magnifying-glass + edit-pencil links (both /dispatch-shift-assignment-details?id=…;
// edit adds &mode=edit). Details/edit actions are .sha-toolbar-btn (Back/Edit/Save/Cancel Form Edit)
// in #modalContainerId. The edit form has NO free-text field — Assignment Date (date picker) + the
// selects Shift Name/Region/Station/Vehicle Reg. No/Crews/Crew Leader (all pre-populated). The save
// cases modify the Assignment Date (pick a different in-view day) so the cascading selects stay valid.

import { test, expect, Page, Locator } from '@playwright/test';

const BASE = 'https://ncdoh-dispatcher-adminportal-qa.shesha.app';
const APP_URL = `${BASE}/login`;
const GRID = `${BASE}/dynamic/Boxfusion.Dispatcher/dispatch-shift-assignment-table`;
const ADMIN = { user: 'Admin', password: '123qwe' };
const DETAILS = 'a[href*="dispatch-shift-assignment-details"]:not([href*="mode=edit"])';
const ROW_EDIT = 'a[href*="dispatch-shift-assignment-details"][href*="mode=edit"]';

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
  // Shift Assignment grid rows load asynchronously — wait for detail links before clicking them.
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
// The edit form has no free-text field. Modify the Assignment Date instead: open the picker and pick
// the first in-view day that isn't the currently-selected one. A date change leaves the cascading
// Region → Station → Vehicle → Crew selects valid, so Save succeeds.
async function modifyAssignmentDate(page: Page) {
  const picker = detailView(page).locator('.ant-form-item').filter({ hasText: 'Assignment Date' })
    .locator('.ant-picker input');
  await picker.click();
  const panel = page.locator('.ant-picker-dropdown:not(.ant-picker-dropdown-hidden)');
  await panel.waitFor({ state: 'visible', timeout: 8000 });
  await page.waitForTimeout(300);
  await panel.locator('.ant-picker-cell-in-view:not(.ant-picker-cell-selected):not(.ant-picker-cell-disabled)')
    .first().click();
  await page.waitForTimeout(300);
}

test.describe('ADMIN-2.16 — Shift Assignment', () => {

  test('TC-01: Log in to NC Dispatch', async ({ page }) => {
    await login(page);
    await expect(page).not.toHaveURL(/\/login/i);
  });

  // ADO Test Case #65929: https://dev.azure.com/boxfusion/pd-dispatcher-V2/_workitems/edit/65929
  test('TC-02: Search for a shift assignment', async ({ page }) => {
    test.setTimeout(60_000);
    await login(page);
    await gotoGrid(page);
    await expect(page.getByRole('table')).toBeVisible();
    await searchGrid(page, 'Kimberley');
    await expect(page.getByRole('cell', { name: /Kimberley/ }).first()).toBeVisible({ timeout: 15000 });
  });

  // ADO Test Case #65930: https://dev.azure.com/boxfusion/pd-dispatcher-V2/_workitems/edit/65930
  test('TC-03: Open Add Shift Assignment dialog', async ({ page }) => {
    test.setTimeout(60_000);
    await login(page);
    await gotoGrid(page);
    await page.getByRole('button', { name: /Add New/ }).click();
    await expect(page.locator('.ant-modal-content')).toBeVisible({ timeout: 15000 });
    await expect(page.getByText('Add New Shift Assignment')).toBeVisible();
  });

  // ADO Test Case #65931: https://dev.azure.com/boxfusion/pd-dispatcher-V2/_workitems/edit/65931
  test('TC-04: Export shift assignments', async ({ page }) => {
    test.setTimeout(60_000);
    await login(page);
    await gotoGrid(page);
    const [download] = await Promise.all([
      page.waitForEvent('download', { timeout: 20000 }),
      page.getByRole('button', { name: /Export/ }).click(),
    ]);
    expect(download.suggestedFilename()).toBeTruthy();
  });

  // ADO Test Case #65932: https://dev.azure.com/boxfusion/pd-dispatcher-V2/_workitems/edit/65932
  test('TC-05: View shift assignment details', async ({ page }) => {
    test.setTimeout(60_000);
    await login(page);
    await gotoGrid(page);
    await page.locator(DETAILS).first().click();
    await expect(page).toHaveURL(/dispatch-shift-assignment-details/);
    await expect(toolBtn(page, /^Edit$/)).toBeVisible({ timeout: 15000 });
  });

  // ADO Test Case #65933: https://dev.azure.com/boxfusion/pd-dispatcher-V2/_workitems/edit/65933
  test('TC-06: Edit shift assignment from details view', async ({ page }) => {
    test.setTimeout(60_000);
    await login(page);
    await gotoGrid(page);
    await page.locator(DETAILS).first().click();
    await toolBtn(page, /^Edit$/).click();
    await expect(toolBtn(page, /^Save$/)).toBeVisible({ timeout: 15000 });
    await expect(toolBtn(page, /^Cancel Form Edit$/)).toBeVisible();
  });

  // ADO Test Case #65934: https://dev.azure.com/boxfusion/pd-dispatcher-V2/_workitems/edit/65934
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

  // ADO Test Case #65935: https://dev.azure.com/boxfusion/pd-dispatcher-V2/_workitems/edit/65935
  test('TC-08: Save edit in details view', async ({ page }) => {
    test.setTimeout(60_000);
    await login(page);
    await gotoGrid(page);
    await page.locator(DETAILS).first().click();
    await toolBtn(page, /^Edit$/).click();
    await expect(toolBtn(page, /^Save$/)).toBeVisible({ timeout: 15000 });
    // STEP: MODIFY a field — change the Assignment Date (keeps cascading selects valid)
    await modifyAssignmentDate(page);
    // STEP: CLICK Save
    await toolBtn(page, /^Save$/).click();
    // ASSERT (BLOCKING) saved — returns to view mode (Edit visible again)
    await expect(toolBtn(page, /^Edit$/)).toBeVisible({ timeout: 20000 });
  });

  // ADO Test Case #65936: https://dev.azure.com/boxfusion/pd-dispatcher-V2/_workitems/edit/65936
  test('TC-09: Edit shift assignment from index', async ({ page }) => {
    test.setTimeout(60_000);
    await login(page);
    await gotoGrid(page);
    await page.locator(ROW_EDIT).first().click();
    await expect(page).toHaveURL(/mode=edit/);
    await expect(toolBtn(page, /^Save$/)).toBeVisible({ timeout: 15000 });
  });

  // ADO Test Case #65937: https://dev.azure.com/boxfusion/pd-dispatcher-V2/_workitems/edit/65937
  test('TC-10: Save edit from index edit view', async ({ page }) => {
    test.setTimeout(60_000);
    await login(page);
    await gotoGrid(page);
    await page.locator(ROW_EDIT).first().click();
    await expect(toolBtn(page, /^Save$/)).toBeVisible({ timeout: 15000 });
    // STEP: MODIFY a field — change the Assignment Date — then Save
    await modifyAssignmentDate(page);
    await toolBtn(page, /^Save$/).click();
    await expect(toolBtn(page, /^Edit$/)).toBeVisible({ timeout: 20000 });
  });

  // ADO Test Case #65938: https://dev.azure.com/boxfusion/pd-dispatcher-V2/_workitems/edit/65938
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
