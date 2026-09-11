// AUTO-RECORDED from test-plans/AdminPortal/verify-edit-employment-date.md
// Source: Azure DevOps project pd-recruitment, test case #106549 "Verify
// Edit Employment Date" (work item rev 3). The .md plan is canonical.
// AI-repair will patch failing lines in this file. Do not hand-edit
// unless you are also updating the .md plan.
//
// Recruiter role (Kwenas / "Kwena Semono"), Recruitment > Job Posting
// Dashboard section. Targets Job Posting Ref No 40's application
// (currently listed as "Edit Last Name F"), Work Experience panel's row
// for "Senior Test Engineer". ADO step 9 says "Employer Start Date" —
// read as "Employment Start Date" per the test title and step 8.
//
// IMPORTANT selector note: the two datepicker cell locators must be
// scoped to the currently VISIBLE `.ant-picker-dropdown` and matched with
// an EXACT day-number regex (e.g. /^1$/) — a plain substring match like
// hasText: '1' or hasText: '2' can resolve to a stale/hidden calendar's
// cell (e.g. day 12, 21) left in the DOM from a previously-closed picker,
// causing a click timeout. Confirmed live 2026-08-05. Same class of
// "stale dropdown node" quirk documented for .ant-select-dropdown
// elsewhere in this project.
//
// IMPORTANT selector note #2: once a row is switched into inline edit
// mode, its cell text becomes input VALUES, which Playwright's hasText
// filter does not see as text content — so a fresh hasText lookup on the
// row's original text stops matching right after editing starts. This
// spec resolves the row's index once (while it still has plain text)
// and reuses that positional nth() index for every subsequent
// interaction within the same test (same fix as
// ADMINPORTAL-106540/106541/106542/106547/106548).
//
// TC-12 clicks the row's inline Save icon for real, permanently changing
// the row's Employment Start/End Dates — confirmed with the requester
// before running. All earlier TCs never click Save.

import { test, expect, Page } from '@playwright/test';

const APP_URL = 'https://pd-recruitment-adminportal-qa.shesha.app/';
const RECRUITER = { user: 'Kwenas', password: '123qwe' };
const TARGET_REF_NO = '40';
// Surname/Initials text as it currently appears in the Applications table —
// update this if a prior real run already renamed the candidate further.
const CANDIDATE_ROW_TEXT = 'Edit Last Name F';
const ROW_ANCHOR_TEXT = 'Senior Test Engineer';
const NEW_START_DATE = '01/07/2026';
const NEW_END_DATE = '02/07/2026';

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

// Resolves the Work Experience row's position among ALL div[role="row"]
// elements on the page while it still has plain text content, so the
// same index can be reused after the row switches to inline-input edit
// mode (see selector note #2 above).
async function findTargetRowIndex(page: Page): Promise<number> {
  await page.waitForLoadState('networkidle').catch(() => {});
  await page.mouse.wheel(0, 2200);
  await page.waitForTimeout(500);
  // Bumped to 60s — the environment has been running slow lately (see
  // ADMINPORTAL-106544/106545/106547/106548's attempts), this is a real
  // slowness workaround, not a selector fix.
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
  await visibleCalendarDay(page, 1).first().click();
  await page.waitForTimeout(500);
}

async function pickEndDate(page: Page, index: number) {
  await dateInputsAt(page, index).nth(1).click();
  await page.waitForTimeout(500);
  await visibleCalendarDay(page, 2).first().click();
  await page.waitForTimeout(500);
}

test.describe('ADMINPORTAL-106549 — Verify Edit Employment Date', () => {
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
    // ASSERT (BLOCKING) Personal Details panel visible with First Name "Fred"
    await expect(page.getByText('Personal Details', { exact: true }).first()).toBeVisible();
    await expect(page.getByText('Fred', { exact: false }).first()).toBeVisible();
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
    await expect(dateInputsAt(page, index).nth(0)).toHaveValue(NEW_START_DATE);
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
    await expect(dateInputsAt(page, index).nth(1)).toHaveValue(NEW_END_DATE);
  });

  test('TC-12: Click on Save', async ({ page }) => {
    test.setTimeout(180_000);
    await loginAsKwena(page);
    await openTargetApplication(page);
    const index = await enterWorkExperienceEditMode(page);
    await pickStartDate(page, index);
    await pickEndDate(page, index);
    // STEP: CLICK the row's inline Save icon — REAL, PERSISTENT EDIT,
    // confirmed with the requester
    await saveIconAt(page, index).click();
    await page.waitForTimeout(2000);
    // ASSERT (BLOCKING) after Save + reload, the row shows the updated dates
    await page.reload({ waitUntil: 'domcontentloaded' });
    await page.waitForLoadState('networkidle').catch(() => {});
    await page.waitForTimeout(2000);
    const rows = page.locator('div[role="row"]');
    const count = await rows.count();
    let found = false;
    for (let i = 0; i < count; i++) {
      const text = await rows.nth(i).innerText().catch(() => '');
      if (text.includes(ROW_ANCHOR_TEXT) && text.includes(NEW_START_DATE) && text.includes(NEW_END_DATE)) { found = true; break; }
    }
    expect(found).toBeTruthy();
  });
});
