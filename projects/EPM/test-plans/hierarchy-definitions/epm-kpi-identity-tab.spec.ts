import { test, expect } from '@playwright/test';

// ADO TC-109457 (plan 108745, suite 10 · EPM · KPI/KPA identity tab — Method of Calculation, Reporting
// Cycle, Aggregation, Weighting). Positive: with a KPI record open, confirm Method of Calculation,
// Reporting Cycle, Aggregation Type, and Cumulative flag fields are visible, set values, Save, and
// verify persistence.
//
// CORRECTED 2026-08-18 (case owner correction): these fields live on the **Component Definition**
// ("Component Defintions" — sic, app has a typo) details/create view, in its "Calculation Details"
// section — NOT on the Component's own "KPI/KPA" tab reached via the Reporting Tree planning page,
// which was this spec's original (wrong) target. Confirmed live by opening QKPI_1 ("Percentage
// compliance with statutory prescripts"): its Component Definition details view has a real, populated
// "Method Of Calculation" field. The Component's KPI/KPA tab (tree-based) genuinely has no such field —
// see epm-kpi-kpa-identity-tab-fields-missing memory, which remains accurate for THAT tab, just
// mis-attributed to this ADO case.

const BASE = 'https://pd-epm-adminportal-qa-wf.shesha.app';
const WF_API = 'https://pd-epm-api-qa-wf.shesha.app';

const TOKEN = process.env.TC109457_TOKEN || `TC109457-${Date.now()}`;
const SHORT = TOKEN.replace(/\D/g, '').slice(-6);
const CD_NAME = `KPI CD Test ${SHORT}`;
const METHOD_OF_CALC_VALUE = 'Number of items completed divided by total items, multiplied by 100';

const SLOW = 420_000;
const RAW_CHANNEL = process.env.PW_CHANNEL === undefined ? 'chrome' : process.env.PW_CHANNEL;
const CHANNEL = RAW_CHANNEL === '' || RAW_CHANNEL === 'chromium' ? undefined : RAW_CHANNEL;

test.use({
  channel: CHANNEL,
  viewport: { width: 1920, height: 1080 },
  actionTimeout: 30_000,
  navigationTimeout: 120_000,
});

