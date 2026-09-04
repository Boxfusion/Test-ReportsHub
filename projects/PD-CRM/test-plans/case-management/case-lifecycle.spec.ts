// AUTO-SCAFFOLDED from test-plans/case-management/case-lifecycle.md
// The .md plan is canonical. AI-repair will patch failing lines in this file.
// Do not hand-edit unless you are also updating the .md plan.
//
// Mirrors Azure DevOps suite 112755 (Plan 112718 › PD-CRM › Case Management › Case Lifecycle):
// 27 cases, #112773–#112799, in ADO order. Expected results are quoted from the ADO steps.
//
// ⚠️ This suite MUTATES DATA. It changes status, assignment and field values, and merges cases —
// a Single-Case merge permanently CLOSES the child. It does NOT create cases: QA already holds
// ~1,600, including the `QA-AUTO` records this project created, so subjects are CLAIMED from that
// existing pool. Confining every mutation to `QA-AUTO` records keeps pre-existing cases untouched.
//
// Selectors captured live on 2026-09-02.

import { test, expect, Page, Locator } from '@playwright/test';
import { switchToLatest } from '../_helpers';

const BASE = 'https://pd-dep-adminportal-qa.shesha.app';
const CASES_URL = `${BASE}/dynamic/Boxfusion.ServiceManagement/service-requests`;
const ADMIN = { user: 'Admin', password: 'P@ssword1' };

// Recipients a human can actually check. Read from the environment so no personal contact detail is
// ever committed here. Unset => the send is still asserted but receipt is reported NOT VERIFIED.
const EMAIL_RECIPIENT = process.env.QA_EMAIL_RECIPIENT || '';
const SMS_MOBILE = process.env.QA_SMS_MOBILE || '';
const AGENT_B = { user: process.env.AGENT_B_USER || '', password: process.env.AGENT_B_PASSWORD || '' };

// The pool of existing cases this suite draws subjects from.
const POOL_SEARCH = process.env.QA_POOL_SEARCH || 'QAAuto';

const ELECTRICAL_TYPES = ['Area Power Failure', 'Street Light Not Working'];
const WATER_TYPES = ['Burst Pipe', 'Complete Water Outage', 'Low Water Pressure'];

const stamp = () => `${Date.now()}`.slice(-6);

// ── locators ────────────────────────────────────────────────────────────────
// A case row IS the ant checkbox label. 10 per page. A SECOND click deselects it.
const ROW = 'label.sha-datalist-component-item-checkbox';
const row = (page: Page) => page.locator(ROW);
const modalOf = (page: Page) => page.locator('.ant-modal-content:visible').last();
const okButton = (modal: Locator) => modal.locator('button:has-text("OK")').first();

/** An action button anywhere on the page (list toolbar or Case Details header). */
const action = (page: Page, name: string) => page.locator(`button:visible:has-text("${name}")`).first();

