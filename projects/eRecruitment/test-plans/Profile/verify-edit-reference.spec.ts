// AUTO-RECORDED from test-plans/Profile/verify-edit-reference.md
// Source: Azure DevOps test plan #99437, suite #104586, test case #104651
// The .md plan is canonical. AI-repair will patch failing lines in this file.
// Do not hand-edit unless you are also updating the .md plan.
//
// Steps 1-4 are the same add flow as verify-add-reference.spec.ts. Editing
// is inline in the row (button[title="Edit"] / button[title="Save"]), same
// pattern as verify-edit-tertiary-qualification.spec.ts / verify-edit-work-experience.spec.ts
// / verify-edit-skills.spec.ts — no decoy icons interfered here.

import { test, expect, Page, Locator } from '@playwright/test';

const APP_URL = 'https://pd-recruitment-publicportal-1-qa.shesha.app/';
const APPLICANT = { user: 'Fred', password: 'Metaganemr%03' };
const FULL_NAME = 'John Smith';
const RELATIONSHIP = 'Mentor';
const TEL_NO = '0784563546';
const UPDATED_NAME = 'Sam Jones';

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

// Deletes every row matching name, confirming the delete popover each time.
async function deleteReferenceRows(page: Page, name: string) {
  let guard = 0;
  while ((await page.getByRole('row', { name: new RegExp(name) }).count()) > 0 && guard < 10) {
    guard++;
    await page.getByRole('row', { name: new RegExp(name) }).first().getByRole('button', { name: 'delete' }).first().click();
    await page.waitForTimeout(400);
    await page.getByRole('button', { name: 'OK' }).click();
    await page.waitForTimeout(800);
  }
}

async function addReference(page: Page) {
  await deleteReferenceRows(page, FULL_NAME);
  await deleteReferenceRows(page, UPDATED_NAME);
  const rowInputs = addRow(page).locator('input');
  await rowInputs.nth(0).fill(FULL_NAME);
  await rowInputs.nth(1).fill(RELATIONSHIP);
  await rowInputs.nth(2).fill(TEL_NO);
  await addRow(page).locator('button[title="Add"]').click();
  await page.waitForTimeout(1200);
}

test.describe('PROFILE-104651 — Edit Reference', () => {
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
    await deleteReferenceRows(page, UPDATED_NAME);

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
    // ASSERT (BLOCKING) new row visible in the table; Complete enabled
    await expect(page.getByRole('row', { name: new RegExp(FULL_NAME) })).toBeVisible({ timeout: 10000 });
    await expect(page.getByRole('button', { name: 'Complete' })).toBeEnabled();
  });

  test('TC-05: Click the Edit icon on the added reference', async ({ page }) => {
    await loginAsFred(page);
    await goToReferences(page);
    await addReference(page);

    // STEP: CLICK the Edit icon on the "John Smith" row
    await page.getByRole('row', { name: new RegExp(FULL_NAME) }).locator('button[title="Edit"]').click();
    await page.waitForTimeout(800);
    // ASSERT (BLOCKING) a Save icon is visible, confirming edit mode is active
    await expect(page.locator('button[title="Save"]')).toBeVisible({ timeout: 10000 });
  });

  test('TC-06: Edit Full Name and click Save', async ({ page }) => {
    await loginAsFred(page);
    await goToReferences(page);
    await addReference(page);
    await page.getByRole('row', { name: new RegExp(FULL_NAME) }).locator('button[title="Edit"]').click();
    await page.waitForTimeout(800);

    // STEP: UPDATE the Full Name field to "Sam Jones"
    // the currently-editing row is the one containing the visible Save icon
    const editingRow = page.getByRole('row').filter({ has: page.locator('button[title="Save"]') });
    const nameInput = editingRow.locator('input').first();
    await nameInput.fill(UPDATED_NAME);
    // ASSERT (BLOCKING) the row's Full Name input contains "Sam Jones" before saving
    await expect(nameInput).toHaveValue(UPDATED_NAME);

    // STEP: CLICK the Save icon
    await page.locator('button[title="Save"]').click();
    await page.waitForTimeout(1200);
    // ASSERT (BLOCKING) a "Sam Jones" row is visible after saving
    await expect(page.getByRole('row', { name: new RegExp(UPDATED_NAME) })).toBeVisible({ timeout: 10000 });
  });
});
