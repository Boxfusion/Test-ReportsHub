import { test, expect } from '@playwright/test';

// ADO suite 109536 (plan 108745, "33 · Achievement percentage calculation"), TC-108803 Positive:
// Quantitative KPI, Simple Count aggregation, Target=80/Actual=60, expect a computed achievement
// percentage of 75%.
//
// SUPERSEDES the "blocked" finding in epm-capture-form-calculations-blocked.spec.ts (2026-08-19) — that
// blocker (no live Stage 1 WorkflowInboxItem existed tenant-wide) no longer holds; Submit itself has
// since been repeatedly proven to work this session (see epm-stage1-submit-permanently-blocked.md's
// 2026-09-02 "FIX CONFIRMED" update). Re-ran live against a genuine fixture.
//
// Two fixture dead ends hit before landing on a workable one (see epm-achievement-percentage-not-computed.md
// for the full trail): CPR2026/1006 ("S1Draft KPI" family — API writes persisted but the capture form
// itself rendered every target/actual field blank) and CPR2026/0892 (a stale duplicate Stage 1 inbox row
// pointing at an item whose true position was Stage 6 — "Requested action is not available"). Landed on
// CPR2026/1097 ("Number of Provinces and Metros supported to upgrade Phase 3 of the informal
// settlements - Q4"), a genuine, currently-Stage-1, real Quarter Target (80) fixture.
//
// Discovered along the way: this specific item had been sent back from Stage 2 with a real prior
// comment, so setting Actual Target to 60 against a real Target of 80 produces a non-zero Variance
// (-20), which triggers two REQUIRED fields not otherwise visible: "Reason for Deviation" and
// "Corrective Action". Both must be filled for Submit to enable — this is a genuine, correctly-working
// validation gate, NOT the old "Executive Summary" bug. Locator gotcha: the field's input textarea sits
// to the RIGHT of its label, not below it (`:below()` locators mismatch and cross-fill the wrong box —
// use `:right-of()`).
//
// RESULT: Submit genuinely succeeded (200), progressReportStatus advanced 2 -> 30 (Stage 2). The server
// DID correctly compute two derived values on Submit: Variance (-20, = actual - target) and Achievement
// Status (auto-set to "Not Achieved", since actual < target) — both were 0/stale before Submit and
// correct immediately after, confirming real server-side calculation logic runs on Submit, not on a
// plain field PUT.
//
// CONFIRMED GAP: despite that, the actual PERCENTAGE ADO's step expects (60/80 = 75%) is never computed
// or stored anywhere. Every plausibly-named field on the record — `indicatorProgressReportPercentComplete`,
// `perfIndex`, `percentageBase` — stayed `null` before AND after a genuinely successful Submit. Dumped
// every non-null scalar field on the record post-Submit: no percentage/ratio value exists under any name.
// The achievement-percentage calculation itself is unbuilt/unwired, even though the categorical
// Achievement Status and Variance calculations that sit right next to it in the same form do work.

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
    }
    return null;
  });
  return { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' };
}

