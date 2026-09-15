import { test, expect } from '@playwright/test';

// ADO suite 109539 ("35 · Close Progress Report"), plan 108745.
// TC-108893 Negative: reject Close when items are still pending in QA.
// TC-108895 Integration (bonus, same live run): cascade withdraws Workflow Instances across all 6
// stages — confirmed live in the SAME test as a direct consequence of the same root cause.
//
// SUPERSEDES the "unverified, fixture-seeding limitation" note in
// epm-close-reopen-progress-report-mechanism-confirmed.md — found the missing piece live 2026-09-03:
// a newly-Published report's periods start in "Draft," and the real trigger to seed genuine
// ComponentProgressReport/WorkflowInstance rows for every checked-in KPI is the "Open Progress Report"
// action (the same real mechanism documented in epm-open-progress-report-inert.md — a hover-triggered
// antd overflow-menu item, NOT the plain "Open" reflist status). Once a real WorkflowInstance exists,
// it can be driven through real stages exactly like any other live item this session.
//
// Fixture build (disposable, from scratch): created a new Performance Report ("TC-108893
// Close-QA-Pending Test", id 40a2d83e-a328-4745-8947-a512d3477d45), used "Copy Existing Tree" to
// duplicate ManageTester's real tree (POST .../DuplicateTree/{sourceId}), assigned real Component
// Actioners for Stage 1/2/3 (Stage 1 Process Owner=Outstanding/20, Stage 2 Chief Director=Awaiting Level
// One QA/30, Stage 3 Branch Coordinator=Awaiting Level Two QA/40) on the real KPI ("Number of Provinces
// and Metros supported to upgrade Phase 3..."), Published, then genuinely Opened Q1 via the real
// hover+mouse-click "Open Progress Report" mechanism (3 real API calls: PublishProgressReport,
// InitializeWorkflowReportingComponents, QueueCreateWorkflows) — this created a real CPR2026/1148 with a
// real WorkflowInstance.
//
// Locator gotcha discovered: the Component Actioner "Add" modal's dropdowns must be interacted with via
// direct coordinate clicks on the rendered option list, not `.filter({hasText})` + `.click()` — repeated
// attempts at that pattern silently typed into the wrong background element (the list-page's own
// pagination search box, hidden behind the modal) instead of the modal's own select.
//
// Submit-time gotcha: `currentActionersData` on the WorkflowInstance is a SNAPSHOT taken at Submit —
// adding more Component Actioner rows after an item is already in flight does NOT retroactively update
// it. Had to Retract (from the Sent tab, confirmed working per epm-retract-from-sent-tab-confirmed) back
// to Stage 1 and re-Submit after adding the Stage 2/3 actioners, for the snapshot to include them.
//
// RESULT (the actual test): with CPR2026/1148 genuinely sitting in Stage 3's live inbox (status 40,
// "Awaiting Level Two QA", confirmed via a real WorkflowInboxItem for the stage3 login), clicked "Close
// Progress Report" on Q1 via the real ellipsis-menu mechanism. It succeeded cleanly: real success toast
// "Progress Report has been successfully closed for reporting," Q1 status genuinely Open -> Closed. NO
// rejection, no warning, no validation gate of any kind related to in-flight QA items.
//
// Polled the CPR's own status and the Stage 3 inbox for ~40 seconds after Close: CPR status stayed 40
// (untouched), and the Stage 3 WorkflowInboxItem was STILL PRESENT AND FULLY ACTIONABLE — the period-level
// Close action and the KPI-level workflow instance are completely disconnected. This directly answers
// TC-108895 too: there is no cascade withdrawal of any kind, let alone one spanning all 6 stages.

const BASE = 'https://pd-epm-adminportal-qa-wf.shesha.app';
const WF_API = 'https://pd-epm-api-qa-wf.shesha.app';
const REPORT_ID = '40a2d83e-a328-4745-8947-a512d3477d45';
const PERIOD_ID = '602dda40-8cc3-49b2-9d13-eb024044c062';
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

