import { test, expect } from '@playwright/test';

// ADO TC-108875 (plan 108745, suite 109531 · 29 · EPM · Audit trail view). Negative: precondition —
// "Audit trail view loaded". Send a filter request with actionType=999 (not a valid reflist value) —
// expect an empty result set with no error. Verify the UI handles the empty result gracefully
// ("No records found", no error banner). Re-apply a valid filter — expect the expected rows back.
//
// Confirmed live 2026-08-19: there is no dedicated "Audit trail view" UI page anywhere in the app
// (see epm-audit-trail-view-does-not-exist memory / TC-108799), so STEP 2's UI-level check cannot be
// exercised and is documented as blocked rather than tested. STEPS 1 and 3, however, describe genuine
// API-level behaviour of EpmAuditedEntityEvent/Crud/GetAll's JsonLogic `filter` query param, which is
// real and independently testable — and both pass cleanly against the correct field name (`actionType`,
// the raw reflist int; NOT `action`, the resolved display-text string used elsewhere in this session —
// filtering `action` with an int literal 500s with a SQL type-mismatch error, which is a script-usage
// bug, not an app defect, since `action` is a string field).

const BASE = 'https://pd-epm-adminportal-qa-wf.shesha.app';
const WF_API = 'https://pd-epm-api-qa-wf.shesha.app';
const KNOWN_VALID_ACTION_TYPE = 11; // "was published by" — 34 real rows tenant-wide as of 2026-08-19

const SLOW = 420_000;

test.describe('EPM — Audit trail view invalid filter (ADO plan 108745 / suite 109531)', () => {
  test('TC-108875 Negative — invalid actionType filter returns empty set with no error', async ({ page }) => {
    test.setTimeout(180_000);

    await page.goto(`${BASE}/login`, { waitUntil: 'domcontentloaded' });
    await expect(page.locator('input').first()).toBeVisible({ timeout: SLOW });
    await page.locator('input').first().fill('admin.PrincessH');
    await page.locator('input[type="password"]').first().fill('123qwe');
    await page.getByRole('button', { name: /sign in|login/i }).first().click();
    await expect(page).not.toHaveURL(/\/login/, { timeout: SLOW });

    const token = await page.evaluate(() => {
      for (const key of Object.keys(localStorage)) {
        const value = localStorage.getItem(key);
        if (value && /^ey[A-Za-z0-9]/.test(value)) return value;
        try {
          const parsed = JSON.parse(value);
          if (parsed && typeof parsed.accessToken === 'string') return parsed.accessToken;
        } catch { /* not JSON */ }
      }
      return null;
    });
    const auth = { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' };

    // STEP 1 (ADO): filter actionType=999 (invalid reflist value) -> empty result, no error.
    const invalidUrl = `${WF_API}/api/dynamic/Epm/EpmAuditedEntityEvent/Crud/GetAll?maxResultCount=10&filter=${encodeURIComponent(JSON.stringify({ '==': [{ var: 'actionType' }, 999] }))}`;
    const invalidResp = await page.request.get(invalidUrl, { headers: auth });
    const invalidBody = await invalidResp.json();
    console.log(`STEP 1 ACTUAL — status=${invalidResp.status()}, totalCount=${invalidBody?.result?.totalCount}, error=${JSON.stringify(invalidBody?.error)}`);
    expect(invalidResp.status(), 'STEP 1 EXPECTED: request should succeed (no 500/400)').toBe(200);
    expect(invalidBody?.result?.totalCount, 'STEP 1 EXPECTED: invalid actionType should return zero rows').toBe(0);
    expect(invalidBody?.error, 'STEP 1 EXPECTED: no error object on an invalid-but-well-typed filter value').toBeNull();

    // STEP 2 (ADO): verify the UI shows "No records found" without an error banner.
    // CONFIRMED GAP (see TC-108799): no dedicated Audit Trail UI view exists anywhere to check this against.
    expect.soft(false, 'STEP 2 BLOCKED: no dedicated Audit Trail UI view exists anywhere in the app (confirmed via TC-108799) — cannot verify UI-level empty-state rendering').toBeTruthy();

    // STEP 3 (ADO): re-apply a valid filter -> expect the expected rows back.
    const validUrl = `${WF_API}/api/dynamic/Epm/EpmAuditedEntityEvent/Crud/GetAll?maxResultCount=10&filter=${encodeURIComponent(JSON.stringify({ '==': [{ var: 'actionType' }, KNOWN_VALID_ACTION_TYPE] }))}`;
    const validResp = await page.request.get(validUrl, { headers: auth });
    const validBody = await validResp.json();
    console.log(`STEP 3 ACTUAL — status=${validResp.status()}, totalCount=${validBody?.result?.totalCount}`);
    expect(validResp.status(), 'STEP 3 EXPECTED: request should succeed').toBe(200);
    expect(validBody?.result?.totalCount, 'STEP 3 EXPECTED: a known-valid actionType should return >0 rows').toBeGreaterThan(0);
  });
});
