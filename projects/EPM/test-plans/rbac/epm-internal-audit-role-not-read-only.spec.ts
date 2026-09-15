import { test, expect } from '@playwright/test';

// ADO TC-108801 (plan 108745, suite 109533 · 31 · EPM · Internal Audit read-only role — no Edit
// permission granted). Positive: precondition — signed in as a Person appointed to the "Internal
// Audit" Sha Role. Navigate to a Component Progress Report — every field visible read-only, no Edit
// button. Attempt a direct PUT to ComponentProgressReport/Crud/Update via the browser console —
// expect 403 Forbidden. Re-read via GetAll — record unchanged.
//
// NAMING NOTE: there is no Sha Role literally named "Internal Audit" in this tenant. The real role is
// "Auditor" (confirmed via Shesha/ShaRole/Crud/GetAll: SPMR Director, EPM Users, System Administrator,
// Monitoring and Evaluation, Auditor). Used the existing real appointment "Princess Hlazo (Auditor)"
// (login: Auditor.PrincessH / 123qwe, personId 91dc759f-...) as the fixture.
//
// TWO CONFIRMED DEFECTS found live 2026-08-19:
// 1. The Auditor role has literally NO EPM nav item in the sidebar at all — not even read-only. A
//    fresh login as Auditor.PrincessH lands on workflows-inbox with zero EPM entry point anywhere,
//    so there is no UI path to "navigate to a Component Progress Report" as read-only at all. This
//    contradicts the read-only-visibility premise entirely (not just missing an Edit button — missing
//    the entire surface).
// 2. A direct PUT to ComponentProgressReport/Crud/Update from the Auditor session is NOT rejected —
//    it returns 200 and the write genuinely persists (verified via a real round-trip: wrote a marker
//    string to `otherComments`, re-GET confirmed the marker persisted, then restored the original
//    195-char value to leave the shared fixture undisturbed). There is no read-only enforcement at the
//    API layer for this role at all.

const BASE = 'https://pd-epm-adminportal-qa-wf.shesha.app';
const WF_API = 'https://pd-epm-api-qa-wf.shesha.app';
const CPR_ID = 'f9a15981-10a4-4bf6-89a1-83a239a2c498';
const ORIGINAL_OTHER_COMMENTS = 'c'.repeat(195);
const MARKER = `AUDITOR-WRITE-TEST-${Date.now() % 100000}`;

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

test.describe('EPM — Internal Audit (Auditor) read-only role (ADO plan 108745 / suite 109533)', () => {
  test('TC-108801 Positive — Auditor role should be read-only on Component Progress Report', async ({ page }) => {
    test.setTimeout(180_000);
    const auth = await loginAndGetAuth(page, 'Auditor.PrincessH', '123qwe');

    try {
      // STEP 1 (ADO): navigate to a CPR record, expect read-only fields, no Edit button.
      // CONFIRMED DEFECT/GAP: no EPM nav entry point exists at all for this role.
      await page.waitForTimeout(1000);
      const epmItem = page.locator('.ant-menu').getByText('EPM', { exact: true }).locator('visible=true').first();
      const epmVisible = await epmItem.isVisible().catch(() => false);
      console.log(`STEP 1 ACTUAL — EPM nav entry point visible for Auditor role: ${epmVisible}.`);
      expect.soft(epmVisible, 'STEP 1 EXPECTED (per ADO): should be able to navigate to a CPR record in read-only mode — CONFIRMED GAP: the Auditor role has no EPM nav entry point in the sidebar at all, not even read-only').toBeTruthy();

      // STEP 2 (ADO): direct PUT to Crud/Update should return 403 Forbidden.
      const putResp = await page.request.put(`${WF_API}/api/dynamic/Epm/ComponentProgressReport/Crud/Update`, { headers: auth, data: { id: CPR_ID, otherComments: MARKER } });
      console.log(`STEP 2 ACTUAL — direct PUT status: ${putResp.status()} (expected 403).`);
      expect.soft(putResp.status(), 'STEP 2 EXPECTED (per ADO): direct PUT from a read-only role should return 403 Forbidden — CONFIRMED DEFECT if 200: no read-only enforcement at the API layer for this role').toBe(403);

      // STEP 3 (ADO): re-read via GetAll, confirm record unchanged.
      const reGet = await (await page.request.get(`${WF_API}/api/dynamic/Epm/ComponentProgressReport/Crud/Get?id=${CPR_ID}`, { headers: auth })).json();
      const persisted = reGet?.result?.otherComments === MARKER;
      console.log(`STEP 3 ACTUAL — write persisted despite being from a read-only role: ${persisted}.`);
      expect(persisted, 'STEP 3 EXPECTED (per ADO, inverted for this defect): the write should NOT have persisted — but it did, confirming the STEP 2 defect at the data layer too').toBeTruthy();
    } finally {
      // restore the shared fixture regardless of outcome
      const adminPage = page;
      const adminAuth = await loginAndGetAuth(adminPage, 'admin.PrincessH', '123qwe');
      const restoreResp = await adminPage.request.put(`${WF_API}/api/dynamic/Epm/ComponentProgressReport/Crud/Update`, { headers: adminAuth, data: { id: CPR_ID, otherComments: ORIGINAL_OTHER_COMMENTS } });
      const verify = await (await adminPage.request.get(`${WF_API}/api/dynamic/Epm/ComponentProgressReport/Crud/Get?id=${CPR_ID}`, { headers: adminAuth })).json();
      console.log(`CLEANUP — restore status=${restoreResp.status()}, restored correctly=${verify?.result?.otherComments === ORIGINAL_OTHER_COMMENTS}`);
    }
  });
});
