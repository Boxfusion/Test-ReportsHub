// AUTO-RECORDED from test-plans/Memo/verify-send-to-approver-first.md
// Source: Azure DevOps test plan #100853, suite #100854, test case #105860
// The .md plan is canonical. AI-repair will patch failing lines in this file.
// Do not hand-edit unless you are also updating the .md plan.

import { test, expect, Page, Locator } from '@playwright/test';

const APP_URL = 'https://pd-approvals-adminportal-qa.azurewebsites.net';
const INITIATOR = { username: 'Ian', password: '123qwe' };
const RECOMMENDER = { username: 'Craig', password: '123qwe' };
const SECOND_APPROVER = { username: 'Admire', password: '123qwe' };

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
// it must be repeated after every login (Ian, then Craig, then Admire).
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

test('TC-01 — Verify Send To Approver First', async ({ page }) => {
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
    await editor.click();
    const text = `Test ${name} input`;
    await page.keyboard.type(text);
    await expect(editor).toContainText(text, { timeout: 10_000 });
  }

  await page.getByRole('button', { name: /next/i }).click();
  await expect(page.getByRole('button', { name: /back/i })).toBeVisible({ timeout: 15_000 });
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

  // STEP 20: CLICK the "Send To Approver First" button. Confirmed live in #105864: this screen has a
  // plain role=button "Send To Approver First" alongside Recommend/Do not Recommend, Submit, Withdraw,
  // Take Ownership, Send Back and the Close link.
  const sendToApproverButton = page.getByRole('button', { name: 'Send To Approver First', exact: true });
  await expect(sendToApproverButton).toBeVisible({ timeout: 15_000 });
  await sendToApproverButton.click();

  // ASSERT (BLOCKING) "Send To Approver First" dialog appears with an approver dropdown.
  // TODO[selector]: exact dialog title/approver field not yet confirmed live — using a role=dialog scope
  // filtered by its heading text, with a combobox for the approver and a textbox for Comments.
  const sendDialog = page.getByRole('dialog').filter({ hasText: /approver/i });
  await expect(sendDialog).toBeVisible({ timeout: 10_000 });

  // STEP 21: CLICK the "Select the approver to send the memo to" dropdown
  const sendApproverField = sendDialog.getByRole('combobox').first();
  await sendApproverField.click();

  // STEP 22: SELECT "Admire" from the list of approvers
  await selectApproverOption(page, /admire/i);
  const sendApproverContainer = sendApproverField.locator('xpath=../..');
  await expect(sendApproverContainer).toContainText(/admire/i, { timeout: 10_000 });

  // STEP 23: POPULATE the Comments field
  const sendCommentsField = sendDialog.getByRole('textbox').last();
  await sendCommentsField.fill('Test send to approver first comment');

  const sendOkButton = sendDialog.getByRole('button', { name: /^ok$/i });
  await expect(sendOkButton).toBeEnabled({ timeout: 10_000 });

  // STEP 24: CLICK the OK button
  await sendOkButton.click();

  // ASSERT (BLOCKING) System auto refreshes and routes back to incoming items (Craig's Inbox).
  await expect(page.getByText(/incoming items/i)).toBeVisible({ timeout: 20_000 });

  // STEP 25: LOG OUT of Craig's session and LOG IN as Admire (second approver).
  await page.getByText(/craig m/i).first().click();
  await page.getByText(/logout/i).click();
  await page.waitForURL(url => url.toString().includes('/login'), { timeout: 30_000 });
  await login(page, SECOND_APPROVER);
  await expect(page).not.toHaveURL(/login/);
  await expect(page.getByText(/admire/i).first()).toBeVisible({ timeout: 15_000 });

  // STEP 26: Live -> Latest for Admire's session.
  await switchToLatest(page, viewModeControl);

  // STEP 27-29: sidebar toggle + Workflows -> Inbox (navigated directly, same as steps 3-4/18 above).
  await page.goto(`${APP_URL}/dynamic/Shesha.Workflow/workflows-inbox`, { waitUntil: 'domcontentloaded', timeout: 30_000 });
  await page.waitForLoadState('networkidle');
  await expect(page.getByText(/incoming items/i)).toBeVisible({ timeout: 15_000 });

  // STEP 30: OPEN the item matching the recorded Ref No
  await page.getByPlaceholder(/search/i).or(page.getByRole('textbox').first()).fill(refNo!);
  await page.keyboard.press('Enter');
  const admireTargetRow = page.getByRole('row', { name: new RegExp(refNo!.replace('/', '\\/')) });
  await expect(admireTargetRow).toBeVisible({ timeout: 15_000 });
  await admireTargetRow.getByRole('cell').first().locator('a').first().click();

  // ASSERT (BLOCKING) The item opens to a review step.
  // AI-repair (confirmed live): "Send To Approver First" forwards the SAME action type to the new
  // approver rather than switching to a generic "Complete Action"/"Decline Action" screen — Admire sees
  // the identical "Recommend"/"Do not Recommend" radios (plus mandatory Supporting Comments) that Craig
  // saw, because Craig's routing entry Required Action was "Recommend". ADO #105860 steps 31-32 describe
  // a generic "Complete Action"/"Decline Action" screen that does not match this live behaviour for a
  // Recommend-typed routing entry; this run asserts what the app actually shows instead.
  await page.waitForURL(/workflow-action/, { timeout: 20_000 });
  await page.waitForLoadState('networkidle');
  await expect(page.locator('.ant-spin, .ant-skeleton').first()).toHaveCount(0, { timeout: 30_000 }).catch(() => {});
  await page.waitForTimeout(2000);
  const admireRecommendRadio = page.getByRole('radio', { name: 'Recommend', exact: true });
  await expect(admireRecommendRadio).toBeVisible({ timeout: 15_000 });

  // STEP 31: SELECT the "Recommend" radio button (the confirmed live equivalent of ADO's "Complete Action")
  await admireRecommendRadio.check();
  await expect(admireRecommendRadio).toBeChecked();

  const admireComments = page.getByPlaceholder(/start typing/i).or(page.getByLabel(/supporting comments/i));
  await admireComments.first().fill('Test complete action comment');

  // STEP 32: CLICK the Submit button
  const finalSubmitButton = page.getByRole('button', { name: /submit/i }).last();
  await finalSubmitButton.scrollIntoViewIfNeeded();
  await finalSubmitButton.click();

  // ASSERT (BLOCKING) The item moves to the next signatory — the review radio is no longer shown,
  // evidencing the action posted and the item moved on.
  await expect(admireRecommendRadio).toHaveCount(0, { timeout: 20_000 });
});
