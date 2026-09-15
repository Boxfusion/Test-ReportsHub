import { test, expect } from '@playwright/test';

// ADO TC-109458 (plan 108745, suite 10 · EPM · KPI/KPA identity tab — Method of Calculation, Reporting
// Cycle, Aggregation, Weighting). Negative: with the Method of Calculation field open (on a KPI
// Component Definition), clear it and Save — expect a validation error; then enter a value and Save —
// expect success.
//
// REBUILT 2026-08-18 after the case-owner correction on TC-109457: "Method of Calculation" lives on the
// Component Definition ("Component Defintions" — sic) create/details view, in its Calculation Details
// section — NOT the Component's tree-based KPI/KPA tab this spec originally (wrongly) targeted. See
// epm-kpi-kpa-identity-tab-fields-missing memory. That earlier version's "field doesn't exist, test
// blocked" result was a false negative from testing the wrong entity, not a real finding.

const BASE = 'https://pd-epm-adminportal-qa-wf.shesha.app';
const WF_API = 'https://pd-epm-api-qa-wf.shesha.app';

const TOKEN = process.env.TC109458_TOKEN || `TC109458-${Date.now()}`;
const SHORT = TOKEN.replace(/\D/g, '').slice(-6);
const CD_NAME = `Method Calc Validation ${SHORT}`;
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

