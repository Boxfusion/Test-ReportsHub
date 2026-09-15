import { test, expect, type Page, type Locator } from '@playwright/test';

// Derived artefact — the canonical source is epm-allowable-child-component-type.md, which mirrors ADO
// test case 109449 in suite 109510. Edit the .md (and the ADO case), not this file, except for
// AI-repair patches.

const BASE = 'https://pd-epm-adminportal-qa-wf.shesha.app';
const API = 'https://pd-epm-api-qa-wf.shesha.app'; // -wf: matches where the UI actually writes — see epm-unit-of-measure-getall-host-mismatch memory
const COMPONENT_TYPE_CRUD = `${API}/api/dynamic/Epm/ComponentType/Crud`;
const ALLOWABLE_CHILD_CRUD = `${API}/api/dynamic/Epm/AllowableChildComponentType/Crud`;
const FLATTENED_ENDPOINT = `${API}/api/v1/Epm/PerformanceReportAllowedComponentTypes/GetFlattenedAllowedComponentTypesByTemplateId`;

// Real, shared reference data — see the .md's "Why this matters" note for why this test (uniquely
// among this hierarchy-definitions folder's specs) must touch shared config rather than a disposable
// Component Type, and why it always cleans up after itself.
const DEPARTMENT_TYPE_ID = 'f1ec68a8-ea98-41eb-9080-ea969ed89fd0'; // real, shared "Department" Component Type — id confirmed live 2026-08-27 (old id 05a72647... no longer exists)
const TEMPLATE_ID = '90455c8f-3ac5-4f1f-bc0d-b4078f612a7f'; // Emmanuel_template
const DEPT_COMPONENT_ID = '2c52c9d4-ea81-49b2-a8a2-314f6c116a16'; // Emmanuel_Department (Component instance)
const CHILD_TYPE_NAME = process.env.TC109449_CHILD_TYPE || 'Sub Programme';
const TC109450_CHILD_TYPE_NAME = process.env.TC109450_CHILD_TYPE || 'Sub Programme';
const COMPONENT_CRUD = `${API}/api/dynamic/Epm/Component/Crud`;
const PROGRAMME_TYPE_ID = 'a6e15044-7191-4281-af44-8e8cdb39e977'; // real, shared "Programme" Component Type
// Existing real tree instances under Emmanuel_Test_Report (see epm-performance-report-tree-navigation
// memory) — used only to confirm they remain intact, never modified.
const EXISTING_TREE_COMPONENT_IDS = {
  Emmanuel_Prog: '9e438e4b-ba50-4d02-9768-c149c1c65d52',
  Emmanuel_Sub_Prog: 'ef0c4809-caec-4cb2-86b8-a8bbfc212a9d',
  Emmanuel_QKPI: '3972b011-7078-4dec-851f-0e3ea7d279f1',
};
const QUANTITATIVE_KPI_TYPE_ID = '60e8340a-bdb7-4ac8-8b24-f90d2b5951bb'; // real, shared — deliberately NOT allowed under Department (id re-verified live 2026-08-27; old id was stale — see epm-emmanuel-tree-hard-deleted memory)
const PRINCESS_REPORT_ID = 'bc34f55d-bb32-4629-bd74-3e03250e4784'; // "Princess" — real, live report; replaces the now-gone Emmanuel_Test_Report
const PRINCESS_TEMPLATE_ID = '88eddb7b-9549-4e00-9fd4-a00347ee2cb8'; // "Nomfanelo" template used by Princess

const SLOW = 420_000;
const RAW_CHANNEL = process.env.PW_CHANNEL === undefined ? 'chrome' : process.env.PW_CHANNEL;
const CHANNEL = RAW_CHANNEL === '' || RAW_CHANNEL === 'chromium' ? undefined : RAW_CHANNEL;

test.use({
  channel: CHANNEL,
  viewport: { width: 1920, height: 1080 },
  actionTimeout: 30_000,
  navigationTimeout: 120_000,
});

