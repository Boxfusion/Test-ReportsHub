// AUTO-RECORDED from test-plans/AdminPortal/verify-edit-race-completeflow.md
// Source: Azure DevOps project pd-recruitment, test case #106262 "Verify
// Edit Race" (work item rev 3). The .md plan is canonical. AI-repair will
// patch failing lines in this file. Do not hand-edit unless you are also
// updating the .md plan.
//
// Recruiter role (Kwenas / "Kwena Semono"), Recruitment > Job Posting
// Dashboard section. Targets Job Posting Ref No 40's application created
// on ADMINPORTAL-106172 — currently listed as "Edit Last Name" in the
// Applications table's Surname/Initials column. Not one of the
// stray/orphaned records in
// test-reports/bugs/2026-08-05-add-application-no-delete-or-resume-capability.md.
// Current Race value is "African" (set during the #106172 wizard).
//
// KNOWN APP BUG: Save on this application's "Edit Personal Details" panel
// is intermittent — most clicks fire zero API calls and the panel stays
// in edit mode; it can need up to ~15s and occasionally a second click
// before the save actually goes through (confirmed across
// ADMINPORTAL-106240/106246/106247/106251/106255/106256/106257). This
// spec waits 15s after clicking Save and retries once if still in edit
// mode. See test-reports/bugs/2026-08-05-edit-personal-details-save-silently-fails.md.
//
// TC-10 clicks Save for real, changing Race from "African" to "Indian" —
// confirmed with the requester before running. All earlier TCs never
// click Save.

import { test, expect, Page } from '@playwright/test';

const APP_URL = 'https://pd-recruitment-adminportal-qa.shesha.app/';
const RECRUITER = { user: 'Kwenas', password: '123qwe' };
const TARGET_REF_NO = '40';
const NEW_RACE = 'Indian';
// Surname/Initials text as it currently appears in the Applications table —
// update this if a prior real run already renamed the candidate further.
const CANDIDATE_ROW_TEXT = 'Edit Last Name';

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

async function clickEditPersonalDetails(page: Page) {
  await page.getByText('Edit Personal Details', { exact: false }).first().click();
  await page.waitForTimeout(1000);
}

function raceSelect(page: Page) {
  return page.locator('label', { hasText: 'Race' }).first().locator('xpath=../..').locator('.ant-select').first();
}

function saveButton(page: Page) {
  // Match on visible text content, not accessible name — see
  // ADMINPORTAL-106529 TC-07 for why getByRole's exact match is unreliable
  // here (a leading icon throws off the accessible name).
  return page.locator('button', { hasText: 'Save' }).first();
}

async function selectIndianRace(page: Page) {
  await raceSelect(page).click();
  await page.waitForTimeout(500);
  await page.getByText(NEW_RACE, { exact: true }).first().click();
  await page.waitForTimeout(500);
}

test.describe('ADMINPORTAL-106262 — Verify Edit Race', () => {
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

  test('TC-07: Click Edit Personal Details', async ({ page }) => {
    test.setTimeout(180_000);
    await loginAsKwena(page);
    await openTargetApplication(page);
    await clickEditPersonalDetails(page);
    // ASSERT (BLOCKING) Race dropdown is now editable, Save button visible
    await expect(raceSelect(page)).toBeVisible();
    await expect(saveButton(page)).toBeVisible();
  });

  test('TC-08: Click on the Race dropdown', async ({ page }) => {
    test.setTimeout(180_000);
    await loginAsKwena(page);
    await openTargetApplication(page);
    await clickEditPersonalDetails(page);
    await raceSelect(page).click();
    await page.waitForTimeout(500);
    // ASSERT (BLOCKING) available race options are displayed
    await expect(page.getByText(NEW_RACE, { exact: true }).first()).toBeVisible();
  });

  test('TC-09: Select "Indian"', async ({ page }) => {
    test.setTimeout(180_000);
    await loginAsKwena(page);
    await openTargetApplication(page);
    await clickEditPersonalDetails(page);
    await selectIndianRace(page);
    // ASSERT (BLOCKING) Race dropdown now shows "Indian"
    await expect(raceSelect(page)).toContainText(NEW_RACE);
  });

  test('TC-10: Click on Save', async ({ page }) => {
    test.setTimeout(180_000);
    await loginAsKwena(page);
    await openTargetApplication(page);
    await clickEditPersonalDetails(page);
    await selectIndianRace(page);
    // STEP: CLICK Save — REAL, PERSISTENT EDIT, confirmed with requester.
    // KNOWN BUG: Save is intermittent for this application — wait up to
    // 15s, and retry once if the panel is still in edit mode (see header
    // comment and test-reports/bugs/2026-08-05-edit-personal-details-save-silently-fails.md).
    const saveBtn = saveButton(page);
    await saveBtn.click();
    await page.waitForTimeout(15_000);
    if (await raceSelect(page).isVisible().catch(() => false)) {
      await saveBtn.click();
      await page.waitForTimeout(15_000);
    }
    // ASSERT (BLOCKING) after Save + reload, Race shows the updated value
    await page.reload({ waitUntil: 'domcontentloaded' });
    await page.waitForLoadState('networkidle').catch(() => {});
    await page.waitForTimeout(2000);
    await expect(page.getByText(NEW_RACE, { exact: false }).first()).toBeVisible({ timeout: 15_000 });

    // ASSERT (BLOCKING) the new Race also appears in the Applications index table
    await page.mouse.wheel(0, -3000);
    await page.waitForTimeout(500);
    await openTargetJobPosting(page);
    await page.mouse.wheel(0, 1500);
    await page.waitForTimeout(1000);
    await expect(page.getByText(NEW_RACE, { exact: false }).first()).toBeVisible({ timeout: 15_000 });
  });
});
