import { test, expect } from '@playwright/test';

// Derived artefact — the canonical source is epm-performance-report-cascading-delete.md, which mirrors
// ADO test case 108819 in suite 109507 ("08 · EPM · Performance Report creation — planning shell"),
// plan 108745. Edit the .md (and the ADO case), not this file, except for AI-repair patches.

const BASE = 'https://pd-epm-adminportal-qa-wf.shesha.app';
const QA_API = 'https://pd-epm-api-qa-wf.shesha.app'; // -wf: matches where the UI actually writes — see epm-unit-of-measure-getall-host-mismatch memory
const WF_API = 'https://pd-epm-api-qa-wf.shesha.app';
const PERIOD_CRUD = `${WF_API}/api/dynamic/Shesha.Enterprise/Period/Crud`;

const TOKEN = process.env.TC108819_TOKEN || `TC108819-${Date.now()}`;
const SHORT = TOKEN.replace(/\D/g, '').slice(-6);
const REPORT_NAME = `Cascade Delete Test ${SHORT}`;
const REPORT_SHORT_NAME = `CD${SHORT}`;
// Confirmed live 2026-08-17 (see epm-performance-report-create-period-cycle-mismatch memory); id
// reconfirmed still current 2026-08-28.
const TEMPLATE_ID = '77a75071-5385-4ae7-bb5e-42cc4619ee87'; // "Standard Annual Performance Plan"
// The old hardcoded "Financial Year 2026/27" period (id 8062531f-2326-4fc7-8ea3-582d11bcdcb1) was found
// soft-deleted (isDeleted:true, deleted 2026-08-26) — see epm-performance-report-period-covered-stale
// memory. Built fresh per run instead (see setup, right after login).
// Real Component Type ids reconfirmed live 2026-08-28 (the old ones — 05a72647-.../3fc0e190-... — no
// longer exist at all, see epm-emmanuel-tree-hard-deleted memory):
const DEPARTMENT_TYPE_ID = 'f1ec68a8-ea98-41eb-9080-ea969ed89fd0';
const QKPI_TYPE_ID = '60e8340a-bdb7-4ac8-8b24-f90d2b5951bb';

const SLOW = 420_000;
const RAW_CHANNEL = process.env.PW_CHANNEL === undefined ? 'chrome' : process.env.PW_CHANNEL;
const CHANNEL = RAW_CHANNEL === '' || RAW_CHANNEL === 'chromium' ? undefined : RAW_CHANNEL;

test.use({
  channel: CHANNEL,
  viewport: { width: 1920, height: 1080 },
  actionTimeout: 30_000,
  navigationTimeout: 120_000,
});

