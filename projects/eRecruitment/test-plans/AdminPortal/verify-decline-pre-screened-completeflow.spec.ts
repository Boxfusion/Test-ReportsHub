// AUTO-RECORDED from test-plans/AdminPortal/verify-decline-pre-screened-completeflow.md
// Source: Azure DevOps project pd-recruitment, test case #106398 "Verify
// Decline Pre_Screened Application" (work item rev 3). The .md plan is
// canonical. AI-repair will patch failing lines in this file. Do not
// hand-edit unless you are also updating the .md plan.
//
// Recruiter role (Kwenas / "Kwena Semono"), Recruitment > Job Posting
// Dashboard section. Targets Job Posting Ref No 40's application created
// on ADMINPORTAL-106172's second run (2026-08-06) — "AutoTest Edit Last
// Name", Identity Number 8907115432088, status PRE-SCREENED. This is the
// ONLY Pre-Screened application on this job posting (the original "Edit
// Last Name A" application already moved to Appointed), so both ADO
// step 8 and step 12's "open ... application" reference the same one.
//
// Confirmed live 2026-08-06: Decline popup is titled "Reason for
// Decline", with a "Reason" textarea and "Cancel"/"Ok" buttons (lowercase
// "k" — NOT "OK").
//
// TC-06 clicks the real "Ok" button — REAL, PERMANENT STATUS CHANGE
// (Pre-Screened -> Declined) — confirmed by the requester ("just go
// straight to decline pre-screened").

import { test, expect, Page } from '@playwright/test';

const APP_URL = 'https://pd-recruitment-adminportal-qa.shesha.app/';
const RECRUITER = { user: 'Kwenas', password: '123qwe' };
const TARGET_REF_NO = '40';
const CANDIDATE_ROW_TEXT = 'Edit Last Name';
// NOTE: an entirely unrelated, pre-existing candidate "Edit Last Name F"
// (Identity Number 8807125432088) also matches the CANDIDATE_ROW_TEXT
// substring — confirmed live 2026-08-06. Use the target's unique
// Identity Number, not the Last Name substring, whenever precisely
// identifying THIS application vs. confirming its absence from a list.
const TARGET_IDENTITY_NUMBER = '8907115432088';
const DECLINE_REASON = 'Automated test decline reason.';

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

async function openPreScreenedTab(page: Page) {
  await page.mouse.wheel(0, 1200);
  await page.waitForTimeout(600);
  await clickVisible(page, page.getByText('Pre-screened', { exact: false }));
  await page.getByText('loading...', { exact: false }).first().waitFor({ state: 'hidden', timeout: 15_000 }).catch(() => {});
  await page.waitForTimeout(1000);
}

async function openTargetApplication(page: Page) {
  await openTargetJobPosting(page);
  await openPreScreenedTab(page);
  await clickVisible(page, page.getByText(CANDIDATE_ROW_TEXT, { exact: false }));
  await page.waitForLoadState('networkidle').catch(() => {});
  await page.waitForTimeout(2000);
}

function declinePopup(page: Page) {
  return page.locator('.ant-modal-content').filter({ hasText: /decline/i }).first();
}

function declineButton(page: Page) {
  return page.getByRole('button', { name: 'Decline', exact: true }).first();
}

function okButton(page: Page) {
  return declinePopup(page).getByRole('button', { name: 'Ok', exact: true }).first();
}

function cancelButtonInPopup(page: Page) {
  return declinePopup(page).getByRole('button', { name: 'Cancel', exact: true }).first();
}

