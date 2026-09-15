import { test, expect } from '@playwright/test';

// ADO TC-108831 (plan 108745, suite 08 · EPM · Component QA Config — Service Level Agreement per
// Quality Assurance level). Integration: precondition — a KPI Component Type has
// numProgressQALevelsRequired = 4. Verify every KPI of that type has exactly 4 ComponentQAConfig rows
// (levels 1-4). Change numProgressQALevelsRequired to 5. Confirm the workflow now requires an
// additional level-5 row before Publish succeeds (per ADO: ValidateReadyToPublishAsync should report
// the missing row).
//
// Confirmed live 2026-08-18, via raw-API investigation (no UI exists for ComponentQAConfig at all —
// see epm-component-qa-config-no-ui memory):
// - 0 of the 6 live "Quantitative KPI" Components have ANY ComponentQAConfig rows at all (tenant-wide
//   ComponentQAConfig count is 0 outside this session's own disposable test writes). Step 1's
//   precondition ("four rows exist per KPI") is false for every real KPI right now — a direct
//   consequence of ComponentQAConfig having no UI to populate it in ordinary use.
// - No `ComponentType/Crud/Publish`, `.../ComponentType/Publish`, or
//   `.../ComponentType/ValidateReadyToPublish` endpoint exists at all (every variant probed returns
//   404 on both GET and POST). ADO's "ValidateReadyToPublishAsync" gate is not reachable through any
//   discoverable API surface — there is no Publish concept for ComponentType in this system at all,
//   unlike PerformanceReport/PerformanceReportTemplate which do have real Publish endpoints.

const BASE = 'https://pd-epm-adminportal-qa-wf.shesha.app';
const WF_API = 'https://pd-epm-api-qa-wf.shesha.app';
const KPI_COMPONENT_TYPE_ID = '60e8340a-bdb7-4ac8-8b24-f90d2b5951bb'; // "Quantitative KPI"

const SLOW = 420_000;
const RAW_CHANNEL = process.env.PW_CHANNEL === undefined ? 'chrome' : process.env.PW_CHANNEL;
const CHANNEL = RAW_CHANNEL === '' || RAW_CHANNEL === 'chromium' ? undefined : RAW_CHANNEL;

test.use({
  channel: CHANNEL,
  actionTimeout: 30_000,
  navigationTimeout: 120_000,
});

