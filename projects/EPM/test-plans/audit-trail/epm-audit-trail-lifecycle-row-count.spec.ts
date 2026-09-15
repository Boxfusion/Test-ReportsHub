import { test, expect } from '@playwright/test';

// ADO TC-108874 (Integration — every workflow lifecycle event writes exactly one audit row), plan
// 108745 / suite 109532 "28 · EPM · Audit trail write path". Precondition: an item advances Stage 1
// Submit through Stage 6 Finalise (5 transitions). Expected: audit row count for the CPR equals 5, no
// duplicates, each row references a distinct AuditEntityEventAction reflist value in the
// OverallSubmit/ItemAccepted/ItemStatusChange family.
//
// CONFIRMED DEFECT live 2026-09-02. Fixture-pool data quality note first: every genuinely fresh item
// (0 pre-existing audit rows) in this tenant has a null Quarter Target, which is separately confirmed to
// permanently block Submit (see epm-actionlevel-null-breaks-publish-process-owner-gate and related
// notes) — so a truly zero-touch baseline wasn't reachable via any live item. Used the next best thing:
// `CPR2026/1061` (Quarter Target 50, genuinely "reporting open" — checked first, since another
// candidate, CPR2026/0872, turned out to have its reporting period closed and all fields disabled) with
// a small, known, non-transition baseline of 2 rows ("Item reassigned to Stage 1 Process Owner...",
// "Item was opened by actioner" — both pre-dating this test, from earlier tenant activity).
//
// Set Actual Target/Achievement Status/Executive Summary/Portfolio of Evidence directly via
// `PUT .../ComponentProgressReport/Crud/Update` (sidesteps the "Not Achieved" branch's extra
// required fields — Reason for Deviation, Corrective Action — which aren't the point of this test), then
// drove the real UI action at every stage: Submit, Support Report, Complete QA, Approve KPI, Complete
// KPI (Stage 5 Verify), Complete KPI (Stage 6 Finalise). `progressReportStatus` genuinely reached `180`
// at the end, confirming all 6 real actions succeeded.
//
// The audit row count was checked after EVERY single action. Result: **zero new rows were written at
// any point** — the count stayed at exactly 2 (the pre-existing baseline) through Submit, Support
// Report, Complete QA, Approve KPI, Verify, AND Finalise. Not 5, not even 1. No new row exists for any
// of the 5 transitions ADO expects, so there's nothing to check for duplicates or for distinct
// AuditEntityEventAction values either — steps 2 and 3 have no rows to evaluate.
//
// This generalizes and confirms, on a clean single-pass measurement, the audit-gap pattern already found
// piecemeal for individual actions this session: epm-sendback-no-audit-event-no-notification.md (Send
// Back writes 0 rows) and epm-stage6-duplicate-actioner-and-dashboard-refresh.md (Finalise alone writes
// 0 rows). Now confirmed: NONE of the six real forward-progression actions write an audit row — only
// certain framework-level events (item opened/received/reassigned) and Retract (confirmed writing one
// row in epm-retract-audit-and-data-integrity-confirmed.md) actually hit `EpmAuditedEntityEvent`. The
// "audit trail write path" this whole suite (109532) is about does not capture the primary business
// events it's meant to capture.

const BASE = 'https://pd-epm-adminportal-qa-wf.shesha.app';
const WF_API = 'https://pd-epm-api-qa-wf.shesha.app';
const SLOW = 420_000;
const STAGE6_PERSON_ID = '3b03d9ec-c891-48c4-be57-31489f8c43b7';

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

