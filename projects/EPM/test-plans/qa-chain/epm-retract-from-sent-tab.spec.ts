import { test, expect } from '@playwright/test';

// ADO suite 109758 (plan 108745, "26b · EPM · Retract from Sent tab — Stage 1 to 5 self-service
// withdrawal"): TC-109764 (Positive), TC-109765 (Negative), TC-109766 (Edge), TC-109767 (Integration).
//
// TC-109764: CONFIRMED PASS live 2026-09-02, exact match with ADO's expected outcome. No live item was
// genuinely at status 30 in a Q1 fixture reachable from stage1's Sent tab at test time, so the
// precondition was built directly: submitted `CPR2026/1059` (already fully populated from earlier Send
// Back testing this session — Quarter Target 40, Actual Target 40, Achieved, POE attached, Executive
// Summary filled) from Stage 1 to Stage 2, `progressReportStatus` 20->30 cleanly on the first attempt.
//
// The Sent tab's rows are `role="row"` divs (antd virtual table, no real `<tr>`), each with a
// `<a class="sha-link" href="/shesha/workflow?id=<workflowInstanceId>">` wrapping a search icon — a
// distinct route from the capture form (`/shesha/workflow-action?id=...&todoid=...`), keyed only by
// `workflowInstanceId`. Clicking it renders a read/action view with Retract genuinely visible on the
// toolbar. Clicking Retract + confirming the dialog moved the item out of Sent and back into the Stage 1
// Inbox, and `progressReportStatus` reverted from 30 to exactly 20 — matching ADO's literal expected
// value precisely (contrast the Send Back suite, where the real status landed on 2, not ADO's claimed
// 15 — no such mismatch here).
//
// TC-109765: CONFIRMED PASS live 2026-09-02, exact match with ADO. Precondition rebuilt the same way
// (resubmitted CPR2026/1059, 20->30 cleanly). Stage 2's own view of the item (via its inbox sha-link)
// shows Send Back / Support Report but genuinely no Retract button; stage1's Sent-tab view of the SAME
// workflow instance does show Retract. Confirms Retract is sender-only, not receiver-visible.
//
// TC-109766: CONFIRMED DEFECT live 2026-09-02. Precondition built live: Complete KPI on CPR2026/1099
// genuinely advanced progressReportStatus 60->70, delivering it to Stage 6's inbox. Then, as stage5,
// the item is listed in workflows-sent, Retract is visible via its sha-link, and clicking Retract +
// confirming the dialog LOOKS identical to the working TC-109764 flow — but the real network call
// (`POST /api/v1/Epm/ComponentProgressReports/RetractWorkflowTask`) returns a genuine 403:
// {"success":false,"error":{"message":"You are not authorized to perform this action"}}. Contrast-
// checked the same endpoint for a Stage 1 sender retracting a Stage 1->2 submission (the TC-109764
// scenario) — clean 200 there. So the UI renders an identical, fully-clickable Retract flow regardless
// of stage, but the server silently rejects it for at least Stage 5, with zero UI-level warning. None of
// ADO's expected effects (Stage 6 inbox clears, item returns to Stage 5, status reverts to 60) occur.
//
// TC-109767: CONFIRMED PASS live 2026-09-02, all three sub-checks. Precondition built live: pushed
// CPR2026/1059 through Stage 1->2->3 (Submit, Support Report, Complete QA) to genuinely reach
// progressReportStatus 50, sent by stage3, with a real captured POE attachment + Executive Summary
// already in place. Retract from stage3's Sent tab: the real RetractWorkflowTask call returns a clean
// 200 (contrast TC-109766's Stage 5 403), status reverts 50->40 exactly, item returns to stage3 Inbox.
// Captured fields (POE StoredFile reference, Executive Summary text) are byte-for-byte unchanged after.
// EpmAuditedEntityEvent gains a genuine new row (actor "Stage 3 Branch Coordinator", fresh timestamp,
// action "Item status was changed to AwaitingLevelTwoQA") and all 5 prior rows remain untouched — a
// direct contrast with epm-sendback-no-audit-event-no-notification.md, where Send Back writes zero
// audit rows for the identical kind of stage-transition event.

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
    }
    return null;
  });
  return { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' };
}

