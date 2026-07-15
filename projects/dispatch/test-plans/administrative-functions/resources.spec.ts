// AUTO-RECORDED from test-plans/administrative-functions/resources.md
// Source: Azure DevOps test plan #65099, suite #65142 (2.12 Resources)
// The .md plan is canonical. AI-repair will patch failing lines in this file.
//
// Selectors recorded live against NC Dispatch QA on 2026-06-25. Resources is a form-dialog grid:
// rows expose magnifying-glass + edit-pencil links (both /resource-details?id=…; edit adds &mode=edit).
// Details/edit actions are .sha-toolbar-btn (Back/Edit/Save/Cancel Form Edit) in #modalContainerId.
// The details view has a "User Facial Photos" panel: Upload → file chooser → "Edit image" crop modal → OK.

import { test, expect, Page, Locator } from '@playwright/test';
import * as path from 'path';

const BASE = 'https://ncdoh-dispatcher-adminportal-qa.shesha.app';
const APP_URL = `${BASE}/login`;
const GRID = `${BASE}/dynamic/Boxfusion.Ems/resources`;
const ADMIN = { user: 'Admin', password: '123qwe' };
const DETAILS = 'a[href*="resource-details"]:not([href*="mode=edit"])';
const ROW_EDIT = 'a[href*="resource-details"][href*="mode=edit"]';
const FACE_IMG = path.join(__dirname, '..', '..', '..', '..', 'test-data', 'qa-face.png');

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
  // Resources grid rows load asynchronously (~5-8s) — wait for detail links before clicking them.
  await expect(page.locator('a[href*="resource-details"]').first()).toBeVisible({ timeout: 30000 });
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
// Surname — free-text field on the resource edit form, no uniqueness/format constraint.
function surnameField(page: Page): Locator {
  return detailView(page).locator('.ant-form-item').filter({ hasText: 'Surname' }).getByRole('textbox');
}

