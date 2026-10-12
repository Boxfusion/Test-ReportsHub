# Report: Test Plan: ELEAVE-HOURLY-LIFECYCLE — Hourly Leave: parking, accumulation, approval and cancellation
**Date:** 2026-10-08 14:26 UTC
**Plan:** test-plans/HCM/eLeave/hourly-leave-lifecycle.md
**Spec:** test-plans/HCM/eLeave/hourly-leave-lifecycle.spec.ts
**Execution Mode:** playwright-script
**Result:** PASSED
**Duration:** 414.8s

## Summary
| Total Steps | Passed | Failed | Skipped |
|-------------|--------|--------|---------|
| 10 | 10 | 0 | 0 |

## Step Results
### TC-01: Login as Applicant
**Mode:** playwright-script
**Duration:** 5.6s
- [PASS] TC-01: Login as Applicant

### TC-02: Applicant submits hourly leave A (2 hours)
**Mode:** playwright-script
**Duration:** 29.6s
- [PASS] TC-02: Applicant submits hourly leave A (2 hours)

### TC-03: Recommender recommends hourly leave A, which is parked (no approval step)
**Mode:** playwright-script
**Duration:** 38.0s
- [PASS] TC-03: Recommender recommends hourly leave A, which is parked (no approval step)

### TC-04: A second leave on the same date is rejected
**Mode:** playwright-script
**Duration:** 19.8s
- [PASS] TC-04: A second leave on the same date is rejected

### TC-05: Remaining hours: note, limit and hourly leave B
**Mode:** playwright-script
**Duration:** 47.3s
- [PASS] TC-05: Remaining hours: note, limit and hourly leave B

### TC-06: Recommending B completes a full day; an accumulated leave is created
**Mode:** playwright-script
**Duration:** 53.5s
- [PASS] TC-06: Recommending B completes a full day; an accumulated leave is created

### TC-07: Approver approves the accumulated full day
**Mode:** playwright-script
**Duration:** 22.4s
- [PASS] TC-07: Approver approves the accumulated full day

### TC-08: Balance is charged exactly one whole day
**Mode:** playwright-script
**Duration:** 19.8s
- [PASS] TC-08: Balance is charged exactly one whole day

### TC-09: Cancelling a parked hourly leave releases its hours
**Mode:** playwright-script
**Duration:** 90.1s
- [PASS] TC-09: Cancelling a parked hourly leave releases its hours

### TC-10: Declining the cancellation puts the hourly leave back to Hourly Parked; it can't be cancelled again
**Mode:** playwright-script
**Duration:** 86.8s
- [PASS] TC-10: Declining the cancellation puts the hourly leave back to Hourly Parked; it can't be cancelled again
