# Report: NPO-01-F — Authentication & Account Creation (functional) — sign-in, reset, sign-up inventory

**Date:** 2026-08-18 08:05 UTC
**Plan:** test-plans/auth/01-authentication-account-creation-functional.md
**Execution Mode:** ai-repair
**Result:** FAILED — 3 passed, 4 failed, 2 partial of 9 attempted; a **CRITICAL unauthenticated-API-access** finding surfaced, plus **user + PII enumeration** on password reset
**Duration:** ~1500s
**Cases:** TC-01-002, TC-01-003, TC-01-004, TC-01-005, TC-01-006, TC-01-007, TC-01-008, TC-01-020, TC-01-021
**Environment:** QA · public portal · signed-out · view mode Latest
**Accounts used:** `mpenduloizwelinuk@gmail.com` (shared dev login, sign-in cases) · `qa.tester0812@example.org` (exists, used only against `example.org` so no third party is contacted)

## Summary
| Total attempted | Passed | Failed | Partial |
|---|---|---|---|
| 9 | 3 | 4 | 2 |

| Case | ADO | Verdict | One-liner |
|---|---|---|---|
| TC-01-002 wrong password | #101596 | ✅ PASS | Generic *"Invalid user name or password"*, stays on Sign-In |
| TC-01-003 non-existent email | #101597 | ✅ PASS (wording) | Same generic message… but see the **timing** side-channel below |
| TC-01-004 malformed email | #101598 | 🔴 FAIL | No field-level validation; malformed value is POSTed; generic error only |
| TC-01-005 empty fields | #101599 | 🔴 FAIL | No required-field errors; request fires with empty creds; **client crashes on the 415** |
| TC-01-006 forgot-password link | #101600 | ✅ PASS | Reset view opens (asks for *Username*, not email) |
| TC-01-007 reset for registered email | #101601 | ⚠️ PARTIAL | Advances… and **discloses masked email + last-4 of mobile** to anyone |
| TC-01-008 reset for unregistered email | #101602 | 🔴 FAIL | *"Your username is not recognised"* — **explicit user enumeration** |
| TC-01-020 email case / password case | #101614 | ✅ PASS | Email case-insensitive, password case-sensitive |
| TC-01-021 OTP-stress endpoint gating | #101615 | 🔴🔴 **FAIL (CRITICAL)** | Endpoint returns a raw OTP pin to an **anonymous** caller |

Plus **Step 0** — the sign-up field inventory that verdicts the eight account-creation cases (below).

## 🔴🔴🔴 CRITICAL — the API is reachable without authentication (TC-01-021, and wider)
Bug: `bugs/2026-08-18-api-reachable-without-authentication.md`.

TC-01-021 asks whether `npoOtpStressTesting/GetOtpByEmailAddressOrPhoneNumber` is gated. It is **not** — and testing it uncovered that the problem is not limited to that one endpoint.

**Proven anonymous, three independent ways (signed out, `localStorage` empty, no cookies, `credentials:'omit'`):**
1. `GET …/app/Session/GetCurrentLoginInfo` → `200`, **`user: null`** — the server itself confirms the caller is unauthenticated.
2. `GET …/dynamic/boxfusion.dsdnpo/NpoOrganisation/Crud/GetAll` → `200`, **`totalCount: 320590`** — the entire NPO register, anonymously.
3. `GET …/services/dsdnpo/npoOtpStressTesting/GetOtpByEmailAddressOrPhoneNumber?emailAddressOrPhoneNumber=<a number>` → `200`, returning a JSON object containing a **live OTP `pin`**, `sendTo`, `expiresOn`.

**Method note on verbs:** a `POST` (as the ADO case writes it) returns `405 Method Not Allowed`; the endpoint is a Shesha `Get*` service, so it answers **GET with a query string**. The `405` is why a naive POST test would wrongly read as "blocked".

**Verdict vs the case:** the required *"403 Forbidden / not accessible"* does **not** happen — an anonymous GET reaches business logic. The drift note's worst case (*"HIGH security risk if reachable from prod by any authenticated user"*) is **worse than written**: it is reachable by **no** user.

🔑 **I stopped probing here deliberately.** The finding was established with a row count, a session-info check, and one already-expired OTP. Pulling any of the 320 590 records would mean handling real personal data (office-bearer SA IDs), which the project rules forbid. The retrieved OTP pin value is **not transcribed** into this report or the bug file. Scope-mapping the full anonymous surface belongs to **suite 14Z** with the dev team's knowledge, not to unilateral enumeration.

▶ **This needs to go to Thabiso today, ahead of any other finding.**

