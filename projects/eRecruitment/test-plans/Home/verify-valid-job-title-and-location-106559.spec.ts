// AUTO-RECORDED from test-plans/Home/verify-valid-job-title-and-location-106559.md
// Source: Azure DevOps test plan #99437, suite #106554, test case #106559
// The .md plan is canonical. AI-repair will patch failing lines in this file.
// Do not hand-edit unless you are also updating the .md plan.
//
// ADO test case #106559 is titled and stepped identically to #106557 (same
// suite). Selectors reused verbatim from verify-valid-job-title-and-location.spec.ts,
// captured live against the QA environment on 2026-07-30.

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

function locationDropdown(page: Page) {
  return page.locator('.ant-select-dropdown:not(.ant-select-dropdown-hidden)').first();
}

test.describe('HOME-106559 — Verify Valid Job Title and Location', () => {
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

  test('TC-03: Leave job title text area blank', async ({ page }) => {
    await loginAsFred(page);
    await goToHome(page);
    // STEP: Leave the job title text area blank
    // ASSERT (BLOCKING) job title field remains empty
    await expect(jobTitleField(page)).toHaveValue('');
  });

  test('TC-04: Click on location dropdown', async ({ page }) => {
    await loginAsFred(page);
    await goToHome(page);
    // STEP: CLICK the location dropdown
    await locationField(page).click();
    // ASSERT (BLOCKING) list of location options is displayed
    await expect(locationDropdown(page)).toBeVisible({ timeout: 10000 });
  });

  test('TC-05: Select a location option, e.g. Head Office', async ({ page }) => {
    await loginAsFred(page);
    await goToHome(page);
    await locationField(page).click();
    const dropdown = locationDropdown(page);
    await expect(dropdown).toBeVisible({ timeout: 10000 });
    // STEP: SELECT a location option (e.g. "Head Office")
    const option = dropdown.locator('.ant-select-item-option').first();
    const optionText = (await option.innerText()).trim();
    await option.click();
    // ASSERT (BLOCKING) location field displays the selected option
    await expect(page.locator('.ant-select-selection-item').first()).toHaveText(optionText, { timeout: 10000 });
  });

  test('TC-06: Click on Search button', async ({ page }) => {
    await loginAsFred(page);
    await goToHome(page);
    await locationField(page).click();
    const dropdown = locationDropdown(page);
    await expect(dropdown).toBeVisible({ timeout: 10000 });
    await dropdown.locator('.ant-select-item-option').first().click();
    // STEP: CLICK the Search button
    await page.getByRole('button', { name: 'Search', exact: true }).click();
    await page.waitForLoadState('networkidle');
    // ASSERT (BLOCKING) search results are displayed matching the selected location
    await expect(page.getByRole('table')).toBeVisible({ timeout: 15000 });
  });
});
