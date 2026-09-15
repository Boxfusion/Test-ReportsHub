import { test, expect } from '@playwright/test';

// ADO suite 109521 (plan 108745, "21 · EPM · Stage 1 Submit"): TC-108850 (Negative — POE missing),
// TC-108851 (Edge — concurrent Submit from two tabs), TC-108852 (Integration — Submit triggers
// Notification to Stage 2).
//
// All three fundamentally require a SUCCESSFUL Submit to test their real claims — TC-108850 needs
// Submit to reject specifically because POE is missing (not for unrelated reasons); TC-108851 needs a
// first successful Submit before a second concurrent one can be checked as a no-op; TC-108852 needs a
// real Submit to check whether it triggers a notification. See epm-stage1-submit-permanently-blocked:
// Submit never becomes enabled, confirmed even on a fully correct, fully filled real KPI (Executive
// Summary genuinely present, Declaration checked, everything filled) — this spec reconfirms that root
// blocker on a FRESH, untouched real item (Q2, not the already-exercised Q1) before ledgering all three
// as blocked by it, rather than assuming the earlier finding carries over unverified.

const BASE = 'https://pd-epm-adminportal-qa-wf.shesha.app';
const WF_API = 'https://pd-epm-api-qa-wf.shesha.app';
// Quantitative KPI Q2 item — real, properly-configured, untouched this session.
const QUANT_Q2_INSTANCE_ID = 'f79d942f-d9a5-4102-80fa-545ace0f6113';

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
    }
    return null;
  });
  return { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' };
}

async function freshTodoFor(page: any, auth: any, workflowInstanceId: string) {
  const inboxResp = await (await page.request.get(`${WF_API}/api/dynamic/Shesha.Workflow/WorkflowInboxItem/Crud/GetAll?maxResultCount=100`, { headers: auth })).json();
  return (inboxResp?.result?.items ?? []).find((i: any) => i.workflowInstanceId === workflowInstanceId);
}

test.describe('EPM — Stage 1 Submit remainder (ADO plan 108745 / suite 109521)', () => {
  test('TC-108850/108851/108852 — reconfirm the Submit-permanently-blocked root cause on a fresh item', async ({ page }) => {
    test.setTimeout(300_000);
    const stage1Auth = await loginAndGetAuth(page, 'stage1', '123qwe');
    const item = await freshTodoFor(page, stage1Auth, QUANT_Q2_INSTANCE_ID);
    expect(item, 'the fresh Q2 Stage 1 inbox item should exist').toBeTruthy();
    await page.goto(`${BASE}/shesha/workflow-action?id=${item.workflowInstanceId}&todoid=${item.todoId}`, { waitUntil: 'domcontentloaded' });
    await page.waitForTimeout(9000);

    // Fill everything genuinely required: Actual Target, Executive Summary, Declaration — but
    // deliberately do NOT upload a Portfolio of Evidence file (TC-108850's precondition).
    const plainTextInputs = page.locator('input[type="text"].ant-input');
    const plainCount = await plainTextInputs.count();
    for (let i = 0; i < plainCount; i++) {
      if (await plainTextInputs.nth(i).isVisible().catch(() => false)) {
        await plainTextInputs.nth(i).fill('40').catch(() => {});
      }
    }
    await page.waitForTimeout(1000);
    const radios = page.locator('input[type="radio"]');
    if ((await radios.count()) > 0) await radios.first().check({ force: true }).catch(() => {});
    const textareas = page.locator('textarea');
    const taCount = await textareas.count();
    for (let i = 0; i < taCount; i++) {
      if (await textareas.nth(i).isVisible().catch(() => false)) {
        await textareas.nth(i).fill(`TC-108850/851/852 test content [${i}].`).catch(() => {});
      }
    }
    const checkbox = page.locator('input[type="checkbox"]').first();
    if (await checkbox.isVisible().catch(() => false)) await checkbox.check({ force: true }).catch(() => {});
    await page.waitForTimeout(1500);

    const submitBtn = page.getByRole('button', { name: 'Submit', exact: true }).first();
    const submitTitle = await submitBtn.getAttribute('title').catch(() => null);
    const submitEnabled = await submitBtn.isEnabled().catch(() => false);
    console.log(`STEP ACTUAL — Submit title (POE deliberately NOT attached): "${submitTitle}", enabled: ${submitEnabled}.`);

    // TC-108850: is the rejection SPECIFICALLY about POE, or the same generic Executive-Summary block?
    const rejectionCitesExecSummary = /executive summary/i.test(submitTitle ?? '');
    const rejectionCitesPOE = /portfolio of evidence|poe/i.test(submitTitle ?? '');
    console.log(`STEP ACTUAL (TC-108850) — rejection cites Executive Summary: ${rejectionCitesExecSummary}; cites POE specifically: ${rejectionCitesPOE}.`);
    expect.soft(!submitEnabled && rejectionCitesPOE, 'TC-108850 EXPECTED (per ADO): Submit should be rejected SPECIFICALLY citing missing POE — CONFIRMED root-blocker if it instead cites Executive Summary (the same generic block seen on every prior attempt, unrelated to POE)').toBeTruthy();

    if (submitEnabled) {
      // If Submit were ever to become enabled, TC-108851/852 would proceed from here. Documented as
      // unreachable given the confirmed root blocker, but written defensively in case of a future fix.
      await submitBtn.click();
      await page.waitForTimeout(3000);
      console.log('UNEXPECTED — Submit succeeded; TC-108851/852 would need a full concurrent-tab / notification check here, not yet implemented since this was never expected to be reached.');
    } else {
      console.log('TC-108851/852 — NOT REACHABLE: Submit never became enabled, so there is no successful Submit to test a concurrent second attempt against, nor a real trigger point to check for a Stage 2 notification. Root cause: see epm-stage1-submit-permanently-blocked (reconfirmed again here, on a completely fresh Q2 item never touched before today).');
    }
  });
});
