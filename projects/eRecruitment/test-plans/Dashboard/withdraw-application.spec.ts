// AUTO-RECORDED from test-plans/Dashboard/withdraw-application.md
// Source: Azure DevOps test plan #99437, suite #106380, test case #106381
// The .md plan is canonical. AI-repair will patch failing lines in this file.
// Do not hand-edit unless you are also updating the .md plan.
//
// STATEFUL: TC-09 actually withdraws one of Fred's real submitted
// applications in QA. See the .md's warning section.
//
// DOM notes confirmed live 2026-07-30:
// - "My Applications" is a plain <h5> heading; the clickable link is the
//   sibling <a href="/dynamic/Shesha.Recruitment/applications-table">.
// - Each application-details view renders all four action buttons
//   (Apply / Resubmit / Withdraw Application / Continue Application) in the
//   DOM regardless of status, but only one is actually visible depending on
//   the application's real state (draft / submitted / withdrawn). Most rows
//   in this shared QA "Fred" account are drafts ("Continue Application");
//   only a minority have "Withdraw Application" visible.
// - The applications listing itself is subject to the same transient
//   empty-list behavior seen on the Jobs page (shared QA account under
//   concurrent modification) — handled with a retry+reload.
// - The row "view" icon is a magnifying-glass ("search") icon wrapped in an
//   <a class="sha-link">, distinct from the header search box's
//   button-wrapped search icon.
// - The Withdraw dialog is titled "Withdraw Application", contains a
//   warning alert, a <textarea class="sha-text-area"> for comments, and
//   Close / Withdraw Application (disabled until comments are entered)
//   buttons.

import { test, expect, Page, Locator } from '@playwright/test';

const APP_URL = 'https://pd-recruitment-publicportal-1-qa.shesha.app/';
const APPLICANT = { user: 'Fred', password: 'Metaganemr%03' };
const COMMENT_TEXT = 'Withdrawing application for automated QA testing purposes.';

async function loginAsFred(page: Page) {
  await page.goto(`${APP_URL}login`);
  await page.locator('input[type="text"]').first().fill(APPLICANT.user);
  await page.locator('input[type="password"]').first().fill(APPLICANT.password);
  await page.getByRole('button', { name: /sign in/i }).click();
  await page.waitForURL(url => !url.href.includes('/login'), { timeout: 30000 });
  await page.waitForLoadState('networkidle');
}

async function goToDashboard(page: Page) {
  await page.getByRole('link', { name: 'Dashboard', exact: true }).click();
  await page.waitForLoadState('networkidle');
  await page.waitForTimeout(1000);
}

async function goToMyApplications(page: Page) {
  await goToDashboard(page);
  await page.locator('a[href*="applications-table"]').first().click();
  await page.waitForLoadState('networkidle');
  await page.waitForTimeout(1000);
}

function rowViewLink(page: Page): Locator {
  return page.locator('a.sha-link').filter({ has: page.locator('.anticon-search') });
}

function withdrawButton(page: Page): Locator {
  return page.getByRole('button', { name: 'Withdraw Application', exact: true });
}

// Scans "Your Applications" (across pages) for the first row whose details
// view has an active Withdraw Application button, retrying the initial
// listing load if it's transiently empty.
async function openApplicationReadyToWithdraw(page: Page): Promise<string> {
  await goToMyApplications(page);
  for (let attempt = 1; attempt <= 6; attempt++) {
    if (await rowViewLink(page).first().isVisible({ timeout: 8000 }).catch(() => false)) break;
    if (attempt === 6) throw new Error('Applications listing stayed empty after retries.');
    await page.reload();
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(2000);
  }
  for (let pageNum = 1; pageNum <= 3; pageNum++) {
    if (pageNum > 1) {
      const pageBtn = page.getByText(String(pageNum), { exact: true }).first();
      if (!(await pageBtn.isVisible().catch(() => false))) break;
      await pageBtn.click();
      await page.waitForLoadState('networkidle');
      await page.waitForTimeout(1000);
    }
    const count = await rowViewLink(page).count();
    for (let i = 0; i < count; i++) {
      await rowViewLink(page).nth(i).click();
      await page.waitForLoadState('networkidle');
      await page.waitForTimeout(800);
      if (await withdrawButton(page).isVisible().catch(() => false)) {
        const refNumber = await page
          .getByText('REFERENCE NUMBER', { exact: false })
          .locator('xpath=following::span[1]')
          .innerText()
          .catch(() => '');
        return refNumber.trim();
      }
      await page.goBack();
      await page.waitForLoadState('networkidle');
      await page.waitForTimeout(800);
    }
  }
  throw new Error('No application with an available Withdraw Application button was found across all pages.');
}

function withdrawDialog(page: Page): Locator {
  return page.locator('.ant-modal-content').filter({ hasText: 'Withdraw Application' });
}

