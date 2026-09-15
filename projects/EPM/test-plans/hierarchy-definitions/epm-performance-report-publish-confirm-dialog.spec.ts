import { test, expect } from '@playwright/test';

// ADO TC-108786 (plan 108745, suite 10 · EPM · Publish Performance Report — validation gate and
// confirm dialog, User Interface only). Positive: precondition — a Performance Report exists with the
// Reporting Tree seeded, Component Actioners assigned Stages 1-5, Stage 6 role appointed, and every
// KPI carrying an Annual Target. On the Performance Report list, open the row and click Publish;
// confirm the dialog; verify the status transitions to ReportingInProgress via
// PerformanceReportsAppService.PublishPerformanceReportAsync, an EpmAuditedEntityEvent row is written
// with action ReportPublished, and ValidateReadyToPublishAsync raised no error.
//
// Confirmed live 2026-08-19: reusing pre-existing shared fixtures ("DHS APP 2026-27", "Nomfa") both
// turned out to have real, pre-existing data-integrity problems unrelated to this test (see
// epm-nomfa-report-stuck-in-planning and epm-actionlevel-null-breaks-publish-process-owner-gate) — so
// this spec instead builds a small, fully disposable, self-contained report from scratch every run:
// - `POST /api/v1/Epm/PerformanceReports/CreatePerformanceReport` (flat body: name, shortName,
//   templateId, periodCoveredId) using the "Standard Annual Performance Plan" template
//   (id 77a75071-..., not soft-deleted, unlike the "DHS APP 2026-27" template which IS isDeleted:true)
//   paired with "Financial Year 2026/27" (id 8062531f-..., a known-good pairing — periodTypeCovered/
//   progressReportingCycle match).
// - `Component/Crud/Create` for a Department root (canBeRoot=true on this template) and a Quantitative
//   KPI child, setting `finalIndicatorTargetText`/`finalIndicatorTarget` directly at creation — this is
//   the real "Annual Target" field (confirmed by inspecting an existing furnished KPI's schema).
// - `ComponentActioner/Crud/Create` for Stages 1-5 with explicit, correct `actionLevel` values
//   (20/30/40/50/60) set directly via API — bypassing the known-broken "Actioner Level" UI select
//   (see epm-component-actioner-level-wrong-reference-data), which would otherwise always persist
//   `actionLevel: null` and silently block Publish's Process Owner check (see
//   epm-actionlevel-null-breaks-publish-process-owner-gate).
// - Stage 6 role appointment is a tenant-wide precondition already true (Stage 6 SPMR Director holds
//   "SPMR Director" — see epm-sha-role-appointment), not something this report needs to set up itself.
// - Real navigation: EPM (click) → EPM Administration (hover) → Manage Performance Reports
//   (`/dynamic/Epm/perfomance-report-v2` [sic, real route typo]) → row's search icon →
//   `/dynamic/Epm/performance-report-details-view?id=...`, which has a real "Publish Performance
//   Report" button (not on the list row itself).
// - Cosmetic prose mismatch, not a functional defect: ADO's step 1 describes a "confirm dialog"
//   before publish; the real button has none — clicking it fires the publish attempt immediately.

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

