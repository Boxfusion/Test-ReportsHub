// AUTO-RECORDED from test-plans/HCM/eLeave/hourly-leave-lifecycle.md
// The .md plan is canonical. AI-repair will patch failing lines in this file.
// Do not hand-edit unless you are also updating the .md plan.
//
// Split from hourly-leave.spec.ts on 2026-10-07. Selectors recorded live against QA that day
// (LA2026/13762 = A, LA2026/13780 = B, LC:2026-21394 declined, LC:2026-21402 completed). TCs run
// serially and pass dates and Ref Nos forward. Those Ref Nos were GOV003's; the applicant is now GOV005
// (2026-10-07), whose form has no Myself / Someone else choice and no PERSAL No field.
//
// The accumulated-leave note and contributing-leaves grid (TC-06, TC-07) were first verified as
// GOV005 on 2026-10-07 (LA2026/13860 from LA2026/13852 + LA2026/13858).

import { test, expect, Page, Locator } from '@playwright/test';

const APP_URL = 'https://pd-hcm-adminportal-qa.shesha.app/';
const APPLICANT = { user: 'GOV005', password: '123qwe' };
const RECOMMENDER = { user: 'GOV012', password: '123qwe' };
const APPROVER = { user: 'GOV022', password: '123qwe' };
const ADMIN = { user: 'admin', password: 'P@ssw0rd' };
const INBOX_URL = `${APP_URL}dynamic/Shesha.Workflow/workflows-inbox`;
const MY_ITEMS_URL = `${APP_URL}dynamic/SaGov.Leave/my_items2`;
const MY_BALANCES_URL = `${APP_URL}dynamic/Shesha.Leave/my-leave-balances`;
const ADMIN_BALANCES_URL = `${APP_URL}dynamic/SaGov.Leave/sagov-personal-balances`;
const PERSAL_NO = 'GOV00500'; // GOV005 (Andrew Smith)
const NAV_TIMEOUT = 30000;

// Let the current page finish loading before an action that navigates away. Shesha pages keep
// loading data after render, and navigating mid-load makes runs flaky.
async function beforeNavigate(page: Page) {
  await page.waitForLoadState('networkidle', { timeout: NAV_TIMEOUT }).catch(() => {});
  await page.waitForTimeout(1000);
}

