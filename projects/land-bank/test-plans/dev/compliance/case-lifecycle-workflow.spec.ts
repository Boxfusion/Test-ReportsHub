// AUTO-RECORDED from test-plans/dev/compliance/case-lifecycle-workflow.md
// The .md plan is canonical. AI-repair will patch failing lines in this file.
// Do not hand-edit unless you are also updating the .md plan.
//
// ⚠️ THIS SPEC CHANGES DATA. It picks up, escalates, de-escalates and SIGNS OFF a real Dev case,
// and sends a second case back to frontline. Sign-off is irreversible (the app: "Sign-off locks the
// case and generates the AML/compliance report… immutable"). Each run consumes two cases that are
// unassigned and Awaiting Compliance Review.
//
// Selectors recorded live against Dev as the COMPLIANCE role on 2026-08-24, with every transition
// actually performed:
//   - The Cases grid has no per-row detail link. Cell 0 holds an `expand-alt` icon inside
//     `a.sha-link`; clicking it SELECTS the row and reveals a Pick Up / Open / Assign toolbar.
//   - Dialogs are [role="dialog"], NOT .ant-modal-wrap — a .ant-modal-wrap locator finds nothing
//     and makes these look like no-dialog actions that fired instantly. They do not fire until the
//     confirm button is clicked (verified: three dialogs opened, nothing transitioned).
//   - Toolbar buttons disable while ANY dialog is open, so never assert a disabled state without
//     first confirming no dialog is up.
//   - On an escalated case, Escalate is replaced by `De-Escalate` (capital E).
//   - De-escalation returns the decision to `Awaiting Compliance Review` with status `In Progress`
//     — NOT `Returned for Compliance Review`. Verified, not assumed.

import { test, expect, Page } from '@playwright/test';

const ROUTES = {
  cases: '/dynamic/LandBank.Crm/lbService-requests',
  caseDetails: '/dynamic/Boxfusion.ServiceManagement/case-request-details',
};

// Cases grid column order, recorded from the header row.
const COL = { decision: 3, assignedTo: 7, reportedBy: 8, description: 9, status: 10 };

function credsFor(role: string) {
  const key = role.toUpperCase();
  const env = (process.env.TEST_ENV || '').toUpperCase();
  const pick = (suffix: string) =>
    (env ? process.env[`${env}_${key}_${suffix}`] : undefined) ?? process.env[`${key}_${suffix}`];
  const user = pick('USERNAME');
  const password = pick('PASSWORD');
  if (!user || !password) {
    throw new Error(
      `Missing credentials for role "${role}"${env ? ` in environment "${env}"` : ''}. Set ` +
      `${env ? `${env}_${key}_USERNAME / ${env}_${key}_PASSWORD` : `${key}_USERNAME / ${key}_PASSWORD`} ` +
      `in .env (copy .env.example) or as CI secrets — see CLAUDE.md → Credentials.`
    );
  }
  return { user, password };
}

async function loginAsCompliance(page: Page) {
  const { user, password } = credsFor('COMPLIANCE');
  await page.goto('/login');
  await page.getByPlaceholder('Username').fill(user);
  await page.getByPlaceholder('Password').fill(password);
  await page.getByRole('button', { name: 'Sign In', exact: true }).click();
  await page.waitForURL((url) => !url.href.includes('/login'), { timeout: 45000 });
  await page.waitForLoadState('networkidle').catch(() => {});
}

async function gotoCases(page: Page) {
  await page.goto(ROUTES.cases);
  await page.waitForLoadState('networkidle').catch(() => {});
  // The grid populates well after load on Dev; wait for real data rows, not just the header.
  await expect(page.locator('[role="row"]').nth(1)).toBeVisible({ timeout: 45000 });
}

type CaseRow = { index: number; ref: string; reportedBy: string; status: string };

