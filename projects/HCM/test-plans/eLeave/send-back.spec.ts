// AUTO-RECORDED from test-plans/HCM/eLeave/send-back.md
// The .md plan is canonical. AI-repair will patch failing lines in this file.
// Do not hand-edit unless you are also updating the .md plan.
//
// Selectors recorded live against QA on 2026-10-07 (Recommend Leave step, Shesha.Workflow/user-task-send-back v2).
// Self-seeding: SEED (beforeAll) captures a fresh one-day Annual Leave as GOV003, which goes straight
// to GOV012's Recommend Leave step. Every TC acts on that exact Ref No, never on whatever item
// happens to top GOV012's Inbox — other plans leave Recommend Leave items there too.
// TCs run serially; TC-05 is last because it sends the seeded item back to GOV003.

import { test, expect, Page, Locator } from '@playwright/test';

const APP_URL = 'https://pd-hcm-adminportal-qa.shesha.app/';
const RECOMMENDER = { user: 'GOV012', password: '123qwe' };
const APPLICANT = { user: 'GOV003', password: '123qwe' };
const INBOX_URL = `${APP_URL}dynamic/Shesha.Workflow/workflows-inbox`;
const NAV_TIMEOUT = 30000;
// ADO #117784: Submit can take well over 30s on QA before it completes.
const SUBMIT_TIMEOUT = 90_000;
const MAX_DATE_ATTEMPTS = 5;

test.describe.configure({ mode: 'serial', timeout: 180_000 });

// Let the current page finish loading before an action that navigates away. Shesha pages keep
// loading data after render, and navigating mid-load makes runs flaky.
async function beforeNavigate(page: Page) {
  await page.waitForLoadState('networkidle', { timeout: NAV_TIMEOUT }).catch(() => {});
  await page.waitForTimeout(1000);
}

