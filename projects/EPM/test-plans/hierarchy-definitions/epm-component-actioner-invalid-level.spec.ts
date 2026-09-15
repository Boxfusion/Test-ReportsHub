import { test, expect } from '@playwright/test';

// ADO TC-108826 (plan 108745, suite 07 · EPM · Component Actioner assignment). Negative: POST
// /api/dynamic/Epm/ComponentActioner/Crud/Create with actionLevel = 100 (not in the reflist
// Epm.NodeProgressReportStatus) — expect a validation error citing an invalid reflist value; confirm no
// record persisted; retry with actionLevel = 20 — expect success for Stage 1 Process Owner.
//
// This is a pure API test (ADO's own steps are POST/GetAll, no UI involved). Confirmed live 2026-08-18
// via ReferenceList/GetAll that "Epm.NodeProgressReportStatus" is a real reflist (several versions
// exist) — the same reflist whose display labels ("Draft", "Received", "Awaiting Level One QA", ...)
// appeared in the "Actioner Level" dropdown when investigating TC-108783. This test's actionLevel=20
// retry directly settles whether that dropdown's apparent mismatch is a genuine defect or just a
// text-label-vs-raw-integer UI display difference — if the raw API accepts 20 as a valid actionLevel,
// the underlying reflist item values do include 20/30/40/50/60 even though their display TEXT looked
// unrelated.

const BASE = 'https://pd-epm-adminportal-qa-wf.shesha.app';
const WF_API = 'https://pd-epm-api-qa-wf.shesha.app';
const KPI_ID = 'd6cc6bf9-e5d3-431b-8990-c38e77184354'; // "Number of disaster awareness sessions conducted"
const ACTIONER_ID = '0df05401-6802-4242-9d65-949924970db6'; // "Stage 1 Process Owner"

const SLOW = 420_000;
const RAW_CHANNEL = process.env.PW_CHANNEL === undefined ? 'chrome' : process.env.PW_CHANNEL;
const CHANNEL = RAW_CHANNEL === '' || RAW_CHANNEL === 'chromium' ? undefined : RAW_CHANNEL;

test.use({
  channel: CHANNEL,
  actionTimeout: 30_000,
  navigationTimeout: 120_000,
});

test.describe('EPM — Component Actioner invalid actionLevel (ADO plan 108745 / suite 07)', () => {
  test('TC-108826 Negative — actionLevel not in the reflist should be rejected on Create', async ({ page }) => {
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

    // PRECONDITION: confirm the KPI Component exists and capture the baseline count.
    const getAllBefore = await (await page.request.get(`${WF_API}/api/dynamic/Epm/ComponentActioner/Crud/GetAll?maxResultCount=2000`, { headers: auth })).json();
    const itemsBefore = getAllBefore?.result?.items ?? getAllBefore?.result ?? [];
    const countBefore = itemsBefore.filter((r: any) => r?.component?.id === KPI_ID).length;
    console.log(`PRECONDITION — baseline ComponentActioner count for this KPI: ${countBefore}.`);

    // STEP 1 (ADO): POST Create with actionLevel = 100.
    const badCreateResp = await page.request.post(`${WF_API}/api/dynamic/Epm/ComponentActioner/Crud/Create`, {
      headers: auth,
      data: { component: KPI_ID, actioner: ACTIONER_ID, actionLevel: 100 },
    });
    const badBody = await badCreateResp.json().catch(() => null);
    console.log(`STEP 1 ACTUAL — Create with actionLevel=100: ${badCreateResp.status()}. Body: ${JSON.stringify(badBody)}`);
    const rejected = badCreateResp.status() >= 400;
    expect.soft(rejected, 'STEP 1 EXPECTED (per ADO): Create with actionLevel=100 should return a validation error citing an invalid reflist value — CONFIRMED DEFECT if 2xx: the field accepts an out-of-reflist integer with no validation at all').toBeTruthy();

    // STEP 2 (ADO): Confirm no ComponentActioner record was persisted.
    const getAllAfterBad = await (await page.request.get(`${WF_API}/api/dynamic/Epm/ComponentActioner/Crud/GetAll?maxResultCount=2000`, { headers: auth })).json();
    const itemsAfterBad = getAllAfterBad?.result?.items ?? getAllAfterBad?.result ?? [];
    const countAfterBad = itemsAfterBad.filter((r: any) => r?.component?.id === KPI_ID).length;
    console.log(`STEP 2 ACTUAL — count after actionLevel=100 attempt: ${countAfterBad} (baseline was ${countBefore}).`);
    expect.soft(countAfterBad, 'STEP 2 EXPECTED (per ADO): the count should be unchanged after a rejected Create').toBe(countBefore);
    // If it was actually created despite the "rejection" not registering as an HTTP error, clean it up.
    if (!rejected && badBody?.result?.id) {
      await page.request.delete(`${WF_API}/api/dynamic/Epm/ComponentActioner/Crud/Delete?id=${badBody.result.id}`, { headers: auth }).catch(() => null);
      console.log(`  cleaned up the unexpectedly-created actionLevel=100 row (id ${badBody.result.id}).`);
    }

    // STEP 3 (ADO): Retry with actionLevel = 20. EXPECTED: created for Stage 1 Process Owner.
    const goodCreateResp = await page.request.post(`${WF_API}/api/dynamic/Epm/ComponentActioner/Crud/Create`, {
      headers: auth,
      data: { component: KPI_ID, actioner: ACTIONER_ID, actionLevel: 20 },
    });
    const goodBody = await goodCreateResp.json().catch(() => null);
    console.log(`STEP 3 ACTUAL — Create with actionLevel=20: ${goodCreateResp.status()}. Body: ${JSON.stringify(goodBody)}`);
    expect(goodCreateResp.status(), 'STEP 3 EXPECTED: Create with actionLevel=20 should succeed').toBeLessThan(400);
    const createdId = goodBody?.result?.id;
    expect(createdId, 'STEP 3 EXPECTED: a ComponentActioner id should be returned').toBeTruthy();
    expect(goodBody?.result?.actionLevel, 'STEP 3 EXPECTED: the persisted actionLevel should be 20 (not null/coerced)').toBe(20);
    expect(goodBody?.result?.actioner?.id ?? goodBody?.result?.actioner, 'STEP 3 EXPECTED: the persisted actioner should be Stage 1 Process Owner').toBe(ACTIONER_ID);

    // Cleanup the successfully-created row so this KPI's tab returns to its baseline state.
    if (createdId) {
      const delResp = await page.request.delete(`${WF_API}/api/dynamic/Epm/ComponentActioner/Crud/Delete?id=${createdId}`, { headers: auth }).catch(() => null);
      console.log(`CLEANUP — removed the actionLevel=20 test row (id ${createdId}): ${delResp ? delResp.status() : 'request failed'}.`);
    }
  });
});
