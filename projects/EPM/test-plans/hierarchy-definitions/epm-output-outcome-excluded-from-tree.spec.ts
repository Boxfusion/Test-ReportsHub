import { test, expect } from '@playwright/test';

// ADO TC-108825 (plan 108745, suite 06 · EPM · Output and Outcome linkage). Integration: the Reporting
// Tree only ever renders Department/Programme/Sub-Programme/KPI nodes — Output and Outcome Components
// (planning-only, no performanceReportId) never appear as tree nodes, are correctly excluded from a
// Component/Crud/GetAll filtered by performanceReport.id, and are instead managed via a dedicated
// tenant-wide list ("Reporting Setup" per ADO's wording — confirmed live to be the "Outputs and
// Outcomes" page, /dynamic/Epm/components, per epm-output-outcome-linkage memory).
//
// Uses the real "Princess" report tree (Department > Programme > Sub-Programme > KPI, already
// includes an Output/Outcome-linked KPI from TC-108782) plus the two real, tenant-wide Output/Outcome
// Components created there.

const BASE = 'https://pd-epm-adminportal-qa-wf.shesha.app';
const WF_API = 'https://pd-epm-api-qa-wf.shesha.app';
const OUTPUT_ID = '2d9c6f0c-d2c7-4de1-9538-3fa66f8974b0'; // "Increase in service delivery reach"
const OUTCOME_ID = '6efeb4a6-a3d3-486c-aa77-00f10f551d8b'; // "Improved public service quality"

const SLOW = 420_000;
const RAW_CHANNEL = process.env.PW_CHANNEL === undefined ? 'chrome' : process.env.PW_CHANNEL;
const CHANNEL = RAW_CHANNEL === '' || RAW_CHANNEL === 'chromium' ? undefined : RAW_CHANNEL;

test.use({
  channel: CHANNEL,
  viewport: { width: 1920, height: 1080 },
  actionTimeout: 30_000,
  navigationTimeout: 120_000,
});

