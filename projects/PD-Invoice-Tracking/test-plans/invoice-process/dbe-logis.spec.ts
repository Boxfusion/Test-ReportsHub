// AUTO-RECORDED from test-plans/invoice-process/dbe-logis.md
// Source: Azure DevOps test plan #102133 "ITS Automation Test Cases".
// The .md plan is canonical. AI-repair will patch failing lines in this file.
//
// Recorded live on 2026-09-14 against https://pd-invoicetracking-adminportal-qa.shesha.app (DBE tenant).
// Process: "DBE LOGIS Request For Payment" — selected with exact:true, because "LOGIS Request For
// Payment" sits directly below it on the same Create New menu and is a DIFFERENT process (logis.spec.ts).
//
// Hard-won notes carried over from logis.spec.ts — do not "simplify" these away:
//  * The Invoices row's first two textboxes are date pickers (placeholder "Select date"), so an
//    unqualified .getByRole('textbox').first() lands on Invoice Date, NOT Invoice No.
//  * Wait for an attachment upload to COMPLETE (rendered file size), not just for the filename —
//    committing the row mid-upload fails with "Create failed" and silently loses the row.
//  * Shesha grid filters only apply on ENTER, and the Inbox pages at 10/page without sorting
//    newest-first, so scanning page 1 gives false "not in this user's inbox" readings.
//  * login() must wait for the login form to DETACH; networkidle can settle before auth completes and
//    the next goto() gets bounced back to /login.
//
// DBE-specific vs plain LOGIS: the register form is "Register Scan and Upload Invoice", `Business Unit`
// is called **End-user**, there is an extra **LOGIS Capturer** select, and a **Park Invoice** action
// sits alongside Submit (not yet exercised).

import { test, expect, Page, BrowserContext } from '@playwright/test';
import * as path from 'path';

const BASE = 'https://pd-invoicetracking-adminportal-qa.shesha.app';
const APP_URL = `${BASE}/login`;
const MY_ITEMS_URL = `${BASE}/dynamic/Shesha.Workflow/workflows-my-items`;
const INBOX_URL = `${BASE}/dynamic/Shesha.Workflow/workflows-inbox`;
const INVOICE_PDF = path.join(__dirname, '..', '..', '..', '..', 'test-data', 'pdf-test.pdf');

// Step -> actor (user-supplied 2026-09-14). All passwords 123qwe.
const CAPTURER = { user: 'JohanV', password: '123qwe' };       // Register, Match to Order and Verify
const END_USER = { user: 'ThabisoM', password: '123qwe' };     // End User Confirm Delivery + LOGIS Capture
const SUPERVISOR = { user: 'LeratoM', password: '123qwe' };    // Supervisor Confirm Delivery
const PAYMENTS = { user: 'FatimaP', password: '123qwe' };      // Pre-Authorise / Authorise Payment

// These two register-form selects decide downstream routing, so they are set to accounts we can sign in
// as: End-user -> End User Confirm Delivery, LOGIS Capturer -> Capture and Link Invoice on LOGIS.
const END_USER_SEARCH = 'Thabiso';
const LOGIS_CAPTURER_SEARCH = 'Thabiso';

async function login(page: Page, user: string, password: string) {
  await page.goto(APP_URL);
  const username = page.getByRole('textbox', { name: 'Username' });
  await username.waitFor({ state: 'visible', timeout: 120_000 });
  await username.fill(user);
  await page.getByRole('textbox', { name: 'Password' }).fill(password);
  await page.getByRole('button', { name: 'Sign In' }).click();
  // Wait for the form to go away rather than for networkidle, which can settle before auth completes.
  // Not waitForURL(/\/dynamic\//): homeUrl is per-user, so not every account lands on a /dynamic/ route.
  await username.waitFor({ state: 'detached', timeout: 60_000 }).catch(() => {});
  await page.waitForLoadState('networkidle');
}

