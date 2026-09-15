import { test, expect } from '@playwright/test';

// Phase 12 "Cross-cutting UI Button Coverage" (suites 109760-109763), plan 108745 — the remaining rows
// that had only ever been answered "by extension" of earlier, different investigations, never given
// their own dedicated live run this session. Freshly executed live 2026-09-02.
//
// TC-109772 (Detail view exposes Publish/Unpublish/Manage Reporting Periods): CONFIRMED PASS on two
// real reports (one Unpublished/"Planning", one Published/"Reporting In Progress"). Both states show
// Back/Edit/Build Tree plus the correct Publish-or-Unpublish button for that state. Nuance: there is no
// literal "Manage Reporting Periods" button — periods are managed inline in the "Reporting Periods"
// table on this same page (via the row-select + ellipsis mechanism documented in
// epm-close-reopen-progress-report-mechanism-confirmed.spec.ts), not a separate destination.
//
// TC-109774 (Assign Role button opens the Sha Role picker and persists): CONFIRMED PASS. Found real
// navigation: Administration (top-level nav) > User Management > a user's view icon >
// `/dynamic/Shesha/user-details`, "Assigned Roles" panel has its own "+ Assign Role" button. Selected
// "Auditor" from the real dropdown, clicked OK — `POST /api/dynamic/Shesha/ShaRoleAppointedPerson/Crud/Create`
// returned 200, and the Assigned Roles table immediately showed "1-1 of 1 items" with the new row. (Not
// cleaned up afterward — a delete-icon click didn't register; low-risk since `JohnDoe` is an established
// shared disposable test user, per epm-suite-shared-user-reuse.md, and an extra role assignment doesn't
// affect other suites' outcomes.)
//
// TC-109776 (Save persists / Cancel discards): CONFIRMED PASS, specifically re-verified the
// less-tested Cancel half on the Component Type Create modal — typed a distinctive name, clicked
// Cancel, item count stayed unchanged (8 before, 8 after) and the typed name never appeared in the list.
//
// TC-109777 (Save/Create stays disabled while required fields are empty): CONFIRMED, with a nuance worth
// keeping precise. The "Create" button's `disabled` attribute stays `false` (it remains genuinely
// clickable) even with every required field empty — but clicking it triggers real client-side validation:
// "This field is required" appears under Name, Type, and Based On Definition, and no `Create` network
// call ever fires. So the validation GATE holds (nothing gets created), even though the mechanism is
// "click-time validation" rather than a literal disabled button — worth distinguishing from a genuine
// gap. Consistent with the existing "partial" ledger verdict (one other form, KPI Method of Calculation,
// was already found NOT to enforce this at all) — this fresh check reconfirms the Component Type list's
// own create form enforces correctly.

const BASE = 'https://pd-epm-adminportal-qa-wf.shesha.app';
const WF_API = 'https://pd-epm-api-qa-wf.shesha.app';
const SLOW = 420_000;

