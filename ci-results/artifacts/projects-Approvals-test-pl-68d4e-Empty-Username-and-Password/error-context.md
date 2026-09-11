# Instructions

- Following Playwright test failed.
- Explain why, be concise, respect Playwright best practices.
- Provide a snippet of code with the fix, if possible.

# Test info

- Name: projects/Approvals/test-plans/Login/empty-username-and-password.spec.ts >> TC-01 — Empty Username and Password
- Location: projects/Approvals/test-plans/Login/empty-username-and-password.spec.ts:10:5

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
  1  | // AUTO-RECORDED from test-plans/Login/empty-username-and-password.md
  2  | // Source: Azure DevOps test plan #100853, suite #100854, test case #104709
  3  | // The .md plan is canonical. AI-repair will patch failing lines in this file.
  4  | // Do not hand-edit unless you are also updating the .md plan.
  5  | 
  6  | import { test, expect } from '@playwright/test';
  7  | 
  8  | const APP_URL = 'https://pd-approvals-adminportal-qa.azurewebsites.net';
  9  | 
  10 | test('TC-01 — Empty Username and Password', async ({ page }) => {
  11 |   // STEP 1: NAVIGATE to https://pd-approvals-adminportal-qa.azurewebsites.net/login
  12 |   await page.goto(`${APP_URL}/login`, { waitUntil: 'domcontentloaded', timeout: 60_000 });
  13 | 
  14 |   // STEP 2: SNAPSHOT — confirm the Approvals login page opens with all login elements displayed
  15 |   await expect(page).toHaveURL(/login/);
> 16 |   await expect(page.getByPlaceholder(/username/i)).toBeVisible();
     |                                                    ^ Error: expect(locator).toBeVisible() failed
  17 |   await expect(page.getByPlaceholder(/password/i)).toBeVisible();
  18 |   await expect(page.getByRole('button', { name: /log ?in|sign in/i })).toBeVisible();
  19 | 
  20 |   // STEP 3: Leave Username field empty (no action)
  21 |   // STEP 4: Leave Password field empty (no action)
  22 | 
  23 |   // STEP 5: CLICK the Login button
  24 |   await page.getByRole('button', { name: /log ?in|sign in/i }).click();
  25 | 
  26 |   // STEP 6: SNAPSHOT — confirm validation messages are displayed for both fields
  27 |   // No per-field "required" text is rendered — the app instead surfaces a transient Ant Design toast (role="alert"), same as the invalid-credentials cases.
  28 |   await expect(page.getByRole('alert')).toBeVisible({ timeout: 8_000 });
  29 | 
  30 |   // ASSERT (BLOCKING) Login is prevented and the URL still contains /login
  31 |   await expect(page).toHaveURL(/login/);
  32 | });
  33 | 
```