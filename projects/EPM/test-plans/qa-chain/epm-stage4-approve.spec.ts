import { test, expect } from '@playwright/test';

// ADO suite 109527 (plan 108745, "24 · EPM · Stage 4 Approve — status 50 to 60 and inbox delivery to
// Stage 5"): TC-108794 (Positive), TC-108859 (Negative — wrong Person rejected), TC-108860 (Edge —
// max comment length), TC-108861 (Integration — inbox re-count after batch of 5).
//
// Only 1 live Stage 4 item existed at test time (2026-08-20) — the same item this session's own
// suite-109528 work advanced from Stage 3. TC-108860 (max-length comment) and TC-108861 (5-item batch
// recount) need more live volume than exists and are documented as blocked-by-data-volume rather than
// forced. TC-108794 and TC-108859 are both directly testable with 1 item (Negative first, since it
// doesn't consume the item; Positive last, since it does).
//
// Reuses the todoId-freshness technique from epm-stage3-qa-review-confirmed-working: fetch the inbox
// in the same session immediately before navigating to the workflow-action URL.

const BASE = 'https://pd-epm-adminportal-qa-wf.shesha.app';
const WF_API = 'https://pd-epm-api-qa-wf.shesha.app';
const SLOW = 420_000;

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

async function getStage4Inbox(page: any, auth: any) {
  const resp = await (await page.request.get(`${WF_API}/api/dynamic/Shesha.Workflow/WorkflowInboxItem/Crud/GetAll?maxResultCount=50`, { headers: auth })).json();
  return (resp?.result?.items ?? []).filter((i: any) => /approve progress report/i.test(i.actionText ?? ''));
}

test.describe('EPM — Stage 4 Approve (ADO plan 108745 / suite 109527)', () => {
  test('TC-108859 Negative — Stage 4 action rejected from an unassigned Person', async ({ page }) => {
    test.setTimeout(300_000);
    const stage4Auth = await loginAndGetAuth(page, 'stage4', '123qwe');
    const items = await getStage4Inbox(page, stage4Auth);
    console.log(`PRECONDITION ACTUAL — Stage 4 pending items: ${items.length}.`);
    expect(items.length, 'PRECONDITION: at least 1 live Stage 4 item should exist').toBeGreaterThan(0);
    const target = items[0];

    const johnAuth = await loginAndGetAuth(page, 'JohnDoe', '123qwe');
    await page.goto(`${BASE}/shesha/workflow-action?id=${target.workflowInstanceId}&todoid=${target.todoId}`, { waitUntil: 'domcontentloaded' });
    await page.waitForTimeout(8000);
    const bodyText = await page.locator('body').innerText().catch(() => '');
    const showsReadOnly = /requested action is not available/i.test(bodyText);
    console.log(`STEP ACTUAL — unassigned Person sees read-only view: ${showsReadOnly}.`);
    expect(showsReadOnly, 'STEP EXPECTED: unassigned Person should get a read-only view').toBeTruthy();
  });

  test('TC-108860 Edge — comment field character length behavior', async ({ page }) => {
    test.setTimeout(180_000);
    const stage4Auth = await loginAndGetAuth(page, 'stage4', '123qwe');
    const items = await getStage4Inbox(page, stage4Auth);
    const target = items[0];
    console.log(`PRECONDITION ACTUAL — using item ${target?.refNumber}.`);
    expect(target, 'PRECONDITION: a live Stage 4 item should exist').toBeTruthy();

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
    expect.soft(maxLengthAttr, 'STEP EXPECTED (per ADO): a configured maximum character length should exist — CONFIRMED GAP if null: no limit configured at all, unlike Stage 3 which has maxlength=1000').not.toBeNull();
  });

  test('TC-108794 Positive — Stage 4 Approve advances status 50 to 60 and delivers to Stage 5', async ({ page }) => {
    test.setTimeout(300_000);
    const stage4Auth = await loginAndGetAuth(page, 'stage4', '123qwe');
    const items = await getStage4Inbox(page, stage4Auth);
    console.log(`PRECONDITION ACTUAL — Stage 4 pending items: ${items.length}.`);
    expect(items.length, 'PRECONDITION: at least 1 live Stage 4 item should exist').toBeGreaterThan(0);
    const target = items[0];

    await page.goto(`${BASE}/shesha/workflow-action?id=${target.workflowInstanceId}&todoid=${target.todoId}`, { waitUntil: 'domcontentloaded' });
    await page.waitForTimeout(8000);
    const checkbox = page.locator('input[type="checkbox"]').first();
    const cbVisible = await checkbox.isVisible().catch(() => false);
    const cbChecked = cbVisible && await checkbox.isChecked().catch(() => false);
    if (cbVisible && !cbChecked) { await checkbox.click({ force: true }); await page.waitForTimeout(1000); }

    const buttons = await page.getByRole('button').allInnerTexts();
    console.log(`STEP ACTUAL — available buttons: ${JSON.stringify(buttons)}.`);
    const approveBtn = page.getByRole('button', { name: /approve/i }).first();
    const approveVisible = await approveBtn.isVisible().catch(() => false);
    const approveEnabled = approveVisible && await approveBtn.isEnabled().catch(() => false);
    console.log(`STEP ACTUAL — Approve button visible: ${approveVisible}, enabled: ${approveEnabled}.`);
    if (approveEnabled) {
      await approveBtn.click();
      await page.waitForTimeout(6000);
    }

    const afterResp = await (await page.request.get(`${WF_API}/api/dynamic/Shesha.Workflow/WorkflowInboxItem/Crud/GetAll?maxResultCount=50`, { headers: stage4Auth })).json();
    const related = (afterResp?.result?.items ?? []).filter((i: any) => i.workflowInstanceId === target.workflowInstanceId);
    console.log(`STEP ACTUAL — post-Approve inbox entries for this item: ${JSON.stringify(related.map((i: any) => i.actionText))} (expect a Stage 5 action now, e.g. Verify).`);
    expect(related.some((i: any) => /verify/i.test(i.actionText ?? '')), 'STEP EXPECTED (TC-108794): item should now show a Stage 5 "Verify" action, confirming real advancement').toBeTruthy();
  });
});
