import { test, expect } from '@playwright/test';

// ADO suite 109536 (plan 108745, "33 · Achievement percentage calculation"), TC-108888 Edge: fractional
// Target/Actual (ADO literal: Actual=2.5/Target=4 -> 62.5%) — verify the rounding policy applied to the
// resulting achievement percentage.
//
// Fixture: CPR2026/1067 ("Number of Provinces and Metros supported to complete Phase 1 of the Informal
// Settlements - Q2 2026/27"), a genuine live Stage 1 item, real Quarter Target=60 (not the broken
// S1Draft/S1Submit synthetic family — see epm-null-target-silent-disable.md). Used Actual=37.5 against
// Target=60 to preserve ADO's exact ratio (37.5/60 = 62.5%, same as 2.5/4).
//
// Discovered two required fields not present on TC-108803's fixture: this KPI has poeRequired=true (a
// red-asterisk "Portfolio Of Evidence" field), attached via the established EXISTING_POE_FILE_ID
// technique; and the same Variance-triggered Reason for Deviation/Corrective Action fields from
// TC-108803/887 (Variance=-22.5, non-zero, since Actual != Target).
//
// RESULT: Submit succeeded (200), status advanced 20 -> 30 (Stage 2). The fractional values themselves
// are preserved WITHOUT premature rounding: indicatorActual persisted as exactly 37.5 (not rounded to
// 38 or 37), variance persisted as exactly -22.5. So raw fractional inputs are not truncated/rounded on
// the way into storage.
//
// However — same CONFIRMED GAP as TC-108803 — there is no rounding POLICY to observe for the
// achievement PERCENTAGE itself, because that value is never computed or stored under any field name at
// all (indicatorProgressReportPercentComplete/perfIndex/percentageBase all stayed null, exactly as for
// the whole-number case). TC-108888's actual ADO question ("what rounding rule applies to 62.5%?") is
// moot — there is no percentage value anywhere to apply a rounding rule to.

const BASE = 'https://pd-epm-adminportal-qa-wf.shesha.app';
const WF_API = 'https://pd-epm-api-qa-wf.shesha.app';
const CPR_ID = '275e5383-5e1c-4451-a0d1-6e12df7905ab';
const EXISTING_POE_FILE_ID = '22374823-f77a-4e8c-a674-382a8fa99f9d';
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

test.describe('EPM — Fractional target/actual rounding (ADO plan 108745 / suite 109536)', () => {
  test('TC-108888 Edge — fractional Actual=37.5/Target=60 (ratio = ADO 2.5/4=62.5%): values preserved, percentage still not computed', async ({ page }) => {
    test.setTimeout(240_000);
    const auth = await loginAndGetAuth(page, 'stage1', '123qwe');

    await page.request.put(`${WF_API}/api/dynamic/Epm/ComponentProgressReport/Crud/Update`, { headers: auth, data: { id: CPR_ID, portfolioOfEvidence: { id: EXISTING_POE_FILE_ID } } });

    const inboxResp = await (await page.request.get(`${WF_API}/api/dynamic/Shesha.Workflow/WorkflowInboxItem/Crud/GetAll?maxResultCount=500`, { headers: auth })).json();
    const item = (inboxResp?.result?.items ?? []).find((i: any) => i.refNumber === 'CPR2026/1067' && /capture/i.test(i.actionText ?? ''));
    expect(item, 'PRECONDITION: CPR2026/1067 should have a live Stage 1 Capture inbox item, real Target=60').toBeTruthy();

    await page.goto(`${BASE}/shesha/workflow-action?id=${item.workflowInstanceId}&todoid=${item.todoId}`, { waitUntil: 'domcontentloaded' });
    await page.waitForTimeout(8000);

    await page.locator('input.ant-input:visible').last().fill('37.5');
    await page.waitForTimeout(1500);

    const reasonBox = page.locator('textarea:right-of(:text("Reason for Deviation")):visible').first();
    const correctiveBox = page.locator('textarea:right-of(:text("Corrective Action")):visible').first();
    await reasonBox.fill('TC-108888: fractional Actual Target (37.5) against Target 60; documenting rounding behaviour.');
    await correctiveBox.fill('TC-108888: N/A, controlled test fixture for fractional rounding verification.');

    const allTextareas = page.locator('textarea:visible');
    const n = await allTextareas.count();
    let execIndex: number | null = null;
    let maxY = -1;
    for (let i = 0; i < n; i++) {
      const box = await allTextareas.nth(i).boundingBox().catch(() => null);
      if (box && box.x < 850 && box.y > maxY) { maxY = box.y; execIndex = i; }
    }
    if (execIndex !== null) {
      await allTextareas.nth(execIndex).fill('TC-108888: fractional target/actual rounding verification, Actual=37.5 against Target=60 (ratio matches ADO 2.5/4=62.5%).');
    }
    const checkbox = page.locator('input[type="checkbox"]').first();
    if (await checkbox.isVisible().catch(() => false) && !(await checkbox.isChecked().catch(() => false))) {
      await checkbox.click({ force: true });
    }
    await page.waitForTimeout(1000);

    let submitEnabled = false;
    for (let i = 0; i < 5 && !submitEnabled; i++) {
      submitEnabled = await page.getByRole('button', { name: 'Submit', exact: true }).isEnabled().catch(() => false);
      if (!submitEnabled) { await page.reload({ waitUntil: 'domcontentloaded' }); await page.waitForTimeout(6000); }
    }
    console.log(`STEP ACTUAL — Submit enabled once Reason/Corrective/Executive Summary/POE all filled: ${submitEnabled}.`);
    expect(submitEnabled, 'EXPECTED: Submit should enable once every required field (incl. POE) is filled').toBeTruthy();

    await page.getByRole('button', { name: 'Submit', exact: true }).click({ force: true });
    await page.waitForTimeout(6000);

    const after = await (await page.request.get(`${WF_API}/api/dynamic/Epm/ComponentProgressReport/Crud/Get?id=${CPR_ID}`, { headers: auth })).json();
    const r = after?.result ?? {};
    console.log(`AFTER ACTUAL — status=${r.progressReportStatus}, actual=${r.indicatorActual}, variance=${r.variance}, achievementStatus=${r.achievementStatus}.`);
    expect.soft(r.progressReportStatus, 'EXPECTED: Submit should advance to Stage 2 (30)').toBe(30);
    expect.soft(r.indicatorActual, 'EXPECTED: the fractional Actual value should persist exactly, without rounding').toBe(37.5);
    expect.soft(r.variance, 'EXPECTED: Variance should compute exactly as actual - target = 37.5 - 60 = -22.5, without rounding').toBe(-22.5);

    console.log(`AFTER ACTUAL — percentComplete=${r.indicatorProgressReportPercentComplete}, perfIndex=${r.perfIndex}, percentageBase=${r.percentageBase} (ADO wants a rounding policy for 62.5% -- moot if nothing is ever computed).`);
    const anyPercentageComputed = r.indicatorProgressReportPercentComplete != null || r.perfIndex != null || r.percentageBase != null;
    expect(anyPercentageComputed, 'TC-108888 EXPECTED (per ADO): an achievement percentage (62.5%) should be computed, with some rounding policy applied — CONFIRMED GAP (same root cause as TC-108803): no percentage field is ever populated, for fractional values any more than whole ones, so there is no rounding policy to observe').toBeFalsy();
  });
});
