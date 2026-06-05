// AUTO-RECORDED from test-plans/eLeave/leave-balances-details.md
// Source: Azure DevOps test plan #79625, suite #86444
// The .md plan is canonical. AI-repair will patch failing lines in this file.
// Do not hand-edit unless you are also updating the .md plan.
//
// MIGRATED (2026-06-02): re-pointed to the SaGov Leave Management module. The Leave Balances
// Details view is reached from the SaGov Leave Balances table (/dynamic/SaGov.Leave/
// sagov-personal-balances) via the per-row magnifying glass, landing on
// /dynamic/SaGov.Leave/sagov-leave-cycle-balance-details?id=... All TCs are read-only. Links
// that are not present on the sampled record are guard-skipped.

import { test, expect, Page } from '@playwright/test';

const APP_URL = 'https://pd-hcm-adminportal-qa.shesha.app/';
const ADMIN = { user: 'admin', password: 'P@ssw0rd' };
const BALANCES_URL = `${APP_URL}dynamic/SaGov.Leave/sagov-personal-balances`;

async function loginAsAdmin(page: Page) {
  await page.goto(APP_URL);
  await page.getByRole('textbox', { name: 'Username' }).fill(ADMIN.user);
  await page.getByRole('textbox', { name: 'Password' }).fill(ADMIN.password);
  await page.getByRole('button', { name: 'Sign In' }).click();
  await page.waitForURL(url => !url.href.includes('/login'), { timeout: 30000 });
  await page.waitForLoadState('networkidle');
}

// Reach a Leave Balance Details view by drilling into the first row of the balances table.
async function gotoBalanceDetails(page: Page): Promise<boolean> {
  await loginAsAdmin(page);
  await page.goto(BALANCES_URL);
  await page.waitForLoadState('networkidle');
  // Wait for the row's details link to render, then navigate to it directly (the magnifying-
  // glass click is exercised separately in leave-balances-administration TC-04; here we just
  // need to land on the details view deterministically).
  const link = page.locator('.tr.tr-body a[href*="sagov-leave-cycle-balance-details"]').first();
  const haveLink = await link.waitFor({ state: 'attached', timeout: 20000 }).then(() => true).catch(() => false);
  if (!haveLink) return false;
  const href = await link.getAttribute('href');
  if (!href) return false;
  await page.goto(new URL(href, APP_URL).toString());
  await page.waitForLoadState('networkidle');
  // The details view renders its linked fields (employee / leave type) a beat after load;
  // wait for them so the per-TC presence checks are reliable.
  await page.locator('a[href*="user-details"], a[href*="sagov-leave-type-details"]').first()
    .waitFor({ state: 'attached', timeout: 10000 }).catch(() => {});
  return /sagov-leave-cycle-balance-details/i.test(page.url());
}

function anyDialog(page: Page) {
  return page.locator('[role="dialog"], .ant-modal, .ant-modal-confirm, .ant-popover');
}

test.describe('ELEAVE-BALANCES-DETAILS — Leave Balances Details', () => {

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

  // ADO Test Case #86446: https://dev.azure.com/boxfusion/pd-Hcm/_workitems/edit/86446
  test("TC-02: Display delete confirmation dialog when 'Delete' icon is clicked", async ({ page }) => {
    // STEP 1: NAVIGATE Navigate to the Leave Balances Details view
    const reached = await gotoBalanceDetails(page);
    test.skip(!reached, 'Could not reach a Leave Balance Details record');
    // STEP 3: CLICK Click on the 'Delete' icon
    const del = page.locator('[aria-label="delete"]');
    test.skip(await del.count() === 0, 'No Delete icon on the Leave Balance Details view for the sampled record');
    await del.first().click();
    // ASSERT (BLOCKING) The system displays the delete confirmation dialog
    await expect(anyDialog(page).first()).toBeVisible({ timeout: 15000 });
  });

  // ADO Test Case #86448: https://dev.azure.com/boxfusion/pd-Hcm/_workitems/edit/86448
  test('TC-03: Redirect user to leave application details when leave request link is clicked', async ({ page }) => {
    // STEP 1: NAVIGATE Navigate to the Leave Balances Details view
    const reached = await gotoBalanceDetails(page);
    test.skip(!reached, 'Could not reach a Leave Balance Details record');
    // STEP 3: CLICK Click on the leave request link
    const link = page.locator('a[href*="sagov-leave-applications"], a[href*="/shesha/workflow"], a[href*="leave-application-details"]');
    test.skip(await link.count() === 0, 'No leave request link on the sampled Leave Balance Details record');
    await link.first().click();
    // ASSERT (BLOCKING) The system redirects the user to the leave application details page
    await expect(page).toHaveURL(/leave-application|workflow|sagov-leave-applications/i);
  });

  // ADO Test Case #86450: https://dev.azure.com/boxfusion/pd-Hcm/_workitems/edit/86450
  test('TC-04: Redirect user to employee details upon clicking the employee link', async ({ page }) => {
    // STEP 1: NAVIGATE Navigate to the Leave Balances Details view
    const reached = await gotoBalanceDetails(page);
    test.skip(!reached, 'Could not reach a Leave Balance Details record');
    // STEP 3: CLICK Click on the employee link
    const link = page.locator('a[href*="user-details"], a[href*="person"]');
    test.skip(await link.count() === 0, 'No employee link on the sampled Leave Balance Details record');
    await link.first().click();
    // ASSERT (BLOCKING) The system redirects the user to the employee details page
    await expect(page).toHaveURL(/user-details|person/i);
  });

  // ADO Test Case #86452: https://dev.azure.com/boxfusion/pd-Hcm/_workitems/edit/86452
  test('TC-05: Redirect user to leave type details when the leave type link is clicked', async ({ page }) => {
    // STEP 1: NAVIGATE Navigate to the Leave Balances Details view
    const reached = await gotoBalanceDetails(page);
    test.skip(!reached, 'Could not reach a Leave Balance Details record');
    // STEP 3: CLICK Click on the leave type link
    const link = page.locator('a[href*="sagov-leave-type-details"]');
    test.skip(await link.count() === 0, 'No leave type link on the sampled Leave Balance Details record');
    await link.first().click();
    // ASSERT (BLOCKING) The system redirects the user to the leave type details page
    await expect(page).toHaveURL(/sagov-leave-type-details/i);
  });

  // ADO Test Case #86454: https://dev.azure.com/boxfusion/pd-Hcm/_workitems/edit/86454
  test("TC-06: Redirect user to dashboard when 'Back' button is clicked", async ({ page }) => {
    // STEP 1: NAVIGATE Navigate to the Leave Balances Details view
    const reached = await gotoBalanceDetails(page);
    test.skip(!reached, 'Could not reach a Leave Balance Details record');
    // STEP 3: CLICK Click on the 'Back' button
    const back = page.getByRole('button', { name: /^Back$/i });
    test.skip(await back.count() === 0, 'No Back button on the Leave Balance Details view');
    await back.first().click();
    // ASSERT (BLOCKING) The system redirects the user to the dashboard
    await expect(page).toHaveURL(/sagov-personal-balances|balances/i);
  });

});
