# Report: NPO-15D-F — E&A Portal Sign In / Sign Up (public)

**Date:** 2026-08-20 06:35 UTC
**Plan:** test-plans/education-awareness/15d-portal-signin-signup-functional.md
**Execution Mode:** ai-driven (Playwright MCP, live QA public + admin portals)
**Result:** FAILED — sign-up + sign-in work, but the mobile-OTP gate is bypassable, no email-verification step exists, and both the sign-in timing and the sign-up mobile check leak account existence
**Duration:** ~1400s
**Cases:** TC-15D-001, TC-15D-002, TC-15D-003, TC-15D-004, TC-15D-005, TC-15D-006
**Environment:** QA · public portal (`/login`, `/no-auth/…/dsd-public-portal-send-otp`, `/no-auth/…/signUp-public-portal`) · admin portal (OTP Audit)

## Summary
| Case | Area | Verdict |
|---|---|---|
| TC-15D-001 | Sign Up + verification | 🔴 FAIL — account is usable immediately; **no email-verification step exists** |
| TC-15D-002 | Sign Up rejects duplicate | ⚠️ PARTIAL — duplicate blocked, but the message enumerates (see below) |
| TC-15D-003 | Sign In valid → portal home | ✅ PASS (note) — lands authenticated; nav has **no User Profile** item |
| TC-15D-004 | Invalid sign-in, no enumeration | 🔴 FAIL — message is generic, but a **response-timing side-channel** distinguishes real vs fake accounts |
| TC-15D-005 | Reset link domain | ⏸ DEFERRED — carried by the existing 08-18 reset defect; not re-driven |
| TC-15D-006 | Idle session expiry | ⚠️ PARTIAL — token TTL is **5 days**; real idle-expiry not observed |

🔑 There is **no separate E&A-portal auth surface** — E&A is reached through the signed-in DSD public portal. So these
cases are verdicted against the **DSD public-portal** sign-in/up, which is the login that gates E&A. Recorded as
STEP 0.

Two new bugs filed:
- `bugs/2026-08-20-mobile-otp-verification-gate-bypassable-via-url.md` **(High/Critical)**
- `bugs/2026-08-20-sms-otp-send-failure-recorded-as-sent.md` **(Medium-High)**

## STEP 0 — the account-creation journey (settles TC-001/002 and revises the 08-18 inventory)
The real sign-up journey is a 3-screen flow, all under `/no-auth/boxfusion.dsdnpo/…`:
1. **Verify Mobile** (`dsd-public-portal-send-otp`) — Mobile Number (`maxLength 10`) → *Verify Number* → *Send OTP*.
2. **Verify OTP** (same route) — Verification Code (6 digits) → *Verify*.
3. **Sign-up details** (`signUp-public-portal?default=<verified number>`) — First Name (`maxLength 50`), Last Name
   (`maxLength 50`), Email Address → *Next* → **Password + Confirm Password** → *Sign Up*.

🔑 **Correction to the 08-18 note.** Suite 01 recorded "sign-up is email + mobile-OTP with **no password**". With SMS
delivery dead, screen 3's password step was never reached. Driven end-to-end today (using the OTP read from the admin
audit), **screen 3 does have Password + Confirm Password.** So the SA-ID/password cases marked "not executable" on
08-18 are partly executable after all — see TC-001 below.

## 🔴 TC-15D-001 — Sign Up creates an immediately-usable account with NO email verification
Completed a full synthetic sign-up (`qa.synthetic.ea15d@example.test`, mobile `0123456789`, password set on screen 3):
- On **Sign Up** the app drops straight to `/login` with **no confirmation message** ("Verification email sent" or
  otherwise) and **no Pending-Verification state**.
- The new account **signs in right away** and lands authenticated on the portal.
- The ADO case requires *"Confirmation: 'Verification email sent'. User record created in Pending Verification state"*
  followed by an email-link activation. **None of that exists** → FAIL. Either email verification is unimplemented or
  the case describes an unbuilt design — a question for Thabiso.
- Incidental: the first synthetic account rendered an existing NPO ("Nomfanelo QA Test NPO 2026-08-13") on its landing
  page; the second (clean) account did not. Flagged, not chased.
