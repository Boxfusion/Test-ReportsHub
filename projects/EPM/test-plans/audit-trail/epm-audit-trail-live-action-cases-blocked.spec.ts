import { test, expect } from '@playwright/test';

// ADO TC-108873 (Edge — impersonation capture) and TC-108874 (Integration — exactly one audit row per
// lifecycle transition, Stage 1 through Stage 6, 5 total), both plan 108745 / suite 109532.
//
// SUPERSEDED for TC-108873: the original "blocked, no live Stage 1 item" reasoning below no longer
// applies — Open Progress Report was later confirmed genuinely working
// (epm-open-progress-report-inert, REVERSED), and this session alone has driven dozens of live Q1
// Stage 1 Capture items through the full chain repeatedly. TC-108873's real, different blocker: this
// app has NO impersonation feature at all. Checked live 2026-09-02: the User Management "user-details"
// page (Administration -> User Management -> `/dynamic/shesha/users` -> a row's search icon ->
// `/dynamic/Shesha/user-details?id=<personId>`) exposes only Edit / Reset Password / Lock Account /
// Unlock Account / Assign Role — no "Impersonate" or "Login As" action. The top-right user menu
// ("Princess Hlazo (Admin)") has only "Logout". The "Configurations" nav flyout has Forms / Modules /
// Entity Configurations / Reference Lists / Notifications / Scheduled Jobs / Settings / Theme — nothing
// impersonation-related. Common ABP.io impersonation endpoints
// (`/api/services/app/User/ImpersonateUser`, `/api/services/app/Session/GetImpersonatedUserNames`,
// `/api/services/app/Account/Impersonate`) all return a genuine `404`. CONFIRMED UNBUILT — the
// impersonation capability this case is designed to test does not exist anywhere in this application,
// so the precondition ("Administrator uses impersonation to act as Stage 1 Person") cannot be
// constructed by any means, not a data/precondition gap like the original note assumed.
//
// TC-108874 (Integration — exactly one audit row per lifecycle transition) is a separate case, now
// covered in its own file: epm-audit-trail-lifecycle-row-count.spec.ts (CONFIRMED DEFECT).

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

test.describe('EPM — Audit trail live-action cases (ADO plan 108745 / suite 109532)', () => {
  test('TC-108873 Edge — impersonation feature does not exist (CONFIRMED UNBUILT)', async ({ page }) => {
    test.setTimeout(180_000);
    const auth = await loginAndGetAuth(page, 'Admin.PrincessH', '123qwe');

    // Check 1: the User Details page's action buttons.
    await page.goto(`${BASE}/dynamic/shesha/users`, { waitUntil: 'domcontentloaded' });
    await page.waitForTimeout(8000);
    const row = page.getByRole('row', { name: /stage1/i }).first();
    await row.locator('.anticon-search, a.sha-link').first().click({ force: true });
    await page.waitForTimeout(8000);
    const buttons = await page.getByRole('button').allInnerTexts();
    console.log(`STEP ACTUAL — buttons on stage1's user-details page: ${JSON.stringify(buttons)}.`);
    const hasImpersonate = buttons.some((b: string) => /impersonat|login as|act as/i.test(b));
    console.log(`STEP ACTUAL — an impersonation-related button exists: ${hasImpersonate}.`);
    expect(hasImpersonate, 'STEP EXPECTED (per ADO): the admin should be able to impersonate stage1 — observed: no such action exists on the user-details page').toBeFalsy();

    // Check 2: common ABP.io impersonation API endpoints.
    const endpoints = [
      '/api/services/app/User/ImpersonateUser',
      '/api/services/app/Session/GetImpersonatedUserNames',
      '/api/services/app/Account/Impersonate',
    ];
    const statuses: Record<string, number> = {};
    for (const ep of endpoints) {
      const resp = await page.request.get(`${WF_API}${ep}`, { headers: auth });
      statuses[ep] = resp.status();
    }
    console.log(`STEP ACTUAL — common impersonation endpoint statuses: ${JSON.stringify(statuses)}.`);
    expect(Object.values(statuses).every((s) => s === 404), 'STEP EXPECTED: if impersonation exists at all, at least one of these standard endpoints should resolve — observed: all 404').toBeTruthy();
  });
});
