// AUTO-RECORDED from test-plans/AdminPortal/verify-edit-reasons-for-leaving.md
// Source: Azure DevOps project pd-recruitment, test case #106550 "Verify
// Edit reasons for leaving" (work item rev 3). The .md plan is
// canonical. AI-repair will patch failing lines in this file. Do not
// hand-edit unless you are also updating the .md plan.
//
// Recruiter role (Kwenas / "Kwena Semono"), Recruitment > Job Posting
// Dashboard section. Targets Job Posting Ref No 40's application
// (currently listed as "Edit Last Name F"), Work Experience panel's row
// for "Senior Test Engineer" / "Edited Employer" (set by
// ADMINPORTAL-106548). ADO step 11's instruction text has a typo
// ("Edited Resons for leaving") but its own expected result correctly
// spells "Edited Reasons for leaving" — this spec uses the correct
// spelling.
//
// IMPORTANT selector note: once a row is switched into inline edit mode,
// its cell text becomes input VALUES, which Playwright's hasText filter
// does not see as text content — so a fresh hasText lookup on the row's
// original text stops matching right after editing starts. This spec
// resolves the row's index once (while it still has plain text) and
// reuses that positional nth() index for every subsequent interaction
// within the same test (same fix as
// ADMINPORTAL-106540/106541/106542/106547/106548/106549).
//
// TC-10 clicks the row's inline Save icon for real, permanently changing
// the row's Reason For Leaving — confirmed with the requester before
// running. All earlier TCs never click Save.

import { test, expect, Page } from '@playwright/test';

const APP_URL = 'https://pd-recruitment-adminportal-qa.shesha.app/';
const RECRUITER = { user: 'Kwenas', password: '123qwe' };
const TARGET_REF_NO = '40';
// Surname/Initials text as it currently appears in the Applications table —
// update this if a prior real run already renamed the candidate further.
const CANDIDATE_ROW_TEXT = 'Edit Last Name F';
const ROW_ANCHOR_TEXT = 'Senior Test Engineer';
const NEW_REASON = 'Edited Reasons for leaving';

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
// mode (see selector note above).
async function findTargetRowIndex(page: Page): Promise<number> {
  await page.waitForLoadState('networkidle').catch(() => {});
  await page.mouse.wheel(0, 2200);
  await page.waitForTimeout(500);
  // Bumped to 60s — the environment has been running slow lately (see
  // ADMINPORTAL-106544/106545/106547/106548/106549's attempts), this is
  // a real slowness workaround, not a selector fix.
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

function reasonForLeavingInputAt(page: Page, index: number) {
  // Column order is Job Title, Employer, Employment Start Date,
  // Employment End Date, Reason For Leaving. IMPORTANT: the two date
  // pickers (input[placeholder="Select date"]) are themselves plain
  // <input> elements too, so a generic .locator('input') query counts
  // them — the real 0-based order is 0=Job Title, 1=Employer,
  // 2=Start Date, 3=End Date, 4=Reason For Leaving. An earlier version of
  // this spec used nth(2) (assuming the date pickers didn't count),
  // which actually typed into Employment Start Date — the app correctly
  // rejected that save (an invalid date string), leaving the row
  // untouched including "Test". Confirmed via the row's accessibility
  // snapshot after that failed attempt.
  return page.locator('div[role="row"]').nth(index).locator('input').nth(4);
}

function saveIconAt(page: Page, index: number) {
  // Confirmed live (ADMINPORTAL-106540): `.anticon-save` is the specific,
  // unambiguous class for the row's inline save action.
  return page.locator('div[role="row"]').nth(index).locator('.anticon-save').first();
}

test.describe('ADMINPORTAL-106550 — Verify Edit reasons for leaving', () => {
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
    // ASSERT (BLOCKING) the row's Reason For Leaving field is now an editable input
    await expect(reasonForLeavingInputAt(page, index)).toBeVisible();
  });

  test('TC-08: Click on the Reasons For Leaving text area', async ({ page }) => {
    test.setTimeout(180_000);
    await loginAsKwena(page);
    await openTargetApplication(page);
    const index = await enterWorkExperienceEditMode(page);
    const input = reasonForLeavingInputAt(page, index);
    await input.click();
    // ASSERT (BLOCKING) Reason For Leaving field is focused and editable
    await expect(input).toBeFocused();
  });

  test('TC-09: Clear the Reasons For Leaving text area and populate "Edited Reasons for leaving"', async ({ page }) => {
    test.setTimeout(180_000);
    await loginAsKwena(page);
    await openTargetApplication(page);
    const index = await enterWorkExperienceEditMode(page);
    const input = reasonForLeavingInputAt(page, index);
    await input.click();
    await input.fill('');
    await input.fill(NEW_REASON);
    // ASSERT (BLOCKING) Reason For Leaving field contains the typed value
    await expect(input).toHaveValue(NEW_REASON);
  });

  test('TC-10: Click on Save', async ({ page }) => {
    test.setTimeout(180_000);
    await loginAsKwena(page);
    await openTargetApplication(page);
    const index = await enterWorkExperienceEditMode(page);
    const input = reasonForLeavingInputAt(page, index);
    await input.click();
    await input.fill('');
    await input.fill(NEW_REASON);
    // STEP: CLICK the row's inline Save icon — REAL, PERSISTENT EDIT
    // (ADO calls it "OK"), confirmed with the requester
    await saveIconAt(page, index).click();
    await page.waitForTimeout(2000);
    // ASSERT (BLOCKING) after Save + reload, the row shows the updated value
    await page.reload({ waitUntil: 'domcontentloaded' });
    await page.waitForLoadState('networkidle').catch(() => {});
    await page.mouse.wheel(0, 2200);
    // Wait for the Work Experience row to actually be present rather than
    // a fixed short delay — this table has been observed to still be
    // loading well after reload+networkidle (same class of quirk
    // documented for the Education panel and Inbox table elsewhere in
    // this project; see this test case's first attempt).
    await page.getByText(ROW_ANCHOR_TEXT, { exact: false }).first().waitFor({ state: 'visible', timeout: 60_000 });
    const rows = page.locator('div[role="row"]');
    const count = await rows.count();
    let found = false;
    for (let i = 0; i < count; i++) {
      const text = await rows.nth(i).innerText().catch(() => '');
      if (text.includes(ROW_ANCHOR_TEXT) && text.includes(NEW_REASON)) { found = true; break; }
    }
    expect(found).toBeTruthy();
  });
});
