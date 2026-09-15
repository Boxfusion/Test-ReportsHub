// AUTO-RECORDED from test-plans/Memo/verify-reorder-signatories.md
// Source: Azure DevOps test plan #100853, suite #100854, test case #102669
// The .md plan is canonical. AI-repair will patch failing lines in this file.
// Do not hand-edit unless you are also updating the .md plan.

import { test, expect, Page, Locator } from '@playwright/test';

const APP_URL = 'https://pd-approvals-adminportal-qa.azurewebsites.net';
const CREDS = { username: 'Ian', password: '123qwe' };

// This QA environment can sit on an "Initializing..." splash for well over the default 15s action
// timeout before the login form mounts. Give the username field a generous timeout rather than
// failing fast, since the app itself (verified via curl) is otherwise up.
async function login(page: Page) {
  await page.goto(`${APP_URL}/login`, { waitUntil: 'domcontentloaded', timeout: 60_000 });
  await page.getByPlaceholder(/username/i).fill(CREDS.username, { timeout: 60_000 });
  await page.getByPlaceholder(/password/i).fill(CREDS.password);
  await page.getByRole('button', { name: /log ?in|sign in/i }).click();
  await page.waitForURL(url => !url.toString().includes('/login'), { timeout: 30_000 });
  await page.waitForLoadState('networkidle');
}

// The Workflows sidebar item opens a hover-triggered flyout (Inbox/My Items/Sent Items/Drafts) that is
// appended to the end of <body> and intermittently stays mounted over the page, intercepting clicks on
// whatever is underneath. Click actions that land near it are wrapped in a retry that nudges the mouse
// away and tries again.
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

// The Routing step's approver dropdown is virtualized (rc-virtual-list) and the first rendered "option"
// is sometimes an off-screen measurement placeholder that happens to carry the real first item's
// aria-label — clicking it (even with force) fails with "Element is outside of the viewport" because it
// genuinely isn't on screen. Typing a search filter also mis-fired here (the input ended up showing
// literal text "unknown"). The reliable approach is pure keyboard traversal: read the currently
// highlighted option via aria-activedescendant, step forward with ArrowDown until it matches, then
// press Enter — this never depends on any option's visibility or bounding box.
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

