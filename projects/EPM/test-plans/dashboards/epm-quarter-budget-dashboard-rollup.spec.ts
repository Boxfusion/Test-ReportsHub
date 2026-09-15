import { test, expect } from '@playwright/test';

// ADO TC-109464 (plan 108745, suite "07 · EPM · Progress Reporting Periods configuration tab"). Edge:
// per-quarter Budget (expenditureTarget on the Progress Reporting Periods tab — see
// epm-kpi-progress-reporting-periods-tab memory) should roll up onto the Performance Dashboard.
//
// PRECONDITION CORRECTED 2026-08-30 (per the case owner: "dashboard does exist, but i don't seem to find
// annual budget"). The old finding (epm-performance-dashboard-page-does-not-exist memory) was that NO
// dashboard page exists at all — that's now stale for a DIFFERENT dashboard: the plain "Dashboard" nav
// entry is still inert (lands on workflows-inbox), but a separate "Dashboard Analytics" entry (nested
// under "Dashboard" in the EPM Administration flyout) opens a real, working page —
// "CPR Status Dashboard" at /dynamic/Epm/component-progress-report — with genuine live data (Progress
// Report Status / Achievement Status distributions, a KPI-by-quarter table). This spec targets that real
// page directly rather than re-probing for a page that doesn't exist.

const BASE = 'https://pd-epm-adminportal-qa-wf.shesha.app';

const SLOW = 420_000;
const RAW_CHANNEL = process.env.PW_CHANNEL === undefined ? 'chrome' : process.env.PW_CHANNEL;
const CHANNEL = RAW_CHANNEL === '' || RAW_CHANNEL === 'chromium' ? undefined : RAW_CHANNEL;

test.use({
  channel: CHANNEL,
  viewport: { width: 1920, height: 1080 },
  actionTimeout: 30_000,
  navigationTimeout: 120_000,
});

test.describe('EPM — Quarter Budget dashboard rollup (ADO plan 108745)', () => {
  test('TC-109464 Edge — per-quarter Budget rolls up to the dashboard', async ({ page }) => {
    test.setTimeout(600_000);

    await page.goto(`${BASE}/login`, { waitUntil: 'domcontentloaded' });
    await expect(page.locator('input').first()).toBeVisible({ timeout: SLOW });
    await page.locator('input').first().fill('admin.PrincessH');
    await page.locator('input[type="password"]').first().fill('123qwe');
    await page.getByRole('button', { name: /sign in|login/i }).first().click();
    await expect(page).not.toHaveURL(/\/login/, { timeout: SLOW });

    // PRECONDITION: confirm the real dashboard ("Dashboard Analytics" / CPR Status Dashboard) is
    // reachable at all, correcting the stale "no dashboard exists" assumption.
    await page.goto(`${BASE}/dynamic/Epm/component-progress-report`, { waitUntil: 'domcontentloaded' });
    await expect(page.locator('.ant-spin-spinning')).toHaveCount(0, { timeout: SLOW });
    await page.waitForTimeout(2_000);
    const title = page.getByText('CPR Status Dashboard', { exact: true }).locator('visible=true').first();
    await expect(title, 'PRECONDITION EXPECTED: the real Dashboard Analytics page should load').toBeVisible({ timeout: SLOW });
    console.log('PRECONDITION ACTUAL — "CPR Status Dashboard" (Dashboard Analytics) confirmed reachable and loaded.');

    // Check with no report selected first (the "every quarter" default view).
    const bodyTextDefault = await page.locator('body').innerText().catch(() => '');
    const hasBudgetDefault = /budget/i.test(bodyTextDefault);
    console.log(`ACTUAL — dashboard (no report selected) mentions "Budget" anywhere: ${hasBudgetDefault}.`);

    // STEP 1 (ADO, adapted): select a real report so the dashboard scopes to its quarters/KPIs.
    const reportSelect = page.locator('.ant-select').first();
    await reportSelect.click();
    await page.waitForTimeout(1_000);
    const dropdown = page.locator('.ant-select-dropdown').locator('visible=true').first();
    await expect(dropdown, 'the Performance report dropdown should list options').toBeVisible({ timeout: 30_000 });
    const firstOption = dropdown.locator('.ant-select-item-option').first();
    await expect(firstOption, 'at least one report option should exist').toBeVisible({ timeout: 15_000 });
    const reportName = await firstOption.innerText().catch(() => '(unknown)');
    await firstOption.click();
    await page.waitForTimeout(2_000);
    await expect(page.locator('.ant-spin-spinning')).toHaveCount(0, { timeout: SLOW });
    await page.waitForTimeout(1_500);
    console.log(`STEP 1 ACTUAL — selected report "${reportName}"; dashboard tiles updated.`);

    // STEP 2 (ADO): confirm a per-quarter Budget figure rolls up somewhere on the dashboard (a tile,
    // a table column, an "Annual Budget" summary — any Budget-related content at all).
    const bodyTextAfter = await page.locator('body').innerText().catch(() => '');
    const hasBudget = /budget/i.test(bodyTextAfter);
    const hasAnnual = /annual/i.test(bodyTextAfter);
    console.log(`STEP 2 ACTUAL — dashboard (report "${reportName}" selected) mentions "Budget": ${hasBudget}; mentions "Annual": ${hasAnnual}.`);
    console.log(`STEP 2 ACTUAL — full dashboard text: ${bodyTextAfter.replace(/\s+/g, ' ').slice(0, 2000)}`);
    expect(hasBudget || hasAnnual, 'STEP 2 EXPECTED (per ADO): a per-quarter Budget figure should roll up somewhere on the dashboard (a tile, column, or "Annual Budget" summary) — CONFIRMED UNBUILT if absent: this dashboard tracks only Progress Report Status / Achievement Status distributions and a plain KPI-by-quarter status table, with no Budget-related content anywhere').toBeTruthy();
  });
});
