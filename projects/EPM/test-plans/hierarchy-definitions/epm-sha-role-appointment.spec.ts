import { test, expect } from '@playwright/test';

// ADO TC-108785 (plan 108745, suite 109512 · EPM/Shesha · Appoint a top-level Sha Role to the final
// approver Person via User Management). Positive: the engagement has decided to grant an additional
// Sha Role to the top Component Actioner Person. Navigate Administration → User Management, open the
// final approver's Person record, use Assign Role to grant the engagement's top-level role, and verify
// exactly one row ties the Person to that role via ShaRoleAppointedPerson/Crud/GetAll.
//
// Confirmed live 2026-08-18:
// - Stage 1-6 Persons all exist, but the live ComponentActioner chain in THIS tenant only ever goes
//   up to Stage 5 in real usage (TC-108784's own precondition confirms exactly 5 real actioners —
//   Stage 1-5 — assigned to a live KPI). "Stage 6 SPMR Director" exists as a Person/User but has
//   never been a live ComponentActioner outside this session's own disposable TC-108826/827/828
//   test rows (always cleaned up afterward) — so it is NOT genuinely "the top Component Actioner
//   Person" this case's precondition describes. The real final approver is "Stage 5 SPMR Unit"
//   (id 0edbbf9b-...).
// - Confirmed separately, first run against Stage 6: Stage 6 SPMR Director already had a
//   pre-existing "SPMR Director" ShaRoleAppointedPerson row (created 2026-08-11). Re-running the
//   live "Assign Role" UI action to grant that SAME role again succeeded silently (no confirmation
//   toast ever appeared) and created a genuine SECOND identical row — a real duplicate-appointment
//   defect, documented separately (see epm-sha-role-duplicate-appointment memory). That extra row
//   was cleaned up; the original pre-existing row was left untouched.
// - The ShaRole catalogue has exactly 5 roles: "SPMR Director", "EPM Users", "System Administrator",
//   "Monitoring and Evaluation", "Auditor". "SPMR Director" ("Strategic Performance Monitoring and
//   Reporting Director") is this engagement's real top-level role.
// - Real navigation: Administration → User Management → `/dynamic/shesha/users` (a Shesha System
//   User list, 14 rows, 2 pages) → the row's search icon opens `/dynamic/Shesha/user-details?id=...`.
//   That page has an "Assigned Roles" grid with a real "Assign Role" action, opening a
//   `Shesha/user-add-to-role` modal with a single Role select + Cancel/OK.

const BASE = 'https://pd-epm-adminportal-qa-wf.shesha.app';
const WF_API = 'https://pd-epm-api-qa-wf.shesha.app';
const STAGE5_PERSON_ID = '0edbbf9b-af4a-48e6-aa23-c771c5b678b6'; // "Stage 5 SPMR Unit" — the genuinely-live final approver in this tenant's real 5-stage actioner chain
const SPMR_DIRECTOR_ROLE_ID = '5c07cd31-1ab8-4028-b897-e7e1c06c14d4'; // this engagement's top-level Sha Role

const SLOW = 420_000;
const RAW_CHANNEL = process.env.PW_CHANNEL === undefined ? 'chrome' : process.env.PW_CHANNEL;
const CHANNEL = RAW_CHANNEL === '' || RAW_CHANNEL === 'chromium' ? undefined : RAW_CHANNEL;

test.use({
  channel: CHANNEL,
  actionTimeout: 30_000,
  navigationTimeout: 120_000,
});

