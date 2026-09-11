// AUTO-RECORDED from test-plans/AdminPortal/verify-not-interviewed-frd123-completeflow.md
// Source: Azure DevOps project pd-recruitment, test case #106404 "Verify
// Not Interviewed" (work item rev 5). The .md plan is canonical.
// AI-repair will patch failing lines in this file. Do not hand-edit
// unless you are also updating the .md plan.
//
// Recruiter role (Kwenas / "Kwena Semono"), standard Recruitment > Job
// Posting Dashboard navigation. Targets Job Posting "FRD 123"
// ("Designer") — a non-numeric reference — applicant "Everything F"
// (Fred Everything). CONFIRMED LIVE 2026-08-06 to be a SEPARATE
// application from the ones on Ref 41 (Rejected via ADMINPORTAL-106403)
// and Ref 43 (Appointed via ADMINPORTAL-104448/104464/104475/104476) —
// shared QA test data, not created by this automation session.
//
// Reuses the "Reason for Not Interviewing" popup pattern confirmed in
// ADMINPORTAL-106399: "Reason" textarea, "Close" button present from the
// start, "Ok" button appears once the Reason field has text.
//
// TC-06 clicks the real "OK" button — REAL, PERMANENT STATUS CHANGE
// (Shortlisted -> Rejected) — confirmed with the requester before
// running.

import { test, expect, Page } from '@playwright/test';

const APP_URL = 'https://pd-recruitment-adminportal-qa.shesha.app/';
const RECRUITER = { user: 'Kwenas', password: '123qwe' };
const TARGET_REF_NO = 'FRD 123';
const CANDIDATE_ROW_TEXT = 'Everything F';
const NOT_INTERVIEWED_REASON = 'Automated test not-interviewed reason.';

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

async function openTargetApplication(page: Page) {
  await openTargetJobPosting(page);
  await openShortlistedTab(page);
  await clickVisible(page, page.getByText(CANDIDATE_ROW_TEXT, { exact: false }));
  await page.waitForLoadState('networkidle').catch(() => {});
  await page.waitForTimeout(2000);
}

function notInterviewedButton(page: Page) {
  return page.getByRole('button', { name: 'Not Interviewed', exact: true }).first();
}

function notInterviewingPopup(page: Page) {
  return page.locator('.ant-modal-content').filter({ hasText: /not interview/i }).first();
}

function reasonTextarea(page: Page) {
  return notInterviewingPopup(page).locator('textarea, input[type="text"]').first();
}

function popupOkButton(page: Page) {
  return notInterviewingPopup(page).getByRole('button', { name: 'Ok', exact: true }).first();
}

test.describe('ADMINPORTAL-106404 — Verify Not Interviewed', () => {
  test.describe.configure({ mode: 'serial' });

  test('TC-01: Login as Kwena', async ({ page }) => {
    await loginAsKwena(page);
    await expect(page).not.toHaveURL(/login/i);
  });

  test('TC-02: Click on the Recruitment dropdown', async ({ page }) => {
    await loginAsKwena(page);
    await openRecruitmentMenu(page);
    await expect(page.getByText('Job Posting Dashboard', { exact: false }).first()).toBeVisible();
    await expect(page.getByText('Location', { exact: true }).first()).toBeVisible();
    await expect(page.getByText('Salary Levels', { exact: false }).first()).toBeVisible();
    await expect(page.getByText('Candidates', { exact: true }).first()).toBeVisible();
    await expect(page.getByText('Candidates Applications', { exact: false }).first()).toBeVisible();
  });

  test('TC-03: Click on Job Posting dashboard', async ({ page }) => {
    test.setTimeout(120_000);
    await loginAsKwena(page);
    await goToJobPostingDashboard(page);
    await expect(page.getByText('Job Postings', { exact: true }).first()).toBeVisible();
  });

  test('TC-04: Search for a job with Reference number FRD 123, open in details view', async ({ page }) => {
    test.setTimeout(120_000);
    await loginAsKwena(page);
    await openTargetJobPosting(page);
    // ASSERT (BLOCKING) Job Details panel opens with Job Reference FRD 123
    await expect(page.getByText('Job Reference', { exact: false }).first()).toBeVisible();
    await expect(page.getByText(TARGET_REF_NO, { exact: true }).first()).toBeVisible();
  });

  test('TC-05: Click on Shortlisted tab, open Everything F\'s application', async ({ page }) => {
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
    // ASSERT (BLOCKING) application opens successfully
    await expect(page.getByText('Personal Details', { exact: true }).first()).toBeVisible();
  });

  test('TC-06: Scroll to the bottom, click Not Interviewed, populate reason, click OK', async ({ page }) => {
    test.setTimeout(180_000);
    await loginAsKwena(page);
    await openTargetApplication(page);
    await page.mouse.wheel(0, 20000);
    await page.waitForTimeout(1000);
    await page.mouse.wheel(0, 20000);
    await page.waitForTimeout(500);
    await notInterviewedButton(page).click();
    await page.waitForTimeout(1000);
    // ASSERT (BLOCKING) "Reason for Not Interviewing" dialog appears
    await expect(notInterviewingPopup(page)).toBeVisible();
    await expect(notInterviewingPopup(page)).toContainText('Not Interviewing');
    await reasonTextarea(page).fill(NOT_INTERVIEWED_REASON);
    await page.waitForTimeout(500);
    // ASSERT (BLOCKING) OK button is enabled
    await expect(popupOkButton(page)).toBeEnabled();
    // STEP: CLICK the real Ok button — REAL, PERMANENT STATUS CHANGE,
    // confirmed with requester
    await popupOkButton(page).click();
    await page.waitForTimeout(3000);
    await page.waitForLoadState('networkidle').catch(() => {});
    await page.waitForTimeout(2000);
    // ASSERT (BLOCKING) page auto-navigates back to the applications table
    await expect(page.getByText('Personal Details', { exact: true })).toHaveCount(0);
  });

  test('TC-07: Open the actioned application in details view', async ({ page }) => {
    test.setTimeout(120_000);
    await loginAsKwena(page);
    await openTargetJobPosting(page);
    await page.mouse.wheel(0, 1200);
    await page.waitForTimeout(600);
    await clickVisible(page, page.getByText('All Applications', { exact: false }));
    await page.getByText('loading...', { exact: false }).first().waitFor({ state: 'hidden', timeout: 15_000 }).catch(() => {});
    await page.waitForTimeout(1000);
    await clickVisible(page, page.getByText(CANDIDATE_ROW_TEXT, { exact: false }));
    await page.waitForLoadState('networkidle').catch(() => {});
    await page.waitForTimeout(2000);
    // ASSERT (BLOCKING) application opens successfully and status shows REJECTED
    await expect(page.getByText('Personal Details', { exact: true }).first()).toBeVisible();
    await expect(page.getByText('REJECTED', { exact: false }).first()).toBeVisible();
  });
});
