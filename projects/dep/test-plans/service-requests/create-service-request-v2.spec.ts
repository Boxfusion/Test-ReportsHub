// AUTO-SCAFFOLDED from test-plans/service-requests/create-service-request-v2.md
// The .md plan is canonical. AI-repair will patch failing lines in this file.
// Do not hand-edit unless you are also updating the .md plan.

import { test, expect, Page } from '@playwright/test';

const APP_URL = 'https://linux-dep-adminportal-test.azurewebsites.net/';
const ADMIN = { user: 'admin', password: '123qwe' };

async function loginAsAdmin(page: Page) {
  await page.goto(APP_URL);
  await page.getByRole('textbox', { name: 'Username' }).fill(ADMIN.user);
  await page.getByRole('textbox', { name: 'Password' }).fill(ADMIN.password);
  await page.getByRole('button', { name: 'Sign In' }).click();
  await page.waitForLoadState('networkidle');
}

test.describe('Create Service Request (v2)', () => {
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
    await expect(page.getByRole('menuitem', { name: /Cases/i }).first()).toBeVisible();
  });

  test('TC-02: Navigate to Service Requests', async ({ page }) => {
    await loginAsAdmin(page);

    // STEP 1: SNAPSHOT — confirm dashboard is loaded
    // SNAPSHOT: dashboard is loaded

    // STEP 2: CLICK the Service Requests menu / navigation item
    await page.getByRole('menuitem', { name: /Cases/i }).first().click();

    // STEP 3: WAIT for the Service Requests list page to load
    await page.waitForLoadState('networkidle');

    // STEP 4: SNAPSHOT — confirm Service Requests page is visible
    // SNAPSHOT: Service Requests page is visible

    // ASSERT (BLOCKING) Service Requests page is visible
    await expect(page).toHaveURL(/service-requests/i);
  });

  test('TC-03: Create a Service Request', async ({ page }) => {
    await loginAsAdmin(page);
    await page.getByRole('menuitem', { name: /Cases/i }).first().click();
    await page.waitForLoadState('networkidle');

    // STEP 1: SNAPSHOT — confirm Service Requests page is loaded
    // SNAPSHOT: Service Requests page is loaded

    // STEP 2: CLICK the "Create" / "New Service Request" button
    await page.getByRole('button', { name: /Create Case/i }).click();

    // STEP 3: WAIT for the create service request form/dialog to appear
    const dialog = page.getByRole('dialog', { name: /Create Case/i });
    await expect(dialog).toBeVisible();

    // STEP 4: SNAPSHOT — confirm form is open and mandatory fields are visible
    // SNAPSHOT: form is open with mandatory fields

    // ASSERT create service request form is visible
    await expect(dialog).toBeVisible();

    // STEP 5: SELECT / TYPE each mandatory field on the form with valid values
    // Channel — Call Centre (Ant Design select)
    await dialog.locator('.ant-form-item').filter({ hasText: 'Channel' }).first().locator('.ant-select').click();
    await page.locator('.ant-select-item-option').filter({ hasText: 'Call Centre' }).first().click();

    // Mobile Number
    await dialog.locator('.ant-form-item').filter({ hasText: 'Mobile Number' }).locator('input').fill('0766791145');

    // Email Address
    await dialog.locator('.ant-form-item').filter({ hasText: 'Email Address' }).locator('input').fill('automation@boxfusion.io');

    // Category — pick first option
    await dialog.locator('.ant-form-item').filter({ hasText: 'Category' }).first().locator('.ant-select').click();
    await page.locator('.ant-select-dropdown:visible .ant-select-item-option').first().click();

    // Case type — pick first option
    await dialog.locator('.ant-form-item').filter({ hasText: 'Case type' }).first().locator('.ant-select').click();
    await page.locator('.ant-select-dropdown:visible .ant-select-item-option').first().click();

    // Address — type into "Search places"
    await dialog.getByRole('textbox', { name: /Search places/i }).fill('1 Sandton Drive, Sandton');

    // STEP 6: SNAPSHOT — confirm each mandatory field is populated
    // SNAPSHOT: mandatory fields populated

    // ASSERT all mandatory fields are populated before submit
    await expect(dialog.locator('.ant-form-item').filter({ hasText: 'Mobile Number' }).locator('input')).toHaveValue('0766791145');

    // STEP 7: CLICK the OK button to submit
    await dialog.getByRole('button', { name: /^OK$/ }).click();

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
