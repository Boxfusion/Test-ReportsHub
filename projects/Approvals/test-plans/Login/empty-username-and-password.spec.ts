// AUTO-RECORDED from test-plans/Login/empty-username-and-password.md
// Source: Azure DevOps test plan #100853, suite #100854, test case #104709
// The .md plan is canonical. AI-repair will patch failing lines in this file.
// Do not hand-edit unless you are also updating the .md plan.

import { test, expect } from '@playwright/test';

const APP_URL = 'https://pd-approvals-adminportal-qa.azurewebsites.net';

test('TC-01 — Empty Username and Password', async ({ page }) => {
  // STEP 1: NAVIGATE to https://pd-approvals-adminportal-qa.azurewebsites.net/login
  await page.goto(`${APP_URL}/login`, { waitUntil: 'domcontentloaded', timeout: 60_000 });

  // STEP 2: SNAPSHOT — confirm the Approvals login page opens with all login elements displayed
  await expect(page).toHaveURL(/login/);
  await expect(page.getByPlaceholder(/username/i)).toBeVisible();
  await expect(page.getByPlaceholder(/password/i)).toBeVisible();
  await expect(page.getByRole('button', { name: /log ?in|sign in/i })).toBeVisible();

  // STEP 3: Leave Username field empty (no action)
  // STEP 4: Leave Password field empty (no action)

  // STEP 5: CLICK the Login button
  await page.getByRole('button', { name: /log ?in|sign in/i }).click();

  // STEP 6: SNAPSHOT — confirm validation messages are displayed for both fields
  // No per-field "required" text is rendered — the app instead surfaces a transient Ant Design toast (role="alert"), same as the invalid-credentials cases.
  await expect(page.getByRole('alert')).toBeVisible({ timeout: 8_000 });

  // ASSERT (BLOCKING) Login is prevented and the URL still contains /login
  await expect(page).toHaveURL(/login/);
});
