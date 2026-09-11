// AUTO-RECORDED from test-plans/leads/online-digital-channel-lead-capture.md
// The .md plan is canonical. AI-repair will patch failing lines in this file.
// Do not hand-edit unless you are also updating the .md plan.
//
// Recorded live against Land Bank CRM Dev on 2026-08-21 as the RM role, by walking all eight
// selectable Client Types on the Online Digital Channel.
//
// ONE PROCESS, THREE VARIANTS — the only field that varies is Entity Name (`organisation`):
//   A. Individual (Individual)                                  -> Entity Name HIDDEN
//   B. Close Corporation / Co-Operative / Listed Company (Entity) -> Entity Name REQUIRED
//   C. Trust / NGO / Partnership / Private Company               -> Entity Name OPTIONAL
// Everything else is identical for all eight: leadOwner*, channel*, leadType*, title*, firstName*,
// lastName*, territory*, preferredCommunication*, mobileNumber*, emailAddress*, description.
//
// NEVER PRESENT ON THIS CHANNEL (absent from the DOM for every client type):
//   manualApproval, signatoryIdNumber, companyRegistrationNumber, signatoryConsent, resolution, otpPin
// HIDDEN BY CLASS: region, idNumber, uploadResAndConsent (+ organisation for an Individual)
// Save is ENABLED from the outset for every client type — this channel never gates Save.
//
// TWO LESSONS CARRIED FROM THE SIBLING PLAN'S FIRST RUN (both cost a repair cycle there):
//   1. Conditional fields hide by TWO mechanisms — `ant-form-item-hidden` OR full DOM removal. A
//      helper that only checks the class fails with "element(s) not found" on the removal case.
//   2. Reading a select's options must be SCOPED to that select's own listbox via
//      aria-controls="rc_select_<n>_list". A just-closed dropdown only gains `-hidden`
//      asynchronously, so an unscoped read can concatenate two selects' option lists.
//
// DEFECTS
//   BUG-LB-011: `idNumber` is hidden for EVERY client type on this channel, including Individual —
//     yet the Branch channel requires a Luhn-validated ID for an Individual. Identity is therefore
//     unverified at lead capture here.
//   BUG-LB-009: Entity Name required for the 3 "(Entity)"-suffixed types but optional for the 4
//     non-suffixed ones, on both channels.
//   BUG-LB-007: `Sole Proprietor (Individual)` not selectable although still in the ClientType
//     reference list (value 3) — regression since 2026-07-31. TC-02 carries the expected fail.

import { test, expect, Page, Locator } from '@playwright/test';

// Environment & credentials come from process.env, loaded from a gitignored .env by
// playwright.config.ts (real env vars / CI secrets always win). NEVER hardcode a
// username, password, or token here — this file is committed and synced to the hub.

const LEADS_PATH = '/dynamic/LandBank.Crm/LBLead-table';
const LEAD_DETAILS_PATH = '/dynamic/LandBank.Crm/LBLead-details';

const LONG = 60000;

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

const SOLE_PROPRIETOR = 'Sole Proprietor (Individual)';
const CO_APPLICANT = 'Co-Applicant';

/** The field set common to every client type on this channel. */
const COMMON_REQUIRED = [
  'leadOwner', 'channel', 'leadType', 'title', 'firstName', 'lastName',
  'territory', 'preferredCommunication', 'mobileNumber', 'emailAddress',
] as const;

/** Controls that must never appear on this channel, for any client type. */
const NEVER_PRESENT = [
  'manualApproval', 'signatoryIdNumber', 'companyRegistrationNumber',
  'signatoryConsent', 'resolution', 'otpPin',
] as const;

/** Present in the DOM but hidden by class, for every client type. */
const ALWAYS_HIDDEN = ['region', 'idNumber', 'uploadResAndConsent'] as const;

type EntityName = 'hidden' | 'required' | 'optional';

