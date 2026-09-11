// AUTO-RECORDED from test-plans/Profile/verify-demographic-details.md
// Source: Azure DevOps test plan #99437, suite #104586, test case #104590
// The .md plan is canonical. AI-repair will patch failing lines in this file.
// Do not hand-edit unless you are also updating the .md plan.
//
// Selectors were captured live against the QA environment on 2026-07-06.
// Gender/Race are Ant Design selects with the same already-selected-is-not-
// clickable quirk documented in verify-profile-details.spec.ts and
// verify-contact-details.spec.ts — checked for current value before selecting.
// "Do you have a disability?" is a Yes/No radio pair, not a dropdown.

import { test, expect, Page, Locator } from '@playwright/test';

const APP_URL = 'https://pd-recruitment-publicportal-1-qa.shesha.app/';
const APPLICANT = { user: 'Fred', password: 'Metaganemr%03' };
const NATURE_OF_DISABILITY = 'Test disability note';
const GENDER_LABELS = ['Male', 'Female', 'Not Disclosed'];
const RACE_LABELS = ['African', 'Not Stated', 'White', 'Coloured', 'Indian', 'Other'];

async function loginAsFred(page: Page) {
  await page.goto(`${APP_URL}login`);
  await page.locator('input[type="text"]').first().fill(APPLICANT.user);
  await page.locator('input[type="password"]').first().fill(APPLICANT.password);
  await page.getByRole('button', { name: /sign in/i }).click();
  await page.waitForURL(url => !url.href.includes('/login'), { timeout: 30000 });
  await page.waitForLoadState('networkidle');
}

async function goToDemographicDetails(page: Page) {
  await page.getByRole('link', { name: 'Manage Profile' }).click();
  await page.waitForLoadState('networkidle');
  await page.getByRole('button', { name: 'Demographic Details' }).click();
  await page.waitForTimeout(1500);
}

function fieldInput(page: Page, label: string): Locator {
  return page.getByText(label, { exact: false }).locator('xpath=following::input[1]');
}

function antCombo(page: Page, label: string): Locator {
  return page.getByText(label, { exact: false }).locator('xpath=following::*[contains(concat(" ", normalize-space(@class), " "), " ant-select ")][1]');
}

async function selectAntOption(page: Page, combo: Locator, label: string) {
  await combo.click();
  await page.waitForTimeout(300);
  await combo.locator('input').focus();
  await page.keyboard.press('Control+A');
  await page.keyboard.press('Backspace');
  await page.keyboard.type(label);
  await page.waitForTimeout(400);
  await page.getByText(label, { exact: true }).last().click();
  await page.waitForTimeout(1000);
}

// See file header: the field auto-persists, so a prior run may have left the
// combo already on the target value, which Ant Design excludes from its own
// dropdown list. Detect that case and hop through a different known option first.
async function ensureAntOption(page: Page, combo: Locator, label: string, knownLabels: string[]) {
  const selectionItem = combo.locator('.ant-select-selection-item');
  let current = '';
  for (let i = 0; i < 30; i++) {
    current = (await selectionItem.innerText().catch(() => '')).trim();
    if (knownLabels.includes(current)) break;
    await page.waitForTimeout(300);
  }
  if (current === label) {
    const away = knownLabels.find(l => l !== label)!;
    await selectAntOption(page, combo, away);
  }
  await selectAntOption(page, combo, label);
}

test.describe('PROFILE-104590 — Verify Demographic Details', () => {
  test.describe.configure({ mode: 'serial' });

  test('TC-01: Login as Fred', async ({ page }) => {
    // STEP 1-5: NAVIGATE, TYPE Username/Password, CLICK Sign In
    await loginAsFred(page);
    // ASSERT (BLOCKING) URL no longer contains /login and Dashboard is visible
    await expect(page).not.toHaveURL(/login/i);
    await expect(page.getByText('Your Dashboard')).toBeVisible({ timeout: 30000 });
  });

  test('TC-02: Click on Demographic Details tab', async ({ page }) => {
    await loginAsFred(page);
    // STEP: CLICK Manage Profile, then CLICK the Demographic Details step
    await goToDemographicDetails(page);
    // ASSERT (BLOCKING) Demographic Details heading visible
    await expect(page.getByRole('heading', { name: 'Demographic Details' })).toBeVisible({ timeout: 15000 });
  });

  test('TC-03: Gender dropdown', async ({ page }) => {
    await loginAsFred(page);
    await goToDemographicDetails(page);
    const genderCombo = antCombo(page, 'Gender');
    // STEP: CLICK dropdown, SELECT "Male"
    await ensureAntOption(page, genderCombo, 'Male', GENDER_LABELS);
    // ASSERT (BLOCKING) field displays "Male"
    await expect(genderCombo.locator('.ant-select-selection-item')).toHaveText('Male');
  });

  test('TC-04: Race dropdown', async ({ page }) => {
    await loginAsFred(page);
    await goToDemographicDetails(page);
    const raceCombo = antCombo(page, 'Race');
    // STEP: CLICK dropdown, SELECT "African"
    await ensureAntOption(page, raceCombo, 'African', RACE_LABELS);
    // ASSERT (BLOCKING) field displays "African"
    await expect(raceCombo.locator('.ant-select-selection-item')).toHaveText('African');
  });

  test('TC-05: Select Yes on Do you have a disability', async ({ page }) => {
    await loginAsFred(page);
    await goToDemographicDetails(page);
    // STEP: CLICK the Yes radio button
    await page.getByRole('radio', { name: 'Yes' }).click();
    await page.waitForTimeout(800);
    const natureField = fieldInput(page, 'Nature Of Disability');
    // ASSERT (BLOCKING) Nature Of Disability field is visible and enabled
    await expect(natureField).toBeVisible();
    await expect(natureField).toBeEnabled();
    // STEP: TYPE a value into the Nature Of Disability field
    await natureField.fill(NATURE_OF_DISABILITY);
    // ASSERT (BLOCKING) field contains the typed value; Next enabled
    await expect(natureField).toHaveValue(NATURE_OF_DISABILITY);
    await expect(page.getByRole('button', { name: 'Next', exact: true })).toBeEnabled();
  });

  test('TC-06: Select No on Do you have a disability', async ({ page }) => {
    await loginAsFred(page);
    await goToDemographicDetails(page);
    // Set to Yes first so switching to No is a genuine state change
    await page.getByRole('radio', { name: 'Yes' }).click();
    await page.waitForTimeout(800);
    // STEP: CLICK the No radio button
    await page.getByRole('radio', { name: 'No' }).click();
    await page.waitForTimeout(800);
    // ASSERT (BLOCKING) Nature Of Disability field is hidden; Next enabled
    await expect(page.getByText('Nature Of Disability', { exact: false })).toBeHidden();
    await expect(page.getByRole('button', { name: 'Next', exact: true })).toBeEnabled();
  });

  test('TC-07: Click Next button', async ({ page }) => {
    await loginAsFred(page);
    await goToDemographicDetails(page);
    await page.getByRole('radio', { name: 'No' }).click();
    await page.waitForTimeout(800);
    // STEP: CLICK the Next button
    await page.getByRole('button', { name: 'Next', exact: true }).click();
    await page.waitForTimeout(1500);
    // ASSERT (BLOCKING) Background information heading is visible
    await expect(page.getByRole('heading', { name: 'Background information' })).toBeVisible({ timeout: 15000 });
  });
});
