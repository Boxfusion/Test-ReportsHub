import { test, expect } from '@playwright/test';

// ADO TC-108832 (plan 108745, suite 109512 · EPM/Shesha · Reject Sha Role appointment when the Sha
// Role does not exist). Negative: POST ShaRoleAppointedPerson/Crud/Create with a roleId that isn't in
// the Sha Role catalogue — expect a foreign-key/not-found error, no row persisted; retry with a valid
// role id — expect success.
//
// Pure-API test — same disposable-write pattern as the ComponentActioner/ComponentQAConfig negative
// cases (TC-108826/829). Uses "Stage 5 SPMR Unit" (id 0edbbf9b-...) as the Person, since it has no
// pre-existing ShaRoleAppointedPerson rows for the "SPMR Director" role — see epm-sha-role-appointment
// memory for why Stage 5, not Stage 6, is the real live final-approver Person in this tenant.

const BASE = 'https://pd-epm-adminportal-qa-wf.shesha.app';
const WF_API = 'https://pd-epm-api-qa-wf.shesha.app';
const STAGE5_PERSON_ID = '0edbbf9b-af4a-48e6-aa23-c771c5b678b6'; // "Stage 5 SPMR Unit"
const SPMR_DIRECTOR_ROLE_ID = '5c07cd31-1ab8-4028-b897-e7e1c06c14d4'; // real role in the Sha Role catalogue
const NONEXISTENT_ROLE_ID = '00000000-0000-0000-0000-000000000000'; // not in the Sha Role catalogue

const SLOW = 420_000;
const RAW_CHANNEL = process.env.PW_CHANNEL === undefined ? 'chrome' : process.env.PW_CHANNEL;
const CHANNEL = RAW_CHANNEL === '' || RAW_CHANNEL === 'chromium' ? undefined : RAW_CHANNEL;

test.use({
  channel: CHANNEL,
  actionTimeout: 30_000,
  navigationTimeout: 120_000,
});

test.describe('EPM/Shesha — Sha Role appointment invalid role (ADO plan 108745 / suite 109512)', () => {
  test('TC-108832 Negative — appointing a nonexistent Sha Role should be rejected', async ({ page }) => {
    test.setTimeout(300_000);

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

    // PRECONDITION (ADO): confirm the nonexistent roleId genuinely isn't in the Sha Role catalogue.
    const roleCheckResp = await page.request.get(`${WF_API}/api/dynamic/Shesha/ShaRole/Crud/Get?id=${NONEXISTENT_ROLE_ID}`, { headers: auth });
    console.log(`PRECONDITION ACTUAL — GET ShaRole/Crud/Get for the nonexistent id: ${roleCheckResp.status()}.`);
    expect(roleCheckResp.status(), 'PRECONDITION EXPECTED: the chosen roleId should genuinely not exist in the catalogue').toBeGreaterThanOrEqual(400);

    const createdIds: string[] = [];
    try {
      const getAllBefore = await (await page.request.get(`${WF_API}/api/dynamic/Shesha/ShaRoleAppointedPerson/Crud/GetAll?maxResultCount=2000`, { headers: auth })).json();
      const itemsBefore = getAllBefore?.result?.items ?? [];
      const countBefore = itemsBefore.filter((r: any) => r?.person?.id === STAGE5_PERSON_ID).length;
      console.log(`PRECONDITION ACTUAL — baseline ShaRoleAppointedPerson count for this Person: ${countBefore}.`);

      // STEP 1 (ADO): Create with a roleId that does not exist in the Sha Role catalogue.
      const badResp = await page.request.post(`${WF_API}/api/dynamic/Shesha/ShaRoleAppointedPerson/Crud/Create`, {
        headers: auth,
        data: { person: STAGE5_PERSON_ID, role: NONEXISTENT_ROLE_ID },
      });
      const badBody = await badResp.json().catch(() => null);
      console.log(`STEP 1 ACTUAL — Create with a nonexistent roleId: ${badResp.status()}. Body: ${JSON.stringify(badBody)}`);
      const rejected = badResp.status() >= 400;
      expect.soft(rejected, 'STEP 1 EXPECTED (per ADO): the response should return a foreign-key/not-found error citing the invalid role identifier — CONFIRMED DEFECT if 2xx: no referential-integrity check exists on this field').toBeTruthy();
      if (!rejected && badBody?.result?.id) createdIds.push(badBody.result.id);

      // STEP 2 (ADO): Confirm no ShaRoleAppointedPerson row was created.
      const getAllAfterBad = await (await page.request.get(`${WF_API}/api/dynamic/Shesha/ShaRoleAppointedPerson/Crud/GetAll?maxResultCount=2000`, { headers: auth })).json();
      const itemsAfterBad = getAllAfterBad?.result?.items ?? [];
      const countAfterBad = itemsAfterBad.filter((r: any) => r?.person?.id === STAGE5_PERSON_ID).length;
      console.log(`STEP 2 ACTUAL — count after the nonexistent-role attempt: ${countAfterBad} (baseline was ${countBefore}).`);
      expect.soft(countAfterBad, 'STEP 2 EXPECTED (per ADO): the count should be unchanged after a rejected Create').toBe(countBefore);

      // STEP 3 (ADO): Retry with a valid Sha Role identifier.
      const goodResp = await page.request.post(`${WF_API}/api/dynamic/Shesha/ShaRoleAppointedPerson/Crud/Create`, {
        headers: auth,
        data: { person: STAGE5_PERSON_ID, role: SPMR_DIRECTOR_ROLE_ID },
      });
      const goodBody = await goodResp.json().catch(() => null);
      console.log(`STEP 3 ACTUAL — Create with a valid roleId: ${goodResp.status()}. Body: ${JSON.stringify(goodBody)}`);
      expect(goodResp.status(), 'STEP 3 EXPECTED: creating with a valid Sha Role should succeed').toBeLessThan(400);
      const goodId = goodBody?.result?.id;
      expect(goodId, 'STEP 3 EXPECTED: a ShaRoleAppointedPerson id should be returned').toBeTruthy();
      if (goodId) createdIds.push(goodId);
    } finally {
      for (const id of createdIds) {
        const delResp = await page.request.delete(`${WF_API}/api/dynamic/Shesha/ShaRoleAppointedPerson/Crud/Delete?id=${id}`, { headers: auth }).catch(() => null);
        console.log(`CLEANUP — removed ShaRoleAppointedPerson ${id}: ${delResp ? delResp.status() : 'request failed'}.`);
      }
    }
  });
});