test.describe('EPM — Audit trail lifecycle row count (ADO plan 108745 / suite 109532)', () => {
  test('TC-108874 Integration — every lifecycle transition should write exactly one audit row (CONFIRMED DEFECT)', async ({ page }) => {
    test.setTimeout(600_000);

    const stage1Auth = await loginAndGetAuth(page, 'stage1', '123qwe');
    const s1Inbox = await (await page.request.get(`${WF_API}/api/dynamic/Shesha.Workflow/WorkflowInboxItem/Crud/GetAll?maxResultCount=300`, { headers: stage1Auth })).json();
    const s1Item = (s1Inbox?.result?.items ?? []).find((i: any) => /capture/i.test(i.actionText ?? '') && /Q1/i.test(i.subject ?? ''));
    console.log(`PRECONDITION ACTUAL — using ${s1Item?.refNumber}.`);
    expect(s1Item, 'PRECONDITION: a live Q1 Stage 1 Capture item should exist').toBeTruthy();

    const wfId = s1Item.workflowInstanceId;
    const wfResp = await (await page.request.get(`${WF_API}/api/dynamic/Shesha.Workflow/WorkflowInstance/Crud/Get?id=${wfId}`, { headers: stage1Auth })).json();
    const cprId = wfResp?.result?.componentProgressReport?.id;

    async function auditRows() {
      const resp = await (await page.request.get(`${WF_API}/api/dynamic/Epm/EpmAuditedEntityEvent/Crud/GetAll?filter=${encodeURIComponent(JSON.stringify({ '==': [{ var: 'entity' }, cprId] }))}&maxResultCount=200&sorting=creationTime`, { headers: stage1Auth })).json();
      return resp?.result?.items ?? [];
    }

    const baseline = await auditRows();
    console.log(`BASELINE — ${baseline.length} pre-existing rows: ${JSON.stringify(baseline.map((r: any) => r.action))}.`);

    // Set required fields directly (sidesteps the "Not Achieved" branch's extra required fields).
    const cprCheck = await (await page.request.get(`${WF_API}/api/dynamic/Epm/ComponentProgressReport/Crud/Get?id=${cprId}`, { headers: stage1Auth })).json();
    const target = cprCheck?.result?.indicatorTarget ?? 50;
    await page.request.put(`${WF_API}/api/dynamic/Epm/ComponentProgressReport/Crud/Update`, {
      headers: stage1Auth,
      data: { id: cprId, indicatorActual: target, achievementStatus: 1, otherComments: 'TC-108874 fixture: full lifecycle audit-row count test.' },
    });

    await page.goto(`${BASE}/shesha/workflow-action?id=${wfId}&todoid=${s1Item.todoId}`, { waitUntil: 'domcontentloaded' });
    await page.waitForTimeout(8000);
    await page.locator('input[type="checkbox"]').first().click({ force: true });
    await page.waitForTimeout(1000);
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
    expect(submitEnabled, 'PRECONDITION: Submit should become enabled after setting required fields').toBeTruthy();
    await page.getByRole('button', { name: 'Submit', exact: true }).click({ force: true });
    await page.waitForTimeout(5000);
    let rows = await auditRows();
    console.log(`AFTER Submit (1->2): ${rows.length} rows (delta ${rows.length - baseline.length}).`);

    const stage2Auth = await loginAndGetAuth(page, 'stage2', '123qwe');
    const s2Item = (await (await page.request.get(`${WF_API}/api/dynamic/Shesha.Workflow/WorkflowInboxItem/Crud/GetAll?maxResultCount=300`, { headers: stage2Auth })).json())?.result?.items?.find((i: any) => i.workflowInstanceId === wfId);
    await page.goto(`${BASE}/shesha/workflow-action?id=${wfId}&todoid=${s2Item.todoId}`, { waitUntil: 'domcontentloaded' });
    await page.waitForTimeout(8000);
    const s2cb = page.locator('input[type="checkbox"]').first();
    if (await s2cb.isVisible().catch(() => false) && !(await s2cb.isChecked().catch(() => false))) { await s2cb.click({ force: true }); await page.waitForTimeout(1000); }
    if (await page.getByRole('button', { name: 'Support Report', exact: true }).isEnabled().catch(() => false)) {
      await page.getByRole('button', { name: 'Support Report', exact: true }).click({ force: true });
      await page.waitForTimeout(5000);
    }
    rows = await auditRows();
    console.log(`AFTER Support Report (2->3): ${rows.length} rows.`);

    const stage3Auth = await loginAndGetAuth(page, 'stage3', '123qwe');
    const s3Item = (await (await page.request.get(`${WF_API}/api/dynamic/Shesha.Workflow/WorkflowInboxItem/Crud/GetAll?maxResultCount=300`, { headers: stage3Auth })).json())?.result?.items?.find((i: any) => i.workflowInstanceId === wfId);
    await page.goto(`${BASE}/shesha/workflow-action?id=${wfId}&todoid=${s3Item.todoId}`, { waitUntil: 'domcontentloaded' });
    await page.waitForTimeout(8000);
    const s3cb = page.locator('input[type="checkbox"]').first();
    if (await s3cb.isVisible().catch(() => false) && !(await s3cb.isChecked().catch(() => false))) { await s3cb.click({ force: true }); await page.waitForTimeout(1000); }
    if (await page.getByRole('button', { name: 'Complete QA', exact: true }).isEnabled().catch(() => false)) {
      await page.getByRole('button', { name: 'Complete QA', exact: true }).click({ force: true });
      await page.waitForTimeout(5000);
    }
    rows = await auditRows();
    console.log(`AFTER Complete QA (3->4): ${rows.length} rows.`);

    const stage4Auth = await loginAndGetAuth(page, 'stage4', '123qwe');
    const s4Item = (await (await page.request.get(`${WF_API}/api/dynamic/Shesha.Workflow/WorkflowInboxItem/Crud/GetAll?maxResultCount=300`, { headers: stage4Auth })).json())?.result?.items?.find((i: any) => i.workflowInstanceId === wfId);
    await page.goto(`${BASE}/shesha/workflow-action?id=${wfId}&todoid=${s4Item.todoId}`, { waitUntil: 'domcontentloaded' });
    await page.waitForTimeout(8000);
    const s4cb = page.locator('input[type="checkbox"]').first();
    if (await s4cb.isVisible().catch(() => false) && !(await s4cb.isChecked().catch(() => false))) { await s4cb.click({ force: true }); await page.waitForTimeout(1000); }
    if (await page.getByRole('button', { name: 'Approve KPI', exact: true }).isEnabled().catch(() => false)) {
      await page.getByRole('button', { name: 'Approve KPI', exact: true }).click({ force: true });
      await page.waitForTimeout(5000);
    }
    rows = await auditRows();
    console.log(`AFTER Approve KPI (4->5): ${rows.length} rows.`);

    const stage5Auth = await loginAndGetAuth(page, 'stage5', '123qwe');
    const s5Item = (await (await page.request.get(`${WF_API}/api/dynamic/Shesha.Workflow/WorkflowInboxItem/Crud/GetAll?maxResultCount=300`, { headers: stage5Auth })).json())?.result?.items?.find((i: any) => i.workflowInstanceId === wfId);
    await page.goto(`${BASE}/shesha/workflow-action?id=${wfId}&todoid=${s5Item.todoId}`, { waitUntil: 'domcontentloaded' });
    await page.waitForTimeout(8000);
    const s5cb = page.locator('input[type="checkbox"]').first();
    if (await s5cb.isVisible().catch(() => false) && !(await s5cb.isChecked().catch(() => false))) { await s5cb.click({ force: true }); await page.waitForTimeout(1000); }
    const s5Btn = page.getByRole('button', { name: /verify|complete kpi/i }).first();
    if (await s5Btn.isEnabled().catch(() => false)) { await s5Btn.click({ force: true }); await page.waitForTimeout(5000); }
    rows = await auditRows();
    console.log(`AFTER Complete KPI stage5 (5->6): ${rows.length} rows.`);

    const stage6Auth = await loginAndGetAuth(page, 'stage6', '123qwe');
    const s6Items = (await (await page.request.get(`${WF_API}/api/dynamic/Shesha.Workflow/WorkflowInboxItem/Crud/GetAll?maxResultCount=300`, { headers: stage6Auth })).json())?.result?.items ?? [];
    const s6Item = s6Items.find((i: any) => i.workflowInstanceId === wfId && i.personId === STAGE6_PERSON_ID) ?? s6Items.find((i: any) => i.workflowInstanceId === wfId);
    await page.goto(`${BASE}/shesha/workflow-action?id=${wfId}&todoid=${s6Item.todoId}`, { waitUntil: 'domcontentloaded' });
    await page.waitForTimeout(8000);
    const s6cb = page.locator('input[type="checkbox"]').first();
    if (await s6cb.isVisible().catch(() => false) && !(await s6cb.isChecked().catch(() => false))) { await s6cb.click({ force: true }); await page.waitForTimeout(1000); }
    const finaliseBtn = page.getByRole('button', { name: /finali[sz]e|complete kpi/i }).first();
    if (await finaliseBtn.isEnabled().catch(() => false)) {
      await finaliseBtn.click({ force: true });
      await page.waitForTimeout(3000);
      const modal = page.locator('.ant-modal').last();
      if (await modal.isVisible().catch(() => false)) {
        const confirmBtn = modal.getByRole('button', { name: /^(OK|Yes|Confirm|Finalise|Finalize|Complete KPI)$/i }).last();
        if (await confirmBtn.isVisible().catch(() => false)) { await confirmBtn.click({ force: true }); await page.waitForTimeout(5000); }
      }
    }

    const cprFinal = await (await page.request.get(`${WF_API}/api/dynamic/Epm/ComponentProgressReport/Crud/Get?id=${cprId}`, { headers: stage6Auth })).json();
    console.log(`STEP ACTUAL — final progressReportStatus: ${cprFinal?.result?.progressReportStatus} (expected 180, confirms all 6 actions genuinely succeeded).`);
    expect(cprFinal?.result?.progressReportStatus, 'PRECONDITION for the audit check: the full chain should genuinely reach Completed').toBe(180);

    const finalRows = await auditRows();
    console.log(`STEP 1 ACTUAL — total audit rows after the full 5-transition chain: ${finalRows.length} (expected 5 new + ${baseline.length} baseline = ${baseline.length + 5}).`);
    finalRows.forEach((r: any, idx: number) => console.log(`  [${idx}] actionType=${r.actionType} action="${r.action}" time=${r.creationTime}`));
    expect(finalRows.length - baseline.length, 'STEP 1 EXPECTED (per ADO): exactly 5 new audit rows, one per transition — observed: zero new rows across all 6 real actions (Submit/Support/QA/Approve/Verify/Finalise)').toBe(5);

    const ids = finalRows.map((r: any) => r.id);
    expect(ids.length, 'STEP 2 EXPECTED: no duplicate rows').toBe(new Set(ids).size);

    const newActionTypes = new Set(finalRows.slice(baseline.length).map((r: any) => r.actionType));
    console.log(`STEP 3 ACTUAL — distinct actionType values among the new rows: ${JSON.stringify([...newActionTypes])} (expected 5 distinct values in the OverallSubmit/ItemAccepted/ItemStatusChange family).`);
    expect(newActionTypes.size, 'STEP 3 EXPECTED (per ADO): 5 distinct AuditEntityEventAction values — observed: no new rows exist at all to have any action value').toBe(5);
  });
});
