// AUTO-RECORDED from test-plans/post-registration/10p-post-registration-submitter.md
// Source: Azure DevOps test plan #101541 (Smoke), suite #101868
// The .md plan is canonical. AI-repair will patch failing lines in this file.
//
// ⛔ BLOCKED: needs a registered NPO AND the signed-in user marked **Authorised** on it.
// Worth checking the Authorised part early — role-scoped accounts are still ours to create.

import { test, expect } from '@playwright/test';
import { loginPublic, typeReal, captureFailedRequests, clickFirstVisible } from '../_helpers';

const BLOCKED = !process.env.DSD_REGISTERED_NPO;

test.describe('NPO-10P — Post Registration: Change Requests (smoke)', () => {
  test.skip(BLOCKED,
    '⛔ Blocked: needs a registered NPO with an Authorised user. Set DSD_REGISTERED_NPO to enable.');

  // ADO Test Case #101762: https://dev.azure.com/boxfusion/Boxfusion%20Test%20Plans/_workitems/edit/101762
  test('TC-01: Authorised user initiates a Change Request (ADO #101762 · TC-10-001)', async ({ page }) => {
    await loginPublic(page);
    // TODO[selector]: open the NPO, then Post Registration → Initiate Change.
    await clickFirstVisible(page, 'a, button', /Post Registration/i);
    await page.waitForTimeout(2000);
    await clickFirstVisible(page, 'button', /Initiate Change/i);
    await page.waitForTimeout(2500);

    // ASSERT (BLOCKING) Step 1 of the Post Registration form opens (FDS Post-Reg Fig.3)
    await expect(page.getByText(/Change Type|Post Registration/i).first()).toBeVisible();
    // ❓ What happens if the user is linked but NOT Authorised — hidden, disabled, or error?
    // That negative case is in neither ADO plan, and it is the authorisation control here.
  });

  // ADO Test Case #101763: https://dev.azure.com/boxfusion/Boxfusion%20Test%20Plans/_workitems/edit/101763
  test('TC-02: Change type selection drives the visible fields (ADO #101763 · TC-10-002)', async ({ page }) => {
    await loginPublic(page);
    // TODO[selector]: reach Step 1 of the change request.

    for (const [type, expected] of [
      ['Founding Document Changes', /Year-?end|Name change|Objective/i],
      ['General Details Changes', /Office Bearer|Organisation/i],
      ['Combination', /Year-?end|Objective/i],
      ['Legal Form Change', /NPC|Trust|VA|Voluntary Association/i],
    ] as const) {
      // TODO[selector]: change-type control.
      await page.getByText(type, { exact: false }).first().click();
      await page.waitForTimeout(1500);
      await expect(page.getByText(expected).first(), `${type} should reveal its field group`).toBeVisible();
    }

    // 📌 ALSO assert the inverse — switching away should HIDE the previous group and CLEAR it.
    // TC-03-032 prescribes exactly that for conditional fields elsewhere in the build, so
    // values surviving a change of type would be a data-integrity finding.
  });

  // ADO Test Case #101767: https://dev.azure.com/boxfusion/Boxfusion%20Test%20Plans/_workitems/edit/101767
  test('TC-03: Step 2 captures old versus new values side by side (ADO #101767 · TC-10-006)', async ({ page }) => {
    await loginPublic(page);
    // TODO[selector]: reach Step 2.

    // ASSERT (BLOCKING) current values are read-only and new-value fields are editable
    // 🔑 Test read-only by attempting an edit.
    // 📌 Cross-check the "current values" against the NPO's actual record — the assessor
    // approves from this side-by-side, so a stale "old" value is a serious finding.
    await expect(page.getByText(/current|old/i).first()).toBeVisible();

    await page.getByRole('button', { name: /^Next$/ }).click();
    await page.waitForTimeout(2500);
  });

  // ADO Test Case #101768: https://dev.azure.com/boxfusion/Boxfusion%20Test%20Plans/_workitems/edit/101768
  test('TC-04: Step 3 attaches documents and submits the declaration (ADO #101768 · TC-10-007)', async ({ page }) => {
    const failures = captureFailedRequests(page);
    await loginPublic(page);
    // TODO[selector]: reach Step 3; capture capacity; upload the required documents.
    // 🔑 AntD Upload — setInputFiles on the VISIBLE control, never the hidden input.

    await page.getByRole('button', { name: /^Submit$/ }).click();
    await page.waitForTimeout(5000);
    if (failures.length) console.log('[TC-04] failed API calls:', JSON.stringify(failures, null, 1));
    expect(failures, `submit returned ${failures.length} failed API call(s)`).toHaveLength(0);

    // ASSERT (BLOCKING) an acknowledgement letter is issued, then assert retrievability
    // separately in admin → All Post Registration (plan NPO-10A TC-01).
    await expect(page.getByText(/acknowledge|submitted|success/i).first()).toBeVisible({ timeout: 30_000 });
  });
});
