import { test, expect } from '@playwright/test';

// ADO TC-108828 (plan 108745, suite 07 · EPM · Component Actioner assignment). Integration: attempt to
// add the Stage 6 Person as a Component Actioner at actionLevel 70 (or any level). Per the case's own
// authoring standard, EITHER the app rejects this (preferred, matching the "Stages 1 to 5" scope this
// suite is named for) OR the record is created and must be surfaced as a defect — the case's own step
// 4 explicitly calls for filing an ADO Bug against the current build if accepted. This spec does NOT
// file that Bug automatically (creating a shared, visible ADO work item is a decision for the case
// owner, not something to automate) — it documents the outcome via expect.soft and reports back.
//
// Confirmed live 2026-08-18: "Stage 6 SPMR Director" (Person) exists and is genuinely appointed via
// ShaRoleAppointedPerson (role "SPMR Director"), matching the stated precondition exactly.

// The originally hardcoded COMPONENT_ID is now soft-deleted, and Princess's real KPI ("Percentage
// compliance...") no longer starts empty (5 real rows added by TC-108783 on 2026-08-31) — this spec now
// builds its own fresh, disposable KPI Component under Princess's real Executive Support node instead,
// cleaned up (component + all actioner rows) in a finally block.
const BASE = 'https://pd-epm-adminportal-qa-wf.shesha.app';
const WF_API = 'https://pd-epm-api-qa-wf.shesha.app';
const PRINCESS_REPORT_ID = 'bc34f55d-bb32-4629-bd74-3e03250e4784';
const EXECUTIVE_SUPPORT_ID = 'fe2ac1c3-0a4a-4c7e-983c-ca1282095e8f'; // real Sub Programme node under Princess
const QKPI_TYPE_ID = '60e8340a-bdb7-4ac8-8b24-f90d2b5951bb'; // real, shared "Quantitative KPI" Component Type
const STAGE6_PERSON_ID = '3b03d9ec-c891-48c4-be57-31489f8c43b7'; // "Stage 6 SPMR Director"
const STAGE_1_TO_5 = [
  { name: 'Stage 1 Process Owner', id: '0df05401-6802-4242-9d65-949924970db6', level: 20 },
  { name: 'Stage 2 Chief Director', id: 'd3480a89-686e-48db-98cf-29f55204952e', level: 30 },
  { name: 'Stage 3 Branch Coordinator', id: '531d48eb-a925-49ed-8cc1-3310bf042537', level: 40 },
  { name: 'Stage 4 Branch Manager', id: 'c23d50cc-1a00-495c-b8c9-d5dfae3828a8', level: 50 },
  { name: 'Stage 5 SPMR Unit', id: '0edbbf9b-af4a-48e6-aa23-c771c5b678b6', level: 60 },
];

const SLOW = 420_000;
const RAW_CHANNEL = process.env.PW_CHANNEL === undefined ? 'chrome' : process.env.PW_CHANNEL;
const CHANNEL = RAW_CHANNEL === '' || RAW_CHANNEL === 'chromium' ? undefined : RAW_CHANNEL;

test.use({
  channel: CHANNEL,
  actionTimeout: 30_000,
  navigationTimeout: 120_000,
});