// "Close" resolves to two elements in the dialog: the modal's aria-label
// close icon (X) and the actual toolbar "Close" button — same ambiguity as
// the Apply dialog in verify-apply-for-a-job.spec.ts / cancel-job-application.spec.ts.
// Disambiguate via the toolbar button's class.
function dialogCloseButton(page: Page): Locator {
  return withdrawDialog(page).locator('button.sha-toolbar-btn').filter({ hasText: 'Close' });
}

function dialogSubmitButton(page: Page): Locator {
  return withdrawDialog(page).getByRole('button', { name: 'Withdraw Application', exact: true });
}

function commentsField(page: Page): Locator {
  return withdrawDialog(page).locator('textarea').first();
}

test.describe('DASHBOARD-106381 — Withdraw Application', () => {
  test.describe.configure({ mode: 'serial' });

  test('TC-01: Login as Fred', async ({ page }) => {
    await loginAsFred(page);
    await expect(page).not.toHaveURL(/login/i);
    await expect(page.getByText('Your Dashboard')).toBeVisible({ timeout: 30000 });
  });

  test('TC-02: Click on Dashboard menu item', async ({ page }) => {
    await loginAsFred(page);
    await goToDashboard(page);
    await expect(page.getByText('Your Dashboard')).toBeVisible({ timeout: 15000 });
  });

  test('TC-03: Click on My Applications', async ({ page }) => {
    await loginAsFred(page);
    await goToMyApplications(page);
    await expect(rowViewLink(page).first()).toBeVisible({ timeout: 15000 });
  });

  test('TC-04: Open an application from the list', async ({ page }) => {
    await loginAsFred(page);
    const ref = await openApplicationReadyToWithdraw(page);
    console.log('TARGET_APPLICATION_REF:', ref);
    await expect(withdrawButton(page)).toBeVisible({ timeout: 15000 });
  });

  test('TC-05: Click Withdraw Application button', async ({ page }) => {
    await loginAsFred(page);
    await openApplicationReadyToWithdraw(page);
    // STEP: CLICK the Withdraw Application button
    await withdrawButton(page).click();
    // ASSERT (BLOCKING) Withdraw application dialog is displayed
    await expect(withdrawDialog(page)).toBeVisible({ timeout: 10000 });
  });

  test('TC-06: Click Close button', async ({ page }) => {
    await loginAsFred(page);
    await openApplicationReadyToWithdraw(page);
    await withdrawButton(page).click();
    await expect(withdrawDialog(page)).toBeVisible({ timeout: 10000 });
    // STEP: CLICK the Close button
    await dialogCloseButton(page).click();
    // ASSERT (BLOCKING) Withdraw application dialog closes successfully
    await expect(withdrawDialog(page)).toBeHidden({ timeout: 10000 });
  });

  test('TC-07: Click Withdraw Application button again', async ({ page }) => {
    await loginAsFred(page);
    await openApplicationReadyToWithdraw(page);
    await withdrawButton(page).click();
    await expect(withdrawDialog(page)).toBeVisible({ timeout: 10000 });
    await dialogCloseButton(page).click();
    await expect(withdrawDialog(page)).toBeHidden({ timeout: 10000 });
    // STEP: CLICK the Withdraw Application button
    await withdrawButton(page).click();
    // ASSERT (BLOCKING) dialog displayed with Withdraw Application (submit) button disabled
    await expect(withdrawDialog(page)).toBeVisible({ timeout: 10000 });
    await expect(dialogSubmitButton(page)).toBeDisabled();
  });

  test('TC-08: Populate comments', async ({ page }) => {
    await loginAsFred(page);
    await openApplicationReadyToWithdraw(page);
    await withdrawButton(page).click();
    await expect(withdrawDialog(page)).toBeVisible({ timeout: 10000 });
    await expect(dialogSubmitButton(page)).toBeDisabled();
    // STEP: Populate comments
    await commentsField(page).fill(COMMENT_TEXT);
    // ASSERT (BLOCKING) comments populated; Withdraw Application button enabled
    await expect(commentsField(page)).toHaveValue(COMMENT_TEXT);
    await expect(dialogSubmitButton(page)).toBeEnabled({ timeout: 10000 });
  });

  test('TC-09: Click Withdraw Application button', async ({ page }) => {
    await loginAsFred(page);
    const ref = await openApplicationReadyToWithdraw(page);
    await withdrawButton(page).click();
    await expect(withdrawDialog(page)).toBeVisible({ timeout: 10000 });
    await commentsField(page).fill(COMMENT_TEXT);
    await expect(dialogSubmitButton(page)).toBeEnabled({ timeout: 10000 });
    // STEP: CLICK the dialog's Withdraw Application button
    await dialogSubmitButton(page).click();
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(2000);
    // ASSERT (BLOCKING) system auto-refreshes and a "Resubmit" button is displayed
    console.log('WITHDRAWN_APPLICATION_REF:', ref);
    await expect(page.getByRole('button', { name: 'Resubmit', exact: true })).toBeVisible({ timeout: 20000 });
  });
});
