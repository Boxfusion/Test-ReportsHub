import { test, expect, type Page, type Locator } from '@playwright/test';

// Derived artefact — the canonical source is
// epm-performance-report-template-allowed-component-types.md, which mirrors ADO test case 108779 in
// suite 109508. Edit the .md (and the ADO case), not this file, except for AI-repair patches.

const BASE = 'https://pd-epm-adminportal-qa-wf.shesha.app';
const API = 'https://pd-epm-api-qa-wf.shesha.app'; // -wf: matches where the UI actually writes — see epm-unit-of-measure-getall-host-mismatch memory
const PRT_CRUD = `${API}/api/dynamic/Epm/PerformanceReportTemplate/Crud`;
const PRACT_CRUD = `${API}/api/dynamic/Epm/PerformanceReportAllowedComponentType/Crud`;
const PR_CRUD = `${API}/api/dynamic/Epm/PerformanceReport/Crud`;
const COMPONENT_CRUD = `${API}/api/dynamic/Epm/Component/Crud`;
const ACTIONER_CRUD = `${API}/api/dynamic/Epm/ComponentActioner/Crud`;
const PUBLISH_URL = `${API}/api/v1/Epm/PerformanceReports/PublishPerformanceReport`;

// Fixed reference ids confirmed live on 2026-08-17 (stable catalog/reference data, not disposable):
const DEPARTMENT_TYPE_ID = '05a72647-75ce-4fd7-a57f-df6a64f06e74'; // ComponentType "Department"
const QKPI_TYPE_ID = '3fc0e190-bf45-40b2-ae09-b61b2ece63dd'; // ComponentType "Quantitative KPI"
const QKPI_DEFINITION_ID = 'ac1d9789-6237-4729-9cc9-c1aa7086c0f4'; // ComponentDefinition "Emmanuel_QKPI" (shared catalog reference, read-only use)
const ACTIONER_PERSON_ID = '6bac0d40-00f8-4e2b-b775-f687a0b470ce'; // Person "Princess Hlazo" (has a real linked User)

const TOKEN = process.env.TC108779_TOKEN || `TC108779-${Date.now()}`;
const SHORT = TOKEN.replace(/\D/g, '').slice(-6);
const TEMPLATE_NAME = `Standard Annual Performance Plan ${SHORT}`;

const SLOW = 420_000;
const RAW_CHANNEL = process.env.PW_CHANNEL === undefined ? 'chrome' : process.env.PW_CHANNEL;
const CHANNEL = RAW_CHANNEL === '' || RAW_CHANNEL === 'chromium' ? undefined : RAW_CHANNEL;

test.use({
  channel: CHANNEL,
  viewport: { width: 1920, height: 1080 },
  actionTimeout: 30_000,
  navigationTimeout: 120_000,
});

async function hoverUntilVisible(page: Page, trigger: Locator, revealed: Locator, label: string) {
  // Keep the cursor steady on the trigger between retries — see epm-hover-menu-keep-cursor-steady memory.
  for (let attempt = 1; attempt <= 8; attempt++) {
    await trigger.hover({ force: true }).catch((e) => console.log(`  ${label}: hover attempt ${attempt} errored: ${e.message}`));
    await page.waitForTimeout(2_000);
    if (await revealed.isVisible().catch(() => false)) return;
    console.log(`  ${label}: not open after hover attempt ${attempt}, retrying (cursor held steady)`);
  }
  throw new Error(`${label} never opened after 8 hover attempts`);
}

