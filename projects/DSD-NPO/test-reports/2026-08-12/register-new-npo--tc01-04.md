# Report: NPO-REG — Register a new NPO (TC-01 → TC-04)

**Date:** 2026-08-12
**Plan:** test-plans/npo-registration/register-new-npo.md
**Cases:** TC-01, TC-02, TC-03, TC-04
**Execution Mode:** ai-driven (Playwright via Node — the Playwright MCP exposed no tools this session)
**Result:** PARTIAL — TC-01/02/03 passed 13/13; TC-04 could not be completed because the harness did not populate every mandatory select, so Next stayed correctly disabled
**Duration:** not instrumented

## Summary
| Total Assertions | Passed | Failed | Skipped |
|---|---|---|---|
| 14 | 13 | 1 | 0 |

⚠️ **Run on the developer's account** (`mpenduloizwelinuk@gmail.com`), not a dedicated QA user. Self-registration
of our own applicant account was attempted first and abandoned at the OTP hand-off, so the provenance of this run
is the shared dev account. Flagged deliberately — see *Notes* below.

## Step Results

### TC-01 — POPIA informed-consent gate
**Mode:** ai-driven · **Result:** PASSED 7/7

- [PASS] NPO landing page reached — `/dynamic/boxfusion.dsdnpo/no-existing-npo-landing-page`
- [PASS] Three actions offered — Register a new NPO · Link to an Existing NPO · Enquiry
- [PASS] (BLOCKING) POPIA page displayed — `/dynamic/boxfusion.dsdnpo/popi-act`, headed *"Informed Consent Notice under POPIA"* / *"I, the undersigned, hereby:"*
- [PASS] Both consents present and **unticked** on arrival — `[false, false]`
- [PASS] Next blocked with **0** consents ticked — **Next is disabled** on arrival
- [PASS] Next blocked with **1** consent ticked — still disabled
- [PASS] Next proceeds with **both** ticked → `/shesha/workflow-action?id=b65b2d71-…&todoid=6ee27176-…`

**Consent is properly enforced.** The gate is implemented as a disabled button rather than a submit-time error.

### TC-02 — Initiate Registration wizard
**Mode:** ai-driven · **Result:** PASSED 4/4

- [PASS] (BLOCKING) Workflow instance created on consent — `id=b65b2d71-e108-42d6-bfe5-eb81a02b9724`, `todoid=6ee27176-7267-41ad-b5f2-43ce229fa285`
- [PASS] Seven steps named exactly: **Read This · Organisation Details · Objectives · Office Bearer · Admin & Operations · Documents · Declaration**
- [PASS] *Read This* carries no input fields (informational only)
- [PASS] Next advances off *Read This* to *Organisation Details*

### TC-03 — Organisation Details: mandatory-field marking
**Mode:** ai-driven · **Result:** PASSED 2/2

- [PASS] 8 of 30 fields are marked mandatory: **Organisation Name · Organisation mobile number · Organisation Email Address · Financial year end month · Full Address (×2) · Legal Form · Office Bearer Term (Year(s))**
- [PASS] Next blocked on an empty step — it does not advance

⚠️ Both blocks were **silent**: zero validation messages were rendered (`.ant-form-item-explain-error`,
`.ant-message-error` and `.ant-alert-error` were all empty). See *Observations*.

### TC-04 — Organisation Details: happy path
**Mode:** ai-driven · **Result:** FAILED (harness limitation, not a confirmed app fault)

- [FAIL] (BLOCKING) Advance to *Objectives* — active step remained *Organisation Details*

What actually happened: 9 text fields were filled and 1 radio selected, but **only 1 of the several selects was
populated** — after the first dropdown was set, the subsequent `.ant-select` interactions did not take. With a
mandatory select still empty, **Next was legitimately disabled** (`nextDisabled=true` immediately before the
click), so the click waited 45s for an actionable element and timed out.

**This retracts the earlier reading of this symptom.** On the 2026-08-12 exploratory pass the same 15s timeout was
recorded as an unexplained possible fault. It is not a hang and not a backend failure — it is a disabled button.
The remaining defect here is the *absence of feedback*, not the gating.

**Format validation (invalid email / non-numeric mobile / non-numeric term) was NOT exercised** — the run did not
reach that point. TC-03's format assertions remain untested.

## Observations — for Thabiso, not raised as defects

1. **The wizard blocks progression with no indication of what is missing.** Next is disabled on both the empty step
   and the partially populated step, with **no validation message on any field and no summary message**. A user
   cannot tell which of the 8 mandatory fields is unsatisfied. This is the same shape as an observation already
   recorded against PD-PMDS's DDG draft wizard, so it may be a Shesha-wide form pattern rather than a DSD-NPO bug.
2. **`Full Address *` is genuinely duplicated** — confirmed, two separately-required fields share one label, each
   followed by its own District Municipality / Metropolitan Municipality / Area Code group, one also carrying
   Province. Presumably physical vs postal. **A spec cannot address these by label and must index positionally.**
   Worth correcting in the form config.
3. **Legal Form options are: Voluntary Association · NPC · Trust.** Recorded for the plan; whether each changes the
   downstream required fields is unknown.
4. **The POPIA consent asks the applicant to attest they have read the Education and Awareness library** — the
   system cannot verify this. Intended control, or should it gate on actual library access?
5. **`404 GET /api/services/dsdnpo/NpoPerson/CurrentPersonLogin`** recurred throughout the run. It did not visibly
   break this flow, but it is a missing endpoint on every page load.
6. **Sign-up is a two-stage OTP** — *Verify Number* only validates the number; a separate *Send OTP* dispatches the
   SMS. Clicking only the first looks successful and sends nothing. Found while attempting to create our own user.

## Test data created
- Registration workflow **`b65b2d71-e108-42d6-bfe5-eb81a02b9724`** (todo `6ee27176-7267-41ad-b5f2-43ce229fa285`),
  parked at *Organisation Details*, partially populated, Organisation Name `QA Test NPO 2026-08-12`.
- An earlier draft from the exploratory pass, **`1c4cab6f-ba3d-496f-917c-0548e0fed241`**, also remains.
- **Two abandoned drafts now exist on this account.** Resume one rather than creating a third.

## Notes
- Executed with Playwright driven from Node, because the Playwright MCP server connects but exposes no tools in
  this session. No `.spec.ts` exists for this plan yet.
- ADO plans 101543/101884 and 101541/101858 and work item 101615 are **still unread** — the `ado` MCP now connects
  (the earlier timeout was an npx cold start) but its tools only register at session start, so a restart is needed.
  Work item 101615 was flagged as *"I think it failed testing"* and should be read before this flow is retested.
