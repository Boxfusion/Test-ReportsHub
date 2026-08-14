// AUTO-RECORDED from test-plans/auth/01-authentication-account-creation.md
// Source: Azure DevOps test plan #101541 (Smoke), suite #101858
// The .md plan is canonical. AI-repair will patch failing lines in this file.
//
// Selectors RECORDED LIVE 2026-08-13 against the QA public portal.
//
// ⚠️ WHAT THE RECORDING FOUND — TC-02 and TC-03 are expected to FAIL as written.
// The ADO cases describe a single "Create User Account" screen carrying
// Email + ID Number + Password + Confirm Password + "Complete Sign-up".
// The live build has NO such button and NO ID Number field anywhere. Sign-up is a
// THREE-step, mobile-OTP-first flow:
//   Register → /dsd-public-portal-send-otp   "Verify Mobile Number" (mobile + OTP)
//   → /signUp-public-portal step 1           Mobile Number (display) · First · Last · Email
//   → /signUp-public-portal step 2           Password · Confirm Password · [Sign Up]
// The assertions below are written to the ADO spec deliberately, so the run reports the
// divergence with evidence rather than hiding it.

import { test, expect } from '@playwright/test';
import {
  PUBLIC_URL, PUBLIC_ROUTES, CREDS,
  typeReal, switchToLatest, captureFailedRequests,
} from '../_helpers';

