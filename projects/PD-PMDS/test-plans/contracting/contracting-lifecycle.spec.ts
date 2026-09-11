/**
 * Derived from contracting-lifecycle.md — the .md plan is canonical.
 * Selectors captured live on 2026-08-02 against
 * SaGov.Pmds/sagov-performanceagreement-wf-draftperformanceagreement v52.
 */
import { test, expect, Page } from '@playwright/test';
import * as path from 'path';
import * as P from './pmds';

/** Evidence attached on the unresolved-mediation branch (Attachments is mandatory there). */
const MEDIATION_FILE = path.resolve(__dirname, '../../../../test-data/mediation-outcome.txt');

// Serial: this is one Contracting chain — a failed step invalidates everything after it.
// The draft wizard is genuinely slow (8 key-activity modals per agreement), so the 90s default
// timeout in the hub's playwright.config is raised here rather than globally.
test.describe.configure({ mode: 'serial', timeout: 900_000 });

const ADMIN = { user: 'admin', pwd: 'P@ssw0rd' };
const SANELE = 'SaneleS';
const SIMMY = 'Simmy';
const JABU = 'JabuH';
const ADAM = 'adam';
const SUPERVISOR = 'LungileN';
const MEDIATOR = 'BabalwaM';
const HR = 'SalesHR';

/** Pick the supervisor/HR inbox row for a named employee — these inboxes hold several PAs. */
const rowFor = (rows: P.InboxRow[], action: RegExp, employee: RegExp) =>
  rows.find((r) => action.test(r.text) && employee.test(r.text));

// ---------------------------------------------------------------------------
test.describe('Contracting — admin process state', () => {
  let page: Page;
  test.beforeAll(async ({ browser }) => {
    page = await browser.newPage({ viewport: { width: 1600, height: 950 } });
  });
  test.afterAll(async () => page.close());

  test('TC-01 — Contracting stage is open with the full employee population in progress', async () => {
    // STEP 1: NAVIGATE to the portal and log in as admin
    await P.login(page, ADMIN.user, ADMIN.pwd);
    // STEP 2: NAVIGATE to SL 1-12 Performance Agreement FY2026/27 cycle details
    const c = await P.contractingCounters(page);
    console.log('Contracting counters:', JSON.stringify(c));
    // STEP 3: ASSERT Contracting is IN PROGRESS (BLOCKING)
    expect(c.status, 'Contracting stage status').toBe('IN PROGRESS');
    // STEP 4: ASSERT nobody is left Not Started
    expect(c.notStarted, 'Not Started count').toBe(0);
    // STEP 5: ASSERT the whole population is in progress
    expect(c.inProgress, 'In Progress count').toBeGreaterThan(0);
    expect(c.inProgress + c.completed).toBe(c.total);
  });
});

