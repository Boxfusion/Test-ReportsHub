import { test, expect } from '@playwright/test';

// ADO TC-108821 (plan 108745, suite "05 · EPM · Reporting Tree seeding — Department / Programme /
// Sub-Programme / KPI hierarchy"). Edge case: a Reporting Tree has three Programme nodes under a
// Department, inserted out of refNo order (PROG_3, then PROG_1, then PROG_2). Expected: orderIndex is
// assigned by insertion sequence (PROG_3 -> 1, PROG_1 -> 2, PROG_2 -> 3), the UI tree renders the nodes
// in that orderIndex sequence (i.e. visually PROG_3, PROG_1, PROG_2 top-to-bottom) rather than being
// silently re-sorted by refNo/name, and no Programme ends up with a null orderIndex.

const BASE = 'https://pd-epm-adminportal-qa-wf.shesha.app';
const WF_API = 'https://pd-epm-api-qa-wf.shesha.app';

const TOKEN = process.env.TC108821_TOKEN || `TC108821-${Date.now()}`;
const SHORT = TOKEN.replace(/\D/g, '').slice(-6);
const REPORT_NAME = `Prog OrderIndex Test ${SHORT}`;
const REPORT_SHORT_NAME = `POI${SHORT}`;
const TEMPLATE_ID = '77a75071-5385-4ae7-bb5e-42cc4619ee87'; // "Standard Annual Performance Plan"
const PERIOD_ID = '8062531f-2326-4fc7-8ea3-582d11bcdcb1'; // "Financial Year 2026/27"
const DEPT_1_REFNO = 'DEPT_1';
// Insertion order deliberately scrambled relative to refNo order, per ADO's precondition.
const INSERTION_ORDER = ['PROG_3', 'PROG_1', 'PROG_2'];

const SLOW = 420_000;
const RAW_CHANNEL = process.env.PW_CHANNEL === undefined ? 'chrome' : process.env.PW_CHANNEL;
const CHANNEL = RAW_CHANNEL === '' || RAW_CHANNEL === 'chromium' ? undefined : RAW_CHANNEL;

test.use({
  channel: CHANNEL,
  viewport: { width: 1920, height: 1080 },
  actionTimeout: 30_000,
  navigationTimeout: 120_000,
});

