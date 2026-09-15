// AUTO-RECORDED from test-plans/invoice-process/bas.md
// Source: Azure DevOps test plan #102133 "ITS Automation Test Cases", suite #102355 "BAS"
// The .md plan is canonical. AI-repair will patch failing lines in this file.
// Do not hand-edit unless you are also updating the .md plan.
//
// Recorded live against QA on 2026-06-18 (login + TC-02 Register and Upload Invoice).
// TC-03..TC-14 are downstream multi-role workflow steps that require an invoice already
// routed to that step (and, in production, a different role login). They are stubbed as
// test.skip until the chain / role accounts are wired — see bas.md for the full steps.

import { test, expect, Page, BrowserContext } from '@playwright/test';
import * as path from 'path';

const APP_URL = 'https://pd-invoicetracking-adminportal-qa.shesha.app/login';
const MY_ITEMS_URL = 'https://pd-invoicetracking-adminportal-qa.shesha.app/dynamic/Shesha.Workflow/workflows-my-items';
const INBOX_URL = 'https://pd-invoicetracking-adminportal-qa.shesha.app/dynamic/Shesha.Workflow/workflows-inbox';
// Register Invoice is actioned by JohanV on the Shesha app (2026-09-14); ThulileM was the old host.
const ADMIN = { user: 'JohanV', password: '123qwe' };
const INVOICE_PDF = path.join(__dirname, '..', '..', '..', '..', 'test-data', 'pdf-test.pdf');

// QA runs on an Azure App Service that idles out between runs. On a cold start the shell HTML answers
// immediately but the SPA takes far longer than the 15s actionTimeout to render the login form, so the
// Username fill times out and every downstream TC fails as a fake "login broken". Wait for the form
// explicitly with a cold-start-sized budget before touching it.
async function login(page: Page, user: string, password: string) {
  await page.goto(APP_URL);
  const username = page.getByRole('textbox', { name: 'Username' });
  await username.waitFor({ state: 'visible', timeout: 120_000 });
  // STEP login.1: TYPE Username field
  await username.fill(user);
  // STEP login.2: TYPE Password field
  await page.getByRole('textbox', { name: 'Password' }).fill(password);
  // STEP login.3: CLICK Sign In button
  await page.getByRole('button', { name: 'Sign In' }).click();
  await page.waitForLoadState('networkidle');
}

