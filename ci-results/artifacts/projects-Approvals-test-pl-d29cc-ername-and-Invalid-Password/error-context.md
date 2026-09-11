# Instructions

- Following Playwright test failed.
- Explain why, be concise, respect Playwright best practices.
- Provide a snippet of code with the fix, if possible.

# Test info

- Name: projects/Approvals/test-plans/Login/valid-username-invalid-password.spec.ts >> TC-01 — Valid Username and Invalid Password
- Location: projects/Approvals/test-plans/Login/valid-username-invalid-password.spec.ts:11:5

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
  1  | // AUTO-RECORDED from test-plans/Login/valid-username-invalid-password.md
  2  | // Source: Azure DevOps test plan #100853, suite #100854, test case #104707
  3  | // The .md plan is canonical. AI-repair will patch failing lines in this file.
  4  | // Do not hand-edit unless you are also updating the .md plan.
  5  | 
  6  | import { test, expect } from '@playwright/test';
  7  | 
  8  | const APP_URL = 'https://pd-approvals-adminportal-qa.azurewebsites.net';
  9  | const CREDS = { username: 'Ian', password: 'wrongpass123' };
  10 | 
  11 | test('TC-01 — Valid Username and Invalid Password', async ({ page }) => {
  12 |   // STEP 1: NAVIGATE to https://pd-approvals-adminportal-qa.azurewebsites.net/login
  13 |   await page.goto(`${APP_URL}/login`, { waitUntil: 'domcontentloaded', timeout: 60_000 });
  14 | 
  15 |   // STEP 2: SNAPSHOT — confirm the Approvals login page opens with all login fields visible and functional
  16 |   await expect(page).toHaveURL(/login/);
> 17 |   await expect(page.getByPlaceholder(/username/i)).toBeVisible();
     |                                                    ^ Error: expect(locator).toBeVisible() failed
  18 |   await expect(page.getByPlaceholder(/password/i)).toBeVisible();
  19 |   await expect(page.getByRole('button', { name: /log ?in|sign in/i })).toBeVisible();
  20 | 
  21 |   // STEP 3: TYPE Username field with `Ian`
  22 |   await page.getByPlaceholder(/username/i).fill(CREDS.username);
  23 | 
  24 |   // STEP 4: TYPE Password field with `wrongpass123`
  25 |   await page.getByPlaceholder(/password/i).fill(CREDS.password);
  26 | 
  27 |   // ASSERT Username/Password fields accept the entered values
  28 |   await expect(page.getByPlaceholder(/username/i)).toHaveValue(CREDS.username);
  29 |   await expect(page.getByPlaceholder(/password/i)).toHaveValue(CREDS.password);
  30 | 
  31 |   // STEP 5: CLICK the Login button
  32 |   await page.getByRole('button', { name: /log ?in|sign in/i }).click();
  33 | 
  34 |   // STEP 6: SNAPSHOT — confirm the error message and login page state
  35 |   // The Sign In error is a transient Ant Design toast (role="alert") — assert on the role, not exact text, and don't wait too long or it auto-dismisses.
  36 |   await expect(page.getByRole('alert')).toBeVisible({ timeout: 8_000 });
  37 | 
  38 |   // ASSERT (BLOCKING) An error message is displayed and the URL still contains /login
  39 |   await expect(page).toHaveURL(/login/);
  40 | });
  41 | 
```