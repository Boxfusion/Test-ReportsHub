// AUTO-RECORDED from test-plans/Login/invalid-username-valid-password.md
// Source: Azure DevOps test plan #100853, suite #100854, test case #104706
// The .md plan is canonical. AI-repair will patch failing lines in this file.
// Do not hand-edit unless you are also updating the .md plan.

import { test, expect } from '@playwright/test';

const APP_URL = 'https://pd-approvals-adminportal-qa.azurewebsites.net';
const CREDS = { username: 'invaliduser', password: '123qwe' };

test('TC-01 — Invalid Username and Valid Password', async ({ page }) => {
  // STEP 1: NAVIGATE to https://pd-approvals-adminportal-qa.azurewebsites.net/login
  await page.goto(`${APP_URL}/login`, { waitUntil: 'domcontentloaded', timeout: 60_000 });

  // STEP 2: SNAPSHOT — confirm the Approvals login page opens with all login fields visible and functional
  await expect(page).toHaveURL(/login/);
  await expect(page.getByPlaceholder(/username/i)).toBeVisible();
  await expect(page.getByPlaceholder(/password/i)).toBeVisible();
  await expect(page.getByRole('button', { name: /log ?in|sign in/i })).toBeVisible();

  // STEP 3: TYPE Username field with `invaliduser`
  await page.getByPlaceholder(/username/i).fill(CREDS.username);

  // STEP 4: TYPE Password field with `123qwe`
  await page.getByPlaceholder(/password/i).fill(CREDS.password);

  // ASSERT Username/Password fields accept the entered values
  await expect(page.getByPlaceholder(/username/i)).toHaveValue(CREDS.username);
  await expect(page.getByPlaceholder(/password/i)).toHaveValue(CREDS.password);

  // STEP 5: CLICK the Login button
  await page.getByRole('button', { name: /log ?in|sign in/i }).click();

  // STEP 6: SNAPSHOT — confirm the error message and login page state
  // The Sign In error is a transient Ant Design toast (role="alert") — assert on the role, not exact text, and don't wait too long or it auto-dismisses.
  await expect(page.getByRole('alert')).toBeVisible({ timeout: 8_000 });

  // ASSERT (BLOCKING) An error message is displayed and the URL still contains /login
  await expect(page).toHaveURL(/login/);
});
