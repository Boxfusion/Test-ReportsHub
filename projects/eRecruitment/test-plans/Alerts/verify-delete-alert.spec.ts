// AUTO-RECORDED from test-plans/Alerts/verify-delete-alert.md
// Source: Azure DevOps test plan #99437, suite #104540, test case #106360
// The .md plan is canonical. AI-repair will patch failing lines in this file.
// Do not hand-edit unless you are also updating the .md plan.
//
// Steps 1-10 are the same Add Alert flow as verify-add-alert-daily.spec.ts
// (#106357). Steps 11-14 exercise the Delete icon on the Alerts list table —
// same confirmation-popover pattern as every other delete flow in this repo
// (see Profile/verify-delete-skill.spec.ts): row-scoped
// getByRole('button', { name: 'delete' }) + `.ant-popover, .ant-popconfirm`
// with Cancel/OK buttons.

import { test, expect, Page, Locator } from '@playwright/test';

const APP_URL = 'https://pd-recruitment-publicportal-1-qa.shesha.app/';
const APPLICANT = { user: 'Fred', password: 'Metaganemr%03' };
const JOB_TITLE = 'DeleteAlertQA';
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

function alertRow(page: Page): Locator {
  return page.getByRole('row', { name: new RegExp(JOB_TITLE) });
}

function deleteIcon(page: Page): Locator {
  return alertRow(page).getByRole('button', { name: 'delete' });
}

function confirmPopover(page: Page): Locator {
  return page.locator('.ant-popover, .ant-popconfirm').filter({ hasText: /delete/i });
}

// The alert list is real server-side state shared across test runs, so a
// prior run (or a prior TC in this same run) can leave stale "DeleteAlertQA"
// rows behind. Clear them all before creating a fresh one so every TC deals
// with exactly one matching row.
async function deleteAllMatchingAlertRows(page: Page) {
  // The Alerts table hydrates a moment after networkidle/goToAlerts settle,
  // so an immediate count() can read 0 on a table that's still populating.
  // Wait, then re-check once more before trusting a 0 count.
  await page.waitForLoadState('networkidle');
  await page.waitForTimeout(1500);
  if ((await alertRow(page).count()) === 0) {
    await page.waitForTimeout(1500);
  }
  let guard = 0;
  while ((await alertRow(page).count()) > 0 && guard < 10) {
    guard++;
    await deleteIcon(page).first().click();
    await page.waitForTimeout(500);
    const popover = confirmPopover(page);
    await expect(popover).toBeVisible({ timeout: 10000 });
    await popover.getByRole('button', { name: 'OK' }).click();
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(1000);
  }
}

async function createAlert(page: Page) {
  await loginAsFred(page);
  await goToAlerts(page);
  await deleteAllMatchingAlertRows(page);
  await addAlertButton(page).click();
  await expect(addAlertDialog(page)).toBeVisible({ timeout: 15000 });
  await keywordsField(page).fill(JOB_TITLE);
  await selectAntOption(page, locationSelect(page), LOCATION);
  await minSalaryField(page).fill(MIN_SALARY);
  await maxSalaryField(page).fill(MAX_SALARY);
  await dailyRadio(page).check();
  await okButton(page).click();
  await page.waitForLoadState('networkidle');
  await page.waitForTimeout(1500);
  await expect(alertRow(page)).toBeVisible({ timeout: 15000 });
  await expect(alertRow(page)).toHaveCount(1);
}

