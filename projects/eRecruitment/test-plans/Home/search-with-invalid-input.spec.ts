// AUTO-RECORDED from test-plans/Home/search-with-invalid-input.md
// Source: Azure DevOps test plan #99437, suite #106554, test case #106560
// The .md plan is canonical. AI-repair will patch failing lines in this file.
// Do not hand-edit unless you are also updating the .md plan.
//
// Selectors reused from verify-valid-job-title-and-location.spec.ts (captured
// live against the QA environment on 2026-07-30): job title is a plain
// textbox named "Job Title / Keywords"; location is the page's single
// Ant Design combobox with no accessible name/placeholder.
//
// ADO step 6 expects a "No jobs found" message, but the QA environment
// actually renders the results table with a "No Data" / "No data is
// available for this table" empty state. Asserting the observed text.

import { test, expect, Page } from '@playwright/test';

const APP_URL = 'https://pd-recruitment-publicportal-1-qa.shesha.app/';
const APPLICANT = { user: 'Fred', password: 'Metaganemr%03' };
const INVALID_JOB_TITLE = '@@@';

async function loginAsFred(page: Page) {
  await page.goto(`${APP_URL}login`);
  await page.locator('input[type="text"]').first().fill(APPLICANT.user);
  await page.locator('input[type="password"]').first().fill(APPLICANT.password);
  await page.getByRole('button', { name: /sign in/i }).click();
  await page.waitForURL(url => !url.href.includes('/login'), { timeout: 30000 });
  await page.waitForLoadState('networkidle');
}

async function goToHome(page: Page) {
  await page.getByRole('link', { name: 'Home', exact: true }).click();
  await page.waitForLoadState('networkidle');
  await page.waitForTimeout(1000);
}

function jobTitleField(page: Page) {
  return page.getByRole('textbox', { name: 'Job Title / Keywords' });
}

function locationField(page: Page) {
  return page.getByRole('combobox').first();
}

test.describe('HOME-106560 — Search with Invalid Input', () => {
  test.describe.configure({ mode: 'serial' });

  test('TC-01: Login as Fred', async ({ page }) => {
    await loginAsFred(page);
    // ASSERT (BLOCKING) URL no longer contains /login and Dashboard is visible
    await expect(page).not.toHaveURL(/login/i);
    await expect(page.getByText('Your Dashboard')).toBeVisible({ timeout: 30000 });
  });

  test('TC-02: Click on Home menu item', async ({ page }) => {
    await loginAsFred(page);
    // STEP: CLICK the Home menu item
    await goToHome(page);
    // ASSERT (BLOCKING) job title text area, location dropdown and Search button visible
    await expect(jobTitleField(page)).toBeVisible({ timeout: 15000 });
    await expect(locationField(page)).toBeVisible();
    await expect(page.getByRole('button', { name: 'Search', exact: true })).toBeVisible();
  });

  test('TC-03: Enter "@@@" in the job title field', async ({ page }) => {
    await loginAsFred(page);
    await goToHome(page);
    // STEP: TYPE "@@@" into the Job Title field
    await jobTitleField(page).fill(INVALID_JOB_TITLE);
    // ASSERT (BLOCKING) Job Title field contains the typed value
    await expect(jobTitleField(page)).toHaveValue(INVALID_JOB_TITLE);
  });

  test('TC-04: Leave location field blank', async ({ page }) => {
    await loginAsFred(page);
    await goToHome(page);
    await jobTitleField(page).fill(INVALID_JOB_TITLE);
    // STEP: Leave the location field blank
    // ASSERT (BLOCKING) location field remains empty
    await expect(locationField(page)).toHaveText('');
  });

  test('TC-05: Click on Search button', async ({ page }) => {
    await loginAsFred(page);
    await goToHome(page);
    await jobTitleField(page).fill(INVALID_JOB_TITLE);
    // STEP: CLICK the Search button
    await page.getByRole('button', { name: 'Search', exact: true }).click();
    await page.waitForLoadState('networkidle');
    // ASSERT (BLOCKING) no job results are returned for the invalid input —
    // only the header row should remain; any data row means the search
    // incorrectly matched "@@@" and this test case must fail.
    await expect(page.getByRole('table')).toBeVisible({ timeout: 15000 });
    await expect(page.getByRole('row')).toHaveCount(1);
    // ASSERT (BLOCKING) the "No Data" empty-state is displayed on the results table
    await expect(page.getByRole('heading', { name: 'No Data' })).toBeVisible();
    await expect(page.getByText('No data is available for this table')).toBeVisible();
  });
});