test.describe('NPO-01 — Authentication & Account Creation (smoke)', () => {

  // ADO Test Case #101595: https://dev.azure.com/boxfusion/Boxfusion%20Test%20Plans/_workitems/edit/101595
  test('TC-01: Sign in with valid email and password (ADO #101595 · TC-01-001)', async ({ page }) => {
    // STEP 1: NAVIGATE to the public portal login page
    await page.goto(PUBLIC_URL + PUBLIC_ROUTES.login);

    // STEP 2: WAIT for hydration — the password input is the reliable marker
    await page.locator('input[type=password]').waitFor({ state: 'visible', timeout: 30_000 });

    // STEP 3: SNAPSHOT
    // STEP 4: ASSERT the Sign-In page shows Email, Password, Forgot Password and Create User Account
    await expect(page.locator('input[type=text]').first()).toBeVisible();
    await expect(page.locator('input[type=password]').first()).toBeVisible();
    await expect(page.getByRole('link', { name: 'Forgot Password' })).toBeVisible();

    // ⚠️ ADO prescribes a "Create User Account" BUTTON. Recorded live: it does not exist —
    // the sign-up entry point is a "Register" LINK to the mobile-OTP flow.
    const createAccountButton = page.getByRole('button', { name: /create user account/i });
    await expect(createAccountButton,
      'ADO #101595 step 1 prescribes a "Create User Account" button on the Sign-In page').toBeVisible();

    // STEP 5: TYPE the email and password
    await typeReal(page.locator('input[type=text]').first(), CREDS.user);
    await typeReal(page.locator('input[type=password]').first(), CREDS.password);

    // STEP 6: CLICK Login  (public portal reads "Login"; admin reads "Sign In")
    await page.getByRole('button', { name: 'Login' }).click();

    // STEP 7: ASSERT (BLOCKING) the user is authenticated and lands on the landing page
    await page.waitForURL(/dynamic/i, { timeout: 45_000 });
    await expect(page).not.toHaveURL(/login/i);

    // ⚠️ Recorded live: login lands on /dynamic/Shesha.Workflow/workflows-inbox, NOT the
    // NPO landing page the case describes (FDS Fig.8/Fig.9). Reported, not auto-failed —
    // this is a question for Thabiso, per the plan.
    const landedOn = new URL(page.url()).pathname;
    console.log(`[TC-01] landed on: ${landedOn}`);

    // STEP 8: switch the header view mode Live → Latest (project rule, every run)
    await switchToLatest(page);
  });

  // ADO Test Case #101603: https://dev.azure.com/boxfusion/Boxfusion%20Test%20Plans/_workitems/edit/101603
  test('TC-02: Create User Account button opens the Create Account screen (ADO #101603 · TC-01-009)', async ({ page }) => {
    // STEP 1: NAVIGATE to the Sign-In page, signed out
    await page.goto(PUBLIC_URL + PUBLIC_ROUTES.login);
    await page.locator('input[type=password]').waitFor({ state: 'visible', timeout: 30_000 });

    // STEP 2: SNAPSHOT
    // STEP 3: CLICK "Create user account"
    // ⚠️ Recorded live: no such control. The equivalent is the "Register" link →
    // /no-auth/boxfusion.dsdnpo/dsd-public-portal-send-otp (Verify Mobile Number).
    await expect(page.getByRole('button', { name: /create user account/i }),
      'ADO #101603 prescribes a "Create user account" button on the Sign-In page').toBeVisible();

    // STEP 4: ASSERT (BLOCKING) the Create User Account screen is displayed (FDS Fig.7)
    // STEP 5: ASSERT it carries Email, ID Number, Password, Confirm Password, Complete Sign-up
    await expect(page.getByText(/ID Number/i),
      'ADO #101603 prescribes an ID Number field on the Create Account screen').toBeVisible();
    await expect(page.getByRole('button', { name: /complete sign-?up/i }),
      'ADO #101603 prescribes a "Complete Sign-up" button').toBeVisible();
  });

  // ADO Test Case #101604: https://dev.azure.com/boxfusion/Boxfusion%20Test%20Plans/_workitems/edit/101604
  test('TC-03: Create account with a valid SA ID passes DHA validation (ADO #101604 · TC-01-010)', async ({ page }) => {
    const failures = captureFailedRequests(page);

    // STEP 1: NAVIGATE to Create User Account
    // Recorded live: the real entry point is the Sign Up form, reached via Register → OTP.
    await page.goto(PUBLIC_URL + PUBLIC_ROUTES.signUp);
    await page.waitForLoadState('networkidle');

    // STEP 2: ASSERT the form is displayed
    await expect(page.getByRole('heading', { name: 'Sign Up' })).toBeVisible();

    // STEP 3-5: TYPE a unique email, the SA ID, and the password pair
    // ⚠️ Recorded live: step 1 of Sign Up carries only First Name / Last Name / Email Address.
    // There is NO ID Number control anywhere in the flow, so the DHA verification this case
    // exists to prove cannot be triggered from here.
    await expect(page.getByText(/ID Number/i),
      'ADO #101604 step 2 requires an SA ID field to drive DHA verification').toBeVisible();

    // TODO[selector]: SA ID input — does not exist in the current build; resolve once the
    // field is added, or the case is rewritten against the mobile-OTP flow.

    const unique = `qa.tester${Date.now().toString().slice(-6)}@example.org`;
    const inputs = page.locator('input[type=text]');
    await typeReal(inputs.nth(0), 'QA');
    await typeReal(inputs.nth(1), 'Tester');
    await typeReal(inputs.nth(2), unique);

    // STEP 6: CLICK through to the password step, then Complete Sign-up
    await page.getByRole('button', { name: 'Next' }).click();
    await page.locator('input[type=password]').first().waitFor({ state: 'visible', timeout: 15_000 });
    const pwds = page.locator('input[type=password]');
    await typeReal(pwds.nth(0), 'Boxfusion@2026');
    await typeReal(pwds.nth(1), 'Boxfusion@2026');
    await page.getByRole('button', { name: /^Sign Up$/ }).click();
    await page.waitForTimeout(4000);

    // STEP 7: capture any >=400 response body — the UI has been shown to discard these silently
    if (failures.length) console.log('[TC-03] failed API calls:', JSON.stringify(failures, null, 1));

    // STEP 8-9: ASSERT (BLOCKING) the DHA call succeeded and a verification-email confirmation shows
    expect(failures, `sign-up returned ${failures.length} failed API call(s) — see log`).toHaveLength(0);
    await expect(page.getByText(/verification email|check your (inbox|email)|confirm/i)).toBeVisible();

    // STEP 10-11: confirmation link + sign in with the new account
    // TODO[assertion]: needs a QA-readable mailbox — see the open question in the .md plan.
  });
});
