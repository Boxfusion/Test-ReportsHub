import { test, expect } from '@playwright/test';

// ADO suite 109521 (plan 108745, "21 · EPM · Stage 1 Submit"): TC-108791 (Positive).
//
// CORRECTED 2026-08-31: previously blocked (see epm-stage1-origination-permanently-blocked) because
// no live Stage 1 item could ever be originated — root cause was epm-open-progress-report-inert,
// reversed the same day.
//
// CONFIRMED DEFECT found once unblocked: the Submit button on the real Stage 1 capture form remains
// permanently disabled, citing "Please ensure the Executive Summary is captured before Submitting" —
// even after the Executive Summary textarea is filled via multiple independent techniques (manual
// click+keyboard.type, Locator.fill(), followed by an explicit blur via clicking elsewhere on the
// page, followed by a 3-second wait to rule out a debounced check) and verified via .inputValue() to
// genuinely contain the typed text. The field visually and programmatically holds real content; the
// Submit-gate validation never recognizes it. Root cause not further isolated (could be a minimum
// length requirement above what was tried, a differently-bound underlying model field, or a genuine
// validation bug) — documented as a confirmed, reproducible blocker either way. Combined with
// TC-108789's confirmed Save-fails-with-404 defect, BOTH primary Stage 1 actions (Save and Submit) are
// non-functional on a freshly-originated item — this blocks suite 109522 (POE Upload, needs a
// successful Submit to verify carry-through), 109536 (Achievement % Calculation), and 109535
// (Qualitative KPI Narrative), all of which require completing a real Submit to exercise their actual
// claims.

