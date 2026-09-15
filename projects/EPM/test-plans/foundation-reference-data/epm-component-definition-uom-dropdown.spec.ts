import { test, expect, type Locator } from '@playwright/test';

// Derived artefact — the canonical source is epm-component-definition-uom-dropdown.md, which mirrors ADO
// test case 109440 in suite 109506. Edit the .md (and the ADO case), not this file, except for AI-repair
// patches.
//
// Self-contained by design: the hub treats each spec as a standalone derived artefact paired 1:1 with
// its plan and repairs it step-by-step, so config is duplicated rather than shared with sibling specs.

const BASE = 'https://pd-epm-adminportal-qa-wf.shesha.app';
const API = 'https://pd-epm-api-qa-wf.shesha.app';

// ADO precondition: 'A Unit of Measure "Percentage" exists'. Seeded below if absent.
const UOM_NAME = process.env.TC_UOM_LOOKUP_NAME || 'Percentage';
const UOM_FIXTURE = {
  name: UOM_NAME,
  description: 'Percentage unit of measure',
  unitPrefix: 'PCT',
  unitSuffix: 'pct',
};

// EPM QA cold-starts in ~56s and pins the browser main thread while rendering. The hub config's 90s
// test / 10s expect / 15s action / 30s navigation defaults are all far too short for this app. Warming
// the API with a single curl beforehand keeps this case near ~30s.
const SLOW = 420_000;

// Browser selection. The hub config's `devices['Desktop Chrome']` sets no channel, so this line is what
// picks the browser. Default is system Chrome; `PW_CHANNEL=chromium` (or an empty value) selects
// Playwright's bundled Chromium; any other value is passed through as a channel name (e.g. msedge).
const RAW_CHANNEL = process.env.PW_CHANNEL === undefined ? 'chrome' : process.env.PW_CHANNEL;
const CHANNEL = RAW_CHANNEL === '' || RAW_CHANNEL === 'chromium' ? undefined : RAW_CHANNEL;

test.use({
  channel: CHANNEL,
  // Fixed viewport, not `viewport: null` — null conflicts with the deviceScaleFactor the hub config's
  // `devices['Desktop Chrome']` sets ("deviceScaleFactor option is not supported with null viewport").
  viewport: { width: 1920, height: 1080 },
  actionTimeout: 120_000,
  navigationTimeout: 120_000,
});

