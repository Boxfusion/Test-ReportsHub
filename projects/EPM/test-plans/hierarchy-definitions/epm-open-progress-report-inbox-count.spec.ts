import { test, expect } from '@playwright/test';

// ADO TC-108787 (plan 108745, suite 11 · EPM · Open Progress Report — per-stage inbox spawn
// verification. Anchor: ProgressReportsAppService.PublishProgressReportAsync:67-103). Positive:
// precondition — a Performance Report is Published with N active KPIs for Quarter 1. Open the
// Progress Report for Quarter 1 via the "Open Progress Report" UI action; expect a confirmation
// dialog then status → Open; sign in as a Stage 1 Person and check the workflow inbox count matches
// N; verify N WorkflowInstance rows exist, each with action "Capture Progress Report" pointing at a
// Stage 1 actioner.
//
// CORRECTED 2026-08-31 (case owner caught this manually): the action genuinely WORKS end-to-end. It
// lives inside the Reporting Periods grid's "..." hover-triggered overflow popup next to "Total N
// items" (same flaky-hover pattern as epm-hover-menu-keep-cursor-steady's Administration flyout). A
// real confirmation dialog DOES appear ("Are you sure you want to open progress report for
// reporting?"). Clicking "Open" fires 4 real API calls (PublishProgressReport,
// InitializeWorkflowReportingComponents, GetKpiComponentsByProgressReport, QueueCreateWorkflows), the
// period transitions to Open, and real WorkflowInstance rows spawn matching active KPIs.
//
// The prior "confirmed defect" (2026-08-19, reconfirmed 2026-08-31 earlier the same day) was a
// TESTING ARTIFACT: antd's overflow-menu component renders a HIDDEN measurement placeholder for the
// overflowed menu item, styled `opacity:0; pointer-events:none; aria-hidden:true`, with the exact same
// text ("Open Progress Report") as the real, later-rendered popup item. A naive
// `getByText(..., {exact:true}).locator('visible=true')` selector matched that hidden placeholder
// (Playwright's `visible=true` pseudo-selector does not reliably exclude `pointer-events:none`
// elements), and `{force: true}` then "clicked" it anyway — producing zero requests on every run,
// consistent and repeatable, but never actually exercising the real button. See
// [[epm-open-progress-report-inert]] for the full corrected writeup.

const BASE = 'https://pd-epm-adminportal-qa-wf.shesha.app';
const WF_API = 'https://pd-epm-api-qa-wf.shesha.app';
const TEMPLATE_ID = '77a75071-5385-4ae7-bb5e-42cc4619ee87'; // Standard Annual Performance Plan
const PERIOD_ID = '8062531f-2326-4fc7-8ea3-582d11bcdcb1'; // Financial Year 2026/27
const DEPARTMENT_TYPE_ID = 'f1ec68a8-ea98-41eb-9080-ea969ed89fd0';
const KPI_TYPE_ID = '60e8340a-bdb7-4ac8-8b24-f90d2b5951bb';
const KPI_COUNT = 3;

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

