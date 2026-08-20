// AUTO-RECORDED from test-plans/AdminPortal/verify-delete-qualification-completeflow.md
// Source: Azure DevOps project pd-recruitment, test case #106284 "Delete
// Qualification" (work item rev 2). The .md plan is canonical. AI-repair
// will patch failing lines in this file. Do not hand-edit unless you are
// also updating the .md plan.
//
// Recruiter role (Kwenas / "Kwena Semono"), Recruitment > Job Posting
// Dashboard section. Targets Job Posting Ref No 40's application created
// on ADMINPORTAL-106172 — currently listed as "Edit Last Name A", then
// the Education panel's row for Institution "Test University".
//
// IMPORTANT: unlike the Work Experience row (no .anticon-delete icon at
// all — see test-reports/bugs/2026-08-05-work-experience-delete-icon-does-not-exist.md),
// the Education row DOES have a .anticon-delete icon (confirmed live
// 2026-08-06). This is a real, executable test case for this application.
//
// Popup confirmed live: Ant Design Popconfirm, text "Are you sure want to
// delete this item?", buttons "Cancel" and "OK".
//
// scrollIntoViewIfNeeded() is unstable here (content above still
// loading) — use a plain wheel scroll instead (see ADMINPORTAL-106276/106279/106280/106281).
//
// Selector note: resolve the row's index once while it still has plain
// text (before any destructive action), same fix as
// ADMINPORTAL-106540/106541/106542/106547/106276/106278/106279/106280/106281.
//
// TC-10 clicks OK on the delete confirmation popup for real — this
// PERMANENTLY deletes the Education row (Institution "Test University")
// from this application. Confirmed with the requester before running.

import { test, expect, Page } from '@playwright/test';

const APP_URL = 'https://pd-recruitment-adminportal-qa.shesha.app/';
const RECRUITER = { user: 'Kwenas', password: '123qwe' };
const TARGET_REF_NO = '40';
// Surname/Initials text as it currently appears in the Applications table —
// update this if a prior real run already renamed the candidate further.
const CANDIDATE_ROW_TEXT = 'Edit Last Name A';
// Row anchor: Institution, stable up until this test case deletes it.
const ROW_ANCHOR_TEXT = 'Test University';
const CONFIRM_TEXT = 'Are you sure want to delete this item?';

async function loginAsKwena(page: Page) {
  await page.goto(`${APP_URL}login`, { waitUntil: 'domcontentloaded' });
  await page.waitForSelector('input[placeholder="Username"]', { timeout: 45_000 });
  await page.locator('input[placeholder="Username"]').fill(RECRUITER.user);
  await page.locator('input[placeholder="Password"]').fill(RECRUITER.password);
  await page.getByRole('button', { name: 'Sign In' }).click();
  await page.waitForURL(url => !url.href.includes('/login'), { timeout: 30000 });
  await page.waitForLoadState('networkidle').catch(() => {});
  await page.waitForTimeout(1000);
}

async function toggleSidebar(page: Page) {
  await page.locator('.anticon-menu-fold, .anticon-menu-unfold').first().click();
  await page.waitForTimeout(600);
}

async function openRecruitmentMenu(page: Page) {
  await toggleSidebar(page);
  await page.getByText('Recruitment', { exact: false }).first().click();
  await page.waitForTimeout(600);
}

async function goToJobPostingDashboard(page: Page) {
  await openRecruitmentMenu(page);
  await page.getByText('Job Posting Dashboard', { exact: false }).first().click();
  await page.waitForLoadState('networkidle').catch(() => {});
  await page.waitForTimeout(2000);
  // The Recruitment sidebar flyout can stay open/hovering and intercept
  // clicks on the table underneath — move the mouse away to dismiss it.
  await page.mouse.move(900, 400);
  await page.mouse.move(1200, 700);
  await page.waitForTimeout(300);
}