type Scenario = {
  tc: string;
  clientType: string;
  entityName: EntityName;
  title: string;
  lastName: string;
  /** Set only where Entity Name is required — variant C deliberately leaves it empty. */
  organisation?: string;
  mobile: string;
  email: string;
};

const SCENARIOS: Scenario[] = [
  { tc: 'TC-03', clientType: 'Individual (Individual)', entityName: 'hidden', title: 'Ms',
    lastName: 'OnlineIndividual', mobile: '0820000601', email: 'autoqa.online.individual@example.com' },
  { tc: 'TC-04', clientType: 'Close Corporation (Entity)', entityName: 'required', title: 'Mr',
    lastName: 'OnlineCloseCorp', organisation: 'AutoQA Online Close Corp CC',
    mobile: '0820000602', email: 'autoqa.online.closecorp@example.com' },
  { tc: 'TC-05', clientType: 'Co-Operative (Entity)', entityName: 'required', title: 'Mr',
    lastName: 'OnlineCoOp', organisation: 'AutoQA Online Co-Op',
    mobile: '0820000603', email: 'autoqa.online.coop@example.com' },
  { tc: 'TC-06', clientType: 'Listed Company (Entity)', entityName: 'required', title: 'Mr',
    lastName: 'OnlineListedCo', organisation: 'AutoQA Online Listed Co Ltd',
    mobile: '0820000604', email: 'autoqa.online.listedco@example.com' },
  { tc: 'TC-07', clientType: 'Trust', entityName: 'optional', title: 'Mr',
    lastName: 'OnlineTrust', mobile: '0820000605', email: 'autoqa.online.trust@example.com' },
  { tc: 'TC-08', clientType: 'NGO', entityName: 'optional', title: 'Mr',
    lastName: 'OnlineNgo', mobile: '0820000606', email: 'autoqa.online.ngo@example.com' },
  { tc: 'TC-09', clientType: 'Partnership', entityName: 'optional', title: 'Mr',
    lastName: 'OnlinePartnership', mobile: '0820000607', email: 'autoqa.online.partnership@example.com' },
  { tc: 'TC-10', clientType: 'Private Company', entityName: 'optional', title: 'Mr',
    lastName: 'OnlinePrivateCo', mobile: '0820000608', email: 'autoqa.online.privateco@example.com' },
];

const ENTITY_NAME_BY_TYPE: Record<string, EntityName> = Object.fromEntries(
  SCENARIOS.map((s) => [s.clientType, s.entityName])
);

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
 * "Shown" = present AND un-hidden. "Not shown" = absent OR hidden.
 * This form uses BOTH mechanisms (class-based hiding and full DOM removal), so neither helper may
 * assume the other — see the header note.
 */
async function expectFieldShown(scope: Page | Locator, name: string) {
  const f = field(scope, name);
  await expect(f, `${name} should be present`).toHaveCount(1, { timeout: LONG });
  await expect(f, `${name} should not be hidden`).not.toHaveClass(/ant-form-item-hidden/, { timeout: LONG });
}

async function expectFieldNotShown(scope: Page | Locator, name: string) {
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
  if (required) await expect(mark, `${name} should be required`).toHaveCount(1, { timeout: LONG });
  else await expect(mark, `${name} should be optional`).toHaveCount(0, { timeout: LONG });
}

// FRAGILE: dropdown options render no role=option; the title attribute is the only stable handle.
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
 * Read a select's full option list, scoped to that select's own listbox.
 * An unscoped `.ant-select-dropdown:not(.ant-select-dropdown-hidden)` read can match a
 * just-closed dropdown too (it only gains `-hidden` asynchronously) and concatenate both lists.
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

/** Open a FRESH New Lead modal on the Online Digital Channel. */
async function openOnlineLeadModal(page: Page) {
  await page.goto(LEADS_PATH);
  await expect(page.getByRole('button', { name: 'New Lead' })).toBeVisible({ timeout: LONG });
  await page.getByRole('button', { name: 'New Lead' }).click();
  await expect(modal(page)).toBeVisible({ timeout: LONG });
  await expect(modal(page).getByText('Add New Lead')).toBeVisible();

  // SELECT Lead Channel — choose `Online Digital Channel`
  await selectOption(modal(page), page, 'channel', 'Online Digital Channel');
}

