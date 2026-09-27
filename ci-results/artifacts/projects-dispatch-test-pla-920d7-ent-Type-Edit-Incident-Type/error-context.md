# Instructions

- Following Playwright test failed.
- Explain why, be concise, respect Playwright best practices.
- Provide a snippet of code with the fix, if possible.

# Test info

- Name: projects/dispatch/test-plans/administrative-functions/admin-functions-crud.spec.ts >> Administrative Functions — Create/Edit verification (2026-06-17 session) >> Incident Type >> Edit Incident Type
- Location: projects/dispatch/test-plans/administrative-functions/admin-functions-crud.spec.ts:154:13

# Error details

```
TimeoutError: page.waitForURL: Timeout 30000ms exceeded.
=========================== logs ===========================
waiting for navigation until "load"
============================================================
```

# Page snapshot

```yaml
- generic [ref=e1]:
  - generic [ref=e15]:
    - generic [ref=e25]:
      - strong [ref=e34]: Welcome!
      - generic [ref=e35]: Please enter your personal details in order to access your profile.
    - generic [ref=e48]:
      - img "mail" [ref=e50]
      - textbox "Username" [ref=e53]: Admin
    - generic [ref=e59]:
      - img "lock" [ref=e61]
      - textbox "Password" [ref=e64]: 123qwe
      - img "eye-invisible" [ref=e66] [cursor=pointer]
    - button "Sign In" [active] [ref=e75] [cursor=pointer]
    - generic [ref=e78]:
      - generic [ref=e80]:
        - checkbox [ref=e88] [cursor=pointer]
        - generic [ref=e90]: Remember Me
      - link "Forget_Password" [ref=e101] [cursor=pointer]:
        - /url: /no-auth/shesha/forgot-password?mode=edit
    - generic [ref=e103]:
      - generic [ref=e104]: Don't have an account?
      - link "Register" [ref=e115] [cursor=pointer]:
        - /url: /no-auth/Shesha/otp-verification
  - alert [ref=e116]
```

# Test source

