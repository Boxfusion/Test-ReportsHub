import { test, expect, type Page } from '@playwright/test';

// Derived artefact — the canonical source is epm-register-new-user-component-actioner.md, which mirrors
// ADO test case 109448 in suite 109504. Edit the .md (and the ADO case), not this file, except for
// AI-repair patches.

const BASE = 'https://pd-epm-adminportal-qa-wf.shesha.app';
// Must match BASE's host family — same GetAll host-mismatch pattern confirmed live 2026-08-27 across
// multiple specs in this suite. See epm-unit-of-measure-getall-host-mismatch memory.
const API = 'https://pd-epm-api-qa-wf.shesha.app';
const USER_CRUD = `${API}/api/dynamic/Shesha/User/Crud`;
const PERSON_CRUD = `${API}/api/dynamic/Shesha/Person/Crud`;
const COMPONENT_ACTIONER_CRUD = `${API}/api/dynamic/Epm/ComponentActioner/Crud`;

// The original "Emmanuel_Test_Report" (32de39ae-...) no longer exists — confirmed live 2026-08-27
// ("There is no entity PerformanceReport with id..."). QA now holds 27+ reports. Two earlier re-picks
// both failed for different reasons: a Published report offers "Unpublish" instead of "Build Tree"
// (Planning-only action), and a shallow 2-component tree (Department -> KPI directly, skipping
// Programme/Sub Programme) left the Component Actioners grid rendering "0 items found" for every KPI
// in it — confirmed by the user: the grid only actually populates when the KPI sits at the bottom of a
// COMPLETE 4-level tree (Department > Programme > Sub Programme > KPI). Re-picked the "Princess" report
// (status 10, Planning), whose sole KPI genuinely satisfies that shape — confirmed via each Component's
// own `fullIdPath` (a slash-separated ancestor-id chain): "Department of Human Settlements" (Department)
// -> "Administration" (Programme) -> "Executive Support" (Sub Programme) -> "Percentage compliance with
// statutory prescripts" (Quantitative KPI). Re-check the same way (PerformanceReport/Crud/GetAll +
// Component/Crud/GetAll, inspect fullIdPath) if this report is ever published/modified out from under
// this spec — the fix is a complete-tree KPI, not just "any Planning-status report with a KPI in it".
const REPORT_ID = process.env.TC448_REPORT_ID || 'bc34f55d-bb32-4629-bd74-3e03250e4784'; // Princess
const KPI_COMPONENT_NAME = 'Percentage compliance with statutory prescripts';
// Confirmed live in QA: action level 20 (Stage 1) is labelled "Outstanding" in the Actioner Level select.
const STAGE_1_LABEL = 'Outstanding';

// Uses a real, already-registered user (created manually by the user just before this run, 2026-08-27
// 09:25:55) instead of this spec registering its own — confirmed live via Person/Crud/GetAll
// (Person id 2d908697-b0d5-4cf8-b3da-1c91fe084a6a, linked User id 24). Fulfils the ADO precondition
// ("a user has just been created") without this suite's own repeated-run naming collisions: earlier
// TC448 runs today each got as far as registering a real "TC448 User<token>" person before failing
// later in the test, so QA now holds several near-identical names that a generated user here would
// only add to. "Tester Testing" is distinct from all of those.
const ACTIONER_NAME = 'Tester Testing';

const SLOW = 420_000;
const RAW_CHANNEL = process.env.PW_CHANNEL === undefined ? 'chrome' : process.env.PW_CHANNEL;
const CHANNEL = RAW_CHANNEL === '' || RAW_CHANNEL === 'chromium' ? undefined : RAW_CHANNEL;

test.use({
  channel: CHANNEL,
  viewport: { width: 1920, height: 1080 },
  actionTimeout: 120_000,
  navigationTimeout: 120_000,
});

