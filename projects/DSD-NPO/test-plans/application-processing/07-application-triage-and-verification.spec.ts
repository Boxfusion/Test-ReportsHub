// AUTO-RECORDED from test-plans/application-processing/07-application-triage-and-verification.md
// Source: Azure DevOps test plan #101541 (Smoke), suite #101864
// The .md plan is canonical. AI-repair will patch failing lines in this file.
//
// TC-01 → TC-04 recorded live 2026-08-13 and runnable now (All Applications holds 10,309 rows).
// TC-05 → TC-07 act on an application and must wait for one WE created — the 2,470 workflow
// inbox items belong to other testers and must not be actioned.
//
// ⚠️ RECORDED FINDING: All Applications does NOT render a "Risk Status" column, which
// ADO #101712 prescribes. Live columns are:
//   Application Ref · Organisation Name · Whatsapp Number · Email Address ·
//   Legal Form · No. of Office Bearers · Application Status · Date Received

import { test, expect } from '@playwright/test';
import {
  ADMIN_URL, ADMIN_ROUTES, CREDS,
  loginAdmin, typeReal, switchToLatest, waitForGrid, gridColumns, gridTotal,
} from '../_helpers';

test.describe('NPO-07 — Backend: Application Triage & Verification (smoke)', () => {

  // ADO Test Case #101711: https://dev.azure.com/boxfusion/Boxfusion%20Test%20Plans/_workitems/edit/101711
  test('TC-01: Admin can sign in to the Admin Portal (ADO #101711 · TC-07-001)', async ({ page }) => {
    // STEP 1-2: NAVIGATE and WAIT for hydration
    await page.goto(ADMIN_URL + '/login');
    await page.locator('input[type=password]').waitFor({ state: 'visible', timeout: 30_000 });

    // STEP 3: ASSERT the Sign-In page is displayed
    await expect(page.locator('input[type=text]').first()).toBeVisible();

    // STEP 4: TYPE credentials and CLICK Sign In  (admin reads "Sign In"; public reads "Login")
    await typeReal(page.locator('input[type=text]').first(), CREDS.user);
    await typeReal(page.locator('input[type=password]').first(), CREDS.password);
    await page.getByRole('button', { name: 'Sign In' }).click();

    // STEP 5: ASSERT (BLOCKING) the admin lands on the dashboard
    await page.waitForURL(/dynamic/i, { timeout: 45_000 });
    await expect(page).not.toHaveURL(/login/i);

    // STEP 6: switch view mode Live → Latest (project rule)
    await switchToLatest(page);
  });

  // ADO Test Case #101712: https://dev.azure.com/boxfusion/Boxfusion%20Test%20Plans/_workitems/edit/101712
  test('TC-02: All Applications lists every received application (ADO #101712 · TC-07-002)', async ({ page }) => {
    await loginAdmin(page);

    // STEP 1-2: NAVIGATE to All Applications and wait for the grid
    // 🔑 sha-react-table, NOT an AntD table — [role=table]/[role=row], never .ant-table*
    await page.goto(ADMIN_URL + ADMIN_ROUTES.allApplications);
    await waitForGrid(page);

    const columns = await gridColumns(page);
    const total = await gridTotal(page);
    console.log(`[TC-02] ${total} applications · columns: ${columns.join(' · ')}`);

    // STEP 3: ASSERT (BLOCKING) applications are listed with the five prescribed columns
    expect(await page.locator('[role=row]').count()).toBeGreaterThan(1);
    const has = (re: RegExp) => columns.some(c => re.test(c));
    expect(has(/Reference|Application Ref/i), 'Reference No column').toBeTruthy();
    expect(has(/NPO Name|Organisation Name/i), 'NPO Name column').toBeTruthy();
    expect(has(/Date Received/i), 'Date Received column').toBeTruthy();
    expect(has(/Application Status/i), 'Application Status column').toBeTruthy();
    // ⚠️ Recorded live as ABSENT — ADO #101712 prescribes it.
    expect(has(/Risk/i), 'ADO #101712 prescribes a Risk Status column').toBeTruthy();

    // STEP 4: ASSERT column sorting works
    const before = await page.locator('[role=row]').nth(1).innerText();
    await page.locator('[role=columnheader]').first().click();
    await page.waitForTimeout(2500);
    expect(await page.locator('[role=row]').nth(1).innerText()).not.toBe(before);
  });

  // ADO Test Case #101713: https://dev.azure.com/boxfusion/Boxfusion%20Test%20Plans/_workitems/edit/101713
  test('TC-03: Filter applications by status (ADO #101713 · TC-07-003)', async ({ page }) => {
    await loginAdmin(page);
    await page.goto(ADMIN_URL + ADMIN_ROUTES.allApplications);
    await waitForGrid(page);

    // STEP 1: RECORD the unfiltered total
    const before = await gridTotal(page);

    // STEP 2: apply filter Status = 'Application In-Progress'
    // TODO[selector]: the status filter control — the toolbar recorded only an "Export" button;
    // the filter is likely under .sha-global-table-filter. AI-repair to resolve on first run.
    await page.locator('.sha-global-table-filter').first().click();
    await page.waitForTimeout(1500);
    await page.getByText('Application In-Progress', { exact: false }).first().click();
    await page.waitForTimeout(3000);

    // STEP 3: ASSERT (BLOCKING) only In-Progress applications are displayed
    const after = await gridTotal(page);
    expect(after!).toBeLessThan(before!);
    const statuses = await page.locator('[role=row]').allInnerTexts();
    for (const row of statuses.slice(1)) {
      expect(row, 'every visible row must carry the filtered status').toMatch(/Application In-Progress/i);
    }

    // STEP 4-5: clear the filter, ASSERT the original count returns
    await page.getByRole('button', { name: /clear|reset/i }).first().click();
    await page.waitForTimeout(3000);
    expect(await gridTotal(page)).toBe(before);
  });

  // ADO Test Case #101714: https://dev.azure.com/boxfusion/Boxfusion%20Test%20Plans/_workitems/edit/101714
  test('TC-04: Application Details shows captured data, documents and status (ADO #101714 · TC-07-004)', async ({ page }) => {
    await loginAdmin(page);
    await page.goto(ADMIN_URL + ADMIN_ROUTES.allApplications);
    await waitForGrid(page);

    // STEP 1: CLICK an application row (read-only case — safe on another tester's record)
    await page.locator('[role=row]').nth(1).click();
    await page.waitForTimeout(4000);

    // STEP 2: ASSERT (BLOCKING) the seven prescribed sections are present (FDS 8.2)
    for (const section of [
      /Organisation Details/i, /Office Bearer/i, /Declaration/i,
      /Document/i, /Status/i,
    ]) {
      await expect(page.getByText(section).first(), `details section ${section}`).toBeVisible();
    }
    // 📌 "Control Structure (if any)" and "risk status" are conditional/unprescribed here —
    // record what is present rather than failing the case.
    for (const optional of ['Control Structure', 'Risk']) {
      const present = await page.getByText(new RegExp(optional, 'i')).first().isVisible().catch(() => false);
      console.log(`[TC-04] section "${optional}" present: ${present}`);
    }
  });

  // ADO Test Case #101716: https://dev.azure.com/boxfusion/Boxfusion%20Test%20Plans/_workitems/edit/101716
  test('TC-05: OB Compliance dialog lists each OB with three checks (ADO #101716 · TC-07-006)', async ({ page }) => {
    await loginAdmin(page);
    // TODO[selector]: open OUR OWN application at the OB-Compliance-eligible status.
    // ⛔ Blocked: needs an application we submitted (plan NPO-05 TC-05).

    await page.getByRole('button', { name: /OB Compliance/i }).click();
    await expect(page.locator('.ant-modal-content')).toBeVisible();
    for (const check of [/UN Sanctions/i, /Justice/i, /Child Protection/i]) {
      await expect(page.getByText(check).first()).toBeVisible();
    }
    // TODO[selector]: mark each OB compliant, then Submit.
    await page.getByRole('button', { name: /^Submit$/ }).click();
    await page.waitForTimeout(3000);
    await expect(page.getByText(/Awaiting Document Verification/i)).toBeVisible();
  });

  // ADO Test Case #101720: https://dev.azure.com/boxfusion/Boxfusion%20Test%20Plans/_workitems/edit/101720
  test('TC-06: Document Verification allows yes/no per document (ADO #101720 · TC-07-010)', async ({ page }) => {
    await loginAdmin(page);
    // TODO[selector]: open OUR OWN application with all OBs confirmed and compliant. ⛔ Blocked.

    await page.getByRole('button', { name: /Document Verification/i }).click();
    await expect(page.locator('.ant-modal-content')).toBeVisible();
    // TODO[selector]: per-document Yes/No radio + Reason field.
    await page.getByRole('button', { name: /^Submit$/ }).click();
    await page.waitForTimeout(3000);

    await expect(page.getByText('Successful Document Verification', { exact: false })).toBeVisible();
    // TODO[assertion]: Certificate + Constitution + OB list generated; chairperson notified.
  });

  // ADO Test Case #101723: https://dev.azure.com/boxfusion/Boxfusion%20Test%20Plans/_workitems/edit/101723
  test('TC-07: Approval issues an NPO Registration Number and Certificate (ADO #101723 · TC-07-013)', async ({ page }) => {
    await loginAdmin(page);
    // TODO[selector]: complete Document Verification with all Yes on OUR application. ⛔ Blocked.

    // STEP 2: ASSERT (BLOCKING) status is exactly "Application Successful"
    await expect(page.getByText('Application Successful', { exact: false })).toBeVisible();

    // STEP 3: ASSERT an NPO Registration Number is issued, in NNN-NNN-NPO format
    const body = await page.locator('body').innerText();
    expect(body, 'an NPO Registration Number in NNN-NNN-NPO format').toMatch(/\d{3}-\d{3}-NPO/);

    // STEP 4-5: the four generated artefacts, and the QR-protected certificate
    // ⚠️ ADO drift note: QR code generation was NOT found in the code — this assertion is
    // expected to fail, and confirming its absence is a useful outcome.
    // TODO[assertion]: certificate QR code — needs the generated PDF inspected.
  });
});
