// AUTO-RECORDED from test-plans/Profile/verify-languages.md
// Source: Azure DevOps test plan #99437, suite #104586, test case #104621
// The .md plan is canonical. AI-repair will patch failing lines in this file.
// Do not hand-edit unless you are also updating the .md plan.
//
// Selectors were captured live against the QA environment on 2026-07-06.
// The "add new row" line is identified by its plus-circle/close-circle icon
// buttons, not by table row index, since the table already has a saved row
// (English) above/below it depending on render order. Deleting a row requires
// confirming a "Are you sure want to delete this item?" popover via its OK
// button. TC-07 deletes the row it adds so repeated runs don't accumulate
// duplicate rows in Fred's profile.

import { test, expect, Page, Locator } from '@playwright/test';

const APP_URL = 'https://pd-recruitment-publicportal-1-qa.shesha.app/';
const APPLICANT = { user: 'Fred', password: 'Metaganemr%03' };
const TEST_LANGUAGE = 'Afrikaans';

async function loginAsFred(page: Page) {
  await page.goto(`${APP_URL}login`);
  await page.locator('input[type="text"]').first().fill(APPLICANT.user);
  await page.locator('input[type="password"]').first().fill(APPLICANT.password);
  await page.getByRole('button', { name: /sign in/i }).click();
  await page.waitForURL(url => !url.href.includes('/login'), { timeout: 30000 });
  await page.waitForLoadState('networkidle');
}

async function goToLanguages(page: Page) {
  await page.getByRole('link', { name: 'Manage Profile' }).click();
  await page.waitForLoadState('networkidle');
  await page.getByRole('button', { name: 'Languages' }).click();
  await page.waitForTimeout(1500);
}

function addRow(page: Page): Locator {
  return page.getByRole('row', { name: 'plus-circle close-circle' });
}

async function selectInAddRow(page: Page, comboIndex: number, label: string) {
  const combo = addRow(page).locator('.ant-select').nth(comboIndex);
  await combo.click();
  await page.waitForTimeout(400);
  await combo.locator('input').focus();
  await page.keyboard.press('Control+A');
  await page.keyboard.press('Backspace');
  await page.keyboard.type(label);
  await page.waitForTimeout(400);
  await page.getByText(label, { exact: true }).last().click();
  await page.waitForTimeout(600);
}

// Deletes every row matching languageName, confirming the delete popover each time.
async function deleteLanguageRows(page: Page, languageName: string) {
  let guard = 0;
  while ((await page.getByRole('row', { name: new RegExp(languageName) }).count()) > 0 && guard < 10) {
    guard++;
    await page.getByRole('row', { name: new RegExp(languageName) }).first().getByRole('button', { name: 'delete' }).first().click();
    await page.waitForTimeout(400);
    await page.getByRole('button', { name: 'OK' }).click();
    await page.waitForTimeout(800);
  }
}

test.describe('PROFILE-104621 — Verify Languages', () => {
  test.describe.configure({ mode: 'serial' });

  test('TC-01: Login as Fred', async ({ page }) => {
    // STEP 1-5: NAVIGATE, TYPE Username/Password, CLICK Sign In
    await loginAsFred(page);
    // ASSERT (BLOCKING) URL no longer contains /login and Dashboard is visible
    await expect(page).not.toHaveURL(/login/i);
    await expect(page.getByText('Your Dashboard')).toBeVisible({ timeout: 30000 });
  });

  test('TC-02: Click on Languages tab', async ({ page }) => {
    await loginAsFred(page);
    // STEP: CLICK Manage Profile, then CLICK the Languages step
    await goToLanguages(page);
    // ASSERT (BLOCKING) Languages heading visible; existing English row present
    await expect(page.getByRole('heading', { name: 'Languages' })).toBeVisible({ timeout: 15000 });
    await expect(page.getByRole('row', { name: /English/ })).toBeVisible();
  });

  test('TC-03: Language dropdown', async ({ page }) => {
    await loginAsFred(page);
    await goToLanguages(page);
    // STEP: CLICK the Language dropdown in the add-row, SELECT "Afrikaans"
    await selectInAddRow(page, 0, TEST_LANGUAGE);
    // ASSERT (BLOCKING) add-row Language field displays "Afrikaans"
    const langCombo = addRow(page).locator('.ant-select').nth(0);
    await expect(langCombo.locator('.ant-select-selection-item')).toHaveText(TEST_LANGUAGE);
    // cleanup: this selection alone doesn't persist until "+" is clicked, so no delete needed
  });

  test('TC-04: Speak dropdown', async ({ page }) => {
    await loginAsFred(page);
    await goToLanguages(page);
    await selectInAddRow(page, 0, TEST_LANGUAGE);
    // STEP: CLICK the Speak dropdown in the add-row, SELECT "Good"
    await selectInAddRow(page, 1, 'Good');
    // ASSERT (BLOCKING) add-row Speak field displays "Good"
    const speakCombo = addRow(page).locator('.ant-select').nth(1);
    await expect(speakCombo.locator('.ant-select-selection-item')).toHaveText('Good');
  });

  test('TC-05: Read dropdown', async ({ page }) => {
    await loginAsFred(page);
    await goToLanguages(page);
    await selectInAddRow(page, 0, TEST_LANGUAGE);
    await selectInAddRow(page, 1, 'Good');
    // STEP: CLICK the Read dropdown in the add-row, SELECT "Good"
    await selectInAddRow(page, 2, 'Good');
    // ASSERT (BLOCKING) add-row Read field displays "Good"
    const readCombo = addRow(page).locator('.ant-select').nth(2);
    await expect(readCombo.locator('.ant-select-selection-item')).toHaveText('Good');
  });

  test('TC-06: Write dropdown', async ({ page }) => {
    await loginAsFred(page);
    await goToLanguages(page);
    await selectInAddRow(page, 0, TEST_LANGUAGE);
    await selectInAddRow(page, 1, 'Good');
    await selectInAddRow(page, 2, 'Good');
    // STEP: CLICK the Write dropdown in the add-row, SELECT "Good"
    await selectInAddRow(page, 3, 'Good');
    // ASSERT (BLOCKING) add-row Write field displays "Good"
    const writeCombo = addRow(page).locator('.ant-select').nth(3);
    await expect(writeCombo.locator('.ant-select-selection-item')).toHaveText('Good');
  });

  test('TC-07: Add the language row', async ({ page }) => {
    await loginAsFred(page);
    await goToLanguages(page);
    // Ensure no leftover Afrikaans row from a previous interrupted run
    await deleteLanguageRows(page, TEST_LANGUAGE);

    // STEP: populate the add-row and CLICK the + button
    await selectInAddRow(page, 0, TEST_LANGUAGE);
    await selectInAddRow(page, 1, 'Good');
    await selectInAddRow(page, 2, 'Good');
    await selectInAddRow(page, 3, 'Good');
    await addRow(page).getByRole('button', { name: 'plus-circle' }).click();
    await page.waitForTimeout(1000);

    // ASSERT (BLOCKING) new row visible; Next enabled
    const newRow = page.getByRole('row', { name: new RegExp(`${TEST_LANGUAGE}.*Good.*Good.*Good`) });
    await expect(newRow).toBeVisible();
    await expect(page.getByRole('button', { name: 'Next', exact: true })).toBeEnabled();

    // Cleanup: delete the row we just added
    await deleteLanguageRows(page, TEST_LANGUAGE);
    await expect(page.getByRole('row', { name: new RegExp(TEST_LANGUAGE) })).toHaveCount(0);
  });
});
