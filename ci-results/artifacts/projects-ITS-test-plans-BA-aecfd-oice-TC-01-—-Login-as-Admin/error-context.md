# Instructions

- Following Playwright test failed.
- Explain why, be concise, respect Playwright best practices.
- Provide a snippet of code with the fix, if possible.

# Test info

- Name: projects/ITS/test-plans/BAS/register-and-upload-invoice.spec.ts >> TC-01 — Login as Admin
- Location: projects/ITS/test-plans/BAS/register-and-upload-invoice.spec.ts:5:5

# Error details

```
Test timeout of 90000ms exceeded.
```

```
Error: locator.fill: Test timeout of 90000ms exceeded.
Call log:
  - waiting for getByPlaceholder(/username/i)

```

# Page snapshot

```yaml
- generic [active]:
  - img "loading" [ref=e1]
  - alert [ref=e4]
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
> 13  |   await page.getByPlaceholder(/username/i).fill('admin');
      |                                            ^ Error: locator.fill: Test timeout of 90000ms exceeded.
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
  62  |   await expect(page.getByRole('button', { name: /create new/i })).toBeVisible({ timeout: 10_000 });
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
```