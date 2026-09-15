// AUTO-RECORDED from test-plans/Profile/verify-delete-reference.md
// Source: Azure DevOps test plan #99437, suite #104586, test case #104652
// The .md plan is canonical. AI-repair will patch failing lines in this file.
// Do not hand-edit unless you are also updating the .md plan.
//
// Steps 1-4 are the same add flow as verify-add-reference.spec.ts. The
// confirmation popover text is "Are you sure want to delete this item?"
// with Cancel/OK buttons, same as every other delete flow in this suite.

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

test.describe('PROFILE-104652 — Delete Reference', () => {
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

  test('TC-03: Populate Full Name, Relationship, and Tel No', async ({ page }) => {
    await loginAsFred(page);
    await goToReferences(page);
    await deleteReferenceRows(page, FULL_NAME);

    // STEP: TYPE full name, relationship, and phone number in the add row
    const rowInputs = addRow(page).locator('input');
    const fullNameField = rowInputs.nth(0);
    const relationshipField = rowInputs.nth(1);
    const telField = rowInputs.nth(2);
    await fullNameField.fill(FULL_NAME);
    await relationshipField.fill(RELATIONSHIP);
    await telField.fill(TEL_NO);
    // ASSERT (BLOCKING) all three fields contain the typed values
    await expect(fullNameField).toHaveValue(FULL_NAME);
    await expect(relationshipField).toHaveValue(RELATIONSHIP);
    await expect(telField).toHaveValue(TEL_NO);
  });

  test('TC-04: Click the Add icon', async ({ page }) => {
    await loginAsFred(page);
    await goToReferences(page);
    await addReference(page);
    // ASSERT (BLOCKING) new row visible in the table
    await expect(page.getByRole('row', { name: new RegExp(FULL_NAME) }).first()).toBeVisible({ timeout: 10000 });
  });

  test('TC-05: Click the Delete icon on the added reference', async ({ page }) => {
    await loginAsFred(page);
    await goToReferences(page);
    await addReference(page);

    // STEP: CLICK the Delete icon on the "John Smith" row
    await page.getByRole('row', { name: new RegExp(FULL_NAME) }).first().getByRole('button', { name: 'delete' }).click();
    await page.waitForTimeout(500);
    // ASSERT (BLOCKING) confirmation popover with Cancel and OK is visible
    const popover = page.locator('.ant-popover, .ant-popconfirm');
    await expect(popover).toBeVisible({ timeout: 10000 });
    await expect(popover.getByRole('button', { name: 'Cancel' })).toBeVisible();
    await expect(popover.getByRole('button', { name: 'OK' })).toBeVisible();
  });

  test('TC-06: Click OK button', async ({ page }) => {
    await loginAsFred(page);
    await goToReferences(page);
    await addReference(page);
    await page.getByRole('row', { name: new RegExp(FULL_NAME) }).first().getByRole('button', { name: 'delete' }).click();
    await page.waitForTimeout(500);

    // STEP: CLICK the OK button
    await page.getByRole('button', { name: 'OK' }).click();
    await page.waitForTimeout(1000);
    // ASSERT (BLOCKING) the "John Smith" row is no longer visible
    await expect(page.getByRole('row', { name: new RegExp(FULL_NAME) })).toHaveCount(0);
  });
});