## 🔴 Password reset enumerates users AND leaks PII (TC-01-007 / TC-01-008)
Bug: `bugs/2026-08-18-password-reset-enumerates-users-and-leaks-contact-details.md`.

The sign-in flow is correctly non-committal (*"Invalid user name or password"* for both wrong-password and non-existent accounts). The **reset flow throws that away**:
- **Unregistered** username → persistent red banner **"Your username is not recognised"** (a yes/no oracle). *Evidence: v11.*
- **Registered** username → advances to *"Select password reset method"* showing **"Email a link to `qa.te********@****ple.org`"** and **"SMS an OTP to `(***)-***-0598`"**. *Evidence: v12.*

So an unauthenticated visitor who guesses an email learns: the account exists, the shape of the registered email, **and the last four digits of the registered mobile**. That is a POPIA concern (→ suite 14Y) on top of the enumeration. **TC-01-008 FAILS** its "must not reveal whether the email exists" assertion; **TC-01-007 is PARTIAL** — the method-select step is reasonable, but the masked-contact disclosure to an unauthenticated caller is a defect.
⚠️ The *email-delivery* half of TC-01-007 was **not** verified — I did not complete a reset (it would consume the shared account / a real mailbox). Verify via `NotificationMessage` next time.

## 🔴 Sign-in has no client-side validation, and empty creds crash the error handler
- **TC-01-004 (malformed email) FAIL.** `not-an-email` produces **no field-level error**; the value is POSTed; the server returns `401` and the UI shows the generic **"Invalid user name or password"** (captured via a MutationObserver — the toast is an `ant-message-notice-error` that auto-dismisses in ~3s). The case wants *"Enter a valid email; submit not processed"* — neither holds.
- **TC-01-005 (empty fields) FAIL.** Both fields empty and **pristine**: zero required-field errors, zero `aria-invalid`, `Login` is **enabled**, and it **fires the request anyway**. The server returns **`415 Unsupported Media Type`** and the client's handler then throws
  **`TypeError: Cannot read properties of null (reading 'details')`** — it assumes an error-payload shape the 415 doesn't have, so **no message reaches the user at all**. That crash is why empty-field submits are silent while other failures show the toast.

🔑 **Method correction, worth recording:** I first reported TC-01-004 and TC-01-005 as "no feedback whatsoever" from a DOM snapshot taken ~2.5s after the click. The user challenged it. A **MutationObserver** installed before the click then caught the toast for the credential cases — my selector was right, my **timing** was wrong (AntD toasts live ~3s). Re-tested: the wrong-password/wrong-email/malformed cases **do** toast; only the **415 (empty fields)** path is genuinely silent, and for a specific reason (the handler crash). See [[read-console-before-calling-failure-silent]] — extended: also watch async toasts with an observer, don't sample once.

## ✅ Passes
- **TC-01-002** — valid email + wrong password → *"Invalid user name or password"*, stays on Sign-In. Correct.
- **TC-01-003** — non-existent email → **identical** wording, stays on Sign-In. Passes on wording (but see timing).
- **TC-01-006** — Forgot Password link opens the reset view. 📌 It asks for *"your Username"* while the case and the whole portal use **email** — wording mismatch to raise.
- **TC-01-020** — `MPenduloIzwelinuk@GMAIL.com` + correct password **authenticated** (email case-insensitive); correct email + `123QWE` (altered case) was **refused** (password case-sensitive). Both steps pass.

## ⚠️ Timing side-channel undercuts the enumeration defence (TC-01-003)
Even though the sign-in *wording* is generic, the **response time** is not:

| Scenario | `TokenAuth/Authenticate` time |
|---|---|
| Non-existent account (6-sample baseline) | **41–50 ms** (one 124 ms warm-up) |
| Existing account, wrong password (sample 1) | **948 ms** |
| Existing account, wrong password (sample 2) | **234 ms** |

The server only does password-hashing work when the account exists, so existing-vs-nonexistent separates cleanly with **no overlap** across these samples. This is a **timing oracle** — weaker than the reset-flow banner, but it means fixing the reset flow alone does not make the portal non-enumerable.
⚠️ **2 existing-account samples only** — flagged as a strong signal needing a proper 20+ sample measurement run, not stated as a settled oracle. (I did not spend more failed attempts on the shared account; the safe non-existent side has plenty of samples.)

## ✅ Safe half of the lockout case, done without risk (TC-01-019 groundwork)
Six rapid consecutive failed `Authenticate` calls against **non-existent** emails all returned plain `401` — **no `429`, no CAPTCHA, no throttling, no delay ramp**. So there is no evidence of rate-limiting at the API. The real per-account lockout threshold (TC-01-019) remains **not executed** — it can lock the shared login and needs a throwaway account + your go-ahead.

