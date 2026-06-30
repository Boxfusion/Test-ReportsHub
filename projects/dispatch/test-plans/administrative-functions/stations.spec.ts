// AUTO-RECORDED from test-plans/administrative-functions/stations.md
// Source: Azure DevOps test plan #65099, suite #65144 (2.10 Stations)
// The .md plan is canonical. AI-repair will patch failing lines in this file.
//
// Selectors recorded live against NC Dispatch QA on 2026-06-25. Stations is a form-dialog grid:
// rows expose magnifying-glass + edit-pencil links (both /dispatch-base-details?id=…; edit adds
// &mode=edit). Details/edit actions are .sha-toolbar-btn (Back/Edit/Save/Cancel Form Edit) in
// #modalContainerId. Edit form: Station Name* (free text, pre-populated), Region* (pre-populated),
// Contact Number, Address, Lat/Long. Station Name is the field tweaked for save/cancel cases.

import { test, expect, Page, Locator } from '@playwright/test';

const BASE = 'https://ncdoh-dispatcher-adminportal-qa.shesha.app';
const APP_URL = `${BASE}/login`;
const GRID = `${BASE}/dynamic/Boxfusion.Dispatcher/dispatch-base`;
const ADMIN = { user: 'Admin', password: '123qwe' };
const DETAILS = 'a[href*="dispatch-base-details"]:not([href*="mode=edit"])';
const ROW_EDIT = 'a[href*="dispatch-base-details"][href*="mode=edit"]';

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
  // Stations grid rows load asynchronously — wait for detail links before clicking them.
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
// Station Name — free-text field on the edit form, pre-populated, no uniqueness/format constraint.
function stationNameField(page: Page): Locator {
  return detailView(page).locator('.ant-form-item').filter({ hasText: 'Station Name' }).getByRole('textbox');
}

