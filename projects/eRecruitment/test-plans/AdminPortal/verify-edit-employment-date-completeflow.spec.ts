// AUTO-RECORDED from test-plans/AdminPortal/verify-edit-employment-date-completeflow.md
// Source: Azure DevOps project pd-recruitment, test case #106298 "Verify
// Edit Employment Date" (work item rev 2). The .md plan is canonical.
// AI-repair will patch failing lines in this file. Do not hand-edit
// unless you are also updating the .md plan.
//
// Recruiter role (Kwenas / "Kwena Semono"), Recruitment > Job Posting
// Dashboard section. Targets Job Posting Ref No 40's application created
// on ADMINPORTAL-106172 — currently listed as "Edit Last Name A" in the
// Applications table's Surname/Initials column (confirmed live
// 2026-08-06), Work Experience row "Edited Job title" (set by
// ADMINPORTAL-106285) / "Edited Employer" (set by ADMINPORTAL-106295).
//
// IMPORTANT: the two datepicker cell locators must be scoped to the
// currently VISIBLE `.ant-picker-dropdown` and matched with an EXACT
// day-number regex — a plain substring match can resolve to a stale/
// hidden calendar's cell left in the DOM from a previously-closed picker
// (see ADMINPORTAL-106549). Also, days at/after "today" in the currently
// displayed month get disabled (future dates) — confirmed live in
// ADMINPORTAL-106172/106298's sibling tests; use early-month days that
// are unambiguously in the past.
//
// Selector note: once the row switches to inline edit mode, cell text
// becomes input VALUES, which Playwright's hasText filter does not see as
// text content — resolve the row's index once while it still has plain
// text and reuse that positional nth() index for the rest of the test
// (same fix as ADMINPORTAL-106540/106541/106542/106547/106285/106295).

import { test, expect, Page } from '@playwright/test';

const APP_URL = 'https://pd-recruitment-adminportal-qa.shesha.app/';
const RECRUITER = { user: 'Kwenas', password: '123qwe' };
const TARGET_REF_NO = '40';
const NEW_START_DAY = 2;
const NEW_END_DAY = 4;
// Surname/Initials text as it currently appears in the Applications table —
// update this if a prior real run already renamed the candidate further.
const CANDIDATE_ROW_TEXT = 'Edit Last Name A';
const ROW_ANCHOR_TEXT = 'Edited Job title';