async function openTargetJobPosting(page: Page) {
  await goToJobPostingDashboard(page);
  const searchInput = page.locator('input').first();
  await searchInput.fill(TARGET_REF_NO);
  await page.keyboard.press('Enter');
  await page.waitForTimeout(1500);
  const row = page.locator('div[role="row"]').filter({ has: page.getByText(TARGET_REF_NO, { exact: true }) }).first();
  await row.locator('a, [class*="link"]').first().click();
  await page.waitForLoadState('networkidle').catch(() => {});
  await page.waitForTimeout(2000);
}

async function openTargetApplication(page: Page) {
  await openTargetJobPosting(page);
  await page.mouse.wheel(0, 1500);
  await page.waitForTimeout(600);
  await page.getByText(CANDIDATE_ROW_TEXT, { exact: false }).first().click();
  await page.waitForLoadState('networkidle').catch(() => {});
  await page.waitForTimeout(2000);
}

// Resolves the Education row's position among ALL div[role="row"]
// elements on the page while it still has plain text content.
async function findTargetRowIndex(page: Page): Promise<number> {
  // scrollIntoViewIfNeeded() is unstable here — use a plain wheel scroll.
  await page.mouse.wheel(0, 2200);
  await page.waitForTimeout(500);
  await page.getByText(ROW_ANCHOR_TEXT, { exact: false }).first().waitFor({ state: 'visible', timeout: 60_000 });
  const rows = page.locator('div[role="row"]');
  const count = await rows.count();
  for (let i = 0; i < count; i++) {
    const text = await rows.nth(i).innerText().catch(() => '');
    if (text.includes(ROW_ANCHOR_TEXT)) return i;
  }
  throw new Error(`Could not find a row containing "${ROW_ANCHOR_TEXT}"`);
}

function deleteIconAt(page: Page, index: number) {
  return page.locator('div[role="row"]').nth(index).locator('.anticon-delete').first();
}

function confirmPopup(page: Page) {
  return page.locator('.ant-popover:not(.ant-popover-hidden)').filter({ hasText: CONFIRM_TEXT });
}

function cancelButtonInPopup(page: Page) {
  return confirmPopup(page).getByRole('button', { name: 'Cancel', exact: true }).first();
}

function okButtonInPopup(page: Page) {
  return confirmPopup(page).getByRole('button', { name: 'OK', exact: true }).first();
}

