// AUTO-RECORDED from test-plans/Profile/verify-add-work-experience.md
// Source: Azure DevOps test plan #99437, suite #104586, test case #104637
// The .md plan is canonical. AI-repair will patch failing lines in this file.
// Do not hand-edit unless you are also updating the .md plan.
//
// "Add Experience" opens a modal, same pattern as Tertiary Qualifications'
// "Add Qualification". Employment Period is a date-range picker by default
// (Start date / End date inputs); toggling "Is this current employer?" ON
// hides Reason for Leaving and collapses Employment Period to a single date
// field (placeholder becomes "Select date"). Sector's options are directly
// clickable (no hidden-node quirk).

import { test, expect, Page, Locator } from '@playwright/test';

const APP_URL = 'https://pd-recruitment-publicportal-1-qa.shesha.app/';
const APPLICANT = { user: 'Fred', password: 'Metaganemr%03' };
const COMPANY_NAME = 'Boxfusion';
const JOB_TITLE = 'Software Engineer';
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

function modalCombo(modal: Locator, label: string): Locator {
  return modal.getByText(label, { exact: false }).last().locator('xpath=following::*[contains(concat(" ", normalize-space(@class), " "), " ant-select ")][1]');
}

// "Sector" is a substring of its own option values ("Public Sector", "Private
// Sector"), so once selected, a loose label match grabs the selected value's
// text (not the label) and breaks — exact match on the label avoids this.
function sectorCombo(modal: Locator): Locator {
  return modal.getByText('Sector', { exact: true }).last().locator('xpath=following::*[contains(concat(" ", normalize-space(@class), " "), " ant-select ")][1]');
}

function modalTextarea(modal: Locator, label: string): Locator {
  return modal.getByText(label, { exact: false }).last().locator('xpath=following::textarea[1]');
}

function currentEmployerSwitch(modal: Locator): Locator {
  return modal.locator('.ant-switch').first();
}

// Clicking directly out of the unfiltered 2-item list does not register the
// selection (the option click silently no-ops). Typing a search term to
// filter to a single match first — same approach as Tertiary Qualifications'
// Qualification Type — is reliable.
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

async function fillWorkExperienceForm(page: Page, modal: Locator) {
  await modalFieldInput(modal, 'Company Name').fill(COMPANY_NAME);
  await selectSectorPublic(page, sectorCombo(modal));
  await modalFieldInput(modal, 'Job Title').fill(JOB_TITLE);
  await currentEmployerSwitch(modal).click();
  await page.waitForTimeout(700);

  const dateField = modalFieldInput(modal, 'Employment Period');
  await dateField.click();
  await expect(page.locator('.ant-picker-panel')).toBeVisible({ timeout: 10000 });
  await page.locator('.ant-picker-cell-in-view').getByText('10', { exact: true }).click();
  await page.waitForTimeout(500);

  await modalTextarea(modal, 'Duties and Responsibilities').fill(DUTIES);
}

test.describe('PROFILE-104637 — Add Work Experience', () => {
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

  test('TC-04: Populate Company Name', async ({ page }) => {
    await loginAsFred(page);
    await goToWorkExperience(page);
    await deleteWorkExperienceRows(page);
    const modal = await openAddExperienceModal(page);
    // STEP: TYPE company name
    const companyField = modalFieldInput(modal, 'Company Name');
    await companyField.fill(COMPANY_NAME);
    // ASSERT (BLOCKING) field contains the typed value
    await expect(companyField).toHaveValue(COMPANY_NAME);
  });

  test('TC-05: Sector dropdown', async ({ page }) => {
    await loginAsFred(page);
    await goToWorkExperience(page);
    await deleteWorkExperienceRows(page);
    const modal = await openAddExperienceModal(page);
    await modalFieldInput(modal, 'Company Name').fill(COMPANY_NAME);

    const combo = sectorCombo(modal);
    // STEP: CLICK dropdown, SELECT "Public Sector"
    await selectSectorPublic(page, combo);
    // ASSERT (BLOCKING) field displays the selected option
    await expect(combo.locator('.ant-select-selection-item')).toContainText('Public Sector');
  });

  test('TC-06: Populate Job Title', async ({ page }) => {
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

  test('TC-07: Switch on "Is this Current Employer" toggle', async ({ page }) => {
    await loginAsFred(page);
    await goToWorkExperience(page);
    await deleteWorkExperienceRows(page);
    const modal = await openAddExperienceModal(page);
    await modalFieldInput(modal, 'Company Name').fill(COMPANY_NAME);
    await selectSectorPublic(page, sectorCombo(modal));
    await modalFieldInput(modal, 'Job Title').fill(JOB_TITLE);

    // STEP: toggle "Is this current employer?" on
    await currentEmployerSwitch(modal).click();
    await page.waitForTimeout(700);
    // ASSERT (BLOCKING) Reason for Leaving is hidden; End date input is gone
    await expect(modal.getByText('Reason for Leaving', { exact: false })).not.toBeVisible();
    await expect(modal.locator('input[placeholder="End date"]')).toHaveCount(0);
  });

  test('TC-08: Employment Period datepicker', async ({ page }) => {
    await loginAsFred(page);
    await goToWorkExperience(page);
    await deleteWorkExperienceRows(page);
    const modal = await openAddExperienceModal(page);
    await modalFieldInput(modal, 'Company Name').fill(COMPANY_NAME);
    await selectSectorPublic(page, sectorCombo(modal));
    await modalFieldInput(modal, 'Job Title').fill(JOB_TITLE);
    await currentEmployerSwitch(modal).click();
    await page.waitForTimeout(700);

    // STEP: CLICK the Employment Period date field, SELECT a previous date
    const dateField = modalFieldInput(modal, 'Employment Period');
    await dateField.click();
    // ASSERT (BLOCKING) calendar picker is visible
    await expect(page.locator('.ant-picker-panel')).toBeVisible({ timeout: 10000 });
    await page.locator('.ant-picker-cell-in-view').getByText('10', { exact: true }).click();
    await page.waitForTimeout(500);
    // ASSERT (BLOCKING) date field is non-empty
    await expect(dateField).not.toHaveValue('');
  });

  test('TC-09: Populate Duties and Responsibilities and click OK', async ({ page }) => {
    await loginAsFred(page);
    await goToWorkExperience(page);
    await deleteWorkExperienceRows(page);
    const modal = await openAddExperienceModal(page);
    await fillWorkExperienceForm(page, modal);

    // STEP: CLICK the OK button
    const okBtn = modal.getByRole('button', { name: 'OK' });
    await expect(okBtn).toBeEnabled();
    await okBtn.click();
    await page.waitForTimeout(1500);
    // ASSERT (BLOCKING) new row visible in the table; Next enabled
    await expect(page.getByText(COMPANY_NAME, { exact: false })).toBeVisible({ timeout: 10000 });
    await expect(page.getByRole('button', { name: 'Next', exact: true })).toBeEnabled();
  });

  test('TC-10: Click Next button', async ({ page }) => {
    await loginAsFred(page);
    await goToWorkExperience(page);
    await deleteWorkExperienceRows(page);
    const modal = await openAddExperienceModal(page);
    await fillWorkExperienceForm(page, modal);
    await modal.getByRole('button', { name: 'OK' }).click();
    await page.waitForTimeout(1500);

    // STEP: CLICK the Next button
    await page.getByRole('button', { name: 'Next', exact: true }).click();
    await page.waitForTimeout(1500);
    // ASSERT (BLOCKING) Skills heading is visible
    await expect(page.getByRole('heading', { name: 'Skills' })).toBeVisible({ timeout: 15000 });
  });
});
