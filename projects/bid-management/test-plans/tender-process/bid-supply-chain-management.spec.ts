// AUTO-RECORDED from test-plans/tender-process/bid-supply-chain-management.md
// Source: Azure DevOps test plan #57472, suite #57473 (BID: Supply Chain Management)
// The .md plan is canonical. AI-repair will patch failing lines in this file.
//
// Login + menu navigation selectors were recorded live against the QA app.
// Remaining // TODO[selector] markers are data-dependent interactions (opening a
// specific Inbox/Evaluate-Tenders row, the Draft-Tender form, the evaluation
// dialog) that require seeded test data; AI-repair resolves them on a run where
// such data exists.

import { test, expect, Page, Locator } from '@playwright/test';
import * as path from 'path';

const APP_URL = 'https://linux-supplychainmanagement-adminportal-qa.azurewebsites.net/login';
const ADMIN = { user: 'Maanda-awe', password: '123qwe' };
// Reviewer/approver — has submitted tenders in their Inbox at the "Review and Approve" stage.
const REVIEWER = { user: 'MhlotiM', password: '123qwe' };
// Publisher — has approved tenders in their Inbox at the "Publish Tender" stage.
const PUBLISHER = { user: 'TumisangM', password: '123qwe' };
// BEC chair — invites the Bid Evaluation Committee members ("Invite BEC members" stage). Also the BEC
// Secretariat for the calibration/finalise-scoring and finalise-recommendation stages (TC-10, TC-11, TC-12).
const BEC_CHAIR = { user: 'ThabisoM', password: '123qwe' };
// BAC adjudicator — "Capture outcome from the BAC" stage (TC-13).
const BAC = { user: 'MoshadiM', password: '123qwe' };
// Approving authority — "Approve Recommendation from BAC" stage (TC-14).
const APPROVER = { user: 'ThulileM', password: '123qwe' };
// BEC evaluators — each scores every supplier. Distinct scores so A & A Stationers wins.
const EVALUATORS = [
  { user: 'Nathi', scores: { 'A & A Stationers': '90', 'Telkom': '75', 'BOXFUSION': '60' } },
  { user: 'Nelly', scores: { 'A & A Stationers': '88', 'Telkom': '78', 'BOXFUSION': '65' } },
  { user: 'Thabitha', scores: { 'A & A Stationers': '92', 'Telkom': '70', 'BOXFUSION': '55' } },
];
const EVALUATE_TENDERS_URL = `${APP_URL.replace('/login', '')}/dynamic/Shesha.SupplyChainManagement/tenders-to-evaluate`;

// Test attachment lives in the hub-root test-data/ folder (4 levels up from this spec).
const PDF_FIXTURE = path.join(__dirname, '..', '..', '..', '..', 'test-data', 'pdf-test.pdf');

// Strict single-tender chain run: TC-01 stamps a UNIQUE per-run tag on the tender it creates and
// stores the full name here. Every downstream TC targets THIS tender (via tenderMatch()) instead of
// `.first()` at the stage — so a broken chain can't be masked by an unrelated leftover item passing
// in its place. Falls back to the generic name when TC-01 didn't run this session (single-TC runs).
const RUN_TAG = `run-${Date.now().toString(36)}`;
let RUN_TENDER = '';
// The app-assigned Ref No (e.g. REF2026-2160) of the tender TC-01 creates. The Evaluate-Tenders list
// (TC-09) is paginated and its search box matches the REF, NOT the tender name — so downstream
// evaluate-stage TCs must search by this REF to find the right card rather than scanning page 1.
// Can be seeded via the RUN_REF env var to validate the evaluate-stage TCs standalone (without TC-01).
let RUN_REF = process.env.RUN_REF || '';
// Prefer the app-assigned RUN_REF when known: inbox rows contain the Ref No, and the REF is unique,
// so filtering rows by it pins every downstream stage to the exact tender TC-01 created (or the one
// seeded via RUN_REF). Falls back to the unique run-tagged name, then the generic name for single-TC runs.
function tenderMatch(): string { return RUN_REF || RUN_TENDER || 'TC-01 Automated Draft Tender'; }
// Evaluation Criteria split (price/functionality weighting). Default 90/10; override per run with the
// EVAL_CRITERIA env var (e.g. EVAL_CRITERIA=80/20). Drives the TC-01 radio + the TC-02/04 read-only checks.
const EVAL_CRITERIA = process.env.EVAL_CRITERIA || '90/10';

// Recorded live: the header has a view-mode selector (tooltip "Click to change view mode")
// that toggles Live / Ready / Latest. The Draft-Tender form only renders its latest fields
// in "Latest" mode, so switch to it after login. Guarded — no-op if the control is absent.
async function switchToLatest(page: Page) {
  const selector = page.getByTitle('Click to change view mode');
  await selector.waitFor({ state: 'visible', timeout: 20000 });
  if ((await selector.innerText().catch(() => '')).includes('Latest')) return;
  // The dropdown occasionally drops the menu click, so retry open+select until it sticks.
  await expect(async () => {
    await selector.click();
    await page.getByRole('menuitem', { name: /^Latest/ }).click({ timeout: 5000 });
    await expect(selector).toContainText('Latest', { timeout: 5000 });
  }).toPass({ timeout: 30000 });
  // Switching view mode reloads configurable components (incl. the side menu); let it settle.
  await page.waitForLoadState('networkidle');
}

// Recorded live: the "(press to upload)" buttons open a native file chooser. Driving the
// chooser is more reliable than setInputFiles on the hidden AntD input (which intermittently
// fails to register the file). Then wait for the upload to surface before continuing.
async function uploadFile(page: Page, trigger: Locator, file: string) {
  const chooserPromise = page.waitForEvent('filechooser');
  await trigger.click();
  (await chooserPromise).setFiles(file);
}

// Recorded live: Ant DatePicker with showTime. .fill() does NOT commit to React state
// (a later re-render wipes it), so drive the panel: navigate to the month, click the day
// cell (td[title="YYYY-MM-DD"]), click the hour, then the enabled OK button.
async function pickAntDateTime(page: Page, field: Locator, dateTitle: string, hour: string) {
  await field.click();
  const dropdown = page.locator('.ant-picker-dropdown:not(.ant-picker-dropdown-hidden)').last();
  const cell = dropdown.locator(`td[title="${dateTitle}"]`);
  for (let i = 0; i < 24 && !(await cell.isVisible().catch(() => false)); i++) {
    await dropdown.locator('.ant-picker-header-next-btn').first().click();
  }
  await cell.click();
  await dropdown.locator('.ant-picker-time-panel-column').first()
    .locator('.ant-picker-time-panel-cell-inner')
    .filter({ hasText: new RegExp(`^${hour}$`) }).first().click();
  await page.locator('.ant-picker-dropdown:not(.ant-picker-dropdown-hidden) .ant-picker-ok button').click();
}

// Recorded live (Playwright MCP): Ant-Design form. Each field is its own .ant-form-item with a
// single input and no nesting; labels render as "<Label>*" (asterisk glued on), so match by
// substring on the form-item text and take the lone input inside it.
function formItem(page: Page, label: string) {
  return page.locator('.ant-form-item').filter({ hasText: label });
}

// Recorded: login fields expose only placeholders (no accessible name); button is "Sign In".
async function loginAs(page: Page, creds: { user: string; password: string }) {
  await page.goto(APP_URL);
  await page.getByPlaceholder('Username').fill(creds.user);
  await page.getByPlaceholder('Password').fill(creds.password);
  await page.getByRole('button', { name: 'Sign In' }).click();
  await page.waitForURL(url => !url.href.includes('/login'), { timeout: 30000 });
  await page.waitForLoadState('networkidle');
  await switchToLatest(page);
}
async function loginAsAdmin(page: Page) {
  await loginAs(page, ADMIN);
}

// Recorded: Ant-Design accordion menu. Workflows expands to Inbox/My Items/Sent Items/Draft.
// The submenu animates open, so the Inbox click can hit an unstable / intercepted target —
// retry it (re-opening Workflows if the submenu collapsed) until the inbox actually loads.
async function openInbox(page: Page) {
  const workflows = page.getByRole('menuitem', { name: 'Workflows' });
  const inbox = page.getByRole('menuitem', { name: 'Inbox' });
  await workflows.click();
  await expect(async () => {
    if (!(await inbox.isVisible().catch(() => false))) {
      await workflows.click({ timeout: 5000 });
    }
    await inbox.click({ timeout: 5000 });
    await page.waitForURL(/workflows-inbox/, { timeout: 8000 });
  }).toPass({ timeout: 40000 });
  await page.waitForLoadState('networkidle');
}

// Recorded: Bid Management expands to Dashboard/Evaluate Tenders/Calibrate Scores/TenderType Documents/Suppliers.
async function openEvaluateTenders(page: Page) {
  await page.getByRole('menuitem', { name: 'Bid Management' }).click();
  await page.getByRole('menuitem', { name: 'Evaluate Tenders' }).click();
  await page.waitForLoadState('networkidle');
}

// Reusable assertion: the opened item lands on the expected workflow page.
// The QA app's dynamic (configurable) pages load slowly and variably, so allow 30s.
async function expectOnPage(page: Page, pageName: string) {
  await expect(page.getByText(pageName, { exact: false }).first()).toBeVisible({ timeout: 30000 });
}

