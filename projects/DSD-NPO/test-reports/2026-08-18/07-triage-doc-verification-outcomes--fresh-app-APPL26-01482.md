# Report: NPO-07-F — Document Verification outcomes (fresh compliant-OB app)

**Date:** 2026-08-18 12:20 UTC
**Plan:** test-plans/application-processing/07-triage-ob-compliance-doc-verification-functional.md
**Execution Mode:** ai-repair
**Result:** FAILED — no "Application Incomplete" / resubmission path exists; a first-time Document Verification reject denies the application outright
**Duration:** ~2400s (incl. a full fresh registration)
**Cases:** TC-07-011 (FAIL), TC-07-014 (evidenced), TC-07-015 (blocked); plus a data-consistency defect
**Environment:** QA · public + admin portals
**Application built for this:** **APPL26-01482** (`0d9cc774-…`), NPO `255bea2e-…`, VA/Membership, **3 compliant office
bearers** (Ryno Koen RSA-ID Chairperson; two passport OBs Secretary + Treasurer). Registered + submitted fresh so the
compliant-OB path could be reached.

## Why a fresh application was needed
The prior suite-07 run left our only submitted app (APPL26-01270) at "OB Failed Compliance", which blocks the
Document-Verification verify path. TC-07-011/015 need an app whose **OBs pass** compliance. So a new application was
registered end-to-end (7-step wizard) with 3 compliant OBs and submitted (status → OB Compliant, 9).

## 🔑 The address-autocomplete method (this had blocked a fresh registration)
The wizard's Full Address and OB Residential Address fields are Google **Places** autocompletes. Under automation the
suggestion dropdown does not populate from `fill()`; the working method is **type slowly → `ArrowDown` → `Enter`** to
select the first prediction (this populates the resolved address and the hidden Province/Lat-Long). Both the physical
**and** postal addresses must be selected individually — "Same as postal" (checked, hidden) does **not** copy the
postal address. Recorded so fresh registrations aren't blocked again.

### 🔴 TC-07-011 — no "Application Incomplete" outcome exists — FAILED
Bug: `bugs/2026-08-18-no-application-incomplete-first-reject-denies-outright.md`.

The case: *"Mark one document No with reason → Status 'Application Incomplete' (RefList=4); Incomplete notification to
amend/resubmit."* Observed on the compliant-OB app, in Document Verification (questions: refuse/reject?, Name verified?,
Directors/OBs verified?, Org services verified?, FYE verified?, plus a prefilled "Are OBs Compliant?"):

- **refuse/reject = No + a verification = No (with reason) → ALL outcome buttons (Approve/Reject/Decline) stay
  disabled.** The assessor cannot submit anything — a dead state. (Reproduced on both APPL26-01482 here and APPL26-01270
  earlier, so it is not the OB state.)
- **refuse/reject = No + all verifications = Yes → Approve enables** (the happy path).
- **refuse/reject = Yes + reasons → Reject enables.** Clicking Reject (confirm dialog *"Are you sure you want to reject
  application…"*) → the **NPO goes straight to status 3 "App Failed"** (public portal: **"APPLICATION FAILED"**), with
  **no resubmission/edit action** for the submitter.

So there is **no path that produces "Application Incomplete" (status 2 / RefList 4)** with an amend-and-resubmit
opportunity. A verification "No" either strands the assessor or (via the refuse route) denies the application. **FAIL.**
*Evidence: v22.*

### 🔴 TC-07-014 — application is denied on the FIRST reject, not the third resubmission — FAILED
The case (and FDS 8.4 rule 2b(i)) allows **up to three resubmission cycles** before an application becomes
"Application Unsuccessful". Here the **first** Document Verification reject set the NPO to **App Failed (3)** with
`numOfResubmissions = null` — no resubmission was ever offered. So the 3-attempt resubmission rule appears **not
implemented**: one failure = denial. Strongly evidenced (first reject → Failed), though not driven through three
explicit cycles (impossible, since no resubmission state is produced).

### ⚪ TC-07-015 — submitter edit-mode on resubmission — BLOCKED
Requires the application to be in the Incomplete/resubmission state. Since that state is never reached (TC-07-011), the
submitter never gets an edit/resubmit action — the landing shows **"APPLICATION FAILED"** and only "Submit Query". Not
testable until an Incomplete outcome exists.

## 🔴 Data-consistency defect — application vs NPO status disagree after a reject
After the reject: `NpoOrganisation.status = 3 (App Failed)` but `NpoApplication.applicationStatus = 9 (OB Compliant)` —
the application record was never updated to a failed/denied status, while the NPO was. The two entities disagree about
the same application's outcome. Folded into the bug above.

## ✅ Corroborations from this run
- **TC-07-009 (mixed-OB defect) reinforced:** all-compliant → application status **9**; both *mixed* (1-of-3) and
  *all*-non-compliant → **10 (Failed)**. So the enum distinguishes Compliant (9) from Failed (10) but never produces
  "Partially Compliance" (12) — exactly the earlier defect.
- **Smoke "Approve stays enabled on a refusal-marked app" DOES reproduce** when OBs are compliant: with refuse=Yes +
  reasons, **Approve remained enabled** alongside Reject. (My suite-07 report said Approve was correctly disabled — that
  was because those OBs had *failed*; on a compliant app the smoke finding holds. Correction noted.)
- **Risk/Compulsory chips are per-application:** APPL26-01482 showed **no** HIGH RISK / COMPULSORY chips, unlike
  APPL26-01270 which showed both — so those flags are data-driven, not always-on (relevant to TC-07-017/018).

## Observations for the test lead
1. 🔴 **There is no "Application Incomplete" / resubmission cycle.** A Document Verification "No" either strands the
   assessor (no actionable button) or, via reject, denies the application on the first failure. FDS 8.4's up-to-3
   resubmissions is not realised. This blocks TC-07-011, TC-07-014 and TC-07-015 together.
2. 🔴 **Application vs NPO status disagree** after a reject (`applicationStatus 9` vs `NpoOrganisation.status 3`).
3. Is the intended "send back for correction" meant to be a distinct outcome? Right now the only outcomes are Approve
   (all-Yes) and Reject (→ Failed); Decline never enables in any combination.

## 📸 Evidence — `test-reports/2026-08-18/evidence/`
| File | Shows |
|---|---|
| `v22-first-reject-goes-straight-to-application-failed.png` | Submitter landing: "APPLICATION FAILED" after one reject, no resubmit action |

## Method notes
- 🔑 Fresh registration is achievable under automation: Places addresses via type-slowly → ArrowDown → Enter, both
  physical + postal; date pickers via the panel (year-button → decade-prev → year → month → day); everything else via
  native setters + real clicks for selects/radios.
- 🔑 The admin triage for a submitted app is reachable at `…/shesha/workflow-action?id=<instanceId>&todoid=<origDraftId>`
  — the original draft todo id still resolves to the live task.
- 🔑 Confirmed the outcome against `NpoOrganisation.status` (3=Failed) and the public label ("APPLICATION FAILED"), not
  just the stale `applicationStatus`.
