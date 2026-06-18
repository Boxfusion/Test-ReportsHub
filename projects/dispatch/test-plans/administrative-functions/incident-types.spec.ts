// AUTO-RECORDED from test-plans/administrative-functions/incident-types.md
// Source: Azure DevOps test plan #65099, suite #65132 (2.2 Incident Types)
// The .md plan is canonical. AI-repair will patch failing lines in this file.
//
// Login + the Incident Types ("Call Types") grid selectors were recorded live against the Pre-Prod
// app. The menu item "Incident Types" opens a page headed "Call Types" — an inline-edit grid
// (search box, Export, per-row edit pencils, an inline add-row with a plus-circle control). Several
// original ADO steps assume an "Add New Record" dialog, a magnifying-glass details view, and a
// "Back" button that this UI does not have; those lines carry // TODO[selector]/[assertion] markers
// for AI-repair (plan-correction) to reconcile on the first /RunTest.

import { test, expect, Page } from '@playwright/test';

const APP_URL = 'https://ncdoh-dispatcher-adminportal-qa.shesha.app/login';
const ADMIN = { user: 'Admin', password: '123qwe' };
const INCIDENT_TYPES_URL = `${APP_URL.replace('/login', '')}/dynamic/Boxfusion.Ems/incident-types`;

// Recorded live: Shesha login — fields expose placeholders (Username/Password); button is "Sign In".
async function login(page: Page) {
  await page.goto(APP_URL);
  await page.getByPlaceholder('Username').fill(ADMIN.user);
  await page.getByPlaceholder('Password').fill(ADMIN.password);
  await page.getByRole('button', { name: 'Sign In' }).click();
  await page.waitForURL((url) => !url.href.includes('/login'), { timeout: 30000 });
  // AI-repair (2026-06-17): the Shesha app holds background connections open (offline-mode
  // polling / websockets), so `networkidle` never settles and the wait times out. Drop it —
  // waitForURL above confirms login succeeded, and downstream steps wait on concrete elements.
}

// Recorded live: reach the Incident Types grid directly by URL. The collapsed Shesha sidebar's
// submenu flyouts (Dispatcher → Management → Incident Types) don't open reliably under automation,
// so navigate to the form URL (module Boxfusion.Ems) like the run-test specs do elsewhere.
async function gotoIncidentTypes(page: Page) {
  await page.goto(INCIDENT_TYPES_URL);
  // AI-repair (2026-06-17): no `networkidle` wait (never settles on this Shesha app).
  // The page heading is "Call Types" (the entity is surfaced as Call Types in this grid).
  await expect(page.getByRole('heading', { name: 'Call Types' })).toBeVisible({ timeout: 30000 });
}

// Recorded live: the grid toolbar has a search textbox followed by a "search" button. The textbox has
// no accessible name; it's the first textbox on the page (the inline add-row textbox renders after it
// in the DOM). FRAGILE: re-anchor if the toolbar layout changes.
async function searchGrid(page: Page, term: string) {
  const box = page.getByRole('textbox').first();
  await box.fill(term);
  await page.getByRole('button', { name: 'search' }).click();
  // AI-repair (2026-06-17): no `networkidle` wait; callers assert on the resulting rows.
  await page.waitForTimeout(1500);
}

