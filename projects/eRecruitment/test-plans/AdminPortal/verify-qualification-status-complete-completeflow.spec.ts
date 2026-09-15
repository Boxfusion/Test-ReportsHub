// AUTO-RECORDED from test-plans/AdminPortal/verify-qualification-status-complete-completeflow.md
// Source: Azure DevOps project pd-recruitment, test case #106281 "Verify
// qualification status (complete)" (work item rev 3). The .md plan is
// canonical. AI-repair will patch failing lines in this file. Do not
// hand-edit unless you are also updating the .md plan.
//
// Recruiter role (Kwenas / "Kwena Semono"), Recruitment > Job Posting
// Dashboard section. Targets Job Posting Ref No 40's application created
// on ADMINPORTAL-106172 — currently listed as "Edit Last Name A", then
// the Education panel's row for Institution "Test University".
//
// IMPORTANT: unlike ADMINPORTAL-106543/106544 (same "Qualification
// Status" field, different candidate — blocked because the field does
// not exist at all on a normal candidate's Secondary/Tertiary
// Qualifications rows, see
// test-reports/bugs/2026-08-05-qualification-status-field-does-not-exist.md),
// this row — created via the ADMINPORTAL-106172 "Add New Application"
// wizard — genuinely HAS a Qualification Status dropdown AND a Date
// Obtained datepicker in edit mode (confirmed live 2026-08-06 for
// ADMINPORTAL-106280: 2 .ant-select elements in the row — Qualification
// Type first, Qualification Status second). This is a real, executable
// test case for this application specifically.
//
// scrollIntoViewIfNeeded() is unstable here (content above still
// loading) — use a plain wheel scroll instead (see ADMINPORTAL-106276/106279/106280).
//
// Selector note: once a row is switched into inline edit mode, its cell
// text becomes input VALUES, which Playwright's hasText filter does not
// see as text content — resolve the row's index once while it still has
// plain text and reuse that positional nth() index for the rest of the
// test (same fix as ADMINPORTAL-106540/106541/106542/106547/106276/106278/106279/106280).
//
// Date picker note: unlike the Work Experience row (two date inputs —
// Start/End), this row's Date Obtained is a SINGLE
// input[placeholder="Select date"]. Calendar cell selection reuses the
// exact-regex pattern from ADMINPORTAL-106298 to avoid matching stale/
// hidden calendar nodes.
//
// TC-11 clicks the row's inline Save icon for real, changing
// Qualification Status from "In Progress" to "Complete" and Date
// Obtained to a new previous date — confirmed with the requester before
// running.

import { test, expect, Page } from '@playwright/test';

const APP_URL = 'https://pd-recruitment-adminportal-qa.shesha.app/';
const RECRUITER = { user: 'Kwenas', password: '123qwe' };
const TARGET_REF_NO = '40';
// Surname/Initials text as it currently appears in the Applications table —
// update this if a prior real run already renamed the candidate further.
const CANDIDATE_ROW_TEXT = 'Edit Last Name A';
// Row anchor: Institution, stable throughout this edit.
const ROW_ANCHOR_TEXT = 'Test University';
const NEW_QUALIFICATION_STATUS = 'Complete';
// A day clearly in the past relative to the currently-displayed month
// (today is 2026-08-06) — future days in the current month are disabled
// in the datepicker.
const NEW_DATE_DAY = 5;

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
// elements on the page while it still has plain text content, so the
// same index can be reused after the row switches to inline-input edit
// mode (see header comment).
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

async function enterEducationEditMode(page: Page): Promise<number> {
  const index = await findTargetRowIndex(page);
  const row = page.locator('div[role="row"]').nth(index);
  await row.locator('.anticon-edit').first().click();
  await page.waitForTimeout(800);
  return index;
}

function qualificationStatusSelectAt(page: Page, index: number) {
  // Confirmed live 2026-08-06: the row has 2 .ant-select elements —
  // Qualification Type first, Qualification Status second.
  return page.locator('div[role="row"]').nth(index).locator('.ant-select').nth(1);
}

function dateObtainedInputAt(page: Page, index: number) {
  // Single datepicker input for this row (unlike Work Experience's two).
  return page.locator('div[role="row"]').nth(index).locator('input[placeholder="Select date"]').first();
}

function visibleCalendarDay(page: Page, day: number) {
  const exact = new RegExp(`^${day}$`);
  return page.locator('.ant-picker-dropdown:not(.ant-picker-dropdown-hidden) .ant-picker-cell-in-view').filter({ hasText: exact });
}

