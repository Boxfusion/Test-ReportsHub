// AUTO-RECORDED from test-plans/AdminPortal/create-job-posting-valid.md
// Source: Azure DevOps project pd-recruitment, test case #102822 "Create Job
// Post ( Valid)" (steps supplied via a shared-step block, work item rev 3).
// The .md plan is canonical. AI-repair will patch failing lines in this file.
// Do not hand-edit unless you are also updating the .md plan.
//
// STATEFUL/DESTRUCTIVE: each TC re-runs the full flow from login (this hub's
// serial-TC convention) and creates a real Draft JobPosting record in the
// shared QA dataset each time it reaches the "Create New" step. A fresh
// unique Job Reference Number is generated per run (uniqueRef()) to avoid
// colliding with other testers' seeded data.
//
// DOM notes confirmed live against the Admin Portal on 2026-08-04:
// - The "Workflows" sidebar entry is a hover/click flyout (icon labelled
//   "Entity" in the DOM) exposing Inbox / Sent Items / My Items / Draft.
//   After navigating, the flyout can remain visually open (hover state) and
//   overlap "Create New" — the mouse is moved away before interacting with
//   the My Items toolbar to close it.
// - "Create New" opens an Ant Design dropdown with a single `menuitem`,
//   "JobPosting".
// - The Job Posting wizard is a 4-step stepper: (1) Job Information Summary
//   — Recruiter Details + Job Information Summary panels, (2) Output and
//   Competencies, (3) Documentation, (4) Confirmation.
// - Ant Select dropdowns leave previous options' DOM nodes around (hidden),
//   so option lookups are scoped to `.ant-select-dropdown:visible` and use
//   exact-text filters (the Salary Level list includes a stray non-numeric
//   GUID entry alongside "1".."16" — a substring match like `hasText: '1'`
//   wrongly matches it, so an exact `/^1$/` filter is required).

import { test, expect, Page, Locator } from '@playwright/test';

const APP_URL = 'https://pd-recruitment-adminportal-qa.shesha.app/';
const RECRUITER = { user: 'kamogelos', password: '123qwe' };
const RECRUITER_NAME = 'Audrey Muvhango';
const POST_NAME = 'Senior Case Officer';
const PROVINCE_BRANCH = 'Gauteng / Head Office';
const CENTRE_OFFICE = 'Head Office';
const SALARY_LEVEL = '1';
const REQUIREMENTS = 'Grade 12 certificate, relevant tertiary qualification in Public Administration, and 3 years relevant experience.';
const REQUIRED_SKILLS = 'Attention to detail, strong administrative skills, knowledge of recruitment processes, good communication skills.';
const DUTIES = 'Screen applications, schedule interviews, liaise with hiring managers, and maintain accurate recruitment records.';

function uniqueRef(): string {
  return `CJP-102822-${Date.now()}-${Math.floor(Math.random() * 1000)}`;
}

function fieldInput(page: Page, labelText: string): Locator {
  return page.locator('label', { hasText: labelText }).locator('xpath=../..').locator('input').first();
}

function fieldTextarea(page: Page, labelText: string): Locator {
  return page.locator('label', { hasText: labelText }).locator('xpath=../..').locator('textarea').first();
}

function fieldSelect(page: Page, labelText: string): Locator {
  return page.locator('label', { hasText: labelText }).locator('xpath=../..').locator('.ant-select').first();
}

function visibleDropdown(page: Page): Locator {
  return page.locator('.ant-select-dropdown:visible').last();
}

async function loginAsKamogelo(page: Page) {
  // waitUntil:'load' times out here — the app keeps background network
  // activity alive past the 30s navigationTimeout, so 'domcontentloaded'
  // (confirmed sufficient during live exploration) is used instead.
  await page.goto(`${APP_URL}login`, { waitUntil: 'domcontentloaded' });
  await page.waitForSelector('input[placeholder="Username"]', { timeout: 20000 });
  await page.locator('input[placeholder="Username"]').fill(RECRUITER.user);
  await page.locator('input[placeholder="Password"]').fill(RECRUITER.password);
  await page.getByRole('button', { name: 'Sign In' }).click();
  await page.waitForURL(url => !url.href.includes('/login'), { timeout: 30000 });
  await page.waitForLoadState('networkidle').catch(() => {});
  await page.waitForTimeout(1000);
}