test.describe('ALERTS-106360 — Verify Delete Alert', () => {
  test.describe.configure({ mode: 'serial' });
  test.setTimeout(120_000);

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
    await keywordsField(page).fill(JOB_TITLE);
    await expect(keywordsField(page)).toHaveValue(JOB_TITLE);
  });

  test('TC-05: Click Location dropdown', async ({ page }) => {
    await openAddAlertDialog(page);
    await locationSelect(page).click();
    await expect(dropdownList(page)).toBeVisible({ timeout: 10000 });
  });

  test('TC-06: Select a location, e.g. Head Office', async ({ page }) => {
    await openAddAlertDialog(page);
    await selectAntOption(page, locationSelect(page), LOCATION);
    await expect(locationSelect(page).locator('.ant-select-selection-item')).toHaveText(LOCATION, { timeout: 10000 });
  });

  test('TC-07: Populate Min Salary', async ({ page }) => {
    await openAddAlertDialog(page);
    await minSalaryField(page).fill(MIN_SALARY);
    await expect(minSalaryField(page)).toHaveValue(MIN_SALARY);
  });

  test('TC-08: Populate Max Salary', async ({ page }) => {
    await openAddAlertDialog(page);
    await minSalaryField(page).fill(MIN_SALARY);
    await maxSalaryField(page).fill(MAX_SALARY);
    await expect(maxSalaryField(page)).toHaveValue(MAX_SALARY);
  });

  test('TC-09: Click Daily radio button', async ({ page }) => {
    await openAddAlertDialog(page);
    await dailyRadio(page).check();
    await expect(dailyRadio(page)).toBeChecked();
  });

  test('TC-10: Click OK button (create alert)', async ({ page }) => {
    await createAlert(page);
    await expect(alertRow(page)).toBeVisible();
  });

  test('TC-11: Click the Delete icon (first time)', async ({ page }) => {
    await createAlert(page);
    // STEP: CLICK the Delete icon on the newly-added alert row
    await deleteIcon(page).click();
    await page.waitForTimeout(500);
    // ASSERT (BLOCKING) confirmation popover is visible with Cancel and OK
    const popover = confirmPopover(page);
    await expect(popover).toBeVisible({ timeout: 10000 });
    await expect(popover.getByRole('button', { name: 'Cancel' })).toBeVisible();
    await expect(popover.getByRole('button', { name: 'OK' })).toBeVisible();
  });

  test('TC-12: Click Cancel button', async ({ page }) => {
    await createAlert(page);
    await deleteIcon(page).click();
    await page.waitForTimeout(500);
    const popover = confirmPopover(page);
    await expect(popover).toBeVisible({ timeout: 10000 });
    // STEP: CLICK the Cancel button
    await popover.getByRole('button', { name: 'Cancel' }).click();
    await page.waitForTimeout(500);
    // ASSERT (BLOCKING) popover closes and alert row is still present
    await expect(popover).not.toBeVisible({ timeout: 10000 });
    await expect(alertRow(page)).toBeVisible();
  });

  test('TC-13: Click the Delete icon again', async ({ page }) => {
    await createAlert(page);
    await deleteIcon(page).click();
    await page.waitForTimeout(500);
    await confirmPopover(page).getByRole('button', { name: 'Cancel' }).click();
    await page.waitForTimeout(500);

    // STEP: CLICK the Delete icon again
    await deleteIcon(page).click();
    await page.waitForTimeout(500);
    // ASSERT (BLOCKING) confirmation popover is visible again
    const popover = confirmPopover(page);
    await expect(popover).toBeVisible({ timeout: 10000 });
    await expect(popover.getByRole('button', { name: 'OK' })).toBeVisible();
  });

  test('TC-14: Click OK button (confirm delete)', async ({ page }) => {
    await createAlert(page);
    await deleteIcon(page).click();
    await page.waitForTimeout(500);
    await confirmPopover(page).getByRole('button', { name: 'Cancel' }).click();
    await page.waitForTimeout(500);
    await deleteIcon(page).click();
    await page.waitForTimeout(500);
    const popover = confirmPopover(page);
    await expect(popover).toBeVisible({ timeout: 10000 });

    // STEP: CLICK the OK button
    await popover.getByRole('button', { name: 'OK' }).click();
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(1000);
    // ASSERT (BLOCKING) the alert row is no longer present
    await expect(alertRow(page)).toHaveCount(0);
  });
});
