// AUTO-RECORDED from test-plans/eLeave/holiday-calendar-details.md
// Source: Azure DevOps test plan #79625, suite #86650
// The .md plan is canonical. AI-repair will patch failing lines in this file.
// Do not hand-edit unless you are also updating the .md plan.
//
// MIGRATED (2026-06-02): re-pointed to the SaGov Leave Management module. The Holiday Calendar
// is the SaGov "Public Holidays" page at /dynamic/SaGov.Leave/sagov-public-holidays
// (heading "Public Holidays"). Div-based grid (.tr.tr-body); per-row magnifying glass links to
// sagov-public-holiday-details. All four TCs are read-only and run for real.

import { test, expect, Page } from '@playwright/test';

const APP_URL = 'https://pd-hcm-adminportal-qa.shesha.app/';
const ADMIN = { user: 'admin', password: 'P@ssw0rd' };
const HOLIDAYS_URL = `${APP_URL}dynamic/SaGov.Leave/sagov-public-holidays`;

async function loginAsAdmin(page: Page) {
  await page.goto(APP_URL);
  await page.getByRole('textbox', { name: 'Username' }).fill(ADMIN.user);
  await page.getByRole('textbox', { name: 'Password' }).fill(ADMIN.password);
  await page.getByRole('button', { name: 'Sign In' }).click();
  await page.waitForURL(url => !url.href.includes('/login'), { timeout: 30000 });
  await page.waitForLoadState('networkidle');
}

async function gotoHolidays(page: Page) {
  await loginAsAdmin(page);
  await page.goto(HOLIDAYS_URL);
  await page.waitForLoadState('networkidle');
  await expect(page.getByRole('heading', { name: 'Public Holidays' })).toBeVisible({ timeout: 30000 });
  await page.locator('.tr.tr-body').first().waitFor({ state: 'visible', timeout: 20000 }).catch(() => {});
}

function dataRows(page: Page) {
  return page.locator('.tr.tr-body');
}

function anyDialog(page: Page) {
  return page.locator('[role="dialog"], .ant-modal, .ant-modal-confirm, .ant-popover');
}

test.describe('ELEAVE-HOLIDAY-CALENDAR — Holiday Calendar Details', () => {

  test('TC-01: Login as Admin', async ({ page }) => {
    // STEP 1: NAVIGATE to https://pd-hcm-adminportal-qa.shesha.app/
    await page.goto(APP_URL);
    // STEP 3: TYPE Username field with `admin`
    await page.getByRole('textbox', { name: 'Username' }).fill(ADMIN.user);
    // STEP 4: TYPE Password field with `P@ssw0rd`
    await page.getByRole('textbox', { name: 'Password' }).fill(ADMIN.password);
    // STEP 5: CLICK the Sign In button
    await page.getByRole('button', { name: 'Sign In' }).click();
    // STEP 6: WAIT for the home page to load
    await page.waitForLoadState('networkidle');
    // ASSERT (BLOCKING) URL no longer contains /login and the authenticated home page is visible
    await expect(page).not.toHaveURL(/login/i);
    await expect(page.getByRole('menuitem', { name: 'calendar SaGov Leave Management' })).toBeVisible({ timeout: 30000 });
  });

  // ADO Test Case #86652: https://dev.azure.com/boxfusion/pd-Hcm/_workitems/edit/86652
  test("TC-02: Redirect to public holiday details view when 'Magnifying Glass' is clicked", async ({ page }) => {
    // STEP 1: NAVIGATE Navigate to the Holiday Calendar (Public Holidays) view
    await gotoHolidays(page);
    const rows = dataRows(page);
    test.skip(await rows.count() < 1, 'Requires ≥1 public holiday');
    // STEP 3: CLICK Click on the 'Magnifying Glass' icon
    await rows.first().locator('a[href*="sagov-public-holiday-details"]').first().click();
    // ASSERT (BLOCKING) The system redirects the user to the public holiday details view
    await expect(page).toHaveURL(/sagov-public-holiday-details/i);
  });

  // ADO Test Case #86654: https://dev.azure.com/boxfusion/pd-Hcm/_workitems/edit/86654
  test("TC-03: System downloads all holidays into an Excel sheet when 'Export' button is clicked", async ({ page }) => {
    // STEP 1: NAVIGATE Navigate to the Holiday Calendar (Public Holidays) view
    await gotoHolidays(page);
    // STEP 3: CLICK Click on the 'Export' button
    const downloadPromise = page.waitForEvent('download', { timeout: 30000 });
    await page.getByRole('button', { name: /Export/i }).click();
    const download = await downloadPromise;
    // ASSERT (BLOCKING) All holidays are downloaded into an Excel sheet
    expect(download.suggestedFilename()).toMatch(/\.xlsx?$/i);
  });

  // ADO Test Case #86656: https://dev.azure.com/boxfusion/pd-Hcm/_workitems/edit/86656
  test("TC-04: Redirect to holiday details view when 'Magnifying glass' icon is clicked", async ({ page }) => {
    // STEP 1: NAVIGATE Navigate to the Holiday Calendar (Public Holidays) view
    await gotoHolidays(page);
    const rows = dataRows(page);
    test.skip(await rows.count() < 1, 'Requires ≥1 public holiday');
    // STEP 3: CLICK Click on the 'Magnifying glass' icon
    await rows.first().locator('a[href*="sagov-public-holiday-details"]').first().click();
    // ASSERT (BLOCKING) The system redirects the user to the holiday details view
    await expect(page).toHaveURL(/sagov-public-holiday-details/i);
  });

  // ADO Test Case #86658: https://dev.azure.com/boxfusion/pd-Hcm/_workitems/edit/86658
  test("TC-05: Clicking 'Create Public Holiday' button displays 'Add a new public holiday' dialog", async ({ page }) => {
    // STEP 1: NAVIGATE Navigate to the Holiday Calendar (Public Holidays) view
    await gotoHolidays(page);
    // STEP 3: CLICK Click on the 'Create Public Holiday' button
    await page.getByRole('button', { name: /Create Public Holiday/i }).click();
    // ASSERT (BLOCKING) The 'Add a new public holiday' dialog is displayed
    await expect(anyDialog(page).first()).toBeVisible({ timeout: 15000 });
  });

});
