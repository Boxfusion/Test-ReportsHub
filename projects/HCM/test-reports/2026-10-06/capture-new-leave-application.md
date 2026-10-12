# Report: Test Plan: ELEAVE-CAPTURE — Application for Leave: for Myself
**Date:** 2026-10-06 20:04 UTC
**Plan:** test-plans/HCM/eLeave/capture-new-leave-application.md
**Spec:** test-plans/HCM/eLeave/capture-new-leave-application.spec.ts
**Execution Mode:** playwright-script (failures pending AI-repair)
**Result:** PARTIAL
**Duration:** 92.2s

## Summary
| Total Steps | Passed | Failed | Skipped |
|-------------|--------|--------|---------|
| 3 | 2 | 1 | 0 |

## Step Results
### TC-01: Login as Applicant
**Mode:** playwright-script
**Duration:** 5.9s
- [PASS] TC-01: Login as Applicant

### TC-02: Submit a backdated leave application
**Mode:** playwright-script
**Duration:** 66.1s
- [FAIL] TC-02: Submit a backdated leave application

**Error:**
```
Error: [2mexpect([22m[31mlocator[39m[2m).[22mtoBeVisible[2m([22m[2m)[22m failed

Locator: getByRole('dialog', { name: 'Delegate' })
Expected: visible
Timeout: 30000ms
Error: element(s) not found

Call log:
[2m  - Expect "toBeVisible" getByRole('dialog', { name: 'Delegate' }) with timeout 30000ms[22m
[2m  - waiting for getByRole('dialog', { name: 'Delegate' })[22m


  197 |     await backdated.getByRole('button', { name: 'OK' }).click();
  198 |     // STEP 25: ASSERT the comments are captured and the Delegate pop-up is displayed
> 199 |     await expect(page.getByRole('dialog', { name: 'Delegate' })).toBeVisible({ timeout: 30000 });
      |                                                                  ^
  200 |     // STEP 26: CLICK the Don't Delegate button
  201 |     await dontDelegate(page);
  202 |   });
    at C:\Users\tiyim\OneDrive\Desktop\HCM\pd-Hcm\test-plans\HCM\eLeave\capture-new-leave-application.spec.ts:199:66
```
**Location:** C:\Users\tiyim\OneDrive\Desktop\HCM\pd-Hcm\test-plans\HCM\eLeave\capture-new-leave-application.spec.ts:199:66

### TC-03: Submit a future dated leave application
**Mode:** playwright-script
**Duration:** 16.9s
- [PASS] TC-03: Submit a future dated leave application
