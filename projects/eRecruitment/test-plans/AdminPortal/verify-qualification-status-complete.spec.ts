// AUTO-RECORDED from test-plans/AdminPortal/verify-qualification-status-complete.md
// Source: Azure DevOps project pd-recruitment, test case #106544 "Verify
// qualification status (complete)" (work item rev 3). The .md plan is
// canonical. AI-repair will patch failing lines in this file. Do not
// hand-edit unless you are also updating the .md plan.
//
// Recruiter role (Kwenas / "Kwena Semono"), Recruitment > Job Posting
// Dashboard section. Targets Job Posting Ref No 40's application
// (currently listed as "Edit Last Name F"), Education panel's Secondary
// Qualifications row (Qualification Name "Edited Qualification Name").
//
// TC-09 is INTENTIONALLY expected to fail: confirmed live 2026-08-05 (and
// re-confirmed via a manual step-by-step walkthrough) that no
// "Qualification Status" dropdown exists anywhere in the Education panel
// — see test-reports/bugs/2026-08-05-qualification-status-field-does-not-exist.md.
// This spec still attempts the click exactly as ADO describes so the
// failure is captured automatically (and so the test will start passing
// on its own if the field is ever implemented, signalling this should be
// revisited). TC-10 through TC-13 never run as a result (serial mode
// stops after the first failure). This test never reaches a Save action.

import { test, expect, Page } from '@playwright/test';

const APP_URL = 'https://pd-recruitment-adminportal-qa.shesha.app/';
const RECRUITER = { user: 'Kwenas', password: '123qwe' };
const TARGET_REF_NO = '40';
// Surname/Initials text as it currently appears in the Applications table —
// update this if a prior real run already renamed the candidate further.
const CANDIDATE_ROW_TEXT = 'Edit Last Name F';
const ROW_ANCHOR_TEXT = 'Edited Qualification Name';

