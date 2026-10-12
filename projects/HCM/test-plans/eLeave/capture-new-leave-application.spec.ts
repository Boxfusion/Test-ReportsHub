// AUTO-RECORDED from test-plans/eLeave/capture-new-leave-application.md
// Source: Azure DevOps test plan #116862, suite #116866
// The .md plan is canonical. AI-repair will patch failing lines in this file.
// Do not hand-edit unless you are also updating the .md plan.
//
// NOTE: each run submits a real leave application for GOV003. Dates are picked at random
// weekdays to avoid colliding with leave from earlier runs (overlapping leave blocks submission).

import { test, expect, Page, Locator } from '@playwright/test';

const APP_URL = 'https://pd-hcm-adminportal-qa.shesha.app/';
const APPLICANT = { user: 'GOV003', password: '123qwe' };
const NAV_TIMEOUT = 30000;

// Let the current page finish loading before an action that navigates away. Shesha pages keep
// loading data after render, and navigating mid-load is what made earlier runs flaky.
async function beforeNavigate(page: Page) {
  await page.waitForLoadState('networkidle', { timeout: NAV_TIMEOUT }).catch(() => {});
  await page.waitForTimeout(1000);
}

async function loginAsApplicant(page: Page) {
  await page.goto(`${APP_URL}login`, { timeout: NAV_TIMEOUT });
  await beforeNavigate(page);
  // STEP login.1: TYPE Username field with `GOV003`
  await page.getByRole('textbox', { name: 'Username' }).fill(APPLICANT.user);
  // STEP login.2: TYPE Password field with `123qwe`
  await page.getByRole('textbox', { name: 'Password' }).fill(APPLICANT.password);
  // STEP login.3: CLICK the Sign In button
  await page.getByRole('button', { name: 'Sign In' }).click();
  await page.waitForURL(url => !url.href.includes('/login'), { timeout: NAV_TIMEOUT });
  await page.waitForLoadState('networkidle');
}

// FRAGILE: Shesha form labels are not associated with their inputs, so fields are anchored on
// the label's `for` attribute (the form property name), which is stable across layout changes.
const formItem = (page: Page, key: string): Locator =>
  page.locator(`.ant-form-item:has(label[for="${key}"])`);

async function selectOption(page: Page, key: string, title: string) {
  await formItem(page, key).locator('.ant-select').click();
  const openDropdown = page.locator('.ant-select-dropdown:not(.ant-select-dropdown-hidden)');
  await openDropdown.locator(`.ant-select-item-option[title="${title}"]`).click();
  // Wait for the dropdown to finish closing so the next select doesn't match its options.
  await expect(openDropdown).toHaveCount(0);
}

// Weekday `offset` days from today (negative = past), formatted dd/mm/yyyy.
function weekday(offset: number): string {
  const d = new Date();
  d.setDate(d.getDate() + offset);
  while (d.getDay() === 0 || d.getDay() === 6) d.setDate(d.getDate() + (offset < 0 ? -1 : 1));
  return `${String(d.getDate()).padStart(2, '0')}/${String(d.getMonth() + 1).padStart(2, '0')}/${d.getFullYear()}`;
}
const randomBetween = (min: number, max: number) => min + Math.floor(Math.random() * (max - min + 1));
// Days from today to the last weekday-safe day of this year. Leave balances are configured per
// calendar-year cycle, so a future date in next year fails with "No leave balance configured".
function daysLeftInYear(): number {
  const now = new Date();
  const dec31 = new Date(now.getFullYear(), 11, 31);
  return Math.floor((dec31.getTime() - now.getTime()) / 86_400_000) - 3;
}
// Days since the first weekday-safe day of this year (keeps backdated dates in this cycle too).
function daysIntoYear(): number {
  const now = new Date();
  const jan1 = new Date(now.getFullYear(), 0, 1);
  return Math.floor((now.getTime() - jan1.getTime()) / 86_400_000) - 3;
}

const MAX_DATE_ATTEMPTS = 5;

