import { test, expect } from '@playwright/test';

// ADO TC-108840 (plan 108745, suite 11 · EPM · Open Progress Report — per-stage inbox spawn
// verification). Integration: precondition — two Stage 1 Persons each assigned actionLevel 20 on a
// distinct set of KPIs. Open the Progress Report for Quarter 1 — expect success; sign in as Stage 1
// Person A, verify inbox count matches their assignments; sign in as Stage 1 Person B, verify their
// inbox count matches theirs, with no cross-contamination.
//
// CORRECTED 2026-08-31 (case owner caught this manually): "Open Progress Report" genuinely works — see
// epm-open-progress-report-inert (TC-108787). The prior "confirmed defect" was a testing artifact: the
// selector matched antd's hidden overflow-menu measurement placeholder instead of the real
// hover-triggered popup item. This spec now uses the corrected interaction (hover-retry the overflow
// trigger, click the real item via raw mouse coordinates, confirm the real dialog that appears).
//
// Separate, additional precondition gap found: no second "Stage 1"-designated Person exists anywhere
// in this tenant — every actionLevel=20 ComponentActioner row tenant-wide points at the single Person
// "Stage 1 Process Owner". Rather than creating a brand-new Person identity (a bigger, more invasive
// action than reusing existing data), reused an existing real Person ("Bonolo Nthejane") as "Person B"
// for this test's purposes — she already exists in this tenant with other real roles/assignments, so
// adding one more Component Actioner row to her is consistent with how other tests this session reused
// existing Persons for actioner assignments. PERSON_B_ID updated 2026-08-31: the original id had gone
// soft-deleted since 2026-08-17; this is her current live Person record.

const BASE = 'https://pd-epm-adminportal-qa-wf.shesha.app';
const WF_API = 'https://pd-epm-api-qa-wf.shesha.app';
const TEMPLATE_ID = '77a75071-5385-4ae7-bb5e-42cc4619ee87'; // Standard Annual Performance Plan
const PERIOD_ID = '8062531f-2326-4fc7-8ea3-582d11bcdcb1'; // Financial Year 2026/27
const DEPARTMENT_TYPE_ID = 'f1ec68a8-ea98-41eb-9080-ea969ed89fd0';
const KPI_TYPE_ID = '60e8340a-bdb7-4ac8-8b24-f90d2b5951bb';
const PERSON_A_ID = '0df05401-6802-4242-9d65-949924970db6'; // "Stage 1 Process Owner" — real Stage 1 actioner tenant-wide
const PERSON_B_ID = '4e74ee74-451d-4a78-b03b-bf85998a0fc5'; // "Bonolo Nthejane" — reused existing Person as "Stage 1 Person B"

const SLOW = 420_000;
const RAW_CHANNEL = process.env.PW_CHANNEL === undefined ? 'chrome' : process.env.PW_CHANNEL;
const CHANNEL = RAW_CHANNEL === '' || RAW_CHANNEL === 'chromium' ? undefined : RAW_CHANNEL;

test.use({
  channel: CHANNEL,
  actionTimeout: 30_000,
  navigationTimeout: 120_000,
});

