# Test Plan: NPO-01-F — Authentication & Account Creation (functional)

> **Status:** Imported from Azure DevOps 2026-08-18 — ⚠️ **half the suite is written against a screen that does not exist.** The sign-in cases are runnable today; the account-creation cases need a decision from Thabiso first.
> **Owner:** QA
> **Last Updated:** 2026-08-18
> **Estimated Duration:** 1500s (sign-in cases only; account-creation cases are gated — see below)

## Metadata
| Field | Value |
|-------|-------|
| App URL | https://dsd-npo-publicportal-1-qa.shesha.app/login |
| Environment | QA |
| Login As | mpenduloizwelinuk@gmail.com / 123qwe |
| Lead tester | **Thabiso Kegakwile** |
| ADO Plan | [planId 101543 — DSD-NPO Functional Test Plan](https://dev.azure.com/boxfusion/Boxfusion%20Test%20Plans/_testPlans/define?planId=101543&suiteId=101884) |
| ADO Suite | 101884 — *01 - Authentication & Account Creation* (20 cases in ADO; **19 owned here**) |

## Objective
> Verify the public portal's front door beyond the happy path: sign-in error handling and user-enumeration resistance,
> the forgot-password flow, account-creation validation (SA ID format, Luhn, DHA outcomes, password policy, duplicate
> email, whitespace), account lockout, email/password case sensitivity, and the security of the OTP stress-testing
> endpoint.

## ⚠️ TC-01-001 is NOT a case in this plan
Work item **#101595 (TC-01-001)** *"Sign-in with valid email and password"* is a member of **both** suites and is
**owned and already executed by the smoke plan** (`test-plans/auth/01-authentication-account-creation.md`, PASSED
2026-08-13). Excluded here so the two plans do not double-count.
🔑 The smoke plan states the split explicitly: **TC-01-001/009/010 are smoke; TC-01-002→008 and 011→022 are
functional.** Note the suite's own numbering skips **009 and 010** for exactly that reason — but it *does* still carry
001, which is the overlap to strip.

## 🔴🔴 READ THIS FIRST — eight cases describe a screen that is not in the build
The 2026-08-13 smoke run established, and evidenced, that:
- **TC-01-009 FAILED — the *Create User Account* screen does not exist.** *"Not one of the five prescribed controls is
  present."* Sign-up is instead a **mobile-OTP design** (`/no-auth/boxfusion.dsdnpo/dsd-public-portal-send-otp`).
- **There is no ID Number field anywhere in the sign-up journey**, which made smoke **TC-01-010 NOT EXECUTABLE**.
- **OTP is never delivered** — `bugs/2026-08-12-otp-never-delivered-public-self-registration.md`. SMS fails because
  the QA Vodacom account is out of credit (see the notification-audit memory), and **every mobile number we hold is
  already taken** on this environment.

Every case below whose steps begin *"Open Create User Account …"* or end *"click Complete Sign-up"* inherits that
problem: **TC-08, TC-09, TC-10, TC-11, TC-12, TC-13, TC-14, TC-15** (= TC-01-011/012/013/014/015/016/017/018).

⚠️ **Do not pre-verdict them from this note.** The OTP sign-up journey *does* exist and may well collect email,
password and mobile — so password-mismatch, password-policy and duplicate-email may be testable against **that** form
even though the SA ID cases cannot be. **Step 0 of any run is to enumerate the real sign-up form's fields** and record
them; only then can each case be verdicted as *fails*, *not executable*, or *needs the case rewritten*.

▶ **Decision required from Thabiso — the same one still open on smoke TC-01-010:** do these cases get rewritten
against the mobile-OTP design, or is the FDS *Create User Account* form still meant to be built? Eight P1/P2 cases
hang on the answer.

## 🔑 Run TC-18 (TC-01-021) EARLY — it may unblock the OTP-dependent cases
TC-01-021 is nominally a security case, but its subject is
`POST /api/services/dsdnpo/npoOtpStressTesting/GetOtpByEmailAddressOrPhoneNumber`, which **returns the OTP in test
environments**. The smoke plan already flags this: *"it also unblocks OTP-dependent sign-up testing."*

So the sequencing is: **establish whether that endpoint yields an OTP → if it does, the sign-up journey becomes
drivable end-to-end**, which is what TC-14 and TC-15 need. If it does not, those two stay blocked on SMS delivery.
⚠️ Retrieving an OTP this way is a **test-harness route, not the user journey** — say so in the report, and do not let
it mask the underlying "OTP never delivered" defect.

## ⛔🔴 TC-16 (TC-01-019) IS DANGEROUS — do not run it casually
The case requires deliberately failing sign-in *"the configured number of times (e.g., 5)"* until the account locks.
**`mpenduloizwelinuk@gmail.com` is the single shared account that logs into BOTH portals**, and CLAUDE.md notes it is
almost certainly the developer's own. Locking it would **halt all DSD-NPO testing**, for us and for anyone else on QA.

▶ **Run it only against a throwaway account we created ourselves, and only after asking.** If no such account can be
created (see the OTP blocker), leave TC-16 unexecuted and say why — an untested lockout rule is a far smaller cost
than an environment-wide outage. 📌 Its drift note already says *"Account lockout/throttling not visible in app code."*

## ⛔ Cases needing access we do not have
Per the standing instruction to drive the **UI only** and not manufacture state through the app's APIs:
- **TC-11 (TC-01-014)** — needs **DHA forced to 5xx**. Same dependency as suite 04's TC-04-006/009.
  **❓ Still waiting on Thabiso** for whether DHA/CIPC failure can be simulated on QA.
- **TC-18 (TC-01-021) step 2** — *"As admin in PROD environment"*. **We do not test in production.** Step 1 (non-admin
  → 403) is in scope, but see the caveat below.
- **TC-18 step 1 caveat** — it needs a **non-admin** signed-in user. Our only working login is the broadly-privileged
  developer account, so a 200 from it would prove nothing about the gate. **This case cannot be honestly verdicted
  until we have role-scoped users** — the standing dependency across 14Z as well.
- **TC-19 (TC-01-022)** — explicitly requires *"a developer with database delete capability"* plus direct
  `Core_OrganisationPersons` reads. That is a **developer task, not a UI test**. Listed, **not scheduled**.

## Provenance
Imported from ADO on 2026-08-18 via the browser + REST route ([[read-ado-via-browser-rest-api]]) — cookies were still
valid, no sign-in needed. Expected results are **quoted verbatim**. All 20 cases are state `Design`.
Sources across the 19 owned: **3 `Src:Both`** (002, 003, 013) · **14 `Src:FDS`** · **2 `Src:Code`** (021, 022).
**6 carry `Drift-Risk`**: 007, 008, 014, 016, 019, 021. **TC-01-022 is additionally tagged `L1-draft` / `CodeDerived`**
— authored by Thabiso 2026-08-03 and *"requires L3 validation"*, so treat it as provisional.

## Preconditions
- [ ] Public portal reachable at https://dsd-npo-publicportal-1-qa.shesha.app/login
- [ ] A confirmed submitter account exists — `mpenduloizwelinuk@gmail.com` / `123qwe`
- [ ] ⚠️ **`qa.tester0812@example.org` does NOT work on the public portal** — it 401s and the page prints the internal
      *"Forbidden frontend"*. Reproduced twice. Use it only on the admin portal.
- [ ] A **reachable inbox** for TC-06 (password-reset email)
- [ ] An **unregistered** email address for TC-02 and TC-07
- [ ] For the account-creation cases: an **unused mobile number**. `0818400598` and `0818400512` are both taken.

## Test Cases

### TC-01 — Wrong password shows a clear error and stays on Sign-In (ADO #101596 · TC-01-002)
*P1 · Negative · Src:Both.*
- **Steps:** 1. Open Sign-In page → 2. Enter a valid email with a **wrong** password, click Sign In
- **Expected result:** *"Error message displayed (e.g., 'Invalid email or password'); user remains on Sign-In page; no
  account info is leaked"*
- **Assertions:** [ ] (BLOCKING) an error is shown · [ ] the user stays on Sign-In · [ ] RECORD the exact wording ·
  [ ] the message does not reveal that the email exists
- **📌** Pair the wording with TC-02's — the enumeration finding depends on the two being **identical**.
- ⚠️ **One attempt only per run.** Repeated failures feed the lockout counter in TC-16.

### TC-02 — Non-existent email shows the same generic error (ADO #101597 · TC-01-003)
*P2 · Negative · Src:Both.*
- **Steps:** 1. Enter an unregistered email and any password, click Sign In
- **Expected result:** *"Generic 'Invalid email or password' error (must NOT say 'email not found' - prevents user
  enumeration). Stays on Sign-In page."*
