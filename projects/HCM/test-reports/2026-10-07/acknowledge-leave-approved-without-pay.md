# Report: Test Plan: ELEAVE-ACK-WITHOUT-PAY — Acknowledge Leave Approved Without Pay
**Date:** 2026-10-07 07:49 UTC
**Plan:** test-plans/HCM/eLeave/acknowledge-leave-approved-without-pay.md
**Spec:** test-plans/HCM/eLeave/acknowledge-leave-approved-without-pay.spec.ts
**Execution Mode:** playwright-script (failures pending AI-repair)
**Result:** PARTIAL
**Duration:** 94.5s

## Summary
| Total Steps | Passed | Failed | Skipped |
|-------------|--------|--------|---------|
| 3 | 2 | 1 | 0 |

## Step Results
### TC-01: Login as Admin
**Mode:** playwright-script
**Duration:** 4.9s
- [PASS] TC-01: Login as Admin

### TC-02: Acknowledge leave without pay and submit via Interface to PERSAL
**Mode:** playwright-script
**Duration:** 14.9s
- [PASS] TC-02: Acknowledge leave without pay and submit via Interface to PERSAL

### TC-03: Acknowledge leave without pay and submit via Process Manually
**Mode:** playwright-script
**Duration:** 69.5s
- [FAIL] TC-03: Acknowledge leave without pay and submit via Process Manually

**Error:**
```
Error: [2mexpect([22m[31mlocator[39m[2m).[22mtoBeVisible[2m([22m[2m)[22m failed

Locator: getByText('Successfully Submitted')
Expected: visible
Timeout: 30000ms
Error: element(s) not found

Call log:
[2m  - Expect "toBeVisible" getByText('Successfully Submitted') with timeout 30000ms[22m
[2m  - waiting for getByText('Successfully Submitted')[22m


  184 |     await page.getByRole('button', { name: 'Submit', exact: true }).click();
  185 |     // ASSERT (BLOCKING): "Successfully Submitted" is shown and the Ref No is no longer listed with Action Required Acknowledge leave without pay
> 186 |     await expect(page.getByText('Successfully Submitted')).toBeVisible({ timeout: 30000 });
      |                                                            ^
  187 |     await expect(page).toHaveURL(/workflows-inbox/, { timeout: 30000 });
  188 |     await expect(acknowledgeRows(page).filter({ hasText: refNo })).toHaveCount(0, { timeout: 15000 });
  189 |   });
    at C:\Users\tiyim\OneDrive\Desktop\HCM\pd-Hcm\test-plans\HCM\eLeave\acknowledge-leave-approved-without-pay.spec.ts:186:60
```
**Location:** C:\Users\tiyim\OneDrive\Desktop\HCM\pd-Hcm\test-plans\HCM\eLeave\acknowledge-leave-approved-without-pay.spec.ts:186:60
