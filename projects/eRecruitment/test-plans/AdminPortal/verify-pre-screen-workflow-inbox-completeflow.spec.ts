// AUTO-RECORDED from test-plans/AdminPortal/verify-pre-screen-workflow-inbox-completeflow.md
// Source: Azure DevOps project pd-recruitment, test case #104448 "Verify
// Pre-Sreen" (work item rev 4). The .md plan is canonical. AI-repair will
// patch failing lines in this file. Do not hand-edit unless you are also
// updating the .md plan.
//
// Recruiter role (Kwenas / "Kwena Semono"). UNLIKE every other test case
// in this project, this one navigates via the sidebar's Workflows >
// Inbox menu (assigned workflow tasks), not Recruitment > Job Posting
// Dashboard. Targets Job Posting Ref No 43 ("Auto Job Post3")'s
// pre-existing applicant "Fred Everything" (Identity Number
// 2606108675655), status AWAITING PRE-SCREENING — this is shared QA test
// data, not an application created by this automation session.
//
// CONFIRMED LIVE 2026-08-06: the Inbox table appears to continuously
// re-render (note the "LIVE" badges on Shesha/header and
// Shesha.Workflow/workflows-inbox) — a plain .click() on the applicant's
// row link fails with "element was detached from the DOM, retrying" in
// an unstable loop. Fixed by capturing the row link's href and
// navigating directly via page.goto() instead of clicking.
//
// The applicant's page is titled "Pre-Screen : Job Application for Fred
// Everything". "Final Category" and "Comments" are both required fields
// under "Category Details". The Declaration checkbox text is "I confirm
// that I have reviewed the candidate's application and I have assigned
// the application to the relevant category." Confirmed live: Submit
// becomes enabled once Final Category + Comments are populated,
// independent of the Declaration checkbox state (a minor discrepancy
// from ADO step 77's expected result, not a selector bug — the flow
// still checks the box before Submit regardless).
//
// TC-06 clicks the real Submit button — REAL, PERMANENT STATUS CHANGE
// (Awaiting Pre-Screening -> Pre-Screened) on pre-existing shared QA
// test data — confirmed with the requester before running.

import { test, expect, Page } from '@playwright/test';

const APP_URL = 'https://pd-recruitment-adminportal-qa.shesha.app/';
const RECRUITER = { user: 'Kwenas', password: '123qwe' };
const TARGET_REF_NO = '43';
const CANDIDATE_ROW_TEXT = 'Everything';
const FINAL_CATEGORY = 'B';
const COMMENTS_TEXT = 'Automated test pre-screening comments.';

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

async function openWorkflowsInbox(page: Page) {
  await page.locator('.anticon-menu-fold, .anticon-menu-unfold').first().click();
  await page.waitForTimeout(600);
  await page.getByText('Workflows', { exact: false }).first().click();
  await page.waitForTimeout(800);
  await page.getByText('Inbox', { exact: true }).first().click();
  await page.waitForLoadState('networkidle').catch(() => {});
  await page.waitForTimeout(2000);
}

async function openTargetJobPostingTask(page: Page) {
  await openWorkflowsInbox(page);
  const row = page.locator('div[role="row"]').filter({ has: page.getByText(TARGET_REF_NO, { exact: true }) }).first();
  await row.locator('a, [class*="link"]').first().click();
  await page.waitForLoadState('networkidle').catch(() => {});
  await page.waitForTimeout(2000);
}

// The Inbox/workflow-task page's row keeps detaching mid-click due to a
// continuously re-rendering "LIVE" table (see header comment) — capture
// the target row's href and navigate directly instead of clicking.
async function openTargetApplicationViaHref(page: Page) {
  await openTargetJobPostingTask(page);
  await page.mouse.wheel(0, 1500);
  await page.waitForTimeout(600);
  await page.getByText('loading...', { exact: false }).first().waitFor({ state: 'hidden', timeout: 20_000 }).catch(() => {});
  await page.waitForTimeout(1500);
  await page.getByText(CANDIDATE_ROW_TEXT, { exact: false }).first().waitFor({ state: 'visible', timeout: 20_000 });
  const appLink = page.locator('a').filter({ hasText: CANDIDATE_ROW_TEXT }).first();
  const href = await appLink.getAttribute('href');
  if (!href) throw new Error(`Could not resolve href for application link containing "${CANDIDATE_ROW_TEXT}"`);
  await page.goto(`${APP_URL.replace(/\/$/, '')}${href}`, { waitUntil: 'domcontentloaded' });
  await page.waitForLoadState('networkidle').catch(() => {});
  await page.waitForTimeout(2000);
}

async function scrollToCategoryDetails(page: Page) {
  for (let i = 0; i < 15; i++) {
    await page.mouse.wheel(0, 2000);
    await page.waitForTimeout(400);
    const bt = await page.locator('body').innerText().catch(() => '');
    if (bt.includes('Final Category')) return;
  }
}

