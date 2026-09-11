// AUTO-RECORDED from test-plans/AdminPortal/verify-interviewed-completeflow.md
// Source: Azure DevOps project pd-recruitment, test case #106335 "Verify
// Interviewed" (work item rev 2). The .md plan is canonical. AI-repair
// will patch failing lines in this file. Do not hand-edit unless you are
// also updating the .md plan.
//
// Recruiter role (Kwenas / "Kwena Semono"), Recruitment > Job Posting
// Dashboard section. Targets Job Posting Ref No 40's application created
// on ADMINPORTAL-106172 — currently listed as "Edit Last Name A",
// INTERVIEWED status.
//
// IMPORTANT precondition: ADMINPORTAL-106333, as literally written in
// ADO, never clicks the "Interviewed" button. It was clicked as a real,
// confirmed prerequisite action outside of 106333's literal scope,
// before this plan was authored, to move the application from
// "Shortlisted" to "Interviewed" so this test case's precondition holds.
//
// Panel is labelled "Appointment Documents" in the live app (ADO step 9
// says "Appointments Documents" — minor wording difference only).
//
// Uploads use a native OS file chooser
// (page.waitForEvent('filechooser')). The "Appointed" button does not
// exist/enable until BOTH Approved Submission and Appointment Letter are
// uploaded — confirmed live 2026-08-06, same conditional-render pattern
// as ADMINPORTAL-106333's "Interviewed" button appearing only once the
// comment field had text.
//
// The upload steps are idempotent: if a field already shows an uploaded
// filename (from a prior live investigation or re-run), the spec skips
// re-uploading rather than failing to find "(press to upload)" text.
//
// TC-10 clicks the real "Appointed" button — REAL, PERMANENT STATUS
// CHANGE (INTERVIEWED -> Appointed) — confirmed with the requester
// before running.
//
// The application row link and tab labels render TWICE in the DOM
// (responsive desktop+mobile layout) — must pick the VISIBLE element
// among duplicates (see ADMINPORTAL-106332/106333).

import { test, expect, Page } from '@playwright/test';
import path from 'path';

const APP_URL = 'https://pd-recruitment-adminportal-qa.shesha.app/';
const RECRUITER = { user: 'Kwenas', password: '123qwe' };
const TARGET_REF_NO = '40';
// Surname/Initials text as it currently appears in the Applications table —
// update this if a prior real run already renamed the candidate further.
const CANDIDATE_ROW_TEXT = 'Edit Last Name A';
const FIXTURE_FILE = path.resolve(__dirname, 'fixtures', 'blank document.pdf');

