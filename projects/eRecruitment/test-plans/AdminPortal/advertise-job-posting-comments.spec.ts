// AUTO-RECORDED from test-plans/AdminPortal/advertise-job-posting-comments.md
// Source: Azure DevOps project pd-recruitment, test case #103733 "Advertise
// Job posting comments" (steps supplied via the same shared-step block as
// the other AdminPortal test cases in this hub, work item rev 2).
// The .md plan is canonical. AI-repair will patch failing lines in this file.
// Do not hand-edit unless you are also updating the .md plan.
//
// NEW ROLE: Moshadih (displays as "Moshadi Houvet") is the Job Advertiser —
// a distinct queue/Inbox from the Job Authoriser (Mphoh) and Job Capturer
// (kamogelos) used elsewhere in this project.
//
// DISCREPANCY (confirmed live 2026-08-05): ADO step 5's expected result
// ("Close, View in PDF, Do not Authorise, and Authorise buttons displayed")
// is copy-pasted from the Authoriser flow's shared steps and does not match
// this page — the Advertiser's details view only has Close and View in PDF
// (plus Save in the Comments panel); there's a separate "Advertise" panel
// below Job Details with Closing Date / Advertised Later / Internal
// Communications / DHA Website fields for actually scheduling/publishing
// the ad, which this spec does not touch. TC-04 asserts the real buttons.
//
// STATEFUL (additive, non-destructive): adds a real, permanent comment to
// whichever job posting is opened; never touches the Advertise panel.

import { test, expect, Page, Locator } from '@playwright/test';

const APP_URL = 'https://pd-recruitment-adminportal-qa.shesha.app/';
const ADVERTISER = { user: 'Moshadih', password: '123qwe' };
const ADVERTISER_DISPLAY_NAME = 'Moshadi Houvet';
const ACTION_REQUIRED = 'Advertise Job Posting';

function commentText(): string {
  return `Confirming advertisement details before publishing. (${Date.now()})`;
}

function firstAdvertiseJobRow(page: Page): Locator {
  return page.locator('div[role="row"]').filter({ hasText: ACTION_REQUIRED }).first();
}

function commentsPanel(page: Page): Locator {
  return page.locator('div', { hasText: 'Comments' }).filter({ has: page.locator('textarea') }).last();
}

async function loginAsMoshadi(page: Page) {
  await page.goto(`${APP_URL}login`, { waitUntil: 'domcontentloaded' });
  await page.waitForSelector('input[placeholder="Username"]', { timeout: 20000 });
  await page.locator('input[placeholder="Username"]').fill(ADVERTISER.user);
  await page.locator('input[placeholder="Password"]').fill(ADVERTISER.password);
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
  // This Inbox has been observed to still show a "loading..." spinner well
  // past networkidle — wait generously before relying on row content.
  await page.waitForTimeout(3000);
  await page.mouse.move(900, 400);
  await page.mouse.move(1200, 700);
  await page.waitForTimeout(300);
}

async function openFirstAdvertiseJobItem(page: Page) {
  await firstAdvertiseJobRow(page).locator('a.sha-link').first().click();
  await page.waitForLoadState('networkidle').catch(() => {});
  await page.waitForTimeout(2000);
}

test.describe('ADMINPORTAL-103733 — Advertise Job posting comments', () => {
  test.describe.configure({ mode: 'serial' });

  test('TC-01: Login as Moshadih', async ({ page }) => {
    await loginAsMoshadi(page);
    // ASSERT (BLOCKING) URL no longer contains /login
    await expect(page).not.toHaveURL(/login/i);
  });

  test('TC-02: Expand the Workflows menu', async ({ page }) => {
    await loginAsMoshadi(page);
    await expandWorkflowsMenu(page);
    // ASSERT (BLOCKING) submenu is displayed
    await expect(page.getByText('Inbox', { exact: true }).first()).toBeVisible();
  });

  test('TC-03: Navigate to Inbox submenu', async ({ page }) => {
    await loginAsMoshadi(page);
    await goToInbox(page);
    // ASSERT (BLOCKING) Export button and Incoming Items table are visible
    await expect(page.getByRole('button', { name: 'Export' })).toBeVisible();
    await expect(page.getByText('Ref No', { exact: true })).toBeVisible();
  });

  test('TC-04: Open any Job with Advertise Job Posting as action required', async ({ page }) => {
    await loginAsMoshadi(page);
    await goToInbox(page);
    await expect(firstAdvertiseJobRow(page)).toBeVisible();
    await openFirstAdvertiseJobItem(page);
    // ASSERT (BLOCKING) Close and View in PDF buttons are displayed (the
    // actual buttons — see discrepancy note re: ADO's copy-pasted text)
    await expect(page.getByRole('button', { name: 'Close' })).toBeVisible();
    await expect(page.getByRole('button', { name: 'View in PDF' })).toBeVisible();
  });

  test('TC-05: Navigate to Comments panel and populate comments', async ({ page }) => {
    await loginAsMoshadi(page);
    await goToInbox(page);
    await openFirstAdvertiseJobItem(page);
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
    await loginAsMoshadi(page);
    await goToInbox(page);
    await openFirstAdvertiseJobItem(page);
    const panel = commentsPanel(page);
    const text = commentText();
    await panel.locator('textarea').first().fill(text);
    await page.waitForTimeout(500);
    // STEP: CLICK the Save button
    await panel.getByRole('button', { name: 'Save' }).click();
    await page.waitForLoadState('networkidle').catch(() => {});
    await page.waitForTimeout(1500);
    // ASSERT (BLOCKING) comment is saved and displayed with advertiser name + timestamp
    await expect(panel.getByText(text, { exact: false })).toBeVisible();
    await expect(panel.getByText(ADVERTISER_DISPLAY_NAME, { exact: false }).first()).toBeVisible();
    await expect(panel.getByText(/\d{1,2}:\d{2}\s*(AM|PM)/i).first()).toBeVisible();
  });
});
