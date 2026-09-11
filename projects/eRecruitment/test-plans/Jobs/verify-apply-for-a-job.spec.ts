// AUTO-RECORDED from test-plans/Jobs/verify-apply-for-a-job.md
// Source: Azure DevOps test plan #99437, suite #104521, test case #106368
// The .md plan is canonical. AI-repair will patch failing lines in this file.
// Do not hand-edit unless you are also updating the .md plan.
//
// STATEFUL/DESTRUCTIVE: this spec submits a real job application in QA and
// consumes a seeded job posting each run. See the .md's warning section.
// The applied-to job is whichever is first in the unfiltered Jobs listing at
// run time (the shared QA dataset is under concurrent modification by other
// testers/processes — confirmed live 2026-07-30, so this is dynamic on
// purpose, not hardcoded to a specific title).
//
// File-picker steps use page.waitForEvent('filechooser') + setFiles(), the
// correct Playwright equivalent of "click upload field -> native OS picker
// opens -> select file -> click Open" (no native OS dialog can be driven by
// browser automation; this achieves the same net effect in one step).
//
// Apply dialog DOM (confirmed live 2026-07-30): the Z83/CV upload fields are
// Ant Design Upload "drag" dropzones, labelled via <label for="z83Form">
// and <label for="cv">. After a file is attached, the rendered list item
// shows the filename in an <a title="...">, plus two custom action icons:
// .sha-upload-replace-control ("Replace", triggers a new file chooser) and
// .sha-upload-remove-control ("Remove", opens an ant-modal-confirm titled
// "Delete Attachment" with Cancel/Yes buttons). Submit Application is
// disabled until both files are attached and both checkboxes are checked.

import { test, expect, Page, Locator } from '@playwright/test';
import * as path from 'path';

const APP_URL = 'https://pd-recruitment-publicportal-1-qa.shesha.app/';
const APPLICANT = { user: 'Fred', password: 'Metaganemr%03' };
const BLANK_DOC = path.resolve(__dirname, 'fixtures', 'blank document.pdf');
const REPLACEMENT_DOC = path.resolve(__dirname, 'fixtures', 'replacement document.pdf');
const BLANK_DOC_NAME = 'blank document.pdf';
const REPLACEMENT_DOC_NAME = 'replacement document.pdf';

async function loginAsFred(page: Page) {
  await page.goto(`${APP_URL}login`);
  await page.locator('input[type="text"]').first().fill(APPLICANT.user);
  await page.locator('input[type="password"]').first().fill(APPLICANT.password);
  await page.getByRole('button', { name: /sign in/i }).click();
  await page.waitForURL(url => !url.href.includes('/login'), { timeout: 30000 });
  await page.waitForLoadState('networkidle');
}