// Finds a freshly received case: Awaiting Compliance Review, unassigned, AND status New.
//
// Status New is part of the filter, not a bonus check. "Awaiting Compliance Review + unassigned" is
// also true of a case that was previously worked and released — a de-escalated case comes back as
// Awaiting Compliance Review with status `In Progress` and no assignee, and picking that up would
// start the journey mid-lifecycle. Requiring New selects a genuine RM hand-off.
//
// `skipRefs` lets the send-back branch pick a DIFFERENT case from the one the sign-off journey
// already consumed.
async function findEligibleCase(page: Page, skipRefs: string[] = []): Promise<CaseRow> {
  // Pages through the grid rather than giving up after page 1. The grid sorts newest-first and this
  // plan CONSUMES cases, so repeated runs strip page 1 of eligible rows while plenty remain deeper
  // in (Dev had 139 pending across 18 pages). Failing on page 1 alone reported "no eligible case"
  // when there were dozens.
  const MAX_PAGES = 6;
  for (let pageNo = 1; pageNo <= MAX_PAGES; pageNo++) {
    const rows = page.locator('[role="row"]');
    const count = await rows.count();
    for (let i = 1; i < count; i++) {
      const cells = rows.nth(i).locator('[role="cell"]');
      const decision = (await cells.nth(COL.decision).innerText().catch(() => '')).trim();
      const assigned = (await cells.nth(COL.assignedTo).innerText().catch(() => '')).trim();
      const status = (await cells.nth(COL.status).innerText().catch(() => '')).trim();
      const description = (await cells.nth(COL.description).innerText().catch(() => '')).trim();
      const ref = (description.match(/LA-\d{4}-\d+/) || [])[0] || '';
      if (!/Awaiting Compliance Review/i.test(decision)) continue;
      if (!/^New$/i.test(status)) continue;
      if (assigned.length > 0) continue;
      if (!ref || skipRefs.includes(ref)) continue;
      return {
        index: i,
        ref,
        reportedBy: (await cells.nth(COL.reportedBy).innerText().catch(() => '')).trim(),
        status,
      };
    }
    // Nothing on this page — advance if there is a next page.
    const next = page.getByRole('listitem', { name: 'Next Page' }).first();
    const nextButton = next.locator('button');
    if (!(await next.count()) || await nextButton.isDisabled().catch(() => true)) break;
    await next.click();
    await page.waitForTimeout(3500);
    await page.waitForLoadState('networkidle').catch(() => {});
  }
  throw new Error(
    'No eligible case found in the first ' + MAX_PAGES + ' pages of the Cases grid: needs Compliance ' +
    'Decision "Awaiting Compliance Review", Status "New" and an empty Assigned To' +
    `${skipRefs.length ? ` (excluding ${skipRefs.join(', ')})` : ''}. ` +
    'This plan consumes two such cases per run, so a long series of runs can exhaust the supply.'
  );
}

// Selecting a row is what reveals the Pick Up / Open / Assign toolbar.
async function selectRow(page: Page, index: number) {
  await page.locator('[role="row"]').nth(index).locator('a.sha-link').first().click();
  await expect(page.getByRole('button', { name: 'Pick Up' })).toBeVisible({ timeout: 25000 });
}

// Clicking **Open** on a selected row opens the case in a NEW BROWSER TAB — the current page never
// navigates, so a plain waitForURL on it times out. Same behaviour as the dashboard's "Open case".
// Returns whichever page ends up showing the case detail, so callers can keep working on it.
async function openSelectedCase(from: Page): Promise<Page> {
  const [popup] = await Promise.all([
    from.context().waitForEvent('page', { timeout: 15000 }).catch(() => null),
    from.getByRole('button', { name: 'Open', exact: true }).click(),
  ]);
  const target = popup ?? from;
  await target.waitForURL((u) => u.pathname === ROUTES.caseDetails, { timeout: 45000 });
  await target.waitForLoadState('networkidle').catch(() => {});
  return target;
}

// The Escalate button's accessible name is "flag Escalate" — icon glyph plus label — so
// { name: 'Escalate', exact: true } matches nothing. Plain substring 'Escalate' is no good either:
// it also matches "De-Escalate". This anchors on a word boundary before "Escalate" at the end of the
// name, which "De-Escalate" fails because its preceding character is a hyphen, not whitespace.
const ESCALATE = /(^|\s)Escalate$/;

// Dialogs render as [role="dialog"] with no .ant-modal-wrap, so they are matched on their own text.
function dialogWith(page: Page, text: RegExp | string) {
  return page.locator('[role="dialog"]').filter({ hasText: text }).first();
}

