// AUTO-RECORDED from test-plans/Profile/verify-background-information.md
// Source: Azure DevOps test plan #99437, suite #104586, test case #104599
// The .md plan is canonical. AI-repair will patch failing lines in this file.
// Do not hand-edit unless you are also updating the .md plan.
//
// Selectors were captured live against the QA environment on 2026-07-06.
// Background Information has 4 sub-tabs; the 4th (Employment Restrictions) is
// visually overflowed behind a "..." menu at typical widths, so it must be
// opened via the ant-tabs-nav-more dropdown rather than clicked directly.
// Internal/External is an Ant Design select with the same already-selected-
// is-not-clickable quirk documented in the other Profile specs.

import { test, expect, Page, Locator } from '@playwright/test';

const APP_URL = 'https://pd-recruitment-publicportal-1-qa.shesha.app/';
const APPLICANT = { user: 'Fred', password: 'Metaganemr%03' };
const INT_EXT_LABELS = ['External Applicant', 'Current Employee', 'Past Employee', 'Recruitment Agency'];

async function loginAsFred(page: Page) {
  await page.goto(`${APP_URL}login`);
  await page.locator('input[type="text"]').first().fill(APPLICANT.user);
  await page.locator('input[type="password"]').first().fill(APPLICANT.password);
  await page.getByRole('button', { name: /sign in/i }).click();
  await page.waitForURL(url => !url.href.includes('/login'), { timeout: 30000 });
  await page.waitForLoadState('networkidle');
}

async function goToBackgroundInformation(page: Page) {
  await page.getByRole('link', { name: 'Manage Profile' }).click();
  await page.waitForLoadState('networkidle');
  await page.getByRole('button', { name: 'Background Information' }).click();
  await page.waitForTimeout(1500);
}

async function clickBgTab(page: Page, name: string) {
  const directTab = page.getByRole('tab', { name, exact: true });
  if (await directTab.isVisible().catch(() => false)) {
    await directTab.click();
  } else {
    await page.locator('.ant-tabs-nav-more').click();
    await page.waitForTimeout(500);
    await page.getByLabel('expanded dropdown').getByText(name, { exact: true }).click();
  }
  await page.waitForTimeout(1200);
}

function fieldInput(page: Page, label: string): Locator {
  // .last(): some labels also appear as a substring inside earlier instructional
  // paragraphs (e.g. "Date Reg. No provide date..."), so anchor to the closest
  // (last) matching text node before the real field.
  return page.getByText(label, { exact: false }).last().locator('xpath=following::input[1]');
}

function antCombo(page: Page, label: string): Locator {
  return page.getByText(label, { exact: false }).locator('xpath=following::*[contains(concat(" ", normalize-space(@class), " "), " ant-select ")][1]');
}

async function selectAntOption(page: Page, combo: Locator, label: string) {
  await combo.click();
  await page.waitForTimeout(300);
  await combo.locator('input').focus();
  await page.keyboard.press('Control+A');
  await page.keyboard.press('Backspace');
  await page.keyboard.type(label);
  await page.waitForTimeout(400);
  await page.getByText(label, { exact: true }).last().click();
  await page.waitForTimeout(1000);
}

async function ensureAntOption(page: Page, combo: Locator, label: string, knownLabels: string[]) {
  const selectionItem = combo.locator('.ant-select-selection-item');
  let current = '';
  for (let i = 0; i < 30; i++) {
    current = (await selectionItem.innerText().catch(() => '')).trim();
    if (knownLabels.includes(current)) break;
    await page.waitForTimeout(300);
  }
  if (current === label) {
    const away = knownLabels.find(l => l !== label)!;
    await selectAntOption(page, combo, away);
  }
  await selectAntOption(page, combo, label);
}

// Locates the Yes/No radio pair immediately following a question's label text,
// and the conditional detail field that follows the "No" radio.
function yesNoQuestion(page: Page, questionLabel: string) {
  const question = page.getByText(questionLabel, { exact: false });
  const yesRadio = question.locator('xpath=following::input[@type="radio"][1]');
  const noRadio = question.locator('xpath=following::input[@type="radio"][2]');
  const detailField = noRadio.locator('xpath=following::*[self::textarea or self::input][1]');
  return { yesRadio, noRadio, detailField };
}