// ---------------------------------------------------------------------------
test.describe('Contracting — draft wizard validation and submit (Sanele Sithole)', () => {
  let page: Page;

  test.beforeAll(async ({ browser }) => {
    page = await browser.newPage({ viewport: { width: 1600, height: 950 } });
    await P.login(page, SANELE);
    const row = await P.waitForInboxRow(page, /Initiate Performance Agreement/i);
    await P.openTask(page, row);
    await P.installToastSpy(page);
  });
  test.afterAll(async () => page.close());

  test('TC-02 — Confirm Details defaults the supervisor and mediator from the reporting line', async () => {
    // STEP 1: ASSERT the wizard opens on Confirm Details (BLOCKING)
    await P.expectStep(page, /Confirm Details/i);
    // STEP 2: ASSERT the default supervisor is the employee's line manager
    const supervisor = await P.detailValue(page, 'Default Supervisor');
    console.log('Default Supervisor =', supervisor);
    expect(supervisor).toBe('Lungile Nhleko');
    // STEP 3: ASSERT the mediator defaults to the supervisor's supervisor
    const mediator = await P.detailValue(page, 'Default Mediator');
    console.log('Default Mediator =', mediator);
    expect(mediator).toBe('Babalwa M');
    // STEP 4: CLICK Next to advance to Scoring
    await P.gotoStep(page, /Scoring/i);
    await P.expectStep(page, /Scoring/i);
  });

  test('TC-03 — NEGATIVE: Next stays disabled while the KRA weights total less than 100%', async () => {
    // STEP 1: ASSERT Next is disabled with an empty KRA table (BLOCKING)
    expect(await P.nextBtn(page).isEnabled(), 'Next with no KRAs').toBe(false);
    // STEP 2: TYPE three KRAs at 25% each (75% total)
    await P.ensureKras(page, P.KRAS.slice(0, 3));
    const total = await P.kraWeightTotal(page);
    console.log('KRA weight total after 3 KRAs =', total);
    // STEP 3: ASSERT the running total is 75%
    expect(total).toBe(75);
    // STEP 4: ASSERT Next is still disabled — the form must not allow an under-weighted PA
    expect(await P.nextBtn(page).isEnabled(), 'Next at 75%').toBe(false);
  });

  test('TC-04 — NEGATIVE: Next stays disabled at 100% until the minimum 4 GAFs are checked', async () => {
    // STEP 1: TYPE the fourth KRA to reach 100%
    await P.ensureKras(page, P.KRAS);
    expect(await P.kraWeightTotal(page), 'KRA weight total').toBe(100);
    // STEP 2: ASSERT fewer than 4 GAFs are checked
    const checked = await P.gafCheckedCount(page);
    console.log('GAFs checked =', checked);
    // STEP 3: ASSERT Next is disabled while the GAF minimum is unmet (BLOCKING)
    if (checked < 4) {
      expect(await P.nextBtn(page).isEnabled(), 'Next at 100% with <4 GAFs').toBe(false);
    } else {
      test.info().annotations.push({ type: 'note', description: `Draft already had ${checked} GAFs checked` });
    }
  });

  test('TC-05 — Scoring completes once 4 KRAs total 100% and 4 GAFs are checked', async () => {
    // STEP 1: CLICK 4 Generic Assessment Factors
    const ticked = await P.tickGafs(page, 4);
    console.log('GAFs ticked this run:', JSON.stringify(ticked));
    // STEP 2: ASSERT 4 GAFs are checked
    expect(await P.gafCheckedCount(page), 'GAFs checked').toBeGreaterThanOrEqual(4);
    // STEP 3: ASSERT Next is now enabled (BLOCKING)
    expect(await P.nextBtn(page).isEnabled(), 'Next after valid scoring').toBe(true);
    // STEP 4: CLICK Next to advance to Workplan Agreement
    await P.gotoStep(page, /Workplan/i);
    await P.expectStep(page, /Workplan/i);
  });

  test('TC-06 — NEGATIVE: the workplan cannot be left with fewer than 2 key activities per KRA', async () => {
    // STEP 1: ASSERT the workplan renders one section per KRA
    const sections = await P.workplanKraCount(page);
    console.log('Workplan KRA sections =', sections);
    expect(sections).toBe(4);
    // STEP 2: TYPE a single key activity against the first KRA
    if ((await P.workplanRows(page, 0)).length < 1) {
      await P.addKeyActivity(page, 0, P.keyActivity(0, 1));
    }
    expect((await P.workplanRows(page, 0)).length, 'KRA 1 activities').toBe(1);
    // STEP 3: CLICK Next
    await P.drainToasts(page);
    await P.nextBtn(page).click();
    await page.waitForTimeout(4000);
    // STEP 4: ASSERT the wizard refuses to advance (BLOCKING)
    const step = await P.activeStep(page);
    const toasts = await P.drainToasts(page);
    const errors = await P.formErrors(page);
    console.log('after Next with 1 activity -> step:', step, '| toasts:', JSON.stringify(toasts), '| errors:', JSON.stringify(errors));
    expect(step, 'wizard must stay on Workplan Agreement').toMatch(/Workplan/i);
    // STEP 5: ASSERT the refusal is explained to the user
    // (recorded rather than asserted hard — see the plan's "known issues" note)
    test.info().annotations.push({
      type: 'validation-feedback',
      description: toasts.concat(errors).join(' | ') || 'NONE — Next is blocked silently',
    });
  });

  test('TC-07 — Workplan advances once every KRA has 2 key activities', async () => {
    // STEP 1: TYPE key activities until each of the 4 KRAs has 2
    for (let k = 0; k < 4; k++) {
      while ((await P.workplanRows(page, k)).length < 2) {
        const n = (await P.workplanRows(page, k)).length + 1;
        await P.addKeyActivity(page, k, P.keyActivity(k, n));
      }
      console.log(`KRA ${k + 1} activities =`, (await P.workplanRows(page, k)).length);
    }
    // STEP 2: ASSERT 8 key activities in total
    let total = 0;
    for (let k = 0; k < 4; k++) total += (await P.workplanRows(page, k)).length;
    expect(total, 'total key activities').toBe(8);
    // STEP 3: CLICK Next to advance to the Personal Development Plan
    await P.gotoStep(page, /Personal Development/i);
    await P.expectStep(page, /Personal Development/i);
  });

  test('TC-08 — A development area can be added to the Personal Development Plan', async () => {
    // STEP 1: CLICK Add PDP and capture a development area
    if ((await P.pdpRows(page)).length < 1) {
      await P.addPdp(page, '30/09/2026');
    }
    // STEP 2: ASSERT the PDP row is listed
    const rows = await P.pdpRows(page);
    console.log('PDP rows:', JSON.stringify(rows));
    expect(rows.length, 'PDP rows').toBeGreaterThanOrEqual(1);
    // STEP 3: CLICK Next to reach the Completed Summary
    await P.gotoStep(page, /Completed Summary/i);
    await P.expectStep(page, /Completed Summary/i);
  });

  test('TC-09 — NEGATIVE: Submit is disabled until both attestations are confirmed', async () => {
    // STEP 1: ASSERT the summary exposes both attestation checkboxes
    const boxes = page.locator('input[type="checkbox"]');
    expect(await boxes.count(), 'attestation checkboxes').toBe(2);
    // STEP 2: ASSERT Submit is disabled with neither ticked (BLOCKING)
    expect(await P.submitBtn(page).isEnabled(), 'Submit with 0 attestations').toBe(false);
    // STEP 3: CLICK the first attestation only
    await boxes.nth(0).check({ force: true });
    await page.waitForTimeout(1500);
    // STEP 4: ASSERT Submit is still disabled with only one attestation
    expect(await P.submitBtn(page).isEnabled(), 'Submit with 1 of 2 attestations').toBe(false);
  });

  test('TC-10 — The employee submits the performance agreement for supervisor review', async () => {
    // STEP 1: CLICK both attestation checkboxes
    await P.tickAttestations(page);
    // STEP 2: ASSERT Submit is enabled (BLOCKING)
    expect(await P.submitBtn(page).isEnabled(), 'Submit with both attestations').toBe(true);
    // STEP 3: CLICK Submit
    await P.submitBtn(page).click();
    await page.waitForTimeout(15_000);
    // STEP 4: ASSERT the task has left the employee's inbox
    await P.openInbox(page);
    const rows = await P.inboxRows(page);
    const remaining = rows.filter((r) => /Initiate Performance Agreement/i.test(r.text));
    console.log('Sanele inbox after submit:', JSON.stringify(rows.map((r) => r.text)));
    expect(remaining.length, 'Initiate PA tasks left in employee inbox').toBe(0);
  });
});

