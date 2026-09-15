import { test, expect } from '@playwright/test';

// ADO TC-108783 (plan 108745, suite 07 · EPM · Component Actioner assignment — Stages 1 to 5 with
// action level 20 to 60). Positive: open a KPI with an empty Component Actioners tab, add five rows
// (Stage 1@20 through Stage 5@60), Save, and verify via ComponentActioner/Crud/GetAll filtered by
// componentId that exactly 5 rows persist with the correct action levels and Stage 6 is absent.
//
// Confirmed live 2026-08-18 via ComponentActioner/Crud/GetAll: the six real Person "actioner" records
// per stage already exist (matching ADO's precondition), with names and existing tenant-wide
// action-level usage confirming the mapping:
//   Stage 1 -> "Stage 1 Process Owner" (20), Stage 2 -> "Stage 2 Chief Director" (30),
//   Stage 3 -> "Stage 3 Branch Coordinator" (40), Stage 4 -> "Stage 4 Branch Manager" (50),
//   Stage 5 -> "Stage 5 SPMR Unit" (60).
//
// CORRECTED 2026-08-31 (per case owner): the "Actioner Level" dropdown's workflow/QA-status-looking
// labels are NOT wrong reference data — they ARE the correct picks, one per stage:
//   Stage 1 -> "Outstanding", Stage 2 -> "Awaiting Level One QA", Stage 3 -> "Awaiting Level Two QA",
//   Stage 4 -> "Awaiting Level Three QA", Stage 5 -> "Awaiting Level Four QA".
// The earlier "confirmed defect" (epm-component-actioner-level-wrong-reference-data memory) typed the
// raw NUMBER (20/30/40/50/60) into this label-based select, which naturally matched nothing — that was
// the test's own mistake, not an app defect. Select the correct label per stage instead, then verify the
// persisted actionLevel is the expected number (confirming the label->integer mapping works correctly).
//
// Original target KPI's report ("Nomfa") is now soft-deleted — switched to the real, live "Princess"
// report's own KPI ("Percentage compliance with statutory prescripts"), confirmed via GetAll to have
// zero existing ComponentActioner rows.

const BASE = 'https://pd-epm-adminportal-qa-wf.shesha.app';
const WF_API = 'https://pd-epm-api-qa-wf.shesha.app';
const KPI_ID = '872d922d-9184-412b-8226-3dfe38a07b3f';
const KPI_NAME = 'Percentage compliance with statutory prescripts';
const REPORT_NAME = 'Princess';

const STAGE_ACTIONERS = [
  { stageLabel: 'Stage 1', actionerName: 'Stage 1 Process Owner', levelLabel: 'Outstanding', level: 20 },
  { stageLabel: 'Stage 2', actionerName: 'Stage 2 Chief Director', levelLabel: 'Awaiting Level One QA', level: 30 },
  { stageLabel: 'Stage 3', actionerName: 'Stage 3 Branch Coordinator', levelLabel: 'Awaiting Level Two QA', level: 40 },
  { stageLabel: 'Stage 4', actionerName: 'Stage 4 Branch Manager', levelLabel: 'Awaiting Level Three QA', level: 50 },
  { stageLabel: 'Stage 5', actionerName: 'Stage 5 SPMR Unit', levelLabel: 'Awaiting Level Four QA', level: 60 },
];

const SLOW = 420_000;
const RAW_CHANNEL = process.env.PW_CHANNEL === undefined ? 'chrome' : process.env.PW_CHANNEL;
const CHANNEL = RAW_CHANNEL === '' || RAW_CHANNEL === 'chromium' ? undefined : RAW_CHANNEL;

test.use({
  channel: CHANNEL,
  viewport: { width: 1920, height: 1080 },
  actionTimeout: 30_000,
  navigationTimeout: 120_000,
});

