import { test, expect } from '@playwright/test';

// ADO TC-108829 (plan 108745, suite 08 · EPM · Component QA Config — Service Level Agreement per
// Quality Assurance level). Negative: enter slaDays = -5 (working days) — expect a validation error
// citing the field must be positive; confirm no ComponentQAConfig record persisted; retry with
// slaDays = 3 — expect success.
//
// Pure-API test — see epm-component-qa-config-no-ui memory: no UI exists anywhere for
// ComponentQAConfig, so this targets the raw endpoint directly, same as the ComponentActioner negative
// cases (TC-108826/828).

const BASE = 'https://pd-epm-adminportal-qa-wf.shesha.app';
const WF_API = 'https://pd-epm-api-qa-wf.shesha.app';
const KPI_ID = 'd6cc6bf9-e5d3-431b-8990-c38e77184354'; // "Number of disaster awareness sessions conducted"
const RESPONSIBLE_PERSON_ID = 'd3480a89-686e-48db-98cf-29f55204952e'; // "Stage 2 Chief Director"

const SLOW = 420_000;
const RAW_CHANNEL = process.env.PW_CHANNEL === undefined ? 'chrome' : process.env.PW_CHANNEL;
const CHANNEL = RAW_CHANNEL === '' || RAW_CHANNEL === 'chromium' ? undefined : RAW_CHANNEL;

test.use({
  channel: CHANNEL,
  actionTimeout: 30_000,
  navigationTimeout: 120_000,
});

test.describe('EPM — Component QA Config negative SLA (ADO plan 108745 / suite 08)', () => {
  test('TC-108829 Negative — negative slaDays should be rejected on Create', async ({ page }) => {
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

    const createdIds: string[] = [];
    try {
      const getAllBefore = await (await page.request.get(`${WF_API}/api/dynamic/Epm/ComponentQAConfig/Crud/GetAll?maxResultCount=2000`, { headers: auth })).json();
      const itemsBefore = getAllBefore?.result?.items ?? getAllBefore?.result ?? [];
      const countBefore = itemsBefore.filter((r: any) => r?.component?.id === KPI_ID).length;
      console.log(`PRECONDITION — baseline ComponentQAConfig count for this KPI: ${countBefore}.`);

      // STEP 1 (ADO): Enter slaDays = -5.
      const badResp = await page.request.post(`${WF_API}/api/dynamic/Epm/ComponentQAConfig/Crud/Create`, {
        headers: auth,
        data: { component: KPI_ID, level: 1, responsiblePerson: RESPONSIBLE_PERSON_ID, slaDays: -5 },
      });
      const badBody = await badResp.json().catch(() => null);
      console.log(`STEP 1 ACTUAL — Create with slaDays=-5: ${badResp.status()}. Body: ${JSON.stringify(badBody)}`);
      const rejected = badResp.status() >= 400;
      expect.soft(rejected, 'STEP 1 EXPECTED (per ADO): saving with slaDays=-5 should be rejected with a validation error citing the field must be positive — CONFIRMED DEFECT if 2xx: no validation exists on this field').toBeTruthy();
      if (!rejected && badBody?.result?.id) createdIds.push(badBody.result.id);

      // STEP 2 (ADO): Confirm no ComponentQAConfig record was persisted.
      const getAllAfterBad = await (await page.request.get(`${WF_API}/api/dynamic/Epm/ComponentQAConfig/Crud/GetAll?maxResultCount=2000`, { headers: auth })).json();
      const itemsAfterBad = getAllAfterBad?.result?.items ?? getAllAfterBad?.result ?? [];
      const countAfterBad = itemsAfterBad.filter((r: any) => r?.component?.id === KPI_ID).length;
      console.log(`STEP 2 ACTUAL — count after slaDays=-5 attempt: ${countAfterBad} (baseline was ${countBefore}).`);
      expect.soft(countAfterBad, 'STEP 2 EXPECTED (per ADO): the count should be unchanged after a rejected Create').toBe(countBefore);

      // STEP 3 (ADO): Retry with slaDays = 3. EXPECTED: the record is saved.
      const goodResp = await page.request.post(`${WF_API}/api/dynamic/Epm/ComponentQAConfig/Crud/Create`, {
        headers: auth,
        data: { component: KPI_ID, level: 1, responsiblePerson: RESPONSIBLE_PERSON_ID, slaDays: 3 },
      });
      const goodBody = await goodResp.json().catch(() => null);
      console.log(`STEP 3 ACTUAL — Create with slaDays=3: ${goodResp.status()}. Body: ${JSON.stringify(goodBody)}`);
      expect(goodResp.status(), 'STEP 3 EXPECTED: saving with a valid positive slaDays should succeed').toBeLessThan(400);
      const goodId = goodBody?.result?.id;
      expect(goodId, 'STEP 3 EXPECTED: a ComponentQAConfig id should be returned').toBeTruthy();
      expect(goodBody?.result?.slaDays, 'STEP 3 EXPECTED: the persisted slaDays should be 3').toBe(3);
      if (goodId) createdIds.push(goodId);
    } finally {
      for (const id of createdIds) {
        const delResp = await page.request.delete(`${WF_API}/api/dynamic/Epm/ComponentQAConfig/Crud/Delete?id=${id}`, { headers: auth }).catch(() => null);
        console.log(`CLEANUP — removed ComponentQAConfig ${id}: ${delResp ? delResp.status() : 'request failed'}.`);
      }
    }
  });
});
