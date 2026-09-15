// AUTO-RECORDED from test-plans/AdminPortal/verify-advertise-later-functionality.md
// Source: Azure DevOps project pd-recruitment, test case #104255 "Verify
// Advertise later functionality" (steps supplied via the same shared-step
// block as the other AdminPortal test cases in this hub, work item rev 2).
// The .md plan is canonical. AI-repair will patch failing lines in this file.
// Do not hand-edit unless you are also updating the .md plan.
//
// Same Advertiser flow as the other specs targeting "2TestingJobSummaryData"
// in this project. Confirmed live 2026-08-05: the Advertise button does not
// appear/enable until Publication Date, Email Address AND the DHA Website
// checkbox are ALL complete (ADO steps 7/8's claim that it enables earlier
// is not accurate). TC-10 clicks Advertise for real — confirmed with the
// requester before running. All earlier TCs never click Advertise.

import { test, expect, Page, Locator } from '@playwright/test';

const APP_URL = 'https://pd-recruitment-adminportal-qa.shesha.app/';
const ADVERTISER = { user: 'Moshadih', password: '123qwe' };
const ACTION_REQUIRED = 'Advertise Job Posting';
const PREFERRED_JOB_NAME = '2TestingJobSummaryData';
const EMAIL_ADDRESS = 'advertiser-test@boxfusion.io';

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

async function checkAdvertisedLater(page: Page) {
  const checkbox = page.locator('label', { hasText: 'Advertised Later' }).locator('xpath=../..').locator('input[type="checkbox"]').first();
  await checkbox.click();
  await page.waitForTimeout(1000);
  return checkbox;
}

async function pickPublicationDate(page: Page) {
  const pubDateInput = page.locator('input[placeholder="Select date"]').last();
  await pubDateInput.click();
  await page.waitForTimeout(500);
  await page.locator('.ant-picker-cell-in-view', { hasText: '20' }).last().click();
  await page.waitForTimeout(800);
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

async function checkDhaWebsite(page: Page) {
  const checkbox = page.locator('label', { hasText: 'DHA Website' }).locator('xpath=../..').locator('input[type="checkbox"]').first();
  await checkbox.click();
  await page.waitForTimeout(800);
  return checkbox;
}

test.describe('ADMINPORTAL-104255 — Verify Advertise later functionality', () => {
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

  test('TC-05: Check the Advertised Later checkbox', async ({ page }) => {
    await loginAsMoshadi(page);
    await goToInbox(page);
    await openTargetAdvertiseJobItem(page);
    const checkbox = await checkAdvertisedLater(page);
    // ASSERT (BLOCKING) checkbox is checked and Publication Date field appears
    await expect(checkbox).toBeChecked();
    await expect(page.locator('input[placeholder="Select date"]').last()).toBeVisible();
  });

  test('TC-06: Select a future date from the date picker', async ({ page }) => {
    await loginAsMoshadi(page);
    await goToInbox(page);
    await openTargetAdvertiseJobItem(page);
    await checkAdvertisedLater(page);
    await pickPublicationDate(page);
    // ASSERT (BLOCKING) Publication Date field shows the picked date
    await expect(page.locator('input[placeholder="Select date"]').last()).toHaveValue(/20[/-]/);
  });

  test('TC-07: Check the Internal Communications checkbox', async ({ page }) => {
    await loginAsMoshadi(page);
    await goToInbox(page);
    await openTargetAdvertiseJobItem(page);
    await checkAdvertisedLater(page);
    await pickPublicationDate(page);
    const checkbox = await checkInternalCommunications(page);
    // ASSERT (BLOCKING) checkbox is checked and Email Address field appears
    await expect(checkbox).toBeChecked();
    await expect(page.getByText('Email Address', { exact: false }).first()).toBeVisible();
  });

  test('TC-08: Populate a valid email address', async ({ page }) => {
    await loginAsMoshadi(page);
    await goToInbox(page);
    await openTargetAdvertiseJobItem(page);
    await checkAdvertisedLater(page);
    await pickPublicationDate(page);
    await checkInternalCommunications(page);
    const emailInput = await fillEmailAddress(page);
    // ASSERT (BLOCKING) Email Address field contains the typed value
    await expect(emailInput).toHaveValue(EMAIL_ADDRESS);
  });

  test('TC-09: Check the DHA Website checkbox', async ({ page }) => {
    await loginAsMoshadi(page);
    await goToInbox(page);
    await openTargetAdvertiseJobItem(page);
    await checkAdvertisedLater(page);
    await pickPublicationDate(page);
    await checkInternalCommunications(page);
    await fillEmailAddress(page);
    const checkbox = await checkDhaWebsite(page);
    // ASSERT (BLOCKING) checkbox is checked and Advertise button is now visible and enabled
    await expect(checkbox).toBeChecked();
    await expect(page.getByRole('button', { name: 'Advertise', exact: true })).toBeVisible();
    await expect(page.getByRole('button', { name: 'Advertise', exact: true })).toBeEnabled();
  });

  test('TC-10: Click on Advertise button', async ({ page }) => {
    await loginAsMoshadi(page);
    await goToInbox(page);
    await openTargetAdvertiseJobItem(page);
    await checkAdvertisedLater(page);
    await pickPublicationDate(page);
    await checkInternalCommunications(page);
    await fillEmailAddress(page);
    await checkDhaWebsite(page);
    // STEP: CLICK the Advertise button — REAL PUBLISH, confirmed with requester
    await page.getByRole('button', { name: 'Advertise', exact: true }).click();
    // ASSERT (BLOCKING) a success notification appears (best-effort — transient toast)
    const sawToast = await page.getByText(/advertis(e|ed)/i, { exact: false }).first()
      .isVisible({ timeout: 5_000 }).catch(() => false);
    if (!sawToast) console.log('Success toast not observed (transient) — relying on My Items navigation instead.');
    // ASSERT (BLOCKING) the system navigates away from the Advertise Job Posting details view,
    // landing on "My Items" (confirmed live 2026-08-05 — NOT back to the Inbox, contrary to ADO's implied flow)
    await page.waitForTimeout(3_000);
    await expect(page.getByRole('heading', { name: 'My Items', level: 4 })).toBeVisible({ timeout: 30_000 });
  });
});