async function loginAsKwena(page: Page) {
  await page.goto(`${APP_URL}login`, { waitUntil: 'domcontentloaded' });
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

// Returns the first VISIBLE element among duplicate hidden/visible matches
// (responsive desktop+mobile layout renders both).
async function firstVisible(locator: ReturnType<Page['getByText']>) {
  const count = await locator.count();
  for (let i = 0; i < count; i++) {
    const el = locator.nth(i);
    if (await el.isVisible().catch(() => false)) return el;
  }
  throw new Error('No visible element found among matches');
}

async function clickVisible(page: Page, locator: ReturnType<Page['getByText']>) {
  const el = await firstVisible(locator);
  await el.scrollIntoViewIfNeeded().catch(() => {});
  await page.waitForTimeout(300);
  await el.click();
}

async function openInterviewedTab(page: Page) {
  await page.mouse.wheel(0, 1200);
  await page.waitForTimeout(600);
  await clickVisible(page, page.getByText('Interviewed', { exact: false }));
  // The tab's table shows a "loading..." placeholder briefly after the
  // click — confirmed live 2026-08-06 that a flat 1000ms wait can still
  // catch it mid-load. Wait for the placeholder to clear instead.
  await page.getByText('loading...', { exact: false }).first().waitFor({ state: 'hidden', timeout: 15_000 }).catch(() => {});
  await page.waitForTimeout(1000);
}

async function openAppointedTab(page: Page) {
  await page.mouse.wheel(0, 1200);
  await page.waitForTimeout(600);
  await clickVisible(page, page.getByText('Appointed', { exact: false }));
  await page.getByText('loading...', { exact: false }).first().waitFor({ state: 'hidden', timeout: 15_000 }).catch(() => {});
  await page.waitForTimeout(1000);
}

async function openTargetApplication(page: Page) {
  await openTargetJobPosting(page);
  await openInterviewedTab(page);
  await clickVisible(page, page.getByText(CANDIDATE_ROW_TEXT, { exact: false }));
  await page.waitForLoadState('networkidle').catch(() => {});
  await page.waitForTimeout(2000);
}

async function scrollToAppointmentDocuments(page: Page) {
  for (let i = 0; i < 10; i++) {
    await page.mouse.wheel(0, 2000);
    await page.waitForTimeout(400);
    const bt = await page.locator('body').innerText().catch(() => '');
    if (bt.includes('Appointment Documents')) return;
  }
}

// Uploads the fixture file to whichever "(press to upload)" link sits
// closest (vertically) to the given field label, unless a file is
// already attached for that field (idempotent — see header comment).
async function uploadNear(page: Page, fieldLabel: string): Promise<'uploaded' | 'already-attached'> {
  const label = page.getByText(fieldLabel, { exact: false }).first();
  await label.scrollIntoViewIfNeeded().catch(() => {});
  await page.waitForTimeout(300);
  const labelBox = await label.boundingBox();

  // Check for an already-attached filename near this label (idempotent skip).
  const attached = page.getByText('blank document', { exact: false });
  const attachedCount = await attached.count();
  for (let i = 0; i < attachedCount; i++) {
    const box = await attached.nth(i).boundingBox().catch(() => null);
    if (box && labelBox && Math.abs(box.y - labelBox.y) < 15) {
      return 'already-attached';
    }
  }

  const uploadLinks = page.getByText('(press to upload)', { exact: false });
  const uploadCount = await uploadLinks.count();
  let closestIdx = -1;
  let closestDist = Infinity;
  for (let i = 0; i < uploadCount; i++) {
    const box = await uploadLinks.nth(i).boundingBox().catch(() => null);
    if (box && labelBox) {
      const dist = Math.abs(box.y - labelBox.y);
      if (dist < closestDist) {
        closestDist = dist;
        closestIdx = i;
      }
    }
  }
  if (closestIdx < 0) throw new Error(`No "(press to upload)" link found near "${fieldLabel}"`);

  const [fileChooser] = await Promise.all([
    page.waitForEvent('filechooser', { timeout: 10_000 }),
    uploadLinks.nth(closestIdx).click(),
  ]);
  await fileChooser.setFiles(FIXTURE_FILE);
  await page.waitForTimeout(2000);
  return 'uploaded';
}

function appointedButton(page: Page) {
  return page.getByRole('button', { name: 'Appointed', exact: true });
}

function notAppointedButton(page: Page) {
  return page.getByRole('button', { name: 'Not Appointed', exact: true });
}

test.describe('ADMINPORTAL-106335 — Verify Interviewed', () => {
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

  test('TC-06: Navigate to Applications panel and click the "Interviewed" tab', async ({ page }) => {
    test.setTimeout(120_000);
    await loginAsKwena(page);
    await openTargetJobPosting(page);
    await openInterviewedTab(page);
    // ASSERT (BLOCKING) the interviewed application is displayed
    const visibleAppLink = await firstVisible(page.getByText(CANDIDATE_ROW_TEXT, { exact: false }));
    await expect(visibleAppLink).toBeVisible();
  });

  test('TC-07: Click on the Surname and Initials link to open the application', async ({ page }) => {
    test.setTimeout(180_000);
    await loginAsKwena(page);
    await openTargetApplication(page);
    // ASSERT (BLOCKING) application opens in details view
    await expect(page.getByText('Personal Details', { exact: true }).first()).toBeVisible();
  });

  test('TC-08: Navigate to Appointment Documents panel and upload Approved Submission', async ({ page }) => {
    test.setTimeout(180_000);
    await loginAsKwena(page);
    await openTargetApplication(page);
    await scrollToAppointmentDocuments(page);
    await expect(page.getByText('Approved Submission', { exact: false }).first()).toBeVisible();
    await uploadNear(page, 'Approved Submission');
    // ASSERT (BLOCKING) file is rendered on the UI for Approved Submission
    const label = page.getByText('Approved Submission', { exact: false }).first();
    const labelBox = await label.boundingBox();
    const attached = page.getByText('blank document', { exact: false });
    const attachedCount = await attached.count();
    let found = false;
    for (let i = 0; i < attachedCount; i++) {
      const box = await attached.nth(i).boundingBox().catch(() => null);
      if (box && labelBox && Math.abs(box.y - labelBox.y) < 15) { found = true; break; }
    }
    expect(found).toBeTruthy();
  });

  test('TC-09: Click "Press to upload" under Appointment Letter and upload the file', async ({ page }) => {
    test.setTimeout(180_000);
    await loginAsKwena(page);
    await openTargetApplication(page);
    await scrollToAppointmentDocuments(page);
    await uploadNear(page, 'Approved Submission');
    await uploadNear(page, 'Appointment Letter');
    // ASSERT (BLOCKING) file is rendered on the UI for Appointment Letter
    const label = page.getByText('Appointment Letter', { exact: false }).first();
    const labelBox = await label.boundingBox();
    const attached = page.getByText('blank document', { exact: false });
    const attachedCount = await attached.count();
    let found = false;
    for (let i = 0; i < attachedCount; i++) {
      const box = await attached.nth(i).boundingBox().catch(() => null);
      if (box && labelBox && Math.abs(box.y - labelBox.y) < 15) { found = true; break; }
    }
    expect(found).toBeTruthy();
    // ASSERT (BLOCKING) Appointed button is now visible and enabled
    await expect(appointedButton(page)).toBeVisible();
    await expect(appointedButton(page)).toBeEnabled();
  });

  test('TC-10: Click on the Appointed button', async ({ page }) => {
    test.setTimeout(180_000);
    await loginAsKwena(page);
    await openTargetApplication(page);
    await scrollToAppointmentDocuments(page);
    await uploadNear(page, 'Approved Submission');
    await uploadNear(page, 'Appointment Letter');
    await expect(appointedButton(page)).toBeEnabled();
    // STEP: CLICK the real Appointed button — REAL, PERMANENT STATUS
    // CHANGE, confirmed with requester
    await appointedButton(page).click();
    await page
      .locator('.ant-message, .ant-notification')
      .filter({ hasText: /success/i })
      .first()
      .waitFor({ state: 'visible', timeout: 5_000 })
      .catch(() => {});
    await page.waitForTimeout(2000);
    // ASSERT (BLOCKING) page auto-navigates back to the applications table
    await expect(page.getByText('Personal Details', { exact: true })).toHaveCount(0);
  });

  test('TC-11: Click on Appointed tab', async ({ page }) => {
    test.setTimeout(120_000);
    await loginAsKwena(page);
    await openTargetJobPosting(page);
    await openAppointedTab(page);
    // ASSERT (BLOCKING) tab opens successfully
    const visibleAppLink = await firstVisible(page.getByText(CANDIDATE_ROW_TEXT, { exact: false }));
    await expect(visibleAppLink).toBeVisible();
  });

  test('TC-12: Open the same application', async ({ page }) => {
    test.setTimeout(180_000);
    await loginAsKwena(page);
    await openTargetJobPosting(page);
    await openAppointedTab(page);
    await clickVisible(page, page.getByText(CANDIDATE_ROW_TEXT, { exact: false }));
    await page.waitForLoadState('networkidle').catch(() => {});
    await page.waitForTimeout(2000);
    // ASSERT (BLOCKING) application details view shows "APPOINTED" status
    await expect(page.getByText('APPOINTED', { exact: false }).first()).toBeVisible();
  });
});
