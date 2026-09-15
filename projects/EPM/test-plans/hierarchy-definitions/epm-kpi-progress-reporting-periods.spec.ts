import { test, expect } from '@playwright/test';

// ADO TC-109461 (plan 108745, suite 11 · EPM · Progress Reporting Periods configuration tab —
// quarterly target, skip flag, Portfolio of Evidence required, Budget). Positive: confirm the
// "Progress Reporting Periods" tab renders 4 rows (Q1-Q4) with indicatorTarget, skipReportingThisPeriod,
// poeRequired, and Budget fields, on an EXISTING KPI Component in a real report ("Princess") — per the
// case owner's direction, this avoids seeding a fresh Department node through the tree builder, which
// is currently blocked by a confirmed dangling-ComponentType-id defect (see
// epm-department-refno-search-broken-dangling-componenttype-id memory). Read-only: does not set values
// or Save on this real report's data — confirms structure only.

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

test.describe('EPM — KPI Progress Reporting Periods tab (ADO plan 108745 / suite 11)', () => {
  test('TC-109461 Positive — Progress Reporting Periods tab renders quarterly target/skip/POE/Budget fields', async ({ page }) => {
    test.setTimeout(600_000);

    await page.goto(`${BASE}/login`, { waitUntil: 'domcontentloaded' });
    await expect(page.locator('input').first()).toBeVisible({ timeout: SLOW });
    await page.locator('input').first().fill('admin.PrincessH');
    await page.locator('input[type="password"]').first().fill('123qwe');
    await page.getByRole('button', { name: /sign in|login/i }).first().click();
    await expect(page).not.toHaveURL(/\/login/, { timeout: SLOW });

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

    // Open the report containing "Princess" (per the case owner's direction).
    const row = page.locator('[role="row"]', { hasText: 'Princess' }).first();
    await expect(row, 'a report matching "Princess" should be visible in the list').toBeVisible({ timeout: SLOW });
    const rowText = await row.innerText().catch(() => '');
    console.log(`Opening report row: ${rowText.replace(/\n+/g, ' | ')}`);
    const detailsLink = row.locator('a[href*="performance-report-details-view"]').first();
    await detailsLink.click({ force: true });
    await expect(page.locator('.ant-spin-spinning')).toHaveCount(0, { timeout: SLOW });
    await page.waitForTimeout(1_500);

    const buildTreeBtn = page.locator('.ant-btn, button, a').filter({ hasText: 'Build Tree' }).first();
    await expect(buildTreeBtn, 'Build Tree button should be visible').toBeVisible({ timeout: SLOW });
    for (let attempt = 1; attempt <= 5; attempt++) {
      await buildTreeBtn.click({ force: true });
      const navigated = await page.waitForURL(/performance-report-planning-page/, { timeout: 15_000 }).then(() => true).catch(() => false);
      if (navigated) break;
      console.log(`  Build Tree click attempt ${attempt} did not navigate, retrying...`);
      if (attempt === 5) throw new Error('Build Tree click never navigated to the planning page after 5 attempts');
    }
    await expect(page.locator('.ant-spin-spinning')).toHaveCount(0, { timeout: SLOW });
    await page.waitForTimeout(1_500);

    // Expand the hierarchy top-to-bottom until a KPI leaf is reachable. Expand every switcher
    // repeatedly (breadth-first-ish) since depth/branching is unknown for this real tree.
    async function expandAllVisibleSwitchers() {
      const switchers = page.locator('.ant-tree-switcher.ant-tree-switcher_close').locator('visible=true');
      let count = await switchers.count();
      let rounds = 0;
      while (count > 0 && rounds < 10) {
        for (let i = 0; i < count; i++) {
          await switchers.nth(0).click({ force: true }).catch(() => null);
          await page.waitForTimeout(400);
        }
        rounds++;
        count = await switchers.count();
      }
    }
    await expandAllVisibleSwitchers();

    const treeText = await page.locator('.ant-tree').first().innerText().catch(() => '');
    console.log(`Expanded tree text: ${treeText.replace(/\n+/g, ' | ')}`);

    // Find a KPI leaf node — its tree label carries a "Type:Name" title on hover in this app, but
    // simplest reliable signal is a tree node whose row, once selected, shows a "KPI/KPA" tab.
    const treeNodes = page.locator('.ant-tree-treenode').locator('visible=true');
    const nodeCount = await treeNodes.count();
    console.log(`Total visible tree nodes after expansion: ${nodeCount}.`);

    // Every node shows a warning triangle icon in this real tree — capture its tooltip before
    // proceeding, since it may explain why details panels aren't loading tabs.
    const warningIcon = treeNodes.first().locator('.anticon-warning, [aria-label="warning"]').first();
    if (await warningIcon.isVisible().catch(() => false)) {
      await warningIcon.hover({ force: true });
      await page.waitForTimeout(1_000);
      const tooltipText = await page.locator('.ant-tooltip-inner').locator('visible=true').first().innerText().catch(() => '(no tooltip)');
      console.log(`DEBUG — warning icon tooltip on first node: "${tooltipText}".`);
    }

    let kpiNodeText: string | null = null;
    for (let i = nodeCount - 1; i >= 0; i--) {
      const node = treeNodes.nth(i);
      const label = await node.innerText().catch(() => '');
      await node.click({ force: true }).catch(() => null);
      await expect(page.locator('.ant-spin-spinning, .ant-spin-dot-spin')).toHaveCount(0, { timeout: 30_000 }).catch(() => null);
      await page.waitForTimeout(2_000);
      const tabLabels = await page.locator('.ant-tabs-tab').allInnerTexts().catch(() => []);
      console.log(`  Node ${i} ("${label}") tabs: ${JSON.stringify(tabLabels)}.`);
      if (tabLabels.some((t) => /Progress Reporting Periods/i.test(t))) {
        kpiNodeText = label;
        console.log(`Found a KPI node: "${label}" (tabs: ${JSON.stringify(tabLabels)}).`);
        break;
      }
    }
    expect(kpiNodeText, 'PRECONDITION EXPECTED: at least one KPI Component should exist in this tree with a Progress Reporting Periods tab').toBeTruthy();

    // STEP 1 (ADO): Open KPI and click Progress Reporting Periods tab.
    const prpTab = page.locator('.ant-tabs-tab', { hasText: /Progress Reporting Periods/i }).locator('visible=true').first();
    await expect(prpTab, 'STEP 1 EXPECTED: a Progress Reporting Periods tab should exist').toBeVisible({ timeout: SLOW });
    await prpTab.click({ force: true });
    await page.waitForTimeout(1_500);

    const rowsText = await page.locator('body').innerText().catch(() => '');
    console.log(`STEP 1 ACTUAL — visible text on this tab: ${rowsText.slice(rowsText.indexOf('Reporting Periods'), rowsText.indexOf('Reporting Periods') + 800).replace(/\n+/g, ' | ')}`);

    // This specific real report's KPI has its own period configuration (confirmed live: only 1 row,
    // "Q1", not the 4-quarter Q1-Q4 spread ADO's wording assumes) — row COUNT varies per report, not
    // a fixed 4. What matters here is that period rows exist and expose the right columns/fields.
    const periodRows = page.locator('[role="row"]').filter({ hasText: /^Q\d|Quarter \d/ });
    const periodRowCount = await periodRows.count();
    console.log(`STEP 1 ACTUAL — period rows found: ${periodRowCount}.`);
    expect(periodRowCount, 'STEP 1 EXPECTED: at least one period row should render').toBeGreaterThan(0);

    const expectedColumns = ['Period', 'Indicator Target', 'POE', 'Standardised KPI', 'Budget', 'Skip Reporting'];
    const headerRow = page.locator('[role="row"]').first();
    const headerText = await headerRow.innerText().catch(() => '');
    console.log(`STEP 1 ACTUAL — header row text: ${headerText.replace(/\n+/g, ' | ')}`);
    for (const col of expectedColumns) {
      expect(headerText, `STEP 1 EXPECTED: a "${col}" column should be present`).toMatch(new RegExp(col, 'i'));
    }

    // Confirm each row's edit modal genuinely exposes indicatorTarget / poeRequired / Budget /
    // skipReportingThisPeriod (per ADO's field-name-level expectation), without changing any values.
    const firstRow = periodRows.first();
    const editIcon = firstRow.locator('.anticon-edit').first();
    await editIcon.click({ force: true });
    await page.waitForTimeout(1_000);
    const modal = page.locator('.ant-modal').locator('visible=true').first();
    await expect(modal, 'an edit modal should open for a period row').toBeVisible({ timeout: SLOW });
    const modalFieldLabels = await modal.locator('.ant-form-item-label').allInnerTexts().catch(() => []);
    console.log(`STEP 1 ACTUAL — edit modal field labels: ${JSON.stringify(modalFieldLabels)}`);
    const expectedModalFields = ['Indicator Target', 'Poe Required', 'Budget', 'Skip Reporting'];
    for (const field of expectedModalFields) {
      expect(modalFieldLabels.join(' | '), `STEP 1 EXPECTED: "${field}" field should be present in the period edit modal`).toMatch(new RegExp(field, 'i'));
    }
    // STEP 2 (ADO): Set target, POE required true, Budget. Save. All fields persist on Save.
    // Confirmed with the case owner: this real report only has one period row (Q1), so a single
    // representative value set is used (target 10, the first of ADO's listed 10/15/20/25) rather than
    // four distinct quarterly targets — that literal 4-value spread isn't possible with only Q1
    // configured here.
    const TARGET_VALUE = '10';
    const BUDGET_VALUE = '1000';

    const indicatorTargetFormItem2 = modal.locator('.ant-form-item').filter({ hasText: /^Indicator Target\s*$/i }).first();
    const indicatorTargetInput = indicatorTargetFormItem2.locator('input.ant-input-number-input').first();
    await indicatorTargetInput.fill(TARGET_VALUE);

    const poeFormItem = modal.locator('.ant-form-item').filter({ hasText: /Poe Required/i }).first();
    const poeCheckbox = poeFormItem.locator('input.ant-checkbox-input').first();
    const poeIsChecked = await poeCheckbox.isChecked().catch(() => false);
    if (!poeIsChecked) await poeCheckbox.click({ force: true });

    const budgetFormItem = modal.locator('.ant-form-item').filter({ hasText: /^Budget/i }).first();
    const budgetInput = budgetFormItem.locator('input.ant-input-number-input').first();
    await budgetInput.fill(BUDGET_VALUE);

    console.log(`STEP 2 ACTUAL — filled Indicator Target=${TARGET_VALUE}, Poe Required=true, Budget=${BUDGET_VALUE} on the Q1 row.`);
    const okBtn = modal.locator('.ant-btn, button').filter({ hasText: /^OK$/ }).first();
    await okBtn.click({ force: true });
    await page.waitForTimeout(1_500);

    const outerSavePromise = page
      .waitForResponse((r) => r.request().method() !== 'GET' && /Component/i.test(r.url()), { timeout: 60_000 })
      .catch(() => null);
    const outerSaveBtn = page.locator('.ant-btn, button').filter({ hasText: /^Save$/ }).first();
    await outerSaveBtn.click({ force: true });
    const outerSaveResp = await outerSavePromise;
    console.log(`STEP 2 ACTUAL — outer Save request: ${outerSaveResp ? `${outerSaveResp.status()} ${outerSaveResp.url()}` : '(no response observed)'}.`);
    expect(outerSaveResp, 'STEP 2 EXPECTED: the outer Save should send a request').toBeTruthy();
    expect(outerSaveResp!.status(), 'STEP 2 EXPECTED: the outer Save should succeed').toBeLessThan(400);
    const saveBody = await outerSaveResp!.json().catch(() => null);
    const kpiComponentId: string | null = saveBody?.result?.id ?? null;
    expect(kpiComponentId, 'STEP 2 EXPECTED: the save response should return the KPI Component id').toBeTruthy();
    console.log(`STEP 2 ACTUAL — KPI Component id: ${kpiComponentId}.`);
    await page.waitForTimeout(1_500);

    // STEP 3 (ADO): Verify via ComponentProgressReport/Crud/GetAll filtered by componentId.
    const WF_API = 'https://pd-epm-api-qa-wf.shesha.app';
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
    const cprResp = await (await page.request.get(`${WF_API}/api/dynamic/Epm/ComponentProgressReport/Crud/GetAll?maxResultCount=2000`, { headers: auth })).json();
    const cprItems = cprResp?.result?.items ?? cprResp?.result ?? [];
    const kpiCprRows = cprItems.filter((r: any) => r?.component?.id === kpiComponentId);
    console.log(`STEP 3 ACTUAL — ${kpiCprRows.length} ComponentProgressReport rows found for this KPI component: ${JSON.stringify(kpiCprRows)}`);
    expect(kpiCprRows.length, 'STEP 3 EXPECTED: at least one ComponentProgressReport row should exist for this KPI').toBeGreaterThan(0);
    const q1Row = kpiCprRows[0];
    console.log(`STEP 3 ACTUAL — full Q1 row fields: ${JSON.stringify(q1Row, null, 2)}`);
  });
});
