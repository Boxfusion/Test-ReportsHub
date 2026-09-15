import { test, expect } from '@playwright/test';

// Derived artefact — the canonical source is epm-reporting-tree-seeding.md, which mirrors ADO test
// case 108781 in suite 109518 ("09 · EPM · Reporting Tree seeding — Build Tree action + Add Top Level
// Item / Add Child Item + KPI Weighting field"), plan 108745. Edit the .md (and the ADO case), not this
// file, except for AI-repair patches.

const BASE = 'https://pd-epm-adminportal-qa-wf.shesha.app';
const QA_API = 'https://pd-epm-api-qa.shesha.app';
const WF_API = 'https://pd-epm-api-qa-wf.shesha.app';

const TOKEN = process.env.TC108781_TOKEN || `TC108781-${Date.now()}`;
const SHORT = TOKEN.replace(/\D/g, '').slice(-6);
const REPORT_NAME = `Tree Seeding Test ${SHORT}`;
const REPORT_SHORT_NAME = `TS${SHORT}`;
// Confirmed live 2026-08-17 (see epm-performance-report-create-period-cycle-mismatch memory).
const TEMPLATE_ID = '77a75071-5385-4ae7-bb5e-42cc4619ee87'; // "Standard Annual Performance Plan"
const PERIOD_ID = '8062531f-2326-4fc7-8ea3-582d11bcdcb1'; // "Financial Year 2026/27"
// Confirmed live 2026-08-17 via ComponentDefinition/Crud/GetAll (on the -wf host — see WF_API note
// below) — pre-existing catalog entries matching ADO's precondition ("Component Definitions exist for
// Department and Programme") exactly, including all three Programme refNos ADO's step 2 asks for
// (PROG_1 = "Administration", PROG_2 = "Integrated Human Settlements Planning and Development
// Programme", PROG_3 = "Informal Settlements Upgrading Programme"). The node form's searchable select
// is labelled "Ref No" (not "Component Definition" — that field renders with no interactive control of
// its own; selecting a Ref No populates it) — confirmed live 2026-08-17.
const DEPT_1_REFNO = 'DEPT_1'; // "Emmanuel_Department" on -qa / "Department of Human Settlements" on -wf
const PROG_REFNOS = ['PROG_1', 'PROG_2', 'PROG_3'];

const SLOW = 420_000;
const RAW_CHANNEL = process.env.PW_CHANNEL === undefined ? 'chrome' : process.env.PW_CHANNEL;
const CHANNEL = RAW_CHANNEL === '' || RAW_CHANNEL === 'chromium' ? undefined : RAW_CHANNEL;

test.use({
  channel: CHANNEL,
  viewport: { width: 1920, height: 1080 },
  actionTimeout: 30_000,
  navigationTimeout: 120_000,
});

