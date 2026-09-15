// AUTO-RECORDED from test-plans/Jobs/cancel-job-application.md
// Source: Azure DevOps test plan #99437, suite #104521, test case #106369
// The .md plan is canonical. AI-repair will patch failing lines in this file.
// Do not hand-edit unless you are also updating the .md plan.
//
// Read-only / non-destructive: never clicks Submit Application, so the job
// applied to remains in the listing throughout. Reuses helpers/selectors
// confirmed live in verify-apply-for-a-job.spec.ts on 2026-07-30.
//
// The Close confirmation is an ant-modal-confirm titled "Close without
// submitting." with content "Your application won't be submitted and any
// progress will be lost.", buttons Cancel / Confirm (confirmed live
// 2026-07-30). "Close" inside the Apply dialog resolves to two elements
// (the modal's X icon and the toolbar Close button) — disambiguated via
// the toolbar button's class.

import { test, expect, Page, Locator } from '@playwright/test';

const APP_URL = 'https://pd-recruitment-publicportal-1-qa.shesha.app/';
const APPLICANT = { user: 'Fred', password: 'Metaganemr%03' };

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

// Leaf-level job posting cards — see verify-search-by-location.spec.ts for
// why this specific selector is needed (generic reused wrapper class).
function jobCards(page: Page): Locator {
  return page
    .locator('.sha-components-container-inner[style*="box-shadow"]:not(:has(.sha-components-container-inner[style*="box-shadow"]))')
    .filter({ hasText: 'View & Apply' });
}

// The shared QA Jobs dataset is under concurrent modification by other
// testers/processes — confirmed live 2026-07-30 during test case #106368.
async function waitForJobsAvailable(page: Page, maxAttempts = 6) {
  for (let attempt = 1; attempt <= maxAttempts; attempt++) {
    try {
      await expect(jobCards(page).first()).toBeVisible({ timeout: 8000 });
      return;
    } catch (err) {
      if (attempt === maxAttempts) throw err;
      await page.reload();
      await page.waitForLoadState('networkidle');
      await page.waitForTimeout(2000);
    }
  }
}

async function openFirstJobApply(page: Page): Promise<string> {
  await waitForJobsAvailable(page);
  const first = jobCards(page).first();
  const titleText = (await first.locator('strong').first().innerText()).trim();
  await first.getByRole('link', { name: 'View & Apply' }).click();
  await page.waitForLoadState('networkidle');
  await page.waitForTimeout(1000);
  return titleText;
}

async function clickApplyButton(page: Page) {
  const applyBtn = page.getByRole('button', { name: 'Apply', exact: true });
  await applyBtn.scrollIntoViewIfNeeded();
  await applyBtn.click();
  await page.waitForTimeout(1000);
}

function applyDialog(page: Page): Locator {
  return page.locator('.ant-modal-content').filter({ hasText: 'Z83' }).first();
}

// "Close" resolves to two elements in the dialog: the modal's aria-label
// close icon (X) and the actual toolbar "Close" button. Disambiguate via
// the toolbar button's class (confirmed live 2026-07-30).
function closeButton(page: Page): Locator {
  return applyDialog(page).locator('button.sha-toolbar-btn').filter({ hasText: 'Close' });
}

function closeConfirmDialog(page: Page): Locator {
  return page.locator('.ant-modal-confirm').filter({ hasText: 'Close without submitting' });
}

async function fullFlowToApplyDialog(page: Page): Promise<string> {
  await loginAsFred(page);
  await goToJobs(page);
  const title = await openFirstJobApply(page);
  await clickApplyButton(page);
  await expect(applyDialog(page)).toBeVisible({ timeout: 15000 });
  return title;
}

test.describe('JOBS-106369 — Cancel Job Application', () => {
  test.describe.configure({ mode: 'serial' });

  test('TC-01: Login as Fred', async ({ page }) => {
    await loginAsFred(page);
    await expect(page).not.toHaveURL(/login/i);
    await expect(page.getByText('Your Dashboard')).toBeVisible({ timeout: 30000 });
  });

  test('TC-02: Click on Jobs menu item', async ({ page }) => {
    await loginAsFred(page);
    await goToJobs(page);
    await waitForJobsAvailable(page);
  });

  test('TC-03: Click View & Apply on a job post', async ({ page }) => {
    await loginAsFred(page);
    await goToJobs(page);
    const title = await openFirstJobApply(page);
    console.log('TARGET_JOB_TITLE:', title);
    await expect(page.getByRole('button', { name: 'Apply', exact: true })).toBeVisible({ timeout: 15000 });
  });

  test('TC-04: Click Apply button', async ({ page }) => {
    await loginAsFred(page);
    await goToJobs(page);
    await openFirstJobApply(page);
    await clickApplyButton(page);
    await expect(applyDialog(page)).toBeVisible({ timeout: 15000 });
  });

  test('TC-05: Click Close button', async ({ page }) => {
    await fullFlowToApplyDialog(page);
    // STEP: CLICK the Close button
    await closeButton(page).click();
    // ASSERT (BLOCKING) "Close Without submitting" confirmation popup is visible
    await expect(closeConfirmDialog(page)).toBeVisible({ timeout: 10000 });
  });

  test('TC-06: Click Cancel', async ({ page }) => {
    await fullFlowToApplyDialog(page);
    await closeButton(page).click();
    const confirm = closeConfirmDialog(page);
    await expect(confirm).toBeVisible({ timeout: 10000 });
    // STEP: CLICK Cancel on the confirmation popup
    await confirm.getByRole('button', { name: 'Cancel', exact: true }).click();
    await page.waitForTimeout(500);
    // ASSERT (BLOCKING) confirmation popup closes; Apply dialog remains open
    await expect(confirm).toBeHidden({ timeout: 10000 });
    await expect(applyDialog(page)).toBeVisible();
  });

  test('TC-07: Click Close button again', async ({ page }) => {
    await fullFlowToApplyDialog(page);
    await closeButton(page).click();
    const confirm = closeConfirmDialog(page);
    await expect(confirm).toBeVisible({ timeout: 10000 });
    await confirm.getByRole('button', { name: 'Cancel', exact: true }).click();
    await expect(confirm).toBeHidden({ timeout: 10000 });
    // STEP: CLICK the Close button again
    await closeButton(page).click();
    // ASSERT (BLOCKING) "Close Without submitting" confirmation popup appears again
    await expect(closeConfirmDialog(page)).toBeVisible({ timeout: 10000 });
  });

  test('TC-08: Click Confirm button', async ({ page }) => {
    const targetTitle = await fullFlowToApplyDialog(page);
    await closeButton(page).click();
    const confirm = closeConfirmDialog(page);
    await expect(confirm).toBeVisible({ timeout: 10000 });
    // STEP: CLICK the Confirm button
    await confirm.getByRole('button', { name: 'Confirm', exact: true }).click();
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(1500);
    // ASSERT (BLOCKING) Apply dialog is closed
    await expect(applyDialog(page)).toBeHidden({ timeout: 15000 });
    // ASSERT (BLOCKING) system navigates back to the Jobs listing
    await expect(page).toHaveURL(/public-jobs/, { timeout: 20000 });
    // ASSERT (BLOCKING) the job selected in TC-03 is still present (no application submitted)
    if (targetTitle) {
      await expect(jobCards(page).filter({ hasText: targetTitle }).first()).toBeVisible({ timeout: 15000 });
    }
  });
});
