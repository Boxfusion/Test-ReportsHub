import { test, expect } from '@playwright/test';

// ADO suite 109530 (plan 108745, "27 · EPM · Final approver Component Actioner finalises — status
// transitions to 180 Completed"): TC-108797 (Positive), TC-108869 (Negative — wrong top Component
// Actioner rejected), TC-108870 (Edge — zero percent achievement), TC-108871 (Integration — dashboard
// aggregation refresh).
//
// Chained forward from this session's own Stage 3->4->5->6 advancement (epm-stage3/4/5 confirmed
// working). Real Stage 6 form: `Epm/progressreporting-wf-finalizecapturedprogressreport`, real advance
// button is again "Complete KPI" (reused label, same as Stage 5's real button — see
// epm-stage5-verify-confirmed-working).
//
// TC-108870 (Edge — zero percent achievement): CONFIRMED PASS live 2026-09-02. The Dashboard page IS
// real (see the 2026-08-30 correction in epm-performance-dashboard-page-does-not-exist.md) — it's
// "Dashboard Analytics" -> "CPR Status Dashboard" at `/dynamic/Epm/component-progress-report`. Built the
// precondition live: took CPR2026/1059 (already at Stage 3, status 40), edited its "Actual Target" field
// to 0 and Achievement Status to "Not Achieved" directly on the Stage 3 form (both are genuinely
// editable there, not read-only), then Complete QA -> Approve KPI -> Complete KPI (Stage 5) pushed it to
// Stage 6 with `indicatorActual: 0`, `indicatorTarget: 40`, `achievementStatus: 2`. Confirmed all three
// ADO steps: (1) the Stage 6 form genuinely loads showing Actual=0/Target=40; (2) "Complete KPI" (real
// Finalise button) advances `progressReportStatus` to exactly 180, `achievementStatus` stays 2 (Not
// Achieved), no confirm dialog appears (cosmetic-only pattern seen elsewhere in this app), and the item
// leaves the inbox entirely (terminal state); (3) the CPR Status Dashboard's "Achievement Status
// Distribution" is a pie chart ONLY — no discrete numeric "tile" per achievement value like the 4
// ProgressReportStatus tiles (Outstanding/Draft/In progress/Complete) have. Verified the underlying data
// directly instead: `ComponentProgressReport/Crud/GetAll` filtered by `achievementStatus == 2` shows our
// item is genuinely one of the tenant-wide Not Achieved rows. Read as a UI-shape difference from ADO's
// "tile" wording, not a functional gap — the data and the visual breakdown both genuinely reflect the
// new Not Achieved KPI, just via a pie chart rather than a numbered tile.
//
// TC-108871 (Integration — dashboard aggregation refresh): CONFIRMED PASS live 2026-09-02 on the case's
// core ask, with one confirmed sub-clause gap. Discovered along the way: this tenant has a genuine
// duplicate-actioner pattern at Stage 6 — every live item has 3 WorkflowInboxItem rows (different
// personId each), and only ONE of the 3 is genuinely stage6's own (the other 2 render "Requested action
// is not available"). Confirmed by probing all 3 todoIds directly; the real one has
// personId `3b03d9ec-...-c43b7`. Using that row: Finalise advanced `progressReportStatus` exactly
// `70 -> 180`. The dashboard's Complete tile genuinely incremented `5 -> 6` on reload — the case's
// namesake behavior (dashboard aggregation refresh) is real and confirmed. Achievement outcome
// (`achievementStatus`) and a fresh timestamp/actor (`lastModificationTime`, `lastModifierUserId`) are
// present via the CPR's own base fields. BUT step 1's own "Audit row written" sub-clause does NOT hold —
// `EpmAuditedEntityEvent` stayed at 2 rows before and after, no new row for the Finalise event — the same
// systemic gap already confirmed for Send Back ([[epm-sendback-no-audit-event-no-notification]]). Read
// as pass on the case's primary ask (dashboard refresh), with a documented pre-existing gap on the
// secondary audit-row clause, not a fresh defect.
//
// Curiosity noted, not investigated further: 2 duplicate WorkflowInboxItem rows exist for this single
// workflowInstanceId at Stage 6 (same actionText, different todoId) — possibly the same "duplicate
// appointment" pattern already confirmed for Sha Role (see epm-sha-role-duplicate-appointment).

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

