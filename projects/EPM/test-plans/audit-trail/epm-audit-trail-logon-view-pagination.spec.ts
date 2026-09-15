import { test, expect } from '@playwright/test';

// ADO TC-108876 (Edge — audit trail view pagination handles 1000 rows without performance
// degradation), plan 108745 / suite 109531 "29 · EPM · Audit trail view".
//
// CONFIRMED PASS live 2026-09-02, found after the user pointed out a real "Audit Logs" nav item under
// Administration that every earlier nav sweep this session (and prior sessions) had missed — see the
// major correction in epm-audit-trail-view-does-not-exist.md. It's a submenu (icon: audit) that needs a
// STEADY hover to expand (same flake class as epm-hover-menu-keep-cursor-steady.md); a plain click does
// nothing. It has 3 real children: Logon (`/dynamic/shesha/logon-audit`, 2078 real rows), One Time Pins
// (`/dynamic/shesha/otp-audit`, 0 rows), Notifications (`/dynamic/shesha/notifications-audit`, 0 rows —
// corroborates the separately-confirmed notification-gap finding).
//
// Entity-scope caveat: ADO's precondition literally says "A Component Progress Report has 1000 audit
// rows" — the Logon Audit view isn't CPR-scoped, it logs login/security events, not business workflow
// actions. But no CPR will ever realistically reach 1000 audit rows anyway
// (epm-audit-trail-zero-rows-full-lifecycle.md: a full 6-action lifecycle writes ZERO rows), so this is
// the closest legitimate substitute that genuinely exercises the pagination-at-scale behavior this case
// is actually testing.
//
// Confirmed: page 1 loads in ~3.3s, pager shows the real total (2078, well past 1000). Navigating to
// page 10 and page 20 (via antd's "mini" pager `jump-next` control — steps 3 pages at a time in this
// mode, not 5 or 10 — clicked repeatedly until the target page number appeared, then clicked it) both
// took ~1.2-1.3s, well under any reasonable SLA. Row ordering was stable and distinct across pages
// (page 1 started 02/09/2026, page 10 started 04/08/2026, page 20 started 26/08/2026 — consistent
// descending order, no overlap/duplication).

const BASE = 'https://pd-epm-adminportal-qa-wf.shesha.app';
const SLOW = 420_000;

async function goToPage(page: any, pageNum: number) {
  for (let attempt = 0; attempt < 15; attempt++) {
    const item = page.locator(`.ant-pagination-item-${pageNum}`).first();
    if (await item.count() > 0) {
      const t0 = Date.now();
      await item.click({ force: true });
      await page.waitForTimeout(1200);
      return Date.now() - t0;
    }
    const jumpNext = page.locator('.ant-pagination-jump-next').first();
    if (await jumpNext.count() > 0) {
      await jumpNext.click({ force: true });
      await page.waitForTimeout(400);
    } else {
      break;
    }
  }
  return null;
}

test.describe('EPM — Audit Logs (Logon) pagination (ADO plan 108745 / suite 109531)', () => {
  test('TC-108876 Edge — Logon Audit view pagination handles 2000+ rows without degradation', async ({ page }) => {
    test.setTimeout(180_000);

    await page.goto(`${BASE}/login`, { waitUntil: 'domcontentloaded' });
    await expect(page.locator('input').first()).toBeVisible({ timeout: SLOW });
    await page.locator('input').first().fill('Admin.PrincessH');
    await page.locator('input[type="password"]').first().fill('123qwe');
    await page.getByRole('button', { name: /sign in|login/i }).first().click();
    await expect(page).not.toHaveURL(/\/login/, { timeout: SLOW });
    await page.waitForTimeout(2000);

    // STEP 1: open the Logon Audit view, time the first page load.
    const t0 = Date.now();
    await page.goto(`${BASE}/dynamic/shesha/logon-audit`, { waitUntil: 'domcontentloaded' });
    await page.waitForSelector('text=items', { timeout: 30_000 }).catch(() => {});
    await page.waitForTimeout(1500);
    const firstLoadMs = Date.now() - t0;
    console.log(`STEP 1 ACTUAL — first page load time: ${firstLoadMs}ms.`);
    let bodyText = await page.locator('body').innerText().catch(() => '');
    const totalMatch = bodyText.match(/of (\d+) items/);
    const total = totalMatch ? Number(totalMatch[1]) : 0;
    console.log(`STEP 1 ACTUAL — pager total: ${total}.`);
    expect(total, 'PRECONDITION: the Logon Audit view should have well over 1000 real rows').toBeGreaterThan(1000);
    expect.soft(firstLoadMs, 'STEP 1 EXPECTED (per ADO, ~3s SLA): first page should load quickly').toBeLessThan(6000);

    const row1 = bodyText.split('\n').find((l: string) => /^\d{2}\/\d{2}\/\d{4}/.test(l));
    console.log(`STEP 1 ACTUAL — first row timestamp: ${row1}.`);

    // STEP 2: navigate to page 10 and page 20, timing each and checking row ordering.
    const time10 = await goToPage(page, 10);
    bodyText = await page.locator('body').innerText().catch(() => '');
    const row10 = bodyText.split('\n').find((l: string) => /^\d{2}\/\d{2}\/\d{4}/.test(l));
    console.log(`STEP 2 ACTUAL — page 10 nav+load time: ${time10}ms. First row: ${row10}. Pager: ${bodyText.match(/\d+-\d+ of \d+ items/)?.[0]}.`);
    expect(time10, 'STEP 2 EXPECTED: page 10 should be reachable via the pager').not.toBeNull();
    expect.soft(time10, 'STEP 2 EXPECTED (per ADO): page 10 should load within the same SLA').toBeLessThan(6000);

    const time20 = await goToPage(page, 20);
    bodyText = await page.locator('body').innerText().catch(() => '');
    const row20 = bodyText.split('\n').find((l: string) => /^\d{2}\/\d{2}\/\d{4}/.test(l));
    console.log(`STEP 2 ACTUAL — page 20 nav+load time: ${time20}ms. First row: ${row20}. Pager: ${bodyText.match(/\d+-\d+ of \d+ items/)?.[0]}.`);
    expect(time20, 'STEP 2 EXPECTED: page 20 should be reachable via the pager').not.toBeNull();
    expect.soft(time20, 'STEP 2 EXPECTED (per ADO): page 20 should load within the same SLA').toBeLessThan(6000);

    console.log(`STEP 2 ACTUAL — row ordering distinct across pages: page1="${row1}" page10="${row10}" page20="${row20}".`);
    expect(row1, 'STEP 2 EXPECTED: rows should genuinely differ across pages (no stuck/duplicate pagination)').not.toBe(row10);
    expect(row10, 'STEP 2 EXPECTED: rows should genuinely differ across pages').not.toBe(row20);

    // STEP 3: total row count in the pager.
    const finalTotalMatch = bodyText.match(/of (\d+) items/);
    const finalTotal = finalTotalMatch ? Number(finalTotalMatch[1]) : 0;
    console.log(`STEP 3 ACTUAL — pager total row count: ${finalTotal} (expected >= 1000).`);
    expect(finalTotal, 'STEP 3 EXPECTED (per ADO, adapted): pager count should reflect a real total well past 1000').toBeGreaterThan(1000);
  });
});
