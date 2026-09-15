import { test, expect } from '@playwright/test';

// ADO TC-109456 (plan 108745, suite 09 · EPM · Reporting Tree seeding — Build Tree action + Add Top
// Level Item / Add Child Item + KPI Weighting field). Integration: add a KPI node UNDER Sub-Programme via
// "Add Child Item" (per the case owner: this is the one level where Add Child Item is actually used,
// offering Qualitative KPI / Quantitative KPI — unlike Department/Programme/Sub-Programme additions,
// which go through "Add Top Level Item" repeatedly with the parent selected). Fill Annual Target and
// Weighting on the KPI form, save, and confirm via Component/Crud/GetAll that Weighting persisted.
//
// RE-TARGETED 2026-08-28 per the case owner's direction ("Add child item on e.g Princess & follow the
// test case"): rather than building a whole disposable Department > Programme > Sub-Programme chain from
// scratch, this now targets the real "Princess" report's own permanent tree — Department of Human
// Settlements > Administration (Programme) > Executive Support (Sub Programme) — kept permanently since
// 2026-08-28 (see epm-princess-tree-rebuilt-real-hierarchy memory) specifically so tests like this one can
// reuse it. Only the newly-added KPI Component is disposable and cleaned up afterward; Princess's own
// Department/Administration/Executive Support nodes are never touched.

const BASE = 'https://pd-epm-adminportal-qa-wf.shesha.app';
const WF_API = 'https://pd-epm-api-qa-wf.shesha.app';

const PRINCESS_REPORT_ID = 'bc34f55d-bb32-4629-bd74-3e03250e4784';
const DEPARTMENT_NAME = 'Department of Human Settlements';
const PROGRAMME_NAME = 'Administration';
const SUBPROG_NAME = 'Executive Support';
const QKPI_REFNO = 'QKPI_1'; // "Percentage compliance with statutory prescripts" (Quantitative KPI) — confirmed live 2026-08-28
const ANNUAL_TARGET_VALUE = '100';
const WEIGHTING_VALUE = '100';

const SLOW = 420_000;
const RAW_CHANNEL = process.env.PW_CHANNEL === undefined ? 'chrome' : process.env.PW_CHANNEL;
const CHANNEL = RAW_CHANNEL === '' || RAW_CHANNEL === 'chromium' ? undefined : RAW_CHANNEL;

test.use({
  channel: CHANNEL,
  viewport: { width: 1920, height: 1080 },
  actionTimeout: 30_000,
  navigationTimeout: 120_000,
});

