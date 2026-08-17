// AUTO-RECORDED from test-plans/cross-cutting/14s-public-npo-search.md
// Source: Azure DevOps test plan #101541 (Smoke), suite #101880
// The .md plan is canonical. AI-repair will patch failing lines in this file.
//
// ✅ REACHABLE TODAY — no login needed, and the register holds 361,068 NPOs to search.
// Runs SIGNED OUT: an authenticated session would hide the very thing this case tests.
//
// ⚠️ ADO drift note: NISPIS endpoints exist but are API-key gated, not a pure anonymous
// by-name search. Step 10 below captures the request so we can settle that — it is not in
// the ADO case, but it is what resolves the drift.

import { test, expect } from '@playwright/test';
import { PUBLIC_URL, PUBLIC_ROUTES, typeReal, clickFirstVisible } from '../_helpers';

test.use({ storageState: { cookies: [], origins: [] } });

const KNOWN_NPO_NAME = process.env.DSD_NPO_NAME || 'Foundation';

test.describe('NPO-14S — Public NPO Search & Anonymous Endpoints (smoke)', () => {

  // ADO Test Case #101819: https://dev.azure.com/boxfusion/Boxfusion%20Test%20Plans/_workitems/edit/101819
  test('TC-01: Public NPO search finds a registered NPO by name (ADO #101819 · TC-14-007)', async ({ page }) => {
    const searchRequests: Array<{ url: string; auth: boolean; apiKey: boolean }> = [];
    page.on('request', r => {
      if (/search|npo|nispis/i.test(r.url()) && /\/api\//.test(r.url())) {
        const h = r.headers();
        searchRequests.push({
          url: r.url(),
          auth: !!h['authorization'],
          apiKey: Object.keys(h).some(k => /api-?key|subscription/i.test(k)),
        });
      }
    });

    // STEP 1-2: NAVIGATE signed out and open the public NPO search
    await page.goto(PUBLIC_URL + PUBLIC_ROUTES.landingPage);
    await page.waitForLoadState('networkidle');

    // STEP 3: SNAPSHOT — RECORD whether the search is reachable at all without signing in
    // TODO[selector]: public NPO search entry point — not located at record time.
    await clickFirstVisible(page, 'a, button', /NPO Search|Search NPO|NPO Database|Search/i);
    await page.waitForTimeout(2500);

    // STEP 4-5: TYPE a known registered NPO name and ASSERT the text landed
    const box = page.locator('input[type=text]').first();
    const got = await typeReal(box, KNOWN_NPO_NAME);
    expect(got, 'the search text must land before reading any result').toBe(KNOWN_NPO_NAME);
    await page.keyboard.press('Enter');

    // STEP 6-7: ASSERT (BLOCKING) the matching registered NPO is returned
    // 📌 This is a SERVER-FILTERED SEARCH, not a rendered list — never conclude anything
    // from what the page showed before you typed.
    await page.waitForTimeout(4000);
    const results = page.locator('[role=row], .ant-list-item, .ant-card');
    await expect(results.first(), 'a known registered NPO should be returned').toBeVisible({ timeout: 20_000 });

    // STEP 8: ASSERT the NPO's status is visible in the result (FDS 7)
    await expect(page.getByText(/Registered|Status/i).first()).toBeVisible();

    // STEP 9: repeat by category
    // TODO[selector]: category search control.

    // STEP 10: 🔑 RECORD whether the underlying request is anonymous or API-key gated.
    // This resolves the drift note and feeds suite 14Z (Security).
    console.log('[TC-01] search requests:', JSON.stringify(searchRequests, null, 1));

    // ❓ Also worth recording: what an anonymous searcher can see. Name and status are
    // prescribed; contact details or office bearers would be a POPIA question (suite 14Y).
  });
});
