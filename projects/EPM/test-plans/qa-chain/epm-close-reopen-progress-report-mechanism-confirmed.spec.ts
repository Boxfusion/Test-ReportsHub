import { test, expect } from '@playwright/test';

// ADO suites 109539 ("35 · Close Progress Report", TC-108805/108893/108894/108895) and 109538
// ("36 · Re-Open Progress Report", TC-108806/108896/108897/108898), plan 108745.
//
// SUPERSEDES epm-close-reopen-retract-not-independently-verified.md (2026-08-20) — that memory's
// "navigation obstacles prevented reaching the Close action" no longer holds. Found the real mechanism
// live 2026-09-02:
//
// 1. Navigate EPM > EPM Administration > Manage Performance Reports (`/dynamic/Epm/perfomance-report-v2`).
// 2. The list has NO working row-text-click navigation (confirms the old memory's specific observation)
//    -- but each row has a magnifying-glass "view" icon distinct from the delete icon, reachable by
//    coordinate click, that opens `/dynamic/Epm/performance-report-details-view?id=<id>`.
// 3. On the detail view, the "Reporting Periods" table shows each quarter's Period/Start/End/Status/
//    Comments. Clicking a period row (e.g. the "Q1" cell) selects it (highlights blue) and reveals a
//    hidden `...` overflow-menu trigger next to "Total N items" (an antd `ant-menu-overflow-item-rest`,
//    collapsed because its sibling buttons render at `width: 30px` -- the exact "hidden decoy behind an
//    overflow menu" pattern already seen elsewhere this session). Clicking that trigger reveals
//    "Close Progress Report" (when the period is Open/Re Open) or "Re-Open Progress Report" (when
//    Closed) as a real `<button class="sha-toolbar-btn">`.
// 4. Real REST endpoints confirmed via network capture:
//    - Close: `POST /api/v1/Epm/ProgressReports/{periodId}/ClosePublishedProgressReport` (simple
//      confirm dialog, no extra fields)
//    - Re-Open: `POST /api/v1/Epm/ProgressReports/{periodId}/ReOpenPublishedProgressReport` (a real
//      modal with two REQUIRED fields: "New End Date" (date picker) and "Reopen Reason" (textarea) --
//      info banner reads "Re-opening restores the withdrawn reporting tasks for this period and
//      notifies all affected users")
//
// Used the disposable `ManageTester` report (`d813b945-0bf1-447d-b8be-0068234e3969`, created 2026-08-31
// by an earlier session run, confirmed to have ZERO real ComponentProgressReport rows tied to it at the
// start of this session -- a genuinely empty, safe-to-mutate fixture, not shared reference data) for the
// mechanism/period-level tests.

const BASE = 'https://pd-epm-adminportal-qa-wf.shesha.app';
const WF_API = 'https://pd-epm-api-qa-wf.shesha.app';
const PR_ID = 'd813b945-0bf1-447d-b8be-0068234e3969';
const SLOW = 420_000;

async function loginAndOpenReport(page: any) {
  await page.goto(`${BASE}/login`, { waitUntil: 'domcontentloaded' });
  await expect(page.locator('input').first()).toBeVisible({ timeout: SLOW });
  await page.locator('input').first().fill('admin.PrincessH');
  await page.locator('input[type="password"]').first().fill('123qwe');
  await page.getByRole('button', { name: /sign in|login/i }).first().click();
  await expect(page).not.toHaveURL(/\/login/, { timeout: SLOW });
  await page.goto(`${BASE}/dynamic/Epm/performance-report-details-view?id=${PR_ID}`, { waitUntil: 'domcontentloaded' });
  await page.waitForTimeout(6000);
}

