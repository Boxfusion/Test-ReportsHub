// AUTO-RECORDED from test-plans/AdminPortal/verify-not-appointed-hrm354-completeflow.md
// Source: Azure DevOps project pd-recruitment, test case #106405 "Verify
// not appointed" (work item rev 5). The .md plan is canonical. AI-repair
// will patch failing lines in this file. Do not hand-edit unless you
// are also updating the .md plan.
//
// Recruiter role (Kwenas / "Kwena Semono"), standard Recruitment > Job
// Posting Dashboard navigation. Targets Job Posting "HRM 354" ("Tester")
// — a non-numeric reference — applicant "Everything F" (Fred
// Everything). CONFIRMED LIVE 2026-08-06 to be a SEPARATE application
// from the ones on Ref 41 (Rejected), Ref 43 (Appointed), and FRD 123
// (Rejected) — shared QA test data, not created by this automation
// session.
//
// DOCUMENTATION DISCREPANCY confirmed live: ADO step 11 says to click an
// "OK" button, but the dialog (titled "Reason For not Appointing") has
// "Cancel"/"Submit" buttons — same as ADMINPORTAL-104400/104476. This
// spec uses "Submit".
//
// TC-06 clicks the real Submit button — REAL, PERMANENT STATUS CHANGE
// (Interviewed -> Rejected) — confirmed with the requester before
// running.

import { test, expect, Page } from '@playwright/test';

const APP_URL = 'https://pd-recruitment-adminportal-qa.shesha.app/';
const RECRUITER = { user: 'Kwenas', password: '123qwe' };
const TARGET_REF_NO = 'HRM 354';
const CANDIDATE_ROW_TEXT = 'Everything F';
const NOT_APPOINTED_REASON = 'Automated test not-appointed reason.';

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

async function openInterviewedTab(page: Page) {
  await page.mouse.wheel(0, 1200);
  await page.waitForTimeout(600);
  await clickVisible(page, page.getByText('Interviewed', { exact: false }));
  await page.getByText('loading...', { exact: false }).first().waitFor({ state: 'hidden', timeout: 15_000 }).catch(() => {});
  await page.waitForTimeout(1000);
}

async function openTargetApplication(page: Page) {
  await openTargetJobPosting(page);
  await openInterviewedTab(page);
  await clickVisible(page, page.getByText(CANDIDATE_ROW_TEXT, { exact: false }));
  await page.waitForLoadState('networkidle').catch(() => {});
  await page.waitForTimeout(2000);
}

function notAppointedButton(page: Page) {
  return page.getByRole('button', { name: 'Not Appointed', exact: true }).first();
}

function notAppointingPopup(page: Page) {
  return page.locator('.ant-modal-content').filter({ hasText: /appointing/i }).first();
}

function reasonTextarea(page: Page) {
  return notAppointingPopup(page).locator('textarea, input[type="text"]').first();
}

function submitButton(page: Page) {
  return notAppointingPopup(page).getByRole('button', { name: 'Submit', exact: true }).first();
}

test.describe('ADMINPORTAL-106405 — Verify not appointed', () => {
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

  test('TC-04: Search for a job with Ref HRM 354, open in details view', async ({ page }) => {
    test.setTimeout(120_000);
    await loginAsKwena(page);
    await openTargetJobPosting(page);
    await expect(page.getByText('Job Reference', { exact: false }).first()).toBeVisible();
    await expect(page.getByText(TARGET_REF_NO, { exact: true }).first()).toBeVisible();
  });

  test('TC-05: Click on Interviewed tab, open Everything F\'s application', async ({ page }) => {
    test.setTimeout(180_000);
    await loginAsKwena(page);
    await openTargetJobPosting(page);
    await openInterviewedTab(page);
    const visibleAppLink = await firstVisible(page.getByText(CANDIDATE_ROW_TEXT, { exact: false }));
    await expect(visibleAppLink).toBeVisible();
    await clickVisible(page, page.getByText(CANDIDATE_ROW_TEXT, { exact: false }));
    await page.waitForLoadState('networkidle').catch(() => {});
    await page.waitForTimeout(2000);
    await expect(page.getByText('INTERVIEWED', { exact: false }).first()).toBeVisible();
  });

  test('TC-06: Scroll to the bottom, click Not Appointed, populate reason, click Submit', async ({ page }) => {
    test.setTimeout(180_000);
    await loginAsKwena(page);
    await openTargetApplication(page);
    await page.mouse.wheel(0, 20000);
    await page.waitForTimeout(1000);
    await page.mouse.wheel(0, 20000);
    await page.waitForTimeout(500);
    await notAppointedButton(page).click();
    await page.waitForTimeout(1000);
    // ASSERT (BLOCKING) "Reason For not Appointing" dialog appears
    await expect(notAppointingPopup(page)).toBeVisible();
    await expect(notAppointingPopup(page)).toContainText('not Appointing');
    await reasonTextarea(page).fill(NOT_APPOINTED_REASON);
    await page.waitForTimeout(500);
    // ASSERT (BLOCKING) Submit button is enabled
    await expect(submitButton(page)).toBeEnabled();
    // STEP: CLICK the real Submit button — REAL, PERMANENT STATUS
    // CHANGE, confirmed with requester
    await submitButton(page).click();
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
