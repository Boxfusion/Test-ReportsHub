// AUTO-RECORDED from test-plans/AdminPortal/verify-edit-qualification-type-completeflow.md
// Source: Azure DevOps project pd-recruitment, test case #106279 "Verify
// Edit qualification type" (work item rev 2). The .md plan is canonical.
// AI-repair will patch failing lines in this file. Do not hand-edit
// unless you are also updating the .md plan.
//
// Recruiter role (Kwenas / "Kwena Semono"), Recruitment > Job Posting
// Dashboard section. Targets Job Posting Ref No 40's application created
// on ADMINPORTAL-106172 — currently listed as "Edit Last Name A", then
// the Education panel's row for Institution "Test University".
//
// NOTE: this row's Qualification Type dropdown has a different,
// tertiary-oriented option set than the equivalent field on a normal
// (non-wizard-created) candidate's Secondary Qualifications row
// (ADMINPORTAL-106542, which lists Grade 9-12 school options) —
// confirmed live during ADMINPORTAL-106172's wizard investigation:
// "National Diploma Grade12And Other", "Bachelor's degree, Advanced
// Diplomas...", "Honours degree...", "Master's degree", "Doctor's
// degree", "National Diploma", "Bachelors Degree", "Advanced Diploma",
// "Post Graduate Certificate", "B-Tech".
//
// scrollIntoViewIfNeeded() is unstable here (content above still
// loading) — use waitFor('visible') instead (see ADMINPORTAL-106276/106542).
//
// Selector note: once a row is switched into inline edit mode, its cell
// text becomes input VALUES, which Playwright's hasText filter does not
// see as text content — resolve the row's index once while it still has
// plain text and reuse that positional nth() index for the rest of the
// test (same fix as ADMINPORTAL-106540/106541/106542/106547/106276/106278).
//
// TC-10 clicks the row's inline Save icon for real, changing Qualification
// Type to a real replacement value, so the Save is expected to succeed
// and persist — confirmed with the requester before running.

import { test, expect, Page } from '@playwright/test';

const APP_URL = 'https://pd-recruitment-adminportal-qa.shesha.app/';
const RECRUITER = { user: 'Kwenas', password: '123qwe' };
const TARGET_REF_NO = '40';
// Surname/Initials text as it currently appears in the Applications table —
// update this if a prior real run already renamed the candidate further.
const CANDIDATE_ROW_TEXT = 'Edit Last Name A';
// Row anchor: Institution, stable throughout this edit.
const ROW_ANCHOR_TEXT = 'Test University';
const NEW_QUALIFICATION_TYPE = 'Bachelors Degree';

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

// Resolves the Education row's position among ALL div[role="row"]
// elements on the page while it still has plain text content, so the
// same index can be reused after the row switches to inline-input edit
// mode (see header comment).
async function findTargetRowIndex(page: Page): Promise<number> {
  // scrollIntoViewIfNeeded() is unstable here — the Personal Details
  // selects above can still be loading, causing "element is not attached
  // to the DOM"/"element is stable" failures as the page re-renders
  // mid-scroll (see ADMINPORTAL-106276/106542). Use a plain wheel scroll.
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

function qualificationTypeSelectAt(page: Page, index: number) {
  // Qualification Type is the first ant-select combobox in this row.
  return page.locator('div[role="row"]').nth(index).locator('.ant-select').first();
}

function saveIconAt(page: Page, index: number) {
  // `.anticon-save` is the specific, unambiguous class for the row's
  // inline save action — confirmed live (ADMINPORTAL-106540).
  return page.locator('div[role="row"]').nth(index).locator('.anticon-save').first();
}

async function selectNewQualificationType(page: Page, index: number) {
  await qualificationTypeSelectAt(page, index).click();
  await page.waitForTimeout(500);
  await page.getByText(NEW_QUALIFICATION_TYPE, { exact: true }).first().click();
  await page.waitForTimeout(500);
}

test.describe('ADMINPORTAL-106279 — Verify Edit qualification type', () => {
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
    // ASSERT (BLOCKING) Qualification Type dropdown is now editable
    await expect(qualificationTypeSelectAt(page, index)).toBeVisible();
  });

  test('TC-08: Click on the Qualification Type dropdown', async ({ page }) => {
    test.setTimeout(180_000);
    await loginAsKwena(page);
    await openTargetApplication(page);
    const index = await enterEducationEditMode(page);
    await qualificationTypeSelectAt(page, index).click();
    await page.waitForTimeout(500);
    // ASSERT (BLOCKING) available Qualification Type options are displayed
    await expect(page.getByText(NEW_QUALIFICATION_TYPE, { exact: true }).first()).toBeVisible();
  });

  test('TC-09: Select "Bachelors Degree"', async ({ page }) => {
    test.setTimeout(180_000);
    await loginAsKwena(page);
    await openTargetApplication(page);
    const index = await enterEducationEditMode(page);
    await selectNewQualificationType(page, index);
    // ASSERT (BLOCKING) Qualification Type dropdown now shows the new value
    await expect(qualificationTypeSelectAt(page, index)).toContainText(NEW_QUALIFICATION_TYPE);
  });

  test('TC-10: Click on Save', async ({ page }) => {
    test.setTimeout(180_000);
    await loginAsKwena(page);
    await openTargetApplication(page);
    const index = await enterEducationEditMode(page);
    await selectNewQualificationType(page, index);
    // STEP: CLICK the row's inline Save icon — REAL, PERSISTENT EDIT,
    // confirmed with requester
    await saveIconAt(page, index).click();
    await page.waitForTimeout(2000);
    // ASSERT (BLOCKING) after Save + reload, the row shows the updated value
    await page.reload({ waitUntil: 'domcontentloaded' });
    await page.waitForLoadState('networkidle').catch(() => {});
    await page.waitForTimeout(2000);
    await expect(page.getByText(NEW_QUALIFICATION_TYPE, { exact: false }).first()).toBeVisible({ timeout: 15_000 });
  });
});