test.describe('EPM/Shesha — Sha Role appointment (ADO plan 108745 / suite 109512)', () => {
  test('TC-108785 Positive — appoint the top-level Sha Role to the final approver Person', async ({ page }) => {
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

    // PRECONDITION (ADO): the engagement's top-level role already exists in the Sha Role catalogue.
    const roleGetResp = await page.request.get(`${WF_API}/api/dynamic/Shesha/ShaRole/Crud/Get?id=${SPMR_DIRECTOR_ROLE_ID}`, { headers: auth });
    const roleGetBody = await roleGetResp.json().catch(() => null);
    console.log(`PRECONDITION ACTUAL — "SPMR Director" role exists: ${roleGetResp.status()}, name=${roleGetBody?.result?.name}.`);
    expect(roleGetBody?.result?.name, 'PRECONDITION EXPECTED: the engagement\'s top-level role should already exist in the Sha Role catalogue').toBe('SPMR Director');

    const rapBefore = await (await page.request.get(`${WF_API}/api/dynamic/Shesha/ShaRoleAppointedPerson/Crud/GetAll?maxResultCount=2000`, { headers: auth })).json();
    const rapItemsBefore = rapBefore?.result?.items ?? [];
    const priorRows = rapItemsBefore.filter((r: any) => r?.person?.id === STAGE5_PERSON_ID && r?.role?.id === SPMR_DIRECTOR_ROLE_ID);
    console.log(`PRECONDITION ACTUAL — pre-existing ShaRoleAppointedPerson rows for Stage 5 + SPMR Director: ${priorRows.length}.`);
    const priorRowIds = new Set(priorRows.map((r: any) => r.id));

    // STEP 1 (ADO): Navigate to User Management via sidebar → Administration → User Management.
    await page.goto(`${BASE}/`, { waitUntil: 'domcontentloaded' });
    await page.getByText('Administration', { exact: true }).first().click();
    await page.getByText('User Management', { exact: true }).first().click();
    await expect(page).toHaveURL(/\/dynamic\/shesha\/users/, { timeout: SLOW });
    await expect(page.getByText('All System Users', { exact: true })).toBeVisible({ timeout: SLOW });
    console.log(`STEP 1 ACTUAL — User Management list loaded at ${page.url()}.`);

    // STEP 2 (ADO): Open the final approver Person record (Stage 5 SPMR Unit — the genuinely-live top
    // stage in this tenant's real actioner chain).
    await page.goto(`${BASE}/dynamic/Shesha/user-details?id=${STAGE5_PERSON_ID}`, { waitUntil: 'domcontentloaded' });
    await expect(page.getByText('Details for Stage 5 SPMR Unit', { exact: true })).toBeVisible({ timeout: SLOW });
    const assignRoleButton = page.getByText('Assign Role', { exact: true }).first();
    await expect(assignRoleButton, 'STEP 2 EXPECTED: an Assign Role action should be visible on the Person edit page').toBeVisible({ timeout: SLOW });
    console.log('STEP 2 ACTUAL — Person edit page loaded with Assign Role action visible.');

    // STEP 3 (ADO): Click Assign Role, select the engagement's top-level role, confirm.
    await assignRoleButton.click();
    const modal = page.locator('.ant-modal-content');
    await expect(modal.getByText('Assign Role', { exact: true })).toBeVisible({ timeout: SLOW });
    await modal.locator('.ant-select').first().click();
    await page.locator('.ant-select-dropdown .ant-select-item-option', { hasText: 'SPMR Director' }).first().click();
    await modal.getByRole('button', { name: 'OK' }).click();
    await page.waitForTimeout(3000);
    const toastVisible = await page.locator('.ant-message, .ant-notification').first().isVisible().catch(() => false);
    console.log(`STEP 3 ACTUAL — confirmation toast/notification visible: ${toastVisible}.`);

    try {
      // STEP 4 (ADO): Verify via ShaRoleAppointedPerson/Crud/GetAll filtered by personId that exactly
      // one row ties the Person to the selected role.
      const rapAfter = await (await page.request.get(`${WF_API}/api/dynamic/Shesha/ShaRoleAppointedPerson/Crud/GetAll?maxResultCount=2000`, { headers: auth })).json();
      const rapItemsAfter = rapAfter?.result?.items ?? [];
      const rowsAfter = rapItemsAfter.filter((r: any) => r?.person?.id === STAGE5_PERSON_ID && r?.role?.id === SPMR_DIRECTOR_ROLE_ID);
      console.log(`STEP 4 ACTUAL — ShaRoleAppointedPerson rows for Stage 5 + SPMR Director after Assign Role: ${rowsAfter.length}. Ids: ${JSON.stringify(rowsAfter.map((r: any) => r.id))}`);
      expect(rowsAfter.length, 'STEP 4 EXPECTED (per ADO): exactly one row should tie the Person to the selected role').toBe(1);

      // Cross-check: the finalise workflow should still operate through the Person's existing
      // Component Actioner assignment — the role grant is additive, not a replacement.
      const caResp = await (await page.request.get(`${WF_API}/api/dynamic/Epm/ComponentActioner/Crud/GetAll?maxResultCount=2000`, { headers: auth })).json();
      const caItems = caResp?.result?.items ?? [];
      const stage5ActionerRows = caItems.filter((r: any) => r?.actioner?.id === STAGE5_PERSON_ID);
      console.log(`STEP 4 ACTUAL — ComponentActioner rows still assigned to Stage 5 Person: ${stage5ActionerRows.length}.`);
      expect(stage5ActionerRows.length, 'STEP 4 EXPECTED: the Sha Role grant should be additive — the Person\'s existing ComponentActioner assignment(s) should be unaffected').toBeGreaterThan(0);

      // Cleanup — this Person had no pre-existing SPMR Director appointment, so remove the row this
      // run created entirely rather than leaving disposable test data behind.
      for (const row of rowsAfter) {
        if (!priorRowIds.has(row.id)) {
          const delResp = await page.request.delete(`${WF_API}/api/dynamic/Shesha/ShaRoleAppointedPerson/Crud/Delete?id=${row.id}`, { headers: auth }).catch(() => null);
          console.log(`CLEANUP — removed ShaRoleAppointedPerson ${row.id}: ${delResp ? delResp.status() : 'request failed'}.`);
        }
      }
    } catch (e) {
      // best-effort: still attempt cleanup even if an assertion above threw
      const rapFinal = await (await page.request.get(`${WF_API}/api/dynamic/Shesha/ShaRoleAppointedPerson/Crud/GetAll?maxResultCount=2000`, { headers: auth })).json().catch(() => null);
      const finalRows = (rapFinal?.result?.items ?? []).filter((r: any) => r?.person?.id === STAGE5_PERSON_ID && r?.role?.id === SPMR_DIRECTOR_ROLE_ID);
      for (const row of finalRows) {
        if (!priorRowIds.has(row.id)) {
          await page.request.delete(`${WF_API}/api/dynamic/Shesha/ShaRoleAppointedPerson/Crud/Delete?id=${row.id}`, { headers: auth }).catch(() => null);
        }
      }
      throw e;
    }
  });
});
