import { test, expect } from '@playwright/test';

// ADO TC-108800 (plan 108745, suite 109534 · 30 · EPM · Permission enforcement — Epm Permissions
// class-level authorisation attribute). Positive: precondition — signed in as a Person without the
// Epm Permissions System Administration permission. Attempt to call MasterDeleteAllComponentTypesAsync
// via the ComponentTypesAppService route — expect 403 Forbidden. Verify no records deleted via GetAll
// count before/after. Confirm the audit trail records no delete event.
//
// SAFETY: this method is destructive (mass-deletes ComponentType records) — before attempting this as
// a low-privilege user, the current 7 records were snapshotted to
// projects/EPM/test-plans/_scratch/componenttype-snapshot.json, and the real route was located via a
// series of safe GET probes (a GET on a POST/DELETE-only action returns 405, confirming route
// existence, without ever invoking the delete logic): the route is
// `/api/v1/Epm/ComponentTypes/MasterDeleteAllComponentTypes`, and per ABP's dynamic-API HTTP-verb
// convention (method names starting with "Delete" default to the DELETE verb), the real verb is DELETE.
//
// CONFIRMED DEFECT live 2026-08-19: as JohnDoe (verified zero roles, zero permissions, zero Sha Role
// appointments — the lowest-privilege user in the tenant), the DELETE call returned `500`, NOT `403`.
// The 500's message is a genuine business-rule rejection ("Cannot delete all Component Types — 7 are
// still in use: Department, Outcome, Output, Programme, Qualitative KPI, Quantitative KPI, Sub
// Programme...") — meaning the request reached real application logic past the
// [AbpAuthorize(EpmPermissions.SystemAdministration)] class-level guard entirely. The only reason no
// data was lost is an unrelated business rule (types currently in use), NOT permission enforcement. If
// all ComponentTypes were currently unused, this call would have genuinely mass-deleted them as an
// anonymous-privilege user.
//
// RE-CONFIRMED live 2026-09-02, same result, run with the user's explicit sign-off given the
// destructive nature of this endpoint (asked first, chose "re-run with snapshot safety net"). Same
// safety procedure: snapshotted the current 8 ComponentType records (one more than 2026-08-19 — a
// "Districts" type was added since) to a local temp file before the call, confirmed the route via a
// safe GET probe (405, still exists), then called DELETE as JohnDoe. Result: identical — `500`, not
// `403`, same business-rule rejection message (still names the same 7 in-use types; "Districts" is the
// 8th, unlisted as in-use, but the endpoint's all-or-nothing behavior meant it wasn't deleted either).
// Count unchanged (8 -> 8). Also checked step 3 (ADO: "no audit row corresponds to the rejected call")
// for the first time this pass: the 10 most recent tenant-wide `EpmAuditedEntityEvent` rows are all
// pre-existing ComponentProgressReport entries from earlier same-day testing — genuinely zero rows
// relate to this rejected call or to ComponentType at all, matching ADO's literal expectation exactly
// (though for the "wrong" reason — the request failed outright with no audit-writing side effect,
// consistent with this session's broader finding that this app's audit write path barely functions;
// see epm-audit-trail-zero-rows-full-lifecycle.md). The core finding (guard bypassed) stands unchanged
// after a second independent live confirmation two weeks apart.

const BASE = 'https://pd-epm-adminportal-qa-wf.shesha.app';
const WF_API = 'https://pd-epm-api-qa-wf.shesha.app';
const ROUTE = `${WF_API}/api/v1/Epm/ComponentTypes/MasterDeleteAllComponentTypes`;

const SLOW = 420_000;

test.describe('EPM — Permission enforcement class-level guard (ADO plan 108745 / suite 109534)', () => {
  test('TC-108800 Positive — low-privilege call to a guarded AppService method should be rejected', async ({ page }) => {
    test.setTimeout(180_000);

    await page.goto(`${BASE}/login`, { waitUntil: 'domcontentloaded' });
    await expect(page.locator('input').first()).toBeVisible({ timeout: SLOW });
    await page.locator('input').first().fill('JohnDoe');
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
    const auth = { Authorization: `Bearer ${token}` };

    const before = await (await page.request.get(`${WF_API}/api/dynamic/Epm/ComponentType/Crud/GetAll?maxResultCount=1000`, { headers: auth })).json();
    const countBefore = before?.result?.items?.length;
    console.log(`PRECONDITION ACTUAL — ComponentType count before: ${countBefore}.`);

    // STEP (ADO): attempt the guarded method as a low-privilege Person.
    const resp = await page.request.delete(ROUTE, { headers: auth, failOnStatusCode: false });
    const body = await resp.json().catch(() => null);
    console.log(`STEP ACTUAL — status=${resp.status()}, body=${JSON.stringify(body).slice(0, 400)}`);
    expect.soft(resp.status(), 'STEP EXPECTED (per ADO): 403 Forbidden — CONFIRMED DEFECT: request reached real business logic (500, a business-rule rejection) instead, meaning the class-level [AbpAuthorize] guard is not enforced for this method at all').toBe(403);

    // Verify no records were actually deleted (protected here only by the unrelated
    // "still in use" business rule, not by the missing authorization check).
    const after = await (await page.request.get(`${WF_API}/api/dynamic/Epm/ComponentType/Crud/GetAll?maxResultCount=1000`, { headers: auth })).json();
    const countAfter = after?.result?.items?.length;
    console.log(`STEP ACTUAL — ComponentType count after: ${countAfter}.`);
    expect(countAfter, 'STEP EXPECTED: no records should have been deleted').toBe(countBefore);

    // STEP 3 (ADO): confirm the audit trail records no delete event for ComponentType.
    const auditResp = await (await page.request.get(`${WF_API}/api/dynamic/Epm/EpmAuditedEntityEvent/Crud/GetAll?maxResultCount=10&sorting=creationTime%20desc`, { headers: auth })).json();
    const recentActions = (auditResp?.result?.items ?? []).map((a: any) => a.action);
    console.log(`STEP 3 ACTUAL — most recent 10 tenant-wide audit actions: ${JSON.stringify(recentActions)}.`);
    const hasDeleteEvent = recentActions.some((a: string) => /delete/i.test(a) || /component ?type/i.test(a));
    expect(hasDeleteEvent, 'STEP 3 EXPECTED (per ADO): no audit row should correspond to the rejected call').toBeFalsy();
  });
});