test.describe('EPM — KPI Component Definition Method of Calculation validation (ADO plan 108745 / suite 10)', () => {
  test('TC-109458 Negative — empty Method of Calculation should be rejected on Save', async ({ page }) => {
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
      const cdLink = page.getByText(/Component Defin/i, { exact: false }).locator('visible=true').first();
      await expect(cdLink, 'a Component Definitions link should exist in the flyout').toBeVisible({ timeout: 30_000 });
      await cdLink.click({ force: true });
      await expect(page.locator('.ant-spin-spinning')).toHaveCount(0, { timeout: SLOW });
      await page.waitForTimeout(1_500);

      const addBtn = page.locator('.ant-btn, button').filter({ hasText: /Add|New|Create/i }).first();
      await expect(addBtn, 'an Add action should exist on the Component Definitions grid').toBeVisible({ timeout: SLOW });
      await addBtn.click({ force: true });
      await page.waitForTimeout(1_500);

      const nameField = page.locator('.ant-form-item').filter({ hasText: /^Name/i }).first().getByRole('textbox').first();
      await nameField.fill(CD_NAME);
      const descField = page.locator('.ant-form-item').filter({ hasText: /^Description/i }).first().getByRole('textbox').first();
      await descField.fill('Disposable KPI Component Definition for TC-109458.');

      const componentTypeFormItem = page.locator('.ant-form-item').filter({ hasText: /^Component Type/i }).first();
      await componentTypeFormItem.locator('.ant-select').first().click();
      await page.waitForTimeout(500);
      await page.keyboard.type('Quantitative KPI');
      await page.waitForTimeout(1_000);
      const ctOption = page.locator('.ant-select-dropdown').locator('visible=true').first().locator('.ant-select-item-option').filter({ hasText: /^Quantitative KPI$/ }).first();
      await expect(ctOption, 'Quantitative KPI should be a selectable Component Type').toBeVisible({ timeout: 30_000 });
      await ctOption.click();
      await page.waitForTimeout(1_500);

      // PRECONDITION (ADO): "Tab open" — the Calculation Details section (incl. Method Of
      // Calculation) is now visible after selecting a KPI-family Component Type.
      const methodOfCalcFormItem = page.locator('.ant-form-item').filter({ hasText: /Method Of Calculation/i }).first();
      await expect(methodOfCalcFormItem, 'PRECONDITION EXPECTED: Method Of Calculation should be visible').toBeVisible({ timeout: SLOW });
      const isRequired = await methodOfCalcFormItem.locator('.ant-form-item-required, [class*="required"]').first().isVisible().catch(() => false);
      const labelText = await methodOfCalcFormItem.locator('.ant-form-item-label').first().innerText().catch(() => '');
      console.log(`PRECONDITION ACTUAL — Method Of Calculation label text: "${labelText.replace(/\n/g, ' ')}" (asterisk/required marker present: ${isRequired || /\*/.test(labelText)}).`);

      const uomFormItem = page.locator('.ant-form-item').filter({ hasText: /^Unit Of Measure/i }).first();
      const uomSelect = uomFormItem.locator('.ant-select').first();
      if (await uomSelect.isVisible().catch(() => false)) {
        await uomSelect.click();
        await page.waitForTimeout(500);
        const firstUomOption = page.locator('.ant-select-dropdown').locator('visible=true').first().locator('.ant-select-item-option').first();
        await expect(firstUomOption, 'at least one Unit Of Measure option should exist').toBeVisible({ timeout: 15_000 });
        await firstUomOption.click();
        await page.waitForTimeout(500);
      }

      // STEP 1 (ADO): Clear Method of Calculation and Save. EXPECTED: validation error.
      const methodOfCalcInput = methodOfCalcFormItem.getByRole('textbox').first();
      await methodOfCalcInput.fill('');
      await page.waitForTimeout(500);

      const saveBtn = page.locator('.ant-btn, button').filter({ hasText: /^Save$|^Create$/ }).first();
      const createResponsePromise = page
        .waitForResponse((r) => r.request().method() !== 'GET' && /ComponentDefinition/i.test(r.url()), { timeout: 15_000 })
        .catch(() => null);
      await saveBtn.click({ force: true });
      const emptySaveResp = await createResponsePromise;
      await page.waitForTimeout(1_000);

      const validationError = page.locator('.ant-form-item-explain-error').locator('visible=true').first();
      const validationVisible = await validationError.isVisible().catch(() => false);
      const validationText = validationVisible ? await validationError.innerText().catch(() => '') : '';
      console.log(`STEP 1 ACTUAL — Save request with empty Method Of Calculation: ${emptySaveResp ? `${emptySaveResp.status()} ${emptySaveResp.url()}` : '(no request sent)'}. Validation error shown: ${validationVisible}${validationVisible ? ` ("${validationText}")` : ''}.`);

      if (emptySaveResp && emptySaveResp.status() < 400) {
        const body = await emptySaveResp.json().catch(() => null);
        cdId = body?.result?.id ?? null;
        console.log(`STEP 1 ACTUAL — record WAS created despite empty Method Of Calculation (id ${cdId}).`);
      }

      const rejectedAsExpected = !emptySaveResp || emptySaveResp.status() >= 400 || validationVisible;
      expect.soft(rejectedAsExpected, 'STEP 1 EXPECTED (per ADO): saving with an empty Method of Calculation should be rejected with a validation error — if false, the record saved successfully with a null Method of Calculation, meaning this field is not actually required/validated despite ADO\'s expectation').toBeTruthy();

      // STEP 2 (ADO): Enter a value and Save. EXPECTED: succeeds.
      // Confirmed live: STEP 1's Create succeeded and navigated away from the create form to the new
      // record's details view (same pattern as other entities in this app) — the create-form field
      // locator no longer applies. Switch to the details view's own Edit flow (in-place, no modal —
      // see epm-component-definition-details-view-edit-pattern memory) if that happened.
      await page.waitForTimeout(1_500);
      console.log(`STEP 2 DEBUG — URL after STEP 1's Save: ${page.url()}`);
      // Confirmed live: Create navigates back to the grid list (component-definition-table), not the
      // new record's details view — navigate there explicitly by id, then use its Edit flow.
      expect(cdId, 'a Component Definition id should be available to navigate to its details view').toBeTruthy();
      await page.goto(`${BASE}/dynamic/Epm/component-definition-details-view?id=${cdId}`, { waitUntil: 'domcontentloaded' });
      await expect(page.locator('.ant-spin-spinning')).toHaveCount(0, { timeout: SLOW });
      await page.waitForTimeout(1_500);
      const editBtn = page.locator('.ant-btn, button').filter({ hasText: /^Edit$/ }).first();
      await expect(editBtn, 'an Edit action should exist on the Component Definition details view').toBeVisible({ timeout: SLOW });
      await editBtn.click({ force: true });
      await page.waitForTimeout(1_500);
      const methodOfCalcFormItem2 = page.locator('.ant-form-item').filter({ hasText: /Method Of Calculation/i }).first();
      const methodOfCalcInput2 = methodOfCalcFormItem2.getByRole('textbox').first();
      await methodOfCalcInput2.fill(METHOD_OF_CALC_VALUE);
      const filledSavePromise = page
        .waitForResponse((r) => r.request().method() !== 'GET' && /ComponentDefinition/i.test(r.url()), { timeout: 60_000 })
        .catch(() => null);
      const saveBtn2 = page.locator('.ant-btn, button').filter({ hasText: /^Save$|^Create$/ }).first();
      await saveBtn2.click({ force: true });
      const filledSaveResp = await filledSavePromise;
      console.log(`STEP 2 ACTUAL — Save request with Method Of Calculation filled: ${filledSaveResp ? `${filledSaveResp.status()} ${filledSaveResp.url()}` : '(no request sent)'}.`);
      expect(filledSaveResp, 'STEP 2 EXPECTED: saving with Method of Calculation filled should send a request').toBeTruthy();
      expect(filledSaveResp!.status(), 'STEP 2 EXPECTED: saving with Method of Calculation filled should succeed').toBeLessThan(400);
      const filledBody = await filledSaveResp!.json().catch(() => null);
      cdId = filledBody?.result?.id ?? cdId;
      expect(cdId, 'STEP 2 EXPECTED: a Component Definition id should be returned').toBeTruthy();
      console.log(`STEP 2 ACTUAL — Component Definition saved successfully (id ${cdId}).`);

      const getAllResp = await (await page.request.get(`${WF_API}/api/dynamic/Epm/ComponentDefinition/Crud/GetAll?maxResultCount=2000`, { headers: auth })).json();
      const items = getAllResp?.result?.items ?? getAllResp?.result ?? [];
      const record = items.find((cd: any) => cd.id === cdId);
      console.log(`STEP 2 ACTUAL — persisted record: ${JSON.stringify(record)}`);
      expect(record?.methodOfCalculation, 'STEP 2 EXPECTED: Method Of Calculation should persist once filled').toBe(METHOD_OF_CALC_VALUE);
    } finally {
      if (cdId) {
        const cleanup = await page.request.delete(`${WF_API}/api/dynamic/Epm/ComponentDefinition/Crud/Delete?id=${cdId}`, { headers: auth }).catch(() => null);
        console.log(`CLEANUP — removed disposable Component Definition ${cdId}: ${cleanup ? cleanup.status() : 'request failed'}`);
      }
    }
  });
});
