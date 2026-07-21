// AUTO-RECORDED from test-plans/administrative-functions/vehicle-types.md
// Source: Azure DevOps test plan #65099, suite #65148 (2.5 Vehicle Types)
// The .md plan is canonical. AI-repair will patch failing lines in this file.
//
// Selectors recorded live against NC Dispatch QA on 2026-06-25. Vehicle Types is a form-dialog grid:
// Add New opens an "Add New Vehicle Type" dialog; rows expose a magnifying-glass details link
// (/vehicle-types-detials?id=…) and an edit pencil (…&mode=edit); the details view has Back + Edit,
// and the edit form has "Cancel Form Edit" + "Save".

import { test, expect, Page, Locator } from '@playwright/test';

const BASE = 'https://ncdoh-dispatcher-adminportal-qa.shesha.app';
const APP_URL = `${BASE}/login`;
const GRID = `${BASE}/dynamic/Boxfusion.Ems/vehicle-types`;
const ADMIN = { user: 'Admin', password: '123qwe' };

// Shesha login — placeholders Username/Password, button "Sign In". No networkidle wait (this app holds
// background connections open); waitForURL confirms login.
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

// The details / edit view content is wrapped in #modalContainerId. Scope action buttons to it so
// they don't collide with the Shesha form-designer "edit" pencil in the page banner.
function detailView(page: Page): Locator {
  return page.locator('#modalContainerId');
}

// The real action buttons in the details/edit view carry class `sha-toolbar-btn` (the bare `edit`
// pencil that also lives in the view is a Shesha form-designer control, not an action). Match the
// toolbar button by exact visible text so "Edit" doesn't also catch "Cancel Form Edit".
function toolBtn(page: Page, label: RegExp): Locator {
  return page.locator('#modalContainerId .sha-toolbar-btn').filter({ hasText: label });
}

async function gotoGrid(page: Page) {
  await page.goto(GRID);
  await expect(page.getByRole('table')).toBeVisible({ timeout: 30000 });
  await expect(page.getByRole('textbox').first()).toBeVisible({ timeout: 30000 });
}

// Grid toolbar: quick-search textbox (first textbox) + a "search" button.
async function searchGrid(page: Page, term: string) {
  const box = page.getByRole('textbox').first();
  await box.click();
  await box.fill(term);
  await page.getByRole('button', { name: 'search' }).click();
  await page.waitForTimeout(2500);
}

// Open an AntD select (click the selector, not the readonly input) and pick an option by text.
async function pickAntdSelect(page: Page, sel: Locator, optionText: string) {
  await sel.locator('.ant-select-selector').click();
  await page
    .locator('.ant-select-dropdown:not(.ant-select-dropdown-hidden) .ant-select-item-option', { hasText: optionText })
    .first()
    .click({ timeout: 10000 });
}