test.describe('EPM — Component Actioner assignment (ADO plan 108745 / suite 07)', () => {
  test('TC-108783 Positive — Assign Component Actioners for Stages 1 to 5 with the correct action level', async ({ page }) => {
    test.setTimeout(900_000);

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
    const auth = { Authorization: `Bearer ${token}` };

    // PRECONDITION: confirm this KPI's Component Actioners tab is genuinely empty.
    const caRespBefore = await (await page.request.get(`${WF_API}/api/dynamic/Epm/ComponentActioner/Crud/GetAll?maxResultCount=2000`, { headers: auth })).json();
    const caItemsBefore = caRespBefore?.result?.items ?? caRespBefore?.result ?? [];
    const existingForKpi = caItemsBefore.filter((r: any) => r?.component?.id === KPI_ID);
    console.log(`PRECONDITION ACTUAL — existing ComponentActioner rows for this KPI: ${existingForKpi.length}.`);
    expect(existingForKpi.length, 'PRECONDITION EXPECTED: the Component Actioners tab should start empty').toBe(0);

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

    // List is paginated — search rather than assume page 1.
    const searchInput = page.locator('.ant-input-search input, .ant-input-affix-wrapper input').first();
    await searchInput.fill(REPORT_NAME);
    await searchInput.press('Enter');
    await page.waitForTimeout(1_500);
    const row = page.locator('[role="row"]').filter({ has: page.getByText(REPORT_NAME, { exact: true }) }).first();
    await expect(row, `the exact "${REPORT_NAME}" report row should be visible`).toBeVisible({ timeout: SLOW });
    const detailsLink = row.locator('a[href*="performance-report-details-view"]').first();
    await detailsLink.click({ force: true });
    await expect(page.locator('.ant-spin-spinning')).toHaveCount(0, { timeout: SLOW });
    await page.waitForTimeout(1_500);

    const buildTreeBtn = page.locator('.ant-btn, button, a').filter({ hasText: 'Build Tree' }).first();
    await expect(buildTreeBtn).toBeVisible({ timeout: SLOW });
    for (let attempt = 1; attempt <= 5; attempt++) {
      await buildTreeBtn.click({ force: true });
      const navigated = await page.waitForURL(/performance-report-planning-page/, { timeout: 15_000 }).then(() => true).catch(() => false);
      if (navigated) break;
      if (attempt === 5) throw new Error('Build Tree click never navigated after 5 attempts');
    }
    await expect(page.locator('.ant-spin-spinning')).toHaveCount(0, { timeout: SLOW });
    await page.waitForTimeout(1_500);

    async function expandAllVisibleSwitchers() {
      const switchers = page.locator('.ant-tree-switcher.ant-tree-switcher_close').locator('visible=true');
      let count = await switchers.count();
      let rounds = 0;
      while (count > 0 && rounds < 15) {
        for (let i = 0; i < count; i++) {
          await switchers.nth(0).click({ force: true }).catch(() => null);
          await page.waitForTimeout(400);
        }
        rounds++;
        count = await switchers.count();
      }
    }
    await expandAllVisibleSwitchers();

    const kpiNode = page.locator('.ant-tree-treenode', { hasText: KPI_NAME }).locator('visible=true').first();
    await expect(kpiNode, 'the KPI node should be reachable').toBeVisible({ timeout: SLOW });
    await kpiNode.click({ force: true });
    await expect(page.locator('.ant-spin-spinning, .ant-spin-dot-spin')).toHaveCount(0, { timeout: 30_000 }).catch(() => null);
    await page.waitForTimeout(2_000);

    // STEP 1 (ADO): Navigate to the Component Actioners tab. EXPECTED: empty.
    const caTab = page.locator('.ant-tabs-tab', { hasText: /Component Actioners/i }).locator('visible=true').first();
    await expect(caTab, 'the Component Actioners tab should exist').toBeVisible({ timeout: SLOW });
    await caTab.click({ force: true });
    await page.waitForTimeout(1_500);
    await expect(page.locator('.ant-spin-spinning')).toHaveCount(0, { timeout: SLOW });

    const gridPanel = page.locator('.ant-tabs-tabpane-active, .ant-tabs-content-holder').last();
    const initialDataRows = gridPanel.locator('[role="row"]').filter({ hasNotText: /^Actioner/ });
    const initialRowCount = await initialDataRows.count().catch(() => 0);
    console.log(`STEP 1 ACTUAL — data rows visible on Component Actioners tab before adding any: ${initialRowCount}.`);

    // STEP 2 (ADO): Add five Component Actioner rows.
    for (const { actionerName, level, levelLabel, stageLabel } of STAGE_ACTIONERS) {
      // Scope strictly to the Component Actioners grid's own "Add" action — the page also has an
      // unrelated "Add Top Level Item" toolbar button whose text contains "Add" too.
      const addBtn = gridPanel.locator('.ant-btn, button').filter({ hasText: /^Add$/ }).first();
      await expect(addBtn, `an Add action should exist on the Component Actioners grid (${stageLabel})`).toBeVisible({ timeout: SLOW });
      await addBtn.click({ force: true });
      await page.waitForTimeout(1_500);

      const modal = page.locator('.ant-modal').locator('visible=true').first();
      const modalVisible = await modal.isVisible().catch(() => false);
      const formScope = modalVisible ? modal : gridPanel;

      const actionerFormItem = formScope.locator('.ant-form-item').filter({ hasText: /^Actioner/i }).first();
      await actionerFormItem.locator('.ant-select').first().click();
      await page.waitForTimeout(500);
      await page.keyboard.type(actionerName);
      await page.waitForTimeout(1_000);
      const dropdown = page.locator('.ant-select-dropdown').locator('visible=true').first();
      const option = dropdown.locator('.ant-select-item-option').filter({ hasText: actionerName }).first();
      await expect(option, `"${actionerName}" should be a selectable Actioner`).toBeVisible({ timeout: 30_000 });
      await option.click();
      await page.waitForTimeout(1_000);

      // CORRECTED 2026-08-31: "Actioner Level" is a searchable select whose labels ARE the correct
      // reference data — select the label matching this stage (see the mapping in the header comment),
      // not the raw number. The persisted actionLevel is verified numerically in STEP 3.
      const levelFormItem = formScope.locator('.ant-form-item').filter({ hasText: /Actioner Level/i }).first();
      await levelFormItem.locator('.ant-select').first().click();
      await page.waitForTimeout(500);
      await page.keyboard.type(levelLabel);
      await page.waitForTimeout(1_000);
      const levelDropdown = page.locator('.ant-select-dropdown').locator('visible=true').first();
      const levelOption = levelDropdown.locator('.ant-select-item-option').filter({ hasText: new RegExp(`^${levelLabel}$`) }).first();
      const levelOptionVisible = await levelOption.isVisible({ timeout: 10_000 }).catch(() => false);
      console.log(`STEP 2 ACTUAL — "${levelLabel}" selectable as Actioner Level (${stageLabel}, expected numeric ${level}): ${levelOptionVisible}.`);
      expect(levelOptionVisible, `STEP 2 EXPECTED: "${levelLabel}" should be a selectable Actioner Level (${stageLabel})`).toBeTruthy();
      await levelOption.click();
      await page.waitForTimeout(1_000);

      const saveOrOkBtn = formScope.locator('.ant-btn, button').filter({ hasText: /^OK$|^Save$/ }).first();
      const savePromise = page
        .waitForResponse((r) => r.request().method() !== 'GET' && /ComponentActioner|Component/i.test(r.url()), { timeout: 30_000 })
        .catch(() => null);
      await saveOrOkBtn.click({ force: true });
      const saveResp = await savePromise;
      console.log(`STEP 2 ACTUAL — ${stageLabel} save request: ${saveResp ? `${saveResp.status()} ${saveResp.url()}` : '(no response observed)'}.`);
      await page.waitForTimeout(1_500);
    }

    // If there's an outer Save on the tab/panel (beyond each row's own OK), click it too.
    const outerSaveBtn = gridPanel.locator('.ant-btn, button').filter({ hasText: /^Save$/ }).first();
    const outerSaveVisible = await outerSaveBtn.isVisible().catch(() => false);
    if (outerSaveVisible) {
      const outerSavePromise = page
        .waitForResponse((r) => r.request().method() !== 'GET' && /Component/i.test(r.url()), { timeout: 30_000 })
        .catch(() => null);
      await outerSaveBtn.click({ force: true });
      const outerSaveResp = await outerSavePromise;
      console.log(`STEP 2 ACTUAL — outer Save on Component Actioners tab: ${outerSaveResp ? `${outerSaveResp.status()} ${outerSaveResp.url()}` : '(no response observed)'}.`);
    }
    await page.waitForTimeout(1_500);

    // STEP 3 (ADO): Verify via ComponentActioner GetAll filtered by componentId.
    const caRespAfter = await (await page.request.get(`${WF_API}/api/dynamic/Epm/ComponentActioner/Crud/GetAll?maxResultCount=2000`, { headers: auth })).json();
    const caItemsAfter = caRespAfter?.result?.items ?? caRespAfter?.result ?? [];
    const rowsForKpi = caItemsAfter.filter((r: any) => r?.component?.id === KPI_ID);
    console.log(`STEP 3 ACTUAL — ${rowsForKpi.length} ComponentActioner rows for this KPI: ${JSON.stringify(rowsForKpi.map((r: any) => ({ actioner: r.actioner?._displayName, level: r.actionLevel })))}`);
    expect(rowsForKpi.length, 'STEP 3 EXPECTED: exactly 5 rows should be returned').toBe(5);

    const levelsFound = rowsForKpi.map((r: any) => r.actionLevel).sort((a: number, b: number) => a - b);
    console.log(`STEP 3 ACTUAL — actionLevel values persisted: ${JSON.stringify(levelsFound)}.`);
    expect(levelsFound, 'STEP 3 EXPECTED: action levels 20,30,40,50,60 should all be present, correctly mapped from the selected labels').toEqual([20, 30, 40, 50, 60]);
    expect(levelsFound, 'STEP 3 EXPECTED: Stage 6 (level 70) should NOT be present regardless').not.toContain(70);
    console.log('DONE — all 5 Component Actioner rows persisted with the correct numeric action levels.');
  });
});
