// AUTO-RECORDED from test-plans/HCM/eLeave/leave-credits.md
// Source: Azure DevOps test plan #79625, suites #86624 (add), #86632 (edit), #86647 (audit)
// The .md plan is canonical. AI-repair will patch failing lines in this file.
// Do not hand-edit unless you are also updating the .md plan.
//
// Serial: TC-05 creates the Jane Doe credit that TC-06..TC-10 use; TC-10 deletes it.

import { test, expect, Page, Locator } from '@playwright/test';
import { statSync } from 'node:fs';

const APP_URL = 'https://pd-hcm-adminportal-qa.shesha.app/';
const ADMIN = { user: 'admin', password: 'P@ssw0rd' };

const LEAVE_TYPE = 'Natural Disasters – Unforeseen';
const PERSON = 'Jane Doe';
const PERSAL = '78545623';

// Leave Balances column indexes (first three cells are the search / edit / delete icons)
const COL = { balanceType: 3, fullName: 4, persal: 5, leaveType: 6, credit: 9, total: 10, isCurrent: 11 };

test.describe.configure({ mode: 'serial' });

async function loginAsAdmin(page: Page) {
  // QA's front end intermittently takes >30s to serve or render the login page; retry the load
  // so one slow response doesn't fail the whole serial chain.
  await expect(async () => {
    await page.goto(`${APP_URL}login`, { timeout: 30000 });
    await expect(page.getByRole('textbox', { name: 'Username' })).toBeVisible({ timeout: 15000 });
  }).toPass({ timeout: 60000 });
  await page.getByRole('textbox', { name: 'Username' }).fill(ADMIN.user);
  await page.getByRole('textbox', { name: 'Password' }).fill(ADMIN.password);
  await page.getByRole('button', { name: 'Sign In' }).click();
  await page.waitForURL(url => !url.href.includes('/login'), { timeout: 30000 });
  await page.waitForLoadState('networkidle');
}

async function openLeaveBalances(page: Page) {
  // The side menu animates open, so the link can be unstable on the first click — retry
  // open + click until the URL changes.
  await expect(async () => {
    const link = page.getByRole('link', { name: 'Leave Balances', exact: true });
    if (!(await link.isVisible())) await page.getByRole('menuitem', { name: /SaGov Leave Management$/ }).click();
    await link.click({ timeout: 5000 });
    await expect(page).toHaveURL(/sagov-personal-balances/, { timeout: 10000 });
  }).toPass({ timeout: 60000 });
  await expect(page.getByRole('heading', { name: 'Leave Balances' })).toBeVisible({ timeout: 30000 });
  await page.waitForLoadState('networkidle');
  // The collapsed side menu opens SaGov Leave Management as a hover pop-out that can stay over
  // the toolbar and swallow clicks — hover the page heading so it closes.
  await page.getByRole('heading', { name: 'Leave Balances' }).hover();
  await expect(page.locator('.ant-menu-submenu-popup:not(.ant-menu-submenu-hidden)')).toHaveCount(0, { timeout: 10000 });
}

async function showAllBalances(page: Page) {
  // FRAGILE: antd pagination size changer has no accessible name
  const sizeChanger = page.locator('.ant-pagination-options .ant-select');
  // The table remembers the page size across reloads — only change it if it isn't already 100.
  if (!(await sizeChanger.innerText()).includes('100 / page')) {
    await sizeChanger.click();
    await page.locator('.ant-select-dropdown:not(.ant-select-dropdown-hidden)')
      .filter({ hasText: '100 / page' })
      .getByText('100 / page', { exact: true })
      .click();
  }
  await page.waitForLoadState('networkidle');
  // Wait until more than one page of 10 has rendered before callers count or filter rows
  // (QA has ~60 balances; the old 10-row page stays visible while the 100-row fetch runs).
  await expect.poll(() => page.getByRole('row').filter({ has: page.getByRole('img', { name: 'edit' }) }).count(),
    { timeout: 30000 }).toBeGreaterThan(10);
}

function openDropdown(page: Page): Locator {
  // FRAGILE: antd select options render in a detached popup without accessible option names
  return page.locator('.ant-select-dropdown:not(.ant-select-dropdown-hidden)').last();
}

