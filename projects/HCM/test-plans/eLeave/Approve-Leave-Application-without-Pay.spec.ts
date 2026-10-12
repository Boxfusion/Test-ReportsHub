// AUTO-RECORDED from test-plans/HCM/eLeave/Approve-Leave-Application-without-Pay.md
// Source: Azure DevOps test plan #116862, suite #116925
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
  await page.goto(`${APP_URL}login`);
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
  // The side menu animates open, so the Inbox link can be unstable on the first click — retry
  // open + click until the URL changes.
  await expect(async () => {
    const inbox = page.getByRole('link', { name: 'Inbox' });
    if (!(await inbox.isVisible())) await page.getByRole('menuitem', { name: 'apartment Workflows' }).click();
    await inbox.click({ timeout: 5000 });
    await expect(page).toHaveURL(/workflows-inbox/, { timeout: 10000 });
  }).toPass({ timeout: 60000 });
  await expect(page.getByRole('heading', { name: 'Incoming Items' })).toBeVisible({ timeout: 30000 });
  const row = page.getByRole('row')
    .filter({ hasText: 'SaGov Leave Application' })
    .filter({ hasText: 'Approve Leave' })
    .first();
  await expect(row).toBeVisible({ timeout: 30000 });
  return row;
}

test.describe('ELEAVE-APPROVE-WITHOUT-PAY — Approve Leave Application without Pay', () => {

  test('TC-01: Login as Approver', async ({ page }) => {
    // STEP 1: NAVIGATE to https://pd-hcm-adminportal-qa.shesha.app/login
    await page.goto(`${APP_URL}login`);
    // STEP 2: SNAPSHOT — confirm the login page is displayed with Username and Password fields and a Sign In button
    await expect(page.getByRole('textbox', { name: 'Username' })).toBeVisible();
    await expect(page.getByRole('textbox', { name: 'Password' })).toBeVisible();
    await expect(page.getByRole('button', { name: 'Sign In' })).toBeVisible();
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

  // ADO Test Case #116934: https://dev.azure.com/boxfusion/pd-Hcm/_workitems/edit/116934
  test("TC-02: 'Approve without Pay' is disabled until the acknowledgement checkbox is ticked", async ({ page }) => {
    await loginAsApprover(page);
    // STEP 1: SNAPSHOT — confirm the Workflows menu item
    // SNAPSHOT: Workflows menu item
    // STEP 2: CLICK Workflows in the side menu, then CLICK Inbox
    // STEP 3: ASSERT the Workflows Inbox is displayed with at least one pending leave application
    // STEP 4: SNAPSHOT — confirm the SaGov Leave Application row with Action Required Approve Leave
    const row = await openInbox(page);
    // STEP 5: CLICK the view (magnifier) icon on that row
    await row.getByRole('link', { name: 'search' }).click();
    // STEP 6: ASSERT the application details page opens and the acknowledgement checkbox is unticked
    await expect(page.getByRole('heading', { name: /^Approve Leave:/ })).toBeVisible({ timeout: 30000 });
    const checkbox = page.getByRole('checkbox');
    await expect(checkbox).not.toBeChecked();
    // STEP 7: ASSERT Approve without Pay is disabled and no approval dialog is open
    const withoutPay = page.getByRole('button', { name: 'Approve without Pay' });
    await expect(withoutPay).toBeDisabled();
    await expect(page.getByRole('dialog', { name: 'Approve Without Pay' })).toHaveCount(0);
    // STEP 8: CLICK the acknowledgement checkbox to tick it
    await checkbox.check();
    // STEP 9: ASSERT Approve without Pay becomes enabled
    await expect(withoutPay).toBeEnabled();
    // STEP 10: CLICK the acknowledgement checkbox again to untick it
    await checkbox.uncheck();
    // ASSERT (BLOCKING): After unticking, Approve without Pay is disabled
    await expect(withoutPay).toBeDisabled();
  });

  // ADO Test Case #116933: https://dev.azure.com/boxfusion/pd-Hcm/_workitems/edit/116933
  test('TC-03: Approver can approve a leave application Without Pay from the Workflows Inbox', async ({ page }) => {
    await loginAsApprover(page);
    // STEP 1: SNAPSHOT — confirm the Workflows menu item
    // SNAPSHOT: Workflows menu item
    // STEP 2: CLICK Workflows in the side menu, then CLICK Inbox
    // STEP 3: ASSERT the Workflows Inbox (Incoming Items) is displayed and the pending leave application is listed
    const row = await openInbox(page);
    // STEP 4: EXTRACT the Ref No of the SaGov Leave Application row with Action Required Approve Leave
    const refNo = (await row.getByRole('cell').nth(1).innerText()).trim();
    // STEP 5: CLICK the view (magnifier) icon on that row
    await row.getByRole('link', { name: 'search' }).click();
    // STEP 6: ASSERT the details page opens showing applicant, leave type, dates and the approval actions
    await expect(page.getByRole('heading', { name: /^Approve Leave:/ })).toBeVisible({ timeout: 30000 });
    await expect(page.getByText('Applicant Name')).toBeVisible();
    await expect(page.getByText('Start Date')).toBeVisible();
    await expect(page.getByRole('button', { name: 'Approve without Pay' })).toBeVisible();
    // STEP 7: CLICK the acknowledgement checkbox
    await page.getByRole('checkbox').check();
    // STEP 8: CLICK Approve without Pay
    await page.getByRole('button', { name: 'Approve without Pay' }).click();
    // STEP 9: ASSERT the Approve Without Pay dialog opens with a Comment field and OK / Cancel buttons
    const dialog = page.getByRole('dialog', { name: 'Approve Without Pay' });
    await expect(dialog).toBeVisible();
    await expect(dialog.getByRole('textbox')).toBeVisible();
    await expect(dialog.getByRole('button', { name: 'OK' })).toBeVisible();
    await expect(dialog.getByRole('button', { name: 'Cancel' })).toBeVisible();
    // STEP 10: TYPE the comment field with `Testing not approved`
    await dialog.getByRole('textbox').fill('Testing not approved');
    // STEP 11: CLICK OK
    await dialog.getByRole('button', { name: 'OK' }).click();
    // STEP 12: ASSERT the dialog closes and a "Successfully Submitted" notification is displayed
    await expect(dialog).toBeHidden({ timeout: 30000 });
    await expect(page.getByText('Successfully Submitted')).toBeVisible({ timeout: 30000 });
    // ASSERT (BLOCKING): User is on the Workflows Inbox and the extracted Ref No is no longer listed
    await expect(page).toHaveURL(/workflows-inbox/, { timeout: 30000 });
    await expect(page.getByRole('heading', { name: 'Incoming Items' })).toBeVisible();
    await expect(page.getByRole('row').filter({ hasText: refNo })).toHaveCount(0, { timeout: 15000 });
  });

});
