// AUTO-RECORDED from test-plans/Jobs/verify-search-by-location.md
// Source: Azure DevOps test plan #99437, suite #104521, test case #106363
// The .md plan is canonical. AI-repair will patch failing lines in this file.
// Do not hand-edit unless you are also updating the .md plan.
//
// Login/nav helpers and location-combobox interaction mirror
// test-plans/Home/verify-valid-job-title-and-location.spec.ts (captured live
// against the QA environment on 2026-07-30). The Jobs page's location field
// is the page's single Ant Design combobox (no accessible name/placeholder),
// same pattern as the Home tab.

import { test, expect, Page, Locator } from '@playwright/test';

const APP_URL = 'https://pd-recruitment-publicportal-1-qa.shesha.app/';
const APPLICANT = { user: 'Fred', password: 'Metaganemr%03' };
const LOCATION = 'Head Office';

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

function locationField(page: Page): Locator {
  return page.getByRole('combobox').first();
}

function locationDropdown(page: Page): Locator {
  return page.locator('.ant-select-dropdown:not(.ant-select-dropdown-hidden)').first();
}

// Leaf-level job posting cards, identified by the card's distinct box-shadow
// wrapper style, excluding ancestor containers that also match the same
// selector (the search-criteria panel and the outer results wrapper both
// share the same class), and requiring the "View & Apply" link that only
// appears once per individual job card. Confirmed live 2026-07-30.
function jobCards(page: Page): Locator {
  return page
    .locator('.sha-components-container-inner[style*="box-shadow"]:not(:has(.sha-components-container-inner[style*="box-shadow"]))')
    .filter({ hasText: 'View & Apply' });
}

// The results list swaps out its old cards for new ones client-side after a
// search; waitForLoadState('networkidle') alone can resolve mid-transition,
// and even the pagination summary ("N-M of K items") can render slightly
// before the card list finishes reconciling — confirmed live 2026-07-30: a
// stale/extra card was still readable via allInnerTexts() for a brief window
// after the summary text appeared. A short settle delay after the summary
// text is the reliable barrier before reading card contents.
async function waitForResultsSettled(page: Page) {
  await expect(page.getByText(/\d+-\d+ of \d+ items/i)).toBeVisible({ timeout: 15000 });
  await page.waitForTimeout(800);
}

test.describe('JOBS-106363 — Verify Search by Location', () => {
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
    // ASSERT (BLOCKING) Jobs page / location dropdown is visible
    await expect(locationField(page)).toBeVisible({ timeout: 15000 });
  });

  test('TC-03: Click Location dropdown', async ({ page }) => {
    await loginAsFred(page);
    await goToJobs(page);
    // STEP: CLICK the Location dropdown
    await locationField(page).click();
    // ASSERT (BLOCKING) list of location options is displayed
    await expect(locationDropdown(page)).toBeVisible({ timeout: 10000 });
  });

  test('TC-04: Select "Head Office" from the list', async ({ page }) => {
    await loginAsFred(page);
    await goToJobs(page);
    await locationField(page).click();
    const dropdown = locationDropdown(page);
    await expect(dropdown).toBeVisible({ timeout: 10000 });
    // STEP: SELECT "Head Office"
    await dropdown.getByText(LOCATION, { exact: true }).click();
    // ASSERT (BLOCKING) location field displays "Head Office"
    await expect(page.locator('.ant-select-selection-item').first()).toHaveText(LOCATION, { timeout: 10000 });
  });

  test('TC-05: Click Search button', async ({ page }) => {
    await loginAsFred(page);
    await goToJobs(page);
    await locationField(page).click();
    const dropdown = locationDropdown(page);
    await expect(dropdown).toBeVisible({ timeout: 10000 });
    await dropdown.getByText(LOCATION, { exact: true }).click();
    // STEP: CLICK the Search button
    await page.getByRole('button', { name: 'Search', exact: true }).click();
    await page.waitForLoadState('networkidle');
    await waitForResultsSettled(page);
    // ASSERT (BLOCKING) job listings are filtered by "Head Office" (at least one result)
    const cards = jobCards(page);
    await expect(cards.first()).toBeVisible({ timeout: 15000 });
    expect(await cards.count()).toBeGreaterThan(0);
  });

  test('TC-06: Verify results', async ({ page }) => {
    await loginAsFred(page);
    await goToJobs(page);
    await locationField(page).click();
    const dropdown = locationDropdown(page);
    await expect(dropdown).toBeVisible({ timeout: 10000 });
    await dropdown.getByText(LOCATION, { exact: true }).click();
    await page.getByRole('button', { name: 'Search', exact: true }).click();
    await page.waitForLoadState('networkidle');
    await waitForResultsSettled(page);
    // STEP: VERIFY the results
    // ASSERT (BLOCKING) every individual result card shows "Head Office" as its
    // location — not just that the text appears somewhere on the page.
    // allInnerTexts() reads all matched cards in one pass, avoiding a
    // re-query-per-index race against the list still settling.
    const cards = jobCards(page);
    await expect(cards.first()).toBeVisible({ timeout: 15000 });
    const texts = await cards.allInnerTexts();
    expect(texts.length).toBeGreaterThan(0);
    for (const text of texts) {
      expect(text.toLowerCase()).toContain(LOCATION.toLowerCase());
    }
  });
});
