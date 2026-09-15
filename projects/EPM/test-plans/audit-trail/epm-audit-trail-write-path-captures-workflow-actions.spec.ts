import { test, expect } from '@playwright/test';

// ADO TC-108798 (plan 108745, suite 109532 · 28 · EPM · Audit trail write path). Positive: precondition —
// a Quarter 1 KPI has advanced through Stage 1 Submit and one QA transition. Verify via
// EpmAuditedEntityEvent/Crud/GetAll filtered by componentProgressReportId — at least 3 audit events
// exist (OverallSubmit at Stage 1, ItemStatusChange at Stage 2, ItemAccepted at Stage 2); every row has
// actor Person, timestamp, action reflist, before/after status populated with no nulls.
//
// Reuses the real, non-deleted Q1 fixture from TC-108799 (CPR f9a15981-...) — a genuine live item that
// has advanced through Stage 1 Submit plus multiple later-stage transitions, so this precondition is
// satisfiable without needing to drive a brand-new item through the (separately confirmed inert) Open
// Progress Report action.

const BASE = 'https://pd-epm-adminportal-qa-wf.shesha.app';
const WF_API = 'https://pd-epm-api-qa-wf.shesha.app';
const CPR_ID = 'f9a15981-10a4-4bf6-89a1-83a239a2c498';

const SLOW = 420_000;

test.describe('EPM — Audit trail write path (ADO plan 108745 / suite 109532)', () => {
  test('TC-108798 Positive — write path captures every workflow action against a Progress Report', async ({ page }) => {
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

    // PRECONDITION: confirm the CPR is a real, non-deleted Q1 item.
    const cprResp = await (await page.request.get(`${WF_API}/api/dynamic/Epm/ComponentProgressReport/Crud/Get?id=${CPR_ID}`, { headers: auth })).json();
    console.log(`PRECONDITION ACTUAL — CPR isDeleted=${cprResp?.result?.isDeleted}.`);
    expect(cprResp?.result?.isDeleted, 'PRECONDITION EXPECTED: a real, non-deleted CPR').toBeFalsy();

    // STEP (ADO): filter EpmAuditedEntityEvent by componentProgressReportId; verify row shape.
    const aeResp = await (await page.request.get(`${WF_API}/api/dynamic/Epm/EpmAuditedEntityEvent/Crud/GetAll?maxResultCount=2000`, { headers: auth })).json();
    const rows = (aeResp?.result?.items ?? []).filter((r: any) => r?.entity?.id === CPR_ID);
    console.log(`STEP ACTUAL — audit rows for this CPR: ${rows.length}. Actions: ${JSON.stringify(rows.map((r: any) => ({ actionType: r.actionType, action: r.action })))}`);
    expect(rows.length, 'STEP EXPECTED: at least 3 audit events exist for this CPR').toBeGreaterThanOrEqual(3);

    const noNullActor = rows.every((r: any) => r.person && r.person.id);
    const noNullTimestamp = rows.every((r: any) => !!r.creationTime);
    const noNullAction = rows.every((r: any) => r.actionType !== null && r.actionType !== undefined);
    console.log(`STEP ACTUAL — every row has actor: ${noNullActor}, timestamp: ${noNullTimestamp}, actionType reflist: ${noNullAction}.`);
    expect(noNullActor, 'STEP EXPECTED: no audit row should have a null actor Person').toBeTruthy();
    expect(noNullTimestamp, 'STEP EXPECTED: no audit row should have a null timestamp').toBeTruthy();
    expect(noNullAction, 'STEP EXPECTED: no audit row should have a null action reflist value').toBeTruthy();

    // ADO also expects before/after status VALUE columns populated — this tenant's EpmAuditedEntityEvent
    // schema (confirmed via raw Get in TC-108799 investigation) has no beforeValue/afterValue fields at
    // all; only a free-text resolved `action` description string. Documented as a schema gap, not
    // re-litigated as a UI gap (that's TC-108799's finding).
    const hasBeforeAfterFields = rows.some((r: any) => 'beforeValue' in r || 'afterValue' in r);
    console.log(`STEP ACTUAL — any row exposes beforeValue/afterValue fields: ${hasBeforeAfterFields}. Real row shape: ${JSON.stringify(Object.keys(rows[0] ?? {}))}`);
    expect.soft(hasBeforeAfterFields, 'STEP EXPECTED (per ADO): before/after status VALUE columns should be populated on each row — CONFIRMED GAP: EpmAuditedEntityEvent has no beforeValue/afterValue fields at all in this schema, only a resolved free-text action description').toBeTruthy();
  });
});