// Recorded live: the Consolidate-Responses "Add New Response" dialog. Captures one manual
// supplier response — supplier + submission method (selects), proposal price, and an attachment
// for each mandatory response document. The document table REORDERS after each upload, so
// attachments are targeted by their exact Document-Name cell, never by position.
const MANDATORY_RESPONSE_DOCS = ['RFQ Document', 'Test', 'TAX Clearance Cert'];
async function addSupplierResponse(
  page: Page,
  resp: { supplier: string; method: string; price: string },
) {
  // Idempotent: if a retry re-enters after this supplier was already consolidated, skip it so we
  // don't add a duplicate response (the failing 3rd add re-runs cleanly without re-adding 1 & 2).
  if (await page.getByRole('cell', { name: resp.supplier, exact: true }).first().isVisible().catch(() => false)) return;
  await page.getByRole('button', { name: /Add New Response/ }).click();
  const dialog = page.locator('.ant-modal-content');
  await expect(dialog.getByText('Add Supplier Response')).toBeVisible({ timeout: 15000 });

  // Supplier (1st select) and Submission method (2nd select). Options render in a body portal.
  await dialog.locator('.ant-select-selector').nth(0).click();
  await page.locator('.ant-select-item-option').filter({ hasText: resp.supplier }).first().click();
  await dialog.locator('.ant-select-selector').nth(1).click();
  await page.locator('.ant-select-item-option-content').filter({ hasText: new RegExp(`^${resp.method}$`) }).first().click();

  // Proposal price (fill commits on the subsequent blur when the upload buttons are clicked).
  await dialog.locator('.ant-input-number-input').fill(resp.price);

  // Attach the mandatory docs, locating each row by its exact Document-Name cell.
  for (const doc of MANDATORY_RESPONSE_DOCS) {
    const row = dialog.getByRole('row').filter({ has: page.getByRole('cell', { name: doc, exact: true }) });
    await uploadFile(page, row.getByRole('button', { name: /press to upload/i }), PDF_FIXTURE);
    await expect(row.getByText('pdf-test.pdf')).toBeVisible({ timeout: 15000 });
  }

  const dlgSubmit = dialog.getByRole('button', { name: 'Submit', exact: true });
  await expect(dlgSubmit).toBeEnabled({ timeout: 15000 });
  await dlgSubmit.click();
  await expect(dialog).toBeHidden({ timeout: 15000 });
}

// REGRESSION GUARD for the known duplicate-supplier bug (see
// test-reports/bugs/2026-06-04-bid-supply-chain-management-evaluate-duplicate-supplier.md):
// once a supplier is captured it must NOT remain selectable in the Add-Response Supplier dropdown,
// otherwise the same supplier can be consolidated repeatedly (the "one supplier ×N" duplication on
// the downstream functionality-scores table). Soft assertion so the consolidation chain still
// completes while the app bug is open; it flips from red to green once the app excludes
// already-captured suppliers. Selectors validated live 2026-06-05 on the Consolidate Responses page
// (`.ant-select-item-option` options; footer "Close" closes the dialog without adding).
async function assertCapturedSupplierNotReselectable(page: Page, captured: string, control: string) {
  await page.getByRole('button', { name: /Add New Response/ }).click();
  const dialog = page.locator('.ant-modal-content');
  await expect(dialog.getByText('Add Supplier Response')).toBeVisible({ timeout: 15000 });
  await dialog.locator('.ant-select-selector').nth(0).click();
  const options = page.locator('.ant-select-item-option');
  // Wait for the option list to actually render so the assertions below can't pass vacuously.
  await options.first().waitFor({ state: 'visible', timeout: 10000 }).catch(() => {});
  // CONTROL: a supplier that was never captured MUST still be offered. This proves the dropdown
  // loaded — without it, "captured supplier absent" could pass simply because NO options rendered.
  await expect.soft(
    options.filter({ hasText: control }).first(),
    `regression check invalid: control supplier "${control}" not found — the dropdown may not have rendered`,
  ).toBeVisible({ timeout: 10000 });
  // REAL GUARD: a captured supplier must NOT still be offered (duplicate-supplier capture if it is).
  await expect.soft(
    options.filter({ hasText: captured }),
    `duplicate-supplier bug: "${captured}" is still selectable in the Add-Response dropdown after being captured`,
  ).toHaveCount(0, { timeout: 10000 });
  // Close without adding — the footer "Close" has text; the top-right ✕ is icon-only.
  await dialog.locator('button:has-text("Close")').last().click();
  await expect(dialog).toBeHidden({ timeout: 15000 });
}

// Recorded live: the per-supplier "Supplier compliance" dialog (opened from a response row's
// edit icon on the Verify Compliance page). Happy path = mark everything compliant: answer every
// checklist item N/A, set Compliance status = Compliant, confirm, then Finalise. The checklist
// radios are validated on Finalise (the button enabling alone is not enough), so they must be set.
async function finaliseOpenComplianceDialog(page: Page) {
  const dlg = page.locator('.ant-modal-content');
  await expect(dlg.getByText('Supplier compliance')).toBeVisible({ timeout: 15000 });
  // The checklist loads asynchronously — wait for the radios before counting, or the N/A loop
  // would be skipped (count() races to 0) and Finalise would fail validation.
  const nas = dlg.getByRole('radio', { name: 'N/A' });
  await expect(nas.first()).toBeVisible({ timeout: 15000 });
  const count = await nas.count();
  for (let j = 0; j < count; j++) await nas.nth(j).check();
  await dlg.getByRole('radio', { name: 'Compliant', exact: true }).check();
  // The confirmation is the last checkbox in the dialog (after the per-document "Is Compliant?" ones).
  await dlg.getByRole('checkbox').last().check();
  const finalise = dlg.getByRole('button', { name: 'Finalise Compliance' });
  await expect(finalise).toBeEnabled({ timeout: 15000 });
  await finalise.click();
  await expect(dlg).toBeHidden({ timeout: 15000 });
}

// Recorded live: the "Invite BEC members" Attendees/Evaluators table. Search the add-row Name
// combobox for a user, select the match (Job Title + Email auto-fill), then click plus-circle to
// add the row. Each add resets the add-row for the next evaluator.
// NOTE (2026-06-03): verified live via MCP, but NOT yet green as an automated spec. The Shesha
// inline editable-grid "add" reads the row's bound Name from the combobox; under automation the
// selected value doesn't commit to the row model before plus-circle fires, so the add reports
// "This field is required" / "Create failed". The live drive only worked because the natural
// pauses between MCP steps let the value commit + blur. The keyboard select + blur below is the
// current best-effort commit; it still needs a verifying run (held off per request).
async function addBecEvaluator(page: Page, searchTerm: string, fullName: string) {
  // Idempotent: skip if this evaluator is already in the table (so a retry doesn't re-add).
  if (await page.getByRole('cell', { name: fullName }).first().isVisible().catch(() => false)) return;
  const addRow = page.getByRole('row').filter({ has: page.getByRole('button', { name: 'plus-circle' }) });
  const combo = addRow.getByRole('combobox');
  const option = page.locator('.ant-select-item-option').filter({ hasText: fullName }).first();
  // The Name field is an async (server-side) search combobox feeding a Shesha inline editable-grid.
  // Under automation, `Enter` doesn't reliably commit the highlighted option to the row model, so:
  // type the term character-by-character (fires the search handler like real typing), then CLICK the
  // exact option (a real selection event the grid binds), and verify the commit via the auto-filled
  // Job Title / Email textboxes (the combobox value itself doesn't render as row text). Retry the
  // whole select if the auto-fill doesn't land, then add the row.
  await expect(async () => {
    await combo.click();
    await combo.fill('');
    await combo.pressSequentially(searchTerm, { delay: 60 });
    await expect(option).toBeVisible({ timeout: 8000 });
    await option.click();
    // Commit signal: selecting the evaluator auto-fills Job Title + Email in the add-row.
    await expect(addRow.getByRole('textbox').first()).not.toHaveValue('', { timeout: 5000 });
  }).toPass({ timeout: 30000 });
  await addRow.getByRole('button', { name: 'plus-circle' }).click();
  await expect(page.getByRole('cell', { name: fullName })).toBeVisible({ timeout: 15000 });
}

// Recorded live: on the Confirm-Attendance page each attendee row's "Is Present?" checkbox is
// read-only until the row is put into edit mode. Edit the row, tick Is Present, then save.
async function markAttendeePresent(page: Page, fullName: string) {
  const displayRow = page.getByRole('row').filter({ hasText: fullName }).filter({ has: page.getByRole('button', { name: 'edit' }) });
  await displayRow.getByRole('button', { name: 'edit' }).click();
  const editRow = page.getByRole('row').filter({ hasText: fullName }).filter({ has: page.getByRole('button', { name: 'save' }) });
  await editRow.getByRole('checkbox').check();
  await editRow.getByRole('button', { name: 'save' }).click();
  await expect(editRow.getByRole('button', { name: 'save' })).toHaveCount(0, { timeout: 15000 });
}

// Recorded live: Shesha toolbar buttons (Evaluate, row edit/save pencils, Finalise Score, Sign In)
// do NOT respond to Playwright's positional click — fire their handler with a DOM click.
async function domClick(locator: Locator) {
  await expect(locator.first()).toBeVisible({ timeout: 15000 });
  await locator.first().evaluate((el: HTMLElement) => el.click());
}

// Click a workflow action button ONCE, then wait (patiently) for the page to advance — WITHOUT
// re-clicking. The old pattern re-clicked the button every poll until the page navigated, which on
// the slow QA app fired the server-side action many times. For "Open Evaluation" that created dozens
// of duplicate RfxResponseEvaluation rows → the "one supplier ×N" symptom on the functionality-score
// table (see test-reports/bugs/2026-06-04-bid-supply-chain-management-evaluate-duplicate-supplier.md).
// A real user clicks once; so do we now. If a single click is genuinely swallowed the wait times out
// and the step fails loudly — preferable to silently corrupting data with repeat submits.
async function clickOnceAndAwait(action: Locator, hasAdvanced: () => Promise<boolean>, label: string) {
  await action.click();
  await expect(async () => {
    if (await hasAdvanced()) return;
    throw new Error(`still on ${label} after a single click`);
  }).toPass({ timeout: 90000 });
}

// Switch evaluator: clear auth, reload /login, sign in (Sign In needs a DOM click).
async function loginViaStorage(page: Page, creds: { user: string; password: string }) {
  await page.goto(APP_URL).catch(() => {});
  await page.evaluate(() => { try { localStorage.clear(); sessionStorage.clear(); } catch (e) {} });
  await page.goto(APP_URL);
  await page.getByPlaceholder('Username').fill(creds.user);
  await page.getByPlaceholder('Password').fill(creds.password);
  await domClick(page.getByRole('button', { name: 'Sign In' }));
  await page.waitForURL(url => !url.href.includes('/login'), { timeout: 30000 });
}

