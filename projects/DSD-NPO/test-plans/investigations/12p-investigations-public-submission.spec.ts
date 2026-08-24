// AUTO-RECORDED from test-plans/investigations/12p-investigations-public-submission.md
// Source: Azure DevOps test plan #101541 (Smoke), suite #101872
// The .md plan is canonical. AI-repair will patch failing lines in this file.
//
// ✅ REACHABLE TODAY — no login, no registered NPO, no submitted application.
// Runs in a CLEAN, SIGNED-OUT context: a leftover session would invalidate the whole case.
//
// ⚠️ ADO drift note: the Investigation entity has NO IsAnonymous flag; anonymity is inferred
// from a null ReportedUser. So the identity assertion below (not in the ADO case) is the
// point of running this — for a whistleblowing channel, a silent identification is serious.

import { test, expect } from '@playwright/test';
import { PUBLIC_URL, PUBLIC_ROUTES, captureFailedRequests, clickFirstVisible } from '../_helpers';

// Force a clean, unauthenticated context for every test in this file.
test.use({ storageState: { cookies: [], origins: [] } });

test.describe('NPO-12P — Investigations: Public Submission (smoke)', () => {

  // ADO Test Case #101789: https://dev.azure.com/boxfusion/Boxfusion%20Test%20Plans/_workitems/edit/101789
  test('TC-01: Anonymous submission of a whistleblowing case (ADO #101789 · TC-12-001)', async ({ page }) => {
    const failures = captureFailedRequests(page);
    const createPayloads: string[] = [];
    page.on('request', r => {
      if (r.method() === 'POST' && /investigation|case/i.test(r.url())) {
        createPayloads.push(`${r.url()} :: ${r.postData()?.slice(0, 1500) ?? '<no body>'}`);
      }
    });

    // STEP 1-2: NAVIGATE signed out and open "Submit a Query/Complaint"
    await page.goto(PUBLIC_URL + PUBLIC_ROUTES.landingPage);
    await page.waitForLoadState('networkidle');

    // TODO[selector]: the "Submit a Query/Complaint" entry point was not located at record
    // time — it is not in the signed-in nav bar (Dashboard · Register NPO · Education and
    // Awareness · Contact Us · FAQs). Check the public landing page and Contact Us.
    await clickFirstVisible(page, 'a, button', /Query|Complaint|Enquiry|Report/i);
    await page.waitForTimeout(3000);

    // STEP 3-4: ASSERT (BLOCKING) an anonymous toggle is visible
    const anonymous = page.locator('.ant-form-item').filter({ hasText: /anonymous/i }).first();
    await expect(anonymous, 'ADO #101789 step 1: "Anonymous toggle visible"').toBeVisible();

    // STEP 5: TICK anonymous
    await anonymous.locator('input, .ant-checkbox-wrapper, .ant-switch').first().click();

    // STEP 6: SELECT case category and type — RECORD every option offered
    // TODO[selector]: category + type selects — use selectAntdOption once recorded.

    // STEP 7-8: attach documents and Submit
    // TODO[selector]: attachment control (AntD Upload — setInputFiles on the VISIBLE control).
    await page.getByRole('button', { name: /^Submit$/ }).click();
    await page.waitForTimeout(4000);

    // STEP 9: capture the create payload and any >=400 response body
    console.log('[TC-01] create payloads:', JSON.stringify(createPayloads, null, 1));
    if (failures.length) console.log('[TC-01] failed API calls:', JSON.stringify(failures, null, 1));

    // STEP 10-11: ASSERT a confirmation shows and no contact details were required
    await expect(page.getByText(/thank you|submitted|reference|confirm/i).first()).toBeVisible();
    expect(failures, `submission returned ${failures.length} failed API call(s)`).toHaveLength(0);

    // 🔑 THE ASSERTION THAT MATTERS, and it is NOT in the ADO case:
    // the stored case must carry no identifying details of the submitter.
    for (const payload of createPayloads) {
      expect(payload, 'an anonymous complaint must not carry a submitter identity')
        .not.toMatch(/mpenduloizwelinuk|userId"\s*:\s*"[0-9a-f-]{36}|reportedUser"\s*:\s*"[0-9a-f-]{36}/i);
    }

    // 🔑 A closing form is NEVER proof of a save on this build — assert retrievability
    // separately in admin → CRUDS → Investigation (plan NPO-12A TC-01).
    // TODO[assertion]: cross-check the case appears in the admin register.
  });
});