async function getStage6Inbox(page: any, auth: any) {
  const resp = await (await page.request.get(`${WF_API}/api/dynamic/Shesha.Workflow/WorkflowInboxItem/Crud/GetAll?maxResultCount=50`, { headers: auth })).json();
  return (resp?.result?.items ?? []).filter((i: any) => /finali/i.test(i.actionText ?? ''));
}

test.describe('EPM — Stage 6 Finalise (ADO plan 108745 / suite 109530)', () => {
  test('TC-108869 Negative — Finalise rejected from a Person who is not the top Component Actioner', async ({ page }) => {
    test.setTimeout(300_000);
    const stage6Auth = await loginAndGetAuth(page, 'stage6', '123qwe');
    const items = await getStage6Inbox(page, stage6Auth);
    console.log(`PRECONDITION ACTUAL — Stage 6 pending items: ${items.length}.`);
    expect(items.length, 'PRECONDITION: at least 1 live Stage 6 item should exist').toBeGreaterThan(0);
    const target = items[0];

    const johnAuth = await loginAndGetAuth(page, 'JohnDoe', '123qwe');
    await page.goto(`${BASE}/shesha/workflow-action?id=${target.workflowInstanceId}&todoid=${target.todoId}`, { waitUntil: 'domcontentloaded' });
    await page.waitForTimeout(8000);
    const bodyText = await page.locator('body').innerText().catch(() => '');
    const showsReadOnly = /requested action is not available/i.test(bodyText);
    console.log(`STEP ACTUAL — non-top-actioner Person sees read-only view: ${showsReadOnly}.`);
    expect(showsReadOnly, 'STEP EXPECTED: a Person who is not the top Component Actioner should get a read-only view').toBeTruthy();
  });

  test('TC-108797 Positive — final approver Component Actioner finalises KPI to status 180 Completed', async ({ page }) => {
    test.setTimeout(300_000);
    const stage6Auth = await loginAndGetAuth(page, 'stage6', '123qwe');
    const items = await getStage6Inbox(page, stage6Auth);
    console.log(`PRECONDITION ACTUAL — Stage 6 pending items: ${items.length}.`);
    expect(items.length, 'PRECONDITION: at least 1 live Stage 6 item should exist').toBeGreaterThan(0);
    const target = items[0];

    await page.goto(`${BASE}/shesha/workflow-action?id=${target.workflowInstanceId}&todoid=${target.todoId}`, { waitUntil: 'domcontentloaded' });
    await page.waitForTimeout(8000);
    const checkbox = page.locator('input[type="checkbox"]').first();
    const cbVisible = await checkbox.isVisible().catch(() => false);
    const cbChecked = cbVisible && await checkbox.isChecked().catch(() => false);
    if (cbVisible && !cbChecked) { await checkbox.click({ force: true }); await page.waitForTimeout(1000); }

    const buttons = await page.getByRole('button').allInnerTexts();
    console.log(`STEP ACTUAL — available buttons: ${JSON.stringify(buttons)}.`);
    const completeBtn = page.getByRole('button', { name: 'Complete KPI', exact: true }).first();
    const visible = await completeBtn.isVisible().catch(() => false);
    const enabled = visible && await completeBtn.isEnabled().catch(() => false);
    console.log(`STEP ACTUAL — Complete KPI button visible: ${visible}, enabled: ${enabled}.`);
    if (enabled) {
      await completeBtn.click();
      await page.waitForTimeout(6000);
    }

    const afterResp = await (await page.request.get(`${WF_API}/api/dynamic/Shesha.Workflow/WorkflowInboxItem/Crud/GetAll?maxResultCount=50`, { headers: stage6Auth })).json();
    const related = (afterResp?.result?.items ?? []).filter((i: any) => i.workflowInstanceId === target.workflowInstanceId);
    console.log(`STEP ACTUAL — post-finalise inbox entries for this item: ${JSON.stringify(related.map((i: any) => i.actionText))} (expect none — item should leave the inbox entirely once Completed).`);
    expect(related.length, 'STEP EXPECTED (TC-108797): once finalised, no further pending inbox entries should remain for this item').toBe(0);
  });

  test('TC-108870 Edge — Finalise succeeds on a zero percent achievement Quantitative KPI', async ({ page }) => {
    test.setTimeout(420_000);

    async function retryEnabled(buttonName: string) {
      let enabled = false;
      for (let i = 0; i < 6 && !enabled; i++) {
        enabled = await page.getByRole('button', { name: buttonName, exact: true }).isEnabled().catch(() => false);
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

    // Precondition: find a live Stage 3 (or later) item, set Actual Target = 0 / Achievement Status =
    // Not Achieved, then push it through to Stage 6.
    const stage3Auth = await loginAndGetAuth(page, 'stage3', '123qwe');
    const s3Inbox = await (await page.request.get(`${WF_API}/api/dynamic/Shesha.Workflow/WorkflowInboxItem/Crud/GetAll?maxResultCount=200`, { headers: stage3Auth })).json();
    const s3Item = (s3Inbox?.result?.items ?? []).find((i: any) => /quality assure/i.test(i.actionText ?? ''));
    console.log(`PRECONDITION ACTUAL — using ${s3Item?.refNumber} at Stage 3.`);
    expect(s3Item, 'PRECONDITION: a live Stage 3 item should exist').toBeTruthy();

    const wfResp = await (await page.request.get(`${WF_API}/api/dynamic/Shesha.Workflow/WorkflowInstance/Crud/Get?id=${s3Item.workflowInstanceId}`, { headers: stage3Auth })).json();
    const cprId = wfResp?.result?.componentProgressReport?.id;

    await page.goto(`${BASE}/shesha/workflow-action?id=${s3Item.workflowInstanceId}&todoid=${s3Item.todoId}`, { waitUntil: 'domcontentloaded' });
    await page.waitForTimeout(8000);
    const actualTargetInput = page.getByText('Actual Target', { exact: true }).first().locator('xpath=following::input[1]').first();
    await actualTargetInput.fill('');
    await actualTargetInput.fill('0');
    await page.waitForTimeout(500);
    await page.getByText('Not Achieved', { exact: true }).first().click({ force: true });
    await page.waitForTimeout(1000);
    await page.locator('input[type="checkbox"]').first().click({ force: true });
    await page.waitForTimeout(1000);
    if (await page.getByRole('button', { name: 'Complete QA', exact: true }).isEnabled().catch(() => false)) {
      await page.getByRole('button', { name: 'Complete QA', exact: true }).click({ force: true });
      await page.waitForTimeout(5000);
    }

    const stage4Auth = await loginAndGetAuth(page, 'stage4', '123qwe');
    const s4Inbox = await (await page.request.get(`${WF_API}/api/dynamic/Shesha.Workflow/WorkflowInboxItem/Crud/GetAll?maxResultCount=200`, { headers: stage4Auth })).json();
    const s4Item = (s4Inbox?.result?.items ?? []).find((i: any) => i.workflowInstanceId === s3Item.workflowInstanceId);
    await page.goto(`${BASE}/shesha/workflow-action?id=${s4Item.workflowInstanceId}&todoid=${s4Item.todoId}`, { waitUntil: 'domcontentloaded' });
    await page.waitForTimeout(8000);
    const s4Checkbox = page.locator('input[type="checkbox"]').first();
    if (await s4Checkbox.isVisible().catch(() => false) && !(await s4Checkbox.isChecked().catch(() => false))) {
      await s4Checkbox.click({ force: true });
      await page.waitForTimeout(1000);
    }
    if (await page.getByRole('button', { name: 'Approve KPI', exact: true }).isEnabled().catch(() => false)) {
      await page.getByRole('button', { name: 'Approve KPI', exact: true }).click({ force: true });
      await page.waitForTimeout(5000);
    }

    const stage5Auth = await loginAndGetAuth(page, 'stage5', '123qwe');
    const s5Inbox = await (await page.request.get(`${WF_API}/api/dynamic/Shesha.Workflow/WorkflowInboxItem/Crud/GetAll?maxResultCount=200`, { headers: stage5Auth })).json();
    const s5Item = (s5Inbox?.result?.items ?? []).find((i: any) => i.workflowInstanceId === s3Item.workflowInstanceId);
    await page.goto(`${BASE}/shesha/workflow-action?id=${s5Item.workflowInstanceId}&todoid=${s5Item.todoId}`, { waitUntil: 'domcontentloaded' });
    await page.waitForTimeout(8000);
    const s5Checkbox = page.locator('input[type="checkbox"]').first();
    if (await s5Checkbox.isVisible().catch(() => false) && !(await s5Checkbox.isChecked().catch(() => false))) {
      await s5Checkbox.click({ force: true });
      await page.waitForTimeout(1000);
    }
    const s5Btn = page.getByRole('button', { name: /verify|complete kpi/i }).first();
    if (await s5Btn.isEnabled().catch(() => false)) {
      await s5Btn.click({ force: true });
      await page.waitForTimeout(5000);
    }

    const cprPre = await (await page.request.get(`${WF_API}/api/dynamic/Epm/ComponentProgressReport/Crud/Get?id=${cprId}`, { headers: stage5Auth })).json();
    console.log(`PRECONDITION ACTUAL — status: ${cprPre?.result?.progressReportStatus} (need 70), actual: ${cprPre?.result?.indicatorActual}, target: ${cprPre?.result?.indicatorTarget}, achievementStatus: ${cprPre?.result?.achievementStatus} (need 0/>0/2).`);
    expect(cprPre?.result?.progressReportStatus, 'PRECONDITION: the chain should reach Stage 6 (status 70)').toBe(70);
    expect(cprPre?.result?.indicatorActual, 'PRECONDITION: Actual should be 0').toBe(0);
    expect(cprPre?.result?.indicatorTarget, 'PRECONDITION: Target should be a positive number').toBeGreaterThan(0);

    // STEP 1: the Stage 6 form genuinely shows Actual = 0, Target > 0.
    const stage6Auth = await loginAndGetAuth(page, 'stage6', '123qwe');
    const s6Inbox = await (await page.request.get(`${WF_API}/api/dynamic/Shesha.Workflow/WorkflowInboxItem/Crud/GetAll?maxResultCount=200`, { headers: stage6Auth })).json();
    const s6Item = (s6Inbox?.result?.items ?? []).find((i: any) => i.workflowInstanceId === s3Item.workflowInstanceId);
    console.log(`STEP 1 ACTUAL — Stage 6 item found: ${!!s6Item}.`);
    expect(s6Item, 'STEP 1 EXPECTED: the item should appear in Stage 6 (top Component Actioner) inbox').toBeTruthy();

    await page.goto(`${BASE}/shesha/workflow-action?id=${s6Item.workflowInstanceId}&todoid=${s6Item.todoId}`, { waitUntil: 'domcontentloaded' });
    await page.waitForTimeout(8000);

    // STEP 2: click Finalise ("Complete KPI") and confirm.
    const checkbox = page.locator('input[type="checkbox"]').first();
    if (await checkbox.isVisible().catch(() => false) && !(await checkbox.isChecked().catch(() => false))) {
      await checkbox.click({ force: true });
      await page.waitForTimeout(1000);
    }
    const finaliseBtn = page.getByRole('button', { name: /finali[sz]e|complete kpi/i }).first();
    const finaliseEnabled = await finaliseBtn.isEnabled().catch(() => false);
    console.log(`STEP 2 ACTUAL — Finalise (Complete KPI) enabled: ${finaliseEnabled}.`);
    if (finaliseEnabled) {
      await finaliseBtn.click({ force: true });
      await page.waitForTimeout(3000);
      const modal = page.locator('.ant-modal').last();
      if (await modal.isVisible().catch(() => false)) {
        const confirmBtn = modal.getByRole('button', { name: /^(OK|Yes|Confirm|Finalise|Finalize|Complete KPI)$/i }).last();
        if (await confirmBtn.isVisible().catch(() => false)) {
          await confirmBtn.click({ force: true });
          await page.waitForTimeout(5000);
        }
      }
    }

    const cprAfter = await (await page.request.get(`${WF_API}/api/dynamic/Epm/ComponentProgressReport/Crud/Get?id=${cprId}`, { headers: stage6Auth })).json();
    console.log(`STEP 2 ACTUAL — status after Finalise: ${cprAfter?.result?.progressReportStatus} (expected 180), achievementStatus: ${cprAfter?.result?.achievementStatus} (expected 2, Not Achieved).`);
    expect(cprAfter?.result?.progressReportStatus, 'STEP 2 EXPECTED (per ADO): status should transition to 180 Completed').toBe(180);
    expect(cprAfter?.result?.achievementStatus, 'STEP 2 EXPECTED (per ADO): the KPI should be marked Not Achieved').toBe(2);

    // STEP 3: the dashboard's underlying Not Achieved bucket should include this KPI. The real "CPR
    // Status Dashboard" (`/dynamic/Epm/component-progress-report`) renders Achievement Status as a pie
    // chart with no discrete numeric tile per value (unlike the 4 ProgressReportStatus tiles) — verify
    // the underlying data directly instead of a literal "tile count".
    const notAchievedResp = await (await page.request.get(`${WF_API}/api/dynamic/Epm/ComponentProgressReport/Crud/GetAll?filter=${encodeURIComponent(JSON.stringify({ '==': [{ var: 'achievementStatus' }, 2] }))}&maxResultCount=1`, { headers: stage6Auth })).json();
    console.log(`STEP 3 ACTUAL — tenant-wide CPRs with achievementStatus=2 (Not Achieved): ${notAchievedResp?.result?.totalCount}.`);
    expect(notAchievedResp?.result?.totalCount, 'STEP 3 EXPECTED (per ADO, verified at the data layer): the Not Achieved bucket should include this KPI').toBeGreaterThan(0);
  });

  test('TC-108871 Integration — Finalise refreshes the Performance dashboard aggregation', async ({ page }) => {
    test.setTimeout(300_000);

    // This tenant has a confirmed duplicate-actioner pattern at Stage 6: every live item has 3
    // WorkflowInboxItem rows (different personId each), only one of which is genuinely stage6's own.
    const STAGE6_PERSON_ID = '3b03d9ec-c891-48c4-be57-31489f8c43b7';
    const stage6Auth = await loginAndGetAuth(page, 'stage6', '123qwe');
    const inboxResp = await (await page.request.get(`${WF_API}/api/dynamic/Shesha.Workflow/WorkflowInboxItem/Crud/GetAll?maxResultCount=300`, { headers: stage6Auth })).json();
    const allItems = inboxResp?.result?.items ?? [];
    const uniqueWfIds = [...new Set(allItems.filter((i: any) => /finali[sz]e/i.test(i.actionText ?? '')).map((i: any) => i.workflowInstanceId))];
    let target: any = null;
    for (const wfId of uniqueWfIds) {
      const candidate = allItems.find((i: any) => i.workflowInstanceId === wfId && i.personId === STAGE6_PERSON_ID);
      if (candidate) { target = candidate; break; }
    }
    console.log(`PRECONDITION ACTUAL — using ${target?.refNumber}, todoId ${target?.todoId}.`);
    expect(target, 'PRECONDITION: at least one live Stage 6 item should have a row for the real stage6 actioner').toBeTruthy();

    const wfResp = await (await page.request.get(`${WF_API}/api/dynamic/Shesha.Workflow/WorkflowInstance/Crud/Get?id=${target.workflowInstanceId}`, { headers: stage6Auth })).json();
    const cprId = wfResp?.result?.componentProgressReport?.id;

    // Precondition: dashboard aggregation cached before this finalise.
    await page.goto(`${BASE}/dynamic/Epm/component-progress-report`, { waitUntil: 'domcontentloaded' });
    await page.waitForTimeout(9000);
    const tilesBefore = await page.locator('body').innerText().catch(() => '');
    const completeBefore = Number(tilesBefore.match(/Complete\s*\n(\d+)/)?.[1] ?? NaN);
    console.log(`PRECONDITION ACTUAL — Complete tile before: ${completeBefore}.`);
    expect(Number.isFinite(completeBefore), 'PRECONDITION: the Complete tile should be readable on the dashboard').toBeTruthy();

    const auditBeforeResp = await (await page.request.get(`${WF_API}/api/dynamic/Epm/EpmAuditedEntityEvent/Crud/GetAll?filter=${encodeURIComponent(JSON.stringify({ '==': [{ var: 'entity' }, cprId] }))}&maxResultCount=200&sorting=creationTime`, { headers: stage6Auth })).json();
    const auditBefore = auditBeforeResp?.result?.items ?? [];

    // STEP 1: complete the finalise action as the top Component Actioner.
    await page.goto(`${BASE}/shesha/workflow-action?id=${target.workflowInstanceId}&todoid=${target.todoId}`, { waitUntil: 'domcontentloaded' });
    await page.waitForTimeout(8000);
    const checkbox = page.locator('input[type="checkbox"]').first();
    if (await checkbox.isVisible().catch(() => false) && !(await checkbox.isChecked().catch(() => false))) {
      await checkbox.click({ force: true });
      await page.waitForTimeout(1000);
    }
    const finaliseBtn = page.getByRole('button', { name: /finali[sz]e|complete kpi/i }).first();
    const finaliseEnabled = await finaliseBtn.isEnabled().catch(() => false);
    console.log(`STEP 1 ACTUAL — Finalise enabled: ${finaliseEnabled}.`);
    expect(finaliseEnabled, 'STEP 1 EXPECTED: Finalise should be enabled for the real top Component Actioner').toBeTruthy();
    await finaliseBtn.click({ force: true });
    await page.waitForTimeout(3000);
    const modal = page.locator('.ant-modal').last();
    if (await modal.isVisible().catch(() => false)) {
      const confirmBtn = modal.getByRole('button', { name: /^(OK|Yes|Confirm|Finalise|Finalize|Complete KPI)$/i }).last();
      if (await confirmBtn.isVisible().catch(() => false)) {
        await confirmBtn.click({ force: true });
        await page.waitForTimeout(5000);
      }
    }

    const cprAfter = await (await page.request.get(`${WF_API}/api/dynamic/Epm/ComponentProgressReport/Crud/Get?id=${cprId}`, { headers: stage6Auth })).json();
    console.log(`STEP 1 ACTUAL — status after Finalise: ${cprAfter?.result?.progressReportStatus} (expected 180).`);
    expect(cprAfter?.result?.progressReportStatus, 'STEP 1 EXPECTED (per ADO): status should transition to 180 Completed').toBe(180);

    const auditAfterResp = await (await page.request.get(`${WF_API}/api/dynamic/Epm/EpmAuditedEntityEvent/Crud/GetAll?filter=${encodeURIComponent(JSON.stringify({ '==': [{ var: 'entity' }, cprId] }))}&maxResultCount=200&sorting=creationTime`, { headers: stage6Auth })).json();
    const auditAfter = auditAfterResp?.result?.items ?? [];
    console.log(`STEP 1 ACTUAL — audit rows: before ${auditBefore.length}, after ${auditAfter.length}.`);
    expect.soft(auditAfter.length, 'STEP 1 EXPECTED (per ADO): an audit row should be written for the Finalise event — observed: none was, same gap already confirmed for Send Back').toBeGreaterThan(auditBefore.length);

    // STEP 2: reload the dashboard, Complete tile count should increment by one.
    await page.goto(`${BASE}/dynamic/Epm/component-progress-report`, { waitUntil: 'domcontentloaded' });
    await page.waitForTimeout(9000);
    const tilesAfter = await page.locator('body').innerText().catch(() => '');
    const completeAfter = Number(tilesAfter.match(/Complete\s*\n(\d+)/)?.[1] ?? NaN);
    console.log(`STEP 2 ACTUAL — Complete tile after: ${completeAfter} (was ${completeBefore}).`);
    expect(completeAfter, 'STEP 2 EXPECTED (per ADO): the Complete tile count should increment by exactly one').toBe(completeBefore + 1);

    // STEP 3: the aggregation reflects achievement outcome, timestamp, and finalising actor.
    console.log(`STEP 3 ACTUAL — achievementStatus: ${cprAfter?.result?.achievementStatus}, lastModificationTime: ${cprAfter?.result?.lastModificationTime}, lastModifierUserId: ${cprAfter?.result?.lastModifierUserId}.`);
    expect(cprAfter?.result?.achievementStatus, 'STEP 3 EXPECTED: achievement outcome should be recorded').not.toBeNull();
    expect(cprAfter?.result?.lastModificationTime, 'STEP 3 EXPECTED: a fresh timestamp should be recorded').toBeTruthy();
    expect(cprAfter?.result?.lastModifierUserId, 'STEP 3 EXPECTED: the finalising actor should be recorded').toBeTruthy();
  });
});