async function expandWorkflowsMenu(page: Page) {
  await page.getByText('Workflows', { exact: false }).first().click();
  await page.waitForTimeout(600);
}

async function goToMyItems(page: Page) {
  await expandWorkflowsMenu(page);
  await page.getByText('My Items', { exact: true }).first().click();
  await page.waitForLoadState('networkidle').catch(() => {});
  await page.waitForTimeout(1000);
  // Close the hover-flyout submenu (it can stay open and overlap the toolbar)
  await page.mouse.move(900, 400);
  await page.mouse.move(1200, 700);
  await page.waitForTimeout(300);
}

async function clickCreateNew(page: Page) {
  await page.getByRole('button', { name: 'Create New' }).click();
  await page.waitForTimeout(600);
}

async function openJobPostingForm(page: Page) {
  await clickCreateNew(page);
  await page.getByRole('menuitem', { name: 'JobPosting' }).click();
  await page.waitForLoadState('networkidle').catch(() => {});
  await page.waitForTimeout(1200);
}

async function selectRecruiter(page: Page) {
  await fieldSelect(page, 'Name and Surname').click();
  await page.waitForTimeout(400);
  await visibleDropdown(page).locator('.ant-select-item-option', { hasText: RECRUITER_NAME }).click();
  await page.waitForTimeout(300);
}

async function fillJobInformationText(page: Page, refNo: string) {
  await fieldInput(page, 'Job Reference Number').fill(refNo);
  await fieldInput(page, 'Post Name').fill(POST_NAME);
  await fieldInput(page, 'Province / Branch').fill(PROVINCE_BRANCH);
}

async function selectCentreAndSalary(page: Page) {
  await fieldSelect(page, 'Centre / Office Name').click();
  await page.waitForTimeout(400);
  await visibleDropdown(page).locator('.ant-select-item-option', { hasText: CENTRE_OFFICE }).first().click();
  await page.waitForTimeout(300);

  await fieldSelect(page, 'Salary Level').click();
  await page.waitForTimeout(400);
  await visibleDropdown(page).locator('.ant-select-item-option').filter({ hasText: new RegExp(`^${SALARY_LEVEL}$`) }).first().click();
  await page.waitForTimeout(300);
}

async function pickClosingDate(page: Page) {
  await page.locator('input[placeholder="Select date"]').click();
  await page.waitForTimeout(400);
  await page.locator('.ant-picker-cell-in-view', { hasText: '22' }).first().click();
  await page.waitForTimeout(400);
}

function nextButton(page: Page): Locator {
  return page.getByRole('button', { name: 'Next' });
}

async function completeStep1(page: Page, refNo: string) {
  await loginAsKamogelo(page);
  await goToMyItems(page);
  await openJobPostingForm(page);
  await selectRecruiter(page);
  await fillJobInformationText(page, refNo);
  await selectCentreAndSalary(page);
  await pickClosingDate(page);
}

async function advanceToStep2(page: Page, refNo: string) {
  await completeStep1(page, refNo);
  await nextButton(page).click();
  await page.waitForLoadState('networkidle').catch(() => {});
  await page.waitForTimeout(1200);
}

