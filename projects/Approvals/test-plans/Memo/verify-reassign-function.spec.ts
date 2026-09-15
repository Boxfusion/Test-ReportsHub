// AUTO-RECORDED from test-plans/Memo/verify-reassign-function.md
// Source: Azure DevOps test plan #100853, suite #100854, test case #106169
// The .md plan is canonical. AI-repair will patch failing lines in this file.
// Do not hand-edit unless you are also updating the .md plan.
//
// Confirmed passing live (2026-07-17, 2 consecutive runs). The Reassign dialog's "Step" field is a
// plain button + menuitem list (not an Ant Select), while "Assignee" is the dialog's one genuine Ant
// Select combobox — see the inline notes at STEP 8/9 below for how this was confirmed.

import { test, expect, Page, Locator } from '@playwright/test';

const APP_URL = 'https://pd-approvals-adminportal-qa.azurewebsites.net';
const INITIATOR = { username: 'Ian', password: '123qwe' };
// Reassign target: any user other than the logged-in Ian. "Craig M" is the proven second account
// used throughout this suite (see verify-retract-functionality.spec.ts, verify-send-back.spec.ts).

// This QA environment can sit on an "Initializing..." splash for well over the default 15s action
// timeout before the login form mounts. Give the username field a generous timeout rather than
// failing fast, since the app itself is otherwise up.
async function login(page: Page, creds: { username: string; password: string }) {
  await page.goto(`${APP_URL}/login`, { waitUntil: 'domcontentloaded', timeout: 60_000 });
  await page.getByPlaceholder(/username/i).fill(creds.username, { timeout: 60_000 });
  await page.getByPlaceholder(/password/i).fill(creds.password);
  await page.getByRole('button', { name: /log ?in|sign in/i }).click();
  await page.waitForURL(url => !url.toString().includes('/login'), { timeout: 30_000 });
  await page.waitForLoadState('networkidle');
}

// Sidebar dropdown items (Memos, Workflows, ...) open hover-triggered flyouts that are appended to the
// end of <body> and can intermittently stay mounted over the page, intercepting clicks on whatever is
// underneath. Click actions that land near one are wrapped in a retry that nudges the mouse away and
// tries again.
async function clickWithFlyoutRetry(page: Page, locator: Locator, attempts = 4) {
  for (let i = 0; i < attempts; i++) {
    try {
      await locator.click({ timeout: 6_000 });
      return;
    } catch (err) {
      if (i === attempts - 1) throw err;
      await page.mouse.move(950, 450);
      await page.mouse.move(960, 470);
      await page.waitForTimeout(600);
    }
  }
}

// The Routing step's approver dropdown (and other Ant Design virtualized dropdowns on this app) is
// virtualized (rc-virtual-list) and the first rendered "option" is sometimes an off-screen measurement
// placeholder — the reliable approach is pure keyboard traversal: read the currently highlighted option
// via aria-activedescendant, step forward with ArrowDown until it matches, then press Enter.
async function selectApproverOption(page: Page, matcher: RegExp, maxPresses = 20) {
  for (let i = 0; i < maxPresses; i++) {
    const activeId = await page.evaluate(() => document.activeElement?.getAttribute('aria-activedescendant') ?? null);
    if (activeId) {
      const label = await page.locator(`#${activeId}`).getAttribute('aria-label').catch(() => null);
      if (label && matcher.test(label)) {
        await page.keyboard.press('Enter');
        return;
      }
    }
    await page.keyboard.press('ArrowDown');
  }
  throw new Error(`Could not find an approver option matching ${matcher} within ${maxPresses} ArrowDown presses`);
}

async function switchToLatest(page: Page, viewModeControl: Locator) {
  for (let attempt = 0; attempt < 3; attempt++) {
    await viewModeControl.click();
    await page.waitForTimeout(300);
    await page.getByText('Latest', { exact: true }).click();
    try {
      await expect(viewModeControl).toContainText(/latest/i, { timeout: 5_000 });
      return;
    } catch (err) {
      if (attempt === 2) throw err;
    }
  }
}

// A sidebar flyout can remain mounted/open over a freshly-navigated page if the mouse is still hovering
// near the icon that triggers it — this can intercept clicks on whatever is underneath.
async function dismissSidebarFlyout(page: Page) {
  await page.mouse.move(700, 400);
  await page.waitForTimeout(500);
  await page.keyboard.press('Escape');
  await page.mouse.move(700, 450);
  await page.waitForTimeout(500);
}

