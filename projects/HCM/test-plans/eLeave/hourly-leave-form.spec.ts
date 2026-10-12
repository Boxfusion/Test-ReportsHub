// AUTO-RECORDED from test-plans/HCM/eLeave/hourly-leave-form.md
// The .md plan is canonical. AI-repair will patch failing lines in this file.
// Do not hand-edit unless you are also updating the .md plan.
//
// Split from hourly-leave.spec.ts on 2026-10-07 (selectors recorded live against QA that day).
// Nothing is submitted: TCs run serially only so TC-04 can reuse the date picked in TC-03.

import { test, expect, Page, Locator } from '@playwright/test';

const APP_URL = 'https://pd-hcm-adminportal-qa.shesha.app/';
const APPLICANT = { user: '12345678', password: '123qwe' };
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
function nextSaturday(): string {
  const d = new Date();
  d.setDate(d.getDate() + ((6 - d.getDay() + 7) % 7 || 7));
  return fmt(d);
}

// Open a Workflows list (Inbox / My Items) and wait for its grid to load.
async function openList(page: Page, url: string, heading: string) {
  await page.goto(url, { timeout: NAV_TIMEOUT });
  await expect(page.getByRole('heading', { name: heading })).toBeVisible({ timeout: NAV_TIMEOUT });
  await beforeNavigate(page);
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

// Workflows › My Items › Create New › New Leave Application, Annual Leaves / Annual Leaves.
async function openNewAnnualApplication(page: Page) {
  await openList(page, MY_ITEMS_URL, 'My Items');
  // The dropdown closes if the My Items grid re-renders while it is open, so retry open + pick.
  await expect(async () => {
    await page.getByRole('button', { name: 'plus Create New down' }).click();
    await page.getByRole('link', { name: 'New Leave Application' }).click({ timeout: 3000 });
  }).toPass({ timeout: 30000 });
  await expect(page).toHaveURL(/sagov-leave-application-draft/, { timeout: NAV_TIMEOUT });
  await expect(page.getByRole('radio', { name: 'Myself' })).toBeChecked({ timeout: NAV_TIMEOUT });
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

test.describe('ELEAVE-HOURLY-FORM — Hourly Leave: application form and validations', () => {
  test.describe.configure({ mode: 'serial', timeout: 300_000 });

  const dates: string[] = []; // D1, picked in TC-03

  test('TC-01: Login as Applicant', async ({ page }) => {
    // STEP 1: NAVIGATE to https://pd-hcm-adminportal-qa.shesha.app/login
    await page.goto(`${APP_URL}login`, { timeout: NAV_TIMEOUT });
    await beforeNavigate(page);
    // STEP 2: SNAPSHOT — confirm the Username and Password fields and the Sign In button are visible
    await expect(page.getByRole('textbox', { name: 'Username' })).toBeVisible();
    await expect(page.getByRole('textbox', { name: 'Password' })).toBeVisible();
    await expect(page.getByRole('button', { name: 'Sign In' })).toBeVisible();
    // STEP 3: TYPE Username field with `12345678`
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

  test('TC-02: Hourly option and fields on the leave application form', async ({ page }) => {
    await loginAs(page, APPLICANT);
    // STEP 1: CLICK Workflows › My Items, CLICK Create New › New Leave Application
    // STEP 2: ASSERT the new leave application form opens with Myself selected
    // STEP 3: SELECT Category `Annual Leaves`, then Sub-Category `Annual Leaves`
    await openNewAnnualApplication(page);
    // STEP 4: ASSERT the Duration* field shows the options Hours and Days
    await expect(page.getByRole('radio', { name: 'Hours' })).toBeVisible();
    await expect(page.getByRole('radio', { name: 'Days' })).toBeVisible();
    // STEP 5: CLICK Hours
    await page.getByRole('radio', { name: 'Hours' }).check();
    // ASSERT (BLOCKING): Date ("Select date"), Start Time and End Time ("Select time") are shown; Start Date / End Date are hidden
    await expect(formItem(page, 'dateOfLeave').locator('input')).toHaveAttribute('placeholder', 'Select date');
    await expect(formItem(page, 'From').locator('input')).toHaveAttribute('placeholder', 'Select time');
    await expect(formItem(page, 'To').locator('input')).toHaveAttribute('placeholder', 'Select time');
    await expect(formItem(page, 'model_leaveFrom')).toBeHidden();
    await expect(formItem(page, 'model_leaveTo')).toBeHidden();
    // STEP 6: CLICK the Start Time field
    await formItem(page, 'From').locator('input').click();
    // ASSERT: the picker lists whole hours only (00–23), no minutes column, and the input is read-only
    const panel = page.locator('.ant-picker-dropdown:not(.ant-picker-dropdown-hidden)');
    await expect(panel.locator('.ant-picker-time-panel-column')).toHaveCount(1);
    await expect(panel.locator('.ant-picker-time-panel-cell-inner'))
      .toHaveText(Array.from({ length: 24 }, (_, i) => String(i).padStart(2, '0')));
    await expect(formItem(page, 'From').locator('input')).toHaveAttribute('readonly', '');
    await page.keyboard.press('Escape');
    // STEP 7: CLICK Days, then CLICK Hours again
    await page.getByRole('radio', { name: 'Days' }).check();
    // ASSERT: with Days selected, Start Date / End Date are shown and Date / Start Time / End Time are hidden
    await expect(formItem(page, 'model_leaveFrom')).toBeVisible();
    await expect(formItem(page, 'model_leaveTo')).toBeVisible();
    await expect(formItem(page, 'dateOfLeave')).toBeHidden();
    await expect(formItem(page, 'From')).toBeHidden();
    await expect(formItem(page, 'To')).toBeHidden();
    await page.getByRole('radio', { name: 'Hours' }).check();
    await expect(formItem(page, 'dateOfLeave')).toBeVisible();
    // ASSERT: a leave type without "Allow to apply hourly leaves" (Adoption Leave on QA) has no Duration field
    await selectOption(page, 'category', 'Adoption Leave');
    await selectOption(page, 'model_leaveType', 'Adoption Leave');
    await expect(formItem(page, 'model_leaveFrom')).toBeVisible({ timeout: NAV_TIMEOUT });
    await expect(formItem(page, 'model_durationType')).toBeHidden();
  });

  test('TC-03: Duration is calculated in hours and minutes, excluding lunch', async ({ page }) => {
    await loginAs(page, APPLICANT);
    await openNewAnnualApplication(page);
    await page.getByRole('radio', { name: 'Hours' }).check();
    // STEP 1: TYPE Date with D1
    // STEP 2: SELECT Start Time `09`, End Time `11`
    dates[0] = await pickFreeDate(page, '09', '11');
    // ASSERT (BLOCKING): "Great! You have selected to take 2 hours off" and the Available days alert are shown
    await expect(page.getByText('Great! You have selected to take 2 hours off')).toBeVisible();
    await expect(page.getByText(/Available days: Please note that you only have .* day\(s\) \(current leave cycle\) left/)).toBeVisible();
    // STEP 3: SELECT Start Time `11`, End Time `14` (spans lunch)
    await setHours(page, '11', '14');
    // ASSERT (BLOCKING): still "2 hours off" — the lunch hour is excluded
    await expect(page.getByText('Great! You have selected to take 2 hours off')).toBeVisible();
    // STEP 4: SELECT Start Time `08`, End Time `16` (the whole work day)
    await setHours(page, '08', '16');
    // ASSERT: no "… hours off" alert; the request is treated as a full day (hint shows 1 day)
    await nonBlocking('TC-03 full work day shows no hours alert', () => expect(hoursHint(page)).toHaveCount(0));
    // Recorded 2026-10-07: no "1 day" hint was rendered for 08–16 (bug log 2026-10-07-hourly-leave).
    await nonBlocking('TC-03 full work day shows a 1 day hint', () =>
      expect(page.getByText(/You have selected to take 1 day/)).toBeVisible());
  });

  test('TC-04: Hourly validations block submission', async ({ page }) => {
    await loginAs(page, APPLICANT);
    await openNewAnnualApplication(page);
    await page.getByRole('radio', { name: 'Hours' }).check();
    await fillAddressAndCertify(page);
    // Rows run in an order where no row's expected message is left over from the row before it,
    // because the validation block only refreshes on Submit (c, e and f all show the weekend message).
    const WORKING_HOURS = 'Hourly leave must fall within your working hours (08:00 - 16:00).';
    // The weekend setting rejects any request with no working hours in it.
    const NO_WORKING_HOURS = 'Please make sure that the hours entered are working hours. The selected period contains only weekends or public holidays.';
    // A lunch-only request has its own message (commit d9b7001b, on QA since 2026-10-08).
    const LUNCH_ONLY = 'The selected time falls entirely within the lunch break and contains no leave hours. Please select a period outside the lunch break.';
    const rows: [string, string, string, string, string[]][] = [
      ['c', dates[0], '06', '08', [WORKING_HOURS, NO_WORKING_HOURS]],
      ['a', dates[0], '14', '10', ['End time must not be earlier than start time']],
      ['e', dates[0], '12', '13', [LUNCH_ONLY]],
      ['b', dates[0], '09', '09', ['You have not selected leave duration.']],
      ['f', nextSaturday(), '09', '11', [NO_WORKING_HOURS]],
      ['d', dates[0], '15', '18', [WORKING_HOURS]],
    ];
    for (const [id, date, from, to, messages] of rows) {
      // STEP: SELECT the row's Date / Start / End, CLICK Submit, check the message
      if (await formItem(page, 'dateOfLeave').locator('input').inputValue() !== date) await setDate(page, date);
      await setHours(page, from, to);
      await page.getByRole('button', { name: 'Submit' }).click();
      // ASSERT (BLOCKING): the expected message is shown and no "Great! … hours off" alert
      for (const message of messages) {
        await expect(validationBlock(page), `row ${id}`).toContainText(message, { timeout: 15000 });
      }
      await expect(hoursHint(page), `row ${id}`).toHaveCount(0);
      // ASSERT (BLOCKING): no Delegate pop-up and the user stays on the form
      await expect(page.getByRole('dialog', { name: 'Delegate' }), `row ${id}`).toHaveCount(0);
      await expect(page).toHaveURL(/sagov-leave-application-draft/);
    }
    // ASSERT: row g (weekday public holiday) — skipped: no confirmed weekday public holiday on QA.
    // Recorded 2026-10-07: 16/12/2026 (Wed) was accepted as a 2-hour leave, so either QA has no
    // public holiday on it or the check is missing; confirm the QA holiday calendar before adding it.
    test.info().annotations.push({ type: 'skip', description: 'TC-04 row g: no weekday public holiday on QA' });
  });
});
