// AUTO-RECORDED from test-plans/HCM/eLeave/close-leave-application.md
// The .md plan is canonical. AI-repair will patch failing lines in this file.
// Do not hand-edit unless you are also updating the .md plan.
//
// Selectors recorded live against QA on 2026-10-07. Each TC opens a fresh, unsaved draft from
// My Items → Create New → New Leave Application, so no seeded data is needed and nothing is submitted.

import { test, expect, Page, Locator } from '@playwright/test';

const APP_URL = 'https://pd-hcm-adminportal-qa.shesha.app/';
const APPLICANT = { user: 'GOV003', password: '123qwe' };
const MY_ITEMS_URL = `${APP_URL}dynamic/SaGov.Leave/my_items2`;
const NAV_TIMEOUT = 30000;

// Let the current page finish loading before an action that navigates away. Shesha pages keep
// loading data after render, and navigating mid-load makes runs flaky.
async function beforeNavigate(page: Page) {
  await page.waitForLoadState('networkidle', { timeout: NAV_TIMEOUT }).catch(() => {});
  await page.waitForTimeout(1000);
}

async function loginAs(page: Page, account: { user: string; password: string }) {
  await page.goto(`${APP_URL}login`, { timeout: NAV_TIMEOUT });
  await beforeNavigate(page);
  // STEP login.1: TYPE Username field
  await page.getByRole('textbox', { name: 'Username' }).fill(account.user);
  // STEP login.2: TYPE Password field
  await page.getByRole('textbox', { name: 'Password' }).fill(account.password);
  // STEP login.3: CLICK the Sign In button
  await page.getByRole('button', { name: 'Sign In' }).click();
  await page.waitForURL(url => !url.href.includes('/login'), { timeout: NAV_TIMEOUT });
  await beforeNavigate(page);
}

const closeDialog = (page: Page): Locator => page.getByRole('dialog', { name: 'Close Leave Application' });
// `exact` keeps this off the dialog's own "Close" (X) icon button.
const closeButton = (page: Page): Locator => page.getByRole('button', { name: 'Close', exact: true }).first();

// Steps 1–7, shared by every TC: open a fresh draft and bring up the Close Leave Application dialog.
async function openCloseDialog(page: Page) {
  // STEP 1: NAVIGATE to My Items (`/dynamic/SaGov.Leave/my_items2`)
  await page.goto(MY_ITEMS_URL, { timeout: NAV_TIMEOUT });
  await expect(page.getByRole('heading', { name: 'My Items' })).toBeVisible({ timeout: NAV_TIMEOUT });
  await beforeNavigate(page);
  // STEP 2: SNAPSHOT — confirm the Create New button
  // SNAPSHOT: Create New button
  // The dropdown closes if the My Items grid re-renders while it is open, so retry open + pick together.
  await expect(async () => {
    // STEP 3: CLICK the Create New button, then CLICK New Leave Application
    await page.getByRole('button', { name: 'plus Create New down' }).click();
    await page.getByRole('link', { name: 'New Leave Application' }).click({ timeout: 3000 });
  }).toPass({ timeout: 30000 });
  // STEP 4: ASSERT the New Leave Application draft page is displayed (URL contains `sagov-leave-application-draft`)
  await expect(page).toHaveURL(/sagov-leave-application-draft/, { timeout: NAV_TIMEOUT });
  await expect(page.getByRole('radio', { name: 'Myself' })).toBeChecked({ timeout: NAV_TIMEOUT });
  // STEP 5: SNAPSHOT — confirm the Close button
  // SNAPSHOT: Close button
  await beforeNavigate(page);
  // STEP 6: CLICK the Close button
  await closeButton(page).click();
  // STEP 7: ASSERT the 'Close Leave Application' dialog is displayed with the message "You are about close the Leave Application, do you wish to proceed?"
  await expect(closeDialog(page)).toBeVisible({ timeout: 10000 });
  await expect(closeDialog(page)).toContainText('You are about close the Leave Application, do you wish to proceed?');
}

