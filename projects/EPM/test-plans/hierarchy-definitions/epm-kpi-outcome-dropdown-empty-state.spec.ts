import { test, expect } from '@playwright/test';

// ADO TC-108824 (plan 108745, suite 06 · EPM · Output and Outcome linkage). Edge: a newly-created Outcome
// (via the "Outputs & Outcomes" catalog page) should show up as a selectable option in a KPI's Outcome
// dropdown.
//
// CORRECTED 2026-08-30 (per case owner: "the link comes from output&outcome. i created an outcome called
// checkout & went to the kpi dropdown & it showed. that what the tc is about"). Earlier framing of this
// case (chasing a "ComponentOutputOutcome" junction tab/row) was the wrong mechanism entirely — that
// entity exists but is genuinely unused anywhere in the app (see
// epm-component-output-outcome-junction-not-used memory, kept as a separate, real but different finding).
// The actual claim ADO's case is about is much simpler: the KPI's Outcome dropdown reads live from the
// Outputs & Outcomes catalog, so creating a new entry there should make it immediately selectable.
// Confirmed live 2026-08-30: creating a disposable Outcome and then opening a KPI's Outcome dropdown
// showed the new entry immediately — the case owner's own manual check ("checkout") and this automated
// run both confirm it works correctly.

const BASE = 'https://pd-epm-adminportal-qa-wf.shesha.app';
const WF_API = 'https://pd-epm-api-qa-wf.shesha.app';
const COMPONENT_CRUD = `${WF_API}/api/dynamic/Epm/Component/Crud`;
const KPI_NAME = 'Percentage compliance with statutory prescripts';
const PRINCESS_REPORT_ID = 'bc34f55d-bb32-4629-bd74-3e03250e4784';

const SLOW = 420_000;
const RAW_CHANNEL = process.env.PW_CHANNEL === undefined ? 'chrome' : process.env.PW_CHANNEL;
const CHANNEL = RAW_CHANNEL === '' || RAW_CHANNEL === 'chromium' ? undefined : RAW_CHANNEL;

test.use({
  channel: CHANNEL,
  viewport: { width: 1920, height: 1080 },
  actionTimeout: 30_000,
  navigationTimeout: 120_000,
});

