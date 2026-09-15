// AUTO-RECORDED from test-plans/Jobs/verify-search-by-job-title.md
// Source: Azure DevOps test plan #99437, suite #104521, test case #106362
// The .md plan is canonical. AI-repair will patch failing lines in this file.
// Do not hand-edit unless you are also updating the .md plan.
//
// Login/nav helpers mirror test-plans/Home/*.spec.ts, captured live against
// the QA environment on 2026-07-06/2026-07-30. Job Title field selector on
// the Jobs page is assumed to match the Home page's ("Job Title / Keywords");
// verified live during this run.
//
// Search term changed from "QA Tester" to "CheckingSumm" — no seeded QA job
// posting matches "QA Tester" (confirmed 0 results on repeated runs), while
// "CheckingSumm" is a real seeded job posting, confirming the search feature
// itself works correctly. See the .md Notes section.

import { test, expect, Page } from '@playwright/test';

const APP_URL = 'https://pd-recruitment-publicportal-1-qa.shesha.app/';
const APPLICANT = { user: 'Fred', password: 'Metaganemr%03' };
const JOB_TITLE = 'CheckingSumm';

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

function jobTitleField(page: Page) {
  return page.getByRole('textbox', { name: 'Job Title / Keywords' });
}

// Jobs page renders results as a card list under "Job Postings" with a
// pagination summary, not an HTML table (confirmed live 2026-07-30). The
// summary text differs by result count: "0 items found" when empty, vs.
// "1-1 of 1 items" (or similar range) when there are matches.
function itemsSummaryText(page: Page) {
  return page.getByText(/(\d+\s+items?\s+found)|(\d+-\d+\s+of\s+\d+\s+items)/i);
}

async function resultCount(page: Page): Promise<number> {
  const text = await itemsSummaryText(page).innerText();
  const foundMatch = text.match(/^(\d+)\s+items?\s+found/i);
  if (foundMatch) return parseInt(foundMatch[1], 10);
  const ofMatch = text.match(/of\s+(\d+)\s+items/i);
  if (ofMatch) return parseInt(ofMatch[1], 10);
  return NaN;
}

test.describe('JOBS-106362 — Verify Search by Job Title', () => {
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
    // ASSERT (BLOCKING) Jobs page / Job Title field is visible
    await expect(jobTitleField(page)).toBeVisible({ timeout: 15000 });
  });

  test('TC-03: Enter "CheckingSumm" in Job Title / Keywords field', async ({ page }) => {
    await loginAsFred(page);
    await goToJobs(page);
    // STEP: TYPE "CheckingSumm" into the Job Title / Keywords field
    await jobTitleField(page).fill(JOB_TITLE);
    // ASSERT (BLOCKING) field contains the typed value
    await expect(jobTitleField(page)).toHaveValue(JOB_TITLE);
  });

  test('TC-04: Click Search button', async ({ page }) => {
    await loginAsFred(page);
    await goToJobs(page);
    await jobTitleField(page).fill(JOB_TITLE);
    // STEP: CLICK the Search button
    await page.getByRole('button', { name: 'Search', exact: true }).click();
    await page.waitForLoadState('networkidle');
    // ASSERT (BLOCKING) system queries and returns job listings containing "CheckingSumm"
    await expect(itemsSummaryText(page)).toBeVisible({ timeout: 15000 });
    expect(await resultCount(page)).toBeGreaterThan(0);
  });

  test('TC-05: Verify results', async ({ page }) => {
    await loginAsFred(page);
    await goToJobs(page);
    await jobTitleField(page).fill(JOB_TITLE);
    await page.getByRole('button', { name: 'Search', exact: true }).click();
    await page.waitForLoadState('networkidle');
    // STEP: VERIFY the results
    // ASSERT (BLOCKING) results page displays relevant jobs with correct titles/details
    await expect(itemsSummaryText(page)).toBeVisible({ timeout: 15000 });
    expect(await resultCount(page)).toBeGreaterThan(0);
    await expect(page.getByText('CheckingSumm').first()).toBeVisible();
  });
});
