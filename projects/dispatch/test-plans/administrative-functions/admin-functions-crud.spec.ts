// AUTO-RECORDED from test-plans/administrative-functions/admin-functions-crud.md
// Source: Azure DevOps test plan #65099, suite #65100 (Administrative Functions)
// The .md plan is canonical. AI-repair will patch failing lines in this file.
//
// This suite VERIFIES the create + edit operations performed live on 2026-06-17 (NC Dispatch QA):
// for each Administrative-Functions entity it opens the entity's grid by direct URL, searches for the
// `Auto Test …` record we created, and asserts the row is present. The "Edit …" cases additionally
// assert the edited value where it is visible in the grid (Site Type Levels 1->2; Point of Interest
// contact -> 0987654321). Most entities are verify-only to avoid duplicate test data.
//
// EXCEPTION (Agent): the seed `autotestagent` no longer matches a grid cell, so "Add Agent" now
// genuinely CREATES a fresh agent through the Add-New dialog (unique username per run) and then
// searches + asserts it — selectors recorded live 2026-06-25 (RegisterAgent → 200).

import { test, expect, Page, Locator } from '@playwright/test';

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

// Open an AntD select (click the selector, not the readonly input that intercepts) and pick an option
// by visible text from the rendered dropdown portal.
async function pickAntdSelect(page: Page, sel: Locator, optionText: string) {
  await sel.locator('.ant-select-selector').click();
  await page
    .locator('.ant-select-dropdown:not(.ant-select-dropdown-hidden) .ant-select-item-option', { hasText: optionText })
    .first()
    .click({ timeout: 10000 });
}

// CREATE a brand-new agent via the Add-New dialog on the agent-roles-table grid (must already be on it).
// Uses a unique username per run so re-runs never collide. Returns the username to search/verify.
// Field order in the dialog: Name, Surname, Mobile Number, Email Address, Username, Roles*, Regions*,
// Station(optional), Password*, Verify Password* — recorded live 2026-06-25.
async function createAgentRecord(page: Page): Promise<string> {
  const stamp = Date.now().toString().slice(-9);
  const username = `qatestagent${stamp}`;
  await page.getByRole('button', { name: /Add New/ }).click();
  const modal = page.locator('.ant-modal-content');
  await expect(modal).toBeVisible({ timeout: 15000 });

  const tb = modal.getByRole('textbox');
  await tb.nth(0).fill('QA Auto');                 // Name
  await tb.nth(1).fill(`Agent ${stamp}`);          // Surname
  await tb.nth(2).fill(`0${stamp}`);               // Mobile Number (unique per run — server enforces uniqueness)
  await tb.nth(3).fill(`${username}@test.com`);    // Email Address
  await tb.nth(4).fill(username);                  // Username (overwrites pre-filled admin)

  // Roles* is a multi-select (stays open after pick) — close it before opening Regions.
  await pickAntdSelect(page, modal.locator('.ant-select').nth(0), 'Call Taker');
  await modal.locator('.ant-modal-title').click();
  await pickAntdSelect(page, modal.locator('.ant-select').nth(1), 'Frances Baard');

  await modal.getByRole('textbox', { name: 'Password * :', exact: true }).fill('P@ssw0rd123');
  await modal.getByRole('textbox', { name: 'Verify Password * :' }).fill('P@ssw0rd123');

  await modal.getByRole('button', { name: 'OK' }).click();
  await expect(modal).toBeHidden({ timeout: 20000 });
  return username;
}

interface Entity {
  key: string;        // display name used in the test titles
  form: string;       // Boxfusion.<module>/<form> grid path
  term: string;       // quick-search term
  cell: string;       // grid cell asserted (substring match)
  hasEdit: boolean;   // whether we performed an Edit on this entity today
  editCell?: string;  // exact grid value the edit established (asserted in the Edit case)
  create?: (page: Page) => Promise<string>; // if set, "Add" genuinely creates and returns the term to verify
}

const ENTITIES: Entity[] = [
  { key: 'Incident Type',    form: 'Boxfusion.Ems/incident-types',                       term: 'Broken Arm',                  cell: 'Broken Arm',                  hasEdit: true },
  { key: 'Vehicle Type',     form: 'Boxfusion.Ems/vehicle-types',                        term: 'Auto Test Ambulance',         cell: 'Auto Test Ambulance',         hasEdit: true },
  { key: 'Device',           form: 'Boxfusion.Dispatcher/mobile-devices',                term: 'Auto Test Device',            cell: 'Auto Test Device',            hasEdit: true },
  { key: 'Vehicle',          form: 'Boxfusion.Ems/vehicles',                             term: 'AUTO TEST NC',                cell: 'AUTO TEST NC',                hasEdit: true },
  // Agent & Resource grids split the person into Name / Surname columns (Name="Auto", Surname="Test
  // Agent"/"Test Resource"), so "Auto Test …" never matches one cell. Search + assert by the unique
  // username instead (Username column).
  { key: 'Agent',            form: 'Boxfusion.Dispatcher/agent-roles-table',             term: 'autotestagent',               cell: 'autotestagent',               hasEdit: true, create: createAgentRecord },
  { key: 'Resource',         form: 'Boxfusion.Ems/resources',                            term: 'autotestresource',            cell: 'autotestresource',            hasEdit: true },
  { key: 'Station',          form: 'Boxfusion.Dispatcher/dispatch-base',                 term: 'Auto Test Station',           cell: 'Auto Test Station',           hasEdit: true },
  { key: 'Crew',             form: 'Boxfusion.Ems/EmsDispatchTeam-Table',                term: 'AutoTestCrew',                cell: 'AutoTestCrew 003',            hasEdit: false },
  { key: 'Shift',            form: 'boxfusion.shiftmanagement/shift-table',              term: 'Auto Test Shift',             cell: 'Auto Test Shift',             hasEdit: true },
  // The shift-assignment quick-search does NOT index the vehicle column ('AUTO TEST NC' → 0 hits);
  // it matches the shift/resource/station columns. Search by the assignment's resource instead.
  { key: 'Shift Assignment', form: 'Boxfusion.Dispatcher/dispatch-shift-assignment-table', term: 'Auto Test Resource',      cell: 'Auto Test Shift',             hasEdit: true },
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
        test.setTimeout(90_000);
        await login(page);
        await gotoGrid(page, e.form);
        if (e.create) {
          // Genuinely create the record, then search + assert the new row.
          const term = await e.create(page);
          await searchGrid(page, term);
          await expectRow(page, term);
          return;
        }
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