- **Assertions:** [ ] (BLOCKING) the message is **byte-identical** to TC-01's · [ ] it does not say *email not found*
  · [ ] stays on Sign-In
- **🔑 This is a security case in substance.** Compare the two responses on **wording, HTTP status and response time** —
  a timing or status difference enumerates users just as effectively as different text.

### TC-03 — Malformed email is blocked at field level (ADO #101598 · TC-01-004)
*P3 · Negative · Src:FDS.*
- **Steps:** 1. Enter `not-an-email` plus any password, click Sign In
- **Expected result:** *"Field-level validation error on email (e.g., 'Enter a valid email'); Sign In submit not
  processed"*
- **Assertions:** [ ] a field-level error appears on the email input · [ ] (BLOCKING) **no auth request is sent**
- **📌** Assert the second half from the **network log**, not the screen — "submit not processed" is only provable by
  the absence of a `TokenAuth/Authenticate` call.
- ⚠️ Expect this to be **touched-field dependent**. The registration wizard only validates fields the user has typed
  in (`bugs/2026-08-17-tab2-validation-is-advisory-invalid-values-save.md`); check whether the login form behaves the
  same way, because it decides whether TC-04 can pass at all.

### TC-04 — Empty email and/or password is blocked (ADO #101599 · TC-01-005)
*P2 · Negative · Src:FDS.*
- **Steps:** 1. Empty email + password → 2. Email + empty password → 3. Both empty
- **Expected result:** *"Required-field error on email"* → *"Required-field error on password"* → *"Required-field
  errors on both"*
