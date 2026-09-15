# Test Plan: NPO-15D-F — E&A Portal Sign In / Sign Up (public, functional)

> **Status:** Imported from Azure DevOps 2026-08-20 — 6 public cases (ADO suite 107351). ⚠️ **Read the auth-build
> caveat below before verdicting** — suite 01 established that this build authenticates on **SA ID + mobile OTP**,
> so the email/password + email-verification screens these cases describe may not exist.
> **Owner:** QA
> **Last Updated:** 2026-08-20
> **Estimated Duration:** 900s

## Metadata
| Field | Value |
|-------|-------|
| App URL | https://dsd-npo-publicportal-1-qa.shesha.app/login |
| Environment | QA |
| Login As | mpenduloizwelinuk@gmail.com / 123qwe |
| Lead tester | **Thabiso Kegakwile** |
| ADO Suite | 107351 — *15D E&A Portal Sign In / Sign Up (Public)* (6 cases) |

## Objective
> Verify how a member of the public gets into the Education & Awareness portal: sign-up (with verification),
> duplicate-email handling, sign-in success and failure (without user enumeration), the password-reset link domain,
> and idle session expiry.

## 🔑 Context — resolve this first, it decides half the suite
- **Is the E&A portal a separate auth surface, or the NPO public portal's own login?** 15E reached E&A through the
  *signed-in* public portal nav (**Education and Awareness / FAQs / Contact Us**). STEP 0 of this run is to establish
  whether E&A has its own Sign In / Sign Up route at all. If it does not, these cases inherit the public-portal
  login and the verdicts must say so explicitly rather than pretend a separate screen was tested.
- **Suite 01 precedent:** the live build's account creation is **SA ID + mobile OTP**; several suite-01 cases targeted
  an email/password screen that does not exist. Expect the same collision on TC-001/002/005.
- **Mailbox:** no Graph/mailbox access. Use the **`NotificationMessage`** API route instead to prove an email was
  actually sent and to read its body/link — see [[dsd-npo-notification-audit-via-api]].
- **Enumeration:** suite 01 already filed a **password-reset enumeration + PII** defect. TC-004 is the sign-in-side
  equivalent — check whether the same leak exists on the E&A/portal login path.

## Preconditions
- [ ] Public portal reachable.
- [ ] A known-good account (`mpenduloizwelinuk@gmail.com`) for the positive path.
- [ ] Admin portal login available for the `NotificationMessage` query (email evidence without a mailbox).

## Test Cases

### TC-01 — Sign Up creates an account with email verification (ADO #107360 · TC-15D-001)
*P2 · Src:FDS · Public.* ⚠️ Conditional on an email/password sign-up existing.
- **Steps:** 1. Open the E&A Portal Sign Up page → 2. Enter a synthetic email + strong password + full name →
  3. Submit → 4. Verify the account lands in a *Pending Verification* state and a verification email is sent.
- **Expected:** *"Verification email sent"*; user created in Pending Verification; the link activates the account.
- **Assertions:** [ ] RECORD the actual sign-up field inventory · [ ] confirmation message shown · [ ] verification
  email **proved via `NotificationMessage`** (Sent=1), not assumed · [ ] activation reachable, or record why not.
- **NB:** step 3 of the ADO case reads the mailbox via Graph — substituted with the API evidence route above.
  ⛔ Never record a real identifier; synthetic data only.

### TC-02 — Sign Up rejects an already-registered email (ADO #107361 · TC-15D-002)
*P2 · Src:FDS · Public.* ⚠️ Conditional on TC-01's screen existing.
- **Steps:** 1. Attempt sign-up with an email/ID that already exists.
- **Expected:** helpful rejection (*"Email already registered. Sign in or reset password?"*) **with no enumeration
  leak** — same message regardless of validity.
- **Assertions:** [ ] duplicate blocked · [ ] RECORD the exact wording · [ ] judge it against the case's own
  no-enumeration requirement (the two halves of the expected result conflict — call that out if so).

### TC-03 — Sign In with valid credentials lands on portal home (ADO #107362 · TC-15D-003)
*P2 · Src:FDS · Public.* ✅ Runnable.
- **Steps:** 1. Sign in with valid credentials → 2. Reach the E&A portal home.
- **Expected:** redirect to E&A Portal home; nav shows **Library Topics, FAQ, Contact Us, User Profile**.
- **Assertions:** [ ] sign-in succeeds · [ ] RECORD which of the four nav items actually exist (15E found FAQ groups
  all empty and Contact Us static) · [ ] RECORD whether a **User Profile** entry exists.

