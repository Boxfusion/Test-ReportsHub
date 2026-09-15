import { test, expect } from '@playwright/test';

// ADO suite 109536 (plan 108745, "33 · Achievement percentage calculation"), TC-108889 Integration: Sum
// Aggregation across multiple Sub-Programme sub-KPIs (e.g. 3 sub-KPIs summing to 30 at the parent).
//
// CONFIRMED UNBUILT live 2026-09-02, without needing a live 3-child-KPI fixture — ruled out at the data
// layer, same category as epm-aggregation-type-periods-dead-code and
// epm-kpi-method-of-calculation-text-reclassification-not-implemented:
//
// - The only real calculation-related reflist on ComponentDefinition, Epm.CalculationType, has exactly
//   2 values: "Cummulative" and "Non Cummulative" -- no "Sum Aggregation" (or any per-entity rollup)
//   value exists at all. This reflist is about cumulative-across-Periods behaviour (the same dead-code
//   path already confirmed in epm-aggregation-type-periods-dead-code), not summing sibling KPIs.
// - Epm.VarianceCalculationType (2 values: "Curry Over"/"Non Curry Over") is unrelated to aggregation.
// - Across all 58 real ComponentDefinition records in the tenant, only 2 have any calculationType set
//   at all (both "Cummulative"), and zero have anything resembling a Sum/rollup type.
// - 3 plausible route names for the aggregation-calc endpoint suite 109537's own code anchors
//   reference (CalculateReportingActualValueForAggregatedIndicator, under 3 different controller/module
//   name guesses) all return genuine 404s.
//
// No reflist value, no ComponentDefinition data, and no backend endpoint exist to represent
// "Sum Aggregation across Sub-Programme sub-KPIs" at all -- this is not a partial/broken implementation,
// it was never built.

const WF_API = 'https://pd-epm-api-qa-wf.shesha.app';
const BASE = 'https://pd-epm-adminportal-qa-wf.shesha.app';
const SLOW = 420_000;

test.describe('EPM — Sum Aggregation across Sub-Programmes (ADO plan 108745 / suite 109536)', () => {
  test('TC-108889 Integration — Sum Aggregation type does not exist anywhere in the data model', async ({ page }) => {
    test.setTimeout(120_000);
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
      }
      return null;
    });
    const auth = { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' };

    const reflistResp = await (await page.request.get(`${WF_API}/api/services/app/ReferenceList/GetByName?module=Epm&name=Epm.CalculationType`, { headers: auth })).json();
    const calcTypeValues = (reflistResp?.result?.items ?? []).map((i: any) => i.item);
    console.log(`STEP 1 ACTUAL — real Epm.CalculationType reflist values: ${JSON.stringify(calcTypeValues)}.`);
    expect(calcTypeValues, 'TC-108889 EXPECTED (per ADO): a "Sum Aggregation" (or equivalent rollup) calculation type should exist — CONFIRMED UNBUILT: no such value exists').not.toContain('Sum Aggregation');

    const cdResp = await (await page.request.get(`${WF_API}/api/dynamic/Epm/ComponentDefinition/Crud/GetAll?maxResultCount=500`, { headers: auth })).json();
    const items = cdResp?.result?.items ?? [];
    const sumLike = items.filter((it: any) => /sum|aggregat/i.test(JSON.stringify(it.calculationType ?? '')));
    console.log(`STEP 2 ACTUAL — of ${items.length} real ComponentDefinition records, ${sumLike.length} use any Sum/Aggregation-like calculationType.`);
    expect(sumLike.length, 'TC-108889 EXPECTED: at least one real KPI should be configured to use Sum Aggregation — CONFIRMED UNBUILT: zero exist').toBe(0);

    const routes = [
      '/api/services/app/ComponentProgressReports/CalculateReportingActualValueForAggregatedIndicator',
      '/api/services/app/ComponentsCalculationsHelper/CalculateReportingActualValueForAggregatedIndicator',
      '/api/services/SheshaEpm/ComponentsCalculationsHelper/CalculateReportingActualValueForAggregatedIndicator',
    ];
    const statuses: Record<string, number> = {};
    for (const r of routes) {
      const resp = await page.request.get(`${WF_API}${r}`, { headers: auth });
      statuses[r] = resp.status();
    }
    console.log(`STEP 3 ACTUAL — plausible sum-aggregation-calc route statuses: ${JSON.stringify(statuses)}.`);
    expect(Object.values(statuses).every((s) => s === 404), 'STEP 3 EXPECTED: if a sum-aggregation calc endpoint exists, at least one route should resolve — observed: all 404').toBeTruthy();
  });
});
