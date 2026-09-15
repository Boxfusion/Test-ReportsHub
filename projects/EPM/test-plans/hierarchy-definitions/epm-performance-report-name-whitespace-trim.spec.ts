import { test, expect } from '@playwright/test';

// Derived artefact — the canonical source is epm-performance-report-name-whitespace-trim.md, which
// mirrors ADO test case 108818 in suite 109507 ("08 · EPM · Performance Report creation — planning
// shell"), plan 108745. Edit the .md (and the ADO case), not this file, except for AI-repair patches.

const BASE = 'https://pd-epm-adminportal-qa-wf.shesha.app';
const API = 'https://pd-epm-api-qa-wf.shesha.app';
const PERIOD_CRUD = `${API}/api/dynamic/Shesha.Enterprise/Period/Crud`;

const TOKEN = process.env.TC108818_TOKEN || `TC108818-${Date.now()}`;
const SHORT = TOKEN.replace(/\D/g, '').slice(-6);
const TRIMMED_NAME = `Test Report ${SHORT}`;
const UNTRIMMED_NAME = `  ${TRIMMED_NAME}  `;
const REPORT_SHORT_NAME = `WS${SHORT}`;
// Confirmed live 2026-08-17: stable catalog template + a Period compatible with its reporting cycle
// (see epm-performance-report-create-period-cycle-mismatch memory).
const TEMPLATE_NAME = 'Standard Annual Performance Plan';
// The plain "Financial Year 2026/27" period no longer exists in QA at all (confirmed 2026-08-28 — see
// epm-performance-report-period-covered-stale memory); every remaining Financial Year period is a
// disposable, test-token-suffixed leftover from other specs. Built fresh per run instead (see setup).
const PERIOD_NAME = `TC108818 FY ${SHORT}`;

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
  test('TC-108818 Edge — Performance Report Name preserves leading and trailing whitespace as trimmed', async ({ page }) => {
    test.setTimeout(1_200_000);
    console.log(`RUN TOKEN — ${TOKEN}`);
    console.log(`  Untrimmed name="${UNTRIMMED_NAME}"`);

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

    // Navigate EPM > EPM Administration > Manage Performance Reports (see
    // epm-nav-restructured-epm-administration-flyout memory). This nav has a known ~1/3 flake landing
    // on workflows-inbox instead (see epm-performance-report-modal-and-nav-quirks memory) — a plain
    // re-run is the accepted fix if that happens, not a script bug to chase here.
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
    const dropdown = page.locator('.ant-select-dropdown').locator('visible=true').first();

    // Opens a fresh Add New Performance Report modal and fills Name (as given, untrimmed or not),
    // Short Name, Period Covered, and Template, then clicks Create. The modal closes itself
    // unconditionally after Create (success or rejection) — see epm-performance-report-modal-and-nav-quirks
    // memory — so each attempt needs its own fresh modal.
    async function attemptCreate(nameValue: string) {
      await expect(addBtn, 'the create form should be reachable').toBeVisible({ timeout: SLOW });
      await page.mouse.move(960, 540);
      await page.waitForTimeout(1_000);
      await addBtn.click({ timeout: 15_000 });

      const modal = page.locator('.ant-modal-content').first();
      await expect(modal, 'the create form should load').toBeVisible({ timeout: SLOW });
      await expect(modal.locator('.ant-modal-title')).toHaveText('Add New Performance Report');

      await modal.locator('input[placeholder="Enter name"]').fill(nameValue);
      await modal.locator('input[placeholder="Enter short name"]').fill(REPORT_SHORT_NAME);
      await expect(modal.locator('input[placeholder="Enter name"]')).toHaveValue(nameValue);

      const periodSelect = modal.locator('label, *').filter({ hasText: /^Period Covered/i }).last()
        .locator('xpath=following::*[contains(concat(" ", normalize-space(@class), " "), " ant-select ")][1]');
      await periodSelect.click();
      await expect(dropdown).toBeVisible({ timeout: 30_000 });
      await expect(dropdown.locator('.ant-select-item-option').first()).toBeVisible({ timeout: 30_000 });
      await dropdown.locator('.ant-select-item-option').filter({ hasText: new RegExp(`^${PERIOD_NAME}$`) }).first().click();
      await expect(periodSelect.locator('.ant-select-selection-item')).toHaveText(PERIOD_NAME, { timeout: 15_000 });

      const templateSelect = modal.locator('label, *').filter({ hasText: /^Template/i }).last()
        .locator('xpath=following::*[contains(concat(" ", normalize-space(@class), " "), " ant-select ")][1]');
      await templateSelect.click();
      await expect(dropdown).toBeVisible({ timeout: 30_000 });
      await page.keyboard.type(TEMPLATE_NAME);
      await page.waitForTimeout(1_000);
      await dropdown.locator('.ant-select-item-option').filter({ hasText: new RegExp(`^${TEMPLATE_NAME}$`) }).first().click();
      await expect(templateSelect.locator('.ant-select-selection-item')).toHaveText(TEMPLATE_NAME, { timeout: 30_000 });

      const createButton = modal.getByRole('button', { name: /^Create$/ });
      await expect(createButton, 'the Create button should be enabled').toBeEnabled();
      const createPostPromise = page
        .waitForResponse((r) => r.request().method() !== 'GET' && /PerformanceReport/i.test(r.url()) && !/PerformanceReportTemplate/i.test(r.url()), { timeout: 60_000 })
        .catch(() => null);
      await createButton.click();
      const createPost = await createPostPromise;
      return { createPost, modal };
    }

    // STEP 1: Enter Name with leading and trailing spaces and Save.
    const { createPost, modal } = await attemptCreate(UNTRIMMED_NAME);
    expect(createPost, 'STEP 1 EXPECTED: the form should accept input and the save should be sent').toBeTruthy();
    console.log(`STEP 1 — POST ${createPost!.status()} ${createPost!.url()}`);
    expect(createPost!.status(), 'STEP 1 EXPECTED: the form accepts input (save succeeds)').toBeLessThan(400);
    const body = await createPost!.json().catch(() => null);
    expect(body?.success, 'STEP 1 EXPECTED: the create response reports success').toBe(true);
    const reportId: string | null = body?.result?.id ?? null;
    expect(reportId, 'the create response should return a report id').toBeTruthy();
    const apiOrigin = new URL(createPost!.url()).origin;
    console.log(`STEP 1 ACTUAL — report saved (id ${reportId})`);
    await expect(modal, 'modal should close on successful save').toBeHidden({ timeout: 90_000 });

    try {
      // STEP 2: Verify via GetAll (against the origin this record actually lives on — see
      // epm-performance-report-create-period-cycle-mismatch memory's host-mismatch note) that the
      // persisted Name is trimmed.
      const prCrud = `${apiOrigin}/api/dynamic/Epm/PerformanceReport/Crud`;
      const getResp = await page.request.get(`${prCrud}/Get?id=${reportId}`, { timeout: SLOW });
      expect(getResp.status(), 'STEP 2: the record should be readable').toBeLessThan(400);
      const record = (await getResp.json().catch(() => null))?.result;
      console.log(`STEP 2 ACTUAL — persisted name: ${JSON.stringify(record?.name)}`);
      // CONFIRMED GENUINE DEFECT (not a script bug): the persisted Name is stored exactly as typed,
      // surrounding whitespace and all — confirmed live 2026-08-17, persisted name was literally
      // "  Test Report <token>  " rather than the trimmed "Test Report <token>" ADO expects.
      // CreatePerformanceReport does not trim the Name field server-side.
      expect.soft(
        record?.name,
        `STEP 2 EXPECTED (confirmed defect): the persisted Name should equal the trimmed value "${TRIMMED_NAME}" with no surrounding whitespace — got ${JSON.stringify(record?.name)}`,
      ).toBe(TRIMMED_NAME);

      // STEP 3: Attempt to create a second record with the same name (untrimmed). Still meaningful
      // even given STEP 2's defect: an exact-string duplicate should collide regardless of whether the
      // server trims, so this checks the uniqueness constraint exists at all — just not specifically
      // "against the trimmed name" as ADO's script frames it, since that framing assumed trimming
      // happens.
      const { createPost: secondPost } = await attemptCreate(UNTRIMMED_NAME);
      console.log(`STEP 3 — second create response: ${secondPost ? `${secondPost.status()} ${secondPost.url()}` : '(none observed)'}`);
      expect(secondPost, 'STEP 3 EXPECTED: the second save attempt should reach the server').toBeTruthy();
      expect(secondPost!.status(), 'STEP 3 EXPECTED: the unique-name constraint should reject the second (duplicate) save').toBeGreaterThanOrEqual(400);
      const secondErrorBody = await secondPost!.text().catch((e) => `(could not read body: ${e})`);
      console.log(`STEP 3 ACTUAL — rejection body: ${secondErrorBody.slice(0, 1000)}`);
      expect(secondErrorBody.toLowerCase(), 'STEP 3 EXPECTED: the rejection should cite a uniqueness/duplicate-name constraint').toMatch(/unique|duplicate|already exists|exists already/);
      // Confirmed live 2026-08-17: the constraint checks both Name and Short Name, and fires on an
      // exact string match (untrimmed, since STEP 2 already showed the server never trims) — not
      // specifically "against the trimmed name" as ADO's script frames it, but a real uniqueness
      // constraint exists and works.
      console.log('STEP 3 ACTUAL — uniqueness constraint fired on the second (identical, untrimmed) save, as expected.');
    } finally {
      if (reportId) {
        const prCrud = `${apiOrigin}/api/dynamic/Epm/PerformanceReport/Crud`;
        const cleanup = await page.request.delete(`${prCrud}/Delete?id=${reportId}`).catch(() => null);
        console.log(`CLEANUP — removed disposable report ${reportId}: ${cleanup ? cleanup.status() : 'request failed'}`);
      }
      // Always remove the disposable period pair, whether this run passed or failed partway through.
      // Delete the Quarter child before its Financial Year parent.
      const qCleanup = await page.request.delete(`${PERIOD_CRUD}/Delete?id=${qPeriod.id}`).catch(() => null);
      console.log(`CLEANUP — removed disposable Quarter period ${qPeriod.id}: ${qCleanup ? qCleanup.status() : 'request failed'}`);
      const fyCleanup = await page.request.delete(`${PERIOD_CRUD}/Delete?id=${fyPeriod.id}`).catch(() => null);
      console.log(`CLEANUP — removed disposable Financial Year period ${fyPeriod.id}: ${fyCleanup ? fyCleanup.status() : 'request failed'}`);
    }
  });
});