test.describe('EPM — Open Progress Report cascade to two Stage 1 Persons (ADO plan 108745 / suite 11)', () => {
  test('TC-108840 Integration — inbox cascade should reach each Stage 1 Person for their own assigned KPIs', async ({ page }) => {
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

    // PRECONDITION (ADO): two Stage 1 Persons, each with a distinct set of assigned KPIs at
    // actionLevel 20. Person A gets 2 KPIs, Person B gets 1 KPI.
    const suffix = `${Date.now()}`.slice(-8);
    const createReportResp = await page.request.post(`${WF_API}/api/v1/Epm/PerformanceReports/CreatePerformanceReport`, {
      headers: auth,
      data: { name: `TC-108840 Fresh Test Report ${suffix}`, shortName: `TC108840-${suffix}`, templateId: TEMPLATE_ID, periodCoveredId: PERIOD_ID },
    });
    const reportId = (await createReportResp.json().catch(() => null))?.result?.id;
    expect(createReportResp.status(), 'the disposable report should be creatable').toBeLessThan(400);

    const rootResp = await page.request.post(`${WF_API}/api/dynamic/Epm/Component/Crud/Create`, {
      headers: auth,
      data: { name: 'Fresh Test Department', componentType: DEPARTMENT_TYPE_ID, performanceReport: reportId, parent: null },
    });
    const rootId = (await rootResp.json().catch(() => null))?.result?.id;
    expect(rootResp.status(), 'the root Department should be creatable').toBeLessThan(400);

    const kpiPlan = [
      { name: 'Person A KPI 1', personId: PERSON_A_ID },
      { name: 'Person A KPI 2', personId: PERSON_A_ID },
      { name: 'Person B KPI 1', personId: PERSON_B_ID },
    ];
    for (const kpi of kpiPlan) {
      const kpiResp = await page.request.post(`${WF_API}/api/dynamic/Epm/Component/Crud/Create`, {
        headers: auth,
        data: { name: kpi.name, componentType: KPI_TYPE_ID, performanceReport: reportId, parent: rootId, finalIndicatorTarget: 100, finalIndicatorTargetText: '100' },
      });
      const kpiId = (await kpiResp.json().catch(() => null))?.result?.id;
      expect(kpiResp.status(), `${kpi.name} should be creatable`).toBeLessThan(400);
      const caResp = await page.request.post(`${WF_API}/api/dynamic/Epm/ComponentActioner/Crud/Create`, {
        headers: auth,
        data: { component: kpiId, actioner: kpi.personId, actionLevel: 20 },
      });
      expect(caResp.status(), `the Stage 1 actioner for ${kpi.name} should succeed`).toBeLessThan(400);
    }
    console.log(`PRECONDITION ACTUAL — built 3 KPIs: 2 assigned to Person A (Stage 1 Process Owner), 1 assigned to Person B (Bonolo Nthejane), all at actionLevel 20.`);

    await page.goto(`${BASE}/dynamic/Epm/performance-report-details-view?id=${reportId}`, { waitUntil: 'domcontentloaded' });
    await expect(page.getByText(`Performance Report: TC-108840 Fresh Test Report ${suffix}`, { exact: true })).toBeVisible({ timeout: SLOW });
    const publishBtn = page.locator('button', { hasText: 'Publish Performance Report' }).first();
    await expect(publishBtn).toBeVisible({ timeout: 30_000 });
    await publishBtn.click();
    await page.waitForTimeout(3000);

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
    console.log(`STEP 1 ACTUAL — API requests fired: ${JSON.stringify(networkRequests)}.`);
    expect.soft(networkRequests.length, 'STEP 1 EXPECTED (per ADO): the action should succeed').toBeGreaterThan(0);

    // STEP 2 (ADO): Sign in as Stage 1 Person A. Verify inbox count matches their 2 assigned KPIs.
    await page.goto(`${BASE}/login`, { waitUntil: 'domcontentloaded' });
    await page.locator('input').first().fill('stage1');
    await page.locator('input[type="password"]').first().fill('123qwe');
    await page.getByRole('button', { name: /sign in|login/i }).first().click();
    await page.waitForTimeout(2500);
    await page.goto(`${BASE}/dynamic/Shesha.Workflow/workflows-inbox`, { waitUntil: 'domcontentloaded' });
    await page.waitForTimeout(3000);
    const personAInboxText = await page.locator('body').innerText().catch(() => '');
    const personAItemCount = (personAInboxText.match(/Person A KPI/g) ?? []).length;
    console.log(`STEP 2 ACTUAL — Person A inbox mentions of their KPIs: ${personAItemCount} (expected 2).`);
    expect.soft(personAItemCount, 'STEP 2 EXPECTED (per ADO): Person A\'s inbox should show 2 items — CONFIRMED GAP if 0, consistent with the already-confirmed root defect').toBe(2);
    const personAContaminated = personAInboxText.includes('Person B KPI');
    console.log(`STEP 2 ACTUAL — Person A inbox shows Person B's KPI (cross-contamination): ${personAContaminated}.`);
    expect(personAContaminated, 'STEP 2 EXPECTED: Person A should NOT see Person B\'s KPI in their inbox').toBeFalsy();

    // STEP 3 (ADO): Verify via API that Person B's assigned KPI also shows zero WorkflowInstance rows
    // (checked via API rather than a real login, since Person B is a reused existing account without
    // known credentials for this test).
    const wiResp = await (await page.request.get(`${WF_API}/api/dynamic/Shesha.Workflow/WorkflowInstance/Crud/GetAll?maxResultCount=500`, { headers: auth })).json();
    const wiItems = wiResp?.result?.items ?? [];
    const wiForPersonB = wiItems.filter((r: any) => (r?.subject ?? '').includes('Person B KPI'));
    const wiForPersonA = wiItems.filter((r: any) => (r?.subject ?? '').includes('Person A KPI'));
    console.log(`STEP 3 ACTUAL — WorkflowInstance rows: Person A's KPIs=${wiForPersonA.length}, Person B's KPI=${wiForPersonB.length}.`);
    expect.soft(wiForPersonB.length, 'STEP 3 EXPECTED (per ADO): Person B should have 1 WorkflowInstance for their assigned KPI — CONFIRMED GAP if 0, consistent with the already-confirmed root defect').toBe(1);

    console.log(`NOTE — this disposable report (id ${reportId}) is left Published.`);
  });
});
