// AUTO-RECORDED from test-plans/workflow/loan-application-workflow-stages.md
// The .md plan is canonical. AI-repair will patch failing lines in this file.
// Do not hand-edit unless you are also updating the .md plan.
//
// Recorded live against Land Bank CRM Dev on 2026-08-05 as the RM role, driving LA2026/14392
// (from OPP-2026-001244) from initiation through to Confirm verification outcomes.
//
// THE INBOX IS THE ONLY WORKFLOW SURFACE. Sent Items / My Items / Drafts are OUT OF SCOPE — they
// are not how users interact with workflow items. Every stage advance is asserted by RE-READING THE
// INBOX after the action, never from a history view.
//
// STAGE MODEL (LoanApplicationStatus reference list, read from the app's own API):
//   1 Draft | 2 Resolution Pending | 3 Consent Pending | 4 Verification In Progress
//   5 Pre-Onboarding | 6 Complete | 7 Withdrawn | 8 Declined
//   9 Terminated - Consent Not Provided | 10 Terminated - Failed Verification
//   11 Sent Back | 12 Blocked  <-- OUT OF SCOPE, per instruction
//
// THE CONSENT STAGE IS MANDATORY, NEVER SKIPPED:
//   PERSONAL -> "Upload Individual Consent"   ENTITY -> "Upload Entity Consent"
//   Lead Channel decides WHERE consent is captured, not WHETHER:
//     Online Digital Channel -> captured in-workflow, so the stage is outstanding in the Inbox
//     Landbank Branch        -> captured UPFRONT at lead capture, so the stage arrives satisfied
//   Verified: LA2026/14392 (ENTITY, Online Digital Channel) initiated straight into
//   CONSENT PENDING / Upload Entity Consent.
//
// CONSENT STAGE MECHANICS (Upload Resolution / Upload Entity Consent / Upload Individual Consent) —
// two routes that may run simultaneously:
//   ELECTRONIC (OTP): one panel per approver (lb-entity-manual-consent v13) with a status chip
//     (NOTIFICATION SENT on arrival), Date Sent, Date Signed, and a Download ...Consent Document
//     link. If ALL required approvers sign electronically the workflow advances on its own with NO
//     Submit — but the Inbox needs a PAGE REFRESH + re-navigation before the change is visible.
//   MANUAL UPLOAD: each panel exposes "Upload Consent Document" (required). If ANY manual upload is
//     done, the declaration checkbox must be ticked and Submit clicked.
//     RECORDED: the Submit button is NOT RENDERED AT ALL until the declaration is ticked; ticking it
//     reveals Submit; clicking Submit REDIRECTS BACK TO THE INBOX.
//     Declaration text: "I confirm that the manual override of uploading the consent form(s) is
//     intentional" — the checkbox has NO label[for]; it is the only ENABLED .ant-checkbox-wrapper on
//     the step (every mirrored read-only checkbox is disabled).
//   Required approvers for Upload Entity Consent = the SIGNATORIES (directors/shareholders are shown
//   for context only). For Upload Individual Consent = main applicant + spouse/surety/co-applicant.
//
// CONFIRM VERIFICATION OUTCOMES (loan-application-wf-confirm-verification-outcomes v89):
//   lists EVERY party captured on the Opportunity, plus the ENTITY itself for entity applications:
//     check-loan-application-verifications v42  -> the company/entity
//     signatory-new-list v12                    -> Signatories
//     director-verifications-datalist v4        -> Directors
//     participant-verifications-datalist v4     -> Shareholders / participants
//   Page actions: "Finalise Verification Outcomes", "Flag As High Risk".
//   Each party has a status button (recorded label "Awaiting Review") opening its dialog.
//   ENTITY dialog (entity-application-verification-details-details v23): tabs Overview / CIPC /
//   Compliance, a Verification Summary, and on CIPC the submitted-vs-returned comparison plus
//   `cipcVerification_companyNameReviewDecision` = Approve | Reject. It has a decision + CLOSE only —
//   NO Submit.
//   PERSON dialog (main-applicant-verification-details v15, recorded 2026-08-11): tabs Overview /
//   ID Verification / KYC Verification. The ID Verification tab carries the manual decision
//   `idVerification_firstNameReviewDecision` = Approve | Reject, with the conditional rejection
//   reason `hanisVerification_reviewReason` ("Rationale") HIDDEN until Reject is chosen and then
//   REQUIRED. Submit is disabled until a decision is chosen and SAVES WITHOUT CLOSING; Close then
//   dismisses. See ID_VERIFICATION below.
//   NOTE: both dialogs have TWO elements named "Close" (modal x + toolbar button) -> use
//   button.sha-toolbar-btn.
//   FINDING: a party's status does NOT resolve on the ID decision alone — it stays "Awaiting Review"
//   with Outcome TBD until its KYC / Photo / Compliance verifications also resolve.
//
// COMPLETE ONBOARDING CHECKLIST (complete-pre-onboarding-checklist v16):
//   subForm1_yearsOfFarmingExperience is a NUMBER field, not a checkbox.
//   THE CONDITIONAL (verified both ways): subForm1_requiresWaterRightsSupport
//   ("Support with applying for water rights required?") is HIDDEN until
//   subForm1_requiresWaterUseRights ("Does this operation require Water Use Rights?") is ticked, and
//   DEFAULTS TO TICKED on reveal. Unticking the parent hides it again.
//   subForm2_* is a mirrored read-only group.
//
// OTHER STRUCTURAL FACTS:
//   - Inbox rows are ordered NEWEST Received Date FIRST, so a freshly initiated application is row 1.
//   - Ref No format LA<yyyy>/<nnnnn>. The `todoid` CHANGES at every stage transition while the
//     instance `id` stays the same -> always re-open a stage from the Inbox, never a stored URL.
//   - Workflow action page header: "<Stage Name>: <Account/Entity>", chip IN PROGRESS,
//     "Ref No: <ref>", plus a read-only embedded loan application (opportunity-loan-application v229).
//   - Add Director / Add Shareholder / Add Signatory are present but DISABLED once the workflow runs.
//   - Ant Design: fields anchored on <label for> via a DIRECT-CHILD chain; conditionals hidden with
//     `ant-form-item-hidden`; options matched on `title` in the open dropdown; action buttons carry
//     their icon in the accessible name; rc-tabs-* ids are NOT stable across loads.
//
// DEFECTS
//   BUG-LB-001: InitiateLoanApplicationWorkflow returns business validation as HTTP 500 and the UI
//     discards the message. Gates recorded: missing mandatory documents -> product required ->
//     business summary required -> director marital status required -> DivorceDecreeOrAncAgreement.
//     All were fixable and the workflow then initiated. Wrong status code + no user-facing message.
//   BUG-LB-005 (replaces the withdrawn BUG-LB-004): on the participant page an EMPTY Vat Number
//     raises "Field validation error for Vat Number" on a field the RM was not editing, with no
//     summary / scroll-to-error / toast, and the form never submits — it reads as "Save is broken".
//     Filling Vat Number made the same save succeed (PUT .../ApplicationParticipant/Crud/Update ->
//     200, "maritalStatus":1) and the value persisted. Marital Status itself is fine.

import { test, expect, Page, Locator } from '@playwright/test';
import path from 'path';

// Environment & credentials come from process.env, loaded from a gitignored .env by
// playwright.config.ts (real env vars / CI secrets always win). NEVER hardcode a
// username, password, or token here — this file is committed and synced to the hub.

