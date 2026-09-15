// AUTO-RECORDED from test-plans/AdminPortal/verify-job-information-summary-details.md
// Source: Azure DevOps project pd-recruitment, test case #102865 "Verify
// Job Information Summary details" (steps supplied via the same shared-step
// block as the other AdminPortal test cases in this hub, work item rev 3).
// The .md plan is canonical. AI-repair will patch failing lines in this file.
// Do not hand-edit unless you are also updating the .md plan.
//
// READ-ONLY: unlike every other AdminPortal spec in this hub, this one
// creates no data. It logs in as the Job AUTHORISER (Mphoh, not kamogelos —
// a different role in the same workflow) and only opens/inspects an
// existing Inbox item, never clicking "Authorise" or "Do Not Authorise".
//
// This test case's precondition — an item awaiting "Authorise Job Posting"
// in the current user's Inbox — does NOT exist for kamogelos (the Job
// Capturer account used elsewhere in this hub): their Inbox is empty,
// because items they submit route to a separate Authoriser role. Confirmed
// live on 2026-08-04 that Mphoh's Inbox has 41 such items (a mix of
// kamogelo's and other seeded submissions), so this spec logs in as Mphoh
// and opens whichever "Authorise Job Posting" item is first in the
// unfiltered Inbox at run time — the shared QA dataset is under concurrent
// modification by other testers/processes, so this is dynamic on purpose,
// not hardcoded to a specific Ref No (same rationale as
// Jobs/verify-apply-for-a-job.spec.ts's job-card selection).
//
// DOM notes confirmed live: the Inbox row's magnifying-glass icon is an
// <a class="sha-link"> wrapping the search icon — same row structure as the
// My Items table. The Authoriser's detail view reuses the same ant-form
// Job Information Summary panel as the Job Posting wizard itself (not the
// separate read-only "Confirmation" summary component), so most fields are
// actual (disabled) <input>/<select> elements reachable via a plain
// label -> sibling-column lookup; "Salary Range" has no <input>, so its
// value is read from the label's sibling `.ant-form-item-control` text.

import { test, expect, Page, Locator } from '@playwright/test';

const APP_URL = 'https://pd-recruitment-adminportal-qa.shesha.app/';
const AUTHORISER = { user: 'Mphoh', password: '123qwe' };
const ACTION_REQUIRED = 'Authorise Job Posting';

function fieldInput(page: Page, labelText: string): Locator {
  return page.locator('label', { hasText: labelText }).locator('xpath=../..').locator('input').first();
}

function fieldSelect(page: Page, labelText: string): Locator {
  return page.locator('label', { hasText: labelText }).locator('xpath=../..').locator('.ant-select').first();
}

function fieldControlText(page: Page, labelText: string): Locator {
  return page.locator('label', { hasText: labelText }).locator('xpath=../..').locator('.ant-form-item-control').first();
}

function firstAuthoriseJobRow(page: Page): Locator {
  return page.locator('div[role="row"]').filter({ hasText: ACTION_REQUIRED }).first();
}

async function loginAsMpho(page: Page) {
  // waitUntil:'load' times out on this app (background network activity
  // stays alive past the 30s navigationTimeout) — see the other AdminPortal
  // specs for the same fix.
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
  // Close the hover-flyout submenu (it can stay open and overlap the toolbar)
  await page.mouse.move(900, 400);
  await page.mouse.move(1200, 700);
  await page.waitForTimeout(300);
}

async function openFirstAuthoriseJobItem(page: Page) {
  await firstAuthoriseJobRow(page).locator('a.sha-link').first().click();
  await page.waitForLoadState('networkidle').catch(() => {});
  await page.waitForTimeout(2000);
}

async function openJobInformationSummaryTab(page: Page) {
  await page.getByText('Job Information Summary', { exact: true }).first().click();
  await page.waitForTimeout(800);
}

async function advanceToJobInformationSummaryTab(page: Page) {
  await loginAsMpho(page);
  await goToInbox(page);
  await openFirstAuthoriseJobItem(page);
  await openJobInformationSummaryTab(page);
}

