# Test Plan: NPO-13-F — Voluntary Deregistration (functional)

> **Status:** Imported from Azure DevOps 2026-08-18 — submitter cases run on our registered NPO `333-019`; admin cases need a submitted deregistration, and two are 30-day-clock bound.
> **Owner:** QA
> **Last Updated:** 2026-08-18
> **Estimated Duration:** 1200s

## Metadata
| Field | Value |
|-------|-------|
| App URL | Public: https://dsd-npo-publicportal-1-qa.shesha.app/login · Admin: https://dsd-npo-adminportal-qa.shesha.app/login |
| Environment | QA |
| Login As | mpenduloizwelinuk@gmail.com / 123qwe |
| Lead tester | **Thabiso Kegakwile** |
| ADO Suites | 101900 *13P Submitter* (TC-13-003/004/006) · 101899 *13A Admin* (TC-13-009/011/012/013) |

## Objective
> Verify the Voluntary Deregistration journey: the submitter wizard (severance type, OB scoping, effective-date
> validation) and the admin processing (detail view; the insufficient-documents → 30-day-notice → denial /
> investigation path).

## No overlap with the smoke plan
Smoke plans `13a-*`/`13p-*` own **TC-13-001/002/005/007/008/010**. This functional plan owns the other 7 — nothing
shared.

## 🔑 Use our OWN registered NPO
Drive the submitter cases on **`333-019-NPO`** (`Nomfanelo QA Annual NPO`, npo id `4be65ab5-…`), which we own. Its
landing view exposes a **Voluntary Deregistration** action (seen 2026-08-18).
⚠️ **Submitting a deregistration starts a workflow on 333-019.** It does not immediately deregister (admin validates
first), but avoid driving it to a terminal deregistered/denied state unless the case requires it, so the NPO stays
usable for other suites.

## Preconditions
- [ ] Public portal reachable; signed in; on the registered NPO `333-019` landing → **Voluntary Deregistration**.
- [ ] For admin cases: a submitted deregistration in the admin queue + the admin portal.

## Test Cases

### TC-01 — Severance type options present (ADO #101802 · TC-13-003)
*P2 · Positive · Src:Both.* ✅ **Runnable.**
- **Steps:** 1. Open the "type of severance" dropdown
- **Expected result:** *"Both 'Voluntary Deregistration' and 'Dissolution/Winding-up' exist (FDS Dereg 7.1.1 rule 5)"*
- **Assertions:** [ ] both options present · [ ] RECORD the full option list

### TC-02 — OB search restricted to this NPO (ADO #101803 · TC-13-004)
*P2 · Edge · Src:FDS.* ✅ **Runnable.**
- **Steps:** 1. Search for an office bearer in the deregistration wizard
- **Expected result:** *"Only OBs of this NPO are returned; OBs of other NPOs are not searchable (rule 7a)"*
- **Assertions:** [ ] (BLOCKING) results are scoped to this NPO's OBs · [ ] an OB from another NPO does not appear
- **📌** Cross-check by searching for an OB name we know belongs to a *different* NPO (e.g. an OB of the 08-18 fresh app).

### TC-03 — Effective-date validation (ADO #101805 · TC-13-006)
*P3 · Edge · Src:FDS.* ✅ **Runnable.**
- **Steps:** 1. On Step 2 enter an effective date of donation far in the past, then far in the future
- **Expected result:** *"Date validation appropriate to business rules"*
- **Assertions:** [ ] RECORD which dates are accepted/rejected · [ ] note whether the picker disables out-of-range dates
- **⚠️** Drive the AntD picker via the panel (never `fill()`).

### TC-04 — Admin detail view shows captured info/assets/comments (ADO #101808 · TC-13-009)
*P2 · Positive · Src:FDS.* ⚠️ **Needs a submitted deregistration.**
- **Steps:** 1. Open the deregistration's admin detail view
- **Expected result:** *"All captured details, documents, status, risk and assets visible (FDS Dereg 8.2)"*
- **Assertions:** [ ] captured details shown · [ ] documents shown · [ ] status/risk shown · [ ] assets shown

### TC-05 — Insufficient documents → notice + 30-day clock (ADO #101810 · TC-13-011)
*P1 · Negative · Src:FDS.* ⚠️ **Admin action runnable; notice/clock need verification.**
- **Steps:** 1. As admin choose **'Not Sufficient'**, capture a description, submit
- **Expected result:** *"Notice email sent to org; 30-day resubmission window starts"*
- **Assertions:** [ ] (BLOCKING) the insufficient outcome is recorded · [ ] RECORD the notice (`NotificationMessage`) ·
  [ ] RECORD whether a 30-day due date is shown
- **📌** The UI action is testable; the email leg needs `NotificationMessage` (SMS is dead; email may work).

