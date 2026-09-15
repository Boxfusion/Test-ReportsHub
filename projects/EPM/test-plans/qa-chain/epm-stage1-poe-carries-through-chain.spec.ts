import { test, expect } from '@playwright/test';

// ADO suite 109522 (plan 108745, "20 · EPM · Stage 1 POE attachment upload"): TC-108849.
//
// Drives the real item CPR2026/1071 (already Draft at Stage 1, with a real Portfolio of Evidence
// attachment from TC-108790) through Submit and the full Stage 2->6 QA chain, confirming the POE
// StoredFile reference survives every single stage transition unchanged.
//
// SIGNIFICANT: Submit worked here once the Declaration Statement checkbox was genuinely checked —
// this item uses useSimplifiedReporting:true (POE-focused form, no Executive Summary field exists at
// all). This does NOT necessarily reverse epm-stage1-submit-permanently-blocked's defect, which was
// reproduced on a DIFFERENT, useSimplifiedReporting:false form (real Executive Summary field) — see
// that memory file for the important nuance before assuming Submit is fixed everywhere.

const BASE = 'https://pd-epm-adminportal-qa-wf.shesha.app';
const WF_API = 'https://pd-epm-api-qa-wf.shesha.app';
const WORKFLOW_INSTANCE_ID = '101765e8-4e95-40b2-a575-5a9a245e1cdd';
const CPR_ID = 'de37dfec-1793-4cdf-aaeb-c8a4e3556f60';

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

async function freshTodo(page: any, auth: any) {
  const inboxResp = await (await page.request.get(`${WF_API}/api/dynamic/Shesha.Workflow/WorkflowInboxItem/Crud/GetAll?maxResultCount=100`, { headers: auth })).json();
  return (inboxResp?.result?.items ?? []).find((i: any) => i.workflowInstanceId === WORKFLOW_INSTANCE_ID);
}

async function getCprPoe(page: any, auth: any) {
  const cprResp = await (await page.request.get(`${WF_API}/api/dynamic/Epm/ComponentProgressReport/Crud/Get?id=${CPR_ID}`, { headers: auth })).json();
  return { status: cprResp?.result?.progressReportStatus, poe: cprResp?.result?.portfolioOfEvidence };
}

async function driveStage(page: any, userName: string, actionButtonName: string) {
  const auth = await loginAndGetAuth(page, userName, '123qwe');
  const item = await freshTodo(page, auth);
  expect(item, `a live item should be waiting for ${userName}`).toBeTruthy();
  await page.goto(`${BASE}/shesha/workflow-action?id=${item.workflowInstanceId}&todoid=${item.todoId}`, { waitUntil: 'domcontentloaded' });
  await page.waitForTimeout(9000);

  const declCheckbox = page.locator('input[type="checkbox"]').first();
  if (await declCheckbox.isVisible().catch(() => false)) {
    await declCheckbox.check({ force: true }).catch(async () => {
      await page.locator('.ant-checkbox').first().click().catch(() => {});
    });
    await page.waitForTimeout(1000);
  }

  const actionBtn = page.getByRole('button', { name: actionButtonName, exact: true }).first();
  await expect(actionBtn, `"${actionButtonName}" should be visible for ${userName}`).toBeVisible();
  await expect(actionBtn, `"${actionButtonName}" should be enabled for ${userName} once Declaration is checked`).toBeEnabled();

  const advanceResponses: string[] = [];
  page.on('response', async (res: any) => {
    if (res.request().method() === 'POST' && res.url().includes('UserTaskComplete')) {
      advanceResponses.push(`${res.status()}`);
    }
  });
  await actionBtn.click();
  await page.waitForTimeout(6000);
  console.log(`STEP ACTUAL — ${userName} clicked "${actionButtonName}", responses: ${JSON.stringify(advanceResponses)}.`);
  expect(advanceResponses.some((r) => r.startsWith('2')), `${actionButtonName} should succeed for ${userName}`).toBeTruthy();
}

test.describe('EPM — Stage 1 POE carries through the QA chain (ADO plan 108745 / suite 109522)', () => {
  test('TC-108849 Integration — POE attachment carries through the QA chain to Stage 6', async ({ page }) => {
    test.setTimeout(600_000);

    const adminAuth = await loginAndGetAuth(page, 'admin.PrincessH', '123qwe');
    const before = await getCprPoe(page, adminAuth);
    console.log(`PRECONDITION ACTUAL — before Submit: status=${before.status}, portfolioOfEvidence=${JSON.stringify(before.poe)}.`);
    expect(before.poe?.id, 'PRECONDITION EXPECTED: the item should already carry a real Portfolio of Evidence attachment from TC-108790').toBeTruthy();
    const originalPoeId = before.poe.id;

    // Stage 1: Submit (real button is "Submit"; genuinely enabled once Declaration is checked on this
    // useSimplifiedReporting:true form).
    await driveStage(page, 'stage1', 'Submit');
    const afterSubmit = await getCprPoe(page, adminAuth);
    console.log(`STEP ACTUAL — after Submit: status=${afterSubmit.status}, portfolioOfEvidence id=${afterSubmit.poe?.id}.`);
    expect(afterSubmit.poe?.id, 'STEP EXPECTED: POE should survive Submit unchanged').toBe(originalPoeId);

    await driveStage(page, 'stage3', 'Complete QA');
    const afterStage3 = await getCprPoe(page, adminAuth);
    console.log(`STEP ACTUAL — after Stage 3: status=${afterStage3.status}, portfolioOfEvidence id=${afterStage3.poe?.id}.`);
    expect(afterStage3.poe?.id, 'STEP EXPECTED: POE should survive Stage 3 unchanged').toBe(originalPoeId);

    await driveStage(page, 'stage4', 'Approve KPI');
    const afterStage4 = await getCprPoe(page, adminAuth);
    console.log(`STEP ACTUAL — after Stage 4: status=${afterStage4.status}, portfolioOfEvidence id=${afterStage4.poe?.id}.`);
    expect(afterStage4.poe?.id, 'STEP EXPECTED: POE should survive Stage 4 unchanged').toBe(originalPoeId);

    await driveStage(page, 'stage5', 'Complete KPI');
    const afterStage5 = await getCprPoe(page, adminAuth);
    console.log(`STEP ACTUAL — after Stage 5: status=${afterStage5.status}, portfolioOfEvidence id=${afterStage5.poe?.id}.`);
    expect(afterStage5.poe?.id, 'STEP EXPECTED: POE should survive Stage 5 unchanged').toBe(originalPoeId);

    await driveStage(page, 'stage6', 'Complete KPI');
    const afterStage6 = await getCprPoe(page, adminAuth);
    console.log(`STEP ACTUAL (per ADO) — final status=${afterStage6.status}, portfolioOfEvidence id=${afterStage6.poe?.id}.`);
    expect(afterStage6.status, 'STEP EXPECTED: the report should reach the terminal Completed status (180)').toBe(180);
    expect(afterStage6.poe?.id, 'STEP EXPECTED (per ADO): the POE attachment should survive the entire QA chain to Stage 6, unchanged').toBe(originalPoeId);
  });
});
