// AUTO-RECORDED from test-plans/AdminPortal/verify-edit-qualification-name.md
// Source: Azure DevOps project pd-recruitment, test case #106541 "Verify
// Edit qualification name" (work item rev 3). The .md plan is
// canonical. AI-repair will patch failing lines in this file. Do not
// hand-edit unless you are also updating the .md plan.
//
// Recruiter role (Kwenas / "Kwena Semono"), Recruitment > Job Posting
// Dashboard section. Targets Job Posting Ref No 40's application
// (currently listed as "Edit Last Name F"), Education panel's Secondary
// Qualifications row (Qualification Name "NSCS"). ADO steps 10-11 have a
// copy/paste leftover from ADMINPORTAL-106540 ("...Institution text
// area") — read as "Qualification Name" per step 9 and the test title.
//
// IMPORTANT selector note: once a row is switched into inline edit mode,
// its cell text becomes input VALUES, which Playwright's hasText filter
// does not see as text content — so a fresh hasText lookup on the row's
// original text stops matching right after editing starts. This spec
// resolves the row's index once (while it still has plain text) and
// reuses that positional nth() index for every subsequent interaction
// within the same test (same fix as ADMINPORTAL-106540).
//
// TC-11 clicks Save for real. Unlike Institution (a required field that
// rejects a blank save, see ADMINPORTAL-106540), Qualification Name is
// populated with a real replacement value here, so the Save is expected
// to succeed and persist — confirmed with the requester before running.
// All earlier TCs never click Save.

import { test, expect, Page } from '@playwright/test';

const APP_URL = 'https://pd-recruitment-adminportal-qa.shesha.app/';
const RECRUITER = { user: 'Kwenas', password: '123qwe' };
const TARGET_REF_NO = '40';
// Surname/Initials text as it currently appears in the Applications table —
// update this if a prior real run already renamed the candidate further.
const CANDIDATE_ROW_TEXT = 'Edit Last Name F';
const ROW_ANCHOR_TEXT = 'NSCS';
const NEW_QUALIFICATION_NAME = 'Edited Qualification Name';