// The sidebar toggle's initial state is inconsistent across fresh logins (sometimes already expanded,
// sometimes collapsed to icons-only) — confirmed live by a run where a blind single toggle.click()
// landed on a collapsed/wrong state and an unscoped getByText(/^Memos$/i) then matched an unrelated
// element, navigating to the generic Shesha "Get Started" home page instead. Only click the toggle if
// the sidebar's own "Memos" menu item isn't already visible, and always scope that lookup to the
// sidebar landmark (role=complementary) so it can never match content in the main page area.
async function ensureSidebarExpanded(page: Page, toggle: Locator) {
  const sidebar = page.getByRole('complementary').first();
  const memosItem = sidebar.getByRole('menuitem', { name: /memos/i });
  if (!(await memosItem.first().isVisible().catch(() => false))) {
    await toggle.click();
  }
  await expect(memosItem.first()).toBeVisible({ timeout: 15_000 });
  return memosItem.first();
}

// ADO steps 5-6: "Click on Memos Dropdown" -> "Dashboard Menu should appear" -> "Click on Dashboard
// Menu" -> "Dashboard index table should open successfully". Confirmed live: the sidebar has a
// top-level "Memos" item distinct from "Workflows", which expands to reveal a "Dashboard" entry. This
// opens the "Memos Dashboard" grid — a global, all-users report (not scoped to the initiator's own
// items like My Items), with columns including "Active Step" and "Current Assignee(s)" — matching
// ADO's own expected-result wording for step 13 exactly.
async function goToMemosDashboard(page: Page, toggle: Locator) {
  const memosItem = await ensureSidebarExpanded(page, toggle);
  await clickWithFlyoutRetry(page, memosItem);
  const dashboardMenuItem = page.getByRole('menuitem', { name: /^dashboard$/i }).or(page.getByText(/^Dashboard$/i)).first();
  await expect(dashboardMenuItem).toBeVisible({ timeout: 10_000 });
  await clickWithFlyoutRetry(page, dashboardMenuItem);
  await page.waitForLoadState('networkidle');
}

