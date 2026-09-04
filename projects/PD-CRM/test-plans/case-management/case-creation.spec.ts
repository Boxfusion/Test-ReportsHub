// AUTO-SCAFFOLDED from test-plans/case-management/case-creation.md
// The .md plan is canonical. AI-repair will patch failing lines in this file.
// Do not hand-edit unless you are also updating the .md plan.
//
// Mirrors Azure DevOps suite 112754 (Plan 112718 › PD-CRM › Case Management › Case Creation):
// 16 cases, #112757–#112772, in ADO order. Expected results are quoted from the ADO steps.
//
// ⚠️ This suite CREATES DATA. Six cases create real cases in QA. All test data carries `QA-AUTO`
// in the Description so the records are identifiable.
//
// Selectors captured live on 2026-09-01.

import { test, expect, Page, Locator } from '@playwright/test';
import { switchToLatest } from '../_helpers';

const BASE = 'https://pd-dep-adminportal-qa.shesha.app';
const CASES_URL = `${BASE}/dynamic/Boxfusion.ServiceManagement/service-requests`;
const ADMIN = { user: 'Admin', password: 'P@ssword1' };

const REQUIRED_MSG = /This field is required/i;
const PHONE_MSG = /Please enter a valid phone number/i;
const OUT_OF_BOUNDS = /outside Lesedi municipal bounds/i;

// Reference data confirmed live 2026-09-01
const ELECTRICAL_TYPES = ['Area Power Failure', 'Street Light Not Working'];
const WATER_TYPES = ['Burst Pipe', 'Complete Water Outage', 'Low Water Pressure'];

// An existing submitter, for the possible-matches lookup (#112772)
const EXISTING_SUBMITTER = { mobile: '0766567689', email: 'thabitha@gmail.com' };

const stamp = () => `${Date.now()}`.slice(-6);

// ── locators ────────────────────────────────────────────────────────────────
const modalOf = (page: Page) => page.locator('.ant-modal-content:visible').last();

/**
 * Address a field through the form-item that OWNS its label. The label `for` attributes point at
 * IDs that don't exist on the inputs, and form-items nest — so match the label as a direct
 * grandchild to get the innermost owner rather than an ancestor wrapper.
 */
const itemFor = (modal: Locator, forId: string) =>
  modal.locator(`.ant-form-item:has(> .ant-row > .ant-col > label[for="${forId}"])`).last();

const textFor = (modal: Locator, forId: string) => itemFor(modal, forId).locator('input.ant-input').first();
const numberFor = (modal: Locator, forId: string) => itemFor(modal, forId).locator('.ant-input-number-input').first();
const selectFor = (modal: Locator, forId: string) => itemFor(modal, forId).locator('.ant-select').first();
const explainFor = (modal: Locator, forId: string) => itemFor(modal, forId).locator('.ant-form-item-explain');

// FRAGILE: the Channel label lives in a SEPARATE form-item from its select, so it cannot be
// label-anchored like the others. Verified positionally: select 0 = Channel, 1 = Preferred Contact
// Method, 2 = Category, 3 = Case type (which only exists once a Category is chosen).
const channelSelect = (modal: Locator) => modal.locator('.ant-select').nth(0);

/**
 * The form-item that OWNS the Channel select — needed to read its validation message, since the
 * select and its `.ant-form-item-explain` do share one form-item (confirmed live 2026-09-02) even
 * though the label does not.
 *
 * Written as ONE selector rooted at the modal, not as `channelSelect(modal).locator('xpath=ancestor::…')`:
 * a chained Playwright locator is queried inside the parent's SUBTREE, so it can never resolve an
 * ancestor and silently yields "element(s) not found". The class tests are space-padded because a
 * bare `contains(@class,"ant-form-item")` also matches `ant-form-item-control`.
 */
const channelItem = (modal: Locator) => modal.locator(
  'xpath=(.//div[contains(concat(" ",normalize-space(@class)," ")," ant-select ")])[1]'
  + '/ancestor::div[contains(concat(" ",normalize-space(@class)," ")," ant-form-item ")][1]',
);

