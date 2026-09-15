import { test, expect } from '@playwright/test';

// ADO TC-108836 (plan 108745, suite 10 · EPM · Publish Performance Report — validation gate and
// confirm dialog, User Interface only). Edge: precondition — a Performance Report has 100 KPIs in the
// Reporting Tree. Click Publish, measure time to completion toast — expect within a reasonable SLA
// (e.g. under 30s); verify every KPI has ComponentProgressReport rows for all 4 quarters (400 rows
// total); confirm no timeout error.
//
// Same from-scratch disposable-report recipe as TC-108786/108835 (see
// epm-performance-report-publish-confirm-dialog memory) — template "Standard Annual Performance Plan"
// + "Financial Year 2026/27" period (4 Quarter child periods, matching the 4x expectation), a
// Department root, then 100 Quantitative KPI children each with a real Annual Target and
// ComponentActioner rows Stages 1-5 with correct actionLevel values set directly via API.

const BASE = 'https://pd-epm-adminportal-qa-wf.shesha.app';
const WF_API = 'https://pd-epm-api-qa-wf.shesha.app';
const TEMPLATE_ID = '77a75071-5385-4ae7-bb5e-42cc4619ee87'; // Standard Annual Performance Plan
const PERIOD_ID = '8062531f-2326-4fc7-8ea3-582d11bcdcb1'; // Financial Year 2026/27 (4 quarters)
const DEPARTMENT_TYPE_ID = 'f1ec68a8-ea98-41eb-9080-ea969ed89fd0';
const KPI_TYPE_ID = '60e8340a-bdb7-4ac8-8b24-f90d2b5951bb';
const KPI_COUNT = 100;

