// AUTO-RECORDED from test-plans/invoice-process/bas.md
// Source: Azure DevOps test plan #102133 "ITS Automation Test Cases" (shared with PD), suite "BAS"
// The .md plan is canonical. AI-repair will patch failing lines in this file.
//
// RETARGETED to the DHA SmartGov deployment on 2026-07-16 from the proven live flow:
//   - App: https://dha-smartgov-adminportal-qa.shesha.app/
//   - Initiator + imports: Admin / DHA@Admin_2026#xP4!  (BAS/stub imports not covered by spec)
//   - Finance Unit (BFA/Certify/Prepare/Verify/Authorise): ThabisoM / 123qwe, self-assigned by
//     FULL NAME "Thabiso Maake" at each hand-off (partial-name searches surface a different match).
//   - Supplier: VANG GROUP (MAAA0868598).
// Each downstream TC re-logs in as the Finance Unit user and opens THE invoice created by TC-02
// (tracked by its Ref No, captured module-scoped) from the Incoming Items inbox.
// TC-06/08/09 (query/reject branches) and TC-12/13/14 (BAS report + payment-stub imports + filing)
// are driven live via MCP, not as pure Playwright specs — left as test.skip here.

import { test, expect, Page } from '@playwright/test';
import * as path from 'path';

const BASE = 'https://dha-smartgov-adminportal-qa.shesha.app';
const LOGIN_URL = `${BASE}/login`;
const MY_ITEMS_URL = `${BASE}/dynamic/Shesha.Workflow/workflows-my-items`;
const INBOX_URL = `${BASE}/dynamic/Shesha.Workflow/workflows-inbox`;
const ADMIN = { user: 'Admin', password: 'DHA@Admin_2026#xP4!' };
const FINANCE = { user: 'ThabisoM', password: '123qwe' };
const SELF = 'Thabiso Maake';
const SUPPLIER = 'VANG GROUP';
const SUPPLIER_NO = 'MAAA0868598';
const INVOICE_PDF = path.join(__dirname, '..', '..', '..', '..', 'test-data', 'pdf-test.pdf');

// Module-scoped: the Ref No created in TC-02, reused by the downstream chain (workers=1, serial).
let createdRef = '';

async function login(page: Page, user: string, password: string) {
  await page.goto(LOGIN_URL);
  await page.getByRole('textbox', { name: 'Username' }).fill(user);
  await page.getByRole('textbox', { name: 'Password' }).fill(password);
  await page.getByRole('button', { name: 'Sign In' }).click();
  await page.waitForLoadState('networkidle');
}

// Open the invoice (by Ref No, or by step text as a fallback) from the Incoming Items inbox.
async function openInInbox(page: Page, refOrStep: string) {
  await page.goto(INBOX_URL);
  await page.waitForLoadState('networkidle');
  const search = page.getByRole('textbox').first();
  await search.fill(refOrStep);
  await search.press('Enter');
  await page.waitForLoadState('networkidle');
  await page.getByRole('row').filter({ hasText: refOrStep }).first().getByRole('link').click();
  await page.getByText('Fetching data...').first().waitFor({ state: 'hidden' }).catch(() => {});
}

