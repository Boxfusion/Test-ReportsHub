// AUTO-RECORDED from test-plans/auth/login-navigate-to-leads.md
// The .md plan is canonical. AI-repair will patch failing lines in this file.
// Do not hand-edit unless you are also updating the .md plan.
//
// Selectors recorded live against Land Bank CRM Dev on 2026-07-30:
//   - Login inputs are placeholder-labelled ("Username" / "Password"); no <label for> associations.
//   - Two primary buttons exist ("Sign In", "Sign in with Microsoft") — Sign In needs exact: true.
//   - Post-login landing route is /dynamic/user-dashboard.
//   - The Ant Design side-menu <li> has role="menuitem" but no accessible name, so "Leads"
//     resolves as role=link (verified: menuitem -> 0 matches, link -> 1 match).
//   - Leads page: h4 heading "All Leads", one data grid, and a "New Lead" toolbar button.

import { test, expect, Page } from '@playwright/test';

// Environment & credentials come from process.env, loaded from a gitignored .env by
// playwright.config.ts (real env vars / CI secrets always win). NEVER hardcode a
// username, password, or token here — this file is committed and synced to the hub.
//   Site  : baseURL is resolved in playwright.config.ts from TEST_ENV + <ENV>_APP_URL
//           (e.g. TEST_ENV=dev → DEV_APP_URL), or a plain APP_URL. Use RELATIVE paths below.
//   Creds : per role, .env defines <ROLE>_USERNAME / <ROLE>_PASSWORD (e.g. ADMIN_USERNAME).

const LEADS_PATH = '/dynamic/LandBank.Crm/LBLead-table';

function credsFor(role: string) {
  const key = role.toUpperCase();
  const user = process.env[`${key}_USERNAME`];
  const password = process.env[`${key}_PASSWORD`];
  if (!user || !password) {
    throw new Error(
      `Missing credentials for role "${role}". Set ${key}_USERNAME and ${key}_PASSWORD ` +
      `in .env (copy .env.example) or as CI secrets — see CLAUDE.md → Credentials.`
    );
  }
  return { user, password };
}

// Log in as any role defined in .env. Defaults to ADMIN.
async function loginAs(page: Page, role: string = 'ADMIN') {
  const { user, password } = credsFor(role);
  await page.goto('/login');
  // STEP login.1: TYPE the Username field with the admin username (from `.env`)
  await page.getByPlaceholder('Username').fill(user);
  // STEP login.2: TYPE the Password field with the admin password (from `.env`)
  await page.getByPlaceholder('Password').fill(password);
  // STEP login.3: CLICK **Sign In**
  await page.getByRole('button', { name: 'Sign In', exact: true }).click();
  // STEP login.4: WAIT for the app to redirect away from `/login`
  await page.waitForURL((url) => !url.href.includes('/login'), { timeout: 40000 });
  await page.waitForLoadState('networkidle').catch(() => {});
}

test.describe('AUTH-1.1 — Login and Navigate to Leads', () => {
  test('TC-01: Log in to Land Bank CRM as an Admin', async ({ page }) => {
    const { user, password } = credsFor('ADMIN');

    // STEP 1: NAVIGATE to `/login`
    await page.goto('/login');

    // SNAPSHOT: confirm the login form (Username + Password fields, Sign In button) is rendered
    await expect(page.getByPlaceholder('Username')).toBeVisible({ timeout: 30000 });

    // STEP 2: TYPE the Username field with the admin username (from `.env`)
    await page.getByPlaceholder('Username').fill(user);

    // SNAPSHOT: confirm the Password field is rendered
    await expect(page.getByPlaceholder('Password')).toBeVisible();

    // STEP 3: TYPE the Password field with the admin password (from `.env`)
    await page.getByPlaceholder('Password').fill(password);

    // SNAPSHOT: confirm the **Sign In** button is enabled
    await expect(page.getByRole('button', { name: 'Sign In', exact: true })).toBeEnabled();

    // STEP 4: CLICK **Sign In**
    await page.getByRole('button', { name: 'Sign In', exact: true }).click();

    // STEP 5: WAIT for the app to redirect away from `/login`
    await page.waitForURL((url) => !url.href.includes('/login'), { timeout: 40000 });

    // ASSERT (BLOCKING): the app redirects away from `/login`
    expect(page.url()).not.toContain('/login');

    // ASSERT: the authenticated shell is displayed — the side menu shows the **Leads** item
    await expect(page.getByRole('link', { name: 'Leads', exact: true })).toBeVisible({ timeout: 30000 });
  });

  test('TC-02: Navigate to Leads from the side menu', async ({ page }) => {
    await loginAs(page, 'ADMIN');

    // SNAPSHOT: confirm the side menu is rendered and the **Leads** item is visible
    await expect(page.getByRole('link', { name: 'Leads', exact: true })).toBeVisible({ timeout: 30000 });

    // STEP 1: CLICK the **Leads** item in the side menu
    await page.getByRole('link', { name: 'Leads', exact: true }).click();

    // STEP 2: WAIT for the Leads listing to load
    await page.waitForURL(new RegExp(LEADS_PATH.replace(/\./g, '\\.')), { timeout: 30000 });
    await page.waitForLoadState('networkidle').catch(() => {});

    // SNAPSHOT: confirm the Leads page heading, grid, and toolbar
    // ASSERT (BLOCKING): the **All Leads** heading is displayed
    await expect(page.getByRole('heading', { name: 'All Leads' })).toBeVisible({ timeout: 30000 });

    // ASSERT: the URL is the Leads listing route (`/dynamic/LandBank.Crm/LBLead-table`)
    expect(page.url()).toContain(LEADS_PATH);

    // ASSERT: the Leads data grid is displayed
    await expect(page.getByRole('table')).toBeVisible({ timeout: 30000 });

    // ASSERT: the **New Lead** toolbar button is displayed
    await expect(page.getByRole('button', { name: 'New Lead' })).toBeVisible();
  });
});
