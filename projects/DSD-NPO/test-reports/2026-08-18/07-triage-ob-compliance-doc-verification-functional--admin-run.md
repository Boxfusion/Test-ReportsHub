# Report: NPO-07-F — Backend Triage, OB Compliance & Document Verification (admin run)

**Date:** 2026-08-18 10:10 UTC
**Plan:** test-plans/application-processing/07-triage-ob-compliance-doc-verification-functional.md
**Execution Mode:** ai-repair
**Result:** FAILED — 5 passed, 3 failed of 9 verdicted; a new **mixed-OB-compliance mis-status** defect confirmed (DB + UI)
**Duration:** ~1800s
**Cases:** TC-07-005, TC-07-007, TC-07-009, TC-07-012, TC-07-016, TC-07-017, TC-07-018, TC-07-019 · TC-07-011 (deferred)
**Environment:** QA · **admin portal** · signed in as the shared admin account
**Application under test:** **APPL26-01270** (`50cc1481-…`), our own submitted Trust application. Driven to **OB Failed
Compliance**; left recoverable (Document Verification closed without submitting).

## Summary
| Verdicted | Passed | Failed | Deferred |
|---|---|---|---|
| 9 | 5 | 3 | 1 (+ 5 blocked/not-UI) |

| Case | Title | Verdict |
|---|---|---|
| TC-07-005 | Admin can add a comment | ✅ PASS |
| TC-07-007 | OB Non-Compliant requires a reason | ✅ PASS (via disabled Submit) |
| TC-07-009 | Mixed OB compliance → 'OB Partially Compliance' | 🔴 **FAIL** — records **'OB Failed Compliance'** |
| TC-07-012 | Doc 'No' without reason is blocked | ✅ PASS |
| TC-07-016 | Audit trail original vs revised | 🔴 FAIL (no audit trail — carried from suite 05) |
| TC-07-017 | Risk Status flag visible | ✅ PASS |
| TC-07-018 | 'Compulsory to Register' flag visible | ✅ PASS |
| TC-07-019 | Two-month SLA timer visible | 🔴 FAIL — no SLA/due-date shown |
| TC-07-011 | Any doc 'No' → Incomplete | ⚪ DEFERRED — verify path blocked by the failed-OB state (see below) |

## 🔴 TC-07-009 — Mixed OB compliance is recorded as 'OB Failed Compliance' (new defect)
Bug: `bugs/2026-08-18-mixed-ob-compliance-recorded-as-failed-not-partially.md`.

In OB Compliance I answered *"Are all office bearers compliant? = No"* and marked **only 1 of 3** office bearers
non-compliant (Alpha One), with a reason; Beta Two and Gamma Three left compliant. DB confirms the split:
`Alpha One nonCompliant=true, Beta Two=false, Gamma Three=false`. That is a **mixed** outcome, which per TC-07-009
should be **'OB Partially Compliance' (RefList=12)**.

**Actual:** `applicationStatus = 10`, and the header chip reads **"FAILED COMPLIANCE"** — i.e. **'OB Failed Compliance'**,
the *all*-non-compliant outcome (TC-07-008). So the build does not distinguish partial from full OB failure; a single
non-compliant bearer fails the whole application. *Evidence: v16.*
🔑 Verified via the UI label (not just the enum) and the DB OB rows, so it's not a mis-read reference value.
⚠️ Knock-on: because the app is now "OB Failed Compliance", Document Verification cannot conclude via the verify path
(below) — the wrong status may also be foreclosing the correct downstream flow.

## ✅ TC-07-005 — Admin comment
Entered a comment in the Comments box → saved and displayed with **author "Mpendulo ntshangase"** and **timestamp
"Aug 18, 2026 10:00 AM"**; the "There are no notes" empty state cleared. All three assertions met.

## ✅ TC-07-007 — OB non-compliant requires a reason
With an OB selected non-compliant and the reason empty, **Submit stayed disabled**; typing a reason flipped it to
enabled. So the reason is required — enforced by a **disabled button, not an explicit message** (the same silent
pattern seen across the build; record it, but the block itself is correct).

## ✅ TC-07-012 — Document 'No' without a reason is blocked
In Document Verification, marking *"Name of the organisation verified? = No"* with an empty reason left **all outcome
buttons (Decline / Approve / Reject) disabled**. On the reject path (*"refuse/reject? = Yes"*), **Reject enabled only
once both rejection-reason fields were filled**. So a 'No'/reject without a reason cannot be submitted. *Evidence: v17.*