test.describe('EPM — Component Definition / Unit of Measure integration (ADO plan 108745 / suite 109506)', () => {
  test('TC-109440 Unit of Measure appears in Component Definition Calculation Details dropdown', async ({ page }) => {
    test.setTimeout(1_200_000);

    // PRECONDITION: Signed in as administrator.
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
        } catch {
          /* not JSON */
        }
      }
      return null;
    });
    expect(token, 'bearer token recoverable from localStorage').toBeTruthy();

    // PRECONDITION: A Unit of Measure "Percentage" exists. Seed it if missing — fixture setup, not an
    // assertion. QA did not have it on 2026-08-12.
    const listUom = async () => {
      const r = await page.request.get(`${API}/api/dynamic/Epm/UnitOfMeasure/Crud/GetAll?maxResultCount=1000`, {
        headers: { Authorization: `Bearer ${token}` },
        timeout: SLOW,
      });
      expect(r.status()).toBe(200);
      const p = await r.json();
      return p.result?.items ?? p.result ?? [];
    };
    let uoms = await listUom();
    if (!uoms.some((x: any) => x?.name === UOM_NAME)) {
      const seed = await page.request.post(`${API}/api/dynamic/Epm/UnitOfMeasure/Crud/Create`, {
        headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' },
        data: UOM_FIXTURE,
        timeout: SLOW,
      });
      console.log(`PRECONDITION — seeded "${UOM_NAME}" -> HTTP ${seed.status()}`);
      expect(seed.status(), `seeding fixture "${UOM_NAME}" must succeed`).toBeLessThan(400);
      uoms = await listUom();
    } else {
      console.log(`PRECONDITION — "${UOM_NAME}" already existed, not seeded`);
    }
    const fixture = uoms.find((x: any) => x?.name === UOM_NAME);
    expect(fixture, `"${UOM_NAME}" must exist before opening the form`).toBeTruthy();
    console.log(`PRECONDITION ok — "${UOM_NAME}" id=${fixture.id}`);

    // Navigate Epm > Adminstration > Component Definition.
    // A single hover is a race: the flyout only opens once rc-menu has hydrated, and a hover that lands
    // too early is silently swallowed, with no later wait re-triggering it. Hover, check, retry.
    const hoverUntilVisible = async (trigger: Locator, revealed: Locator, label: string) => {
      for (let attempt = 1; attempt <= 6; attempt++) {
        await trigger.hover({ force: true });
        await page.waitForTimeout(2_000);
        if (await revealed.isVisible().catch(() => false)) return;
        console.log(`  ${label}: not open after hover attempt ${attempt}, retrying`);
        await page.mouse.move(1_400, 900);
        await page.waitForTimeout(500);
      }
      throw new Error(`${label} never opened after 6 hover attempts`);
    };

    // The left rail is icon-only; "EPM" is a plain menuitem (click, not hover) that opens a flyout
    // with "Workflow" / "EPM Administration". Hovering "EPM Administration" opens the module's page
    // list, including "Component Definitions". `visible=true` avoids rc-menu's off-screen copy kept
    // for the collapsed inline sidebar.
    const epmItem = page.locator('.ant-menu').getByText('EPM', { exact: true }).locator('visible=true').first();
    const epmAdmin = page.getByText('EPM Administration', { exact: true }).locator('visible=true').first();
    const cdLink = page.locator('a[href="/dynamic/Epm/component-definition-table"]').locator('visible=true').first();

    await expect(epmItem).toBeVisible({ timeout: SLOW });
    await epmItem.click({ force: true });
    await page.waitForTimeout(2_500);
    await hoverUntilVisible(epmAdmin, cdLink, 'EPM Administration flyout');
    await expect(cdLink).toHaveAttribute('href', '/dynamic/Epm/component-definition-table');
    await cdLink.click();

    // FRAGILE: the accessible name is icon + text, so getByRole('button', { name: /^Add$/ }) does NOT
    // match. Filter on text instead.
    const addButton = page.locator('.ant-btn').filter({ hasText: 'Add' }).first();
    await expect(addButton).toBeVisible({ timeout: SLOW });
    await expect(page.locator('.ant-spin-spinning')).toHaveCount(0, { timeout: SLOW });
    await expect(page).toHaveURL(/\/dynamic\/Epm\/component-definition-table$/);

    // STEP 1: Open a Component Definition create form. The Add modal only has Component Definition
    // Details fields (Name/Type/Description) — no Calculation Details/Additional Information sections
    // here at all (confirmed live 2026-08-21; a week earlier the modal reportedly had these inline via
    // collapsible sections — see epm-component-definition-details-view-edit-pattern memory for the
    // paradigm change). The Unit Of Measure dropdown now lives on the record's own details view, in
    // edit mode — so a disposable Component Definition is created first, then opened there, then
    // discarded (Cancel Form Edit, no Save) and deleted, so this case still inspects the dropdown only
    // and does not leave a permanent record behind.
    await addButton.click();
    const modal = page.locator('.ant-modal-content').first();
    await expect(modal).toBeVisible({ timeout: SLOW });
    await expect(modal.locator('.ant-modal-title')).toHaveText('Add New Record');

    const typeSelect = modal.locator('label').filter({ hasText: /^Component Type/i }).first()
      .locator('xpath=following::*[contains(concat(" ", normalize-space(@class), " "), " ant-select ")][1]');
    await typeSelect.click();
    const typeDropdown = page.locator('.ant-select-dropdown').locator('visible=true').first();
    await expect(typeDropdown).toBeVisible({ timeout: 30_000 });
    await typeDropdown.locator('.ant-select-item-option').first().click();
    await page.waitForTimeout(1_000);
    const nameField = modal.locator('label').filter({ hasText: /^Name/i }).first().locator('xpath=following::textarea[1]');
    const disposableName = `TC109440 disposable ${Date.now() % 1000000}`;
    await nameField.fill(disposableName);
    // Description is mandatory on this form (see plan's field list: "Ref No*, Name*, Component Type*,
    // Description*") — omitting it leaves the modal's client-side validation blocking Create, so no
    // POST ever fires and the setup step times out waiting for one.
    const descriptionField = modal.locator('label').filter({ hasText: /^Description/i }).first().locator('xpath=following::textarea[1]');
    await descriptionField.fill('TC-109440 disposable fixture — inspects Unit Of Measure dropdown only');

    const createPostPromise = page
      .waitForResponse((r) => r.request().method() === 'POST' && /ComponentDefinition/i.test(r.url()), { timeout: 60_000 })
      .catch(() => null);
    await modal.getByRole('button', { name: /^Create$/ }).click();
    const createPost = await createPostPromise;
    expect(createPost, 'setup: disposable Component Definition should be created').toBeTruthy();
    const createdId = (await createPost!.json().catch(() => null))?.result?.id ?? null;
    expect(createdId, 'setup: create response should return an id').toBeTruthy();
    await expect(modal).toBeHidden({ timeout: 90_000 });
    console.log(`SETUP — disposable Component Definition created (id ${createdId})`);

    try {
      await page.goto(`${BASE}/dynamic/Epm/component-definition-details-view?id=${createdId}`, { waitUntil: 'domcontentloaded' });
      await page.waitForTimeout(4_000);
      const editBtn = page.locator('.ant-btn').filter({ hasText: /^Edit$/ }).first();
      await expect(editBtn, 'STEP 1: details view should have an Edit button').toBeVisible({ timeout: SLOW });
      await editBtn.click();
      await page.waitForTimeout(2_000);

      // STEP 1 EXPECTED: Calculation Details section is visible.
      const calcSection = page.getByText('Calculation Details', { exact: true }).locator('visible=true').first();
      await expect(calcSection).toBeVisible({ timeout: 60_000 });
      const sections = await page
        .locator('.ant-card-head-title, .ant-collapse-header, h1, h2, h3, h4')
        .evaluateAll((els) => els.filter((e) => (e as HTMLElement).offsetParent !== null).map((e) => (e.textContent || '').trim()).filter(Boolean));
      console.log(`STEP 1 — sections visible: ${JSON.stringify(sections)}`);
      await page.screenshot({
        path: 'projects/EPM/test-reports/2026-08-12/assets/tc440-01-calculation-details.png',
        fullPage: true,
      });

      // The app labels it "Unit Of Measure" (capital Of); the ADO case says "Unit of Measure".
      const uomFormItem = page
        .locator('.ant-form-item')
        .filter({ has: page.locator('label').filter({ hasText: /^Unit\s+Of\s+Measure/i }) })
        .first();
      await expect(uomFormItem).toBeVisible();

      // STEP 2: Open the Unit of Measure dropdown.
      await uomFormItem.locator('.ant-select').first().click();
      // Options render in a portal attached to body — query at page level.
      const openDropdown = page.locator('.ant-select-dropdown').locator('visible=true').first();
      await expect(openDropdown).toBeVisible({ timeout: 60_000 });
      // The panel becomes visible BEFORE its options are populated (the list is fetched), so wait for
      // at least one option before enumerating — otherwise the snapshot is an empty array that reads as
      // "the dropdown was empty" when it simply had not loaded yet.
      const optionItems = openDropdown.locator('.ant-select-item-option');
      await expect(optionItems.first()).toBeVisible({ timeout: 60_000 });
      const options = await optionItems.evaluateAll((els) => els.map((e) => (e.textContent || '').trim()).filter(Boolean));
      console.log(`STEP 2 — dropdown options (${options.length}): ${JSON.stringify(options)}`);

      // The unfiltered list only renders the first page of options (accumulated test fixtures from
      // prior UnitOfMeasure runs now put the QA record count well past that page size), so a target
      // further down the alphabet is not guaranteed to be present without searching. Type into the
      // select's search box to filter down to it, matching how a real user would locate it.
      if (!options.includes(UOM_NAME)) {
        console.log(`STEP 2 — "${UOM_NAME}" not in unfiltered page (${options.length} shown); searching`);
        await uomFormItem.locator('.ant-select-selection-search-input').first().fill(UOM_NAME);
        await expect(optionItems.first()).toBeVisible({ timeout: 60_000 });
      }
      await page.screenshot({
        path: 'projects/EPM/test-reports/2026-08-12/assets/tc440-02-uom-dropdown-open.png',
        fullPage: true,
      });

      // STEP 2 EXPECTED: "Percentage" appears as a selectable option.
      const percentageOption = openDropdown
        .locator('.ant-select-item-option')
        .filter({ hasText: new RegExp(`^${UOM_NAME}$`) })
        .first();
      await expect(percentageOption, `"${UOM_NAME}" should be listed in the Unit Of Measure dropdown`).toBeVisible();
      // "Selectable" — not rendered as a disabled option.
      await expect(percentageOption).not.toHaveClass(/ant-select-item-option-disabled/);
      expect(await percentageOption.getAttribute('aria-disabled')).not.toBe('true');
      console.log(`STEP 2 — "${UOM_NAME}" found and selectable in dropdown`);
    } finally {
      const delResp = await page.request.delete(`${API}/api/dynamic/Epm/ComponentDefinition/Crud/Delete?id=${createdId}`, {
        headers: { Authorization: `Bearer ${token}` },
      }).catch(() => null);
      console.log(`CLEANUP — deleted disposable Component Definition ${createdId}: ${delResp ? delResp.status() : 'request failed'}`);
    }
  });
});
