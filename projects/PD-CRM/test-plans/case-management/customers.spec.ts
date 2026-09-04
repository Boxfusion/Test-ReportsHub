// Customers — ADO suite 113324 (#113348–#113358), mirrored one-to-one from
// test-plans/case-management/customers.md. The .md plan is canonical; this spec is derived.
//
// ⚠️ THIS SUITE MUTATES DATA.
//   • TC-05 edits a customer's Phone Number.
//   • TC-06 PERMANENTLY DELETES a customer.
// Both are guarded to act only on `QAAuto*` customers created by this project's own Case Creation
// runs, and never on the read-only anchor. The list holds 789 customers, most of them genuine —
// `assertSafeTarget()` is what stands between this suite and a real record.
//
// Known deviations (see the plan's "Deviations from the ADO text"):
//   • TC-06/TC-07 — BUG-501: the delete dialog reads "Delete User / are you sure you want to delete
//     this user?" with `no`/`yes`, not the ADO's "Are you sure you want to delete this item?" with
//     Cancel/OK. Asserted SOFT so the cases still execute.
//   • customer-details-v1 has NO label↔input association, so fields are addressed by their current
//     value. That lookup doubles as proof of ADO #113352 step 4 ("existing information populated").

import { test, expect, Page, Locator } from '@playwright/test';
import { switchToLatest } from '../_helpers';
import * as fs from 'fs';

const BASE = 'https://pd-dep-adminportal-qa.shesha.app';
const CUSTOMERS_URL = `${BASE}/dynamic/Boxfusion.Dep/table-customers`;
const ADMIN = { user: 'Admin', password: 'P@ssword1' };

/** Read-only anchor: verified 2026-09-03 to have exactly one logged case and one interaction. */
const ANCHOR = 'QAAuto604351';
/** Every customer this project created carries this prefix. Mutations are confined to it. */
const QA_PREFIX = 'QAAuto';
const KNOWN_PHONE = '0821234567';
const KNOWN_EMAIL = 'qa.auto@test.com';
const NO_MATCH_TERM = 'ZZQQNOSUCHCUSTOMER9182734';

const stamp = () => `${Date.now()}`.slice(-6);

// ── locators ────────────────────────────────────────────────────────────────
const ROW = '[role=row]';
const searchBox = (page: Page) => page.locator('.sha-global-table-filter input').first();
const pager = (page: Page) => page.locator('.ant-pagination').first();