test.describe('ADMIN-2.12 — Resources', () => {

  test('TC-01: Log in to NC Dispatch', async ({ page }) => {
    await login(page);
    await expect(page).not.toHaveURL(/\/login/i);
  });

  // ADO Test Case #66513: https://dev.azure.com/boxfusion/pd-dispatcher-V2/_workitems/edit/66513
  test('TC-02: Search for a resource', async ({ page }) => {
    test.setTimeout(60_000);
    await login(page);
    await gotoGrid(page);
    await expect(page.getByRole('table')).toBeVisible();
    await searchGrid(page, 'Paramedic');
    await expect(page.getByRole('cell', { name: /Paramedic/ }).first()).toBeVisible({ timeout: 15000 });
  });

  // ADO Test Case #66514: https://dev.azure.com/boxfusion/pd-dispatcher-V2/_workitems/edit/66514
  test('TC-03: Open Add Resource dialog', async ({ page }) => {
    test.setTimeout(60_000);
    await login(page);
    await gotoGrid(page);
    await page.getByRole('button', { name: /Add New/ }).click();
    await expect(page.locator('.ant-modal-content')).toBeVisible({ timeout: 15000 });
  });

  // ADO Test Case #66515: https://dev.azure.com/boxfusion/pd-dispatcher-V2/_workitems/edit/66515
  test('TC-04: Export resources', async ({ page }) => {
    test.setTimeout(60_000);
    await login(page);
    await gotoGrid(page);
    const [download] = await Promise.all([
      page.waitForEvent('download', { timeout: 20000 }),
      page.getByRole('button', { name: /Export/ }).click(),
    ]);
    expect(download.suggestedFilename()).toBeTruthy();
  });

  // ADO Test Case #66516: https://dev.azure.com/boxfusion/pd-dispatcher-V2/_workitems/edit/66516
  test('TC-05: View resource details', async ({ page }) => {
    test.setTimeout(60_000);
    await login(page);
    await gotoGrid(page);
    await page.locator(DETAILS).first().click();
    await expect(page).toHaveURL(/resource-details/);
    await expect(toolBtn(page, /^Edit$/)).toBeVisible({ timeout: 15000 });
  });

  // ADO Test Case #66517: https://dev.azure.com/boxfusion/pd-dispatcher-V2/_workitems/edit/66517
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

  // ADO Test Case #66518: https://dev.azure.com/boxfusion/pd-dispatcher-V2/_workitems/edit/66518
  test('TC-07: Edit resource from details view', async ({ page }) => {
    test.setTimeout(60_000);
    await login(page);
    await gotoGrid(page);
    await page.locator(DETAILS).first().click();
    await toolBtn(page, /^Edit$/).click();
    await expect(toolBtn(page, /^Save$/)).toBeVisible({ timeout: 15000 });
    await expect(toolBtn(page, /^Cancel Form Edit$/)).toBeVisible();
  });

  // ADO Test Case #66519: https://dev.azure.com/boxfusion/pd-dispatcher-V2/_workitems/edit/66519
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

  // ADO Test Case #66520: https://dev.azure.com/boxfusion/pd-dispatcher-V2/_workitems/edit/66520
  test('TC-09: Save edit in details view', async ({ page }) => {
    test.setTimeout(60_000);
    await login(page);
    await gotoGrid(page);
    await page.locator(DETAILS).first().click();
    await toolBtn(page, /^Edit$/).click();
    await expect(toolBtn(page, /^Save$/)).toBeVisible({ timeout: 15000 });
    const surname = surnameField(page);
    // Bounded toggle (not an unbounded append): appending each run eventually overflows the
    // field's server-side length limit → 500. Oscillate a ' x' suffix instead.
    const _cur = await surname.inputValue();
    await surname.fill(_cur.endsWith(' x') ? _cur.slice(0, -2) : _cur + ' x');
    await toolBtn(page, /^Save$/).click();
    await expect(toolBtn(page, /^Edit$/)).toBeVisible({ timeout: 20000 });
  });

  // ADO Test Case #66521: https://dev.azure.com/boxfusion/pd-dispatcher-V2/_workitems/edit/66521
  test('TC-10: Upload facial photo', async ({ page }) => {
    test.setTimeout(60_000);
    await login(page);
    await gotoGrid(page);
    await page.locator(DETAILS).first().click();
    await expect(page).toHaveURL(/resource-details/);
    // STEP: supply an image to the User Facial Photos AntD Upload. Its trigger is a hidden
    // (display:none in view mode) input[type=file]; set files on it directly — there is no
    // visible "Upload" button and no filechooser event fires from the collapsed upload area.
    await detailView(page).locator('input[type="file"]').first().setInputFiles(FACE_IMG);
    // STEP: the "Edit image" crop modal opens → confirm with OK
    await expect(page.getByText('Edit image')).toBeVisible({ timeout: 15000 });
    await page.locator('.ant-modal-content').filter({ hasText: 'Edit image' }).getByRole('button', { name: 'OK' }).click();
    // ASSERT (BLOCKING) the image was accepted (crop modal closes)
    await expect(page.getByText('Edit image')).toBeHidden({ timeout: 15000 });
  });

  // ADO Test Case #66522: https://dev.azure.com/boxfusion/pd-dispatcher-V2/_workitems/edit/66522
  test('TC-11: Edit resource from index', async ({ page }) => {
    test.setTimeout(60_000);
    await login(page);
    await gotoGrid(page);
    await page.locator(ROW_EDIT).first().click();
    await expect(page).toHaveURL(/mode=edit/);
    await expect(toolBtn(page, /^Save$/)).toBeVisible({ timeout: 15000 });
  });

  // ADO Test Case #66523: https://dev.azure.com/boxfusion/pd-dispatcher-V2/_workitems/edit/66523
  test('TC-12: Save edit from index edit view', async ({ page }) => {
    test.setTimeout(60_000);
    await login(page);
    await gotoGrid(page);
    await page.locator(ROW_EDIT).first().click();
    await expect(toolBtn(page, /^Save$/)).toBeVisible({ timeout: 15000 });
    const surname = surnameField(page);
    // Bounded toggle (not an unbounded append): appending each run eventually overflows the
    // field's server-side length limit → 500. Oscillate a ' x' suffix instead.
    const _cur = await surname.inputValue();
    await surname.fill(_cur.endsWith(' x') ? _cur.slice(0, -2) : _cur + ' x');
    await toolBtn(page, /^Save$/).click();
    await expect(toolBtn(page, /^Edit$/)).toBeVisible({ timeout: 20000 });
  });

  // ADO Test Case #66524: https://dev.azure.com/boxfusion/pd-dispatcher-V2/_workitems/edit/66524
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
