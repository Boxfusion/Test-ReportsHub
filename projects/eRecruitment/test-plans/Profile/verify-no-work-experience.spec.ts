// AUTO-RECORDED from test-plans/Profile/verify-no-work-experience.md
// Source: Azure DevOps test plan #99437, suite #104586, test case #104636
// The .md plan is canonical. AI-repair will patch failing lines in this file.
// Do not hand-edit unless you are also updating the .md plan.
//
// The Work Experience table has no leftover rows, so the "I do not have any
// work experience." checkbox is visible by default (same empty-state-only
// rule as verify-no-tertiary-qualification.spec.ts). The checkbox persists
// as already-checked from prior session state, so this spec unchecks it
// first to prove Next responds, before re-checking it.

import { test, expect, Page } from '@playwright/test';

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

async function goToWorkExperience(page: Page) {
  await page.getByRole('link', { name: 'Manage Profile' }).click();
  await page.waitForLoadState('networkidle');
  await page.getByRole('button', { name: 'Work Experience' }).click();
  await page.waitForTimeout(1500);
  if (!(await page.getByRole('heading', { name: 'Work Experience' }).isVisible().catch(() => false))) {
    await page.getByRole('button', { name: 'Work Experience' }).click();
    await page.waitForTimeout(1500);
  }
}

test.describe('PROFILE-104636 — I do not have Work Experience', () => {
  test.describe.configure({ mode: 'serial' });

  test('TC-01: Login as Fred', async ({ page }) => {
    // STEP 1-5: NAVIGATE, TYPE Username/Password, CLICK Sign In
    await loginAsFred(page);
    // ASSERT (BLOCKING) URL no longer contains /login and Dashboard is visible
    await expect(page).not.toHaveURL(/login/i);
    await expect(page.getByText('Your Dashboard')).toBeVisible({ timeout: 30000 });
  });

  test('TC-02: Click on Work Experience tab', async ({ page }) => {
    await loginAsFred(page);
    // STEP: CLICK Manage Profile, then CLICK the Work Experience step
    await goToWorkExperience(page);
    // ASSERT (BLOCKING) Work Experience heading visible
    await expect(page.getByRole('heading', { name: 'Work Experience' })).toBeVisible({ timeout: 15000 });
  });

  test('TC-03: Check "I do not have any work experience" checkbox', async ({ page }) => {
    await loginAsFred(page);
    await goToWorkExperience(page);
    const checkbox = page.locator('input[type="checkbox"]');
    const nextBtn = page.getByRole('button', { name: 'Next', exact: true });

    // precondition: establish a known unchecked starting state
    if (await checkbox.isChecked()) {
      await checkbox.uncheck();
      await page.waitForTimeout(500);
    }
    // ASSERT Next is disabled while unchecked (confirms the checkbox drives Next)
    await expect(nextBtn).toBeDisabled();

    // STEP: CHECK the "I do not have any work experience" checkbox
    await checkbox.check();
    await page.waitForTimeout(500);
    // ASSERT (BLOCKING) checkbox checked; Next enabled
    await expect(checkbox).toBeChecked();
    await expect(nextBtn).toBeEnabled();
  });

  test('TC-04: Click Next button', async ({ page }) => {
    await loginAsFred(page);
    await goToWorkExperience(page);
    const checkbox = page.locator('input[type="checkbox"]');
    if (!(await checkbox.isChecked())) {
      await checkbox.check();
      await page.waitForTimeout(500);
    }

    // STEP: CLICK the Next button
    await page.getByRole('button', { name: 'Next', exact: true }).click();
    await page.waitForTimeout(1500);
    // ASSERT (BLOCKING) Skills heading is visible
    await expect(page.getByRole('heading', { name: 'Skills' })).toBeVisible({ timeout: 15000 });
  });
});
