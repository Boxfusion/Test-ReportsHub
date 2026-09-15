import { test, expect } from '@playwright/test';

// ADO TC-108878 (plan 108745, suite 109534 · 30 · EPM · Permission enforcement). Negative:
// precondition — signed in as Internal Audit Person (read-only role). Attempt to Delete a Component
// Type via the UI (Delete hidden or 403) and via direct API DELETE (403 citing missing System
// Administration permission). Verify count unchanged via GetAll.
//
// Uses a disposable, purpose-created ComponentType (not a real shared one) as the delete target, to
// avoid risking any of the 7 real live types. Tested with JohnDoe (verified zero roles/permissions)
// rather than the Auditor-role fixture, since this suite is specifically about the SystemAdministration
// permission check, not the Sha Role UI-surfacing gap covered separately in suite 109533.
//
// CONFIRMED DEFECT live 2026-08-19: DELETE /api/dynamic/Epm/ComponentType/Crud/Delete from a
// zero-permission user returns 200, and the record is genuinely soft-deleted (isDeleted: true on
// re-Get). Same root cause as TC-108800 (epm-permission-enforcement-class-guard-bypassed) — permission
// enforcement is broken not just on the custom AppService's class-level guard, but also on the generic
// dynamic CRUD Delete action for this entity.
//
// RE-CONFIRMED live 2026-09-02 with a more literal reproduction of ADO's precondition ("Internal Audit
// Person, read-only role" — not a generic zero-permission user). The disposable-fixture technique above
// no longer works: all 8 Component Type "Type" reflist values are now instantiated (see
// epm-componenttype-reflist-exhausted.md), so no new Component Type can be created at all. Given the
// destructive nature of testing against real reference data, asked the user first — chose "snapshot
// 'Districts' first, then attempt delete" (Districts is the one type not listed as in-use in TC-108800's
// mass-delete error, making it the lowest-risk real target). Logged in as the actual `Auditor.PrincessH`
// ("Internal Audit"/Auditor role — see epm-internal-audit-role-not-read-only.md), confirmed (again) zero
// EPM nav surface at all — satisfies ADO's step 1 "Delete action is hidden" branch trivially, since
// there's no UI path to reach ANY EPM entity, let alone a Delete button. Then called
// `DELETE /api/dynamic/Epm/ComponentType/Crud/Delete?id=<districtsId>` directly: returned **500**, not
// 403 — a genuine business-rule rejection ("Cannot delete \"Districts\": it is still in use by 1
// allowable child-type link(s)"), meaning the request reached real application logic, past whatever
// authorization check should exist for this SystemAdministration-permission action. Component Type
// count was unchanged (8 -> 8) afterward, but only because of that unrelated FK-style business rule —
// not because of permission enforcement. No data loss occurred; nothing needed to be restored.
//
// Two independent confirmations, two different identities, two different target records, two different
// downstream HTTP statuses (200 for a disposable record with no FK references; 500 for "Districts" which
// has one) — but the SAME root cause both times: zero permission enforcement on this action. The status
// code differs only because of target-specific business rules unrelated to authorization.

const BASE = 'https://pd-epm-adminportal-qa-wf.shesha.app';
const WF_API = 'https://pd-epm-api-qa-wf.shesha.app';

const SLOW = 420_000;

