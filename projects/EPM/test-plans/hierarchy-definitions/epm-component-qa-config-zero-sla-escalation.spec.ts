import { test, expect } from '@playwright/test';

// ADO TC-108830 (plan 108745, suite 08 · EPM · Component QA Config — Service Level Agreement per
// Quality Assurance level). Edge: precondition — a Component QA Config row exists with SLA = 0
// (working days). Trigger the item to enter the corresponding QA level; expect the reminder scheduler
// to fire immediately per the zero-day SLA. Verify a notification record is written to the
// notification queue with the configured reminder type. Confirm the audit trail records the
// escalation event via an EpmAuditedEntityEvent row.
//
// Confirmed live 2026-08-18, via raw-API investigation (no UI surface exists for ComponentQAConfig —
// see epm-component-qa-config-no-ui memory):
// - The real "QA level entry" mechanism is the `QAReviewStep` entity: fields
//   {componentProgressReport, level, dueDate, completedDate, completedBy, comments}. Completing one
//   level's step causes the next level's step to be created with dueDate computed from that level's
//   ComponentQAConfig.slaDays. Live evidence: a level-1 step's completedDate exactly equals the next
//   level-2 step's dueDate on the same ComponentProgressReport (id dfbbefad-...), proving that
//   Component Type's level-2 ComponentQAConfig already has slaDays=0 in production data today — an
//   organic, already-existing zero-SLA case matching this test's precondition.
// - The "notification queue" ADO refers to is Shesha's built-in `NotificationMessage` entity
//   (module Shesha, not Epm — confirmed real via Crud/GetAll, 200). It has 0 rows tenant-wide, despite
//   394 live QAReviewStep rows including many with a dueDate already days in the past (i.e. genuinely
//   overdue right now) — strong live evidence no reminder/escalation job is actually wired up.
// - `EpmAuditedEntityEvent` is real and actively used, but only for actioner lifecycle actions
//   ("Item was received/opened/Submitted by actioner", actionType 1/2/3) — no escalation/reminder
//   actionType exists in any of the 538 live rows sampled.
// - No dedicated AppService/UI trigger exists for "enter a QA level" — the transition is an internal
//   side effect of completing the prior QAReviewStep, not a directly invokable action. This test
//   simulates entry into a zero-SLA level the same way the live data shows it: creating a
//   QAReviewStep with dueDate = now (immediately due, i.e. SLA already elapsed) and no completedDate.

const BASE = 'https://pd-epm-adminportal-qa-wf.shesha.app';
const WF_API = 'https://pd-epm-api-qa-wf.shesha.app';
const KPI_ID = 'd6cc6bf9-e5d3-431b-8990-c38e77184354'; // "Number of disaster awareness sessions conducted"
const RESPONSIBLE_PERSON_ID = 'd3480a89-686e-48db-98cf-29f55204952e'; // "Stage 2 Chief Director"
const COMPONENT_PROGRESS_REPORT_ID = '0da675be-2ca0-478c-b1f5-04507399ab05'; // existing report for this KPI, no QAReviewSteps yet

const SLOW = 420_000;
const RAW_CHANNEL = process.env.PW_CHANNEL === undefined ? 'chrome' : process.env.PW_CHANNEL;
const CHANNEL = RAW_CHANNEL === '' || RAW_CHANNEL === 'chromium' ? undefined : RAW_CHANNEL;

test.use({
  channel: CHANNEL,
  actionTimeout: 30_000,
  navigationTimeout: 120_000,
});

