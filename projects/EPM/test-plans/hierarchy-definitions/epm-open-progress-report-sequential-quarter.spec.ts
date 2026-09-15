import { test, expect } from '@playwright/test';

// ADO TC-108838 (plan 108745, suite 11 · EPM · Open Progress Report — per-stage inbox spawn
// verification. Anchor: ProgressReportsAppService.PublishProgressReportAsync:67-103). Negative:
// precondition — Quarter 1 Progress Report is at status Open. Attempt to click "Open Progress Report"
// on Quarter 2 — expect rejection citing sequential-quarter discipline; confirm Quarter 2 status
// remains NotDue; close Quarter 1 first, then retry Quarter 2 — expect it opens successfully.
//
// CORRECTED 2026-08-31 (case owner caught this manually): the real "Open Progress Report" UI action
// genuinely works — see epm-open-progress-report-inert (TC-108787). The original version of this spec
// used a raw ProgressReport.status PUT as a proxy for the real action, reasoning that the real action
// was inert anyway — that reasoning no longer holds, and a raw entity update bypasses whatever
// validation the real AppService endpoint (PublishProgressReportAsync, called via
// PUT .../ProgressReports/{id}/PublishProgressReport) might actually enforce. This version drives the
// REAL UI action for both Q1 and the Q2 gate-test, using the corrected hover-retry +
// raw-mouse-coordinate interaction, and only falls back to a raw status reset for "close Q1" in step 3
// (no dedicated, confirmed-working "Close Progress Report" UI action exists yet — see
// epm-close-reopen-retract-not-independently-verified).

const BASE = 'https://pd-epm-adminportal-qa-wf.shesha.app';
const WF_API = 'https://pd-epm-api-qa-wf.shesha.app';
const TEMPLATE_ID = '77a75071-5385-4ae7-bb5e-42cc4619ee87'; // Standard Annual Performance Plan
const PERIOD_ID = '8062531f-2326-4fc7-8ea3-582d11bcdcb1'; // Financial Year 2026/27
const DEPARTMENT_TYPE_ID = 'f1ec68a8-ea98-41eb-9080-ea969ed89fd0';
const KPI_TYPE_ID = '60e8340a-bdb7-4ac8-8b24-f90d2b5951bb';
const DRAFT_STATUS = 0;
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

