# Test Plan: NPO-14Y-F — POPIA transport & logging (functional)

> **Status:** Imported from Azure DevOps 2026-08-25
> **Owner:** QA
> **Last Updated:** 2026-08-25
> **Estimated Duration:** 420s

## Metadata
| Field | Value |
|-------|-------|
| App URL | https://dsd-npo-publicportal-1-qa.shesha.app/login |
| Environment | QA |
| Login As | mpenduloizwelinuk@gmail.com / 123qwe (plus the two QA applicant accounts) |
| Lead tester | **Thabiso Kegakwile** |
| ADO Plan | [planId 101543 — DSD-NPO Functional Test Plan](https://dev.azure.com/boxfusion/Boxfusion%20Test%20Plans/_testPlans/define?planId=101543&suiteId=102152) |
| ADO Suite | 102152 — *14Y - POPIA (transport + logging)* (6 cases) |

## Objective
> Verify that personal information moves over TLS only, that consent is taken before an NPO registration is
> submitted, that the SA ID number is handled as special personal information, and that a data subject has a route
> to export and to have their record retired.

## Provenance
Imported from the ADO functional plan on 2026-08-25 via the browser + REST route; raw pull retained at
`test-data/ado-functional-101543/ado-suite-102152.json`. Expected results quoted verbatim.
TC-14Y-001 is `Src:Sys-Obs` P1; the other five are `L1-draft` **Coverage-Gap-Topup** cases, i.e. authored to close a
gap and **not yet L3-validated**. Treat their wording as provisional and say so in any verdict that turns on it.

## ⚠️ Scope boundary — read before verdicting
Three of these six cases assert on **application logs** or a **retention job**. We have no log tail and no job
console, and [[black-box-ui-only-no-api-testing]] keeps us out of the server. So:
- The **transport** half of each case is observable from the browser and IS verdicted.
- The **log-content** half is **NOT EXECUTED**, named as such, and handed to Thabiso — not guessed at, and not
  quietly folded into a PASS. A case that is half-observable gets **PARTIAL**, never PASS.
- 🔑 Never transcribe an SA ID, name or DOB returned by the OB form into this plan, a report, or evidence JSON —
  the QA data is live. Describe it, count it, mask it.

## Preconditions
- [ ] Public portal sign-in (applicant) and admin portal sign-in
- [ ] 🔑 View mode **Live → Latest**, asserted not assumed
- [ ] A registration wizard reachable at the POPIA consent step
- [ ] Browser network log available — this is the instrument for every transport case

## Test Cases

### TC-01 — Wizard over HTTPS only; submitter PII not echoed to logs (ADO #102161 · TC-14Y-001)

*Priority 1 · Security · `Src:Sys-Obs` · Public.*

- **Steps (ADO):** 1. Open DevTools Network and submit a draft Application Wizard with synthetic PII · 2. Inspect
  every request URL and response headers · 3. Capture the request correlation ID · 4. Search application logs for the
  submitter's RSA ID, email and cellphone
- **Expected result (ADO):** *"All wizard requests use https:// scheme; no http:// requests"* · *"Strict-Transport-Security
  header is set; no mixed-content warnings"* · *"Correlation ID is present and unique per request"* · *"Logs reference
  the correlation ID but do not contain raw RSA ID, raw email, or raw cellphone"*
- **Assertions:**
  - [ ] (BLOCKING) ASSERT every request the wizard issues is `https://` — count them, report the count
  - [ ] ASSERT no mixed-content error in the console
  - [ ] ASSERT a `Strict-Transport-Security` response header on the portal origin AND on the API origin — they are
        **different hosts**, so check both
  - [ ] RECORD whether any correlation/trace id header is returned, and whether it varies per request
  - [ ] Step 4 — **NOT EXECUTED**, no log access. Name it.
- **NOTE** The API is on `dsd-npo-api-qa.shesha.app`, the portal on `dsd-npo-publicportal-1-qa.shesha.app`. An HSTS
  header on one says nothing about the other.

---

### TC-02 — Sign In credentials transmitted over TLS only (ADO #107417 · TC-14Y-002)

*Priority 2 · `L1-draft` · Both portals.*

- **Steps (ADO):** 1. Capture the Sign In request via browser DevTools Network
- **Expected result (ADO):** *"Request URL uses https://. Password appears only in TLS-encrypted body; no plaintext leak."*
- **Assertions:**
  - [ ] (BLOCKING) ASSERT the sign-in POST is `https://`
  - [ ] ASSERT the password travels in the **request body**, not the query string or the URL
  - [ ] ASSERT the credential is not written to `localStorage`/`sessionStorage` and not echoed in the response
  - [ ] RUN THIS ON BOTH PORTALS — the case says `Both`, and they are separate deployments
- **NOTE** "No plaintext leak" is only checkable client-side. Where it goes after TLS termination is out of scope; say so.

---

### TC-03 — SA ID treated as special personal information, logs redacted (ADO #107418 · TC-14Y-003)

*Priority 2 · `L1-draft` · Both portals.*

- **Steps (ADO):** 1. Perform DHA verification with a synthetic SA ID
- **Expected result (ADO):** *"App logs tail shows SA ID masked (e.g. XXXXXXXXXX1234) or absent. Audit trail logs SA ID
  only if strictly required + separately protected."*
- **Assertions:**
  - [ ] Log tail — **NOT EXECUTED**, no log access
  - [ ] ASSERT what the **client** does with the SA ID instead: is it masked in the DOM, or only visually?
  - [ ] ASSERT whether the audit trail surfaces an SA ID to an admin who has no business need for it
- **NOTE** Known and already recorded: **any** 13-digit SA ID typed into the OB form returns a real person's name, DOB
  and gender, and the on-screen mask is cosmetic — the unmasked value is in the DOM. That finding bears directly on
  this case. Cross-reference it; do not re-derive it by typing more real IDs.

---

### TC-04 — POPI Act consent captured before Register-New-NPO submission (ADO #107419 · TC-14Y-004)

*Priority 2 · `L1-draft` · Both portals.*

- **Steps (ADO):** 1. Open the Register-New-NPO flow · 2. Attempt submit without ticking consent
- **Expected result (ADO):** *"POPI consent dialogue visible before any submission."* · *"Submit blocked with
  plain-language POPIA notice."*
- **Assertions:**
  - [ ] (BLOCKING) ASSERT a POPIA consent step is presented **before** any application data is submitted
  - [ ] ASSERT the forward control is **disabled or blocked** with consent untouched
  - [ ] ASSERT the block carries a **plain-language POPIA notice**, not a bare disabled button
  - [ ] RECORD whether the consent is persisted against the application (an admin-visible flag), or only gates the UI
- **NOTE** On this portal a disabled forward button is the normal failure mode and carries **no** message — see the
  known-breakage table. So "Next is disabled" satisfies the second assertion and **fails the third**. Verdict on both
  halves separately. Also: clicking Next on the POPIA page **creates a workflow instance** — capture the id.

---

### TC-05 — Subject access: user can export their personal data (ADO #107420 · TC-14Y-005)

*Priority 2 · `L1-draft` · Both portals.*

- **Steps (ADO):** 1. Signed-in user opens Profile → Data & Privacy · 2. Trigger export
- **Expected result (ADO):** *"Export My Data action visible."* · *"Email sent with structured export (JSON or CSV) of
  user PII + linked NPO records."*
- **Assertions:**
  - [ ] (BLOCKING) ASSERT a **Profile → Data & Privacy** area exists
  - [ ] ASSERT an **Export My Data** action is visible to a signed-in applicant
  - [ ] If it exists, trigger it and ASSERT an export notification is raised
  - [ ] If it does not exist, enumerate what the profile menu **does** offer, so the gap is described and not just asserted
- **NOTE** Check the **form registry** before concluding the screen is absent — a 404 on a guessed route proves nothing.
  This is the single most likely place to repeat the 14U mistake.

---

### TC-06 — Data retention: inactive user records archived (ADO #107421 · TC-14Y-006)

*Priority 2 · `L1-draft` · Both portals.*

- **Steps (ADO):** 1. Precondition — a user with no login in the policy-defined inactive window (seed data) ·
  2. Run the retention job or observe the scheduled trigger
- **Expected result (ADO):** *"User record moved to Archived state; personal data no longer accessible via normal
  queries; audit entry recorded."*
- **Assertions:**
  - [ ] ASSERT whether an **Archived** state exists for a user at all — that much is observable in User Management
  - [ ] RECORD whether any retention period is configured anywhere reachable
  - [ ] The job run itself — **NOT EXECUTED**, no job console
- **NOTE** The case names a "policy-defined period" that we have never been shown. Before verdicting, ask whether the
  policy exists; an unverifiable precondition makes this **NOT EXECUTED**, not FAILED.

## Open questions for Thabiso
- Is there a POPIA retention policy with a defined inactive window, and where is it configured?
- TC-14Y-003 and TC-14Y-001 both hinge on log content we cannot see. Who can tail the QA logs for us, or should these
  cases be re-scoped to what a black-box tester can observe?
- The SA-ID lookup returning a real person's identity for an arbitrary 13-digit number is a **security** finding, not
  a daily-report defect — routing it to you rather than raising it.
