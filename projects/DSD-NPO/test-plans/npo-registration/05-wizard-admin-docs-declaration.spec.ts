// AUTO-RECORDED from test-plans/npo-registration/05-wizard-admin-docs-declaration.md
// Source: Azure DevOps test plan #101541 (Smoke), suite #101862
// The .md plan is canonical. AI-repair will patch failing lines in this file.
//
// ✅ UNBLOCKED 2026-08-13 — the address defect does NOT block the wizard (retracted).
// 🔑 TC-05 (Submit) is the GATEWAY for suites 06 → 13 and is now the top priority in the project:
// driving ONE application through to Submit unblocks most of the remaining smoke coverage.

import { test, expect } from '@playwright/test';
import { loginPublic, typeReal, selectAntdOption, captureFailedRequests } from '../_helpers';

const BLOCKED = !process.env.DSD_REGISTRATION_UNBLOCKED;

test.describe('NPO-05 — Application Wizard, Tabs 5–8 (smoke)', () => {
  test.skip(BLOCKED, 'Selectors not yet recorded — set DSD_REGISTRATION_UNBLOCKED=1 to run and let AI-repair resolve them.');

  // ADO Test Case #101678: https://dev.azure.com/boxfusion/Boxfusion%20Test%20Plans/_workitems/edit/101678
  test('TC-01: Admin/Operations selections persist across Next/Back (ADO #101678 · TC-05-002)', async ({ page }) => {
    await loginPublic(page);
    // TODO[selector]: reach the Admin & Operations tab.

    // STEP 2: SELECT 3 operations — record WHICH, so the assertion checks identity not count
    // TODO[selector]: operations multi-select.
    const chosen: string[] = [];

    // STEP 3-4: Next then Back, ASSERT (BLOCKING) the same 3 are still ticked
    await page.getByRole('button', { name: /^Next$/ }).click();
    await page.waitForTimeout(2000);
    await page.getByRole('button', { name: /^Back$/ }).click();
    await page.waitForTimeout(2000);
    for (const item of chosen) {
      await expect(page.getByText(item, { exact: false })).toBeVisible();
    }
  });

  // ADO Test Case #101682: https://dev.azure.com/boxfusion/Boxfusion%20Test%20Plans/_workitems/edit/101682
  test('TC-02: Required documents vary by organisation type (ADO #101682 · TC-05-006)', async ({ page }) => {
    // ⚠️ Needs THREE drafts, one per Legal Form. Resume drafts rather than creating fresh ones.
    // ❓ The case says "e.g." for the NPC set, so a strict assertion is unsafe until Thabiso
    // confirms the authoritative document list per type.
    await loginPublic(page);
    // TODO[selector]: reach Documents on an NPC draft, then a VA draft, then a Trust draft.
    for (const [form, expected] of [
      ['NPC', /MOI|Constitution/i],
      ['VA', /Constitution|Founding statement/i],
      ['Trust', /Letter of Authority|IT Reg/i],
    ] as const) {
      console.log(`[TC-02] checking required documents for ${form}`);
      await expect(page.getByText(expected).first()).toBeVisible();
    }
  });

  // ADO Test Case #101683: https://dev.azure.com/boxfusion/Boxfusion%20Test%20Plans/_workitems/edit/101683
  test('TC-03: Upload a PDF under 10 MB succeeds (ADO #101683 · TC-05-007)', async ({ page }) => {
    await loginPublic(page);
    // TODO[selector]: reach the Documents tab.

    // 🔑 AntD Upload: injecting into the HIDDEN file input does NOT bind and produces a false
    // "required" failure. Use setInputFiles on the VISIBLE control, or a real click.
    // TODO[selector]: Constitution slot upload control.
    // await page.locator('.ant-upload input[type=file]').setInputFiles('test-data/sample-2mb.pdf');
    await page.waitForTimeout(5000);

    // STEP 3-5: ASSERT (BLOCKING) upload succeeds, name+size shown, download/remove offered
    await expect(page.locator('.ant-upload-list-item')).toBeVisible({ timeout: 30_000 });
    // ⚠️ If this fails, check for 500 /api/StoredFile/FilesList before blaming the wizard.
  });

  // ADO Test Case #101689: https://dev.azure.com/boxfusion/Boxfusion%20Test%20Plans/_workitems/edit/101689
  test('TC-04: Declaration auto-populates Organisation Name and Date (ADO #101689 · TC-05-013)', async ({ page }) => {
    await loginPublic(page);
    // TODO[selector]: reach the Declaration tab.

    // STEP 2-3: ASSERT (BLOCKING) both are populated AND read-only (FDS 7.5.8 rules 1 & 4)
    // 🔑 Test read-only by ATTEMPTING AN EDIT, not by reading an attribute.
    const orgName = page.locator('.ant-form-item').filter({ hasText: /Organisation Name/i }).locator('input').first();
    const before = await orgName.inputValue();
    expect(before, 'Organisation Name should carry through from Organisation Details').not.toBe('');
    await orgName.click();
    await orgName.pressSequentially('XXX', { delay: 20 }).catch(() => {});
    expect(await orgName.inputValue(), 'Organisation Name must be read-only').toBe(before);
  });

  // ADO Test Case #101692: https://dev.azure.com/boxfusion/Boxfusion%20Test%20Plans/_workitems/edit/101692
  test('TC-05: 🔑 Submit creates the application and sends acknowledgement (ADO #101692 · TC-05-016)', async ({ page }) => {
    const failures = captureFailedRequests(page);
    await loginPublic(page);
    // TODO[selector]: reach the Declaration tab with steps 1-6 valid.

    // STEP 1-3: tick all declarations, fill name and capacity, Submit
    // TODO[selector]: declaration checkboxes, name, capacity.
    await page.getByRole('button', { name: /^Submit$/ }).click();
    await page.waitForTimeout(6000);

    // STEP 4: capture the submit response body — a 400 here is discarded silently by the UI
    if (failures.length) console.log('[TC-05] failed API calls:', JSON.stringify(failures, null, 1));
    expect(failures, `submit returned ${failures.length} failed API call(s)`).toHaveLength(0);

    // STEP 5-7: ASSERT (BLOCKING) success screen, reference number, and the prescribed status
    await expect(page.getByText(/success|submitted/i).first()).toBeVisible({ timeout: 30_000 });
    const body = await page.locator('body').innerText();
    const ref = body.match(/[A-Z]{2,4}\d{3,}[\/\d]*/)?.[0];
    console.log(`[TC-05] 🔑 APPLICATION REFERENCE = ${ref} — suites 06→13 depend on this`);
    expect(ref, 'an Application Reference Number must be returned').toBeTruthy();
    await expect(page.getByText('Application In-Progress', { exact: false })).toBeVisible();

    // 🔑 A closing wizard is NOT proof of a save — assert retrievability in
    // admin → CRUDS → All Applications (plan NPO-07 TC-02).
    // TODO[assertion]: cross-portal retrievability check by reference number.
  });

  // ADO Test Case #102156: https://dev.azure.com/boxfusion/Boxfusion%20Test%20Plans/_workitems/edit/102156
  test('TC-06: Submitter Full Name auto-populates and is read-only (ADO #102156 · TC-05-026)', async ({ page }) => {
    await loginPublic(page);
    // TODO[selector]: reach the Declaration tab.
    const nameField = page.locator('.ant-form-item').filter({ hasText: /Submitter Full Name/i }).locator('input').first();
    const before = await nameField.inputValue();
    expect(before, "should hold the logged-in user's FirstName LastName").not.toBe('');
    await nameField.click();
    await nameField.pressSequentially('ZZZ', { delay: 20 }).catch(() => {});
    expect(await nameField.inputValue(), 'Submitter Full Name must be read-only').toBe(before);
  });

  // ADO Test Case #102157: https://dev.azure.com/boxfusion/Boxfusion%20Test%20Plans/_workitems/edit/102157
  test('TC-07: Declaration Capacity is a dropdown; free text rejected (ADO #102157 · TC-05-027)', async ({ page }) => {
    await loginPublic(page);
    // TODO[selector]: reach the Declaration tab.

    const capacity = page.locator('.ant-form-item').filter({ hasText: /Capacity/i }).locator('.ant-select').first();
    await capacity.click();
    // 🔑 Scope options to the OPEN dropdown — the closed one stays mounted with stale options.
    const options = page.locator('.ant-select-dropdown:not(.ant-select-dropdown-hidden) .ant-select-item-option');
    await expect(options.first()).toBeVisible();
    console.log('[TC-07] Capacity options:', (await options.allInnerTexts()).join(' · '));

    // ASSERT (BLOCKING) a value not in the list is rejected, or typing is prevented
    await page.keyboard.type('NotARealCapacity');
    await page.keyboard.press('Enter');
    await page.keyboard.press('Escape');
    const selected = await capacity.locator('.ant-select-selection-item').innerText().catch(() => '');
    expect(selected, 'a non-listed Capacity must not be accepted').not.toMatch(/NotARealCapacity/);
  });

  // ADO Test Case #102158: https://dev.azure.com/boxfusion/Boxfusion%20Test%20Plans/_workitems/edit/102158
  test('TC-08: Tab-tick navigation preserves data on the current tab (ADO #102158 · TC-05-028)', async ({ page }) => {
    await loginPublic(page);
    // TODO[selector]: reach Tab 5 with Tabs 2-4 complete and Tab 5 partially filled.
    // ⚠️ HIGH-RISK CASE: saved data loads ASYNCHRONOUSLY after the step renders and has been
    // observed wiping values — exactly the failure this case hunts. Read values back AFTER
    // the form settles, or a genuine pass reads as a failure and vice versa.
    await page.waitForTimeout(4000);

    // TODO[selector]: stepper tick marks for Tab 3 and Tab 5.
    await expect(page.locator('.ant-steps-item-finish').first()).toBeVisible();
  });

  // ADO Test Case #102159: https://dev.azure.com/boxfusion/Boxfusion%20Test%20Plans/_workitems/edit/102159
  test('TC-09: Draft survives logout and re-login (ADO #102159 · TC-05-029)', async ({ page }) => {
    await loginPublic(page);
    // ✅ Partly corroborated already: drafts DO persist and are resumable by URL. What is
    // untested is whether they are LISTED on the dashboard and resume at the RIGHT tab.
    // TODO[selector]: fill to Tab 4 with 2 OBs, log out, log back in, open the draft.
    await expect(page.locator('.ant-steps-item-active .ant-steps-item-title')).toHaveText(/Office Bearer/i);
  });

  // ADO Test Case #101695: https://dev.azure.com/boxfusion/Boxfusion%20Test%20Plans/_workitems/edit/101695
  test('TC-10: Submitter and chairperson receive the acknowledgement email (ADO #101695 · TC-05-019)', async ({ page }) => {
    test.skip(true, '❓ Needs QA-readable mailboxes for submitter / chairperson / OBs — open question for Thabiso.');
  });
});
