# Test Plan: NPO-14C-F — Session, read-only and access control (functional)

> **Status:** Imported from Azure DevOps 2026-08-25
> **Owner:** QA
> **Last Updated:** 2026-08-25
> **Estimated Duration:** 420s

## Metadata
| Field | Value |
|-------|-------|
| App URL | https://dsd-npo-adminportal-qa.shesha.app/login |
| Environment | QA |
| Login As | mpenduloizwelinuk@gmail.com / 123qwe |
| Lead tester | **Thabiso Kegakwile** |
| ADO Plan | [planId 101543 — DSD-NPO Functional Test Plan](https://dev.azure.com/boxfusion/Boxfusion%20Test%20Plans/_testPlans/define?planId=101543&suiteId=101901) |
| ADO Suite | 101901 — *14C - Session / read-only / access control* (5 cases) |

## Objective
> Verify the session and authorisation boundary: that a non-editable application cannot be edited, that session
> expiry behaves predictably, that the session credential is protected, that concurrent logins follow a defined
> policy, and that a read-only role cannot mutate anything.

## Provenance
Imported from the ADO functional plan on 2026-08-25 via the browser + REST route. Expected results quoted verbatim.
Raw pull retained at `test-data/ado-functional-101543/ado-suite-101901.json`.

## Preconditions
- [ ] Admin **and** public portal sign-in
- [ ] 🔑 View mode **Live → Latest**, asserted not assumed
- [x] ✅ **RESOLVED 2026-08-28 — TC-05 does not need an account from anyone.** The **"Read only"** role **does not
  exist in this build**: the registry holds exactly **46** roles and none matches (`quickSearch=read` and
  `=Read only` both return 0, with `Registry`→2 and `Reviewer`→3 as working controls). The case's step 1
  (*"Role seed present"*) is therefore **FAILED**, not blocked. **Do not re-raise this as an environment request.**

## 🔑 Black-box boundary for this suite
The project rule is **UI-only testing; the API is not ours to test**. Several cases here are phrased as API
assertions (403 on PATCH/POST/DELETE). Drive the **UI** and use API reads only to confirm what the UI did — do not
craft mutating API calls to manufacture a verdict.

## Test Cases

### TC-01 — Submitter cannot edit an application not in an editable state (ADO #101821 · TC-14-009)

*Priority 2 · Negative · `Src:FDS` · Both.*

- **Steps (ADO):** 1. Attempt edit
- **Expected result (ADO):** *"UI blocks edit; API rejects PATCH attempts with 403/409"*
- **Assertions:**
  - [ ] (BLOCKING) ASSERT the UI blocks editing on a non-editable application
  - [ ] RECORD whether a rejection is surfaced to the user or silently swallowed
- **📌** Suite 05 TC-05-018 already observed a read-only detail view responding *"Requested action is not
  available"*. Reuse that evidence and extend it rather than re-deriving it.
- **⛔** The API-rejection half is out of scope per the black-box rule — mark it N/A and say why.

---

### TC-02 — Session expiry and re-login lands the user sensibly (ADO #101822 · TC-14-010)

*Priority 3 · Edge · `Src:FDS` · Both.*

- **Steps (ADO):** 1. Leave session idle past timeout, attempt action
- **Expected result (ADO):** *"User is redirected to sign-in; after sign-in, taken to dashboard or original deep link"*
- **Assertions:**
  - [ ] ASSERT an expired session redirects to sign-in rather than failing silently
  - [ ] RECORD where the user lands after re-authenticating
- **⚠️** Requires idling past the real timeout. The JWT's own `exp` claim gives the intended lifetime — read it
  first so the wait is informed rather than open-ended.

---

### TC-03 — Session cookie carries Secure + HttpOnly + SameSite (ADO #107428 · TC-14C-003)

*Priority 2 · `Src:Code` · Both · `Coverage-Gap-Topup` · `L1-draft`.*

- **Steps (ADO):** 1. Sign in via browser; inspect `Set-Cookie` response header for the session cookie
- **Expected result (ADO):** *"Cookie flags: Secure=true, HttpOnly=true, SameSite=Lax or Strict."*
- **Assertions:**
  - [ ] (BLOCKING) ASSERT the session credential is protected from JavaScript access
  - [ ] RECORD every cookie set, with its flags
  - [ ] 🔑 RECORD **where the session credential actually lives** — if there is no session cookie, the case's premise
        does not hold and that is itself the finding
- **📌** Check `localStorage` and `sessionStorage` too. A bearer token in web storage has none of the protection
  `HttpOnly` provides, and this build already has **wide-open CORS reflecting any origin with credentials**
  (TC-14Z-003 CONFIRMED) plus **raw-stored XSS input** (TC-03-022) — so where the token sits matters.

---

### TC-04 — Concurrent logins from the same user (ADO #107429 · TC-14C-004)

*Priority 2 · `Src:Code` · Both · `Coverage-Gap-Topup` · `L1-draft`.*

- **Steps and expected results (ADO), verbatim:**
  1. Sign in from Browser A → *"Session A active."*
  2. Sign in same account from Browser B → *"Behaviour matches defined policy: (a) both sessions valid (allowed by
     design), OR (b) session A invalidated + user notified. Test asserts the defined behaviour, not one of the two."*
- **Assertions:**
  - [ ] ASSERT which of (a) or (b) occurs, and that it is **stable**
  - [ ] ASSERT session A can still load real data, or is cleanly redirected — not left half-working
  - [ ] ❓ RECORD that the *defined policy* is unstated, if no policy can be found — the case cannot be passed
        against a policy that does not exist
- **📌** Test session A by making it **fetch data**, not merely by reading its URL. A stale token often still renders
  the shell.

---

### TC-05 — Read-only role cannot mutate (ADO #107430 · TC-14C-005)

*Priority 2 · `Src:Code` · Both · `Coverage-Gap-Topup` · `L1-draft`.*

- **Steps and expected results (ADO), verbatim:**
  1. Precondition: user with **"Read only"** role signed in → *"Role seed present."*
  2. Attempt `POST /api/services/dsdnpo/OrganisationLocations/CreateAsync` via authorised session → *"Response 403
     Forbidden. No side-effect in DB."*
  3. Attempt DELETE variants → *"Same — 403."*
- **Assertions:**
  - [ ] ASSERT a read-only user cannot mutate
- **⛔ Expected BLOCKED.** We hold one shared, broadly privileged account. **A role-scoped user is the single
  precondition that unblocks this case and ~10 of suite 14Z** — worth requesting explicitly rather than deferring
  again.
- **⛔** Even with such a user, the steps as written are direct API mutations, which the black-box rule excludes.
  Drive the equivalent action **through the UI** and record whether the control is even offered.

## Coverage against ADO
| Plan TC | ADO id | ADO TC | Runnable |
|---|---|---|---|
| TC-01 | #101821 | TC-14-009 | ✅ **RUN 2026-08-28 — PASSED** (UI half; API half N/A) |
| TC-02 | #101822 | TC-14-010 | ⚠️ needs an idle wait |
| TC-03 | #107428 | TC-14C-003 | ✅ |
| TC-04 | #107429 | TC-14C-004 | ✅ |
| TC-05 | #107430 | TC-14C-005 | 🔴 **RUN 2026-08-28 — FAILED**; the "Read only" role is not seeded (46 roles, no match) |
