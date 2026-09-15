import { test, expect } from '@playwright/test';

// ADO TC-108833 (plan 108745, suite 109512 · EPM/Shesha · Same Person can hold multiple Sha Roles via
// multiple ShaRoleAppointedPerson rows). Edge: precondition — a Person already holds one Sha Role
// (the engagement's top-level workflow role). Appoint an additional role (Internal Audit, i.e. this
// tenant's "Auditor" role) to the same Person; verify two rows exist with distinct roleId values,
// neither rejected as a duplicate; sign in as the Person and confirm both role capabilities are
// honoured (workflow inbox access, and the Auditor-view header option becoming available).
//
// Confirmed live 2026-08-18:
// - "Stage 6 SPMR Director" (id 3b03d9ec-..., login "stage6"/"123qwe" — same shared password as the
//   other seeded stage/admin users) already genuinely holds the "SPMR Director" role in real,
//   pre-existing data (created 2026-08-11) — this IS the case's real precondition, no seeding needed.
// - The header's top-level nav has 4 mode buttons: "EPM", "Administration", "Configurations",
//   "Auditor view". Logged in as stage6 BEFORE any Auditor role grant, "Auditor view" and
//   "Administration" are both absent from the header entirely — confirming they're role-gated, not
//   just always-rendered links.
// - Every logged-in user (regardless of role) lands on `Shesha.Workflow/workflows-inbox` ("Incoming
//   Items") by default — this is the "workflow role's inbox" ADO refers to, and it isn't itself
//   gated by a specific Sha Role (Stage 6 could already see it before any Auditor role was granted).
// - "Auditor view" has no distinct URL of its own (its link has no href — it's a client-side mode
//   toggle, same pattern as the "EPM"/"Administration"/"Configurations" buttons), so the real,
//   literal RBAC check is whether the "Auditor view" button itself becomes visible in the header
//   after the role grant, not a distinct page's content.

const BASE = 'https://pd-epm-adminportal-qa-wf.shesha.app';
const WF_API = 'https://pd-epm-api-qa-wf.shesha.app';
const STAGE6_PERSON_ID = '3b03d9ec-c891-48c4-be57-31489f8c43b7'; // "Stage 6 SPMR Director" — already holds "SPMR Director"
const SPMR_DIRECTOR_ROLE_ID = '5c07cd31-1ab8-4028-b897-e7e1c06c14d4';
const AUDITOR_ROLE_ID = 'dab1ee0b-ffe9-455a-ad6e-487f27df5a06'; // this tenant's "Internal Audit"-equivalent role

const SLOW = 420_000;
const RAW_CHANNEL = process.env.PW_CHANNEL === undefined ? 'chrome' : process.env.PW_CHANNEL;
const CHANNEL = RAW_CHANNEL === '' || RAW_CHANNEL === 'chromium' ? undefined : RAW_CHANNEL;

test.use({
  channel: CHANNEL,
  actionTimeout: 30_000,
  navigationTimeout: 120_000,
});

