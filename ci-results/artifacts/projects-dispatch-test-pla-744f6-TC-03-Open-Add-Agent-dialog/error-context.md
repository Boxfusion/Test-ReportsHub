# Instructions

- Following Playwright test failed.
- Explain why, be concise, respect Playwright best practices.
- Provide a snippet of code with the fix, if possible.

# Test info

- Name: projects/dispatch/test-plans/administrative-functions/agents.spec.ts >> ADMIN-2.14 — Agents >> TC-03: Open Add Agent dialog
- Location: projects/dispatch/test-plans/administrative-functions/agents.spec.ts:82:7

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
  1   | // AUTO-RECORDED from test-plans/administrative-functions/agents.md
  2   | // Source: Azure DevOps test plan #65099, suite #65140 (2.14 Agents)
  3   | // The .md plan is canonical. AI-repair will patch failing lines in this file.
  4   | //
  5   | // Selectors recorded live against NC Dispatch QA on 2026-06-25. Agents ("All Agents") is a form-dialog
  6   | // grid: Add New opens "Add New Agent"; rows expose magnifying-glass + edit-pencil links (both route to
  7   | // /agent-roles-detailsV2?id=…; edit adds &mode=edit). Details/edit view actions are .sha-toolbar-btn
  8   | // (Back/Edit/Save/Cancel Form Edit) inside #modalContainerId.
  9   | 
  10  | import { test, expect, Page, Locator } from '@playwright/test';
  11  | 
  12  | const BASE = 'https://ncdoh-dispatcher-adminportal-qa.shesha.app';
  13  | const APP_URL = `${BASE}/login`;
  14  | const GRID = `${BASE}/dynamic/Boxfusion.Dispatcher/agent-roles-table`;
  15  | const ADMIN = { user: 'Admin', password: '123qwe' };
  16  | const DETAILS = 'a[href*="agent-roles-detailsV2"]:not([href*="mode=edit"])';
  17  | const ROW_EDIT = 'a[href*="agent-roles-detailsV2"][href*="mode=edit"]';
  18  | 
  19  | async function login(page: Page) {
  20  |   await page.goto(APP_URL);
  21  |   // The login page occasionally renders blank on first paint — reload once if the form isn't there.
  22  |   const user = page.getByPlaceholder('Username');
  23  |   try {
  24  |     await expect(user).toBeVisible({ timeout: 15000 });
  25  |   } catch {
  26  |     await page.reload();
  27  |     await expect(user).toBeVisible({ timeout: 20000 });
  28  |   }
  29  |   await user.fill(ADMIN.user);
  30  |   await page.getByPlaceholder('Password').fill(ADMIN.password);
  31  |   await page.getByRole('button', { name: 'Sign In' }).click();
> 32  |   await page.waitForURL((url) => !url.href.includes('/login'), { timeout: 30000 });
      |              ^ TimeoutError: page.waitForURL: Timeout 30000ms exceeded.
  33  | }
  34  | 
  35  | async function gotoGrid(page: Page) {
  36  |   await page.goto(GRID);
  37  |   await expect(page.getByRole('table')).toBeVisible({ timeout: 30000 });
  38  |   await expect(page.getByRole('textbox').first()).toBeVisible({ timeout: 30000 });
  39  |   // The Agents grid loads its rows asynchronously and slowly (~5-8s) — wait for the row detail
  40  |   // links so subsequent magnifying-glass / edit-pencil clicks don't race the load.
  41  |   await expect(page.locator('a[href*="agent-roles-detailsV2"]').first()).toBeVisible({ timeout: 30000 });
  42  | }
  43  | 
  44  | async function searchGrid(page: Page, term: string) {
  45  |   const box = page.getByRole('textbox').first();
  46  |   await box.click();
  47  |   await box.fill(term);
  48  |   await page.getByRole('button', { name: 'search' }).click();
  49  |   await page.waitForTimeout(2500);
  50  | }
  51  | 
  52  | function detailView(page: Page): Locator {
  53  |   return page.locator('#modalContainerId');
  54  | }
  55  | function toolBtn(page: Page, label: RegExp): Locator {
  56  |   return page.locator('#modalContainerId .sha-toolbar-btn').filter({ hasText: label });
  57  | }
  58  | // Surname — a free-text field on the agent edit form with no uniqueness/format constraint (unlike
  59  | // Username / Email / Mobile) — safe to tweak for save/cancel cases.
  60  | function surnameField(page: Page): Locator {
  61  |   return detailView(page).locator('.ant-form-item').filter({ hasText: 'Surname' }).getByRole('textbox');
  62  | }
  63  | 
  64  | test.describe('ADMIN-2.14 — Agents', () => {
  65  | 
  66  |   test('TC-01: Log in to NC Dispatch', async ({ page }) => {
  67  |     await login(page);
  68  |     await expect(page).not.toHaveURL(/\/login/i);
  69  |   });
  70  | 
  71  |   // ADO Test Case #65898: https://dev.azure.com/boxfusion/pd-dispatcher-V2/_workitems/edit/65898
  72  |   test('TC-02: Search for an agent', async ({ page }) => {
  73  |     test.setTimeout(60_000);
  74  |     await login(page);
  75  |     await gotoGrid(page);
  76  |     await expect(page.getByRole('table')).toBeVisible();
  77  |     await searchGrid(page, 'Auto');
  78  |     await expect(page.getByRole('cell', { name: /Auto/ }).first()).toBeVisible({ timeout: 15000 });
  79  |   });
  80  | 
  81  |   // ADO Test Case #65899: https://dev.azure.com/boxfusion/pd-dispatcher-V2/_workitems/edit/65899
  82  |   test('TC-03: Open Add Agent dialog', async ({ page }) => {
  83  |     test.setTimeout(60_000);
  84  |     await login(page);
  85  |     await gotoGrid(page);
  86  |     await page.getByRole('button', { name: /Add New/ }).click();
  87  |     await expect(page.locator('.ant-modal-content')).toBeVisible({ timeout: 15000 });
  88  |     await expect(page.getByText('Add New Agent')).toBeVisible();
  89  |   });
  90  | 
  91  |   // ADO Test Case #65900: https://dev.azure.com/boxfusion/pd-dispatcher-V2/_workitems/edit/65900
  92  |   test('TC-04: Export agents', async ({ page }) => {
  93  |     test.setTimeout(60_000);
  94  |     await login(page);
  95  |     await gotoGrid(page);
  96  |     const [download] = await Promise.all([
  97  |       page.waitForEvent('download', { timeout: 20000 }),
  98  |       page.getByRole('button', { name: /Export/ }).click(),
  99  |     ]);
  100 |     expect(download.suggestedFilename()).toBeTruthy();
  101 |   });
  102 | 
  103 |   // ADO Test Case #65901: https://dev.azure.com/boxfusion/pd-dispatcher-V2/_workitems/edit/65901
  104 |   test('TC-05: View agent details', async ({ page }) => {
  105 |     test.setTimeout(60_000);
  106 |     await login(page);
  107 |     await gotoGrid(page);
  108 |     await page.locator(DETAILS).first().click();
  109 |     await expect(page).toHaveURL(/agent-roles-detailsV2/);
  110 |     await expect(toolBtn(page, /^Edit$/)).toBeVisible({ timeout: 15000 });
  111 |   });
  112 | 
  113 |   // ADO Test Case #65902: https://dev.azure.com/boxfusion/pd-dispatcher-V2/_workitems/edit/65902
  114 |   test('TC-06: Edit agent from details view', async ({ page }) => {
  115 |     test.setTimeout(60_000);
  116 |     await login(page);
  117 |     await gotoGrid(page);
  118 |     await page.locator(DETAILS).first().click();
  119 |     await toolBtn(page, /^Edit$/).click();
  120 |     await expect(toolBtn(page, /^Save$/)).toBeVisible({ timeout: 15000 });
  121 |     await expect(toolBtn(page, /^Cancel Form Edit$/)).toBeVisible();
  122 |   });
  123 | 
  124 |   // ADO Test Case #65903: https://dev.azure.com/boxfusion/pd-dispatcher-V2/_workitems/edit/65903
  125 |   test('TC-07: Cancel edit in details view', async ({ page }) => {
  126 |     test.setTimeout(60_000);
  127 |     await login(page);
  128 |     await gotoGrid(page);
  129 |     await page.locator(DETAILS).first().click();
  130 |     await toolBtn(page, /^Edit$/).click();
  131 |     await expect(toolBtn(page, /^Cancel Form Edit$/)).toBeVisible({ timeout: 15000 });
  132 |     await toolBtn(page, /^Cancel Form Edit$/).click();
```