test.describe.serial('DBE LOGIS — Invoice Tracking Process', () => {
  let context: BrowserContext;
  let page: Page;
  let currentUser = '';
  // CHAIN_REF pins a run to an invoice that already exists, so a downstream TC can carry the item that
  // is furthest along instead of registering a fresh one.
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

  // Open this chain's item from the Inbox. Filters by Ref No where possible; on a miss it reports what
  // the queue actually holds, so a wrong actor says so directly instead of costing another invoice.
  async function openChainItem(stepText: string) {
    await page.goto(INBOX_URL);
    await page.waitForLoadState('networkidle');
    for (let i = 0; i < 25; i++) {
      if ((await page.getByRole('row').count()) > 1) break;
      await page.waitForTimeout(1_000);
    }

    const gridFilter = page.locator('.sha-global-table-filter input').first();
    if (refNo && (await gridFilter.count())) {
      await gridFilter.fill(refNo);
      await gridFilter.press('Enter');   // filling alone does NOT apply the filter
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

  async function currentStepOf(ref: string): Promise<string> {
    await page.goto(INBOX_URL);
    await page.waitForLoadState('networkidle');
    for (let i = 0; i < 25; i++) {
      if ((await page.getByRole('row').count()) > 1) break;
      await page.waitForTimeout(1_000);
    }
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

  // Set an antd select that may already carry an order-derived value. Clearing first is what makes a
  // replacement stick — typing over a populated select leaves it empty or reverts it.
  async function setSelect(index: number, search: string, label: string) {
    const sel = page.locator('.ant-select').nth(index);
    const before = await sel.locator('.ant-select-selection-item').innerText().catch(() => '(empty)');
    if (before.includes(search)) {
      console.log(`[chain] ${label} already "${before}" — left as is`);
      return before;
    }
    await sel.hover();
    const clear = sel.locator('.ant-select-clear');
    if (await clear.count()) {
      await clear.click({ force: true });
      await page.waitForTimeout(1_200);
    }
    await sel.locator('.ant-select-selector').click();
    await page.keyboard.type(search);

    // The dropdown does not always filter immediately after typing. Taking .first() blindly then picks
    // the first UNFILTERED option — that silently set End-user to "Aakil Sivnannan" while searching
    // "Thabiso". Wait for an option that actually matches, and fail loudly listing what was on offer.
    const options = page.locator('.ant-select-dropdown:not(.ant-select-dropdown-hidden) .ant-select-item-option');
    const match = options.filter({ hasText: search }).first();
    await match.waitFor({ state: 'visible', timeout: 15_000 }).catch(async () => {
      const offered = await options.allInnerTexts().catch(() => []);
      throw new Error(`${label}: no option matching "${search}". Dropdown offered: ${JSON.stringify(offered.slice(0, 12))}`);
    });

    const picked = (await match.innerText()).trim();
    await match.click();
    await page.waitForTimeout(2_000);

    // Verify the value actually committed to THIS select, not merely that something was clicked.
    const after = await sel.locator('.ant-select-selection-item').innerText().catch(() => '(empty)');
    console.log(`[chain] ${label}: ${before} -> ${after}`);
    expect(after, `${label} must be set to a "${search}" account`).toContain(search);
    return picked;
  }

  test('TC-01: Login (JohanV)', async () => {
    await actAs(CAPTURER.user, CAPTURER.password);
    await expect(page.getByRole('menuitem', { name: /Workflows/ })).toBeVisible();
    // JohanV is non-admin: the Live|Ready|Latest control does not exist for him, so this run exercises
    // the PUBLISHED (Live) forms. Recorded rather than silently assumed.
    const modeTrigger = page.locator('.ant-dropdown-trigger').filter({ hasText: /^(Live|Ready|Latest)$/ });
    console.log(`[mode] view-mode control present for ${CAPTURER.user}: ${(await modeTrigger.count()) > 0}`);
  });

  test('TC-02: Register Scan and Upload Invoice', async () => {
    test.setTimeout(300_000);
    await actAs(CAPTURER.user, CAPTURER.password);

    await page.goto(MY_ITEMS_URL);
    await page.waitForLoadState('networkidle');

    // STEP 2/3: Create New -> DBE LOGIS Request For Payment. `exact` matters: "LOGIS Request For
    // Payment" is a different process on the same menu. The dropdown intermittently misses the first
    // click, so confirm the menu actually opened instead of failing on a timing wobble.
    const processItem = page.getByRole('menuitem', { name: 'DBE LOGIS Request For Payment', exact: true });
    for (let attempt = 0; attempt < 3; attempt++) {
      if (await processItem.isVisible().catch(() => false)) break;
      await page.getByRole('button', { name: /Create New/i }).first().click();
      await page.waitForTimeout(2_000);
    }
    await processItem.waitFor({ state: 'visible', timeout: 20_000 });
    await processItem.click();
    await page.waitForLoadState('networkidle');

    // ASSERT the register page is displayed, and wait for it to hydrate — the heading paints long
    // before the controls do.
    await expect(page.getByRole('heading', { name: /Register Scan and Upload Invoice/ }))
      .toBeVisible({ timeout: 60_000 });
    await page.getByRole('textbox').first().waitFor({ state: 'visible', timeout: 60_000 });
    await page.waitForTimeout(1_500);

    refNo = (await page.locator('main').innerText()).match(/PAY\d+\/\d{4}/)?.[0] || '';
    expect(refNo, 'Ref No minted for the chain').toMatch(/PAY\d+\/\d{4}/);

    // ASSERT Date Received auto-populated with today
    const today = new Date();
    const dd = String(today.getDate()).padStart(2, '0');
    const mm = String(today.getMonth() + 1).padStart(2, '0');
    const todayStr = `${dd}/${mm}/${today.getFullYear()}`;
    await expect(page.getByRole('textbox').first()).toHaveValue(todayStr);

    // STEP 4/5: pick an order. Shesha grids are .sha-table (.tr.tr-body rows), NOT .ant-table.
    await page.getByRole('button', { name: 'ellipsis' }).first().click();
    const picker = page.getByRole('dialog').first();
    await picker.waitFor({ state: 'visible', timeout: 20_000 });
    await page.waitForTimeout(1_500);
    const orderRow = picker.locator('.tr.tr-body').first();
    orderNo = ((await orderRow.innerText()).match(/OR-\d+/) || [''])[0];
    console.log(`[chain] order: ${(await orderRow.innerText()).replace(/\s+/g, ' ').trim().slice(0, 110)}`);
    await orderRow.dblclick();
    await page.getByText('Fetching data...').first().waitFor({ state: 'hidden', timeout: 30_000 }).catch(() => {});
    await page.waitForTimeout(3_000);

    await expect(page.locator('.ant-select-selection-item').filter({ hasText: orderNo })).toBeVisible();
    await expect(page.getByRole('heading', { name: 'Supplier Details' })).toBeVisible();

    // STEP 6/7: selects are [0] Order No, [1] End-user, [2] LOGIS Capturer.
    // These decide who actions End User Confirm Delivery and Capture & Link downstream, so they must be
    // accounts we hold credentials for — otherwise the chain stalls on an inbox we cannot open.
    // setSelect verifies each field individually. Asserting the JOINED selections instead would pass
    // whenever ANY select matched — that is how a wrong End-user slipped through on PAY4905 while
    // LOGIS Capturer alone satisfied the check.
    const endUserName = await setSelect(1, END_USER_SEARCH, 'End-user');
    const capturerName = await setSelect(2, LOGIS_CAPTURER_SEARCH, 'LOGIS Capturer');

    // --- Invoice line ---------------------------------------------------------------------------
    // Columns: Invoice Date | Service Delivery Date | Invoice No | Invoice Amount | Attachment.
    // The first two are antd date pickers, so exclude them when reaching for Invoice No.
    const editRow = page.getByRole('row').filter({ has: page.getByRole('button', { name: 'plus-circle' }) });

    const invoiceDate = editRow.getByRole('textbox', { name: 'Select date' }).nth(0);
    await invoiceDate.click();
    await invoiceDate.fill(todayStr);
    await invoiceDate.press('Enter');

    const serviceDate = editRow.getByRole('textbox', { name: 'Select date' }).nth(1);
    await serviceDate.click();
    await serviceDate.fill(todayStr);
    await serviceDate.press('Enter');

    invoiceNo = `INV-DBE-${Date.now()}`;
    const invoiceNoField = editRow.locator('input:not([placeholder="Select date"])').first();
    await invoiceNoField.fill(invoiceNo);
    await expect(invoiceNoField).toHaveValue(invoiceNo);

    await editRow.getByRole('spinbutton').first().fill('100');

    // Attach, then wait for the upload to COMPLETE (rendered size). Committing mid-upload fails with
    // "Create failed" and loses the row.
    const fileChooserPromise = page.waitForEvent('filechooser');
    await editRow.getByRole('button', { name: /upload/i }).first().click();
    (await fileChooserPromise).setFiles(INVOICE_PDF);
    await expect(
      editRow.getByText(/pdf-test\.pdf\s*\([\d.]+\s*[kKmM]B\)/).first(),
      'invoice attachment must finish uploading before the row is committed'
    ).toBeVisible({ timeout: 60_000 });
    await page.waitForTimeout(2_000);

    // STEP 15: commit the row
    await page.getByRole('button', { name: 'plus-circle' }).first().click();
    await page.waitForTimeout(3_000);
    await expect(page.getByText(/Total Amount:\s*R\s?100\b/)).toBeVisible({ timeout: 20_000 });

    console.log(`[chain] ${refNo} — order ${orderNo}, invoice ${invoiceNo}, end-user ${endUserName}, capturer ${capturerName}`);

    // STEP 16: Submit (NOT Park Invoice — that branch is not yet recorded)
    const submit = page.getByRole('button', { name: 'Submit', exact: true }).first();
    await expect(submit, 'Submit enables once the required fields and invoice line are captured')
      .toBeEnabled({ timeout: 20_000 });
    await submit.click();

    // ASSERT (BLOCKING) the item leaves the register step. Submit posts the invoice + attachment and
    // starts the workflow; on QA that runs past a 15s budget.
    await page.waitForTimeout(6_000);
    const now = await currentStepOf(refNo);
    console.log(`[chain] ${refNo} after register: ${now}`);
    expect(now, 'the item must no longer be at the register step')
      .not.toMatch(/Register Scan and Upload Invoice/);
  });

  test('TC-03: Match to Order and Verify', async () => {
    test.setTimeout(180_000);
    await actAs(CAPTURER.user, CAPTURER.password);
    await openChainItem('Match To Order And Verify');

    await expect(page.getByRole('heading', { name: /Match To Order And Verify/i })).toBeVisible({ timeout: 30_000 });
    await expect(page.getByRole('heading', { name: 'Order Matching Outcome:' })).toBeVisible();

    // Happy path. The other three branch away: "Send for end-user related query" and "Send for supplier
    // related query" route to the query steps, "Reject Invoice" to Review Invoice Rejection.
    const complete = page.getByRole('radio', { name: 'Verification is complete', exact: true });
    await complete.check();
    await expect(complete).toBeChecked();

    // Some builds attach a Yes/No matching checklist below the outcome. Count it explicitly and report:
    // a loop that answers N radios and then asserts those same N are checked proves NOTHING when N is 0
    // — that exact shape gave a vacuous pass on the LOGIS suite.
    // count() is an IMMEDIATE query — unlike expect() it does not retry — so reading it before the
    // radios paint returns 0, and loops bounded by it then answer nothing and assert nothing while the
    // test still passes. Wait for them, then hold a floor.
    const yesRadios = page.getByRole('radio', { name: 'Yes', exact: true });
    await yesRadios.first().waitFor({ state: 'visible', timeout: 20_000 });
    const yesCount = await yesRadios.count();
    expect(yesCount, 'the order-matching checklist must have questions to answer').toBeGreaterThan(0);
    console.log(`[chain] order-matching checklist questions: ${yesCount}`);
    for (let i = 0; i < yesCount; i++) await yesRadios.nth(i).check();
    for (let i = 0; i < yesCount; i++) await expect(yesRadios.nth(i)).toBeChecked();

    const submit = page.getByRole('button', { name: 'Submit', exact: true }).first();
    await expect(submit, 'Submit enables once the matching outcome is chosen').toBeEnabled({ timeout: 20_000 });
    await submit.click();

    // ASSERT (BLOCKING) the item leaves this step. Report where it went rather than asserting a guessed
    // next-step name — routing on this process is still being established.
    await page.waitForTimeout(6_000);
    const now = await currentStepOf(refNo);
    console.log(`[chain] ${refNo} after match-to-order: ${now}`);
    expect(now, 'the item must no longer be waiting at Match To Order And Verify')
      .not.toMatch(/Match To Order And Verify/i);
  });

  test('TC-04: End-user Confirm Delivery', async () => {
    test.setTimeout(180_000);
    // Actioned by whoever was set as **End-user** on the register form — TC-02 sets ThabisoM, which is
    // why the item lands in his Inbox. Change END_USER_SEARCH and this actor moves with it.
    await actAs(END_USER.user, END_USER.password);
    await openChainItem('End-user Confirm Deliv');

    await expect(page.getByRole('heading', { name: /End-user Confirm Delivery/i })).toBeVisible({ timeout: 30_000 });
    await expect(page.getByRole('heading', { name: 'End-user Response:' })).toBeVisible();
    await expect(page.getByRole('radio')).toHaveCount(3);

    // Happy path. The others branch: "not delivered / unacceptable" -> Review Invoice Rejection;
    // "I am the wrong person to confirm the delivery" -> Reroute to correct end-user.
    const satisfactory = page.getByRole('radio', { name: /delivered satisfactory/i });
    await satisfactory.check();
    await expect(satisfactory).toBeChecked();

    const submit = page.getByRole('button', { name: 'Submit', exact: true }).first();
    await expect(submit, 'Submit enables once an End-user Response is chosen').toBeEnabled({ timeout: 20_000 });
    await submit.click();

    await page.waitForTimeout(6_000);
    const now = await currentStepOf(refNo);
    console.log(`[chain] ${refNo} after end-user confirm: ${now}`);
    expect(now, 'the item must no longer be waiting at End-user Confirm Delivery')
      .not.toMatch(/End-user Confirm Deliv/);
  });

  test('TC-05: End-user Supervisor Confirm Delivery', async () => {
    test.setTimeout(180_000);
    // Actioned by LeratoM. NOTE the real step name is "End-user **Supervisor** Confirm Delivery" — the
    // actor map calls it "Supervisor Confirm Delivery", and matching on that shorter string alone would
    // also match the preceding "End-user Confirm Delivery" step.
    await actAs(SUPERVISOR.user, SUPERVISOR.password);
    await openChainItem('End-user Supervisor Confirm Delivery');

    await expect(page.getByRole('heading', { name: /End-user Supervisor Confirm Delivery/i }))
      .toBeVisible({ timeout: 30_000 });
    await expect(page.getByRole('heading', { name: 'Supervisor Response:' })).toBeVisible();
    await expect(page.getByRole('radio')).toHaveCount(2);

    // Happy path; the other option ("has not been delivered ... should not be paid") branches to
    // Review Invoice Rejection.
    const satisfactory = page.getByRole('radio', { name: /delivered satisfactory/i });
    await satisfactory.check();
    await expect(satisfactory).toBeChecked();

    const submit = page.getByRole('button', { name: 'Submit', exact: true }).first();
    await expect(submit, 'Submit enables once a Supervisor Response is chosen').toBeEnabled({ timeout: 20_000 });
    await submit.click();

    await page.waitForTimeout(6_000);
    const now = await currentStepOf(refNo);
    console.log(`[chain] ${refNo} after supervisor confirm: ${now}`);
    expect(now, 'the item must no longer be waiting at End-user Supervisor Confirm Delivery')
      .not.toMatch(/End-user Supervisor Confirm Delivery/i);
  });

  test('TC-06: Capture and Link Invoice on LOGIS', async () => {
    test.setTimeout(180_000);
    // Actioned by whoever was set as **LOGIS Capturer** on the register form — TC-02 sets ThabisoM.
    await actAs(END_USER.user, END_USER.password);
    await openChainItem('Capture and Link Invoice on LOGIS');

    await expect(page.getByRole('heading', { name: /Capture and Link Invoice on LOGIS/i }))
      .toBeVisible({ timeout: 30_000 });

    // Payment Number is captured MANUALLY here on LOGIS-style flows. It is a per-invoice-line field:
    // the Invoices grid gains a "Payment Number" column at this step and the input sits in that row's
    // last cell. Kept short — the payment-stub file format allows only 11 characters for it.
    const invoiceRow = page.getByRole('row').filter({ hasText: /INV-DBE-/ }).first();
    const paymentNumber = `PN-${Date.now().toString().slice(-7)}`;
    const paymentField = invoiceRow.getByRole('textbox').last();
    await paymentField.fill(paymentNumber);
    await expect(paymentField).toHaveValue(paymentNumber);
    console.log(`[chain] payment number: ${paymentNumber}`);

    // "Should payment proceed?" — Yes. No branches to the verify / send-to-end-user options.
    const proceedYes = page.getByRole('radio', { name: 'Yes', exact: true }).first();
    await proceedYes.check();
    await expect(proceedYes).toBeChecked();

    // The confirmation is what enables Submit.
    const confirm = page.getByRole('checkbox').first();
    await confirm.check();
    await expect(confirm).toBeChecked();

    const submit = page.getByRole('button', { name: 'Submit', exact: true }).first();
    await expect(submit, 'Submit enables once payment number, proceed=Yes and the confirmation are set')
      .toBeEnabled({ timeout: 20_000 });
    await submit.click();

    await page.waitForTimeout(6_000);
    const now = await currentStepOf(refNo);
    console.log(`[chain] ${refNo} after capture-and-link: ${now}`);
    expect(now, 'the item must no longer be waiting at Capture and Link Invoice on LOGIS')
      .not.toMatch(/Capture and Link Invoice on LOGIS/i);
  });

  test('TC-07: Pre-Authorise Payment', async () => {
    test.setTimeout(180_000);
    // Pre-Authorise Payment is assigned by ROLE, not to a named person: the item appears in BOTH
    // FatimaP's and JohanV's inboxes (confirmed live 2026-09-14). Actioned here as FatimaP per the
    // actor map; either account can complete it.
    await actAs(PAYMENTS.user, PAYMENTS.password);
    await openChainItem('Pre-Authorise Payment');

    await expect(page.getByRole('heading', { name: /Pre-Authorise Payment/i })).toBeVisible({ timeout: 30_000 });
    await expect(page.getByRole('heading', { name: /Total Amount\(Incl\. VAT\):\s*R\s?100\b/ })).toBeVisible();

    // Unlike the LOGIS equivalent, Submit is not merely disabled here — it does not EXIST until a
    // Verification outcome is chosen. Asserting toBeDisabled() first therefore fails with
    // "element(s) not found" on a perfectly healthy form. Assert its absence instead, then its arrival.
    const submit = page.getByRole('button', { name: 'Submit', exact: true }).first();
    expect(await submit.count(), 'Submit should not be present before a Verification outcome is chosen')
      .toBe(0);

    // The order-matching checklist above is carried through read-only (checked + disabled), so the only
    // live inputs are the outcome and the confirmation.
    const proceed = page.getByRole('radio', { name: 'Verification is complete - process payment', exact: true });
    await proceed.check();
    await expect(proceed).toBeChecked();

    const confirm = page.getByRole('checkbox').first();
    await confirm.check();
    await expect(confirm).toBeChecked();

    await expect(submit, 'Submit appears once the outcome and confirmation are set')
      .toBeEnabled({ timeout: 20_000 });
    await submit.click();

    await page.waitForTimeout(6_000);
    const now = await currentStepOf(refNo);
    console.log(`[chain] ${refNo} after pre-authorise: ${now}`);
    expect(now, 'the item must no longer be waiting at Pre-Authorise Payment')
      .not.toMatch(/Pre-Authorise Payment/i);
  });

  test('TC-08: Authorise Payment', async () => {
    test.setTimeout(180_000);
    await actAs(PAYMENTS.user, PAYMENTS.password);
    await openChainItem('Authorise Payment');

    await expect(page.getByRole('heading', { name: /Authorise Payment/i })).toBeVisible({ timeout: 30_000 });
    await expect(page.getByRole('heading', { name: /Total Amount\(Incl\. VAT\):\s*R\s?100\b/ })).toBeVisible();

    // This step carries a LIVE Yes/No checklist (Pre-Authorise's equivalent was read-only/disabled).
    // Answer only the enabled ones — the disabled entries are carried through from earlier steps.
    // Count them explicitly: a loop that answers N then asserts those same N proves nothing when N is 0.
    const yesRadios = page.getByRole('radio', { name: 'Yes', exact: true });
    const total = await yesRadios.count();
    let answered = 0;
    for (let i = 0; i < total; i++) {
      const r = yesRadios.nth(i);
      if (!(await r.isEnabled().catch(() => false))) continue;
      await r.check();
      await expect(r).toBeChecked();
      answered++;
    }
    console.log(`[chain] authorise checklist: ${answered} answered of ${total} Yes radios`);
    expect(answered, 'the authorise checklist must have live questions to answer').toBeGreaterThan(0);

    const confirm = page.getByRole('checkbox').first();
    await confirm.check();
    await expect(confirm).toBeChecked();

    // As on Pre-Authorise, Submit materialises once the form is satisfied rather than sitting disabled.
    const submit = page.getByRole('button', { name: 'Submit', exact: true }).first();
    await expect(submit, 'Submit appears once the checklist and confirmation are complete')
      .toBeEnabled({ timeout: 20_000 });
    await submit.click();

    await page.waitForTimeout(6_000);
    const now = await currentStepOf(refNo);
    console.log(`[chain] ${refNo} after authorise: ${now}`);
    expect(now, 'the item must no longer be waiting at Authorise Payment')
      .not.toMatch(/\bAuthorise Payment\b/i);
  });

  test('TC-09: Attach Payment Stub', async () => {
    test.setTimeout(240_000);
    // Completes by IMPORT, not a form action, and runs as **Admin** — only Admin carries the Payment
    // Stubs Import menu (FatimaP can reach the page by URL but the menu is Admin's).
    //
    // The stub is an RP007BS 102-line fixed-width .txt, built per-payment:
    //   node projects/DHA-Invoice-Tracking/scripts/make-payment-stub.js \
    //     --payment <no> --invoice <INV-...> --po <OR-...> --amount <n> --out <path>
    // ⚠️ Matched on the PURCHASE ORDER NUMBER (--po), and the PAYMENT NUMBER field is only 11 chars —
    // which is why TC-06 keeps the captured payment number short enough to round-trip.
    const stub = process.env.PAYMENT_STUB
      || path.join(__dirname, '..', '..', '..', '..', 'test-data', 'payment-stub-PAY4909-DBE.txt');

    await actAs('Admin', '123qwe');
    await page.goto(`${BASE}/dynamic/Shesha.SaGovInvoiceTracking/SaGov-payment-stub-imports`);
    await page.waitForLoadState('networkidle');

    await expect(page.getByRole('tab', { name: /Import/ })).toBeVisible({ timeout: 30_000 });
    await expect(page.getByRole('tab', { name: /History/ })).toBeVisible();

    // Attach, waiting for the upload to COMPLETE (rendered size) rather than just the filename.
    const fileChooserPromise = page.waitForEvent('filechooser');
    await page.getByRole('button', { name: /press to upload/i }).first().click();
    (await fileChooserPromise).setFiles(stub);
    await expect(page.getByText(/\.txt\s*\([\d.]+\s*[kKmM]B\)/).first(),
      'payment stub must finish uploading before Import').toBeVisible({ timeout: 60_000 });
    await page.waitForTimeout(2_000);

    const importBtn = page.getByRole('button', { name: 'Import', exact: true }).first();
    await expect(importBtn, 'Import enables once the stub is attached').toBeEnabled({ timeout: 20_000 });
    await importBtn.click();
    await page.waitForTimeout(12_000);

    // The History row is the real observable: a silently-rejected file adds no row at all, which is how
    // an .xlsx in a Notepad-configured import fails without any visible error.
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
});
