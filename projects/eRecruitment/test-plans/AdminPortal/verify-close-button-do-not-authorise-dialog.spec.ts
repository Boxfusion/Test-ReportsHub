// AUTO-RECORDED from test-plans/AdminPortal/verify-close-button-do-not-authorise-dialog.md
// Source: Azure DevOps project pd-recruitment, test case #103712 "Verify
// Close button on Do not authorise dialog" (steps supplied via the same
// shared-step block as the other AdminPortal test cases in this hub, work
// item rev 4). Raw ADO step order is 3,4,5,6,8,7 — step 8 ("Populate
// Comments") appears before step 7 ("Click Close") in document order
// despite the lower number; this spec follows document order.
// The .md plan is canonical. AI-repair will patch failing lines in this file.
// Do not hand-edit unless you are also updating the .md plan.
//
// READ-ONLY: same authoriser flow as the other Inbox specs in this project
// (login as Mphoh, open the first Inbox item awaiting "Authorise Job
// Posting"). Never clicks the dialog's "OK" (which would actually submit
// the rejection) or the page-level "Authorise"/"Do Not Authorise" outcome —
// only opens the "Do Not Authorize" dialog and dismisses it via Close.
//
// DOM notes confirmed live on 2026-08-04: the dialog has NO "OK" button
// until the Comments textarea is non-empty — it is absent from the DOM
// beforehand, not merely disabled, so this spec checks for its absence
// then its appearance rather than an enabled/disabled toggle. The dialog's
// visible-text "Close" button is NOT reachable via
// `getByRole('button', {name: 'Close'})` alone — the modal's own "X" icon
// also has `aria-label="Close"`, so both resolve and Playwright throws a
// strict-mode violation. Scope to the footer button specifically via
// `.filter({hasText: 'Close'})`. Unlike the page-level Close button
// investigated in verify-close-button-authoriser.spec.ts (confirmed
// unreliable/intermittent), this modal-level Close closes synchronously and
// immediately every time it was tried during exploration.

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

async function advanceToDoNotAuthoriseDialog(page: Page) {
  await loginAsMpho(page);
  await goToInbox(page);
  await openFirstAuthoriseJobItem(page);
  await openDoNotAuthoriseDialog(page);
}

test.describe('ADMINPORTAL-103712 — Verify Close button on Do not authorise dialog', () => {
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
    // ASSERT (BLOCKING) Do Not Authorize dialog shows with Comments textarea + Close button
    await expect(page.getByText('Do Not Authorize', { exact: true })).toBeVisible();
    await expect(doNotAuthorizeModal(page).locator('textarea')).toBeVisible();
    await expect(doNotAuthorizeModal(page).locator('button').filter({ hasText: 'Close' })).toBeVisible();
  });

  test('TC-06: Populate Comments', async ({ page }) => {
    await advanceToDoNotAuthoriseDialog(page);
    const modal = doNotAuthorizeModal(page);
    // ASSERT no OK button exists yet (comments empty)
    await expect(modal.getByRole('button', { name: 'OK', exact: true })).toHaveCount(0);
    // STEP: TYPE a comment into the Comments textarea
    await modal.locator('textarea').first().fill(COMMENT_TEXT);
    await page.waitForTimeout(500);
    // ASSERT (BLOCKING) comment is populated and OK button is now visible and enabled
    await expect(modal.locator('textarea').first()).toHaveValue(COMMENT_TEXT);
    await expect(modal.getByRole('button', { name: 'OK', exact: true })).toBeEnabled();
  });

  test('TC-07: Click on Close button', async ({ page }) => {
    await advanceToDoNotAuthoriseDialog(page);
    const modal = doNotAuthorizeModal(page);
    await modal.locator('textarea').first().fill(COMMENT_TEXT);
    await page.waitForTimeout(500);
    // STEP: CLICK the dialog's Close button (not OK)
    await modal.locator('button').filter({ hasText: 'Close' }).click();
    await page.waitForTimeout(1000);
    // ASSERT (BLOCKING) dialog closed and the job posting is unaffected
    await expect(page.locator('.ant-modal:visible')).toHaveCount(0);
    await expect(page.getByRole('button', { name: 'Authorise', exact: true })).toBeVisible();
  });
});
