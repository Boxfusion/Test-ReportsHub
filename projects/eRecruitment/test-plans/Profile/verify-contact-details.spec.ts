// AUTO-RECORDED from test-plans/Profile/verify-contact-details.md
// Source: Azure DevOps test plan #99437, suite #104586, test case #104589
// The .md plan is canonical. AI-repair will patch failing lines in this file.
// Do not hand-edit unless you are also updating the .md plan.
//
// Selectors were captured live against the QA environment on 2026-07-06.
// Country Of Residence is a modal-based "Select Item" search picker, not a
// dropdown. Method/Language are Ant Design selects with the same
// already-selected-is-not-clickable quirk as the Citizen Status field on
// Personal Details (see verify-profile-details.spec.ts) — the combo must be
// checked for its current value before selecting, hopping through a
// guaranteed-different option first if the target is already selected.

import { test, expect, Page, Locator } from '@playwright/test';

const APP_URL = 'https://pd-recruitment-publicportal-1-qa.shesha.app/';
const APPLICANT = { user: 'Fred', password: 'Metaganemr%03' };
const MOBILE_NUMBER = '0821234567';
const ADDRESS_LINE_1 = '123 Test Street';
const METHOD_LABELS = ['Email', 'Post', 'Fax', 'Telephone'];
const LANGUAGE_LABELS = ['English', 'Afrikaans', 'Isi Ndebele', 'Isi Xhosa', 'Isi Zulu', 'Sepedi', 'Sesotho', 'Setswana', 'Isi Swati'];

async function loginAsFred(page: Page) {
  await page.goto(`${APP_URL}login`);
  await page.locator('input[type="text"]').first().fill(APPLICANT.user);
  await page.locator('input[type="password"]').first().fill(APPLICANT.password);
  await page.getByRole('button', { name: /sign in/i }).click();
  await page.waitForURL(url => !url.href.includes('/login'), { timeout: 30000 });
  await page.waitForLoadState('networkidle');
}

async function goToContactDetails(page: Page) {
  await page.getByRole('link', { name: 'Manage Profile' }).click();
  await page.waitForLoadState('networkidle');
  await page.getByRole('button', { name: 'Contact Details' }).click();
  await page.waitForTimeout(1000);
}

function fieldInput(page: Page, label: string): Locator {
  return page.getByText(label, { exact: false }).locator('xpath=following::input[1]');
}

async function selectAntOption(page: Page, combo: Locator, label: string, searchTerm: string) {
  await combo.click();
  await page.waitForTimeout(300);
  await combo.locator('input').focus();
  await page.keyboard.press('Control+A');
  await page.keyboard.press('Backspace');
  await page.keyboard.type(searchTerm);
  await page.waitForTimeout(400);
  await page.getByText(label, { exact: true }).last().click();
  await page.waitForTimeout(1000);
}

// See file header: the field auto-persists, so a prior run may have left the
// combo already on the target value, which Ant Design excludes from its own
// dropdown list. Detect that case and hop through a different known option first.
async function ensureAntOption(page: Page, combo: Locator, label: string, searchTerm: string, knownLabels: string[]) {
  const selectionItem = combo.locator('.ant-select-selection-item');
  let current = '';
  for (let i = 0; i < 30; i++) {
    current = (await selectionItem.innerText().catch(() => '')).trim();
    if (knownLabels.includes(current)) break;
    await page.waitForTimeout(300);
  }
  if (current === label) {
    const away = knownLabels.find(l => l !== label)!;
    await selectAntOption(page, combo, away, away);
  }
  await selectAntOption(page, combo, label, searchTerm);
}

async function selectCountry(page: Page, countryName: string) {
  const ellipsis = page.getByText('Country Of Residence', { exact: false }).locator('xpath=following::button[1]');
  await ellipsis.click();
  const modal = page.locator('.ant-modal-content').filter({ hasText: 'Select Item' }).first();
  await expect(modal).toBeVisible({ timeout: 10000 });
  await modal.locator('input').first().fill(countryName);
  await page.waitForTimeout(1000);
  const row = modal.getByText(countryName, { exact: true }).first();
  await row.dblclick();
  try {
    await modal.waitFor({ state: 'hidden', timeout: 5000 });
  } catch {
    await modal.getByRole('button', { name: 'Close' }).click();
    await modal.waitFor({ state: 'hidden', timeout: 5000 });
  }
}

