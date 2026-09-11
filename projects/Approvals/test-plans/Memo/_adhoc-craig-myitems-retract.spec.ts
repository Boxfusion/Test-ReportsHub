// AD-HOC, NOT part of the canonical suite (no paired .md; not counted by the dashboard build).
// Requested variant of ADO test case #105186: skip the Ian-initiator setup/creation and the
// Craig-negative-check-in-Inbox half entirely. Login as Craig only, go straight to My Items, and
// attempt the retract steps against whatever "In Progress" item is already there.
// Delete this file once its purpose (a one-off verification run) is served.

import { test, expect, Page, Locator } from '@playwright/test';

const APP_URL = 'https://pd-approvals-adminportal-qa.azurewebsites.net';
const CRAIG = { username: 'Craig', password: '123qwe' };

async function login(page: Page, creds: { username: string; password: string }) {
  await page.goto(`${APP_URL}/login`, { waitUntil: 'domcontentloaded', timeout: 60_000 });
  await page.getByPlaceholder(/username/i).fill(creds.username, { timeout: 60_000 });
  await page.getByPlaceholder(/password/i).fill(creds.password);
  await page.getByRole('button', { name: /log ?in|sign in/i }).click();
  await page.waitForURL(url => !url.toString().includes('/login'), { timeout: 15_000 });
  await page.waitForLoadState('networkidle');
}