// ── actions ─────────────────────────────────────────────────────────────────
async function login(page: Page, who = ADMIN) {
  await page.goto(`${BASE}/login`, { waitUntil: 'domcontentloaded' });
  await page.getByPlaceholder('Username').fill(who.user);
  await page.locator('input[type="password"]').first().fill(who.password);
  await page.locator('button:has-text("Sign In")').first().click();
  // Admin lands on /dynamic/…, but an agent's homeUrl need not: verified 2026-09-03 that
  // `MoshadiM` has homeUrl='/' and lands there, so waiting for /dynamic/ times out for her even
  // though authentication succeeded. Wait for the login page to be LEFT, then drive to Cases.
  if (who === ADMIN) {
    await page.waitForURL(/\/dynamic\//, { timeout: 60_000 });
  } else {
    await page.waitForURL((u) => !/\/login/.test(u.pathname), { timeout: 60_000 });
    await page.goto(CASES_URL, { waitUntil: 'domcontentloaded' });
  }
  // 🔑 PROJECT RULE: switch Live → Latest on every run. The header defaults to Live, which serves
  // only PUBLISHED form versions; Latest serves what we are actually testing. It resets on every
  // login, so it must be re-applied per test. Throws rather than silently staying on Live.
  //
  // ⚠️ ADMIN ONLY. The view-mode control is permission-gated: verified 2026-09-03 that `Admin` has
  // the Live|Ready|Latest `.ant-dropdown-trigger` (and the designer switch) while the agent
  // `ThabithaM` has NEITHER — 0 of each. Calling switchToLatest() on a non-admin login therefore
  // always throws after 45s waiting for a control that cannot exist, which is what blocked TC-06.
  // A regular agent only ever sees Live, so skipping the switch matches real agent behaviour.
  // The throw is deliberately left in place for the ADMIN path, where the guardrail matters.
  if (who === ADMIN) await switchToLatest(page);
}

async function gotoCases(page: Page) {
  await page.goto(CASES_URL, { waitUntil: 'domcontentloaded' });
  await expect(row(page).first()).toBeVisible({ timeout: 45_000 });
  await page.waitForTimeout(2_500);
}

async function chooseOption(page: Page, select: Locator, label: string) {
  await select.click();
  await page.waitForTimeout(900);
  await page.locator('.ant-select-dropdown:not(.ant-select-dropdown-hidden) .ant-select-item-option')
    .filter({ hasText: label }).first().click();
  await page.waitForTimeout(900);
}

async function optionsOf(page: Page, select: Locator): Promise<string[]> {
  await select.click();
  await page.waitForTimeout(1_200);
  return page.evaluate(() => [...new Set(
    [...document.querySelectorAll('.ant-select-dropdown:not(.ant-select-dropdown-hidden) .ant-select-item-option')]
      .map(o => (o as HTMLElement).innerText.trim()).filter(Boolean))]);
}

/**
 * Filter the Cases list. The input MUST be focused before fill() — typing into it unfocused does
 * not register and the list silently stays unfiltered (this cost a false "search is broken" call).
 */
async function searchCases(page: Page, term: string) {
  const box = page.locator('.sha-global-table-filter input.ant-input').first();
  await box.click();
  await box.fill(term);
  await expect(box).toHaveValue(term);
  const totalBefore = await pagerTotal(page);
  await page.locator('.sha-global-table-filter button').first().click();
  // The list applies the filter asynchronously and briefly keeps serving the previous, UNFILTERED
  // page, so a fixed sleep intermittently reads the stale list. Waiting on the pager *text* is no
  // good either (`1-10 of 1609 items` matches the unfiltered state too), and requiring every row to
  // contain the term is wrong because a row can match on a field the row does not display. Poll on
  // the pager's TOTAL changing instead — precise, and independent of what a row renders.
  await expect
    .poll(() => pagerTotal(page), {
      timeout: 45_000,
      message: `the list should filter down to "${term}" (was ${totalBefore} items)`,
    })
    .not.toBe(totalBefore);
  await page.waitForTimeout(1_500);
}

/** The `1-N of TOTAL items` figure from the list pager, or -1 when absent. */
const pagerTotal = (page: Page) => page.evaluate(() => {
  const m = document.body.innerText.replace(/\s+/g, ' ').match(/1-\d+ of (\d+) items/);
  return m ? Number(m[1]) : -1;
});

type CaseRow = { ref: string; status: string; text: string };

/** Every case row currently listed, with its reference number and status. */
async function listedRows(page: Page): Promise<CaseRow[]> {
  return page.evaluate((sel) => [...document.querySelectorAll(sel)].map((r) => {
    const t = (r as HTMLElement).innerText.replace(/\s+/g, ' ').trim();
    return {
      ref: (t.match(/REF\d+\/[\d/]+/) || [''])[0],
      status: ((t.match(/\b(NEW|OPEN|IN PROGRESS|INPROGRESS|CLOSED|MERGED|CANCELLED)\b/i) || [''])[0] || '').toUpperCase(),
      text: t,
    };
  }).filter(r => r.ref), ROW);
}

/**
 * Widen the list page size. The list defaults to 10 rows, so the pool would otherwise be capped at
 * 10 candidates — and the merge cases alone consume two apiece and leave them in terminal states.
 */
async function setPageSize(page: Page, size = 50) {
  const sel = page.locator('.ant-pagination-options .ant-select').first();
  if (!(await sel.count())) return;
  if ((await sel.innerText()).trim().startsWith(String(size))) return;
  await sel.click();
  await page.waitForTimeout(900);
  const opt = page.locator('.ant-select-dropdown:not(.ant-select-dropdown-hidden) .ant-select-item-option')
    .filter({ hasText: `${size} / page` }).first();
  if (await opt.count()) {
    await opt.click();
    await page.waitForTimeout(4_000);
  } else {
    await page.keyboard.press('Escape');
  }
}

async function pool(page: Page): Promise<CaseRow[]> {
  await gotoCases(page);
  // Page size before the filter — changing it re-queries and would drop the search term.
  await setPageSize(page, 50);
  await searchCases(page, POOL_SEARCH);
  const rows = await listedRows(page);
  expect(rows.length, `the "${POOL_SEARCH}" case pool should not be empty`).toBeGreaterThan(0);
  return rows;
}

const isStatus = (actual: string, target: string) =>
  target === 'IN PROGRESS' ? /IN ?PROGRESS/.test(actual) : actual === target;

/**
 * Claim an existing case that is ALREADY in the status this test needs; if none is, take a fresh
 * `NEW` one and drive it there. Selecting by current status means tests reuse the pool freely
 * without a reservation ledger — the precondition is re-checked from live data every time.
 * `exclude` keeps the two subjects of a merge distinct.
 */
async function caseWithStatus(
  page: Page,
  target: 'NEW' | 'IN PROGRESS' | 'CLOSED',
  exclude: string[] = [],
  /**
   * The action this test must be able to perform on the subject. Checked on the details screen
   * before the case is accepted: status strings have proven ambiguous, whereas "does the button
   * this test needs actually exist" is exactly the precondition that matters.
   */
  requireAction?: string,
) {
  const canAct = async () => {
    if (!requireAction) return true;
    return action(page, requireAction).isVisible({ timeout: 8_000 }).catch(() => false);
  };
  const rows = (await pool(page)).filter(r => !exclude.includes(r.ref));
  expect(rows.length, `the "${POOL_SEARCH}" pool should offer a candidate`).toBeGreaterThan(0);

  // A row's status is only a HINT: the list lags a transition, so it can advertise NEW for a case
  // that is already In Progress. Try the likeliest candidates first, but CONFIRM each one on its
  // Case Details screen — the authoritative source — before committing to it.
  // Skip rows whose current status could NEVER reach the target — each candidate costs a details
  // page load, and the list is newest-first, so the merge cases (which run earlier and leave their
  // children Merged/Cancelled) otherwise fill the whole candidate window and starve later tests of
  // the perfectly good NEW cases sitting further down the list. Reachability by target:
  //   NEW          <- only a case already NEW/Open; nothing can be driven backwards to NEW
  //   IN PROGRESS  <- NEW/Open, or already In Progress
  //   CLOSED       <- NEW/Open, In Progress, or already Closed
  const reachable = (s: string) => {
    const fresh = /^(NEW|OPEN)$/.test(s);
    const inProg = /IN ?PROGRESS/.test(s);
    if (target === 'NEW') return fresh;
    if (target === 'IN PROGRESS') return fresh || inProg;
    return fresh || inProg || s === 'CLOSED';
  };
  const viable = rows.filter(r => reachable(r.status));
  expect(viable.length,
    `no "${POOL_SEARCH}" case can reach ${target}. Listed statuses: ` +
    `${rows.map(r => `${r.ref}=${r.status}`).join(', ')}. Merges and closures leave cases in ` +
    `terminal states — top up the pool.`).toBeGreaterThan(0);

  const likely = viable.filter(r => isStatus(r.status, target));
  const rest = viable.filter(r => !isStatus(r.status, target));
  const tried: string[] = [];

  for (const cand of [...likely, ...rest].slice(0, 12)) {
    await openDetails(page, cand.ref);
    const actual = (await detailsStatus(page)) || '';
    const ok = await canAct();
    tried.push(`${cand.ref}=${actual || '?'}${requireAction ? `/${requireAction}:${ok ? 'yes' : 'no'}` : ''}`);
    if (isStatus(actual, target) && ok) return cand.ref;

    // Otherwise drive it, when the transition is available from where it actually is.
    if (target === 'IN PROGRESS' && /^(NEW|OPEN)$/.test(actual)) {
      await driveToInProgress(page, cand.ref);
      if (await canAct()) return cand.ref;
      continue;
    }
    if (target === 'CLOSED' && /^(NEW|OPEN)$/.test(actual)) {
      await driveToClosed(page, cand.ref);
      if (await canAct()) return cand.ref;
      continue;
    }
    if (target === 'CLOSED' && /IN ?PROGRESS/.test(actual)) {
      await action(page, 'Close').click();
      await confirm(page, 'Yes');
      await reloadDetails(page);
      if ((await detailsStatus(page)) === 'CLOSED' && await canAct()) return cand.ref;
      continue;
    }
    // A NEW subject cannot be manufactured from a terminal case — move on to the next candidate.
  }
  throw new Error(
    `No "${POOL_SEARCH}" case could be brought to ${target}. Confirmed statuses: ${tried.join(', ')}. ` +
    `Merges and closures leave cases in terminal states, so the pool may need topping up.`);
}

/** Any case from the pool, for the read-only cases that do not care about status. */
async function anyCase(page: Page, exclude: string[] = []) {
  const rows = (await pool(page)).filter(r => !exclude.includes(r.ref));
  expect(rows.length, 'at least one pool case should be available').toBeGreaterThan(0);
  return rows[0];
}

/** Find a case by reference and open its Case Details screen. */
async function openDetails(page: Page, ref: string) {
  await gotoCases(page);
  await searchCases(page, ref);
  const first = row(page).first();
  await expect(first).toBeVisible({ timeout: 30_000 });
  await first.dblclick();
  await expect(page).toHaveURL(/case-request-details/, { timeout: 45_000 });
  await expect(page.locator('body')).toContainText(/Case Details:/, { timeout: 45_000 });
  await page.waitForTimeout(4_000);
}

/** Select a case in the LIST (single click — clicking twice would deselect it). */
async function selectInList(page: Page, ref: string) {
  await gotoCases(page);
  await searchCases(page, ref);
  const first = row(page).first();
  await expect(first).toBeVisible({ timeout: 30_000 });
  await first.click();
  await page.waitForTimeout(2_500);
  return first;
}

/**
 * The authoritative status, read from the Case Details header. NEVER read a status from a list row:
 * the list lags a transition and reports the stale value.
 */
async function detailsStatus(page: Page): Promise<string | null> {
  return page.evaluate(() => {
    const t = document.body.innerText.replace(/\s+/g, ' ');
    const m = t.match(/Case Details:\s*REF\d+\/[\d/]+[^]{0,120}?\s(NEW|OPEN|IN PROGRESS|INPROGRESS|CLOSED|MERGED|CANCELLED)\b/i);
    return m ? m[1].toUpperCase() : null;
  });
}

async function reloadDetails(page: Page) {
  await page.reload({ waitUntil: 'domcontentloaded' });
  await expect(page.locator('body')).toContainText(/Case Details:/, { timeout: 45_000 });
  await page.waitForTimeout(4_000);
}

/** Answer a Yes/No confirmation dialog. Returns the dialog's text for wording assertions. */
async function confirm(page: Page, answer: 'Yes' | 'No') {
  const dlg = modalOf(page);
  await expect(dlg, 'a confirmation dialog should be displayed').toBeVisible({ timeout: 20_000 });
  const text = (await dlg.innerText()).replace(/\s+/g, ' ').trim();
  await expect(dlg.locator('button:has-text("No")')).toBeVisible();
  await expect(dlg.locator('button:has-text("Yes")')).toBeVisible();
  await dlg.locator(`button:has-text("${answer}")`).first().click();
  await page.waitForTimeout(5_000);
  return text;
}

/** Drive a case to IN PROGRESS from its Case Details screen. */
async function driveToInProgress(page: Page, ref: string) {
  await openDetails(page, ref);
  if (/IN ?PROGRESS/.test((await detailsStatus(page)) || '')) return;
  await action(page, 'Mark In Progress').click();
  await confirm(page, 'Yes');
  await reloadDetails(page);
  await expect
    .poll(() => detailsStatus(page), { timeout: 45_000, message: 'case should reach IN PROGRESS' })
    .toMatch(/IN ?PROGRESS/);
}

/** Drive a case to CLOSED from its Case Details screen. */
async function driveToClosed(page: Page, ref: string) {
  await driveToInProgress(page, ref);
  await action(page, 'Close').click();
  await confirm(page, 'Yes');
  await reloadDetails(page);
  await expect
    .poll(() => detailsStatus(page), { timeout: 45_000, message: 'case should reach CLOSED' })
    .toBe('CLOSED');
}

const timelineText = (page: Page) => page.evaluate(() =>
  (document.body.innerText.match(/Timeline[^]*?(?=Uploaded Media)/) || [''])[0]
    .replace(/\s+/g, ' ').trim());

const visibleActions = (page: Page) => page.evaluate(() =>
  [...document.querySelectorAll('button')].filter(b => (b as HTMLElement).offsetParent !== null)
    .map(b => (b as HTMLElement).innerText.replace(/\s+/g, ' ').trim()).filter(Boolean));

/** Read the value shown against a labelled field on the Case Details screen. */
const fieldValue = (page: Page, forId: string) =>
  page.locator(`.ant-form-item:has(label[for="${forId}"]) input`).first();

/**
 * Point an existing case's customer contact at a mailbox/handset a human can actually check, using
 * the app's own edit mode. Needed by the email and SMS cases, which must land somewhere observable.
 */
async function setCustomerContact(page: Page, ref: string, contact: { email?: string; mobile?: string }) {
  await openDetails(page, ref);
  await action(page, 'Edit').click();
  await page.waitForTimeout(4_000);
  if (contact.email) {
    const f = fieldValue(page, 'reportedUser_emailAddress1');
    await f.click();
    await f.fill(contact.email);
  }
  if (contact.mobile) {
    const f = fieldValue(page, 'reportedUser_mobileNumber1');
    await f.click();
    await f.fill(contact.mobile);
    // The leading 0 must survive, or a message would be dispatched to a different number.
    await expect(f, 'the mobile number should keep its leading zero').toHaveValue(contact.mobile);
  }
  await action(page, 'Save').click();
  await page.waitForTimeout(8_000);
  await reloadDetails(page);
}

/**
 * Type into the email composer's body.
 * FRAGILE: it is a rich-text editor with a CHARS/WORDS counter, not a plain textarea — try a
 * contenteditable first and fall back to a textarea.
 */
async function typeEmailBody(page: Page, message: string) {
  const rich = page.locator('[contenteditable="true"]').first();
  if (await rich.count()) {
    await rich.click();
    await rich.fill(message).catch(async () => { await page.keyboard.type(message); });
  } else {
    await page.locator('textarea:visible').first().fill(message);
  }
  await page.waitForTimeout(1_500);
}

/**
 * Open the Merge dialog on `childRef` and merge it into `parentRef`.
 * Returns the Link Type options and merge-type hints the app displayed, for comparison against ADO.
 */
async function mergeInto(page: Page, childRef: string, parentRef: string, mergeType: 'Related Case' | 'Single Case') {
  await selectInList(page, childRef);
  await action(page, 'Merge').click();
  const dlg = modalOf(page);
  await expect(dlg).toBeVisible({ timeout: 30_000 });
  await expect(dlg, 'the dialog should name the case being merged from').toContainText(childRef);

  // Link Type — record the offered options, then choose one.
  const linkType = dlg.locator('.ant-select').first();
  const linkOptions = await optionsOf(page, linkType);
  await page.keyboard.press('Escape');
  await page.waitForTimeout(600);
  await chooseOption(page, linkType, 'Parent Case');

  // Merge Type radio, then read the hint it reveals. Assert it actually took — antd renders the
  // label and the input separately, so a click on the wrapper can miss without any visible sign,
  // and the Merge button then silently refuses because Merge Type is required.
  const radio = dlg.locator('.ant-radio-wrapper').filter({ hasText: mergeType }).first();
  await radio.click();
  await page.waitForTimeout(2_500);
  const radioInput = radio.locator('input[type="radio"]');
  if (!(await radioInput.isChecked().catch(() => false))) {
    await radioInput.check({ force: true }).catch(() => {});
    await page.waitForTimeout(1_500);
  }
  await expect(radioInput, `the "${mergeType}" Merge Type radio must be selected`).toBeChecked();
  const hints: string[] = await dlg.evaluate((el) => {
    const seen = new Set<string>();
    [...el.querySelectorAll('*')].forEach((n) => {
      if (n.children.length) return;
      const t = (n.textContent || '').replace(/\s+/g, ' ').trim();
      if (/will (flag|merge)/i.test(t)) seen.add(t);
    });
    return [...seen];
  });

  // Narrow the parent picker to OUR case — it otherwise lists 1211 pre-existing records, none of
  // which may be touched.
  // The picker's own filter. NOT `input[type=search]` — that is the Link Type combobox's internal
  // search box (`rc_select_1`), which is why the previous attempt never narrowed the table. Prefer
  // the picker's global-table-filter, falling back to its plain text input.
  const pickerSearch = (await dlg.locator('.sha-global-table-filter input.ant-input').count())
    ? dlg.locator('.sha-global-table-filter input.ant-input').last()
    : dlg.locator('input[type="text"]').last();
  await pickerSearch.click();
  await pickerSearch.fill(parentRef);
  const submit = dlg.locator('.sha-global-table-filter button').last();
  if (await submit.count()) await submit.click().catch(() => {});
  else await pickerSearch.press('Enter');
  await page.waitForTimeout(5_000);
  const parentRow = dlg.locator('.ant-checkbox-wrapper').filter({ hasText: parentRef }).first();
  await expect(parentRow, `the parent ${parentRef} must be selectable in the picker`).toBeVisible({ timeout: 30_000 });
  await parentRow.click();
  await page.waitForTimeout(1_500);
  // Confirm the parent is really ticked. ADO expects it "highlighted and marked with a tick", and
  // an unticked parent is the other reason Merge silently does nothing.
  const parentBox = parentRow.locator('input[type="checkbox"]');
  if (!(await parentBox.isChecked().catch(() => false))) {
    await parentBox.check({ force: true }).catch(() => {});
    await page.waitForTimeout(1_500);
  }
  await expect(parentBox, `the parent ${parentRef} must be marked with a tick`).toBeChecked();

  const mergeBtn = dlg.locator('button:has-text("Merge")').first();
  await mergeBtn.scrollIntoViewIfNeeded();
  await expect(mergeBtn, 'the Merge button should be enabled once type and parent are set').toBeEnabled();
  await mergeBtn.click();
  await expect(dlg, 'the merge dialog should close once the merge is accepted').toBeHidden({ timeout: 60_000 });
  await page.waitForTimeout(6_000);
  return { linkOptions, hints };
}

/** Claim two DISTINCT cases for a merge, each status-confirmed on its own details screen. */
async function twoNewCases(page: Page) {
  const parent = await caseWithStatus(page, 'NEW');
  const child = await caseWithStatus(page, 'NEW', [parent]);
  expect(child, 'the two merge subjects must be different cases').not.toBe(parent);
  return { parent, child };
}

// ── tests ───────────────────────────────────────────────────────────────────
test.describe('Case Lifecycle (ADO suite 112755)', () => {
  // Each case logs in, claims a subject and drives multi-step transitions with reloads between.
  // The merge cases need TWO status-confirmed subjects, and confirming a subject costs a details
  // page load apiece, so they need a longer budget than the rest — three of them hit the 300s cap.
  test.setTimeout(300_000);
  const MERGE_TIMEOUT = 600_000;

  test('TC-01 (#112773): Verify Created Case Is Displayed in the Cases List', async ({ page }) => {
    await login(page);

    // STEP 3-4: the Cases list is displayed and a previously created case is present
    const subject = await anyCase(page);
    const found = row(page).filter({ hasText: subject.ref }).first();
    await expect(found, 'the previously created case should appear in the Cases list')
      .toBeVisible({ timeout: 30_000 });

    // STEP 5: the row carries the reference number and the case information
    expect(subject.text, 'row should show the reference number').toContain(subject.ref);
    expect(subject.status, 'row should show a status').toBeTruthy();
    expect(subject.text, 'row should show the reporting submitter').toMatch(/From:/);

    // STEP 6: selecting the case opens the details screen
    await openDetails(page, subject.ref);
    await expect(page.locator('body')).toContainText('Case Details:');
    await expect(page.locator('body')).toContainText(subject.ref);
  });

  test('TC-02 (#112774): Verify Case Details Are Displayed Correctly', async ({ page }) => {
    await login(page);
    const subject = await anyCase(page);
    await openDetails(page, subject.ref);
    const body = page.locator('body');

    // STEP 5: the Case Reference Number matches the row it was opened from
    await expect(body, 'reference number').toContainText(subject.ref);

    // STEP 6-11: the recorded values are displayed. The suite no longer creates the case, so the
    // check is that Case Details agrees with the LIST row for every value both screens show, and
    // that no displayed field is blank. See the plan's deviation note.
    const listCaseType = (subject.text.match(/REF\d+\/[\d/]+:\s*([^]+?)\s+(?:From:|[A-Z][a-z]+,)/) || [])[1];
    if (listCaseType) await expect(body, 'case type should agree with the list row').toContainText(listCaseType.trim());

    await expect(body, 'channel').toContainText(/Call Centre|Web|Walkin|Telephone|SMS|Post|In Facility Tablets/);
    const facts = await caseFacts(page);
    console.log(`TC-02 ${subject.ref} facts: ${JSON.stringify(facts)}`);
    expect(facts.firstName, 'First Name should be displayed').toBeTruthy();
    expect(facts.email, 'Email Address should be displayed').toBeTruthy();
    expect(facts.mobile, 'Mobile Number should be displayed').toBeTruthy();
    await expect(body, 'category').toContainText('Category');
    await expect(body, 'case type').toContainText('Case Type');
    await expect(body, 'description').toContainText('Description');

    // ASSERT a current status is displayed, and it agrees with the list
    const status = await detailsStatus(page);
    expect(status, 'a case status should be displayed').toBeTruthy();
    expect(status, 'details status should agree with the list row').toBe(subject.status);
  });

  test('TC-03 (#112775): Verify Case Can Be Searched Using Case Reference Number', async ({ page }) => {
    await login(page);

    // STEP 4: locate the reference number of an existing case
    const subject = await anyCase(page);

    // STEP 5-7: searching on it narrows the list to exactly that case
    await gotoCases(page);
    await searchCases(page, subject.ref);
    const refs = (await listedRows(page)).map(r => r.ref);
    expect(refs, 'search should return exactly the searched case').toEqual([subject.ref]);

    // STEP 8-9: opening the result shows Case Details for the same reference
    await row(page).first().dblclick();
    await expect(page).toHaveURL(/case-request-details/, { timeout: 45_000 });
    await expect(page.locator('body')).toContainText(subject.ref, { timeout: 45_000 });
  });

  test('TC-04 (#112776): Verify Case Can Be Assigned to an Agent', async ({ page }) => {
    await login(page);
    const ref = await caseWithStatus(page, 'NEW');
    await selectInList(page, ref);

    // STEP 5: the Assign Case dialog is displayed
    await action(page, 'Assign').click();
    const dlg = modalOf(page);
    await expect(dlg).toBeVisible({ timeout: 30_000 });
    await expect(dlg).toContainText(/Assign Case/i);

    // ASSERT no Agent dropdown exists until the radio is chosen
    await expect(dlg.locator('.ant-select')).toHaveCount(0);

    // STEP 6-8: choose the radio, then an eligible agent
    await dlg.locator('.ant-radio-wrapper').filter({ hasText: 'Assign to Agent' }).first().click();
    await page.waitForTimeout(2_500);
    await expect(dlg.locator('label[for="personId"]'), 'an Agent field should appear').toBeVisible();
    const agentSelect = dlg.locator('.ant-select').first();
    const agents = await optionsOf(page, agentSelect);
    expect(agents.length, 'a list of eligible agents should be displayed').toBeGreaterThan(0);
    await page.keyboard.press('Escape');
    await page.waitForTimeout(600);
    const agent = agents[0];
    await chooseOption(page, agentSelect, agent);
    await expect(dlg, 'the selected agent should populate the Agent field').toContainText(agent);

    // STEP 9-11: OK assigns the case
    await okButton(dlg).click();
    await expect(dlg, 'the Assign dialog should close on success').toBeHidden({ timeout: 60_000 });
    await page.waitForTimeout(5_000);
    await openDetails(page, ref);
    await expect(page.locator('body'), 'the chosen agent should show against Assigned To')
      .toContainText(agent, { timeout: 45_000 });
    console.log(`TC-04 ${ref} agent=${agent} status after assignment: ${await detailsStatus(page)}`);
  });

  test('TC-05 (#112777): Verify Case Can Be Assigned to a Group of Agents', async ({ page }) => {
    await login(page);
    const ref = await caseWithStatus(page, 'NEW');
    await selectInList(page, ref);

    await action(page, 'Assign').click();
    const dlg = modalOf(page);
    await expect(dlg).toBeVisible({ timeout: 30_000 });

    // STEP 6-8: the group radio reveals a Group dropdown
    await dlg.locator('.ant-radio-wrapper').filter({ hasText: 'Assign to a Group of Agents' }).first().click();
    await page.waitForTimeout(2_500);
    await expect(dlg.locator('label[for="organisationId"]'), 'a Group field should appear').toBeVisible();
    const groupSelect = dlg.locator('.ant-select').first();
    const groups = await optionsOf(page, groupSelect);
    expect(groups.length, 'a list of agent groups should be displayed').toBeGreaterThan(0);
    await page.keyboard.press('Escape');
    await page.waitForTimeout(600);
    const group = groups.includes('Auto Testing Group') ? 'Auto Testing Group' : groups[0];
    await chooseOption(page, groupSelect, group);
    await expect(dlg, 'the selected group should populate the assignment field').toContainText(group);

    // STEP 9-11: OK assigns to the group
    await okButton(dlg).click();
    await expect(dlg).toBeHidden({ timeout: 60_000 });
    await page.waitForTimeout(5_000);
    await openDetails(page, ref);
    console.log(`TC-05 ${ref} group=${group} status after group assignment: ${await detailsStatus(page)}`);
  });

  test('TC-06 (#112778): Verify Agent Can Pick Up a Case Assigned to Another Agent', async ({ page }) => {
    test.skip(!AGENT_B.user || !AGENT_B.password,
      'BLOCKED: needs a second agent account — set AGENT_B_USER and AGENT_B_PASSWORD. The ' +
      'cross-agent semantics cannot be exercised from the single Admin login.');

    // STEP 1-2: as Agent A (Admin), assign a case; then log in as Agent B
    await login(page);
    const ref = await caseWithStatus(page, 'NEW');
    await selectInList(page, ref);
    await action(page, 'Assign').click();
    const dlg = modalOf(page);
    await dlg.locator('.ant-radio-wrapper').filter({ hasText: 'Assign to Agent' }).first().click();
    await page.waitForTimeout(2_500);
    const agentSelect = dlg.locator('.ant-select').first();
    const agents = await optionsOf(page, agentSelect);
    await page.keyboard.press('Escape');
    const agentA = agents[0];
    await chooseOption(page, agentSelect, agentA);
    await okButton(dlg).click();
    await expect(dlg).toBeHidden({ timeout: 60_000 });

    await login(page, AGENT_B);

    // STEP 4: the case shows Agent A as the current assignee
    await openDetails(page, ref);
    await expect(page.locator('body'), 'Agent A should be the current assignee').toContainText(agentA);

    // STEP 5-6: Pick Up reassigns to Agent B
    await action(page, 'Pick Up').click();
    await page.waitForTimeout(6_000);
    if (await modalOf(page).count() && await modalOf(page).isVisible().catch(() => false)) {
      await confirm(page, 'Yes');
    }
    await reloadDetails(page);
    await expect(page.locator('body'), 'Agent B should now be the assignee')
      .not.toContainText(agentA, { timeout: 45_000 });
  });

  test('TC-07 (#112779): Verify Cases Can Be Merged as Related Cases', async ({ page }) => {
    test.setTimeout(MERGE_TIMEOUT);
    await login(page);
    const { parent, child } = await twoNewCases(page);

    const { linkOptions, hints } = await mergeInto(page, child, parent, 'Related Case');

    // STEP 6: the Link Type options are exactly Parent Case and Child Case
    expect(linkOptions.sort()).toEqual(['Child Case', 'Parent Case']);

    // STEP 8: the related-case hint ADO prescribes
    expect(hints.join(' | '), 'the Related Case hint should match ADO #112779 step 8')
      .toMatch(/flag the child case as .?Merged.? and receives all notifications identical to the parent case/i);

    // STEP 11: the child case is flagged Merged
    await openDetails(page, child);
    await expect
      .poll(() => detailsStatus(page), { timeout: 45_000, message: 'child should be flagged Merged' })
      .toBe('MERGED');

    // STEP 12: the parent case still opens
    await openDetails(page, parent);
    await expect(page.locator('body')).toContainText(parent);
  });

  test('TC-08 (#112780): Verify Cases Can Be Merged as Single Cases', async ({ page }) => {
    test.setTimeout(MERGE_TIMEOUT);
    await login(page);
    const { parent, child } = await twoNewCases(page);

    const { hints } = await mergeInto(page, child, parent, 'Single Case');

    // STEP 8: the single-case hint ADO prescribes (the app appends a full stop — matched tolerantly)
    expect(hints.join(' | '), 'the Single Case hint should match ADO #112780 step 8')
      .toMatch(/merge the selected cases into a single case, and the merged child case will be automatically closed/i);

    // STEP 11: the child case is Closed
    await openDetails(page, child);
    await expect
      .poll(() => detailsStatus(page), { timeout: 45_000, message: 'child should be Closed by a single merge' })
      .toBe('CLOSED');

    // STEP 12: the parent remains available
    await openDetails(page, parent);
    await expect(page.locator('body')).toContainText(parent);
  });

  test('TC-09 (#112781): Verify Related Case(s) Panel Is Displayed for a Merged Case', async ({ page }) => {
    test.setTimeout(MERGE_TIMEOUT);
    await login(page);
    const { parent, child } = await twoNewCases(page);
    await mergeInto(page, child, parent, 'Related Case');

    // STEP 5-6: open the merged case and expand the Related Case(s) panel
    await openDetails(page, child);
    const panel = page.locator('.ant-collapse-header, .ant-card-head-title')
      .filter({ hasText: /Related Case/i }).first();
    await expect(panel, 'the Related Case(s) panel should be present').toBeVisible({ timeout: 30_000 });
    await panel.scrollIntoViewIfNeeded();
    await panel.click();
    await page.waitForTimeout(4_000);

    // ASSERT (BLOCKING) the counterpart relationship is shown
    await expect(page.locator('body'), 'the related panel should name the parent case')
      .toContainText(parent, { timeout: 30_000 });
  });

  test('TC-10 (#112782): Verify Notifications Are Sent to the Correct Case After Single Case Merge', async ({ page }) => {
    test.setTimeout(MERGE_TIMEOUT);
    await login(page);
    const { parent, child } = await twoNewCases(page);
    await mergeInto(page, child, parent, 'Single Case');

    // STEP 10: the parent case records the merge notification
    await openDetails(page, parent);
    const parentTimeline = await timelineText(page);
    console.log(`TC-10 PARENT ${parent} timeline:\n${parentTimeline}`);

    // STEP 12: the child case records no merge notification
    await openDetails(page, child);
    const childTimeline = await timelineText(page);
    console.log(`TC-10 CHILD ${child} timeline:\n${childTimeline}`);

    expect(parentTimeline, 'the parent Timeline should carry an entry').toBeTruthy();
    expect(childTimeline, 'the child Timeline should not record a merge notification')
      .not.toMatch(/merge/i);

    // NOT VERIFIED: actual delivery, and the channel used, are not observable from the portal.
    // See BUG-204 — this half of ADO #112782 cannot be proven here.
  });

  test('TC-11 (#112783): Verify Notifications Are Sent to Both Cases After Related Case Merge', async ({ page }) => {
    test.setTimeout(MERGE_TIMEOUT);
    await login(page);
    const { parent, child } = await twoNewCases(page);
    await mergeInto(page, child, parent, 'Related Case');

    // STEP 10-12: both cases record a notification
    await openDetails(page, parent);
    const parentTimeline = await timelineText(page);
    console.log(`TC-11 PARENT ${parent} timeline:\n${parentTimeline}`);
    await openDetails(page, child);
    const childTimeline = await timelineText(page);
    console.log(`TC-11 CHILD ${child} timeline:\n${childTimeline}`);

    expect(parentTimeline, 'parent Timeline should carry an entry').toBeTruthy();
    expect(childTimeline, 'child Timeline should carry an entry').toBeTruthy();

    // NOT VERIFIED: actual delivery and channel — see BUG-204.
  });

  test('TC-12 (#112784): Verify Case Can Be Closed', async ({ page }) => {
    await login(page);
    const ref = await caseWithStatus(page, 'IN PROGRESS', [], 'Close');
    await openDetails(page, ref);

    // STEP 5: the Close Case confirmation dialog
    await action(page, 'Close').click();
    const dialogText = await confirm(page, 'Yes');
    expect(dialogText, 'the dialog should ask about closing the case')
      .toMatch(/are you sure that you want to close/i);

    // STEP 7: the status changes to Closed and persists
    await reloadDetails(page);
    await expect
      .poll(() => detailsStatus(page), { timeout: 45_000, message: 'status should become CLOSED' })
      .toBe('CLOSED');

    // STEP 8: the ReOpen action is displayed
    expect((await visibleActions(page)).join(' | '), 'ReOpen should be offered on a closed case')
      .toMatch(/ReOpen/i);

    // STEP 9: the closure notification. Recorded for the report — the Timeline currently gains no
    // closure entry (BUG-205), and delivery itself is not observable here.
    console.log(`TC-12 ${ref} timeline after close:\n${await timelineText(page)}`);
  });

  test('TC-13 (#112785): Verify Case Closure Is Cancelled When No Is Selected', async ({ page }) => {
    await login(page);
    const ref = await caseWithStatus(page, 'IN PROGRESS', [], 'Close');
    await openDetails(page, ref);

    // STEP 5-6: open the Close dialog and answer No
    await action(page, 'Close').click();
    await confirm(page, 'No');
    await expect(modalOf(page), 'the confirmation dialog should close').toBeHidden({ timeout: 20_000 });

    // STEP 7: the case remains In Progress
    await reloadDetails(page);
    await expect
      .poll(() => detailsStatus(page), { timeout: 45_000, message: 'status must stay IN PROGRESS' })
      .toMatch(/IN ?PROGRESS/);

    // STEP 8: no ReOpen action, because nothing was closed
    expect((await visibleActions(page)).join(' | '), 'ReOpen must not be offered — nothing was closed')
      .not.toMatch(/ReOpen/i);
  });

  test('TC-14 (#112786): Verify Closed Case Can Be Reopened', async ({ page }) => {
    await login(page);
    const ref = await caseWithStatus(page, 'CLOSED', [], 'ReOpen');
    await openDetails(page, ref);

    // STEP 3: a closed case offers Open and ReOpen
    expect((await visibleActions(page)).join(' | '), 'a closed case should offer ReOpen').toMatch(/ReOpen/i);

    // STEP 4-5: the ReOpen dialog displays the case reference number
    await action(page, 'ReOpen').click();
    const dlg = modalOf(page);
    await expect(dlg).toBeVisible({ timeout: 20_000 });
    await expect(dlg, 'the dialog should display the case reference number').toContainText(ref);
    const dialogText = (await dlg.innerText()).replace(/\s+/g, ' ').trim();
    expect(dialogText, 'the dialog should be about setting the case to Open')
      .toMatch(/set this case to .?Open.? status/i);

    // STEP 6: confirm
    await dlg.locator('button:has-text("Yes")').first().click();
    await page.waitForTimeout(6_000);
    await reloadDetails(page);

    // STEP 7: ADO requires the status to become "Open". The app sets NEW instead — asserted as ADO
    // prescribes, so this fails by design until BUG-203 is resolved.
    await expect
      .poll(() => detailsStatus(page), { timeout: 45_000, message: 'ADO #112786 step 7 requires CLOSED -> OPEN' })
      .toBe('OPEN');

    // STEP 8: ReOpen is no longer available
    expect((await visibleActions(page)).join(' | '), 'ReOpen should be withdrawn once reopened')
      .not.toMatch(/ReOpen/i);
  });

  test('TC-15 (#112787): Verify Case Reopening Is Cancelled When No Is Selected', async ({ page }) => {
    await login(page);
    const ref = await caseWithStatus(page, 'CLOSED', [], 'ReOpen');
    await openDetails(page, ref);

    // STEP 4-6: open the ReOpen dialog, verify the message, answer No
    await action(page, 'ReOpen').click();
    const dlg = modalOf(page);
    await expect(dlg).toBeVisible({ timeout: 20_000 });
    await expect(dlg, 'the dialog should display the case reference number').toContainText(ref);
    await dlg.locator('button:has-text("No")').first().click();
    await page.waitForTimeout(5_000);
    await expect(modalOf(page), 'the dialog should close').toBeHidden({ timeout: 20_000 });

    // STEP 7: the case remains Closed
    await reloadDetails(page);
    await expect
      .poll(() => detailsStatus(page), { timeout: 45_000, message: 'status must stay CLOSED' })
      .toBe('CLOSED');

    // STEP 8: ReOpen remains available
    expect((await visibleActions(page)).join(' | '), 'ReOpen should still be offered').toMatch(/ReOpen/i);
  });

  test('TC-16 (#112788): Verify Case Can Be Marked as In Progress', async ({ page }) => {
    await login(page);
    const ref = await caseWithStatus(page, 'NEW', [], 'Mark In Progress');
    await openDetails(page, ref);
    const before = await detailsStatus(page);
    expect(before, 'the subject should not already be In Progress').not.toMatch(/IN ?PROGRESS/);

    // STEP 4-5: the confirmation dialog
    await action(page, 'Mark In Progress').click();
    const dialogText = await confirm(page, 'Yes');
    expect(dialogText, 'the dialog should ask about setting the case to In Progress')
      .toMatch(/set this case to .?In Progress.?/i);

    // STEP 7: the status changes to In Progress and persists
    await reloadDetails(page);
    await expect
      .poll(() => detailsStatus(page), { timeout: 45_000, message: 'status should become IN PROGRESS' })
      .toMatch(/IN ?PROGRESS/);

    // STEP 8: the In Progress action set is offered — Close appears, Mark In Progress withdraws
    const actions = (await visibleActions(page)).join(' | ');
    expect(actions, 'Close should now be available').toMatch(/Close/);
    expect(actions, 'Mark In Progress should be withdrawn').not.toMatch(/Mark In Progress/);
  });

  test('TC-17 (#112789): Verify Case Is Not Marked as In Progress When No Is Selected', async ({ page }) => {
    await login(page);
    const ref = await caseWithStatus(page, 'NEW', [], 'Mark In Progress');
    await openDetails(page, ref);
    const before = await detailsStatus(page);

    // STEP 4-5: open the dialog and answer No
    await action(page, 'Mark In Progress').click();
    await confirm(page, 'No');
    await expect(modalOf(page), 'the confirmation dialog should close').toBeHidden({ timeout: 20_000 });

    // STEP 6: the case remains in its previous status
    await reloadDetails(page);
    expect(await detailsStatus(page), 'the status must be unchanged').toBe(before);
  });

  test('TC-18 (#112790): Verify Email Can Be Sent from Case Details', async ({ page }) => {
    await login(page);
    const ref = await caseWithStatus(page, 'NEW');
    const recipient = EMAIL_RECIPIENT;
    if (recipient) await setCustomerContact(page, ref, { email: recipient });
    else await openDetails(page, ref);

    // STEP 4: the email composer opens on the Timeline panel
    await action(page, 'Send Email').click();
    await page.waitForTimeout(4_000);

    // STEP 5: the customer's email address is automatically populated
    if (recipient) {
      await expect(page.locator('body'), 'the composer should prefill the customer address')
        .toContainText(recipient, { timeout: 20_000 });
    } else {
      await expect(page.locator('body'), 'the composer should prefill an email address')
        .toContainText(/Email Address\s*:\s*\S+@\S+/, { timeout: 20_000 });
    }

    // STEP 6-7: type a message and send
    const message = `QA-LIFE ${ref} — TC-18 email from case details ${stamp()}`;
    await typeEmailBody(page, message);
    await action(page, 'Send').click();
    await page.waitForTimeout(9_000);

    // STEP 8: the sent email is recorded in the Timeline
    await reloadDetails(page);
    const tl = await timelineText(page);
    console.log(`TC-18 ${ref} timeline after send:\n${tl}`);
    expect(tl, 'the sent email should be recorded in the case Timeline').toContain(message.slice(0, 40));

    // STEP 9: MANUAL — confirm receipt.
    console.log(recipient
      ? `TC-18 MANUAL CHECK: expect an email at ${recipient} for ${ref}`
      : `TC-18 NOT VERIFIED: no QA_EMAIL_RECIPIENT set, delivery unobservable`);
  });

  test('TC-19 (#112791): Verify CC Email Address Can Be Added', async ({ page }) => {
    await login(page);
    const ref = await caseWithStatus(page, 'NEW');
    const recipient = EMAIL_RECIPIENT;
    if (recipient) await setCustomerContact(page, ref, { email: recipient });
    else await openDetails(page, ref);
    await action(page, 'Send Email').click();
    await page.waitForTimeout(4_000);

    // STEP 5: the Cc field accepts an address
    const ccAddress = recipient || 'qa.auto.cc@test.com';
    const cc = page.locator('input[type="text"]:visible').first();
    await cc.click();
    await cc.fill(ccAddress);
    await expect(cc, 'the Cc field should display the address entered').toHaveValue(ccAddress);

    // STEP 6-7: message and send
    const message = `QA-LIFE ${ref} — TC-19 email with a CC recipient ${stamp()}`;
    await typeEmailBody(page, message);
    await action(page, 'Send').click();
    await page.waitForTimeout(9_000);
    await reloadDetails(page);
    const tl = await timelineText(page);
    console.log(`TC-19 ${ref} timeline:\n${tl}`);
    expect(tl, 'the email should be recorded in the Timeline').toContain(message.slice(0, 40));

    // STEP 8-9: MANUAL — confirm both the primary and CC recipient received it.
    console.log(`TC-19 MANUAL CHECK: primary + cc (${ccAddress}) for ${ref}`);
  });

  test('TC-20 (#112792): Verify Email Attachment Can Be Uploaded', async ({ page }) => {
    await login(page);
    const ref = await caseWithStatus(page, 'NEW');
    if (EMAIL_RECIPIENT) await setCustomerContact(page, ref, { email: EMAIL_RECIPIENT });
    else await openDetails(page, ref);
    await action(page, 'Send Email').click();
    await page.waitForTimeout(4_000);

    const message = `QA-LIFE ${ref} — TC-20 email with an attachment ${stamp()}`;
    await typeEmailBody(page, message);

    // STEP 6-7: attach a file through (press to upload). Supplied as a buffer so the suite needs
    // no fixture file on disk.
    await page.locator('input[type="file"]').first().setInputFiles({
      name: 'qa-life-attachment.txt',
      mimeType: 'text/plain',
      buffer: Buffer.from(`QA-LIFE attachment for ${ref}`),
    });
    await page.waitForTimeout(4_000);

    // STEP 8: the attachment is displayed in the composer
    await expect(page.locator('body'), 'the attachment should be listed in the composer')
      .toContainText('qa-life-attachment.txt', { timeout: 30_000 });

    // STEP 9: send
    await action(page, 'Send').click();
    await page.waitForTimeout(9_000);
    await reloadDetails(page);
    console.log(`TC-20 ${ref} timeline:\n${await timelineText(page)}`);
    console.log(`TC-20 MANUAL CHECK: expect the attachment at ${EMAIL_RECIPIENT || '(unset)'} for ${ref}`);
  });

  test('TC-21 (#112793): Verify Email Can Be Sent with CC Recipient and Attachment', async ({ page }) => {
    await login(page);
    const ref = await caseWithStatus(page, 'NEW');
    const recipient = EMAIL_RECIPIENT;
    if (recipient) await setCustomerContact(page, ref, { email: recipient });
    else await openDetails(page, ref);
    await action(page, 'Send Email').click();
    await page.waitForTimeout(4_000);

    // STEP 5: Cc
    const ccAddress = recipient || 'qa.auto.cc@test.com';
    const cc = page.locator('input[type="text"]:visible').first();
    await cc.click();
    await cc.fill(ccAddress);

    // STEP 6: message
    const message = `QA-LIFE ${ref} — TC-21 email with CC and attachment ${stamp()}`;
    await typeEmailBody(page, message);

    // STEP 7-8: attachment
    await page.locator('input[type="file"]').first().setInputFiles({
      name: 'qa-life-combined.txt',
      mimeType: 'text/plain',
      buffer: Buffer.from(`QA-LIFE combined attachment for ${ref}`),
    });
    await page.waitForTimeout(4_000);

    // STEP 9: everything is shown together before sending
    await expect(page.locator('body'), 'attachment').toContainText('qa-life-combined.txt');
    await expect(cc, 'cc recipient').toHaveValue(ccAddress);

    // STEP 10: send
    await action(page, 'Send').click();
    await page.waitForTimeout(9_000);
    await reloadDetails(page);
    console.log(`TC-21 ${ref} timeline:\n${await timelineText(page)}`);
    console.log(`TC-21 MANUAL CHECK: message + attachment to primary AND cc for ${ref}`);
  });

  test('TC-22 (#112794): Verify SMS Can Be Sent from Case Details Timeline', async ({ page }) => {
    await login(page);
    const ref = await caseWithStatus(page, 'NEW');
    const mobile = SMS_MOBILE;
    if (mobile) await setCustomerContact(page, ref, { mobile });
    else await openDetails(page, ref);

    // STEP 4: the SMS composer opens
    await action(page, 'Send SMS').click();
    await page.waitForTimeout(4_000);

    // STEP 5: the customer's mobile number is automatically populated, leading zero intact
    if (mobile) {
      await expect(page.locator('body'), 'the composer should prefill the customer mobile number')
        .toContainText(mobile, { timeout: 20_000 });
    } else {
      await expect(page.locator('body'), 'the composer should prefill a mobile number')
        .toContainText(/Mobile Number\s*0\d{9}/, { timeout: 20_000 });
    }

    // STEP 6-7: type the message and send
    const message = `QA-LIFE ${ref} — TC-22 SMS from the case timeline ${stamp()}`;
    await page.locator('textarea:visible').first().fill(message);
    await page.waitForTimeout(1_000);
    await action(page, 'Send').click();
    await page.waitForTimeout(9_000);

    // STEP 8: the SMS activity is recorded against the case
    await reloadDetails(page);
    const tl = await timelineText(page);
    console.log(`TC-22 ${ref} timeline after SMS:\n${tl}`);
    expect(tl, 'the SMS should be recorded against the case').toContain(message.slice(0, 40));

    // STEP 9: MANUAL — confirm receipt on the handset.
    console.log(mobile
      ? `TC-22 MANUAL CHECK: expect an SMS on ${mobile} for ${ref}`
      : `TC-22 NOT VERIFIED: no QA_SMS_MOBILE set, delivery unobservable`);
  });

  test('TC-23 (#112795): Verify Case Details Can Be Edited and Saved', async ({ page }) => {
    await login(page);
    const ref = await caseWithStatus(page, 'NEW');
    await openDetails(page, ref);

    // STEP 4: Edit enters edit mode
    await action(page, 'Edit').click();
    await page.waitForTimeout(4_000);
    await expect(action(page, 'Save'), 'Save should be offered in edit mode').toBeVisible({ timeout: 20_000 });
    await expect(action(page, 'Cancel Form Edit')).toBeVisible();

    // STEP 5: update an editable field — Last Name is safe and unambiguous
    const field = fieldValue(page, 'reportedUser_lastName');
    await expect(field).toBeVisible({ timeout: 20_000 });
    const updated = `Edited${stamp()}`;
    await field.click();
    await field.fill(updated);
    await expect(field, 'the update should be accepted').toHaveValue(updated);

    // STEP 6-7: save, and the update is displayed.
    // The screen STAYS in edit mode after Save and does not re-render the view — it toasts
    // "Case updated Refreshing.." but keeps showing the pre-edit values until the page is
    // refreshed. So reload before asserting, or this reads as a save failure when the save worked.
    await action(page, 'Save').click();
    await page.waitForTimeout(8_000);
    await reloadDetails(page);
    await expect(page.locator('body'), 'the updated value should be displayed')
      .toContainText(updated, { timeout: 45_000 });

    // STEP 8: it survives leaving and reopening the case
    await openDetails(page, ref);
    await expect(page.locator('body'), 'the update should persist across a reopen')
      .toContainText(updated, { timeout: 45_000 });
  });

  test('TC-24 (#112796): Verify Case Category and Case Type Can Be Updated', async ({ page }) => {
    await login(page);
    const ref = await caseWithStatus(page, 'NEW');
    await openDetails(page, ref);
    await action(page, 'Edit').click();
    await page.waitForTimeout(4_000);

    // STEP 5-6: change Category, and the Case Type options refresh to that category's types.
    // Target Water unless the case is already Water, in which case switch to Electrical.
    const alreadyWater = /Water/.test(await page.locator('body').innerText());
    const [toCategory, expectTypes, notTypes, pickType] = alreadyWater
      ? ['Electrical', ELECTRICAL_TYPES, WATER_TYPES, 'Area Power Failure']
      : ['Water', WATER_TYPES, ELECTRICAL_TYPES, 'Burst Pipe'];

    const categorySelect = page.locator('.ant-form-item:has(label[for="category"]) .ant-select').first();
    await expect(categorySelect, 'the Category field should be editable').toBeVisible({ timeout: 20_000 });
    await chooseOption(page, categorySelect, toCategory);
    await page.waitForTimeout(2_500);

    const caseTypeSelect = page.locator('.ant-form-item:has(label[for="caseType"]) .ant-select').first();
    const types = await optionsOf(page, caseTypeSelect);
    expect(types.sort(), 'Case Type options should refresh to the new Category').toEqual([...expectTypes].sort());
    for (const t of notTypes) expect(types, 'no stale case type should remain').not.toContain(t);
    await page.keyboard.press('Escape');
    await page.waitForTimeout(600);
    await chooseOption(page, caseTypeSelect, pickType);

    // STEP 7: save
    await action(page, 'Save').click();
    await page.waitForTimeout(8_000);

    // STEP 8-9: both values display, and persist across a reopen
    await expect(page.locator('body'), 'new category').toContainText(toCategory, { timeout: 45_000 });
    await expect(page.locator('body'), 'new case type').toContainText(pickType);
    await openDetails(page, ref);
    await expect(page.locator('body'), 'category should persist').toContainText(toCategory, { timeout: 45_000 });
    await expect(page.locator('body'), 'case type should persist').toContainText(pickType);
  });

  test('TC-25 (#112797): Verify Case Description Can Be Updated', async ({ page }) => {
    await login(page);
    const ref = await caseWithStatus(page, 'NEW');
    await openDetails(page, ref);
    await action(page, 'Edit').click();
    await page.waitForTimeout(4_000);

    // STEP 5-6: the Description field is editable. It is an input with placeholder
    // "Description missing", not a textarea.
    const desc = page.locator('input[placeholder="Description missing"], .ant-form-item:has(label[for="description"]) input')
      .first();
    await expect(desc, 'the Description field should be available for editing').toBeVisible({ timeout: 20_000 });
    const updated = `QA-LIFE ${ref} — description updated ${stamp()}`;
    await desc.click();
    await desc.fill(updated);
    await expect(desc).toHaveValue(updated);

    // STEP 7-9: save, verify, and confirm it persists.
    // Reload before asserting — Save leaves the screen in edit mode showing the old values.
    await action(page, 'Save').click();
    await page.waitForTimeout(8_000);
    await reloadDetails(page);
    await expect(page.locator('body'), 'the updated description should display')
      .toContainText(updated, { timeout: 45_000 });
    await openDetails(page, ref);
    await expect(page.locator('body'), 'the description should persist')
      .toContainText(updated, { timeout: 45_000 });
  });

  test('TC-26 (#112798): Verify Customer Details Can Be Updated', async ({ page }) => {
    await login(page);
    const ref = await caseWithStatus(page, 'NEW');
    await openDetails(page, ref);
    await action(page, 'Edit').click();
    await page.waitForTimeout(4_000);

    // STEP 5-6: the Customer Information fields are editable
    const firstName = fieldValue(page, 'reportedUser_firstName');
    await expect(firstName, 'customer fields should be editable').toBeVisible({ timeout: 20_000 });
    const newFirst = `QAUpd${stamp()}`;
    await firstName.click();
    await firstName.fill(newFirst);

    // STEP 7: update the Preferred Contact Method
    const pcm = page.locator('.ant-form-item:has(label[for="reportedUser_preferredContactMethod"]) .ant-select').first();
    if (await pcm.count()) {
      await chooseOption(page, pcm, 'SMS');
      await expect(page.locator('body'), 'the chosen contact method should display').toContainText('SMS');
    }

    // STEP 8-10: save, verify, confirm persistence.
    // Reload before asserting — Save leaves the screen in edit mode showing the old values.
    await action(page, 'Save').click();
    await page.waitForTimeout(8_000);
    await reloadDetails(page);
    await expect(page.locator('body'), 'the updated customer name should display')
      .toContainText(newFirst, { timeout: 45_000 });
    await openDetails(page, ref);
    await expect(page.locator('body'), 'the customer update should persist')
      .toContainText(newFirst, { timeout: 45_000 });
  });

  test('TC-27 (#112799): Verify Case Edit Can Be Cancelled Using Cancel Form Edit', async ({ page }) => {
    await login(page);
    const ref = await caseWithStatus(page, 'NEW');
    await openDetails(page, ref);

    // STEP 4: note the existing value of an editable field, read from the case itself
    await action(page, 'Edit').click();
    await page.waitForTimeout(4_000);
    const lastName = fieldValue(page, 'reportedUser_lastName');
    await expect(lastName).toBeVisible({ timeout: 20_000 });
    const original = await lastName.inputValue();
    expect(original, 'the field should have an original value to restore').toBeTruthy();

    // STEP 5-6: change it
    const discarded = `Discarded${stamp()}`;
    await lastName.click();
    await lastName.fill(discarded);
    await expect(lastName).toHaveValue(discarded);

    // STEP 7: cancel the edit
    await action(page, 'Cancel Form Edit').click();
    await page.waitForTimeout(6_000);
    await expect(action(page, 'Edit'), 'the screen should return to view mode').toBeVisible({ timeout: 30_000 });

    // STEP 8: the original value is shown, the edit was not saved
    const body = page.locator('body');
    await expect(body, 'the discarded value must not be displayed').not.toContainText(discarded);
    await expect(body, 'the original value should be restored').toContainText(original);

    // STEP 9: and it stays that way after reopening
    await openDetails(page, ref);
    await expect(page.locator('body'), 'the discarded edit must not have persisted')
      .not.toContainText(discarded, { timeout: 45_000 });
    await expect(page.locator('body')).toContainText(original);
  });
});

/** Read a case's customer details straight off its Case Details screen. */
async function caseFacts(page: Page) {
  return page.evaluate(() => {
    const t = document.body.innerText.replace(/\s+/g, ' ');
    const grab = (label: string, stop: string) => {
      const m = t.match(new RegExp(`${label}\\s+(.*?)\\s+(?=${stop})`));
      return m ? m[1].trim() : null;
    };
    return {
      firstName: grab('First Name', 'Last Name'),
      lastName: grab('Last Name', 'Email Address'),
      email: grab('Email Address', 'Mobile Number'),
      mobile: grab('Mobile Number', 'Preferred Contact Method|$'),
    };
  });
}
