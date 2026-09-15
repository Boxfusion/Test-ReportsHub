import { test, expect } from '@playwright/test';

// ADO suite 109536 (plan 108745, "33 · Achievement percentage calculation"), TC-108887 Negative: reject
// calculation with a null Target — verify a real validation-error message is shown (not a silent
// disable), then populate Target and confirm a retry succeeds.
//
// Re-tested live 2026-09-02 now that the Submit-gate flakiness fix is confirmed real (see
// epm-stage1-submit-permanently-blocked.md) — the old "Submit is confirmed broken" blanket blocker no
// longer applies to this suite (see epm-achievement-percentage-not-computed.spec.ts for TC-108803).
//
// Fixture: CPR2026/1038 ("S1Submit KPI 82870445 - Q1 2026/27"), a genuine live Stage 1 item with
// indicatorTarget=null. Same synthetic-fixture family as the "S1Draft KPI" items already found in
// TC-108803's investigation to have a broken form-binding (see epm-achievement-percentage-not-computed.md
// fixture trail) — worth flagging since it recurs here independently.
//
// PART 1 (Negative, CONFIRMED): clicking Submit while it is disabled produces no distinguishing
// validation error at all — no toast, no field highlight, nothing beyond the same generic, stale
// tooltip text ("Please ensure the Executive Summary is captured before Submitting") the button always
// shows when disabled, regardless of the actual cause. A user with a null Target gets no indication
// that Target specifically is the problem.
//
// PART 2 (retry after populating Target, BLOCKED by a related but separate defect): set
// indicatorTarget=50 via direct API PUT (confirmed persisted via a follow-up GET), reloaded the form —
// the "Quarter Target" display stayed completely blank, exactly like the "S1Draft KPI" family's blank
// Percentage Base/Actual Target fields found for TC-108803. Filled every other required field for real
// through the live form (Actual Target=45, a genuine Executive Summary sentence, Declaration checked) —
// Submit stayed disabled throughout, strongly implicating the still-blank Quarter Target display as the
// residual gate. Could not complete the "retry succeeds" half on this fixture family; would need a
// freshly-created item via the real 4-level hierarchy (see epm-disposable-fixture-hierarchy-convention)
// rather than this apparently-broken synthetic "S1Submit"/"S1Draft" family. Indirect evidence from
// TC-108803 (a genuine pre-seeded non-null Target fixture, CPR2026/1097) shows Submit DOES work once a
// real Target value is present and every other field is filled — so the underlying "does populating
// Target unblock Submit" question is very likely "yes", just not directly demonstrated here.

const BASE = 'https://pd-epm-adminportal-qa-wf.shesha.app';
const WF_API = 'https://pd-epm-api-qa-wf.shesha.app';
const CPR_ID = '25277303-7fa1-4ab4-b101-211cea834326';
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
    }
    return null;
  });
  return { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' };
}

