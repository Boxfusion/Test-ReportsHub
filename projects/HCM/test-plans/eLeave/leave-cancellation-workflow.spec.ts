// AUTO-RECORDED from test-plans/HCM/eLeave/leave-cancellation-workflow.md
// The .md plan is canonical. AI-repair will patch failing lines in this file.
// Do not hand-edit unless you are also updating the .md plan.
//
// Selectors recorded live against QA on 2026-10-05 (LA2026/13708 → LC:2026-21228).
// TCs run serially and pass the application / cancellation Ref Nos forward; each run submits
// and then cancels a real leave application for GOV003.

import { test, expect, Page, Locator } from '@playwright/test';

const APP_URL = 'https://pd-hcm-adminportal-qa.shesha.app/';
const APPLICANT = { user: 'GOV003', password: '123qwe' };
const RECOMMENDER = { user: 'GOV012', password: '123qwe' };
const APPROVER = { user: 'GOV022', password: '123qwe' };
const INBOX_URL = `${APP_URL}dynamic/Shesha.Workflow/workflows-inbox`;
const MY_ITEMS_URL = `${APP_URL}dynamic/SaGov.Leave/my_items2`;
const NAV_TIMEOUT = 30000;

// Let the current page finish loading before an action that navigates away. Shesha pages keep
// loading data after render, and navigating mid-load makes runs flaky.
async function beforeNavigate(page: Page) {
  await page.waitForLoadState('networkidle', { timeout: NAV_TIMEOUT }).catch(() => {});
  await page.waitForTimeout(1000);
}

async function loginAs(page: Page, account: { user: string; password: string }) {
  await page.goto(`${APP_URL}login`, { timeout: NAV_TIMEOUT });
  await beforeNavigate(page);
  // STEP login.1: TYPE Username field
  await page.getByRole('textbox', { name: 'Username' }).fill(account.user);
  // STEP login.2: TYPE Password field
  await page.getByRole('textbox', { name: 'Password' }).fill(account.password);
  // STEP login.3: CLICK the Sign In button
  await page.getByRole('button', { name: 'Sign In' }).click();
  await page.waitForURL(url => !url.href.includes('/login'), { timeout: NAV_TIMEOUT });
  await beforeNavigate(page);
}

// FRAGILE: Shesha form labels are not associated with their inputs, so fields are anchored on
// the label's `for` attribute (the form property name), which is stable across layout changes.
const formItem = (page: Page, key: string): Locator =>
  page.locator(`.ant-form-item:has(label[for="${key}"])`);

async function selectOption(page: Page, key: string, title: string) {
  await formItem(page, key).locator('.ant-select').click();
  const openDropdown = page.locator('.ant-select-dropdown:not(.ant-select-dropdown-hidden)');
  await openDropdown.locator(`.ant-select-item-option[title="${title}"]`).click();
  await expect(openDropdown).toHaveCount(0);
}

// Weekday `offset` days from today, formatted dd/mm/yyyy.
function weekday(offset: number): string {
  const d = new Date();
  d.setDate(d.getDate() + offset);
  while (d.getDay() === 0 || d.getDay() === 6) d.setDate(d.getDate() + 1);
  return `${String(d.getDate()).padStart(2, '0')}/${String(d.getMonth() + 1).padStart(2, '0')}/${d.getFullYear()}`;
}
const randomBetween = (min: number, max: number) => min + Math.floor(Math.random() * (max - min + 1));
// Leave balances are configured per calendar-year cycle, so stay inside this year.
function daysLeftInYear(): number {
  const now = new Date();
  const dec31 = new Date(now.getFullYear(), 11, 31);
  return Math.floor((dec31.getTime() - now.getTime()) / 86_400_000) - 3;
}
const MAX_DATE_ATTEMPTS = 5;

// Open a Workflows list (Inbox / My Items) and wait for its grid to load.
async function openList(page: Page, url: string, heading: string) {
  await page.goto(url, { timeout: NAV_TIMEOUT });
  await expect(page.getByRole('heading', { name: heading })).toBeVisible({ timeout: NAV_TIMEOUT });
  await beforeNavigate(page);
}

