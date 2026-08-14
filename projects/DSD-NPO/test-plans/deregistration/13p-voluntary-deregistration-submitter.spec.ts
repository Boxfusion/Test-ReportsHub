// AUTO-RECORDED from test-plans/deregistration/13p-voluntary-deregistration-submitter.md
// Source: Azure DevOps test plan #101541 (Smoke), suite #101875
// The .md plan is canonical. AI-repair will patch failing lines in this file.
//
// ⛔ BLOCKED: needs a registered NPO with a known annual-compliance status.
//
// 🔴 TC-01 IS EXPECTED TO FAIL — and it is the most valuable case in the suite.
// Thabiso's own ADO drift note: "Code: NO outstanding-report block enforced at VD
// initiation. Expect to FAIL." An NPO that owes annual reports being able to walk away is a
// compliance-enforcement gap, not a UI defect. Run it first; report the result either way.

import { test, expect } from '@playwright/test';
import { loginPublic, typeReal, captureFailedRequests, clickFirstVisible } from '../_helpers';

const BLOCKED = !process.env.DSD_REGISTERED_NPO;

test.describe('NPO-13P — Voluntary Deregistration: Submitter Portal (smoke)', () => {
  test.skip(BLOCKED,
    '⛔ Blocked: needs a registered NPO. Set DSD_REGISTERED_NPO to enable.');

  // ADO Test Case #101800: https://dev.azure.com/boxfusion/Boxfusion%20Test%20Plans/_workitems/edit/101800
  test('TC-01: 🔴 Deregistration is blocked while annual reports are outstanding (ADO #101800 · TC-13-001)', async ({ page }) => {
    test.skip(!process.env.DSD_NONCOMPLIANT_NPO,
      'Needs an NPO with outstanding annual reports >= 6 months — ask Thabiso which QA record qualifies.');

    await loginPublic(page);
    // TODO[selector]: sign in as a user of the non-compliant NPO and attempt to initiate VD.
    await clickFirstVisible(page, 'a, button', /Voluntary Deregistration|Deregister/i);
    await page.waitForTimeout(3000);

    // ASSERT (BLOCKING) a block screen naming the outstanding annual reports (FDS Dereg 7 rule 1)
    // 🔴 If the flow PROCEEDS instead, that confirms the code-review finding: the control is
    // specified in the FDS but not implemented. Log it citing this case, with the NPO's
    // outstanding-report state as evidence.
    await expect(page.getByText(/outstanding|annual report/i).first(),
      'ADO #101800: a block screen must instruct the user to submit outstanding annual reports first')
      .toBeVisible({ timeout: 20_000 });
  });

  // ADO Test Case #101801: https://dev.azure.com/boxfusion/Boxfusion%20Test%20Plans/_workitems/edit/101801
  test('TC-02: A compliant NPO can initiate; details pre-populate (ADO #101801 · TC-13-002)', async ({ page }) => {
    await loginPublic(page);
    // TODO[selector]: initiate Voluntary Deregistration on a Compliant NPO.
    // 📌 Run TC-01 and TC-02 against DIFFERENT NPOs in the same session — they are a paired
    // control (compliant proceeds, non-compliant is blocked) and the comparison must be clean.
    await clickFirstVisible(page, 'a, button', /Voluntary Deregistration|Deregister/i);
    await page.waitForTimeout(3000);

    // ASSERT (BLOCKING) Step 1 opens with NPO name and number pre-populated
    await expect(page.getByText(/Deregistration Details/i).first()).toBeVisible({ timeout: 20_000 });
    const body = await page.locator('body').innerText();
    expect(body, 'the NPO number should be pre-populated').toMatch(/\d{3}-\d{3}-NPO/);
  });

  // ADO Test Case #101804: https://dev.azure.com/boxfusion/Boxfusion%20Test%20Plans/_workitems/edit/101804
  test('TC-03: Step 2 receiving NPO can be searched and selected (ADO #101804 · TC-13-005)', async ({ page }) => {
    await loginPublic(page);
    // TODO[selector]: reach Step 2 (Asset Transfer).

    // 🔑 THIS IS A SERVER-FILTERED SEARCH, NOT A RENDERED LIST. Never conclude anything from
    // what the picker shows before you have typed — that misreading has cost findings on
    // other projects in this hub. Type a known NPO name/number and assert on the result.
    const search = page.locator('input[type=text]').first();
    const term = process.env.DSD_RECEIVING_NPO || 'Foundation';
    const got = await typeReal(search, term);
    expect(got).toBe(term);
    await page.waitForTimeout(3000);

    // ASSERT (BLOCKING) selecting a result displays the receiving NPO's details (FDS Dereg 7.1.2)
    // TODO[selector]: result row + details panel.
    // ❓ Can assets transfer to an NPO that is itself deregistered or non-compliant? The case
    // does not constrain the receiving organisation at all.
  });

  // ADO Test Case #101806: https://dev.azure.com/boxfusion/Boxfusion%20Test%20Plans/_workitems/edit/101806
  test('TC-04: Step 3 required documents attached and declaration submitted (ADO #101806 · TC-13-007)', async ({ page }) => {
    const failures = captureFailedRequests(page);
    await loginPublic(page);
    // TODO[selector]: reach Step 3; name/surname/capacity; attach dissolution documents.
    // 🔑 AntD Upload — setInputFiles on the VISIBLE control.
    // 📌 RECORD which documents are actually required — the case does not list them.

    await page.getByRole('button', { name: /^Submit$/ }).click();
    await page.waitForTimeout(5000);
    if (failures.length) console.log('[TC-04] failed API calls:', JSON.stringify(failures, null, 1));
    expect(failures, `submit returned ${failures.length} failed API call(s)`).toHaveLength(0);

    // ASSERT (BLOCKING) submission succeeds and an acknowledgement letter is issued
    await expect(page.getByText(/acknowledge|submitted|success/i).first()).toBeVisible({ timeout: 30_000 });
    // Then assert retrievability in admin → All Deregistration Applications (plan NPO-13A TC-01).
  });
});
