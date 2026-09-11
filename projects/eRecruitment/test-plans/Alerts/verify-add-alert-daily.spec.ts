// AUTO-RECORDED from test-plans/Alerts/verify-add-alert-daily.md
// Source: Azure DevOps test plan #99437, suite #104540, test case #106357
// The .md plan is canonical. AI-repair will patch failing lines in this file.
// Do not hand-edit unless you are also updating the .md plan.
//
// Add Alert dialog DOM confirmed live 2026-07-30 (same dialog as #106343):
// - Job Title/Keywords: <label for="keywords"> + plain text input.
// - Location: <label for="location"> + Ant Select combobox (no accessible
//   name/placeholder, same pattern as Home/Jobs tab location fields).
// - Min/Max Salary: <label for="minSalaryRange"> / <label for="maxSalaryRange">
//   + Ant Design number input (role="spinbutton").
// - Frequency: a plain radio group ("Daily" value=1, "Weekly" value=2), no
//   label[for] association — each option is a <label class="ant-radio-wrapper">
//   wrapping the radio input and a text span.
// - Day Of The Week: not applicable for the Daily flow (only shown for Weekly).
// - Footer: Cancel / OK buttons.

import { test, expect, Page, Locator } from '@playwright/test';

const APP_URL = 'https://pd-recruitment-publicportal-1-qa.shesha.app/';
const APPLICANT = { user: 'Fred', password: 'Metaganemr%03' };
const JOB_TITLE = 'Analyst';
const LOCATION = 'Head Office';
const MIN_SALARY = '20000';
const MAX_SALARY = '60000';

async function loginAsFred(page: Page) {
  await page.goto(`${APP_URL}login`);
  await page.locator('input[type="text"]').first().fill(APPLICANT.user);
  await page.locator('input[type="password"]').first().fill(APPLICANT.password);
  await page.getByRole('button', { name: /sign in/i }).click();
  await page.waitForURL(url => !url.href.includes('/login'), { timeout: 30000 });
  await page.waitForLoadState('networkidle');
}

async function goToAlerts(page: Page) {
  await page.getByRole('link', { name: 'Alerts', exact: true }).click();
  await page.waitForLoadState('networkidle');
  await page.waitForTimeout(1000);
}

function addAlertButton(page: Page): Locator {
  return page.getByRole('button', { name: 'Add Alert', exact: true });
}

function addAlertDialog(page: Page): Locator {
  return page.locator('.ant-modal-content').filter({ hasText: 'Add Alert' }).first();
}

function formItemByLabel(page: Page, forId: string): Locator {
  return addAlertDialog(page).locator('.ant-form-item').filter({ has: page.locator(`label[for="${forId}"]`) });
}

function keywordsField(page: Page): Locator {
  return formItemByLabel(page, 'keywords').locator('input[type="text"]');
}

function locationSelect(page: Page): Locator {
  return formItemByLabel(page, 'location').locator('.ant-select').first();
}

function minSalaryField(page: Page): Locator {
  return formItemByLabel(page, 'minSalaryRange').locator('input[role="spinbutton"]');
}

function maxSalaryField(page: Page): Locator {
  return formItemByLabel(page, 'maxSalaryRange').locator('input[role="spinbutton"]');
}

function dailyRadio(page: Page): Locator {
  return addAlertDialog(page).locator('.ant-radio-wrapper').filter({ hasText: 'Daily' }).locator('input[type="radio"]');
}

function dropdownList(page: Page): Locator {
  return page.locator('.ant-select-dropdown:not(.ant-select-dropdown-hidden)').first();
}

function okButton(page: Page): Locator {
  return addAlertDialog(page).getByRole('button', { name: 'OK', exact: true });
}

async function selectAntOption(page: Page, select: Locator, optionText: string) {
  await select.click();
  const dropdown = dropdownList(page);
  await expect(dropdown).toBeVisible({ timeout: 10000 });
  await dropdown.getByText(optionText, { exact: true }).first().click();
  await page.waitForTimeout(500);
}

