# Instructions

- Following Playwright test failed.
- Explain why, be concise, respect Playwright best practices.
- Provide a snippet of code with the fix, if possible.

# Test info

- Name: projects/ITS/test-plans/BAS/register-and-upload-invoice.spec.ts >> TC-10 — Select a Supplier Name from the Supplier list
- Location: projects/ITS/test-plans/BAS/register-and-upload-invoice.spec.ts:220:5

# Error details

```
Error: expect(locator).toBeVisible() failed

Locator: getByRole('dialog').or(getByText(/supplier/i).nth(1))
Expected: visible
Error: strict mode violation: getByRole('dialog').or(getByText(/supplier/i).nth(1)) resolved to 2 elements:
    1) <label for="model_supplier" title="Supplier Name" class="ant-form-item-required ant-form-item-required-mark-optional ant-form-item-no-colon">…</label> aka getByText('Supplier Name*')
    2) <div role="dialog" aria-modal="true" aria-labelledby=":r7q:" class="ant-modal css-1lo1l9k entity-picker-modal acss-srfedm ant-zoom-appear ant-zoom-appear-active ant-zoom">…</div> aka getByRole('dialog', { name: 'Select Item' })

Call log:
  - Expect "toBeVisible" getByRole('dialog').or(getByText(/supplier/i).nth(1)) with timeout 10000ms
  - waiting for getByRole('dialog').or(getByText(/supplier/i).nth(1))

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
              - generic [ref=e151]: "Ref No: PAY13618/2026"
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
  176 |   await expect(page.getByText(/Register and Upload Invoice/i).first()).toBeVisible({ timeout: 15_000 });
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
> 235 |   await expect(page.getByRole('dialog').or(page.getByText(/supplier/i).nth(1))).toBeVisible({ timeout: 10_000 });
      |                                                                                 ^ Error: expect(locator).toBeVisible() failed
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
```