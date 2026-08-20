// AUTO-RECORDED from test-plans/Jobs/verify-clear-all-filters.md
// Source: Azure DevOps test plan #99437, suite #104521, test case #106366
// The .md plan is canonical. AI-repair will patch failing lines in this file.
// Do not hand-edit unless you are also updating the .md plan.
//
// Login/nav helpers and field selectors mirror
// test-plans/Jobs/verify-search-by-salary-range.spec.ts and
// verify-search-by-location.spec.ts, captured live against the QA
// environment on 2026-07-30. "Any Location" is the Ant Select's placeholder
// text shown when the location combobox has no value selected.

import { test, expect, Page, Locator } from '@playwright/test';

const APP_URL = 'https://pd-recruitment-publicportal-1-qa.shesha.app/';
const APPLICANT = { user: 'Fred', password: 'Metaganemr%03' };
const MIN_SALARY = '20000';
const MAX_SALARY = '40000';

async function loginAsFred(page: Page) {
  await page.goto(`${APP_URL}login`);
  await page.locator('input[type="text"]').first().fill(APPLICANT.user);
  await page.locator('input[type="password"]').first().fill(APPLICANT.password);
  await page.getByRole('button', { name: /sign in/i }).click();
  await page.waitForURL(url => !url.href.includes('/login'), { timeout: 30000 });
  await page.waitForLoadState('networkidle');
}

async function goToJobs(page: Page) {
  await page.getByRole('link', { name: 'Jobs', exact: true }).click();
  await page.waitForLoadState('networkidle');
  await page.waitForTimeout(1000);
}

function jobTitleField(page: Page): Locator {
  return page.getByRole('textbox', { name: 'Job Title / Keywords' });
}

function locationField(page: Page): Locator {
  return page.getByRole('combobox').first();
}

function minSalaryField(page: Page): Locator {
  return page.getByRole('spinbutton', { name: 'Min Salary' });
}

function maxSalaryField(page: Page): Locator {
  return page.getByRole('spinbutton', { name: 'Max Salary' });
}

function clearAllFiltersButton(page: Page): Locator {
  return page.getByRole('button', { name: 'Clear All Filters', exact: true });
}

test.describe('JOBS-106366 — Verify Clear All Filters', () => {
  test.describe.configure({ mode: 'serial' });

  test('TC-01: Login as Fred', async ({ page }) => {
    await loginAsFred(page);
    // ASSERT (BLOCKING) URL no longer contains /login and Dashboard is visible
    await expect(page).not.toHaveURL(/login/i);
    await expect(page.getByText('Your Dashboard')).toBeVisible({ timeout: 30000 });
  });

  test('TC-02: Click on Jobs menu item', async ({ page }) => {
    await loginAsFred(page);
    // STEP: CLICK the Jobs menu item
    await goToJobs(page);
    // ASSERT (BLOCKING) Jobs page / Min Salary field is visible
    await expect(minSalaryField(page)).toBeVisible({ timeout: 15000 });
  });

  test('TC-03: Enter "20000" in Min Salary', async ({ page }) => {
    await loginAsFred(page);
    await goToJobs(page);
    // STEP: TYPE "20000" into the Min Salary field
    await minSalaryField(page).fill(MIN_SALARY);
    // ASSERT (BLOCKING) field contains the typed value
    await expect(minSalaryField(page)).toHaveValue(MIN_SALARY);
  });

  test('TC-04: Enter "40000" in Max Salary', async ({ page }) => {
    await loginAsFred(page);
    await goToJobs(page);
    await minSalaryField(page).fill(MIN_SALARY);
    // STEP: TYPE "40000" into the Max Salary field
    await maxSalaryField(page).fill(MAX_SALARY);
    // ASSERT (BLOCKING) field contains the typed value
    await expect(maxSalaryField(page)).toHaveValue(MAX_SALARY);
  });

  test('TC-05: Click Clear All Filters button', async ({ page }) => {
    await loginAsFred(page);
    await goToJobs(page);
    await minSalaryField(page).fill(MIN_SALARY);
    await maxSalaryField(page).fill(MAX_SALARY);
    // STEP: CLICK the Clear All Filters button
    await clearAllFiltersButton(page).click();
    await page.waitForTimeout(500);
    // ASSERT (BLOCKING) Job Title blank, Location shows "Any Location", salary fields empty
    await expect(jobTitleField(page)).toHaveValue('');
    await expect(page.getByText('Any Location')).toBeVisible();
    await expect(minSalaryField(page)).toHaveValue('');
    await expect(maxSalaryField(page)).toHaveValue('');
  });

  test('TC-06: Verify reset', async ({ page }) => {
    await loginAsFred(page);
    await goToJobs(page);
    await minSalaryField(page).fill(MIN_SALARY);
    await maxSalaryField(page).fill(MAX_SALARY);
    await clearAllFiltersButton(page).click();
    await page.waitForTimeout(500);
    // STEP: VERIFY the form's reset state
    // ASSERT (BLOCKING) all fields remain default/empty and enabled for new input
    await expect(jobTitleField(page)).toHaveValue('');
    await expect(jobTitleField(page)).toBeEnabled();
    await expect(page.getByText('Any Location')).toBeVisible();
    await expect(locationField(page)).toBeEnabled();
    await expect(minSalaryField(page)).toHaveValue('');
    await expect(minSalaryField(page)).toBeEnabled();
    await expect(maxSalaryField(page)).toHaveValue('');
    await expect(maxSalaryField(page)).toBeEnabled();
  });
});
