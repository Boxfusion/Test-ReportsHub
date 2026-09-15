import { test, expect } from '@playwright/test';

// ADO TC-108827 (plan 108745, suite 07 · EPM · Component Actioner assignment). Edge: the same Person
// (actionerId) can be assigned as a Stage 1 (actionLevel 20) actioner on two different Components
// without a false-positive uniqueness constraint blocking either insert. Pure-API test, matching ADO's
// own POST/GetAll-only steps.

const BASE = 'https://pd-epm-adminportal-qa-wf.shesha.app';
const WF_API = 'https://pd-epm-api-qa-wf.shesha.app';
const ACTIONER_ID = '0df05401-6802-4242-9d65-949924970db6'; // "Stage 1 Process Owner" (Person X)
// Component A: "Percentage compliance with statutory prescripts" on the "Princess" report — confirmed
// live to have zero existing ComponentActioner rows.
const COMPONENT_A_ID = '928ed9c3-4d97-4cbd-8e3a-85ef9f72a141';
// Component B: "Number of quarterly assessments conducted on performance of Provinces human
// settlements grant (ISUPG)" on the "Nomfa" report — a genuinely distinct real KPI Component.
const COMPONENT_B_ID = '8cb4704a-dd5e-4053-91c7-75c9d990fca7';
const ACTION_LEVEL = 20;

const SLOW = 420_000;
const RAW_CHANNEL = process.env.PW_CHANNEL === undefined ? 'chrome' : process.env.PW_CHANNEL;
const CHANNEL = RAW_CHANNEL === '' || RAW_CHANNEL === 'chromium' ? undefined : RAW_CHANNEL;

test.use({
  channel: CHANNEL,
  actionTimeout: 30_000,
  navigationTimeout: 120_000,
});

test.describe('EPM — Component Actioner cross-Component reuse (ADO plan 108745 / suite 07)', () => {
  test('TC-108827 Edge — the same actionerId can be assigned Stage 1 on two different Components', async ({ page }) => {
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

    const createdIds: string[] = [];
    try {
      // PRECONDITION check — confirm both Components exist and are genuinely distinct.
      const getAllBefore = await (await page.request.get(`${WF_API}/api/dynamic/Epm/ComponentActioner/Crud/GetAll?maxResultCount=2000`, { headers: auth })).json();
      const itemsBefore = getAllBefore?.result?.items ?? getAllBefore?.result ?? [];
      const beforeA = itemsBefore.filter((r: any) => r?.component?.id === COMPONENT_A_ID).length;
      const beforeB = itemsBefore.filter((r: any) => r?.component?.id === COMPONENT_B_ID).length;
      console.log(`PRECONDITION — existing rows before: Component A=${beforeA}, Component B=${beforeB}.`);

      // STEP 1 (ADO): Assign Person X to Component A at actionLevel 20.
      const createA = await page.request.post(`${WF_API}/api/dynamic/Epm/ComponentActioner/Crud/Create`, {
        headers: auth,
        data: { component: COMPONENT_A_ID, actioner: ACTIONER_ID, actionLevel: ACTION_LEVEL },
      });
      const bodyA = await createA.json().catch(() => null);
      console.log(`STEP 1 ACTUAL — Create on Component A: ${createA.status()}. Body: ${JSON.stringify(bodyA)}`);
      expect(createA.status(), 'STEP 1 EXPECTED: the row for Component A should be created').toBeLessThan(400);
      const idA = bodyA?.result?.id;
      expect(idA, 'STEP 1 EXPECTED: a ComponentActioner id should be returned for Component A').toBeTruthy();
      createdIds.push(idA);

      // STEP 2 (ADO): Assign Person X to Component B at actionLevel 20.
      const createB = await page.request.post(`${WF_API}/api/dynamic/Epm/ComponentActioner/Crud/Create`, {
        headers: auth,
        data: { component: COMPONENT_B_ID, actioner: ACTIONER_ID, actionLevel: ACTION_LEVEL },
      });
      const bodyB = await createB.json().catch(() => null);
      console.log(`STEP 2 ACTUAL — Create on Component B: ${createB.status()}. Body: ${JSON.stringify(bodyB)}`);
      expect(createB.status(), 'STEP 2 EXPECTED: the row for Component B should be created (not blocked by a false-positive uniqueness constraint on actionerId)').toBeLessThan(400);
      const idB = bodyB?.result?.id;
      expect(idB, 'STEP 2 EXPECTED: a ComponentActioner id should be returned for Component B').toBeTruthy();
      createdIds.push(idB);

      // STEP 3 (ADO): Verify via GetAll — two rows exist with the same actionerId across the two
      // Components; neither insertion was blocked.
      const getAllAfter = await (await page.request.get(`${WF_API}/api/dynamic/Epm/ComponentActioner/Crud/GetAll?maxResultCount=2000`, { headers: auth })).json();
      const itemsAfter = getAllAfter?.result?.items ?? getAllAfter?.result ?? [];
      const rowA = itemsAfter.find((r: any) => r.id === idA);
      const rowB = itemsAfter.find((r: any) => r.id === idB);
      console.log(`STEP 3 ACTUAL — row A: ${JSON.stringify(rowA)}`);
      console.log(`STEP 3 ACTUAL — row B: ${JSON.stringify(rowB)}`);

      expect(rowA, 'STEP 3 EXPECTED: the Component A row should exist via GetAll').toBeTruthy();
      expect(rowB, 'STEP 3 EXPECTED: the Component B row should exist via GetAll').toBeTruthy();
      expect(rowA?.actioner?.id, 'STEP 3 EXPECTED: Component A row should carry the same actionerId').toBe(ACTIONER_ID);
      expect(rowB?.actioner?.id, 'STEP 3 EXPECTED: Component B row should carry the same actionerId').toBe(ACTIONER_ID);
      expect(rowA?.component?.id, 'STEP 3 EXPECTED: row A should belong to Component A').toBe(COMPONENT_A_ID);
      expect(rowB?.component?.id, 'STEP 3 EXPECTED: row B should belong to Component B').toBe(COMPONENT_B_ID);
      console.log('STEP 3 ACTUAL — confirmed: the same actionerId is now a Stage 1 actioner on two distinct Components, neither insert was blocked.');
    } finally {
      for (const id of createdIds) {
        const delResp = await page.request.delete(`${WF_API}/api/dynamic/Epm/ComponentActioner/Crud/Delete?id=${id}`, { headers: auth }).catch(() => null);
        console.log(`CLEANUP — removed ComponentActioner ${id}: ${delResp ? delResp.status() : 'request failed'}.`);
      }
    }
  });
});
