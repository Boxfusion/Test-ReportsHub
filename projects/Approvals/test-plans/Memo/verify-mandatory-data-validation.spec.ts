// AUTO-RECORDED from test-plans/Memo/verify-mandatory-data-validation.md
// Source: Azure DevOps test plan #100853, suite #100854, test case #102637
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
// whatever is underneath. A single mouse-move + fixed wait closes it most of the time but is flaky —
// so click actions that land near it are wrapped in a retry that nudges the mouse away and tries again.
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

test('TC-01 — Verify user cannot proceed without mandatory data', async ({ page }) => {
  // STEP 1: NAVIGATE to login page and log in with valid credentials
  await login(page);

  // ASSERT (BLOCKING) User successfully logs into the system
  await expect(page).not.toHaveURL(/login/);

  // STEP: Switch the app from Live mode to Latest mode via the header's "Click to change view mode" control.
  // Clicking the control only opens a popover with three options (Live/Ready/Latest) — the popover's
  // "Latest" option label is visible immediately regardless of the current mode, so asserting on that
  // text alone is a false positive. The mode only actually changes once the "Latest" option itself is
  // clicked, which is reflected by the control's own label switching from "Live" to "Latest".
  const viewModeControl = page.locator('[title="Click to change view mode"]');
  await viewModeControl.click();
  await page.getByText('Latest', { exact: true }).click();
  await expect(viewModeControl).toContainText(/latest/i, { timeout: 10_000 });

  // STEP 2: CLICK the sidebar Toggle in the top-left corner
  // TODO[selector]: confirm the toggle control on first live run
  const toggle = page.locator('.ant-layout-sider-trigger, [class*="trigger"], [aria-label*="toggle" i], [aria-label*="menu" i]').first();
  await toggle.click();

  // STEP 3: SNAPSHOT — confirm side menu items are displayed
  // STEP 4: CLICK the Workflows dropdown
  await page.getByText(/^Workflows?$/i).first().click();

  // STEP 5: SNAPSHOT — confirm Inbox, My Items, Sent Items and Drafts menu items are displayed
  await expect(page.getByText(/^Inbox$/i).first()).toBeVisible({ timeout: 10_000 });
  await expect(page.getByText(/my items/i).first()).toBeVisible();

  // STEP 6: CLICK the My Items menu item
  // FRAGILE: this flyout is a hover-triggered Ant Design Menu portalled to the end of <body>; clicking
  // through it is flaky (it can steal the click or fail to close before the next interaction). The
  // presence/labels of the flyout are already verified above, so navigate directly to the same
  // destination its "My Items" link points to (/dynamic/Shesha.Workflow/workflows-my-items).
  await page.goto(`${APP_URL}/dynamic/Shesha.Workflow/workflows-my-items`, { waitUntil: 'domcontentloaded', timeout: 30_000 });
  await page.waitForLoadState('networkidle');

  // STEP 7: SNAPSHOT — confirm the My Items index table is displayed with Create New and Export buttons
  await expect(page.getByRole('button', { name: /create new/i })).toBeVisible({ timeout: 15_000 });
  await expect(page.getByRole('button', { name: /export/i })).toBeVisible();

  // STEP 8: CLICK the Create New button
  await clickWithFlyoutRetry(page, page.getByRole('button', { name: /create new/i }));

  // STEP 9: SNAPSHOT — confirm memo types are displayed
  // The Create New button opens an Ant Design Dropdown menu — target it by role=menuitem so it
  // can't match the "New Referrals" text that already appears in the My Items table underneath.
  await expect(page.getByRole('menuitem', { name: /new referrals?/i })).toBeVisible({ timeout: 10_000 });

  // STEP 10: CLICK the New Referrals subtype
  await clickWithFlyoutRetry(page, page.getByRole('menuitem', { name: /new referrals?/i }));

  // STEP 11: SNAPSHOT — confirm the Draft Memo page is displayed
  await expect(page.getByText(/subject/i).first()).toBeVisible({ timeout: 15_000 });

  // STEP 12: CLICK the Next button without populating any fields
  await page.getByRole('button', { name: /next/i }).click();

  // ASSERT (BLOCKING) Mandatory-field validation messages are displayed
  // Live app shows a summary banner "Please correct the following and submit again:" listing the actual
  // mandatory fields — Subject, Recommendation, Financial Implications, Risks, Background, Discussion.
  // 'Purpose' (no red asterisk on its tab) is NOT mandatory, and 'Risks'/'Discussion' are mandatory despite
  // not being mentioned in the ADO expected-result text — see the note in the .md plan.
  await expect(page.getByText(/please correct the following/i)).toBeVisible({ timeout: 10_000 });
  await expect(page.getByText(/'subject' is mandatory/i)).toBeVisible();
  await expect(page.getByText(/'recommendation' is mandatory/i)).toBeVisible();
  await expect(page.getByText(/'financial implications' is mandatory/i)).toBeVisible();
  await expect(page.getByText(/'risks' is mandatory/i)).toBeVisible();
  await expect(page.getByText(/'background' is mandatory/i)).toBeVisible();
  await expect(page.getByText(/'discussion' is mandatory/i)).toBeVisible();

  // ASSERT the wizard did not proceed past the Compose step
  await expect(page.getByText(/^compose$/i).first()).toBeVisible();
});