async function openAddAlertDialog(page: Page) {
  await loginAsFred(page);
  await goToAlerts(page);
  await addAlertButton(page).click();
  await expect(addAlertDialog(page)).toBeVisible({ timeout: 15000 });
}

test.describe('ALERTS-106357 — Verify Add Alert (Daily)', () => {
  test.describe.configure({ mode: 'serial' });

  test('TC-01: Login as Fred', async ({ page }) => {
    await loginAsFred(page);
    await expect(page).not.toHaveURL(/login/i);
    await expect(page.getByText('Your Dashboard')).toBeVisible({ timeout: 30000 });
  });

  test('TC-02: Click on Alerts menu item', async ({ page }) => {
    await loginAsFred(page);
    await goToAlerts(page);
    await expect(addAlertButton(page)).toBeVisible({ timeout: 15000 });
  });

  test('TC-03: Click Add Alert button', async ({ page }) => {
    await openAddAlertDialog(page);
    await expect(addAlertDialog(page)).toBeVisible({ timeout: 15000 });
  });

  test('TC-04: Populate Job Title/Keywords', async ({ page }) => {
    await openAddAlertDialog(page);
    // STEP: TYPE a job title/keyword
    await keywordsField(page).fill(JOB_TITLE);
    // ASSERT (BLOCKING) field contains the typed value
    await expect(keywordsField(page)).toHaveValue(JOB_TITLE);
  });

  test('TC-05: Click Location dropdown', async ({ page }) => {
    await openAddAlertDialog(page);
    // STEP: CLICK the Location dropdown
    await locationSelect(page).click();
    // ASSERT (BLOCKING) list of location options is displayed
    await expect(dropdownList(page)).toBeVisible({ timeout: 10000 });
  });

  test('TC-06: Select a location, e.g. Head Office', async ({ page }) => {
    await openAddAlertDialog(page);
    // STEP: SELECT "Head Office"
    await selectAntOption(page, locationSelect(page), LOCATION);
    // ASSERT (BLOCKING) location field displays the selected option
    await expect(locationSelect(page).locator('.ant-select-selection-item')).toHaveText(LOCATION, { timeout: 10000 });
  });

  test('TC-07: Populate Min Salary', async ({ page }) => {
    await openAddAlertDialog(page);
    // STEP: TYPE "20000" into Min Salary
    await minSalaryField(page).fill(MIN_SALARY);
    // ASSERT (BLOCKING) field contains the typed value
    await expect(minSalaryField(page)).toHaveValue(MIN_SALARY);
  });

  test('TC-08: Populate Max Salary', async ({ page }) => {
    await openAddAlertDialog(page);
    await minSalaryField(page).fill(MIN_SALARY);
    // STEP: TYPE "60000" into Max Salary
    await maxSalaryField(page).fill(MAX_SALARY);
    // ASSERT (BLOCKING) field contains the typed value
    await expect(maxSalaryField(page)).toHaveValue(MAX_SALARY);
  });

  test('TC-09: Click Daily radio button', async ({ page }) => {
    await openAddAlertDialog(page);
    // STEP: CLICK the Daily radio button
    await dailyRadio(page).check();
    // ASSERT (BLOCKING) Daily radio selected
    await expect(dailyRadio(page)).toBeChecked();
  });

  test('TC-10: Click OK button', async ({ page }) => {
    await openAddAlertDialog(page);
    await keywordsField(page).fill(JOB_TITLE);
    await selectAntOption(page, locationSelect(page), LOCATION);
    await minSalaryField(page).fill(MIN_SALARY);
    await maxSalaryField(page).fill(MAX_SALARY);
    await dailyRadio(page).check();
    // STEP: CLICK the OK button
    await okButton(page).click();
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(1500);
    // ASSERT (BLOCKING) the new alert is visible in the Alerts list
    await expect(page.getByText(JOB_TITLE).first()).toBeVisible({ timeout: 15000 });
  });
});
