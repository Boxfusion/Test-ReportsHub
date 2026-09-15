// AUTO-RECORDED from test-plans/annual-compliance/08-annual-report-submission.md
// Source: Azure DevOps test plan #101541 (Smoke), suite #101865
// The .md plan is canonical. AI-repair will patch failing lines in this file.
//
// ⛔ BLOCKED: needs a REGISTERED NPO linked to the signed-in user.
// 🔑 Linking to an existing NPO (plan NPO-02 TC-02) is the CHEAPER route to unblocking this
// — the register holds 361,068 migrated NPOs, so this suite need not wait for the
// registration fix if linking can be made to work.

import { test, expect } from '@playwright/test';
import { loginPublic, typeReal, selectAntdOption, captureFailedRequests } from '../_helpers';

const BLOCKED = !process.env.DSD_REGISTERED_NPO;

test.describe('NPO-08 — Annual Compliance: Report Submission (smoke)', () => {
  test.skip(BLOCKED,
    '⛔ Blocked: needs a registered NPO linked to the user. Set DSD_REGISTERED_NPO to enable.');

  // ADO Test Case #101739: https://dev.azure.com/boxfusion/Boxfusion%20Test%20Plans/_workitems/edit/101739
  test('TC-01: Step 1 org details auto-populate; tax number and auditor captured (ADO #101739 · TC-08-007)', async ({ page }) => {
    await loginPublic(page);
    // TODO[selector]: open the initiated annual report at Step 1.

    // STEP 2: ASSERT (BLOCKING) org info is visible and READ-ONLY
    // 🔑 Test read-only by attempting an edit, not by reading an attribute.
    const orgField = page.locator('.ant-form-item').filter({ hasText: /Organisation Name/i }).locator('input').first();
    const before = await orgField.inputValue();
    await orgField.click();
    await orgField.pressSequentially('XX', { delay: 20 }).catch(() => {});
    expect(await orgField.inputValue(), 'organisation info must be read-only').toBe(before);

    // STEP 3-5: income tax number, Audited = Yes (a conditional group), auditing firm
    // TODO[selector]: Income Tax Number / Audited radio / Auditing Firm fields.

    // STEP 6-7: Next, ASSERT the data persisted and Step 2 opened
    await page.getByRole('button', { name: /^Next$/ }).click();
    await page.waitForTimeout(2500);
  });

  // ADO Test Case #101741: https://dev.azure.com/boxfusion/Boxfusion%20Test%20Plans/_workitems/edit/101741
  test('TC-02: Step 2 programmes, employees and meetings captured (ADO #101741 · TC-08-009)', async ({ page }) => {
    await loginPublic(page);
    // TODO[selector]: reach Step 2.
    // 📌 Three separate sub-forms in one case — assert each independently so a partial
    // failure is legible in the report.
    // TODO[selector]: Achievement / employee counts + demographics / meeting record.
    await expect(page.getByText(/Achievement|Programme/i).first()).toBeVisible();
  });

  // ADO Test Case #101743: https://dev.azure.com/boxfusion/Boxfusion%20Test%20Plans/_workitems/edit/101743
  test('TC-03: Step 3 OB list visible; user confirms OBs still apply (ADO #101743 · TC-08-011)', async ({ page }) => {
    await loginPublic(page);
    // TODO[selector]: reach Step 3.

    // STEP 1-2: ASSERT the OB list renders and matches the NPO's record
    await expect(page.locator('[role=row]').nth(1)).toBeVisible();

    // STEP 3-4: tick "OBs still apply", ASSERT (BLOCKING) progress is permitted
    // TODO[selector]: the confirmation checkbox.
    // ❓ What happens when the OBs do NOT still apply? Only the affirmative is covered.
  });

  // ADO Test Case #101746: https://dev.azure.com/boxfusion/Boxfusion%20Test%20Plans/_workitems/edit/101746
  test('TC-04: Step 5 finance report threshold and accounting officer (ADO #101746 · TC-08-014)', async ({ page }) => {
    await loginPublic(page);
    // TODO[selector]: reach Step 5.
    // 📌 RECORD the available reporting thresholds — the case does not enumerate them, and
    // the threshold usually drives what financial reporting is required.
    // TODO[selector]: threshold select / accounting officer / funding details.
    await expect(page.getByText(/threshold/i).first()).toBeVisible();
  });

  // ADO Test Case #101749: https://dev.azure.com/boxfusion/Boxfusion%20Test%20Plans/_workitems/edit/101749
  test('TC-05: Step 6 declaration captures chairperson details and submits (ADO #101749 · TC-08-017)', async ({ page }) => {
    const failures = captureFailedRequests(page);
    await loginPublic(page);
    // TODO[selector]: reach Step 6.

    // STEP 1-2: chairperson name + capacity; ASSERT the date auto-populates
    // TODO[selector]: chairperson name / capacity / date.

    // STEP 3-5: Submit, capture the response body, ASSERT (BLOCKING) submission succeeded
    await page.getByRole('button', { name: /^Submit$/ }).click();
    await page.waitForTimeout(5000);
    if (failures.length) console.log('[TC-05] failed API calls:', JSON.stringify(failures, null, 1));
    expect(failures, `submit returned ${failures.length} failed API call(s)`).toHaveLength(0);
    await expect(page.getByText(/submitted|success|acknowledge/i).first()).toBeVisible({ timeout: 30_000 });

    // STEP 6-7: 🔑 assert retrievability separately — a closing form is not proof of a save.
    // Cross-check in admin → CRUDS → Annual Compliance (plan NPO-09 TC-01).
    // TODO[assertion]: admin-side retrievability check.
  });
});