// QA's login page sometimes hangs on "Initializing..." for 30s+; reload it instead of failing the TC.
async function loginAs(page: Page, account: { user: string; password: string }) {
  await expect(async () => {
    await page.goto(`${APP_URL}login`, { timeout: NAV_TIMEOUT });
    await expect(page.getByRole('textbox', { name: 'Username' })).toBeVisible({ timeout: NAV_TIMEOUT });
  }).toPass({ timeout: 150000 });
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
// Hourly fields: `dateOfLeave` (Date), `From` (Start Time), `To` (End Time).
const formItem = (page: Page, key: string): Locator =>
  page.locator(`.ant-form-item:has(label[for="${key}"])`);

async function selectOption(page: Page, key: string, title: string) {
  await formItem(page, key).locator('.ant-select').click();
  const openDropdown = page.locator('.ant-select-dropdown:not(.ant-select-dropdown-hidden)');
  await openDropdown.locator(`.ant-select-item-option[title="${title}"]`).click();
  await expect(openDropdown).toHaveCount(0);
}

// FRAGILE: the time picker panel has no accessible names; cells are whole hours 00–23.
// A click on a cell can be lost while the panel scrolls to the current value, so retry until the
// input shows the picked hour.
async function pickTime(page: Page, key: 'From' | 'To', hh: string) {
  const input = formItem(page, key).locator('input');
  const panel = page.locator('.ant-picker-dropdown:not(.ant-picker-dropdown-hidden)');
  await expect(async () => {
    if (await panel.count() === 0) await input.click();
    await panel.locator('.ant-picker-time-panel-cell-inner', { hasText: new RegExp(`^${hh}$`) }).click();
    await panel.getByRole('button', { name: 'OK' }).click();
    await expect(panel).toHaveCount(0, { timeout: 3000 });
    await expect(input).toHaveValue(hh, { timeout: 2000 });
  }).toPass({ timeout: 20000 });
}

async function setDate(page: Page, date: string) {
  const input = formItem(page, 'dateOfLeave').locator('input');
  await input.click();
  await input.fill(date);
  await input.press('Enter');
  await page.waitForTimeout(1000);
}

async function setHours(page: Page, from: string, to: string) {
  await pickTime(page, 'From', from);
  await pickTime(page, 'To', to);
  await page.waitForTimeout(1500);
}

// FRAGILE: validation messages render in a markdown block (no role); it is rendered twice, so take
// the first. It refreshes on Submit, so read it after clicking Submit.
const validationBlock = (page: Page): Locator =>
  page.locator('.markdown-body').filter({ hasText: 'The following errors were detected during validation.' }).first();

const hoursHint = (page: Page) => page.getByText(/Great! You have selected to take .* off/);
const priorHourlyNote = (page: Page) => page.getByText(/Note: You have applied for .* of leave before/);

function fmt(d: Date): string {
  return `${String(d.getDate()).padStart(2, '0')}/${String(d.getMonth() + 1).padStart(2, '0')}/${d.getFullYear()}`;
}
const randomBetween = (min: number, max: number) => min + Math.floor(Math.random() * (max - min + 1));
// A random future weekday in this leave year. Stops before 16 Dec to stay clear of the December
// public holidays (balances are configured per calendar-year cycle).
function randomWeekday(): string {
  const now = new Date();
  const last = new Date(now.getFullYear(), 11, 15);
  const span = Math.floor((last.getTime() - now.getTime()) / 86_400_000);
  const d = new Date();
  d.setDate(d.getDate() + randomBetween(7, Math.max(7, span)));
  while (d.getDay() === 0 || d.getDay() === 6) d.setDate(d.getDate() + 1);
  return fmt(d);
}
// "5 hours 1 minute" / "2 hours" / "45 minutes" → minutes
function toMinutes(text: string): number {
  const h = /(\d+)\s*hour/.exec(text);
  const m = /(\d+)\s*minute/.exec(text);
  return (h ? Number(h[1]) * 60 : 0) + (m ? Number(m[1]) : 0);
}
// Working minutes of an 08:00–`end` request on the QA calendar (08:00–16:00, lunch 12:00–13:00).
const workMinutesFrom8 = (end: number) => (end <= 12 ? end - 8 : end - 9) * 60;

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

// Non-blocking ASSERT: a failure is reported as a test annotation and in the log, but does not fail
// the test — in serial mode a failed test skips every later TC, and the plan reserves that for
// (BLOCKING) assertions.
async function nonBlocking(description: string, check: () => Promise<void>) {
  try {
    await check();
  } catch (e) {
    const message = `[FAIL] ${description}: ${String((e as Error).message).split('\n')[0]}`;
    console.warn(message);
    test.info().annotations.push({ type: 'non-blocking failure', description: message });
  }
}

const cellText = async (row: Locator, index: number) => (await row.getByRole('cell').nth(index).innerText()).trim();

// "30/11/2026" → "Mon 30 Nov 26", the date format in the My Items Name column. Fixed names, because
// Intl's en-GB short month for September is "Sept" while the app shows "Sep".
const DAYS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
const MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
function nameDate(ddmmyyyy: string): string {
  const [dd, mm, yyyy] = ddmmyyyy.split('/').map(Number);
  const d = new Date(yyyy, mm - 1, dd);
  return `${DAYS[d.getDay()]} ${String(dd).padStart(2, '0')} ${MONTHS[mm - 1]} ${String(yyyy).slice(-2)}`;
}

// The accumulated leave is a 1-day Annual Leaves application on the date of the hourly leave that
// completed the day (recorded 2026-10-08: LA2026/13974 on B's date). B's date is picked free of
// other leave, so this row can only be the accumulated one.
const accumulatedRow = (page: Page, date: string): Locator => {
  const label = nameDate(date);
  return page.getByRole('row')
    .filter({ hasText: 'SaGov Leave Application' })
    .filter({ hasText: '1 day Annual Leaves' })
    .filter({ hasText: `from ${label} to ${label}` })
    .first();
};

// Reload My Items until the row for `ref` shows `status` (status updates can lag the action).
async function expectMyItemStatus(page: Page, ref: string, status: string) {
  await expect(async () => {
    await openList(page, MY_ITEMS_URL, 'My Items');
    await expect(page.getByRole('row').filter({ hasText: ref }).first().getByRole('cell').nth(5))
      .toHaveText(status, { timeout: 5000 });
  }).toPass({ timeout: 90000 });
}

// Annual Leaves balance and "+N reserved" from My Leave Balances.
async function readAnnualBalance(page: Page): Promise<{ balance: number; reserved: number }> {
  await page.goto(MY_BALANCES_URL, { timeout: NAV_TIMEOUT });
  const card = page.getByText(/Annual Leaves Days/).first();
  await expect(card).toBeVisible({ timeout: NAV_TIMEOUT });
  await beforeNavigate(page);
  const text = await page.locator('.ant-layout-content').first().innerText();
  const m = /([\d.]+) Annual Leaves Days\s*\+([\d.]+) reserved but not approved\/synchronized/.exec(text);
  expect(m, 'Annual Leaves balance card').not.toBeNull();
  return { balance: Number(m![1]), reserved: Number(m![2]) };
}

// Workflows › My Items › Create New › New Leave Application, Annual Leaves / Annual Leaves.
async function openNewAnnualApplication(page: Page) {
  await openList(page, MY_ITEMS_URL, 'My Items');
  // The dropdown closes if the My Items grid re-renders while it is open, so retry open + pick.
  await expect(async () => {
    await page.getByRole('button', { name: 'plus Create New down' }).click();
    await page.getByRole('link', { name: 'New Leave Application' }).click({ timeout: 3000 });
  }).toPass({ timeout: 30000 });
  await expect(page).toHaveURL(/sagov-leave-application-draft/, { timeout: NAV_TIMEOUT });
  // GOV005's form has no Myself / Someone else choice; wait for the Category field instead.
  await expect(formItem(page, 'category')).toBeVisible({ timeout: NAV_TIMEOUT });
  await selectOption(page, 'category', 'Annual Leaves');
  await selectOption(page, 'model_leaveType', 'Annual Leaves');
  // Duration only renders once the sub-category's leave-type config loads, which can be slow on QA.
  await expect(formItem(page, 'model_durationType')).toBeVisible({ timeout: NAV_TIMEOUT });
}

async function fillAddressAndCertify(page: Page) {
  await formItem(page, 'model_addressDuringLeavePeriod').getByRole('textbox').fill('265 West Avenue');
  await page.getByRole('checkbox').check();
}

// Enter a random free weekday with the given hours; retries a new date on overlap.
async function pickFreeDate(page: Page, from: string, to: string, exclude: string[] = []): Promise<string> {
  const overlap = page.getByText('There are overlaps with existing leave requests').first();
  for (let attempt = 1; ; attempt++) {
    let date = randomWeekday();
    while (exclude.includes(date)) date = randomWeekday();
    await setDate(page, date);
    await setHours(page, from, to);
    if (await hoursHint(page).waitFor({ timeout: 8000 }).then(() => true, () => false)
      && !(await overlap.isVisible())) return date;
    if (attempt === 5) throw new Error(`No free weekday found for hourly leave after ${attempt} attempts`);
    console.log(`Leave date ${date} overlaps existing leave — retrying with a new date`);
  }
}

async function submitAndDontDelegate(page: Page): Promise<string> {
  await beforeNavigate(page);
  await page.getByRole('button', { name: 'Submit' }).click();
  const delegate = page.getByRole('dialog', { name: 'Delegate' });
  await expect(delegate).toBeVisible({ timeout: NAV_TIMEOUT });
  await beforeNavigate(page);
  await delegate.getByRole('button', { name: "Don't Delegate" }).click();
  await expect(delegate).toBeHidden();
  await expect(page).toHaveURL(/my_items2/, { timeout: NAV_TIMEOUT });
  const row = page.getByRole('row').filter({ hasText: 'SaGov Leave Application' }).first();
  await expect(row).toContainText('In Progress', { timeout: NAV_TIMEOUT });
  const ref = await cellText(row, 1);
  expect(ref).toMatch(/^LA/);
  return ref;
}

async function recommendLeave(page: Page, ref: string) {
  await loginAs(page, RECOMMENDER);
  await openInboxItem(page, ref, 'Recommend Leave');
  await page.getByRole('checkbox').check();
  await page.getByRole('button', { name: 'Recommend', exact: true }).click();
  await expectSubmittedToInbox(page);
}

// As GOV005, cancel `ref` from its details view and return the new cancellation's Ref No.
async function cancelLeave(page: Page, ref: string, comments: string): Promise<string> {
  await openList(page, MY_ITEMS_URL, 'My Items');
  const leaveName = await cellText(page.getByRole('row').filter({ hasText: ref }).first(), 3);
  await page.getByRole('row').filter({ hasText: ref }).first().getByRole('link', { name: 'search' }).click();
  await expect(page.getByRole('heading', { name: /^SaGov Leave Application:/ })).toBeVisible({ timeout: NAV_TIMEOUT });
  await beforeNavigate(page);
  await page.getByRole('button', { name: 'Cancel Leave' }).click();
  const dialog = page.getByRole('dialog', { name: 'Cancel Leave' });
  await expect(dialog).toBeVisible({ timeout: NAV_TIMEOUT });
  await dialog.getByRole('textbox').fill(comments);
  await dialog.getByRole('button', { name: 'OK' }).click();
  await expect(page.getByText('Successfully cancelled the leave')).toBeVisible({ timeout: NAV_TIMEOUT });
  await beforeNavigate(page);
  await openList(page, MY_ITEMS_URL, 'My Items');
  const row = page.getByRole('row')
    .filter({ hasText: 'SaGov Leave Cancellation' })
    .filter({ hasText: leaveName })
    .filter({ hasText: 'In Progress' })
    .first();
  await expect(row).toBeVisible({ timeout: NAV_TIMEOUT });
  const lc = await cellText(row, 1);
  expect(lc).toMatch(/^LC/);
  return lc;
}

async function recommendCancellation(page: Page, lc: string) {
  await loginAs(page, RECOMMENDER);
  await openInboxItem(page, lc, 'Recommends Cancellation');
  await page.getByRole('button', { name: 'Recommend Cancellation' }).click();
  await expectSubmittedToInbox(page);
}

// As GOV005: submit a 1-hour (09–10) hourly leave on a free date and return [date, ref].
async function submitOneHourLeave(page: Page, exclude: string[]): Promise<[string, string]> {
  await loginAs(page, APPLICANT);
  await openNewAnnualApplication(page);
  await page.getByRole('radio', { name: 'Hours' }).check();
  const date = await pickFreeDate(page, '09', '10', exclude);
  await fillAddressAndCertify(page);
  return [date, await submitAndDontDelegate(page)];
}

test.describe('ELEAVE-HOURLY-LIFECYCLE — Hourly Leave: parking, accumulation, approval and cancellation', () => {
  test.describe.configure({ mode: 'serial', timeout: 300_000 });

  const dates: string[] = []; // D1, D2, D3, D4 as they are used
  let refA = '';
  let refB = '';
  let refACC = '';
  let refC = '';
  let refD = '';
  let b0 = 0;
  let r0 = 0;
  let balanceAfterA = 0;
  let priorMinutes = 0; // {prior}: outstanding hourly leave before A
  let reserve = 1; // days reserved by A (0 when outstanding hourly leave already reserved the day)
  let remainingText = '';
  let remainingMinutes = 0;

  test('TC-01: Login as Applicant', async ({ page }) => {
    // STEP 1: NAVIGATE to https://pd-hcm-adminportal-qa.shesha.app/login
    await page.goto(`${APP_URL}login`, { timeout: NAV_TIMEOUT });
    await beforeNavigate(page);
    // STEP 2: SNAPSHOT — confirm the Username and Password fields and the Sign In button are visible
    await expect(page.getByRole('textbox', { name: 'Username' })).toBeVisible();
    await expect(page.getByRole('textbox', { name: 'Password' })).toBeVisible();
    await expect(page.getByRole('button', { name: 'Sign In' })).toBeVisible();
    // STEP 3: TYPE Username field with `GOV005`
    await page.getByRole('textbox', { name: 'Username' }).fill(APPLICANT.user);
    // STEP 4: TYPE Password field with `123qwe`
    await page.getByRole('textbox', { name: 'Password' }).fill(APPLICANT.password);
    // STEP 5: CLICK the Sign In button
    await page.getByRole('button', { name: 'Sign In' }).click();
    // STEP 6: WAIT for the home page to load
    await page.waitForLoadState('networkidle');
    // ASSERT (BLOCKING): URL no longer contains /login and the Workflows menu item is visible
    await expect(page).not.toHaveURL(/login/i, { timeout: NAV_TIMEOUT });
    await expect(page.getByRole('menuitem', { name: 'apartment Workflows' })).toBeVisible({ timeout: NAV_TIMEOUT });
  });

  test('TC-02: Applicant submits hourly leave A (2 hours)', async ({ page }) => {
    await loginAs(page, APPLICANT);
    // STEP 1: NAVIGATE to My Leave Balances and EXTRACT the Annual Leaves balance (B0) and reserved (R0)
    ({ balance: b0, reserved: r0 } = await readAnnualBalance(page));
    // STEP 2: CLICK Workflows › My Items › Create New › New Leave Application
    // STEP 3: SELECT Category `Annual Leaves`, Sub-Category `Annual Leaves`, CLICK Hours
    await openNewAnnualApplication(page);
    await page.getByRole('radio', { name: 'Hours' }).check();
    // STEP 4: TYPE Date with D1, SELECT Start Time `09`, End Time `11`
    dates[0] = await pickFreeDate(page, '09', '11');
    // STEP 5: ASSERT "Great! You have selected to take 2 hours off"; EXTRACT {prior} from "Note: You have applied for {prior} of leave before" (0 if absent)
    await expect(page.getByText('Great! You have selected to take 2 hours off')).toBeVisible({ timeout: 15000 });
    priorMinutes = 0;
    if (await priorHourlyNote(page).count() > 0) {
      const p = /You have applied for (.+?) of leave before/.exec(await priorHourlyNote(page).first().innerText());
      priorMinutes = p ? toMinutes(p[1]) : 0;
    }
    // A new accumulation reserves 1 whole day; outstanding hourly leave has already reserved it.
    reserve = priorMinutes === 0 ? 1 : 0;
    console.log(`Outstanding hourly leave before A: ${priorMinutes} min`);
    // STEP 6: TYPE Address with `265 West Avenue`, CLICK the certification checkbox, CLICK Submit
    await fillAddressAndCertify(page);
    // STEP 7: CLICK Don't Delegate on the Delegate pop-up
    // STEP 8: EXTRACT the Ref No of the new SaGov Leave Application (Ref A)
    refA = await submitAndDontDelegate(page);
    console.log(`Submitted hourly leave A ${refA} on ${dates[0]}`);
    // ASSERT (BLOCKING): Ref A is In Progress and its name mentions 2 hours of Annual Leaves
    const row = page.getByRole('row').filter({ hasText: refA }).first();
    await expect(row).toContainText('2 hours Annual Leaves');
    await expect(row).toContainText('In Progress');
    // STEP 9: NAVIGATE to My Leave Balances
    const after = await readAnnualBalance(page);
    balanceAfterA = after.balance;
    // ASSERT: if {prior} is 0 the balance drops by 1 day from B0 and reserved goes up by 1; otherwise both are unchanged
    await nonBlocking('TC-02 balance and reserved after A', async () => {
      expect(after.balance).toBeCloseTo(b0 - reserve, 3);
      expect(after.reserved).toBe(r0 + reserve);
    });
  });

  test('TC-03: Recommender recommends hourly leave A, which is parked (no approval step)', async ({ page }) => {
    // STEP 1: NAVIGATE to /login and log in as `GOV012`
    await loginAs(page, RECOMMENDER);
    // STEP 2: NAVIGATE to Workflows › Inbox
    // STEP 3: SNAPSHOT — confirm the row with Ref A and Action Required Recommend Leave
    // STEP 4: CLICK the magnifying-glass icon on that row
    await openInboxItem(page, refA, 'Recommend Leave');
    // STEP 5: ASSERT Duration Type = Hours and Start / End show D1 09:00 / 11:00
    await expect(page.getByRole('radio', { name: 'Hours' })).toBeChecked();
    // Recorded 2026-10-07: the Recommend view showed dates only (no times).
    await nonBlocking('TC-03 Recommend view shows Start D1 09:00 / End D1 11:00', async () => {
      await expect(formItem(page, 'model_leaveFrom')).toContainText(`${dates[0]} 09:00`);
      await expect(formItem(page, 'model_leaveTo')).toContainText(`${dates[0]} 11:00`);
    });
    // STEP 6: CLICK the acknowledgement checkbox, CLICK Recommend
    await page.getByRole('checkbox').check();
    await page.getByRole('button', { name: 'Recommend', exact: true }).click();
    // ASSERT (BLOCKING): "Successfully Submitted" is shown and the user is back on Incoming Items
    await expectSubmittedToInbox(page);
    // STEP 7: Log in as `GOV022` and open Workflows › Inbox
    await loginAs(page, APPROVER);
    await openList(page, INBOX_URL, 'Incoming Items');
    // ASSERT (BLOCKING): GOV022's Inbox has no Approve Leave item for Ref A
    await expect(page.getByRole('row').filter({ hasText: refA })).toHaveCount(0, { timeout: 15000 });
    // STEP 8: Log in as `GOV005` and open Workflows › My Items
    await loginAs(page, APPLICANT);
    // ASSERT (BLOCKING): Ref A has status Hourly Parked
    await expectMyItemStatus(page, refA, 'Hourly Parked');
  });

  test('TC-04: A second leave on the same date is rejected', async ({ page }) => {
    await loginAs(page, APPLICANT);
    // STEP 1: open a New Leave Application (Annual Leaves, Hours)
    await openNewAnnualApplication(page);
    await page.getByRole('radio', { name: 'Hours' }).check();
    // STEP 2: TYPE Date with D1, SELECT Start Time `13`, End Time `15`
    await setDate(page, dates[0]);
    await setHours(page, '13', '15');
    // STEP 3: Complete Address and the checkbox, CLICK Submit
    await fillAddressAndCertify(page);
    await page.getByRole('button', { name: 'Submit' }).click();
    // ASSERT (BLOCKING): "There are overlaps with existing leave requests" and no Delegate pop-up
    await expect(validationBlock(page)).toContainText('There are overlaps with existing leave requests', { timeout: 15000 });
    await expect(page.getByRole('dialog', { name: 'Delegate' })).toHaveCount(0);
  });

  test('TC-05: Remaining hours: note, limit and hourly leave B', async ({ page }) => {
    await loginAs(page, APPLICANT);
    // STEP 1: open a New Leave Application (Annual Leaves, Hours), TYPE Date with D2
    await openNewAnnualApplication(page);
    await page.getByRole('radio', { name: 'Hours' }).check();
    dates[1] = await pickFreeDate(page, '09', '10', [dates[0]]);
    // STEP 2: EXTRACT {before}, {remaining} and {full} from the note
    const note = priorHourlyNote(page);
    await expect(note).toBeVisible({ timeout: 15000 });
    const m = /You have applied for (.+?) of leave before\. You have (.+?) left to reach a full day \((.+?)\)\./
      .exec(await note.innerText());
    expect(m, 'remaining-hours note').not.toBeNull();
    const [, before, remaining, full] = m!;
    remainingText = remaining;
    remainingMinutes = toMinutes(remaining);
    // ASSERT (BLOCKING): {before} is {prior} + 2 hours and {before} + {remaining} = {full}
    expect(toMinutes(before)).toBe(priorMinutes + 120);
    expect(toMinutes(before) + remainingMinutes).toBe(toMinutes(full));
    // STEP 3: SELECT a Start/End longer than {remaining} inside the work day, Submit
    const tooLongEnd = [9, 10, 11, 13, 14, 15, 16].find(e => workMinutesFrom8(e) > remainingMinutes)!;
    await setHours(page, '08', String(tooLongEnd).padStart(2, '0'));
    await fillAddressAndCertify(page);
    await page.getByRole('button', { name: 'Submit' }).click();
    // ASSERT (BLOCKING): "Leave duration should not be more than {remaining}." and nothing is submitted
    await expect(validationBlock(page)).toContainText(`Leave duration should not be more than ${remainingText}.`, { timeout: 15000 });
    await expect(page.getByRole('dialog', { name: 'Delegate' })).toHaveCount(0);
    // STEP 4: SELECT a Start/End that equals exactly {remaining}
    // The picker only offers whole hours, so take the longest 08:00 window that fits {remaining}.
    // Recorded 2026-10-07: {remaining} was "5 hours 1 minute", so B was 08–14 (5 hours).
    const exactEnd = [16, 15, 14, 13, 11, 10, 9].find(e => workMinutesFrom8(e) <= remainingMinutes)!;
    await setHours(page, '08', String(exactEnd).padStart(2, '0'));
    // STEP 5: CLICK Submit, then Don't Delegate
    // STEP 6: EXTRACT the Ref No of the new application (Ref B)
    refB = await submitAndDontDelegate(page);
    console.log(`Submitted hourly leave B ${refB} on ${dates[1]} (08–${exactEnd}, ${workMinutesFrom8(exactEnd)} of ${remainingMinutes} min)`);
    // ASSERT (BLOCKING): Ref B is listed In Progress in My Items
    await expect(page.getByRole('row').filter({ hasText: refB }).first()).toContainText('In Progress');
    // ASSERT: the Annual Leaves balance is unchanged from after TC-02 (no second day reserved)
    const balanceAfterB = (await readAnnualBalance(page)).balance;
    await nonBlocking('TC-05 no second day reserved for B', async () => {
      expect(balanceAfterB).toBeCloseTo(balanceAfterA, 3);
    });
    // STEP 7: open My Items and NOTE whether the accumulated 1-day leave on D2 already exists (informational)
    // The plan expects accumulation only after B is recommended (TC-06). On 2026-10-08 it already
    // existed at this point (LA2026/13974), so record when it fires without failing the run.
    await openList(page, MY_ITEMS_URL, 'My Items');
    if (await accumulatedRow(page, dates[1]).isVisible()) {
      const early = await cellText(accumulatedRow(page, dates[1]), 1);
      console.log(`[NOTE] TC-05 accumulated leave ${early} already exists before Ref B is recommended`);
      test.info().annotations.push({ type: 'note', description: `Accumulated leave ${early} was created on Ref B's submission, before it was recommended` });
    }
  });

  test('TC-06: Recommending B completes a full day; an accumulated leave is created', async ({ page }) => {
    // STEP 1: Log in as `GOV012`, open the Recommend Leave item for Ref B, tick the checkbox, CLICK Recommend
    // ASSERT (BLOCKING): "Successfully Submitted" is shown
    await recommendLeave(page, refB);
    // STEP 2: Log in as `GOV005`, open My Items, WAIT (refresh, up to ~3 minutes) for the 1-day Annual Leaves application on D2
    // Recorded 2026-10-07: as GOV003 (full day "7 hours 1 minute") no accumulated leave was ever
    // created (ADO #117805); as GOV005 (full day 8 hours) it appears within about a minute.
    await loginAs(page, APPLICANT);
    await expect(async () => {
      await openList(page, MY_ITEMS_URL, 'My Items');
      // ASSERT (BLOCKING): a 1 day Annual Leaves application on D2 (Ref ACC) is listed In Progress
      await expect(accumulatedRow(page, dates[1]), `accumulated 1-day leave on ${dates[1]}`).toBeVisible({ timeout: 5000 });
    }).toPass({ timeout: 180000, intervals: [15000] });
    refACC = await cellText(accumulatedRow(page, dates[1]), 1);
    // STEP 3: EXTRACT its Ref No (Ref ACC)
    console.log(`Accumulated leave ${refACC} created from ${refA} + ${refB}`);
    await expect(page.getByRole('row').filter({ hasText: refACC }).first()).toContainText('In Progress');
    // ASSERT (BLOCKING): Ref A and Ref B both have status Accumulated
    await expect(page.getByRole('row').filter({ hasText: refA }).first().getByRole('cell').nth(5)).toHaveText('Accumulated');
    await expect(page.getByRole('row').filter({ hasText: refB }).first().getByRole('cell').nth(5)).toHaveText('Accumulated');
    // STEP 3 (cont.): open Ref ACC
    await page.getByRole('row').filter({ hasText: refACC }).first().getByRole('link', { name: 'search' }).click();
    await expect(page.getByRole('heading', { name: /^SaGov Leave Application:/ })).toBeVisible({ timeout: NAV_TIMEOUT });
    await beforeNavigate(page);
    // ASSERT: the accumulated-leave note and a grid listing Ref A and Ref B with Num Work Minutes 120 and {remaining}
    await nonBlocking('TC-06 accumulated-leave note and contributing-leaves grid', async () => {
      await expect(page.getByText('Note: This leave was generated from accumulated hourly leaves taken earlier. See details below.')).toBeVisible();
      await expect(page.getByRole('row').filter({ hasText: refA })).toContainText('120');
      await expect(page.getByRole('row').filter({ hasText: refB })).toContainText(String(remainingMinutes));
    });
    // ASSERT: the Cancel Leave button is not available on Ref A / Ref B (status Accumulated)
    for (const ref of [refA, refB]) {
      await openList(page, MY_ITEMS_URL, 'My Items');
      await page.getByRole('row').filter({ hasText: ref }).first().getByRole('link', { name: 'search' }).click();
      await expect(page.getByRole('heading', { name: /^SaGov Leave Application:/ })).toBeVisible({ timeout: NAV_TIMEOUT });
      await beforeNavigate(page);
      // Recorded 2026-10-07: Cancel Leave was still offered on an Accumulated leave (bug log 2026-10-07-hourly-leave-lifecycle).
      await nonBlocking(`TC-06 Cancel Leave is not offered on Accumulated ${ref}`, () =>
        expect(page.getByRole('button', { name: 'Cancel Leave' })).toHaveCount(0));
    }
  });

  test('TC-07: Approver approves the accumulated full day', async ({ page }) => {
    // STEP 1: Log in as `GOV022`, open Inbox
    await loginAs(page, APPROVER);
    // STEP 2: SNAPSHOT — confirm the row with Ref ACC and Action Required Approve Leave
    // STEP 3: CLICK the magnifying-glass icon
    await openInboxItem(page, refACC, 'Approve Leave');
    // ASSERT: the accumulated-leave note and the grid with Ref A and Ref B are shown
    await nonBlocking('TC-07 accumulated-leave note and contributing-leaves grid', async () => {
      await expect(page.getByText('Note: This leave was generated from accumulated hourly leaves taken earlier. See details below.')).toBeVisible();
      await expect(page.getByRole('row').filter({ hasText: refA })).toHaveCount(1);
      await expect(page.getByRole('row').filter({ hasText: refB })).toHaveCount(1);
    });
    // STEP 4: CLICK the acknowledgement checkbox, CLICK Approve with Full Pay
    await page.getByRole('checkbox').check();
    await page.getByRole('button', { name: 'Approve with Full Pay' }).click();
    // ASSERT (BLOCKING): "Successfully Submitted" is shown and the user is back on Incoming Items
    await expectSubmittedToInbox(page);
    // ASSERT: in GOV005's My Items, Ref ACC moves past In Progress (e.g. Generate PERSAL input)
    await loginAs(page, APPLICANT);
    await nonBlocking('TC-07 Ref ACC moves past In Progress', () =>
      expect(async () => {
        await openList(page, MY_ITEMS_URL, 'My Items');
        await expect(page.getByRole('row').filter({ hasText: refACC }).first().getByRole('cell').nth(5))
          .not.toHaveText('In Progress', { timeout: 5000 });
      }).toPass({ timeout: 90000 }));
  });

  test('TC-08: Balance is charged exactly one whole day', async ({ page }) => {
    // STEP 1: As GOV005, NAVIGATE to My Leave Balances
    await loginAs(page, APPLICANT);
    const after = await readAnnualBalance(page);
    // ASSERT (BLOCKING): exactly 1 whole day charged — {prior} 0: B0 − 1 and R0; {prior} > 0: B0 and R0 − 1
    expect(after.balance).toBeCloseTo(b0 - reserve, 3);
    expect(after.reserved).toBe(r0 + reserve - 1);
    // STEP 2: As admin, open SaGov Leave Management › Leave Balances, the magnifying glass on GOV005's
    // current-cycle Annual Leaves row, and look at Charges
    await loginAs(page, ADMIN);
    await openList(page, ADMIN_BALANCES_URL, 'Leave Balances');
    // FRAGILE: antd pagination size changer has no accessible name
    const sizeChanger = page.locator('.ant-pagination-options .ant-select');
    if (!(await sizeChanger.innerText()).includes('100 / page')) {
      await sizeChanger.click();
      await page.locator('.ant-select-dropdown:not(.ant-select-dropdown-hidden)')
        .filter({ hasText: '100 / page' }).getByText('100 / page', { exact: true }).click();
      await beforeNavigate(page);
    }
    const balanceRow = page.getByRole('row').filter({ hasText: PERSAL_NO }).filter({ hasText: 'Annual Leaves' }).filter({ hasText: 'Yes' }).first();
    await expect(balanceRow).toBeVisible({ timeout: NAV_TIMEOUT });
    await balanceRow.getByRole('img', { name: 'search' }).click();
    await expect(page).toHaveURL(/sagov-leave-cycle-balance-details/, { timeout: NAV_TIMEOUT });
    await expect(page.getByRole('columnheader', { name: 'Days Count' })).toBeVisible({ timeout: NAV_TIMEOUT });
    // ASSERT: Charges has exactly one row for this accumulation — on Ref A (it reserved the day) with
    // Days Count 1, Minutes Count = the full day and status Approved — and none for Ref B / Ref ACC
    // Recorded 2026-10-07 (GOV005): LA2026/13852 | 1 | 480 | Approved.
    await nonBlocking('TC-08 one Approved charge row on Ref A for the full day', async () => {
      const charge = page.getByRole('row').filter({ hasText: refA });
      await expect(charge).toHaveCount(1);
      await expect(charge.getByRole('cell').nth(2)).toHaveText('1');
      await expect(charge.getByRole('cell').nth(3)).toHaveText(String(120 + remainingMinutes));
      await expect(charge.getByRole('cell').nth(4)).toHaveText('Approved');
      await expect(page.getByRole('row').filter({ hasText: refB })).toHaveCount(0);
      await expect(page.getByRole('row').filter({ hasText: refACC })).toHaveCount(0);
    });
  });

  test('TC-09: Cancelling a parked hourly leave releases its hours', async ({ page }) => {
    // STEP 1: As GOV005, submit hourly leave C on D3, `09`–`10`, Don't Delegate. EXTRACT Ref C
    [dates[2], refC] = await submitOneHourLeave(page, dates);
    console.log(`Submitted hourly leave C ${refC} on ${dates[2]}`);
    // STEP 2: As GOV012, recommend Ref C. ASSERT Ref C is Hourly Parked in GOV005's My Items
    await recommendLeave(page, refC);
    await loginAs(page, APPLICANT);
    await expectMyItemStatus(page, refC, 'Hourly Parked');
    // STEP 3: As GOV005, open Ref C, CLICK Cancel Leave, TYPE comments, CLICK OK
    // ASSERT (BLOCKING): "Successfully cancelled the leave" and a SaGov Leave Cancellation for Ref C is In Progress
    const lc = await cancelLeave(page, refC, 'Cancel hourly leave - regression test');
    // STEP 4: As GOV012, open the Recommends Cancellation item, CLICK Recommend Cancellation
    await recommendCancellation(page, lc);
    // ASSERT (BLOCKING): the cancellation shows Cancellation Completed with Ref C Cancelled
    await loginAs(page, APPLICANT);
    await expectMyItemStatus(page, lc, 'Cancellation Completed');
    await expectMyItemStatus(page, refC, 'Cancelled');
    // STEP 5: As GOV005, open a New Leave Application (Annual Leaves, Hours) on D4, then close it
    await openNewAnnualApplication(page);
    await page.getByRole('radio', { name: 'Hours' }).check();
    dates[3] = await pickFreeDate(page, '09', '10', dates);
    // ASSERT: no "Note: You have applied for … before" note, and C's reserved day is back on the balance
    await nonBlocking('TC-09 no prior-hours note after C is cancelled', () =>
      expect(priorHourlyNote(page)).toHaveCount(0));
    const after = await readAnnualBalance(page);
    await nonBlocking("TC-09 C's reserved day is back on the balance", async () => {
      expect(after.balance).toBeCloseTo(b0 - reserve, 3);
      expect(after.reserved).toBe(r0 + reserve - 1);
    });
  });

  test('TC-10: Declining the cancellation puts the hourly leave back to Hourly Parked; it can\'t be cancelled again', async ({ page }) => {
    // STEP 1: As GOV005, submit hourly leave D on D4, `09`–`10`, Don't Delegate. EXTRACT Ref D
    [dates[3], refD] = await submitOneHourLeave(page, dates.slice(0, 3));
    console.log(`Submitted hourly leave D ${refD} on ${dates[3]}`);
    // STEP 2: As GOV012, recommend Ref D (it becomes Hourly Parked)
    await recommendLeave(page, refD);
    await loginAs(page, APPLICANT);
    await expectMyItemStatus(page, refD, 'Hourly Parked');
    // STEP 3: As GOV005, CLICK Cancel Leave on Ref D, TYPE comments, CLICK OK
    const lc = await cancelLeave(page, refD, 'Cancel hourly leave - decline test');
    // STEP 4: As GOV012, open the Recommends Cancellation item, CLICK Decline Cancellation, TYPE comments, CLICK OK
    await loginAs(page, RECOMMENDER);
    await openInboxItem(page, lc, 'Recommends Cancellation');
    await page.getByRole('button', { name: 'Decline Cancellation' }).click();
    const decline = page.getByRole('dialog', { name: 'Decline Leave Cancellation' });
    await expect(decline).toBeVisible({ timeout: NAV_TIMEOUT });
    await expect(decline).toContainText('You are about to decline a leave cancellation. Please provide comments.');
    await decline.getByRole('textbox').fill('Decline hourly cancellation - regression test');
    await decline.getByRole('button', { name: 'OK' }).click();
    // ASSERT (BLOCKING): "Successfully Submitted" is shown
    await expectSubmittedToInbox(page);
    // STEP 5: As GOV005, open My Items
    await loginAs(page, APPLICANT);
    // ASSERT (BLOCKING): Ref D is Hourly Parked again and its cancellation has status Declined
    await expectMyItemStatus(page, refD, 'Hourly Parked');
    await expectMyItemStatus(page, lc, 'Declined');
    const leaveName = await cellText(page.getByRole('row').filter({ hasText: refD }).first(), 3);
    // STEP 6: As GOV005, open Ref D, CLICK Cancel Leave, TYPE comments, CLICK OK
    // A leave can be cancelled only once, so the second cancellation must be refused.
    await page.getByRole('row').filter({ hasText: refD }).first().getByRole('link', { name: 'search' }).click();
    await expect(page.getByRole('heading', { name: /^SaGov Leave Application:/ })).toBeVisible({ timeout: NAV_TIMEOUT });
    await beforeNavigate(page);
    const cancelButton = page.getByRole('button', { name: 'Cancel Leave' });
    if (await cancelButton.count() > 0) {
      await cancelButton.click();
      const dialog = page.getByRole('dialog', { name: 'Cancel Leave' });
      await expect(dialog).toBeVisible({ timeout: NAV_TIMEOUT });
      await dialog.getByRole('textbox').fill('Second cancellation - should be refused');
      await dialog.getByRole('button', { name: 'OK' }).click();
      // ASSERT (BLOCKING): the second cancellation is refused with an error, not "Successfully cancelled the leave"
      // Recorded 2026-10-07: "Failed to cancel leave" (API: "A cancellation request already exists for this application.").
      await expect(page.getByText(/Failed to cancel leave|cancellation request already exists/).first()).toBeVisible({ timeout: NAV_TIMEOUT });
      await expect(page.getByText('Successfully cancelled the leave')).toHaveCount(0);
      await page.keyboard.press('Escape');
    }
    // STEP 7: As GOV005, open My Items
    await openList(page, MY_ITEMS_URL, 'My Items');
    // ASSERT (BLOCKING): no new cancellation for Ref D (only the Declined one), and Ref D is still Hourly Parked
    const cancellations = page.getByRole('row').filter({ hasText: 'SaGov Leave Cancellation' }).filter({ hasText: leaveName });
    await expect(cancellations).toHaveCount(1);
    await expect(cancellations.first()).toContainText(lc);
    await expect(page.getByRole('row').filter({ hasText: refD }).first().getByRole('cell').nth(5)).toHaveText('Hourly Parked');
  });
});
