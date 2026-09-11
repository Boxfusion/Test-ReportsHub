// AUTO-RECORDED from test-plans/AdminPortal/verify-internal-communications-functionality.md
// Source: Azure DevOps project pd-recruitment, test case #104257 "Verify
// Internal communications functionality" (steps supplied via the same
// shared-step block as the other AdminPortal test cases in this hub, work
// item rev 3). The .md plan is canonical. AI-repair will patch failing
// lines in this file. Do not hand-edit unless you are also updating the
// .md plan.
//
// Same Advertiser flow as the other specs in this project, but targets a
// specific job posting via TARGET_REF_NO, per explicit user instruction
// (run 1: Ref No "40" "Auto Job Post"; run 2: Ref No "41" "Auto Job
// Posting 1"). Only the Internal Communications checkbox is checked —
// DHA Website is intentionally left unchecked per explicit user
// instruction. Confirmed live for #104255 (same Advertise panel): clicking
// Advertise navigates to "My Items", not back to the Inbox. TC-07 clicks
// Advertise for real — confirmed with the requester before running. All
// earlier TCs never click Advertise.

import { test, expect, Page, Locator } from '@playwright/test';

const APP_URL = 'https://pd-recruitment-adminportal-qa.shesha.app/';
const ADVERTISER = { user: 'Moshadih', password: '123qwe' };
const ACTION_REQUIRED = 'Advertise Job Posting';
const TARGET_REF_NO = '41';
const EMAIL_ADDRESS = 'Reuben.mashifane@boxfusion.io';

async function targetRef40Row(page: Page): Promise<Locator> {
  return page.locator('div[role="row"]')
    .filter({ hasText: ACTION_REQUIRED })
    .filter({ has: page.getByText(TARGET_REF_NO, { exact: true }) })
    .first();
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

async function openTargetRef40Item(page: Page) {
  const row = await targetRef40Row(page);
  await row.locator('a.sha-link').first().click();
  await page.waitForLoadState('networkidle').catch(() => {});
  await page.waitForTimeout(2000);
}

async function checkInternalCommunications(page: Page) {
  const checkbox = page.locator('label', { hasText: 'Internal Communications' }).locator('xpath=../..').locator('input[type="checkbox"]').first();
  await checkbox.click();
  await page.waitForTimeout(800);
  return checkbox;
}

async function fillEmailAddress(page: Page) {
  const emailInput = page.locator('label', { hasText: 'Email Address' }).locator('xpath=../..').locator('input[type="text"], input:not([type])').first();
  await emailInput.fill(EMAIL_ADDRESS);
  await page.waitForTimeout(600);
  return emailInput;
}

test.describe('ADMINPORTAL-104257 — Verify Internal communications functionality', () => {
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

  test(`TC-04: Open Job Ref No ${TARGET_REF_NO} with Advertise Job Posting as action required`, async ({ page }) => {
    await loginAsMoshadi(page);
    await goToInbox(page);
    await expect(await targetRef40Row(page)).toBeVisible();
    await openTargetRef40Item(page);
    // ASSERT (BLOCKING) Close and View in PDF buttons are displayed
    await expect(page.getByRole('button', { name: 'Close' })).toBeVisible();
    await expect(page.getByRole('button', { name: 'View in PDF' })).toBeVisible();
  });

  test('TC-05: Check the Internal Communications checkbox', async ({ page }) => {
    await loginAsMoshadi(page);
    await goToInbox(page);
    await openTargetRef40Item(page);
    const checkbox = await checkInternalCommunications(page);
    // ASSERT (BLOCKING) checkbox is checked and Email Address field appears
    await expect(checkbox).toBeChecked();
    await expect(page.getByText('Email Address', { exact: false }).first()).toBeVisible();
  });

  test('TC-06: Populate a valid email address', async ({ page }) => {
    await loginAsMoshadi(page);
    await goToInbox(page);
    await openTargetRef40Item(page);
    await checkInternalCommunications(page);
    const emailInput = await fillEmailAddress(page);
    // ASSERT (BLOCKING) Email Address field contains the typed value
    await expect(emailInput).toHaveValue(EMAIL_ADDRESS);
    // ASSERT (BLOCKING) Advertise button is now visible and enabled
    await expect(page.getByRole('button', { name: 'Advertise', exact: true })).toBeVisible();
    await expect(page.getByRole('button', { name: 'Advertise', exact: true })).toBeEnabled();
  });

  test('TC-07: Click on Advertise button', async ({ page }) => {
    await loginAsMoshadi(page);
    await goToInbox(page);
    await openTargetRef40Item(page);
    await checkInternalCommunications(page);
    await fillEmailAddress(page);
    // STEP: CLICK the Advertise button — REAL PUBLISH, confirmed with requester
    await page.getByRole('button', { name: 'Advertise', exact: true }).click();
    await page.waitForTimeout(3_000);
    // ASSERT (BLOCKING) the system navigates away from the Advertise Job Posting details view,
    // landing on "My Items" (confirmed live for #104255 — NOT back to the Inbox)
    await expect(page.getByRole('heading', { name: 'My Items', level: 4 })).toBeVisible({ timeout: 30_000 });
  });
});
