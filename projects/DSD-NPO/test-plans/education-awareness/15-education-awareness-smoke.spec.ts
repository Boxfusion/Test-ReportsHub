// AUTO-RECORDED from test-plans/education-awareness/15-education-awareness-smoke.md
// Source: Azure DevOps test plan #101541 (Smoke), suite #107359
// The .md plan is canonical. AI-repair will patch failing lines in this file.
//
// ✅ FULLY REACHABLE TODAY, and cross-portal. Recorded live 2026-08-13:
// the public library page renders 6 libraries (Friday Deployment Training, BET Testing,
// cv, Test, MS Docs, sdsd). This is the only unblocked smoke suite that includes a CREATE.
//
// ⚠️ All four ADO cases are L1-draft with suite-level FDS anchors. Executing them IS the
// L3 validation Thabiso asked for — record what each screen does in enough detail to
// sharpen the cases afterwards.

import { test, expect } from '@playwright/test';
import {
  PUBLIC_URL, PUBLIC_ROUTES, ADMIN_URL,
  loginPublic, loginAdmin, typeReal, captureFailedRequests, clickFirstVisible,
} from '../_helpers';

const STAMP = new Date().toISOString().slice(0, 10);

test.describe('NPO-15 — Education & Awareness (smoke)', () => {

  // ADO Test Case #107404: https://dev.azure.com/boxfusion/Boxfusion%20Test%20Plans/_workitems/edit/107404
  test('TC-01: Admin can sign in and reach the E&A Dashboard (ADO #107404 · TC-15-001)', async ({ page }) => {
    // STEP 1: sign in to admin and switch Live → Latest
    await loginAdmin(page);

    // STEP 2-3: NAVIGATE to the Education & Awareness dashboard
    // TODO[selector]: E&A dashboard URL — the sidebar submenu needs a REAL click to open
    // (a synthetic el.click() does not). CRUDS resolved this way; E&A should too.
    await clickFirstVisible(page, '.ant-menu-submenu-title', /Education and Awareness/i);
    await page.waitForTimeout(2000);
    await clickFirstVisible(page, '.ant-menu-item a, .ant-menu-item', /Dashboard|Intervention|Content/i);
    await page.waitForLoadState('networkidle');

    // STEP 4-5: ASSERT (BLOCKING) the dashboard loads and at least one library is visible
    await expect(page.getByText(/Librar/i).first()).toBeVisible({ timeout: 20_000 });

    // 📌 RECORD the widgets and figures — everything beyond "at least one library" is
    // reporting that will sharpen this L1-draft case.
    console.log('[TC-01] E&A dashboard content:', (await page.locator('body').innerText()).slice(0, 800));
  });

  // ADO Test Case #107405: https://dev.azure.com/boxfusion/Boxfusion%20Test%20Plans/_workitems/edit/107405
  test('TC-02: NPO user can sign in and open a Library on the portal (ADO #107405 · TC-15-002)', async ({ page }) => {
    // STEP 1: sign in to the public portal and switch Live → Latest
    await loginPublic(page);

    // STEP 2: open Education and Awareness → Libraries  (route recorded live)
    await page.goto(PUBLIC_URL + PUBLIC_ROUTES.educationAwareness);
    await page.waitForLoadState('networkidle');
    await expect(page.getByRole('heading', { name: /Education and Awareness/i })).toBeVisible();
    await expect(page.getByRole('heading', { name: /Libraries/i })).toBeVisible();

    // Recorded live: 6 libraries, listed with an .ant-pagination caption ("1-6 of 6 items")
    const caption = await page.locator('.ant-pagination').first().innerText().catch(() => '');
    console.log(`[TC-02] libraries pagination: ${caption.replace(/\n/g, ' ')}`);

    // STEP 3: CLICK a library
    await clickFirstVisible(page, 'a, button, .ant-list-item, [role=row]', /Training|Testing|Docs|Test/i);
    await page.waitForTimeout(3000);

    // STEP 4: ASSERT (BLOCKING) the content items list renders
    const items = page.locator('[role=row], .ant-list-item, .ant-card');
    await expect(items.first(), 'library content items should render').toBeVisible({ timeout: 20_000 });

    // 📌 RECORD what a content item shows — TC-04 needs to identify a PUBLISHED item and
    // neither case says how published items are distinguished.
    console.log('[TC-02] first content item:', await items.first().innerText());
  });

  // ADO Test Case #107406: https://dev.azure.com/boxfusion/Boxfusion%20Test%20Plans/_workitems/edit/107406
  test('TC-03: Admin can add and submit an Intervention (ADO #107406 · TC-15-003)', async ({ page }) => {
    const failures = captureFailedRequests(page);
    await loginAdmin(page);

    // STEP 1-2: NAVIGATE to Interventions and CLICK Add Intervention
    // TODO[selector]: Interventions URL — resolve via a REAL click on the E&A submenu.
    await clickFirstVisible(page, '.ant-menu-submenu-title', /Education and Awareness/i);
    await page.waitForTimeout(2000);
    await clickFirstVisible(page, '.ant-menu-item a, .ant-menu-item', /Intervention/i);
    await page.waitForLoadState('networkidle');
    await clickFirstVisible(page, 'button', /Add Intervention/i);
    await page.waitForTimeout(2500);

    // STEP 3: SNAPSHOT — RECORD every field and which are mandatory
    const form = page.locator('.ant-modal-content, form').first();
    console.log('[TC-03] Add Intervention form:', (await form.innerText()).slice(0, 800));

    // STEP 4: fill mandatory fields — free text ≤100 characters
    // TODO[selector]: individual mandatory fields — not recorded live.
    const firstText = form.locator('input[type=text]').first();
    await typeReal(firstText, `QA Intervention ${STAMP}`);

    // STEP 5: CLICK Submit
    // 📌 Watch for a modal whose submit reads **Ok** rather than a second "Add Intervention" —
    // on the CRM form, clicking the opener again proved nothing and produced a retracted result.
    await clickFirstVisible(page, 'button', /^(Submit|Ok|Save)$/i);
    await page.waitForTimeout(4000);

    // STEP 6: capture the create request and any >=400 response body
    if (failures.length) console.log('[TC-03] failed API calls:', JSON.stringify(failures, null, 1));
    expect(failures, `create returned ${failures.length} failed API call(s) — the UI discards these silently`).toHaveLength(0);

    // STEP 7-8: ASSERT (BLOCKING) persisted with status Complete, and RETRIEVABLE after reload.
    // 🔑 This is the exact shape that failed before: CRM → Create Case closed its modal
    // cleanly and persisted NOTHING. A closing modal is never proof of a save.
    await page.reload();
    await page.waitForLoadState('networkidle');
    await expect(page.getByText(`QA Intervention ${STAMP}`).first(),
      'the intervention must be retrievable after a reload').toBeVisible({ timeout: 20_000 });
    await expect(page.getByText('Complete', { exact: false }).first()).toBeVisible();
  });

  // ADO Test Case #107407: https://dev.azure.com/boxfusion/Boxfusion%20Test%20Plans/_workitems/edit/107407
  test('TC-04: NPO user can view and download a published Library item (ADO #107407 · TC-15-004)', async ({ page }) => {
    await loginPublic(page);
    await page.goto(PUBLIC_URL + PUBLIC_ROUTES.educationAwareness);
    await page.waitForLoadState('networkidle');

    // STEP 1-2: open a library, then a published content item
    await clickFirstVisible(page, 'a, button, .ant-list-item, [role=row]', /Training|Testing|Docs|Test/i);
    await page.waitForTimeout(3000);
    await clickFirstVisible(page, 'a, button, [role=row], .ant-list-item', /.+/);
    await page.waitForTimeout(2500);

    // STEP 3-5: CLICK Download and ASSERT (BLOCKING) the file downloads without error
    const [download] = await Promise.all([
      page.waitForEvent('download', { timeout: 30_000 }),
      clickFirstVisible(page, 'a, button', /Download/i),
    ]);
    const path = await download.path();
    expect(path, 'the download should complete').toBeTruthy();

    // STEP 6: ASSERT the file is non-empty
    const fs = require('fs');
    expect(fs.statSync(path!).size, 'downloaded file should not be empty').toBeGreaterThan(0);
    // ⚠️ If this fails, check for 500 /api/StoredFile/FilesList before blaming E&A.
  });
});