test.describe('EPM — Open Progress Report inbox count (ADO plan 108745 / suite 11)', () => {
  test('TC-108787 Positive — Open Progress Report should spawn Stage 1 inbox items matching active KPIs', async ({ page }) => {
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

    // PRECONDITION (ADO): a fresh, disposable, Published report with N=3 active KPIs for Quarter 1.
    const suffix = `${Date.now()}`.slice(-8);
    const createReportResp = await page.request.post(`${WF_API}/api/v1/Epm/PerformanceReports/CreatePerformanceReport`, {
      headers: auth,
      data: { name: `TC-108787 Fresh Test Report ${suffix}`, shortName: `TC108787-${suffix}`, templateId: TEMPLATE_ID, periodCoveredId: PERIOD_ID },
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

    const kpiIds: string[] = [];
    for (let i = 0; i < KPI_COUNT; i++) {
      const kpiResp = await page.request.post(`${WF_API}/api/dynamic/Epm/Component/Crud/Create`, {
        headers: auth,
        data: { name: `Fresh Test KPI ${i + 1}`, componentType: KPI_TYPE_ID, performanceReport: reportId, parent: rootId, finalIndicatorTarget: 100, finalIndicatorTargetText: '100' },
      });
      const kpiBody = await kpiResp.json().catch(() => null);
      const kpiId = kpiBody?.result?.id;
      expect(kpiResp.status(), `PRECONDITION EXPECTED: KPI ${i + 1} should be creatable`).toBeLessThan(400);
      kpiIds.push(kpiId);
      for (const s of STAGE_PERSONS) {
        const r = await page.request.post(`${WF_API}/api/dynamic/Epm/ComponentActioner/Crud/Create`, {
          headers: auth,
          data: { component: kpiId, actioner: s.id, actionLevel: s.level },
        });
        expect(r.status(), `PRECONDITION EXPECTED: the ${s.name} actioner for KPI ${i + 1} should succeed`).toBeLessThan(400);
      }
    }
    console.log(`PRECONDITION ACTUAL — built ${kpiIds.length} KPIs with actioners.`);

    await page.goto(`${BASE}/dynamic/Epm/performance-report-details-view?id=${reportId}`, { waitUntil: 'domcontentloaded' });
    await expect(page.getByText(`Performance Report: TC-108787 Fresh Test Report ${suffix}`, { exact: true })).toBeVisible({ timeout: SLOW });
    const publishBtn = page.locator('button', { hasText: 'Publish Performance Report' }).first();
    await expect(publishBtn).toBeVisible({ timeout: 30_000 });
    await publishBtn.click();
    await page.waitForTimeout(3000);
    const prAfterPublish = await (await page.request.get(`${WF_API}/api/dynamic/Epm/PerformanceReport/Crud/Get?id=${reportId}`, { headers: auth })).json();
    console.log(`PRECONDITION ACTUAL — status after Publish: ${prAfterPublish?.result?.status}.`);
    expect(prAfterPublish?.result?.status, 'PRECONDITION EXPECTED: the report should now be Published (20)').toBe(20);

    // Find the Q1 ProgressReport row.
    const prResp = await (await page.request.get(`${WF_API}/api/dynamic/Epm/ProgressReport/Crud/GetAll?maxResultCount=2000`, { headers: auth })).json();
    const q1ProgressReport = (prResp?.result?.items ?? []).find((r: any) => r?.performanceReport?.id === reportId && r?.periodCovered?._displayName === 'Quarter 1 2026/27');
    console.log(`PRECONDITION ACTUAL — Q1 ProgressReport status before Open: ${q1ProgressReport?.status}.`);

    // STEP 1 (ADO): Open the Progress Report for Quarter 1 via the "Open Progress Report" action.
    //
    // CORRECTED 2026-08-31: the real "Open Progress Report" menu item lives inside a hover-triggered
    // rc-menu "..." overflow popup (same flaky-hover pattern as the Administration flyout — see
    // epm-hover-menu-keep-cursor-steady). A text-based `getByText(...).locator('visible=true')`
    // selector matches antd's HIDDEN overflow-measurement placeholder for this menu item (a real DOM
    // node with the same exact text, styled `opacity:0; pointer-events:none; aria-hidden:true`) before
    // the popup is ever opened — so `force: true` "clicks" a dead node and the popup never opens,
    // producing zero requests every time regardless of whether the underlying feature works. The
    // correct approach: hover the overflow trigger (retrying since the popup is genuinely flaky), read
    // the real popup item's bounding box, then click via raw mouse coordinates — any fresh locator
    // re-click re-hovers via its own path and the popup auto-closes before the click lands.
    await page.reload({ waitUntil: 'domcontentloaded' });
    await page.waitForTimeout(3000);
    const q1Cell = page.locator('[role="row"]').filter({ hasText: 'Quarter 1 2026/27' }).getByText('Quarter 1 2026/27', { exact: true }).first();
    await q1Cell.click();
    await page.waitForTimeout(1500);

    const reportingPeriodsPanel = page.locator('.sha-components-container-inner').filter({ hasText: 'Total' });
    const overflowTrigger = reportingPeriodsPanel.locator('.ant-menu-submenu-title, .anticon-ellipsis').first();
    await expect(overflowTrigger, 'STEP 1: the Reporting Periods overflow trigger should be visible').toBeVisible({ timeout: 10_000 });

    let itemBox: { x: number; y: number; width: number; height: number } | null = null;
    for (let attempt = 0; attempt < 5 && !itemBox; attempt++) {
      await overflowTrigger.hover();
      await page.waitForTimeout(600);
      const candidate = page.locator('.ant-menu-submenu-popup:not(.ant-menu-submenu-hidden)').getByText('Open Progress Report', { exact: true }).first();
      if (await candidate.isVisible().catch(() => false)) itemBox = await candidate.boundingBox();
    }
    console.log(`STEP 1 ACTUAL — overflow popup opened: ${!!itemBox}.`);
    expect(itemBox, 'STEP 1 EXPECTED: the overflow popup should open and expose "Open Progress Report" within 5 hover attempts').toBeTruthy();

    const networkRequests: string[] = [];
    page.on('request', (req) => { if (req.url().includes('/api/')) networkRequests.push(`${req.method()} ${req.url()}`); });

    await page.mouse.move(itemBox!.x + itemBox!.width / 2, itemBox!.y + itemBox!.height / 2);
    await page.waitForTimeout(150);
    await page.mouse.click(itemBox!.x + itemBox!.width / 2, itemBox!.y + itemBox!.height / 2);
    await page.waitForTimeout(1500);
    const confirmDialogVisible = await page.locator('.ant-modal-content').first().isVisible({ timeout: 5000 }).catch(() => false);
    console.log(`STEP 1 ACTUAL — confirmation dialog appeared: ${confirmDialogVisible}.`);
    expect(confirmDialogVisible, 'STEP 1 EXPECTED: a real confirmation dialog should appear').toBeTruthy();
    const confirmBtn = page.locator('.ant-modal-content').getByRole('button', { name: 'Open', exact: true }).first();
    await confirmBtn.click();
    await page.waitForTimeout(3000);
    console.log(`STEP 1 ACTUAL — API requests fired by the click: ${JSON.stringify(networkRequests)}.`);
    expect.soft(networkRequests.length, 'STEP 1 EXPECTED (per ADO): clicking Open Progress Report should trigger a real API call and transition the period to Open').toBeGreaterThan(0);

    await page.reload({ waitUntil: 'domcontentloaded' });
    await page.waitForTimeout(3000);
    const q1StatusAfter = await page.locator('[role="row"]').filter({ hasText: 'Quarter 1 2026/27' }).innerText().catch(() => '');
    console.log(`STEP 1 ACTUAL — Q1 row after click+reload: "${q1StatusAfter}".`);
    expect.soft(/Open/i.test(q1StatusAfter) && !/Draft/i.test(q1StatusAfter), 'STEP 1 EXPECTED (per ADO): the period status should transition to Open').toBeTruthy();

    // STEP 2 (ADO): Sign in as any Stage 1 Person and check the workflow inbox count matches N.
    // BLOCKED if STEP 1's confirmed defect held — no inbox items can spawn without a real trigger.
    await page.goto(`${BASE}/login`, { waitUntil: 'domcontentloaded' });
    await page.locator('input').first().fill('stage1');
    await page.locator('input[type="password"]').first().fill('123qwe');
    await page.getByRole('button', { name: /sign in|login/i }).first().click();
    await page.waitForTimeout(2500);
    await page.goto(`${BASE}/dynamic/Shesha.Workflow/workflows-inbox`, { waitUntil: 'domcontentloaded' });
    await page.waitForTimeout(3000);
    const inboxText = await page.locator('body').innerText().catch(() => '');
    const mentionsFreshKpi = inboxText.includes('Fresh Test KPI');
    console.log(`STEP 2 ACTUAL — Stage 1 inbox mentions this report's KPIs: ${mentionsFreshKpi}.`);
    expect.soft(mentionsFreshKpi, `STEP 2 EXPECTED (per ADO): the Stage 1 inbox should show ${KPI_COUNT} new items for this report's KPIs — BLOCKED if STEP 1's action never fired`).toBeTruthy();

    // STEP 3 (ADO): Verify N WorkflowInstance rows exist for this ProgressReport.
    const wiResp = await (await page.request.get(`${WF_API}/api/dynamic/Shesha.Workflow/WorkflowInstance/Crud/GetAll?maxResultCount=500`, { headers: auth })).json();
    const wiForReport = (wiResp?.result?.items ?? []).filter((r: any) => r?.progressReport?.id === q1ProgressReport?.id);
    console.log(`STEP 3 ACTUAL — WorkflowInstance rows for this Q1 ProgressReport: ${wiForReport.length} (expected ${KPI_COUNT}).`);
    expect.soft(wiForReport.length, `STEP 3 EXPECTED (per ADO): exactly ${KPI_COUNT} WorkflowInstance rows should exist, one per active KPI — CONFIRMED GAP if 0, consistent with STEP 1's defect`).toBe(KPI_COUNT);

    console.log(`NOTE — this disposable report (id ${reportId}) is left Published, with Q1 genuinely Open and real WorkflowInstance rows spawned.`);
  });
});
