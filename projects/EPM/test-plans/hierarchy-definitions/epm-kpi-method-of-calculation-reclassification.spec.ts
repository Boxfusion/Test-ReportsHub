import { test, expect } from '@playwright/test';

// ADO TC-109459 (plan 108745, suite 10 · EPM · KPI/KPA identity tab — Method of Calculation, Reporting
// Cycle, Aggregation, Weighting). Edge: with a Quantitative KPI being edited, set Method of Calculation
// to "Qualitative: measured by narrative report" and Save — ADO expects this text content to trigger
// the KPI to reclassify to Qualitative type (numeric target fields hide, an Achievements narrative
// field appears).
//
// Targets the Component Definition (per the TC-109457/458 correction — see
// epm-kpi-kpa-identity-tab-fields-missing memory — Method of Calculation lives there, in the
// Calculation Details section, not on the Component's tree-based KPI/KPA tab).

const BASE = 'https://pd-epm-adminportal-qa-wf.shesha.app';
const WF_API = 'https://pd-epm-api-qa-wf.shesha.app';

const TOKEN = process.env.TC109459_TOKEN || `TC109459-${Date.now()}`;
const SHORT = TOKEN.replace(/\D/g, '').slice(-6);
const CD_NAME = `Reclass Test ${SHORT}`;
const TRIGGER_TEXT = 'Qualitative: measured by narrative report';

const SLOW = 420_000;
const RAW_CHANNEL = process.env.PW_CHANNEL === undefined ? 'chrome' : process.env.PW_CHANNEL;
const CHANNEL = RAW_CHANNEL === '' || RAW_CHANNEL === 'chromium' ? undefined : RAW_CHANNEL;

test.use({
  channel: CHANNEL,
  viewport: { width: 1920, height: 1080 },
  actionTimeout: 30_000,
  navigationTimeout: 120_000,
});

