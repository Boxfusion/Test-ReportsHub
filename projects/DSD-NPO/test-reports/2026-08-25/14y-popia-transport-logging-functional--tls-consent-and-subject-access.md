# Report: NPO-14Y-F — POPIA transport & logging (functional)

**Date:** 2026-08-25 15:10 UTC
**Plan:** test-plans/cross-cutting/14y-popia-transport-logging-functional.md
**Execution Mode:** ai-repair
**Result:** FAILED — 5 of 6 verdicted. The **consent gate is the one thing that works properly**, and it works well. Against that: **all three hosts serve over cleartext `http://` with no redirect and no HSTS anywhere**, no correlation ID is emitted on any request, and **no subject-access / export route exists anywhere in the 8 294-form registry**.
**Duration:** ~700s
**Cases:** TC-01, TC-02, TC-03, TC-04, TC-05, TC-06
**Environment:** QA · public portal + admin portal · admin **view mode Latest (asserted in-run via the toggler menu)** · public portal **Live (no view-mode control is exposed to an applicant account — asserted, not assumed)**
**Accounts used:** `npo.qa.applicant.a@example.org` (self-registered applicant), `mpenduloizwelinuk@gmail.com` (shared dev login)

## Summary
| Total attempted | Passed | Failed | Partial | Not executed |
|---|---|---|---|---|
| 6 | 1 | 2 | 2 | 1 |

| Case | ADO | Verdict | One-liner |
|---|---|---|---|
| TC-01 Wizard HTTPS only; PII not in logs | #102161 | 🔴 FAILED | 67/67 wizard requests https ✅ — but **no HSTS on any host** and **no correlation ID on any request** |
| TC-02 Sign-in credentials over TLS only | #107417 | ⚠️ PARTIAL | The captured request passes on both portals; the **server also accepts the same credentials over cleartext** |
| TC-03 SA ID as special personal information | #107418 | ⚠️ PARTIAL | Log tail not reachable; the client-side half fails on an already-recorded finding |
| TC-04 POPI consent before submission | #107419 | ✅ PASSED | Consent is the **first** step and genuinely gates the flow — proven at 0, 1 and 2 ticks |
| TC-05 Subject access — export my data | #107420 | 🔴 FAILED | No Data & Privacy area, no export action, **no such form in the entire registry** |
| TC-06 Retention — inactive records archived | #107421 | ⬜ NOT EXECUTED | The "policy-defined period" the case depends on has never been shown to us |

## 🔑 The finding that runs under TC-01 and TC-02 — TLS is available but not enforced

Every request the application *itself* makes is `https://`. That is not the same as the service being TLS-only, and the
two cases in this suite are about the latter. Probed at the wire with `curl`:

| Host | `https://` | `http://` | `Strict-Transport-Security` |
|---|---|---|---|
| `dsd-npo-publicportal-1-qa.shesha.app/login` | 200 | **200 — page served in cleartext, no redirect** | **absent** |
| `dsd-npo-adminportal-qa.shesha.app/login` | 200 | **200 — no redirect** | **absent** |
| `dsd-npo-api-qa.shesha.app/api/TokenAuth/Authenticate` | 405 (GET) | **401 on a cleartext POST — the endpoint processes credentials over http** | **absent** |

Three consequences worth stating plainly:

1. **No HSTS anywhere.** TC-14Y-001 prescribes *"Strict-Transport-Security header is set"* verbatim. It is set on
   neither portal nor the API. Without it a browser has nothing telling it to refuse the cleartext version.
2. **The cleartext login page is fully served** — 15 788 bytes of it. A user who types the host without a scheme
   reaches a working sign-in form over http.
3. **The session-affinity cookie loses its `Secure` flag over http.** Over https the platform issues
   `ARRAffinity … HttpOnly;Secure`; over http the same cookie comes back **without `Secure`**.

⚠️ **What I did not do:** I did not transmit a real credential in cleartext to complete the proof. The `401` above was
produced with a deliberately invalid password. That the endpoint *answers* over http is sufficient to show it is
listening; finishing the demonstration would have meant leaking a working password onto the wire, which is not a
thing to do to prove a point.

📌 **This is a security finding, and security is not ours to raise.** It goes to Thabiso, not into the daily report.

---

## Test Cases

### 🔴 TC-01 — Wizard over HTTPS only; submitter PII not echoed to logs (#102161 · TC-14Y-001) — FAILED

*Priority 1 · Security · `Src:Sys-Obs` · Public.*

Four expected results were prescribed. Two pass, two fail, one step was not reachable.

