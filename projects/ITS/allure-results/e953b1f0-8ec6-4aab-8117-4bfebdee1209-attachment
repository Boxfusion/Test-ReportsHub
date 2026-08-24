# Instructions

- Following Playwright test failed.
- Explain why, be concise, respect Playwright best practices.
- Provide a snippet of code with the fix, if possible.

# Test info

- Name: projects\ITS\test-plans\BAS\register-and-upload-invoice.spec.ts >> TC-03 — Click on the My Items submenu item
- Location: projects\ITS\test-plans\BAS\register-and-upload-invoice.spec.ts:46:5

# Error details

```
Error: expect(locator).toBeVisible() failed

Locator: getByRole('button', { name: /create new/i })
Expected: visible
Error: element(s) not found

Call log:
  - Expect "toBeVisible" with timeout 10000ms
  - waiting for getByRole('button', { name: /create new/i })

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
  - img "loading"
- alert
```

# Test source

```ts
  1   | import { test, expect } from '@playwright/test';
  2   | 
  3   | const APP_URL = 'https://pd-invtracking-adminportal-qa.azurewebsites.net';
  4   | 
  5   | test('TC-01 — Login as Admin', async ({ page }) => {
  6   |   // STEP 1: NAVIGATE to login page
  7   |   await page.goto(`${APP_URL}/login`);
  8   | 
  9   |   // STEP 2: SNAPSHOT — confirm login page is visible
  10  |   await expect(page).toHaveURL(/login/);
  11  | 
  12  |   // STEP 3: TYPE Username field with `admin`
  13  |   await page.getByPlaceholder(/username/i).fill('admin');
  14  | 
  15  |   // STEP 4: TYPE Password field with `123qwe`
  16  |   await page.getByPlaceholder(/password/i).fill('123qwe');
  17  | 
  18  |   // STEP 5: CLICK the Sign In button
  19  |   await page.getByRole('button', { name: /sign in/i }).click();
  20  | 
  21  |   // STEP 6: WAIT for the home page to load
  22  |   await page.waitForURL(url => !url.toString().includes('/login'), { timeout: 30_000 });
  23  | 
  24  |   // ASSERT (BLOCKING) URL no longer contains /login
  25  |   await expect(page).not.toHaveURL(/login/);
  26  | });
  27  | 
  28  | test('TC-02 — Click on the Workflow menu item', async ({ page }) => {
  29  |   await page.goto(`${APP_URL}/login`);
  30  |   await page.getByPlaceholder(/username/i).fill('admin');
  31  |   await page.getByPlaceholder(/password/i).fill('123qwe');
  32  |   await page.getByRole('button', { name: /sign in/i }).click();
  33  |   await page.waitForURL(url => !url.toString().includes('/login'), { timeout: 30_000 });
  34  | 
  35  |   // STEP 1: SNAPSHOT — confirm the target element for: Click on the Workflow menu item
  36  |   await expect(page.getByRole('menuitem', { name: /workflow/i }).or(page.getByText(/workflow/i).first())).toBeVisible();
  37  | 
  38  |   // STEP 2: CLICK the Workflow menu item
  39  |   await page.getByRole('menuitem', { name: /workflow/i }).or(page.getByText(/^Workflow$/i).first()).click();
  40  | 
  41  |   // STEP 3: SNAPSHOT — verify sub-menu items are displayed
  42  |   // ASSERT (BLOCKING) sub-menu items (Inbox, My Items, Sent & Drafts) are displayed
  43  |   await expect(page.getByText(/my items/i).first()).toBeVisible({ timeout: 10_000 });
  44  | });
  45  | 
  46  | test('TC-03 — Click on the My Items submenu item', async ({ page }) => {
  47  |   await page.goto(`${APP_URL}/login`);
  48  |   await page.getByPlaceholder(/username/i).fill('admin');
  49  |   await page.getByPlaceholder(/password/i).fill('123qwe');
  50  |   await page.getByRole('button', { name: /sign in/i }).click();
  51  |   await page.waitForURL(url => !url.toString().includes('/login'), { timeout: 30_000 });
  52  |   await page.getByRole('menuitem', { name: /workflow/i }).or(page.getByText(/^Workflow$/i).first()).click();
  53  | 
  54  |   // STEP 1: SNAPSHOT — confirm the target element for: Click on the My Items submenu item
  55  |   await expect(page.getByText(/my items/i).first()).toBeVisible();
  56  | 
  57  |   // STEP 2: CLICK the My Items submenu item
  58  |   await page.getByText(/my items/i).first().click();
  59  | 
  60  |   // STEP 3: SNAPSHOT — verify the My Items page is displayed
  61  |   // ASSERT (BLOCKING) My Items page is displayed with Create New and Export buttons
> 62  |   await expect(page.getByRole('button', { name: /create new/i })).toBeVisible({ timeout: 10_000 });
      |                                                                   ^ Error: expect(locator).toBeVisible() failed
  63  |   await expect(page.getByRole('button', { name: /export/i })).toBeVisible({ timeout: 10_000 });
  64  | });
  65  | 
  66  | test('TC-04 — Click on the Export button on My Items', async ({ page }) => {
  67  |   await page.goto(`${APP_URL}/login`);
  68  |   await page.getByPlaceholder(/username/i).fill('admin');
  69  |   await page.getByPlaceholder(/password/i).fill('123qwe');
  70  |   await page.getByRole('button', { name: /sign in/i }).click();
  71  |   await page.waitForURL(url => !url.toString().includes('/login'), { timeout: 30_000 });
  72  |   await page.getByRole('menuitem', { name: /workflow/i }).or(page.getByText(/^Workflow$/i).first()).click();
  73  |   await page.getByText(/my items/i).first().click();
  74  |   await expect(page.getByRole('button', { name: /export/i })).toBeVisible({ timeout: 10_000 });
  75  | 
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
```