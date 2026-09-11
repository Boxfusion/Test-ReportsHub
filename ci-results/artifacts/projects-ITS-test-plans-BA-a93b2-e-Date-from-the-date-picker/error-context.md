# Instructions

- Following Playwright test failed.
- Explain why, be concise, respect Playwright best practices.
- Provide a snippet of code with the fix, if possible.

# Test info

- Name: projects/ITS/test-plans/BAS/register-and-upload-invoice.spec.ts >> TC-14 — Select Invoice Date from the date picker
- Location: projects/ITS/test-plans/BAS/register-and-upload-invoice.spec.ts:326:5

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
  236 | 
  237 |   // STEP 2: SELECT a supplier name from the displayed list
  238 |   // TODO[selector]: Click the first supplier row in the dialog list
  239 |   await page.getByRole('row').nth(1).click().catch(async () => {
  240 |     await page.getByRole('option').first().click();
  241 |   });
  242 | 
  243 |   // ASSERT (BLOCKING) The selected supplier is displayed in the Supplier Name field
  244 |   // ASSERT (BLOCKING) The Supplier Details panel is populated and read-only
  245 |   await expect(page.getByLabel(/supplier name/i).or(page.locator('input[name*="supplier"]').first())).not.toBeEmpty({ timeout: 10_000 });
  246 | });
  247 | 
  248 | test('TC-11 — Click Add icon on Invoices panel without populating fields (validation)', async ({ page }) => {
  249 |   await page.goto(`${APP_URL}/login`);
  250 |   await page.getByPlaceholder(/username/i).fill('admin');
  251 |   await page.getByPlaceholder(/password/i).fill('123qwe');
  252 |   await page.getByRole('button', { name: /sign in/i }).click();
  253 |   await page.waitForURL(url => !url.toString().includes('/login'), { timeout: 30_000 });
  254 |   await page.getByRole('menuitem', { name: /workflow/i }).or(page.getByText(/^Workflow$/i).first()).click();
  255 |   await page.getByText(/my items/i).first().click();
  256 |   await page.getByRole('button', { name: /create new/i }).click();
  257 |   await page.getByText(/BAS Request for Payment/i).first().click();
  258 |   await expect(page.getByText(/Register and Upload Invoice/i).first()).toBeVisible({ timeout: 15_000 });
  259 | 
  260 |   // STEP 1: SNAPSHOT — confirm Add icon on Invoices panel
  261 |   // TODO[selector]: Locate the Add icon on the Invoices panel
  262 |   const addIcon = page.locator('[class*="invoices"] button[class*="add"], [aria-label*="add invoice"], button:near(:text("Invoices"))').first()
  263 |     .or(page.getByRole('button', { name: /add/i }).first());
  264 |   await expect(addIcon).toBeVisible();
  265 | 
  266 |   // STEP 2: CLICK the Add icon without filling fields
  267 |   await addIcon.click();
  268 | 
  269 |   // ASSERT (BLOCKING) Mandatory fields are highlighted with "this field is required"
  270 |   await expect(page.getByText(/this field is required/i).first()).toBeVisible({ timeout: 5_000 });
  271 | });
  272 | 
  273 | test('TC-12 — Click Cancel icon on the Invoices panel', async ({ page }) => {
  274 |   await page.goto(`${APP_URL}/login`);
  275 |   await page.getByPlaceholder(/username/i).fill('admin');
  276 |   await page.getByPlaceholder(/password/i).fill('123qwe');
  277 |   await page.getByRole('button', { name: /sign in/i }).click();
  278 |   await page.waitForURL(url => !url.toString().includes('/login'), { timeout: 30_000 });
  279 |   await page.getByRole('menuitem', { name: /workflow/i }).or(page.getByText(/^Workflow$/i).first()).click();
  280 |   await page.getByText(/my items/i).first().click();
  281 |   await page.getByRole('button', { name: /create new/i }).click();
  282 |   await page.getByText(/BAS Request for Payment/i).first().click();
  283 |   await expect(page.getByText(/Register and Upload Invoice/i).first()).toBeVisible({ timeout: 15_000 });
  284 | 
  285 |   const addIcon = page.locator('[class*="invoices"] button[class*="add"], [aria-label*="add invoice"]').first()
  286 |     .or(page.getByRole('button', { name: /add/i }).first());
  287 |   await addIcon.click();
  288 |   await expect(page.getByText(/this field is required/i).first()).toBeVisible({ timeout: 5_000 });
  289 | 
  290 |   // STEP 1: SNAPSHOT — confirm the Cancel icon
  291 |   // TODO[selector]: Locate the Cancel icon on the Invoices panel
  292 |   const cancelIcon = page.locator('[aria-label*="cancel"], button[class*="cancel"]').first()
  293 |     .or(page.getByRole('button', { name: /cancel/i }).first());
  294 |   await expect(cancelIcon).toBeVisible();
  295 | 
  296 |   // STEP 2: CLICK the Cancel icon
  297 |   await cancelIcon.click();
  298 | 
  299 |   // ASSERT (BLOCKING) Validation errors are cleared
  300 |   await expect(page.getByText(/this field is required/i)).toHaveCount(0, { timeout: 5_000 });
  301 | });
  302 | 
  303 | test('TC-13 — Click on the Invoice Date field', async ({ page }) => {
  304 |   await page.goto(`${APP_URL}/login`);
  305 |   await page.getByPlaceholder(/username/i).fill('admin');
  306 |   await page.getByPlaceholder(/password/i).fill('123qwe');
  307 |   await page.getByRole('button', { name: /sign in/i }).click();
  308 |   await page.waitForURL(url => !url.toString().includes('/login'), { timeout: 30_000 });
  309 |   await page.getByRole('menuitem', { name: /workflow/i }).or(page.getByText(/^Workflow$/i).first()).click();
  310 |   await page.getByText(/my items/i).first().click();
  311 |   await page.getByRole('button', { name: /create new/i }).click();
  312 |   await page.getByText(/BAS Request for Payment/i).first().click();
  313 |   await expect(page.getByText(/Register and Upload Invoice/i).first()).toBeVisible({ timeout: 15_000 });
  314 | 
  315 |   // STEP 1: SNAPSHOT — confirm Invoice Date field
  316 |   const invoiceDateField = page.getByLabel(/invoice date/i).first();
  317 |   await expect(invoiceDateField).toBeVisible();
  318 | 
  319 |   // STEP 2: CLICK the Invoice Date field
  320 |   await invoiceDateField.click();
  321 | 
  322 |   // ASSERT (BLOCKING) The Date Picker is displayed for Invoice Date
  323 |   await expect(page.locator('.ant-picker-dropdown, [class*="calendar"]').first()).toBeVisible({ timeout: 5_000 });
  324 | });
  325 | 
  326 | test('TC-14 — Select Invoice Date from the date picker', async ({ page }) => {
  327 |   await page.goto(`${APP_URL}/login`);
  328 |   await page.getByPlaceholder(/username/i).fill('admin');
  329 |   await page.getByPlaceholder(/password/i).fill('123qwe');
  330 |   await page.getByRole('button', { name: /sign in/i }).click();
  331 |   await page.waitForURL(url => !url.toString().includes('/login'), { timeout: 30_000 });
  332 |   await page.getByRole('menuitem', { name: /workflow/i }).or(page.getByText(/^Workflow$/i).first()).click();
  333 |   await page.getByText(/my items/i).first().click();
  334 |   await page.getByRole('button', { name: /create new/i }).click();
  335 |   await page.getByText(/BAS Request for Payment/i).first().click();
> 336 |   await expect(page.getByText(/Register and Upload Invoice/i).first()).toBeVisible({ timeout: 15_000 });
      |                                                                        ^ Error: expect(locator).toBeVisible() failed
  337 | 
  338 |   const invoiceDateField = page.getByLabel(/invoice date/i).first();
  339 |   await invoiceDateField.click();
  340 |   await expect(page.locator('.ant-picker-dropdown, [class*="calendar"]').first()).toBeVisible({ timeout: 5_000 });
  341 | 
  342 |   // STEP 2: SELECT a past date
  343 |   await page.locator('.ant-picker-cell:not(.ant-picker-cell-disabled):not(.ant-picker-cell-selected)').first().click().catch(async () => {
  344 |     await page.keyboard.press('Escape');
  345 |     await invoiceDateField.fill('2026-06-01');
  346 |     await page.keyboard.press('Enter');
  347 |   });
  348 | 
  349 |   // ASSERT (BLOCKING) Only current or past dates are selectable; the selected date is displayed
  350 |   await expect(invoiceDateField).not.toBeEmpty();
  351 | });
  352 | 
  353 | test('TC-15 — Click on Service Delivery Date field', async ({ page }) => {
  354 |   await page.goto(`${APP_URL}/login`);
  355 |   await page.getByPlaceholder(/username/i).fill('admin');
  356 |   await page.getByPlaceholder(/password/i).fill('123qwe');
  357 |   await page.getByRole('button', { name: /sign in/i }).click();
  358 |   await page.waitForURL(url => !url.toString().includes('/login'), { timeout: 30_000 });
  359 |   await page.getByRole('menuitem', { name: /workflow/i }).or(page.getByText(/^Workflow$/i).first()).click();
  360 |   await page.getByText(/my items/i).first().click();
  361 |   await page.getByRole('button', { name: /create new/i }).click();
  362 |   await page.getByText(/BAS Request for Payment/i).first().click();
  363 |   await expect(page.getByText(/Register and Upload Invoice/i).first()).toBeVisible({ timeout: 15_000 });
  364 | 
  365 |   // STEP 1: SNAPSHOT — confirm Service Delivery Date field
  366 |   const serviceDeliveryField = page.getByLabel(/service delivery/i).first();
  367 |   await expect(serviceDeliveryField).toBeVisible();
  368 | 
  369 |   // STEP 2: CLICK the Service Delivery Date field
  370 |   await serviceDeliveryField.click();
  371 | 
  372 |   // ASSERT (BLOCKING) The Date Picker is displayed for Service Delivery Date
  373 |   await expect(page.locator('.ant-picker-dropdown, [class*="calendar"]').first()).toBeVisible({ timeout: 5_000 });
  374 | });
  375 | 
  376 | test('TC-16 — Select Service Delivery Date from the date picker', async ({ page }) => {
  377 |   await page.goto(`${APP_URL}/login`);
  378 |   await page.getByPlaceholder(/username/i).fill('admin');
  379 |   await page.getByPlaceholder(/password/i).fill('123qwe');
  380 |   await page.getByRole('button', { name: /sign in/i }).click();
  381 |   await page.waitForURL(url => !url.toString().includes('/login'), { timeout: 30_000 });
  382 |   await page.getByRole('menuitem', { name: /workflow/i }).or(page.getByText(/^Workflow$/i).first()).click();
  383 |   await page.getByText(/my items/i).first().click();
  384 |   await page.getByRole('button', { name: /create new/i }).click();
  385 |   await page.getByText(/BAS Request for Payment/i).first().click();
  386 |   await expect(page.getByText(/Register and Upload Invoice/i).first()).toBeVisible({ timeout: 15_000 });
  387 | 
  388 |   const serviceDeliveryField = page.getByLabel(/service delivery/i).first();
  389 |   await serviceDeliveryField.click();
  390 |   await expect(page.locator('.ant-picker-dropdown, [class*="calendar"]').first()).toBeVisible({ timeout: 5_000 });
  391 | 
  392 |   await page.locator('.ant-picker-cell:not(.ant-picker-cell-disabled):not(.ant-picker-cell-selected)').first().click().catch(async () => {
  393 |     await page.keyboard.press('Escape');
  394 |     await serviceDeliveryField.fill('2026-06-10');
  395 |     await page.keyboard.press('Enter');
  396 |   });
  397 | 
  398 |   // ASSERT (BLOCKING) The selected date is displayed in the Service Delivery Date field
  399 |   await expect(serviceDeliveryField).not.toBeEmpty();
  400 | });
  401 | 
  402 | test('TC-17 — Populate the Invoice No. field', async ({ page }) => {
  403 |   await page.goto(`${APP_URL}/login`);
  404 |   await page.getByPlaceholder(/username/i).fill('admin');
  405 |   await page.getByPlaceholder(/password/i).fill('123qwe');
  406 |   await page.getByRole('button', { name: /sign in/i }).click();
  407 |   await page.waitForURL(url => !url.toString().includes('/login'), { timeout: 30_000 });
  408 |   await page.getByRole('menuitem', { name: /workflow/i }).or(page.getByText(/^Workflow$/i).first()).click();
  409 |   await page.getByText(/my items/i).first().click();
  410 |   await page.getByRole('button', { name: /create new/i }).click();
  411 |   await page.getByText(/BAS Request for Payment/i).first().click();
  412 |   await expect(page.getByText(/Register and Upload Invoice/i).first()).toBeVisible({ timeout: 15_000 });
  413 | 
  414 |   // STEP 1: SNAPSHOT — confirm Invoice No. field
  415 |   const invoiceNoField = page.getByLabel(/invoice no/i).first();
  416 |   await expect(invoiceNoField).toBeVisible();
  417 | 
  418 |   // STEP 2: TYPE an invoice number
  419 |   await invoiceNoField.fill('INV-TEST-001');
  420 | 
  421 |   // ASSERT (BLOCKING) The invoice number is displayed in the Invoice No. field
  422 |   await expect(invoiceNoField).toHaveValue('INV-TEST-001');
  423 | });
  424 | 
  425 | test('TC-18 — Populate the Invoice Amount field', async ({ page }) => {
  426 |   await page.goto(`${APP_URL}/login`);
  427 |   await page.getByPlaceholder(/username/i).fill('admin');
  428 |   await page.getByPlaceholder(/password/i).fill('123qwe');
  429 |   await page.getByRole('button', { name: /sign in/i }).click();
  430 |   await page.waitForURL(url => !url.toString().includes('/login'), { timeout: 30_000 });
  431 |   await page.getByRole('menuitem', { name: /workflow/i }).or(page.getByText(/^Workflow$/i).first()).click();
  432 |   await page.getByText(/my items/i).first().click();
  433 |   await page.getByRole('button', { name: /create new/i }).click();
  434 |   await page.getByText(/BAS Request for Payment/i).first().click();
  435 |   await expect(page.getByText(/Register and Upload Invoice/i).first()).toBeVisible({ timeout: 15_000 });
  436 | 
```