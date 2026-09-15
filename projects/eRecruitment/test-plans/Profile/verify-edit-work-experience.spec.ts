// AUTO-RECORDED from test-plans/Profile/verify-edit-work-experience.md
// Source: Azure DevOps test plan #99437, suite #104586, test case #104639
// The .md plan is canonical. AI-repair will patch failing lines in this file.
// Do not hand-edit unless you are also updating the .md plan.
//
// Steps 1-7 are the same add flow as verify-add-work-experience-not-current-employer.spec.ts.
// The row's real "Edit"/"Save" icons are button[title="Edit"] / button[title="Save"]
// (same pattern as verify-edit-tertiary-qualification.spec.ts, but no decoy
// "open in designer" icons interfered here). In edit mode, the Sector combo's
// currently-selected option is hidden from its own list, and the other
// option is directly clickable without filtering.

import { test, expect, Page, Locator } from '@playwright/test';

const APP_URL = 'https://pd-recruitment-publicportal-1-qa.shesha.app/';
const APPLICANT = { user: 'Fred', password: 'Metaganemr%03' };
const COMPANY_NAME = 'Boxfusion';
const JOB_TITLE = 'Software Engineer';
const REASON_FOR_LEAVING = 'New Challenges';
const DUTIES = 'Test Case Generation';

async function loginAsFred(page: Page) {
  await page.goto(`${APP_URL}login`);
  await page.locator('input[type="text"]').first().fill(APPLICANT.user);
  await page.locator('input[type="password"]').first().fill(APPLICANT.password);
  await page.getByRole('button', { name: /sign in/i }).click();
  await page.waitForURL(url => !url.href.includes('/login'), { timeout: 30000 });
  await page.waitForLoadState('networkidle');
}

async function goToWorkExperience(page: Page) {
  await page.getByRole('link', { name: 'Manage Profile' }).click();
  await page.waitForLoadState('networkidle');
  await page.getByRole('button', { name: 'Work Experience' }).click();
  await page.waitForTimeout(1500);
  if (!(await page.getByRole('heading', { name: 'Work Experience' }).isVisible().catch(() => false))) {
    await page.getByRole('button', { name: 'Work Experience' }).click();
    await page.waitForTimeout(1500);
  }
}

// Deletes every existing work experience row, confirming the delete popover each time.
async function deleteWorkExperienceRows(page: Page) {
  let guard = 0;
  while ((await page.getByRole('button', { name: 'delete' }).count()) > 0 && guard < 10) {
    guard++;
    await page.getByRole('button', { name: 'delete' }).first().click();
    await page.waitForTimeout(400);
    await page.getByRole('button', { name: 'OK' }).click();
    await page.waitForTimeout(800);
  }
}

async function openAddExperienceModal(page: Page): Promise<Locator> {
  await page.getByRole('button', { name: 'Add Experience' }).click();
  await page.waitForTimeout(1000);
  return page.locator('.ant-modal-content').last();
}

function modalFieldInput(modal: Locator, label: string): Locator {
  return modal.getByText(label, { exact: false }).last().locator('xpath=following::input[1]');
}

function modalTextarea(modal: Locator, label: string): Locator {
  return modal.getByText(label, { exact: false }).last().locator('xpath=following::textarea[1]');
}

// "Sector" is a substring of its own option values ("Public Sector", "Private
// Sector"), so once selected, a loose label match grabs the selected value's
// text (not the label) and breaks — exact match on the label avoids this.
// This also works unscoped (page-level) for the inline edit-row Sector combo.
function sectorCombo(scope: Locator | Page): Locator {
  return scope.getByText('Sector', { exact: true }).last().locator('xpath=following::*[contains(concat(" ", normalize-space(@class), " "), " ant-select ")][1]');
}

async function selectSectorPublic(page: Page, combo: Locator) {
  await combo.click();
  await page.waitForTimeout(400);
  await combo.locator('input').focus();
  await page.keyboard.press('Control+A');
  await page.keyboard.press('Backspace');
  await page.keyboard.type('Public');
  await page.waitForTimeout(600);
  await page.locator('.ant-select-item-option-content').last().click();
  await page.waitForTimeout(700);
}