function categoryItem(page: Page) {
  return page.locator('label:has-text("Final Category")').first().locator('xpath=../../..');
}

function commentsItem(page: Page) {
  return page.locator('label:has-text("Comments")').first().locator('xpath=../../..');
}

function declarationCheckbox(page: Page) {
  return page.locator('input[type="checkbox"]').first();
}

function submitButton(page: Page) {
  return page.getByRole('button', { name: 'Submit', exact: true }).first();
}

async function fillCategoryDetailsAndDeclaration(page: Page) {
  await scrollToCategoryDetails(page);
  await categoryItem(page).locator('.ant-select').first().click();
  await page.waitForTimeout(500);
  await page.locator('.ant-select-dropdown:not(.ant-select-dropdown-hidden) .ant-select-item-option', { hasText: FINAL_CATEGORY }).first().click();
  await page.waitForTimeout(400);
  await commentsItem(page).locator('textarea, input').first().fill(COMMENTS_TEXT);
  await page.waitForTimeout(400);
  await declarationCheckbox(page).click({ force: true });
  await page.waitForTimeout(600);
}

test.describe('ADMINPORTAL-104448 — Verify Pre-Sreen', () => {
  test.describe.configure({ mode: 'serial' });

  test('TC-01: Login as Kwena', async ({ page }) => {
    await loginAsKwena(page);
    await expect(page).not.toHaveURL(/login/i);
  });

  test('TC-02: Expand the Workflows dropdown and click Inbox', async ({ page }) => {
    test.setTimeout(120_000);
    await loginAsKwena(page);
    await openWorkflowsInbox(page);
    // ASSERT (BLOCKING) submenus visible + incoming items table displayed
    await expect(page.getByText('Sent Items', { exact: false }).first()).toBeVisible();
    await expect(page.getByText('My Items', { exact: false }).first()).toBeVisible();
    await expect(page.getByText('Draft', { exact: false }).first()).toBeVisible();
    await expect(page.getByText('Incoming Items', { exact: false }).first()).toBeVisible();
  });

  test('TC-03: Open the job post with reference number 43', async ({ page }) => {
    test.setTimeout(120_000);
    await loginAsKwena(page);
    await openTargetJobPostingTask(page);
    // ASSERT (BLOCKING) "Screen Applications: Auto Job Post3" page opens
    await expect(page.getByText('Auto Job Post3', { exact: false }).first()).toBeVisible();
  });

  test('TC-04: Navigate to Applications panel and click the Surname/Initials link for Fred Everything', async ({ page }) => {
    test.setTimeout(180_000);
    await loginAsKwena(page);
    await openTargetApplicationViaHref(page);
    // ASSERT (BLOCKING) application opens with AWAITING PRE-SCREENING status
    await expect(page.getByText('Personal Details', { exact: true }).first()).toBeVisible();
    await expect(page.getByText('AWAITING PRE-SCREENING', { exact: false }).first()).toBeVisible();
  });

  test('TC-05: Select Final Category B, populate Comments, check the Declaration checkbox', async ({ page }) => {
    test.setTimeout(180_000);
    await loginAsKwena(page);
    await openTargetApplicationViaHref(page);
    await fillCategoryDetailsAndDeclaration(page);
    // ASSERT (BLOCKING) Final Category shows "B"
    await expect(categoryItem(page)).toContainText(FINAL_CATEGORY);
    // ASSERT (BLOCKING) Comments field contains the entered text
    await expect(commentsItem(page).locator('textarea, input').first()).toHaveValue(COMMENTS_TEXT);
    // ASSERT (BLOCKING) Declaration checkbox is checked
    await expect(declarationCheckbox(page)).toBeChecked();
    // ASSERT (BLOCKING) Submit button is enabled
    await expect(submitButton(page)).toBeEnabled();
  });

  test('TC-06: Click on Submit', async ({ page }) => {
    test.setTimeout(180_000);
    await loginAsKwena(page);
    await openTargetApplicationViaHref(page);
    await fillCategoryDetailsAndDeclaration(page);
    // STEP: CLICK the real Submit button — REAL, PERMANENT STATUS
    // CHANGE, confirmed with requester
    await submitButton(page).click();
    await page.waitForTimeout(3000);
    await page.waitForLoadState('networkidle').catch(() => {});
    await page.waitForTimeout(2000);
    // ASSERT (BLOCKING) after Submit + reload, status shows PRE-SCREENED
    await page.reload({ waitUntil: 'domcontentloaded' });
    await page.waitForLoadState('networkidle').catch(() => {});
    await page.waitForTimeout(2000);
    await expect(page.getByText('PRE-SCREENED', { exact: false }).first()).toBeVisible();
  });
});
