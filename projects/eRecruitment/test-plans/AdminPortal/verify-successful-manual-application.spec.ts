// AUTO-RECORDED from test-plans/AdminPortal/verify-successful-manual-application.md
// Source: Azure DevOps project pd-recruitment, test case #106172 "Verify
// successful manual application" (work item rev 3). The .md plan is
// canonical.
//
// !!! DO NOT RUN THIS SPEC CASUALLY !!!
// Confirmed live 2026-08-05: the "Add New Application" wizard persists a
// new, PERMANENT Person/Candidate record to the backend the moment you
// click "Next" past step 1 (Personal Details) — long before the final
// "Done" on step 6. There is NO way to resume a partial run and NO Delete
// capability anywhere in the UI for these records (checked the Candidates
// list and the candidate detail page — both confirmed 0 delete icons).
// Every run of this spec that gets past TC-05 creates one more permanent
// record in shared QA data. Get explicit confirmation before re-running,
// same as any other real/stateful action in this project — and prefer
// running all the way through to a real "Done" over aborting partway, so
// at minimum you get one more valid completed application rather than
// another orphaned draft. See
// test-reports/bugs/2026-08-05-add-application-no-delete-or-resume-capability.md.
//
// This spec is written as ONE continuous test (not one test() per TC like
// every other spec in this project) specifically BECAUSE Playwright gives
// each test() its own fresh page — the standard "each TC redoes all prior
// steps from scratch" pattern used everywhere else would create a new
// stray candidate PER TC here. Do not refactor this into multiple test()
// blocks without re-reading the warning above.
//
// Known selector traps discovered live and encoded below:
// - The SA ID number field validates a real Luhn-variant checksum
//   client-side; an arbitrary 13-digit string is rejected with "Invalid ID
//   Number". A valid one must be computed (see NEW_ID below).
// - Date pickers (Date Obtained, Employment Start/End Date) reject
//   present/future dates — only genuinely past days are selectable. Since
//   "today" varies by run, this spec uses day 1 (and day 3 for Employment
//   End Date) of the currently-displayed calendar month, which is safely
//   in the past whenever this is run same-month; if run near/at day 1-3
//   of a month, adjust or navigate the calendar back a month first.
// - Experience row date-picker inputs count as plain <input> elements in
//   a generic `input` query, shifting field indices — column order is
//   0=Job Title, 1=Employer, 2=Start Date, 3=End Date, 4=Reason For
//   Leaving (same trap as ADMINPORTAL-106550).
// - `div[role="row"]` row-finding must use `filter({ has: <locator> })`
//   for fields identified by placeholder (e.g. input[placeholder="Select
//   date"]) — `filter({ hasText })` only matches rendered TEXT content,
//   not placeholder attributes, and silently resolves to 0 rows.
// - Document uploads (Z83/CV/Other Supporting Documents) on step 5 are
//   NOT enforced — this run's automation had a timing bug that skipped
//   them entirely, and the wizard still completed successfully to "Done"
//   with status Pre-Screened regardless.
//
// SECOND RUN (2026-08-06): re-run with explicit requester confirmation to
// create a fresh application for ADMINPORTAL-106398. Last Name is set
// directly to "Edit Last Name" (LAST_NAME constant) instead of
// "CompleteFlow" + a later rename, and NEW_ID was recomputed to a fresh,
// unused SA ID checksum, since the first run's ID now belongs to an
// existing candidate record.

import { test, expect, Page } from '@playwright/test';
import path from 'path';

const APP_URL = 'https://pd-recruitment-adminportal-qa.shesha.app/';
const RECRUITER = { user: 'Kwenas', password: '123qwe' };
const TARGET_REF_NO = '40';
const NEW_ID = '8806145432086'; // valid SA ID checksum, computed offline (see .md plan) — distinct from all prior runs' IDs (9401155123095, 9204225432086 orphaned draft, 8907115432088 Rejected via 106398, 9103235432088 Rejected via 106399), which all belong to existing candidate records
const LAST_NAME = 'Verify not appointed'; // per requester: name this application after the test case it's created for (ADMINPORTAL-106400), set directly at creation instead of "CompleteFlow"/"Edit Last Name" + a later rename step
const BLANK_DOC = path.resolve(__dirname, 'fixtures', 'blank document.pdf');