- Sub-findings folded in:
  - **Password mismatch is handled** — different Password/Confirm gives an inline *"The passwords do not match!"*
    (revises the 08-18 "TC-01-015 not executable"). ✅
  - **Weak password is rejected** but only with a generic toast *"Registration failed! Please check details…"* that
    never states the policy. ⚠️ (revises the 08-18 "TC-01-016 not executable"; the rejection works, the feedback is poor.)
- Evidence: `evidence/15d-signup-form.png`.

## ⚠️ TC-15D-002 — Duplicate is blocked, but the check enumerates registered numbers
On **Verify Mobile**, an already-registered number returns the toast *"Mobile Number Already Exist"*; an unused number
returns *"Mobile Number Valid, Click Sent OTP"*. The underlying call is
`GET /api/services/dsdnpo/NpoPerson/MobileNoAlreadyInUse?mobileNumber=<n>` → `{result:true|false}`, and it answers
**unauthenticated and cross-origin**. So anyone can probe whether a given mobile number is registered. The duplicate
*is* prevented (good), but the case's own "no enumeration leak" requirement is violated → PARTIAL. (This is the
mobile-side twin of the 08-18 password-reset enumeration defect.)

## ✅ TC-15D-003 — Valid sign-in lands on the portal home
`mpenduloizwelinuk@gmail.com` signs in and lands on `/dynamic/boxfusion.dsdnpo/npo-landing-view`. Nav shows
**Dashboard · Register NPO · Education and Awareness · Contact Us · FAQs**. RECORD: the case expects a **User Profile**
item — there is **none** in the nav. FAQ groups were all empty and Contact Us is static (both from 15E), so of the
four nav items the case names, only Library-Topics-equivalent (E&A) and FAQ exist, and neither Contact-form nor
Profile is functional.

## 🔴 TC-15D-004 — Generic message, but a timing side-channel enumerates
Both a registered-email/wrong-password and an unregistered-email attempt return the **identical** message
*"Invalid user name or password"* (UI toast and the `POST /api/TokenAuth/Authenticate` 401 body match exactly). Good.
**But** the response timing separates the two consistently over 3 samples each:
- registered email + wrong password: **~166–1815 ms** (first call 1815 ms cold, then 166/198 ms)
- unregistered email: **~59–87 ms**

The registered path is repeatably slower (the password hash is actually computed only when the user exists), which is
a **timing side-channel** the case explicitly forbids (*"Timing responses are similar (no timing side-channel)"*) →
FAIL. Indicative (3 samples, QA network); worth a server-side constant-time check by dev. I stopped at 3 wrong-password
attempts against the shared account to avoid the ABP lockout.

## ⏸ TC-15D-005 — Reset link domain
Not re-driven today. The 08-18 password-reset defect
(`bugs/2026-08-18-password-reset-enumerates-users-and-leaks-contact-details.md`) already covers the reset flow; the
Boxfusion-vs-Azure link-domain check (ADO Bug 102886) needs the reset email body via `NotificationMessage`, which is
deferred to the same sitting that retests that bug.

## ⚠️ TC-15D-006 — Session lifetime
The access token in `localStorage` carries `exp − iat = 432000 s = 5 days` (the API's `expireInSeconds` field agrees).
That is the **declared** lifetime; a real 30-minute idle-then-request was not waited out, so enforcement-after-idle is
unverified. RECORD: a **5-day** token for a public citizen portal is long — raise with Thabiso against the intended
idle-timeout policy. Verdict PARTIAL (declared value read, enforcement not observed).

## Method notes
- OTP obtained from the **admin OTP Audit** (`/dynamic/Shesha/otp-audit-table`, entity `Shesha.Domain.OtpAuditItem`),
  not a phone — SMS delivery is down (credit). The audit shows the OTP in clear text next to the recipient number.
- Toasts captured with a MutationObserver armed **before** the click (AntD toasts live ~3 s), per
  [[read-console-before-calling-failure-silent]] — an after-the-fact poll missed the first one.
- Enumeration/timing measured at the **API** layer via `fetch` from the page, then cross-checked against the UI toast.
- ⛔ All data synthetic; no real identifier recorded ([[never-record-real-personal-identifiers]]).
