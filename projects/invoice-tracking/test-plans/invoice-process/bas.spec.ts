// AUTO-RECORDED from test-plans/invoice-process/bas.md
// Source: Azure DevOps test plan #102133 "ITS Automation Test Cases", suite #102355 "BAS"
// The .md plan is canonical. AI-repair will patch failing lines in this file.
// Do not hand-edit unless you are also updating the .md plan.
//
// Recorded live against QA on 2026-06-18 (login + TC-02 Register and Upload Invoice).
// TC-03..TC-14 are downstream multi-role workflow steps that require an invoice already
// routed to that step (and, in production, a different role login). They are stubbed as
// test.skip until the chain / role accounts are wired — see bas.md for the full steps.

import { test, expect, Page } from '@playwright/test';
import * as path from 'path';

const APP_URL = 'https://pd-invtracking-adminportal-qa.azurewebsites.net/login';
const MY_ITEMS_URL = 'https://pd-invtracking-adminportal-qa.azurewebsites.net/dynamic/Shesha.Workflow/workflows-my-items';
const ADMIN = { user: 'ThulileM', password: '123qwe' };
const INVOICE_PDF = path.join(__dirname, '..', '..', '..', '..', 'test-data', 'pdf-test.pdf');

async function loginAsAdmin(page: Page) {
  await page.goto(APP_URL);
  // STEP login.1: TYPE Username field
  await page.getByRole('textbox', { name: 'Username' }).fill(ADMIN.user);
  // STEP login.2: TYPE Password field
  await page.getByRole('textbox', { name: 'Password' }).fill(ADMIN.password);
  // STEP login.3: CLICK Sign In button
  await page.getByRole('button', { name: 'Sign In' }).click();
  await page.waitForLoadState('networkidle');
}

