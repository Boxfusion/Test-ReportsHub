import { test, expect } from '@playwright/test';

// Derived artefact — the canonical source is epm-performance-report-missing-template.md, which mirrors
// ADO test case 108817 in suite 109507 ("08 · EPM · Performance Report creation — planning shell"),
// plan 108745. Edit the .md (and the ADO case), not this file, except for AI-repair patches.

const BASE = 'https://pd-epm-adminportal-qa-wf.shesha.app';
const API = 'https://pd-epm-api-qa-wf.shesha.app';
const PERIOD_CRUD = `${API}/api/dynamic/Shesha.Enterprise/Period/Crud`;

const TOKEN = process.env.TC108817_TOKEN || `TC108817-${Date.now()}`;
const SHORT = TOKEN.replace(/\D/g, '').slice(-6);
const REPORT_NAME = `Missing Template Test ${SHORT}`;
const REPORT_SHORT_NAME = `MT${SHORT}`;
// Confirmed live 2026-08-17: a stable, non-disposable catalog template with exactly this name exists in
// QA. See epm-performance-report-create-period-cycle-mismatch memory — this template's Progress Cycle
// Type was corrected to Quarter the same day (confirmed still correct 2026-08-28: periodTypeCovered=1,
// progressReportingCycle=4).
const TEMPLATE_NAME = 'Standard Annual Performance Plan';
// The plain "Financial Year 2026/27" period this spec used to rely on no longer exists at all (confirmed
// live 2026-08-28 — see epm-performance-report-period-covered-stale memory) — every remaining Financial
// Year period in QA is a disposable, test-token-suffixed leftover from other specs, too fragile to depend
// on. Build a fresh, self-owned Financial Year period (with one Quarter child, matching the template's
// periodTypeCovered=1/progressReportingCycle=4 requirement) via API instead, and clean it up afterward.
const PERIOD_NAME = `TC108817 FY ${SHORT}`;

const SLOW = 420_000;
const RAW_CHANNEL = process.env.PW_CHANNEL === undefined ? 'chrome' : process.env.PW_CHANNEL;
const CHANNEL = RAW_CHANNEL === '' || RAW_CHANNEL === 'chromium' ? undefined : RAW_CHANNEL;

test.use({
  channel: CHANNEL,
  viewport: { width: 1920, height: 1080 },
  actionTimeout: 30_000,
  navigationTimeout: 120_000,
});

