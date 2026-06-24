// AUTO-RECORDED from test-plans/administrative-functions/admin-functions-crud.md
// Source: Azure DevOps test plan #65099, suite #65100 (Administrative Functions)
// The .md plan is canonical. AI-repair will patch failing lines in this file.
//
// This suite VERIFIES the create + edit operations performed live on 2026-06-17 (NC Dispatch QA):
// for each Administrative-Functions entity it opens the entity's grid by direct URL, searches for the
// `Auto Test …` record we created, and asserts the row is present. The "Edit …" cases additionally
// assert the edited value where it is visible in the grid (Site Type Levels 1->2; Point of Interest
// contact -> 0987654321). It does NOT re-create records, to avoid duplicate test data.

import { test, expect, Page } from '@playwright/test';

const BASE = 'https://ncdoh-dispatcher-adminportal-qa.shesha.app';
const APP_URL = `${BASE}/login`;
const ADMIN = { user: 'Admin', password: '123qwe' };
const u = (formPath: string) => `${BASE}/dynamic/${formPath}`;

// Recorded live: Shesha login — fields expose placeholders (Username/Password); button is "Sign In".
// AI-repair (2026-06-17): NO `networkidle` wait — this Shesha app holds background connections open
// (offline-mode polling / websockets), so `networkidle` never settles. waitForURL confirms login.
async function login(page: Page) {
  await page.goto(APP_URL);
  await page.getByPlaceholder('Username').fill(ADMIN.user);
  await page.getByPlaceholder('Password').fill(ADMIN.password);
  await page.getByRole('button', { name: 'Sign In' }).click();
  await page.waitForURL((url) => !url.href.includes('/login'), { timeout: 30000 });
}

// Reach an entity grid directly by URL and wait on the table (collapsed sidebar flyouts don't open
// under automation). No load-state wait (see login note).
async function gotoGrid(page: Page, formPath: string) {
  await page.goto(u(formPath));
  await expect(page.getByRole('table')).toBeVisible({ timeout: 30000 });
  // Wait for the toolbar search box to be ready before interacting (the grid loads async with a
  // "loading…" overlay; acting too early races the bind). The first textbox is the quick-search.
  await expect(page.getByRole('textbox').first()).toBeVisible({ timeout: 30000 });
}

// Shesha grid toolbar: a search textbox (first textbox on the page) + a "search" button.
async function searchGrid(page: Page, term: string) {
  const box = page.getByRole('textbox').first();
  await box.click();
  await box.fill(term);
  await page.getByRole('button', { name: 'search' }).click();
  await page.waitForTimeout(2500);
}

async function expectRow(page: Page, cellText: string) {
  await expect(page.getByRole('cell', { name: cellText }).first()).toBeVisible({ timeout: 25000 });
}

interface Entity {
  key: string;        // display name used in the test titles
  form: string;       // Boxfusion.<module>/<form> grid path
  term: string;       // quick-search term
  cell: string;       // grid cell asserted (substring match)
  hasEdit: boolean;   // whether we performed an Edit on this entity today
  editCell?: string;  // exact grid value the edit established (asserted in the Edit case)
}

const ENTITIES: Entity[] = [
  { key: 'Incident Type',    form: 'Boxfusion.Ems/incident-types',                       term: 'Broken Arm',                  cell: 'Broken Arm',                  hasEdit: true },
  { key: 'Vehicle Type',     form: 'Boxfusion.Ems/vehicle-types',                        term: 'Auto Test Ambulance',         cell: 'Auto Test Ambulance',         hasEdit: true },
  { key: 'Device',           form: 'Boxfusion.Dispatcher/mobile-devices',                term: 'Auto Test Device',            cell: 'Auto Test Device',            hasEdit: true },
  { key: 'Vehicle',          form: 'Boxfusion.Ems/vehicles',                             term: 'AUTO TEST NC',                cell: 'AUTO TEST NC',                hasEdit: true },
  // Agent & Resource grids split the person into Name / Surname columns (Name="Auto", Surname="Test
  // Agent"/"Test Resource"), so "Auto Test …" never matches one cell. Search + assert by the unique
  // username instead (Username column).
  { key: 'Agent',            form: 'Boxfusion.Dispatcher/agent-roles-table',             term: 'autotestagent',               cell: 'autotestagent',               hasEdit: true },
  { key: 'Resource',         form: 'Boxfusion.Ems/resources',                            term: 'autotestresource',            cell: 'autotestresource',            hasEdit: true },
  { key: 'Station',          form: 'Boxfusion.Dispatcher/dispatch-base',                 term: 'Auto Test Station',           cell: 'Auto Test Station',           hasEdit: true },
  { key: 'Crew',             form: 'Boxfusion.Ems/EmsDispatchTeam-Table',                term: 'AutoTestCrew',                cell: 'AutoTestCrew 003',            hasEdit: false },
  { key: 'Shift',            form: 'boxfusion.shiftmanagement/shift-table',              term: 'Auto Test Shift',             cell: 'Auto Test Shift',             hasEdit: true },
  { key: 'Shift Assignment', form: 'Boxfusion.Dispatcher/dispatch-shift-assignment-table', term: 'AUTO TEST NC',             cell: 'Auto Test Shift',             hasEdit: true },
  { key: 'Site Type',        form: 'Boxfusion.Dispatcher/site-types',                    term: 'Auto Test Site Type',         cell: 'Auto Test Site Type',         hasEdit: true, editCell: '2' },
  { key: 'Point of Interest',form: 'Boxfusion.Ems/emergency-site',                       term: 'Auto Test Point of Interest', cell: 'Auto Test Point of Interest', hasEdit: true, editCell: '0987654321' },
];

test.describe('Administrative Functions — Create/Edit verification (2026-06-17 session)', () => {

  test('TC-00: Log in to NC Dispatch', async ({ page }) => {
    await login(page);
    await expect(page).not.toHaveURL(/\/login/i);
  });

  for (const e of ENTITIES) {
    test.describe(e.key, () => {

      test(`Add ${e.key}`, async ({ page }) => {
        test.setTimeout(60_000);
        await login(page);
        await gotoGrid(page, e.form);
        await searchGrid(page, e.term);
        // ASSERT (BLOCKING) the record we created today is present in the grid.
        await expectRow(page, e.cell);
      });

      if (e.hasEdit) {
        test(`Edit ${e.key}`, async ({ page }) => {
          test.setTimeout(60_000);
          await login(page);
          await gotoGrid(page, e.form);
          await searchGrid(page, e.term);
          // ASSERT the record still persists after the edit we performed.
          await expectRow(page, e.cell);
          // Where the edit changed a grid-visible field, assert the new value.
          if (e.editCell) {
            await expect(page.getByRole('cell', { name: e.editCell, exact: true }).first())
              .toBeVisible({ timeout: 15000 });
          }
        });
      }
    });
  }
});