// The BAS flow is ONE invoice walked through consecutive steps, so it is modelled as a serial chain:
// a single browser context stays open for the whole run and we only sign in again when the actor
// actually changes. Previously every TC took a fresh context, logged in from scratch and then hunted
// the queue with .first() — which meant each step could action a DIFFERENT (stale) invoice, and a
// failure mid-chain left the rest "passing" against leftovers.
test.describe.serial('BAS — Invoice Tracking Process', () => {
  let context: BrowserContext;
  let page: Page;
  let currentUser = '';
  // Ref No (PAYnnnnn/2026) minted by TC-02 — pins every downstream step to THIS invoice.
  let refNo = '';

  test.beforeAll(async ({ browser }) => {
    context = await browser.newContext();
    page = await context.newPage();
  });

  test.afterAll(async () => {
    await context?.close();
  });

  // Sign in only when the actor changes; a no-op when the same user actions consecutive steps.
  async function actAs(user: string, password: string) {
    if (currentUser === user) return;
    await login(page, user, password);
    currentUser = user;
  }

  // Open the chain's invoice from the given queue. Prefers the Ref No captured in TC-02 so the step
  // acts on the right item; falls back to the step name only when no Ref No has been captured yet.
  // On a miss it dumps what IS in the queue, so a failure tells us the actor/step is wrong instead of
  // costing another blind run against a freshly registered invoice.
  async function openChainItem(queueUrl: string, stepText: string) {
    await page.goto(queueUrl);
    await page.waitForLoadState('networkidle');
    const byRef = refNo ? page.getByRole('row').filter({ hasText: refNo }) : null;
    const row = byRef && (await byRef.count()) > 0
      ? byRef.first()
      : page.getByRole('row').filter({ hasText: stepText }).first();
    if ((await row.count()) === 0) {
      const rows = await page.getByRole('row').allInnerTexts();
      console.log(`[chain] no row for refNo="${refNo}" / step="${stepText}" as ${currentUser}. Queue holds:\n` +
        rows.slice(0, 20).map(r => '  - ' + r.replace(/\s+/g, ' ').trim()).join('\n'));
    }
    await row.getByRole('link').first().click();
    await page.getByText('Fetching data...').first().waitFor({ state: 'hidden' }).catch(() => {});
  }

  test('TC-01: Login (JohanV)', async () => {
    await actAs(ADMIN.user, ADMIN.password);
    // ASSERT (BLOCKING) the Homepage is displayed after sign-in
    await expect(page.getByRole('menuitem', { name: /Workflows/ })).toBeVisible();
  });

  test('TC-02: Register and Upload Invoice (ADO #102362)', async () => {
    await actAs(ADMIN.user, ADMIN.password);

    // STEP: open My Items (sidebar flyout collapses under automation — navigate directly)
    await page.goto(MY_ITEMS_URL);
    await page.waitForLoadState('networkidle');
    // ASSERT the My Items page is displayed with Create New and Export buttons
    await expect(page.getByRole('button', { name: 'plus Create New down' })).toBeVisible();
    await expect(page.getByRole('button', { name: 'download Export' })).toBeVisible();

    // STEP: CLICK Create New button
    await page.getByRole('button', { name: 'plus Create New down' }).click();
    // ASSERT the BAS Request For Payment process option is displayed
    await expect(page.getByRole('button', { name: 'BAS Request For Payment' })).toBeVisible();

    // STEP: CLICK BAS Request For Payment workflow
    await page.getByRole('button', { name: 'BAS Request For Payment' }).click();
    // ASSERT the Register and Upload Invoice page is displayed (Date Received auto-populated)
    await expect(page.getByRole('heading', { name: /Register and Upload Invoice/ })).toBeVisible();
    await page.getByText('Fetching data...').first().waitFor({ state: 'hidden' }).catch(() => {});

    // STEP: CLICK the ellipsis on the Supplier Name field
    await page.getByRole('button', { name: 'ellipsis' }).click();
    // ASSERT the supplier picker "Select Item" dialog is displayed
    await expect(page.getByRole('dialog', { name: 'Select Item' })).toBeVisible();

    // STEP: double-click a Supplier Name from the list
    await page.getByRole('cell', { name: 'OMNI TECHNOLOGIES' }).dblclick();
    // ASSERT the selected supplier and read-only Supplier Details are displayed
    await expect(page.getByText('OMNI TECHNOLOGIES').first()).toBeVisible();
    await expect(page.getByText('EM583')).toBeVisible();

    // STEP: SELECT Invoice Date — a current-or-past date
    const invoiceDate = page.getByRole('textbox', { name: 'Select date' }).first();
    await invoiceDate.click();
    await invoiceDate.fill('17/06/2026');
    await invoiceDate.press('Enter');

    // STEP: SELECT Service Delivery Date — a current-or-past date
    const serviceDate = page.getByRole('textbox', { name: 'Select date' }).nth(1);
    await serviceDate.fill('17/06/2026');
    await serviceDate.press('Enter');

    // STEP: TYPE Invoice No.
    // Invoices line columns: Invoice Date | Service Delivery | Invoice No | Invoice Amount | Attachment.
    // The first two columns are antd date pickers (placeholder "Select date"), so an unqualified
    // .getByRole('textbox').first() on this row resolves to Invoice Date, NOT Invoice No — it typed the
    // invoice number into the date field and left Invoice No empty, so plus-circle could never commit
    // the row. Exclude the pickers and take the first plain input instead.
    const invoiceNo = `INV-ITS-${Date.now()}`;
    const editRow = page.getByRole('row').filter({ has: page.getByRole('button', { name: 'plus-circle' }) });
    const invoiceNoField = editRow.locator('input:not([placeholder="Select date"])').first();
    await invoiceNoField.fill(invoiceNo);
    // ASSERT the populated invoice number is displayed (plan step 27)
    await expect(invoiceNoField).toHaveValue(invoiceNo);

    // STEP: TYPE Invoice Amount
    await page.getByRole('spinbutton').first().fill('1500');

    // STEP: attach the invoice file
    const fileChooserPromise = page.waitForEvent('filechooser');
    await page.getByRole('table').getByRole('button', { name: 'upload (press to upload)' }).first().click();
    const fileChooser = await fileChooserPromise;
    await fileChooser.setFiles(INVOICE_PDF);
    await expect(page.getByText('pdf-test.pdf', { exact: false }).first()).toBeVisible();

    // STEP: CLICK the Add (plus-circle) icon to commit the invoice row
    await page.getByRole('button', { name: 'plus-circle' }).click();
    // ASSERT the invoice row is added and the Total reflects the amount.
    // The app renders "Total Amount: R1500" — it used to render "R 1500", so match the space optionally
    // rather than pinning a literal that a currency-format change can break again.
    await expect(page.getByText(/Total Amount:\s*R\s?1500/)).toBeVisible();

    // STEP: CLICK Submit button
    await expect(page.getByRole('button', { name: 'Submit' })).toBeEnabled();
    await page.getByRole('button', { name: 'Submit' }).click();

    // ASSERT (BLOCKING) the item is routed to "Assign Branch Finance Admin to Assign Certifier".
    // Submit posts the invoice + attachment and starts the workflow; on QA this regularly takes well
    // over the old 15s budget, which read as a routing failure when it was really an unfinished POST.
    // Two nodes carry this text after routing (a <strong> label and the <h3> step heading), so an
    // unqualified getByText trips strict mode. Anchor on the step heading.
    await expect(
      page.getByText(/Assign Branch Finance Admin to Assign Certifier/i).first()
    ).toBeVisible({ timeout: 60000 });

    // Capture this invoice's Ref No so every downstream step actions THIS item rather than whatever
    // happens to sit first in the queue.
    const refText = await page.getByText(/PAY\d+\/\d{4}/).first().innerText().catch(() => '');
    refNo = (refText.match(/PAY\d+\/\d{4}/) || [''])[0];
    console.log(`[chain] registered ${refNo} — invoice ${invoiceNo}`);
    expect(refNo, 'Ref No captured for the chain').toMatch(/PAY\d+\/\d{4}/);
  });

  test('TC-03: Assign Branch Finance Admin to Assign Certifier (ADO #102369)', async () => {
    // Precondition: an item is at the "Assign Branch Finance Admin To Assign Certifier" step
    // in ThulileM's My Items (e.g. produced by TC-02). Recorded live on PAY9991/2026, 2026-06-18.
    const BRANCH_FINANCE_ADMIN = 'Tania Smith';
    await actAs(ADMIN.user, ADMIN.password);

    // STEP: open My Items and open THIS chain's item at the Assign-Branch-Finance-Admin step.
    // Pinned to the Ref No from TC-02 — the old .first()-matching-"Received" row picked whatever was
    // newest, so a queue with leftovers could send this step at an unrelated invoice.
    await page.goto(MY_ITEMS_URL);
    await page.waitForLoadState('networkidle');
    const chainRow = refNo
      ? page.getByRole('row').filter({ hasText: refNo })
      : page.getByRole('row').filter({ hasText: 'BAS Request For Payment' }).filter({ hasText: 'Received' });
    await chainRow.first().getByRole('link').first().click();
    await page.waitForLoadState('networkidle');

    // STEP: open the action via the item menu
    await page.getByRole('button', { name: 'menu' }).click();
    await page.getByRole('menuitem', { name: 'Assign Branch Finance Admin' }).click();
    await page.getByText('Fetching data...').first().waitFor({ state: 'hidden' }).catch(() => {});

    // STEP: select the Branch Finance Admin official
    const bfaCombo = page.getByRole('heading', { name: 'Branch Finance Admin' })
      .locator('xpath=following::input[1]');
    await bfaCombo.click();
    await bfaCombo.fill('Tania');
    await page.getByTitle(BRANCH_FINANCE_ADMIN).click();
    // ASSERT the official is set and Submit becomes enabled.
    // Two nodes carry the name: antd's hidden <span aria-live="polite"> announcer and the visible
    // .ant-select-selection-item. getByText(...).first() picked the ANNOUNCER and failed
    // "Received: hidden" while the field was correctly populated — which aborted the test one line
    // before Submit, so this step was never actioned and the whole chain stalled here.
    await expect(
      page.locator('.ant-select-selection-item').filter({ hasText: BRANCH_FINANCE_ADMIN })
    ).toBeVisible();
    await expect(page.getByRole('button', { name: 'Submit' })).toBeEnabled();

    // STEP: Submit
    await page.getByRole('button', { name: 'Submit' }).click();

    // ASSERT (BLOCKING) redirected to the landing page and routed to the next step.
    await page.waitForURL('**/workflows-my-items', { timeout: 15000 });
    // My Items columns are Ref No / Type / Name / Initiated Date / Status / Progress — the CURRENT STEP
    // NAME is not among them (it only appears in the Progress tooltip on hover), so scanning the list
    // text for it can never match even when routing succeeded. Re-open the item and read its heading.
    await openChainItem(MY_ITEMS_URL, 'BAS Request For Payment');
    await expect(
      page.getByText(/Assign Responsible Person to Certify Invoice/i).first()
    ).toBeVisible({ timeout: 30000 });
  });

  test('TC-04: Assign Responsible Person to Certify Invoices (ADO #102370)', async () => {
    // Actioned by ThulileM — this step is assigned to Thulile, not to the Branch Finance Admin she
    // nominated in TC-03 (confirmed against QA 2026-09-14). Tania Smith is the person being ASSIGNED
    // here, never the actor.
    const OFFICIAL = 'Tania Smith';
    await actAs(ADMIN.user, ADMIN.password);

    // STEP: open the item action from the Inbox (inbox row link opens the action form directly)
    await openChainItem(INBOX_URL, 'Assign Responsible Person to Certify Invoice');

    // STEP: select the Official (Responsible Person)
    const officialCombo = page.getByRole('heading', { name: 'Official' })
      .locator('xpath=following::input[1]');
    await officialCombo.click();
    await officialCombo.fill('Tania');
    await page.getByTitle(OFFICIAL).click();
    await expect(page.getByRole('button', { name: 'Submit' })).toBeEnabled();

    // STEP: Submit
    await page.getByRole('button', { name: 'Submit' }).click();

    // ASSERT (BLOCKING) routed to "Certify Invoice"
    await expect(page.getByRole('heading', { name: /Certify Invoice/ }))
      .toBeVisible({ timeout: 15000 });
  });

  test('TC-05: Certify Invoice (ADO #102372)', async () => {
    // Actioned by the Responsible Person (TaniaSmith). Precondition: item at the
    // "Certify Invoice" step in TaniaSmith's Inbox. Recorded live on PAY9991/2026, 2026-06-18.
    await actAs('TaniaSmith', '123qwe');

    await openChainItem(INBOX_URL, 'Certify Invoice');

    // STEP: select Business Unit Response — happy path (delivered satisfactory, should be paid)
    await page.getByRole('radio', { name: /delivered satisfactory/ }).click();
    await expect(page.getByRole('button', { name: 'Submit' })).toBeEnabled();

    // STEP: Submit
    await page.getByRole('button', { name: 'Submit' }).click();

    // ASSERT (BLOCKING) routed to "Prepare Voucher" (status Certified)
    await expect(page.getByRole('heading', { name: /Prepare Voucher/ }))
      .toBeVisible({ timeout: 15000 });
  });

  test.skip('TC-06: Review Invoice Rejection (ADO #102378)', async () => {});

  test('TC-07: Prepare Voucher (ADO #102361)', async () => {
    // Actioned by the Voucher Preparer (TaniaSmith in this run). Precondition: item at
    // "Prepare Voucher" in the actor's Inbox. Recorded live on PAY9991/2026, 2026-06-18.
    await actAs('TaniaSmith', '123qwe');

    await openChainItem(INBOX_URL, 'Prepare Voucher');

    // STEP: Outcome — happy path "Verification is complete"
    await page.getByRole('radio', { name: 'Verification is complete' }).click();

    // STEP: Business Unit Response checklist — answer all Yes
    const yesRadios = page.getByRole('radio', { name: 'Yes' });
    const count = await yesRadios.count();
    for (let i = 0; i < count; i++) await yesRadios.nth(i).click();

    // STEP: Submit
    await expect(page.getByRole('button', { name: 'Submit' })).toBeEnabled();
    await page.getByRole('button', { name: 'Submit' }).click();

    // ASSERT (BLOCKING) submit succeeds and returns to the landing page (item routed to Verify Voucher,
    // a different role — it leaves this user's queue)
    await page.waitForURL('**/workflows-my-items', { timeout: 15000 });
  });
  test.skip('TC-08: Respond to Queries / Business Related Query (ADO #102398)', async () => {});
  test.skip('TC-09: Manage Supplier related Queries (ADO #102399)', async () => {});
  test('TC-10: Verify Voucher (ADO #102380)', async () => {
    // Actioned by the Verifier (ThulileM in this run). Precondition: item at "Verify Voucher"
    // in the Verifier's Inbox. Recorded live on PAY9991/2026, 2026-06-18.
    await actAs(ADMIN.user, ADMIN.password); // ThulileM
    await openChainItem(INBOX_URL, 'Verify Voucher');

    // STEP: enter Batch Number
    await page.getByRole('heading', { name: 'Batch Number' })
      .locator('xpath=following::input[1]').fill('BATCH-ITS-001');
    // STEP: confirm the review checkbox
    await page.getByRole('button', { name: /I confirm that I have reviewed/ })
      .locator('xpath=preceding::input[@type="checkbox"][1]').check();

    // STEP: Submit
    await expect(page.getByRole('button', { name: 'Submit' })).toBeEnabled();
    await page.getByRole('button', { name: 'Submit' }).click();

    // ASSERT (BLOCKING) routed to "Authorise Invoice Voucher" (status Verified)
    await expect(page.getByRole('heading', { name: /Authorise Invoice Voucher/ }))
      .toBeVisible({ timeout: 15000 });
  });
  test('TC-11: Authorise Invoice Voucher (ADO #102383)', async () => {
    // Actioned by the Authoriser (ThulileM in this run). Precondition: item at
    // "Authorise Invoice Voucher" in the Authoriser's Inbox. Recorded live on PAY9991/2026, 2026-06-18.
    await actAs(ADMIN.user, ADMIN.password); // ThulileM
    await openChainItem(INBOX_URL, 'Authorise Invoice Voucher');

    // STEP: confirm the approval checkbox
    await page.getByRole('button', { name: /I confirm that I have reviewed and approve/ })
      .locator('xpath=preceding::input[@type="checkbox"][1]').check();

    // STEP: Submit
    await expect(page.getByRole('button', { name: 'Submit' })).toBeEnabled();
    await page.getByRole('button', { name: 'Submit' }).click();

    // ASSERT (BLOCKING) routed to "Upload Captured Invoices Report From BAS" / Final Authorise Payment (status Approved)
    await expect(page.getByRole('heading', { name: /Upload Captured Invoices Report From BAS/ }))
      .toBeVisible({ timeout: 15000 });
  });
  test.skip('TC-12: Upload Captured Invoices Report / Final Authorise Payment (ADO #102360)', async () => {});
  test.skip('TC-13: Attach Payment Stub (ADO #102359)', async () => {});
  test.skip('TC-14: Capture Filing (ADO #102358)', async () => {});
});