test.describe('EPM — Open Progress Report sequential-quarter discipline (ADO plan 108745 / suite 11)', () => {
  test('TC-108838 Negative — Quarter 2 should not open while Quarter 1 is still Open', async ({ page }) => {
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

    // Build a fresh disposable report with one KPI — enough to Publish and drive the real Open action.
    const suffix = `${Date.now()}`.slice(-8);
    const createReportResp = await page.request.post(`${WF_API}/api/v1/Epm/PerformanceReports/CreatePerformanceReport`, {
      headers: auth,
      data: { name: `TC-108838 Fresh Test Report ${suffix}`, shortName: `TC108838-${suffix}`, templateId: TEMPLATE_ID, periodCoveredId: PERIOD_ID },
    });
    const reportId = (await createReportResp.json().catch(() => null))?.result?.id;
    expect(createReportResp.status(), 'the disposable report should be creatable').toBeLessThan(400);

    const rootResp = await page.request.post(`${WF_API}/api/dynamic/Epm/Component/Crud/Create`, {
      headers: auth,
      data: { name: 'Fresh Test Department', componentType: DEPARTMENT_TYPE_ID, performanceReport: reportId, parent: null },
    });
    const rootId = (await rootResp.json().catch(() => null))?.result?.id;
    expect(rootResp.status(), 'the root Department should be creatable').toBeLessThan(400);

    const kpiResp = await page.request.post(`${WF_API}/api/dynamic/Epm/Component/Crud/Create`, {
      headers: auth,
      data: { name: 'TC108838 KPI', componentType: KPI_TYPE_ID, performanceReport: reportId, parent: rootId, finalIndicatorTarget: 100, finalIndicatorTargetText: '100' },
    });
    const kpiId = (await kpiResp.json().catch(() => null))?.result?.id;
    expect(kpiResp.status(), 'the KPI should be creatable').toBeLessThan(400);
    for (const s of STAGE_PERSONS) {
      const r = await page.request.post(`${WF_API}/api/dynamic/Epm/ComponentActioner/Crud/Create`, {
        headers: auth,
        data: { component: kpiId, actioner: s.id, actionLevel: s.level },
      });
      expect(r.status(), `the ${s.name} actioner should succeed`).toBeLessThan(400);
    }

    await page.goto(`${BASE}/dynamic/Epm/performance-report-details-view?id=${reportId}`, { waitUntil: 'domcontentloaded' });
    await expect(page.getByText(`Performance Report: TC-108838 Fresh Test Report ${suffix}`, { exact: true })).toBeVisible({ timeout: SLOW });
    const publishBtn = page.locator('button', { hasText: 'Publish Performance Report' }).first();
    await expect(publishBtn).toBeVisible({ timeout: 30_000 });
    await publishBtn.click();
    let publishStatus = null;
    for (let i = 0; i < 8 && publishStatus !== 20; i++) {
      await page.waitForTimeout(1500);
      const r = await (await page.request.get(`${WF_API}/api/dynamic/Epm/PerformanceReport/Crud/Get?id=${reportId}`, { headers: auth })).json();
      publishStatus = r?.result?.status;
    }
    console.log(`PRECONDITION ACTUAL — status after Publish: ${publishStatus}.`);
    expect(publishStatus, 'the report should now be Published (20)').toBe(20);

    const prResp = await (await page.request.get(`${WF_API}/api/dynamic/Epm/ProgressReport/Crud/GetAll?maxResultCount=2000`, { headers: auth })).json();
    const items = prResp?.result?.items ?? [];
    const forReport = items.filter((r: any) => r?.performanceReport?.id === reportId);
    const q1 = forReport.find((r: any) => r.periodCovered?._displayName === 'Quarter 1 2026/27');
    const q2 = forReport.find((r: any) => r.periodCovered?._displayName === 'Quarter 2 2026/27');
    expect(q1, 'a Quarter 1 ProgressReport row should exist').toBeTruthy();
    expect(q2, 'a Quarter 2 ProgressReport row should exist').toBeTruthy();
    console.log(`Q1 id=${q1.id} status=${q1.status}; Q2 id=${q2.id} status=${q2.status}.`);

    // Reusable: open a given quarter via the real UI action (corrected hover + raw-mouse-coordinate
    // interaction). Returns the API requests fired and whether a confirm dialog appeared.
    async function openQuarterViaUi(periodLabel: string) {
      await page.reload({ waitUntil: 'domcontentloaded' });
      await page.waitForTimeout(3000);
      const cell = page.locator('[role="row"]').filter({ hasText: periodLabel }).getByText(periodLabel, { exact: true }).first();
      await cell.click();
      await page.waitForTimeout(1500);
      const reportingPeriodsPanel = page.locator('.sha-components-container-inner').filter({ hasText: 'Total' });
      const overflowTrigger = reportingPeriodsPanel.locator('.ant-menu-submenu-title, .anticon-ellipsis').first();
      const triggerVisible = await overflowTrigger.isVisible({ timeout: 10_000 }).catch(() => false);
      if (!triggerVisible) {
        console.log('DEBUG — overflow trigger not found. Page body:', (await page.locator('body').innerText().catch(() => 'FAILED')).slice(0, 1500));
        return { popupOpened: false, dialogAppeared: false, requests: [] as string[] };
      }
      let itemBox: { x: number; y: number; width: number; height: number } | null = null;
      for (let attempt = 0; attempt < 5 && !itemBox; attempt++) {
        await overflowTrigger.hover();
        await page.waitForTimeout(600);
        const candidate = page.locator('.ant-menu-submenu-popup:not(.ant-menu-submenu-hidden)').getByText('Open Progress Report', { exact: true }).first();
        if (await candidate.isVisible().catch(() => false)) itemBox = await candidate.boundingBox();
      }
      if (!itemBox) return { popupOpened: false, dialogAppeared: false, requests: [] as string[] };
      const requests: string[] = [];
      const listener = (req: any) => { if (req.url().includes('/api/')) requests.push(`${req.method()} ${req.url()}`); };
      page.on('request', listener);
      await page.mouse.move(itemBox.x + itemBox.width / 2, itemBox.y + itemBox.height / 2);
      await page.waitForTimeout(150);
      await page.mouse.click(itemBox.x + itemBox.width / 2, itemBox.y + itemBox.height / 2);
      await page.waitForTimeout(1500);
      const confirmBtn = page.locator('.ant-modal-content').getByRole('button', { name: 'Open', exact: true }).first();
      const dialogAppeared = await confirmBtn.isVisible().catch(() => false);
      if (dialogAppeared) {
        await confirmBtn.click();
        await page.waitForTimeout(3000);
      }
      page.off('request', listener);
      return { popupOpened: true, dialogAppeared, requests };
    }

    // PRECONDITION (ADO): Quarter 1 Progress Report is at status Open — via the real UI action.
    const q1Open = await openQuarterViaUi('Quarter 1 2026/27');
    console.log(`PRECONDITION ACTUAL — opened Q1 via UI: popup=${q1Open.popupOpened}, dialog=${q1Open.dialogAppeared}, requests=${JSON.stringify(q1Open.requests)}.`);
    expect(q1Open.dialogAppeared, 'PRECONDITION EXPECTED: Q1 should open via the real UI action').toBeTruthy();
    const q1AfterOpen = await (await page.request.get(`${WF_API}/api/dynamic/Epm/ProgressReport/Crud/Get?id=${q1.id}`, { headers: auth })).json();
    expect(q1AfterOpen?.result?.status, 'PRECONDITION EXPECTED: Q1 should now be Open (20)').toBe(20);

    // STEP 1 (ADO): Attempt to open Quarter 2 via the real UI action while Quarter 1 is still Open.
    const q2Attempt = await openQuarterViaUi('Quarter 2 2026/27');
    console.log(`STEP 1 ACTUAL — attempted to open Q2 via UI while Q1 Open: popup=${q2Attempt.popupOpened}, dialog=${q2Attempt.dialogAppeared}, requests=${JSON.stringify(q2Attempt.requests)}.`);
    const q2AfterAttempt = await (await page.request.get(`${WF_API}/api/dynamic/Epm/ProgressReport/Crud/Get?id=${q2.id}`, { headers: auth })).json();
    console.log(`STEP 1/2 ACTUAL — Q2 status after the attempt: ${q2AfterAttempt?.result?.status} (started at ${q2.status}).`);
    const rejected = !q2Attempt.dialogAppeared || q2AfterAttempt?.result?.status === q2.status;
    expect.soft(rejected, 'STEP 1/2 EXPECTED (per ADO): opening Quarter 2 while Quarter 1 is Open should be rejected, citing sequential-quarter discipline — CONFIRMED DEFECT if Q2 genuinely opens via the real UI action too').toBeTruthy();

    // STEP 3 (ADO): Close Quarter 1 first, then retry Quarter 2 — expect it opens successfully. No
    // dedicated, confirmed-working "Close Progress Report" UI action exists yet — reset via raw status
    // update as a proxy (documented limitation, not claiming this exercises a real "Close" mechanism).
    const closeQ1 = await page.request.put(`${WF_API}/api/dynamic/Epm/ProgressReport/Crud/Update`, {
      headers: auth,
      data: { id: q1.id, status: DRAFT_STATUS },
    });
    console.log(`STEP 3 ACTUAL — close Q1 (reset to Draft via raw update, proxy for a real Close action): ${closeQ1.status()}.`);
    expect(closeQ1.status(), 'STEP 3 EXPECTED: closing Q1 should succeed').toBeLessThan(400);

    // Q2 already opened as a direct consequence of STEP 1's confirmed defect (the "rejected" attempt
    // actually succeeded) — the overflow menu no longer offers "Open Progress Report" for an
    // already-Open period, so there is nothing left to retry. Document this rather than treat it as a
    // separate failure.
    if (q2AfterAttempt?.result?.status === 20) {
      console.log('STEP 3 NOTE — Q2 was already Open as a direct result of STEP 1\'s confirmed defect; nothing to retry. Confirming it stays Open.');
      const q2Final = await (await page.request.get(`${WF_API}/api/dynamic/Epm/ProgressReport/Crud/Get?id=${q2.id}`, { headers: auth })).json();
      expect(q2Final?.result?.status, 'STEP 3: Q2 should remain Open').toBe(20);
    } else {
      const q2Retry = await openQuarterViaUi('Quarter 2 2026/27');
      console.log(`STEP 3 ACTUAL — retry opening Q2 via UI after closing Q1: popup=${q2Retry.popupOpened}, dialog=${q2Retry.dialogAppeared}, requests=${JSON.stringify(q2Retry.requests)}.`);
      expect(q2Retry.dialogAppeared, 'STEP 3 EXPECTED: Quarter 2 should open successfully once Quarter 1 is closed').toBeTruthy();
      const q2AfterRetry = await (await page.request.get(`${WF_API}/api/dynamic/Epm/ProgressReport/Crud/Get?id=${q2.id}`, { headers: auth })).json();
      console.log(`STEP 3 ACTUAL — Q2 status after retry: ${q2AfterRetry?.result?.status}.`);
      expect(q2AfterRetry?.result?.status, 'STEP 3 EXPECTED: Q2 should now be Open').toBe(20);
    }
  });
});