test.describe('BAS — DHA Invoice Tracking Process', () => {
  test('TC-01: Login (Admin)', async ({ page }) => {
    await login(page, ADMIN.user, ADMIN.password);
    // ASSERT the homepage / workflows menu is displayed after sign-in
    await expect(page.getByRole('menuitem', { name: /Workflows/ })).toBeVisible();
  });

  test('TC-02: Register and Upload Invoice (ADO #102362)', async ({ page }) => {
    await login(page, ADMIN.user, ADMIN.password);

    await page.goto(MY_ITEMS_URL);
    await page.waitForLoadState('networkidle');
    await expect(page.getByRole('button', { name: 'plus Create New down' })).toBeVisible();

    // STEP: Create New -> BAS Request For Payment
    await page.getByRole('button', { name: 'plus Create New down' }).click();
    await page.getByRole('button', { name: 'BAS Request For Payment' }).click();
    await expect(page.getByRole('heading', { name: /Register and Upload Invoice/ })).toBeVisible();
    await page.getByText('Fetching data...').first().waitFor({ state: 'hidden' }).catch(() => {});

    // Capture the assigned Ref No (PAY####/2026) for the downstream chain.
    const refText = await page.getByText(/Ref No:\s*PAY\d+\/2026/).first().innerText();
    createdRef = (refText.match(/PAY\d+\/2026/) || [''])[0];
    expect(createdRef).toMatch(/PAY\d+\/2026/);

    // STEP: Supplier picker -> search VANG GROUP -> double-click the row
    await page.getByRole('button', { name: 'ellipsis' }).click();
    const dialog = page.getByRole('dialog', { name: 'Select Item' });
    await expect(dialog).toBeVisible();
    const supSearch = dialog.locator('input[type="text"]').first();
    await supSearch.fill(SUPPLIER);
    await supSearch.press('Enter');
    await page.waitForTimeout(2000);
    await page.getByRole('row', { name: new RegExp(`${SUPPLIER}\\s+${SUPPLIER_NO}`) }).dblclick();
    await expect(page.getByText(SUPPLIER_NO).first()).toBeVisible();

    // STEP: invoice row — dates, invoice no, amount, attachment
    const invoiceDate = page.getByRole('textbox', { name: 'Select date' }).first();
    await invoiceDate.fill('15/07/2026');
    await invoiceDate.press('Enter');
    const serviceDate = page.getByRole('textbox', { name: 'Select date' }).nth(1);
    await serviceDate.fill('15/07/2026');
    await serviceDate.press('Enter');

    const invoiceNo = `DHA-INV-${Date.now()}`;
    await page.getByRole('row').filter({ has: page.getByRole('button', { name: 'plus-circle' }) })
      .getByRole('textbox').first().fill(invoiceNo);
    await page.getByRole('spinbutton').first().fill('1500');

    const fileChooserPromise = page.waitForEvent('filechooser');
    await page.getByRole('table').getByRole('button', { name: 'upload (press to upload)' }).first().click();
    const fileChooser = await fileChooserPromise;
    await fileChooser.setFiles(INVOICE_PDF);
    await page.waitForTimeout(1000);

    // STEP: commit the invoice row (plus-circle), then Submit
    await page.getByRole('button', { name: 'plus-circle' }).click();
    // ASSERT the row committed — the attachment moves into the committed invoices table row
    await expect(page.getByText('pdf-test.pdf', { exact: false }).first()).toBeVisible({ timeout: 10000 });
    await expect(page.getByRole('button', { name: 'Submit' })).toBeEnabled();
    await page.getByRole('button', { name: 'Submit' }).click();

    // ASSERT (BLOCKING) routed out (to Assign Branch Finance Admin, received by Finance Unit)
    await page.waitForURL('**/workflows-my-items', { timeout: 20000 });
  });

  test('TC-03: Assign Branch Finance Admin to Assign Certifier (ADO #102369)', async ({ page }) => {
    test.skip(!createdRef, 'TC-02 did not produce a Ref No');
    await login(page, FINANCE.user, FINANCE.password);
    await openInInbox(page, createdRef);

    // STEP: Branch Finance Admin = Thabiso Maake (self)
    const bfaCombo = page.getByRole('heading', { name: 'Branch Finance Admin' })
      .locator('xpath=following::input[1]');
    await bfaCombo.click();
    await bfaCombo.fill(SELF);
    await page.getByTitle(SELF).click();
    await expect(page.getByRole('button', { name: 'Submit' })).toBeEnabled();
    await page.getByRole('button', { name: 'Submit' }).click();

    // ASSERT (BLOCKING) advances to "Assign Responsible Person to Certify Invoice"
    await expect(page.getByText('Assign Responsible Person to Certify Invoice', { exact: false }).first())
      .toBeVisible({ timeout: 20000 });
  });

  test('TC-04: Assign Responsible Person to Certify Invoice (ADO #102370)', async ({ page }) => {
    test.skip(!createdRef, 'TC-02 did not produce a Ref No');
    await login(page, FINANCE.user, FINANCE.password);
    await openInInbox(page, createdRef);

    // STEP: Official (Responsible Person) = Thabiso Maake (self)
    const officialCombo = page.getByRole('heading', { name: 'Official' })
      .locator('xpath=following::input[1]');
    await officialCombo.click();
    await officialCombo.fill(SELF);
    await page.getByTitle(SELF).click();
    await expect(page.getByRole('button', { name: 'Submit' })).toBeEnabled();
    await page.getByRole('button', { name: 'Submit' }).click();

    // ASSERT (BLOCKING) advances to "Certify Invoice"
    await expect(page.getByRole('heading', { name: /Certify Invoice/ }))
      .toBeVisible({ timeout: 20000 });
  });

  test('TC-05: Certify Invoice (ADO #102372)', async ({ page }) => {
    test.skip(!createdRef, 'TC-02 did not produce a Ref No');
    await login(page, FINANCE.user, FINANCE.password);
    await openInInbox(page, createdRef);

    // STEP: Business Unit Response — delivered satisfactory (happy path)
    await page.getByRole('radio', { name: /delivered satisfactory/ }).click();
    await expect(page.getByRole('button', { name: 'Submit' })).toBeEnabled();
    await page.getByRole('button', { name: 'Submit' }).click();

    // ASSERT (BLOCKING) advances to "Prepare Voucher"
    await expect(page.getByRole('heading', { name: /Prepare Voucher/ }))
      .toBeVisible({ timeout: 20000 });
  });

  test.skip('TC-06: Review Invoice Rejection (ADO #102378) — driven live via MCP', async () => {});

  test('TC-07: Prepare Voucher (ADO #102361)', async ({ page }) => {
    test.skip(!createdRef, 'TC-02 did not produce a Ref No');
    await login(page, FINANCE.user, FINANCE.password);
    await openInInbox(page, createdRef);
    await page.getByText('Loading checklist items...').first().waitFor({ state: 'hidden' }).catch(() => {});

    // STEP: 4-item Business Unit Response checklist = all Yes, then Outcome = Verification is complete
    const yesRadios = page.getByRole('radio', { name: 'Yes' });
    const count = await yesRadios.count();
    for (let i = 0; i < count; i++) await yesRadios.nth(i).click();
    await page.getByRole('radio', { name: 'Verification is complete' }).click();

    await expect(page.getByRole('button', { name: 'Submit' })).toBeEnabled();
    await page.getByRole('button', { name: 'Submit' }).click();

    // ASSERT (BLOCKING) advances to "Verify Voucher"
    await expect(page.getByRole('heading', { name: /Verify Voucher/ }))
      .toBeVisible({ timeout: 20000 });
  });

  test.skip('TC-08: Respond to Queries / Business Related Query (ADO #102398) — driven live via MCP', async () => {});
  test.skip('TC-09: Manage Supplier related Queries (ADO #102399) — driven live via MCP', async () => {});

  test('TC-10: Verify Voucher (ADO #102380)', async ({ page }) => {
    test.skip(!createdRef, 'TC-02 did not produce a Ref No');
    await login(page, FINANCE.user, FINANCE.password);
    await openInInbox(page, createdRef);

    // STEP: Batch Number + confirm-review checkbox
    await page.getByRole('heading', { name: 'Batch Number' })
      .locator('xpath=following::input[1]').fill('BATCH-ITS-001');
    await page.getByRole('button', { name: /I confirm that I have reviewed/ })
      .locator('xpath=preceding::input[@type="checkbox"][1]').check();

    await expect(page.getByRole('button', { name: 'Submit' })).toBeEnabled();
    await page.getByRole('button', { name: 'Submit' }).click();

    // ASSERT (BLOCKING) advances to "Authorise Invoice Voucher"
    await expect(page.getByRole('heading', { name: /Authorise Invoice Voucher/ }))
      .toBeVisible({ timeout: 20000 });
  });

  test('TC-11: Authorise Invoice Voucher (ADO #102383)', async ({ page }) => {
    test.skip(!createdRef, 'TC-02 did not produce a Ref No');
    await login(page, FINANCE.user, FINANCE.password);
    await openInInbox(page, createdRef);

    // STEP: confirm the approval checkbox
    await page.getByRole('button', { name: /I confirm that I have reviewed and approve/ })
      .locator('xpath=preceding::input[@type="checkbox"][1]').check();

    await expect(page.getByRole('button', { name: 'Submit' })).toBeEnabled();
    await page.getByRole('button', { name: 'Submit' }).click();

    // ASSERT (BLOCKING) routed to BAS report import step (status Approved)
    await expect(page.getByText('Upload Captured Invoices Report From BAS', { exact: false }).first())
      .toBeVisible({ timeout: 20000 });
  });

  test.skip('TC-12: Upload Captured Invoices Report / Final Authorise Payment (ADO #102360) — BAS import via MCP', async () => {});
  test.skip('TC-13: Attach Payment Stub (ADO #102359) — stub import via MCP', async () => {});
  test.skip('TC-14: Capture Filing (ADO #102358) — driven live via MCP', async () => {});
});