async function caseHeaderText(page: Page): Promise<string> {
  await expect(page.getByText(/Case Details LA-/).first()).toBeVisible({ timeout: 45000 });
  return (await page.locator('body').innerText()).replace(/\s+/g, ' ');
}

// Opens the Audit Log and returns its rendered text.
//
// Two traps here. The trigger is an icon-only button whose clock glyph is its only handle. And the
// dialog matched by "Audit Log" is the modal SHELL — its own innerText is just "Audit Log CancelOK"
// while the entry grid loads asynchronously into a nested element. So this waits for real content
// (the Change Type column) before reading, and reads the dialog that actually HAS the content
// rather than the first one whose title matches.
async function openAuditLogText(page: Page): Promise<string> {
  await page.locator('button:has(.anticon-field-time)').first().click();

  // Waiting for the "Change Type" header is NOT enough: the column headers render while the grid
  // still shows "loading...", so the text read back contained no entries at all. Poll until a real
  // dated entry ("24 Aug 2026, 10:57") is present.
  const readDialogs = async () => {
    const dialogs = page.locator('[role="dialog"]');
    let best = '';
    for (let i = 0; i < await dialogs.count(); i++) {
      const t = (await dialogs.nth(i).innerText().catch(() => '')).replace(/\s+/g, ' ');
      if (t.length > best.length) best = t;
    }
    return best;
  };
  await expect
    .poll(async () => (/\d{1,2} \w{3} \d{4}, \d{2}:\d{2}/.test(await readDialogs()) ? 'loaded' : 'loading'), {
      message: 'the audit log grid should load at least one dated entry',
      timeout: 60000,
      intervals: [1000, 2000, 3000],
    })
    .toBe('loaded');
  return await readDialogs();
}

async function auditLogDialog(page: Page) {
  return page.locator('[role="dialog"]').filter({ hasText: /Change Type/ }).first();
}

async function closeAnyDialog(page: Page) {
  const cancel = page.locator('[role="dialog"] button', { hasText: /^(Cancel|Close)$/ }).first();
  if (await cancel.count()) await cancel.click().catch(() => {});
  await page.waitForTimeout(1500);
}

// Fills an Ant textarea inside a dialog.
async function fillDialogTextarea(dialog: ReturnType<typeof dialogWith>, value: string) {
  const ta = dialog.locator('textarea').first();
  await expect(ta).toBeVisible({ timeout: 20000 });
  await ta.fill(value);
}

// Picks the first real option from an Ant Select inside a dialog. Ant renders its dropdown in a
// portal at document level, NOT inside the dialog, so the option locator is page-scoped.
async function pickFirstSelectOption(page: Page, dialog: ReturnType<typeof dialogWith>, nth = 0) {
  await dialog.locator('.ant-select-selector').nth(nth).click();
  const option = page.locator('.ant-select-dropdown:visible .ant-select-item-option').first();
  await expect(option, 'the select should offer at least one option').toBeVisible({ timeout: 20000 });
  const label = (await option.innerText()).trim();
  await option.click();
  await page.waitForTimeout(1200);
  return label;
}

// Picks a NAMED option from an Ant Select. Used for Decision Status so the test always records a
// specific, benign outcome. Deliberately not "first option": the Decision Status list includes
// "Confirmed (blocked) - declined by Board/Exco", and an automated test must never be one list
// reorder away from declining a real application.
async function pickSelectOptionNamed(page: Page, dialog: ReturnType<typeof dialogWith>, nth: number, name: string) {
  await dialog.locator('.ant-select-selector').nth(nth).click();
  const option = page.locator('.ant-select-dropdown').locator('.ant-select-item-option', { hasText: name }).first();
  await expect(option, `the select should offer "${name}"`).toBeVisible({ timeout: 20000 });
  await option.click();
  await page.waitForTimeout(1200);
}

// The sign-off dialog's Compliance Declaration checkbox. Ticking it is what enables the submit
// button — without it "Sign off & generate report" stays disabled and the click times out looking
// like a missing button rather than an unmet precondition.
async function acceptComplianceDeclaration(dialog: ReturnType<typeof dialogWith>) {
  const box = dialog.locator('input[type="checkbox"]').first();
  await expect(box, 'the compliance declaration checkbox should be present').toBeAttached({ timeout: 20000 });
  await box.check({ force: true });
}