const INBOX_PATH = '/dynamic/Shesha.Workflow/workflows-inbox';
const OPPS_PATH = '/dynamic/LandBank.Crm/LBOpportunity-table';
const OPP_DETAILS_PATH = '/dynamic/LandBank.Crm/LBOpportunity-details';
const WF_ACTION_PATH = '/shesha/workflow-action';

const TEST_DOC = path.resolve(process.cwd(), 'test-data/pdf-test.pdf');
const TEST_DOC_NAME = 'pdf-test.pdf';

const LONG = 60000;

const STAGES = {
  resolution: 'Upload Resolution',
  entityConsent: 'Upload Entity Consent',
  individualConsent: 'Upload Individual Consent',
  verification: 'Confirm verification outcomes',
  onboarding: 'Complete Onboarding Checklist',
} as const;

const ALL_STAGES: string[] = Object.values(STAGES);
const CONSENT_STAGES: string[] = [STAGES.entityConsent, STAGES.individualConsent];

const STATUS = {
  draft: 'Draft',
  resolutionPending: 'Resolution Pending',
  consentPending: 'Consent Pending',
  verificationInProgress: 'Verification In Progress',
  preOnboarding: 'Pre-Onboarding',
  complete: 'Complete',
  withdrawn: 'Withdrawn',
  declined: 'Declined',
  terminatedConsent: 'Terminated - Consent Not Provided',
  terminatedVerification: 'Terminated - Failed Verification',
  sentBack: 'Sent Back',
} as const;

const STATUS_TO_ACTION: Array<{ status: string; actions: string[] }> = [
  { status: STATUS.resolutionPending, actions: [STAGES.resolution] },
  { status: STATUS.consentPending, actions: CONSENT_STAGES },
  { status: STATUS.verificationInProgress, actions: [STAGES.verification] },
  { status: STATUS.preOnboarding, actions: [STAGES.onboarding] },
];

const NO_ACTION_STATUSES: string[] = [
  STATUS.draft, STATUS.complete, STATUS.withdrawn, STATUS.declined,
  STATUS.terminatedConsent, STATUS.terminatedVerification, STATUS.sentBack,
];

/**
 * The two consent stages use DIFFERENT forms, field prefixes, declaration wording and Submit
 * behaviour — recorded live on LA2026/14392 (entity) and LA2026/14623 (individual).
 */
const CONSENT_STAGE_SHAPE = {
  [STAGES.entityConsent]: {
    stepForm: 'loan-application-wf-manual-upload-entity-consent',
    approverForm: 'lb-entity-manual-consent',
    dateSentField: 'creationTime',
    downloadField: 'blankApproval',
    uploadField: 'manualApproval',
    uploadLabel: 'Upload Consent Document',
    downloadLabel: 'Download Entity Consent Document',
    notificationChip: 'NOTIFICATION SENT',
    declaration: 'I confirm that the manual override of uploading the consent form(s) is intentional',
    /** entity: Submit is NOT RENDERED until the declaration is ticked */
    submitBeforeDeclaration: 'absent' as const,
  },
  [STAGES.individualConsent]: {
    stepForm: 'lb-manual-upload-consent',
    approverForm: 'lb-manual-consent-sub-form',
    dateSentField: 'subForm2_creationTime',
    downloadField: 'subForm2_blankApproval',
    uploadField: 'subForm2_manualApproval',
    uploadLabel: 'Upload Signed Consent Document',
    downloadLabel: 'Download Consent Document',
    notificationChip: 'Notification Sent',
    declaration: 'I confirm that the manual consent is intentional',
    /** individual: Submit IS rendered but DISABLED until the declaration is ticked */
    submitBeforeDeclaration: 'disabled' as const,
  },
} as const;

/** Per-person verification dialog (main-applicant-verification-details v15), recorded 2026-08-11. */
const ID_VERIFICATION = {
  dialogForm: 'main-applicant-verification-details',
  tabs: ['Overview', 'ID Verification', 'KYC Verification'],
  summaryRows: ['ID Verification', 'KYC Verification Status', 'Photo Verification Status', 'Compliance Status'],
  submitted: ['idVerification_firstNameSubmitted', 'idVerification_lastNameSubmitted', 'idVerification_idNumberSubmitted'],
  checks: ['idVerification_nameMatchStatus', 'idVerification_idNumberMatchStatus', 'idVerification_deathCheckStatus', 'idVerification_outcome'],
  report: 'idVerification_pdfReport',
  reasonForFailure: 'idVerification_reasonForFailure',
  /** The RM's manual decision. */
  decision: 'idVerification_firstNameReviewDecision',
  decisionOptions: ['Approve', 'Reject'],
  /** Conditional rejection reason — hidden until Reject is chosen, then required. */
  rationale: 'hanisVerification_reviewReason',
} as const;

/** The onboarding checklist, with the verbatim question text recorded live. */
const CHECKLIST = {
  yearsOfFarmingExperience: { field: 'subForm1_yearsOfFarmingExperience', text: 'Years Of Farming Experience', kind: 'number' },
  requiresWaterUseRights: { field: 'subForm1_requiresWaterUseRights', text: 'Does this operation require Water Use Rights?', kind: 'checkbox' },
  requiresWaterRightsSupport: { field: 'subForm1_requiresWaterRightsSupport', text: 'Support with applying for water rights required?', kind: 'checkbox' },
  requiresBusinessPlanSupport: { field: 'subForm1_requiresBusinessPlanSupport', text: 'Business Plan Development Support required?', kind: 'checkbox' },
  hasWorkingEquipment: { field: 'subForm1_hasWorkingEquipment', text: 'Is there access to working Equipment and Mechanization?', kind: 'checkbox' },
  hasValidTaxClearance: { field: 'subForm1_hasValidTaxClearance', text: 'Does the client have a Valid Tax Clearance certificate?', kind: 'checkbox' },
  hasAccessToMarkets: { field: 'subForm1_hasAccessToMarkets', text: 'Does the client have access to established markets?', kind: 'checkbox' },
  maintainsFormalFinancialRecords: { field: 'subForm1_maintainsFormalFinancialRecords', text: 'Formal Financial Records or Statements maintained?', kind: 'checkbox' },
  hasIdentifiedMentor: { field: 'subForm1_hasIdentifiedMentor', text: 'Does the client have an actively engaged Mentor?', kind: 'checkbox' },
  isCompliantWithLaborLaws: { field: 'subForm1_isCompliantWithLaborLaws', text: 'Is the client Compliant with all applicable Labor Laws?', kind: 'checkbox' },
} as const;

const REF_NO_PATTERN = /^LA\d{4}\/\d+$/;

function credsFor(role: string) {
  const key = role.toUpperCase();
  const user = process.env[`${key}_USERNAME`];
  const password = process.env[`${key}_PASSWORD`];
  if (!user || !password) {
    throw new Error(
      `Missing credentials for role "${role}". Set ${key}_USERNAME and ${key}_PASSWORD ` +
      `in .env (copy .env.example) or as CI secrets — see CLAUDE.md → Credentials.`
    );
  }
  return { user, password };
}

async function loginAs(page: Page, role: string = 'RM') {
  const { user, password } = credsFor(role);
  await page.goto('/login');
  // STEP login.1: TYPE the Username field with the RM username (from `.env`)
  await page.getByRole('textbox', { name: 'Username' }).fill(user);
  // STEP login.2: TYPE the Password field with the RM password (from `.env`)
  await page.getByRole('textbox', { name: 'Password' }).fill(password);
  // STEP login.3: CLICK **Sign In**
  await page.getByRole('button', { name: 'Sign In', exact: true }).click();
  // STEP login.4: WAIT for the app to redirect away from `/login`
  await page.waitForURL((url) => !url.href.includes('/login'), { timeout: LONG });
  await page.waitForLoadState('networkidle').catch(() => {});
}

