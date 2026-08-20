// AUTO-RECORDED from test-plans/Profile/verify-edit-skills.md
// Source: Azure DevOps test plan #99437, suite #104586, test case #104645
// The .md plan is canonical. AI-repair will patch failing lines in this file.
// Do not hand-edit unless you are also updating the .md plan.
//
// Steps 1-4 are the same add flow as verify-add-skills.spec.ts. The row
// being edited must be located by its text BEFORE clicking Edit — once in
// edit mode the cell's text becomes an <input> value, which no longer
// counts toward the row's accessible name, so the currently-editing row is
// instead found by which row contains the visible Save icon.

import { test, expect, Page } from '@playwright/test';

const APP_URL = 'https://pd-recruitment-publicportal-1-qa.shesha.app/';
const APPLICANT = { user: 'Fred', password: 'Metaganemr%03' };
const ORIGINAL_SKILL = 'Playwright';
const UPDATED_SKILL = 'Selenium';

async function loginAsFred(page: Page) {
  await page.goto(`${APP_URL}login`);
  await page.locator('input[type="text"]').first().fill(APPLICANT.user);
  await page.locator('input[type="password"]').first().fill(APPLICANT.password);
  await page.getByRole('button', { name: /sign in/i }).click();
  await page.waitForURL(url => !url.href.includes('/login'), { timeout: 30000 });
  await page.waitForLoadState('networkidle');
}

async function goToSkills(page: Page) {
  await page.getByRole('link', { name: 'Manage Profile' }).click();
  await page.waitForLoadState('networkidle');
  await page.getByRole('button', { name: 'Skills' }).click();
  await page.waitForTimeout(1500);
  if (!(await page.getByRole('heading', { name: 'Skills' }).isVisible().catch(() => false))) {
    await page.getByRole('button', { name: 'Skills' }).click();
    await page.waitForTimeout(1500);
  }
}

// Deletes every row matching skillName, confirming the delete popover each time.
async function deleteSkillRows(page: Page, skillName: string) {
  let guard = 0;
  while ((await page.getByRole('row', { name: new RegExp(skillName) }).count()) > 0 && guard < 10) {
    guard++;
    await page.getByRole('row', { name: new RegExp(skillName) }).first().getByRole('button', { name: 'delete' }).first().click();
    await page.waitForTimeout(400);
    await page.getByRole('button', { name: 'OK' }).click();
    await page.waitForTimeout(800);
  }
}

function addRow(page: Page) {
  return page.getByRole('row', { name: 'plus-circle close-circle' });
}

async function addSkill(page: Page, skillName: string) {
  await deleteSkillRows(page, ORIGINAL_SKILL);
  await deleteSkillRows(page, UPDATED_SKILL);
  await addRow(page).locator('input').fill(skillName);
  await addRow(page).locator('button[title="Add"]').click();
  await page.waitForTimeout(800);
}

test.describe('PROFILE-104645 — Edit Skills', () => {
  test.describe.configure({ mode: 'serial' });

  test('TC-01: Login as Fred', async ({ page }) => {
    // STEP 1-5: NAVIGATE, TYPE Username/Password, CLICK Sign In
    await loginAsFred(page);
    // ASSERT (BLOCKING) URL no longer contains /login and Dashboard is visible
    await expect(page).not.toHaveURL(/login/i);
    await expect(page.getByText('Your Dashboard')).toBeVisible({ timeout: 30000 });
  });

  test('TC-02: Click on Skills tab', async ({ page }) => {
    await loginAsFred(page);
    // STEP: CLICK Manage Profile, then CLICK the Skills step
    await goToSkills(page);
    // ASSERT (BLOCKING) Skills heading visible
    await expect(page.getByRole('heading', { name: 'Skills' })).toBeVisible({ timeout: 15000 });
  });

  test('TC-03: Populate skill and click Add icon', async ({ page }) => {
    await loginAsFred(page);
    await goToSkills(page);
    await addSkill(page, ORIGINAL_SKILL);
    // ASSERT (BLOCKING) the skill is added to the table
    await expect(page.getByRole('row', { name: new RegExp(ORIGINAL_SKILL) })).toBeVisible({ timeout: 10000 });
  });

  test('TC-04: Click the edit icon on the added skill', async ({ page }) => {
    await loginAsFred(page);
    await goToSkills(page);
    await addSkill(page, ORIGINAL_SKILL);

    // STEP: CLICK the Edit icon on the "Playwright" row (located by its text
    // BEFORE clicking edit — this row reference is only used for the click,
    // not for finding the input afterward)
    const skillRow = page.getByRole('row', { name: new RegExp(ORIGINAL_SKILL) });
    await skillRow.locator('button[title="Edit"]').click();
    await page.waitForTimeout(800);
    // ASSERT (BLOCKING) a Save icon is visible, confirming edit mode is active
    await expect(page.locator('button[title="Save"]')).toBeVisible({ timeout: 10000 });
  });

  test('TC-05: Update the skill and click Save', async ({ page }) => {
    await loginAsFred(page);
    await goToSkills(page);
    await addSkill(page, ORIGINAL_SKILL);
    const skillRow = page.getByRole('row', { name: new RegExp(ORIGINAL_SKILL) });
    await skillRow.locator('button[title="Edit"]').click();
    await page.waitForTimeout(800);

    // STEP: UPDATE the skill name to "Selenium"
    // the currently-editing row is the one containing the visible Save icon
    const editingRow = page.getByRole('row').filter({ has: page.locator('button[title="Save"]') });
    const nameInput = editingRow.locator('input');
    await nameInput.fill(UPDATED_SKILL);
    // ASSERT (BLOCKING) the row's input contains "Selenium" before saving
    await expect(nameInput).toHaveValue(UPDATED_SKILL);

    // STEP: CLICK the Save button
    await page.locator('button[title="Save"]').click();
    await page.waitForTimeout(1000);
    // ASSERT (BLOCKING) a "Selenium" row is visible after saving
    await expect(page.getByRole('row', { name: new RegExp(UPDATED_SKILL) })).toBeVisible({ timeout: 10000 });

    // cleanup: remove the row this test produced so repeated runs don't accumulate duplicates
    await deleteSkillRows(page, UPDATED_SKILL);
  });
});