async function captureApplication(page: Page, pickDate: () => string) {
  // STEP 1: SNAPSHOT — confirm the Workflows menu item
  // SNAPSHOT: Workflows menu item
  // STEP 2: CLICK Workflows in the side menu, then CLICK My Items
  await beforeNavigate(page);
  // A click while the home page is still loading (nprogress busy) can be swallowed and leave the
  // user on the home page, so retry open + click until the URL changes.
  await expect(async () => {
    const myItems = page.getByRole('link', { name: 'My Items' });
    if (!(await myItems.isVisible())) await page.getByRole('menuitem', { name: 'apartment Workflows' }).click();
    await myItems.click({ timeout: 5000 });
    // STEP 3: ASSERT My Items index view is displayed
    await expect(page).toHaveURL(/my_items2/, { timeout: 10000 });
  }).toPass({ timeout: 60000 });
  await expect(page.getByRole('heading', { name: 'My Items' })).toBeVisible({ timeout: 30000 });
  // STEP 4: SNAPSHOT — confirm the Create New button
  // SNAPSHOT: Create New button
  // The dropdown closes if the My Items grid re-renders while it is open, so let the page settle
  // and retry open + pick together until the navigation happens.
  await beforeNavigate(page);
  await expect(async () => {
    // STEP 5: CLICK the Create New button
    await page.getByRole('button', { name: 'plus Create New down' }).click();
    // STEP 6: ASSERT the system displays the selectable options in a drop-down list
    await expect(page.getByRole('link', { name: 'New Leave Application' })).toBeVisible({ timeout: 3000 });
    // STEP 7: CLICK New Leave Application
    await page.getByRole('link', { name: 'New Leave Application' }).click({ timeout: 3000 });
  }).toPass({ timeout: 30000 });
  // STEP 8: ASSERT the system directs the user to the new leave application page
  await expect(page).toHaveURL(/sagov-leave-application-draft/, { timeout: NAV_TIMEOUT });
  await expect(page.getByRole('radio', { name: 'Myself' })).toBeChecked({ timeout: 30000 });
  // STEP 9: SELECT Category — choose `Annual Leaves`
  await selectOption(page, 'category', 'Annual Leaves');
  // STEP 10: ASSERT leave category is selected
  await expect(formItem(page, 'category')).toContainText('Annual Leaves');
  // STEP 11: SELECT Sub-Category — choose `Annual Leaves`
  await selectOption(page, 'model_leaveType', 'Annual Leaves');
  // STEP 12: ASSERT Sub-Category is selected and the Duration field is visible
  await expect(formItem(page, 'model_leaveType')).toContainText('Annual Leaves');
  // Duration only renders once the sub-category's leave-type config loads, which can be slow on QA.
  await expect(formItem(page, 'model_durationType')).toBeVisible({ timeout: 30000 });
  // STEP 13: CLICK the Days radio on the Duration field
  await page.getByRole('radio', { name: 'Days' }).check();
  // STEP 14: ASSERT Days is selected and the Start Date / End Date fields are visible
  await expect(page.getByRole('radio', { name: 'Days' })).toBeChecked();
  const startDate = formItem(page, 'model_leaveFrom').getByRole('textbox');
  const endDate = formItem(page, 'model_leaveTo').getByRole('textbox');
  await expect(startDate).toBeVisible();
  await expect(endDate).toBeVisible();
  // Earlier runs leave real applications on GOV003, so a random date can overlap existing leave.
  // On the overlap validation error, pick a fresh date and re-enter it.
  const hint = page.getByText(/You have selected to take \d+(\.\d+)? day/);
  const overlap = page.getByText('There are overlaps with existing leave requests');
  for (let attempt = 1; ; attempt++) {
    const date = pickDate();
    // STEP 15: TYPE Start Date
    await startDate.click();
    await startDate.fill(date);
    await startDate.press('Enter');
    // STEP 16: TYPE End Date with the same or a later date
    await endDate.click();
    await endDate.fill(date);
    await endDate.press('Enter');
    // The hint only renders for valid dates; the overlap error can linger from the previous pick,
    // so wait on the hint and only retry when it doesn't show and the overlap error does.
    if (await hint.waitFor({ timeout: 8000 }).then(() => true, () => false)) break;
    if (!(await overlap.isVisible()) || attempt === MAX_DATE_ATTEMPTS) break;
    console.log(`Leave dates ${date} overlap existing leave — retrying with a new date`);
  }
  // STEP 17: ASSERT the hint shows how many days the user is taking and the available days
  await expect(hint).toBeVisible();
  await expect(page.getByText(/Available days:/).first()).toBeVisible();
  // STEP 18: TYPE Address with `265 West Avenue`
  await formItem(page, 'model_addressDuringLeavePeriod').getByRole('textbox').fill('265 West Avenue');
  // STEP 19: CLICK the certification checkbox
  await page.getByRole('checkbox').check();
  // STEP 20: ASSERT the checkbox is checked
  await expect(page.getByRole('checkbox')).toBeChecked();
  // STEP 21: CLICK the Submit button
  await beforeNavigate(page);
  await page.getByRole('button', { name: 'Submit' }).click();
}

