// AUTO-RECORDED from test-plans/AdminPortal/verify-not-interviewed-completeflow.md
// Source: Azure DevOps project pd-recruitment, test case #106399 "Verify
// not interviewed" (work item rev 2). The .md plan is canonical.
// AI-repair will patch failing lines in this file. Do not hand-edit
// unless you are also updating the .md plan.
//
// Recruiter role (Kwenas / "Kwena Semono"), Recruitment > Job Posting
// Dashboard section. Targets Job Posting Ref No 40's application created
// on ADMINPORTAL-106172's third run (2026-08-06) — "AutoTest Verify not
// interviewed", Identity Number 9103235432088. Precondition (SHORTLISTED
// status) was set as a real, confirmed prerequisite action (clicking the
// Shortlist button) before this plan was authored, since 106399 itself
// has no step that shortlists the application.
//
// Confirmed live 2026-08-06: the dialog is titled "Reason for Not
// Interviewing", with a "Reason" textarea. Only a "Close" button is
// present initially — the "Ok" button does not render until the Reason
// field has text (same conditional-render pattern as ADMINPORTAL-106333's
// "Interviewed" button and ADMINPORTAL-106398's Decline "Ok").
//
// TC-06 clicks the real "Ok" button — REAL, PERMANENT STATUS CHANGE
// (Shortlisted -> Rejected, per ADO step 15 — the app uses "Rejected"
// terminology, same as confirmed for ADMINPORTAL-106398) — confirmed
// with the requester before running.

import { test, expect, Page } from '@playwright/test';

const APP_URL = 'https://pd-recruitment-adminportal-qa.shesha.app/';
const RECRUITER = { user: 'Kwenas', password: '123qwe' };
const TARGET_REF_NO = '40';
const CANDIDATE_ROW_TEXT = 'Verify not interviewed';
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

function popupCloseButton(page: Page) {
  return notInterviewingPopup(page).getByRole('button', { name: 'Close', exact: true }).first();
}

function popupOkButton(page: Page) {
  return notInterviewingPopup(page).getByRole('button', { name: 'Ok', exact: true }).first();
}

test.describe('ADMINPORTAL-106399 — Verify not interviewed', () => {
  test.describe.configure({ mode: 'serial' });

  test('TC-01: Login as Kwena', async ({ page }) => {
    await loginAsKwena(page);
    await expect(page).not.toHaveURL(/login/i);
  });

  test('TC-02: Navigate to Job Posting Dashboard, open Ref No 40, open Shortlisted tab', async ({ page }) => {
    test.setTimeout(120_000);
    await loginAsKwena(page);
    await openTargetJobPosting(page);
    await openShortlistedTab(page);
    // ASSERT (BLOCKING) list of shortlisted applications is displayed
    const visibleAppLink = await firstVisible(page.getByText(CANDIDATE_ROW_TEXT, { exact: false }));
    await expect(visibleAppLink).toBeVisible();
  });

  test('TC-03: Click on the Surname and Initials link to open the application', async ({ page }) => {
    test.setTimeout(180_000);
    await loginAsKwena(page);
    await openTargetApplication(page);
    // ASSERT (BLOCKING) application opens with SHORTLISTED status
    await expect(page.getByText('Personal Details', { exact: true }).first()).toBeVisible();
    await expect(page.getByText('SHORTLISTED', { exact: false }).first()).toBeVisible();
  });

  test('TC-04: Scroll to the bottom and click Not Interviewed, populate reason, click Close', async ({ page }) => {
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
    await expect(notInterviewingPopup(page)).toContainText('Reason for Not Interviewing');
    await reasonTextarea(page).fill(NOT_INTERVIEWED_REASON);
    await page.waitForTimeout(500);
    // ASSERT (BLOCKING) OK button is enabled after populating the reason
    await expect(popupOkButton(page)).toBeEnabled();
    await popupCloseButton(page).click();
    await page.waitForTimeout(1000);
    // ASSERT (BLOCKING) dialog closes and application is still Shortlisted
    await expect(notInterviewingPopup(page)).toBeHidden();
    await expect(page.getByText('SHORTLISTED', { exact: false }).first()).toBeVisible();
  });

  test('TC-05: Re-navigate to Shortlisted tab, re-open the application, click Not Interviewed, populate reason', async ({ page }) => {
    test.setTimeout(180_000);
    await loginAsKwena(page);
    await openTargetApplication(page);
    await page.mouse.wheel(0, 20000);
    await page.waitForTimeout(1000);
    await page.mouse.wheel(0, 20000);
    await page.waitForTimeout(500);
    await notInterviewedButton(page).click();
    await page.waitForTimeout(1000);
    // ASSERT (BLOCKING) "Reason for Not Interviewing" dialog appears again
    await expect(notInterviewingPopup(page)).toBeVisible();
    await reasonTextarea(page).fill(NOT_INTERVIEWED_REASON);
    await page.waitForTimeout(500);
    // ASSERT (BLOCKING) OK button is enabled
    await expect(popupOkButton(page)).toBeEnabled();
  });

  test('TC-06: Click on OK', async ({ page }) => {
    test.setTimeout(180_000);
    await loginAsKwena(page);
    await openTargetApplication(page);
    await page.mouse.wheel(0, 20000);
    await page.waitForTimeout(1000);
    await page.mouse.wheel(0, 20000);
    await page.waitForTimeout(500);
    await notInterviewedButton(page).click();
    await page.waitForTimeout(1000);
    await reasonTextarea(page).fill(NOT_INTERVIEWED_REASON);
    await page.waitForTimeout(500);
    // STEP: CLICK the real Ok button — REAL, PERMANENT STATUS CHANGE,
    // confirmed with requester
    await popupOkButton(page).click();
    await page.waitForTimeout(3000);
    // ASSERT (BLOCKING) page auto-navigates back to the applications table
    await expect(page.getByText('Personal Details', { exact: true })).toHaveCount(0);
  });

  test('TC-07: Locate the actioned application and open in details view', async ({ page }) => {
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
