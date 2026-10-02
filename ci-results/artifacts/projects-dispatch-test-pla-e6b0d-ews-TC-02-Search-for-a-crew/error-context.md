# Instructions

- Following Playwright test failed.
- Explain why, be concise, respect Playwright best practices.
- Provide a snippet of code with the fix, if possible.

# Test info

- Name: projects/dispatch/test-plans/administrative-functions/crews.spec.ts >> ADMIN-2.13 — Crews >> TC-02: Search for a crew
- Location: projects/dispatch/test-plans/administrative-functions/crews.spec.ts:105:7

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
  1   | // AUTO-RECORDED from test-plans/administrative-functions/crews.md
  2   | // Source: Azure DevOps test plan #65099, suite #65141 (2.13 Crews)
  3   | // The .md plan is canonical. AI-repair will patch failing lines in this file.
  4   | //
  5   | // Selectors recorded live against NC Dispatch QA on 2026-06-25. Crews is a form-dialog grid: rows have
  6   | // only a magnifying-glass link to /EMSDispatchTeam-Details-View?id=… (NO row edit-pencil), so the
  7   | // "edit from index" view is reached by the details URL + &mode=edit. Details/edit actions are
  8   | // .sha-toolbar-btn (Back/Edit/Save/Cancel Form Edit) in #modalContainerId. Grid is large + slow.
  9   | 
  10  | import { test, expect, Page, Locator } from '@playwright/test';
  11  | 
  12  | const BASE = 'https://ncdoh-dispatcher-adminportal-qa.shesha.app';
  13  | const APP_URL = `${BASE}/login`;
  14  | const GRID = `${BASE}/dynamic/Boxfusion.Ems/EmsDispatchTeam-Table`;
  15  | const ADMIN = { user: 'Admin', password: '123qwe' };
  16  | const DETAILS = 'a[href*="EMSDispatchTeam-Details-View"]';
  17  | 
  18  | async function login(page: Page) {
  19  |   await page.goto(APP_URL);
  20  |   // The login page occasionally renders blank on first paint — reload once if the form isn't there.
  21  |   const user = page.getByPlaceholder('Username');
  22  |   try {
  23  |     await expect(user).toBeVisible({ timeout: 15000 });
  24  |   } catch {
  25  |     await page.reload();
  26  |     await expect(user).toBeVisible({ timeout: 20000 });
  27  |   }
  28  |   await user.fill(ADMIN.user);
  29  |   await page.getByPlaceholder('Password').fill(ADMIN.password);
  30  |   await page.getByRole('button', { name: 'Sign In' }).click();
> 31  |   await page.waitForURL((url) => !url.href.includes('/login'), { timeout: 30000 });
      |              ^ TimeoutError: page.waitForURL: Timeout 30000ms exceeded.
  32  | }
  33  | 
  34  | async function gotoGrid(page: Page) {
  35  |   // The Crews grid is very large (~13k rows) and intermittently slow / fails to render under load —
  36  |   // reload once and wait for the detail links (which only exist once rows have loaded).
  37  |   await page.goto(GRID);
  38  |   const firstDetail = page.locator(DETAILS).first();
  39  |   try {
  40  |     await expect(page.getByRole('table')).toBeVisible({ timeout: 30000 });
  41  |     await expect(firstDetail).toBeVisible({ timeout: 30000 });
  42  |   } catch {
  43  |     await page.reload();
  44  |     await expect(page.getByRole('table')).toBeVisible({ timeout: 45000 });
  45  |     await expect(firstDetail).toBeVisible({ timeout: 45000 });
  46  |   }
  47  | }
  48  | 
  49  | async function searchGrid(page: Page, term: string) {
  50  |   const box = page.getByRole('textbox').first();
  51  |   await box.click();
  52  |   await box.fill(term);
  53  |   await box.press('Enter'); // trigger the search both ways — the heavy grid can miss the button click
  54  |   await page.getByRole('button', { name: 'search' }).click();
  55  |   await page.waitForTimeout(2000);
  56  | }
  57  | 
  58  | function detailView(page: Page): Locator {
  59  |   return page.locator('#modalContainerId');
  60  | }
  61  | function toolBtn(page: Page, label: RegExp): Locator {
  62  |   return page.locator('#modalContainerId .sha-toolbar-btn').filter({ hasText: label });
  63  | }
  64  | // Crew Number — the only free-text input on the crew edit form.
  65  | function crewNumberField(page: Page): Locator {
  66  |   return detailView(page).locator('input.ant-input:not([disabled])').first();
  67  | }
  68  | 
  69  | // The crew edit form does NOT pre-populate Crew Members / Crew Skill Type, so Save fails "required"
  70  | // unless they're re-supplied. Pick the first option of the *visible* select for a given label
  71  | // (Crew Skill Type renders a hidden + a visible variant — match the visible one).
  72  | async function pickFirstVisible(page: Page, label: string) {
  73  |   const item = detailView(page)
  74  |     .locator('.ant-form-item')
  75  |     .filter({ hasText: label })
  76  |     .filter({ has: page.locator('.ant-select-selector:visible') })
  77  |     .first();
  78  |   await item.locator('.ant-select-selector').click();
  79  |   const dd = page.locator('.ant-select-dropdown:not(.ant-select-dropdown-hidden)').first();
  80  |   await dd.waitFor({ state: 'visible', timeout: 10000 });
  81  |   await page.waitForTimeout(400);
  82  |   // Click the first UNSELECTED option — for the Crew Members multi-select this adds a member without
  83  |   // toggling off the already-selected one; for the single-select Crew Skill Type it just picks one.
  84  |   await dd.locator('.ant-select-item-option:not(.ant-select-item-option-selected)').first()
  85  |     .click({ timeout: 8000 });
  86  |   // Multi-selects keep the dropdown open — close it (Esc only closes the dropdown on a page form,
  87  |   // not the view) so the next field's selector isn't covered by the overlay.
  88  |   await page.keyboard.press('Escape');
  89  | }
  90  | // No row edit-pencil on this grid — reach a crew's edit view via the details URL + mode=edit.
  91  | async function gotoFirstEditView(page: Page) {
  92  |   const href = await page.locator(DETAILS).first().getAttribute('href');
  93  |   await page.goto(`${BASE}${href}${href!.includes('?') ? '&' : '?'}mode=edit`);
  94  |   await expect(page).toHaveURL(/mode=edit/);
  95  | }
  96  | 
  97  | test.describe('ADMIN-2.13 — Crews', () => {
  98  | 
  99  |   test('TC-01: Log in to NC Dispatch', async ({ page }) => {
  100 |     await login(page);
  101 |     await expect(page).not.toHaveURL(/\/login/i);
  102 |   });
  103 | 
  104 |   // ADO Test Case #65881: https://dev.azure.com/boxfusion/pd-dispatcher-V2/_workitems/edit/65881
  105 |   test('TC-02: Search for a crew', async ({ page }) => {
  106 |     test.setTimeout(60_000);
  107 |     await login(page);
  108 |     await gotoGrid(page);
  109 |     await expect(page.getByRole('table')).toBeVisible();
  110 |     await searchGrid(page, 'QA-CREW');
  111 |     // Heavy grid — the filtered query can take a while to return; poll generously.
  112 |     await expect(page.getByRole('cell', { name: /QA-CREW/ }).first()).toBeVisible({ timeout: 45000 });
  113 |   });
  114 | 
  115 |   // ADO Test Case #65882: https://dev.azure.com/boxfusion/pd-dispatcher-V2/_workitems/edit/65882
  116 |   test('TC-03: Open Add Crew dialog', async ({ page }) => {
  117 |     test.setTimeout(60_000);
  118 |     await login(page);
  119 |     await gotoGrid(page);
  120 |     await page.getByRole('button', { name: /Add New/ }).click();
  121 |     await expect(page.locator('.ant-modal-content')).toBeVisible({ timeout: 15000 });
  122 |     await expect(page.getByText('Add New Crew')).toBeVisible();
  123 |   });
  124 | 
  125 |   // ADO Test Case #65883: https://dev.azure.com/boxfusion/pd-dispatcher-V2/_workitems/edit/65883
  126 |   test('TC-04: Export crews', async ({ page }) => {
  127 |     test.setTimeout(60_000);
  128 |     await login(page);
  129 |     await gotoGrid(page);
  130 |     const [download] = await Promise.all([
  131 |       page.waitForEvent('download', { timeout: 20000 }),
```