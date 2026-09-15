// AUTO-RECORDED from test-plans/AdminPortal/verify-authorize-job-posting.md
// Source: Azure DevOps project pd-recruitment, test case #103723 "Verify
// Authorize Job Posting" (steps supplied via the same shared-step block as
// the other AdminPortal test cases in this hub, work item rev 2).
// The .md plan is canonical. AI-repair will patch failing lines in this file.
// Do not hand-edit unless you are also updating the .md plan.
//
// NAMING NOTE: despite the ADO title "Verify Authorize Job Posting," the
// actual steps describe the Do Not Authorise (reject) flow throughout,
// ending in a real OK submission — followed literally per the steps.
//
// ⚠️ STATEFUL/DESTRUCTIVE (confirmed with requester before running): TC-07
// clicks OK for real, submitting an actual "Do Not Authorise" rejection
// against whichever job posting is opened, consuming it from the shared QA
// Inbox. This is NOT reversible via the UI. TC-01 through TC-06 open and
// abandon the dialog without saving (no backend call happens until OK is
// clicked), so only TC-07 performs the real submission and only one job
// posting is affected per run.
//
// DOM notes reused from verify-close-button-do-not-authorise-dialog.spec.ts:
// no "OK" button exists in the dialog until the Comments textarea is
// non-empty (absent from the DOM, not merely disabled).

import { test, expect, Page, Locator } from '@playwright/test';

const APP_URL = 'https://pd-recruitment-adminportal-qa.shesha.app/';
const AUTHORISER = { user: 'Mphoh', password: '123qwe' };
const ACTION_REQUIRED = 'Authorise Job Posting';
const COMMENT_TEXT = 'Missing required documentation.';

function firstAuthoriseJobRow(page: Page): Locator {
  return page.locator('div[role="row"]').filter({ hasText: ACTION_REQUIRED }).first();
}

function doNotAuthorizeModal(page: Page): Locator {
  return page.locator('.ant-modal:visible').last();
}

async function loginAsMpho(page: Page) {
  await page.goto(`${APP_URL}login`, { waitUntil: 'domcontentloaded' });
  await page.waitForSelector('input[placeholder="Username"]', { timeout: 20000 });
  await page.locator('input[placeholder="Username"]').fill(AUTHORISER.user);
  await page.locator('input[placeholder="Password"]').fill(AUTHORISER.password);
  await page.getByRole('button', { name: 'Sign In' }).click();
  await page.waitForURL(url => !url.href.includes('/login'), { timeout: 30000 });
  await page.waitForLoadState('networkidle').catch(() => {});
  await page.waitForTimeout(1000);
}

async function expandWorkflowsMenu(page: Page) {
  await page.getByText('Workflows', { exact: false }).first().click();
  await page.waitForTimeout(600);
}

async function goToInbox(page: Page) {
  await expandWorkflowsMenu(page);
  await page.getByText('Inbox', { exact: true }).first().click();
  await page.waitForLoadState('networkidle').catch(() => {});
  await page.waitForTimeout(1000);
  await page.mouse.move(900, 400);
  await page.mouse.move(1200, 700);
  await page.waitForTimeout(300);
}

async function openFirstAuthoriseJobItem(page: Page) {
  await firstAuthoriseJobRow(page).locator('a.sha-link').first().click();
  await page.waitForLoadState('networkidle').catch(() => {});
  await page.waitForTimeout(2000);
}

async function openDoNotAuthoriseDialog(page: Page) {
  await page.getByRole('button', { name: 'Do Not Authorise' }).click();
  await page.waitForTimeout(1000);
}

