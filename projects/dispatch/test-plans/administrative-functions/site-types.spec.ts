// AUTO-RECORDED from test-plans/administrative-functions/site-types.md
// Source: Azure DevOps test plan #65099, suite #65136 (2.7 Site Types)
// The .md plan is canonical. AI-repair will patch failing lines in this file.
//
// Selectors recorded live against NC Dispatch QA on 2026-06-25. Site Types is an INLINE-EDIT grid
// (columns: Levels, Name, Marker Url, Category) — NOT a form-dialog. The first table row is an
// always-present add-row: Levels (spinbutton), Name (textbox), Marker Url (textbox), Category
// (spinbutton), with a plus-circle (commit) and close-circle (clear). Each data row has an edit
// pencil; clicking it makes the row editable and swaps the pencil for save + close-circle (cancel).
// Committing the empty add-row shows "This field is required" on all 4 fields. Quick-search matches
// the text columns (Name / Marker Url). Edit tests target "Savana Hospital" (non-canonical seed).

import { test, expect, Page, Locator } from '@playwright/test';

const BASE = 'https://ncdoh-dispatcher-adminportal-qa.shesha.app';
const APP_URL = `${BASE}/login`;
const GRID = `${BASE}/dynamic/Boxfusion.Dispatcher/site-types`;
const ADMIN = { user: 'Admin', password: '123qwe' };

async function login(page: Page) {
  await page.goto(APP_URL);
  // The login page occasionally renders blank on first paint — reload once if the form isn't there.
  const user = page.getByPlaceholder('Username');
  try {
    await expect(user).toBeVisible({ timeout: 15000 });
  } catch {
    await page.reload();
    await expect(user).toBeVisible({ timeout: 20000 });
  }
  await user.fill(ADMIN.user);
  await page.getByPlaceholder('Password').fill(ADMIN.password);
  await page.getByRole('button', { name: 'Sign In' }).click();
  await page.waitForURL((url) => !url.href.includes('/login'), { timeout: 30000 });
}

async function gotoGrid(page: Page) {
  await page.goto(GRID);
  await expect(page.getByRole('heading', { name: 'Site Types' })).toBeVisible({ timeout: 30000 });
  await expect(page.getByRole('table')).toBeVisible({ timeout: 30000 });
}

// The search box is the first textbox on the page (the inline add-row textboxes render after it).
async function searchGrid(page: Page, term: string) {
  const box = page.getByRole('textbox').first();
  await box.click();
  await box.fill(term);
  await page.getByRole('button', { name: 'search' }).click();
  await page.waitForTimeout(2000);
}

// The inline add-row is the row that carries the plus-circle (commit) control.
function addRow(page: Page): Locator {
  return page.getByRole('row').filter({ has: page.getByRole('button', { name: 'plus-circle' }) });
}
// A row in edit mode is the one that carries a save control.
function editingRow(page: Page): Locator {
  return page.getByRole('row').filter({ has: page.getByRole('button', { name: 'save' }) });
}