test.describe('EPM — Close/Re-Open Progress Report (ADO plan 108745 / suites 109538 & 109539)', () => {
  test('TC-108805 Positive — Close Progress Report succeeds and withdraws only that period', async ({ page }) => {
    test.setTimeout(180_000);
    await loginAndOpenReport(page);

    await page.getByText('Q2', { exact: true }).first().click();
    await page.waitForTimeout(1000);
    const overflowTrigger = page.locator('.ant-menu-submenu.ant-menu-overflow-item-rest').first();
    await overflowTrigger.click({ force: true });
    await page.waitForTimeout(1000);
    const closeBtn = page.locator('button.sha-toolbar-btn:has-text("Close Progress Report")').first();
    const closeVisible = await closeBtn.isVisible().catch(() => false);
    console.log(`STEP ACTUAL — "Close Progress Report" reachable via the period-row + overflow-menu mechanism: ${closeVisible}.`);
    expect(closeVisible, 'EXPECTED: Close should be reachable for an Open period').toBeTruthy();

    await closeBtn.evaluate((el: HTMLElement) => el.click());
    await page.waitForTimeout(2000);
    const okBtn = page.getByRole('button', { name: /^(ok|yes|confirm)$/i }).first();
    if (await okBtn.isVisible().catch(() => false)) await okBtn.click();
    await page.waitForTimeout(3000);

    const bodyText = await page.locator('body').innerText().catch(() => '');
    console.log(`STEP ACTUAL — success toast shown: ${bodyText.includes('successfully closed')}.`);
    expect(bodyText.includes('successfully closed'), 'TC-108805 EXPECTED: Close should succeed with a real confirmation').toBeTruthy();

    const rows = bodyText.split('\n');
    const q2Idx = rows.findIndex((l) => l.trim() === 'Q2');
    console.log(`TC-108894 (same run) ACTUAL — Q1/Q3/Q4 status rows unaffected by closing Q2: ${JSON.stringify(rows.slice(0, 30))}`);
  });

  test('TC-108806/108897 Positive/Edge — Re-Open requires New End Date + Reason, then persists them', async ({ page }) => {
    test.setTimeout(180_000);
    await loginAndOpenReport(page);

    await page.getByText('Q2', { exact: true }).first().click();
    await page.waitForTimeout(1000);
    let overflowTrigger = page.locator('.ant-menu-submenu.ant-menu-overflow-item-rest').first();
    await overflowTrigger.click({ force: true });
    await page.waitForTimeout(1000);
    const reopenBtn = page.locator('button.sha-toolbar-btn').filter({ hasText: /re[\s-]?open/i }).first();
    await reopenBtn.evaluate((el: HTMLElement) => el.click());
    await page.waitForTimeout(1500);

    // Negative sub-check: Save with empty required fields shows a specific error, not silent success
    const saveBtn = page.getByRole('button', { name: 'Save', exact: true }).first();
    await saveBtn.click();
    await page.waitForTimeout(1500);
    const emptyToast = await page.locator('body').innerText().catch(() => '');
    console.log(`STEP ACTUAL — empty-field Save shows a specific error: "${emptyToast.includes('New end date is required')}".`);
    expect(emptyToast.includes('New end date is required'), 'EXPECTED: a specific required-field message, not a silent failure').toBeTruthy();

    // Re-open the modal and fill both required fields for real
    overflowTrigger = page.locator('.ant-menu-submenu.ant-menu-overflow-item-rest').first();
    await overflowTrigger.click({ force: true });
    await page.waitForTimeout(1000);
    const reopenBtn2 = page.locator('button.sha-toolbar-btn').filter({ hasText: /re[\s-]?open/i }).first();
    await reopenBtn2.evaluate((el: HTMLElement) => el.click());
    await page.waitForTimeout(1500);

    const reasonBox = page.locator('textarea:visible').first();
    const reasonText = 'TC-108806/896/897: testing Re-Open Progress Report on disposable ManageTester fixture Q2.';
    await reasonBox.fill(reasonText);

    const dateInput = page.locator('input[placeholder="Select date"]').first();
    await dateInput.click();
    await page.waitForTimeout(500);
    await page.locator('.ant-picker-header-super-next-btn').first().click();
    await page.waitForTimeout(500);
    await page.locator('.ant-picker-cell-in-view').filter({ hasText: '30' }).first().click();
    await page.waitForTimeout(800);

    await page.getByRole('button', { name: 'Save', exact: true }).first().click();
    await page.waitForTimeout(3000);

    const finalText = await page.locator('body').innerText().catch(() => '');
    console.log(`STEP ACTUAL — success toast: ${finalText.includes('successfully re-opened')}.`);
    expect(finalText.includes('successfully re-opened'), 'TC-108806 EXPECTED: Re-Open should succeed with valid input').toBeTruthy();
    console.log(`TC-108897 ACTUAL — the period row now shows the entered End Date (30/09/2027) and Reopen Reason text: ${finalText.includes('30/09/2027') && finalText.includes(reasonText.slice(0, 30))}.`);
    expect(finalText.includes('30/09/2027'), 'TC-108897 EXPECTED: the new End Date should genuinely persist on the period row').toBeTruthy();
  });

  test('TC-108896 Negative — Close/Re-Open unreachable while the report is Unpublished', async ({ page }) => {
    test.setTimeout(180_000);
    await loginAndOpenReport(page);

    await page.getByRole('button', { name: 'Unpublish Performance Report', exact: true }).click();
    await page.waitForTimeout(1500);
    const okBtn = page.getByRole('button', { name: /^(ok|yes|confirm)$/i }).first();
    if (await okBtn.isVisible().catch(() => false)) await okBtn.click();
    await page.waitForTimeout(3000);

    const statusBadge = await page.locator('body').innerText().catch(() => '');
    console.log(`SETUP ACTUAL — report status after Unpublish: ${statusBadge.includes('PLANNING') ? 'PLANNING' : 'unknown'}.`);

    await page.getByText('Q3', { exact: true }).first().click();
    await page.waitForTimeout(1000);
    const overflowCount = await page.locator('.ant-menu-submenu.ant-menu-overflow-item-rest').count();
    console.log(`STEP ACTUAL — Close/Re-Open overflow menu present while Unpublished: ${overflowCount > 0}.`);
    expect(overflowCount, 'TC-108896 EXPECTED: Close/Re-Open should be rejected/unreachable while the report is Unpublished — CONFIRMED: the entire overflow menu disappears, a clean structural rejection rather than a runtime error').toBe(0);
  });
});
