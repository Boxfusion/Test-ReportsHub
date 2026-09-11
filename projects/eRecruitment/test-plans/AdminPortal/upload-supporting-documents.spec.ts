// AUTO-RECORDED from test-plans/AdminPortal/upload-supporting-documents.md
// Source: Azure DevOps project pd-recruitment, test case #102827 "Upload
// Supporting Documents" (steps supplied via the same shared-step block as
// #102822/#102826, work item rev 3).
// The .md plan is canonical. AI-repair will patch failing lines in this file.
// Do not hand-edit unless you are also updating the .md plan.
//
// STATEFUL/DESTRUCTIVE: each TC re-runs the full flow from login (this hub's
// serial-TC convention) and creates a real Draft JobPosting record in the
// shared QA dataset. A fresh unique Job Reference Number is generated per
// run to avoid colliding with other testers' seeded data.
//
// Steps 3-17 (login through reaching the Documentation stepper) are shared
// with #102822/#102826 — see AdminPortal/create-job-posting-valid.spec.ts
// and AdminPortal/upload-approved-submission-document.spec.ts for the DOM
// notes on that portion of the flow and the upload/replace/delete controls
// (`.sha-upload-replace-control` / `.sha-upload-remove-control` / the
// "Delete Attachment" ant-modal-confirm). This spec targets the
// "Supporting Documents" upload box (the second dragger on the Documentation
// step, "Approved Submission" being the first) and additionally clicks Next
// (ADO step 22) to confirm the wizard advances to the Confirmation stepper.

import { test, expect, Page, Locator } from '@playwright/test';
import * as path from 'path';

const APP_URL = 'https://pd-recruitment-adminportal-qa.shesha.app/';
const RECRUITER = { user: 'kamogelos', password: '123qwe' };
const RECRUITER_NAME = 'Audrey Muvhango';
const POST_NAME = 'Senior Case Officer';
const PROVINCE_BRANCH = 'Gauteng / Head Office';
const CENTRE_OFFICE = 'Head Office';
const SALARY_LEVEL = '1';
const REQUIREMENTS = 'Grade 12 certificate, relevant tertiary qualification in Public Administration, and 3 years relevant experience.';
const REQUIRED_SKILLS = 'Attention to detail, strong administrative skills, knowledge of recruitment processes, good communication skills.';
const DUTIES = 'Screen applications, schedule interviews, liaise with hiring managers, and maintain accurate recruitment records.';
const BLANK_DOC = path.resolve(__dirname, 'fixtures', 'blank document.pdf');
const REPLACEMENT_DOC = path.resolve(__dirname, 'fixtures', 'replacement document.pdf');
const BLANK_DOC_NAME = 'blank document.pdf';
const REPLACEMENT_DOC_NAME = 'replacement document.pdf';

function uniqueRef(): string {
  return `CJP-102827-${Date.now()}-${Math.floor(Math.random() * 1000)}`;
}

function fieldInput(page: Page, labelText: string): Locator {
  return page.locator('label', { hasText: labelText }).locator('xpath=../..').locator('input').first();
}

function fieldTextarea(page: Page, labelText: string): Locator {
  return page.locator('label', { hasText: labelText }).locator('xpath=../..').locator('textarea').first();
}

function fieldSelect(page: Page, labelText: string): Locator {
  return page.locator('label', { hasText: labelText }).locator('xpath=../..').locator('.ant-select').first();
}

function visibleDropdown(page: Page): Locator {
  return page.locator('.ant-select-dropdown:visible').last();
}

function nextButton(page: Page): Locator {
  return page.getByRole('button', { name: 'Next' });
}

function supportingDocumentsUploadArea(page: Page): Locator {
  return page.locator('label', { hasText: 'Supporting Documents' })
    .locator('xpath=../..')
    .locator('text=Click or drag file to this area to upload')
    .first();
}

async function loginAsKamogelo(page: Page) {
  // waitUntil:'load' times out here — the app keeps background network
  // activity alive past the 30s navigationTimeout, so 'domcontentloaded'
  // (confirmed sufficient during live exploration) is used instead.
  await page.goto(`${APP_URL}login`, { waitUntil: 'domcontentloaded' });
  await page.waitForSelector('input[placeholder="Username"]', { timeout: 20000 });
  await page.locator('input[placeholder="Username"]').fill(RECRUITER.user);
  await page.locator('input[placeholder="Password"]').fill(RECRUITER.password);
  await page.getByRole('button', { name: 'Sign In' }).click();
  await page.waitForURL(url => !url.href.includes('/login'), { timeout: 30000 });
  await page.waitForLoadState('networkidle').catch(() => {});
  await page.waitForTimeout(1000);
}

