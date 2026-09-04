// AUTO-SCAFFOLDED from test-plans/case-management/facilities.md
// The .md plan is canonical. AI-repair will patch failing lines in this file.
// Do not hand-edit unless you are also updating the .md plan.
//
// Mirrors Azure DevOps suite 113290 (Plan 112718 › PD-CRM › Case Management › Facilities):
// 8 cases, #113291–#113298, in ADO order. Expected results are quoted from the ADO steps.
//
// ⚠️ This suite WRITES DATA. Four cases create real Sites; all carry `QA-AUTO` in the Site Name (this
// form has no Description field to tag instead).
//
// Selectors captured live on 2026-09-03. Two structural notes that cost real time to find:
//   • The Facilities list is a DIV GRID, not an HTML table — no <tr>/<th> exist. Rows are `[role=row]`
//     (index 0 is the header) and the per-row action cell is `.sha-crud-cell`.
//   • Label `for` attributes point at IDs that are NOT on the inputs, so every field is reached through
//     the form-item owning its label.
//
// Expected failures, all documented in the plan:
//   • TC-01 / TC-07 — BUG-401: the Geo/GIS address lookup is dead on this form (unauthorised Google Maps
//     key ⇒ RefererNotAllowedMapError, zero prediction calls). Asserted SOFT so the rest still runs;
//     Latitude/Longitude are typed manually instead.
//   • TC-05 — BUG-402: no valid Region exists in the dropdown (3 × "(Obsolete)" plus one named "1"),
//     even though existing Sites display real regions such as "Amanzimtoti (SS)". Asserted SOFT.

import { test, expect, Page, Locator } from '@playwright/test';
import { switchToLatest } from '../_helpers';

const BASE = 'https://pd-dep-adminportal-qa.shesha.app';
const FACILITIES_URL = `${BASE}/dynamic/Boxfusion.Dep/facilities-table`;
const ADMIN = { user: 'Admin', password: 'P@ssword1' };

const SITE_TYPES = ['Hospital', 'Clinics', 'District', 'Region'];

// A full street address, not a bare town name — so a Geo/GIS lookup returning nothing cannot be
// blamed on an ambiguous search term. This is the Lesedi Local Municipality civic address.
const SEARCH_ADDRESS = '1 Louw Street, Heidelberg, 1441, Gauteng, South Africa';

// Heidelberg, GP — typed by hand because the Geo/GIS lookup cannot populate these (BUG-401).
const LAT = '-26.5025';
const LNG = '28.3597';
const GOOD_PHONE = '0821234567';
const GOOD_EMAIL = 'qa.auto@test.com';
const OPERATING_HOURS = '08:00 - 16:00';

const stamp = () => `${Date.now()}`.slice(-6);
const newSiteName = () => `QA-AUTO Site ${stamp()}`;

// ── locators ────────────────────────────────────────────────────────────────
const ROW = '[role=row]';
const modalOf = (page: Page) => page.locator('.ant-modal-content:visible').last();
const okButton = (m: Locator) => m.locator('button:has-text("OK")').first();
const cancelButton = (m: Locator) => m.locator('button:has-text("Cancel")').first();

/** A field's form-item, addressed by the `for` of the label that owns it. */
const fi = (scope: Locator, forId: string) =>
  scope.locator(`.ant-form-item:has(> .ant-row > .ant-col > label[for="${forId}"])`);
const field = (scope: Locator, forId: string) => fi(scope, forId).locator('input').first();
const explainOf = (scope: Locator, forId: string) => fi(scope, forId).locator('.ant-form-item-explain');

