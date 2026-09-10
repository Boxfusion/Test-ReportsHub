# Instructions

- Following Playwright test failed.
- Explain why, be concise, respect Playwright best practices.
- Provide a snippet of code with the fix, if possible.

# Test info

- Name: projects/EC-DEDEA-Bid-Management/test-plans/tender-process/ecdedea-tender-process.spec.ts >> ECDEDEA-TP — EC DEDEA Bid Management (Tender Process) >> TC-04: Consolidate Supplier Responses
- Location: projects/EC-DEDEA-Bid-Management/test-plans/tender-process/ecdedea-tender-process.spec.ts:503:7

# Error details

```
Error: expect(locator).toBeHidden() failed

Locator:  locator('.ant-modal-content')
Expected: hidden
Received: visible
Timeout:  15000ms

Call log:
  - Expect "toBeHidden" locator('.ant-modal-content') with timeout 15000ms
  - waiting for locator('.ant-modal-content')
    33 × locator resolved to <div class="ant-modal-content">…</div>
       - unexpected value "visible"

```

```yaml
- button "Close":
  - img "close"
- text: Add Supplier Response
- button "edit":
  - img "edit"
- paragraph: Shesha.SupplyChainManagement/tender-add-supplier-response v8
- text: Live
- img "close"
- alert:
  - img "info-circle"
  - text: Please Capture Supplier Response
  - button "close"
- text: Supplier *
- combobox
- text: A & A Stationers
- button "edit":
  - img "edit"
- paragraph: Shesha.SupplyChainManagement/supplier-details v7
- text: Live
- img "close"
- text: Address
- textbox: in your dreams
- text: Email
- textbox: philippa.dufana@stationers.com
- text: Submission method *
- combobox
- text: Email Proposal Price (Incl. VAT) *
- button "Increase Value":
  - img "up"
- button "Decrease Value":
  - img "down"
- spinbutton: "100000"
- text: Capturing Comments
- textbox
- table:
  - row "Name Description Is Mandatory Attach"
  - rowgroup
- button "Close"
- button "Submit"
```

# Test source

```ts
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
  185 |   await expect(targetRow).toBeVisible({ timeout: 30000 });
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
> 245 |   await expect(dialog).toBeHidden({ timeout: 15000 });
      |                        ^ Error: expect(locator).toBeHidden() failed
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
  286 | 
  287 | // The Shesha inline editable-grid "add" reads the row's bound Name from an async search combobox.
  288 | // Under automation the selected value must be committed before plus-circle fires, so: type the term
  289 | // character-by-character (fires the search handler like real typing), CLICK the exact option (a real
  290 | // selection event the grid binds), and verify the commit via the auto-filled Job Title / Email.
  291 | async function addBecEvaluator(page: Page, searchTerm: string, fullName: string) {
  292 |   if (await page.getByRole('cell', { name: fullName }).first().isVisible().catch(() => false)) return;
  293 |   const addRow = page.locator('.sha-new-row');
  294 |   const combo = addRow.locator('input.ant-select-selection-search-input');
  295 |   await expect(async () => {
  296 |     await addRow.locator('.ant-select-selector').click();
  297 |     await combo.fill('');
  298 |     await combo.pressSequentially(searchTerm, { delay: 60 });
  299 |     await expect(openOption(page, fullName)).toBeVisible({ timeout: 8000 });
  300 |     await openOption(page, fullName).click();
  301 |     // Commit signal recorded live: selecting the evaluator auto-fills Job Title + Email in the
  302 |     // add-row (the combobox's own value stays blank, so it can't be used as the signal).
  303 |     await expect(addRow.getByRole('textbox').first()).not.toHaveValue('', { timeout: 5000 });
  304 |   }).toPass({ timeout: 30000 });
  305 |   await iconButton(addRow, 'plus-circle').click();
  306 |   await expect(page.getByRole('cell', { name: fullName })).toBeVisible({ timeout: 15000 });
  307 | }
  308 | 
  309 | // Each attendee row's "Is Present?" checkbox is read-only until the row is in edit mode.
  310 | async function markAttendeePresent(page: Page, fullName: string) {
  311 |   const row = page.getByRole('row').filter({ hasText: fullName });
  312 |   await iconButton(row, 'edit').click();
  313 |   await row.getByRole('checkbox').check();
  314 |   await iconButton(row, 'save').click();
  315 |   // The save is async (the icon flips to .anticon-loading); wait for the editor to clear.
  316 |   await expect(iconButton(row, 'save')).toHaveCount(0, { timeout: 30000 });
  317 | }
  318 | 
  319 | // Score one supplier on TEC-01: Evaluate → edit pencil → Point Awarded → save → Finalise Score.
  320 | async function scoreSupplier(page: Page, supplier: string, score: string) {
  321 |   const row = page.getByRole('row').filter({ hasText: supplier }).filter({ hasText: 'Evaluate' });
  322 |   await row.getByRole('button', { name: 'Evaluate' }).click();
  323 |   const dlg = page.locator('.ant-modal-content');
  324 |   await expect(dlg.getByText('Tender Response Evaluation')).toBeVisible({ timeout: 15000 });
  325 |   const critRow = dlg.getByRole('row').filter({ hasText: 'TEC-01' });
  326 |   await iconButton(critRow, 'edit').click();
  327 |   await dlg.locator('.ant-input-number-input').fill(score);
  328 |   await iconButton(dlg, 'save').click();
  329 |   await expect(critRow).toContainText(score, { timeout: 15000 });
  330 |   await dlg.getByRole('button', { name: 'Finalise Score' }).click();
  331 |   await expect(dlg).toBeHidden({ timeout: 15000 });
  332 |   // The supplier's row now shows the finalised score and swaps Evaluate for a View link.
  333 |   await expect(page.getByRole('row').filter({ hasText: supplier })).toContainText(score, { timeout: 15000 });
  334 | }
  335 | 
  336 | // EC DEDEA REGRESSION GUARD: on the BAC / Approve / Appointment / Order pages the Stage-3
  337 | // "Recommendation Status" of the rank-1 supplier must read "Recommended". The PD build inverts this
  338 | // (rank 1 shows "Not Recommended"); EC DEDEA is correct, so a failure here means the defect has
  339 | // reached this build. Soft so the lifecycle chain still completes if it regresses.
  340 | async function assertWinnerFlaggedRecommended(page: Page) {
  341 |   const winnerRow = page.getByRole('row').filter({ hasText: WINNER }).first();
  342 |   await expect(winnerRow).toBeVisible({ timeout: 20000 });
  343 |   const text = (await winnerRow.innerText().catch(() => '')) || '';
  344 |   if (!/Recommend/i.test(text)) return; // this page doesn't carry the flag column — nothing to guard
  345 |   expect.soft(
```