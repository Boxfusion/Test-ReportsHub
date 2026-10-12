# Report: Test Plan: ELEAVE-APPROVE-WITHOUT-PAY — Approve Leave Application without Pay
**Date:** 2026-10-06 20:11 UTC
**Plan:** test-plans/HCM/eLeave/approve-without-pay-dialog.md
**Spec:** test-plans/HCM/eLeave/approve-without-pay-dialog.spec.ts
**Execution Mode:** playwright-script (failures pending AI-repair)
**Result:** PARTIAL
**Duration:** 76.8s

## Summary
| Total Steps | Passed | Failed | Skipped |
|-------------|--------|--------|---------|
| 3 | 2 | 1 | 0 |

## Step Results
### TC-01: Login as Approver
**Mode:** playwright-script
**Duration:** 10.6s
- [PASS] TC-01: Login as Approver

### TC-02: 'Approve without Pay' is disabled until the acknowledgement checkbox is ticked
**Mode:** playwright-script
**Duration:** 27.9s
- [PASS] TC-02: 'Approve without Pay' is disabled until the acknowledgement checkbox is ticked

### TC-03: Approver can approve a leave application Without Pay from the Workflows Inbox
**Mode:** playwright-script
**Duration:** 37.4s
- [FAIL] TC-03: Approver can approve a leave application Without Pay from the Workflows Inbox

**Error:**
```
TimeoutError: page.goto: Timeout 30000ms exceeded.
Call log:
[2m  - navigating to "https://pd-hcm-adminportal-qa.shesha.app/login", waiting until "load"[22m


  15 |
  16 | async function loginAsApprover(page: Page) {
> 17 |   await page.goto(`${APP_URL}login`);
     |              ^
  18 |   // STEP login.1: TYPE Username field with `GOV022`
  19 |   await page.getByRole('textbox', { name: 'Username' }).fill(APPROVER.user);
  20 |   // STEP login.2: TYPE Password field with `123qwe`
    at loginAsApprover (C:\Users\tiyim\OneDrive\Desktop\HCM\pd-Hcm\test-plans\HCM\eLeave\approve-without-pay-dialog.spec.ts:17:14)
    at C:\Users\tiyim\OneDrive\Desktop\HCM\pd-Hcm\test-plans\HCM\eLeave\approve-without-pay-dialog.spec.ts:99:11
```
**Location:** C:\Users\tiyim\OneDrive\Desktop\HCM\pd-Hcm\test-plans\HCM\eLeave\approve-without-pay-dialog.spec.ts:17:14
