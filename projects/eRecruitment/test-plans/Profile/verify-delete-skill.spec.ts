// AUTO-RECORDED from test-plans/Profile/verify-delete-skill.md
// Source: Azure DevOps test plan #99437, suite #104586, test case #104646
// The .md plan is canonical. AI-repair will patch failing lines in this file.
// Do not hand-edit unless you are also updating the .md plan.
//
// Steps 1-3 are the same add flow as verify-add-skills.spec.ts. The
// confirmation popover text is "Are you sure want to delete this item?"
// with Cancel/OK buttons, same as every other delete flow in this suite.

import { test, expect, Page } from '@playwright/test';

const APP_URL = 'https://pd-recruitment-publicportal-1-qa.shesha.app/';
const APPLICANT = { user: 'Fred', password: 'Metaganemr%03' };
const TEST_SKILL = 'Playwright';

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

async function addSkill(page: Page) {
  await deleteSkillRows(page, TEST_SKILL);
  await addRow(page).locator('input').fill(TEST_SKILL);
  await addRow(page).locator('button[title="Add"]').click();
  await page.waitForTimeout(800);
}

test.describe('PROFILE-104646 — Delete Skill', () => {
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
    await addSkill(page);
    // ASSERT (BLOCKING) the skill is added to the table
    await expect(page.getByRole('row', { name: new RegExp(TEST_SKILL) })).toBeVisible({ timeout: 10000 });
  });

  test('TC-04: Click the Delete icon on the added skill', async ({ page }) => {
    await loginAsFred(page);
    await goToSkills(page);
    await addSkill(page);

    // STEP: CLICK the Delete icon on the "Playwright" row
    await page.getByRole('row', { name: new RegExp(TEST_SKILL) }).getByRole('button', { name: 'delete' }).click();
    await page.waitForTimeout(500);
    // ASSERT (BLOCKING) confirmation popover with Cancel and OK is visible
    const popover = page.locator('.ant-popover, .ant-popconfirm');
    await expect(popover).toBeVisible({ timeout: 10000 });
    await expect(popover.getByRole('button', { name: 'Cancel' })).toBeVisible();
    await expect(popover.getByRole('button', { name: 'OK' })).toBeVisible();
  });

  test('TC-05: Click OK button', async ({ page }) => {
    await loginAsFred(page);
    await goToSkills(page);
    await addSkill(page);
    await page.getByRole('row', { name: new RegExp(TEST_SKILL) }).getByRole('button', { name: 'delete' }).click();
    await page.waitForTimeout(500);

    // STEP: CLICK the OK button
    await page.getByRole('button', { name: 'OK' }).click();
    await page.waitForTimeout(1000);
    // ASSERT (BLOCKING) the "Playwright" row is no longer visible
    await expect(page.getByRole('row', { name: new RegExp(TEST_SKILL) })).toHaveCount(0);
  });
});
