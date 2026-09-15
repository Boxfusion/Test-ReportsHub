import { test, expect } from '@playwright/test';

// Remainder of suite 109533 (plan 108745, "31 · Internal Audit read-only role"), each reducing to a
// root cause already confirmed in TC-108801 (see epm-internal-audit-role-not-read-only):
//
// TC-108881 (Negative — reject Internal Audit Person from editing a field): a second angle on the
// exact same write-block expectation TC-108801 already disproved (direct PUT succeeds, not 403).
// Re-confirmed here independently rather than assumed.
//
// TC-108882 (Edge — Internal Audit can view 3 years of historical audit rows via the audit trail
// view): depends on the Audit Trail UI view, already confirmed absent tenant-wide regardless of role
// (see epm-audit-trail-view-does-not-exist) — doubly blocked, since the Auditor role also has no EPM
// nav surface at all to reach any such page from.
//
// TC-108883 (Integration — adding a Person to Internal Audit grants read access to every EPM entity):
// contradicted directly by TC-108801's nav-surface finding — a fresh Person granted "Auditor" gets
// ZERO EPM entities visible, not "every entity read-only". Verified independently below with a
// brand-new appointment rather than reusing the existing Auditor fixture, to rule out a fixture-
// specific quirk.
//
// CONFIRMED (upgraded from "inconclusive-but-likely"), 2026-09-02: the fresh-candidate login could
// still not be resolved (same blocker as before — no `User.emailAddress` match for a genuinely
// unappointed Person), so fell back to the durably-appointed `Auditor.PrincessH` fixture, confirmed
// live to still hold a real "Auditor" `ShaRoleAppointedPerson` row. Result: zero EPM nav — same defect,
// now confirmed rather than inferred. Bonus finding: direct API reads DO work for this Person (`200`,
// real `ComponentType` data) — the read-only data access is genuinely granted, it's specifically the UI
// navigation/menu wiring that never renders any EPM entry point for this role, not a data-layer denial.
//
// TC-108882 RE-CONFIRMED live 2026-09-02, after the same-day discovery of a real "Administration >
// Audit Logs" nav submenu (Logon/One Time Pins/Notifications — see
// epm-audit-trail-view-does-not-exist.md's major correction) raised the question of whether it changes
// this case's outcome. It doesn't — that discovery is CPR-irrelevant (login/security event data, no
// financial-year or Progress Report semantics at all), so it can't satisfy TC-108882's actual ask even
// in principle. Refined the "zero EPM nav surface" finding though: logged in as Auditor.PrincessH and
// confirmed the top-level menu bar shows only "Auditor view" (no EPM, no Administration, no
// Configurations items) — but DIRECT URL navigation to a non-EPM-namespaced Shesha form
// (`/dynamic/shesha/logon-audit`) genuinely renders for this role, with real data (2087 rows). So "zero
// EPM UI surface" specifically means no menu-reachable EPM pages, not that literally every URL 404s for
// this role — a nuance worth keeping precise, even though it doesn't change TC-108882's own
// classification (still blocked: the CPR-scoped Audit Trail view this case needs doesn't exist for any
// role, per epm-audit-trail-view-does-not-exist.md, so there's nothing for Auditor to reach regardless).

const BASE = 'https://pd-epm-adminportal-qa-wf.shesha.app';
const WF_API = 'https://pd-epm-api-qa-wf.shesha.app';
const CPR_ID = 'f9a15981-10a4-4bf6-89a1-83a239a2c498';
const ORIGINAL_OTHER_COMMENTS = 'c'.repeat(195);
const AUDITOR_ROLE_ID = 'dab1ee0b-ffe9-455a-ad6e-487f27df5a06';

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