test.describe('ADMINPORTAL-102822 — Create Job Post (Valid)', () => {
  test.describe.configure({ mode: 'serial' });

  test('TC-01: Login as kamogelos', async ({ page }) => {
    await loginAsKamogelo(page);
    // ASSERT (BLOCKING) URL no longer contains /login
    await expect(page).not.toHaveURL(/login/i);
  });

  test('TC-02: Expand the Workflows menu', async ({ page }) => {
    await loginAsKamogelo(page);
    // STEP: CLICK the Workflows sidebar icon
    await expandWorkflowsMenu(page);
    // ASSERT (BLOCKING) submenu is displayed
    await expect(page.getByText('My Items', { exact: true }).first()).toBeVisible();
  });

  test('TC-03: Navigate to My Items submenu', async ({ page }) => {
    await loginAsKamogelo(page);
    // STEP: CLICK the My Items submenu item
    await goToMyItems(page);
    // ASSERT (BLOCKING) Create New / Export buttons are visible
    await expect(page.getByRole('button', { name: 'Create New' })).toBeVisible();
    await expect(page.getByRole('button', { name: 'Export' })).toBeVisible();
  });

  test('TC-04: Click the Create New button', async ({ page }) => {
    await loginAsKamogelo(page);
    await goToMyItems(page);
    // STEP: CLICK the Create New button
    await clickCreateNew(page);
    // ASSERT (BLOCKING) JobPosting menu item is visible
    await expect(page.getByRole('menuitem', { name: 'JobPosting' })).toBeVisible();
  });

  test('TC-05: Click the Job posting item', async ({ page }) => {
    await loginAsKamogelo(page);
    await goToMyItems(page);
    await clickCreateNew(page);
    // STEP: CLICK the Job posting menu item
    await page.getByRole('menuitem', { name: 'JobPosting' }).click();
    await page.waitForLoadState('networkidle').catch(() => {});
    await page.waitForTimeout(1200);
    // ASSERT (BLOCKING) Recruiter Details and Job Information Summary panels visible
    await expect(page.getByText('Recruiter Details', { exact: true })).toBeVisible();
    await expect(page.getByText('Job Information Summary', { exact: true }).first()).toBeVisible();
  });

  test('TC-06: Click the Name and Surname dropdown', async ({ page }) => {
    await loginAsKamogelo(page);
    await goToMyItems(page);
    await openJobPostingForm(page);
    // STEP: CLICK the Name and Surname dropdown
    await fieldSelect(page, 'Name and Surname').click();
    await page.waitForTimeout(400);
    // ASSERT (BLOCKING) recruiter option list is visible
    await expect(visibleDropdown(page).locator('.ant-select-item-option').first()).toBeVisible();
  });

  test('TC-07: Select a valid option from Name and Surname', async ({ page }) => {
    await loginAsKamogelo(page);
    await goToMyItems(page);
    await openJobPostingForm(page);
    // STEP: SELECT a valid recruiter
    await selectRecruiter(page);
    // ASSERT (BLOCKING) selected name is displayed
    await expect(fieldSelect(page, 'Name and Surname')).toContainText(RECRUITER_NAME);
  });

  test('TC-08: Fill Job Reference Number, Province/Branch, Post Name', async ({ page }) => {
    const refNo = uniqueRef();
    await loginAsKamogelo(page);
    await goToMyItems(page);
    await openJobPostingForm(page);
    await selectRecruiter(page);
    // STEP: TYPE Job Reference Number, Province/Branch, Post Name
    await fillJobInformationText(page, refNo);
    // ASSERT (BLOCKING) fields contain the typed values
    await expect(fieldInput(page, 'Job Reference Number')).toHaveValue(refNo);
    await expect(fieldInput(page, 'Province / Branch')).toHaveValue(PROVINCE_BRANCH);
    await expect(fieldInput(page, 'Post Name')).toHaveValue(POST_NAME);
  });

  test('TC-09: Select Centre/Office Name and Salary Level', async ({ page }) => {
    const refNo = uniqueRef();
    await loginAsKamogelo(page);
    await goToMyItems(page);
    await openJobPostingForm(page);
    await selectRecruiter(page);
    await fillJobInformationText(page, refNo);
    // STEP: SELECT Centre/Office Name and Salary Level
    await selectCentreAndSalary(page);
    // ASSERT (BLOCKING) both dropdowns show the selected value
    await expect(fieldSelect(page, 'Centre / Office Name')).toContainText(CENTRE_OFFICE);
    await expect(fieldSelect(page, 'Salary Level')).toContainText(SALARY_LEVEL);
  });

  test('TC-10: Pick a valid future Closing Date', async ({ page }) => {
    const refNo = uniqueRef();
    await advanceToStep1Fields(page, refNo);
    // STEP: CLICK the Closing Date datepicker and pick a valid future date
    await pickClosingDate(page);
    // ASSERT (BLOCKING) Next button is enabled
    await expect(nextButton(page)).toBeEnabled();
  });

  test('TC-11: Click the Next button', async ({ page }) => {
    const refNo = uniqueRef();
    await completeStep1(page, refNo);
    // STEP: CLICK the Next button
    await nextButton(page).click();
    await page.waitForLoadState('networkidle').catch(() => {});
    await page.waitForTimeout(1200);
    // ASSERT (BLOCKING) Output and Competencies step is active
    await expect(page.getByText('Output and Competencies', { exact: true })).toBeVisible();
    await expect(fieldTextarea(page, 'Requirements')).toBeVisible();
  });

  test('TC-12: Type into the Requirements text area', async ({ page }) => {
    const refNo = uniqueRef();
    await advanceToStep2(page, refNo);
    // STEP: CLICK into Requirements and TYPE a valid description
    await fieldTextarea(page, 'Requirements').fill(REQUIREMENTS);
    // ASSERT (BLOCKING) field contains the typed value
    await expect(fieldTextarea(page, 'Requirements')).toHaveValue(REQUIREMENTS);
  });

  test('TC-13: Type into the Required Skills and Competencies text area', async ({ page }) => {
    const refNo = uniqueRef();
    await advanceToStep2(page, refNo);
    await fieldTextarea(page, 'Requirements').fill(REQUIREMENTS);
    // STEP: CLICK into Required Skills and Competencies and TYPE a valid list
    await fieldTextarea(page, 'Required Skills and Competencies').fill(REQUIRED_SKILLS);
    // ASSERT (BLOCKING) field contains the typed value
    await expect(fieldTextarea(page, 'Required Skills and Competencies')).toHaveValue(REQUIRED_SKILLS);
  });

  test('TC-14: Type into the Duties text area', async ({ page }) => {
    const refNo = uniqueRef();
    await advanceToStep2(page, refNo);
    await fieldTextarea(page, 'Requirements').fill(REQUIREMENTS);
    await fieldTextarea(page, 'Required Skills and Competencies').fill(REQUIRED_SKILLS);
    // STEP: CLICK into Duties and TYPE a valid summary
    await fieldTextarea(page, 'Duties').fill(DUTIES);
    // ASSERT (BLOCKING) field contains the typed value
    await expect(fieldTextarea(page, 'Duties')).toHaveValue(DUTIES);
  });

  test('TC-15: Assert Next button state change', async ({ page }) => {
    const refNo = uniqueRef();
    await advanceToStep2(page, refNo);
    await fieldTextarea(page, 'Requirements').fill(REQUIREMENTS);
    await fieldTextarea(page, 'Required Skills and Competencies').fill(REQUIRED_SKILLS);
    // ASSERT (BLOCKING) Next is disabled before the final mandatory field is filled
    await expect(nextButton(page)).toBeDisabled();
    // STEP: fill the final mandatory field (Duties)
    await fieldTextarea(page, 'Duties').fill(DUTIES);
    // ASSERT (BLOCKING) Next instantly becomes enabled
    await expect(nextButton(page)).toBeEnabled();
  });

  test('TC-16: Click the newly enabled Next button', async ({ page }) => {
    const refNo = uniqueRef();
    await advanceToStep2(page, refNo);
    await fieldTextarea(page, 'Requirements').fill(REQUIREMENTS);
    await fieldTextarea(page, 'Required Skills and Competencies').fill(REQUIRED_SKILLS);
    await fieldTextarea(page, 'Duties').fill(DUTIES);
    // STEP: CLICK the newly enabled Next button
    await nextButton(page).click();
    await page.waitForLoadState('networkidle').catch(() => {});
    await page.waitForTimeout(1200);
    // ASSERT (BLOCKING) Documentation step is active and no error toast is shown
    await expect(page.getByText('Documentation', { exact: true }).first()).toBeVisible();
    await expect(page.locator('.ant-message-error, .ant-notification-notice-error')).toHaveCount(0);
  });
});

async function advanceToStep1Fields(page: Page, refNo: string) {
  await loginAsKamogelo(page);
  await goToMyItems(page);
  await openJobPostingForm(page);
  await selectRecruiter(page);
  await fillJobInformationText(page, refNo);
  await selectCentreAndSalary(page);
}
