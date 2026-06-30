// AUTO-RECORDED from test-plans/administrative-functions/points-of-interest.md
// Source: Azure DevOps test plan #65099, suite #65145 (2.9 Points of Interest)
// The .md plan is canonical. AI-repair will patch failing lines in this file.
//
// Selectors recorded live against NC Dispatch QA on 2026-06-25. Points of Interest is a form-dialog
// grid: rows expose magnifying-glass + edit-pencil links (both /emergency-site-details?id=…; edit
// adds &mode=edit). Details/edit actions are .sha-toolbar-btn (Back/Edit/Save/Cancel Form Edit) in
// #modalContainerId. Edit form: Name* (free text, pre-populated), Point Of Interest Type*, Site Type*,
// Region*, Specialities* (all selects pre-populated), Marker Url, Contact Number*. Name is the field
// tweaked for save/cancel cases.

import { test, expect, Page, Locator } from '@playwright/test';

const BASE = 'https://ncdoh-dispatcher-adminportal-qa.shesha.app';
const APP_URL = `${BASE}/login`;
const GRID = `${BASE}/dynamic/Boxfusion.Ems/emergency-site`;
const ADMIN = { user: 'Admin', password: '123qwe' };
const DETAILS = 'a[href*="emergency-site-details"]:not([href*="mode=edit"])';
const ROW_EDIT = 'a[href*="emergency-site-details"][href*="mode=edit"]';

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
  // POI grid rows load asynchronously — wait for detail links before clicking them.
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
// Name — free-text field on the POI edit form, pre-populated, no uniqueness/format constraint.
function nameField(page: Page): Locator {
  return detailView(page).locator('.ant-form-item').filter({ hasText: 'Name' }).getByRole('textbox').first();
}

test.describe('ADMIN-2.9 — Points of Interest', () => {

  test('TC-01: Log in to NC Dispatch', async ({ page }) => {
    await login(page);
    await expect(page).not.toHaveURL(/\/login/i);
  });

  // ADO Test Case #65822: https://dev.azure.com/boxfusion/pd-dispatcher-V2/_workitems/edit/65822
  test('TC-02: Search POI by any detail', async ({ page }) => {
    test.setTimeout(60_000);
    await login(page);
    await gotoGrid(page);
    await expect(page.getByRole('table')).toBeVisible();
    await searchGrid(page, 'Public');
    await expect(page.getByRole('cell', { name: /Public/ }).first()).toBeVisible({ timeout: 15000 });
  });

  // ADO Test Case #65823: https://dev.azure.com/boxfusion/pd-dispatcher-V2/_workitems/edit/65823
  test('TC-03: Add new POI (open dialog)', async ({ page }) => {
    test.setTimeout(60_000);
    await login(page);
    await gotoGrid(page);
    await page.getByRole('button', { name: /Add New/ }).click();
    await expect(page.locator('.ant-modal-content')).toBeVisible({ timeout: 15000 });
    await expect(page.getByText('Add New Point of Interest')).toBeVisible();
  });

  // ADO Test Case #65824: https://dev.azure.com/boxfusion/pd-dispatcher-V2/_workitems/edit/65824
  test('TC-04: Export POIs', async ({ page }) => {
    test.setTimeout(60_000);
    await login(page);
    await gotoGrid(page);
    const [download] = await Promise.all([
      page.waitForEvent('download', { timeout: 20000 }),
      page.getByRole('button', { name: /Export/ }).click(),
    ]);
    expect(download.suggestedFilename()).toBeTruthy();
  });

  // ADO Test Case #65825: https://dev.azure.com/boxfusion/pd-dispatcher-V2/_workitems/edit/65825
  test('TC-05: View POI details', async ({ page }) => {
    test.setTimeout(60_000);
    await login(page);
    await gotoGrid(page);
    await page.locator(DETAILS).first().click();
    await expect(page).toHaveURL(/emergency-site-details/);
    await expect(toolBtn(page, /^Edit$/)).toBeVisible({ timeout: 15000 });
  });

  // ADO Test Case #65826: https://dev.azure.com/boxfusion/pd-dispatcher-V2/_workitems/edit/65826
  test('TC-06: Navigate back from details', async ({ page }) => {
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

  // ADO Test Case #65827: https://dev.azure.com/boxfusion/pd-dispatcher-V2/_workitems/edit/65827
  test('TC-07: Edit POI from details view', async ({ page }) => {
    test.setTimeout(60_000);
    await login(page);
    await gotoGrid(page);
    await page.locator(DETAILS).first().click();
    await toolBtn(page, /^Edit$/).click();
    await expect(toolBtn(page, /^Save$/)).toBeVisible({ timeout: 15000 });
    await expect(toolBtn(page, /^Cancel Form Edit$/)).toBeVisible();
  });

  // ADO Test Case #65828: https://dev.azure.com/boxfusion/pd-dispatcher-V2/_workitems/edit/65828
  test('TC-08: Cancel edit in details view', async ({ page }) => {
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

  // ADO Test Case #65829: https://dev.azure.com/boxfusion/pd-dispatcher-V2/_workitems/edit/65829
  test('TC-09: Save edit in details view', async ({ page }) => {
    test.setTimeout(60_000);
    await login(page);
    await gotoGrid(page);
    await page.locator(DETAILS).first().click();
    await toolBtn(page, /^Edit$/).click();
    await expect(toolBtn(page, /^Save$/)).toBeVisible({ timeout: 15000 });
    // STEP: MODIFY the Name field
    const name = nameField(page);
    await name.click();
    await name.press('End');
    await name.pressSequentially(' x');
    // STEP: CLICK Save
    await toolBtn(page, /^Save$/).click();
    // ASSERT (BLOCKING) saved — returns to view mode (Edit visible again)
    await expect(toolBtn(page, /^Edit$/)).toBeVisible({ timeout: 20000 });
  });

  // ADO Test Case #65830: https://dev.azure.com/boxfusion/pd-dispatcher-V2/_workitems/edit/65830
  test('TC-10: Edit POI from index', async ({ page }) => {
    test.setTimeout(60_000);
    await login(page);
    await gotoGrid(page);
    await page.locator(ROW_EDIT).first().click();
    await expect(page).toHaveURL(/mode=edit/);
    await expect(toolBtn(page, /^Save$/)).toBeVisible({ timeout: 15000 });
  });

  // ADO Test Case #65831: https://dev.azure.com/boxfusion/pd-dispatcher-V2/_workitems/edit/65831
  test('TC-11: Save edit from index edit view', async ({ page }) => {
    test.setTimeout(60_000);
    await login(page);
    await gotoGrid(page);
    await page.locator(ROW_EDIT).first().click();
    await expect(toolBtn(page, /^Save$/)).toBeVisible({ timeout: 15000 });
    // STEP: MODIFY the Name field then Save
    const name = nameField(page);
    await name.click();
    await name.press('End');
    await name.pressSequentially(' x');
    await toolBtn(page, /^Save$/).click();
    await expect(toolBtn(page, /^Edit$/)).toBeVisible({ timeout: 20000 });
  });

  // ADO Test Case #65832: https://dev.azure.com/boxfusion/pd-dispatcher-V2/_workitems/edit/65832
  test('TC-12: Cancel edit from index edit view', async ({ page }) => {
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
