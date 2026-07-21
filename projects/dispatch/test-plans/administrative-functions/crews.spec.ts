// AUTO-RECORDED from test-plans/administrative-functions/crews.md
// Source: Azure DevOps test plan #65099, suite #65141 (2.13 Crews)
// The .md plan is canonical. AI-repair will patch failing lines in this file.
//
// Selectors recorded live against NC Dispatch QA on 2026-06-25. Crews is a form-dialog grid: rows have
// only a magnifying-glass link to /EMSDispatchTeam-Details-View?id=… (NO row edit-pencil), so the
// "edit from index" view is reached by the details URL + &mode=edit. Details/edit actions are
// .sha-toolbar-btn (Back/Edit/Save/Cancel Form Edit) in #modalContainerId. Grid is large + slow.

import { test, expect, Page, Locator } from '@playwright/test';

const BASE = 'https://ncdoh-dispatcher-adminportal-qa.shesha.app';
const APP_URL = `${BASE}/login`;
const GRID = `${BASE}/dynamic/Boxfusion.Ems/EmsDispatchTeam-Table`;
const ADMIN = { user: 'Admin', password: '123qwe' };
const DETAILS = 'a[href*="EMSDispatchTeam-Details-View"]';

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
  // The Crews grid is very large (~13k rows) and intermittently slow / fails to render under load —
  // reload once and wait for the detail links (which only exist once rows have loaded).
  await page.goto(GRID);
  const firstDetail = page.locator(DETAILS).first();
  try {
    await expect(page.getByRole('table')).toBeVisible({ timeout: 30000 });
    await expect(firstDetail).toBeVisible({ timeout: 30000 });
  } catch {
    await page.reload();
    await expect(page.getByRole('table')).toBeVisible({ timeout: 45000 });
    await expect(firstDetail).toBeVisible({ timeout: 45000 });
  }
}

async function searchGrid(page: Page, term: string) {
  const box = page.getByRole('textbox').first();
  await box.click();
  await box.fill(term);
  await box.press('Enter'); // trigger the search both ways — the heavy grid can miss the button click
  await page.getByRole('button', { name: 'search' }).click();
  await page.waitForTimeout(2000);
}

function detailView(page: Page): Locator {
  return page.locator('#modalContainerId');
}
function toolBtn(page: Page, label: RegExp): Locator {
  return page.locator('#modalContainerId .sha-toolbar-btn').filter({ hasText: label });
}
// Crew Number — the only free-text input on the crew edit form.
function crewNumberField(page: Page): Locator {
  return detailView(page).locator('input.ant-input:not([disabled])').first();
}

// The crew edit form does NOT pre-populate Crew Members / Crew Skill Type, so Save fails "required"
// unless they're re-supplied. Pick the first option of the *visible* select for a given label
// (Crew Skill Type renders a hidden + a visible variant — match the visible one).
async function pickFirstVisible(page: Page, label: string) {
  const item = detailView(page)
    .locator('.ant-form-item')
    .filter({ hasText: label })
    .filter({ has: page.locator('.ant-select-selector:visible') })
    .first();
  await item.locator('.ant-select-selector').click();
  const dd = page.locator('.ant-select-dropdown:not(.ant-select-dropdown-hidden)').first();
  await dd.waitFor({ state: 'visible', timeout: 10000 });
  await page.waitForTimeout(400);
  // Click the first UNSELECTED option — for the Crew Members multi-select this adds a member without
  // toggling off the already-selected one; for the single-select Crew Skill Type it just picks one.
  await dd.locator('.ant-select-item-option:not(.ant-select-item-option-selected)').first()
    .click({ timeout: 8000 });
  // Multi-selects keep the dropdown open — close it (Esc only closes the dropdown on a page form,
  // not the view) so the next field's selector isn't covered by the overlay.
  await page.keyboard.press('Escape');
}
// No row edit-pencil on this grid — reach a crew's edit view via the details URL + mode=edit.
async function gotoFirstEditView(page: Page) {
  const href = await page.locator(DETAILS).first().getAttribute('href');
  await page.goto(`${BASE}${href}${href!.includes('?') ? '&' : '?'}mode=edit`);
  await expect(page).toHaveURL(/mode=edit/);
}