## 🔑 Step 0 — sign-up field inventory (verdicts the 8 account-creation cases)
You corrected me here, rightly: the journey **does** capture a mobile number — I had bypassed the step that collects it. Full inventory, driven through the proper flow:

| Step | Route | Fields |
|---|---|---|
| 1. Verify Mobile | `…/dsd-public-portal-send-otp` (the visible **Register** link) | **Mobile Number** (text, `maxLength 10`) → *Verify Number* / *Send OTP* |
| 2. Sign-up details | `…/signUp-public-portal` (hidden `Sign Up` link) | **Mobile Number** (display label, carried from step 1) · **First Name** (`maxLength 50`) · **Last Name** (`maxLength 50`) · **Email Address** (no maxLength) |

**Absent from the entire journey: SA ID Number, Password, Confirm Password.** (On the direct `signUp-public-portal` route the Mobile label renders with no value because step 1 was skipped — that is why I first wrongly called it a missing field. It is a display slot, not a broken input.)

**Consequences for the gated cases:**
| Case | ADO | Verdict | Why |
|---|---|---|---|
| TC-01-011 invalid SA ID format | #101605 | ⛔ NOT EXECUTABLE | no SA ID field exists |
| TC-01-012 SA ID Luhn | #101606 | ⛔ NOT EXECUTABLE | no SA ID field exists |
| TC-01-013 DHA verification fails | #101607 | ⛔ NOT EXECUTABLE | no SA ID field → no DHA call in this journey |
| TC-01-015 password mismatch | #101609 | ⛔ NOT EXECUTABLE | **no password fields** — account uses mobile-OTP, not a password set at sign-up |
| TC-01-016 password policy | #101610 | ⛔ NOT EXECUTABLE | as above |

These five are **"case does not match the build"**, not application failures — the same status as smoke TC-01-010. **The decision Thabiso owes is now concrete: rewrite these five against the email + mobile-OTP design, or is the FDS SA-ID/password *Create User Account* form still to be built?**

Still conditionally runnable once OTP delivery works (blocked on SMS credit / TC-01-021's endpoint): **TC-01-017** (duplicate email — the mobile-verify step may block a used number) and **TC-01-018** (whitespace trim on email). **TC-01-014** (DHA down) and **TC-01-022** (re-register after delete) remain blocked on fault-injection and developer DB access.

## Observations for the test lead
1. 🔴🔴🔴 **The API answers unauthenticated requests** — the NPO register (320 590 rows) and a raw-OTP endpoint both returned data to a signed-out caller. **Please look at this first.**
2. 🔴 **Password reset enumerates users and leaks masked email + last-4 mobile** to anyone.
3. 🔴 **Login has no client-side validation**; empty credentials trigger a 415 that **crashes the error handler**, so the user sees nothing.
4. ⚠️ **Timing side-channel** on sign-in (existing vs non-existent) — worth a proper measurement run.
5. **No API rate-limiting observed** on repeated failed sign-ins.
6. **Sign-up is email + mobile-OTP with no SA ID and no password** — please rule on rewriting TC-01-011/012/013/015/016.
7. Wording: reset page says *"Username"* where the portal uses email; the "not recognised" banner should be made generic.

## 📸 Evidence — `test-reports/2026-08-18/evidence/`
| File | Shows |
|---|---|
| `v9-malformed-email-no-feedback-401-sent.png` | Malformed email, moment after submit (toast already dismissed — see method note) |
| `v10-wrong-password-immediate.png` | Wrong-password state |
| `v11-forgot-password-enumerates-username-not-recognised.png` | *"Your username is not recognised"* for an unregistered email |
| `v12-forgot-password-discloses-masked-email-and-phone.png` | Reset method-select leaking masked email + last-4 mobile |
| `v13-signup-form-four-fields-no-id-no-password.png` | Sign-up details form: name + email, no SA ID, no password |

## Method notes
- 🔑 **MutationObserver, not a delayed snapshot,** is the right tool for AntD toasts (≈3s lifetime). Installed before each click; recorded text + class + timestamp.
- 🔑 **Verify "anonymous" against the server's own view** (`GetCurrentLoginInfo` → `user:null`) rather than assuming a cleared `localStorage` means unauthenticated.
- 🔑 Raw `fetch` does **not** attach Shesha's Bearer token (that is an axios interceptor), so `fetch` calls are genuinely unauthenticated unless a header is set explicitly — which is what made the anonymous test valid.
- 🔑 Shesha `Get*` app-service methods are **GET-with-query**; a POST returns 405 and can masquerade as "blocked".
