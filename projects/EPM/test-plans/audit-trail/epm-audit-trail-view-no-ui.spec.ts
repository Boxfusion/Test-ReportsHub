import { test, expect } from '@playwright/test';

// ADO TC-108799 (plan 108745, suite 29 · EPM · Audit trail view — sequence, actor, timestamp, before
// and after values. Anchor: vw_Epm_AuditTrail bound to Shesha dynamic form). Positive: precondition —
// a Quarter 1 KPI has at least 3 audit rows. Navigate to the Audit Trail view for the
// ComponentProgressReport — expect a table with Action/Actor/Timestamp/Before Value/After Value
// columns, chronologically sorted; timestamps show local time with a UTC tooltip; filter by action
// type "OverallSubmit" returns exactly one row.
//
// Confirmed live 2026-08-19: no dedicated "Audit Trail view" UI page exists anywhere in this app.
// Checked the full EPM Administration nav list (Workflow Definitions, Component Types, Component
// Definitions, Performance Report Templates, Manage Performance Reports, Outputs & Outcomes, Unit of
// Measures, Period, Dashboard) — no "Audit Trail" entry. The closest real UI is the workflow-action
// page's "History" tab, which shows a per-quarter comparison table (Period Name, UOM, Period Target,
// Indicator Target, Variance, Achievement Status, Audit Status) — a different shape entirely, with no
// Actor/Timestamp/Before/After columns and no per-action row granularity. A separate comment/reply
// thread above the form shows actor + timestamp + free-text comment per stage transition, but again
// not the described table.
// The underlying data is real and queryable (`EpmAuditedEntityEvent`, 538+ rows tenant-wide,
// confirmed throughout this session), and a genuinely non-deleted ComponentProgressReport with 5 real
// audit rows exists (id f9a15981-..., KPI "Number of quarterly assessments conducted on performance
// of Provinces human settlements grant (ISUPG)", Q1) — so the precondition itself is satisfiable, it's
// the UI to view it that doesn't exist.
// Also confirmed: the literal action-type value "OverallSubmit" never appears anywhere in this
// tenant's audit history — the real equivalent action string is "Item was Submitted by actioner".
//
// RE-CONFIRMED live 2026-09-02, after the user's tip led to finding a real "Administration > Audit
// Logs" submenu (Logon/One Time Pins/Notifications — see epm-audit-trail-view-does-not-exist.md's major
// correction, and TC-108876/108877 which now PASS against its "Logon" child). That discovery does NOT
// overturn this case: those 3 pages are Shesha framework-level security/notification logs, not the
// Action/Actor/Timestamp/Before/After table for arbitrary ComponentProgressReport business actions
// (Submit/Approve/Finalise/etc.) that TC-108799 describes, and none of them is filterable by an
// "OverallSubmit" action type. Re-checked thoroughly this pass: hovered "EPM Administration" with a
// steady cursor and confirmed its full child list is unchanged (Workflow Definitions, Component Types,
// Component Definitions, Performance Report Templates, Manage Performance Reports, Outputs & Outcomes,
// Unit of Measures, Period, Dashboard — no Audit Trail entry); also directly probed 8 plausible
// Epm-namespaced route names (`/dynamic/Epm/audit-trail`, `/dynamic/Epm/audittrail`,
// `/dynamic/Epm/component-progress-report-audit-trail`, etc.) — all genuine `404`s. The dedicated
// `vw_Epm_AuditTrail`-backed view this case's own code anchor names still does not exist anywhere.
// CONFIRMED GAP STANDS, now with stronger evidence (route probing, not just nav-menu inspection).

const BASE = 'https://pd-epm-adminportal-qa-wf.shesha.app';
const WF_API = 'https://pd-epm-api-qa-wf.shesha.app';
const CPR_WITH_REAL_HISTORY_ID = 'f9a15981-10a4-4bf6-89a1-83a239a2c498';

const SLOW = 420_000;
const RAW_CHANNEL = process.env.PW_CHANNEL === undefined ? 'chrome' : process.env.PW_CHANNEL;
const CHANNEL = RAW_CHANNEL === '' || RAW_CHANNEL === 'chromium' ? undefined : RAW_CHANNEL;

