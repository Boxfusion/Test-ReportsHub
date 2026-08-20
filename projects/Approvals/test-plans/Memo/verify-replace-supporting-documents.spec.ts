// AUTO-RECORDED from test-plans/Memo/verify-replace-supporting-documents.md
// Source: Azure DevOps test plan #100853, suite #100854, test case #102656
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

test('TC-01 — Verify user can replace supporting documents', async ({ page }) => {
  // Chains the same long Compose-step flow as #102653/#102655, plus replace/delete/download/audit-trail
  // interactions on the Attachments step — give it real margin on this QA environment's slower days.
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

  // STEP 12: ATTACH the original supporting document
  const fileInput = page.locator('input[type="file"]').first();
  await fileInput.setInputFiles({
    name: 'original-document.pdf',
    mimeType: 'application/pdf',
    buffer: Buffer.from('%PDF-1.4 original document content'),
  });
  await expect(page.getByTitle(/original-document\.pdf \(\d+ ?B\)/i)).toBeVisible({ timeout: 15_000 });

  // STEP 13: HOVER over the attached document
  // The row's own file-name link (.ant-upload-list-item-name) is only revealed BY hovering, so it can't
  // be the hover target itself — hover the row container instead. Hovering reveals a floating tooltip
  // of icon-only action buttons rendered at the page level (not nested inside the row) — accessible
  // names come from the icon type, not a "Replace" / "Audit Trail" label: sync = Replace,
  // delete = Delete, history = Audit Trail, download = Download.
  const attachmentLink = page.locator('.ant-upload-list-item').first();
  await attachmentLink.hover();

  // ASSERT (BLOCKING) Hovering reveals Replace (sync), Delete and Download controls
  const replaceButton = page.getByRole('button', { name: 'sync' });
  const deleteButton = page.getByRole('button', { name: 'delete' });
  const downloadButton = page.getByRole('button', { name: 'download' });
  const auditTrailButton = page.getByRole('button', { name: 'history' });
  await expect(replaceButton).toBeVisible({ timeout: 10_000 });
  await expect(deleteButton).toBeVisible();
  await expect(downloadButton).toBeVisible();

  // STEP 14: CLICK the Replace icon and SELECT a different document.
  // Two <input type="file"> elements exist in the DOM from the start: one for the general "add new"
  // dropzone slot, one tied to this item's replace action. Using .first() here (same as the initial
  // attach) sends the file to the "add" input, which genuinely ADDS a second attachment instead of
  // substituting the first — .last() targets the correct one and produces a true in-place replacement.
  await replaceButton.click();
  const replaceFileInput = page.locator('input[type="file"]').last();
  await replaceFileInput.setInputFiles({
    name: 'replacement-document.pdf',
    mimeType: 'application/pdf',
    buffer: Buffer.from('%PDF-1.4 replacement document content'),
  });

  // ASSERT (BLOCKING) The replacement document is displayed and the original is no longer shown
  await expect(page.getByTitle(/replacement-document\.pdf \(\d+ ?B\)/i)).toBeVisible({ timeout: 15_000 });
  await expect(page.getByTitle(/original-document\.pdf \(\d+ ?B\)/i)).toHaveCount(0);

  // STEP 15: HOVER over the attached document
  await attachmentLink.hover();

  // STEP 16: CLICK the Delete icon
  await deleteButton.click();

  // ASSERT (BLOCKING) A delete confirmation popup with Cancel and OK is displayed
  await expect(page.getByRole('button', { name: /^cancel$/i })).toBeVisible({ timeout: 10_000 });
  await expect(page.getByRole('button', { name: /^ok$/i })).toBeVisible();

  // STEP 17: CLICK the Cancel button
  await page.getByRole('button', { name: /^cancel$/i }).click();

  // ASSERT (BLOCKING) The popup closes and the attachment remains displayed
  await expect(page.getByRole('button', { name: /^ok$/i })).toHaveCount(0);
  await expect(page.getByTitle(/replacement-document\.pdf \(\d+ ?B\)/i)).toBeVisible();

  // STEP 18: HOVER over the attached document
  await attachmentLink.hover();

  // STEP 19: CLICK the Download button
  const [download] = await Promise.all([
    page.waitForEvent('download', { timeout: 15_000 }),
    downloadButton.click(),
  ]);
  expect(download.suggestedFilename()).toMatch(/replacement-document\.pdf/i);

  // STEP 20: HOVER over the Audit Trail (history) icon
  // The popover this opens is headed "History", not "Audit Trail" — it lists each uploaded version
  // (Version 1: original-document.pdf, Version 2: replacement-document.pdf) with uploader and timestamp.
  await attachmentLink.hover();
  await auditTrailButton.hover();

  // ASSERT audit trail information is surfaced for the attachment
  await expect(page.getByText(/^history$/i).first()).toBeVisible({ timeout: 10_000 });
  await expect(page.getByText(/version 1/i)).toBeVisible();
  await expect(page.getByText(/version 2/i)).toBeVisible();
  await expect(page.getByText(/original-document\.pdf/i)).toBeVisible();
  // "replacement-document.pdf" now matches twice: the current attachment row's hover-only-visible
  // .ant-upload-list-item-name link, and the History popover's own (visible) Version 2 entry. Popovers
  // like this are portalled to the end of <body>, so .last() reliably lands on the visible one.
  await expect(page.getByText(/replacement-document\.pdf/i).last()).toBeVisible();

  // STEP 21: CLICK the Delete icon
  await attachmentLink.hover();
  await deleteButton.click();
  await expect(page.getByRole('button', { name: /^ok$/i })).toBeVisible({ timeout: 10_000 });

  // STEP 22: CLICK the OK button
  await page.getByRole('button', { name: /^ok$/i }).click();

  // ASSERT (BLOCKING) The attachment is removed from the UI
  await expect(page.getByTitle(/replacement-document\.pdf \(\d+ ?B\)/i)).toHaveCount(0, { timeout: 10_000 });
});
