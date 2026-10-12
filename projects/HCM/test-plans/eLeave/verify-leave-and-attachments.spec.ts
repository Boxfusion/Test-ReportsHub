// AUTO-RECORDED from test-plans/HCM/eLeave/verify-leave-and-attachments.md
// Source: Azure DevOps test plan #79625, suites #86523 (Verify Leave) + #86562 (Verify Attachments)
// The .md plan is canonical. AI-repair will patch failing lines in this file.
// Do not hand-edit unless you are also updating the .md plan.
//
// Selectors recorded live against QA on 2026-10-08 (LA2026/13912).
// TCs run serially and pass the application Ref No forward; each run submits a real
// Family Responsibility leave application for GOV003 and leaves it at Recommend Leave.

import { test, expect, Page, Locator } from '@playwright/test';
import * as path from 'path';

const APP_URL = 'https://pd-hcm-adminportal-qa.shesha.app/';
const APPLICANT = { user: 'GOV003', password: '123qwe' };
const VERIFIER = { user: 'admin', password: 'P@ssw0rd' };
const RECOMMENDER = { user: 'GOV012', password: '123qwe' };
const INBOX_URL = `${APP_URL}dynamic/Shesha.Workflow/workflows-inbox`;
const NAV_TIMEOUT = 60000;

const DOC_NAME = 'family-responsibility-supporting-doc.pdf';
const DOC_PATH = path.resolve(__dirname, 'fixtures', DOC_NAME);
// QA spells the category with a typo and a trailing space.
const CATEGORY = 'Family Rsponsibility ';
const LEAVE_TYPE = 'Family Responsibility (Sick)';
const RELATIONSHIP = 'Children';
const ADDRESS = '265 West Avenue';

// Let the current page finish loading before an action that navigates away. Shesha pages keep
// loading data after render, and navigating mid-load makes runs flaky.
async function beforeNavigate(page: Page) {
  await page.waitForLoadState('networkidle', { timeout: NAV_TIMEOUT }).catch(() => {});
  await page.waitForTimeout(1000);
}

