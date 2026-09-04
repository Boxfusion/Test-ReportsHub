// AUTO-SCAFFOLDED from test-plans/authentication/admin-portal-authentication.md
// The .md plan is canonical. AI-repair will patch failing lines in this file.
// Do not hand-edit unless you are also updating the .md plan.
//
// Mirrors Azure DevOps suite 112731 (Plan 112718 › PD-CRM › Authentication › Admin Portal) one-to-one:
// 8 cases, #112734–#112741, in ADO order. Expected results are quoted from the ADO steps.
//
// Selectors captured live against pd-dep-adminportal-qa.shesha.app on 2026-09-01.
//
// TC-06 and TC-07 are EXPECTED TO FAIL — see BUG-004 (ADO expectation names the wrong parameter) and
// BUG-002 (empty form produces no message at all) in test-reports/bugs/admin-portal-authentication.md.

import { test, expect, Page } from '@playwright/test';

const BASE = 'https://pd-dep-adminportal-qa.shesha.app';
const LOGIN_URL = `${BASE}/login`;
const ADMIN = { user: 'Admin', password: 'P@ssword1' };
const BAD_USER = 'NoSuchUser999';
const BAD_PASS = 'WrongPass123!';

// ADO prescribes "Invalid username or password"; the app renders "Invalid user name or password".
// Matched whitespace-tolerantly so three cases don't fail on one cosmetic delta (raised as BUG-003).
const INVALID_CREDS = /invalid\s*user\s*name\s*or\s*password/i;

const logo = (page: Page) => page.locator('img[src="/images/app-logo.png"]');
const usernameField = (page: Page) => page.getByPlaceholder('Username');
const passwordField = (page: Page) => page.locator('input[type="password"]').first();
const signInButton = (page: Page) => page.locator('button:has-text("Sign In")').first();
const toast = (page: Page) => page.locator('.ant-message, .ant-notification, .ant-alert').first();

async function gotoLogin(page: Page) {
  await page.goto(LOGIN_URL, { waitUntil: 'domcontentloaded' });
  await expect(usernameField(page)).toBeVisible({ timeout: 30_000 });
}

/**
 * Ant Design toasts auto-dismiss, so poll rather than taking one reading — otherwise a real
 * message is missed and a defect is masked (or a passing case reported as failing).
 */
async function collectMessages(page: Page, ms = 9_000): Promise<string[]> {
  const found = new Set<string>();
  const deadline = Date.now() + ms;
  while (Date.now() < deadline) {
    const batch = await page.evaluate(() => {
      const seen: string[] = [];
      ['.ant-message', '.ant-notification', '.ant-alert', '.ant-form-item-explain', '[role=alert]']
        .forEach(sel => document.querySelectorAll(sel).forEach(el => {
          const text = (el as HTMLElement).innerText?.trim();
          if (text) seen.push(text.replace(/\s+/g, ' '));
        }));
      return seen;
    });
    batch.forEach(m => found.add(m));
    await page.waitForTimeout(250);
  }
  return [...found];
}

