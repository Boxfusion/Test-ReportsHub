// AUTO-RECORDED from test-plans/appeals/11p-appeals-submitter.md
// Source: Azure DevOps test plan #101541 (Smoke), suite #101870
// The .md plan is canonical. AI-repair will patch failing lines in this file.
//
// ⛔ BLOCKED AWKWARDLY: needs an application in status 'Application Unsuccessful'. Producing
// one legitimately means driving a registration through AND having DSD decline it — so this
// stays unreachable long after the address blocker clears.
// ❓ Ask Thabiso whether a pre-denied application can be seeded on QA.

import { test, expect } from '@playwright/test';
import { loginPublic, typeReal, captureFailedRequests, clickFirstVisible } from '../_helpers';

const BLOCKED = !process.env.DSD_DENIED_APPLICATION;

test.describe('NPO-11P — Appeals: NPO Submitter (smoke)', () => {
  test.skip(BLOCKED,
    "⛔ Blocked: needs an application in status 'Application Unsuccessful'. Set DSD_DENIED_APPLICATION to enable.");

  // ADO Test Case #101773: https://dev.azure.com/boxfusion/Boxfusion%20Test%20Plans/_workitems/edit/101773
  test("TC-01: Initiate an appeal of type 'Refusal to Register' (ADO #101773 · TC-11-001)", async ({ page }) => {
    await loginPublic(page);
    // TODO[selector]: open the denied application.
    await clickFirstVisible(page, 'button, a', /Appeal/i);
    await page.waitForTimeout(2500);

    // STEP 3: ASSERT (BLOCKING) the appeal form opens with org details PREFILLED (FDS Appeals 7)
    await expect(page.getByText(/Appeal/i).first()).toBeVisible();
    const orgField = page.locator('.ant-form-item').filter({ hasText: /Organisation/i }).locator('input').first();
    expect(await orgField.inputValue(), 'organisation details should be prefilled').not.toBe('');

    // STEP 4-5: SELECT Nature = 'Refusal to Register'
    // 📌 RECORD every Nature option offered — plan NPO-11A filters by Type = Cancellation, so
    // at least two exist, and neither ADO plan enumerates the list.
    // TODO[selector]: Nature select.

    // ⚠️ If a document upload fails here, check for 500 /api/StoredFile/FilesList and
    // 400 .../DeregistrationAppeal/Crud/Get first — both were seen on the admin appeal form.
  });

  // ADO Test Case #101777: https://dev.azure.com/boxfusion/Boxfusion%20Test%20Plans/_workitems/edit/101777
  test('TC-02: Submit an appeal with the required fields (ADO #101777 · TC-11-005)', async ({ page }) => {
    const failures = captureFailedRequests(page);
    await loginPublic(page);
    // TODO[selector]: nature, mode, office bearer, documents, name/surname/capacity.
    // 📌 RECORD the "mode" options — the case names the field but not its values.

    await page.getByRole('button', { name: /^Submit$/ }).click();
    await page.waitForTimeout(5000);
    if (failures.length) console.log('[TC-02] failed API calls:', JSON.stringify(failures, null, 1));
    expect(failures, `submit returned ${failures.length} failed API call(s)`).toHaveLength(0);

    // ASSERT (BLOCKING) status is exactly 'Initiated' (RefListAppealStatus = 6)
    // 📌 Where the API response is visible, assert the NUMERIC RefList value too — a label
    // that reads right over a wrong underlying value is exactly what this catches.
    await expect(page.getByText('Initiated', { exact: false })).toBeVisible({ timeout: 30_000 });

    // Then assert retrievability in admin → All Appeals (plan NPO-11A TC-01).
    // TODO[assertion]: admin-side retrievability check.
  });
});