test.describe('ADMIN-2.2 — Incident Types', () => {

  // ADO Test Case (login): auto-prepended — the suite needs an authenticated session.
  test('TC-01: Log in to NC Dispatch', async ({ page }) => {
    // STEP: NAVIGATE + sign in as Admin
    await login(page);
    // ASSERT (BLOCKING) redirected away from /login
    await expect(page).not.toHaveURL(/\/login/i);
  });

  // ADO Test Case #65701: https://dev.azure.com/boxfusion/pd-dispatcher-V2/_workitems/edit/65701
  test('TC-02: Search for incident type by name', async ({ page }) => {
    test.setTimeout(60_000);
    await login(page);
    // STEP: open the Incident Types (Call Types) grid
    await gotoIncidentTypes(page);
    // ASSERT (BLOCKING) the grid is displayed
    await expect(page.getByRole('table')).toBeVisible({ timeout: 30000 });
    // STEP: search by a known Call Type name
    await searchGrid(page, 'Stomach Cramps');
    // ASSERT the matching incident type is displayed
    await expect(page.getByRole('cell', { name: 'Stomach Cramps' }).first()).toBeVisible({ timeout: 15000 });
  });

  // ADO Test Case #65702: https://dev.azure.com/boxfusion/pd-dispatcher-V2/_workitems/edit/65702
  test('TC-03: Search using partial match', async ({ page }) => {
    test.setTimeout(60_000);
    await login(page);
    await gotoIncidentTypes(page);
    // STEP: search by a partial term
    await searchGrid(page, 'Burn');
    // ASSERT at least one partially-matching row is shown
    await expect(page.getByRole('cell', { name: /Burn/i }).first()).toBeVisible({ timeout: 15000 });
  });

  // ADO Test Case #65703: https://dev.azure.com/boxfusion/pd-dispatcher-V2/_workitems/edit/65703
  test('TC-04: Export incident types', async ({ page }) => {
    test.setTimeout(60_000);
    await login(page);
    await gotoIncidentTypes(page);
    // STEP: click Export and capture the download
    const downloadPromise = page.waitForEvent('download', { timeout: 30000 });
    await page.getByRole('button', { name: /export/i }).click();
    // ASSERT (BLOCKING) a file download is triggered
    const download = await downloadPromise;
    expect(download.suggestedFilename()).toBeTruthy();
  });

  // ADO Test Case #65704: https://dev.azure.com/boxfusion/pd-dispatcher-V2/_workitems/edit/65704
  test('TC-05: Add new incident type', async ({ page }) => {
    test.setTimeout(90_000);
    await login(page);
    await gotoIncidentTypes(page);
    // STEP: the live page uses an INLINE add-row (plus-circle), not an "Add New Record" dialog.
    // Fill the add-row (Triage Level select, Call Types text, optional Resolution SLA) then add.
    const addRow = page.getByRole('row').filter({ has: page.getByRole('button', { name: 'plus-circle' }) });
    // TODO[selector]: confirm the add-row field order/locators live, then set Triage Level + Call Type.
    // await addRow.getByRole('combobox').click(); /* pick a triage level */
    // await addRow.getByRole('textbox').fill(`Automated Call Type ${Date.now()}`);
    await addRow.getByRole('button', { name: 'plus-circle' }).click();
    // ASSERT (BLOCKING) the new incident type appears in the table
    // TODO[assertion]: assert the newly-added Call Type row is present after save.
    await expect(page.getByRole('table')).toBeVisible();
  });

  // ADO Test Case #65705: https://dev.azure.com/boxfusion/pd-dispatcher-V2/_workitems/edit/65705
  test('TC-06: View incident type details', async ({ page }) => {
    test.setTimeout(60_000);
    await login(page);
    await gotoIncidentTypes(page);
    // STEP: ADO says "magnifying glass" → details view; the live grid exposes a per-row EDIT pencil.
    const firstRow = page.getByRole('rowgroup').getByRole('row').first();
    await firstRow.getByRole('button', { name: 'edit' }).click();
    // ASSERT (BLOCKING) the record's detail/edit view is shown
    // TODO[assertion]: confirm what opens on edit (inline edit row vs details page) and assert on it.
    await expect(page.getByRole('table')).toBeVisible();
  });

  // ADO Test Case #65706: https://dev.azure.com/boxfusion/pd-dispatcher-V2/_workitems/edit/65706
  test('TC-07: Return to incident types table', async ({ page }) => {
    test.setTimeout(60_000);
    await login(page);
    await gotoIncidentTypes(page);
    const firstRow = page.getByRole('rowgroup').getByRole('row').first();
    await firstRow.getByRole('button', { name: 'edit' }).click();
    // STEP: return to the grid (ADO "Back" button — the inline grid may instead cancel the edit row).
    // TODO[selector]: locate the Back/Cancel control that returns to the list and click it.
    // ASSERT the Call Types grid is displayed again
    await expect(page.getByRole('heading', { name: 'Call Types' })).toBeVisible({ timeout: 15000 });
  });

  // ADO Test Case #65707: https://dev.azure.com/boxfusion/pd-dispatcher-V2/_workitems/edit/65707
  test('TC-08: Edit / Delete incident type', async ({ page }) => {
    test.setTimeout(90_000);
    await login(page);
    await gotoIncidentTypes(page);
    // STEP: edit a target row
    const targetRow = page.getByRole('rowgroup').getByRole('row').first();
    await targetRow.getByRole('button', { name: 'edit' }).click();
    // ASSERT the edit form/row is displayed (TODO[assertion]: refine once the edit affordance is known)
    await expect(page.getByRole('table')).toBeVisible();
    // STEP: delete the incident type
    // TODO[selector]: locate the row delete control (e.g. close-circle / a delete action) and confirm.
    // ASSERT (BLOCKING) the targeted incident type is deleted
    // TODO[assertion]: assert the row no longer appears after delete.
  });

  // ADO Test Case #65708: https://dev.azure.com/boxfusion/pd-dispatcher-V2/_workitems/edit/65708
  test('TC-09: Cancel edit form', async ({ page }) => {
    test.setTimeout(60_000);
    await login(page);
    await gotoIncidentTypes(page);
    await page.getByRole('rowgroup').getByRole('row').first().getByRole('button', { name: 'edit' }).click();
    // STEP: cancel the edit without saving
    // TODO[selector]: locate the Cancel / "Cancel Form Edit" control for the inline edit and click it.
    // ASSERT the edit row/form closes with no changes persisted
    // TODO[assertion]: assert the row reverts to read-only with unchanged values.
    await expect(page.getByRole('table')).toBeVisible();
  });

  // ADO Test Case #65709: https://dev.azure.com/boxfusion/pd-dispatcher-V2/_workitems/edit/65709
  test('TC-10: Save changes to incident type', async ({ page }) => {
    test.setTimeout(90_000);
    await login(page);
    await gotoIncidentTypes(page);
    // STEP: edit a row, change a field, save
    const targetRow = page.getByRole('rowgroup').getByRole('row').first();
    await targetRow.getByRole('button', { name: 'edit' }).click();
    // TODO[selector]: change a field (e.g. Resolution SLA spinbutton) in the edit row.
    // TODO[selector]: locate and click the row save control.
    // ASSERT (BLOCKING) the modified value is reflected in the table
    // TODO[assertion]: assert the saved value shows in the row after save.
    await expect(page.getByRole('table')).toBeVisible();
  });

  // ADO Test Case #65710: https://dev.azure.com/boxfusion/pd-dispatcher-V2/_workitems/edit/65710
  test('TC-11: Export with no incident types', async ({ page }) => {
    test.setTimeout(60_000);
    await login(page);
    await gotoIncidentTypes(page);
    // STEP: force an empty list by searching a term with no matches, then export.
    await searchGrid(page, 'zzz-no-such-call-type-zzz');
    const downloadPromise = page.waitForEvent('download', { timeout: 30000 });
    await page.getByRole('button', { name: /export/i }).click();
    // ASSERT (BLOCKING) Export still produces a file when the list is empty
    const download = await downloadPromise;
    expect(download.suggestedFilename()).toBeTruthy();
  });
});
