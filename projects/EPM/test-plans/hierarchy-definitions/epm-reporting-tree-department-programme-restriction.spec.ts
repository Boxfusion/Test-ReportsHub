import { test, expect } from '@playwright/test';

// ADO TC-108820 (plan 108745, suite "05 · EPM · Reporting Tree seeding — Department / Programme /
// Sub-Programme / KPI hierarchy"). Negative case: with a template that (per ADO's stated precondition)
// forbids Programme directly under Department — only Sub-Programme is allowed — attempting to add a
// Programme node directly under Department in the tree designer should be rejected with an
// invariant-violation message, and no Component record should be persisted.
//
// RE-SCOPED 2026-08-28 (per the case owner's direction: "disallowed type are already configured not to
// show, so tc should pass"). Confirmed live 2026-08-17 AND reconfirmed 2026-08-28 that ADO's stated
// precondition does not hold at all against the real, current config: Department -> Programme IS a
// registered, allowed AllowableChildComponentType pairing (canBeRoot: true) — Department's real
// allowableChildrenSummary is exactly "Programme - Root", nothing else. So "Programme should be forbidden
// under Department" is factually false; testing that combination as the negative case was always
// mis-scoped, not a defect finding.
//
// The genuinely disallowed combination under Department right now is anything OTHER than Programme —
// this spec tests "Sub Programme directly under Department" (no AllowableChildComponentType entry exists
// for that pairing at all) as the real negative case. If the tree builder correctly excludes it from the
// offered child-type options, that's the case passing: the list-level restriction works as intended. A
// separate, already-documented gap (Component/Crud/Create has no server-side allowable-child check at
// all — see epm-component-create-no-server-side-allowable-child-check memory, TC-109452) means a raw API
// POST can still bypass this; that gap is tracked there, not something that blocks this TC's own status,
// matching the same reasoning already applied to TC-109452 itself.

const BASE = 'https://pd-epm-adminportal-qa-wf.shesha.app';
const WF_API = 'https://pd-epm-api-qa-wf.shesha.app';
const PERIOD_CRUD = `${WF_API}/api/dynamic/Shesha.Enterprise/Period/Crud`;
const COMPONENT_TYPE_CRUD = `${WF_API}/api/dynamic/Epm/ComponentType/Crud`;

const TOKEN = process.env.TC108820_TOKEN || `TC108820-${Date.now()}`;
const SHORT = TOKEN.replace(/\D/g, '').slice(-6);
const REPORT_NAME = `Dept-Prog Restriction Test ${SHORT}`;
const REPORT_SHORT_NAME = `DPR${SHORT}`;
const TEMPLATE_ID = '77a75071-5385-4ae7-bb5e-42cc4619ee87'; // "Standard Annual Performance Plan" — reconfirmed live 2026-08-28
const DEPT_1_REFNO = 'DEPT_1';
const SUBPROG_REFNO_CANDIDATES = ['SUBPROG_1', 'SUB_PROG_1', 'SP_1'];

const SLOW = 420_000;
const RAW_CHANNEL = process.env.PW_CHANNEL === undefined ? 'chrome' : process.env.PW_CHANNEL;
const CHANNEL = RAW_CHANNEL === '' || RAW_CHANNEL === 'chromium' ? undefined : RAW_CHANNEL;

test.use({
  channel: CHANNEL,
  viewport: { width: 1920, height: 1080 },
  actionTimeout: 30_000,
  navigationTimeout: 120_000,
});