### TC-04 — Invalid credentials: clear error, no user enumeration (ADO #107363 · TC-15D-004)
*P2 · Src:FDS · Public.* ✅ Runnable.
- **Steps:** 1. Registered identifier + wrong password → 2. Unregistered identifier + any password.
- **Expected:** the **same** generic failure both times; no timing side-channel.
- **Assertions:** [ ] both messages captured **verbatim** and compared · [ ] response timings recorded for both ·
  [ ] network responses inspected — a generic UI message over a distinguishing API body still leaks
  ([[read-console-before-calling-failure-silent]]).

### TC-05 — Password-reset link points at a live Boxfusion/shesha host (ADO #107364 · TC-15D-005)
*P2 · Src:Code · Public.* ⚠️ Runnable via the notification body, not a mailbox.
- **Steps:** 1. Trigger password reset for a known account → 2. Read the sent message and extract the link host.
- **Expected:** host is a live Boxfusion / `shesha.app` host — **not** a deprecated
  `linux-dsd-npo-*-test.azurewebsites.net` URL (ADO Bug 102886 · F-2026-07-27-01).
- **Assertions:** [ ] reset message located in `NotificationMessage` · [ ] link host extracted and recorded ·
  [ ] host resolves / responds · [ ] regression against Bug 102886 stated either way.

### TC-06 — Session expires after the idle timeout (ADO #107365 · TC-15D-006)
*P2 · Src:Code · Public.* ⏸ Partially runnable — a 30-minute idle wait is not affordable in-session.
- **Steps:** 1. Sign in; capture the session token/expiry → 2. Idle for the policy timeout → 3. Issue a request.
- **Expected:** session invalidated; next request redirects to Sign In.
- **Assertions:** [ ] token lifetime read from the JWT `exp` / storage (the **declared** policy) · [ ] RECORD it ·
  [ ] state plainly that **enforcement after real idle time was not observed** unless it was. Do not verdict PASS off
  the declared lifetime alone.

## Coverage against ADO
| Plan case | ADO | TC id | Runnable? |
|---|---|---|---|
| TC-01 | #107360 | TC-15D-001 | ⚠️ conditional (screen may not exist; no mailbox) |
| TC-02 | #107361 | TC-15D-002 | ⚠️ conditional |
| TC-03 | #107362 | TC-15D-003 | ✅ |
| TC-04 | #107363 | TC-15D-004 | ✅ |
| TC-05 | #107364 | TC-15D-005 | ⚠️ via NotificationMessage |
| TC-06 | #107365 | TC-15D-006 | ⏸ partial (idle wait) |

**6 cases owned.**

## ADO anchors (machine-read — do not delete)
- ADO #107360 · TC-15D-001
- ADO #107361 · TC-15D-002
- ADO #107362 · TC-15D-003
- ADO #107363 · TC-15D-004
- ADO #107364 · TC-15D-005
- ADO #107365 · TC-15D-006

---

## ✅ Executed 2026-08-20 — sign-up/OTP/sign-in run; OTP gate bypassable, no email verification, timing + mobile enumeration
Report: `test-reports/2026-08-20/15d-portal-signin-signup-functional--sign-up-otp-and-enumeration.md`

| Case | Verdict | Note |
|---|---|---|
| TC-15D-001 | 🔴 FAIL | account usable immediately; **no email-verification step**; mismatch handled ✅, weak-pw rejected w/ generic toast ⚠️ |
| TC-15D-002 | ⚠️ PARTIAL | duplicate blocked, but `MobileNoAlreadyInUse` enumerates (unauth, cross-origin) |
| TC-15D-003 | ✅ PASS (note) | lands authenticated; **no User Profile** nav item |
| TC-15D-004 | 🔴 FAIL | message generic, but **timing side-channel** (~170ms real vs ~65ms fake) enumerates |
| TC-15D-005 | ⏸ DEFERRED | folded into the 08-18 password-reset defect; link-domain check needs the reset email |
| TC-15D-006 | ⚠️ PARTIAL | token TTL **5 days** (declared); idle enforcement not observed |

🔑 No separate E&A auth surface — verdicted against the DSD public-portal login that gates E&A. New bugs:
`bugs/2026-08-20-mobile-otp-verification-gate-bypassable-via-url.md` (High/Critical),
`bugs/2026-08-20-sms-otp-send-failure-recorded-as-sent.md` (Med-High). Revises the 08-18 "no password / not
executable" note: screen 3 **does** have Password + Confirm.