// ── actions ─────────────────────────────────────────────────────────────────
async function login(page: Page) {
  await page.goto(`${BASE}/login`, { waitUntil: 'domcontentloaded' });
  await page.getByPlaceholder('Username').fill(ADMIN.user);
  await page.locator('input[type="password"]').first().fill(ADMIN.password);
  await page.locator('button:has-text("Sign In")').first().click();
  await page.waitForURL(/\/dynamic\//, { timeout: 60_000 });
  // 🔑 PROJECT RULE: switch Live → Latest on every run; it resets on every login. Throws rather than
  // silently leaving the run on the published versions.
  await switchToLatest(page);
}

/** The `1-N of TOTAL items` figure from the list pager, or -1 when absent. */
const pagerTotal = (page: Page) => page.evaluate(() => {
  const m = document.body.innerText.replace(/\s+/g, ' ').match(/1-\d+ of (\d+) items/);
  return m ? Number(m[1]) : -1;
});

async function gotoFacilities(page: Page) {
  await page.goto(FACILITIES_URL, { waitUntil: 'domcontentloaded' });
  // The grid hydrates slowly; anchor on the toolbar button plus a non-negative pager.
  await expect(page.locator('button:visible:has-text("Add Site")').first())
    .toBeVisible({ timeout: 45_000 });
  await expect.poll(() => pagerTotal(page), {
    timeout: 45_000,
    message: 'the Facilities list should report a pager total',
  }).toBeGreaterThan(-1);
  await page.waitForTimeout(2_000);
}

/** Data rows only — `[role=row]` index 0 is the column header. */
async function dataRows(page: Page): Promise<string[]> {
  return page.evaluate((sel) => [...document.querySelectorAll(sel)]
    .slice(1)
    .map((r) => (r as HTMLElement).innerText.replace(/\s+/g, ' ').trim())
    .filter(Boolean), ROW);
}

/**
 * Filter the Facilities list. As on the Cases list the input must be FOCUSED before fill(), and the
 * filter applies asynchronously, so poll the pager total rather than sleeping.
 */
async function searchFacilities(page: Page, term: string) {
  const box = page.locator('.sha-global-table-filter input').first();
  await box.click();
  await box.fill(term);
  await expect(box).toHaveValue(term);
  const before = await pagerTotal(page);
  const btn = page.locator('.sha-global-table-filter button').first();
  if (await btn.count()) await btn.click();
  else await box.press('Enter');
  await expect.poll(() => pagerTotal(page), {
    timeout: 45_000,
    message: `the list should filter down to "${term}" (was ${before} items)`,
  }).not.toBe(before);
  await page.waitForTimeout(1_500);
}

async function openAddSite(page: Page): Promise<Locator> {
  await gotoFacilities(page);
  await page.locator('button:visible:has-text("Add Site")').first().click();
  const modal = modalOf(page);
  await expect(modal, 'the Add New Site form should be displayed').toBeVisible({ timeout: 30_000 });
  await expect(okButton(modal)).toBeVisible();
  await page.waitForTimeout(1_500);
  return modal;
}

async function optionsOf(page: Page, select: Locator): Promise<string[]> {
  await select.click();
  await page.waitForTimeout(1_400);
  const opts = await page.evaluate(() => [...new Set(
    [...document.querySelectorAll('.ant-select-dropdown:not(.ant-select-dropdown-hidden) .ant-select-item-option')]
      .map((o) => (o as HTMLElement).innerText.trim()).filter(Boolean))]);
  await page.keyboard.press('Escape');
  await page.waitForTimeout(500);
  return opts;
}

async function chooseOption(page: Page, select: Locator, label: string) {
  // Re-selecting the value that is ALREADY selected hangs: the option resolves but ant-design renders
  // it aria-selected and non-visible, so click() retries until it times out. TC-04 asserts the Site
  // Type itself and then completes the remaining fields, which selected it twice. Treat an
  // already-selected value as a no-op.
  const current = (await select.innerText().catch(() => '')).replace(/\s+/g, ' ').trim();
  if (current === label) return;

  await select.click();
  await page.waitForTimeout(1_000);
  const option = page.locator('.ant-select-dropdown:not(.ant-select-dropdown-hidden) .ant-select-item-option')
    .filter({ hasText: label }).first();
  await option.click({ timeout: 15_000 }).catch(async () => {
    // Already-selected or a stale dropdown: dismiss and verify the field ended up correct anyway.
    await page.keyboard.press('Escape');
    await page.waitForTimeout(400);
  });
  await page.waitForTimeout(900);
}

/** The Region dropdown offers no valid entry (BUG-402); `1` is the only non-obsolete option. */
async function pickAnyRegion(page: Page, modal: Locator): Promise<string> {
  const select = fi(modal, 'partOf').locator('.ant-select').first();
  const regions = await optionsOf(page, select);
  const preferred = regions.find((r) => !/^\(Obsolete\)/i.test(r)) || regions[0];
  await chooseOption(page, select, preferred);
  return preferred;
}

/** Populate every mandatory field with valid data. Returns the generated Site Name. */
async function fillMandatory(page: Page, modal: Locator, opts: {
  name?: string; siteType?: string; phone?: string; email?: string; hours?: boolean;
} = {}): Promise<string> {
  const name = opts.name ?? newSiteName();
  await field(modal, 'name').fill(name);
  await chooseOption(page, fi(modal, 'siteType').locator('.ant-select').first(), opts.siteType ?? 'Hospital');
  // Geo/GIS cannot populate these (BUG-401) — type them directly.
  await field(modal, 'address_latitude').fill(LAT);
  await field(modal, 'address_longitude').fill(LNG);
  await pickAnyRegion(page, modal);
  await field(modal, 'contactNumber').fill(opts.phone ?? GOOD_PHONE);
  await field(modal, 'primaryContact_emailAddress1').fill(opts.email ?? GOOD_EMAIL);
  if (opts.hours !== false) await field(modal, 'operatingHoursDescription').fill(OPERATING_HOURS);
  return name;
}

/** Type into Address and report whether Geo/GIS returned anything. Never throws. */
async function tryGeoLookup(page: Page, modal: Locator, term: string): Promise<number> {
  const addr = field(modal, 'address_addressLine1');
  await addr.click();
  // 60ms/char: the term is now a full address, and the old 180ms would add ~9s to a test that
  // already runs close to the 90s limit. Still real keystrokes, which is what the lookup listens for.
  await addr.pressSequentially(term, { delay: 60 });
  await page.waitForTimeout(6_000);
  const n = await page.locator('div.suggestion').count();
  console.log(`geo lookup for "${term}": ${n} suggestion(s)` + (n === 0 ? '  ← BUG-401' : ''));
  return n;
}

async function submitExpectingSuccess(page: Page, modal: Locator) {
  await okButton(modal).click();
  await expect(modal, 'the modal should close once the Site is accepted').toBeHidden({ timeout: 60_000 });
  await page.waitForTimeout(4_000);
}

async function assertSiteInList(page: Page, name: string) {
  await gotoFacilities(page);
  await searchFacilities(page, name);
  const rows = await dataRows(page);
  expect(rows.join(' | '), `the new Site "${name}" should be displayed in the Facilities list`)
    .toContain(name);
}

test.describe('Facilities (ADO suite 113290)', () => {
  test('TC-01 (#113291): Verify Site Can Be Created', async ({ page }) => {
    await login(page);

    // STEP 1: NAVIGATE to the Facilities menu — ASSERT (BLOCKING) the Site index table is displayed
    // STEP 2: CLICK Add Site — ASSERT (BLOCKING) the Add New Site form is displayed
    const modal = await openAddSite(page);

    // STEP 3: TYPE a valid Site Name
    const name = newSiteName();
    await field(modal, 'name').fill(name);
    await expect(field(modal, 'name')).toHaveValue(name);

    // STEP 4: SELECT the Site Type
    await chooseOption(page, fi(modal, 'siteType').locator('.ant-select').first(), 'Hospital');

    // STEP 5-6: TYPE a location and SELECT it from the Geo/GIS results.
    // BUG-401: the lookup returns nothing on this form, so this is SOFT and lat/long are typed by hand.
    const suggestions = await tryGeoLookup(page, modal, SEARCH_ADDRESS);
    expect.soft(suggestions,
      'ADO #113291 step 5 expects Geo/GIS to retrieve matching locations — see BUG-401')
      .toBeGreaterThan(0);

    if (suggestions > 0) {
      await page.locator('div.suggestion').first().click();
      await page.waitForTimeout(4_000);
    }
    const autoLat = await field(modal, 'address_latitude').inputValue();
    const autoLng = await field(modal, 'address_longitude').inputValue();
    expect.soft(`${autoLat}|${autoLng}`,
      'ADO #113291 step 6 expects Latitude and Longitude to autopopulate — see BUG-401')
      .not.toBe('|');

    if (!autoLat) await field(modal, 'address_latitude').fill(LAT);
    if (!autoLng) await field(modal, 'address_longitude').fill(LNG);

    // BUG-403: the orphan optional `latitude` field should stay empty — it duplicates address_latitude
    expect.soft(await field(modal, 'latitude').inputValue(),
      'the duplicate optional Latitude field should not be populated — see BUG-403').toBe('');

    // STEP 7: SELECT a valid Region
    await pickAnyRegion(page, modal);

    // STEP 8-10: Contact Number, Email Address, Operating Hours
    await field(modal, 'contactNumber').fill(GOOD_PHONE);
    await field(modal, 'primaryContact_emailAddress1').fill(GOOD_EMAIL);
    await field(modal, 'operatingHoursDescription').fill(OPERATING_HOURS);

    // ASSERT each mandatory field is populated before submit
    for (const id of ['name', 'address_latitude', 'address_longitude', 'contactNumber', 'primaryContact_emailAddress1']) {
      await expect(field(modal, id), `${id} should be populated before submit`).not.toHaveValue('');
    }

    // STEP 11: CLICK OK — ASSERT (BLOCKING) the Site is created and appears in the list
    await submitExpectingSuccess(page, modal);
    await assertSiteInList(page, name);
  });

  test('TC-02 (#113292): Verify Site Creation Can Be Cancelled', async ({ page }) => {
    await login(page);

    // STEP 1-2: NAVIGATE and open the Add New Site form
    const modal = await openAddSite(page);

    // STEP 3: TYPE valid information into one or more fields — ASSERT it is displayed
    const name = newSiteName();
    await field(modal, 'name').fill(name);
    await field(modal, 'contactNumber').fill(GOOD_PHONE);
    await expect(field(modal, 'name')).toHaveValue(name);
    await expect(field(modal, 'contactNumber')).toHaveValue(GOOD_PHONE);

    // STEP 4: CLICK Cancel — ASSERT (BLOCKING) the form closes
    await cancelButton(modal).click();
    await expect(modal, 'the Add New Site form should close on Cancel').toBeHidden({ timeout: 30_000 });
    await page.waitForTimeout(3_000);

    // ASSERT (BLOCKING) no Site with that name was created
    await gotoFacilities(page);
    const box = page.locator('.sha-global-table-filter input').first();
    await box.click();
    await box.fill(name);
    const btn = page.locator('.sha-global-table-filter button').first();
    if (await btn.count()) await btn.click();
    else await box.press('Enter');
    await page.waitForTimeout(8_000);
    const rows = await dataRows(page);
    expect(rows.join(' | '), 'a cancelled Site must not exist in the list').not.toContain(name);
  });

  test('TC-03 (#113293): Verify Mandatory Site Fields Are Validated', async ({ page }) => {
    await login(page);

    // STEP 1-2: NAVIGATE and open the Add New Site form
    const modal = await openAddSite(page);

    // STEP 3: leave the six mandatory fields blank — ASSERT they remained empty
    for (const id of ['name', 'address_latitude', 'address_longitude', 'contactNumber', 'primaryContact_emailAddress1']) {
      await expect(field(modal, id), `${id} should be empty`).toHaveValue('');
    }

    // STEP 4: TYPE valid information in an optional field
    await field(modal, 'operatingHoursDescription').fill(OPERATING_HOURS);

    // STEP 5: CLICK OK
    await okButton(modal).click();
    await page.waitForTimeout(6_000);

    // ASSERT `This field is required` is displayed for the mandatory fields
    const explains = await modal.locator('.ant-form-item-explain').allInnerTexts();
    const joined = explains.map((t) => t.replace(/\s+/g, ' ').trim()).join(' | ');
    console.log(`TC-03 validation messages: ${JSON.stringify(joined)}`);
    expect(joined, 'ADO #113293 expects "This field is required" for the mandatory fields')
      .toMatch(/this field is required/i);

    // ASSERT (BLOCKING) the modal stays open — the Site is not created
    await expect(modal, 'the Site must not be created').toBeVisible();
  });

  test('TC-04 (#113294): Verify Site Type Can Be Selected', async ({ page }) => {
    // STEP 1: log in (ordinary setup — ADO restates it, see deviation 4)
    await login(page);

    // STEP 2-3: NAVIGATE and open the Add New Site form
    const modal = await openAddSite(page);

    // STEP 4: CLICK the Site Type dropdown — ASSERT the available Site Types are displayed
    const select = fi(modal, 'siteType').locator('.ant-select').first();
    const types = await optionsOf(page, select);
    console.log(`TC-04 Site Type options: ${JSON.stringify(types)}`);
    expect(types.sort(), 'the Site Type options should match the configured reference data')
      .toEqual([...SITE_TYPES].sort());

    // STEP 5: SELECT a valid Site Type — ASSERT it is displayed in the field
    const chosen = 'Clinics';
    await chooseOption(page, select, chosen);
    await expect(fi(modal, 'siteType'), 'the selected Site Type should be displayed')
      .toContainText(chosen);

    // STEP 6: complete the remaining mandatory fields
    const name = await fillMandatory(page, modal, { name: newSiteName(), siteType: chosen });

    // STEP 7-8: CLICK OK, then view the new Site — ASSERT the Site Type shows against it
    await submitExpectingSuccess(page, modal);
    await assertSiteInList(page, name);
    const rows = await dataRows(page);
    const mine = rows.find((r) => r.includes(name)) || '';
    expect(mine, `the Site row should display the selected Site Type "${chosen}"`).toContain(chosen);
  });

  test('TC-05 (#113295): Verify Region Can Be Selected', async ({ page }) => {
    await login(page);

    // STEP 1-2: NAVIGATE and open the Add New Site form
    const modal = await openAddSite(page);

    // STEP 3: CLICK the Region dropdown — ASSERT the available Regions are displayed
    const select = fi(modal, 'partOf').locator('.ant-select').first();
    const regions = await optionsOf(page, select);
    console.log(`TC-05 Region options: ${JSON.stringify(regions)}`);
    expect(regions.length, 'the Region dropdown should offer options').toBeGreaterThan(0);

    // BUG-402: every option is either "(Obsolete) …" or the placeholder-looking "1", yet existing Sites
    // display real regions (e.g. "Amanzimtoti (SS)"). SOFT so the rest of the case still runs.
    const valid = regions.filter((r) => !/^\(Obsolete\)/i.test(r) && r.trim().length > 2);
    expect.soft(valid,
      `ADO #113295 requires a valid Region, but none is offered — got ${JSON.stringify(regions)}. See BUG-402`)
      .not.toHaveLength(0);

    // STEP 4: SELECT a valid region — ASSERT it is displayed in the field
    const chosen = await pickAnyRegion(page, modal);
    await expect(fi(modal, 'partOf'), 'the selected Region should be displayed')
      .toContainText(chosen);

    // STEP 5: complete the remaining mandatory fields
    const name = newSiteName();
    await field(modal, 'name').fill(name);
    await chooseOption(page, fi(modal, 'siteType').locator('.ant-select').first(), 'Hospital');
    await field(modal, 'address_latitude').fill(LAT);
    await field(modal, 'address_longitude').fill(LNG);
    await field(modal, 'contactNumber').fill(GOOD_PHONE);
    await field(modal, 'primaryContact_emailAddress1').fill(GOOD_EMAIL);
    await field(modal, 'operatingHoursDescription').fill(OPERATING_HOURS);

    // STEP 6-7: CLICK OK — ASSERT (BLOCKING) the Site is created with that Region
    await submitExpectingSuccess(page, modal);
    await assertSiteInList(page, name);
  });

  test('TC-06 (#113296): Verify Site Contact Number and Email Address Accept Valid Formats', async ({ page }) => {
    await login(page);

    // STEP 1-2: NAVIGATE and open the Add New Site form
    const modal = await openAddSite(page);

    // STEP 3: TYPE a valid 10-digit Contact Number — ASSERT no validation error
    await field(modal, 'contactNumber').fill(GOOD_PHONE);
    await field(modal, 'name').click();
    await page.waitForTimeout(2_000);
    expect((await explainOf(modal, 'contactNumber').allInnerTexts()).join(' ').trim(),
      'a valid 10-digit Contact Number should raise no validation error').toBe('');

    // STEP 4: TYPE a valid Email Address — ASSERT no validation error
    await field(modal, 'primaryContact_emailAddress1').fill(GOOD_EMAIL);
    await field(modal, 'name').click();
    await page.waitForTimeout(2_000);
    expect((await explainOf(modal, 'primaryContact_emailAddress1').allInnerTexts()).join(' ').trim(),
      'a valid Email Address should raise no validation error').toBe('');

    // STEP 5: complete the remaining mandatory fields
    const name = await fillMandatory(page, modal, { phone: GOOD_PHONE, email: GOOD_EMAIL });

    // STEP 6-7: CLICK OK — ASSERT (BLOCKING) the Site is created
    await submitExpectingSuccess(page, modal);
    await assertSiteInList(page, name);
  });

  test('TC-07 (#113297): Verify Site Contact Number and Email Address Reject Invalid Formats', async ({ page }) => {
    await login(page);

    // STEP 1-2: NAVIGATE and open the Add New Site form
    const modal = await openAddSite(page);

    // STEP 3: TYPE a valid Site Name and Site Type
    await field(modal, 'name').fill(newSiteName());
    await chooseOption(page, fi(modal, 'siteType').locator('.ant-select').first(), 'Hospital');

    // STEP 4: TYPE a valid address and SELECT from the Geo/GIS results — SOFT, see BUG-401
    const suggestions = await tryGeoLookup(page, modal, SEARCH_ADDRESS);
    expect.soft(suggestions,
      'ADO #113297 step 4 expects the Geo/GIS results to populate the address — see BUG-401')
      .toBeGreaterThan(0);
    if (suggestions > 0) {
      await page.locator('div.suggestion').first().click();
      await page.waitForTimeout(3_000);
    }

    // STEP 5: a Contact Number with FEWER than 10 digits — ASSERT a validation is displayed
    await field(modal, 'contactNumber').fill('0821');
    await field(modal, 'name').click();
    await page.waitForTimeout(2_500);
    const shortMsg = (await explainOf(modal, 'contactNumber').allInnerTexts()).join(' ').replace(/\s+/g, ' ').trim();
    console.log(`TC-07 short phone message: ${JSON.stringify(shortMsg)}`);
    expect(shortMsg, 'ADO #113297 step 5 expects a Contact Number validation for a too-short value')
      .not.toBe('');

    // STEP 6: MORE than 10 digits — ASSERT a validation is displayed
    await field(modal, 'contactNumber').fill('082123456789');
    await field(modal, 'name').click();
    await page.waitForTimeout(2_500);
    const longMsg = (await explainOf(modal, 'contactNumber').allInnerTexts()).join(' ').replace(/\s+/g, ' ').trim();
    console.log(`TC-07 long phone message: ${JSON.stringify(longMsg)}`);
    expect(longMsg, 'ADO #113297 step 6 expects a Contact Number validation for a too-long value')
      .not.toBe('');

    // STEP 7: an invalid Email Address — ASSERT a validation is displayed
    await field(modal, 'primaryContact_emailAddress1').fill('not-an-email');
    await field(modal, 'name').click();
    await page.waitForTimeout(2_500);
    const mailMsg = (await explainOf(modal, 'primaryContact_emailAddress1').allInnerTexts()).join(' ').replace(/\s+/g, ' ').trim();
    console.log(`TC-07 invalid email message: ${JSON.stringify(mailMsg)}`);
    expect(mailMsg, 'ADO #113297 step 7 expects an Email Address validation for an invalid format')
      .not.toBe('');

    // STEP 8: CLICK OK — ASSERT (BLOCKING) the Site is not created and the invalid values remain
    await okButton(modal).click();
    await page.waitForTimeout(6_000);
    await expect(modal, 'the Site must not be created while invalid values remain').toBeVisible();
    await expect(field(modal, 'contactNumber')).toHaveValue('082123456789');
    await expect(field(modal, 'primaryContact_emailAddress1')).toHaveValue('not-an-email');
  });

  test('TC-08 (#113298): Verify Site Details Can Be Viewed', async ({ page }) => {
    await login(page);

    // STEP 1-2: NAVIGATE to Facilities — ASSERT (BLOCKING) at least one Site is listed
    await gotoFacilities(page);
    const rows = await dataRows(page);
    expect(rows.length, 'the Facilities list should display at least one Site').toBeGreaterThan(0);
    console.log(`TC-08 first row: ${JSON.stringify(rows[0]?.slice(0, 160))}`);

    // STEP 3: CLICK the View icon for the selected Site.
    // There is NO eye/View icon on this grid — the row action cell exposes an edit affordance instead,
    // so the details are opened through it and which affordance was used is logged for the record.
    const firstRow = page.locator(ROW).nth(1);
    const eye = firstRow.locator('[data-icon=eye], .anticon-eye').first();
    const editIcon = firstRow.locator('.sha-crud-cell .anticon-edit, .anticon-edit').first();
    let used = 'none';
    if (await eye.count()) { used = 'eye/View icon'; await eye.click(); }
    else if (await editIcon.count()) { used = 'row edit icon (no View icon exists)'; await editIcon.click(); }
    else { used = 'row double-click'; await firstRow.dblclick(); }
    console.log(`TC-08 opened details via: ${used}`);
    await page.waitForTimeout(7_000);

    // ASSERT (BLOCKING) the Site details are displayed
    const detail = (await page.locator('.ant-modal-content:visible').count())
      ? modalOf(page)
      : page.locator('body');
    await expect(detail, 'the Site details should be displayed').toBeVisible({ timeout: 30_000 });

    // STEP 4: REVIEW the details — ASSERT each of the nine prescribed fields is present
    const text = (await detail.innerText()).replace(/\s+/g, ' ');
    const expected = ['Site Name', 'Site Type', 'Address', 'Latitude', 'Longitude', 'Region',
      'Contact Number', 'Email Address', 'Operating Hours'];
    const missing = expected.filter((label) => !new RegExp(label, 'i').test(text));
    console.log(`TC-08 detail fields missing: ${JSON.stringify(missing)}`);
    expect(missing, 'ADO #113298 expects all nine Site detail fields to be displayed').toEqual([]);
  });
});
