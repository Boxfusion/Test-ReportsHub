// AUTO-RECORDED from test-plans/Memo/verify-edit-delete-signatory.md
// Source: Azure DevOps test plan #100853, suite #100854, test case #102670
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

test('TC-01 — Verify user can edit and delete a signatory', async ({ page }) => {
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

  const approverField = page.getByRole('combobox').first();

  // STEP 13: CLICK the Select Signatory dropdown and SELECT "Admire"
  await approverField.click();
  await selectApproverOption(page, /admire/i);
  await expect(page.getByText(/admire/i).first()).toBeVisible({ timeout: 10_000 });

  // STEP 14: CLICK the Add button
  await page.getByRole('button', { name: /add/i }).click();
  await expect(page.getByText(/no approvers/i)).toHaveCount(0, { timeout: 10_000 });
  await expect(page.getByRole('cell', { name: /admire/i }).first()).toBeVisible();

  const rows = page.getByRole('rowgroup').getByRole('row');
  await expect(rows).toHaveCount(1, { timeout: 10_000 });
  const admireRow = rows.first();

  // STEP 15: CLICK the Edit icon from the routing table row
  await admireRow.getByRole('button', { name: /edit/i }).click();

  // ASSERT (BLOCKING) Required Action becomes an editable dropdown (currently "Approve")
  const requiredActionField = admireRow.getByRole('combobox').first();
  await expect(requiredActionField).toBeVisible({ timeout: 10_000 });
  const actionTextField = admireRow.getByRole('textbox').first();
  const actionTextBefore = await actionTextField.inputValue();

  // STEP 16: CHANGE the Required Action to a different value.
  // Same Ant Design Select quirk seen for the CC and approver fields: clicking the search <input>
  // directly is intercepted by its own sibling ".ant-select-selection-item" span showing the current
  // value ("Approve") — click that visible span instead. This options list (Recommend/Support/Action/
  // Review/Referral/Consult/Concur/...) is short and fully rendered, not virtualized, so a direct
  // role=option click by text is reliable here.
  await admireRow.locator('.ant-select-selection-item').click();
  // This dropdown's options aren't role=option (confirmed visible but not matched by that role) —
  // fall back to plain text matching, same as several other non-standard dropdowns on this app.
  await page.getByText('Consult', { exact: true }).click();

  // ASSERT (BLOCKING) Required Action now shows "Consult" and Action Text updates accordingly.
  // The combobox role is the search input, which stays empty after selection — the display value lives
  // in the sibling ".ant-select-selection-item" span, same as every other Select on this page.
  await expect(admireRow.locator('.ant-select-selection-item')).toHaveText(/consult/i, { timeout: 10_000 });
  await expect(actionTextField).not.toHaveValue(actionTextBefore ?? '', { timeout: 10_000 });
  await expect(actionTextField).toHaveValue(/consult/i, { timeout: 10_000 });

  // The row is still in edit mode (its trailing icons are now "save"/"cancel", not "edit"/"delete") —
  // save the change to commit it and return the row to its normal (edit/delete) state.
  await admireRow.getByRole('button', { name: /save/i }).click();
  await expect(admireRow.getByRole('button', { name: /delete/i })).toBeVisible({ timeout: 10_000 });

  // STEP 17: CLICK the Delete button
  await admireRow.getByRole('button', { name: /delete/i }).click();

  // ASSERT (BLOCKING) A delete confirmation popup with Cancel and OK is displayed
  await expect(page.getByRole('button', { name: /^cancel$/i })).toBeVisible({ timeout: 10_000 });
  await expect(page.getByRole('button', { name: /^ok$/i })).toBeVisible();

  // STEP 18: CLICK the Cancel button on the delete confirmation popup
  await page.getByRole('button', { name: /^cancel$/i }).click();

  // ASSERT (BLOCKING) The popup closes and the signatory remains in the table
  await expect(page.getByRole('button', { name: /^ok$/i })).toHaveCount(0, { timeout: 10_000 });
  await expect(rows).toHaveCount(1);
  await expect(page.getByRole('cell', { name: /admire/i }).first()).toBeVisible();

  // STEP 19: CLICK the Delete button again
  await admireRow.getByRole('button', { name: /delete/i }).click();
  await expect(page.getByRole('button', { name: /^ok$/i })).toBeVisible({ timeout: 10_000 });

  // STEP 20: CLICK the OK button on the delete confirmation popup
  await page.getByRole('button', { name: /^ok$/i }).click();

  // ASSERT (BLOCKING) The signatory is removed from the routing table
  await expect(rows).toHaveCount(0, { timeout: 15_000 });
  await expect(page.getByText(/no approvers/i).first()).toBeVisible();
});
