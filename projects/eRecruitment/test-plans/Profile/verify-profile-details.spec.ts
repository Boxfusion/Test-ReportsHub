// AUTO-RECORDED from test-plans/Profile/verify-profile-details.md
// Source: Azure DevOps test plan #99437, suite #104586, test case #104587
// The .md plan is canonical. AI-repair will patch failing lines in this file.
// Do not hand-edit unless you are also updating the .md plan.
//
// Selectors were captured live against the QA environment on 2026-07-06.
// The South African Citizen Status combobox is an Ant Design virtualized
// select — options must be selected by typing into the search input and
// clicking the rendered label text (role=option nodes can resolve to a
// zero-width accessibility duplicate), and the dropdown must be re-opened
// before every selection.

import { test, expect, Page, Locator } from '@playwright/test';

const APP_URL = 'https://pd-recruitment-publicportal-1-qa.shesha.app/';
const APPLICANT = { user: 'Fred', password: 'Metaganemr%03' };
const IDENTITY_NUMBER = '2606108675655';
const CITIZEN_STATUS_LABELS = ['SA by Birth', 'SA by naturalisation', 'SA permanent residency', 'Non SA - with work permit', 'Non SA - no work permit'];

async function loginAsFred(page: Page) {
  await page.goto(`${APP_URL}login`);
  await page.locator('input[type="text"]').first().fill(APPLICANT.user);
  await page.locator('input[type="password"]').first().fill(APPLICANT.password);
  await page.getByRole('button', { name: /sign in/i }).click();
  await page.waitForURL(url => !url.href.includes('/login'), { timeout: 30000 });
  await page.waitForLoadState('networkidle');
}

function fieldInput(page: Page, label: string): Locator {
  return page.getByText(label, { exact: false }).locator('xpath=following::input[1]');
}

async function selectCitizenStatus(page: Page, combo: Locator, label: string, searchTerm: string) {
  await combo.click();
  await page.waitForTimeout(300);
  await combo.locator('input').focus();
  await page.keyboard.press('Control+A');
  await page.keyboard.press('Backspace');
  await page.keyboard.type(searchTerm);
  await page.waitForTimeout(400);
  await page.getByText(label, { exact: true }).last().click();
  // The conditional field re-render (Identity Number / Work Permit / Passport)
  // lags the selection under automation speed; give it room to settle.
  await page.waitForTimeout(1500);
}

// The field auto-persists to the backend, so a prior run may have left the
// combo already on the target value — and Ant Design does not list the
// currently-selected value as a clickable option in its own dropdown. Detect
// that case and hop through a guaranteed-different option first.
async function ensureCitizenStatus(page: Page, combo: Locator, label: string, searchTerm: string) {
  // The selected value is fetched asynchronously after login/navigation and briefly
  // renders a placeholder (e.g. "unknown") before resolving to the real label, so
  // poll until the text is one of the actual known labels rather than just non-empty.
  const selectionItem = combo.locator('.ant-select-selection-item');
  let current = '';
  for (let i = 0; i < 30; i++) {
    current = (await selectionItem.innerText().catch(() => '')).trim();
    if (CITIZEN_STATUS_LABELS.includes(current)) break;
    await page.waitForTimeout(300);
  }
  if (current === label) {
    const away: [string, string] = label === 'SA by Birth' ? ['SA permanent residency', 'permanent'] : ['SA by Birth', 'by Birth'];
    await selectCitizenStatus(page, combo, away[0], away[1]);
  }
  await selectCitizenStatus(page, combo, label, searchTerm);
}

