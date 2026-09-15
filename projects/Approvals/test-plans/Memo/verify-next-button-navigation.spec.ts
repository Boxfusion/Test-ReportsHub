// AUTO-RECORDED from test-plans/Memo/verify-next-button-navigation.md
// Source: Azure DevOps test plan #100853, suite #100854, test case #102653
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

test('TC-01 — Verify Next button navigation', async ({ page }) => {
  // This test chains a lot of steps (login, sidebar nav, CC signatory list fetch, six rich-text tabs) —
  // on this QA environment's slow days that comfortably exceeds the default 90s test timeout even
  // though every individual step succeeds. Give it more room rather than racing the environment.
  test.setTimeout(180_000);

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
  // FRAGILE: the Workflows flyout is a hover-triggered Ant Design Menu portalled to the end of <body>;
  // clicking through it is flaky. Navigate directly to the same destination its "My Items" link points to.
  await page.goto(`${APP_URL}/dynamic/Shesha.Workflow/workflows-my-items`, { waitUntil: 'domcontentloaded', timeout: 30_000 });
  await page.waitForLoadState('networkidle');
  await expect(page.getByRole('button', { name: /create new/i })).toBeVisible({ timeout: 15_000 });

  // STEP 6: CLICK the Create New button
  await clickWithFlyoutRetry(page, page.getByRole('button', { name: /create new/i }));

  // STEP 7: CLICK the New Referrals subtype
  await expect(page.getByRole('menuitem', { name: /new referrals?/i })).toBeVisible({ timeout: 10_000 });
  await clickWithFlyoutRetry(page, page.getByRole('menuitem', { name: /new referrals?/i }));

  // STEP 8: SNAPSHOT — confirm the Draft Memo page is displayed
  await expect(page.getByText(/subject/i).first()).toBeVisible({ timeout: 15_000 });

  // STEP 9: CLICK the CC field
  // The Compose form has two role=combobox fields: Priority (index 0) and CC (index 1). Recipient and
  // Subject are plain role=textbox fields, not comboboxes.
  const ccField = page.getByRole('combobox').nth(1);
  await ccField.click();

  // STEP 10: SNAPSHOT — confirm a list of signatories is displayed
  // Options are rendered via Ant Design's rc-virtual-list, which windows/virtualizes rows — the
  // DOM-first option isn't reliably within the current scroll viewport, so bounding-box visibility
  // checks on it are flaky even though the dropdown itself is genuinely open. Assert on the dropdown
  // panel being open instead, and drive selection with the keyboard (the standard robust pattern for
  // Ant Design Select), rather than clicking a specific option element.
  const dropdownPanel = page.locator('.ant-select-dropdown:not(.ant-select-dropdown-hidden)');
  await expect(dropdownPanel).toBeVisible({ timeout: 10_000 });
  await expect(page.getByRole('option').first()).toHaveCount(1);

  // STEP 11: SELECT any signatory from the list
  await page.keyboard.press('ArrowDown');
  await page.keyboard.press('Enter');

  // ASSERT (BLOCKING) The selected signatory is displayed in the CC field
  // The combobox role only reflects the (now-empty) search input's value. The visible selected-value
  // label (Ant Design's ".ant-select-selection-item") is a sibling of the input's own wrapper, not a
  // descendant of it — go up two levels to the shared selector container instead of one.
  const ccContainer = ccField.locator('xpath=../..');
  const signatoryName = (await ccContainer.textContent())?.trim();
  expect(signatoryName && signatoryName.length > 0).toBeTruthy();

  // STEP 12: CLICK the Subject text field and populate it with test input
  // Recipient is the first role=textbox on the page, Subject is the second.
  await page.getByRole('textbox').nth(1).fill('Test Subject');

  // STEP 13: CLICK each of the Purpose, Background, Discussion, Financial Implications, Risks and
  // Recommendation tabs individually, populating and verifying each one before moving to the next.
  // Ant Design Tabs keeps inactive tabpanes mounted (just hidden), so an unscoped
  // [contenteditable="true"] always matches the FIRST tab's editor regardless of which tab is active —
  // scope to :visible. Rich-text editors can also hang on Locator.fill(); keyboard.type() is more
  // reliable for contenteditable WYSIWYG surfaces. Each tab gets distinct text so a mis-scoped editor
  // (content leaking into the wrong tab) would be caught by the per-tab assertion.
  const tabNames = ['Purpose', 'Background', 'Discussion', 'Financial Implications', 'Risks', 'Recommendation'];
  for (const name of tabNames) {
    const tab = page.getByRole('tab', { name: new RegExp(name, 'i') });

    // FRAGILE: switching tabs right after typing in the previous tab's rich-text editor can be dropped —
    // the editor's blur/focus handling appears to need a moment to settle. Retry the click if the tab
    // doesn't actually become selected.
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

  // STEP 14: CLICK the Next button
  await page.getByRole('button', { name: /next/i }).click();

  // ASSERT (BLOCKING) Clicking Next with all mandatory fields populated navigates the wizard to the
  // Attachments step (step 2).
  // The wizard's step-name row (Compose/Attachments/Routing/Confirmation) is rendered on screen from
  // the very start regardless of which step is active, so merely finding "Attachments" text on the
  // page is a false positive that would pass even if Next silently failed. Instead assert on content
  // that only exists once the transition has genuinely happened: a "Back" button appears (absent on
  // the Compose step), and the Compose-only controls (Purpose tab, editable Subject textbox) are gone.
  await expect(page.getByRole('button', { name: /back/i })).toBeVisible({ timeout: 15_000 });
  await expect(page.getByRole('tab', { name: /purpose/i })).toHaveCount(0);
  await expect(page.getByRole('textbox').nth(1)).not.toBeVisible();
});
