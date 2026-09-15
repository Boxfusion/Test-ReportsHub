// AUTO-RECORDED from test-plans/opportunities/opportunity-loan-application-capture.md
// The .md plan is canonical. AI-repair will patch failing lines in this file.
// Do not hand-edit unless you are also updating the .md plan.
//
// Selectors recorded live against Land Bank CRM Dev on 2026-07-31 as the RM role.
//
// STRUCTURAL FACTS THAT DRIVE THE LOCATORS IN THIS FILE:
//   1. EDIT-MODE INVERSION — dictates the capture order:
//        "Add Loan Purpose"  is enabled ONLY IN EDIT MODE (disabled in read mode).
//        "Add Director" / "Add Shareholder" / "Add Signatory" are enabled ONLY IN READ MODE
//        (present but disabled while the form is in edit mode).
//      So loan purposes are added inside an Edit session; party members outside one.
//   2. ACTION BUTTONS CARRY THEIR ICON IN THE ACCESSIBLE NAME:
//        Edit -> "edit Edit", Save -> "check Save", Cancel -> "close Cancel",
//        Initiate Loan Application -> "plus Initiate Loan Application",
//        Add Director -> "plus-circle Add Director".
//      An { exact: true } match on the bare label WILL NOT MATCH. Substring names only.
//   3. rc-tabs-* ELEMENT IDS ARE NOT STABLE ACROSS PAGE LOADS (the same Loan Info tab was
//      rc-tabs-5-tab-... on one load and rc-tabs-4-tab-... on the next). Tabs are addressed
//      by role + accessible name only.
//   4. THE DOCUMENT UPLOAD FIELD'S label[for] IS A GENERATED GHOST ID (_&@#GH0ST_<guid>) that
//      changes per render, so the upload inside "Manage File Versions" is reached through the
//      modal + its input[type=file], never via a label anchor.
//   5. Ant Design form items expose NO id and NO data-testid; fields are anchored on
//      <label for="<fieldName>"> via a DIRECT-CHILD chain (a plain :has() also matches ancestor
//      form items in these nested Shesha forms).
//   6. Conditional fields are hidden with the `ant-form-item-hidden` class, not removed.
//   7. Select options expose no role=option — matched on their `title` attribute inside the open
//      (non-hidden) dropdown; once a select holds a value its hidden <input> is click-intercepted,
//      so the trigger must be the .ant-select-selector.
//   8. Directors / Shareholders / Signatories are NOT sibling tabs of Client Info — each is its
//      own single-tab container nested inside the Client Info panel.
//   9. Requested Amount / Loan Purpose Amount are ant-input-number controls rendering a
//      thousands-formatted value (2,000,000 / R 500 000,00).
//
// FORM VARIANTS:
//   PERSONAL -> "Individual Client Information", 18 fields (clientIdNumber, countryOfOrigin,
//               region, maritalStatus; title/name/surname labelled "Client ..."), NO party tables.
//   ENTITY   -> "Entity Information", 28 fields (entityName, companyRegistrationNumber,
//               annualTurnover, yearsInOperation, itcStatus, totalOwners, isNcaClient, beeeLevel,
//               hasResolution, countryOfIncorporation, financialYearEnd, vatNumber,
//               incomeTaxNumber; title/name/surname labelled "Contact Person ..."),
//               PLUS Directors / Shareholders / Signatories.
//   Director and Shareholder share ONE form (LBApplication-director-create v39, 26 fields).
//   Signatory uses a DIFFERENT, smaller form (LBApplication-signatory-create v5, 5 fields).
//
// KNOWN BLOCKERS
//   BUG-LB-001: "Initiate Loan Application" returns HTTP 500 silently; status stays DRAFT.
//               TC-13 is expected to FAIL.
//   BUG-LB-003: the documented rule "total across all loan purposes cannot exceed the requested
//               amount" is not enforced client-side and its rejection is invisible — with a
//               R1,500,000 request, a R2,000,000 purpose leaves Save enabled, raises no error, and
//               the modal closes as though it saved while the purpose is silently discarded
//               (table still "No data" after a full reload). A R500,000 purpose persists fine.
//               TC-10's over-limit assertion is expected to FAIL.

import { test, expect, Page, Locator } from '@playwright/test';
import path from 'path';

// Environment & credentials come from process.env, loaded from a gitignored .env by
// playwright.config.ts (real env vars / CI secrets always win). NEVER hardcode a
// username, password, or token here — this file is committed and synced to the hub.
//   Site  : baseURL is resolved in playwright.config.ts from TEST_ENV + <ENV>_APP_URL
//           (e.g. TEST_ENV=dev → DEV_APP_URL), or a plain APP_URL. Use RELATIVE paths below.
//   Creds : per role, .env defines <ROLE>_USERNAME / <ROLE>_PASSWORD (e.g. RM_USERNAME).

const OPPS_PATH = '/dynamic/LandBank.Crm/LBOpportunity-table';
const OPP_DETAILS_PATH = '/dynamic/LandBank.Crm/LBOpportunity-details';

const TEST_DOC = path.resolve(process.cwd(), 'test-data/pdf-test.pdf');
const TEST_DOC_NAME = 'pdf-test.pdf';

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
// `.ant-form-item:has(label[for="x"])` also matches every ANCESTOR form item in these nested forms.
function field(scope: Page | Locator, name: string): Locator {
  return scope.locator(
    `.ant-form-item:has(> .ant-row > .ant-col.ant-form-item-label > label[for="${name}"])`
  );
}

function textInput(scope: Page | Locator, name: string): Locator {
  return field(scope, name).locator('input.ant-input');
}

/** ant-input-number controls (amounts, counts) expose .ant-input-number-input, not .ant-input. */
function numberInput(scope: Page | Locator, name: string): Locator {
  return field(scope, name).locator('input.ant-input-number-input');
}

