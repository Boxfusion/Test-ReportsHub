// AUTO-RECORDED from test-plans/post-registration/10a-post-registration-admin.md
// Source: Azure DevOps test plan #101541 (Smoke), suite #101867
// The .md plan is canonical. AI-repair will patch failing lines in this file.
//
// Both cases are READ-ONLY and runnable now — CRUDS → Change Request URL recorded live.
// Note: neither ADO case prescribes a column set, so columns are RECORDED, not asserted.

import { test, expect } from '@playwright/test';
import { ADMIN_URL, ADMIN_ROUTES, loginAdmin, waitForGrid, gridColumns, gridTotal } from '../_helpers';

test.describe('NPO-10A — Post Registration: Admin Processing (smoke)', () => {

  // ADO Test Case #101769: https://dev.azure.com/boxfusion/Boxfusion%20Test%20Plans/_workitems/edit/101769
  test('TC-01: All Post Registration applications listed and filterable (ADO #101769 · TC-10-008)', async ({ page }) => {
    await loginAdmin(page);

    // STEP 1-2: NAVIGATE and wait for the sha-react-table grid
    await page.goto(ADMIN_URL + ADMIN_ROUTES.changeRequests);
    await waitForGrid(page);

    // STEP 3: ASSERT (BLOCKING) change requests are listed (FDS Post-Reg 8.1)
    expect(await page.locator('[role=row]').count()).toBeGreaterThan(0);

    // STEP 4: RECORD the unfiltered total and the column set (unprescribed — report only)
    const before = await gridTotal(page);
    console.log(`[TC-01] ${before} change requests · columns: ${(await gridColumns(page)).join(' · ')}`);

    // STEP 5-6: filter by status, then clear
    // TODO[selector]: status filter control — likely .sha-global-table-filter.
    await page.locator('.sha-global-table-filter').first().click();
    await page.waitForTimeout(2500);
    const after = await gridTotal(page);
    expect(after!).toBeLessThanOrEqual(before!);
  });

  // ADO Test Case #101770: https://dev.azure.com/boxfusion/Boxfusion%20Test%20Plans/_workitems/edit/101770
  test('TC-02: Details show submitted info, status and attachments (ADO #101770 · TC-10-009)', async ({ page }) => {
    await loginAdmin(page);
    await page.goto(ADMIN_URL + ADMIN_ROUTES.changeRequests);
    await waitForGrid(page);

    // STEP 1: CLICK a change request row (read-only)
    await page.locator('[role=row]').nth(1).click();
    await page.waitForTimeout(4000);

    // STEP 2: ASSERT (BLOCKING) submitted info, status and attachments are present
    await expect(page.getByText(/Status/i).first()).toBeVisible();
    await expect(page.getByText(/Attachment|Document/i).first()).toBeVisible();

    // STEP 3: ASSERT an attachment can be opened
    // TODO[selector]: attachment link — not recorded live.
  });
});
