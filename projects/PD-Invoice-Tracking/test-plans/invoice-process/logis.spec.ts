// AUTO-RECORDED from test-plans/invoice-process/logis.md
// Source: Azure DevOps test plan #102133 "ITS Automation Test Cases", suite #102170 "LOGIS".
// The .md plan is canonical. AI-repair will patch failing lines in this file.
//
// Recorded live on 2026-09-14 against the NEW Shesha-hosted app
// (https://pd-invoicetracking-adminportal-qa.shesha.app) after PD-Invoice Tracking moved off
// azurewebsites. Process selected: "LOGIS Request For Payment" (exact — must not match
// "DBE LOGIS Request For Payment", which is a separate process on the same Create New menu).
//
// Recording notes that cost real time to establish — do not "simplify" these away:
//  * JohanV is NOT an admin: he has no Live|Ready|Latest .ant-dropdown-trigger at all, so
//    switchToLatest() must NOT be called for him (it would wait 45s for a control that cannot
//    exist). This run therefore exercises the PUBLISHED (Live) form versions.
//  * Business Unit is REQUIRED and Submit stays disabled until it is set. It DOES auto-populate from
//    the order's End User when that End User maps to a portal user, and is blank otherwise. Setting a
//    blank field works; overwriting an order-supplied value is unreliable, so TC-02 skips orders that
//    pre-fill it rather than fighting the control.
//  * This build has NO "Order Line Item" panel — logis.md steps 20-22 describe an older build.
//  * Shesha grid filters only apply on ENTER. Filling `.sha-global-table-filter input` alone leaves the
//    grid unfiltered, and since the Inbox pages at 10/page and is not sorted newest-first, that reads
//    as "the item isn't in this user's inbox" when it is simply on page 2.

import { test, expect, Page, BrowserContext } from '@playwright/test';
import * as path from 'path';

const BASE = 'https://pd-invoicetracking-adminportal-qa.shesha.app';
const APP_URL = `${BASE}/login`;
const MY_ITEMS_URL = `${BASE}/dynamic/Shesha.Workflow/workflows-my-items`;
const INBOX_URL = `${BASE}/dynamic/Shesha.Workflow/workflows-inbox`;
const INVOICE_PDF = path.join(__dirname, '..', '..', '..', '..', 'test-data', 'pdf-test.pdf');

// Step -> actor, supplied by the user 2026-09-14. Register Invoice is JohanV.
const CAPTURER = { user: 'JohanV', password: '123qwe' };
// Whoever is chosen as Business Unit becomes the End User on this request, so the choice decides
// who actions "End User Confirm Delivery" downstream. Set to JohanV per the user (2026-09-14) —
// note that routes End User Confirm Delivery to JohanV rather than the ThabisoM in the actor map.
const BUSINESS_UNIT_SEARCH = 'Johan';
// Approve Invoice (Supervisor Response) is actioned by FatimaP — established live on 2026-09-14 by
// checking which inbox actually held the certified item (LeratoM/ThabisoM/Admin had none of it).
const SUPERVISOR = { user: 'FatimaP', password: '123qwe' };
// Capture Filing — reassigned to ThabisoM on 2026-09-14. logis.md still names GwenB (old app, does
// not exist here); the account it sat on before, "aakil", has an unknown password (not 123qwe).
const FILING = { user: 'ThabisoM', password: '123qwe' };

// The app idles out; on a cold start the SPA needs far longer than the 15s actionTimeout to paint
// the login form. Wait for it explicitly.
async function login(page: Page, user: string, password: string) {
  await page.goto(APP_URL);
  const username = page.getByRole('textbox', { name: 'Username' });
  await username.waitFor({ state: 'visible', timeout: 120_000 });
  await username.fill(user);
  await page.getByRole('textbox', { name: 'Password' }).fill(password);
  await page.getByRole('button', { name: 'Sign In' }).click();
  // networkidle alone can settle BEFORE authentication finishes, so a following goto() gets bounced
  // back to /login and the test fails as if the page were missing. Wait for the login form itself to
  // go away — that works for every account, unlike waitForURL(/\/dynamic\//), since homeUrl is
  // per-user and not everyone lands on a /dynamic/ route.
  await username.waitFor({ state: 'detached', timeout: 60_000 }).catch(() => {});
  await page.waitForLoadState('networkidle');
}