test.describe('ADMINPORTAL-102865 — Verify Job Information Summary details', () => {
  test.describe.configure({ mode: 'serial' });

  test('TC-01: Login as Mphoh', async ({ page }) => {
    await loginAsMpho(page);
    // ASSERT (BLOCKING) URL no longer contains /login
    await expect(page).not.toHaveURL(/login/i);
  });

  test('TC-02: Expand the Workflows menu', async ({ page }) => {
    await loginAsMpho(page);
    // STEP: CLICK the Workflows sidebar icon
    await expandWorkflowsMenu(page);
    // ASSERT (BLOCKING) submenu is displayed
    await expect(page.getByText('Inbox', { exact: true }).first()).toBeVisible();
  });

  test('TC-03: Navigate to Inbox submenu', async ({ page }) => {
    await loginAsMpho(page);
    // STEP: CLICK the Inbox submenu item
    await goToInbox(page);
    // ASSERT (BLOCKING) Export button and Incoming Items table are visible
    await expect(page.getByRole('button', { name: 'Export' })).toBeVisible();
    await expect(page.getByText('Ref No', { exact: true })).toBeVisible();
    await expect(page.getByText('Action Required', { exact: true })).toBeVisible();
  });

  test('TC-04: Open any Job with Authorize Job as action required', async ({ page }) => {
    await loginAsMpho(page);
    await goToInbox(page);
    // ASSERT (BLOCKING) at least one Inbox row needs "Authorise Job Posting"
    await expect(firstAuthoriseJobRow(page)).toBeVisible();
    // STEP: CLICK the magnifying-glass icon on that row
    await openFirstAuthoriseJobItem(page);
    // ASSERT (BLOCKING) the job's details view is displayed
    await expect(page.getByText('Job Information Summary', { exact: true }).first()).toBeVisible();
  });

  test('TC-05: Click on Job Information Summary tab', async ({ page }) => {
    await loginAsMpho(page);
    await goToInbox(page);
    await openFirstAuthoriseJobItem(page);
    // STEP: CLICK the "Job Information Summary" tab
    await openJobInformationSummaryTab(page);
    // ASSERT (BLOCKING) Job information summary details are displayed
    await expect(fieldInput(page, 'Job Reference Number')).toBeVisible();
  });

  test('TC-06: Check that Job Reference Number field is populated', async ({ page }) => {
    await advanceToJobInformationSummaryTab(page);
    // ASSERT (BLOCKING) Job Reference Number field is non-empty
    await expect(fieldInput(page, 'Job Reference Number')).not.toHaveValue('');
  });

  test('TC-07: Check that Province/Branch field is populated', async ({ page }) => {
    await advanceToJobInformationSummaryTab(page);
    // ASSERT (BLOCKING) Province / Branch field is non-empty
    await expect(fieldInput(page, 'Province / Branch')).not.toHaveValue('');
  });

  test('TC-08: Check that Salary Range field is populated', async ({ page }) => {
    await advanceToJobInformationSummaryTab(page);
    // ASSERT (BLOCKING) Salary Range is populated as "R<amount> - R<amount>"
    await expect(fieldControlText(page, 'Salary Range')).toHaveText(/^R[\d,.]+\s*-\s*R[\d,.]+$/);
  });

  test('TC-09: Check that Centre/Office Name field is populated', async ({ page }) => {
    await advanceToJobInformationSummaryTab(page);
    // ASSERT (BLOCKING) Centre / Office Name field is non-empty
    await expect(fieldSelect(page, 'Centre / Office Name')).not.toHaveText('');
  });

  test('TC-10: Check that Closing Date field is populated', async ({ page }) => {
    await advanceToJobInformationSummaryTab(page);
    // ASSERT (BLOCKING) Closing Date field is a populated DD/MM/YYYY date
    await expect(fieldInput(page, 'Closing Date')).toHaveValue(/^\d{2}\/\d{2}\/\d{4}$/);
  });
});