// Open the Inbox item for `refNo` at the given workflow step and wait for its action view.
async function openInboxItem(page: Page, refNo: string, action: string) {
  await openList(page, INBOX_URL, 'Incoming Items');
  const row = page.getByRole('row').filter({ hasText: refNo }).filter({ hasText: action }).first();
  await expect(row).toBeVisible({ timeout: NAV_TIMEOUT });
  await row.getByRole('link', { name: 'search' }).click();
  await expect(page).toHaveURL(/workflow-action/, { timeout: NAV_TIMEOUT });
  await expect(page.getByRole('heading', { name: new RegExp(`^${action}:`) })).toBeVisible({ timeout: NAV_TIMEOUT });
  await beforeNavigate(page);
}

async function expectSubmittedToInbox(page: Page) {
  await expect(page.getByText('Successfully Submitted')).toBeVisible({ timeout: NAV_TIMEOUT });
  await expect(page).toHaveURL(/workflows-inbox/, { timeout: NAV_TIMEOUT });
}

const cellText = async (row: Locator, index: number) => (await row.getByRole('cell').nth(index).innerText()).trim();

test.describe('ELEAVE-CANCELLATION-WF — Leave Cancellation Workflow (end-to-end)', () => {
  test.describe.configure({ mode: 'serial', timeout: 180_000 });

  let applicationRef = '';
  let leaveName = '';
  let cancellationRef = '';

  test('TC-01: Applicant submits a future dated leave application', async ({ page }) => {
    // STEP 1: NAVIGATE to the login page and log in as GOV003
    await loginAs(page, APPLICANT);
    // STEP 2: CLICK Workflows in the side menu, then CLICK My Items
    await expect(async () => {
      const myItems = page.getByRole('link', { name: 'My Items' });
      if (!(await myItems.isVisible())) await page.getByRole('menuitem', { name: 'apartment Workflows' }).click();
      await myItems.click({ timeout: 5000 });
      await expect(page).toHaveURL(/my_items2/, { timeout: 10000 });
    }).toPass({ timeout: 60000 });
    await expect(page.getByRole('heading', { name: 'My Items' })).toBeVisible({ timeout: NAV_TIMEOUT });
    // STEP 3: CLICK the Create New button, then CLICK New Leave Application
    await beforeNavigate(page);
    await expect(async () => {
      await page.getByRole('button', { name: 'plus Create New down' }).click();
      await page.getByRole('link', { name: 'New Leave Application' }).click({ timeout: 3000 });
    }).toPass({ timeout: 30000 });
    await expect(page).toHaveURL(/sagov-leave-application-draft/, { timeout: NAV_TIMEOUT });
    await expect(page.getByRole('radio', { name: 'Myself' })).toBeChecked({ timeout: NAV_TIMEOUT });
    // STEP 4: SELECT Category — choose `Annual Leaves`
    await selectOption(page, 'category', 'Annual Leaves');
    // STEP 5: SELECT Sub-Category — choose `Annual Leaves`
    await selectOption(page, 'model_leaveType', 'Annual Leaves');
    // STEP 6: CLICK the Days radio on the Duration field
    await page.getByRole('radio', { name: 'Days' }).check();
    // STEP 7: TYPE Start Date and End Date with the same future weekday (new date on overlap)
    const startDate = formItem(page, 'model_leaveFrom').getByRole('textbox');
    const endDate = formItem(page, 'model_leaveTo').getByRole('textbox');
    const hint = page.getByText(/You have selected to take \d+(\.\d+)? day/);
    const overlap = page.getByText('There are overlaps with existing leave requests');
    for (let attempt = 1; ; attempt++) {
      const date = weekday(randomBetween(7, Math.max(7, daysLeftInYear())));
      await startDate.click();
      await startDate.fill(date);
      await startDate.press('Enter');
      await endDate.click();
      await endDate.fill(date);
      await endDate.press('Enter');
      if (await hint.waitFor({ timeout: 8000 }).then(() => true, () => false)) break;
      if (!(await overlap.isVisible()) || attempt === MAX_DATE_ATTEMPTS) break;
      console.log(`Leave dates ${date} overlap existing leave — retrying with a new date`);
    }
    await expect(hint).toBeVisible();
    // STEP 8: TYPE Address with `265 West Avenue`
    await formItem(page, 'model_addressDuringLeavePeriod').getByRole('textbox').fill('265 West Avenue');
    // STEP 9: CLICK the certification checkbox
    await page.getByRole('checkbox').check();
    // STEP 10: CLICK the Submit button
    await beforeNavigate(page);
    await page.getByRole('button', { name: 'Submit' }).click();
    // STEP 11: CLICK Don't Delegate on the Delegate pop-up
    const delegate = page.getByRole('dialog', { name: 'Delegate' });
    await expect(delegate).toBeVisible({ timeout: NAV_TIMEOUT });
    await beforeNavigate(page);
    await delegate.getByRole('button', { name: "Don't Delegate" }).click();
    await expect(delegate).toBeHidden();
    // ASSERT (BLOCKING): The user is on My Items and the top row is an In Progress SaGov Leave Application
    await expect(page).toHaveURL(/my_items2/, { timeout: NAV_TIMEOUT });
    const row = page.getByRole('row').filter({ hasText: 'SaGov Leave Application' }).first();
    await expect(row).toContainText('In Progress', { timeout: NAV_TIMEOUT });
    // STEP 12: EXTRACT the Ref No of the top SaGov Leave Application row in My Items
    applicationRef = await cellText(row, 1);
    leaveName = await cellText(row, 3);
    expect(applicationRef).toMatch(/^LA/);
    console.log(`Submitted ${applicationRef}: ${leaveName}`);
  });

  test('TC-02: Recommender recommends the leave application', async ({ page }) => {
    // STEP 1: NAVIGATE to the login page and log in as GOV012
    await loginAs(page, RECOMMENDER);
    // STEP 2-5: open the Inbox row for the application with Action Required Recommend Leave
    await openInboxItem(page, applicationRef, 'Recommend Leave');
    // STEP 6: CLICK the acknowledgement checkbox
    await page.getByRole('checkbox').check();
    // STEP 7: CLICK the Recommend button
    await page.getByRole('button', { name: 'Recommend', exact: true }).click();
    // ASSERT (BLOCKING): "Successfully Submitted" is shown and the user is back on the Incoming Items view
    await expectSubmittedToInbox(page);
  });

  test('TC-03: Approver approves the leave application with full pay', async ({ page }) => {
    // STEP 1: NAVIGATE to the login page and log in as GOV022
    await loginAs(page, APPROVER);
    // STEP 2-5: open the Inbox row for the application with Action Required Approve Leave
    await openInboxItem(page, applicationRef, 'Approve Leave');
    // STEP 6: CLICK the acknowledgement checkbox
    await page.getByRole('checkbox').check();
    // STEP 7: CLICK the Approve with Full Pay button
    await page.getByRole('button', { name: 'Approve with Full Pay' }).click();
    // ASSERT (BLOCKING): "Successfully Submitted" is shown and the user is back on the Incoming Items view
    await expectSubmittedToInbox(page);
  });

  test('TC-04: Applicant cancels the approved leave application', async ({ page }) => {
    // STEP 1: NAVIGATE to the login page and log in as GOV003
    await loginAs(page, APPLICANT);
    // STEP 2: NAVIGATE to Workflows › My Items
    await openList(page, MY_ITEMS_URL, 'My Items');
    // STEP 3: CLICK the magnifying glass (search) icon on the row with the application Ref No
    await page.getByRole('row').filter({ hasText: applicationRef }).getByRole('link', { name: 'search' }).click();
    // STEP 4: ASSERT the "SaGov Leave Application: …" details view opens
    await expect(page.getByRole('heading', { name: /^SaGov Leave Application:/ })).toBeVisible({ timeout: NAV_TIMEOUT });
    await beforeNavigate(page);
    // STEP 5: CLICK the Cancel Leave button
    await page.getByRole('button', { name: 'Cancel Leave' }).click();
    // STEP 6: ASSERT the Cancel Leave dialog is shown
    const dialog = page.getByRole('dialog', { name: 'Cancel Leave' });
    await expect(dialog).toBeVisible({ timeout: NAV_TIMEOUT });
    await expect(dialog).toContainText('You are about to cancel this leave application. Please provide comments.');
    // STEP 7: TYPE the comments box with `Cancel leave - regression test`
    await dialog.getByRole('textbox').fill('Cancel leave - regression test');
    // STEP 8: CLICK OK
    await dialog.getByRole('button', { name: 'OK' }).click();
    // STEP 9: ASSERT "Successfully cancelled the leave" is shown
    await expect(page.getByText('Successfully cancelled the leave')).toBeVisible({ timeout: NAV_TIMEOUT });
    // STEP 10: NAVIGATE to Workflows › My Items
    await beforeNavigate(page);
    await openList(page, MY_ITEMS_URL, 'My Items');
    // ASSERT (BLOCKING): A SaGov Leave Cancellation for the leave is listed In Progress in My Items
    const row = page.getByRole('row')
      .filter({ hasText: 'SaGov Leave Cancellation' })
      .filter({ hasText: leaveName })
      .filter({ hasText: 'In Progress' })
      .first();
    await expect(row).toBeVisible({ timeout: NAV_TIMEOUT });
    // STEP 11: EXTRACT the Ref No of the SaGov Leave Cancellation row
    cancellationRef = await cellText(row, 1);
    expect(cancellationRef).toMatch(/^LC/);
    console.log(`Started cancellation ${cancellationRef} for ${applicationRef}`);
  });

  test('TC-05: Recommender recommends the cancellation', async ({ page }) => {
    // STEP 1: NAVIGATE to the login page and log in as GOV012
    await loginAs(page, RECOMMENDER);
    // STEP 2-4: open the Inbox row for the cancellation with Action Required Recommends Cancellation
    await openInboxItem(page, cancellationRef, 'Recommends Cancellation');
    // STEP 5: ASSERT Close, Decline Cancellation and Recommend Cancellation buttons are shown
    await expect(page.getByRole('button', { name: 'Close', exact: true })).toBeVisible();
    await expect(page.getByRole('button', { name: 'Decline Cancellation' })).toBeVisible();
    const recommend = page.getByRole('button', { name: 'Recommend Cancellation' });
    await expect(recommend).toBeEnabled();
    // STEP 6: CLICK the Recommend Cancellation button
    await recommend.click();
    // ASSERT (BLOCKING): "Successfully Submitted" is shown and the user is back on the Incoming Items view
    await expectSubmittedToInbox(page);
  });

  test('TC-06: Approver approves the cancellation', async ({ page }) => {
    // STEP 1: NAVIGATE to the login page and log in as GOV022
    await loginAs(page, APPROVER);
    // STEP 2-4: open the Inbox row for the cancellation with Action Required Approve Leave Cancellation
    await openInboxItem(page, cancellationRef, 'Approve Leave Cancellation');
    // STEP 5: ASSERT Close, Decline Cancellation and Approve Cancellation buttons are shown
    await expect(page.getByRole('button', { name: 'Close', exact: true })).toBeVisible();
    await expect(page.getByRole('button', { name: 'Decline Cancellation' })).toBeVisible();
    const approve = page.getByRole('button', { name: 'Approve Cancellation' });
    await expect(approve).toBeEnabled();
    // STEP 6: CLICK the Approve Cancellation button
    await approve.click();
    // ASSERT (BLOCKING): "Successfully Submitted" is shown and the user is back on the Incoming Items view
    await expectSubmittedToInbox(page);
  });

  test('TC-07: Cancellation is completed and the application is cancelled', async ({ page }) => {
    // STEP 1: NAVIGATE to the login page and log in as GOV003
    await loginAs(page, APPLICANT);
    // STEP 2: NAVIGATE to Workflows › My Items
    // STEP 3: SNAPSHOT — confirm the cancellation and application rows
    // The status update can lag the approval, so reload My Items until it lands.
    await expect(async () => {
      await openList(page, MY_ITEMS_URL, 'My Items');
      // ASSERT (BLOCKING): The cancellation row shows status Cancellation Completed
      await expect(page.getByRole('row').filter({ hasText: cancellationRef })).toContainText('Cancellation Completed', { timeout: 5000 });
    }).toPass({ timeout: 90000 });
    // ASSERT The application row shows status Cancelled
    await expect(page.getByRole('row').filter({ hasText: applicationRef }).getByRole('cell', { name: 'Cancelled', exact: true })).toBeVisible();
  });

});
