// AUTO-RECORDED from test-plans/Login/valid-login.md
// Source: Azure DevOps test plan #100853, suite #100854, test case #104704
// The .md plan is canonical. AI-repair will patch failing lines in this file.
// Do not hand-edit unless you are also updating the .md plan.

import { test, expect } from '@playwright/test';

const APP_URL = 'https://pd-approvals-adminportal-qa.azurewebsites.net';
const USER = { username: 'Ian', password: '123qwe' };

test('TC-01 — Valid Login', async ({ page }) => {
  // STEP 1: NAVIGATE to https://pd-approvals-adminportal-qa.azurewebsites.net/login
  await page.goto(`${APP_URL}/login`, { waitUntil: 'domcontentloaded', timeout: 60_000 });

  // STEP 2: SNAPSHOT — confirm the Approvals login page opens with all login elements displayed
  await expect(page).toHaveURL(/login/);
  await expect(page.getByPlaceholder(/username/i)).toBeVisible();
  await expect(page.getByPlaceholder(/password/i)).toBeVisible();
  await expect(page.getByRole('button', { name: /log ?in|sign in/i })).toBeVisible();

  // STEP 3: TYPE Username field with `Ian`
  await page.getByPlaceholder(/username/i).fill(USER.username);

  // STEP 4: TYPE Password field with `123qwe`
  await page.getByPlaceholder(/password/i).fill(USER.password);

  // ASSERT Username field contains `Ian` after typing
  await expect(page.getByPlaceholder(/username/i)).toHaveValue(USER.username);

  // STEP 5: CLICK the Login button
  await page.getByRole('button', { name: /log ?in|sign in/i }).click();

  // STEP 6: WAIT for the dashboard/home page to load
  await page.waitForURL(url => !url.toString().includes('/login'), { timeout: 30_000 });
  await page.waitForLoadState('networkidle');

  // ASSERT (BLOCKING) URL no longer contains /login and the user is redirected to the dashboard/home page
  await expect(page).not.toHaveURL(/login/);
});
