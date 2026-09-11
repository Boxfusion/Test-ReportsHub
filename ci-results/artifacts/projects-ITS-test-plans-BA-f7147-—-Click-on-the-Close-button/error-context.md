# Instructions

- Following Playwright test failed.
- Explain why, be concise, respect Playwright best practices.
- Provide a snippet of code with the fix, if possible.

# Test info

- Name: projects/ITS/test-plans/BAS/register-and-upload-invoice.spec.ts >> TC-22 — Click on the Close button
- Location: projects/ITS/test-plans/BAS/register-and-upload-invoice.spec.ts:524:5

# Error details

```
Error: expect(locator).toBeVisible() failed

Locator: getByText(/Register and Upload Invoice/i).first()
Expected: visible
Timeout: 15000ms
Error: element(s) not found

Call log:
  - Expect "toBeVisible" getByText(/Register and Upload Invoice/i).first() with timeout 15000ms
  - waiting for getByText(/Register and Upload Invoice/i).first()

```

```yaml
- complementary:
  - menu:
    - menuitem "deployment-unit Workflows":
      - img "deployment-unit"
      - text: Workflows
    - menuitem "notification Notification Distribution":
      - img "notification"
      - link "Notification Distribution":
        - /url: /dynamic/Shesha.SaGovInvoiceTracking/SaGov-Notification-Distribution-List
    - menuitem "dashboard DHA Payments Dashboard":
      - img "dashboard"
      - text: DHA Payments Dashboard
    - menuitem "upload Order Import":
      - img "upload"
      - text: Order Import
    - menuitem "import BAS Report":
      - img "import"
      - text: BAS Report
    - menuitem "import Payment Stubs Import":
      - img "import"
      - text: Payment Stubs Import
    - menuitem "cluster Suppliers":
      - img "cluster"
      - link "Suppliers":
        - /url: /dynamic/Shesha.Enterprise/supplier-table
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
  - paragraph: Shesha/header v9
  - text: Live
  - img "close"
  - link:
    - /url: /
    - img
  - text: Live Mode
  - switch "Switch to Edit mode"
  - img "block"
  - text: Live System Administrator
  - img "down"
  - img "user"
- main:
  - button "edit":
    - img "edit"
  - paragraph: Shesha.Workflow/workflows-my-items v5
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
    - listitem: 1-10 of 77 items
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
  - button "plus Create New down":
    - img "plus"
    - text: Create New
    - img "down"
  - button "download Export":
    - img "download"
    - text: Export
  - table:
    - row "Ref No Type Name Initiated Date Status Progress":
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
      - columnheader "Status":
        - text: Status
        - separator
      - columnheader "Progress":
        - text: Progress
        - separator
    - rowgroup:
      - row "search PAY11656/2026 LOGIS Request For Payment Order - OR-123076 Invoice(s) - IHK-6523 Supplier Name - KONICA MINOLTA SA 06/08/2026 15:39 Received":
        - cell "search":
          - link "search":
            - /url: /shesha/workflow?id=5b4bbd3e-041c-4e38-9a50-7f9a35fbdf77
            - img "search"
        - cell "PAY11656/2026"
        - cell "LOGIS Request For Payment"
        - cell "Order - OR-123076 Invoice(s) - IHK-6523 Supplier Name - KONICA MINOLTA SA"
        - cell "06/08/2026 15:39"
        - cell "Received"
        - cell:
          - img
          - img
          - img
          - img
          - img
          - img
          - img
          - img
          - img
          - img
          - img
      - row "search PAY11652/2026 BAS Request For Payment Invoice(s) - INV-732 Supplier Name - OMNI TECHNOLOGIES 06/08/2026 15:38 Received":
        - cell "search":
          - link "search":
            - /url: /shesha/workflow?id=09d4a709-6f74-4e17-91bc-b81041a9d0f3
            - img "search"
        - cell "PAY11652/2026"
        - cell "BAS Request For Payment"
        - cell "Invoice(s) - INV-732 Supplier Name - OMNI TECHNOLOGIES"
        - cell "06/08/2026 15:38"
        - cell "Received"
        - cell:
          - img
          - img
          - img
          - img
          - img
          - img
          - img
          - img
          - img
          - img
          - img
      - row "search PAY11552/2026 BAS Request For Payment Invoice(s) - 114553-51 Supplier Name - Maake 30/07/2026 08:40 Received":
        - cell "search":
          - link "search":
            - /url: /shesha/workflow?id=f2ad32b2-bf14-47fb-bfb8-f6b4672b11bf
            - img "search"
        - cell "PAY11552/2026"
        - cell "BAS Request For Payment"
        - cell "Invoice(s) - 114553-51 Supplier Name - Maake"
        - cell "30/07/2026 08:40"
        - cell "Received"
        - cell:
          - img
          - img
          - img
          - img
          - img
          - img
          - img
          - img
          - img
          - img
          - img
      - row "search PAY11535/2026 BAS Request For Payment Invoice(s) - 114552-50 Supplier Name - Maake 30/07/2026 08:34 Paid":
        - cell "search":
          - link "search":
            - /url: /shesha/workflow?id=ad7af51e-4519-47af-ab9b-050a8218bc23
            - img "search"
        - cell "PAY11535/2026"
        - cell "BAS Request For Payment"
        - cell "Invoice(s) - 114552-50 Supplier Name - Maake"
        - cell "30/07/2026 08:34"
        - cell "Paid"
        - cell:
          - img
          - img
          - img
          - img
          - img
          - img
          - img
          - img
          - img
          - img
          - img
      - row "search PAY11451/2026 BAS Request For Payment Invoice(s) - 0988226 Supplier Name - Maake 28/07/2026 20:15 Authorized":
        - cell "search":
          - link "search":
            - /url: /shesha/workflow?id=bc844002-72b3-405d-aae6-90907cdfd6bd
            - img "search"
        - cell "PAY11451/2026"
        - cell "BAS Request For Payment"
        - cell "Invoice(s) - 0988226 Supplier Name - Maake"
        - cell "28/07/2026 20:15"
        - cell "Authorized"
        - cell:
          - img
          - img
          - img
          - img
          - img
          - img
          - img
          - img
          - img
          - img
          - img
      - row "search PAY11442/2026 BAS Request For Payment Invoice(s) - 0986860 Supplier Name - Maake 28/07/2026 20:12 Authorized":
        - cell "search":
          - link "search":
            - /url: /shesha/workflow?id=199b7e78-4174-4624-aaf3-e15f534da39a
            - img "search"
        - cell "PAY11442/2026"
        - cell "BAS Request For Payment"
        - cell "Invoice(s) - 0986860 Supplier Name - Maake"
        - cell "28/07/2026 20:12"
        - cell "Authorized"
        - cell:
          - img
          - img
          - img
          - img
          - img
          - img
          - img
          - img
          - img
          - img
          - img
      - row "search PAY11434/2026 BAS Request For Payment Invoice(s) - 114552-39 Supplier Name - Maake 28/07/2026 20:09 Authorized":
        - cell "search":
          - link "search":
            - /url: /shesha/workflow?id=a634397d-4089-4fff-a04d-280280a8bd0e
            - img "search"
        - cell "PAY11434/2026"
        - cell "BAS Request For Payment"
        - cell "Invoice(s) - 114552-39 Supplier Name - Maake"
        - cell "28/07/2026 20:09"
        - cell "Authorized"
        - cell:
          - img
          - img
          - img
          - img
          - img
          - img
          - img
          - img
          - img
          - img
          - img
      - row "search PAY11425/2026 BAS Request For Payment Invoice(s) - 114552-44 Supplier Name - Maake 28/07/2026 20:00 Authorized":
        - cell "search":
          - link "search":
            - /url: /shesha/workflow?id=88c5fb9f-60c0-4ef6-9595-1a875482da7d
            - img "search"
        - cell "PAY11425/2026"
        - cell "BAS Request For Payment"
        - cell "Invoice(s) - 114552-44 Supplier Name - Maake"
        - cell "28/07/2026 20:00"
        - cell "Authorized"
        - cell:
          - img
          - img
          - img
          - img
          - img
          - img
          - img
          - img
          - img
          - img
          - img
      - row "search PAY11293/2026 BAS Request For Payment Invoice(s) - FTI1503474078 Supplier Name - OMNI TECHNOLOGIES 24/07/2026 09:53 Paid":
        - cell "search":
          - link "search":
            - /url: /shesha/workflow?id=03d1ae8c-8fce-4c6e-9313-e18d4fdf572a
            - img "search"
        - cell "PAY11293/2026"
        - cell "BAS Request For Payment"
        - cell "Invoice(s) - FTI1503474078 Supplier Name - OMNI TECHNOLOGIES"
        - cell "24/07/2026 09:53"
        - cell "Paid"
        - cell:
          - img
          - img
          - img
          - img
          - img
          - img
          - img
          - img
          - img
          - img
          - img
      - row "search PAY11287/2026 LOGIS Request For Payment Order - OR-124083 Invoice(s) - KT9395 Supplier Name - GOVERNMENT PRINTING WORKS 24/07/2026 09:25 Paid":
        - cell "search":
          - link "search":
            - /url: /shesha/workflow?id=c3c34d28-4e0d-4072-a350-6ada3782b326
            - img "search"
        - cell "PAY11287/2026"
        - cell "LOGIS Request For Payment"
        - cell "Order - OR-124083 Invoice(s) - KT9395 Supplier Name - GOVERNMENT PRINTING WORKS"
        - cell "24/07/2026 09:25"
        - cell "Paid"
        - cell:
          - img
          - img
          - img
          - img
          - img
          - img
          - img
          - img
          - img
          - img
          - img
- alert
```

