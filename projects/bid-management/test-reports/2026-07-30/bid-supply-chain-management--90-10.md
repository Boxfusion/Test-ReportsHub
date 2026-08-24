# Report: Test Plan: BID-SCM — BID: Supply Chain Management — 90/10
**Date:** 2026-07-30 11:45 UTC
**Variant:** 90/10
**Plan:** test-plans/tender-process/bid-supply-chain-management.md
**Spec:** test-plans/tender-process/bid-supply-chain-management.spec.ts
**Execution Mode:** playwright-script
**Result:** PASSED
**Duration:** 404.1s

## Summary
| Total Steps | Passed | Failed | Skipped |
|-------------|--------|--------|---------|
| 16 | 16 | 0 | 0 |

## Step Results
### TC-01: Draft Tender
**Mode:** playwright-script
**Duration:** 28.0s
- [PASS] TC-01: Draft Tender

### TC-02: Review and Approve
**Mode:** playwright-script
**Duration:** 10.8s
- [PASS] TC-02: Review and Approve

### TC-03: Publish Tender
**Mode:** playwright-script
**Duration:** 20.0s
- [PASS] TC-03: Publish Tender

### TC-04: Consolidate Supplier Responses
**Mode:** playwright-script
**Duration:** 120.0s
- [PASS] TC-04: Consolidate Supplier Responses

### TC-05: Review Compliance
**Mode:** playwright-script
**Duration:** 34.7s
- [PASS] TC-05: Review Compliance

### TC-06: Capture Pricing and Specific Goals
**Mode:** playwright-script
**Duration:** 13.6s
- [PASS] TC-06: Capture Pricing and Specific Goals

### TC-07: Invite BEC Members
**Mode:** playwright-script
**Duration:** 17.8s
- [PASS] TC-07: Invite BEC Members

### TC-08: Confirm Attendance & Open Evaluation
**Mode:** playwright-script
**Duration:** 15.9s
- [PASS] TC-08: Confirm Attendance & Open Evaluation

### TC-09: Capture Functionality Score
**Mode:** playwright-script
**Duration:** 43.3s
- [PASS] TC-09: Capture Functionality Score

### TC-10: BEC Secretariat: Monitor Evaluation and Begin Calibration
**Mode:** playwright-script
**Duration:** 12.9s
- [PASS] TC-10: BEC Secretariat: Monitor Evaluation and Begin Calibration

### TC-11: BEC Secretariat: Monitor Calibration and Finalise Scoring
**Mode:** playwright-script
**Duration:** 13.9s
- [PASS] TC-11: BEC Secretariat: Monitor Calibration and Finalise Scoring

### TC-12: BEC: Finalise Recommendation
**Mode:** playwright-script
**Duration:** 11.7s
- [PASS] TC-12: BEC: Finalise Recommendation

### TC-13: Capture Outcome of the BAC
**Mode:** playwright-script
**Duration:** 11.6s
- [PASS] TC-13: Capture Outcome of the BAC

### TC-14: Approve Recommendation From BAC
**Mode:** playwright-script
**Duration:** 10.9s
- [PASS] TC-14: Approve Recommendation From BAC

### TC-15: Compile and Upload Appointment Letter
**Mode:** playwright-script
**Duration:** 14.0s
- [PASS] TC-15: Compile and Upload Appointment Letter

### TC-16: Capture Order Details
**Mode:** playwright-script
**Duration:** 17.5s
- [PASS] TC-16: Capture Order Details

---

## Run context

**Tender under test:** **REF2026-1034** — `TC-01 Automated Draft Tender run-ms7fx3zh - 90/10 Compulsory Hybrid`.
Driven from draft to **completed lifecycle** in one invocation, 16/16 in 6.7 min: Draft → Review & Approve
→ Publish (Advertised) → Consolidate 3 supplier responses → Verify Compliance → Calculate Specific Goal
Points → Invite BEC → Confirm Attendance & Open Evaluation → 3 evaluators × 3 functionality scores →
Begin Calibration → Finalise Scoring → BEC Recommendation → BAC Outcome → Approve from BAC → Appointment
Letter (**Awarded**) → Capture Order Details (item leaves the inbox).

Run **second** on 2026-07-30, after the 80/20 pass on REF2026-1014. **Both evaluation-criteria variants
now have a clean 16/16 full-chain pass on the same spec revision** — the first time either has.

The four fixes that made this possible were made earlier the same day and are documented in
[bid-supply-chain-management--80-20.md](bid-supply-chain-management--80-20.md): the paged Supplier
dropdown (type to filter), the TC-04 async-table race in the idempotence guard, the mandatory
**"Is Present?"** tick when adding an attendee (TC-08), and chain pinning that survives a Playwright
worker restart. This run needed no repairs — every TC passed first attempt in `playwright-script` mode.

## Findings

No new findings. Nothing regressed relative to the 80/20 run, and TC-08 passing here confirms the
*Is Present?* requirement rather than a one-off: the backup evaluator committed on a second, independent
tender.

Still open from the 80/20 run and **not** re-examined here: the double `RfxResponse/Crud/Create` on every
Add-Response dialog open, the silent failure when a duplicate supplier is submitted, and the unverified
Stage-3 "Not Recommended" flag on the rank-1 supplier.