const main = (page: Page) => page.locator('main');
const modal = (page: Page) => page.locator('.ant-modal-content');

// FRAGILE: Ant Design form items expose no id / data-testid; the only stable anchor is
// <label for="<fieldName>">, matched through a direct-child chain so ancestor form items in these
// deeply nested Shesha forms are not also matched.
function field(scope: Page | Locator, name: string): Locator {
  return scope.locator(
    `.ant-form-item:has(> .ant-row > .ant-col.ant-form-item-label > label[for="${name}"])`
  );
}

async function expectFieldShown(scope: Page | Locator, name: string) {
  await expect(field(scope, name)).not.toHaveClass(/ant-form-item-hidden/, { timeout: LONG });
}
async function expectFieldHidden(scope: Page | Locator, name: string) {
  await expect(field(scope, name)).toHaveClass(/ant-form-item-hidden/, { timeout: LONG });
}

function openOption(page: Page, title: string): Locator {
  return page.locator(
    `.ant-select-dropdown:not(.ant-select-dropdown-hidden) .ant-select-item-option[title="${title}"]`
  );
}

async function selectOption(scope: Page | Locator, page: Page, name: string, option: string) {
  await field(scope, name).locator('.ant-select-selector').click();
  await openOption(page, option).click();
}

/** Read the Inbox (or Opportunities) grid as rows of cell strings. */
async function readGrid(page: Page): Promise<string[][]> {
  return main(page).locator('div[role="row"]').evaluateAll((rows) =>
    rows
      .map((r) => Array.from(r.querySelectorAll('[role="cell"]')).map((c) => (c.textContent || '').trim()))
      .filter((cells) => cells.length > 0)
  );
}

/** Inbox columns recorded live. */
const INBOX = { refNo: 1, initiator: 2, type: 3, name: 4, action: 5, received: 6 } as const;
/** Opportunities grid columns recorded live. */
const OPP = { appNo: 4, status: 6 } as const;

async function openInbox(page: Page) {
  await page.getByRole('link', { name: 'Inbox', exact: true }).click();
  await page.waitForURL(new RegExp(INBOX_PATH.replace(/\./g, '\\.')), { timeout: LONG });
  await page.waitForLoadState('networkidle').catch(() => {});
  await expect(page.getByRole('heading', { name: 'Incoming Items' })).toBeVisible({ timeout: LONG });
}

/**
 * The consent stages advance the workflow, which changes the `todoid`. After any advance the Inbox
 * must be re-read — a stored workflow-action URL becomes stale.
 */
async function inboxActionFor(page: Page, refNo: string): Promise<string | undefined> {
  await openInbox(page);
  const rows = await readGrid(page);
  return rows.find((r) => r[INBOX.refNo] === refNo)?.[INBOX.action];
}

function inboxRow(page: Page, text: string): Locator {
  return main(page).locator('div[role="row"]').filter({ hasText: text }).first();
}

/** Open the workflow action page for the first Inbox row whose Action Required matches. */
async function openStage(page: Page, stage: string): Promise<string> {
  await openInbox(page);
  const rows = await readGrid(page);
  const row = rows.find((r) => r[INBOX.action] === stage);
  expect(row, `no Inbox row with Action Required "${stage}"`).toBeTruthy();

  const refNo = row![INBOX.refNo];
  expect(refNo).toMatch(REF_NO_PATTERN);

  const link = inboxRow(page, refNo).locator('a.sha-link').first();
  await expect(link).toHaveAttribute('href', new RegExp(WF_ACTION_PATH));
  await link.click();

  await page.waitForURL(new RegExp(WF_ACTION_PATH), { timeout: LONG });
  await page.waitForLoadState('networkidle').catch(() => {});
  return refNo;
}

/**
 * The consent declaration checkbox has NO label[for] — it is the only ENABLED .ant-checkbox-wrapper
 * on the step (every mirrored read-only checkbox is disabled).
 */
// FRAGILE: unlabelled checkbox, addressed by being the only enabled one on the page.
const declarationCheckbox = (page: Page) =>
  page.locator('.ant-checkbox-wrapper:not(:has(input[disabled]))').first();

/** Look up an application's status on the Opportunities grid by its application number. */
async function statusForApplication(page: Page, appNo: string): Promise<string | undefined> {
  await page.goto(OPPS_PATH);
  await expect(page.getByRole('heading', { name: 'All Opportunities' })).toBeVisible({ timeout: LONG });
  const rows = await readGrid(page);
  return rows.find((r) => r[OPP.appNo] === appNo)?.[OPP.status];
}

