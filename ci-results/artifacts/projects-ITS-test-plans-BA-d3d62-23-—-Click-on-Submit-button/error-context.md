# Instructions

- Following Playwright test failed.
- Explain why, be concise, respect Playwright best practices.
- Provide a snippet of code with the fix, if possible.

# Test info

- Name: projects/ITS/test-plans/BAS/register-and-upload-invoice.spec.ts >> TC-23 — Click on Submit button
- Location: projects/ITS/test-plans/BAS/register-and-upload-invoice.spec.ts:546:5

# Error details

```
Test timeout of 90000ms exceeded.
```

```
Error: keyboard.press: Target page, context or browser has been closed
```

# Page snapshot

```yaml
- generic [ref=e1]:
  - generic [ref=e4]:
    - complementary [ref=e5]:
      - menu [ref=e9]:
        - menuitem "deployment-unit Workflows" [ref=e10] [cursor=pointer]:
          - img "deployment-unit" [ref=e11]
          - generic [ref=e14]: Workflows
        - menuitem [ref=e15] [cursor=pointer]:
          - img "notification" [ref=e16]
          - link "Notification Distribution" [ref=e20]:
            - /url: /dynamic/Shesha.SaGovInvoiceTracking/SaGov-Notification-Distribution-List
        - menuitem "dashboard DHA Payments Dashboard" [ref=e21] [cursor=pointer]:
          - img "dashboard" [ref=e22]
          - generic [ref=e25]: DHA Payments Dashboard
        - menuitem "upload Order Import" [ref=e26] [cursor=pointer]:
          - img "upload" [ref=e27]
          - generic [ref=e30]: Order Import
        - menuitem "import BAS Report" [ref=e31] [cursor=pointer]:
          - img "import" [ref=e32]
          - generic [ref=e35]: BAS Report
        - menuitem "import Payment Stubs Import" [ref=e36] [cursor=pointer]:
          - img "import" [ref=e37]
          - generic [ref=e40]: Payment Stubs Import
        - menuitem [ref=e41] [cursor=pointer]:
          - img "cluster" [ref=e42]
          - link "Suppliers" [ref=e46]:
            - /url: /dynamic/Shesha.Enterprise/supplier-table
        - menuitem "tool Administration" [ref=e47] [cursor=pointer]:
          - img "tool" [ref=e48]
          - generic [ref=e51]: Administration
        - menuitem "setting Configurations" [ref=e52] [cursor=pointer]:
          - img "setting" [ref=e53]
          - generic [ref=e56]: Configurations
      - img "menu-unfold" [ref=e59] [cursor=pointer]
    - generic [ref=e62]:
      - banner [ref=e63]:
        - generic [ref=e69]:
          - generic [ref=e71]:
            - button [ref=e72] [cursor=pointer]:
              - img "edit" [ref=e73]
            - paragraph [ref=e76] [cursor=pointer]: Shesha/header v9
            - generic [ref=e77]:
              - generic [ref=e78]: Live
              - img "close" [ref=e79] [cursor=pointer]
          - generic [ref=e90]:
            - link [ref=e96] [cursor=pointer]:
              - /url: /
            - generic [ref=e108]:
              - generic [ref=e109]:
                - generic [ref=e111]:
                  - generic [ref=e112]: Live Mode
                  - switch "Switch to Edit mode" [ref=e114] [cursor=pointer]
                - generic "Click to change view mode" [ref=e118] [cursor=pointer]:
                  - img "block" [ref=e119]
                  - generic [ref=e122]: Live
              - generic [ref=e124]:
                - generic [ref=e125] [cursor=pointer]:
                  - text: System Administrator
                  - img "down" [ref=e126]
                - img "user" [ref=e130]
      - main [ref=e133]:
        - generic [ref=e138]:
          - generic [ref=e139]:
            - generic [ref=e142]:
              - heading [level=4] [ref=e144]:
                - strong [ref=e145]: "Register and Upload Invoice:"
              - generic [ref=e146]: Draft
            - generic [ref=e150]:
              - generic [ref=e151]: "Ref No: PAY13654/2026"
              - generic [ref=e152]: "Created by: System Administrator in 2 hours"
              - generic [ref=e153]: "SLA: 1 business days"
          - generic [ref=e158]:
            - generic [ref=e160]:
              - button [ref=e161] [cursor=pointer]:
                - img "edit" [ref=e162]
              - paragraph [ref=e165] [cursor=pointer]: Shesha.SaGovInvoiceTracking/SAGovRequestForPayment-BAS-wf-RegisterScanandUploadInvoices-Create v28
              - generic [ref=e166]:
                - generic [ref=e167]: Live
                - img "close" [ref=e168] [cursor=pointer]
            - generic [ref=e181]:
              - generic [ref=e186]:
                - generic [ref=e191]:
                  - generic [ref=e193]:
                    - generic "Date Received" [ref=e195]:
                      - text: Date Received
                      - generic [ref=e196]: "*"
                    - generic [ref=e201]:
                      - textbox [ref=e202]: 11/09/2026
                      - generic:
                        - img "calendar"
                      - button [ref=e203] [cursor=pointer]:
                        - img "close-circle" [ref=e204]
                  - generic [ref=e208]:
                    - generic "Supplier Name" [ref=e210]:
                      - text: Supplier Name
                      - generic [ref=e211]: "*"
                    - generic [ref=e217]:
                      - combobox [ref=e221] [cursor=pointer]
                      - button [ref=e222] [cursor=pointer]:
                        - img "ellipsis" [ref=e224]
                  - generic [ref=e228]:
                    - generic "Description" [ref=e230]
                    - textbox [ref=e235]
                - generic [ref=e242]:
                  - heading "Supplier Details" [level=4] [ref=e248]
                  - alert [ref=e249]:
                    - img "warning" [ref=e250]
                    - generic [ref=e253]:
                      - generic [ref=e254]: No Supplier Details.
                      - generic [ref=e256]: Select an Order
              - generic [ref=e258]:
                - generic [ref=e259]:
                  - img "right" [ref=e261] [cursor=pointer]
                  - generic [ref=e264]: Invoices
                - generic [ref=e272]:
                  - table [ref=e282]:
                    - row [ref=e283]:
                      - columnheader [ref=e284]
                      - columnheader "Invoice Date" [ref=e285]:
                        - text: Invoice Date
                        - separator [ref=e286]
                      - columnheader "Service Delivery Date" [ref=e287] [cursor=pointer]:
                        - text: Service Delivery Date
                        - separator [ref=e288]
                      - columnheader "Invoice No" [ref=e289]:
                        - text: Invoice No
                        - separator [ref=e290]
                      - columnheader "Invoice Amount" [ref=e291]:
                        - text: Invoice Amount
                        - separator [ref=e292]
                      - columnheader "Invoice Attachment" [ref=e293]:
                        - text: Invoice Attachment
                        - separator [ref=e294]
                    - row [ref=e296]:
                      - columnheader [ref=e297]:
                        - generic [ref=e298]:
                          - button [ref=e299] [cursor=pointer]:
                            - img "plus-circle" [ref=e301]
                          - button [ref=e305] [cursor=pointer]:
                            - img "close-circle" [ref=e307]
                      - columnheader [ref=e310]:
                        - generic [ref=e317]:
                          - textbox "Select date" [ref=e318]
                          - generic:
                            - img "calendar"
                      - columnheader [ref=e319]:
                        - generic [ref=e326]:
                          - textbox "Select date" [ref=e327]
                          - generic:
                            - img "calendar"
                      - columnheader [ref=e328]:
                        - textbox [ref=e335]
                      - columnheader [ref=e336]:
                        - generic [ref=e342]:
                          - generic [ref=e343]:
                            - button "Increase Value" [ref=e344] [cursor=pointer]:
                              - img "up" [ref=e345]
                            - button "Decrease Value" [ref=e348] [cursor=pointer]:
                              - img "down" [ref=e349]
                          - spinbutton [ref=e353]
                      - columnheader [ref=e354]:
                        - button "upload (press to upload)" [ref=e366] [cursor=pointer]:
                          - img "upload" [ref=e368]
                          - generic [ref=e371]: (press to upload)
                    - rowgroup [ref=e372]:
                      - generic [ref=e373]:
                        - heading "No Invoices" [level=4] [ref=e374]
                        - generic [ref=e375]: No invoices were added
                  - strong [ref=e382]: "Total Amount: R0"
              - generic [ref=e383]:
                - generic [ref=e388]:
                  - generic [ref=e389]:
                    - img "right" [ref=e391] [cursor=pointer]
                    - generic [ref=e394]: Other Supporting Documents
                  - button "upload (press to upload)" [ref=e408] [cursor=pointer]:
                    - img "upload" [ref=e410]
                    - generic [ref=e413]: (press to upload)
                - generic [ref=e419]:
                  - generic [ref=e420]:
                    - img "right" [ref=e422] [cursor=pointer]
                    - generic [ref=e425]: Comments
                  - generic [ref=e431]:
                    - generic [ref=e432]:
                      - textbox [ref=e433]
                      - button "check Save" [disabled] [ref=e435]:
                        - generic:
                          - img "check"
                        - generic: Save
                    - generic [ref=e436]: There are no notes
              - generic [ref=e460]:
                - button "Close" [ref=e462] [cursor=pointer]
                - button "Submit" [disabled] [ref=e465]
  - alert [ref=e466]
  - generic [ref=e467]:
    - dialog "Select Item":
      - generic [ref=e468]:
        - button "Close" [ref=e469] [cursor=pointer]:
          - img "close" [ref=e471]
        - generic [ref=e474]: Select Item
        - generic [ref=e476]:
          - alert [ref=e477]:
            - generic [ref=e478]: Double click an item to select
          - generic [ref=e482]:
            - textbox [ref=e484]
            - button [ref=e487] [cursor=pointer]:
              - img "search" [ref=e489]
          - list [ref=e493]:
            - listitem [ref=e494]: 1-10 of 362 items
            - listitem "Previous Page" [ref=e495]:
              - button [disabled] [ref=e496]:
                - img "left" [ref=e497]
            - listitem "1" [ref=e500] [cursor=pointer]
            - listitem "2" [ref=e502] [cursor=pointer]
            - listitem "3" [ref=e504] [cursor=pointer]
            - listitem "Next 3 Pages" [ref=e506] [cursor=pointer]:
              - generic [ref=e508]:
                - img "double-right" [ref=e509]
                - generic [ref=e512]: •••
            - listitem "37" [ref=e513] [cursor=pointer]
            - listitem "Next Page" [ref=e515] [cursor=pointer]:
              - button [ref=e516]:
                - img "right" [ref=e517]
            - listitem [ref=e520]:
              - generic "Page Size" [ref=e521] [cursor=pointer]:
                - generic [ref=e522]:
                  - combobox "Page Size" [ref=e524]
                  - generic "10 / page" [ref=e525]
          - table [ref=e529]:
            - row [ref=e530]:
              - columnheader "Name" [ref=e531]:
                - text: Name
                - separator [ref=e532]
              - columnheader "Supplier No" [ref=e533]:
                - text: Supplier No
                - separator [ref=e534]
              - columnheader "Contact Email" [ref=e535]:
                - text: Contact Email
                - separator [ref=e536]
              - columnheader "Contact Mobile No" [ref=e537]:
                - text: Contact Mobile No
                - separator [ref=e538]
              - columnheader "Is Vat Registered" [ref=e539]:
                - text: Is Vat Registered
                - separator [ref=e540]
              - columnheader "Organisation Type" [ref=e541]:
                - text: Organisation Type
                - separator [ref=e542]
            - rowgroup [ref=e543]:
              - row [ref=e544]:
                - cell "OMNI TECHNOLOGIES" [ref=e545]
                - cell "EM583" [ref=e546]
                - cell [ref=e547]
                - cell [ref=e548]
                - cell "No" [ref=e549]
                - cell [ref=e550]
              - row [ref=e551]:
                - cell "MAHUHUMELO TRADING ENTERPRISE" [ref=e552]
                - cell "AK663" [ref=e553]
                - cell [ref=e554]
                - cell [ref=e555]
                - cell "No" [ref=e556]
                - cell [ref=e557]
              - row [ref=e558]:
                - cell "ABACUS SUPPLY CHAIN SOLUTIONS" [ref=e559]
                - cell "DG692" [ref=e560]
                - cell [ref=e561]
                - cell [ref=e562]
                - cell "No" [ref=e563]
                - cell [ref=e564]
              - row [ref=e565]:
                - cell "MOKONE DEVELOPMENTS" [ref=e566]
                - cell "IZ058" [ref=e567]
                - cell [ref=e568]
                - cell [ref=e569]
                - cell "No" [ref=e570]
                - cell [ref=e571]
              - row [ref=e572]:
                - cell "MELLYPEARL" [ref=e573]
                - cell "MO387" [ref=e574]
                - cell [ref=e575]
                - cell [ref=e576]
                - cell "No" [ref=e577]
                - cell [ref=e578]
              - row [ref=e579]:
                - cell "RAMTECH BUSINESS SOLUTION" [ref=e580]
                - cell "IG510" [ref=e581]
                - cell [ref=e582]
                - cell [ref=e583]
                - cell "No" [ref=e584]
                - cell [ref=e585]
              - row [ref=e586]:
                - cell "TYGER VALLEY CENTRE" [ref=e587]
                - cell "MO680" [ref=e588]
                - cell [ref=e589]
                - cell [ref=e590]
                - cell "No" [ref=e591]
                - cell [ref=e592]
              - row [ref=e593]:
                - cell "DIKGARATLHI ENTERPRISE" [ref=e594]
                - cell "LY007" [ref=e595]
                - cell [ref=e596]
                - cell [ref=e597]
                - cell "No" [ref=e598]
                - cell [ref=e599]
              - row [ref=e600]:
                - cell "MATURUKA HOLDINGS" [ref=e601]
                - cell "MP355" [ref=e602]
                - cell [ref=e603]
                - cell [ref=e604]
                - cell "No" [ref=e605]
                - cell [ref=e606]
              - row [ref=e607]:
                - cell "ALERT PATROL" [ref=e608]
                - cell "JB203" [ref=e609]
                - cell [ref=e610]
                - cell [ref=e611]
                - cell "No" [ref=e612]
                - cell [ref=e613]
        - button "Close" [ref=e615] [cursor=pointer]
```

# Test source

```ts
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
  534 |   await expect(page.getByText(/Register and Upload Invoice/i).first()).toBeVisible({ timeout: 15_000 });
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
> 563 |     await page.keyboard.press('Escape');
      |                         ^ Error: keyboard.press: Target page, context or browser has been closed
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