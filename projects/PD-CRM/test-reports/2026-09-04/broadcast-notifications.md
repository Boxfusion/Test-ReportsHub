# Report: Broadcast Notifications — ADO suite 113517
**Date:** 2026-09-04 07:10 UTC
**Plan:** test-plans/case-management/broadcast-notifications.md
**Spec:** test-plans/case-management/broadcast-notifications.spec.ts
**Execution Mode:** playwright-script (failures pending AI-repair)
**Result:** PARTIAL
**Duration:** 633.5s

## Summary
| Total Steps | Passed | Failed | Skipped |
|-------------|--------|--------|---------|
| 10 | 9 | 1 | 0 |

## Step Results
### TC-01 (#113519): Verify Broadcast Notification Can Be Created
**Mode:** playwright-script
**Duration:** 60.8s
- [PASS] TC-01 (#113519): Verify Broadcast Notification Can Be Created

### TC-02 (#113520): Verify Broadcast Notification Details Can Be Viewed
**Mode:** playwright-script
**Duration:** 56.4s
- [PASS] TC-02 (#113520): Verify Broadcast Notification Details Can Be Viewed

### TC-03 (#113521): Verify Broadcast Notification Can Be Deleted
**Mode:** playwright-script
**Duration:** 84.1s
- [FAIL] TC-03 (#113521): Verify Broadcast Notification Can Be Deleted

**Error:**
```
Error: ADO wording: "Are you sure you want to delete this item?"

[2mexpect([22m[31mreceived[39m[2m).[22mtoMatch[2m([22m[32mexpected[39m[2m)[22m

Expected pattern: [32m/are you sure you want to delete this item\?/i[39m
Received string:  [31m"Delete Broadcast Are you sure you want to delete this item No Yes"[39m

  394 |     // "Click Yes". See Deviation 2 (BUG-601). Recorded, not enforced.
  395 |     expect.soft(dialogText, 'ADO wording: "Are you sure you want to delete this item?"')
> 396 |       .toMatch(/are you sure you want to delete this item\?/i);
      |        ^
  397 |
  398 |     // STEP 5: Confirm. Accept whichever affirmative label the build actually renders.
  399 |     await dialog.locator('button').filter({ hasText: /^(OK|Yes)$/i }).first().click();
    at C:\Users\NomfaneloNhleko\OneDrive\Test-ReportsHub\projects\PD-CRM\test-plans\case-management\broadcast-notifications.spec.ts:396:8
```
**Location:** C:\Users\NomfaneloNhleko\OneDrive\Test-ReportsHub\projects\PD-CRM\test-plans\case-management\broadcast-notifications.spec.ts:396:8

### TC-04 (#113522): Verify Broadcast Notification Can Be Edited
**Mode:** playwright-script
**Duration:** 89.7s
- [PASS] TC-04 (#113522): Verify Broadcast Notification Can Be Edited

### TC-05 (#113523): Verify Broadcast Notification Can Be Withdrawn
**Mode:** playwright-script
**Duration:** 68.8s
- [PASS] TC-05 (#113523): Verify Broadcast Notification Can Be Withdrawn

### TC-06 (#113524): Verify Broadcast Notification Deletion Can Be Cancelled
**Mode:** playwright-script
**Duration:** 80.4s
- [PASS] TC-06 (#113524): Verify Broadcast Notification Deletion Can Be Cancelled

### TC-07 (#113525): Verify Broadcast Notification Withdrawal Can Be Cancelled
**Mode:** playwright-script
**Duration:** 65.7s
- [PASS] TC-07 (#113525): Verify Broadcast Notification Withdrawal Can Be Cancelled

### TC-08 (#113526): Verify Broadcast Notification Delivery Options Can Be Selected
**Mode:** playwright-script
**Duration:** 50.5s
- [PASS] TC-08 (#113526): Verify Broadcast Notification Delivery Options Can Be Selected

### TC-09 (#113527): Verify Broadcast Notifications Can Be Searched
**Mode:** playwright-script
**Duration:** 31.5s
- [PASS] TC-09 (#113527): Verify Broadcast Notifications Can Be Searched

### TC-10 (#113528): Verify Broadcast Notifications Can Be Filtered
**Mode:** playwright-script
**Duration:** 36.3s
- [PASS] TC-10 (#113528): Verify Broadcast Notifications Can Be Filtered
