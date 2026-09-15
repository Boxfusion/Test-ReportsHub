import { test, expect } from '@playwright/test';

// ADO TC-108835 (plan 108745, suite 10 · EPM · Publish Performance Report — validation gate and
// confirm dialog, User Interface only). Negative: precondition — a Performance Report has a KPI with
// finalIndicatorTarget AND finalIndicatorTargetText both null (no Annual Target). Click Publish;
// expect ValidateReadyToPublishAsync to reject it, listing the KPI without an Annual Target; confirm
// status remains Planning with no ReportPublished audit event; populate the Annual Target and retry —
// expect success, status → ReportingInProgress.
//
// Same from-scratch disposable-report recipe as TC-108786 (see epm-performance-report-publish-
// confirm-dialog memory) — template "Standard Annual Performance Plan" (non-deleted) + "Financial
// Year 2026/27" period, a Department root + Quantitative KPI child, ComponentActioner Stages 1-5 with
// correct actionLevel values set directly via API (the real "Actioner Level" UI select always
// persists null — see epm-component-actioner-level-wrong-reference-data — which would otherwise
// falsely trigger the UNRELATED "no assigned Process Owner" gate instead of the Annual Target gate
// this case is actually testing). The only difference from TC-108786: the KPI is created WITHOUT
// finalIndicatorTarget/finalIndicatorTargetText, to hit this specific validation gate.
//
// Confirmed live 2026-08-19, reproduced twice on independent fresh reports: this validation gate does
// not exist at all. Publish succeeds immediately ("Successfully published report.") with a KPI that
// has both Annual Target fields null — no rejection, status transitions to ReportingInProgress (20),
// and a real ReportPublished audit row is written. See
// epm-publish-missing-annual-target-not-validated memory.

const BASE = 'https://pd-epm-adminportal-qa-wf.shesha.app';
const WF_API = 'https://pd-epm-api-qa-wf.shesha.app';
const TEMPLATE_ID = '77a75071-5385-4ae7-bb5e-42cc4619ee87'; // Standard Annual Performance Plan
const PERIOD_ID = '8062531f-2326-4fc7-8ea3-582d11bcdcb1'; // Financial Year 2026/27
const DEPARTMENT_TYPE_ID = 'f1ec68a8-ea98-41eb-9080-ea969ed89fd0';
const KPI_TYPE_ID = '60e8340a-bdb7-4ac8-8b24-f90d2b5951bb';

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

