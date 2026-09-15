import { test, expect, type Page, type Locator } from '@playwright/test';

// Derived artefact — the canonical source is epm-component-type-unicode-name.md, which mirrors ADO test
// case 108809 in suite 109511. Edit the .md (and the ADO case), not this file, except for AI-repair
// patches.
//
// Fetched directly from Azure DevOps (org boxfusion, project PD-Epm) via the REST API 2026-08-27 — see
// the .md's header. An earlier draft assumed no new Component Type could be created at all (QA's 7
// existing Types already cover the closed set observed at the time); corrected per the user —
// `Type = District` is confirmed live (ComponentType/Crud/GetAll) to be a valid, unused Type value, so
// this creates a genuine disposable Component Type, matching ADO's literal Create steps exactly.

const BASE = 'https://pd-epm-adminportal-qa-wf.shesha.app';
// Must match BASE's host family — confirmed live 2026-08-27 across multiple specs in this suite that
// the plain -qa host doesn't see records created/updated via the -wf UI.
const API = 'https://pd-epm-api-qa-wf.shesha.app';
const COMPONENT_TYPE_CRUD = `${API}/api/dynamic/Epm/ComponentType/Crud`;

// ADO's own literal example — isiZulu/isiXhosa click consonants (ǀ, ǁ) alongside standard Latin text.
const UNICODE_NAME = 'Uhlelo lwezomnotho ǀ ǀǀ';
// Confirmed live 2026-08-27: the dropdown option is spelled "Districts" (plural), not "District" —
// re-check via the create form's own Type dropdown (not just GetAll) if this ever collides.
const TYPE_NAME = 'Districts';
const BASED_ON_DEFINITION = 'Always';

const FLAG_LABELS = [
  'Is Indicator',
  'Show In Admin Tree',
  'Progress Reporting Required',
  'Is Folder',
  'Show In Viewer Tree',
  'Progress Reviewing Required',
];

const SLOW = 420_000;
const RAW_CHANNEL = process.env.PW_CHANNEL === undefined ? 'chrome' : process.env.PW_CHANNEL;
const CHANNEL = RAW_CHANNEL === '' || RAW_CHANNEL === 'chromium' ? undefined : RAW_CHANNEL;

test.use({
  channel: CHANNEL,
  viewport: { width: 1920, height: 1080 },
  actionTimeout: 30_000,
  navigationTimeout: 120_000,
});

// Retry the whole flyout path — see epm-component-type-canberoot.spec.ts for the rationale (a hover
// landing before rc-menu hydrates is swallowed; short per-action timeouts fail fast and re-open).
async function hoverUntilVisible(page: Page, trigger: Locator, revealed: Locator, label: string) {
  for (let attempt = 1; attempt <= 8; attempt++) {
    await trigger.hover({ force: true }).catch((e) => console.log(`  ${label}: hover attempt ${attempt} errored: ${e.message}`));
    await page.waitForTimeout(2_000);
    if (await revealed.isVisible().catch(() => false)) return;
    console.log(`  ${label}: not open after hover attempt ${attempt}, retrying`);
    await page.mouse.move(1_400, 900);
    await page.waitForTimeout(500);
  }
  throw new Error(`${label} never opened after 8 hover attempts`);
}

async function checkAllFlags(modal: Locator, label: string) {
  for (const flagLabel of FLAG_LABELS) {
    const checkbox = modal.locator('label').filter({ hasText: new RegExp(`^${flagLabel}$`, 'i') }).first()
      .locator('xpath=following::input[@type="checkbox"][1]');
    await checkbox.check({ force: true });
    await expect(checkbox, `${label}: "${flagLabel}" should be checked`).toBeChecked();
  }
}