- **Assertions:** [ ] (BLOCKING) each of the three states is blocked · [ ] a required-field message appears in each ·
  [ ] RECORD whether the message is per-field or a single summary
- **🔴 Expect a FAIL on the messages, and it would be the 6th instance of the pattern.** Across this build, a *pristine*
  required field produces **no message at all** — `Next`/`Submit` simply sits disabled. If Sign In behaves the same
  way, state 3 (both empty, nothing touched) will show zero errors. Quote the case and let the verdict stand.

### TC-05 — Forgot Password opens the reset flow (ADO #101600 · TC-01-006)
*P2 · Positive · Src:FDS.*
- **Steps:** 1. On the Sign-In page click *Forgot password*
- **Expected result:** *"Reset password view is displayed allowing user to enter their registered email"*
- **Assertions:** [ ] the reset view opens · [ ] it has an email input
- **📌** The link is present and points at `/no-auth/boxfusion.dsdnpo/dsd-public-forgot-password` (observed
  2026-08-18), so this should pass. Confirm it **renders**, not merely that the route exists.

### TC-06 — Reset email is sent for a registered address (ADO #101601 · TC-01-007)
*P2 · Positive · Src:FDS · `Drift-Risk`.*
- **Steps:** 1. On the Reset Password view enter a **registered** email and submit
- **Expected result:** *"Confirmation message displayed; password reset email arrives in inbox within 5 minutes
  containing a single-use reset link"*
- **Assertions:** [ ] a confirmation message is shown · [ ] (BLOCKING) the email **arrives within 5 minutes** ·
  [ ] the link works · [ ] the link is **single-use** (second use is refused)
- **🔴 Drift note:** *"Email enumeration prevention not verified at app layer; relies on Shesha framework default."*
- **⚠️ Needs a reachable inbox.** `mpenduloizwelinuk@gmail.com` is not ours — **do not trigger resets against
  someone else's mailbox**, and never complete a reset on the shared account or we lose it. Prefer an address we
  control; if none exists, verify delivery via the **Shesha `NotificationMessage` table** instead
  ([[dsd-npo-notification-audit-via-api]]: 1=Sent, 8=Failed, filter on `creationTime`, `sorting` is ignored) and mark
  the inbox half as not executed.

### TC-07 — Reset for an unregistered email gives the same generic success (ADO #101602 · TC-01-008)
*P3 · Edge · Src:FDS · `Drift-Risk`.*
- **Steps:** 1. On Reset Password enter an **unregistered** email and submit
- **Expected result:** *"Same generic confirmation message as for registered email; no email is sent; UI must not
  reveal whether the email exists"*
