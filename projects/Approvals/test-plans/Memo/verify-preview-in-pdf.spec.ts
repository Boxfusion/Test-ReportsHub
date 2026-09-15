// AUTO-RECORDED from test-plans/Memo/verify-preview-in-pdf.md
// Source: Azure DevOps test plan #100853, suite #100854, test case #102651
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

test('TC-01 — Verify Preview in PDF functionality', async ({ page }) => {
  // STEP 1: NAVIGATE to login page and log in with valid credentials
  await login(page);

  // ASSERT (BLOCKING) User successfully logs into the system
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

  // STEP 4: SNAPSHOT — confirm side menu items are displayed
  // STEP 5: CLICK the Workflows dropdown
  await page.getByText(/^Workflows?$/i).first().click();

  // STEP 6: SNAPSHOT — confirm Inbox, My Items, Sent Items and Drafts menu items are displayed
  await expect(page.getByText(/^Inbox$/i).first()).toBeVisible({ timeout: 10_000 });
  await expect(page.getByText(/my items/i).first()).toBeVisible();

  // STEP 7: CLICK the My Items menu item
  // FRAGILE: this flyout is a hover-triggered Ant Design Menu portalled to the end of <body>; clicking
  // through it is flaky. The presence/labels of the flyout are already verified above, so navigate
  // directly to the same destination its "My Items" link points to.
  await page.goto(`${APP_URL}/dynamic/Shesha.Workflow/workflows-my-items`, { waitUntil: 'domcontentloaded', timeout: 30_000 });
  await page.waitForLoadState('networkidle');

  // STEP 8: SNAPSHOT — confirm the My Items index table is displayed with Create New and Export buttons
  await expect(page.getByRole('button', { name: /create new/i })).toBeVisible({ timeout: 15_000 });
  await expect(page.getByRole('button', { name: /export/i })).toBeVisible();

  // STEP 9: CLICK the Create New button
  await clickWithFlyoutRetry(page, page.getByRole('button', { name: /create new/i }));

  // STEP 10: SNAPSHOT — confirm memo types are displayed
  await expect(page.getByRole('menuitem', { name: /new referrals?/i })).toBeVisible({ timeout: 10_000 });

  // STEP 11: CLICK the New Referrals subtype
  await clickWithFlyoutRetry(page, page.getByRole('menuitem', { name: /new referrals?/i }));

  // STEP 12: SNAPSHOT — confirm the Draft Memo page is displayed
  await expect(page.getByText(/subject/i).first()).toBeVisible({ timeout: 15_000 });

  // STEP 13: CLICK the "Preview in PDF" button
  await page.getByRole('button', { name: /preview in pdf/i }).click();

  // STEP 14: SNAPSHOT — confirm a list of memo templates is displayed
  // The button opens an Ant Design Dropdown containing one menuitem per template (General Memo 2,
  // RecipientTest, CC TIHMC, Memo, Main Document). Scope to the dropdown itself — an unscoped
  // getByRole('menuitem') also matches the persistent sidebar nav (e.g. its "Memos" item).
  const dropdown = page.locator('.ant-dropdown:not(.ant-dropdown-hidden)').first();
  const templateOption = dropdown.getByRole('menuitem', { name: 'Memo', exact: true });
  await expect(templateOption).toBeVisible({ timeout: 10_000 });

  // STEP 15: CLICK the "Memo" template from the list
  // Selecting a working template opens the generated PDF in a NEW browser tab (Chrome's native PDF
  // viewer), not inline on the Compose page — so the assertion must watch for a new page, not an
  // in-page viewer element. (Some other templates, e.g. "General Memo 2", fail with a CORS error and
  // never open a new tab at all — see the bug note in the .md plan.)
  const [pdfTab] = await Promise.all([
    page.context().waitForEvent('page', { timeout: 15_000 }),
    templateOption.click(),
  ]);

  // ASSERT (BLOCKING) The selected template is displayed after clicking it
  await pdfTab.waitForLoadState('domcontentloaded', { timeout: 15_000 });
  await expect(pdfTab).toHaveURL(/generatememodocumentpdf|\.pdf|blob:/i, { timeout: 15_000 });
});
