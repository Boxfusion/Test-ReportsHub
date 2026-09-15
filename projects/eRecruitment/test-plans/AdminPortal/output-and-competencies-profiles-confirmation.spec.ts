// AUTO-RECORDED from test-plans/AdminPortal/output-and-competencies-profiles-confirmation.md
// Source: Azure DevOps project pd-recruitment, test case #102834 "Output
// and Competencies Profiles" (steps supplied via the same shared-step block
// as #102822/#102826/#102827/#102830, work item rev 6). Note: the raw ADO
// step order is 3..21, 23, 22, 24, 25, 26 — step 23 ("Click Next button" ->
// Confirmation) is listed BEFORE step 22 ("Click on Output and
// Competencies" -> the Confirmation tab) in document order, even though its
// numeric id is higher. This spec follows document order (Next, then click
// the tab), which also matches what the UI actually requires.
// The .md plan is canonical. AI-repair will patch failing lines in this file.
// Do not hand-edit unless you are also updating the .md plan.
//
// STATEFUL/DESTRUCTIVE: each TC re-runs the full flow from login (this hub's
// serial-TC convention) and creates a real Draft JobPosting record in the
// shared QA dataset. A fresh unique Job Reference Number is generated per
// run to avoid colliding with other testers' seeded data.
//
// Steps 3-21 are shared with #102827/#102830 — see
// AdminPortal/job-information-summary-confirmation.spec.ts for the DOM
// notes on that portion of the flow. Confirmed live on 2026-08-04: the
// Confirmation step (stepper 4) renders 4 tabs — the ADO test case's
// "Output and Competencies Profiles" tab is labelled "Output and Competency
// Profiles" (singular "Competency") in the actual UI. Clicking it reveals a
// "Competency Profile" panel with Requirements / Required Skills and
// Competencies / Duties, each rendered as a bold label followed by a
// sibling value node (same read-only pattern as the Job Information
// Summary tab — see confirmationValue() below).

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
const CLOSING_DAY = '22';
const BLANK_DOC = path.resolve(__dirname, 'fixtures', 'blank document.pdf');
const BLANK_DOC_NAME = 'blank document.pdf';