test.describe('ADMINPORTAL-106398 — Verify Decline Pre_Screened Application', () => {
  test.describe.configure({ mode: 'serial' });

  test('TC-01: Login as Kwena', async ({ page }) => {
    await loginAsKwena(page);
    await expect(page).not.toHaveURL(/login/i);
  });

  test('TC-02: Navigate to Job Posting Dashboard, open Ref No 40, open Pre-Screened tab', async ({ page }) => {
    test.setTimeout(120_000);
    await loginAsKwena(page);
    await openTargetJobPosting(page);
    await openPreScreenedTab(page);
    // ASSERT (BLOCKING) list of pre-screened applications is displayed
    const visibleAppLink = await firstVisible(page.getByText(CANDIDATE_ROW_TEXT, { exact: false }));
    await expect(visibleAppLink).toBeVisible();
  });

  test('TC-03: Click on the Surname and Initials link to open the application', async ({ page }) => {
    test.setTimeout(180_000);
    await loginAsKwena(page);
    await openTargetApplication(page);
    // ASSERT (BLOCKING) application opens in details view
    await expect(page.getByText('Personal Details', { exact: true }).first()).toBeVisible();
  });

  test('TC-04: Scroll to the bottom and click Decline, then click Cancel', async ({ page }) => {
    test.setTimeout(180_000);
    await loginAsKwena(page);
    await openTargetApplication(page);
    await page.mouse.wheel(0, 20000);
    await page.waitForTimeout(1000);
    await page.mouse.wheel(0, 20000);
    await page.waitForTimeout(500);
    await declineButton(page).click();
    await page.waitForTimeout(1000);
    // ASSERT (BLOCKING) "Reason for Decline" popup appears
    await expect(declinePopup(page)).toBeVisible();
    await expect(declinePopup(page)).toContainText('Reason for Decline');
    await cancelButtonInPopup(page).click();
    await page.waitForTimeout(1000);
    // ASSERT (BLOCKING) dialog closes and application is still Pre-Screened
    await expect(declinePopup(page)).toBeHidden();
    await expect(page.getByText('PRE-SCREENED', { exact: false }).first()).toBeVisible();
  });

  test('TC-05: Re-navigate to Pre-Screened tab, re-open the application, click Decline, populate reason', async ({ page }) => {
    test.setTimeout(180_000);
    await loginAsKwena(page);
    await openTargetApplication(page);
    await page.mouse.wheel(0, 20000);
    await page.waitForTimeout(1000);
    await page.mouse.wheel(0, 20000);
    await page.waitForTimeout(500);
    await declineButton(page).click();
    await page.waitForTimeout(1000);
    // ASSERT (BLOCKING) "Reason for Decline" popup appears again
    await expect(declinePopup(page)).toBeVisible();
    await declinePopup(page).locator('textarea, input[type="text"]').first().fill(DECLINE_REASON);
    await page.waitForTimeout(500);
    // ASSERT (BLOCKING) Ok button is enabled
    await expect(okButton(page)).toBeEnabled();
  });

  test('TC-06: Click on Ok', async ({ page }) => {
    test.setTimeout(180_000);
    await loginAsKwena(page);
    await openTargetApplication(page);
    await page.mouse.wheel(0, 20000);
    await page.waitForTimeout(1000);
    await page.mouse.wheel(0, 20000);
    await page.waitForTimeout(500);
    await declineButton(page).click();
    await page.waitForTimeout(1000);
    await declinePopup(page).locator('textarea, input[type="text"]').first().fill(DECLINE_REASON);
    await page.waitForTimeout(500);
    // STEP: CLICK the real Ok button — REAL, PERMANENT STATUS CHANGE,
    // confirmed by the requester
    await okButton(page).click();
    await page.waitForTimeout(3000);
    // ASSERT (BLOCKING) page auto-navigates back to the applications table
    await expect(page.getByText('Personal Details', { exact: true })).toHaveCount(0);
  });

  test('TC-07: Navigate to Pre-Screened tab and confirm the application is no longer listed', async ({ page }) => {
    test.setTimeout(120_000);
    await loginAsKwena(page);
    await openTargetJobPosting(page);
    await openPreScreenedTab(page);
    // ASSERT (BLOCKING) the TARGET application (by unique Identity Number,
    // not the ambiguous Last Name substring — see TARGET_IDENTITY_NUMBER
    // note) no longer appears under Pre-Screened
    const matches = page.getByText(TARGET_IDENTITY_NUMBER, { exact: false });
    const count = await matches.count();
    let anyVisible = false;
    for (let i = 0; i < count; i++) {
      if (await matches.nth(i).isVisible().catch(() => false)) { anyVisible = true; break; }
    }
    expect(anyVisible).toBeFalsy();
  });

  test('TC-08: Locate the declined application and open in details view', async ({ page }) => {
    test.setTimeout(120_000);
    await loginAsKwena(page);
    await openTargetJobPosting(page);
    await page.mouse.wheel(0, 1200);
    await page.waitForTimeout(600);
    await clickVisible(page, page.getByText('All Applications', { exact: false }));
    await page.getByText('loading...', { exact: false }).first().waitFor({ state: 'hidden', timeout: 15_000 }).catch(() => {});
    await page.waitForTimeout(1000);
    // Identify the target row by its unique Identity Number (see
    // TARGET_IDENTITY_NUMBER note) rather than the ambiguous Last Name
    // substring, since an unrelated "Edit Last Name F" candidate also
    // matches CANDIDATE_ROW_TEXT.
    const idCell = await firstVisible(page.getByText(TARGET_IDENTITY_NUMBER, { exact: false }));
    const row = idCell.locator('xpath=ancestor::div[@role="row"]').first();
    await row.locator('a, [class*="link"]').first().click();
    await page.waitForLoadState('networkidle').catch(() => {});
    await page.waitForTimeout(2000);
    // ASSERT (BLOCKING) application opens successfully and status shows
    // Rejected — confirmed live 2026-08-06 that the app displays
    // "REJECTED" (badge) / "Rejected" (table), never "Declined" anywhere,
    // despite ADO's expected-result text saying "declined".
    await expect(page.getByText('Personal Details', { exact: true }).first()).toBeVisible();
    await expect(page.getByText('REJECTED', { exact: false }).first()).toBeVisible();
  });
});