test.describe('EPM — Component Actioner Stage 6 rejection (ADO plan 108745 / suite 07)', () => {
  test('TC-108828 Integration — assigning Stage 6 as a Component Actioner should be rejected', async ({ page }) => {
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

    let disposableKpiId: string | null = null;
    const createdIds: string[] = [];
    try {
      // Setup (not the graded claim): build a fresh, disposable Quantitative KPI Component under
      // Princess's real Executive Support node, guaranteed to start with zero actioner rows.
      const kpiResp = await page.request.post(`${WF_API}/api/dynamic/Epm/Component/Crud/Create`, {
        headers: auth,
        data: {
          name: `TC108828 Stage6 Probe ${Date.now().toString().slice(-6)}`,
          componentType: { id: QKPI_TYPE_ID },
          performanceReport: { id: PRINCESS_REPORT_ID },
          parent: { id: EXECUTIVE_SUPPORT_ID },
        },
      });
      expect(kpiResp.status(), 'setup: creating the disposable KPI should succeed').toBeLessThan(400);
      disposableKpiId = (await kpiResp.json().catch(() => null))?.result?.id ?? null;
      expect(disposableKpiId, 'setup: a disposable KPI id should be returned').toBeTruthy();
      const COMPONENT_ID = disposableKpiId!;
      console.log(`Setup — created disposable KPI Component (id ${COMPONENT_ID}).`);

      // PRECONDITION: seed a clean Stages 1-5 baseline on the fresh Component (zero existing rows, by construction).
      for (const { name, id, level } of STAGE_1_TO_5) {
        const resp = await page.request.post(`${WF_API}/api/dynamic/Epm/ComponentActioner/Crud/Create`, {
          headers: auth,
          data: { component: COMPONENT_ID, actioner: id, actionLevel: level },
        });
        const body = await resp.json().catch(() => null);
        console.log(`PRECONDITION — seeded ${name}@${level}: ${resp.status()}.`);
        expect(resp.status(), `seeding ${name} should succeed`).toBeLessThan(400);
        createdIds.push(body?.result?.id);
      }

      // STEP 1 (ADO): Attempt to add the Stage 6 Person as a Component Actioner at actionLevel 70.
      const stage6Resp = await page.request.post(`${WF_API}/api/dynamic/Epm/ComponentActioner/Crud/Create`, {
        headers: auth,
        data: { component: COMPONENT_ID, actioner: STAGE6_PERSON_ID, actionLevel: 70 },
      });
      const stage6Body = await stage6Resp.json().catch(() => null);
      console.log(`STEP 1 ACTUAL — Create for Stage 6 Person at actionLevel 70: ${stage6Resp.status()}. Body: ${JSON.stringify(stage6Body)}`);
      const rejected = stage6Resp.status() >= 400;

      expect.soft(rejected, 'STEP 1 EXPECTED (per ADO, preferred outcome): assigning the Stage 6 Person as a Component Actioner should be rejected — if false, per the case\'s own authoring standard this must be surfaced as a defect (ADO step 4 explicitly calls for filing a Bug against the current build; NOT done automatically here — reported back to the case owner instead)').toBeTruthy();

      if (!rejected && stage6Body?.result?.id) {
        createdIds.push(stage6Body.result.id);
      }

      // STEP 2/3 (ADO): Confirm via GetAll whether exactly 5 rows exist (Stages 1-5 only, rejected) or
      // 6 (Stage 6 also accepted — confirmed defect).
      const getAllAfter = await (await page.request.get(`${WF_API}/api/dynamic/Epm/ComponentActioner/Crud/GetAll?maxResultCount=2000`, { headers: auth })).json();
      const itemsAfter = getAllAfter?.result?.items ?? getAllAfter?.result ?? [];
      const rowsForComponent = itemsAfter.filter((r: any) => r?.component?.id === COMPONENT_ID);
      console.log(`STEP 2/3 ACTUAL — ${rowsForComponent.length} rows for this Component: ${JSON.stringify(rowsForComponent.map((r: any) => ({ actioner: r.actioner?._displayName, level: r.actionLevel })))}`);
      const stage6RowExists = rowsForComponent.some((r: any) => r?.actioner?.id === STAGE6_PERSON_ID);
      console.log(`STEP 2/3 ACTUAL — a Stage 6 row exists for this Component: ${stage6RowExists}.`);

      expect.soft(rowsForComponent.length, 'STEP 2 EXPECTED (if rejected): GetAll should return exactly 5 rows for the Component (Stages 1-5 only)').toBe(5);
      expect.soft(stage6RowExists, 'STEP 2 EXPECTED (if rejected): no Component Actioner row should exist for the Stage 6 Person').toBeFalsy();
    } finally {
      for (const id of createdIds) {
        if (!id) continue;
        const delResp = await page.request.delete(`${WF_API}/api/dynamic/Epm/ComponentActioner/Crud/Delete?id=${id}`, { headers: auth }).catch(() => null);
        console.log(`CLEANUP — removed ComponentActioner ${id}: ${delResp ? delResp.status() : 'request failed'}.`);
      }
      if (disposableKpiId) {
        const kpiCleanup = await page.request.delete(`${WF_API}/api/dynamic/Epm/Component/Crud/Delete?id=${disposableKpiId}`, { headers: auth }).catch(() => null);
        console.log(`CLEANUP — removed disposable KPI Component ${disposableKpiId}: ${kpiCleanup ? kpiCleanup.status() : 'request failed'}.`);
      }
    }
  });
});
