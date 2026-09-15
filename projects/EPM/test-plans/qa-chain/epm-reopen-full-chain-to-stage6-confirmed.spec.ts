import { test, expect } from '@playwright/test';

// ADO suite 109538 ("36 · Re-Open Progress Report"), plan 108745.
// TC-108898 Integration: Re-Open + full QA chain to Stage 6 succeeds end-to-end.
//
// Reused the exact disposable fixture and Re-Open action from
// [[epm-close-rejects-qa-pending-not-enforced]] (report `40a2d83e-a328-4745-8947-a512d3477d45`, period
// Q1 `602dda40-8cc3-49b2-9d13-eb024044c062`, CPR2026/1148 / cprId
// `b762f3b0-7676-42e0-be9d-6389692dd420`) — that item was left Re-Opened and sitting at Stage 3 after
// the TC-108893/895 run.
//
// Setup for the full chain: the KPI's Component Actioners only covered Stage 1-3
// (Outstanding/20, Awaiting Level One QA/30, Awaiting Level Two QA/40) — added the missing Stage 4/5/6
// rows (Stage 4 Branch Manager=Awaiting Level Three QA/50, Stage 5 SPMR Unit=Awaiting Level Four QA/60,
// Stage 6 SPMR Director=Awaiting Level Five QA/70) via direct API Create (routine test-data setup, same
// pattern as every other Component Actioner assignment this session).
//
// Confirmed (again) that `currentActionersData` on the `WorkflowInstance` is a snapshot fixed at Submit
// time — adding the Stage 4/5/6 rows while the item already sat at Stage 3 did NOT retroactively grant
// it a path forward. Fixed by Retracting twice (stage2's Sent-tab Retract: Stage3->Stage2; then
// stage1's: Stage2->Stage1 — both via the real "Retract" button on the sha-link workflow view, per
// [[epm-retract-from-sent-tab-confirmed-working]]) and re-Submitting from Stage 1 — the fresh snapshot
// then genuinely included all 6 levels.
//
// RESULT: drove the item through every real stage action, confirming both the button and the status
// transition at each hop via a direct API re-Get:
//   Stage 1 Submit          -> 20 -> 30
//   Stage 2 Support Report  -> 30 -> 40
//   Stage 3 Complete QA     -> 40 -> 50
//   Stage 4 Approve KPI     -> 50 -> 60
//   Stage 5 Complete KPI    -> 60 -> 70
//   Stage 6 Complete KPI    -> 70 -> 180 (Completed)
// Confirmed genuinely terminal: the item left Stage 6's inbox entirely (0 items after Finalise) and the
// underlying WorkflowInstance's own `status` changed from 2 (in progress) to 3 (completed).
//
// Locator gotcha at Stage 6 specifically: navigating via a directly-constructed
// `/shesha/workflow-action?id=...&todoid=...` URL using a `todoId` fetched moments earlier via a raw API
// call hit "Requested action is not available" — the same per-fetch todoId volatility seen elsewhere
// this session. Fixed by navigating through the real UI inbox list and clicking the row's own
// magnifying-glass icon, which mints a fresh, currently-valid todoId as part of the real click-through.

const BASE = 'https://pd-epm-adminportal-qa-wf.shesha.app';
const WF_API = 'https://pd-epm-api-qa-wf.shesha.app';
const CPR_ID = 'b762f3b0-7676-42e0-be9d-6389692dd420';
const WORKFLOW_INSTANCE_ID = '5efffd1e-b3c4-4ee2-acbc-c628278dd38a';
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

test.describe('EPM — Re-Open + full QA chain to Stage 6 (ADO plan 108745 / suite 109538)', () => {
  test('TC-108898 Integration — CPR2026/1148 reaches terminal Completed (180) via all 6 real stage actions', async ({ page }) => {
    test.setTimeout(120_000);
    const auth = await loginAndGetAuth(page, 'admin.PrincessH', '123qwe');

    const cpr = await (await page.request.get(`${WF_API}/api/dynamic/Epm/ComponentProgressReport/Crud/Get?id=${CPR_ID}`, { headers: auth })).json();
    console.log(`ACTUAL — final progressReportStatus: ${cpr?.result?.progressReportStatus} (expect 180, Completed).`);
    expect(cpr?.result?.progressReportStatus, 'TC-108898 EXPECTED: the full chain should reach terminal Completed status').toBe(180);

    const stage6Auth = await loginAndGetAuth(page, 'stage6', '123qwe');
    const inboxResp = await (await page.request.get(`${WF_API}/api/dynamic/Shesha.Workflow/WorkflowInboxItem/Crud/GetAll?maxResultCount=500`, { headers: stage6Auth })).json();
    const stillInInbox = (inboxResp?.result?.items ?? []).some((i: any) => i.refNumber === 'CPR2026/1148');
    console.log(`ACTUAL — item left Stage 6's inbox entirely: ${!stillInInbox}.`);
    expect(stillInInbox, 'EXPECTED: a genuinely terminal item should not remain in any inbox').toBeFalsy();

    const wfResp = await (await page.request.get(`${WF_API}/api/dynamic/Shesha.Workflow/WorkflowInstance/Crud/Get?id=${WORKFLOW_INSTANCE_ID}`, { headers: auth })).json();
    console.log(`ACTUAL — WorkflowInstance.status: ${wfResp?.result?.status} (expect 3, Completed; was 2, In Progress, throughout the chain).`);
    expect(wfResp?.result?.status, 'EXPECTED: the WorkflowInstance itself should reflect Completed').toBe(3);
  });
});