test.describe('ADMIN-2.13 — Crews', () => {

  test('TC-01: Log in to NC Dispatch', async ({ page }) => {
    await login(page);
    await expect(page).not.toHaveURL(/\/login/i);
  });

  // ADO Test Case #65881: https://dev.azure.com/boxfusion/pd-dispatcher-V2/_workitems/edit/65881
  test('TC-02: Search for a crew', async ({ page }) => {
    test.setTimeout(60_000);
    await login(page);
    await gotoGrid(page);
    await expect(page.getByRole('table')).toBeVisible();
    await searchGrid(page, 'QA-CREW');
    // Heavy grid — the filtered query can take a while to return; poll generously.
    await expect(page.getByRole('cell', { name: /QA-CREW/ }).first()).toBeVisible({ timeout: 45000 });
  });

  // ADO Test Case #65882: https://dev.azure.com/boxfusion/pd-dispatcher-V2/_workitems/edit/65882
  test('TC-03: Open Add Crew dialog', async ({ page }) => {
    test.setTimeout(60_000);
    await login(page);
    await gotoGrid(page);
    await page.getByRole('button', { name: /Add New/ }).click();
    await expect(page.locator('.ant-modal-content')).toBeVisible({ timeout: 15000 });
    await expect(page.getByText('Add New Crew')).toBeVisible();
  });

  // ADO Test Case #65883: https://dev.azure.com/boxfusion/pd-dispatcher-V2/_workitems/edit/65883
  test('TC-04: Export crews', async ({ page }) => {
    test.setTimeout(60_000);
    await login(page);
    await gotoGrid(page);
    const [download] = await Promise.all([
      page.waitForEvent('download', { timeout: 20000 }),
      page.getByRole('button', { name: /Export/ }).click(),
    ]);
    expect(download.suggestedFilename()).toBeTruthy();
  });

  // ADO Test Case #65884: https://dev.azure.com/boxfusion/pd-dispatcher-V2/_workitems/edit/65884
  test('TC-05: View crew details', async ({ page }) => {
    test.setTimeout(60_000);
    await login(page);
    await gotoGrid(page);
    await page.locator(DETAILS).first().click();
    await expect(page).toHaveURL(/EMSDispatchTeam-Details-View/);
    await expect(toolBtn(page, /^Edit$/)).toBeVisible({ timeout: 15000 });
  });

  // ADO Test Case #65885: https://dev.azure.com/boxfusion/pd-dispatcher-V2/_workitems/edit/65885
  test('TC-06: Edit crew from details view', async ({ page }) => {
    test.setTimeout(60_000);
    await login(page);
    await gotoGrid(page);
    await page.locator(DETAILS).first().click();
    await toolBtn(page, /^Edit$/).click();
    await expect(toolBtn(page, /^Save$/)).toBeVisible({ timeout: 15000 });
    await expect(toolBtn(page, /^Cancel Form Edit$/)).toBeVisible();
  });

  // ADO Test Case #65886: https://dev.azure.com/boxfusion/pd-dispatcher-V2/_workitems/edit/65886
  test('TC-07: Cancel edit in details view', async ({ page }) => {
    test.setTimeout(60_000);
    await login(page);
    await gotoGrid(page);
    await page.locator(DETAILS).first().click();
    await toolBtn(page, /^Edit$/).click();
    await expect(toolBtn(page, /^Cancel Form Edit$/)).toBeVisible({ timeout: 15000 });
    await toolBtn(page, /^Cancel Form Edit$/).click();
    await expect(toolBtn(page, /^Edit$/)).toBeVisible({ timeout: 15000 });
    await expect(toolBtn(page, /^Save$/)).toHaveCount(0);
  });

  // ADO Test Case #65887: https://dev.azure.com/boxfusion/pd-dispatcher-V2/_workitems/edit/65887
  test('TC-08: Save edit in details view', async ({ page }) => {
    test.setTimeout(60_000);
    await login(page);
    await gotoGrid(page);
    await page.locator(DETAILS).first().click();
    await toolBtn(page, /^Edit$/).click();
    await expect(toolBtn(page, /^Save$/)).toBeVisible({ timeout: 15000 });
    // STEP: MODIFY Crew Number; re-supply Crew Members + Crew Skill Type (edit form doesn't prefill them)
    const num = crewNumberField(page);
    // Bounded toggle (not an unbounded append): appending each run eventually overflows the
    // field's server-side length limit → UpdateCrew 500. Oscillate a ' x' suffix instead.
    const _cur = await num.inputValue();
    await num.fill(_cur.endsWith(' x') ? _cur.slice(0, -2) : _cur + ' x');
    await pickFirstVisible(page, 'Crew Members');
    await pickFirstVisible(page, 'Crew Skill Type');
    await num.click(); // blur any open dropdown before saving
    await toolBtn(page, /^Save$/).click();
    await expect(toolBtn(page, /^Edit$/)).toBeVisible({ timeout: 20000 });
  });

  // ADO Test Case #65888: https://dev.azure.com/boxfusion/pd-dispatcher-V2/_workitems/edit/65888
  test('TC-09: Edit crew from index', async ({ page }) => {
    test.setTimeout(60_000);
    await login(page);
    await gotoGrid(page);
    await gotoFirstEditView(page);
    await expect(toolBtn(page, /^Save$/)).toBeVisible({ timeout: 15000 });
  });

  // ADO Test Case #65889: https://dev.azure.com/boxfusion/pd-dispatcher-V2/_workitems/edit/65889
  test('TC-10: Save edit from index edit view', async ({ page }) => {
    test.setTimeout(60_000);
    await login(page);
    await gotoGrid(page);
    await gotoFirstEditView(page);
    await expect(toolBtn(page, /^Save$/)).toBeVisible({ timeout: 15000 });
    // STEP: MODIFY Crew Number; re-supply Crew Members + Crew Skill Type (edit form doesn't prefill them)
    const num = crewNumberField(page);
    // Bounded toggle (not an unbounded append): appending each run eventually overflows the
    // field's server-side length limit → UpdateCrew 500. Oscillate a ' x' suffix instead.
    const _cur = await num.inputValue();
    await num.fill(_cur.endsWith(' x') ? _cur.slice(0, -2) : _cur + ' x');
    await pickFirstVisible(page, 'Crew Members');
    await pickFirstVisible(page, 'Crew Skill Type');
    await num.click(); // blur any open dropdown before saving
    await toolBtn(page, /^Save$/).click();
    await expect(toolBtn(page, /^Edit$/)).toBeVisible({ timeout: 20000 });
  });

  // ADO Test Case #65890: https://dev.azure.com/boxfusion/pd-dispatcher-V2/_workitems/edit/65890
  test('TC-11: Cancel edit from index edit view', async ({ page }) => {
    test.setTimeout(60_000);
    await login(page);
    await gotoGrid(page);
    await gotoFirstEditView(page);
    await expect(toolBtn(page, /^Cancel Form Edit$/)).toBeVisible({ timeout: 15000 });
    await toolBtn(page, /^Cancel Form Edit$/).click();
    await expect(toolBtn(page, /^Edit$/)).toBeVisible({ timeout: 15000 });
    await expect(toolBtn(page, /^Save$/)).toHaveCount(0);
  });
});
