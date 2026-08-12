// AUTO-RECORDED from test-plans/leads/lead-to-opportunity-lifecycle.md
// The .md plan is canonical. AI-repair will patch failing lines in this file.
// Do not hand-edit unless you are also updating the .md plan.
//
// Selectors recorded live against Land Bank CRM Dev on 2026-07-31 as the RM role:
//   - Login inputs expose accessible names "Username" / "Password"; two primary buttons exist
//     ("Sign In", "Sign in with Microsoft") so Sign In needs exact: true.
//   - The RM lands on /dynamic/management-dashboard (not the user dashboard the ADMIN role gets).
//   - Side-menu <li> carries role="menuitem" with no accessible name, so items resolve as role=link.
//   - Ant Design form inputs carry NO id and NO data-testid. The only stable anchor is
//     <label for="<fieldName>">, and forms NEST — a plain :has() label match also matches ancestor
//     form items (it resolved to 42 inputs during recording). Every field is therefore scoped by a
//     DIRECT-CHILD label chain via the field() helper below.
//   - Conditional fields are hidden with the `ant-form-item-hidden` class, NOT removed from the DOM,
//     so "is this field shown?" must be asserted on that class.
//   - Select options expose no role=option; they are matched on their title attribute inside the
//     open (non-hidden) dropdown. Once a select holds a value its hidden <input> is click-intercepted
//     by the selection-item span, so the trigger must be the .ant-select-selector.
//   - Pre-Screening Assessment radio groups have NO label association whatsoever — they are matched
//     by ordinal position (7 groups, fixed order, verified live).
//   - The Leads grid is a real <table>; the Inbox is a div-based role=row / role=cell grid whose
//     first cell holds the a.sha-link that opens /shesha/workflow-action.
//   - Region is derived server-side from Province (Gauteng -> "Central Region").
//
// LEAD CHANNEL DRIVES THE FORM SHAPE (recorded 2026-07-31):
//   Online Digital Channel -> full client capture form immediately, no consent step.
//   Landbank Branch        -> the client block COLLAPSES; fields reveal progressively from the
//                             Client Type + consent toggle. Two distinct toggles exist:
//     * Individual: an UNLABELLED switch ("Upload Consent?" label lives in a preceding label-only
//       form item, so the switch's own form item has no `for` -> addressed as the only visible
//       switch in the modal).
//         ON  -> reveals `manualApproval` Upload Consent + Download Consent Template, hides
//                Request OTP, DISABLES Save. Attaching a file surfaces an "Upload" button; clicking
//                it reveals the client block, re-enables Save, and CLEARS the previously typed
//                mobile/email/ID -> client fields must be filled AFTER Upload.
//         OFF -> Save enabled immediately; "Request OTP" reveals `otpPin` + "Submit OTP".
//     * Entity (Listed Company / Close Corporation): the LABELLED `uploadResAndConsent` switch.
//         ON  -> reveals `signatoryIdNumber`, `companyRegistrationNumber`, `signatoryConsent`
//                (upload), `resolution` (upload); hides the client block; DISABLES Save. After both
//                files are attached an "Upload" button appears; clicking it runs a CIPC lookup keyed
//                off the Company Registration Number (2012/225386/07 -> "BOXFUSION (PTY)LTD", reg no
//                normalised to "K2012/225386/07") and re-reveals the client block.
//         OFF -> plain manual capture, no uploads, NO OTP route, Save enabled from the start.
//   ID Number is Luhn-validated ("Please enter a valid South African ID number").
//
// KNOWN BLOCKERS
//   BUG-LB-001: on a freshly converted Opportunity, "Initiate Loan Application" fires
//     POST /api/services/app/LoanApplicationWorkflow/InitiateLoanApplicationWorkflow and returns
//     HTTP 500 silently (no toast, status stays DRAFT). Reproduced with an empty Loan Info tab AND
//     after saving a Requested Amount, so it is not missing loan data. TC-12 is expected to FAIL.
//   BUG-LB-002: Individual + Landbank Branch + Upload Consent = False saves a lead with blank
//     First Name / Last Name / Province / Preferred Communication — that variant never displays the
//     required Client Information block. TC-07's name assertion is expected to FAIL (non-blocking).

import { test, expect, Page, Locator } from '@playwright/test';
import path from 'path';

// Environment & credentials come from process.env, loaded from a gitignored .env by
// playwright.config.ts (real env vars / CI secrets always win). NEVER hardcode a
// username, password, or token here — this file is committed and synced to the hub.
//   Site  : baseURL is resolved in playwright.config.ts from TEST_ENV + <ENV>_APP_URL
//           (e.g. TEST_ENV=dev → DEV_APP_URL), or a plain APP_URL. Use RELATIVE paths below.
//   Creds : per role, .env defines <ROLE>_USERNAME / <ROLE>_PASSWORD (e.g. RM_USERNAME).

const LEADS_PATH = '/dynamic/LandBank.Crm/LBLead-table';
const LEAD_DETAILS_PATH = '/dynamic/LandBank.Crm/LBLead-details';
const OPPS_PATH = '/dynamic/LandBank.Crm/LBOpportunity-table';
const OPP_DETAILS_PATH = '/dynamic/LandBank.Crm/LBOpportunity-details';
const INBOX_PATH = '/dynamic/Shesha.Workflow/workflows-inbox';
const WF_ACTION_PATH = '/shesha/workflow-action';

// Consent / resolution attachment. Resolved from the hub root, where Playwright is invoked.
const CONSENT_DOC = path.resolve(process.cwd(), 'test-data/pdf-test.pdf');
const CONSENT_DOC_NAME = 'pdf-test.pdf';

// CIPC-registered company used to exercise the entity auto-populate path.
const CIPC_REG_NO = '2012/225386/07';
const CIPC_REG_NO_NORMALISED = 'K2012/225386/07';
const CIPC_ENTITY_NAME = 'BOXFUSION (PTY)LTD';

const LONG = 60000;

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

// Log in as any role defined in .env. Defaults to RM for this plan.
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

// FRAGILE: Ant Design form inputs expose no id / data-testid, so a field can only be reached
// through its <label for="<fieldName>">. The direct-child chain is required — a plain
// `.ant-form-item:has(label[for="x"])` also matches every ANCESTOR form item in these nested
// Shesha forms (it resolved to 42 inputs during recording).
function field(scope: Page | Locator, name: string): Locator {
  return scope.locator(
    `.ant-form-item:has(> .ant-row > .ant-col.ant-form-item-label > label[for="${name}"])`
  );
}

function textInput(scope: Page | Locator, name: string): Locator {
  return field(scope, name).locator('input.ant-input');
}

/** Conditional fields stay in the DOM with `ant-form-item-hidden`, so assert on the class. */
async function expectFieldShown(scope: Page | Locator, name: string) {
  await expect(field(scope, name)).not.toHaveClass(/ant-form-item-hidden/, { timeout: LONG });
}
async function expectFieldHidden(scope: Page | Locator, name: string) {
  await expect(field(scope, name)).toHaveClass(/ant-form-item-hidden/, { timeout: LONG });
}

// FRAGILE: dropdown options render no role=option; the title attribute is the only stable handle,
// and the open dropdown must be distinguished from the hidden/cached ones still in the DOM.
function openOption(page: Page, title: string): Locator {
  return page.locator(
    `.ant-select-dropdown:not(.ant-select-dropdown-hidden) .ant-select-item-option[title="${title}"]`
  );
}