async function loginAs(page: Page, account: { user: string; password: string }) {
  // QA can sit on "Initializing..." for a while, and a stuck load never recovers on its own —
  // reload until the login form renders so one slow load doesn't fail the whole serial chain.
  await expect(async () => {
    await page.goto(`${APP_URL}login`, { timeout: NAV_TIMEOUT });
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

async function openInbox(page: Page) {
  await page.goto(INBOX_URL, { timeout: NAV_TIMEOUT });
  await expect(page.getByRole('heading', { name: 'Incoming Items' })).toBeVisible({ timeout: NAV_TIMEOUT });
  await beforeNavigate(page);
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

// Workflow hand-offs are asynchronous, so search the Inbox for the Ref No (the search box is the
// only textbox on Incoming Items) and re-query until the row with the expected action shows up.
async function findInboxRow(page: Page, refNo: string, action: string): Promise<Locator> {
  const row = page.getByRole('row')
    .filter({ hasText: 'SaGov Leave Application' })
    .filter({ hasText: refNo })
    .filter({ hasText: action })
    .first();
  const search = page.getByRole('textbox').first();
  await expect(async () => {
    await search.fill(refNo);
    await search.press('Enter');
    await expect(row).toBeVisible({ timeout: 8000 });
  }).toPass({ timeout: 90000 });
  return row;
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

// SEED — capture a one-day Annual Leave as GOV003. Annual Leave needs no attachment, so it goes
// straight to GOV012's Recommend Leave step. Returns the new Ref No. Errors are prefixed so the
// report shows the TCs were blocked by setup, not by the Send Back dialog.
async function seedRecommendLeaveItem(page: Page): Promise<string> {
  try {
    // STEP SEED.1: NAVIGATE to the login page and log in as GOV003
    await loginAs(page, APPLICANT);
    // STEP SEED.2: CLICK Workflows in the side menu, then CLICK My Items
    await openWorkflowsLink(page, 'My Items', /my_items2/);
    await expect(page.getByRole('heading', { name: 'My Items' })).toBeVisible({ timeout: 30000 });
    // STEP SEED.3: CLICK Create New, then CLICK New Leave Application
    await beforeNavigate(page);
    await expect(async () => {
      await page.getByRole('button', { name: 'plus Create New down' }).click();
      await expect(page.getByRole('link', { name: 'New Leave Application' })).toBeVisible({ timeout: 3000 });
      await page.getByRole('link', { name: 'New Leave Application' }).click({ timeout: 3000 });
    }).toPass({ timeout: 30000 });
    await expect(page).toHaveURL(/sagov-leave-application-draft/, { timeout: NAV_TIMEOUT });
    await expect(page.getByRole('radio', { name: 'Myself' })).toBeChecked({ timeout: 30000 });
    // STEP SEED.4: SELECT Category `Annual Leaves` and Sub-Category `Annual Leaves`
    await selectCaptureOption(page, 'category', 'Annual Leaves');
    await selectCaptureOption(page, 'model_leaveType', 'Annual Leaves');
    await expect(captureField(page, 'model_durationType')).toBeVisible({ timeout: 30000 });
    // STEP SEED.5: CLICK the Days radio on the Duration field
    await page.getByRole('radio', { name: 'Days' }).check();
    // STEP SEED.6: TYPE Start Date and End Date with the same future weekday (retry on overlap)
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
    // STEP SEED.7: TYPE Address with `265 West Avenue`
    await captureField(page, 'model_addressDuringLeavePeriod').getByRole('textbox').fill('265 West Avenue');
    // STEP SEED.8: CLICK the certification checkbox, then CLICK Submit
    await page.getByRole('checkbox').check();
    await beforeNavigate(page);
    await page.getByRole('button', { name: 'Submit' }).click();
    // STEP SEED.9: CLICK Don't Delegate on the Delegate pop-up
    const delegate = page.getByRole('dialog', { name: 'Delegate' });
    await expect(delegate).toBeVisible({ timeout: SUBMIT_TIMEOUT });
    await beforeNavigate(page);
    await delegate.getByRole('button', { name: "Don't Delegate" }).click();
    // STEP SEED.10: ASSERT (BLOCKING) the user is back on the My Items index view
    await expect(delegate).toBeHidden();
    await expect(page).toHaveURL(/my_items2/, { timeout: NAV_TIMEOUT });
    // STEP SEED.11: EXTRACT the Ref No of the new application from My Items, matching the leave dates
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
  } catch (e) {
    if (e instanceof Error) e.message = `BLOCKED by SEED — Capture (as GOV003): ${e.message}`;
    throw e;
  }
}

const sendBackDialog = (page: Page): Locator => page.getByRole('dialog', { name: 'Send Back' });
const sendBackButton = (page: Page): Locator => page.getByRole('button', { name: 'Send Back', exact: true });

// Steps 1–7, shared by every TC: open the seeded Recommend Leave item and bring up the Send Back dialog.
async function openSendBackDialog(page: Page, refNo: string) {
  // STEP 1: NAVIGATE to Workflows › Inbox (`/dynamic/Shesha.Workflow/workflows-inbox`)
  await openInbox(page);
  // STEP 2: SNAPSHOT — confirm the SaGov Leave Application row for SEED_REF with Action Required **Recommend Leave**
  const row = await findInboxRow(page, refNo, 'Recommend Leave');
  // STEP 3: CLICK the magnifying glass (search) icon on that row
  await row.getByRole('link', { name: 'search' }).click();
  // STEP 4: ASSERT the Recommend Leave details are displayed (`Recommend Leave:` and the `Ref No`)
  await expect(page).toHaveURL(/workflow-action/, { timeout: NAV_TIMEOUT });
  await expect(page.getByText('Recommend Leave:', { exact: true })).toBeVisible({ timeout: NAV_TIMEOUT });
  await expect(page.getByText(`Ref No: ${refNo}`, { exact: true })).toBeVisible({ timeout: NAV_TIMEOUT });
  // STEP 5: SNAPSHOT — confirm the Send Back button
  // SNAPSHOT: Send Back button
  await beforeNavigate(page);
  // STEP 6: CLICK the Send Back button
  await sendBackButton(page).click();
  // STEP 7: ASSERT the 'Send Back' dialog is displayed with a required **Step** picker and a required **Comments** field
  await expect(sendBackDialog(page)).toBeVisible({ timeout: 10000 });
  await expect(sendBackDialog(page).getByRole('button', { name: 'Select a User Task down' })).toBeVisible({ timeout: 10000 });
  await expect(sendBackDialog(page).getByRole('textbox')).toBeVisible();
}

async function selectNewLeaveApplicationStep(page: Page) {
  // STEP 8: CLICK the Step picker (`Select a User Task`) and CLICK the **New Leave Application** step
  // The step list loads after the picker opens and can be slow on QA — reopen it until the option shows.
  const picker = sendBackDialog(page).getByRole('button', { name: 'Select a User Task down' });
  const openMenu = page.locator('.ant-dropdown:not(.ant-dropdown-hidden)');
  const option = page.getByRole('menuitem', { name: /^New Leave Application/ });
  await expect(async () => {
    if (!(await openMenu.isVisible())) await picker.click();
    try {
      await option.click({ timeout: 10000 });
    } catch (e) {
      // Close the stale list so the next attempt reopens it and reloads the steps.
      if (await openMenu.isVisible()) await picker.click();
      throw e;
    }
  }).toPass({ timeout: 45000 });
  await expect(sendBackDialog(page).getByRole('button', { name: /^New Leave Application/ })).toBeVisible();
}

test.describe('ELEAVE-SEND-BACK — Send Back Dialog', () => {
  let seedRef: string;

  test.beforeAll(async ({ browser }) => {
    test.setTimeout(5 * 60_000);
    const page = await browser.newPage();
    try {
      seedRef = await seedRecommendLeaveItem(page);
    } finally {
      await page.close();
    }
  });

  test('TC-01: Login as Leave Recommender (GOV012)', async ({ page }) => {
    // STEP 1: NAVIGATE to https://pd-hcm-adminportal-qa.shesha.app/login
    // STEP 2: SNAPSHOT — confirm login page is visible
    // STEP 3: TYPE Username field with `GOV012`
    // STEP 4: TYPE Password field with `123qwe`
    // STEP 5: CLICK the Sign In button
    // STEP 6: WAIT for the home page to load
    await loginAs(page, RECOMMENDER);

    // ASSERT (BLOCKING): URL no longer contains `/login` and the Workflows menu item is visible
    await expect(page).not.toHaveURL(/\/login/);
    await expect(page.getByRole('menuitem', { name: 'apartment Workflows' })).toBeVisible({ timeout: NAV_TIMEOUT });
  });

  // ADO Test Case #86592: https://dev.azure.com/boxfusion/pd-Hcm/_workitems/edit/86592
  test('TC-02: System should not allow sending back a leave application without comments', async ({ page }) => {
    await loginAs(page, RECOMMENDER);
    await openSendBackDialog(page, seedRef);
    await selectNewLeaveApplicationStep(page);
    // STEP 9: SNAPSHOT — confirm the OK button (Comments left empty)
    // SNAPSHOT: OK button, Comments empty
    // STEP 10: CLICK the OK button
    await sendBackDialog(page).getByRole('button', { name: 'OK' }).click();

    // ASSERT (BLOCKING): "This field is required" is shown under Comments and the 'Send Back' dialog stays open
    await expect(sendBackDialog(page).getByRole('alert').filter({ hasText: 'This field is required' })).toBeVisible();
    await expect(sendBackDialog(page)).toBeVisible();
    await expect(page).toHaveURL(/workflow-action/);
  });

  // ADO Test Case #86594: https://dev.azure.com/boxfusion/pd-Hcm/_workitems/edit/86594
  test("TC-03: Close the dialog when the 'Cancel' button is clicked", async ({ page }) => {
    await loginAs(page, RECOMMENDER);
    await openSendBackDialog(page, seedRef);
    // STEP 8: SNAPSHOT — confirm the Cancel button in the dialog
    // SNAPSHOT: Cancel button in the dialog
    // STEP 9: CLICK the Cancel button
    await sendBackDialog(page).getByRole('button', { name: 'Cancel' }).click();

    // ASSERT (BLOCKING): The 'Send Back' dialog is no longer visible
    await expect(sendBackDialog(page)).toBeHidden({ timeout: 10000 });
  });

  // ADO Test Case #86595: https://dev.azure.com/boxfusion/pd-Hcm/_workitems/edit/86595
  test("TC-04: Display leave application details when the 'Close' (X) button is clicked", async ({ page }) => {
    await loginAs(page, RECOMMENDER);
    const refNo = seedRef;
    await openSendBackDialog(page, refNo);
    // STEP 8: SNAPSHOT — confirm the Close (X) button in the dialog header
    // SNAPSHOT: Close (X) button in the dialog header
    // STEP 9: CLICK the Close (X) button
    await sendBackDialog(page).getByRole('button', { name: 'Close', exact: true }).click();

    // ASSERT (BLOCKING): The 'Send Back' dialog is no longer visible, and the Recommend Leave details (same `Ref No`) and the Send Back button are still displayed
    await expect(sendBackDialog(page)).toBeHidden({ timeout: 10000 });
    await expect(page.getByText('Recommend Leave:', { exact: true })).toBeVisible();
    await expect(page.getByText(`Ref No: ${refNo}`)).toBeVisible();
    await expect(sendBackButton(page)).toBeVisible();
  });

  // ADO Test Case #86590: https://dev.azure.com/boxfusion/pd-Hcm/_workitems/edit/86590
  test("TC-05: The 'Ok' button sends the leave application back to the selected step", async ({ page, browser }) => {
    test.setTimeout(240_000);
    await loginAs(page, RECOMMENDER);
    // STEP 4: ASSERT the Recommend Leave details show `Ref No: SEED_REF` (checked in openSendBackDialog)
    const refNo = seedRef;
    await openSendBackDialog(page, refNo);
    await selectNewLeaveApplicationStep(page);
    // STEP 9: TYPE Comments with `Send back - regression test`
    await sendBackDialog(page).getByRole('textbox').fill('Send back - regression test');
    // STEP 10: CLICK the OK button
    await sendBackDialog(page).getByRole('button', { name: 'OK' }).click();
    // STEP 11: ASSERT the user is returned to the Incoming Items view and the application is no longer in GOV012's Inbox
    await expect(page).toHaveURL(/workflows-inbox/, { timeout: NAV_TIMEOUT });
    await expect(page.getByRole('heading', { name: 'Incoming Items' })).toBeVisible({ timeout: NAV_TIMEOUT });
    await expect(page.getByRole('row').filter({ hasText: refNo })).toHaveCount(0, { timeout: 15000 });

    // STEP 12: Log in as GOV003 / 123qwe and NAVIGATE to Workflows › Inbox
    const applicantContext = await browser.newContext();
    const applicant = await applicantContext.newPage();
    try {
      await loginAs(applicant, APPLICANT);
      await openInbox(applicant);
      // ASSERT (BLOCKING): The application (same `Ref No`) is in GOV003's Inbox with Action Required **New Leave Application** and status **Referred Back To Capturer**
      const sentBack = applicant.getByRole('row').filter({ hasText: refNo });
      await expect(sentBack).toBeVisible({ timeout: NAV_TIMEOUT });
      await expect(sentBack.getByRole('cell', { name: 'New Leave Application', exact: true })).toBeVisible();
      await expect(sentBack.getByRole('cell', { name: 'Referred Back To Capturer', exact: true })).toBeVisible();
    } finally {
      await applicantContext.close();
    }
  });
});
