// AUTO-RECORDED from test-plans/AdminPortal/verify-edit-gender.md
// Source: Azure DevOps project pd-recruitment, test case #106533 "Verify
// Edit Gender" (work item rev 2). The .md plan is canonical. AI-repair
// will patch failing lines in this file. Do not hand-edit unless you are
// also updating the .md plan.
//
// Recruiter role (Kwenas / "Kwena Semono"), Recruitment > Job Posting
// Dashboard section. Targets Job Posting Ref No 40's application for the
// candidate ADO calls "Everything F" — renamed by ADMINPORTAL-106529's
// real Save, so the Applications table now lists this candidate as
// "Edit Last Name F" (CANDIDATE_ROW_TEXT tracks whatever the current
// Surname/Initials value actually is). Confirmed live 2026-08-05:
// application opens as "AWAITING PRE-SCREENING", not "pre-screened" per
// ADO; the Gender dropdown's option list (with "Male" selected) shows
// "Female" and "Not Disclosed". TC-10 clicks Save for real, permanently
// changing the candidate's Gender — confirmed with the requester before
// running. All earlier TCs never click Save.

import { test, expect, Page } from '@playwright/test';

const APP_URL = 'https://pd-recruitment-adminportal-qa.shesha.app/';
const RECRUITER = { user: 'Kwenas', password: '123qwe' };
const TARGET_REF_NO = '40';
// Surname/Initials text as it currently appears in the Applications table —
// update this if a prior real run already renamed the candidate further.
const CANDIDATE_ROW_TEXT = 'Edit Last Name F';
const NEW_GENDER = 'Not Disclosed';

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

function genderSelect(page: Page) {
  return page.locator('label', { hasText: 'Gender' }).locator('xpath=../..').locator('.ant-select').first();
}

function saveButton(page: Page) {
  // Matches on visible text content rather than getByRole's accessible-name
  // computation — see ADMINPORTAL-106529 TC-07 for why exact role matching
  // was unreliable for this icon+text button.
  return page.locator('button', { hasText: 'Save' }).first();
}

async function selectNotDisclosedGender(page: Page) {
  await genderSelect(page).click();
  await page.waitForTimeout(500);
  await page.getByText(NEW_GENDER, { exact: true }).first().click();
  await page.waitForTimeout(500);
}

test.describe('ADMINPORTAL-106533 — Verify Edit Gender', () => {
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

  test('TC-06: Open the target candidate\'s Application', async ({ page }) => {
    await loginAsKwena(page);
    await openTargetApplication(page);
    // ASSERT (BLOCKING) Personal Details panel visible with First Name "Fred"
    await expect(page.getByText('Personal Details', { exact: true }).first()).toBeVisible();
    await expect(page.getByText('Fred', { exact: false }).first()).toBeVisible();
  });

  test('TC-07: Click Edit Personal Details', async ({ page }) => {
    await loginAsKwena(page);
    await openTargetApplication(page);
    await clickEditPersonalDetails(page);
    // ASSERT (BLOCKING) Gender dropdown is now editable, Save button visible
    await expect(genderSelect(page)).toBeVisible();
    await expect(saveButton(page)).toBeVisible();
  });

  test('TC-08: Click on the gender dropdown', async ({ page }) => {
    await loginAsKwena(page);
    await openTargetApplication(page);
    await clickEditPersonalDetails(page);
    await genderSelect(page).click();
    await page.waitForTimeout(500);
    // ASSERT (BLOCKING) available gender options are displayed
    await expect(page.getByText('Female', { exact: true }).first()).toBeVisible();
    await expect(page.getByText(NEW_GENDER, { exact: true }).first()).toBeVisible();
  });

  test('TC-09: Select "Not Disclosed"', async ({ page }) => {
    await loginAsKwena(page);
    await openTargetApplication(page);
    await clickEditPersonalDetails(page);
    await selectNotDisclosedGender(page);
    // ASSERT (BLOCKING) Gender dropdown now shows "Not Disclosed"
    await expect(genderSelect(page)).toContainText(NEW_GENDER);
  });

  test('TC-10: Click on Save', async ({ page }) => {
    await loginAsKwena(page);
    await openTargetApplication(page);
    await clickEditPersonalDetails(page);
    await selectNotDisclosedGender(page);
    // STEP: CLICK Save — REAL, PERSISTENT EDIT, confirmed with requester
    await saveButton(page).click();
    await page.waitForTimeout(2000);
    // ASSERT (BLOCKING) after Save + reload, Gender shows the updated value
    await page.reload({ waitUntil: 'domcontentloaded' });
    await page.waitForLoadState('networkidle').catch(() => {});
    await page.waitForTimeout(2000);
    await expect(page.getByText(NEW_GENDER, { exact: false }).first()).toBeVisible({ timeout: 15_000 });

    // ASSERT (BLOCKING) the new Gender also appears in the Applications index table (Gender column)
    await openTargetJobPosting(page);
    await page.mouse.wheel(0, 1500);
    await page.waitForTimeout(800);
    await expect(page.getByText(NEW_GENDER, { exact: false }).first()).toBeVisible({ timeout: 15_000 });
  });
});
