# Instructions

- Following Playwright test failed.
- Explain why, be concise, respect Playwright best practices.
- Provide a snippet of code with the fix, if possible.

# Test info

- Name: projects/EC-DEDEA-Bid-Management/test-plans/tender-process/ecdedea-tender-process.spec.ts >> ECDEDEA-TP — EC DEDEA Bid Management (Tender Process) >> TC-14: Approve Recommendation from BAC
- Location: projects/EC-DEDEA-Bid-Management/test-plans/tender-process/ecdedea-tender-process.spec.ts:721:7

# Error details

```
Error: expect(locator).toBeVisible() failed

Locator: getByRole('row').filter({ hasText: 'ECDEDEA Automated Tender' }).filter({ hasText: 'Approve Recommendation from BAC' }).first()
Expected: visible
Timeout: 30000ms
Error: element(s) not found

Call log:
  - Expect "toBeVisible" getByRole('row').filter({ hasText: 'ECDEDEA Automated Tender' }).filter({ hasText: 'Approve Recommendation from BAC' }).first() with timeout 30000ms
  - waiting for getByRole('row').filter({ hasText: 'ECDEDEA Automated Tender' }).filter({ hasText: 'Approve Recommendation from BAC' }).first()

```

```yaml
- complementary:
  - menu:
    - menuitem "appstore EPM":
      - img "appstore"
      - text: EPM
    - menuitem "apartment Workflows":
      - img "apartment"
      - text: Workflows
    - menuitem "snippets Leave Gratuity":
      - img "snippets"
      - text: Leave Gratuity
    - menuitem "database Sundry Payments":
      - img "database"
      - text: Sundry Payments
    - menuitem "pic-center Bid Management":
      - img "pic-center"
      - text: Bid Management
    - menuitem "menu-unfold SupplyChain Management":
      - img "menu-unfold"
      - text: SupplyChain Management
    - menuitem "area-chart Reports and Dashboards":
      - img "area-chart"
      - text: Reports and Dashboards
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
  - paragraph: Shesha.Enterprise/header v3
  - text: Live
  - img "close"
  - link:
    - /url: /
    - img
  - text: Live Mode
  - switch "Switch to Edit mode"
  - img "block"
  - text: Latest Thulile Matekenya
  - img "down"
  - img "user"
- main:
  - button "edit":
    - img "edit"
  - paragraph: Shesha.Workflow/workflows-inbox v7
  - text: Live
  - img "close"
  - heading "Incoming Items" [level=4]
  - textbox
  - button "search":
    - img "search"
  - button "filter":
    - img "filter"
  - button "sliders":
    - img "sliders"
  - list:
    - listitem: 1-10 of 10 items
    - listitem "Previous Page":
      - button "left" [disabled]:
        - img "left"
    - listitem "1"
    - listitem "Next Page":
      - button "right" [disabled]:
        - img "right"
    - listitem:
      - combobox "Page Size"
      - text: 10 / page
  - button "reload":
    - img "reload"
  - button "download Export":
    - img "download"
    - text: Export
  - table:
    - row "Ref No Initiator Type Name Action Required Received Date Target Date Status":
      - columnheader
      - columnheader "Ref No":
        - text: Ref No
        - separator
      - columnheader "Initiator":
        - text: Initiator
        - separator
      - columnheader "Type":
        - text: Type
        - separator
      - columnheader "Name":
        - text: Name
        - separator
      - columnheader "Action Required":
        - text: Action Required
        - separator
      - columnheader "Received Date":
        - text: Received Date
        - separator
      - columnheader "Target Date":
        - text: Target Date
        - separator
      - columnheader "Status":
        - text: Status
        - separator
    - rowgroup:
      - row "search SP:2026/02501 Mhloti Mabuza Sundry Payments Interdepartmental Claims Review and Verify Payment 01/09/2026 In Progress":
        - cell "search":
          - link "search":
            - /url: /shesha/workflow-action?id=1ed3781c-1025-442b-9f01-d57a997c8480&todoid=ea766288-7d7d-43a9-9f78-c0919be9be9c
            - img "search"
        - cell "SP:2026/02501"
        - cell "Mhloti Mabuza"
        - cell "Sundry Payments"
        - cell "Interdepartmental Claims"
        - cell "Review and Verify Payment"
        - cell "01/09/2026"
        - cell
        - cell "In Progress"
      - row "search SP:2026/02287 System Administrator Sundry Payments Reversals Review and Verify Payment 01/09/2026 In Progress":
        - cell "search":
          - link "search":
            - /url: /shesha/workflow-action?id=254fc868-5a68-4846-b110-2a68ccdebca0&todoid=5042eaa0-e592-426a-bfd8-0a6381adfda6
            - img "search"
        - cell "SP:2026/02287"
        - cell "System Administrator"
        - cell "Sundry Payments"
        - cell "Reversals"
        - cell "Review and Verify Payment"
        - cell "01/09/2026"
        - cell
        - cell "In Progress"
      - row "search SP:2026/02184 Thabiso Maake Sundry Payments Reversals Review and Verify Payment 01/09/2026 In Progress":
        - cell "search":
          - link "search":
            - /url: /shesha/workflow-action?id=de5f9baf-4a7f-4432-a73b-45a585d495d8&todoid=f26a41b4-d3d0-4a04-90a4-21cf381803d2
            - img "search"
        - cell "SP:2026/02184"
        - cell "Thabiso Maake"
        - cell "Sundry Payments"
        - cell "Reversals"
        - cell "Review and Verify Payment"
        - cell "01/09/2026"
        - cell
        - cell "In Progress"
      - row "search SP:2026/02180 Thabiso Maake Sundry Payments Committee Claims Review and Verify Payment 01/09/2026 In Progress":
        - cell "search":
          - link "search":
            - /url: /shesha/workflow-action?id=48ae6ef6-03f7-4f3a-9557-53a3b71965ac&todoid=6fd8ec1d-9c71-40bb-b151-f2f248f675e6
            - img "search"
        - cell "SP:2026/02180"
        - cell "Thabiso Maake"
        - cell "Sundry Payments"
        - cell "Committee Claims"
        - cell "Review and Verify Payment"
        - cell "01/09/2026"
        - cell
        - cell "In Progress"
      - row "search SP:2026/02153 Thabiso Maake Sundry Payments Interdepartmental Claims Review and Verify Payment 01/09/2026 In Progress":
        - cell "search":
          - link "search":
            - /url: /shesha/workflow-action?id=1e0051af-ea0c-4884-83d6-67623fbc1971&todoid=99391a53-2fbb-4cab-b7d1-8a10d166c4b7
            - img "search"
        - cell "SP:2026/02153"
        - cell "Thabiso Maake"
        - cell "Sundry Payments"
        - cell "Interdepartmental Claims"
        - cell "Review and Verify Payment"
        - cell "01/09/2026"
        - cell
        - cell "In Progress"
      - row "search REF2026-1829 Bonolo Botha Tender Process Tender REF2026-1829 - Supply and Installation of Electrical Infrastructure Approve Recommendation from BAC 10/07/2026 Adjudicate In Progress":
        - cell "search":
          - link "search":
            - /url: /shesha/workflow-action?id=20e00183-05bf-4454-a8cc-a51e69f0763d&todoid=a75c7fd0-8449-4d6b-97ce-58af06399c0d
            - img "search"
        - cell "REF2026-1829"
        - cell "Bonolo Botha"
        - cell "Tender Process"
        - cell "Tender REF2026-1829 - Supply and Installation of Electrical Infrastructure"
        - cell "Approve Recommendation from BAC"
        - cell "10/07/2026"
        - cell
        - cell "Adjudicate In Progress"
      - row "search REF2026-1668 Maanda-awe Mamathuntsha Tender Process Tender REF2026-1668 - testing Calibration after sending back for re-evaluation Approve Recommendation from BAC 09/07/2026 Adjudicate In Progress":
        - cell "search":
          - link "search":
            - /url: /shesha/workflow-action?id=ad9ee5c8-6af3-4dca-8fe2-c2538be19911&todoid=e280f56f-1824-46bd-b4d7-fef72e15edab
            - img "search"
        - cell "REF2026-1668"
        - cell "Maanda-awe Mamathuntsha"
        - cell "Tender Process"
        - cell "Tender REF2026-1668 - testing Calibration after sending back for re-evaluation"
        - cell "Approve Recommendation from BAC"
        - cell "09/07/2026"
        - cell
        - cell "Adjudicate In Progress"
      - row "search REF2026-1677 Maanda-awe Mamathuntsha Tender Process Tender REF2026-1677 - testing send back for re-evaluation (third step) Approve Recommendation from BAC 09/07/2026 Adjudicate In Progress":
        - cell "search":
          - link "search":
            - /url: /shesha/workflow-action?id=f1cbb61d-ddc7-45bb-ae4f-1ce11f3644be&todoid=0f6eb8c3-4a6f-4a2c-bca7-a8687729445b
            - img "search"
        - cell "REF2026-1677"
        - cell "Maanda-awe Mamathuntsha"
        - cell "Tender Process"
        - cell "Tender REF2026-1677 - testing send back for re-evaluation (third step)"
        - cell "Approve Recommendation from BAC"
        - cell "09/07/2026"
        - cell
        - cell "Adjudicate In Progress"
      - row "search REF2026-0829 Maanda-awe Mamathuntsha Tender Process Tender REF2026-0829 - Reproducing Approve Recommendation from BAC 01/07/2026 Adjudicate In Progress":
        - cell "search":
          - link "search":
            - /url: /shesha/workflow-action?id=5c96cc79-838a-49f9-a827-7c0f0672adc9&todoid=6a11ab87-3dbd-4a2f-a88f-2a40a4985e2d
            - img "search"
        - cell "REF2026-0829"
        - cell "Maanda-awe Mamathuntsha"
        - cell "Tender Process"
        - cell "Tender REF2026-0829 - Reproducing"
        - cell "Approve Recommendation from BAC"
        - cell "01/07/2026"
        - cell
        - cell "Adjudicate In Progress"
      - row "search REF2026-0878 Maanda-awe Mamathuntsha Tender Process Tender REF2026-0878 - TENDER TEST 1 Approve Recommendation from BAC 29/06/2026 Adjudicate In Progress":
        - cell "search":
          - link "search":
            - /url: /shesha/workflow-action?id=1d23a7a9-c625-4a7b-9cea-f43e3bf3ed28&todoid=6f72577e-b46e-4c5c-9d8c-8f1feedd0c3d
            - img "search"
        - cell "REF2026-0878"
        - cell "Maanda-awe Mamathuntsha"
        - cell "Tender Process"
        - cell "Tender REF2026-0878 - TENDER TEST 1"
        - cell "Approve Recommendation from BAC"
        - cell "29/06/2026"
        - cell
        - cell "Adjudicate In Progress"
- alert
```

