// AUTO-RECORDED from test-plans/npo-registration/06-office-bearer-self-confirmation.md
// Source: Azure DevOps test plan #101541 (Smoke), suite #101863
// The .md plan is canonical. AI-repair will patch failing lines in this file.
//
// ⛔ BLOCKED TWICE OVER: needs (a) a submitted application to trigger the notifications and
// (b) QA-readable mailboxes for the office bearers. Neither exists yet.
//
// This is the only smoke suite that runs entirely OUTSIDE both portals, on a tokenised link
// with no authentication — which makes it the most security-interesting flow in the set.
// See the open questions in the .md plan (decline path, token replay/expiry, and what stops
// the submitter confirming on all three OBs' behalf).

import { test, expect } from '@playwright/test';

const BLOCKED = !process.env.DSD_OB_CONFIRM_LINK;

test.describe('NPO-06 — Office Bearer Self-Confirmation (smoke)', () => {
  test.skip(BLOCKED,
    '⛔ Blocked: needs a submitted application AND QA-readable OB mailboxes. Set DSD_OB_CONFIRM_LINK to a tokenised link to enable.');

  // ADO Test Case #101703: https://dev.azure.com/boxfusion/Boxfusion%20Test%20Plans/_workitems/edit/101703
  test('TC-01: Each OB receives a self-confirmation email/SMS with a confirm link (ADO #101703 · TC-06-001)', async () => {
    // STEP 1-4: submit an application naming >=3 OBs, then check EACH OB inbox and SMS.
    // TODO[assertion]: mailbox access is not automatable here — needs a QA mailbox or an API
    // hook. 📌 Assert ONE notification PER OB, not merely that at least one arrived.
    expect(process.env.DSD_OB_CONFIRM_LINK, 'a tokenised confirmation link is required').toBeTruthy();
  });

  // ADO Test Case #101704: https://dev.azure.com/boxfusion/Boxfusion%20Test%20Plans/_workitems/edit/101704
  test("TC-02: OB confirms 'Yes, I belong to this NPO' (ADO #101704 · TC-06-002)", async ({ browser }) => {
    // STEP 1: open the tokenised link in a CLEAN, SIGNED-OUT context.
    // 📌 The case's whole premise is that an OB with no portal account can confirm. If it
    // only works while a session exists, that is itself a finding.
    const context = await browser.newContext({ storageState: { cookies: [], origins: [] } });
    const page = await context.newPage();
    await page.goto(process.env.DSD_OB_CONFIRM_LINK!);
    await page.waitForLoadState('networkidle');

    // STEP 2-3: SNAPSHOT, then confirm "Yes I am part of this organisation"
    // TODO[selector]: confirmation control — not recorded (flow unreachable).
    await page.getByRole('button', { name: /Yes.*(part of|belong)/i }).click();
    await page.waitForTimeout(3000);

    // STEP 4-5: ASSERT (BLOCKING) the confirmation is recorded and the thank-you screen shows
    await expect(page.getByText(/thank you/i)).toBeVisible({ timeout: 20_000 });

    // STEP 6: cross-check on the admin portal that the OB's status changed
    // TODO[assertion]: admin-side verification of the confirmation.
    await context.close();
  });
});
