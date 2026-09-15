import { test, expect } from '@playwright/test';

// ADO TC-109455 (plan 108745, suite 09 · EPM · Reporting Tree seeding — Build Tree action + Add Top
// Level Item / Add Child Item + KPI Weighting field). Positive: open the Performance Report detail page
// via the row's search/view action, click "Build Tree", confirm the tree builder loads with an
// "Add Top Level Item" button visible, add a Department node via that toolbar, and confirm it appears
// in the tree.

const BASE = 'https://pd-epm-adminportal-qa-wf.shesha.app';
const WF_API = 'https://pd-epm-api-qa-wf.shesha.app';
const PERIOD_CRUD = `${WF_API}/api/dynamic/Shesha.Enterprise/Period/Crud`;

const TOKEN = process.env.TC109455_TOKEN || `TC109455-${Date.now()}`;
const SHORT = TOKEN.replace(/\D/g, '').slice(-6);
const REPORT_NAME = `Build Tree Action Test ${SHORT}`;
const REPORT_SHORT_NAME = `BTA${SHORT}`;
const TEMPLATE_ID = '77a75071-5385-4ae7-bb5e-42cc4619ee87'; // "Standard Annual Performance Plan" — reconfirmed live 2026-08-28
// The old hardcoded "Financial Year 2026/27" period (id 8062531f-...) is soft-deleted (confirmed
// 2026-08-28 — see epm-performance-report-period-covered-stale memory). Built fresh per run instead.
const DEPT_1_REFNO = 'DEPT_1';

const SLOW = 420_000;
const RAW_CHANNEL = process.env.PW_CHANNEL === undefined ? 'chrome' : process.env.PW_CHANNEL;
const CHANNEL = RAW_CHANNEL === '' || RAW_CHANNEL === 'chromium' ? undefined : RAW_CHANNEL;

test.use({
  channel: CHANNEL,
  viewport: { width: 1920, height: 1080 },
  actionTimeout: 30_000,
  navigationTimeout: 120_000,
});

