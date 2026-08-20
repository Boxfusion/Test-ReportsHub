// AUTO-RECORDED from test-plans/Memo/verify-retract-functionality.md
// Source: Azure DevOps test plan #100853, suite #100854, test case #105186
// The .md plan is canonical. AI-repair will patch failing lines in this file.
// Do not hand-edit unless you are also updating the .md plan.
//
// STEP comments below are numbered to match ADO test case #105186's step list EXACTLY, in the order
// ADO displays them (step ids 2, 9, 10, 3, 4, 5, 6, 7, 8 — ADO's own display order, not numeric id
// order). A SETUP block precedes STEP 1 because ADO's steps assume a submitted "In Progress" memo
// already exists; no such item exists ahead of time, so this script creates one first.

import { test, expect, Page, Locator } from '@playwright/test';

const APP_URL = 'https://pd-approvals-adminportal-qa.azurewebsites.net';
const INITIATOR = { username: 'Ian', password: '123qwe' };
// "Craigm" (per ADO's literal step text) silently fails to authenticate — confirmed in the sibling
// plan verify-new-draft-version-creation.md. "Craig" is the working username for this user.
const NON_INITIATOR = { username: 'Craig', password: '123qwe' };

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

// The Routing step's approver dropdown is virtualized (rc-virtual-list) and the first rendered "option"
// is sometimes an off-screen measurement placeholder — the reliable approach is pure keyboard traversal:
// read the currently highlighted option via aria-activedescendant, step forward with ArrowDown until it
// matches, then press Enter.
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

// Confirmed live: the Workflows flyout can remain mounted/open over a freshly-navigated page if the
// mouse is still hovering near the sidebar icon that triggers it — this intercepted the My Items search
// input. Move the mouse away and give it a moment to close before interacting with anything underneath.
async function dismissWorkflowsFlyout(page: Page) {
  await page.mouse.move(700, 400);
  await page.waitForTimeout(500);
  await expect(page.getByText(/^Inbox$/i)).toHaveCount(0, { timeout: 5_000 }).catch(async () => {
    await page.keyboard.press('Escape');
    await page.mouse.move(700, 450);
    await page.waitForTimeout(500);
  });
}

// The page content itself can also contain the logged-in user's display name (e.g. a memo's routing
// table or CC line showing "Craig M: Sales Director"), so an unscoped page-wide getByText(/craig/i) can
// click the wrong occurrence and silently no-op. The username in the header is itself an Ant Design
// dropdown trigger (same ".ant-dropdown-trigger" class as the view-mode control) — filtering to that
// class scopes the match to genuine dropdown triggers only, never plain body text.
async function logout(page: Page, viewModeControl: Locator, namePattern: RegExp) {
  await page.locator('.ant-dropdown-trigger').filter({ hasText: namePattern }).first().click();
  await page.getByText(/logout/i).click();
  await page.waitForURL(url => url.toString().includes('/login'), { timeout: 30_000 });
}

