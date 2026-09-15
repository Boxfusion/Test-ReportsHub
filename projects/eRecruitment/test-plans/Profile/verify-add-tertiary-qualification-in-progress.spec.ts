// AUTO-RECORDED from test-plans/Profile/verify-add-tertiary-qualification-in-progress.md
// Source: Azure DevOps test plan #99437, suite #104586, test case #104627
// The .md plan is canonical. AI-repair will patch failing lines in this file.
// Do not hand-edit unless you are also updating the .md plan.
//
// Sibling of PROFILE-104626 (Complete + Date Obtained). This case covers the
// In Progress status instead, so no Date Obtained step. Helpers below are the
// same ones proven working against the QA environment for PROFILE-104626.

import { test, expect, Page, Locator } from '@playwright/test';

const APP_URL = 'https://pd-recruitment-publicportal-1-qa.shesha.app/';
const APPLICANT = { user: 'Fred', password: 'Metaganemr%03' };
const INSTITUTION = 'Wits';
const QUALIFICATION_NAME = 'BSC In IT';

async function loginAsFred(page: Page) {
  await page.goto(`${APP_URL}login`);
  await page.locator('input[type="text"]').first().fill(APPLICANT.user);
  await page.locator('input[type="password"]').first().fill(APPLICANT.password);
  await page.getByRole('button', { name: /sign in/i }).click();
  await page.waitForURL(url => !url.href.includes('/login'), { timeout: 30000 });
  await page.waitForLoadState('networkidle');
}

async function goToTertiaryQualifications(page: Page) {
  await page.getByRole('link', { name: 'Manage Profile' }).click();
  await page.waitForLoadState('networkidle');
  await page.getByRole('button', { name: 'Tertiary Qualifications' }).click();
  await page.waitForTimeout(1500);
  if (!(await page.getByRole('heading', { name: 'Tertiary Qualifications' }).isVisible().catch(() => false))) {
    await page.getByRole('button', { name: 'Tertiary Qualifications' }).click();
    await page.waitForTimeout(1500);
  }
}

// Deletes every existing qualification row, confirming the delete popover each time.
async function deleteTertiaryQualificationRows(page: Page) {
  let guard = 0;
  while ((await page.getByRole('button', { name: 'delete' }).count()) > 0 && guard < 10) {
    guard++;
    await page.getByRole('button', { name: 'delete' }).first().click();
    await page.waitForTimeout(400);
    await page.getByRole('button', { name: 'OK' }).click();
    await page.waitForTimeout(800);
  }
}

async function openAddQualificationModal(page: Page): Promise<Locator> {
  await page.getByRole('button', { name: 'Add Qualification' }).click();
  await page.waitForTimeout(1000);
  return page.locator('.ant-modal-content').last();
}

function modalFieldInput(modal: Locator, label: string): Locator {
  return modal.getByText(label, { exact: false }).last().locator('xpath=following::input[1]');
}

function modalCombo(modal: Locator, label: string): Locator {
  return modal.getByText(label, { exact: false }).last().locator('xpath=following::*[contains(concat(" ", normalize-space(@class), " "), " ant-select ")][1]');
}

// Types searchTerm to filter the option list to a single match, then clicks
// it directly (the filtered option here is visible, unlike Secondary
// Qualifications' Qualification Type, so no keyboard fallback is needed).
async function selectAntOptionByClick(page: Page, combo: Locator, searchTerm: string) {
  await combo.click();
  await page.waitForTimeout(400);
  await combo.locator('input').focus();
  await page.keyboard.press('Control+A');
  await page.keyboard.press('Backspace');
  await page.keyboard.type(searchTerm);
  await page.waitForTimeout(600);
  await page.locator('.ant-select-item-option-content').last().click();
  await page.waitForTimeout(700);
}

// Selects the 1st of 2 options ("In Progress") via keyboard — its DOM node
// reports as hidden, same quirk as Secondary Qualifications' Qualification
// Status, so a click-based selection times out.
async function selectQualificationStatusInProgress(page: Page, combo: Locator) {
  await combo.click();
  await page.waitForTimeout(400);
  await page.keyboard.press('ArrowDown');
  await page.waitForTimeout(150);
  await page.keyboard.press('Enter');
  await page.waitForTimeout(700);
}

async function fillQualificationForm(page: Page, modal: Locator) {
  const institutionField = modalFieldInput(modal, 'Institution');
  await institutionField.fill(INSTITUTION);
  const qualNameField = modalFieldInput(modal, 'Qualification Name');
  await qualNameField.fill(QUALIFICATION_NAME);

  const qualTypeCombo = modalCombo(modal, 'Qualification Type');
  await selectAntOptionByClick(page, qualTypeCombo, 'National');

  const qualStatusCombo = modalCombo(modal, 'Qualification Status');
  await selectQualificationStatusInProgress(page, qualStatusCombo);
}

