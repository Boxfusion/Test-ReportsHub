# Instructions

- Following Playwright test failed.
- Explain why, be concise, respect Playwright best practices.
- Provide a snippet of code with the fix, if possible.

# Test info

- Name: projects/DHA-Invoice-Tracking/test-plans/invoice-process/bas.spec.ts >> BAS — DHA Invoice Tracking Process >> TC-02: Register and Upload Invoice (ADO #102362)
- Location: projects/DHA-Invoice-Tracking/test-plans/invoice-process/bas.spec.ts:78:7

# Error details

```
Error: expect(locator).toBeVisible() failed

Locator: getByRole('button', { name: 'plus Create New down' })
Expected: visible
Timeout: 5000ms
Error: element(s) not found

Call log:
  - Expect "toBeVisible" getByRole('button', { name: 'plus Create New down' }) with timeout 5000ms
  - waiting for getByRole('button', { name: 'plus Create New down' })

```

```yaml
- alert
- complementary:
  - menu:
    - menuitem "apartment Workflows":
      - img "apartment"
      - text: Workflows
    - menuitem "calendar Leave Management":
      - img "calendar"
      - text: Leave Management
    - menuitem "file-ppt PMDS":
      - img "file-ppt"
      - text: PMDS
    - menuitem "file-protect Invoice Tracking":
      - img "file-protect"
      - text: Invoice Tracking
    - menuitem "tool Administration":
      - img "tool"
      - text: Administration
    - menuitem "setting Configurations":
      - img "setting"
      - text: Configurations
  - img "menu-unfold"
- banner:
  - button "edit":
    - img "edit"
  - paragraph: Shesha/header v28
  - text: Live
  - img "close"
  - link:
    - /url: /
    - img
  - text: Live Mode
  - switch "Switch to Edit mode"
  - img "block"
  - text: Latest System Administrator
  - img "down"
  - img "user"
- main:
  - button "edit":
    - img "edit"
  - paragraph: Shesha.Workflow/workflows-my-items v13
  - text: Live
  - img "close"
  - heading "My Items" [level=4]
  - textbox
  - button "search":
    - img "search"
  - button "filter":
    - img "filter"
  - button "sliders":
    - img "sliders"
  - list:
    - listitem: 1-10 of 71 items
    - listitem "Previous Page":
      - button "left" [disabled]:
        - img "left"
    - listitem "1"
    - listitem "2"
    - listitem "3"
    - listitem "Next 3 Pages":
      - img "double-right"
      - text: •••
    - listitem "8"
    - listitem "Next Page":
      - button "right":
        - img "right"
    - listitem:
      - combobox "Page Size"
      - text: 10 / page
  - button "reload":
    - img "reload"
  - table:
    - row "Ref No Type Name Initiated Date":
      - columnheader
      - columnheader "Ref No":
        - text: Ref No
        - separator
      - columnheader "Type":
        - text: Type
        - separator
      - columnheader "Name":
        - text: Name
        - separator
      - columnheader "Initiated Date":
        - text: Initiated Date
        - separator
    - rowgroup:
      - row "search PAY4124/2026 LOGIS Request For Payment Order - OR-126007 | Invoice(s) - 8990 | Supplier Name - ATLANTIS CORPORATE TRAVEL 01/09/2026 17:12":
        - cell "search":
          - link "search":
            - /url: /shesha/workflow?id=6012a508-bd08-423b-95a3-e5deca3220c1
            - img "search"
        - cell "PAY4124/2026"
        - cell "LOGIS Request For Payment"
        - cell "Order - OR-126007 | Invoice(s) - 8990 | Supplier Name - ATLANTIS CORPORATE TRAVEL"
        - cell "01/09/2026 17:12"
      - row "search PAY4047/2026 LOGIS Request For Payment Order - OR-125570 | Invoice(s) - IOK-6545 | Supplier Name - ALTRON TMT 27/08/2026 18:08":
        - cell "search":
          - link "search":
            - /url: /shesha/workflow?id=70bda3e4-47ed-42f8-a701-26f9cd2a136f
            - img "search"
        - cell "PAY4047/2026"
        - cell "LOGIS Request For Payment"
        - cell "Order - OR-125570 | Invoice(s) - IOK-6545 | Supplier Name - ALTRON TMT"
        - cell "27/08/2026 18:08"
      - row "search PAY3999/2026 BAS Request For Payment Invoice(s) - DHA-INV-1787705220548 | Supplier Name - VANG GROUP 26/08/2026 02:46":
        - cell "search":
          - link "search":
            - /url: /shesha/workflow?id=7e5786ca-f231-4a08-b74f-6d9a725f2fc6
            - img "search"
        - cell "PAY3999/2026"
        - cell "BAS Request For Payment"
        - cell "Invoice(s) - DHA-INV-1787705220548 | Supplier Name - VANG GROUP"
        - cell "26/08/2026 02:46"
      - row "search PAY3960/2026 LOGIS Request For Payment Order - OR-122647 | Invoice(s) - 9008 | Supplier Name - ATLANTIS CORPORATE TRAVEL 25/08/2026 09:46":
        - cell "search":
          - link "search":
            - /url: /shesha/workflow?id=273cba79-c93b-448b-a2ea-010e5be826a8
            - img "search"
        - cell "PAY3960/2026"
        - cell "LOGIS Request For Payment"
        - cell "Order - OR-122647 | Invoice(s) - 9008 | Supplier Name - ATLANTIS CORPORATE TRAVEL"
        - cell "25/08/2026 09:46"
      - row "search PAY3918/2026 LOGIS Request For Payment Order - OR-125570 | Invoice(s) - Kamo-1332 | Supplier Name - ALTRON TMT 24/08/2026 14:27":
        - cell "search":
          - link "search":
            - /url: /shesha/workflow?id=b7658229-ca57-4a08-aada-023817a65038
            - img "search"
        - cell "PAY3918/2026"
        - cell "LOGIS Request For Payment"
        - cell "Order - OR-125570 | Invoice(s) - Kamo-1332 | Supplier Name - ALTRON TMT"
        - cell "24/08/2026 14:27"
      - row "search PAY0049/2026 Request For Payment 24/08/2026 12:38":
        - cell "search":
          - link "search":
            - /url: /shesha/workflow?id=929da626-9a83-4077-995a-59f3821d875e
            - img "search"
        - cell "PAY0049/2026"
        - cell "Request For Payment"
        - cell
        - cell "24/08/2026 12:38"
      - row "search PAY3823/2026 BAS Request For Payment Invoice(s) - DHA-INV-1787359542279 | Supplier Name - VANG GROUP 22/08/2026 02:45":
        - cell "search":
          - link "search":
            - /url: /shesha/workflow?id=de5109ae-96fc-4a0e-b6e5-92d0a812e7a5
            - img "search"
        - cell "PAY3823/2026"
        - cell "BAS Request For Payment"
        - cell "Invoice(s) - DHA-INV-1787359542279 | Supplier Name - VANG GROUP"
        - cell "22/08/2026 02:45"
      - row "search PAY3676/2026 BAS Request For Payment Invoice(s) - DHA-INV-1786581243430 | Supplier Name - VANG GROUP 13/08/2026 02:33":
        - cell "search":
          - link "search":
            - /url: /shesha/workflow?id=d4e2d8e6-d644-4547-a3eb-22002c73b21f
            - img "search"
        - cell "PAY3676/2026"
        - cell "BAS Request For Payment"
        - cell "Invoice(s) - DHA-INV-1786581243430 | Supplier Name - VANG GROUP"
        - cell "13/08/2026 02:33"
      - row "search PAY3668/2026 BAS Request For Payment Invoice(s) - IKL-7867 | Supplier Name - MAAKE BUSINESS ENTERPRISE 12/08/2026 19:20":
        - cell "search":
          - link "search":
            - /url: /shesha/workflow?id=70dc0dcd-a2d7-44da-96a8-4b7d4a4503cd
            - img "search"
        - cell "PAY3668/2026"
        - cell "BAS Request For Payment"
        - cell "Invoice(s) - IKL-7867 | Supplier Name - MAAKE BUSINESS ENTERPRISE"
        - cell "12/08/2026 19:20"
      - row "search PAY3620/2026 BAS Request For Payment Invoice(s) - DHA-INV-1786494779173 | Supplier Name - VANG GROUP 12/08/2026 02:32":
        - cell "search":
          - link "search":
            - /url: /shesha/workflow?id=3c11a12d-1790-45a3-84f4-84485793ed12
            - img "search"
        - cell "PAY3620/2026"
        - cell "BAS Request For Payment"
        - cell "Invoice(s) - DHA-INV-1786494779173 | Supplier Name - VANG GROUP"
        - cell "12/08/2026 02:32"
```

# Test source

```ts
  1   | // AUTO-RECORDED from test-plans/invoice-process/bas.md
  2   | // Source: Azure DevOps test plan #102133 "ITS Automation Test Cases" (shared with PD), suite "BAS"
  3   | // The .md plan is canonical. AI-repair will patch failing lines in this file.
  4   | //
  5   | // RETARGETED to the DHA SmartGov deployment on 2026-07-16 from the proven live flow:
  6   | //   - App: https://dha-smartgov-adminportal-qa.shesha.app/
  7   | //   - Initiator + imports: Admin / DHA@Admin_2026#xP4!  (BAS/stub imports not covered by spec)
  8   | //   - Finance Unit (BFA/Certify/Prepare/Verify/Authorise): ThabisoM / 123qwe, self-assigned by
  9   | //     FULL NAME "Thabiso Maake" at each hand-off (partial-name searches surface a different match).
  10  | //   - Supplier: VANG GROUP (MAAA0868598).
  11  | // Each downstream TC re-logs in as the Finance Unit user and opens THE invoice created by TC-02
  12  | // (tracked by its Ref No, captured module-scoped) from the Incoming Items inbox.
  13  | // TC-06/08/09 (query/reject branches) and TC-12/13/14 (BAS report + payment-stub imports + filing)
  14  | // are driven live via MCP, not as pure Playwright specs — left as test.skip here.
  15  | 
  16  | import { test, expect, Page } from '@playwright/test';
  17  | import * as path from 'path';
  18  | 
  19  | const BASE = 'https://dha-smartgov-adminportal-qa.shesha.app';
  20  | const LOGIN_URL = `${BASE}/login`;
  21  | const MY_ITEMS_URL = `${BASE}/dynamic/Shesha.Workflow/workflows-my-items`;
  22  | const INBOX_URL = `${BASE}/dynamic/Shesha.Workflow/workflows-inbox`;
  23  | const ADMIN = { user: 'Admin', password: 'DHA@Admin_2026#xP4!' };
  24  | const FINANCE = { user: 'ThabisoM', password: '123qwe' };
  25  | const SELF = 'Thabiso Maake';
  26  | const SUPPLIER = 'VANG GROUP';
  27  | const SUPPLIER_NO = 'MAAA0868598';
  28  | const INVOICE_PDF = path.join(__dirname, '..', '..', '..', '..', 'test-data', 'pdf-test.pdf');
  29  | 
  30  | // Module-scoped: the Ref No created in TC-02, reused by the downstream chain (workers=1, serial).
  31  | let createdRef = '';
  32  | 
  33  | // Switch the config-item view mode Live -> Latest (per CLAUDE.md). The mode resets to Live on every
  34  | // fresh login, so this runs after each one. Only the Admin header renders the toggle — non-admin
  35  | // users have no view-mode control, so a missing toggle is a no-op, not a failure.
  36  | async function switchToLatest(page: Page) {
  37  |   const toggle = page.locator('span.sha-config-item-mode-toggler');
  38  |   await toggle.first().waitFor({ state: 'visible', timeout: 5_000 }).catch(() => {});
  39  |   if (await toggle.count() === 0) return;
  40  |   if ((await toggle.first().innerText()).trim() === 'Latest') return;
  41  |   await toggle.first().click();
  42  |   await page.getByRole('menuitem', { name: /^Latest/ }).click();
  43  |   await expect(toggle.first()).toHaveText('Latest');
  44  |   await page.waitForLoadState('networkidle');
  45  | }
  46  | 
  47  | async function login(page: Page, user: string, password: string) {
  48  |   await page.goto(LOGIN_URL);
  49  |   await page.getByRole('textbox', { name: 'Username' }).fill(user);
  50  |   await page.getByRole('textbox', { name: 'Password' }).fill(password);
  51  |   await page.getByRole('button', { name: 'Sign In' }).click();
  52  |   // Wait until we are actually off /login before returning. networkidle on its own can resolve
  53  |   // before the session token is persisted, and a following goto() then bounces back to /login.
  54  |   await page.waitForURL(url => !/\/login/.test(url.pathname), { timeout: 30_000 });
  55  |   await page.waitForLoadState('networkidle');
  56  |   await switchToLatest(page);
  57  | }
  58  | 
  59  | // Open the invoice (by Ref No, or by step text as a fallback) from the Incoming Items inbox.
  60  | async function openInInbox(page: Page, refOrStep: string) {
  61  |   await page.goto(INBOX_URL);
  62  |   await page.waitForLoadState('networkidle');
  63  |   const search = page.getByRole('textbox').first();
  64  |   await search.fill(refOrStep);
  65  |   await search.press('Enter');
  66  |   await page.waitForLoadState('networkidle');
  67  |   await page.getByRole('row').filter({ hasText: refOrStep }).first().getByRole('link').click();
  68  |   await page.getByText('Fetching data...').first().waitFor({ state: 'hidden' }).catch(() => {});
  69  | }
  70  | 
  71  | test.describe('BAS — DHA Invoice Tracking Process', () => {
  72  |   test('TC-01: Login (Admin)', async ({ page }) => {
  73  |     await login(page, ADMIN.user, ADMIN.password);
  74  |     // ASSERT the homepage / workflows menu is displayed after sign-in
  75  |     await expect(page.getByRole('menuitem', { name: /Workflows/ })).toBeVisible();
  76  |   });
  77  | 
  78  |   test('TC-02: Register and Upload Invoice (ADO #102362)', async ({ page }) => {
  79  |     await login(page, ADMIN.user, ADMIN.password);
  80  | 
  81  |     await page.goto(MY_ITEMS_URL);
  82  |     await page.waitForLoadState('networkidle');
> 83  |     await expect(page.getByRole('button', { name: 'plus Create New down' })).toBeVisible();
      |                                                                              ^ Error: expect(locator).toBeVisible() failed
  84  | 
  85  |     // STEP: Create New -> BAS Request For Payment
  86  |     await page.getByRole('button', { name: 'plus Create New down' }).click();
  87  |     await page.getByRole('button', { name: 'BAS Request For Payment' }).click();
  88  |     await expect(page.getByRole('heading', { name: /Register and Upload Invoice/ })).toBeVisible();
  89  |     await page.getByText('Fetching data...').first().waitFor({ state: 'hidden' }).catch(() => {});
  90  | 
  91  |     // Capture the assigned Ref No (PAY####/2026) for the downstream chain.
  92  |     const refText = await page.getByText(/Ref No:\s*PAY\d+\/2026/).first().innerText();
  93  |     createdRef = (refText.match(/PAY\d+\/2026/) || [''])[0];
  94  |     expect(createdRef).toMatch(/PAY\d+\/2026/);
  95  | 
  96  |     // STEP: Supplier picker -> search VANG GROUP -> double-click the row
  97  |     await page.getByRole('button', { name: 'ellipsis' }).click();
  98  |     const dialog = page.getByRole('dialog', { name: 'Select Item' });
  99  |     await expect(dialog).toBeVisible();
  100 |     const supSearch = dialog.locator('input[type="text"]').first();
  101 |     await supSearch.fill(SUPPLIER);
  102 |     await supSearch.press('Enter');
  103 |     await page.waitForTimeout(2000);
  104 |     await page.getByRole('row', { name: new RegExp(`${SUPPLIER}\\s+${SUPPLIER_NO}`) }).dblclick();
  105 |     await expect(page.getByText(SUPPLIER_NO).first()).toBeVisible();
  106 | 
  107 |     // STEP: invoice row — dates, invoice no, amount, attachment
  108 |     const invoiceDate = page.getByRole('textbox', { name: 'Select date' }).first();
  109 |     await invoiceDate.fill('15/07/2026');
  110 |     await invoiceDate.press('Enter');
  111 |     const serviceDate = page.getByRole('textbox', { name: 'Select date' }).nth(1);
  112 |     await serviceDate.fill('15/07/2026');
  113 |     await serviceDate.press('Enter');
  114 | 
  115 |     const invoiceNo = `DHA-INV-${Date.now()}`;
  116 |     // Invoice No is the row's affix-wrapped text input. NOT the row's first textbox — that is the
  117 |     // Invoice Date picker, which silently reverts a non-date value and leaves Invoice No empty.
  118 |     const invoiceNoCell = page.locator('[role=table] .ant-input-affix-wrapper input.ant-input').first();
  119 |     await invoiceNoCell.fill(invoiceNo);
  120 |     // ASSERT the populated invoice number is displayed (plan step 27)
  121 |     await expect(invoiceNoCell).toHaveValue(invoiceNo);
  122 |     await page.getByRole('spinbutton').first().fill('1500');
  123 | 
  124 |     const fileChooserPromise = page.waitForEvent('filechooser');
  125 |     await page.getByRole('table').getByRole('button', { name: 'upload (press to upload)' }).first().click();
  126 |     const fileChooser = await fileChooserPromise;
  127 |     await fileChooser.setFiles(INVOICE_PDF);
  128 |     await page.waitForTimeout(1000);
  129 | 
  130 |     // STEP: commit the invoice row (plus-circle), then Submit
  131 |     await page.getByRole('button', { name: 'plus-circle' }).click();
  132 |     // ASSERT the invoice row is added and the Total sums all invoice amounts (plan step 32).
  133 |     // Assert on the Total, not on the attachment filename — the filename is already visible in the
  134 |     // UNcommitted row, so it passes even when the commit failed.
  135 |     await expect(page.getByText(/Total Amount:\s*R\s*1\s?500/).first()).toBeVisible({ timeout: 10000 });
  136 |     await expect(page.getByRole('button', { name: 'Submit' })).toBeEnabled();
  137 |     await page.getByRole('button', { name: 'Submit' }).click();
  138 | 
  139 |     // ASSERT (BLOCKING) routed out of the action form (to Assign Branch Finance Admin, received by
  140 |     // the Finance Unit). This build redirects to the read-only workflow view; older builds went
  141 |     // back to My Items — accept either.
  142 |     await page.waitForURL(/\/shesha\/workflow\?id=|\/workflows-my-items/, { timeout: 20000 });
  143 |   });
  144 | 
  145 |   test('TC-03: Assign Branch Finance Admin to Assign Certifier (ADO #102369)', async ({ page }) => {
  146 |     test.skip(!createdRef, 'TC-02 did not produce a Ref No');
  147 |     await login(page, FINANCE.user, FINANCE.password);
  148 |     await openInInbox(page, createdRef);
  149 | 
  150 |     // STEP: Branch Finance Admin = Thabiso Maake (self)
  151 |     const bfaCombo = page.getByRole('heading', { name: 'Branch Finance Admin' })
  152 |       .locator('xpath=following::input[1]');
  153 |     await bfaCombo.click();
  154 |     await bfaCombo.fill(SELF);
  155 |     await page.getByTitle(SELF).click();
  156 |     await expect(page.getByRole('button', { name: 'Submit' })).toBeEnabled();
  157 |     await page.getByRole('button', { name: 'Submit' }).click();
  158 | 
  159 |     // ASSERT (BLOCKING) advances to "Assign Responsible Person to Certify Invoice"
  160 |     await expect(page.getByText('Assign Responsible Person to Certify Invoice', { exact: false }).first())
  161 |       .toBeVisible({ timeout: 20000 });
  162 |   });
  163 | 
  164 |   test('TC-04: Assign Responsible Person to Certify Invoice (ADO #102370)', async ({ page }) => {
  165 |     test.skip(!createdRef, 'TC-02 did not produce a Ref No');
  166 |     await login(page, FINANCE.user, FINANCE.password);
  167 |     await openInInbox(page, createdRef);
  168 | 
  169 |     // STEP: Official (Responsible Person) = Thabiso Maake (self)
  170 |     const officialCombo = page.getByRole('heading', { name: 'Official' })
  171 |       .locator('xpath=following::input[1]');
  172 |     await officialCombo.click();
  173 |     await officialCombo.fill(SELF);
  174 |     await page.getByTitle(SELF).click();
  175 |     await expect(page.getByRole('button', { name: 'Submit' })).toBeEnabled();
  176 |     await page.getByRole('button', { name: 'Submit' }).click();
  177 | 
  178 |     // ASSERT (BLOCKING) advances to "Certify Invoice"
  179 |     await expect(page.getByRole('heading', { name: /Certify Invoice/ }))
  180 |       .toBeVisible({ timeout: 20000 });
  181 |   });
  182 | 
  183 |   test('TC-05: Certify Invoice (ADO #102372)', async ({ page }) => {
```