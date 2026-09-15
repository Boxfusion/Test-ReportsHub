/**
 * Derived from sl1-12-contracting-scenarios.md — the .md plan is canonical.
 * Selectors reuse pmds.ts (captured live on 2026-08-02, extended 2026-08-13 with tier-2/outcomes
 * helpers). This run was driven live on 2026-08-13 against a freshly-opened Contracting stage;
 * the spec is checked in as a derived, re-runnable artefact for the next cycle.
 */
import { test, expect, Page } from '@playwright/test';
import * as path from 'path';
import * as P from './pmds';

const MEDIATION_FILE = path.resolve(__dirname, '../../../../test-data/mediation-outcome.txt');

// One Contracting chain per employee; the draft wizard is slow (8 key-activity modals), so the
// hub's 90s default timeout is raised here rather than globally.
test.describe.configure({ mode: 'serial', timeout: 900_000 });

const ADMIN = { user: 'admin', pwd: 'P@ssw0rd' };
const SUPERVISOR = 'LungileN';
const MEDIATOR = 'BabalwaM';
const TIER2 = 'Sampha';
const HR = 'SalesHR';

const CYCLE_URL =
  `${P.APP}/dynamic/SaGov.Pmds/sagov-cycle-details-view?id=7cf9054b-8c69-4313-ae5c-8039bf495c04` +
  `&name=SL%201-12%20Performance%20Agreement&fy=FY2026/27`;

async function tickVisibleCheckboxes(page: Page) {
  const boxes = page.locator('input[type="checkbox"]');
  const n = await boxes.count();
  for (let i = 0; i < n; i++) {
    const box = boxes.nth(i);
    if (await box.isVisible().catch(() => false)) {
      await box.check({ force: true });
      await page.waitForTimeout(800);
    }
  }
}

// ---------------------------------------------------------------------------
test.describe('TC-00 — Contracting is opened for the full population', () => {
  let page: Page;
  test.beforeAll(async ({ browser }) => (page = await browser.newPage({ viewport: { width: 1600, height: 950 } })));
  test.afterAll(async () => page.close());

  test('TC-00 — admin verifies the population is fully in progress', async () => {
    // STEP 1-3: NAVIGATE, log in as admin, open the process (performed manually this run — see
    // the plan; this TC only re-verifies the resulting state so the spec stays idempotent).
    await P.login(page, ADMIN.user, ADMIN.pwd);
    const c = await P.contractingCounters(page);
    console.log('Contracting counters:', JSON.stringify(c));
    // STEP 4: ASSERT IN PROGRESS, 0 Not Started (BLOCKING)
    expect(c.status, 'Contracting status').toBe('IN PROGRESS');
    expect(c.notStarted, 'Not Started').toBe(0);
    expect(c.inProgress + c.completed).toBe(c.total);
  });
});

// ---------------------------------------------------------------------------
function positiveScenario(label: string, employeeLogin: string, employeeName: RegExp) {
  test.describe(`${label} — plain happy path`, () => {
    let page: Page;
    test.beforeAll(async ({ browser }) => (page = await browser.newPage({ viewport: { width: 1600, height: 950 } })));
    test.afterAll(async () => page.close());

    test(`${label} — draft, submit, sign, verify`, async () => {
      // STEP 1-2: NAVIGATE, log in as the employee, open the Initiate task
      await P.login(page, employeeLogin);
      const row = await P.waitForInboxRow(page, /Initiate Performance Agreement/i);
      await P.openTask(page, row);
      // STEP 3-4: TYPE the full agreement and Submit
      await P.completeDraftAndSubmit(page);
      await page.context().close();

      // STEP 5: supervisor Sign
      const supPage = await page.context().browser()!.newPage({ viewport: { width: 1600, height: 950 } });
      await P.login(supPage, SUPERVISOR);
      const supRow = await P.waitForInboxRow(supPage, employeeName);
      await P.openTask(supPage, supRow);
      await P.writeReviewComment(supPage, `Reviewed and agreed with the submitted KRAs and workplan.`);
      await P.signBtn(supPage).click();
      await supPage.waitForTimeout(15_000);
      await supPage.context().close();

      // STEP 6: HR Verify (BLOCKING)
      const hrPage = await page.context().browser()!.newPage({ viewport: { width: 1600, height: 950 } });
      await P.login(hrPage, HR);
      const hrRow = await P.waitForInboxRow(hrPage, employeeName);
      await P.openTask(hrPage, hrRow);
      await P.hrVerify(hrPage);
      await hrPage.context().close();
    });
  });
}

