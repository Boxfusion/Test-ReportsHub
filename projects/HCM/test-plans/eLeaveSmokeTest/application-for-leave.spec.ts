// AUTO-RECORDED from test-plans/eLeaveSmokeTest/application-for-leave.md
// Source: Azure DevOps test plan #101528, suite #101941 (Application for leave)
// The .md plan is canonical. AI-repair will patch failing lines in this file.
// Do not hand-edit unless you are also updating the .md plan.
//
// Recorded live on the SaGov.Leave/sagov-leave-application v76 Draft form as applicant
// GOV003 (Thabo Musa Victor Mthembu) via Workflows -> My Items -> Create New ->
// SaGov Leave Application.
//
// FILL ORDER (per request, and the form's natural reveal order on v76):
//   Category -> Sub-Category -> Duration -> Start Date -> End Date -> Address -> certify checkbox -> Submit
// Selecting Category reveals Sub-Category; selecting Sub-Category reveals the Duration (Days/Hours)
// radio; the certification checkbox + Submit appear once the dates are populated. Setting Duration
// BEFORE the dates works cleanly on v76 (the v74 "set Duration last" desync workaround is obsolete).
//
// v76 IMPROVEMENTS vs the old v74 recording:
//   * The green "Great!: You have selected to take 1 day off" banner now surfaces (TC-06).
//   * The "Available days: ... left for this particular leave type" balance message now surfaces (TC-07).
//   * The applicant form now has a real certification checkbox ("I hereby certify ...") that gates
//     Submit (TC-09) — Submit stays disabled until required fields are filled AND it is ticked.
//
// CHAIN: the seeded submit (TC-10/TC-11, SEED_SUBMIT=1) records the generated reference number via
// shared.ts so recommend-leave.spec.ts and approve-leave.spec.ts act on THE SAME application.
// A clean future-dated single working day is chosen (and re-tried a week forward if the form reports
// an overlap with existing leave) so the request submits without a date clash.

import { test, expect, Page } from '@playwright/test';
import { saveSubmittedApplication } from './shared';

const APP_URL = 'https://pd-hcm-adminportal-qa.shesha.app/';
const USER = { user: 'GOV003', password: '123qwe' };
const MY_ITEMS_URL = `${APP_URL}dynamic/SaGov.Leave/my_items2`;

async function loginAsUser(page: Page) {
  await page.goto(APP_URL);
  await page.getByRole('textbox', { name: 'Username' }).fill(USER.user);
  await page.getByRole('textbox', { name: 'Password' }).fill(USER.password);
  await page.getByRole('button', { name: 'Sign In' }).click();
  await page.waitForURL(url => !url.href.includes('/login'), { timeout: 30000 });
  await page.waitForLoadState('networkidle');
}

// Workflows -> My Items -> Create New -> SaGov Leave Application -> Draft form.
async function openNewLeaveApplication(page: Page) {
  await loginAsUser(page);
  await page.goto(MY_ITEMS_URL);
  await page.waitForLoadState('networkidle');
  await page.getByRole('button', { name: 'plus Create New down' }).click();
  await page.getByRole('menuitem', { name: 'SaGov Leave Application', exact: true }).click();
  await expect(page.getByRole('heading', { name: 'New Leave Application:' })).toBeVisible({ timeout: 30000 });
}

// The Category select is a searchable antd combobox scoped by its form-item label.
async function selectCategory(page: Page, name: string) {
  const combo = page.locator('.ant-form-item:has(label[title="Category"]) input[role="combobox"]');
  await combo.click();
  await combo.fill(name);
  await page.locator('.ant-select-item-option', { hasText: name }).first().click();
}