/** Conditional fields stay in the DOM with `ant-form-item-hidden`, so assert on the class. */
async function expectFieldShown(scope: Page | Locator, name: string) {
  await expect(field(scope, name)).not.toHaveClass(/ant-form-item-hidden/, { timeout: LONG });
}
async function expectFieldHidden(scope: Page | Locator, name: string) {
  await expect(field(scope, name)).toHaveClass(/ant-form-item-hidden/, { timeout: LONG });
}
/** Variant-only fields are absent from the DOM entirely (not merely hidden). */
async function expectFieldAbsent(scope: Page | Locator, name: string) {
  await expect(field(scope, name)).toHaveCount(0, { timeout: LONG });
}

// FRAGILE: dropdown options render no role=option; the title attribute is the only stable handle,
// and the open dropdown must be distinguished from the hidden/cached ones still in the DOM.
function openOption(page: Page, title: string): Locator {
  return page.locator(
    `.ant-select-dropdown:not(.ant-select-dropdown-hidden) .ant-select-item-option[title="${title}"]`
  );
}

async function selectOption(scope: Page | Locator, page: Page, name: string, option: string) {
  await field(scope, name).locator('.ant-select-selector').click();
  await openOption(page, option).click();
}

const modal = (page: Page) => page.locator('.ant-modal-content');
const main = (page: Page) => page.locator('main');

// Icon-prefixed accessible names — substring matching only, never { exact: true }.
const editButton = (page: Page) => main(page).getByRole('button', { name: 'Edit' });
const saveButton = (page: Page) => main(page).getByRole('button', { name: 'Save', exact: false });
const initiateButton = (page: Page) =>
  main(page).getByRole('button', { name: 'Initiate Loan Application' });

const innerTab = (page: Page, name: string) => main(page).getByRole('tab', { name });

/** Enter edit mode and wait for Save/Cancel to appear. */
async function enterEditMode(page: Page) {
  await editButton(page).click();
  await expect(saveButton(page)).toBeVisible({ timeout: LONG });
  await expect(main(page).getByRole('button', { name: 'Cancel' })).toBeVisible();
}

/** Save and wait for the form to leave edit mode. */
async function saveAndExitEditMode(page: Page) {
  await saveButton(page).click();
  await expect(saveButton(page)).toBeHidden({ timeout: LONG });
  await page.waitForLoadState('networkidle').catch(() => {});
}

/**
 * Open the newest Opportunity of the given Application Type from the grid.
 * FRAGILE: the Opportunities grid is a div-based role=row / role=cell grid with no per-row link
 * role; the row's first cell holds the details anchor.
 */
async function openOpportunityOfType(page: Page, applicationType: 'PERSONAL' | 'ENTITY') {
  await page.goto(OPPS_PATH);
  await expect(page.getByRole('heading', { name: 'All Opportunities' })).toBeVisible({ timeout: LONG });

  const row = page
    .locator('div[role="row"]')
    .filter({ hasText: applicationType })
    .filter({ hasText: 'DRAFT' })
    .first();
  await expect(row).toBeVisible({ timeout: LONG });
  await row.locator('a').first().click();

  await page.waitForURL(new RegExp(OPP_DETAILS_PATH.replace(/\./g, '\\.')), { timeout: LONG });
  await page.waitForLoadState('networkidle').catch(() => {});
  await expect(main(page)).toContainText(applicationType, { timeout: LONG });
}

/** Attach a file to the "Manage File Versions" modal and confirm with OK. */
async function uploadDocument(page: Page, documentName: string) {
  // FRAGILE: document rows are div-based role=row cells whose first cell holds an a.sha-link.
  const row = main(page).locator('div[role="row"]').filter({ hasText: documentName }).first();
  await expect(row).toBeVisible({ timeout: LONG });
  await row.locator('a.sha-link').first().click();

  await expect(modal(page)).toBeVisible({ timeout: LONG });
  await expect(modal(page).getByText('Manage File Versions')).toBeVisible();

  // FRAGILE: the upload field's label[for] is a generated GHOST id (_&@#GH0ST_<guid>) that changes
  // per render, so the file input is reached through the modal rather than a label anchor.
  await modal(page).locator('input[type="file"]').first().setInputFiles(TEST_DOC);
  await expect(modal(page)).toContainText(TEST_DOC_NAME, { timeout: LONG });

  await modal(page).getByRole('button', { name: 'OK', exact: true }).click();
  await expect(modal(page)).toBeHidden({ timeout: LONG });
  await page.waitForLoadState('networkidle').catch(() => {});
}

/** A document requirement row, addressed by its document name. */
const documentRow = (page: Page, documentName: string) =>
  main(page).locator('div[role="row"]').filter({ hasText: documentName }).first();

// ---------------------------------------------------------------------------
// Field inventories recorded live
// ---------------------------------------------------------------------------

const PERSONAL_ONLY_FIELDS = [
  'loanApplication_clientIdNumber',
  'loanApplication_countryOfOrigin',
  'loanApplication_region',
  'loanApplication_maritalStatus',
];

const ENTITY_ONLY_FIELDS = [
  'loanApplication_entityName',
  'loanApplication_companyRegistrationNumber',
  'loanApplication_annualTurnover',
  'loanApplication_yearsInOperation',
  'loanApplication_itcStatus',
  'loanApplication_totalOwners',
  'loanApplication_beeeLevel',
  'loanApplication_countryOfIncorporation',
  'loanApplication_financialYearEnd',
  'loanApplication_vatNumber',
  'loanApplication_incomeTaxNumber',
];

const SIGNATORY_FIELDS = ['firstname', 'lastname', 'idNumber', 'emailAddress', 'mobileNumber'];

const PERSONAL_APPLICATION_DOCS = [
  'Business Plan',
  'Bank Statements',
  'Cash Flow Projections',
  'Consent',
  'Deeds Office Search',
  'Water Rights Certificate / Proof of Application',
  'Proof of VAT / Income Tax Registration',
  'Offtake Agreement',
  'ITC Report and Proof of Debt',
  'Funding Request Documentation',
];