const okButton = (modal: Locator) => modal.locator('button:has-text("OK")').first();

// ── actions ─────────────────────────────────────────────────────────────────
async function login(page: Page) {
  await page.goto(`${BASE}/login`, { waitUntil: 'domcontentloaded' });
  await page.getByPlaceholder('Username').fill(ADMIN.user);
  await page.locator('input[type="password"]').first().fill(ADMIN.password);
  await page.locator('button:has-text("Sign In")').first().click();
  await page.waitForURL(/\/dynamic\//, { timeout: 60_000 });
  // 🔑 PROJECT RULE: switch Live → Latest on every run. The header defaults to Live, which serves
  // only PUBLISHED form versions; Latest serves what we are actually testing. It resets on every
  // login, so it must be re-applied per test. Throws rather than silently staying on Live.
  await switchToLatest(page);
}

async function openCreateCase(page: Page): Promise<Locator> {
  await login(page);
  await page.goto(CASES_URL, { waitUntil: 'domcontentloaded' });
  await page.locator('button:has-text("Create Case")').first().click();
  const modal = modalOf(page);
  await expect(modal).toBeVisible({ timeout: 30_000 });
  await expect(okButton(modal)).toBeVisible();
  return modal;
}

/** Open an ant-select and read the options currently offered. */
async function optionsOf(page: Page, select: Locator): Promise<string[]> {
  await select.click();
  await page.waitForTimeout(1_200);
  const opts = await page.evaluate(() => [...new Set(
    [...document.querySelectorAll('.ant-select-dropdown:not(.ant-select-dropdown-hidden) .ant-select-item-option')]
      .map(o => (o as HTMLElement).innerText.trim()).filter(Boolean))]);
  return opts;
}

async function chooseOption(page: Page, select: Locator, label: string) {
  await select.click();
  await page.waitForTimeout(900);
  await page.locator('.ant-select-dropdown:not(.ant-select-dropdown-hidden) .ant-select-item-option')
    .filter({ hasText: label }).first().click();
  await page.waitForTimeout(900);
}

/** Type into the geolocation search and pick a suggestion. Suggestions render into `div.suggestion`. */
async function pickAddress(page: Page, modal: Locator, query: string) {
  const search = modal.locator('input[placeholder="Search places"]').first();
  await search.fill(query);
  await page.waitForTimeout(3_500);
  const suggestion = page.locator('div.suggestion').first();
  await expect(suggestion, `geolocation suggestions for "${query}"`).toBeVisible({ timeout: 20_000 });
  const chosen = (await suggestion.innerText()).trim();
  await suggestion.click();
  await page.waitForTimeout(2_000);
  return chosen;
}

/** Fill the submitter block. Returns the unique first name used, for later identification. */
async function fillSubmitter(page: Page, modal: Locator, opts: {
  channel?: string; mobile?: string; email?: string; contactMethod?: string;
} = {}) {
  const id = stamp();
  const firstName = `QAAuto${id}`;
  if (opts.channel !== undefined) await chooseOption(page, channelSelect(modal), opts.channel);
  await textFor(modal, 'reportedUser_firstName').fill(firstName);
  await textFor(modal, 'reportedUser_lastName').fill('Tester');
  if (opts.mobile !== undefined) await textFor(modal, 'reportedUser_mobileNumber1').fill(opts.mobile);
  if (opts.email !== undefined) await textFor(modal, 'reportedUser_emailAddress1').fill(opts.email);
  if (opts.contactMethod) {
    await chooseOption(page, selectFor(modal, 'reportedUser_preferredContactMethod'), opts.contactMethod);
  }
  return firstName;
}

async function selectCategoryAndType(page: Page, modal: Locator, category: string, caseType: string) {
  await chooseOption(page, selectFor(modal, 'category'), category);
  await page.waitForTimeout(1_500);
  await chooseOption(page, selectFor(modal, 'caseType'), caseType);
}

/** Submit and expect the case to be ACCEPTED (modal closes). */
async function submitExpectingSuccess(page: Page, modal: Locator) {
  await okButton(modal).click();
  await expect(modal, 'modal should close once the case is accepted').toBeHidden({ timeout: 45_000 });
}

/** Submit and expect the case to be REJECTED (modal stays open). */
async function submitExpectingRejection(page: Page, modal: Locator) {
  await okButton(modal).click();
  await page.waitForTimeout(4_000);
  await expect(modal, 'modal should stay open — the case must not be created').toBeVisible();
}

// ── tests ───────────────────────────────────────────────────────────────────
test.describe('Case Creation (ADO suite 112754)', () => {
  test('TC-01 (#112757): Verify successful case creation using valid details', async ({ page }) => {
    const modal = await openCreateCase(page);

    // STEP 4-8: Channel, names, mobile, email, preferred contact method
    const who = await fillSubmitter(page, modal, {
      channel: 'Call Centre', mobile: '0821234567', email: 'qa.auto@test.com', contactMethod: 'Email',
    });

    // STEP 9-10: Category and Case type
    await selectCategoryAndType(page, modal, 'Electrical', 'Area Power Failure');

    // STEP 11: SEARCH for and SELECT a valid address
    await pickAddress(page, modal, 'Heidelberg');

    // STEP 12: TYPE a valid Description
    await textFor(modal, 'description').fill(`QA-AUTO ${who} — valid details`).catch(async () => {
      await modal.locator('textarea').first().fill(`QA-AUTO ${who} — valid details`);
    });

    // ASSERT mandatory fields are populated before submit
    await expect(textFor(modal, 'reportedUser_mobileNumber1')).toHaveValue('0821234567');
    await expect(textFor(modal, 'reportedUser_emailAddress1')).toHaveValue('qa.auto@test.com');

    // STEP 13: CLICK OK — ASSERT (BLOCKING) the case is created
    await submitExpectingSuccess(page, modal);

    // ASSERT (BLOCKING) the new case appears in the list
    await page.waitForTimeout(4_000);
    await expect(page.locator('body')).toContainText(who, { timeout: 30_000 });
  });

  test('TC-02 (#112758): Verify mandatory Channel validation', async ({ page }) => {
    const modal = await openCreateCase(page);

    // STEP 5: leave Channel blank; STEP 6: populate everything else
    await fillSubmitter(page, modal, { mobile: '0821234567', email: 'qa.auto@test.com' });
    await selectCategoryAndType(page, modal, 'Electrical', 'Area Power Failure');
    await pickAddress(page, modal, 'Heidelberg');

    // STEP 8: CLICK OK
    await submitExpectingRejection(page, modal);

    // ASSERT the Channel field shows "This field is required".
    // The original `filter({ has: modal.locator('.ant-select').nth(0) })` resolved to nothing:
    // `has:` re-scopes its inner locator against each candidate form-item, so the `.nth(0)` was
    // evaluated inside each item rather than against the modal and never matched. See channelItem().
    await expect(channelItem(modal).locator('.ant-form-item-explain'))
      .toContainText(REQUIRED_MSG, { timeout: 15_000 });
  });

  test('TC-03 (#112759): Verify mandatory Mobile Number validation', async ({ page }) => {
    const modal = await openCreateCase(page);

    // STEP 7: leave Mobile Number blank
    await fillSubmitter(page, modal, {
      channel: 'Call Centre', email: 'qa.auto@test.com', contactMethod: 'Email',
    });
    await expect(textFor(modal, 'reportedUser_mobileNumber1')).toHaveValue('');

    await selectCategoryAndType(page, modal, 'Electrical', 'Area Power Failure');
    await pickAddress(page, modal, 'Heidelberg');

    // STEP 15: CLICK OK
    await submitExpectingRejection(page, modal);

    // ASSERT a required / valid-phone-number validation message is shown
    await expect(explainFor(modal, 'reportedUser_mobileNumber1'))
      .toContainText(/This field is required|Please enter a valid phone number/i, { timeout: 15_000 });
  });

  test('TC-04 (#112760): Verify Mobile Number accepts a valid number starting with 0', async ({ page }) => {
    const modal = await openCreateCase(page);

    // STEP 7: a valid 10-digit mobile number starting with 0
    const who = await fillSubmitter(page, modal, {
      channel: 'Call Centre', mobile: '0821234567', email: 'qa.auto@test.com', contactMethod: 'Email',
    });

    // ASSERT no validation error is shown against Mobile Number after entry.
    // NOT `.not.toContainText(...)`: that ERRORS with "element(s) not found" when the locator
    // matches nothing — and an absent `.ant-form-item-explain` is exactly what "no error" looks
    // like on this form. Assert instead that no explain carrying the phone message exists, which
    // is satisfied both by no explain at all and by an explain about something else.
    await page.waitForTimeout(1_500);
    await expect(explainFor(modal, 'reportedUser_mobileNumber1').filter({ hasText: PHONE_MSG }))
      .toHaveCount(0);

    await selectCategoryAndType(page, modal, 'Electrical', 'Area Power Failure');
    await pickAddress(page, modal, 'Heidelberg');
    await modal.locator('textarea').first().fill(`QA-AUTO ${who} — mobile starting with 0`);

    // ASSERT (BLOCKING) the case is created
    await submitExpectingSuccess(page, modal);
    await page.waitForTimeout(4_000);
    await expect(page.locator('body')).toContainText(who, { timeout: 30_000 });
  });

  test('TC-05 (#112761): Verify Mobile Number rejects a number with a country code', async ({ page }) => {
    const modal = await openCreateCase(page);

    // STEP 5-6: Channel and names
    await fillSubmitter(page, modal, { channel: 'Call Centre' });

    // STEP 7: TYPE a mobile number using a country code
    await textFor(modal, 'reportedUser_mobileNumber1').fill('+27821234567');
    await textFor(modal, 'reportedUser_emailAddress1').click(); // blur to trigger validation
    await page.waitForTimeout(2_500);

    // ASSERT "Please enter a valid phone number" is displayed
    await expect(explainFor(modal, 'reportedUser_mobileNumber1')).toContainText(PHONE_MSG, { timeout: 15_000 });
  });

  test('TC-06 (#112762): Verify mandatory Email Address validation', async ({ page }) => {
    const modal = await openCreateCase(page);

    // STEP 8: leave the email address field empty
    await fillSubmitter(page, modal, { channel: 'Call Centre', mobile: '0821234567' });
    await expect(textFor(modal, 'reportedUser_emailAddress1')).toHaveValue('');

    await selectCategoryAndType(page, modal, 'Electrical', 'Area Power Failure');
    await pickAddress(page, modal, 'Heidelberg');

    // STEP 12: CLICK OK
    await submitExpectingRejection(page, modal);

    // ASSERT a validation message is displayed for Email Address
    await expect(explainFor(modal, 'reportedUser_emailAddress1')).toContainText(REQUIRED_MSG, { timeout: 15_000 });
  });

  test('TC-07 (#112763): Verify mandatory Category validation', async ({ page }) => {
    const modal = await openCreateCase(page);

    await fillSubmitter(page, modal, {
      channel: 'Call Centre', mobile: '0821234567', email: 'qa.auto@test.com', contactMethod: 'Email',
    });

    // STEP 11: leave Category empty — no case type is selected
    await expect(selectFor(modal, 'category').locator('.ant-select-selection-item')).toHaveCount(0);

    await pickAddress(page, modal, 'Heidelberg');

    // STEP 14: CLICK OK
    await submitExpectingRejection(page, modal);

    // ASSERT Category shows "This field is required"
    await expect(explainFor(modal, 'category')).toContainText(REQUIRED_MSG, { timeout: 15_000 });

    // ASSERT Case type shows the same message, since the two are cascaded
    await expect(explainFor(modal, 'caseType')).toContainText(REQUIRED_MSG, { timeout: 15_000 });
  });

  test('TC-08 (#112764): Verify Case type cascades based on selected Category', async ({ page }) => {
    const modal = await openCreateCase(page);
    await fillSubmitter(page, modal, {
      channel: 'Call Centre', mobile: '0821234567', email: 'qa.auto@test.com',
    });

    // ASSERT the Case type control does not exist before a Category is chosen —
    // it renders as an empty read-only span until then.
    await expect(itemFor(modal, 'caseType').locator('.ant-select')).toHaveCount(0);

    // STEP 7-8: select Electrical and read its case types
    await chooseOption(page, selectFor(modal, 'category'), 'Electrical');
    await page.waitForTimeout(1_500);
    const electrical = await optionsOf(page, selectFor(modal, 'caseType'));
    expect(electrical.sort()).toEqual([...ELECTRICAL_TYPES].sort());
    await page.keyboard.press('Escape');

    // STEP 9: change the Category
    await chooseOption(page, selectFor(modal, 'category'), 'Water');
    await page.waitForTimeout(2_000);

    // STEP 10: ASSERT (BLOCKING) options are refreshed to the new Category's case types only
    const water = await optionsOf(page, selectFor(modal, 'caseType'));
    expect(water.sort()).toEqual([...WATER_TYPES].sort());

    // ASSERT no Electrical case type remains selectable
    for (const t of ELECTRICAL_TYPES) expect(water).not.toContain(t);
  });

  test('TC-09 (#112765): Verify mandatory Case type validation', async ({ page }) => {
    const modal = await openCreateCase(page);
    await fillSubmitter(page, modal, {
      channel: 'Call Centre', mobile: '0821234567', email: 'qa.auto@test.com',
    });

    // STEP 7: select a valid Category; STEP 8: leave Case type empty
    await chooseOption(page, selectFor(modal, 'category'), 'Electrical');
    await page.waitForTimeout(1_500);
    await expect(selectFor(modal, 'caseType').locator('.ant-select-selection-item')).toHaveCount(0);

    await pickAddress(page, modal, 'Heidelberg');
    await modal.locator('textarea').first().fill('QA-AUTO — case type omitted');

    // STEP 11: CLICK OK
    await submitExpectingRejection(page, modal);

    // ASSERT "This field is required" against Case type
    await expect(explainFor(modal, 'caseType')).toContainText(REQUIRED_MSG, { timeout: 15_000 });
  });

  test('TC-10 (#112766): Verify successful address selection using geolocation', async ({ page }) => {
    const modal = await openCreateCase(page);
    const who = await fillSubmitter(page, modal, {
      channel: 'Call Centre', mobile: '0821234567', email: 'qa.auto@test.com',
    });
    await selectCategoryAndType(page, modal, 'Water', 'Burst Pipe');

    // STEP 8-9: ASSERT typing renders suggestions, and the choice populates the field
    const chosen = await pickAddress(page, modal, 'Heidelberg');
    expect(chosen.length, 'a geolocation suggestion should have been offered').toBeGreaterThan(0);

    // STEP 10: verify the address details
    await expect(modal.locator('input[placeholder="Search places"]').first()).not.toHaveValue('');

    await modal.locator('textarea').first().fill(`QA-AUTO ${who} — geolocation address`);

    // STEP 11: ASSERT (BLOCKING) the case is created with that address
    await submitExpectingSuccess(page, modal);
    await page.waitForTimeout(4_000);
    await expect(page.locator('body')).toContainText(who, { timeout: 30_000 });
  });

  test('TC-11 (#112767): Verify address outside Lesedi municipal bounds is rejected', async ({ page }) => {
    // Longer than the 90s default: this case waits out the absent out-of-bounds message and then
    // still has to submit and confirm the outcome. A timeout here would read as a failure of the
    // app rather than of the budget.
    test.setTimeout(180_000);

    const modal = await openCreateCase(page);
    const who = await fillSubmitter(page, modal, {
      channel: 'Call Centre', mobile: '0821234567', email: 'qa.auto@test.com',
    });
    await selectCategoryAndType(page, modal, 'Electrical', 'Area Power Failure');

    // STEP 7-8: search for and select an address outside the Lesedi Local Municipality
    const search = modal.locator('input[placeholder="Search places"]').first();
    await search.fill('Cape Town');
    await page.waitForTimeout(3_500);
    const suggestion = page.locator('div.suggestion').first();
    await expect(suggestion, 'geolocation suggestions for "Cape Town"').toBeVisible({ timeout: 20_000 });
    const chosen = (await suggestion.innerText()).trim();
    await suggestion.click();
    await page.waitForTimeout(3_000);

    // The suggestion actually taken must be the out-of-bounds one, or the rest proves nothing.
    expect(chosen, 'the suggestion selected should be outside Lesedi').toMatch(/Cape Town/i);
    await expect(search).toHaveValue(/Cape Town/i);

    // ASSERT the out-of-bounds error message is displayed. SOFT on purpose: when it is absent the
    // test must still go on to settle the second half of the ADO expectation — "no case should be
    // created" — rather than stopping here with that question open.
    await expect.soft(page.locator('body'),
      'ADO #112767 expects "Address is outside Lesedi municipal bounds. Please select an address within the Lesedi region"',
    ).toContainText(OUT_OF_BOUNDS, { timeout: 20_000 });

    // ASSERT (BLOCKING) no case is created. The ADO steps stop at selecting the address, but the
    // expected result covers creation too, so submit to establish whether the bound is enforced
    // anywhere in the flow. Tagged QA-AUTO-OOB so the record is findable if one IS created.
    await modal.locator('textarea').first()
      .fill(`QA-AUTO-OOB ${who} — Cape Town, outside Lesedi municipal bounds`);
    await okButton(modal).click();
    await page.waitForTimeout(6_000);

    const modalClosed = !(await modal.isVisible().catch(() => false));
    if (modalClosed) {
      // The submit was accepted. Pin down that the record really landed before failing, so the
      // report carries the evidence rather than just "the modal closed".
      await expect.soft(page.locator('body'),
        `the out-of-bounds case was ACCEPTED and now appears in the Cases list as ${who}`,
      ).toContainText(who, { timeout: 30_000 });
    }
    expect(modalClosed, 'the modal must stay open — an out-of-bounds case must not be created')
      .toBe(false);
  });

  test('TC-12 (#112768): Verify successful case creation when the address cannot be found', async ({ page }) => {
    const modal = await openCreateCase(page);
    const who = await fillSubmitter(page, modal, {
      channel: 'Call Centre', mobile: '0821234567', email: 'qa.auto@test.com',
    });
    await selectCategoryAndType(page, modal, 'Electrical', 'Street Light Not Working');

    // STEP 8: CHECK the Can't Find Address box
    await itemFor(modal, 'noAddress').locator('input[type=checkbox]').first().check();
    await page.waitForTimeout(2_500);

    // ASSERT the geolocation search field is hidden and Address/Lat/Long are revealed as required
    await expect(modal.locator('input[placeholder="Search places"]')).toBeHidden();
    const manualAddress = modal.locator('.ant-form-item:visible').filter({ hasText: /^Address/ }).last();
    await expect(manualAddress).toBeVisible();

    // STEP 9-10: TYPE address and coordinates
    await manualAddress.locator('input').first().fill('12 Test Street, Heidelberg');
    await numberFor(modal, 'latitude').fill('-26.5025');
    await numberFor(modal, 'longitude').fill('28.3597');

    // STEP 11: TYPE a description
    await modal.locator('textarea').first().fill(`QA-AUTO ${who} — manual address`);

    // STEP 12: ASSERT (BLOCKING) the case is created
    await submitExpectingSuccess(page, modal);
    await page.waitForTimeout(4_000);
    await expect(page.locator('body')).toContainText(who, { timeout: 30_000 });
  });

  test('TC-13 (#112769): Verify mandatory fields when Can\'t Find Address is checked', async ({ page }) => {
    const modal = await openCreateCase(page);
    await fillSubmitter(page, modal, {
      channel: 'Call Centre', mobile: '0821234567', email: 'qa.auto@test.com',
    });
    await selectCategoryAndType(page, modal, 'Electrical', 'Area Power Failure');

    // STEP 8: CHECK the Can't Find Address box.
    // ADO lists this step twice (8 and 9) — checking twice would untick it, so it is actioned once.
    // See BUG-102.
    await itemFor(modal, 'noAddress').locator('input[type=checkbox]').first().check();
    await page.waitForTimeout(2_500);

    // STEP 10: leave Address, Latitude and Longitude blank
    await expect(numberFor(modal, 'latitude')).toHaveValue('');
    await expect(numberFor(modal, 'longitude')).toHaveValue('');

    // STEP 11: CLICK OK
    await submitExpectingRejection(page, modal);

    // ASSERT "This field is required" against each of the three fields
    const explains = modal.locator('.ant-form-item-explain');
    await expect(explains.filter({ hasText: REQUIRED_MSG }).first()).toBeVisible({ timeout: 15_000 });
    await expect(explainFor(modal, 'latitude')).toContainText(REQUIRED_MSG, { timeout: 15_000 });
    await expect(explainFor(modal, 'longitude')).toContainText(REQUIRED_MSG, { timeout: 15_000 });
  });

  test('TC-14 (#112770): Verify case creation without a Description', async ({ page }) => {
    const modal = await openCreateCase(page);
    const who = await fillSubmitter(page, modal, {
      channel: 'Call Centre', mobile: '0821234567', email: 'qa.auto@test.com',
    });
    await selectCategoryAndType(page, modal, 'Electrical', 'Area Power Failure');
    await pickAddress(page, modal, 'Heidelberg');

    // STEP 9: ASSERT the Description field is left blank
    await expect(modal.locator('textarea').first()).toHaveValue('');

    // STEP 10: ASSERT (BLOCKING) the case is created without a description
    await submitExpectingSuccess(page, modal);
    await page.waitForTimeout(4_000);
    await expect(page.locator('body')).toContainText(who, { timeout: 30_000 });
  });

  test('TC-15 (#112771): Verify case creation without selecting a Preferred Contact Method', async ({ page }) => {
    const modal = await openCreateCase(page);

    // STEP 7: leave Preferred Contact Method unselected
    const who = await fillSubmitter(page, modal, {
      channel: 'Call Centre', mobile: '0821234567', email: 'qa.auto@test.com',
    });
    await expect(selectFor(modal, 'reportedUser_preferredContactMethod')
      .locator('.ant-select-selection-item')).toHaveCount(0);

    await selectCategoryAndType(page, modal, 'Electrical', 'Area Power Failure');
    await pickAddress(page, modal, 'Heidelberg');
    await modal.locator('textarea').first().fill(`QA-AUTO ${who} — no preferred contact method`);

    // STEP 11: ASSERT (BLOCKING) the case is created
    await submitExpectingSuccess(page, modal);
    await page.waitForTimeout(4_000);
    await expect(page.locator('body')).toContainText(who, { timeout: 30_000 });
  });

  test('TC-16 (#112772): Verify possible submitter matches are displayed', async ({ page }) => {
    const modal = await openCreateCase(page);

    // STEP 5: select a valid Channel
    await chooseOption(page, channelSelect(modal), 'Call Centre');

    // ASSERT the Submitter Details match panel is present on the form
    await expect(modal).toContainText(/possible matches for 'Submitter Details'/i, { timeout: 15_000 });

    // STEP 6: TYPE the contact details of an EXISTING submitter
    await textFor(modal, 'reportedUser_mobileNumber1').fill(EXISTING_SUBMITTER.mobile);
    await textFor(modal, 'reportedUser_emailAddress1').fill(EXISTING_SUBMITTER.email);
    await modal.locator('textarea').first().click(); // blur to trigger the lookup
    await page.waitForTimeout(6_000);

    // STEP 7: ASSERT a matching submitter record is surfaced.
    // The panel's placeholder text disappears once real matches are rendered.
    await expect(modal, 'an existing submitter should surface as a possible match')
      .not.toContainText(/The possible matches for 'Submitter Details' will appear here\./i, { timeout: 20_000 });
  });
});
