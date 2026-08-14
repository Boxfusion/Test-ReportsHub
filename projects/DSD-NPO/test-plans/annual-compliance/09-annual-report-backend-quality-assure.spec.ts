// AUTO-RECORDED from test-plans/annual-compliance/09-annual-report-backend-quality-assure.md
// Source: Azure DevOps test plan #101541 (Smoke), suite #101866
// The .md plan is canonical. AI-repair will patch failing lines in this file.
//
// TC-01 runnable now (CRUDS → Annual Compliance URL recorded live 2026-08-13).
// TC-03 is a state-changing decision — OUR OWN report only.

import { test, expect } from '@playwright/test';
import { ADMIN_URL, ADMIN_ROUTES, loginAdmin, waitForGrid, gridColumns, gridTotal } from '../_helpers';

test.describe('NPO-09 — Annual Compliance: Backend & Quality Assure (smoke)', () => {

  // ADO Test Case #101756: https://dev.azure.com/boxfusion/Boxfusion%20Test%20Plans/_workitems/edit/101756
  test('TC-01: All Annual Reports lists submissions with filterable status (ADO #101756 · TC-09-001)', async ({ page }) => {
    await loginAdmin(page);

    // STEP 1-2: NAVIGATE and wait for the sha-react-table grid
    await page.goto(ADMIN_URL + ADMIN_ROUTES.annualCompliance);
    await waitForGrid(page);

    const columns = await gridColumns(page);
    const before = await gridTotal(page);
    console.log(`[TC-01] ${before} annual reports · columns: ${columns.join(' · ')}`);

    // STEP 3: ASSERT (BLOCKING) the five prescribed columns are present (FDS Annual 8.1)
    expect(await page.locator('[role=row]').count()).toBeGreaterThan(0);
    const has = (re: RegExp) => columns.some(c => re.test(c));
    expect(has(/NPO Name|Organisation/i), 'NPO Name column').toBeTruthy();
    expect(has(/Year/i), 'Year column').toBeTruthy();
    expect(has(/Submission Date|Date/i), 'Submission Date column').toBeTruthy();
    expect(has(/Status/i), 'Status column').toBeTruthy();
    expect(has(/Risk/i), 'Risk column').toBeTruthy();

    // STEP 4-5: filter, then clear
    // TODO[selector]: status filter control — likely .sha-global-table-filter.
    await page.locator('.sha-global-table-filter').first().click();
    await page.waitForTimeout(2500);
    const after = await gridTotal(page);
    expect(after!).toBeLessThanOrEqual(before!);
  });

  // ADO Test Case #101757: https://dev.azure.com/boxfusion/Boxfusion%20Test%20Plans/_workitems/edit/101757
  test('TC-02: Report details show captured data and statuses (ADO #101757 · TC-09-002)', async ({ page }) => {
    await loginAdmin(page);
    await page.goto(ADMIN_URL + ADMIN_ROUTES.annualCompliance);
    await waitForGrid(page);

    // STEP 1: CLICK a report row (read-only)
    await page.locator('[role=row]').nth(1).click();
    await page.waitForTimeout(4000);

    // STEP 2: ASSERT (BLOCKING) the five prescribed sections (FDS Annual 8.2)
    for (const section of [/Organisation|Org Details/i, /Financ/i, /Office Bearer/i, /Status/i, /Risk/i]) {
      await expect(page.getByText(section).first(), `details section ${section}`).toBeVisible();
    }
  });

  // ADO Test Case #101758: https://dev.azure.com/boxfusion/Boxfusion%20Test%20Plans/_workitems/edit/101758
  test('TC-03: Quality Assure confirms correctness or captures non-alignment (ADO #101758 · TC-09-003)', async ({ page }) => {
    await loginAdmin(page);
    // TODO[selector]: open OUR OWN report. ⛔ Blocked on plan NPO-08.
    // ⚠️ ADO drift note: no dedicated Quality Assure endpoint exists; status transitions run
    // through AcsStatusUpdateAndNotificationServiceTask. The dialog may not exist as described.

    // STEP 2-3: CLICK Quality Assure, ASSERT (BLOCKING) the dialog opens (FDS Annual 8.3)
    await page.getByRole('button', { name: /Quality Assure/i }).click();
    await expect(page.locator('.ant-modal-content')).toBeVisible();

    // STEP 4: RECORD the options offered — the case names only "Aligned"
    console.log('[TC-03] Quality Assure options:', await page.locator('.ant-modal-content').innerText());

    // STEP 5-7: select Aligned, Submit, ASSERT the compliance letter and Compliant status
    await page.getByText('Aligned', { exact: false }).first().click();
    await page.getByRole('button', { name: /^Submit$/ }).click();
    await page.waitForTimeout(3000);
    await expect(page.getByText('Compliant', { exact: false })).toBeVisible();
    // TODO[assertion]: compliance letter issued to the organisation.
  });
});
