import { test, expect } from '@playwright/test';

// Derived artefact — the canonical source is epm-performance-report-creation.md, which mirrors ADO
// test case 108780 in suite 109507 ("08 · EPM · Performance Report creation — planning shell"), plan
// 108745. Edit the .md (and the ADO case), not this file, except for AI-repair patches.

const BASE = 'https://pd-epm-adminportal-qa-wf.shesha.app';

// ADO's literal Name is "Test Department APP 2026-27" with no uniqueness caveat, but this hub's QA
// data already accumulates same-named leftovers across runs (see epm-unit-of-measure's duplicate-name
// lesson) and this test cleans up its own record anyway, so a token keeps reruns collision-free.
const TOKEN = process.env.TC108780_TOKEN || `TC108780-${Date.now()}`;
const SHORT = TOKEN.replace(/\D/g, '').slice(-6);
const REPORT_NAME = `Test Department APP 2026-27 ${SHORT}`;
const REPORT_SHORT_NAME = `PR${SHORT}`;
// Confirmed live 2026-08-17: a stable, non-disposable catalog template with exactly this name already
// exists in QA (id not hardcoded — selected by name in the UI), satisfying ADO's precondition. Anchor
// on `^...$` so a same-run, token-suffixed disposable template from TC-108779
// (epm-performance-report-template-allowed-component-types.spec.ts) never gets picked by mistake.
const TEMPLATE_NAME = 'Standard Annual Performance Plan';

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
  test('TC-108780 Positive — Create a Performance Report shell tied to a valid Performance Report Template', async ({ page }) => {
    test.setTimeout(1_200_000);
    console.log(`RUN TOKEN — ${TOKEN}`);
    console.log(`  Report name=${REPORT_NAME}`);

    // PRECONDITION: Signed in as administrator. Standard Annual Performance Plan template exists
    // (confirmed live — a stable catalog entry, not one this test needs to create).
    await page.goto(`${BASE}/login`, { waitUntil: 'domcontentloaded' });
    await expect(page.locator('input').first()).toBeVisible({ timeout: SLOW });
    await page.locator('input').first().fill('admin.PrincessH');
    await page.locator('input[type="password"]').first().fill('123qwe');
    await page.getByRole('button', { name: /sign in|login/i }).first().click();
    await expect(page).not.toHaveURL(/\/login/, { timeout: SLOW });

    // STEP 1: Navigate to the Performance Report list. ADO's literal route (/dynamic/Epm/PerformanceReport/)
    // is not real — the real route, per epm-performance-report-tree-navigation memory (confirmed live
    // 2026-08-17), is /dynamic/Epm/perfomance-report-v2 (misspelled "perfomance"), reached via EPM >
    // EPM Administration > "Manage Performance Reports". The left rail is icon-only; "EPM" is a plain
    // menuitem (click, not hover) that opens a flyout with "Workflow" / "EPM Administration". Hovering
    // "EPM Administration" opens the module's page list. `visible=true` matters throughout: rc-menu
    // keeps a second, off-screen copy of each item for the collapsed inline sidebar.
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

    const addBtn = page.locator('.ant-btn').filter({ hasText: 'Add' }).first();
    const escapeRegExp = (s: string) => s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');

    // Opens a fresh Add New Performance Report modal, fills Template/Name/Short Name, selects the
    // given Period Covered value, and clicks Create. Returns the Create response (or null if none was
    // observed). The modal closes itself unconditionally after Create — confirmed live 2026-08-17 it
    // closes even on a rejected (500) save, not just on success — so each Period Covered attempt needs
    // its own fresh modal rather than reusing one across a retry loop.
    async function attemptCreate(periodText: string, opts: { captureOptionsOnly?: boolean } = {}) {
      await expect(addBtn, 'STEP 1 EXPECTED: the create form should be reachable').toBeVisible({ timeout: SLOW });
      await page.mouse.move(960, 540);
      await page.waitForTimeout(1_000);
      await addBtn.click({ timeout: 15_000 });

      const modal = page.locator('.ant-modal-content').first();
      await expect(modal, 'STEP 1 EXPECTED: the create form should load').toBeVisible({ timeout: SLOW });
      await expect(modal.locator('.ant-modal-title')).toHaveText('Add New Performance Report');

      // Searchable/paginated reference-picker (same as the sibling Component Type select in
      // epm-performance-report-template-allowed-component-types.spec.ts) — the default unfiltered list
      // can be empty/lazy, so type the exact name to filter rather than scanning the default list.
      const templateSelect = modal.locator('label, *').filter({ hasText: /^Template/i }).last()
        .locator('xpath=following::*[contains(concat(" ", normalize-space(@class), " "), " ant-select ")][1]');
      await templateSelect.click();
      const templateDropdown = page.locator('.ant-select-dropdown').locator('visible=true').first();
      await expect(templateDropdown, 'STEP 1 EXPECTED: the Template dropdown should list available templates').toBeVisible({ timeout: 30_000 });
      await page.keyboard.type(TEMPLATE_NAME);
      await page.waitForTimeout(1_000);
      const templateOptions = await templateDropdown.locator('.ant-select-item-option').allTextContents();
      if (!opts.captureOptionsOnly) {
        console.log(`STEP 1 ACTUAL — Template dropdown options (filtered on "${TEMPLATE_NAME}"): ${JSON.stringify(templateOptions)}`);
      }
      expect(templateOptions.some((t) => t.trim() === TEMPLATE_NAME), `"${TEMPLATE_NAME}" should be one of the listed templates`).toBe(true);
      await templateDropdown.locator('.ant-select-item-option').filter({ hasText: new RegExp(`^${TEMPLATE_NAME}$`) }).first().click();
      await expect(templateSelect.locator('.ant-select-selection-item')).toHaveText(TEMPLATE_NAME, { timeout: 30_000 });

      await modal.locator('input[placeholder="Enter name"]').fill(REPORT_NAME);
      await modal.locator('input[placeholder="Enter short name"]').fill(REPORT_SHORT_NAME);
      await expect(modal.locator('input[placeholder="Enter name"]')).toHaveValue(REPORT_NAME);
      await expect(modal.locator('input[placeholder="Enter short name"]')).toHaveValue(REPORT_SHORT_NAME);

      const periodSelect = modal.locator('label, *').filter({ hasText: /^Period Covered/i }).last()
        .locator('xpath=following::*[contains(concat(" ", normalize-space(@class), " "), " ant-select ")][1]');
      const periodDropdown = page.locator('.ant-select-dropdown').locator('visible=true').first();
      await periodSelect.click();
      await expect(periodDropdown).toBeVisible({ timeout: 30_000 });
      await expect(periodDropdown.locator('.ant-select-item-option').first(), 'the Period Covered dropdown should list at least one option').toBeVisible({ timeout: 30_000 });

      if (opts.captureOptionsOnly) {
        const optionTexts = (await periodDropdown.locator('.ant-select-item-option').allTextContents()).map((t) => t.trim());
        await page.keyboard.press('Escape');
        await page.waitForTimeout(300);
        await modal.getByRole('button', { name: /^Cancel$/ }).click({ timeout: 15_000 }).catch(() => {});
        return { optionTexts };
      }

      await periodDropdown.locator('.ant-select-item-option').filter({ hasText: new RegExp(`^${escapeRegExp(periodText)}$`) }).first().click();
      await expect(periodSelect.locator('.ant-select-selection-item')).toHaveText(periodText, { timeout: 15_000 });

      const createButton = modal.getByRole('button', { name: /^Create$/ });
      await expect(createButton, 'STEP 2 EXPECTED: the Create button should be enabled').toBeEnabled();
      const createPostPromise = page
        .waitForResponse((r) => r.request().method() !== 'GET' && /PerformanceReport/i.test(r.url()) && !/PerformanceReportTemplate/i.test(r.url()), { timeout: 60_000 })
        .catch(() => null);
      await createButton.click();
      const createPost = await createPostPromise;
      return { createPost, modal };
    }

    // Period Covered is a mandatory field the ADO case never specifies a value for. The server
    // validates it against the template's configured reporting cycle (confirmed live 2026-08-17: the
    // first available option, "Financial Year 2026/27", was rejected with "Period 'Financial Year
    // 2026/27' has no child periods matching the template's reporting cycle. The template expects
    // period type '1' but the children have types: 4."). Since ADO gives no value to target, enumerate
    // the options once, then try each in turn (each in its own fresh modal — see attemptCreate).
    const { optionTexts: periodOptionTexts } = await attemptCreate('', { captureOptionsOnly: true }) as { optionTexts: string[] };
    console.log(`Period Covered options: ${JSON.stringify(periodOptionTexts)}`);

    // STEP 2: Enter Name, select the Standard Annual Performance Plan template, and Save.
    // ADO's own step 4 refers to a "PerformanceReportsAppService" response — creation routes through a
    // custom AppService endpoint (confirmed live: POST .../api/v1/Epm/PerformanceReports/CreatePerformanceReport
    // on the -wf API host), not the generic dynamic Crud/Create path.
    let reportId: string | null = null;
    let succeededPeriod: string | null = null;
    let lastErrorBody: string | null = null;
    let successModal: ReturnType<typeof page.locator> | null = null;
    // CreatePerformanceReport runs on the -wf API host (confirmed live), which is a separate backend
    // from the -qa host every other EPM spec's generic dynamic Crud calls use (see
    // epm-ado-plan-suite-map's host-discrepancy note) — confirmed live 2026-08-17: deleting/reading
    // this report via the -qa PR_CRUD/COMPONENT_CRUD constants 404s because the record simply doesn't
    // exist on that host's database. Derive the real origin from the successful Create response itself
    // rather than assuming either hardcoded host.
    let apiOrigin: string | null = null;
    for (const periodText of periodOptionTexts) {
      const { createPost, modal: attemptModal } = await attemptCreate(periodText);
      if (!createPost) {
        console.log(`Period "${periodText}": no Create response observed, trying next option`);
        continue;
      }
      console.log(`Period "${periodText}" — POST ${createPost.status()} ${createPost.url()}`);
      if (createPost.status() < 400) {
        const body = await createPost.json().catch(() => null);
        if (body?.success && body?.result?.id) {
          reportId = body.result.id;
          succeededPeriod = periodText;
          successModal = attemptModal ?? null;
          apiOrigin = new URL(createPost.url()).origin;
          break;
        }
        lastErrorBody = JSON.stringify(body);
        console.log(`Period "${periodText}": 2xx but no success/id in body: ${lastErrorBody}`);
      } else {
        lastErrorBody = await createPost.text().catch((e) => `(could not read body: ${e})`);
        console.log(`Period "${periodText}" rejected: ${lastErrorBody}`);
      }
    }

    if (!reportId) {
      // GENUINE DEFECT / DATA GAP path (not a script bug): every available Period Covered option was
      // rejected by CreatePerformanceReport with a period-type mismatch against the "Standard Annual
      // Performance Plan" template's configured reporting cycle. ADO's precondition ("template exists")
      // is incomplete — it does not mention that the Period Covered value must also be compatible with
      // the template's cycle. This DID happen live on 2026-08-17 (see
      // epm-performance-report-create-period-cycle-mismatch memory) — the template's Progress Cycle
      // Type was Financial Year while every real Period's children were Quarter-typed. RESOLVED the
      // same day by correcting the template's Progress Cycle Type to Quarter. This retry-loop and
      // expect.soft stay in place as a safety net: ADO still specifies no Period value, so a future
      // template misconfiguration would hit this same path and should be caught and documented here,
      // not silently mis-picked.
      expect.soft(
        Boolean(reportId),
        `STEP 2 EXPECTED (confirmed defect/data gap): none of the Period Covered options (${JSON.stringify(periodOptionTexts)}) were accepted for template "${TEMPLATE_NAME}" — last error: ${lastErrorBody}`,
      ).toBe(true);
      console.log('STEP 2 ACTUAL — every Period Covered option was rejected; see expect.soft failure above for detail. Skipping STEP 3 (no report was created).');
      return;
    }
    console.log(`STEP 2 ACTUAL — report saved (id ${reportId}) using Period Covered "${succeededPeriod}"`);

    try {
      // STEP 2 EXPECTED: a confirmation toast appears. The Performance Report list refreshes and the
      // new record shows status = Planning.
      if (successModal) {
        await expect(successModal, 'modal should close on successful save').toBeHidden({ timeout: 90_000 });
      }
      await expect(page.locator('.ant-message-notice, .ant-notification-notice').first())
        .toContainText(/successfully created|created successfully/i, { timeout: 60_000 });

      const listRow = page.locator('[role="row"]', { hasText: REPORT_NAME }).first();
      await expect(listRow, 'STEP 2 EXPECTED: the new record should appear in the list').toBeVisible({ timeout: SLOW });
      await expect(listRow, 'STEP 2 EXPECTED: the new record should show status Planning').toContainText(/Planning/i, { timeout: SLOW });
      console.log('STEP 2 ACTUAL — confirmation toast shown; list row shows status Planning.');

      // STEP 3: Open the record and inspect the response body from PerformanceReportsAppService.
      const detailsResponses: { url: string; status: number; body: any }[] = [];
      page.on('response', async (r) => {
        if (r.request().method() === 'GET' && /PerformanceReport/i.test(r.url()) && !/PerformanceReportTemplate/i.test(r.url())) {
          const body = await r.json().catch(() => null);
          detailsResponses.push({ url: r.url(), status: r.status(), body });
        }
      });
      await page.goto(`${BASE}/dynamic/Epm/performance-report-details-view?id=${reportId}`, { waitUntil: 'domcontentloaded' });
      await expect(page.locator('.ant-spin-spinning')).toHaveCount(0, { timeout: SLOW });
      await page.waitForTimeout(2_000);

      // Confirmed live 2026-08-17: this page's details fetch never fires a GET matching /PerformanceReport/i
      // (either a POST, a cached/already-hydrated view, or a differently-shaped call) — the underlying
      // facts ADO's step 4 cares about (status, template reference) are verified below directly against
      // the rendered page text instead, which is the real, reliable signal.
      const relevant = detailsResponses.find((r) => r.body?.result?.id === reportId) ?? detailsResponses[0] ?? null;
      console.log(`STEP 3 — captured ${detailsResponses.length} PerformanceReport-related GET response(s); using ${relevant?.url ?? '(none — verifying via rendered page text instead)'}`);
      if (relevant) {
        console.log(`STEP 3 ACTUAL — response body: ${JSON.stringify(relevant.body?.result ?? relevant.body).slice(0, 500)}`);
      }

      // STEP 3 EXPECTED (a): response includes status Planning.
      const statusBadge = (await page.locator('body').innerText()).match(/PLANNING|REPORTING IN PROGRESS|PUBLISHED|DRAFT/i)?.[0] ?? '(unknown)';
      console.log(`STEP 3 — details-view status badge: ${statusBadge}`);
      expect(statusBadge.toUpperCase(), 'STEP 3 EXPECTED: the opened record should show status Planning').toBe('PLANNING');

      // STEP 3 EXPECTED (b): response includes the correct template reference.
      const templateRefText = await page.locator('body').innerText();
      expect(templateRefText, 'STEP 3 EXPECTED: the opened record should reference the selected template').toContain(TEMPLATE_NAME);

      // STEP 3 EXPECTED (c): no Component records exist yet for this report. Queried against the same
      // host the report was created on (apiOrigin) — see the host-mismatch note above the create loop.
      const componentCrud = `${apiOrigin}/api/dynamic/Epm/Component/Crud`;
      const allComponents = await (await page.request.get(`${componentCrud}/GetAll?maxResultCount=1000`, { timeout: SLOW })).json();
      const componentsForReport = (allComponents?.result?.items ?? allComponents?.result ?? []).filter(
        (c: any) => c?.performanceReport?.id === reportId,
      );
      expect(componentsForReport.length, 'STEP 3 EXPECTED: no Component records should exist yet for the new report').toBe(0);
      console.log('STEP 3 ACTUAL — status Planning confirmed; template reference confirmed; zero Component records confirmed.');
    } finally {
      if (reportId) {
        const prCrud = `${apiOrigin}/api/dynamic/Epm/PerformanceReport/Crud`;
        const cleanup = await page.request.delete(`${prCrud}/Delete?id=${reportId}`).catch(() => null);
        console.log(`CLEANUP — removed disposable report ${reportId}: ${cleanup ? cleanup.status() : 'request failed'}`);
      }
    }
  });
});
