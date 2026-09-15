# Report: NPO-14C-F — Session, read-only and access control (functional)

**Date:** 2026-08-25 10:00 UTC
**Plan:** test-plans/cross-cutting/14c-session-access-control-functional.md
**Execution Mode:** ai-repair
**Result:** FAILED — 1 failed, 2 partial, 1 blocked, 1 not executed of 5. **There is no session cookie at all**: the bearer token is a **5-day JWT held in `localStorage`**, so it has none of the protection `HttpOnly` would give — which matters on a build with confirmed credential-reflecting CORS.
**Duration:** ~800s
**Cases:** TC-01, TC-02, TC-03, TC-04, TC-05
**Environment:** QA · admin portal, two isolated browser contexts · **view mode Latest (asserted in-run)**
**Accounts used:** `mpenduloizwelinuk@gmail.com` (shared dev login — broadly privileged, see TC-05)

## Summary
| Total attempted | Passed | Failed | Partial | Blocked | Not executed |
|---|---|---|---|---|---|
| 5 | 0 | 1 | 2 | 1 | 1 |

| Case | ADO | Verdict | One-liner |
|---|---|---|---|
| TC-01 Submitter cannot edit a non-editable application | #101821 | ⚪ NOT EXECUTED | Adjacent evidence exists from suite 05 but this case was not driven — not claimed on borrowed proof |
| TC-02 Session expiry and re-login | #101822 | ⚠️ PARTIAL | Intended lifetime **recorded: 5 days**; idling past it was not feasible |
| TC-03 Session cookie has Secure + HttpOnly + SameSite | #107428 | 🔴 FAILED | **No session cookie exists** — the JWT sits in `localStorage`, readable by any script |
| TC-04 Concurrent logins, same account | #107429 | ⚠️ PARTIAL | Both sessions stay fully valid and stable — but **no defined policy exists** to assert against |
| TC-05 Read-only role cannot mutate | #107430 | ⛔ BLOCKED | Needs a role-scoped account; we hold one broadly privileged login |

## 🔴 TC-03 — there is no session cookie, and that is the finding
**Mode:** ai-repair · fresh context, full sign-in, every cookie and storage key enumerated

The case asks whether *"the session cookie has Secure=true, HttpOnly=true, SameSite=Lax or Strict"*. Signing in sets
**four cookies, none of which is an authentication cookie**:

| Cookie | Secure | HttpOnly | SameSite | Domain | What it is |
|---|---|---|---|---|---|
| `ARRAffinity` | ✅ true | ✅ true | Lax | `.dsd-npo-adminportal-qa.shesha.app` | Azure App Service load-balancer affinity |
| `ARRAffinitySameSite` | ✅ true | ✅ true | **None** | `.dsd-npo-adminportal-qa.shesha.app` | same, SameSite=None variant |
| `ARRAffinity` | ✅ true | ✅ true | Lax | `.dsd-npo-api-qa.shesha.app` | same, API host |
| `ARRAffinitySameSite` | ✅ true | ✅ true | **None** | `.dsd-npo-api-qa.shesha.app` | same, API host |

- [PASS] (record) Those four *are* correctly flagged `Secure` + `HttpOnly`. Two carry `SameSite=None`, which is the
  weaker setting, but they are infrastructure affinity cookies and carry no identity
- [FAIL] **Zero `Set-Cookie` headers were observed on the authentication flow at all**
- [FAIL] (blocking) **The session credential lives in `localStorage`** — a JWT under an obfuscated key
  (`xDFcxiooPQxazdndDsdRSerWQPlincytLDCarcxVxv` on this session; the key name varies per session).
  `sessionStorage` is empty
- [FAIL] **The token is valid for 5 days** — decoded, `exp − iat = 432 000 s = 120 h`, `alg HS256`, `iss/aud Shesha`

🔑 **Verdict reasoning, stated so it can be disagreed with.** Read literally, "the session cookie has these flags" is
*not applicable* — there is no session cookie. Read as intent — "the session credential is protected" — it **fails**:
a token in `localStorage` is readable by any JavaScript executing on the page, which is exactly what `HttpOnly`
exists to prevent. I have verdicted **FAILED** on intent.

