# Report: Test Plan: ELEAVE-LEAVE-CREDITS — Leave Credits (Add, Edit, Audit Trail)
**Date:** 2026-10-07 08:53 UTC
**Plan:** test-plans/HCM/eLeave/leave-credits.md
**Spec:** test-plans/HCM/eLeave/leave-credits.spec.ts
**Execution Mode:** playwright-script (failures pending AI-repair)
**Result:** FAILED
**Duration:** 92.0s

## Summary
| Total Steps | Passed | Failed | Skipped |
|-------------|--------|--------|---------|
| 10 | 3 | 7 | 0 |

## Step Results
### TC-01: Login as Admin
**Mode:** playwright-script
**Duration:** 3.8s
- [PASS] TC-01: Login as Admin

### TC-02: Leave Balances page shows the credit actions
**Mode:** playwright-script
**Duration:** 7.1s
- [PASS] TC-02: Leave Balances page shows the credit actions

### TC-03: Add Personal Credit — 'Close' closes the dialog without saving
**Mode:** playwright-script
**Duration:** 10.6s
- [PASS] TC-03: Add Personal Credit — 'Close' closes the dialog without saving

### TC-04: Add Personal Credit — mandatory fields are enforced
**Mode:** playwright-script
**Duration:** 67.7s
- [FAIL] TC-04: Add Personal Credit — mandatory fields are enforced

**Error:**
```
Error: [2mexpect([22m[31mlocator[39m[2m).[22mtoBeVisible[2m([22m[2m)[22m failed

Locator: getByRole('textbox', { name: 'Username' })
Expected: visible
Timeout: 15000ms
Error: element(s) not found

Call log:
[2m  - Expect "toBeVisible" getByRole('textbox', { name: 'Username' }) with timeout 15000ms[22m
[2m  - waiting for getByRole('textbox', { name: 'Username' })[22m


Call Log:
- Timeout 60000ms exceeded while waiting on the predicate

  27 |     await page.goto(`${APP_URL}login`, { timeout: 30000 });
  28 |     await expect(page.getByRole('textbox', { name: 'Username' })).toBeVisible({ timeout: 15000 });
> 29 |   }).toPass({ timeout: 60000 });
     |      ^
  30 |   await page.getByRole('textbox', { name: 'Username' }).fill(ADMIN.user);
  31 |   await page.getByRole('textbox', { name: 'Password' }).fill(ADMIN.password);
  32 |   await page.getByRole('button', { name: 'Sign In' }).click();
    at loginAsAdmin (C:\Users\tiyim\OneDrive\Desktop\HCM\pd-Hcm\test-plans\HCM\eLeave\leave-credits.spec.ts:29:6)
    at C:\Users\tiyim\OneDrive\Desktop\HCM\pd-Hcm\test-plans\HCM\eLeave\leave-credits.spec.ts:174:11
```
**Location:** C:\Users\tiyim\OneDrive\Desktop\HCM\pd-Hcm\test-plans\HCM\eLeave\leave-credits.spec.ts:29:6

### TC-05: Add Personal Credit — 'OK' adds the credit and returns to Leave Balances
**Mode:** playwright-script
**Duration:** 0.0s
- [FAIL] TC-05: Add Personal Credit — 'OK' adds the credit and returns to Leave Balances

### TC-06: Edit Leave Credits — 'Close' closes the dialog without saving
**Mode:** playwright-script
**Duration:** 0.0s
- [FAIL] TC-06: Edit Leave Credits — 'Close' closes the dialog without saving

### TC-07: Edit Leave Credits — 'OK' saves and returns to Leave Balances
**Mode:** playwright-script
**Duration:** 0.0s
- [FAIL] TC-07: Edit Leave Credits — 'OK' saves and returns to Leave Balances

### TC-08: View Audit shows the edit in the Leave Credits Audit Trail
**Mode:** playwright-script
**Duration:** 0.0s
- [FAIL] TC-08: View Audit shows the edit in the Leave Credits Audit Trail

### TC-09: Audit Trail — 'Export' downloads an Excel sheet
**Mode:** playwright-script
**Duration:** 0.0s
- [FAIL] TC-09: Audit Trail — 'Export' downloads an Excel sheet

### TC-10: Cleanup — delete the test credit
**Mode:** playwright-script
**Duration:** 0.0s
- [FAIL] TC-10: Cleanup — delete the test credit
