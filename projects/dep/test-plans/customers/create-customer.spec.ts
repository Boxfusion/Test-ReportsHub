// AUTO-SCAFFOLDED from test-plans/customers/create-customer.md
// The .md plan is canonical. AI-repair will patch failing lines in this file.
// Do not hand-edit unless you are also updating the .md plan.
//
// NOTE: MCP browser was locked at create time, so Customers-specific selectors
// could not be recorded live. Login selectors are reused from
// create-service-request-v2.spec.ts (validated). All other selectors are
// emitted as `// TODO[selector]:` markers — AI-repair resolves them on first run.

import { test, expect, Page } from '@playwright/test';

const APP_URL = 'https://pd-dep-adminportal-test.shesha.app/';
const ADMIN = { user: 'admin', password: '123qwe' };

async function loginAsAdmin(page: Page) {
  await page.goto(APP_URL);
  await page.getByRole('textbox', { name: 'Username' }).fill(ADMIN.user);
  await page.getByRole('textbox', { name: 'Password' }).fill(ADMIN.password);
  await page.getByRole('button', { name: 'Sign In' }).click();
  await page.waitForLoadState('networkidle');
}

test.describe('Create Customer', () => {
  test('TC-01: Login as Admin', async ({ page }) => {
    // STEP 1: NAVIGATE to https://linux-dep-adminportal-test.azurewebsites.net/
    await page.goto(APP_URL);

    // STEP 2: SNAPSHOT — confirm login form is visible
    // SNAPSHOT: login form is visible

    // STEP 3: TYPE username field with `admin`
    await page.getByRole('textbox', { name: 'Username' }).fill(ADMIN.user);

    // STEP 4: TYPE password field with `123qwe`
    await page.getByRole('textbox', { name: 'Password' }).fill(ADMIN.password);

    // STEP 5: CLICK the login / sign-in button
    await page.getByRole('button', { name: 'Sign In' }).click();

    // STEP 6: WAIT for dashboard/home page to load
    await page.waitForLoadState('networkidle');

    // ASSERT (BLOCKING) dashboard or home page is visible after login
    await expect(page).not.toHaveURL(/login/i);
  });

  test('TC-02: Navigate to Customers', async ({ page }) => {
    await loginAsAdmin(page);

    // STEP 1: SNAPSHOT — confirm dashboard is loaded
    // SNAPSHOT: dashboard is loaded

    // STEP 2: CLICK the Customers tab in the navigation bar
    // TODO[selector]: Customers tab in nav bar — MCP unavailable at create time
    await page.getByRole('menuitem', { name: /Customers/i }).first().click();

    // STEP 3: WAIT for the Customers list page to load
    await page.waitForLoadState('networkidle');

    // STEP 4: SNAPSHOT — confirm Customers page is visible
    // SNAPSHOT: Customers page is visible

    // ASSERT (BLOCKING) Customers page is visible
    await expect(page).toHaveURL(/customers/i);
  });

  test('TC-03: Create a Customer', async ({ page }) => {
    await loginAsAdmin(page);
    // TODO[selector]: Customers tab in nav bar — MCP unavailable at create time
    await page.getByRole('menuitem', { name: /Customers/i }).first().click();
    await page.waitForLoadState('networkidle');

    // STEP 1: SNAPSHOT — confirm Customers page is loaded
    // SNAPSHOT: Customers page is loaded

    // STEP 2: CLICK the Create button
    // TODO[selector]: Create button on Customers page — MCP unavailable at create time
    await page.getByRole('button', { name: /^Create/i }).first().click();

    // STEP 3: WAIT for the create customer form/dialog to appear
    // TODO[selector]: create customer dialog — MCP unavailable at create time
    const dialog = page.getByRole('dialog');
    await expect(dialog).toBeVisible();

    // STEP 4: SNAPSHOT — confirm form is open and mandatory fields are visible
    // SNAPSHOT: form is open with mandatory fields

    // ASSERT create customer form is visible
    await expect(dialog).toBeVisible();

    // STEP 5: TYPE / SELECT each mandatory field on the form with valid values
    // TODO[selector]: mandatory customer fields — MCP unavailable at create time
    // AI-repair will replace these with the actual recorded selectors on first run.
    await dialog.getByRole('textbox').nth(0).fill('Automation Test Customer');

    // STEP 6: SNAPSHOT — confirm each mandatory field is populated
    // SNAPSHOT: mandatory fields populated

    // ASSERT all mandatory fields are populated before submit
    await expect(dialog.getByRole('textbox').nth(0)).not.toHaveValue('');

    // STEP 7: CLICK the OK button to submit
    // TODO[selector]: OK / submit button on customer form — MCP unavailable at create time
    await dialog.getByRole('button', { name: /^OK$/ }).click();

    // ASSERT OK button was clicked and form was submitted
    // (covered by waiting for confirmation below)

    // STEP 8: WAIT for the success message or customer reference to appear
    await page.waitForLoadState('networkidle');

    // STEP 9: SNAPSHOT — confirm success message is visible
    // SNAPSHOT: success message visible

    // ASSERT (BLOCKING) success message is visible after submit
    // TODO[assertion]: success message text/locator — MCP unavailable at create time
    await expect(dialog).toBeHidden({ timeout: 30_000 });
  });
});
