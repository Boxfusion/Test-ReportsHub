// AUTO-RECORDED from test-plans/AdminPortal/verify-interviewed-ref43-completeflow.md
// Source: Azure DevOps project pd-recruitment, test case #104475 "Verify
// Interviewed" (work item rev 6). The .md plan is canonical. AI-repair
// will patch failing lines in this file. Do not hand-edit unless you
// are also updating the .md plan.
//
// Recruiter role (Kwenas / "Kwena Semono"), standard Recruitment > Job
// Posting Dashboard navigation. Targets Job Posting Ref No 43's
// pre-existing applicant "Fred Everything" (Identity Number
// 2606108675655), status SHORTLISTED (set by ADMINPORTAL-104464) —
// shared QA test data, not created by this automation session.
//
// ADO step 85's expected result ("status should change to Appointed")
// is treated as a likely documentation error — per the extensively
// confirmed app behavior (ADMINPORTAL-106333/106335), clicking
// "Interviewed" moves status to Interviewed, not Appointed. TC-07 checks
// the Interviewed tab (ADO step 86 says "Appointed tab", also treated as
// a likely copy-paste error).
//
// Same conditional-render pattern confirmed in ADMINPORTAL-106333: the
// "Interviewed" button only renders once the Comment field has text.
//
// TC-06 clicks the real Interviewed button — REAL, PERMANENT STATUS
// CHANGE (Shortlisted -> Interviewed) — confirmed with the requester
// before running.

import { test, expect, Page } from '@playwright/test';

const APP_URL = 'https://pd-recruitment-adminportal-qa.shesha.app/';
const RECRUITER = { user: 'Kwenas', password: '123qwe' };
const TARGET_REF_NO = '43';
const CANDIDATE_ROW_TEXT = 'Everything F';
const COMMENT_TEXT = 'Automated test comment - candidate interviewed successfully.';

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

async function openShortlistedTab(page: Page) {
  await page.mouse.wheel(0, 1200);
  await page.waitForTimeout(600);
  await clickVisible(page, page.getByText('Shortlisted', { exact: false }));
  await page.getByText('loading...', { exact: false }).first().waitFor({ state: 'hidden', timeout: 15_000 }).catch(() => {});
  await page.waitForTimeout(1000);
}

async function openInterviewedTab(page: Page) {
  await page.mouse.wheel(0, 1200);
  await page.waitForTimeout(600);
  await clickVisible(page, page.getByText('Interviewed', { exact: false }));
  await page.getByText('loading...', { exact: false }).first().waitFor({ state: 'hidden', timeout: 15_000 }).catch(() => {});
  await page.waitForTimeout(1000);
}

async function openTargetApplication(page: Page) {
  await openTargetJobPosting(page);
  await openShortlistedTab(page);
  await clickVisible(page, page.getByText(CANDIDATE_ROW_TEXT, { exact: false }));
  await page.waitForLoadState('networkidle').catch(() => {});
  await page.waitForTimeout(2000);
}

function interviewedCheckbox(page: Page) {
  return page.locator('input[type="checkbox"]').first();
}

// This page (unlike ADMINPORTAL-106333's target application) has an
// "Inbox" message-send panel with its OWN textarea, rendered before the
// Declaration panel's Comment field in DOM order — confirmed live
// 2026-08-06 that a plain `page.locator('textarea').first()` grabs the
// Inbox message box instead. Scope to the Comment label specifically.
function commentTextarea(page: Page) {
  return page.locator('label:has-text("Comment")').first().locator('xpath=../../..').locator('textarea').first();
}

function interviewedButton(page: Page) {
  return page.getByRole('button', { name: 'Interviewed', exact: true });
}