async function goToJobs(page: Page) {
  await page.getByRole('link', { name: 'Jobs', exact: true }).click();
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

// The shared QA Jobs dataset is under concurrent modification by other
// testers/processes — confirmed live 2026-07-30: the unfiltered listing was
// observed briefly empty ("0 items found") twice, both times recovering
// with a different set of job postings within seconds. Retry with a reload
// rather than failing outright on what is an environment characteristic,
// not a bug in this app flow.
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

function removeIcon(formItem: Locator): Locator {
  return formItem.locator('.sha-upload-remove-control');
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

function deleteConfirmDialog(page: Page): Locator {
  return page.locator('.ant-modal-confirm').filter({ hasText: 'Delete Attachment' });
}

async function deleteAttachment(page: Page, formItem: Locator) {
  await removeIcon(formItem).click();
  const confirm = deleteConfirmDialog(page);
  await expect(confirm).toBeVisible({ timeout: 10000 });
  await confirm.getByRole('button', { name: 'Yes', exact: true }).click();
  await page.waitForTimeout(800);
}

// The consent checkboxes have no accessible name (the long paragraph text
// is a plain sibling <span>, not an associated <label>), so getByRole with
// a name filter never matches. Anchor on the text and walk to the nearest
// preceding checkbox input instead — confirmed live 2026-07-30.
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

async function fullFlowToApplyDialog(page: Page): Promise<string> {
  await loginAsFred(page);
  await goToJobs(page);
  const title = await openFirstJobApply(page);
  await clickApplyButton(page);
  await expect(applyDialog(page)).toBeVisible({ timeout: 15000 });
  return title;
}

async function attachBothFiles(page: Page) {
  const z83 = z83FormItem(page);
  await uploadVia(page, uploadDropzone(z83), BLANK_DOC);
  await expect(uploadedFileLink(z83)).toHaveAttribute('title', BLANK_DOC_NAME, { timeout: 10000 });
  const cv = cvFormItem(page);
  await uploadVia(page, uploadDropzone(cv), BLANK_DOC);
  await expect(uploadedFileLink(cv)).toHaveAttribute('title', BLANK_DOC_NAME, { timeout: 10000 });
}

async function checkBothConsentBoxes(page: Page) {
  await confirmInfoCheckbox(page).check();
  await authoriseDhaCheckbox(page).check();
}

test.describe('JOBS-106368 — Verify Apply for a Job', () => {
  test.describe.configure({ mode: 'serial' });

  test('TC-01: Login as Fred', async ({ page }) => {
    await loginAsFred(page);
    await expect(page).not.toHaveURL(/login/i);
    await expect(page.getByText('Your Dashboard')).toBeVisible({ timeout: 30000 });
  });

  test('TC-02: Click on Jobs menu item', async ({ page }) => {
    await loginAsFred(page);
    await goToJobs(page);
    await waitForJobsAvailable(page);
  });

  test('TC-03: Click View & Apply on a job post', async ({ page }) => {
    await loginAsFred(page);
    await goToJobs(page);
    const title = await openFirstJobApply(page);
    console.log('APPLIED_JOB_TITLE:', title);
    await expect(page.getByRole('button', { name: 'Apply', exact: true })).toBeVisible({ timeout: 15000 });
  });

  test('TC-04: Click Apply button', async ({ page }) => {
    await loginAsFred(page);
    await goToJobs(page);
    await openFirstJobApply(page);
    await clickApplyButton(page);
    await expect(applyDialog(page)).toBeVisible({ timeout: 15000 });
  });

  test('TC-05: Upload Z83 file', async ({ page }) => {
    await fullFlowToApplyDialog(page);
    const formItem = z83FormItem(page);
    await uploadVia(page, uploadDropzone(formItem), BLANK_DOC);
    await expect(uploadedFileLink(formItem)).toHaveAttribute('title', BLANK_DOC_NAME);
  });

  test('TC-06: Replace Z83 file', async ({ page }) => {
    await fullFlowToApplyDialog(page);
    const formItem = z83FormItem(page);
    await uploadVia(page, uploadDropzone(formItem), BLANK_DOC);
    await expect(uploadedFileLink(formItem)).toHaveAttribute('title', BLANK_DOC_NAME);
    await uploadVia(page, replaceIcon(formItem), REPLACEMENT_DOC);
    await expect(uploadedFileLink(formItem)).toHaveAttribute('title', REPLACEMENT_DOC_NAME, { timeout: 10000 });
  });

  test('TC-07: Delete Z83 file', async ({ page }) => {
    await fullFlowToApplyDialog(page);
    const formItem = z83FormItem(page);
    await uploadVia(page, uploadDropzone(formItem), BLANK_DOC);
    await expect(uploadedFileLink(formItem)).toHaveAttribute('title', BLANK_DOC_NAME);
    // ASSERT (BLOCKING) Delete attachment dialog appears with Cancel/Yes buttons
    await removeIcon(formItem).click();
    const confirm = deleteConfirmDialog(page);
    await expect(confirm).toBeVisible({ timeout: 10000 });
    await expect(confirm.getByRole('button', { name: 'Cancel', exact: true })).toBeVisible();
    await expect(confirm.getByRole('button', { name: 'Yes', exact: true })).toBeVisible();
    await confirm.getByRole('button', { name: 'Yes', exact: true }).click();
    await page.waitForTimeout(800);
    // ASSERT (BLOCKING) file removed from Z83 panel
    await expect(formItem.locator('.ant-upload-list-item-container')).toHaveCount(0);
  });

  test('TC-08: Re-upload Z83 file', async ({ page }) => {
    await fullFlowToApplyDialog(page);
    const formItem = z83FormItem(page);
    await uploadVia(page, uploadDropzone(formItem), BLANK_DOC);
    await deleteAttachment(page, formItem);
    await uploadVia(page, uploadDropzone(formItem), BLANK_DOC);
    await expect(uploadedFileLink(formItem)).toHaveAttribute('title', BLANK_DOC_NAME, { timeout: 10000 });
  });

  test('TC-09: Upload CV file', async ({ page }) => {
    await fullFlowToApplyDialog(page);
    const formItem = cvFormItem(page);
    await uploadVia(page, uploadDropzone(formItem), BLANK_DOC);
    await expect(uploadedFileLink(formItem)).toHaveAttribute('title', BLANK_DOC_NAME);
  });

  test('TC-10: Replace CV file', async ({ page }) => {
    await fullFlowToApplyDialog(page);
    const formItem = cvFormItem(page);
    await uploadVia(page, uploadDropzone(formItem), BLANK_DOC);
    await expect(uploadedFileLink(formItem)).toHaveAttribute('title', BLANK_DOC_NAME);
    await uploadVia(page, replaceIcon(formItem), REPLACEMENT_DOC);
    await expect(uploadedFileLink(formItem)).toHaveAttribute('title', REPLACEMENT_DOC_NAME, { timeout: 10000 });
  });

  test('TC-11: Delete CV file', async ({ page }) => {
    await fullFlowToApplyDialog(page);
    const formItem = cvFormItem(page);
    await uploadVia(page, uploadDropzone(formItem), BLANK_DOC);
    await expect(uploadedFileLink(formItem)).toHaveAttribute('title', BLANK_DOC_NAME);
    // ASSERT (BLOCKING) Delete attachment dialog appears with Cancel/Yes buttons
    await removeIcon(formItem).click();
    const confirm = deleteConfirmDialog(page);
    await expect(confirm).toBeVisible({ timeout: 10000 });
    await expect(confirm.getByRole('button', { name: 'Cancel', exact: true })).toBeVisible();
    await expect(confirm.getByRole('button', { name: 'Yes', exact: true })).toBeVisible();
    await confirm.getByRole('button', { name: 'Yes', exact: true }).click();
    await page.waitForTimeout(800);
    // ASSERT (BLOCKING) file removed from CV panel
    await expect(formItem.locator('.ant-upload-list-item-container')).toHaveCount(0);
  });

  test('TC-12: Re-upload CV file', async ({ page }) => {
    await fullFlowToApplyDialog(page);
    const formItem = cvFormItem(page);
    await uploadVia(page, uploadDropzone(formItem), BLANK_DOC);
    await deleteAttachment(page, formItem);
    await uploadVia(page, uploadDropzone(formItem), BLANK_DOC);
    await expect(uploadedFileLink(formItem)).toHaveAttribute('title', BLANK_DOC_NAME, { timeout: 10000 });
  });

  test('TC-13: Check both consent checkboxes', async ({ page }) => {
    await fullFlowToApplyDialog(page);
    await attachBothFiles(page);
    // STEP: CHECK both consent checkboxes
    await confirmInfoCheckbox(page).check();
    await expect(confirmInfoCheckbox(page)).toBeChecked();
    await authoriseDhaCheckbox(page).check();
    await expect(authoriseDhaCheckbox(page)).toBeChecked();
    // ASSERT (BLOCKING) Submit Application button becomes enabled
    await expect(submitApplicationButton(page)).toBeEnabled({ timeout: 10000 });
  });

  test('TC-14: Submit Application', async ({ page }) => {
    const appliedTitle = await fullFlowToApplyDialog(page);
    await attachBothFiles(page);
    await checkBothConsentBoxes(page);
    await expect(submitApplicationButton(page)).toBeEnabled({ timeout: 10000 });
    // STEP: CLICK the Submit Application button
    await submitApplicationButton(page).click();
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(2000);
    // ASSERT (BLOCKING) the job's own details page now shows "Continue
    // Application" instead of "Apply" — the app's real per-job indicator
    // that a submission was recorded (confirmed live 2026-07-30; the app
    // does NOT navigate away from the job-details page after submitting).
    await expect(page.getByRole('button', { name: 'Continue Application' })).toBeVisible({ timeout: 20000 });
    // ASSERT (BLOCKING) the applied-for job no longer appears in the Jobs
    // listing (checked on the separate Jobs listing page, not the current
    // job-details page — the job's own heading still shows its title there).
    await goToJobs(page);
    const stillThere = jobCards(page).filter({ hasText: appliedTitle });
    await expect(stillThere).toHaveCount(0, { timeout: 15000 });
  });
});
