// AUTO-RECORDED from test-plans/performance-agreements/smoke-happy-path.md
// Source: Azure DevOps test plan #77591, suite #77594
// The .md plan is canonical. AI-repair will patch failing lines in this file.
// Do not hand-edit unless you are also updating the .md plan.

import { test, expect, Page } from '@playwright/test';

const APP_URL = 'https://pd-hcm-adminportal-qa.shesha.app/';
const ADMIN = { user: 'admin', password: 'P@ssw0rd' };

const FINANCIAL_YEARS_URL = `${APP_URL}dynamic/SaGov.Pmds/sagov-cycle-views`;
const CYCLE_URL = `${APP_URL}dynamic/SaGov.Pmds/sagov-cycle-details-view?id=7cf9054b-8c69-4313-ae5c-8039bf495c04&name=SL%201-12%20Performance%20Agreement&fy=FY2026/27`;
const PERSAL_URL = `${APP_URL}dynamic/SaGov.Pmds/sagov-persal-input-file-import`;

async function loginAsAdmin(page: Page) {
  await page.goto(APP_URL);
  await page.getByRole('textbox', { name: 'Username' }).fill(ADMIN.user);
  await page.getByRole('textbox', { name: 'Password' }).fill(ADMIN.password);
  await page.getByRole('button', { name: 'Sign In' }).click();
  await page.waitForURL(url => !url.href.includes('/login'), { timeout: 30000 });
  await page.waitForLoadState('networkidle');
}