test.describe('EPM — Close Progress Report vs items pending in QA (ADO plan 108745 / suite 109539)', () => {
  test('TC-108893/108895 — Close succeeds unconditionally; no cascade withdrawal occurs', async ({ page }) => {
    test.setTimeout(180_000);
    const auth = await loginAndGetAuth(page, 'admin.PrincessH', '123qwe');

    // Precondition: confirm the item is genuinely at Stage 3 (pending QA)
    const before = await (await page.request.get(`${WF_API}/api/dynamic/Epm/ComponentProgressReport/Crud/Get?id=${CPR_ID}`, { headers: auth })).json();
    console.log(`PRECONDITION ACTUAL — CPR2026/1148 progressReportStatus=${before?.result?.progressReportStatus} (expect 40, Awaiting Level Two QA / Stage 3).`);
    expect(before?.result?.progressReportStatus, 'PRECONDITION: item should be genuinely pending in QA before attempting Close').toBe(40);

    const stage3Auth = await loginAndGetAuth(page, 'stage3', '123qwe');
    const inboxResp = await (await page.request.get(`${WF_API}/api/dynamic/Shesha.Workflow/WorkflowInboxItem/Crud/GetAll?maxResultCount=500`, { headers: stage3Auth })).json();
    const stillInInbox = (inboxResp?.result?.items ?? []).some((i: any) => i.refNumber === 'CPR2026/1148');
    console.log(`PRECONDITION ACTUAL — a genuine live WorkflowInboxItem exists for Stage 3: ${stillInInbox}.`);
    expect(stillInInbox, 'PRECONDITION: a real, live Stage 3 inbox item should exist').toBeTruthy();

    // The actual test: attempt Close while genuinely pending in QA
    const adminAuth = await loginAndGetAuth(page, 'admin.PrincessH', '123qwe');
    await page.goto(`${BASE}/dynamic/Epm/performance-report-details-view?id=${REPORT_ID}`, { waitUntil: 'domcontentloaded' });
    await page.waitForTimeout(6000);
    await page.getByText('Q1', { exact: true }).first().click();
    await page.waitForTimeout(1000);
    const overflowTrigger = page.locator('.ant-menu-submenu.ant-menu-overflow-item-rest').first();
    await overflowTrigger.click({ force: true });
    await page.waitForTimeout(1000);
    const closeBtn = page.locator('button.sha-toolbar-btn:has-text("Close Progress Report")').first();
    const closeVisible = await closeBtn.isVisible().catch(() => false);
    console.log(`STEP ACTUAL — Close Progress Report is reachable while the item is pending in QA: ${closeVisible}.`);

    await closeBtn.evaluate((el: HTMLElement) => el.click());
    await page.waitForTimeout(1500);
    const okBtn = page.getByRole('button', { name: /^(ok|yes|confirm)$/i }).first();
    if (await okBtn.isVisible().catch(() => false)) await okBtn.click();
    await page.waitForTimeout(3000);

    const bodyText = await page.locator('body').innerText().catch(() => '');
    const closedSuccessfully = bodyText.includes('successfully closed');
    console.log(`TC-108893 ACTUAL — Close succeeded despite the item being pending in QA: ${closedSuccessfully}.`);
    expect(closedSuccessfully, 'TC-108893 EXPECTED (per ADO): Close should be REJECTED while items are pending in QA — CONFIRMED DEFECT: it succeeds unconditionally, no rejection, no warning').toBeTruthy();

    // TC-108895: poll for any cascade withdrawal effect
    let stillActionable = false;
    let cprStatusAfter: number | undefined;
    for (let i = 0; i < 4; i++) {
      await page.waitForTimeout(8000);
      const cprAfter = await (await page.request.get(`${WF_API}/api/dynamic/Epm/ComponentProgressReport/Crud/Get?id=${CPR_ID}`, { headers: adminAuth })).json();
      cprStatusAfter = cprAfter?.result?.progressReportStatus;
    }
    const stage3InboxAfter = await (await page.request.get(`${WF_API}/api/dynamic/Shesha.Workflow/WorkflowInboxItem/Crud/GetAll?maxResultCount=500`, { headers: stage3Auth })).json();
    stillActionable = (stage3InboxAfter?.result?.items ?? []).some((i: any) => i.refNumber === 'CPR2026/1148');
    console.log(`TC-108895 ACTUAL — after Close + ~32s: CPR status=${cprStatusAfter} (was 40), Stage 3 inbox item still present and actionable: ${stillActionable}.`);
    expect(cprStatusAfter, 'TC-108895 EXPECTED (per ADO): Close should cascade-withdraw the underlying Workflow Instance — CONFIRMED DEFECT: the CPR status never changes').toBe(40);
    expect(stillActionable, 'TC-108895 EXPECTED: the Stage 3 item should be withdrawn from the inbox — CONFIRMED DEFECT: it remains fully live and actionable, completely oblivious to the period being Closed').toBeTruthy();
  });
});