# Test source

```ts
  434 |   await page.getByText(/BAS Request for Payment/i).first().click();
  435 |   await expect(page.getByText(/Register and Upload Invoice/i).first()).toBeVisible({ timeout: 15_000 });
  436 | 
  437 |   // STEP 1: SNAPSHOT — confirm Invoice Amount field
  438 |   const invoiceAmountField = page.getByLabel(/invoice amount/i).first();
  439 |   await expect(invoiceAmountField).toBeVisible();
  440 | 
  441 |   // STEP 2: TYPE an invoice amount
  442 |   await invoiceAmountField.fill('1000');
  443 | 
  444 |   // ASSERT (BLOCKING) The invoice amount is displayed
  445 |   await expect(invoiceAmountField).toHaveValue('1000');
  446 | });
  447 | 
  448 | test('TC-19 — Attach Invoice attachment', async ({ page }) => {
  449 |   await page.goto(`${APP_URL}/login`);
  450 |   await page.getByPlaceholder(/username/i).fill('admin');
  451 |   await page.getByPlaceholder(/password/i).fill('123qwe');
  452 |   await page.getByRole('button', { name: /sign in/i }).click();
  453 |   await page.waitForURL(url => !url.toString().includes('/login'), { timeout: 30_000 });
  454 |   await page.getByRole('menuitem', { name: /workflow/i }).or(page.getByText(/^Workflow$/i).first()).click();
  455 |   await page.getByText(/my items/i).first().click();
  456 |   await page.getByRole('button', { name: /create new/i }).click();
  457 |   await page.getByText(/BAS Request for Payment/i).first().click();
  458 |   await expect(page.getByText(/Register and Upload Invoice/i).first()).toBeVisible({ timeout: 15_000 });
  459 | 
  460 |   // STEP 1: SNAPSHOT — confirm Invoice attachment upload control
  461 |   // TODO[selector]: Locate the file upload for Invoice attachment
  462 |   const fileInput = page.locator('input[type="file"]').first();
  463 |   await expect(page.getByText(/invoice attachment/i).first()).toBeVisible();
  464 | 
  465 |   // STEP 2: Attach a file
  466 |   await fileInput.setInputFiles({ name: 'test-invoice.pdf', mimeType: 'application/pdf', buffer: Buffer.from('test pdf content') });
  467 | 
  468 |   // ASSERT (BLOCKING) The invoice attachment is attached
  469 |   await expect(page.getByText(/test-invoice\.pdf/i).or(page.getByText(/invoice attachment/i))).toBeVisible({ timeout: 10_000 });
  470 | });
  471 | 
  472 | test('TC-20 — Click on the Add icon to save the invoice line item', async ({ page }) => {
  473 |   await page.goto(`${APP_URL}/login`);
  474 |   await page.getByPlaceholder(/username/i).fill('admin');
  475 |   await page.getByPlaceholder(/password/i).fill('123qwe');
  476 |   await page.getByRole('button', { name: /sign in/i }).click();
  477 |   await page.waitForURL(url => !url.toString().includes('/login'), { timeout: 30_000 });
  478 |   await page.getByRole('menuitem', { name: /workflow/i }).or(page.getByText(/^Workflow$/i).first()).click();
  479 |   await page.getByText(/my items/i).first().click();
  480 |   await page.getByRole('button', { name: /create new/i }).click();
  481 |   await page.getByText(/BAS Request for Payment/i).first().click();
  482 |   await expect(page.getByText(/Register and Upload Invoice/i).first()).toBeVisible({ timeout: 15_000 });
  483 | 
  484 |   // Fill in required invoice fields first
  485 |   await page.getByLabel(/invoice no/i).first().fill('INV-TEST-001');
  486 |   await page.getByLabel(/invoice amount/i).first().fill('1000');
  487 | 
  488 |   // STEP 1: SNAPSHOT — confirm the Add icon
  489 |   const addIcon = page.locator('[aria-label*="add"], button[class*="add"]').first()
  490 |     .or(page.getByRole('button', { name: /add/i }).first());
  491 |   await expect(addIcon).toBeVisible();
  492 | 
  493 |   // STEP 2: CLICK the Add icon
  494 |   await addIcon.click();
  495 | 
  496 |   // ASSERT (BLOCKING) The invoice line item is added to the Invoices grid
  497 |   await expect(page.getByText(/INV-TEST-001/i)).toBeVisible({ timeout: 10_000 });
  498 | });
  499 | 
  500 | test('TC-21 — Attach Supporting Documents', async ({ page }) => {
  501 |   await page.goto(`${APP_URL}/login`);
  502 |   await page.getByPlaceholder(/username/i).fill('admin');
  503 |   await page.getByPlaceholder(/password/i).fill('123qwe');
  504 |   await page.getByRole('button', { name: /sign in/i }).click();
  505 |   await page.waitForURL(url => !url.toString().includes('/login'), { timeout: 30_000 });
  506 |   await page.getByRole('menuitem', { name: /workflow/i }).or(page.getByText(/^Workflow$/i).first()).click();
  507 |   await page.getByText(/my items/i).first().click();
  508 |   await page.getByRole('button', { name: /create new/i }).click();
  509 |   await page.getByText(/BAS Request for Payment/i).first().click();
  510 |   await expect(page.getByText(/Register and Upload Invoice/i).first()).toBeVisible({ timeout: 15_000 });
  511 | 
  512 |   // STEP 1: SNAPSHOT — confirm Supporting Documents upload
  513 |   await expect(page.getByText(/supporting documents/i).first()).toBeVisible();
  514 | 
  515 |   // STEP 2: Attach supporting document
  516 |   // TODO[selector]: Locate the Supporting Documents file input
  517 |   const supportingDocsInput = page.locator('input[type="file"]').nth(1);
  518 |   await supportingDocsInput.setInputFiles({ name: 'supporting-doc.pdf', mimeType: 'application/pdf', buffer: Buffer.from('supporting document content') });
  519 | 
  520 |   // ASSERT (BLOCKING) Supporting documents are attached
  521 |   await expect(page.getByText(/supporting-doc\.pdf/i).or(page.getByText(/supporting documents/i))).toBeVisible({ timeout: 10_000 });
  522 | });
  523 | 
  524 | test('TC-22 — Click on the Close button', async ({ page }) => {
  525 |   await page.goto(`${APP_URL}/login`);
  526 |   await page.getByPlaceholder(/username/i).fill('admin');
  527 |   await page.getByPlaceholder(/password/i).fill('123qwe');
  528 |   await page.getByRole('button', { name: /sign in/i }).click();
  529 |   await page.waitForURL(url => !url.toString().includes('/login'), { timeout: 30_000 });
  530 |   await page.getByRole('menuitem', { name: /workflow/i }).or(page.getByText(/^Workflow$/i).first()).click();
  531 |   await page.getByText(/my items/i).first().click();
  532 |   await page.getByRole('button', { name: /create new/i }).click();
  533 |   await page.getByText(/BAS Request for Payment/i).first().click();
> 534 |   await expect(page.getByText(/Register and Upload Invoice/i).first()).toBeVisible({ timeout: 15_000 });
      |                                                                        ^ Error: expect(locator).toBeVisible() failed
  535 | 
  536 |   // STEP 1: SNAPSHOT — confirm the Close button
  537 |   await expect(page.getByRole('button', { name: /close/i })).toBeVisible();
  538 | 
  539 |   // STEP 2: CLICK the Close button
  540 |   await page.getByRole('button', { name: /close/i }).click();
  541 | 
  542 |   // ASSERT (BLOCKING) The system redirects to the homepage
  543 |   await expect(page).not.toHaveURL(/register|upload|invoice/i, { timeout: 10_000 });
  544 | });
  545 | 
  546 | test('TC-23 — Click on Submit button', async ({ page }) => {
  547 |   await page.goto(`${APP_URL}/login`);
  548 |   await page.getByPlaceholder(/username/i).fill('admin');
  549 |   await page.getByPlaceholder(/password/i).fill('123qwe');
  550 |   await page.getByRole('button', { name: /sign in/i }).click();
  551 |   await page.waitForURL(url => !url.toString().includes('/login'), { timeout: 30_000 });
  552 |   await page.getByRole('menuitem', { name: /workflow/i }).or(page.getByText(/^Workflow$/i).first()).click();
  553 |   await page.getByText(/my items/i).first().click();
  554 |   await page.getByRole('button', { name: /create new/i }).click();
  555 |   await page.getByText(/BAS Request for Payment/i).first().click();
  556 |   await expect(page.getByText(/Register and Upload Invoice/i).first()).toBeVisible({ timeout: 15_000 });
  557 | 
  558 |   // Fill required fields before submitting
  559 |   const supplierEllipsis = page.locator('button[class*="ellipsis"], button[title*="supplier"], [aria-label*="supplier"]').first()
  560 |     .or(page.getByLabel(/supplier name/i).locator('..').getByRole('button').first());
  561 |   await supplierEllipsis.click().catch(() => {});
  562 |   await page.getByRole('row').nth(1).click().catch(async () => {
  563 |     await page.keyboard.press('Escape');
  564 |   });
  565 | 
  566 |   await page.getByLabel(/invoice no/i).first().fill('INV-SUBMIT-001');
  567 |   await page.getByLabel(/invoice amount/i).first().fill('5000');
  568 | 
  569 |   // STEP 1: SNAPSHOT — confirm the Submit button
  570 |   await expect(page.getByRole('button', { name: /submit/i })).toBeVisible();
  571 | 
  572 |   // STEP 2: CLICK the Submit button
  573 |   await page.getByRole('button', { name: /submit/i }).click();
  574 | 
  575 |   // STEP 3: WAIT for redirect
  576 |   await page.waitForURL(url => !url.toString().includes('register'), { timeout: 30_000 }).catch(() => {});
  577 | 
  578 |   // ASSERT (BLOCKING) The system redirects to the homepage
  579 |   await expect(page.getByRole('button', { name: /create new/i }).or(page.getByText(/my items/i))).toBeVisible({ timeout: 15_000 });
  580 | });
  581 | 
```