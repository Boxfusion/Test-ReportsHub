// AUTO-RECORDED from test-plans/Memo/verify-action-required-auto-populate-action-text.md
// Source: Azure DevOps test plan #100853, suite #100854, test case #105889
// The .md plan is canonical. AI-repair will patch failing lines in this file.
// Do not hand-edit unless you are also updating the .md plan.

import { test, expect, Page, Locator } from '@playwright/test';

const APP_URL = 'https://pd-approvals-adminportal-qa.azurewebsites.net';
const INITIATOR = { username: 'Ian', password: '123qwe' };

// This QA environment can sit on an "Initializing..." splash for well over the default 15s action
// timeout before the login form mounts. Give the username field a generous timeout rather than
// failing fast, since the app itself (verified via curl) is otherwise up.
async function login(page: Page, creds: { username: string; password: string }) {
  await page.goto(`${APP_URL}/login`, { waitUntil: 'domcontentloaded', timeout: 60_000 });
  await page.getByPlaceholder(/username/i).fill(creds.username, { timeout: 60_000 });
  await page.getByPlaceholder(/password/i).fill(creds.password);
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
// genuinely isn't on screen. The reliable approach is pure keyboard traversal: read the currently
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

test('TC-01 — Verify Action Required Auto Populate Action Text', async ({ page }) => {
  test.setTimeout(180_000);

  // STEP 1: NAVIGATE to login page and log in as Ian (initiator)
  await login(page, INITIATOR);
  await expect(page).not.toHaveURL(/login/);

  // STEP 2: CLICK the "Click to change view mode" control to open the Live/Ready/Latest popover,
  // then CLICK the "Latest" option in that popover.
  const viewModeControl = page.locator('[title="Click to change view mode"]');
  for (let attempt = 0; attempt < 3; attempt++) {
    await viewModeControl.click();
    await page.waitForTimeout(300);
    await page.getByText('Latest', { exact: true }).click();
    try {
      await expect(viewModeControl).toContainText(/latest/i, { timeout: 5_000 });
      break;
    } catch (err) {
      if (attempt === 2) throw err;
    }
  }

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

  // STEP 6: CLICK the Create New button. Retried: this button occasionally doesn't open its menu on the
  // first click if the page is still settling.
  const newReferralsItem = page.getByRole('menuitem', { name: /new referrals?/i });
  for (let attempt = 0; attempt < 3; attempt++) {
    await clickWithFlyoutRetry(page, page.getByRole('button', { name: /create new/i }));
    try {
      await expect(newReferralsItem).toBeVisible({ timeout: 6_000 });
      break;
    } catch (err) {
      if (attempt === 2) throw err;
    }
  }

  // STEP 7: CLICK the New Referrals subtype
  await clickWithFlyoutRetry(page, newReferralsItem);

  // STEP 8: POPULATE all mandatory Compose fields and ACTION the item to Routing.
  // The system enforces "The CC recipient must be one of the routing approvers" (confirmed live in
  // #102699) — CC must select the same person who will be added as the routing approver (Craig).
  await expect(page.getByText(/subject/i).first()).toBeVisible({ timeout: 15_000 });
  const ccField = page.getByRole('combobox').nth(1);
  await ccField.click();
  const ccDropdownPanel = page.locator('.ant-select-dropdown:not(.ant-select-dropdown-hidden)');
  await expect(ccDropdownPanel).toBeVisible({ timeout: 10_000 });
  await selectApproverOption(page, /craig/i);
  const ccContainer = ccField.locator('xpath=../..');
  await expect(ccContainer).toContainText(/craig/i, { timeout: 10_000 });

  await page.getByRole('textbox').nth(1).fill('Test Subject');

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
    const text = `Test ${name} input`;
    // On a slow QA environment, page.keyboard.type() into the jodit-wysiwyg editor can be cut short if
    // the editor hasn't finished mounting/focusing — retry the full click+type on mismatch.
    for (let attempt = 0; attempt < 3; attempt++) {
      await editor.click();
      await page.keyboard.type(text);
      try {
        await expect(editor).toContainText(text, { timeout: 6_000 });
        break;
      } catch (err) {
        if (attempt === 2) throw err;
        await editor.fill('').catch(() => {});
        await page.waitForTimeout(500);
      }
    }
  }

  // Retry the Next click itself, not just wait longer, since a click during a still-settling page can be
  // swallowed on a slow environment.
  for (let attempt = 0; attempt < 3; attempt++) {
    await page.getByRole('button', { name: /next/i }).click();
    try {
      await expect(page.getByRole('button', { name: /back/i })).toBeVisible({ timeout: 10_000 });
      break;
    } catch (err) {
      if (attempt === 2) throw err;
    }
  }
  await expect(page.getByRole('tab', { name: /purpose/i })).toHaveCount(0);

  await page.getByRole('button', { name: /next/i }).click();
  await expect(page.getByRole('button', { name: /^next$/i })).toHaveCount(0, { timeout: 15_000 });
  await expect(page.getByRole('button', { name: /submit/i })).toBeVisible();
  await expect(page.getByText(/select approver/i).first()).toBeVisible();

  // STEP 9: RECORD the memo's Ref No for later verification
  const bodyText = await page.locator('body').innerText();
  const refNo = bodyText.match(/REF\d{4}\/\d+/i)?.[0];
  expect(refNo).toBeTruthy();

  // STEP 10: CLICK the Select Signatory dropdown and SELECT "Craig M"
  const approverField = page.getByRole('combobox').first();
  await approverField.click();
  await selectApproverOption(page, /craig/i);
  const approverFieldContainer = approverField.locator('xpath=../..');
  await expect(approverFieldContainer).toContainText(/craig/i, { timeout: 10_000 });

  // STEP 11: CLICK the Add button
  await page.getByRole('button', { name: /add/i }).click();
  await expect(page.getByText(/no approvers/i)).toHaveCount(0, { timeout: 10_000 });
  await expect(page.getByRole('cell', { name: /craig/i }).first()).toBeVisible();

  const rows = page.getByRole('rowgroup').getByRole('row');
  await expect(rows).toHaveCount(1, { timeout: 10_000 });
  const craigRow = rows.first();

  // STEP 12: CLICK the Edit icon on Craig's routing row
  await craigRow.getByRole('button', { name: /edit/i }).click();

  // ASSERT (BLOCKING) Required Action becomes an editable dropdown
  const requiredActionField = craigRow.getByRole('combobox').first();
  await expect(requiredActionField).toBeVisible({ timeout: 10_000 });
  const actionTextField = craigRow.getByRole('textbox').first();
  const actionTextBefore = await actionTextField.inputValue();

  // STEP 13-14: CLICK the Required Action dropdown and SELECT "Recommend".
  // Same Ant Design Select quirk seen for the CC/approver fields (confirmed in #102670): clicking the
  // search <input> directly is intercepted by its own sibling ".ant-select-selection-item" span showing
  // the current value — click that visible span instead. This dropdown's options are not role=option —
  // fall back to plain text matching.
  await craigRow.locator('.ant-select-selection-item').click();
  await page.getByText('Recommend', { exact: true }).click();

  // ASSERT (BLOCKING) Required Action now shows "Recommend" and Action Text auto-populates to match.
  await expect(craigRow.locator('.ant-select-selection-item')).toHaveText(/recommend/i, { timeout: 10_000 });
  await expect(actionTextField).not.toHaveValue(actionTextBefore ?? '', { timeout: 10_000 });
  await expect(actionTextField).toHaveValue(/recommend/i, { timeout: 10_000 });

  // STEP 15: CLICK the Save button to commit the Required Action change.
  await craigRow.getByRole('button', { name: /save/i }).click();

  // ASSERT (BLOCKING) The row exits edit mode and the saved Required Action / Action Text persist.
  await expect(craigRow.getByRole('button', { name: /delete/i })).toBeVisible({ timeout: 10_000 });
  await expect(craigRow.getByRole('combobox')).toHaveCount(0);
  await expect(craigRow).toContainText(/recommend/i);
});
