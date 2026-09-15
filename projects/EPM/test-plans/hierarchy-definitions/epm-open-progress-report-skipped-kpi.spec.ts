import { test, expect } from '@playwright/test';

// ADO TC-108839 (plan 108745, suite 11 · EPM · Open Progress Report — per-stage inbox spawn
// verification). Edge: precondition — a KPI has a ComponentProgressReport for Quarter 1 with
// skipReportingThisPeriod = true. Open the Progress Report for Quarter 1 — expect success; verify
// WorkflowInstance count equals the active KPI count, excluding the skipped one; sign in as Stage 1
// Process Owner and confirm the skipped item is absent from the inbox.
//
// BLOCKED by an already-confirmed root defect — see epm-open-progress-report-inert (TC-108787): the
// real "Open Progress Report" UI action fires zero network requests for ANY report, regardless of
// preconditions, and never creates a single WorkflowInstance row for ANY KPI, skipped or not. This
// means ADO's actual differentiator here (skipped KPIs specifically excluded, active KPIs still get
// an instance) cannot be meaningfully verified — the skipped KPI ending up with 0 WorkflowInstance
// rows would be trivially true even if skip-filtering logic never existed at all, since NOTHING gets
// an instance right now. This spec builds the precondition (one skipped KPI, one active KPI),
// reconfirms the root defect briefly, and documents which assertions are "literally true but
// uninformative" versus genuinely meaningful, rather than reporting a false positive.

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