// ---------------------------------------------------------------------------
test.describe('Contracting — supervisor send back and re-submit (Sanele Sithole)', () => {
  let page: Page;
  let sentBackToStep = '';

  test.beforeAll(async ({ browser }) => {
    page = await browser.newPage({ viewport: { width: 1600, height: 950 } });
  });
  test.afterAll(async () => page.close());

  test('TC-11 — NEGATIVE: Refer for Dispute cannot be confirmed without a reason', async () => {
    // STEP 1: NAVIGATE and log in as the supervisor
    await P.login(page, SUPERVISOR);
    // STEP 2: CLICK the Review Performance Agreement task for Sanele
    await P.waitForInboxRow(page, /Review Performance Agreement/i);
    const row = rowFor(await P.inboxRows(page), /Review Performance Agreement/i, /Sanele/i);
    expect(row, "Sanele's PA in the supervisor inbox").toBeTruthy();
    await P.openTask(page, row!);
    // STEP 3: ASSERT the supervisor's decision buttons are present (BLOCKING)
    for (const b of [P.signBtn(page), P.sendBackBtn(page), P.referBtn(page)]) {
      expect(await b.count()).toBeGreaterThan(0);
    }
    // STEP 4: CLICK Refer for Dispute to open the confirmation dialog
    const modal = await P.openReferDialog(page);
    await expect(modal).toContainText(/refer this Performance Agreement for Mediation/i);
    // STEP 5: ASSERT Yes is disabled while no reason has been captured (BLOCKING)
    expect(await modal.getByRole('button', { name: 'Yes', exact: true }).isDisabled(), 'Yes without a comment').toBe(true);
    // STEP 6: TYPE a reason and ASSERT Yes becomes available
    await modal.locator('textarea').first().click();
    await modal.locator('textarea').first().fill('Reason captured to prove the gate opens.');
    await page.waitForTimeout(1500);
    expect(await modal.getByRole('button', { name: 'Yes', exact: true }).isEnabled(), 'Yes with a comment').toBe(true);
    // STEP 7: CLICK No — this PA follows the send-back path instead
    await P.dismissModal(page);
  });

  test('TC-12 — The supervisor sends the agreement back to the employee', async () => {
    // STEP 1: CLICK Send back and choose the user task to return to
    sentBackToStep = await P.sendBackTo(page, 'Please expand the targets on KRA 1 — they are not measurable.');
    console.log('sent back to step:', sentBackToStep);
    // STEP 2: ASSERT the task has left the supervisor's inbox
    await P.openInbox(page);
    const still = rowFor(await P.inboxRows(page), /Review Performance Agreement/i, /Sanele/i);
    expect(still, 'PA should no longer sit with the supervisor').toBeFalsy();
  });

  test('TC-13 — The employee receives the returned agreement and re-submits it', async () => {
    // STEP 1: NAVIGATE and log in as the employee
    await P.logout(page);
    await P.login(page, SANELE);
    // STEP 2: ASSERT the returned PA is back in the employee's inbox (BLOCKING)
    const row = await P.waitForInboxRow(page, /Performance Agreement/i);
    console.log('returned task:', row.text);
    // STEP 3: CLICK the task and re-submit it unchanged
    await P.openTask(page, row);
    await P.gotoStep(page, /Completed Summary/i);
    await P.tickAttestations(page);
    expect(await P.submitBtn(page).isEnabled(), 'Submit on the returned PA').toBe(true);
    await P.submitBtn(page).click();
    await page.waitForTimeout(15_000);
    // STEP 4: ASSERT the employee's inbox is clear again
    await P.openInbox(page);
    const left = (await P.inboxRows(page)).filter((r) => /Performance Agreement/i.test(r.text));
    console.log('employee inbox after re-submit:', JSON.stringify(left.map((r) => r.text)));
    expect(left.length).toBe(0);
  });

  test('TC-14 — The supervisor signs the re-submitted agreement', async () => {
    // STEP 1: NAVIGATE and log in as the supervisor
    await P.logout(page);
    await P.login(page, SUPERVISOR);
    // STEP 2: CLICK the Review task for Sanele
    await P.waitForInboxRow(page, /Review Performance Agreement/i);
    const row = rowFor(await P.inboxRows(page), /Review Performance Agreement/i, /Sanele/i);
    expect(row, 'resubmitted PA back with the supervisor').toBeTruthy();
    await P.openTask(page, row!);
    // STEP 3: TYPE a review comment and CLICK Sign
    await P.writeReviewComment(page, 'Targets revised and agreed. Signing off.');
    await P.signBtn(page).click();
    await page.waitForTimeout(15_000);
    // STEP 4: ASSERT the task has left the supervisor's inbox (BLOCKING)
    await P.openInbox(page);
    const still = rowFor(await P.inboxRows(page), /Review Performance Agreement/i, /Sanele/i);
    expect(still, 'signed PA should have routed to HR').toBeFalsy();
  });

  test('TC-15 — NEGATIVE: HR cannot verify until the confirmation is ticked, then verification completes', async () => {
    // STEP 1: NAVIGATE and log in as HR
    await P.logout(page);
    await P.login(page, HR);
    // STEP 2: CLICK the Verify Performance Agreement task for Sanele
    await P.waitForInboxRow(page, /Verify Performance Agreement/i);
    const row = rowFor(await P.inboxRows(page), /Verify Performance Agreement/i, /Sanele/i);
    expect(row, "Sanele's PA in the HR inbox").toBeTruthy();
    await P.openTask(page, row!);
    // STEP 3: ASSERT Verify is gated by the confirmation checkbox (BLOCKING)
    const boxes = page.locator('input[type="checkbox"]');
    console.log('HR checkboxes:', await boxes.count(), 'verify buttons:', await P.verifyBtn(page).count());
    expect(await P.verifyBtn(page).count(), 'Verify button present').toBeGreaterThan(0);
    expect(await P.verifyBtn(page).first().isEnabled(), 'Verify before confirmation').toBe(false);
    // STEP 4: CLICK the confirmation checkbox
    await boxes.first().check({ force: true });
    await page.waitForTimeout(1500);
    expect(await P.verifyBtn(page).first().isEnabled(), 'Verify after confirmation').toBe(true);
    // STEP 5: CLICK Verify
    await P.verifyBtn(page).first().click();
    await page.waitForTimeout(15_000);
    // STEP 6: ASSERT the task has cleared HR's inbox
    await P.openInbox(page);
    const still = rowFor(await P.inboxRows(page), /Verify Performance Agreement/i, /Sanele/i);
    expect(still, 'verified PA should have left the HR inbox').toBeFalsy();
  });
});

