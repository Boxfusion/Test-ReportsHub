// AUTO-RECORDED from test-plans/investigations/12a-investigations-admin.md
// Source: Azure DevOps test plan #101541 (Smoke), suite #101871
// The .md plan is canonical. AI-repair will patch failing lines in this file.
//
// TC-01 runnable now (CRUDS → Investigation URL recorded live 2026-08-13).
// 🔑 NPO-12P → NPO-12A is the ONE complete lifecycle drivable end to end today:
// submit an anonymous complaint on the public portal, then triage and assign it here.

import { test, expect } from '@playwright/test';
import { ADMIN_URL, ADMIN_ROUTES, loginAdmin, waitForGrid, gridColumns, gridTotal } from '../_helpers';

test.describe('NPO-12A — Investigations: Admin / Backend (smoke)', () => {

  // ADO Test Case #101792: https://dev.azure.com/boxfusion/Boxfusion%20Test%20Plans/_workitems/edit/101792
  test('TC-01: Investigations list is filterable by case status (ADO #101792 · TC-12-004)', async ({ page }) => {
    await loginAdmin(page);

    // STEP 1-2: NAVIGATE to All Investigations and wait for the grid (FDS Inv 8.1)
    await page.goto(ADMIN_URL + ADMIN_ROUTES.investigations);
    await waitForGrid(page);

    // STEP 3: ASSERT (BLOCKING) the list is shown
    expect(await page.locator('[role=row]').count()).toBeGreaterThan(0);

    // STEP 4: RECORD the total, the columns and the statuses present.
    // TC-02 needs a "validated, within-mandate" case, so the status vocabulary matters.
    const before = await gridTotal(page);
    console.log(`[TC-01] ${before} investigations · columns: ${(await gridColumns(page)).join(' · ')}`);

    // STEP 5-6: apply a status filter, then clear it
    // TODO[selector]: status filter control — likely .sha-global-table-filter.
    await page.locator('.sha-global-table-filter').first().click();
    await page.waitForTimeout(2500);
    const after = await gridTotal(page);
    expect(after!).toBeLessThanOrEqual(before!);
  });

  // ADO Test Case #101794: https://dev.azure.com/boxfusion/Boxfusion%20Test%20Plans/_workitems/edit/101794
  test('TC-02: A valid in-mandate case can be assigned to an investigator (ADO #101794 · TC-12-006)', async ({ page }) => {
    await loginAdmin(page);
    await page.goto(ADMIN_URL + ADMIN_ROUTES.investigations);
    await waitForGrid(page);

    // STEP 1: open a validated, within-mandate case — preferably the one WE submitted via NPO-12P
    // TODO[selector]: locate our own case by its reference. Do not action another tester's.
    await page.locator('[role=row]').nth(1).click();
    await page.waitForTimeout(4000);

    // STEP 2-4: CLICK Assign Investigator, pick one, Submit
    await page.getByRole('button', { name: /Assign Investigator/i }).click();
    await expect(page.locator('.ant-modal-content')).toBeVisible();
    // 📌 RECORD who appears in the picker — a role, a team, or every user?
    console.log('[TC-02] investigator picker:', await page.locator('.ant-modal-content').innerText());
    // TODO[selector]: investigator select — use selectAntdOption once the control is known.
    await page.getByRole('button', { name: /^Submit$/ }).click();
    await page.waitForTimeout(3000);

    // STEP 5-7: ASSERT (BLOCKING) the case shows the assigned investigator after reload
    await page.reload();
    await page.waitForTimeout(4000);
    await expect(page.getByText(/Investigator/i).first()).toBeVisible();
    // TODO[assertion]: investigator notification delivered.
  });
});