async function loginAs(page: Page, account: { user: string; password: string }) {
  // QA can sit on "Initializing..." for a while after a cold start, and a stuck load never
  // recovers on its own — reload until the login form renders so one slow load doesn't fail
  // the whole serial chain.
  await expect(async () => {
    await page.goto(`${APP_URL}login`, { timeout: 30000 });
    await expect(page.getByRole('textbox', { name: 'Username' })).toBeVisible({ timeout: 20000 });
  }).toPass({ timeout: 90000 });
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

// Open the Inbox item for `refNo` at the given workflow step and wait for its action view.
async function openInboxItem(page: Page, refNo: string, action: string) {
  await page.goto(INBOX_URL, { timeout: NAV_TIMEOUT });
  await expect(page.getByRole('heading', { name: 'Incoming Items' })).toBeVisible({ timeout: NAV_TIMEOUT });
  await beforeNavigate(page);
  const row = page.getByRole('row').filter({ hasText: refNo }).filter({ hasText: action }).first();
  await expect(row).toBeVisible({ timeout: NAV_TIMEOUT });
  await row.getByRole('link', { name: 'search' }).click();
  await expect(page).toHaveURL(/workflow-action/, { timeout: NAV_TIMEOUT });
  await expect(page.getByRole('heading', { name: new RegExp(`^${action}:`) })).toBeVisible({ timeout: NAV_TIMEOUT });
  await beforeNavigate(page);
}

const verifyButton = (page: Page) => page.getByRole('button', { name: 'Verify', exact: true });

async function expectSendBackDialog(page: Page) {
  const dialog = page.getByRole('dialog', { name: 'Send Back' });
  await expect(dialog).toBeVisible({ timeout: NAV_TIMEOUT });
  await expect(dialog).toContainText('Step');
  await expect(dialog).toContainText('Select a User Task');
  await expect(dialog).toContainText('Comments');
  await expect(dialog.getByRole('button', { name: 'OK' })).toBeVisible();
  return dialog;
}

async function expectCloseDialog(page: Page) {
  const dialog = page.getByRole('dialog', { name: 'Close Leave Application' });
  await expect(dialog).toBeVisible({ timeout: NAV_TIMEOUT });
  await expect(dialog).toContainText('You are about close the Leave Application, do you wish to proceed?');
  await expect(dialog.getByRole('button', { name: 'OK' })).toBeVisible();
  return dialog;
}

const cellText = async (row: Locator, index: number) => (await row.getByRole('cell').nth(index).innerText()).trim();

test.describe('ELEAVE-VERIFY — Verify Leave Application & Verify Attachments', () => {
  test.describe.configure({ mode: 'serial', timeout: 180_000 });

  let applicationRef = '';

  test('TC-01: Applicant captures and submits a Family Responsibility leave with an attachment', async ({ page }) => {
    // STEP 1: NAVIGATE to the login page and log in as GOV003 / 123qwe
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
    // STEP 4: SELECT Category — choose `Family Rsponsibility `
    await selectOption(page, 'category', CATEGORY);
    // STEP 5: SELECT Sub-Category — choose `Family Responsibility (Sick)`
    await selectOption(page, 'model_leaveType', LEAVE_TYPE);
    // STEP 6: SELECT Family Relationship — choose `Children`
    await selectOption(page, 'details_leaveDetails', RELATIONSHIP);
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
    // ASSERT the hint "You have selected to take 1 day off" is shown after the dates are entered
    await expect(hint).toContainText('You have selected to take 1 day off');
    // STEP 8: TYPE Address with `265 West Avenue`
    await formItem(page, 'model_addressDuringLeavePeriod').getByRole('textbox').fill(ADDRESS);
    // STEP 9: CLICK the Supporting documents upload button and upload `family-responsibility-supporting-doc.pdf`
    const [chooser] = await Promise.all([
      page.waitForEvent('filechooser'),
      page.getByRole('button', { name: 'upload (press to upload)' }).click(),
    ]);
    await chooser.setFiles(DOC_PATH);
    // STEP 10: SNAPSHOT — confirm the file is listed under Supporting documents
    // ASSERT `family-responsibility-supporting-doc.pdf` is listed under Supporting documents
    await expect(page.getByText(DOC_NAME, { exact: true })).toBeVisible({ timeout: NAV_TIMEOUT });
    // STEP 11: CLICK the certification checkbox
    await page.getByRole('checkbox').check();
    // STEP 12: CLICK the Submit button
    await beforeNavigate(page);
    await page.getByRole('button', { name: 'Submit' }).click();
    // STEP 13: CLICK Don't Delegate on the Delegate pop-up
    const delegate = page.getByRole('dialog', { name: 'Delegate' });
    await expect(delegate).toBeVisible({ timeout: NAV_TIMEOUT });
    await beforeNavigate(page);
    await delegate.getByRole('button', { name: "Don't Delegate" }).click();
    await expect(delegate).toBeHidden();
    // ASSERT (BLOCKING): The user is on My Items and the top row is an In Progress Family Responsibility (Sick) application
    await expect(page).toHaveURL(/my_items2/, { timeout: NAV_TIMEOUT });
    const row = page.getByRole('row').filter({ hasText: 'SaGov Leave Application' }).first();
    await expect(row).toContainText('In Progress', { timeout: NAV_TIMEOUT });
    await expect(row).toContainText(LEAVE_TYPE);
    // STEP 14: EXTRACT the Ref No of the top SaGov Leave Application row in My Items
    applicationRef = await cellText(row, 1);
    expect(applicationRef).toMatch(/^LA/);
    console.log(`Submitted ${applicationRef}`);
  });

  test('TC-02: Verify Leave — captured leave application details are displayed', async ({ page }) => {
    // STEP 1: NAVIGATE to the login page and log in as admin / P@ssw0rd
    await loginAs(page, VERIFIER);
    // STEP 2-3: open the Inbox row for the application with Action Required Verify Leave
    // ASSERT (BLOCKING): The "Verify Leave: …" view opens and shows the Ref No
    await openInboxItem(page, applicationRef, 'Verify Leave');
    // STEP 4: SNAPSHOT — confirm the Leave Application Details section
    const main = page.getByRole('main');
    await expect(main).toContainText(`Ref No: ${applicationRef}`);
    await expect(main).toContainText('Leave Application Details');
    // ASSERT Leave Type, Family Relationship and Address match what was captured
    await expect(main).toContainText(LEAVE_TYPE);
    await expect(main).toContainText(RELATIONSHIP);
    await expect(main).toContainText(ADDRESS);
    // ASSERT `family-responsibility-supporting-doc.pdf` is listed under Supporting Documents
    await expect(page.getByText(DOC_NAME, { exact: true })).toBeVisible();
  });

  test('TC-03: Verify Leave — cannot verify without downloading the supporting documents', async ({ page }) => {
    // STEP 1: Log in as admin and open the Verify Leave Inbox item for the Ref No
    await loginAs(page, VERIFIER);
    await openInboxItem(page, applicationRef, 'Verify Leave');
    // STEP 2: SNAPSHOT — confirm the "Please download and review all attachments…" warning is shown
    await expect(page.getByText('Please download and review all attachments before selecting the confirmation checkbox.', { exact: false })).toBeVisible();
    // STEP 3: CLICK the acknowledgement checkbox (without downloading anything)
    await page.getByRole('checkbox').check();
    // ASSERT (BLOCKING): The Verify button is disabled while the checkbox is ticked and nothing is downloaded
    await expect(verifyButton(page)).toBeDisabled();
  });

  test('TC-04: Verify Leave — Send Back opens the Send Back dialog', async ({ page }) => {
    // STEP 1: Log in as admin and open the Verify Leave Inbox item for the Ref No
    await loginAs(page, VERIFIER);
    await openInboxItem(page, applicationRef, 'Verify Leave');
    // STEP 2: CLICK the Send Back button
    await page.getByRole('button', { name: 'Send Back', exact: true }).click();
    // STEP 3: SNAPSHOT — confirm the dialog
    // ASSERT (BLOCKING): A "Send Back" dialog is shown with a Step selector, Comments field, Cancel and OK buttons
    const dialog = await expectSendBackDialog(page);
    // STEP 4: CLICK Cancel
    await dialog.getByRole('button', { name: 'Cancel' }).click();
    // ASSERT The dialog closes on Cancel
    await expect(dialog).toBeHidden();
  });

  test('TC-05: Verify Leave — Close opens the Close Leave Application dialog', async ({ page }) => {
    // STEP 1: Log in as admin and open the Verify Leave Inbox item for the Ref No
    await loginAs(page, VERIFIER);
    await openInboxItem(page, applicationRef, 'Verify Leave');
    // STEP 2: CLICK the Close button
    await page.getByRole('button', { name: 'Close', exact: true }).click();
    // STEP 3: SNAPSHOT — confirm the dialog
    // ASSERT (BLOCKING): A "Close Leave Application" dialog is shown with the confirmation message
    const dialog = await expectCloseDialog(page);
    // STEP 4: CLICK the dialog's Close button (dismiss without confirming)
    await dialog.getByRole('button', { name: 'Close', exact: true }).last().click();
    // ASSERT The dialog closes without closing the application
    await expect(dialog).toBeHidden();
    await expect(page.getByRole('heading', { name: /^Verify Leave:/ })).toBeVisible();
  });

  test('TC-06: Verify Leave — download the document, Verify needs acknowledgement too', async ({ page }) => {
    // STEP 1: Log in as admin and open the Verify Leave Inbox item for the Ref No
    await loginAs(page, VERIFIER);
    await openInboxItem(page, applicationRef, 'Verify Leave');
    // STEP 2: CLICK the `family-responsibility-supporting-doc.pdf` link
    const [download] = await Promise.all([
      page.waitForEvent('download', { timeout: NAV_TIMEOUT }),
      page.getByText(DOC_NAME, { exact: true }).click(),
    ]);
    // ASSERT (BLOCKING): `family-responsibility-supporting-doc.pdf` is downloaded
    expect(download.suggestedFilename()).toBe(DOC_NAME);
    // STEP 3: SNAPSHOT — confirm Verify is still disabled (checkbox not ticked)
    // ASSERT The Verify button is disabled after the download while the checkbox is unticked
    await expect(verifyButton(page)).toBeDisabled();
    // STEP 4: CLICK the acknowledgement checkbox
    await page.getByRole('checkbox').check();
    // ASSERT (BLOCKING): The Verify button is enabled once the checkbox is ticked
    await expect(verifyButton(page)).toBeEnabled();
  });

  test('TC-07: Verify Leave — Verify routes the item to Verify Attachments', async ({ page }) => {
    // STEP 1: Log in as admin and open the Verify Leave Inbox item for the Ref No
    await loginAs(page, VERIFIER);
    await openInboxItem(page, applicationRef, 'Verify Leave');
    // STEP 2: CLICK the `family-responsibility-supporting-doc.pdf` link
    await Promise.all([
      page.waitForEvent('download', { timeout: NAV_TIMEOUT }),
      page.getByText(DOC_NAME, { exact: true }).click(),
    ]);
    // STEP 3: CLICK the acknowledgement checkbox
    await page.getByRole('checkbox').check();
    // STEP 4: CLICK the Verify button
    await expect(verifyButton(page)).toBeEnabled();
    await verifyButton(page).click();
    // ASSERT (BLOCKING): "Successfully Submitted" is shown
    await expect(page.getByText('Successfully Submitted')).toBeVisible({ timeout: NAV_TIMEOUT });
    // ASSERT (BLOCKING): The user is taken to the "Verify Attachments: …" view for the same application
    await expect(page.getByRole('heading', { name: /^Verify Attachments:/ })).toBeVisible({ timeout: NAV_TIMEOUT });
    await expect(page.getByRole('main')).toContainText(`Ref No: ${applicationRef}`, { timeout: NAV_TIMEOUT });
  });

  test('TC-08: Verify Attachments — captured leave application details are displayed', async ({ page }) => {
    // STEP 1: Log in as admin
    await loginAs(page, VERIFIER);
    // STEP 2-3: open the Inbox row for the application with Action Required Verify Attachments
    // ASSERT (BLOCKING): The "Verify Attachments: …" view opens and shows the Ref No
    await openInboxItem(page, applicationRef, 'Verify Attachments');
    // STEP 4: SNAPSHOT — confirm the Leave Application Details section
    const main = page.getByRole('main');
    await expect(main).toContainText(`Ref No: ${applicationRef}`);
    await expect(main).toContainText('Leave Application Details');
    // ASSERT Leave Type is Family Responsibility (Sick) and the document is listed under Supporting Documents
    await expect(main).toContainText(LEAVE_TYPE);
    await expect(page.getByText(DOC_NAME, { exact: true })).toBeVisible();
  });

  test('TC-09: Verify Attachments — download gate carries over from Verify Leave', async ({ page }) => {
    // STEP 1: Log in as admin and open the Verify Attachments Inbox item for the Ref No
    await loginAs(page, VERIFIER);
    await openInboxItem(page, applicationRef, 'Verify Attachments');
    // STEP 2: SNAPSHOT — confirm the "Please download and review all attachments…" warning is shown
    await expect(page.getByText('Please download and review all attachments before selecting the confirmation checkbox.', { exact: false })).toBeVisible();
    // STEP 3: SNAPSHOT — confirm Verify is disabled before the checkbox is ticked
    // ASSERT (BLOCKING): The Verify button is disabled before the checkbox is ticked
    await expect(verifyButton(page)).toBeDisabled();
    // STEP 4: CLICK the acknowledgement checkbox (without downloading anything on this step)
    await page.getByRole('checkbox').check();
    // ASSERT The Verify button is enabled once the checkbox is ticked, without a new download
    await expect(verifyButton(page)).toBeEnabled();
  });

  test('TC-10: Verify Attachments — Send Back opens the Send Back dialog', async ({ page }) => {
    // STEP 1: Log in as admin and open the Verify Attachments Inbox item for the Ref No
    await loginAs(page, VERIFIER);
    await openInboxItem(page, applicationRef, 'Verify Attachments');
    // STEP 2: CLICK the Send Back button
    await page.getByRole('button', { name: 'Send Back', exact: true }).click();
    // ASSERT (BLOCKING): A "Send Back" dialog is shown with a Step selector, Comments field, Cancel and OK buttons
    const dialog = await expectSendBackDialog(page);
    // STEP 3: CLICK Cancel
    await dialog.getByRole('button', { name: 'Cancel' }).click();
    // ASSERT The dialog closes on Cancel
    await expect(dialog).toBeHidden();
  });

  test('TC-11: Verify Attachments — Close opens the Close Leave Application dialog', async ({ page }) => {
    // STEP 1: Log in as admin and open the Verify Attachments Inbox item for the Ref No
    await loginAs(page, VERIFIER);
    await openInboxItem(page, applicationRef, 'Verify Attachments');
    // STEP 2: CLICK the Close button
    await page.getByRole('button', { name: 'Close', exact: true }).click();
    // ASSERT (BLOCKING): A "Close Leave Application" dialog is shown with the confirmation message
    const dialog = await expectCloseDialog(page);
    // STEP 3: CLICK the dialog's Close button (dismiss without confirming)
    await dialog.getByRole('button', { name: 'Close', exact: true }).last().click();
    // ASSERT The dialog closes without closing the application
    await expect(dialog).toBeHidden();
    await expect(page.getByRole('heading', { name: /^Verify Attachments:/ })).toBeVisible();
  });

  test('TC-12: Verify Attachments — Download Zip, Verify activates only after review', async ({ page }) => {
    // STEP 1: Log in as admin and open the Verify Attachments Inbox item for the Ref No
    await loginAs(page, VERIFIER);
    await openInboxItem(page, applicationRef, 'Verify Attachments');
    // STEP 2: CLICK the Download Zip button
    const [download] = await Promise.all([
      page.waitForEvent('download', { timeout: NAV_TIMEOUT }),
      page.getByRole('button', { name: 'file-zip Download Zip' }).click(),
    ]);
    // ASSERT (BLOCKING): `Files.zip` is downloaded
    expect(download.suggestedFilename()).toBe('Files.zip');
    // STEP 3: SNAPSHOT — confirm Verify is still disabled (checkbox not ticked)
    // ASSERT The Verify button is disabled after the download while the checkbox is unticked
    await expect(verifyButton(page)).toBeDisabled();
    // STEP 4: CLICK the acknowledgement checkbox
    await page.getByRole('checkbox').check();
    // ASSERT (BLOCKING): The Verify button is enabled once the checkbox is ticked
    await expect(verifyButton(page)).toBeEnabled();
  });

  test('TC-13: Verify Attachments — Verify routes the item on and redirects home', async ({ page }) => {
    // STEP 1: Log in as admin and open the Verify Attachments Inbox item for the Ref No
    await loginAs(page, VERIFIER);
    await openInboxItem(page, applicationRef, 'Verify Attachments');
    // STEP 2: CLICK the Download Zip button
    await Promise.all([
      page.waitForEvent('download', { timeout: NAV_TIMEOUT }),
      page.getByRole('button', { name: 'file-zip Download Zip' }).click(),
    ]);
    // STEP 3: CLICK the acknowledgement checkbox
    await page.getByRole('checkbox').check();
    // STEP 4: CLICK the Verify button
    await expect(verifyButton(page)).toBeEnabled();
    await verifyButton(page).click();
    // ASSERT (BLOCKING): "Successfully Submitted" is shown
    await expect(page.getByText('Successfully Submitted')).toBeVisible({ timeout: NAV_TIMEOUT });
    // ASSERT (BLOCKING): The user is redirected to the My Items home page
    await expect(page).toHaveURL(/workflows-my-items/, { timeout: NAV_TIMEOUT });
    // STEP 5: NAVIGATE to Workflows › Inbox
    await beforeNavigate(page);
    await page.goto(INBOX_URL, { timeout: NAV_TIMEOUT });
    await expect(page.getByRole('heading', { name: 'Incoming Items' })).toBeVisible({ timeout: NAV_TIMEOUT });
    await beforeNavigate(page);
    // ASSERT The Ref No is no longer in admin's Inbox
    await expect(page.getByRole('row').filter({ hasText: applicationRef })).toHaveCount(0);
  });

  test('TC-14: Routing check — the item reaches the recommender at Recommend Leave', async ({ page }) => {
    // STEP 1: NAVIGATE to the login page and log in as GOV012 / 123qwe
    await loginAs(page, RECOMMENDER);
    // STEP 2: NAVIGATE to Workflows › Inbox
    await page.goto(INBOX_URL, { timeout: NAV_TIMEOUT });
    await expect(page.getByRole('heading', { name: 'Incoming Items' })).toBeVisible({ timeout: NAV_TIMEOUT });
    await beforeNavigate(page);
    // ASSERT (BLOCKING): The Inbox has a row for the Ref No with Action Required Recommend Leave
    await expect(page.getByRole('row').filter({ hasText: applicationRef }).filter({ hasText: 'Recommend Leave' })).toBeVisible({ timeout: NAV_TIMEOUT });
  });

});