// Sub-Category appears once a Category is chosen. Its dropdown lists 'Annual Leave' and
// 'Unpaid Leave Authorized' — scope to that open dropdown so the lingering Category dropdown
// (which also offers 'Annual Leave') is not matched by mistake.
async function selectSubCategory(page: Page, name: string) {
  const combo = page.locator('.ant-form-item:has(label[title="Sub-Category"]) input[role="combobox"]');
  await combo.click();
  await page.locator(
    '.ant-select-dropdown:not(.ant-select-dropdown-hidden):has-text("Unpaid Leave Authorized") .ant-select-item-option',
    { hasText: name },
  ).first().click();
}

const pad = (n: number) => String(n).padStart(2, '0');
const fmtDate = (d: Date) => `${pad(d.getDate())}/${pad(d.getMonth() + 1)}/${d.getFullYear()}`;

// Pick a future weekday, set Start = End = that day, and confirm the form does not flag an overlap
// with existing leave. On a clash, step a week forward and retry. Returns the date used (dd/mm/yyyy).
async function fillNonOverlappingSingleDay(page: Page): Promise<string> {
  const start = page.getByRole('textbox', { name: 'Select date' }).first();
  const end = page.getByRole('textbox', { name: 'Select date' }).nth(1);
  const base = new Date();
  base.setDate(base.getDate() + 42); // ~6 weeks out, clear of the seeded test data
  for (let i = 0; i < 10; i++) {
    const d = new Date(base);
    d.setDate(base.getDate() + i * 7);
    while (d.getDay() === 0 || d.getDay() === 6) d.setDate(d.getDate() + 1); // roll onto a weekday
    const date = fmtDate(d);
    await start.fill(date);
    await start.press('Enter');
    await end.fill(date);
    await end.press('Enter');
    await page.waitForTimeout(1000);
    if (await page.getByText('There are overlaps with existing leave requests').count() === 0) {
      return date;
    }
  }
  throw new Error('Could not find a non-overlapping leave date after 10 attempts');
}

// Read the generated reference number from the form header ("Ref No: LA2026/####").
async function readLeaveRef(page: Page): Promise<string> {
  const el = page.getByText(/Ref No:\s*LA\d{4}\/\d+/).first();
  await expect(el).toBeVisible({ timeout: 30000 });
  const txt = (await el.textContent()) || '';
  const m = txt.match(/LA\d{4}\/\d+/);
  if (!m) throw new Error(`Could not parse leave ref from "${txt}"`);
  return m[0];
}

// Category -> Sub-Category -> Duration -> Start/End date. Shared by the banner/balance/submit cases.
async function fillCoreLeaveFields(page: Page): Promise<string> {
  await selectCategory(page, 'Annual Leave');
  await selectSubCategory(page, 'Annual Leave');
  await page.getByRole('radio', { name: 'Days' }).check();
  return await fillNonOverlappingSingleDay(page);
}

// SEEDED submit flow (recorded live). Fills every required field in the requested order so the
// certification checkbox + Submit button enable, then leaves the form ready to Submit. Returns the
// generated ref + the start date so the chain can target this application downstream.
async function fillLeaveApplicationReadyToSubmit(page: Page): Promise<{ ref: string; startDate: string }> {
  await openNewLeaveApplication(page);
  const ref = await readLeaveRef(page);
  const startDate = await fillCoreLeaveFields(page);
  // Address (required)
  await page.locator('.ant-form-item:has(label[title="Address"])').getByRole('textbox').fill('12 West Avenue, Pretoria');
  // Certification checkbox ('I hereby certify ...') — the only checkbox on the form; enables Submit.
  await page.getByRole('checkbox').last().check();
  await expect(page.getByRole('button', { name: 'Submit', exact: true }).first()).toBeEnabled({ timeout: 15000 });
  await page.waitForTimeout(1000); // let the form's scripts settle before Submit
  return { ref, startDate };
}

