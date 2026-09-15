// AUTO-RECORDED from test-plans/Profile/verify-add-reference.md
// Source: Azure DevOps test plan #99437, suite #104586, test case #104649
// The .md plan is canonical. AI-repair will patch failing lines in this file.
// Do not hand-edit unless you are also updating the .md plan.
//
// References uses the same add-row table pattern as Skills/Languages, but
// with no per-field label element (labels are shared column headers), so
// fields are selected by ordinal position within the add row rather than by
// label proximity. This is the last step of the wizard — the footer button
// is "Complete", not "Next"; clicking it redirects to the Dashboard.

import { test, expect, Page, Locator } from '@playwright/test';

const APP_URL = 'https://pd-recruitment-publicportal-1-qa.shesha.app/';
const APPLICANT = { user: 'Fred', password: 'Metaganemr%03' };
const FULL_NAME = 'John Smith';
const RELATIONSHIP = 'Mentor';
const TEL_NO = '0784563546';

async function loginAsFred(page: Page) {
  await page.goto(`${APP_URL}login`);
  await page.locator('input[type="text"]').first().fill(APPLICANT.user);
  await page.locator('input[type="password"]').first().fill(APPLICANT.password);
  await page.getByRole('button', { name: /sign in/i }).click();
  await page.waitForURL(url => !url.href.includes('/login'), { timeout: 30000 });
  await page.waitForLoadState('networkidle');
}

async function goToReferences(page: Page) {
  await page.getByRole('link', { name: 'Manage Profile' }).click();
  await page.waitForLoadState('networkidle');
  await page.getByRole('button', { name: 'References' }).click();
  await page.waitForTimeout(1500);
  if (!(await page.getByRole('heading', { name: 'References' }).isVisible().catch(() => false))) {
    await page.getByRole('button', { name: 'References' }).click();
    await page.waitForTimeout(1500);
  }
}

function addRow(page: Page): Locator {
  return page.getByRole('row', { name: 'plus-circle close-circle' });
}

// Deletes every row matching fullName, confirming the delete popover each time.
async function deleteReferenceRows(page: Page, fullName: string) {
  let guard = 0;
  while ((await page.getByRole('row', { name: new RegExp(fullName) }).count()) > 0 && guard < 10) {
    guard++;
    await page.getByRole('row', { name: new RegExp(fullName) }).first().getByRole('button', { name: 'delete' }).first().click();
    await page.waitForTimeout(400);
    await page.getByRole('button', { name: 'OK' }).click();
    await page.waitForTimeout(800);
  }
}

async function addReference(page: Page) {
  await deleteReferenceRows(page, FULL_NAME);
  const rowInputs = addRow(page).locator('input');
  await rowInputs.nth(0).fill(FULL_NAME);
  await rowInputs.nth(1).fill(RELATIONSHIP);
  await rowInputs.nth(2).fill(TEL_NO);
  await addRow(page).locator('button[title="Add"]').click();
  await page.waitForTimeout(1200);
}

test.describe('PROFILE-104649 — Add Reference', () => {
  test.describe.configure({ mode: 'serial' });

  test('TC-01: Login as Fred', async ({ page }) => {
    // STEP 1-5: NAVIGATE, TYPE Username/Password, CLICK Sign In
    await loginAsFred(page);
    // ASSERT (BLOCKING) URL no longer contains /login and Dashboard is visible
    await expect(page).not.toHaveURL(/login/i);
    await expect(page.getByText('Your Dashboard')).toBeVisible({ timeout: 30000 });
  });

  test('TC-02: Click on References tab', async ({ page }) => {
    await loginAsFred(page);
    // STEP: CLICK Manage Profile, then CLICK the References step
    await goToReferences(page);
    // ASSERT (BLOCKING) References heading visible
    await expect(page.getByRole('heading', { name: 'References' })).toBeVisible({ timeout: 15000 });
  });

  test('TC-03: Populate Full Name', async ({ page }) => {
    await loginAsFred(page);
    await goToReferences(page);
    await deleteReferenceRows(page, FULL_NAME);

    // STEP: TYPE full name in the add row
    const fullNameField = addRow(page).locator('input').nth(0);
    await fullNameField.fill(FULL_NAME);
    // ASSERT (BLOCKING) field contains the typed value
    await expect(fullNameField).toHaveValue(FULL_NAME);
  });

  test('TC-04: Populate Relationship to you', async ({ page }) => {
    await loginAsFred(page);
    await goToReferences(page);
    await deleteReferenceRows(page, FULL_NAME);
    await addRow(page).locator('input').nth(0).fill(FULL_NAME);

    // STEP: TYPE relationship in the add row
    const relationshipField = addRow(page).locator('input').nth(1);
    await relationshipField.fill(RELATIONSHIP);
    // ASSERT (BLOCKING) field contains the typed value
    await expect(relationshipField).toHaveValue(RELATIONSHIP);
  });

  test('TC-05: Populate Tel No', async ({ page }) => {
    await loginAsFred(page);
    await goToReferences(page);
    await deleteReferenceRows(page, FULL_NAME);
    await addRow(page).locator('input').nth(0).fill(FULL_NAME);
    await addRow(page).locator('input').nth(1).fill(RELATIONSHIP);

    // STEP: TYPE phone number in the add row
    const telField = addRow(page).locator('input').nth(2);
    await telField.fill(TEL_NO);
    // ASSERT (BLOCKING) field contains the typed value
    await expect(telField).toHaveValue(TEL_NO);
  });

  test('TC-06: Click the Add icon', async ({ page }) => {
    await loginAsFred(page);
    await goToReferences(page);
    await addReference(page);
    // ASSERT (BLOCKING) new row visible in the table; Complete enabled
    await expect(page.getByRole('row', { name: new RegExp(FULL_NAME) })).toBeVisible({ timeout: 10000 });
    await expect(page.getByRole('button', { name: 'Complete' })).toBeEnabled();
  });

  test('TC-07: Click Complete button', async ({ page }) => {
    await loginAsFred(page);
    await goToReferences(page);
    await addReference(page);

    // STEP: CLICK the Complete button
    await page.getByRole('button', { name: 'Complete' }).click();
    await page.waitForTimeout(2500);
    // ASSERT (BLOCKING) redirected to the dashboard; profile shows 100% Complete
    await expect(page).toHaveURL(/dashboard/i, { timeout: 15000 });
    await expect(page.getByText('100% Complete').first()).toBeVisible({ timeout: 10000 });
  });
});