// ── actions ─────────────────────────────────────────────────────────────────
async function login(page: Page) {
  // The login page intermittently fails to paint on a slower connection — `page.goto` times out, or
  // the Username field never appears. It cost three false failures on 2026-09-03 (Facilities TC-01
  // and TC-08, Customers TC-01), each of which reads like an app defect and is not one. One reload
  // clears it, so retry the navigation rather than letting a network blip fail a test case.
  const user = page.getByPlaceholder('Username');
  for (let attempt = 1; attempt <= 3; attempt++) {
    try {
      await page.goto(`${BASE}/login`, { waitUntil: 'domcontentloaded', timeout: 45_000 });
      await user.waitFor({ state: 'visible', timeout: 20_000 });
      break;
    } catch (e) {
      if (attempt === 3) throw e;
      console.log(`login page did not render (attempt ${attempt}) — retrying`);
      await page.waitForTimeout(3_000);
    }
  }
  await user.fill(ADMIN.user);
  await page.locator('input[type="password"]').first().fill(ADMIN.password);
  await page.locator('button:has-text("Sign In")').first().click();
  await page.waitForURL(/\/dynamic\//, { timeout: 60_000 });
  // 🔑 PROJECT RULE: Live → Latest on every login. Throws rather than falling back to Live.
  await switchToLatest(page);
}

async function gotoCustomers(page: Page) {
  await page.goto(CUSTOMERS_URL, { waitUntil: 'domcontentloaded' });
  await page.waitForLoadState('networkidle').catch(() => {});
  await expect(page.locator(ROW).first(), 'the Customers list should render its grid')
    .toBeVisible({ timeout: 45_000 });
  await page.waitForTimeout(2_500);
}

/** Row texts WITHOUT the header — [role=row] index 0 is the header row on this grid. */
async function dataRows(page: Page): Promise<string[]> {
  const all = await page.locator(ROW).allInnerTexts();
  return all.slice(1).map((t) => t.replace(/\s+/g, ' ').trim()).filter(Boolean);
}

async function pagerText(page: Page): Promise<string> {
  return (await pager(page).innerText().catch(() => '')).replace(/\s+/g, ' ').trim();
}

/** `1-10 of 789 items` → 789; `0 items found` → 0. */
function totalFromPager(text: string): number | null {
  const of = text.match(/of\s+([\d\s]+?)\s+items/i);
  if (of) return Number(of[1].replace(/\s/g, ''));
  if (/0\s+items\s+found/i.test(text)) return 0;
  return null;
}

async function searchCustomers(page: Page, term: string) {
  const box = searchBox(page);
  await box.click();
  await box.fill('');
  await box.fill(term);
  await box.press('Enter');
  await page.waitForTimeout(4_500);
}

async function clearSearch(page: Page) {
  const box = searchBox(page);
  await box.click();
  await box.fill('');
  await box.press('Enter');
  await page.waitForTimeout(4_500);
}

const rowFor = (page: Page, name: string) =>
  page.locator(ROW).filter({ hasText: name }).first();

/** Open a customer's details panel via the row magnifying glass (there is no eye icon). */
async function openDetails(page: Page, name: string) {
  await searchCustomers(page, name);
  const row = rowFor(page, name);
  await expect(row, `customer "${name}" should be present in the list`).toBeVisible({ timeout: 20_000 });
  await row.locator('.anticon-search').first().click();
  await page.waitForURL(/customer-details-v1/, { timeout: 45_000 });
  await page.waitForLoadState('networkidle').catch(() => {});
  await page.waitForTimeout(4_000);
}

async function openTab(page: Page, label: string) {
  const tab = page.locator('.ant-tabs-tab').filter({ hasText: label }).first();
  await expect(tab, `the "${label}" tab should be displayed`).toBeVisible({ timeout: 30_000 });
  await tab.click();
  await page.waitForTimeout(4_500);
}

async function activePanelText(page: Page): Promise<string> {
  return page.evaluate(() => {
    const p = document.querySelector('.ant-tabs-tabpane-active');
    return p ? (p as HTMLElement).innerText.replace(/\s+/g, ' ').trim() : '';
  });
}

/**
 * Resolve a text input by its CURRENT VALUE.
 *
 * customer-details-v1 has no label↔input association whatsoever (deviation 2), so this is the only
 * stable way to address a field — and finding the value at all is exactly what ADO #113352 step 4
 * asks us to prove ("the form is displayed with the existing information populated").
 */
async function inputIndexByValue(page: Page, value: string): Promise<number> {
  return page.evaluate((v) => {
    const inputs = [...document.querySelectorAll('input.ant-input')] as HTMLInputElement[];
    return inputs.findIndex((i) => (i.value || '').trim() === v);
  }, value);
}

const antInput = (page: Page, idx: number) => page.locator('input.ant-input').nth(idx);

/** The confirm dialog the delete icon raises. Scoped so `no`/`yes` can be matched exactly. */
function confirmDialog(page: Page): Locator {
  return page.locator('.ant-modal-content:visible, .ant-popover-inner:visible').last();
}

/**
 * 🛡️ The guard that keeps this suite off real customer records. Every mutating case calls it
 * BEFORE acting. A target must be a QAAuto* customer and must not be the read-only anchor.
 */
function assertSafeTarget(name: string, purpose: string) {
  expect(name, `${purpose}: refusing to touch a customer that is not ${QA_PREFIX}*`)
    .toContain(QA_PREFIX);
  expect(name, `${purpose}: the anchor customer is read-only and must never be mutated`)
    .not.toContain(ANCHOR);
}

/** First-name tokens of the QAAuto customers currently listed, anchor excluded. */
async function qaCustomerNames(page: Page): Promise<string[]> {
  await searchCustomers(page, QA_PREFIX);
  const rows = await dataRows(page);
  return rows
    .map((r) => (r.match(/QAAuto\d+/) || [])[0])
    .filter((n): n is string => !!n && n !== ANCHOR);
}

test.describe('Customers (ADO suite 113324)', () => {
  test('TC-01 (#113348): Verify Customers Are Displayed in the Customers List', async ({ page }) => {
    test.setTimeout(150_000);
    await login(page);

    // STEP 2: NAVIGATE to the Customers side menu — ASSERT (BLOCKING) the list is displayed
    await gotoCustomers(page);
    const rows = await dataRows(page);
    expect(rows.length, 'the Customers list should display at least one customer').toBeGreaterThan(0);

    // ASSERT the prescribed columns are present
    const header = (await page.locator(ROW).first().innerText()).replace(/\s+/g, ' ').trim();
    console.log(`columns: ${header}`);
    for (const col of ['First Name', 'Last Name', 'Mobile Number', 'Email Address']) {
      expect(header, `the list should have a "${col}" column`).toContain(col);
    }

    // STEP 3-4: LOCATE a customer and CLICK its magnifying glass — ASSERT the details panel opens
    await openDetails(page, ANCHOR);
    expect(page.url(), 'the details panel should open on customer-details-v1').toContain('customer-details-v1');

    // STEP 5: REVIEW the customer information displayed in the panel
    const body = (await page.locator('body').innerText()).replace(/\s+/g, ' ').trim();
    expect(body, "the panel should display the customer's name").toContain(ANCHOR);
    expect(body, "the panel should display the customer's phone number").toContain(KNOWN_PHONE);
    expect(body, "the panel should display the customer's email address").toContain(KNOWN_EMAIL);

    // STEP 6-7: SELECT the Logged Cases and Interactions tabs — ASSERT (BLOCKING) both are displayed
    await expect(page.locator('.ant-tabs-tab').filter({ hasText: 'Logged Cases' }).first(),
      'a Logged Cases tab should be displayed').toBeVisible({ timeout: 30_000 });
    await expect(page.locator('.ant-tabs-tab').filter({ hasText: 'Interactions' }).first(),
      'an Interactions tab should be displayed').toBeVisible({ timeout: 30_000 });
    await openTab(page, 'Logged Cases');
    await openTab(page, 'Interactions');
  });

  test('TC-02 (#113349): Verify Customer Logged Cases Are Displayed', async ({ page }) => {
    test.setTimeout(150_000);
    await login(page);
    await gotoCustomers(page);

    // STEP 3-4: LOCATE the customer with logged cases and CLICK the View icon
    await openDetails(page, ANCHOR);

    // STEP 5: SCROLL down and CLICK the Logged Cases tab
    await openTab(page, 'Logged Cases');
    const panel = await activePanelText(page);
    console.log(`Logged Cases panel: ${panel.slice(0, 300)}`);

    // ASSERT (BLOCKING) at least one case is displayed for this customer
    const refs = panel.match(/REF\d+\/\d{2}\/\d{2}\/\d{4}/g) || [];
    expect(refs.length, `the anchor customer ${ANCHOR} should have at least one logged case`)
      .toBeGreaterThan(0);
    console.log(`case reference(s): ${refs.join(', ')}`);

    // STEP 6: REVIEW the cases — ASSERT (BLOCKING) a case STATUS is displayed against each
    expect(panel, 'the relevant case information should include the case status')
      .toMatch(/\b(NEW|OPEN|ASSIGNED|IN PROGRESS|CLOSED|CANCELLED|RESOLVED|MERGED)\b/i);

    // ASSERT the case names the customer it was logged from
    expect(panel, 'the logged case should name the customer it came from').toContain(ANCHOR);
  });

  test('TC-03 (#113350): Verify Customer Case Can Be Accessed from Logged Cases', async ({ page }) => {
    test.setTimeout(180_000);
    await login(page);
    await gotoCustomers(page);
    await openDetails(page, ANCHOR);

    // STEP 5: SELECT the Logged Cases tab
    await openTab(page, 'Logged Cases');
    const panel = await activePanelText(page);
    const ref = (panel.match(/REF\d+\/\d{2}\/\d{2}\/\d{4}/) || [])[0];
    expect(ref, 'a case reference should be available to open').toBeTruthy();
    console.log(`opening case: ${ref}`);

    const detailsUrl = page.url();

    // Evidence for BUG-502: the datalist's "Open" toolbar button exists in the form configuration
    // but its form-item is hidden, so the card has no working affordance. Captured before and after
    // the click so the report shows the click changed nothing.
    const openState = () => page.evaluate(() =>
      [...document.querySelectorAll('button')]
        .filter((b) => /^open$/i.test((b.innerText || '').trim()))
        .map((b) => {
          const fi = b.closest('.ant-form-item');
          return {
            visible: !!(b.offsetParent || b.getClientRects().length),
            formItemHidden: fi ? fi.classList.contains('ant-form-item-hidden') : null,
          };
        }));
    console.log(`"Open" button before click: ${JSON.stringify(await openState())}`);

    // STEP 6: SELECT a case from the Logged Cases list
    await page.locator('.sha-datalist-component').locator(`text=${ref}`).first()
      .click({ force: true, timeout: 15_000 }).catch((e) => console.log(`card click: ${e.message}`));
    await page.waitForTimeout(8_000);
    await page.waitForLoadState('networkidle').catch(() => {});

    const landedUrl = page.url();
    const navigated = landedUrl !== detailsUrl;
    console.log(`landed on: ${landedUrl}`);
    console.log(`"Open" button after click:  ${JSON.stringify(await openState())}`);

    // ASSERT selecting the case opens it — SOFT, because the app provides no working affordance
    // (BUG-502). Soft keeps the remaining evidence in the report instead of aborting here.
    expect.soft(navigated,
      `ADO #113350 step 6 expects the selected case to open the All Service Request landing page. `
      + `The card is inert — no anchor, no click handler, and the datalist's "Open" button is hidden. `
      + `See BUG-502`).toBe(true);

    // STEP 7: VERIFY the selected case on the landing page — only reachable if the app navigated.
    if (navigated) {
      const landedBody = (await page.locator('body').innerText()).replace(/\s+/g, ' ').trim();
      expect(landedBody, `the opened page should display the selected case ${ref}`).toContain(ref!);
      expect.soft(landedUrl,
        `ADO #113350 expects the All Service Request landing page — actually landed on ${landedUrl}`)
        .toMatch(/service-request|cases-table/i);
    } else {
      console.log('#113350 step 7 not reachable — the case never opened (BUG-502)');
    }
  });

  test('TC-04 (#113351): Verify Customer Interactions Are Displayed', async ({ page }) => {
    test.setTimeout(150_000);
    await login(page);
    await gotoCustomers(page);
    await openDetails(page, ANCHOR);

    // Collect the case references first — "the interactions correspond to the cases" is asserted,
    // not assumed.
    await openTab(page, 'Logged Cases');
    const casePanel = await activePanelText(page);
    const caseRefs = casePanel.match(/REF\d+\/\d{2}\/\d{2}\/\d{4}/g) || [];

    // STEP 5: SELECT the Interactions tab
    await openTab(page, 'Interactions');
    const panel = await activePanelText(page);
    console.log(`Interactions panel: ${panel.slice(0, 400)}`);

    // ASSERT (BLOCKING) at least one interaction is displayed
    const interactionRefs = panel.match(/REF\d+\/\d{2}\/\d{2}\/\d{4}/g) || [];
    expect(interactionRefs.length, `${ANCHOR} should have at least one interaction`).toBeGreaterThan(0);

    // ASSERT the prescribed columns are present
    for (const col of ['Reference No', 'From Person', 'To Person']) {
      expect(panel, `the Interactions tab should have a "${col}" column`).toContain(col);
    }

    // STEP 7: ASSERT (BLOCKING) the interactions correspond to the customer's cases
    const matched = interactionRefs.filter((r) => caseRefs.includes(r));
    expect(matched.length,
      `the interaction reference(s) ${interactionRefs.join(', ')} should correspond to the customer's `
      + `case(s) ${caseRefs.join(', ')}`).toBeGreaterThan(0);

    // ASSERT the interaction names the customer
    expect(panel, 'the interaction should name the customer').toContain(ANCHOR);
  });

  test('TC-05 (#113352): Verify Customer Details Can Be Edited', async ({ page }) => {
    test.setTimeout(180_000);
    await login(page);
    await gotoCustomers(page);

    // STEP 3: LOCATE an existing customer — the FIRST non-anchor QAAuto customer.
    const names = await qaCustomerNames(page);
    expect(names.length, 'a QAAuto customer should be available to edit').toBeGreaterThan(0);
    const target = names[0];
    assertSafeTarget(target, 'TC-05 edit target');

    // Read this customer's CURRENT phone and email from the row rather than assuming the seeded
    // values — a previous run of this very case may already have changed them. (It had: the first
    // run left QAAuto515671 on 0829945418, and hardcoding 0821234567 then failed the lookup.)
    const rowBefore = (await rowFor(page, target).innerText()).replace(/\s+/g, ' ').trim();
    const currentPhone = (rowBefore.match(/\b\d{10}\b/) || [])[0];
    const currentEmail = (rowBefore.match(/\S+@\S+/) || [])[0];
    console.log(`edit target: ${target} — current phone ${currentPhone}, email ${currentEmail}`);
    expect(currentPhone, 'the target row should show a phone number to edit').toBeTruthy();

    // STEP 4: CLICK the Edit icon for the customer
    await rowFor(page, target).locator('.anticon-edit').first().click();
    await page.waitForURL(/customer-details-v1.*mode=edit/, { timeout: 45_000 });
    await page.waitForLoadState('networkidle').catch(() => {});
    await page.waitForTimeout(5_000);

    // ASSERT (BLOCKING) the form opened with the EXISTING INFORMATION POPULATED.
    // With no label↔input association, locating each field BY ITS VALUE is the proof.
    const nameIdx = await inputIndexByValue(page, target);
    const phoneIdx = await inputIndexByValue(page, currentPhone!);
    const emailIdx = await inputIndexByValue(page, currentEmail ?? KNOWN_EMAIL);
    console.log(`populated field indexes — name:${nameIdx} phone:${phoneIdx} email:${emailIdx}`);
    expect(nameIdx, 'the edit form should be populated with the existing customer name').toBeGreaterThan(-1);
    expect(phoneIdx, 'the edit form should be populated with the existing phone number').toBeGreaterThan(-1);
    expect(emailIdx, 'the edit form should be populated with the existing email address').toBeGreaterThan(-1);

    // STEP 5: UPDATE the required customer information (Phone Number)
    const newPhone = `08299${stamp().slice(0, 5)}`;
    const phoneField = antInput(page, phoneIdx);
    await phoneField.fill('');
    await phoneField.fill(newPhone);
    await expect(phoneField, 'the updated information should be accepted').toHaveValue(newPhone);
    console.log(`phone ${currentPhone} -> ${newPhone}`);

    // STEP 6: SAVE the changes — ASSERT (BLOCKING) the form leaves edit mode
    await page.locator('button:has-text("Save")').first().click();
    await page.waitForTimeout(8_000);
    await page.waitForLoadState('networkidle').catch(() => {});
    await expect(page.locator('button:has-text("Cancel Form Edit")'),
      'the form should leave edit mode once the customer is saved').toHaveCount(0, { timeout: 30_000 });

    // STEP 7-8: CLICK the View icon for the updated customer and VERIFY the updated information
    await gotoCustomers(page);
    await openDetails(page, target);
    const body = (await page.locator('body').innerText()).replace(/\s+/g, ' ').trim();
    expect(body, `the updated phone number ${newPhone} should be displayed on the details panel`)
      .toContain(newPhone);

    // ASSERT the updated value is displayed in the list row too
    await gotoCustomers(page);
    await searchCustomers(page, target);
    const row = (await rowFor(page, target).innerText()).replace(/\s+/g, ' ').trim();
    console.log(`row after edit: ${row}`);
    expect(row, `the Customers list row should show the updated phone number ${newPhone}`)
      .toContain(newPhone);
  });

  test('TC-06 (#113353): Verify Customer Can Be Deleted', async ({ page }) => {
    test.setTimeout(180_000);
    await login(page);
    await gotoCustomers(page);

    // STEP 3: LOCATE the customer to be deleted — the LAST listed QAAuto customer, so it can never
    // collide with TC-05's target (the first).
    const names = await qaCustomerNames(page);
    expect(names.length, 'a QAAuto customer should be available to delete').toBeGreaterThan(1);
    const target = names[names.length - 1];

    // 🛡️ ASSERT (BLOCKING) the target is safe BEFORE anything destructive happens.
    assertSafeTarget(target, 'TC-06 delete target');
    console.log(`delete target: ${target}`);

    // STEP 4: CLICK the Delete icon for the customer
    await rowFor(page, target).locator('.anticon-delete').first().click();
    await page.waitForTimeout(3_000);

    // ASSERT a confirmation dialog is displayed
    const dialog = confirmDialog(page);
    await expect(dialog, 'a delete confirmation dialog should be displayed').toBeVisible({ timeout: 20_000 });
    const dialogText = (await dialog.innerText()).replace(/\s+/g, ' ').trim();
    console.log(`delete dialog: "${dialogText}"`);

    // ASSERT the ADO wording — SOFT, see BUG-501. The app says "Delete User / are you sure you want
    // to delete this user?" with no/yes, not "…this item?" with Cancel/OK.
    expect.soft(dialogText,
      'ADO #113353 quotes the dialog as "Are you sure you want to delete this item?" — see BUG-501')
      .toContain('Are you sure you want to delete this item?');

    // STEP 5: CLICK the affirmative control (the app labels it `yes`, not `OK` — BUG-501)
    const affirm = dialog.getByRole('button', { name: /^(yes|ok)$/i }).first();
    await expect(affirm, 'the dialog should offer an affirmative control').toBeVisible({ timeout: 10_000 });
    await affirm.click();
    await page.waitForTimeout(8_000);
    await page.waitForLoadState('networkidle').catch(() => {});

    // STEP 6: SEARCH for the deleted customer — ASSERT (BLOCKING) it is gone
    await gotoCustomers(page);
    await searchCustomers(page, target);
    const rows = await dataRows(page);
    console.log(`rows matching "${target}" after delete: ${rows.length}`);
    expect(rows.join(' | '), `the deleted customer ${target} should no longer be displayed`)
      .not.toContain(target);
  });

  test('TC-07 (#113354): Verify Customer Deletion Can Be Cancelled', async ({ page }) => {
    test.setTimeout(150_000);
    await login(page);
    await gotoCustomers(page);

    // STEP 3: LOCATE the customer to be deleted
    const names = await qaCustomerNames(page);
    expect(names.length, 'a QAAuto customer should be available').toBeGreaterThan(0);
    const target = names[0];
    assertSafeTarget(target, 'TC-07 cancel target');
    console.log(`cancel target: ${target}`);

    // STEP 4: CLICK the Delete icon
    await rowFor(page, target).locator('.anticon-delete').first().click();
    await page.waitForTimeout(3_000);

    const dialog = confirmDialog(page);
    await expect(dialog, 'a delete confirmation dialog should be displayed').toBeVisible({ timeout: 20_000 });
    const dialogText = (await dialog.innerText()).replace(/\s+/g, ' ').trim();
    console.log(`delete dialog: "${dialogText}"`);

    // ASSERT the ADO wording — SOFT, see BUG-501
    expect.soft(dialogText,
      'ADO #113354 quotes the dialog as "Are you sure you want to delete this item?" — see BUG-501')
      .toContain('Are you sure you want to delete this item?');

    // STEP 5: CLICK the dismiss control (the app labels it `no`, not `Cancel` — BUG-501)
    const dismiss = dialog.getByRole('button', { name: /^(no|cancel)$/i }).first();
    await expect(dismiss, 'the dialog should offer a dismiss control').toBeVisible({ timeout: 10_000 });
    await dismiss.click();
    await page.waitForTimeout(4_000);

    // ASSERT (BLOCKING) the dialog closed and the customer was NOT deleted
    await expect(dialog, 'the confirmation dialog should close on cancel').toBeHidden({ timeout: 20_000 });
    await gotoCustomers(page);
    await searchCustomers(page, target);
    const rows = await dataRows(page);
    expect(rows.join(' | '), `${target} should still be present after cancelling the delete`)
      .toContain(target);
  });

  test('TC-08 (#113355): Verify Customers Can Be Searched', async ({ page }) => {
    test.setTimeout(150_000);
    await login(page);
    await gotoCustomers(page);

    const baseline = totalFromPager(await pagerText(page));
    console.log(`unfiltered total: ${baseline}`);

    // STEP 3-4: TYPE a known customer name and EXECUTE the search
    await searchCustomers(page, ANCHOR);
    await expect(searchBox(page), 'the search criteria should be accepted').toHaveValue(ANCHOR);

    // STEP 5: REVIEW the search results
    const filtered = totalFromPager(await pagerText(page));
    const rows = await dataRows(page);
    console.log(`filtered total: ${filtered}; rows: ${rows.length}`);
    expect(rows.length, 'the search should return at least one match').toBeGreaterThan(0);
    if (baseline !== null && filtered !== null) {
      expect(filtered, 'the list should be filtered by the search criteria').toBeLessThan(baseline);
    }

    // ASSERT EVERY returned row matches — not merely the first
    for (const r of rows) {
      expect(r, `every returned row should match "${ANCHOR}" — got "${r}"`).toContain(ANCHOR);
    }

    // STEP 6: CLEAR the search criteria
    await clearSearch(page);
    await expect(searchBox(page), 'the search field should be cleared').toHaveValue('');
    const restored = totalFromPager(await pagerText(page));
    console.log(`restored total: ${restored}`);
    if (baseline !== null && restored !== null) {
      expect(restored, 'clearing the search should restore the unfiltered list').toBe(baseline);
    }
  });

  test('TC-09 (#113356): Verify Customers Can Be Filtered', async ({ page }) => {
    test.setTimeout(150_000);
    await login(page);
    await gotoCustomers(page);

    const baseline = totalFromPager(await pagerText(page));
    console.log(`unfiltered total: ${baseline}`);

    // STEP 3: CLICK the Filter icon — ASSERT (BLOCKING) filter options are displayed.
    // The control opens a "Table Columns" SIDEBAR (not a dropdown or a modal): a `Filter by`
    // multiselect picks the column, an operator and a value box then appear, and Clear/Apply commit.
    await page.locator('.anticon-filter').first().click();
    await page.waitForTimeout(3_500);

    const apply = page.locator('button:has-text("Apply")').first();
    const clear = page.locator('button:has-text("Clear")').first();
    const filterBy = page.locator('.columns-filter-selector').first();
    await expect(filterBy, 'the Filter icon should reveal the "Filter by" column selector')
      .toBeVisible({ timeout: 20_000 });
    await expect(apply, 'the filter panel should offer an Apply control').toBeVisible({ timeout: 20_000 });
    await expect(clear, 'the filter panel should offer a Clear control').toBeVisible({ timeout: 20_000 });

    // ASSERT the criteria offered are enumerated and logged
    await filterBy.click();
    await page.waitForTimeout(2_500);
    const columns = await page.evaluate(() =>
      [...document.querySelectorAll('.ant-select-dropdown:not(.ant-select-dropdown-hidden) .ant-select-item-option')]
        .map((o) => ((o as HTMLElement).innerText || '').trim()).filter(Boolean));
    console.log(`Filter by columns: ${JSON.stringify(columns)}`);
    expect(columns.length, 'the filter should offer at least one column to filter by').toBeGreaterThan(0);
    expect(columns, 'the filter should offer the First Name column').toContain('First Name');

    // STEP 4: SELECT the required filter criteria — First Name contains `QAAuto`
    await page.locator('.ant-select-dropdown:not(.ant-select-dropdown-hidden) .ant-select-item-option')
      .filter({ hasText: 'First Name' }).first().click({ timeout: 10_000 });
    await page.waitForTimeout(2_000);
    await page.keyboard.press('Escape');
    await page.waitForTimeout(1_500);

    const valueBox = page.locator('input[placeholder="Filter First Name"]').first();
    await expect(valueBox, 'selecting a column should reveal its value control')
      .toBeVisible({ timeout: 20_000 });
    await valueBox.fill(QA_PREFIX);
    await expect(valueBox, 'the selected filter criteria should be accepted').toHaveValue(QA_PREFIX);

    // STEP 5: APPLY the filter
    await apply.click();
    await page.waitForTimeout(7_000);

    // STEP 6: REVIEW the filtered results — ASSERT (BLOCKING) the list narrowed to the criterion
    const after = totalFromPager(await pagerText(page));
    const rows = await dataRows(page);
    console.log(`filtered total: ${after}; rows: ${rows.length}`);
    expect(rows.length, 'the filtered list should return matches').toBeGreaterThan(0);
    if (baseline !== null && after !== null) {
      expect(after, 'applying the filter should narrow the Customers list').toBeLessThan(baseline);
    }
    for (const r of rows) {
      expect(r, `every filtered row should match First Name contains "${QA_PREFIX}" — got "${r}"`)
        .toContain(QA_PREFIX);
    }
  });

  test('TC-10 (#113357): Verify Customers Can Be Exported', async ({ page }) => {
    test.setTimeout(150_000);
    await login(page);
    await gotoCustomers(page);

    // STEP 3: CLICK the Export option — ASSERT (BLOCKING) a download is initiated
    const exportBtn = page.locator('button:has-text("Export")').first();
    await expect(exportBtn, 'the Customers screen should offer an Export control').toBeVisible({ timeout: 20_000 });

    const [download] = await Promise.all([
      page.waitForEvent('download', { timeout: 90_000 }),
      exportBtn.click(),
    ]);

    // STEP 4: OPEN the exported file — ASSERT it has a name and a non-zero size
    const filename = download.suggestedFilename();
    const filePath = await download.path();
    const size = filePath ? fs.statSync(filePath).size : 0;
    console.log(`export: ${filename} — ${size} bytes at ${filePath}`);
    expect(filename, 'the export should produce a named file').toBeTruthy();
    expect(size, 'the exported file should not be empty').toBeGreaterThan(0);

    // STEP 5: REVIEW the exported customer records.
    // NOT VERIFIED — reading the workbook's rows needs a spreadsheet reader. Reported honestly in
    // the run report rather than claimed as covered (plan deviation 4).
    console.log('#113357 step 5 (record-by-record contents) is NOT VERIFIED — needs a spreadsheet reader');
  });

  test('TC-11 (#113358): Verify Customer Search Returns No Results for Invalid Criteria', async ({ page }) => {
    test.setTimeout(150_000);
    await login(page);
    await gotoCustomers(page);

    // STEP 3-4: TYPE an unmatched value and EXECUTE the search
    await searchCustomers(page, NO_MATCH_TERM);
    await expect(searchBox(page), 'the search criteria should be accepted').toHaveValue(NO_MATCH_TERM);

    // STEP 5: REVIEW the search results — ASSERT (BLOCKING) nothing is returned
    const rows = await dataRows(page);
    const pagerNow = await pagerText(page);
    console.log(`rows: ${rows.length}; pager: "${pagerNow}"`);
    expect(rows.length, `no customer should match "${NO_MATCH_TERM}"`).toBe(0);

    // ASSERT the system indicates that no results were found
    const total = totalFromPager(pagerNow);
    expect(total, 'the list should report zero results for unmatched criteria').toBe(0);
  });
});