test.describe('ADMINPORTAL-103723 — Verify Authorize Job Posting', () => {
  test.describe.configure({ mode: 'serial' });

  test('TC-01: Login as Mphoh', async ({ page }) => {
    await loginAsMpho(page);
    // ASSERT (BLOCKING) URL no longer contains /login
    await expect(page).not.toHaveURL(/login/i);
  });

  test('TC-02: Expand the Workflows menu', async ({ page }) => {
    await loginAsMpho(page);
    await expandWorkflowsMenu(page);
    // ASSERT (BLOCKING) submenu is displayed
    await expect(page.getByText('Inbox', { exact: true }).first()).toBeVisible();
  });

  test('TC-03: Navigate to Inbox submenu', async ({ page }) => {
    await loginAsMpho(page);
    await goToInbox(page);
    // ASSERT (BLOCKING) Export button and Incoming Items table are visible
    await expect(page.getByRole('button', { name: 'Export' })).toBeVisible();
    await expect(page.getByText('Ref No', { exact: true })).toBeVisible();
  });

  test('TC-04: Open any Job with Authorize Job as action required', async ({ page }) => {
    await loginAsMpho(page);
    await goToInbox(page);
    await expect(firstAuthoriseJobRow(page)).toBeVisible();
    await openFirstAuthoriseJobItem(page);
    // ASSERT (BLOCKING) Close / View in PDF / Do Not Authorise / Authorise buttons are displayed
    await expect(page.getByRole('button', { name: 'Close' })).toBeVisible();
    await expect(page.getByRole('button', { name: 'View in PDF' })).toBeVisible();
    await expect(page.getByRole('button', { name: 'Do Not Authorise' })).toBeVisible();
    await expect(page.getByRole('button', { name: 'Authorise', exact: true })).toBeVisible();
  });

  test('TC-05: Click on Do Not Authorise button', async ({ page }) => {
    await loginAsMpho(page);
    await goToInbox(page);
    await openFirstAuthoriseJobItem(page);
    // STEP: CLICK the Do Not Authorise button
    await openDoNotAuthoriseDialog(page);
    const modal = doNotAuthorizeModal(page);
    // ASSERT (BLOCKING) Do Not Authorize dialog shows with Textarea + Close button
    await expect(page.getByText('Do Not Authorize', { exact: true })).toBeVisible();
    await expect(modal.locator('textarea')).toBeVisible();
    await expect(modal.locator('button').filter({ hasText: 'Close' })).toBeVisible();
    // ASSERT (BLOCKING) no OK button exists yet (comments empty)
    await expect(modal.getByRole('button', { name: 'OK', exact: true })).toHaveCount(0);
  });

  test('TC-06: Populate Comments in the text Area', async ({ page }) => {
    await loginAsMpho(page);
    await goToInbox(page);
    await openFirstAuthoriseJobItem(page);
    await openDoNotAuthoriseDialog(page);
    const modal = doNotAuthorizeModal(page);
    // STEP: TYPE a comment into the Comments textarea
    await modal.locator('textarea').first().fill(COMMENT_TEXT);
    await page.waitForTimeout(500);
    // ASSERT (BLOCKING) comment is populated and OK button is now visible
    await expect(modal.locator('textarea').first()).toHaveValue(COMMENT_TEXT);
    await expect(modal.getByRole('button', { name: 'OK', exact: true })).toBeVisible();
  });

  test('TC-07: Click on OK button (real submission)', async ({ page }) => {
    await loginAsMpho(page);
    await goToInbox(page);
    await openFirstAuthoriseJobItem(page);
    await openDoNotAuthoriseDialog(page);
    const modal = doNotAuthorizeModal(page);
    await modal.locator('textarea').first().fill(COMMENT_TEXT);
    await page.waitForTimeout(500);
    // STEP: CLICK the OK button — this is a real, intentional rejection
    // submission (confirmed with the requester before running).
    await modal.getByRole('button', { name: 'OK', exact: true }).click();
    await page.waitForLoadState('networkidle').catch(() => {});
    await page.waitForTimeout(2500);
    // ASSERT (BLOCKING) dialog closed and system navigated to My Items
    await expect(page.locator('.ant-modal:visible')).toHaveCount(0);
    await expect(page.getByText('My Items', { exact: true }).first()).toBeVisible();
  });
});
