import { test, expect } from '@playwright/test';

// ADO TC-108872 (plan 108745, suite 109532 · 28 · EPM · Audit trail write path). Negative: precondition
// — signed in as administrator, attempt via direct API POST to EpmAuditedEntityEventRepository. POST
// /api/dynamic/Epm/EpmAuditedEntityEvent/Crud/Create with a fake event not tied to a real workflow
// transition. Endpoint should reject (preferred) — if it accepts, file a Bug (deliberately NOT
// automated per this session's convention: bug filing is left to the user).
//
// Confirmed live 2026-08-19: every direct-insert shape tried was rejected with a real 400 validation
// error. Tried: entityId + entityClassName (rejected: "entityClassName not found"), entity object
// {id} (rejected: "Value of 'entity' is not valid"), entityId alone (rejected: "Value of 'entityId' is
// not valid"), and no entity reference at all (rejected: "Entity is required"). No shape was found that
// passes validation — this is the PREFERRED outcome per ADO, so no Bug needs to be filed.

const BASE = 'https://pd-epm-adminportal-qa-wf.shesha.app';
const WF_API = 'https://pd-epm-api-qa-wf.shesha.app';
const CPR_ID = 'f9a15981-10a4-4bf6-89a1-83a239a2c498';

const SLOW = 420_000;

test.describe('EPM — Audit trail synthetic direct-insert rejection (ADO plan 108745 / suite 109532)', () => {
  test('TC-108872 Negative — direct-insert of a synthetic audit row is rejected', async ({ page }) => {
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

    // STEP (ADO): POST a fake event via the raw dynamic CRUD Create endpoint, using the same
    // shape as the entity's own read DTO (entityId + entityClassName) as the most "realistic" fake.
    const fakeEvent = {
      entityId: CPR_ID,
      entityClassName: 'Boxfusion.Epm.Domain.ComponentProgressReports.ComponentProgressReport',
      actionType: 1,
      action: 'SYNTHETIC TEST EVENT - direct API insert, not tied to a real workflow transition',
    };
    const resp = await page.request.post(`${WF_API}/api/dynamic/Epm/EpmAuditedEntityEvent/Crud/Create`, { headers: auth, data: fakeEvent });
    const body = await resp.json().catch(() => null);
    console.log(`STEP ACTUAL — status=${resp.status()}, success=${body?.success}, error=${JSON.stringify(body?.error)}`);

    // ADO: "The endpoint either rejects (preferred) or accepts. If accepts, the anomaly must be
    // flagged as a Bug." Confirmed rejected -> preferred outcome, no Bug needed.
    expect(resp.status(), 'STEP EXPECTED (preferred per ADO): direct-insert should be rejected, not accepted as 200/201').not.toBe(200);
    expect(body?.success, 'STEP EXPECTED: response should indicate failure').toBeFalsy();
  });
});