## ✅ TC-07-017 / TC-07-018 — Risk & Compulsory indicators
The application header shows a **"HIGH RISK"** chip (Risk Status) and a **"COMPULSORY"** chip (Compulsory-to-Register).
Both indicators are visible as required. *Evidence: v15.* 📌 They render as header status chips, not labelled fields —
acceptable per the cases (indicator visible). ⚠️ We still don't know the rule that drives either — ask Thabiso.

## 🔴 TC-07-019 — Two-month SLA timer not shown
Scanned the whole application detail (all tabs render in the DOM): **no SLA countdown, due-date, or processing-period
field anywhere**. The case expects an SLA/due-date reflecting ~2 months (FDS 6.1 rule 8). Not present → FAIL.
⚠️ Even if added later, note the `submissionDate` defect
(`bugs/2026-08-18-submission-date-stamped-at-draft-creation.md`) — an SLA computed from that wrong date would be wrong.

## 🔴 TC-07-016 — Audit trail (carried FAIL)
No application audit view exists (Admin → Audit Logs is only Logon/OTPs/Notifications; all entity-history routes 404) —
established in suite 05 (`bugs/2026-08-18-no-submission-snapshot-or-application-audit-log.md`). The "original vs revised
snapshot" the case requires cannot exist. Verdict carries: **FAIL**.

## ⚪ TC-07-011 — deferred, and why
TC-07-011 (any document 'No' → Incomplete) runs on the **verify** path (refuse/reject = No). On APPL26-01270 that path
**dead-ended**: with refuse=No and all questions answered, **no outcome button ever enabled** — because *"Are OBs
Compliant?"* is locked to **No** (carried from the OB step I had just failed). You cannot Approve an OB-failed app, and
the verify path offers no other action. So Incomplete was unreachable **on this application** — an artefact of my own
run order (I failed OB compliance first).
▶ **To execute cleanly:** use an application whose OBs **pass** compliance, then mark a document 'No' → expect
Incomplete. Needs a second submitted application (register + submit one, keep OBs compliant).

## 🔑 Correction to a smoke-plan open finding
The smoke plan flagged *"Approve stays enabled on an application marked for refusal."* On this run **Approve was
correctly disabled** whenever OBs were non-compliant or the app was marked to refuse. So that earlier finding is
**context-specific, not general** — Approve's gating does work here. `Decline` never enabled in any combination
(consistent with smoke — worth asking whether Decline is a dead control).

## Cases not run (per scope / dependencies)
- **TC-07-008** (all OBs non-compliant → Failed) — the status it targets (10/Failed) is the one mixed *also* produced,
  so it's partly evidenced; a clean run needs a fresh app. Deferred.
- **TC-07-014** (3× resubmission → Unsuccessful) — heavy multi-cycle setup; deferred.
- **TC-07-015** (submitter edit mode on resubmission) — chains off a clean TC-07-011 (Incomplete), which we couldn't
  reach; deferred with it.
- **TC-07-020** (non-admin cannot access admin views) — ⛔ needs a role-scoped non-admin user; and note the API answers
  anonymously anyway. On the scope-exceptions list.
- **TC-07-021 / TC-07-022** — ⛔ API-only (BackfillDocuments / bulk reallocation). On the scope-exceptions list.

## Observations for the test lead
1. 🔴 **Mixed OB compliance is recorded as 'Failed', not 'Partially'** — a single non-compliant bearer fails the whole
   application. Is "Partially Compliance" (RefList=12) wired at all?
2. 🔴 **No SLA/due-date is shown** on the application detail (TC-07-019).
3. **What drives the HIGH RISK and COMPULSORY flags?** We can see them but not the rule.
4. **Is `Decline` a live control?** It never enabled in any combination.
5. To finish suite 07 we need **a second submitted application with compliant OBs** (for TC-07-011/015) and
   **role-scoped users** (TC-07-020) — the standing project dependency.

## 📸 Evidence — `test-reports/2026-08-18/evidence/`
| File | Shows |
|---|---|
| `v15-admin-triage-risk-compulsory-chips.png` | HIGH RISK + COMPULSORY chips on the application header |
| `v16-mixed-ob-compliance-shows-failed-not-partially.png` | "FAILED COMPLIANCE" chip after a 1-of-3 (mixed) OB outcome |
| `v17-doc-verification-reject-enabled-only-with-reasons.png` | Reject enabled only once rejection reasons are filled |

## Method notes
- 🔑 Drove our **own** application (APPL26-01270) throughout; closed Document Verification without submitting to keep it
  recoverable.
- 🔑 Confirmed the mixed-OB defect against **both** the UI label ("FAILED COMPLIANCE") and the DB OB rows — not a
  reference-list mis-read.
- 🔑 Run-order lesson: **do Document Verification (TC-07-011) before failing OB compliance** — a failed-OB app blocks the
  verify path's outcome buttons.