test.describe('EPM — Reporting Tree seeding (ADO plan 108745 / suite 109518)', () => {
  test('TC-108781 Positive — Seed a two-level Reporting Tree (Department + 3 Programmes) with correct parent identifier and refNo propagation', async ({ page }) => {
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

    // PRECONDITION SETUP: A Performance Report exists in Planning state.
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

      const row = page.locator('[role="row"]', { hasText: REPORT_NAME }).first();
      await expect(row, 'the disposable report should be visible in the list').toBeVisible({ timeout: SLOW });
      const detailsLink = row.locator('a[href*="performance-report-details-view"]').first();
      await detailsLink.click({ force: true });
      await expect(page.locator('.ant-spin-spinning')).toHaveCount(0, { timeout: SLOW });
      await page.waitForTimeout(1_500);

      // Real route confirmed live 2026-08-17: "Build Tree" (an .ant-btn, not matched by a plain
      // getByRole('button') accessible-name query — same icon+text quirk seen elsewhere in this app).
      // A `force: true` click on this button doesn't always register on a freshly-navigated page
      // (same class of click-timing flake as the EPM rail nav elsewhere) — retry a few times, checking
      // the URL actually changed, rather than assuming one click is enough.
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

      // Fills the Department/Programme node form. Confirmed live 2026-08-17: "Ref No" is itself the
      // searchable reference-picker (a select with a dropdown chevron, not a plain text input) —
      // selecting a refNo picks the underlying Component Definition and propagates its Name/Description
      // (the "Component Definition" field beneath it is a read-only display, not an interactive
      // control — targeting it directly finds nothing). Sets Weight (mandatory, ADO gives no value —
      // 1 is used), and Saves. Returns the created Component's id.
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

      // STEP 1: Add a Department node using a Component Definition with refNo DEPT_1.
      const addTopLevel = page.getByText('Add Top Level Item', { exact: true }).locator('visible=true').first();
      await expect(addTopLevel, 'STEP 1 EXPECTED: Add Top Level Item should be reachable').toBeVisible({ timeout: SLOW });
      await addTopLevel.click({ force: true });
      await page.waitForTimeout(1_500);
      const deptTypeOption = page.getByText('Department', { exact: true }).locator('visible=true').first();
      await expect(deptTypeOption, 'STEP 1 EXPECTED: Department should be an offered top-level type').toBeVisible({ timeout: 30_000 });
      await deptTypeOption.click({ force: true });
      const dept = await fillNodeFormAndSave(DEPT_1_REFNO);
      const deptId = dept.id;
      componentIds.push(deptId);
      console.log(`STEP 1 ACTUAL — Department node saved (id ${deptId}, name "${dept.name}").`);

      // STEP 1 EXPECTED: the Department node appears at the top of the tree with refNo DEPT_1.
      // Confirmed live 2026-08-17: the tree renders whatever Name actually got saved (which is NOT
      // simply the Component Definition's own catalog `name` — e.g. selecting refNo DEPT_1
      // ("Emmanuel_Department" in the catalog) produced a saved Component named "Department of Human
      // Settlements"). Don't guess the text — search for the name the save response actually returned.
      expect(dept.name, 'the save response should return a Name to search the tree for').toBeTruthy();
      const deptNode = page.getByText(dept.name!, { exact: false }).locator('visible=true').first();
      await expect(deptNode, 'STEP 1 EXPECTED: the Department node should appear in the tree').toBeVisible({ timeout: SLOW });

      // STEP 2: Under Department, add THREE Programme nodes using the Programme Component Definitions
      // PROG_1, PROG_2, PROG_3. Confirmed live 2026-08-17 (user correction): adding a nested node also
      // goes through "Add Top Level Item" — clicked again with the Department node selected in the tree
      // first, not "Add Child Item". The parent relationship comes from the tree selection, not the
      // button label. Re-select the Department node before each of the three additions since the tree
      // selection can be lost after a save/reload of the panel.
      const progRecordsById: { id: string; refNo: string; name: string | null }[] = [];
      for (const progRefNo of PROG_REFNOS) {
        const deptTreeNode = page.locator('.ant-tree, [class*="tree"]').getByText(dept.name!, { exact: false }).locator('visible=true').first();
        await deptTreeNode.click({ force: true });
        await page.waitForTimeout(1_000);
        await addTopLevel.click({ force: true });
        await page.waitForTimeout(1_500);
        const progTypeOption = page.getByText('Programme', { exact: true }).locator('visible=true').first();
        await expect(progTypeOption, 'STEP 2: Programme should be an offered child type').toBeVisible({ timeout: 30_000 });
        await progTypeOption.click({ force: true });
        const prog = await fillNodeFormAndSave(progRefNo);
        componentIds.push(prog.id);
        progRecordsById.push({ id: prog.id, refNo: progRefNo, name: prog.name });
        console.log(`STEP 2 ACTUAL — Programme child saved using "${progRefNo}" (id ${prog.id}, name "${prog.name}").`);
      }

      // STEP 3: Reload the tree and verify Component records via GetAll filtered by performanceReport.id.
      await page.reload({ waitUntil: 'domcontentloaded' });
      await expect(page.locator('.ant-spin-spinning')).toHaveCount(0, { timeout: SLOW });
      await page.waitForTimeout(1_500);

      // Confirmed live 2026-08-17: the tree-builder's Save hits Component/Crud/Update on the -wf host
      // (logged: https://pd-epm-api-qa-wf.shesha.app/.../Component/Crud/Update) — same host-mismatch
      // pattern as PerformanceReport itself (see epm-performance-report-create-period-cycle-mismatch
      // memory). Query/cleanup against WF_API, not QA_API, for these Components.
      const allComponents = await (await page.request.get(`${WF_API}/api/dynamic/Epm/Component/Crud/GetAll?maxResultCount=2000`, { headers: auth })).json();
      const componentsForReport = (allComponents?.result?.items ?? allComponents?.result ?? []).filter((c: any) => c?.performanceReport?.id === reportId);
      console.log(`STEP 3 ACTUAL — ${componentsForReport.length} Component records found for this report.`);
      expect(componentsForReport.length, 'STEP 3 EXPECTED: four Component records should exist (Department + three Programmes)').toBe(4);

      // `Component.refNo` is genuinely always null — but confirmed live 2026-08-17 by inspecting a
      // real user-built tree in the app UI: opening a saved node's form shows "Ref No: DEPT_1" and the
      // select's combined label "DEPT_1 – Department of Human Settlements" correctly. refNo is NOT
      // duplicated onto Component at all — the UI derives/displays it live from the linked
      // `componentDefinition` reference, not from a column on Component itself. So the correct way to
      // verify propagation is via that reference's own refNo, not `component.refNo` (an earlier mistake
      // in this spec, retracted — see epm-reporting-tree-refno-not-propagated memory).
      // Confirmed live 2026-08-17: THIS particular linked Component Definition ("Department of Human
      // Settlements", the one actually used when saving a tree node) lives on -wf, not -qa (404 there)
      // — ComponentDefinition data is inconsistently split across both hosts, not simply mirrored.
      // Query -wf for tree-related Component Definition lookups, matching PerformanceReport/Component.
      const cdResp = await (await page.request.get(`${WF_API}/api/dynamic/Epm/ComponentDefinition/Crud/GetAll?maxResultCount=2000`, { headers: auth })).json();
      const cdItems = cdResp?.result?.items ?? cdResp?.result ?? [];
      const cdRefNoById = new Map(cdItems.map((cd: any) => [cd.id, cd.refNo]));
      const refNoFor = (c: any) => cdRefNoById.get(c?.componentDefinition?.id) ?? null;

      const deptRecord = componentsForReport.find((c: any) => c.id === deptId);
      console.log(`STEP 3 ACTUAL — Department full record: ${JSON.stringify(deptRecord)}`);
      expect(deptRecord?.parent, 'STEP 1 EXPECTED: the Department node should have no parent (top-level)').toBeFalsy();
      expect(refNoFor(deptRecord), 'STEP 1 EXPECTED: the Department refNo should propagate via its Component Definition').toBe('DEPT_1');

      const seenOrderIndexes: number[] = [];
      for (const { id: progId, refNo: progRefNo } of progRecordsById) {
        const progRecord = componentsForReport.find((c: any) => c.id === progId);
        console.log(`STEP 3 ACTUAL — Programme "${progRefNo}" full record: ${JSON.stringify(progRecord)}`);
        expect(progRecord?.parent?.id, `STEP 2 EXPECTED: the "${progRefNo}" component should have Department as its parentId`).toBe(deptId);
        expect(refNoFor(progRecord), `STEP 2 EXPECTED: the "${progRefNo}" refNo should propagate via its Component Definition`).toBe(progRefNo);
        seenOrderIndexes.push(progRecord?.orderIndex);
      }
      console.log(`STEP 3 ACTUAL — Programme orderIndexes: ${JSON.stringify(seenOrderIndexes)}.`);
      expect(new Set(seenOrderIndexes).size, 'STEP 2 EXPECTED: the three Programme siblings should have distinct orderIndex values').toBe(3);
      console.log('STEP 3 ACTUAL — parentId, orderIndex, and refNo (via Component Definition) all confirmed correct for all three Programmes.');
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