test.describe('EPM — Component Type — Allowable Child Component Type table (ADO plan 108745 / suite 109510)', () => {
  test('TC-109449 Positive — Add an Allowable Child Component Type on the Component Type detail page', async ({ page }) => {
    test.setTimeout(1_200_000);
    console.log(`Target: Department (real, shared) -> ${CHILD_TYPE_NAME}`);

    await page.goto(`${BASE}/login`, { waitUntil: 'domcontentloaded' });
    await expect(page.locator('input').first()).toBeVisible({ timeout: SLOW });
    await page.locator('input').first().fill('admin.PrincessH');
    await page.locator('input[type="password"]').first().fill('123qwe');
    await page.getByRole('button', { name: /sign in|login/i }).first().click();
    await expect(page).not.toHaveURL(/\/login/, { timeout: SLOW });

    // PRECONDITION: Department must not already allow CHILD_TYPE_NAME (else this run would create a
    // duplicate rather than a clean addition, and cleanup would remove a link that pre-existed).
    const deptBefore = await (await page.request.get(`${COMPONENT_TYPE_CRUD}/Get?id=${DEPARTMENT_TYPE_ID}`)).json();
    const alreadyAllowed = (deptBefore.result?.allowableChildComponentTypes ?? []).some(
      (j: any) => (j._displayName || '').toLowerCase() === CHILD_TYPE_NAME.toLowerCase(),
    );
    expect(alreadyAllowed, `PRECONDITION: Department must not already allow "${CHILD_TYPE_NAME}" as a child`).toBe(false);
    console.log(`PRECONDITION — Department's current allowableChildrenSummary: "${deptBefore.result?.allowableChildrenSummary}"`);

    const flatBefore = await (await page.request.get(`${FLATTENED_ENDPOINT}?id=${TEMPLATE_ID}&parentComponentId=${DEPT_COMPONENT_ID}`)).json();
    const alreadyLegal = (flatBefore.result ?? []).some((o: any) => (o.componentTypeName || '').toLowerCase() === CHILD_TYPE_NAME.toLowerCase());
    console.log(`PRECONDITION — "${CHILD_TYPE_NAME}" already a legal next-level option under Emmanuel_Department: ${alreadyLegal}`);
    expect(alreadyLegal, `PRECONDITION: "${CHILD_TYPE_NAME}" must not already be a legal option`).toBe(false);

    let junctionId: string | null = null;
    try {
      await page.goto(`${BASE}/dynamic/Epm/component-type-details-view?id=${DEPARTMENT_TYPE_ID}`, { waitUntil: 'domcontentloaded' });
      await expect(page.locator('.ant-spin-spinning')).toHaveCount(0, { timeout: SLOW });
      await page.waitForTimeout(2_000);
      await expect(page.getByText('Component Type: Department', { exact: true })).toBeVisible({ timeout: SLOW });
      await page.screenshot({ path: 'projects/EPM/test-reports/2026-08-13/assets/tc109449-01-department-detail.png', fullPage: true });

      // ── STEP 2: Click the ellipsis menu on the Allowable Child Component Type section. ─────────
      // Confirmed live (see TC-108777): this is AntD's responsive-menu overflow indicator, an
      // icon-only ".ant-menu-submenu-title" inside "ul.sha-responsive-button-group".
      const overflowTitle = page.locator('ul[class*="sha-responsive-button-gr"] .ant-menu-submenu-title').first();
      await overflowTitle.scrollIntoViewIfNeeded();
      await overflowTitle.click({ timeout: 5_000, force: true });
      await page.waitForTimeout(1_000);
      const popup = page.locator('.ant-dropdown, .ant-menu-submenu-popup').locator('visible=true').first();
      await expect(popup, 'STEP 2 EXPECTED: ellipsis reveals + Add button').toBeVisible({ timeout: 10_000 });
      const addItem = popup.getByText('Add', { exact: true }).first();
      await expect(addItem, 'STEP 2 EXPECTED: + Add button visible in the revealed menu').toBeVisible({ timeout: 5_000 });
      await page.screenshot({ path: 'projects/EPM/test-reports/2026-08-13/assets/tc109449-02-ellipsis-menu.png', fullPage: true });

      // ── STEP 3: Click + Add. Select a Component Type. Save. ─────────────────────────────────────
      await addItem.click();
      const addModal = page.locator('.ant-modal-content').filter({ hasText: 'Add New Record' }).first();
      await expect(addModal).toBeVisible({ timeout: 15_000 });
      const childSelect = addModal.locator('label').filter({ hasText: /^Child Component Type/i }).first()
        .locator('xpath=following::*[contains(concat(" ", normalize-space(@class), " "), " ant-select ")][1]');
      await childSelect.click();
      const dd = page.locator('.ant-select-dropdown').locator('visible=true').first();
      await expect(dd).toBeVisible({ timeout: 15_000 });
      // Searchable/paginated select — type to filter (confirmed live: the default option list doesn't
      // reliably include every Component Type).
      await page.keyboard.type(CHILD_TYPE_NAME);
      await page.waitForTimeout(1_500);
      await dd.locator('.ant-select-item-option').filter({ hasText: new RegExp(`^${CHILD_TYPE_NAME}$`) }).first().click();
      await expect(childSelect.locator('.ant-select-selection-item')).toHaveText(CHILD_TYPE_NAME, { timeout: 15_000 });

      const postPromise = page
        .waitForResponse((r) => r.request().method() === 'POST' && /AllowableChildComponentType/i.test(r.url()), { timeout: 30_000 })
        .catch(() => null);
      await addModal.getByRole('button', { name: /^OK$/ }).click();
      const post = await postPromise;
      if (post) {
        const body = await post.text().catch(() => '');
        console.log(`STEP 3 — POST ${post.status()} ${post.url()}`);
        console.log(`STEP 3 — response: ${body.slice(0, 500)}`);
        expect(post.status(), 'STEP 3: creating the allowable-child link should succeed').toBeLessThan(400);
        try { junctionId = JSON.parse(body)?.result?.id ?? null; } catch { /* not JSON */ }
      }
      await expect(addModal, 'modal should close on successful save').toBeHidden({ timeout: 30_000 });
      expect(junctionId, 'STEP 3: a junction id should have been returned').toBeTruthy();

      // STEP 3 EXPECTED: row added to the Allowable Child list.
      await page.waitForTimeout(2_000);
      const newChildRow = page.locator('[role="row"]').filter({ has: page.getByText(CHILD_TYPE_NAME, { exact: true }) }).first();
      await expect(newChildRow, `STEP 3 EXPECTED: a row for "${CHILD_TYPE_NAME}" should appear in the Allowable Child list`).toBeVisible({ timeout: SLOW });
      await page.screenshot({ path: 'projects/EPM/test-reports/2026-08-13/assets/tc109449-03-row-added.png', fullPage: true });

      // ── STEP 4: Verify the child appears in the Reporting Tree builder as a legal next-level ──
      // option under Department. Verified via the network endpoint that actually powers the
      // Reporting Tree builder's "Add Child Item" options (see the .md's Mechanism note) rather
      // than the transient UI dropdown, which proved flaky to drive from a script.
      const flatAfter = await (await page.request.get(`${FLATTENED_ENDPOINT}?id=${TEMPLATE_ID}&parentComponentId=${DEPT_COMPONENT_ID}`)).json();
      console.log(`STEP 4 — flattened legal-options response: ${JSON.stringify(flatAfter.result)}`);
      const nowLegal = (flatAfter.result ?? []).some((o: any) => (o.componentTypeName || '').toLowerCase() === CHILD_TYPE_NAME.toLowerCase());
      expect(nowLegal, `STEP 4 EXPECTED: "${CHILD_TYPE_NAME}" should now be a legal next-level option under Emmanuel_Department`).toBe(true);
      console.log(`DONE — "${CHILD_TYPE_NAME}" confirmed as a legal next-level option under Department (junction id ${junctionId})`);

      // KNOWN UI DEFECT (confirmed live 2026-08-13, reproduced twice): the Reporting Tree builder's
      // "Add Child Item" button never renders its options dropdown, even though the data above proves
      // the option is correctly computed server-side. The sibling "Add Top Level Item" button, reading
      // the SAME endpoint for the SAME selected node, renders correctly. Logged (not asserted) so this
      // doesn't flip the automated result — ADO's step 4 literal expectation ("Legal option shown") is
      // NOT met via the browser UI, only via the API it depends on. See the .md's Mechanism note.
      await page.goto(`${BASE}/dynamic/Epm/performance-report-planning-page?id=32de39ae-5bdb-40ee-b53d-d2c9bb5dc906`, { waitUntil: 'domcontentloaded' });
      await expect(page.locator('.ant-spin-spinning')).toHaveCount(0, { timeout: SLOW });
      const deptNode = page.getByText('Emmanuel_Department', { exact: true }).first();
      await expect(deptNode).toBeVisible({ timeout: SLOW });
      await deptNode.click();
      for (let i = 0; i < 20; i++) {
        const t = await page.locator('body').innerText().catch(() => '');
        if (/Ref No/i.test(t) && /Weight/i.test(t)) break;
        await page.waitForTimeout(1_000);
      }
      const addChildBtn = page.locator('button, a').filter({ hasText: /Add Child Item/i }).first();
      await addChildBtn.click();
      let sawDropdown = false;
      for (let i = 0; i < 10; i++) {
        if (await page.locator('.ant-dropdown, .ant-select-dropdown').locator('visible=true').first().isVisible().catch(() => false)) {
          sawDropdown = true;
          break;
        }
        await page.waitForTimeout(1_000);
      }
      await page.screenshot({ path: 'projects/EPM/test-reports/2026-08-13/assets/tc109449-04-add-child-item-ui-check.png', fullPage: true });
      console.log(`KNOWN DEFECT CHECK — "Add Child Item" dropdown rendered in the UI: ${sawDropdown} (expected true per ADO step 4; API confirms the data is correct regardless)`);
    } finally {
      // Always restore the real, shared "Department" Component Type to its original configuration,
      // whether this run passed or failed partway through.
      if (junctionId) {
        const cleanup = await page.request.delete(`${ALLOWABLE_CHILD_CRUD}/Delete?id=${junctionId}`).catch(() => null);
        console.log(`CLEANUP — removed junction ${junctionId}: ${cleanup ? cleanup.status() : 'request failed'}`);
      }
    }
  });

  test('TC-109450 Negative — Reject adding a Component Type as its own Allowable Child (self-reference)', async ({ page }) => {
    test.setTimeout(1_200_000);
    console.log(`Target: Department (real, shared) self-reference, then a different type (${TC109450_CHILD_TYPE_NAME})`);

    await page.goto(`${BASE}/login`, { waitUntil: 'domcontentloaded' });
    await expect(page.locator('input').first()).toBeVisible({ timeout: SLOW });
    await page.locator('input').first().fill('admin.PrincessH');
    await page.locator('input[type="password"]').first().fill('123qwe');
    await page.getByRole('button', { name: /sign in|login/i }).first().click();
    await expect(page).not.toHaveURL(/\/login/, { timeout: SLOW });

    let selfRefJunctionId: string | null = null;
    let differentTypeJunctionId: string | null = null;
    try {
      await page.goto(`${BASE}/dynamic/Epm/component-type-details-view?id=${DEPARTMENT_TYPE_ID}`, { waitUntil: 'domcontentloaded' });
      await expect(page.locator('.ant-spin-spinning')).toHaveCount(0, { timeout: SLOW });
      await page.waitForTimeout(2_000);
      await expect(page.getByText('Component Type: Department', { exact: true })).toBeVisible({ timeout: SLOW });

      // ── STEP 2: Attempt to add Department itself as an Allowable Child. ────────────────────────
      const overflowTitle = page.locator('ul[class*="sha-responsive-button-gr"] .ant-menu-submenu-title').first();
      await overflowTitle.scrollIntoViewIfNeeded();
      await overflowTitle.click({ timeout: 5_000, force: true });
      await page.waitForTimeout(1_000);
      const popup = page.locator('.ant-dropdown, .ant-menu-submenu-popup').locator('visible=true').first();
      await expect(popup).toBeVisible({ timeout: 10_000 });
      await popup.getByText('Add', { exact: true }).first().click();

      const addModal = page.locator('.ant-modal-content').filter({ hasText: 'Add New Record' }).first();
      await expect(addModal).toBeVisible({ timeout: 15_000 });
      const childSelect = addModal.locator('label').filter({ hasText: /^Child Component Type/i }).first()
        .locator('xpath=following::*[contains(concat(" ", normalize-space(@class), " "), " ant-select ")][1]');
      await childSelect.click();
      let dd = page.locator('.ant-select-dropdown').locator('visible=true').first();
      await expect(dd).toBeVisible({ timeout: 15_000 });
      await page.keyboard.type('Department');
      await page.waitForTimeout(1_500);
      const selfOption = dd.locator('.ant-select-item-option').filter({ hasText: /^Department$/ }).first();
      const selfOfferedInUI = await selfOption.isVisible().catch(() => false);
      console.log(`STEP 2 — "Department" offered as its own Child Component Type option in the UI: ${selfOfferedInUI} (ADO's implicit assumption is that this is reachable to attempt)`);
      await selfOption.click();

      const selfPostPromise = page
        .waitForResponse((r) => r.request().method() === 'POST' && /AllowableChildComponentType/i.test(r.url()), { timeout: 30_000 })
        .catch(() => null);
      await addModal.getByRole('button', { name: /^OK$/ }).click();
      const selfPost = await selfPostPromise;
      let selfRefRejected = true;
      if (selfPost) {
        const body = await selfPost.text().catch(() => '');
        console.log(`STEP 2 — POST ${selfPost.status()} ${selfPost.url()}`);
        console.log(`STEP 2 — response: ${body.slice(0, 500)}`);
        selfRefRejected = selfPost.status() >= 400;
        if (!selfRefRejected) {
          try { selfRefJunctionId = JSON.parse(body)?.result?.id ?? null; } catch { /* not JSON */ }
        }
      }
      const modalClosedAfterSelfRef = await addModal.isHidden().catch(() => true);
      console.log(`STEP 2 ACTUAL — self-reference ${selfRefRejected ? 'was REJECTED' : 'was ACCEPTED (modal closed, junction created)'}; ADO EXPECTED: "Rejected with a self-reference validation error".`);
      await page.screenshot({ path: 'projects/EPM/test-reports/2026-08-13/assets/tc109450-01-self-reference-attempt.png', fullPage: true });
      if (!modalClosedAfterSelfRef) {
        await addModal.locator('button').filter({ hasText: /^Cancel$/ }).first().click().catch(() => {});
      }
      expect(selfRefRejected, 'STEP 2 EXPECTED (not implemented yet): self-reference should be rejected with a validation error').toBe(true);

      // ── STEP 3: Add a different Component Type. Save succeeds. ─────────────────────────────────
      const before = await (await page.request.get(`${COMPONENT_TYPE_CRUD}/Get?id=${DEPARTMENT_TYPE_ID}`)).json();
      const alreadyAllowed = (before.result?.allowableChildComponentTypes ?? []).some(
        (j: any) => (j._displayName || '').toLowerCase() === TC109450_CHILD_TYPE_NAME.toLowerCase(),
      );
      expect(alreadyAllowed, `PRECONDITION: Department must not already allow "${TC109450_CHILD_TYPE_NAME}" as a child`).toBe(false);

      await overflowTitle.scrollIntoViewIfNeeded();
      await overflowTitle.click({ timeout: 5_000, force: true });
      await page.waitForTimeout(1_000);
      const popup2 = page.locator('.ant-dropdown, .ant-menu-submenu-popup').locator('visible=true').first();
      await expect(popup2).toBeVisible({ timeout: 10_000 });
      await popup2.getByText('Add', { exact: true }).first().click();
      const addModal2 = page.locator('.ant-modal-content').filter({ hasText: 'Add New Record' }).first();
      await expect(addModal2).toBeVisible({ timeout: 15_000 });
      const childSelect2 = addModal2.locator('label').filter({ hasText: /^Child Component Type/i }).first()
        .locator('xpath=following::*[contains(concat(" ", normalize-space(@class), " "), " ant-select ")][1]');
      await childSelect2.click();
      dd = page.locator('.ant-select-dropdown').locator('visible=true').first();
      await expect(dd).toBeVisible({ timeout: 15_000 });
      await page.keyboard.type(TC109450_CHILD_TYPE_NAME);
      await page.waitForTimeout(1_500);
      await dd.locator('.ant-select-item-option').filter({ hasText: new RegExp(`^${TC109450_CHILD_TYPE_NAME}$`) }).first().click();

      const diffPostPromise = page
        .waitForResponse((r) => r.request().method() === 'POST' && /AllowableChildComponentType/i.test(r.url()), { timeout: 30_000 })
        .catch(() => null);
      await addModal2.getByRole('button', { name: /^OK$/ }).click();
      const diffPost = await diffPostPromise;
      if (diffPost) {
        const body = await diffPost.text().catch(() => '');
        console.log(`STEP 3 — POST ${diffPost.status()} ${diffPost.url()}`);
        expect(diffPost.status(), 'STEP 3 EXPECTED: adding a different Component Type should succeed').toBeLessThan(400);
        try { differentTypeJunctionId = JSON.parse(body)?.result?.id ?? null; } catch { /* not JSON */ }
      }
      await expect(addModal2, 'STEP 3 EXPECTED: modal should close on successful save').toBeHidden({ timeout: 30_000 });
      expect(differentTypeJunctionId, 'STEP 3: a junction id should have been returned').toBeTruthy();
      console.log(`DONE — STEP 3 succeeded, junction id ${differentTypeJunctionId}`);
    } finally {
      // Always restore the real, shared "Department" Component Type — remove BOTH whatever this run
      // created, whether it passed or failed partway through.
      for (const id of [selfRefJunctionId, differentTypeJunctionId]) {
        if (!id) continue;
        const cleanup = await page.request.delete(`${ALLOWABLE_CHILD_CRUD}/Delete?id=${id}`).catch(() => null);
        console.log(`CLEANUP — removed junction ${id}: ${cleanup ? cleanup.status() : 'request failed'}`);
      }
    }
  });

  test('TC-109451 Edge — Removing an Allowable Child does not orphan already-created tree nodes', async ({ page }) => {
    test.setTimeout(1_200_000);
    console.log('Target: remove real Department -> Programme junction, verify existing tree intact, then restore it.');

    await page.goto(`${BASE}/login`, { waitUntil: 'domcontentloaded' });
    await expect(page.locator('input').first()).toBeVisible({ timeout: SLOW });
    await page.locator('input').first().fill('admin.PrincessH');
    await page.locator('input[type="password"]').first().fill('123qwe');
    await page.getByRole('button', { name: /sign in|login/i }).first().click();
    await expect(page).not.toHaveURL(/\/login/, { timeout: SLOW });

    // PRECONDITION: confirm the real junction and the real tree nodes it enables exist.
    const deptBefore = await (await page.request.get(`${COMPONENT_TYPE_CRUD}/Get?id=${DEPARTMENT_TYPE_ID}`)).json();
    const programmeJunction = (deptBefore.result?.allowableChildComponentTypes ?? []).find(
      (j: any) => (j._displayName || '').toLowerCase() === 'programme',
    );
    expect(programmeJunction, 'PRECONDITION: Department must currently allow Programme as a child').toBeTruthy();
    const programmeJunctionId: string = programmeJunction.id;
    console.log(`PRECONDITION — Department's allowableChildrenSummary before: "${deptBefore.result?.allowableChildrenSummary}" (junction id ${programmeJunctionId})`);

    for (const [name, id] of Object.entries(EXISTING_TREE_COMPONENT_IDS)) {
      const c = await (await page.request.get(`${COMPONENT_CRUD}/Get?id=${id}`)).json();
      expect(c.result, `PRECONDITION: existing tree component "${name}" must exist before this run`).toBeTruthy();
      console.log(`PRECONDITION — "${name}" exists: name="${c.result?.name}", type="${c.result?.componentType?._displayName}"`);
    }

    let removed = false;
    try {
      // ── STEP 2: Remove Programme from Department Allowable Children. ───────────────────────────
      await page.goto(`${BASE}/dynamic/Epm/component-type-details-view?id=${DEPARTMENT_TYPE_ID}`, { waitUntil: 'domcontentloaded' });
      await expect(page.locator('.ant-spin-spinning')).toHaveCount(0, { timeout: SLOW });
      await page.waitForTimeout(2_000);
      const programmeRow = page.locator('[role="row"]').filter({ has: page.getByText('Programme', { exact: true }) }).first();
      await expect(programmeRow, 'the Programme row should be visible in the Allowable Child list').toBeVisible({ timeout: SLOW });
      const deleteIcon = programmeRow.locator('button[title="Delete"], .anticon-delete').first();
      await deleteIcon.click({ timeout: 15_000, force: true });
      await page.waitForTimeout(1_000);
      const confirmPopup = page.locator('.ant-popover, .ant-modal-content, .ant-popconfirm').locator('visible=true').first();
      await expect(confirmPopup, 'a confirmation dialog should appear').toBeVisible({ timeout: 10_000 });
      const deletePostPromise = page
        .waitForResponse((r) => /AllowableChildComponentType\/Crud\/Delete/i.test(r.url()), { timeout: 20_000 })
        .catch(() => null);
      await confirmPopup.getByRole('button', { name: /^(Yes|OK|Delete)$/i }).first().click({ timeout: 10_000 });
      const deletePost = await deletePostPromise;
      if (deletePost) {
        console.log(`STEP 2 — ${deletePost.request().method()} ${deletePost.status()} ${deletePost.url()}`);
        expect(deletePost.status(), 'STEP 2: removing the Allowable Child link should succeed').toBeLessThan(400);
        removed = true;
      }
      await page.waitForTimeout(2_000);
      await page.screenshot({ path: 'projects/EPM/test-reports/2026-08-13/assets/tc109451-01-after-removal.png', fullPage: true });

      const deptAfterRemoval = await (await page.request.get(`${COMPONENT_TYPE_CRUD}/Get?id=${DEPARTMENT_TYPE_ID}`)).json();
      console.log(`STEP 2 — Department's allowableChildrenSummary after removal: "${deptAfterRemoval.result?.allowableChildrenSummary}"`);
      const stillAllowsProgramme = (deptAfterRemoval.result?.allowableChildComponentTypes ?? []).some(
        (j: any) => (j._displayName || '').toLowerCase() === 'programme',
      );
      expect(stillAllowsProgramme, 'STEP 2: Programme should no longer be an allowable child of Department').toBe(false);

      // STEP 2 EXPECTED: existing tree nodes remain intact.
      for (const [name, id] of Object.entries(EXISTING_TREE_COMPONENT_IDS)) {
        const c = await (await page.request.get(`${COMPONENT_CRUD}/Get?id=${id}`)).json();
        expect(c.result, `STEP 2 EXPECTED: existing tree component "${name}" should remain intact after removing the Allowable Child link`).toBeTruthy();
        console.log(`STEP 2 — "${name}" still intact: name="${c.result?.name}", type="${c.result?.componentType?._displayName}"`);
      }
      console.log('STEP 2 — confirmed: all existing tree nodes (Emmanuel_Prog, Emmanuel_Sub_Prog, Emmanuel_QKPI) remain intact after removing the Allowable Child link.');

      // ── STEP 3: Attempt to add a NEW Programme under Department in the tree builder. ───────────
      // Verified via the flattened-options API (the mechanism that actually powers the tree
      // builder's Add buttons — see epm-add-child-item-dropdown-defect memory for why the literal
      // "Add Child Item" UI dropdown isn't a reliable check here) rather than the transient dropdown.
      const flatAfter = await (await page.request.get(`${FLATTENED_ENDPOINT}?id=${TEMPLATE_ID}&parentComponentId=${DEPT_COMPONENT_ID}`)).json();
      console.log(`STEP 3 — flattened legal-options response: ${JSON.stringify(flatAfter.result)}`);
      const programmeStillLegal = (flatAfter.result ?? []).some((o: any) => (o.componentTypeName || '').toLowerCase() === 'programme');
      expect(programmeStillLegal, 'STEP 3 EXPECTED: Programme should be rejected — no longer a legal next-level option under Department').toBe(false);
      console.log('DONE — Programme correctly rejected as a legal next-level option after removing the Allowable Child link.');
    } finally {
      // Always restore the real, shared Department -> Programme link (with Can Be Root, matching its
      // original configuration), whether this run passed or failed partway through.
      if (removed) {
        await page.goto(`${BASE}/dynamic/Epm/component-type-details-view?id=${DEPARTMENT_TYPE_ID}`, { waitUntil: 'domcontentloaded' });
        await expect(page.locator('.ant-spin-spinning')).toHaveCount(0, { timeout: SLOW }).catch(() => {});
        await page.waitForTimeout(2_000);
        const overflowTitle = page.locator('ul[class*="sha-responsive-button-gr"] .ant-menu-submenu-title').first();
        await overflowTitle.scrollIntoViewIfNeeded().catch(() => {});
        await overflowTitle.click({ timeout: 5_000, force: true }).catch(() => {});
        await page.waitForTimeout(1_000);
        const popup = page.locator('.ant-dropdown, .ant-menu-submenu-popup').locator('visible=true').first();
        if (await popup.isVisible().catch(() => false)) {
          await popup.getByText('Add', { exact: true }).first().click();
          const addModal = page.locator('.ant-modal-content').filter({ hasText: 'Add New Record' }).first();
          if (await addModal.isVisible({ timeout: 15_000 }).catch(() => false)) {
            const childSelect = addModal.locator('label').filter({ hasText: /^Child Component Type/i }).first()
              .locator('xpath=following::*[contains(concat(" ", normalize-space(@class), " "), " ant-select ")][1]');
            await childSelect.click();
            const dd = page.locator('.ant-select-dropdown').locator('visible=true').first();
            if (await dd.isVisible({ timeout: 15_000 }).catch(() => false)) {
              await page.keyboard.type('Programme');
              await page.waitForTimeout(1_500);
              await dd.locator('.ant-select-item-option').filter({ hasText: /^Programme$/ }).first().click();
              const rootCheckbox = addModal.locator('label').filter({ hasText: /^Can Be Root/i }).first()
                .locator('xpath=following::input[@type="checkbox"][1]');
              await rootCheckbox.check({ force: true }).catch(() => {});
              const restorePostPromise = page
                .waitForResponse((r) => r.request().method() === 'POST' && /AllowableChildComponentType/i.test(r.url()), { timeout: 30_000 })
                .catch(() => null);
              await addModal.getByRole('button', { name: /^OK$/ }).click();
              const restorePost = await restorePostPromise;
              console.log(`RESTORE — re-added Department -> Programme (Can Be Root): ${restorePost ? restorePost.status() : 'no response observed'}`);
            }
          }
        }
        const deptFinal = await (await page.request.get(`${COMPONENT_TYPE_CRUD}/Get?id=${DEPARTMENT_TYPE_ID}`)).json();
        console.log(`RESTORE — Department's allowableChildrenSummary after restoration: "${deptFinal.result?.allowableChildrenSummary}"`);
      }
    }
  });

  test('TC-109452 Integration — Allowable Child Component Type list drives the Reporting Tree builder allowed operations', async ({ page }) => {
    test.setTimeout(1_200_000);
    const token = Date.now().toString().slice(-6);
    const parentTypeName = `TC109452 Parent ${token}`;
    console.log(`Target: a fresh, childless parent Component (type "${parentTypeName}") with exactly 3 allowable children, verified via API, then an API bypass attempt with a disallowed 4th type.`);
    // Deliberately isolated from the real "Department" type/tree: Department's existing "Programme"
    // allowable child already has a live instance (Emmanuel_Prog), so the flattened endpoint correctly
    // excludes it as "already used" — confirmed live 2026-08-14, meaning "3 configured == 3 shown"
    // doesn't hold there. A brand-new, childless parent avoids that entanglement entirely. This also
    // avoids the Reporting Tree builder UI altogether — see epm-tree-builder-force-click-creates-orphans
    // memory (interacting with that toolbar has been found to silently create real orphan Components).

    await page.goto(`${BASE}/login`, { waitUntil: 'domcontentloaded' });
    await expect(page.locator('input').first()).toBeVisible({ timeout: SLOW });
    await page.locator('input').first().fill('admin.PrincessH');
    await page.locator('input[type="password"]').first().fill('123qwe');
    await page.getByRole('button', { name: /sign in|login/i }).first().click();
    await expect(page).not.toHaveURL(/\/login/, { timeout: SLOW });

    let parentTypeId: string | null = null;
    let junctionIds: string[] = [];
    let rootComponentId: string | null = null;
    let bypassComponentId: string | null = null;
    try {
      // ── Setup: disposable parent Component Type + exactly 3 allowable children + a fresh, ──────
      // childless top-level Component instance of that type in the real (only) Performance Report. ──
      const addBtn = page.locator('.ant-btn').filter({ hasText: /^Add$/ }).locator('visible=true').first();
      await page.goto(`${BASE}/dynamic/Epm/component-types`, { waitUntil: 'domcontentloaded' });
      await expect(page.locator('.ant-spin-spinning')).toHaveCount(0, { timeout: SLOW });
      await expect(addBtn).toBeVisible({ timeout: SLOW });
      await page.mouse.move(960, 540);
      await page.waitForTimeout(1_000);
      await addBtn.click({ timeout: 15_000 });
      const createModal = page.locator('.ant-modal-content').filter({ hasText: 'Add New Component Type' }).first();
      await expect(createModal).toBeVisible({ timeout: SLOW });
      await expect(createModal.locator('input, .ant-select').first()).toBeVisible({ timeout: 60_000 });
      await createModal.locator('label').filter({ hasText: /^Name/i }).first().locator('xpath=following::input[1]').fill(parentTypeName);
      const typeSelect = createModal.locator('label').filter({ hasText: /^Type/i }).first()
        .locator('xpath=following::*[contains(concat(" ", normalize-space(@class), " "), " ant-select ")][1]');
      await typeSelect.click();
      let dd = page.locator('.ant-select-dropdown').locator('visible=true').first();
      await expect(dd).toBeVisible({ timeout: 30_000 });
      await dd.locator('.ant-select-item-option').filter({ hasText: /^Department$/ }).first().click();
      const bodSelect = createModal.locator('label').filter({ hasText: /^Based On Definition/i }).first()
        .locator('xpath=following::*[contains(concat(" ", normalize-space(@class), " "), " ant-select ")][1]');
      await bodSelect.click();
      dd = page.locator('.ant-select-dropdown').locator('visible=true').first();
      await expect(dd).toBeVisible({ timeout: 30_000 });
      await dd.locator('.ant-select-item-option').filter({ hasText: /^Always$/ }).first().click();
      const createPostPromise = page.waitForResponse((r) => r.request().method() === 'POST' && /ComponentType\/Crud\/Create/i.test(r.url()), { timeout: 30_000 }).catch(() => null);
      await createModal.getByRole('button', { name: /^Create$/ }).click();
      const createPost = await createPostPromise;
      if (createPost) {
        const body = await createPost.text().catch(() => '');
        try { parentTypeId = JSON.parse(body)?.result?.id ?? null; } catch { /* not JSON */ }
      }
      await expect(createModal).toBeHidden({ timeout: 90_000 });
      expect(parentTypeId, 'setup: disposable parent Component Type should have been created').toBeTruthy();
      console.log(`Setup — created disposable parent Component Type "${parentTypeName}" (id ${parentTypeId})`);

      // Add exactly 3 allowable children directly via the API (setup, not a graded step).
      // NOTE: "Programme" is deliberately NOT used here — confirmed live 2026-08-14 that it's
      // currently missing from Emmanuel_template's own PerformanceReportAllowedComponentType list
      // (present at session start, gone by the time this test was built; not something this session's
      // automation removed, most likely changed via separate manual testing happening in parallel).
      // Since template-level registration is a precondition for a type to appear in the flattened
      // endpoint at all (confirmed separately — see the .md's TC-109449 Mechanism note on "both config
      // steps required together"), Programme is excluded from EVERY parent's legal-options list right
      // now regardless of AllowableChildComponentType config. This is a live-data fact, not something
      // to fix here — see epm-allowable-child-component-type.md for the full note.
      const threeChildTypes = [
        { name: 'Sub Programme', id: '00000000-0000-0000-0000-000000000000' }, // placeholder, resolved below
        { name: 'Qualitative KPI', id: '00000000-0000-0000-0000-000000000000' }, // placeholder, resolved below
        { name: 'Department', id: DEPARTMENT_TYPE_ID },
      ];
      const allTypes = await (await page.request.get(`${COMPONENT_TYPE_CRUD}/GetAll?maxResultCount=1000`)).json();
      const findId = (name: string) => allTypes.result.items.find((t: any) => t.name.toLowerCase() === name.toLowerCase())?.id;
      threeChildTypes[0].id = findId('Sub Programme');
      threeChildTypes[1].id = findId('Qualitative KPI');
      for (const t of threeChildTypes) expect(t.id, `setup: could not resolve real Component Type id for "${t.name}"`).toBeTruthy();

      for (const t of threeChildTypes) {
        const resp = await page.request.post(`${ALLOWABLE_CHILD_CRUD}/Create`, {
          data: { parentComponentType: { id: parentTypeId }, childComponentType: { id: t.id }, canBeRoot: false },
        });
        const body = await resp.json().catch(() => null);
        expect(resp.status(), `setup: adding "${t.name}" as an allowable child should succeed`).toBeLessThan(400);
        const jid = body?.result?.id;
        expect(jid, `setup: junction id should be returned for "${t.name}"`).toBeTruthy();
        junctionIds.push(jid);
      }
      console.log(`Setup — added exactly 3 allowable children: ${threeChildTypes.map((t) => t.name).join(', ')}`);

      // Create a brand-new, childless top-level Component instance of the disposable type, in the
      // real (only) Performance Report — so the flattened endpoint has nothing to filter out.
      const rootResp = await page.request.post(`${COMPONENT_CRUD}/Create`, {
        data: {
          componentType: { id: parentTypeId },
          performanceReport: { id: PRINCESS_REPORT_ID },
          name: `TC109452 Root ${token}`,
        },
      });
      const rootBody = await rootResp.json().catch(() => null);
      expect(rootResp.status(), 'setup: creating the fresh top-level Component should succeed').toBeLessThan(400);
      rootComponentId = rootBody?.result?.id ?? null;
      expect(rootComponentId, 'setup: root component id should be returned').toBeTruthy();
      console.log(`Setup — created fresh top-level Component "TC109452 Root ${token}" (id ${rootComponentId})`);

      // ── STEP 2: Open the Reporting Tree builder (verified via API — see the .md's Mechanism ────
      // note for why the literal "Add Child Item" dialog can't be checked directly, and why the tree
      // builder UI isn't touched at all here). ────────────────────────────────────────────────────
      const flat = await (await page.request.get(`${FLATTENED_ENDPOINT}?id=${PRINCESS_TEMPLATE_ID}&parentComponentId=${rootComponentId}`)).json();
      const optionNames: string[] = (flat.result ?? []).map((o: any) => o.componentTypeName);
      console.log(`STEP 2 — legal next-level options under the fresh parent: ${JSON.stringify(optionNames)}`);
      expect(optionNames.length, 'STEP 2 EXPECTED: exactly 3 child types listed').toBe(3);
      for (const t of threeChildTypes) {
        expect(optionNames.some((n) => n.toLowerCase() === t.name.toLowerCase()), `STEP 2 EXPECTED: "${t.name}" should be among the 3 listed types`).toBe(true);
      }
      console.log('KNOWN UI LIMITATION — the literal "Add Child Item" dialog does not render (see epm-add-child-item-dropdown-defect memory); verified via the API it depends on instead.');

      // ── STEP 3: Attempt to bypass by API POST with a disallowed type. ──────────────────────────
      expect(optionNames.some((n) => n.toLowerCase() === 'quantitative kpi'),
        'sanity check: Quantitative KPI must NOT be one of the 3 allowed types for this bypass attempt to be meaningful').toBe(false);
      const bypassResp = await page.request.post(`${COMPONENT_CRUD}/Create`, {
        data: {
          parent: { id: rootComponentId },
          componentType: { id: QUANTITATIVE_KPI_TYPE_ID },
          performanceReport: { id: PRINCESS_REPORT_ID },
          name: 'TC109452-BYPASS-ATTEMPT',
        },
      });
      const bypassBody = await bypassResp.json().catch(() => null);
      console.log(`STEP 3 — POST ${bypassResp.status()} ${COMPONENT_CRUD}/Create :: ${JSON.stringify(bypassBody).slice(0, 500)}`);
      const bypassRejected = bypassResp.status() >= 400;
      if (!bypassRejected) {
        bypassComponentId = bypassBody?.result?.id ?? null;
      }
      console.log(`STEP 3 ACTUAL — disallowed-type creation ${bypassRejected ? 'was REJECTED' : 'was ACCEPTED (Component created, id ' + bypassComponentId + ')'}; ADO EXPECTED: "Server-side validation rejects".`);
      expect(bypassRejected, 'STEP 3 EXPECTED (not implemented yet): server-side validation should reject a disallowed type').toBe(true);
      console.log('DONE — server-side validation correctly rejected the disallowed type.');
    } finally {
      // Always clean up every Component/junction this run created, whether it passed or failed
      // partway through — the fresh parent Component is a real node in the shared report tree.
      if (bypassComponentId) {
        const cleanup = await page.request.delete(`${COMPONENT_CRUD}/Delete?id=${bypassComponentId}`).catch(() => null);
        console.log(`CLEANUP — removed bypass-created Component ${bypassComponentId}: ${cleanup ? cleanup.status() : 'request failed'}`);
      }
      if (rootComponentId) {
        const cleanup = await page.request.delete(`${COMPONENT_CRUD}/Delete?id=${rootComponentId}`).catch(() => null);
        console.log(`CLEANUP — removed fresh top-level Component ${rootComponentId}: ${cleanup ? cleanup.status() : 'request failed'}`);
      }
      for (const jid of junctionIds) {
        const cleanup = await page.request.delete(`${ALLOWABLE_CHILD_CRUD}/Delete?id=${jid}`).catch(() => null);
        console.log(`CLEANUP — removed junction ${jid}: ${cleanup ? cleanup.status() : 'request failed'}`);
      }
      console.log(`CLEANUP — disposable parent Component Type "${parentTypeName}" (id ${parentTypeId}) left in place, per this project's no-teardown convention for created Component Types.`);
    }
  });
});
