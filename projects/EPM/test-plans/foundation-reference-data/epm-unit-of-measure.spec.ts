import { test, expect } from '@playwright/test';

// Derived artefact — the canonical source is epm-unit-of-measure.md, which mirrors ADO suite 109506.
// Edit the .md (and the ADO test case), not this file, except for AI-repair patches.

const BASE = 'https://pd-epm-adminportal-qa-wf.shesha.app';
// Confirmed live 2026-08-18: UnitOfMeasure records created via this UI persist on the -wf API host,
// not -qa (a GetAll against -qa found only 6 items and no match; -wf had 21 including the new record).
// Same recurring host-mismatch pattern as PerformanceReport/Component/ComponentDefinition elsewhere in
// this suite — see epm-performance-report-create-period-cycle-mismatch memory.
const API = 'https://pd-epm-api-qa-wf.shesha.app';

// The ADO case names "Hours" literally, and that is the default here. But the 2026-08-12 run already
// created it (id da2afc7d-52c5-4a4d-8dd6-48582eb485c2), so a re-run against the same QA data hits the
// unique-name constraint — which is the subject of the separate
// epm-unit-of-measure-duplicate-name.md plan (TC-109439), not this one. Override to re-run green:
//   TC_UOM_NAME=Hours-$(date +%s) npx playwright test ...
const DATA = {
  name: process.env.TC_UOM_NAME || 'Hours',
  description: 'Hours unit of measure',
  prefix: 'HRS',
  suffix: 'hrs',
};

// EPM QA cold-starts in ~56s and pins the browser main thread while rendering: the login form took
// >120s to paint on a cold backend and the Unit of Measure grid ~146s. The hub config's 90s test /
// 10s expect / 15s action / 30s navigation defaults are all far too short for this app.
const SLOW = 420_000;

// Browser selection. The hub config's `devices['Desktop Chrome']` sets no channel, so this line is
// what picks the browser. Default is system Chrome; `PW_CHANNEL=chromium` (or an empty value) selects
// Playwright's bundled Chromium, and any other value is passed through as a channel name (e.g. msedge).
// Bundled Chromium needs its matching revision on disk — `npx playwright install chromium` if absent.
const RAW_CHANNEL = process.env.PW_CHANNEL === undefined ? 'chrome' : process.env.PW_CHANNEL;
const CHANNEL = RAW_CHANNEL === '' || RAW_CHANNEL === 'chromium' ? undefined : RAW_CHANNEL;

test.use({
  channel: CHANNEL,
  // Fixed viewport, not `viewport: null` — null conflicts with the deviceScaleFactor that the hub
  // config's `devices['Desktop Chrome']` sets ("deviceScaleFactor option is not supported with null
  // viewport"). 1920x1080 is wide enough for the sidebar flyouts to render inside it.
  viewport: { width: 1920, height: 1080 },
  actionTimeout: 120_000,
  navigationTimeout: 120_000,
});

