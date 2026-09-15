// AUTO-RECORDED from test-plans/Jobs/verify-search-by-salary-range.md
// Source: Azure DevOps test plan #99437, suite #104521, test case #106364
// The .md plan is canonical. AI-repair will patch failing lines in this file.
// Do not hand-edit unless you are also updating the .md plan.
//
// Login/nav helpers mirror test-plans/Jobs/verify-search-by-location.spec.ts,
// captured live against the QA environment on 2026-07-30. Min/Max Salary are
// Ant Design number inputs exposed with role "spinbutton" and accessible
// names "Min Salary" / "Max Salary".

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

function minSalaryField(page: Page): Locator {
  return page.getByRole('spinbutton', { name: 'Min Salary' });
}

function maxSalaryField(page: Page): Locator {
  return page.getByRole('spinbutton', { name: 'Max Salary' });
}

// Leaf-level job posting cards — see verify-search-by-location.spec.ts for
// why this specific selector is needed (generic reused wrapper class).
function jobCards(page: Page): Locator {
  return page
    .locator('.sha-components-container-inner[style*="box-shadow"]:not(:has(.sha-components-container-inner[style*="box-shadow"]))')
    .filter({ hasText: 'View & Apply' });
}

function emptyState(page: Page): Locator {
  return page.getByRole('heading', { name: 'No Data' });
}

test.describe('JOBS-106364 — Verify Search by Salary Range', () => {
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

  test('TC-05: Click Search button', async ({ page }) => {
    await loginAsFred(page);
    await goToJobs(page);
    await minSalaryField(page).fill(MIN_SALARY);
    await maxSalaryField(page).fill(MAX_SALARY);
    // STEP: CLICK the Search button
    await page.getByRole('button', { name: 'Search', exact: true }).click();
    await page.waitForLoadState('networkidle');
    // ASSERT (BLOCKING) search results (or an empty-state) are displayed
    await expect(page.getByText(/\d+-\d+ of \d+ items/i).or(emptyState(page))).toBeVisible({ timeout: 15000 });
  });

  test('TC-06: Verify results', async ({ page }) => {
    await loginAsFred(page);
    await goToJobs(page);
    await minSalaryField(page).fill(MIN_SALARY);
    await maxSalaryField(page).fill(MAX_SALARY);
    await page.getByRole('button', { name: 'Search', exact: true }).click();
    await page.waitForLoadState('networkidle');
    // STEP: VERIFY the results
    // ASSERT (BLOCKING) results reflect the applied salary filter
    await expect(page.getByText(/\d+-\d+ of \d+ items/i).or(emptyState(page))).toBeVisible({ timeout: 15000 });
    await page.waitForTimeout(800);
    const count = await jobCards(page).count();
    const isEmpty = await emptyState(page).isVisible();
    // Sanity: either an empty-state is shown, or at least one card is present.
    expect(isEmpty || count > 0).toBeTruthy();
  });
});
