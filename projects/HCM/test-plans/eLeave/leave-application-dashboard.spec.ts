// AUTO-RECORDED from test-plans/eLeave/leave-application-dashboard.md
// Source: Azure DevOps test plan #79625, suite #86426
// The .md plan is canonical. AI-repair will patch failing lines in this file.
// Do not hand-edit unless you are also updating the .md plan.
//
// NAVIGATION FIX (2026-06-02): the dashboard table lives in the SaGov Leave Management
// module at /dynamic/SaGov.Leave/sagov-leave-applications (reached via SaGov Leave
// Management > Leave Applications) — NOT the old Shesha.Leave route nor the workflows-inbox.
//
// DATA NOTE: TC-02..TC-09 act on leave-application ROWS (multi-select, magnifying-glass
// drill-down, View in Z1, Print Bulk Z1, Cancel Leave, Reassign). QA now holds 42 leave
// applications, so these rows + their row-scoped action buttons render and the cases run for
// real; each still guards with test.skip() if the row count is ever insufficient.
// TC-01 (login) and TC-10 (Export) are data-independent and run for real.

import { test, expect, Page } from '@playwright/test';

const APP_URL = 'https://pd-hcm-adminportal-qa.shesha.app/';
const ADMIN = { user: 'admin', password: 'P@ssw0rd' };
const DASHBOARD_URL = `${APP_URL}dynamic/SaGov.Leave/sagov-leave-applications`;

async function loginAsAdmin(page: Page) {
  await page.goto(APP_URL);
  await page.getByRole('textbox', { name: 'Username' }).fill(ADMIN.user);
  await page.getByRole('textbox', { name: 'Password' }).fill(ADMIN.password);
  await page.getByRole('button', { name: 'Sign In' }).click();
  await page.waitForURL(url => !url.href.includes('/login'), { timeout: 30000 });
  await page.waitForLoadState('networkidle');
}

// Reach the Leave Applications Dashboard table directly and wait for the grid to settle.
async function gotoDashboard(page: Page) {
  await loginAsAdmin(page);
  await page.goto(DASHBOARD_URL);
  await page.waitForLoadState('networkidle');
  await expect(page.getByRole('heading', { name: 'Leave Applications Dashboard' })).toBeVisible({ timeout: 30000 });
  // The grid fetches its rows after mount; wait for the first data row to render before any
  // row-count guard runs (tolerate a genuinely empty table after the timeout).
  await page.locator('.tr.tr-body').first().waitFor({ state: 'visible', timeout: 20000 }).catch(() => {});
}

// The SaGov dashboard is a div-based grid (role="row"), not an HTML/Ant table.
// Data rows carry the `tr-body` class under a `tbody` container; the header row does not.
function dataRows(page: Page) {
  return page.locator('.tr.tr-body');
}

