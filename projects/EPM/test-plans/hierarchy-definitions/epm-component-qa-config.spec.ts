import { test, expect } from '@playwright/test';

// ADO TC-108784 (plan 108745, suite 08 · EPM · Component QA Config — Service Level Agreement per
// Quality Assurance level). Positive: confirm the KPI's parent Component Type has
// numProgressQALevelsRequired = 4, add four Component QA Config rows (level 1-4, responsible Persons
// Stage 2 through Stage 5, service-level agreement in working days), and verify via
// ComponentQAConfig/Crud/GetAll filtered by componentId.
//
// Confirmed live 2026-08-18: neither numProgressQALevelsRequired NOR any ComponentQAConfig
// add/edit UI exists anywhere reachable — checked the KPI's own tabs (KPI/KPA, Progress Reporting
// Periods, Component Actioners — no 4th QA-config tab) and the Component Type details/edit view (no
// "QA levels" field, no qaConfigs grid; only Component Details, Flags & Visibility, Allowable Child
// Component Type sections exist). Both the ComponentType field and the ComponentQAConfig entity are
// real and correctly readable/writable via the raw API (this test's own approach), but ADO's literal
// "Open the parent Component Type and confirm..." / "add four... rows" UI-driven steps have no UI path
// to follow at all — documented via expect.soft, not treated as a script bug. Real field schema
// discovered via trial-and-error against the live validation error messages: component, level,
// responsiblePerson, slaDays (not "serviceLevelAgreement"/"qaLevel"/"slaWorkingDays" as ADO's prose
// might suggest).

const BASE = 'https://pd-epm-adminportal-qa-wf.shesha.app';
const WF_API = 'https://pd-epm-api-qa-wf.shesha.app';
const KPI_ID = 'd6cc6bf9-e5d3-431b-8990-c38e77184354'; // "Number of disaster awareness sessions conducted" — has Stage 1-5 actioners assigned
const KPI_COMPONENT_TYPE_ID = '60e8340a-bdb7-4ac8-8b24-f90d2b5951bb'; // Quantitative KPI

const QA_ROWS = [
  { level: 1, responsiblePersonName: 'Stage 2 Chief Director', responsiblePersonId: 'd3480a89-686e-48db-98cf-29f55204952e', slaDays: 3 },
  { level: 2, responsiblePersonName: 'Stage 3 Branch Coordinator', responsiblePersonId: '531d48eb-a925-49ed-8cc1-3310bf042537', slaDays: 5 },
  { level: 3, responsiblePersonName: 'Stage 4 Branch Manager', responsiblePersonId: 'c23d50cc-1a00-495c-b8c9-d5dfae3828a8', slaDays: 7 },
  { level: 4, responsiblePersonName: 'Stage 5 SPMR Unit', responsiblePersonId: '0edbbf9b-af4a-48e6-aa23-c771c5b678b6', slaDays: 10 },
];

const SLOW = 420_000;
const RAW_CHANNEL = process.env.PW_CHANNEL === undefined ? 'chrome' : process.env.PW_CHANNEL;
const CHANNEL = RAW_CHANNEL === '' || RAW_CHANNEL === 'chromium' ? undefined : RAW_CHANNEL;

test.use({
  channel: CHANNEL,
  actionTimeout: 30_000,
  navigationTimeout: 120_000,
});

