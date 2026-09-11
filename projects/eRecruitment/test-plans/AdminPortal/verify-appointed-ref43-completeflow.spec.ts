// AUTO-RECORDED from test-plans/AdminPortal/verify-appointed-ref43-completeflow.md
// Source: Azure DevOps project pd-recruitment, test case #104476 "Verify
// Appointed" (work item rev 2). The .md plan is canonical. AI-repair
// will patch failing lines in this file. Do not hand-edit unless you
// are also updating the .md plan.
//
// Recruiter role (Kwenas / "Kwena Semono"), standard Recruitment > Job
// Posting Dashboard navigation. Targets Job Posting Ref No 43's
// pre-existing applicant "Fred Everything" (Identity Number
// 2606108675655), status INTERVIEWED (set by ADMINPORTAL-104475) —
// shared QA test data, not created by this automation session.
//
// Same pattern as ADMINPORTAL-106335: uploads use a native OS file
// chooser; the "Appointed" button does not exist/enable until BOTH
// Approved Submission and Appointment Letter are uploaded.
//
// TC-06 clicks the real Appointed button — REAL, PERMANENT STATUS
// CHANGE (Interviewed -> Appointed) — confirmed with the requester
// before running.

import { test, expect, Page } from '@playwright/test';
import path from 'path';

const APP_URL = 'https://pd-recruitment-adminportal-qa.shesha.app/';
const RECRUITER = { user: 'Kwenas', password: '123qwe' };
const TARGET_REF_NO = '43';
const CANDIDATE_ROW_TEXT = 'Everything F';
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
// already attached for that field (idempotent — see ADMINPORTAL-106335).
async function uploadNear(page: Page, fieldLabel: string): Promise<'uploaded' | 'already-attached'> {
  const label = page.getByText(fieldLabel, { exact: false }).first();
  await label.scrollIntoViewIfNeeded().catch(() => {});
  await page.waitForTimeout(300);
  const labelBox = await label.boundingBox();

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

test.describe('ADMINPORTAL-104476 — Verify Appointed', () => {
  test.describe.configure({ mode: 'serial' });

  test('TC-01: Login as Kwena', async ({ page }) => {
    await loginAsKwena(page);
    await expect(page).not.toHaveURL(/login/i);
  });

  test('TC-02: Expand the Recruitment dropdown', async ({ page }) => {
    await loginAsKwena(page);
    await openRecruitmentMenu(page);
    await expect(page.getByText('Job Posting Dashboard', { exact: false }).first()).toBeVisible();
  });

  test('TC-03: Click on Job Posting dashboard, open Ref No 43', async ({ page }) => {
    test.setTimeout(120_000);
    await loginAsKwena(page);
    await openTargetJobPosting(page);
    await expect(page.getByText('Job Reference', { exact: false }).first()).toBeVisible();
    await expect(page.getByText(TARGET_REF_NO, { exact: true }).first()).toBeVisible();
  });

  test('TC-04: Navigate to Applications panel, click Interviewed tab, open Everything F\'s application', async ({ page }) => {
    test.setTimeout(180_000);
    await loginAsKwena(page);
    await openTargetJobPosting(page);
    await openInterviewedTab(page);
    const visibleAppLink = await firstVisible(page.getByText(CANDIDATE_ROW_TEXT, { exact: false }));
    await expect(visibleAppLink).toBeVisible();
    await clickVisible(page, page.getByText(CANDIDATE_ROW_TEXT, { exact: false }));
    await page.waitForLoadState('networkidle').catch(() => {});
    await page.waitForTimeout(2000);
    await expect(page.getByText('INTERVIEWED', { exact: false }).first()).toBeVisible();
  });

  test('TC-05: Scroll to Appointment Documents panel, upload Approved Submission and Appointment Letter', async ({ page }) => {
    test.setTimeout(180_000);
    await loginAsKwena(page);
    await openTargetApplication(page);
    await scrollToAppointmentDocuments(page);
    await expect(page.getByText('Approved Submission', { exact: false }).first()).toBeVisible();
    await uploadNear(page, 'Approved Submission');
    await uploadNear(page, 'Appointment Letter');
    const attached = page.getByText('blank document', { exact: false });
    expect(await attached.count()).toBeGreaterThanOrEqual(2);
    // ASSERT (BLOCKING) Appointed button is now visible and enabled
    await expect(appointedButton(page)).toBeVisible();
    await expect(appointedButton(page)).toBeEnabled();
  });

  test('TC-06: Click on the Appointed button', async ({ page }) => {
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
    await page.waitForTimeout(3000);
    await page.waitForLoadState('networkidle').catch(() => {});
    await page.waitForTimeout(2000);
    // ASSERT (BLOCKING) page auto-navigates away from the individual application view
    await expect(page.getByText('Personal Details', { exact: true })).toHaveCount(0);
  });

  test('TC-07: Click on the Appointed tab', async ({ page }) => {
    test.setTimeout(120_000);
    await loginAsKwena(page);
    await openTargetJobPosting(page);
    await openAppointedTab(page);
    // ASSERT (BLOCKING) application is displayed under the Appointed tab
    const visibleAppLink = await firstVisible(page.getByText(CANDIDATE_ROW_TEXT, { exact: false }));
    await expect(visibleAppLink).toBeVisible();
  });
});