test.describe('EPM/Shesha — Sha Role multiple appointments (ADO plan 108745 / suite 109512)', () => {
  test('TC-108833 Edge — the same Person should be able to hold multiple Sha Roles', async ({ page, browser }) => {
    test.setTimeout(300_000);

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
    const auth = { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' };

    // PRECONDITION (ADO): the Person already holds one Sha Role.
    const rapBefore = await (await page.request.get(`${WF_API}/api/dynamic/Shesha/ShaRoleAppointedPerson/Crud/GetAll?maxResultCount=2000`, { headers: auth })).json();
    const itemsBefore = rapBefore?.result?.items ?? [];
    const rowsBefore = itemsBefore.filter((r: any) => r?.person?.id === STAGE6_PERSON_ID);
    console.log(`PRECONDITION ACTUAL — Stage 6's existing ShaRoleAppointedPerson rows: ${JSON.stringify(rowsBefore.map((r: any) => r.role?._displayName))}.`);
    expect(rowsBefore.some((r: any) => r?.role?.id === SPMR_DIRECTOR_ROLE_ID), 'PRECONDITION EXPECTED: the Person should already hold the engagement\'s top-level workflow role').toBeTruthy();
    expect(rowsBefore.length, 'PRECONDITION EXPECTED: the Person should already hold at least one role before this test appoints a second').toBeGreaterThanOrEqual(1);
    expect(rowsBefore.some((r: any) => r?.role?.id === AUDITOR_ROLE_ID), 'PRECONDITION EXPECTED: the Person should not already hold the Auditor role this test is about to grant').toBeFalsy();

    let createdId: string | null = null;
    try {
      // STEP 1 (ADO): Appoint an additional role (Internal Audit / this tenant's "Auditor") to the
      // same Person — via the real Administration → User Management → Assign Role UI (same
      // mechanism as TC-108785), not a raw API call.
      await page.goto(`${BASE}/dynamic/Shesha/user-details?id=${STAGE6_PERSON_ID}`, { waitUntil: 'domcontentloaded' });
      await expect(page.getByText('Details for Stage 6 SPMR Director', { exact: true })).toBeVisible({ timeout: SLOW });
      await page.getByText('Assign Role', { exact: true }).first().click();
      const modal = page.locator('.ant-modal-content');
      await expect(modal.getByText('Assign Role', { exact: true })).toBeVisible({ timeout: SLOW });
      await modal.locator('.ant-select').first().click();
      await page.locator('.ant-select-dropdown .ant-select-item-option', { hasText: 'Auditor' }).first().click();
      await modal.getByRole('button', { name: 'OK' }).click();
      await page.waitForTimeout(2000);
      console.log('STEP 1 ACTUAL — used the Assign Role UI to grant the "Auditor" role via User Management.');

      // STEP 2 (ADO): Verify via GetAll filtered by personId — two rows with distinct roleId values.
      const rapAfter = await (await page.request.get(`${WF_API}/api/dynamic/Shesha/ShaRoleAppointedPerson/Crud/GetAll?maxResultCount=2000`, { headers: auth })).json();
      const itemsAfter = rapAfter?.result?.items ?? [];
      const rowsAfter = itemsAfter.filter((r: any) => r?.person?.id === STAGE6_PERSON_ID);
      const distinctRoleIds = new Set(rowsAfter.map((r: any) => r?.role?.id));
      console.log(`STEP 2 ACTUAL — rows for this Person after appointment: ${rowsAfter.length}, distinct role ids: ${distinctRoleIds.size}. Roles: ${JSON.stringify(rowsAfter.map((r: any) => r.role?._displayName))}`);
      expect(rowsAfter.length, 'STEP 2 EXPECTED: exactly one more row should exist for the Person than before the appointment').toBe(rowsBefore.length + 1);
      expect(distinctRoleIds.size, 'STEP 2 EXPECTED: every row should have a distinct roleId value (no duplicate role appointments)').toBe(rowsAfter.length);
      expect(rowsAfter.some((r: any) => r?.role?.id === AUDITOR_ROLE_ID), 'STEP 2 EXPECTED: a row for the newly-granted Auditor role should exist').toBeTruthy();
      const beforeIds = new Set(rowsBefore.map((r: any) => r.id));
      const newRow = rowsAfter.find((r: any) => !beforeIds.has(r.id));
      createdId = newRow?.id ?? null;

      // STEP 3 (ADO): Sign in as the Person and confirm both role capabilities are honoured.
      // MUST use a brand-new, isolated browser context here — reusing the admin `page`'s context
      // (even after navigating to /login within it) previously produced a false "it works" result,
      // because leftover client-side state from the admin session masked the real gap. A genuinely
      // fresh login is what a real user actually experiences.
      const stage6Context = await browser.newContext();
      const stage6Page = await stage6Context.newPage();
      try {
        await stage6Page.goto(`${BASE}/login`, { waitUntil: 'domcontentloaded' });
        await expect(stage6Page.locator('input').first()).toBeVisible({ timeout: SLOW });
        await stage6Page.locator('input').first().fill('stage6');
        await stage6Page.locator('input[type="password"]').first().fill('123qwe');
        await stage6Page.getByRole('button', { name: /sign in|login/i }).first().click();
        await expect(stage6Page).not.toHaveURL(/\/login/, { timeout: SLOW });
        await expect(stage6Page).toHaveURL(/workflows-inbox/, { timeout: SLOW });
        await stage6Page.waitForTimeout(3000);
        console.log(`STEP 3 ACTUAL — signed in as stage6 (fresh, isolated context), landed on workflow inbox: ${stage6Page.url()}.`);

        const auditorViewVisible = await stage6Page.getByText('Auditor view', { exact: true }).first().isVisible().catch(() => false);
        console.log(`STEP 3 ACTUAL — "Auditor view" header option visible after granting the Auditor role: ${auditorViewVisible}.`);
        expect.soft(auditorViewVisible, 'STEP 3 EXPECTED (per ADO): the Internal Audit read-only view should be honoured for this Person — CONFIRMED GAP if not visible: the Auditor role grant does not surface the Auditor-view header option for this user, under a genuinely fresh login').toBeTruthy();
      } finally {
        await stage6Context.close();
      }
    } finally {
      if (createdId) {
        await page.goto(`${BASE}/login`, { waitUntil: 'domcontentloaded' }).catch(() => {});
        await page.locator('input').first().fill('admin.PrincessH').catch(() => {});
        await page.locator('input[type="password"]').first().fill('123qwe').catch(() => {});
        await page.getByRole('button', { name: /sign in|login/i }).first().click().catch(() => {});
        await page.waitForTimeout(2000);
        const cleanupToken = await page.evaluate(() => {
          for (const key of Object.keys(localStorage)) {
            const value = localStorage.getItem(key);
            if (value && /^ey[A-Za-z0-9]/.test(value)) return value;
          }
          return null;
        }).catch(() => null);
        const cleanupAuth = { Authorization: `Bearer ${cleanupToken ?? token}`, 'Content-Type': 'application/json' };
        const delResp = await page.request.delete(`${WF_API}/api/dynamic/Shesha/ShaRoleAppointedPerson/Crud/Delete?id=${createdId}`, { headers: cleanupAuth }).catch(() => null);
        console.log(`CLEANUP — removed ShaRoleAppointedPerson ${createdId}: ${delResp ? delResp.status() : 'request failed'}.`);
      }
    }
  });
});
