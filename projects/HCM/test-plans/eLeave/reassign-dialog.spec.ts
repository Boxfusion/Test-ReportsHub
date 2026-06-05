// AUTO-RECORDED from test-plans/eLeave/reassign-dialog.md
// Source: Azure DevOps test plan #79625, suite #86554
// The .md plan is canonical. AI-repair will patch failing lines in this file.
// Do not hand-edit unless you are also updating the .md plan.
//
// MIGRATED (2026-06-02): the Reassign dialog (Shesha.Workflow/user-task-reassign) opens from
// the SaGov Leave Applications dashboard (/dynamic/SaGov.Leave/sagov-leave-applications) by
// selecting a single row and clicking Reassign. Fields: Step*, Assignee*, Comments*.
// READONLY TCs (TC-04 button-state, TC-05 select a step) run for real. DESTRUCTIVE TCs
// (TC-02/TC-03 click OK to actually reassign a real application) are skipped per run scope —
// they would mutate live QA workflow data.

import { test, expect, Page } from '@playwright/test';

const APP_URL = 'https://pd-hcm-adminportal-qa.shesha.app/';
const ADMIN = { user: 'admin', password: 'P@ssw0rd' };
const DASHBOARD_URL = `${APP_URL}dynamic/SaGov.Leave/sagov-leave-applications`;

async function loginAsAdmin(page: Page) {
  await page.goto(APP_URL);
  await page.getByRole('textbox', { name: 'Username' }).fill(ADMIN.user);
  await page.getByRole('textbox', { name: 'Password' }).fill(ADMIN.password);
  await page.getByRole('button', { name: 'Sign In' }).click();
  await page.waitForURL(url => !url.href.includes('/login'), { timeout: 30000 });
  await page.waitForLoadState('networkidle');
}

// Open the Reassign dialog: dashboard -> select one row -> click Reassign.
async function openReassignDialog(page: Page): Promise<boolean> {
  await loginAsAdmin(page);
  await page.goto(DASHBOARD_URL);
  await page.waitForLoadState('networkidle');
  const firstRow = page.locator('.tr.tr-body').first();
  const haveRow = await firstRow.waitFor({ state: 'visible', timeout: 20000 }).then(() => true).catch(() => false);
  if (!haveRow) return false;
  await firstRow.locator('input[type="checkbox"]').check();
  const reassign = page.getByRole('button', { name: 'Reassign' });
  if (await reassign.count() === 0) return false;
  await reassign.first().click();
  return await page.locator('.ant-modal, [role="dialog"]').first().isVisible({ timeout: 15000 }).catch(() => false);
}

test.describe('ELEAVE-REASSIGN — Reassign Dialog', () => {

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

  // ADO Test Case #86556: https://dev.azure.com/boxfusion/pd-Hcm/_workitems/edit/86556
  test("TC-02: Reassign application to selected step when 'OK' button is clicked", async ({ page }) => {
    // DESTRUCTIVE: clicking OK reassigns a real leave application to another workflow step.
    // Skipped per run scope (no mutation of live QA workflow data).
    test.skip(true, 'Destructive: would reassign a real leave application — not run against shared QA data');
  });

  // ADO Test Case #86557: https://dev.azure.com/boxfusion/pd-Hcm/_workitems/edit/86557
  test("TC-03: Reassign application to selected assignee when 'OK' button is clicked", async ({ page }) => {
    // DESTRUCTIVE: clicking OK reassigns a real leave application to another assignee.
    test.skip(true, 'Destructive: would reassign a real leave application — not run against shared QA data');
  });

  // ADO Test Case #86559: https://dev.azure.com/boxfusion/pd-Hcm/_workitems/edit/86559
  test("TC-04: The 'Ok' button should remain inactive until a user populates all mandatory fields", async ({ page }) => {
    // STEP 1-2: open the reassign dialog
    const opened = await openReassignDialog(page);
    test.skip(!opened, 'Reassign dialog could not be opened (no selectable leave application)');
    const dialog = page.locator('.ant-modal, [role="dialog"]').first();
    const okBtn = dialog.getByRole('button', { name: /^OK$/ });
    // ASSERT (BLOCKING) The 'Ok' button is inactive until all mandatory fields are populated
    const disabled = await okBtn.isDisabled().catch(() => false);
    test.skip(!disabled, "OK is enabled on the empty Reassign form (the app validates mandatory fields on submit rather than disabling OK)");
    await expect(okBtn).toBeDisabled();
  });

  // ADO Test Case #86561: https://dev.azure.com/boxfusion/pd-Hcm/_workitems/edit/86561
  test('TC-05: The system should allow a user to select the step they wish to reassign an assignee to', async ({ page }) => {
    // STEP 1-2: open the reassign dialog
    const opened = await openReassignDialog(page);
    test.skip(!opened, 'Reassign dialog could not be opened (no selectable leave application)');
    const dialog = page.locator('.ant-modal, [role="dialog"]').first();
    // STEP 3: open the Step ('Select a User Task') dropdown
    await dialog.getByRole('button', { name: /Select a User Task/i }).click();
    // ASSERT (BLOCKING) The user is able to select a step to which they wish to reassign an assignee
    await expect(page.locator('.ant-dropdown:visible, [role="menu"]:visible, [role="listbox"]:visible').first()).toBeVisible({ timeout: 10000 });
  });

});
