// AUTO-RECORDED from test-plans/HCM/eLeave/acknowledge-leave-approved-without-pay.md
// Source: Azure DevOps test plan #116862, suite #117284
// The .md plan is canonical. AI-repair will patch failing lines in this file.
// Do not hand-edit unless you are also updating the .md plan.
//
// Self-seeding: TC-02 and TC-03 each create their own application (GOV003 capture → GOV012
// recommend → GOV022 approve without pay) and then acknowledge that exact Ref No as admin.
// The TCs are independent — no serial mode. Each run leaves two future-dated, one-day
// Annual Leave applications on GOV003.

import { test, expect, Page, Locator } from '@playwright/test';

const APP_URL = 'https://pd-hcm-adminportal-qa.shesha.app/';
const ADMIN = { user: 'admin', password: 'P@ssw0rd' };
const APPLICANT = { user: 'GOV003', password: '123qwe' };
const RECOMMENDER = { user: 'GOV012', password: '123qwe' };
const APPROVER = { user: 'GOV022', password: '123qwe' };
type Role = { user: string; password: string };

const ACTION_REQUIRED = /Acknowledge Leave/i;
const DECLARATION = 'I acknowledge that I have communicated with the applicant and the leave can be processed.';
const NAV_TIMEOUT = 30000;
// Four logins and three workflow hops per acknowledgement TC on a slow QA environment.
const SEEDED_TC_TIMEOUT = 8 * 60_000;
// ADO #117784: Submit can take well over 30s on QA before it completes.
const SUBMIT_TIMEOUT = 90_000;
const MAX_DATE_ATTEMPTS = 5;

// Let the current page finish loading before an action that navigates away.
async function beforeNavigate(page: Page) {
  await page.waitForLoadState('networkidle', { timeout: NAV_TIMEOUT }).catch(() => {});
  await page.waitForTimeout(1000);
}

async function loginAs(page: Page, role: Role) {
  // Clear the previous user's session so the same page (and its trace/video) carries across roles.
  await page.context().clearCookies();
  await page.goto(`${APP_URL}login`, { timeout: NAV_TIMEOUT });
  await page.evaluate(() => { localStorage.clear(); sessionStorage.clear(); });
  await page.goto(`${APP_URL}login`, { timeout: NAV_TIMEOUT });
  await beforeNavigate(page);
  // STEP login.1: TYPE Username field
  await page.getByRole('textbox', { name: 'Username' }).fill(role.user);
  // STEP login.2: TYPE Password field
  await page.getByRole('textbox', { name: 'Password' }).fill(role.password);
  // STEP login.3: CLICK the Sign In button
  await page.getByRole('button', { name: 'Sign In' }).click();
  await page.waitForURL(url => !url.href.includes('/login'), { timeout: NAV_TIMEOUT });
  await page.waitForLoadState('networkidle');
}

// The side menu animates open, so links can be unstable on the first click — retry open + click
// until the URL changes.
async function openWorkflowsLink(page: Page, name: 'Inbox' | 'My Items', url: RegExp) {
  await beforeNavigate(page);
  await expect(async () => {
    const link = page.getByRole('link', { name });
    if (!(await link.isVisible())) await page.getByRole('menuitem', { name: 'apartment Workflows' }).click();
    await link.click({ timeout: 5000 });
    await expect(page).toHaveURL(url, { timeout: 10000 });
  }).toPass({ timeout: 60000 });
}

async function openInbox(page: Page) {
  await openWorkflowsLink(page, 'Inbox', /workflows-inbox/);
  await expect(page.getByRole('heading', { name: 'Incoming Items' })).toBeVisible({ timeout: 30000 });
}

function inboxRow(page: Page, refNo: string, action: string | RegExp) {
  return page.getByRole('row')
    .filter({ hasText: 'SaGov Leave Application' })
    .filter({ hasText: refNo })
    .filter({ hasText: action });
}

