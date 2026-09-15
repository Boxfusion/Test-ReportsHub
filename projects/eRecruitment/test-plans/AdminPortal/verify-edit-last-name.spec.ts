// AUTO-RECORDED from test-plans/AdminPortal/verify-edit-last-name.md
// Source: Azure DevOps project pd-recruitment, test case #106529 "Verify
// Edit Last Name" (work item rev 2). The .md plan is canonical. AI-repair
// will patch failing lines in this file. Do not hand-edit unless you are
// also updating the .md plan.
//
// Recruiter role (Kwenas / "Kwena Semono"), Recruitment > Job Posting
// Dashboard section (distinct from the Workflows/Inbox section used by
// the Authoriser/Advertiser specs in this project). Targets Job Posting
// Ref No 40's application for candidate Fred "Everything" — originally
// listed as "Everything F" in the Applications table's Surname/Initials
// column. Confirmed live 2026-08-05: the application opens with status
// badge "AWAITING PRE-SCREENING", not "pre-screened" as ADO's step 7
// claims. ADO steps 9-10 have a copy/paste error (step 10 literally says
// "Clear the first name" but the test title and step 11 make clear the
// intent is the Last Name field) — this spec follows the evident intent.
// TC-11 clicks Save for real, renaming the candidate's Last Name to
// NEW_LAST_NAME — confirmed with the requester before running. All
// earlier TCs never click Save. NOTE: after the first real run, the
// Applications table now lists this candidate as "<NEW_LAST_NAME> F"
// instead of "Everything F" — CANDIDATE_ROW_TEXT tracks whatever the
// current Surname/Initials value actually is so reruns keep finding the
// same row even though the underlying data has changed.

import { test, expect, Page } from '@playwright/test';

const APP_URL = 'https://pd-recruitment-adminportal-qa.shesha.app/';
const RECRUITER = { user: 'Kwenas', password: '123qwe' };
const TARGET_REF_NO = '40';
const NEW_LAST_NAME = 'Edit Last Name';
// Surname/Initials text as it currently appears in the Applications table —
// update this if a prior real run already renamed the candidate.
const CANDIDATE_ROW_TEXT = `${NEW_LAST_NAME} F`;

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

function lastNameInput(page: Page) {
  return page.locator('label', { hasText: 'Last Name' }).locator('xpath=../..').locator('input').first();
}

function saveButton(page: Page) {
  // The "Save" control here renders as a <button> with a leading icon whose
  // aria-label can throw off getByRole's exact accessible-name match, so
  // match on visible text content instead (see #106529 TC-07 first attempt).
  return page.locator('button', { hasText: 'Save' }).first();
}

test.describe('ADMINPORTAL-106529 — Verify Edit Last Name', () => {
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

  test('TC-06: Open the Application for the target candidate', async ({ page }) => {
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
    // ASSERT (BLOCKING) Last Name field is now an editable input, Save button visible
    await expect(lastNameInput(page)).toBeVisible();
    await expect(saveButton(page)).toBeVisible();
  });

  test('TC-08: Click inside the Last Name field', async ({ page }) => {
    await loginAsKwena(page);
    await openTargetApplication(page);
    await clickEditPersonalDetails(page);
    const input = lastNameInput(page);
    await input.click();
    // ASSERT (BLOCKING) Last Name field is focused and editable
    await expect(input).toBeFocused();
  });

  test('TC-09: Clear the Last Name field', async ({ page }) => {
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
    await loginAsKwena(page);
    await openTargetApplication(page);
    await clickEditPersonalDetails(page);
    const input = lastNameInput(page);
    await input.click();
    await input.fill('');
    await input.fill(NEW_LAST_NAME);
    // STEP: CLICK Save — REAL, PERSISTENT EDIT, confirmed with requester
    await saveButton(page).click();
    await page.waitForTimeout(2000);
    // ASSERT (BLOCKING) after Save + reload, Last Name shows the updated value
    await page.reload({ waitUntil: 'domcontentloaded' });
    await page.waitForLoadState('networkidle').catch(() => {});
    await page.waitForTimeout(2000);
    await expect(page.getByText(NEW_LAST_NAME, { exact: false }).first()).toBeVisible({ timeout: 15_000 });
  });
});
