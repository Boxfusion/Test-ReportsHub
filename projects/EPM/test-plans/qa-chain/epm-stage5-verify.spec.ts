import { test, expect } from '@playwright/test';

// ADO suite 109526 (plan 108745, "25 · EPM · Stage 5 Verify — status 60 to 70 and inbox delivery to
// Stage 6"): TC-108795 (Positive), TC-108862 (Negative — wrong Person rejected), TC-108863 (Edge —
// max comment length), TC-108864 (Integration — inbox re-count after batch of 5).
//
// Same pattern as epm-stage3-qa-review-confirmed-working / epm-stage4-approve-confirmed-working: only
// 1 live Stage 5 item existed at test time (chained forward from this session's own Stage 3->4->5
// advancement). TC-108863/108864 blocked by insufficient live data volume (need >=5 items).

const BASE = 'https://pd-epm-adminportal-qa-wf.shesha.app';
const WF_API = 'https://pd-epm-api-qa-wf.shesha.app';
const SLOW = 420_000;

test.use({ actionTimeout: 30_000, navigationTimeout: 120_000 });

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

async function getStage5Inbox(page: any, auth: any) {
  const resp = await (await page.request.get(`${WF_API}/api/dynamic/Shesha.Workflow/WorkflowInboxItem/Crud/GetAll?maxResultCount=50`, { headers: auth })).json();
  return (resp?.result?.items ?? []).filter((i: any) => /verify/i.test(i.actionText ?? ''));
}

test.describe('EPM — Stage 5 Verify (ADO plan 108745 / suite 109526)', () => {
  test('TC-108862 Negative — Stage 5 action rejected from an unassigned Person', async ({ page }) => {
    test.setTimeout(300_000);
    const stage5Auth = await loginAndGetAuth(page, 'stage5', '123qwe');
    const items = await getStage5Inbox(page, stage5Auth);
    console.log(`PRECONDITION ACTUAL — Stage 5 pending items: ${items.length}.`);
    expect(items.length, 'PRECONDITION: at least 1 live Stage 5 item should exist').toBeGreaterThan(0);
    const target = items[0];

    const johnAuth = await loginAndGetAuth(page, 'JohnDoe', '123qwe');
    await page.goto(`${BASE}/shesha/workflow-action?id=${target.workflowInstanceId}&todoid=${target.todoId}`, { waitUntil: 'domcontentloaded' });
    await page.waitForTimeout(8000);
    const bodyText = await page.locator('body').innerText().catch(() => '');
    const showsReadOnly = /requested action is not available/i.test(bodyText);
    console.log(`STEP ACTUAL — unassigned Person sees read-only view: ${showsReadOnly}.`);
    expect(showsReadOnly, 'STEP EXPECTED: unassigned Person should get a read-only view').toBeTruthy();
  });

  test('TC-108863 Edge — comment field character length behavior', async ({ page }) => {
    test.setTimeout(180_000);
    const stage5Auth = await loginAndGetAuth(page, 'stage5', '123qwe');
    const items = await getStage5Inbox(page, stage5Auth);
    const target = items[0];
    console.log(`PRECONDITION ACTUAL — using item ${target?.refNumber}.`);
    expect(target, 'PRECONDITION: a live Stage 5 item should exist').toBeTruthy();

    await page.goto(`${BASE}/shesha/workflow-action?id=${target.workflowInstanceId}&todoid=${target.todoId}`, { waitUntil: 'domcontentloaded' });
    await page.waitForTimeout(9000);

    const commentsHeading = page.getByText('Comments', { exact: true }).first();
    const commentBox = commentsHeading.locator('xpath=following::textarea[1] | following::input[@type="text"][1]').first();
    await expect(commentBox, 'the Comments field should be locatable').toBeVisible();

    const maxLengthAttr = await commentBox.getAttribute('maxlength').catch(() => null);
    console.log(`STEP ACTUAL — comment field maxlength attribute: ${maxLengthAttr}.`);

    await commentBox.fill('A'.repeat(5000));
    await page.waitForTimeout(500);
    const acceptedValue = await commentBox.inputValue().catch(() => '');
    console.log(`STEP ACTUAL — length accepted client-side after typing 5000 chars: ${acceptedValue.length}.`);

    const saveResponses: string[] = [];
    page.on('response', async (res) => {
      if (res.request().method() === 'POST' && res.url().includes('/Note/Create')) {
        saveResponses.push(`${res.status()}`);
      }
    });
    const saveBtn = page.locator('button', { hasText: 'Save' }).first();
    await saveBtn.click();
    await page.waitForTimeout(4000);
    console.log(`STEP ACTUAL — comment Save responses: ${JSON.stringify(saveResponses)}.`);
    expect(saveResponses.some((r) => r.startsWith('2')), 'STEP EXPECTED: saving the comment should succeed').toBeTruthy();
    expect.soft(maxLengthAttr, 'STEP EXPECTED (per ADO): a configured maximum character length should exist — no limit configured at all here, same as Stages 2/4, unlike Stage 3 (maxlength=1000)').not.toBeNull();
  });

  test('TC-108795 Positive — Stage 5 Verify advances status 60 to 70 and delivers to Stage 6', async ({ page }) => {
    test.setTimeout(300_000);
    const stage5Auth = await loginAndGetAuth(page, 'stage5', '123qwe');
    const items = await getStage5Inbox(page, stage5Auth);
    console.log(`PRECONDITION ACTUAL — Stage 5 pending items: ${items.length}.`);
    expect(items.length, 'PRECONDITION: at least 1 live Stage 5 item should exist').toBeGreaterThan(0);
    const target = items[0];

    await page.goto(`${BASE}/shesha/workflow-action?id=${target.workflowInstanceId}&todoid=${target.todoId}`, { waitUntil: 'domcontentloaded' });
    await page.waitForTimeout(8000);
    const checkbox = page.locator('input[type="checkbox"]').first();
    const cbVisible = await checkbox.isVisible().catch(() => false);
    const cbChecked = cbVisible && await checkbox.isChecked().catch(() => false);
    if (cbVisible && !cbChecked) { await checkbox.click({ force: true }); await page.waitForTimeout(1000); }

    const buttons = await page.getByRole('button').allInnerTexts();
    console.log(`STEP ACTUAL — available buttons: ${JSON.stringify(buttons)}.`);
    const verifyBtn = page.getByRole('button', { name: /verify|complete kpi/i }).first();
    const visible = await verifyBtn.isVisible().catch(() => false);
    const enabled = visible && await verifyBtn.isEnabled().catch(() => false);
    console.log(`STEP ACTUAL — Verify button visible: ${visible}, enabled: ${enabled}.`);
    if (enabled) {
      await verifyBtn.click();
      await page.waitForTimeout(6000);
    }

    const afterResp = await (await page.request.get(`${WF_API}/api/dynamic/Shesha.Workflow/WorkflowInboxItem/Crud/GetAll?maxResultCount=50`, { headers: stage5Auth })).json();
    const related = (afterResp?.result?.items ?? []).filter((i: any) => i.workflowInstanceId === target.workflowInstanceId);
    console.log(`STEP ACTUAL — post-Verify inbox entries for this item: ${JSON.stringify(related.map((i: any) => i.actionText))} (expect a Stage 6 action now, e.g. Finalise).`);
    expect(related.some((i: any) => /finali[sz]e/i.test(i.actionText ?? '')), 'STEP EXPECTED (TC-108795): item should now show a Stage 6 "Finalise" action, confirming real advancement').toBeTruthy();
  });
});
