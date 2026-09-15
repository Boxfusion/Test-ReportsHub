import { test, expect, type Page, type Locator } from '@playwright/test';

// Derived artefact — the canonical source is epm-component-type-canberoot.md, which mirrors ADO test
// case 108777 in suite 109511. Edit the .md (and the ADO case), not this file, except for AI-repair
// patches.
//
// 2026-08-13 rewrite: TC-108777's original premise ("canBeRoot" as a field on the Component Type
// create form) doesn't exist — confirmed live. "Can be root" is a property of the
// AllowableChildComponentType junction (parent Component Type -> child Component Type pairing),
// set via: Adminstration > Component Type > open a Component Type > Allowable Child Component Type
// grid > 3-dot overflow menu > Add > Child Component Type: Programme > Can Be Root > OK.

const BASE = 'https://pd-epm-adminportal-qa-wf.shesha.app';
// Must match BASE's host family — same GetAll host-mismatch pattern confirmed live 2026-08-27 across
// multiple specs in this suite. See epm-unit-of-measure-getall-host-mismatch memory.
const API = 'https://pd-epm-api-qa-wf.shesha.app';
const COMPONENT_TYPE_CRUD = `${API}/api/dynamic/Epm/ComponentType/Crud`;

const TOKEN = process.env.TC108777_TOKEN || `TC108777-${Date.now()}`;
const DIGITS = TOKEN.replace(/\D/g, '');
const SHORT = DIGITS.slice(-6);

const CHILD_TYPE_NAME = 'Programme';

const NEG_TOKEN = process.env.TC108808_TOKEN || `TC108808-${Date.now()}`;
const NEG_SHORT = NEG_TOKEN.replace(/\D/g, '').slice(-6);
const NEG_NAME = `Quantitative KPI (invalid) ${NEG_SHORT}`;
const NEG_TYPE = 'Quantitative KPI';

// Per the case owner (2026-08-13): target an existing Component Type that's already referenced with
// Can be Root = true, rather than building fresh PerformanceReportAllowedComponentType precondition
// data. The original hardcoded target ("Department (test) 714718") no longer exists — confirmed live
// 2026-08-27 (one-shot targets from a specific past run don't survive across sessions), and TC-108777
// no longer creates a disposable parent at all (creating any new Component Type with an
// already-instantiated Type value now fails — see TC-108777's DEVIATION note). Per the user
// (2026-08-27): target the real, shared "Department" Component Type directly. Low risk — the
// delete-blocked protection under test was already confirmed working against an equivalently-configured
// target on 2026-08-13 (HTTP 500 with a clear FK-style message, record survived), so Department is
// expected to survive this run too; STEP 4 asserts exactly that. Override with TC108810_TARGET to
// point at a different existing row.
const INT_TARGET_NAME = process.env.TC108810_TARGET || 'Department';

const SLOW = 420_000;
const RAW_CHANNEL = process.env.PW_CHANNEL === undefined ? 'chrome' : process.env.PW_CHANNEL;
const CHANNEL = RAW_CHANNEL === '' || RAW_CHANNEL === 'chromium' ? undefined : RAW_CHANNEL;

test.use({
  channel: CHANNEL,
  viewport: { width: 1920, height: 1080 },
  actionTimeout: 30_000,
  navigationTimeout: 120_000,
});

// Per user instruction (2026-08-27): when creating a new Component Type, tick every Flags &
// Visibility checkbox (Is Indicator, Show In Admin Tree, Progress Reporting Required, Is Folder,
// Show In Viewer Tree, Progress Reviewing Required) rather than leaving them at their defaults.
const FLAG_LABELS = [
  'Is Indicator',
  'Show In Admin Tree',
  'Progress Reporting Required',
  'Is Folder',
  'Show In Viewer Tree',
  'Progress Reviewing Required',
];