async function clickWithFlyoutRetry(page: Page, locator: Locator, attempts = 6) {
  for (let i = 0; i < attempts; i++) {
    try {
      await locator.click({ timeout: 6_000, force: i === attempts - 1 });
      return;
    } catch (err) {
      if (i === attempts - 1) throw err;
      await page.keyboard.press('Escape');
      await page.mouse.move(1100, 500);
      await page.mouse.move(1120, 520);
      await page.waitForTimeout(800);
    }
  }
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

async function dismissWorkflowsFlyout(page: Page) {
  await page.mouse.move(700, 400);
  await page.waitForTimeout(500);
  await expect(page.getByText(/^Inbox$/i)).toHaveCount(0, { timeout: 5_000 }).catch(async () => {
    await page.keyboard.press('Escape');
    await page.mouse.move(700, 450);
    await page.waitForTimeout(500);
  });
}

test('AD-HOC — Craig, My Items, retract (highlight row, no detail view)', async ({ page }) => {
  test.setTimeout(180_000);

  const viewModeControl = page.locator('[title="Click to change view mode"]');
  const toggle = page.locator('.ant-layout-sider-trigger, [class*="trigger"], [aria-label*="toggle" i], [aria-label*="menu" i]').first();

  // STEP: login as Craig only — no Ian setup, no memo creation.
  await login(page, CRAIG);
  await expect(page).not.toHaveURL(/login/);

  // ADO STEP 2 (id9): view-mode control -> Latest
  await switchToLatest(page, viewModeControl);

  // ADO STEP 3 (id10): sidebar toggle
  await toggle.click();

  // ADO STEP 4 (id3): expand Workflows dropdown
  await page.getByText(/^Workflows?$/i).first().click();
  await expect(page.getByText(/^Inbox$/i).first()).toBeVisible({ timeout: 10_000 });

  // ADO STEP 5 (id4): go straight to My Items
  await page.goto(`${APP_URL}/dynamic/Shesha.Workflow/workflows-my-items`, { waitUntil: 'domcontentloaded', timeout: 30_000 });
  await page.waitForLoadState('networkidle');
  await dismissWorkflowsFlyout(page);
  await expect(page.getByRole('table').or(page.getByRole('grid')).first()).toBeVisible({ timeout: 15_000 });

  // Target a specific item by Ref Number via the search box (same mechanism the canonical spec uses).
  const targetRef = 'REF2026/05431';
  const searchInput = page.getByPlaceholder(/search/i).or(page.getByRole('textbox').first());
  await searchInput.click();
  await searchInput.fill(targetRef);
  await page.keyboard.press('Enter');
  const targetRow = page.getByRole('row', { name: new RegExp(targetRef.replace('/', '\\/')) });
  await expect(targetRow).toBeVisible({ timeout: 15_000 });
  await expect(targetRow).toContainText(/in progress/i);
  console.log(`ADHOC — targeting item ${targetRef}`);

  // ADO STEP 6 (id5): "Click to highlight" the item — NOT opening the detail view. Click a
  // non-link cell (the status badge) so the row gets selected/highlighted in the grid itself.
  await dismissWorkflowsFlyout(page);
  await page.mouse.move(1100, 500);
  await page.waitForTimeout(500);
  const highlightTarget = targetRow.getByText(/in progress/i).first();
  await clickWithFlyoutRetry(page, highlightTarget);
  await page.waitForTimeout(1000);

  // Retract button should now be enabled somewhere on the page (row-scoped action or page toolbar)
  // now that the In Progress row is highlighted/selected — without ever navigating into the item.
  const retractButton = page.getByRole('button', { name: /retract/i }).first();
  await expect(retractButton).toBeVisible({ timeout: 15_000 });
  await expect(retractButton).toBeEnabled({ timeout: 15_000 });

  // ADO STEP 7 (id6): click Retract
  await retractButton.click();
  const retractDialog = page.getByRole('dialog').or(page.locator('.ant-modal-content')).first();
  await expect(retractDialog).toBeVisible({ timeout: 10_000 });

  // ADO STEP 8 (id7): populate Comments
  const commentsField = retractDialog.locator('textarea, [contenteditable="true"]').first();
  await commentsField.click();
  await page.keyboard.type('Test retract comment (ad-hoc, Craig)');
  await expect(commentsField).toContainText('Test retract comment', { timeout: 5_000 }).catch(async () => {
    await expect(commentsField).toHaveValue('Test retract comment (ad-hoc, Craig)', { timeout: 5_000 });
  });

  // ADO STEP 9 (id8): click Retract on the dialog
  const dialogRetractBtn = retractDialog.getByRole('button', { name: /retract/i }).or(retractDialog.getByRole('button', { name: /^ok$/i }));
  await expect(dialogRetractBtn).toBeEnabled({ timeout: 10_000 });

  // Diagnostic: log the actual API call + response for the retract action, since the dialog closes
  // "successfully" every time yet the status never changes — need to see what the backend really returned.
  page.on('response', async (res) => {
    if (['POST', 'PUT', 'PATCH'].includes(res.request().method()) && /workflow|retract/i.test(res.url())) {
      let bodySnippet = '';
      try { bodySnippet = (await res.text()).slice(0, 500); } catch { /* ignore */ }
      console.log(`ADHOC_NET — ${res.request().method()} ${res.url()} -> ${res.status()}\n${bodySnippet}`);
    }
  });

  await dialogRetractBtn.click();

  // Diagnostic: capture any visible toast/alert/notification on screen right after the click,
  // before it would auto-dismiss, to confirm whether the 500 error is surfaced to the user at all.
  await page.waitForTimeout(800);
  const toastTexts = await page.locator('.ant-message, .ant-notification, [role="alert"], [role="status"]').allInnerTexts().catch(() => []);
  console.log('ADHOC_TOAST — visible toast/alert/notification texts right after clicking dialog Retract:', JSON.stringify(toastTexts));

  await expect(retractDialog).toBeHidden({ timeout: 15_000 });
  await page.waitForLoadState('networkidle');
  await page.waitForTimeout(2000);

  // The My Items grid doesn't auto-refresh after the action — reload it and re-check the row's status.
  await page.getByRole('button', { name: /^reload$/i }).click();
  await page.waitForLoadState('networkidle');
  await page.waitForTimeout(1500);
  const refreshedRow = page.getByRole('row', { name: new RegExp(targetRef!.replace('/', '\\/')) });
  await expect(refreshedRow).toContainText(/retracted/i, { timeout: 15_000 });
});
