// AUTO-RECORDED from test-plans/AdminPortal/verify-recruiter-details-advertiser.md
// Source: Azure DevOps project pd-recruitment, test case #108070 "Verify
// Recruiter Details" (steps defined inline, NOT via the shared-step block
// used by #102822 and its siblings — work item rev 2).
// The .md plan is canonical. AI-repair will patch failing lines in this file.
// Do not hand-edit unless you are also updating the .md plan.
//
// READ-ONLY: same Advertiser flow as
// AdminPortal/verify-output-and-competencies-advertiser.spec.ts (login as
// Moshadih, target a specific job with confirmed complete data rather than
// blindly "the first" Advertise Job Posting row). Confirmed live
// 2026-08-05: ADO step 5's expected buttons are copy-pasted from the
// Authoriser flow and don't match this page (Close/View in PDF only). Also
// confirmed: unlike the Authoriser's Recruiter Details tab (labelled
// "Recruiter", see verify-recruiter-details-authoriser.spec.ts), this
// Advertiser view labels the same field "Name and Surname" — matching the
// Job Capturer's original wizard label instead.

import { test, expect, Page, Locator } from '@playwright/test';

const APP_URL = 'https://pd-recruitment-adminportal-qa.shesha.app/';
const ADVERTISER = { user: 'Moshadih', password: '123qwe' };
const ACTION_REQUIRED = 'Advertise Job Posting';
const PREFERRED_JOB_NAME = '2TestingJobSummaryData';

function fieldControlText(page: Page, labelText: string): Locator {
  return page.locator('label', { hasText: labelText }).locator('xpath=../..').locator('.ant-form-item-control').first();
}

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

async function openRecruiterDetailsTab(page: Page) {
  await page.getByText('Recruiter Details', { exact: true }).first().click();
  await page.waitForTimeout(800);
}

async function advanceToRecruiterDetailsTab(page: Page) {
  await loginAsMoshadi(page);
  await goToInbox(page);
  await openTargetAdvertiseJobItem(page);
  await openRecruiterDetailsTab(page);
}

test.describe('ADMINPORTAL-108070 — Verify Recruiter Details', () => {
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
    // ASSERT (BLOCKING) Close and View in PDF buttons are displayed (the
    // actual buttons — see discrepancy note re: ADO's copy-pasted text)
    await expect(page.getByRole('button', { name: 'Close' })).toBeVisible();
    await expect(page.getByRole('button', { name: 'View in PDF' })).toBeVisible();
  });

  test('TC-05: Click on Recruiter Details tab', async ({ page }) => {
    await loginAsMoshadi(page);
    await goToInbox(page);
    await openTargetAdvertiseJobItem(page);
    // STEP: CLICK the "Recruiter Details" tab
    await openRecruiterDetailsTab(page);
    // ASSERT (BLOCKING) recruiter details are displayed
    await expect(fieldControlText(page, 'Name and Surname')).toBeVisible();
  });

  test('TC-06: Check if Name and Surname of the recruiter are populated', async ({ page }) => {
    await advanceToRecruiterDetailsTab(page);
    // ASSERT (BLOCKING) Name and Surname field is non-empty
    await expect(fieldControlText(page, 'Name and Surname')).not.toHaveText('');
  });

  test('TC-07: Check that Email Address is displayed', async ({ page }) => {
    await advanceToRecruiterDetailsTab(page);
    // ASSERT (BLOCKING) Email Address is populated and looks like an email
    await expect(fieldControlText(page, 'Email Address')).toHaveText(/^\S+@\S+\.\S+$/);
  });

  test('TC-08: Check that contact number is displayed', async ({ page }) => {
    await advanceToRecruiterDetailsTab(page);
    // ASSERT (BLOCKING) Contact No is non-empty
    await expect(fieldControlText(page, 'Contact No')).not.toHaveText('');
  });
});
