# Instructions

- Following Playwright test failed.
- Explain why, be concise, respect Playwright best practices.
- Provide a snippet of code with the fix, if possible.

# Test info

- Name: projects/dep/test-plans/service-requests/create-service-request-v2.spec.ts >> Create Service Request (v2) >> TC-01: Login as Admin
- Location: projects/dep/test-plans/service-requests/create-service-request-v2.spec.ts:19:7

# Error details

```
Test timeout of 90000ms exceeded.
```

```
Error: locator.fill: Test timeout of 90000ms exceeded.
Call log:
  - waiting for getByRole('textbox', { name: 'Username' })

```

# Page snapshot

```yaml
- generic [ref=e3]:
  - heading "Error 403 - This web app is stopped." [level=1] [ref=e4]
  - paragraph [ref=e5]: The web app you have attempted to reach is currently stopped and does not accept any requests. Please try to reload the page or visit it again soon.
  - paragraph [ref=e6]:
    - text: If you are the web app administrator, please find the common 403 error scenarios and resolution
    - link "here" [ref=e7] [cursor=pointer]:
      - /url: https://go.microsoft.com/fwlink/?linkid=2095007
    - text: . For further troubleshooting tools and recommendations, please visit
    - link "Azure Portal" [ref=e8] [cursor=pointer]:
      - /url: https://portal.azure.com/
    - text: .
```

# Test source