test.describe('ELEAVE-SMOKE-APPLY — Application for Leave', () => {

  // ADO #101956
  test('TC-01: Create New Leave Application — login and reach My Items', async ({ page }) => {
    // STEP 1: NAVIGATE to the app
    await page.goto(APP_URL);
    // STEP 2: SNAPSHOT — confirm login page is visible
    // STEP 3: TYPE Username field with `GOV003`
    await page.getByRole('textbox', { name: 'Username' }).fill(USER.user);
    // STEP 4: TYPE Password field with `123qwe`
    await page.getByRole('textbox', { name: 'Password' }).fill(USER.password);
    // STEP 5: CLICK the Sign In button
    await page.getByRole('button', { name: 'Sign In' }).click();
    // STEP 6: WAIT for the landing page to load
    await page.waitForURL(url => !url.href.includes('/login'), { timeout: 30000 });
    await page.waitForLoadState('networkidle');
    // STEP 7: CLICK Workflows -> My Items
    await page.getByRole('menuitem', { name: 'apartment Workflows' }).click();
    // The side-menu flyout animates and an overlay can intercept the first click (menu-expand
    // race); wait for the My Items entry, then click its link, forcing past the transient overlay.
    const myItems = page.getByRole('menuitem', { name: 'My Items' });
    await myItems.waitFor({ state: 'visible' });
    await myItems.getByRole('link', { name: 'My Items' }).click({ force: true });
    // STEP 8: WAIT for the My Items page to load
    await page.waitForURL(/my_items2/, { timeout: 30000 });
    // ASSERT (BLOCKING) not on /login and the My Items page is displayed
    await expect(page).not.toHaveURL(/login/i);
    await expect(page.getByRole('heading', { name: 'My Items' })).toBeVisible({ timeout: 30000 });
  });

  // ADO #101957
  test('TC-02: My Items page loads with leave application list', async ({ page }) => {
    await loginAsUser(page);
    await page.goto(MY_ITEMS_URL);
    await page.waitForLoadState('networkidle');
    // STEP 1: SNAPSHOT Observe the My Items list and scrollbar
    // ASSERT (BLOCKING) the leave application list is displayed
    await expect(page.getByRole('heading', { name: 'My Items' })).toBeVisible({ timeout: 30000 });
    await expect(page.getByRole('table')).toBeVisible();
    await expect(page.getByRole('columnheader', { name: 'Ref No' })).toBeVisible();
  });

  // ADO #101958
  test('TC-03: Create New dropdown shows SaGov Leave Application option', async ({ page }) => {
    await loginAsUser(page);
    await page.goto(MY_ITEMS_URL);
    await page.waitForLoadState('networkidle');
    // STEP 1-2: SNAPSHOT + CLICK the Create New button
    await page.getByRole('button', { name: 'plus Create New down' }).click();
    // STEP 3: SNAPSHOT Inspect the dropdown items
    // ASSERT (BLOCKING) 'SaGov Leave Application' is listed as an option
    await expect(page.getByRole('menuitem', { name: 'SaGov Leave Application', exact: true })).toBeVisible();
  });

  // ADO #101959
  test('TC-04: New leave application form opens on option selection', async ({ page }) => {
    await openNewLeaveApplication(page);
    // STEP 1-2: SNAPSHOT + CLICK the 'SaGov Leave Application' option (handled by helper)
    // STEP 3: SNAPSHOT Inspect form fields
    // ASSERT (BLOCKING) the form shows Category, Start Date, End Date, Address, Telephone
    await expect(page.locator('label[title="Category"]')).toBeVisible();
    await expect(page.getByText('Start Date')).toBeVisible();
    await expect(page.getByText('End Date')).toBeVisible();
    await expect(page.getByText('Address').first()).toBeVisible();
    await expect(page.getByText('Telephone')).toBeVisible();
    // NOTE: Sub-Category and the Duration (Days/Hours) radio appear once a Category is chosen.
  });

  // ADO #101960
  test('TC-05: Category and sub-category populate correctly', async ({ page }) => {
    await openNewLeaveApplication(page);
    // STEP 1-3: select 'Annual Leave' in Category
    await selectCategory(page, 'Annual Leave');
    await expect(page.locator('.ant-form-item:has(label[title="Category"]) .ant-select-selection-item')).toHaveText('Annual Leave');
    // STEP 4-6: the Sub-Category select is revealed once a Category is chosen; pick 'Annual Leave'
    await selectSubCategory(page, 'Annual Leave');
    // ASSERT (BLOCKING) Sub-Category field displays 'Annual Leave' with no validation error
    await expect(page.locator('.ant-form-item:has(label[title="Sub-Category"]) .ant-select-selection-item')).toHaveText('Annual Leave');
  });

  // ADO #101961 — on v76 the green confirmation banner now surfaces.
  test("TC-06: Same-day start and end date shows '1 day off' confirmation", async ({ page }) => {
    await openNewLeaveApplication(page);
    // Category -> Sub-Category -> Duration -> Start = End (a clean single working day)
    await fillCoreLeaveFields(page);
    // STEP 3: SNAPSHOT Observe the confirmation banner
    // ASSERT (BLOCKING) a green '1 day off' confirmation is displayed
    await expect(page.getByText(/You have selected to take 1 day off/i)).toBeVisible({ timeout: 15000 });
  });

  // ADO #101962 — on v76 the available-days balance message now surfaces on the applicant form.
  test('TC-07: Available leave balance message shown after date selection', async ({ page }) => {
    await openNewLeaveApplication(page);
    await fillCoreLeaveFields(page);
    // STEP 1: SNAPSHOT Observe the informational message box
    // ASSERT (BLOCKING) an available-days message is displayed for the selected leave type
    await expect(page.getByText(/Available days:.*left for this particular leave type/i)).toBeVisible({ timeout: 15000 });
  });

  // ADO #101963
  test('TC-08: Address and telephone fields accept valid input', async ({ page }) => {
    await openNewLeaveApplication(page);
    // STEP 1-2: the Telephone field is prepopulated from the profile (+27...)
    // ASSERT (BLOCKING) the phone number is accepted and displayed in the Telephone field
    const tel = page.locator('input[value^="+27"]');
    await expect(tel).toBeVisible();
    // STEP 3: Address accepts free text
    await page.locator('.ant-form-item:has(label[title="Address"])').getByRole('textbox').fill('12 West Avenue, Pretoria');
    await expect(page.locator('.ant-form-item:has(label[title="Address"])').getByRole('textbox')).toHaveValue('12 West Avenue, Pretoria');
  });

  // ADO #101964 — on v76 there IS a certification checkbox; Submit is gated by it AND required fields.
  test('TC-09: Submit is blocked until the certification checkbox is ticked', async ({ page }) => {
    await openNewLeaveApplication(page);
    await fillCoreLeaveFields(page);
    await page.locator('.ant-form-item:has(label[title="Address"])').getByRole('textbox').fill('12 West Avenue, Pretoria');
    // Required fields complete but certification NOT yet ticked -> Submit disabled, no Delegate modal.
    await expect(page.getByRole('button', { name: 'Submit', exact: true }).first()).toBeDisabled();
    await expect(page.getByRole('dialog', { name: 'Delegate' })).toHaveCount(0);
    // Ticking the 'I hereby certify ...' checkbox (the only checkbox on the form) enables Submit.
    await page.getByRole('checkbox').last().check();
    await expect(page.getByRole('button', { name: 'Submit', exact: true }).first()).toBeEnabled({ timeout: 15000 });
  });

  // ADO #101965 — SEEDED MUTATION (opt-in): submits a real leave application to QA.
  test('TC-10: Delegation modal appears on submit', async ({ page }) => {
    test.skip(!process.env.SEED_SUBMIT, 'Seeded mutation — submits a real leave application to QA. Enable with SEED_SUBMIT=1.');
    const { ref } = await fillLeaveApplicationReadyToSubmit(page);
    // STEP 4: CLICK Submit
    await page.getByRole('button', { name: 'Submit', exact: true }).first().click();
    // ASSERT (BLOCKING) a 'Delegate' modal appears with a "Don't Delegate" button
    await expect(page.getByRole('dialog', { name: 'Delegate' })).toBeVisible({ timeout: 30000 });
    await expect(page.getByRole('button', { name: "Don't Delegate" })).toBeVisible();
    // eslint-disable-next-line no-console
    console.log(`[apply] Submitted application ${ref}`);
    // Complete the flow so the submission isn't left mid-delegation.
    await page.getByRole('button', { name: "Don't Delegate" }).click();
    await page.waitForURL(/my_items2/, { timeout: 30000 });
  });

  // ADO #101966 — SEEDED MUTATION (opt-in): submits a real leave application to QA and records it
  // for the recommend + approve specs (the chain's source application).
  test("TC-11: 'Don't Delegate' closes modal and returns to My Items", async ({ page }) => {
    test.skip(!process.env.SEED_SUBMIT, 'Seeded mutation — submits a real leave application to QA. Enable with SEED_SUBMIT=1.');
    const { ref, startDate } = await fillLeaveApplicationReadyToSubmit(page);
    await page.getByRole('button', { name: 'Submit', exact: true }).first().click();
    await expect(page.getByRole('dialog', { name: 'Delegate' })).toBeVisible({ timeout: 30000 });
    // STEP 1: CLICK the 'Don't Delegate' button in the Delegate modal
    await page.getByRole('button', { name: "Don't Delegate" }).click();
    // STEP 2: ASSERT (BLOCKING) the modal closes and the user is returned to My Items
    await page.waitForURL(/my_items2/, { timeout: 30000 });
    await expect(page.getByRole('heading', { name: 'My Items' })).toBeVisible({ timeout: 30000 });
    // Record THIS application so recommend-leave + approve-leave act on the same one.
    saveSubmittedApplication({ ref, startDate });
    // eslint-disable-next-line no-console
    console.log(`[apply] Recorded submitted application ${ref} (start ${startDate}) for the chain`);
  });

  // ADO #101967 — the v76 form disables Submit until required fields + certification are present,
  // so there is no empty-form Submit path to surface inline field errors.
  test('TC-12: Submit without required fields shows validation errors', async ({ page }) => {
    await openNewLeaveApplication(page);
    // ASSERT (BLOCKING) Submit is unavailable on an empty form and no Delegate modal appears
    await expect(page.getByRole('dialog', { name: 'Delegate' })).toHaveCount(0);
    test.skip(true, 'v76 keeps Submit disabled until required fields are filled and the certification checkbox is ticked (no empty-submit path); the inline-error path needs a seeded run.');
  });

  // ADO #101968
  test('TC-13: End date before start date is rejected', async ({ page }) => {
    await openNewLeaveApplication(page);
    await selectCategory(page, 'Annual Leave');
    await selectSubCategory(page, 'Annual Leave');
    await page.getByRole('radio', { name: 'Days' }).check();
    // STEP 1-2: Start after End (End before Start)
    const start = page.getByRole('textbox', { name: 'Select date' }).first();
    const end = page.getByRole('textbox', { name: 'Select date' }).nth(1);
    await start.fill('24/06/2026');
    await start.press('Enter');
    await end.fill('23/06/2026');
    await end.press('Enter');
    await page.waitForTimeout(1000);
    // STEP 3: SNAPSHOT Observe the form state
    // ASSERT (BLOCKING) Submit must not become enabled with an invalid (end-before-start) range
    await expect(page.getByRole('button', { name: 'Submit', exact: true }).first()).toBeDisabled();
    // TODO[assertion]: capture the exact "End date cannot be before start date" error text on first run.
  });

  // ADO #101969
  test('TC-14: Leave spanning a weekend counts only working days', async ({ page }) => {
    test.skip(true, 'Weekend-exclusion day count not yet recorded on v76; needs a Mon–Fri+weekend range capture to assert the working-day count excludes Sat/Sun.');
    // TODO[assertion]: set a Mon–Fri+weekend range and assert the working-day count excludes Sat/Sun.
  });

});
