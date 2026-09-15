// AUTO-RECORDED from test-plans/Memo/verify-can-edit-enabled-shows-edit-button.md
// Source: Azure DevOps test plan #100853, suite #100854, test case #105897
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

// Re-runs the header's Live -> Latest view-mode switch. A fresh login always resets this to "Live", so
// it must be repeated after every login.
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

// The Memo Contents tab is a flat expandable list — one row per content field (Purpose, Background,
// Discussion, Financial Implications, Risks, Recommendation), each with its own "Edit"/"audit" button
// pair. Scope narrowly to the Purpose row specifically rather than assuming Purpose is first in DOM
// order. Anchor on the "audit" button, not "Edit" — this is a lazy Playwright locator re-evaluated on
// every use, and the row's "Edit" button itself changes (to Save/Cancel) once edit mode activates, which
// would make an "Edit"-anchored locator silently stop matching anything after the click. The audit/history
// button is unaffected by the edit toggle and stays a stable anchor across both states.
function purposeRow(memoContentsPanel: Locator) {
  return memoContentsPanel.locator(
    'xpath=.//*[normalize-space(text())="Purpose"]/ancestor::*[.//button[contains(., "audit")]][1]'
  );
}

test('TC-01 — Verify Can Edit Enabled Shows Edit Button', async ({ page }) => {
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

  // STEP 6: CLICK the Create New button. Retried: this occasionally doesn't open its menu on the first
  // click if the page is still settling.
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
  await craigRow.locator('.ant-select-selection-item').first().click();
  await page.getByText('Recommend', { exact: true }).click();

  // ASSERT (BLOCKING) Required Action now shows "Recommend" and Action Text updates accordingly.
  await expect(craigRow.locator('.ant-select-selection-item').first()).toHaveText(/recommend/i, { timeout: 10_000 });
  await expect(actionTextField).not.toHaveValue(actionTextBefore ?? '', { timeout: 10_000 });
  await expect(actionTextField).toHaveValue(/recommend/i, { timeout: 10_000 });

  // STEP 15: CLICK the Save button to commit the Required Action change
  await craigRow.getByRole('button', { name: /save/i }).click();
  await expect(craigRow.getByRole('button', { name: /delete/i })).toBeVisible({ timeout: 10_000 });

  // STEP 16: CLICK the Edit icon on Craig's routing row again
  await craigRow.getByRole('button', { name: /edit/i }).click();
  await expect(requiredActionField).toBeVisible({ timeout: 10_000 });

  // STEP 17: CLICK the Can Edit dropdown.
  // Confirmed live: the row's columns are Name, Title, Required Action, Action Text, Can Edit,
  // Is Deletable (plus a leading "more" cell and trailing actions cell) — Can Edit is cell index 5.
  // Unlike Required Action, Can Edit starts with no value selected, so Ant Select hasn't rendered a
  // ".ant-select-selection-item" span yet — click the combobox input directly instead.
  const canEditCell = craigRow.getByRole('cell').nth(5);
  const canEditField = canEditCell.getByRole('combobox');
  await canEditField.click();

  // STEP 18: SELECT the "Can Edit Contents" option
  await page.getByText('Can Edit Contents', { exact: true }).click();

  // ASSERT (BLOCKING) Can Edit now shows "Can Edit Contents"
  await expect(canEditCell).toContainText(/can edit contents/i, { timeout: 10_000 });

  // STEP 19: CLICK the Save button to commit the Can Edit change
  await craigRow.getByRole('button', { name: /save/i }).click();
  await expect(craigRow.getByRole('button', { name: /delete/i })).toBeVisible({ timeout: 10_000 });
  await expect(craigRow).toContainText(/can edit contents/i);

  // STEP 20: CLICK the Submit button
  await page.getByRole('button', { name: /submit/i }).click();

  // ASSERT (BLOCKING) Submitting shows a success confirmation
  await expect(page.getByText(/you have successfully submitted/i)).toBeVisible({ timeout: 20_000 });
  await expect(page.getByText(refNo!, { exact: true })).toBeVisible();
  await expect(page.getByText(/craig m/i).first()).toBeVisible();

  // The Confirmation step still shows a "Confirm" button — click it to finalize.
  await page.getByRole('button', { name: /^confirm$/i }).click();
  await page.waitForTimeout(1_000);

  // STEP 21: LOG OUT of Ian's session and LOG IN as Craig (recommender).
  await page.getByText(/ian houvet/i).first().click();
  await page.getByText(/logout/i).click();
  await page.waitForURL(url => url.toString().includes('/login'), { timeout: 30_000 });
  await login(page, RECOMMENDER);
  await expect(page).not.toHaveURL(/login/);
  await expect(page.getByText(/craig/i).first()).toBeVisible({ timeout: 15_000 });

  // Repeat Live -> Latest switch for Craig's session.
  await switchToLatest(page, viewModeControl);

  // STEP 22: NAVIGATE to Workflows -> Inbox
  await page.goto(`${APP_URL}/dynamic/Shesha.Workflow/workflows-inbox`, { waitUntil: 'domcontentloaded', timeout: 30_000 });
  await page.waitForLoadState('networkidle');
  await expect(page.getByText(/incoming items/i)).toBeVisible({ timeout: 15_000 });

  // STEP 23: OPEN the item matching the recorded Ref No
  await page.getByPlaceholder(/search/i).or(page.getByRole('textbox').first()).fill(refNo!);
  await page.keyboard.press('Enter');
  const targetRow = page.getByRole('row', { name: new RegExp(refNo!.replace('/', '\\/')) });
  await expect(targetRow).toBeVisible({ timeout: 15_000 });
  await targetRow.getByRole('cell').first().locator('a').first().click();

  await page.waitForURL(/workflow-action/, { timeout: 20_000 });
  await page.waitForLoadState('networkidle');
  await expect(page.locator('.ant-spin, .ant-skeleton').first()).toHaveCount(0, { timeout: 30_000 }).catch(() => {});
  await page.waitForTimeout(2000);

  // STEP 24: CLICK the "Memo Contents" tab
  const memoContentsTab = page.getByRole('tab', { name: /memo contents/i });
  await expect(memoContentsTab).toBeVisible({ timeout: 15_000 });
  await memoContentsTab.click();
  await expect(memoContentsTab).toHaveAttribute('aria-selected', 'true', { timeout: 10_000 });
  await page.waitForLoadState('networkidle');
  await page.waitForTimeout(1500);

  const memoContentsPanel = page.getByRole('tabpanel', { name: /memo contents/i });

  // ASSERT (BLOCKING) An Edit button is displayed next to the audit trail on the Purpose row specifically
  // (each content field — Purpose, Background, Discussion, Financial Implications, Risks, Recommendation
  // — has its own Edit/audit button pair; this test only ever touches Purpose's).
  const purposeSection = purposeRow(memoContentsPanel);
  const purposeEditButton = purposeSection.getByRole('button', { name: /edit/i }).first();
  await expect(purposeEditButton).toBeVisible({ timeout: 15_000 });

  // STEP 25: CLICK the edit button for the Purpose field only.
  // AI-repair (confirmed live): earlier attempts matched the WRONG "edit" control — Shesha's low-code
  // component-designer overlay icon (plain accessible name "edit", no text, rendered first in DOM order
  // for editing the form's schema) also matches /edit/i and sits before Purpose's real "edit Edit"
  // business button. Clicking that dev-tools icon is what triggered an unrelated "Create New Version"
  // (schema versioning) dialog in earlier runs — a red herring. Scoping to Purpose's own row (via
  // purposeRow()) avoids that icon entirely, so a plain click suffices — no version dialog involved.
  await clickWithFlyoutRetry(page, purposeEditButton, 5);

  // ASSERT (BLOCKING) The Purpose memo content text area becomes editable.
  // AI-repair (confirmed live): clicking Edit does activate a full Jodit toolbar (Bold, Font family,
  // Print, "About Jodit", etc. — a richer config than the Compose step's editor), proving edit mode is
  // genuinely on. But this instance's editable region didn't match `[contenteditable="true"]` exactly —
  // broaden to the Jodit wysiwyg class or any contenteditable attribute value, scoped to Purpose's row.
  const purposeEditor = purposeSection.locator('.jodit-wysiwyg:visible, [contenteditable]:visible').first();
  await expect(purposeEditor).toBeVisible({ timeout: 15_000 });
  await purposeEditor.click();
  await page.keyboard.type('Edited Text');
  await expect(purposeEditor).toContainText('Edited Text', { timeout: 10_000 });

  // STEP 26: CLICK the Save button for the Purpose field.
  // AI-repair (confirmed live): this button's accessible name is "plus Save" (icon + text), not a bare
  // "Save" — an anchored /^save$/i regex never matched it.
  const purposeSaveButton = purposeSection.getByRole('button', { name: /save/i });
  await expect(purposeSaveButton).toBeVisible({ timeout: 10_000 });
  await purposeSaveButton.click();

  // ASSERT (BLOCKING) The system saves and displays the latest changes — the editor exits edit mode.
  await expect(purposeEditor).toHaveCount(0, { timeout: 15_000 });
});
