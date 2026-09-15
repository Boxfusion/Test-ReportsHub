import { test, expect } from '@playwright/test';

// ADO TC-109463 (plan 108745, suite 11 · EPM · Progress Reporting Periods configuration tab). Edge:
// toggle skipReportingThisPeriod to true on a period with an active target and Save — expect
// indicatorTarget to clear (null) and poeRequired to reset to false. Confirm via GetAll.
//
// ADO's literal wording targets "Q2" — per the case owner's direction, this uses Q1 instead, since the
// real report used across this suite ("Princess"/"Nomfanelo"/"testsss") only has a Q1 period row (see
// epm-kpi-progress-reporting-periods-tab memory). Continues mutating that same real, already-authorized
// Q1 row (TC-109461/TC-109462 already wrote to it).

const BASE = 'https://pd-epm-adminportal-qa-wf.shesha.app';
const WF_API = 'https://pd-epm-api-qa-wf.shesha.app';

const SLOW = 420_000;
const RAW_CHANNEL = process.env.PW_CHANNEL === undefined ? 'chrome' : process.env.PW_CHANNEL;
const CHANNEL = RAW_CHANNEL === '' || RAW_CHANNEL === 'chromium' ? undefined : RAW_CHANNEL;

test.use({
  channel: CHANNEL,
  viewport: { width: 1920, height: 1080 },
  actionTimeout: 30_000,
  navigationTimeout: 120_000,
});