// Workflow hand-offs are asynchronous, so search the Inbox for the Ref No (the search box is the
// only textbox on Incoming Items) and re-query until the row with the expected action shows up.
async function findInboxRow(page: Page, refNo: string, action: string | RegExp): Promise<Locator> {
  const row = inboxRow(page, refNo, action).first();
  const search = page.getByRole('textbox').first();
  await expect(async () => {
    await search.fill(refNo);
    await search.press('Enter');
    await expect(row).toBeVisible({ timeout: 8000 });
  }).toPass({ timeout: 90000 });
  return row;
}

async function expectGoneFromInbox(page: Page, refNo: string, action: string | RegExp) {
  const search = page.getByRole('textbox').first();
  await expect(async () => {
    await search.fill(refNo);
    await search.press('Enter');
    await page.waitForLoadState('networkidle');
    await expect(inboxRow(page, refNo, action)).toHaveCount(0, { timeout: 5000 });
  }).toPass({ timeout: 30000 });
}

// FRAGILE: Shesha form labels are not associated with their inputs, so capture-form fields are
// anchored on the label's `for` attribute (the form property name).
const captureField = (page: Page, key: string): Locator =>
  page.locator(`.ant-form-item:has(label[for="${key}"])`);

async function selectCaptureOption(page: Page, key: string, title: string) {
  await captureField(page, key).locator('.ant-select').click();
  const openDropdown = page.locator('.ant-select-dropdown:not(.ant-select-dropdown-hidden)');
  await openDropdown.locator(`.ant-select-item-option[title="${title}"]`).click();
  await expect(openDropdown).toHaveCount(0);
}

// Random future weekday in the current calendar year (leave balances are per calendar-year cycle).
function randomFutureWeekday(): Date {
  const now = new Date();
  const dec31 = new Date(now.getFullYear(), 11, 31);
  const maxOffset = Math.max(7, Math.floor((dec31.getTime() - now.getTime()) / 86_400_000) - 3);
  const d = new Date();
  d.setDate(d.getDate() + 7 + Math.floor(Math.random() * (maxOffset - 7 + 1)));
  while (d.getDay() === 0 || d.getDay() === 6) d.setDate(d.getDate() + 1);
  return d;
}
const pad = (n: number) => String(n).padStart(2, '0');
// dd/mm/yyyy — the date picker input format.
const inputDate = (d: Date) => `${pad(d.getDate())}/${pad(d.getMonth() + 1)}/${d.getFullYear()}`;
// "Wed 21 Oct 26" — the format used in the application Name column. Fixed names, because
// Intl's en-GB short month for September is "Sept" while the app shows "Sep".
const DAYS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
const MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
const nameDate = (d: Date) =>
  `${DAYS[d.getDay()]} ${pad(d.getDate())} ${MONTHS[d.getMonth()]} ${String(d.getFullYear()).slice(-2)}`;

// Prefix seed errors so the report shows the TC was blocked by setup, not by the acknowledgement flow.
async function seedStep<T>(name: string, body: () => Promise<T>): Promise<T> {
  return test.step(name, async () => {
    try {
      return await body();
    } catch (e) {
      if (e instanceof Error) e.message = `BLOCKED by ${name}: ${e.message}`;
      throw e;
    }
  });
}

