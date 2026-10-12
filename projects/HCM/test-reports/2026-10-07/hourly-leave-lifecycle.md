# Report: Test Plan: ELEAVE-HOURLY-LIFECYCLE — Hourly Leave: parking, accumulation, approval and cancellation
**Date:** 2026-10-07 19:40 UTC
**Plan:** test-plans/HCM/eLeave/hourly-leave-lifecycle.md
**Spec:** test-plans/HCM/eLeave/hourly-leave-lifecycle.spec.ts
**Execution Mode:** playwright-script (failures pending AI-repair)
**Result:** PARTIAL
**Duration:** 307.0s

## Summary
| Total Steps | Passed | Failed | Skipped |
|-------------|--------|--------|---------|
| 10 | 6 | 4 | 0 |

## Step Results
### TC-01: Login as Applicant
**Mode:** playwright-script
**Duration:** 4.9s
- [PASS] TC-01: Login as Applicant

### TC-02: Applicant submits hourly leave A (2 hours)
**Mode:** playwright-script
**Duration:** 28.4s
- [PASS] TC-02: Applicant submits hourly leave A (2 hours)

### TC-03: Recommender recommends hourly leave A, which is parked (no approval step)
**Mode:** playwright-script
**Duration:** 38.0s
- [PASS] TC-03: Recommender recommends hourly leave A, which is parked (no approval step)

### TC-04: A second leave on the same date is rejected
**Mode:** playwright-script
**Duration:** 17.4s
- [PASS] TC-04: A second leave on the same date is rejected

### TC-05: Remaining hours: note, limit and hourly leave B
**Mode:** playwright-script
**Duration:** 31.9s
- [PASS] TC-05: Remaining hours: note, limit and hourly leave B

### TC-06: Recommending B completes a full day; an accumulated leave is created
**Mode:** playwright-script
**Duration:** 47.1s
- [PASS] TC-06: Recommending B completes a full day; an accumulated leave is created

### TC-07: Approver approves the accumulated full day
**Mode:** playwright-script
**Duration:** 137.3s
- [FAIL] TC-07: Approver approves the accumulated full day

**Error:**
```
Error: [2mexpect([22m[31mlocator[39m[2m).[22mtoBeVisible[2m([22m[2m)[22m failed

Locator: getByRole('heading', { name: /^Approve Leave:/ })
Expected: visible
Timeout: 30000ms
Error: element(s) not found

Call log:
[2m  - Expect "toBeVisible" getByRole('heading', { name: /^Approve Leave:/ }) with timeout 30000ms[22m
[2m  - waiting for getByRole('heading', { name: /^Approve Leave:/ })[22m


  137 |   await row.getByRole('link', { name: 'search' }).click();
  138 |   await expect(page).toHaveURL(/workflow-action/, { timeout: NAV_TIMEOUT });
> 139 |   await expect(page.getByRole('heading', { name: new RegExp(`^${action}:`) })).toBeVisible({ timeout: NAV_TIMEOUT });
      |                                                                                ^
  140 |   await beforeNavigate(page);
  141 | }
  142 |
    at openInboxItem (C:\Users\tiyim\OneDrive\Desktop\HCM\pd-Hcm\test-plans\HCM\eLeave\hourly-leave-lifecycle.spec.ts:139:80)
    at C:\Users\tiyim\OneDrive\Desktop\HCM\pd-Hcm\test-plans\HCM\eLeave\hourly-leave-lifecycle.spec.ts:512:5
```
**Location:** C:\Users\tiyim\OneDrive\Desktop\HCM\pd-Hcm\test-plans\HCM\eLeave\hourly-leave-lifecycle.spec.ts:139:80

### TC-08: Balance is charged exactly one whole day
**Mode:** playwright-script
**Duration:** 0.0s
- [FAIL] TC-08: Balance is charged exactly one whole day

### TC-09: Cancelling a parked hourly leave releases its hours
**Mode:** playwright-script
**Duration:** 0.0s
- [FAIL] TC-09: Cancelling a parked hourly leave releases its hours

### TC-10: Declining the cancellation puts the hourly leave back to Hourly Parked; it can't be cancelled again
**Mode:** playwright-script
**Duration:** 0.0s
- [FAIL] TC-10: Declining the cancellation puts the hourly leave back to Hourly Parked; it can't be cancelled again