test.describe('EPM — Unit of Measure management (ADO plan 108745 / suite 109506)', () => {
  test('TC-109437 Create Unit of Measure with Name, Description, Prefix, Suffix (all 3+ chars)', async ({ page }) => {
    test.setTimeout(1_200_000);

    // PRECONDITION: Signed in as administrator.
    await page.goto(`${BASE}/login`, { waitUntil: 'domcontentloaded' });
    await expect(page.locator('input').first()).toBeVisible({ timeout: SLOW });
    await page.locator('input').first().fill('admin.PrincessH');
    await page.locator('input[type="password"]').first().fill('123qwe');
    await page.getByRole('button', { name: /sign in|login/i }).first().click();
    await expect(page).not.toHaveURL(/\/login/, { timeout: SLOW });

    // PRECONDITION: Unit of Measure list at /dynamic/Epm/unit-of-measure.
    // The left rail is icon-only (EPM / Administration / Configurations / Auditor view). Clicking the
    // "EPM" rail item (not hovering — it's a plain menuitem, not an ant-menu submenu) opens a flyout
    // with "Workflow" and "EPM Administration". Hovering "EPM Administration" opens a second-level
    // flyout with the actual module pages, including "Unit of Measures" (plural).
    // `visible=true` matters throughout: rc-menu keeps a second, off-screen copy of each item for the
    // collapsed inline sidebar, and a bare .first() picks that one, which then fails to click/hover.
    const epmItem = page.locator('.ant-menu').getByText('EPM', { exact: true }).locator('visible=true').first();
    await expect(epmItem).toBeVisible({ timeout: SLOW });
    await epmItem.click({ force: true });
    // The flyout animates in (scale transform). Assertions can pass mid-animation while the box is
    // still moving, so let it settle before hovering — otherwise the hover lands nowhere.
    await page.waitForTimeout(2_500);
    const epmAdmin = page.getByText('EPM Administration', { exact: true }).locator('visible=true').first();
    await expect(epmAdmin).toBeVisible({ timeout: 60_000 });
    await epmAdmin.hover({ force: true });
    await page.waitForTimeout(2_500);
    const uomLink = page.getByText('Unit of Measures', { exact: true }).locator('visible=true').first();
    await expect(uomLink).toHaveAttribute('href', '/dynamic/Epm/unit-of-measure');
    await uomLink.click({ force: true });

    // FRAGILE: the accessible name is icon + text, so getByRole('button', { name: /^Add$/ }) does
    // NOT match this button. Filter on text instead.
    const addButton = page.locator('.ant-btn').filter({ hasText: 'Add' }).first();
    await expect(addButton).toBeVisible({ timeout: SLOW });
    await expect(page.locator('.ant-spin-spinning')).toHaveCount(0, { timeout: SLOW });
    await expect(page).toHaveURL(/\/dynamic\/Epm\/unit-of-measure$/);

    // STEP 1: Click + Add and fill Name equals "Hours", Description, Prefix, Suffix (each >= 3 chars).
    await addButton.click();
    const modal = page.locator('.ant-modal-content').first();
    await expect(modal).toBeVisible({ timeout: SLOW });
    await expect(modal.locator('.ant-modal-title')).toHaveText('Add New Unit of Measure');

    // All four are mandatory (labels render as "Name *", "Description *", ...). Description is a
    // <textarea>, the other three are <input type="text">; none carry an id or name attribute, so
    // they are reached through their .ant-form-item label.
    const field = (label: RegExp) =>
      modal
        .locator('.ant-form-item')
        .filter({ has: page.locator('label').filter({ hasText: label }) })
        .locator('input, textarea')
        .first();

    await field(/^Name/i).fill(DATA.name);
    await field(/^Description/i).fill(DATA.description);
    await field(/Prefix/i).fill(DATA.prefix);
    await field(/Suffix/i).fill(DATA.suffix);

    await expect(field(/^Name/i)).toHaveValue(DATA.name);
    await expect(field(/^Description/i)).toHaveValue(DATA.description);
    await expect(field(/Prefix/i)).toHaveValue(DATA.prefix);
    await expect(field(/Suffix/i)).toHaveValue(DATA.suffix);

    // STEP 1 EXPECTED: Modal Create button enabled.
    const createButton = modal.getByRole('button', { name: /^Create$/ });
    await expect(createButton).toBeEnabled();

    // STEP 2: Click Create.
    const createResponse = page.waitForResponse(
      (r) => /UnitOfMeasure\/Crud\/Create/i.test(r.url()) && r.request().method() === 'POST',
      { timeout: SLOW },
    );
    await createButton.click();
    const created = await createResponse;
    expect(created.status(), 'Crud/Create should return 2xx').toBeLessThan(400);
    expect((await created.json()).success).toBe(true);

    // STEP 2 EXPECTED (a): Success toast.
    await expect(page.locator('.ant-message-notice, .ant-notification-notice').first())
      .toContainText(/created successfully/i, { timeout: 60_000 });

    // STEP 2 EXPECTED (b): Row visible in list.
    await expect(modal).toBeHidden({ timeout: 60_000 });
    // NOT asserted against the raw page body: the list is paginated (confirmed live 2026-08-21, "1-10
    // of 25 items") and has no visible search/filter control, so a newly created row is not guaranteed
    // to land on page 1 — scanning `body` text intermittently fails for a genuinely-persisted record
    // that simply isn't on the current page. STEP 3 below (UnitOfMeasure/Crud/GetAll, maxResultCount
    // well above the real row count) is the reliable check for persistence; this step only confirms
    // the toast above and that the modal closed.

    // STEP 3: Verify via UnitOfMeasure Crud GetAll.
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

    const getAll = await page.request.get(
      `${API}/api/dynamic/Epm/UnitOfMeasure/Crud/GetAll?maxResultCount=100`,
      { headers: { Authorization: `Bearer ${token}` }, timeout: SLOW },
    );
    expect(getAll.status()).toBe(200);

    // STEP 3 EXPECTED: Record persists with the 4 fields.
    const payload = await getAll.json();
    const items = payload.result?.items ?? payload.result ?? [];
    const record = items.find((x: any) => x?.name === DATA.name);
    expect(record, `Crud/GetAll should contain a record named "${DATA.name}"`).toBeTruthy();
    expect({
      name: record.name,
      description: record.description,
      unitPrefix: record.unitPrefix,
      unitSuffix: record.unitSuffix,
    }).toEqual({
      name: DATA.name,
      description: DATA.description,
      unitPrefix: DATA.prefix,
      unitSuffix: DATA.suffix,
    });
    expect(record.isDeleted).toBe(false);
  });
});