const STAGE_PERSONS = [
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

test.describe('EPM — Performance Report publish with 100 KPIs (ADO plan 108745 / suite 10)', () => {
  test('TC-108836 Edge — Publish with 100 KPIs completes within a reasonable time', async ({ page }) => {
    test.setTimeout(900_000);

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

    // PRECONDITION (ADO): a fresh, disposable report with 100 KPIs.
    const suffix = `${Date.now()}`.slice(-8);
    const createReportResp = await page.request.post(`${WF_API}/api/v1/Epm/PerformanceReports/CreatePerformanceReport`, {
      headers: auth,
      data: {
        name: `TC-108836 100-KPI Test Report ${suffix}`,
        shortName: `TC108836-${suffix}`,
        templateId: TEMPLATE_ID,
        periodCoveredId: PERIOD_ID,
      },
    });
    const createReportBody = await createReportResp.json().catch(() => null);
    console.log(`PRECONDITION ACTUAL — CreatePerformanceReport: ${createReportResp.status()}.`);
    expect(createReportResp.status(), 'PRECONDITION EXPECTED: the disposable report should be creatable').toBeLessThan(400);
    const reportId = createReportBody?.result?.id;

    const rootResp = await page.request.post(`${WF_API}/api/dynamic/Epm/Component/Crud/Create`, {
      headers: auth,
      data: { name: 'Fresh Test Department', componentType: DEPARTMENT_TYPE_ID, performanceReport: reportId, parent: null },
    });
    const rootBody = await rootResp.json().catch(() => null);
    expect(rootResp.status(), 'PRECONDITION EXPECTED: the root Department should be creatable').toBeLessThan(400);
    const rootId = rootBody?.result?.id;

    console.log(`PRECONDITION — building ${KPI_COUNT} KPIs, each with an Annual Target and 5 actioners...`);
    const buildStart = Date.now();
    for (let i = 0; i < KPI_COUNT; i++) {
      const kpiResp = await page.request.post(`${WF_API}/api/dynamic/Epm/Component/Crud/Create`, {
        headers: auth,
        data: {
          name: `100-KPI Test ${i + 1}`,
          componentType: KPI_TYPE_ID,
          performanceReport: reportId,
          parent: rootId,
          finalIndicatorTarget: 100,
          finalIndicatorTargetText: '100',
        },
      });
      const kpiBody = await kpiResp.json().catch(() => null);
      const kpiId = kpiBody?.result?.id;
      if (kpiResp.status() >= 400 || !kpiId) {
        console.log(`PRECONDITION — KPI ${i + 1} creation failed: ${kpiResp.status()} ${JSON.stringify(kpiBody)}`);
        continue;
      }
      for (const s of STAGE_PERSONS) {
        await page.request.post(`${WF_API}/api/dynamic/Epm/ComponentActioner/Crud/Create`, {
          headers: auth,
          data: { component: kpiId, actioner: s.id, actionLevel: s.level },
        });
      }
      if ((i + 1) % 20 === 0) console.log(`PRECONDITION — built ${i + 1}/${KPI_COUNT} KPIs so far...`);
    }
    console.log(`PRECONDITION ACTUAL — tree build took ${((Date.now() - buildStart) / 1000).toFixed(1)}s for ${KPI_COUNT} KPIs.`);

    const compResp = await (await page.request.get(`${WF_API}/api/dynamic/Epm/Component/Crud/GetAll?maxResultCount=2000`, { headers: auth })).json();
    const kpiCountActual = (compResp?.result?.items ?? []).filter((c: any) => c?.performanceReport?.id === reportId && c?.componentType?.id === KPI_TYPE_ID).length;
    console.log(`PRECONDITION ACTUAL — KPIs actually present in the tree: ${kpiCountActual}.`);
    expect(kpiCountActual, 'PRECONDITION EXPECTED: exactly 100 KPIs should exist in the tree').toBe(KPI_COUNT);

    // STEP 1 (ADO): Click Publish. Measure time from confirm to completion toast.
    await page.goto(`${BASE}/dynamic/Epm/performance-report-details-view?id=${reportId}`, { waitUntil: 'domcontentloaded' });
    await expect(page.getByText(`Performance Report: TC-108836 100-KPI Test Report ${suffix}`, { exact: true })).toBeVisible({ timeout: SLOW });

    const publishBtn = page.locator('button', { hasText: 'Publish Performance Report' }).first();
    await expect(publishBtn).toBeVisible({ timeout: 30_000 });

    const publishStart = Date.now();
    await publishBtn.click();
    const toastText = await page.locator('.ant-message, .ant-notification').first().innerText({ timeout: 60_000 }).catch(() => '');
    const publishDurationMs = Date.now() - publishStart;
    console.log(`STEP 1 ACTUAL — toast: "${toastText}". Elapsed: ${(publishDurationMs / 1000).toFixed(2)}s.`);
    expect(/success|published/i.test(toastText), 'STEP 1 EXPECTED: Publish should succeed').toBeTruthy();
    expect.soft(publishDurationMs, 'STEP 1 EXPECTED (per ADO): Publish should complete within a reasonable SLA (e.g. under 30s) — CONFIRMED PERFORMANCE ISSUE if this exceeds that threshold').toBeLessThan(30_000);

    // STEP 2 (ADO): Verify every KPI has ComponentProgressReport rows for all 4 quarters (400 total).
    await page.waitForTimeout(3000);
    const cprResp = await (await page.request.get(`${WF_API}/api/dynamic/Epm/ComponentProgressReport/Crud/GetAll?maxResultCount=5000`, { headers: auth })).json();
    const cprItems = cprResp?.result?.items ?? [];
    const componentIdsForReport = new Set((compResp?.result?.items ?? []).filter((c: any) => c?.performanceReport?.id === reportId && c?.componentType?.id === KPI_TYPE_ID).map((c: any) => c.id));
    const cprForReport = cprItems.filter((r: any) => componentIdsForReport.has(r?.component?.id));
    console.log(`STEP 2 ACTUAL — ComponentProgressReport rows for this report's KPIs: ${cprForReport.length} (expected ${KPI_COUNT * 4}).`);
    expect.soft(cprForReport.length, `STEP 2 EXPECTED (per ADO): ${KPI_COUNT * 4} ComponentProgressReport rows should exist (${KPI_COUNT} KPIs x 4 quarters) — CONFIRMED GAP if different`).toBe(KPI_COUNT * 4);

    // STEP 3 (ADO): Confirm no timeout error was raised.
    const timeoutErrorVisible = await page.getByText(/timeout|timed out|gateway/i).first().isVisible().catch(() => false);
    console.log(`STEP 3 ACTUAL — any timeout error visible: ${timeoutErrorVisible}.`);
    expect(timeoutErrorVisible, 'STEP 3 EXPECTED: no timeout error should be displayed').toBeFalsy();

    const prAfter = await (await page.request.get(`${WF_API}/api/dynamic/Epm/PerformanceReport/Crud/Get?id=${reportId}`, { headers: auth })).json();
    console.log(`STEP 3 ACTUAL — final status: ${prAfter?.result?.status} (20 = ReportingInProgress).`);
    expect(prAfter?.result?.status, 'STEP 3 EXPECTED: the report should have actually published successfully (status 20)').toBe(20);

    console.log(`NOTE — this disposable report (id ${reportId}, 100 KPIs) is intentionally left Published, matching convention.`);
  });
});
