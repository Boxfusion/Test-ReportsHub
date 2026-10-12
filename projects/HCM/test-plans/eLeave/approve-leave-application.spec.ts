// AUTO-RECORDED from test-plans/eLeave/approve-leave-application.md
// Source: Azure DevOps test plan #116862, suite #116924
// The .md plan is canonical. AI-repair will patch failing lines in this file.
// Do not hand-edit unless you are also updating the .md plan.
//
// Depends on data: a recommended application must be in GOV022's Inbox (run capture + recommend first).
// TC-02 runs before TC-03 because TC-03 approves the item and removes it from the Inbox.

import { test, expect, Page } from '@playwright/test';

const APP_URL = 'https://pd-hcm-adminportal-qa.shesha.app/';
const APPROVER = { user: 'GOV022', password: '123qwe' };

test.describe.configure({ mode: 'serial' });

async function loginAsApprover(page: Page) {
  await page.goto(APP_URL);
  // STEP login.1: TYPE Username field with `GOV022`
  await page.getByRole('textbox', { name: 'Username' }).fill(APPROVER.user);
  // STEP login.2: TYPE Password field with `123qwe`
  await page.getByRole('textbox', { name: 'Password' }).fill(APPROVER.password);
  // STEP login.3: CLICK the Sign In button
  await page.getByRole('button', { name: 'Sign In' }).click();
  await page.waitForURL(url => !url.href.includes('/login'), { timeout: 30000 });
  await page.waitForLoadState('networkidle');
}

async function openInbox(page: Page) {
  await page.getByRole('menuitem', { name: 'apartment Workflows' }).click();
  await page.getByRole('link', { name: 'Inbox' }).click();
  await expect(page).toHaveURL(/workflows-inbox/);
  await expect(page.getByRole('heading', { name: 'Incoming Items' })).toBeVisible({ timeout: 30000 });
  const row = page.getByRole('row')
    .filter({ hasText: 'SaGov Leave Application' })
    .filter({ hasText: 'Approve Leave' })
    .first();
  await expect(row).toBeVisible({ timeout: 30000 });
  return row;
}