test.describe('PROFILE-104599 — Verify Background Information', () => {
  test.describe.configure({ mode: 'serial' });

  test('TC-01: Login as Fred', async ({ page }) => {
    // STEP 1-5: NAVIGATE, TYPE Username/Password, CLICK Sign In
    await loginAsFred(page);
    // ASSERT (BLOCKING) URL no longer contains /login and Dashboard is visible
    await expect(page).not.toHaveURL(/login/i);
    await expect(page.getByText('Your Dashboard')).toBeVisible({ timeout: 30000 });
  });

  test('TC-02: Click on Background Information tab', async ({ page }) => {
    await loginAsFred(page);
    // STEP: CLICK Manage Profile, then CLICK the Background Information step
    await goToBackgroundInformation(page);
    // ASSERT (BLOCKING) Background information heading visible; first sub-tab selected
    await expect(page.getByRole('heading', { name: 'Background information' })).toBeVisible({ timeout: 15000 });
    await expect(page.getByRole('tab', { name: 'Employment Preferences & History' })).toHaveAttribute('aria-selected', 'true');
  });

  test('TC-03: Relocate / extra hours radios', async ({ page }) => {
    await loginAsFred(page);
    await goToBackgroundInformation(page);
    const relocate = yesNoQuestion(page, 'Are you willing to relocate?');
    const extraHours = yesNoQuestion(page, 'Are you willing to work extra hours?');
    // STEP: CLICK No then Yes on both questions
    await relocate.noRadio.click();
    await page.waitForTimeout(400);
    await relocate.yesRadio.click();
    await page.waitForTimeout(400);
    await extraHours.noRadio.click();
    await page.waitForTimeout(400);
    await extraHours.yesRadio.click();
    await page.waitForTimeout(400);
    // ASSERT (BLOCKING) both Yes radios are checked
    await expect(relocate.yesRadio).toBeChecked();
    await expect(extraHours.yesRadio).toBeChecked();
  });

  test('TC-04: Internal/External — External Applicant hides Employee Number', async ({ page }) => {
    await loginAsFred(page);
    await goToBackgroundInformation(page);
    const intExtCombo = antCombo(page, 'Internal/External');
    // STEP: CLICK dropdown, SELECT "External Applicant"
    await ensureAntOption(page, intExtCombo, 'External Applicant', INT_EXT_LABELS);
    // ASSERT (BLOCKING) Employee Number field is hidden
    await expect(page.getByText('Employee Number', { exact: false })).toBeHidden();
  });

  test('TC-05: Internal/External — Current Employee enables Employee Number', async ({ page }) => {
    await loginAsFred(page);
    await goToBackgroundInformation(page);
    const intExtCombo = antCombo(page, 'Internal/External');
    // STEP: CLICK dropdown, SELECT "Current Employee"
    await ensureAntOption(page, intExtCombo, 'Current Employee', INT_EXT_LABELS);
    const employeeNumberField = fieldInput(page, 'Employee Number');
    // ASSERT (BLOCKING) field visible and enabled
    await expect(employeeNumberField).toBeVisible();
    await expect(employeeNumberField).toBeEnabled();
    // STEP: TYPE an employee number
    await employeeNumberField.fill('EMP12345');
    // ASSERT (BLOCKING) field contains the typed value
    await expect(employeeNumberField).toHaveValue('EMP12345');
  });

  test('TC-06: Previously employed in Public Service + notice period', async ({ page }) => {
    await loginAsFred(page);
    await goToBackgroundInformation(page);
    const prevEmployed = yesNoQuestion(page, 'Were you previously employed in the Public Service?');
    // STEP: CLICK No then Yes so the field genuinely re-enables
    await prevEmployed.noRadio.click();
    await page.waitForTimeout(500);
    await prevEmployed.yesRadio.click();
    await page.waitForTimeout(500);
    // ASSERT (BLOCKING) department field enabled after Yes
    await expect(prevEmployed.detailField).toBeVisible();
    await expect(prevEmployed.detailField).toBeEnabled();
    // STEP: TYPE a department name
    await prevEmployed.detailField.fill('Department of Test Affairs');
    await expect(prevEmployed.detailField).toHaveValue('Department of Test Affairs');
    // STEP: TYPE a notice period in days
    const noticeField = fieldInput(page, 'How much notice must you serve');
    await noticeField.fill('30');
    await expect(noticeField).toHaveValue('30');
  });

  test('TC-07: Criminal & Disciplinary Record tab', async ({ page }) => {
    await loginAsFred(page);
    await goToBackgroundInformation(page);
    // STEP: CLICK the Criminal & Disciplinary Record tab
    await clickBgTab(page, 'Criminal & Disciplinary Record');

    const questions = [
      ['Have you ever been convicted or found guilty of a criminal offence', 'Convicted details'],
      ['Do you have an pending criminal case against you?', 'Pending criminal case details'],
      ['Have you ever been dismissed for misconduct from the Public Service?', 'Dismissed misconduct details'],
      ['Do you have an pending disciplinary case against you?', 'Pending disciplinary case details'],
    ] as const;

    for (const [label, value] of questions) {
      const q = yesNoQuestion(page, label);
      // STEP: CLICK No then Yes on this question, TYPE details
      await q.noRadio.click();
      await page.waitForTimeout(400);
      await q.yesRadio.click();
      await page.waitForTimeout(400);
      await expect(q.detailField).toBeVisible();
      await expect(q.detailField).toBeEnabled();
      await q.detailField.fill(value);
      // ASSERT (BLOCKING) detail field contains the typed value
      await expect(q.detailField).toHaveValue(value);
    }
  });

  test('TC-08: Professional & Legal Disclosures tab', async ({ page }) => {
    await loginAsFred(page);
    await goToBackgroundInformation(page);
    // STEP: CLICK the Professional & Legal Disclosures tab
    await clickBgTab(page, 'Professional & Legal Disclosures');

    const resigned = yesNoQuestion(page, 'Have you resigned from a recent job pending any disciplinary proceeding against you?');
    // STEP: CLICK No then Yes, TYPE details
    await resigned.noRadio.click();
    await page.waitForTimeout(400);
    await resigned.yesRadio.click();
    await page.waitForTimeout(400);
    await resigned.detailField.fill('Resignation details');
    // ASSERT (BLOCKING) detail field contains the typed value
    await expect(resigned.detailField).toHaveValue('Resignation details');

    // STEP: CLICK Yes on the remaining 3 highlight-only questions
    const plainQuestions = [
      'Have you been discharged or retired from the Public Service on grounds of Ill-health',
      'Are you conducting business with the State or are you a Director',
      'In the event that you are employed in the Public Service, will you immediately relinquish',
    ];
    for (const label of plainQuestions) {
      const q = yesNoQuestion(page, label);
      await q.yesRadio.click();
      await page.waitForTimeout(300);
      // ASSERT (BLOCKING) Yes radio is checked
      await expect(q.yesRadio).toBeChecked();
    }

    // STEP: CLICK the Official Registration date picker, SELECT a date
    const dateField = page.getByRole('textbox', { name: 'Select date' });
    await dateField.click();
    // ASSERT (BLOCKING) calendar panel is visible
    await expect(page.locator('.ant-picker-panel')).toBeVisible({ timeout: 10000 });
    await page.locator('.ant-picker-cell-in-view').getByText('12', { exact: true }).click();
    await expect(dateField).not.toHaveValue('');

    // STEP: TYPE a registration number
    const regNoField = fieldInput(page, 'Reg. No');
    await regNoField.fill('REG98765');
    // ASSERT (BLOCKING) Reg. No field contains the typed value
    await expect(regNoField).toHaveValue('REG98765');
  });

  test('TC-09: Employment Restrictions tab', async ({ page }) => {
    await loginAsFred(page);
    await goToBackgroundInformation(page);
    // STEP: CLICK the Employment Restrictions tab (behind the ... overflow menu)
    await clickBgTab(page, 'Employment Restrictions');

    const reappointment = yesNoQuestion(page, 'are there any conditions that prevent your reappointment');
    // STEP: CLICK No then Yes, TYPE details
    await reappointment.noRadio.click();
    await page.waitForTimeout(400);
    await reappointment.yesRadio.click();
    await page.waitForTimeout(400);
    await expect(reappointment.detailField).toBeVisible();
    await reappointment.detailField.fill('Reappointment restriction details');
    // ASSERT (BLOCKING) detail field contains the typed value; Next enabled
    await expect(reappointment.detailField).toHaveValue('Reappointment restriction details');
    await expect(page.getByRole('button', { name: 'Next', exact: true })).toBeEnabled();
  });

  test('TC-10: Click Next button', async ({ page }) => {
    await loginAsFred(page);
    await goToBackgroundInformation(page);
    // STEP: CLICK the Next button
    await page.getByRole('button', { name: 'Next', exact: true }).click();
    await page.waitForTimeout(2000);
    // ASSERT (BLOCKING) Languages heading is visible
    await expect(page.getByRole('heading', { name: 'Languages' })).toBeVisible({ timeout: 15000 });
  });
});