test.describe('EPM — Performance Report creation (ADO plan 108745 / suite 109507)', () => {
  test('TC-108819 Integration — Cascading delete of Performance Report removes all child Components and Progress Reports', async ({ page }) => {
    test.setTimeout(1_200_000);
    console.log(`RUN TOKEN — ${TOKEN}`);

    // PRECONDITION: Signed in as administrator.
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
    expect(token, 'bearer token recoverable from localStorage').toBeTruthy();
    const auth = { Authorization: `Bearer ${token}` };

    // Setup (not the graded claim): build a fresh, disposable Financial Year period with one Quarter
    // child, since the real "Financial Year 2026/27" period this test used to rely on is now soft-deleted.
    const fyResp = await page.request.post(`${PERIOD_CRUD}/Create`, {
      headers: auth,
      data: { name: `TC108819 FY ${SHORT}`, shortName: `FY${SHORT}`, periodStart: '2026-04-01T00:00:00', periodEnd: '2027-03-31T00:00:00', periodType: 1 },
    });
    expect(fyResp.status(), 'setup: creating the disposable Financial Year period should succeed').toBeLessThan(400);
    const fyPeriod = (await fyResp.json())?.result;
    console.log(`Setup — created disposable Financial Year period "${fyPeriod.name}" (id ${fyPeriod.id})`);
    // Create all 4 Quarters — the report's auto-generated Progress Reports mirror the Period Covered's
    // own child periods one-for-one, so a single Quarter child would only ever produce 1, not 4.
    const quarterRanges: [string, string][] = [
      ['2026-04-01T00:00:00', '2026-06-30T00:00:00'],
      ['2026-07-01T00:00:00', '2026-09-30T00:00:00'],
      ['2026-10-01T00:00:00', '2026-12-31T00:00:00'],
      ['2027-01-01T00:00:00', '2027-03-31T00:00:00'],
    ];
    const qPeriods: any[] = [];
    for (let i = 0; i < quarterRanges.length; i++) {
      const [periodStart, periodEnd] = quarterRanges[i];
      const resp = await page.request.post(`${PERIOD_CRUD}/Create`, {
        headers: auth,
        data: { name: `TC108819 FY ${SHORT} Q${i + 1}`, shortName: `Q${i + 1}${SHORT}`, periodStart, periodEnd, periodType: 4, parentPeriod: { id: fyPeriod.id } },
      });
      expect(resp.status(), `setup: creating disposable Quarter ${i + 1} should succeed`).toBeLessThan(400);
      qPeriods.push((await resp.json())?.result);
    }
    console.log(`Setup — created ${qPeriods.length} disposable Quarter child periods.`);
    const PERIOD_ID = fyPeriod.id;

    // PRECONDITION SETUP: create a disposable Performance Report via the custom AppService (confirmed
    // route this session — see epm-performance-report-create-period-cycle-mismatch memory). Creating a
    // report with this Quarter-cycle template auto-generates exactly 4 "Reporting Periods" rows
    // (Q1–Q4), which is the real entity ADO calls "Progress Reports" (`Epm/ProgressReport`) — confirmed
    // live, no manual seeding needed for that part.
    const createResp = await page.request.post(`${WF_API}/api/v1/Epm/PerformanceReports/CreatePerformanceReport`, {
      headers: auth,
      data: { name: REPORT_NAME, shortName: REPORT_SHORT_NAME, templateId: TEMPLATE_ID, periodCoveredId: PERIOD_ID },
    });
    expect(createResp.status(), 'precondition setup: the disposable report should be created').toBeLessThan(400);
    const reportId: string | null = (await createResp.json().catch(() => null))?.result?.id ?? null;
    expect(reportId, 'precondition setup: a report id should be returned').toBeTruthy();
    console.log(`PRECONDITION — disposable Performance Report id ${reportId}`);

    const progressBefore = await (await page.request.get(`${WF_API}/api/dynamic/Epm/ProgressReport/Crud/GetAll?maxResultCount=2000`, { headers: auth })).json();
    const progressForReport = (progressBefore?.result?.items ?? progressBefore?.result ?? []).filter((p: any) => p?.performanceReport?.id === reportId);
    expect(progressForReport.length, 'precondition: 4 Progress Reports (Q1..Q4) should auto-generate').toBe(4);
    console.log(`PRECONDITION — ${progressForReport.length} auto-generated Progress Reports confirmed.`);

    // PRECONDITION SETUP: attempt to seed 10 Components (1 Department root + 9 Quantitative KPI
    // children) tied to the new report, matching ADO's "Reporting Tree with 10 Components".
    // CONFIRMED GENUINE DEFECT / BLOCKER (not a script bug, exhaustively verified live 2026-08-17 —
    // 7 exploration rounds across payload shapes: nested `performanceReport: {id}`, flat
    // `performanceReportId`, and both the -qa and -wf API hosts): Component/Crud/Create's own
    // foreign-key existence check can NEVER find a PerformanceReport created via the custom
    // CreatePerformanceReport AppService, even though that exact same id resolves fine via
    // PerformanceReport/Crud/Get (confirmed 200, full record) moments earlier. A componentType-only
    // Component create with no performanceReport link succeeds fine on -qa, isolating the failure
    // specifically to the performanceReport reference — this looks like the custom AppService's
    // PerformanceReport write path populates a data context that Component's generic dynamic-entity FK
    // validator doesn't query. This blocks ADO's "10 Components" precondition from ever being
    // buildable against a newly-created report, independent of anything this script does.
    const componentAttempt = await page.request.post(`${QA_API}/api/dynamic/Epm/Component/Crud/Create`, {
      headers: auth,
      data: { name: `${REPORT_NAME} Root`, componentType: { id: DEPARTMENT_TYPE_ID }, performanceReport: { id: reportId } },
    });
    const componentAttemptBody = await componentAttempt.text().catch((e) => `(could not read body: ${e})`);
    console.log(`PRECONDITION — Component seeding attempt: ${componentAttempt.status()} ${componentAttemptBody.slice(0, 500)}`);
    const componentsSeeded = componentAttempt.status() < 400;
    expect.soft(
      componentsSeeded,
      `PRECONDITION EXPECTED (confirmed defect/blocker): seeding a Component against a freshly-created PerformanceReport should succeed, but Component/Crud/Create's FK check rejects it — ${componentAttemptBody.slice(0, 300)}`,
    ).toBe(true);
    console.log(componentsSeeded
      ? 'PRECONDITION — Component seeding unexpectedly succeeded (defect may be resolved); proceeding with real components.'
      : 'PRECONDITION — Component seeding blocked as previously confirmed; proceeding with 0 Components (documented gap), still exercising the delete/cascade flow on the Progress Reports that DID seed automatically.');

    const componentIds: string[] = [];
    if (componentsSeeded) {
      const rootId = (await componentAttempt.json().catch(() => null))?.result?.id;
      if (rootId) componentIds.push(rootId);
      for (let i = 1; i <= 9; i++) {
        const r = await page.request.post(`${QA_API}/api/dynamic/Epm/Component/Crud/Create`, {
          headers: auth,
          data: { name: `${REPORT_NAME} KPI ${i}`, componentType: { id: QKPI_TYPE_ID }, performanceReport: { id: reportId }, parent: rootId ? { id: rootId } : undefined, refNo: `${SHORT}_${i}`, orderIndex: i },
        });
        const cid = (await r.json().catch(() => null))?.result?.id;
        if (cid) componentIds.push(cid);
      }
      console.log(`PRECONDITION — ${componentIds.length} Components seeded.`);
    }

    try {
      // Navigate EPM > EPM Administration > Manage Performance Reports (see
      // epm-nav-restructured-epm-administration-flyout memory). Known ~1/3 nav flake — a plain re-run
      // is the accepted fix (see epm-performance-report-modal-and-nav-quirks memory).
      const epmItem = page.locator('.ant-menu').getByText('EPM', { exact: true }).locator('visible=true').first();
      await expect(epmItem).toBeVisible({ timeout: SLOW });
      await epmItem.click({ force: true });
      await page.waitForTimeout(2_500);
      const epmAdmin = page.getByText('EPM Administration', { exact: true }).locator('visible=true').first();
      await expect(epmAdmin).toBeVisible({ timeout: 60_000 });
      await epmAdmin.hover({ force: true });
      await page.waitForTimeout(2_500);
      const mprLink = page.getByText('Manage Performance Reports', { exact: true }).locator('visible=true').first();
      await expect(mprLink).toHaveAttribute('href', '/dynamic/Epm/perfomance-report-v2');
      await mprLink.click({ force: true });

      await expect(page).toHaveURL(/\/dynamic\/Epm\/perfomance-report-v2$/, { timeout: SLOW });
      await expect(page.locator('.ant-spin-spinning')).toHaveCount(0, { timeout: SLOW });
      await page.waitForTimeout(1_500);

      // STEP 1: Delete the Performance Report. The list is paginated (confirmed live 2026-08-28: 29
      // items, 10/page, not sorted newest-first) — search for it rather than assuming it's on page 1.
      const searchInput = page.locator('.ant-input-search input, .ant-input-affix-wrapper input').first();
      await searchInput.fill(REPORT_NAME);
      await searchInput.press('Enter');
      await page.waitForTimeout(1_500);
      const row = page.locator('[role="row"]', { hasText: REPORT_NAME }).first();
      await expect(row, 'the disposable report should be visible in the list').toBeVisible({ timeout: SLOW });
      const deleteBtn = row.locator('button[title="delete"], button:has(.anticon-delete)').first();
      await deleteBtn.click({ force: true });
      await page.waitForTimeout(1_500);

      // STEP 1 EXPECTED: a cascade-warning dialog appears listing 10 Components and 4 Progress Reports.
      // CONFIRMED GENUINE DEFECT (not a script bug): the confirmation is a generic antd Popconfirm
      // reading only "Are you sure want to delete this item?" — no counts of any child records are
      // shown, regardless of how many Components/Progress Reports actually exist for the report.
      const confirmDialog = page.locator('.ant-popover-inner, .ant-modal-content').filter({ hasText: /delete|sure/i }).first();
      const confirmText = await confirmDialog.innerText().catch(() => '(no confirmation dialog found)');
      console.log(`STEP 1 ACTUAL — delete confirmation text: ${confirmText}`);
      expect.soft(
        /\b10\b/.test(confirmText) && /\b4\b/.test(confirmText),
        `STEP 1 EXPECTED (confirmed defect): the delete confirmation should cite counts of child Components (10) and Progress Reports (4) — got: "${confirmText}"`,
      ).toBe(true);

      // STEP 2: Confirm the delete.
      const okBtn = page.getByRole('button', { name: /^OK$/ }).first();
      await expect(okBtn, 'STEP 2: the confirmation OK button should be visible').toBeVisible({ timeout: 15_000 });
      const deleteReqPromise = page.waitForResponse((r) => r.request().method() === 'DELETE' && /PerformanceReport/i.test(r.url()), { timeout: 30_000 }).catch(() => null);
      await okBtn.click();
      const deleteResp = await deleteReqPromise;
      expect(deleteResp, 'STEP 2 EXPECTED: the delete request should be sent').toBeTruthy();
      console.log(`STEP 2 — DELETE ${deleteResp!.status()} ${deleteResp!.url()}`);
      expect(deleteResp!.status(), 'STEP 2 EXPECTED: the delete should succeed').toBeLessThan(400);
      await page.waitForTimeout(2_000);

      // STEP 2 EXPECTED: the Performance Report and every child record are removed.
      const reportAfter = await (await page.request.get(`${WF_API}/api/dynamic/Epm/PerformanceReport/Crud/Get?id=${reportId}`, { headers: auth })).json();
      console.log(`STEP 2 ACTUAL — report isDeleted after delete: ${reportAfter?.result?.isDeleted}`);
      expect(reportAfter?.result?.isDeleted, 'STEP 2 EXPECTED: the report itself should be (soft-)deleted').toBe(true);

      // STEP 3: Verify via GetAll on Component and ProgressReport that no records remain for the
      // deleted Performance Report identifier.
      const progressAfter = await (await page.request.get(`${WF_API}/api/dynamic/Epm/ProgressReport/Crud/GetAll?maxResultCount=2000`, { headers: auth })).json();
      const progressAfterForReport = (progressAfter?.result?.items ?? progressAfter?.result ?? []).filter((p: any) => p?.performanceReport?.id === reportId);
      const progressAfterDeletedFlags = progressAfterForReport.map((p: any) => p.isDeleted);
      console.log(`STEP 3 ACTUAL — Progress Reports for this report after delete: ${progressAfterForReport.length}, isDeleted flags: ${JSON.stringify(progressAfterDeletedFlags)}`);
      // CONFIRMED GENUINE DEFECT (not a script bug): deleting the Performance Report does NOT cascade
      // to its auto-generated Progress Reports — all 4 remain with isDeleted:false, fully live and
      // orphaned, confirmed live 2026-08-17 across two independent runs.
      expect.soft(
        progressAfterForReport.every((p: any) => p.isDeleted === true),
        `STEP 3 EXPECTED (confirmed defect): all Progress Reports for the deleted report should also be deleted — isDeleted flags were ${JSON.stringify(progressAfterDeletedFlags)}`,
      ).toBe(true);
      expect.soft(
        progressAfterForReport.length,
        'STEP 3 EXPECTED (ADO\'s literal framing): GetAll should return zero Progress Reports for the deleted identifier',
      ).toBe(0);

      if (componentsSeeded) {
        const componentsAfter = await (await page.request.get(`${QA_API}/api/dynamic/Epm/Component/Crud/GetAll?maxResultCount=2000`, { headers: auth })).json();
        const componentsAfterForReport = (componentsAfter?.result?.items ?? componentsAfter?.result ?? []).filter((c: any) => c?.performanceReport?.id === reportId);
        const componentsAfterDeletedFlags = componentsAfterForReport.map((c: any) => c.isDeleted);
        console.log(`STEP 3 ACTUAL — Components for this report after delete: ${componentsAfterForReport.length}, isDeleted flags: ${JSON.stringify(componentsAfterDeletedFlags)}`);
        expect.soft(
          componentsAfterForReport.every((c: any) => c.isDeleted === true),
          `STEP 3 EXPECTED: all Components for the deleted report should also be deleted — isDeleted flags were ${JSON.stringify(componentsAfterDeletedFlags)}`,
        ).toBe(true);
      } else {
        console.log('STEP 3 — Component cascade not exercisable this run (0 Components were seeded due to the precondition blocker documented above).');
      }
    } finally {
      // Best-effort cleanup of anything that survived (expected, given the confirmed no-cascade defect).
      for (const cid of [...componentIds].reverse()) {
        const cleanup = await page.request.delete(`${QA_API}/api/dynamic/Epm/Component/Crud/Delete?id=${cid}`, { headers: auth }).catch(() => null);
        console.log(`CLEANUP — removed component ${cid}: ${cleanup ? cleanup.status() : 'request failed'}`);
      }
      const progressCleanup = await (await page.request.get(`${WF_API}/api/dynamic/Epm/ProgressReport/Crud/GetAll?maxResultCount=2000`, { headers: auth })).json();
      const survivingProgress = (progressCleanup?.result?.items ?? progressCleanup?.result ?? []).filter((p: any) => p?.performanceReport?.id === reportId && !p.isDeleted);
      for (const p of survivingProgress) {
        const cleanup = await page.request.delete(`${WF_API}/api/dynamic/Epm/ProgressReport/Crud/Delete?id=${p.id}`, { headers: auth }).catch(() => null);
        console.log(`CLEANUP — removed orphaned progress report ${p.id}: ${cleanup ? cleanup.status() : 'request failed'}`);
      }
      const reportCleanup = await page.request.delete(`${WF_API}/api/dynamic/Epm/PerformanceReport/Crud/Delete?id=${reportId}`, { headers: auth }).catch(() => null);
      console.log(`CLEANUP — final report delete (idempotent, already deleted in STEP 2): ${reportCleanup ? reportCleanup.status() : 'request failed'}`);
      // Always remove the disposable period set, whether this run passed or failed partway through.
      for (const qp of qPeriods) {
        const qCleanup = await page.request.delete(`${PERIOD_CRUD}/Delete?id=${qp.id}`, { headers: auth }).catch(() => null);
        console.log(`CLEANUP — removed disposable Quarter period ${qp.id}: ${qCleanup ? qCleanup.status() : 'request failed'}`);
      }
      const fyCleanup = await page.request.delete(`${PERIOD_CRUD}/Delete?id=${fyPeriod.id}`, { headers: auth }).catch(() => null);
      console.log(`CLEANUP — removed disposable Financial Year period ${fyPeriod.id}: ${fyCleanup ? fyCleanup.status() : 'request failed'}`);
    }
  });
});
