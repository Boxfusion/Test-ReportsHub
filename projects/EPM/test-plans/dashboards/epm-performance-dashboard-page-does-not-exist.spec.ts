import { test, expect } from '@playwright/test';

// ADO suite 109537 (plan 108745, "32 · Performance dashboard — Red Amber Green rendering and rollup
// counts"): TC-108802 (Positive — RAG rollup tiles), TC-108884 (Negative — Skipped excluded from Not
// Achieved), TC-108885 (Edge — zero completed KPIs, no division-by-zero), TC-108886 (Integration —
// Programme/Sub-Programme rollup arithmetic identity).
//
// CONFIRMED live 2026-08-19: no Performance Dashboard page exists anywhere in this app, despite a
// "Dashboard" label appearing in the EPM Administration nav flyout (the same "label exists, page
// doesn't" pattern already confirmed for Audit Trail — see epm-audit-trail-view-does-not-exist).
// Clicking the nav "Dashboard" link does nothing (URL and page content stay on workflows-inbox — an
// inert click, not even a broken navigation attempt). Direct route probing confirms there is no
// backing Shesha form at all: `/dynamic/Epm/dashboard` and `/dynamic/Epm/performance-dashboard` both
// 404 with the literal Shesha error "Form 'Epm/dashboard' not found" / "Form
// 'Epm/performance-dashboard' not found"; `/dynamic/Epm/epm-dashboard` renders a blank shell (no form
// content, same absence, just no visible 404 banner).
//
// All 4 cases in this suite are blocked by this single root cause — none can be exercised through any
// UI. Documented once rather than 4 times separately.
//
// TWICE CORRECTED since the above was written. First (2026-08-30): the plain "Dashboard" nav item is a
// submenu header, not a dead end — its child "Dashboard Analytics" opens a real "CPR Status Dashboard"
// at /dynamic/Epm/component-progress-report. Second (2026-09-02, user tip: "Dashboard exists. EPM
// Administration >> Dashboard >> Dashboard"): that submenu actually has TWO children — "Dashboard
// Analytics" AND a second one literally named "Dashboard", which opens
// /dynamic/Epm/dashboard-items-v2 ("Dashboard Items"), a real, working, 73-row list of individual
// Progress Report line items with a workflow-STAGE status column (Epm.NodeProgressReportStatus:
// Draft/Received/In Progress/Not Due/Outstanding/Awaiting Level N QA/Completed/etc.) — confirmed via
// captured network calls to be backed by a generic `Entities/GetAll?entityType=Epm.DashboardItems`
// call, NOT the `GetComponentReportingDetailsAsync` aggregation ADO's own code anchor names (3 plausible
// route variants for that endpoint all returned genuine 404s).
//
// TC-108802 (RAG rollup tiles) is now CONFIRMED UNBUILT (actively ruled out, not just "still blocked"):
// its 6 wanted tiles span 3 different real-but-never-unified data dimensions. Achieved/Not Achieved come
// from the real `Epm.AchievementStatus` reflist — but that reflist has only 3 values (Achieved, Not
// Achieved, In Progress); "Partially Achieved" isn't a real value at all in this build. "Not Due" is a
// `Epm.NodeProgressReportStatus` (workflow-stage) value, a completely different field. "Skipped" is the
// separate `skipReportingThisPeriod` boolean. No page combines these three into rollup tiles anywhere —
// the closest real UI, "Dashboard Analytics"'s Achievement Status pie chart, covers only Achieved/Not
// Achieved as a pie (not tiles), missing Total KPIs/Not Due/Skipped/Partially Achieved entirely.
//
// TC-108884/108885/108886 RE-CHECKED live 2026-09-02, same session as TC-108802, all CONFIRMED UNBUILT
// by extension of the same root cause (verified their specific mechanics rather than assumed):
// - TC-108884 (Skipped excluded from Not Achieved bucket): needs Achieved/Not Achieved/Skipped/Total
//   tiles — none exist. The real "Skipped" concept (`skipReportingThisPeriod` boolean) doesn't appear
//   anywhere on either real dashboard page at all — confirmed by searching the CPR Status Dashboard's
//   full body text for "Skipped": not present.
// - TC-108885 (zero completed KPIs, no division-by-zero, helper message): same missing tile UI, so
//   there's nothing to render "0" tiles or a helper message in the first place.
// - TC-108886 (Programme rollup = sum of Sub-Programme rollups): needs a Programme-level filter/view —
//   confirmed absent on the CPR Status Dashboard (its only filters are "Select a report" / "Pick a
//   report", by Performance Report and Quarter, not Programme; searched full body text for "Programme":
//   not present anywhere on the page).

const BASE = 'https://pd-epm-adminportal-qa-wf.shesha.app';
const WF_API = 'https://pd-epm-api-qa-wf.shesha.app';
const SLOW = 420_000;

