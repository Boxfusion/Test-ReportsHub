// AUTO-RECORDED from test-plans/Profile/verify-edit-tertiary-qualification.md
// Source: Azure DevOps test plan #99437, suite #104586, test case #104629
// The .md plan is canonical. AI-repair will patch failing lines in this file.
// Do not hand-edit unless you are also updating the .md plan.
//
// Steps 1-7 are the same add flow as verify-add-tertiary-qualification-in-progress.spec.ts.
// The row's real "Edit"/"Save" icons are button[title="Edit"] / button[title="Save"] —
// distinct from decoy "open in designer" pencil icons that also match a loose
// role-based "edit" name query, and from the page-level Save/Next footer button.
// Editing is inline in the row (no modal). The edit-mode Qualification Type
// option is directly clickable (unlike the Add modal's combo).

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
// it directly (the filtered option here is visible).
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
// reports as hidden, same quirk seen in Secondary Qualifications.
async function selectQualificationStatusInProgress(page: Page, combo: Locator) {
  await combo.click();
  await page.waitForTimeout(400);
  await page.keyboard.press('ArrowDown');
  await page.waitForTimeout(150);
  await page.keyboard.press('Enter');
  await page.waitForTimeout(700);
}

async function addQualification(page: Page) {
  await deleteTertiaryQualificationRows(page);
  const modal = await openAddQualificationModal(page);
  await modalFieldInput(modal, 'Institution').fill(INSTITUTION);
  await modalFieldInput(modal, 'Qualification Name').fill(QUALIFICATION_NAME);
  await selectAntOptionByClick(page, modalCombo(modal, 'Qualification Type'), 'National');
  await selectQualificationStatusInProgress(page, modalCombo(modal, 'Qualification Status'));
  await page.getByRole('button', { name: 'Submit' }).click();
  await page.waitForTimeout(1500);
}

// The row's real action icons carry distinct DOM `title` attributes, unlike
// the decoy form-designer pencil icons which share the same accessible
// role/name ("edit") via their inner icon.
function realEditButton(page: Page): Locator {
  return page.locator('button[title="Edit"]');
}
function realSaveButton(page: Page): Locator {
  return page.locator('button[title="Save"]');
}
// Located by proximity to the "Qualification Type" column header, not by its
// current value — a value-based filter would stop matching once the
// selection changes away from the pre-edit "National Diploma" value.
function editRowQualTypeCombo(page: Page): Locator {
  return page.getByText('Qualification Type', { exact: false }).last().locator('xpath=following::*[contains(concat(" ", normalize-space(@class), " "), " ant-select ")][1]');
}

test.describe('PROFILE-104629 — Edit Tertiary Qualification', () => {
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
    await modalFieldInput(modal, 'Institution').fill(INSTITUTION);
    await modalFieldInput(modal, 'Qualification Name').fill(QUALIFICATION_NAME);

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
    await modalFieldInput(modal, 'Institution').fill(INSTITUTION);
    await modalFieldInput(modal, 'Qualification Name').fill(QUALIFICATION_NAME);
    await selectAntOptionByClick(page, modalCombo(modal, 'Qualification Type'), 'National');

    const qualStatusCombo = modalCombo(modal, 'Qualification Status');
    // STEP: CLICK dropdown, SELECT "In Progress"
    await selectQualificationStatusInProgress(page, qualStatusCombo);
    // ASSERT (BLOCKING) status shows In Progress
    await expect(qualStatusCombo.locator('.ant-select-selection-item')).toHaveText('In Progress');
  });

  test('TC-07: Click Submit button', async ({ page }) => {
    await loginAsFred(page);
    await goToTertiaryQualifications(page);
    await addQualification(page);
    // ASSERT (BLOCKING) new row visible in the table; Next enabled
    await expect(page.getByText(INSTITUTION, { exact: false })).toBeVisible({ timeout: 10000 });
    await expect(page.getByRole('button', { name: 'Next', exact: true })).toBeEnabled();
  });

  test('TC-08: Click Edit Icon from the added Qualification', async ({ page }) => {
    await loginAsFred(page);
    await goToTertiaryQualifications(page);
    await addQualification(page);

    // STEP: CLICK the Edit icon on the added row
    await realEditButton(page).first().click();
    await page.waitForTimeout(1000);
    // ASSERT (BLOCKING) a Save icon is visible, confirming edit mode is active
    await expect(realSaveButton(page)).toBeVisible({ timeout: 10000 });
  });

  test('TC-09: Select B-Tech and click Save icon', async ({ page }) => {
    await loginAsFred(page);
    await goToTertiaryQualifications(page);
    await addQualification(page);
    await realEditButton(page).first().click();
    await page.waitForTimeout(1000);

    // STEP: CLICK the Qualification Type dropdown (edit mode), SELECT "B-Tech"
    const qualTypeCombo = editRowQualTypeCombo(page);
    await qualTypeCombo.click();
    await page.waitForTimeout(400);
    await qualTypeCombo.locator('input').focus();
    await page.keyboard.press('Control+A');
    await page.keyboard.press('Backspace');
    await page.keyboard.type('B-Tech');
    await page.waitForTimeout(600);
    await page.locator('.ant-select-item-option-content', { hasText: /^B-Tech$/ }).click();
    await page.waitForTimeout(700);
    // ASSERT (BLOCKING) field displays B-Tech before saving
    await expect(qualTypeCombo.locator('.ant-select-selection-item')).toContainText('B-Tech');

    // STEP: CLICK the Save icon
    await realSaveButton(page).click();
    await page.waitForTimeout(1500);
    // ASSERT (BLOCKING) the persisted row displays B-Tech
    await expect(page.getByText('B-Tech', { exact: true }).first()).toBeVisible({ timeout: 10000 });
  });
});