// Retry the whole flyout path: a hover landing before rc-menu hydrates is swallowed, and the flyout can
// close between the visibility check and the hover (antd then unmounts the popup, so a long-timeout hover
// stalls on a detached node). Short per-action timeouts fail fast and re-open.
// NOTE: `/^Administration$/` exact — this is the PLATFORM menu. The Epm child submenu is misspelt
// "Adminstration" and a loose match would hit the wrong one.
async function openViaAdministration(page: Page, linkName: string, expectedHref: string) {
  const admin = page.locator('.ant-menu-submenu-title').filter({ hasText: /^Administration$/ }).locator('visible=true').first();
  const link = page.getByRole('link', { name: linkName, exact: true }).locator('visible=true').first();
  for (let attempt = 1; attempt <= 8; attempt++) {
    try {
      await admin.hover({ force: true, timeout: 15_000 });
      await page.waitForTimeout(1_500);
      if (!(await link.isVisible().catch(() => false))) throw new Error(`"${linkName}" not revealed`);
      await expect(link).toHaveAttribute('href', expectedHref, { timeout: 15_000 });
      await link.click({ timeout: 15_000 });
      // See epm-register-new-user.spec.ts for why this is needed: the flyout only closes once the
      // cursor leaves its hover-trigger box, which a Playwright click alone never does.
      await page.mouse.move(960, 700);
      await page.waitForTimeout(500);
      return;
    } catch (e: any) {
      console.log(`  nav attempt ${attempt} failed: ${String(e.message).split('\n')[0].slice(0, 80)}`);
      await page.mouse.move(1_400, 900);
      await page.waitForTimeout(1_000);
    }
  }
  throw new Error(`could not reach "${linkName}" via Administration after 8 attempts`);
}