test.describe('EPM — KPI Method of Calculation reclassification (ADO plan 108745 / suite 10)', () => {
  test('TC-109459 Edge — Method of Calculation containing "Qualitative" should reclassify the KPI type', async ({ page }) => {
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

      // PRECONDITION: A Quantitative KPI Component Definition exists.
      const addBtn = page.locator('.ant-btn, button').filter({ hasText: /Add|New|Create/i }).first();
      await expect(addBtn, 'an Add action should exist on the Component Definitions grid').toBeVisible({ timeout: SLOW });
      await addBtn.click({ force: true });
      await page.waitForTimeout(1_500);

      const nameField = page.locator('.ant-form-item').filter({ hasText: /^Name/i }).first().getByRole('textbox').first();
      await nameField.fill(CD_NAME);
      const descField = page.locator('.ant-form-item').filter({ hasText: /^Description/i }).first().getByRole('textbox').first();
      await descField.fill('Disposable Quantitative KPI for TC-109459.');

      const componentTypeFormItem = page.locator('.ant-form-item').filter({ hasText: /^Component Type/i }).first();
      await componentTypeFormItem.locator('.ant-select').first().click();
      await page.waitForTimeout(500);
      await page.keyboard.type('Quantitative KPI');
      await page.waitForTimeout(1_000);
      const ctOption = page.locator('.ant-select-dropdown').locator('visible=true').first().locator('.ant-select-item-option').filter({ hasText: /^Quantitative KPI$/ }).first();
      await expect(ctOption, 'Quantitative KPI should be a selectable Component Type').toBeVisible({ timeout: 30_000 });
      await ctOption.click();
      await page.waitForTimeout(1_500);

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

      const methodOfCalcFormItem = page.locator('.ant-form-item').filter({ hasText: /Method Of Calculation/i }).first();
      const methodOfCalcInput = methodOfCalcFormItem.getByRole('textbox').first();
      await methodOfCalcInput.fill('Sum of items completed');

      const createResponsePromise = page
        .waitForResponse((r) => r.request().method() !== 'GET' && /ComponentDefinition/i.test(r.url()), { timeout: 60_000 })
        .catch(() => null);
      const saveBtn = page.locator('.ant-btn, button').filter({ hasText: /^Save$|^Create$/ }).first();
      await saveBtn.click({ force: true });
      const createResp = await createResponsePromise;
      expect(createResp, 'precondition: creating the Quantitative KPI should send a request').toBeTruthy();
      expect(createResp!.status(), 'precondition: creating the Quantitative KPI should succeed').toBeLessThan(400);
      const createBody = await createResp!.json().catch(() => null);
      cdId = createBody?.result?.id ?? null;
      expect(cdId, 'precondition: a Component Definition id should be returned').toBeTruthy();
      console.log(`PRECONDITION — Quantitative KPI Component Definition created (id ${cdId}).`);

      // Navigate directly to its details view (Create lands back on the grid, not the details view —
      // see epm-kpi-kpa-identity-tab-fields-missing memory).
      await page.goto(`${BASE}/dynamic/Epm/component-definition-details-view?id=${cdId}`, { waitUntil: 'domcontentloaded' });
      await expect(page.locator('.ant-spin-spinning')).toHaveCount(0, { timeout: SLOW });
      await page.waitForTimeout(1_500);

      const componentTypeBefore = await page.locator('body').innerText().then((t) => /Quantitative KPI/.test(t)).catch(() => false);
      console.log(`PRECONDITION ACTUAL — Component Type reads "Quantitative KPI" before edit: ${componentTypeBefore}.`);

      // STEP 1 (ADO): Set Method of Calculation to "Qualitative: measured by narrative report". Save.
      const editBtn = page.locator('.ant-btn, button').filter({ hasText: /^Edit$/ }).first();
      await expect(editBtn, 'an Edit action should exist on the Component Definition details view').toBeVisible({ timeout: SLOW });
      await editBtn.click({ force: true });
      await page.waitForTimeout(1_500);

      const methodOfCalcFormItem2 = page.locator('.ant-form-item').filter({ hasText: /Method Of Calculation/i }).first();
      const methodOfCalcInput2 = methodOfCalcFormItem2.getByRole('textbox').first();
      await methodOfCalcInput2.fill(TRIGGER_TEXT);

      const updateResponsePromise = page
        .waitForResponse((r) => r.request().method() !== 'GET' && /ComponentDefinition/i.test(r.url()), { timeout: 60_000 })
        .catch(() => null);
      const saveBtn2 = page.locator('.ant-btn, button').filter({ hasText: /^Save$/ }).first();
      await saveBtn2.click({ force: true });
      const updateResp = await updateResponsePromise;
      console.log(`STEP 1 ACTUAL — Save request: ${updateResp ? `${updateResp.status()} ${updateResp.url()}` : '(no response observed)'}.`);
      expect(updateResp, 'STEP 1 EXPECTED: saving the updated Method of Calculation should send a request').toBeTruthy();
      expect(updateResp!.status(), 'STEP 1 EXPECTED: saving should succeed').toBeLessThan(400);
      await page.waitForTimeout(1_500);

      // STEP 2 (ADO): Confirm KPI reclassifies to Qualitative type — numeric target fields hide,
      // Achievements narrative field appears.
      const getAllResp = await (await page.request.get(`${WF_API}/api/dynamic/Epm/ComponentDefinition/Crud/GetAll?maxResultCount=2000`, { headers: auth })).json();
      const items = getAllResp?.result?.items ?? getAllResp?.result ?? [];
      const record = items.find((cd: any) => cd.id === cdId);
      console.log(`STEP 2 ACTUAL — persisted record: ${JSON.stringify(record)}`);
      console.log(`STEP 2 ACTUAL — componentType after save: "${record?.componentType?._displayName}".`);
      expect.soft(record?.componentType?._displayName, 'STEP 2 EXPECTED (per ADO): the Component Type should reclassify from "Quantitative KPI" to "Qualitative KPI" based on the text content of Method of Calculation — CONFIRMED NON-EXISTENT FEATURE if this stays "Quantitative KPI": the componentType field is independently selected, not derived from Method of Calculation text').toBe('Qualitative KPI');

      await page.reload({ waitUntil: 'domcontentloaded' });
      await expect(page.locator('.ant-spin-spinning')).toHaveCount(0, { timeout: SLOW });
      await page.waitForTimeout(1_500);
      const bodyTextAfter = await page.locator('body').innerText().catch(() => '');
      const uiShowsQualitative = /Qualitative KPI/.test(bodyTextAfter) && !/Quantitative KPI/.test(bodyTextAfter);
      console.log(`STEP 2 ACTUAL — UI Component Type field shows Qualitative KPI after reload: ${uiShowsQualitative}.`);
      expect.soft(uiShowsQualitative, 'STEP 2 EXPECTED (per ADO): the UI should visually show the Component Type as reclassified to Qualitative KPI').toBeTruthy();
    } finally {
      if (cdId) {
        const cleanup = await page.request.delete(`${WF_API}/api/dynamic/Epm/ComponentDefinition/Crud/Delete?id=${cdId}`, { headers: auth }).catch(() => null);
        console.log(`CLEANUP — removed disposable Component Definition ${cdId}: ${cleanup ? cleanup.status() : 'request failed'}`);
      }
    }
  });
});
