// AD-HOC, NOT part of the canonical suite (no paired .md; not counted by the dashboard build).
// Runs ONLY the ADO-documented steps of test case #105188 (Verify New Draft Version Creation) —
// no setup flow (no creating+retracting a fresh memo). Logs in as Craig and targets a specific,
// already-Retracted item (REF2026/08200) directly.
// Delete this file once its purpose (a one-off verification run) is served.

import { test, expect, Page, Locator } from '@playwright/test';

const APP_URL = 'https://pd-approvals-adminportal-qa.azurewebsites.net';
const CRAIG = { username: 'Craig', password: '123qwe' };
const TARGET_REF = 'REF2026/08200';

async function login(page: Page, creds: { username: string; password: string }) {
  await page.goto(`${APP_URL}/login`, { waitUntil: 'domcontentloaded', timeout: 60_000 });
  await page.getByPlaceholder(/username/i).fill(creds.username, { timeout: 60_000 });
  await page.getByPlaceholder(/password/i).fill(creds.password);
  await page.getByRole('button', { name: /log ?in|sign in/i }).click();
  await page.waitForURL(url => !url.toString().includes('/login'), { timeout: 15_000 });
  await page.waitForLoadState('networkidle');
}

// NOTE: deliberately never uses force:true here — a forced click still performs a real mouse click
// at the element's on-screen coordinates, so if the Workflows flyout is visually overlapping that
// spot, force just clicks *through* to the flyout link underneath (confirmed live: landed on
// "Drafts" instead of the intended row). Only a genuinely dismissed flyout makes the click safe.
async function clickWithFlyoutRetry(page: Page, locator: Locator, attempts = 8) {
  for (let i = 0; i < attempts; i++) {
    try {
      await locator.click({ timeout: 6_000 });
      return;
    } catch (err) {
      if (i === attempts - 1) throw err;
      await page.keyboard.press('Escape');
      // A real click at an empty spot far from the panel — mouse.move alone doesn't close it (it's
      // a pinned click-opened panel, not a hover tooltip).
      await page.mouse.click(900, 400);
      await page.waitForTimeout(1_000);
      await expect(page.getByText(/^Inbox$/i)).toHaveCount(0, { timeout: 3_000 }).catch(() => {});
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

// This is a click-opened, PINNED panel (Inbox/My Items/Sent Items/Drafts) — not a hover tooltip.
// Moving the mouse away does nothing; it only closes on an actual click outside its bounds (screenshot
// confirmed it sits roughly x:60-222, y:80-275, covering the table's first column underneath it).
async function dismissWorkflowsFlyout(page: Page) {
  const stillOpen = await page.getByText(/^Inbox$/i).isVisible({ timeout: 2_000 }).catch(() => false);
  if (!stillOpen) return;
  await page.mouse.click(700, 400);
  await page.waitForTimeout(500);
  await expect(page.getByText(/^Inbox$/i)).toHaveCount(0, { timeout: 5_000 }).catch(async () => {
    await page.keyboard.press('Escape');
    await page.mouse.click(700, 450);
    await page.waitForTimeout(500);
  });
}

test('AD-HOC — ADO #105188 steps only, Craig, REF2026/08200', async ({ page }) => {
  test.setTimeout(180_000);

  const viewModeControl = page.locator('[title="Click to change view mode"]');
  const toggle = page.locator('.ant-layout-sider-trigger, [class*="trigger"], [aria-label*="toggle" i], [aria-label*="menu" i]').first();

  // ADO STEP 1 (id2): Login as Initiator (Craigm -> using working username "Craig")
  await login(page, CRAIG);
  await expect(page).not.toHaveURL(/login/);

  // ADO STEP 2 (id8): Click the view-mode control, then click "Latest" in the popover
  await switchToLatest(page, viewModeControl);

  // ADO STEP 3 (id9): Click the sidebar toggle
  await toggle.click();

  // ADO STEP 4 (id3): Expand the Workflows Dropdown
  // Expected: list of child items is displayed (Inbox, Sent Items and Drafts)
  await page.getByText(/^Workflows?$/i).first().click();
  await expect(page.getByText(/^Inbox$/i).first()).toBeVisible({ timeout: 10_000 });
  await expect(page.getByText(/^Sent Items$/i).first()).toBeVisible();
  await expect(page.getByText(/^Drafts$/i).first()).toBeVisible();

  // ADO STEP 5 (id4): Click on My Items
  // Expected: My Items index table displayed successfully
  const DETAIL_URL_RE = /\/shesha\/workflow(-action)?\?/;
  const createNewVersionBtn = page.getByRole('button', { name: /create new version/i });

  // ADO STEP 6 (id5): Click on any item with "Retracted" status — using the specific known item REF2026/08200.
  // Expected: "Create New Version" button should be displayed
  //
  // Outer retry: the Workflows flyout intercepting the row click is a known, already-documented flaky
  // issue across this suite. If a click attempt ever lands somewhere other than the item's own detail
  // page (e.g. it slips through to "Drafts"), re-navigate to a clean My Items and try the whole
  // open-item sequence again, rather than silently continuing from the wrong page.
  let onDetailPage = false;
  for (let outerAttempt = 0; outerAttempt < 3 && !onDetailPage; outerAttempt++) {
    await page.goto(`${APP_URL}/dynamic/Shesha.Workflow/workflows-my-items`, { waitUntil: 'domcontentloaded', timeout: 30_000 });
    await page.waitForLoadState('networkidle');
    await dismissWorkflowsFlyout(page);
    await expect(page.getByRole('table').or(page.getByRole('grid')).first()).toBeVisible({ timeout: 15_000 });

    const searchInput = page.getByPlaceholder(/search/i).or(page.getByRole('textbox').first());
    await searchInput.click();
    await searchInput.fill(TARGET_REF);
    await page.keyboard.press('Enter');
    // Exclude the "/V2" (or later) row — negative lookahead so we target the base ref, not its version.
    const targetRow = page.getByRole('row', { name: new RegExp(`${TARGET_REF.replace('/', '\\/')}(?!/V)`, 'i') });
    await expect(targetRow).toBeVisible({ timeout: 15_000 });
    const rowStatusText = await targetRow.innerText();
    console.log(`ADHOC — ${TARGET_REF} row text: "${rowStatusText}"`);

    const itemLink = targetRow.locator('a.sha-link').first().or(targetRow.getByRole('cell').first().locator('a').first());

    await dismissWorkflowsFlyout(page);
    await page.mouse.move(1100, 500);
    await page.waitForTimeout(400);
    await clickWithFlyoutRetry(page, itemLink);
    await page.waitForTimeout(1500);

    onDetailPage = DETAIL_URL_RE.test(page.url());
    if (!onDetailPage) {
      console.log(`ADHOC — outer attempt ${outerAttempt + 1}: click landed on "${page.url()}" instead of the item detail page. Retrying from a clean My Items.`);
    }
  }
  expect(onDetailPage, `Never landed on the item detail page after 3 outer attempts — last URL: ${page.url()}`).toBeTruthy();
  await page.waitForLoadState('networkidle').catch(() => {});
  await expect(page.locator('.ant-spin, .ant-skeleton').first()).toHaveCount(0, { timeout: 30_000 }).catch(() => {});
  await page.waitForTimeout(1500);

  let versionBtnVisible = await createNewVersionBtn.isVisible({ timeout: 5_000 }).catch(() => false);
  for (let attempt = 0; attempt < 4 && !versionBtnVisible; attempt++) {
    console.log(`ADHOC — Create New Version not visible yet (check ${attempt + 1}), reloading page and re-checking...`);
    await page.reload({ waitUntil: 'domcontentloaded', timeout: 30_000 });
    await page.waitForLoadState('networkidle').catch(() => {});
    await expect(page.locator('.ant-spin, .ant-skeleton').first()).toHaveCount(0, { timeout: 30_000 }).catch(() => {});
    await page.waitForTimeout(1500);
    versionBtnVisible = await createNewVersionBtn.isVisible({ timeout: 5_000 }).catch(() => false);
  }
  await expect(createNewVersionBtn).toBeVisible({ timeout: 10_000 });

  // ADO STEP 7 (id6): Click on Create New Version button
  // Expected: popup with "Are you sure you want to create a new version" message should be displayed
  await createNewVersionBtn.click();
  const confirmPopup = page.locator('.ant-modal:not(.ant-modal-hidden), .ant-popover:not(.ant-popover-hidden)').filter({ hasText: /new version/i }).first();
  await expect(confirmPopup).toBeVisible({ timeout: 10_000 });
  await expect(confirmPopup).toContainText(/are you sure you want to create a new version/i);

  // ADO STEP 8 (id7): Click on OK button
  // Expected: system should auto refresh and open the item in Draft mode with incremented reference number V2
  await confirmPopup.getByRole('button', { name: /^ok$/i }).click();

  await page.waitForLoadState('networkidle');
  await page.waitForTimeout(2000);
  const versionRefLocator = page.getByText(new RegExp(`${TARGET_REF.replace('/', '\\/')}\\/V\\d+`, 'i'));
  await expect(versionRefLocator.first()).toBeVisible({ timeout: 20_000 });
  await expect(page.getByText(/draft/i).first()).toBeVisible();
});