test('TC-01 — Verify user can reorder signatories', async ({ page }) => {
  test.setTimeout(240_000);

  // STEP 1: NAVIGATE to login page and log in with valid credentials
  await login(page);
  await expect(page).not.toHaveURL(/login/);

  // STEP 2: CLICK the "Click to change view mode" control to open the Live/Ready/Latest popover,
  // then CLICK the "Latest" option in that popover.
  const viewModeControl = page.locator('[title="Click to change view mode"]');
  await viewModeControl.click();
  await page.getByText('Latest', { exact: true }).click();
  await expect(viewModeControl).toContainText(/latest/i, { timeout: 10_000 });

  // STEP 3: CLICK the sidebar Toggle in the top-left corner
  const toggle = page.locator('.ant-layout-sider-trigger, [class*="trigger"], [aria-label*="toggle" i], [aria-label*="menu" i]').first();
  await toggle.click();

  // STEP 4: CLICK the Workflows dropdown
  await page.getByText(/^Workflows?$/i).first().click();
  await expect(page.getByText(/^Inbox$/i).first()).toBeVisible({ timeout: 10_000 });

  // STEP 5: CLICK the My Items menu item
  await page.goto(`${APP_URL}/dynamic/Shesha.Workflow/workflows-my-items`, { waitUntil: 'domcontentloaded', timeout: 30_000 });
  await page.waitForLoadState('networkidle');
  await expect(page.getByRole('button', { name: /create new/i })).toBeVisible({ timeout: 15_000 });

  // STEP 6: CLICK the Create New button
  await clickWithFlyoutRetry(page, page.getByRole('button', { name: /create new/i }));

  // STEP 7: CLICK the New Referrals subtype
  await expect(page.getByRole('menuitem', { name: /new referrals?/i })).toBeVisible({ timeout: 10_000 });
  await clickWithFlyoutRetry(page, page.getByRole('menuitem', { name: /new referrals?/i }));

  // STEP 8: CLICK the CC field and SELECT a signatory
  await expect(page.getByText(/subject/i).first()).toBeVisible({ timeout: 15_000 });
  const ccField = page.getByRole('combobox').nth(1);
  await ccField.click();
  const dropdownPanel = page.locator('.ant-select-dropdown:not(.ant-select-dropdown-hidden)');
  await expect(dropdownPanel).toBeVisible({ timeout: 10_000 });
  await page.keyboard.press('ArrowDown');
  await page.keyboard.press('Enter');
  const ccContainer = ccField.locator('xpath=../..');
  const signatoryName = (await ccContainer.textContent())?.trim();
  expect(signatoryName && signatoryName.length > 0).toBeTruthy();

  // STEP 9: CLICK the Subject text field and populate it with test input
  await page.getByRole('textbox').nth(1).fill('Test Subject');

  // STEP 10: CLICK each of the Purpose, Background, Discussion, Financial Implications, Risks and
  // Recommendation tabs individually, populating and verifying each one before moving to the next.
  const tabNames = ['Purpose', 'Background', 'Discussion', 'Financial Implications', 'Risks', 'Recommendation'];
  for (const name of tabNames) {
    const tab = page.getByRole('tab', { name: new RegExp(name, 'i') });
    for (let attempt = 0; attempt < 3; attempt++) {
      await tab.click();
      try {
        await expect(tab).toHaveAttribute('aria-selected', 'true', { timeout: 4_000 });
        break;
      } catch (err) {
        if (attempt === 2) throw err;
        await page.waitForTimeout(500);
      }
    }
    const editor = page.locator('[contenteditable="true"]:visible').first();
    await editor.click();
    const text = `Test ${name} input`;
    await page.keyboard.type(text);
    await expect(editor).toContainText(text, { timeout: 10_000 });
  }

  // STEP 11: CLICK the Next button (Compose -> Attachments)
  await page.getByRole('button', { name: /next/i }).click();
  await expect(page.getByRole('button', { name: /back/i })).toBeVisible({ timeout: 15_000 });
  await expect(page.getByRole('tab', { name: /purpose/i })).toHaveCount(0);

  // STEP 12: CLICK the Next button (Attachments -> Routing)
  await page.getByRole('button', { name: /next/i }).click();
  await expect(page.getByRole('button', { name: /^next$/i })).toHaveCount(0, { timeout: 15_000 });
  await expect(page.getByRole('button', { name: /submit/i })).toBeVisible();
  await expect(page.getByText(/select approver/i).first()).toBeVisible();

  // The approver dropdown's option list is short and fully rendered (no rc-virtual-list windowing,
  // unlike the CC field's signatory list) — click each option directly by its visible text rather than
  // typing a filter and pressing ArrowDown/Enter. That approach malfunctioned here: the search input
  // ended up showing literal text "unknown" and Enter re-selected the already-added approver, which the
  // app correctly rejected with "Duplicates are restricted. Add a different approver."
  const approverField = page.getByRole('combobox').first();

  // STEP 13: CLICK the Select Signatory dropdown and SELECT "Admire"
  await approverField.click();
  await selectApproverOption(page, /admire/i);
  await expect(page.getByText(/admire/i).first()).toBeVisible({ timeout: 10_000 });

  // STEP 14: CLICK the Add button
  await page.getByRole('button', { name: /add/i }).click();
  await expect(page.getByText(/no approvers/i)).toHaveCount(0, { timeout: 10_000 });
  await expect(page.getByRole('cell', { name: /admire/i }).first()).toBeVisible();

  // STEP 15: CLICK the Select Signatory dropdown and SELECT "Kopano"
  await approverField.click();
  await selectApproverOption(page, /kopano/i);
  await expect(page.getByText(/kopano/i).first()).toBeVisible({ timeout: 10_000 });

  // STEP 16: CLICK the Add button
  await page.getByRole('button', { name: /add/i }).click();
  await expect(page.getByText(/duplicates are restricted/i)).toHaveCount(0, { timeout: 5_000 });
  await expect(page.getByRole('cell', { name: /kopano/i }).first()).toBeVisible({ timeout: 10_000 });

  // ASSERT (BLOCKING) Admire is row 1, Kopano is row 2 before reordering.
  // This routing table is a custom Shesha component, not a standard Ant Design <Table> — neither
  // "table tbody tr" nor ".ant-table-row" match anything. It does expose proper table semantics though
  // (role=row/rowgroup/cell), so scope to the data rowgroup's rows to exclude the header row.
  const rows = page.getByRole('rowgroup').getByRole('row');
  await expect(rows).toHaveCount(2, { timeout: 10_000 });
  await expect(rows.nth(0)).toContainText(/admire/i);
  await expect(rows.nth(1)).toContainText(/kopano/i);

  // STEP 17: DRAG the last signatory (Kopano, row 2) into the first row of the routing table.
  // The table's first (narrow) column holds a drag-handle icon (the ⋮ dots visible in each row) rather
  // than the row itself being draggable — and most sortable-table libraries listen to raw pointer
  // events rather than HTML5 dragstart/drop, so a manual mouse down/move/up sequence with intermediate
  // steps is used instead of Locator.dragTo().
  const kopanoRow = rows.nth(1);
  const admireRow = rows.nth(0);
  const kopanoHandle = kopanoRow.getByRole('cell').first();
  const admireHandleBox = await admireRow.getByRole('cell').first().boundingBox();
  const kopanoHandleBox = await kopanoHandle.boundingBox();
  expect(kopanoHandleBox).toBeTruthy();
  expect(admireHandleBox).toBeTruthy();

  if (kopanoHandleBox && admireHandleBox) {
    const startX = kopanoHandleBox.x + kopanoHandleBox.width / 2;
    const startY = kopanoHandleBox.y + kopanoHandleBox.height / 2;
    const endX = admireHandleBox.x + admireHandleBox.width / 2;
    const endY = admireHandleBox.y + 2; // drop just above Admire's row to land ahead of it

    await page.mouse.move(startX, startY);
    await page.mouse.down();
    await page.mouse.move(startX, startY - 10, { steps: 5 });
    await page.mouse.move(endX, endY, { steps: 15 });
    await page.mouse.move(endX, endY, { steps: 2 });
    await page.mouse.up();
  }

  // ASSERT (BLOCKING) After dragging, Kopano appears before Admire in the routing table
  await expect(rows.nth(0)).toContainText(/kopano/i, { timeout: 10_000 });
  await expect(rows.nth(1)).toContainText(/admire/i);
});