test.describe.serial('LOGIS — Invoice Tracking Process', () => {
  let context: BrowserContext;
  let page: Page;
  let currentUser = '';
  // CHAIN_REF pins the run to an invoice that already exists, so downstream TCs can carry the item
  // that is furthest along instead of registering a fresh one (or restarting a less advanced one).
  //   CHAIN_REF="PAY4772/2026" node scripts/run-plan.js ... --grep "TC-11"
  let refNo = process.env.CHAIN_REF || '';
  let orderNo = '';
  let invoiceNo = '';

  test.beforeAll(async ({ browser }) => {
    context = await browser.newContext();
    page = await context.newPage();
  });

  test.afterAll(async () => {
    await context?.close();
  });

  async function actAs(user: string, password: string) {
    if (currentUser === user) return;
    await login(page, user, password);
    currentUser = user;
  }

  // Open this chain's item from the Inbox. Prefers the Ref No captured in TC-02 so a step acts on THIS
  // invoice; falls back to the step name when the TC is run on its own against an existing item. On a
  // miss it dumps what the queue actually holds, so a wrong actor or step name says so directly instead
  // of costing another registered invoice to discover.
  async function openChainItem(stepText: string) {
    await page.goto(INBOX_URL);
    await page.waitForLoadState('networkidle');
    // Wait for the grid to actually paint — reading it too early returns zero rows and looks exactly
    // like "the item isn't assigned to this user".
    for (let i = 0; i < 25; i++) {
      if ((await page.getByRole('row').count()) > 1) break;
      await page.waitForTimeout(1_000);
    }

    // The Inbox pages at 10/page and does NOT sort newest-first, so a freshly routed item is usually
    // NOT on page 1 — scanning the visible rows reports a false "not in this user's inbox". Search the
    // grid's OWN filter (a loose input[placeholder*="earch"] hits the page header's search and
    // silently filters nothing).
    const gridFilter = page.locator('.sha-global-table-filter input').first();
    if (refNo && (await gridFilter.count())) {
      await gridFilter.fill(refNo);
      await gridFilter.press('Enter');
      await page.waitForTimeout(3_000);
    }

    const byRef = refNo ? page.getByRole('row').filter({ hasText: refNo }) : null;
    const row = byRef && (await byRef.count()) > 0
      ? byRef.first()
      : page.getByRole('row').filter({ hasText: stepText }).first();

    if ((await row.count()) === 0) {
      const rows = await page.getByRole('row').allInnerTexts();
      throw new Error(
        `no inbox row for refNo="${refNo || '(none)'}" / step="${stepText}" as ${currentUser}. Inbox holds:\n` +
        rows.slice(0, 15).map(r => '  - ' + r.replace(/\s+/g, ' ').trim()).join('\n')
      );
    }

    const rowText = (await row.innerText()).replace(/\s+/g, ' ').trim();
    if (!refNo) refNo = (rowText.match(/PAY\d+\/\d{4}/) || [''])[0];
    console.log(`[chain] opening ${refNo} at "${stepText}" as ${currentUser}`);
    await row.getByRole('link').first().click();
    await page.waitForLoadState('networkidle');
    await page.getByText('Fetching data...').first().waitFor({ state: 'hidden', timeout: 30_000 }).catch(() => {});
    await page.waitForTimeout(2_000);
  }

  // Report where the item sits now, straight from the Inbox's Action Required column.
  async function currentStepOf(ref: string): Promise<string> {
    await page.goto(INBOX_URL);
    await page.waitForLoadState('networkidle');
    for (let i = 0; i < 25; i++) {
      if ((await page.getByRole('row').count()) > 1) break;
      await page.waitForTimeout(1_000);
    }
    // Same pagination trap as openChainItem — filter the grid rather than scanning page 1, or this
    // reports "(not in this user's inbox)" for an item that is simply on page 2.
    const gridFilter = page.locator('.sha-global-table-filter input').first();
    if (await gridFilter.count()) {
      await gridFilter.fill(ref);
      await gridFilter.press('Enter');
      await page.waitForTimeout(3_000);
    }
    const row = page.getByRole('row').filter({ hasText: ref }).first();
    if ((await row.count()) === 0) return '(not in this user’s inbox)';
    return (await row.innerText()).replace(/\s+/g, ' ').trim();
  }

  test('TC-01: Login (JohanV)', async () => {
    await actAs(CAPTURER.user, CAPTURER.password);
    // ASSERT (BLOCKING) the Homepage is displayed after sign-in
    await expect(page.getByRole('menuitem', { name: /Workflows/ })).toBeVisible();

    // JohanV is non-admin: record that the view-mode control is genuinely absent rather than
    // silently assuming Latest. A non-admin only ever sees Live — correct app behaviour.
    const modeTrigger = page.locator('.ant-dropdown-trigger').filter({ hasText: /^(Live|Ready|Latest)$/ });
    console.log(`[mode] view-mode control present for ${CAPTURER.user}: ${(await modeTrigger.count()) > 0}`);
  });

  test('TC-02: Register and Upload Invoice (ADO #102215)', async () => {
    // This TC legitimately runs long: it may try several orders before finding one that leaves
    // Business Unit blank, then waits out a real file upload and a slow Submit. The 90s project
    // default tears the context down mid-action ("Target page, context or browser has been closed"),
    // which reads like a crash rather than a budget overrun.
    test.setTimeout(300_000);
    await actAs(CAPTURER.user, CAPTURER.password);

    // STEP 1: open My Items (sidebar flyout collapses under automation — navigate directly)
    await page.goto(MY_ITEMS_URL);
    await page.waitForLoadState('networkidle');

    // STEP 3/5: CLICK Create New, then the LOGIS process. `exact` matters — "DBE LOGIS Request For
    // Payment" is a DIFFERENT process sitting directly above it in the same menu.
    // The dropdown intermittently does not open on the first click, so confirm the menu actually
    // appeared and re-open it if not, rather than failing on a timing wobble.
    const processItem = page.getByRole('menuitem', { name: 'LOGIS Request For Payment', exact: true });
    for (let attempt = 0; attempt < 3; attempt++) {
      if (await processItem.isVisible().catch(() => false)) break;
      await page.getByRole('button', { name: /Create New/i }).first().click();
      await page.waitForTimeout(2_000);
    }
    await processItem.waitFor({ state: 'visible', timeout: 20_000 });
    await processItem.click();
    await page.waitForLoadState('networkidle');

    // ASSERT the Register and Upload Invoice page is displayed, and wait for it to hydrate — the
    // heading paints long before the controls do.
    await expect(page.getByRole('heading', { name: /Register and Upload Invoice/ })).toBeVisible({ timeout: 60_000 });
    await page.getByRole('textbox').first().waitFor({ state: 'visible', timeout: 60_000 });
    await page.waitForTimeout(1_500);

    // Capture the Ref No now — it exists from draft creation and pins every downstream step.
    const refText = await page.locator('main').innerText();
    refNo = (refText.match(/PAY\d+\/\d{4}/) || [''])[0];
    expect(refNo, 'Ref No minted for the chain').toMatch(/PAY\d+\/\d{4}/);

    // ASSERT Date Received is auto-populated with today's date
    const today = new Date();
    const dd = String(today.getDate()).padStart(2, '0');
    const mm = String(today.getMonth() + 1).padStart(2, '0');
    await expect(page.getByRole('textbox').first()).toHaveValue(`${dd}/${mm}/${today.getFullYear()}`);

    // STEP 7: CLICK the ellipsis on the Order No field
    await page.getByRole('button', { name: 'ellipsis' }).first().click();
    const picker = page.getByRole('dialog').first();
    await picker.waitFor({ state: 'visible', timeout: 20_000 });
    await page.waitForTimeout(1_500);

    // Business Unit auto-fills from the picked order's End User, and overriding it afterwards is what
    // makes the invoice line fail to create. So pick an order whose End User is ALREADY the account we
    // need, and leave the field alone. Search the grid's OWN filter — a loose
    // input[placeholder*="earch"] matches the page header's search and silently filters nothing.
    const gridFilter = picker.locator('.sha-global-table-filter input').first();
    if (await gridFilter.count()) {
      await gridFilter.fill(BUSINESS_UNIT_SEARCH);
      await gridFilter.press('Enter');
      await page.waitForTimeout(3_000);
    }
    const matchCount = await picker.locator('.tr.tr-body').count();
    console.log(`[chain] orders matching "${BUSINESS_UNIT_SEARCH}": ${matchCount}`);

    // STEP 9: double-click an order to select it. Shesha grids are .sha-table (.tr.tr-body rows),
    // NOT .ant-table — a tr[data-row-key] locator counts zero rows here.
    //
    // Which order we land on decides whether this test can pass at all: an order that PRE-FILLS
    // Business Unit forces an override, and overriding is the path that fails with "Create failed"
    // (see test-reports/bugs/2026-09-14-logis-business-unit-override-breaks-invoice-create.md). The
    // first matching row differs between runs, so walk the candidates and keep the first order that
    // leaves Business Unit blank — otherwise this test passes or fails on luck of ordering.
    const buSelect = page.locator('.ant-select').nth(1);
    let before = '';
    const candidates = Math.min(await picker.locator('.tr.tr-body').count(), 6);
    for (let i = 0; i < candidates; i++) {
      const row = picker.locator('.tr.tr-body').nth(i);
      orderNo = ((await row.innerText()).match(/OR-\d+/) || [''])[0];
      console.log(`[chain] trying order ${i + 1}/${candidates}: ${(await row.innerText()).replace(/\s+/g, ' ').trim().slice(0, 110)}`);
      await row.dblclick();
      await page.getByText('Fetching data...').first().waitFor({ state: 'hidden', timeout: 30_000 }).catch(() => {});
      await page.waitForTimeout(3_000);

      before = await buSelect.locator('.ant-select-selection-item').innerText().catch(() => '');
      if (!before || before.includes(BUSINESS_UNIT_SEARCH)) break;

      console.log(`[chain]   order ${orderNo} pre-fills Business Unit as "${before}" — skipping (override is the known-broken path)`);
      if (i === candidates - 1) break;
      await page.getByRole('button', { name: 'ellipsis' }).first().click();
      await picker.waitFor({ state: 'visible', timeout: 20_000 });
      await page.waitForTimeout(1_500);
      if (await gridFilter.count()) {
        await gridFilter.fill(BUSINESS_UNIT_SEARCH);
      await gridFilter.press('Enter');
        await page.waitForTimeout(2_500);
      }
    }
    before = before || '(empty)';

    // ASSERT the order populated Order No and auto-filled the read-only Supplier Details
    await expect(page.locator('.ant-select-selection-item').filter({ hasText: orderNo })).toBeVisible();
    await expect(page.getByRole('heading', { name: 'Supplier Details' })).toBeVisible();

    // Business Unit is REQUIRED and Submit stays disabled until it is set. The order-selection loop
    // above has already left us on an order that did NOT pre-fill it, so this sets a blank field —
    // the path that works. Click the .ant-select-selector wrapper, NOT the role=combobox input:
    // when a value is present the <span class="ant-select-selection-item"> intercepts the click.
    let businessUnitName = before;
    if (before.includes(BUSINESS_UNIT_SEARCH)) {
      // Ideal path: the order already carries the account we need, so the field is left untouched.
      console.log(`[chain] business unit already ${before} from the order — no override needed`);
    } else {
      await buSelect.hover();
      const clearBtn = buSelect.locator('.ant-select-clear');
      if (await clearBtn.count()) {
        await clearBtn.click({ force: true });
        await page.waitForTimeout(1_500);
      }
      await buSelect.locator('.ant-select-selector').click();
      await page.keyboard.type(BUSINESS_UNIT_SEARCH);
      const option = page.locator('.ant-select-dropdown:not(.ant-select-dropdown-hidden) .ant-select-item-option').first();
      await option.waitFor({ state: 'visible', timeout: 15_000 });
      businessUnitName = (await option.innerText()).trim();
      await option.click();
      await page.waitForTimeout(2_500);
      console.log(`[chain] business unit overridden: ${before} -> ${businessUnitName}`);
    }
    // Verify against the select's own rendered value. Assert on the search term, not the full display
    // name: the dropdown option and the committed selection item do not always render identically,
    // and a whole-name match fails on a field that is in fact correctly set. Reporting every
    // selection item makes a genuine mis-selection obvious in the failure message.
    const selected = await page.locator('.ant-select-selection-item').allInnerTexts();
    expect(selected.join(' | '), 'Business Unit must be the actor-map account').toContain(BUSINESS_UNIT_SEARCH);

    // --- Invoice line -------------------------------------------------------------------------
    // Columns: Invoice Date | Service Delivery Date | Invoice No | Invoice Amount | Attachment.
    // The first two are antd date pickers (placeholder "Select date"), so an unqualified
    // .getByRole('textbox').first() on this row resolves to Invoice Date, NOT Invoice No.
    const editRow = page.getByRole('row').filter({ has: page.getByRole('button', { name: 'plus-circle' }) });

    // STEP 15: Invoice Date — current-or-past
    const invoiceDate = editRow.getByRole('textbox', { name: 'Select date' }).nth(0);
    await invoiceDate.click();
    await invoiceDate.fill(`${dd}/${mm}/${today.getFullYear()}`);
    await invoiceDate.press('Enter');

    // Service Delivery Date — current-or-past
    const serviceDate = editRow.getByRole('textbox', { name: 'Select date' }).nth(1);
    await serviceDate.click();
    await serviceDate.fill(`${dd}/${mm}/${today.getFullYear()}`);
    await serviceDate.press('Enter');

    // STEP 17: Invoice No — unique
    invoiceNo = `INV-LOGIS-${Date.now()}`;
    const invoiceNoField = editRow.locator('input:not([placeholder="Select date"])').first();
    await invoiceNoField.fill(invoiceNo);
    // ASSERT the populated invoice number is displayed
    await expect(invoiceNoField).toHaveValue(invoiceNo);

    // Invoice Amount — kept small so it stays inside the order's uninvoiced balance (over-committing
    // the line amount forces a motivation attachment).
    await editRow.getByRole('spinbutton').first().fill('100');

    // STEP 18: attach the invoice file
    const fileChooserPromise = page.waitForEvent('filechooser');
    await editRow.getByRole('button', { name: /upload/i }).first().click();
    (await fileChooserPromise).setFiles(INVOICE_PDF);

    // Wait for the upload to COMPLETE, not merely for the filename to appear. The name renders as
    // soon as the file is queued; committing the row while the upload is still in flight is what
    // produces "Create failed". Completion is signalled by the rendered file SIZE, so wait on that
    // and on any in-row spinner clearing before touching Add.
    await expect(
      editRow.getByText(/pdf-test\.pdf\s*\([\d.]+\s*[kKmM]B\)/).first(),
      'invoice attachment must finish uploading before the row is committed'
    ).toBeVisible({ timeout: 60_000 });
    await editRow.locator('.anticon-loading, .ant-upload-list-item-uploading, .ant-progress')
      .first().waitFor({ state: 'hidden', timeout: 60_000 }).catch(() => {});
    await page.waitForTimeout(2_000);

    // STEP 20: commit the invoice row
    await page.getByRole('button', { name: 'plus-circle' }).first().click();
    await page.waitForTimeout(3_000);
    // ASSERT the row is added and the Total reflects the amount
    await expect(page.getByText(/Total Amount:\s*R\s?100\b/)).toBeVisible({ timeout: 20_000 });

    // NOT YET COVERED — plan steps 11-13 (click Add on an EMPTY row, assert the mandatory fields flag
    // red, Cancel, assert they clear). Both placements fight the form: doing it BEFORE the real row
    // leaves the typed values outside an active edit session (Cancel ends it) so the commit silently
    // does nothing; doing it AFTER, the row's Add control is no longer clickable. It needs recording
    // live against the real control rather than a guessed placement, so it is left out deliberately
    // instead of being faked with an assertion weak enough to always pass.

    console.log(`[chain] ${refNo} — order ${orderNo}, invoice ${invoiceNo}, business unit ${businessUnitName}`);

    // STEP 24/25: Submit
    const submit = page.getByRole('button', { name: 'Submit' }).first();
    await expect(submit, 'Submit enables once Business Unit is set').toBeEnabled({ timeout: 20_000 });
    await submit.click();

    // Older builds raised a "Submit Invoice with Order Line Items" confirmation. This build has no
    // Order Line Item panel, so the dialog may not appear — confirm it only if it does.
    const confirmYes = page.getByRole('button', { name: /^(Yes|YES|Ok|OK)$/ }).first();
    if (await confirmYes.isVisible({ timeout: 5_000 }).catch(() => false)) {
      await confirmYes.click();
    }

    // ASSERT (BLOCKING) submit completes and the item leaves the register step. Submit posts the
    // invoice + attachment and starts the workflow; on QA that runs well past a 15s budget.
    // Submit posts the invoice + attachment and starts the workflow; on QA that runs past a 15s budget.
    // LOGIS Request For Payment routes Register -> Certify Invoice (NOT "Match to Order and Verify",
    // which belongs to the separate DBE LOGIS process).
    await expect(
      page.getByText(/Certify Invoice|Register and Upload Invoice/i).first()
    ).toBeVisible({ timeout: 60_000 });
  });

  test('TC-03: Certify Invoice (ADO #102216)', async () => {
    test.setTimeout(180_000);
    // Actioned by the Business Unit named on the request — JohanV, because TC-02 sets him as the
    // Business Unit. That is why the item lands in his Inbox rather than a separate certifier's.
    await actAs(CAPTURER.user, CAPTURER.password);
    await openChainItem('Certify Invoice');

    // ASSERT the Certify Invoice form is displayed with its Business Unit Response options
    await expect(page.getByRole('heading', { name: /Certify Invoice/ })).toBeVisible({ timeout: 30_000 });
    await expect(page.getByRole('heading', { name: 'Business Unit Response:' })).toBeVisible();
    await expect(page.getByRole('radio')).toHaveCount(3);

    // STEP: choose the happy path — delivered satisfactory, invoice should be paid.
    // The other two options branch away: "not delivered / unacceptable" -> Review Invoice Rejection,
    // "I am the wrong person to confirm the delivery" -> Re-route to Correct Business Unit.
    const satisfactory = page.getByRole('radio', { name: /delivered satisfactory/i });
    await satisfactory.check();
    await expect(satisfactory).toBeChecked();

    // STEP: Submit
    const submit = page.getByRole('button', { name: 'Submit' }).first();
    await expect(submit, 'Submit enables once a Business Unit Response is chosen').toBeEnabled({ timeout: 20_000 });
    await submit.click();

    // ASSERT (BLOCKING) the item leaves Certify Invoice. Report where it actually went rather than
    // asserting a guessed next-step name — this process's downstream actors are not yet confirmed.
    await page.waitForTimeout(5_000);
    const now = await currentStepOf(refNo);
    console.log(`[chain] ${refNo} after certify: ${now}`);
    expect(now, 'the item must no longer be waiting at Certify Invoice').not.toMatch(/Certify Invoice/);
  });

  test('TC-05: Approve Invoice (ADO #102232)', async () => {
    test.setTimeout(180_000);
    // Actioned by FatimaP — confirmed live 2026-09-14 by checking which account actually holds the
    // certified item (LeratoM, ThabisoM and Admin inboxes were all empty of it). The status on the
    // row reads "Certified" and the Action Required is "Approve Invoice".
    await actAs(SUPERVISOR.user, SUPERVISOR.password);
    await openChainItem('Approve Invoice');

    // ASSERT the Approve Invoice form is displayed with its Supervisor Response options
    await expect(page.getByRole('heading', { name: /Approve Invoice/ })).toBeVisible({ timeout: 30_000 });
    await expect(page.getByRole('heading', { name: 'Supervisor Response:' })).toBeVisible();
    await expect(page.getByRole('radio')).toHaveCount(2);
    // ASSERT the invoice total carried through from registration
    await expect(page.getByRole('heading', { name: /Total Amount\(Incl\. VAT\):\s*R\s?100\b/ })).toBeVisible();

    // STEP: happy path — delivered satisfactory, invoice should be paid.
    // The other option ("has not been delivered ... should not be paid") branches to Review Invoice
    // Rejection; Send Back returns it to the previous step.
    const satisfactory = page.getByRole('radio', { name: /delivered satisfactory/i });
    await satisfactory.check();
    await expect(satisfactory).toBeChecked();

    // STEP: Submit
    const submit = page.getByRole('button', { name: 'Submit' }).first();
    await expect(submit, 'Submit enables once a Supervisor Response is chosen').toBeEnabled({ timeout: 20_000 });
    await submit.click();

    // ASSERT (BLOCKING) the item leaves Approve Invoice. Report where it went rather than asserting a
    // guessed next step — downstream actors on this process are still being established.
    await page.waitForTimeout(5_000);
    const now = await currentStepOf(refNo);
    console.log(`[chain] ${refNo} after approve: ${now}`);
    expect(now, 'the item must no longer be waiting at Approve Invoice').not.toMatch(/Approve Invoice/);
  });

  test('TC-07: Assign Responsible Official (ADO #102242)', async () => {
    test.setTimeout(180_000);
    // Stays with FatimaP — approving the invoice routes it back to her own inbox for this step.
    await actAs(SUPERVISOR.user, SUPERVISOR.password);
    await openChainItem('Assign Responsible Official');

    await expect(page.getByRole('heading', { name: /Assign Responsible Official/ })).toBeVisible({ timeout: 30_000 });

    // STEP: pick the Official who will Verify Invoice next. Assigned to JohanV deliberately — the
    // chain can only continue through an account we hold credentials for.
    const officialSelect = page.locator('.ant-select').first();
    await officialSelect.locator('.ant-select-selector').click();
    await page.keyboard.type(BUSINESS_UNIT_SEARCH);
    const option = page.locator('.ant-select-dropdown:not(.ant-select-dropdown-hidden) .ant-select-item-option').first();
    await option.waitFor({ state: 'visible', timeout: 15_000 });
    const officialName = (await option.innerText()).trim();
    await option.click();
    await page.waitForTimeout(2_000);
    console.log(`[chain] responsible official: ${officialName}`);

    // ASSERT the official is set — check the select's rendered value, reporting all of them so a
    // mis-selection is visible rather than hidden behind a bare boolean.
    const selected = await page.locator('.ant-select-selection-item').allInnerTexts();
    expect(selected.join(' | '), 'responsible official must be set').toContain(BUSINESS_UNIT_SEARCH);

    // STEP: Submit
    const submit = page.getByRole('button', { name: 'Submit' }).first();
    await expect(submit, 'Submit enables once the Official is chosen').toBeEnabled({ timeout: 20_000 });
    await submit.click();

    // ASSERT (BLOCKING) the item leaves Assign Responsible Official
    await page.waitForTimeout(5_000);
    const now = await currentStepOf(refNo);
    console.log(`[chain] ${refNo} after assigning official: ${now}`);
    expect(now, 'the item must no longer be waiting at Assign Responsible Official')
      .not.toMatch(/Assign Responsible Official/);
  });

  test('TC-08: Verify Invoice (ADO #102246)', async () => {
    test.setTimeout(180_000);
    // Actioned by the Responsible Official assigned in TC-07 — JohanV.
    await actAs(CAPTURER.user, CAPTURER.password);
    await openChainItem('Verify Invoice');

    await expect(page.getByRole('heading', { name: /Verify Invoice/ })).toBeVisible({ timeout: 30_000 });
    await expect(page.getByRole('heading', { name: 'Order Matching Outcome:' })).toBeVisible();

    // STEP: Outcome — happy path. The other three branch away: "Send for business related query" and
    // "Send for supplier related query" route to the query steps, "Reject Invoice" to Review Invoice
    // Rejection.
    const complete = page.getByRole('radio', { name: 'Verification is complete', exact: true });
    await complete.check();
    await expect(complete).toBeChecked();

    // STEP: answer the order-matching checklist — 7 Yes/No pairs sit below the outcome options.
    // count() is an IMMEDIATE query: unlike expect(), it does not retry. Reading it before the radios
    // paint returns 0, and both loops below are bounded by it — so the test answered nothing, asserted
    // nothing, and passed. That happened on PAY4750 (logged "Yes x0") while the same step logged "x7"
    // on PAY4772/PAY4812. Wait for the radios, then hold a floor so a vacuous pass is impossible.
    const yesRadios = page.getByRole('radio', { name: 'Yes', exact: true });
    await yesRadios.first().waitFor({ state: 'visible', timeout: 20_000 });
    const yesCount = await yesRadios.count();
    expect(yesCount, 'the order-matching checklist must have questions to answer').toBeGreaterThan(0);
    for (let i = 0; i < yesCount; i++) await yesRadios.nth(i).check();
    console.log(`[chain] checklist answered Yes x${yesCount}`);
    for (let i = 0; i < yesCount; i++) await expect(yesRadios.nth(i)).toBeChecked();

    // STEP: Submit
    const submit = page.getByRole('button', { name: 'Submit' }).first();
    await expect(submit, 'Submit enables once the outcome and checklist are answered').toBeEnabled({ timeout: 20_000 });
    await submit.click();

    // ASSERT (BLOCKING) the item leaves Verify Invoice
    await page.waitForTimeout(5_000);
    const now = await currentStepOf(refNo);
    console.log(`[chain] ${refNo} after verify: ${now}`);
    expect(now, 'the item must no longer be waiting at Verify Invoice').not.toMatch(/Verify Invoice/);
  });

  test('TC-11: Capture and Link Invoice on LOGIS (ADO #102249)', async () => {
    test.setTimeout(180_000);
    // Actioned by FatimaP (confirmed live 2026-09-14 — the item sits in her Inbox at this step).
    await actAs(SUPERVISOR.user, SUPERVISOR.password);
    await openChainItem('Capture and Link Invoice on LOGIS');

    await expect(page.getByRole('heading', { name: /Capture and Link Invoice on LOGIS/ }))
      .toBeVisible({ timeout: 30_000 });

    // STEP 4: TYPE the Payment Number. On LOGIS it is captured MANUALLY here (BAS gets it from the
    // report import instead). It is a per-invoice-line field: the Invoices grid gains a "Payment
    // Number" column at this step, and the input lives in that row's last cell.
    const invoiceRow = page.getByRole('row').filter({ hasText: /INV-LOGIS-/ }).first();
    const paymentNumber = `PN-${Date.now()}`;
    const paymentField = invoiceRow.getByRole('textbox').last();
    await paymentField.fill(paymentNumber);
    // ASSERT the payment number is displayed
    await expect(paymentField).toHaveValue(paymentNumber);
    console.log(`[chain] payment number: ${paymentNumber}`);

    // STEP 8: SELECT Yes on "Should payment proceed?".
    // Choosing No branches to Verify Invoice / Send to Business Unit, each needing a comment.
    const proceedYes = page.getByRole('radio', { name: 'Yes', exact: true }).first();
    await proceedYes.check();
    await expect(proceedYes).toBeChecked();

    // STEP 9: the confirmation ("I confirm that l have captured this invoice on payment system.")
    // is what enables Submit.
    const confirm = page.getByRole('checkbox').first();
    await confirm.check();
    await expect(confirm).toBeChecked();

    // STEP 11: Submit
    const submit = page.getByRole('button', { name: 'Submit' }).first();
    await expect(submit, 'Submit enables once payment number, proceed=Yes and the confirmation are set')
      .toBeEnabled({ timeout: 20_000 });
    await submit.click();

    // ASSERT (BLOCKING) routed onward to Pre-Authorise Payment
    await page.waitForTimeout(5_000);
    const now = await currentStepOf(refNo);
    console.log(`[chain] ${refNo} after capture-and-link: ${now}`);
    expect(now, 'the item must no longer be waiting at Capture and Link Invoice on LOGIS')
      .not.toMatch(/Capture and Link Invoice on LOGIS/);
  });

  test('TC-12: Pre-Authorise Payment (ADO #102277)', async () => {
    test.setTimeout(180_000);
    // Actioned by FatimaP — matches the actor map ("Pre-Authorise Payment: FatimaP").
    await actAs(SUPERVISOR.user, SUPERVISOR.password);
    await openChainItem('Pre-Authorise Payment');

    await expect(page.getByRole('heading', { name: /Pre-Authorise Payment/ })).toBeVisible({ timeout: 30_000 });
    // The order-matching checklist from Verify Invoice is carried through read-only (checked+disabled),
    // so this step is purely the pre-authorisation confirmation.
    await expect(page.getByRole('heading', { name: /Total Amount\(Incl\. VAT\):\s*R\s?100\b/ })).toBeVisible();

    // STEP 2: the confirmation ("I confirm that I have pre-authorised the payment.") enables Submit
    const confirm = page.getByRole('checkbox').first();
    await confirm.check();
    await expect(confirm).toBeChecked();

    // STEP 4: Submit
    const submit = page.getByRole('button', { name: 'Submit' }).first();
    await expect(submit, 'Submit enables once pre-authorisation is confirmed').toBeEnabled({ timeout: 20_000 });
    await submit.click();

    // ASSERT (BLOCKING) routed onward to Verify Voucher
    await page.waitForTimeout(5_000);
    const now = await currentStepOf(refNo);
    console.log(`[chain] ${refNo} after pre-authorise: ${now}`);
    expect(now, 'the item must no longer be waiting at Pre-Authorise Payment')
      .not.toMatch(/Pre-Authorise Payment/);
  });

  test('TC-13: Verify Voucher (ADO #102283)', async () => {
    test.setTimeout(180_000);
    await actAs(SUPERVISOR.user, SUPERVISOR.password);
    await openChainItem('Verify Voucher');

    await expect(page.getByRole('heading', { name: /Verify Voucher/ })).toBeVisible({ timeout: 30_000 });
    // Submit is gated on the confirmation, not merely present — assert the gate before satisfying it,
    // so a build that ships Submit already enabled is caught rather than silently passed over.
    const submit = page.getByRole('button', { name: 'Submit' }).first();
    await expect(submit, 'Submit must start disabled until the review is confirmed').toBeDisabled();

    // STEP 2: confirm ("I confirm that I have reviewed the payment and supporting information.")
    const confirm = page.getByRole('checkbox').first();
    await confirm.check();
    await expect(confirm).toBeChecked();

    // STEP 4: Submit
    await expect(submit, 'Submit enables once the review is confirmed').toBeEnabled({ timeout: 20_000 });
    await submit.click();

    // ASSERT (BLOCKING) routed onward to Final Authorise Payment
    await page.waitForTimeout(5_000);
    const now = await currentStepOf(refNo);
    console.log(`[chain] ${refNo} after verify voucher: ${now}`);
    expect(now, 'the item must no longer be waiting at Verify Voucher').not.toMatch(/Verify Voucher/);
  });

  test('TC-14: Final Authorise Payment — BAS report import (ADO #102284)', async () => {
    test.setTimeout(240_000);
    // Unlike every other step this is NOT an inbox action. The Final Authorise Payment form carries no
    // Submit or confirmation control at all — opened directly or via menu > "Final Authorise Payment"
    // it offers only Close. The step completes when a BAS report naming the invoice is IMPORTED, which
    // flips the payment Verified -> Authorized (verified 2026-09-14 on PAY4772: Payments Authorised 1).
    //
    // FORMAT: this app's import is set to **Notepad / fixed-width .txt** (RP0111BS "REGISTER OF
    // PAYMENTS"), NOT the .xlsx used by the old DHA-hosted app. An .xlsx is rejected so quietly it does
    // not even produce a History row. Build the file per-invoice with:
    //   node projects/DHA-Invoice-Tracking/scripts/make-bas-text-report.js \
    //     --payment <n> --invoice <INV-...> --supplier <ENT NO> --amount <n> --type INV --out <path>
    // (--type INV for LOGIS; SUNDRY for BAS.)
    //
    // The import is run as Admin: FatimaP can reach the page by URL but only Admin carries the
    // BAS Report menu.
    const basReport = process.env.BAS_REPORT
      || path.join(__dirname, '..', '..', '..', '..', 'test-data', 'bas-text-report-PAY4772-LOGIS.txt');

    await actAs('Admin', '123qwe');
    await page.goto(`${BASE}/dynamic/Shesha.SaGovInvoiceTracking/SaGov-BAS-report-import`);
    await page.waitForLoadState('networkidle');

    // STEP 2: ASSERT the BAS Report Import view opens with Import and History tabs
    await expect(page.getByText('BAS Report Import').first()).toBeVisible({ timeout: 30_000 });
    await expect(page.getByRole('tab', { name: /Import/ })).toBeVisible();
    await expect(page.getByRole('tab', { name: /History/ })).toBeVisible();

    // STEP 4: attach the BAS report
    const fileChooserPromise = page.waitForEvent('filechooser');
    await page.getByRole('button', { name: /press to upload/i }).first().click();
    (await fileChooserPromise).setFiles(basReport);
    // Wait for the upload to COMPLETE (rendered size), not just for the name — the same race that
    // breaks the invoice-line commit applies to any upload on these forms.
    await expect(page.getByText(/\.(txt|xlsx)\s*\([\d.]+\s*[kKmM]B\)/).first(),
      'BAS report must finish uploading before Import').toBeVisible({ timeout: 60_000 });
    await page.waitForTimeout(2_000);

    // STEP 6: Import
    const importBtn = page.getByRole('button', { name: 'Import', exact: true }).first();
    await expect(importBtn, 'Import enables once the report is attached').toBeEnabled({ timeout: 20_000 });
    await importBtn.click();
    await page.waitForTimeout(10_000);

    // STEP 7/8: History must record the import and what it authorised
    await page.getByRole('tab', { name: /History/ }).click();
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(4_000);
    const history = (await page.locator('main').innerText()).replace(/\s+/g, ' ').trim();
    console.log(`[chain] BAS import history (head): ${history.slice(0, 300)}`);

    // ASSERT (BLOCKING) the import actually authorised a payment.
    // Deliberately NOT asserted via currentStepOf(): this TC runs as Admin, the item is not in Admin's
    // inbox, so "no longer at Final Authorise Payment" would pass whether or not anything happened.
    // The History row is the real observable — a silently-rejected file produces no row at all.
    const topRow = (await page.getByRole('row').nth(1).innerText()).replace(/\s+/g, ' ').trim();
    console.log(`[chain] import history top row: ${topRow}`);
    expect(topRow, 'the newest import must be this run\'s file').toContain(path.basename(basReport));
    expect(topRow, 'the import must report success').toMatch(/\bYes\b/);
    const authorised = Number((topRow.match(/(\d+)\s*$/) || [, '0'])[1]);
    expect(authorised, 'the import must authorise at least one payment').toBeGreaterThanOrEqual(1);
  });

  test('TC-15: Attach Payment Stub (ADO #102285)', async () => {
    test.setTimeout(240_000);
    // Like Final Authorise Payment, this completes by IMPORT rather than a form action, and runs as
    // Admin (only Admin carries the Payment Stubs Import menu).
    //
    // The stub is an RP007BS 102-line fixed-width .txt. Build it per-payment with:
    //   node projects/DHA-Invoice-Tracking/scripts/make-payment-stub.js \
    //     --payment <no> --invoice <INV-...> --po <OR-...> --amount <n> --out <path>
    // ⚠️ LOGIS matches the stub on the PURCHASE ORDER NUMBER (--po), BAS matches on PAYMENT NUMBER.
    // ⚠️ The stub's PAYMENT NUMBER field is only 11 chars, so the `PN-<13 digits>` value TC-11 types
    //    cannot be represented in full — fine for LOGIS (matched on PO), but it means a LOGIS stub
    //    cannot round-trip the captured payment number exactly.
    const stub = process.env.PAYMENT_STUB
      || path.join(__dirname, '..', '..', '..', '..', 'test-data', 'payment-stub-PAY4812-LOGIS.txt');

    await actAs('Admin', '123qwe');
    await page.goto(`${BASE}/dynamic/Shesha.SaGovInvoiceTracking/SaGov-payment-stub-imports`);
    await page.waitForLoadState('networkidle');

    // STEP 1: ASSERT the Payment Stub Import view opens with Import and History tabs
    await expect(page.getByRole('tab', { name: /Import/ })).toBeVisible({ timeout: 30_000 });
    await expect(page.getByRole('tab', { name: /History/ })).toBeVisible();

    // STEP 3: attach the stub, waiting for the upload to COMPLETE (rendered size), not just the name
    const fileChooserPromise = page.waitForEvent('filechooser');
    await page.getByRole('button', { name: /press to upload/i }).first().click();
    (await fileChooserPromise).setFiles(stub);
    await expect(page.getByText(/\.txt\s*\([\d.]+\s*[kKmM]B\)/).first(),
      'payment stub must finish uploading before Import').toBeVisible({ timeout: 60_000 });
    await page.waitForTimeout(2_000);

    // STEP 5: Import
    const importBtn = page.getByRole('button', { name: 'Import', exact: true }).first();
    await expect(importBtn, 'Import enables once the stub is attached').toBeEnabled({ timeout: 20_000 });
    await importBtn.click();
    await page.waitForTimeout(12_000);

    // STEP 6/7: History must record the import and what it confirmed. A silently-rejected file adds no
    // row at all, so asserting on the row is what distinguishes "worked" from "quietly did nothing".
    await page.getByRole('tab', { name: /History/ }).click();
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(5_000);
    const topRow = (await page.getByRole('row').nth(1).innerText()).replace(/\s+/g, ' ').trim();
    console.log(`[chain] stub import history top row: ${topRow}`);
    expect(topRow, 'the newest import must be this run\'s stub').toContain(path.basename(stub));
    expect(topRow, 'the stub import must report success').toMatch(/\bYes\b/);
    const confirmed = Number((topRow.match(/(\d+)\s*$/) || [, '0'])[1]);
    expect(confirmed, 'the stub import must confirm at least one payment').toBeGreaterThanOrEqual(1);
  });

  test('TC-16: Capture Filing (ADO #102286)', async () => {
    test.setTimeout(180_000);
    // Actioned by ThabisoM. logis.md names GwenB / Gwen Simbeni — that is the OLD app's filing role and
    // does not exist on this tenant. The step was reassigned to ThabisoM on 2026-09-14 (it had been on
    // `aakil`, whose password is unknown).
    await actAs(FILING.user, FILING.password);
    await openChainItem('Capture Filing');

    await expect(page.getByRole('heading', { name: /Capture Filing/ })).toBeVisible({ timeout: 30_000 });
    // Submit is gated on the filing details + confirmation; assert the gate before satisfying it.
    const submit = page.getByRole('button', { name: 'Submit' }).first();
    await expect(submit, 'Submit must start disabled until filing details are captured').toBeDisabled();

    // Filing Details: Batch Number / Box Number / File Range, in that order.
    // NOTE: logis.md step 2 says Batch Number is pre-populated READ-ONLY from Capture & Link. On this
    // build it is an editable REQUIRED field (marked *) — captured here rather than asserted read-only.
    // These captions are plain text, not <label for=...>, so they cannot be addressed with getByLabel;
    // they are the first three textboxes in the form (the fourth is Comments).
    const filingFields = page.getByRole('textbox');
    const batchNumber = `BATCH-${Date.now().toString().slice(-6)}`;
    const boxNumber = `BOX-${Date.now().toString().slice(-4)}`;
    const fileRange = 'A1-A50';

    await filingFields.nth(0).fill(batchNumber);
    await filingFields.nth(1).fill(boxNumber);
    await filingFields.nth(2).fill(fileRange);
    // ASSERT each value landed — positional locators are exactly the kind that silently fill the wrong box
    await expect(filingFields.nth(0)).toHaveValue(batchNumber);
    await expect(filingFields.nth(1)).toHaveValue(boxNumber);
    await expect(filingFields.nth(2)).toHaveValue(fileRange);
    console.log(`[chain] filing: batch=${batchNumber} box=${boxNumber} range=${fileRange}`);

    // STEP 8: confirmation ("I confirm that I have captured all the filing details ...") enables Submit
    const confirm = page.getByRole('checkbox').first();
    await confirm.check();
    await expect(confirm).toBeChecked();

    // STEP 10: Submit
    await expect(submit, 'Submit enables once filing details and the confirmation are captured')
      .toBeEnabled({ timeout: 20_000 });
    await submit.click();

    // ASSERT (BLOCKING) the process ends — the item leaves Capture Filing and this user's queue
    await page.waitForTimeout(6_000);
    const now = await currentStepOf(refNo);
    console.log(`[chain] ${refNo} after filing: ${now}`);
    expect(now, 'the filed item must no longer be waiting at Capture Filing').not.toMatch(/Capture Filing/);
  });
});