// SEED A → D. Returns the Ref No of a fresh application waiting for admin's acknowledgement,
// with admin logged in.
async function seedApprovedWithoutPay(page: Page): Promise<string> {
  const refNo = await seedStep('SEED-A — Capture (as GOV003)', async () => {
    // STEP SEED-A.1: NAVIGATE to the login page and log in as GOV003
    await loginAs(page, APPLICANT);
    // STEP SEED-A.2: CLICK Workflows in the side menu, then CLICK My Items
    await openWorkflowsLink(page, 'My Items', /my_items2/);
    await expect(page.getByRole('heading', { name: 'My Items' })).toBeVisible({ timeout: 30000 });
    // STEP SEED-A.3: CLICK Create New, then CLICK New Leave Application
    await beforeNavigate(page);
    await expect(async () => {
      await page.getByRole('button', { name: 'plus Create New down' }).click();
      await expect(page.getByRole('link', { name: 'New Leave Application' })).toBeVisible({ timeout: 3000 });
      await page.getByRole('link', { name: 'New Leave Application' }).click({ timeout: 3000 });
    }).toPass({ timeout: 30000 });
    await expect(page).toHaveURL(/sagov-leave-application-draft/, { timeout: NAV_TIMEOUT });
    await expect(page.getByRole('radio', { name: 'Myself' })).toBeChecked({ timeout: 30000 });
    // STEP SEED-A.4: SELECT Category `Annual Leaves` and Sub-Category `Annual Leaves`
    await selectCaptureOption(page, 'category', 'Annual Leaves');
    await selectCaptureOption(page, 'model_leaveType', 'Annual Leaves');
    await expect(captureField(page, 'model_durationType')).toBeVisible({ timeout: 30000 });
    // STEP SEED-A.5: CLICK the Days radio on the Duration field
    await page.getByRole('radio', { name: 'Days' }).check();
    // STEP SEED-A.6: TYPE Start Date and End Date with the same future weekday (retry on overlap)
    const startDate = captureField(page, 'model_leaveFrom').getByRole('textbox');
    const endDate = captureField(page, 'model_leaveTo').getByRole('textbox');
    const hint = page.getByText(/You have selected to take \d+(\.\d+)? day/);
    const overlap = page.getByText('There are overlaps with existing leave requests');
    let date = randomFutureWeekday();
    for (let attempt = 1; ; attempt++) {
      await startDate.click();
      await startDate.fill(inputDate(date));
      await startDate.press('Enter');
      await endDate.click();
      await endDate.fill(inputDate(date));
      await endDate.press('Enter');
      if (await hint.waitFor({ timeout: 8000 }).then(() => true, () => false)) break;
      if (!(await overlap.isVisible()) || attempt === MAX_DATE_ATTEMPTS) break;
      console.log(`Leave date ${inputDate(date)} overlaps existing leave — retrying with a new date`);
      date = randomFutureWeekday();
    }
    await expect(hint).toBeVisible();
    // STEP SEED-A.7: TYPE Address with `265 West Avenue`
    await captureField(page, 'model_addressDuringLeavePeriod').getByRole('textbox').fill('265 West Avenue');
    // STEP SEED-A.8: CLICK the certification checkbox, then CLICK Submit
    await page.getByRole('checkbox').check();
    await beforeNavigate(page);
    await page.getByRole('button', { name: 'Submit' }).click();
    // STEP SEED-A.9: CLICK Don't Delegate on the Delegate pop-up
    const delegate = page.getByRole('dialog', { name: 'Delegate' });
    await expect(delegate).toBeVisible({ timeout: 30000 });
    await beforeNavigate(page);
    await delegate.getByRole('button', { name: "Don't Delegate" }).click();
    // STEP SEED-A.10: ASSERT (BLOCKING) the user is back on the My Items index view
    await expect(delegate).toBeHidden();
    await expect(page).toHaveURL(/my_items2/, { timeout: NAV_TIMEOUT });
    // STEP SEED-A.11: EXTRACT the Ref No of the new application from My Items, matching the leave dates
    const label = nameDate(date);
    const row = page.getByRole('row')
      .filter({ hasText: 'Annual Leaves Leave by' })
      .filter({ hasText: `from ${label} to ${label}` })
      .first();
    await expect(row).toBeVisible({ timeout: 60000 });
    const ref = (await row.innerText()).match(/LA\d{4}\/\d+/)?.[0];
    expect(ref, `Ref No for leave on ${label}`).toBeTruthy();
    console.log(`Seeded ${ref} (Annual Leave on ${label})`);
    return ref!;
  });

  await seedStep('SEED-B — Recommend (as GOV012)', async () => {
    // STEP SEED-B.1: Log in as GOV012
    await loginAs(page, RECOMMENDER);
    // STEP SEED-B.2: CLICK Workflows, then CLICK Inbox
    await openInbox(page);
    // STEP SEED-B.3: WAIT for the SEED_REF row with Action Required Recommend Leave
    const row = await findInboxRow(page, refNo, 'Recommend Leave');
    // STEP SEED-B.4: CLICK the view (magnifier) icon on that row
    await row.getByRole('link', { name: 'search' }).click();
    await expect(page.getByRole('heading', { name: /^Recommend Leave:/ })).toBeVisible({ timeout: 30000 });
    // STEP SEED-B.5: CLICK the acknowledgement checkbox, then CLICK Recommend
    await page.getByRole('checkbox').check();
    await page.getByRole('button', { name: 'Recommend', exact: true }).click();
    // STEP SEED-B.6: ASSERT (BLOCKING) "Successfully Submitted" is shown
    await expect(page.getByText('Successfully Submitted')).toBeVisible({ timeout: SUBMIT_TIMEOUT });
  });

  await seedStep('SEED-C — Approve without Pay (as GOV022)', async () => {
    // STEP SEED-C.1: Log in as GOV022
    await loginAs(page, APPROVER);
    // STEP SEED-C.2: CLICK Workflows, then CLICK Inbox
    await openInbox(page);
    // STEP SEED-C.3: WAIT for the SEED_REF row with Action Required Approve Leave
    const row = await findInboxRow(page, refNo, 'Approve Leave');
    // STEP SEED-C.4: CLICK the view (magnifier) icon on that row
    await row.getByRole('link', { name: 'search' }).click();
    await expect(page.getByRole('heading', { name: /^Approve Leave:/ })).toBeVisible({ timeout: 30000 });
    // STEP SEED-C.5: CLICK the acknowledgement checkbox, then CLICK Approve without Pay
    await page.getByRole('checkbox').check();
    await page.getByRole('button', { name: 'Approve without Pay' }).click();
    // STEP SEED-C.6: TYPE the dialog comment, then CLICK OK
    const dialog = page.getByRole('dialog', { name: 'Approve Without Pay' });
    await expect(dialog).toBeVisible();
    await dialog.getByRole('textbox').fill('Seeded for acknowledgement - automated test');
    await dialog.getByRole('button', { name: 'OK' }).click();
    // STEP SEED-C.7: ASSERT (BLOCKING) "Successfully Submitted" is shown
    await expect(page.getByText('Successfully Submitted')).toBeVisible({ timeout: SUBMIT_TIMEOUT });
  });

  await seedStep('SEED-D — Hand over to admin', async () => {
    // STEP SEED-D.1: Log in as admin
    await loginAs(page, ADMIN);
  });

  return refNo;
}