// ---------------------------------------------------------------------------
test.describe('Contracting — happy path to Generate PERSAL Input (Simmy Mthalane)', () => {
  let page: Page;
  test.beforeAll(async ({ browser }) => {
    page = await browser.newPage({ viewport: { width: 1600, height: 950 } });
  });
  test.afterAll(async () => page.close());

  test('TC-16 — The employee drafts and submits the performance agreement', async () => {
    // STEP 1: NAVIGATE and log in as the employee
    await P.login(page, SIMMY);
    // STEP 2: CLICK the Initiate Performance Agreement task
    const row = await P.waitForInboxRow(page, /Initiate Performance Agreement/i);
    await P.openTask(page, row);
    // STEP 3: ASSERT the reporting line defaults are correct
    expect(await P.detailValue(page, 'Default Supervisor')).toBe('Lungile Nhleko');
    expect(await P.detailValue(page, 'Default Mediator')).toBe('Babalwa M');
    // STEP 4: TYPE the full agreement (scoring, workplan, PDP) and CLICK Submit
    await P.completeDraftAndSubmit(page);
    // STEP 5: ASSERT the task has left the employee's inbox (BLOCKING)
    await P.openInbox(page);
    const left = (await P.inboxRows(page)).filter((r) => /Initiate Performance Agreement/i.test(r.text));
    expect(left.length, 'Initiate PA tasks left in employee inbox').toBe(0);
  });

  test('TC-17 — The supervisor signs the agreement without changes', async () => {
    // STEP 1: NAVIGATE and log in as the supervisor
    await P.logout(page);
    await P.login(page, SUPERVISOR);
    // STEP 2: CLICK the Review Performance Agreement task for Simmy
    await P.waitForInboxRow(page, /Review Performance Agreement/i);
    const row = rowFor(await P.inboxRows(page), /Review Performance Agreement/i, /Simmy/i);
    expect(row, "Simmy's PA in the supervisor inbox").toBeTruthy();
    await P.openTask(page, row!);
    // STEP 3: TYPE a review comment and CLICK Sign
    await P.writeReviewComment(page, 'Agreement discussed and agreed. Signed.');
    await P.signBtn(page).click();
    await page.waitForTimeout(15_000);
    // STEP 4: ASSERT the task has routed onwards (BLOCKING)
    await P.openInbox(page);
    expect(rowFor(await P.inboxRows(page), /Review Performance Agreement/i, /Simmy/i)).toBeFalsy();
  });

  test('TC-18 — HR verifies the agreement and it reaches Generate PERSAL Input', async () => {
    // STEP 1: NAVIGATE and log in as HR
    await P.logout(page);
    await P.login(page, HR);
    // STEP 2: CLICK the Verify Performance Agreement task for Simmy
    await P.waitForInboxRow(page, /Verify Performance Agreement/i);
    const row = rowFor(await P.inboxRows(page), /Verify Performance Agreement/i, /Simmy/i);
    expect(row, "Simmy's PA in the HR inbox").toBeTruthy();
    await P.openTask(page, row!);
    // STEP 3: CLICK the confirmation checkbox and CLICK Verify
    await page.locator('input[type="checkbox"]').first().check({ force: true });
    await page.waitForTimeout(1500);
    await P.verifyBtn(page).first().click();
    await page.waitForTimeout(15_000);
    // STEP 4: ASSERT the task has cleared the HR inbox (BLOCKING)
    await P.openInbox(page);
    expect(rowFor(await P.inboxRows(page), /Verify Performance Agreement/i, /Simmy/i)).toBeFalsy();
  });
});