test.describe('EPM — Retract from Sent tab (ADO plan 108745 / suite 109758)', () => {
  test('TC-109764 Positive — Stage 1 retracts a submitted CPR from the Sent tab', async ({ page }) => {
    test.setTimeout(300_000);
    const auth = await loginAndGetAuth(page, 'stage1', '123qwe');

    // Precondition: find a real Q1 Stage-1-Capture item and submit it to Stage 2 (status 20 -> 30).
    const inboxResp = await (await page.request.get(`${WF_API}/api/dynamic/Shesha.Workflow/WorkflowInboxItem/Crud/GetAll?maxResultCount=200`, { headers: auth })).json();
    const target = (inboxResp?.result?.items ?? []).find((i: any) => /capture/i.test(i.actionText ?? '') && /Q1/i.test(i.subject ?? ''));
    console.log(`PRECONDITION ACTUAL — using Q1 Stage 1 item ${target?.refNumber}.`);
    expect(target, 'PRECONDITION: a live Q1 Stage 1 Capture item should exist').toBeTruthy();

    await page.goto(`${BASE}/shesha/workflow-action?id=${target.workflowInstanceId}&todoid=${target.todoId}`, { waitUntil: 'domcontentloaded' });
    await page.waitForTimeout(8000);
    const checkbox = page.locator('input[type="checkbox"]').first();
    await checkbox.click({ force: true });
    await page.waitForTimeout(1500);

    let submitEnabled = false;
    for (let i = 0; i < 6 && !submitEnabled; i++) {
      const submitBtn = page.getByRole('button', { name: 'Submit', exact: true });
      submitEnabled = await submitBtn.isEnabled().catch(() => false);
      if (!submitEnabled) {
        await page.reload({ waitUntil: 'domcontentloaded' });
        await page.waitForTimeout(6000);
        const cb2 = page.locator('input[type="checkbox"]').first();
        if (await cb2.isVisible().catch(() => false) && !(await cb2.isChecked().catch(() => false))) {
          await cb2.click({ force: true });
          await page.waitForTimeout(1500);
        }
      }
    }
    console.log(`PRECONDITION ACTUAL — Submit enabled: ${submitEnabled}.`);
    if (submitEnabled) {
      await page.getByRole('button', { name: 'Submit', exact: true }).click({ force: true });
      await page.waitForTimeout(5000);
    }

    const wfResp = await (await page.request.get(`${WF_API}/api/dynamic/Shesha.Workflow/WorkflowInstance/Crud/Get?id=${target.workflowInstanceId}`, { headers: auth })).json();
    const cprId = wfResp?.result?.componentProgressReport?.id;
    const cprAfterSubmit = await (await page.request.get(`${WF_API}/api/dynamic/Epm/ComponentProgressReport/Crud/Get?id=${cprId}`, { headers: auth })).json();
    const statusAfterSubmit = cprAfterSubmit?.result?.progressReportStatus;
    console.log(`PRECONDITION ACTUAL — progressReportStatus after Submit: ${statusAfterSubmit} (need 30 to proceed).`);
    expect(statusAfterSubmit, 'PRECONDITION: Submit should genuinely advance the item to status 30').toBe(30);

    // STEP 1: Sent tab lists the item.
    await page.goto(`${BASE}/dynamic/Shesha.Workflow/workflows-sent`, { waitUntil: 'domcontentloaded' });
    await page.waitForTimeout(9000);
    const row = page.getByRole('row', { name: new RegExp(target.refNumber.replace('/', '\\/')) }).first();
    const rowVisible = await row.isVisible().catch(() => false);
    console.log(`STEP 1 ACTUAL — ${target.refNumber} row present in Sent tab: ${rowVisible}.`);
    expect(rowVisible, 'STEP 1 EXPECTED: the Sent tab should list the just-submitted CPR row').toBeTruthy();

    // STEP 2: click the sha-link, Retract should be visible.
    const shaLink = row.locator('a.sha-link').first();
    await shaLink.click({ force: true });
    await page.waitForTimeout(6000);
    const retractBtn = page.getByRole('button', { name: 'Retract', exact: true });
    const retractVisible = await retractBtn.isVisible().catch(() => false);
    console.log(`STEP 2 ACTUAL — Retract button visible on the workflow view: ${retractVisible}.`);
    expect(retractVisible, 'STEP 2 EXPECTED: Retract should be visible on the action toolbar').toBeTruthy();

    // STEP 3: click Retract, confirm the dialog.
    await retractBtn.click({ force: true });
    await page.waitForTimeout(3000);
    const confirmBtn = page.getByRole('button', { name: /^(OK|Yes|Confirm|Retract)$/i }).last();
    await confirmBtn.click({ force: true });
    await page.waitForTimeout(4000);

    const afterInboxResp = await (await page.request.get(`${WF_API}/api/dynamic/Shesha.Workflow/WorkflowInboxItem/Crud/GetAll?maxResultCount=200`, { headers: auth })).json();
    const backInInbox = (afterInboxResp?.result?.items ?? []).some((i: any) => i.workflowInstanceId === target.workflowInstanceId);
    console.log(`STEP 3 ACTUAL — item reappears in the Stage 1 Inbox: ${backInInbox}.`);
    expect(backInInbox, 'STEP 3 EXPECTED: the item should leave Sent and reappear in the Stage 1 Inbox').toBeTruthy();

    // STEP 4: verify progressReportStatus reverted to 20.
    const cprFinal = await (await page.request.get(`${WF_API}/api/dynamic/Epm/ComponentProgressReport/Crud/Get?id=${cprId}`, { headers: auth })).json();
    const finalStatus = cprFinal?.result?.progressReportStatus;
    console.log(`STEP 4 ACTUAL — progressReportStatus after Retract: ${finalStatus} (expected 20).`);
    expect(finalStatus, 'STEP 4 EXPECTED (per ADO): progressReportStatus should revert to exactly 20').toBe(20);
  });

  test('TC-109765 Negative — Retract is not offered to the receiving stage user', async ({ page }) => {
    test.setTimeout(300_000);

    // Precondition: resubmit CPR2026/1059 from Stage 1 to Stage 2 (status 20 -> 30) again.
    const stage1Auth = await loginAndGetAuth(page, 'stage1', '123qwe');
    const inboxResp = await (await page.request.get(`${WF_API}/api/dynamic/Shesha.Workflow/WorkflowInboxItem/Crud/GetAll?maxResultCount=200`, { headers: stage1Auth })).json();
    const target = (inboxResp?.result?.items ?? []).find((i: any) => i.refNumber === 'CPR2026/1059' && /capture/i.test(i.actionText ?? ''));
    console.log(`PRECONDITION ACTUAL — using ${target?.refNumber}.`);
    expect(target, 'PRECONDITION: CPR2026/1059 should be back at Stage 1 Capture').toBeTruthy();

    await page.goto(`${BASE}/shesha/workflow-action?id=${target.workflowInstanceId}&todoid=${target.todoId}`, { waitUntil: 'domcontentloaded' });
    await page.waitForTimeout(8000);
    await page.locator('input[type="checkbox"]').first().click({ force: true });
    await page.waitForTimeout(1500);
    let submitEnabled = false;
    for (let i = 0; i < 6 && !submitEnabled; i++) {
      submitEnabled = await page.getByRole('button', { name: 'Submit', exact: true }).isEnabled().catch(() => false);
      if (!submitEnabled) {
        await page.reload({ waitUntil: 'domcontentloaded' });
        await page.waitForTimeout(6000);
        const cb2 = page.locator('input[type="checkbox"]').first();
        if (await cb2.isVisible().catch(() => false) && !(await cb2.isChecked().catch(() => false))) {
          await cb2.click({ force: true });
          await page.waitForTimeout(1500);
        }
      }
    }
    if (submitEnabled) {
      await page.getByRole('button', { name: 'Submit', exact: true }).click({ force: true });
      await page.waitForTimeout(5000);
    }
    const wfResp = await (await page.request.get(`${WF_API}/api/dynamic/Shesha.Workflow/WorkflowInstance/Crud/Get?id=${target.workflowInstanceId}`, { headers: stage1Auth })).json();
    const cprId = wfResp?.result?.componentProgressReport?.id;
    const cprAfterSubmit = await (await page.request.get(`${WF_API}/api/dynamic/Epm/ComponentProgressReport/Crud/Get?id=${cprId}`, { headers: stage1Auth })).json();
    console.log(`PRECONDITION ACTUAL — progressReportStatus after Submit: ${cprAfterSubmit?.result?.progressReportStatus}.`);
    expect(cprAfterSubmit?.result?.progressReportStatus, 'PRECONDITION: item should genuinely be at Stage 2 (status 30)').toBe(30);

    // STEP 1: stage2 inbox lists the item.
    await loginAndGetAuth(page, 'stage2', '123qwe');
    await page.goto(`${BASE}/dynamic/Shesha.Workflow/workflows-inbox`, { waitUntil: 'domcontentloaded' });
    await page.waitForTimeout(9000);
    const stage2Row = page.getByRole('row', { name: new RegExp(target.refNumber.replace('/', '\\/')) }).first();
    const stage2RowVisible = await stage2Row.isVisible().catch(() => false);
    console.log(`STEP 1 ACTUAL — ${target.refNumber} row visible in stage2 inbox: ${stage2RowVisible}.`);
    expect(stage2RowVisible, 'STEP 1 EXPECTED: the Q1 item should be listed in the stage2 inbox').toBeTruthy();

    // STEP 2: no Retract button on stage2's view of the item.
    await stage2Row.locator('a.sha-link').first().click({ force: true });
    await page.waitForTimeout(6000);
    const buttons = await page.getByRole('button').allInnerTexts();
    console.log(`STEP 2 ACTUAL — buttons visible to stage2: ${JSON.stringify(buttons)}.`);
    const retractVisibleS2 = await page.getByRole('button', { name: 'Retract', exact: true }).isVisible().catch(() => false);
    console.log(`STEP 2 ACTUAL — Retract button visible to stage2: ${retractVisibleS2}.`);
    expect(retractVisibleS2, 'STEP 2 EXPECTED: Retract should NOT be visible to the receiving stage').toBeFalsy();

    // STEP 3: stage1's own Sent view of the same item DOES show Retract.
    await loginAndGetAuth(page, 'stage1', '123qwe');
    await page.goto(`${BASE}/dynamic/Shesha.Workflow/workflows-sent`, { waitUntil: 'domcontentloaded' });
    await page.waitForTimeout(9000);
    const sentRow = page.getByRole('row', { name: new RegExp(target.refNumber.replace('/', '\\/')) }).first();
    await sentRow.locator('a.sha-link').first().click({ force: true });
    await page.waitForTimeout(6000);
    const retractVisibleS1 = await page.getByRole('button', { name: 'Retract', exact: true }).isVisible().catch(() => false);
    console.log(`STEP 3 ACTUAL — Retract button visible to stage1 (sender) on the same item: ${retractVisibleS1}.`);
    expect(retractVisibleS1, 'STEP 3 EXPECTED: Retract should be visible to the sender (stage1)').toBeTruthy();
  });

  test('TC-109766 Edge — Retracting a Stage 5-verified item should withdraw Stage 6 (CONFIRMED DEFECT)', async ({ page }) => {
    test.setTimeout(300_000);

    // Precondition: advance the one live Stage 5 Verify item to Stage 6 (status 60 -> 70).
    const stage5Auth = await loginAndGetAuth(page, 'stage5', '123qwe');
    const s5Inbox = await (await page.request.get(`${WF_API}/api/dynamic/Shesha.Workflow/WorkflowInboxItem/Crud/GetAll?maxResultCount=200`, { headers: stage5Auth })).json();
    const target = (s5Inbox?.result?.items ?? []).find((i: any) => /verify/i.test(i.actionText ?? ''));
    console.log(`PRECONDITION ACTUAL — using ${target?.refNumber}.`);
    expect(target, 'PRECONDITION: a live Stage 5 Verify item should exist').toBeTruthy();

    const wfResp0 = await (await page.request.get(`${WF_API}/api/dynamic/Shesha.Workflow/WorkflowInstance/Crud/Get?id=${target.workflowInstanceId}`, { headers: stage5Auth })).json();
    const cprId = wfResp0?.result?.componentProgressReport?.id;

    await page.goto(`${BASE}/shesha/workflow-action?id=${target.workflowInstanceId}&todoid=${target.todoId}`, { waitUntil: 'domcontentloaded' });
    await page.waitForTimeout(8000);
    const checkbox = page.locator('input[type="checkbox"]').first();
    if (await checkbox.isVisible().catch(() => false) && !(await checkbox.isChecked().catch(() => false))) {
      await checkbox.click({ force: true });
      await page.waitForTimeout(1000);
    }
    const completeBtn = page.getByRole('button', { name: /verify|complete kpi/i }).first();
    const completeEnabled = await completeBtn.isEnabled().catch(() => false);
    if (completeEnabled) {
      await completeBtn.click({ force: true });
      await page.waitForTimeout(6000);
    }
    const cprAfterVerify = await (await page.request.get(`${WF_API}/api/dynamic/Epm/ComponentProgressReport/Crud/Get?id=${cprId}`, { headers: stage5Auth })).json();
    console.log(`PRECONDITION ACTUAL — progressReportStatus after Complete KPI: ${cprAfterVerify?.result?.progressReportStatus} (need 70 to proceed).`);
    expect(cprAfterVerify?.result?.progressReportStatus, 'PRECONDITION: Complete KPI should advance the item to Stage 6 (status 70)').toBe(70);

    // STEP 1: stage5 Sent tab shows the item, Retract visible.
    await loginAndGetAuth(page, 'stage5', '123qwe');
    await page.goto(`${BASE}/dynamic/Shesha.Workflow/workflows-sent`, { waitUntil: 'domcontentloaded' });
    await page.waitForTimeout(9000);
    const sentRow = page.getByRole('row', { name: new RegExp(target.refNumber.replace('/', '\\/')) }).first();
    const sentRowVisible = await sentRow.isVisible().catch(() => false);
    console.log(`STEP 1 ACTUAL — ${target.refNumber} row visible in stage5 Sent tab: ${sentRowVisible}.`);
    expect(sentRowVisible, 'STEP 1 EXPECTED: the Sent tab should list the item').toBeTruthy();

    await sentRow.locator('a.sha-link').first().click({ force: true });
    await page.waitForTimeout(6000);
    const retractBtn = page.getByRole('button', { name: 'Retract', exact: true });
    const retractVisible = await retractBtn.isVisible().catch(() => false);
    console.log(`STEP 1 ACTUAL — Retract button visible: ${retractVisible}.`);
    expect(retractVisible, 'STEP 1 EXPECTED: Retract should be visible on the workflow view').toBeTruthy();

    // STEP 2: click Retract, confirm the dialog, and capture the real network response.
    const retractResponses: string[] = [];
    page.on('response', (res) => {
      if (res.url().includes('RetractWorkflowTask')) retractResponses.push(`${res.status()}`);
    });
    await retractBtn.click({ force: true });
    await page.waitForTimeout(2000);
    const modal = page.locator('.ant-modal').last();
    await modal.getByRole('button', { name: 'Retract', exact: true }).first().click({ force: true });
    await page.waitForTimeout(5000);
    console.log(`STEP 2 ACTUAL — RetractWorkflowTask responses: ${JSON.stringify(retractResponses)}.`);

    // STEP 3/4: none of ADO's expected cascading effects should occur if the call was rejected.
    const cprAfterRetract = await (await page.request.get(`${WF_API}/api/dynamic/Epm/ComponentProgressReport/Crud/Get?id=${cprId}`, { headers: stage5Auth })).json();
    console.log(`STEP ACTUAL — progressReportStatus after Retract attempt: ${cprAfterRetract?.result?.progressReportStatus}.`);

    const stage6Auth = await loginAndGetAuth(page, 'stage6', '123qwe');
    const s6InboxAfter = await (await page.request.get(`${WF_API}/api/dynamic/Shesha.Workflow/WorkflowInboxItem/Crud/GetAll?maxResultCount=200`, { headers: stage6Auth })).json();
    const stillInStage6 = (s6InboxAfter?.result?.items ?? []).some((i: any) => i.workflowInstanceId === target.workflowInstanceId && /finali[sz]e/i.test(i.actionText ?? ''));
    console.log(`STEP ACTUAL — item still present in Stage 6 inbox: ${stillInStage6}.`);

    expect.soft(retractResponses.some((r) => r.startsWith('2')), 'STEP EXPECTED (per ADO): the Retract call should succeed for a Stage 5 sender — observed: the server rejects it with 403 Unauthorized, even though the UI shows the button and lets the confirmation flow complete').toBeTruthy();
    expect.soft(cprAfterRetract?.result?.progressReportStatus, 'STEP EXPECTED (per ADO): progressReportStatus should revert to 60').toBe(60);
    expect.soft(stillInStage6, 'STEP EXPECTED (per ADO): the item should leave the Stage 6 inbox').toBeFalsy();
  });

  test('TC-109767 Integration — Retract preserves audit trail and captured data without loss', async ({ page }) => {
    test.setTimeout(300_000);

    // Precondition: push CPR2026/1059 through Stage 1 -> 2 -> 3 to genuinely reach status 50.
    async function retrySubmit(submitButtonName: string) {
      let enabled = false;
      for (let i = 0; i < 6 && !enabled; i++) {
        enabled = await page.getByRole('button', { name: submitButtonName, exact: true }).isEnabled().catch(() => false);
        if (!enabled) {
          await page.reload({ waitUntil: 'domcontentloaded' });
          await page.waitForTimeout(6000);
          const cb2 = page.locator('input[type="checkbox"]').first();
          if (await cb2.isVisible().catch(() => false) && !(await cb2.isChecked().catch(() => false))) {
            await cb2.click({ force: true });
            await page.waitForTimeout(1500);
          }
        }
      }
      return enabled;
    }

    const stage1Auth = await loginAndGetAuth(page, 'stage1', '123qwe');
    const s1Inbox = await (await page.request.get(`${WF_API}/api/dynamic/Shesha.Workflow/WorkflowInboxItem/Crud/GetAll?maxResultCount=200`, { headers: stage1Auth })).json();
    const s1Item = (s1Inbox?.result?.items ?? []).find((i: any) => i.refNumber === 'CPR2026/1059' && /capture/i.test(i.actionText ?? ''));
    expect(s1Item, 'PRECONDITION: CPR2026/1059 should be at Stage 1 Capture to start the chain').toBeTruthy();
    await page.goto(`${BASE}/shesha/workflow-action?id=${s1Item.workflowInstanceId}&todoid=${s1Item.todoId}`, { waitUntil: 'domcontentloaded' });
    await page.waitForTimeout(8000);
    await page.locator('input[type="checkbox"]').first().click({ force: true });
    await page.waitForTimeout(1500);
    if (await retrySubmit('Submit')) {
      await page.getByRole('button', { name: 'Submit', exact: true }).click({ force: true });
      await page.waitForTimeout(5000);
    }

    const wfResp = await (await page.request.get(`${WF_API}/api/dynamic/Shesha.Workflow/WorkflowInstance/Crud/Get?id=${s1Item.workflowInstanceId}`, { headers: stage1Auth })).json();
    const cprId = wfResp?.result?.componentProgressReport?.id;

    const stage2Auth = await loginAndGetAuth(page, 'stage2', '123qwe');
    const s2Inbox = await (await page.request.get(`${WF_API}/api/dynamic/Shesha.Workflow/WorkflowInboxItem/Crud/GetAll?maxResultCount=200`, { headers: stage2Auth })).json();
    const s2Item = (s2Inbox?.result?.items ?? []).find((i: any) => i.workflowInstanceId === s1Item.workflowInstanceId);
    await page.goto(`${BASE}/shesha/workflow-action?id=${s2Item.workflowInstanceId}&todoid=${s2Item.todoId}`, { waitUntil: 'domcontentloaded' });
    await page.waitForTimeout(8000);
    const s2Checkbox = page.locator('input[type="checkbox"]').first();
    if (await s2Checkbox.isVisible().catch(() => false) && !(await s2Checkbox.isChecked().catch(() => false))) {
      await s2Checkbox.click({ force: true });
      await page.waitForTimeout(1000);
    }
    if (await page.getByRole('button', { name: 'Support Report', exact: true }).isEnabled().catch(() => false)) {
      await page.getByRole('button', { name: 'Support Report', exact: true }).click({ force: true });
      await page.waitForTimeout(5000);
    }

    const stage3Auth = await loginAndGetAuth(page, 'stage3', '123qwe');
    const s3Inbox = await (await page.request.get(`${WF_API}/api/dynamic/Shesha.Workflow/WorkflowInboxItem/Crud/GetAll?maxResultCount=200`, { headers: stage3Auth })).json();
    const s3Item = (s3Inbox?.result?.items ?? []).find((i: any) => i.workflowInstanceId === s1Item.workflowInstanceId);
    await page.goto(`${BASE}/shesha/workflow-action?id=${s3Item.workflowInstanceId}&todoid=${s3Item.todoId}`, { waitUntil: 'domcontentloaded' });
    await page.waitForTimeout(8000);
    const s3Checkbox = page.locator('input[type="checkbox"]').first();
    if (await s3Checkbox.isVisible().catch(() => false) && !(await s3Checkbox.isChecked().catch(() => false))) {
      await s3Checkbox.click({ force: true });
      await page.waitForTimeout(1000);
    }
    if (await page.getByRole('button', { name: 'Complete QA', exact: true }).isEnabled().catch(() => false)) {
      await page.getByRole('button', { name: 'Complete QA', exact: true }).click({ force: true });
      await page.waitForTimeout(5000);
    }

    const cprBefore = await (await page.request.get(`${WF_API}/api/dynamic/Epm/ComponentProgressReport/Crud/Get?id=${cprId}`, { headers: stage3Auth })).json();
    console.log(`PRECONDITION ACTUAL — progressReportStatus: ${cprBefore?.result?.progressReportStatus} (need 50 to proceed).`);
    expect(cprBefore?.result?.progressReportStatus, 'PRECONDITION: the chain should genuinely land the item at status 50').toBe(50);
    const poeBefore = cprBefore?.result?.portfolioOfEvidence;
    const execSummaryBefore = cprBefore?.result?.otherComments;

    const auditBeforeResp = await (await page.request.get(`${WF_API}/api/dynamic/Epm/EpmAuditedEntityEvent/Crud/GetAll?filter=${encodeURIComponent(JSON.stringify({ '==': [{ var: 'entity' }, cprId] }))}&maxResultCount=200&sorting=creationTime`, { headers: stage3Auth })).json();
    const auditBefore = auditBeforeResp?.result?.items ?? [];

    // STEP 1: Retract the Stage 3 sent item.
    await page.goto(`${BASE}/dynamic/Shesha.Workflow/workflows-sent`, { waitUntil: 'domcontentloaded' });
    await page.waitForTimeout(9000);
    const sentRow = page.getByRole('row', { name: /CPR2026\/1059/ }).first();
    await sentRow.locator('a.sha-link').first().click({ force: true });
    await page.waitForTimeout(6000);
    const retractResponses: string[] = [];
    page.on('response', (res) => {
      if (res.url().includes('RetractWorkflowTask')) retractResponses.push(`${res.status()}`);
    });
    await page.getByRole('button', { name: 'Retract', exact: true }).click({ force: true });
    await page.waitForTimeout(2000);
    const modal = page.locator('.ant-modal').last();
    await modal.getByRole('button', { name: 'Retract', exact: true }).first().click({ force: true });
    await page.waitForTimeout(5000);
    console.log(`STEP 1 ACTUAL — RetractWorkflowTask responses: ${JSON.stringify(retractResponses)}.`);
    expect(retractResponses.some((r) => r.startsWith('2')), 'STEP 1 EXPECTED: the Retract call should succeed for a Stage 3 sender').toBeTruthy();

    const cprAfter = await (await page.request.get(`${WF_API}/api/dynamic/Epm/ComponentProgressReport/Crud/Get?id=${cprId}`, { headers: stage3Auth })).json();
    console.log(`STEP 1 ACTUAL — progressReportStatus after Retract: ${cprAfter?.result?.progressReportStatus} (expected 40).`);
    expect(cprAfter?.result?.progressReportStatus, 'STEP 1 EXPECTED (per ADO): progressReportStatus should revert to exactly 40').toBe(40);

    const s3InboxAfter = await (await page.request.get(`${WF_API}/api/dynamic/Shesha.Workflow/WorkflowInboxItem/Crud/GetAll?maxResultCount=200`, { headers: stage3Auth })).json();
    const backInS3 = (s3InboxAfter?.result?.items ?? []).some((i: any) => i.workflowInstanceId === s1Item.workflowInstanceId);
    console.log(`STEP 1 ACTUAL — item reappears in stage3 Inbox: ${backInS3}.`);
    expect(backInS3, 'STEP 1 EXPECTED: the item should reappear in the stage3 Inbox').toBeTruthy();

    // STEP 2: captured fields (POE, Executive Summary) should still be present.
    console.log(`STEP 2 ACTUAL — POE before: ${JSON.stringify(poeBefore)}, after: ${JSON.stringify(cprAfter?.result?.portfolioOfEvidence)}.`);
    console.log(`STEP 2 ACTUAL — Executive Summary before: "${execSummaryBefore}", after: "${cprAfter?.result?.otherComments}".`);
    expect(cprAfter?.result?.portfolioOfEvidence?.id, 'STEP 2 EXPECTED: the Portfolio of Evidence attachment should not be cleared by Retract').toBe(poeBefore?.id);
    expect(cprAfter?.result?.otherComments, 'STEP 2 EXPECTED: the Executive Summary should not be cleared by Retract').toBe(execSummaryBefore);

    // STEP 3: audit trail should record the event, no prior rows deleted.
    const auditAfterResp = await (await page.request.get(`${WF_API}/api/dynamic/Epm/EpmAuditedEntityEvent/Crud/GetAll?filter=${encodeURIComponent(JSON.stringify({ '==': [{ var: 'entity' }, cprId] }))}&maxResultCount=200&sorting=creationTime`, { headers: stage3Auth })).json();
    const auditAfter = auditAfterResp?.result?.items ?? [];
    console.log(`STEP 3 ACTUAL — audit rows after: ${auditAfter.length} (was ${auditBefore.length}). Actions: ${JSON.stringify(auditAfter.map((a: any) => a.action))}.`);
    expect(auditAfter.length, 'STEP 3 EXPECTED (per ADO): a new audit row should be written for the Retract event').toBeGreaterThan(auditBefore.length);

    const beforeIds = new Set(auditBefore.map((a: any) => a.id));
    const afterIds = new Set(auditAfter.map((a: any) => a.id));
    const missing = [...beforeIds].filter((id) => !afterIds.has(id));
    console.log(`STEP 3 ACTUAL — pre-existing audit rows missing after Retract (should be empty): ${JSON.stringify(missing)}.`);
    expect(missing.length, 'STEP 3 EXPECTED (per ADO): no prior audit rows should be deleted').toBe(0);
  });
});