test.describe('EPM — Component Type management (ADO plan 108745 / suite 109511)', () => {
  test('TC-108809 Edge — Component Type name accepts full Unicode range including South African language characters', async ({ page }) => {
    test.setTimeout(1_200_000);
    console.log(`Component Type name (Unicode) = ${UNICODE_NAME}`);
    console.log(`Type = ${TYPE_NAME}`);

    // PRECONDITION: signed in as administrator.
    await page.goto(`${BASE}/login`, { waitUntil: 'domcontentloaded' });
    await expect(page.locator('input').first()).toBeVisible({ timeout: SLOW });
    await page.locator('input').first().fill('admin.PrincessH');
    await page.locator('input[type="password"]').first().fill('123qwe');
    await page.getByRole('button', { name: /sign in|login/i }).first().click();
    await expect(page).not.toHaveURL(/\/login/, { timeout: SLOW });

    // PRECONDITION: no Component Type named with this Unicode string already exists, and Type=District
    // is genuinely unused (confirmed at authoring time via GetAll — re-verify live in case of drift).
    const before = ((await (await page.request.get(`${COMPONENT_TYPE_CRUD}/GetAll?maxResultCount=1000`, { timeout: SLOW })).json()).result?.items ?? []) as any[];
    expect(before.some((c) => c.name === UNICODE_NAME), 'the unique Unicode name must not already exist').toBe(false);
    expect(before.some((c) => c.type?._displayName === TYPE_NAME || c.name === TYPE_NAME), `Type "${TYPE_NAME}" must not already be in use`).toBe(false);
    console.log(`PRECONDITION — ${before.length} Component Types before creation; "${TYPE_NAME}" confirmed unused`);

    // Navigate Epm > Adminstration > Component Type. ADO's literal route (/dynamic/Epm/ComponentType/)
    // 404s — the real route is /dynamic/Epm/component-types (see epm-component-type-canberoot.md).
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

    // ── STEP 2: Create a Component Type with a Unicode Name. ───────────────────
    const addBtn = page.locator('.ant-btn').filter({ hasText: /^Add$/ }).locator('visible=true').first();
    await expect(addBtn, 'Component Type list should have an Add button').toBeVisible({ timeout: SLOW });
    await page.mouse.move(960, 540);
    await page.waitForTimeout(1_000);
    await addBtn.click({ timeout: 15_000 });

    const createModal = page.locator('.ant-modal-content').filter({ hasText: 'Add New Component Type' }).first();
    await expect(createModal, 'the Component Type create form should load').toBeVisible({ timeout: SLOW });
    await expect(createModal.locator('input, .ant-select').first(), 'the create form fields should mount').toBeVisible({ timeout: 60_000 });

    const nameField = createModal.locator('label').filter({ hasText: /^Name/i }).first().locator('xpath=following::input[1]');
    await nameField.fill(UNICODE_NAME);
    await expect(nameField, 'STEP 2 EXPECTED: the form accepts the name without encoding warnings').toHaveValue(UNICODE_NAME);
    const explainErrorsAfterName = await createModal.locator('.ant-form-item-explain-error').allTextContents().catch(() => []);
    console.log(`STEP 2 — visible validation errors after entering the Unicode name: ${JSON.stringify(explainErrorsAfterName)}`);

    const typeSelect = createModal.locator('label').filter({ hasText: /^Type/i }).first()
      .locator('xpath=following::*[contains(concat(" ", normalize-space(@class), " "), " ant-select ")][1]');
    await typeSelect.click();
    let dd = page.locator('.ant-select-dropdown').locator('visible=true').first();
    await expect(dd).toBeVisible({ timeout: 30_000 });
    await dd.locator('.ant-select-item-option').filter({ hasText: new RegExp(`^${TYPE_NAME}$`) }).first().click();
    await expect(typeSelect.locator('.ant-select-selection-item')).toHaveText(TYPE_NAME, { timeout: 30_000 });

    const bodSelect = createModal.locator('label').filter({ hasText: /^Based On Definition/i }).first()
      .locator('xpath=following::*[contains(concat(" ", normalize-space(@class), " "), " ant-select ")][1]');
    await bodSelect.click();
    dd = page.locator('.ant-select-dropdown').locator('visible=true').first();
    await expect(dd).toBeVisible({ timeout: 30_000 });
    await dd.locator('.ant-select-item-option').filter({ hasText: new RegExp(`^${BASED_ON_DEFINITION}$`) }).first().click();
    await expect(bodSelect.locator('.ant-select-selection-item')).toHaveText(BASED_ON_DEFINITION, { timeout: 30_000 });

    await checkAllFlags(createModal, 'TC-108809');
    await page.screenshot({ path: 'projects/EPM/test-reports/2026-08-13/assets/tc108809-01-form-filled.png', fullPage: true });

    // Safety net: confirm the Unicode name is still intact right before submitting, in case of any
    // async remount clearing it (confirmed pattern elsewhere in this suite, e.g. TC-108778's Name field).
    await expect(nameField, 'Unicode name should still be populated right before submitting').toHaveValue(UNICODE_NAME);

    // ── STEP 3: Save the record. ────────────────────────────────────────────────
    const createPostPromise = page
      .waitForResponse((r) => r.request().method() === 'POST' && /ComponentType/i.test(r.url()), { timeout: 60_000 })
      .catch(() => null);
    await createModal.getByRole('button', { name: /^Create$/ }).click();
    const createPost = await createPostPromise;
    let createdId: string | null = null;
    if (createPost) {
      console.log(`STEP 3 — POST ${createPost.status()} ${createPost.url()}`);
      const body = await createPost.text().catch(() => '');
      console.log(`STEP 3 — response: ${body.slice(0, 800)}`);
      expect(createPost.status(), 'STEP 3 EXPECTED: the record persists (save succeeds)').toBeLessThan(400);
      try { createdId = JSON.parse(body)?.result?.id ?? null; } catch { /* not JSON */ }
    } else {
      console.log('STEP 3 — no matching POST observed (checking outcome via the grid/API instead)');
    }
    await expect(createModal, 'modal should close on successful save').toBeHidden({ timeout: 90_000 });
    await expect(page.locator('.ant-spin-spinning')).toHaveCount(0, { timeout: SLOW });
    console.log(`STEP 3 — Component Type created (id ${createdId})`);

    // STEP 3 EXPECTED (b): reload and confirm the special characters render without mojibake. The grid
    // paginates at 10/page, so search for it by name rather than assuming page 1.
    await page.reload({ waitUntil: 'domcontentloaded' });
    await expect(page.locator('.ant-spin-spinning')).toHaveCount(0, { timeout: SLOW });
    for (let i = 0; i < 30; i++) {
      const rowText = await page.locator('[role="row"]').nth(1).innerText().catch(() => '');
      if (rowText && !/loading/i.test(rowText) && rowText.trim().length > 0) break;
      await page.waitForTimeout(3_000);
    }
    const searchInput = page.locator('.ant-input-search input, .ant-input-affix-wrapper input').first();
    await searchInput.fill(UNICODE_NAME);
    await searchInput.press('Enter');
    await page.waitForTimeout(1_500);
    await expect(page.getByText(UNICODE_NAME, { exact: true }).first(), 'STEP 3 EXPECTED: the Unicode name renders correctly after reload, no mojibake')
      .toBeVisible({ timeout: SLOW });
    console.log('STEP 3 — Unicode name re-rendered correctly after reload');
    await page.screenshot({ path: 'projects/EPM/test-reports/2026-08-13/assets/tc108809-02-after-reload.png', fullPage: true });

    // ── STEP 4: verify byte-for-byte via ComponentType Crud GetAll. ────────────
    const after = ((await (await page.request.get(`${COMPONENT_TYPE_CRUD}/GetAll?maxResultCount=1000`, { timeout: SLOW })).json()).result?.items ?? []) as any[];
    const created = after.find((c) => c.name === UNICODE_NAME);
    expect(created, `Component Type Crud GetAll should contain "${UNICODE_NAME}"`).toBeTruthy();
    console.log(`STEP 4 — persisted Component Type: ${JSON.stringify(created)}`);
    expect(created.name, 'STEP 4 EXPECTED: the stored value equals the entered value, no silent transliteration').toBe(UNICODE_NAME);
    console.log(`DONE — Unicode name accepted, persisted byte-for-byte, and rendered correctly (Component Type id ${created.id}, Type "${TYPE_NAME}")`);
  });
});