// Shesha form labels are not associated with their inputs, so fields are scoped by their form item.
function formItem(page: Page, label: string | RegExp) {
  return page.locator('.ant-form-item').filter({ hasText: label });
}

function declarationCheckbox(page: Page) {
  // FRAGILE: the declaration checkbox has no accessible name and sits outside a form item;
  // scope to the innermost element containing both the checkbox and the declaration text.
  return page.locator('div')
    .filter({ has: page.getByText(DECLARATION) })
    .filter({ has: page.getByRole('checkbox') })
    .last()
    .getByRole('checkbox');
}

async function selectSubmitToPersal(page: Page, option: string | RegExp) {
  const item = formItem(page, 'Submit to PERSAL');
  const selected = item.locator('.ant-select-selection-item');
  // The form can finish loading after the first selection and reset it, so wait for the page
  // to settle and re-select until the value sticks.
  await page.waitForLoadState('networkidle');
  await expect(async () => {
    if (!(await selected.filter({ hasText: option }).isVisible())) {
      await item.locator('.ant-select').click();
      await page.locator('.ant-select-dropdown:visible .ant-select-item-option').filter({ hasText: option }).click();
    }
    await page.waitForLoadState('networkidle');
    await expect(selected).toHaveText(option, { timeout: 2000 });
  }).toPass({ timeout: 30000 });
}

function annotateKnownIssue() {
  test.info().annotations.push({
    type: 'issue',
    description: 'ADO #117784 — Submit can hang on "Submitting..." on QA; attach failures at Submit there',
  });
}