// Selects a start day, then an end day from the same still-open picker.
// Dates after "today" are disabled, so both days are kept small (5th/15th)
// to stay safely in the past regardless of which day of the month this runs.
async function selectEmploymentPeriodRange(page: Page, modal: Locator) {
  const startDateField = modal.locator('input[placeholder="Start date"]');
  await startDateField.click();
  await expect(page.locator('.ant-picker-panel').first()).toBeVisible({ timeout: 10000 });
  await page.locator('.ant-picker-panel').first().locator('.ant-picker-cell-in-view').getByText('5', { exact: true }).click();
  await page.waitForTimeout(500);
  await page.locator('.ant-picker-panel').first().locator('.ant-picker-cell-in-view').getByText('15', { exact: true }).click();
  await page.waitForTimeout(500);
}

async function addWorkExperience(page: Page) {
  await deleteWorkExperienceRows(page);
  const modal = await openAddExperienceModal(page);
  await modalFieldInput(modal, 'Company Name').fill(COMPANY_NAME);
  await selectSectorPublic(page, sectorCombo(modal));
  await modalFieldInput(modal, 'Job Title').fill(JOB_TITLE);
  await selectEmploymentPeriodRange(page, modal);
  await modalTextarea(modal, 'Reason for Leaving').fill(REASON_FOR_LEAVING);
  await modalTextarea(modal, 'Duties and Responsibilities').fill(DUTIES);
  await page.getByRole('button', { name: 'OK' }).click();
  await page.waitForTimeout(1500);
}

// The row's real action icons carry distinct DOM `title` attributes.
function realEditButton(page: Page): Locator {
  return page.locator('button[title="Edit"]');
}
function realSaveButton(page: Page): Locator {
  return page.locator('button[title="Save"]');
}

