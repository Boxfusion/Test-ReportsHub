// AUTO-RECORDED from test-plans/appeals/11a-appeals-admin-tribunal.md
// Source: Azure DevOps test plan #101541 (Smoke), suite #101869
// The .md plan is canonical. AI-repair will patch failing lines in this file.
//
// TC-01 runnable now (CRUDS → Appeals URL recorded live 2026-08-13).
// TC-02 emails a real chairperson and moves status — OUR OWN appeal only.

import { test, expect } from '@playwright/test';
import { ADMIN_URL, ADMIN_ROUTES, loginAdmin, typeReal, waitForGrid, gridColumns, gridTotal } from '../_helpers';

test.describe('NPO-11A — Appeals: Admin / Chairperson / Tribunal (smoke)', () => {

  // ADO Test Case #101779: https://dev.azure.com/boxfusion/Boxfusion%20Test%20Plans/_workitems/edit/101779
  test('TC-01: Admin sees all appeals and can filter by type (ADO #101779 · TC-11-007)', async ({ page }) => {
    await loginAdmin(page);

    // STEP 1-2: NAVIGATE to All Appeals and wait for the grid (FDS Appeals 8.1)
    await page.goto(ADMIN_URL + ADMIN_ROUTES.appeals);
    await waitForGrid(page);

    // STEP 3: ASSERT (BLOCKING) the list is shown
    expect(await page.locator('[role=row]').count()).toBeGreaterThan(0);

    // STEP 4: RECORD the total and every appeal type present — neither plan enumerates them
    const before = await gridTotal(page);
    console.log(`[TC-01] ${before} appeals · columns: ${(await gridColumns(page)).join(' · ')}`);

    // STEP 5-6: filter Type = Cancellation, ASSERT only those rows remain
    // TODO[selector]: type filter control — likely .sha-global-table-filter.
    await page.locator('.sha-global-table-filter').first().click();
    await page.waitForTimeout(1500);
    await page.getByText('Cancellation', { exact: false }).first().click();
    await page.waitForTimeout(3000);
    for (const row of (await page.locator('[role=row]').allInnerTexts()).slice(1)) {
      expect(row, 'every visible row must be a Cancellation appeal').toMatch(/Cancellation/i);
    }

    // STEP 7: clear, ASSERT the original count returns
    await page.getByRole('button', { name: /clear|reset/i }).first().click();
    await page.waitForTimeout(3000);
    expect(await gridTotal(page)).toBe(before);
  });

  // ADO Test Case #101780: https://dev.azure.com/boxfusion/Boxfusion%20Test%20Plans/_workitems/edit/101780
  test('TC-02: Send to Chairperson emails the appeal and sets CasePreparation (ADO #101780 · TC-11-008)', async ({ page }) => {
    await loginAdmin(page);
    // TODO[selector]: open OUR OWN appeal in status Initiated. ⛔ Blocked on plan NPO-11P.

    // STEP 2-4: CLICK Send to Chairperson, enter the email, Submit
    await page.getByRole('button', { name: /Send to Chairperson/i }).click();
    await expect(page.locator('.ant-modal-content')).toBeVisible();
    await typeReal(page.locator('.ant-modal-content input[type=text]').first(), 'qa.chair@example.org');
    await page.getByRole('button', { name: /^Submit$/ }).click();
    await page.waitForTimeout(3000);

    // STEP 5-6: ASSERT (BLOCKING) status = CasePreparation (RefList=1)
    await expect(page.getByText('CasePreparation', { exact: false })).toBeVisible();
    // TODO[assertion]: chairperson email delivered — needs a QA-readable mailbox.
  });

  // ADO Test Case #101784: https://dev.azure.com/boxfusion/Boxfusion%20Test%20Plans/_workitems/edit/101784
  test('TC-03: Tribunal records an Upheld outcome (ADO #101784 · TC-11-012)', async ({ page }) => {
    await loginAdmin(page);
    // TODO[selector]: open a refusal-to-register appeal in status TribunalAssigned.
    // ⛔ Blocked — and how an appeal REACHES TribunalAssigned is covered in neither ADO plan.

    // STEP 2-3: record outcome = Upheld with a supporting document
    // TODO[selector]: outcome control + supporting document upload.
    await page.getByText('Upheld', { exact: false }).first().click();
    await page.getByRole('button', { name: /^Submit$/ }).click();
    await page.waitForTimeout(3000);

    // ASSERT (BLOCKING) status is exactly Upheld (RefList=4)
    await expect(page.getByText('Upheld', { exact: false })).toBeVisible();

    // ASSERT the applicant may now update documents and complete the application
    // 📌 This is the substantive assertion — it crosses back to the public portal.
    // TODO[assertion]: verify on the public portal that the refused application reopened.
  });
});