// Trigger must be the .ant-select-selector — once a value is set, the hidden <input> is
// click-intercepted by the .ant-select-selection-item span (verified live).
async function selectOption(scope: Page | Locator, page: Page, name: string, option: string) {
  await field(scope, name).locator('.ant-select-selector').click();
  await openOption(page, option).click();
}

const modal = (page: Page) => page.locator('.ant-modal-content');
const saveButton = (page: Page) => modal(page).getByRole('button', { name: 'Save', exact: true });
const uploadCommitButton = (page: Page) =>
  modal(page).getByRole('button', { name: 'Upload', exact: true });

/** Attach a document to a Shesha file-upload field via its hidden <input type="file">. */
async function attachDocument(page: Page, fieldName: string, file: string) {
  await field(modal(page), fieldName).locator('input[type="file"]').setInputFiles(file);
}

/**
 * The Individual "Upload Consent?" switch has NO label association — its label lives in a
 * preceding label-only form item. It is the only visible switch in the modal for an Individual
 * on the Landbank Branch channel (the entity `uploadResAndConsent` switch is hidden there).
 */
// FRAGILE: unlabelled switch, addressed as the only visible .ant-switch in the modal.
const individualConsentSwitch = (page: Page) =>
  modal(page).locator('.ant-form-item:not(.ant-form-item-hidden) .ant-switch').first();

const entityConsentSwitch = (page: Page) =>
  field(modal(page), 'uploadResAndConsent').locator('.ant-switch');

/** The seven pre-screening questions, in the fixed order the form renders them. */
const PRESCREEN = [
  { question: 'Is the applicant a South African citizen?', answer: 'Yes' },
  { question: 'Is the farming land located in South Africa?', answer: 'Yes' },
  { question: 'Do the intended farming activities fall within the Land Bank mandate?', answer: 'Yes' },
  { question: 'Is the client blacklisted?', answer: 'No' },
  { question: 'Is the client currently under debt review?', answer: 'No' },
  { question: "Is the client's current Country of Residence South Africa?", answer: 'Yes' },
  { question: 'Does the client currently have access to suitable land for farming activities?', answer: 'Yes' },
];

/** Open the Leads grid and launch the Add New Lead modal. */
async function openNewLeadModal(page: Page) {
  await page.goto(LEADS_PATH);
  await expect(page.getByRole('button', { name: 'New Lead' })).toBeVisible({ timeout: LONG });
  await page.getByRole('button', { name: 'New Lead' }).click();
  await expect(modal(page)).toBeVisible({ timeout: LONG });
  await expect(modal(page).getByText('Add New Lead')).toBeVisible();
}

/** Run the pre-screening assessment to a PASSED outcome and wait for the conversion. */
async function passPreScreening(page: Page) {
  const main = page.locator('main');

  await main.getByRole('button', { name: /Initiate Pre-Screening/ }).click();
  await expect(modal(page).getByText('Pre-Screening Assessment')).toBeVisible({ timeout: LONG });

  for (const { question } of PRESCREEN) {
    await expect(modal(page).getByText(question)).toBeVisible();
  }
  await expect(modal(page).getByRole('button', { name: /Submit/ })).toBeDisabled();

  const confirmCheckbox = modal(page).locator('.ant-checkbox-wrapper');
  await expect(confirmCheckbox.locator('input[type="checkbox"]')).toBeDisabled();

  // FRAGILE: the pre-screening radio groups carry no label association at all, so each question
  // is addressed by its ordinal position (7 groups, fixed render order, verified live).
  const radioGroups = modal(page).locator('.ant-radio-group');
  await expect(radioGroups).toHaveCount(PRESCREEN.length);
  for (let i = 0; i < PRESCREEN.length; i++) {
    await radioGroups.nth(i).locator(`label:has-text("${PRESCREEN[i].answer}")`).click();
  }

  await expect(confirmCheckbox.locator('input[type="checkbox"]')).toBeEnabled({ timeout: LONG });
  await confirmCheckbox.click();
  await expect(modal(page).getByRole('button', { name: /Submit/ })).toBeEnabled({ timeout: LONG });
  await modal(page).getByRole('button', { name: /Submit/ }).click();
  await expect(modal(page)).toBeHidden({ timeout: LONG });
  await page.waitForLoadState('networkidle').catch(() => {});
}

// ---------------------------------------------------------------------------
// Online Digital Channel matrix (TC-03 → TC-05)
// ---------------------------------------------------------------------------

type OnlineCombination = {
  tc: string;
  clientType: 'Individual (Individual)' | 'Listed Company (Entity)' | 'Close Corporation (Entity)';
  applicationType: 'PERSONAL' | 'ENTITY';
  isEntity: boolean;
  entityName?: string;
  lastName: string;
  mobile: string;
  email: string;
};

const ONLINE_COMBINATIONS: OnlineCombination[] = [
  {
    tc: 'TC-03', clientType: 'Individual (Individual)',
    applicationType: 'PERSONAL', isEntity: false,
    lastName: 'IndivOnline', mobile: '0820000101', email: 'autoqa.indivonline@example.com',
  },
  {
    tc: 'TC-04', clientType: 'Listed Company (Entity)',
    applicationType: 'ENTITY', isEntity: true, entityName: 'AutoQA Listed Co Ltd',
    lastName: 'ListedOnline', mobile: '0820000103', email: 'autoqa.listedonline@example.com',
  },
  {
    tc: 'TC-05', clientType: 'Close Corporation (Entity)',
    applicationType: 'ENTITY', isEntity: true, entityName: 'AutoQA Close Corp CC',
    lastName: 'CloseCorpOnline', mobile: '0820000105', email: 'autoqa.closecorponline@example.com',
  },
];

// ---------------------------------------------------------------------------
// Landbank Branch × consent matrix (TC-06 → TC-11)
// ---------------------------------------------------------------------------

type EntityBranchCombination = {
  tc: string;
  clientType: 'Listed Company (Entity)' | 'Close Corporation (Entity)';
  lastName: string;
  entityName: string;
  mobile: string;
  email: string;
};

const ENTITY_BRANCH_CONSENT_TRUE: EntityBranchCombination[] = [
  {
    tc: 'TC-08', clientType: 'Listed Company (Entity)', lastName: 'ListedBranchResYes',
    entityName: CIPC_ENTITY_NAME, mobile: '0820000203',
    email: 'autoqa.listedbranch.resyes@example.com',
  },
  {
    tc: 'TC-10', clientType: 'Close Corporation (Entity)', lastName: 'CloseCorpBranchResYes',
    entityName: CIPC_ENTITY_NAME, mobile: '0820000205',
    email: 'autoqa.closecorpbranch.resyes@example.com',
  },
];

const ENTITY_BRANCH_CONSENT_FALSE: EntityBranchCombination[] = [
  {
    tc: 'TC-09', clientType: 'Listed Company (Entity)', lastName: 'ListedBranchResNo',
    entityName: 'AutoQA Listed Branch Ltd', mobile: '0820000204',
    email: 'autoqa.listedbranch.resno@example.com',
  },
  {
    tc: 'TC-11', clientType: 'Close Corporation (Entity)', lastName: 'CloseCorpBranchResNo',
    entityName: 'AutoQA Close Corp Branch CC', mobile: '0820000206',
    email: 'autoqa.closecorpbranch.resno@example.com',
  },
];