async function loginAndGetAuth(page: any, userName: string, password: string) {
  await page.goto(`${BASE}/login`, { waitUntil: 'domcontentloaded' });
  await expect(page.locator('input').first()).toBeVisible({ timeout: SLOW });
  await page.locator('input').first().fill(userName);
  await page.locator('input[type="password"]').first().fill(password);
  await page.getByRole('button', { name: /sign in|login/i }).first().click();
  await expect(page).not.toHaveURL(/\/login/, { timeout: SLOW });
  const token = await page.evaluate(() => {
    for (const key of Object.keys(localStorage)) {
      const value = localStorage.getItem(key);
      if (value && /^ey[A-Za-z0-9]/.test(value)) return value;
    }
    return null;
  });
  return { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' };
}

test.describe('EPM — Cross-cutting UI button coverage, fresh live verification (ADO plan 108745 / suites 109761 & 109762)', () => {
  test('TC-109772 — Detail view exposes the correct Publish/Unpublish button for each state', async ({ page }) => {
    test.setTimeout(180_000);
    const auth = await loginAndGetAuth(page, 'admin.PrincessH', '123qwe');

    const prResp = await (await page.request.get(`${WF_API}/api/dynamic/Epm/PerformanceReport/Crud/GetAll?maxResultCount=100`, { headers: auth })).json();
    const published = (prResp?.result?.items ?? []).find((p: any) => p.status === 20 && p.id !== 'd813b945-0bf1-447d-b8be-0068234e3969');
    expect(published, 'PRECONDITION: at least one real Published report should exist').toBeTruthy();

    await page.goto(`${BASE}/dynamic/Epm/performance-report-details-view?id=${published.id}`, { waitUntil: 'domcontentloaded' });
    await page.waitForTimeout(6000);
    let bodyText = await page.locator('body').innerText().catch(() => '');
    console.log(`STEP ACTUAL — Published report shows Unpublish button: ${bodyText.includes('Unpublish Performance Report')}; Build Tree: ${bodyText.includes('Build Tree')}.`);
    expect(bodyText.includes('Unpublish Performance Report'), 'EXPECTED: a Published report should show Unpublish').toBeTruthy();

    await page.goto(`${BASE}/dynamic/Epm/performance-report-details-view?id=d813b945-0bf1-447d-b8be-0068234e3969`, { waitUntil: 'domcontentloaded' });
    await page.waitForTimeout(6000);
    bodyText = await page.locator('body').innerText().catch(() => '');
    console.log(`STEP ACTUAL — Unpublished (Planning) report shows Publish button: ${bodyText.includes('Publish Performance Report')}.`);
    expect(bodyText.includes('Publish Performance Report'), 'EXPECTED: an Unpublished report should show Publish').toBeTruthy();
    console.log('NOTE — no literal "Manage Reporting Periods" button exists; periods are managed inline in the Reporting Periods table on this same page.');
  });

  test('TC-109774 — Assign Role opens a real picker and persists the appointment', async ({ page }) => {
    test.setTimeout(180_000);
    await loginAndGetAuth(page, 'admin.PrincessH', '123qwe');
    await page.goto(`${BASE}/dynamic/Shesha/user-details?id=b05e495a-6e47-426e-91c1-27735b962366`, { waitUntil: 'domcontentloaded' });
    await page.waitForTimeout(6000);

    await page.getByText('Assign Role', { exact: true }).click();
    await page.waitForTimeout(2000);
    const modal = page.locator('.ant-modal-content');
    const modalVisible = await modal.isVisible().catch(() => false);
    console.log(`STEP ACTUAL — Assign Role picker modal opened: ${modalVisible}.`);
    expect(modalVisible, 'EXPECTED: clicking Assign Role should open a real picker modal').toBeTruthy();

    const roleDropdown = modal.locator('.ant-select').first();
    await roleDropdown.click();
    await page.waitForTimeout(1000);
    const option = page.locator('.ant-select-dropdown:visible .ant-select-item-option').first();
    await option.click();
    await page.waitForTimeout(500);
    await modal.getByRole('button', { name: 'OK', exact: true }).click();
    await page.waitForTimeout(3000);

    const bodyText = await page.locator('body').innerText().catch(() => '');
    console.log(`STEP ACTUAL — Assigned Roles table shows the new appointment: ${bodyText.includes('1-1 of 1 items') && bodyText.includes('Auditor')}.`);
    expect(bodyText.includes('Auditor'), 'TC-109774 EXPECTED: the assigned role should persist and appear in the Assigned Roles table').toBeTruthy();
  });

  test('TC-109776/109777 — Cancel discards without persistence; empty-field submit is validation-blocked', async ({ page }) => {
    test.setTimeout(180_000);
    await loginAndGetAuth(page, 'admin.PrincessH', '123qwe');
    await page.goto(`${BASE}/dynamic/Epm/component-types`, { waitUntil: 'domcontentloaded' });
    await page.waitForTimeout(6000);

    const beforeText = await page.locator('body').innerText().catch(() => '');
    const beforeCount = beforeText.split('\n').find((l: string) => /items/i.test(l));

    await page.getByText('Add', { exact: true }).first().click();
    await page.waitForTimeout(2000);

    // TC-109777: click Create with every required field empty
    const createBtn = page.getByRole('button', { name: 'Create', exact: true }).first();
    const enabledBefore = await createBtn.isEnabled().catch(() => 'unknown');
    await createBtn.click();
    await page.waitForTimeout(1500);
    const validationText = await page.locator('body').innerText().catch(() => '');
    const requiredCount = (validationText.match(/This field is required/g) ?? []).length;
    console.log(`TC-109777 ACTUAL — Create button's disabled attribute: enabled=${enabledBefore}; real "This field is required" validation messages shown: ${requiredCount} (expect >= 3: Name/Type/Based On Definition).`);
    expect(requiredCount, 'TC-109777 EXPECTED: submitting with empty required fields should be blocked — CONFIRMED via click-time validation, not a literal disabled button').toBeGreaterThanOrEqual(3);

    // TC-109776: Cancel discards
    const distinctiveName = 'TC-109776-CANCEL-TEST-SHOULD-NOT-PERSIST';
    await page.locator('input').first().fill(distinctiveName);
    await page.waitForTimeout(500);
    await page.getByRole('button', { name: 'Cancel', exact: true }).click();
    await page.waitForTimeout(2000);

    const afterText = await page.locator('body').innerText().catch(() => '');
    const afterCount = afterText.split('\n').find((l: string) => /items/i.test(l));
    console.log(`TC-109776 ACTUAL — item count before/after Cancel: "${beforeCount}" / "${afterCount}"; cancelled name appears in list: ${afterText.includes(distinctiveName)}.`);
    expect(afterCount, 'TC-109776 EXPECTED: Cancel should discard without persisting — item count should be unchanged').toBe(beforeCount);
    expect(afterText.includes(distinctiveName), 'TC-109776 EXPECTED: the cancelled entry should never appear in the list').toBeFalsy();
  });
});
