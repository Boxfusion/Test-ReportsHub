import { test, expect } from '@playwright/test';

// ADO suite 109523 (plan 108745, "13 · EPM · Stage 1 — Save as Draft and resume"): TC-108789
// (Positive), TC-108844 (Negative), TC-108845 (Edge — survives logout), TC-108846 (Integration — not
// in Sent items).
//
// CORRECTED 2026-08-31: previously blocked (see epm-stage1-save-draft-unverifiable) because no live
// Stage 1 item could ever be originated — root cause was epm-open-progress-report-inert, reversed the
// same day. See epm-stage1-capture-form.spec.ts for the same build+open pattern and the real
// workflow-action navigation technique (todoId is per-fetch volatile).
//
// CONFIRMED DEFECT found once unblocked: clicking "Save" (not Submit) on a freshly-opened Stage 1
// capture form fails with a genuine 404 — the frontend sends
// `{"id":"00000000-0000-0000-0000-000000000000", ...}` to ComponentProgressReport/Crud/Update, an
// empty GUID, so the backend correctly rejects it ("There is no entity ... with id =
// 00000000-0000-0000-0000-000000000000!"). Reproduced twice, including with a 15s wait before
// interacting (ruling out a load-timing race). The typed value never persists as a result. Note: the
// form does correctly write into `indicatorActualText` (a text-mirror field, not the numeric
// `indicatorActual`) when a save DOES succeed — same pattern as Annual Target in TC-109456 — this
// spec's assertions check the correct field name.

const BASE = 'https://pd-epm-adminportal-qa-wf.shesha.app';
const WF_API = 'https://pd-epm-api-qa-wf.shesha.app';
const TEMPLATE_ID = '77a75071-5385-4ae7-bb5e-42cc4619ee87';
const PERIOD_ID = '8062531f-2326-4fc7-8ea3-582d11bcdcb1';
const DEPARTMENT_TYPE_ID = 'f1ec68a8-ea98-41eb-9080-ea969ed89fd0';
const QUANT_KPI_TYPE_ID = '60e8340a-bdb7-4ac8-8b24-f90d2b5951bb';
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

test.use({ channel: CHANNEL, actionTimeout: 30_000, navigationTimeout: 120_000 });

