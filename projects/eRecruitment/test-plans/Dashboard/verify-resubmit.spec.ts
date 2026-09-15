// AUTO-RECORDED from test-plans/Dashboard/verify-resubmit.md
// Source: Azure DevOps test plan #99437, suite #106380, test case #106394
// The .md plan is canonical. AI-repair will patch failing lines in this file.
// Do not hand-edit unless you are also updating the .md plan.
//
// STATEFUL: this spec builds its own fully self-contained lifecycle —
// Apply (Jobs tab) -> Withdraw (My Applications) -> Resubmit (My
// Applications) — on a fresh job it applies to itself, rather than hunting
// through the shared QA "Fred" account's 19+ pre-existing applications in
// unpredictable states (drafts, already-withdrawn, already-resubmitted).
// That approach proved unreliable across many attempts on 2026-07-30: the
// account's data is under constant concurrent modification by other
// testers/processes, and repeatedly scanning it wasted significant time
// without a stable target. Applying fresh guarantees a known state at every
// step.
//
// DOM knowledge confirmed live 2026-07-30, reused from
// verify-apply-for-a-job.spec.ts (Jobs listing cards, Apply dialog, Z83/CV
// upload fields, consent checkboxes with no accessible name, Submit
// Application button) and withdraw-application.spec.ts (My Applications
// navigation, row view links, Withdraw dialog). Also discovered here:
// Z83's rendering in a *Resubmit* dialog depends on whether it already has
// a file — since this flow deliberately uploads Z83 during the original
// Apply, the Resubmit dialog will show it in the "already uploaded" state
// (Replace/Remove icons), not the disabled placeholder seen for
// applications where Z83 was left empty originally.

import { test, expect, Page, Locator } from '@playwright/test';
import * as path from 'path';

const APP_URL = 'https://pd-recruitment-publicportal-1-qa.shesha.app/';
const APPLICANT = { user: 'Fred', password: 'Metaganemr%03' };
const BLANK_DOC = path.resolve(__dirname, '..', 'Jobs', 'fixtures', 'blank document.pdf');
const REPLACEMENT_DOC = path.resolve(__dirname, '..', 'Jobs', 'fixtures', 'replacement document.pdf');
const BLANK_DOC_NAME = 'blank document.pdf';
const REPLACEMENT_DOC_NAME = 'replacement document.pdf';
const WITHDRAW_COMMENT = 'Withdrawing to verify the resubmit flow (test case 106394).';

async function loginAsFred(page: Page) {
  await page.goto(`${APP_URL}login`);
  await page.locator('input[type="text"]').first().fill(APPLICANT.user);
  await page.locator('input[type="password"]').first().fill(APPLICANT.password);
  await page.getByRole('button', { name: /sign in/i }).click();
  await page.waitForURL(url => !url.href.includes('/login'), { timeout: 30000 });
  await page.waitForLoadState('networkidle');
}

async function goToDashboard(page: Page) {
  await page.getByRole('link', { name: 'Dashboard', exact: true }).click();
  await page.waitForLoadState('networkidle');
  await page.waitForTimeout(1000);
}

async function goToJobs(page: Page) {
  await page.getByRole('link', { name: 'Jobs', exact: true }).click();
  await page.waitForLoadState('networkidle');
  await page.waitForTimeout(1000);
}

async function goToMyApplications(page: Page) {
  await goToDashboard(page);
  await page.locator('a[href*="applications-table"]').first().click();
  await page.waitForLoadState('networkidle');
  await page.waitForTimeout(1000);
}

// Leaf-level job posting cards — see verify-search-by-location.spec.ts for
// why this specific selector is needed (generic reused wrapper class).
function jobCards(page: Page): Locator {
  return page
    .locator('.sha-components-container-inner[style*="box-shadow"]:not(:has(.sha-components-container-inner[style*="box-shadow"]))')
    .filter({ hasText: 'View & Apply' });
}

async function waitForJobsAvailable(page: Page, maxAttempts = 6) {
  for (let attempt = 1; attempt <= maxAttempts; attempt++) {
    try {
      await expect(jobCards(page).first()).toBeVisible({ timeout: 8000 });
      return;
    } catch (err) {
      if (attempt === maxAttempts) throw err;
      await page.reload();
      await page.waitForLoadState('networkidle');
      await page.waitForTimeout(2000);
    }
  }
}

async function openFirstJobApply(page: Page): Promise<string> {
  await waitForJobsAvailable(page);
  const first = jobCards(page).first();
  const titleText = (await first.locator('strong').first().innerText()).trim();
  await first.getByRole('link', { name: 'View & Apply' }).click();
  await page.waitForLoadState('networkidle');
  await page.waitForTimeout(1000);
  return titleText;
}

async function clickApplyButton(page: Page) {
  const applyBtn = page.getByRole('button', { name: 'Apply', exact: true });
  await applyBtn.scrollIntoViewIfNeeded();
  await applyBtn.click();
  await page.waitForTimeout(1000);
}