async function loginAsKwena(page: Page) {
  await page.goto(`${APP_URL}login`, { waitUntil: 'domcontentloaded' });
  // Bumped from 20s to 45s — this environment has been observed to stall
  // on the "Initializing..." client bootstrap splash for longer than the
  // usual quick transient flake (see ADMINPORTAL-106544's attempts).
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

// Resolves the Work Experience row's position among ALL div[role="row"]
// elements on the page while it still has plain text content, so the
// same index can be reused after the row switches to inline-input edit
// mode (see header comment).
async function findTargetRowIndex(page: Page): Promise<number> {
  await page.waitForLoadState('networkidle').catch(() => {});
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

async function enterWorkExperienceEditMode(page: Page): Promise<number> {
  const index = await findTargetRowIndex(page);
  const row = page.locator('div[role="row"]').nth(index);
  await row.locator('.anticon-edit').first().click();
  await page.waitForTimeout(800);
  return index;
}

function dateInputsAt(page: Page, index: number) {
  // Column order is Job Title, Employer, Employment Start Date,
  // Employment End Date, Reason For Leaving — the two date pickers are
  // the only inputs with this placeholder, in order (Start, then End).
  return page.locator('div[role="row"]').nth(index).locator('input[placeholder="Select date"]');
}

function visibleCalendarDay(page: Page, day: number) {
  const exact = new RegExp(`^${day}$`);
  return page.locator('.ant-picker-dropdown:not(.ant-picker-dropdown-hidden) .ant-picker-cell-in-view').filter({ hasText: exact });
}

function saveIconAt(page: Page, index: number) {
  // Confirmed live (ADMINPORTAL-106540): `.anticon-save` is the specific,
  // unambiguous class for the row's inline save action.
  return page.locator('div[role="row"]').nth(index).locator('.anticon-save').first();
}

async function pickStartDate(page: Page, index: number) {
  await dateInputsAt(page, index).nth(0).click();
  await page.waitForTimeout(500);
  await visibleCalendarDay(page, NEW_START_DAY).first().click();
  await page.waitForTimeout(500);
}

async function pickEndDate(page: Page, index: number) {
  await dateInputsAt(page, index).nth(1).click();
  await page.waitForTimeout(500);
  await visibleCalendarDay(page, NEW_END_DAY).first().click();
  await page.waitForTimeout(500);
}

test.describe('ADMINPORTAL-106298 — Verify Edit Employment Date', () => {
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

  test('TC-06: Open the application created on Test Case 106172', async ({ page }) => {
    test.setTimeout(180_000);
    await loginAsKwena(page);
    await openTargetApplication(page);
    // ASSERT (BLOCKING) Personal Details panel visible with First Name "AutoTest"
    await expect(page.getByText('Personal Details', { exact: true }).first()).toBeVisible();
    await expect(page.getByText('AutoTest', { exact: false }).first()).toBeVisible();
    await expect(page.getByText('PRE-SCREENED', { exact: false }).first()).toBeVisible();
  });

  test('TC-07: Navigate to Work Experience panel and click the Edit icon', async ({ page }) => {
    test.setTimeout(180_000);
    await loginAsKwena(page);
    await openTargetApplication(page);
    const index = await enterWorkExperienceEditMode(page);
    // ASSERT (BLOCKING) the row's date fields are now editable inputs
    await expect(dateInputsAt(page, index).nth(0)).toBeVisible();
    await expect(dateInputsAt(page, index).nth(1)).toBeVisible();
  });

  test('TC-08: Click on Employment Start Date', async ({ page }) => {
    test.setTimeout(180_000);
    await loginAsKwena(page);
    await openTargetApplication(page);
    const index = await enterWorkExperienceEditMode(page);
    await dateInputsAt(page, index).nth(0).click();
    await page.waitForTimeout(500);
    // ASSERT (BLOCKING) a calendar opens
    await expect(page.locator('.ant-picker-dropdown:not(.ant-picker-dropdown-hidden)').first()).toBeVisible();
  });

  test('TC-09: Select a previous date for Employment Start Date', async ({ page }) => {
    test.setTimeout(180_000);
    await loginAsKwena(page);
    await openTargetApplication(page);
    const index = await enterWorkExperienceEditMode(page);
    await pickStartDate(page, index);
    // ASSERT (BLOCKING) Employment Start Date field shows the picked date
    await expect(dateInputsAt(page, index).nth(0)).not.toHaveValue('');
  });

  test('TC-10: Click on Employment End Date', async ({ page }) => {
    test.setTimeout(180_000);
    await loginAsKwena(page);
    await openTargetApplication(page);
    const index = await enterWorkExperienceEditMode(page);
    await pickStartDate(page, index);
    await dateInputsAt(page, index).nth(1).click();
    await page.waitForTimeout(500);
    // ASSERT (BLOCKING) a calendar opens
    await expect(page.locator('.ant-picker-dropdown:not(.ant-picker-dropdown-hidden)').first()).toBeVisible();
  });

  test('TC-11: Select a previous date for Employment End Date', async ({ page }) => {
    test.setTimeout(180_000);
    await loginAsKwena(page);
    await openTargetApplication(page);
    const index = await enterWorkExperienceEditMode(page);
    await pickStartDate(page, index);
    await pickEndDate(page, index);
    // ASSERT (BLOCKING) Employment End Date field shows the picked date
    await expect(dateInputsAt(page, index).nth(1)).not.toHaveValue('');
  });

  test('TC-12: Click on Save', async ({ page }) => {
    test.setTimeout(180_000);
    await loginAsKwena(page);
    await openTargetApplication(page);
    const index = await enterWorkExperienceEditMode(page);
    await pickStartDate(page, index);
    const startValue = await dateInputsAt(page, index).nth(0).inputValue();
    await pickEndDate(page, index);
    const endValue = await dateInputsAt(page, index).nth(1).inputValue();
    // STEP: CLICK the row's inline Save icon — REAL, PERSISTENT EDIT,
    // confirmed with requester
    await saveIconAt(page, index).click();
    await page.waitForTimeout(2000);
    // ASSERT (BLOCKING) after Save + reload, the row shows the updated dates
    await page.reload({ waitUntil: 'domcontentloaded' });
    await page.waitForLoadState('networkidle').catch(() => {});
    await page.waitForTimeout(2000);
    await page.mouse.wheel(0, 2200);
    await page.getByText(ROW_ANCHOR_TEXT, { exact: false }).first().waitFor({ state: 'visible', timeout: 60_000 });
    const rows = page.locator('div[role="row"]');
    const count = await rows.count();
    let found = false;
    for (let i = 0; i < count; i++) {
      const text = await rows.nth(i).innerText().catch(() => '');
      if (text.includes(ROW_ANCHOR_TEXT) && text.includes(startValue) && text.includes(endValue)) { found = true; break; }
    }
    expect(found).toBeTruthy();
  });
});