- **Assertions:** [ ] (BLOCKING) the message is identical to TC-06's · [ ] **no** email is actually sent · [ ] no
  wording or timing difference betrays existence
- **📌** Prove "no email sent" from `NotificationMessage`, not from an empty inbox.
- **🔑** TC-02 + TC-07 together answer one question — *is this portal enumerable?* Report them as a pair.

### TC-08 — Invalid SA ID **format** is rejected at field level (ADO #101605 · TC-01-011)
*P1 · Negative · Src:FDS.* ⛔ **Depends on the missing Create User Account screen.**
- **Steps:** 1. Open Create User Account, enter ID `12345` (too short) → 2. Enter `80010150090AB` (letters)
- **Expected result:** *"Field error: SA ID must be 13 digits"* → *"Field error: only digits allowed"*
- **Assertions:** [ ] a length error appears · [ ] a digits-only error appears
- **⛔ Almost certainly NOT EXECUTABLE:** smoke TC-01-010 found **no ID Number field anywhere** in the sign-up journey.
  **Confirm the field is still absent**, then record *not executable — case does not match the build* rather than a
  fail, exactly as TC-01-010 was recorded.
- **📌** If an SA ID *is* captured somewhere else now, note where — that changes four cases at once.

### TC-09 — SA ID failing the Luhn checksum is rejected (ADO #101606 · TC-01-012)
*P2 · Negative · Src:FDS.* ⛔ **Same dependency as TC-08.**
- **Steps:** 1. Enter a 13-digit ID that fails the checksum, e.g. `8001015009086`
- **Expected result:** *"Field error: 'Invalid SA ID number' - submit blocked; no DHA call made"*
- **Assertions:** [ ] a checksum error appears · [ ] (BLOCKING) submit is blocked · [ ] **no DHA call fires**
- **🔑🔴 We already know the answer for the *other* SA-ID field in this product, and it is a FAIL.** In the office-bearer
  dialog, `8001015009086` — this exact number — **saves with no error**: the field validates length only, not the check
  digit (`bugs/2026-08-17-office-bearer-saved-with-invalid-sa-id-checksum.md`). If sign-up ever gains an ID field,
  expect the same defect. Cross-reference that bug in the report either way.

### TC-10 — DHA verification failure blocks account creation (ADO #101607 · TC-01-013)
*P1 · Negative · Src:Both.* ⛔ **Same dependency as TC-08.**
- **Steps:** 1. Open Create User Account, enter a checksum-valid but **DHA-non-matching** ID, fill the rest, click
  Complete Sign-up
- **Expected result:** *"Inline error indicates DHA verification failed; account is NOT created; user is offered to
  retry or use passport instead"*
- **Assertions:** [ ] (BLOCKING) an inline DHA error is shown · [ ] no account is created · [ ] a retry **or**
  passport alternative is offered
- **🔴 Expect the "inline error" half to FAIL wherever this is testable.** DHA no-match is **silent** everywhere we have
  looked (`bugs/2026-08-13-dha-non-match-is-silent-on-office-bearer.md`).
- ⚠️ **The DHA no-match path is NON-DETERMINISTIC** — the same ID has produced both a typeable name pair and a
  disabled/empty pair on different runs. Run it twice before recording behaviour.
- ⛔ **Do NOT invent SA ID numbers as filler.** DHA is a **live Home Affairs service**: an invented number resolved to a
  real person on 2026-08-17. Use `1111111111111`-style deliberately-invalid values, and never transcribe a resolved
  identity ([[never-record-real-personal-identifiers]]).

### TC-11 — DHA down shows a graceful retry message (ADO #101608 · TC-01-014)
*P2 · Edge · Src:FDS · `Drift-Risk`.* ⛔ **NOT SCHEDULED — needs DHA forced to 5xx.**
- **Steps:** 1. Submit Create User Account with a valid ID **while DHA is down**
- **Expected result:** *"User sees a 'verification service temporarily unavailable - try again later' message; account
  is NOT silently created without verification; no stack traces shown"*
- **Assertions:** [ ] a friendly unavailable message · [ ] (BLOCKING) **no unverified account is created** · [ ] no
  stack trace leaks