# Test source

```ts
  85  | 
  86  | // ───────────────────────── helpers (recorded live) ─────────────────────────
  87  | 
  88  | // The header view-mode selector toggles Live / Ready / Latest. Config-editing users must be on
  89  | // "Latest" or the workflow forms render stale fields. Plain evaluators sometimes have no toggle,
  90  | // so this is best-effort: it no-ops when the control is absent.
  91  | async function switchToLatest(page: Page) {
  92  |   const selector = page.getByTitle('Click to change view mode');
  93  |   if (!(await selector.isVisible({ timeout: 20000 }).catch(() => false))) return;
  94  |   if ((await selector.innerText().catch(() => '')).includes('Latest')) return;
  95  |   await expect(async () => {
  96  |     await selector.click();
  97  |     await page.getByRole('menuitem', { name: /^Latest/ }).click({ timeout: 5000 });
  98  |     await expect(selector).toContainText('Latest', { timeout: 5000 });
  99  |   }).toPass({ timeout: 30000 });
  100 |   await page.waitForLoadState('networkidle');
  101 | }
  102 | 
  103 | // "(press to upload)" opens a native file chooser; driving the chooser is more reliable than
  104 | // setInputFiles on the hidden AntD input, which intermittently fails to register.
  105 | async function uploadFile(page: Page, trigger: Locator, file: string) {
  106 |   const chooserPromise = page.waitForEvent('filechooser');
  107 |   await trigger.click();
  108 |   (await chooserPromise).setFiles(file);
  109 | }
  110 | 
  111 | // AntD DatePicker with showTime: .fill() does not commit to React state (a later re-render wipes
  112 | // it), so drive the panel — month → day cell → hour → OK.
  113 | async function pickAntDateTime(page: Page, field: Locator, dateTitle: string, hour: string) {
  114 |   await field.click();
  115 |   const dropdown = page.locator('.ant-picker-dropdown:not(.ant-picker-dropdown-hidden)').last();
  116 |   const cell = dropdown.locator(`td[title="${dateTitle}"]`);
  117 |   for (let i = 0; i < 24 && !(await cell.isVisible().catch(() => false)); i++) {
  118 |     await dropdown.locator('.ant-picker-header-next-btn').first().click();
  119 |   }
  120 |   await cell.click();
  121 |   await dropdown.locator('.ant-picker-time-panel-column').first()
  122 |     .locator('.ant-picker-time-panel-cell-inner')
  123 |     .filter({ hasText: new RegExp(`^${hour}$`) }).first().click();
  124 |   await page.locator('.ant-picker-dropdown:not(.ant-picker-dropdown-hidden) .ant-picker-ok button').click();
  125 | }
  126 | 
  127 | // AntD form: each field is its own .ant-form-item holding a single input. Recorded live: matching
  128 | // on form-item TEXT is ambiguous on this build ("Minimum score required" appears on two items and
  129 | // "Email" is a substring of "Email Address"), so match the <label> instead — but anchored rather
  130 | // than exact, because required labels render as "<Label>\n*" and some carry a trailing colon
  131 | // (TC-16's field is literally "Purchase Order No:", which an exact match misses).
  132 | function formItem(page: Page, label: string) {
  133 |   const escaped = label.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  134 |   return page.locator('.ant-form-item')
  135 |     .filter({ has: page.locator('label').filter({ hasText: new RegExp(`^${escaped}\\s*:?\\s*\\*?\\s*$`) }) })
  136 |     .last();
  137 | }
  138 | 
  139 | // Recorded live: only the visible dropdown may be matched — AntD keeps previous dropdowns mounted
  140 | // with .ant-select-dropdown-hidden, and an unscoped .ant-select-item-option can hit a stale one.
  141 | function openOption(page: Page, text: string) {
  142 |   return page.locator('.ant-select-dropdown:not(.ant-select-dropdown-hidden) .ant-select-item-option')
  143 |     .filter({ hasText: text }).first();
  144 | }
  145 | 
  146 | // Recorded live: grid icon buttons carry no accessible name on this build — target the icon class.
  147 | function iconButton(scope: Locator, icon: 'edit' | 'save' | 'plus-circle') {
  148 |   return scope.locator(`button:has(.anticon-${icon})`);
  149 | }
  150 | 
  151 | // Shesha toolbar buttons (Evaluate, row edit/save pencils, Finalise Score, Sign In) do NOT respond
  152 | // to Playwright's positional click — fire the handler with a DOM click.
  153 | async function domClick(locator: Locator) {
  154 |   await expect(locator.first()).toBeVisible({ timeout: 15000 });
  155 |   await locator.first().evaluate((el: HTMLElement) => el.click());
  156 | }
  157 | 
  158 | async function loginAs(page: Page, creds: { user: string; password: string }) {
  159 |   await page.goto(APP_URL).catch(() => {});
  160 |   await page.evaluate(() => { try { localStorage.clear(); sessionStorage.clear(); } catch (e) {} });
  161 |   await page.goto(APP_URL);
  162 |   // The login form remembers the previous user — clear before typing.
  163 |   await page.getByPlaceholder('Username').fill('');
  164 |   await page.getByPlaceholder('Username').fill(creds.user);
  165 |   await page.getByPlaceholder('Password').fill(creds.password);
  166 |   await domClick(page.getByRole('button', { name: 'Sign In' }));
  167 |   await page.waitForURL(url => !url.href.includes('/login'), { timeout: 30000 });
  168 |   await page.waitForLoadState('networkidle');
  169 |   await switchToLatest(page);
  170 | }
  171 | 
  172 | async function openInbox(page: Page) {
  173 |   await page.goto(INBOX_URL);
  174 |   await page.waitForLoadState('networkidle');
  175 | }
  176 | 
  177 | // Open the target tender's workflow action from the Inbox. Matching on the Ref No pins the row to
  178 | // THIS run's tender; the action text pins it to the expected stage. Navigating to the row's href
  179 | // (rather than clicking) avoids the Workflows flyout intercepting the click.
  180 | async function openInboxItem(page: Page, actionText: string | RegExp) {
  181 |   const targetRow = page.getByRole('row')
  182 |     .filter({ hasText: tenderMatch() })
  183 |     .filter({ hasText: actionText })
  184 |     .first();
> 185 |   await expect(targetRow).toBeVisible({ timeout: 30000 });
      |                           ^ Error: expect(locator).toBeVisible() failed
  186 |   const rowHref = await targetRow.getByRole('link').first().getAttribute('href');
  187 |   await page.goto(rowHref!.startsWith('http') ? rowHref! : `${BASE}${rowHref}`);
  188 |   await page.waitForURL(/workflow-action/, { timeout: 30000 });
  189 | }
  190 | 
  191 | // The QA app's dynamic pages load slowly and variably.
  192 | async function expectOnPage(page: Page, pageName: string) {
  193 |   await expect(page.getByText(pageName, { exact: false }).first()).toBeVisible({ timeout: 30000 });
  194 | }
  195 | 
  196 | // Tick the checkbox inside the innermost block that carries the given confirmation text. The app's
  197 | // confirmation checkboxes have no accessible name (and the copy contains typos), so match a safe
  198 | // substring of the surrounding text.
  199 | async function checkConfirmation(page: Page, text: string | RegExp) {
  200 |   await page.locator('div')
  201 |     .filter({ hasText: text })
  202 |     .filter({ has: page.getByRole('checkbox') })
  203 |     .last()
  204 |     .getByRole('checkbox')
  205 |     .check();
  206 | }
  207 | 
  208 | // Click a workflow action ONCE, then wait for the page to advance — never re-click. Re-clicking on
  209 | // this slow app fires the server-side action repeatedly (on PD that created duplicate evaluation
  210 | // rows). A real user clicks once; if the click is genuinely swallowed this fails loudly instead of
  211 | // silently corrupting data.
  212 | async function clickOnceAndAwait(action: Locator, hasAdvanced: () => Promise<boolean>, label: string) {
  213 |   await action.click();
  214 |   await expect(async () => {
  215 |     if (await hasAdvanced()) return;
  216 |     throw new Error(`still on ${label} after a single click`);
  217 |   }).toPass({ timeout: 90000 });
  218 | }
  219 | 
  220 | // Capture one manual supplier response. The document table REORDERS after each upload, so
  221 | // attachments are targeted by their exact Document-Name cell, never by row position.
  222 | async function addSupplierResponse(page: Page, resp: { name: string; method: string; price: string }) {
  223 |   // Idempotent: skip a supplier already captured so a retry can't create a duplicate response.
  224 |   if (await page.getByRole('cell', { name: resp.name, exact: true }).first().isVisible().catch(() => false)) return;
  225 |   await page.getByRole('button', { name: /Add New Response/ }).click();
  226 |   const dialog = page.locator('.ant-modal-content');
  227 |   await expect(dialog.getByText('Add Supplier Response')).toBeVisible({ timeout: 15000 });
  228 | 
  229 |   await dialog.locator('.ant-select-selector').nth(0).click();
  230 |   await openOption(page, resp.name).click();
  231 |   await dialog.locator('.ant-select-selector').nth(1).click();
  232 |   await openOption(page, resp.method).click();
  233 | 
  234 |   await dialog.locator('.ant-input-number-input').fill(resp.price);
  235 | 
  236 |   for (const doc of MANDATORY_RESPONSE_DOCS) {
  237 |     const row = dialog.getByRole('row').filter({ has: page.getByRole('cell', { name: doc, exact: true }) });
  238 |     await uploadFile(page, row.getByRole('button', { name: /press to upload/i }), PDF_FIXTURE);
  239 |     await expect(row.getByText('pdf-test.pdf')).toBeVisible({ timeout: 15000 });
  240 |   }
  241 | 
  242 |   const dlgSubmit = dialog.getByRole('button', { name: 'Submit', exact: true });
  243 |   await expect(dlgSubmit).toBeEnabled({ timeout: 15000 });
  244 |   await dlgSubmit.click();
  245 |   await expect(dialog).toBeHidden({ timeout: 15000 });
  246 | }
  247 | 
  248 | // EC DEDEA's "Supplier compliance" dialog. Happy path = everything compliant. NOTE the build
  249 | // delta: Finalise Compliance stays disabled until EVERY document row's "Is Compliant?" checkbox is
  250 | // ticked (including non-mandatory rows with no upload), on top of the checklist N/A answers,
  251 | // Compliance status = Compliant and the dialog confirmation.
  252 | // Recorded live 2026-07-27: the dialog holds 5 checklist items (Yes/No/N/A), one "Is Compliant?"
  253 | // checkbox per document row (4 rows: RFQ Document, TAX Clearance Cert, Test DOC, Cert), the
  254 | // Compliant / Non Compliant status radios, and a final confirmation checkbox — 5 checkboxes total.
  255 | // ORDER AND PACING MATTER: each control must be a separate real user action. Ticking them in a
  256 | // batch leaves the DOM checked but the form model stale, and Finalise then fails with "A comment is
  257 | // required when the document is not marked as compliant" and wedges the dialog.
  258 | async function finaliseOpenComplianceDialog(page: Page) {
  259 |   const dlg = page.locator('.ant-modal-content');
  260 |   await expect(dlg.getByText('Supplier compliance')).toBeVisible({ timeout: 15000 });
  261 | 
  262 |   // Checklist loads asynchronously — wait for the radios or the N/A loop races to zero.
  263 |   const nas = dlg.getByRole('radio', { name: 'N/A' });
  264 |   await expect(nas.first()).toBeVisible({ timeout: 15000 });
  265 |   const naCount = await nas.count();
  266 |   for (let j = 0; j < naCount; j++) await nas.nth(j).check();
  267 | 
  268 |   // EC DEDEA delta: EVERY document row's "Is Compliant?" box must be ticked — including the
  269 |   // non-mandatory Test DOC / Cert rows that carry no upload — or Finalise stays disabled.
  270 |   // They are all the dialog's checkboxes except the last (the confirmation).
  271 |   const boxes = dlg.getByRole('checkbox');
  272 |   await expect(boxes.first()).toBeVisible({ timeout: 15000 });
  273 |   const boxCount = await boxes.count();
  274 |   for (let j = 0; j < boxCount - 1; j++) await boxes.nth(j).check();
  275 | 
  276 |   await dlg.getByRole('radio', { name: 'Compliant', exact: true }).check();
  277 |   await boxes.nth(boxCount - 1).check();
  278 | 
  279 |   const finalise = dlg.getByRole('button', { name: 'Finalise Compliance' });
  280 |   await expect(finalise).toBeEnabled({ timeout: 15000 });
  281 |   await finalise.click();
  282 |   // The modal takes a beat to unmount and its wrap intercepts pointer events while it does, so the
  283 |   // next row's edit link is unclickable until this resolves.
  284 |   await expect(dlg).toBeHidden({ timeout: 30000 });
  285 | }
```