# Report: Test Plan: ELEAVE-HOURLY — Hourly Leave (end-to-end)
**Date:** 2026-10-07 17:05 UTC
**Plan:** test-plans/HCM/eLeave/hourly-leave.md
**Spec:** test-plans/HCM/eLeave/hourly-leave.spec.ts
**Execution Mode:** playwright-script (failures pending AI-repair)
**Result:** PARTIAL
**Duration:** 317.1s

## Summary
| Total Steps | Passed | Failed | Skipped |
|-------------|--------|--------|---------|
| 13 | 7 | 6 | 0 |

## Step Results
### TC-01: Login as Applicant
**Mode:** playwright-script
**Duration:** 7.5s
- [PASS] TC-01: Login as Applicant

### TC-02: Hourly option and fields on the leave application form
**Mode:** playwright-script
**Duration:** 21.3s
- [PASS] TC-02: Hourly option and fields on the leave application form

### TC-03: Duration is calculated in hours and minutes, excluding lunch
**Mode:** playwright-script
**Duration:** 37.6s
- [PASS] TC-03: Duration is calculated in hours and minutes, excluding lunch

### TC-04: Hourly validations block submission
**Mode:** playwright-script
**Duration:** 60.7s
- [PASS] TC-04: Hourly validations block submission

### TC-05: Applicant submits hourly leave A (2 hours)
**Mode:** playwright-script
**Duration:** 33.8s
- [PASS] TC-05: Applicant submits hourly leave A (2 hours)

### TC-06: Recommender recommends hourly leave A, which is parked (no approval step)
**Mode:** playwright-script
**Duration:** 47.0s
- [PASS] TC-06: Recommender recommends hourly leave A, which is parked (no approval step)

### TC-07: A second leave on the same date is rejected
**Mode:** playwright-script
**Duration:** 23.9s
- [PASS] TC-07: A second leave on the same date is rejected

### TC-08: Remaining hours: note, limit and hourly leave B
**Mode:** playwright-script
**Duration:** 81.7s
- [FAIL] TC-08: Remaining hours: note, limit and hourly leave B

**Error:**
```
Error: No free weekday found for hourly leave after 5 attempts

  214 |     if (await hoursHint(page).waitFor({ timeout: 8000 }).then(() => true, () => false)
  215 |       && !(await overlap.isVisible())) return date;
> 216 |     if (attempt === 5) throw new Error(`No free weekday found for hourly leave after ${attempt} attempts`);
      |                              ^
  217 |     console.log(`Leave date ${date} overlaps existing leave — retrying with a new date`);
  218 |   }
  219 | }
    at pickFreeDate (C:\Users\tiyim\OneDrive\Desktop\HCM\pd-Hcm\test-plans\HCM\eLeave\hourly-leave.spec.ts:216:30)
    at C:\Users\tiyim\OneDrive\Desktop\HCM\pd-Hcm\test-plans\HCM\eLeave\hourly-leave.spec.ts:523:16
```
**Location:** C:\Users\tiyim\OneDrive\Desktop\HCM\pd-Hcm\test-plans\HCM\eLeave\hourly-leave.spec.ts:216:30

### TC-09: Recommending B completes a full day; an accumulated leave is created
**Mode:** playwright-script
**Duration:** 0.0s
- [FAIL] TC-09: Recommending B completes a full day; an accumulated leave is created

### TC-10: Approver approves the accumulated full day
**Mode:** playwright-script
**Duration:** 0.0s
- [FAIL] TC-10: Approver approves the accumulated full day

### TC-11: Balance is charged exactly one whole day
**Mode:** playwright-script
**Duration:** 0.0s
- [FAIL] TC-11: Balance is charged exactly one whole day

### TC-12: Cancelling a parked hourly leave releases its hours
**Mode:** playwright-script
**Duration:** 0.0s
- [FAIL] TC-12: Cancelling a parked hourly leave releases its hours

### TC-13: Declining the cancellation puts the hourly leave back to Hourly Parked; it can't be cancelled again
**Mode:** playwright-script
**Duration:** 0.0s
- [FAIL] TC-13: Declining the cancellation puts the hourly leave back to Hourly Parked; it can't be cancelled again