async function loginAsKwena(page: Page) {
  await page.goto(`${APP_URL}login`, { waitUntil: 'domcontentloaded' });
  await page.waitForSelector('input[placeholder="Username"]', { timeout: 20000 });
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
  // clicks on the table underneath — move the mouse away to dismiss it
  // (same quirk as the Workflows/Inbox menu elsewhere in this project;
  // see ADMINPORTAL-106534 TC-10 for the failure this fixes).
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

// Resolves the Secondary Qualifications row's position among ALL
// div[role="row"] elements on the page while it still has plain text
// content, so the same index can be reused after the row switches to
// inline-input edit mode (see selector note above).
async function findTargetRowIndex(page: Page): Promise<number> {
  await page.getByText('Education', { exact: true }).first().scrollIntoViewIfNeeded();
  // The Education panel's qualification tables load asynchronously and can
  // still show "loading..." placeholders well after networkidle/scroll —
  // wait for the actual target text to appear rather than a fixed delay
  // (same class of quirk documented for the Inbox table elsewhere in this
  // project; see ADMINPORTAL-106540 TC-09's first attempt).
  await page.getByText(ROW_ANCHOR_TEXT, { exact: false }).first().waitFor({ state: 'visible', timeout: 20_000 });
  const rows = page.locator('div[role="row"]');
  const count = await rows.count();
  for (let i = 0; i < count; i++) {
    const text = await rows.nth(i).innerText().catch(() => '');
    if (text.includes(ROW_ANCHOR_TEXT)) return i;
  }
  throw new Error(`Could not find a row containing "${ROW_ANCHOR_TEXT}"`);
}

async function enterEducationEditMode(page: Page): Promise<number> {
  const index = await findTargetRowIndex(page);
  const row = page.locator('div[role="row"]').nth(index);
  await row.locator('.anticon-edit').first().click();
  await page.waitForTimeout(800);
  return index;
}

function qualificationNameInputAt(page: Page, index: number) {
  // Column order in the Secondary Qualifications table is Institution,
  // Qualification Name, Qualification Type, Certificate — Qualification
  // Name is the second plain <input>.
  return page.locator('div[role="row"]').nth(index).locator('input').nth(1);
}

function saveIconAt(page: Page, index: number) {
  // Confirmed live (ADMINPORTAL-106540): the row has multiple icons in
  // edit mode (Qualification Type select's suffix/clear icons, Certificate
  // upload/history/sync/delete icons, then the row's own save + cancel
  // icons) — `.anticon-save` is the specific, unambiguous class.
  return page.locator('div[role="row"]').nth(index).locator('.anticon-save').first();
}

test.describe('ADMINPORTAL-106541 — Verify Edit qualification name', () => {
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
    await loginAsKwena(page);
    await goToJobPostingDashboard(page);
    // ASSERT (BLOCKING) Job Postings index table is displayed
    await expect(page.getByText('Job Postings', { exact: true }).first()).toBeVisible();
    await expect(page.getByText('Reference No', { exact: false }).first()).toBeVisible();
  });

  test('TC-05: Open Job Posting Ref No 40', async ({ page }) => {
    await loginAsKwena(page);
    await openTargetJobPosting(page);
    // ASSERT (BLOCKING) Job Details panel shows Job Reference Number 40
    await expect(page.getByText('Job Reference', { exact: false }).first()).toBeVisible();
    await expect(page.getByText(TARGET_REF_NO, { exact: true }).first()).toBeVisible();
  });

  test('TC-06: Open the target application', async ({ page }) => {
    await loginAsKwena(page);
    await openTargetApplication(page);
    // ASSERT (BLOCKING) Personal Details panel visible with First Name "Fred"
    await expect(page.getByText('Personal Details', { exact: true }).first()).toBeVisible();
    await expect(page.getByText('Fred', { exact: false }).first()).toBeVisible();
  });

  test('TC-07: Navigate to Education panel and click the Edit icon', async ({ page }) => {
    await loginAsKwena(page);
    await openTargetApplication(page);
    const index = await enterEducationEditMode(page);
    // ASSERT (BLOCKING) Qualification Name field is now an editable input
    await expect(qualificationNameInputAt(page, index)).toBeVisible();
  });

  test('TC-08: Click on the Qualification Name text area', async ({ page }) => {
    await loginAsKwena(page);
    await openTargetApplication(page);
    const index = await enterEducationEditMode(page);
    const input = qualificationNameInputAt(page, index);
    await input.click();
    // ASSERT (BLOCKING) Qualification Name field is focused and editable
    await expect(input).toBeFocused();
  });

  test('TC-09: Clear the Qualification Name text area', async ({ page }) => {
    await loginAsKwena(page);
    await openTargetApplication(page);
    const index = await enterEducationEditMode(page);
    const input = qualificationNameInputAt(page, index);
    await input.click();
    await input.fill('');
    // ASSERT (BLOCKING) Qualification Name field is empty
    await expect(input).toHaveValue('');
  });

  test('TC-10: Populate the Qualification Name text area with "Edited Qualification Name"', async ({ page }) => {
    await loginAsKwena(page);
    await openTargetApplication(page);
    const index = await enterEducationEditMode(page);
    const input = qualificationNameInputAt(page, index);
    await input.click();
    await input.fill('');
    await input.fill(NEW_QUALIFICATION_NAME);
    // ASSERT (BLOCKING) Qualification Name field contains the typed value
    await expect(input).toHaveValue(NEW_QUALIFICATION_NAME);
  });

  test('TC-11: Click on Save', async ({ page }) => {
    await loginAsKwena(page);
    await openTargetApplication(page);
    const index = await enterEducationEditMode(page);
    const input = qualificationNameInputAt(page, index);
    await input.click();
    await input.fill('');
    await input.fill(NEW_QUALIFICATION_NAME);
    // STEP: CLICK the row's inline Save icon — REAL, PERSISTENT EDIT,
    // confirmed with the requester
    await saveIconAt(page, index).click();
    await page.waitForTimeout(2000);
    // ASSERT (BLOCKING) after Save + reload, the row shows the updated value
    await page.reload({ waitUntil: 'domcontentloaded' });
    await page.waitForLoadState('networkidle').catch(() => {});
    await page.waitForTimeout(2000);
    await expect(page.getByText(NEW_QUALIFICATION_NAME, { exact: false }).first()).toBeVisible({ timeout: 15_000 });
  });
});