test.describe('EPM — Performance Report Template management (ADO plan 108745 / suite 109508)', () => {
  test('TC-108779 Positive — Configure Performance Report Template with allowed Component Type and canBeRoot invariants', async ({ page }) => {
    test.setTimeout(1_200_000);
    console.log(`RUN TOKEN — ${TOKEN}`);
    console.log(`  Template name=${TEMPLATE_NAME}`);

    await page.goto(`${BASE}/login`, { waitUntil: 'domcontentloaded' });
    await expect(page.locator('input').first()).toBeVisible({ timeout: SLOW });
    await page.locator('input').first().fill('admin.PrincessH');
    await page.locator('input[type="password"]').first().fill('123qwe');
    await page.getByRole('button', { name: /sign in|login/i }).first().click();
    await expect(page).not.toHaveURL(/\/login/, { timeout: SLOW });

    // PRECONDITION: at least one Component Type exists per hierarchy level — confirmed live via API
    // before building this spec (Department/Programme/Sub Programme/Quantitative KPI/Qualitative KPI
    // all exist).

    // Navigate EPM > EPM Administration > Performance Report Templates. ADO's literal route
    // (/dynamic/Epm/PerformanceReportTemplate/) is not real — the real one, per
    // epm-performance-report-tree-navigation memory, is /dynamic/Epm/perfomance-report-template
    // (misspelled "perfomance"). The left rail is icon-only; "EPM" is a plain menuitem (click, not
    // hover) that opens a flyout with "Workflow" / "EPM Administration"; hovering "EPM Administration"
    // opens the module's page list.
    const epmItem = page.locator('.ant-menu').getByText('EPM', { exact: true }).locator('visible=true').first();
    await expect(epmItem).toBeVisible({ timeout: SLOW });
    await epmItem.click({ force: true });
    await page.waitForTimeout(2_500);
    const epmAdmin = page.getByText('EPM Administration', { exact: true }).locator('visible=true').first();
    const prtLink = page.getByRole('link', { name: /Performance Report Template/i }).locator('visible=true').first();
    await hoverUntilVisible(page, epmAdmin, prtLink, 'EPM Administration flyout');
    await expect(prtLink).toHaveAttribute('href', '/dynamic/Epm/perfomance-report-template');
    await prtLink.click();
    await expect(page).toHaveURL(/\/dynamic\/Epm\/perfomance-report-template$/, { timeout: SLOW });
    await expect(page.locator('.ant-spin-spinning')).toHaveCount(0, { timeout: SLOW });

    // ── STEP 2: Create a new template named "Standard Annual Performance Plan". ────────────────
    const addBtn = page.locator('.ant-btn').filter({ hasText: 'Add' }).first();
    await expect(addBtn).toBeVisible({ timeout: SLOW });
    await page.mouse.move(960, 540);
    await page.waitForTimeout(1_000);
    await addBtn.click({ timeout: 15_000 });

    const modal = page.locator('.ant-modal-content').first();
    await expect(modal, 'STEP 2 EXPECTED: the create form should load').toBeVisible({ timeout: SLOW });
    await expect(modal.locator('.ant-modal-title')).toHaveText('Add New Template');
    await modal.locator('input[placeholder="Enter name"]').fill(TEMPLATE_NAME);

    // Period Type Covered and Progress Reporting Cycle are required selects with no ADO-specified
    // value — pick whichever option is first in each dropdown (not the graded claim here).
    async function selectFirstOption(labelText: RegExp) {
      const select = modal.locator('label, *').filter({ hasText: labelText }).last()
        .locator('xpath=following::*[contains(concat(" ", normalize-space(@class), " "), " ant-select ")][1]');
      await select.click();
      const dropdown = page.locator('.ant-select-dropdown').locator('visible=true').first();
      await expect(dropdown).toBeVisible({ timeout: 30_000 });
      const firstOpt = dropdown.locator('.ant-select-item-option').first();
      await expect(firstOpt).toBeVisible({ timeout: 30_000 });
      const text = (await firstOpt.textContent())?.trim();
      await firstOpt.click();
      return text;
    }
    const periodType = await selectFirstOption(/Period Type Covered/i);
    console.log(`Setup — Period Type Covered: "${periodType}"`);
    const reportingCycle = await selectFirstOption(/Progress Reporting Cycle/i);
    console.log(`Setup — Progress Reporting Cycle: "${reportingCycle}"`);

    const createPostPromise = page
      .waitForResponse((r) => r.request().method() === 'POST' && /PerformanceReportTemplate/i.test(r.url()), { timeout: 60_000 })
      .catch(() => null);
    await modal.getByRole('button', { name: /^Create$/ }).click();
    const createPost = await createPostPromise;
    expect(createPost, 'STEP 2 EXPECTED: the template should be saved').toBeTruthy();
    console.log(`STEP 2 — POST ${createPost!.status()} ${createPost!.url()}`);
    expect(createPost!.status(), 'STEP 2 EXPECTED: save succeeds').toBeLessThan(400);
    const templateId: string | null = (await createPost!.json().catch(() => null))?.result?.id ?? null;
    expect(templateId, 'the create response should return a template id').toBeTruthy();
    await expect(modal, 'modal should close on successful save').toBeHidden({ timeout: 90_000 });
    console.log(`STEP 2 ACTUAL — template saved (id ${templateId})`);

    const junctionIds: string[] = [];
    try {
      // Navigate to the template's details view, where the Allowed Component Types grid lives.
      await page.goto(`${BASE}/dynamic/Epm/perfomance-report-template-details?id=${templateId}`, { waitUntil: 'domcontentloaded' });
      await expect(page.locator('.ant-spin-spinning')).toHaveCount(0, { timeout: SLOW });
      await page.waitForTimeout(1_500);

      // STEP 2 EXPECTED: the Allowed Component Types grid is visible.
      const gridHeader = page.getByText('Performance Report Allowed Component Types', { exact: true }).first();
      await expect(gridHeader, 'STEP 2 EXPECTED: the Allowed Component Types grid should be visible').toBeVisible({ timeout: SLOW });
      console.log('STEP 2 ACTUAL — Allowed Component Types grid is visible.');

      // ── STEP 3: Add the five rows with their canBeRoot values. ────────────────────────────────
      // The grid's own "Add" action is hidden behind a responsive overflow menu (confirmed live —
      // a plain "Add" toolbar button elsewhere on the page is an unrelated page-builder control that
      // does nothing when clicked). Real selector per epm-add-child-item-dropdown-defect /
      // hover-menu conventions: ul[class*="sha-responsive-button-gr"] .ant-menu-submenu-title.
      const rowsToAdd = [
        { type: 'Department', canBeRoot: true },
        { type: 'Programme', canBeRoot: true },
        { type: 'Sub Programme', canBeRoot: true },
        { type: 'Quantitative KPI', canBeRoot: false },
        { type: 'Qualitative KPI', canBeRoot: false },
      ];

      for (const row of rowsToAdd) {
        const responsiveMenuTrigger = page.locator('ul[class*="sha-responsive-button-gr"] .ant-menu-submenu-title').last();
        await expect(responsiveMenuTrigger, `the responsive overflow menu should be visible before adding "${row.type}"`).toBeVisible({ timeout: SLOW });
        await responsiveMenuTrigger.click({ timeout: 15_000 });
        await page.waitForTimeout(500);
        const addMenuItem = page.locator('.ant-menu-item:visible, .ant-dropdown-menu-item:visible').filter({ hasText: /^Add$/ }).first();
        await expect(addMenuItem, `the "Add" menu item should appear for "${row.type}"`).toBeVisible({ timeout: 15_000 });
        await addMenuItem.click({ timeout: 15_000 });

        const addModal = page.locator('.ant-modal-content').filter({ hasText: 'Add New Performance Report Allowed Component Type' }).first();
        await expect(addModal, `the Add New Performance Report Allowed Component Type form should load for "${row.type}"`).toBeVisible({ timeout: SLOW });

        // This select is a searchable/paginated reference-picker — the default (unfiltered) option
        // list only shows a handful of items (alphabetically, cut off before reaching later types like
        // "Sub Programme"), so type the exact name to filter rather than scanning the default list.
        const typeSelect = addModal.locator('label').filter({ hasText: /^Component Type/i }).first()
          .locator('xpath=following::*[contains(concat(" ", normalize-space(@class), " "), " ant-select ")][1]');
        await typeSelect.click();
        const typeDropdown = page.locator('.ant-select-dropdown').locator('visible=true').first();
        await expect(typeDropdown).toBeVisible({ timeout: 30_000 });
        await page.keyboard.type(row.type);
        await page.waitForTimeout(1_000);
        await typeDropdown.locator('.ant-select-item-option').filter({ hasText: new RegExp(`^${row.type}$`) }).first().click();
        await expect(typeSelect.locator('.ant-select-selection-item')).toHaveText(row.type, { timeout: 30_000 });

        if (row.canBeRoot) {
          const canBeRootCheckbox = addModal.locator('label').filter({ hasText: /^Can Be Root/i }).first()
            .locator('xpath=following::input[@type="checkbox"][1]');
          await canBeRootCheckbox.check({ timeout: 15_000 });
        }

        const addJunctionPostPromise = page
          .waitForResponse((r) => r.request().method() === 'POST' && /PerformanceReportAllowedComponentType/i.test(r.url()), { timeout: 60_000 })
          .catch(() => null);
        await addModal.getByRole('button', { name: /^OK$/ }).click();
        const addJunctionPost = await addJunctionPostPromise;
        expect(addJunctionPost, `adding "${row.type}" should produce a Create request`).toBeTruthy();
        expect(addJunctionPost!.status(), `adding "${row.type}" should succeed`).toBeLessThan(400);
        const junctionId = (await addJunctionPost!.json().catch(() => null))?.result?.id;
        if (junctionId) junctionIds.push(junctionId);
        await expect(addModal, `modal should close after adding "${row.type}"`).toBeHidden({ timeout: 60_000 });
        console.log(`STEP 3 — added "${row.type}" (canBeRoot=${row.canBeRoot}), junction id ${junctionId}`);
        await page.waitForTimeout(1_000);
      }

      await page.screenshot({ path: 'projects/EPM/test-reports/2026-08-14/assets/tc108779-01-five-rows.png', fullPage: true });

      // Diagnostic: check the raw API state immediately after adding, before any UI reload, to
      // isolate whether a row is genuinely missing server-side or just a UI refresh/pagination issue.
      const rightAfterAdding = ((await (await page.request.get(`${PRACT_CRUD}/GetAll?maxResultCount=1000`, { timeout: SLOW })).json()).result?.items ?? []) as any[];
      const rightAfterAddingForTemplate = rightAfterAdding.filter((r: any) => r.performanceReportTemplate?.id === templateId);
      console.log(`DIAGNOSTIC — API state immediately after adding all 5 (before reload): ${JSON.stringify(rightAfterAddingForTemplate.map((r: any) => ({ type: r.componentType?._displayName, canBeRoot: r.canBeRoot, id: r.id })))}`);

      // STEP 3 EXPECTED: five Allowed Component Type rows are visible with the correct canBeRoot values.
      // Neither [role="row"] nor the standard AntD .ant-table-tbody/.ant-table-row classes match this
      // particular grid's DOM (confirmed live: both came up with a 0 count even after a 60s poll,
      // despite a screenshot at that exact moment showing all 5 rows correctly rendered) — this is a
      // custom Shesha grid component with different internals. Rather than keep guessing class names,
      // check for each Component Type's exact visible text directly (unique enough on this page not to
      // collide with anything else) — this also naturally handles the grid's async data fetch being
      // slower than the page's own spinner clearing, since each check has its own generous timeout.
      await page.reload({ waitUntil: 'domcontentloaded' });
      await expect(page.locator('.ant-spin-spinning')).toHaveCount(0, { timeout: SLOW });
      for (const row of rowsToAdd) {
        await expect(page.getByText(row.type, { exact: true }).first(), `STEP 3 EXPECTED: a row for "${row.type}" should be visible in the grid`).toBeVisible({ timeout: 60_000 });
      }
      console.log('STEP 3 ACTUAL — all five Allowed Component Type rows are visible in the grid.');

      // ── STEP 4: Reload and verify the persisted rows via the API. ─────────────────────────────
      const afterAll = ((await (await page.request.get(`${PRACT_CRUD}/GetAll?maxResultCount=1000`, { timeout: SLOW })).json()).result?.items ?? []) as any[];
      const persistedRows = afterAll.filter((r: any) => r.performanceReportTemplate?.id === templateId);
      console.log(`STEP 4 — persisted rows via API: ${JSON.stringify(persistedRows.map((r: any) => ({ type: r.componentType?._displayName, canBeRoot: r.canBeRoot })))}`);

      expect(persistedRows.length, 'STEP 4 EXPECTED: the API returns exactly five rows').toBe(5);
      for (const row of rowsToAdd) {
        const persisted = persistedRows.find((r: any) => r.componentType?._displayName === row.type);
        expect(persisted, `STEP 4 EXPECTED: a persisted row for "${row.type}" should exist`).toBeTruthy();
        expect(persisted!.canBeRoot, `STEP 4 EXPECTED: "${row.type}" should have canBeRoot=${row.canBeRoot}`).toBe(row.canBeRoot);
      }
      console.log('DONE — all five Allowed Component Type rows persisted with the expected canBeRoot values.');
    } finally {
      for (const jid of junctionIds) {
        const cleanup = await page.request.delete(`${PRACT_CRUD}/Delete?id=${jid}`).catch(() => null);
        console.log(`CLEANUP — removed junction ${jid}: ${cleanup ? cleanup.status() : 'request failed'}`);
      }
      if (templateId) {
        const cleanup = await page.request.delete(`${PRT_CRUD}/Delete?id=${templateId}`).catch(() => null);
        console.log(`CLEANUP — removed disposable template ${templateId}: ${cleanup ? cleanup.status() : 'request failed'}`);
      }
    }
  });

  test('TC-108814 Negative — Reject Performance Report Template save with no Allowed Component Type rows', async ({ page }) => {
    test.setTimeout(1_200_000);
    const NO_ROWS_TEMPLATE_NAME = `TC108814 Reject No Rows ${SHORT}`;
    console.log(`RUN TOKEN — ${TOKEN}`);
    console.log(`  Template name=${NO_ROWS_TEMPLATE_NAME}`);

    await page.goto(`${BASE}/login`, { waitUntil: 'domcontentloaded' });
    await expect(page.locator('input').first()).toBeVisible({ timeout: SLOW });
    await page.locator('input').first().fill('admin.PrincessH');
    await page.locator('input[type="password"]').first().fill('123qwe');
    await page.getByRole('button', { name: /sign in|login/i }).first().click();
    await expect(page).not.toHaveURL(/\/login/, { timeout: SLOW });

    const beforeAll = ((await (await page.request.get(`${PRT_CRUD}/GetAll?maxResultCount=1000`, { timeout: SLOW })).json()).result?.items ?? []) as any[];
    const beforeCount = beforeAll.length;
    console.log(`PRECONDITION — ${beforeCount} Performance Report Templates before this run`);

    const epmItem = page.locator('.ant-menu').getByText('EPM', { exact: true }).locator('visible=true').first();
    await expect(epmItem).toBeVisible({ timeout: SLOW });
    await epmItem.click({ force: true });
    await page.waitForTimeout(2_500);
    const epmAdmin = page.getByText('EPM Administration', { exact: true }).locator('visible=true').first();
    const prtLink = page.getByRole('link', { name: /Performance Report Template/i }).locator('visible=true').first();
    await hoverUntilVisible(page, epmAdmin, prtLink, 'EPM Administration flyout');
    await prtLink.click();
    await expect(page).toHaveURL(/\/dynamic\/Epm\/perfomance-report-template$/, { timeout: SLOW });
    await expect(page.locator('.ant-spin-spinning')).toHaveCount(0, { timeout: SLOW });

    // ── PRECONDITION / STEP 2: New create form loaded with no Allowed rows added. Enter Name and ──
    // Period Type. Save. ────────────────────────────────────────────────────────────────────────
    // Confirmed live (TC-108779's own build): the create form has no Allowed Component Type concept
    // at all — that grid only exists on the details view, reachable after the template is already
    // saved. "No Allowed rows added" is therefore not a distinct precondition state; every template
    // is created with zero rows first, by construction.
    const addBtn = page.locator('.ant-btn').filter({ hasText: 'Add' }).first();
    await expect(addBtn).toBeVisible({ timeout: SLOW });
    await page.mouse.move(960, 540);
    await page.waitForTimeout(1_000);
    await addBtn.click({ timeout: 15_000 });

    const modal = page.locator('.ant-modal-content').first();
    await expect(modal).toBeVisible({ timeout: SLOW });
    await modal.locator('input[placeholder="Enter name"]').fill(NO_ROWS_TEMPLATE_NAME);

    async function selectFirstOption(labelText: RegExp) {
      const select = modal.locator('label, *').filter({ hasText: labelText }).last()
        .locator('xpath=following::*[contains(concat(" ", normalize-space(@class), " "), " ant-select ")][1]');
      await select.click();
      const dropdown = page.locator('.ant-select-dropdown').locator('visible=true').first();
      await expect(dropdown).toBeVisible({ timeout: 30_000 });
      const firstOpt = dropdown.locator('.ant-select-item-option').first();
      await expect(firstOpt).toBeVisible({ timeout: 30_000 });
      const text = (await firstOpt.textContent())?.trim();
      await firstOpt.click();
      return text;
    }
    // ADO's step 2 says "Enter Name and Period Type" — Progress Reporting Cycle is also required on
    // this form (not mentioned by ADO) so it's filled too, purely to reach a submittable state.
    const periodType = await selectFirstOption(/Period Type Covered/i);
    console.log(`Setup — Period Type Covered: "${periodType}"`);
    const reportingCycle = await selectFirstOption(/Progress Reporting Cycle/i);
    console.log(`Setup — Progress Reporting Cycle: "${reportingCycle}"`);

    const createPostPromise = page
      .waitForResponse((r) => r.request().method() === 'POST' && /PerformanceReportTemplate/i.test(r.url()), { timeout: 15_000 })
      .catch(() => null);
    await modal.getByRole('button', { name: /^Create$/ }).click();
    const createPost = await Promise.race([
      createPostPromise,
      page.waitForTimeout(5_000).then(() => null),
    ]);
    let templateId: string | null = null;
    let saveWasRejected = true;
    if (createPost) {
      console.log(`STEP 2 — POST ${createPost.status()} ${createPost.url()}`);
      saveWasRejected = createPost.status() >= 400;
      if (!saveWasRejected) {
        templateId = (await createPost.json().catch(() => null))?.result?.id ?? null;
      }
    } else {
      console.log('STEP 2 — no POST observed within 5s');
    }
    const modalStillOpen = await modal.isVisible().catch(() => false);
    console.log(`STEP 2 ACTUAL — save ${saveWasRejected ? 'was REJECTED' : `SUCCEEDED (template id ${templateId})`}; modal still open: ${modalStillOpen}. ADO EXPECTED: "The form rejects with a validation error citing at least one Allowed Component Type row is required."`);
    if (!saveWasRejected) {
      await expect(modal, 'modal should close on successful save').toBeHidden({ timeout: 60_000 }).catch(() => {});
    }

    let junctionId: string | null = null;
    try {
      // STEP 2 EXPECTED (ADO): the form rejects with a validation error. CONFIRMED BUG: no such
      // validation exists — the create form has no Allowed Component Type field to validate against
      // in the first place (see the .md's precondition-mismatch note). Asserted per ADO's literal
      // expectation, so this turns red by design rather than being adapted around.
      expect.soft(saveWasRejected, 'STEP 2 EXPECTED (confirmed BUG — no such validation exists on this form): the form should reject save with no Allowed Component Type rows').toBe(true);

      // ── STEP 3: Confirm no PerformanceReportTemplate record was persisted. ─────────────────────
      const afterStep2 = ((await (await page.request.get(`${PRT_CRUD}/GetAll?maxResultCount=1000`, { timeout: SLOW })).json()).result?.items ?? []) as any[];
      console.log(`STEP 3 — Performance Report Templates after step 2: ${afterStep2.length} (before: ${beforeCount})`);
      // Also expected to fail here — ADO's step 3 presupposes step 2's save was rejected; since it
      // wasn't (confirmed bug above), a new record legitimately exists. Soft, so STEP 4 still runs.
      expect.soft(afterStep2.length, 'STEP 3 EXPECTED: GetAll count is unchanged (fails as a direct consequence of the STEP 2 defect — a record was actually created)').toBe(beforeCount);

      // ── STEP 4: Retry save after adding one row. Confirm success. ──────────────────────────────
      // Unreachable as ADO literally describes it (adding a row requires a saved template id first —
      // there is no "add a row before saving" state in the real UI). Since step 2 already
      // (unexpectedly) persisted a template with zero rows, this continues from that real state: add
      // one Allowed Component Type row to it via the details view and confirm it persists — the same
      // mechanism already proven correct in TC-108779, exercised here once as a useful follow-up.
      expect(templateId, 'a template id is needed to continue to STEP 4 — the save must have succeeded for this to be reachable').toBeTruthy();
      await page.goto(`${BASE}/dynamic/Epm/perfomance-report-template-details?id=${templateId}`, { waitUntil: 'domcontentloaded' });
      await expect(page.locator('.ant-spin-spinning')).toHaveCount(0, { timeout: SLOW });
      await page.waitForTimeout(1_500);

      const responsiveMenuTrigger = page.locator('ul[class*="sha-responsive-button-gr"] .ant-menu-submenu-title').last();
      await expect(responsiveMenuTrigger).toBeVisible({ timeout: SLOW });
      await responsiveMenuTrigger.click({ timeout: 15_000 });
      await page.waitForTimeout(500);
      const addMenuItem = page.locator('.ant-menu-item:visible, .ant-dropdown-menu-item:visible').filter({ hasText: /^Add$/ }).first();
      await expect(addMenuItem).toBeVisible({ timeout: 15_000 });
      await addMenuItem.click({ timeout: 15_000 });

      const addModal = page.locator('.ant-modal-content').filter({ hasText: 'Add New Performance Report Allowed Component Type' }).first();
      await expect(addModal).toBeVisible({ timeout: SLOW });
      const typeSelect = addModal.locator('label').filter({ hasText: /^Component Type/i }).first()
        .locator('xpath=following::*[contains(concat(" ", normalize-space(@class), " "), " ant-select ")][1]');
      await typeSelect.click();
      const typeDropdown = page.locator('.ant-select-dropdown').locator('visible=true').first();
      await expect(typeDropdown).toBeVisible({ timeout: 30_000 });
      await page.keyboard.type('Department');
      await page.waitForTimeout(1_000);
      await typeDropdown.locator('.ant-select-item-option').filter({ hasText: /^Department$/ }).first().click();
      await expect(typeSelect.locator('.ant-select-selection-item')).toHaveText('Department', { timeout: 30_000 });
      // canBeRoot left unchecked (No) — not the graded claim here, just needs a valid row.

      const addJunctionPostPromise = page
        .waitForResponse((r) => r.request().method() === 'POST' && /PerformanceReportAllowedComponentType/i.test(r.url()), { timeout: 60_000 })
        .catch(() => null);
      await addModal.getByRole('button', { name: /^OK$/ }).click();
      const addJunctionPost = await addJunctionPostPromise;
      expect(addJunctionPost, 'STEP 4 EXPECTED: adding one row should succeed').toBeTruthy();
      expect(addJunctionPost!.status(), 'STEP 4 EXPECTED: adding one row should succeed').toBeLessThan(400);
      junctionId = (await addJunctionPost!.json().catch(() => null))?.result?.id ?? null;
      await expect(addModal).toBeHidden({ timeout: 60_000 });
      console.log(`STEP 4 — added one Allowed Component Type row (Department), junction id ${junctionId}`);

      const afterStep4 = ((await (await page.request.get(`${PRACT_CRUD}/GetAll?maxResultCount=1000`, { timeout: SLOW })).json()).result?.items ?? []) as any[];
      const persistedRow = afterStep4.find((r: any) => r.performanceReportTemplate?.id === templateId);
      console.log(`STEP 4 — persisted row: ${JSON.stringify(persistedRow ? { type: persistedRow.componentType?._displayName, canBeRoot: persistedRow.canBeRoot } : null)}`);
      expect(persistedRow, 'STEP 4 EXPECTED: the template persists with the single Allowed Component Type row').toBeTruthy();
      console.log('DONE — STEP 4 (the follow-up given the app\'s real two-phase flow) confirms adding a row after the fact works correctly; STEP 2\'s missing validation remains the confirmed defect.');
    } finally {
      if (junctionId) {
        const cleanup = await page.request.delete(`${PRACT_CRUD}/Delete?id=${junctionId}`).catch(() => null);
        console.log(`CLEANUP — removed junction ${junctionId}: ${cleanup ? cleanup.status() : 'request failed'}`);
      }
      if (templateId) {
        const cleanup = await page.request.delete(`${PRT_CRUD}/Delete?id=${templateId}`).catch(() => null);
        console.log(`CLEANUP — removed disposable template ${templateId}: ${cleanup ? cleanup.status() : 'request failed'}`);
      }
    }
  });

  test('TC-108815 Edge — Allowed Component Type list rejects a duplicate Component Type entry', async ({ page }) => {
    test.setTimeout(1_200_000);
    const DUP_TEMPLATE_NAME = `TC108815 Duplicate Reject ${SHORT}`;
    console.log(`RUN TOKEN — ${TOKEN}`);
    console.log(`  Template name=${DUP_TEMPLATE_NAME}`);

    await page.goto(`${BASE}/login`, { waitUntil: 'domcontentloaded' });
    await expect(page.locator('input').first()).toBeVisible({ timeout: SLOW });
    await page.locator('input').first().fill('admin.PrincessH');
    await page.locator('input[type="password"]').first().fill('123qwe');
    await page.getByRole('button', { name: /sign in|login/i }).first().click();
    await expect(page).not.toHaveURL(/\/login/, { timeout: SLOW });

    const epmItem = page.locator('.ant-menu').getByText('EPM', { exact: true }).locator('visible=true').first();
    await expect(epmItem).toBeVisible({ timeout: SLOW });
    await epmItem.click({ force: true });
    await page.waitForTimeout(2_500);
    const epmAdmin = page.getByText('EPM Administration', { exact: true }).locator('visible=true').first();
    const prtLink = page.getByRole('link', { name: /Performance Report Template/i }).locator('visible=true').first();
    await hoverUntilVisible(page, epmAdmin, prtLink, 'EPM Administration flyout');
    await prtLink.click();
    await expect(page).toHaveURL(/\/dynamic\/Epm\/perfomance-report-template$/, { timeout: SLOW });
    await expect(page.locator('.ant-spin-spinning')).toHaveCount(0, { timeout: SLOW });

    // ── PRECONDITION: create a disposable template that already has Department as an Allowed ──────
    // Component Type (ADO's literal precondition). Setup only — not the graded claim.
    const addBtn = page.locator('.ant-btn').filter({ hasText: 'Add' }).first();
    await expect(addBtn).toBeVisible({ timeout: SLOW });
    await page.mouse.move(960, 540);
    await page.waitForTimeout(1_000);
    await addBtn.click({ timeout: 15_000 });

    const modal = page.locator('.ant-modal-content').first();
    await expect(modal).toBeVisible({ timeout: SLOW });
    await modal.locator('input[placeholder="Enter name"]').fill(DUP_TEMPLATE_NAME);

    async function selectFirstOption(labelText: RegExp) {
      const select = modal.locator('label, *').filter({ hasText: labelText }).last()
        .locator('xpath=following::*[contains(concat(" ", normalize-space(@class), " "), " ant-select ")][1]');
      await select.click();
      const dropdown = page.locator('.ant-select-dropdown').locator('visible=true').first();
      await expect(dropdown).toBeVisible({ timeout: 30_000 });
      const firstOpt = dropdown.locator('.ant-select-item-option').first();
      await expect(firstOpt).toBeVisible({ timeout: 30_000 });
      const text = (await firstOpt.textContent())?.trim();
      await firstOpt.click();
      return text;
    }
    await selectFirstOption(/Period Type Covered/i);
    await selectFirstOption(/Progress Reporting Cycle/i);

    const createPostPromise = page
      .waitForResponse((r) => r.request().method() === 'POST' && /PerformanceReportTemplate/i.test(r.url()), { timeout: 60_000 })
      .catch(() => null);
    await modal.getByRole('button', { name: /^Create$/ }).click();
    const createPost = await createPostPromise;
    expect(createPost, 'precondition setup: the template should be saved').toBeTruthy();
    expect(createPost!.status(), 'precondition setup: save succeeds').toBeLessThan(400);
    const templateId: string | null = (await createPost!.json().catch(() => null))?.result?.id ?? null;
    expect(templateId, 'precondition setup: the create response should return a template id').toBeTruthy();
    await expect(modal).toBeHidden({ timeout: 90_000 });
    console.log(`PRECONDITION — template saved (id ${templateId})`);

    const junctionIds: string[] = [];
    try {
      await page.goto(`${BASE}/dynamic/Epm/perfomance-report-template-details?id=${templateId}`, { waitUntil: 'domcontentloaded' });
      await expect(page.locator('.ant-spin-spinning')).toHaveCount(0, { timeout: SLOW });
      await page.waitForTimeout(1_500);

      async function addDepartmentRow(canBeRoot: boolean) {
        const responsiveMenuTrigger = page.locator('ul[class*="sha-responsive-button-gr"] .ant-menu-submenu-title').last();
        await expect(responsiveMenuTrigger).toBeVisible({ timeout: SLOW });
        await responsiveMenuTrigger.click({ timeout: 15_000 });
        await page.waitForTimeout(500);
        const addMenuItem = page.locator('.ant-menu-item:visible, .ant-dropdown-menu-item:visible').filter({ hasText: /^Add$/ }).first();
        await expect(addMenuItem).toBeVisible({ timeout: 15_000 });
        await addMenuItem.click({ timeout: 15_000 });

        const addModal = page.locator('.ant-modal-content').filter({ hasText: 'Add New Performance Report Allowed Component Type' }).first();
        await expect(addModal).toBeVisible({ timeout: SLOW });
        const typeSelect = addModal.locator('label').filter({ hasText: /^Component Type/i }).first()
          .locator('xpath=following::*[contains(concat(" ", normalize-space(@class), " "), " ant-select ")][1]');
        await typeSelect.click();
        const typeDropdown = page.locator('.ant-select-dropdown').locator('visible=true').first();
        await expect(typeDropdown).toBeVisible({ timeout: 30_000 });
        await page.keyboard.type('Department');
        await page.waitForTimeout(1_000);
        const departmentOption = typeDropdown.locator('.ant-select-item-option').filter({ hasText: /^Department$/ }).first();
        const optionAvailable = await departmentOption.isVisible().catch(() => false);
        if (!optionAvailable) {
          // The picker can legitimately enforce "no duplicates" by filtering an already-added type
          // out entirely, without ever sending a request — a valid alternative to a server 4xx.
          await page.keyboard.press('Escape');
          return { rejectedClientSide: true, post: null as any };
        }
        await departmentOption.click();
        await expect(typeSelect.locator('.ant-select-selection-item')).toHaveText('Department', { timeout: 30_000 });
        if (canBeRoot) {
          const canBeRootCheckbox = addModal.locator('label').filter({ hasText: /^Can Be Root/i }).first()
            .locator('xpath=following::input[@type="checkbox"][1]');
          await canBeRootCheckbox.check({ timeout: 15_000 });
        }
        const postPromise = page
          .waitForResponse((r) => r.request().method() === 'POST' && /PerformanceReportAllowedComponentType/i.test(r.url()), { timeout: 15_000 })
          .catch(() => null);
        await addModal.getByRole('button', { name: /^OK$/ }).click();
        const post = await Promise.race([postPromise, page.waitForTimeout(5_000).then(() => null)]);
        const modalStillOpen = await addModal.isVisible().catch(() => false);
        if (modalStillOpen) await page.keyboard.press('Escape').catch(() => {});
        return { rejectedClientSide: false, post };
      }

      // ── PRECONDITION continued: add Department once (canBeRoot=No — not the graded claim). ─────
      const first = await addDepartmentRow(false);
      expect(first.post, 'precondition setup: the first Department row should be added').toBeTruthy();
      expect(first.post!.status(), 'precondition setup: adding the first Department row should succeed').toBeLessThan(400);
      const firstJunctionId = (await first.post!.json().catch(() => null))?.result?.id ?? null;
      if (firstJunctionId) junctionIds.push(firstJunctionId);
      console.log(`PRECONDITION — added first Department row (canBeRoot=false), junction id ${firstJunctionId}`);

      // ── STEP 2: Attempt to add Department a second time to the same template. ──────────────────
      // canBeRoot deliberately flipped to true on this attempt, so STEP 4 also proves the original
      // row's canBeRoot wasn't overwritten by the rejected/duplicate attempt.
      const second = await addDepartmentRow(true);
      let rejected: boolean;
      if (second.rejectedClientSide) {
        rejected = true;
        console.log('STEP 2 ACTUAL — Department was filtered out of the picker before a request could even be sent (client-side dedup).');
      } else if (second.post) {
        rejected = second.post.status() >= 400;
        console.log(`STEP 2 — POST ${second.post.status()} ${second.post.url()}`);
      } else {
        // No POST observed within the race window, and the picker didn't filter Department out of the
        // dropdown either — ambiguous by network timing alone (confirmed live 2026-08-28: this can
        // happen even when the duplicate IS correctly blocked, e.g. a slow/absent request with the modal
        // still closing cleanly). Fall back to ground truth: re-fetch and check whether a second row
        // actually landed, exactly like STEP 3 already does independently — don't guess from timing.
        const groundTruth = ((await (await page.request.get(`${PRACT_CRUD}/GetAll?maxResultCount=1000`, { timeout: SLOW })).json()).result?.items ?? []) as any[];
        const deptRowsNow = groundTruth.filter((r: any) => r.performanceReportTemplate?.id === templateId && r.componentType?._displayName === 'Department');
        rejected = deptRowsNow.length === 1;
        console.log(`STEP 2 — no POST observed within 5s and the picker did not filter Department out either; ground-truth Department row count for this template: ${deptRowsNow.length} (rejected: ${rejected})`);
      }
      console.log(`STEP 2 ACTUAL — duplicate add was ${rejected ? 'REJECTED' : 'ACCEPTED'}. ADO EXPECTED: "The form rejects with a unique-constraint error on the PerformanceReportAllowedComponentType junction."`);
      const secondJunctionId = second.post ? (await second.post.json().catch(() => null))?.result?.id ?? null : null;
      if (secondJunctionId) junctionIds.push(secondJunctionId);

      expect(rejected, 'STEP 2 EXPECTED: the form should reject a duplicate Department entry with a unique-constraint error').toBe(true);

      // ── STEP 3: Confirm via GetAll that only one junction row exists for Department. ────────────
      const afterDup = ((await (await page.request.get(`${PRACT_CRUD}/GetAll?maxResultCount=1000`, { timeout: SLOW })).json()).result?.items ?? []) as any[];
      const afterDupForTemplate = afterDup.filter((r: any) => r.performanceReportTemplate?.id === templateId && r.componentType?._displayName === 'Department');
      console.log(`STEP 3 — Department rows for this template after the duplicate attempt: ${afterDupForTemplate.length}`);
      expect(afterDupForTemplate.length, 'STEP 3 EXPECTED: row count for the Department junction is unchanged').toBe(1);

      // ── STEP 4: Confirm the canBeRoot value on the existing row is untouched. ───────────────────
      const existingRow = afterDupForTemplate[0];
      console.log(`STEP 4 — existing Department row canBeRoot: ${existingRow?.canBeRoot}`);
      expect(existingRow?.canBeRoot, 'STEP 4 EXPECTED: the pre-existing row is intact (canBeRoot unchanged from its original value of false)').toBe(false);
      console.log('DONE — duplicate Department entry rejected; original row untouched.');
    } finally {
      for (const jid of junctionIds) {
        const cleanup = await page.request.delete(`${PRACT_CRUD}/Delete?id=${jid}`).catch(() => null);
        console.log(`CLEANUP — removed junction ${jid}: ${cleanup ? cleanup.status() : 'request failed'}`);
      }
      if (templateId) {
        const cleanup = await page.request.delete(`${PRT_CRUD}/Delete?id=${templateId}`).catch(() => null);
        console.log(`CLEANUP — removed disposable template ${templateId}: ${cleanup ? cleanup.status() : 'request failed'}`);
      }
    }
  });

  test('TC-108816 Integration — Publishing a Performance Report using a template with wrong canBeRoot flags fails validation', async ({ page }) => {
    test.setTimeout(1_200_000);
    const NAME_SUFFIX = SHORT;
    console.log(`RUN TOKEN — ${TOKEN}`);

    await page.goto(`${BASE}/login`, { waitUntil: 'domcontentloaded' });
    await expect(page.locator('input').first()).toBeVisible({ timeout: SLOW });
    await page.locator('input').first().fill('admin.PrincessH');
    await page.locator('input[type="password"]').first().fill('123qwe');
    await page.getByRole('button', { name: /sign in|login/i }).first().click();
    await expect(page).not.toHaveURL(/\/login/, { timeout: SLOW });

    // ── PRECONDITION: "A Performance Report Template has Department set with canBeRoot equal to ────
    // false. Reporting Tree is seeded with Department as the root." Confirmed live: this state is
    // UNREACHABLE via the UI at all. The tree builder's "Add Top Level Item" only offers component
    // types where the template's Allowed Component Type row has canBeRoot=true — with Department set
    // to canBeRoot=false (as this precondition requires), clicking it does nothing whatsoever: no
    // dropdown, no modal, no error, and (confirmed via a direct Component/Crud/GetAll diff) no orphan
    // record either. The client silently refuses to let you build the very state this test case is
    // supposed to start from. So the precondition is built directly via the API instead, bypassing the
    // UI gate — the only way to reach it at all.
    const prtName = `TC108816 CanBeRoot ${NAME_SUFFIX}`;
    // Period Type Covered = Financial Year, Progress Reporting Cycle = Quarter — confirmed live
    // 2026-08-17 that these must align with the report's Period Covered ("Financial Year 2026/2027",
    // whose children are Quarters): any mismatch makes CreatePerformanceReport reject with "Period ...
    // has no child periods matching the template's reporting cycle."
    await page.goto(`${BASE}/dynamic/Epm/perfomance-report-template`, { waitUntil: 'domcontentloaded' });
    await expect(page.locator('.ant-spin-spinning')).toHaveCount(0, { timeout: SLOW });
    const addBtn = page.locator('.ant-btn').filter({ hasText: 'Add' }).first();
    await page.mouse.move(960, 540);
    await page.waitForTimeout(1_000);
    await addBtn.click({ timeout: 15_000 });
    const prtModal = page.locator('.ant-modal-content').first();
    await expect(prtModal).toBeVisible({ timeout: SLOW });
    await prtModal.locator('input[placeholder="Enter name"]').fill(prtName);
    async function selectOption(labelText: RegExp, wantText: RegExp) {
      const select = prtModal.locator('label, *').filter({ hasText: labelText }).last()
        .locator('xpath=following::*[contains(concat(" ", normalize-space(@class), " "), " ant-select ")][1]');
      await select.click();
      const dropdown = page.locator('.ant-select-dropdown').locator('visible=true').first();
      await expect(dropdown).toBeVisible({ timeout: 30_000 });
      const opts = dropdown.locator('.ant-select-item-option');
      await expect(opts.first()).toBeVisible({ timeout: 30_000 });
      await opts.filter({ hasText: wantText }).first().click();
    }
    await selectOption(/Period Type Covered/i, /Financial Year/i);
    await selectOption(/Progress Reporting Cycle/i, /Quarter/i);
    const createPostPromise = page.waitForResponse((r) => r.request().method() === 'POST' && /PerformanceReportTemplate/i.test(r.url()), { timeout: 60_000 }).catch(() => null);
    await prtModal.getByRole('button', { name: /^Create$/ }).click();
    const createPost = await createPostPromise;
    const templateId: string | null = (await createPost!.json().catch(() => null))?.result?.id ?? null;
    await expect(prtModal).toBeHidden({ timeout: 60_000 });
    expect(templateId, 'precondition setup: the disposable template should be created').toBeTruthy();
    console.log(`PRECONDITION — disposable PRT id ${templateId}`);

    const junctionIds: string[] = [];
    const componentIds: string[] = [];
    const actionerIds: string[] = [];
    let reportId: string | null = null;
    try {
      // Department, canBeRoot=FALSE — the invariant this test deliberately violates.
      const deptJunctionResp = await page.request.post(`${PRACT_CRUD}/Create`, {
        data: { performanceReportTemplate: { id: templateId }, componentType: { id: DEPARTMENT_TYPE_ID }, canBeRoot: false },
      });
      const deptJunctionId = (await deptJunctionResp.json().catch(() => null))?.result?.id ?? null;
      expect(deptJunctionId, 'precondition setup: the Department junction (canBeRoot=false) should be created').toBeTruthy();
      junctionIds.push(deptJunctionId);
      console.log(`PRECONDITION — Department junction (canBeRoot=false): ${deptJunctionId}`);

      // Quantitative KPI, canBeRoot=false (a child type never needs canBeRoot=true) — needed so the
      // report has a reportable KPI at all; otherwise Publish rejects earlier ("no reportable KPIs")
      // before ever reaching the canBeRoot check this test is actually about.
      const qkpiJunctionResp = await page.request.post(`${PRACT_CRUD}/Create`, {
        data: { performanceReportTemplate: { id: templateId }, componentType: { id: QKPI_TYPE_ID }, canBeRoot: false },
      });
      const qkpiJunctionId = (await qkpiJunctionResp.json().catch(() => null))?.result?.id ?? null;
      expect(qkpiJunctionId, 'precondition setup: the Quantitative KPI junction should be created').toBeTruthy();
      junctionIds.push(qkpiJunctionId);
      console.log(`PRECONDITION — Quantitative KPI junction: ${qkpiJunctionId}`);

      // Disposable Performance Report against this template (real custom endpoint, confirmed live —
      // not the generic Crud/Create).
      const prName = `TC108816 Report ${NAME_SUFFIX}`;
      const prResp = await page.request.post(`${API}/api/v1/Epm/PerformanceReports/CreatePerformanceReport`, {
        data: { name: prName, shortName: `TC816${NAME_SUFFIX}`, templateId: templateId, periodCoveredId: 'bb939bfa-f516-4f6b-af46-21da4c275ae5' }, // "Financial Year 2026/2027"
      });
      console.log(`PRECONDITION — Performance Report create status ${prResp.status()}`);
      reportId = (await prResp.json().catch(() => null))?.result?.id ?? null;
      expect(reportId, 'precondition setup: the disposable Performance Report should be created').toBeTruthy();
      console.log(`PRECONDITION — disposable Performance Report id ${reportId}`);

      // Seed the Reporting Tree directly: Department as root (parent=null), Quantitative KPI as its
      // child — the exact state ADO's precondition describes, built via the API since the UI's own
      // "Add Top Level Item" / "Add Child Item" cannot reach it (see notes above and
      // [[epm-add-child-item-dropdown-defect]]).
      const rootResp = await page.request.post(`${COMPONENT_CRUD}/Create`, {
        data: { name: `TC108816 RootDept ${NAME_SUFFIX}`, componentType: { id: DEPARTMENT_TYPE_ID }, performanceReport: { id: reportId } },
      });
      const rootId = (await rootResp.json().catch(() => null))?.result?.id ?? null;
      expect(rootId, 'precondition setup: the root Department component should be created').toBeTruthy();
      componentIds.push(rootId);
      console.log(`PRECONDITION — root Department component (canBeRoot=false on its template row): ${rootId}`);

      const childResp = await page.request.post(`${COMPONENT_CRUD}/Create`, {
        data: {
          name: `TC108816 ChildQKPI ${NAME_SUFFIX}`, componentType: { id: QKPI_TYPE_ID }, performanceReport: { id: reportId }, parent: { id: rootId },
          refNo: `TC816_QKPI_${NAME_SUFFIX}`, description: 'TC-108816 disposable KPI', orderIndex: 1, perfIndexWeight: 1,
          finalIndicatorTargetText: '100', componentDefinition: { id: QKPI_DEFINITION_ID },
        },
      });
      const childId = (await childResp.json().catch(() => null))?.result?.id ?? null;
      expect(childId, 'precondition setup: the Quantitative KPI child component should be created').toBeTruthy();
      componentIds.push(childId);
      console.log(`PRECONDITION — child Quantitative KPI component: ${childId}`);

      // Assign a Process Owner (a ComponentActioner row) so Publish's "has reportable KPIs" and "KPI
      // has an assigned Process Owner" gates both pass, clearing the way to whatever gate is next.
      const actionerResp = await page.request.post(`${ACTIONER_CRUD}/Create`, {
        data: { actionLevel: 20, actioner: { id: ACTIONER_PERSON_ID }, component: { id: childId } },
      });
      const actionerId = (await actionerResp.json().catch(() => null))?.result?.id ?? null;
      expect(actionerId, 'precondition setup: the Process Owner actioner row should be created').toBeTruthy();
      actionerIds.push(actionerId);
      console.log(`PRECONDITION — Process Owner actioner (level 20, Princess Hlazo): ${actionerId}`);

      // ── STEP 2: Attempt to Publish the Performance Report via the User Interface Publish action. ──
      // Locators are exact-text on purpose: "Publish Performance Report" is a literal substring of
      // "Unpublish Performance Report" (the button this page shows once published), and
      // "PublishPerformanceReport" is likewise a literal substring of the app's own
      // "UnpublishPerformanceReport" endpoint — a loose /Publish/i match on either would silently
      // capture the wrong button/response after the report's state flips.
      await page.goto(`${BASE}/dynamic/Epm/performance-report-details-view?id=${reportId}`, { waitUntil: 'domcontentloaded' });
      await expect(page.locator('.ant-spin-spinning')).toHaveCount(0, { timeout: SLOW });
      await page.waitForTimeout(1_500);
      const publishBtn = page.locator('button, a, .ant-btn').filter({ hasText: /^Publish Performance Report$/i }).first();
      await expect(publishBtn, 'STEP 2: the Publish Performance Report action should be visible').toBeVisible({ timeout: SLOW });
      const publishRespPromise = page.waitForResponse((r) => r.request().method() !== 'GET' && /(?<!Un)PublishPerformanceReport/i.test(r.url()), { timeout: 30_000 }).catch(() => null);
      await publishBtn.click({ timeout: 15_000 });
      const publishResp = await publishRespPromise;
      const publishBody = publishResp ? await publishResp.json().catch(() => null) : null;
      const publishRejected = (publishResp?.status() ?? 200) >= 400;
      const publishMessage: string = publishBody?.error?.message ?? '';
      console.log(`STEP 2 — Publish status ${publishResp?.status()}; message: ${publishMessage || '(none)'}`);
      await page.waitForTimeout(1_000);
      const statusAfterStep2 = (await page.locator('body').innerText()).match(/PLANNING|REPORTING IN PROGRESS|PUBLISHED|DRAFT/i)?.[0] ?? '(unknown)';
      console.log(`STEP 2 — report status badge after click: ${statusAfterStep2}`);
      console.log('STEP 2 ACTUAL. ADO EXPECTED: "The publish is rejected by ValidateReadyToPublishAsync with an error citing canBeRoot invariants."');

      // CONFIRMED GENUINE DEFECT: publish succeeds immediately (HTTP 200, no error, status badge
      // flips out of PLANNING) even though Department's Allowed Component Type row on this template
      // has canBeRoot=false and is the tree's actual root. ValidateReadyToPublishAsync does correctly
      // enforce two earlier gates (confirmed separately, live 2026-08-17: publishing rejects with "The
      // report has no reportable KPIs" when the tree has no KPI descendants, and with "N KPI(s) have no
      // assigned Process Owner" when a KPI lacks an actioner) — but canBeRoot is never checked at all.
      // This matches the pattern already confirmed elsewhere in this project of a documented invariant
      // that simply isn't implemented server-side (see [[epm-canberoot-leaf-rejection-not-implemented]]
      // and [[epm-allowable-child-self-reference-not-rejected]]).
      expect.soft(publishRejected, 'STEP 2 EXPECTED (confirmed BUG — no canBeRoot validation exists at publish time at all): publish should be rejected when the tree\'s root component type has canBeRoot=false on its template').toBe(true);

      // ── STEP 3: Fix the template so Department has canBeRoot equal to true. ────────────────────
      // The grid's own inline-edit affordance for an existing Allowed Component Type row was not
      // established live in this session (only the Add flow was confirmed working, in TC-108779) —
      // applied via the API instead, consistent with this precondition's API-only build above. Applied
      // regardless of STEP 2's outcome, per ADO's literal script.
      const fixResp = await page.request.put(`${PRACT_CRUD}/Update`, { data: { id: deptJunctionId, canBeRoot: true } });
      expect(fixResp.status(), 'STEP 3 EXPECTED: the correction is saved').toBeLessThan(400);
      console.log(`STEP 3 — Department junction canBeRoot flipped to true (status ${fixResp.status()})`);

      // ── STEP 4: Retry Publish. ──────────────────────────────────────────────────────────────────
      if (!publishRejected) {
        // Direct consequence of the STEP 2 defect: the report is already published, so "retry
        // Publish" as ADO literally describes it is unreachable — the button this page shows now is
        // "Unpublish Performance Report", not "Publish Performance Report". Documented rather than
        // forced: confirm the button really did flip (proving STEP 2 genuinely published it, not just
        // returned 200 with no effect) instead of clicking something that isn't really "retry".
        const unpublishBtn = page.getByText('Unpublish Performance Report', { exact: true }).first();
        const flippedToUnpublish = await unpublishBtn.isVisible({ timeout: 15_000 }).catch(() => false);
        console.log(`STEP 4 — unreachable as ADO describes it (STEP 2 already published the report). Button now reads "Unpublish Performance Report": ${flippedToUnpublish}`);
        console.log('STEP 4 ACTUAL. ADO EXPECTED: "Publish succeeds and the audit trail records the correction and the successful publish."');
        expect(flippedToUnpublish, 'sanity check: the report should genuinely be in a published state after STEP 2').toBe(true);
      } else {
        // STEP 2 behaved as ADO expects (rejected) — now genuinely retry with the fix applied.
        const retryRespPromise = page.waitForResponse((r) => r.request().method() !== 'GET' && /(?<!Un)PublishPerformanceReport/i.test(r.url()), { timeout: 30_000 }).catch(() => null);
        await publishBtn.click({ timeout: 15_000 });
        const retryResp = await retryRespPromise;
        const retryBody = retryResp ? await retryResp.json().catch(() => null) : null;
        console.log(`STEP 4 — retry Publish status ${retryResp?.status()}; message: ${retryBody?.error?.message ?? '(none — success)'}`);
        console.log('STEP 4 ACTUAL. ADO EXPECTED: "Publish succeeds and the audit trail records the correction and the successful publish."');
        expect(retryResp?.status(), 'STEP 4 EXPECTED: retrying publish after the fix should succeed').toBeLessThan(400);
      }
    } finally {
      for (const aid of actionerIds) {
        const cleanup = await page.request.delete(`${ACTIONER_CRUD}/Delete?id=${aid}`).catch(() => null);
        console.log(`CLEANUP — removed actioner ${aid}: ${cleanup ? cleanup.status() : 'request failed'}`);
      }
      // children before parents
      for (const cid of [...componentIds].reverse()) {
        const cleanup = await page.request.delete(`${COMPONENT_CRUD}/Delete?id=${cid}`).catch(() => null);
        console.log(`CLEANUP — removed component ${cid}: ${cleanup ? cleanup.status() : 'request failed'}`);
      }
      if (reportId) {
        const cleanup = await page.request.delete(`${PR_CRUD}/Delete?id=${reportId}`).catch(() => null);
        console.log(`CLEANUP — removed disposable report ${reportId}: ${cleanup ? cleanup.status() : 'request failed'}`);
      }
      for (const jid of junctionIds) {
        const cleanup = await page.request.delete(`${PRACT_CRUD}/Delete?id=${jid}`).catch(() => null);
        console.log(`CLEANUP — removed junction ${jid}: ${cleanup ? cleanup.status() : 'request failed'}`);
      }
      if (templateId) {
        const cleanup = await page.request.delete(`${PRT_CRUD}/Delete?id=${templateId}`).catch(() => null);
        console.log(`CLEANUP — removed disposable template ${templateId}: ${cleanup ? cleanup.status() : 'request failed'}`);
      }
    }
  });
});