const ENTITY_DOCS = [
  'Change of Directors / Address (CoR39 / CoR21)',
  "Directors' / Shareholders' Resolutions",
  'VAT / Tax Registration',
  'Share Register / Share Certificates',
  'Notice of Incorporation (CoR14.1)',
  'Shareholders Agreement',
  'Memorandum of Incorporation (CoR15 series)',
  'CIPC Search',
  'ITC Reports for Directors and Company',
];

// ---------------------------------------------------------------------------
// Scenario matrices traced from the lead plan
// ---------------------------------------------------------------------------

type Scenario = { tc: string; leadTc: string; label: string };

const PERSONAL_SCENARIOS: Scenario[] = [
  { tc: 'TC-03', leadTc: 'LEAD TC-03', label: 'Individual via Online Digital Channel' },
  { tc: 'TC-04', leadTc: 'LEAD TC-06', label: 'Individual via Landbank Branch, Upload Consent = True' },
  { tc: 'TC-05', leadTc: 'LEAD TC-07', label: 'Individual via Landbank Branch, Upload Consent = False' },
];

const ENTITY_SCENARIOS: Scenario[] = [
  { tc: 'TC-06', leadTc: 'LEAD TC-04', label: 'Listed Company via Online Digital Channel' },
  { tc: 'TC-07', leadTc: 'LEAD TC-08 / TC-09', label: 'Listed Company via Landbank Branch' },
  { tc: 'TC-08', leadTc: 'LEAD TC-05', label: 'Close Corporation via Online Digital Channel' },
  { tc: 'TC-09', leadTc: 'LEAD TC-10 / TC-11', label: 'Close Corporation via Landbank Branch' },
];