async function goToMyItems(page: Page) {
  await page.getByText('Workflows', { exact: false }).first().click();
  await page.waitForTimeout(600);
  await page.getByText('My Items', { exact: true }).first().click();
  await page.waitForLoadState('networkidle').catch(() => {});
  await page.waitForTimeout(1000);
  // Close the hover-flyout submenu (it can stay open and overlap the toolbar)
  await page.mouse.move(900, 400);
  await page.mouse.move(1200, 700);
  await page.waitForTimeout(300);
}

async function openJobPostingForm(page: Page) {
  await page.getByRole('button', { name: 'Create New' }).click();
  await page.waitForTimeout(600);
  await page.getByRole('menuitem', { name: 'JobPosting' }).click();
  await page.waitForLoadState('networkidle').catch(() => {});
  await page.waitForTimeout(1200);
}

async function fillJobInformationSummary(page: Page, refNo: string) {
  await fieldSelect(page, 'Name and Surname').click();
  await page.waitForTimeout(400);
  await visibleDropdown(page).locator('.ant-select-item-option', { hasText: RECRUITER_NAME }).click();
  await page.waitForTimeout(300);

  await fieldInput(page, 'Job Reference Number').fill(refNo);
  await fieldInput(page, 'Post Name').fill(POST_NAME);
  await fieldInput(page, 'Province / Branch').fill(PROVINCE_BRANCH);

  await fieldSelect(page, 'Centre / Office Name').click();
  await page.waitForTimeout(400);
  await visibleDropdown(page).locator('.ant-select-item-option', { hasText: CENTRE_OFFICE }).first().click();
  await page.waitForTimeout(300);

  await fieldSelect(page, 'Salary Level').click();
  await page.waitForTimeout(400);
  await visibleDropdown(page).locator('.ant-select-item-option').filter({ hasText: new RegExp(`^${SALARY_LEVEL}$`) }).first().click();
  await page.waitForTimeout(300);

  await page.locator('input[placeholder="Select date"]').click();
  await page.waitForTimeout(400);
  await page.locator('.ant-picker-cell-in-view', { hasText: '22' }).first().click();
  await page.waitForTimeout(400);
}

async function fillOutputAndCompetencies(page: Page) {
  await fieldTextarea(page, 'Requirements').fill(REQUIREMENTS);
  await fieldTextarea(page, 'Required Skills and Competencies').fill(REQUIRED_SKILLS);
  await fieldTextarea(page, 'Duties').fill(DUTIES);
}

async function advanceToDocumentationStep(page: Page, refNo: string) {
  await loginAsKamogelo(page);
  await goToMyItems(page);
  await openJobPostingForm(page);
  await fillJobInformationSummary(page, refNo);
  await nextButton(page).click();
  await page.waitForLoadState('networkidle').catch(() => {});
  await page.waitForTimeout(1200);

  await fillOutputAndCompetencies(page);
  await nextButton(page).click();
  await page.waitForLoadState('networkidle').catch(() => {});
  await page.waitForTimeout(1200);
}

async function uploadSupportingDocument(page: Page, filePath: string) {
  const [chooser] = await Promise.all([
    page.waitForEvent('filechooser'),
    supportingDocumentsUploadArea(page).click(),
  ]);
  await chooser.setFiles(filePath);
  await page.waitForTimeout(1500);
}

