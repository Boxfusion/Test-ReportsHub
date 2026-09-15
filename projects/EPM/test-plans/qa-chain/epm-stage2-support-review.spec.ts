import { test, expect } from '@playwright/test';

// ADO suite 109529 (plan 108745, "22 · EPM · Stage 2 Support review"): TC-108792.
//
// Previously unverified — no stable live Stage 2 item existed long enough to automate. Unblocked by
// the Submit-gate fix (epm-stage1-submit-permanently-blocked), which lets Stage 1 items reach Stage 2
// reliably. Reuses the real item CPR2026/1101, already at Stage 2 from earlier TC-108852 testing.

const BASE = 'https://pd-epm-adminportal-qa-wf.shesha.app';
const WF_API = 'https://pd-epm-api-qa-wf.shesha.app';
const WORKFLOW_INSTANCE_ID = '6c611f48-1a9f-48bc-b800-dbf9cc3adaed';
const CPR_ID = '8f5de1d9-d910-4d5f-99e8-888f324f87a7';

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

async function freshTodo(page: any, auth: any, workflowInstanceId: string) {
  const inboxResp = await (await page.request.get(`${WF_API}/api/dynamic/Shesha.Workflow/WorkflowInboxItem/Crud/GetAll?maxResultCount=100`, { headers: auth })).json();
  return (inboxResp?.result?.items ?? []).find((i: any) => i.workflowInstanceId === workflowInstanceId);
}

test.describe('EPM — Stage 2 Support Review (ADO plan 108745 / suite 109529)', () => {
  test('TC-108792 Positive — Stage 2 review advances status 30 to 40', async ({ page }) => {
    test.setTimeout(300_000);
    const stage2Auth = await loginAndGetAuth(page, 'stage2', '123qwe');

    const cprBefore = await (await page.request.get(`${WF_API}/api/dynamic/Epm/ComponentProgressReport/Crud/Get?id=${CPR_ID}`, { headers: stage2Auth })).json();
    console.log(`PRECONDITION ACTUAL — progressReportStatus before: ${cprBefore?.result?.progressReportStatus}.`);
    expect(cprBefore?.result?.progressReportStatus, 'PRECONDITION EXPECTED: item should be at Stage 2 (30)').toBe(30);

    const item = await freshTodo(page, stage2Auth, WORKFLOW_INSTANCE_ID);
    expect(item, 'a live Stage 2 (Support Progress Report) item should exist').toBeTruthy();
    await page.goto(`${BASE}/shesha/workflow-action?id=${item.workflowInstanceId}&todoid=${item.todoId}`, { waitUntil: 'domcontentloaded' });
    await page.waitForTimeout(9000);

    const declCheckbox = page.locator('input[type="checkbox"]').first();
    await expect(declCheckbox, 'the Declaration checkbox should be visible').toBeVisible();
    await declCheckbox.check({ force: true }).catch(async () => {
      await page.locator('.ant-checkbox').first().click();
    });
    await page.waitForTimeout(1000);

    const advanceResponses: string[] = [];
    page.on('response', async (res) => {
      if (res.request().method() === 'POST' && res.url().includes('UserTaskComplete')) {
        advanceResponses.push(`${res.status()}`);
      }
    });
    const supportBtn = page.getByRole('button', { name: 'Support Report', exact: true }).first();
    await expect(supportBtn, 'the "Support Report" button should be visible').toBeVisible();
    await expect(supportBtn, 'the "Support Report" button should be enabled once Declaration is checked').toBeEnabled();
    await supportBtn.click();
    await page.waitForTimeout(6000);
    console.log(`STEP ACTUAL — Support Report responses: ${JSON.stringify(advanceResponses)}.`);
    expect(advanceResponses.some((r) => r.startsWith('2')), 'STEP EXPECTED: Support Report should succeed').toBeTruthy();

    const cprAfter = await (await page.request.get(`${WF_API}/api/dynamic/Epm/ComponentProgressReport/Crud/Get?id=${CPR_ID}`, { headers: stage2Auth })).json();
    console.log(`STEP ACTUAL — progressReportStatus after: ${cprAfter?.result?.progressReportStatus}.`);
    expect(cprAfter?.result?.progressReportStatus, 'STEP EXPECTED (per ADO): status should advance from 30 to 40').toBe(40);

    const stage3Auth = await loginAndGetAuth(page, 'stage3', '123qwe');
    const stage3Item = await freshTodo(page, stage3Auth, WORKFLOW_INSTANCE_ID);
    console.log(`STEP ACTUAL — Stage 3 inbox item: ${JSON.stringify(stage3Item ? { actionText: stage3Item.actionText, status: stage3Item.statusFinalText } : null)}.`);
    expect(stage3Item, 'STEP EXPECTED: Stage 3 should genuinely receive the item').toBeTruthy();
  });

  test('TC-108853 Negative — reject action from an unassigned Person', async ({ page }) => {
    test.setTimeout(180_000);
    const stage2Auth = await loginAndGetAuth(page, 'stage2', '123qwe');
    const inboxResp = await (await page.request.get(`${WF_API}/api/dynamic/Shesha.Workflow/WorkflowInboxItem/Crud/GetAll?maxResultCount=200`, { headers: stage2Auth })).json();
    const target = (inboxResp?.result?.items ?? []).find((i: any) => /support/i.test(i.actionText ?? ''));
    expect(target, 'PRECONDITION: a live Stage 2 (Support Progress Report) item should exist').toBeTruthy();

    const johnAuth = await loginAndGetAuth(page, 'JohnDoe', '123qwe');
    await page.goto(`${BASE}/shesha/workflow-action?id=${target.workflowInstanceId}&todoid=${target.todoId}`, { waitUntil: 'domcontentloaded' });
    await page.waitForTimeout(9000);
    const bodyText = await page.locator('body').innerText().catch(() => '');
    const showsReadOnly = /requested action is not available/i.test(bodyText);
    const supportBtnVisible = await page.getByRole('button', { name: 'Support Report', exact: true }).isVisible().catch(() => false);
    console.log(`STEP ACTUAL — unassigned Person sees read-only view: ${showsReadOnly}, "Support Report" button visible: ${supportBtnVisible}.`);
    expect(showsReadOnly && !supportBtnVisible, 'STEP EXPECTED: unassigned Person should get a read-only view with no action available').toBeTruthy();
  });
});
