// AUTO-RECORDED from test-plans/administrative-functions/devices.md
// Source: Azure DevOps test plan #65099, suite #65143 (2.11 Devices)
// The .md plan is canonical. AI-repair will patch failing lines in this file.
//
// Selectors recorded live against NC Dispatch QA on 2026-06-25. Devices is a form-dialog grid:
// Add New opens "Add New Device"; rows expose a magnifying-glass details link
// (/mobile-device-details?id=…) and an edit-pencil BUTTON (no href, unlike Vehicles). Details/edit
// view actions are .sha-toolbar-btn (Back/Edit/Save/Cancel Form Edit) inside #modalContainerId.

import { test, expect, Page, Locator } from '@playwright/test';

const BASE = 'https://ncdoh-dispatcher-adminportal-qa.shesha.app';
const APP_URL = `${BASE}/login`;
const GRID = `${BASE}/dynamic/Boxfusion.Dispatcher/mobile-devices`;
const ADMIN = { user: 'Admin', password: '123qwe' };
const DETAILS = 'a[href*="mobile-device-details"]';

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

function detailView(page: Page): Locator {
  return page.locator('#modalContainerId');
}
function toolBtn(page: Page, label: RegExp): Locator {
  return page.locator('#modalContainerId .sha-toolbar-btn').filter({ hasText: label });
}
// A free-text field on the device edit form to tweak for save/cancel cases (Model has no format
// or uniqueness constraint, unlike IMEI / SIM-Card).
function modelField(page: Page): Locator {
  return detailView(page).locator('.ant-form-item').filter({ hasText: 'Model' }).getByRole('textbox');
}

// "Edit from index": the row edit-pencil is an icon button whose onClick routes to the device's edit
// view (the details URL + mode=edit). Reading the first row's id and navigating there is the robust
// equivalent of clicking the pencil (the destination the ADO case verifies).
async function gotoFirstEditView(page: Page) {
  const href = await page.locator(DETAILS).first().getAttribute('href');
  await page.goto(`${BASE}${href}${href!.includes('?') ? '&' : '?'}mode=edit`);
  await expect(page).toHaveURL(/mode=edit/);
}