test('TC-01 — Verify Successful Retract Functionality', async ({ page }) => {
  test.setTimeout(300_000);

  const viewModeControl = page.locator('[title="Click to change view mode"]');
  const toggle = page.locator('.ant-layout-sider-trigger, [class*="trigger"], [aria-label*="toggle" i], [aria-label*="menu" i]').first();

  // ===== SETUP (not an ADO step): Ian creates a submitted "In Progress" memo for the rest of the
  // test to act on, assigning Craig M as the routing signatory. =====
  await login(page, INITIATOR);
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

  const bodyText = await page.locator('body').innerText();
  const refNo = bodyText.match(/REF\d{4}\/\d+/i)?.[0];
  expect(refNo).toBeTruthy();

  const approverField = page.getByRole('combobox').first();
  await approverField.click();
  await selectApproverOption(page, /craig/i);
  await expect(approverField.locator('xpath=../..')).toContainText(/craig/i, { timeout: 10_000 });
  await page.getByRole('button', { name: /add/i }).click();
  await expect(page.getByRole('cell', { name: /craig/i }).first()).toBeVisible({ timeout: 10_000 });

  await page.getByRole('button', { name: /submit/i }).click();
  await expect(page.getByText(/you have successfully submitted/i)).toBeVisible({ timeout: 20_000 });
  await expect(page.getByText(refNo!, { exact: true })).toBeVisible();
  await page.getByRole('button', { name: /^confirm$/i }).click();
  await page.waitForTimeout(1_000);

  // log out Ian so STEP 1 can log in as Craig
  await logout(page, viewModeControl, /ian houvet/i);

  // ===== ADO STEP 1 (id2): "Login as Craigm and open a submitted item"
  // Expected: "Retract button is visible only to Initiator" =====
  await login(page, NON_INITIATOR);
  await expect(page).not.toHaveURL(/login/);
  await expect(page.getByText(/craig/i).first()).toBeVisible({ timeout: 15_000 });
  await switchToLatest(page, viewModeControl);

  await page.goto(`${APP_URL}/dynamic/Shesha.Workflow/workflows-inbox`, { waitUntil: 'domcontentloaded', timeout: 30_000 });
  await page.waitForLoadState('networkidle');
  await expect(page.getByText(/incoming items/i)).toBeVisible({ timeout: 15_000 });
  await page.getByPlaceholder(/search/i).or(page.getByRole('textbox').first()).fill(refNo!);
  await page.keyboard.press('Enter');
  let targetRow = page.getByRole('row', { name: new RegExp(refNo!.replace('/', '\\/')) });
  await expect(targetRow).toBeVisible({ timeout: 15_000 });
  await targetRow.getByRole('cell').first().locator('a').first().click();

  await page.waitForURL(/workflow-action/, { timeout: 20_000 });
  await page.waitForLoadState('networkidle');
  await expect(page.locator('.ant-spin, .ant-skeleton').first()).toHaveCount(0, { timeout: 30_000 }).catch(() => {});
  await page.waitForTimeout(2000);

  // ASSERT (BLOCKING) Retract button is visible only to Initiator — Craig must NOT see it.
  await expect(page.getByRole('button', { name: /retract/i })).toHaveCount(0);

  // log out Craig, log back in as Ian to continue with ADO steps 2-9
  await logout(page, viewModeControl, /craig m/i);
  await login(page, INITIATOR);
  await expect(page).not.toHaveURL(/login/);
  await expect(page.getByText(/ian houvet/i).first()).toBeVisible({ timeout: 15_000 });

  // ===== ADO STEP 2 (id9): "Click the view-mode control, then click 'Latest' in the popover"
  // Expected: popover opens, badge changes from "Live" to "Latest" =====
  await switchToLatest(page, viewModeControl);

  // ===== ADO STEP 3 (id10): "Click the sidebar toggle"
  // Expected: sidebar expands/collapses, exposing the navigation menu =====
  await toggle.click();

  // ===== ADO STEP 4 (id3): "Expand the Workflows Dropdown"
  // Expected (as authored): "Initiator should be logged in successfully" =====
  await page.getByText(/^Workflows?$/i).first().click();
  await expect(page.getByText(/^Inbox$/i).first()).toBeVisible({ timeout: 10_000 });

  // ===== ADO STEP 5 (id4): "Click on My Items"
  // Expected: My Items index table displayed successfully =====
  await page.goto(`${APP_URL}/dynamic/Shesha.Workflow/workflows-my-items`, { waitUntil: 'domcontentloaded', timeout: 30_000 });
  await page.waitForLoadState('networkidle');
  await dismissWorkflowsFlyout(page);

  // ===== ADO STEP 6 (id5): "Click to highlight any item with In Progress status"
  // Expected: Retract button should be displayed only for the initiator and In Progress Items =====
  const searchInput = page.getByPlaceholder(/search/i).or(page.getByRole('textbox').first());
  await searchInput.click();
  await searchInput.fill(refNo!);
  await page.keyboard.press('Enter');
  targetRow = page.getByRole('row', { name: new RegExp(refNo!.replace('/', '\\/')) });
  await expect(targetRow).toBeVisible({ timeout: 15_000 });
  await expect(targetRow).toContainText(/in progress/i);
  await clickWithFlyoutRetry(page, targetRow.getByRole('cell').first().locator('a').first());

  await page.waitForURL(/workflow-action/, { timeout: 20_000 });
  await page.waitForLoadState('networkidle');
  await expect(page.locator('.ant-spin, .ant-skeleton').first()).toHaveCount(0, { timeout: 30_000 }).catch(() => {});
  await page.waitForTimeout(2000);

  const retractButton = page.getByRole('button', { name: /retract/i });
  await expect(retractButton).toBeVisible({ timeout: 15_000 });

  // ===== ADO STEP 7 (id6): "Click on Retract Button"
  // Expected: Retract Memo dialog is successfully displayed =====
  await retractButton.click();
  const retractDialog = page.getByRole('dialog').or(page.locator('.ant-modal-content')).first();
  await expect(retractDialog).toBeVisible({ timeout: 10_000 });

  // ===== ADO STEP 8 (id7): "Populate Comments"
  // Expected: Comments text field accepts input successfully =====
  const commentsField = retractDialog.locator('textarea, [contenteditable="true"]').first();
  await commentsField.click();
  await page.keyboard.type('Test retract comment');
  await expect(commentsField).toContainText('Test retract comment', { timeout: 5_000 }).catch(async () => {
    await expect(commentsField).toHaveValue('Test retract comment', { timeout: 5_000 });
  });

  // ===== ADO STEP 9 (id8): "Click on Retract button"
  // Expected: the system terminates the workflow and updates the status of the item to "Retracted" =====
  const dialogRetractBtn = retractDialog.getByRole('button', { name: /retract/i }).or(retractDialog.getByRole('button', { name: /^ok$/i }));
  await expect(dialogRetractBtn).toBeEnabled({ timeout: 10_000 });
  await dialogRetractBtn.click();

  await expect(retractDialog).toBeHidden({ timeout: 15_000 });
  await page.waitForLoadState('networkidle');
  await page.waitForTimeout(2000);
  await expect(page.getByText(/retracted/i).first()).toBeVisible({ timeout: 15_000 });
});
