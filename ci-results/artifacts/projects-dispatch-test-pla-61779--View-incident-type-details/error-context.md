# Instructions

- Following Playwright test failed.
- Explain why, be concise, respect Playwright best practices.
- Provide a snippet of code with the fix, if possible.

# Test info

- Name: projects/dispatch/test-plans/administrative-functions/incident-types.spec.ts >> ADMIN-2.2 — Incident Types >> TC-06: View incident type details
- Location: projects/dispatch/test-plans/administrative-functions/incident-types.spec.ts:125:7

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
  1   | // AUTO-RECORDED from test-plans/administrative-functions/incident-types.md
  2   | // Source: Azure DevOps test plan #65099, suite #65132 (2.2 Incident Types)
  3   | // The .md plan is canonical. AI-repair will patch failing lines in this file.
  4   | //
  5   | // Login + the Incident Types ("Call Types") grid selectors were recorded live against the Pre-Prod
  6   | // app. The menu item "Incident Types" opens a page headed "Call Types" — an inline-edit grid
  7   | // (search box, Export, per-row edit pencils, an inline add-row with a plus-circle control). Several
  8   | // original ADO steps assume an "Add New Record" dialog, a magnifying-glass details view, and a
  9   | // "Back" button that this UI does not have; those lines carry // TODO[selector]/[assertion] markers
  10  | // for AI-repair (plan-correction) to reconcile on the first /RunTest.
  11  | 
  12  | import { test, expect, Page } from '@playwright/test';
  13  | 
  14  | const APP_URL = 'https://ncdoh-dispatcher-adminportal-qa.shesha.app/login';
  15  | const ADMIN = { user: 'Admin', password: '123qwe' };
  16  | const INCIDENT_TYPES_URL = `${APP_URL.replace('/login', '')}/dynamic/Boxfusion.Ems/incident-types`;
  17  | 
  18  | // Recorded live: Shesha login — fields expose placeholders (Username/Password); button is "Sign In".
  19  | async function login(page: Page) {
  20  |   await page.goto(APP_URL);
  21  |   await page.getByPlaceholder('Username').fill(ADMIN.user);
  22  |   await page.getByPlaceholder('Password').fill(ADMIN.password);
  23  |   await page.getByRole('button', { name: 'Sign In' }).click();
> 24  |   await page.waitForURL((url) => !url.href.includes('/login'), { timeout: 30000 });
      |              ^ TimeoutError: page.waitForURL: Timeout 30000ms exceeded.
  25  |   // AI-repair (2026-06-17): the Shesha app holds background connections open (offline-mode
  26  |   // polling / websockets), so `networkidle` never settles and the wait times out. Drop it —
  27  |   // waitForURL above confirms login succeeded, and downstream steps wait on concrete elements.
  28  | }
  29  | 
  30  | // Recorded live: reach the Incident Types grid directly by URL. The collapsed Shesha sidebar's
  31  | // submenu flyouts (Dispatcher → Management → Incident Types) don't open reliably under automation,
  32  | // so navigate to the form URL (module Boxfusion.Ems) like the run-test specs do elsewhere.
  33  | async function gotoIncidentTypes(page: Page) {
  34  |   await page.goto(INCIDENT_TYPES_URL);
  35  |   // AI-repair (2026-06-17): no `networkidle` wait (never settles on this Shesha app).
  36  |   // The page heading is "Call Types" (the entity is surfaced as Call Types in this grid).
  37  |   await expect(page.getByRole('heading', { name: 'Call Types' })).toBeVisible({ timeout: 30000 });
  38  | }
  39  | 
  40  | // Recorded live: the grid toolbar has a search textbox followed by a "search" button. The textbox has
  41  | // no accessible name; it's the first textbox on the page (the inline add-row textbox renders after it
  42  | // in the DOM). FRAGILE: re-anchor if the toolbar layout changes.
  43  | async function searchGrid(page: Page, term: string) {
  44  |   const box = page.getByRole('textbox').first();
  45  |   await box.fill(term);
  46  |   await page.getByRole('button', { name: 'search' }).click();
  47  |   // AI-repair (2026-06-17): no `networkidle` wait; callers assert on the resulting rows.
  48  |   await page.waitForTimeout(1500);
  49  | }
  50  | 
  51  | test.describe('ADMIN-2.2 — Incident Types', () => {
  52  | 
  53  |   // ADO Test Case (login): auto-prepended — the suite needs an authenticated session.
  54  |   test('TC-01: Log in to NC Dispatch', async ({ page }) => {
  55  |     // STEP: NAVIGATE + sign in as Admin
  56  |     await login(page);
  57  |     // ASSERT (BLOCKING) redirected away from /login
  58  |     await expect(page).not.toHaveURL(/\/login/i);
  59  |   });
  60  | 
  61  |   // ADO Test Case #65701: https://dev.azure.com/boxfusion/pd-dispatcher-V2/_workitems/edit/65701
  62  |   test('TC-02: Search for incident type by name', async ({ page }) => {
  63  |     test.setTimeout(60_000);
  64  |     await login(page);
  65  |     // STEP: open the Incident Types (Call Types) grid
  66  |     await gotoIncidentTypes(page);
  67  |     // ASSERT (BLOCKING) the grid is displayed
  68  |     await expect(page.getByRole('table')).toBeVisible({ timeout: 30000 });
  69  |     // STEP: search by a known Call Type name
  70  |     await searchGrid(page, 'Stomach Cramps');
  71  |     // ASSERT the matching incident type is displayed
  72  |     await expect(page.getByRole('cell', { name: 'Stomach Cramps' }).first()).toBeVisible({ timeout: 15000 });
  73  |   });
  74  | 
  75  |   // ADO Test Case #65702: https://dev.azure.com/boxfusion/pd-dispatcher-V2/_workitems/edit/65702
  76  |   test('TC-03: Search using partial match', async ({ page }) => {
  77  |     test.setTimeout(60_000);
  78  |     await login(page);
  79  |     await gotoIncidentTypes(page);
  80  |     // STEP: search by a partial term
  81  |     await searchGrid(page, 'Burn');
  82  |     // ASSERT at least one partially-matching row is shown
  83  |     await expect(page.getByRole('cell', { name: /Burn/i }).first()).toBeVisible({ timeout: 15000 });
  84  |   });
  85  | 
  86  |   // ADO Test Case #65703: https://dev.azure.com/boxfusion/pd-dispatcher-V2/_workitems/edit/65703
  87  |   test('TC-04: Export incident types', async ({ page }) => {
  88  |     test.setTimeout(60_000);
  89  |     await login(page);
  90  |     await gotoIncidentTypes(page);
  91  |     // STEP: click Export and capture the download
  92  |     const downloadPromise = page.waitForEvent('download', { timeout: 30000 });
  93  |     await page.getByRole('button', { name: /export/i }).click();
  94  |     // ASSERT (BLOCKING) a file download is triggered
  95  |     const download = await downloadPromise;
  96  |     expect(download.suggestedFilename()).toBeTruthy();
  97  |   });
  98  | 
  99  |   // ADO Test Case #65704: https://dev.azure.com/boxfusion/pd-dispatcher-V2/_workitems/edit/65704
  100 |   test('TC-05: Add new incident type', async ({ page }) => {
  101 |     test.setTimeout(90_000);
  102 |     await login(page);
  103 |     await gotoIncidentTypes(page);
  104 |     // STEP: the live page uses an INLINE add-row (plus-circle), not an "Add New Record" dialog.
  105 |     // Reconciled live 2026-06-23: fill the add-row (Triage Level combobox, Call Types textbox,
  106 |     // Resolution SLA spinbutton) then commit with the plus-circle. Unique name keeps re-runs idempotent.
  107 |     const callType = `Broken Leg ${Date.now()}`;
  108 |     const addRow = page.getByRole('row').filter({ has: page.getByRole('button', { name: 'plus-circle' }) });
  109 |     // STEP: pick Triage Level (dropdown options expose a title attr, e.g. P2-Amber)
  110 |     await addRow.getByRole('combobox').click();
  111 |     await page.getByTitle('P2-Amber').click();
  112 |     // STEP: type the Call Type name
  113 |     await addRow.getByRole('textbox').fill(callType);
  114 |     // STEP: set Resolution SLA
  115 |     await addRow.getByRole('spinbutton').fill('45');
  116 |     // STEP: commit the new row
  117 |     await addRow.getByRole('button', { name: 'plus-circle' }).click();
  118 |     // STEP: verify via search
  119 |     await searchGrid(page, callType);
  120 |     // ASSERT (BLOCKING) the new incident type appears in the table
  121 |     await expect(page.getByRole('cell', { name: callType }).first()).toBeVisible({ timeout: 15000 });
  122 |   });
  123 | 
  124 |   // ADO Test Case #65705: https://dev.azure.com/boxfusion/pd-dispatcher-V2/_workitems/edit/65705
```