test.describe('PROFILE-104639 — Edit Work Experience', () => {
  test.describe.configure({ mode: 'serial' });

  test('TC-01: Login as Fred', async ({ page }) => {
    // STEP 1-5: NAVIGATE, TYPE Username/Password, CLICK Sign In
    await loginAsFred(page);
    // ASSERT (BLOCKING) URL no longer contains /login and Dashboard is visible
    await expect(page).not.toHaveURL(/login/i);
    await expect(page.getByText('Your Dashboard')).toBeVisible({ timeout: 30000 });
  });

  test('TC-02: Click on Work Experience tab', async ({ page }) => {
    await loginAsFred(page);
    // STEP: CLICK Manage Profile, then CLICK the Work Experience step
    await goToWorkExperience(page);
    // ASSERT (BLOCKING) Work Experience heading visible
    await expect(page.getByRole('heading', { name: 'Work Experience' })).toBeVisible({ timeout: 15000 });
  });

  test('TC-03: Click Add Experience button', async ({ page }) => {
    await loginAsFred(page);
    await goToWorkExperience(page);
    await deleteWorkExperienceRows(page);
    // STEP: CLICK the Add Experience button
    const modal = await openAddExperienceModal(page);
    // ASSERT (BLOCKING) Add Work Experience modal is visible
    await expect(modal.getByText('Add Work Experience')).toBeVisible({ timeout: 10000 });
  });

  test('TC-04: Populate Company Name and Sector', async ({ page }) => {
    await loginAsFred(page);
    await goToWorkExperience(page);
    await deleteWorkExperienceRows(page);
    const modal = await openAddExperienceModal(page);
    // STEP: TYPE company name
    const companyField = modalFieldInput(modal, 'Company Name');
    await companyField.fill(COMPANY_NAME);
    // STEP: CLICK Sector dropdown, SELECT "Public Sector"
    const combo = sectorCombo(modal);
    await selectSectorPublic(page, combo);
    // ASSERT (BLOCKING) both fields display the entered/selected values
    await expect(companyField).toHaveValue(COMPANY_NAME);
    await expect(combo.locator('.ant-select-selection-item')).toContainText('Public Sector');
  });

  test('TC-05: Populate Job Title', async ({ page }) => {
    await loginAsFred(page);
    await goToWorkExperience(page);
    await deleteWorkExperienceRows(page);
    const modal = await openAddExperienceModal(page);
    await modalFieldInput(modal, 'Company Name').fill(COMPANY_NAME);
    await selectSectorPublic(page, sectorCombo(modal));

    // STEP: TYPE job title
    const jobTitleField = modalFieldInput(modal, 'Job Title');
    await jobTitleField.fill(JOB_TITLE);
    // ASSERT (BLOCKING) field contains the typed value
    await expect(jobTitleField).toHaveValue(JOB_TITLE);
  });

  test('TC-06: Employment Period datepicker', async ({ page }) => {
    await loginAsFred(page);
    await goToWorkExperience(page);
    await deleteWorkExperienceRows(page);
    const modal = await openAddExperienceModal(page);
    await modalFieldInput(modal, 'Company Name').fill(COMPANY_NAME);
    await selectSectorPublic(page, sectorCombo(modal));
    await modalFieldInput(modal, 'Job Title').fill(JOB_TITLE);

    // STEP: CLICK Employment Period, SELECT start and end dates
    const startDateField = modal.locator('input[placeholder="Start date"]');
    await startDateField.click();
    // ASSERT (BLOCKING) two calendar panels are visible
    await expect(page.locator('.ant-picker-panel')).toHaveCount(2);
    await page.locator('.ant-picker-panel').first().locator('.ant-picker-cell-in-view').getByText('5', { exact: true }).click();
    await page.waitForTimeout(500);
    await page.locator('.ant-picker-panel').first().locator('.ant-picker-cell-in-view').getByText('15', { exact: true }).click();
    await page.waitForTimeout(500);
    const endDateField = modal.locator('input[placeholder="End date"]');
    // ASSERT (BLOCKING) both dates are displayed
    await expect(startDateField).not.toHaveValue('');
    await expect(endDateField).not.toHaveValue('');
  });

  test('TC-07: Populate Reason for Leaving and Duties, click OK', async ({ page }) => {
    await loginAsFred(page);
    await goToWorkExperience(page);
    await addWorkExperience(page);
    // ASSERT (BLOCKING) new row visible in the table; Next enabled
    await expect(page.getByText(COMPANY_NAME, { exact: false })).toBeVisible({ timeout: 10000 });
    await expect(page.getByRole('button', { name: 'Next', exact: true })).toBeEnabled();
  });

  test('TC-08: Click Edit icon on the added Work Experience', async ({ page }) => {
    await loginAsFred(page);
    await goToWorkExperience(page);
    await addWorkExperience(page);

    // STEP: CLICK the Edit icon on the added row
    await realEditButton(page).first().click();
    await page.waitForTimeout(1000);
    // ASSERT (BLOCKING) a Save icon is visible, confirming edit mode is active
    await expect(realSaveButton(page)).toBeVisible({ timeout: 10000 });
  });

  test('TC-09: Select Private Sector and click Save icon', async ({ page }) => {
    await loginAsFred(page);
    await goToWorkExperience(page);
    await addWorkExperience(page);
    await realEditButton(page).first().click();
    await page.waitForTimeout(1000);

    // STEP: CLICK the Sector dropdown (edit mode), SELECT "Private Sector"
    const combo = sectorCombo(page);
    await combo.click();
    await page.waitForTimeout(400);
    await page.locator('.ant-select-item-option-content', { hasText: 'Private Sector' }).click();
    await page.waitForTimeout(700);
    // ASSERT (BLOCKING) field displays Private Sector before saving
    await expect(combo.locator('.ant-select-selection-item')).toContainText('Private Sector');

    // STEP: CLICK the Save icon
    await realSaveButton(page).click();
    await page.waitForTimeout(1500);
    // ASSERT (BLOCKING) the persisted row displays Private Sector
    await expect(page.getByText('Private Sector', { exact: true }).first()).toBeVisible({ timeout: 10000 });
  });
});
