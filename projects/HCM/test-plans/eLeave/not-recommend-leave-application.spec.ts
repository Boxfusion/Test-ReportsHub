// AUTO-RECORDED from test-plans/eLeave/not-recommend-leave-application.md
// Source: Azure DevOps test plan #116862, suite #116870
// The .md plan is canonical. AI-repair will patch failing lines in this file.
// Do not hand-edit unless you are also updating the .md plan.
//
// Depends on data: run capture-new-leave-application first so GOV012 has a Recommend Leave item.

import { test, expect, Page } from '@playwright/test';

const APP_URL = 'https://pd-hcm-adminportal-qa.shesha.app/';
const RECOMMENDER = { user: 'GOV012', password: '123qwe' };

async function loginAsRecommender(page: Page) {
  await page.goto(`${APP_URL}login`);
  // STEP login.1: TYPE Username field with `GOV012`
  await page.getByRole('textbox', { name: 'Username' }).fill(RECOMMENDER.user);
  // STEP login.2: TYPE Password field with `123qwe`
  await page.getByRole('textbox', { name: 'Password' }).fill(RECOMMENDER.password);
  // STEP login.3: CLICK the Sign In button
  await page.getByRole('button', { name: 'Sign In' }).click();
  await page.waitForURL(url => !url.href.includes('/login'), { timeout: 30000 });
  await page.waitForLoadState('networkidle');
}

test.describe('ELEAVE-NOT-RECOMMEND — Not Recommend Leave Application', () => {

  test('TC-01: Login as Recommender', async ({ page }) => {
    // STEP 1: NAVIGATE to https://pd-hcm-adminportal-qa.shesha.app/login
    await page.goto(`${APP_URL}login`);
    // STEP 2: SNAPSHOT — confirm login page is visible
    // SNAPSHOT: login page
    // STEP 3: TYPE Username field with `GOV012`
    await page.getByRole('textbox', { name: 'Username' }).fill(RECOMMENDER.user);
    // STEP 4: TYPE Password field with `123qwe`
    await page.getByRole('textbox', { name: 'Password' }).fill(RECOMMENDER.password);
    // STEP 5: CLICK the Sign In button
    await page.getByRole('button', { name: 'Sign In' }).click();
    // STEP 6: WAIT for the home page to load
    await page.waitForLoadState('networkidle');
    // ASSERT (BLOCKING): URL no longer contains /login and the Workflows menu item is visible
    await expect(page).not.toHaveURL(/login/i);
    await expect(page.getByRole('menuitem', { name: 'apartment Workflows' })).toBeVisible({ timeout: 30000 });
  });

  // ADO Test Case #116922: https://dev.azure.com/boxfusion/pd-Hcm/_workitems/edit/116922
  test('TC-02: Not Recommending a leave application', async ({ page }) => {
    await loginAsRecommender(page);
    // STEP 1: SNAPSHOT — confirm the Workflows menu item
    // SNAPSHOT: Workflows menu item
    // STEP 2: CLICK Workflows in the side menu, then CLICK Inbox
    await page.getByRole('menuitem', { name: 'apartment Workflows' }).click();
    await page.getByRole('link', { name: 'Inbox' }).click();
    await expect(page.getByRole('heading', { name: 'Incoming Items' })).toBeVisible({ timeout: 30000 });
    // STEP 3: SNAPSHOT — confirm the top SaGov Leave Application row with Action Required Recommend Leave
    const row = page.getByRole('row')
      .filter({ hasText: 'SaGov Leave Application' })
      .filter({ hasText: 'Recommend Leave' })
      .first();
    await expect(row).toBeVisible({ timeout: 30000 });
    // STEP 4: CLICK the magnifying glass (search) icon on that row
    await row.getByRole('link', { name: 'search' }).click();
    // STEP 5: ASSERT the leave application is opened in detail view
    await expect(page).toHaveURL(/workflow-action/);
    await expect(page.getByRole('heading', { name: /^Recommend Leave:/ })).toBeVisible({ timeout: 30000 });
    // STEP 6: CLICK the acknowledgement checkbox
    await page.getByRole('checkbox').check();
    // STEP 7: ASSERT the checkbox is checked
    await expect(page.getByRole('checkbox')).toBeChecked();
    // STEP 8: CLICK the Not Recommend button
    await page.getByRole('button', { name: 'Not Recommend', exact: true }).click();
    // STEP 9: ASSERT the system displays the Not Recommend comments pop-up with Ok disabled
    const dialog = page.getByRole('dialog', { name: 'Not Recommend' });
    await expect(dialog).toBeVisible();
    await expect(dialog.getByRole('button', { name: 'Ok' })).toBeDisabled();
    // STEP 10: TYPE comments in the pop-up with `Testing not recommended`
    await dialog.getByRole('textbox').fill('Testing not recommended');
    // STEP 11: CLICK Ok
    await dialog.getByRole('button', { name: 'Ok' }).click();
    // ASSERT (BLOCKING): "Successfully Submitted" is shown and the user is back on the Incoming Items view
    await expect(page.getByText('Successfully Submitted')).toBeVisible({ timeout: 30000 });
    await expect(page).toHaveURL(/workflows-inbox/, { timeout: 30000 });
  });

});