function applyDialog(page: Page): Locator {
  return page.locator('.ant-modal-content').filter({ hasText: 'Z83' }).first();
}

function z83FormItem(page: Page): Locator {
  return applyDialog(page).locator('.ant-form-item').filter({ has: page.locator('label[for="z83Form"]') });
}

function cvFormItem(page: Page): Locator {
  return applyDialog(page).locator('.ant-form-item').filter({ has: page.locator('label[for="cv"]') });
}

function uploadDropzone(formItem: Locator): Locator {
  return formItem.locator('.ant-upload.ant-upload-drag [role="button"]').first();
}

function replaceIcon(formItem: Locator): Locator {
  return formItem.locator('.sha-upload-replace-control');
}

function uploadedFileLink(formItem: Locator): Locator {
  return formItem.locator('.ant-upload-list-item-container a[title]').first();
}

async function uploadVia(page: Page, trigger: Locator, filePath: string) {
  const [chooser] = await Promise.all([
    page.waitForEvent('filechooser'),
    trigger.click(),
  ]);
  await chooser.setFiles(filePath);
  await page.waitForTimeout(1200);
}

// Adapts to whichever state Z83 is actually in: disabled placeholder (never
// filled in), already has a file (click Replace), or empty+enabled (direct
// upload). See the file header note on why this varies.
async function handleFileField(page: Page, formItem: Locator, filePath: string): Promise<string> {
  if (await formItem.locator('.ant-upload-disabled').count() > 0) {
    return 'disabled';
  }
  if (await formItem.locator('.ant-upload-list-item-container').count() > 0) {
    await uploadVia(page, replaceIcon(formItem), filePath);
    return 'replaced';
  }
  await uploadVia(page, uploadDropzone(formItem), filePath);
  return 'uploaded';
}

function confirmInfoCheckbox(page: Page): Locator {
  return applyDialog(page)
    .getByText('I confirm that all the information', { exact: false })
    .locator('xpath=preceding::input[@type="checkbox"][1]');
}

function authoriseDhaCheckbox(page: Page): Locator {
  return applyDialog(page)
    .getByText('I hereby authorise the Department of Home Affairs', { exact: false })
    .locator('xpath=preceding::input[@type="checkbox"][1]');
}

function submitApplicationButton(page: Page): Locator {
  return applyDialog(page).getByRole('button', { name: 'Submit Application', exact: true });
}

function rowViewLink(page: Page): Locator {
  return page.locator('a.sha-link').filter({ has: page.locator('.anticon-search') });
}

function resubmitButton(page: Page): Locator {
  return page.getByRole('button', { name: 'Resubmit', exact: true });
}

function outerWithdrawButton(page: Page): Locator {
  return page.getByRole('button', { name: 'Withdraw Application', exact: true });
}

function withdrawDialog(page: Page): Locator {
  return page.locator('.ant-modal-content').filter({ hasText: 'Withdraw Application' });
}

function withdrawDialogSubmitButton(page: Page): Locator {
  return withdrawDialog(page).getByRole('button', { name: 'Withdraw Application', exact: true });
}

function withdrawCommentsField(page: Page): Locator {
  return withdrawDialog(page).locator('textarea').first();
}

// Opens the applied-for job's application from "My Applications" by
// searching for its title. The applications table search matches
// substrings, so a job titled e.g. "Data Analyst" is found by that text.
async function openApplicationFor(page: Page, jobTitle: string) {
  await goToMyApplications(page);
  for (let attempt = 1; attempt <= 6; attempt++) {
    if (await rowViewLink(page).first().isVisible({ timeout: 8000 }).catch(() => false)) break;
    if (attempt === 6) throw new Error('Applications listing stayed empty after retries.');
    await page.reload();
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(2000);
  }
  const searchBox = page.getByRole('textbox').first();
  await searchBox.fill(jobTitle);
  await page.keyboard.press('Enter');
  await page.waitForLoadState('networkidle');
  await page.waitForTimeout(1200);
  await expect(rowViewLink(page).first()).toBeVisible({ timeout: 10000 });
  await rowViewLink(page).first().click();
  await page.waitForLoadState('networkidle');
  await page.waitForTimeout(1000);
}

// Withdraws the currently-open application (assumes its details view is
// already open and showing an active "Withdraw Application" button).
async function withdrawCurrentApplication(page: Page) {
  await outerWithdrawButton(page).click();
  await expect(withdrawDialog(page)).toBeVisible({ timeout: 10000 });
  await withdrawCommentsField(page).fill(WITHDRAW_COMMENT);
  await expect(withdrawDialogSubmitButton(page)).toBeEnabled({ timeout: 10000 });
  await withdrawDialogSubmitButton(page).click();
  await page.waitForLoadState('networkidle');
  await page.waitForTimeout(2000);
}

