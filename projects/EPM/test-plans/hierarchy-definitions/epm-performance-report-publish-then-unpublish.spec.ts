import { test, expect } from '@playwright/test';

// ADO TC-108837 (plan 108745, suite 10 · EPM · Publish Performance Report — validation gate and
// confirm dialog, User Interface only). Integration: precondition — a report has just been Published
// (status ReportingInProgress). Click Unpublish; expect a confirmation dialog, then status back to
// Planning; verify via GetAll; confirm two audit rows exist in order: ReportPublished then
// ReportUnpublished.
//
// Same from-scratch disposable-report recipe as TC-108786 (see epm-performance-report-publish-
// confirm-dialog memory). Note (per that memory and epm-performance-report-publish-100-kpis): the
// real Publish button has NO confirm dialog at all. This case separately claims Unpublish DOES show
// one — checked live below rather than assumed.

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

test.describe('EPM — Performance Report publish then unpublish (ADO plan 108745 / suite 10)', () => {
  test('TC-108837 Integration — Unpublish immediately after Publish restores Planning', async ({ page }) => {
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

    // PRECONDITION (ADO): a fresh, disposable, valid report — build then Publish it.
    const suffix = `${Date.now()}`.slice(-8);
    const createReportResp = await page.request.post(`${WF_API}/api/v1/Epm/PerformanceReports/CreatePerformanceReport`, {
      headers: auth,
      data: {
        name: `TC-108837 Fresh Test Report ${suffix}`,
        shortName: `TC108837-${suffix}`,
        templateId: TEMPLATE_ID,
        periodCoveredId: PERIOD_ID,
      },
    });
    const createReportBody = await createReportResp.json().catch(() => null);
    expect(createReportResp.status(), 'PRECONDITION EXPECTED: the disposable report should be creatable').toBeLessThan(400);
    const reportId = createReportBody?.result?.id;

    const rootResp = await page.request.post(`${WF_API}/api/dynamic/Epm/Component/Crud/Create`, {
      headers: auth,
      data: { name: 'Fresh Test Department', componentType: DEPARTMENT_TYPE_ID, performanceReport: reportId, parent: null },
    });
    const rootBody = await rootResp.json().catch(() => null);
    expect(rootResp.status(), 'PRECONDITION EXPECTED: the root Department should be creatable').toBeLessThan(400);
    const rootId = rootBody?.result?.id;

    const kpiResp = await page.request.post(`${WF_API}/api/dynamic/Epm/Component/Crud/Create`, {
      headers: auth,
      data: { name: 'Fresh Test KPI', componentType: KPI_TYPE_ID, performanceReport: reportId, parent: rootId, finalIndicatorTarget: 100, finalIndicatorTargetText: '100' },
    });
    const kpiBody = await kpiResp.json().catch(() => null);
    expect(kpiResp.status(), 'PRECONDITION EXPECTED: the KPI should be creatable').toBeLessThan(400);
    const kpiId = kpiBody?.result?.id;

    for (const s of STAGE_PERSONS) {
      const r = await page.request.post(`${WF_API}/api/dynamic/Epm/ComponentActioner/Crud/Create`, {
        headers: auth,
        data: { component: kpiId, actioner: s.id, actionLevel: s.level },
      });
      expect(r.status(), `PRECONDITION EXPECTED: the ${s.name} actioner assignment should succeed`).toBeLessThan(400);
    }

    await page.goto(`${BASE}/dynamic/Epm/performance-report-details-view?id=${reportId}`, { waitUntil: 'domcontentloaded' });
    await expect(page.getByText(`Performance Report: TC-108837 Fresh Test Report ${suffix}`, { exact: true })).toBeVisible({ timeout: SLOW });
    const publishBtn = page.locator('button', { hasText: 'Publish Performance Report' }).first();
    await expect(publishBtn).toBeVisible({ timeout: 30_000 });
    await publishBtn.click();
    const publishToast = await page.locator('.ant-message, .ant-notification').first().innerText({ timeout: 10_000 }).catch(() => '');
    console.log(`PRECONDITION ACTUAL — Publish toast: "${publishToast}".`);
    await page.waitForTimeout(2000);
    const prAfterPublish = await (await page.request.get(`${WF_API}/api/dynamic/Epm/PerformanceReport/Crud/Get?id=${reportId}`, { headers: auth })).json();
    console.log(`PRECONDITION ACTUAL — status after Publish: ${prAfterPublish?.result?.status}.`);
    expect(prAfterPublish?.result?.status, 'PRECONDITION EXPECTED: the report should now be ReportingInProgress (20)').toBe(20);

    // STEP 1 (ADO): Click Unpublish on the Performance Report row/details view.
    await page.reload({ waitUntil: 'domcontentloaded' });
    await page.waitForTimeout(3000);
    const unpublishBtn = page.locator('button', { hasText: 'Unpublish Performance Report' }).first();
    await expect(unpublishBtn).toBeVisible({ timeout: 30_000 });
    await unpublishBtn.click();
    const confirmDialogVisible = await page.locator('.ant-modal-content, .ant-popover-inner, .ant-popconfirm').first().isVisible({ timeout: 5000 }).catch(() => false);
    console.log(`STEP 1 ACTUAL — confirmation dialog appeared: ${confirmDialogVisible}.`);
    expect.soft(confirmDialogVisible, 'STEP 1 EXPECTED (per ADO): a confirmation dialog should appear before Unpublish takes effect').toBeTruthy();
    if (confirmDialogVisible) {
      const confirmBtn = page.locator('.ant-modal-content, .ant-popover-inner, .ant-popconfirm').getByRole('button', { name: /yes|ok|confirm|unpublish/i }).first();
      await confirmBtn.click().catch(() => {});
    }
    await page.waitForTimeout(3000);

    // STEP 2 (ADO): Verify via GetAll: status equals Planning.
    const prAfterUnpublish = await (await page.request.get(`${WF_API}/api/dynamic/Epm/PerformanceReport/Crud/Get?id=${reportId}`, { headers: auth })).json();
    console.log(`STEP 2 ACTUAL — status after Unpublish: ${prAfterUnpublish?.result?.status}.`);
    expect(prAfterUnpublish?.result?.status, 'STEP 2 EXPECTED: status should be Planning (10)').toBe(10);

    // STEP 3 (ADO): Confirm two audit rows exist in order: ReportPublished then ReportUnpublished.
    const aeResp = await (await page.request.get(`${WF_API}/api/dynamic/Epm/EpmAuditedEntityEvent/Crud/GetAll?maxResultCount=2000`, { headers: auth })).json();
    const rowsForReport = (aeResp?.result?.items ?? [])
      .filter((r: any) => r?.entity?.id === reportId && /published/i.test(r.action ?? ''))
      .sort((a: any, b: any) => new Date(a.creationTime).getTime() - new Date(b.creationTime).getTime());
    console.log(`STEP 3 ACTUAL — publish/unpublish audit rows in order: ${JSON.stringify(rowsForReport.map((r: any) => r.action))}.`);
    expect(rowsForReport.length, 'STEP 3 EXPECTED: exactly two audit rows should exist').toBe(2);
    expect(/published/i.test(rowsForReport[0]?.action ?? '') && !/unpublished/i.test(rowsForReport[0]?.action ?? ''), 'STEP 3 EXPECTED: the first row should be the publish event').toBeTruthy();
    expect(/unpublished/i.test(rowsForReport[1]?.action ?? ''), 'STEP 3 EXPECTED: the second row should be the unpublish event').toBeTruthy();

    console.log(`NOTE — this disposable report (id ${reportId}) is left in Planning, matching its final verified state in this test.`);
  });
});