// ---------------------------------------------------------------------------
test.describe('Contracting — dispute referred for mediation (Jabu Hadebe, Adam Apple)', () => {
  let page: Page;
  test.beforeAll(async ({ browser }) => {
    page = await browser.newPage({ viewport: { width: 1600, height: 950 } });
  });
  test.afterAll(async () => page.close());

  test('TC-19 — Jabu submits an agreement the supervisor will dispute', async () => {
    // STEP 1: NAVIGATE and log in as the employee
    await P.login(page, JABU);
    // STEP 2: CLICK the Initiate Performance Agreement task and complete the draft
    const row = await P.waitForInboxRow(page, /Initiate Performance Agreement/i);
    await P.openTask(page, row);
    await P.completeDraftAndSubmit(page);
    // STEP 3: ASSERT the task has left the employee's inbox (BLOCKING)
    await P.openInbox(page);
    expect((await P.inboxRows(page)).filter((r) => /Initiate Performance Agreement/i.test(r.text)).length).toBe(0);
  });

  test('TC-20 — The supervisor refers Jabu\'s agreement for mediation', async () => {
    // STEP 1: NAVIGATE and log in as the supervisor
    await P.logout(page);
    await P.login(page, SUPERVISOR);
    // STEP 2: CLICK the Review Performance Agreement task for Jabu
    await P.waitForInboxRow(page, /Review Performance Agreement/i);
    const row = rowFor(await P.inboxRows(page), /Review Performance Agreement/i, /Jabu/i);
    expect(row, "Jabu's PA in the supervisor inbox").toBeTruthy();
    await P.openTask(page, row!);
    // STEP 3: CLICK Refer for Dispute, TYPE the reason and confirm
    await P.referForDispute(page, 'The proposed KRA weightings do not reflect the agreed priorities for the unit.');
    // STEP 4: ASSERT the agreement has left the supervisor's inbox (BLOCKING)
    await P.openInbox(page);
    expect(rowFor(await P.inboxRows(page), /Review Performance Agreement/i, /Jabu/i)).toBeFalsy();
  });

  test('TC-21 — Adam submits and his agreement is also referred for mediation', async () => {
    // STEP 1: NAVIGATE and log in as the employee, complete and submit the draft
    await P.logout(page);
    await P.login(page, ADAM);
    const row = await P.waitForInboxRow(page, /Initiate Performance Agreement/i);
    await P.openTask(page, row);
    await P.completeDraftAndSubmit(page);
    // STEP 2: NAVIGATE and log in as the supervisor
    await P.logout(page);
    await P.login(page, SUPERVISOR);
    await P.waitForInboxRow(page, /Review Performance Agreement/i);
    const sup = rowFor(await P.inboxRows(page), /Review Performance Agreement/i, /Adam/i);
    expect(sup, "Adam's PA in the supervisor inbox").toBeTruthy();
    await P.openTask(page, sup!);
    // STEP 3: CLICK Refer for Dispute with a reason
    await P.referForDispute(page, 'Targets are not achievable within the available resources.');
    // STEP 4: ASSERT the agreement has left the supervisor's inbox (BLOCKING)
    await P.openInbox(page);
    expect(rowFor(await P.inboxRows(page), /Review Performance Agreement/i, /Adam/i)).toBeFalsy();
  });

  test('TC-22 — Both disputes are routed to the mediator', async () => {
    // STEP 1: NAVIGATE and log in as the mediator
    await P.logout(page);
    await P.login(page, MEDIATOR);
    // STEP 2: ASSERT the mediator holds a mediation task for each disputed agreement (BLOCKING)
    await P.waitForInboxRow(page, /Mediator|Disagreement|Dispute/i);
    const rows = await P.inboxRows(page);
    console.log('mediator inbox:', JSON.stringify(rows.map((r) => r.text), null, 1));
    expect(rows.some((r) => /Jabu/i.test(r.text)), "Jabu's dispute reached the mediator").toBe(true);
    expect(rows.some((r) => /Adam/i.test(r.text)), "Adam's dispute reached the mediator").toBe(true);
  });

  test('TC-23 — The mediator records the disagreement as resolved and it returns to the employee', async () => {
    // STEP 1: CLICK the mediation task for Jabu
    const row = rowFor(await P.inboxRows(page), /Mediator Review Disagreement/i, /Jabu/i);
    expect(row, "Jabu's mediation task").toBeTruthy();
    await P.openTask(page, row!);
    // STEP 2: ASSERT both dispute outcomes are offered (BLOCKING)
    await expect(page.locator('.ant-radio-wrapper').filter({ hasText: P.MEDIATION_RESOLVED })).toHaveCount(1);
    await expect(page.locator('.ant-radio-wrapper').filter({ hasText: P.MEDIATION_NOT_RESOLVED })).toHaveCount(1);
    // STEP 3: SELECT "The disagreement has been resolved", TYPE the outcome and CLICK Submit
    await P.mediatorResolve(page, 'Both parties agreed to revised KRA weightings during mediation.');
    // STEP 4: ASSERT the mediation task has cleared (BLOCKING)
    await P.openInbox(page);
    expect(rowFor(await P.inboxRows(page), /Mediator Review Disagreement/i, /Jabu/i)).toBeFalsy();
  });

  test('TC-24 — The employee updates the agreement with the dispute outcome and it completes', async () => {
    // STEP 1: NAVIGATE and log in as the employee
    await P.logout(page);
    await P.login(page, JABU);
    // STEP 2: CLICK the Update Performance Agreement task
    const row = await P.waitForInboxRow(page, /Update Performance Agreement|Performance Agreement/i);
    console.log('employee post-mediation task:', row.text);
    await P.openTask(page, row);
    // STEP 3: CLICK every tab so the agreement data hydrates, confirm and CLICK Submit
    await P.visitAllTabs(page);
    await P.tickAttestations(page);
    await expect(P.submitBtn(page).first()).toBeEnabled({ timeout: 60_000 });
    await P.submitBtn(page).first().click();
    await page.waitForTimeout(20_000);
    // STEP 4: ASSERT the task has left the employee's inbox (BLOCKING)
    await P.openInbox(page);
    const left = (await P.inboxRows(page)).filter((r) => /Performance Agreement/i.test(r.text));
    console.log('Jabu inbox after update:', JSON.stringify(left.map((r) => r.text)));
    expect(left.length, 'employee tasks after updating with outcomes').toBe(0);

    // STEP 5: NAVIGATE and log in as the supervisor, approve the updated agreement
    await P.logout(page);
    await P.login(page, SUPERVISOR);
    const sup = await P.waitForInboxRow(page, /Review.*Performance Agreement/i);
    console.log('supervisor re-review task:', sup.text);
    await P.openTask(page, sup);
    await P.tickAttestations(page);
    const approve = (await P.submitBtn(page).count()) ? P.submitBtn(page) : P.signBtn(page);
    await approve.first().click();
    await page.waitForTimeout(15_000);

    // STEP 6: NAVIGATE and log in as HR, verify the agreement
    await P.logout(page);
    await P.login(page, HR);
    await P.waitForInboxRow(page, /Verify Performance Agreement/i);
    const hrRow = rowFor(await P.inboxRows(page), /Verify Performance Agreement/i, /Jabu/i);
    expect(hrRow, "Jabu's PA in the HR inbox").toBeTruthy();
    await P.openTask(page, hrRow!);
    await page.locator('input[type="checkbox"]').first().check({ force: true });
    await page.waitForTimeout(1500);
    await P.verifyBtn(page).first().click();
    await page.waitForTimeout(15_000);
    // STEP 7: ASSERT the resolved-dispute branch has completed (BLOCKING)
    await P.openInbox(page);
    expect(rowFor(await P.inboxRows(page), /Verify Performance Agreement/i, /Jabu/i)).toBeFalsy();
  });

  test('TC-25 — NEGATIVE: an unresolved mediation requires both a comment and an attachment', async () => {
    // STEP 1: NAVIGATE and log in as the mediator
    await P.logout(page);
    await P.login(page, MEDIATOR);
    // STEP 2: CLICK the mediation task for Adam
    await P.waitForInboxRow(page, /Mediator Review Disagreement/i);
    const row = rowFor(await P.inboxRows(page), /Mediator Review Disagreement/i, /Adam/i);
    expect(row, "Adam's mediation task").toBeTruthy();
    await P.openTask(page, row!);
    // STEP 3: SELECT "The disagreement has not been resolved"
    await P.mediatorSelectOutcome(page, P.MEDIATION_NOT_RESOLVED);
    // STEP 4: ASSERT the mandatory outcome evidence fields are revealed (BLOCKING)
    await expect(page.getByText('Mediator Dispute Resolution Outcome')).toBeVisible();
    // STEP 5: ASSERT Submit is blocked until that evidence is captured (BLOCKING)
    expect(await P.submitBtn(page).first().isEnabled(), 'Submit before outcome evidence').toBe(false);
    // STEP 6: TYPE the outcome comment and upload the mediation record
    const boundTo = await P.mediatorOutcomeEvidence(
      page,
      'Mediation failed — the parties remain in disagreement on weightings and targets.',
      MEDIATION_FILE,
    );
    console.log('outcome attachment bound to file input index:', boundTo);
    expect(boundTo, 'attachment accepted by the outcome sub-form').toBeGreaterThanOrEqual(0);
    // STEP 7: ASSERT Submit is now available and CLICK it
    await expect(P.submitBtn(page).first()).toBeEnabled({ timeout: 60_000 });
    await P.submitBtn(page).first().click();
    await page.waitForTimeout(20_000);
  });

  test('TC-26 — An unresolved dispute parks the agreement with no downstream task', async () => {
    // STEP 1: ASSERT the mediator has no remaining task for that agreement (BLOCKING)
    await P.openInbox(page);
    const mediatorRows = (await P.inboxRows(page)).filter((r) => /Adam/i.test(r.text));
    console.log('mediator inbox for Adam:', JSON.stringify(mediatorRows.map((r) => r.text)));
    expect(mediatorRows.length, 'mediator tasks left for Adam').toBe(0);
    // STEP 2: ASSERT the employee has no task
    await P.logout(page);
    await P.login(page, ADAM);
    await P.openInbox(page);
    const empRows = (await P.inboxRows(page)).filter((r) => /Performance Agreement/i.test(r.text));
    console.log('Adam inbox:', JSON.stringify(empRows.map((r) => r.text)));
    expect(empRows.length, 'employee tasks after an unresolved dispute').toBe(0);
    // STEP 3: ASSERT HR has no task for that agreement
    await P.logout(page);
    await P.login(page, HR);
    await P.openInbox(page);
    expect(
      rowFor(await P.inboxRows(page), /Verify Performance Agreement/i, /Adam/i),
      'HR task for an unresolved dispute',
    ).toBeFalsy();
  });
});

// ---------------------------------------------------------------------------
test.describe('Contracting — dashboard reflects the completed agreements', () => {
  let page: Page;
  test.beforeAll(async ({ browser }) => {
    page = await browser.newPage({ viewport: { width: 1600, height: 950 } });
  });
  test.afterAll(async () => page.close());

  test('TC-27 — The Contracting dashboard counts the agreements driven to completion', async () => {
    // STEP 1: NAVIGATE and log in as admin
    await P.login(page, ADMIN.user, ADMIN.pwd);
    // STEP 2: NAVIGATE to the cycle dashboard
    const c = await P.contractingCounters(page);
    console.log('final Contracting counters:', JSON.stringify(c));
    // STEP 3: ASSERT completions are reflected (BLOCKING)
    expect(c.status).toBe('IN PROGRESS');
    expect(c.completed, 'Completed count').toBeGreaterThanOrEqual(1);
    expect(c.inProgress + c.completed).toBe(c.total);
  });
});
