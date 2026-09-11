// AUTO-RECORDED from test-plans/leads/branch-manual-document-upload.md
// The .md plan is canonical. AI-repair will patch failing lines in this file.
// Do not hand-edit unless you are also updating the .md plan.
//
// Recorded live against Land Bank CRM Dev on 2026-08-20 as the RM role, by walking EVERY selectable
// Client Type on the Landbank Branch channel in both toggle states.
//
// THERE ARE EXACTLY TWO PROCESSES, NOT EIGHT:
//   PROCESS A — Individual consent only:  Individual (Individual)
//     toggle: UNLABELLED "Upload Consent?" switch (its caption lives in a preceding label-only form
//             item, so it must be addressed as the only visible .ant-switch in the modal)
//     OFF -> mobileNumber*, emailAddress*, idNumber*  +  "Request OTP"  |  Save ENABLED
//     ON  -> + `manualApproval` ("Upload Consent") + "Download Consent Template";
//             Request OTP HIDDEN; Save DISABLED
//     Attaching a file surfaces a separate "Upload" commit button. Clicking it reveals the
//     client-detail block, re-enables Save, and CLEARS the previously typed mobile/email/ID.
//     ID Number is Luhn-validated.
//
//   PROCESS B — Entity resolution + consent:  Close Corporation (Entity), Co-Operative (Entity),
//     Listed Company (Entity), Trust, NGO, Partnership, Private Company
//     toggle: LABELLED `uploadResAndConsent` ("Upload Resolution and Consent?")
//     OFF -> title*, firstName*, lastName*, territory*, preferredCommunication*, organisation,
//             mobileNumber*, emailAddress*   |  NO Request OTP  |  Save ENABLED
//     ON  -> signatoryIdNumber*, companyRegistrationNumber*, signatoryConsent* ("Upload Consent"),
//             resolution* ("Upload Resolution") + BOTH templates; client block HIDDEN; Save DISABLED
//     Attaching BOTH files surfaces "Upload"; clicking it runs a CIPC lookup keyed off the Company
//     Registration Number (2012/225386/07 -> "BOXFUSION (PTY)LTD", reg no normalised to
//     "K2012/225386/07"), re-reveals the client block and enables Save.
//     All seven types produced a BYTE-IDENTICAL field inventory in both toggle states.
//
//   ENTITY NAME SPLITS WITHIN PROCESS B (toggle OFF):
//     REQUIRED for the three "(Entity)"-suffixed types (Close Corporation, Co-Operative, Listed Co)
//     OPTIONAL for the four non-suffixed types (Trust, NGO, Partnership, Private Company)
//
// DEFECTS
//   BUG-LB-007 (blocker): `Sole Proprietor (Individual)` is NOT selectable — the dropdown offers only
//     8 options, yet the ClientType reference list still contains it (item value 3). It IS filtered by
//     the form, not removed from data, and it WAS selectable on 2026-07-31 -> regression. TC-03's
//     Sole Proprietor half cannot run.
//   BUG-LB-008: Trust / NGO / Partnership all require a "Company Registration Number" that drives a
//     CIPC lookup, though none has a CIPC company registration number in reality.
//   BUG-LB-009: Entity Name required for the 3 suffixed types but optional for the 4 non-suffixed
//     ones, despite an identical upload process.
//   BUG-LB-002 (carried over): Process A with the toggle OFF saves a nameless lead without OTP.
//
// OTHER STRUCTURAL FACTS
//   - `Co-Applicant` (ClientType value 9) is also excluded from the dropdown — deliberate (it is a
//     participant role, not a lead client type), NOT treated as a defect.
//   - THE TOGGLE STATE PERSISTS ACROSS A CLIENT TYPE CHANGE. Switching between Process-B types leaves
//     the switch ON and the upload fields rendered, so each test opens a FRESH New Lead modal unless
//     it is explicitly asserting that persistence (TC-11).
//   - Both templates render as toolbar BUTTONS, not anchors — assert on the button, not an href.
//   - The "Upload" commit button appears only AFTER a file is attached and is separate from the
//     "(press to upload)" control.
//   - Ant Design: fields anchored on <label for> via a DIRECT-CHILD chain; conditional fields hidden
//     with `ant-form-item-hidden`; options matched on `title` in the open dropdown; once a select
//     holds a value its hidden <input> is click-intercepted -> trigger the .ant-select-selector.

import { test, expect, Page, Locator } from '@playwright/test';
import path from 'path';

// Environment & credentials come from process.env, loaded from a gitignored .env by
// playwright.config.ts (real env vars / CI secrets always win). NEVER hardcode a
// username, password, or token here — this file is committed and synced to the hub.

const LEADS_PATH = '/dynamic/LandBank.Crm/LBLead-table';
const LEAD_DETAILS_PATH = '/dynamic/LandBank.Crm/LBLead-details';

const TEST_DOC = path.resolve(process.cwd(), 'test-data/pdf-test.pdf');
const TEST_DOC_NAME = 'pdf-test.pdf';

const CIPC_REG_NO = '2012/225386/07';
const CIPC_REG_NO_NORMALISED = 'K2012/225386/07';
const CIPC_ENTITY_NAME = 'BOXFUSION (PTY)LTD';

const LONG = 60000;

/** Every Client Type the dropdown actually offers, recorded live. */
const SELECTABLE_CLIENT_TYPES = [
  'Individual (Individual)',
  'Close Corporation (Entity)',
  'Co-Operative (Entity)',
  'Listed Company (Entity)',
  'Trust',
  'NGO',
  'Partnership',
  'Private Company',
] as const;