async function checkAllFlags(modal: Locator, page: Page, label: string) {
  for (const flagLabel of FLAG_LABELS) {
    const checkbox = modal.locator('label').filter({ hasText: new RegExp(`^${flagLabel}$`, 'i') }).first()
      .locator('xpath=following::input[@type="checkbox"][1]');
    await checkbox.check({ force: true });
    await expect(checkbox, `${label}: "${flagLabel}" should be checked`).toBeChecked();
  }
}

async function hoverUntilVisible(page: Page, trigger: Locator, revealed: Locator, label: string) {
  for (let attempt = 1; attempt <= 8; attempt++) {
    // A single slow hover must not abort the whole retry loop — catch and keep retrying.
    await trigger.hover({ force: true }).catch((e) => console.log(`  ${label}: hover attempt ${attempt} errored: ${e.message}`));
    await page.waitForTimeout(2_000);
    if (await revealed.isVisible().catch(() => false)) return;
    console.log(`  ${label}: not open after hover attempt ${attempt}, retrying`);
    await page.mouse.move(1_400, 900);
    await page.waitForTimeout(500);
  }
  throw new Error(`${label} never opened after 8 hover attempts`);
}

test.describe('EPM — Component Type management (ADO plan 108745 / suite 109511)', () => {
  test('TC-108777 Positive — Mark an Allowable Child Component Type as Root for a non-leaf hierarchy level', async ({ page }) => {
    test.setTimeout(1_200_000);
    console.log(`RUN TOKEN — ${TOKEN}`);
    // Diagnostic kept from root-causing the original stuck-modal failure (see DEVIATION note below) —
    // harmless to leave running for this case's current create-free flow.
    page.on('console', (msg) => { if (msg.type() === 'error') console.log(`  [browser console error] ${msg.text()}`); });
    page.on('pageerror', (err) => console.log(`  [browser page error] ${err.message}`));

    // PRECONDITION: signed in as administrator.
    await page.goto(`${BASE}/login`, { waitUntil: 'domcontentloaded' });
    await expect(page.locator('input').first()).toBeVisible({ timeout: SLOW });
    await page.locator('input').first().fill('admin.PrincessH');
    await page.locator('input[type="password"]').first().fill('123qwe');
    await page.getByRole('button', { name: /sign in|login/i }).first().click();
    await expect(page).not.toHaveURL(/\/login/, { timeout: SLOW });

    // RE-SCOPED 2026-08-27 (per the user, after root-causing the stuck-modal failure below): creating
    // a new Component Type record with an already-used Type value is correctly rejected — this is
    // intended behaviour, not a bug. QA's 7 Component Types (Department, Programme, Sub Programme,
    // Quantitative KPI, Qualitative KPI, Outcome, Output) are a closed, singleton set by design: each
    // Type reflist value backs exactly one record. The rejection itself throws client-side
    // (`DUPLICATE_COMPONENT_TYPE`, console-only — no toast/inline message, a minor UX polish item, not
    // a functional defect) and leaves the modal open. This makes TC-108777's original "disposable
    // parent" approach moot — there's no unused Type value to create against. Per the user's general
    // guidance (check whether the target already exists and is configured correctly before assuming
    // creation is needed), this case now opens the real, existing "Department" Component Type, which
    // already has "Programme" as an Allowable Child at Can Be Root = Yes, and verifies the format —
    // adding it only if it were ever missing (see STEP 2 below).
    console.log('DEVIATION — Component Types are a closed singleton set by design; creating a duplicate is correctly rejected, not a bug. Checking the existing real "Department" -> "Programme" (Root) configuration instead.');

    const REAL_PARENT_NAME = 'Department';

    // Navigate Epm > Adminstration > Component Type. ADO's literal route (/dynamic/Epm/ComponentType/)
    // 404s — the real route is /dynamic/Epm/component-types (see the .md's Preconditions deviation note).
    const epmItem = page.locator('.ant-menu').getByText('EPM', { exact: true }).locator('visible=true').first();
    await expect(epmItem).toBeVisible({ timeout: SLOW });
    await epmItem.click({ force: true });
    await page.waitForTimeout(2_500);
    const epmAdmin = page.getByText('EPM Administration', { exact: true }).locator('visible=true').first();
    const ctLink = page.getByRole('link', { name: 'Component Type' }).locator('visible=true').first();
    await hoverUntilVisible(page, epmAdmin, ctLink, 'EPM Administration flyout');
    await expect(ctLink).toHaveAttribute('href', '/dynamic/Epm/component-types');
    await ctLink.click();
    await expect(page).toHaveURL(/\/dynamic\/Epm\/component-types$/, { timeout: SLOW });
    await expect(page.locator('.ant-spin-spinning')).toHaveCount(0, { timeout: SLOW });
    // The spinner can disappear before row data actually paints (cold-start slowness) — poll for real
    // row text instead of trusting spinner-absence alone.
    for (let i = 0; i < 30; i++) {
      const rowText = await page.locator('[role="row"]').nth(1).innerText().catch(() => '');
      if (rowText && !/loading/i.test(rowText) && rowText.trim().length > 0) break;
      console.log(`  waiting for grid rows to paint (poll ${i})`);
      await page.waitForTimeout(3_000);
    }

    // ── STEP 1 (adapted): open the real "Department" Component Type's detail view. ────────────
    const searchInput = page.locator('.ant-input-search input, .ant-input-affix-wrapper input').first();
    await searchInput.fill(REAL_PARENT_NAME);
    await searchInput.press('Enter');
    await page.waitForTimeout(1_500);
    const deptRow = page.locator('[role="row"]').filter({ has: page.getByText(REAL_PARENT_NAME, { exact: true }) }).first();
    await expect(deptRow, `the "${REAL_PARENT_NAME}" row should be visible in the list`).toBeVisible({ timeout: SLOW });
    const detailLink = deptRow.locator('a').first();
    await detailLink.click({ timeout: 15_000 });
    await page.waitForTimeout(2_000);
    await expect(page.locator('.ant-spin-spinning')).toHaveCount(0, { timeout: SLOW });
    const detailUrl = page.url();
    console.log(`STEP 1 — detail view URL: ${detailUrl}`);
    expect(detailUrl, 'STEP 1 EXPECTED: the Component Type detail view loads').toMatch(/component-type-details-view\?id=/);

    const section = page.locator(':text("Allowable Child Component Type")').first();
    await expect(section, 'STEP 1 EXPECTED: the Allowable Child Component Type grid is shown').toBeVisible({ timeout: SLOW });
    await page.screenshot({ path: 'projects/EPM/test-reports/2026-08-13/assets/tc108777-03-detail-view.png', fullPage: true });

    // ── STEP 2 (adapted, idempotent per the user's guidance 2026-08-27: "if already exist check ──
    // the format if doesn't create"): if "Programme" is already listed as an Allowable Child, verify
    // its format (Can be Root = Yes). If not, add it via the 3-dot overflow menu, matching ADO's
    // literal steps, then verify the newly-added row. The app renders "Child Component Type" and
    // "Can be Root" as separate grid columns ("Programme" / "Yes"); "Programme - Root" is the API's
    // allowableChildrenSummary format, not literal UI text (confirmed live 2026-08-13).
    const existingChildRow = page.locator('[role="row"]').filter({ has: page.getByText(CHILD_TYPE_NAME, { exact: true }) }).first();
    const alreadyExists = await existingChildRow.isVisible().catch(() => false);
    console.log(`STEP 2 — "${CHILD_TYPE_NAME}" already listed as an Allowable Child: ${alreadyExists}`);

    if (alreadyExists) {
      // STEP 2 EXPECTED (already exists): verify the format.
      await expect(existingChildRow.getByText('Yes', { exact: true }), 'STEP 2 EXPECTED: the existing row\'s Can be Root column should read "Yes"').toBeVisible({ timeout: SLOW });
      console.log(`STEP 2 — verified existing "${CHILD_TYPE_NAME}" row has Can be Root = Yes`);
    } else {
      // STEP 2 EXPECTED (doesn't exist): add it. The "3 dots" renders as AntD's responsive-menu
      // overflow indicator — an icon-only ".ant-menu-submenu-title" inside a
      // "ul.sha-responsive-button-group" toolbar, which collapses the "Add" action when the toolbar
      // row doesn't have room for it (confirmed live 2026-08-13; a plain ".ant-dropdown" trigger does
      // not exist here).
      console.log(`STEP 2 — "${CHILD_TYPE_NAME}" not yet an Allowable Child; adding it now`);
      const overflowTitle = page.locator('ul[class*="sha-responsive-button-gr"] .ant-menu-submenu-title').first();
      await overflowTitle.scrollIntoViewIfNeeded();
      await overflowTitle.click({ timeout: 5_000, force: true });
      await page.waitForTimeout(1_000);
      const popup = page.locator('.ant-dropdown, .ant-menu-submenu-popup').locator('visible=true').first();
      await expect(popup, 'the 3-dot overflow menu should open').toBeVisible({ timeout: 10_000 });
      await popup.getByText('Add', { exact: true }).first().click();

      const addModal = page.locator('.ant-modal-content').filter({ hasText: 'Add New Record' }).first();
      await expect(addModal, 'STEP 2 EXPECTED: the Add New Record form loads').toBeVisible({ timeout: 15_000 });

      const childSelect = addModal.locator('label').filter({ hasText: /^Child Component Type/i }).first()
        .locator('xpath=following::*[contains(concat(" ", normalize-space(@class), " "), " ant-select ")][1]');
      await childSelect.click();
      const childDd = page.locator('.ant-select-dropdown').locator('visible=true').first();
      await expect(childDd).toBeVisible({ timeout: 15_000 });
      await childDd.locator('.ant-select-item-option').filter({ hasText: new RegExp(`^${CHILD_TYPE_NAME}$`) }).first().click();
      await expect(childSelect.locator('.ant-select-selection-item')).toHaveText(CHILD_TYPE_NAME, { timeout: 15_000 });

      const rootCheckbox = addModal.locator('label').filter({ hasText: /^Can Be Root/i }).first()
        .locator('xpath=following::input[@type="checkbox"][1]');
      await rootCheckbox.check({ force: true });
      await expect(rootCheckbox).toBeChecked();
      await page.screenshot({ path: 'projects/EPM/test-reports/2026-08-13/assets/tc108777-04-add-modal-filled.png', fullPage: true });

      const junctionCreatePostPromise = page
        .waitForResponse((r) => r.request().method() === 'POST' && /AllowableChildComponentType/i.test(r.url()), { timeout: 60_000 })
        .catch(() => null);
      await addModal.getByRole('button', { name: /^OK$/ }).click();
      const junctionCreatePost = await junctionCreatePostPromise;
      if (junctionCreatePost) {
        console.log(`STEP 2 — POST ${junctionCreatePost.status()} ${junctionCreatePost.url()}`);
        console.log(`STEP 2 — response: ${(await junctionCreatePost.text().catch(() => '')).slice(0, 800)}`);
        expect(junctionCreatePost.status(), 'creating the Allowable Child Component Type junction should succeed').toBeLessThan(400);
      } else {
        console.log('STEP 2 — no matching POST observed (checking outcome via the grid/API instead)');
      }
      await expect(addModal, 'modal should close on successful save').toBeHidden({ timeout: 30_000 });
      await page.waitForTimeout(2_000);

      const newChildRow = page.locator('[role="row"]').filter({ has: page.getByText(CHILD_TYPE_NAME, { exact: true }) }).first();
      await expect(newChildRow, 'STEP 2 EXPECTED: the grid should show a row for the new allowable child').toBeVisible({ timeout: SLOW });
      await expect(newChildRow.getByText('Yes', { exact: true }), 'STEP 2 EXPECTED: the new row\'s Can be Root column should read "Yes"').toBeVisible({ timeout: SLOW });
      console.log(`STEP 2 — added "${CHILD_TYPE_NAME}" as an Allowable Child with Can be Root = Yes`);
    }
    await page.screenshot({ path: 'projects/EPM/test-reports/2026-08-13/assets/tc108777-05-after-ok.png', fullPage: true });

    // ── STEP 3: verify via the ComponentType Crud network response (canBeRoot is a property of ──
    // the AllowableChildComponentType junction, not of ComponentType itself — confirmed live). ──
    const after = ((await (await page.request.get(`${COMPONENT_TYPE_CRUD}/GetAll?maxResultCount=1000`, { timeout: SLOW })).json()).result?.items ?? []) as any[];
    const parent = after.find((c) => c.name === REAL_PARENT_NAME);
    expect(parent, `Component Type Crud GetAll should contain "${REAL_PARENT_NAME}"`).toBeTruthy();
    console.log(`STEP 3 — persisted parent Component Type: ${JSON.stringify(parent)}`);
    expect(parent.allowableChildrenSummary, 'STEP 3 EXPECTED: allowableChildrenSummary reads "Programme - Root"').toBe(`${CHILD_TYPE_NAME} - Root`);
    expect(Array.isArray(parent.allowableChildComponentTypes) && parent.allowableChildComponentTypes.length > 0,
      'STEP 3 EXPECTED: the junction record is attached to the parent').toBe(true);
    console.log(`DONE — real "${REAL_PARENT_NAME}" Component Type already allows "${CHILD_TYPE_NAME}" as Root (verified, not created)`);
  });

  test('TC-108808 Negative — Reject creation of a leaf Component Type with canBeRoot set to true', async ({ page }) => {
    test.setTimeout(1_200_000);
    console.log(`RUN TOKEN — ${NEG_TOKEN}`);
    console.log(`  Component Type name=${NEG_NAME}`);
    // ADO's step 2 literally asks to "set canBeRoot equal to true" while creating this Component
    // Type — that field does not exist on the create form (same finding as TC-108777's deviation).
    // This run fills only the fields that actually exist and observes/logs the real outcome instead
    // of asserting ADO's literal (unreachable) expectation.
    console.log('DEVIATION — canBeRoot does not exist on the Component Type create form; cannot be set per ADO step 2 literally.');

    await page.goto(`${BASE}/login`, { waitUntil: 'domcontentloaded' });
    await expect(page.locator('input').first()).toBeVisible({ timeout: SLOW });
    await page.locator('input').first().fill('admin.PrincessH');
    await page.locator('input[type="password"]').first().fill('123qwe');
    await page.getByRole('button', { name: /sign in|login/i }).first().click();
    await expect(page).not.toHaveURL(/\/login/, { timeout: SLOW });

    const before = ((await (await page.request.get(`${COMPONENT_TYPE_CRUD}/GetAll?maxResultCount=1000`, { timeout: SLOW })).json()).result?.items ?? []) as any[];
    expect(before.some((c) => c.name === NEG_NAME), 'the unique Component Type name must not already exist').toBe(false);
    const beforeCount = before.length;
    console.log(`PRECONDITION — ${beforeCount} Component Types before this run`);

    const epmItem = page.locator('.ant-menu').getByText('EPM', { exact: true }).locator('visible=true').first();
    await expect(epmItem).toBeVisible({ timeout: SLOW });
    await epmItem.click({ force: true });
    await page.waitForTimeout(2_500);
    const epmAdmin = page.getByText('EPM Administration', { exact: true }).locator('visible=true').first();
    const ctLink = page.getByRole('link', { name: 'Component Type' }).locator('visible=true').first();
    await hoverUntilVisible(page, epmAdmin, ctLink, 'EPM Administration flyout');
    await ctLink.click();
    await expect(page).toHaveURL(/\/dynamic\/Epm\/component-types$/, { timeout: SLOW });
    await expect(page.locator('.ant-spin-spinning')).toHaveCount(0, { timeout: SLOW });
    for (let i = 0; i < 30; i++) {
      const rowText = await page.locator('[role="row"]').nth(1).innerText().catch(() => '');
      if (rowText && !/loading/i.test(rowText) && rowText.trim().length > 0) break;
      console.log(`  waiting for grid rows to paint (poll ${i})`);
      await page.waitForTimeout(3_000);
    }

    // ── STEP 2 (adapted): Create form, fill Name + Type (Quantitative KPI) + Based On Definition. ──
    const addBtn = page.locator('.ant-btn').filter({ hasText: /^Add$/ }).locator('visible=true').first();
    await expect(addBtn).toBeVisible({ timeout: SLOW });
    await page.mouse.move(960, 540);
    await page.waitForTimeout(1_000);
    await addBtn.click({ timeout: 15_000 });

    const createModal = page.locator('.ant-modal-content').filter({ hasText: 'Add New Component Type' }).first();
    await expect(createModal, 'STEP 2 EXPECTED: the form loads').toBeVisible({ timeout: SLOW });
    await expect(createModal.locator('input, .ant-select').first()).toBeVisible({ timeout: 60_000 });

    const nameField = createModal.locator('label').filter({ hasText: /^Name/i }).first().locator('xpath=following::input[1]');
    await nameField.fill(NEG_NAME);
    await expect(nameField, 'STEP 2 EXPECTED: the form accepts the input during entry').toHaveValue(NEG_NAME);

    const typeSelect = createModal.locator('label').filter({ hasText: /^Type/i }).first()
      .locator('xpath=following::*[contains(concat(" ", normalize-space(@class), " "), " ant-select ")][1]');
    await typeSelect.click();
    let dd = page.locator('.ant-select-dropdown').locator('visible=true').first();
    await expect(dd).toBeVisible({ timeout: 30_000 });
    await dd.locator('.ant-select-item-option').filter({ hasText: new RegExp(`^${NEG_TYPE}$`) }).first().click();
    await expect(typeSelect.locator('.ant-select-selection-item')).toHaveText(NEG_TYPE, { timeout: 30_000 });

    const bodSelect = createModal.locator('label').filter({ hasText: /^Based On Definition/i }).first()
      .locator('xpath=following::*[contains(concat(" ", normalize-space(@class), " "), " ant-select ")][1]');
    await bodSelect.click();
    dd = page.locator('.ant-select-dropdown').locator('visible=true').first();
    await expect(dd).toBeVisible({ timeout: 30_000 });
    await dd.locator('.ant-select-item-option').filter({ hasText: /^Always$/ }).first().click();

    await checkAllFlags(createModal, page, 'TC-108808');
    await page.screenshot({ path: 'projects/EPM/test-reports/2026-08-13/assets/tc108808-01-form-filled.png', fullPage: true });

    // ── STEP 3 (adapted): Attempt to Save; log the real outcome instead of asserting ADO's ──────
    // literal (unreachable, since canBeRoot doesn't exist) rejection expectation. ─────────────────
    const createPostPromise = page
      .waitForResponse((r) => r.request().method() === 'POST' && /ComponentType/i.test(r.url()), { timeout: 60_000 })
      .catch(() => null);
    await createModal.getByRole('button', { name: /^Create$/ }).click();
    const createPost = await createPostPromise;
    let saveSucceeded: boolean | null = null;
    if (createPost) {
      const body = await createPost.text().catch(() => '');
      console.log(`STEP 3 — POST ${createPost.status()} ${createPost.url()}`);
      console.log(`STEP 3 — response: ${body.slice(0, 800)}`);
      saveSucceeded = createPost.status() < 400;
    } else {
      console.log('STEP 3 — no matching POST observed');
    }
    await page.waitForTimeout(2_000);
    const modalStillOpen = await createModal.isVisible().catch(() => false);
    console.log(`STEP 3 — create modal still open after Save: ${modalStillOpen} (closed = save proceeded)`);
    console.log(`STEP 3 ACTUAL — Save ${saveSucceeded ? 'SUCCEEDED' : 'did not succeed / was not observed'} (ADO literal expectation was: form REJECTS with a validation error; no such canBeRoot-driven validation exists at Component Type creation — see Deviation note).`);
    await page.screenshot({ path: 'projects/EPM/test-reports/2026-08-13/assets/tc108808-02-after-save-attempt.png', fullPage: true });

    // ── STEP 4: Confirm via GetAll whether a row was persisted (ADO's literal check, still valid ──
    // to run even though the premise for step 3 doesn't hold). ──────────────────────────────────
    const after = ((await (await page.request.get(`${COMPONENT_TYPE_CRUD}/GetAll?maxResultCount=1000`, { timeout: SLOW })).json()).result?.items ?? []) as any[];
    const created = after.find((c) => c.name === NEG_NAME);
    console.log(`STEP 4 — Component Types after this run: ${after.length} (before: ${beforeCount})`);
    console.log(`STEP 4 ACTUAL — a row named "${NEG_NAME}" ${created ? `WAS persisted (id ${created.id})` : 'was NOT persisted'}; ADO's literal expectation was that the count is unchanged (i.e. nothing persisted).`);

    // Per the case owner (2026-08-13): this is not just a spec/premise deviation — the dev has not
    // implemented the leaf-type canBeRoot-rejection rule yet. Fail the test until they do, so this
    // stays a red signal in the hub rather than a silent log line.
    expect(created, `STEP 4 EXPECTED (not implemented yet): no Component Type row should have been persisted for a leaf type with canBeRoot=true`).toBeFalsy();
  });

  test('TC-108810 Integration — Deleting a Component Type referenced by an Allowable Child Component Type junction is blocked', async ({ page }) => {
    test.setTimeout(1_200_000);
    console.log(`TARGET — deleting existing Component Type "${INT_TARGET_NAME}" (already referenced with Can be Root = Yes)`);

    await page.goto(`${BASE}/login`, { waitUntil: 'domcontentloaded' });
    await expect(page.locator('input').first()).toBeVisible({ timeout: SLOW });
    await page.locator('input').first().fill('admin.PrincessH');
    await page.locator('input[type="password"]').first().fill('123qwe');
    await page.getByRole('button', { name: /sign in|login/i }).first().click();
    await expect(page).not.toHaveURL(/\/login/, { timeout: SLOW });

    // PRECONDITION: the target Component Type must actually exist and be referenced by a junction
    // (AllowableChildComponentType, as the parent) before we attempt to delete it.
    const before = ((await (await page.request.get(`${COMPONENT_TYPE_CRUD}/GetAll?maxResultCount=1000`, { timeout: SLOW })).json()).result?.items ?? []) as any[];
    const target = before.find((c) => c.name === INT_TARGET_NAME);
    expect(target, `PRECONDITION: "${INT_TARGET_NAME}" must exist`).toBeTruthy();
    const targetHadAllowableChildren = Array.isArray(target.allowableChildComponentTypes) && target.allowableChildComponentTypes.length > 0;
    console.log(`PRECONDITION — "${INT_TARGET_NAME}" allowableChildrenSummary: "${target.allowableChildrenSummary}", has junction rows: ${targetHadAllowableChildren}`);
    expect(targetHadAllowableChildren, `PRECONDITION: "${INT_TARGET_NAME}" must be referenced by an AllowableChildComponentType junction`).toBe(true);

    const epmItem = page.locator('.ant-menu').getByText('EPM', { exact: true }).locator('visible=true').first();
    await expect(epmItem).toBeVisible({ timeout: SLOW });
    await epmItem.click({ force: true });
    await page.waitForTimeout(2_500);
    const epmAdmin = page.getByText('EPM Administration', { exact: true }).locator('visible=true').first();
    const ctLink = page.getByRole('link', { name: 'Component Type' }).locator('visible=true').first();
    await hoverUntilVisible(page, epmAdmin, ctLink, 'EPM Administration flyout');
    await ctLink.click();
    await expect(page).toHaveURL(/\/dynamic\/Epm\/component-types$/, { timeout: SLOW });
    await expect(page.locator('.ant-spin-spinning')).toHaveCount(0, { timeout: SLOW });
    for (let i = 0; i < 30; i++) {
      const rowText = await page.locator('[role="row"]').nth(1).innerText().catch(() => '');
      if (rowText && !/loading/i.test(rowText) && rowText.trim().length > 0) break;
      await page.waitForTimeout(3_000);
    }

    // ── STEP 2: On the Component Type list, click Delete on the referenced row. ────────────────
    // Search by name first — the grid paginates at 10/page and accumulated test data can push the
    // target row past page 1 (confirmed live 2026-08-13 for TC-108777's equivalent check).
    const searchInput = page.locator('.ant-input-search input, .ant-input-affix-wrapper input').first();
    await searchInput.fill(INT_TARGET_NAME);
    await searchInput.press('Enter');
    await page.waitForTimeout(1_500);
    const ctRow = page.locator('[role="row"]').filter({ has: page.getByText(INT_TARGET_NAME, { exact: true }) }).first();
    await expect(ctRow, `the "${INT_TARGET_NAME}" row should be visible in the list`).toBeVisible({ timeout: SLOW });
    const deleteIcon = ctRow.locator('button[title="Delete"], .anticon-delete').first();
    await deleteIcon.click({ timeout: 15_000, force: true });
    await page.waitForTimeout(1_000);
    const confirmPopup = page.locator('.ant-popover, .ant-modal-content, .ant-popconfirm').locator('visible=true').first();
    await expect(confirmPopup, 'STEP 2 EXPECTED: a confirmation dialog appears').toBeVisible({ timeout: 10_000 });
    console.log(`STEP 2 — confirm dialog text: ${(await confirmPopup.innerText()).replace(/\s+/g, ' ').trim()}`);
    await page.screenshot({ path: 'projects/EPM/test-reports/2026-08-13/assets/tc108810-01-delete-confirm.png', fullPage: true });

    // ── STEP 3: Confirm the delete. ──────────────────────────────────────────────
    const deletePostPromise = page
      .waitForResponse((r) => /ComponentType\/Crud\/Delete/i.test(r.url()), { timeout: 20_000 })
      .catch(() => null);
    await confirmPopup.getByRole('button', { name: /^(Yes|OK|Delete)$/i }).first().click({ timeout: 10_000 });
    const deletePost = await deletePostPromise;
    let deleteSucceeded: boolean | null = null;
    if (deletePost) {
      console.log(`STEP 3 — ${deletePost.request().method()} ${deletePost.status()} ${deletePost.url()}`);
      deleteSucceeded = deletePost.status() < 400;
    } else {
      console.log('STEP 3 — no matching Delete request observed');
    }
    await page.waitForTimeout(2_000);
    console.log(`STEP 3 ACTUAL — delete ${deleteSucceeded ? 'SUCCEEDED' : 'did not succeed / was not observed'} (ADO EXPECTED: rejected with a foreign-key constraint message referencing the junction table).`);
    await page.screenshot({ path: 'projects/EPM/test-reports/2026-08-13/assets/tc108810-02-after-delete.png', fullPage: true });

    // ── STEP 4: Verify via GetAll that both the Component Type and its junction row(s) are intact. ──
    const after = ((await (await page.request.get(`${COMPONENT_TYPE_CRUD}/GetAll?maxResultCount=1000`, { timeout: SLOW })).json()).result?.items ?? []) as any[];
    const stillExists = after.some((c) => c.name === INT_TARGET_NAME);
    console.log(`STEP 4 — Component Type "${INT_TARGET_NAME}" still exists: ${stillExists}`);
    if (!stillExists) {
      console.log(`STEP 4 — the ${target.allowableChildComponentTypes.length} AllowableChildComponentType junction row(s) that referenced it are now orphaned/cascade-deleted along with the parent — this run does not separately re-check the junction table's own GetAll, since the parent Component Type itself is the record ADO expects to survive.`);
    }
    expect(stillExists, `STEP 4 EXPECTED: "${INT_TARGET_NAME}" should still exist (delete should have been blocked because it is referenced by a junction)`).toBe(true);
  });
});