test.describe('EPM — KPI Outcome dropdown reflects new Outputs & Outcomes entries (ADO plan 108745 / suite 06)', () => {
  test('TC-108824 Edge — a newly-created Outcome appears in the KPI Outcome dropdown', async ({ page }) => {
    test.setTimeout(600_000);
    const OUTCOME_NAME = `TC108824 Verify ${Date.now().toString().slice(-6)}`;
    console.log(`Outcome name for this run: "${OUTCOME_NAME}"`);

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

    let newOutcomeId: string | null = null;
    try {
      // STEP 1 (ADO): Create a new Outcome on the "Outputs & Outcomes" catalog page.
      const epmItem = page.locator('.ant-menu').getByText('EPM', { exact: true }).locator('visible=true').first();
      await expect(epmItem).toBeVisible({ timeout: SLOW });
      await epmItem.click({ force: true });
      await page.waitForTimeout(2_500);
      const epmAdmin = page.getByText('EPM Administration', { exact: true }).locator('visible=true').first();
      await expect(epmAdmin).toBeVisible({ timeout: 60_000 });
      await epmAdmin.hover({ force: true });
      await page.waitForTimeout(2_500);
      const outputsLink = page.getByText('Outputs & Outcomes', { exact: true }).locator('visible=true').first();
      await expect(outputsLink).toBeVisible({ timeout: 30_000 });
      await outputsLink.click({ force: true });
      await expect(page.locator('.ant-spin-spinning')).toHaveCount(0, { timeout: SLOW });
      await page.waitForTimeout(1_500);

      const addBtn = page.locator('.ant-btn, button').filter({ hasText: /Add|New|Create/i }).first();
      await expect(addBtn, 'an Add action should exist on the Outputs & Outcomes grid').toBeVisible({ timeout: SLOW });
      await addBtn.click({ force: true });
      await page.waitForTimeout(1_500);

      const descField = page.locator('.ant-form-item').filter({ hasText: /^Description/i }).first().getByRole('textbox').first();
      await descField.fill('Disposable Outcome for TC-108824 dropdown-link verification.');
      const nameField = page.locator('.ant-form-item').filter({ hasText: /^Name/i }).first().getByRole('textbox').first();
      await nameField.fill(OUTCOME_NAME);
      await expect(nameField, 'Name should still hold the filled value').toHaveValue(OUTCOME_NAME);

      const typeFormItem = page.locator('.ant-form-item').filter({ hasText: /Select component type/i }).first();
      await typeFormItem.locator('.ant-select').first().click();
      await page.waitForTimeout(500);
      await page.keyboard.type('Outcome');
      await page.waitForTimeout(1_000);
      const typeOption = page.locator('.ant-select-dropdown').locator('visible=true').first().locator('.ant-select-item-option').filter({ hasText: /^Outcome$/ }).first();
      await expect(typeOption, 'Outcome should be a selectable component type').toBeVisible({ timeout: 15_000 });
      await typeOption.click();
      await page.waitForTimeout(500);

      const createPostPromise = page.waitForResponse((r) => r.request().method() !== 'GET' && /Component/i.test(r.url()), { timeout: 60_000 }).catch(() => null);
      const saveBtn = page.locator('.ant-btn, button').filter({ hasText: /^Save$|^Create$/ }).first();
      await saveBtn.click({ force: true });
      const createResp = await createPostPromise;
      console.log(`STEP 1 ACTUAL — create POST: ${createResp ? `${createResp.status()} ${createResp.url()}` : '(none observed)'}`);
      expect(createResp, 'STEP 1 EXPECTED: creating the Outcome should send a request').toBeTruthy();
      expect(createResp!.status(), 'STEP 1 EXPECTED: creating the Outcome should succeed').toBeLessThan(400);
      const createBody = await createResp!.json().catch(() => null);
      newOutcomeId = createBody?.result?.id ?? null;
      expect(newOutcomeId, 'STEP 1: a new Outcome id should be returned').toBeTruthy();
      console.log(`STEP 1 ACTUAL — created Outcome "${OUTCOME_NAME}" (id ${newOutcomeId}).`);

      // STEP 2 (ADO): Open a KPI's Outcome dropdown and confirm the new Outcome is selectable.
      await page.goto(`${BASE}/dynamic/Epm/performance-report-planning-page?id=${PRINCESS_REPORT_ID}`, { waitUntil: 'domcontentloaded' });
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

      const kpiKpaTab = page.locator('.ant-tabs-tab', { hasText: /KPI\/KPA/i }).locator('visible=true').first();
      await kpiKpaTab.click({ force: true });
      await page.waitForTimeout(1_500);

      const outcomeFormItem = page.locator('.ant-form-item').filter({ hasText: /^Outcome/i }).first();
      await outcomeFormItem.locator('.ant-select').first().click();
      await page.waitForTimeout(500);
      await page.keyboard.type(OUTCOME_NAME);
      await page.waitForTimeout(1_500);
      const dropdown = page.locator('.ant-select-dropdown').locator('visible=true').first();
      const option = dropdown.locator('.ant-select-item-option').filter({ hasText: OUTCOME_NAME }).first();
      const optionVisible = await option.isVisible().catch(() => false);
      console.log(`STEP 2 ACTUAL — newly created Outcome "${OUTCOME_NAME}" appears in the KPI's Outcome dropdown: ${optionVisible}.`);
      expect(optionVisible, 'STEP 2 EXPECTED: the newly-created Outcome should be selectable in the KPI Outcome dropdown').toBe(true);
      await page.keyboard.press('Escape').catch(() => {});
      console.log('DONE — new Outcome correctly appeared in the KPI Outcome dropdown.');
    } finally {
      if (newOutcomeId) {
        const cleanup = await page.request.delete(`${COMPONENT_CRUD}/Delete?id=${newOutcomeId}`, { headers: auth }).catch(() => null);
        console.log(`CLEANUP — removed disposable Outcome ${newOutcomeId}: ${cleanup ? cleanup.status() : 'request failed'}`);
      }
    }
  });
});