test.describe('PROFILE-104627 — Add Tertiary Qualification In Progress', () => {
  test.describe.configure({ mode: 'serial' });

  test('TC-01: Login as Fred', async ({ page }) => {
    // STEP 1-5: NAVIGATE, TYPE Username/Password, CLICK Sign In
    await loginAsFred(page);
    // ASSERT (BLOCKING) URL no longer contains /login and Dashboard is visible
    await expect(page).not.toHaveURL(/login/i);
    await expect(page.getByText('Your Dashboard')).toBeVisible({ timeout: 30000 });
  });

  test('TC-02: Click on Tertiary Qualifications tab', async ({ page }) => {
    await loginAsFred(page);
    // STEP: CLICK Manage Profile, then CLICK the Tertiary Qualifications step
    await goToTertiaryQualifications(page);
    // ASSERT (BLOCKING) Tertiary Qualifications heading visible
    await expect(page.getByRole('heading', { name: 'Tertiary Qualifications' })).toBeVisible({ timeout: 15000 });
  });

  test('TC-03: Click Add Qualification button', async ({ page }) => {
    await loginAsFred(page);
    await goToTertiaryQualifications(page);
    // precondition: start from an empty table
    await deleteTertiaryQualificationRows(page);
    // STEP: CLICK the Add Qualification button
    const modal = await openAddQualificationModal(page);
    // ASSERT (BLOCKING) Add Tertiary Qualification modal is visible
    await expect(modal.getByText('Add Tertiary Qualification')).toBeVisible({ timeout: 10000 });
  });

  test('TC-04: Populate Institution and Qualification Name', async ({ page }) => {
    await loginAsFred(page);
    await goToTertiaryQualifications(page);
    await deleteTertiaryQualificationRows(page);
    const modal = await openAddQualificationModal(page);
    // STEP: TYPE institution and qualification name
    const institutionField = modalFieldInput(modal, 'Institution');
    await institutionField.fill(INSTITUTION);
    const qualNameField = modalFieldInput(modal, 'Qualification Name');
    await qualNameField.fill(QUALIFICATION_NAME);
    // ASSERT (BLOCKING) both fields contain the typed values
    await expect(institutionField).toHaveValue(INSTITUTION);
    await expect(qualNameField).toHaveValue(QUALIFICATION_NAME);
  });

  test('TC-05: Qualification Type dropdown', async ({ page }) => {
    await loginAsFred(page);
    await goToTertiaryQualifications(page);
    await deleteTertiaryQualificationRows(page);
    const modal = await openAddQualificationModal(page);
    const institutionField = modalFieldInput(modal, 'Institution');
    await institutionField.fill(INSTITUTION);
    const qualNameField = modalFieldInput(modal, 'Qualification Name');
    await qualNameField.fill(QUALIFICATION_NAME);

    const qualTypeCombo = modalCombo(modal, 'Qualification Type');
    // STEP: CLICK dropdown, SELECT "National Diploma"
    await selectAntOptionByClick(page, qualTypeCombo, 'National');
    // ASSERT (BLOCKING) field displays the selected option
    await expect(qualTypeCombo.locator('.ant-select-selection-item')).toContainText('National Diploma');
  });

  test('TC-06: Qualification Status In Progress', async ({ page }) => {
    await loginAsFred(page);
    await goToTertiaryQualifications(page);
    await deleteTertiaryQualificationRows(page);
    const modal = await openAddQualificationModal(page);
    const institutionField = modalFieldInput(modal, 'Institution');
    await institutionField.fill(INSTITUTION);
    const qualNameField = modalFieldInput(modal, 'Qualification Name');
    await qualNameField.fill(QUALIFICATION_NAME);
    const qualTypeCombo = modalCombo(modal, 'Qualification Type');
    await selectAntOptionByClick(page, qualTypeCombo, 'National');

    const qualStatusCombo = modalCombo(modal, 'Qualification Status');
    // STEP: CLICK dropdown, SELECT "In Progress"
    await selectQualificationStatusInProgress(page, qualStatusCombo);
    // ASSERT (BLOCKING) status shows In Progress
    await expect(qualStatusCombo.locator('.ant-select-selection-item')).toHaveText('In Progress');
  });

  test('TC-07: Click Submit button', async ({ page }) => {
    await loginAsFred(page);
    await goToTertiaryQualifications(page);
    await deleteTertiaryQualificationRows(page);
    const modal = await openAddQualificationModal(page);
    await fillQualificationForm(page, modal);

    // STEP: CLICK the Submit button
    const submitBtn = page.getByRole('button', { name: 'Submit' });
    await expect(submitBtn).toBeEnabled();
    await submitBtn.click();
    await page.waitForTimeout(1500);
    // ASSERT (BLOCKING) new row visible in the table; Next enabled
    await expect(page.getByText(INSTITUTION, { exact: false })).toBeVisible({ timeout: 10000 });
    await expect(page.getByRole('button', { name: 'Next', exact: true })).toBeEnabled();
  });

  test('TC-08: Click Next button', async ({ page }) => {
    await loginAsFred(page);
    await goToTertiaryQualifications(page);
    await deleteTertiaryQualificationRows(page);
    const modal = await openAddQualificationModal(page);
    await fillQualificationForm(page, modal);
    await page.getByRole('button', { name: 'Submit' }).click();
    await page.waitForTimeout(1500);

    // STEP: CLICK the Next button
    await page.getByRole('button', { name: 'Next', exact: true }).click();
    await page.waitForTimeout(1500);
    // ASSERT (BLOCKING) Work Experience heading is visible
    await expect(page.getByRole('heading', { name: 'Work Experience' })).toBeVisible({ timeout: 15000 });
  });
});
