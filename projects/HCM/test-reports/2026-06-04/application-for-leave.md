# Report: Test Plan: ELEAVE-SMOKE-APPLY — Application for Leave
**Date:** 2026-06-04 12:36 UTC
**Plan:** test-plans/eLeaveSmokeTest/application-for-leave.md
**Spec:** test-plans/eLeaveSmokeTest/application-for-leave.spec.ts
**Execution Mode:** playwright-script
**Result:** PASSED
**Duration:** 84.3s

## Summary
| Total Steps | Passed | Failed | Skipped |
|-------------|--------|--------|---------|
| 14 | 9 | 0 | 5 |

## Step Results
### TC-01: Create New Leave Application — login and reach My Items
**Mode:** playwright-script
**Duration:** 3.6s
- [PASS] TC-01: Create New Leave Application — login and reach My Items

### TC-02: My Items page loads with leave application list
**Mode:** playwright-script
**Duration:** 6.1s
- [PASS] TC-02: My Items page loads with leave application list

### TC-03: Create New dropdown shows SaGov Leave Application option
**Mode:** playwright-script
**Duration:** 6.2s
- [PASS] TC-03: Create New dropdown shows SaGov Leave Application option

### TC-04: New leave application form opens on option selection
**Mode:** playwright-script
**Duration:** 7.7s
- [PASS] TC-04: New leave application form opens on option selection

### TC-05: Category and sub-category populate correctly
**Mode:** playwright-script
**Duration:** 8.7s
- [PASS] TC-05: Category and sub-category populate correctly

### TC-06: Same-day start and end date shows '1 day off' confirmation
**Mode:** playwright-script
**Duration:** 8.8s
- [PASS] TC-06: Same-day start and end date shows '1 day off' confirmation

### TC-07: Available leave balance message shown after date selection
**Mode:** playwright-script
**Duration:** 8.6s
- [SKIP] TC-07: Available leave balance message shown after date selection

### TC-08: Address and telephone fields accept valid input
**Mode:** playwright-script
**Duration:** 7.7s
- [PASS] TC-08: Address and telephone fields accept valid input

### TC-09: Submit is blocked until T&Cs checkbox is ticked
**Mode:** playwright-script
**Duration:** 8.7s
- [PASS] TC-09: Submit is blocked until T&Cs checkbox is ticked

### TC-10: Delegation modal appears on submit
**Mode:** playwright-script
**Duration:** 0.2s
- [SKIP] TC-10: Delegation modal appears on submit

### TC-11: 'Don't Delegate' closes modal and returns to My Items
**Mode:** playwright-script
**Duration:** 0.2s
- [SKIP] TC-11: 'Don't Delegate' closes modal and returns to My Items

### TC-12: Submit without required fields shows validation errors
**Mode:** playwright-script
**Duration:** 7.3s
- [SKIP] TC-12: Submit without required fields shows validation errors

### TC-13: End date before start date is rejected
**Mode:** playwright-script
**Duration:** 9.0s
- [PASS] TC-13: End date before start date is rejected

### TC-14: Leave spanning a weekend counts only working days
**Mode:** playwright-script
**Duration:** 0.2s
- [SKIP] TC-14: Leave spanning a weekend counts only working days
