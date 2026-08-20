// AUTO-RECORDED from test-plans/AdminPortal/verify-pre-screen-completeflow.md
// Source: Azure DevOps project pd-recruitment, test case #106332 "Verify
// Pre-Screen" (work item rev 4). The .md plan is canonical. AI-repair
// will patch failing lines in this file. Do not hand-edit unless you are
// also updating the .md plan.
//
// Recruiter role (Kwenas / "Kwena Semono"), Recruitment > Job Posting
// Dashboard section. Targets Job Posting Ref No 40's application created
// on ADMINPORTAL-106172 — currently listed as "Edit Last Name A".
//
// Confirmed live 2026-08-06: the Applications panel has tabs "All
// Applications", "Pre-screened" (lowercase 's'), "Shortlisted",
// "Interviewed", "Appointed". Both the tabs and the application row link
// render TWICE in the DOM (responsive desktop+mobile layout) — one copy
// is hidden. Must pick the VISIBLE element among duplicates, not just
// .first(), or Playwright times out waiting for a hidden element to
// become clickable.
//
// Confirmed live: the application details page has a "Shortlist" button
// (alongside "Decline") near the bottom of the page.
//
// TC-08 clicks the real Shortlist button — a real, persistent status
// change (PRE-SCREENED -> Shortlisted) — confirmed with the requester
// before running.

import { test, expect, Page } from '@playwright/test';

const APP_URL = 'https://pd-recruitment-adminportal-qa.shesha.app/';
const RECRUITER = { user: 'Kwenas', password: '123qwe' };
const TARGET_REF_NO = '40';
// Surname/Initials text as it currently appears in the Applications table —
// update this if a prior real run already renamed the candidate further.
const CANDIDATE_ROW_TEXT = 'Edit Last Name A';

async function loginAsKwena(page: Page) {
  await page.goto(`${APP_URL}login`, { waitUntil: 'domcontentloaded' });
  await page.waitForSelector('input[placeholder="Username"]', { timeout: 45_000 });
  await page.locator('input[placeholder="Username"]').fill(RECRUITER.user);
  await page.locator('input[placeholder="Password"]').fill(RECRUITER.password);
  await page.getByRole('button', { name: 'Sign In' }).click();
  await page.waitForURL(url => !url.href.includes('/login'), { timeout: 30000 });
  await page.waitForLoadState('networkidle').catch(() => {});
  await page.waitForTimeout(1000);
}

async function toggleSidebar(page: Page) {
  await page.locator('.anticon-menu-fold, .anticon-menu-unfold').first().click();
  await page.waitForTimeout(600);
}

async function openRecruitmentMenu(page: Page) {
  await toggleSidebar(page);
  await page.getByText('Recruitment', { exact: false }).first().click();
  await page.waitForTimeout(600);
}

async function goToJobPostingDashboard(page: Page) {
  await openRecruitmentMenu(page);
  await page.getByText('Job Posting Dashboard', { exact: false }).first().click();
  await page.waitForLoadState('networkidle').catch(() => {});
  await page.waitForTimeout(2000);
  // The Recruitment sidebar flyout can stay open/hovering and intercept
  // clicks on the table underneath — move the mouse away to dismiss it.
  await page.mouse.move(900, 400);
  await page.mouse.move(1200, 700);
  await page.waitForTimeout(300);
}

async function openTargetJobPosting(page: Page) {
  await goToJobPostingDashboard(page);
  const searchInput = page.locator('input').first();
  await searchInput.fill(TARGET_REF_NO);
  await page.keyboard.press('Enter');
  await page.waitForTimeout(1500);
  const row = page.locator('div[role="row"]').filter({ has: page.getByText(TARGET_REF_NO, { exact: true }) }).first();
  await row.locator('a, [class*="link"]').first().click();
  await page.waitForLoadState('networkidle').catch(() => {});
  await page.waitForTimeout(2000);
}

// Returns the first VISIBLE element among duplicate hidden/visible matches
// (see header comment on responsive duplicate rendering) — plain .first()
// can resolve to the hidden copy and cause spurious timeouts/failures.
async function firstVisible(locator: ReturnType<Page['getByText']>) {
  const count = await locator.count();
  for (let i = 0; i < count; i++) {
    const el = locator.nth(i);
    if (await el.isVisible().catch(() => false)) return el;
  }
  throw new Error('No visible element found among matches');
}

async function clickVisible(page: Page, locator: ReturnType<Page['getByText']>) {
  const el = await firstVisible(locator);
  await el.scrollIntoViewIfNeeded().catch(() => {});
  await page.waitForTimeout(300);
  await el.click();
}

async function openPreScreenedTab(page: Page) {
  await page.mouse.wheel(0, 1200);
  await page.waitForTimeout(600);
  await clickVisible(page, page.getByText('Pre-screened', { exact: false }));
  await page.waitForTimeout(1000);
}

async function openTargetApplication(page: Page) {
  await openTargetJobPosting(page);
  await openPreScreenedTab(page);
  await clickVisible(page, page.getByText(CANDIDATE_ROW_TEXT, { exact: false }));
  await page.waitForLoadState('networkidle').catch(() => {});
  await page.waitForTimeout(2000);
}