| ADO expectation (verbatim) | Observed | |
|---|---|---|
| *"All wizard requests use https:// scheme; no http:// requests"* | **67 of 67** resource requests https, 0 http, across 2 hosts (47 portal / 20 API) | ✅ |
| *"no mixed-content warnings in browser console"* | None. The only console errors were the known `Execute Script` failure and my own probe's 404 | ✅ |
| *"Strict-Transport-Security header is set"* | **Absent on the portal origin and on the API origin.** Checked both — they are separate hosts | 🔴 |
| *"Correlation ID is present and unique per request"* | **No correlation, trace, or request-id header on any request inspected** — including a write (`Process/StartByName`). Response headers are the same eleven every time: `api-supported-versions`, `access-control-*`, `x-content-type-options`, `content-length`, `date`, `x-xss-protection`, `content-type`, `vary`, `server`, `x-frame-options` | 🔴 |

**Step 4 — NOT EXECUTED.** *"Search the application logs for the test submitter's RSA ID, email, and cellphone"*
requires a log tail we do not have. It is named here rather than folded into the verdict. Note the dependency: the
step asks that *"logs reference the correlation ID"* — there is no correlation ID to reference, so the step as
written could not pass even if we could read the logs.

**Verdict:** FAILED — two explicitly prescribed expected results are not met.

---

### ⚠️ TC-02 — Sign In credentials transmitted over TLS only (#107417 · TC-14Y-002) — PARTIAL

*Priority 2 · `L1-draft` · Both portals. Run on both, as the case specifies.*

The literal step — *"Capture Sign In request via browser DevTools Network"* — passes on both portals:

| Check | Public portal | Admin portal |
|---|---|---|
| Request URL scheme | `https://` ✅ | `https://` ✅ |
| Credential location | POST **body** (JSON) ✅ | POST body ✅ |
| Credential in URL / query string | no ✅ | no ✅ |
| Password in `localStorage` / `sessionStorage` / cookies | no (12 keys scanned) ✅ | no (23 keys scanned) ✅ |
| Password echoed in the response | no ✅ | no ✅ |

So on its own wording this case passes. It is held at **PARTIAL** because the clause *"no plaintext leak"* is not
satisfied by a service that accepts the identical credentials over cleartext with no HSTS to prevent the downgrade —
see the section above. The distinction matters: **the client behaves correctly; the server does not require it to.**

📌 Incidental: the **public portal fires two identical `TokenAuth/Authenticate` POSTs for one Login click** (both 200).
The admin portal fires one. Not a POPIA issue — recorded as an observation.

📌 Out of scope, and stated so rather than implied: what happens to the credential after TLS termination is not
observable from a browser.

---

### ⚠️ TC-03 — SA ID treated as special personal information, logs redacted (#107418 · TC-14Y-003) — PARTIAL

*Priority 2 · `L1-draft` · Both portals.*

- *"App logs tail shows SA ID masked or absent"* — **NOT EXECUTED.** No log access.
- The client-side half **fails**, on a finding already on record rather than one re-derived here: any 13-digit SA ID
  entered into the Office Bearer form returns a real person's name, date of birth and gender, and **the on-screen mask
  is cosmetic — the unmasked value is present in the DOM and in the saved grid.** For a POPIA case about *special
  personal information*, that is the material observation.
- I deliberately did **not** re-run that probe. Confirming it again means typing more real identity numbers into a
  live system to learn something already known.

**Verdict:** PARTIAL — the observable half fails; the prescribed half is unreachable.

---

### ✅ TC-04 — POPI Act consent captured before Register-New-NPO submission (#107419 · TC-14Y-004) — PASSED

*Priority 2 · `L1-draft` · Both portals.*

Route: **`/dynamic/boxfusion.dsdnpo/popi-act`**, form version **`popi-act v28 LIVE`**.

| ADO expectation (verbatim) | Observed | |
|---|---|---|
| *"POPI consent dialogue visible before any submission"* | Consent is the **first screen** of Register-a-new-NPO — it precedes the wizard entirely. The 7-step wizard (`Read This → Organisation Details → Objectives → Office Bearer → Admin & Operations → Documents → Declaration`) is only reached after it | ✅ |
| *"Submit blocked with plain-language POPIA notice"* | **Next is disabled** until both acknowledgements are ticked, and the notice itself is a full plain-language POPIA informed-consent statement naming the Responsible Party, the categories of information, and the retention position | ✅ |

The gate was proven rather than assumed, at all three states:

| Consent boxes ticked | `Next` |
|---|---|
| 0 | **disabled** |
| 1 of 2 | **disabled** |
| 2 of 2 | enabled |

That middle row is the one that matters — it shows both acknowledgements are independently enforced, not that the
button happens to start disabled.

**On the disabled-button caveat in the plan:** the plan warned that on this portal a disabled forward control usually
carries no explanation, and that this would fail the "plain-language notice" half. It does not fail here, because on
this screen *the notice is the page* — the user is looking at the full POPIA statement while the button is disabled.
This is the one place in the application where the disabled-button pattern is adequate.