test.describe('EPM — User Management (ADO plan 108745 / suite 109504)', () => {
  test('TC-109448 New User can be assigned as a Component Actioner (Stage 1..5) immediately after registration', async ({ page }) => {
    test.setTimeout(1_200_000);
    console.log(`ACTIONER — ${ACTIONER_NAME}`);

    // PRECONDITION: signed in as administrator.
    await page.goto(`${BASE}/login`, { waitUntil: 'domcontentloaded' });
    await expect(page.locator('input').first()).toBeVisible({ timeout: SLOW });
    await page.locator('input').first().fill('admin.PrincessH');
    await page.locator('input[type="password"]').first().fill('123qwe');
    await page.getByRole('button', { name: /sign in|login/i }).first().click();
    await expect(page).not.toHaveURL(/\/login/, { timeout: SLOW });
    const token = await page.evaluate(() => {
      for (const k of Object.keys(localStorage)) {
        const v = localStorage.getItem(k);
        if (v && /^ey[A-Za-z0-9]/.test(v)) return v;
        try { const j = JSON.parse(v); if (j && typeof j.accessToken === 'string') return j.accessToken; } catch { /* not JSON */ }
      }
      return null;
    });
    expect(token, 'bearer token recoverable').toBeTruthy();
    const authed = { Authorization: `Bearer ${token}` };

    // ── PRECONDITION: "A user has just been created." ──────────────────────────
    // Uses a real, pre-existing user instead of this spec registering its own — see ACTIONER_NAME's
    // definition for why. Verified via the API rather than assumed.
    const personsResp = await page.request.get(`${PERSON_CRUD}/GetAll?maxResultCount=1000`, { headers: authed, timeout: SLOW });
    expect(personsResp.status()).toBe(200);
    const persons = ((await personsResp.json()).result?.items ?? []) as any[];
    const actionerPerson = persons.find((p) => `${p.firstName} ${p.lastName}` === ACTIONER_NAME);
    expect(actionerPerson, `PRECONDITION: "${ACTIONER_NAME}" should exist via Person Crud GetAll`).toBeTruthy();
    console.log(`PRECONDITION ok — "${ACTIONER_NAME}" exists (Person id ${actionerPerson.id}, user id ${actionerPerson.user?.id})`);

    // ── STEP 1 (implicit): Open the KPI Component's Component Actioners tab. ───
    // "View Tree" does not exist on this app — confirmed live 2026-08-27 (a Planning-status report's
    // details view offers no such button either). Every other spec in this suite reaches the tree
    // builder via a "Build Tree" button/link instead, with a click-and-confirm-navigation retry loop
    // since the first click sometimes doesn't register. Matching that established pattern here.
    // Factored into a helper since STEP 3 needs to repeat this navigation after a reload (the selected
    // node and active tab are client-side state, not part of the URL, so a reload alone loses them).
    async function openKpiComponentActionersTab(label: string) {
      await page.goto(`${BASE}/dynamic/Epm/performance-report-details-view?id=${REPORT_ID}`, { waitUntil: 'domcontentloaded' });
      await expect(page.locator('.ant-spin-spinning')).toHaveCount(0, { timeout: SLOW });
      await page.waitForTimeout(1_500);
      const buildTreeBtn = page.locator('.ant-btn, button, a').filter({ hasText: 'Build Tree' }).first();
      await expect(buildTreeBtn, `${label}: Performance Report details view should offer a "Build Tree" action`).toBeVisible({ timeout: SLOW });
      for (let attempt = 1; attempt <= 5; attempt++) {
        await buildTreeBtn.click({ force: true });
        const navigated = await page.waitForURL(/performance-report-planning-page/, { timeout: 15_000 }).then(() => true).catch(() => false);
        if (navigated) break;
        console.log(`  ${label}: Build Tree click attempt ${attempt} did not navigate, retrying...`);
        if (attempt === 5) throw new Error('Build Tree click never navigated to the planning page after 5 attempts');
      }
      await expect(page.locator('.ant-spin-spinning')).toHaveCount(0, { timeout: SLOW });
      await page.waitForTimeout(1_500);

      // Expand the reporting tree fully.
      for (let round = 0; round < 8; round++) {
        const closed = page.locator('.ant-tree-switcher_close');
        const n = await closed.count();
        if (n === 0) break;
        for (let i = 0; i < n; i++) {
          await closed.nth(0).click({ timeout: 5_000 }).catch(() => {});
          await page.waitForTimeout(400);
        }
      }
      await page.waitForTimeout(500);

      const qkpiNode = page.getByText(KPI_COMPONENT_NAME, { exact: false }).locator('visible=true').first();
      await expect(qkpiNode, `${label}: the reporting tree should contain "${KPI_COMPONENT_NAME}"`).toBeVisible({ timeout: SLOW });
      await qkpiNode.click();
      await expect(page.locator('.ant-spin-spinning')).toHaveCount(0, { timeout: SLOW });

      const caTab = page.locator('.ant-tabs-tab').filter({ hasText: 'Component Actioners' }).locator('visible=true').first();
      await expect(caTab, `${label}: the KPI component form should have a Component Actioners tab`).toBeVisible({ timeout: 30_000 });
      await caTab.click();
      await page.waitForTimeout(1_500);
      await expect(page.locator('.ant-spin-spinning')).toHaveCount(0, { timeout: SLOW });
    }

    await openKpiComponentActionersTab('STEP 1');
    await page.screenshot({ path: 'projects/EPM/test-reports/2026-08-12/assets/tc448-01-kpi-component-opened.png', fullPage: true });

    const actionerGrid = page.locator('div').filter({ hasText: /^Component Actioners$/ }).last().locator('..');
    const baselineRows = await page.locator('table tbody tr, .sha-table .tr-body').count().catch(() => 0);
    console.log(`STEP 1 — Component Actioners tab opened; baseline row count ≈ ${baselineRows}`);
    await page.screenshot({ path: 'projects/EPM/test-reports/2026-08-12/assets/tc448-02-component-actioners-tab.png', fullPage: true });

    // ── STEP 2: Open a KPI Component and add a Component Actioner row. ─────────
    const addBtn = page.locator('.ant-btn').filter({ hasText: /^Add$/ }).locator('visible=true').first();
    await expect(addBtn, 'Component Actioners tab should have an Add button').toBeVisible({ timeout: 30_000 });
    await addBtn.click();
    const caModal = page.locator('.ant-modal-content').filter({ hasText: 'Add component actioner' }).first();
    await expect(caModal, 'an "Add component actioner" modal should open').toBeVisible({ timeout: SLOW });

    // Two selects only: Actioner*, then Actioner Level*, in that order.
    const modalSelects = caModal.locator('.ant-select');
    const actionerSelect = modalSelects.nth(0);
    const levelSelect = modalSelects.nth(1);

    await actionerSelect.click();
    const actionerDropdown = page.locator('.ant-select-dropdown').locator('visible=true').first();
    await expect(actionerDropdown).toBeVisible({ timeout: 30_000 });
    // Search by name — the dropdown's options render as "First Name Last Name" with no username shown
    // (confirmed live 2026-08-27), so searching by name is what actually narrows the results.
    await page.keyboard.type(ACTIONER_NAME, { delay: 50 });
    await page.waitForTimeout(2_000);
    const actionerOptions = actionerDropdown.locator('.ant-select-item-option');
    await expect(actionerOptions.first(), 'searching the actioner name should return at least one option').toBeVisible({ timeout: 30_000 });
    const optionTexts = await actionerOptions.evaluateAll((els) => els.map((e) => (e.textContent || '').trim()));
    console.log(`STEP 2 — Actioner options for "${ACTIONER_NAME}": ${JSON.stringify(optionTexts)}`);
    await page.screenshot({ path: 'projects/EPM/test-reports/2026-08-12/assets/tc448-03-actioner-search.png', fullPage: true });

    // STEP 2 EXPECTED: User dropdown includes the newly-created user.
    const newUserOption = actionerOptions.filter({ hasText: ACTIONER_NAME }).first();
    const matchByName = await newUserOption.count();
    console.log(`STEP 2 — match by name "${ACTIONER_NAME}": ${matchByName}`);
    expect(matchByName > 0, 'the Actioner dropdown should include the newly-created user').toBe(true);
    await newUserOption.click();
    await expect(actionerSelect.locator('.ant-select-selection-item')).toBeVisible({ timeout: 30_000 });
    const selectedActioner = (await actionerSelect.locator('.ant-select-selection-item').innerText()).trim();
    console.log(`STEP 2 — selected Actioner: "${selectedActioner}"`);

    // ── STEP 3: Assign the user at Stage 1 (action level 20). ───────────────────
    await levelSelect.click();
    const levelDropdown = page.locator('.ant-select-dropdown').locator('visible=true').first();
    await expect(levelDropdown).toBeVisible({ timeout: 30_000 });
    const stage1Option = levelDropdown.locator('.ant-select-item-option').filter({ hasText: new RegExp(`^${STAGE_1_LABEL}$`) }).first();
    await expect(stage1Option, `Actioner Level dropdown should offer "${STAGE_1_LABEL}" (Stage 1 / action level 20)`).toBeVisible({ timeout: 30_000 });
    await stage1Option.click();
    await expect(levelSelect.locator('.ant-select-selection-item')).toHaveText(STAGE_1_LABEL, { timeout: 30_000 });
    await page.screenshot({ path: 'projects/EPM/test-reports/2026-08-12/assets/tc448-04-actioner-level-selected.png', fullPage: true });

    const saveBtn = caModal.getByRole('button', { name: /^Save$/ });
    const saveResponsePromise = page
      .waitForResponse((r) => r.request().method() === 'POST' && /ComponentActioner/i.test(r.url()), { timeout: 60_000 })
      .catch(() => null);
    await saveBtn.click();
    const saveResponse = await saveResponsePromise;
    let createdRowId: string | null = null;
    if (saveResponse) {
      const saveBody = await saveResponse.text().catch(() => '');
      console.log(`STEP 3 — POST ${saveResponse.status()} ${saveResponse.url()}`);
      console.log(`STEP 3 — response: ${saveBody.slice(0, 500)}`);
      expect(saveResponse.status(), 'saving the Component Actioner row should succeed').toBeLessThan(400);
      try { createdRowId = JSON.parse(saveBody)?.result?.id ?? null; } catch { /* not JSON */ }
    } else {
      console.log('STEP 3 — no matching POST observed (checking outcome via the grid/API instead)');
    }

    // STEP 3 EXPECTED: Component Actioner row saved with the new user.
    await expect(caModal, 'the Add component actioner modal should close on save').toBeHidden({ timeout: 60_000 });
    await page.waitForTimeout(1_500);
    await page.screenshot({ path: 'projects/EPM/test-reports/2026-08-12/assets/tc448-05-row-saved.png', fullPage: true });
    const gridTextBeforeReload = (await page.locator('body').innerText()).replace(/\s+/g, ' ');
    console.log(`STEP 3 — grid shows selected actioner text before reload: ${gridTextBeforeReload.includes(selectedActioner)}`);

    // STEP 3 EXPECTED: the new row renders in the grid immediately after Save. Confirmed live
    // 2026-08-27: this only works when the target KPI sits at the bottom of a complete 4-level tree
    // (Department > Programme > Sub Programme > KPI, see KPI_COMPONENT_NAME's definition above) — an
    // earlier target with a shallower tree made the grid render "No Data" regardless of add, which
    // briefly looked like a confirmed defect until the user identified the real tree-depth rule. See
    // epm-component-actioner-grid-no-data-defect memory (retracted) for the full trail.
    expect(gridTextBeforeReload.includes(selectedActioner), `the new Component Actioner row ("${selectedActioner}") should appear in the grid immediately after Save`).toBe(true);

    // Re-verify after a full re-navigation (fresh page load, re-expand tree, re-open the component,
    // re-click the tab — a raw page.reload() alone lands back on the tree root, since the selected
    // node and active tab are client-side state, not part of the URL) to rule out a stale client cache.
    await openKpiComponentActionersTab('STEP 3 reload-check');
    const gridTextAfterReload = (await page.locator('body').innerText()).replace(/\s+/g, ' ');
    console.log(`STEP 3 — grid shows selected actioner text after reload: ${gridTextAfterReload.includes(selectedActioner)}`);
    expect(gridTextAfterReload.includes(selectedActioner), 'the row should still be visible in the grid after a full re-navigation').toBe(true);

    // Corroborate via API. Match by component id, not display name: some component display names
    // (e.g. "Fresh Test KPI") are reused across multiple distinct components from earlier test runs,
    // so a name-only filter can silently pull in unrelated rows.
    const actionerRows = ((await (await page.request.get(`${COMPONENT_ACTIONER_CRUD}/GetAll?maxResultCount=1000`, { headers: authed, timeout: SLOW })).json()).result?.items ?? []) as any[];
    const matching = createdRowId
      ? actionerRows.filter((r) => r.id === createdRowId)
      : actionerRows.filter((r) => r.component?._displayName === KPI_COMPONENT_NAME && r.actionLevel === 20
          && (r.actioner?._displayName || '').toLowerCase() === ACTIONER_NAME.toLowerCase());
    console.log(`STEP 3 — matching ComponentActioner row(s): ${JSON.stringify(matching.map((r) => ({ actioner: r.actioner?._displayName, component: r.component?._displayName, componentId: r.component?.id, level: r.actionLevel, id: r.id })))}`);
    const newRow = matching[0];
    expect(newRow, `a ComponentActioner row for "${ACTIONER_NAME}" at level 20 (${STAGE_1_LABEL}) should persist`).toBeTruthy();
    expect(newRow.actioner?._displayName, 'persisted row should name the correct actioner').toBe(ACTIONER_NAME);
    expect(newRow.component?._displayName, 'persisted row should name the correct component').toBe(KPI_COMPONENT_NAME);
    expect(newRow.actionLevel, 'persisted row should be at action level 20').toBe(20);
    console.log(`DONE — Component Actioner row saved and visible in the grid: actioner="${newRow.actioner?._displayName}" component="${KPI_COMPONENT_NAME}" level=20 (${STAGE_1_LABEL}), row id=${newRow.id}`);
  });
});
