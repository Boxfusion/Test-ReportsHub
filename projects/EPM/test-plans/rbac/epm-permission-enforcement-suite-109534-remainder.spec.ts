import { test, expect } from '@playwright/test';

// Remainder of suite 109534 (plan 108745, "30 · Permission enforcement"):
//
// TC-108879 (Edge — every method on ComponentTypesAppService enforces the class-level guard
// regardless of route entry point): answered by extension, not independently re-probed. A
// class-level [AbpAuthorize] attribute applies uniformly to every action in the class by definition —
// since TC-108800 already proved it non-functional for MasterDeleteAllComponentTypesAsync, it is
// non-functional for the whole class. There is no practical way to enumerate "every method" to check
// individually anyway (no Swagger/reflection access — /swagger/v1/swagger.json 500s).
//
// TC-108880 (Integration — revoking Component Type Create from a Role blocks the next Create attempt
// within 60 seconds): the precondition itself is moot. Tested Create directly as JohnDoe (verified
// zero roles, zero permissions, zero Sha Role appointments) with NO role ever granting Create
// permission in the first place — and it succeeded anyway (200, real record created, cleaned up
// after). Since Create was never gated by the permission system at all, a revoke-then-retry sequence
// cannot meaningfully "take effect" — there's nothing to revoke that was ever being checked. Same root
// cause as TC-108800 and TC-108878, third confirmed instance.

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
      try {
        const parsed = JSON.parse(value);
        if (parsed && typeof parsed.accessToken === 'string') return parsed.accessToken;
      } catch { /* not JSON */ }
    }
    return null;
  });
  return { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' };
}

test.describe('EPM — Permission enforcement suite 109534 remainder (ADO plan 108745)', () => {
  test('TC-108880 Integration — Create was never permission-gated, so revoke-propagation cannot apply', async ({ page }) => {
    test.setTimeout(120_000);
    const johnAuth = await loginAndGetAuth(page, 'JohnDoe', '123qwe');

    const createResp = await page.request.post(`${WF_API}/api/dynamic/Epm/ComponentType/Crud/Create`, { headers: johnAuth, data: { name: `JOHNDOE-CREATE-TEST-108880-${Date.now() % 100000}`, isFolder: false } });
    const createBody = await createResp.json().catch(() => null);
    console.log(`TC-108880 ACTUAL — Create as zero-permission JohnDoe: status=${createResp.status()}, id=${createBody?.result?.id} (ADO's precondition assumes this requires a Role grant).`);
    expect.soft(createResp.status(), 'TC-108880 EXPECTED (per ADO precondition): Create should require a Role-granted permission — CONFIRMED DEFECT (same root cause as TC-108800/TC-108878): a zero-permission user can Create without ever holding any grant, so a revoke-then-retry test cannot meaningfully verify propagation').toBe(403);

    if (createBody?.result?.id) {
      const adminAuth = await loginAndGetAuth(page, 'admin.PrincessH', '123qwe');
      const delResp = await page.request.delete(`${WF_API}/api/dynamic/Epm/ComponentType/Crud/Delete?id=${createBody.result.id}`, { headers: adminAuth, failOnStatusCode: false });
      console.log(`CLEANUP — deleted test-created ComponentType, status=${delResp.status()}.`);
    }
  });
});