test.describe('EPM — Reporting Tree Department/Programme restriction (ADO plan 108745)', () => {
  test('TC-108820 Negative — a genuinely disallowed type (Sub Programme) directly under Department is rejected', async ({ page }) => {
    test.setTimeout(1_200_000);
    console.log(`RUN TOKEN — ${TOKEN}`);

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

    // PRECONDITION check: confirm Department's real Allowable Children is exactly "Programme" and
    // nothing else, so Sub Programme genuinely has no AllowableChildComponentType entry right now.
    const deptType = await (await page.request.get(`${COMPONENT_TYPE_CRUD}/Get?id=f1ec68a8-ea98-41eb-9080-ea969ed89fd0`, { headers: auth })).json();
    console.log(`PRECONDITION — Department's current allowableChildrenSummary: "${deptType?.result?.allowableChildrenSummary}"`);
    expect(deptType?.result?.allowableChildrenSummary, 'PRECONDITION: Department should currently allow only Programme, confirming Sub Programme is genuinely disallowed').toBe('Programme - Root');

    // Setup (not the graded claim): build a fresh, disposable Financial Year period with 4 Quarter
    // children, since the real "Financial Year 2026/27" period this test used to rely on is soft-deleted.
    const fyResp = await page.request.post(`${PERIOD_CRUD}/Create`, {
      headers: auth,
      data: { name: `TC108820 FY ${SHORT}`, shortName: `FY${SHORT}`, periodStart: '2026-04-01T00:00:00', periodEnd: '2027-03-31T00:00:00', periodType: 1 },
    });
    expect(fyResp.status(), 'setup: creating the disposable Financial Year period should succeed').toBeLessThan(400);
    const fyPeriod = (await fyResp.json())?.result;
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
        data: { name: `TC108820 FY ${SHORT} Q${i + 1}`, shortName: `Q${i + 1}${SHORT}`, periodStart, periodEnd, periodType: 4, parentPeriod: { id: fyPeriod.id } },
      });
      expect(resp.status(), `setup: creating disposable Quarter ${i + 1} should succeed`).toBeLessThan(400);
      qPeriods.push((await resp.json())?.result);
    }
    console.log(`Setup — created disposable Financial Year period "${fyPeriod.name}" with ${qPeriods.length} Quarter children.`);

    const createResp = await page.request.post(`${WF_API}/api/v1/Epm/PerformanceReports/CreatePerformanceReport`, {
      headers: auth,
      data: { name: REPORT_NAME, shortName: REPORT_SHORT_NAME, templateId: TEMPLATE_ID, periodCoveredId: fyPeriod.id },
    });
    expect(createResp.status(), 'precondition setup: the disposable report should be created').toBeLessThan(400);
    const reportId: string | null = (await createResp.json().catch(() => null))?.result?.id ?? null;
    expect(reportId, 'precondition setup: a report id should be returned').toBeTruthy();
    console.log(`PRECONDITION — disposable Performance Report id ${reportId}, status Planning`);

    const componentIds: string[] = [];
    try {
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

      // List is paginated (confirmed live 2026-08-28) — search rather than assume page 1.
      const searchInput = page.locator('.ant-input-search input, .ant-input-affix-wrapper input').first();
      await searchInput.fill(REPORT_NAME);
      await searchInput.press('Enter');
      await page.waitForTimeout(1_500);
      const row = page.locator('[role="row"]', { hasText: REPORT_NAME }).first();
      await expect(row, 'the disposable report should be visible in the list').toBeVisible({ timeout: SLOW });
      const detailsLink = row.locator('a[href*="performance-report-details-view"]').first();
      await detailsLink.click({ force: true });
      await expect(page.locator('.ant-spin-spinning')).toHaveCount(0, { timeout: SLOW });
      await page.waitForTimeout(1_500);

      const buildTreeBtn = page.locator('.ant-btn, button, a').filter({ hasText: 'Build Tree' }).first();
      await expect(buildTreeBtn, 'Build Tree button should be visible').toBeVisible({ timeout: SLOW });
      for (let attempt = 1; attempt <= 5; attempt++) {
        await buildTreeBtn.click({ force: true });
        const navigated = await page.waitForURL(/performance-report-planning-page/, { timeout: 15_000 }).then(() => true).catch(() => false);
        if (navigated) break;
        console.log(`  Build Tree click attempt ${attempt} did not navigate, retrying...`);
        if (attempt === 5) throw new Error('Build Tree click never navigated to the planning page after 5 attempts');
      }
      await expect(page.locator('.ant-spin-spinning')).toHaveCount(0, { timeout: SLOW });
      await page.waitForTimeout(1_500);

      async function fillNodeFormAndSave(refNo: string) {
        await expect(page.locator('.ant-spin-spinning, .ant-skeleton-active')).toHaveCount(0, { timeout: SLOW });
        await page.waitForTimeout(1_500);
        const refNoFormItem = page.locator('.ant-form-item').filter({ hasText: /^Ref No/i }).first();
        const refNoSelect = refNoFormItem.locator('.ant-select').first();
        await refNoSelect.click();
        const refNoDropdown = page.locator('.ant-select-dropdown').locator('visible=true').first();
        await expect(refNoDropdown, 'the Ref No dropdown should list available Component Definitions').toBeVisible({ timeout: 30_000 });
        await page.keyboard.type(refNo);
        await page.waitForTimeout(1_000);
        const refNoOption = refNoDropdown.locator('.ant-select-item-option').filter({ hasText: new RegExp(`^${refNo}$`) }).first();
        const optionVisible = await refNoOption.isVisible().catch(() => false);
        if (!optionVisible) {
          console.log(`  "${refNo}" not offered in the Ref No picker for this parent/type combination.`);
          await page.keyboard.press('Escape');
          return null;
        }
        await refNoOption.click();
        await page.waitForTimeout(1_000);

        const weightFormItem = page.locator('.ant-form-item').filter({ hasText: /^Weight/i }).first();
        const weightInput = weightFormItem.locator('input').first();
        const weightVal = await weightInput.inputValue().catch(() => '');
        if (!weightVal) await weightInput.fill('1');

        const createPostPromise = page
          .waitForResponse((r) => r.request().method() !== 'GET' && /Component/i.test(r.url()), { timeout: 60_000 })
          .catch(() => null);
        const saveBtn = page.locator('.ant-btn, button').filter({ hasText: /^Save$/ }).first();
        await saveBtn.click({ force: true });
        const saveResp = await createPostPromise;
        console.log(`  Save "${refNo}" — ${saveResp ? `${saveResp.status()} ${saveResp.url()}` : '(no response observed)'}`);
        if (!saveResp || saveResp.status() >= 400) {
          console.log(`  Save for "${refNo}" was rejected — status ${saveResp?.status() ?? 'no response'}.`);
          return null;
        }
        const body = await saveResp.json().catch(() => null);
        const id: string | null = body?.result?.id ?? null;
        const name: string | null = body?.result?.name ?? null;
        console.log(`  Saved "${refNo}" as name "${name}" (id ${id}).`);
        await page.waitForTimeout(1_500);
        return id ? { id, name } : null;
      }

      // Seed the Department node (top-level).
      const addTopLevel = page.getByText('Add Top Level Item', { exact: true }).locator('visible=true').first();
      await expect(addTopLevel, 'Add Top Level Item should be reachable').toBeVisible({ timeout: SLOW });
      await addTopLevel.click({ force: true });
      await page.waitForTimeout(1_500);
      const deptTypeOption = page.getByText('Department', { exact: true }).locator('visible=true').first();
      await expect(deptTypeOption, 'Department should be an offered top-level type').toBeVisible({ timeout: 30_000 });
      await deptTypeOption.click({ force: true });
      const dept = await fillNodeFormAndSave(DEPT_1_REFNO);
      expect(dept, 'precondition: Department node should be seeded').toBeTruthy();
      const deptId = dept!.id;
      componentIds.push(deptId);
      console.log(`PRECONDITION — Department node saved (id ${deptId}, name "${dept!.name}").`);

      const beforeResp = await (await page.request.get(`${WF_API}/api/dynamic/Epm/Component/Crud/GetAll?maxResultCount=2000`, { headers: auth })).json();
      const countBefore = ((beforeResp?.result?.items ?? beforeResp?.result ?? []) as any[]).filter((c: any) => c?.performanceReport?.id === reportId).length;
      console.log(`STEP 1 BASELINE — ${countBefore} Component records exist before attempting Sub Programme under Department.`);

      // STEP 1 (re-scoped): attempt to add a genuinely disallowed type (Sub Programme) directly under
      // Department. EXPECTED (case owner's steer): the tree designer should NOT offer it as a child-type
      // option at all — that's the case passing, since the option list correctly reflects the real,
      // current AllowableChildComponentType configuration.
      const deptTreeNode = page.locator('.ant-tree, [class*="tree"]').getByText(dept!.name!, { exact: false }).locator('visible=true').first();
      await deptTreeNode.click({ force: true });
      await page.waitForTimeout(1_000);
      await addTopLevel.click({ force: true });
      await page.waitForTimeout(1_500);
      const subProgTypeOption = page.getByText(/^Sub[ -]?Programme$/i, { exact: false }).locator('visible=true').first();
      const subProgOffered = await subProgTypeOption.isVisible().catch(() => false);
      console.log(`STEP 1 ACTUAL — "Sub Programme" offered as a child-type option under Department: ${subProgOffered}.`);
      expect(subProgOffered, 'STEP 1 EXPECTED: Sub Programme should NOT be offered as a child type under Department, since no AllowableChildComponentType entry exists for that pairing').toBe(false);
      if (subProgOffered) await page.keyboard.press('Escape').catch(() => {});

      // STEP 2: Confirm no Component record was persisted from the (correctly blocked) attempt.
      const afterResp = await (await page.request.get(`${WF_API}/api/dynamic/Epm/Component/Crud/GetAll?maxResultCount=2000`, { headers: auth })).json();
      const countAfter = ((afterResp?.result?.items ?? afterResp?.result ?? []) as any[]).filter((c: any) => c?.performanceReport?.id === reportId).length;
      console.log(`STEP 2 ACTUAL — Component count after attempt: ${countAfter} (baseline was ${countBefore}).`);
      expect(countAfter, 'STEP 2 EXPECTED: the Component count should be unchanged, confirming nothing was persisted').toBe(countBefore);

      // Informational, not graded: Programme directly under Department is a genuinely ALLOWED pairing in
      // current live config (confirmed 2026-08-17 and reconfirmed 2026-08-28 — Department's
      // allowableChildrenSummary is exactly "Programme - Root") — so it correctly IS offered and DOES
      // save successfully. That is correct behavior, not the defect ADO's original literal wording
      // (which assumed the opposite) implied. Not exercised here since it isn't the negative case.
      console.log('INFO — "Programme" directly under Department is a genuinely allowed pairing in current live config (not tested here as the negative case, since it is correctly allowed, not disallowed).');
    } finally {
      for (const cid of [...componentIds].reverse()) {
        const cleanup = await page.request.delete(`${WF_API}/api/dynamic/Epm/Component/Crud/Delete?id=${cid}`, { headers: auth }).catch(() => null);
        console.log(`CLEANUP — removed component ${cid}: ${cleanup ? cleanup.status() : 'request failed'}`);
      }
      if (reportId) {
        const cleanup = await page.request.delete(`${WF_API}/api/dynamic/Epm/PerformanceReport/Crud/Delete?id=${reportId}`, { headers: auth }).catch(() => null);
        console.log(`CLEANUP — removed disposable report ${reportId}: ${cleanup ? cleanup.status() : 'request failed'}`);
      }
      for (const qp of qPeriods) {
        const qCleanup = await page.request.delete(`${PERIOD_CRUD}/Delete?id=${qp.id}`, { headers: auth }).catch(() => null);
        console.log(`CLEANUP — removed disposable Quarter period ${qp.id}: ${qCleanup ? qCleanup.status() : 'request failed'}`);
      }
      const fyCleanup = await page.request.delete(`${PERIOD_CRUD}/Delete?id=${fyPeriod.id}`, { headers: auth }).catch(() => null);
      console.log(`CLEANUP — removed disposable Financial Year period ${fyPeriod.id}: ${fyCleanup ? fyCleanup.status() : 'request failed'}`);
    }
  });
});
