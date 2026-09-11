# Bug: mixed OB compliance is recorded as 'OB Failed Compliance', not 'OB Partially Compliance'

**Date:** 2026-08-18
**Severity:** Medium-High
**Area:** Admin portal → application triage → Office Bearer Compliance
**Environment:** QA
**Found by:** TC-07-009 (ADO #101719, `Drift-Risk`)
**Application:** APPL26-01270 (`50cc1481-…`), NPO `65c7e886-…` — our own submitted Trust application, 3 office bearers

## Summary
When only **some** office bearers are marked non-compliant (a mixed outcome), the application is moved to
**'OB Failed Compliance'** — the status intended for when **all** office bearers fail. The distinct
**'OB Partially Compliance'** status is not applied. A single non-compliant bearer therefore fails the whole
application.

## Steps to reproduce
1. Admin portal → open a submitted application at the OB-Compliance stage → **OB Compliance**.
2. *"Are all office bearers compliant?"* → **No**.
3. In *"Select office bearers which are not compliant"* pick **one** of three (leaving two compliant); enter a reason.
4. Submit.

## Expected (ADO #101719)
> *"Status = 'OB Partially Compliance' (RefList=12)."*

## Actual
- `applicationStatus = 10`, header chip reads **"FAILED COMPLIANCE"** = **'OB Failed Compliance'** (RefList=10 — the
  all-non-compliant outcome from TC-07-008).
- DB confirms the input was genuinely mixed:
  `Alpha One → isOfficeBearerNonCompliant=true`, `Beta Two → false`, `Gamma Three → false`.

## Evidence
- Verified against **both** the UI status label ("FAILED COMPLIANCE") and the `NpoOfficeBearer` rows, so it is not a
  reference-list mis-read.
- `test-reports/2026-08-18/evidence/v16-mixed-ob-compliance-shows-failed-not-partially.png`

## Impact
- A partially-compliant application is treated as fully failed. The two states drive different downstream handling
  (partial vs full resubmission), so applicants whose bearers are *mostly* compliant are pushed onto the wrong path.
- Knock-on observed: once the app is 'OB Failed Compliance', the **Document Verification verify path dead-ends** — no
  Approve/Reject/Decline button can be enabled — so the wrong status may also be foreclosing the correct next step.

## Open question for the test lead
Is **'OB Partially Compliance' (RefList=12)** wired at all, or does the build only implement compliant / failed? The
case is `Drift-Risk`-tagged, so the code review already suspected this branch.