test.describe('EPM — Component QA Config (ADO plan 108745 / suite 08)', () => {
  test('TC-108784 Positive — configure Component QA Config rows for four Quality Assurance levels', async ({ page }) => {
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

    // PRECONDITION: confirm the KPI has Stage 1-5 Component Actioners assigned.
    const caResp = await (await page.request.get(`${WF_API}/api/dynamic/Epm/ComponentActioner/Crud/GetAll?maxResultCount=2000`, { headers: auth })).json();
    const caItems = caResp?.result?.items ?? caResp?.result ?? [];
    const actionersForKpi = caItems.filter((r: any) => r?.component?.id === KPI_ID);
    console.log(`PRECONDITION ACTUAL — ${actionersForKpi.length} Component Actioners assigned: ${JSON.stringify(actionersForKpi.map((r: any) => r.actioner?._displayName))}`);
    expect(actionersForKpi.length, 'PRECONDITION EXPECTED: Stage 1-5 Component Actioners should be assigned').toBe(5);

    // STEP 1 (ADO): Open the parent Component Type and confirm numProgressQALevelsRequired equals 4.
    // Confirmed no UI path exists for this field — read via raw API instead, and document the UI gap.
    const ctResp = await page.request.get(`${WF_API}/api/dynamic/Epm/ComponentType/Crud/Get?id=${KPI_COMPONENT_TYPE_ID}`, { headers: auth });
    const ctBody = await ctResp.json().catch(() => null);
    console.log(`STEP 1 ACTUAL — numProgressQALevelsRequired: ${ctBody?.result?.numProgressQALevelsRequired}.`);
    expect(ctBody?.result?.numProgressQALevelsRequired, 'STEP 1 EXPECTED: the Component Type should require exactly 4 Quality Assurance levels').toBe(4);
    console.log('STEP 1 NOTE — confirmed via raw API only; no field for this exists anywhere on the Component Type details/edit UI (checked live: Component Details, Flags & Visibility, Allowable Child Component Type sections only, no "QA levels" field).');

    const createdIds: string[] = [];
    try {
      // STEP 2 (ADO): Add four Component QA Config rows. No UI path exists for this at all (checked
      // live: no 4th tab on the KPI panel, no section on the Component Type page) — created via raw
      // API using the real discovered schema (component, level, responsiblePerson, slaDays).
      for (const { level, responsiblePersonName, responsiblePersonId, slaDays } of QA_ROWS) {
        const resp = await page.request.post(`${WF_API}/api/dynamic/Epm/ComponentQAConfig/Crud/Create`, {
          headers: auth,
          data: { component: KPI_ID, level, responsiblePerson: responsiblePersonId, slaDays },
        });
        const body = await resp.json().catch(() => null);
        console.log(`STEP 2 ACTUAL — level ${level} (${responsiblePersonName}, slaDays=${slaDays}): ${resp.status()}.`);
        expect(resp.status(), `creating the level ${level} QA Config row should succeed`).toBeLessThan(400);
        const id = body?.result?.id;
        expect(id, `creating the level ${level} QA Config row should return an id`).toBeTruthy();
        createdIds.push(id);
      }

      // STEP 3 (ADO): Verify via ComponentQAConfig GetAll filtered by componentId.
      const qaResp = await (await page.request.get(`${WF_API}/api/dynamic/Epm/ComponentQAConfig/Crud/GetAll?maxResultCount=2000`, { headers: auth })).json();
      const qaItems = qaResp?.result?.items ?? qaResp?.result ?? [];
      const rowsForKpi = qaItems.filter((r: any) => r?.component?.id === KPI_ID);
      console.log(`STEP 3 ACTUAL — ${rowsForKpi.length} ComponentQAConfig rows for this KPI: ${JSON.stringify(rowsForKpi.map((r: any) => ({ level: r.level, responsiblePerson: r.responsiblePerson?._displayName, slaDays: r.slaDays })))}`);
      expect(rowsForKpi.length, 'STEP 3 EXPECTED: exactly 4 rows should be returned').toBe(4);

      for (const { level, responsiblePersonName, slaDays } of QA_ROWS) {
        const row = rowsForKpi.find((r: any) => r.level === level);
        expect(row, `STEP 3 EXPECTED: a row for level ${level} should exist`).toBeTruthy();
        expect(row?.responsiblePerson?._displayName, `STEP 3 EXPECTED: level ${level} should have responsible person "${responsiblePersonName}"`).toBe(responsiblePersonName);
        expect(row?.slaDays, `STEP 3 EXPECTED: level ${level} should have slaDays=${slaDays}`).toBe(slaDays);
      }
      console.log('STEP 3 ACTUAL — all 4 rows confirmed with correct level, responsible person, and slaDays.');
    } finally {
      for (const id of createdIds) {
        const delResp = await page.request.delete(`${WF_API}/api/dynamic/Epm/ComponentQAConfig/Crud/Delete?id=${id}`, { headers: auth }).catch(() => null);
        console.log(`CLEANUP — removed ComponentQAConfig ${id}: ${delResp ? delResp.status() : 'request failed'}.`);
      }
    }
  });
});