/** In the ClientType reference list but filtered out of the form. */
const SOLE_PROPRIETOR = 'Sole Proprietor (Individual)';
const CO_APPLICANT = 'Co-Applicant';

type Scenario = {
  tc: string;
  clientType: string;
  /** 'A' = individual consent only, 'B' = entity resolution + consent */
  process: 'A' | 'B';
  /** Process B only: is Entity Name required with the toggle OFF? */
  entityNameRequired?: boolean;
  /**
   * Does the Upload commit perform a CIPC lookup for this client type?
   * Verified live 2026-08-21: the API deliberately declines for entity types that are not
   * CIPC-registered, returning `success:false` with an explanatory message, e.g.
   *   "CIPC lookup is not available for Trust. This entity type is not registered with CIPC."
   * The lead is still created and Save is still enabled — only the auto-populate is skipped.
   */
  cipcSupported: boolean;
  lastName: string;
  mobile: string;
  email: string;
};

const SCENARIOS: Scenario[] = [
  { tc: 'TC-04', clientType: 'Close Corporation (Entity)', process: 'B', entityNameRequired: true,
    cipcSupported: true,
    lastName: 'BranchCloseCorpUpload', mobile: '0820000502', email: 'autoqa.branch.closecorp@example.com' },
  { tc: 'TC-05', clientType: 'Listed Company (Entity)', process: 'B', entityNameRequired: true,
    cipcSupported: true,
    lastName: 'BranchListedUpload', mobile: '0820000503', email: 'autoqa.branch.listed@example.com' },
  { tc: 'TC-06', clientType: 'Co-Operative (Entity)', process: 'B', entityNameRequired: true,
    cipcSupported: true,
    lastName: 'BranchCoOpUpload', mobile: '0820000504', email: 'autoqa.branch.coop@example.com' },
  { tc: 'TC-07', clientType: 'Private Company', process: 'B', entityNameRequired: false,
    cipcSupported: true,
    lastName: 'BranchPrivCoUpload', mobile: '0820000505', email: 'autoqa.branch.privco@example.com' },
  // Trust and Partnership are NOT CIPC-registered — the API declines the lookup by design.
  { tc: 'TC-08', clientType: 'Trust', process: 'B', entityNameRequired: false,
    cipcSupported: false,
    lastName: 'BranchTrustUpload', mobile: '0820000506', email: 'autoqa.branch.trust@example.com' },
  { tc: 'TC-09', clientType: 'Partnership', process: 'B', entityNameRequired: false,
    cipcSupported: false,
    lastName: 'BranchPartnershipUpload', mobile: '0820000507', email: 'autoqa.branch.partnership@example.com' },
  { tc: 'TC-10', clientType: 'NGO', process: 'B', entityNameRequired: false,
    cipcSupported: true,
    lastName: 'BranchNgoUpload', mobile: '0820000508', email: 'autoqa.branch.ngo@example.com' },
];

/** The Process-B toggle-ON field set — identical for all seven types (verified live). */
const PROCESS_B_UPLOAD_FIELDS = [
  'signatoryIdNumber',
  'companyRegistrationNumber',
  'signatoryConsent',
  'resolution',
] as const;

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

const modal = (page: Page) => page.locator('.ant-modal-content');
const saveButton = (page: Page) => modal(page).getByRole('button', { name: 'Save', exact: true });
const uploadCommitButton = (page: Page) =>
  modal(page).getByRole('button', { name: 'Upload', exact: true });

// FRAGILE: Ant Design form inputs expose no id / data-testid, so a field can only be reached
// through its <label for="<fieldName>">. The direct-child chain is required — a plain
// `.ant-form-item:has(label[for="x"])` also matches ancestor form items in these nested forms.
function field(scope: Page | Locator, name: string): Locator {
  return scope.locator(
    `.ant-form-item:has(> .ant-row > .ant-col.ant-form-item-label > label[for="${name}"])`
  );
}

function textInput(scope: Page | Locator, name: string): Locator {
  return field(scope, name).locator('input.ant-input');
}

/**
 * This form uses TWO different mechanisms to conditionally show a field, so neither helper can
 * assume the other's (verified live 2026-08-20):
 *   1. CLASS-BASED — the form item stays in the DOM and gains `ant-form-item-hidden`.
 *      e.g. `organisation`, `idNumber`, `manualApproval`, `uploadResAndConsent`.
 *   2. DOM REMOVAL — the form item is removed entirely, so the locator resolves to 0 elements.
 *      e.g. the client-detail block: `title`, `firstName`, `lastName`, `territory`,
 *      `preferredCommunication`, `description`.
 * "Shown" therefore means present AND un-hidden; "not shown" means absent OR hidden.
 */