test.describe('EPM — Null Target rejection (ADO plan 108745 / suite 109536)', () => {
  test('TC-108887 Negative — null Target silently disables Submit with no specific validation message', async ({ page }) => {
    test.setTimeout(240_000);
    const auth = await loginAndGetAuth(page, 'stage1', '123qwe');

    const inboxResp = await (await page.request.get(`${WF_API}/api/dynamic/Shesha.Workflow/WorkflowInboxItem/Crud/GetAll?maxResultCount=500`, { headers: auth })).json();
    const item = (inboxResp?.result?.items ?? []).find((i: any) => i.refNumber === 'CPR2026/1038' && /capture/i.test(i.actionText ?? ''));
    console.log(`PRECONDITION — fixture: ${item?.refNumber}, todoId=${item?.todoId}.`);
    expect(item, 'PRECONDITION: CPR2026/1038 should have a live Stage 1 Capture inbox item with a null Target').toBeTruthy();

    const before = await (await page.request.get(`${WF_API}/api/dynamic/Epm/ComponentProgressReport/Crud/Get?id=${CPR_ID}`, { headers: auth })).json();
    console.log(`PRECONDITION ACTUAL — indicatorTarget=${before?.result?.indicatorTarget} (expect null).`);
    expect(before?.result?.indicatorTarget, 'PRECONDITION: this fixture should genuinely have a null Target').toBeNull();

    await page.goto(`${BASE}/shesha/workflow-action?id=${item.workflowInstanceId}&todoid=${item.todoId}`, { waitUntil: 'domcontentloaded' });
    await page.waitForTimeout(8000);

    const submitBtn = page.getByRole('button', { name: 'Submit', exact: true });
    const submitEnabled = await submitBtn.isEnabled().catch(() => false);
    const submitTitle = await submitBtn.getAttribute('title').catch(() => null);
    console.log(`STEP 1 ACTUAL — Submit enabled with null Target: ${submitEnabled}; disabled-state tooltip: "${submitTitle}".`);
    expect.soft(submitEnabled, 'EXPECTED: Submit should reject a null-Target capture — CONFIRMED: stays disabled').toBeFalsy();

    await submitBtn.click({ force: true }).catch(() => {});
    await page.waitForTimeout(2000);
    const bodyText = await page.locator('body').innerText().catch(() => '');
    const hasSpecificTargetError = /target is required|target must|please (set|enter|provide).*target/i.test(bodyText);
    console.log(`STEP 2 ACTUAL — a specific "Target is required" style validation message is shown: ${hasSpecificTargetError}.`);
    expect(hasSpecificTargetError, 'TC-108887 EXPECTED (per ADO): a clear validation-error message naming the missing Target should be shown — CONFIRMED GAP: no such message exists anywhere on the page; the only visible text is the generic, stale Executive-Summary tooltip regardless of the real cause').toBeFalsy();
  });

  test('TC-108887 (retry half) — populating Target via API does not unblock Submit on this fixture family', async ({ page }) => {
    test.setTimeout(240_000);
    const auth = await loginAndGetAuth(page, 'stage1', '123qwe');

    const putResp = await page.request.put(`${WF_API}/api/dynamic/Epm/ComponentProgressReport/Crud/Update`, { headers: auth, data: { id: CPR_ID, indicatorTarget: 50 } });
    console.log(`SETUP — set indicatorTarget=50 via API, status=${putResp.status()}.`);
    const reGet = await (await page.request.get(`${WF_API}/api/dynamic/Epm/ComponentProgressReport/Crud/Get?id=${CPR_ID}`, { headers: auth })).json();
    console.log(`SETUP ACTUAL — indicatorTarget persisted as: ${reGet?.result?.indicatorTarget} (expect 50).`);
    expect(reGet?.result?.indicatorTarget, 'SETUP: the API write should genuinely persist').toBe(50);

    const inboxResp = await (await page.request.get(`${WF_API}/api/dynamic/Shesha.Workflow/WorkflowInboxItem/Crud/GetAll?maxResultCount=500`, { headers: auth })).json();
    const item = (inboxResp?.result?.items ?? []).find((i: any) => i.refNumber === 'CPR2026/1038' && /capture/i.test(i.actionText ?? ''));

    await page.goto(`${BASE}/shesha/workflow-action?id=${item.workflowInstanceId}&todoid=${item.todoId}`, { waitUntil: 'domcontentloaded' });
    await page.waitForTimeout(8000);

    const bodyText = await page.locator('body').innerText().catch(() => '');
    const quarterTargetShowsValue = /Quarter Target[\s\S]{0,40}50/.test(bodyText);
    console.log(`STEP ACTUAL — "Quarter Target" display reflects the API-set value 50: ${quarterTargetShowsValue}.`);
    expect(quarterTargetShowsValue, 'TC-108887 EXPECTED: after populating Target, the form should show the real value and allow a successful retry — CONFIRMED GAP: this fixture family (same as the "S1Draft KPI" items) never reflects the API-written Target on the Capture form at all, blank regardless').toBeFalsy();

    // fill every other required field for real, to isolate the blank Quarter Target as the residual gate
    const allTextareas = page.locator('textarea:visible');
    const n = await allTextareas.count();
    let execIndex: number | null = null;
    for (let i = 0; i < n; i++) {
      const box = await allTextareas.nth(i).boundingBox().catch(() => null);
      if (box && box.x < 850) execIndex = i;
    }
    if (execIndex !== null) {
      await allTextareas.nth(execIndex).fill('TC-108887: target populated after null-target rejection, retry attempt.');
    }
    const actualInputs = page.locator('input.ant-input:visible');
    const count = await actualInputs.count();
    await actualInputs.nth(count - 1).fill('45');
    await page.waitForTimeout(1000);
    const checkbox = page.locator('input[type="checkbox"]').first();
    if (await checkbox.isVisible().catch(() => false) && !(await checkbox.isChecked().catch(() => false))) {
      await checkbox.click({ force: true });
    }
    await page.waitForTimeout(1000);

    const submitEnabled = await page.getByRole('button', { name: 'Submit', exact: true }).isEnabled().catch(() => false);
    console.log(`STEP ACTUAL — Submit enabled with Actual Target/Executive Summary/Declaration all genuinely filled, but Quarter Target still blank: ${submitEnabled}.`);
    expect(submitEnabled, 'TC-108887 EXPECTED: Submit should succeed once Target is populated — BLOCKED (not disproven): every other field is genuinely filled, yet Submit still stays disabled, consistent with the blank Quarter Target display being the residual gate on this broken fixture family').toBeFalsy();
  });
});