test.describe('ELEAVE-APPROVE — Approve Leave Application with Full Pay', () => {

  test('TC-01: Login as Approver', async ({ page }) => {
    // STEP 1: NAVIGATE to https://pd-hcm-adminportal-qa.shesha.app/
    await page.goto(APP_URL);
    // STEP 2: SNAPSHOT — confirm the Welcome - SHESHA login page is displayed
    // SNAPSHOT: login page
    // STEP 3: TYPE Username field with `GOV022`
    await page.getByRole('textbox', { name: 'Username' }).fill(APPROVER.user);
    // STEP 4: TYPE Password field with `123qwe`
    await page.getByRole('textbox', { name: 'Password' }).fill(APPROVER.password);
    // STEP 5: CLICK the Sign In button
    await page.getByRole('button', { name: 'Sign In' }).click();
    // STEP 6: WAIT for the home page to load
    await page.waitForLoadState('networkidle');
    // ASSERT (BLOCKING): URL no longer contains /login and the Workflows menu item is visible
    await expect(page).not.toHaveURL(/login/i);
    await expect(page.getByRole('menuitem', { name: 'apartment Workflows' })).toBeVisible({ timeout: 30000 });
  });

  // ADO Test Case #116928: https://dev.azure.com/boxfusion/pd-Hcm/_workitems/edit/116928
  test("TC-02: 'Approve with Full Pay' is disabled until the acknowledgement checkbox is ticked", async ({ page }) => {
    await loginAsApprover(page);
    // STEP 1: SNAPSHOT — confirm the Workflows menu item
    // SNAPSHOT: Workflows menu item
    // STEP 2: CLICK Workflows in the side menu, then CLICK Inbox
    // STEP 3: ASSERT the Incoming Items page shows the pending leave application
    // STEP 4: SNAPSHOT — confirm the SaGov Leave Application row with Action Required Approve Leave
    const row = await openInbox(page);
    // STEP 5: CLICK the view (magnifier) icon on that row
    await row.getByRole('link', { name: 'search' }).click();
    // STEP 6: ASSERT the Approve Leave page opens with the acknowledgement checkbox unticked
    await expect(page.getByRole('heading', { name: /^Approve Leave:/ })).toBeVisible({ timeout: 30000 });
    const checkbox = page.getByRole('checkbox');
    await expect(checkbox).not.toBeChecked();
    // STEP 7: ASSERT Approve without Pay / Approve with Full Pay disabled; Close, Send Back, Not Approve enabled
    const withoutPay = page.getByRole('button', { name: 'Approve without Pay' });
    const fullPay = page.getByRole('button', { name: 'Approve with Full Pay' });
    await expect(withoutPay).toBeDisabled();
    await expect(fullPay).toBeDisabled();
    await expect(page.getByRole('button', { name: 'Close', exact: true })).toBeEnabled();
    await expect(page.getByRole('button', { name: 'Send Back' })).toBeEnabled();
    await expect(page.getByRole('button', { name: 'Not Approve' })).toBeEnabled();
    // STEP 8: ASSERT clicking Approve with Full Pay submits nothing and the status stays In Progress
    await fullPay.click({ force: true });
    await expect(page.getByText('Successfully Submitted')).toHaveCount(0);
    await expect(page.getByText('In Progress').first()).toBeVisible();
    // STEP 9: CLICK the acknowledgement checkbox to tick it
    await checkbox.check();
    // STEP 10: ASSERT both Approve buttons become enabled
    await expect(withoutPay).toBeEnabled();
    await expect(fullPay).toBeEnabled();
    // STEP 11: CLICK the acknowledgement checkbox again to untick it
    await checkbox.uncheck();
    // ASSERT (BLOCKING): After unticking, Approve without Pay and Approve with Full Pay are disabled again
    await expect(withoutPay).toBeDisabled();
    await expect(fullPay).toBeDisabled();
  });

  // ADO Test Case #116927: https://dev.azure.com/boxfusion/pd-Hcm/_workitems/edit/116927
  test('TC-03: Approver can approve an Annual Leave application with Full Pay from the Workflows Inbox', async ({ page }) => {
    await loginAsApprover(page);
    // STEP 1: SNAPSHOT — confirm the Workflows menu item
    // SNAPSHOT: Workflows menu item
    // STEP 2: CLICK Workflows in the side menu, then CLICK Inbox
    // STEP 3: ASSERT the Incoming Items page shows the leave application (SaGov Leave Application / Approve Leave / In Progress)
    const row = await openInbox(page);
    await expect(row).toContainText('In Progress');
    // STEP 4: EXTRACT the Ref No of that row
    const refNo = (await row.getByRole('cell').nth(1).innerText()).trim();
    // STEP 5: CLICK the view (magnifier) icon on that row
    await row.getByRole('link', { name: 'search' }).click();
    // STEP 6: ASSERT the Approve Leave page opens with title, status IN PROGRESS and a matching Ref No
    await expect(page.getByRole('heading', { name: /^Approve Leave:/ })).toBeVisible({ timeout: 30000 });
    await expect(page.getByText('In Progress').first()).toBeVisible();
    await expect(page.getByText(`Ref No: ${refNo}`)).toBeVisible();
    // STEP 7: ASSERT the Leave Application Details section shows applicant, category, dates, balance and calendar
    await expect(page.getByText('Leave Application Details')).toBeVisible();
    await expect(page.getByText('Applicant Name')).toBeVisible();
    await expect(page.getByText('Category', { exact: true })).toBeVisible();
    await expect(page.getByText('Start Date')).toBeVisible();
    await expect(page.getByText(/Available days:/)).toBeVisible();
    await expect(page.getByRole('table', { name: 'Month View' })).toBeVisible();
    // STEP 8: CLICK the acknowledgement checkbox
    await page.getByRole('checkbox').check();
    // STEP 9: ASSERT Approve without Pay and Approve with Full Pay are enabled
    await expect(page.getByRole('button', { name: 'Approve without Pay' })).toBeEnabled();
    await expect(page.getByRole('button', { name: 'Approve with Full Pay' })).toBeEnabled();
    // STEP 10: CLICK Approve with Full Pay
    await page.getByRole('button', { name: 'Approve with Full Pay' }).click();
    // STEP 11: ASSERT a "Successfully Submitted" notification is shown
    await expect(page.getByText('Successfully Submitted')).toBeVisible({ timeout: 30000 });
    // ASSERT (BLOCKING): User is on the Workflows Inbox and the extracted Ref No is no longer listed
    await expect(page).toHaveURL(/workflows-inbox/, { timeout: 30000 });
    await expect(page.getByRole('heading', { name: 'Incoming Items' })).toBeVisible();
    await expect(page.getByRole('row').filter({ hasText: refNo })).toHaveCount(0, { timeout: 15000 });
  });

});