test('TC-01 — Verify Reassign Function', async ({ page }) => {
  test.setTimeout(180_000);

  const viewModeControl = page.locator('[title="Click to change view mode"]');
  const toggle = page.locator('.ant-layout-sider-trigger, [class*="trigger"], [aria-label*="toggle" i], [aria-label*="menu" i]').first();

  // ===== ADO STEP 1 (id2): "Navigate to login page and log in as Ian (initiator)"
  // Expected: Ian is authenticated and the app redirects away from /login =====
  await login(page, INITIATOR);
  await expect(page).not.toHaveURL(/login/);

  // ===== ADO STEP 2 (id3): "Click the view-mode control, then click 'Latest' in the popover"
  // Expected: popover opens showing Live/Ready/Latest; badge changes from "Live" to "Latest" =====
  await switchToLatest(page, viewModeControl);

  // ===== ADO STEP 3 (id4): "Click the sidebar toggle"
  // Expected: sidebar expands/collapses, exposing the navigation menu =====
  // (Folded into goToMemosDashboard below, which only toggles if the sidebar isn't already expanded —
  // see ensureSidebarExpanded's comment for why a blind, unconditional toggle click was unreliable.)

  // ===== ADO STEP 4 (id5): "Click on Memos Dropdown"
  // Expected: Dashboard Menu should appear =====
  // ===== ADO STEP 5 (id6): "Click on Dashboard Menu"
  // Expected: Dashboard index table should open successfully =====
  await goToMemosDashboard(page, toggle);
  await dismissSidebarFlyout(page);
  await expect(page.getByRole('heading', { name: /memos dashboard/i })).toBeVisible({ timeout: 15_000 });

  // ===== ADO STEP 6 (id7): "Click on any item from the index table with In Progress status, only
  // click on top of the item e.g. on the ref number to highlight the item"
  // Expected: Reassign button should appear on top of the table =====
  // The Dashboard already lists many existing "In Progress" items (it is a global report, not scoped
  // to the initiator's own submissions) — pick the first one whose current assignee isn't already
  // Craig M, so the eventual reassignment is a genuine, observable change.
  // Column order (confirmed live): [0] search icon, [1] Ref Number, [2] Subject, [3] Memo Type,
  // [4] Status, [5] Submitted Date, [6] Submitted By, [7] Submitted By Emp No, [8] Submitted By Unit,
  // [9] Location, [10] Active Step, [11] Current Assignee(s), ...
  const inProgressRows = page.getByRole('row', { name: /in progress/i });
  await expect(inProgressRows.first()).toBeVisible({ timeout: 15_000 });
  const rowCount = await inProgressRows.count();
  let targetRow: Locator | null = null;
  let refNo: string | null = null;
  let activeStep: string | null = null;
  for (let i = 0; i < rowCount; i++) {
    const row = inProgressRows.nth(i);
    const currentAssignee = await row.getByRole('cell').nth(11).textContent();
    if (currentAssignee && !/craig/i.test(currentAssignee)) {
      const refCellText = await row.getByRole('cell').nth(1).textContent();
      const match = refCellText?.match(/REF\d{4}\/\d+(?:\/V\d+)?/i);
      if (match) {
        targetRow = row;
        refNo = match[0];
        activeStep = (await row.getByRole('cell').nth(10).textContent())?.trim() || null;
        break;
      }
    }
  }
  expect(targetRow).not.toBeNull();
  expect(refNo).toBeTruthy();

  // Highlight (select) the row without opening its detail view — click the row itself rather than the
  // ref-number link inside it, matching ADO's "click on top of the item...to highlight" wording.
  // TODO[selector]: exact highlight target not yet confirmed live; clicking the row's first cell
  // (outside the anchor) is the best-effort guess, following the pattern documented for the sibling
  // My Items grid-toolbar Retract button (see test-reports/bugs/2026-07-09-retract-from-myitems-toolbar-fails-500.md).
  await targetRow!.getByRole('cell').first().click({ position: { x: 5, y: 5 } });

  const reassignButton = page.getByRole('button', { name: /reassign/i });
  await expect(reassignButton).toBeVisible({ timeout: 15_000 });

  // ===== ADO STEP 7 (id8): "Click on Reassign button"
  // Expected: Reassign dialog should open successfully =====
  await reassignButton.click();
  const reassignDialog = page.getByRole('dialog').or(page.locator('.ant-modal-content')).first();
  await expect(reassignDialog).toBeVisible({ timeout: 10_000 });

  // ===== ADO STEP 8 (id9): "Click on the Step dropdown and select current active step"
  // Expected: Current step should be displayed in the text area =====
  // Confirmed live (screenshot): getByRole('combobox').first() actually opens the ASSIGNEE list (a
  // focused box showing "Aakil AakilSiv, Admire Chindenga, ... Craig M, Ian Houvet, ..."), proving
  // Assignee is the dialog's only genuine Ant Select combobox. "Step" ("Select a User Task") is a
  // separate, differently-implemented widget — back to the button + menuitem model.
  const stepButton = reassignDialog.getByRole('button', { name: /select a user task/i });
  await clickWithFlyoutRetry(page, stepButton);
  const stepMenuItem = activeStep
    ? page.getByRole('menuitem', { name: new RegExp(activeStep, 'i') })
    : page.getByRole('menuitem').first();
  await expect(stepMenuItem.first()).toBeVisible({ timeout: 10_000 });
  await stepMenuItem.first().click();

  // The read-only "Text field1" mirrors the item's real current step (e.g. "Approve"). It's the only
  // <input> in this dialog that isn't an Ant Select's hidden search box (those render type="search").
  const stepTextField = reassignDialog.locator('input:not([type="search"])').first();
  if (activeStep) {
    await expect(stepTextField).toHaveValue(new RegExp(activeStep, 'i'), { timeout: 10_000 });
  } else {
    await expect(stepTextField).not.toHaveValue('', { timeout: 10_000 });
  }

  // ===== ADO STEP 9 (id10): "Click on the Assignee dropdown"
  // Expected: List of users should be displayed =====
  const assigneeField = reassignDialog.getByRole('combobox').first();
  await assigneeField.click();
  const dropdownPanel = page.locator('.ant-select-dropdown:not(.ant-select-dropdown-hidden)');
  await expect(dropdownPanel).toBeVisible({ timeout: 10_000 });

  // ===== ADO STEP 10 (id11): "Select any user except the current logged in user"
  // Expected: User should be displayed in the text area =====
  await selectApproverOption(page, /craig/i);
  const assigneeFieldContainer = assigneeField.locator('xpath=../..');
  await expect(assigneeFieldContainer).toContainText(/craig/i, { timeout: 10_000 });

  // ===== ADO STEP 11 (id12): "Populate comments"
  // Expected: Comments should be populated successfully =====
  // Comments is the dialog's textarea (Text field1 above is a single-line input, not a textarea).
  const commentsField = reassignDialog.locator('textarea').first();
  await commentsField.click();
  await page.keyboard.type('Test reassign comment');
  await expect(commentsField).toContainText('Test reassign comment', { timeout: 5_000 }).catch(async () => {
    await expect(commentsField).toHaveValue('Test reassign comment', { timeout: 5_000 });
  });

  // ===== ADO STEP 12 (id13): "Click OK Button"
  // Expected: Current assignees column should change and display the user selected in step 10 =====
  const okButton = reassignDialog.getByRole('button', { name: /^ok$/i }).or(reassignDialog.getByRole('button', { name: /reassign/i }));
  await expect(okButton).toBeEnabled({ timeout: 10_000 });
  await okButton.click();

  await expect(reassignDialog).toBeHidden({ timeout: 15_000 });
  await page.waitForLoadState('networkidle');
  await page.waitForTimeout(2000);

  // ASSERT (BLOCKING) Current assignees column updates to show Craig M.
  const refreshedRow = page.getByRole('row', { name: new RegExp(refNo!.replace(/\//g, '\\/')) });
  await expect(refreshedRow).toContainText(/craig/i, { timeout: 15_000 });
});