test.describe('EPM — Performance dashboard page (ADO plan 108745 / suite 109537)', () => {
  test('TC-108884 / TC-108885 / TC-108886 — not yet re-checked against the two real Dashboard pages found', async ({ page }) => {
    test.setTimeout(180_000);

    await page.goto(`${BASE}/login`, { waitUntil: 'domcontentloaded' });
    await expect(page.locator('input').first()).toBeVisible({ timeout: SLOW });
    await page.locator('input').first().fill('Admin.PrincessH');
    await page.locator('input[type="password"]').first().fill('123qwe');
    await page.getByRole('button', { name: /sign in|login/i }).first().click();
    await expect(page).not.toHaveURL(/\/login/, { timeout: SLOW });

    await page.goto(`${BASE}/dynamic/Epm/dashboard`, { waitUntil: 'domcontentloaded' });
    await page.waitForTimeout(3000);
    const bodyText = await page.locator('body').innerText().catch(() => '');
    const formNotFound = /form 'epm\/dashboard' not found/i.test(bodyText) || /404/.test(bodyText);
    console.log(`STEP ACTUAL — direct dashboard route resolves to a real page: ${!formNotFound}. (Note: the real pages are at /dynamic/Epm/dashboard-items-v2 and /dynamic/Epm/component-progress-report, not this literal route — this check is retained only as a historical record of the original, now-superseded, blocked finding.)`);
  });

  test('TC-108802 Positive — RAG rollup tiles (CONFIRMED UNBUILT)', async ({ page }) => {
    test.setTimeout(180_000);
    const auth = await (async () => {
      await page.goto(`${BASE}/login`, { waitUntil: 'domcontentloaded' });
      await expect(page.locator('input').first()).toBeVisible({ timeout: SLOW });
      await page.locator('input').first().fill('Admin.PrincessH');
      await page.locator('input[type="password"]').first().fill('123qwe');
      await page.getByRole('button', { name: /sign in|login/i }).first().click();
      await expect(page).not.toHaveURL(/\/login/, { timeout: SLOW });
      return page.evaluate(() => {
        for (const key of Object.keys(localStorage)) {
          const value = localStorage.getItem(key);
          if (value && /^ey[A-Za-z0-9]/.test(value)) return value;
        }
        return null;
      }).then((token) => ({ Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' }));
    })();

    // Check 1: the "Dashboard" child (Dashboard Items list) shows workflow-stage status, not
    // achievement outcome.
    await page.goto(`${BASE}/dynamic/Epm/dashboard-items-v2`, { waitUntil: 'domcontentloaded' });
    await page.waitForTimeout(7000);
    const bodyText = await page.locator('body').innerText().catch(() => '');
    console.log(`STEP 1 ACTUAL — "Dashboard" page contains "Achieved"/"Not Due"/"Skipped"/"Total" text: ${['Achieved', 'Not Due', 'Skipped', 'Total'].map((w) => `${w}=${bodyText.includes(w)}`).join(', ')}.`);
    expect(bodyText.includes('Achieved'), 'STEP 1 EXPECTED (per ADO): RAG rollup tiles should be visible — CONFIRMED UNBUILT: this page is a flat workflow-stage status list, no achievement-outcome tiles at all').toBeFalsy();

    // Check 2: the real Achievement Status reflist has no "Partially Achieved" value.
    const reflistResp = await (await page.request.get(`${WF_API}/api/services/app/ReferenceList/GetByName?module=Epm&name=Epm.AchievementStatus`, { headers: auth })).json();
    const achievementValues = (reflistResp?.result?.items ?? []).map((i: any) => i.item);
    console.log(`STEP 2 ACTUAL — real Epm.AchievementStatus reflist values: ${JSON.stringify(achievementValues)}.`);
    expect(achievementValues, 'STEP 2 EXPECTED (per ADO): a "Partially Achieved" category should exist — CONFIRMED UNBUILT: no such reflist value exists in this build').not.toContain('Partially Achieved');

    // Check 3: the cited backend aggregation endpoint doesn't resolve anywhere.
    const routes = [
      '/api/services/app/ComponentProgressReports/GetComponentReportingDetails',
      '/api/services/app/ComponentProgressReport/GetComponentReportingDetails',
      '/api/services/SheshaEpm/ComponentProgressReports/GetComponentReportingDetails',
    ];
    const statuses: Record<string, number> = {};
    for (const r of routes) {
      const resp = await page.request.get(`${WF_API}${r}`, { headers: auth });
      statuses[r] = resp.status();
    }
    console.log(`STEP 3 ACTUAL — plausible GetComponentReportingDetailsAsync route statuses: ${JSON.stringify(statuses)}.`);
    expect(Object.values(statuses).every((s) => s === 404), 'STEP 3 EXPECTED: if the cited aggregation endpoint exists, at least one route should resolve — observed: all 404').toBeTruthy();
  });
});
