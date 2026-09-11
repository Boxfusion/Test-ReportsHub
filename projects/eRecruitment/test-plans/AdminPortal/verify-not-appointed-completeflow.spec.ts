// AUTO-RECORDED from test-plans/AdminPortal/verify-not-appointed-completeflow.md
// Source: Azure DevOps project pd-recruitment, test case #106400 "Verify
// not appointed" (work item rev 2). The .md plan is canonical. AI-repair
// will patch failing lines in this file. Do not hand-edit unless you are
// also updating the .md plan.
//
// Recruiter role (Kwenas / "Kwena Semono"), Recruitment > Job Posting
// Dashboard section. Targets Job Posting Ref No 40's application created
// on ADMINPORTAL-106172's fourth run (2026-08-06) — "AutoTest Verify not
// appointed", Identity Number 8806145432086. Precondition (INTERVIEWED
// status) was set as real, confirmed prerequisite actions (Shortlist,
// then checkbox+comment+Interviewed) before this plan was authored.
//
// Confirmed live 2026-08-06: the dialog is titled "Reason For not
// Appointing", with a "Reason" textarea and a "Cancel" button present
// from the start — the "Submit" button does not render until the Reason
// field has text (same conditional-render pattern as
// ADMINPORTAL-106333/106398/106399's equivalent action buttons).
//
// TC-05 clicks the real "Submit" button — REAL, PERMANENT STATUS CHANGE
// (Interviewed -> Rejected) — confirmed with the requester before
// running.

import { test, expect, Page } from '@playwright/test';

const APP_URL = 'https://pd-recruitment-adminportal-qa.shesha.app/';
const RECRUITER = { user: 'Kwenas', password: '123qwe' };
const TARGET_REF_NO = '40';
const CANDIDATE_ROW_TEXT = 'Verify not appointed';
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

test.describe('ADMINPORTAL-106400 — Verify not appointed', () => {
  test.describe.configure({ mode: 'serial' });

  test('TC-01: Login as Kwena', async ({ page }) => {
    await loginAsKwena(page);
    await expect(page).not.toHaveURL(/login/i);
  });

  test('TC-02: Navigate to Job Posting Dashboard, open Ref No 40, open Interviewed tab', async ({ page }) => {
    test.setTimeout(120_000);
    await loginAsKwena(page);
    await openTargetJobPosting(page);
    await openInterviewedTab(page);
    // ASSERT (BLOCKING) list of interviewed applications is displayed
    const visibleAppLink = await firstVisible(page.getByText(CANDIDATE_ROW_TEXT, { exact: false }));
    await expect(visibleAppLink).toBeVisible();
  });

  test('TC-03: Click on the Surname and Initials link to open the application', async ({ page }) => {
    test.setTimeout(180_000);
    await loginAsKwena(page);
    await openTargetApplication(page);
    // ASSERT (BLOCKING) application opens with INTERVIEWED status
    await expect(page.getByText('Personal Details', { exact: true }).first()).toBeVisible();
    await expect(page.getByText('INTERVIEWED', { exact: false }).first()).toBeVisible();
  });

  test('TC-04: Click on Not Appointed, populate the reason', async ({ page }) => {
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
    // ASSERT (BLOCKING) Submit button is enabled after populating the reason
    await expect(submitButton(page)).toBeEnabled();
  });

  test('TC-05: Click on Submit', async ({ page }) => {
    test.setTimeout(180_000);
    await loginAsKwena(page);
    await openTargetApplication(page);
    await page.mouse.wheel(0, 20000);
    await page.waitForTimeout(1000);
    await page.mouse.wheel(0, 20000);
    await page.waitForTimeout(500);
    await notAppointedButton(page).click();
    await page.waitForTimeout(1000);
    await reasonTextarea(page).fill(NOT_APPOINTED_REASON);
    await page.waitForTimeout(500);
    // STEP: CLICK the real Submit button — REAL, PERMANENT STATUS CHANGE,
    // confirmed with requester
    await submitButton(page).click();
    await page.waitForTimeout(3000);
    // ASSERT (BLOCKING) page auto-navigates back to the applications table
    await expect(page.getByText('Personal Details', { exact: true })).toHaveCount(0);
  });

  test('TC-06: Locate the actioned application and open in details view', async ({ page }) => {
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
