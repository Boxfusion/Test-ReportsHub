// AUTO-RECORDED from test-plans/AdminPortal/verify-recruiter-details-authoriser.md
// Source: Azure DevOps project pd-recruitment, test case #103648 "Recruiter
// Details" (steps supplied via the same shared-step block as the other
// AdminPortal test cases in this hub, work item rev 3). ADO steps 10-11 are
// empty placeholder ActionSteps with no content — not automated.
// The .md plan is canonical. AI-repair will patch failing lines in this file.
// Do not hand-edit unless you are also updating the .md plan.
//
// READ-ONLY: same authoriser flow as
// AdminPortal/verify-outputs-and-competencies-details.spec.ts (login as
// Mphoh, open the first Inbox item awaiting "Authorise Job Posting"), but
// checks the "Recruiter Details" tab. Confirmed live on 2026-08-04: unlike
// the Job Capturer's own "Name and Surname" field on the Job Posting
// wizard, the Authoriser's Recruiter Details tab labels the same concept
// "Recruiter" (an ant-select showing e.g. "DHA Recruiter"); Email Address
// and Contact No are plain read-only text reached via the label's sibling
// `.ant-form-item-control` (same pattern as the Job Information Summary
// tab's Salary Range field in verify-job-information-summary-details.spec.ts).

import { test, expect, Page, Locator } from '@playwright/test';

const APP_URL = 'https://pd-recruitment-adminportal-qa.shesha.app/';
const AUTHORISER = { user: 'Mphoh', password: '123qwe' };
const ACTION_REQUIRED = 'Authorise Job Posting';

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

async function openRecruiterDetailsTab(page: Page) {
  await page.getByText('Recruiter Details', { exact: true }).first().click();
  await page.waitForTimeout(800);
}

async function advanceToRecruiterDetailsTab(page: Page) {
  await loginAsMpho(page);
  await goToInbox(page);
  await openFirstAuthoriseJobItem(page);
  await openRecruiterDetailsTab(page);
}

test.describe('ADMINPORTAL-103648 — Recruiter Details', () => {
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
    // ASSERT (BLOCKING) the job's details view is displayed
    await expect(page.getByText('Job Information Summary', { exact: true }).first()).toBeVisible();
  });

  test('TC-05: Click on Recruiter Details tab', async ({ page }) => {
    await loginAsMpho(page);
    await goToInbox(page);
    await openFirstAuthoriseJobItem(page);
    // STEP: CLICK the "Recruiter Details" tab
    await openRecruiterDetailsTab(page);
    // ASSERT (BLOCKING) recruiter details are displayed
    await expect(fieldSelect(page, 'Recruiter')).toBeVisible();
  });

  test('TC-06: Check if Name and Surname of the recruiter are populated', async ({ page }) => {
    await advanceToRecruiterDetailsTab(page);
    // ASSERT (BLOCKING) the Recruiter field is non-empty
    await expect(fieldSelect(page, 'Recruiter')).not.toHaveText('');
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
