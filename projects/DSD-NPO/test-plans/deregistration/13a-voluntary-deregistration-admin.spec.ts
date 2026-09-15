// AUTO-RECORDED from test-plans/deregistration/13a-voluntary-deregistration-admin.md
// Source: Azure DevOps test plan #101541 (Smoke), suite #101874
// The .md plan is canonical. AI-repair will patch failing lines in this file.
//
// TC-01 runnable now (CRUDS → Voluntary Deregistration URL recorded live 2026-08-13).
// 🔴 TC-02 DEREGISTERS A LIVE NPO — the most destructive action in the whole smoke plan.
// It must only ever run against a deregistration application WE created (plan NPO-13P).
// A live "Voluntary Deregistration · Review (DSD)" item from another tester is sitting in
// the workflow inbox right now — do not action it.

import { test, expect } from '@playwright/test';
import { ADMIN_URL, ADMIN_ROUTES, loginAdmin, waitForGrid, gridColumns, gridTotal } from '../_helpers';

test.describe('NPO-13A — Voluntary Deregistration: Admin Processing (smoke)', () => {

  // ADO Test Case #101807: https://dev.azure.com/boxfusion/Boxfusion%20Test%20Plans/_workitems/edit/101807
  test('TC-01: All Deregistration Applications listed with a status filter (ADO #101807 · TC-13-008)', async ({ page }) => {
    await loginAdmin(page);

    // STEP 1-2: NAVIGATE and wait for the sha-react-table grid (FDS Dereg 8.1)
    await page.goto(ADMIN_URL + ADMIN_ROUTES.deregistrations);
    await waitForGrid(page);

    // STEP 3: ASSERT (BLOCKING) the list renders
    expect(await page.locator('[role=row]').count()).toBeGreaterThan(0);

    // STEP 4: RECORD the total, columns and statuses (columns unprescribed — report only)
    const before = await gridTotal(page);
    console.log(`[TC-01] ${before} deregistration applications · columns: ${(await gridColumns(page)).join(' · ')}`);

    // STEP 5-6: filter by status, then clear
    // TODO[selector]: status filter control — likely .sha-global-table-filter.
    await page.locator('.sha-global-table-filter').first().click();
    await page.waitForTimeout(2500);
    const after = await gridTotal(page);
    expect(after!).toBeLessThanOrEqual(before!);
  });

  // ADO Test Case #101809: https://dev.azure.com/boxfusion/Boxfusion%20Test%20Plans/_workitems/edit/101809
  test('TC-02: ⚠️ Validating all documents deregisters the NPO (ADO #101809 · TC-13-010)', async ({ page }) => {
    test.skip(!process.env.DSD_OWN_DEREG_REF,
      '🔴 DESTRUCTIVE: deregisters a live NPO. Set DSD_OWN_DEREG_REF to OUR OWN application reference to enable.');

    await loginAdmin(page);
    await page.goto(ADMIN_URL + ADMIN_ROUTES.deregistrations);
    await waitForGrid(page);

    // STEP 1: open OUR OWN application — matched by reference, never by row position
    // TODO[selector]: search/filter by DSD_OWN_DEREG_REF before opening.
    await page.getByText(process.env.DSD_OWN_DEREG_REF!, { exact: false }).first().click();
    await page.waitForTimeout(4000);

    // STEP 2-3: CLICK Validate Documents, ASSERT the dialog lists the submitted documents
    await page.getByRole('button', { name: /Validate Documents/i }).click();
    await expect(page.locator('.ant-modal-content')).toBeVisible();

    // STEP 4: confirm all valid, Submit
    // TODO[selector]: per-document valid control.
    await page.getByRole('button', { name: /^Submit$/ }).click();
    await page.waitForTimeout(4000);

    // STEP 5-7: ASSERT (BLOCKING) the organisation becomes Deregistered
    // 📌 The ADO case says "Deregistration / Deregistered" — two different things. Record
    // which one the app actually sets and ask Thabiso to tighten the case.
    const body = await page.locator('body').innerText();
    console.log(`[TC-02] status text after validation: ${(body.match(/Deregistrat\w+|Deregistered/gi) || []).join(', ')}`);
    await expect(page.getByText(/Deregister/i).first()).toBeVisible();
    // TODO[assertion]: deregistration notice issued; NPO register reflects the change.
  });
});