test.describe('EPM — Reporting Tree Build Tree action (ADO plan 108745 / suite 09)', () => {
  test('TC-109455 Positive — Build Tree action loads the tree builder with add-node toolbar', async ({ page }) => {
    test.setTimeout(600_000);
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

    // Setup (not the graded claim): build a fresh, disposable Financial Year period with 4 Quarter
    // children, since the real "Financial Year 2026/27" period this test used to rely on is soft-deleted.
    const fyResp = await page.request.post(`${PERIOD_CRUD}/Create`, {
      headers: auth,
      data: { name: `TC109455 FY ${SHORT}`, shortName: `FY${SHORT}`, periodStart: '2026-04-01T00:00:00', periodEnd: '2027-03-31T00:00:00', periodType: 1 },
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
        data: { name: `TC109455 FY ${SHORT} Q${i + 1}`, shortName: `Q${i + 1}${SHORT}`, periodStart, periodEnd, periodType: 4, parentPeriod: { id: fyPeriod.id } },
      });
      expect(resp.status(), `setup: creating disposable Quarter ${i + 1} should succeed`).toBeLessThan(400);
      qPeriods.push((await resp.json())?.result);
    }
    console.log(`Setup — created disposable Financial Year period "${fyPeriod.name}" with ${qPeriods.length} Quarter children.`);

    // PRECONDITION: A Performance Report exists at Planning status.
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

      // List is paginated (confirmed live 2026-08-28 on sibling specs) — search rather than assume page 1.
      const searchInput = page.locator('.ant-input-search input, .ant-input-affix-wrapper input').first();
      await searchInput.fill(REPORT_NAME);
      await searchInput.press('Enter');
      await page.waitForTimeout(1_500);

      // STEP 1: Open the Performance Report detail page via the row's search/view action.
      const row = page.locator('[role="row"]', { hasText: REPORT_NAME }).first();
      await expect(row, 'STEP 1 EXPECTED: the disposable report should be visible in the list').toBeVisible({ timeout: SLOW });
      const detailsLink = row.locator('a[href*="performance-report-details-view"]').first();
      await expect(detailsLink, 'STEP 1 EXPECTED: a row action should open the detail page').toBeVisible({ timeout: SLOW });
      await detailsLink.click({ force: true });
      await expect(page.locator('.ant-spin-spinning')).toHaveCount(0, { timeout: SLOW });
      await page.waitForTimeout(1_500);
      await expect(page, 'STEP 1 EXPECTED: detail page loads').toHaveURL(/performance-report-details-view/, { timeout: SLOW });
      console.log('STEP 1 ACTUAL — detail page loaded.');

      // STEP 2: Click the "Build Tree" link. EXPECTED: tree builder opens with "Add Top Level Item"
      // visible. Confirmed live: a plain .ant-btn, not matched by getByRole('button') accessible-name
      // matching; a force-click doesn't always register on a freshly-navigated page.
      const buildTreeBtn = page.locator('.ant-btn, button, a').filter({ hasText: 'Build Tree' }).first();
      await expect(buildTreeBtn, 'STEP 2 EXPECTED: Build Tree link should be visible').toBeVisible({ timeout: SLOW });
      for (let attempt = 1; attempt <= 5; attempt++) {
        await buildTreeBtn.click({ force: true });
        const navigated = await page.waitForURL(/performance-report-planning-page/, { timeout: 15_000 }).then(() => true).catch(() => false);
        if (navigated) break;
        console.log(`  Build Tree click attempt ${attempt} did not navigate, retrying...`);
        if (attempt === 5) throw new Error('Build Tree click never navigated to the planning page after 5 attempts');
      }
      await expect(page.locator('.ant-spin-spinning')).toHaveCount(0, { timeout: SLOW });
      await page.waitForTimeout(1_500);

      const addTopLevel = page.getByText('Add Top Level Item', { exact: true }).locator('visible=true').first();
      await expect(addTopLevel, 'STEP 2 EXPECTED: "Add Top Level Item" button should be visible on the tree builder').toBeVisible({ timeout: SLOW });
      console.log('STEP 2 ACTUAL — tree builder loaded with "Add Top Level Item" visible.');

      // STEP 3: Add a Department node using the toolbar. EXPECTED: node appears in the tree.
      await addTopLevel.click({ force: true });
      await page.waitForTimeout(1_500);
      const deptTypeOption = page.getByText('Department', { exact: true }).locator('visible=true').first();
      await expect(deptTypeOption, 'STEP 3 EXPECTED: Department should be an offered top-level type').toBeVisible({ timeout: 30_000 });
      await deptTypeOption.click({ force: true });
      await page.waitForTimeout(1_500);

      const refNoFormItem = page.locator('.ant-form-item').filter({ hasText: /^Ref No/i }).first();
      await refNoFormItem.locator('.ant-select').first().click();
      const refNoDropdown = page.locator('.ant-select-dropdown').locator('visible=true').first();
      await expect(refNoDropdown, 'the Ref No dropdown should list available Component Definitions').toBeVisible({ timeout: 30_000 });
      await page.keyboard.type(DEPT_1_REFNO);
      await page.waitForTimeout(1_000);
      const refNoOption = refNoDropdown.locator('.ant-select-item-option').filter({ hasText: new RegExp(`^${DEPT_1_REFNO}$`) }).first();
      await expect(refNoOption, `"${DEPT_1_REFNO}" should be a selectable Ref No`).toBeVisible({ timeout: 30_000 });
      await refNoOption.click();
      await page.waitForTimeout(1_000);

      const weightFormItem = page.locator('.ant-form-item').filter({ hasText: /^Weight/i }).first();
      const weightInput = weightFormItem.locator('input').first();
      if (!(await weightInput.inputValue().catch(() => ''))) await weightInput.fill('1');

      const savePromise = page
        .waitForResponse((r) => r.request().method() !== 'GET' && /Component/i.test(r.url()), { timeout: 60_000 })
        .catch(() => null);
      const saveBtn = page.locator('.ant-btn, button').filter({ hasText: /^Save$/ }).first();
      await saveBtn.click({ force: true });
      const saveResp = await savePromise;
      expect(saveResp, 'saving the Department node should send a request').toBeTruthy();
      expect(saveResp!.status(), 'saving the Department node should succeed').toBeLessThan(400);
      const body = await saveResp!.json().catch(() => null);
      const deptId: string | null = body?.result?.id ?? null;
      const deptName: string | null = body?.result?.name ?? null;
      expect(deptId, 'saving the Department node should return a component id').toBeTruthy();
      componentIds.push(deptId!);
      console.log(`STEP 3 ACTUAL — Department node saved (id ${deptId}, name "${deptName}").`);
      await page.waitForTimeout(1_500);

      const deptNode = page.getByText(deptName!, { exact: false }).locator('visible=true').first();
      await expect(deptNode, 'STEP 3 EXPECTED: the Department node should appear in the tree').toBeVisible({ timeout: SLOW });
      console.log('STEP 3 ACTUAL — Department node confirmed visible in the tree.');
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
