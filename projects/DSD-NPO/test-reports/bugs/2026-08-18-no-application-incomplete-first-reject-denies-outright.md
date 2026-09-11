# Bug: no "Application Incomplete"/resubmission path — a first Document-Verification reject denies the application

**Date:** 2026-08-18
**Severity:** High
**Area:** Admin portal → Document Verification → application outcome
**Environment:** QA
**Found by:** TC-07-011 (ADO #101721); implicates TC-07-014 (#101724) and TC-07-015 (#101725)
**Application:** APPL26-01482 (`0d9cc774-…`), NPO `255bea2e-…` — our own, 3 compliant OBs, purpose-built

## Summary
There is no "Application Incomplete" outcome. When an assessor finds a problem at Document Verification, the build
offers no "send back to the applicant to amend and resubmit" path. A verification "No" either leaves every outcome
button disabled (the assessor is stuck), or — via the refuse/reject route — denies the application outright on the
**first** failure. FDS 8.4's up-to-three-resubmissions cycle is not realised.

## Steps to reproduce
1. Register + submit an application with 3 office bearers; as admin set **OB Compliance = all compliant** (status → 9).
2. Open **Verification → Document Verification**.
3. **Case A:** refuse/reject = **No**, set one verification question (e.g. "Name of the organisation verified?") =
   **No** with a reason, others = Yes → **Approve, Reject and Decline all stay disabled.** No action is possible.
4. **Case B:** refuse/reject = **Yes**, fill the rejection reasons → **Reject** enables → confirm the
   *"Are you sure you want to reject application…"* dialog.

## Expected (ADO #101721 / FDS 8.4)
A verification "No" should move the application to **"Application Incomplete" (status 2 / RefList 4)** and notify the
applicant to **amend and resubmit**, with up to three resubmission attempts before it becomes "Unsuccessful".

## Actual
- Case A (verification No, not refusing): **no outcome button is enabled** — a dead state with no way forward.
- Case B (reject): the **NPO goes straight to status 3 "App Failed"** (public portal: **"APPLICATION FAILED"**) on the
  **first** reject, with `numOfResubmissions = null`. The submitter's landing offers **no resubmit/edit action** — only
  "Submit Query". There is no Incomplete state and no resubmission cycle.

## Verified
- `NpoOrganisation.status = 3` (App Failed) after one reject; public label "APPLICATION FAILED".
- Reproduced the Case-A dead state on two applications (APPL26-01482 compliant OBs, APPL26-01270 failed OBs), so it is
  not caused by OB state.
- Confirmed the happy path works (all verifications Yes → Approve enables), so the form is otherwise functional.

## Impact
- **TC-07-011 FAILS** — no "Application Incomplete" outcome.
- **TC-07-014** — denial occurs on the first failure, not the third resubmission; the resubmission rule is absent.
- **TC-07-015 BLOCKED** — the submitter never reaches an edit/resubmit state.
- Real-world: an applicant with one correctable document error is **denied outright** with no chance to fix it, which
  contradicts the FDS and is a significant fairness/process problem for NPO registration.

## Secondary defect — application vs NPO status disagree
After the reject, `NpoApplication.applicationStatus` still reads **9 (OB Compliant)** while
`NpoOrganisation.status` reads **3 (App Failed)**. The application record is not updated to reflect the denial, so the
two entities disagree about the same application's outcome.

## Open question for the test lead
Is a distinct "send back for correction / Incomplete" action intended (separate from Reject)? Currently the only
Document-Verification outcomes are Approve (all-Yes) and Reject (→ Failed); "Decline" never enables in any combination.

## Evidence
`test-reports/2026-08-18/evidence/v22-first-reject-goes-straight-to-application-failed.png`