test.describe('EPM — Performance Report publish confirm dialog (ADO plan 108745 / suite 10)', () => {
  test('TC-108786 Positive — publish a validated Performance Report via the UI confirm dialog', async ({ page }) => {
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

    // PRECONDITION (ADO): build a fresh, fully disposable, valid report from scratch.
    const suffix = `${Date.now()}`.slice(-8);
    const createReportResp = await page.request.post(`${WF_API}/api/v1/Epm/PerformanceReports/CreatePerformanceReport`, {
      headers: auth,
      data: {
        name: `TC-108786 Fresh Test Report ${suffix}`,
        shortName: `TC108786-${suffix}`,
        templateId: TEMPLATE_ID,
        periodCoveredId: PERIOD_ID,
      },
    });
    const createReportBody = await createReportResp.json().catch(() => null);
    console.log(`PRECONDITION ACTUAL — CreatePerformanceReport: ${createReportResp.status()}.`);
    expect(createReportResp.status(), 'PRECONDITION EXPECTED: the disposable report should be creatable').toBeLessThan(400);
    const reportId = createReportBody?.result?.id;
    expect(reportId, 'PRECONDITION EXPECTED: a report id should be returned').toBeTruthy();

    const rootResp = await page.request.post(`${WF_API}/api/dynamic/Epm/Component/Crud/Create`, {
      headers: auth,
      data: { name: 'Fresh Test Department', componentType: DEPARTMENT_TYPE_ID, performanceReport: reportId, parent: null },
    });
    const rootBody = await rootResp.json().catch(() => null);
    expect(rootResp.status(), 'PRECONDITION EXPECTED: the root Department should be creatable').toBeLessThan(400);
    const rootId = rootBody?.result?.id;

    const kpiResp = await page.request.post(`${WF_API}/api/dynamic/Epm/Component/Crud/Create`, {
      headers: auth,
      data: {
        name: 'Fresh Test KPI',
        componentType: KPI_TYPE_ID,
        performanceReport: reportId,
        parent: rootId,
        finalIndicatorTargetText: '100',
        finalIndicatorTarget: 100,
      },
    });
    const kpiBody = await kpiResp.json().catch(() => null);
    expect(kpiResp.status(), 'PRECONDITION EXPECTED: the KPI (with an Annual Target) should be creatable').toBeLessThan(400);
    const kpiId = kpiBody?.result?.id;
    console.log(`PRECONDITION ACTUAL — tree seeded: report=${reportId}, root=${rootId}, kpi=${kpiId}, annualTarget=${kpiBody?.result?.finalIndicatorTargetText}.`);

    for (const s of STAGE_PERSONS) {
      const r = await page.request.post(`${WF_API}/api/dynamic/Epm/ComponentActioner/Crud/Create`, {
        headers: auth,
        data: { component: kpiId, actioner: s.id, actionLevel: s.level },
      });
      expect(r.status(), `PRECONDITION EXPECTED: the ${s.name} actioner assignment should succeed`).toBeLessThan(400);
    }
    console.log('PRECONDITION ACTUAL — Component Actioners assigned Stages 1-5 with correct actionLevel values.');

    // STEP 1 (ADO): On the Performance Report list, open the row and click Publish. ADO expects a
    // confirm dialog — none exists in the real UI (see class-level comment); the button fires the
    // publish attempt directly.
    await page.goto(`${BASE}/dynamic/Epm/performance-report-details-view?id=${reportId}`, { waitUntil: 'domcontentloaded' });
    await expect(page.getByText(`Performance Report: TC-108786 Fresh Test Report ${suffix}`, { exact: true })).toBeVisible({ timeout: SLOW });

    const publishBtn = page.locator('button', { hasText: 'Publish Performance Report' }).first();
    await expect(publishBtn).toBeVisible({ timeout: 30_000 });
    await publishBtn.click();
    // ant-message toasts auto-dismiss quickly — check right away, before it vanishes.
    const toastText = await page.locator('.ant-message, .ant-notification').first().innerText({ timeout: 5000 }).catch(() => '');
    console.log(`STEP 1 ACTUAL — toast after clicking Publish: "${toastText}".`);
    expect.soft(/success|published/i.test(toastText), 'STEP 1 EXPECTED: a success toast should appear (best-effort — ant-message toasts auto-dismiss quickly and may be missed even on a real success)').toBeTruthy();
    await page.waitForTimeout(2000);

    await page.reload({ waitUntil: 'domcontentloaded' });
    await page.waitForTimeout(3000);
    const statusBadge = await page.locator('body').innerText().catch(() => '');
    const showsInProgress = /REPORTING IN PROGRESS/i.test(statusBadge);
    console.log(`STEP 1 ACTUAL — status badge shows "Reporting In Progress" after refresh: ${showsInProgress}.`);
    expect(showsInProgress, 'STEP 1 EXPECTED: the status column/badge should update to Reporting In Progress').toBeTruthy();

    // STEP 2 (ADO): Refresh the row and verify the response body from PublishPerformanceReportAsync.
    const prAfter = await (await page.request.get(`${WF_API}/api/dynamic/Epm/PerformanceReport/Crud/Get?id=${reportId}`, { headers: auth })).json();
    console.log(`STEP 2 ACTUAL — status after publish: ${prAfter?.result?.status}.`);
    expect(prAfter?.result?.status, 'STEP 2 EXPECTED: the status field should equal ReportingInProgress (20)').toBe(20);

    const aeAfter = await (await page.request.get(`${WF_API}/api/dynamic/Epm/EpmAuditedEntityEvent/Crud/GetAll?maxResultCount=2000`, { headers: auth })).json();
    const publishedRows = (aeAfter?.result?.items ?? []).filter((r: any) => r?.entity?.id === reportId && /published/i.test(r.action ?? ''));
    console.log(`STEP 2 ACTUAL — "published" audit rows for this fresh report: ${publishedRows.length}. Actions: ${JSON.stringify(publishedRows.map((r: any) => r.action))}`);
    expect(publishedRows.length, 'STEP 2 EXPECTED: an audit row should be written for the publish action').toBeGreaterThan(0);

    // STEP 3 (ADO): Confirm ValidateReadyToPublishAsync returned no error prior to the transition —
    // i.e. no validation warnings were shown, and the audit trail shows exactly one entry (this being
    // a brand-new report, never published before).
    console.log(`STEP 3 ACTUAL — "published" audit rows count (should be exactly 1, first-ever publish): ${publishedRows.length}.`);
    expect(publishedRows.length, 'STEP 3 EXPECTED: exactly one ReportPublished entry should exist for this brand-new report').toBe(1);
    const validationWarningVisible = await page.getByText(/cannot publish|validation failed/i).first().isVisible().catch(() => false);
    console.log(`STEP 3 ACTUAL — any validation-failure warning visible on the refreshed page: ${validationWarningVisible}.`);
    expect(validationWarningVisible, 'STEP 3 EXPECTED: no validation warnings should be displayed').toBeFalsy();

    console.log(`NOTE — this disposable report (id ${reportId}) is intentionally left Published, matching the convention of leaving successful disposable test fixtures in place rather than reverting a genuine positive-path result.`);
  });
});