test.describe('EPM — Performance Report publish missing Annual Target (ADO plan 108745 / suite 10)', () => {
  test('TC-108835 Negative — Publish should be rejected when a KPI has no Annual Target', async ({ page }) => {
    test.setTimeout(480_000);

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

    // PRECONDITION (ADO): a fresh, disposable report with a KPI that has NO Annual Target.
    const suffix = `${Date.now()}`.slice(-8);
    const createReportResp = await page.request.post(`${WF_API}/api/v1/Epm/PerformanceReports/CreatePerformanceReport`, {
      headers: auth,
      data: {
        name: `TC-108835 Fresh Test Report ${suffix}`,
        shortName: `TC108835-${suffix}`,
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

    // KPI created WITHOUT finalIndicatorTarget/finalIndicatorTargetText — this is the precondition.
    const kpiResp = await page.request.post(`${WF_API}/api/dynamic/Epm/Component/Crud/Create`, {
      headers: auth,
      data: { name: 'Fresh Test KPI (no Annual Target)', componentType: KPI_TYPE_ID, performanceReport: reportId, parent: rootId },
    });
    const kpiBody = await kpiResp.json().catch(() => null);
    expect(kpiResp.status(), 'PRECONDITION EXPECTED: the KPI should be creatable').toBeLessThan(400);
    const kpiId = kpiBody?.result?.id;
    console.log(`PRECONDITION ACTUAL — tree seeded: report=${reportId}, root=${rootId}, kpi=${kpiId}, finalIndicatorTarget=${kpiBody?.result?.finalIndicatorTarget}, finalIndicatorTargetText=${kpiBody?.result?.finalIndicatorTargetText}.`);
    expect(kpiBody?.result?.finalIndicatorTarget, 'PRECONDITION EXPECTED: finalIndicatorTarget should be null').toBeNull();
    expect(kpiBody?.result?.finalIndicatorTargetText, 'PRECONDITION EXPECTED: finalIndicatorTargetText should be null').toBeNull();

    for (const s of STAGE_PERSONS) {
      const r = await page.request.post(`${WF_API}/api/dynamic/Epm/ComponentActioner/Crud/Create`, {
        headers: auth,
        data: { component: kpiId, actioner: s.id, actionLevel: s.level },
      });
      expect(r.status(), `PRECONDITION EXPECTED: the ${s.name} actioner assignment should succeed`).toBeLessThan(400);
    }
    console.log('PRECONDITION ACTUAL — Component Actioners assigned Stages 1-5 with correct actionLevel values.');

    // STEP 1 (ADO): Click Publish.
    await page.goto(`${BASE}/dynamic/Epm/performance-report-details-view?id=${reportId}`, { waitUntil: 'domcontentloaded' });
    await expect(page.getByText(`Performance Report: TC-108835 Fresh Test Report ${suffix}`, { exact: true })).toBeVisible({ timeout: SLOW });

    const publishBtn = page.locator('button', { hasText: 'Publish Performance Report' }).first();
    await expect(publishBtn).toBeVisible({ timeout: 30_000 });
    await publishBtn.click();
    const toastText = await page.locator('.ant-message, .ant-notification').first().innerText({ timeout: 5000 }).catch(() => '');
    console.log(`STEP 1 ACTUAL — toast after clicking Publish: "${toastText}".`);
    const wasRejected = /failed|cannot publish|error/i.test(toastText);
    console.log(`STEP 1 ACTUAL — Publish was rejected: ${wasRejected}.`);
    expect.soft(wasRejected, 'STEP 1 EXPECTED (per ADO): ValidateReadyToPublishAsync should reject Publish, citing the KPI missing an Annual Target — CONFIRMED DEFECT if it succeeds instead: the Annual Target gate is not enforced at all').toBeTruthy();

    // STEP 2 (ADO): Confirm status remains Planning, no ReportPublished audit event. If STEP 1's
    // rejection didn't happen (confirmed defect), this documents the real consequence: the report
    // published anyway, with a KPI that has no Annual Target.
    const prAfterAttempt = await (await page.request.get(`${WF_API}/api/dynamic/Epm/PerformanceReport/Crud/Get?id=${reportId}`, { headers: auth })).json();
    console.log(`STEP 2 ACTUAL — status after the Publish attempt: ${prAfterAttempt?.result?.status}.`);
    expect.soft(prAfterAttempt?.result?.status, 'STEP 2 EXPECTED (per ADO): status should remain Planning (10) since Publish should have been rejected — CONFIRMED DEFECT if 20: the report published despite the missing Annual Target').toBe(10);

    const aeAfterAttempt = await (await page.request.get(`${WF_API}/api/dynamic/Epm/EpmAuditedEntityEvent/Crud/GetAll?maxResultCount=2000`, { headers: auth })).json();
    const publishedRowsAfterAttempt = (aeAfterAttempt?.result?.items ?? []).filter((r: any) => r?.entity?.id === reportId && /published/i.test(r.action ?? ''));
    console.log(`STEP 2 ACTUAL — "published" audit rows after the attempt: ${publishedRowsAfterAttempt.length}.`);
    expect.soft(publishedRowsAfterAttempt.length, 'STEP 2 EXPECTED (per ADO): no ReportPublished audit event should exist — CONFIRMED DEFECT if >0: a publish audit row was written despite the missing Annual Target').toBe(0);

    // STEP 3 (ADO): Populate the Annual Target and retry Publish — expect success. Since STEP 1
    // already succeeded (confirmed defect), this half just confirms the KPI's Annual Target can still
    // be populated after the fact — genuinely useful data hygiene, independent of the gate's absence.
    const updateKpiResp = await page.request.put(`${WF_API}/api/dynamic/Epm/Component/Crud/Update`, {
      headers: auth,
      data: { id: kpiId, finalIndicatorTarget: 100, finalIndicatorTargetText: '100' },
    });
    console.log(`STEP 3 ACTUAL — populated Annual Target post-hoc: ${updateKpiResp.status()}.`);
    expect(updateKpiResp.status(), 'STEP 3 EXPECTED: updating the Annual Target should succeed').toBeLessThan(400);

    const kpiAfterUpdate = await (await page.request.get(`${WF_API}/api/dynamic/Epm/Component/Crud/Get?id=${kpiId}`, { headers: auth })).json();
    console.log(`STEP 3 ACTUAL — KPI Annual Target now: ${kpiAfterUpdate?.result?.finalIndicatorTargetText}.`);
    expect(kpiAfterUpdate?.result?.finalIndicatorTargetText, 'STEP 3 EXPECTED: the Annual Target should be persisted').toBe('100');

    console.log(`NOTE — this disposable report (id ${reportId}) is intentionally left Published, matching convention.`);
  });
});