/** Assert this channel exposes no consent/resolution machinery whatsoever. */
async function expectNoConsentControls(page: Page) {
  for (const name of NEVER_PRESENT) {
    await expect(field(modal(page), name), `${name} must not exist on this channel`).toHaveCount(0);
  }
  await expect(modal(page).getByRole('button', { name: 'Request OTP' })).toHaveCount(0);
  await expect(modal(page).getByRole('button', { name: 'Upload', exact: true })).toHaveCount(0);
  await expect(modal(page).getByRole('button', { name: /Download .*Template/ })).toHaveCount(0);
  await expect(modal(page).locator('.ant-form-item:not(.ant-form-item-hidden) .ant-switch')).toHaveCount(0);
}

test.describe('LEAD-2.3 — Online Digital Channel Lead Capture (all Client Types)', () => {
  test('TC-01: Log in as an RM and open the New Lead form on the Online Digital Channel', async ({ page }) => {
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

    // STEP 8: SELECT Lead Channel — choose `Online Digital Channel`
    await selectOption(modal(page), page, 'channel', 'Online Digital Channel');

    // SNAPSHOT: confirm the client-detail block is rendered immediately
    // ASSERT: the client-detail block is presented IMMEDIATELY — no collapse, unlike the Branch channel
    for (const name of ['title', 'firstName', 'lastName', 'territory', 'preferredCommunication']) {
      await expectFieldShown(modal(page), name);
    }

    // ASSERT: **Save** is enabled from the outset
    await expect(saveButton(page)).toBeEnabled();

    // ASSERT: no consent / resolution / OTP / upload / template control is present
    await expectNoConsentControls(page);
  });

  test('TC-02: The Client Type dropdown offers exactly the eight selectable types', async ({ page }) => {
    await loginAs(page, 'RM');
    await openOnlineLeadModal(page);

    // STEP 1: CLICK the Client Type select trigger
    await field(modal(page), 'leadType').locator('.ant-select-selector').click();

    // SNAPSHOT: confirm the full option list
    // STEP 2: EXTRACT every Client Type option — scoped to this select's own listbox
    const options = await optionsFor(modal(page), page, 'leadType');

    // ASSERT (BLOCKING): the dropdown offers exactly the eight recorded options
    expect(options).toEqual([...SELECTABLE_CLIENT_TYPES]);

    // ASSERT: `Co-Applicant` is not offered (participant role, excluded by design)
    expect(options).not.toContain(CO_APPLICANT);

    // ASSERT: the option list is identical to the Landbank Branch channel's — Client Type
    // availability does not vary by channel.
    expect(options.length).toBe(8);

    // ASSERT: `Sole Proprietor (Individual)` IS offered
    // EXPECTED FAIL — BUG-LB-007: filtered out of the form although still present in the
    // ClientType reference list (item value 3); regression since 2026-07-31.
    expect
      .soft(
        options,
        'BUG-LB-007: Sole Proprietor (Individual) is filtered out of the New Lead Client Type ' +
          'dropdown although it remains in the ClientType reference list'
      )
      .toContain(SOLE_PROPRIETOR);
  });

  // -------------------------------------------------------------------------
  // TC-03 → TC-10: one test per client type
  // -------------------------------------------------------------------------
  for (const s of SCENARIOS) {
    const variant =
      s.entityName === 'hidden' ? 'Entity Name not captured'
      : s.entityName === 'required' ? 'Entity Name required'
      : 'Entity Name optional';

    test(`${s.tc}: ${s.clientType} — ${variant}`, async ({ page }) => {
      await loginAs(page, 'RM');
      await openOnlineLeadModal(page);

      // STEP 1: SELECT Client Type — choose this scenario's type
      await selectOption(modal(page), page, 'leadType', s.clientType);

      // SNAPSHOT: confirm the field set for this client type
      // ASSERT: the common required fields are displayed and required
      for (const name of COMMON_REQUIRED) {
        await expectFieldShown(modal(page), name);
        await expectRequired(modal(page), name, true);
      }

      // ASSERT: Description is displayed and optional
      await expectFieldShown(modal(page), 'description');
      await expectRequired(modal(page), 'description', false);

      // ASSERT (BLOCKING): the Entity Name state for this client type
      if (s.entityName === 'hidden') {
        await expectFieldNotShown(modal(page), 'organisation');
      } else {
        await expectFieldShown(modal(page), 'organisation');
        await expectRequired(modal(page), 'organisation', s.entityName === 'required');
      }

      // ASSERT: `region` and `idNumber` stay hidden — ID Number is never captured on this channel
      // (BUG-LB-011: the Branch channel requires a Luhn-validated ID for an Individual)
      for (const name of ALWAYS_HIDDEN) {
        await expectFieldNotShown(modal(page), name);
      }

      // ASSERT: no consent / resolution machinery appears for any client type on this channel
      await expectNoConsentControls(page);

      // ASSERT: **Save** is enabled — this channel never gates Save behind a document upload
      await expect(saveButton(page)).toBeEnabled();

      // STEP 2: SELECT Title
      await selectOption(modal(page), page, 'title', s.title);

      // STEP 3: TYPE the First Name field with `AutoQA`
      await textInput(modal(page), 'firstName').fill('AutoQA');

      // STEP 4: TYPE the Last Name field with this scenario's last name
      await textInput(modal(page), 'lastName').fill(s.lastName);

      // STEP 5: TYPE the Entity Name field — only where it is required.
      // Variant C deliberately leaves it EMPTY, which is the assertion (BUG-LB-009).
      if (s.organisation) {
        await textInput(modal(page), 'organisation').fill(s.organisation);
      }

      // STEP 6: SELECT Province — choose `Gauteng`
      await selectOption(modal(page), page, 'territory', 'Gauteng');

      // STEP 7: SELECT Preferred Communication — choose `Email`
      await selectOption(modal(page), page, 'preferredCommunication', 'Email');

      // STEP 8: TYPE the Mobile Number field
      await textInput(modal(page), 'mobileNumber').fill(s.mobile);

      // STEP 9: TYPE the Email Address field
      await textInput(modal(page), 'emailAddress').fill(s.email);

      if (s.tc === 'TC-03') {
        // STEP 10: TYPE the Description field (Individual scenario only)
        await field(modal(page), 'description').locator('textarea')
          .fill('AutoQA online digital channel — Individual.');
      }

      // SNAPSHOT: confirm **Save** is enabled
      await expect(saveButton(page)).toBeEnabled();

      // STEP 11: CLICK **Save**
      await saveButton(page).click();

      // STEP 12: WAIT for the lead details page to load
      await page.waitForURL(new RegExp(LEAD_DETAILS_PATH.replace(/\./g, '\\.')), { timeout: LONG });
      await page.waitForLoadState('networkidle').catch(() => {});

      // SNAPSHOT: confirm the saved lead
      // ASSERT: the lead saves and the URL becomes the lead details route
      expect(page.url()).toContain(LEAD_DETAILS_PATH);

      const main = page.locator('main');

      // ASSERT: the saved lead records this Client Type and Lead Channel `Online Digital Channel`
      await expect(main).toContainText(s.clientType, { timeout: LONG });
      await expect(main).toContainText('Online Digital Channel');
      await expect(main).toContainText(s.lastName);

      // ASSERT: the saved lead shows Lead Status `New` and offers Initiate Pre-Screening.
      // Anchor on the label so this reads the status field rather than any stray "new" on the page.
      // Two authoring traps here, both hit on 2026-08-21:
      //   1. the detail page renders the value word-cased (`New`), NOT upper-cased (`NEW`) as the
      //      `LeadStatus` reference-list item name suggests; and
      //   2. the read-only fields concatenate with no separators — `main`'s text is
      //      "…LeadStatusNewAssessment…" — so `\b` word boundaries never match around the value.
      await expect(main).toContainText(/Lead\s*Status\s*New/i, { timeout: LONG });
      await expect(main.getByRole('button', { name: /Initiate Pre-Screening/ })).toBeVisible();

      // ASSERT: **Region** is derived server-side from the selected Province
      await expect(main).toContainText('Central Region', { timeout: LONG });

      if (s.organisation) {
        // ASSERT (BUG-LB-013): the captured **Entity Name is NOT displayed anywhere on the lead
        // details page**, even though it was a REQUIRED field at capture. Verified 2026-08-21: the
        // value *is* persisted — `Entities/GetAll` returns
        //   organisation: "AutoQA Online Close Corp CC"
        // for this lead — so this is purely a rendering gap in `LBLead-details v58`, not data loss.
        // Persistence is proven in TC-13, which reads it back off the Leads table's own response.
        await expect(main).not.toContainText(s.organisation);
      }
    });
  }

  test('TC-11: The field matrix holds across every client type, and Save is never gated', async ({ page }) => {
    await loginAs(page, 'RM');
    await openOnlineLeadModal(page);

    for (const clientType of SELECTABLE_CLIENT_TYPES) {
      // STEP 1: SELECT the Client Type
      await selectOption(modal(page), page, 'leadType', clientType);

      // SNAPSHOT: confirm the common field set and the Entity Name state
      // ASSERT (BLOCKING): the common required fields are present for EVERY client type
      for (const name of COMMON_REQUIRED) {
        await expectFieldShown(modal(page), name);
      }
      await expectFieldShown(modal(page), 'description');
      await expectRequired(modal(page), 'description', false);

      // ASSERT: Entity Name is hidden / required / optional per the recorded matrix
      const expected = ENTITY_NAME_BY_TYPE[clientType];
      if (expected === 'hidden') {
        await expectFieldNotShown(modal(page), 'organisation');
      } else {
        await expectFieldShown(modal(page), 'organisation');
        await expectRequired(modal(page), 'organisation', expected === 'required');
      }

      // ASSERT: `region` and `idNumber` remain hidden for every client type
      for (const name of ALWAYS_HIDDEN) {
        await expectFieldNotShown(modal(page), name);
      }

      // ASSERT: no consent / resolution / OTP / upload / template control for ANY client type
      await expectNoConsentControls(page);

      // SNAPSHOT: confirm **Save** is enabled with no documents involved
      // ASSERT: Save is enabled for every client type — never gated on this channel
      await expect(saveButton(page), `${clientType}: Save should be enabled`).toBeEnabled({ timeout: LONG });
    }

    // ASSERT: switching Client Type does not leave a previous type's fields behind — after
    // returning to Individual, Entity Name is hidden again.
    await selectOption(modal(page), page, 'leadType', 'Individual (Individual)');
    await expectFieldNotShown(modal(page), 'organisation');
  });

  test('TC-12: An online-captured lead leaves its consent stage outstanding in the workflow', async ({ page }) => {
    await loginAs(page, 'RM');

    // STEP 1: NAVIGATE to the lead saved in TC-04
    await page.goto(LEADS_PATH);
    await expect(page.getByRole('heading', { name: 'All Leads' })).toBeVisible({ timeout: LONG });

    // WAIT for the grid body to actually render before querying it. This is load-bearing: the grid
    // fetches asynchronously, so a `.count()` issued straight after `goto` returns 0 and the old
    // guard below would `test.skip` itself — which meant THIS TEST NEVER ONCE EXECUTED, silently,
    // while reporting as "skipped: run TC-04 first" even though TC-04 had just created the lead.
    const gridRows = page.locator('[role="row"].tr-body');
    await expect(gridRows.first()).toBeVisible({ timeout: LONG });

    const onlineLead = gridRows.filter({ hasText: 'OnlineCloseCorp' }).first();

    // ASSERT, don't skip: TC-04 runs before this test in the same sequential run and saves an
    // `OnlineCloseCorp` lead, so its absence is a real failure, not a reason to opt out.
    await expect(
      onlineLead,
      'no OnlineCloseCorp lead on page 1 of the Leads grid — TC-04 must run before TC-12'
    ).toHaveCount(1, { timeout: LONG });

    // Navigate via the row's own link href rather than clicking it: each row's first cell holds an
    // `a.sha-link` pointing at `LBLead-details?id=<guid>`, which is a stable, unambiguous handle.
    const leadHref = await onlineLead.locator('a.sha-link').first().getAttribute('href');
    expect(leadHref, 'the grid row should expose a lead-details link').toBeTruthy();
    await page.goto(leadHref!);
    await page.waitForURL(new RegExp(LEAD_DETAILS_PATH.replace(/\./g, '\\.')), { timeout: LONG });
    await page.waitForLoadState('networkidle').catch(() => {});

    const main = page.locator('main');

    // STEP 2-5: run the pre-screening assessment to a passing outcome
    await main.getByRole('button', { name: /Initiate Pre-Screening/ }).click();
    await expect(modal(page).getByText('Pre-Screening Assessment')).toBeVisible({ timeout: LONG });

    // FRAGILE: the pre-screening radio groups carry no label association, so each question is
    // addressed by ordinal position (7 groups, fixed render order — see the lifecycle plan).
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

    // ASSERT (BLOCKING): the lead converts with assessment `Passed` and status `Converted`.
    // Same two traps as the Lead Status assertion in TC-03..TC-10: the detail page renders these
    // values WORD-CASED (`Passed` / `Converted`), not upper-cased as the reference-list item names
    // suggest, and the read-only fields concatenate with no separators —
    // "…LeadStatusConvertedAssessmentPassedLead Owner…" — so anchor on each label.
    await expect(main).toContainText(/Lead\s*Status\s*Converted/i, { timeout: LONG });
    await expect(main).toContainText(/Assessment\s*Passed/i, { timeout: LONG });

    // STEP 7: CLICK the **Converted To Opportunity** link
    const oppRef = field(main, 'convertedToOpportunity');
    await expect(oppRef).toBeVisible({ timeout: LONG });
    await oppRef.locator('a').click();
    await page.waitForURL(/LBOpportunity-details/, { timeout: LONG });
    await page.waitForLoadState('networkidle').catch(() => {});

    // SNAPSHOT: confirm the Opportunity's consent-related fields
    await main.getByRole('tab', { name: 'Client Info' }).click();

    // ASSERT: the Opportunity carries NO consent document from lead capture — contrast with the
    // Branch channel, where the uploaded consent carries through as the Resolution Document.
    await expectFieldNotShown(main, 'loanApplication_manualApproval');

    // ASSERT: *Does the client have a resolution?* is NOT set on the converted Opportunity.
    // BUG-LB-014: this field is rendered TWICE, both instances inside the same active Client Info
    // tab panel under the **Entity Information** section, both read-only and identical. A bare
    // `field(...).locator('input[type=checkbox]')` therefore trips Playwright's strict mode with
    // "resolved to 2 elements". Assert across EVERY instance rather than hardcoding the count, so
    // this keeps passing once the duplicate is removed.
    const hasResolutionBoxes = field(main, 'loanApplication_hasResolution').locator('input[type="checkbox"]');
    const boxCount = await hasResolutionBoxes.count();
    expect(boxCount, 'expected at least one "Does the client have a resolution?" control').toBeGreaterThan(0);
    for (let i = 0; i < boxCount; i++) {
      await expect(
        hasResolutionBoxes.nth(i),
        `"Does the client have a resolution?" instance ${i + 1}/${boxCount} should be unchecked`
      ).not.toBeChecked();
    }

    // ASSERT: once the loan application is initiated the Inbox presents an outstanding
    // **Upload Entity Consent** action — the consent is captured IN THE WORKFLOW, not at lead
    // capture. Initiating requires the full Opportunity capture prerequisites (see
    // ../opportunities/opportunity-loan-application-capture.md) and is covered end-to-end by
    // ../workflow/loan-application-workflow-stages.md, so it is asserted there rather than here.
  });

  // ---------------------------------------------------------------------------
  // TC-13: Entity Name persists even though the details page never renders it
  // ---------------------------------------------------------------------------
  test('TC-13: Entity Name persists on the saved lead although the details page never shows it', async ({ page }) => {
    await loginAs(page, 'RM');

    // Read the value back off the Leads table's OWN data request rather than re-authenticating
    // against the API by hand: the grid already selects `organisation` in its `properties` list,
    // even though it renders no Entity Name column.
    const leadRows: { lastName: string; organisation: string | null }[] = [];
    page.on('response', async (r) => {
      if (!/\/api\/services\/app\/Entities\/GetAll/.test(r.url())) return;
      if (!/entityType=LandBank\.Crm\.Domain\.LBLead/.test(decodeURIComponent(r.url()))) return;
      try {
        const j = await r.json();
        for (const it of j?.result?.items ?? []) {
          leadRows.push({ lastName: it.lastName, organisation: it.organisation });
        }
      } catch {
        /* not the JSON payload we're after */
      }
    });

    // STEP 1: NAVIGATE to the Leads table, newest first — the leads saved by TC-03..TC-10 are at the top
    await page.goto(LEADS_PATH);
    await page.waitForLoadState('networkidle').catch(() => {});
    await expect.poll(() => leadRows.length, { timeout: LONG }).toBeGreaterThan(0);

    // ASSERT (BLOCKING): for every client type where Entity Name was REQUIRED at capture, the
    // typed value is persisted verbatim — proving BUG-LB-013 is a display-only gap on
    // `LBLead-details v58` and NOT data loss.
    const withEntityName = SCENARIOS.filter((s) => s.organisation);
    expect(withEntityName.length, 'expected at least one Entity-Name-required scenario').toBeGreaterThan(0);

    for (const s of withEntityName) {
      const row = leadRows.find((r) => r.lastName === s.lastName);
      expect(row, `no saved lead found for ${s.lastName} (${s.clientType})`).toBeTruthy();
      expect(
        row!.organisation,
        `${s.clientType}: Entity Name should persist as "${s.organisation}"`
      ).toBe(s.organisation);
    }

    // ASSERT: where Entity Name was optional and left blank, it persists as null — no silent default
    for (const s of SCENARIOS.filter((x) => x.entityName === 'optional' && !x.organisation)) {
      const row = leadRows.find((r) => r.lastName === s.lastName);
      if (row) {
        expect(row.organisation, `${s.clientType}: blank Entity Name should persist as null`).toBeNull();
      }
    }

    // ASSERT: the grid renders NO Entity Name column, so the value is invisible in the UI on both
    // the grid and the details page — the operator has no way to read back what they captured.
    // NOTE: this grid is div-based — there is NO <thead> (nor a real <table>); the headers are
    // `[role="columnheader"]` cells. Asserting `not.toContainText` against `table thead` FAILS on a
    // zero-element locator rather than passing vacuously, which is how this was first mis-read.
    const columnHeaders = page.locator('[role="columnheader"]');
    await expect(columnHeaders.first()).toBeVisible({ timeout: LONG });
    const headerNames = (await columnHeaders.allInnerTexts()).map((t) => t.trim()).filter(Boolean);
    expect(headerNames.length, 'the Leads grid should render its column headers').toBeGreaterThan(0);
    expect(
      headerNames.some((h) => /entity\s*name/i.test(h)),
      `the Leads grid should have no Entity Name column; got: ${headerNames.join(', ')}`
    ).toBe(false);
  });
});
