# Instructions

- Following Playwright test failed.
- Explain why, be concise, respect Playwright best practices.
- Provide a snippet of code with the fix, if possible.

# Test info

- Name: projects/ITS/test-plans/BAS/register-and-upload-invoice.spec.ts >> TC-08 — Select a different Date Received
- Location: projects/ITS/test-plans/BAS/register-and-upload-invoice.spec.ts:166:5

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
  76  |   // STEP 1: SNAPSHOT — confirm the target element for: Click on the Export button
  77  |   await expect(page.getByRole('button', { name: /export/i })).toBeVisible();
  78  | 
  79  |   // STEP 2: CLICK the Export button
  80  |   const [download] = await Promise.all([
  81  |     page.waitForEvent('download', { timeout: 15_000 }).catch(() => null),
  82  |     page.getByRole('button', { name: /export/i }).click(),
  83  |   ]);
  84  | 
  85  |   // ASSERT (BLOCKING) The Excel file is exported and downloaded
  86  |   if (download) {
  87  |     expect(download.suggestedFilename()).toMatch(/\.xlsx$/i);
  88  |   } else {
  89  |     // Some implementations trigger a navigation or show a toast instead of a download
  90  |     await expect(page.getByText(/export/i).first()).toBeVisible();
  91  |   }
  92  | });
  93  | 
  94  | test('TC-05 — Click Create New button', async ({ page }) => {
  95  |   await page.goto(`${APP_URL}/login`);
  96  |   await page.getByPlaceholder(/username/i).fill('admin');
  97  |   await page.getByPlaceholder(/password/i).fill('123qwe');
  98  |   await page.getByRole('button', { name: /sign in/i }).click();
  99  |   await page.waitForURL(url => !url.toString().includes('/login'), { timeout: 30_000 });
  100 |   await page.getByRole('menuitem', { name: /workflow/i }).or(page.getByText(/^Workflow$/i).first()).click();
  101 |   await page.getByText(/my items/i).first().click();
  102 |   await expect(page.getByRole('button', { name: /create new/i })).toBeVisible({ timeout: 10_000 });
  103 | 
  104 |   // STEP 1: SNAPSHOT — confirm the target element for: Click Create New button
  105 |   await expect(page.getByRole('button', { name: /create new/i })).toBeVisible();
  106 | 
  107 |   // STEP 2: CLICK the Create New button
  108 |   await page.getByRole('button', { name: /create new/i }).click();
  109 | 
  110 |   // STEP 3: SNAPSHOT — verify the list of processes is displayed
  111 |   // ASSERT (BLOCKING) The list of processes including BAS and LOGIS Request for payment is displayed
  112 |   await expect(page.getByText(/BAS/i).first()).toBeVisible({ timeout: 10_000 });
  113 | });
  114 | 
  115 | test('TC-06 — Select the BAS Request for Payment Workflow', async ({ page }) => {
  116 |   await page.goto(`${APP_URL}/login`);
  117 |   await page.getByPlaceholder(/username/i).fill('admin');
  118 |   await page.getByPlaceholder(/password/i).fill('123qwe');
  119 |   await page.getByRole('button', { name: /sign in/i }).click();
  120 |   await page.waitForURL(url => !url.toString().includes('/login'), { timeout: 30_000 });
  121 |   await page.getByRole('menuitem', { name: /workflow/i }).or(page.getByText(/^Workflow$/i).first()).click();
  122 |   await page.getByText(/my items/i).first().click();
  123 |   await expect(page.getByRole('button', { name: /create new/i })).toBeVisible({ timeout: 10_000 });
  124 |   await page.getByRole('button', { name: /create new/i }).click();
  125 |   await expect(page.getByText(/BAS/i).first()).toBeVisible({ timeout: 10_000 });
  126 | 
  127 |   // STEP 1: SNAPSHOT — confirm the target element for: Select the BAS Request for Payment Workflow
  128 |   await expect(page.getByText(/BAS Request for Payment/i).first()).toBeVisible();
  129 | 
  130 |   // STEP 2: SELECT the BAS Request for Payment Workflow
  131 |   await page.getByText(/BAS Request for Payment/i).first().click();
  132 | 
  133 |   // STEP 3: SNAPSHOT — verify the Register and Upload Invoice page is displayed
  134 |   // ASSERT (BLOCKING) The Register and Upload Invoice page is displayed
  135 |   await expect(page.getByText(/Register and Upload Invoice/i).first()).toBeVisible({ timeout: 15_000 });
  136 | 
  137 |   // STEP 4: SNAPSHOT — verify the Date Received field is auto-populated
  138 |   // ASSERT (BLOCKING) The Date Received field is auto-populated with today's date
  139 |   await expect(page.getByLabel(/date received/i).or(page.locator('input[name*="dateReceived"], input[name*="date_received"]').first())).toBeVisible({ timeout: 10_000 });
  140 | });
  141 | 
  142 | test('TC-07 — Click on Date Received field', async ({ page }) => {
  143 |   await page.goto(`${APP_URL}/login`);
  144 |   await page.getByPlaceholder(/username/i).fill('admin');
  145 |   await page.getByPlaceholder(/password/i).fill('123qwe');
  146 |   await page.getByRole('button', { name: /sign in/i }).click();
  147 |   await page.waitForURL(url => !url.toString().includes('/login'), { timeout: 30_000 });
  148 |   await page.getByRole('menuitem', { name: /workflow/i }).or(page.getByText(/^Workflow$/i).first()).click();
  149 |   await page.getByText(/my items/i).first().click();
  150 |   await page.getByRole('button', { name: /create new/i }).click();
  151 |   await page.getByText(/BAS Request for Payment/i).first().click();
  152 |   await expect(page.getByText(/Register and Upload Invoice/i).first()).toBeVisible({ timeout: 15_000 });
  153 | 
  154 |   // STEP 1: SNAPSHOT — confirm the target element for: Click on Date Received field
  155 |   const dateReceivedField = page.getByLabel(/date received/i).first();
  156 |   await expect(dateReceivedField).toBeVisible();
  157 | 
  158 |   // STEP 2: CLICK the Date Received field
  159 |   await dateReceivedField.click();
  160 | 
  161 |   // STEP 3: SNAPSHOT — verify the Date Picker is displayed
  162 |   // ASSERT (BLOCKING) The Date Picker is displayed
  163 |   await expect(page.locator('.ant-picker-dropdown, [role="dialog"][class*="date"], .datepicker, [class*="calendar"]').first()).toBeVisible({ timeout: 5_000 });
  164 | });
  165 | 
  166 | test('TC-08 — Select a different Date Received', async ({ page }) => {
  167 |   await page.goto(`${APP_URL}/login`);
  168 |   await page.getByPlaceholder(/username/i).fill('admin');
  169 |   await page.getByPlaceholder(/password/i).fill('123qwe');
  170 |   await page.getByRole('button', { name: /sign in/i }).click();
  171 |   await page.waitForURL(url => !url.toString().includes('/login'), { timeout: 30_000 });
  172 |   await page.getByRole('menuitem', { name: /workflow/i }).or(page.getByText(/^Workflow$/i).first()).click();
  173 |   await page.getByText(/my items/i).first().click();
  174 |   await page.getByRole('button', { name: /create new/i }).click();
  175 |   await page.getByText(/BAS Request for Payment/i).first().click();
> 176 |   await expect(page.getByText(/Register and Upload Invoice/i).first()).toBeVisible({ timeout: 15_000 });
      |                                                                        ^ Error: expect(locator).toBeVisible() failed
  177 | 
  178 |   const dateReceivedField = page.getByLabel(/date received/i).first();
  179 |   await dateReceivedField.click();
  180 |   await expect(page.locator('.ant-picker-dropdown, [class*="calendar"]').first()).toBeVisible({ timeout: 5_000 });
  181 | 
  182 |   // STEP 2: SELECT a past date (click a past date cell in the picker)
  183 |   // TODO[selector]: Click a past date cell in the date picker calendar
  184 |   await page.locator('.ant-picker-cell:not(.ant-picker-cell-disabled):not(.ant-picker-cell-selected)').first().click().catch(async () => {
  185 |     await page.keyboard.press('Escape');
  186 |     await dateReceivedField.fill('2026-06-01');
  187 |   });
  188 | 
  189 |   // ASSERT (BLOCKING) Only current or past dates are selectable
  190 |   const disabledFuture = page.locator('.ant-picker-cell-disabled').first();
  191 |   await expect(disabledFuture.or(page.getByText(/date received/i).first())).toBeVisible();
  192 | });
  193 | 
  194 | test('TC-09 — Click on the ellipses on the Supplier Name field', async ({ page }) => {
  195 |   await page.goto(`${APP_URL}/login`);
  196 |   await page.getByPlaceholder(/username/i).fill('admin');
  197 |   await page.getByPlaceholder(/password/i).fill('123qwe');
  198 |   await page.getByRole('button', { name: /sign in/i }).click();
  199 |   await page.waitForURL(url => !url.toString().includes('/login'), { timeout: 30_000 });
  200 |   await page.getByRole('menuitem', { name: /workflow/i }).or(page.getByText(/^Workflow$/i).first()).click();
  201 |   await page.getByText(/my items/i).first().click();
  202 |   await page.getByRole('button', { name: /create new/i }).click();
  203 |   await page.getByText(/BAS Request for Payment/i).first().click();
  204 |   await expect(page.getByText(/Register and Upload Invoice/i).first()).toBeVisible({ timeout: 15_000 });
  205 | 
  206 |   // STEP 1: SNAPSHOT — confirm the target element for: Click on the ellipses on the Supplier Name field
  207 |   // TODO[selector]: Locate the ellipses/lookup button next to the Supplier Name field
  208 |   const supplierEllipsis = page.locator('button[class*="ellipsis"], button[title*="supplier"], [aria-label*="supplier"]').first()
  209 |     .or(page.getByLabel(/supplier name/i).locator('..').getByRole('button').first());
  210 |   await expect(supplierEllipsis).toBeVisible();
  211 | 
  212 |   // STEP 2: CLICK the ellipses button on the Supplier Name field
  213 |   await supplierEllipsis.click();
  214 | 
  215 |   // STEP 3: SNAPSHOT — verify the supplier list is displayed
  216 |   // ASSERT (BLOCKING) A list of confirmed suppliers is displayed
  217 |   await expect(page.getByRole('dialog').or(page.getByText(/supplier/i).nth(1))).toBeVisible({ timeout: 10_000 });
  218 | });
  219 | 
  220 | test('TC-10 — Select a Supplier Name from the Supplier list', async ({ page }) => {
  221 |   await page.goto(`${APP_URL}/login`);
  222 |   await page.getByPlaceholder(/username/i).fill('admin');
  223 |   await page.getByPlaceholder(/password/i).fill('123qwe');
  224 |   await page.getByRole('button', { name: /sign in/i }).click();
  225 |   await page.waitForURL(url => !url.toString().includes('/login'), { timeout: 30_000 });
  226 |   await page.getByRole('menuitem', { name: /workflow/i }).or(page.getByText(/^Workflow$/i).first()).click();
  227 |   await page.getByText(/my items/i).first().click();
  228 |   await page.getByRole('button', { name: /create new/i }).click();
  229 |   await page.getByText(/BAS Request for Payment/i).first().click();
  230 |   await expect(page.getByText(/Register and Upload Invoice/i).first()).toBeVisible({ timeout: 15_000 });
  231 | 
  232 |   const supplierEllipsis = page.locator('button[class*="ellipsis"], button[title*="supplier"], [aria-label*="supplier"]').first()
  233 |     .or(page.getByLabel(/supplier name/i).locator('..').getByRole('button').first());
  234 |   await supplierEllipsis.click();
  235 |   await expect(page.getByRole('dialog').or(page.getByText(/supplier/i).nth(1))).toBeVisible({ timeout: 10_000 });
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
```