⚠️ **Why this is more than a checkbox on this particular build.** Three findings already on record compose with it:
- **TC-14Z-003 CONFIRMED** — CORS reflects *any* origin **and** allows credentials
- **TC-03-022** — XSS input is escaped on output but **stored raw**
- **TC-14Z-005 CONFIRMED** — the API answers unauthenticated callers

A 5-day bearer token in script-readable storage is the component that turns those from separate findings into a
chain. Recorded here as an observation for the test lead; **security is not ours to report** and this is not going
into a daily report.

## Case detail

### TC-01 — Submitter cannot edit a non-editable application (#101821 · TC-14-009) — NOT EXECUTED
- Not driven in this run. **Suite 05 TC-05-018 already observed** a read-only detail view refusing with *"Requested
  action is not available"*, which is adjacent evidence — but it is a different ADO case and reusing it here would be
  claiming a verdict I did not earn
- ⛔ The case's second half (*"API rejects PATCH with 403/409"*) is **out of scope** under the project's black-box
  rule — the API is not ours to test. Marked N/A rather than skipped silently
- ▶ To close: open one of our own submitted applications as the submitter and attempt an edit through the UI. Cheap;
  it simply was not reached

### TC-02 — Session expiry and re-login (#101822 · TC-14-010) — PARTIAL
- [PASS] (record) **The intended session lifetime is 5 days** (`exp − iat = 432 000 s`), read from the token rather
  than guessed. This is the number the case needed and did not state
- [BLOCKED] Idling a session past a 5-day expiry is not feasible inside a test run, so the redirect-to-sign-in and
  land-after-login assertions are untested
- 📌 A 5-day non-sliding token is worth a decision in its own right: it means signing out on one device does not
  meaningfully end the session elsewhere until expiry. ❓ For the test lead — is 5 days intended?

### TC-03 — Session cookie flags (#107428 · TC-14C-003) — FAILED
See above.

### TC-04 — Concurrent logins from the same account (#107429 · TC-14C-004) — PARTIAL
**Mode:** ai-repair · two isolated browser contexts, same credentials
- [PASS] Session A signed in and loaded the Change Requests grid — **73 items**
- [PASS] Session B then signed in independently and reached the workflow inbox
- [PASS] **Session A remained fully functional afterwards** — re-navigated and still loaded real data (73 items
  again), was **not** redirected to sign-in, and showed no "session expired" message
- [PASS] Session B also continued to work. So the observed behaviour is option **(a) both sessions valid**, and it is
  **stable** — tested by making each session *fetch data*, not merely by reading its URL
- [FAIL] **The case cannot be passed.** It says *"behaviour matches defined policy … asserts the defined behaviour,
  not one of the two"* — and **no defined policy could be found**. Option (a) is a legitimate design choice, but
  nothing states it is the intended one, so there is nothing to assert against
- ❓ **Direct question for the test lead:** is unlimited concurrent sessions the intended policy? Combined with the
  5-day token in TC-03, this determines whether "sign out" means anything on this system

### TC-05 — Read-only role cannot mutate (#107430 · TC-14C-005) — BLOCKED
- [BLOCKED] The case's own step 1 is *"Precondition: user with 'Read only' role signed in"*. We hold a single shared
  account that is broadly privileged — it exposes the entire `Configurations` menu — so there is no read-only
  identity to test with
- ⛔ Even given one, steps 2–3 are direct API mutations (`POST …/CreateAsync`, DELETE variants), which the black-box
  rule excludes. The runnable form is: sign in as the read-only user and record whether the UI even offers the
  action
- 🔑 **This is the same missing precondition that blocks ~10 cases in suite 14Z (Class B) and weakens 11A TC-06 to a
  proxy result.** One role-scoped test account unblocks all of it — the highest-leverage environment request we have

## Method
- Two isolated `browserContext`s so the sessions could not share storage; full interactive sign-in in each.
- Every cookie enumerated via the context (flags included), every `Set-Cookie` response header captured, and both
  `localStorage` and `sessionStorage` dumped by key.
- The JWT was decoded locally to read `iat`/`exp`/`alg` only. **The token value is not recorded** in this report or
  any artefact.
- Session A's continued validity tested by loading a data grid and reading its item count — a stale token still
  renders the shell, so the URL alone proves nothing.