```ts
  1   | // AUTO-RECORDED from test-plans/administrative-functions/admin-functions-crud.md
  2   | // Source: Azure DevOps test plan #65099, suite #65100 (Administrative Functions)
  3   | // The .md plan is canonical. AI-repair will patch failing lines in this file.
  4   | //
  5   | // This suite VERIFIES the create + edit operations performed live on 2026-06-17 (NC Dispatch QA):
  6   | // for each Administrative-Functions entity it opens the entity's grid by direct URL, searches for the
  7   | // `Auto Test …` record we created, and asserts the row is present. The "Edit …" cases additionally
  8   | // assert the edited value where it is visible in the grid (Site Type Levels 1->2; Point of Interest
  9   | // contact -> 0987654321). Most entities are verify-only to avoid duplicate test data.
  10  | //
  11  | // EXCEPTION (Agent): the seed `autotestagent` no longer matches a grid cell, so "Add Agent" now
  12  | // genuinely CREATES a fresh agent through the Add-New dialog (unique username per run) and then
  13  | // searches + asserts it — selectors recorded live 2026-06-25 (RegisterAgent → 200).
  14  | 
  15  | import { test, expect, Page, Locator } from '@playwright/test';
  16  | 
  17  | const BASE = 'https://ncdoh-dispatcher-adminportal-qa.shesha.app';
  18  | const APP_URL = `${BASE}/login`;
  19  | const ADMIN = { user: 'Admin', password: '123qwe' };
  20  | const u = (formPath: string) => `${BASE}/dynamic/${formPath}`;
  21  | 
  22  | // Recorded live: Shesha login — fields expose placeholders (Username/Password); button is "Sign In".
  23  | // AI-repair (2026-06-17): NO `networkidle` wait — this Shesha app holds background connections open
  24  | // (offline-mode polling / websockets), so `networkidle` never settles. waitForURL confirms login.
  25  | async function login(page: Page) {
  26  |   await page.goto(APP_URL);
  27  |   await page.getByPlaceholder('Username').fill(ADMIN.user);
  28  |   await page.getByPlaceholder('Password').fill(ADMIN.password);
  29  |   await page.getByRole('button', { name: 'Sign In' }).click();
> 30  |   await page.waitForURL((url) => !url.href.includes('/login'), { timeout: 30000 });
      |              ^ TimeoutError: page.waitForURL: Timeout 30000ms exceeded.
  31  | }
  32  | 
  33  | // Reach an entity grid directly by URL and wait on the table (collapsed sidebar flyouts don't open
  34  | // under automation). No load-state wait (see login note).
  35  | async function gotoGrid(page: Page, formPath: string) {
  36  |   await page.goto(u(formPath));
  37  |   await expect(page.getByRole('table')).toBeVisible({ timeout: 30000 });
  38  |   // Wait for the toolbar search box to be ready before interacting (the grid loads async with a
  39  |   // "loading…" overlay; acting too early races the bind). The first textbox is the quick-search.
  40  |   await expect(page.getByRole('textbox').first()).toBeVisible({ timeout: 30000 });
  41  | }
  42  | 
  43  | // Shesha grid toolbar: a search textbox (first textbox on the page) + a "search" button.
  44  | async function searchGrid(page: Page, term: string) {
  45  |   const box = page.getByRole('textbox').first();
  46  |   await box.click();
  47  |   await box.fill(term);
  48  |   await page.getByRole('button', { name: 'search' }).click();
  49  |   await page.waitForTimeout(2500);
  50  | }
  51  | 
  52  | async function expectRow(page: Page, cellText: string) {
  53  |   await expect(page.getByRole('cell', { name: cellText }).first()).toBeVisible({ timeout: 25000 });
  54  | }
  55  | 
  56  | // Open an AntD select (click the selector, not the readonly input that intercepts) and pick an option
  57  | // by visible text from the rendered dropdown portal.
  58  | async function pickAntdSelect(page: Page, sel: Locator, optionText: string) {
  59  |   await sel.locator('.ant-select-selector').click();
  60  |   await page
  61  |     .locator('.ant-select-dropdown:not(.ant-select-dropdown-hidden) .ant-select-item-option', { hasText: optionText })
  62  |     .first()
  63  |     .click({ timeout: 10000 });
  64  | }
  65  | 
  66  | // CREATE a brand-new agent via the Add-New dialog on the agent-roles-table grid (must already be on it).
  67  | // Uses a unique username per run so re-runs never collide. Returns the username to search/verify.
  68  | // Field order in the dialog: Name, Surname, Mobile Number, Email Address, Username, Roles*, Regions*,
  69  | // Station(optional), Password*, Verify Password* — recorded live 2026-06-25.
  70  | async function createAgentRecord(page: Page): Promise<string> {
  71  |   const stamp = Date.now().toString().slice(-9);
  72  |   const username = `qatestagent${stamp}`;
  73  |   await page.getByRole('button', { name: /Add New/ }).click();
  74  |   const modal = page.locator('.ant-modal-content');
  75  |   await expect(modal).toBeVisible({ timeout: 15000 });
  76  | 
  77  |   const tb = modal.getByRole('textbox');
  78  |   await tb.nth(0).fill('QA Auto');                 // Name
  79  |   await tb.nth(1).fill(`Agent ${stamp}`);          // Surname
  80  |   await tb.nth(2).fill(`0${stamp}`);               // Mobile Number (unique per run — server enforces uniqueness)
  81  |   await tb.nth(3).fill(`${username}@test.com`);    // Email Address
  82  |   await tb.nth(4).fill(username);                  // Username (overwrites pre-filled admin)
  83  | 
  84  |   // Roles* is a multi-select (stays open after pick) — close it before opening Regions.
  85  |   await pickAntdSelect(page, modal.locator('.ant-select').nth(0), 'Call Taker');
  86  |   await modal.locator('.ant-modal-title').click();
  87  |   await pickAntdSelect(page, modal.locator('.ant-select').nth(1), 'Frances Baard');
  88  | 
  89  |   await modal.getByRole('textbox', { name: 'Password * :', exact: true }).fill('P@ssw0rd123');
  90  |   await modal.getByRole('textbox', { name: 'Verify Password * :' }).fill('P@ssw0rd123');
  91  | 
  92  |   await modal.getByRole('button', { name: 'OK' }).click();
  93  |   await expect(modal).toBeHidden({ timeout: 20000 });
  94  |   return username;
  95  | }
  96  | 
  97  | interface Entity {
  98  |   key: string;        // display name used in the test titles
  99  |   form: string;       // Boxfusion.<module>/<form> grid path
  100 |   term: string;       // quick-search term
  101 |   cell: string;       // grid cell asserted (substring match)
  102 |   hasEdit: boolean;   // whether we performed an Edit on this entity today
  103 |   editCell?: string;  // exact grid value the edit established (asserted in the Edit case)
  104 |   create?: (page: Page) => Promise<string>; // if set, "Add" genuinely creates and returns the term to verify
  105 | }
  106 | 
  107 | const ENTITIES: Entity[] = [
  108 |   { key: 'Incident Type',    form: 'Boxfusion.Ems/incident-types',                       term: 'Broken Arm',                  cell: 'Broken Arm',                  hasEdit: true },
  109 |   { key: 'Vehicle Type',     form: 'Boxfusion.Ems/vehicle-types',                        term: 'Auto Test Ambulance',         cell: 'Auto Test Ambulance',         hasEdit: true },
  110 |   { key: 'Device',           form: 'Boxfusion.Dispatcher/mobile-devices',                term: 'Auto Test Device',            cell: 'Auto Test Device',            hasEdit: true },
  111 |   { key: 'Vehicle',          form: 'Boxfusion.Ems/vehicles',                             term: 'AUTO TEST NC',                cell: 'AUTO TEST NC',                hasEdit: true },
  112 |   // Agent & Resource grids split the person into Name / Surname columns (Name="Auto", Surname="Test
  113 |   // Agent"/"Test Resource"), so "Auto Test …" never matches one cell. Search + assert by the unique
  114 |   // username instead (Username column).
  115 |   { key: 'Agent',            form: 'Boxfusion.Dispatcher/agent-roles-table',             term: 'autotestagent',               cell: 'autotestagent',               hasEdit: true, create: createAgentRecord },
  116 |   { key: 'Resource',         form: 'Boxfusion.Ems/resources',                            term: 'autotestresource',            cell: 'autotestresource',            hasEdit: true },
  117 |   { key: 'Station',          form: 'Boxfusion.Dispatcher/dispatch-base',                 term: 'Auto Test Station',           cell: 'Auto Test Station',           hasEdit: true },
  118 |   { key: 'Crew',             form: 'Boxfusion.Ems/EmsDispatchTeam-Table',                term: 'AutoTestCrew',                cell: 'AutoTestCrew 003',            hasEdit: false },
  119 |   { key: 'Shift',            form: 'boxfusion.shiftmanagement/shift-table',              term: 'Auto Test Shift',             cell: 'Auto Test Shift',             hasEdit: true },
  120 |   // The shift-assignment quick-search does NOT index the vehicle column ('AUTO TEST NC' → 0 hits);
  121 |   // it matches the shift/resource/station columns. Search by the assignment's resource instead.
  122 |   { key: 'Shift Assignment', form: 'Boxfusion.Dispatcher/dispatch-shift-assignment-table', term: 'Auto Test Resource',      cell: 'Auto Test Shift',             hasEdit: true },
  123 |   { key: 'Site Type',        form: 'Boxfusion.Dispatcher/site-types',                    term: 'Auto Test Site Type',         cell: 'Auto Test Site Type',         hasEdit: true, editCell: '2' },
  124 |   { key: 'Point of Interest',form: 'Boxfusion.Ems/emergency-site',                       term: 'Auto Test Point of Interest', cell: 'Auto Test Point of Interest', hasEdit: true, editCell: '0987654321' },
  125 | ];
  126 | 
  127 | test.describe('Administrative Functions — Create/Edit verification (2026-06-17 session)', () => {
  128 | 
  129 |   test('TC-00: Log in to NC Dispatch', async ({ page }) => {
  130 |     await login(page);
```