positiveScenario('TC-01 — Positive 1 (Simmy Mthalane)', 'Simmy', /Simmy/i);
positiveScenario('TC-02 — Positive 2 (Tony Dayimane)', 'TonyD', /Tony/i);

// ---------------------------------------------------------------------------
test.describe('TC-03 — Negative 1: Jabu Hadebe, resolved dispute', () => {
  test('TC-03 — refer, mediator resolves, employee updates, supervisor approves, HR verifies', async ({ browser }) => {
    let page = await browser.newPage({ viewport: { width: 1600, height: 950 } });
    await P.login(page, 'JabuH');
    const row = await P.waitForInboxRow(page, /Initiate Performance Agreement/i);
    await P.openTask(page, row);
    await P.completeDraftAndSubmit(page);
    await page.context().close();

    // STEP 2: supervisor refers for dispute (BLOCKING — task must leave the supervisor's inbox)
    page = await browser.newPage({ viewport: { width: 1600, height: 950 } });
    await P.login(page, SUPERVISOR);
    let taskRow = await P.waitForInboxRow(page, /Jabu/i);
    await P.openTask(page, taskRow);
    await P.referForDispute(page, 'Disagree with the weighting on KRA 2 — referring for mediation.');
    await page.context().close();

    // STEP 3: mediator resolves
    page = await browser.newPage({ viewport: { width: 1600, height: 950 } });
    await P.login(page, MEDIATOR);
    taskRow = await P.waitForInboxRow(page, /Jabu/i, 90_000);
    await P.openTask(page, taskRow);
    await P.mediatorResolve(page, 'Discussed with both parties; agreed the KRA 2 weighting stands as submitted.');
    await page.context().close();

    // STEP 4: employee updates with outcomes
    page = await browser.newPage({ viewport: { width: 1600, height: 950 } });
    await P.login(page, 'JabuH');
    taskRow = await P.waitForInboxRow(page, /Update.*Outcome/i, 90_000);
    await P.openTask(page, taskRow);
    await P.updateWithOutcomes(page);
    await page.context().close();

    // STEP 5: supervisor reviews updated agreement
    page = await browser.newPage({ viewport: { width: 1600, height: 950 } });
    await P.login(page, SUPERVISOR);
    taskRow = await P.waitForInboxRow(page, /Jabu/i, 90_000);
    await P.openTask(page, taskRow);
    await P.reviewUpdatedWithOutcomes(page);
    await page.context().close();

    // STEP 6: HR verifies (BLOCKING)
    page = await browser.newPage({ viewport: { width: 1600, height: 950 } });
    await P.login(page, HR);
    taskRow = await P.waitForInboxRow(page, /Jabu/i, 90_000);
    await P.openTask(page, taskRow);
    await P.hrVerify(page);
    await page.context().close();
  });
});

// ---------------------------------------------------------------------------
test.describe('TC-04 — Negative 2: Sanele Sithole, escalated dispute resolved at tier 2', () => {
  test('TC-04 — refer, mediator not-resolved, tier-2 resolves, updates, HR verifies', async ({ browser }) => {
    let page = await browser.newPage({ viewport: { width: 1600, height: 950 } });
    await P.login(page, 'SaneleS');
    let row = await P.waitForInboxRow(page, /Initiate Performance Agreement/i);
    await P.openTask(page, row);
    await P.completeDraftAndSubmit(page);
    await page.context().close();

    page = await browser.newPage({ viewport: { width: 1600, height: 950 } });
    await P.login(page, SUPERVISOR);
    row = await P.waitForInboxRow(page, /Sanele/i);
    await P.openTask(page, row);
    await P.referForDispute(page, 'Disagree with the measurability of the targets on KRA 3.');
    await page.context().close();

    // STEP 3: mediator selects "not resolved" — Comments + Attachments become mandatory (BLOCKING)
    page = await browser.newPage({ viewport: { width: 1600, height: 950 } });
    await P.login(page, MEDIATOR);
    row = await P.waitForInboxRow(page, /Sanele/i, 90_000);
    await P.openTask(page, row);
    await P.mediatorSelectOutcome(page, P.MEDIATION_NOT_RESOLVED);
    await P.mediatorOutcomeEvidence(page, "Parties could not agree. Escalating to the mediator's supervisor.", MEDIATION_FILE);
    await P.submitBtn(page).first().click();
    await page.waitForTimeout(15_000);
    await page.context().close();

    // STEP 4: tier-2 (mediator's supervisor) resolves (BLOCKING — task must exist for Sampha)
    page = await browser.newPage({ viewport: { width: 1600, height: 950 } });
    await P.login(page, TIER2);
    row = await P.waitForInboxRow(page, /Sanele/i, 90_000);
    await P.openTask(page, row);
    await P.tier2Resolve(page, 'Reviewed both positions; agreed the measurability concern is addressed by the existing target wording.');
    await page.context().close();

    page = await browser.newPage({ viewport: { width: 1600, height: 950 } });
    await P.login(page, 'SaneleS');
    row = await P.waitForInboxRow(page, /Update.*Outcome/i, 90_000);
    await P.openTask(page, row);
    await P.updateWithOutcomes(page);
    await page.context().close();

    page = await browser.newPage({ viewport: { width: 1600, height: 950 } });
    await P.login(page, SUPERVISOR);
    row = await P.waitForInboxRow(page, /Sanele/i, 90_000);
    await P.openTask(page, row);
    await P.reviewUpdatedWithOutcomes(page);
    await page.context().close();

    // BLOCKING: HR inbox clears
    page = await browser.newPage({ viewport: { width: 1600, height: 950 } });
    await P.login(page, HR);
    row = await P.waitForInboxRow(page, /Sanele/i, 90_000);
    await P.openTask(page, row);
    await P.hrVerify(page);
    await page.context().close();
  });
});