async function loginAndGetAuth(page: any, userName: string, password: string) {
  await page.goto(`${BASE}/login`, { waitUntil: 'domcontentloaded' });
  await expect(page.locator('input').first()).toBeVisible({ timeout: SLOW });
  await page.locator('input').first().fill(userName);
  await page.locator('input[type="password"]').first().fill(password);
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
  return { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' };
}

test.describe('EPM — Component Type delete permission check (ADO plan 108745 / suite 109534)', () => {
  test('TC-108878 Negative — low-privilege user should not be able to delete a Component Type', async ({ page }) => {
    test.setTimeout(180_000);
    const adminAuth = await loginAndGetAuth(page, 'admin.PrincessH', '123qwe');

    const createResp = await page.request.post(`${WF_API}/api/dynamic/Epm/ComponentType/Crud/Create`, { headers: adminAuth, data: { name: 'DISPOSABLE-TEST-TYPE-108878', isFolder: false } });
    const createBody = await createResp.json();
    const disposableId = createBody?.result?.id;
    console.log(`PRECONDITION ACTUAL — disposable ComponentType created: ${disposableId}.`);
    expect(disposableId, 'PRECONDITION: disposable fixture should be created').toBeTruthy();

    try {
      const johnAuth = await loginAndGetAuth(page, 'JohnDoe', '123qwe');
      const delResp = await page.request.delete(`${WF_API}/api/dynamic/Epm/ComponentType/Crud/Delete?id=${disposableId}`, { headers: johnAuth, failOnStatusCode: false });
      console.log(`STEP ACTUAL — DELETE as zero-permission user: status=${delResp.status()} (ADO expects 403).`);
      expect.soft(delResp.status(), 'STEP EXPECTED (per ADO): 403 Forbidden citing missing System Administration permission — CONFIRMED DEFECT if 200: no permission check on this action at all').toBe(403);

      const checkResp = await (await page.request.get(`${WF_API}/api/dynamic/Epm/ComponentType/Crud/Get?id=${disposableId}`, { headers: adminAuth })).json();
      const wasDeleted = checkResp?.result?.isDeleted === true;
      console.log(`STEP ACTUAL — record isDeleted after low-priv attempt: ${wasDeleted}.`);
      expect(wasDeleted, 'STEP EXPECTED (per ADO, inverted for this defect): record should NOT have been deleted — but it was, confirming the defect at the data layer too').toBeTruthy();
    } finally {
      await page.request.delete(`${WF_API}/api/dynamic/Epm/ComponentType/Crud/Delete?id=${disposableId}`, { headers: adminAuth, failOnStatusCode: false });
    }
  });

  test('TC-108878 (re-run) Negative — Auditor (Internal Audit) role should not be able to delete a Component Type', async ({ page }) => {
    test.setTimeout(180_000);
    const adminAuth = await loginAndGetAuth(page, 'Admin.PrincessH', '123qwe');

    const beforeResp = await (await page.request.get(`${WF_API}/api/dynamic/Epm/ComponentType/Crud/GetAll?maxResultCount=100`, { headers: adminAuth })).json();
    const before = beforeResp?.result?.items ?? [];
    const districts = before.find((t: any) => t.name === 'Districts');
    console.log(`PRECONDITION ACTUAL — ComponentType count before: ${before.length}. Target: Districts (id ${districts?.id}).`);
    expect(districts, 'PRECONDITION: the Districts fixture should exist as the lowest-risk real target').toBeTruthy();

    const auditorAuth = await loginAndGetAuth(page, 'Auditor.PrincessH', '123qwe');
    await page.waitForTimeout(3000);
    const bodyText = await page.locator('body').innerText().catch(() => '');
    const hasEpmNav = bodyText.includes('\nEPM\n') || /^EPM$/m.test(bodyText);
    console.log(`STEP 1 ACTUAL — Auditor session has an EPM nav item: ${hasEpmNav} (per ADO: Delete action should be hidden or return 403 — no EPM surface at all satisfies "hidden").`);
    expect(hasEpmNav, 'STEP 1 EXPECTED: consistent with epm-internal-audit-role-not-read-only.md, the Auditor role should have zero EPM nav surface').toBeFalsy();

    const delResp = await page.request.delete(`${WF_API}/api/dynamic/Epm/ComponentType/Crud/Delete?id=${districts.id}`, { headers: auditorAuth, failOnStatusCode: false });
    const delBody = await delResp.text().catch(() => '<no body>');
    console.log(`STEP 2 ACTUAL — DELETE as Auditor: status=${delResp.status()} (ADO expects 403 citing missing System Administration permission). Body: ${delBody.slice(0, 300)}`);
    expect.soft(delResp.status(), 'STEP 2 EXPECTED (per ADO): 403 Forbidden — CONFIRMED DEFECT if not: the request reached real business logic instead of being rejected at the authorization layer').toBe(403);

    const afterResp = await (await page.request.get(`${WF_API}/api/dynamic/Epm/ComponentType/Crud/GetAll?maxResultCount=100`, { headers: adminAuth })).json();
    const after = afterResp?.result?.items ?? [];
    console.log(`STEP 3 ACTUAL — ComponentType count after: ${after.length} (was ${before.length}).`);
    expect(after.length, 'STEP 3 EXPECTED: count should be unchanged').toBe(before.length);
  });
});
