# Report: Test Plan: BID-SCM — BID: Supply Chain Management — 90/10
**Date:** 2026-07-29 12:52 UTC
**Variant:** 90/10
**Plan:** test-plans/tender-process/bid-supply-chain-management.md
**Spec:** test-plans/tender-process/bid-supply-chain-management.spec.ts
**Execution Mode:** playwright-script (failures pending AI-repair)
**Result:** PARTIAL
**Duration:** 421.7s

## Summary
| Total Steps | Passed | Failed | Skipped |
|-------------|--------|--------|---------|
| 13 | 11 | 2 | 0 |

## Step Results
### TC-04: Consolidate Supplier Responses
**Mode:** playwright-script
**Duration:** 35.1s
- [PASS] TC-04: Consolidate Supplier Responses

### TC-05: Review Compliance
**Mode:** playwright-script
**Duration:** 49.6s
- [PASS] TC-05: Review Compliance

### TC-06: Capture Pricing and Specific Goals
**Mode:** playwright-script
**Duration:** 20.6s
- [PASS] TC-06: Capture Pricing and Specific Goals

### TC-07: Invite BEC Members
**Mode:** playwright-script
**Duration:** 27.2s
- [PASS] TC-07: Invite BEC Members

### TC-08: Confirm Attendance & Open Evaluation
**Mode:** playwright-script
**Duration:** 68.0s
- [FAIL] TC-08: Confirm Attendance & Open Evaluation

**Error:**
```
Error: backup evaluator "Maand-awe Mamathuntsha" did not commit to the Attendees/Evaluators grid — the entry stays in the pending add-row. Known-flaky Shesha inline grid: Error: [2mexpect([22m[31mlocator[39m[2m).[22mtoBeVisible[2m([22m[2m)[22m failed

Locator: getByRole('cell', { name: 'Maand-awe Mamathuntsha' }).first()
Expected: visible
Timeout: 8000ms
Error: element(s) not found

Call log:
[2m  - Expect "toBeVisible" with timeout 8000ms[22m
[2m  - waiting for getByRole('cell', { name: 'Maand-awe Mamathuntsha' }).first()[22m


Call Log:
- Timeout 40000ms exceeded while waiting on the predicate

[2mexpect([22m[31mreceived[39m[2m).[22mtoBeTruthy[2m()[22m

Received: [31mfalse[39m

  992 |         `backup evaluator "Maand-awe Mamathuntsha" did not commit to the Attendees/Evaluators grid — `
  993 |         + `the entry stays in the pending add-row. Known-flaky Shesha inline grid: ${err}`,
> 994 |       ).toBeTruthy();
      |         ^
  995 |     }
  996 |
  997 |     // STEP: mark the three invited evaluators as present (the backup stays absent)
    at C:\Users\nomfa\Test-ReportsHub\projects\bid-management\test-plans\tender-process\bid-supply-chain-management.spec.ts:994:9
```
**Location:** C:\Users\nomfa\Test-ReportsHub\projects\bid-management\test-plans\tender-process\bid-supply-chain-management.spec.ts:994:9

### TC-09: Capture Functionality Score
**Mode:** playwright-script
**Duration:** 63.2s
- [PASS] TC-09: Capture Functionality Score

### TC-10: BEC Secretariat: Monitor Evaluation and Begin Calibration
**Mode:** playwright-script
**Duration:** 14.3s
- [PASS] TC-10: BEC Secretariat: Monitor Evaluation and Begin Calibration

### TC-11: BEC Secretariat: Monitor Calibration and Finalise Scoring
**Mode:** playwright-script
**Duration:** 16.2s
- [PASS] TC-11: BEC Secretariat: Monitor Calibration and Finalise Scoring

### TC-12: BEC: Finalise Recommendation
**Mode:** playwright-script
**Duration:** 16.9s
- [PASS] TC-12: BEC: Finalise Recommendation

### TC-13: Capture Outcome of the BAC
**Mode:** playwright-script
**Duration:** 15.1s
- [PASS] TC-13: Capture Outcome of the BAC

### TC-14: Approve Recommendation From BAC
**Mode:** playwright-script
**Duration:** 15.3s
- [PASS] TC-14: Approve Recommendation From BAC

### TC-15: Compile and Upload Appointment Letter
**Mode:** playwright-script
**Duration:** 30.1s
- [PASS] TC-15: Compile and Upload Appointment Letter

### TC-16: Capture Order Details
**Mode:** playwright-script
**Duration:** 30.3s
- [FAIL] TC-16: Capture Order Details

**Error:**
```
Error: [2mexpect([22m[31mlocator[39m[2m).[22mtoBeEnabled[2m([22m[2m)[22m failed

Locator:  getByRole('button', { name: 'Submit', exact: true })
Expected: enabled
Received: disabled
Timeout:  15000ms

Call log:
[2m  - Expect "toBeEnabled" with timeout 15000ms[22m
[2m  - waiting for getByRole('button', { name: 'Submit', exact: true })[22m
[2m    33 × locator resolved to <button title="" disabled type="button" class="ant-btn css-1lo1l9k css-var-R4q ant-btn-primary sha-toolbar-btn sha-toolbar-btn-configurable">…</button>[22m
[2m       - unexpected value "disabled"[22m


  1415 |     // workflow-action page (redirect to My Items / Inbox).
  1416 |     const submit = page.getByRole('button', { name: 'Submit', exact: true });
> 1417 |     await expect(submit).toBeEnabled({ timeout: 15000 });
       |                          ^
  1418 |     await clickOnceAndAwait(submit, async () => /workflows-(my-items|inbox)/.test(page.url()), 'Capture Order Details');
  1419 |   });
  1420 | });
    at C:\Users\nomfa\Test-ReportsHub\projects\bid-management\test-plans\tender-process\bid-supply-chain-management.spec.ts:1417:26
```
**Location:** C:\Users\nomfa\Test-ReportsHub\projects\bid-management\test-plans\tender-process\bid-supply-chain-management.spec.ts:1417:26