test.describe('ADMINPORTAL-104475 — Verify Interviewed', () => {
  test.describe.configure({ mode: 'serial' });

  test('TC-01: Login as Kwena', async ({ page }) => {
    await loginAsKwena(page);
    await expect(page).not.toHaveURL(/login/i);
  });

  test('TC-02: Expand the Recruitment dropdown', async ({ page }) => {
    await loginAsKwena(page);
    await openRecruitmentMenu(page);
    await expect(page.getByText('Job Posting Dashboard', { exact: false }).first()).toBeVisible();
  });

  test('TC-03: Click on Job Posting dashboard, open Ref No 43', async ({ page }) => {
    test.setTimeout(120_000);
    await loginAsKwena(page);
    await openTargetJobPosting(page);
    // ASSERT (BLOCKING) Job Details panel shows Job Reference Number 43
    await expect(page.getByText('Job Reference', { exact: false }).first()).toBeVisible();
    await expect(page.getByText(TARGET_REF_NO, { exact: true }).first()).toBeVisible();
  });

  test('TC-04: Navigate to Applications panel, click Shortlisted tab, open Everything F\'s application', async ({ page }) => {
    test.setTimeout(180_000);
    await loginAsKwena(page);
    await openTargetJobPosting(page);
    await openShortlistedTab(page);
    // ASSERT (BLOCKING) list of shortlisted applications is displayed
    const visibleAppLink = await firstVisible(page.getByText(CANDIDATE_ROW_TEXT, { exact: false }));
    await expect(visibleAppLink).toBeVisible();
    await clickVisible(page, page.getByText(CANDIDATE_ROW_TEXT, { exact: false }));
    await page.waitForLoadState('networkidle').catch(() => {});
    await page.waitForTimeout(2000);
    // ASSERT (BLOCKING) application opens with SHORTLISTED status
    await expect(page.getByText('SHORTLISTED', { exact: false }).first()).toBeVisible();
  });

  test('TC-05: Scroll to Declaration panel, check the interview checkbox, populate comments', async ({ page }) => {
    test.setTimeout(180_000);
    await loginAsKwena(page);
    await openTargetApplication(page);
    await page.mouse.wheel(0, 20000);
    await page.waitForTimeout(1000);
    await page.mouse.wheel(0, 20000);
    await page.waitForTimeout(500);
    await interviewedCheckbox(page).click({ force: true });
    await page.waitForTimeout(500);
    // ASSERT (BLOCKING) checkbox is checked
    await expect(interviewedCheckbox(page)).toBeChecked();
    await commentTextarea(page).fill(COMMENT_TEXT);
    await page.waitForTimeout(500);
    // ASSERT (BLOCKING) comment field contains the entered text
    await expect(commentTextarea(page)).toHaveValue(COMMENT_TEXT);
    // ASSERT (BLOCKING) Interviewed button is visible and enabled
    await expect(interviewedButton(page)).toBeVisible();
    await expect(interviewedButton(page)).toBeEnabled();
  });

  test('TC-06: Click on Interviewed', async ({ page }) => {
    test.setTimeout(180_000);
    await loginAsKwena(page);
    await openTargetApplication(page);
    await page.mouse.wheel(0, 20000);
    await page.waitForTimeout(1000);
    await page.mouse.wheel(0, 20000);
    await page.waitForTimeout(500);
    await interviewedCheckbox(page).click({ force: true });
    await page.waitForTimeout(500);
    await commentTextarea(page).fill(COMMENT_TEXT);
    await page.waitForTimeout(500);
    // STEP: CLICK the real Interviewed button — REAL, PERMANENT STATUS
    // CHANGE, confirmed with requester
    await interviewedButton(page).click();
    await page.waitForTimeout(3000);
    await page.waitForLoadState('networkidle').catch(() => {});
    await page.waitForTimeout(2000);
    // ASSERT (BLOCKING) page auto-navigates away from the individual application view
    await expect(page.getByText('Personal Details', { exact: true })).toHaveCount(0);
  });

  test('TC-07: Click on the Interviewed tab and confirm the application is listed', async ({ page }) => {
    test.setTimeout(120_000);
    await loginAsKwena(page);
    await openTargetJobPosting(page);
    await openInterviewedTab(page);
    // ASSERT (BLOCKING) the application is displayed under the Interviewed tab
    const visibleAppLink = await firstVisible(page.getByText(CANDIDATE_ROW_TEXT, { exact: false }));
    await expect(visibleAppLink).toBeVisible();
  });
});
