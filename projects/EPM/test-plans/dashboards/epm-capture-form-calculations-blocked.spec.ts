import { test, expect } from '@playwright/test';

// Suites 109535 ("34 · Qualitative KPI narrative", TC-108804/108890/108891/108892) and 109536
// ("33 · Achievement percentage calculation", TC-108803/108887/108888/108889), both plan 108745. Both
// suites require actually typing into the live capture form (Achievements narrative field; Quarter
// Target / Actual Target fields) and clicking Submit to trigger the real calculation/validation logic
// (ComponentsCalculationsHelper.CalculateFreshValuesAsync per TC-108803's own step text).
//
// CONFIRMED live 2026-08-19: the capture form (`Epm/kpireporting-wf-captureprogressreport`) IS
// reachable directly via URL with just `?id=<CPR id>` even outside any workflow-inbox context — but
// when accessed this way (no live `todoid` / active workflow-action context), every field renders
// fully disabled (checked: all 5 real <input> elements — 3 status radios, file upload, a checkbox —
// come back `disabled=true`; the Quarter Target / Actual Target / Variance number fields render as
// plain read-only text, not editable inputs at all). This is a genuine read-only rendering, not a
// script targeting issue — same "workflow-context-dependent editability" pattern already seen on
// sent-items-details elsewhere this session.
//
// A genuinely editable session requires a live Stage 1 `WorkflowInboxItem` with a real `todoid` —
// which remains blocked by the already-established root cause (see epm-workflow-inbox-item-locked-down
// / epm-open-progress-report-inert): the tenant-wide inbox has items now, but none at Stage 1 (see
// epm-audit-trail-suite-109532-remainder). Direct raw-API PUTs to ComponentProgressReport (tried on
// indicatorTarget/indicatorActual=4/3, then restored to the real 80/80) do NOT trigger the calculation
// either — indicatorProgressReportPercentComplete stayed null — confirming the calculation genuinely
// only runs inside the real Submit workflow action, not on a plain field update.
//
// All 8 cases across both suites are blocked by this one root cause. Documented once.
//
// SUPERSEDED 2026-09-02 for TC-108803 specifically: the root cause (no live Stage 1 item existed
// tenant-wide) no longer holds — Submit's flakiness was fixed (see
// epm-stage1-submit-permanently-blocked.md) and a genuine live Stage 1 item was driven through Submit
// successfully. See epm-achievement-percentage-not-computed.spec.ts for the live re-test (result:
// Variance/Achievement Status compute correctly on Submit, but the achievement PERCENTAGE itself is a
// separate, still-CONFIRMED GAP — never computed or stored anywhere). The remaining suite 109536 cases
// (TC-108887/888/889) and all of 109535 (TC-108804/890/891/892) have not yet been individually
// re-checked against the fix — don't assume this file's "blocked" verdict still holds for them without
// re-testing each on its own merits.

const BASE = 'https://pd-epm-adminportal-qa-wf.shesha.app';
const WF_API = 'https://pd-epm-api-qa-wf.shesha.app';
const CPR_ID = 'f9a15981-10a4-4bf6-89a1-83a239a2c498';

const SLOW = 420_000;

test.describe('EPM — capture form calculations blocked (ADO plan 108745 / suites 109535 & 109536)', () => {
  test('TC-108803/887/888/889 and TC-108804/890/891/892 — all blocked: no live editable Stage 1 session exists', async ({ page }) => {
    test.setTimeout(180_000);

    await page.goto(`${BASE}/login`, { waitUntil: 'domcontentloaded' });
    await expect(page.locator('input').first()).toBeVisible({ timeout: SLOW });
    await page.locator('input').first().fill('admin.PrincessH');
    await page.locator('input[type="password"]').first().fill('123qwe');
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
    const auth = { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' };

    // re-confirm no live Stage 1 pending item exists tenant-wide (same check as
    // epm-audit-trail-suite-109532-remainder, re-run fresh)
    const inboxResp = await (await page.request.get(`${WF_API}/api/dynamic/Shesha.Workflow/WorkflowInboxItem/Crud/GetAll?maxResultCount=50`, { headers: auth })).json();
    const items = inboxResp?.result?.items ?? [];
    const stage1Items = items.filter((i: any) => /capture|submit/i.test(i.actionText ?? ''));
    console.log(`PRECONDITION ACTUAL — tenant-wide inbox: ${items.length} items, ${stage1Items.length} at Stage 1 Capture/Submit.`);
    expect.soft(stage1Items.length, 'EXPECTED: a live Stage 1 item should exist to type into the real editable capture form and Submit — BLOCKED: none exists; the same root cause blocks all 8 cases across both suites').toBeGreaterThan(0);

    // confirm direct id-only access renders the form read-only (no live todoid context)
    await page.goto(`${BASE}/dynamic/Epm/kpireporting-wf-captureprogressreport?id=${CPR_ID}`, { waitUntil: 'domcontentloaded' });
    await page.waitForTimeout(6000);
    const allInputs = page.locator('input');
    const inputCount = await allInputs.count();
    let anyEnabled = false;
    for (let i = 0; i < inputCount; i++) {
      if (!(await allInputs.nth(i).isDisabled().catch(() => true))) { anyEnabled = true; break; }
    }
    console.log(`STEP ACTUAL — capture form has any enabled input without a live todoid context: ${anyEnabled} (${inputCount} inputs total, all checked).`);
    expect.soft(anyEnabled, 'EXPECTED: capture form fields should be editable without needing a workflow todoid — CONFIRMED: direct id-only access is read-only, editability depends on a live workflow-action context that does not currently exist').toBeTruthy();
  });
});