test.use({
  channel: CHANNEL,
  actionTimeout: 30_000,
  navigationTimeout: 120_000,
});

test.describe('EPM — Audit trail view (ADO plan 108745 / suite 29)', () => {
  test('TC-108799 Positive — Audit Trail view should render chronological actions with actor/timestamp/before/after', async ({ page }) => {
    test.setTimeout(300_000);

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

    // PRECONDITION (ADO): confirm a real, non-deleted Q1 KPI ComponentProgressReport has >=3 audit rows.
    const cprResp = await (await page.request.get(`${WF_API}/api/dynamic/Epm/ComponentProgressReport/Crud/Get?id=${CPR_WITH_REAL_HISTORY_ID}`, { headers: auth })).json();
    console.log(`PRECONDITION ACTUAL — CPR isDeleted=${cprResp?.result?.isDeleted}, component=${cprResp?.result?.component?._displayName}.`);
    expect(cprResp?.result?.isDeleted, 'PRECONDITION EXPECTED: a real, non-deleted CPR should be used').toBeFalsy();

    const aeResp = await (await page.request.get(`${WF_API}/api/dynamic/Epm/EpmAuditedEntityEvent/Crud/GetAll?maxResultCount=2000`, { headers: auth })).json();
    const rows = (aeResp?.result?.items ?? []).filter((r: any) => r?.entity?.id === CPR_WITH_REAL_HISTORY_ID);
    console.log(`PRECONDITION ACTUAL — audit rows for this CPR: ${rows.length}.`);
    expect(rows.length, 'PRECONDITION EXPECTED: at least 3 audit rows should exist').toBeGreaterThanOrEqual(3);

    // STEP 1 (ADO): Navigate to the Audit Trail view for the ComponentProgressReport.
    // CONFIRMED DEFECT: no dedicated Audit Trail UI page exists anywhere in the app.
    await page.goto(`${BASE}/`, { waitUntil: 'domcontentloaded' });
    await page.waitForTimeout(2000);
    const epmItem = page.locator('.ant-menu').getByText('EPM', { exact: true }).locator('visible=true').first();
    await epmItem.click({ force: true });
    await page.waitForTimeout(2500);
    const epmAdmin = page.getByText('EPM Administration', { exact: true }).locator('visible=true').first();
    await epmAdmin.hover({ force: true });
    await page.waitForTimeout(2500);
    const navText = await page.locator('body').innerText().catch(() => '');
    const hasAuditTrailNavItem = /audit trail/i.test(navText);
    console.log(`STEP 1 ACTUAL — "Audit Trail" nav item present anywhere in EPM Administration: ${hasAuditTrailNavItem}.`);
    expect.soft(hasAuditTrailNavItem, 'STEP 1 EXPECTED (per ADO): a dedicated Audit Trail view should be reachable — CONFIRMED DEFECT: no such nav item or page exists anywhere; the closest real UI (workflow-action "History" tab) shows a different per-quarter comparison table, not an Action/Actor/Timestamp/Before/After row log').toBeTruthy();

    // STEP 2 (ADO): timestamps should show local time with a UTC tooltip; no null timestamps.
    // Verified at the data layer instead, since no UI page exists to check this against.
    const nullTimestamps = rows.filter((r: any) => !r.creationTime);
    console.log(`STEP 2 ACTUAL — audit rows with a null creationTime: ${nullTimestamps.length} of ${rows.length}.`);
    expect(nullTimestamps.length, 'STEP 2 EXPECTED: no audit row should have a null timestamp at the data layer').toBe(0);

    // STEP 3 (ADO): filter by action type "OverallSubmit", expect exactly one row.
    const overallSubmitRows = rows.filter((r: any) => /overallsubmit/i.test(r.action ?? ''));
    console.log(`STEP 3 ACTUAL — rows matching the literal action "OverallSubmit": ${overallSubmitRows.length}. Real actions present: ${JSON.stringify(rows.map((r: any) => r.action))}`);
    expect.soft(overallSubmitRows.length, 'STEP 3 EXPECTED (per ADO): exactly one "OverallSubmit" row should exist — CONFIRMED NAMING MISMATCH if 0: this literal action string never appears anywhere in the tenant\'s audit history; the real equivalent is "Item was Submitted by actioner"').toBe(1);
  });
});