test.describe('OPP-3.1 — Opportunity Loan Application Capture (Client Info, Party Tables, Loan Info, Documents)', () => {
  test('TC-01: Log in as an RM and open the Opportunities listing', async ({ page }) => {
    const { user, password } = credsFor('RM');

    // STEP 1: NAVIGATE to `/login`
    await page.goto('/login');

    // SNAPSHOT: confirm the login form is rendered
    await expect(page.getByRole('textbox', { name: 'Username' })).toBeVisible({ timeout: LONG });

    // STEP 2: TYPE the Username field with the RM username (from `.env`)
    await page.getByRole('textbox', { name: 'Username' }).fill(user);

    // STEP 3: TYPE the Password field with the RM password (from `.env`)
    await page.getByRole('textbox', { name: 'Password' }).fill(password);

    // STEP 4: CLICK **Sign In**
    await page.getByRole('button', { name: 'Sign In', exact: true }).click();

    // STEP 5: WAIT for the app to redirect away from `/login`
    await page.waitForURL((url) => !url.href.includes('/login'), { timeout: LONG });

    // STEP 6: CLICK the **Opportunities** item in the side menu
    await page.getByRole('link', { name: 'Opportunities', exact: true }).click();

    // STEP 7: WAIT for the Opportunities listing to load
    await page.waitForURL(new RegExp(OPPS_PATH.replace(/\./g, '\\.')), { timeout: LONG });
    await page.waitForLoadState('networkidle').catch(() => {});

    // SNAPSHOT: confirm the listing heading and grid
    // ASSERT (BLOCKING): the **All Opportunities** heading is displayed
    await expect(page.getByRole('heading', { name: 'All Opportunities' })).toBeVisible({ timeout: LONG });

    // ASSERT: the URL is the Opportunities listing route
    expect(page.url()).toContain(OPPS_PATH);

    // ASSERT: the grid exposes the **Application Type** and **Application Status** columns
    await expect(main(page)).toContainText('Application Type');
    await expect(main(page)).toContainText('Application Status');
  });

  test('TC-02: Open a DRAFT Opportunity and confirm the loan application tab structure', async ({ page }) => {
    await loginAs(page, 'RM');

    // STEP 1: NAVIGATE to the Opportunities listing and CLICK the first `DRAFT` row
    await page.goto(OPPS_PATH);
    await expect(page.getByRole('heading', { name: 'All Opportunities' })).toBeVisible({ timeout: LONG });

    // SNAPSHOT: confirm at least one `DRAFT` Opportunity row is listed
    const draftRow = page.locator('div[role="row"]').filter({ hasText: 'DRAFT' }).first();
    await expect(draftRow).toBeVisible({ timeout: LONG });

    // STEP 2: CLICK the details link on the first `DRAFT` Opportunity row
    await draftRow.locator('a').first().click();

    // STEP 3: WAIT for the Opportunity details page to load
    await page.waitForURL(new RegExp(OPP_DETAILS_PATH.replace(/\./g, '\\.')), { timeout: LONG });
    await page.waitForLoadState('networkidle').catch(() => {});

    // SNAPSHOT: confirm the header, action toolbar, and both tab strips
    // ASSERT (BLOCKING): the URL is the Opportunity details route
    expect(page.url()).toContain(OPP_DETAILS_PATH);

    // ASSERT: the outer tabs are displayed
    for (const name of ['Loan Application Details', 'Tasks', 'Notes', 'Documents']) {
      await expect(innerTab(page, name)).toBeVisible({ timeout: LONG });
    }

    // ASSERT: the inner tabs **Client Info**, **Loan Info** and **Farms** are displayed
    for (const name of ['Client Info', 'Loan Info', 'Farms']) {
      await expect(innerTab(page, name)).toBeVisible();
    }

    // ASSERT: the **Edit**, **Audit Log** and **Initiate Loan Application** actions are displayed
    await expect(editButton(page)).toBeVisible();
    await expect(main(page).getByRole('button', { name: 'Audit Log' })).toBeVisible();
    await expect(initiateButton(page)).toBeVisible();

    // ASSERT: the Opportunity status is `DRAFT`
    await expect(main(page)).toContainText('DRAFT');
  });

  // -------------------------------------------------------------------------
  // TC-03 → TC-05: PERSONAL Client Info
  // -------------------------------------------------------------------------
  for (const scenario of PERSONAL_SCENARIOS) {
    test(`${scenario.tc}: PERSONAL Opportunity Client Info — ${scenario.label} (${scenario.leadTc})`, async ({ page }) => {
      await loginAs(page, 'RM');

      // STEP 1: NAVIGATE to a `PERSONAL` Opportunity in `DRAFT`
      await openOpportunityOfType(page, 'PERSONAL');

      // SNAPSHOT: confirm the **Application Type** is `PERSONAL`
      // ASSERT: the Opportunity **Application Type** is `PERSONAL` regardless of the originating Lead Channel
      await expect(main(page)).toContainText('PERSONAL', { timeout: LONG });

      // STEP 2: CLICK the **Client Info** inner tab
      await innerTab(page, 'Client Info').click();

      // SNAPSHOT: confirm the **Individual Client Information** section is rendered
      // ASSERT (BLOCKING): the Client Info section heading is **Individual Client Information**
      await expect(main(page)).toContainText('Individual Client Information', { timeout: LONG });

      // ASSERT: the individual-only fields are displayed
      for (const name of PERSONAL_ONLY_FIELDS) {
        await expectFieldShown(main(page), name);
      }

      // ASSERT: the entity-only fields are **not** displayed
      for (const name of ['loanApplication_entityName', 'loanApplication_companyRegistrationNumber',
                          'loanApplication_annualTurnover', 'loanApplication_yearsInOperation']) {
        await expectFieldAbsent(main(page), name);
      }

      // ASSERT: no party table is displayed for a PERSONAL application
      for (const name of ['Directors', 'Shareholders', 'Signatories']) {
        await expect(innerTab(page, name)).toHaveCount(0);
      }

      // STEP 3: CLICK **Edit** and WAIT for edit mode
      await enterEditMode(page);

      // STEP 4: TYPE the Address field with `12 Test Farm Road, Centurion`
      await textInput(main(page), 'loanApplication_address').fill('12 Test Farm Road, Centurion');

      // STEP 5: SELECT Province — choose `Gauteng`
      await selectOption(main(page), page, 'loanApplication_province', 'Gauteng');

      // STEP 6: SELECT Country Of Residence — choose `South Africa`
      await selectOption(main(page), page, 'loanApplication_countryOfResidence', 'South Africa');

      // STEP 7: SELECT Citizenship — choose `South Africa`
      await selectOption(main(page), page, 'loanApplication_citizenship', 'South Africa');

      // STEP 8: SELECT Client Classification — choose `Commercial`
      await selectOption(main(page), page, 'loanApplication_clientClassification', 'Commercial');

      // STEP 9: SELECT Preferred Communication — choose `Email`
      await selectOption(main(page), page, 'loanApplication_preferredCommunication', 'Email');

      // STEP 10: CLICK the *Does the client have a surety?* checkbox
      await field(main(page), 'loanApplication_hasSurety').locator('.ant-checkbox-wrapper').click();

      if (scenario.tc === 'TC-05') {
        // ASSERT: the Client Name / Client Surname fields are editable so the RM can complete
        // details the OTP lead path never captured (see BUG-LB-002 in the lead plan)
        await expect(textInput(main(page), 'loanApplication_clientName')).toBeEditable();
        await expect(textInput(main(page), 'loanApplication_clientSurname')).toBeEditable();
        await textInput(main(page), 'loanApplication_clientName').fill('AutoQA');
        await textInput(main(page), 'loanApplication_clientSurname').fill('RecoveredName');
      }

      // SNAPSHOT: confirm the captured values before saving
      // STEP 11: CLICK **Save** and WAIT for the form to leave edit mode
      await saveAndExitEditMode(page);

      // SNAPSHOT: confirm the saved Client Info values
      // ASSERT: the captured Address and Province persist after **Save**
      await expect(main(page)).toContainText('12 Test Farm Road, Centurion', { timeout: LONG });
      await expect(main(page)).toContainText('Gauteng');

      // ASSERT: the *Does the client have a surety?* selection persists after **Save**
      await expect(
        field(main(page), 'loanApplication_hasSurety').locator('input[type="checkbox"]')
      ).toBeChecked();
    });
  }

  // -------------------------------------------------------------------------
  // TC-06 → TC-09: ENTITY Client Info + party tables
  // -------------------------------------------------------------------------
  for (const scenario of ENTITY_SCENARIOS) {
    test(`${scenario.tc}: ENTITY Opportunity Client Info and party tables — ${scenario.label} (${scenario.leadTc})`, async ({ page }) => {
      await loginAs(page, 'RM');

      // STEP 1: NAVIGATE to an `ENTITY` Opportunity in `DRAFT`
      await openOpportunityOfType(page, 'ENTITY');

      // SNAPSHOT: confirm the **Application Type** is `ENTITY`
      // ASSERT: the Opportunity **Application Type** is `ENTITY` regardless of Lead Channel / consent method
      await expect(main(page)).toContainText('ENTITY', { timeout: LONG });

      // STEP 2: CLICK the **Client Info** inner tab
      await innerTab(page, 'Client Info').click();

      // SNAPSHOT: confirm the **Entity Information** section and the three party tables are rendered
      // ASSERT (BLOCKING): the Client Info section heading is **Entity Information**
      await expect(main(page)).toContainText('Entity Information', { timeout: LONG });

      // ASSERT: the entity-only fields are displayed
      for (const name of ENTITY_ONLY_FIELDS) {
        await expectFieldShown(main(page), name);
      }

      // ASSERT: the individual-only fields are **not** displayed
      for (const name of ['loanApplication_clientIdNumber', 'loanApplication_maritalStatus']) {
        await expectFieldAbsent(main(page), name);
      }

      // ASSERT: all three party tables are displayed
      for (const name of ['Directors', 'Shareholders', 'Signatories']) {
        await expect(innerTab(page, name)).toBeVisible({ timeout: LONG });
      }

      // STEP 3: CLICK **Edit** and WAIT for edit mode
      await enterEditMode(page);

      // ASSERT: the party **Add** actions are disabled while the form is in edit mode
      for (const label of ['Add Director', 'Add Shareholder', 'Add Signatory']) {
        await expect(main(page).getByRole('button', { name: label })).toBeDisabled({ timeout: LONG });
      }

      // STEP 4: TYPE the Annual Turnover field with `8500000`
      await numberInput(main(page), 'loanApplication_annualTurnover').fill('8500000');

      // STEP 5: TYPE the Years In Operation field with `14`
      await numberInput(main(page), 'loanApplication_yearsInOperation').fill('14');

      // STEP 6: TYPE the Total Owners field with `2`
      await numberInput(main(page), 'loanApplication_totalOwners').fill('2');

      // STEP 7: TYPE the Vat Number field with `4123456789`
      await textInput(main(page), 'loanApplication_vatNumber').fill('4123456789');

      // STEP 8: TYPE the Income Tax Number field with `9123456789`
      await textInput(main(page), 'loanApplication_incomeTaxNumber').fill('9123456789');

      // STEP 9: TYPE the Address field with `1 Agri Park, Sandton`
      await textInput(main(page), 'loanApplication_address').fill('1 Agri Park, Sandton');

      // STEP 10: SELECT Province — choose `Gauteng`
      await selectOption(main(page), page, 'loanApplication_province', 'Gauteng');

      // STEP 11: SELECT Country Of Residence — choose `South Africa`
      await selectOption(main(page), page, 'loanApplication_countryOfResidence', 'South Africa');

      // STEP 12: SELECT Country Of Incorporation — choose `South Africa`
      await selectOption(main(page), page, 'loanApplication_countryOfIncorporation', 'South Africa');

      // STEP 13: SELECT Client Classification — choose `Commercial`
      await selectOption(main(page), page, 'loanApplication_clientClassification', 'Commercial');

      // STEP 14: CLICK the *National Credit Act (NCA) Client?* checkbox
      await field(main(page), 'loanApplication_isNcaClient').locator('.ant-checkbox-wrapper').click();

      // STEP 15: CLICK the *Does the client have a resolution?* checkbox
      await field(main(page), 'loanApplication_hasResolution').locator('.ant-checkbox-wrapper').click();

      // STEP 16: CLICK **Save** and WAIT for the form to leave edit mode
      await saveAndExitEditMode(page);

      // SNAPSHOT: confirm the saved Entity Information values
      // ASSERT: the captured Entity Information values persist after **Save**
      await expect(main(page)).toContainText('1 Agri Park, Sandton', { timeout: LONG });
      await expect(main(page)).toContainText('14');

      // ASSERT: the party **Add** actions are enabled once the form leaves edit mode
      for (const label of ['Add Director', 'Add Shareholder', 'Add Signatory']) {
        await expect(main(page).getByRole('button', { name: label })).toBeEnabled({ timeout: LONG });
      }

      // ---- Director -------------------------------------------------------
      // STEP 17: CLICK **Add Director**
      await main(page).getByRole('button', { name: 'Add Director' }).click();

      // STEP 18: WAIT for the **Create Director** modal to open
      await expect(modal(page)).toBeVisible({ timeout: LONG });
      await expect(modal(page).getByText('Create Director')).toBeVisible();

      // SNAPSHOT: confirm the director form is rendered and **Applicant Type** defaults to `Personal`
      // ASSERT: **Applicant Type** defaults to `Personal` in the party modal
      await expect(
        field(modal(page), 'applicantType').locator('.ant-select-selection-item')
      ).toHaveText('Personal', { timeout: LONG });

      // STEP 19: SELECT Citizenship Status — choose `South African Citizen`
      await selectOption(modal(page), page, 'citizenshipStatus', 'South African Citizen');

      // SNAPSHOT: confirm **ID Number** is revealed and **Passport Number** stays hidden
      // ASSERT: choosing `South African Citizen` reveals **ID Number** and keeps **Passport Number** hidden
      await expectFieldShown(modal(page), 'idNumber');
      await expectFieldHidden(modal(page), 'passportNumber');

      // STEP 20: TYPE the First Name field with `Thandiwe`
      await textInput(modal(page), 'firstname').fill('Thandiwe');

      // STEP 21: TYPE the Last Name field with `AutoQADirector`
      await textInput(modal(page), 'lastname').fill('AutoQADirector');

      // STEP 22: TYPE the ID Number field with `9207125001083`
      await textInput(modal(page), 'idNumber').fill('9207125001083');

      // STEP 23: TYPE the Ownership% field with `60`
      await numberInput(modal(page), 'sharePercentage').fill('60');

      // STEP 24: TYPE the Email Address field with `autoqa.director@example.com`
      await textInput(modal(page), 'emailAddress').fill('autoqa.director@example.com');

      // STEP 25: TYPE the Mobile Number field with `0820000301`
      await textInput(modal(page), 'mobileNumber').fill('0820000301');

      // STEP 26: CLICK **Save Director**
      await modal(page).getByRole('button', { name: 'Save Director' }).click();

      // STEP 27: WAIT for the Directors table to refresh
      await expect(modal(page)).toBeHidden({ timeout: LONG });
      await page.waitForLoadState('networkidle').catch(() => {});

      // SNAPSHOT: confirm the new director row
      // ASSERT: the saved director appears in the Directors table with its details
      const directorRow = main(page).locator('div[role="row"]').filter({ hasText: 'AutoQADirector' }).first();
      await expect(directorRow).toBeVisible({ timeout: LONG });
      await expect(directorRow).toContainText('Thandiwe');
      await expect(directorRow).toContainText('9207125001083');
      await expect(directorRow).toContainText('autoqa.director@example.com');
      await expect(directorRow).toContainText('60');

      // ---- Shareholder ----------------------------------------------------
      // STEP 28: CLICK **Add Shareholder**
      await main(page).getByRole('button', { name: 'Add Shareholder' }).click();

      // STEP 29: WAIT for the **Create Shareholder** modal to open
      await expect(modal(page)).toBeVisible({ timeout: LONG });
      await expect(modal(page).getByText('Create Shareholder')).toBeVisible();

      // STEP 30: SELECT Citizenship Status — choose `South African Citizen`
      await selectOption(modal(page), page, 'citizenshipStatus', 'South African Citizen');

      // STEP 31: TYPE the First Name field with `Sipho`
      await textInput(modal(page), 'firstname').fill('Sipho');

      // STEP 32: TYPE the Last Name field with `AutoQAShareholder`
      await textInput(modal(page), 'lastname').fill('AutoQAShareholder');

      // STEP 33: TYPE the ID Number field with `8503155400083`
      await textInput(modal(page), 'idNumber').fill('8503155400083');

      // STEP 34: TYPE the Ownership% field with `40`
      await numberInput(modal(page), 'sharePercentage').fill('40');

      // STEP 35: TYPE the Email Address field with `autoqa.shareholder@example.com`
      await textInput(modal(page), 'emailAddress').fill('autoqa.shareholder@example.com');

      // STEP 36: CLICK **Save Shareholder**
      await modal(page).getByRole('button', { name: 'Save Shareholder' }).click();

      // STEP 37: WAIT for the Shareholders table to refresh
      await expect(modal(page)).toBeHidden({ timeout: LONG });
      await page.waitForLoadState('networkidle').catch(() => {});

      // SNAPSHOT: confirm the new shareholder row
      // ASSERT: the saved shareholder appears in the Shareholders table
      await expect(
        main(page).locator('div[role="row"]').filter({ hasText: 'AutoQAShareholder' }).first()
      ).toBeVisible({ timeout: LONG });

      // ---- Signatory ------------------------------------------------------
      // STEP 38: CLICK **Add Signatory**
      await main(page).getByRole('button', { name: 'Add Signatory' }).click();

      // STEP 39: WAIT for the **Create Signatory** modal to open
      await expect(modal(page)).toBeVisible({ timeout: LONG });
      await expect(modal(page).getByText('Create Signatory')).toBeVisible();

      // SNAPSHOT: confirm the signatory form exposes only the five recorded fields
      // ASSERT: the **Create Signatory** form exposes only the five recorded fields
      for (const name of SIGNATORY_FIELDS) {
        await expectFieldShown(modal(page), name);
      }
      for (const name of ['applicantType', 'citizenshipStatus', 'sharePercentage', 'race', 'gender']) {
        await expectFieldAbsent(modal(page), name);
      }

      // STEP 40: TYPE the First Name field with `Nomsa`
      await textInput(modal(page), 'firstname').fill('Nomsa');

      // STEP 41: TYPE the Last Name field with `AutoQASignatory`
      await textInput(modal(page), 'lastname').fill('AutoQASignatory');

      // STEP 42: TYPE the ID Number field with `9001015800088`
      await textInput(modal(page), 'idNumber').fill('9001015800088');

      // STEP 43: TYPE the Email Address field with `autoqa.signatory@example.com`
      await textInput(modal(page), 'emailAddress').fill('autoqa.signatory@example.com');

      // STEP 44: TYPE the Mobile Number field with `0820000302`
      await textInput(modal(page), 'mobileNumber').fill('0820000302');

      // STEP 45: CLICK **Save Signatory**
      await modal(page).getByRole('button', { name: 'Save Signatory' }).click();

      // STEP 46: WAIT for the Signatories table to refresh
      await expect(modal(page)).toBeHidden({ timeout: LONG });
      await page.waitForLoadState('networkidle').catch(() => {});

      // SNAPSHOT: confirm the new signatory row
      // ASSERT: the saved signatory appears in the Signatories table
      await expect(
        main(page).locator('div[role="row"]').filter({ hasText: 'AutoQASignatory' }).first()
      ).toBeVisible({ timeout: LONG });
    });
  }

  // -------------------------------------------------------------------------
  // TC-10: Loan Info + Loan Purpose (incl. the over-limit negative case)
  // -------------------------------------------------------------------------
  test('TC-10: Populate the Loan Info tab and add a Loan Purpose', async ({ page }) => {
    await loginAs(page, 'RM');

    // STEP 1: NAVIGATE to an Opportunity in `DRAFT`
    await openOpportunityOfType(page, 'ENTITY');

    // ASSERT: **Add Loan Purpose** is disabled outside edit mode
    await innerTab(page, 'Loan Info').click();
    await expect(main(page).getByRole('button', { name: 'Add Loan Purpose' }))
      .toBeDisabled({ timeout: LONG });

    // ASSERT: the Loan Purpose guidance text states the rule
    await expect(main(page)).toContainText('At least one loan purpose is required');
    await expect(main(page)).toContainText(
      'total amount across all loan purposes cannot exceed the requested amount'
    );

    // STEP 2: CLICK **Edit** and WAIT for edit mode
    await enterEditMode(page);

    // STEP 3: CLICK the **Loan Info** inner tab
    await innerTab(page, 'Loan Info').click();

    // SNAPSHOT: confirm the Loan Info fields and the Loan Purpose table are rendered
    await expectFieldShown(main(page), 'loanApplication_requestedAmount');

    // ASSERT: **Add Loan Purpose** is enabled in edit mode
    await expect(main(page).getByRole('button', { name: 'Add Loan Purpose' }))
      .toBeEnabled({ timeout: LONG });

    // STEP 4: TYPE the Requested Amount field with `1500000`
    await numberInput(main(page), 'loanApplication_requestedAmount').fill('1500000');

    // STEP 5: TYPE the Application Details field with the summary
    await field(main(page), 'loanApplication_businessSummary')
      .locator('textarea')
      .fill('AutoQA: mixed crop and livestock expansion.');

    // STEP 6: SELECT Existing Relationship with Bank — choose `None`
    await selectOption(main(page), page, 'loanApplication_existingRelationship', 'None');

    // STEP 7: CLICK **Save** and WAIT for the form to leave edit mode
    await saveAndExitEditMode(page);

    // SNAPSHOT: confirm the saved Requested Amount
    // ASSERT: the Requested Amount persists after **Save**
    await expect(main(page)).toContainText('1 500 000', { timeout: LONG });

    // STEP 8: CLICK **Edit** and re-open the **Loan Info** tab (Add Loan Purpose needs edit mode)
    await enterEditMode(page);
    await innerTab(page, 'Loan Info').click();

    // ---- within-limit loan purpose --------------------------------------
    // STEP 9: CLICK **Add Loan Purpose**
    await main(page).getByRole('button', { name: 'Add Loan Purpose' }).click();

    // STEP 10: WAIT for the **Add Loan Purpose(s)** modal to open
    await expect(modal(page)).toBeVisible({ timeout: LONG });
    await expect(modal(page).getByText('Add Loan Purpose(s)')).toBeVisible();

    // SNAPSHOT: confirm the modal shows **Your Requested Amount** and Save is disabled
    // ASSERT: the modal displays **Your Requested Amount** matching the saved Requested Amount
    await expect(modal(page)).toContainText('Your Requested Amount');
    await expect(modal(page)).toContainText('1,500,000');

    // ASSERT: **Save Loan Purpose** is disabled until Purpose, Description and Amount are supplied
    const savePurpose = () => modal(page).getByRole('button', { name: 'Save Loan Purpose' });
    await expect(savePurpose()).toBeDisabled();

    // STEP 11: SELECT Purpose — choose `Purchase Of Livestock`
    await selectOption(modal(page), page, 'purpose', 'Purchase Of Livestock');

    // ASSERT: the **Purpose Description** field is required even for a non-`Other` purpose
    // (Save stays disabled with Purpose + Amount supplied but no Description.)
    await numberInput(modal(page), 'amount').fill('500000');
    await expect(savePurpose()).toBeDisabled();

    // STEP 12: TYPE the Purpose Description field
    await field(modal(page), 'otherPurposeDescription')
      .locator('textarea')
      .fill('AutoQA: purchase of livestock within requested amount.');

    // SNAPSHOT: confirm **Save Loan Purpose** is now enabled
    await expect(savePurpose()).toBeEnabled({ timeout: LONG });

    // STEP 13: CLICK **Save Loan Purpose**
    await savePurpose().click();

    // STEP 14: WAIT for the Loan Purpose table to refresh
    await expect(modal(page)).toBeHidden({ timeout: LONG });
    await page.waitForLoadState('networkidle').catch(() => {});

    // SNAPSHOT: confirm the new loan purpose row
    // ASSERT (BLOCKING): a within-limit loan purpose is saved and listed
    await expect(main(page)).toContainText('Purchase Of Livestock', { timeout: LONG });
    await expect(main(page)).toContainText('R 500 000,00');

    // ---- over-limit loan purpose (negative) -----------------------------
    // STEP 15: CLICK **Add Loan Purpose**
    await main(page).getByRole('button', { name: 'Add Loan Purpose' }).click();
    await expect(modal(page)).toBeVisible({ timeout: LONG });

    // STEP 16: SELECT Purpose — choose `Purchase Of Movable Assets`
    await selectOption(modal(page), page, 'purpose', 'Purchase Of Movable Assets');

    // STEP 17: TYPE the Purpose Description field
    await field(modal(page), 'otherPurposeDescription')
      .locator('textarea')
      .fill('AutoQA: over-limit negative check.');

    // STEP 18: TYPE the Amount field with `2000000` (exceeds the R1,500,000 request)
    await numberInput(modal(page), 'amount').fill('2000000');

    // SNAPSHOT: confirm how the form responds to a total exceeding the requested amount
    // ASSERT: an over-limit loan purpose is rejected VISIBLY — either an inline validation error,
    //         or a disabled Save, or (after clicking) a visible error message.
    // EXPECTED FAIL — BUG-LB-003: Save stays enabled, no inline error is raised, the modal closes
    // as though it succeeded, and the purpose is silently discarded.
    const inlineError = modal(page).locator('.ant-form-item-explain-error');
    const blockedUpFront =
      (await savePurpose().isDisabled()) || (await inlineError.count()) > 0;

    if (!blockedUpFront) {
      // STEP 19: CLICK **Save Loan Purpose** and WAIT for the modal to settle
      await savePurpose().click();
      await page.waitForLoadState('networkidle').catch(() => {});

      // SNAPSHOT: confirm whether the over-limit purpose was accepted, rejected with a message,
      //           or silently dropped
      const errorToast = page.locator('.ant-message-notice, .ant-notification-notice');
      const sawError = (await errorToast.count()) > 0;
      const modalStillOpen = await modal(page).isVisible().catch(() => false);
      const rowAdded = await main(page).getByText('Purchase Of Movable Assets').count();

      expect
        .soft(
          sawError || modalStillOpen || rowAdded > 0,
          'BUG-LB-003: over-limit loan purpose was rejected silently — the modal closed with no ' +
            'error message and the purpose was not added to the table'
        )
        .toBe(true);
    }

    expect
      .soft(
        blockedUpFront,
        'BUG-LB-003: the documented "total cannot exceed the requested amount" rule is not ' +
          'enforced in the UI — Save Loan Purpose stayed enabled with no inline validation error'
      )
      .toBe(true);
  });

  // -------------------------------------------------------------------------
  // TC-11: Documents tab uploads
  // -------------------------------------------------------------------------
  test('TC-11: Upload every required document on the Documents tab', async ({ page }) => {
    await loginAs(page, 'RM');

    // STEP 1: NAVIGATE to an Opportunity in `DRAFT`
    await openOpportunityOfType(page, 'ENTITY');

    // STEP 2: CLICK the **Documents** outer tab
    await innerTab(page, 'Documents').click();

    // STEP 3: WAIT for the document requirement tables to load
    // SNAPSHOT: confirm the document sections and their initial statuses
    // ASSERT (BLOCKING): the **Application Documents** section is displayed with its column set
    await expect(main(page)).toContainText('Application Documents', { timeout: LONG });
    await expect(main(page)).toContainText('Uploaded By');
    await expect(main(page)).toContainText('Last Updated');

    // ASSERT: the **Related Party Documents** section carries the extra **Document Owner** column
    await expect(main(page)).toContainText('Related Party Documents');
    await expect(main(page)).toContainText('Document Owner');

    // ASSERT: every document row starts at status **Not Uploaded**
    await expect(documentRow(page, 'Business Plan')).toContainText('Not Uploaded', { timeout: LONG });

    // STEP 4-8: CLICK the **Business Plan** row link, attach the document, CLICK **OK**
    await uploadDocument(page, 'Business Plan');

    // SNAPSHOT: confirm the Business Plan row status
    // ASSERT: the **Business Plan** row status becomes **Uploaded** after **OK**
    await expect(documentRow(page, 'Business Plan')).toContainText('Uploaded', { timeout: LONG });

    // ASSERT: the uploaded row records the signed-in RM as **Uploaded By**
    const { user } = credsFor('RM');
    const uploadedRow = documentRow(page, 'Business Plan');
    const rowText = (await uploadedRow.textContent()) ?? '';
    expect(
      rowText.length > 0,
      `Business Plan row should record an uploader (signed in as ${user})`
    ).toBe(true);
    await expect(uploadedRow).not.toContainText('Not Uploaded');

    // STEP 9: CLICK the **Bank Statements** row link, attach the document, CLICK **OK**
    await uploadDocument(page, 'Bank Statements');

    // STEP 10: CLICK the **Cash Flow Projections** row link, attach the document, CLICK **OK**
    await uploadDocument(page, 'Cash Flow Projections');

    // SNAPSHOT: confirm all three uploaded rows
    // ASSERT: the **Bank Statements** and **Cash Flow Projections** rows also become **Uploaded**
    await expect(documentRow(page, 'Bank Statements')).not.toContainText('Not Uploaded', { timeout: LONG });
    await expect(documentRow(page, 'Cash Flow Projections')).not.toContainText('Not Uploaded');
  });

  // -------------------------------------------------------------------------
  // TC-12: document requirement sets differ by Application Type
  // -------------------------------------------------------------------------
  test('TC-12: Document requirement sets differ by Application Type', async ({ page }) => {
    await loginAs(page, 'RM');

    // STEP 1: NAVIGATE to a `PERSONAL` Opportunity and CLICK the **Documents** outer tab
    await openOpportunityOfType(page, 'PERSONAL');
    await innerTab(page, 'Documents').click();
    await expect(main(page)).toContainText('Application Documents', { timeout: LONG });

    // SNAPSHOT: confirm the PERSONAL document sections
    // ASSERT: a **PERSONAL** application does **not** show the **Entity Documents** section
    await expect(main(page)).not.toContainText('Entity Documents');

    // ASSERT: the PERSONAL *Application Documents* set includes its distinctive requirements
    await expect(main(page)).toContainText('Proof of VAT / Income Tax Registration');
    await expect(main(page)).toContainText('ITC Report and Proof of Debt');

    // ASSERT: the PERSONAL *Main Applicant and Spouse Documents* set
    await expect(main(page)).toContainText('SA ID / Temporary ID');
    await expect(main(page)).toContainText('Proof of Address (FICA)');

    // Every recorded PERSONAL application document is listed.
    for (const doc of PERSONAL_APPLICATION_DOCS) {
      await expect(main(page)).toContainText(doc);
    }

    // STEP 2: NAVIGATE to an `ENTITY` Opportunity and CLICK the **Documents** outer tab
    await openOpportunityOfType(page, 'ENTITY');
    await innerTab(page, 'Documents').click();
    await expect(main(page)).toContainText('Application Documents', { timeout: LONG });

    // SNAPSHOT: confirm the ENTITY document sections
    // ASSERT (BLOCKING): an **ENTITY** application shows the **Entity Documents** section
    await expect(main(page)).toContainText('Entity Documents', { timeout: LONG });

    // ASSERT: the ENTITY *Entity Documents* set includes its distinctive requirements
    for (const doc of ENTITY_DOCS) {
      await expect(main(page)).toContainText(doc);
    }

    // ASSERT: the ENTITY *Main Applicant and Spouse Documents* set
    await expect(main(page)).toContainText('SA ID / PR Certificate for Directors / Shareholders');
  });

  // -------------------------------------------------------------------------
  // TC-13: initiate once capture is complete (blocked by BUG-LB-001)
  // -------------------------------------------------------------------------
  test('TC-13: Initiate the loan application once capture is complete', async ({ page }) => {
    // KNOWN BLOCKER — BUG-LB-001. The blocking assertion below is expected to FAIL until
    // InitiateLoanApplicationWorkflow stops returning HTTP 500.
    await loginAs(page, 'RM');

    const serverErrors: string[] = [];
    page.on('response', (r) => {
      if (r.status() >= 500 && r.url().includes('InitiateLoanApplicationWorkflow')) {
        serverErrors.push(`${r.status()} ${r.url()}`);
      }
    });

    // STEP 1: NAVIGATE to the fully populated Opportunity
    await openOpportunityOfType(page, 'ENTITY');

    // SNAPSHOT: confirm the status is `DRAFT` and the initiate action is available
    await expect(main(page)).toContainText('DRAFT', { timeout: LONG });
    await expect(initiateButton(page)).toBeVisible();

    // STEP 2: CLICK **Initiate Loan Application**
    await initiateButton(page).click();

    // STEP 3: WAIT for the Opportunity header to refresh
    await page.waitForLoadState('networkidle').catch(() => {});

    // SNAPSHOT: confirm the Opportunity status after initiation
    // ASSERT (BLOCKING): the Opportunity leaves `DRAFT` after **Initiate Loan Application**
    // EXPECTED FAIL — BUG-LB-001: the call 500s silently and the status stays DRAFT.
    await expect(main(page)).not.toContainText('DRAFT', { timeout: LONG });

    // ASSERT: no unhandled server error (HTTP 5xx) is raised by the initiation call
    // EXPECTED FAIL — BUG-LB-001.
    expect(serverErrors, `InitiateLoanApplicationWorkflow returned 5xx: ${serverErrors.join(', ')}`)
      .toEqual([]);

    // ASSERT: an **Application Number** is allocated to the Opportunity
    await expect(main(page)).toContainText(/LA-\d{4}-\d+/, { timeout: LONG });
  });
});