**Consent persistence:** clicking Next created workflow instance
`6d7a6003-3d4c-4284-9a52-0b34584da013` (todo `a30e4fce-0c73-4f51-b525-37363f0f603b`). Whether the acknowledgement is
stored against the application as an admin-visible flag, or merely gates the UI, is **not established** — the
application was left at the wizard's first step. Worth closing on a later pass; it does not change this verdict,
since the case asks only that consent be captured before submission.

---

### 🔴 TC-05 — Subject access: user can export their personal data (#107420 · TC-14Y-005) — FAILED

*Priority 2 · `L1-draft` · Both portals.*

- *"Signed-in user opens Profile > Data & Privacy"* — **there is no Data & Privacy area.** The public-portal profile
  menu offers exactly three items: `Organistions` *(sic)*, `My Profile`, `Logout`.
- *"Export My Data action visible"* — **absent.** `My Profile` resolves to
  `/dynamic/boxfusion.dsdnpo/public-portal-user-management` and offers **Edit · Reset Password · Deactivate Account**,
  plus a User Details panel (Username, First/Last Name, Mobile, Email, Gender, Identity Number) and an
  `NPOs Linked` grid. No export of any kind.

🔑 **This is not a guessed-route 404.** The whole form registry was paged — **8 294 of 8 294 forms** — and searched for
`privacy|popi|consent|export|gdpr|retention|archiv|subject|my-data|data-and|erasure|deletion`. Exactly **one** form
matches, and it is `popi-act` (the consent notice from TC-04). There is no subject-access form, no export form and no
data-privacy form anywhere in the application.

**Verdict:** FAILED — the feature does not exist, established against the registry rather than inferred from navigation.

---

### ⬜ TC-06 — Data retention: inactive user records archived (#107421 · TC-14Y-006) — NOT EXECUTED

*Priority 2 · `L1-draft` · Both portals.*

The case's precondition is *"a user with no login in the policy-defined inactive window"*. **No such policy has ever
been shown to us**, so the window is undefined and the precondition cannot be constructed. Per the plan's own rule, an
unverifiable precondition makes this NOT EXECUTED, not FAILED — the feature is not being called absent on the strength
of a policy nobody has produced.

What *was* established, and is worth carrying forward:
- The same 8 294-form registry sweep found **no retention, archival or erasure form**.
- A user account carries a visible status (`ACTIVE`) and the profile exposes **Deactivate Account** — so a
  deactivation concept exists. Whether "deactivated" is the same thing as the case's "Archived" state, and whether
  personal data becomes inaccessible on deactivation, was **not tested** and should not be assumed either way.
- The retention *position* is disclosed to the user in the POPI notice: records are kept *"for as long as the
  Department of Social Development deems it necessary at its sole discretion."* That is a disclosed policy of
  indefinite retention, which sits oddly with a test case expecting automatic archival. **That contradiction is the
  thing to put to Thabiso** — it may mean the case is wrong rather than the application.

---

## Observations (not defects)
- Every request/response pair carries `X-Content-Type-Options`, `X-XSS-Protection` and `X-Frame-Options`, so security
  headers are not absent as a class — **HSTS specifically is missing.** That reads more like an oversight than a policy.
- The public portal exposes **no Live/Latest view-mode control** to an applicant account; the admin portal exposes
  three modes, not two (`Live` / `Ready` / `Latest`). Recorded because the pre-flight rule says to assert the mode,
  and on the public portal the honest answer is that a real user gets Live and has no choice.
- Profile menu label reads `Organistions` — spelling, consistent with the existing `Spartial Map` / `All Apllications`
  notes. Not raised.

## Open questions for Thabiso
1. **HSTS and the cleartext listener** — is terminating TLS at the platform without a redirect or HSTS a deliberate QA
   arrangement, or does it reflect production? This is the one item I would want answered before the next sitting.
2. **Correlation IDs** — TC-14Y-001 assumes they exist. Nothing emits one. Is that a gap in the application or in the case?
3. **TC-14Y-001 step 4 and TC-14Y-003** both turn on log content. Who can tail the QA logs, or should these be
   re-scoped to what a black-box tester can actually observe?
4. **TC-14Y-006 contradicts the POPI notice the application itself displays** (automatic archival vs retention "for as
   long as … deems necessary"). Which is correct — the case or the notice?
5. The SA-ID lookup returning a real person's identity for an arbitrary 13-digit number is routed to you as a
   **security** matter, not raised as a defect here.

## Evidence
- `14y-transport-evidence.json` — wire-header probes, cleartext probes, cookie comparison, request inventory,
  consent-gate state table, registry sweep result.