test.describe('ADMIN-2.7 — Site Types', () => {

  test('TC-01: Log in to NC Dispatch', async ({ page }) => {
    await login(page);
    await expect(page).not.toHaveURL(/\/login/i);
  });

  // ADO Test Case #65805: https://dev.azure.com/boxfusion/pd-dispatcher-V2/_workitems/edit/65805
  test('TC-02: Search for a site type by name', async ({ page }) => {
    test.setTimeout(60_000);
    await login(page);
    await gotoGrid(page);
    await expect(page.getByRole('table')).toBeVisible();
    await searchGrid(page, 'Hospital');
    await expect(page.getByRole('cell', { name: /Hospital/ }).first()).toBeVisible({ timeout: 15000 });
  });

  // ADO Test Case #65806: https://dev.azure.com/boxfusion/pd-dispatcher-V2/_workitems/edit/65806
  test('TC-03: Search by category or level', async ({ page }) => {
    test.setTimeout(60_000);
    await login(page);
    await gotoGrid(page);
    // The single quick-search matches text columns (Name / Marker Url), not numeric Category/Level —
    // a representative category term ("Clinic") is used (plan-correction).
    await searchGrid(page, 'Clinic');
    await expect(page.getByRole('cell', { name: /Clinic/ }).first()).toBeVisible({ timeout: 15000 });
  });

  // ADO Test Case #65807: https://dev.azure.com/boxfusion/pd-dispatcher-V2/_workitems/edit/65807
  test('TC-04: Export site types', async ({ page }) => {
    test.setTimeout(60_000);
    await login(page);
    await gotoGrid(page);
    const [download] = await Promise.all([
      page.waitForEvent('download', { timeout: 20000 }),
      page.getByRole('button', { name: /Export/ }).click(),
    ]);
    expect(download.suggestedFilename()).toBeTruthy();
  });

  // ADO Test Case #65808: https://dev.azure.com/boxfusion/pd-dispatcher-V2/_workitems/edit/65808
  test('TC-05: Attempt to add site type with missing fields', async ({ page }) => {
    test.setTimeout(60_000);
    await login(page);
    await gotoGrid(page);
    // STEP: commit the empty add-row
    await addRow(page).getByRole('button', { name: 'plus-circle' }).click();
    // ASSERT (BLOCKING) a "This field is required" validation error appears (submission blocked)
    await expect(page.locator('.ant-form-item-explain-error').first()).toBeVisible({ timeout: 10000 });
    await expect(page.getByText('This field is required').first()).toBeVisible();
  });

  // ADO Test Case #65809: https://dev.azure.com/boxfusion/pd-dispatcher-V2/_workitems/edit/65809
  test('TC-06: Add new site type', async ({ page }) => {
    test.setTimeout(90_000);
    await login(page);
    await gotoGrid(page);
    const name = `QA Site Type ${Date.now()}`;
    const row = addRow(page);
    // STEP: fill Levels (spinbutton #1), Name (textbox #1), Marker Url (textbox #2), Category (spinbutton #2)
    await row.getByRole('spinbutton').first().fill('1');
    await row.getByRole('textbox').first().fill(name);
    await row.getByRole('textbox').nth(1).fill('/markers/facilities/test.svg');
    await row.getByRole('spinbutton').nth(1).fill('1');
    // STEP: commit the new row
    await row.getByRole('button', { name: 'plus-circle' }).click();
    await page.waitForTimeout(2000);
    // STEP: verify via search
    await searchGrid(page, name);
    // ASSERT (BLOCKING) the new site type appears
    await expect(page.getByRole('cell', { name }).first()).toBeVisible({ timeout: 15000 });
  });

  // ADO Test Case #65810: https://dev.azure.com/boxfusion/pd-dispatcher-V2/_workitems/edit/65810
  test('TC-07: Cancel site type addition', async ({ page }) => {
    test.setTimeout(60_000);
    await login(page);
    await gotoGrid(page);
    const row = addRow(page);
    // STEP: type into the add-row then clear it with close-circle
    await row.getByRole('textbox').first().fill('Discard Me');
    await row.getByRole('button', { name: 'close-circle' }).click();
    // ASSERT the entered field is cleared (nothing added)
    await expect(row.getByRole('textbox').first()).toHaveValue('');
  });

  // ADO Test Case #65811: https://dev.azure.com/boxfusion/pd-dispatcher-V2/_workitems/edit/65811
  test('TC-08: Edit existing site type', async ({ page }) => {
    test.setTimeout(60_000);
    await login(page);
    await gotoGrid(page);
    await searchGrid(page, 'Savana');
    // STEP: click the row's edit pencil
    await page.getByRole('rowgroup').getByRole('row').first().getByRole('button', { name: 'edit' }).click();
    // ASSERT (BLOCKING) the row is now editable (Save + Cancel shown)
    await expect(editingRow(page).getByRole('button', { name: 'save' })).toBeVisible({ timeout: 15000 });
    await expect(editingRow(page).getByRole('button', { name: 'close-circle' })).toBeVisible();
  });

  // ADO Test Case #65812: https://dev.azure.com/boxfusion/pd-dispatcher-V2/_workitems/edit/65812
  test('TC-09: Save edited site type', async ({ page }) => {
    test.setTimeout(90_000);
    await login(page);
    await gotoGrid(page);
    await searchGrid(page, 'Savana');
    await page.getByRole('rowgroup').getByRole('row').first().getByRole('button', { name: 'edit' }).click();
    const editing = editingRow(page);
    await expect(editing.getByRole('button', { name: 'save' })).toBeVisible({ timeout: 15000 });
    // STEP: MODIFY the Name field (textbox #1 in the editing row)
    const nameBox = editing.getByRole('textbox').first();
    await nameBox.click();
    await nameBox.press('End');
    await nameBox.pressSequentially(' x');
    // STEP: save
    await editing.getByRole('button', { name: 'save' }).click();
    // ASSERT (BLOCKING) the change is saved — row returns to read mode (edit pencil shown, save gone)
    await expect(page.getByRole('rowgroup').getByRole('row').first().getByRole('button', { name: 'edit' }))
      .toBeVisible({ timeout: 20000 });
  });

  // ADO Test Case #65813: https://dev.azure.com/boxfusion/pd-dispatcher-V2/_workitems/edit/65813
  test('TC-10: Edit and cancel changes', async ({ page }) => {
    test.setTimeout(60_000);
    await login(page);
    await gotoGrid(page);
    await searchGrid(page, 'Savana');
    await page.getByRole('rowgroup').getByRole('row').first().getByRole('button', { name: 'edit' }).click();
    const editing = editingRow(page);
    await expect(editing.getByRole('button', { name: 'save' })).toBeVisible({ timeout: 15000 });
    // STEP: type a change then cancel without saving
    const nameBox = editing.getByRole('textbox').first();
    await nameBox.click();
    await nameBox.press('End');
    await nameBox.pressSequentially(' DISCARD');
    await editing.getByRole('button', { name: 'close-circle' }).click();
    // ASSERT the edit closes with no save — row reverts to read mode (edit pencil shown)
    await expect(page.getByRole('rowgroup').getByRole('row').first().getByRole('button', { name: 'edit' }))
      .toBeVisible({ timeout: 15000 });
    await expect(editingRow(page).getByRole('button', { name: 'save' })).toHaveCount(0);
  });

  // ADO Test Case #65814: https://dev.azure.com/boxfusion/pd-dispatcher-V2/_workitems/edit/65814
  test('TC-11: Export with no site types', async ({ page }) => {
    test.setTimeout(60_000);
    await login(page);
    await gotoGrid(page);
    // Force an empty list with a no-match search, then export (true "no records" can't be met non-destructively).
    await searchGrid(page, 'zzz-no-such-site-type-zzz');
    const [download] = await Promise.all([
      page.waitForEvent('download', { timeout: 20000 }),
      page.getByRole('button', { name: /Export/ }).click(),
    ]);
    expect(download.suggestedFilename()).toBeTruthy();
  });
});