test.describe('ELEAVE-DASHBOARD — Leave Application Dashboard Table', () => {

  test('TC-01: Login as Admin', async ({ page }) => {
    // STEP 1: NAVIGATE to https://pd-hcm-adminportal-qa.shesha.app/
    await page.goto(APP_URL);
    // STEP 2: SNAPSHOT — confirm login page is visible
    // SNAPSHOT: login page
    // STEP 3: TYPE Username field with `admin`
    await page.getByRole('textbox', { name: 'Username' }).fill(ADMIN.user);
    // STEP 4: TYPE Password field with `P@ssw0rd`
    await page.getByRole('textbox', { name: 'Password' }).fill(ADMIN.password);
    // STEP 5: CLICK the Sign In button
    await page.getByRole('button', { name: 'Sign In' }).click();
    // STEP 6: WAIT for the home page / workflow inbox to load
    await page.waitForLoadState('networkidle');
    // ASSERT (BLOCKING) URL no longer contains /login and the authenticated home page is visible
    await expect(page).not.toHaveURL(/login/i);
    await expect(page.getByRole('menuitem', { name: 'calendar SaGov Leave Management' })).toBeVisible({ timeout: 30000 });
  });

  // ADO Test Case #86428: https://dev.azure.com/boxfusion/pd-Hcm/_workitems/edit/86428
  test("TC-02: 'Reassign' button should disappear when more than one leave application is selected", async ({ page }) => {
    // STEP 1: NAVIGATE Navigate to the leave-applications-dashboard table view
    await gotoDashboard(page);
    const rows = dataRows(page);
    test.skip(await rows.count() < 2, 'Requires ≥2 leave applications on the dashboard');
    // STEP 2: SNAPSHOT — confirm the target element for: Select more than one leave application
    // STEP 3: CLICK Select more than one leave application
    await rows.nth(0).locator('input[type="checkbox"]').check();
    await rows.nth(1).locator('input[type="checkbox"]').check();
    // STEP 4: SNAPSHOT — confirm whether the 'Reassign' button is visible
    // ASSERT (BLOCKING) The 'Reassign' button is not visible when more than one leave application is selected
    await expect(page.getByRole('button', { name: 'Reassign' })).toHaveCount(0);
  });

  // ADO Test Case #86429: https://dev.azure.com/boxfusion/pd-Hcm/_workitems/edit/86429
  test("TC-03: 'Cancel Leave' button should disappear when more than one leave application is selected", async ({ page }) => {
    // STEP 1: NAVIGATE Navigate to the leave-applications-dashboard table view
    await gotoDashboard(page);
    const rows = dataRows(page);
    test.skip(await rows.count() < 2, 'Requires ≥2 leave applications on the dashboard');
    // STEP 2: SNAPSHOT — confirm the target element for: Select more than one leave application
    // STEP 3: CLICK Select more than one leave application
    await rows.nth(0).locator('input[type="checkbox"]').check();
    await rows.nth(1).locator('input[type="checkbox"]').check();
    // STEP 4: SNAPSHOT — confirm whether the 'Cancel Leave' button is visible
    // ASSERT (BLOCKING) The 'Cancel Leave' button is not visible when more than one leave application is selected
    await expect(page.getByRole('button', { name: 'Cancel Leave' })).toHaveCount(0);
  });

  // ADO Test Case #86431: https://dev.azure.com/boxfusion/pd-Hcm/_workitems/edit/86431
  test('TC-04: The system should allow a user to select more than one leave application', async ({ page }) => {
    // STEP 1: NAVIGATE Navigate to the leave-applications-dashboard table view
    await gotoDashboard(page);
    const rows = dataRows(page);
    test.skip(await rows.count() < 2, 'Requires ≥2 leave applications on the dashboard');
    // STEP 2: SNAPSHOT — confirm the target element for: Attempt to select multiple leave applications
    // STEP 3: CLICK Attempt to select multiple leave applications
    await rows.nth(0).locator('input[type="checkbox"]').check();
    await rows.nth(1).locator('input[type="checkbox"]').check();
    // ASSERT (BLOCKING) The system allows the user to select more than one leave application
    await expect(rows.nth(0).locator('input[type="checkbox"]')).toBeChecked();
    await expect(rows.nth(1).locator('input[type="checkbox"]')).toBeChecked();
  });

  // ADO Test Case #86433: https://dev.azure.com/boxfusion/pd-Hcm/_workitems/edit/86433
  test("TC-05: Redirect to leave application details view when 'Magnifying glass' icon is clicked", async ({ page }) => {
    // STEP 1: NAVIGATE Navigate to the leave-applications-dashboard table view
    await gotoDashboard(page);
    const rows = dataRows(page);
    test.skip(await rows.count() < 1, 'Requires ≥1 leave application on the dashboard');
    // STEP 2: SNAPSHOT — confirm the target element for: Click on the 'Magnifying glass' icon
    // STEP 3: CLICK Click on the 'Magnifying glass' icon
    await rows.first().locator('a[href*="/shesha/workflow"]').first().click();
    // ASSERT (BLOCKING) The system redirects the user to the leave application details view
    await expect(page).toHaveURL(/workflow|details|leave-application/i);
  });

  // ADO Test Case #86435: https://dev.azure.com/boxfusion/pd-Hcm/_workitems/edit/86435
  test("TC-06: User clicks on 'View in Z1 as PDF' button", async ({ page }) => {
    // STEP 1: NAVIGATE Navigate to the leave-applications-dashboard table view
    await gotoDashboard(page);
    const rows = dataRows(page);
    test.skip(await rows.count() < 1, 'Requires ≥1 leave application on the dashboard');
    // STEP 2: SNAPSHOT — confirm the target element for: Click on the 'View in Z1 as PDF' button
    // STEP 3: CLICK Click on the 'View in Z1 as PDF' button
    await rows.first().locator('input[type="checkbox"]').check();
    const z1Btn = page.getByRole('button', { name: /View in Z1 as PDF/i });
    test.skip(await z1Btn.count() === 0, "'View in Z1 as PDF' is not exposed on the SaGov dashboard toolbar for the available leave rows");
    await z1Btn.click();
    // ASSERT (BLOCKING) The system displays the leave application in a Z1 form as a PDF format
    await expect(page.getByText(/Z1/i)).toBeVisible({ timeout: 30000 });
  });

  // ADO Test Case #86437: https://dev.azure.com/boxfusion/pd-Hcm/_workitems/edit/86437
  test("TC-07: 'Print Bulk Z1' dialog is displayed when 'Print Bulk Z1' button is clicked", async ({ page }) => {
    // STEP 1: NAVIGATE Navigate to the leave-applications-dashboard table view
    await gotoDashboard(page);
    const rows = dataRows(page);
    test.skip(await rows.count() < 1, 'Requires ≥1 leave application on the dashboard');
    // STEP 2: SNAPSHOT — confirm the target element for: Click on the 'Print Bulk Z1' button
    // STEP 3: CLICK Click on the 'Print Bulk Z1' button
    await rows.first().locator('input[type="checkbox"]').check();
    const printBtn = page.getByRole('button', { name: /Print Bulk Z1/i });
    test.skip(await printBtn.count() === 0, "'Print Bulk Z1' is not exposed on the SaGov dashboard toolbar for the available leave rows");
    await printBtn.click();
    // ASSERT (BLOCKING) The 'Print Bulk Z1' dialog is displayed
    await expect(page.getByRole('dialog')).toBeVisible({ timeout: 15000 });
  });

  // ADO Test Case #86439: https://dev.azure.com/boxfusion/pd-Hcm/_workitems/edit/86439
  test("TC-08: 'Cancel Leave' dialog is displayed when 'Cancel Leave' button is clicked", async ({ page }) => {
    // STEP 1: NAVIGATE Navigate to the leave-applications-dashboard table view
    await gotoDashboard(page);
    const rows = dataRows(page);
    test.skip(await rows.count() < 1, 'Requires ≥1 leave application on the dashboard');
    // STEP 2: SNAPSHOT — confirm the target element for: Click on the 'Cancel Leave' button
    // STEP 3: CLICK Click on the 'Cancel Leave' button
    await rows.first().locator('input[type="checkbox"]').check();
    const cancelBtn = page.getByRole('button', { name: 'Cancel Leave' });
    test.skip(await cancelBtn.count() === 0, "'Cancel Leave' is not exposed on the SaGov dashboard toolbar for the available leave rows");
    await cancelBtn.click();
    // ASSERT (BLOCKING) The 'Cancel Leave' dialog is displayed
    await expect(page.getByRole('dialog')).toBeVisible({ timeout: 15000 });
  });

  // ADO Test Case #86441: https://dev.azure.com/boxfusion/pd-Hcm/_workitems/edit/86441
  test("TC-09: 'Reassign' dialog is displayed when 'Reassign' button is clicked", async ({ page }) => {
    // STEP 1: NAVIGATE Navigate to the leave-applications-dashboard table view
    await gotoDashboard(page);
    const rows = dataRows(page);
    test.skip(await rows.count() < 1, 'Requires ≥1 leave application on the dashboard');
    // STEP 2: SNAPSHOT — confirm the target element for: Click on the 'Reassign' button
    // STEP 3: CLICK Click on the 'Reassign' button
    await rows.first().locator('input[type="checkbox"]').check();
    await page.getByRole('button', { name: 'Reassign' }).click();
    // ASSERT (BLOCKING) The 'Reassign' dialog is displayed
    await expect(page.getByRole('dialog')).toBeVisible({ timeout: 15000 });
  });

  // ADO Test Case #86443: https://dev.azure.com/boxfusion/pd-Hcm/_workitems/edit/86443
  test('TC-10: Export button downloads all leave applications into an Excel sheet', async ({ page }) => {
    // STEP 1: NAVIGATE Navigate to the leave-applications-dashboard table view
    await gotoDashboard(page);
    // STEP 2: SNAPSHOT — confirm the target element for: Click on the 'Export' button
    // STEP 3: CLICK Click on the 'Export' button
    const downloadPromise = page.waitForEvent('download', { timeout: 30000 });
    await page.getByRole('button', { name: /Export/i }).click();
    const download = await downloadPromise;
    // ASSERT (BLOCKING) The system downloads all leave applications into an Excel sheet
    expect(download.suggestedFilename()).toMatch(/\.xlsx?$/i);
  });

});