- **🔴 Drift note, verbatim:** *"Code shows **no 1-hour automatic retry**; DHA job halts on exception and waits for next
  scheduled run (no explicit interval registration in `RegisterBackgroundJobService`)."*
- **📌** Blocked twice over — by the missing screen *and* by our inability to fault-inject. Third resilience case in this
  state; that is now a pattern worth raising with Thabiso as a single ask.

### TC-12 — Mismatched Password / Confirm Password is blocked (ADO #101609 · TC-01-015)
*P1 · Negative · Src:FDS.* ⚠️ **May be testable against the OTP sign-up form — check.**
- **Steps:** 1. Password `Abcdef1!`, Confirm Password `Abcdef2!`, click Complete Sign-up
- **Expected result:** *"Field error 'Passwords do not match'; submit blocked"*
- **Assertions:** [ ] (BLOCKING) a mismatch error is shown · [ ] submit is blocked
- **🔑 Best candidate of the eight gated cases.** A password + confirm pair is likely to exist on the OTP journey even
  though the SA ID field does not. **Enumerate the form first**; if the pair is there, this is a genuine verdict.

### TC-13 — Password policy is enforced (ADO #101610 · TC-01-016)
*P2 · Negative · Src:FDS · `Drift-Risk`.* ⚠️ **Same as TC-12 — check the real form.**
- **Steps:** 1. Password `abc`, click Complete Sign-up → 2. Password `password` (common word)
- **Expected result:** *"Field error stating minimum length / required character classes"* → *"Field error rejects weak
  password"*
- **Assertions:** [ ] short password rejected with a stated rule · [ ] a common word rejected · [ ] RECORD the policy
  actually enforced
- **🔴 Drift note:** *"Password complexity rules are delegated to Shesha `PasswordHasher`; verify against Shesha
  defaults; **no custom complexity rules in dsd-npo**."*
- **🔑 A strong hint the second half FAILS:** the working QA password is **`123qwe`** — six characters, no complexity,
  and a top-20 leaked password. If that was accepted at creation, `password` will be too. Say so plainly, and note
  that a dictionary check is not a Shesha default.

### TC-14 — Duplicate email is blocked (ADO #101611 · TC-01-017)
*P1 · Negative · Src:FDS.* ⚠️ **May be testable at the email step — check.**
- **Steps:** 1. Open Create User Account, enter an **already-registered** email plus valid details, click Complete
  Sign-up
- **Expected result:** *"Error 'Email already registered' OR generic 'If account exists you will receive an email'; no
  duplicate account is created in DB"*
- **Assertions:** [ ] (BLOCKING) creation is refused · [ ] a message appears · [ ] **no duplicate row** exists ·
  [ ] RECORD which of the two wordings is used
- **🔑 Note the case allows *either* wording, and they have opposite security properties** — *"Email already
  registered"* **enumerates users**, the generic one does not. Whichever it is, record it and hold it against TC-02
  and TC-07: a portal that hides existence at sign-in but reveals it at sign-up is still enumerable.
- **📌** Verify the no-duplicate half in the DB (`NpoPerson`/`User` by email), not from the UI.
- 🔑 Code anchor from TC-01-022: `NpoPersonManger.cs:45 EmailAlreadyInUseAsync` — the check does exist.

### TC-15 — Leading/trailing whitespace in email is trimmed (ADO #101612 · TC-01-018)
*P3 · Edge · Src:FDS.* ⛔ **Needs a completed account creation → blocked on OTP unless TC-18 opens it.**
- **Steps:** 1. Enter email `' user@example.org '` with whitespace and submit
- **Expected result:** *"Account is created with trimmed email 'user@example.org'; subsequent sign-in works without the
  spaces"*
- **Assertions:** [ ] (BLOCKING) the stored email is trimmed · [ ] sign-in works without the spaces
- **🔴🔑 EXPECT THIS TO FAIL — this build does not trim.** Two independent instances already: an office-bearer name
  stored as `"  John   van der Merwe"` (08-17, TC-04-018) and the application's own `refNumber` persisted as
  **`" APPL26-01270"`** with a leading space (08-18). **A third instance on the login identifier would be the most
  serious of the three**, because it silently creates an account nobody can sign into.
- **📌** Read the value back from the **DB**, not the screen — HTML collapses whitespace, which is exactly how the first
  two instances were nearly missed.

