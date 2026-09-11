// AUTO-RECORDED from test-plans/AdminPortal/verify-delete-qualification.md
// Source: Azure DevOps project pd-recruitment, test case #106545 "Delete
// Qualification" (work item rev 3). The .md plan is canonical. AI-repair
// will patch failing lines in this file. Do not hand-edit unless you are
// also updating the .md plan.
//
// Recruiter role (Kwenas / "Kwena Semono"), Recruitment > Job Posting
// Dashboard section. Targets Job Posting Ref No 40's application
// (currently listed as "Edit Last Name F"), Education panel's Secondary
// Qualifications row (Qualification Name "Edited Qualification Name") —
// the only qualification row with a Delete icon; Tertiary Qualifications
// rows only have Edit/History icons, confirmed live 2026-08-05.
//
// ADO steps 8 and 10 read like two different controls ("Delete icon" vs
// "Delete button") but there is only one Delete (trash) icon per row —
// step 8 is the first click (cancelled in step 9), step 10 is clicking it
// again to re-open the same confirmation dialog for real in step 11. The
// dialog shows both Cancel and OK simultaneously on every open.
//
// TC-08 clicks OK for real, permanently deleting this Secondary
// Qualifications row — confirmed with the requester before running. All
// earlier TCs only open and cancel the dialog.

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
  // Bumped from 20s to 45s — this environment has been observed to stall
  // on the "Initializing..." client bootstrap splash for longer than the
  // usual quick transient flake (see ADMINPORTAL-106544's 2nd-4th attempts).
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

// Resolves the Secondary Qualifications row's position among ALL
// div[role="row"] elements on the page while it still has plain text
// content, so the same index can be reused even if a later interaction
// switches the row into inline-input edit mode (hasText filters stop
// matching input VALUES — see ADMINPORTAL-106540/106541/106542 for the
// same fix).
async function findTargetRowIndex(page: Page): Promise<number> {
  await page.waitForLoadState('networkidle').catch(() => {});
  await page.mouse.wheel(0, 1500);
  await page.waitForTimeout(500);
  // Bumped to 60s — the environment has been running slow today (see
  // ADMINPORTAL-106544's attempts), this is a real slowness workaround,
  // not a selector fix.
  await page.getByText(ROW_ANCHOR_TEXT, { exact: false }).first().waitFor({ state: 'visible', timeout: 60_000 });
  const rows = page.locator('div[role="row"]');
  const count = await rows.count();
  for (let i = 0; i < count; i++) {
    const text = await rows.nth(i).innerText().catch(() => '');
    if (text.includes(ROW_ANCHOR_TEXT)) return i;
  }
  throw new Error(`Could not find a row containing "${ROW_ANCHOR_TEXT}"`);
}

function deleteIconAt(page: Page, index: number) {
  return page.locator('div[role="row"]').nth(index).locator('.anticon-delete').first();
}

function confirmDialogCancelButton(page: Page) {
  return page.getByRole('button', { name: 'Cancel', exact: false }).first();
}

function confirmDialogOkButton(page: Page) {
  return page.getByRole('button', { name: 'OK', exact: true }).first();
}

test.describe('ADMINPORTAL-106545 — Delete Qualification', () => {
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

  test('TC-07: Click the Delete icon then click Cancel', async ({ page }) => {
    test.setTimeout(180_000);
    await loginAsKwena(page);
    await openTargetApplication(page);
    const index = await findTargetRowIndex(page);
    await deleteIconAt(page, index).click();
    await page.waitForTimeout(600);
    // ASSERT (BLOCKING) a confirmation dialog appears
    await expect(page.getByText(/sure/i).first()).toBeVisible();
    await confirmDialogCancelButton(page).click();
    await page.waitForTimeout(600);
    // ASSERT (BLOCKING) dialog closes and the row still exists
    // (the popup's text node can remain in the DOM hidden rather than
    // removed — toHaveCount(0) is the wrong check here; see
    // ADMINPORTAL-106536 TC-08 for the same class of fix)
    await expect(page.getByText(/sure/i).first()).not.toBeVisible();
    await expect(page.getByText(ROW_ANCHOR_TEXT, { exact: false }).first()).toBeVisible();
  });

  test('TC-08: Click the Delete icon again and click OK', async ({ page }) => {
    test.setTimeout(180_000);
    await loginAsKwena(page);
    await openTargetApplication(page);
    const index = await findTargetRowIndex(page);
    await deleteIconAt(page, index).click();
    await page.waitForTimeout(600);
    // ASSERT (BLOCKING) confirmation dialog shows both Cancel and OK
    await expect(confirmDialogCancelButton(page)).toBeVisible();
    await expect(confirmDialogOkButton(page)).toBeVisible();
    // STEP: CLICK OK — REAL, PERMANENT DELETE, confirmed with requester
    await confirmDialogOkButton(page).click();
    await page.waitForTimeout(2000);
    // ASSERT (BLOCKING) the row no longer exists
    await page.reload({ waitUntil: 'domcontentloaded' });
    await page.waitForLoadState('networkidle').catch(() => {});
    await page.waitForTimeout(2000);
    await expect(page.getByText(ROW_ANCHOR_TEXT, { exact: false })).toHaveCount(0);
  });
});