function testCreditRows(page: Page): Locator {
  return page.getByRole('row').filter({ hasText: PERSON }).filter({ hasText: LEAVE_TYPE });
}

function field(dialog: Locator, label: string): Locator {
  return dialog.locator('.ant-form-item').filter({ has: dialog.page().locator('label', { hasText: new RegExp(`^${label}`) }) });
}

async function deleteTestCredits(page: Page) {
  const rows = testCreditRows(page);
  while (await rows.count() > 0) {
    await rows.first().getByRole('img', { name: 'delete' }).click();
    await expect(page.getByText('Are you sure you want to delete this leave balance')).toBeVisible();
    await page.getByRole('button', { name: 'Yes' }).click();
    await page.waitForLoadState('networkidle');
    await expect(page.getByText('Are you sure you want to delete this leave balance')).toBeHidden();
  }
}

function today(): string {
  return new Date().toLocaleDateString('en-GB'); // dd/mm/yyyy, matches the audit Action Date
}

test.describe('ELEAVE-LEAVE-CREDITS — Leave Credits (Add, Edit, Audit Trail)', () => {

  test('TC-01: Login as Admin', async ({ page }) => {
    // STEP 1: NAVIGATE to https://pd-hcm-adminportal-qa.shesha.app/login
    await page.goto(`${APP_URL}login`);
    // STEP 2: SNAPSHOT — confirm the Username and Password fields and the Sign In button are visible
    await expect(page.getByRole('textbox', { name: 'Username' })).toBeVisible();
    await expect(page.getByRole('textbox', { name: 'Password' })).toBeVisible();
    await expect(page.getByRole('button', { name: 'Sign In' })).toBeVisible();
    // STEP 3: TYPE Username field with `admin`
    await page.getByRole('textbox', { name: 'Username' }).fill(ADMIN.user);
    // STEP 4: TYPE Password field with `P@ssw0rd`
    await page.getByRole('textbox', { name: 'Password' }).fill(ADMIN.password);
    // STEP 5: CLICK the Sign In button
    await page.getByRole('button', { name: 'Sign In' }).click();
    // STEP 6: WAIT for the home page to load
    await page.waitForLoadState('networkidle');
    // ASSERT (BLOCKING): URL no longer contains /login and the SaGov Leave Management menu item is visible
    await expect(page).not.toHaveURL(/login/i);
    await expect(page.getByRole('menuitem', { name: /SaGov Leave Management$/ })).toBeVisible({ timeout: 30000 });
  });

  test('TC-02: Leave Balances page shows the credit actions', async ({ page }) => {
    await loginAsAdmin(page);
    // STEP 1: CLICK SaGov Leave Management in the side menu
    // STEP 2: CLICK Leave Balances
    // STEP 3: WAIT for the table to load
    await openLeaveBalances(page);
    // ASSERT (BLOCKING): URL contains /dynamic/SaGov.Leave/sagov-personal-balances and the heading Leave Balances is visible
    await expect(page).toHaveURL(/\/dynamic\/SaGov\.Leave\/sagov-personal-balances/);
    await expect(page.getByRole('heading', { name: 'Leave Balances' })).toBeVisible();
    // ASSERT: Export, Add Personal Credit, Recalculate Family Leave Balances buttons and the View Audit link
    await expect(page.getByRole('button', { name: 'Export' })).toBeVisible();
    await expect(page.getByRole('button', { name: 'Add Personal Credit' })).toBeVisible();
    await expect(page.getByRole('button', { name: 'Recalculate Family Leave Balances' })).toBeVisible();
    await expect(page.getByRole('link', { name: 'View Audit' })).toBeVisible();
    // ASSERT: the table columns
    for (const col of ['Balance Type', 'Full Name', 'PERSAL No', 'Leave Type', 'Period From', 'Period To', 'Credit', 'Total', 'Is Current Cycle']) {
      await expect(page.getByRole('columnheader', { name: col, exact: true })).toBeVisible();
    }
  });

  // ADO Test Case #86626: https://dev.azure.com/boxfusion/pd-Hcm/_workitems/edit/86626
  test("TC-03: Add Personal Credit — 'Close' closes the dialog without saving", async ({ page }) => {
    await loginAsAdmin(page);
    // STEP 1: Open Leave Balances (as in TC-02) and set the page size to 100 / page
    await openLeaveBalances(page);
    await showAllBalances(page);
    const rowsBefore = await testCreditRows(page).count();
    // STEP 2: CLICK Add Personal Credit
    await page.getByRole('button', { name: 'Add Personal Credit' }).click();
    // STEP 3: ASSERT the dialog opens with the expected fields and Cancel / OK buttons
    const dialog = page.getByRole('dialog', { name: 'Add a New Personal Leave Balance' });
    await expect(dialog).toBeVisible();
    for (const label of ['Leave Type', 'Is Previous Cycle', 'Person', 'Total', 'Balance', 'Comments', 'Attachments']) {
      await expect(field(dialog, label)).toBeVisible();
    }
    await expect(dialog.getByRole('button', { name: 'Cancel' })).toBeVisible();
    await expect(dialog.getByRole('button', { name: 'OK' })).toBeVisible();
    // STEP 4: SELECT Leave Type `Natural Disasters – Unforeseen`
    await field(dialog, 'Leave Type').getByRole('combobox').click();
    await openDropdown(page).getByText(LEAVE_TYPE, { exact: true }).click();
    // STEP 5: CLICK the Close (X) button in the dialog header
    await dialog.getByRole('button', { name: 'Close' }).click();
    // ASSERT (BLOCKING): the dialog is no longer visible
    await expect(dialog).toBeHidden();
    // ASSERT: still on Leave Balances, and the number of Jane Doe / Natural Disasters rows is unchanged
    await expect(page).toHaveURL(/sagov-personal-balances/);
    await page.waitForLoadState('networkidle');
    await expect(testCreditRows(page)).toHaveCount(rowsBefore);
  });

  // ADO Test Case #86631: https://dev.azure.com/boxfusion/pd-Hcm/_workitems/edit/86631
  test('TC-04: Add Personal Credit — mandatory fields are enforced', async ({ page }) => {
    await loginAsAdmin(page);
    const createCalls: string[] = [];
    page.on('request', req => { if (req.url().includes('CreateSaGovLeaveCycleBalance')) createCalls.push(req.url()); });
    // STEP 1: Open Leave Balances
    await openLeaveBalances(page);
    // STEP 2: CLICK Add Personal Credit
    await page.getByRole('button', { name: 'Add Personal Credit' }).click();
    const dialog = page.getByRole('dialog', { name: 'Add a New Personal Leave Balance' });
    await expect(dialog).toBeVisible();
    // STEP 3: Leave every field empty
    // The dialog frame renders before its Shesha form; clicking OK earlier does nothing.
    await expect(field(dialog, 'Balance').getByRole('spinbutton')).toBeVisible({ timeout: 30000 });
    // STEP 4: CLICK OK
    await dialog.getByRole('button', { name: 'OK' }).click();
    // ASSERT (BLOCKING): exactly 4 "This field is required" messages (Leave Type, Person, Total, Balance)
    await expect(dialog.getByText('This field is required')).toHaveCount(4);
    for (const label of ['Leave Type', 'Person', 'Total', 'Balance']) {
      await expect(field(dialog, label).getByText('This field is required')).toBeVisible();
    }
    // ASSERT (BLOCKING): the dialog stays open and no create request is sent
    await expect(dialog).toBeVisible();
    expect(createCalls).toHaveLength(0);
    // ASSERT: CLICK Cancel, and the dialog closes
    await dialog.getByRole('button', { name: 'Cancel' }).click();
    await expect(dialog).toBeHidden();
  });

  // ADO Test Cases #86628, #86629: https://dev.azure.com/boxfusion/pd-Hcm/_workitems/edit/86628
  test("TC-05: Add Personal Credit — 'OK' adds the credit and returns to Leave Balances", async ({ page }) => {
    await loginAsAdmin(page);
    // STEP 1: Open Leave Balances and set the page size to 100 / page
    await openLeaveBalances(page);
    await showAllBalances(page);
    // STEP 2: Cleanup: delete every leftover Jane Doe / Natural Disasters – Unforeseen row
    await deleteTestCredits(page);
    // STEP 3: CLICK Add Personal Credit
    await page.getByRole('button', { name: 'Add Personal Credit' }).click();
    const dialog = page.getByRole('dialog', { name: 'Add a New Personal Leave Balance' });
    await expect(dialog).toBeVisible();
    // STEP 4: SELECT Leave Type `Natural Disasters – Unforeseen`
    await field(dialog, 'Leave Type').getByRole('combobox').click();
    await openDropdown(page).getByText(LEAVE_TYPE, { exact: true }).click();
    // STEP 5: TYPE `Jane Doe` in Person and SELECT Jane Doe
    const person = field(dialog, 'Person').getByRole('combobox');
    await person.click();
    await person.fill(PERSON);
    await openDropdown(page).getByText(PERSON, { exact: true }).click();
    // STEP 6: TYPE Total with `5`
    await field(dialog, 'Total').getByRole('spinbutton').fill('5');
    // STEP 7: TYPE Balance with `5`
    await field(dialog, 'Balance').getByRole('spinbutton').fill('5');
    // STEP 8: TYPE Comments with `Automated test credit`
    await field(dialog, 'Comments').locator('textarea').fill('Automated test credit');
    // STEP 9: CLICK OK
    const createResponse = page.waitForResponse(r => r.url().includes('CreateSaGovLeaveCycleBalance'));
    await dialog.getByRole('button', { name: 'OK' }).click();
    // ASSERT (BLOCKING): CreateSaGovLeaveCycleBalance returns HTTP 200
    expect((await createResponse).status()).toBe(200);
    // ASSERT (BLOCKING): dialog closes, URL contains sagov-personal-balances, heading Leave Balances visible (ADO #86629)
    await expect(dialog).toBeHidden();
    await expect(page).toHaveURL(/sagov-personal-balances/);
    await expect(page.getByRole('heading', { name: 'Leave Balances' })).toBeVisible();
    // ASSERT (BLOCKING): new row Personal / Jane Doe / 78545623 / Natural Disasters – Unforeseen / Credit 5 / Total 5 / Yes (ADO #86628)
    await page.waitForLoadState('networkidle');
    const row = testCreditRows(page);
    // The table refresh after the create can take well over 15s on QA.
    await expect(row).toHaveCount(1, { timeout: 30000 });
    const cells = row.getByRole('cell');
    await expect(cells.nth(COL.balanceType)).toHaveText('Personal');
    await expect(cells.nth(COL.fullName)).toHaveText(PERSON);
    await expect(cells.nth(COL.persal)).toHaveText(PERSAL);
    await expect(cells.nth(COL.leaveType)).toHaveText(LEAVE_TYPE);
    await expect(cells.nth(COL.credit)).toHaveText('5');
    await expect(cells.nth(COL.total)).toHaveText('5');
    await expect(cells.nth(COL.isCurrent)).toHaveText('Yes');
  });

  // ADO Test Case #86637: https://dev.azure.com/boxfusion/pd-Hcm/_workitems/edit/86637
  test("TC-06: Edit Leave Credits — 'Close' closes the dialog without saving", async ({ page }) => {
    await loginAsAdmin(page);
    // STEP 1: Open Leave Balances and set the page size to 100 / page
    await openLeaveBalances(page);
    await showAllBalances(page);
    const row = testCreditRows(page);
    await expect(row).toHaveCount(1, { timeout: 15000 });
    // STEP 2: CLICK the edit (pencil) icon on the Jane Doe / Natural Disasters – Unforeseen row
    await row.getByRole('img', { name: 'edit' }).click();
    // STEP 3: ASSERT the Edit Leave Credits dialog opens with the saved values
    const dialog = page.getByRole('dialog', { name: 'Edit Leave Credits' });
    await expect(dialog).toBeVisible();
    await expect(field(dialog, 'Leave Type')).toContainText(LEAVE_TYPE);
    await expect(field(dialog, 'Person')).toContainText(PERSON);
    await expect(field(dialog, 'Total').getByRole('spinbutton')).toHaveValue('5');
    await expect(field(dialog, 'Balance').getByRole('spinbutton')).toHaveValue('5');
    await expect(field(dialog, 'Comments').locator('textarea')).toHaveValue('Automated test credit');
    // STEP 4: TYPE Total with `99`
    await field(dialog, 'Total').getByRole('spinbutton').fill('99');
    // STEP 5: CLICK the Close (X) button in the dialog header
    await dialog.getByRole('button', { name: 'Close' }).click();
    // ASSERT (BLOCKING): the Edit Leave Credits dialog is no longer visible
    await expect(dialog).toBeHidden();
    // ASSERT: the row still shows Credit 5 and Total 5
    await page.reload();
    await expect(page.getByRole('heading', { name: 'Leave Balances' })).toBeVisible({ timeout: 30000 });
    await showAllBalances(page);
    await expect(row.getByRole('cell').nth(COL.credit)).toHaveText('5');
    await expect(row.getByRole('cell').nth(COL.total)).toHaveText('5');
  });

  // ADO Test Cases #86634, #86635: https://dev.azure.com/boxfusion/pd-Hcm/_workitems/edit/86634
  test("TC-07: Edit Leave Credits — 'OK' saves and returns to Leave Balances", async ({ page }) => {
    await loginAsAdmin(page);
    // STEP 1: Open Leave Balances and set the page size to 100 / page
    await openLeaveBalances(page);
    await showAllBalances(page);
    const row = testCreditRows(page);
    await expect(row).toHaveCount(1, { timeout: 15000 });
    // STEP 2: CLICK the edit icon on the Jane Doe / Natural Disasters – Unforeseen row
    await row.getByRole('img', { name: 'edit' }).click();
    const dialog = page.getByRole('dialog', { name: 'Edit Leave Credits' });
    await expect(dialog).toBeVisible();
    await expect(field(dialog, 'Total').getByRole('spinbutton')).toHaveValue('5');
    // STEP 3: TYPE Total with `7`
    await field(dialog, 'Total').getByRole('spinbutton').fill('7');
    // STEP 4: TYPE Balance with `6`
    await field(dialog, 'Balance').getByRole('spinbutton').fill('6');
    // STEP 5: TYPE Comments with `Automated test edit`
    await field(dialog, 'Comments').locator('textarea').fill('Automated test edit');
    // STEP 6: CLICK OK
    await dialog.getByRole('button', { name: 'OK' }).click();
    // ASSERT (BLOCKING): dialog closes, URL contains sagov-personal-balances, heading Leave Balances visible (ADO #86635)
    await expect(dialog).toBeHidden({ timeout: 15000 });
    await expect(page).toHaveURL(/sagov-personal-balances/);
    await expect(page.getByRole('heading', { name: 'Leave Balances' })).toBeVisible();
    // ASSERT (BLOCKING): the row now shows Credit 6 and Total 7 (ADO #86634)
    await page.waitForLoadState('networkidle');
    await expect(row.getByRole('cell').nth(COL.credit)).toHaveText('6', { timeout: 15000 });
    await expect(row.getByRole('cell').nth(COL.total)).toHaveText('7');
    // ASSERT: opening Edit again shows Comments `Automated test edit` (then CLICK Cancel)
    await row.getByRole('img', { name: 'edit' }).click();
    await expect(dialog).toBeVisible();
    await expect(field(dialog, 'Comments').locator('textarea')).toHaveValue('Automated test edit');
    await dialog.getByRole('button', { name: 'Cancel' }).click();
    await expect(dialog).toBeHidden();
  });

  test('TC-08: View Audit shows the edit in the Leave Credits Audit Trail', async ({ page }) => {
    await loginAsAdmin(page);
    // STEP 1: Open Leave Balances
    await openLeaveBalances(page);
    // STEP 2: CLICK the View Audit link
    await page.getByRole('link', { name: 'View Audit' }).click();
    // ASSERT (BLOCKING): URL contains /dynamic/SaGov.Leave/sagov-personal-balance-audit-item and the title is visible
    await expect(page).toHaveURL(/\/dynamic\/SaGov\.Leave\/sagov-personal-balance-audit-item/, { timeout: 30000 });
    await expect(page.getByText('Leave Credits Audit Trail', { exact: true })).toBeVisible({ timeout: 30000 });
    await page.waitForLoadState('networkidle');
    // ASSERT: the table columns
    for (const col of ['Action Date', 'Actor', 'Description', 'Leave Type Name', 'Employee Full Name', 'Employee Persal No', 'Cycle From', 'Cycle To', 'Is Current Cycle']) {
      await expect(page.getByRole('columnheader', { name: col, exact: true })).toBeVisible();
    }
    // STEP 3: CLICK the Action Date column header twice to sort newest first
    const actionDate = page.getByRole('columnheader', { name: 'Action Date', exact: true });
    await actionDate.click();
    await page.waitForLoadState('networkidle');
    await actionDate.click();
    await page.waitForLoadState('networkidle');
    const entries = page.getByRole('row').filter({ hasText: PERSON }).filter({ hasText: LEAVE_TYPE }).filter({ hasText: today() });
    // ASSERT (BLOCKING): an entry dated today reads Balance changed from "5…" to "6…"
    await expect(entries.filter({ hasText: /Balance changed from "5(\.0+)?" to "6(\.0+)?"/ }).first()).toBeVisible({ timeout: 15000 });
    // ASSERT: an entry dated today reads EntitlementForCycle changed from "5…" to "7…"
    await expect(entries.filter({ hasText: /EntitlementForCycle changed from "5(\.0+)?" to "7(\.0+)?"/ }).first()).toBeVisible();
  });

  // ADO Test Case #86649: https://dev.azure.com/boxfusion/pd-Hcm/_workitems/edit/86649
  test("TC-09: Audit Trail — 'Export' downloads an Excel sheet", async ({ page }) => {
    await loginAsAdmin(page);
    // STEP 1: NAVIGATE to the Leave Credits Audit Trail (Leave Balances › View Audit)
    await openLeaveBalances(page);
    await page.getByRole('link', { name: 'View Audit' }).click();
    await expect(page.getByText('Leave Credits Audit Trail', { exact: true })).toBeVisible({ timeout: 30000 });
    await page.waitForLoadState('networkidle');
    // STEP 2: CLICK Export
    // STEP 3: WAIT for the download
    const [download] = await Promise.all([
      page.waitForEvent('download', { timeout: 60000 }),
      page.getByRole('button', { name: 'Export' }).click(),
    ]);
    // ASSERT (BLOCKING): a download starts and the file name ends in .xlsx
    expect(download.suggestedFilename()).toMatch(/\.xlsx$/i);
    // ASSERT: the downloaded file isn't empty
    const filePath = await download.path();
    expect(statSync(filePath).size).toBeGreaterThan(0);
  });

  test('TC-10: Cleanup — delete the test credit', async ({ page }) => {
    await loginAsAdmin(page);
    // STEP 1: Open Leave Balances and set the page size to 100 / page
    await openLeaveBalances(page);
    await showAllBalances(page);
    const row = testCreditRows(page);
    await expect(row).toHaveCount(1, { timeout: 15000 });
    // STEP 2: CLICK the delete (bin) icon on the Jane Doe / Natural Disasters – Unforeseen row
    await row.getByRole('img', { name: 'delete' }).click();
    // STEP 3: ASSERT the Delete Leave Balance confirmation with No / Yes is shown
    await expect(page.getByText('Delete Leave Balance', { exact: true })).toBeVisible();
    await expect(page.getByText('Are you sure you want to delete this leave balance')).toBeVisible();
    await expect(page.getByRole('button', { name: 'No' })).toBeVisible();
    // STEP 4: CLICK Yes
    await page.getByRole('button', { name: 'Yes' }).click();
    // ASSERT (BLOCKING): no Jane Doe / Natural Disasters – Unforeseen row remains
    await page.waitForLoadState('networkidle');
    await expect(row).toHaveCount(0, { timeout: 15000 });
  });

});