const SIGN_OFF_DECISION = 'Cleared - no match';

const STAMP = 'Automated QA workflow coverage — DEV-COMP-2.1';

// Serial with a SHARED page: this is one case's journey across ten cases, so state must survive
// from test to test. A fresh page per test would lose the picked-up case and the escalation.
test.describe.configure({ mode: 'serial' });

test.describe('DEV-COMP-2.1 — Compliance Case Lifecycle Workflow (Dev)', () => {
  let page: Page;      // the Cases listing tab
  let casePage: Page;  // the tab showing the case detail (opened by **Open**)
  const journey: { ref?: string; reportedBy?: string; sentBackRef?: string; signOffDecision?: string } = {};

  test.beforeAll(async ({ browser }) => {
    page = await browser.newPage();
    await loginAsCompliance(page);
  });

  test.afterAll(async () => {
    await page.close().catch(() => {});
  });

  test('TC-01: A case received from the RM is waiting for compliance', async () => {
    await gotoCases(page);
    // EXTRACT the first eligible case
    const found = await findEligibleCase(page);
    journey.ref = found.ref;
    journey.reportedBy = found.reportedBy;
    // ASSERT (BLOCKING) at least one such case exists — findEligibleCase throws with a clear
    // message if not, which is the blocking failure.
    expect(found.ref, 'an eligible case reference should have been extracted').toMatch(/^LA-\d{4}-\d+$/);
    // ASSERT its Status is `New`
    expect(found.status).toMatch(/New/i);
    // ASSERT its Description names the originating loan application
    const desc = await page.locator('[role="row"]').nth(found.index).locator('[role="cell"]').nth(COL.description).innerText();
    expect(desc).toMatch(/Compliance review initiated for loan application LA-\d{4}-\d+/i);
    // ASSERT its Reported By names the originating RM
    expect(found.reportedBy.length, 'Reported By should name the originating RM').toBeGreaterThan(0);
  });

  test('TC-02: The audit log shows the case was created when the RM finalised verification', async () => {
    await gotoCases(page);
    const target = await findEligibleCase(page);
    await selectRow(page, target.index);
    casePage = await openSelectedCase(page);
    await caseHeaderText(casePage);

    const text = await openAuditLogText(casePage);
    // ASSERT a `Compliance Case Created` entry exists
    expect(text, 'audit log should record the case creation').toMatch(/Compliance Case Created/);
    // ASSERT an `Application Status Changed` entry records the move out of VerificationInProgress
    expect(text, 'audit log should record the verification hand-off').toMatch(/Application Status Changed/);
    expect(text).toMatch(/VerificationInProgress/);
    // ASSERT the intake entries are attributed to the originating RM, not the compliance user
    expect(text, 'intake entries should name the originating RM').toMatch(
      new RegExp(target.reportedBy.split(' ')[0], 'i'),
    );
    await closeAnyDialog(casePage);
    await casePage.close().catch(() => {});
  });

  test('TC-03: Picking up a case from the Cases listing', async () => {
    await gotoCases(page);
    const target = await findEligibleCase(page);
    journey.ref = target.ref;
    journey.reportedBy = target.reportedBy;
    // STEP: SELECT the eligible case row
    await selectRow(page, target.index);
    // ASSERT the Pick Up / Open / Assign actions appear once a row is selected
    for (const action of ['Pick Up', 'Open', 'Assign']) {
      await expect(
        page.getByRole('button', { name: action, exact: true }),
        `"${action}" should appear once a row is selected`,
      ).toBeVisible({ timeout: 25000 });
    }
    // STEP: CLICK **Pick Up**
    await page.getByRole('button', { name: 'Pick Up', exact: true }).click();
    await page.waitForTimeout(6000);
    await page.waitForLoadState('networkidle').catch(() => {});

    // ASSERT (BLOCKING) the case is now assigned. Re-read the row BY REFERENCE, not by index —
    // picking up re-sorts the grid by Last Modification Time, so the index goes stale.
    await gotoCases(page);
    const row = page.locator('[role="row"]').filter({ hasText: journey.ref! }).first();
    await expect(row, `case ${journey.ref} should still be listed`).toBeVisible({ timeout: 30000 });
    const assigned = (await row.locator('[role="cell"]').nth(COL.assignedTo).innerText()).trim();
    expect(assigned.length, `case ${journey.ref} should be assigned after Pick Up`).toBeGreaterThan(0);
    // Status is deliberately NOT asserted to change here. Pick Up assigns the case but leaves
    // Status as `New` — verified, against the expectation that picking work up would move it to
    // In Progress. The status only advances later in the lifecycle (de-escalation set it to
    // In Progress). Asserting a change here failed against correct behaviour.
  });

  test('TC-04: Opening the picked-up case', async () => {
    await gotoCases(page);
    const row = page.locator('[role="row"]').filter({ hasText: journey.ref! }).first();
    await row.locator('a.sha-link').first().click();
    await expect(page.getByRole('button', { name: 'Open', exact: true })).toBeVisible({ timeout: 25000 });
    casePage = await openSelectedCase(page);
    // ASSERT (BLOCKING) the case detail route with an `id` parameter
    const url = new URL(casePage.url());
    expect(url.pathname).toBe(ROUTES.caseDetails);
    expect(url.searchParams.get('id'), 'case detail URL should carry an id').toBeTruthy();
    // ASSERT the header shows the case reference
    const header = await caseHeaderText(casePage);
    expect(header).toMatch(new RegExp(`Case Details ${journey.ref}: Risk and Compliance`));
    // ASSERT the four workflow actions are displayed
    for (const action of ['Assign', 'Send Back', 'Escalate', 'Sign off case']) {
      await expect(
        casePage.getByRole('button', { name: action }),
        `case action "${action}" should be displayed`,
      ).toBeVisible({ timeout: 25000 });
    }
    // ASSERT the three tabs are displayed
    for (const tab of ['Overview', 'Risk Assessment', 'Documents']) {
      await expect(casePage.getByRole('tab', { name: tab })).toBeVisible({ timeout: 20000 });
    }
  });

  test('TC-05: Adjudicating a flagged case on the Risk Assessment tab', async () => {
    // STEP: CLICK the **Risk Assessment** tab
    await casePage.getByRole('tab', { name: 'Risk Assessment' }).click();
    await casePage.waitForTimeout(7000);
    const body = (await casePage.locator('body').innerText()).replace(/\s+/g, ' ');
    // ASSERT the Risk Rating Tool Outcome section is present with its score/category readouts.
    // The SCORE VALUE is deliberately not asserted: on a freshly received case the risk assessment
    // has not been completed, so System Score and System Category render as empty labels and every
    // questionnaire response is blank. A worked case showed 156. Requiring a number here failed
    // against a page that was behaving correctly for an un-adjudicated case.
    expect(body, 'the risk rating tool outcome should be shown').toMatch(/RISK RATING TOOL OUTCOME/i);
    expect(body, 'the system score readout should be present').toMatch(/System Score/i);
    expect(body, 'the system category readout should be present').toMatch(/System Category/i);
    // ASSERT the questionnaire renders scored indicators
    expect(body, 'the risk questionnaire should render its indicators').toMatch(/Geographical Risk/i);
    // ASSERT the override control is available
    expect(body, 'the risk override control should be available').toMatch(/Override system-calculated risk outcome/i);
    // ASSERT Calculate Risk Score is available. The override is deliberately NOT applied — see the
    // plan's note on TC-05: applying it would feed a manual outcome into the sign-off report later
    // in this same journey.
    await expect(casePage.getByRole('button', { name: 'Calculate Risk Score' })).toBeVisible({ timeout: 25000 });
  });

  test('TC-06: Escalating a case to governance', async () => {
    await casePage.getByRole('tab', { name: 'Overview' }).click();
    await casePage.waitForTimeout(2500);
    // STEP: CLICK **Escalate**
    await casePage.getByRole('button', { name: ESCALATE }).click();
    const dlg = dialogWith(casePage, /Governence Escalation|Summary for forum/);
    await expect(dlg, 'the escalation dialog should open').toBeVisible({ timeout: 30000 });
    // ASSERT the dialog shows the Forum and Summary for forum fields
    const dlgText = (await dlg.innerText()).replace(/\s+/g, ' ');
    expect(dlgText).toMatch(/Forum/);
    expect(dlgText).toMatch(/Summary for forum/);
    // STEP: TYPE a summary
    await fillDialogTextarea(dlg, `${STAMP} — escalated to Board for governance review.`);
    // STEP: CLICK **Escalate & place on hold**
    await dlg.getByRole('button', { name: 'Escalate & place on hold' }).click();
    await casePage.waitForTimeout(12000);
    await casePage.waitForLoadState('networkidle').catch(() => {});

    const header = await caseHeaderText(casePage);
    // ASSERT (BLOCKING) the status becomes On Hold
    expect(header, 'case status should become On Hold after escalation').toMatch(/ON HOLD/i);
    // ASSERT the decision records the Board/Exco escalation. Matched loosely: the dialog copy uses
    // an en-dash ("under review) – escalated") while the filter vocabulary uses a hyphen.
    expect(header, 'decision should record the Board/Exco escalation').toMatch(
      /CONFIRMED \(UNDER REVIEW\)[^A-Z]*ESCALATED TO BOARD\/EXCO/i,
    );
    // ASSERT Escalate is replaced by De-Escalate
    await expect(casePage.getByRole('button', { name: 'De-Escalate' })).toBeVisible({ timeout: 30000 });
  });

  test('TC-07: De-escalating the case releases it from hold', async () => {
    // STEP: CLICK **De-Escalate**
    await casePage.getByRole('button', { name: 'De-Escalate' }).click();
    const dlg = dialogWith(casePage, /Reason for de-escalation|De-escalating/);
    await expect(dlg, 'the de-escalation dialog should open').toBeVisible({ timeout: 30000 });
    // ASSERT the dialog shows the Reason for de-escalation field
    expect((await dlg.innerText()).replace(/\s+/g, ' ')).toMatch(/Reason for de-escalation/);
    // STEP: TYPE a reason
    await fillDialogTextarea(dlg, `${STAMP} — Board noted the outcome; released from On Hold.`);
    // STEP: CLICK **De-escalate & release**
    await dlg.getByRole('button', { name: 'De-escalate & release' }).click();
    await casePage.waitForTimeout(12000);
    await casePage.waitForLoadState('networkidle').catch(() => {});

    const header = await caseHeaderText(casePage);
    // ASSERT (BLOCKING) the case is released from hold
    expect(header, 'case should no longer be On Hold').not.toMatch(/ON HOLD/i);
    expect(header, 'status should become In Progress after de-escalation').toMatch(/IN PROGRESS/i);
    // ASSERT the decision returns to Awaiting Compliance Review. This is VERIFIED behaviour, not an
    // assumption: de-escalation does NOT set "Returned for Compliance Review", which is a separate
    // state reached elsewhere in the vocabulary.
    expect(header, 'decision should return to Awaiting Compliance Review').toMatch(/AWAITING COMPLIANCE REVIEW/i);
    // ASSERT De-Escalate is replaced by Escalate again
    await expect(casePage.getByRole('button', { name: ESCALATE })).toBeVisible({ timeout: 30000 });
  });

  test('TC-08: The audit log records the escalation and de-escalation', async () => {
    const text = await openAuditLogText(casePage);
    // ASSERT the escalation / de-escalation / decision entries exist
    expect(text, 'audit log should record the escalation').toMatch(/Case Escalated to Governance/);
    expect(text, 'audit log should record the de-escalation').toMatch(/Case De-escalated from Governance/);
    expect(text, 'audit log should record the captured decision').toMatch(/Decision Captured/);
    // ASSERT the Escalation History tab is available
    await expect((await auditLogDialog(casePage)).getByRole('tab', { name: 'Escalation History' }))
      .toBeVisible({ timeout: 20000 });
    await closeAnyDialog(casePage);
  });

  test('TC-09: Finalising a case by signing it off', async () => {
    // STEP: CLICK **Sign off case**
    await casePage.getByRole('button', { name: 'Sign off case' }).click();
    const dlg = dialogWith(casePage, /Compliance Recommendation Sign Off|Sign-off locks the case/);
    await expect(dlg, 'the sign-off dialog should open').toBeVisible({ timeout: 30000 });
    const dlgText = (await dlg.innerText()).replace(/\s+/g, ' ');
    // ASSERT the dialog shows Decision Status and Rationale, and states the report is immutable
    expect(dlgText).toMatch(/Decision Status/);
    expect(dlgText).toMatch(/Rationale/);
    expect(dlgText, 'the dialog should state the report is immutable').toMatch(/immutable/i);
    // ASSERT the declaration text is shown — sign-off is an attestation, not just a status change
    expect(dlgText, 'the compliance declaration should be shown').toMatch(/Compliance Declaration/i);
    // STEP: SELECT a Decision Status (named explicitly — see pickSelectOptionNamed)
    await pickSelectOptionNamed(casePage, dlg, 0, SIGN_OFF_DECISION);
    journey.signOffDecision = SIGN_OFF_DECISION;
    // STEP: TYPE a Rationale
    await fillDialogTextarea(dlg, `${STAMP} — finalised by automated lifecycle test.`);
    // STEP: tick the Compliance Declaration. This is a REQUIRED precondition: until it is ticked,
    // "Sign off & generate report" is disabled.
    await acceptComplianceDeclaration(dlg);
    const submit = dlg.getByRole('button', { name: 'Sign off & generate report' });
    // ASSERT the declaration gates submission — the button only enables once it is accepted
    await expect(submit, 'sign-off should be enabled once the declaration is accepted').toBeEnabled({ timeout: 20000 });
    // STEP: CLICK **Sign off & generate report**
    await submit.click();
    await casePage.waitForTimeout(15000);
    await casePage.waitForLoadState('networkidle').catch(() => {});

    const header = await caseHeaderText(casePage);
    // ASSERT (BLOCKING) the case status becomes Signed Off
    expect(header, 'case status should become Signed Off after sign-off').toMatch(/SIGNED OFF/i);
    // ASSERT the decision reflects the chosen decision status
    expect(header, `decision should record "${SIGN_OFF_DECISION}"`).toMatch(/CLEARED - NO MATCH/i);
    await casePage.close().catch(() => {});
  });

  test('TC-10: Sending a case back to frontline', async () => {
    // A SECOND case: send-back and sign-off are competing terminal transitions and a signed-off
    // case is locked, so this branch must not reuse the journey case.
    await gotoCases(page);
    const target = await findEligibleCase(page, [journey.ref!]);
    journey.sentBackRef = target.ref;
    await selectRow(page, target.index);
    const sendBackPage = await openSelectedCase(page);
    await caseHeaderText(sendBackPage);

    // STEP: CLICK **Send Back**
    await sendBackPage.getByRole('button', { name: 'Send Back' }).click();
    const dlg = dialogWith(sendBackPage, /Send back to frontline/);
    await expect(dlg, 'the send-back dialog should open').toBeVisible({ timeout: 30000 });
    const dlgText = (await dlg.innerText()).replace(/\s+/g, ' ');
    // ASSERT the dialog shows Recipient, Reason and Details / Instructions
    expect(dlgText).toMatch(/Recipient/);
    expect(dlgText).toMatch(/Reason/);
    expect(dlgText).toMatch(/Details \/ Instructions/);
    // STEP: SELECT a Reason and TYPE Details / Instructions
    await pickFirstSelectOption(sendBackPage, dlg, 0);
    await fillDialogTextarea(dlg, `${STAMP} — returned to frontline for outstanding items.`);
    // STEP: CLICK **Send Back**
    await dlg.getByRole('button', { name: 'Send Back', exact: true }).click();
    await sendBackPage.waitForTimeout(15000);
    await sendBackPage.waitForLoadState('networkidle').catch(() => {});

    // ASSERT (BLOCKING) the compliance decision becomes Referred to Frontline
    const header = await caseHeaderText(sendBackPage);
    expect(header, 'decision should become Referred to Frontline').toMatch(/REFERRED TO FRONTLINE/i);
    await sendBackPage.close().catch(() => {});
  });
});