test.describe('WF-4.1 — Loan Application Workflow Stages', () => {
  test('TC-01: Log in as an RM and open the Inbox', async ({ page }) => {
    const { user, password } = credsFor('RM');

    // STEP 1: NAVIGATE to `/login`
    await page.goto('/login');
    await expect(page.getByRole('textbox', { name: 'Username' })).toBeVisible({ timeout: LONG });

    // STEP 2: TYPE the Username field with the RM username (from `.env`)
    await page.getByRole('textbox', { name: 'Username' }).fill(user);

    // STEP 3: TYPE the Password field with the RM password (from `.env`)
    await page.getByRole('textbox', { name: 'Password' }).fill(password);

    // STEP 4: CLICK **Sign In**
    await page.getByRole('button', { name: 'Sign In', exact: true }).click();

    // STEP 5: WAIT for the app to redirect away from `/login`
    await page.waitForURL((url) => !url.href.includes('/login'), { timeout: LONG });

    // STEP 6-7: CLICK the **Inbox** item and WAIT for the listing
    await openInbox(page);

    // SNAPSHOT: confirm the Inbox heading and grid
    // ASSERT (BLOCKING): the **Incoming Items** heading is displayed
    await expect(page.getByRole('heading', { name: 'Incoming Items' })).toBeVisible();

    // ASSERT: the URL is the Inbox route
    expect(page.url()).toContain(INBOX_PATH);

    // ASSERT: the grid exposes the **Ref No**, **Action Required** and **Status** columns
    await expect(main(page)).toContainText('Ref No');
    await expect(main(page)).toContainText('Action Required');
    await expect(main(page)).toContainText('Status');
  });

  test('TC-02: A newly initiated application appears at the top of the Inbox with the correct Action Required', async ({ page }) => {
    await loginAs(page, 'RM');
    await openInbox(page);

    // SNAPSHOT: confirm the Inbox rows and their Action Required values
    const rows = await readGrid(page);
    expect(rows.length, 'the Inbox has no rows to assert against').toBeGreaterThan(0);

    // ASSERT (BLOCKING): at least one row is of Type **Loan Application Workflow**
    await expect(main(page)).toContainText('Loan Application Workflow', { timeout: LONG });

    // STEP 1: EXTRACT the Ref No, Action Required and Received Date of every row
    const parseDate = (d: string) => {
      const m = d?.match(/^(\d{2})\/(\d{2})\/(\d{4})\s+(\d{2}):(\d{2})$/);
      return m ? Date.parse(`${m[3]}-${m[2]}-${m[1]}T${m[4]}:${m[5]}:00Z`) : NaN;
    };

    // ASSERT: rows are ordered newest **Received Date** first, so the most recently initiated
    //         application is the top row
    const dates = rows.map((r) => parseDate(r[INBOX.received])).filter((n) => !Number.isNaN(n));
    expect(dates, 'Inbox rows are not ordered newest Received Date first')
      .toEqual([...dates].sort((a, b) => b - a));

    const top = rows[0];

    // ASSERT: the top row's Ref No matches the `LA<yyyy>/<nnnnn>` format
    expect(top[INBOX.refNo]).toMatch(REF_NO_PATTERN);

    // ASSERT: the top row's **Action Required** is one of the five recognised stage names
    expect(ALL_STAGES, `unrecognised Action Required "${top[INBOX.action]}"`)
      .toContain(top[INBOX.action]);

    // ASSERT: the row **Status** is `In Progress`
    expect(top[top.length - 1]).toBe('In Progress');

    // SNAPSHOT: confirm the first row exposes its workflow action link
    // ASSERT: the row's action link targets the workflow action route
    await expect(inboxRow(page, top[INBOX.refNo]).locator('a.sha-link').first())
      .toHaveAttribute('href', new RegExp(WF_ACTION_PATH));

    // ASSERT: an ENTITY application's consent stage is Upload Entity Consent and never Upload
    //         Individual Consent, and vice versa. Both stages must never be outstanding together on
    //         the same instance.
    const consentRows = rows.filter((r) => CONSENT_STAGES.includes(r[INBOX.action]));
    for (const r of consentRows) {
      const sameRef = rows.filter((x) => x[INBOX.refNo] === r[INBOX.refNo]);
      const stages = new Set(sameRef.map((x) => x[INBOX.action]));
      expect(
        stages.has(STAGES.entityConsent) && stages.has(STAGES.individualConsent),
        `${r[INBOX.refNo]} has both consent stages outstanding`
      ).toBe(false);
    }
  });

  test('TC-03: Application status corresponds to the outstanding workflow action', async ({ page }) => {
    await loginAs(page, 'RM');

    // STEP 1: NAVIGATE to the Opportunities listing
    await page.goto(OPPS_PATH);
    await expect(page.getByRole('heading', { name: 'All Opportunities' })).toBeVisible({ timeout: LONG });

    // SNAPSHOT: confirm the Application Status column
    // STEP 2: EXTRACT the Application Status of each Opportunity
    const oppRows = await readGrid(page);
    const applications = oppRows
      .map((r) => ({ appNo: r[OPP.appNo], status: r[OPP.status] }))
      .filter((a) => /^LA-\d{4}-\d+$/.test(a.appNo ?? ''));
    expect(applications.length, 'no applications listed to assert against').toBeGreaterThan(0);

    const KNOWN_STATUSES = [...Object.values(STATUS), 'Blocked'];

    // ASSERT (BLOCKING): every observed Application Status is a member of the reference list
    for (const a of applications) {
      expect(KNOWN_STATUSES, `unknown Application Status "${a.status}" on ${a.appNo}`)
        .toContain(a.status);
    }

    // STEP 3-4: CLICK the **Inbox** item and EXTRACT the Action Required per Ref No
    await openInbox(page);
    const inboxRows = await readGrid(page);
    const outstanding = new Set(inboxRows.map((r) => r[INBOX.action]).filter(Boolean));

    // The Inbox keys on Ref No (LA2026/#####) and the Opportunities grid on Application Number
    // (LA-2026-######), so the correspondence is asserted at the SET level.
    const presentStatuses = new Set(applications.map((a) => a.status));
    for (const action of outstanding) {
      const expectedStatuses = STATUS_TO_ACTION
        .filter((m) => m.actions.includes(action))
        .map((m) => m.status);
      expect(expectedStatuses.length, `no status maps to outstanding action "${action}"`)
        .toBeGreaterThan(0);
      expect
        .soft(
          expectedStatuses.some((s) => presentStatuses.has(s)),
          `outstanding action "${action}" implies one of [${expectedStatuses.join(', ')}], ` +
            `but the grid shows only [${[...presentStatuses].join(', ')}]`
        )
        .toBe(true);
    }

    // ASSERT: an application with no outstanding Inbox action is terminal or pre-initiation
    const actionableStatuses = STATUS_TO_ACTION
      .filter((m) => m.actions.some((a) => outstanding.has(a)))
      .map((m) => m.status);
    for (const a of applications) {
      if (a.status === 'Blocked') continue; // out of scope, per instruction
      if (!actionableStatuses.includes(a.status)) {
        expect(NO_ACTION_STATUSES, `${a.appNo} is "${a.status}" with no outstanding action`)
          .toContain(a.status);
      }
    }

    // ASSERT: no assertion in this TC evaluates the `Blocked` status
    expect(NO_ACTION_STATUSES).not.toContain('Blocked');
    expect(STATUS_TO_ACTION.map((m) => m.status)).not.toContain('Blocked');
  });

  test('TC-04: Upload Entity Consent via the manual upload route', async ({ page }) => {
    await loginAs(page, 'RM');

    // STEP 1-4: open the Inbox row whose Action Required is **Upload Entity Consent**
    const refNo = await openStage(page, STAGES.entityConsent);

    // SNAPSHOT: confirm the task header, ref no, status chip, and the approver consent panels
    // ASSERT (BLOCKING): the header reads `Upload Entity Consent: <entity name>`
    await expect(page.getByText(new RegExp(`${STAGES.entityConsent}:`))).toBeVisible({ timeout: LONG });

    // ASSERT: the task Ref No matches the Ref No extracted from the Inbox row
    await expect(page.getByText(`Ref No: ${refNo}`)).toBeVisible({ timeout: LONG });

    // ASSERT: the task status chip is `IN PROGRESS`
    await expect(page.getByText('IN PROGRESS')).toBeVisible({ timeout: LONG });

    const shape = CONSENT_STAGE_SHAPE[STAGES.entityConsent];

    // ASSERT: one consent panel per required approver, each with Date Sent, Date Signed and a
    //         Download Entity Consent Document link
    await expectFieldShown(page, shape.dateSentField);   // Date Sent
    await expectFieldShown(page, shape.downloadField);   // Download Entity Consent Document
    await expectFieldShown(page, shape.uploadField);     // Upload Consent Document
    await expect(page.getByText('Date Signed')).toBeVisible();

    // ASSERT: an unsigned approver's status chip reads `NOTIFICATION SENT`
    await expect(page.getByText(shape.notificationChip)).toBeVisible({ timeout: LONG });

    // ASSERT: the **Upload Consent Document** control is marked required
    await expect(field(page, shape.uploadField)).toContainText('*');

    // SNAPSHOT: confirm the **Submit** button is not yet rendered
    // ASSERT: on the ENTITY stage the Submit button is NOT RENDERED before the declaration is ticked
    // (the INDIVIDUAL stage renders it disabled instead — see TC-06)
    await expect(page.getByRole('button', { name: 'Submit' })).toHaveCount(0);

    // ASSERT: the Add-party actions are disabled once the workflow has started
    for (const label of ['Add Director', 'Add Shareholder', 'Add Signatory']) {
      await expect(page.getByRole('button', { name: label })).toBeDisabled({ timeout: LONG });
    }

    // STEP 5: CLICK the **Upload Consent Document** control and attach the test document
    await field(page, shape.uploadField).locator('input[type="file"]').setInputFiles(TEST_DOC);

    // SNAPSHOT: confirm the attached document name is displayed
    await expect(field(page, shape.uploadField)).toContainText(TEST_DOC_NAME, { timeout: LONG });

    // SNAPSHOT: confirm the declaration checkbox is displayed and unticked
    await expect(page.getByText(shape.declaration)).toBeVisible({ timeout: LONG });
    await expect(declarationCheckbox(page).locator('input[type="checkbox"]')).not.toBeChecked();

    // STEP 6: CLICK the declaration checkbox
    await declarationCheckbox(page).click();
    await expect(declarationCheckbox(page).locator('input[type="checkbox"]')).toBeChecked();

    // SNAPSHOT: confirm the **Submit** button is now rendered
    // ASSERT: ticking the declaration reveals the **Submit** button
    await expect(page.getByRole('button', { name: 'Submit' })).toBeVisible({ timeout: LONG });

    // STEP 7: CLICK **Submit**
    await page.getByRole('button', { name: 'Submit' }).click();

    // STEP 8: WAIT for the redirect back to the Inbox
    // ASSERT: clicking **Submit** redirects back to the Inbox
    await page.waitForURL(new RegExp(INBOX_PATH.replace(/\./g, '\\.')), { timeout: LONG });
    await page.waitForLoadState('networkidle').catch(() => {});

    // SNAPSHOT: confirm the Action Required for that Ref No has advanced
    // ASSERT (BLOCKING): the Action Required becomes **Confirm verification outcomes**
    const rows = await readGrid(page);
    const advanced = rows.find((r) => r[INBOX.refNo] === refNo)?.[INBOX.action];
    expect(advanced, `${refNo} did not advance after Submit`).toBe(STAGES.verification);

    // ASSERT: the application status becomes `Verification In Progress`
    // (asserted at the Opportunity level; Ref No -> Application Number is not 1:1 in the grids)
    await page.goto(OPPS_PATH);
    await expect(main(page)).toContainText(STATUS.verificationInProgress, { timeout: LONG });
  });

  test('TC-05: Consent satisfied entirely electronically advances without a Submit', async ({ page }) => {
    // NOT EXECUTABLE from the RM UI — advancing this way needs a real approver to complete an OTP.
    test.skip(
      true,
      'Requires out-of-band electronic signature by every required approver; cannot be driven ' +
        'from the RM UI.'
    );

    await loginAs(page, 'RM');
    await openInbox(page);

    // STEP 1: EXTRACT the Ref No and Action Required of the consent-stage row
    const rows = await readGrid(page);
    const row = rows.find((r) => CONSENT_STAGES.includes(r[INBOX.action]));
    const refNo = row![INBOX.refNo];
    const before = row![INBOX.action];

    // STEP 2: WAIT for all required approvers to sign electronically (out-of-band)
    // STEP 3: NAVIGATE away and reload, then re-open the Inbox — the advance is only visible after
    //         a page refresh and re-navigation.
    await page.goto('/');
    await page.reload();
    const after = await inboxActionFor(page, refNo);

    // SNAPSHOT: confirm the Action Required changed without any Submit being clicked
    // ASSERT (BLOCKING): the stage advances without the declaration or Submit being used
    expect(after).not.toBe(before);

    // ASSERT: each signed approver's Date Signed is populated
    // TODO[selector]: signed-state approver panel — never observed live (no OTP completed in Dev).

    // ASSERT: the electronic route advances to the recorded next stage
    const EXPECTED_NEXT: Record<string, string> = {
      [STAGES.resolution]: STAGES.entityConsent,
      [STAGES.entityConsent]: STAGES.verification,
      [STAGES.individualConsent]: STAGES.verification,
    };
    expect(after).toBe(EXPECTED_NEXT[before]);
  });

  test('TC-06: Upload Individual Consent via the manual upload route (PERSONAL application)', async ({ page }) => {
    await loginAs(page, 'RM');

    // STEP 1-4: open the Inbox row whose Action Required is **Upload Individual Consent**
    const refNo = await openStage(page, STAGES.individualConsent);
    const shape = CONSENT_STAGE_SHAPE[STAGES.individualConsent];

    // SNAPSHOT: confirm the task header, ref no, status chip, and the Manual Upload Consent section
    // ASSERT (BLOCKING): a PERSONAL application's consent stage is **Upload Individual Consent**
    await expect(page.getByText(new RegExp(`${STAGES.individualConsent}:`))).toBeVisible({ timeout: LONG });

    // ASSERT: the task Ref No matches the Ref No extracted from the Inbox row
    await expect(page.getByText(`Ref No: ${refNo}`)).toBeVisible({ timeout: LONG });

    // ASSERT: the task status chip is `IN PROGRESS`
    await expect(page.getByText('IN PROGRESS')).toBeVisible({ timeout: LONG });

    // ASSERT: the **Manual Upload Consent** section is displayed
    await expect(page.getByText('Manual Upload Consent')).toBeVisible({ timeout: LONG });

    // SNAPSHOT: confirm the approver panel for the main applicant
    // ASSERT: the approver panel shows Date Sent, Date Signed and a Download Consent Document link
    await expectFieldShown(page, shape.dateSentField);
    await expectFieldShown(page, shape.downloadField);
    await expectFieldShown(page, shape.uploadField);
    await expect(page.getByText('Date Signed')).toBeVisible();

    // ASSERT: an unsigned approver's status chip reads `Notification Sent` (title case here — the
    // entity stage uses upper case)
    await expect(page.getByText(shape.notificationChip)).toBeVisible({ timeout: LONG });

    // SNAPSHOT: confirm **Submit** is rendered but disabled
    // ASSERT: on the INDIVIDUAL stage Submit IS rendered but DISABLED before the declaration is
    // ticked — this differs from the ENTITY stage, where it is not rendered at all.
    await expect(page.getByRole('button', { name: 'Submit' })).toBeVisible({ timeout: LONG });
    await expect(page.getByRole('button', { name: 'Submit' })).toBeDisabled();

    // STEP 5: CLICK the **Upload Signed Consent Document** control and attach the test document
    await field(page, shape.uploadField).locator('input[type="file"]').setInputFiles(TEST_DOC);
    await expect(field(page, shape.uploadField)).toContainText(TEST_DOC_NAME, { timeout: LONG });

    // SNAPSHOT: confirm the declaration checkbox is displayed and unticked
    await expect(page.getByText(shape.declaration)).toBeVisible({ timeout: LONG });
    await expect(declarationCheckbox(page).locator('input[type="checkbox"]')).not.toBeChecked();

    // STEP 6: CLICK the declaration checkbox
    await declarationCheckbox(page).click();
    await expect(declarationCheckbox(page).locator('input[type="checkbox"]')).toBeChecked();

    // SNAPSHOT: confirm **Submit** is now enabled
    // ASSERT: ticking the declaration ENABLES Submit
    await expect(page.getByRole('button', { name: 'Submit' })).toBeEnabled({ timeout: LONG });

    // STEP 7: CLICK **Submit**
    await page.getByRole('button', { name: 'Submit' }).click();

    // STEP 8: WAIT for the redirect back to the Inbox
    // ASSERT: clicking **Submit** redirects back to the Inbox
    await page.waitForURL(new RegExp(INBOX_PATH.replace(/\./g, '\\.')), { timeout: LONG });
    await page.waitForLoadState('networkidle').catch(() => {});

    // SNAPSHOT: confirm the Action Required for that Ref No has advanced
    // ASSERT (BLOCKING): the Action Required becomes **Confirm verification outcomes**
    const rows = await readGrid(page);
    const advanced = rows.find((r) => r[INBOX.refNo] === refNo)?.[INBOX.action];
    expect(advanced, `${refNo} did not advance after Submit`).toBe(STAGES.verification);
  });

  test('TC-07: Upload Resolution (entity applications without an upfront resolution)', async ({ page }) => {
    // Selectors pending — LA2026/14392 initiated past this stage (its resolution was supplied on the
    // Opportunity), so no Dev instance sat at Resolution Pending.
    await loginAs(page, 'RM');
    await openInbox(page);

    const rows = await readGrid(page);
    const row = rows.find((r) => r[INBOX.action] === STAGES.resolution);
    if (!row) {
      test.skip(
        true,
        'No application currently sits at Upload Resolution — an upfront resolution satisfies this ' +
          'stage on arrival.'
      );
      return;
    }

    const refNo = row[INBOX.refNo];

    // STEP 1-4: open that row's workflow action page
    await inboxRow(page, refNo).locator('a.sha-link').first().click();
    await page.waitForURL(new RegExp(WF_ACTION_PATH), { timeout: LONG });
    await page.waitForLoadState('networkidle').catch(() => {});

    // SNAPSHOT: confirm the resolution approver panels
    // ASSERT (BLOCKING): the header reads **Upload Resolution**
    await expect(page.getByText(new RegExp(STAGES.resolution))).toBeVisible({ timeout: LONG });

    // ASSERT: the application status is `Resolution Pending` while this stage is outstanding
    // TODO[selector]: resolution approver panel — not recorded live.
    await expectFieldShown(page, 'manualApproval');

    // STEP 5-7: attach the resolution, tick the declaration, Submit
    await field(page, 'manualApproval').locator('input[type="file"]').setInputFiles(TEST_DOC);
    await expect(page.getByRole('button', { name: 'Submit' })).toHaveCount(0);
    await declarationCheckbox(page).click();
    await page.getByRole('button', { name: 'Submit' }).click();
    await page.waitForURL(new RegExp(INBOX_PATH.replace(/\./g, '\\.')), { timeout: LONG });

    // ASSERT (BLOCKING): the Action Required advances to **Upload Entity Consent**
    const after = await inboxActionFor(page, refNo);
    expect(after).toBe(STAGES.entityConsent);
  });

  test('TC-08: Confirm verification outcomes lists every captured party and reviews the entity', async ({ page }) => {
    await loginAs(page, 'RM');

    // STEP 1-4: open the Inbox row whose Action Required is **Confirm verification outcomes**
    const refNo = await openStage(page, STAGES.verification);

    // SNAPSHOT: confirm the task header and every party datalist
    // ASSERT (BLOCKING): the header reads `Confirm verification outcomes: <entity name>`
    await expect(page.getByText(new RegExp(`${STAGES.verification}:`))).toBeVisible({ timeout: LONG });
    await expect(page.getByText(`Ref No: ${refNo}`)).toBeVisible({ timeout: LONG });

    // STEP 5: EXTRACT the party names listed in the Signatories, Directors and Shareholders datalists
    await expect(page.getByText('Signatories')).toBeVisible({ timeout: LONG });
    await expect(page.getByText('Directors')).toBeVisible();
    const verificationPageText = (await page.locator('body').textContent()) ?? '';

    // STEP 6: NAVIGATE to the Opportunity's Client Info tab and EXTRACT the captured parties
    const oppRows = await (async () => {
      await page.goto(OPPS_PATH);
      await expect(page.getByRole('heading', { name: 'All Opportunities' })).toBeVisible({ timeout: LONG });
      return readGrid(page);
    })();
    const entityOpp = oppRows.find((r) => r.includes('ENTITY') && r[OPP.status] === STATUS.verificationInProgress);
    expect(entityOpp, 'no ENTITY application at Verification In Progress to cross-check').toBeTruthy();

    await inboxRow(page, entityOpp![OPP.appNo]).locator('a').first().click();
    await page.waitForURL(new RegExp(OPP_DETAILS_PATH.replace(/\./g, '\\.')), { timeout: LONG });
    await page.waitForLoadState('networkidle').catch(() => {});
    await main(page).getByRole('tab', { name: 'Client Info' }).click();

    const partyNames = await main(page)
      .locator('div[role="row"]')
      .evaluateAll((rows) =>
        rows
          .map((r) => Array.from(r.querySelectorAll('[role="cell"]')).map((c) => (c.textContent || '').trim()))
          .filter((c) => c.length > 4 && /^\d{13}$/.test(c[5] ?? ''))
          .map((c) => `${c[3]} ${c[4]}`)
      );

    // ASSERT: **every party captured on the Opportunity appears on this step**
    for (const name of partyNames) {
      expect(
        verificationPageText.includes(name.split(' ')[1] ?? name),
        `party "${name}" is captured on the Opportunity but missing from the verification step`
      ).toBe(true);
    }

    // Re-open the verification stage for the dialog assertions.
    await openStage(page, STAGES.verification);

    // ASSERT: the **entity itself** appears as a reviewable party for an entity application
    await expect(page.getByText(/Company Verifications/)).toBeVisible({ timeout: LONG });

    // ASSERT: each party exposes a status button whose initial label is **Awaiting Review**
    const statusButton = page.getByRole('button', { name: 'Awaiting Review' }).first();
    await expect(statusButton).toBeVisible({ timeout: LONG });

    // ASSERT: the page exposes the **Finalise Verification Outcomes** and **Flag As High Risk** actions
    await expect(page.getByRole('button', { name: 'Finalise Verification Outcomes' })).toBeVisible();
    await expect(page.getByRole('button', { name: 'Flag As High Risk' })).toBeVisible();

    // STEP 7-8: CLICK the entity's **Awaiting Review** status button and WAIT for the dialog
    await statusButton.click();
    await expect(modal(page)).toBeVisible({ timeout: LONG });

    // SNAPSHOT: confirm the dialog tabs and the Verification Summary
    // ASSERT: the entity dialog exposes the **Overview**, **CIPC** and **Compliance** tabs
    for (const tab of ['Overview', 'CIPC', 'Compliance']) {
      await expect(modal(page).getByRole('tab', { name: tab })).toBeVisible({ timeout: LONG });
    }

    // ASSERT: the **Verification Summary** lists each verification with its own status
    await expect(modal(page)).toContainText('Verification Summary');
    await expect(modal(page)).toContainText('AWAITING REVIEW');

    // STEP 9: CLICK the **CIPC** tab
    await modal(page).getByRole('tab', { name: 'CIPC' }).click();

    // SNAPSHOT: confirm the submitted vs returned information and the failure reason
    // ASSERT: the CIPC tab shows Submitted Information and CIPC Returned Information side by side
    await expect(modal(page)).toContainText('Submitted Information', { timeout: LONG });
    await expect(modal(page)).toContainText('CIPC Returned Information');

    // ASSERT: a mismatch is reported in **Reason for Failure**
    await expect(field(modal(page), 'cipcVerification_reasonForFailure')).toBeVisible({ timeout: LONG });

    // ASSERT: the **Company Name Review Decision** offers exactly **Approve** and **Reject**
    await field(modal(page), 'cipcVerification_companyNameReviewDecision')
      .locator('.ant-select-selector')
      .click();
    const options = await page
      .locator('.ant-select-dropdown:not(.ant-select-dropdown-hidden) .ant-select-item-option')
      .evaluateAll((els) => els.map((e) => e.getAttribute('title')));
    expect(options).toEqual(['Approve', 'Reject']);

    // STEP 10: SELECT Company Name Review Decision — choose `Approve`
    await openOption(page, 'Approve').click();

    // STEP 11: CLICK **Close**
    // FRAGILE: the dialog has two elements named "Close" (the modal x and the toolbar button).
    await modal(page).locator('button.sha-toolbar-btn', { hasText: 'Close' }).click();
    await expect(modal(page)).toBeHidden({ timeout: LONG });

    // SNAPSHOT: confirm the entity's status has updated
    // ASSERT: closing the dialog updates the party's status away from **Awaiting Review**
    await page.waitForLoadState('networkidle').catch(() => {});
  });

  test('TC-09: Per-person ID Verification is decided in the verification dialog', async ({ page }) => {
    await loginAs(page, 'RM');
    await openStage(page, STAGES.verification);

    // STEP 1: CLICK the Main Applicant's **Awaiting Review** status button
    const personStatus = page.getByRole('button', { name: 'Awaiting Review' }).first();
    await expect(personStatus).toBeVisible({ timeout: LONG });
    await personStatus.click();

    // STEP 2: WAIT for the verification dialog to open
    await expect(modal(page)).toBeVisible({ timeout: LONG });

    // SNAPSHOT: confirm the dialog tabs and the Verification Summary
    // ASSERT (BLOCKING): the dialog exposes Overview / ID Verification / KYC Verification
    for (const tab of ID_VERIFICATION.tabs) {
      await expect(modal(page).getByRole('tab', { name: tab })).toBeVisible({ timeout: LONG });
    }

    // ASSERT: the Verification Summary lists every verification for that party with its own status
    await expect(modal(page)).toContainText('Verification Summary', { timeout: LONG });
    for (const row of ID_VERIFICATION.summaryRows) {
      await expect(modal(page)).toContainText(row);
    }

    // ASSERT: the dialog notes that PEP and AML results are visible only to compliance
    await expect(modal(page)).toContainText(/PEP and AML results are only visible to compliance/i);

    // STEP 3: CLICK the **ID Verification** tab
    await modal(page).getByRole('tab', { name: 'ID Verification' }).click();

    // SNAPSHOT: confirm the submitted vs returned comparison and the automated check results
    // ASSERT: the tab shows the Submitted and Returned identity side by side
    for (const f of ID_VERIFICATION.submitted) {
      await expectFieldShown(modal(page), f);
    }

    // ASSERT: the automated checks are reported individually
    for (const f of ID_VERIFICATION.checks) {
      await expectFieldShown(modal(page), f);
    }

    // ASSERT: a captured name differing from the Home Affairs record yields Name Match FAILED while
    //         ID Match and Death Check still PASSED (recorded live on LA2026/14623)
    await expect(field(modal(page), 'idVerification_nameMatchStatus')).toContainText('FAILED');
    await expect(field(modal(page), 'idVerification_idNumberMatchStatus')).toContainText('PASSED');
    await expect(field(modal(page), 'idVerification_deathCheckStatus')).toContainText('PASSED');

    // ASSERT: a downloadable ID biometric verification report is offered
    await expectFieldShown(modal(page), ID_VERIFICATION.report);
    await expect(modal(page).getByRole('button', { name: /ID_Biometric_Verification_Report/ }))
      .toBeVisible();

    // SNAPSHOT: confirm Submit is disabled before a decision is chosen
    // ASSERT: **Submit** is disabled until a decision is chosen
    await expect(modal(page).getByRole('button', { name: 'Submit' })).toBeDisabled();

    // ASSERT: the ID Review Decision offers exactly Approve and Reject
    await field(modal(page), ID_VERIFICATION.decision).locator('.ant-select-selector').click();
    const options = await page
      .locator('.ant-select-dropdown:not(.ant-select-dropdown-hidden) .ant-select-item-option')
      .evaluateAll((els) => els.map((e) => e.getAttribute('title')));
    expect(options).toEqual([...ID_VERIFICATION.decisionOptions]);

    // STEP 4: SELECT ID Review Decision — choose `Reject`
    await openOption(page, 'Reject').click();

    // SNAPSHOT: confirm the **Rationale** field is revealed and required
    // ASSERT (BLOCKING): choosing Reject reveals the Rationale field and marks it required
    await expectFieldShown(modal(page), ID_VERIFICATION.rationale);
    await expect(field(modal(page), ID_VERIFICATION.rationale).locator('.sha-required-mark'))
      .toHaveCount(1);

    // STEP 5: SELECT ID Review Decision — choose `Approve`
    await field(modal(page), ID_VERIFICATION.decision).locator('.ant-select-selector').click();
    await openOption(page, 'Approve').click();

    // SNAPSHOT: confirm the Rationale field is hidden again and Submit is enabled
    // ASSERT: choosing Approve hides the Rationale field again
    await expectFieldHidden(modal(page), ID_VERIFICATION.rationale);
    await expect(modal(page).getByRole('button', { name: 'Submit' })).toBeEnabled({ timeout: LONG });

    // STEP 6: CLICK **Submit**
    await modal(page).getByRole('button', { name: 'Submit' }).click();

    // SNAPSHOT: confirm the decision is saved and the dialog stays open
    // ASSERT: **Submit** saves the decision WITHOUT closing the dialog
    await expect(modal(page)).toBeVisible();

    // STEP 7: CLICK **Close**
    // FRAGILE: the dialog has two elements named "Close" (the modal x and the toolbar button).
    await modal(page).locator('button.sha-toolbar-btn', { hasText: 'Close' }).click();
    await expect(modal(page)).toBeHidden({ timeout: LONG });
    await page.waitForLoadState('networkidle').catch(() => {});

    // SNAPSHOT: confirm the party row after closing
    // ASSERT: the party's status does NOT resolve on the ID decision alone — it stays
    // "Awaiting Review" with Outcome TBD while its KYC / Photo / Compliance verifications are
    // unresolved. Verified live, including after a full page reload.
    await page.reload();
    await page.waitForLoadState('networkidle').catch(() => {});
    await expect(page.getByRole('button', { name: 'Awaiting Review' }).first())
      .toBeVisible({ timeout: LONG });

    // ASSERT: Finalise Verification Outcomes does not advance the stage while a party is unresolved.
    // EXPECTED FAIL on the feedback assertion — BUG-LB-006: the button renders enabled, issues NO
    // network request at all, and reports nothing to the user.
    const requests: string[] = [];
    page.on('request', (r) => {
      if (r.method() !== 'GET') requests.push(r.url());
    });
    await page.getByRole('button', { name: 'Finalise Verification Outcomes' }).click();
    await page.waitForLoadState('networkidle').catch(() => {});

    const toast = page.locator('.ant-message-notice, .ant-notification-notice');
    expect
      .soft(
        requests.length > 0 || (await toast.count()) > 0,
        'BUG-LB-006: Finalise Verification Outcomes is enabled but issues no request and shows no ' +
          'message while a party is still Awaiting Review'
      )
      .toBe(true);
  });

  test('TC-10: Complete Onboarding Checklist, including its conditional question', async ({ page }) => {
    await loginAs(page, 'RM');

    // STEP 1-4: open the Inbox row whose Action Required is **Complete Onboarding Checklist**
    const refNo = await openStage(page, STAGES.onboarding);

    // SNAPSHOT: confirm the task header, ref no, and the checklist questions
    // ASSERT (BLOCKING): the header reads **Complete Onboarding Checklist**
    await expect(page.getByText(new RegExp(STAGES.onboarding))).toBeVisible({ timeout: LONG });

    // ASSERT: the task Ref No matches the Ref No extracted from the Inbox row
    await expect(page.getByText(`Ref No: ${refNo}`)).toBeVisible({ timeout: LONG });

    // ASSERT: the task status chip is `IN PROGRESS`
    await expect(page.getByText('IN PROGRESS')).toBeVisible({ timeout: LONG });

    // ASSERT: all ten checklist fields are displayed with their recorded question text
    for (const q of Object.values(CHECKLIST)) {
      if (q.field === CHECKLIST.requiresWaterRightsSupport.field) continue; // conditional, asserted below
      await expectFieldShown(page, q.field);
      await expect(page.getByText(q.text, { exact: false })).toBeVisible({ timeout: LONG });
    }

    // ASSERT: **Years Of Farming Experience** is a numeric field, not a checkbox
    await expect(field(page, CHECKLIST.yearsOfFarmingExperience.field).locator('input[type="checkbox"]'))
      .toHaveCount(0);
    await expect(field(page, CHECKLIST.yearsOfFarmingExperience.field).locator('input')).toHaveCount(1);

    // SNAPSHOT: confirm *Support with applying for water rights required?* is hidden
    // ASSERT (BLOCKING): the dependent question is hidden while its parent is unticked
    await expect(field(page, CHECKLIST.requiresWaterUseRights.field).locator('input[type="checkbox"]'))
      .not.toBeChecked();
    await expectFieldHidden(page, CHECKLIST.requiresWaterRightsSupport.field);

    // STEP 5: CLICK the *Does this operation require Water Use Rights?* checkbox
    await field(page, CHECKLIST.requiresWaterUseRights.field).locator('.ant-checkbox-wrapper').click();

    // SNAPSHOT: confirm the dependent question is revealed
    // ASSERT: ticking the parent reveals the dependent question
    await expectFieldShown(page, CHECKLIST.requiresWaterRightsSupport.field);

    // ASSERT: the revealed dependent question **defaults to ticked**
    await expect(
      field(page, CHECKLIST.requiresWaterRightsSupport.field).locator('input[type="checkbox"]')
    ).toBeChecked();

    // STEP 6: CLICK the parent checkbox again to untick it
    await field(page, CHECKLIST.requiresWaterUseRights.field).locator('.ant-checkbox-wrapper').click();

    // SNAPSHOT: confirm the dependent question is hidden again
    // ASSERT: unticking the parent hides the dependent question again
    await expectFieldHidden(page, CHECKLIST.requiresWaterRightsSupport.field);

    // STEP 7: CLICK the parent checkbox to re-tick it
    await field(page, CHECKLIST.requiresWaterUseRights.field).locator('.ant-checkbox-wrapper').click();
    await expectFieldShown(page, CHECKLIST.requiresWaterRightsSupport.field);

    // STEP 8: TYPE the Years Of Farming Experience field with `12`
    await field(page, CHECKLIST.yearsOfFarmingExperience.field).locator('input').fill('12');

    // STEP 9-13: CLICK the remaining checklist items
    const TICK = [
      CHECKLIST.hasValidTaxClearance.field,
      CHECKLIST.maintainsFormalFinancialRecords.field,
      CHECKLIST.hasWorkingEquipment.field,
      CHECKLIST.hasAccessToMarkets.field,
      CHECKLIST.isCompliantWithLaborLaws.field,
    ];
    for (const name of TICK) {
      await field(page, name).locator('.ant-checkbox-wrapper').click();
    }

    // ASSERT: the ticked checklist items retain their checked state
    for (const name of TICK) {
      await expect(field(page, name).locator('input[type="checkbox"]')).toBeChecked();
    }

    // ASSERT: the `subForm2_*` mirrored compliance checkboxes are read-only
    for (const name of ['subForm2_isNcaClient', 'subForm2_hasSurety', 'subForm2_hasResolution']) {
      const cb = field(page, name).locator('input[type="checkbox"]');
      if ((await cb.count()) > 0) await expect(cb.first()).toBeDisabled();
    }

    // SNAPSHOT: confirm **Submit** is enabled
    // ASSERT: the **Submit** button is enabled
    // NOTE: deliberately NOT clicking Submit — the Dev instances at Pre-Onboarding belong to earlier
    // scenarios. Nothing here is saved.
    await expect(page.getByRole('button', { name: 'Submit' })).toBeEnabled({ timeout: LONG });
  });

  test('TC-11: Submitting the onboarding checklist completes the process', async ({ page }) => {
    // NOT EXECUTED — would irreversibly advance an instance belonging to an earlier scenario.
    test.skip(
      true,
      'Requires a first-party application at Pre-Onboarding. Submitting an existing Dev instance ' +
        'would advance another scenario.'
    );

    await loginAs(page, 'RM');
    const refNo = await openStage(page, STAGES.onboarding);

    // STEP 1: CLICK **Submit**
    await page.getByRole('button', { name: 'Submit' }).click();

    // STEP 2: WAIT for the redirect back to the Inbox
    await page.waitForURL(new RegExp(INBOX_PATH.replace(/\./g, '\\.')), { timeout: LONG });
    await page.waitForLoadState('networkidle').catch(() => {});

    // SNAPSHOT: confirm the task has left the Inbox
    // ASSERT: the task no longer appears in the RM **Inbox**
    await expect(inboxRow(page, refNo)).toHaveCount(0, { timeout: LONG });

    // ASSERT: no further Action Required is outstanding for that Ref No
    expect(await inboxActionFor(page, refNo)).toBeUndefined();

    // STEP 3: NAVIGATE to the Opportunity for that application
    // ASSERT (BLOCKING): the application status becomes `Complete`
    await page.goto(OPPS_PATH);
    await expect(main(page)).toContainText(STATUS.complete, { timeout: LONG });
  });

  test('TC-12: An unsigned / un-uploaded consent terminates the application', async ({ page }) => {
    await loginAs(page, 'RM');

    // STEP 1: NAVIGATE to the Opportunities listing
    await page.goto(OPPS_PATH);
    await expect(page.getByRole('heading', { name: 'All Opportunities' })).toBeVisible({ timeout: LONG });

    // SNAPSHOT: confirm the Application Status column
    // STEP 2: EXTRACT the status of any application whose consent was never provided
    const rows = await readGrid(page);
    const terminated = rows.filter((r) => r[OPP.status] === STATUS.terminatedConsent);

    if (terminated.length === 0) {
      // The consent timeout is time-based and cannot be forced from the UI.
      expect(Object.values(STATUS)).toContain(STATUS.terminatedConsent);
      test.skip(
        true,
        'No application currently sits at "Terminated - Consent Not Provided" — the consent ' +
          'timeout is time-based and cannot be forced from the UI.'
      );
      return;
    }

    const appNo = terminated[0][OPP.appNo];

    // ASSERT (BLOCKING): the status is `Terminated - Consent Not Provided`
    expect(terminated[0][OPP.status]).toBe(STATUS.terminatedConsent);

    // ASSERT: a terminated application is not reported as `Complete`
    expect(terminated[0][OPP.status]).not.toBe(STATUS.complete);

    // STEP 3: CLICK the **Inbox** item and confirm no outstanding action remains
    await openInbox(page);
    const inbox = await readGrid(page);
    const stillOutstanding = inbox.some(
      (r) => r[INBOX.refNo] && appNo.includes(r[INBOX.refNo].replace('/', '-'))
    );

    // ASSERT: no Action Required remains outstanding in the Inbox for a terminated application
    expect(stillOutstanding, `${appNo} is terminated but still has an outstanding Inbox action`)
      .toBe(false);
  });
});
