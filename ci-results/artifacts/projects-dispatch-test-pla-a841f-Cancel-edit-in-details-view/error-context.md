# Instructions

- Following Playwright test failed.
- Explain why, be concise, respect Playwright best practices.
- Provide a snippet of code with the fix, if possible.

# Test info

- Name: projects/dispatch/test-plans/administrative-functions/devices.spec.ts >> ADMIN-2.11 — Devices >> TC-08: Cancel edit in details view
- Location: projects/dispatch/test-plans/administrative-functions/devices.spec.ts:144:7

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
  1   | // AUTO-RECORDED from test-plans/administrative-functions/devices.md
  2   | // Source: Azure DevOps test plan #65099, suite #65143 (2.11 Devices)
  3   | // The .md plan is canonical. AI-repair will patch failing lines in this file.
  4   | //
  5   | // Selectors recorded live against NC Dispatch QA on 2026-06-25. Devices is a form-dialog grid:
  6   | // Add New opens "Add New Device"; rows expose a magnifying-glass details link
  7   | // (/mobile-device-details?id=…) and an edit-pencil BUTTON (no href, unlike Vehicles). Details/edit
  8   | // view actions are .sha-toolbar-btn (Back/Edit/Save/Cancel Form Edit) inside #modalContainerId.
  9   | 
  10  | import { test, expect, Page, Locator } from '@playwright/test';
  11  | 
  12  | const BASE = 'https://ncdoh-dispatcher-adminportal-qa.shesha.app';
  13  | const APP_URL = `${BASE}/login`;
  14  | const GRID = `${BASE}/dynamic/Boxfusion.Dispatcher/mobile-devices`;
  15  | const ADMIN = { user: 'Admin', password: '123qwe' };
  16  | const DETAILS = 'a[href*="mobile-device-details"]';
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
  35  |   await page.goto(GRID);
  36  |   await expect(page.getByRole('table')).toBeVisible({ timeout: 30000 });
  37  |   await expect(page.getByRole('textbox').first()).toBeVisible({ timeout: 30000 });
  38  | }
  39  | 
  40  | async function searchGrid(page: Page, term: string) {
  41  |   const box = page.getByRole('textbox').first();
  42  |   await box.click();
  43  |   await box.fill(term);
  44  |   await page.getByRole('button', { name: 'search' }).click();
  45  |   await page.waitForTimeout(2500);
  46  | }
  47  | 
  48  | function detailView(page: Page): Locator {
  49  |   return page.locator('#modalContainerId');
  50  | }
  51  | function toolBtn(page: Page, label: RegExp): Locator {
  52  |   return page.locator('#modalContainerId .sha-toolbar-btn').filter({ hasText: label });
  53  | }
  54  | // A free-text field on the device edit form to tweak for save/cancel cases (Model has no format
  55  | // or uniqueness constraint, unlike IMEI / SIM-Card).
  56  | function modelField(page: Page): Locator {
  57  |   return detailView(page).locator('.ant-form-item').filter({ hasText: 'Model' }).getByRole('textbox');
  58  | }
  59  | 
  60  | // "Edit from index": the row edit-pencil is an icon button whose onClick routes to the device's edit
  61  | // view (the details URL + mode=edit). Reading the first row's id and navigating there is the robust
  62  | // equivalent of clicking the pencil (the destination the ADO case verifies).
  63  | async function gotoFirstEditView(page: Page) {
  64  |   const href = await page.locator(DETAILS).first().getAttribute('href');
  65  |   await page.goto(`${BASE}${href}${href!.includes('?') ? '&' : '?'}mode=edit`);
  66  |   await expect(page).toHaveURL(/mode=edit/);
  67  | }
  68  | 
  69  | test.describe('ADMIN-2.11 — Devices', () => {
  70  | 
  71  |   test('TC-01: Log in to NC Dispatch', async ({ page }) => {
  72  |     await login(page);
  73  |     await expect(page).not.toHaveURL(/\/login/i);
  74  |   });
  75  | 
  76  |   // ADO Test Case #65858: https://dev.azure.com/boxfusion/pd-dispatcher-V2/_workitems/edit/65858
  77  |   test('TC-02: Search for a device', async ({ page }) => {
  78  |     test.setTimeout(60_000);
  79  |     await login(page);
  80  |     await gotoGrid(page);
  81  |     await expect(page.getByRole('table')).toBeVisible();
  82  |     await searchGrid(page, 'Galaxy');
  83  |     await expect(page.getByRole('cell', { name: /Galaxy/ }).first()).toBeVisible({ timeout: 15000 });
  84  |   });
  85  | 
  86  |   // ADO Test Case #65859: https://dev.azure.com/boxfusion/pd-dispatcher-V2/_workitems/edit/65859
  87  |   test('TC-03: Open Add Device dialog', async ({ page }) => {
  88  |     test.setTimeout(60_000);
  89  |     await login(page);
  90  |     await gotoGrid(page);
  91  |     await page.getByRole('button', { name: /Add New/ }).click();
  92  |     await expect(page.locator('.ant-modal-content')).toBeVisible({ timeout: 15000 });
  93  |     await expect(page.getByText('Add New Device')).toBeVisible();
  94  |   });
  95  | 
  96  |   // ADO Test Case #65860: https://dev.azure.com/boxfusion/pd-dispatcher-V2/_workitems/edit/65860
  97  |   test('TC-04: Export devices', async ({ page }) => {
  98  |     test.setTimeout(60_000);
  99  |     await login(page);
  100 |     await gotoGrid(page);
  101 |     // STEP: CLICK Export and ASSERT (BLOCKING) a download is produced
  102 |     const [download] = await Promise.all([
  103 |       page.waitForEvent('download', { timeout: 20000 }),
  104 |       page.getByRole('button', { name: /Export/ }).click(),
  105 |     ]);
  106 |     expect(download.suggestedFilename()).toBeTruthy();
  107 |   });
  108 | 
  109 |   // ADO Test Case #65861: https://dev.azure.com/boxfusion/pd-dispatcher-V2/_workitems/edit/65861
  110 |   test('TC-05: View device details', async ({ page }) => {
  111 |     test.setTimeout(60_000);
  112 |     await login(page);
  113 |     await gotoGrid(page);
  114 |     await page.locator(DETAILS).first().click();
  115 |     await expect(page).toHaveURL(/mobile-device-details/);
  116 |     await expect(toolBtn(page, /^Edit$/)).toBeVisible({ timeout: 15000 });
  117 |   });
  118 | 
  119 |   // ADO Test Case #65862: https://dev.azure.com/boxfusion/pd-dispatcher-V2/_workitems/edit/65862
  120 |   test('TC-06: Navigate back from details', async ({ page }) => {
  121 |     test.setTimeout(60_000);
  122 |     await login(page);
  123 |     await gotoGrid(page);
  124 |     await page.locator(DETAILS).first().click();
  125 |     const back = detailView(page).getByRole('button', { name: 'Back' })
  126 |       .or(detailView(page).getByRole('link', { name: 'Back' }));
  127 |     await expect(back).toBeVisible({ timeout: 15000 });
  128 |     await back.click();
  129 |     await expect(page.getByRole('table')).toBeVisible({ timeout: 20000 });
  130 |   });
  131 | 
```