test.describe('EPM — Progress Reporting Period skip clears fields (ADO plan 108745 / suite 11)', () => {
  test('TC-109463 Edge — toggling skipReportingThisPeriod clears indicatorTarget and resets poeRequired', async ({ page }) => {
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

    const row = page.locator('[role="row"]', { hasText: 'Princess' }).first();
    await expect(row, 'a report matching "Princess" should be visible in the list').toBeVisible({ timeout: SLOW });
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

    const kpiNode = page.locator('.ant-tree-treenode', { hasText: 'Percentage compliance with statutory prescripts' }).locator('visible=true').first();
    await expect(kpiNode, 'the KPI node should be reachable').toBeVisible({ timeout: SLOW });
    await kpiNode.click({ force: true });
    await expect(page.locator('.ant-spin-spinning, .ant-spin-dot-spin')).toHaveCount(0, { timeout: 30_000 }).catch(() => null);
    await page.waitForTimeout(2_000);

    const prpTab = page.locator('.ant-tabs-tab', { hasText: /Progress Reporting Periods/i }).locator('visible=true').first();
    await expect(prpTab, 'a Progress Reporting Periods tab should exist').toBeVisible({ timeout: SLOW });
    await prpTab.click({ force: true });
    await page.waitForTimeout(1_500);

    const q1Row = page.locator('[role="row"]', { hasText: /^Q1/ }).first();
    await expect(q1Row, 'PRECONDITION EXPECTED: Q1 should be visible with an active target').toBeVisible({ timeout: SLOW });
    const rowTextBefore = await q1Row.innerText().catch(() => '');
    console.log(`PRECONDITION ACTUAL — Q1 row before toggle: ${rowTextBefore.replace(/\n+/g, ' | ')}`);

    const editIcon = q1Row.locator('.anticon-edit').first();
    await editIcon.click({ force: true });
    await page.waitForTimeout(1_000);
    const modal = page.locator('.ant-modal').locator('visible=true').first();
    await expect(modal, 'an edit modal should open for Q1').toBeVisible({ timeout: SLOW });

    const indicatorTargetFormItem = modal.locator('.ant-form-item').filter({ hasText: /^Indicator Target\s*$/i }).first();
    const indicatorTargetBefore = await indicatorTargetFormItem.locator('input.ant-input-number-input').first().inputValue().catch(() => '(unknown)');
    const poeFormItem = modal.locator('.ant-form-item').filter({ hasText: /Poe Required/i }).first();
    const poeCheckboxBefore = await poeFormItem.locator('input.ant-checkbox-input').first().isChecked().catch(() => null);
    console.log(`PRECONDITION ACTUAL — Indicator Target before: ${indicatorTargetBefore}, Poe Required before: ${poeCheckboxBefore}.`);

    // STEP 1 (ADO): Toggle skipReportingThisPeriod true on Q1 and Save.
    const skipFormItem = modal.locator('.ant-form-item').filter({ hasText: /^Skip Reporting This Period/i }).first();
    const skipCheckbox = skipFormItem.locator('input.ant-checkbox-input').first();
    const skipIsChecked = await skipCheckbox.isChecked().catch(() => false);
    if (!skipIsChecked) await skipCheckbox.click({ force: true });
    await page.waitForTimeout(500);

    // Confirmed live: checking Skip Reporting This Period makes "Skip Reason" required (min 20
    // characters) — the modal silently refuses to close/submit without it.
    const skipReasonFormItem = modal.locator('.ant-form-item').filter({ hasText: /^Skip Reason/i }).first();
    const skipReasonVisible = await skipReasonFormItem.isVisible().catch(() => false);
    if (skipReasonVisible) {
      const skipReasonInput = skipReasonFormItem.locator('textarea').first();
      await skipReasonInput.fill('Skipping this period for test coverage purposes (TC-109463).');
      await page.waitForTimeout(500);
    }

    const okBtn = modal.locator('.ant-btn, button').filter({ hasText: /^OK$/ }).first();
    await okBtn.click({ force: true });
    await page.waitForTimeout(1_500);

    const outerSavePromise = page
      .waitForResponse((r) => r.request().method() !== 'GET' && /Component/i.test(r.url()), { timeout: 60_000 })
      .catch(() => null);
    const outerSaveBtn = page.locator('.ant-btn, button').filter({ hasText: /^Save$/ }).first();
    await outerSaveBtn.click({ force: true });
    const outerSaveResp = await outerSavePromise;
    console.log(`STEP 1 ACTUAL — outer Save request: ${outerSaveResp ? `${outerSaveResp.status()} ${outerSaveResp.url()}` : '(no response observed)'}.`);
    expect(outerSaveResp, 'STEP 1 EXPECTED: the outer Save should send a request').toBeTruthy();
    expect(outerSaveResp!.status(), 'STEP 1 EXPECTED: the outer Save should succeed').toBeLessThan(400);
    const saveBody = await outerSaveResp!.json().catch(() => null);
    const kpiComponentId: string | null = saveBody?.result?.id ?? null;
    console.log(`STEP 1 ACTUAL — KPI Component id: ${kpiComponentId}.`);
    await page.waitForTimeout(1_500);

    // STEP 2 (ADO): Confirm via GetAll.
    const cprResp = await (await page.request.get(`${WF_API}/api/dynamic/Epm/ComponentProgressReport/Crud/GetAll?maxResultCount=2000`, { headers: auth })).json();
    const cprItems = cprResp?.result?.items ?? cprResp?.result ?? [];
    const q1CprRow = cprItems.find((r: any) => r?.component?.id === kpiComponentId);
    console.log(`STEP 2 ACTUAL — full Q1 row after toggle: ${JSON.stringify(q1CprRow)}`);

    expect(q1CprRow?.skipReportingThisPeriod, 'STEP 2 EXPECTED: skipReportingThisPeriod should persist as true').toBe(true);
    expect.soft(q1CprRow?.indicatorTarget, 'STEP 2 EXPECTED (per ADO): indicatorTarget should clear to null once skip is toggled true — CONFIRMED DEFECT if not null: the field was not auto-cleared').toBeNull();
    expect.soft(q1CprRow?.poeRequired, 'STEP 2 EXPECTED (per ADO): poeRequired should reset to false once skip is toggled true — CONFIRMED DEFECT if not false: the field was not auto-reset').toBe(false);

    console.log(`STEP 2 ACTUAL — workflow-related fields: workflowComponentProgressReportStatus=${q1CprRow?.workflowComponentProgressReportStatus}, isWorkflow=${q1CprRow?.isWorkflow}, currentQALevel=${q1CprRow?.currentQALevel}.`);
  });
});
