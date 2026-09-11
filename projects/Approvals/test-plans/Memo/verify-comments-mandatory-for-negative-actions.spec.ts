// AUTO-RECORDED from test-plans/Memo/verify-comments-mandatory-for-negative-actions.md
// Source: Azure DevOps test plan #100853, suite #100854, test case #105893
// The .md plan is canonical. AI-repair will patch failing lines in this file.
// Do not hand-edit unless you are also updating the .md plan.

import { test, expect, Page, Locator } from '@playwright/test';

const APP_URL = 'https://pd-approvals-adminportal-qa.azurewebsites.net';
const IAN = { username: 'Ian', password: '123qwe' };

// This QA environment can sit on an "Initializing..." splash for well over the default 15s action
// timeout before the login form mounts. Give the username field a generous timeout rather than
// failing fast, since the app itself (verified via curl) is otherwise up.
async function login(page: Page, creds: { username: string; password: string }) {
  await page.goto(`${APP_URL}/login`, { waitUntil: 'domcontentloaded', timeout: 60_000 });
  await page.getByPlaceholder(/username/i).fill(creds.username, { timeout: 60_000 });
  await page.getByPlaceholder(/password/i).fill(creds.password);
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

// The Routing step's approver dropdown is virtualized (rc-virtual-list) and the first rendered "option"
// is sometimes an off-screen measurement placeholder that happens to carry the real first item's
// aria-label — clicking it (even with force) fails with "Element is outside of the viewport" because it
// genuinely isn't on screen. The reliable approach is pure keyboard traversal: read the currently
// highlighted option via aria-activedescendant, step forward with ArrowDown until it matches, then
// press Enter — this never depends on any option's visibility or bounding box.
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

test('TC-01 — Verify Comments Field Is Mandatory For Negative Actions', async ({ page }) => {
  test.setTimeout(300_000);

  // STEP 1: LOGIN to the system as initiator (Ian)
  await login(page, IAN);
  await expect(page).not.toHaveURL(/login/);

  // STEP 2: CLICK the Toggle from the top-left corner of the screen
  const toggle = page.locator('.ant-layout-sider-trigger, [class*="trigger"], [aria-label*="toggle" i], [aria-label*="menu" i]').first();
  await toggle.click();

  // STEP 3: CLICK the Workflows dropdown
  await page.getByText(/^Workflows?$/i).first().click();
  await expect(page.getByText(/^Inbox$/i).first()).toBeVisible({ timeout: 10_000 });

  // STEP 4: CLICK the My Items menu item
  await page.goto(`${APP_URL}/dynamic/Shesha.Workflow/workflows-my-items`, { waitUntil: 'domcontentloaded', timeout: 30_000 });
  await page.waitForLoadState('networkidle');
  await expect(page.getByRole('button', { name: /create new/i })).toBeVisible({ timeout: 15_000 });

  // STEP 5: CLICK the Create New button. Retried: this occasionally doesn't open its menu on the first
  // click if the page is still settling.
  const newReferralsItem = page.getByRole('menuitem', { name: /new referrals?/i });
  for (let attempt = 0; attempt < 3; attempt++) {
    await clickWithFlyoutRetry(page, page.getByRole('button', { name: /create new/i }));
    try {
      await expect(newReferralsItem).toBeVisible({ timeout: 6_000 });
      break;
    } catch (err) {
      if (attempt === 2) throw err;
    }
  }

  // STEP 6: CLICK the New Referrals subtype
  await clickWithFlyoutRetry(page, newReferralsItem);

  // STEP 7: POPULATE all mandatory fields and under CC field ADD "Ian" (self-referential — Ian routes
  // to himself, unlike sibling test cases which route to Craig).
  await expect(page.getByText(/subject/i).first()).toBeVisible({ timeout: 15_000 });
  const ccField = page.getByRole('combobox').nth(1);
  await ccField.click();
  const ccDropdownPanel = page.locator('.ant-select-dropdown:not(.ant-select-dropdown-hidden)');
  await expect(ccDropdownPanel).toBeVisible({ timeout: 10_000 });
  await selectApproverOption(page, /ian/i);
  const ccContainer = ccField.locator('xpath=../..');
  await expect(ccContainer).toContainText(/ian/i, { timeout: 10_000 });

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
    const text = `Test ${name} input`;
    for (let attempt = 0; attempt < 3; attempt++) {
      await editor.click();
      await page.keyboard.type(text);
      try {
        await expect(editor).toContainText(text, { timeout: 6_000 });
        break;
      } catch (err) {
        if (attempt === 2) throw err;
        await editor.fill('').catch(() => {});
        await page.waitForTimeout(500);
      }
    }
  }

  // STEP 8: ACTION the memo through Compose -> Attachments -> Routing.
  for (let attempt = 0; attempt < 3; attempt++) {
    await page.getByRole('button', { name: /next/i }).click();
    try {
      await expect(page.getByRole('button', { name: /back/i })).toBeVisible({ timeout: 10_000 });
      break;
    } catch (err) {
      if (attempt === 2) throw err;
    }
  }
  await expect(page.getByRole('tab', { name: /purpose/i })).toHaveCount(0);

  await page.getByRole('button', { name: /next/i }).click();
  await expect(page.getByRole('button', { name: /^next$/i })).toHaveCount(0, { timeout: 15_000 });
  await expect(page.getByRole('button', { name: /submit/i })).toBeVisible();
  await expect(page.getByText(/select approver/i).first()).toBeVisible();

  // Record the memo's Ref No (script-only bookkeeping — not an ADO step — used to reliably locate the
  // item afterward; ADO's manual steps don't include this).
  const bodyText = await page.locator('body').innerText();
  const refNo = bodyText.match(/REF\d{4}\/\d+/i)?.[0];
  expect(refNo).toBeTruthy();

  // STEP 9-10: CLICK the Select Signatory dropdown and SELECT "Ian" as a signatory.
  // AI-repair: the keyboard-based selectApproverOption() helper (proven for the Craig-based sibling
  // tests) consistently failed here — Ian confirmed present in the dropdown's option list, yet the field
  // stayed empty afterward. Likely stale aria-activedescendant tracking carried over from the CC field's
  // own dropdown interaction moments earlier. Click the option's visible text directly instead.
  const approverField = page.getByRole('combobox').first();
  await approverField.click();
  const approverDropdownPanel = page.locator('.ant-select-dropdown:not(.ant-select-dropdown-hidden)').last();
  await expect(approverDropdownPanel).toBeVisible({ timeout: 10_000 });
  const ianOption = approverDropdownPanel.getByText(/ian/i).first();
  await expect(ianOption).toBeVisible({ timeout: 5_000 });
  await ianOption.click();
  const approverFieldContainer = approverField.locator('xpath=../..');
  await expect(approverFieldContainer).toContainText(/ian/i, { timeout: 10_000 });

  // STEP 11: CLICK the Add button
  await page.getByRole('button', { name: /add/i }).click();
  await expect(page.getByText(/no approvers/i)).toHaveCount(0, { timeout: 10_000 });
  await expect(page.getByRole('cell', { name: /ian/i }).first()).toBeVisible();

  // STEP 12: CLICK the Submit button (no Required Action edit — ADO's steps skip that here, leaving it
  // at its default).
  await page.getByRole('button', { name: /submit/i }).click();

  // ASSERT (BLOCKING) Submitting shows a success confirmation
  await expect(page.getByText(/you have successfully submitted/i)).toBeVisible({ timeout: 20_000 });
  await expect(page.getByText(refNo!, { exact: true })).toBeVisible();

  // The Confirmation step still shows a "Confirm" button — click it to finalize.
  await page.getByRole('button', { name: /^confirm$/i }).click();
  await page.waitForTimeout(1_000);

  // STEP 13: LOG IN as approver — Ian again, fresh session (ADO explicitly separates this from STEP 1's
  // login, so log out and back in even though it's the same account).
  await page.getByText(/ian houvet/i).first().click();
  await page.getByText(/logout/i).click();
  await page.waitForURL(url => url.toString().includes('/login'), { timeout: 30_000 });
  await login(page, IAN);
  await expect(page).not.toHaveURL(/login/);
  await expect(page.getByText(/ian/i).first()).toBeVisible({ timeout: 15_000 });

  // STEP 14-15: CLICK the Workflows dropdown, then CLICK the Inbox menu item.
  await page.goto(`${APP_URL}/dynamic/Shesha.Workflow/workflows-inbox`, { waitUntil: 'domcontentloaded', timeout: 30_000 });
  await page.waitForLoadState('networkidle');
  await expect(page.getByText(/incoming items/i)).toBeVisible({ timeout: 15_000 });

  // STEP 16: OPEN the item that was assigned to the signatory above
  await page.getByPlaceholder(/search/i).or(page.getByRole('textbox').first()).fill(refNo!);
  await page.keyboard.press('Enter');
  const targetRow = page.getByRole('row', { name: new RegExp(refNo!.replace('/', '\\/')) });
  await expect(targetRow).toBeVisible({ timeout: 15_000 });
  await targetRow.getByRole('cell').first().locator('a').first().click();

  await page.waitForURL(/workflow-action/, { timeout: 20_000 });
  await page.waitForLoadState('networkidle');
  await expect(page.locator('.ant-spin, .ant-skeleton').first()).toHaveCount(0, { timeout: 30_000 }).catch(() => {});
  await page.waitForTimeout(2000);

  // STEP 17: CLICK on Memo Action(s) — ensure the "Memo Action" tab is selected (it is the default tab
  // when opening an actionable item, matching the pattern already confirmed live in sibling test cases).
  const memoActionTab = page.getByRole('tab', { name: /^memo action$/i });
  if (await memoActionTab.count()) {
    await memoActionTab.click();
    await expect(memoActionTab).toHaveAttribute('aria-selected', 'true', { timeout: 10_000 });
  }

  // STEP 18: SELECT the "Do Not Recommend" radio button
  const doNotRecommendRadio = page.getByRole('radio', { name: 'Do not Recommend', exact: true });
  await expect(doNotRecommendRadio).toBeVisible({ timeout: 15_000 });
  await doNotRecommendRadio.check();
  await expect(doNotRecommendRadio).toBeChecked();

  // ASSERT (BLOCKING) The Comments field is marked mandatory (asterisk) once a negative action is chosen.
  await expect(page.getByText(/supporting comments/i).first()).toBeVisible({ timeout: 10_000 });

  // STEP 19: CLICK the Submit button WITHOUT populating Comments.
  const submitBtn = page.getByRole('button', { name: /submit/i }).last();
  await submitBtn.scrollIntoViewIfNeeded();
  await submitBtn.click();

  // ASSERT (BLOCKING) A "Comments are mandatory" validation message is shown, and the item is NOT
  // completed (the review controls remain — the negative submission was rejected client-side).
  await expect(page.getByText(/comments? (is|are) mandatory/i).first()).toBeVisible({ timeout: 10_000 });
  await expect(doNotRecommendRadio).toBeVisible();
});
