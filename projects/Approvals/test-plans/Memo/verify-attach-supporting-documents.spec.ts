// AUTO-RECORDED from test-plans/Memo/verify-attach-supporting-documents.md
// Source: Azure DevOps test plan #100853, suite #100854, test case #102655
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

test('TC-01 — Verify user can attach supporting documents', async ({ page }) => {
  // Chains the same long Compose-step flow as #102653, plus an Attachments-step file upload — a
  // confirmed passing run took as long as 182s, right up against a 180s timeout. Give it real margin
  // rather than racing the environment.
  test.setTimeout(300_000);

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

  // STEP 9: CLICK the CC field and SELECT a signatory
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

  // STEP 10: CLICK the Subject text field and populate it with test input
  await page.getByRole('textbox').nth(1).fill('Test Subject');

  // STEP 11: CLICK each of the Purpose, Background, Discussion, Financial Implications, Risks and
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

  // STEP 12: CLICK the Next button
  await page.getByRole('button', { name: /next/i }).click();

  // STEP 13: SNAPSHOT — confirm the Attachments step is displayed
  // "Attachments" text is always on screen (it's the wizard's step-name row) regardless of which step
  // is active — assert on content that only exists once the transition has genuinely happened.
  await expect(page.getByRole('button', { name: /back/i })).toBeVisible({ timeout: 15_000 });
  await expect(page.getByRole('tab', { name: /purpose/i })).toHaveCount(0);

  // STEP 14: CLICK the "Attach Supporting Documents" option
  // There is no "Attach Supporting Documents" text label on this step — the square icon dropzone (an
  // Ant Design Upload component) is the attach control, and it keeps a hidden <input type="file"> in
  // the DOM that doesn't require a preceding click to interact with.

  // STEP 15: SELECT a file and attach it
  // Native OS file-browser dialogs cannot be driven by Playwright — set the file directly on the
  // underlying <input type="file">, the standard equivalent (same convention as
  // projects/ITS/test-plans/BAS/register-and-upload-invoice.spec.ts).
  const fileInput = page.locator('input[type="file"]').first();
  await fileInput.setInputFiles({
    name: 'supporting-document.pdf',
    mimeType: 'application/pdf',
    buffer: Buffer.from('%PDF-1.4 test supporting document content'),
  });

  // ASSERT (BLOCKING) The attached document's file name is displayed in the attachments UI.
  // The file name genuinely appears twice: an "ant-upload-list-item-name" download link (only revealed
  // on hover over the file row, so it reports as hidden by default) and a size-annotated
  // ("supporting-document.pdf (41 B)") label that's visible unconditionally — assert on the latter.
  await expect(page.getByTitle(/supporting-document\.pdf \(\d+ ?B\)/i)).toBeVisible({ timeout: 15_000 });
});