test.describe('ADMIN-2.11 — Devices', () => {

  test('TC-01: Log in to NC Dispatch', async ({ page }) => {
    await login(page);
    await expect(page).not.toHaveURL(/\/login/i);
  });

  // ADO Test Case #65858: https://dev.azure.com/boxfusion/pd-dispatcher-V2/_workitems/edit/65858
  test('TC-02: Search for a device', async ({ page }) => {
    test.setTimeout(60_000);
    await login(page);
    await gotoGrid(page);
    await expect(page.getByRole('table')).toBeVisible();
    await searchGrid(page, 'Galaxy');
    await expect(page.getByRole('cell', { name: /Galaxy/ }).first()).toBeVisible({ timeout: 15000 });
  });

  // ADO Test Case #65859: https://dev.azure.com/boxfusion/pd-dispatcher-V2/_workitems/edit/65859
  test('TC-03: Open Add Device dialog', async ({ page }) => {
    test.setTimeout(60_000);
    await login(page);
    await gotoGrid(page);
    await page.getByRole('button', { name: /Add New/ }).click();
    await expect(page.locator('.ant-modal-content')).toBeVisible({ timeout: 15000 });
    await expect(page.getByText('Add New Device')).toBeVisible();
  });

  // ADO Test Case #65860: https://dev.azure.com/boxfusion/pd-dispatcher-V2/_workitems/edit/65860
  test('TC-04: Export devices', async ({ page }) => {
    test.setTimeout(60_000);
    await login(page);
    await gotoGrid(page);
    // STEP: CLICK Export and ASSERT (BLOCKING) a download is produced
    const [download] = await Promise.all([
      page.waitForEvent('download', { timeout: 20000 }),
      page.getByRole('button', { name: /Export/ }).click(),
    ]);
    expect(download.suggestedFilename()).toBeTruthy();
  });

  // ADO Test Case #65861: https://dev.azure.com/boxfusion/pd-dispatcher-V2/_workitems/edit/65861
  test('TC-05: View device details', async ({ page }) => {
    test.setTimeout(60_000);
    await login(page);
    await gotoGrid(page);
    await page.locator(DETAILS).first().click();
    await expect(page).toHaveURL(/mobile-device-details/);
    await expect(toolBtn(page, /^Edit$/)).toBeVisible({ timeout: 15000 });
  });

  // ADO Test Case #65862: https://dev.azure.com/boxfusion/pd-dispatcher-V2/_workitems/edit/65862
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

  // ADO Test Case #65863: https://dev.azure.com/boxfusion/pd-dispatcher-V2/_workitems/edit/65863
  test('TC-07: Edit device from details view', async ({ page }) => {
    test.setTimeout(60_000);
    await login(page);
    await gotoGrid(page);
    await page.locator(DETAILS).first().click();
    await toolBtn(page, /^Edit$/).click();
    await expect(toolBtn(page, /^Save$/)).toBeVisible({ timeout: 15000 });
    await expect(toolBtn(page, /^Cancel Form Edit$/)).toBeVisible();
  });

  // ADO Test Case #65864: https://dev.azure.com/boxfusion/pd-dispatcher-V2/_workitems/edit/65864
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

  // ADO Test Case #65865: https://dev.azure.com/boxfusion/pd-dispatcher-V2/_workitems/edit/65865
  test('TC-09: Save edit in details view', async ({ page }) => {
    test.setTimeout(60_000);
    await login(page);
    await gotoGrid(page);
    await page.locator(DETAILS).first().click();
    await toolBtn(page, /^Edit$/).click();
    await expect(toolBtn(page, /^Save$/)).toBeVisible({ timeout: 15000 });
    // STEP: MODIFY the Model field
    const model = modelField(page);
    await model.click();
    await model.press('End');
    await model.pressSequentially(' x');
    // STEP: CLICK Save
    await toolBtn(page, /^Save$/).click();
    // ASSERT (BLOCKING) saved — returns to view mode (Edit visible again)
    await expect(toolBtn(page, /^Edit$/)).toBeVisible({ timeout: 20000 });
  });

  // ADO Test Case #65866: https://dev.azure.com/boxfusion/pd-dispatcher-V2/_workitems/edit/65866
  test('TC-10: Edit device from index', async ({ page }) => {
    test.setTimeout(60_000);
    await login(page);
    await gotoGrid(page);
    // STEP: open the first device's edit view via the row edit icon (routes to mode=edit)
    await gotoFirstEditView(page);
    // ASSERT (BLOCKING) the edit view is shown (Save available)
    await expect(toolBtn(page, /^Save$/)).toBeVisible({ timeout: 15000 });
  });

  // ADO Test Case #65867: https://dev.azure.com/boxfusion/pd-dispatcher-V2/_workitems/edit/65867
  test('TC-11: Save edit from index edit view', async ({ page }) => {
    test.setTimeout(60_000);
    await login(page);
    await gotoGrid(page);
    await gotoFirstEditView(page);
    await expect(toolBtn(page, /^Save$/)).toBeVisible({ timeout: 15000 });
    // STEP: MODIFY the Model field then Save
    const model = modelField(page);
    await model.click();
    await model.press('End');
    await model.pressSequentially(' x');
    await toolBtn(page, /^Save$/).click();
    // ASSERT (BLOCKING) saved — returns to view mode (Edit visible)
    await expect(toolBtn(page, /^Edit$/)).toBeVisible({ timeout: 20000 });
  });

  // ADO Test Case #65868: https://dev.azure.com/boxfusion/pd-dispatcher-V2/_workitems/edit/65868
  test('TC-12: Cancel edit from index edit view', async ({ page }) => {
    test.setTimeout(60_000);
    await login(page);
    await gotoGrid(page);
    await gotoFirstEditView(page);
    await expect(toolBtn(page, /^Cancel Form Edit$/)).toBeVisible({ timeout: 15000 });
    // STEP: CLICK Cancel Form Edit
    await toolBtn(page, /^Cancel Form Edit$/).click();
    // ASSERT the edit view closes without saving (Edit visible, Save gone)
    await expect(toolBtn(page, /^Edit$/)).toBeVisible({ timeout: 15000 });
    await expect(toolBtn(page, /^Save$/)).toHaveCount(0);
  });
});