test.describe('EPM — Reporting Tree KPI Weighting field (ADO plan 108745 / suite 09)', () => {
  test('TC-109456 Integration — KPI Weighting field is persisted alongside Annual Target', async ({ page }) => {
    test.setTimeout(1_200_000);

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

    const componentIds: string[] = [];
    try {
      // Go straight to Princess's own tree builder — no disposable report/tree setup needed.
      await page.goto(`${BASE}/dynamic/Epm/performance-report-planning-page?id=${PRINCESS_REPORT_ID}`, { waitUntil: 'domcontentloaded' });
      await expect(page.locator('.ant-spin-spinning')).toHaveCount(0, { timeout: SLOW });
      await page.waitForTimeout(1_500);

      // A parent node collapses (shows a "+" switcher) once a child is added under it, hiding that
      // child from the tree text — confirmed live via a failure screenshot. Expand it first.
      async function expandTreeNodeIfCollapsed(name: string) {
        const node = page.locator('.ant-tree-treenode', { hasText: name }).locator('visible=true').first();
        const switcher = node.locator('.ant-tree-switcher').first();
        const isCollapsed = await switcher.evaluate((el) => el.className.includes('ant-tree-switcher_close')).catch(() => false);
        if (isCollapsed) {
          await switcher.click({ force: true });
          await page.waitForTimeout(1_000);
        }
      }

      async function selectTreeNode(name: string, label: string) {
        const node = page.locator('.ant-tree-treenode', { hasText: name }).locator('visible=true').first();
        for (let attempt = 1; attempt <= 5; attempt++) {
          const visible = await node.isVisible({ timeout: 10_000 }).catch(() => false);
          if (visible) {
            await node.click({ force: true });
            await page.waitForTimeout(1_000);
            return;
          }
          console.log(`  Tree node "${label}" (text "${name}") not visible yet, retrying (attempt ${attempt})...`);
          await page.waitForTimeout(2_000);
        }
        throw new Error(`Tree node "${label}" (text "${name}") never became visible after 5 attempts`);
      }

      async function selectRefNo(refNo: string) {
        const refNoFormItem = page.locator('.ant-form-item').filter({ hasText: /^Ref No/i }).first();
        await refNoFormItem.locator('.ant-select').first().click();
        const refNoDropdown = page.locator('.ant-select-dropdown').locator('visible=true').first();
        await expect(refNoDropdown, 'the Ref No dropdown should list available Component Definitions').toBeVisible({ timeout: 30_000 });
        await page.keyboard.type(refNo);
        await page.waitForTimeout(1_000);
        const refNoOption = refNoDropdown.locator('.ant-select-item-option').filter({ hasText: new RegExp(`^${refNo}$`) }).first();
        await expect(refNoOption, `"${refNo}" should be a selectable Ref No`).toBeVisible({ timeout: 30_000 });
        await refNoOption.click();
        await page.waitForTimeout(1_000);
      }

      async function saveNode(label: string) {
        const savePromise = page
          .waitForResponse((r) => r.request().method() !== 'GET' && /Component/i.test(r.url()), { timeout: 60_000 })
          .catch(() => null);
        const saveBtn = page.locator('.ant-btn, button').filter({ hasText: /^Save$/ }).first();
        await saveBtn.click({ force: true });
        const saveResp = await savePromise;
        console.log(`  Save "${label}" — ${saveResp ? `${saveResp.status()} ${saveResp.url()}` : '(no response observed)'}`);
        expect(saveResp, `saving "${label}" should send a request`).toBeTruthy();
        expect(saveResp!.status(), `saving "${label}" should succeed`).toBeLessThan(400);
        const body = await saveResp!.json().catch(() => null);
        const id: string | null = body?.result?.id ?? null;
        const name: string | null = body?.result?.name ?? null;
        expect(id, `saving "${label}" should return a component id`).toBeTruthy();
        console.log(`  Saved "${label}" as name "${name}" (id ${id}).`);
        await page.waitForTimeout(1_500);
        return { id: id!, name };
      }

      // Navigate to the real, existing "Executive Support" (Sub Programme) node under Princess's tree.
      await expandTreeNodeIfCollapsed(DEPARTMENT_NAME);
      await expandTreeNodeIfCollapsed(PROGRAMME_NAME);
      await selectTreeNode(SUBPROG_NAME, 'Sub Programme');

      // STEP under test: add a KPI node UNDER Sub-Programme via "Add Child Item" (not Add Top Level
      // Item) — per the case owner, this is the one level where Add Child Item is actually used.
      const addChildItem = page.getByText('Add Child Item', { exact: true }).locator('visible=true').first();
      await expect(addChildItem, 'Add Child Item should be reachable').toBeVisible({ timeout: SLOW });
      await addChildItem.click({ force: true });
      await page.waitForTimeout(1_500);

      const kpiTypeOption = page.getByText(/^Quantitative KPI$/i, { exact: false }).locator('visible=true').first();
      const kpiOptionVisible = await kpiTypeOption.isVisible().catch(() => false);
      console.log(`ACTUAL — "Quantitative KPI" offered via Add Child Item under Sub-Programme: ${kpiOptionVisible}.`);
      expect(kpiOptionVisible, 'EXPECTED: Add Child Item under Sub-Programme should offer Quantitative KPI / Qualitative KPI').toBeTruthy();
      await kpiTypeOption.click({ force: true });
      await page.waitForTimeout(1_500);

      // Log all visible form field labels on the KPI node form before assuming field names.
      const formLabels = await page.locator('.ant-form-item-label').allInnerTexts().catch(() => []);
      console.log(`KPI FORM FIELDS — ${JSON.stringify(formLabels)}`);

      await selectRefNo(QKPI_REFNO);

      // STEP 1 (ADO): fill Annual Target and Weighting.
      const annualTargetFormItem = page.locator('.ant-form-item').filter({ hasText: /Annual Target/i }).first();
      const annualTargetVisible = await annualTargetFormItem.isVisible().catch(() => false);
      console.log(`STEP 1 ACTUAL — "Annual Target" field present: ${annualTargetVisible}.`);
      if (annualTargetVisible) {
        const annualTargetInput = annualTargetFormItem.locator('input').first();
        await annualTargetInput.fill(ANNUAL_TARGET_VALUE);
        // Verify the value actually stuck — this project's forms are known to silently clear input
        // during an async remount (e.g. after selecting a Ref No), so a fill() without a follow-up
        // check can look successful in the log while the field is actually empty at save time.
        await expect(annualTargetInput, 'Annual Target should still hold the filled value').toHaveValue(ANNUAL_TARGET_VALUE);
      }

      const weightingFormItem = page.locator('.ant-form-item').filter({ hasText: /Weighting/i }).first();
      const weightingVisible = await weightingFormItem.isVisible().catch(() => false);
      console.log(`STEP 1 ACTUAL — "Weighting" field present: ${weightingVisible}.`);
      let weightingInput = weightingFormItem.locator('input').first();
      if (!weightingVisible) {
        // Fall back to the plain "Weight" field used at other levels, in case the KPI form doesn't
        // literally label it "Weighting".
        const weightFormItem = page.locator('.ant-form-item').filter({ hasText: /^Weight/i }).first();
        weightingInput = weightFormItem.locator('input').first();
        console.log('STEP 1 ACTUAL — falling back to "Weight" field (no literal "Weighting" label found).');
      }
      await weightingInput.fill(WEIGHTING_VALUE);
      await expect(weightingInput, 'Weighting should still hold the filled value').toHaveValue(WEIGHTING_VALUE);
      // Safety net: re-confirm both fields immediately before Save, in case some other async action
      // (unrelated field selection, form remount) cleared them between the fills above and now.
      if (annualTargetVisible) {
        await expect(annualTargetFormItem.locator('input').first(), 'Annual Target should still hold the filled value right before Save').toHaveValue(ANNUAL_TARGET_VALUE);
      }
      await expect(weightingInput, 'Weighting should still hold the filled value right before Save').toHaveValue(WEIGHTING_VALUE);
      console.log(`STEP 1 ACTUAL — Annual Target and Weighting fields accepted input and were confirmed present right before Save.`);

      // STEP 2 (ADO): Save the node.
      const kpi = await saveNode('Quantitative KPI');
      componentIds.push(kpi.id);
      console.log(`STEP 2 ACTUAL — KPI node saved (id ${kpi.id}, name "${kpi.name}").`);

      // STEP 3 (ADO): Verify via Component Crud GetAll that Weighting field is populated.
      const allComponents = await (await page.request.get(`${WF_API}/api/dynamic/Epm/Component/Crud/GetAll?maxResultCount=2000`, { headers: auth })).json();
      const componentsForReport = (allComponents?.result?.items ?? allComponents?.result ?? []).filter((c: any) => c?.performanceReport?.id === PRINCESS_REPORT_ID);
      const kpiRecord = componentsForReport.find((c: any) => c.id === kpi.id);
      console.log(`STEP 3 ACTUAL — KPI full record: ${JSON.stringify(kpiRecord)}`);
      expect(kpiRecord?.perfIndexWeight, 'STEP 3 EXPECTED: the Weighting field should be populated on the persisted Component (perfIndexWeight)').toBe(Number(WEIGHTING_VALUE));
      // Annual Target: confirmed live 2026-08-28 that this KPI form persists the typed value into
      // finalIndicatorTargetText (a string mirror), not the numeric finalIndicatorTarget field, which
      // stays null — assert against whichever field actually holds it, and fail loudly if neither does
      // (rather than only logging, which could silently mask the field never having been filled at all).
      const annualTargetPersisted = kpiRecord?.finalIndicatorTargetText ?? (kpiRecord?.finalIndicatorTarget != null ? String(kpiRecord.finalIndicatorTarget) : null);
      console.log(`STEP 3 ACTUAL — perfIndexWeight: ${kpiRecord?.perfIndexWeight}, finalIndicatorTarget: ${kpiRecord?.finalIndicatorTarget}, finalIndicatorTargetText: ${kpiRecord?.finalIndicatorTargetText}.`);
      expect(annualTargetPersisted, 'STEP 3 EXPECTED: the Annual Target value should be populated on the persisted Component (finalIndicatorTarget or finalIndicatorTargetText)').toBe(ANNUAL_TARGET_VALUE);
    } finally {
      // Only the newly-added KPI is disposable — Princess's own Department/Administration/Executive
      // Support nodes are permanent fixtures for this and future tests, never deleted here.
      for (const cid of [...componentIds].reverse()) {
        const cleanup = await page.request.delete(`${WF_API}/api/dynamic/Epm/Component/Crud/Delete?id=${cid}`, { headers: auth }).catch(() => null);
        console.log(`CLEANUP — removed disposable KPI component ${cid}: ${cleanup ? cleanup.status() : 'request failed'}`);
      }
    }
  });
});