function shortlistButton(page: Page) {
  return page.getByRole('button', { name: 'Shortlist', exact: false }).first();
}

test.describe('ADMINPORTAL-106332 — Verify Pre-Screen', () => {
  test.describe.configure({ mode: 'serial' });

  test('TC-01: Login as Kwena', async ({ page }) => {
    await loginAsKwena(page);
    // ASSERT (BLOCKING) URL no longer contains /login
    await expect(page).not.toHaveURL(/login/i);
  });

  test('TC-02: Click the sidebar toggle', async ({ page }) => {
    await loginAsKwena(page);
    await toggleSidebar(page);
    // ASSERT (BLOCKING) Recruitment navigation item is visible
    await expect(page.getByText('Recruitment', { exact: false }).first()).toBeVisible();
  });

  test('TC-03: Click on Recruitment dropdown', async ({ page }) => {
    await loginAsKwena(page);
    await openRecruitmentMenu(page);
    // ASSERT (BLOCKING) submenus are visible
    await expect(page.getByText('Job Posting Dashboard', { exact: false }).first()).toBeVisible();
    await expect(page.getByText('Location', { exact: true }).first()).toBeVisible();
    await expect(page.getByText('Salary Levels', { exact: false }).first()).toBeVisible();
    await expect(page.getByText('Candidates', { exact: true }).first()).toBeVisible();
    await expect(page.getByText('Candidates Applications', { exact: false }).first()).toBeVisible();
  });

  test('TC-04: Click on Job Posting dashboard', async ({ page }) => {
    test.setTimeout(120_000);
    await loginAsKwena(page);
    await goToJobPostingDashboard(page);
    // ASSERT (BLOCKING) Job Postings index table is displayed
    await expect(page.getByText('Job Postings', { exact: true }).first()).toBeVisible();
    await expect(page.getByText('Reference No', { exact: false }).first()).toBeVisible();
  });

  test('TC-05: Open Job Posting Ref No 40', async ({ page }) => {
    test.setTimeout(120_000);
    await loginAsKwena(page);
    await openTargetJobPosting(page);
    // ASSERT (BLOCKING) Job Details panel shows Job Reference Number 40
    await expect(page.getByText('Job Reference', { exact: false }).first()).toBeVisible();
    await expect(page.getByText(TARGET_REF_NO, { exact: true }).first()).toBeVisible();
  });

  test('TC-06: Navigate to Applications panel and click the "Pre-Screened" tab', async ({ page }) => {
    test.setTimeout(120_000);
    await loginAsKwena(page);
    await openTargetJobPosting(page);
    await openPreScreenedTab(page);
    // ASSERT (BLOCKING) list of pre-screened applications is displayed
    const visibleAppLink = await firstVisible(page.getByText(CANDIDATE_ROW_TEXT, { exact: false }));
    await expect(visibleAppLink).toBeVisible();
  });

  test('TC-07: Click on the Surname and Initials link to open the application', async ({ page }) => {
    test.setTimeout(180_000);
    await loginAsKwena(page);
    await openTargetApplication(page);
    // ASSERT (BLOCKING) application opens in details view
    await expect(page.getByText('Personal Details', { exact: true }).first()).toBeVisible();
  });

  test('TC-08: Scroll to the bottom of the page and click Shortlist button', async ({ page }) => {
    test.setTimeout(180_000);
    await loginAsKwena(page);
    await openTargetApplication(page);
    await page.mouse.wheel(0, 20000);
    await page.waitForTimeout(1000);
    await page.mouse.wheel(0, 20000);
    await page.waitForTimeout(500);
    await expect(shortlistButton(page)).toBeVisible();
    // STEP: CLICK the real Shortlist button — REAL, PERSISTENT STATUS
    // CHANGE, confirmed with requester
    //
    // The Ant Design success toast is transient (auto-dismisses in a few
    // seconds) and the page auto-navigates away almost immediately after —
    // confirmed live 2026-08-06 that a naive 15s-timeout toBeVisible()
    // check can miss it entirely because both the toast AND the
    // navigation have already completed by the time it runs. Race the
    // toast locator with a short timeout instead of a long one, and treat
    // the final Shortlisted-tab state as the authoritative signal.
    await shortlistButton(page).click();
    await page
      .locator('.ant-message, .ant-notification')
      .filter({ hasText: /success/i })
      .first()
      .waitFor({ state: 'visible', timeout: 5_000 })
      .catch(() => {});
    // ASSERT (BLOCKING) page auto-navigates back to the applications table
    await page.waitForTimeout(2000);
    await expect(page.getByText('Personal Details', { exact: true })).toHaveCount(0);
    // ASSERT (BLOCKING) the application now appears under the Shortlisted tab
    await page.mouse.wheel(0, 1200);
    await page.waitForTimeout(600);
    await clickVisible(page, page.getByText('Shortlisted', { exact: false }));
    await page.waitForTimeout(1000);
    await expect(await firstVisible(page.getByText(CANDIDATE_ROW_TEXT, { exact: false }))).toBeVisible();
  });
});