test.describe('EPM — Reporting Tree Programme orderIndex sequence (ADO plan 108745)', () => {
  test('TC-108821 Edge — Programmes inserted out of refNo order render and persist in orderIndex sequence', async ({ page }) => {
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

    const createResp = await page.request.post(`${WF_API}/api/v1/Epm/PerformanceReports/CreatePerformanceReport`, {
      headers: auth,
      data: { name: REPORT_NAME, shortName: REPORT_SHORT_NAME, templateId: TEMPLATE_ID, periodCoveredId: PERIOD_ID },
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
        await expect(refNoOption, `"${refNo}" should be a selectable Ref No`).toBeVisible({ timeout: 30_000 });
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
        expect(saveResp, `saving the node for "${refNo}" should send a request`).toBeTruthy();
        expect(saveResp!.status(), `saving the node for "${refNo}" should succeed`).toBeLessThan(400);
        const body = await saveResp!.json().catch(() => null);
        const id: string | null = body?.result?.id ?? null;
        const name: string | null = body?.result?.name ?? null;
        expect(id, `saving the node for "${refNo}" should return a component id`).toBeTruthy();
        console.log(`  Saved "${refNo}" as name "${name}" (id ${id}).`);
        await page.waitForTimeout(1_500);
        return { id: id!, name };
      }

      // PRECONDITION: seed Department (top level).
      const addTopLevel = page.getByText('Add Top Level Item', { exact: true }).locator('visible=true').first();
      await expect(addTopLevel, 'Add Top Level Item should be reachable').toBeVisible({ timeout: SLOW });
      await addTopLevel.click({ force: true });
      await page.waitForTimeout(1_500);
      const deptTypeOption = page.getByText('Department', { exact: true }).locator('visible=true').first();
      await expect(deptTypeOption, 'Department should be an offered top-level type').toBeVisible({ timeout: 30_000 });
      await deptTypeOption.click({ force: true });
      const dept = await fillNodeFormAndSave(DEPT_1_REFNO);
      const deptId = dept.id;
      componentIds.push(deptId);
      console.log(`PRECONDITION — Department node saved (id ${deptId}, name "${dept.name}").`);

      // PRECONDITION: insert the three Programme nodes in the scrambled order PROG_3, PROG_1, PROG_2.
      const progRecordsByInsertionOrder: { id: string; refNo: string; name: string | null }[] = [];
      for (const progRefNo of INSERTION_ORDER) {
        const deptTreeNode = page.locator('.ant-tree, [class*="tree"]').getByText(dept.name!, { exact: false }).locator('visible=true').first();
        await deptTreeNode.click({ force: true });
        await page.waitForTimeout(1_000);
        await addTopLevel.click({ force: true });
        await page.waitForTimeout(1_500);
        const progTypeOption = page.getByText('Programme', { exact: true }).locator('visible=true').first();
        await expect(progTypeOption, 'Programme should be an offered child type').toBeVisible({ timeout: 30_000 });
        await progTypeOption.click({ force: true });
        const prog = await fillNodeFormAndSave(progRefNo);
        componentIds.push(prog.id);
        progRecordsByInsertionOrder.push({ id: prog.id, refNo: progRefNo, name: prog.name });
        console.log(`PRECONDITION — inserted "${progRefNo}" (id ${prog.id}, name "${prog.name}") as insertion #${progRecordsByInsertionOrder.length}.`);
      }

      // STEP 2 (ADO): Verify via Component GetAll that orderIndex is populated on every Programme.
      await page.reload({ waitUntil: 'domcontentloaded' });
      await expect(page.locator('.ant-spin-spinning')).toHaveCount(0, { timeout: SLOW });
      await page.waitForTimeout(1_500);

      const allComponents = await (await page.request.get(`${WF_API}/api/dynamic/Epm/Component/Crud/GetAll?maxResultCount=2000`, { headers: auth })).json();
      const componentsForReport = (allComponents?.result?.items ?? allComponents?.result ?? []).filter((c: any) => c?.performanceReport?.id === reportId);
      const progComponentsById = new Map(componentsForReport.filter((c: any) => c.id !== deptId).map((c: any) => [c.id, c]));

      for (const { id, refNo } of progRecordsByInsertionOrder) {
        const record = progComponentsById.get(id);
        console.log(`STEP 2 ACTUAL — "${refNo}" (id ${id}) orderIndex: ${record?.orderIndex}.`);
        expect(record?.orderIndex, `STEP 2 EXPECTED: "${refNo}" should have a non-null orderIndex`).not.toBeNull();
      }

      // STEP 2 EXPECTED (per ADO precondition framing): orderIndex should reflect insertion sequence —
      // PROG_3 (inserted 1st) -> 1, PROG_1 (inserted 2nd) -> 2, PROG_2 (inserted 3rd) -> 3 — not refNo
      // numeric order.
      const orderIndexesInInsertionOrder = progRecordsByInsertionOrder.map(({ id }) => progComponentsById.get(id)?.orderIndex);
      console.log(`STEP 2 ACTUAL — orderIndex values in insertion order (PROG_3, PROG_1, PROG_2): ${JSON.stringify(orderIndexesInInsertionOrder)}.`);
      expect(orderIndexesInInsertionOrder, 'STEP 2 EXPECTED: orderIndex should be assigned 1,2,3 by insertion sequence, not by refNo').toEqual([1, 2, 3]);

      // STEP 1 (ADO): Open the Reporting Tree in the UI — the Programmes should render in orderIndex
      // sequence (i.e. visually PROG_3, PROG_1, PROG_2, matching insertion/orderIndex order), not
      // re-sorted by refNo/name (which would show PROG_1, PROG_2, PROG_3). The Department node
      // collapses back to its default (children hidden) after the page.reload() above — expand it via
      // its switcher before reading the rendered tree text.
      const deptNodeAfterReload = page.locator('.ant-tree-treenode', { hasText: dept.name! }).first();
      const switcher = deptNodeAfterReload.locator('.ant-tree-switcher').first();
      const switcherIsCollapsed = await switcher.evaluate((el) => el.className.includes('ant-tree-switcher_close')).catch(() => false);
      if (switcherIsCollapsed) {
        await switcher.click({ force: true });
        await page.waitForTimeout(1_000);
      }
      const treeContainer = page.locator('.ant-tree, [class*="tree"]').first();
      const treeText = await treeContainer.innerText().catch(() => '');
      console.log(`STEP 1 DEBUG — full tree text after expanding Department: ${treeText.replace(/\n/g, ' | ')}`);
      const namesInInsertionOrder = progRecordsByInsertionOrder.map((p) => p.name!);
      const positions = namesInInsertionOrder.map((name) => treeText.indexOf(name));
      console.log(`STEP 1 ACTUAL — tree text positions for names in insertion/orderIndex order ${JSON.stringify(namesInInsertionOrder)}: ${JSON.stringify(positions)}.`);
      for (const pos of positions) {
        expect(pos, 'STEP 1 EXPECTED: every inserted Programme name should be found in the rendered tree').toBeGreaterThanOrEqual(0);
      }
      expect(positions, 'STEP 1 EXPECTED: the tree should render Programme nodes in orderIndex sequence (PROG_3, PROG_1, PROG_2 top-to-bottom), not re-sorted by refNo/name').toEqual([...positions].sort((a, b) => a - b));
    } finally {
      for (const cid of [...componentIds].reverse()) {
        const cleanup = await page.request.delete(`${WF_API}/api/dynamic/Epm/Component/Crud/Delete?id=${cid}`, { headers: auth }).catch(() => null);
        console.log(`CLEANUP — removed component ${cid}: ${cleanup ? cleanup.status() : 'request failed'}`);
      }
      if (reportId) {
        const cleanup = await page.request.delete(`${WF_API}/api/dynamic/Epm/PerformanceReport/Crud/Delete?id=${reportId}`, { headers: auth }).catch(() => null);
        console.log(`CLEANUP — removed disposable report ${reportId}: ${cleanup ? cleanup.status() : 'request failed'}`);
      }
    }
  });
});
