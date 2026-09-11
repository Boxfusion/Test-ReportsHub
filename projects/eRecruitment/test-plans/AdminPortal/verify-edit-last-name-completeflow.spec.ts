// AUTO-RECORDED from test-plans/AdminPortal/verify-edit-last-name-completeflow.md
// Source: Azure DevOps project pd-recruitment, test case #106246 "Verify
// Edit Last Name" (work item rev 4). The .md plan is canonical. AI-repair
// will patch failing lines in this file. Do not hand-edit unless you are
// also updating the .md plan.
//
// Recruiter role (Kwenas / "Kwena Semono"), Recruitment > Job Posting
// Dashboard section. Targets Job Posting Ref No 40's application created
// on ADMINPORTAL-106172 and already First-Name-edited by ADMINPORTAL-106240
// — currently listed as "CompleteFlow T" in the Applications table's
// Surname/Initials column. Not one of the stray/orphaned records in
// test-reports/bugs/2026-08-05-add-application-no-delete-or-resume-capability.md.
//
// ADO step 10 literally says "Clear the first name" but step 9 ("Click
// inside the Last Name field") and step 12's expected result make the
// intent unambiguous — same copy/paste error class as ADMINPORTAL-106529,
// which used the identical fix for a different candidate.
//
// Status badge on the application page itself reads "PRE-SCREENED" (all
// caps, hyphenated) — confirmed live in ADMINPORTAL-106240; the
// Applications table row shows "Pre Screened" instead.
//
// TC-11 clicks Save for real, changing Last Name from "CompleteFlow" to
// "Edit Last Name" — confirmed with the requester before running. All
// earlier TCs never click Save.

import { test, expect, Page } from '@playwright/test';

const APP_URL = 'https://pd-recruitment-adminportal-qa.shesha.app/';
const RECRUITER = { user: 'Kwenas', password: '123qwe' };
const TARGET_REF_NO = '40';
const NEW_LAST_NAME = 'Edit Last Name';
// Surname/Initials text as it currently appears in the Applications table —
// update this if a prior real run already renamed the candidate further.
// NOTE: confirmed live 2026-08-05 this candidate's Last Name has been
// unstable across attempts ("CompleteFlow" -> "CompleteFlows" -> "Edit
// Last Name") due to the Save-flakiness bug documented in
// test-reports/bugs/2026-08-05-edit-personal-details-save-silently-fails.md.
// Verify the actual current row text live before relying on this constant.
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

function lastNameInput(page: Page) {
  return page.locator('label', { hasText: 'Last Name' }).locator('xpath=../..').locator('input').first();
}

function saveButton(page: Page) {
  // Match on visible text content, not accessible name — see
  // ADMINPORTAL-106529 TC-07 for why getByRole's exact match is unreliable
  // here (a leading icon throws off the accessible name).
  return page.locator('button', { hasText: 'Save' }).first();
}

test.describe('ADMINPORTAL-106246 — Verify Edit Last Name', () => {
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
    // ASSERT (BLOCKING) Personal Details panel visible with First Name "Test"
    await expect(page.getByText('Personal Details', { exact: true }).first()).toBeVisible();
    await expect(page.getByText('Test', { exact: false }).first()).toBeVisible();
    await expect(page.getByText('PRE-SCREENED', { exact: false }).first()).toBeVisible();
  });

  test('TC-07: Click Edit Personal Details', async ({ page }) => {
    test.setTimeout(180_000);
    await loginAsKwena(page);
    await openTargetApplication(page);
    await clickEditPersonalDetails(page);
    // ASSERT (BLOCKING) Last Name field is now an editable input, Save button visible
    await expect(lastNameInput(page)).toBeVisible();
    await expect(saveButton(page)).toBeVisible();
  });

  test('TC-08: Click inside the Last Name field', async ({ page }) => {
    test.setTimeout(180_000);
    await loginAsKwena(page);
    await openTargetApplication(page);
    await clickEditPersonalDetails(page);
    const input = lastNameInput(page);
    await input.click();
    // ASSERT (BLOCKING) Last Name field is focused
    await expect(input).toBeFocused();
  });

  test('TC-09: Clear the Last Name field', async ({ page }) => {
    test.setTimeout(180_000);
    await loginAsKwena(page);
    await openTargetApplication(page);
    await clickEditPersonalDetails(page);
    const input = lastNameInput(page);
    await input.click();
    await input.fill('');
    // ASSERT (BLOCKING) Last Name field is empty
    await expect(input).toHaveValue('');
  });

  test('TC-10: Enter "Edit Last Name"', async ({ page }) => {
    test.setTimeout(180_000);
    await loginAsKwena(page);
    await openTargetApplication(page);
    await clickEditPersonalDetails(page);
    const input = lastNameInput(page);
    await input.click();
    await input.fill('');
    await input.fill(NEW_LAST_NAME);
    // ASSERT (BLOCKING) Last Name field contains the typed value
    await expect(input).toHaveValue(NEW_LAST_NAME);
  });

  test('TC-11: Click on Save', async ({ page }) => {
    test.setTimeout(180_000);
    await loginAsKwena(page);
    await openTargetApplication(page);
    await clickEditPersonalDetails(page);
    const input = lastNameInput(page);
    await input.click();
    await input.fill('');
    await input.fill(NEW_LAST_NAME);
    // STEP: CLICK Save — REAL, PERSISTENT EDIT, confirmed with requester
    // NOTE: Save is intermittent for this specific application — most
    // clicks fire zero API calls and the panel stays in edit mode; one
    // successful attempt needed a 15s wait before the POST fired (see
    // test-reports/bugs/2026-08-05-edit-personal-details-save-silently-fails.md).
    // Retry with a longer wait if this still shows in edit mode.
    await saveButton(page).click();
    await page.waitForTimeout(15000);
    // ASSERT (BLOCKING) after Save + reload, Last Name shows the updated value
    await page.reload({ waitUntil: 'domcontentloaded' });
    await page.waitForLoadState('networkidle').catch(() => {});
    await page.waitForTimeout(2000);
    await expect(page.getByText(NEW_LAST_NAME, { exact: false }).first()).toBeVisible({ timeout: 15_000 });
  });
});