### TC-16 — Account locks after N consecutive failed sign-ins (ADO #101613 · TC-01-019)
*P2 · Edge · Src:FDS · `Drift-Risk`.* ⛔🔴 **DO NOT RUN without a throwaway account — see the warning above.**
- **Steps:** 1. Attempt sign-in with a wrong password the configured number of times (e.g. 5)
- **Expected result:** *"After threshold, account is locked / a CAPTCHA appears / further attempts are throttled; user
  is informed how to recover"*
- **Assertions:** [ ] (BLOCKING) attempts are stopped after a threshold · [ ] RECORD the threshold · [ ] the user is
  told how to recover
- **🔴 Drift note:** *"Account lockout/throttling not visible in app code; relies on Shesha framework defaults if any."*
- **🔑 The safe half is runnable now, and is worth doing on its own:** make **2–3** failed attempts on a **non-existent**
  email (no real account to lock) and watch for throttling, `429`s or a CAPTCHA. That establishes whether *any*
  rate-limiting exists without risking the shared login. Record the real lockout threshold as **not executed** with the
  reason.

### TC-17 — Email is case-insensitive, password is case-sensitive (ADO #101614 · TC-01-020)
*P3 · Edge · Src:FDS.*
- **Steps:** 1. Sign in with the email **lower-cased** and the correct password → 2. Sign in with the correct email and
  the password's **case altered**
- **Expected result:** *"Sign-in succeeds"* → *"Sign-in fails (password is case-sensitive)"*
- **Assertions:** [ ] (BLOCKING) lower-cased email authenticates · [ ] (BLOCKING) altered-case password is refused
- **📌 Runnable today** against `mpenduloizwelinuk@gmail.com` — but step 2 is a **deliberate failed sign-in**, so it
  feeds the TC-16 lockout counter. Run it **once**, and run TC-16's probing afterwards, not before.
- 📌 `123qwe` has no upper-case characters, so alter case as `123QWE`.

### TC-18 — Security: the OTP stress-testing endpoint must be gated (ADO #101615 · TC-01-021)
*P1 · Negative · Src:Code · `Drift-Risk`.* ⚠️ **Step 1 in scope; step 2 is PROD and out of scope.**
- **Steps:** 1. As a **non-admin** signed-in user, call
  `POST /api/services/dsdnpo/npoOtpStressTesting/GetOtpByEmailAddressOrPhoneNumber` →
  ~~2. As admin in **PROD**, call the same endpoint~~
- **Expected result:** *"403 Forbidden / not accessible"* → *"Endpoint is disabled OR returns 404 in PROD (must not
  expose raw OTP in production)"*
- **Assertions:** [ ] (BLOCKING) a non-admin receives **403** · [ ] RECORD whether the raw OTP is returned to anyone
  who can reach it
- **🔴 Drift note, verbatim:** *"Not in FDS. Found via code review (`NpoOtpStressTestingAppService.cs:26-65`). **HIGH
  security risk if this endpoint is reachable from prod by any authenticated user**."*
- **⛔ Cannot be honestly verdicted yet.** We hold only the broadly-privileged developer account, so a success proves
  nothing about the gate. **Needs a role-scoped non-admin user.** What we *can* do now is record **what the endpoint
  returns to us** and whether it exposes a raw OTP — that is the substance of the risk.
- **🔑 Also run it as an enabler** — see the sequencing note above; if it yields an OTP, TC-14/TC-15 open up.
- ▶ **Regardless of verdict, this belongs in front of Thabiso as a security item**, and it should be re-checked in the
  14Z security suite.

### TC-19 — Re-register after account deletion (ADO #107678 · TC-01-022)
*P2 · Src:Code · `L1-draft` `CodeDerived`.* ⛔ **NOT SCHEDULED — requires developer DB access.**
- **Steps:** 1. Delete the account while it holds a Draft NPO → 2. Re-register with the **same email and mobile** →
  3. Sign in and open the Dashboard → 4. Inspect DevTools network on Dashboard load → 5. Query
  `Core_OrganisationPersons` for the deleted Person