async function loginAndGetAuth(page: any, userName: string, password: string) {
  await page.goto(`${BASE}/login`, { waitUntil: 'domcontentloaded' });
  await expect(page.locator('input').first()).toBeVisible({ timeout: SLOW });
  await page.locator('input').first().fill(userName);
  await page.locator('input[type="password"]').first().fill(password);
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
  return { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' };
}

async function buildAndOpenReport(page: any, auth: any, suffix: string, kpiName: string) {
  const createReportResp = await page.request.post(`${WF_API}/api/v1/Epm/PerformanceReports/CreatePerformanceReport`, {
    headers: auth,
    data: { name: `S1Draft Report ${suffix}`, shortName: `S1D-${suffix}`, templateId: TEMPLATE_ID, periodCoveredId: PERIOD_ID },
  });
  const reportId = (await createReportResp.json().catch(() => null))?.result?.id;
  expect(createReportResp.status(), 'the disposable report should be creatable').toBeLessThan(400);
  const rootResp = await page.request.post(`${WF_API}/api/dynamic/Epm/Component/Crud/Create`, {
    headers: auth,
    data: { name: 'S1Draft Department', componentType: DEPARTMENT_TYPE_ID, performanceReport: reportId, parent: null },
  });
  const rootId = (await rootResp.json().catch(() => null))?.result?.id;
  const kpiResp = await page.request.post(`${WF_API}/api/dynamic/Epm/Component/Crud/Create`, {
    headers: auth,
    data: { name: kpiName, componentType: QUANT_KPI_TYPE_ID, performanceReport: reportId, parent: rootId, finalIndicatorTarget: 100, finalIndicatorTargetText: '100' },
  });
  const kpiId = (await kpiResp.json().catch(() => null))?.result?.id;
  expect(kpiResp.status(), `${kpiName} should be creatable`).toBeLessThan(400);
  for (const s of STAGE_PERSONS) {
    await page.request.post(`${WF_API}/api/dynamic/Epm/ComponentActioner/Crud/Create`, {
      headers: auth,
      data: { component: kpiId, actioner: s.id, actionLevel: s.level },
    });
  }

  await page.goto(`${BASE}/dynamic/Epm/performance-report-details-view?id=${reportId}`, { waitUntil: 'domcontentloaded' });
  await expect(page.getByText(`Performance Report: S1Draft Report ${suffix}`, { exact: true })).toBeVisible({ timeout: SLOW });
  const publishBtn = page.locator('button', { hasText: 'Publish Performance Report' }).first();
  await expect(publishBtn).toBeVisible({ timeout: 30_000 });
  await publishBtn.click();
  let publishStatus = null;
  for (let i = 0; i < 8 && publishStatus !== 20; i++) {
    await page.waitForTimeout(1500);
    const r = await (await page.request.get(`${WF_API}/api/dynamic/Epm/PerformanceReport/Crud/Get?id=${reportId}`, { headers: auth })).json();
    publishStatus = r?.result?.status;
  }
  expect(publishStatus, 'the report should now be Published (20)').toBe(20);

  await page.reload({ waitUntil: 'domcontentloaded' });
  await page.waitForTimeout(3000);
  const q1Cell = page.locator('[role="row"]').filter({ hasText: 'Quarter 1 2026/27' }).getByText('Quarter 1 2026/27', { exact: true }).first();
  await q1Cell.click();
  await page.waitForTimeout(1500);
  const reportingPeriodsPanel = page.locator('.sha-components-container-inner').filter({ hasText: 'Total' });
  const overflowTrigger = reportingPeriodsPanel.locator('.ant-menu-submenu-title, .anticon-ellipsis').first();
  await expect(overflowTrigger).toBeVisible({ timeout: 10_000 });
  let itemBox: { x: number; y: number; width: number; height: number } | null = null;
  for (let attempt = 0; attempt < 5 && !itemBox; attempt++) {
    await overflowTrigger.hover();
    await page.waitForTimeout(600);
    const candidate = page.locator('.ant-menu-submenu-popup:not(.ant-menu-submenu-hidden)').getByText('Open Progress Report', { exact: true }).first();
    if (await candidate.isVisible().catch(() => false)) itemBox = await candidate.boundingBox();
  }
  expect(itemBox, 'the overflow popup should open').toBeTruthy();
  await page.mouse.move(itemBox!.x + itemBox!.width / 2, itemBox!.y + itemBox!.height / 2);
  await page.waitForTimeout(150);
  await page.mouse.click(itemBox!.x + itemBox!.width / 2, itemBox!.y + itemBox!.height / 2);
  await page.waitForTimeout(1500);
  const confirmBtn = page.locator('.ant-modal-content').getByRole('button', { name: 'Open', exact: true }).first();
  await expect(confirmBtn).toBeVisible({ timeout: 5000 });
  await confirmBtn.click();
  await page.waitForTimeout(3000);

  return { reportId, kpiId };
}

async function getFreshInboxItem(page: any, auth: any, kpiName: string) {
  const inboxResp = await (await page.request.get(`${WF_API}/api/dynamic/Shesha.Workflow/WorkflowInboxItem/Crud/GetAll?maxResultCount=50`, { headers: auth })).json();
  return (inboxResp?.result?.items ?? []).find((i: any) => (i.name ?? i.subject ?? '').includes(kpiName));
}

test.describe('EPM — Stage 1 Save as Draft (ADO plan 108745 / suite 109523)', () => {
  test('TC-108789 Positive — Save a KPI progress entry as Draft, resume later', async ({ page }) => {
    test.setTimeout(480_000);
    const adminAuth = await loginAndGetAuth(page, 'admin.PrincessH', '123qwe');
    const suffix = `${Date.now()}`.slice(-8);
    const kpiName = `S1Draft KPI ${suffix}`;
    const { kpiId } = await buildAndOpenReport(page, adminAuth, suffix, kpiName);

    const stage1Auth = await loginAndGetAuth(page, 'stage1', '123qwe');
    const target = await getFreshInboxItem(page, stage1Auth, kpiName);
    expect(target, 'a Stage 1 inbox item should exist').toBeTruthy();

    await page.goto(`${BASE}/shesha/workflow-action?id=${target.workflowInstanceId}&todoid=${target.todoId}`, { waitUntil: 'domcontentloaded' });
    await page.waitForTimeout(15000);

    // Enter a partial Actual value. Dump ALL input elements to find the real "Actual Target" field.
    // Only 2 plain <input type="text"> elements exist on this form (Percentage Base/Variance render
    // as read-only text, not inputs) — index [0] is Quarter Target, [1] is Actual Target, in DOM/visual
    // order matching the form's own field sequence.
    const plainTextInputs = page.locator('input[type="text"].ant-input');
    const plainCount = await plainTextInputs.count();
    console.log(`STEP ACTUAL — plain text inputs found: ${plainCount}.`);
    const actualInput = plainTextInputs.nth(1);
    const actualInputVisible = await actualInput.isVisible().catch(() => false);
    console.log(`STEP ACTUAL — Actual Target input (index 1) visible: ${actualInputVisible}.`);
    if (actualInputVisible) {
      await actualInput.fill('45');
      await page.waitForTimeout(500);
    }

    const saveResponses: string[] = [];
    page.on('response', async (res) => {
      if (res.url().includes('ComponentProgressReport/Crud/Update')) {
        const body = await res.text().catch(() => 'FAILED TO READ');
        saveResponses.push(`${res.status()} ${res.url()} BODY=${body.slice(0, 800)}`);
      }
    });

    const saveBtn = page.getByRole('button', { name: 'Save', exact: true }).first();
    const saveVisible = await saveBtn.isVisible().catch(() => false);
    console.log(`STEP ACTUAL — Save button visible: ${saveVisible}.`);
    expect(saveVisible, 'STEP EXPECTED: a Save (not Submit) button should be present').toBeTruthy();
    await saveBtn.click();
    await page.waitForTimeout(3000);
    console.log(`STEP DEBUG — Save response(s): ${JSON.stringify(saveResponses)}.`);

    // Verify the form stays open (no navigation away) and progressReportStatus unchanged.
    const stillOnForm = page.url().includes('/shesha/workflow-action');
    console.log(`STEP ACTUAL — still on the capture form after Save: ${stillOnForm}, URL: ${page.url()}.`);
    expect(stillOnForm, 'STEP EXPECTED: Save should keep the form open, not navigate away').toBeTruthy();

    const saveFailed404 = saveResponses.some((r) => r.startsWith('404') && r.includes('00000000-0000-0000-0000-000000000000'));
    console.log(`STEP ACTUAL — Save request failed with a 404 (empty-GUID CPR id): ${saveFailed404}.`);
    expect.soft(saveFailed404, 'STEP EXPECTED (per ADO, preferred outcome): Save should succeed — CONFIRMED DEFECT if the request 404s because the form sends an empty GUID as the ComponentProgressReport id').toBeFalsy();

    const cprResp = await (await page.request.get(`${WF_API}/api/dynamic/Epm/ComponentProgressReport/Crud/GetAll?maxResultCount=2000`, { headers: adminAuth })).json();
    const cprForKpi = (cprResp?.result?.items ?? []).find((r: any) => r?.component?.id === kpiId && /q(uarter)?\s*1/i.test(r.periodName ?? ''));
    console.log(`STEP ACTUAL — after Save: indicatorActualText=${cprForKpi?.indicatorActualText}, progressReportStatus=${cprForKpi?.progressReportStatus}.`);
    // The form writes the entered value into indicatorActualText (a text-mirror field), not the
    // numeric indicatorActual — same pattern already confirmed for Annual Target in TC-109456.
    expect.soft(cprForKpi?.indicatorActualText, 'STEP EXPECTED (per ADO): the partial value should persist after Save').toBe('45');
    expect.soft(cprForKpi?.progressReportStatus, 'STEP EXPECTED (per ADO): progressReportStatus should remain unchanged (still Open, not advanced) after a Save (not Submit)').toBe(20);

    // Navigate away and back, confirm the partial value persisted.
    await page.goto(`${BASE}/dynamic/Shesha.Workflow/workflows-inbox`, { waitUntil: 'domcontentloaded' });
    await page.waitForTimeout(2000);
    const targetAfter = await getFreshInboxItem(page, stage1Auth, kpiName);
    expect(targetAfter, 'the item should still be a Stage 1 inbox item after Save (not advanced)').toBeTruthy();
    await page.goto(`${BASE}/shesha/workflow-action?id=${targetAfter.workflowInstanceId}&todoid=${targetAfter.todoId}`, { waitUntil: 'domcontentloaded' });
    await page.waitForTimeout(8000);
    const resumedInputs = page.locator('input[type="text"].ant-input');
    const resumedValue = await resumedInputs.nth(1).inputValue().catch(() => null);
    console.log(`STEP ACTUAL — resumed form's Actual Target value: "${resumedValue}".`);
    expect.soft(resumedValue, 'STEP EXPECTED (per ADO): navigating away and back should show the persisted partial value').toBe('45');
  });
});