test.describe('EPM — Output/Outcome excluded from Reporting Tree (ADO plan 108745 / suite 06)', () => {
  test('TC-108825 Integration — Reporting Tree filters Output/Outcome out of the visible hierarchy', async ({ page }) => {
    test.setTimeout(600_000);

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
        } catch { /* not JSON */ }
      }
      return null;
    });
    const auth = { Authorization: `Bearer ${token}` };

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

    const row = page.locator('[role="row"]').filter({ has: page.getByText('Princess', { exact: true }) }).first();
    await expect(row, 'the "Princess" report row should be visible').toBeVisible({ timeout: SLOW });
    const detailsLink = row.locator('a[href*="performance-report-details-view"]').first();
    await detailsLink.click({ force: true });
    await expect(page.locator('.ant-spin-spinning')).toHaveCount(0, { timeout: SLOW });
    await page.waitForTimeout(1_500);
    const reportUrl = page.url();
    const reportId = new URL(reportUrl).searchParams.get('id');
    console.log(`PRECONDITION — Princess report id: ${reportId}.`);

    const buildTreeBtn = page.locator('.ant-btn, button, a').filter({ hasText: 'Build Tree' }).first();
    await expect(buildTreeBtn).toBeVisible({ timeout: SLOW });
    for (let attempt = 1; attempt <= 5; attempt++) {
      await buildTreeBtn.click({ force: true });
      const navigated = await page.waitForURL(/performance-report-planning-page/, { timeout: 15_000 }).then(() => true).catch(() => false);
      if (navigated) break;
      if (attempt === 5) throw new Error('Build Tree click never navigated after 5 attempts');
    }
    await expect(page.locator('.ant-spin-spinning')).toHaveCount(0, { timeout: SLOW });
    await page.waitForTimeout(1_500);

    async function expandAllVisibleSwitchers() {
      const switchers = page.locator('.ant-tree-switcher.ant-tree-switcher_close').locator('visible=true');
      let count = await switchers.count();
      let rounds = 0;
      while (count > 0 && rounds < 15) {
        for (let i = 0; i < count; i++) {
          await switchers.nth(0).click({ force: true }).catch(() => null);
          await page.waitForTimeout(400);
        }
        rounds++;
        count = await switchers.count();
      }
    }
    await expandAllVisibleSwitchers();

    // STEP 1 (ADO): Open the Reporting Tree. EXPECTED: only Department/Programme/Sub-Programme/KPI
    // nodes render; the two just-created Output/Outcome Components ("Increase in service delivery
    // reach", "Improved public service quality") should NOT appear as tree nodes, despite one being
    // referenced (via secondaryComponentRef/tertiaryComponentRef, not as a child node) from a KPI in
    // this same tree.
    const treeText = await page.locator('.ant-tree').first().innerText().catch(() => '');
    console.log(`STEP 1 ACTUAL — full tree text: ${treeText.replace(/\n+/g, ' | ')}`);
    expect(treeText, 'STEP 1 EXPECTED: the Output Component name should not appear as a tree node').not.toContain('Increase in service delivery reach');
    expect(treeText, 'STEP 1 EXPECTED: the Outcome Component name should not appear as a tree node').not.toContain('Improved public service quality');

    const treeNodeTexts = await page.locator('.ant-tree-treenode').locator('visible=true').allInnerTexts().catch(() => []);
    console.log(`STEP 1 ACTUAL — individual tree node labels: ${JSON.stringify(treeNodeTexts)}`);

    // STEP 2 (ADO): Filter Component GetAll by performanceReport.id. EXPECTED: only tree Components
    // returned; Output/Outcome absent (their performanceReport is null).
    const compResp = await (await page.request.get(`${WF_API}/api/dynamic/Epm/Component/Crud/GetAll?maxResultCount=2000`, { headers: auth })).json();
    const compItems = compResp?.result?.items ?? compResp?.result ?? [];
    const treeComponents = compItems.filter((c: any) => c?.performanceReport?.id === reportId);
    console.log(`STEP 2 ACTUAL — ${treeComponents.length} Components filtered by performanceReport.id === "${reportId}": ${JSON.stringify(treeComponents.map((c: any) => ({ id: c.id, name: c.name, type: c.componentType?._displayName })))}`);

    const componentTypesInTree = new Set(treeComponents.map((c: any) => c.componentType?._displayName));
    console.log(`STEP 2 ACTUAL — distinct componentType values in this report's filtered Components: ${JSON.stringify([...componentTypesInTree])}`);
    expect(componentTypesInTree.has('Output'), 'STEP 2 EXPECTED: no Output-type Component should be returned when filtering by performanceReport.id').toBe(false);
    expect(componentTypesInTree.has('Outcome'), 'STEP 2 EXPECTED: no Outcome-type Component should be returned when filtering by performanceReport.id').toBe(false);

    const outputInFilteredList = treeComponents.find((c: any) => c.id === OUTPUT_ID);
    const outcomeInFilteredList = treeComponents.find((c: any) => c.id === OUTCOME_ID);
    expect(outputInFilteredList, 'STEP 2 EXPECTED: the specific Output Component should be absent from this filtered list').toBeFalsy();
    expect(outcomeInFilteredList, 'STEP 2 EXPECTED: the specific Outcome Component should be absent from this filtered list').toBeFalsy();

    const outputRecord = compItems.find((c: any) => c.id === OUTPUT_ID);
    const outcomeRecord = compItems.find((c: any) => c.id === OUTCOME_ID);
    console.log(`STEP 2 ACTUAL — Output performanceReport: ${JSON.stringify(outputRecord?.performanceReport)}, Outcome performanceReport: ${JSON.stringify(outcomeRecord?.performanceReport)}.`);
    expect(outputRecord?.performanceReport, 'STEP 2 EXPECTED: the Output Component should have a null performanceReport').toBeNull();
    expect(outcomeRecord?.performanceReport, 'STEP 2 EXPECTED: the Outcome Component should have a null performanceReport').toBeNull();

    // STEP 3 (ADO): Confirm the Output-Outcome list under "Reporting Setup" is where these are managed.
    await epmItem.click({ force: true });
    await page.waitForTimeout(2_500);
    await epmAdmin.hover({ force: true });
    await page.waitForTimeout(2_500);
    const flyoutLinks = await page.locator('a').locator('visible=true').allInnerTexts().catch(() => []);
    console.log(`STEP 3 DEBUG — EPM Administration flyout links: ${JSON.stringify(flyoutLinks)}`);
    const outputsLink = page.getByText('Outputs & Outcomes', { exact: true }).locator('visible=true').first();
    await expect(outputsLink, 'an Outputs & Outcomes link should exist in the flyout').toBeVisible({ timeout: 30_000 });
    await outputsLink.click({ force: true });
    await expect(page.locator('.ant-spin-spinning')).toHaveCount(0, { timeout: SLOW });
    await page.waitForTimeout(1_500);

    const pageBodyText = await page.locator('body').innerText().catch(() => '');
    const hasReportingSetupLabel = /Reporting Setup/i.test(pageBodyText);
    console.log(`STEP 3 ACTUAL — landed URL: ${page.url()}. Page contains literal "Reporting Setup" label: ${hasReportingSetupLabel}.`);
    expect.soft(hasReportingSetupLabel, 'STEP 3 EXPECTED (per ADO): the page/section should be literally labelled "Reporting Setup" — CONFIRMED NAMING MISMATCH if false: the real page is titled/linked as "Outputs and Outcomes" / "Outputs & Outcomes" instead').toBeTruthy();

    const totalItemsMatch = pageBodyText.match(/(\d+)-(\d+) of (\d+) items/);
    console.log(`STEP 3 ACTUAL — grid item count text: ${totalItemsMatch ? totalItemsMatch[0] : '(not found)'}.`);
    expect(pageBodyText, 'STEP 3 EXPECTED: this page should list the Output Component tenant-wide').toContain('Increase in service delivery reach');
    expect(pageBodyText, 'STEP 3 EXPECTED: this page should list the Outcome Component tenant-wide').toContain('Improved public service quality');
  });
});
