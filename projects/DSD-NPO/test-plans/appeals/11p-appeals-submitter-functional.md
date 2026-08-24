# Test Plan: NPO-11P-F — Appeals: NPO Submitter (functional)

> **Status:** Imported from Azure DevOps 2026-08-17 — ⛔ **blocked**, not yet executable
> **Owner:** QA
> **Last Updated:** 2026-08-17
> **Estimated Duration:** 240s

## Metadata
| Field | Value |
|-------|-------|
| App URL | https://dsd-npo-publicportal-1-qa.shesha.app/login |
| Environment | QA |
| Login As | mpenduloizwelinuk@gmail.com / 123qwe |
| Lead tester | **Thabiso Kegakwile** |
| ADO Plan | [planId 101543 — DSD-NPO Functional Test Plan](https://dev.azure.com/boxfusion/Boxfusion%20Test%20Plans/_testPlans/define?planId=101543&suiteId=101896) |
| ADO Suite | 101896 — *11P - Appeals - NPO Submitter* (4 cases) |

## Objective
> Verify the rules that gate an appeal: the 30-day window on refusals, the absence of a window on cancellations, the conditional Written-Submission field, and the exclusion of Compulsory Registration cases.

## ⛔ Blocked — and the cases do not say how to start
Every case here begins mid-flow ("Try to open refusal appeal form", "Initiate Cancellation Appeal", "On Appeal form").
🔑 **Across all 16 appeals cases — 5 smoke + these 4 + 7 admin — not one specifies how a submitter reaches the appeal
form.** The smoke case TC-11-001 comes closest with *"Open the denied application → CLICK Appeal"*, and that control
could not be found on 2026-08-14. The tester has since confirmed the *Registration Application Unsuccessful* email
carries **no appeal link**, so that alternative is closed too.
**❓ This is the blocking question for Thabiso: where is the submitter's entry point to the appeal form?**

## Provenance
Imported from the ADO functional plan on 2026-08-17 via the browser + REST route. Expected results quoted verbatim.
All 4 cases state `Design`. **3 of the 4 carry a `Drift-Risk` tag** — see each case.

## Preconditions
- [ ] ⛔ A submitter route to the appeal form (unknown — see above)
- [ ] TC-01: a refusal notice **older than 30 days**
- [ ] TC-02: a **cancelled** NPO (any age)
- [ ] TC-04: an application for a **Compulsory-Register** organisation that was denied
- [ ] 🔑 View mode **Live → Latest**

## Test Cases

### TC-01 — Refusal appeal must be submitted within 30 days of refusal (ADO #101774 · TC-11-002)

*Priority 1 · Edge · `Drift-Risk`.*

- **Type:** Negative (time window)
- **Steps:**
  1. With a refusal notice **older than 30 days**, try to open the refusal appeal form
  2. ASSERT (BLOCKING) the form is blocked, or shows **'Out of appeal window'**
- **Expected result:** *"Form blocked or shows 'Out of appeal window'"*
- **Assertions:**
  - [ ] ASSERT (BLOCKING) the appeal form is refused for an out-of-window refusal
  - [ ] RECORD the exact wording shown
- **🔴 Drift note (Thabiso, from code):** *"no explicit 30-day window check found for refusal appeals."*
  **So this case is expected to FAIL.** Confirm by execution rather than assuming — a code-review risk can clear as
  well as confirm (the QR-code note on suite 07 cleared this way).
- **📌** Our denied application `APPL26-01106` was refused **2026-08-14**, so it only becomes out-of-window on about
  **2026-09-13**. Until then it tests the *in*-window branch, not this one.

---

### TC-02 — Appeal of Cancellation is not time-bound (ADO #101775 · TC-11-003)

*Priority 2 · Positive.*

- **Type:** Happy path (rule)
- **Steps:**
  1. On a **cancelled** NPO, initiate a **Cancellation Appeal**
  2. ASSERT (BLOCKING) the form opens **regardless of time elapsed**
- **Expected result:** *"Form opens regardless of time elapsed"*
- **Assertions:**
  - [ ] ASSERT (BLOCKING) the appeal form opens for a long-cancelled NPO
- **📌** *Cancellation* is a second appeal type alongside *Refusal to Register* — consistent with smoke TC-11-007,
  which filters the admin list by `Type = Cancellation`. **Still no case enumerates the full type list.**
- ⚠️ Note the distinction between **Cancelled** (`OrganisationStatus 7`) and **Deregistered** (`6`). Our
  `333-018-NPO` is *Deregistered*, not *Cancelled*, so it may not satisfy this precondition — check which the appeal
  form accepts.

---

### TC-03 — 'Written Submission' mode reveals the submission text field (ADO #101776 · TC-11-004)

*Priority 2 · Positive · `Drift-Risk`.*

- **Type:** Happy path (conditional field)
- **Steps:**
  1. On the appeal form, SELECT **Mode of Submission = Written**
  2. ASSERT (BLOCKING) a written-submission **text area appears and is required**
- **Expected result:** *"Written-submission text area appears and is required"*
- **Assertions:**
  - [ ] ASSERT the text area appears on selecting Written
  - [ ] ASSERT (BLOCKING) it is actually enforced as required, not merely marked
- **🔴 Drift note (Thabiso, from code):** *"Code enum says 'Oral' not 'Verbal' as in FDS — cosmetic but ensure UI
  label matches."* **RECORD the exact mode labels rendered.**
- **📌** This answers smoke TC-11-005's open note *"RECORD the mode options"* — the modes are **Written** and
  **Oral/Verbal**. Confirm on screen.
- 🔑 Test "required" by attempting to submit without it, not by reading an asterisk — this build has produced four
  separate unmarked-mandatory findings, and today's annual report had the inverse (fields marked nothing yet gating).

---

### TC-04 — Appeals do not apply to Compulsory Registration cases (ADO #101778 · TC-11-006)

*Priority 2 · Negative · `Drift-Risk`.*

- **Type:** Negative (business rule)
- **Steps:**
  1. On a denied application for a **Compulsory-Register** organisation, try to initiate an appeal
  2. ASSERT (BLOCKING) it is **blocked per FDS Appeals 5 Assumption**
- **Expected result:** *"Blocked per FDS Appeals 5 Assumption"*
- **Assertions:**
  - [ ] ASSERT (BLOCKING) the appeal cannot be initiated for a compulsory-registration case
- **🔴 Drift note (Thabiso, from code):** *"compulsory-registration block on appeals NOT enforced."*
  **Expected to FAIL.**
- **❓ Question for Thabiso:** how is an organisation flagged as *Compulsory Register* in the first place? Nothing in
  the registration wizard we have driven captures it, so this precondition may not be constructible on QA at all.

---

## Coverage against ADO

| Plan TC | ADO id | ADO TC | Drift-Risk | Reachable today |
|---|---|---|---|---|
| TC-01 | #101774 | TC-11-002 | ⚠️ no 30-day check in code | ⛔ no entry point; needs a >30-day-old refusal |
| TC-02 | #101775 | TC-11-003 | — | ⛔ no entry point; needs a Cancelled NPO |
| TC-03 | #101776 | TC-11-004 | ⚠️ Oral vs Verbal label | ⛔ no entry point |
| TC-04 | #101778 | TC-11-006 | ⚠️ block not enforced | ⛔ no entry point; precondition may be unbuildable |

**Also in suite 101896:** nothing further — this is all 4 cases.
**Smoke counterparts** (plan `11p-appeals-submitter.md`): TC-11-001, TC-11-005.