- **Expected results (verbatim):** *"Person and User rows … soft-deleted. `Core_OrganisationPersons` rows … also
  removed"* → *"Sign-Up either blocks the re-registration with a clear error, or routes the user to a reactivation
  flow. It does not silently create a new Person GUID that inherits any orphaned NPO links"* → *"Dashboard renders the
  empty-state view (no NPOs linked)"* → *"Any call to `NpoOrganisation/Crud/Get` carries a resolvable non-null id. The
  client never issues `Crud/Get` with `id=null`"* → *"No rows remain referencing the soft-deleted Person, or all such
  rows carry `IsOfficeBearerDeleted = 1`"*
- **Assertions:** [ ] no orphaned NPO links survive · [ ] re-registration is blocked or routed to reactivation ·
  [ ] Dashboard shows empty state · [ ] (BLOCKING) **no `Crud/Get` with `id=null`**
- **🔑 Step 4 is testable on its own, right now, and costs nothing.** Watching for a `Crud/Get?id=null` on dashboard
  load needs no deletion — just a network read. Do that opportunistically during any other sign-in case.
- **📌 `L1-draft` — Thabiso's own note says it "requires L3 validation"**, and the FDS entry reads *"Scope gap — no FDS
  clause; BA to author acceptance criterion."* So the expected behaviour is **not yet agreed**; do not raise a defect
  against it without that ruling. Code anchors: `NpoPersonManger.cs:45`, `:62`, `:147-170` @ `a198cfab`.

## Coverage against ADO
| Plan case | ADO | TC id | P | Src | Drift | Runnable now? |
|---|---|---|---|---|---|---|
| TC-01 | #101596 | TC-01-002 | 1 | Both | — | ✅ yes |
| TC-02 | #101597 | TC-01-003 | 2 | Both | — | ✅ yes |
| TC-03 | #101598 | TC-01-004 | 3 | FDS | — | ✅ yes |
| TC-04 | #101599 | TC-01-005 | 2 | FDS | — | ✅ yes — expect a messaging FAIL |
| TC-05 | #101600 | TC-01-006 | 2 | FDS | — | ✅ yes |
| TC-06 | #101601 | TC-01-007 | 2 | FDS | ⚠️ | ⚠️ needs an inbox we own |
| TC-07 | #101602 | TC-01-008 | 3 | FDS | ⚠️ | ✅ yes (verify via `NotificationMessage`) |
| TC-08 | #101605 | TC-01-011 | 1 | FDS | — | ⛔ no SA ID field exists |
| TC-09 | #101606 | TC-01-012 | 2 | FDS | — | ⛔ no SA ID field exists |
| TC-10 | #101607 | TC-01-013 | 1 | Both | — | ⛔ no SA ID field exists |
| TC-11 | #101608 | TC-01-014 | 2 | FDS | ⚠️ | ⛔ needs DHA 5xx |
| TC-12 | #101609 | TC-01-015 | 1 | FDS | — | ⚠️ check the OTP form |
| TC-13 | #101610 | TC-01-016 | 2 | FDS | ⚠️ | ⚠️ check the OTP form |
| TC-14 | #101611 | TC-01-017 | 1 | FDS | — | ⚠️ blocked on OTP unless TC-18 opens it |
| TC-15 | #101612 | TC-01-018 | 3 | FDS | — | ⚠️ blocked on OTP unless TC-18 opens it |
| TC-16 | #101613 | TC-01-019 | 2 | FDS | ⚠️ | ⛔🔴 **account-lock risk — ask first** |
| TC-17 | #101614 | TC-01-020 | 3 | FDS | — | ✅ yes |
| TC-18 | #101615 | TC-01-021 | 1 | Code | ⚠️ | ⚠️ needs a non-admin user to verdict |
| TC-19 | #107678 | TC-01-022 | 2 | Code | — | ⛔ developer DB task |
| *TC-01-001* | *#101595* | — | 1 | Both | — | 🔵 **smoke-owned, excluded** |

**19 cases owned by this plan.** The suite's 20th member — #101595 / TC-01-001 — belongs to the smoke plan.
**Smoke counterparts** (plan `01-authentication-account-creation.md`): TC-01-001, TC-01-009, TC-01-010.

## Suggested run order
1. **TC-05** (forgot-password link) — cheapest, no side effects, confirms the route renders.
2. **TC-03, TC-04** — validation on the login form, no auth attempts, and they settle whether login validation is
   touched-field dependent like the wizard.
