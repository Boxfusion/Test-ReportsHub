// AUTO-RECORDED from test-plans/eLeave/send-back-dialog.md
// Source: Azure DevOps test plan #79625, suite #86588
// The .md plan is canonical. AI-repair will patch failing lines in this file.
// Do not hand-edit unless you are also updating the .md plan.
//
// PENDING: TC-02+ are scaffolded with // TODO[selector] markers. The eLeave workflow-step
// views require a leave application seeded at each specific step to reach. Only the login is
// recorded live; AI-repair resolves the TODO markers on first /RunTest against seeded data.

import { test, expect, Page } from '@playwright/test';

const APP_URL = 'https://pd-hcm-adminportal-qa.shesha.app/';
const ADMIN = { user: 'admin', password: 'P@ssw0rd' };
const INBOX_URL = `${APP_URL}dynamic/Shesha.Workflow/workflows-inbox`;

async function loginAsAdmin(page: Page) {
  await page.goto(APP_URL);
  await page.getByRole('textbox', { name: 'Username' }).fill(ADMIN.user);
  await page.getByRole('textbox', { name: 'Password' }).fill(ADMIN.password);
  await page.getByRole('button', { name: 'Sign In' }).click();
  await page.waitForURL(url => !url.href.includes('/login'), { timeout: 30000 });
  await page.waitForLoadState('networkidle');
}

test.describe('ELEAVE-SEND-BACK — Send Back Dialog', () => {

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

  // ADO Test Case #86590: https://dev.azure.com/boxfusion/pd-Hcm/_workitems/edit/86590
  test('TC-02: The \'Ok\' button sends the leave application back to the selected step', async ({ page }) => {
    test.skip(true, "Requires a leave application parked at the relevant workflow step; submit actions would also mutate live QA data - not recorded in this read-only run");
    await loginAsAdmin(page);
    // STEP 1: SNAPSHOT — confirm the target element for: Open the eleave-wf-sendback-dialogbox
    // SNAPSHOT: confirm the target element for: Open the eleave-wf-sendback-dialogbox
    // STEP 2: CLICK Open the eleave-wf-sendback-dialogbox
    // TODO[selector]: CLICK Open the eleave-wf-sendback-dialogbox
    // STEP 3: SNAPSHOT — confirm the target element for: Click on the 'Ok' button
    // SNAPSHOT: confirm the target element for: Click on the 'Ok' button
    // STEP 4: CLICK Click on the 'Ok' button
    // TODO[selector]: CLICK Click on the 'Ok' button
    // ASSERT (BLOCKING) The system sends the leave application back to the selected step
    // TODO[assertion]: verify "The system sends the leave application back to the selected step"
  });

  // ADO Test Case #86592: https://dev.azure.com/boxfusion/pd-Hcm/_workitems/edit/86592
  test('TC-03: System should not allow sending back a leave application without comments', async ({ page }) => {
    test.skip(true, "Requires a leave application parked at the relevant workflow step; submit actions would also mutate live QA data - not recorded in this read-only run");
    await loginAsAdmin(page);
    // STEP 1: SNAPSHOT — confirm the target element for: Open the eleave-wf-sendback-dialogbox
    // SNAPSHOT: confirm the target element for: Open the eleave-wf-sendback-dialogbox
    // STEP 2: CLICK Open the eleave-wf-sendback-dialogbox
    // TODO[selector]: CLICK Open the eleave-wf-sendback-dialogbox
    // STEP 3: SNAPSHOT — confirm the target element for: Attempt to send back without entering any comments
    // SNAPSHOT: confirm the target element for: Attempt to send back without entering any comments
    // STEP 4: CLICK Attempt to send back without entering any comments
    // TODO[selector]: CLICK Attempt to send back without entering any comments
    // ASSERT (BLOCKING) The system prevents the leave application from being sent back and indicates that comments are required
    // TODO[assertion]: verify "The system prevents the leave application from being sent back and indicates that comments are required"
  });

  // ADO Test Case #86594: https://dev.azure.com/boxfusion/pd-Hcm/_workitems/edit/86594
  test('TC-04: Close the dialog when the \'Close\' button is clicked', async ({ page }) => {
    test.skip(true, "Requires a leave application parked at the relevant workflow step; submit actions would also mutate live QA data - not recorded in this read-only run");
    await loginAsAdmin(page);
    // STEP 1: SNAPSHOT — confirm the target element for: Open the eleave-wf-sendback-dialogbox
    // SNAPSHOT: confirm the target element for: Open the eleave-wf-sendback-dialogbox
    // STEP 2: CLICK Open the eleave-wf-sendback-dialogbox
    // TODO[selector]: CLICK Open the eleave-wf-sendback-dialogbox
    // STEP 3: SNAPSHOT — confirm the target element for: Click on the 'Close' button
    // SNAPSHOT: confirm the target element for: Click on the 'Close' button
    // STEP 4: CLICK Click on the 'Close' button
    // TODO[selector]: CLICK Click on the 'Close' button
    // ASSERT (BLOCKING) The dialog is closed
    // TODO[assertion]: verify "The dialog is closed"
  });

  // ADO Test Case #86595: https://dev.azure.com/boxfusion/pd-Hcm/_workitems/edit/86595
  test('TC-05: Display leave application details when the \'Close\' button is clicked', async ({ page }) => {
    test.skip(true, "Requires a leave application parked at the relevant workflow step; submit actions would also mutate live QA data - not recorded in this read-only run");
    await loginAsAdmin(page);
    // STEP 1: SNAPSHOT — confirm the target element for: Open the eleave-wf-sendback-dialogbox
    // SNAPSHOT: confirm the target element for: Open the eleave-wf-sendback-dialogbox
    // STEP 2: CLICK Open the eleave-wf-sendback-dialogbox
    // TODO[selector]: CLICK Open the eleave-wf-sendback-dialogbox
    // STEP 3: SNAPSHOT — confirm the target element for: Click on the 'Close' button
    // SNAPSHOT: confirm the target element for: Click on the 'Close' button
    // STEP 4: CLICK Click on the 'Close' button
    // TODO[selector]: CLICK Click on the 'Close' button
    // ASSERT (BLOCKING) The leave application details are displayed
    // TODO[assertion]: verify "The leave application details are displayed"
  });

});