test.describe('PROFILE-104587 — Verify Profile Details', () => {
  test.describe.configure({ mode: 'serial' });

  test('TC-01: Login as Fred', async ({ page }) => {
    // STEP 1-5: NAVIGATE, TYPE Username/Password, CLICK Sign In
    await loginAsFred(page);
    // ASSERT (BLOCKING) URL no longer contains /login and Dashboard is visible
    await expect(page).not.toHaveURL(/login/i);
    await expect(page.getByText('Your Dashboard')).toBeVisible({ timeout: 30000 });
  });

  test('TC-02: Click on Manage Profile tab', async ({ page }) => {
    await loginAsFred(page);
    // STEP: CLICK the Manage Profile menu item
    await page.getByRole('link', { name: 'Manage Profile' }).click();
    await page.waitForLoadState('networkidle');
    // ASSERT (BLOCKING) Personal Details heading visible with First Name/Last Name populated
    await expect(page.getByRole('heading', { name: 'Personal Details' })).toBeVisible({ timeout: 15000 });
    const firstNameField = fieldInput(page, 'First Name');
    const lastNameField = fieldInput(page, 'Last Name');
    await expect(firstNameField).not.toHaveValue('');
    await expect(lastNameField).not.toHaveValue('');
  });

  test('TC-03: Open the Date Of Birth date picker and select a date', async ({ page }) => {
    await loginAsFred(page);
    await page.getByRole('link', { name: 'Manage Profile' }).click();
    await page.waitForLoadState('networkidle');
    // STEP: CLICK the Date Of Birth field
    const dobField = page.getByRole('textbox', { name: 'Select date' });
    await dobField.click();
    // ASSERT (BLOCKING) calendar picker is visible
    await expect(page.locator('.ant-picker-panel')).toBeVisible({ timeout: 10000 });
    // STEP: SELECT a valid date from the calendar (an in-view, non-adjacent-month day)
    await page.locator('.ant-picker-cell-in-view').getByText('12', { exact: true }).click();
    // ASSERT (BLOCKING) Date Of Birth field is non-empty after selection
    await expect(dobField).not.toHaveValue('');
  });

  test('TC-04: South African Citizen Status — SA by Birth', async ({ page }) => {
    await loginAsFred(page);
    await page.getByRole('link', { name: 'Manage Profile' }).click();
    await page.waitForLoadState('networkidle');
    const citizenStatusCombo = page.locator('.ant-select').nth(1);
    // STEP: CLICK dropdown, SELECT "SA by Birth"
    await ensureCitizenStatus(page, citizenStatusCombo, 'SA by Birth', 'by Birth');
    // ASSERT (BLOCKING) Identity Number visible; Work Permit / Passport not present
    await expect(page.getByText('Identity Number', { exact: false })).toBeVisible();
    await expect(page.getByText('South African Work Permit Number').first()).toBeHidden();
    await expect(page.getByText('Passport Number').first()).toBeHidden();
  });

  test('TC-05: South African Citizen Status — SA by naturalisation', async ({ page }) => {
    await loginAsFred(page);
    await page.getByRole('link', { name: 'Manage Profile' }).click();
    await page.waitForLoadState('networkidle');
    const citizenStatusCombo = page.locator('.ant-select').nth(1);
    // STEP: CLICK dropdown, SELECT "SA by naturalisation" (ADO wording: "SA By Neutralisation")
    await ensureCitizenStatus(page, citizenStatusCombo, 'SA by naturalisation', 'natur');
    // ASSERT (BLOCKING) Identity Number remains visible
    await expect(page.getByText('Identity Number', { exact: false })).toBeVisible();
  });

  test('TC-06: South African Citizen Status — SA permanent residency', async ({ page }) => {
    await loginAsFred(page);
    await page.getByRole('link', { name: 'Manage Profile' }).click();
    await page.waitForLoadState('networkidle');
    const citizenStatusCombo = page.locator('.ant-select').nth(1);
    // STEP: CLICK dropdown, SELECT "SA permanent residency"
    await ensureCitizenStatus(page, citizenStatusCombo, 'SA permanent residency', 'permanent');
    // ASSERT (BLOCKING) Identity Number remains visible
    await expect(page.getByText('Identity Number', { exact: false })).toBeVisible();
  });

  test('TC-07: South African Citizen Status — Non SA - with work permit', async ({ page }) => {
    await loginAsFred(page);
    await page.getByRole('link', { name: 'Manage Profile' }).click();
    await page.waitForLoadState('networkidle');
    const citizenStatusCombo = page.locator('.ant-select').nth(1);
    // STEP: CLICK dropdown, SELECT "Non SA - with work permit" (ADO wording: "Non SA With Work Permit")
    await ensureCitizenStatus(page, citizenStatusCombo, 'Non SA - with work permit', 'with work');
    // ASSERT (BLOCKING) Work Permit Number and Passport Number visible
    await expect(page.getByText('South African Work Permit Number').first()).toBeVisible();
    await expect(page.getByText('Passport Number').first()).toBeVisible();
  });

  test('TC-08: South African Citizen Status — Non SA - no work permit', async ({ page }) => {
    await loginAsFred(page);
    await page.getByRole('link', { name: 'Manage Profile' }).click();
    await page.waitForLoadState('networkidle');
    const citizenStatusCombo = page.locator('.ant-select').nth(1);
    // STEP: CLICK dropdown, SELECT "Non SA - no work permit" (ADO wording: "Non SA No Work Permit")
    await ensureCitizenStatus(page, citizenStatusCombo, 'Non SA - no work permit', 'no work');
    // ASSERT (BLOCKING) Passport Number visible and enabled; Work Permit Number not present
    const passportField = fieldInput(page, 'Passport Number');
    await expect(passportField).toBeVisible();
    await expect(passportField).toBeEnabled();
    await expect(page.getByText('South African Work Permit Number').first()).toBeHidden();
  });

  test('TC-09: Return to SA by Birth and populate Identity Number', async ({ page }) => {
    await loginAsFred(page);
    await page.getByRole('link', { name: 'Manage Profile' }).click();
    await page.waitForLoadState('networkidle');
    const citizenStatusCombo = page.locator('.ant-select').nth(1);
    // STEP: CLICK dropdown, SELECT "SA by Birth"
    await ensureCitizenStatus(page, citizenStatusCombo, 'SA by Birth', 'by Birth');
    // STEP: TYPE a valid identity number into the Identity Number field
    const idField = fieldInput(page, 'Identity Number');
    await idField.fill(IDENTITY_NUMBER);
    // ASSERT (BLOCKING) Identity Number populated; Next enabled
    await expect(idField).toHaveValue(IDENTITY_NUMBER);
    await expect(page.getByRole('button', { name: 'Next', exact: true })).toBeEnabled();
  });

  test('TC-10: Click Next button', async ({ page }) => {
    await loginAsFred(page);
    await page.getByRole('link', { name: 'Manage Profile' }).click();
    await page.waitForLoadState('networkidle');
    const citizenStatusCombo = page.locator('.ant-select').nth(1);
    await ensureCitizenStatus(page, citizenStatusCombo, 'SA by Birth', 'by Birth');
    const idField = fieldInput(page, 'Identity Number');
    await idField.fill(IDENTITY_NUMBER);
    // STEP: CLICK the Next button
    await page.getByRole('button', { name: 'Next', exact: true }).click();
    await page.waitForTimeout(1500);
    // ASSERT (BLOCKING) Contact Details heading visible
    await expect(page.getByRole('heading', { name: 'Contact Details' })).toBeVisible({ timeout: 15000 });
  });
});
