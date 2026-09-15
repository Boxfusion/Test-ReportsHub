import { test, expect } from '@playwright/test';

// ADO TC-108876 (Edge — 1000-row pagination) and TC-108877 (Integration — Export to Excel), both
// plan 108745 / suite 109531. Both preconditions ("Audit trail view has 1000/50 rows", "Open the
// audit trail view", "Click Export to Excel") depend on the same dedicated Audit Trail UI page
// confirmed absent in TC-108799 (see epm-audit-trail-view-does-not-exist memory) — there is no page
// to paginate and no Export button to click anywhere in the app.
//
// TC-108876 additionally requires seeding 1000 audit rows against a single ComponentProgressReport.
// The largest real per-CPR count found across this session's investigation was 5 (the TC-108799
// fixture); the tenant-wide EpmAuditedEntityEvent table itself only has ~567 rows total (all CPRs
// combined) as of 2026-08-19 — nowhere near 1000 on one entity, and there is no write-access path to
// synthesize that volume (see epm-qa-credentials-and-ado-pat-scope: PATs are read-only by design).
//
// Both documented as blocked rather than re-investigated, per the established plan-wide pattern for
// cases that share an already-confirmed root cause.
//
// RE-CONFIRMED live 2026-09-02, both blockers still hold — AS OF THAT CHECK. Tenant-wide
// EpmAuditedEntityEvent total is now 683 (up from ~567 on 2026-08-19) — still nowhere near 1000 on a
// single CPR. Also checked the "Auditor view" top-nav item specifically (never opened before): clicking
// it does nothing (stays on workflows-inbox) but reveals a flyout with "Dashboard Items", "View
// Performance reports", "User management" — none of which is an audit trail view. And TC-108874
// (epm-audit-trail-zero-rows-full-lifecycle.md) proves a full 6-action Stage1->6 lifecycle writes ZERO
// audit rows — the path to 1000 rows on one CPR doesn't exist through any known mechanism.
//
// SUPERSEDED for TC-108876 AND TC-108877 LATER THE SAME DAY: the user pointed out a real "Audit Logs"
// nav item under Administration that was missed by every nav sweep above (needs steady hover, not a
// plain click — same flake class as epm-hover-menu-keep-cursor-steady). Its "Logon" child has 2079 real
// rows with working pagination AND a working Export button. Both TC-108876 and TC-108877 were re-tested
// against it and now PASS — see their own dedicated files: epm-audit-trail-logon-view-pagination.spec.ts
// (108876) and epm-audit-trail-logon-view-export.spec.ts (108877). This file's own test below (both
// cases "blocked") is now stale for both — kept for historical record of the investigation that led to
// finding the real view.

const BASE = 'https://pd-epm-adminportal-qa-wf.shesha.app';
const WF_API = 'https://pd-epm-api-qa-wf.shesha.app';

const SLOW = 420_000;

test.describe('EPM — Audit trail pagination & export (ADO plan 108745 / suite 109531)', () => {
  test('TC-108876 / TC-108877 — both blocked: no Audit Trail UI page exists to paginate or export', async ({ page }) => {
    test.setTimeout(180_000);

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

    // Re-confirm tenant-wide audit row volume is nowhere near TC-108876's 1000-row precondition.
    const aeResp = await (await page.request.get(`${WF_API}/api/dynamic/Epm/EpmAuditedEntityEvent/Crud/GetAll?maxResultCount=1`, { headers: auth })).json();
    const totalCount = aeResp?.result?.totalCount;
    console.log(`PRECONDITION ACTUAL — tenant-wide EpmAuditedEntityEvent row count: ${totalCount}. TC-108876 needs 1000 on a single CPR.`);
    expect.soft(totalCount, 'TC-108876 EXPECTED (per ADO): a single CPR should have 1000 audit rows available to page through — BLOCKED: no write-access path exists to seed this volume, and tenant-wide total is far below it').toBeGreaterThanOrEqual(1000);

    // STEP (TC-108876/108877 shared root cause): no dedicated Audit Trail view page exists to open,
    // paginate, or export from — confirmed via the full EPM Administration nav sweep in TC-108799.
    await page.goto(`${BASE}/`, { waitUntil: 'domcontentloaded' });
    await page.waitForTimeout(2000);
    const epmItem = page.locator('.ant-menu').getByText('EPM', { exact: true }).locator('visible=true').first();
    await epmItem.click({ force: true });
    await page.waitForTimeout(2500);
    const epmAdmin = page.getByText('EPM Administration', { exact: true }).locator('visible=true').first();
    await epmAdmin.hover({ force: true });
    await page.waitForTimeout(2500);
    const navText = await page.locator('body').innerText().catch(() => '');
    const hasAuditTrailNavItem = /audit trail/i.test(navText);
    console.log(`STEP ACTUAL — "Audit Trail" nav item present anywhere in EPM Administration: ${hasAuditTrailNavItem}.`);
    expect.soft(hasAuditTrailNavItem, 'TC-108876/TC-108877 EXPECTED (per ADO): a dedicated Audit Trail view should exist to open/paginate/export from — CONFIRMED BLOCKED (same root cause as TC-108799): no such page exists anywhere').toBeTruthy();
  });
});