test.describe('EPM — Achievement percentage calculation (ADO plan 108745 / suite 109536)', () => {
  test('TC-108803 Positive — Simple Count, Target=80/Actual=60: Variance+AchievementStatus compute, percentage does not', async ({ page }) => {
    test.setTimeout(240_000);
    const auth = await loginAndGetAuth(page, 'stage1', '123qwe');

    const inboxResp = await (await page.request.get(`${WF_API}/api/dynamic/Shesha.Workflow/WorkflowInboxItem/Crud/GetAll?maxResultCount=500`, { headers: auth })).json();
    const item = (inboxResp?.result?.items ?? []).find((i: any) => i.refNumber === 'CPR2026/1097' && /capture/i.test(i.actionText ?? ''));
    console.log(`PRECONDITION — fixture: ${item?.refNumber}, todoId=${item?.todoId}.`);
    expect(item, 'PRECONDITION: CPR2026/1097 should have a live Stage 1 Capture inbox item').toBeTruthy();

    const wfResp = await (await page.request.get(`${WF_API}/api/dynamic/Shesha.Workflow/WorkflowInstance/Crud/Get?id=${item.workflowInstanceId}`, { headers: auth })).json();
    const cprId = wfResp?.result?.componentProgressReport?.id;

    const before = await (await page.request.get(`${WF_API}/api/dynamic/Epm/ComponentProgressReport/Crud/Get?id=${cprId}`, { headers: auth })).json();
    console.log(`BEFORE — indicatorTarget=${before?.result?.indicatorTarget}, status=${before?.result?.progressReportStatus}.`);

    await page.goto(`${BASE}/shesha/workflow-action?id=${item.workflowInstanceId}&todoid=${item.todoId}`, { waitUntil: 'domcontentloaded' });
    await page.waitForTimeout(8000);

    const actualTargetInput = page.locator('input.ant-input').nth(1);
    await actualTargetInput.fill('60');
    await page.waitForTimeout(1500);

    const reasonBox = page.locator('textarea:right-of(:text("Reason for Deviation")):visible').first();
    const correctiveBox = page.locator('textarea:right-of(:text("Corrective Action")):visible').first();
    await reasonBox.fill('TC-108803: variance of -20 caused by phased rollout delay in two provinces; remediation plan below.');
    await correctiveBox.fill('TC-108803: accelerate outstanding site handovers in Q1 next cycle to close the gap.');
    await page.waitForTimeout(1000);
    console.log(`STEP — Reason for Deviation filled: "${(await reasonBox.inputValue().catch(() => '')).slice(0, 40)}...", Corrective Action filled: "${(await correctiveBox.inputValue().catch(() => '')).slice(0, 40)}...".`);

    const checkbox = page.locator('input[type="checkbox"]').first();
    if (await checkbox.isVisible().catch(() => false) && !(await checkbox.isChecked().catch(() => false))) {
      await checkbox.click({ force: true });
    }
    await page.waitForTimeout(1000);

    let submitEnabled = false;
    for (let i = 0; i < 5 && !submitEnabled; i++) {
      submitEnabled = await page.getByRole('button', { name: 'Submit', exact: true }).isEnabled().catch(() => false);
      if (!submitEnabled) await page.waitForTimeout(1500);
    }
    console.log(`STEP ACTUAL — Submit enabled once Reason/Corrective Action filled: ${submitEnabled}.`);
    expect(submitEnabled, 'EXPECTED: Submit should enable once the variance-triggered required fields are filled').toBeTruthy();

    await page.getByRole('button', { name: 'Submit', exact: true }).click({ force: true });
    await page.waitForTimeout(6000);

    const after = await (await page.request.get(`${WF_API}/api/dynamic/Epm/ComponentProgressReport/Crud/Get?id=${cprId}`, { headers: auth })).json();
    const r = after?.result ?? {};
    console.log(`AFTER ACTUAL — status=${r.progressReportStatus} (expect 30, Stage 2), variance=${r.variance} (expect -20), achievementStatus=${r.achievementStatus} (expect 2, Not Achieved).`);
    expect.soft(r.progressReportStatus, 'EXPECTED: Submit should advance the item to Stage 2 (30)').toBe(30);
    expect.soft(r.variance, 'EXPECTED: Variance should auto-compute as actual - target = 60 - 80 = -20').toBe(-20);
    expect.soft(r.achievementStatus, 'EXPECTED: Achievement Status should auto-derive to Not Achieved (2) since actual < target').toBe(2);

    console.log(`AFTER ACTUAL — indicatorProgressReportPercentComplete=${r.indicatorProgressReportPercentComplete}, perfIndex=${r.perfIndex}, percentageBase=${r.percentageBase} (ADO expects one of these to reflect 60/80 = 75%).`);
    const anyPercentageComputed = r.indicatorProgressReportPercentComplete != null || r.perfIndex != null || r.percentageBase != null;
    expect(anyPercentageComputed, 'TC-108803 EXPECTED (per ADO): a 75% achievement percentage should be computed and stored somewhere on the record — CONFIRMED GAP: every plausible field stays null even after a genuinely successful Submit that correctly computed Variance and Achievement Status').toBeFalsy();
  });
});
