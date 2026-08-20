// AUTO-RECORDED from test-plans/Home/refresh-the-home-page.md
// Source: Azure DevOps test plan #99437, suite #106554, test case #106561
// The .md plan is canonical. AI-repair will patch failing lines in this file.
// Do not hand-edit unless you are also updating the .md plan.
//
// ADO step 4 ("Click on the refresh on the top left corner of the screen")
// refers to the browser's own reload control, not an in-app button —
// simulated here with page.reload(). Selectors reused from
// verify-valid-job-title-and-location.spec.ts (captured live against the QA
// environment on 2026-07-30).

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

test.describe('HOME-106561 — Refresh the Home Page', () => {
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

  test('TC-03: Refresh the browser', async ({ page }) => {
    await loginAsFred(page);
    await goToHome(page);
    // STEP: REFRESH the browser page (top-left browser reload control)
    await page.reload();
    await page.waitForLoadState('networkidle');
    // ASSERT (BLOCKING) still logged in (not redirected to /login) after reload
    await expect(page).not.toHaveURL(/login/i);
    // ASSERT (BLOCKING) Home page content is visible again after reload
    await expect(jobTitleField(page)).toBeVisible({ timeout: 15000 });
    await expect(locationField(page)).toBeVisible();
    await expect(page.getByRole('button', { name: 'Search', exact: true })).toBeVisible();
  });
});
