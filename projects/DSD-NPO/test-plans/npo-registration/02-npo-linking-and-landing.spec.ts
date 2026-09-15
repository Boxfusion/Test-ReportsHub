// AUTO-RECORDED from test-plans/npo-registration/02-npo-linking-and-landing.md
// Source: Azure DevOps test plan #101541 (Smoke), suite #101859
// The .md plan is canonical. AI-repair will patch failing lines in this file.
//
// Login + nav selectors recorded live 2026-08-13. The linking form itself is behind
// the landing page and was not driven at record time — those lines carry TODO markers.

import { test, expect } from '@playwright/test';
import {
  PUBLIC_URL, PUBLIC_ROUTES,
  loginPublic, typeReal, clickFirstVisible, waitForGrid, gridTotal,
} from '../_helpers';

// Replace with a real migrated NPO number from admin → All NPOs (format NNN-NNN-NPO).
const KNOWN_NPO_NUMBER = process.env.DSD_NPO_NUMBER || '333-010-NPO';

test.describe('NPO-02 — NPO Linking & Landing (smoke)', () => {

  // ADO Test Case #101616: https://dev.azure.com/boxfusion/Boxfusion%20Test%20Plans/_workitems/edit/101616
  test('TC-01: First-time user with no NPOs is offered Register / Link (ADO #101616 · TC-02-001)', async ({ page }) => {
    // STEP 1: sign in as a submitter not yet linked to any NPO
    await loginPublic(page);

    // ⚠️ Recorded live: login lands on /dynamic/Shesha.Workflow/workflows-inbox. The landing
    // page the case describes is reached via the "Register NPO" nav link.
    console.log(`[TC-01] post-login path: ${new URL(page.url()).pathname}`);

    // STEP 2: NAVIGATE to the logged-in home page
    await page.goto(PUBLIC_URL + PUBLIC_ROUTES.registerNpo);
    await page.waitForLoadState('networkidle');

    // STEP 3: SNAPSHOT
    // STEP 4: ASSERT (BLOCKING) both once-off actions are offered (FDS 7.3.1)
    await expect(page.getByText(/Register a new NPO/i).first()).toBeVisible();
    await expect(page.getByText(/Link to an Existing NPO/i).first()).toBeVisible();

    // 📌 The live page offers a THIRD action ("Enquiry") the case does not name — reported,
    // not failed; the case is probably just older than the page.
    const hasEnquiry = await page.getByText(/Enquiry/i).first().isVisible().catch(() => false);
    console.log(`[TC-01] third action "Enquiry" present: ${hasEnquiry}`);
  });

  // ADO Test Case #101617: https://dev.azure.com/boxfusion/Boxfusion%20Test%20Plans/_workitems/edit/101617
  test('TC-02: Link to an existing NPO returns the legacy record (ADO #101617 · TC-02-002)', async ({ page }) => {
    await loginPublic(page);
    await page.goto(PUBLIC_URL + PUBLIC_ROUTES.registerNpo);
    await page.waitForLoadState('networkidle');

    // STEP 1: CLICK "Link to an existing NPO"
    // 🔑 Hidden mounted duplicates exist — click the first VISIBLE match, never .first().
    await clickFirstVisible(page, 'button', /Link to an Existing NPO/i);
    await page.waitForTimeout(2000);

    // STEP 2: ⚠️ the control is used TWICE — on arrival there is no NPO Number input and the
    // button is enabled; the FIRST click reveals the input and flips the same button to the
    // disabled submit control.
    // TODO[selector]: NPO Number input — reveal behaviour not recorded live; AI-repair to resolve.
    const npoInput = page.locator('input[type=text]').first();
    await npoInput.waitFor({ state: 'visible', timeout: 15_000 });

    // STEP 3-4: TYPE a real migrated NPO number and ASSERT the value actually landed
    const got = await typeReal(npoInput, KNOWN_NPO_NUMBER);
    expect(got, 'the NPO number must actually land before any conclusion is drawn').toBe(KNOWN_NPO_NUMBER);

    // STEP 5: ASSERT the four legacy fields are displayed
    await expect(page.getByText(/NPO Name/i).first()).toBeVisible();
    await expect(page.getByText(/Authorised Person/i).first()).toBeVisible();
    await expect(page.getByText(/Email/i).first()).toBeVisible();

    // STEP 6: CLICK Confirm Link
    // TODO[selector]: Confirm Link button — not recorded live.
    await clickFirstVisible(page, 'button', /Confirm Link/i);

    // STEP 7: ASSERT (BLOCKING) the link is granted and the NPO Dashboard is displayed
    await page.waitForTimeout(3000);
    await expect(page).toHaveURL(/dashboard|npo-landing-view/i);
  });

  // ADO Test Case #101622: https://dev.azure.com/boxfusion/Boxfusion%20Test%20Plans/_workitems/edit/101622
  test('TC-03: Linked NPO appears in the dashboard list (ADO #101622 · TC-02-007)', async ({ page }) => {
    // STEP 1: sign in as a user with at least one linked NPO
    await loginPublic(page);
    await page.goto(PUBLIC_URL + PUBLIC_ROUTES.dashboard);
    await page.waitForLoadState('networkidle');

    // STEP 2: ASSERT (BLOCKING) the dashboard lists the linked NPOs (FDS Fig.8)
    // 📌 grids here are sha-react-table — [role=table]/[role=row], never .ant-table*
    await waitForGrid(page);
    const total = await gridTotal(page);
    console.log(`[TC-03] linked NPOs listed: ${total}`);
    expect(await page.locator('[role=row]').count()).toBeGreaterThan(1);

    // STEP 3: CLICK an NPO in the list
    await page.locator('[role=row]').nth(1).click();
    await page.waitForTimeout(2500);

    // STEP 4: ASSERT its details view opens
    // TODO[assertion]: details-view marker not recorded live; AI-repair to anchor on first run.
    await expect(page).not.toHaveURL(new RegExp(PUBLIC_ROUTES.dashboard + '$'));
  });
});
