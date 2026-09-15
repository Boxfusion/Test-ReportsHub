// AUTO-RECORDED from test-plans/Memo/verify-send-back.md
// Source: Azure DevOps test plan #100853, suite #100854, test case #105862
// The .md plan is canonical. AI-repair will patch failing lines in this file.
// Do not hand-edit unless you are also updating the .md plan.

import { test, expect, Page, Locator } from '@playwright/test';

const APP_URL = 'https://pd-approvals-adminportal-qa.azurewebsites.net';
const INITIATOR = { username: 'Ian', password: '123qwe' };
const RECOMMENDER = { username: 'Craig', password: '123qwe' };

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

// The Routing step's approver dropdown (and other Ant Design virtualized dropdowns on this app) is
// virtualized (rc-virtual-list) and the first rendered "option" is sometimes an off-screen measurement
// placeholder that happens to carry the real first item's aria-label — clicking it (even with force)
// fails with "Element is outside of the viewport" because it genuinely isn't on screen. The reliable
// approach is pure keyboard traversal: read the currently highlighted option via aria-activedescendant,
// step forward with ArrowDown until it matches, then press Enter — this never depends on any option's
// visibility or bounding box.
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

// Re-runs the header's Live -> Latest view-mode switch. A fresh login always resets this to "Live", so
// it must be repeated after every login (Ian, then Craig, then Ian again).
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

