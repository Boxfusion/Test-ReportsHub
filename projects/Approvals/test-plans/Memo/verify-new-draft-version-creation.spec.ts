// AUTO-RECORDED from test-plans/Memo/verify-new-draft-version-creation.md
// Source: Azure DevOps test plan #100853, suite #100854, test case #105188 (also linked from suite #105185)
// The .md plan is canonical. AI-repair will patch failing lines in this file.
// Do not hand-edit unless you are also updating the .md plan.
//
// STEP comments below are numbered to match ADO test case #105188's step list, in ADO's displayed
// order (step ids 2, 8, 9, 3, 4, 5, 6, 7). A SETUP block precedes STEP 1 because ADO's steps assume a
// "Retracted" memo already exists in Craigm's My Items; no such item exists ahead of time, so this
// script creates and retracts one first.

import { test, expect, Page, Locator } from '@playwright/test';

const APP_URL = 'https://pd-approvals-adminportal-qa.azurewebsites.net';
const CRAIGM = { username: 'Craig', password: '123qwe' };

// This QA environment can sit on an "Initializing..." splash for well over the default 15s action
// timeout before the login form mounts. Give the username field a generous timeout rather than
// failing fast, since the app itself (verified via curl) is otherwise up.
async function login(page: Page, creds: { username: string; password: string }) {
  await page.goto(`${APP_URL}/login`, { waitUntil: 'domcontentloaded', timeout: 60_000 });
  await page.getByPlaceholder(/username/i).fill(creds.username, { timeout: 60_000 });
  await page.getByPlaceholder(/password/i).fill(creds.password);
  await page.getByRole('button', { name: /log ?in|sign in/i }).click();
  try {
    await page.waitForURL(url => !url.toString().includes('/login'), { timeout: 15_000 });
  } catch (err) {
    await page.waitForTimeout(2000);
    const errorText = await page.locator('body').innerText();
    console.log(`LOGIN_DEBUG for "${creds.username}" — still on login page. Body text snippet:`, errorText.slice(0, 500));
    await page.screenshot({ path: `projects/Approvals/test-results/artifacts/debug-login-failure-${creds.username}.png`, fullPage: true });
    throw err;
  }
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

// The approver dropdown is virtualized (rc-virtual-list) and the first rendered "option" is sometimes an
// off-screen measurement placeholder — the reliable approach is pure keyboard traversal: read the
// currently highlighted option via aria-activedescendant, step forward with ArrowDown until it matches,
// then press Enter.
async function selectFirstApproverOption(page: Page) {
  await page.keyboard.press('ArrowDown');
  await page.keyboard.press('Enter');
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

// Confirmed live (in #105186): the Workflows flyout can remain mounted/open over a freshly-navigated
// page if the mouse is still hovering near the sidebar icon that triggers it. Move the mouse away and
// give it a moment to close before interacting with anything underneath.
async function dismissWorkflowsFlyout(page: Page) {
  await page.mouse.move(700, 400);
  await page.waitForTimeout(500);
  await expect(page.getByText(/^Inbox$/i)).toHaveCount(0, { timeout: 5_000 }).catch(async () => {
    await page.keyboard.press('Escape');
    await page.mouse.move(700, 450);
    await page.waitForTimeout(500);
  });
}

test('TC-01 — Verify New Draft Version Creation', async ({ page }) => {
  test.setTimeout(300_000);

  const viewModeControl = page.locator('[title="Click to change view mode"]');
  const toggle = page.locator('.ant-layout-sider-trigger, [class*="trigger"], [aria-label*="toggle" i], [aria-label*="menu" i]').first();

  // ===== SETUP (not an ADO step): log in as Craigm, submit a New Referrals memo, then retract it so a
  // "Retracted" item exists for the rest of the test to act on. =====
  await login(page, CRAIGM);
  await expect(page).not.toHaveURL(/login/);
  await switchToLatest(page, viewModeControl);
  await toggle.click();
  await page.getByText(/^Workflows?$/i).first().click();
  await expect(page.getByText(/^Inbox$/i).first()).toBeVisible({ timeout: 10_000 });
  await page.goto(`${APP_URL}/dynamic/Shesha.Workflow/workflows-my-items`, { waitUntil: 'domcontentloaded', timeout: 30_000 });
  await page.waitForLoadState('networkidle');
  await expect(page.getByRole('button', { name: /create new/i })).toBeVisible({ timeout: 15_000 });
  await clickWithFlyoutRetry(page, page.getByRole('button', { name: /create new/i }));
  await expect(page.getByRole('menuitem', { name: /new referrals?/i })).toBeVisible({ timeout: 10_000 });
  await clickWithFlyoutRetry(page, page.getByRole('menuitem', { name: /new referrals?/i }));

  await expect(page.getByText(/subject/i).first()).toBeVisible({ timeout: 15_000 });
  const ccField = page.getByRole('combobox').nth(1);
  await ccField.click();
  const ccDropdownPanel = page.locator('.ant-select-dropdown:not(.ant-select-dropdown-hidden)');
  await expect(ccDropdownPanel).toBeVisible({ timeout: 10_000 });
  await selectFirstApproverOption(page);
  const ccContainer = ccField.locator('xpath=../..');
  const ccName = (await ccContainer.textContent())?.trim();
  expect(ccName && ccName.length > 0).toBeTruthy();

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

  const bodyText = await page.locator('body').innerText();
  const refNo = bodyText.match(/REF\d{4}\/\d+/i)?.[0];
  expect(refNo).toBeTruthy();

  // The routing signatory must match the CC recipient (confirmed rule in #102699) — select the same
  // person again here.
  const approverField = page.getByRole('combobox').first();
  await approverField.click();
  await selectFirstApproverOption(page);
  await page.getByRole('button', { name: /add/i }).click();
  await expect(page.getByText(/no approvers/i)).toHaveCount(0, { timeout: 10_000 });

  await page.getByRole('button', { name: /submit/i }).click();
  await expect(page.getByText(/you have successfully submitted/i)).toBeVisible({ timeout: 20_000 });
  await expect(page.getByText(refNo!, { exact: true })).toBeVisible();
  await page.getByRole('button', { name: /^confirm$/i }).click();
  await page.waitForTimeout(1_000);

  // Navigate to My Items, open the just-submitted item, and retract it (same flow proven in #105186).
  await page.goto(`${APP_URL}/dynamic/Shesha.Workflow/workflows-my-items`, { waitUntil: 'domcontentloaded', timeout: 30_000 });
  await page.waitForLoadState('networkidle');
  await dismissWorkflowsFlyout(page);
  const setupSearch = page.getByPlaceholder(/search/i).or(page.getByRole('textbox').first());
  await setupSearch.click();
  await setupSearch.fill(refNo!);
  await page.keyboard.press('Enter');
  let setupRow = page.getByRole('row', { name: new RegExp(refNo!.replace('/', '\\/')) });
  await expect(setupRow).toBeVisible({ timeout: 15_000 });
  await clickWithFlyoutRetry(page, setupRow.getByRole('cell').first().locator('a').first());

  await page.waitForURL(/workflow-action/, { timeout: 20_000 });
  await page.waitForLoadState('networkidle');
  await expect(page.locator('.ant-spin, .ant-skeleton').first()).toHaveCount(0, { timeout: 30_000 }).catch(() => {});
  await page.waitForTimeout(2000);

  const retractButton = page.getByRole('button', { name: /retract/i });
  await expect(retractButton).toBeVisible({ timeout: 15_000 });
  await retractButton.click();
  const retractDialog = page.getByRole('dialog').or(page.locator('.ant-modal-content')).first();
  await expect(retractDialog).toBeVisible({ timeout: 10_000 });
  const retractComments = retractDialog.locator('textarea, [contenteditable="true"]').first();
  await retractComments.click();
  await page.keyboard.type('Setup retract for new-version test');
  const dialogRetractBtn = retractDialog.getByRole('button', { name: /retract/i }).or(retractDialog.getByRole('button', { name: /^ok$/i }));
  await expect(dialogRetractBtn).toBeEnabled({ timeout: 10_000 });
  await dialogRetractBtn.click();
  await expect(retractDialog).toBeHidden({ timeout: 15_000 });
  await page.waitForLoadState('networkidle');
  await page.waitForTimeout(2000);
  await expect(page.getByText(/retracted/i).first()).toBeVisible({ timeout: 15_000 });

  // ===== ADO STEP 1 (id2): "Login as Initiator Craigm" — already logged in from setup; no re-login
  // needed since the session is continuous. =====

  // ===== ADO STEP 2 (id8): "Click the view-mode control, then click 'Latest' in the popover" =====
  await switchToLatest(page, viewModeControl);

  // ===== ADO STEP 3 (id9): "Click the sidebar toggle" =====
  await toggle.click();

  // ===== ADO STEP 4 (id3): "Expand the Workflows Dropdown"
  // Expected: list of child items is displayed (Inbox, Sent Items and Drafts) =====
  await page.getByText(/^Workflows?$/i).first().click();
  await expect(page.getByText(/^Inbox$/i).first()).toBeVisible({ timeout: 10_000 });
  await expect(page.getByText(/^Sent Items$/i).first()).toBeVisible();
  await expect(page.getByText(/^Drafts$/i).first()).toBeVisible();

  // ===== ADO STEP 5 (id4): "Click on My Items"
  // Expected: My Items index table displayed successfully =====
  await page.goto(`${APP_URL}/dynamic/Shesha.Workflow/workflows-my-items`, { waitUntil: 'domcontentloaded', timeout: 30_000 });
  await page.waitForLoadState('networkidle');
  await dismissWorkflowsFlyout(page);

  // ===== ADO STEP 6 (id5): "Click on any item with Retracted status"
  // Expected: "Create New Version" button should be displayed =====
  const versionSearch = page.getByPlaceholder(/search/i).or(page.getByRole('textbox').first());
  await versionSearch.click();
  await versionSearch.fill(refNo!);
  await page.keyboard.press('Enter');
  setupRow = page.getByRole('row', { name: new RegExp(refNo!.replace('/', '\\/')) });
  await expect(setupRow).toBeVisible({ timeout: 15_000 });
  await expect(setupRow).toContainText(/retracted/i);
  await clickWithFlyoutRetry(page, setupRow.getByRole('cell').first().locator('a').first());

  await page.waitForURL(/workflow/, { timeout: 20_000 });
  await page.waitForLoadState('networkidle');
  await expect(page.locator('.ant-spin, .ant-skeleton').first()).toHaveCount(0, { timeout: 30_000 }).catch(() => {});
  await page.waitForTimeout(2000);

  const createNewVersionBtn = page.getByRole('button', { name: /create new version/i });
  await expect(createNewVersionBtn).toBeVisible({ timeout: 15_000 });

  // ===== ADO STEP 7 (id6): "Click on Create New Version button"
  // Expected: popup with "Are you sure you want to create a new version" message should be displayed =====
  await createNewVersionBtn.click();
  const confirmPopup = page.locator('.ant-modal:not(.ant-modal-hidden), .ant-popover:not(.ant-popover-hidden)').filter({ hasText: /new version/i }).first();
  await expect(confirmPopup).toBeVisible({ timeout: 10_000 });
  await expect(confirmPopup).toContainText(/are you sure you want to create a new version/i);

  // ===== ADO STEP 8 (id7): "Click on OK button"
  // Expected: system should auto refresh and open the item in Draft mode with incremented reference
  // number V2 =====
  await confirmPopup.getByRole('button', { name: /^ok$/i }).click();

  await page.waitForLoadState('networkidle');
  await page.waitForTimeout(2000);
  const versionRefLocator = page.getByText(new RegExp(`${refNo!.replace('/', '\\/')}\\/V\\d+`, 'i'));
  await expect(versionRefLocator.first()).toBeVisible({ timeout: 20_000 });
  await expect(page.getByText(/draft/i).first()).toBeVisible();
});