test.describe('PROFILE-104589 — Verify Contact Details', () => {
  test.describe.configure({ mode: 'serial' });

  test('TC-01: Login as Fred', async ({ page }) => {
    // STEP 1-5: NAVIGATE, TYPE Username/Password, CLICK Sign In
    await loginAsFred(page);
    // ASSERT (BLOCKING) URL no longer contains /login and Dashboard is visible
    await expect(page).not.toHaveURL(/login/i);
    await expect(page.getByText('Your Dashboard')).toBeVisible({ timeout: 30000 });
  });

  test('TC-02: Click on Contact Details tab', async ({ page }) => {
    await loginAsFred(page);
    // STEP: CLICK Manage Profile, then CLICK the Contact Details step
    await goToContactDetails(page);
    // ASSERT (BLOCKING) Contact Details heading visible; Mobile Number field present
    await expect(page.getByRole('heading', { name: 'Contact Details' })).toBeVisible({ timeout: 15000 });
    const mobileField = fieldInput(page, 'Mobile Number');
    await expect(mobileField).toBeVisible();
    await expect(mobileField).toBeEnabled();
  });

  test('TC-03: Populate Residential Address Line1', async ({ page }) => {
    await loginAsFred(page);
    await goToContactDetails(page);
    // STEP: TYPE a valid address into Residential Address Line1
    const addressField = fieldInput(page, 'Residential Address Line1');
    await addressField.fill(ADDRESS_LINE_1);
    // ASSERT (BLOCKING) field contains the typed value
    await expect(addressField).toHaveValue(ADDRESS_LINE_1);
  });

  test('TC-04: Select a country from Country Of Residence', async ({ page }) => {
    await loginAsFred(page);
    await goToContactDetails(page);
    // STEP: CLICK the ... button, SNAPSHOT modal, TYPE search, double-click "South Africa"
    const ellipsis = page.getByText('Country Of Residence', { exact: false }).locator('xpath=following::button[1]');
    await ellipsis.click();
    const modal = page.locator('.ant-modal-content').filter({ hasText: 'Select Item' }).first();
    // ASSERT (BLOCKING) Select Item modal is visible
    await expect(modal).toBeVisible({ timeout: 10000 });
    await modal.locator('input').first().fill('South Africa');
    await page.waitForTimeout(1000);
    const row = modal.getByText('South Africa', { exact: true }).first();
    await row.dblclick();
    try {
      await modal.waitFor({ state: 'hidden', timeout: 5000 });
    } catch {
      await modal.getByRole('button', { name: 'Close' }).click();
      await modal.waitFor({ state: 'hidden', timeout: 5000 });
    }
    // ASSERT (BLOCKING) Country Of Residence displays "South Africa"
    // Country Of Residence renders as an Ant Select (readonly search input),
    // so the selected value lives in .ant-select-selection-item, not input.value.
    const countryCombo = page.getByText('Country Of Residence', { exact: false }).locator('xpath=following::*[contains(concat(" ", normalize-space(@class), " "), " ant-select ")][1]');
    await expect(countryCombo.locator('.ant-select-selection-item')).toHaveText('South Africa', { timeout: 10000 });
  });

  test('TC-05: Method for correspondence dropdown', async ({ page }) => {
    await loginAsFred(page);
    await goToContactDetails(page);
    const methodCombo = page.getByText('Method for correspondence', { exact: false }).locator('xpath=following::*[contains(concat(" ", normalize-space(@class), " "), " ant-select ")][1]');
    // STEP: CLICK dropdown, SELECT "Post"
    await ensureAntOption(page, methodCombo, 'Post', 'Post', METHOD_LABELS);
    // ASSERT (BLOCKING) field displays "Post"
    await expect(methodCombo.locator('.ant-select-selection-item')).toHaveText('Post');
  });

  test('TC-06: Preferred language for correspondence dropdown', async ({ page }) => {
    await loginAsFred(page);
    await goToContactDetails(page);
    const langCombo = page.getByText('Preferred language for correspondence', { exact: false }).locator('xpath=following::*[contains(concat(" ", normalize-space(@class), " "), " ant-select ")][1]');
    // STEP: CLICK dropdown, SELECT "Afrikaans"
    await ensureAntOption(page, langCombo, 'Afrikaans', 'Afrikaans', LANGUAGE_LABELS);
    // ASSERT (BLOCKING) field displays "Afrikaans"; Next is enabled
    await expect(langCombo.locator('.ant-select-selection-item')).toHaveText('Afrikaans');
    await expect(page.getByRole('button', { name: 'Next', exact: true })).toBeEnabled();
  });

  test('TC-07: Click Previous button', async ({ page }) => {
    await loginAsFred(page);
    await goToContactDetails(page);
    await fieldInput(page, 'Residential Address Line1').fill(ADDRESS_LINE_1);
    // STEP: CLICK the Previous button
    await page.getByRole('button', { name: 'Previous', exact: true }).click();
    await page.waitForTimeout(1000);
    // ASSERT (BLOCKING) Personal Details heading is visible
    await expect(page.getByRole('heading', { name: 'Personal Details' })).toBeVisible({ timeout: 15000 });
  });

  test('TC-08: Click Next button to return to Contact Details', async ({ page }) => {
    await loginAsFred(page);
    await goToContactDetails(page);
    const mobileField = fieldInput(page, 'Mobile Number');
    await mobileField.fill(MOBILE_NUMBER);
    const addressField = fieldInput(page, 'Residential Address Line1');
    await addressField.fill(ADDRESS_LINE_1);
    await selectCountry(page, 'South Africa');
    // STEP: CLICK Previous then Next to exercise retention across navigation
    await page.getByRole('button', { name: 'Previous', exact: true }).click();
    await page.waitForTimeout(1000);
    await page.getByRole('button', { name: 'Next', exact: true }).click();
    await page.waitForTimeout(1200);
    // ASSERT (BLOCKING) Contact Details visible with data retained
    await expect(page.getByRole('heading', { name: 'Contact Details' })).toBeVisible({ timeout: 15000 });
    await expect(addressField).toHaveValue(ADDRESS_LINE_1);
    await expect(mobileField).toHaveValue(MOBILE_NUMBER);
  });

  test('TC-09: Click Next button to move to Demographic Details', async ({ page }) => {
    await loginAsFred(page);
    await goToContactDetails(page);
    await fieldInput(page, 'Mobile Number').fill(MOBILE_NUMBER);
    await fieldInput(page, 'Residential Address Line1').fill(ADDRESS_LINE_1);
    await selectCountry(page, 'South Africa');
    // STEP: CLICK the Next button
    await page.getByRole('button', { name: 'Next', exact: true }).click();
    await page.waitForTimeout(1500);
    // ASSERT (BLOCKING) Demographic Details heading is visible
    await expect(page.getByRole('heading', { name: 'Demographic Details' })).toBeVisible({ timeout: 15000 });
  });
});