test.describe('BAS — Invoice Tracking Process', () => {
  test('TC-01: Login (ThulileM)', async ({ page }) => {
    await loginAsAdmin(page);
    // ASSERT (BLOCKING) the Homepage is displayed after sign-in
    await expect(page.getByRole('menuitem', { name: /Workflows/ })).toBeVisible();
  });

  test('TC-02: Register and Upload Invoice (ADO #102362)', async ({ page }) => {
    await loginAsAdmin(page);

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
    const invoiceNo = `INV-ITS-${Date.now()}`;
    await page.getByRole('row').filter({ has: page.getByRole('button', { name: 'plus-circle' }) })
      .getByRole('textbox').first().fill(invoiceNo);

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
    // ASSERT the invoice row is added and the Total reflects the amount
    await expect(page.getByText('R 1500')).toBeVisible();

    // STEP: CLICK Submit button
    await expect(page.getByRole('button', { name: 'Submit' })).toBeEnabled();
    await page.getByRole('button', { name: 'Submit' }).click();

    // ASSERT (BLOCKING) the item is routed to "Assign Branch Finance Admin to Assign Certifier"
    await expect(
      page.getByText('Assign Branch Finance Admin To Assign Certifier', { exact: false })
    ).toBeVisible({ timeout: 15000 });
  });

  test('TC-03: Assign Branch Finance Admin to Assign Certifier (ADO #102369)', async ({ page }) => {
    // Precondition: an item is at the "Assign Branch Finance Admin To Assign Certifier" step
    // in ThulileM's My Items (e.g. produced by TC-02). Recorded live on PAY9991/2026, 2026-06-18.
    const BRANCH_FINANCE_ADMIN = 'Tania Smith';
    await loginAsAdmin(page);

    // STEP: open My Items and open the item at the Assign-Branch-Finance-Admin step
    await page.goto(MY_ITEMS_URL);
    await page.waitForLoadState('networkidle');
    await page.getByRole('row').filter({ hasText: 'BAS Request For Payment' })
      .filter({ hasText: 'Received' }).first().getByRole('link').click();
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
    // ASSERT the official is set and Submit becomes enabled
    await expect(page.getByText(BRANCH_FINANCE_ADMIN).first()).toBeVisible();
    await expect(page.getByRole('button', { name: 'Submit' })).toBeEnabled();

    // STEP: Submit
    await page.getByRole('button', { name: 'Submit' }).click();

    // ASSERT (BLOCKING) routed to "Assign Responsible Person to Certify Invoice"
    await page.waitForURL('**/workflows-my-items', { timeout: 15000 });
    await expect(page.getByText('Assign Responsible Person to Certify Invoice', { exact: false }).first())
      .toBeVisible({ timeout: 15000 });
  });

  test('TC-04: Assign Responsible Person to Certify Invoices (ADO #102370)', async ({ page }) => {
    // Actioned by the Branch Finance Admin (TaniaSmith). Precondition: item at the
    // "Assign Responsible Person to Certify Invoice" step in TaniaSmith's Inbox.
    // Recorded live on PAY9991/2026, 2026-06-18.
    const OFFICIAL = 'Tania Smith';
    // NOTE: this TC logs in as TaniaSmith, not the default ADMIN — override here.
    await page.goto('https://pd-invtracking-adminportal-qa.azurewebsites.net/login');
    await page.getByRole('textbox', { name: 'Username' }).fill('TaniaSmith');
    await page.getByRole('textbox', { name: 'Password' }).fill('123qwe');
    await page.getByRole('button', { name: 'Sign In' }).click();
    await page.waitForLoadState('networkidle');

    // STEP: open the item action from the Inbox (inbox row link opens the action form directly)
    await page.goto('https://pd-invtracking-adminportal-qa.azurewebsites.net/dynamic/Shesha.Workflow/workflows-inbox');
    await page.waitForLoadState('networkidle');
    await page.getByRole('row').filter({ hasText: 'Assign Responsible Person to Certify Invoice' })
      .first().getByRole('link').click();
    await page.getByText('Fetching data...').first().waitFor({ state: 'hidden' }).catch(() => {});

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

  test('TC-05: Certify Invoice (ADO #102372)', async ({ page }) => {
    // Actioned by the Responsible Person (TaniaSmith). Precondition: item at the
    // "Certify Invoice" step in TaniaSmith's Inbox. Recorded live on PAY9991/2026, 2026-06-18.
    await page.goto('https://pd-invtracking-adminportal-qa.azurewebsites.net/login');
    await page.getByRole('textbox', { name: 'Username' }).fill('TaniaSmith');
    await page.getByRole('textbox', { name: 'Password' }).fill('123qwe');
    await page.getByRole('button', { name: 'Sign In' }).click();
    await page.waitForLoadState('networkidle');

    await page.goto('https://pd-invtracking-adminportal-qa.azurewebsites.net/dynamic/Shesha.Workflow/workflows-inbox');
    await page.waitForLoadState('networkidle');
    await page.getByRole('row').filter({ hasText: 'Certify Invoice' }).first().getByRole('link').click();
    await page.getByText('Fetching data...').first().waitFor({ state: 'hidden' }).catch(() => {});

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

  test('TC-07: Prepare Voucher (ADO #102361)', async ({ page }) => {
    // Actioned by the Voucher Preparer (TaniaSmith in this run). Precondition: item at
    // "Prepare Voucher" in the actor's Inbox. Recorded live on PAY9991/2026, 2026-06-18.
    await page.goto('https://pd-invtracking-adminportal-qa.azurewebsites.net/login');
    await page.getByRole('textbox', { name: 'Username' }).fill('TaniaSmith');
    await page.getByRole('textbox', { name: 'Password' }).fill('123qwe');
    await page.getByRole('button', { name: 'Sign In' }).click();
    await page.waitForLoadState('networkidle');

    await page.goto('https://pd-invtracking-adminportal-qa.azurewebsites.net/dynamic/Shesha.Workflow/workflows-inbox');
    await page.waitForLoadState('networkidle');
    await page.getByRole('row').filter({ hasText: 'Prepare Voucher' }).first().getByRole('link').click();
    await page.getByText('Fetching data...').first().waitFor({ state: 'hidden' }).catch(() => {});

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
  test('TC-10: Verify Voucher (ADO #102380)', async ({ page }) => {
    // Actioned by the Verifier (ThulileM in this run). Precondition: item at "Verify Voucher"
    // in the Verifier's Inbox. Recorded live on PAY9991/2026, 2026-06-18.
    await loginAsAdmin(page); // ThulileM
    await page.goto('https://pd-invtracking-adminportal-qa.azurewebsites.net/dynamic/Shesha.Workflow/workflows-inbox');
    await page.waitForLoadState('networkidle');
    await page.getByRole('row').filter({ hasText: 'Verify Voucher' }).first().getByRole('link').click();
    await page.getByText('Fetching data...').first().waitFor({ state: 'hidden' }).catch(() => {});

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
  test('TC-11: Authorise Invoice Voucher (ADO #102383)', async ({ page }) => {
    // Actioned by the Authoriser (ThulileM in this run). Precondition: item at
    // "Authorise Invoice Voucher" in the Authoriser's Inbox. Recorded live on PAY9991/2026, 2026-06-18.
    await loginAsAdmin(page); // ThulileM
    await page.goto('https://pd-invtracking-adminportal-qa.azurewebsites.net/dynamic/Shesha.Workflow/workflows-inbox');
    await page.waitForLoadState('networkidle');
    await page.getByRole('row').filter({ hasText: 'Authorise Invoice Voucher' }).first().getByRole('link').click();
    await page.getByText('Fetching data...').first().waitFor({ state: 'hidden' }).catch(() => {});

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
