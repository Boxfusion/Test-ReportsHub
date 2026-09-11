// AUTO-RECORDED from test-plans/AdminPortal/verify-view-in-pdf-button-advertiser.md
// Source: Azure DevOps project pd-recruitment, test case #104254 "Verify
// View in PDF button" (steps supplied via the same shared-step block as
// the other AdminPortal test cases in this hub, work item rev 2).
// The .md plan is canonical. AI-repair will patch failing lines in this file.
// Do not hand-edit unless you are also updating the .md plan.
//
// Same Advertiser flow as the other specs targeting "2TestingJobSummaryData"
// in this project. Confirmed live 2026-08-05: clicking "View in PDF"
// triggers a real browser download (filename "JobPosting.pdf") rather than
// opening a new tab/viewer — confirmed the downloaded file is a valid
// 4-page, ~84KB PDF (not an empty/broken file). Never clicks Save/Do Not
// Authorise/Authorise.

import { test, expect, Page, Locator } from '@playwright/test';
import * as fs from 'fs';

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

test.describe('ADMINPORTAL-104254 — Verify View in PDF button', () => {
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

  test('TC-05: Click on View in PDF button at the bottom of the page', async ({ page }) => {
    await loginAsMoshadi(page);
    await goToInbox(page);
    await openTargetAdvertiseJobItem(page);
    // STEP: CLICK the View in PDF button and capture the resulting download
    const [download] = await Promise.all([
      page.waitForEvent('download', { timeout: 20_000 }),
      page.getByRole('button', { name: 'View in PDF' }).click(),
    ]);
    // ASSERT (BLOCKING) a PDF download was triggered
    expect(download.suggestedFilename()).toMatch(/\.pdf$/i);
    const savedPath = await download.path();
    expect(savedPath).toBeTruthy();
    // ASSERT (BLOCKING) the downloaded file is non-trivial (not empty/broken)
    const stats = fs.statSync(savedPath!);
    expect(stats.size).toBeGreaterThan(1000);
  });
});