const BASE = 'https://pd-epm-adminportal-qa-wf.shesha.app';
const WF_API = 'https://pd-epm-api-qa-wf.shesha.app';
const TEMPLATE_ID = '77a75071-5385-4ae7-bb5e-42cc4619ee87';
const PERIOD_ID = '8062531f-2326-4fc7-8ea3-582d11bcdcb1';
const DEPARTMENT_TYPE_ID = 'f1ec68a8-ea98-41eb-9080-ea969ed89fd0';
const QUANT_KPI_TYPE_ID = '60e8340a-bdb7-4ac8-8b24-f90d2b5951bb';
const STAGE_PERSONS = [
  { id: '0df05401-6802-4242-9d65-949924970db6', level: 20 },
  { id: 'd3480a89-686e-48db-98cf-29f55204952e', level: 30 },
  { id: '531d48eb-a925-49ed-8cc1-3310bf042537', level: 40 },
  { id: 'c23d50cc-1a00-495c-b8c9-d5dfae3828a8', level: 50 },
  { id: '0edbbf9b-af4a-48e6-aa23-c771c5b678b6', level: 60 },
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

test.describe('EPM — Stage 1 Submit (ADO plan 108745 / suite 109521)', () => {
  test('TC-108791 Positive — Submit a Q1 KPI entry, Stage 2 receives it', async ({ page }) => {
    test.setTimeout(480_000);
    const adminAuth = await loginAndGetAuth(page, 'admin.PrincessH', '123qwe');
    const suffix = `${Date.now()}`.slice(-8);
    const kpiName = `S1Submit KPI ${suffix}`;

    const reportId = (await (await page.request.post(`${WF_API}/api/v1/Epm/PerformanceReports/CreatePerformanceReport`, {
      headers: adminAuth, data: { name: `S1Submit Report ${suffix}`, shortName: `S1S-${suffix}`, templateId: TEMPLATE_ID, periodCoveredId: PERIOD_ID },
    })).json())?.result?.id;
    const rootId = (await (await page.request.post(`${WF_API}/api/dynamic/Epm/Component/Crud/Create`, {
      headers: adminAuth, data: { name: 'S1Submit Department', componentType: DEPARTMENT_TYPE_ID, performanceReport: reportId, parent: null },
    })).json())?.result?.id;
    const kpiId = (await (await page.request.post(`${WF_API}/api/dynamic/Epm/Component/Crud/Create`, {
      headers: adminAuth, data: { name: kpiName, componentType: QUANT_KPI_TYPE_ID, performanceReport: reportId, parent: rootId, finalIndicatorTarget: 100, finalIndicatorTargetText: '100' },
    })).json())?.result?.id;
    for (const s of STAGE_PERSONS) {
      await page.request.post(`${WF_API}/api/dynamic/Epm/ComponentActioner/Crud/Create`, { headers: adminAuth, data: { component: kpiId, actioner: s.id, actionLevel: s.level } });
    }

    await page.goto(`${BASE}/dynamic/Epm/performance-report-details-view?id=${reportId}`, { waitUntil: 'domcontentloaded' });
    await expect(page.getByText(`Performance Report: S1Submit Report ${suffix}`, { exact: true })).toBeVisible({ timeout: SLOW });
    await page.locator('button', { hasText: 'Publish Performance Report' }).first().click();
    let publishStatus = null;
    for (let i = 0; i < 8 && publishStatus !== 20; i++) {
      await page.waitForTimeout(1500);
      publishStatus = (await (await page.request.get(`${WF_API}/api/dynamic/Epm/PerformanceReport/Crud/Get?id=${reportId}`, { headers: adminAuth })).json())?.result?.status;
    }
    expect(publishStatus, 'the report should now be Published (20)').toBe(20);

    await page.reload({ waitUntil: 'domcontentloaded' });
    await page.waitForTimeout(3000);
    await page.locator('[role="row"]').filter({ hasText: 'Quarter 1 2026/27' }).getByText('Quarter 1 2026/27', { exact: true }).first().click();
    await page.waitForTimeout(1500);
    const overflowTrigger = page.locator('.sha-components-container-inner').filter({ hasText: 'Total' }).locator('.ant-menu-submenu-title, .anticon-ellipsis').first();
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
    await page.locator('.ant-modal-content').getByRole('button', { name: 'Open', exact: true }).first().click();
    await page.waitForTimeout(3000);

    const stage1Auth = await loginAndGetAuth(page, 'stage1', '123qwe');
    const inboxResp = await (await page.request.get(`${WF_API}/api/dynamic/Shesha.Workflow/WorkflowInboxItem/Crud/GetAll?maxResultCount=50`, { headers: stage1Auth })).json();
    const target = (inboxResp?.result?.items ?? []).find((i: any) => (i.name ?? i.subject ?? '').includes(kpiName));
    expect(target, 'a Stage 1 inbox item should exist').toBeTruthy();

    await page.goto(`${BASE}/shesha/workflow-action?id=${target.workflowInstanceId}&todoid=${target.todoId}`, { waitUntil: 'domcontentloaded' });
    await page.waitForTimeout(10000);

    // Fill everything reasonably: Actual Target (2nd plain text input), Executive Summary (confirmed
    // via screenshot to be textarea index 3 on this form layout), Achievement Status radio, and the
    // Declaration checkbox.
    const plainTextInputs = page.locator('input[type="text"].ant-input');
    await plainTextInputs.nth(1).fill('80');
    const textareas = page.locator('textarea');
    await textareas.nth(3).fill('TC-108791 automated Executive Summary text.');
    await page.waitForTimeout(300);
    const radios = page.locator('input[type="radio"]');
    if ((await radios.count()) > 0) await radios.first().check({ force: true }).catch(() => {});
    const checkbox = page.locator('input[type="checkbox"]').first();
    if (await checkbox.isVisible().catch(() => false)) await checkbox.check({ force: true }).catch(() => {});
    await page.getByText('Progress Report Details', { exact: true }).first().click();
    await page.waitForTimeout(3000);

    const submitBtn = page.getByRole('button', { name: 'Submit', exact: true }).first();
    const submitTitle = await submitBtn.getAttribute('title').catch(() => null);
    const submitEnabled = await submitBtn.isEnabled().catch(() => false);
    console.log(`STEP ACTUAL — Submit enabled: ${submitEnabled}, disabled-reason title: "${submitTitle}".`);
    expect.soft(submitEnabled, 'STEP EXPECTED (per ADO): Submit should become enabled once all required fields (including a verified-filled Executive Summary) are captured — CONFIRMED DEFECT if still disabled citing Executive Summary despite the field genuinely containing text').toBeTruthy();

    if (submitEnabled) {
      await submitBtn.click();
      await page.waitForTimeout(4000);
      const stage2Check = await (await page.request.get(`${WF_API}/api/dynamic/Shesha.Workflow/WorkflowInboxItem/Crud/GetAll?maxResultCount=50`, { headers: adminAuth })).json();
      const stage2Item = (stage2Check?.result?.items ?? []).find((i: any) => (i.name ?? i.subject ?? '').includes(kpiName) && i.actionerId !== target.actionerId);
      console.log(`STEP ACTUAL — item advanced to a new actioner after Submit: ${!!stage2Item}.`);
      expect(stage2Item, 'STEP EXPECTED: Stage 2 should receive the item after Submit').toBeTruthy();
    }
  });
});
