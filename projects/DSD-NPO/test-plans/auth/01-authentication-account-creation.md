# Test Plan: NPO-01 — Authentication & Account Creation (smoke)

> **Status:** Imported from Azure DevOps — not yet executed
> **Owner:** QA
> **Last Updated:** 2026-08-13
> **Estimated Duration:** 120s

## Metadata
| Field | Value |
|-------|-------|
| App URL | https://dsd-npo-publicportal-1-qa.shesha.app/login |
| Environment | QA |
| Login As | mpenduloizwelinuk@gmail.com / 123qwe |
| Lead tester | **Thabiso Kegakwile** — author of the ADO cases |
| ADO Plan | [planId 101541 — DSD-NPO Smoke Test Plan](https://dev.azure.com/boxfusion/Boxfusion%20Test%20Plans/_testPlans/execute?planId=101541&suiteId=101858) |
| ADO Suite | 101858 — *01 - Authentication & Account Creation* (3 cases) |

## Objective
> Verify the public portal's front door: a registered submitter can sign in and reach the logged-in landing page, the Create User Account screen is reachable, and a new account can be created with an SA ID number that passes DHA verification.

## Provenance
Imported from the ADO **smoke** plan on 2026-08-13. Every expected result below is **quoted from the ADO test case**, not inferred — see [test-plans/RULES.md](../RULES.md) and the project rule that business rules come from the test lead.

⚠️ **All ADO cases are in state `Design`.** They are authored but not signed off, so an expected result may still change. Where the app disagrees with a case, say which one needs changing rather than assuming the app is wrong.

🔑 **The TC series is split across two ADO plans.** TC-01-001/009/010 are in the Smoke plan; TC-01-002→008 and 011→022 are in the **Functional** plan (suite 101884) and are **not** covered here. They are the "missing functional stuff" to add later.

## Preconditions
- [ ] Public portal reachable at https://dsd-npo-publicportal-1-qa.shesha.app/login
- [ ] A confirmed submitter account exists (`mpenduloizwelinuk@gmail.com` / `123qwe`, or the QA account `qa.tester0812@example.org` / `Boxfusion@2026`)
- [ ] DHA integration is up (TC-03 only)
- [ ] 🔑 Switch the header view mode **Live → Latest** immediately after login (project rule — every run)

## Test data
| Field | Value |
|---|---|
| Valid SA ID | `8001015009087` — the ADO case's own example (checksum-valid) |
| Email | must be **unique per run** — date-stamp it, e.g. `qa.tester<DDMM>@example.org` |
| Mobile | `0818400598` where a number is asked for |
| Password | `Boxfusion@2026` |

⚠️ **Mobile numbers are unique per person on this environment.** `0818400598` and `0818400512` are both already taken, so TC-03 needs a fresh number or it will fail on a duplicate — and that failure currently looks like success (see the note under TC-03).

## Test Cases

### TC-01 — Sign in with valid email and password (ADO #101595 · TC-01-001)

*Priority 1 · Positive · Public portal.*

- **Type:** Happy path
- **Steps:**
  1. NAVIGATE to https://dsd-npo-publicportal-1-qa.shesha.app/login
  2. WAIT for `input[type=password]` — this marks hydration on the Next.js SPA; a fixed delay is not enough
  3. SNAPSHOT
  4. ASSERT the Sign-In page shows **Email**, **Password**, a **Forgot Password** link and a **Create User Account** button *(ADO expected result, FDS Fig.6)*
  5. TYPE the email, TYPE the password
  6. CLICK **Sign In**
  7. ASSERT (BLOCKING) the user is authenticated and lands on the logged-in landing page *(FDS Fig.8 or Fig.9 depending on linked NPOs)*
  8. Switch the header view mode from `Live` to `Latest`
- **Expected result:** *"User is authenticated and redirected to the Logged-In landing page (FDS Fig.8 or Fig.9 depending on linked NPOs)"*
- **Assertions:**
  - [ ] ASSERT the four Sign-In page elements are present
  - [ ] ASSERT (BLOCKING) authentication succeeds
- **✅ RETRACTED 2026-08-13 — there is no routing deviation.** This previously read *"login lands on
  `/dynamic/Shesha.Workflow/workflows-inbox`, not an NPO landing page"*. **That was the ADMIN portal.** The
  **public** portal lands on `/dynamic/boxfusion.dsdnpo/npo-landing-view?id=<npoId>` — an NPO landing page,
  exactly as #101595 prescribes. Verified 2026-08-13 signing in as `mpenduloizwelinuk@gmail.com`.
- **🔴 Real defect found instead:** a **failed** login is completely silent — `POST /api/TokenAuth/Authenticate`
  returns **401** and the UI shows nothing at all. See `test-reports/bugs/2026-08-13-failed-login-gives-no-feedback.md`.
  ⚠️ `qa.tester0812@example.org` (listed in the preconditions above) **401s on the public portal** — use
  `mpenduloizwelinuk@gmail.com` until that is resolved.
- **⚠️** `404 /api/services/dsdnpo/NpoPerson/CurrentPersonLogin` fires on this page. Note it; it has not been tied to a user-visible symptom.

---

### TC-02 — Create User Account button opens the Create Account screen (ADO #101603 · TC-01-009)

*Priority 1 · Positive · Public portal.*

- **Type:** Happy path (navigation)
- **Steps:**
  1. NAVIGATE to the Sign-In page (signed out)
  2. SNAPSHOT
  3. CLICK **Create user account**
  4. ASSERT (BLOCKING) the Create User Account screen is displayed *(FDS Fig.7)*
  5. ASSERT the form carries exactly these controls: **Email**, **ID Number**, **Password**, **Confirm Password**, and a **Complete Sign-up** button
- **Expected result:** *"Create User Account screen (FDS Fig.7) displayed with Email, ID Number, Password, Confirm Password, and Complete Sign-up button"*
- **Assertions:**
  - [ ] ASSERT (BLOCKING) the Create User Account screen opens
  - [ ] ASSERT all five prescribed controls are present
- **📌 Note:** the ADO case prescribes a **five-control** form. The admin-side *Register New User* modal we drove on 2026-08-12 has **eight** fields — that is a different screen (`Administration → User Management`), not this one. Do not conflate them.

---

### TC-03 — Create account with a valid SA ID passes DHA validation (ADO #101604 · TC-01-010)

*Priority 1 · Positive · Public portal. Needs the DHA integration up.*

- **Type:** Happy path (end-to-end account creation)
- **Steps:**
  1. NAVIGATE to Create User Account (TC-02)
  2. ASSERT the form is displayed
  3. TYPE a **unique** email
  4. TYPE ID Number `8001015009087` *(the ADO case's own example)*
  5. TYPE Password `Boxfusion@2026`, TYPE the same into Confirm Password
  6. CLICK **Complete Sign-up**
  7. API — capture the create request **and its response body**, including any non-2xx
  8. ASSERT (BLOCKING) the DHA verification call is made and succeeds
  9. ASSERT the account is created and a **verification-email-sent** confirmation is shown
  10. Open the inbox and CLICK the confirmation link
  11. ASSERT the account is confirmed and the new user can sign in
- **Expected result:** *"DHA verification call is made and succeeds. Account is created. User sees verification-email-sent confirmation."* then *"Account is confirmed and user can sign in"*
- **Assertions:**
  - [ ] ASSERT (BLOCKING) account creation succeeds
  - [ ] ASSERT a verification-email-sent confirmation is displayed
  - [ ] ASSERT the confirmation link confirms the account
  - [ ] ASSERT the new account can sign in
- **🔑 Capture the response body of any `>=400` POST.** On 2026-08-12 `POST /api/services/app/UserManagement/Create` returned **400** with `"Specified mobile number already used by another person"` in the ABP `validationErrors` envelope and **the UI discarded it silently** — the modal closed and looked exactly like success. A closing form is never proof of a save; assert retrievability separately. Logged as `test-reports/bugs/2026-08-12-validation-errors-not-surfaced.md`.
- **❓ Question for Thabiso:** this case needs a **real inbox** for the confirmation link. Which mailbox should QA use for `<unique>@example.org` sign-ups, or is there a test-env way to confirm an account without email?
- **📌 Related:** the OTP path has its own retrieval endpoint — see `TC-01-021` (ADO #101615) in the Functional plan, which documents `POST /api/services/dsdnpo/npoOtpStressTesting/GetOtpByEmailAddressOrPhoneNumber` as returning the OTP in test. That is a **security case in its own right** (it must be admin-gated and disabled in production), but it also unblocks OTP-dependent sign-up testing.

---

## Coverage against ADO

| Plan TC | ADO id | ADO TC | Title | Reachable today |
|---|---|---|---|---|
| TC-01 | #101595 | TC-01-001 | Sign-in with valid credentials | ✅ yes |
| TC-02 | #101603 | TC-01-009 | Create User Account button navigates | ✅ yes |
| TC-03 | #101604 | TC-01-010 | Create account with valid SA ID / DHA | ⚠️ needs a fresh mobile + a reachable inbox |

**Not in this plan** (Functional suite 101884, to import later): TC-01-002 wrong password · 003 non-existent email · 004 malformed email · 005 empty fields · 006/007/008 forgot-password and enumeration · 011/012 SA ID format and Luhn · 013/014 DHA failure and outage · 015 password mismatch · 016 password policy · 017 duplicate email · 018 whitespace trim · 019 lockout · 020 case sensitivity · 021 OTP stress-testing endpoint security · 022 re-register after delete.