test.describe('ELEAVE-CLOSE — Close Leave Application', () => {
  test('TC-01: Login as Leave Applicant (GOV003)', async ({ page }) => {
    // STEP 1: NAVIGATE to https://pd-hcm-adminportal-qa.shesha.app/
    // STEP 2: SNAPSHOT — confirm login page is visible
    // STEP 3: TYPE Username field with `GOV003`
    // STEP 4: TYPE Password field with `123qwe`
    // STEP 5: CLICK the Sign In button
    // STEP 6: WAIT for the home page / workflow inbox to load
    await loginAs(page, APPLICANT);

    // ASSERT (BLOCKING): URL no longer contains `/login` and the authenticated home page is visible
    await expect(page).not.toHaveURL(/\/login/);
    await expect(page.getByRole('menuitem', { name: 'apartment Workflows' })).toBeVisible({ timeout: NAV_TIMEOUT });
  });

  // ADO Test Case #86518: https://dev.azure.com/boxfusion/pd-Hcm/_workitems/edit/86518
  test("TC-02: System should close the leave application when 'Ok' button is clicked", async ({ page }) => {
    await loginAs(page, APPLICANT);
    await openCloseDialog(page);
    // STEP 8: SNAPSHOT — confirm the 'OK' button in the dialog
    // SNAPSHOT: OK button in the dialog
    // STEP 9: CLICK the 'OK' button
    await closeDialog(page).getByRole('button', { name: 'OK' }).click();

    // ASSERT (BLOCKING): The leave application is closed — the 'Close Leave Application' dialog disappears and the user leaves the draft page
    await expect(closeDialog(page)).toBeHidden({ timeout: 15000 });
    await expect(page).not.toHaveURL(/sagov-leave-application-draft/, { timeout: NAV_TIMEOUT });
  });

  // ADO Test Case #86519: https://dev.azure.com/boxfusion/pd-Hcm/_workitems/edit/86519
  test("TC-03: System should redirect the user to the Home page when 'Ok' button is clicked", async ({ page }) => {
    await loginAs(page, APPLICANT);
    await openCloseDialog(page);
    // STEP 8: SNAPSHOT — confirm the 'OK' button in the dialog
    // SNAPSHOT: OK button in the dialog
    // STEP 9: CLICK the 'OK' button
    await closeDialog(page).getByRole('button', { name: 'OK' }).click();

    // ASSERT (BLOCKING): The user is redirected to the Home page (URL no longer contains `sagov-leave-application-draft`)
    await expect(page).not.toHaveURL(/sagov-leave-application-draft/, { timeout: NAV_TIMEOUT });
    await expect(closeDialog(page)).toBeHidden();
  });

  // ADO Test Case #86521: https://dev.azure.com/boxfusion/pd-Hcm/_workitems/edit/86521
  test("TC-04: Clicking the 'Cancel' button should close the dialog", async ({ page }) => {
    await loginAs(page, APPLICANT);
    await openCloseDialog(page);
    // STEP 8: SNAPSHOT — confirm the 'Cancel' button in the dialog
    // SNAPSHOT: Cancel button in the dialog
    // STEP 9: CLICK the 'Cancel' button
    await closeDialog(page).getByRole('button', { name: 'Cancel' }).click();

    // ASSERT (BLOCKING): The 'Close Leave Application' dialog is no longer visible
    await expect(closeDialog(page)).toBeHidden({ timeout: 10000 });
  });

  // ADO Test Case #86522: https://dev.azure.com/boxfusion/pd-Hcm/_workitems/edit/86522
  test("TC-05: Clicking the 'Cancel' button should display the 'New Leave Application' page", async ({ page }) => {
    await loginAs(page, APPLICANT);
    await openCloseDialog(page);
    // STEP 8: SNAPSHOT — confirm the 'Cancel' button in the dialog
    // SNAPSHOT: Cancel button in the dialog
    // STEP 9: CLICK the 'Cancel' button
    await closeDialog(page).getByRole('button', { name: 'Cancel' }).click();

    // ASSERT (BLOCKING): The 'New Leave Application' draft page is still displayed (URL contains `sagov-leave-application-draft` and the Close button is visible)
    await expect(closeDialog(page)).toBeHidden({ timeout: 10000 });
    await expect(page).toHaveURL(/sagov-leave-application-draft/);
    await expect(closeButton(page)).toBeVisible();
  });
});