test.describe('EPM — KPI Component Definition Calculation Details (ADO plan 108745 / suite 10)', () => {
  test('TC-109457 Positive — Calculation Details section exposes and persists Method of Calculation (Reporting Cycle/Aggregation Type/Cumulative checked for existence)', async ({ page }) => {
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

    let cdId: string | null = null;
    try {
      const epmItem = page.locator('.ant-menu').getByText('EPM', { exact: true }).locator('visible=true').first();
      await expect(epmItem).toBeVisible({ timeout: SLOW });
      await epmItem.click({ force: true });
      await page.waitForTimeout(2_500);
      const epmAdmin = page.getByText('EPM Administration', { exact: true }).locator('visible=true').first();
      await expect(epmAdmin).toBeVisible({ timeout: 60_000 });
      await epmAdmin.hover({ force: true });
      await page.waitForTimeout(2_500);
      // Real menu label confirmed live: "Component Defintions" (sic — app has this typo).
      const cdLink = page.getByText(/Component Defin/i, { exact: false }).locator('visible=true').first();
      await expect(cdLink, 'a Component Definitions link should exist in the flyout').toBeVisible({ timeout: 30_000 });
      await cdLink.click({ force: true });
      await expect(page.locator('.ant-spin-spinning')).toHaveCount(0, { timeout: SLOW });
      await page.waitForTimeout(1_500);

      const addBtn = page.locator('.ant-btn, button').filter({ hasText: /Add|New|Create/i }).first();
      await expect(addBtn, 'an Add action should exist on the Component Definitions grid').toBeVisible({ timeout: SLOW });
      await addBtn.click({ force: true });
      await page.waitForTimeout(1_500);

      // Fill Name/Description (required at create time regardless of type).
      const nameField = page.locator('.ant-form-item').filter({ hasText: /^Name/i }).first().getByRole('textbox').first();
      await nameField.fill(CD_NAME);
      const descField = page.locator('.ant-form-item').filter({ hasText: /^Description/i }).first().getByRole('textbox').first();
      await descField.fill('Disposable KPI Component Definition for TC-109457.');

      // Select Component Type = Quantitative KPI — this dynamically reveals the Calculation Details /
      // Additional Information sections (confirmed live: absent before this selection).
      const componentTypeFormItem = page.locator('.ant-form-item').filter({ hasText: /^Component Type/i }).first();
      await componentTypeFormItem.locator('.ant-select').first().click();
      await page.waitForTimeout(500);
      await page.keyboard.type('Quantitative KPI');
      await page.waitForTimeout(1_000);
      const ctOption = page.locator('.ant-select-dropdown').locator('visible=true').first().locator('.ant-select-item-option').filter({ hasText: /^Quantitative KPI$/ }).first();
      await expect(ctOption, 'Quantitative KPI should be a selectable Component Type').toBeVisible({ timeout: 30_000 });
      await ctOption.click();
      await page.waitForTimeout(1_500);

      const fieldLabels = await page.locator('.ant-form-item-label').allInnerTexts().catch(() => []);
      console.log(`STEP 1 DEBUG — Component Definition create form fields after selecting Quantitative KPI: ${JSON.stringify(fieldLabels)}`);

      // STEP 1 (ADO): confirm Method of Calculation is visible; check Reporting Cycle / Aggregation
      // Type / Cumulative too (soft, since these were already confirmed absent from the Component's
      // own KPI/KPA tab — checking here in case they live only on the Component Definition instead).
      const targetFields = ['Method Of Calculation', 'Reporting Cycle', 'Aggregation Type', 'Cumulative'];
      const presence: Record<string, boolean> = {};
      for (const fieldName of targetFields) {
        const fieldItem = page.locator('.ant-form-item').filter({ hasText: new RegExp(fieldName, 'i') }).first();
        const visible = await fieldItem.isVisible().catch(() => false);
        presence[fieldName] = visible;
        console.log(`STEP 1 ACTUAL — "${fieldName}" field present on the Component Definition create form: ${visible}.`);
      }
      expect(presence['Method Of Calculation'], 'STEP 1 EXPECTED: Method of Calculation should be visible on the Component Definition create form').toBeTruthy();
      expect.soft(presence['Reporting Cycle'], `STEP 1 EXPECTED (per ADO): "Reporting Cycle" should exist somewhere on the KPI identity form — CONFIRMED GAP if false: real fields are ${JSON.stringify(fieldLabels)}`).toBeTruthy();
      expect.soft(presence['Aggregation Type'], `STEP 1 EXPECTED (per ADO): "Aggregation Type" should exist somewhere on the KPI identity form — CONFIRMED GAP if false: real fields are ${JSON.stringify(fieldLabels)}`).toBeTruthy();
      expect.soft(presence['Cumulative'], `STEP 1 EXPECTED (per ADO): "Cumulative" should exist somewhere on the KPI identity form — CONFIRMED GAP if false: real fields are ${JSON.stringify(fieldLabels)}`).toBeTruthy();

      // Fill Unit Of Measure (not marked required at create time, but confirmed elsewhere that leaving
      // it blank can silently block Save on this entity — fill defensively).
      const uomFormItem = page.locator('.ant-form-item').filter({ hasText: /^Unit Of Measure/i }).first();
      const uomSelect = uomFormItem.locator('.ant-select').first();
      const uomVisible = await uomSelect.isVisible().catch(() => false);
      if (uomVisible) {
        await uomSelect.click();
        await page.waitForTimeout(500);
        const uomDropdown = page.locator('.ant-select-dropdown').locator('visible=true').first();
        const firstUomOption = uomDropdown.locator('.ant-select-item-option').first();
        await expect(firstUomOption, 'at least one Unit Of Measure option should exist').toBeVisible({ timeout: 15_000 });
        await firstUomOption.click();
        await page.waitForTimeout(500);
      }

      // STEP 2 (ADO): set Method of Calculation and Save.
      const methodOfCalcField = page.locator('.ant-form-item').filter({ hasText: /Method Of Calculation/i }).first().getByRole('textbox').first();
      await methodOfCalcField.fill(METHOD_OF_CALC_VALUE);
      console.log('STEP 2 ACTUAL — Method Of Calculation field accepted input.');

      const createResponsePromise = page
        .waitForResponse((r) => r.request().method() !== 'GET' && /ComponentDefinition/i.test(r.url()), { timeout: 60_000 })
        .catch(() => null);
      const saveBtn = page.locator('.ant-btn, button').filter({ hasText: /^Save$|^Create$/ }).first();
      await saveBtn.click({ force: true });
      const createResp = await createResponsePromise;
      console.log(`STEP 2 ACTUAL — Save request: ${createResp ? `${createResp.status()} ${createResp.url()}` : '(no response observed)'}`);
      expect(createResp, 'STEP 2 EXPECTED: saving the Component Definition should send a request').toBeTruthy();
      expect(createResp!.status(), 'STEP 2 EXPECTED: saving the Component Definition should succeed').toBeLessThan(400);
      const body = await createResp!.json().catch(() => null);
      cdId = body?.result?.id ?? null;
      expect(cdId, 'STEP 2 EXPECTED: a Component Definition id should be returned').toBeTruthy();
      console.log(`STEP 2 ACTUAL — Component Definition created (id ${cdId}).`);

      // STEP 3 (ADO): verify persistence via GetAll.
      const getAllResp = await (await page.request.get(`${WF_API}/api/dynamic/Epm/ComponentDefinition/Crud/GetAll?maxResultCount=2000`, { headers: auth })).json();
      const items = getAllResp?.result?.items ?? getAllResp?.result ?? [];
      const record = items.find((cd: any) => cd.id === cdId);
      console.log(`STEP 3 ACTUAL — persisted record: ${JSON.stringify(record)}`);
      expect(record?.methodOfCalculation, 'STEP 3 EXPECTED: Method Of Calculation should persist and be retrievable via GetAll').toBe(METHOD_OF_CALC_VALUE);
    } finally {
      if (cdId) {
        const cleanup = await page.request.delete(`${WF_API}/api/dynamic/Epm/ComponentDefinition/Crud/Delete?id=${cdId}`, { headers: auth }).catch(() => null);
        console.log(`CLEANUP — removed disposable Component Definition ${cdId}: ${cleanup ? cleanup.status() : 'request failed'}`);
      }
    }
  });
});
