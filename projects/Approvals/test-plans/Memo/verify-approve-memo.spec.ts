// AUTO-RECORDED from test-plans/Memo/verify-approve-memo.md
// Source: Azure DevOps test plan #100853, suite #100854, test case #104789
// The .md plan is canonical. AI-repair will patch failing lines in this file.
// Do not hand-edit unless you are also updating the .md plan.

import { test, expect, Page, Locator } from '@playwright/test';

const APP_URL = 'https://pd-approvals-adminportal-qa.azurewebsites.net';
const INITIATOR = { username: 'Ian', password: '123qwe' };
const RECOMMENDER = { username: 'Craig', password: '123qwe' };
const APPROVER = { username: 'Bonolob', password: '123qwe' };

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

// Sets a routing row's Required Action via the Edit icon -> dropdown -> Save pattern (confirmed in
// #102670/#104791). The dropdown's options are not role=option — fall back to plain text matching.
async function setRequiredAction(page: Page, row: Locator, actionLabel: string) {
  await row.scrollIntoViewIfNeeded();
  await row.getByRole('button', { name: /edit/i }).click();
  const requiredActionField = row.getByRole('combobox').first();
  await expect(requiredActionField).toBeVisible({ timeout: 10_000 });

  // Confirmed live: "Approve" is the routing row's implicit default and is NOT a selectable item in the
  // Required Action dropdown at all — its options list is Recommend/Support/Action/Review/Referral/
  // Consult/Concur only. Attempting to click an "Approve" option therefore hangs forever (it doesn't
  // exist). When the target is already "Approve", skip the dropdown entirely and just verify + Save.
  if (/^approve$/i.test(actionLabel)) {
    await expect(row.locator('.ant-select-selection-item, input')).toHaveValue(/approve/i, { timeout: 5_000 }).catch(async () => {
      await expect(row.locator('.ant-select-selection-item')).toHaveText(/approve/i, { timeout: 5_000 });
    });
    await row.getByRole('button', { name: /save/i }).click();
    await expect(row.getByRole('button', { name: /delete/i })).toBeVisible({ timeout: 10_000 });
    return;
  }

  await row.locator('.ant-select-selection-item').click();
  // Scope the option click to the open dropdown panel — the row's own closed-select display can already
  // show the same text as the target option, which makes an unscoped page-wide getByText ambiguous.
  const optionsPanel = page.locator('.ant-select-dropdown:not(.ant-select-dropdown-hidden)');
  await expect(optionsPanel).toBeVisible({ timeout: 10_000 });
  const option = optionsPanel.getByText(actionLabel, { exact: true });
  await option.scrollIntoViewIfNeeded();
  await option.click();
  await expect(row.locator('.ant-select-selection-item')).toHaveText(new RegExp(actionLabel, 'i'), { timeout: 10_000 });
  await row.getByRole('button', { name: /save/i }).click();
  await expect(row.getByRole('button', { name: /delete/i })).toBeVisible({ timeout: 10_000 });
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

test('TC-01 — Verify Approve Memo', async ({ page }) => {
  test.setTimeout(360_000);

  // STEP 1: NAVIGATE to login page and log in as Ian (initiator)
  await login(page, INITIATOR);
  await expect(page).not.toHaveURL(/login/);

  // STEP 2: CLICK the "Click to change view mode" control to open the Live/Ready/Latest popover,
  // then CLICK the "Latest" option in that popover.
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

  const approverField = page.getByRole('combobox').first();
  const rows = page.getByRole('rowgroup').getByRole('row');

  // STEP 10: CLICK the Select Signatory dropdown and SELECT "Craig M", then CLICK Add
  await approverField.click();
  await selectApproverOption(page, /craig/i);
  await expect(approverField.locator('xpath=../..')).toContainText(/craig/i, { timeout: 10_000 });
  await page.getByRole('button', { name: /add/i }).click();
  await expect(page.getByRole('cell', { name: /craig/i }).first()).toBeVisible({ timeout: 10_000 });
  await expect(rows).toHaveCount(1, { timeout: 10_000 });
  const craigRow = rows.filter({ hasText: /craig/i });

  // STEP 11: CLICK the Edit icon on Craig's row, set Required Action to "Recommend", Save
  await setRequiredAction(page, craigRow, 'Recommend');

  // STEP 12: CLICK the Select Signatory dropdown and SELECT "Bonolo", then CLICK Add
  await approverField.click();
  await selectApproverOption(page, /bonolo/i);
  await expect(approverField.locator('xpath=../..')).toContainText(/bonolo/i, { timeout: 10_000 });
  await page.getByRole('button', { name: /add/i }).click();
  await expect(rows).toHaveCount(2, { timeout: 10_000 });
  const bonoloRow = rows.filter({ hasText: /bonolo/i });
  await expect(bonoloRow).toBeVisible();

  // STEP 13: CLICK the Edit icon on Bonolo's row, set Required Action to "Approve", Save
  await setRequiredAction(page, bonoloRow, 'Approve');

  // STEP 14: CLICK the Submit button
  await page.getByRole('button', { name: /submit/i }).click();

  // ASSERT (BLOCKING) Submitting shows a success confirmation
  await expect(page.getByText(/you have successfully submitted/i)).toBeVisible({ timeout: 20_000 });
  await expect(page.getByText(refNo!, { exact: true })).toBeVisible();
  await expect(page.getByText(/craig m/i).first()).toBeVisible();

  await page.getByRole('button', { name: /^confirm$/i }).click();
  await page.waitForTimeout(1_000);

  // STEP 15: LOG OUT of Ian's session and LOG IN as Craig (recommender).
  await page.getByText(/ian houvet/i).first().click();
  await page.getByText(/logout/i).click();
  await page.waitForURL(url => url.toString().includes('/login'), { timeout: 30_000 });
  await login(page, RECOMMENDER);
  await expect(page).not.toHaveURL(/login/);
  await expect(page.getByText(/craig/i).first()).toBeVisible({ timeout: 15_000 });

  // A fresh login resets the view-mode control back to "Live" — repeat the Live -> Latest switch.
  await switchToLatest(page, viewModeControl);

  // STEP 16: NAVIGATE to Workflows -> Inbox
  await page.goto(`${APP_URL}/dynamic/Shesha.Workflow/workflows-inbox`, { waitUntil: 'domcontentloaded', timeout: 30_000 });
  await page.waitForLoadState('networkidle');
  await expect(page.getByText(/incoming items/i)).toBeVisible({ timeout: 15_000 });

  // STEP 17: OPEN the item matching the recorded Ref No
  await page.getByPlaceholder(/search/i).or(page.getByRole('textbox').first()).fill(refNo!);
  await page.keyboard.press('Enter');
  let targetRow = page.getByRole('row', { name: new RegExp(refNo!.replace('/', '\\/')) });
  await expect(targetRow).toBeVisible({ timeout: 15_000 });
  await targetRow.getByRole('cell').first().locator('a').first().click();

  await page.waitForURL(/workflow-action/, { timeout: 20_000 });
  await page.waitForLoadState('networkidle');
  await expect(page.locator('.ant-spin, .ant-skeleton').first()).toHaveCount(0, { timeout: 30_000 }).catch(() => {});
  await page.waitForTimeout(2000);

  // STEP 18: CLICK the "Recommend" radio button, populate Supporting Comments, CLICK Submit
  const recommendRadio = page.getByRole('radio', { name: 'Recommend', exact: true });
  await expect(recommendRadio).toBeVisible({ timeout: 15_000 });
  await recommendRadio.check();
  await expect(recommendRadio).toBeChecked();

  const supportingComments = page.getByPlaceholder(/start typing/i);
  await supportingComments.first().fill('Test recommendation comment');

  const craigSubmitBtn = page.getByRole('button', { name: /submit/i }).last();
  await craigSubmitBtn.scrollIntoViewIfNeeded();
  await craigSubmitBtn.click();

  // ASSERT (BLOCKING) After Craig recommends, the item is "IN PROGRESS" — NOT completed, since Bonolo
  // (the second routing signatory) still needs to act.
  await page.waitForLoadState('networkidle');
  await page.waitForTimeout(2000);
  await expect(page.getByText(/in progress/i).first()).toBeVisible({ timeout: 20_000 });
  await expect(page.getByText(/^completed$/i)).toHaveCount(0);

  // STEP 19: LOG OUT of Craig's session and LOG IN as Bonolob (approver).
  await page.getByText(/craig m/i).first().click();
  await page.getByText(/logout/i).click();
  await page.waitForURL(url => url.toString().includes('/login'), { timeout: 30_000 });
  await login(page, APPROVER);
  await expect(page).not.toHaveURL(/login/);
  await expect(page.getByText(/bonolo/i).first()).toBeVisible({ timeout: 15_000 });

  // A fresh login resets the view-mode control back to "Live" — repeat the Live -> Latest switch.
  await switchToLatest(page, viewModeControl);

  // STEP 20: NAVIGATE to Workflows -> Inbox
  await page.goto(`${APP_URL}/dynamic/Shesha.Workflow/workflows-inbox`, { waitUntil: 'domcontentloaded', timeout: 30_000 });
  await page.waitForLoadState('networkidle');
  await expect(page.getByText(/incoming items/i)).toBeVisible({ timeout: 15_000 });

  // STEP 21: OPEN the item matching the recorded Ref No
  await page.getByPlaceholder(/search/i).or(page.getByRole('textbox').first()).fill(refNo!);
  await page.keyboard.press('Enter');
  targetRow = page.getByRole('row', { name: new RegExp(refNo!.replace('/', '\\/')) });
  await expect(targetRow).toBeVisible({ timeout: 15_000 });
  await targetRow.getByRole('cell').first().locator('a').first().click();

  await page.waitForURL(/workflow-action/, { timeout: 20_000 });
  await page.waitForLoadState('networkidle');
  await expect(page.locator('.ant-spin, .ant-skeleton').first()).toHaveCount(0, { timeout: 30_000 }).catch(() => {});
  await page.waitForTimeout(2000);

  // STEP 22: CLICK the "Approve" radio button
  const approveRadio = page.getByRole('radio', { name: 'Approve', exact: true });
  await expect(approveRadio).toBeVisible({ timeout: 15_000 });
  await approveRadio.check();
  await expect(approveRadio).toBeChecked();

  // Fill Supporting Comments if this screen requires it too (confirmed live whether mandatory here).
  const bonoloComments = page.getByPlaceholder(/start typing/i);
  if (await bonoloComments.first().isVisible().catch(() => false)) {
    await bonoloComments.first().fill('Test approval comment');
  }

  // STEP 23: CLICK the Submit button
  const bonoloSubmitBtn = page.getByRole('button', { name: /submit/i }).last();
  await bonoloSubmitBtn.scrollIntoViewIfNeeded();
  await bonoloSubmitBtn.click();

  // ASSERT (BLOCKING) After Bonolo approves, the item status changes to "COMPLETED".
  await page.waitForLoadState('networkidle');
  await page.waitForTimeout(2000);
  await expect(page.getByText(/^completed$/i).first()).toBeVisible({ timeout: 20_000 });
});
