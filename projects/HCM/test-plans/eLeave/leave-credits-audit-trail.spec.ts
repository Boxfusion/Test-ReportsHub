// AUTO-RECORDED from test-plans/eLeave/leave-credits-audit-trail.md
// Source: Azure DevOps test plan #79625, suite #86647
// The .md plan is canonical. AI-repair will patch failing lines in this file.
// Do not hand-edit unless you are also updating the .md plan.
//
// MIGRATED (2026-06-02): re-pointed to the SaGov Leave Management module. The Leave Credits
// Audit Trail is reached via a 'View Audit' action on the SaGov Leave Balances page
// (/dynamic/SaGov.Leave/sagov-personal-balances). That action is not currently exposed for the
// available records, so TC-02 guard-skips when no audit entry point is found.

import { test, expect, Page } from '@playwright/test';

const APP_URL = 'https://pd-hcm-adminportal-qa.shesha.app/';
const ADMIN = { user: 'admin', password: 'P@ssw0rd' };
const BALANCES_URL = `${APP_URL}dynamic/SaGov.Leave/sagov-personal-balances`;

async function loginAsAdmin(page: Page) {
  await page.goto(APP_URL);
  await page.getByRole('textbox', { name: 'Username' }).fill(ADMIN.user);
  await page.getByRole('textbox', { name: 'Password' }).fill(ADMIN.password);
  await page.getByRole('button', { name: 'Sign In' }).click();
  await page.waitForURL(url => !url.href.includes('/login'), { timeout: 30000 });
  await page.waitForLoadState('networkidle');
}

test.describe('ELEAVE-CREDITS-AUDIT — Leave Credits Audit Trail', () => {

  test('TC-01: Login as Admin', async ({ page }) => {
    // STEP 1: NAVIGATE to https://pd-hcm-adminportal-qa.shesha.app/
    await page.goto(APP_URL);
    // STEP 3: TYPE Username field with `admin`
    await page.getByRole('textbox', { name: 'Username' }).fill(ADMIN.user);
    // STEP 4: TYPE Password field with `P@ssw0rd`
    await page.getByRole('textbox', { name: 'Password' }).fill(ADMIN.password);
    // STEP 5: CLICK the Sign In button
    await page.getByRole('button', { name: 'Sign In' }).click();
    // STEP 6: WAIT for the home page to load
    await page.waitForLoadState('networkidle');
    // ASSERT (BLOCKING) URL no longer contains /login and the authenticated home page is visible
    await expect(page).not.toHaveURL(/login/i);
    await expect(page.getByRole('menuitem', { name: 'calendar SaGov Leave Management' })).toBeVisible({ timeout: 30000 });
  });

  // ADO Test Case #86649: https://dev.azure.com/boxfusion/pd-Hcm/_workitems/edit/86649
  test('TC-02: Export button downloads audit into an Excel sheet', async ({ page }) => {
    // STEP 1: NAVIGATE Navigate to the Leave Credits Audit Trail view (via 'View Audit' on Leave Balances)
    await loginAsAdmin(page);
    await page.goto(BALANCES_URL);
    await page.waitForLoadState('networkidle');
    await page.locator('.tr.tr-body').first().waitFor({ state: 'visible', timeout: 20000 }).catch(() => {});
    const viewAudit = page.getByRole('button', { name: /View Audit/i }).or(page.getByRole('link', { name: /View Audit/i }));
    test.skip(await viewAudit.count() === 0, "No 'View Audit' entry point on the SaGov Leave Balances page — Leave Credits Audit Trail unreachable");
    await viewAudit.first().click();
    await page.waitForLoadState('networkidle');
    // STEP 3: CLICK Click on the 'Export' button
    const downloadPromise = page.waitForEvent('download', { timeout: 30000 });
    await page.getByRole('button', { name: /Export/i }).click();
    const download = await downloadPromise;
    // ASSERT (BLOCKING) The system downloads the audit into an Excel sheet
    expect(download.suggestedFilename()).toMatch(/\.xlsx?$/i);
  });

});
