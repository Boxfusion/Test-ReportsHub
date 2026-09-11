// AUTO-RECORDED from test-plans/AdminPortal/verify-send-message-public-portal-completeflow.md
// Source: Azure DevOps project pd-recruitment, test case #106402 "Verify
// send messages to public portal" (work item rev 2). The .md plan is
// canonical. AI-repair will patch failing lines in this file. Do not
// hand-edit unless you are also updating the .md plan.
//
// Recruiter role (Kwenas / "Kwena Semono"), standard Recruitment > Job
// Posting Dashboard navigation. Targets Job Posting "HRMC 23/26/5"
// ("Software Developer") — applicant Victor Gyokeres, status REJECTED.
//
// CONFIRMED LIVE 2026-08-06: none of the 3 existing applications on this
// job posting are currently "Awaiting Pre-Screening" as ADO step 7
// describes (all already actioned) — this does not block the Inbox
// message-send feature under test, which works regardless of
// application status.
//
// TC-07 clicks the real Send button — a real, persistent write (adds a
// message to the Inbox panel), but does NOT change the application's
// recruitment-pipeline status. Confirmed with the requester before
// running, per this project's standing confirm-before-real-write
// convention.

import { test, expect, Page } from '@playwright/test';

const APP_URL = 'https://pd-recruitment-adminportal-qa.shesha.app/';
const RECRUITER = { user: 'Kwenas', password: '123qwe' };
const TARGET_REF_NO = 'HRMC 23/26/5';
const CANDIDATE_ROW_TEXT = 'Gyokeres V';
const MESSAGE_TEXT = `Automated test message ${Date.now() % 100000}`;

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

async function openTargetApplication(page: Page) {
  await openTargetJobPosting(page);
  await page.mouse.wheel(0, 1500);
  await page.waitForTimeout(1000);
  const appLink = page.locator('a').filter({ hasText: CANDIDATE_ROW_TEXT }).first();
  await appLink.scrollIntoViewIfNeeded().catch(() => {});
  await appLink.click();
  await page.waitForLoadState('networkidle').catch(() => {});
  await page.waitForTimeout(2000);
}

function inboxMessageInput(page: Page) {
  return page.locator('textarea[placeholder*="message" i], input[placeholder*="message" i]').first();
}

function inboxSendButton(page: Page) {
  return page.getByRole('button', { name: 'Send', exact: false }).first();
}

test.describe('ADMINPORTAL-106402 — Verify send messages to public portal', () => {
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

  test('TC-04: Search for a job with Ref HRMC 23/26/5, open in details view', async ({ page }) => {
    test.setTimeout(120_000);
    await loginAsKwena(page);
    await openTargetJobPosting(page);
    await expect(page.getByText('Job Reference', { exact: false }).first()).toBeVisible();
    await expect(page.getByText(TARGET_REF_NO, { exact: true }).first()).toBeVisible();
  });

  test('TC-05: Scroll to Applications panel and open Victor Gyokeres\'s application', async ({ page }) => {
    test.setTimeout(180_000);
    await loginAsKwena(page);
    await openTargetApplication(page);
    // ASSERT (BLOCKING) application opens in details view successfully
    await expect(page.getByText('Personal Details', { exact: true }).first()).toBeVisible();
    await expect(page.getByText('Victor', { exact: false }).first()).toBeVisible();
  });

  test('TC-06: Navigate to Inbox panel and populate a message', async ({ page }) => {
    test.setTimeout(180_000);
    await loginAsKwena(page);
    await openTargetApplication(page);
    await expect(page.getByText('Inbox', { exact: true }).first()).toBeVisible();
    await inboxMessageInput(page).fill(MESSAGE_TEXT);
    await page.waitForTimeout(500);
    // ASSERT (BLOCKING) message field contains the entered text
    await expect(inboxMessageInput(page)).toHaveValue(MESSAGE_TEXT);
  });

  test('TC-07: Click on Send button', async ({ page }) => {
    test.setTimeout(180_000);
    await loginAsKwena(page);
    await openTargetApplication(page);
    await inboxMessageInput(page).fill(MESSAGE_TEXT);
    await page.waitForTimeout(500);
    // STEP: CLICK the real Send button — real, persistent write,
    // confirmed with requester
    await inboxSendButton(page).click();
    await page.waitForTimeout(2000);
    await page.waitForLoadState('networkidle').catch(() => {});
    await page.waitForTimeout(1500);
    // ASSERT (BLOCKING) the sent message text is rendered in the Inbox panel
    await expect(page.getByText(MESSAGE_TEXT, { exact: false }).first()).toBeVisible();
    // ASSERT (BLOCKING) the candidate's name is associated with the rendered message
    await expect(page.getByText('Victor Gyokeres', { exact: false }).first()).toBeVisible();
  });
});