test.describe('SMOKE-HAPPY — Smoke Test Suite — Happy Path', () => {

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

    // STEP 6: WAIT for dashboard to load
    await page.waitForLoadState('networkidle');

    // ASSERT (BLOCKING) URL no longer contains /login and SaGov PMDS menu is visible
    await expect(page).not.toHaveURL(/login/i);
    await expect(page.getByRole('menuitem', { name: 'book SaGov PMDS' })).toBeVisible();
  });

  // ADO Test Case #77595: https://dev.azure.com/boxfusion/pd-Hcm/_workitems/edit/77595
  test('TC-02: Step 1 - Financial Year Starts', async ({ page }) => {
    await loginAsAdmin(page);

    // STEP 1: NAVIGATE to Financial Years page
    await page.goto(FINANCIAL_YEARS_URL);

    // STEP 2: WAIT for Financial Years page to load
    await page.waitForLoadState('networkidle');

    // STEP 3: SNAPSHOT — confirm Financial Years page heading and FY entry are visible
    // SNAPSHOT: Financial Years page

    // ASSERT (BLOCKING) FY2026/27 label is visible on the Financial Years page
    await expect(page.getByText('FY2026/27')).toBeVisible({ timeout: 30000 });
  });

  // ADO Test Case #77596: https://dev.azure.com/boxfusion/pd-Hcm/_workitems/edit/77596
  test('TC-03: Step 2 - Create Cycle and Send Notifications', async ({ page }) => {
    await loginAsAdmin(page);

    // STEP 1: NAVIGATE to Financial Years page
    await page.goto(FINANCIAL_YEARS_URL);

    // STEP 2: WAIT for Financial Years page to load
    await page.waitForLoadState('networkidle');

    // STEP 3: SNAPSHOT — confirm at least one cycle link is visible under FY2026/27
    // SNAPSHOT: Financial Years with cycle links

    // ASSERT (BLOCKING) "SL 1-12 Performance Agreement" cycle link is visible under FY2026/27
    await expect(page.getByRole('link', { name: 'SL 1-12 Performance Agreement' })).toBeVisible({ timeout: 30000 });
  });

  // ADO Test Case #77597: https://dev.azure.com/boxfusion/pd-Hcm/_workitems/edit/77597
  test('TC-04: Step 3 - Open Performance Agreement Process', async ({ page }) => {
    await loginAsAdmin(page);

    // STEP 1: NAVIGATE to Financial Years page
    await page.goto(FINANCIAL_YEARS_URL);

    // STEP 2: WAIT for Financial Years page to load
    await page.waitForLoadState('networkidle');

    // STEP 3: SNAPSHOT — confirm cycle links are visible
    // SNAPSHOT: Financial Years with cycle links

    // STEP 4: CLICK the "SL 1-12 Performance Agreement" cycle link
    await page.getByRole('link', { name: 'SL 1-12 Performance Agreement' }).click({ timeout: 30000 });

    // STEP 5: WAIT for cycle details page to load
    await page.waitForLoadState('networkidle');

    // STEP 6: SNAPSHOT — confirm Manage Process tab with Contracting stage is visible
    // SNAPSHOT: cycle details Manage Process tab

    // ASSERT (BLOCKING) Contracting stage status shows "In Progress"
    await expect(page.getByText('Contracting')).toBeVisible();
    await expect(page.getByText('In Progress').first()).toBeVisible();
  });

  // ADO Test Case #77598: https://dev.azure.com/boxfusion/pd-Hcm/_workitems/edit/77598
  test('TC-05: Step 4 - Draft Performance Agreement', async ({ page }) => {
    await loginAsAdmin(page);

    // STEP 1: NAVIGATE to cycle details for "SL 1-12 Performance Agreement"
    await page.goto(CYCLE_URL);

    // STEP 2: WAIT for page to load
    await page.waitForLoadState('networkidle');

    // STEP 3: SNAPSHOT — confirm Contracting stage statistics panel is visible
    // SNAPSHOT: Contracting stage stats

    // ASSERT (BLOCKING) Contracting "In progress" stat label is visible (count > 0)
    await expect(page.getByText('Contracting')).toBeVisible({ timeout: 30000 });
    await expect(page.getByText('In progress').first()).toBeVisible();
  });

  // ADO Test Case #77599: https://dev.azure.com/boxfusion/pd-Hcm/_workitems/edit/77599
  test('TC-06: Step 5 - Review Performance Agreement', async ({ page }) => {
    await loginAsAdmin(page);

    // STEP 1: NAVIGATE to cycle details for "SL 1-12 Performance Agreement"
    await page.goto(CYCLE_URL);

    // STEP 2: WAIT for page to load
    await page.waitForLoadState('networkidle');

    // STEP 3: SNAPSHOT — confirm Contracting stage is still active
    // SNAPSHOT: Contracting stage active

    // ASSERT (BLOCKING) Contracting stage shows "In Progress" status
    await expect(page.getByText('In Progress').first()).toBeVisible();
  });

  // ADO Test Case #77600: https://dev.azure.com/boxfusion/pd-Hcm/_workitems/edit/77600
  test('TC-07: Step 6 - No Dispute Raised', async ({ page }) => {
    await loginAsAdmin(page);

    // STEP 1: NAVIGATE to cycle details for "SL 1-12 Performance Agreement"
    await page.goto(CYCLE_URL);

    // STEP 2: WAIT for page to load
    await page.waitForLoadState('networkidle');

    // STEP 3: SNAPSHOT — confirm Contracting section shows Close process button
    // SNAPSHOT: Contracting section with Close process button

    // ASSERT (BLOCKING) "Close process" button is visible on the Contracting stage
    await expect(page.getByRole('button', { name: 'Close process' })).toBeVisible({ timeout: 30000 });
  });

  // ADO Test Case #77601: https://dev.azure.com/boxfusion/pd-Hcm/_workitems/edit/77601
  test('TC-08: Step 7 - Verify Performance Agreement', async ({ page }) => {
    await loginAsAdmin(page);

    // STEP 1: NAVIGATE to cycle details for "SL 1-12 Performance Agreement"
    await page.goto(CYCLE_URL);

    // STEP 2: WAIT for page to load
    await page.waitForLoadState('networkidle');

    // STEP 3: SNAPSHOT — confirm all three PMDS process stages are visible
    // SNAPSHOT: all three process stages

    // ASSERT Contracting stage heading is visible
    await expect(page.getByText('Contracting')).toBeVisible({ timeout: 30000 });

    // ASSERT Mid Year Assessment stage heading is visible
    await expect(page.getByText('Mid Year Assessment')).toBeVisible();

    // ASSERT (BLOCKING) Annual Assessment stage heading is visible
    await expect(page.getByText('Annual Assessment')).toBeVisible();
  });

  // ADO Test Case #77602: https://dev.azure.com/boxfusion/pd-Hcm/_workitems/edit/77602
  test('TC-09: Step 8 - Interface to PERSAL', async ({ page }) => {
    await loginAsAdmin(page);

    // STEP 1: NAVIGATE to PERSAL Input File Export page
    await page.goto(PERSAL_URL);

    // STEP 2: WAIT for PERSAL Input File Export page to load
    await page.waitForLoadState('domcontentloaded');

    // STEP 3: SNAPSHOT — confirm page heading and action buttons are visible
    // SNAPSHOT: PERSAL Input File Export page

    // ASSERT "Generate and send to FTP" button is visible
    await expect(page.getByRole('button', { name: 'Generate and send to FTP' })).toBeVisible({ timeout: 30000 });

    // ASSERT (BLOCKING) page heading "PMDS: PERSAL Input file export" is visible
    await expect(page.getByRole('heading', { name: 'PMDS: PERSAL Input file export' })).toBeVisible();
  });

  // ADO Test Case #77603: https://dev.azure.com/boxfusion/pd-Hcm/_workitems/edit/77603
  test('TC-10: Step 9 - End Performance Agreement Process', async ({ page }) => {
    await loginAsAdmin(page);

    // STEP 1: NAVIGATE to cycle details for "SL 1-12 Performance Agreement"
    await page.goto(CYCLE_URL);

    // STEP 2: WAIT for page to load
    await page.waitForLoadState('networkidle');

    // STEP 3: SNAPSHOT — confirm Contracting stage shows Close process button
    // SNAPSHOT: Contracting stage Close process button

    // ASSERT (BLOCKING) "Close process" button is visible on the Contracting stage
    await expect(page.getByRole('button', { name: 'Close process' })).toBeVisible({ timeout: 30000 });
  });
});