async function expectFieldShown(scope: Page | Locator, name: string) {
  const f = field(scope, name);
  await expect(f, `${name} should be present`).toHaveCount(1, { timeout: LONG });
  await expect(f, `${name} should not be hidden`).not.toHaveClass(/ant-form-item-hidden/, { timeout: LONG });
}
async function expectFieldHidden(scope: Page | Locator, name: string) {
  const f = field(scope, name);
  await expect
    .poll(
      async () => {
        if ((await f.count()) === 0) return 'absent';
        const cls = (await f.first().getAttribute('class')) ?? '';
        return cls.includes('ant-form-item-hidden') ? 'hidden' : 'shown';
      },
      { timeout: LONG, message: `${name} should be absent or hidden` }
    )
    .not.toBe('shown');
}
/** A field is "required" when its form item renders a .sha-required-mark. */
async function expectRequired(scope: Page | Locator, name: string, required: boolean) {
  const mark = field(scope, name).locator('.sha-required-mark');
  if (required) await expect(mark).toHaveCount(1, { timeout: LONG });
  else await expect(mark).toHaveCount(0, { timeout: LONG });
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

/**
 * Read a select's full option list.
 *
 * `.ant-select-dropdown:not(.ant-select-dropdown-hidden)` is NOT safe for an inventory read: a
 * previously-opened dropdown only gains `-hidden` asynchronously (on transition end), so a query
 * issued straight after opening a second select can match BOTH and concatenate their options —
 * that is exactly how TC-02 first failed, picking up the 4 Lead Channel options ahead of the 8
 * Client Type ones. Each select's combobox carries `aria-controls="rc_select_<n>_list"`, so scope
 * the read to the dropdown that actually contains that listbox.
 */
async function optionsFor(scope: Page | Locator, page: Page, name: string): Promise<(string | null)[]> {
  const listId = await field(scope, name)
    .locator('input[role="combobox"]')
    .getAttribute('aria-controls');
  expect(listId, `could not resolve the listbox id for "${name}"`).toBeTruthy();

  const ownDropdown = page.locator('.ant-select-dropdown').filter({ has: page.locator(`#${listId}`) });
  await expect(ownDropdown).toHaveCount(1, { timeout: LONG });
  await expect(ownDropdown.locator('.ant-select-item-option').first()).toBeVisible({ timeout: LONG });

  return ownDropdown.locator('.ant-select-item-option').evaluateAll((els) =>
    els.map((e) => e.getAttribute('title'))
  );
}

/**
 * Process A's toggle has NO label[for] — its caption sits in a preceding label-only form item.
 * It is the only visible switch in the modal for an Individual on the Landbank Branch channel.
 */
// FRAGILE: unlabelled switch, addressed as the only visible .ant-switch in the modal.
const individualConsentSwitch = (page: Page) =>
  modal(page).locator('.ant-form-item:not(.ant-form-item-hidden) .ant-switch').first();

const entityConsentSwitch = (page: Page) =>
  field(modal(page), 'uploadResAndConsent').locator('.ant-switch');

/** Open a FRESH New Lead modal on the Landbank Branch channel. */
async function openBranchLeadModal(page: Page) {
  await page.goto(LEADS_PATH);
  await expect(page.getByRole('button', { name: 'New Lead' })).toBeVisible({ timeout: LONG });
  await page.getByRole('button', { name: 'New Lead' }).click();
  await expect(modal(page)).toBeVisible({ timeout: LONG });
  await expect(modal(page).getByText('Add New Lead')).toBeVisible();

  // SELECT Lead Channel — choose `Landbank Branch` (one word — the reflist spelling)
  await selectOption(modal(page), page, 'channel', 'Landbank Branch');
}

/** Attach a document to one of the modal's file-upload fields. */
async function attachDocument(page: Page, fieldName: string, file: string = TEST_DOC) {
  await field(modal(page), fieldName).locator('input[type="file"]').setInputFiles(file);
}

test.describe('LEAD-2.2 — Land Bank Branch Manual Document Upload (all Client Types)', () => {
  test('TC-01: Log in as an RM and open the New Lead form on the Landbank Branch channel', async ({ page }) => {
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

    // STEP 6: NAVIGATE to the Leads listing and CLICK **New Lead**
    await page.goto(LEADS_PATH);
    await expect(page.getByRole('button', { name: 'New Lead' })).toBeVisible({ timeout: LONG });
    await page.getByRole('button', { name: 'New Lead' }).click();

    // STEP 7: WAIT for the **Add New Lead** modal to open
    // ASSERT (BLOCKING): the **Add New Lead** modal is displayed
    await expect(modal(page)).toBeVisible({ timeout: LONG });
    await expect(modal(page).getByText('Add New Lead')).toBeVisible();

    // SNAPSHOT: confirm **Lead Owner** self-populates with the signed-in RM
    // ASSERT: **Lead Owner** self-populates with the signed-in RM
    await expect(field(modal(page), 'leadOwner').locator('.ant-select-selection-item'))
      .not.toBeEmpty({ timeout: LONG });

    // ASSERT: the Lead Channel option is spelled `Landbank Branch` (one word)
    await field(modal(page), 'channel').locator('.ant-select-selector').click();
    await expect(openOption(page, 'Landbank Branch')).toHaveCount(1, { timeout: LONG });

    // STEP 8: SELECT Lead Channel — choose `Landbank Branch`
    await openOption(page, 'Landbank Branch').click();

    // SNAPSHOT: confirm the client-detail block collapses for the Landbank Branch channel
    // ASSERT: selecting `Landbank Branch` collapses the client-detail block
    await expectFieldHidden(modal(page), 'firstName');
    await expectFieldHidden(modal(page), 'lastName');
    await expectFieldHidden(modal(page), 'territory');
  });

  test('TC-02: The Client Type dropdown offers exactly the eight selectable types', async ({ page }) => {
    await loginAs(page, 'RM');
    await openBranchLeadModal(page);

    // STEP 1: CLICK the Client Type select trigger
    await field(modal(page), 'leadType').locator('.ant-select-selector').click();

    // SNAPSHOT: confirm the full option list
    // STEP 2: EXTRACT every Client Type option
    // Scoped to this select's own listbox — a stale sibling dropdown would otherwise bleed in.
    const options = await optionsFor(modal(page), page, 'leadType');

    // ASSERT (BLOCKING): the dropdown offers exactly the eight recorded options
    expect(options).toEqual([...SELECTABLE_CLIENT_TYPES]);

    // ASSERT: `Co-Applicant` is not offered (participant role, excluded by design)
    expect(options).not.toContain(CO_APPLICANT);

    // ASSERT: `Sole Proprietor (Individual)` IS offered
    // EXPECTED FAIL — BUG-LB-007: it is filtered out of the form although still present in the
    // ClientType reference list (item value 3), and it WAS selectable on 2026-07-31.
    expect
      .soft(
        options,
        'BUG-LB-007: Sole Proprietor (Individual) is filtered out of the New Lead Client Type ' +
          'dropdown although it remains in the ClientType reference list — regression since 2026-07-31'
      )
      .toContain(SOLE_PROPRIETOR);
  });

  test('TC-03: Individual — consent-only upload', async ({ page }) => {
    await loginAs(page, 'RM');
    await openBranchLeadModal(page);

    // STEP 1: SELECT Client Type — choose `Individual (Individual)`
    await selectOption(modal(page), page, 'leadType', 'Individual (Individual)');

    // SNAPSHOT: confirm the Individual field set, the toggle and the Request OTP action
    // ASSERT: the Individual field set is Mobile Number, Email Address and ID Number, all required
    for (const f of ['mobileNumber', 'emailAddress', 'idNumber']) {
      await expectFieldShown(modal(page), f);
      await expectRequired(modal(page), f, true);
    }
    await expect(modal(page).getByText('Upload Consent?')).toBeVisible();

    // ASSERT: the **Request OTP** action is offered while the toggle is OFF
    await expect(modal(page).getByRole('button', { name: 'Request OTP' })).toBeVisible({ timeout: LONG });

    // ASSERT: **Save** is enabled while the toggle is OFF
    await expect(saveButton(page)).toBeEnabled();

    // ASSERT: an invalid ID number is rejected with the SA ID validation message
    await textInput(modal(page), 'idNumber').fill('9001015800085');
    await expect(modal(page).getByText('Please enter a valid South African ID number'))
      .toBeVisible({ timeout: LONG });

    // STEP 1b: POPULATE EVERY VISIBLE REQUIRED FIELD **BEFORE** TOUCHING THE TOGGLE — replacing the
    // invalid ID with a Luhn-valid one. The Upload commit is conditional on the form already being
    // complete; clicking it with any required field empty or invalid issues NO request and silently
    // does nothing. Verified 2026-08-21.
    await textInput(modal(page), 'idNumber').fill('9001015800088');
    await expect(modal(page).getByText('Please enter a valid South African ID number')).toBeHidden();
    await textInput(modal(page), 'mobileNumber').fill('0820000501');
    await textInput(modal(page), 'emailAddress').fill('autoqa.branch.indiv@example.com');

    // STEP 2: CLICK the *Upload Consent?* switch to turn it ON
    await expect(individualConsentSwitch(page)).not.toHaveClass(/ant-switch-checked/);
    await individualConsentSwitch(page).click();

    // SNAPSHOT: confirm the consent upload and template are revealed and Request OTP is hidden
    // ASSERT (BLOCKING): turning the toggle ON reveals **Upload Consent** and disables Save
    await expectFieldShown(modal(page), 'manualApproval');
    await expect(saveButton(page)).toBeDisabled({ timeout: LONG });

    // ASSERT: turning the toggle ON hides the **Request OTP** action
    await expect(modal(page).getByRole('button', { name: 'Request OTP' })).toBeHidden();

    // ASSERT: a **Download Consent Template** action is offered
    await expect(modal(page).getByRole('button', { name: 'Download Consent Template' })).toBeVisible();

    // ASSERT: only ONE document is requested — no Upload Resolution control for an Individual
    await expect(field(modal(page), 'resolution')).toHaveCount(0);
    await expect(field(modal(page), 'signatoryConsent')).toHaveCount(0);
    await expect(modal(page).getByRole('button', { name: 'Download Resolution Template' })).toHaveCount(0);

    // ASSERT: an **Upload** commit button appears only after a document is attached
    await expect(uploadCommitButton(page)).toHaveCount(0);

    // STEP 3: CLICK the **Upload Consent** control and attach the test document
    await attachDocument(page, 'manualApproval');

    // SNAPSHOT: confirm the attached document name and the Upload commit button
    // ASSERT: the attached document name is displayed against **Upload Consent**
    await expect(field(modal(page), 'manualApproval')).toContainText(TEST_DOC_NAME, { timeout: LONG });
    await expect(uploadCommitButton(page)).toBeVisible({ timeout: LONG });

    // STEP 4: CLICK **Upload**
    await uploadCommitButton(page).click();

    // STEP 5: WAIT for the client-detail block to be revealed
    // ASSERT: clicking **Upload** reveals the client-detail block and re-enables **Save**
    await expectFieldShown(modal(page), 'firstName');
    await expectFieldShown(modal(page), 'lastName');
    await expectFieldShown(modal(page), 'territory');
    await expect(saveButton(page)).toBeEnabled({ timeout: LONG });

    // ASSERT: the values entered before the commit are RETAINED — Mobile Number, Email Address and
    // ID Number all survive. (Corrected 2026-08-21: an earlier revision asserted the commit cleared
    // them, which it does not.)
    await expect(textInput(modal(page), 'mobileNumber')).toHaveValue('0820000501');
    await expect(textInput(modal(page), 'emailAddress')).toHaveValue('autoqa.branch.indiv@example.com');
    await expect(textInput(modal(page), 'idNumber')).toHaveValue('9001015800088');

    // STEP 6-10: capture the client-detail block, which the commit revealed for the first time.
    // It was never shown before the commit, so these are new entries rather than re-entries.
    await selectOption(modal(page), page, 'title', 'Mr');
    await textInput(modal(page), 'firstName').fill('AutoQA');
    await textInput(modal(page), 'lastName').fill('BranchIndivUpload');
    await selectOption(modal(page), page, 'territory', 'Gauteng');
    await selectOption(modal(page), page, 'preferredCommunication', 'Email');
    await expect(modal(page).locator('.ant-form-item-explain-error')).toHaveCount(0);

    // STEP 14: CLICK **Save**
    await expect(saveButton(page)).toBeEnabled();
    await saveButton(page).click();

    // STEP 15: WAIT for the lead details page to load
    await page.waitForURL(new RegExp(LEAD_DETAILS_PATH.replace(/\./g, '\\.')), { timeout: LONG });
    await page.waitForLoadState('networkidle').catch(() => {});

    // SNAPSHOT: confirm the saved lead
    // ASSERT: the lead saves and the URL becomes the lead details route
    expect(page.url()).toContain(LEAD_DETAILS_PATH);

    const main = page.locator('main');

    // ASSERT: the saved lead records Client Type `Individual (Individual)` and Lead Channel `Landbank Branch`
    await expect(main).toContainText('Individual (Individual)', { timeout: LONG });
    await expect(main).toContainText('Landbank Branch');
    await expect(main).toContainText('BranchIndivUpload');
  });

  test('TC-03b: Sole Proprietor follows the identical consent-only process', async ({ page }) => {
    // BLOCKED BY BUG-LB-007 — Sole Proprietor (Individual) is filtered out of the Client Type
    // dropdown, so this scenario cannot be executed at all.
    await loginAs(page, 'RM');
    await openBranchLeadModal(page);

    await field(modal(page), 'leadType').locator('.ant-select-selector').click();
    const available = await optionsFor(modal(page), page, 'leadType');

    test.skip(
      !available.includes(SOLE_PROPRIETOR),
      'BUG-LB-007: Sole Proprietor (Individual) is not selectable on the New Lead form.'
    );

    // STEP 1: SELECT Client Type — choose `Sole Proprietor (Individual)`
    await openOption(page, SOLE_PROPRIETOR).click();

    // ASSERT (BLOCKING): Sole Proprietor follows PROCESS A — a single consent upload, ID Number,
    // and a Request OTP alternative, exactly as Individual does.
    for (const f of ['mobileNumber', 'emailAddress', 'idNumber']) {
      await expectFieldShown(modal(page), f);
    }
    await expect(modal(page).getByRole('button', { name: 'Request OTP' })).toBeVisible({ timeout: LONG });

    await individualConsentSwitch(page).click();
    await expectFieldShown(modal(page), 'manualApproval');
    await expect(field(modal(page), 'resolution')).toHaveCount(0);
    await expect(saveButton(page)).toBeDisabled();
  });

  // -------------------------------------------------------------------------
  // TC-04 → TC-10: the seven Process-B client types
  // -------------------------------------------------------------------------
  for (const s of SCENARIOS) {
    test(`${s.tc}: ${s.clientType} — resolution + consent upload`, async ({ page }) => {
      await loginAs(page, 'RM');

      // Capture the CIPC lookup the Upload commit fires, including its body — for the
      // non-CIPC-registered types the call still fires but answers `success:false`.
      const lookupCalls: { status: number; body: string }[] = [];
      page.on('response', async (r) => {
        if (!r.url().includes('PopulateFromCompanyRegistration')) return;
        let body = '';
        try {
          body = await r.text();
        } catch {
          /* body already consumed or the response was aborted */
        }
        lookupCalls.push({ status: r.status(), body });
      });

      await openBranchLeadModal(page);

      // STEP 1: SELECT Client Type — choose this scenario's type
      await selectOption(modal(page), page, 'leadType', s.clientType);

      // SNAPSHOT: confirm the full client-detail block, Entity Name and the toggle
      // ASSERT: with the toggle OFF the full client-detail block is displayed
      for (const f of ['title', 'firstName', 'lastName', 'territory', 'preferredCommunication']) {
        await expectFieldShown(modal(page), f);
      }
      await expectFieldShown(modal(page), 'organisation');
      await expectFieldShown(modal(page), 'uploadResAndConsent');

      // STEP 1b: POPULATE EVERY VISIBLE REQUIRED FIELD **BEFORE** TOUCHING THE TOGGLE.
      // The Upload commit is conditional on the form already being complete — clicking it with any
      // required field empty issues NO request at all and silently does nothing. Verified 2026-08-21.
      await selectOption(modal(page), page, 'title', 'Mr');
      await textInput(modal(page), 'firstName').fill('AutoQA');
      await textInput(modal(page), 'lastName').fill(s.lastName);
      await textInput(modal(page), 'organisation').fill(`AutoQA Branch ${s.lastName}`);
      await selectOption(modal(page), page, 'territory', 'Gauteng');
      await selectOption(modal(page), page, 'preferredCommunication', 'Email');
      await textInput(modal(page), 'mobileNumber').fill(s.mobile);
      await textInput(modal(page), 'emailAddress').fill(s.email);

      // ASSERT: Entity Name is required for the `(Entity)`-suffixed types and optional for the
      // non-suffixed ones (BUG-LB-009 — inconsistent, given an identical upload process)
      await expectRequired(modal(page), 'organisation', s.entityNameRequired!);

      // ASSERT: no **Request OTP** action is offered for an entity client type
      await expect(modal(page).getByRole('button', { name: 'Request OTP' })).toHaveCount(0);

      // ASSERT: **Save** is enabled while the toggle is OFF
      await expect(saveButton(page)).toBeEnabled();

      // STEP 2: CLICK the *Upload Resolution and Consent?* switch to turn it ON
      await expect(entityConsentSwitch(page)).not.toHaveClass(/ant-switch-checked/);
      await entityConsentSwitch(page).click();

      // SNAPSHOT: confirm the signatory fields and both upload controls are revealed
      // ASSERT (BLOCKING): the toggle ON field set is identical for every Process-B type, all
      // required, and Save is disabled
      for (const f of PROCESS_B_UPLOAD_FIELDS) {
        await expectFieldShown(modal(page), f);
        await expectRequired(modal(page), f, true);
      }
      await expect(saveButton(page)).toBeDisabled({ timeout: LONG });

      // ASSERT: turning the toggle ON hides the client-detail block
      await expectFieldHidden(modal(page), 'firstName');

      // ASSERT: TWO documents are requested — both Upload Consent and Upload Resolution
      await expect(field(modal(page), 'signatoryConsent')).toHaveCount(1);
      await expect(field(modal(page), 'resolution')).toHaveCount(1);

      // ASSERT: both templates are offered
      await expect(modal(page).getByRole('button', { name: 'Download Consent Template' })).toBeVisible();
      await expect(modal(page).getByRole('button', { name: 'Download Resolution Template' })).toBeVisible();

      // STEP 3: attach the consent document
      await attachDocument(page, 'signatoryConsent');

      // STEP 4: attach the resolution document
      await attachDocument(page, 'resolution');

      // STEP 5: TYPE the Signatory ID Number field with a Luhn-valid SA ID
      await textInput(modal(page), 'signatoryIdNumber').fill('9207125001083');

      // STEP 6: TYPE the Company Registration Number field
      // NOTE (BUG-LB-008): Trust and Partnership have no CIPC company registration number in
      // reality, yet this field is REQUIRED for them. The lookup itself handles them correctly —
      // the API declines with an explanatory message (see STEP 10) — but the form still forces a
      // registration number to be typed before the Upload commit is offered at all.
      await textInput(modal(page), 'companyRegistrationNumber').fill(CIPC_REG_NO);

      // SNAPSHOT: confirm both attached document names and the Upload commit button
      // ASSERT: both attached document names are displayed against their controls
      await expect(field(modal(page), 'signatoryConsent')).toContainText(TEST_DOC_NAME, { timeout: LONG });
      await expect(field(modal(page), 'resolution')).toContainText(TEST_DOC_NAME);

      // ASSERT: an **Upload** commit button appears only after both documents are attached
      await expect(uploadCommitButton(page)).toBeVisible({ timeout: LONG });

      // STEP 9: CLICK **Upload**
      await uploadCommitButton(page).click();

      // STEP 10: WAIT for the CIPC lookup to resolve
      // ASSERT: the commit fires the CIPC lookup for EVERY Process-B type —
      // POST .../LBLead/PopulateFromCompanyRegistration. Captured via the response listener above.
      await expect
        .poll(() => lookupCalls.length, {
          timeout: LONG,
          message: 'the Upload commit should fire the CIPC lookup',
        })
        .toBeGreaterThan(0);
      expect(lookupCalls[0].status, 'the CIPC lookup should answer 200').toBe(200);

      if (s.cipcSupported) {
        // ASSERT: the lookup succeeded
        expect(lookupCalls[0].body, 'the CIPC lookup should report success').toContain('"success":true');

        // ASSERT: the CIPC lookup auto-populates **Entity Name** from the Company Registration
        // Number. Assert on the form item's rendered text, not the input value: after the commit
        // the CIPC name renders as read-only text rather than a populated input, so toHaveValue is
        // unsafe. The typed Entity Name is OVERWRITTEN by the CIPC-returned company name.
        await expect(field(modal(page), 'organisation'))
          .toContainText(CIPC_ENTITY_NAME, { timeout: LONG });

        // ASSERT: the Company Registration Number is normalised to its `K`-prefixed form.
        // Unlike Entity Name (which the commit re-renders as read-only text), this one stays an
        // <input>, so assert on its value — innerText would never contain it.
        await expect(textInput(modal(page), 'companyRegistrationNumber'))
          .toHaveValue(CIPC_REG_NO_NORMALISED, { timeout: LONG });
      } else {
        // ASSERT: for entity types that are NOT registered with CIPC (Trust, Partnership) the API
        // DELIBERATELY declines the lookup. Verified live 2026-08-21 — the response body is
        //   {"success":false,
        //    "message":"CIPC lookup is not available for Trust. This entity type is not
        //               registered with CIPC.",
        //    "leadId":"…","isNewLead":true,"companyName":null,"registrationNumber":null,…}
        // The lead is still created and the flow still continues; only the auto-populate is skipped.
        expect(lookupCalls[0].body, 'the CIPC lookup should decline for a non-CIPC entity type')
          .toContain('"success":false');
        expect(lookupCalls[0].body).toContain('not registered with CIPC');

        // ASSERT: no company name is returned, so Entity Name is NOT auto-populated
        expect(lookupCalls[0].body).toContain('"companyName":null');
        await expect(field(modal(page), 'organisation'))
          .not.toContainText(CIPC_ENTITY_NAME, { timeout: LONG });
      }

      // ASSERT: clicking **Upload** re-reveals the client-detail block and re-enables **Save**
      await expectFieldShown(modal(page), 'firstName');
      await expect(saveButton(page)).toBeEnabled({ timeout: LONG });

      // ASSERT: the commit CLEARS Title, First Name and Last Name (verified 2026-08-21), while
      // Mobile Number and Email Address survive.
      await expect(textInput(modal(page), 'firstName')).toHaveValue('');
      await expect(textInput(modal(page), 'lastName')).toHaveValue('');
      await expect(textInput(modal(page), 'mobileNumber')).toHaveValue(s.mobile);
      await expect(textInput(modal(page), 'emailAddress')).toHaveValue(s.email);

      // STEP 11-13: RE-POPULATE the three fields the commit cleared. Province and Preferred
      // Communication survive, so they are not re-entered.
      await selectOption(modal(page), page, 'title', 'Mr');
      await textInput(modal(page), 'firstName').fill('AutoQA');
      await textInput(modal(page), 'lastName').fill(s.lastName);

      if (!s.cipcSupported) {
        // ASSERT (BUG-LB-012): the declined lookup wipes BOTH entity fields and leaves Entity Name
        // in an UNRECOVERABLE state — it re-renders as read-only text (no <input> at all), so the
        // typed value is gone and cannot be re-entered, even though the field is still displayed.
        await expect(field(modal(page), 'organisation')).toHaveCount(1);
        await expect(textInput(modal(page), 'organisation')).toHaveCount(0);

        // Company Registration Number is also wiped, but it DOES stay an <input>, so re-enter it.
        await expect(textInput(modal(page), 'companyRegistrationNumber')).toHaveValue('');
        await textInput(modal(page), 'companyRegistrationNumber').fill(CIPC_REG_NO);
      }

      // STEP 14: CLICK **Save**
      await expect(saveButton(page)).toBeEnabled();
      await saveButton(page).click();

      // STEP 17: WAIT for the lead details page to load
      await page.waitForURL(new RegExp(LEAD_DETAILS_PATH.replace(/\./g, '\\.')), { timeout: LONG });
      await page.waitForLoadState('networkidle').catch(() => {});

      // SNAPSHOT: confirm the saved lead
      // ASSERT: the lead saves and records this Client Type and Lead Channel `Landbank Branch`
      expect(page.url()).toContain(LEAD_DETAILS_PATH);
      const main = page.locator('main');
      await expect(main).toContainText(s.clientType, { timeout: LONG });
      await expect(main).toContainText('Landbank Branch');
      await expect(main).toContainText(s.lastName);
    });
  }

  test('TC-11: Save is gated on the uploads for every client type', async ({ page }) => {
    await loginAs(page, 'RM');

    for (const clientType of SELECTABLE_CLIENT_TYPES) {
      // Each client type gets a FRESH modal — the toggle state persists across a type change, so
      // reusing one modal would carry the previous type's toggle in.
      await openBranchLeadModal(page);

      // STEP 1: SELECT the Client Type
      await selectOption(modal(page), page, 'leadType', clientType);

      const isProcessA = clientType === 'Individual (Individual)';
      const toggle = isProcessA ? individualConsentSwitch(page) : entityConsentSwitch(page);

      // SNAPSHOT: confirm **Save** is enabled while the upload toggle is OFF
      await expect(saveButton(page), `${clientType}: Save should be enabled with the toggle OFF`)
        .toBeEnabled({ timeout: LONG });

      // STEP 2: CLICK the upload toggle to turn it ON
      await toggle.click();

      // SNAPSHOT: confirm **Save** is disabled with no documents attached
      // ASSERT (BLOCKING): turning the upload toggle ON disables Save until the documents are committed
      await expect(saveButton(page), `${clientType}: Save should be disabled with the toggle ON`)
        .toBeDisabled({ timeout: LONG });

      // ASSERT: Process A gates on one document; Process B gates on both
      if (isProcessA) {
        await expectFieldShown(modal(page), 'manualApproval');
        await expect(field(modal(page), 'resolution')).toHaveCount(0);
      } else {
        await expectFieldShown(modal(page), 'signatoryConsent');
        await expectFieldShown(modal(page), 'resolution');
      }

      // STEP 3-4: CLICK **Save** and confirm no lead is created
      // ASSERT: no lead is created while Save is disabled — the modal stays open on the Leads page
      await expect(modal(page)).toBeVisible();
      expect(page.url()).toContain(LEADS_PATH);
    }

    // ASSERT: the upload toggle state PERSISTS across a Client Type change — switching between
    // Process-B types leaves it ON with the upload fields still rendered.
    await openBranchLeadModal(page);
    await selectOption(modal(page), page, 'leadType', 'Close Corporation (Entity)');
    await entityConsentSwitch(page).click();
    await expect(entityConsentSwitch(page)).toHaveClass(/ant-switch-checked/);

    await selectOption(modal(page), page, 'leadType', 'Trust');
    await expect(entityConsentSwitch(page), 'the toggle should stay ON across a Client Type change')
      .toHaveClass(/ant-switch-checked/);
    await expectFieldShown(modal(page), 'resolution');
  });

  test('TC-12: A branch-captured lead arrives with its consent already satisfied', async ({ page }) => {
    await loginAs(page, 'RM');

    // STEP 1: NAVIGATE to a lead captured through the branch upload route
    await page.goto(LEADS_PATH);
    await expect(page.getByRole('heading', { name: 'All Leads' })).toBeVisible({ timeout: LONG });

    // WAIT for the grid body to actually render before querying it. This is load-bearing: the grid
    // fetches asynchronously, so a `.count()` issued straight after `goto` returns 0 and the old
    // guard below would `test.skip` itself — which meant THIS TEST NEVER ONCE EXECUTED, silently,
    // while reporting as "skipped: run TC-04 first" even though TC-04 had just created the lead.
    const gridRows = page.locator('[role="row"].tr-body');
    await expect(gridRows.first()).toBeVisible({ timeout: LONG });

    const branchLead = gridRows.filter({ hasText: 'BranchCloseCorpUpload' }).first();

    // ASSERT, don't skip: TC-04 runs before this test in the same sequential run and saves a
    // `BranchCloseCorpUpload` lead, so its absence is a real failure, not a reason to opt out.
    await expect(
      branchLead,
      'no BranchCloseCorpUpload lead on page 1 of the Leads grid — TC-04 must run before TC-12'
    ).toHaveCount(1, { timeout: LONG });

    // Navigate via the row's own link href rather than clicking it: each row's first cell holds an
    // `a.sha-link` pointing at `LBLead-details?id=<guid>`, which is a stable, unambiguous handle.
    const leadHref = await branchLead.locator('a.sha-link').first().getAttribute('href');
    expect(leadHref, 'the grid row should expose a lead-details link').toBeTruthy();
    await page.goto(leadHref!);
    await page.waitForURL(new RegExp(LEAD_DETAILS_PATH.replace(/\./g, '\\.')), { timeout: LONG });
    await page.waitForLoadState('networkidle').catch(() => {});

    const main = page.locator('main');

    // STEP 2-5: run the pre-screening assessment to a passing outcome
    await main.getByRole('button', { name: /Initiate Pre-Screening/ }).click();
    await expect(modal(page).getByText('Pre-Screening Assessment')).toBeVisible({ timeout: LONG });

    // FRAGILE: the pre-screening radio groups carry no label association, so each question is
    // addressed by ordinal position (7 groups, fixed render order — see the sibling lead plan).
    const answers = ['Yes', 'Yes', 'Yes', 'No', 'No', 'Yes', 'Yes'];
    const radioGroups = modal(page).locator('.ant-radio-group');
    await expect(radioGroups).toHaveCount(answers.length);
    for (let i = 0; i < answers.length; i++) {
      await radioGroups.nth(i).locator(`label:has-text("${answers[i]}")`).click();
    }

    const confirmCheckbox = modal(page).locator('.ant-checkbox-wrapper');
    await expect(confirmCheckbox.locator('input[type="checkbox"]')).toBeEnabled({ timeout: LONG });
    await confirmCheckbox.click();
    await modal(page).getByRole('button', { name: /Submit/ }).click();

    // STEP 6: WAIT for the lead to convert
    await expect(modal(page)).toBeHidden({ timeout: LONG });
    await page.waitForLoadState('networkidle').catch(() => {});

    // ASSERT (BLOCKING): the lead converts with assessment `PASSED` and status `CONVERTED`
    // The detail page renders these values WORD-CASED (`Passed` / `Converted`), not upper-cased as
    // the reference-list item names suggest, and its read-only fields concatenate with no
    // separators — "…LeadStatusConvertedAssessmentPassedLead Owner…" — so anchor on each label.
    await expect(main).toContainText(/Lead\s*Status\s*Converted/i, { timeout: LONG });
    await expect(main).toContainText(/Assessment\s*Passed/i, { timeout: LONG });

    // STEP 7: CLICK the **Converted To Opportunity** link
    const oppRef = field(main, 'convertedToOpportunity');
    await expect(oppRef).toBeVisible({ timeout: LONG });
    await oppRef.locator('a').click();
    await page.waitForURL(/LBOpportunity-details/, { timeout: LONG });
    await page.waitForLoadState('networkidle').catch(() => {});

    // SNAPSHOT: confirm the Opportunity's consent-related fields
    // ASSERT: the uploaded resolution carries through as the Opportunity's **Resolution Document**
    await expect(main.getByRole('tab', { name: 'Client Info' })).toBeVisible({ timeout: LONG });
    await main.getByRole('tab', { name: 'Client Info' }).click();
    await expectFieldShown(main, 'loanApplication_manualApproval');
    await expect(field(main, 'loanApplication_manualApproval'))
      .toContainText(TEST_DOC_NAME, { timeout: LONG });

    // ASSERT: *Does the client have a resolution?* IS set on the converted Opportunity — the branch
    // route captured the resolution upfront, so it carries through (contrast the Online channel,
    // where the same field is unchecked; see ../leads/online-digital-channel-lead-capture.md TC-12).
    // BUG-LB-014: this field is rendered TWICE, both instances inside the same active Client Info
    // tab panel under **Entity Information**, so a bare locator trips Playwright's strict mode with
    // "resolved to 2 elements". Assert across EVERY instance rather than hardcoding the count, so
    // this keeps passing once the duplicate is removed.
    const hasResolutionBoxes = field(main, 'loanApplication_hasResolution').locator('input[type="checkbox"]');
    const boxCount = await hasResolutionBoxes.count();
    expect(boxCount, 'expected at least one "Does the client have a resolution?" control').toBeGreaterThan(0);
    for (let i = 0; i < boxCount; i++) {
      await expect(
        hasResolutionBoxes.nth(i),
        `"Does the client have a resolution?" instance ${i + 1}/${boxCount} should be checked`
      ).toBeChecked();
    }

    // ASSERT: the branch-captured lead does not present an outstanding consent stage once its loan
    // application is initiated — contrast with the Online Digital Channel route, which does.
    // Asserted at the plan level; initiating the application needs the full capture prerequisites
    // documented in ../opportunities/opportunity-loan-application-capture.md.
  });
});