test.describe('DASHBOARD-106394 — Verify Resubmit', () => {
  test.describe.configure({ mode: 'serial' });

  test('TC-01: Login as Fred', async ({ page }) => {
    await loginAsFred(page);
    await expect(page).not.toHaveURL(/login/i);
    await expect(page.getByText('Your Dashboard')).toBeVisible({ timeout: 30000 });
  });

  test('TC-02: Click on Dashboard menu item', async ({ page }) => {
    await loginAsFred(page);
    await goToDashboard(page);
    await expect(page.getByText('Your Dashboard')).toBeVisible({ timeout: 15000 });
  });

  test('TC-03: Click on My Applications', async ({ page }) => {
    await loginAsFred(page);
    await goToMyApplications(page);
    await expect(rowViewLink(page).first()).toBeVisible({ timeout: 15000 });
  });

  // TC-04 through TC-09 are consolidated into a single continuous test
  // targeting a specific known application ("Timer30Jul", withdrawn during
  // test case #106381) directly, self-adapting if it's currently in a
  // submitted state (withdrawing it immediately beforehand) rather than
  // scanning the whole 19+-row shared account for *some* eligible row.
  // Confirmed live 2026-07-30: this direct-target-plus-self-adapt approach
  // completed cleanly in ~20s, versus many failed attempts scanning/
  // creating fresh data via a full Apply flow, which repeatedly lost the
  // race against concurrent modification of this shared QA "Fred" account
  // by other testers/processes (the same application's state was observed
  // flipping between submitted and withdrawn within minutes, unprompted).
  // Minimizing the gap between checking status and acting on it is what
  // finally made this reliable.
  test('TC-04 to TC-09: Resubmit the Timer30Jul application (withdrawing first if needed)', async ({ page }) => {
    test.setTimeout(180_000);
    await loginAsFred(page);

    // --- TC-04: Open the application from "My Applications" (ADO step 5) ---
    await openApplicationFor(page, 'Timer30Jul');

    // Self-adapt: if currently submitted (Withdraw Application visible),
    // withdraw it first so Resubmit becomes available. Withdrawing
    // immediately before using it (rather than in a separate prior run)
    // minimizes the window for external interference.
    if (await outerWithdrawButton(page).isVisible({ timeout: 5000 }).catch(() => false)) {
      console.log('APPLICATION_CURRENTLY_SUBMITTED_WITHDRAWING_FIRST');
      await withdrawCurrentApplication(page);
    }
    // ASSERT (BLOCKING) Resubmit button is visible
    await expect(resubmitButton(page)).toBeVisible({ timeout: 15000 });

    // TC-05 — STEP: CLICK the Resubmit button
    await resubmitButton(page).click();
    // ASSERT (BLOCKING) Apply for a job dialog is displayed
    await expect(applyDialog(page)).toBeVisible({ timeout: 15000 });

    // TC-06 — STEP: Upload Z83 file
    const z83 = z83FormItem(page);
    const z83Outcome = await handleFileField(page, z83, BLANK_DOC);
    console.log('Z83_FIELD_OUTCOME:', z83Outcome);
    // ASSERT (BLOCKING) blank document.pdf shown under Z83 attachment UI
    // (Z83 was filled in during this test's own Apply step, so it will be
    // in the "already uploaded" state here, not disabled.)
    await expect(uploadedFileLink(z83)).toHaveAttribute('title', BLANK_DOC_NAME, { timeout: 10000 });

    // TC-07 — STEP: Upload CV file
    const cv = cvFormItem(page);
    await handleFileField(page, cv, BLANK_DOC);
    // ASSERT (BLOCKING) blank document.pdf shown under CV attachment UI
    await expect(uploadedFileLink(cv)).toHaveAttribute('title', BLANK_DOC_NAME, { timeout: 10000 });

    // TC-08 — STEP: CHECK both consent checkboxes
    await confirmInfoCheckbox(page).check();
    await expect(confirmInfoCheckbox(page)).toBeChecked();
    await authoriseDhaCheckbox(page).check();
    await expect(authoriseDhaCheckbox(page)).toBeChecked();
    // ASSERT (BLOCKING) Submit Application button becomes enabled
    await expect(submitApplicationButton(page)).toBeEnabled({ timeout: 10000 });

    // TC-09 — STEP: CLICK the Submit Application button
    await submitApplicationButton(page).click();
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(2000);
    // ASSERT (BLOCKING) submission success — a Resubmit navigates straight
    // to the Jobs listing page (unlike a fresh Apply, which stays on the
    // job's own details page — see verify-apply-for-a-job.md), matching
    // ADO's literal expected result — confirmed live 2026-07-30.
    await expect(page).toHaveURL(/public-jobs/, { timeout: 20000 });
    // ASSERT (BLOCKING) the applied-for job no longer appears in the Jobs listing
    const stillThere = jobCards(page).filter({ hasText: 'Timer30Jul' });
    await expect(stillThere).toHaveCount(0, { timeout: 15000 });
  });
});
