# Report: Test Plan: BID-SCM — BID: Supply Chain Management — 80/20
**Date:** 2026-08-03 09:10 UTC
**Variant:** 80/20
**Plan:** test-plans/tender-process/bid-supply-chain-management.md
**Spec:** test-plans/tender-process/bid-supply-chain-management.spec.ts
**Execution Mode:** playwright-script
**Result:** PASSED
**Duration:** 565.0s

## Summary
| Total Steps | Passed | Failed | Skipped |
|-------------|--------|--------|---------|
| 17 | 16 | 0 | 1 |

> ⚠️ **1 test(s) passed only on retry (flaky).** Both attempts are listed below.

## Step Results
### TC-01: Draft Tender
**Mode:** playwright-script
**Duration:** 35.4s
- [PASS] TC-01: Draft Tender

### TC-02: Review and Approve
**Mode:** playwright-script
**Duration:** 12.6s
- [PASS] TC-02: Review and Approve

### TC-03: Publish Tender
**Mode:** playwright-script
**Duration:** 14.8s
- [PASS] TC-03: Publish Tender

### TC-04: Consolidate Supplier Responses
**Mode:** playwright-script
**Duration:** 83.7s
- [FAIL (attempt 1, retried)] TC-04: Consolidate Supplier Responses

**Error:**
```
Error: page.goto: Timeout 30000ms exceeded.
Call log:
[2m  - navigating to "https://pd-supplychainmanagement-adminportal-qa.shesha.app/login", waiting until "domcontentloaded"[22m


Call Log:
- Timeout 70000ms exceeded while waiting on the predicate

  192 |     await page.goto(APP_URL, { waitUntil: 'domcontentloaded' });
  193 |     await expect(username).toBeVisible({ timeout: 20000 });
> 194 |   }).toPass({ timeout: 70000 });
      |      ^
  195 |   await username.fill(creds.user);
  196 |   await page.getByPlaceholder('Password').fill(creds.password);
  197 |   await page.getByRole('button', { name: 'Sign In' }).click();
    at loginAs (C:\Users\nomfa\Test-ReportsHub\projects\bid-management\test-plans\tender-process\bid-supply-chain-management.spec.ts:194:6)
    at C:\Users\nomfa\Test-ReportsHub\projects\bid-management\test-plans\tender-process\bid-supply-chain-management.spec.ts:1075:11
```
**Location:** C:\Users\nomfa\Test-ReportsHub\projects\bid-management\test-plans\tender-process\bid-supply-chain-management.spec.ts:194:6

### TC-04: Consolidate Supplier Responses — attempt 2
**Mode:** playwright-script
**Duration:** 126.7s
- [PASS (on retry)] TC-04: Consolidate Supplier Responses

### TC-05: Review Compliance
**Mode:** playwright-script
**Duration:** 36.0s
- [PASS] TC-05: Review Compliance

### TC-06: Capture Pricing and Specific Goals
**Mode:** playwright-script
**Duration:** 20.4s
- [PASS] TC-06: Capture Pricing and Specific Goals

### TC-07: Invite BEC Members
**Mode:** playwright-script
**Duration:** 24.5s
- [PASS] TC-07: Invite BEC Members

### TC-08: Confirm Attendance & Open Evaluation
**Mode:** playwright-script
**Duration:** 16.9s
- [PASS] TC-08: Confirm Attendance & Open Evaluation

### TC-09: Capture Functionality Score
**Mode:** playwright-script
**Duration:** 59.7s
- [PASS] TC-09: Capture Functionality Score

### TC-10: BEC Secretariat: Monitor Evaluation and Begin Calibration
**Mode:** playwright-script
**Duration:** 10.7s
- [PASS] TC-10: BEC Secretariat: Monitor Evaluation and Begin Calibration

### TC-11: BEC Secretariat: Monitor Calibration and Finalise Scoring
**Mode:** playwright-script
**Duration:** 12.1s
- [PASS] TC-11: BEC Secretariat: Monitor Calibration and Finalise Scoring

### TC-12: BEC: Finalise Recommendation
**Mode:** playwright-script
**Duration:** 12.4s
- [PASS] TC-12: BEC: Finalise Recommendation

### TC-13: Capture Outcome of the BAC
**Mode:** playwright-script
**Duration:** 11.6s
- [PASS] TC-13: Capture Outcome of the BAC

### TC-14: Approve Recommendation From BAC
**Mode:** playwright-script
**Duration:** 12.9s
- [PASS] TC-14: Approve Recommendation From BAC

### TC-15: Compile and Upload Appointment Letter
**Mode:** playwright-script
**Duration:** 14.2s
- [PASS] TC-15: Compile and Upload Appointment Letter

### TC-16: Capture Order Details
**Mode:** playwright-script
**Duration:** 14.4s
- [PASS] TC-16: Capture Order Details

### TC-17: Review and Approve — Send Back for rework (negative)
**Mode:** playwright-script
**Duration:** 36.9s
- [SKIP] TC-17: Review and Approve — Send Back for rework (negative)
