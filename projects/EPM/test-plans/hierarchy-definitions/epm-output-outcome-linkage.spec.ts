import { test, expect } from '@playwright/test';

// ADO TC-108782 (plan 108745, suite 06 · EPM · Output and Outcome linkage — planning-only Components
// without Performance Report identifier. secondaryComponentRefId / tertiaryComponentRefId). Positive:
// create an Output Component and an Outcome Component (both planning-only, no Performance Report),
// then link them onto an existing KPI's Output/Outcome fields and confirm the underlying
// secondaryComponentRef / tertiaryComponentRef references persist.
//
// Confirmed live 2026-08-18: Output/Outcome Components are created via a dedicated "Outputs and
// Outcomes" management page (EPM Administration > Outputs & Outcomes, route
// /dynamic/Epm/components) — NOT via the Reporting Tree builder. All 26 existing real catalog entries
// there already have performanceReport: null, confirming this is the correct, real creation path for
// "planning-only" Output/Outcome Components. Uses the real existing KPI on the "Princess" report
// ("Percentage compliance with statutory prescripts") for Step 4, per the case owner's established
// direction this session (Department seeding via the tree builder is blocked — see
// epm-department-refno-search-broken-dangling-componenttype-id memory). Per explicit case-owner
// approval, this creates two new PERMANENT catalog entries (matching ADO's literal names) and leaves
// them linked on the real KPI afterward — not disposable, not cleaned up.

const BASE = 'https://pd-epm-adminportal-qa-wf.shesha.app';
const WF_API = 'https://pd-epm-api-qa-wf.shesha.app';

const OUTPUT_NAME = 'Increase in service delivery reach';
const OUTCOME_NAME = 'Improved public service quality';

const SLOW = 420_000;
const RAW_CHANNEL = process.env.PW_CHANNEL === undefined ? 'chrome' : process.env.PW_CHANNEL;
const CHANNEL = RAW_CHANNEL === '' || RAW_CHANNEL === 'chromium' ? undefined : RAW_CHANNEL;

test.use({
  channel: CHANNEL,
  viewport: { width: 1920, height: 1080 },
  actionTimeout: 30_000,
  navigationTimeout: 120_000,
});