test.describe('ELEAVE-ACK-WITHOUT-PAY — Acknowledge Leave Approved Without Pay', () => {

  test('TC-01: Login as Admin', async ({ page }) => {
    // STEP 1: NAVIGATE to https://pd-hcm-adminportal-qa.shesha.app/
    await page.goto(APP_URL);
    // STEP 2: SNAPSHOT — confirm the Welcome - SHESHA login page is displayed
    // SNAPSHOT: login page
    // STEP 3: TYPE Username field with `admin`
    await page.getByRole('textbox', { name: 'Username' }).fill(ADMIN.user);
    // STEP 4: TYPE Password field with `P@ssw0rd`
    await page.getByRole('textbox', { name: 'Password' }).fill(ADMIN.password);
    // STEP 5: CLICK the Sign In button
    await page.getByRole('button', { name: 'Sign In' }).click();
    // STEP 6: WAIT for the home page to load
    await page.waitForLoadState('networkidle');
    // ASSERT (BLOCKING): URL no longer contains /login and the Workflows menu item is visible
    await expect(page).not.toHaveURL(/login/i);
    await expect(page.getByRole('menuitem', { name: 'apartment Workflows' })).toBeVisible({ timeout: 30000 });
  });

  // ADO Test Case #117420: https://dev.azure.com/boxfusion/pd-Hcm/_workitems/edit/117420
  test('TC-02: Acknowledge leave without pay and submit via Interface to PERSAL', async ({ page }) => {
    test.setTimeout(SEEDED_TC_TIMEOUT);
    annotateKnownIssue();
    const refNo = await seedApprovedWithoutPay(page);
    // STEP 1: SNAPSHOT — confirm the Workflows menu item
    // SNAPSHOT: Workflows menu item
    // STEP 2: CLICK Workflows in the side menu, then CLICK Inbox
    // STEP 3: ASSERT the user is redirected to the Incoming Items index view
    await openInbox(page);
    // STEP 4: WAIT for the row containing SEED_REF with Action Required Acknowledge leave without pay
    // STEP 5: ASSERT (BLOCKING) the SEED_REF row is listed with Action Required Acknowledge leave without pay
    const row = await findInboxRow(page, refNo, ACTION_REQUIRED);
    // STEP 6: CLICK the view (magnifier) icon on that row
    await row.getByRole('link', { name: 'search' }).click();
    // STEP 7: ASSERT the leave application details view is opened and shows Ref No SEED_REF
    await expect(page.getByText('Leave Application Details')).toBeVisible({ timeout: 30000 });
    await expect(page.getByText(`Ref No: ${refNo}`)).toBeVisible();
    // STEP 8: SNAPSHOT — confirm the Submit to PERSAL drop-down field
    // SNAPSHOT: Submit to PERSAL drop-down
    // STEP 9: SELECT `Interface to PERSAL` in the Submit to PERSAL drop-down
    // STEP 10: ASSERT the option is selected and the Configure Transactions checkbox is displayed
    // A selection made while the form is still initialising can stick without triggering the
    // conditional Configure Transactions field, so toggle the option until it appears.
    const configure = formItem(page, 'Configure Transactions').getByRole('checkbox');
    await expect(async () => {
      if (await formItem(page, 'Submit to PERSAL').locator('.ant-select-selection-item').isVisible()) {
        await selectSubmitToPersal(page, /Process manually/i);
      }
      await selectSubmitToPersal(page, 'Interface to PERSAL');
      await expect(configure).toBeVisible({ timeout: 5000 });
    }).toPass({ timeout: 60000 });
    // STEP 11: CLICK the Configure Transactions checkbox
    await configure.check();
    // STEP 12: ASSERT a new table with transactions is displayed
    await expect(page.getByRole('row', { name: /Transaction 1/ })).toBeVisible();
    // STEP 13: TYPE the HR Comments field with `Interfaced to PERSAL - automated test`
    const comments = formItem(page, 'HR Comments').getByRole('textbox');
    await comments.fill('Interfaced to PERSAL - automated test');
    // STEP 14: ASSERT the comments are captured
    await expect(comments).toHaveValue('Interfaced to PERSAL - automated test');
    // STEP 15: CLICK the acknowledgement checkbox "I acknowledge that I have communicated with the applicant, and the leave can be processed."
    const declaration = declarationCheckbox(page);
    await declaration.check();
    // STEP 16: ASSERT the checkbox is checked
    await expect(declaration).toBeChecked();
    // STEP 17: CLICK the Submit button
    await page.getByRole('button', { name: 'Submit', exact: true }).click();
    // ASSERT (BLOCKING): "Successfully Submitted" is shown (up to 90s, ADO #117784) and SEED_REF is no longer listed with Action Required Acknowledge leave without pay
    await expect(page.getByText('Successfully Submitted')).toBeVisible({ timeout: SUBMIT_TIMEOUT });
    await expect(page).toHaveURL(/workflows-inbox/, { timeout: 30000 });
    await expectGoneFromInbox(page, refNo, ACTION_REQUIRED);
  });

  // ADO Test Case #117421: https://dev.azure.com/boxfusion/pd-Hcm/_workitems/edit/117421
  test('TC-03: Acknowledge leave without pay and submit via Process Manually', async ({ page }) => {
    test.setTimeout(SEEDED_TC_TIMEOUT);
    annotateKnownIssue();
    const refNo = await seedApprovedWithoutPay(page);
    // STEP 1: SNAPSHOT — confirm the Workflows menu item
    // SNAPSHOT: Workflows menu item
    // STEP 2: CLICK Workflows in the side menu, then CLICK Inbox
    // STEP 3: ASSERT the user is redirected to the Incoming Items index view
    await openInbox(page);
    // STEP 4: WAIT for the row containing SEED_REF with Action Required Acknowledge leave without pay
    // STEP 5: ASSERT (BLOCKING) the SEED_REF row is listed with Action Required Acknowledge leave without pay
    const row = await findInboxRow(page, refNo, ACTION_REQUIRED);
    // STEP 6: CLICK the view (magnifier) icon on that row
    await row.getByRole('link', { name: 'search' }).click();
    // STEP 7: ASSERT the leave application details view is opened and shows Ref No SEED_REF
    await expect(page.getByText('Leave Application Details')).toBeVisible({ timeout: 30000 });
    await expect(page.getByText(`Ref No: ${refNo}`)).toBeVisible();
    // STEP 8: SNAPSHOT — confirm the Submit to PERSAL drop-down field
    // SNAPSHOT: Submit to PERSAL drop-down
    // STEP 9: SELECT `Process Manually` in the Submit to PERSAL drop-down
    // STEP 10: ASSERT the option is selected successfully
    await selectSubmitToPersal(page, /Process manually/i);
    // STEP 11: TYPE the HR Comments field with `Processed manually - automated test`
    const comments = formItem(page, 'HR Comments').getByRole('textbox');
    await comments.fill('Processed manually - automated test');
    // STEP 12: ASSERT the comments are captured
    await expect(comments).toHaveValue('Processed manually - automated test');
    // STEP 13: CLICK the acknowledgement checkbox "I acknowledge that I have communicated with the applicant, and the leave can be processed."
    const declaration = declarationCheckbox(page);
    await declaration.check();
    // STEP 14: ASSERT the checkbox is checked
    await expect(declaration).toBeChecked();
    // STEP 15: CLICK the Submit button
    await page.getByRole('button', { name: 'Submit', exact: true }).click();
    // ASSERT (BLOCKING): "Successfully Submitted" is shown (up to 90s, ADO #117784) and SEED_REF is no longer listed with Action Required Acknowledge leave without pay
    await expect(page.getByText('Successfully Submitted')).toBeVisible({ timeout: SUBMIT_TIMEOUT });
    await expect(page).toHaveURL(/workflows-inbox/, { timeout: 30000 });
    await expectGoneFromInbox(page, refNo, ACTION_REQUIRED);
  });

});
