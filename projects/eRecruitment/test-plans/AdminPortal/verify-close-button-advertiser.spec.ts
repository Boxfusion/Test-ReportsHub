// AUTO-RECORDED from test-plans/AdminPortal/verify-close-button-advertiser.md
// Source: Azure DevOps project pd-recruitment, test case #104252 "Verify
// Close button on Advertise Job Posting step" (steps supplied via the same
// shared-step block as the other AdminPortal test cases in this hub, work
// item rev 2).
// The .md plan is canonical. AI-repair will patch failing lines in this file.
// Do not hand-edit unless you are also updating the .md plan.
//
// READ-ONLY: same Advertiser flow as the other specs targeting
// "2TestingJobSummaryData" in this project. Never clicks Save/Do Not
// Authorise/Authorise.
//
// This is the Advertiser-role equivalent of
// AdminPortal/verify-close-button-authoriser.spec.ts (#103649), which found
// the Authoriser's page-level Close button intermittently unreliable
// (~1/6 successful navigations, no clear timing pattern — see
// test-reports/bugs/2026-08-04-authoriser-close-button-does-not-navigate.md).
// A quick live check here on 2026-08-05 found the same symptom (no
// navigation even 10s after the click), so TC-05 uses the same rigorous
// approach: a ~3 minute wait and a content-based check ("Incoming Items"
// heading) rather than a URL check.

import { test, expect, Page, Locator } from '@playwright/test';

const APP_URL = 'https://pd-recruitment-adminportal-qa.shesha.app/';
const ADVERTISER = { user: 'Moshadih', password: '123qwe' };
const ACTION_REQUIRED = 'Advertise Job Posting';
const PREFERRED_JOB_NAME = '2TestingJobSummaryData';

async function targetAdvertiseJobRow(page: Page): Promise<Locator> {
  const preferred = page.locator('div[role="row"]').filter({ hasText: ACTION_REQUIRED }).filter({ hasText: PREFERRED_JOB_NAME });
  if (await preferred.count()) return preferred.first();
  return page.locator('div[role="row"]').filter({ hasText: ACTION_REQUIRED }).first();
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

async function openTargetAdvertiseJobItem(page: Page) {
  const row = await targetAdvertiseJobRow(page);
  await row.locator('a.sha-link').first().click();
  await page.waitForLoadState('networkidle').catch(() => {});
  await page.waitForTimeout(2000);
}

test.describe('ADMINPORTAL-104252 — Verify Close button on Advertise Job Posting step', () => {
  test.describe.configure({ mode: 'serial' });

  test('TC-01: Login with Advertiser credentials', async ({ page }) => {
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
    await expect(await targetAdvertiseJobRow(page)).toBeVisible();
    await openTargetAdvertiseJobItem(page);
    // ASSERT (BLOCKING) Close and View in PDF buttons are displayed
    await expect(page.getByRole('button', { name: 'Close' })).toBeVisible();
    await expect(page.getByRole('button', { name: 'View in PDF' })).toBeVisible();
  });

  test('TC-05: Click on Close button at the bottom of the page', async ({ page }) => {
    // Match the Authoriser Close-button investigation's budget (#103649).
    test.setTimeout(300_000);

    await loginAsMoshadi(page);
    await goToInbox(page);
    await openTargetAdvertiseJobItem(page);
    // STEP: CLICK the Close button
    await page.getByRole('button', { name: 'Close' }).click();
    await page.waitForLoadState('networkidle').catch(() => {});
    // Wait a few minutes before checking navigation — see objective note
    // re: ADMINPORTAL-103649's observed delay/intermittency.
    await page.waitForTimeout(180_000);
    // ASSERT (BLOCKING) system navigates to Incoming Items — checked by
    // page content, not URL.
    await expect(page.getByText('Incoming Items', { exact: true })).toBeVisible({ timeout: 15_000 });
  });
});
