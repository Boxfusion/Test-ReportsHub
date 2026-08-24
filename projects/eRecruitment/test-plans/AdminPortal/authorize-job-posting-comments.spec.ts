// AUTO-RECORDED from test-plans/AdminPortal/authorize-job-posting-comments.md
// Source: Azure DevOps project pd-recruitment, test case #103725 "Authorize
// Job posting comments" (steps supplied via the same shared-step block as
// the other AdminPortal test cases in this hub, work item rev 2).
// The .md plan is canonical. AI-repair will patch failing lines in this file.
// Do not hand-edit unless you are also updating the .md plan.
//
// STATEFUL (additive, non-destructive): adds a real, permanent comment to
// whichever job posting is opened, but never touches Authorise/Do Not
// Authorise, so the job's workflow status is unaffected. A fresh comment
// with a timestamp-based suffix is used per run so repeated executions
// don't produce identical-looking duplicate notes.
//
// DOM notes confirmed live on 2026-08-04: the Comments panel is the
// right-hand column on the details view ("There are no notes" when empty).
// Its Save button is disabled while the textarea is empty and becomes
// enabled as soon as any text is typed. After saving, the comment renders
// below the Save button as "<Authoriser Name>  <Mon D, YYYY H:MM AM/PM>"
// followed by the comment text on the next line.

import { test, expect, Page, Locator } from '@playwright/test';

const APP_URL = 'https://pd-recruitment-adminportal-qa.shesha.app/';
const AUTHORISER = { user: 'Mphoh', password: '123qwe' };
const AUTHORISER_DISPLAY_NAME = 'Mpho Hlalele';
const ACTION_REQUIRED = 'Authorise Job Posting';

function commentText(): string {
  return `Please double-check the salary range before final approval. (${Date.now()})`;
}

function firstAuthoriseJobRow(page: Page): Locator {
  return page.locator('div[role="row"]').filter({ hasText: ACTION_REQUIRED }).first();
}

function commentsPanel(page: Page): Locator {
  return page.locator('div', { hasText: 'Comments' }).filter({ has: page.locator('textarea') }).last();
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

test.describe('ADMINPORTAL-103725 — Authorize Job posting comments', () => {
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

  test('TC-05: Navigate to Comments panel and populate comments', async ({ page }) => {
    await loginAsMpho(page);
    await goToInbox(page);
    await openFirstAuthoriseJobItem(page);
    const panel = commentsPanel(page);
    const saveBtn = panel.getByRole('button', { name: 'Save' });
    // ASSERT Save button is disabled before typing
    await expect(saveBtn).toBeDisabled();
    // STEP: TYPE a comment into the Comments panel's textarea
    const text = commentText();
    await panel.locator('textarea').first().fill(text);
    await page.waitForTimeout(500);
    // ASSERT (BLOCKING) comment is populated and Save button is now enabled
    await expect(panel.locator('textarea').first()).toHaveValue(text);
    await expect(saveBtn).toBeEnabled();
  });

  test('TC-06: Click on Save button', async ({ page }) => {
    await loginAsMpho(page);
    await goToInbox(page);
    await openFirstAuthoriseJobItem(page);
    const panel = commentsPanel(page);
    const text = commentText();
    await panel.locator('textarea').first().fill(text);
    await page.waitForTimeout(500);
    // STEP: CLICK the Save button
    await panel.getByRole('button', { name: 'Save' }).click();
    await page.waitForLoadState('networkidle').catch(() => {});
    await page.waitForTimeout(1500);
    // ASSERT (BLOCKING) comment is saved and displayed with authorizer name + timestamp.
    // The panel accumulates comments across runs (this job posting may
    // already have earlier notes from prior executions), so name/timestamp
    // checks use .first() rather than assuming a single match — the typed
    // comment text itself is unique per run (timestamp suffix) so it alone
    // can be checked without scoping.
    await expect(panel.getByText(text, { exact: false })).toBeVisible();
    await expect(panel.getByText(AUTHORISER_DISPLAY_NAME, { exact: false }).first()).toBeVisible();
    await expect(panel.getByText(/\d{1,2}:\d{2}\s*(AM|PM)/i).first()).toBeVisible();
  });
});