async function loginAsKwena(page: Page) {
  await page.goto(`${APP_URL}login`, { waitUntil: 'domcontentloaded' });
  // Bumped from 20s to 45s — 3 consecutive attempts stalled on the app's
  // "Initializing..." client bootstrap splash within 20s (see this test
  // case's 2nd-4th attempts), longer than the usual quick transient flake
  // seen elsewhere in this project.
  await page.waitForSelector('input[placeholder="Username"]', { timeout: 45000 });
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

// Resolves the Secondary Qualifications row's position among ALL
// div[role="row"] elements on the page while it still has plain text
// content, so the same index can be reused after the row switches to
// inline-input edit mode (hasText filters stop matching input VALUES —
// see ADMINPORTAL-106540/106541/106542 for the same fix).
async function findTargetRowIndex(page: Page): Promise<number> {
  // Avoid scrollIntoViewIfNeeded() — the page above the Education panel
  // keeps shifting height while it loads, which repeatedly fails
  // scrollIntoViewIfNeeded's "element is stable" check (see
  // ADMINPORTAL-106542's first two attempts). Use a plain wheel scroll
  // instead (same pattern as openTargetApplication) to bring the
  // Education panel into view, since this row's content was observed to
  // not reliably render/become visible without scrolling first (see this
  // test case's first two attempts).
  await page.waitForLoadState('networkidle').catch(() => {});
  await page.mouse.wheel(0, 1500);
  await page.waitForTimeout(500);
  // Bumped from 30s to 60s — the environment has been running slow across
  // this whole test case's attempts today (also saw a 3x login stall
  // needing a longer timeout); this is a real slowness workaround, not a
  // selector fix.
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
  // Does not exist — see the bug report. Scoped the same way the other
  // row-level dropdowns are (label -> parent -> .ant-select) so that if
  // this field is ever implemented, the locator starts working unchanged.
  return page.locator('div[role="row"]').nth(index)
    .locator('label', { hasText: 'Qualification Status' })
    .locator('xpath=../..')
    .locator('.ant-select')
    .first();
}

test.describe('ADMINPORTAL-106544 — Verify qualification status (complete)', () => {
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

  test('TC-06: Open the target application', async ({ page }) => {
    test.setTimeout(180_000);
    await loginAsKwena(page);
    await openTargetApplication(page);
    // ASSERT (BLOCKING) Personal Details panel visible with First Name "Fred"
    await expect(page.getByText('Personal Details', { exact: true }).first()).toBeVisible();
    await expect(page.getByText('Fred', { exact: false }).first()).toBeVisible();
  });

  test('TC-07: Navigate to Education panel and click the Edit icon', async ({ page }) => {
    test.setTimeout(180_000);
    await loginAsKwena(page);
    await openTargetApplication(page);
    const index = await enterEducationEditMode(page);
    // ASSERT (BLOCKING) the row's known fields open in edit mode
    await expect(page.locator('div[role="row"]').nth(index).locator('input').first()).toBeVisible();
  });

  test('TC-08: Confirm row is in edit mode before locating Qualification Status', async ({ page }) => {
    test.setTimeout(180_000);
    await loginAsKwena(page);
    await openTargetApplication(page);
    const index = await enterEducationEditMode(page);
    // ASSERT (BLOCKING) row edit controls are present (Institution/Qualification Name/Qualification Type)
    await expect(page.locator('div[role="row"]').nth(index).locator('.ant-select').first()).toBeVisible();
  });

  test('TC-09: Click on the Qualification Status dropdown', async ({ page }) => {
    test.setTimeout(180_000);
    await loginAsKwena(page);
    await openTargetApplication(page);
    const index = await enterEducationEditMode(page);
    // STEP: CLICK the Qualification Status dropdown, per ADO step 9.
    // EXPECTED TO FAIL — no such field exists in the Education panel
    // (confirmed live 2026-08-05; see the linked bug report). This
    // assertion is written to match ADO's expected behavior, not the
    // known-broken actual behavior, so the failure is captured here
    // rather than masked.
    await expect(qualificationStatusSelectAt(page, index)).toBeVisible({ timeout: 10_000 });
    await qualificationStatusSelectAt(page, index).click();
    // ASSERT (BLOCKING) options list is displayed
    await expect(page.getByText('Complete', { exact: true }).first()).toBeVisible();
  });

  test('TC-10: Select "Complete" option', async ({ page }) => {
    test.setTimeout(180_000);
    await loginAsKwena(page);
    await openTargetApplication(page);
    const index = await enterEducationEditMode(page);
    await expect(qualificationStatusSelectAt(page, index)).toBeVisible({ timeout: 10_000 });
    await qualificationStatusSelectAt(page, index).click();
    await page.getByText('Complete', { exact: true }).first().click();
    // ASSERT (BLOCKING) "Complete" is now displayed in the field
    await expect(qualificationStatusSelectAt(page, index)).toContainText('Complete');
  });

  test('TC-11: Click inside the datepicker field', async ({ page }) => {
    test.setTimeout(180_000);
    await loginAsKwena(page);
    await openTargetApplication(page);
    const index = await enterEducationEditMode(page);
    await expect(qualificationStatusSelectAt(page, index)).toBeVisible({ timeout: 10_000 });
    await qualificationStatusSelectAt(page, index).click();
    await page.getByText('Complete', { exact: true }).first().click();
    const datePicker = page.locator('div[role="row"]').nth(index).locator('input[placeholder="Select date"]').first();
    await datePicker.click();
    // ASSERT (BLOCKING) a calendar is displayed
    await expect(page.locator('.ant-picker-dropdown:visible').first()).toBeVisible();
  });

  test('TC-12: Select a previous date', async ({ page }) => {
    test.setTimeout(180_000);
    await loginAsKwena(page);
    await openTargetApplication(page);
    const index = await enterEducationEditMode(page);
    await expect(qualificationStatusSelectAt(page, index)).toBeVisible({ timeout: 10_000 });
    await qualificationStatusSelectAt(page, index).click();
    await page.getByText('Complete', { exact: true }).first().click();
    const datePicker = page.locator('div[role="row"]').nth(index).locator('input[placeholder="Select date"]').first();
    await datePicker.click();
    await page.locator('.ant-picker-cell-in-view', { hasText: '1' }).first().click();
    // ASSERT (BLOCKING) selected date is displayed in the field
    await expect(datePicker).not.toHaveValue('');
  });

  test('TC-13: Click on Save', async ({ page }) => {
    test.setTimeout(180_000);
    await loginAsKwena(page);
    await openTargetApplication(page);
    const index = await enterEducationEditMode(page);
    await expect(qualificationStatusSelectAt(page, index)).toBeVisible({ timeout: 10_000 });
    await qualificationStatusSelectAt(page, index).click();
    await page.getByText('Complete', { exact: true }).first().click();
    const datePicker = page.locator('div[role="row"]').nth(index).locator('input[placeholder="Select date"]').first();
    await datePicker.click();
    await page.locator('.ant-picker-cell-in-view', { hasText: '1' }).first().click();
    // STEP: CLICK the row's inline Save icon — REAL, PERSISTENT EDIT if reached
    await page.locator('div[role="row"]').nth(index).locator('.anticon-save').first().click();
    await page.waitForTimeout(2000);
    await page.reload({ waitUntil: 'domcontentloaded' });
    await page.waitForLoadState('networkidle').catch(() => {});
    await page.waitForTimeout(2000);
    // ASSERT (BLOCKING) after Save + reload, the row shows "Complete"
    await expect(page.getByText('Complete', { exact: false }).first()).toBeVisible({ timeout: 15_000 });
  });
});