async function dontDelegate(page: Page) {
  const delegate = page.getByRole('dialog', { name: 'Delegate' });
  await expect(delegate).toBeVisible({ timeout: 30000 });
  await beforeNavigate(page);
  await delegate.getByRole('button', { name: "Don't Delegate" }).click();
  // ASSERT (BLOCKING): The Delegate pop-up closes and the user is on the My Items index view
  await expect(delegate).toBeHidden();
  await expect(page).toHaveURL(/my_items2/, { timeout: NAV_TIMEOUT });
}

test.describe('ELEAVE-CAPTURE — Application for Leave: for Myself', () => {

  test('TC-01: Login as Applicant', async ({ page }) => {
    // STEP 1: NAVIGATE to https://pd-hcm-adminportal-qa.shesha.app/login
    await page.goto(`${APP_URL}login`, { timeout: NAV_TIMEOUT });
    await beforeNavigate(page);
    // STEP 2: SNAPSHOT — confirm login page is visible
    // SNAPSHOT: login page
    // STEP 3: TYPE Username field with `GOV003`
    await page.getByRole('textbox', { name: 'Username' }).fill(APPLICANT.user);
    // STEP 4: TYPE Password field with `123qwe`
    await page.getByRole('textbox', { name: 'Password' }).fill(APPLICANT.password);
    // STEP 5: CLICK the Sign In button
    await page.getByRole('button', { name: 'Sign In' }).click();
    // STEP 6: WAIT for the home page to load
    await page.waitForLoadState('networkidle');
    // ASSERT (BLOCKING): URL no longer contains /login and the Workflows menu item is visible
    await expect(page).not.toHaveURL(/login/i, { timeout: NAV_TIMEOUT });
    await expect(page.getByRole('menuitem', { name: 'apartment Workflows' })).toBeVisible({ timeout: 30000 });
  });

  // ADO Test Case #116867: https://dev.azure.com/boxfusion/pd-Hcm/_workitems/edit/116867
  test('TC-02: Submit a backdated leave application', async ({ page }) => {
    await loginAsApplicant(page);
    // STEPS 1–21: capture the application with a start date that has passed
    await captureApplication(page, () => weekday(-randomBetween(3, Math.max(3, Math.min(90, daysIntoYear())))));
    // STEP 22: ASSERT the system displays the backdated pop-up
    const backdated = page.getByRole('dialog', { name: 'Leave Application Comments' });
    await expect(backdated).toBeVisible({ timeout: 30000 });
    // The dialog body is a Shesha form that can render well after the dialog frame on slow QA.
    await expect(backdated).toContainText('You are about to submit a backdated leave application', { timeout: 30000 });
    // STEP 23: TYPE comments in the backdated pop-up
    await backdated.getByRole('textbox').fill('Backdated leave - regression test');
    // STEP 24: CLICK OK
    await backdated.getByRole('button', { name: 'OK' }).click();
    // STEP 25: ASSERT the comments are captured and the Delegate pop-up is displayed
    await expect(page.getByRole('dialog', { name: 'Delegate' })).toBeVisible({ timeout: 30000 });
    // STEP 26: CLICK the Don't Delegate button
    await dontDelegate(page);
  });

  // ADO Test Case #116872: https://dev.azure.com/boxfusion/pd-Hcm/_workitems/edit/116872
  test('TC-03: Submit a future dated leave application', async ({ page }) => {
    await loginAsApplicant(page);
    // STEPS 1–21: capture the application with a start date in the future
    await captureApplication(page, () => weekday(randomBetween(7, Math.max(7, daysLeftInYear()))));
    // STEP 22: ASSERT the system displays the Delegate pop-up (no backdated pop-up)
    await expect(page.getByRole('dialog', { name: 'Delegate' })).toBeVisible({ timeout: 30000 });
    await expect(page.getByRole('dialog', { name: 'Leave Application Comments' })).toHaveCount(0);
    // STEP 23: CLICK the Don't Delegate button
    await dontDelegate(page);
  });

});
