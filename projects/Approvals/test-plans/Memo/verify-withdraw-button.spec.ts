// AUTO-RECORDED from test-plans/Memo/verify-withdraw-button.md
// Source: Azure DevOps test plan #100853, suite #100854, test case #102660
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

test('TC-01 — Verify Withdraw button functionality', async ({ page }) => {
  // Chains the same long Compose-step flow as #102653 — give it real margin on this QA environment's
  // slower days rather than racing the default 90s test timeout.
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
  await expect(page.getByRole('option').first()).toHaveCount(1);
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

  // STEP 11: CLICK the Next button
  await page.getByRole('button', { name: /next/i }).click();
  await expect(page.getByRole('button', { name: /back/i })).toBeVisible({ timeout: 15_000 });
  await expect(page.getByRole('tab', { name: /purpose/i })).toHaveCount(0);

  // STEP 12: RECORD the memo's Ref No for later verification.
  // "Ref No: REF2026/..." is embedded in one combined text node alongside "Draft" and "Created by: ..."
  // — search the whole page's text rather than an element scoped to just the Ref No label.
  const bodyText = await page.locator('body').innerText();
  const refNo = bodyText.match(/REF\d{4}\/\d+/i)?.[0];
  expect(refNo).toBeTruthy();

  // STEP 13: CLICK the Withdraw button
  await page.getByRole('button', { name: /withdraw/i }).click();

  // ASSERT (BLOCKING) The Withdraw Memo dialog appears
  const withdrawDialog = page.getByRole('dialog').or(page.locator('.ant-modal-content')).first();
  await expect(withdrawDialog).toBeVisible({ timeout: 10_000 });

  // STEP 14: CLICK the Cancel button on the Withdraw Memo dialog
  await withdrawDialog.getByRole('button', { name: /^cancel$/i }).click();

  // ASSERT (BLOCKING) The dialog closes and the wizard remains open
  await expect(withdrawDialog).toBeHidden({ timeout: 10_000 });
  await expect(page.getByRole('button', { name: /back/i })).toBeVisible();

  // STEP 15: CLICK the Withdraw button again
  await page.getByRole('button', { name: /withdraw/i }).click();
  await expect(withdrawDialog).toBeVisible({ timeout: 10_000 });

  // STEP 16: POPULATE comments on the Withdraw Memo dialog
  const commentsField = withdrawDialog.locator('textarea, [contenteditable="true"]').first();
  await commentsField.click();
  await page.keyboard.type('Test withdrawal comment');

  // ASSERT (BLOCKING) The OK button is enabled once comments are populated
  const okButton = withdrawDialog.getByRole('button', { name: /^ok$/i });
  await expect(okButton).toBeEnabled({ timeout: 10_000 });

  // STEP 17: CLICK the OK button
  await okButton.click();

  // ASSERT (BLOCKING) After clicking OK, the memo no longer shows the active wizard
  await expect(withdrawDialog).toBeHidden({ timeout: 15_000 });
  await expect(page.getByRole('button', { name: /back/i })).toHaveCount(0, { timeout: 15_000 });

  // STEP 18: NAVIGATE to My Items and locate the memo by its recorded Ref No
  await page.goto(`${APP_URL}/dynamic/Shesha.Workflow/workflows-my-items`, { waitUntil: 'domcontentloaded', timeout: 30_000 });
  await page.waitForLoadState('networkidle');
  await page.getByPlaceholder(/search/i).or(page.getByRole('textbox').first()).fill(refNo!);
  await page.keyboard.press('Enter');

  // ASSERT (BLOCKING) The memo is displayed in My Items with a "Withdrawn" status
  const memoRow = page.getByText(refNo!, { exact: false }).first();
  await expect(memoRow).toBeVisible({ timeout: 15_000 });
  await expect(page.getByText(/withdrawn/i).first()).toBeVisible({ timeout: 10_000 });
});