function saveIconAt(page: Page, index: number) {
  // `.anticon-save` is the specific, unambiguous class for the row's
  // inline save action — confirmed live (ADMINPORTAL-106540).
  return page.locator('div[role="row"]').nth(index).locator('.anticon-save').first();
}

async function selectComplete(page: Page, index: number) {
  await qualificationStatusSelectAt(page, index).click();
  await page.waitForTimeout(500);
  await page.locator('.ant-select-dropdown:not(.ant-select-dropdown-hidden) .ant-select-item-option', { hasText: NEW_QUALIFICATION_STATUS }).first().click();
  await page.waitForTimeout(500);
}

async function pickDateObtained(page: Page, index: number) {
  await dateObtainedInputAt(page, index).click();
  await page.waitForTimeout(500);
  await visibleCalendarDay(page, NEW_DATE_DAY).first().click();
  await page.waitForTimeout(500);
}

test.describe('ADMINPORTAL-106281 — Verify qualification status (complete)', () => {
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

  test('TC-06: Open the target application', async ({ page }) => {
    test.setTimeout(180_000);
    await loginAsKwena(page);
    await openTargetApplication(page);
    // ASSERT (BLOCKING) Personal Details panel visible with First Name "AutoTest"
    await expect(page.getByText('Personal Details', { exact: true }).first()).toBeVisible();
    await expect(page.getByText('AutoTest', { exact: false }).first()).toBeVisible();
    await expect(page.getByText('PRE-SCREENED', { exact: false }).first()).toBeVisible();
  });

  test('TC-07: Navigate to Education panel and click the Edit icon', async ({ page }) => {
    test.setTimeout(180_000);
    await loginAsKwena(page);
    await openTargetApplication(page);
    const index = await enterEducationEditMode(page);
    // ASSERT (BLOCKING) Qualification Status dropdown is now editable
    await expect(qualificationStatusSelectAt(page, index)).toBeVisible();
  });

  test('TC-08: Click on the Qualification Status dropdown', async ({ page }) => {
    test.setTimeout(180_000);
    await loginAsKwena(page);
    await openTargetApplication(page);
    const index = await enterEducationEditMode(page);
    await qualificationStatusSelectAt(page, index).click();
    await page.waitForTimeout(500);
    // ASSERT (BLOCKING) "In Progress" and "Complete" options are displayed
    await expect(page.getByText('In Progress', { exact: true }).first()).toBeVisible();
    await expect(page.getByText('Complete', { exact: true }).first()).toBeVisible();
  });

  test('TC-09: Select "Complete"', async ({ page }) => {
    test.setTimeout(180_000);
    await loginAsKwena(page);
    await openTargetApplication(page);
    const index = await enterEducationEditMode(page);
    await selectComplete(page, index);
    // ASSERT (BLOCKING) Qualification Status dropdown now shows "Complete"
    await expect(qualificationStatusSelectAt(page, index)).toContainText(NEW_QUALIFICATION_STATUS);
  });

  test('TC-10: Click inside the Date Obtained datepicker and select a previous date', async ({ page }) => {
    test.setTimeout(180_000);
    await loginAsKwena(page);
    await openTargetApplication(page);
    const index = await enterEducationEditMode(page);
    await selectComplete(page, index);
    await dateObtainedInputAt(page, index).click();
    await page.waitForTimeout(500);
    // ASSERT (BLOCKING) a calendar opens
    await expect(page.locator('.ant-picker-dropdown:not(.ant-picker-dropdown-hidden)').first()).toBeVisible();
    await visibleCalendarDay(page, NEW_DATE_DAY).first().click();
    await page.waitForTimeout(500);
    // ASSERT (BLOCKING) Date Obtained field shows the picked date
    await expect(dateObtainedInputAt(page, index)).not.toHaveValue('');
  });

  test('TC-11: Click on Save', async ({ page }) => {
    test.setTimeout(180_000);
    await loginAsKwena(page);
    await openTargetApplication(page);
    const index = await enterEducationEditMode(page);
    await selectComplete(page, index);
    await pickDateObtained(page, index);
    // STEP: CLICK the row's inline Save icon — REAL, PERSISTENT EDIT,
    // confirmed with requester
    await saveIconAt(page, index).click();
    await page.waitForTimeout(2000);
    // ASSERT (BLOCKING) after Save + reload, the row shows the updated Qualification Status
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
      if (text.includes(ROW_ANCHOR_TEXT) && text.includes(NEW_QUALIFICATION_STATUS)) { found = true; break; }
    }
    expect(found).toBeTruthy();
  });
});
