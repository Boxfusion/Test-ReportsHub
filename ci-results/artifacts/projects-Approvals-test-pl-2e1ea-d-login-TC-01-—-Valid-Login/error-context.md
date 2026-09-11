# Instructions

- Following Playwright test failed.
- Explain why, be concise, respect Playwright best practices.
- Provide a snippet of code with the fix, if possible.

# Test info

- Name: projects/Approvals/test-plans/Login/valid-login.spec.ts >> TC-01 — Valid Login
- Location: projects/Approvals/test-plans/Login/valid-login.spec.ts:11:5

# Error details

```
Error: expect(locator).toBeVisible() failed

Locator: getByPlaceholder(/username/i)
Expected: visible
Timeout: 5000ms
Error: element(s) not found

Call log:
  - Expect "toBeVisible" getByPlaceholder(/username/i) with timeout 5000ms
  - waiting for getByPlaceholder(/username/i)

```

```yaml
- img "Shesha Loading Animation"
- text: Initializing...
- alert
```

# Test source

```ts
  1  | // AUTO-RECORDED from test-plans/Login/valid-login.md
  2  | // Source: Azure DevOps test plan #100853, suite #100854, test case #104704
  3  | // The .md plan is canonical. AI-repair will patch failing lines in this file.
  4  | // Do not hand-edit unless you are also updating the .md plan.
  5  | 
  6  | import { test, expect } from '@playwright/test';
  7  | 
  8  | const APP_URL = 'https://pd-approvals-adminportal-qa.azurewebsites.net';
  9  | const USER = { username: 'Ian', password: '123qwe' };
  10 | 
  11 | test('TC-01 — Valid Login', async ({ page }) => {
  12 |   // STEP 1: NAVIGATE to https://pd-approvals-adminportal-qa.azurewebsites.net/login
  13 |   await page.goto(`${APP_URL}/login`, { waitUntil: 'domcontentloaded', timeout: 60_000 });
  14 | 
  15 |   // STEP 2: SNAPSHOT — confirm the Approvals login page opens with all login elements displayed
  16 |   await expect(page).toHaveURL(/login/);
> 17 |   await expect(page.getByPlaceholder(/username/i)).toBeVisible();
     |                                                    ^ Error: expect(locator).toBeVisible() failed
  18 |   await expect(page.getByPlaceholder(/password/i)).toBeVisible();
  19 |   await expect(page.getByRole('button', { name: /log ?in|sign in/i })).toBeVisible();
  20 | 
  21 |   // STEP 3: TYPE Username field with `Ian`
  22 |   await page.getByPlaceholder(/username/i).fill(USER.username);
  23 | 
  24 |   // STEP 4: TYPE Password field with `123qwe`
  25 |   await page.getByPlaceholder(/password/i).fill(USER.password);
  26 | 
  27 |   // ASSERT Username field contains `Ian` after typing
  28 |   await expect(page.getByPlaceholder(/username/i)).toHaveValue(USER.username);
  29 | 
  30 |   // STEP 5: CLICK the Login button
  31 |   await page.getByRole('button', { name: /log ?in|sign in/i }).click();
  32 | 
  33 |   // STEP 6: WAIT for the dashboard/home page to load
  34 |   await page.waitForURL(url => !url.toString().includes('/login'), { timeout: 30_000 });
  35 |   await page.waitForLoadState('networkidle');
  36 | 
  37 |   // ASSERT (BLOCKING) URL no longer contains /login and the user is redirected to the dashboard/home page
  38 |   await expect(page).not.toHaveURL(/login/);
  39 | });
  40 | 
```