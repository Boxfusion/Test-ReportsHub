// AUTO-RECORDED from test-plans/AdminPortal/verify-edit-nature-of-disability.md
// Source: Azure DevOps project pd-recruitment, test case #106536 "Verify
// Edit Nature of disability" (work item rev 2). The .md plan is
// canonical. AI-repair will patch failing lines in this file. Do not
// hand-edit unless you are also updating the .md plan.
//
// Recruiter role (Kwenas / "Kwena Semono"), Recruitment > Job Posting
// Dashboard section. Targets Job Posting Ref No 40's application for the
// candidate ADO calls "Everything F" — renamed by ADMINPORTAL-106529's
// real Save, so the Applications table now lists this candidate as
// "Edit Last Name F" (CANDIDATE_ROW_TEXT tracks whatever the current
// Surname/Initials value actually is). Confirmed live 2026-08-05:
// application opens as "AWAITING PRE-SCREENING", not "pre-screened" per
// ADO. IMPORTANT: the "Nature Of Disability" field is conditionally
// hidden and only renders once "Has Disability" is set to "Yes" — ADO's
// steps never mention this prerequisite, so this spec adds it (TC-09).
// TC-12 clicks Save for real, permanently changing BOTH Has Disability
// (No -> Yes) and Nature Of Disability text — confirmed with the
// requester before running. All earlier TCs never click Save.

import { test, expect, Page } from '@playwright/test';

const APP_URL = 'https://pd-recruitment-adminportal-qa.shesha.app/';
const RECRUITER = { user: 'Kwenas', password: '123qwe' };
const TARGET_REF_NO = '40';
// Surname/Initials text as it currently appears in the Applications table —
// update this if a prior real run already renamed the candidate further.
const CANDIDATE_ROW_TEXT = 'Edit Last Name F';
const NEW_DISABILITY_TEXT = 'Edit Disability';

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

async function clickEditPersonalDetails(page: Page) {
  await page.getByText('Edit Personal Details', { exact: false }).first().click();
  await page.waitForTimeout(1000);
}

function hasDisabilityYesRadio(page: Page) {
  return page.locator('label', { hasText: 'Has Disability' }).locator('xpath=../..').getByText('Yes', { exact: true });
}

function natureOfDisabilityInput(page: Page) {
  return page.locator('label', { hasText: 'Nature Of Disability' }).locator('xpath=../..').locator('input, textarea').first();
}

function saveButton(page: Page) {
  // Matches on visible text content rather than getByRole's accessible-name
  // computation — see ADMINPORTAL-106529 TC-07 for why exact role matching
  // was unreliable for this icon+text button.
  return page.locator('button', { hasText: 'Save' }).first();
}

async function revealNatureOfDisabilityField(page: Page) {
  await hasDisabilityYesRadio(page).click();
  await page.waitForTimeout(600);
}

test.describe('ADMINPORTAL-106536 — Verify Edit Nature of disability', () => {
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
    // ASSERT (BLOCKING) Personal Details fields are in edit mode
    await expect(saveButton(page)).toBeVisible();
  });

  test('TC-08: Confirm Nature Of Disability is not present while Has Disability is No', async ({ page }) => {
    await loginAsKwena(page);
    await openTargetApplication(page);
    await clickEditPersonalDetails(page);
    // ASSERT (BLOCKING) the Nature Of Disability field is not visible
    // (the label exists in the DOM but is hidden, not absent — toHaveCount(0)
    // is the wrong check here; use not.toBeVisible() instead)
    await expect(page.getByText('Nature Of Disability', { exact: false }).first()).not.toBeVisible();
  });

  test('TC-09: Select "Yes" for Has Disability', async ({ page }) => {
    await loginAsKwena(page);
    await openTargetApplication(page);
    await clickEditPersonalDetails(page);
    await revealNatureOfDisabilityField(page);
    // ASSERT (BLOCKING) Nature Of Disability field becomes visible, pre-filled
    await expect(natureOfDisabilityInput(page)).toBeVisible();
    await expect(natureOfDisabilityInput(page)).toHaveValue(/.+/);
  });

  test('TC-10: Clear the Nature Of Disability text area', async ({ page }) => {
    await loginAsKwena(page);
    await openTargetApplication(page);
    await clickEditPersonalDetails(page);
    await revealNatureOfDisabilityField(page);
    const input = natureOfDisabilityInput(page);
    await input.click();
    await input.fill('');
    // ASSERT (BLOCKING) the field becomes cleared successfully
    await expect(input).toHaveValue('');
  });

  test('TC-11: Enter "Edit Disability"', async ({ page }) => {
    await loginAsKwena(page);
    await openTargetApplication(page);
    await clickEditPersonalDetails(page);
    await revealNatureOfDisabilityField(page);
    const input = natureOfDisabilityInput(page);
    await input.click();
    await input.fill('');
    await input.fill(NEW_DISABILITY_TEXT);
    // ASSERT (BLOCKING) the field contains the typed value
    await expect(input).toHaveValue(NEW_DISABILITY_TEXT);
  });

  test('TC-12: Click on Save', async ({ page }) => {
    await loginAsKwena(page);
    await openTargetApplication(page);
    await clickEditPersonalDetails(page);
    await revealNatureOfDisabilityField(page);
    const input = natureOfDisabilityInput(page);
    await input.click();
    await input.fill('');
    await input.fill(NEW_DISABILITY_TEXT);
    // STEP: CLICK Save — REAL, PERSISTENT EDIT (changes Has Disability AND
    // Nature Of Disability), confirmed with requester
    await saveButton(page).click();
    await page.waitForTimeout(2000);
    // ASSERT (BLOCKING) after Save + reload, both fields show the updated values
    await page.reload({ waitUntil: 'domcontentloaded' });
    await page.waitForLoadState('networkidle').catch(() => {});
    await page.waitForTimeout(2000);
    await expect(page.getByText(NEW_DISABILITY_TEXT, { exact: false }).first()).toBeVisible({ timeout: 15_000 });
  });
});