test.describe('EPM — Component QA Config level count integration (ADO plan 108745 / suite 08)', () => {
  test('TC-108831 Integration — numProgressQALevelsRequired should align with four ComponentQAConfig rows per KPI', async ({ page }) => {
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

    // PRECONDITION (ADO): the KPI Component Type has numProgressQALevelsRequired = 4.
    const ctBefore = await (await page.request.get(`${WF_API}/api/dynamic/Epm/ComponentType/Crud/Get?id=${KPI_COMPONENT_TYPE_ID}`, { headers: auth })).json();
    console.log(`PRECONDITION ACTUAL — numProgressQALevelsRequired: ${ctBefore?.result?.numProgressQALevelsRequired}.`);
    expect(ctBefore?.result?.numProgressQALevelsRequired, 'PRECONDITION EXPECTED: the Component Type should require exactly 4 QA levels').toBe(4);

    let levelsChanged = false;
    try {
      // STEP 1 (ADO): Verify ComponentQAConfig GetAll returns exactly four rows for each KPI using
      // this Component Type.
      const compResp = await (await page.request.get(`${WF_API}/api/dynamic/Epm/Component/Crud/GetAll?maxResultCount=2000`, { headers: auth })).json();
      const comps = compResp?.result?.items ?? [];
      const kpisOfType = comps.filter((r: any) => r?.componentType?.id === KPI_COMPONENT_TYPE_ID);
      console.log(`STEP 1 ACTUAL — ${kpisOfType.length} live Components of type "Quantitative KPI".`);

      const qaResp = await (await page.request.get(`${WF_API}/api/dynamic/Epm/ComponentQAConfig/Crud/GetAll?maxResultCount=2000`, { headers: auth })).json();
      const qaItems = qaResp?.result?.items ?? [];
      const counts: Record<string, number> = {};
      for (const r of qaItems) {
        const cid = r?.component?.id;
        if (cid) counts[cid] = (counts[cid] ?? 0) + 1;
      }
      const kpiCounts = kpisOfType.map((k: any) => ({ id: k.id, name: k._displayName, qaConfigCount: counts[k.id] ?? 0 }));
      console.log(`STEP 1 ACTUAL — ComponentQAConfig row counts per KPI: ${JSON.stringify(kpiCounts)}`);
      for (const { name, qaConfigCount } of kpiCounts) {
        expect.soft(qaConfigCount, `STEP 1 EXPECTED (per ADO): KPI "${name}" should have exactly 4 ComponentQAConfig rows (levels 1-4) — CONFIRMED GAP if 0: ComponentQAConfig is never populated in ordinary use, since it has no UI surface at all`).toBe(4);
      }

      // STEP 2 (ADO): Change numProgressQALevelsRequired on the Component Type to 5.
      const updateResp = await page.request.put(`${WF_API}/api/dynamic/Epm/ComponentType/Crud/Update`, {
        headers: auth,
        data: { id: KPI_COMPONENT_TYPE_ID, numProgressQALevelsRequired: 5 },
      });
      const updateBody = await updateResp.json().catch(() => null);
      console.log(`STEP 2 ACTUAL — update numProgressQALevelsRequired to 5: ${updateResp.status()}. Body: ${JSON.stringify(updateBody)}`);
      expect(updateResp.status(), 'STEP 2 EXPECTED: the Component Type update should save').toBeLessThan(400);
      levelsChanged = true;
      const ctAfter = await (await page.request.get(`${WF_API}/api/dynamic/Epm/ComponentType/Crud/Get?id=${KPI_COMPONENT_TYPE_ID}`, { headers: auth })).json();
      expect(ctAfter?.result?.numProgressQALevelsRequired, 'STEP 2 EXPECTED: the persisted value should read back as 5').toBe(5);

      // STEP 3 (ADO): Confirm the workflow now requires an additional Component QA Config level 5
      // row before Publish succeeds — ValidateReadyToPublishAsync should report the missing row.
      // No Publish/ValidateReadyToPublish endpoint exists for ComponentType at all (see class-level
      // comment) — probing every discoverable variant.
      const publishAttempts = [
        { method: 'GET', url: `${WF_API}/api/dynamic/Epm/ComponentType/Crud/Publish?id=${KPI_COMPONENT_TYPE_ID}` },
        { method: 'POST', url: `${WF_API}/api/dynamic/Epm/ComponentType/Crud/Publish?id=${KPI_COMPONENT_TYPE_ID}` },
        { method: 'GET', url: `${WF_API}/api/services/app/ComponentType/Publish?id=${KPI_COMPONENT_TYPE_ID}` },
        { method: 'POST', url: `${WF_API}/api/services/app/ComponentType/Publish?id=${KPI_COMPONENT_TYPE_ID}` },
        { method: 'GET', url: `${WF_API}/api/services/app/ComponentType/ValidateReadyToPublish?id=${KPI_COMPONENT_TYPE_ID}` },
        { method: 'POST', url: `${WF_API}/api/services/app/ComponentType/ValidateReadyToPublish?id=${KPI_COMPONENT_TYPE_ID}` },
      ];
      let foundPublishGate = false;
      for (const { method, url } of publishAttempts) {
        const resp = method === 'GET'
          ? await page.request.get(url, { headers: auth }).catch(() => null)
          : await page.request.post(url, { headers: auth }).catch(() => null);
        const status = resp ? resp.status() : -1;
        console.log(`STEP 3 ACTUAL — ${method} ${url} -> ${status}.`);
        if (status !== 404 && status !== -1) foundPublishGate = true;
      }
      expect.soft(foundPublishGate, 'STEP 3 EXPECTED (per ADO): a Publish/ValidateReadyToPublishAsync gate should exist for ComponentType and report the missing level-5 row — CONFIRMED GAP if none found: no such Publish concept is reachable for ComponentType at all in this API').toBeTruthy();
    } finally {
      if (levelsChanged) {
        const revertResp = await page.request.put(`${WF_API}/api/dynamic/Epm/ComponentType/Crud/Update`, {
          headers: auth,
          data: { id: KPI_COMPONENT_TYPE_ID, numProgressQALevelsRequired: 4 },
        }).catch(() => null);
        console.log(`CLEANUP — reverted numProgressQALevelsRequired to 4: ${revertResp ? revertResp.status() : 'request failed'}.`);
      }
    }
  });
});