test.describe('ADMIN-2.5 — Vehicle Types', () => {

  // ADO Test Case (login) — auto-prepended; suite needs an authenticated session.
  test('TC-01: Log in to NC Dispatch', async ({ page }) => {
    await login(page);
    await expect(page).not.toHaveURL(/\/login/i);
  });

  // ADO Test Case #65771: https://dev.azure.com/boxfusion/pd-dispatcher-V2/_workitems/edit/65771
  test('TC-02: Search for a vehicle type by name', async ({ page }) => {
    test.setTimeout(60_000);
    await login(page);
    await gotoGrid(page);
    // ASSERT (BLOCKING) the Vehicle Types grid is displayed
    await expect(page.getByRole('table')).toBeVisible();
    // STEP: search by a known name
    await searchGrid(page, 'Ambulance');
    // ASSERT matching vehicle types are displayed
    await expect(page.getByRole('cell', { name: /Ambulance/ }).first()).toBeVisible({ timeout: 15000 });
  });

  // ADO Test Case #65772: https://dev.azure.com/boxfusion/pd-dispatcher-V2/_workitems/edit/65772
  test('TC-03: Search by description or category', async ({ page }) => {
    test.setTimeout(60_000);
    await login(page);
    await gotoGrid(page);
    await searchGrid(page, 'Auto Test');
    // ASSERT at least one matching row is shown
    await expect(page.getByRole('cell', { name: /Auto Test/ }).first()).toBeVisible({ timeout: 15000 });
  });

  // ADO Test Case #65773: https://dev.azure.com/boxfusion/pd-dispatcher-V2/_workitems/edit/65773
  test("TC-04: Click on 'Add New' button", async ({ page }) => {
    test.setTimeout(60_000);
    await login(page);
    await gotoGrid(page);
    // STEP: CLICK Add New
    await page.getByRole('button', { name: /Add New/ }).click();
    // ASSERT (BLOCKING) the create dialog appears
    await expect(page.locator('.ant-modal-content')).toBeVisible({ timeout: 15000 });
    await expect(page.getByText('Add New Vehicle Type')).toBeVisible();
  });

  // ADO Test Case #65774: https://dev.azure.com/boxfusion/pd-dispatcher-V2/_workitems/edit/65774
  test('TC-05: Add new vehicle type with valid data', async ({ page }) => {
    test.setTimeout(90_000);
    await login(page);
    await gotoGrid(page);
    const stamp = Date.now().toString().slice(-9);
    const name = `QA VT ${stamp}`;
    // STEP: open the create dialog
    await page.getByRole('button', { name: /Add New/ }).click();
    const modal = page.locator('.ant-modal-content');
    await expect(modal).toBeVisible({ timeout: 15000 });
    // STEP: fill Name + Description + 4 marker URLs (modal textboxes in order)
    const tb = modal.getByRole('textbox');
    await tb.nth(0).fill(name);
    await tb.nth(1).fill(`QA Test Vehicle Type ${stamp}`);
    await tb.nth(2).fill('/markers/vehicles/online-onshift.svg');
    await tb.nth(3).fill('/markers/vehicles/offline-onshift.svg');
    await tb.nth(4).fill('/markers/vehicles/online-offshift.svg');
    await tb.nth(5).fill('/markers/vehicles/offline-offshift.svg');
    // STEP: SELECT Vehicle Type Skill (real click) — first select in the dialog
    await pickAntdSelect(page, modal.locator('.ant-select').nth(0), 'Paramedics');
    await modal.locator('.ant-modal-title').click();
    // STEP: check both checklist toggles (mandatory)
    for (const cb of await modal.getByRole('checkbox').all()) {
      if (!(await cb.isChecked())) await cb.check();
    }
    // STEP: SELECT Vehicle Occupation (real click) — second select
    await pickAntdSelect(page, modal.locator('.ant-select').nth(1), 'Emergency');
    await modal.locator('.ant-modal-title').click();
    // STEP: CLICK OK to save
    await modal.getByRole('button', { name: 'OK' }).click();
    await expect(modal).toBeHidden({ timeout: 20000 });
    // STEP: search the new name + ASSERT (BLOCKING) it is listed
    await searchGrid(page, name);
    await expect(page.getByRole('cell', { name }).first()).toBeVisible({ timeout: 20000 });
  });

  // ADO Test Case #65775: https://dev.azure.com/boxfusion/pd-dispatcher-V2/_workitems/edit/65775
  test('TC-06: View vehicle type details', async ({ page }) => {
    test.setTimeout(60_000);
    await login(page);
    await gotoGrid(page);
    // STEP: CLICK the row magnifying-glass (details) link on the first row
    await page.locator('a[href*="vehicle-types-detials"]:not([href*="mode=edit"])').first().click();
    // ASSERT (BLOCKING) the details view is shown
    await expect(page).toHaveURL(/vehicle-types-detials/);
    await expect(toolBtn(page, /^Edit$/)).toBeVisible({ timeout: 15000 });
  });

  // ADO Test Case #65776: https://dev.azure.com/boxfusion/pd-dispatcher-V2/_workitems/edit/65776
  test('TC-07: Return to vehicle types table', async ({ page }) => {
    test.setTimeout(60_000);
    await login(page);
    await gotoGrid(page);
    await page.locator('a[href*="vehicle-types-detials"]:not([href*="mode=edit"])').first().click();
    const back = detailView(page).getByRole('button', { name: 'Back' })
      .or(detailView(page).getByRole('link', { name: 'Back' }));
    await expect(back).toBeVisible({ timeout: 15000 });
    // STEP: CLICK Back
    await back.click();
    // ASSERT the grid is shown again
    await expect(page.getByRole('table')).toBeVisible({ timeout: 20000 });
  });

  // ADO Test Case #65777: https://dev.azure.com/boxfusion/pd-dispatcher-V2/_workitems/edit/65777
  test('TC-08: Edit vehicle type from details view', async ({ page }) => {
    test.setTimeout(60_000);
    await login(page);
    await gotoGrid(page);
    await page.locator('a[href*="vehicle-types-detials"]:not([href*="mode=edit"])').first().click();
    // STEP: CLICK Edit on the details view (toolbar action button, not the form-designer pencil)
    await toolBtn(page, /^Edit$/).click();
    // ASSERT (BLOCKING) the edit form is displayed (Save + Cancel Form Edit available)
    await expect(toolBtn(page, /^Save$/)).toBeVisible({ timeout: 15000 });
    await expect(toolBtn(page, /^Cancel Form Edit$/)).toBeVisible();
  });

  // ADO Test Case #65778: https://dev.azure.com/boxfusion/pd-dispatcher-V2/_workitems/edit/65778
  test('TC-09: Cancel vehicle type edit', async ({ page }) => {
    test.setTimeout(60_000);
    await login(page);
    await gotoGrid(page);
    await page.locator('a[href*="vehicle-types-detials"]:not([href*="mode=edit"])').first().click();
    await toolBtn(page, /^Edit$/).click();
    await expect(toolBtn(page, /^Cancel Form Edit$/)).toBeVisible({ timeout: 15000 });
    // STEP: CLICK Cancel Form Edit
    await toolBtn(page, /^Cancel Form Edit$/).click();
    // ASSERT the edit form closed without saving (back to view — Edit visible, Save gone)
    await expect(toolBtn(page, /^Edit$/)).toBeVisible({ timeout: 15000 });
    await expect(toolBtn(page, /^Save$/)).toHaveCount(0);
  });

  // ADO Test Case #65779: https://dev.azure.com/boxfusion/pd-dispatcher-V2/_workitems/edit/65779
  test('TC-10: Save vehicle type edit', async ({ page }) => {
    test.setTimeout(60_000);
    await login(page);
    await gotoGrid(page);
    await page.locator('a[href*="vehicle-types-detials"]:not([href*="mode=edit"])').first().click();
    await toolBtn(page, /^Edit$/).click();
    await expect(toolBtn(page, /^Save$/)).toBeVisible({ timeout: 15000 });
    // STEP: MODIFY a field (append to the first enabled text input on the edit form)
    const field = detailView(page).locator('input.ant-input:not([disabled])').first();
    // Bounded toggle (not an unbounded append): appending each run eventually overflows the
    // field's server-side length limit → 500. Oscillate a ' x' suffix instead.
    const _cur = await field.inputValue();
    await field.fill(_cur.endsWith(' x') ? _cur.slice(0, -2) : _cur + ' x');
    // STEP: CLICK Save
    await toolBtn(page, /^Save$/).click();
    // ASSERT (BLOCKING) the edit saved (returns to view mode — Edit visible again, no error)
    await expect(toolBtn(page, /^Edit$/)).toBeVisible({ timeout: 20000 });
  });

  // ADO Test Case #65780: https://dev.azure.com/boxfusion/pd-dispatcher-V2/_workitems/edit/65780
  test('TC-11: Edit vehicle type using edit icon', async ({ page }) => {
    test.setTimeout(60_000);
    await login(page);
    await gotoGrid(page);
    // STEP: CLICK the row edit pencil (routes to the edit view, mode=edit)
    await page.locator('a[href*="vehicle-types-detials"][href*="mode=edit"]').first().click();
    // ASSERT (BLOCKING) the edit view is shown
    await expect(page).toHaveURL(/mode=edit/);
    await expect(page.getByRole('button', { name: 'Save' })).toBeVisible({ timeout: 15000 });
  });
});