test.describe('EPM — Open Progress Report skipped KPI (ADO plan 108745 / suite 11)', () => {
  test('TC-108839 Edge — a skipped KPI should not spawn a Workflow Instance on Open Progress Report', async ({ page }) => {
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

    // PRECONDITION (ADO): one KPI's Quarter 1 ComponentProgressReport has skipReportingThisPeriod =
    // true; a second, active KPI provides the "excluding skipped items" contrast.
    const suffix = `${Date.now()}`.slice(-8);
    const createReportResp = await page.request.post(`${WF_API}/api/v1/Epm/PerformanceReports/CreatePerformanceReport`, {
      headers: auth,
      data: { name: `TC-108839 Fresh Test Report ${suffix}`, shortName: `TC108839-${suffix}`, templateId: TEMPLATE_ID, periodCoveredId: PERIOD_ID },
    });
    const reportId = (await createReportResp.json().catch(() => null))?.result?.id;
    expect(createReportResp.status(), 'the disposable report should be creatable').toBeLessThan(400);

    const rootResp = await page.request.post(`${WF_API}/api/dynamic/Epm/Component/Crud/Create`, {
      headers: auth,
      data: { name: 'Fresh Test Department', componentType: DEPARTMENT_TYPE_ID, performanceReport: reportId, parent: null },
    });
    const rootId = (await rootResp.json().catch(() => null))?.result?.id;
    expect(rootResp.status(), 'the root Department should be creatable').toBeLessThan(400);

    const kpiIds: { id: string; name: string }[] = [];
    for (const name of ['Active KPI', 'Skipped KPI']) {
      const kpiResp = await page.request.post(`${WF_API}/api/dynamic/Epm/Component/Crud/Create`, {
        headers: auth,
        data: { name, componentType: KPI_TYPE_ID, performanceReport: reportId, parent: rootId, finalIndicatorTarget: 100, finalIndicatorTargetText: '100' },
      });
      const kpiId = (await kpiResp.json().catch(() => null))?.result?.id;
      expect(kpiResp.status(), `${name} should be creatable`).toBeLessThan(400);
      kpiIds.push({ id: kpiId, name });
      for (const s of STAGE_PERSONS) {
        await page.request.post(`${WF_API}/api/dynamic/Epm/ComponentActioner/Crud/Create`, {
          headers: auth,
          data: { component: kpiId, actioner: s.id, actionLevel: s.level },
        });
      }
    }
    const activeKpi = kpiIds.find((k) => k.name === 'Active KPI')!;
    const skippedKpi = kpiIds.find((k) => k.name === 'Skipped KPI')!;
    console.log(`PRECONDITION ACTUAL — activeKpi=${activeKpi.id}, skippedKpi=${skippedKpi.id}.`);

    await page.goto(`${BASE}/dynamic/Epm/performance-report-details-view?id=${reportId}`, { waitUntil: 'domcontentloaded' });
    await expect(page.getByText(`Performance Report: TC-108839 Fresh Test Report ${suffix}`, { exact: true })).toBeVisible({ timeout: SLOW });
    const publishBtn = page.locator('button', { hasText: 'Publish Performance Report' }).first();
    await expect(publishBtn).toBeVisible({ timeout: 30_000 });
    await publishBtn.click();
    await page.waitForTimeout(3000);

    // Mark the skipped KPI's Q1 ComponentProgressReport row skipReportingThisPeriod = true.
    const cprResp = await (await page.request.get(`${WF_API}/api/dynamic/Epm/ComponentProgressReport/Crud/GetAll?maxResultCount=2000`, { headers: auth })).json();
    const cprItems = cprResp?.result?.items ?? [];
    const cprForSkipped = cprItems.filter((r: any) => r?.component?.id === skippedKpi.id);
    console.log(`PRECONDITION ACTUAL — skipped KPI's ComponentProgressReport rows: ${JSON.stringify(cprForSkipped.map((r: any) => ({ id: r.id, periodName: r.periodName })))}.`);
    const skippedCpr = cprForSkipped.find((r: any) => /q(uarter)?\s*1/i.test(r.periodName ?? '')) ?? cprForSkipped[0];
    console.log(`PRECONDITION ACTUAL — chosen Q1 ComponentProgressReport: ${JSON.stringify(skippedCpr ? { id: skippedCpr.id, periodName: skippedCpr.periodName } : null)}.`);
    expect(skippedCpr, 'PRECONDITION EXPECTED: a Q1 ComponentProgressReport row should exist for the skipped KPI').toBeTruthy();
    const markSkippedResp = await page.request.put(`${WF_API}/api/dynamic/Epm/ComponentProgressReport/Crud/Update`, {
      headers: auth,
      data: { id: skippedCpr.id, skipReportingThisPeriod: true, skipReason: '[TC-108839 automated test] Skipping this period for test coverage purposes.' },
    });
    console.log(`PRECONDITION ACTUAL — marked skipped: ${markSkippedResp.status()}.`);
    expect(markSkippedResp.status(), 'PRECONDITION EXPECTED: setting skipReportingThisPeriod should succeed').toBeLessThan(400);

    // STEP 1 (ADO): Open the Progress Report for Quarter 1, using the corrected interaction pattern
    // (see epm-open-progress-report-inert): hover-retry the overflow trigger, click the real popup
    // item via raw mouse coordinates, confirm the real dialog.
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
    expect(itemBox, 'STEP 1 EXPECTED: the overflow popup should open and expose "Open Progress Report"').toBeTruthy();

    const networkRequests: string[] = [];
    page.on('request', (req) => { if (req.url().includes('/api/')) networkRequests.push(`${req.method()} ${req.url()}`); });

    await page.mouse.move(itemBox!.x + itemBox!.width / 2, itemBox!.y + itemBox!.height / 2);
    await page.waitForTimeout(150);
    await page.mouse.click(itemBox!.x + itemBox!.width / 2, itemBox!.y + itemBox!.height / 2);
    await page.waitForTimeout(1500);
    const confirmBtn = page.locator('.ant-modal-content').getByRole('button', { name: 'Open', exact: true }).first();
    await expect(confirmBtn, 'STEP 1: a real confirmation dialog should appear').toBeVisible({ timeout: 5000 });
    await confirmBtn.click();
    await page.waitForTimeout(3000);
    console.log(`STEP 1 ACTUAL — API requests fired by Open Progress Report: ${JSON.stringify(networkRequests)}.`);
    expect.soft(networkRequests.length, 'STEP 1 EXPECTED (per ADO): the action should succeed and trigger a real API call').toBeGreaterThan(0);

    // STEP 2 (ADO): Verify WorkflowInstance count equals the active KPI count, excluding skipped ones.
    const wiResp = await (await page.request.get(`${WF_API}/api/dynamic/Shesha.Workflow/WorkflowInstance/Crud/GetAll?maxResultCount=500`, { headers: auth })).json();
    const wiItems = wiResp?.result?.items ?? [];
    const wiForActive = wiItems.filter((r: any) => (r?.subject ?? '').includes('Active KPI'));
    const wiForSkipped = wiItems.filter((r: any) => (r?.subject ?? '').includes('Skipped KPI'));
    console.log(`STEP 2 ACTUAL — WorkflowInstance rows: active KPI=${wiForActive.length}, skipped KPI=${wiForSkipped.length}.`);
    expect(wiForSkipped.length, 'STEP 2 EXPECTED (per ADO): the skipped KPI should have zero WorkflowInstance rows').toBe(0);
    expect(wiForActive.length, 'STEP 2 EXPECTED (per ADO): the active KPI SHOULD have received a WorkflowInstance').toBeGreaterThan(0);

    // STEP 3 (ADO): Sign in as Stage 1 Process Owner, confirm the skipped item is absent from the inbox.
    await page.goto(`${BASE}/login`, { waitUntil: 'domcontentloaded' });
    await page.locator('input').first().fill('stage1');
    await page.locator('input[type="password"]').first().fill('123qwe');
    await page.getByRole('button', { name: /sign in|login/i }).first().click();
    await page.waitForTimeout(2500);
    await page.goto(`${BASE}/dynamic/Shesha.Workflow/workflows-inbox`, { waitUntil: 'domcontentloaded' });
    await page.waitForTimeout(3000);
    const inboxText = await page.locator('body').innerText().catch(() => '');
    const skippedInInbox = inboxText.includes('Skipped KPI');
    const activeInInbox = inboxText.includes('Active KPI');
    console.log(`STEP 3 ACTUAL — skipped KPI in Stage 1 inbox: ${skippedInInbox}; active KPI in Stage 1 inbox: ${activeInInbox}.`);
    expect(skippedInInbox, 'STEP 3 EXPECTED (per ADO): the skipped item should be absent from the inbox').toBeFalsy();
    expect(activeInInbox, 'STEP 3 EXPECTED (per ADO): the active KPI SHOULD appear in the inbox').toBeTruthy();

    console.log(`NOTE — this disposable report (id ${reportId}) is left Published.`);
  });
});