test.describe('EPM — Output/Outcome linkage (ADO plan 108745 / suite 06)', () => {
  test('TC-108782 Positive — Output/Outcome Components link onto a KPI via secondaryComponentRef/tertiaryComponentRef', async ({ page }) => {
    test.setTimeout(600_000);

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

    const epmItem = page.locator('.ant-menu').getByText('EPM', { exact: true }).locator('visible=true').first();
    await expect(epmItem).toBeVisible({ timeout: SLOW });
    await epmItem.click({ force: true });
    await page.waitForTimeout(2_500);
    const epmAdmin = page.getByText('EPM Administration', { exact: true }).locator('visible=true').first();
    await expect(epmAdmin).toBeVisible({ timeout: 60_000 });
    await epmAdmin.hover({ force: true });
    await page.waitForTimeout(2_500);
    const outputsLink = page.getByText('Outputs & Outcomes', { exact: true }).locator('visible=true').first();
    await expect(outputsLink, 'an Outputs & Outcomes link should exist').toBeVisible({ timeout: 30_000 });
    await outputsLink.click({ force: true });
    await expect(page.locator('.ant-spin-spinning')).toHaveCount(0, { timeout: SLOW });
    await page.waitForTimeout(1_500);

    async function createOutputOrOutcome(name: string, typeName: 'Output' | 'Outcome') {
      const addBtn = page.locator('.ant-btn, button').filter({ hasText: /Add|New|Create/i }).first();
      await expect(addBtn, 'an Add action should exist').toBeVisible({ timeout: SLOW });
      await addBtn.click({ force: true });
      await page.waitForTimeout(1_500);
      const modal = page.locator('.ant-modal-content').first();
      await expect(modal, 'the Add New Outcome or Output modal should open').toBeVisible({ timeout: SLOW });

      const nameField = modal.locator('.ant-form-item').filter({ hasText: /^Name/i }).first().getByRole('textbox').first();
      await nameField.fill(name);
      const descField = modal.locator('.ant-form-item').filter({ hasText: /^Description/i }).first().getByRole('textbox').first();
      await descField.fill(`${typeName} "${name}" — created for TC-108782.`);

      const typeFormItem = modal.locator('.ant-form-item').filter({ hasText: /Select component type/i }).first();
      await typeFormItem.locator('.ant-select').first().click();
      await page.waitForTimeout(500);
      await page.keyboard.type(typeName);
      await page.waitForTimeout(1_000);
      const typeOption = page.locator('.ant-select-dropdown').locator('visible=true').first().locator('.ant-select-item-option').filter({ hasText: new RegExp(`^${typeName}$`) }).first();
      await expect(typeOption, `"${typeName}" should be a selectable Component Type`).toBeVisible({ timeout: 30_000 });
      await typeOption.click();
      await page.waitForTimeout(1_000);

      const createResponsePromise = page
        .waitForResponse((r) => r.request().method() !== 'GET' && /Component/i.test(r.url()), { timeout: 60_000 })
        .catch(() => null);
      const createBtn = modal.locator('.ant-btn, button').filter({ hasText: /^Create$|^Save$/ }).first();
      await createBtn.click({ force: true });
      const createResp = await createResponsePromise;
      console.log(`  Create "${name}" (${typeName}) — ${createResp ? `${createResp.status()} ${createResp.url()}` : '(no response observed)'}.`);
      expect(createResp, `creating "${name}" should send a request`).toBeTruthy();
      expect(createResp!.status(), `creating "${name}" should succeed`).toBeLessThan(400);
      const body = await createResp!.json().catch(() => null);
      const id: string | null = body?.result?.id ?? null;
      expect(id, `creating "${name}" should return a component id`).toBeTruthy();
      console.log(`  Created "${name}" (id ${id}).`);
      await page.waitForTimeout(1_500);
      return id!;
    }

    // STEP 1 (ADO): Create an Output Component. Confirm no performanceReportId is set.
    const outputId = await createOutputOrOutcome(OUTPUT_NAME, 'Output');
    // STEP 2 (ADO): Create an Outcome Component.
    const outcomeId = await createOutputOrOutcome(OUTCOME_NAME, 'Outcome');

    const compResp = await (await page.request.get(`${WF_API}/api/dynamic/Epm/Component/Crud/GetAll?maxResultCount=2000`, { headers: auth })).json();
    const compItems = compResp?.result?.items ?? compResp?.result ?? [];
    const outputRecord = compItems.find((c: any) => c.id === outputId);
    const outcomeRecord = compItems.find((c: any) => c.id === outcomeId);
    console.log(`STEP 1 ACTUAL — Output record performanceReport: ${JSON.stringify(outputRecord?.performanceReport)}.`);
    console.log(`STEP 2 ACTUAL — Outcome record performanceReport: ${JSON.stringify(outcomeRecord?.performanceReport)}.`);
    expect(outputRecord?.performanceReport, 'STEP 1 EXPECTED: the Output Component should have performanceReport null').toBeNull();
    expect(outcomeRecord?.performanceReport, 'STEP 2 EXPECTED: the Outcome Component should have performanceReport null').toBeNull();

    // STEP 3 (ADO): Open a KPI Component and set secondaryComponentRefId to the Outcome and
    // tertiaryComponentRefId to the Output. Save.
    const mprLink = page.getByText('Manage Performance Reports', { exact: true }).locator('visible=true').first();
    await epmItem.click({ force: true });
    await page.waitForTimeout(2_500);
    await epmAdmin.hover({ force: true });
    await page.waitForTimeout(2_500);
    await expect(mprLink).toHaveAttribute('href', '/dynamic/Epm/perfomance-report-v2');
    await mprLink.click({ force: true });
    await expect(page).toHaveURL(/\/dynamic\/Epm\/perfomance-report-v2$/, { timeout: SLOW });
    await expect(page.locator('.ant-spin-spinning')).toHaveCount(0, { timeout: SLOW });
    await page.waitForTimeout(1_500);

    const row = page.locator('[role="row"]', { hasText: 'Princess' }).first();
    await expect(row, 'a report matching "Princess" should be visible').toBeVisible({ timeout: SLOW });
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
      while (count > 0 && rounds < 10) {
        for (let i = 0; i < count; i++) {
          await switchers.nth(0).click({ force: true }).catch(() => null);
          await page.waitForTimeout(400);
        }
        rounds++;
        count = await switchers.count();
      }
    }
    await expandAllVisibleSwitchers();

    const kpiNode = page.locator('.ant-tree-treenode', { hasText: 'Percentage compliance with statutory prescripts' }).locator('visible=true').first();
    await expect(kpiNode, 'the KPI node should be reachable').toBeVisible({ timeout: SLOW });
    await kpiNode.click({ force: true });
    await expect(page.locator('.ant-spin-spinning, .ant-spin-dot-spin')).toHaveCount(0, { timeout: 30_000 }).catch(() => null);
    await page.waitForTimeout(2_000);

    const kpiKpaTab = page.locator('.ant-tabs-tab', { hasText: /KPI\/KPA/i }).locator('visible=true').first();
    await expect(kpiKpaTab, 'the KPI/KPA tab should exist').toBeVisible({ timeout: SLOW });
    await kpiKpaTab.click({ force: true });
    await page.waitForTimeout(1_500);

    async function selectRefField(labelRegex: RegExp, searchText: string) {
      const formItem = page.locator('.ant-form-item').filter({ hasText: labelRegex }).first();
      await formItem.locator('.ant-select').first().click();
      const dropdown = page.locator('.ant-select-dropdown').locator('visible=true').first();
      await expect(dropdown, `dropdown for "${searchText}" should open`).toBeVisible({ timeout: 30_000 });
      await page.keyboard.type(searchText);
      await page.waitForTimeout(1_000);
      const option = dropdown.locator('.ant-select-item-option').filter({ hasText: new RegExp(searchText.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')) }).first();
      await expect(option, `"${searchText}" should be a selectable option`).toBeVisible({ timeout: 30_000 });
      await option.click();
      await page.waitForTimeout(1_000);
    }

    await selectRefField(/^Outcome/i, OUTCOME_NAME);
    await selectRefField(/^Output/i, OUTPUT_NAME);

    const outerSavePromise = page
      .waitForResponse((r) => r.request().method() !== 'GET' && /Component/i.test(r.url()), { timeout: 60_000 })
      .catch(() => null);
    const outerSaveBtn = page.locator('.ant-btn, button').filter({ hasText: /^Save$/ }).first();
    await outerSaveBtn.click({ force: true });
    const outerSaveResp = await outerSavePromise;
    console.log(`STEP 3 ACTUAL — outer Save request: ${outerSaveResp ? `${outerSaveResp.status()} ${outerSaveResp.url()}` : '(no response observed)'}.`);
    expect(outerSaveResp, 'STEP 3 EXPECTED: the outer Save should send a request').toBeTruthy();
    expect(outerSaveResp!.status(), 'STEP 3 EXPECTED: the outer Save should succeed').toBeLessThan(400);
    const saveBody = await outerSaveResp!.json().catch(() => null);
    const kpiComponentId: string | null = saveBody?.result?.id ?? null;
    console.log(`STEP 3 ACTUAL — KPI Component id: ${kpiComponentId}.`);
    await page.waitForTimeout(1_500);

    // STEP 3 EXPECTED (ADO): the KPI record persists the two references.
    const compResp2 = await (await page.request.get(`${WF_API}/api/dynamic/Epm/Component/Crud/GetAll?maxResultCount=2000`, { headers: auth })).json();
    const compItems2 = compResp2?.result?.items ?? compResp2?.result ?? [];
    const kpiRecord = compItems2.find((c: any) => c.id === kpiComponentId);
    console.log(`STEP 3 ACTUAL — full KPI record: ${JSON.stringify(kpiRecord)}`);
    console.log(`STEP 3 ACTUAL — secondaryComponentRef: ${JSON.stringify(kpiRecord?.secondaryComponentRef)}, tertiaryComponentRef: ${JSON.stringify(kpiRecord?.tertiaryComponentRef)}.`);

    expect(kpiRecord?.secondaryComponentRef?.id, 'STEP 3 EXPECTED: secondaryComponentRef should reference the Outcome').toBe(outcomeId);
    expect(kpiRecord?.tertiaryComponentRef?.id, 'STEP 3 EXPECTED: tertiaryComponentRef should reference the Output').toBe(outputId);
  });
});