test.describe('EPM — Performance Report creation (ADO plan 108745 / suite 109507)', () => {
  test('TC-108817 Negative — Reject Performance Report save when Template dropdown is empty', async ({ page }) => {
    test.setTimeout(1_200_000);
    console.log(`RUN TOKEN — ${TOKEN}`);
    console.log(`  Report name=${REPORT_NAME}`);

    // PRECONDITION: Signed in as administrator. Performance Report create form loaded.
    await page.goto(`${BASE}/login`, { waitUntil: 'domcontentloaded' });
    await expect(page.locator('input').first()).toBeVisible({ timeout: SLOW });
    await page.locator('input').first().fill('admin.PrincessH');
    await page.locator('input[type="password"]').first().fill('123qwe');
    await page.getByRole('button', { name: /sign in|login/i }).first().click();
    await expect(page).not.toHaveURL(/\/login/, { timeout: SLOW });

    // Setup (not the graded claim): build a fresh, disposable Financial Year period with one Quarter
    // child, since the real "Financial Year 2026/27" period this test used to rely on no longer exists.
    const fyResp = await page.request.post(`${PERIOD_CRUD}/Create`, {
      data: { name: PERIOD_NAME, shortName: `FY${SHORT}`, periodStart: '2026-04-01T00:00:00', periodEnd: '2027-03-31T00:00:00', periodType: 1 },
    });
    expect(fyResp.status(), 'setup: creating the disposable Financial Year period should succeed').toBeLessThan(400);
    const fyPeriod = (await fyResp.json())?.result;
    console.log(`Setup — created disposable Financial Year period "${fyPeriod.name}" (id ${fyPeriod.id})`);
    const qResp = await page.request.post(`${PERIOD_CRUD}/Create`, {
      data: {
        name: `${PERIOD_NAME} Q1`, shortName: `Q1${SHORT}`, periodStart: '2026-04-01T00:00:00', periodEnd: '2026-06-30T00:00:00',
        periodType: 4, parentPeriod: { id: fyPeriod.id },
      },
    });
    expect(qResp.status(), 'setup: creating the disposable Quarter child period should succeed').toBeLessThan(400);
    const qPeriod = (await qResp.json())?.result;
    console.log(`Setup — created disposable Quarter child period "${qPeriod.name}" (id ${qPeriod.id})`);

    try {
    // Navigate EPM > EPM Administration > Manage Performance Reports. See
    // epm-nav-restructured-epm-administration-flyout memory — click (not hover) "EPM", hover "EPM
    // Administration", then click the target link. `visible=true` matters throughout: rc-menu keeps a
    // second, off-screen copy of each item for the collapsed inline sidebar.
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

    // PRECONDITION EXPECTED: Performance Report create form loaded.
    const addBtn = page.locator('.ant-btn').filter({ hasText: 'Add' }).first();
    await expect(addBtn, 'PRECONDITION EXPECTED: the create form should be reachable').toBeVisible({ timeout: SLOW });
    await page.mouse.move(960, 540);
    await page.waitForTimeout(1_000);
    await addBtn.click({ timeout: 15_000 });

    const modal = page.locator('.ant-modal-content').first();
    await expect(modal, 'PRECONDITION EXPECTED: the create form should load').toBeVisible({ timeout: SLOW });
    await expect(modal.locator('.ant-modal-title')).toHaveText('Add New Performance Report');

    // STEP 1: Enter Name but leave Template dropdown empty. Save.
    // Short Name and Period Covered are filled too (both mandatory, neither under test here — see
    // epm-performance-report-create-period-cycle-mismatch memory) so Template is isolated as the only
    // missing field, cleanly attributing any rejection to it rather than a different missing field.
    await modal.locator('input[placeholder="Enter name"]').fill(REPORT_NAME);
    await modal.locator('input[placeholder="Enter short name"]').fill(REPORT_SHORT_NAME);
    await expect(modal.locator('input[placeholder="Enter name"]')).toHaveValue(REPORT_NAME);
    await expect(modal.locator('input[placeholder="Enter short name"]')).toHaveValue(REPORT_SHORT_NAME);

    const periodSelect = modal.locator('label, *').filter({ hasText: /^Period Covered/i }).last()
      .locator('xpath=following::*[contains(concat(" ", normalize-space(@class), " "), " ant-select ")][1]');
    const dropdown = page.locator('.ant-select-dropdown').locator('visible=true').first();
    await periodSelect.click();
    await expect(dropdown).toBeVisible({ timeout: 30_000 });
    await expect(dropdown.locator('.ant-select-item-option').first(), 'the Period Covered dropdown should list at least one option').toBeVisible({ timeout: 30_000 });
    await dropdown.locator('.ant-select-item-option').filter({ hasText: new RegExp(`^${PERIOD_NAME}$`) }).first().click();
    await expect(periodSelect.locator('.ant-select-selection-item')).toHaveText(PERIOD_NAME, { timeout: 15_000 });

    // Template is deliberately left untouched (empty).
    const createButton = modal.getByRole('button', { name: /^Create$/ });

    // STEP 1 EXPECTED: the form rejects with a validation error citing the missing Template field.
    // Confirmed live 2026-08-17: this form has NO client-side required-field guard on Template — the
    // Create button stays enabled and clicking it does send the request; the server rejects it instead
    // (500, not a clean 400 — same custom AppService quirk as the period-cycle-mismatch case). The
    // "validation error" ADO expects is therefore server-returned and surfaced via a toast, not an
    // inline per-field antd error.
    const createPostPromise = page
      .waitForResponse((r) => r.request().method() !== 'GET' && /PerformanceReport/i.test(r.url()) && !/PerformanceReportTemplate/i.test(r.url()), { timeout: 30_000 })
      .catch(() => null);
    await createButton.click({ force: true });
    const createPost = await createPostPromise;
    expect(createPost, 'STEP 1 EXPECTED: the save attempt should reach the server').toBeTruthy();
    console.log(`STEP 1 — POST ${createPost!.status()} ${createPost!.url()}`);
    expect(createPost!.status(), 'STEP 1 EXPECTED: the server should reject a save with no Template').toBeGreaterThanOrEqual(400);
    const errorBody = await createPost!.text().catch((e) => `(could not read body: ${e})`);
    console.log(`STEP 1 ACTUAL — error response body: ${errorBody.slice(0, 1000)}`);
    expect(errorBody.toLowerCase(), 'STEP 1 EXPECTED: the rejection should cite the missing Template field').toContain('template');
    // The modal closes itself unconditionally after ANY Create click, success or rejection alike —
    // confirmed live earlier this session (see epm-performance-report-creation.spec.ts / the
    // period-cycle-mismatch investigation). ADO's step doesn't require the modal to stay open, only
    // that no record persists, so STEP 3 below reopens a fresh modal rather than assuming this one
    // survived.
    await expect(modal, 'the modal should close after the rejected save (confirmed app behavior)').toBeHidden({ timeout: 30_000 });

    // STEP 2: Confirm no PerformanceReport record was persisted.
    const listRow = page.locator('[role="row"]', { hasText: REPORT_NAME });
    const rowCount = await listRow.count();
    console.log(`STEP 2 ACTUAL — rows matching "${REPORT_NAME}" in the list: ${rowCount}`);
    expect(rowCount, 'STEP 2 EXPECTED: no record should have been persisted').toBe(0);

    // STEP 3: Select a template and re-save. Reopen a fresh Add modal — the previous one is gone —
    // and refill every field (it starts blank).
    await addBtn.click({ timeout: 15_000 });
    const retryModal = page.locator('.ant-modal-content').first();
    await expect(retryModal, 'STEP 3: the create form should reload').toBeVisible({ timeout: SLOW });
    await expect(retryModal.locator('.ant-modal-title')).toHaveText('Add New Performance Report');

    await retryModal.locator('input[placeholder="Enter name"]').fill(REPORT_NAME);
    await retryModal.locator('input[placeholder="Enter short name"]').fill(REPORT_SHORT_NAME);

    const retryPeriodSelect = retryModal.locator('label, *').filter({ hasText: /^Period Covered/i }).last()
      .locator('xpath=following::*[contains(concat(" ", normalize-space(@class), " "), " ant-select ")][1]');
    await retryPeriodSelect.click();
    await expect(dropdown).toBeVisible({ timeout: 30_000 });
    await expect(dropdown.locator('.ant-select-item-option').first()).toBeVisible({ timeout: 30_000 });
    await dropdown.locator('.ant-select-item-option').filter({ hasText: new RegExp(`^${PERIOD_NAME}$`) }).first().click();
    await expect(retryPeriodSelect.locator('.ant-select-selection-item')).toHaveText(PERIOD_NAME, { timeout: 15_000 });

    const retryTemplateSelect = retryModal.locator('label, *').filter({ hasText: /^Template/i }).last()
      .locator('xpath=following::*[contains(concat(" ", normalize-space(@class), " "), " ant-select ")][1]');
    await retryTemplateSelect.click();
    await expect(dropdown, 'STEP 3 EXPECTED: the Template dropdown should list available templates').toBeVisible({ timeout: 30_000 });
    await page.keyboard.type(TEMPLATE_NAME);
    await page.waitForTimeout(1_000);
    await dropdown.locator('.ant-select-item-option').filter({ hasText: new RegExp(`^${TEMPLATE_NAME}$`) }).first().click();
    await expect(retryTemplateSelect.locator('.ant-select-selection-item')).toHaveText(TEMPLATE_NAME, { timeout: 30_000 });

    const retryCreateButton = retryModal.getByRole('button', { name: /^Create$/ });
    await expect(retryCreateButton, 'STEP 3 EXPECTED: the Create button should be enabled once Template is selected').toBeEnabled();
    const retryPostPromise = page
      .waitForResponse((r) => r.request().method() !== 'GET' && /PerformanceReport/i.test(r.url()) && !/PerformanceReportTemplate/i.test(r.url()), { timeout: 60_000 })
      .catch(() => null);
    await retryCreateButton.click();
    const retryPost = await retryPostPromise;
    expect(retryPost, 'STEP 3 EXPECTED: the re-save should be sent').toBeTruthy();
    console.log(`STEP 3 — POST ${retryPost!.status()} ${retryPost!.url()}`);
    expect(retryPost!.status(), 'STEP 3 EXPECTED: save succeeds').toBeLessThan(400);
    const body = await retryPost!.json().catch(() => null);
    expect(body?.success, 'STEP 3 EXPECTED: the create response reports success').toBe(true);
    const reportId: string | null = body?.result?.id ?? null;
    expect(reportId, 'the create response should return a report id').toBeTruthy();
    const apiOrigin = new URL(retryPost!.url()).origin;
    console.log(`STEP 3 ACTUAL — report saved (id ${reportId})`);

    try {
      await expect(retryModal, 'modal should close on successful save').toBeHidden({ timeout: 90_000 });
      const savedRow = page.locator('[role="row"]', { hasText: REPORT_NAME }).first();
      await expect(savedRow, 'STEP 3 EXPECTED: the new record should appear in the list').toBeVisible({ timeout: SLOW });
      await expect(savedRow, 'STEP 3 EXPECTED: the new record should show status Planning').toContainText(/Planning/i, { timeout: SLOW });
      console.log('STEP 3 ACTUAL — re-save succeeded; list row shows status Planning.');
    } finally {
      if (reportId) {
        const prCrud = `${apiOrigin}/api/dynamic/Epm/PerformanceReport/Crud`;
        const cleanup = await page.request.delete(`${prCrud}/Delete?id=${reportId}`).catch(() => null);
        console.log(`CLEANUP — removed disposable report ${reportId}: ${cleanup ? cleanup.status() : 'request failed'}`);
      }
    }
    } finally {
      // Always remove the disposable period pair, whether this run passed or failed partway through.
      // Delete the Quarter child before its Financial Year parent.
      const qCleanup = await page.request.delete(`${PERIOD_CRUD}/Delete?id=${qPeriod.id}`).catch(() => null);
      console.log(`CLEANUP — removed disposable Quarter period ${qPeriod.id}: ${qCleanup ? qCleanup.status() : 'request failed'}`);
      const fyCleanup = await page.request.delete(`${PERIOD_CRUD}/Delete?id=${fyPeriod.id}`).catch(() => null);
      console.log(`CLEANUP — removed disposable Financial Year period ${fyPeriod.id}: ${fyCleanup ? fyCleanup.status() : 'request failed'}`);
    }
  });
});