3. **TC-01, TC-02** back to back — capture wording, status **and** timing for both; the enumeration verdict needs the pair.
4. **TC-17** — one success, one deliberate failure. Do it before any lockout probing.
5. **TC-07**, then **TC-06** if we have an inbox we own — enumeration on the reset flow.
6. **Step 0 for the gated group: enumerate the real sign-up form's fields** and record them against the FDS
   *Create User Account* spec. That single observation verdicts TC-08/09/10 and tells us whether TC-12/13/14 are live.
7. **TC-18** — both as a security case and as the potential OTP enabler.
8. **TC-14, TC-15** only if TC-18 yields an OTP.
9. **TC-16** last, and only against a throwaway account, after asking.
10. **TC-11, TC-19** — leave unexecuted; raise as dependencies.

## Realistic expectation for this suite
**Roughly 7 cases are cleanly runnable today** (TC-01/02/03/04/05/07/17), 4 more are conditional on the sign-up form
or the OTP endpoint, and **8 are blocked** on things we do not control: the missing Create-User-Account screen, DHA
fault injection, role-scoped users, and developer DB access. That is worth stating up front rather than discovering at
case 15 — and the two questions that unblock the most are **"do we rewrite the sign-up cases against the OTP design?"**
and **"can we have role-scoped users?"**

---

## ✅ First execution 2026-08-18 — 9 attempted + Step 0 field inventory
Report: `test-reports/2026-08-18/01-authentication-account-creation-functional--sign-in-and-enumeration.md`

| Case | Verdict | Note |
|---|---|---|
| TC-01-002 | ✅ PASS | generic *"Invalid user name or password"*, stays on Sign-In |
| TC-01-003 | ✅ PASS (wording) | identical message — but a **timing side-channel** exists (existing 234–948ms vs non-existent ~45ms) |
| TC-01-004 | 🔴 FAIL | no client-side email validation; malformed value POSTed; misleading generic error |
| TC-01-005 | 🔴 FAIL | no required-field errors; fires with empty creds; **415 crashes the error handler → silent** |
| TC-01-006 | ✅ PASS | reset view opens (asks for *Username*, not email) |
| TC-01-007 | ⚠️ PARTIAL | method-select OK, but **discloses masked email + last-4 mobile** pre-auth |
| TC-01-008 | 🔴 FAIL | *"Your username is not recognised"* → **user enumeration** |
| TC-01-020 | ✅ PASS | email case-insensitive, password case-sensitive |
| TC-01-021 | 🔴🔴 FAIL (CRITICAL) | OTP endpoint returns a raw pin to an **anonymous** caller; wider **API is anonymously readable** |

**Bugs filed:** `2026-08-18-api-reachable-without-authentication.md` (🔴🔴 Critical) ·
`2026-08-18-password-reset-enumerates-users-and-leaks-contact-details.md` (High) ·
`2026-08-18-login-no-client-validation-and-415-crashes-error-handler.md` (Medium).

### 🔑 Step 0 done — the sign-up field inventory verdicts the account-creation cases
Journey is **email + mobile-OTP**: step 1 *Verify Mobile Number* (mobile, maxLength 10) → step 2 *Sign Up*
(Mobile display · First Name · Last Name · Email). **No SA ID field, no Password/Confirm anywhere.**
- **TC-01-011 / 012 / 013 → ⛔ NOT EXECUTABLE** (no SA ID field; the case doesn't match the build, like smoke TC-01-010).
- **TC-01-015 / 016 → ⛔ NOT EXECUTABLE** (no password is set at sign-up; mobile-OTP design).
▶ **Decision for Thabiso:** rewrite these five against the OTP design, or is the FDS SA-ID/password form still to be built?

### Still open
- **TC-01-017 / 018** — conditionally runnable once OTP delivery works (SMS credit / the TC-01-021 endpoint).
- **TC-01-014** (DHA 5xx) · **TC-01-019** (lockout — needs throwaway acct + go-ahead; **no API rate-limiting observed**
  on 6 rapid failures) · **TC-01-022** (developer DB) — remain blocked.

**Executed/verdicted this run: 9 runnable + 5 not-executable = 14 of 19. Remaining 5 are blocked (14/17/18/19/22... )
pending OTP, fault-injection, a throwaway account, or dev DB.**
