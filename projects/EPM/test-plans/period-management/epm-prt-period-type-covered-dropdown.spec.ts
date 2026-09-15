import { test, expect, type Page } from '@playwright/test';

// Derived artefact — the canonical source is epm-prt-period-type-covered-dropdown.md, which mirrors ADO test
// case 109444 in suite 109505. Edit the .md (and the ADO case), not this file, except for AI-repair patches.
//
// Writes nothing: the case only opens a form and inspects a dropdown, so the option is selected to prove it
// is selectable and the modal is then cancelled.

const BASE = 'https://pd-epm-adminportal-qa-wf.shesha.app';
// Must match BASE's host family — confirmed live 2026-08-27 on the sibling
// epm-period-recursive-hierarchy.spec.ts that the plain -qa host doesn't see records created via the
// -wf UI (same host-mismatch pattern as epm-unit-of-measure-getall-host-mismatch memory).
const API = 'https://pd-epm-api-qa-wf.shesha.app';
const PERIOD_CRUD = `${API}/api/dynamic/Shesha.Enterprise/Period/Crud`;

// Recorded live from the Period form and confirmed against this dropdown.
const PERIOD_TYPES = ['Financial Year', 'MTSF', 'Month', 'Quarter'];
// periodType 1 = Financial Year (observed in existing data and confirmed by TC-109443's enum read-back).
const FY_TYPE = 1;
// Step 2's subject. The field is type-based, so this is the *type* option, not a Period record.
const FY_OPTION = 'Financial Year';

const SLOW = 420_000;
const RAW_CHANNEL = process.env.PW_CHANNEL === undefined ? 'chrome' : process.env.PW_CHANNEL;
const CHANNEL = RAW_CHANNEL === '' || RAW_CHANNEL === 'chromium' ? undefined : RAW_CHANNEL;

test.use({
  channel: CHANNEL,
  viewport: { width: 1920, height: 1080 },
  actionTimeout: 120_000,
  navigationTimeout: 120_000,
});

// Retry the whole path: a click/hover landing before rc-menu hydrates is swallowed, and the flyout
// can close between the visibility check and the hover (antd then unmounts the popup, so a
// long-timeout hover stalls on a detached node). Short per-action timeouts fail fast and re-open.
// The left rail is icon-only; "EPM" is a plain menuitem (click, not hover) that opens a flyout with
// "Workflow" / "EPM Administration". Hovering "EPM Administration" opens the module's page list.
async function openViaEpmAdminstration(page: Page, linkName: string, expectedHref: string) {
  const epm = page.locator('.ant-menu').getByText('EPM', { exact: true }).locator('visible=true').first();
  const admin = page.getByText('EPM Administration', { exact: true }).locator('visible=true').first();
  const link = page.getByRole('link', { name: linkName, exact: true }).locator('visible=true').first();
  for (let attempt = 1; attempt <= 8; attempt++) {
    try {
      await epm.click({ force: true, timeout: 15_000 });
      await page.waitForTimeout(1_500);
      if (!(await admin.isVisible().catch(() => false))) throw new Error('Epm flyout did not open');
      await admin.hover({ force: true, timeout: 15_000 });
      await page.waitForTimeout(1_500);
      if (!(await link.isVisible().catch(() => false))) throw new Error(`"${linkName}" not revealed`);
      await expect(link).toHaveAttribute('href', expectedHref, { timeout: 15_000 });
      await link.click({ timeout: 15_000 });
      return;
    } catch (e: any) {
      console.log(`  nav attempt ${attempt} failed: ${String(e.message).split('\n')[0].slice(0, 80)}`);
      await page.mouse.move(1_400, 900);
      await page.waitForTimeout(1_000);
    }
  }
  throw new Error(`could not reach "${linkName}" via EPM > EPM Administration after 8 attempts`);
}