test.describe('EPM — Component QA Config zero-SLA escalation (ADO plan 108745 / suite 08)', () => {
  test('TC-108830 Edge — SLA of zero should trigger an immediate escalation reminder', async ({ page }) => {
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

    const createdQaConfigIds: string[] = [];
    const createdReviewStepIds: string[] = [];
    try {
      // PRECONDITION (ADO): a Component QA Config row exists with SLA = 0.
      const qaConfigResp = await page.request.post(`${WF_API}/api/dynamic/Epm/ComponentQAConfig/Crud/Create`, {
        headers: auth,
        data: { component: KPI_ID, level: 1, responsiblePerson: RESPONSIBLE_PERSON_ID, slaDays: 0 },
      });
      const qaConfigBody = await qaConfigResp.json().catch(() => null);
      console.log(`PRECONDITION ACTUAL — ComponentQAConfig level 1 slaDays=0 created: ${qaConfigResp.status()}.`);
      expect(qaConfigResp.status(), 'PRECONDITION EXPECTED: the zero-SLA ComponentQAConfig row should be creatable').toBeLessThan(400);
      const qaConfigId = qaConfigBody?.result?.id;
      if (qaConfigId) createdQaConfigIds.push(qaConfigId);

      const nmBefore = await (await page.request.get(`${WF_API}/api/dynamic/Shesha/NotificationMessage/Crud/GetAll?maxResultCount=1`, { headers: auth })).json();
      const nmCountBefore = nmBefore?.result?.totalCount ?? 0;
      const aeBefore = await (await page.request.get(`${WF_API}/api/dynamic/Epm/EpmAuditedEntityEvent/Crud/GetAll?maxResultCount=2000`, { headers: auth })).json();
      const aeItemsBefore = aeBefore?.result?.items ?? [];
      const aeCountBefore = aeItemsBefore.filter((r: any) => r?.entity?.id === COMPONENT_PROGRESS_REPORT_ID).length;
      console.log(`PRECONDITION ACTUAL — baseline NotificationMessage total: ${nmCountBefore}; baseline EpmAuditedEntityEvent rows for this report: ${aeCountBefore}.`);

      // STEP 1 (ADO): Trigger the item to enter the corresponding QA level. Simulated the same way
      // the live data represents "entered a zero-SLA level": a QAReviewStep with dueDate = now
      // (immediately due) and no completedDate — see the class-level comment for the live evidence.
      const now = new Date().toISOString();
      const stepResp = await page.request.post(`${WF_API}/api/dynamic/Epm/QAReviewStep/Crud/Create`, {
        headers: auth,
        data: { componentProgressReport: COMPONENT_PROGRESS_REPORT_ID, level: 1, dueDate: now },
      });
      const stepBody = await stepResp.json().catch(() => null);
      console.log(`STEP 1 ACTUAL — QAReviewStep level 1 (dueDate=now) created: ${stepResp.status()}. Body: ${JSON.stringify(stepBody)}`);
      expect(stepResp.status(), 'STEP 1 EXPECTED: entering the zero-SLA QA level should succeed').toBeLessThan(400);
      const stepId = stepBody?.result?.id;
      if (stepId) createdReviewStepIds.push(stepId);

      // Give a background scheduler a reasonable window to react before checking side effects.
      await page.waitForTimeout(10_000);

      // STEP 2 (ADO): Verify a notification record is written to the notification queue with reminder
      // type equal to the configured value. "Notification queue" = Shesha's built-in NotificationMessage.
      const nmAfter = await (await page.request.get(`${WF_API}/api/dynamic/Shesha/NotificationMessage/Crud/GetAll?maxResultCount=1`, { headers: auth })).json();
      const nmCountAfter = nmAfter?.result?.totalCount ?? 0;
      console.log(`STEP 2 ACTUAL — NotificationMessage total after trigger: ${nmCountAfter} (baseline was ${nmCountBefore}).`);
      expect.soft(nmCountAfter, 'STEP 2 EXPECTED (per ADO): a new notification record should appear in the queue for this immediate escalation — CONFIRMED GAP if unchanged: no reminder/escalation job is wired up at all').toBeGreaterThan(nmCountBefore);

      // STEP 3 (ADO): Confirm the audit trail records the escalation event via an
      // EpmAuditedEntityEvent row for this ComponentProgressReport.
      const aeAfter = await (await page.request.get(`${WF_API}/api/dynamic/Epm/EpmAuditedEntityEvent/Crud/GetAll?maxResultCount=2000`, { headers: auth })).json();
      const aeItemsAfter = aeAfter?.result?.items ?? [];
      const rowsForReport = aeItemsAfter.filter((r: any) => r?.entity?.id === COMPONENT_PROGRESS_REPORT_ID);
      console.log(`STEP 3 ACTUAL — EpmAuditedEntityEvent rows for this report after trigger: ${rowsForReport.length} (baseline was ${aeCountBefore}). Actions: ${JSON.stringify(rowsForReport.map((r: any) => r.action))}`);
      expect.soft(rowsForReport.length, 'STEP 3 EXPECTED (per ADO): an EpmAuditedEntityEvent row should capture the escalation event — CONFIRMED GAP if unchanged: entering a QA level is not audited at all, only actioner receive/open/submit actions are').toBeGreaterThan(aeCountBefore);
    } finally {
      for (const id of createdReviewStepIds) {
        const delResp = await page.request.delete(`${WF_API}/api/dynamic/Epm/QAReviewStep/Crud/Delete?id=${id}`, { headers: auth }).catch(() => null);
        console.log(`CLEANUP — removed QAReviewStep ${id}: ${delResp ? delResp.status() : 'request failed'}.`);
      }
      for (const id of createdQaConfigIds) {
        const delResp = await page.request.delete(`${WF_API}/api/dynamic/Epm/ComponentQAConfig/Crud/Delete?id=${id}`, { headers: auth }).catch(() => null);
        console.log(`CLEANUP — removed ComponentQAConfig ${id}: ${delResp ? delResp.status() : 'request failed'}.`);
      }
    }
  });
});