test.describe('ADMINPORTAL-102827 — Upload Supporting Documents', () => {
  test.describe.configure({ mode: 'serial' });

  test('TC-01: Login as kamogelos', async ({ page }) => {
    await loginAsKamogelo(page);
    // ASSERT (BLOCKING) URL no longer contains /login
    await expect(page).not.toHaveURL(/login/i);
  });

  test('TC-02: Complete Job Information Summary and advance to Output and Competencies', async ({ page }) => {
    const refNo = uniqueRef();
    await loginAsKamogelo(page);
    await goToMyItems(page);
    await openJobPostingForm(page);
    // STEP: fill Job Information Summary (ADO steps 3-11)
    await fillJobInformationSummary(page, refNo);
    // STEP: click Next (ADO step 12)
    await nextButton(page).click();
    await page.waitForLoadState('networkidle').catch(() => {});
    await page.waitForTimeout(1200);
    // ASSERT (BLOCKING) Output and Competencies step is active
    await expect(page.getByText('Output and Competencies', { exact: true })).toBeVisible();
  });

  test('TC-03: Complete Output and Competencies and advance to Documentation', async ({ page }) => {
    const refNo = uniqueRef();
    await loginAsKamogelo(page);
    await goToMyItems(page);
    await openJobPostingForm(page);
    await fillJobInformationSummary(page, refNo);
    await nextButton(page).click();
    await page.waitForLoadState('networkidle').catch(() => {});
    await page.waitForTimeout(1200);
    // STEP: fill Output and Competencies (ADO steps 13-16), click Next (ADO step 17)
    await fillOutputAndCompetencies(page);
    await nextButton(page).click();
    await page.waitForLoadState('networkidle').catch(() => {});
    await page.waitForTimeout(1200);
    // ASSERT (BLOCKING) Documentation step is active
    await expect(page.getByText('Documentation', { exact: true }).first()).toBeVisible();
  });

  test('TC-04: Click inside the Supporting Documents upload box', async ({ page }) => {
    const refNo = uniqueRef();
    await advanceToDocumentationStep(page, refNo);
    // STEP: CLICK the Supporting Documents upload area, expect a file chooser
    const [chooser] = await Promise.all([
      page.waitForEvent('filechooser'),
      supportingDocumentsUploadArea(page).click(),
    ]);
    // ASSERT (BLOCKING) a file chooser dialog opened
    expect(chooser).toBeTruthy();
    await chooser.setFiles(BLANK_DOC);
    await page.waitForTimeout(1500);
  });

  test('TC-05: Select a valid file and upload', async ({ page }) => {
    const refNo = uniqueRef();
    await advanceToDocumentationStep(page, refNo);
    // STEP: SELECT blank document.pdf in the file chooser
    await uploadSupportingDocument(page, BLANK_DOC);
    // ASSERT (BLOCKING) file appears in the Supporting Documents list
    await expect(page.getByText(BLANK_DOC_NAME, { exact: false }).first()).toBeVisible();
  });

  test('TC-06: Assert file appears in the Supporting Documents list', async ({ page }) => {
    const refNo = uniqueRef();
    await advanceToDocumentationStep(page, refNo);
    await uploadSupportingDocument(page, BLANK_DOC);
    // ASSERT (BLOCKING) uploaded file name is displayed in the list
    await expect(page.getByText(BLANK_DOC_NAME, { exact: false }).first()).toBeVisible();
    await expect(page.locator('.sha-upload-replace-control').first()).toBeVisible();
    await expect(page.locator('.sha-upload-remove-control').first()).toBeVisible();
  });

  test('TC-07: Verify no error message is displayed', async ({ page }) => {
    const refNo = uniqueRef();
    await advanceToDocumentationStep(page, refNo);
    await uploadSupportingDocument(page, BLANK_DOC);
    // ASSERT (BLOCKING) no error/warning notification is shown
    await expect(page.locator('.ant-message-error, .ant-notification-notice-error')).toHaveCount(0);
  });

  test('TC-08: Click the newly enabled Next button', async ({ page }) => {
    const refNo = uniqueRef();
    await advanceToDocumentationStep(page, refNo);
    await uploadSupportingDocument(page, BLANK_DOC);
    // ASSERT (BLOCKING) Next is enabled after upload
    await expect(nextButton(page)).toBeEnabled();
    // STEP: CLICK the Next button
    await nextButton(page).click();
    await page.waitForLoadState('networkidle').catch(() => {});
    await page.waitForTimeout(1200);
    // ASSERT (BLOCKING) Confirmation step is active
    await expect(page.getByText('Confirmation', { exact: true }).first()).toBeVisible();
  });

  test('TC-09: Replace the uploaded document', async ({ page }) => {
    const refNo = uniqueRef();
    await advanceToDocumentationStep(page, refNo);
    await uploadSupportingDocument(page, BLANK_DOC);
    await expect(page.getByText(BLANK_DOC_NAME, { exact: false }).first()).toBeVisible();

    // STEP: CLICK the Replace control, SELECT replacement document.pdf
    const [chooser] = await Promise.all([
      page.waitForEvent('filechooser'),
      page.locator('.sha-upload-replace-control').first().click(),
    ]);
    await chooser.setFiles(REPLACEMENT_DOC);
    await page.waitForTimeout(1500);

    // ASSERT (BLOCKING) replacement file is shown, original is gone
    await expect(page.getByText(REPLACEMENT_DOC_NAME, { exact: false }).first()).toBeVisible();
    await expect(page.getByText(BLANK_DOC_NAME, { exact: false })).toHaveCount(0);
  });

  test('TC-10: Delete the uploaded document', async ({ page }) => {
    const refNo = uniqueRef();
    await advanceToDocumentationStep(page, refNo);
    await uploadSupportingDocument(page, BLANK_DOC);

    // STEP: CLICK the Remove control
    await page.locator('.sha-upload-remove-control').first().click();
    await page.waitForTimeout(600);
    // ASSERT (BLOCKING) "Delete Attachment" confirmation modal is shown
    await expect(page.getByText('Delete Attachment', { exact: true })).toBeVisible();
    await expect(page.getByText('Are you sure you want to delete this attachment?')).toBeVisible();

    // STEP: CLICK "Yes" to confirm
    await page.getByRole('button', { name: 'Yes' }).click();
    await page.waitForTimeout(1200);
    // ASSERT (BLOCKING) attachment removed from the list
    await expect(page.getByText(BLANK_DOC_NAME, { exact: false })).toHaveCount(0);
  });
});