test.describe('EPM — Period management (ADO plan 108745 / suite 109505)', () => {
  test('TC-109444 Period appears in Performance Report Template Period Type Covered dropdown', async ({ page }) => {
    test.setTimeout(1_200_000);

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

    // PRECONDITION: a Period "Financial Year 2026-27" exists. Asserted in substance — at least one Period
    // of type Financial Year — because this dropdown is type-based, so no record can change its contents.
    // Nothing is seeded; the exact-literal mismatch is reported instead.
    const r = await page.request.get(`${PERIOD_CRUD}/GetAll?maxResultCount=1000`, {
      headers: { Authorization: `Bearer ${token}` },
      timeout: SLOW,
    });
    expect(r.status()).toBe(200);
    const periods = ((await r.json()).result?.items ?? []) as any[];
    const financialYears = periods.filter((p) => p.periodType === FY_TYPE);
    console.log(`PRECONDITION — ${financialYears.length} Financial Year period(s) exist`);
    console.log(`  names: ${JSON.stringify(financialYears.map((p) => p.name).slice(0, 8))}`);
    console.log(`  exact literal "Financial Year 2026-27" present: ${periods.some((p) => p.name === 'Financial Year 2026-27')}`);
    expect(financialYears.length, 'at least one Financial Year Period must exist').toBeGreaterThan(0);

    // ── STEP 1: Open PRT create form. ────────────────────────────────────────
    await openViaEpmAdminstration(page, 'Performance Report Templates', '/dynamic/Epm/perfomance-report-template');
    await expect(page.locator('.ant-btn').filter({ hasText: 'Add' }).first()).toBeVisible({ timeout: SLOW });
    await expect(page.locator('.ant-spin-spinning')).toHaveCount(0, { timeout: SLOW });
    await expect(page).toHaveURL(/\/dynamic\/Epm\/perfomance-report-template$/);

    await page.locator('.ant-btn').filter({ hasText: 'Add' }).first().click();
    const modal = page.locator('.ant-modal-content').first();
    await expect(modal).toBeVisible({ timeout: SLOW });
    await expect(modal.locator('.ant-modal-title')).toHaveText('Add New Template', { timeout: 60_000 });

    const ptcItem = modal
      .locator('.ant-form-item')
      .filter({ has: page.locator('label').filter({ hasText: /Period Type Covered/i }) })
      .first();
    await expect(ptcItem, 'Period Type Covered field should render').toBeVisible({ timeout: 60_000 });
    await page.screenshot({
      path: 'projects/EPM/test-reports/2026-08-12/assets/tc444-01-prt-create-form.png',
      fullPage: true,
    });

    // STEP 1 EXPECTED: Period Type Covered dropdown lists Period Types.
    await ptcItem.locator('.ant-select').first().click();
    const dropdown = page.locator('.ant-select-dropdown').locator('visible=true').first();
    await expect(dropdown).toBeVisible({ timeout: 60_000 });
    // The panel becomes visible before its options populate — wait for the first, or the snapshot is empty.
    const optionItems = dropdown.locator('.ant-select-item-option');
    await expect(optionItems.first()).toBeVisible({ timeout: 60_000 });
    const options = await optionItems.evaluateAll((els) => els.map((e) => (e.textContent || '').trim()).filter(Boolean));
    console.log(`STEP 1 — Period Type Covered options (${options.length}): ${JSON.stringify(options)}`);
    await page.screenshot({
      path: 'projects/EPM/test-reports/2026-08-12/assets/tc444-02-dropdown-open.png',
      fullPage: true,
    });

    // It lists Period Types — exactly the set the Period form's own Period Type selector offers.
    expect([...options].sort(), 'dropdown should list the four Period Types').toEqual([...PERIOD_TYPES].sort());

    // ── STEP 2: Confirm the created Financial Year is selectable. ─────────────
    const fyOption = optionItems.filter({ hasText: new RegExp(`^${FY_OPTION}$`) }).first();
    await expect(fyOption, `"${FY_OPTION}" should be listed`).toBeVisible({ timeout: 60_000 });
    // STEP 2 EXPECTED: Selectable option — listed, not disabled, and it actually selects.
    await expect(fyOption).not.toHaveClass(/ant-select-item-option-disabled/);
    expect(await fyOption.getAttribute('aria-disabled')).not.toBe('true');
    await fyOption.click();
    await expect(ptcItem.locator('.ant-select-selection-item')).toHaveText(FY_OPTION, { timeout: 60_000 });
    console.log(`STEP 2 — selected "${FY_OPTION}" successfully`);
    await page.screenshot({
      path: 'projects/EPM/test-reports/2026-08-12/assets/tc444-03-financial-year-selected.png',
      fullPage: true,
    });

    // Cancel — this case inspects the dropdown only and must not create a template.
    await modal.getByRole('button', { name: /^Cancel$/ }).click();
    await expect(modal).toBeHidden({ timeout: 60_000 });
    console.log('CLEANUP — modal cancelled, no Performance Report Template created');
  });
});