test.describe('ADMINPORTAL-106284 — Delete Qualification', () => {
  test.describe.configure({ mode: 'serial' });

  test('TC-01: Login as Kwena', async ({ page }) => {
    await loginAsKwena(page);
    // ASSERT (BLOCKING) URL no longer contains /login
    await expect(page).not.toHaveURL(/login/i);
  });

  test('TC-02: Click the sidebar toggle', async ({ page }) => {
    await loginAsKwena(page);
    await toggleSidebar(page);
    // ASSERT (BLOCKING) Recruitment navigation item is visible
    await expect(page.getByText('Recruitment', { exact: false }).first()).toBeVisible();
  });

  test('TC-03: Click on Recruitment dropdown', async ({ page }) => {
    await loginAsKwena(page);
    await openRecruitmentMenu(page);
    // ASSERT (BLOCKING) submenus are visible
    await expect(page.getByText('Job Posting Dashboard', { exact: false }).first()).toBeVisible();
    await expect(page.getByText('Location', { exact: true }).first()).toBeVisible();
    await expect(page.getByText('Salary Levels', { exact: false }).first()).toBeVisible();
    await expect(page.getByText('Candidates', { exact: true }).first()).toBeVisible();
    await expect(page.getByText('Candidates Applications', { exact: false }).first()).toBeVisible();
  });

  test('TC-04: Click on Job Posting dashboard', async ({ page }) => {
    test.setTimeout(120_000);
    await loginAsKwena(page);
    await goToJobPostingDashboard(page);
    // ASSERT (BLOCKING) Job Postings index table is displayed
    await expect(page.getByText('Job Postings', { exact: true }).first()).toBeVisible();
    await expect(page.getByText('Reference No', { exact: false }).first()).toBeVisible();
  });

  test('TC-05: Open Job Posting Ref No 40', async ({ page }) => {
    test.setTimeout(120_000);
    await loginAsKwena(page);
    await openTargetJobPosting(page);
    // ASSERT (BLOCKING) Job Details panel shows Job Reference Number 40
    await expect(page.getByText('Job Reference', { exact: false }).first()).toBeVisible();
    await expect(page.getByText(TARGET_REF_NO, { exact: true }).first()).toBeVisible();
  });

  test('TC-06: Scroll to Applications panel and open the application created on Test Case 106172', async ({ page }) => {
    test.setTimeout(180_000);
    await loginAsKwena(page);
    await openTargetApplication(page);
    // ASSERT (BLOCKING) Application opens with status "PRE-SCREENED"
    await expect(page.getByText('Personal Details', { exact: true }).first()).toBeVisible();
    await expect(page.getByText('PRE-SCREENED', { exact: false }).first()).toBeVisible();
  });

  test('TC-07: Navigate to Education panel and click the Delete icon', async ({ page }) => {
    test.setTimeout(180_000);
    await loginAsKwena(page);
    await openTargetApplication(page);
    const index = await findTargetRowIndex(page);
    await deleteIconAt(page, index).click();
    await page.waitForTimeout(800);
    // ASSERT (BLOCKING) confirmation popup appears
    await expect(confirmPopup(page)).toBeVisible();
    await expect(confirmPopup(page)).toContainText(CONFIRM_TEXT);
  });

  test('TC-08: Click on Cancel button', async ({ page }) => {
    test.setTimeout(180_000);
    await loginAsKwena(page);
    await openTargetApplication(page);
    const index = await findTargetRowIndex(page);
    await deleteIconAt(page, index).click();
    await page.waitForTimeout(800);
    await cancelButtonInPopup(page).click();
    await page.waitForTimeout(500);
    // ASSERT (BLOCKING) confirmation popup closes successfully
    await expect(confirmPopup(page)).toBeHidden();
    // ASSERT (BLOCKING) Education row is still present
    await expect(page.getByText(ROW_ANCHOR_TEXT, { exact: false }).first()).toBeVisible();
  });

  test('TC-09: Click on Delete button again', async ({ page }) => {
    test.setTimeout(180_000);
    await loginAsKwena(page);
    await openTargetApplication(page);
    const index = await findTargetRowIndex(page);
    await deleteIconAt(page, index).click();
    await page.waitForTimeout(800);
    // ASSERT (BLOCKING) confirmation popup with Cancel and OK buttons appears
    await expect(confirmPopup(page)).toBeVisible();
    await expect(cancelButtonInPopup(page)).toBeVisible();
    await expect(okButtonInPopup(page)).toBeVisible();
  });

  test('TC-10: Click on OK button', async ({ page }) => {
    test.setTimeout(180_000);
    await loginAsKwena(page);
    await openTargetApplication(page);
    const index = await findTargetRowIndex(page);
    await deleteIconAt(page, index).click();
    await page.waitForTimeout(800);
    // STEP: CLICK OK — REAL, PERMANENT, IRREVERSIBLE DELETE, confirmed
    // with requester
    await okButtonInPopup(page).click();
    await page.waitForTimeout(2000);
    // ASSERT (BLOCKING) after the delete + reload, the row no longer exists
    await page.reload({ waitUntil: 'domcontentloaded' });
    await page.waitForLoadState('networkidle').catch(() => {});
    await page.waitForTimeout(2000);
    await page.mouse.wheel(0, 2200);
    await page.waitForTimeout(500);
    const stillPresent = await page.getByText(ROW_ANCHOR_TEXT, { exact: false }).count();
    expect(stillPresent).toBe(0);
  });
});
