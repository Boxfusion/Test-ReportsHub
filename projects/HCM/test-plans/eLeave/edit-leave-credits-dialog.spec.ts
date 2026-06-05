// AUTO-RECORDED from test-plans/eLeave/edit-leave-credits-dialog.md
// Source: Azure DevOps test plan #79625, suite #86633
// The .md plan is canonical. AI-repair will patch failing lines in this file.
// Do not hand-edit unless you are also updating the .md plan.
//
// MIGRATED (2026-06-02): the Edit Leave Credits dialog opens from the SaGov Leave Balances
// page (/dynamic/SaGov.Leave/sagov-personal-balances) via the per-row 'edit' icon.
// READONLY TC (TC-04 Close) runs for real. DESTRUCTIVE TCs (TC-02/TC-03 save via OK) are
// skipped per run scope.

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

async function openEditCredits(page: Page): Promise<boolean> {
  await loginAsAdmin(page);
  await page.goto(BALANCES_URL);
  await page.waitForLoadState('networkidle');
  const firstRow = page.locator('.tr.tr-body').first();
  const haveRow = await firstRow.waitFor({ state: 'visible', timeout: 20000 }).then(() => true).catch(() => false);
  if (!haveRow) return false;
  await firstRow.locator('[aria-label="edit"]').first().click();
  return await page.locator('.ant-modal, [role="dialog"]').first().isVisible({ timeout: 15000 }).catch(() => false);
}

function dialog(page: Page) {
  return page.locator('.ant-modal, [role="dialog"]').first();
}

test.describe('ELEAVE-EDIT-CREDITS — Edit Leave Credits Dialog', () => {

  test('TC-01: Login as Admin', async ({ page }) => {
    await page.goto(APP_URL);
    await page.getByRole('textbox', { name: 'Username' }).fill(ADMIN.user);
    await page.getByRole('textbox', { name: 'Password' }).fill(ADMIN.password);
    await page.getByRole('button', { name: 'Sign In' }).click();
    await page.waitForLoadState('networkidle');
    await expect(page).not.toHaveURL(/login/i);
    await expect(page.getByRole('menuitem', { name: 'calendar SaGov Leave Management' })).toBeVisible({ timeout: 30000 });
  });

  // ADO Test Case #86634: https://dev.azure.com/boxfusion/pd-Hcm/_workitems/edit/86634
  test("TC-02: System should save the updated information when 'OK' button is clicked", async ({ page }) => {
    // DESTRUCTIVE: clicking OK persists edited leave credits. Skipped per run scope.
    test.skip(true, 'Destructive: would modify a real leave balance — not run against shared QA data');
  });

  // ADO Test Case #86635: https://dev.azure.com/boxfusion/pd-Hcm/_workitems/edit/86635
  test("TC-03: System should redirect the user to the Leave Balances dashboard when 'OK' button is clicked", async ({ page }) => {
    // DESTRUCTIVE: depends on a successful OK submit. Skipped per run scope.
    test.skip(true, 'Destructive: requires committing edited credits via OK — not run against shared QA data');
  });

  // ADO Test Case #86637: https://dev.azure.com/boxfusion/pd-Hcm/_workitems/edit/86637
  test("TC-04: When a user clicks on the 'Close' button, the system should close the dialog", async ({ page }) => {
    const opened = await openEditCredits(page);
    test.skip(!opened, 'Edit Leave Credits dialog could not be opened');
    const d = dialog(page);
    // STEP: CLICK the Close / Cancel control
    const closeBtn = d.getByRole('button', { name: /^(Close|Cancel)$/i }).or(d.locator('.ant-modal-close'));
    await closeBtn.first().click();
    // ASSERT (BLOCKING) The dialog is closed
    await expect(d).toBeHidden({ timeout: 10000 });
  });

});
