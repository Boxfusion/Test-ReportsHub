// AUTO-RECORDED from test-plans/Profile/verify-no-tertiary-qualification.md
// Source: Azure DevOps test plan #99437, suite #104586, test case #104625
// The .md plan is canonical. AI-repair will patch failing lines in this file.
// Do not hand-edit unless you are also updating the .md plan.
//
// The "I do not have a Tertiary Qualification." checkbox only renders when
// the qualifications table is empty, so TC-03 deletes any existing row(s)
// first (same delete + Popconfirm "OK" pattern as verify-languages.spec.ts).
// The checkbox itself has no accessible text association in the DOM, but is
// the only checkbox on the page once the table is empty, so it's targeted
// directly via `input[type="checkbox"]`.

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

async function goToTertiaryQualifications(page: Page) {
  await page.getByRole('link', { name: 'Manage Profile' }).click();
  await page.waitForLoadState('networkidle');
  await page.getByRole('button', { name: 'Tertiary Qualifications' }).click();
  await page.waitForTimeout(1500);
  if (!(await page.getByRole('heading', { name: 'Tertiary Qualifications' }).isVisible().catch(() => false))) {
    await page.getByRole('button', { name: 'Tertiary Qualifications' }).click();
    await page.waitForTimeout(1500);
  }
}

// Deletes every existing qualification row, confirming the delete popover each time.
async function deleteTertiaryQualificationRows(page: Page) {
  let guard = 0;
  while ((await page.getByRole('button', { name: 'delete' }).count()) > 0 && guard < 10) {
    guard++;
    await page.getByRole('button', { name: 'delete' }).first().click();
    await page.waitForTimeout(400);
    await page.getByRole('button', { name: 'OK' }).click();
    await page.waitForTimeout(800);
  }
}

test.describe('PROFILE-104625 — Verify I do not have a Tertiary Qualification', () => {
  test.describe.configure({ mode: 'serial' });

  test('TC-01: Login as Fred', async ({ page }) => {
    // STEP 1-5: NAVIGATE, TYPE Username/Password, CLICK Sign In
    await loginAsFred(page);
    // ASSERT (BLOCKING) URL no longer contains /login and Dashboard is visible
    await expect(page).not.toHaveURL(/login/i);
    await expect(page.getByText('Your Dashboard')).toBeVisible({ timeout: 30000 });
  });

  test('TC-02: Click on Tertiary Qualifications tab', async ({ page }) => {
    await loginAsFred(page);
    // STEP: CLICK Manage Profile, then CLICK the Tertiary Qualifications step
    await goToTertiaryQualifications(page);
    // ASSERT (BLOCKING) Tertiary Qualifications heading visible
    await expect(page.getByRole('heading', { name: 'Tertiary Qualifications' })).toBeVisible({ timeout: 15000 });
  });

  test('TC-03: Remove any existing Tertiary Qualification entries', async ({ page }) => {
    await loginAsFred(page);
    await goToTertiaryQualifications(page);
    // STEP: delete any existing rows so the "I do not have..." checkbox renders
    await deleteTertiaryQualificationRows(page);
    // ASSERT (BLOCKING) the checkbox text is visible; Next disabled while unchecked
    await expect(page.getByText('I do not have a Tertiary Qualification', { exact: false })).toBeVisible();
    await expect(page.getByRole('button', { name: 'Next', exact: true })).toBeDisabled();
  });

  test('TC-04: Check "I do not have a Tertiary Qualification" checkbox', async ({ page }) => {
    await loginAsFred(page);
    await goToTertiaryQualifications(page);
    await deleteTertiaryQualificationRows(page);
    // STEP: CHECK the "I do not have a Tertiary Qualification" checkbox
    const checkbox = page.locator('input[type="checkbox"]');
    await checkbox.check();
    await page.waitForTimeout(500);
    // ASSERT (BLOCKING) checkbox checked; Next enabled
    await expect(checkbox).toBeChecked();
    await expect(page.getByRole('button', { name: 'Next', exact: true })).toBeEnabled();
  });

  test('TC-05: Click Next button', async ({ page }) => {
    await loginAsFred(page);
    await goToTertiaryQualifications(page);
    await deleteTertiaryQualificationRows(page);
    const checkbox = page.locator('input[type="checkbox"]');
    await checkbox.check();
    await page.waitForTimeout(500);

    // STEP: CLICK the Next button
    await page.getByRole('button', { name: 'Next', exact: true }).click();
    await page.waitForTimeout(1500);
    // ASSERT (BLOCKING) Work Experience heading is visible
    await expect(page.getByRole('heading', { name: 'Work Experience' })).toBeVisible({ timeout: 15000 });
  });
});
