// AUTO-RECORDED from test-plans/AdminPortal/verify-edit-first-name.md
// Source: Azure DevOps project pd-recruitment, test case #106240 "Edit
// First Name" (work item rev 8). The .md plan is canonical. AI-repair
// will patch failing lines in this file. Do not hand-edit unless you are
// also updating the .md plan.
//
// Recruiter role (Kwenas / "Kwena Semono"), Recruitment > Job Posting
// Dashboard section. Targets Job Posting Ref No 40's application created
// while automating ADMINPORTAL-106172 — currently listed as "CompleteFlow
// A" in the Applications table's Surname/Initials column (First Name
// "AutoTest", Last Name "CompleteFlow", Status "Pre Screened"). ADO step 7
// explicitly says to open "an Application created on Test Case 106172" —
// this is the correct, intended candidate, not one of the stray/orphaned
// records documented in
// test-reports/bugs/2026-08-05-add-application-no-delete-or-resume-capability.md.
//
// TC-11 clicks Save for real, changing First Name from "AutoTest" to
// "Test" — confirmed with the requester before running. All earlier TCs
// never click Save.

import { test, expect, Page } from '@playwright/test';

const APP_URL = 'https://pd-recruitment-adminportal-qa.shesha.app/';
const RECRUITER = { user: 'Kwenas', password: '123qwe' };
const TARGET_REF_NO = '40';
const NEW_FIRST_NAME = 'Test';
// Surname/Initials text as it currently appears in the Applications table —
// update this if a prior real run already renamed the candidate further.
const CANDIDATE_ROW_TEXT = 'CompleteFlow A';

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

function firstNameInput(page: Page) {
  return page.locator('label', { hasText: 'First Name' }).locator('xpath=../..').locator('input').first();
}

function saveButton(page: Page) {
  // Match on visible text content, not accessible name — see
  // ADMINPORTAL-106529 TC-07 for why getByRole's exact match is unreliable
  // here (a leading icon throws off the accessible name).
  return page.locator('button', { hasText: 'Save' }).first();
}

test.describe('ADMINPORTAL-106240 — Edit First Name', () => {
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
    // Confirmed live: the badge on the application page reads "PRE-SCREENED"
    // (all caps, hyphenated) — the Applications table row shows "Pre
    // Screened" instead, but this assertion targets the page itself.
    await expect(page.getByText('PRE-SCREENED', { exact: false }).first()).toBeVisible();
  });

  test('TC-07: Click Edit Personal Details', async ({ page }) => {
    test.setTimeout(180_000);
    await loginAsKwena(page);
    await openTargetApplication(page);
    await clickEditPersonalDetails(page);
    // ASSERT (BLOCKING) First Name field is now an editable input, Save button visible
    await expect(firstNameInput(page)).toBeVisible();
    await expect(saveButton(page)).toBeVisible();
  });

  test('TC-08: Click inside the First Name field', async ({ page }) => {
    test.setTimeout(180_000);
    await loginAsKwena(page);
    await openTargetApplication(page);
    await clickEditPersonalDetails(page);
    const input = firstNameInput(page);
    await input.click();
    // ASSERT (BLOCKING) First Name field is focused
    await expect(input).toBeFocused();
  });

  test('TC-09: Clear the First Name field', async ({ page }) => {
    test.setTimeout(180_000);
    await loginAsKwena(page);
    await openTargetApplication(page);
    await clickEditPersonalDetails(page);
    const input = firstNameInput(page);
    await input.click();
    await input.fill('');
    // ASSERT (BLOCKING) First Name field is empty
    await expect(input).toHaveValue('');
  });

  test('TC-10: Enter "Test"', async ({ page }) => {
    test.setTimeout(180_000);
    await loginAsKwena(page);
    await openTargetApplication(page);
    await clickEditPersonalDetails(page);
    const input = firstNameInput(page);
    await input.click();
    await input.fill('');
    await input.fill(NEW_FIRST_NAME);
    // ASSERT (BLOCKING) First Name field contains the typed value
    await expect(input).toHaveValue(NEW_FIRST_NAME);
  });

  test('TC-11: Click on Save', async ({ page }) => {
    test.setTimeout(180_000);
    await loginAsKwena(page);
    await openTargetApplication(page);
    await clickEditPersonalDetails(page);
    const input = firstNameInput(page);
    await input.click();
    await input.fill('');
    await input.fill(NEW_FIRST_NAME);
    // STEP: CLICK Save — REAL, PERSISTENT EDIT, confirmed with requester
    await saveButton(page).click();
    await page.waitForTimeout(2000);
    // ASSERT (BLOCKING) after Save + reload, First Name shows the updated value.
    // IMPORTANT: use EXACT text match here, not { exact: false } — a
    // substring match on "Test" also matches the untouched original value
    // "AutoTest", which produced a false PASS in the first run of this
    // spec (confirmed live 2026-08-05: Save silently does not persist for
    // this application — see
    // test-reports/bugs/2026-08-05-edit-personal-details-save-silently-fails.md).
    await page.reload({ waitUntil: 'domcontentloaded' });
    await page.waitForLoadState('networkidle').catch(() => {});
    await page.waitForTimeout(2000);
    await expect(page.getByText(NEW_FIRST_NAME, { exact: true }).first()).toBeVisible({ timeout: 15_000 });
  });
});