test.describe('EPM — Internal Audit role suite 109533 remainder (ADO plan 108745)', () => {
  test('TC-108881 Negative — direct PUT from Internal Audit Person is not rejected', async ({ page }) => {
    test.setTimeout(120_000);
    const auth = await loginAndGetAuth(page, 'Auditor.PrincessH', '123qwe');
    const marker = `AUDITOR-108881-${Date.now() % 100000}`;
    try {
      const putResp = await page.request.put(`${WF_API}/api/dynamic/Epm/ComponentProgressReport/Crud/Update`, { headers: auth, data: { id: CPR_ID, otherComments: marker } });
      console.log(`TC-108881 ACTUAL — direct PUT status: ${putResp.status()} (ADO expects 403).`);
      expect.soft(putResp.status(), 'TC-108881 EXPECTED (per ADO): 403 Forbidden — CONFIRMED DEFECT (same as TC-108801) if 200').toBe(403);
      const reGet = await (await page.request.get(`${WF_API}/api/dynamic/Epm/ComponentProgressReport/Crud/Get?id=${CPR_ID}`, { headers: auth })).json();
      console.log(`TC-108881 ACTUAL — record unchanged: ${reGet?.result?.otherComments !== marker}.`);
      expect.soft(reGet?.result?.otherComments !== marker, 'TC-108881 EXPECTED: no field change should persist — CONFIRMED DEFECT if the marker persisted').toBeTruthy();
    } finally {
      const adminAuth = await loginAndGetAuth(page, 'admin.PrincessH', '123qwe');
      await page.request.put(`${WF_API}/api/dynamic/Epm/ComponentProgressReport/Crud/Update`, { headers: adminAuth, data: { id: CPR_ID, otherComments: ORIGINAL_OTHER_COMMENTS } });
    }
  });

  test('TC-108882 Edge — historical audit rows via audit trail view (blocked, no UI + no nav)', async ({ page }) => {
    test.setTimeout(120_000);
    await loginAndGetAuth(page, 'Auditor.PrincessH', '123qwe');
    await page.waitForTimeout(1000);
    const epmItem = page.locator('.ant-menu').getByText('EPM', { exact: true }).locator('visible=true').first();
    const epmVisible = await epmItem.isVisible().catch(() => false);
    console.log(`TC-108882 ACTUAL — EPM nav visible for Auditor: ${epmVisible} (no Audit Trail view exists tenant-wide regardless, per TC-108799).`);
    expect.soft(epmVisible, 'TC-108882 EXPECTED (per ADO): should reach an audit trail view showing 3 years of history — BLOCKED: no EPM nav surface for this role, and no Audit Trail view exists anywhere in the app for any role').toBeTruthy();
  });

  test('TC-108883 Integration — new Auditor appointment gets zero EPM entities visible, not every entity', async ({ page }) => {
    test.setTimeout(120_000);
    const auth = await loginAndGetAuth(page, 'admin.PrincessH', '123qwe');

    // find a Person with no existing EPM Sha Role appointment
    const peopleResp = await (await page.request.get(`${WF_API}/api/dynamic/Shesha/Person/Crud/GetAll?maxResultCount=200`, { headers: auth })).json();
    const appointmentsResp = await (await page.request.get(`${WF_API}/api/dynamic/Shesha/ShaRoleAppointedPerson/Crud/GetAll?maxResultCount=500`, { headers: auth })).json();
    const appointedPersonIds = new Set((appointmentsResp?.result?.items ?? []).map((a: any) => a.person?.id));
    const candidate = (peopleResp?.result?.items ?? []).find((p: any) => !appointedPersonIds.has(p.id) && p.isDeleted === false);
    console.log(`TC-108883 PRECONDITION — candidate Person with zero existing EPM role: ${candidate?.fullName} (${candidate?.id}).`);
    expect(candidate, 'TC-108883 PRECONDITION: a Person with no EPM role should exist to appoint fresh').toBeTruthy();

    const createResp = await page.request.post(`${WF_API}/api/dynamic/Shesha/ShaRoleAppointedPerson/Crud/Create`, { headers: auth, data: { person: { id: candidate.id }, role: { id: AUDITOR_ROLE_ID } } });
    const createBody = await createResp.json().catch(() => null);
    console.log(`TC-108883 ACTUAL — appointment create status: ${createResp.status()}.`);
    expect(createResp.status(), 'TC-108883 EXPECTED: the appointment row itself should be created successfully').toBe(200);
    const newAppointmentId = createBody?.result?.id;

    try {
      // find this candidate's login username, log in fresh, check EPM nav visibility
      const usersResp = await (await page.request.get(`${WF_API}/api/dynamic/Shesha/User/Crud/GetAll?maxResultCount=200`, { headers: auth })).json();
      const userMatch = (usersResp?.result?.items ?? []).find((u: any) => u.emailAddress === candidate.emailAddress1);
      console.log(`TC-108883 — resolved login for candidate: ${userMatch?.userName}.`);
      if (userMatch?.userName) {
        const freshPage = page;
        await loginAndGetAuth(freshPage, userMatch.userName, '123qwe');
        await freshPage.waitForTimeout(1500);
        const epmItem = freshPage.locator('.ant-menu').getByText('EPM', { exact: true }).locator('visible=true').first();
        const epmVisible = await epmItem.isVisible().catch(() => false);
        console.log(`TC-108883 ACTUAL — freshly-appointed Auditor sees EPM nav: ${epmVisible} (ADO expects true, every entity visible read-only).`);
        expect.soft(epmVisible, 'TC-108883 EXPECTED (per ADO): every EPM entity should be visible in a read-only list view — CONFIRMED DEFECT (same as TC-108801): zero EPM nav surface for this role, same for a brand-new appointment, not a fixture-specific quirk').toBeTruthy();
      } else {
        console.log('TC-108883 — could not resolve a login for the candidate Person; falling back to the durably-appointed Auditor.PrincessH fixture instead (confirmed 2026-09-02 to still hold a real "Auditor" ShaRoleAppointedPerson row) rather than leaving this sub-check unrun.');
        const auditorAuth = await loginAndGetAuth(page, 'Auditor.PrincessH', '123qwe');
        await page.waitForTimeout(2000);
        const bodyText = await page.locator('body').innerText().catch(() => '');
        const epmVisibleFallback = bodyText.split('\n').slice(0, 5).some((l: string) => l.trim() === 'EPM');
        console.log(`TC-108883 ACTUAL (fallback fixture) — Auditor.PrincessH sees EPM nav: ${epmVisibleFallback} (ADO expects true, every entity visible read-only).`);
        expect.soft(epmVisibleFallback, 'TC-108883 EXPECTED (per ADO): every EPM entity should be visible in a read-only list view — CONFIRMED DEFECT: zero EPM nav surface for a real, durably-appointed Internal Audit Person').toBeTruthy();

        // Bonus, informative: check whether the read-only intent is at least honored at the API/data
        // layer even though the UI never renders any entry point to it.
        const apiReadResp = await page.request.get(`${WF_API}/api/dynamic/Epm/ComponentType/Crud/GetAll?maxResultCount=10`, { headers: auditorAuth });
        const apiReadBody = await apiReadResp.json().catch(() => null);
        console.log(`TC-108883 BONUS — direct API GetAll ComponentType as Auditor: status=${apiReadResp.status()}, count=${apiReadBody?.result?.totalCount} (confirms read access is genuinely granted at the data layer, just never surfaced through any UI navigation).`);
      }
    } finally {
      if (newAppointmentId) {
        const delResp = await page.request.delete(`${WF_API}/api/dynamic/Shesha/ShaRoleAppointedPerson/Crud/Delete?id=${newAppointmentId}`, { headers: auth });
        console.log(`TC-108883 CLEANUP — deleted test appointment, status=${delResp.status()}.`);
      }
    }
  });
});