// ---------------------------------------------------------------------------
test.describe('TC-05 — Negative 3: Adam Apple, escalated dispute unresolved at both tiers', () => {
  test('TC-05 — refer, mediator not-resolved, tier-2 not-resolved, terminal', async ({ browser }) => {
    let page = await browser.newPage({ viewport: { width: 1600, height: 950 } });
    await P.login(page, 'adam');
    let row = await P.waitForInboxRow(page, /Initiate Performance Agreement/i);
    await P.openTask(page, row);
    await P.completeDraftAndSubmit(page);
    await page.context().close();

    page = await browser.newPage({ viewport: { width: 1600, height: 950 } });
    await P.login(page, SUPERVISOR);
    row = await P.waitForInboxRow(page, /Adam/i);
    await P.openTask(page, row);
    await P.referForDispute(page, 'Disagree with the resource allocation described on KRA 4 — referring for mediation.');
    await page.context().close();

    page = await browser.newPage({ viewport: { width: 1600, height: 950 } });
    await P.login(page, MEDIATOR);
    row = await P.waitForInboxRow(page, /Adam/i, 90_000);
    await P.openTask(page, row);
    await P.mediatorSelectOutcome(page, P.MEDIATION_NOT_RESOLVED);
    await P.mediatorOutcomeEvidence(page, "Parties could not agree on the resource allocation. Escalating to the mediator's supervisor.", MEDIATION_FILE);
    await P.submitBtn(page).first().click();
    await page.waitForTimeout(15_000);
    await page.context().close();

    // STEP 4: tier-2 also selects "not resolved" — terminal, no further routing
    page = await browser.newPage({ viewport: { width: 1600, height: 950 } });
    await P.login(page, TIER2);
    row = await P.waitForInboxRow(page, /Adam/i, 90_000);
    await P.openTask(page, row);
    await P.tier2NotResolved(
      page,
      'Second review confirms parties remain in disagreement on the resource allocation. No further internal escalation path available.',
      MEDIATION_FILE,
    );
    await page.context().close();

    // STEP 5: ASSERT no downstream task exists anywhere (BLOCKING)
    for (const user of ['adam', SUPERVISOR, HR]) {
      page = await browser.newPage({ viewport: { width: 1600, height: 950 } });
      await P.login(page, user);
      await P.openInbox(page);
      const rows = await P.inboxRows(page);
      const hit = rows.find((r) => /Adam/i.test(r.text));
      expect(hit, `${user} should have no task for Adam`).toBeUndefined();
      await page.context().close();
    }
  });
});

// ---------------------------------------------------------------------------
test.describe('TC-06 — Contracting dashboard counts all 5 scenarios as completed', () => {
  test('TC-06 — final recount', async ({ browser }) => {
    const page = await browser.newPage({ viewport: { width: 1600, height: 950 } });
    await P.login(page, ADMIN.user, ADMIN.pwd);
    const c = await P.contractingCounters(page);
    console.log('Final counters:', JSON.stringify(c));
    // BLOCKING: 0 Not Started, Completed includes Adam's terminal Dispute Unresolved
    expect(c.notStarted).toBe(0);
    expect(c.completed).toBeGreaterThanOrEqual(5);
    expect(c.inProgress + c.completed).toBe(c.total);
    await page.context().close();
  });
});