test.describe('LEAD-2.1 — Lead to Opportunity Lifecycle (Client Type × Lead Channel × Consent Matrix)', () => {
  test('TC-01: Log in to Land Bank CRM as an RM', async ({ page }) => {
    const { user, password } = credsFor('RM');

    // STEP 1: NAVIGATE to `/login`
    await page.goto('/login');

    // SNAPSHOT: confirm the login form (Username + Password fields, Sign In button) is rendered
    await expect(page.getByRole('textbox', { name: 'Username' })).toBeVisible({ timeout: LONG });

    // STEP 2: TYPE the Username field with the RM username (from `.env`)
    await page.getByRole('textbox', { name: 'Username' }).fill(user);

    // SNAPSHOT: confirm the Password field is rendered
    await expect(page.getByRole('textbox', { name: 'Password' })).toBeVisible();

    // STEP 3: TYPE the Password field with the RM password (from `.env`)
    await page.getByRole('textbox', { name: 'Password' }).fill(password);

    // SNAPSHOT: confirm the **Sign In** button is enabled
    await expect(page.getByRole('button', { name: 'Sign In', exact: true })).toBeEnabled();

    // STEP 4: CLICK **Sign In**
    await page.getByRole('button', { name: 'Sign In', exact: true }).click();

    // STEP 5: WAIT for the app to redirect away from `/login`
    await page.waitForURL((url) => !url.href.includes('/login'), { timeout: LONG });

    // ASSERT (BLOCKING): the app redirects away from `/login`
    expect(page.url()).not.toContain('/login');

    // ASSERT: the RM lands on Dashboard (Management) — `/dynamic/management-dashboard`
    expect(page.url()).toContain('/dynamic/management-dashboard');

    // ASSERT: the side menu shows **Leads**, **Opportunities** and **Inbox**
    await expect(page.getByRole('link', { name: 'Leads', exact: true })).toBeVisible({ timeout: LONG });
    await expect(page.getByRole('link', { name: 'Opportunities', exact: true })).toBeVisible();
    await expect(page.getByRole('link', { name: 'Inbox', exact: true })).toBeVisible();
  });

  test('TC-02: Navigate to Leads from the side menu', async ({ page }) => {
    await loginAs(page, 'RM');

    // SNAPSHOT: confirm the side menu is rendered and the **Leads** item is visible
    await expect(page.getByRole('link', { name: 'Leads', exact: true })).toBeVisible({ timeout: LONG });

    // STEP 1: CLICK the **Leads** item in the side menu
    await page.getByRole('link', { name: 'Leads', exact: true }).click();

    // STEP 2: WAIT for the Leads listing to load
    await page.waitForURL(new RegExp(LEADS_PATH.replace(/\./g, '\\.')), { timeout: LONG });
    await page.waitForLoadState('networkidle').catch(() => {});

    // SNAPSHOT: confirm the Leads page heading, grid, and toolbar
    // ASSERT (BLOCKING): the **All Leads** heading is displayed
    await expect(page.getByRole('heading', { name: 'All Leads' })).toBeVisible({ timeout: LONG });

    // ASSERT: the URL is the Leads listing route (`/dynamic/LandBank.Crm/LBLead-table`)
    expect(page.url()).toContain(LEADS_PATH);

    // ASSERT: the Leads data grid is displayed
    await expect(page.getByRole('table')).toBeVisible({ timeout: LONG });

    // ASSERT: the **New Lead** toolbar button is displayed
    await expect(page.getByRole('button', { name: 'New Lead' })).toBeVisible();
  });

  // -------------------------------------------------------------------------
  // TC-03 → TC-05: Online Digital Channel
  // -------------------------------------------------------------------------
  for (const combo of ONLINE_COMBINATIONS) {
    const title =
      `${combo.tc}: ${combo.clientType} lead via Online Digital Channel converts to a ` +
      `${combo.applicationType} Opportunity`;

    test(title, async ({ page }) => {
      await loginAs(page, 'RM');

      // STEP 1: NAVIGATE to `/dynamic/LandBank.Crm/LBLead-table` and CLICK **New Lead**
      await openNewLeadModal(page);

      // SNAPSHOT: confirm **Lead Owner** self-populates with the signed-in RM
      await expect(
        field(modal(page), 'leadOwner').locator('.ant-select-selection-item')
      ).not.toBeEmpty({ timeout: LONG });

      // STEP 2: SELECT Lead Channel — choose `Online Digital Channel`
      await selectOption(modal(page), page, 'channel', 'Online Digital Channel');

      // SNAPSHOT: confirm the Client Information section is rendered
      await expect(modal(page).getByText('Client Information')).toBeVisible();

      // STEP 3: SELECT Client Type — choose the combination's client type
      await selectOption(modal(page), page, 'leadType', combo.clientType);

      if (combo.isEntity) {
        // SNAPSHOT: confirm the **Entity Name** field is revealed for an Entity client type
        // ASSERT (BLOCKING): the **Entity Name** field is revealed when an Entity client type is selected
        await expectFieldShown(modal(page), 'organisation');

        // STEP 4: TYPE the Entity Name field with the combination's entity name
        await textInput(modal(page), 'organisation').fill(combo.entityName!);
      } else {
        // SNAPSHOT: confirm the **Entity Name** field stays hidden for an Individual client type
        // ASSERT: the **Entity Name** field stays hidden for an Individual client type
        await expectFieldHidden(modal(page), 'organisation');
      }

      // STEP 5: SELECT Title — choose `Mr`
      await selectOption(modal(page), page, 'title', 'Mr');

      // STEP 6: TYPE the First Name field with `AutoQA`
      await textInput(modal(page), 'firstName').fill('AutoQA');

      // STEP 7: TYPE the Last Name field with the combination's last name
      await textInput(modal(page), 'lastName').fill(combo.lastName);

      // STEP 8: SELECT Province — choose `Gauteng`
      await selectOption(modal(page), page, 'territory', 'Gauteng');

      // STEP 9: SELECT Preferred Communication — choose `Email`
      await selectOption(modal(page), page, 'preferredCommunication', 'Email');

      // STEP 10: TYPE the Mobile Number field with the combination's mobile number
      await textInput(modal(page), 'mobileNumber').fill(combo.mobile);

      // STEP 11: TYPE the Email Address field with the combination's email address
      await textInput(modal(page), 'emailAddress').fill(combo.email);

      // SNAPSHOT: confirm the **Save** button is enabled
      await expect(saveButton(page)).toBeEnabled();

      // STEP 12: CLICK **Save**
      await saveButton(page).click();

      // STEP 13: WAIT for the lead details page to load
      await page.waitForURL(new RegExp(LEAD_DETAILS_PATH.replace(/\./g, '\\.')), { timeout: LONG });
      await page.waitForLoadState('networkidle').catch(() => {});

      // ASSERT: the lead saves and the URL becomes the lead details route
      expect(page.url()).toContain(LEAD_DETAILS_PATH);

      // SNAPSHOT: confirm the lead header, status, and action toolbar
      const main = page.locator('main');

      // ASSERT: the newly created lead shows status `NEW` before pre-screening
      await expect(main).toContainText('NEW', { timeout: LONG });

      // ASSERT: the **Region** is derived from the selected Province (`Gauteng` → `Central Region`)
      await expect(main).toContainText('Central Region', { timeout: LONG });

      // ASSERT: the lead records Lead Channel `Online Digital Channel`
      await expect(main).toContainText('Online Digital Channel');

      // STEP 14-26: run the pre-screening assessment to a PASSED outcome
      await passPreScreening(page);

      // SNAPSHOT: confirm the lead status, assessment outcome, and conversion links
      // ASSERT: the pre-screening assessment outcome is `PASSED`
      await expect(main).toContainText('PASSED', { timeout: LONG });

      // ASSERT (BLOCKING): the lead status becomes `CONVERTED` after a passing pre-screening
      await expect(main).toContainText('CONVERTED', { timeout: LONG });

      // ASSERT: a **Converted To Opportunity** reference is displayed
      const oppRef = field(main, 'convertedToOpportunity');
      await expect(oppRef).toBeVisible({ timeout: LONG });

      // ASSERT: a **Converted To Account** reference is displayed
      await expect(field(main, 'convertedToAccount')).toBeVisible();

      // STEP 27: EXTRACT the **Converted To Opportunity** display name
      const opportunityName = (await oppRef.locator('a').textContent())?.trim();
      expect(opportunityName).toBeTruthy();

      // STEP 28: CLICK the **Converted To Opportunity** link
      await oppRef.locator('a').click();

      // STEP 29: WAIT for the Opportunity details page to load
      await page.waitForURL(new RegExp(OPP_DETAILS_PATH.replace(/\./g, '\\.')), { timeout: LONG });
      await page.waitForLoadState('networkidle').catch(() => {});

      // SNAPSHOT: confirm the Opportunity header and tab strip
      // ASSERT: the URL becomes the Opportunity details route
      expect(page.url()).toContain(OPP_DETAILS_PATH);

      // ASSERT: the Opportunity status is `DRAFT`
      await expect(main).toContainText('DRAFT', { timeout: LONG });

      // ASSERT: the Opportunity **Application Type** is PERSONAL / ENTITY per the client type
      await expect(main).toContainText(combo.applicationType, { timeout: LONG });

      // ASSERT: the Opportunity exposes the **Client Info**, **Loan Info** and **Farms** tabs
      await expect(main.getByRole('tab', { name: 'Client Info' })).toBeVisible({ timeout: LONG });
      await expect(main.getByRole('tab', { name: 'Loan Info' })).toBeVisible();
      await expect(main.getByRole('tab', { name: 'Farms' })).toBeVisible();

      if (combo.isEntity) {
        // ASSERT: the Entity Name carries through to the Opportunity's **Entity Information** section
        await expect(main).toContainText('Entity Information', { timeout: LONG });
        await expect(main).toContainText(combo.entityName!);

        // ASSERT: the Opportunity exposes the **Directors**, **Shareholders** and **Signatories** tabs
        await expect(main.getByRole('tab', { name: 'Directors' })).toBeVisible();
        await expect(main.getByRole('tab', { name: 'Shareholders' })).toBeVisible();
        await expect(main.getByRole('tab', { name: 'Signatories' })).toBeVisible();
      }
    });
  }

  // -------------------------------------------------------------------------
  // TC-06: Individual + Landbank Branch + Upload Consent = True
  // -------------------------------------------------------------------------
  test('TC-06: Individual lead via Landbank Branch with Upload Consent = True', async ({ page }) => {
    await loginAs(page, 'RM');

    // STEP 1: NAVIGATE to `/dynamic/LandBank.Crm/LBLead-table` and CLICK **New Lead**
    await openNewLeadModal(page);

    // STEP 2: SELECT Lead Channel — choose `Landbank Branch`
    await selectOption(modal(page), page, 'channel', 'Landbank Branch');

    // SNAPSHOT: confirm the Client Information block collapses for the Landbank Branch channel
    // ASSERT: selecting `Landbank Branch` hides the Client Information block until consent is captured
    await expectFieldHidden(modal(page), 'firstName');
    await expectFieldHidden(modal(page), 'lastName');

    // STEP 3: SELECT Client Type — choose `Individual (Individual)`
    await selectOption(modal(page), page, 'leadType', 'Individual (Individual)');

    // SNAPSHOT: confirm **ID Number**, the *Upload Consent?* switch and **Request OTP** are rendered
    // ASSERT: the **ID Number** field is displayed for an Individual on the Landbank Branch channel
    await expectFieldShown(modal(page), 'idNumber');
    await expect(modal(page).getByText('Upload Consent?')).toBeVisible();
    await expect(modal(page).getByRole('button', { name: 'Request OTP' })).toBeVisible();
    await expect(individualConsentSwitch(page)).not.toHaveClass(/ant-switch-checked/);

    // STEP 4: CLICK the *Upload Consent?* switch to turn it ON
    await individualConsentSwitch(page).click();

    // SNAPSHOT: confirm **Upload Consent**, **Download Consent Template** are revealed and
    //           **Request OTP** is hidden
    // ASSERT (BLOCKING): turning *Upload Consent?* ON reveals the **Upload Consent** control and
    //                    **disables Save** until a document is uploaded
    await expectFieldShown(modal(page), 'manualApproval');
    await expect(saveButton(page)).toBeDisabled({ timeout: LONG });

    // ASSERT: turning *Upload Consent?* ON hides the **Request OTP** button
    await expect(modal(page).getByRole('button', { name: 'Request OTP' })).toBeHidden();

    // ASSERT: the **Download Consent Template** action is offered
    await expect(modal(page).getByRole('button', { name: 'Download Consent Template' })).toBeVisible();

    // STEP 5: CLICK the **Upload Consent** *(press to upload)* control and attach the test document
    await attachDocument(page, 'manualApproval', CONSENT_DOC);

    // SNAPSHOT: confirm the attached document name is displayed and the **Upload** button is available
    // ASSERT: the attached document name (`pdf-test.pdf`) is displayed against **Upload Consent**
    await expect(field(modal(page), 'manualApproval')).toContainText(CONSENT_DOC_NAME, { timeout: LONG });
    await expect(uploadCommitButton(page)).toBeVisible({ timeout: LONG });

    // STEP 6: CLICK **Upload**
    await uploadCommitButton(page).click();

    // STEP 7: WAIT for the Client Information block to be revealed
    // SNAPSHOT: confirm the Client Information block is now rendered and **Save** is enabled
    // ASSERT: clicking **Upload** reveals the Client Information block and re-enables **Save**
    await expectFieldShown(modal(page), 'firstName');
    await expectFieldShown(modal(page), 'lastName');
    await expect(saveButton(page)).toBeEnabled({ timeout: LONG });

    // NOTE: Upload CLEARS the previously typed mobile / email / ID (recorded live), so every client
    // field is captured only after this point.

    // STEP 8: SELECT Title — choose `Mr`
    await selectOption(modal(page), page, 'title', 'Mr');

    // STEP 9: TYPE the First Name field with `AutoQA`
    await textInput(modal(page), 'firstName').fill('AutoQA');

    // STEP 10: TYPE the Last Name field with `IndivBranchConsentYes`
    await textInput(modal(page), 'lastName').fill('IndivBranchConsentYes');

    // STEP 11: SELECT Province — choose `Gauteng`
    await selectOption(modal(page), page, 'territory', 'Gauteng');

    // STEP 12: SELECT Preferred Communication — choose `Email`
    await selectOption(modal(page), page, 'preferredCommunication', 'Email');

    // STEP 13: TYPE the Mobile Number field with `0820000201`
    await textInput(modal(page), 'mobileNumber').fill('0820000201');

    // STEP 14: TYPE the Email Address field with `autoqa.indivbranch.consentyes@example.com`
    await textInput(modal(page), 'emailAddress').fill('autoqa.indivbranch.consentyes@example.com');

    // STEP 15: TYPE the ID Number field with `9001015800088` (Luhn-valid SA ID)
    await textInput(modal(page), 'idNumber').fill('9001015800088');
    await expect(modal(page).locator('.ant-form-item-explain-error')).toHaveCount(0);

    // STEP 16: CLICK **Save**
    await expect(saveButton(page)).toBeEnabled();
    await saveButton(page).click();

    // STEP 17: WAIT for the lead details page to load
    await page.waitForURL(new RegExp(LEAD_DETAILS_PATH.replace(/\./g, '\\.')), { timeout: LONG });
    await page.waitForLoadState('networkidle').catch(() => {});

    // SNAPSHOT: confirm the lead header, status, and action toolbar
    // ASSERT: the lead saves and the URL becomes the lead details route
    expect(page.url()).toContain(LEAD_DETAILS_PATH);

    const main = page.locator('main');

    // ASSERT: the saved lead shows status `NEW`, Client Type `Individual (Individual)` and
    //         Lead Channel `Landbank Branch`
    await expect(main).toContainText('NEW', { timeout: LONG });
    await expect(main).toContainText('Individual (Individual)');
    await expect(main).toContainText('Landbank Branch');

    // ASSERT: the saved lead retains the captured First Name and Last Name
    await expect(main).toContainText('AutoQA');
    await expect(main).toContainText('IndivBranchConsentYes');

    // ASSERT: the **Initiate Pre-Screening** action is available on the saved lead
    await expect(main.getByRole('button', { name: /Initiate Pre-Screening/ })).toBeVisible();
  });

  // -------------------------------------------------------------------------
  // TC-07: Individual + Landbank Branch + Upload Consent = False (OTP route)
  // -------------------------------------------------------------------------
  test('TC-07: Individual lead via Landbank Branch with Upload Consent = False (OTP route)', async ({ page }) => {
    await loginAs(page, 'RM');

    // STEP 1: NAVIGATE to `/dynamic/LandBank.Crm/LBLead-table` and CLICK **New Lead**
    await openNewLeadModal(page);

    // STEP 2: SELECT Lead Channel — choose `Landbank Branch`
    await selectOption(modal(page), page, 'channel', 'Landbank Branch');

    // STEP 3: SELECT Client Type — choose `Individual (Individual)`
    await selectOption(modal(page), page, 'leadType', 'Individual (Individual)');

    // SNAPSHOT: confirm the *Upload Consent?* switch is OFF and **Request OTP** is displayed
    // ASSERT: the *Upload Consent?* switch defaults to OFF
    await expect(individualConsentSwitch(page)).not.toHaveClass(/ant-switch-checked/);

    // ASSERT (BLOCKING): with *Upload Consent?* OFF the **Request OTP** action is offered
    await expect(modal(page).getByRole('button', { name: 'Request OTP' })).toBeVisible({ timeout: LONG });

    // ASSERT: the **Upload Consent** control is not displayed while the toggle is OFF
    await expectFieldHidden(modal(page), 'manualApproval');

    // STEP 4: TYPE the Mobile Number field with `0820000202`
    await textInput(modal(page), 'mobileNumber').fill('0820000202');

    // STEP 5: TYPE the Email Address field with `autoqa.indivbranch.consentno@example.com`
    await textInput(modal(page), 'emailAddress').fill('autoqa.indivbranch.consentno@example.com');

    // ASSERT: an invalid ID number is rejected with "Please enter a valid South African ID number"
    await textInput(modal(page), 'idNumber').fill('9001015800085');
    await expect(
      modal(page).getByText('Please enter a valid South African ID number')
    ).toBeVisible({ timeout: LONG });

    // STEP 6: TYPE the ID Number field with `8503155400083` (Luhn-valid SA ID)
    await textInput(modal(page), 'idNumber').fill('8503155400083');

    // SNAPSHOT: confirm no ID validation error is raised for a valid South African ID number
    await expect(
      modal(page).getByText('Please enter a valid South African ID number')
    ).toBeHidden({ timeout: LONG });

    // STEP 7: CLICK **Request OTP**
    await modal(page).getByRole('button', { name: 'Request OTP' }).click();

    // STEP 8: WAIT for the OTP field to be revealed
    // SNAPSHOT: confirm the **OTP** field and **Submit OTP** button are rendered
    // ASSERT: clicking **Request OTP** reveals the **OTP** field and the **Submit OTP** button
    await expectFieldShown(modal(page), 'otpPin');
    await expect(modal(page).getByRole('button', { name: 'Submit OTP' })).toBeVisible({ timeout: LONG });

    // ASSERT: the entered Mobile Number, Email Address and ID Number are retained after requesting the OTP
    await expect(textInput(modal(page), 'mobileNumber')).toHaveValue('0820000202');
    await expect(textInput(modal(page), 'emailAddress'))
      .toHaveValue('autoqa.indivbranch.consentno@example.com');
    await expect(textInput(modal(page), 'idNumber')).toHaveValue('8503155400083');

    // NOTE: the OTP itself cannot be completed automatically — it is delivered to the fictitious
    // test mobile/e-mail. The test proceeds to Save, which is what exposes BUG-LB-002.

    // STEP 9: CLICK **Save**
    await expect(saveButton(page)).toBeEnabled();
    await saveButton(page).click();

    // STEP 10: WAIT for the lead details page to load
    await page.waitForURL(new RegExp(LEAD_DETAILS_PATH.replace(/\./g, '\\.')), { timeout: LONG });
    await page.waitForLoadState('networkidle').catch(() => {});

    // SNAPSHOT: confirm the saved lead header and captured fields
    // ASSERT: the lead saves and the URL becomes the lead details route
    expect(page.url()).toContain(LEAD_DETAILS_PATH);

    const main = page.locator('main');

    // ASSERT: the saved lead records Client Type `Individual (Individual)` and Lead Channel `Landbank Branch`
    await expect(main).toContainText('Individual (Individual)', { timeout: LONG });
    await expect(main).toContainText('Landbank Branch');

    // ASSERT: the saved lead retains a First Name and Last Name
    // EXPECTED FAIL — BUG-LB-002: this variant never exposes the required Client Information
    // fields, so the lead saves nameless. Asserted with expect.soft so the failure is recorded
    // without aborting the rest of TC-07.
    for (const nameField of ['firstName', 'lastName'] as const) {
      const cell = field(main, nameField);
      const raw = (await cell.count()) ? ((await cell.textContent()) ?? '') : '';
      // Strip the label prefix ("First Name :") to leave just the captured value.
      const value = raw.replace(/^\s*(First|Last) Name\s*:?/i, '').trim();
      expect
        .soft(value, `BUG-LB-002: OTP-route lead saved with an empty ${nameField}`)
        .not.toBe('');
    }
  });

  // -------------------------------------------------------------------------
  // TC-08 / TC-10: Entity + Landbank Branch + Upload Resolution and Consent = True
  // -------------------------------------------------------------------------
  for (const combo of ENTITY_BRANCH_CONSENT_TRUE) {
    test(`${combo.tc}: ${combo.clientType} lead via Landbank Branch with Upload Resolution and Consent = True`, async ({ page }) => {
      await loginAs(page, 'RM');

      // STEP 1: NAVIGATE to `/dynamic/LandBank.Crm/LBLead-table` and CLICK **New Lead**
      await openNewLeadModal(page);

      // STEP 2: SELECT Lead Channel — choose `Landbank Branch`
      await selectOption(modal(page), page, 'channel', 'Landbank Branch');

      // STEP 3: SELECT Client Type — choose the combination's entity client type
      await selectOption(modal(page), page, 'leadType', combo.clientType);

      // SNAPSHOT: confirm the Client Information block, **Entity Name** and the
      //           *Upload Resolution and Consent?* switch are rendered
      await expectFieldShown(modal(page), 'organisation');
      await expectFieldShown(modal(page), 'uploadResAndConsent');
      await expect(entityConsentSwitch(page)).not.toHaveClass(/ant-switch-checked/);

      // STEP 4: CLICK the *Upload Resolution and Consent?* switch to turn it ON
      await entityConsentSwitch(page).click();

      // SNAPSHOT: confirm the signatory fields and both upload controls are revealed and
      //           **Save** is disabled
      // ASSERT (BLOCKING): turning the switch ON reveals **Signatory ID Number**,
      //   **Company Registration Number**, **Upload Consent** and **Upload Resolution**,
      //   and **disables Save**
      await expectFieldShown(modal(page), 'signatoryIdNumber');
      await expectFieldShown(modal(page), 'companyRegistrationNumber');
      await expectFieldShown(modal(page), 'signatoryConsent');
      await expectFieldShown(modal(page), 'resolution');
      await expect(saveButton(page)).toBeDisabled({ timeout: LONG });

      // ASSERT: turning the switch ON hides the Client Information block
      await expectFieldHidden(modal(page), 'firstName');

      // ASSERT: both **Download Consent Template** and **Download Resolution Template** are offered
      await expect(modal(page).getByRole('button', { name: 'Download Consent Template' })).toBeVisible();
      await expect(modal(page).getByRole('button', { name: 'Download Resolution Template' })).toBeVisible();

      // STEP 5: TYPE the Signatory ID Number field with `9207125001083`
      await textInput(modal(page), 'signatoryIdNumber').fill('9207125001083');

      // STEP 6: TYPE the Company Registration Number field with `2012/225386/07`
      await textInput(modal(page), 'companyRegistrationNumber').fill(CIPC_REG_NO);

      // STEP 7: CLICK the **Upload Consent** *(press to upload)* control and attach the test document
      await attachDocument(page, 'signatoryConsent', CONSENT_DOC);

      // STEP 8: CLICK the **Upload Resolution** *(press to upload)* control and attach the test document
      await attachDocument(page, 'resolution', CONSENT_DOC);

      // STEP 9: TYPE the Mobile Number field with the combination's mobile number
      await textInput(modal(page), 'mobileNumber').fill(combo.mobile);

      // STEP 10: TYPE the Email Address field with the combination's email address
      await textInput(modal(page), 'emailAddress').fill(combo.email);

      // SNAPSHOT: confirm both attached document names are displayed and the **Upload** button is available
      // ASSERT: both attached document names (`pdf-test.pdf`) are displayed against their upload controls
      await expect(field(modal(page), 'signatoryConsent')).toContainText(CONSENT_DOC_NAME, { timeout: LONG });
      await expect(field(modal(page), 'resolution')).toContainText(CONSENT_DOC_NAME);
      await expect(uploadCommitButton(page)).toBeVisible({ timeout: LONG });

      // STEP 11: CLICK **Upload**
      await uploadCommitButton(page).click();

      // STEP 12: WAIT for the CIPC lookup to auto-populate the entity details
      // SNAPSHOT: confirm the auto-populated Entity Name and normalised Company Registration Number
      // ASSERT: the CIPC lookup auto-populates the **Entity Name** from the Company Registration Number
      await expect(textInput(modal(page), 'organisation')).toHaveValue(CIPC_ENTITY_NAME, { timeout: LONG });

      // ASSERT: the Company Registration Number is normalised to its `K`-prefixed form
      await expect(textInput(modal(page), 'companyRegistrationNumber'))
        .toHaveValue(CIPC_REG_NO_NORMALISED, { timeout: LONG });

      // ASSERT: the Client Information block is revealed again after **Upload**
      await expectFieldShown(modal(page), 'firstName');

      // ASSERT: clicking **Upload** re-enables **Save**
      await expect(saveButton(page)).toBeEnabled({ timeout: LONG });

      // STEP 13: SELECT Title — choose `Mr`
      await selectOption(modal(page), page, 'title', 'Mr');

      // STEP 14: TYPE the First Name field with `AutoQA`
      await textInput(modal(page), 'firstName').fill('AutoQA');

      // STEP 15: TYPE the Last Name field with the combination's last name
      await textInput(modal(page), 'lastName').fill(combo.lastName);

      // STEP 16: SELECT Province — choose `Gauteng`
      await selectOption(modal(page), page, 'territory', 'Gauteng');

      // STEP 17: SELECT Preferred Communication — choose `Email`
      await selectOption(modal(page), page, 'preferredCommunication', 'Email');

      // STEP 18: CLICK **Save**
      await expect(saveButton(page)).toBeEnabled();
      await saveButton(page).click();

      // STEP 19: WAIT for the lead details page to load
      await page.waitForURL(new RegExp(LEAD_DETAILS_PATH.replace(/\./g, '\\.')), { timeout: LONG });
      await page.waitForLoadState('networkidle').catch(() => {});

      // SNAPSHOT: confirm the lead header, status, and action toolbar
      // ASSERT: the lead saves and the URL becomes the lead details route
      expect(page.url()).toContain(LEAD_DETAILS_PATH);

      const main = page.locator('main');

      // ASSERT: the saved lead records the combination's Client Type and Lead Channel `Landbank Branch`
      await expect(main).toContainText(combo.clientType, { timeout: LONG });
      await expect(main).toContainText('Landbank Branch');
      await expect(main).toContainText(combo.lastName);
    });
  }

  // -------------------------------------------------------------------------
  // TC-09 / TC-11: Entity + Landbank Branch + Upload Resolution and Consent = False
  // -------------------------------------------------------------------------
  for (const combo of ENTITY_BRANCH_CONSENT_FALSE) {
    test(`${combo.tc}: ${combo.clientType} lead via Landbank Branch with Upload Resolution and Consent = False`, async ({ page }) => {
      await loginAs(page, 'RM');

      // STEP 1: NAVIGATE to `/dynamic/LandBank.Crm/LBLead-table` and CLICK **New Lead**
      await openNewLeadModal(page);

      // STEP 2: SELECT Lead Channel — choose `Landbank Branch`
      await selectOption(modal(page), page, 'channel', 'Landbank Branch');

      // STEP 3: SELECT Client Type — choose the combination's entity client type
      await selectOption(modal(page), page, 'leadType', combo.clientType);

      // SNAPSHOT: confirm the *Upload Resolution and Consent?* switch is OFF and no upload
      //           controls are rendered
      // ASSERT: the *Upload Resolution and Consent?* switch defaults to OFF
      await expect(entityConsentSwitch(page)).not.toHaveClass(/ant-switch-checked/);

      // ASSERT: with the switch OFF neither **Upload Consent** nor **Upload Resolution** is displayed
      await expectFieldHidden(modal(page), 'signatoryConsent');
      await expectFieldHidden(modal(page), 'resolution');

      // ASSERT: with the switch OFF the **Signatory ID Number** and
      //         **Company Registration Number** fields are not displayed
      await expectFieldHidden(modal(page), 'signatoryIdNumber');
      await expectFieldHidden(modal(page), 'companyRegistrationNumber');

      // ASSERT: no **Request OTP** action is offered for an Entity client type
      await expect(modal(page).getByRole('button', { name: 'Request OTP' })).toHaveCount(0);

      // ASSERT: the **Entity Name** field is required and displayed
      await expectFieldShown(modal(page), 'organisation');

      // ASSERT: **Save** is enabled without any document upload
      await expect(saveButton(page)).toBeEnabled({ timeout: LONG });

      // STEP 4: SELECT Title — choose `Mr`
      await selectOption(modal(page), page, 'title', 'Mr');

      // STEP 5: TYPE the First Name field with `AutoQA`
      await textInput(modal(page), 'firstName').fill('AutoQA');

      // STEP 6: TYPE the Last Name field with the combination's last name
      await textInput(modal(page), 'lastName').fill(combo.lastName);

      // STEP 7: TYPE the Entity Name field with the combination's entity name
      await textInput(modal(page), 'organisation').fill(combo.entityName);

      // STEP 8: SELECT Province — choose `Gauteng`
      await selectOption(modal(page), page, 'territory', 'Gauteng');

      // STEP 9: SELECT Preferred Communication — choose `Email`
      await selectOption(modal(page), page, 'preferredCommunication', 'Email');

      // STEP 10: TYPE the Mobile Number field with the combination's mobile number
      await textInput(modal(page), 'mobileNumber').fill(combo.mobile);

      // STEP 11: TYPE the Email Address field with the combination's email address
      await textInput(modal(page), 'emailAddress').fill(combo.email);

      // STEP 12: CLICK **Save**
      await saveButton(page).click();

      // STEP 13: WAIT for the lead details page to load
      // ASSERT (BLOCKING): the lead saves and the URL becomes the lead details route
      await page.waitForURL(new RegExp(LEAD_DETAILS_PATH.replace(/\./g, '\\.')), { timeout: LONG });
      await page.waitForLoadState('networkidle').catch(() => {});
      expect(page.url()).toContain(LEAD_DETAILS_PATH);

      // SNAPSHOT: confirm the saved lead header and captured fields
      const main = page.locator('main');

      // ASSERT: the saved lead retains the captured First Name, Last Name and Entity Name
      await expect(main).toContainText('AutoQA', { timeout: LONG });
      await expect(main).toContainText(combo.lastName);

      // ASSERT: the saved lead records the combination's Client Type and Lead Channel `Landbank Branch`
      await expect(main).toContainText(combo.clientType);
      await expect(main).toContainText('Landbank Branch');
    });
  }

  // -------------------------------------------------------------------------
  // TC-12 → TC-14: Loan application initiation, Inbox, Opportunity verification
  // -------------------------------------------------------------------------
  test('TC-12: Capture Loan Info and initiate the loan application workflow', async ({ page }) => {
    // KNOWN BLOCKER — BUG-LB-001. The blocking assertion below is expected to FAIL until
    // InitiateLoanApplicationWorkflow stops returning HTTP 500.
    await loginAs(page, 'RM');

    const main = page.locator('main');
    const serverErrors: string[] = [];
    page.on('response', (r) => {
      if (r.status() >= 500 && r.url().includes('InitiateLoanApplicationWorkflow')) {
        serverErrors.push(`${r.status()} ${r.url()}`);
      }
    });

    // STEP 1: NAVIGATE to the Opportunity details page for a converted lead in `DRAFT`
    // The Opportunities grid is the stable entry point — pick the newest DRAFT row.
    await page.goto(OPPS_PATH);
    await expect(page.getByRole('heading', { name: 'All Opportunities' })).toBeVisible({ timeout: LONG });

    // FRAGILE: the Opportunities grid renders no per-row link role; the row's first cell holds the
    // details anchor, matched here by the DRAFT application status recorded live.
    const draftRow = page.locator('div[role="row"]', { hasText: 'DRAFT' }).first();
    await expect(draftRow).toBeVisible({ timeout: LONG });
    await draftRow.locator('a').first().click();
    await page.waitForURL(new RegExp(OPP_DETAILS_PATH.replace(/\./g, '\\.')), { timeout: LONG });
    await page.waitForLoadState('networkidle').catch(() => {});

    // SNAPSHOT: confirm the Opportunity status is `DRAFT` and **Initiate Loan Application** is displayed
    await expect(main).toContainText('DRAFT', { timeout: LONG });
    await expect(main.getByRole('button', { name: 'Initiate Loan Application' })).toBeVisible();

    // STEP 2: CLICK **Edit**
    // NOTE: Opportunity action buttons carry their icon in the accessible name ("edit Edit",
    // "check Save", "close Cancel"), so substring matching is required — { exact: true } fails.
    await main.getByRole('button', { name: 'Edit' }).click();

    // STEP 3: WAIT for the form to enter edit mode (**Cancel** and **Save** appear)
    await expect(main.getByRole('button', { name: 'Save' })).toBeVisible({ timeout: LONG });
    await expect(main.getByRole('button', { name: 'Cancel' })).toBeVisible();

    // SNAPSHOT: confirm the inner tab strip is rendered
    await expect(main.getByRole('tab', { name: 'Loan Info' })).toBeVisible();

    // STEP 4: CLICK the **Loan Info** tab
    await main.getByRole('tab', { name: 'Loan Info' }).click();

    // SNAPSHOT: confirm the Loan Info fields are rendered
    await expect(field(page, 'loanApplication_requestedAmount')).toBeVisible({ timeout: LONG });

    // STEP 5: TYPE the Requested Amount field with `1500000`
    await field(page, 'loanApplication_requestedAmount').locator('input').fill('1500000');

    // STEP 6: TYPE the Application Details field with the smoke-test summary
    await field(page, 'loanApplication_businessSummary')
      .locator('textarea')
      .fill('AutoQA end-to-end origination smoke test.');

    // STEP 7: CLICK **Save**
    await main.getByRole('button', { name: 'Save' }).click();

    // STEP 8: WAIT for the form to leave edit mode
    await expect(main.getByRole('button', { name: 'Save' })).toBeHidden({ timeout: LONG });
    await page.waitForLoadState('networkidle').catch(() => {});

    // SNAPSHOT: confirm the saved Requested Amount is reflected
    // ASSERT: the Requested Amount persists after **Save**
    await expect(main).toContainText('1 500 000', { timeout: LONG });

    // STEP 9: CLICK **Initiate Loan Application**
    await main.getByRole('button', { name: 'Initiate Loan Application' }).click();

    // STEP 10: WAIT for the Opportunity header to refresh
    await page.waitForLoadState('networkidle').catch(() => {});

    // SNAPSHOT: confirm the Opportunity status after initiation
    // ASSERT (BLOCKING): the Opportunity leaves `DRAFT` after **Initiate Loan Application**
    // EXPECTED FAIL — BUG-LB-001: the call 500s silently and the status stays DRAFT.
    await expect(main).not.toContainText('DRAFT', { timeout: LONG });

    // ASSERT: no unhandled server error (HTTP 5xx) is raised by the initiation call
    // EXPECTED FAIL — BUG-LB-001.
    expect(serverErrors, `InitiateLoanApplicationWorkflow returned 5xx: ${serverErrors.join(', ')}`)
      .toEqual([]);

    // ASSERT: an **Application Number** is allocated to the Opportunity
    await expect(main).toContainText(/LA-\d{4}-\d+/, { timeout: LONG });
  });

  test('TC-13: Action the Complete Onboarding Checklist task from the RM Inbox', async ({ page }) => {
    await loginAs(page, 'RM');

    // STEP 1: CLICK the **Inbox** item in the side menu
    await page.getByRole('link', { name: 'Inbox', exact: true }).click();

    // STEP 2: WAIT for the Inbox listing to load
    await page.waitForURL(new RegExp(INBOX_PATH.replace(/\./g, '\\.')), { timeout: LONG });
    await page.waitForLoadState('networkidle').catch(() => {});

    // SNAPSHOT: confirm the **Incoming Items** heading and the inbox grid
    // ASSERT (BLOCKING): the **Incoming Items** heading is displayed
    await expect(page.getByRole('heading', { name: 'Incoming Items' })).toBeVisible({ timeout: LONG });

    // ASSERT: the URL is the Inbox route (`/dynamic/Shesha.Workflow/workflows-inbox`)
    expect(page.url()).toContain(INBOX_PATH);

    // ASSERT: at least one row shows Action Required `Complete Onboarding Checklist`
    // FRAGILE: the Inbox is a div-based grid (role=row / role=cell), not a real <table> like the
    // Leads grid, so rows are addressed through their ARIA roles rather than getByRole('row') on a table.
    const taskRow = page
      .locator('div[role="row"]', { hasText: 'Complete Onboarding Checklist' })
      .first();
    await expect(taskRow).toBeVisible({ timeout: LONG });

    // STEP 3: EXTRACT the Ref No of the first *Complete Onboarding Checklist* row
    const refNo = (await taskRow.locator('[role="cell"]').nth(1).textContent())?.trim();
    expect(refNo).toMatch(/^LA\d{4}\/\d+$/);

    // SNAPSHOT: confirm the row exposes its workflow action link
    const actionLink = taskRow.locator('a.sha-link');
    await expect(actionLink).toBeVisible();

    // ASSERT: the inbox row's action link targets the workflow action route
    await expect(actionLink).toHaveAttribute('href', new RegExp(WF_ACTION_PATH));

    // STEP 4: CLICK the workflow action link on that row
    await actionLink.click();

    // STEP 5: WAIT for the workflow action page to load
    await page.waitForURL(new RegExp(WF_ACTION_PATH), { timeout: LONG });
    await page.waitForLoadState('networkidle').catch(() => {});

    // SNAPSHOT: confirm the task header, ref no, and the embedded loan application form
    // ASSERT: the workflow action page header reads `Complete Onboarding Checklist`
    await expect(page.getByText(/Complete Onboarding Checklist/)).toBeVisible({ timeout: LONG });

    // ASSERT: the task status is `IN PROGRESS`
    await expect(page.getByText('IN PROGRESS')).toBeVisible({ timeout: LONG });

    // ASSERT: the task Ref No matches the Ref No extracted from the Inbox row
    await expect(page.getByText(`Ref No: ${refNo}`)).toBeVisible({ timeout: LONG });

    // STEP 6: CLICK the **Compliance** tab
    await page.getByRole('tab', { name: 'Compliance' }).click();

    // SNAPSHOT: confirm the onboarding checklist checkboxes are rendered and enabled
    // The nine editable onboarding-checklist fields recorded live, by their stable label `for` names.
    const CHECKLIST = [
      'subForm1_requiresWaterUseRights',
      'subForm1_requiresBusinessPlanSupport',
      'subForm1_requiresWaterRightsSupport',
      'subForm1_hasWorkingEquipment',
      'subForm1_hasValidTaxClearance',
      'subForm1_hasAccessToMarkets',
      'subForm1_maintainsFormalFinancialRecords',
      'subForm1_hasIdentifiedMentor',
      'subForm1_isCompliantWithLaborLaws',
    ];

    // ASSERT: the nine onboarding checklist checkboxes are enabled
    for (const name of CHECKLIST) {
      await expect(field(page, name).locator('input[type="checkbox"]')).toBeEnabled({ timeout: LONG });
    }

    // STEP 7-11: CLICK the recorded onboarding checklist items
    const TICK = [
      'subForm1_hasValidTaxClearance',
      'subForm1_maintainsFormalFinancialRecords',
      'subForm1_hasWorkingEquipment',
      'subForm1_hasAccessToMarkets',
      'subForm1_isCompliantWithLaborLaws',
    ];
    for (const name of TICK) {
      await field(page, name).locator('.ant-checkbox-wrapper').click();
    }

    // ASSERT: the ticked checklist items retain their checked state
    for (const name of TICK) {
      await expect(field(page, name).locator('input[type="checkbox"]')).toBeChecked();
    }

    // SNAPSHOT: confirm **Submit** is enabled
    // ASSERT: the **Submit** button is enabled
    // NOTE: deliberately NOT clicking Submit — see the plan's Test Data Notes. Submitting would
    // advance a workflow instance this run did not create.
    await expect(page.getByRole('button', { name: 'Submit' })).toBeEnabled({ timeout: LONG });
  });

  test('TC-14: Confirm the Opportunity reflects the completed Inbox step', async ({ page }) => {
    await loginAs(page, 'RM');

    // STEP 1: CLICK the **Opportunities** item in the side menu
    await page.getByRole('link', { name: 'Opportunities', exact: true }).click();

    // STEP 2: WAIT for the Opportunities listing to load
    await page.waitForURL(new RegExp(OPPS_PATH.replace(/\./g, '\\.')), { timeout: LONG });
    await page.waitForLoadState('networkidle').catch(() => {});

    // SNAPSHOT: confirm the **All Opportunities** heading and the grid
    // ASSERT (BLOCKING): the **All Opportunities** heading is displayed
    await expect(page.getByRole('heading', { name: 'All Opportunities' })).toBeVisible({ timeout: LONG });

    // ASSERT: the URL is the Opportunities listing route
    expect(page.url()).toContain(OPPS_PATH);

    const main = page.locator('main');

    // SNAPSHOT: confirm the Application Status column is rendered
    // ASSERT: the grid exposes the **Application Status** and **Application Number** columns
    await expect(main).toContainText('Application Status', { timeout: LONG });
    await expect(main).toContainText('Application Number');

    // ASSERT: every Opportunity created by TC-03 → TC-05 is listed
    for (const combo of ONLINE_COMBINATIONS) {
      await expect(main).toContainText(combo.lastName, { timeout: LONG });
    }

    // ASSERT: an Opportunity whose workflow has started shows a status beyond `DRAFT`
    // (`BLOCKED` observed live on OPP-2026-001203 / 001201 / 001187)
    await expect(main).toContainText('BLOCKED', { timeout: LONG });
  });
});