test.describe('Admin Portal Authentication (ADO suite 112731)', () => {
  test('TC-01 (#112734): Verify successful login with valid credentials', async ({ page }) => {
    // STEP 1: NAVIGATE to the Lesedi Admin Portal URL
    await page.goto(LOGIN_URL, { waitUntil: 'domcontentloaded' });

    // STEP 2: SNAPSHOT — ASSERT (BLOCKING) the Login page is displayed
    await expect(usernameField(page)).toBeVisible({ timeout: 30_000 });
    await expect(signInButton(page)).toBeVisible();

    // STEP 3: TYPE in a valid username
    await usernameField(page).fill(ADMIN.user);
    // ASSERT the typed username is displayed
    await expect(usernameField(page)).toHaveValue(ADMIN.user);

    // STEP 4: TYPE in Password
    await passwordField(page).fill(ADMIN.password);

    // STEP 5: CLICK on Sign In
    await signInButton(page).click();

    // STEP 6: WAIT — ASSERT (BLOCKING) authentication is successful
    await page.waitForURL(/\/dynamic\//, { timeout: 60_000 });
    await expect(page).not.toHaveURL(/\/login/);
  });

  test('TC-02 (#112735): Verify login using an invalid username', async ({ page }) => {
    // STEP 1-2: NAVIGATE and ASSERT the Login page is displayed with the Lesedi logo
    await gotoLogin(page);
    await expect(logo(page)).toBeVisible();

    // STEP 3: TYPE in invalid username — ASSERT it is displayed
    await usernameField(page).fill(BAD_USER);
    await expect(usernameField(page)).toHaveValue(BAD_USER);

    // STEP 4: TYPE in valid password
    await passwordField(page).fill(ADMIN.password);

    // STEP 5: CLICK on Sign In
    await signInButton(page).click();

    // STEP 6: ASSERT the invalid-credentials error message is displayed
    await expect(toast(page)).toContainText(INVALID_CREDS, { timeout: 20_000 });

    // ASSERT (BLOCKING) the user remains on the Login page
    await expect(page).toHaveURL(/\/login/);
  });

  test('TC-03 (#112736): Verify login using an invalid username and password', async ({ page }) => {
    // STEP 1-2: NAVIGATE and ASSERT the Login page is displayed with the Lesedi logo
    await gotoLogin(page);
    await expect(logo(page)).toBeVisible();

    // STEP 3: TYPE in an invalid Username and Password
    await usernameField(page).fill(BAD_USER);
    await passwordField(page).fill(BAD_PASS);
    await signInButton(page).click();

    // ASSERT the invalid-credentials error message is displayed
    await expect(toast(page)).toContainText(INVALID_CREDS, { timeout: 20_000 });

    // ASSERT (BLOCKING) the user remains on the Login page
    await expect(page).toHaveURL(/\/login/);
  });

  test('TC-04 (#112737): Verify login using an invalid password', async ({ page }) => {
    // STEP 1-2: NAVIGATE and ASSERT the Login page is displayed with the Lesedi logo
    await gotoLogin(page);
    await expect(logo(page)).toBeVisible();

    // STEP 3: TYPE in valid username
    await usernameField(page).fill(ADMIN.user);

    // STEP 4: TYPE in invalid password
    await passwordField(page).fill(BAD_PASS);

    // STEP 5: CLICK on Sign In
    await signInButton(page).click();

    // ASSERT the invalid-credentials error message is displayed
    await expect(toast(page)).toContainText(INVALID_CREDS, { timeout: 20_000 });

    // ASSERT (BLOCKING) the user remains on the Login page
    await expect(page).toHaveURL(/\/login/);
  });

  test('TC-05 (#112738): Verify mandatory username validation', async ({ page }) => {
    // STEP 1-2: NAVIGATE and ASSERT the Login page is displayed with the Lesedi logo
    await gotoLogin(page);
    await expect(logo(page)).toBeVisible();

    // STEP 3: Leave the Username field empty — ASSERT it remained empty
    await expect(usernameField(page)).toHaveValue('');

    // STEP 4: TYPE in valid Password
    await passwordField(page).fill(ADMIN.password);

    // STEP 5: CLICK on Sign In
    await signInButton(page).click();

    // STEP 6: ASSERT the message prescribed by ADO is displayed
    // NOTE: this expectation encodes a defect (raw .NET exception text) — see BUG-001.
    const messages = await collectMessages(page);
    expect(messages.join(' | '), `ADO #112738 expects the userNameOrEmailAddress null message; got ${JSON.stringify(messages)}`)
      .toContain("Value cannot be null. (Parameter 'userNameOrEmailAddress");

    // ASSERT (BLOCKING) the user remains on the Login page
    await expect(page).toHaveURL(/\/login/);
  });

  test('TC-06 (#112739): Verify mandatory password validation', async ({ page }) => {
    // STEP 1-2: NAVIGATE and ASSERT the Login page is displayed with the Lesedi logo
    await gotoLogin(page);
    await expect(logo(page)).toBeVisible();

    // STEP 3: TYPE in Username
    await usernameField(page).fill(ADMIN.user);

    // STEP 4: Leave the Password field empty — ASSERT it remained empty
    await expect(passwordField(page)).toHaveValue('');

    // STEP 5: CLICK on Sign In
    await signInButton(page).click();

    // STEP 6: ASSERT the message names the parameter prescribed by ADO
    // BUG-004: ADO #112739 expects 'userNameOrEmai lAddress' (the USERNAME parameter) on a PASSWORD case.
    // The app returns "Value cannot be null. (Parameter 'plainPassword')". Executed as written this fails.
    const messages = await collectMessages(page);
    expect(messages.join(' | '), `ADO #112739 expects the userNameOrEmailAddress null message; got ${JSON.stringify(messages)}`)
      .toContain("Value cannot be null. (Parameter 'userNameOrEmailAddress");

    // ASSERT (BLOCKING) the user remains on the Login page
    await expect(page).toHaveURL(/\/login/);
  });

  test('TC-07 (#112740): Verify mandatory username and password validation', async ({ page }) => {
    // STEP 1-2: NAVIGATE and ASSERT the Login page is displayed with the Lesedi logo
    await gotoLogin(page);
    await expect(logo(page)).toBeVisible();

    // STEP 3: Leave both fields blank — ASSERT they remained empty
    await expect(usernameField(page)).toHaveValue('');
    await expect(passwordField(page)).toHaveValue('');

    // STEP 4: CLICK on Sign In
    await signInButton(page).click();

    // STEP 5: ASSERT validation messages indicating the fields are required are displayed
    // BUG-002: the app currently shows nothing at all — the click is silently swallowed.
    const messages = await collectMessages(page);
    expect(messages.length, `ADO #112740 expects required-field validation messages; got ${JSON.stringify(messages)}`)
      .toBeGreaterThan(0);

    // ASSERT (BLOCKING) the user remains on the Login page and is not granted access
    await expect(page).toHaveURL(/\/login/);
  });

  test('TC-08 (#112741): Verify user logout', async ({ page }) => {
    // STEP 1-2: NAVIGATE to the login page
    await gotoLogin(page);

    // STEP 3-4: TYPE valid username and password
    await usernameField(page).fill(ADMIN.user);
    await passwordField(page).fill(ADMIN.password);
    await signInButton(page).click();
    await page.waitForURL(/\/dynamic\//, { timeout: 60_000 });
    await page.waitForLoadState('networkidle');

    // STEP 5: Navigate to the user profile menu — ASSERT the logout option is displayed
    // The avatar is NOT the trigger; the dropdown anchor inside .sha-profile-dropdown is, and it
    // opens on CLICK, not hover. The item renders as " Logout" (leading space from its icon), so
    // an anchored /^Logout$/ text match finds nothing — scope to the open dropdown and substring-match.
    await page.locator('.sha-profile-dropdown a.ant-dropdown-trigger').first().click();
    const logoutItem = page
      .locator('.ant-dropdown:not(.ant-dropdown-hidden) .ant-dropdown-menu-item')
      .filter({ hasText: /logout/i })
      .first();
    await expect(logoutItem).toBeVisible({ timeout: 15_000 });

    // STEP 6: CLICK the Logout option
    await logoutItem.click();

    // STEP 7: ASSERT (BLOCKING) the user is redirected to the login page
    await page.waitForURL(/\/login/, { timeout: 60_000 });
    await expect(page).toHaveURL(/\/login/);
    await expect(usernameField(page)).toBeVisible({ timeout: 30_000 });
  });
});