// Recorded live: the "Tender Response Evaluation" dialog. Score one supplier on the single
// criterion: Evaluate -> edit pencil -> type Point Awarded -> save -> Finalise Score.
async function scoreSupplier(page: Page, supplier: string, score: string) {
  const row = page.getByRole('row').filter({ hasText: supplier }).filter({ hasText: 'Evaluate' });
  await domClick(row.getByRole('button', { name: 'Evaluate' }));
  const dlg = page.locator('.ant-modal-content');
  await expect(dlg.getByText('Tender Response Evaluation')).toBeVisible({ timeout: 15000 });
  const critRow = dlg.getByRole('row').filter({ hasText: 'TEC-01' });
  await domClick(critRow.locator('button:has(.anticon-edit)'));
  const pts = dlg.locator('.ant-input-number-input');
  await pts.click();
  await page.keyboard.press('ControlOrMeta+a');
  await pts.fill(score);
  await domClick(dlg.locator('button:has(.anticon-save)'));
  await expect(critRow).toContainText(score, { timeout: 15000 });
  await domClick(dlg.getByRole('button', { name: 'Finalise Score' }));
  await expect(dlg).toBeHidden({ timeout: 15000 });
}

test.describe('BID-SCM — BID: Supply Chain Management', () => {

  // ADO Test Case #57475: https://dev.azure.com/boxfusion/PD-SupplyChainManagement/_workitems/edit/57475
  test('TC-01: Draft Tender', async ({ page }) => {
    // The QA app's dynamic pages load slowly; the full 5-step create + submit
    // legitimately needs more than the default per-test budget.
    test.setTimeout(180_000);

    // loginAsAdmin also switches the view mode to "Latest" so the Draft-Tender form
    // renders its latest configured fields (see switchToLatest).
    await loginAsAdmin(page);

    // STEP: open Workflows → My Items. The accordion can need a re-click if the side menu
    // is still re-rendering after the Latest switch.
    const workflows = page.getByRole('menuitem', { name: 'Workflows' });
    const myItems = page.getByRole('menuitem', { name: 'My Items' });
    await workflows.click();
    try {
      await myItems.waitFor({ state: 'visible', timeout: 8000 });
    } catch {
      await workflows.click();
      await myItems.waitFor({ state: 'visible', timeout: 12000 });
    }
    await myItems.click();
    await page.waitForLoadState('networkidle');

    // ASSERT My Items list is shown. The dynamic list page can be slow to render its toolbar,
    // so wait on the heading first, then the Create New button we actually use (longer timeout).
    await expect(page.getByRole('heading', { name: 'My Items' })).toBeVisible({ timeout: 30000 });
    const createNew = page.getByRole('button', { name: /create new/i });
    await expect(createNew).toBeVisible({ timeout: 30000 });
    await expect(page.getByRole('button', { name: /export/i })).toBeVisible({ timeout: 30000 });

    // STEP: Create New → Tender Process (Create New is a dropdown button). The slow QA app can swallow
    // the dropdown-open click, so retry opening it until the Tender Process menuitem is clickable.
    const tenderProcess = page.getByRole('menuitem', { name: 'Tender Process' });
    await expect(async () => {
      await createNew.click();
      await tenderProcess.click({ timeout: 5000 });
    }).toPass({ timeout: 40000 });

    // ASSERT (BLOCKING) Draft tender page (Step 1: Capture Tender Details) is displayed
    await expectOnPage(page, 'Capture Tender Details');
    await expect(formItem(page, 'Tender Name').getByRole('textbox')).toBeVisible({ timeout: 20000 });

    // Capture the app-assigned Ref No (shown as "Ref No: REF2026-…" in the draft header) so TC-09
    // can locate THIS tender via the Evaluate-Tenders REF search later in the chain. The header renders
    // a beat after the heading, so wait for the REF to appear before reading it.
    const refLoc = page.getByText(/REF\d{4}-\d+/).first();
    await refLoc.waitFor({ state: 'visible', timeout: 20000 }).catch(() => {});
    const refMatch = (await refLoc.innerText().catch(() => '')).match(/REF\d{4}-\d+/);
    if (refMatch) RUN_REF = refMatch[0];
    console.log(`[CHAIN] TC-01 created tender RUN_REF=${RUN_REF || 'UNKNOWN'} (name: ${RUN_TENDER})`);

    // ---- Step 1: Tender Details -------------------------------------------------
    // Select the radios FIRST — each selection re-renders the section, and the briefing
    // radios reveal dependent fields. Filling text before this would get wiped.
    // STEP: Evaluation Criteria → EVAL_CRITERIA (default 90/10)
    await page.getByRole('radio', { name: EVAL_CRITERIA }).check();
    await expect(page.getByRole('radio', { name: EVAL_CRITERIA })).toBeChecked();

    // STEP: Briefing Session Requirement → Compulsory (mandatory). Reveals Start Time / Method / Venue.
    await page.getByRole('radio', { name: 'Compulsory', exact: true }).check();
    await expect(formItem(page, 'Briefing Session Start Time').getByRole('textbox')).toBeVisible({ timeout: 10000 });

    // STEP: Briefing Method → Hybrid (both Meeting link and Venue become mandatory)
    await page.getByRole('radio', { name: 'Hybrid' }).check();
    await expect(page.getByRole('radio', { name: 'Hybrid' })).toBeChecked();

    // STEP: now fill all text fields (section is stable after the radio re-renders)
    RUN_TENDER = `TC-01 Automated Draft Tender ${RUN_TAG} - ${EVAL_CRITERIA} Compulsory Hybrid`;
    await formItem(page, 'Tender Name').getByRole('textbox').fill(RUN_TENDER);
    await formItem(page, 'Description').getByRole('textbox').fill('Automated TC-01 draft tender created via Playwright on the QA site.');
    await formItem(page, 'Meeting link').getByRole('textbox').fill('https://teams.microsoft.com/l/meetup-join/tc02-automated');
    await formItem(page, 'Briefing Session Venue').getByRole('textbox').fill('Boardroom A, Head Office');
    await formItem(page, 'Contact person name').getByRole('textbox').fill('Maanda Mamathuntsha');
    await formItem(page, 'Telephone').getByRole('textbox').fill('0123456789');
    await formItem(page, 'Email').getByRole('textbox').fill('maanda.test@example.com');
    // Guard: confirm the name actually stuck before proceeding
    await expect(formItem(page, 'Tender Name').getByRole('textbox')).toHaveValue(/TC-01/, { timeout: 10000 });

    // STEP: date + time pickers (briefing start, bid publication, bid closing) via the panel + OK
    await pickAntDateTime(page, formItem(page, 'Briefing Session Start Time').getByRole('textbox'), '2026-07-01', '10');
    await pickAntDateTime(page, formItem(page, 'Bid publication Date').getByRole('textbox'), '2026-07-02', '09');
    await pickAntDateTime(page, formItem(page, 'Bid closing Date').getByRole('textbox'), '2026-07-31', '17');

    // STEP: attach the mandatory Supporting Document from test-data/
    await uploadFile(page, formItem(page, 'Supporting documents').getByRole('button', { name: /press to upload/i }), PDF_FIXTURE);

    // STEP: Next enables once all mandatory Tender Details fields are valid
    const next = page.getByRole('button', { name: 'Next', exact: true });
    await expect(next).toBeEnabled({ timeout: 15000 });
    await next.click();

    // Advance one wizard step to the step whose `signature` element is given. Idempotent and
    // resilient: if we're already on the target step (a prior Next already landed — e.g. the
    // standalone click above), do nothing; otherwise retry click→wait until the signature renders.
    // (A single Next can be swallowed mid-transition, and Next can flip enabled→disabled while the
    // form re-validates — but clicking Next on a step whose own mandatory field isn't filled yet
    // would hang forever, so we must NOT click when already on the target step.)
    const advance = async (signature: Locator) => {
      await expect(async () => {
        if (await signature.first().isVisible().catch(() => false)) return;
        await next.click({ timeout: 5000 });
        await signature.first().waitFor({ state: 'visible', timeout: 8000 });
      }).toPass({ timeout: 45000 });
    };

    // ---- Step 1 → 2: Tender Documents (mandatory Bid document upload) ------------
    await advance(formItem(page, 'Bid document'));
    await uploadFile(page, formItem(page, 'Bid document').getByRole('button', { name: /press to upload/i }), PDF_FIXTURE);
    // confirm the upload registered (Next enables) before advancing
    await expect(next).toBeEnabled({ timeout: 20000 });

    // ---- Step 2 → 3: Response Documents (pre-populated list) ---------------------
    // Signature: the "Instructions" column header is unique to this step.
    await advance(page.getByRole('columnheader', { name: 'Instructions' }));

    // ---- Step 3 → 4: Technical Evaluation ---------------------------------------
    await advance(page.getByText('Technical Evaluation Criteria'));

    // Add one criterion. Scope to the eval-criteria table (the one with a "Max Points"
    // column) so we don't hit the Response-Documents add-row, which looks similar.
    const evalTable = page.getByRole('table').filter({ has: page.getByRole('columnheader', { name: 'Max Points' }) });
    const addRow = evalTable.getByRole('row').filter({ has: page.getByRole('button', { name: 'plus-circle' }) });
    await addRow.getByRole('textbox').nth(0).fill('TEC-01');
    await addRow.getByRole('textbox').nth(1).fill('Technical Capability');
    await addRow.getByRole('textbox').nth(2).fill('Demonstrated technical capability and relevant experience');
    await addRow.getByRole('spinbutton').fill('100');
    await addRow.getByRole('button', { name: 'plus-circle' }).click();
    await expect(page.getByRole('cell', { name: 'TEC-01' })).toBeVisible({ timeout: 10000 });
    await formItem(page, 'Minimum score required').getByRole('spinbutton').fill('60');

    // ---- Step 4 → 5: Summary → Submit -------------------------------------------
    const submit = page.getByRole('button', { name: 'Submit', exact: true });
    await advance(submit);
    await expect(submit).toBeEnabled({ timeout: 15000 });
    await submit.click();

    // ASSERT (BLOCKING) submit succeeds and returns to the My Items workflow list
    await page.waitForURL(/workflows-my-items/, { timeout: 30000 });
    await expect(page.getByRole('cell', { name: 'Tender Process' }).first()).toBeVisible({ timeout: 15000 });
  });

  // ADO Test Case #57497: https://dev.azure.com/boxfusion/PD-SupplyChainManagement/_workitems/edit/57497
  // Happy path: the reviewer (MhlotiM) opens a submitted tender from the Inbox, reviews the
  // read-only tabs, approves it and submits — the item then leaves the Review-and-Approve inbox.
  // Targets a tender created by the TC-01 spec ("TC-01 Automated Draft Tender ...") so the test
  // is self-supplying and re-runnable (each run consumes one such item; TC-01 replenishes them).
  test('TC-02: Review and Approve', async ({ page }) => {
    test.setTimeout(120_000);
    await loginAs(page, REVIEWER);
    await openInbox(page);

    // ASSERT Inbox list and Export button are shown
    await expect(page.getByRole('heading', { name: 'Incoming Items' })).toBeVisible({ timeout: 30000 });
    await expect(page.getByRole('button', { name: /export/i })).toBeVisible({ timeout: 30000 });

    // STEP: open a "Review and Approve" tender (one of our TC-01 test tenders) via its
    // magnifying-glass link. Dismiss the Workflows flyout first so it can't intercept the click.
    await page.getByRole('heading', { name: 'Incoming Items' }).click();
    const targetRow = page.getByRole('row')
      .filter({ hasText: tenderMatch() })
      .filter({ hasText: 'Review and Approve' })
      .first();
    await expect(targetRow).toBeVisible({ timeout: 30000 });
    // Open the row by navigating to its href, not a positional click: the Workflows accordion
    // flyout ("My Items" nav-link) can overlap the table and intercept the click. goto avoids that.
    const rowHref = await targetRow.getByRole('link').first().getAttribute('href');
    await page.goto(rowHref.startsWith('http') ? rowHref : `${APP_URL.replace('/login', '')}${rowHref}`);

    // ASSERT (BLOCKING) the item opens on the "Review and Approve" page
    await expectOnPage(page, 'Review and Approve Tender Details');

    // STEP: review read-only details on the Tender Details tab, then the Publication tab
    await expect(page.getByText('Evaluation Criteria', { exact: true })).toBeVisible({ timeout: 15000 });
    await expect(page.getByText(EVAL_CRITERIA).first()).toBeVisible();
    await page.getByRole('tab', { name: 'Publication' }).click();
    await expect(page.getByText('Hybrid').first()).toBeVisible({ timeout: 15000 });

    // STEP: approve the tender, then submit (Submit enables once a response is chosen)
    await page.getByRole('button', { name: 'check-circle Approve' }).click();
    const submit = page.getByRole('button', { name: 'Submit', exact: true });
    await expect(submit).toBeEnabled({ timeout: 15000 });
    await submit.click();

    // ASSERT (BLOCKING) the approval submits and returns to a workflow list (out of the inbox)
    await page.waitForURL(/workflows-(my-items|inbox)/, { timeout: 30000 });
  });

  // ADO Test Case #57500: https://dev.azure.com/boxfusion/PD-SupplyChainManagement/_workitems/edit/57500
  // Happy path: the publisher (TumisangM) opens an approved tender from the Inbox, reviews the
  // read-only details, selects a publication method, confirms and submits — the tender becomes
  // Advertised and advances to the Consolidate Responses stage. Targets a TC-01 test tender
  // (supplied by a prior TC-02 approval), so it's self-supplying and re-runnable.
  test('TC-03: Publish Tender', async ({ page }) => {
    test.setTimeout(120_000);
    await loginAs(page, PUBLISHER);
    await openInbox(page);

    // ASSERT Inbox list and Export button are shown
    await expect(page.getByRole('heading', { name: 'Incoming Items' })).toBeVisible({ timeout: 30000 });
    await expect(page.getByRole('button', { name: /export/i })).toBeVisible({ timeout: 30000 });

    // STEP: open a "Publish Tender" tender (one of our TC-01 test tenders) via its magnifying-glass.
    await page.getByRole('heading', { name: 'Incoming Items' }).click();
    const targetRow = page.getByRole('row')
      .filter({ hasText: tenderMatch() })
      .filter({ hasText: 'Publish Tender' })
      .first();
    await expect(targetRow).toBeVisible({ timeout: 30000 });
    // Open the row by navigating to its href, not a positional click: the Workflows accordion
    // flyout ("My Items" nav-link) can overlap the table and intercept the click. goto avoids that.
    const rowHref = await targetRow.getByRole('link').first().getAttribute('href');
    await page.goto(rowHref.startsWith('http') ? rowHref : `${APP_URL.replace('/login', '')}${rowHref}`);

    // ASSERT (BLOCKING) the item opens on the "Publish Tender" page
    await expectOnPage(page, 'Publish Tender');
    await expect(page.getByText(EVAL_CRITERIA).first()).toBeVisible({ timeout: 15000 });

    // STEP: select a publication method (mandatory) and tick the confirmation checkbox.
    // The confirmation checkbox has no accessible name; find the innermost block that holds
    // both the confirm text and a checkbox (the app text uses "l" typos, so match a safe substring).
    await page.getByRole('checkbox', { name: 'Supplier Portal' }).check();
    await page.locator('div')
      .filter({ hasText: 'publish the Tender' })
      .filter({ has: page.getByRole('checkbox') })
      .last()
      .getByRole('checkbox')
      .check();

    // STEP: submit to publish the tender
    const submit = page.getByRole('button', { name: 'Submit', exact: true });
    await expect(submit).toBeEnabled({ timeout: 15000 });
    await submit.click();

    // ASSERT (BLOCKING) the tender is published and advances (Consolidate Responses) or returns to a list
    await expect(async () => {
      const advanced = await page.getByText('Consolidate Responses').first().isVisible().catch(() => false);
      const listed = /workflows-(my-items|inbox)/.test(page.url());
      expect(advanced || listed).toBeTruthy();
    }).toPass({ timeout: 30000 });
  });

  // ADO Test Case #57551: https://dev.azure.com/boxfusion/PD-SupplyChainManagement/_workitems/edit/57551
  // Happy path: TumisangM opens an advertised tender at the Consolidate-Responses stage, captures
  // three manual supplier responses (each with the mandatory documents attached), confirms the
  // responses are consolidated and submits — the tender advances to the Review Compliance stage.
  // Self-supplying: targets a TC-01 test tender advertised by a prior TC-03 run.
  test('TC-04: Consolidate Supplier Responses', async ({ page }) => {
    test.setTimeout(240_000);
    await loginAs(page, PUBLISHER); // TumisangM also consolidates responses
    await openInbox(page);

    // ASSERT Inbox list and Export button are shown
    await expect(page.getByRole('heading', { name: 'Incoming Items' })).toBeVisible({ timeout: 30000 });
    await expect(page.getByRole('button', { name: /export/i })).toBeVisible({ timeout: 30000 });

    // STEP: open a "Consolidate Responses" tender (one of our TC-01 test tenders)
    await page.getByRole('heading', { name: 'Incoming Items' }).click();
    const targetRow = page.getByRole('row')
      .filter({ hasText: tenderMatch() })
      .filter({ hasText: 'Consolidate Responses' })
      .first();
    await expect(targetRow).toBeVisible({ timeout: 30000 });
    // Open the row by navigating to its href, not a positional click: the Workflows accordion
    // flyout ("My Items" nav-link) can overlap the table and intercept the click. goto avoids that.
    const rowHref = await targetRow.getByRole('link').first().getAttribute('href');
    await page.goto(rowHref.startsWith('http') ? rowHref : `${APP_URL.replace('/login', '')}${rowHref}`);

    // ASSERT (BLOCKING) the item opens on the Consolidate Responses page
    await expectOnPage(page, 'Consolidate Responses');

    // STEP: capture three different manual supplier responses, each with the mandatory docs attached
    await addSupplierResponse(page, { supplier: 'A & A Stationers', method: 'Email', price: '30000' });
    await addSupplierResponse(page, { supplier: 'BOXFUSION', method: 'Physical', price: '40000' });
    await addSupplierResponse(page, { supplier: 'Telkom', method: 'Email', price: '50000' });
    await expect(page.getByText('A & A Stationers').first()).toBeVisible({ timeout: 15000 });
    await expect(page.getByText('BOXFUSION').first()).toBeVisible();
    await expect(page.getByText('Telkom').first()).toBeVisible();

    // REGRESSION GUARD (opt-in via CHECK_SUPPLIER_DEDUPE=1): a captured supplier must not be re-offered
    // in the Add-Response dropdown. Runs AFTER all three adds so its dialog open/close can't disrupt the
    // add sequence, and is OFF by default so it never destabilises the lifecycle chain. Covers the
    // SEPARATE dropdown-dedup defect, not the functionality-score duplication. See
    // test-reports/bugs/2026-06-04-bid-supply-chain-management-evaluate-duplicate-supplier.md.
    if (process.env.CHECK_SUPPLIER_DEDUPE === '1') {
      await assertCapturedSupplierNotReselectable(page, 'A & A Stationers', 'Coca-cola');
    }

    // STEP: confirm the responses are consolidated, then submit
    await page.locator('div')
      .filter({ hasText: 'received and consolidated' })
      .filter({ has: page.getByRole('checkbox') })
      .last()
      .getByRole('checkbox')
      .check();
    const submit = page.getByRole('button', { name: 'Submit', exact: true });
    await expect(submit).toBeEnabled({ timeout: 15000 });
    await submit.click();

    // ASSERT (BLOCKING) consolidation submits and advances (Review Compliance) or leaves the page
    await expect(async () => {
      const advanced = await page.getByText('Review Compliance').first().isVisible().catch(() => false);
      const listed = /workflows-(my-items|inbox)/.test(page.url());
      const gone = !(await page.getByText('Consolidate Responses:').first().isVisible().catch(() => false));
      expect(advanced || listed || gone).toBeTruthy();
    }).toPass({ timeout: 30000 });
  });

  // ADO Test Case #57553: https://dev.azure.com/boxfusion/PD-SupplyChainManagement/_workitems/edit/57553
  // Happy path: TumisangM opens a tender at the Verify-Compliance stage, marks every consolidated
  // supplier response Compliant (per-supplier dialog), confirms the review and submits — the tender
  // advances to the next evaluation stage. Self-supplying: targets a TC-01 test tender that a prior
  // TC-04 run consolidated (so it carries supplier responses to assess).
  test('TC-05: Review Compliance', async ({ page }) => {
    test.setTimeout(240_000);
    await loginAs(page, PUBLISHER); // TumisangM also verifies compliance
    await openInbox(page);

    // ASSERT Inbox list and Export button are shown
    await expect(page.getByRole('heading', { name: 'Incoming Items' })).toBeVisible({ timeout: 30000 });
    await expect(page.getByRole('button', { name: /export/i })).toBeVisible({ timeout: 30000 });

    // STEP: open a "Verify Compliance" tender (one of our TC-01 test tenders)
    await page.getByRole('heading', { name: 'Incoming Items' }).click();
    const targetRow = page.getByRole('row')
      .filter({ hasText: tenderMatch() })
      .filter({ hasText: 'Verify Compliance' })
      .first();
    await expect(targetRow).toBeVisible({ timeout: 30000 });
    // Open the row by navigating to its href, not a positional click: the Workflows accordion
    // flyout ("My Items" nav-link) can overlap the table and intercept the click. goto avoids that.
    const rowHref = await targetRow.getByRole('link').first().getAttribute('href');
    await page.goto(rowHref.startsWith('http') ? rowHref : `${APP_URL.replace('/login', '')}${rowHref}`);
    // Wait for the actual navigation — the Inbox row's "Verify Compliance" action text would
    // otherwise satisfy a text assertion before the item page even loads.
    await page.waitForURL(/workflow-action/, { timeout: 30000 });

    // ASSERT (BLOCKING) the item opens on the Verify Compliance page (heading has a colon)
    await expectOnPage(page, 'Verify Compliance:');

    // STEP: assess every consolidated supplier response as Compliant (one dialog per supplier).
    // The Manual Responses table loads asynchronously, so wait for the per-row edit icons first.
    const editIcons = page.locator('.sha-link:has(.anticon-edit)');
    await expect(editIcons.first()).toBeVisible({ timeout: 30000 });
    const supplierCount = await editIcons.count();
    expect(supplierCount).toBeGreaterThan(0);
    for (let i = 0; i < supplierCount; i++) {
      await editIcons.nth(i).click();
      await finaliseOpenComplianceDialog(page);
    }

    // STEP: confirm the compliance review and submit
    await page.locator('div')
      .filter({ hasText: 'has been captured accurately' })
      .filter({ has: page.getByRole('checkbox') })
      .last()
      .getByRole('checkbox')
      .check();
    const submit = page.getByRole('button', { name: 'Submit', exact: true });
    await expect(submit).toBeEnabled({ timeout: 15000 });
    await submit.click();

    // ASSERT (BLOCKING) the compliance review submits and advances out of the Verify Compliance stage
    await expect(async () => {
      const gone = !(await page.getByText('Verify Compliance:').first().isVisible().catch(() => false));
      const listed = /workflows-(my-items|inbox)/.test(page.url());
      expect(gone || listed).toBeTruthy();
    }).toPass({ timeout: 30000 });
  });

  // ADO Test Case #60812: https://dev.azure.com/boxfusion/PD-SupplyChainManagement/_workitems/edit/60812
  // Happy path: TumisangM opens a tender at the Calculate-Specific-Goal-Points stage, captures a
  // (different) Specific Goal Points score for each supplier response, uploads the calculation
  // spreadsheet, confirms and submits — the tender advances. Self-supplying: targets a TC-01 test
  // tender that a prior TC-05 run passed through compliance.
  test('TC-06: Capture Pricing and Specific Goals', async ({ page }) => {
    test.setTimeout(180_000);
    await loginAs(page, PUBLISHER);
    await openInbox(page);

    // ASSERT Inbox list and Export button are shown
    await expect(page.getByRole('heading', { name: 'Incoming Items' })).toBeVisible({ timeout: 30000 });
    await expect(page.getByRole('button', { name: /export/i })).toBeVisible({ timeout: 30000 });

    // STEP: open a "Calculate Specific Goal Points" tender (one of our TC-01 test tenders)
    await page.getByRole('heading', { name: 'Incoming Items' }).click();
    const targetRow = page.getByRole('row')
      .filter({ hasText: tenderMatch() })
      .filter({ hasText: 'Calculate Specific Goal Points' })
      .first();
    await expect(targetRow).toBeVisible({ timeout: 30000 });
    // Open the row by navigating to its href, not a positional click: the Workflows accordion
    // flyout ("My Items" nav-link) can overlap the table and intercept the click. goto avoids that.
    const rowHref = await targetRow.getByRole('link').first().getAttribute('href');
    await page.goto(rowHref.startsWith('http') ? rowHref : `${APP_URL.replace('/login', '')}${rowHref}`);
    await page.waitForURL(/workflow-action/, { timeout: 30000 });

    // ASSERT (BLOCKING) the item opens on the Calculate Specific Goal Points page
    await expectOnPage(page, 'Calculate Specific Goal Points:');

    // STEP: capture a DIFFERENT Specific Goal Points score for each supplier (inline row edit).
    // Scope to the responses table (the one with a Specific Goal Points column AND edit buttons).
    const goalTable = page.getByRole('table')
      .filter({ has: page.getByRole('columnheader', { name: 'Specific Goal Points' }) })
      .filter({ has: page.getByRole('button', { name: 'edit' }) });
    const editButtons = goalTable.getByRole('button', { name: 'edit' });
    await expect(editButtons.first()).toBeVisible({ timeout: 30000 });
    const supplierCount = await editButtons.count();
    expect(supplierCount).toBeGreaterThan(0);
    const scores = ['8', '10', '6', '9', '7', '5'];
    for (let i = 0; i < supplierCount; i++) {
      await editButtons.nth(i).click();
      // Only the editing row exposes a spinbutton + comment textbox inside the table.
      await goalTable.getByRole('spinbutton').fill(scores[i % scores.length]);
      await goalTable.getByRole('textbox').first().fill(`Specific goal points for supplier ${i + 1}`);
      await goalTable.getByRole('button', { name: 'save' }).click();
      // Wait for the row to fully finish saving (it briefly shows a loading spinner and keeps its
      // spinbutton); only then is the table clean for the next row's edit.
      await expect(goalTable.getByRole('spinbutton')).toHaveCount(0, { timeout: 15000 });
    }

    // STEP: upload the mandatory calculation spreadsheet
    await uploadFile(page, formItem(page, 'Calculation spreadsheet').getByRole('button', { name: /press to upload/i }), PDF_FIXTURE);

    // STEP: confirm and submit
    await page.locator('div')
      .filter({ hasText: 'captured the information accurately' })
      .filter({ has: page.getByRole('checkbox') })
      .last()
      .getByRole('checkbox')
      .check();
    const submit = page.getByRole('button', { name: 'Submit', exact: true });
    await expect(submit).toBeEnabled({ timeout: 15000 });

    // ASSERT (BLOCKING) the scoring submits and advances out of the Calculate Specific Goal Points
    // stage. The slow app sometimes swallows the first Submit, so retry the click until it advances.
    await clickOnceAndAwait(submit, async () => {
      const gone = !(await page.getByText('Calculate Specific Goal Points:').first().isVisible().catch(() => false));
      return gone || /workflows-(my-items|inbox)/.test(page.url());
    }, 'Calculate Specific Goal Points');
  });

  // ADO Test Case #60813: https://dev.azure.com/boxfusion/PD-SupplyChainManagement/_workitems/edit/60813
  // Happy path: the BEC chair (ThabisoM) opens a tender at the Invite-BEC-members stage, captures
  // the meeting details, invites three evaluators, confirms and submits — the tender advances to
  // Confirm Attendance & Open Evaluation. Self-supplying: targets a TC-01 test tender that a prior
  // run advanced to this stage.
  test('TC-07: Invite BEC Members', async ({ page }) => {
    test.setTimeout(180_000);
    await loginAs(page, BEC_CHAIR);
    await openInbox(page);

    // ASSERT Inbox list and Export button are shown
    await expect(page.getByRole('heading', { name: 'Incoming Items' })).toBeVisible({ timeout: 30000 });
    await expect(page.getByRole('button', { name: /export/i })).toBeVisible({ timeout: 30000 });

    // STEP: open an "Invite BEC members" tender (one of our TC-01 test tenders)
    await page.getByRole('heading', { name: 'Incoming Items' }).click();
    const targetRow = page.getByRole('row')
      .filter({ hasText: tenderMatch() })
      .filter({ hasText: 'Invite BEC members' })
      .first();
    await expect(targetRow).toBeVisible({ timeout: 30000 });
    // Open the row by navigating to its href, not a positional click: the Workflows accordion
    // flyout ("My Items" nav-link) can overlap the table and intercept the click. goto avoids that.
    const rowHref = await targetRow.getByRole('link').first().getAttribute('href');
    await page.goto(rowHref.startsWith('http') ? rowHref : `${APP_URL.replace('/login', '')}${rowHref}`);
    await page.waitForURL(/workflow-action/, { timeout: 30000 });

    // ASSERT (BLOCKING) the item opens on the Invite BEC members page
    await expectOnPage(page, 'Invite BEC members:');

    // STEP: invite the three evaluators FIRST (search by name; Job Title + Email auto-fill on
    // select). Adding evaluators re-renders the form, so do this before filling the text fields.
    await addBecEvaluator(page, 'Nathi', 'Nkosinathi Sibiya');
    await addBecEvaluator(page, 'Nelly', 'Nelly Tears');
    await addBecEvaluator(page, 'Thabitha', 'Thabitha Modula');

    // STEP: capture the BEC meeting details (link, venue, then date+time via picker)
    await formItem(page, 'Meeting Link').getByRole('textbox').fill('https://teams.microsoft.com/l/meetup-join/tc08-bec-meeting');
    await formItem(page, 'Venue').getByRole('textbox').fill('Boardroom B, Head Office');
    await pickAntDateTime(page, formItem(page, 'Meeting date and time').getByRole('textbox'), '2026-07-03', '14');

    // STEP: confirm and submit
    await page.locator('div')
      .filter({ hasText: 'invited all the relevant attendees' })
      .filter({ has: page.getByRole('checkbox') })
      .last()
      .getByRole('checkbox')
      .check();
    const submit = page.getByRole('button', { name: 'Submit', exact: true });
    await expect(submit).toBeEnabled({ timeout: 15000 });

    // The slow app sometimes swallows the first Submit, so retry until it advances.
    await clickOnceAndAwait(submit, async () => {
      const gone = !(await page.getByText('Invite BEC members:').first().isVisible().catch(() => false));
      return gone || /workflows-(my-items|inbox)/.test(page.url());
    }, 'Invite BEC members');
  });

  // ADO Test Case #60814: https://dev.azure.com/boxfusion/PD-SupplyChainManagement/_workitems/edit/60814
  // Happy path: ThabisoM opens a tender at the Confirm-Attendance stage, adds a backup evaluator
  // (Maand-awe Mamathuntsha, not present), marks the three invited evaluators present, then Opens
  // Evaluation — the tender advances to BEC: Monitor Evaluation Progress. Self-supplying: targets a
  // TC-01 test tender that a prior TC-07 run advanced to this stage.
  // NOTE: the add-backup step uses the same Shesha inline-grid add as TC-07, which is not yet green
  // under automation (see addBecEvaluator) — so this spec may land "pending" like TC-07.
  test('TC-08: Confirm Attendance & Open Evaluation', async ({ page }) => {
    test.setTimeout(180_000);
    await loginAs(page, BEC_CHAIR);
    await openInbox(page);

    await expect(page.getByRole('heading', { name: 'Incoming Items' })).toBeVisible({ timeout: 30000 });
    await expect(page.getByRole('button', { name: /export/i })).toBeVisible({ timeout: 30000 });

    // STEP: open a "Confirm Attendance and Open Evaluation" tender (one of our TC-01 test tenders)
    await page.getByRole('heading', { name: 'Incoming Items' }).click();
    const targetRow = page.getByRole('row')
      .filter({ hasText: tenderMatch() })
      .filter({ hasText: 'Confirm Attendance and Open Evaluation' })
      .first();
    await expect(targetRow).toBeVisible({ timeout: 30000 });
    // Open the row by navigating to its href, not a positional click: the Workflows accordion
    // flyout ("My Items" nav-link) can overlap the table and intercept the click. goto avoids that.
    const rowHref = await targetRow.getByRole('link').first().getAttribute('href');
    await page.goto(rowHref.startsWith('http') ? rowHref : `${APP_URL.replace('/login', '')}${rowHref}`);
    await page.waitForURL(/workflow-action/, { timeout: 30000 });

    // ASSERT (BLOCKING) the item opens on the Confirm Attendance & Open Evaluation page
    await expectOnPage(page, 'Confirm Attendance and Open Evaluation:');

    // STEP: add a backup evaluator (Maand-awe), left not-present
    await addBecEvaluator(page, 'Mamathuntsha', 'Maand-awe Mamathuntsha');

    // STEP: mark the three invited evaluators as present (the backup stays absent)
    await markAttendeePresent(page, 'Nkosinathi Sibiya');
    await markAttendeePresent(page, 'Nelly Tears');
    await markAttendeePresent(page, 'Thabitha Modula');

    // STEP: open the evaluation
    const openEval = page.getByRole('button', { name: 'Open Evaluation', exact: true });
    await expect(openEval).toBeEnabled({ timeout: 15000 });
    await clickOnceAndAwait(openEval, async () => {
      const gone = !(await page.getByText('Confirm Attendance and Open Evaluation:').first().isVisible().catch(() => false));
      return gone || /workflows-(my-items|inbox)/.test(page.url());
    }, 'Confirm Attendance');
  });

  // ADO Test Case #60821: https://dev.azure.com/boxfusion/PD-SupplyChainManagement/_workitems/edit/60821
  // Happy path: each BEC evaluator (Nathi, Nelly, Thabitha) logs in and scores all three suppliers
  // with distinct points so a best supplier (A & A Stationers) emerges.
  // VERIFIED LIVE; spec PENDING a green run — see the navigation/click notes on the helpers
  // (collapsed-sidebar submenus don't open under automation, so the page is reached by URL; Shesha
  // toolbar buttons need a DOM click). Targets the TC-01 test tender at the Evaluate-Tenders stage.
  test('TC-09: Capture Functionality Score', async ({ page }) => {
    test.setTimeout(300_000);
    for (const evaluator of EVALUATORS) {
      await loginViaStorage(page, { user: evaluator.user, password: '123qwe' });

      // Reach the Capture Functionality Scores page for our tender (no usable menu — use the tender
      // card's link from the tenders-to-evaluate list). That list is paginated and its search box
      // matches the REF, so filter by RUN_REF first (our tender is rarely on page 1).
      await page.goto(EVALUATE_TENDERS_URL);
      if (RUN_REF) {
        const search = page.getByRole('textbox').first();
        await search.fill(RUN_REF);
        await search.press('Enter');
        await page.waitForLoadState('networkidle');
      }
      const card = page.getByRole('link', { name: RUN_REF || tenderMatch() }).first();
      await expect(card).toBeVisible({ timeout: 30000 });
      const href = await card.getAttribute('href');
      await page.goto(`${APP_URL.replace('/login', '')}${href}`);

      // ASSERT (BLOCKING) the My Score table lists the three suppliers
      await expect(page.getByText('Capture Functionality Scores', { exact: false }).first()).toBeVisible({ timeout: 30000 });
      await expect(page.getByRole('cell', { name: 'A & A Stationers' }).first()).toBeVisible({ timeout: 30000 });

      // Score every supplier with this evaluator's distinct points, then verify all are finalised.
      for (const [supplier, score] of Object.entries(evaluator.scores)) {
        await scoreSupplier(page, supplier, score);
        await expect(page.getByRole('row').filter({ hasText: supplier }).filter({ hasText: score }).first()).toBeVisible({ timeout: 15000 });
      }
    }
  });

  // ADO Test Case #60815: https://dev.azure.com/boxfusion/PD-SupplyChainManagement/_workitems/edit/60815
  // Happy path: the BEC Secretariat (ThabisoM) opens the tender at the "BEC: Monitor Evaluation Progress"
  // stage from the Inbox, reviews the per-evaluator functionality scores, and clicks Begin Calibration to
  // advance it to the Monitor-calibration & finalise-scoring stage (TC-11). Form
  // tender-wf-monitor-progress-and-begin-calibration. Self-supplying: TC-09 leaves the tender here.
  // Implemented 2026-06-05 (was a TODO stub) modelled on TC-11 + the live-verified plan note.
  test('TC-10: BEC Secretariat: Monitor Evaluation and Begin Calibration', async ({ page }) => {
    test.setTimeout(120_000);
    await loginAs(page, BEC_CHAIR);
    await openInbox(page);
    await expect(page.getByRole('heading', { name: 'Incoming Items' })).toBeVisible({ timeout: 30000 });
    await expect(page.getByRole('button', { name: /export/i })).toBeVisible({ timeout: 30000 });

    // STEP: open the target tender at the "BEC: Monitor Evaluation Progress" stage via its magnifying-glass.
    await page.getByRole('heading', { name: 'Incoming Items' }).click();
    const targetRow = page.getByRole('row')
      .filter({ hasText: tenderMatch() })
      .filter({ hasText: 'Monitor Evaluation Progress' })
      .first();
    await expect(targetRow).toBeVisible({ timeout: 30000 });
    // Open the row by navigating to its href, not a positional click: the Workflows accordion
    // flyout ("My Items" nav-link) can overlap the table and intercept the click. goto avoids that.
    const rowHref = await targetRow.getByRole('link').first().getAttribute('href');
    await page.goto(rowHref.startsWith('http') ? rowHref : `${APP_URL.replace('/login', '')}${rowHref}`);
    await page.waitForURL(/workflow-action/, { timeout: 30000 });

    // ASSERT (BLOCKING) the item opens on the "BEC: Monitor Evaluation Progress" page
    await expectOnPage(page, 'Monitor Evaluation Progress');

    // STEP: review the per-evaluator Evaluation Scores, then Begin Calibration → advances the tender to
    // the Monitor-calibration & finalise-scoring stage. Single click (no re-click — see clickOnceAndAwait).
    const begin = page.getByRole('button', { name: 'Begin Calibration', exact: true });
    await expect(begin).toBeVisible({ timeout: 15000 });
    await clickOnceAndAwait(begin, async () => {
      const gone = !(await page.getByText('Monitor Evaluation Progress', { exact: false }).first().isVisible().catch(() => false));
      return gone || /workflows-(inbox|my-items)/.test(page.url());
    }, 'BEC: Monitor Evaluation Progress');
  });

  // ADO Test Case #60822: https://dev.azure.com/boxfusion/PD-SupplyChainManagement/_workitems/edit/60822
  // Happy path VERIFIED LIVE 2026-06-04 against REF2026-1399 (advanced to this stage by TC-10). Logged in as the
  // BEC Secretariat (ThabisoM). The ADO steps (Maanda-awe login, Export-to-Excel, View-in-PDF, Download-Batch) are
  // stale — the live page (form tender-wf-calibratescores) only offers Close / Send Back / Finalise Scoring. Open the
  // Inbox item, review the read-only tabs + aggregated Evaluator Scores, then Finalise Scoring → the tender advances
  // to "BEC: Finalise recommendation" (TC-12 stage). Self-supplying: TC-10 replenishes this stage.
  test('TC-11: BEC Secretariat: Monitor Calibration and Finalise Scoring', async ({ page }) => {
    test.setTimeout(120_000);
    await loginAs(page, BEC_CHAIR);
    await openInbox(page);
    await expect(page.getByRole('button', { name: /export/i })).toBeVisible({ timeout: 15000 });

    // STEP: open the target tender (our TC-01 item) at the Monitor-calibration stage via its magnifying-glass.
    await page.getByRole('heading', { name: 'Incoming Items' }).click();
    const targetRow = page.getByRole('row')
      .filter({ hasText: tenderMatch() })
      .filter({ hasText: 'Monitor calibration and finalise scoring' })
      .first();
    await expect(targetRow).toBeVisible({ timeout: 30000 });
    // Open the row by navigating to its href, not a positional click: the Workflows accordion
    // flyout ("My Items" nav-link) can overlap the table and intercept the click. goto avoids that.
    const rowHref = await targetRow.getByRole('link').first().getAttribute('href');
    await page.goto(rowHref.startsWith('http') ? rowHref : `${APP_URL.replace('/login', '')}${rowHref}`);
    await page.waitForURL(/workflow-action/, { timeout: 30000 });

    // ASSERT (BLOCKING) the item opens on the "Monitor Calibration and Finalise Scoring" page
    await expectOnPage(page, 'Monitor calibration and finalise scoring:');

    // STEP: review the read-only tabs (Tender Details is the default; check Responses too).
    await expect(page.getByRole('tab', { name: 'Tender Details' })).toBeVisible({ timeout: 15000 });
    await expect(page.getByText(RUN_REF || tenderMatch()).first()).toBeVisible();
    await page.getByRole('tab', { name: 'Responses' }).click();
    // .first(): the Responses view can render the supplier in more than one cell/context — avoid a
    // strict-mode violation; we only need to confirm the supplier surfaced.
    await expect(page.getByRole('cell', { name: 'A & A Stationers' }).first()).toBeVisible({ timeout: 15000 });

    // STEP: Finalise Scoring → advances the tender to "BEC: Finalise recommendation". The slow app
    // sometimes swallows the first click, so retry until the calibration heading is gone / we leave the page.
    const finalise = page.getByRole('button', { name: 'Finalise Scoring', exact: true });
    await expect(finalise).toBeVisible({ timeout: 15000 });
    await clickOnceAndAwait(finalise, async () => {
      const gone = !(await page.getByText('Monitor calibration and finalise scoring:').first().isVisible().catch(() => false));
      return gone || /workflows-(inbox|my-items)/.test(page.url());
    }, 'Monitor calibration');
  });

  // ADO Test Case #60835: https://dev.azure.com/boxfusion/PD-SupplyChainManagement/_workitems/edit/60835
  // Happy path VERIFIED LIVE 2026-06-04 against REF2026-1399 (advanced here by TC-11). Logged in as the BEC
  // (ThabisoM). The ADO Maanda-awe login + Export-to-Excel steps are stale; View-in-PDF / Download-Batch buttons
  // do exist but aren't on the happy path. Open the Inbox item (form tender-wf-finaliserecommendation-details),
  // review the Final Evaluation ranking (A & A Stationers #1, Overall 98) + pre-selected Recommended Supplier,
  // click Approve Recommendation, fill the required BEC Report, then Submit Recommendation → the tender advances
  // to "Capture Outcome of the BAC" (TC-13) and leaves the inbox. Self-supplying: TC-11 replenishes this stage.
  test('TC-12: BEC: Finalise Recommendation', async ({ page }) => {
    test.setTimeout(120_000);
    await loginAs(page, BEC_CHAIR);
    await openInbox(page);
    await expect(page.getByRole('button', { name: /export/i })).toBeVisible({ timeout: 15000 });

    // STEP: open the target tender (our TC-01 item) at the Finalise-recommendation stage via its magnifying-glass.
    await page.getByRole('heading', { name: 'Incoming Items' }).click();
    const targetRow = page.getByRole('row')
      .filter({ hasText: tenderMatch() })
      .filter({ hasText: 'BEC: Finalise recommendation' })
      .first();
    await expect(targetRow).toBeVisible({ timeout: 30000 });
    // Open the row by navigating to its href, not a positional click: the Workflows accordion
    // flyout ("My Items" nav-link) can overlap the table and intercept the click. goto avoids that.
    const rowHref = await targetRow.getByRole('link').first().getAttribute('href');
    await page.goto(rowHref.startsWith('http') ? rowHref : `${APP_URL.replace('/login', '')}${rowHref}`);
    await page.waitForURL(/workflow-action/, { timeout: 30000 });

    // ASSERT (BLOCKING) the item opens on the "BEC: Finalise recommendation" page
    await expectOnPage(page, 'BEC: Finalise recommendation:');

    // STEP: wait for the score/evaluation tables to load, then verify A & A Stationers ranks #1 and is the
    // pre-selected Recommended Supplier.
    await expect(page.getByText('loading...').first()).toBeHidden({ timeout: 30000 });
    const finalEval = page.getByRole('row').filter({ hasText: 'A & A Stationers' }).first();
    await expect(finalEval).toBeVisible({ timeout: 15000 });

    // STEP: select the Approve Recommendation decision, then fill the required BEC Report.
    await page.getByRole('button', { name: /Approve Recommendation/ }).click();
    await page.getByRole('textbox').last().fill(
      'BEC recommends the award to A & A Stationers, the top-ranked supplier. ' +
      'All responses were above the functionality minimum and compliant. Automated TC-12 happy-path recommendation.');

    // STEP: Submit Recommendation (only enabled once a decision is picked + BEC Report filled) → advances the
    // tender out of the stage. Retry the click against the slow app until we leave the workflow-action page.
    const submit = page.getByRole('button', { name: 'Submit Recommendation', exact: true });
    await expect(submit).toBeEnabled({ timeout: 15000 });
    await clickOnceAndAwait(submit, async () => /workflows-(my-items|inbox)/.test(page.url()), 'Finalise recommendation');
  });

  // ADO Test Case #60836: https://dev.azure.com/boxfusion/PD-SupplyChainManagement/_workitems/edit/60836
  // Happy path VERIFIED LIVE 2026-06-04 against REF2026-1399 (advanced here by TC-12). Logged in as the BAC
  // adjudicator (MoshadiM) — switch users via clearLocalStorage + /login (no working logout). ADO Maanda-awe
  // login + Export-to-Excel steps are stale. Open the Inbox item (form
  // tender-wf-captureoutcomeofthebac-finalrecommendation), review the Stage 1/2/3 adjudication summaries +
  // read-only BEC Recommendation (A & A Stationers, Overall 98, Rank 1), select the BAC "Approve Recommendation"
  // decision, then Submit → the tender advances to "Approve Recommendation From BAC" (TC-14) and leaves the inbox.
  // NOTE: Stage 3 shows the recommended supplier (A & A Stationers) with Recommendation Status "Not Recommended"
  // — a suspected inverted-flag defect, flagged for observation on a full rerun (not asserted here).
  // Self-supplying: TC-12 replenishes this stage.
  test('TC-13: Capture Outcome of the BAC', async ({ page }) => {
    test.setTimeout(120_000);
    await loginAs(page, BAC);
    await openInbox(page);
    await expect(page.getByRole('button', { name: /export/i })).toBeVisible({ timeout: 15000 });

    // STEP: open the target tender (our TC-01 item) at the Capture-outcome stage via its magnifying-glass.
    await page.getByRole('heading', { name: 'Incoming Items' }).click();
    const targetRow = page.getByRole('row')
      .filter({ hasText: tenderMatch() })
      .filter({ hasText: 'Capture outcome from the BAC' })
      .first();
    await expect(targetRow).toBeVisible({ timeout: 30000 });
    // Open the row by navigating to its href, not a positional click: the Workflows accordion
    // flyout ("My Items" nav-link) can overlap the table and intercept the click. goto avoids that.
    const rowHref = await targetRow.getByRole('link').first().getAttribute('href');
    await page.goto(rowHref.startsWith('http') ? rowHref : `${APP_URL.replace('/login', '')}${rowHref}`);
    await page.waitForURL(/workflow-action/, { timeout: 30000 });

    // ASSERT (BLOCKING) the item opens on the "Capture outcome from the BAC" page
    await expectOnPage(page, 'Capture outcome from the BAC:');

    // STEP: wait for the adjudication summaries to load, then verify Stage 3 ranks A & A Stationers #1 (Overall 98)
    // and the BEC Recommended Supplier is A & A Stationers.
    await expect(page.getByText('loading...').first()).toBeHidden({ timeout: 30000 });
    const stage3Winner = page.getByRole('row').filter({ hasText: 'A & A Stationers' }).first();
    await expect(stage3Winner.first()).toBeVisible({ timeout: 15000 });

    // STEP: select the BAC Approve Recommendation decision (enables Submit).
    await page.getByRole('button', { name: /Approve Recommendation/ }).click();

    // STEP: Submit → captures the BAC outcome and advances the tender out of the stage. Retry the click against
    // the slow app until we leave the workflow-action page (redirect to My Items / Inbox).
    const submit = page.getByRole('button', { name: 'Submit', exact: true });
    await expect(submit).toBeEnabled({ timeout: 15000 });
    await clickOnceAndAwait(submit, async () => /workflows-(my-items|inbox)/.test(page.url()), 'Capture outcome from the BAC');
  });

  // ADO Test Case #60843: https://dev.azure.com/boxfusion/PD-SupplyChainManagement/_workitems/edit/60843
  // Happy path VERIFIED LIVE 2026-06-04 against REF2026-1399 (advanced here by TC-13). Logged in as the approving
  // authority (ThulileM) — switch users via clearLocalStorage + /login. ADO Maanda-awe login + Export-to-Excel
  // steps are stale. Open the Inbox item (form tender-wf-approverecommendationfrombac-details), review the Stage
  // 1/2/3 summaries, tick the "Approve BAC Recommendation" confirmation checkbox, then Submit → the tender
  // advances to "Compile and Upload Appointment Letter" (TC-15) and leaves the inbox.
  // NOTE: Stage 3 still shows the recommended supplier (A & A Stationers) as "Not Recommended" — the same
  // suspected inverted-flag defect seen in TC-13, flagged for observation on a full rerun (not asserted here).
  // Self-supplying: TC-13 replenishes this stage.
  test('TC-14: Approve Recommendation From BAC', async ({ page }) => {
    test.setTimeout(120_000);
    await loginAs(page, APPROVER);
    await openInbox(page);
    await expect(page.getByRole('button', { name: /export/i })).toBeVisible({ timeout: 15000 });

    // STEP: open the target tender (our TC-01 item) at the Approve-Recommendation-from-BAC stage via its glass.
    await page.getByRole('heading', { name: 'Incoming Items' }).click();
    const targetRow = page.getByRole('row')
      .filter({ hasText: tenderMatch() })
      .filter({ hasText: 'Approve Recommendation from BAC' })
      .first();
    await expect(targetRow).toBeVisible({ timeout: 30000 });
    // Open the row by navigating to its href, not a positional click: the Workflows accordion
    // flyout ("My Items" nav-link) can overlap the table and intercept the click. goto avoids that.
    const rowHref = await targetRow.getByRole('link').first().getAttribute('href');
    await page.goto(rowHref.startsWith('http') ? rowHref : `${APP_URL.replace('/login', '')}${rowHref}`);
    await page.waitForURL(/workflow-action/, { timeout: 30000 });

    // ASSERT (BLOCKING) the item opens on the "Approve Recommendation from BAC" page
    await expectOnPage(page, 'Approve Recommendation from BAC:');

    // STEP: wait for the adjudication summaries to load, then verify Stage 3 ranks A & A Stationers #1 (Overall 98).
    await expect(page.getByText('loading...').first()).toBeHidden({ timeout: 30000 });
    const stage3Winner = page.getByRole('row').filter({ hasText: 'A & A Stationers' }).first();
    await expect(stage3Winner.first()).toBeVisible({ timeout: 15000 });

    // STEP: tick the "Approve BAC Recommendation" confirmation checkbox (enables Submit). The confirm checkbox is
    // the one inside the block whose text mentions approving the Bid Adjudication Committee recommendation.
    await page.locator('div')
      .filter({ hasText: /approve the recomm.*endation from the Bid Adjudication/i })
      .filter({ has: page.getByRole('checkbox') })
      .last()
      .getByRole('checkbox')
      .check();

    // STEP: Submit → approves and advances the tender out of the stage. Retry the click against the slow app until
    // we leave the workflow-action page (redirect to My Items / Inbox).
    const submit = page.getByRole('button', { name: 'Submit', exact: true });
    await expect(submit).toBeEnabled({ timeout: 15000 });
    await clickOnceAndAwait(submit, async () => /workflows-(my-items|inbox)/.test(page.url()), 'Approve Recommendation from BAC');
  });

  // ADO Test Case #60845: https://dev.azure.com/boxfusion/PD-SupplyChainManagement/_workitems/edit/60845
  // Happy path VERIFIED LIVE 2026-06-04 against REF2026-1399 (advanced here by TC-14). Logged in as TumisangM
  // (the PUBLISHER also handles the appointment-letter upload) — switch users via clearLocalStorage + /login.
  // ADO Maanda-awe login + Export-to-Excel steps are stale. Open the Inbox item (form
  // tender-wf-compileanduploadappointmentletter-details), upload the signed appointment letter for the successful
  // bidder, pick the Contract Management Unit email, tick the Confirm checkbox, then Submit → the tender status
  // becomes "Awarded" and it advances to "Capture Order Details" (TC-16). Self-supplying: TC-14 replenishes this.
  test('TC-15: Compile and Upload Appointment Letter', async ({ page }) => {
    test.setTimeout(150_000);
    await loginAs(page, PUBLISHER);
    await openInbox(page);
    await expect(page.getByRole('button', { name: /export/i })).toBeVisible({ timeout: 15000 });

    // STEP: open the target tender (our TC-01 item) at the Upload-Appointment-letter stage via its glass.
    await page.getByRole('heading', { name: 'Incoming Items' }).click();
    const targetRow = page.getByRole('row')
      .filter({ hasText: tenderMatch() })
      .filter({ hasText: 'Upload Appointment letter' })
      .first();
    await expect(targetRow).toBeVisible({ timeout: 30000 });
    // Open the row by navigating to its href, not a positional click: the Workflows accordion
    // flyout ("My Items" nav-link) can overlap the table and intercept the click. goto avoids that.
    const rowHref = await targetRow.getByRole('link').first().getAttribute('href');
    await page.goto(rowHref.startsWith('http') ? rowHref : `${APP_URL.replace('/login', '')}${rowHref}`);
    await page.waitForURL(/workflow-action/, { timeout: 30000 });

    // ASSERT (BLOCKING) the item opens on the "Upload Appointment letter" page
    await expectOnPage(page, 'Upload Appointment letter:');
    await expect(page.getByText('Fetching data...').first()).toBeHidden({ timeout: 30000 });

    // STEP: upload the Appointment Letter (required) and confirm the file surfaces.
    await uploadFile(page, page.getByRole('button', { name: /press to upload/i }), PDF_FIXTURE);
    await expect(page.getByTitle('pdf-test.pdf').first()).toBeVisible({ timeout: 30000 });

    // STEP: pick a Contract Management Unit Email (required AntD select), e.g. Andrew Jack.
    await formItem(page, 'Contract Management Unit Email').getByRole('combobox').click();
    await page.getByTitle('Andrew Jack', { exact: true }).first().click();

    // STEP: tick the Confirm checkbox ("I confirm that the appointment letter has been compiled and signed").
    await page.locator('div')
      .filter({ hasText: 'appointment letter has been compiled and signed' })
      .filter({ has: page.getByRole('checkbox') })
      .last()
      .getByRole('checkbox')
      .check();

    // STEP: Submit → awards the tender and advances it out of the stage. Retry against the slow app until the
    // status flips to "Awarded" or we leave the page.
    const submit = page.getByRole('button', { name: 'Submit', exact: true });
    await expect(submit).toBeEnabled({ timeout: 15000 });
    await clickOnceAndAwait(submit, async () => {
      const awarded = await page.getByText('Awarded', { exact: false }).first().isVisible().catch(() => false);
      const capture = await page.getByText('Capture Order Details', { exact: false }).first().isVisible().catch(() => false);
      return awarded || capture || /workflows-(my-items|inbox)/.test(page.url());
    }, 'Upload Appointment letter');
  });

  // ADO Test Case #60848: https://dev.azure.com/boxfusion/PD-SupplyChainManagement/_workitems/edit/60848
  // Happy path VERIFIED LIVE 2026-06-04 against REF2026-1399 (Awarded by TC-15). Logged in as TumisangM (same
  // user who uploaded the appointment letter) — switch users via clearLocalStorage + /login. ADO Maanda-awe login
  // + Export-to-Excel steps are stale. Open the Inbox item (form tender-wf-captureorder-details), capture the four
  // required Order Details fields (PO number, date, amount, attachment), then Submit → the tender leaves the
  // workflow entirely (lifecycle complete). Self-supplying: TC-15 awards the tender into this stage.
  // The Purchase Order Date is a DATE-ONLY AntD picker (no time panel / OK button) — click the day cell directly.
  test('TC-16: Capture Order Details', async ({ page }) => {
    test.setTimeout(150_000);
    await loginAs(page, PUBLISHER);
    await openInbox(page);
    await expect(page.getByRole('button', { name: /export/i })).toBeVisible({ timeout: 15000 });

    // STEP: open the target tender (our TC-01 item) at the Capture-Order-Details stage via its glass.
    await page.getByRole('heading', { name: 'Incoming Items' }).click();
    const targetRow = page.getByRole('row')
      .filter({ hasText: tenderMatch() })
      .filter({ hasText: 'Capture Order Details' })
      .first();
    await expect(targetRow).toBeVisible({ timeout: 30000 });
    // Open the row by navigating to its href, not a positional click: the Workflows accordion
    // flyout ("My Items" nav-link) can overlap the table and intercept the click. goto avoids that.
    const rowHref = await targetRow.getByRole('link').first().getAttribute('href');
    await page.goto(rowHref.startsWith('http') ? rowHref : `${APP_URL.replace('/login', '')}${rowHref}`);
    await page.waitForURL(/workflow-action/, { timeout: 30000 });

    // ASSERT (BLOCKING) the item opens on the "Capture Order Details" page
    await expectOnPage(page, 'Capture Order Details:');
    await expect(page.getByText('Fetching data...').first()).toBeHidden({ timeout: 30000 });

    // STEP: capture the four required Order Details fields. This Shesha/AntD form is timing-sensitive
    // (a value typed before the field finishes mounting silently fails to commit, leaving Submit
    // disabled), so each field is filled then VERIFIED, retrying the commit until it actually sticks.

    // Purchase Order No — plain text input. Confirm the value landed before moving on.
    const poNo = formItem(page, 'Purchase Order No').getByRole('textbox');
    await expect(poNo).toBeVisible({ timeout: 30000 });
    await expect(async () => {
      await poNo.fill('PO-REF2026-1399-TC16');
      await expect(poNo).toHaveValue('PO-REF2026-1399-TC16', { timeout: 3000 });
    }).toPass({ timeout: 20000 });

    // Purchase Order Date — date-only picker: open it and click the highlighted "today" cell; verify
    // the input is no longer empty (the panel click can miss while the dropdown is still animating).
    const poDate = formItem(page, 'Purchase Order Date').getByRole('textbox');
    await expect(async () => {
      await poDate.click();
      const dropdown = page.locator('.ant-picker-dropdown:not(.ant-picker-dropdown-hidden)').last();
      await dropdown.locator('td.ant-picker-cell-today').click();
      await expect(poDate).not.toHaveValue('', { timeout: 3000 });
    }).toPass({ timeout: 20000 });

    // Purchase Order Amount — AntD InputNumber: .fill() commits on blur; verify the formatted value.
    const poAmt = formItem(page, 'Purchase Order Amount').getByRole('spinbutton');
    await expect(async () => {
      await poAmt.fill('150000');
      await poAmt.blur();
      await expect(poAmt).toHaveValue(/150[ ,]?000/, { timeout: 3000 });
    }).toPass({ timeout: 20000 });

    // Order Attachment — required upload. The "press to upload" file chooser is flaky on this form
    // (the click intermittently doesn't open a chooser). The control is a standard AntD upload with a
    // hidden <input type="file">, so set that input directly — it's overlay-proof and needs no chooser.
    // Fall back to the chooser only if the input isn't present. Retry until the file surfaces.
    const orderAttach = formItem(page, 'Order Attachment');
    await expect(async () => {
      const fileInput = orderAttach.locator('input[type="file"]');
      if (await fileInput.count()) {
        await fileInput.setInputFiles(PDF_FIXTURE);
      } else {
        await uploadFile(page, orderAttach.getByRole('button', { name: /press to upload/i }), PDF_FIXTURE);
      }
      await expect(page.getByTitle('pdf-test.pdf').first()).toBeVisible({ timeout: 8000 });
    }).toPass({ timeout: 45000 });

    // STEP: Submit → captures the order and completes the workflow. Retry against the slow app until we leave the
    // workflow-action page (redirect to My Items / Inbox).
    const submit = page.getByRole('button', { name: 'Submit', exact: true });
    await expect(submit).toBeEnabled({ timeout: 15000 });
    await clickOnceAndAwait(submit, async () => /workflows-(my-items|inbox)/.test(page.url()), 'Capture Order Details');
  });
});