test('TC-01 — Verify Send Back', async ({ page }) => {
  test.setTimeout(360_000);

  // STEP 1: NAVIGATE to login page and log in as Ian (initiator)
  await login(page, INITIATOR);
  await expect(page).not.toHaveURL(/login/);

  // STEP 2: Live -> Latest
  const viewModeControl = page.locator('[title="Click to change view mode"]');
  await switchToLatest(page, viewModeControl);

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

  // STEP 8: POPULATE all mandatory Compose fields and ACTION the item to Routing.
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
    // AI-repair: on a slow QA environment, page.keyboard.type() into the jodit-wysiwyg editor can be cut
    // short (observed truncated to "Test Dis" for "Test Discussion input") if the editor hasn't finished
    // mounting/focusing. Retry the full click+type on mismatch rather than assuming a one-shot type lands.
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

  // AI-repair: the environment has been slow today (180 accumulated test items in My Items) — retry the
  // Next click itself, not just wait longer, since a click during a still-settling page can be swallowed.
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

  // STEP 9: RECORD the memo's Ref No for later verification (before submitting)
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
  await craigRow.locator('.ant-select-selection-item').click();
  await page.getByText('Recommend', { exact: true }).click();

  // ASSERT (BLOCKING) Required Action now shows "Recommend" and Action Text updates accordingly.
  await expect(craigRow.locator('.ant-select-selection-item')).toHaveText(/recommend/i, { timeout: 10_000 });
  await expect(actionTextField).not.toHaveValue(actionTextBefore ?? '', { timeout: 10_000 });
  await expect(actionTextField).toHaveValue(/recommend/i, { timeout: 10_000 });

  // STEP 15: CLICK the Save button to commit the Required Action change
  await craigRow.getByRole('button', { name: /save/i }).click();
  await expect(craigRow.getByRole('button', { name: /delete/i })).toBeVisible({ timeout: 10_000 });

  // STEP 16: CLICK the Submit button
  await page.getByRole('button', { name: /submit/i }).click();

  // ASSERT (BLOCKING) Submitting shows a success confirmation
  await expect(page.getByText(/you have successfully submitted/i)).toBeVisible({ timeout: 20_000 });
  await expect(page.getByText(refNo!, { exact: true })).toBeVisible();
  await expect(page.getByText(/craig m/i).first()).toBeVisible();

  // The Confirmation step (step 4) still shows a "Confirm" button — click it to finalize.
  await page.getByRole('button', { name: /^confirm$/i }).click();
  await page.waitForTimeout(1_000);

  // STEP 17: LOG OUT of Ian's session and LOG IN as Craig (recommender).
  await page.getByText(/ian houvet/i).first().click();
  await page.getByText(/logout/i).click();
  await page.waitForURL(url => url.toString().includes('/login'), { timeout: 30_000 });
  await login(page, RECOMMENDER);
  await expect(page).not.toHaveURL(/login/);
  await expect(page.getByText(/craig/i).first()).toBeVisible({ timeout: 15_000 });

  // Repeat Live -> Latest switch for Craig's session.
  await switchToLatest(page, viewModeControl);

  // STEP 18: NAVIGATE to Workflows -> Inbox
  await page.goto(`${APP_URL}/dynamic/Shesha.Workflow/workflows-inbox`, { waitUntil: 'domcontentloaded', timeout: 30_000 });
  await page.waitForLoadState('networkidle');
  await expect(page.getByText(/incoming items/i)).toBeVisible({ timeout: 15_000 });

  // STEP 19: OPEN the item matching the recorded Ref No (the first cell's search-icon link opens it)
  await page.getByPlaceholder(/search/i).or(page.getByRole('textbox').first()).fill(refNo!);
  await page.keyboard.press('Enter');
  const targetRow = page.getByRole('row', { name: new RegExp(refNo!.replace('/', '\\/')) });
  await expect(targetRow).toBeVisible({ timeout: 15_000 });
  await targetRow.getByRole('cell').first().locator('a').first().click();

  // ASSERT (BLOCKING) Opening the item shows the review/action screen for the submitted item.
  await page.waitForURL(/workflow-action/, { timeout: 20_000 });
  await page.waitForLoadState('networkidle');
  await expect(page.locator('.ant-spin, .ant-skeleton').first()).toHaveCount(0, { timeout: 30_000 }).catch(() => {});
  await page.waitForTimeout(2000);

  // STEP 20: CLICK the "Send Back" button. Confirmed live in #105864: this screen has a plain
  // role=button "Send Back" alongside Recommend/Do not Recommend, Submit, Withdraw, Take Ownership,
  // Send To Approver First and the Close link.
  const sendBackButton = page.getByRole('button', { name: 'Send Back', exact: true });
  await expect(sendBackButton).toBeVisible({ timeout: 15_000 });
  await sendBackButton.click();

  // ASSERT (BLOCKING) "Send Back" dialog appears with a user-task/user dropdown.
  // TODO[selector]: exact dialog title not yet confirmed live — using a role=dialog scope filtered by
  // its heading text, with a combobox for the user task and a textbox for Comments, following the same
  // pattern proven for the Withdraw and Send To Approver First dialogs.
  const sendBackDialog = page.getByRole('dialog').filter({ hasText: /send back/i });
  await expect(sendBackDialog).toBeVisible({ timeout: 10_000 });

  // STEP 21: CLICK the "Select A user task" dropdown.
  // AI-repair (confirmed live): unlike the Routing/Send-To-Approver-First fields, this is a plain
  // role=button "Select a User Task down" (same button+menu pattern as the "Create New" button used in
  // STEP 6), not an Ant Select combobox — it opens a menu of role=menuitem options.
  const userTaskButton = sendBackDialog.getByRole('button', { name: /select a user task/i });
  await clickWithFlyoutRetry(page, userTaskButton);

  // STEP 22: SELECT "Ian" from the list
  // AI-repair (confirmed live): once selected, the trigger button's own accessible name changes away
  // from "Select a User Task" (to something like "Ian Houvet down") — a locator filtered on the old name
  // stops matching anything post-selection. Assert on the dialog's content instead of that stale handle.
  const ianMenuItem = page.getByRole('menuitem', { name: /ian/i });
  await expect(ianMenuItem).toBeVisible({ timeout: 10_000 });
  await ianMenuItem.click();
  await expect(sendBackDialog).toContainText(/ian/i, { timeout: 10_000 });

  // STEP 23: POPULATE the Comments field
  const sendBackComments = sendBackDialog.getByRole('textbox').last();
  await sendBackComments.fill('Test send back comment');

  // STEP 24: CLICK the "Send Back" button on the dialog
  const confirmSendBackButton = sendBackDialog.getByRole('button', { name: 'Send Back', exact: true });
  await expect(confirmSendBackButton).toBeEnabled({ timeout: 10_000 });
  await confirmSendBackButton.click();

  // ASSERT (BLOCKING) System auto refreshes.
  // AI-repair (confirmed live): confirming Send Back does NOT navigate away to a list — it refreshes the
  // same item detail page in place. The heading reverts from "Recommend: ..." to "New Referrals: ...",
  // status shows "Draft", and Craig's action controls (Withdraw/Submit/Send Back) disappear since his
  // part is done — only Preview and Close remain. Assert on that observable state instead.
  await expect(sendBackButton).toHaveCount(0, { timeout: 20_000 });
  await expect(page.getByText(/^draft$/i).first()).toBeVisible({ timeout: 10_000 });

  // STEP 25: LOG OUT of Craig's session and LOG IN as Ian (initiator).
  await page.getByText(/craig m/i).first().click();
  await page.getByText(/logout/i).click();
  await page.waitForURL(url => url.toString().includes('/login'), { timeout: 30_000 });
  await login(page, INITIATOR);
  await expect(page).not.toHaveURL(/login/);
  await expect(page.getByText(/ian/i).first()).toBeVisible({ timeout: 15_000 });

  // Repeat Live -> Latest switch for Ian's second session.
  await switchToLatest(page, viewModeControl);

  // STEP 26: NAVIGATE to Workflows -> Inbox
  await page.goto(`${APP_URL}/dynamic/Shesha.Workflow/workflows-inbox`, { waitUntil: 'domcontentloaded', timeout: 30_000 });
  await page.waitForLoadState('networkidle');
  await expect(page.getByText(/incoming items/i)).toBeVisible({ timeout: 15_000 });

  // STEP 27: OPEN the item matching the recorded Ref No
  await page.getByPlaceholder(/search/i).or(page.getByRole('textbox').first()).fill(refNo!);
  await page.keyboard.press('Enter');
  const ianTargetRow = page.getByRole('row', { name: new RegExp(refNo!.replace('/', '\\/')) });
  await expect(ianTargetRow).toBeVisible({ timeout: 15_000 });
  await ianTargetRow.getByRole('cell').first().locator('a').first().click();

  // ASSERT (BLOCKING) The item opens to a review step with Comments, Cancel and Submit controls.
  await page.waitForURL(/workflow-action/, { timeout: 20_000 });
  await page.waitForLoadState('networkidle');
  await expect(page.locator('.ant-spin, .ant-skeleton').first()).toHaveCount(0, { timeout: 30_000 }).catch(() => {});
  await page.waitForTimeout(2000);
  const ianSubmitButton = page.getByRole('button', { name: /submit/i }).last();
  await expect(ianSubmitButton).toBeVisible({ timeout: 15_000 });

  // STEP 28: POPULATE the Comments field.
  // AI-repair (confirmed live): unlike the Recommend/Withdraw/Send-To-Approver-First dialogs, this
  // "Supporting Comments" textbox has no placeholder text and no programmatically-associated label — it's
  // simply the only textbox in the "Memo Action" tabpanel on this Compile Draft resubmission screen.
  const ianComments = page.getByRole('tabpanel', { name: /memo action/i }).getByRole('textbox').first();
  await ianComments.fill('Test resubmission comment');

  // STEP 29: CLICK the Submit button
  await ianSubmitButton.scrollIntoViewIfNeeded();
  await ianSubmitButton.click();

  // ASSERT (BLOCKING) The item is submitted successfully — the review controls are no longer shown,
  // evidencing the resubmission posted and the item moved on.
  await expect(ianSubmitButton).toHaveCount(0, { timeout: 20_000 });
});