### TC-06 — No resubmission in 30 days → denied (ADO #101811 · TC-13-012)
*P2 · Negative · Src:FDS.* ⛔ **BLOCKED — 30-day clock.**
- **Steps:** 1. Wait 30 days with no resubmission
- **⛔** Requires system-clock control on QA. Not runnable; ask Thabiso whether the timer can be triggered.

### TC-07 — Resubmitted but still insufficient → denied + investigation (ADO #101812 · TC-13-013)
*P2 · Edge · Src:FDS · `Drift-Risk`.* ⚠️ **Needs a resubmission cycle.**
- **Steps:** 1. Validate the resubmitted documents as insufficient again
- **Expected result:** *"Deregistration denied; investigation case opened (FDS Dereg 6.2 rule 7b)"*
- **Assertions:** [ ] denied · [ ] an investigation case is opened
- **📌** Chains off TC-05 + a submitter resubmission; defer unless the cycle can be completed.

## Coverage against ADO
| Plan case | ADO | TC id | P | Portal | Runnable? |
|---|---|---|---|---|---|
| TC-01 | #101802 | TC-13-003 | 2 | Public | ✅ yes |
| TC-02 | #101803 | TC-13-004 | 2 | Public | ✅ yes |
| TC-03 | #101805 | TC-13-006 | 3 | Public | ✅ yes |
| TC-04 | #101808 | TC-13-009 | 2 | Admin | ⚠️ needs a submitted dereg |
| TC-05 | #101810 | TC-13-011 | 1 | Admin | ⚠️ action runnable; notice/clock to verify |
| TC-06 | #101811 | TC-13-012 | 2 | Admin | ⛔ 30-day clock |
| TC-07 | #101812 | TC-13-013 | 2 | Admin | ⚠️ needs resubmission cycle |

**7 cases owned.** Smoke counterparts: TC-13-001/002/005/007/008/010.

## Suggested run order
1. **TC-01, TC-02, TC-03** — submitter wizard on 333-019 (dropdown, OB scoping, date validation), without necessarily
   completing the submission.
2. If safe, **submit** the deregistration → **TC-04** (admin detail view), **TC-05** (insufficient → notice).
3. **TC-06** (clock) and **TC-07** (resubmission cycle) — defer / raise as dependencies.

---

## ✅ Executed 2026-08-18 — 3 submitter cases pass; admin cases deferred
Report: `test-reports/2026-08-18/13-voluntary-deregistration-functional--submitter.md`

| Case | Verdict | Note |
|---|---|---|
| TC-01 (TC-13-003) | ✅ PASS | severance radio: Voluntary Deregistration + "Dissolution Winding Up" |
| TC-02 (TC-13-004) | ✅ PASS | OB search scoped to 333-019; other-NPO OB "Threemember" → No data |
| TC-03 (TC-13-006) | ✅ PASS (note) | past dates disabled; **no future cap** (Aug 2028 fully enabled) — BA question |
| TC-04 (TC-13-009) | ⏸ deferred | needs a submitted dereg (not run to protect 333-019) |
| TC-05 (TC-13-011) | ⏸ deferred | needs a submitted dereg |
| TC-06 (TC-13-012) | ⛔ blocked | 30-day clock |
| TC-07 (TC-13-013) | ⏸ deferred | resubmission cycle |

🔑 Entry: registered-NPO landing → Voluntary Deregistration → `portal-deregistration-table` → Initiate → 3-step wizard
(Guideline → Deregistration Details → Declaration and Documents). Left as an un-submitted draft.

## ADO anchors (machine-read — do not delete)
- ADO #101802 · TC-13-003
- ADO #101803 · TC-13-004
- ADO #101805 · TC-13-006
- ADO #101808 · TC-13-009
- ADO #101810 · TC-13-011
- ADO #101811 · TC-13-012
- ADO #101812 · TC-13-013

---

## ✅/🔴 Executed 2026-08-20 — admin cases run on 333-019; detail view PASS, validation BROKEN
Report: `test-reports/2026-08-20/13-voluntary-deregistration-functional--admin-processing.md`

| Case | Verdict | Note |
|---|---|---|
| TC-04 (TC-13-009) | ✅ PASS (note) | detail view shows details/docs/status/risk/assets; some records render blank captured fields |
| TC-05 (TC-13-011) | 🔴 FAIL (blocker) | Validate Documents → Decline = `UserTaskSave` **400**; root cause `voluntary-deregistration-definition` **not found** (GetUserDecisions 404). No notice, no clock |
| TC-06 (TC-13-012) | ⛔ BLOCKED | 30-day clock + blocked by TC-05 |
| TC-07 (TC-13-013) | ⛔ BLOCKED | chains off TC-05 |

Completed + submitted our own dereg on **333-019** (Initiated→In Progress) to get an actionable record; NPO stayed
REGISTERED but now carries a stuck In-Progress dereg (the workflow action can't complete). Bug:
`bugs/2026-08-20-deregistration-validate-documents-workflow-definition-missing.md` (High).