test.describe('ADMINPORTAL-106172 — Verify successful manual application', () => {
  test('Full wizard: create a new candidate application end-to-end (REAL, PERMANENT — see header warning)', async ({ page }) => {
    test.setTimeout(300_000);

    // ===== TC-01: Login as Kwena =====
    await page.goto(`${APP_URL}login`, { waitUntil: 'domcontentloaded' });
    await page.waitForSelector('input[placeholder="Username"]', { timeout: 45_000 });
    await page.locator('input[placeholder="Username"]').fill(RECRUITER.user);
    await page.locator('input[placeholder="Password"]').fill(RECRUITER.password);
    await page.getByRole('button', { name: 'Sign In' }).click();
    await page.waitForURL(url => !url.href.includes('/login'), { timeout: 30_000 });
    await page.waitForLoadState('networkidle').catch(() => {});
    await page.waitForTimeout(1000);
    await expect(page).not.toHaveURL(/login/i);

    // ===== TC-02: Navigate to Job Posting Dashboard, open Ref No 40 =====
    await page.locator('.anticon-menu-fold, .anticon-menu-unfold').first().click();
    await page.waitForTimeout(600);
    await page.getByText('Recruitment', { exact: false }).first().click();
    await page.waitForTimeout(600);
    await page.getByText('Job Posting Dashboard', { exact: false }).first().click();
    await page.waitForLoadState('networkidle').catch(() => {});
    await page.waitForTimeout(2000);
    await page.mouse.move(900, 400);
    await page.mouse.move(1200, 700);
    await page.waitForTimeout(300);

    const searchInput = page.locator('input').first();
    await searchInput.fill(TARGET_REF_NO);
    await page.keyboard.press('Enter');
    await page.waitForTimeout(1500);
    const jpRow = page.locator('div[role="row"]').filter({ has: page.getByText(TARGET_REF_NO, { exact: true }) }).first();
    await jpRow.locator('a, [class*="link"]').first().click();
    await page.waitForLoadState('networkidle').catch(() => {});
    await page.waitForTimeout(2000);
    await expect(page.getByText('Job Reference', { exact: false }).first()).toBeVisible();
    await expect(page.getByText(TARGET_REF_NO, { exact: true }).first()).toBeVisible();

    // ===== TC-03: Click "Add New Application" =====
    await page.mouse.wheel(0, 3000);
    await page.waitForTimeout(1000);
    await page.getByText('Add New Application', { exact: false }).first().click();
    await page.waitForLoadState('networkidle').catch(() => {});
    await page.waitForTimeout(1500);
    const modal = page.locator('.ant-modal-content').first();
    await expect(modal.getByText('Personal Details', { exact: true }).first()).toBeVisible();

    async function fillByLabel(labelText: string, value: string) {
      const label = modal.locator(`label:has-text("${labelText}")`).first();
      const item = label.locator('xpath=../../..');
      await item.locator('input').first().fill(value);
    }
    function itemByLabel(labelText: string) {
      const label = modal.locator(`label:has-text("${labelText}")`).first();
      return label.locator('xpath=../../..');
    }
    async function selectByLabel(labelText: string, optionText: string) {
      const item = itemByLabel(labelText);
      await item.locator('.ant-select').first().click();
      await page.waitForTimeout(500);
      await page.locator('.ant-select-dropdown:not(.ant-select-dropdown-hidden) .ant-select-item-option', { hasText: optionText }).first().click();
      await page.waitForTimeout(300);
    }
    function visibleCalendarDay(day: number) {
      const exact = new RegExp(`^${day}$`);
      return page.locator('.ant-picker-dropdown:not(.ant-picker-dropdown-hidden) .ant-picker-cell-in-view').filter({ hasText: exact });
    }
    async function nextButton() {
      return modal.getByRole('button', { name: 'Next', exact: true }).first();
    }

    // ===== TC-04: Populate Personal Details =====
    await fillByLabel('First Name', 'AutoTest');
    await fillByLabel('Last Name', LAST_NAME);
    await fillByLabel('Identity Number', NEW_ID);
    await page.waitForTimeout(300);
    // Email Address / Mobile Number are optional (no asterisk) but exist
    // on this step — confirmed live 2026-08-06 that the first run left
    // both blank, requiring separate later edits to populate. Fill them
    // directly at creation time per requester feedback.
    await fillByLabel('Email Address', 'edit.lastname@test.com');
    await fillByLabel('Mobile Number', '0821234567');
    await selectByLabel('Race', 'African');
    await selectByLabel('Gender', 'Male');
    const hdItem = itemByLabel('Has Disability');
    await hdItem.getByText('Yes', { exact: true }).first().click();
    await page.waitForTimeout(500);
    await fillByLabel('Nature Of Disability', 'Test disability note');
    await fillByLabel('Province', 'Gauteng');
    await fillByLabel('City', 'Pretoria');
    // ASSERT (BLOCKING) no ID validation error before proceeding
    await expect(modal.getByText('Invalid ID Number', { exact: false })).toHaveCount(0);

    // ===== TC-05: Click Next -> Education (REAL, PERMANENT WRITE HAPPENS HERE) =====
    await (await nextButton()).click();
    await page.waitForLoadState('networkidle').catch(() => {});
    await page.waitForTimeout(1500);
    await expect(modal.getByText('Formal Qualification', { exact: false }).first()).toBeVisible();

    // ===== TC-06: Populate Education row =====
    const eduRow = modal.locator('div[role="row"]').filter({ hasText: /press to upload/i }).first();
    await eduRow.locator('input').nth(0).fill('Test University');
    await eduRow.locator('input').nth(1).fill('BSc Automation');
    await page.waitForTimeout(300);
    await eduRow.locator('.ant-select').nth(0).click();
    await page.waitForTimeout(500);
    await page.locator('.ant-select-dropdown:not(.ant-select-dropdown-hidden) .ant-select-item-option').first().click();
    await page.waitForTimeout(400);
    await eduRow.locator('.ant-select').nth(1).click();
    await page.waitForTimeout(500);
    await page.locator('.ant-select-dropdown:not(.ant-select-dropdown-hidden) .ant-select-item-option', { hasText: 'Complete' }).first().click();
    await page.waitForTimeout(500);

    const addIconInEduRow = eduRow.locator('.anticon-plus, .anticon-plus-circle').first();
    // STEP: click Add prematurely (Date Obtained still empty) — expect
    // client-side validation to reject it (ADO step 23)
    await addIconInEduRow.click().catch(() => {});
    await page.waitForTimeout(800);

    const dateInput = eduRow.locator('input[placeholder="Select date"]').first();
    await dateInput.click();
    await page.waitForTimeout(500);
    await visibleCalendarDay(1).first().click();
    await page.waitForTimeout(500);

    const certTrigger = eduRow.getByText(/press to upload/i).first();
    const [chooser1] = await Promise.all([
      page.waitForEvent('filechooser'),
      certTrigger.click(),
    ]);
    await chooser1.setFiles(BLANK_DOC);
    await page.waitForTimeout(1500);

    await addIconInEduRow.click();
    await page.waitForTimeout(1200);
    // ASSERT (BLOCKING) the qualification row was added (Edit/Delete icons now present).
    // NOTE: `eduRow` re-resolves lazily and, after Add, a NEW empty
    // template row (still containing "press to upload") appears ABOVE
    // the just-added row — so `eduRow.locator(...)` now points at the
    // wrong (empty) row. Locate the actual added row by its distinctive
    // Qualification Name text instead (confirmed live 2026-08-06).
    const addedEduRow = modal.locator('div[role="row"]').filter({ hasText: 'BSc Automation' }).first();
    await expect(addedEduRow.locator('.anticon-edit, .anticon-delete').first()).toBeVisible();

    await (await nextButton()).click();
    await page.waitForLoadState('networkidle').catch(() => {});
    await page.waitForTimeout(1500);
    await expect(modal.getByText('Work Experience', { exact: false }).first()).toBeVisible();

    // ===== TC-07: Populate Experience row =====
    const expRow = modal.locator('div[role="row"]').filter({ has: page.locator('input[placeholder="Select date"]') }).first();
    await expRow.locator('input').nth(0).fill('QA Automation Engineer');
    await expRow.locator('input').nth(1).fill('Test Employer Pty Ltd');
    await page.waitForTimeout(300);
    const expDateInputs = expRow.locator('input[placeholder="Select date"]');
    await expDateInputs.nth(0).click();
    await page.waitForTimeout(500);
    await visibleCalendarDay(1).first().click();
    await page.waitForTimeout(500);
    await expDateInputs.nth(1).click();
    await page.waitForTimeout(500);
    await visibleCalendarDay(3).first().click();
    await page.waitForTimeout(500);
    // Column order trap (see header comment): Reason For Leaving is nth(4)
    await expRow.locator('input').nth(4).fill('Career growth');

    const addIconInExpRow = expRow.locator('.anticon-plus, .anticon-plus-circle').first();
    await addIconInExpRow.click();
    await page.waitForTimeout(1200);

    const intExtItem = itemByLabel('Internal/External');
    await intExtItem.locator('.ant-select').first().click();
    await page.waitForTimeout(500);
    await page.locator('.ant-select-dropdown:not(.ant-select-dropdown-hidden) .ant-select-item-option').first().click();
    await page.waitForTimeout(400);

    await (await nextButton()).click();
    await page.waitForLoadState('networkidle').catch(() => {});
    await page.waitForTimeout(1500);
    await expect(modal.getByText('Category Details', { exact: false }).first()).toBeVisible();

    // ===== TC-08: Category & Comments =====
    const categoryItem = itemByLabel('Final Category');
    await categoryItem.locator('.ant-select').first().click();
    await page.waitForTimeout(500);
    await page.locator('.ant-select-dropdown:not(.ant-select-dropdown-hidden) .ant-select-item-option').first().click();
    await page.waitForTimeout(400);
    const commentsItem = itemByLabel('Comments');
    await commentsItem.locator('textarea, input').first().fill('Automated test application for ADMINPORTAL-106172.');

    await (await nextButton()).click();
    await page.waitForLoadState('networkidle').catch(() => {});
    // Documents step needs a longer settle time — a rushed check here
    // previously skipped all 3 upload triggers (see header comment).
    await page.waitForTimeout(2500);

    // ===== TC-09: Documents (best-effort; not blocking per confirmed app behavior) =====
    const uploadTriggers = modal.getByText(/click or drag file|press to upload/i);
    const uploadCount = await uploadTriggers.count();
    for (let i = 0; i < uploadCount; i++) {
      const [chooser] = await Promise.all([
        page.waitForEvent('filechooser'),
        uploadTriggers.nth(i).click(),
      ]);
      await chooser.setFiles(BLANK_DOC);
      await page.waitForTimeout(1200);
    }

    await (await nextButton()).click();
    await page.waitForLoadState('networkidle').catch(() => {});
    await page.waitForTimeout(1500);
    await expect(modal.getByText('AutoTest', { exact: false }).first()).toBeVisible();

    // ===== TC-10: Confirmation -> Done (FINAL REAL SUBMISSION) =====
    const doneBtn = modal.getByRole('button', { name: 'Done', exact: true }).first();
    await doneBtn.click();
    await page.waitForLoadState('networkidle').catch(() => {});
    await page.waitForTimeout(2500);
    // ASSERT (BLOCKING) success message and the new row with Pre Screened status
    await expect(page.getByText('Successfully updated the job application', { exact: false }).first()).toBeVisible();
    await expect(page.getByText(LAST_NAME, { exact: false }).first()).toBeVisible();
    await expect(page.getByText('Pre Screened', { exact: false }).first()).toBeVisible();
  });
});
