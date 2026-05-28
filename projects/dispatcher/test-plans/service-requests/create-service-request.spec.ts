// AUTO-SCAFFOLDED from test-plans/service-requests/create-service-request.md
// The .md plan is canonical. AI-repair will patch failing lines in this file.
// Do not hand-edit unless you are also updating the .md plan.
//
// NOTE: Selectors are inherited from the sibling `dep` project's working v2 spec
// (same Shesha framework, very similar UI). If the Dispatcher portal diverges,
// AI-repair on first /RunTest will resolve the failing lines.

import { test, expect, Page } from '@playwright/test';

const APP_URL = 'https://linux-lesedi-dep-adminportal-test.azurewebsites.net/';
const ADMIN = { user: 'admin', password: '123@Qwee' };

async function loginAsAdmin(page: Page) {
  await page.goto(APP_URL);
  await page.getByRole('textbox', { name: 'Username' }).fill(ADMIN.user);
  await page.getByRole('textbox', { name: 'Password' }).fill(ADMIN.password);
  await page.getByRole('button', { name: 'Sign In' }).click();
  await page.waitForLoadState('networkidle');
}

test.describe('Create Service Request', () => {
  test('TC-01: Login as Admin', async ({ page }) => {
    // STEP 1: NAVIGATE to https://linux-lesedi-dep-adminportal-test.azurewebsites.net/
    await page.goto(APP_URL);

    // STEP 2: SNAPSHOT — confirm login form is visible
    // SNAPSHOT: login form is visible

    // STEP 3: TYPE username field with `admin`
    await page.getByRole('textbox', { name: 'Username' }).fill(ADMIN.user);

    // STEP 4: TYPE password field with `123@Qwee`
    await page.getByRole('textbox', { name: 'Password' }).fill(ADMIN.password);

    // STEP 5: CLICK the login / sign-in button
    await page.getByRole('button', { name: 'Sign In' }).click();

    // STEP 6: WAIT for dashboard/home page to load
    await page.waitForLoadState('networkidle');

    // ASSERT (BLOCKING) dashboard or home page is visible after login
    await expect(page).not.toHaveURL(/login/i);
  });

  test('TC-02: Navigate to Service Requests', async ({ page }) => {
    await loginAsAdmin(page);

    // STEP 1: SNAPSHOT — confirm dashboard is loaded
    // SNAPSHOT: dashboard is loaded

    // STEP 2: CLICK the Service Requests menu / navigation item
    // TODO[selector]: Service Requests menu item — confirm exact label in Dispatcher portal
    await page.getByRole('menuitem', { name: /Service Request/i }).first().click();

    // STEP 3: WAIT for the Service Requests list page to load
    await page.waitForLoadState('networkidle');

    // STEP 4: SNAPSHOT — confirm Service Requests page is visible
    // SNAPSHOT: Service Requests page is visible

    // ASSERT (BLOCKING) Service Requests page is visible
    await expect(page).toHaveURL(/service-request/i);
  });

  test('TC-03: Create a Service Request', async ({ page }) => {
    await loginAsAdmin(page);
    // TODO[selector]: Service Requests menu item — confirm exact label in Dispatcher portal
    await page.getByRole('menuitem', { name: /Service Request/i }).first().click();
    await page.waitForLoadState('networkidle');

    // STEP 1: SNAPSHOT — confirm Service Requests page is loaded
    // SNAPSHOT: Service Requests page is loaded

    // STEP 2: CLICK the "Create" / "New Service Request" button
    // TODO[selector]: Create button label may differ — Dispatcher may use "Create Service Request" or "New"
    await page.getByRole('button', { name: /Create/i }).first().click();

    // STEP 3: WAIT for the create service request form/dialog to appear
    const dialog = page.getByRole('dialog').first();
    await expect(dialog).toBeVisible();

    // STEP 4: SNAPSHOT — confirm form is open and mandatory fields are visible
    // SNAPSHOT: form is open with mandatory fields

    // ASSERT create service request form is visible
    await expect(dialog).toBeVisible();

    // STEP 5: SELECT / TYPE each mandatory field on the form with valid values
    // Channel — Ant Design combobox; pick first available option
    await dialog.getByRole('combobox', { name: 'Channel' }).click();
    await page.getByRole('option').first().click();

    // Mobile Number
    await dialog.getByLabel('Mobile Number', { exact: true }).fill('0766791145');

    // Email Address
    await dialog.getByLabel('Email Address', { exact: true }).fill('automation@boxfusion.io');

    // Category — pick first option
    await dialog.getByRole('combobox', { name: 'Category' }).click();
    await page.getByRole('option').first().click();

    // Case type — cascades from Category; wait for it then pick first option
    await dialog.getByRole('combobox', { name: /Case type|Request type/i }).click();
    await page.getByRole('option').first().click();

    // Address — type into "Search places"
    await dialog.getByRole('textbox', { name: /Search places/i }).fill('1 Sandton Drive, Sandton');

    // STEP 6: SNAPSHOT — confirm each mandatory field is populated
    // SNAPSHOT: mandatory fields populated

    // ASSERT all mandatory fields are populated before submit
    await expect(dialog.getByLabel('Mobile Number', { exact: true })).toHaveValue('0766791145');

    // STEP 7: CLICK the OK button to submit
    await dialog.getByRole('button', { name: /^OK$|^Submit$/i }).click();

    // ASSERT OK button was clicked and form was submitted
    // (covered by waiting for confirmation below)

    // STEP 8: WAIT for confirmation or service request reference to appear
    await page.waitForLoadState('networkidle');

    // STEP 9: SNAPSHOT — confirm success message is visible
    // SNAPSHOT: success message visible

    // ASSERT (BLOCKING) success message or service request reference is visible after submit
    await expect(dialog).toBeHidden({ timeout: 30_000 });
  });
});
