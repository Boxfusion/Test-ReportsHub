import { test, expect } from '@playwright/test';

// ADO TC-109462 (plan 108745, suite 11 · EPM · Progress Reporting Periods configuration tab). Negative:
// with the Progress Reporting Periods tab open, enter Budget = -5000 for a period and Save — expect a
// validation error citing a non-negative constraint. Then correct to a positive value and Save — expect
// success.
//
// Reuses the same real report/KPI as TC-109461 ("Princess"/"Nomfanelo"/"testsss", KPI "Percentage
// compliance with statutory prescripts", period Q1) rather than seeding a fresh Department node, which
// is currently blocked by a confirmed live defect (see
// epm-department-refno-search-broken-dangling-componenttype-id memory). This continues to mutate that
// same real Q1 row (already approved for TC-109461) — ends by restoring Budget to a positive value, per
// the case's own step 3.

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

test.describe('EPM — Progress Reporting Periods negative Budget validation (ADO plan 108745 / suite 11)', () => {
  test('TC-109462 Negative — Budget of -5000 should be rejected on Save', async ({ page }) => {
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

    const treeNodes = page.locator('.ant-tree-treenode').locator('visible=true');
    const nodeCount = await treeNodes.count();
    console.log(`Total visible tree nodes after expansion: ${nodeCount}.`);

    let kpiNodeText: string | null = null;
    for (let i = nodeCount - 1; i >= 0; i--) {
      const node = treeNodes.nth(i);
      const label = await node.innerText().catch(() => '');
      await node.click({ force: true }).catch(() => null);
      await expect(page.locator('.ant-spin-spinning, .ant-spin-dot-spin')).toHaveCount(0, { timeout: 30_000 }).catch(() => null);
      await page.waitForTimeout(2_000);
      const tabLabels = await page.locator('.ant-tabs-tab').allInnerTexts().catch(() => []);
      if (tabLabels.some((t) => /Progress Reporting Periods/i.test(t))) {
        kpiNodeText = label;
        console.log(`Found a KPI node: "${label}" (tabs: ${JSON.stringify(tabLabels)}).`);
        break;
      }
    }
    expect(kpiNodeText, 'PRECONDITION EXPECTED: at least one KPI Component should exist in this tree with a Progress Reporting Periods tab').toBeTruthy();

    const prpTab = page.locator('.ant-tabs-tab', { hasText: /Progress Reporting Periods/i }).locator('visible=true').first();
    await expect(prpTab, 'PRECONDITION EXPECTED: a Progress Reporting Periods tab should exist').toBeVisible({ timeout: SLOW });
    await prpTab.click({ force: true });
    await page.waitForTimeout(1_500);

    const periodRows = page.locator('[role="row"]').filter({ hasText: /^Q\d|Quarter \d/ });
    const firstRow = periodRows.first();
    const editIcon = firstRow.locator('.anticon-edit').first();
    await editIcon.click({ force: true });
    await page.waitForTimeout(1_000);
    const modal = page.locator('.ant-modal').locator('visible=true').first();
    await expect(modal, 'an edit modal should open for a period row').toBeVisible({ timeout: SLOW });

    // STEP 1 (ADO): Enter Budget = -5000. EXPECTED: validation error citing a non-negative constraint.
    const budgetFormItem = modal.locator('.ant-form-item').filter({ hasText: /^Budget/i }).first();
    const budgetInput = budgetFormItem.locator('input.ant-input-number-input').first();
    await budgetInput.fill('-5000');
    await page.waitForTimeout(500);

    const okBtn = modal.locator('.ant-btn, button').filter({ hasText: /^OK$/ }).first();
    const modalSavePromise = page
      .waitForResponse((r) => r.request().method() !== 'GET' && /Component/i.test(r.url()), { timeout: 10_000 })
      .catch(() => null);
    await okBtn.click({ force: true });
    await page.waitForTimeout(1_000);

    const validationError = modal.locator('.ant-form-item-explain-error').locator('visible=true').first();
    const validationVisible = await validationError.isVisible().catch(() => false);
    const validationText = validationVisible ? await validationError.innerText().catch(() => '') : '';
    const modalStillOpen = await modal.isVisible().catch(() => false);
    console.log(`STEP 1 ACTUAL — validation error shown in modal: ${validationVisible}${validationVisible ? ` ("${validationText}")` : ''}. Modal still open: ${modalStillOpen}.`);

    let outerSaveRespForNegative: any = null;
    if (!modalStillOpen) {
      // Modal closed (OK accepted the negative value locally) — try the outer Save and see if THAT
      // rejects it instead.
      const outerSavePromise = page
        .waitForResponse((r) => r.request().method() !== 'GET' && /Component/i.test(r.url()), { timeout: 15_000 })
        .catch(() => null);
      const outerSaveBtn = page.locator('.ant-btn, button').filter({ hasText: /^Save$/ }).first();
      await outerSaveBtn.click({ force: true });
      outerSaveRespForNegative = await outerSavePromise;
      console.log(`STEP 1 ACTUAL — outer Save with Budget=-5000: ${outerSaveRespForNegative ? `${outerSaveRespForNegative.status()} ${outerSaveRespForNegative.url()}` : '(no response observed)'}.`);
    }

    const rejectedSomewhere = validationVisible || modalStillOpen || (outerSaveRespForNegative && outerSaveRespForNegative.status() >= 400);
    if (outerSaveRespForNegative && outerSaveRespForNegative.status() < 400) {
      const body = await outerSaveRespForNegative.json().catch(() => null);
      console.log(`STEP 1 ACTUAL — save succeeded despite Budget=-5000. Persisted result: ${JSON.stringify(body?.result?.name ? { id: body.result.id } : body)}.`);
    }
    expect.soft(rejectedSomewhere, 'STEP 1 EXPECTED (per ADO): saving a Budget of -5000 should be rejected with a validation error citing a non-negative constraint — if false, the negative value was accepted and persisted').toBeTruthy();

    // STEP 2 (ADO): Correct to a positive value. EXPECTED: Save succeeds.
    // Re-open the modal (if closed) or reuse it (if still open) to set a valid positive Budget.
    let modalForCorrection = modal;
    const stillOpenNow = await modal.isVisible().catch(() => false);
    if (!stillOpenNow) {
      // Confirmed live: the outer Save deselects the tree node entirely (details panel reverts to
      // "Select an item from the tree") — not just a stale row reference. Re-select the KPI node and
      // re-open the Progress Reporting Periods tab before looking for the row again.
      await page.waitForTimeout(1_500);
      const kpiNodeAgain = page.locator('.ant-tree-treenode', { hasText: kpiNodeText! }).locator('visible=true').first();
      await expect(kpiNodeAgain, 'the KPI node should still be selectable after the outer Save').toBeVisible({ timeout: SLOW });
      await kpiNodeAgain.click({ force: true });
      await expect(page.locator('.ant-spin-spinning, .ant-spin-dot-spin')).toHaveCount(0, { timeout: 30_000 }).catch(() => null);
      await page.waitForTimeout(1_500);
      const prpTabAgain = page.locator('.ant-tabs-tab', { hasText: /Progress Reporting Periods/i }).locator('visible=true').first();
      await expect(prpTabAgain, 'the Progress Reporting Periods tab should still be reachable').toBeVisible({ timeout: SLOW });
      await prpTabAgain.click({ force: true });
      await page.waitForTimeout(1_500);

      const freshPeriodRows = page.locator('[role="row"]').filter({ hasText: /^Q\d|Quarter \d/ });
      const freshFirstRow = freshPeriodRows.first();
      await expect(freshFirstRow, 'the period row should still be visible after the outer Save').toBeVisible({ timeout: SLOW });
      const editIcon2 = freshFirstRow.locator('.anticon-edit').first();
      await editIcon2.click({ force: true });
      await page.waitForTimeout(1_000);
      modalForCorrection = page.locator('.ant-modal').locator('visible=true').first();
      await expect(modalForCorrection, 'a fresh edit modal should open to correct the value').toBeVisible({ timeout: SLOW });
    }
    const budgetFormItem2 = modalForCorrection.locator('.ant-form-item').filter({ hasText: /^Budget/i }).first();
    const budgetInput2 = budgetFormItem2.locator('input.ant-input-number-input').first();
    await budgetInput2.fill('1000');
    const okBtn2 = modalForCorrection.locator('.ant-btn, button').filter({ hasText: /^OK$/ }).first();
    await okBtn2.click({ force: true });
    await page.waitForTimeout(1_500);

    const finalSavePromise = page
      .waitForResponse((r) => r.request().method() !== 'GET' && /Component/i.test(r.url()), { timeout: 60_000 })
      .catch(() => null);
    const finalSaveBtn = page.locator('.ant-btn, button').filter({ hasText: /^Save$/ }).first();
    await finalSaveBtn.click({ force: true });
    const finalSaveResp = await finalSavePromise;
    console.log(`STEP 2 ACTUAL — Save with corrected positive Budget: ${finalSaveResp ? `${finalSaveResp.status()} ${finalSaveResp.url()}` : '(no response observed)'}.`);
    expect(finalSaveResp, 'STEP 2 EXPECTED: saving with a corrected positive Budget should send a request').toBeTruthy();
    expect(finalSaveResp!.status(), 'STEP 2 EXPECTED: saving with a corrected positive Budget should succeed').toBeLessThan(400);
    const finalBody = await finalSaveResp!.json().catch(() => null);
    const kpiComponentId = finalBody?.result?.id ?? null;
    console.log(`STEP 2 ACTUAL — KPI Component id: ${kpiComponentId}.`);

    const cprResp = await (await page.request.get(`${WF_API}/api/dynamic/Epm/ComponentProgressReport/Crud/GetAll?maxResultCount=2000`, { headers: auth })).json();
    const cprItems = cprResp?.result?.items ?? cprResp?.result ?? [];
    const q1Row = cprItems.find((r: any) => r?.component?.id === kpiComponentId);
    console.log(`STEP 2 ACTUAL — persisted expenditureTarget after correction: ${q1Row?.expenditureTarget}.`);
    expect(q1Row?.expenditureTarget, 'STEP 2 EXPECTED: the corrected positive Budget should persist').toBe(1000);
  });
});