function uniqueRef(): string {
  return `CJP-102834-${Date.now()}-${Math.floor(Math.random() * 1000)}`;
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

function confirmationValue(page: Page, labelText: string): Locator {
  return page.locator('span, div', { hasText: new RegExp(`^${labelText}$`) }).locator('xpath=following-sibling::*[1]').first();
}

async function loginAsKamogelo(page: Page) {
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
  await page.locator('.ant-picker-cell-in-view', { hasText: CLOSING_DAY }).first().click();
  await page.waitForTimeout(400);
}

async function fillOutputAndCompetencies(page: Page) {
  await fieldTextarea(page, 'Requirements').fill(REQUIREMENTS);
  await fieldTextarea(page, 'Required Skills and Competencies').fill(REQUIRED_SKILLS);
  await fieldTextarea(page, 'Duties').fill(DUTIES);
}

async function uploadSupportingDocument(page: Page, filePath: string) {
  const [chooser] = await Promise.all([
    page.waitForEvent('filechooser'),
    supportingDocumentsUploadArea(page).click(),
  ]);
  await chooser.setFiles(filePath);
  await page.waitForTimeout(1500);
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

async function advanceToConfirmationStep(page: Page, refNo: string) {
  await advanceToDocumentationStep(page, refNo);
  await uploadSupportingDocument(page, BLANK_DOC);
  await nextButton(page).click();
  await page.waitForLoadState('networkidle').catch(() => {});
  await page.waitForTimeout(1500);
}

async function openOutputAndCompetencyTab(page: Page) {
  await page.getByText('Output and Competency Profiles', { exact: true }).click();
  await page.waitForTimeout(800);
}

test.describe('ADMINPORTAL-102834 — Output and Competencies Profiles', () => {
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
    await fillJobInformationSummary(page, refNo);
    await nextButton(page).click();
    await page.waitForLoadState('networkidle').catch(() => {});
    await page.waitForTimeout(1200);
    // ASSERT (BLOCKING) Output and Competencies step is active
    await expect(page.getByText('Output and Competencies', { exact: true })).toBeVisible();
  });

  test('TC-03: Complete Output and Competencies and advance to Documentation', async ({ page }) => {
    const refNo = uniqueRef();
    await advanceToDocumentationStep(page, refNo);
    // ASSERT (BLOCKING) Documentation step is active
    await expect(page.getByText('Documentation', { exact: true }).first()).toBeVisible();
  });

  test('TC-04: Click inside the Supporting Documents upload box', async ({ page }) => {
    const refNo = uniqueRef();
    await advanceToDocumentationStep(page, refNo);
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
    await uploadSupportingDocument(page, BLANK_DOC);
    // ASSERT (BLOCKING) file appears in the Supporting Documents list
    await expect(page.getByText(BLANK_DOC_NAME, { exact: false }).first()).toBeVisible();
  });

  test('TC-06: Assert file appears in the Supporting Documents list', async ({ page }) => {
    const refNo = uniqueRef();
    await advanceToDocumentationStep(page, refNo);
    await uploadSupportingDocument(page, BLANK_DOC);
    await expect(page.getByText(BLANK_DOC_NAME, { exact: false }).first()).toBeVisible();
  });

  test('TC-07: Verify no error message is displayed', async ({ page }) => {
    const refNo = uniqueRef();
    await advanceToDocumentationStep(page, refNo);
    await uploadSupportingDocument(page, BLANK_DOC);
    // ASSERT (BLOCKING) no error/warning notification is shown
    await expect(page.locator('.ant-message-error, .ant-notification-notice-error')).toHaveCount(0);
  });

  test('TC-08: Click Next button', async ({ page }) => {
    const refNo = uniqueRef();
    await advanceToConfirmationStep(page, refNo);
    // ASSERT (BLOCKING) Confirmation step is active
    await expect(page.getByText('Confirmation', { exact: true }).first()).toBeVisible();
  });

  test('TC-09: Click on Output and Competencies tab', async ({ page }) => {
    const refNo = uniqueRef();
    await advanceToConfirmationStep(page, refNo);
    // STEP: CLICK the "Output and Competency Profiles" tab
    await openOutputAndCompetencyTab(page);
    // ASSERT (BLOCKING) Competency Profile panel is displayed
    await expect(page.getByText('Competency Profile', { exact: true })).toBeVisible();
    await expect(confirmationValue(page, 'Requirements')).toBeVisible();
  });

  test('TC-10: Check if the Requirements field is populated', async ({ page }) => {
    const refNo = uniqueRef();
    await advanceToConfirmationStep(page, refNo);
    await openOutputAndCompetencyTab(page);
    // ASSERT (BLOCKING) Confirmation's Requirements matches what was typed
    await expect(confirmationValue(page, 'Requirements')).toHaveText(REQUIREMENTS);
  });

  test('TC-11: Check that Required Skills and Competencies is populated', async ({ page }) => {
    const refNo = uniqueRef();
    await advanceToConfirmationStep(page, refNo);
    await openOutputAndCompetencyTab(page);
    // ASSERT (BLOCKING) Confirmation's Required Skills and Competencies matches what was typed
    await expect(confirmationValue(page, 'Required Skills and Competencies')).toHaveText(REQUIRED_SKILLS);
  });

  test('TC-12: Check that Duties field is populated', async ({ page }) => {
    const refNo = uniqueRef();
    await advanceToConfirmationStep(page, refNo);
    await openOutputAndCompetencyTab(page);
    // ASSERT (BLOCKING) Confirmation's Duties matches what was typed
    await expect(confirmationValue(page, 'Duties')).toHaveText(DUTIES);
  });
});