test.describe('ADMIN-2.10 — Stations', () => {

  test('TC-01: Log in to NC Dispatch', async ({ page }) => {
    await login(page);
    await expect(page).not.toHaveURL(/\/login/i);
  });

  // ADO Test Case #65841: https://dev.azure.com/boxfusion/pd-dispatcher-V2/_workitems/edit/65841
  test('TC-02: Display all stations', async ({ page }) => {
    test.setTimeout(60_000);
    await login(page);
    await gotoGrid(page);
    await expect(page.getByRole('table')).toBeVisible();
    await expect(page.locator(DETAILS).first()).toBeVisible({ timeout: 15000 });
  });

  // ADO Test Case #65842: https://dev.azure.com/boxfusion/pd-dispatcher-V2/_workitems/edit/65842
  test('TC-03: Search for a station', async ({ page }) => {
    test.setTimeout(60_000);
    await login(page);
    await gotoGrid(page);
    await expect(page.getByRole('table')).toBeVisible();
    await searchGrid(page, 'EMS');
    await expect(page.getByRole('cell', { name: /EMS/ }).first()).toBeVisible({ timeout: 15000 });
  });

  // ADO Test Case #65843: https://dev.azure.com/boxfusion/pd-dispatcher-V2/_workitems/edit/65843
  test('TC-04: Add new station (open dialog)', async ({ page }) => {
    test.setTimeout(60_000);
    await login(page);
    await gotoGrid(page);
    await page.getByRole('button', { name: /Add New/ }).click();
    await expect(page.locator('.ant-modal-content')).toBeVisible({ timeout: 15000 });
    await expect(page.getByText('Add New Station')).toBeVisible();
  });

  // ADO Test Case #65844: https://dev.azure.com/boxfusion/pd-dispatcher-V2/_workitems/edit/65844
  test('TC-05: Export stations', async ({ page }) => {
    test.setTimeout(60_000);
    await login(page);
    await gotoGrid(page);
    const [download] = await Promise.all([
      page.waitForEvent('download', { timeout: 20000 }),
      page.getByRole('button', { name: /Export/ }).click(),
    ]);
    expect(download.suggestedFilename()).toBeTruthy();
  });

  // ADO Test Case #65845: https://dev.azure.com/boxfusion/pd-dispatcher-V2/_workitems/edit/65845
  test('TC-06: View station details', async ({ page }) => {
    test.setTimeout(60_000);
    await login(page);
    await gotoGrid(page);
    await page.locator(DETAILS).first().click();
    await expect(page).toHaveURL(/dispatch-base-details/);
    await expect(toolBtn(page, /^Edit$/)).toBeVisible({ timeout: 15000 });
  });

  // ADO Test Case #65846: https://dev.azure.com/boxfusion/pd-dispatcher-V2/_workitems/edit/65846
  test('TC-07: Navigate back from details', async ({ page }) => {
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

  // ADO Test Case #65847: https://dev.azure.com/boxfusion/pd-dispatcher-V2/_workitems/edit/65847
  test('TC-08: Edit station from details view', async ({ page }) => {
    test.setTimeout(60_000);
    await login(page);
    await gotoGrid(page);
    await page.locator(DETAILS).first().click();
    await toolBtn(page, /^Edit$/).click();
    await expect(toolBtn(page, /^Save$/)).toBeVisible({ timeout: 15000 });
    await expect(toolBtn(page, /^Cancel Form Edit$/)).toBeVisible();
  });

  // ADO Test Case #65848: https://dev.azure.com/boxfusion/pd-dispatcher-V2/_workitems/edit/65848
  test('TC-09: Cancel edit in details view', async ({ page }) => {
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

  // ADO Test Case #65849: https://dev.azure.com/boxfusion/pd-dispatcher-V2/_workitems/edit/65849
  test('TC-10: Save edit in details view', async ({ page }) => {
    test.setTimeout(60_000);
    await login(page);
    await gotoGrid(page);
    await page.locator(DETAILS).first().click();
    await toolBtn(page, /^Edit$/).click();
    await expect(toolBtn(page, /^Save$/)).toBeVisible({ timeout: 15000 });
    // STEP: MODIFY the Station Name field
    const name = stationNameField(page);
    await name.click();
    await name.press('End');
    await name.pressSequentially(' x');
    // STEP: CLICK Save
    await toolBtn(page, /^Save$/).click();
    // ASSERT (BLOCKING) saved — returns to view mode (Edit visible again)
    await expect(toolBtn(page, /^Edit$/)).toBeVisible({ timeout: 20000 });
  });

  // ADO Test Case #65850: https://dev.azure.com/boxfusion/pd-dispatcher-V2/_workitems/edit/65850
  test('TC-11: Edit station from index', async ({ page }) => {
    test.setTimeout(60_000);
    await login(page);
    await gotoGrid(page);
    await page.locator(ROW_EDIT).first().click();
    await expect(page).toHaveURL(/mode=edit/);
    await expect(toolBtn(page, /^Save$/)).toBeVisible({ timeout: 15000 });
  });

  // ADO Test Case #65851: https://dev.azure.com/boxfusion/pd-dispatcher-V2/_workitems/edit/65851
  test('TC-12: Save edit from index edit view', async ({ page }) => {
    test.setTimeout(60_000);
    await login(page);
    await gotoGrid(page);
    await page.locator(ROW_EDIT).first().click();
    await expect(toolBtn(page, /^Save$/)).toBeVisible({ timeout: 15000 });
    // STEP: MODIFY the Station Name field then Save
    const name = stationNameField(page);
    await name.click();
    await name.press('End');
    await name.pressSequentially(' x');
    await toolBtn(page, /^Save$/).click();
    await expect(toolBtn(page, /^Edit$/)).toBeVisible({ timeout: 20000 });
  });

  // ADO Test Case #65852: https://dev.azure.com/boxfusion/pd-dispatcher-V2/_workitems/edit/65852
  test('TC-13: Cancel edit from index edit view', async ({ page }) => {
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