```ts
  1   | // AUTO-SCAFFOLDED from test-plans/service-requests/create-service-request-v2.md
  2   | // The .md plan is canonical. AI-repair will patch failing lines in this file.
  3   | // Do not hand-edit unless you are also updating the .md plan.
  4   | 
  5   | import { test, expect, Page } from '@playwright/test';
  6   | 
  7   | const APP_URL = 'https://linux-dep-adminportal-test.azurewebsites.net/';
  8   | const ADMIN = { user: 'admin', password: '123qwe' };
  9   | 
  10  | async function loginAsAdmin(page: Page) {
  11  |   await page.goto(APP_URL);
  12  |   await page.getByRole('textbox', { name: 'Username' }).fill(ADMIN.user);
  13  |   await page.getByRole('textbox', { name: 'Password' }).fill(ADMIN.password);
  14  |   await page.getByRole('button', { name: 'Sign In' }).click();
  15  |   await page.waitForLoadState('networkidle');
  16  | }
  17  | 
  18  | test.describe('Create Service Request (v2)', () => {
  19  |   test('TC-01: Login as Admin', async ({ page }) => {
  20  |     // STEP 1: NAVIGATE to https://linux-dep-adminportal-test.azurewebsites.net/
  21  |     await page.goto(APP_URL);
  22  | 
  23  |     // STEP 2: SNAPSHOT — confirm login form is visible
  24  |     // SNAPSHOT: login form is visible
  25  | 
  26  |     // STEP 3: TYPE username field with `admin`
> 27  |     await page.getByRole('textbox', { name: 'Username' }).fill(ADMIN.user);
      |                                                           ^ Error: locator.fill: Test timeout of 90000ms exceeded.
  28  | 
  29  |     // STEP 4: TYPE password field with `123qwe`
  30  |     await page.getByRole('textbox', { name: 'Password' }).fill(ADMIN.password);
  31  | 
  32  |     // STEP 5: CLICK the login / sign-in button
  33  |     await page.getByRole('button', { name: 'Sign In' }).click();
  34  | 
  35  |     // STEP 6: WAIT for dashboard/home page to load
  36  |     await page.waitForLoadState('networkidle');
  37  | 
  38  |     // ASSERT (BLOCKING) dashboard or home page is visible after login
  39  |     await expect(page).not.toHaveURL(/login/i);
  40  |     await expect(page.getByRole('menuitem', { name: /Cases/i }).first()).toBeVisible();
  41  |   });
  42  | 
  43  |   test('TC-02: Navigate to Service Requests', async ({ page }) => {
  44  |     await loginAsAdmin(page);
  45  | 
  46  |     // STEP 1: SNAPSHOT — confirm dashboard is loaded
  47  |     // SNAPSHOT: dashboard is loaded
  48  | 
  49  |     // STEP 2: CLICK the Service Requests menu / navigation item
  50  |     await page.getByRole('menuitem', { name: /Cases/i }).first().click();
  51  | 
  52  |     // STEP 3: WAIT for the Service Requests list page to load
  53  |     await page.waitForLoadState('networkidle');
  54  | 
  55  |     // STEP 4: SNAPSHOT — confirm Service Requests page is visible
  56  |     // SNAPSHOT: Service Requests page is visible
  57  | 
  58  |     // ASSERT (BLOCKING) Service Requests page is visible
  59  |     await expect(page).toHaveURL(/service-requests/i);
  60  |   });
  61  | 
  62  |   test('TC-03: Create a Service Request', async ({ page }) => {
  63  |     await loginAsAdmin(page);
  64  |     await page.getByRole('menuitem', { name: /Cases/i }).first().click();
  65  |     await page.waitForLoadState('networkidle');
  66  | 
  67  |     // STEP 1: SNAPSHOT — confirm Service Requests page is loaded
  68  |     // SNAPSHOT: Service Requests page is loaded
  69  | 
  70  |     // STEP 2: CLICK the "Create" / "New Service Request" button
  71  |     await page.getByRole('button', { name: /Create Case/i }).click();
  72  | 
  73  |     // STEP 3: WAIT for the create service request form/dialog to appear
  74  |     const dialog = page.getByRole('dialog', { name: /Create Case/i });
  75  |     await expect(dialog).toBeVisible();
  76  | 
  77  |     // STEP 4: SNAPSHOT — confirm form is open and mandatory fields are visible
  78  |     // SNAPSHOT: form is open with mandatory fields
  79  | 
  80  |     // ASSERT create service request form is visible
  81  |     await expect(dialog).toBeVisible();
  82  | 
  83  |     // STEP 5: SELECT / TYPE each mandatory field on the form with valid values
  84  |     // Channel — Call Centre (Ant Design select)
  85  |     await dialog.locator('.ant-form-item').filter({ hasText: 'Channel' }).first().locator('.ant-select').click();
  86  |     await page.locator('.ant-select-item-option').filter({ hasText: 'Call Centre' }).first().click();
  87  | 
  88  |     // Mobile Number
  89  |     await dialog.locator('.ant-form-item').filter({ hasText: 'Mobile Number' }).locator('input').fill('0766791145');
  90  | 
  91  |     // Email Address
  92  |     await dialog.locator('.ant-form-item').filter({ hasText: 'Email Address' }).locator('input').fill('automation@boxfusion.io');
  93  | 
  94  |     // Category — pick first option
  95  |     await dialog.locator('.ant-form-item').filter({ hasText: 'Category' }).first().locator('.ant-select').click();
  96  |     await page.locator('.ant-select-dropdown:visible .ant-select-item-option').first().click();
  97  | 
  98  |     // Case type — pick first option
  99  |     await dialog.locator('.ant-form-item').filter({ hasText: 'Case type' }).first().locator('.ant-select').click();
  100 |     await page.locator('.ant-select-dropdown:visible .ant-select-item-option').first().click();
  101 | 
  102 |     // Address — type into "Search places"
  103 |     await dialog.getByRole('textbox', { name: /Search places/i }).fill('1 Sandton Drive, Sandton');
  104 | 
  105 |     // STEP 6: SNAPSHOT — confirm each mandatory field is populated
  106 |     // SNAPSHOT: mandatory fields populated
  107 | 
  108 |     // ASSERT all mandatory fields are populated before submit
  109 |     await expect(dialog.locator('.ant-form-item').filter({ hasText: 'Mobile Number' }).locator('input')).toHaveValue('0766791145');
  110 | 
  111 |     // STEP 7: CLICK the OK button to submit
  112 |     await dialog.getByRole('button', { name: /^OK$/ }).click();
  113 | 
  114 |     // ASSERT OK button was clicked and form was submitted
  115 |     // (covered by waiting for confirmation below)
  116 | 
  117 |     // STEP 8: WAIT for confirmation or service request reference to appear
  118 |     await page.waitForLoadState('networkidle');
  119 | 
  120 |     // STEP 9: SNAPSHOT — confirm success message is visible
  121 |     // SNAPSHOT: success message visible
  122 | 
  123 |     // ASSERT (BLOCKING) success message or service request reference is visible after submit
  124 |     await expect(dialog).toBeHidden({ timeout: 30_000 });
  125 |   });
  126 | });
  127 | 
```