# Report: Test Plan: ELEAVE-SMOKE-APPROVE — Approve Leave
**Date:** 2026-06-05 08:45 UTC
**Plan:** test-plans/eLeaveSmokeTest/approve-leave.md
**Spec:** test-plans/eLeaveSmokeTest/approve-leave.spec.ts
**Execution Mode:** playwright-script
**Result:** PASSED
**Duration:** 69.3s

## Summary
| Total Steps | Passed | Failed | Skipped |
|-------------|--------|--------|---------|
| 8 | 6 | 0 | 2 |

## Step Results
### TC-01: Login with valid credentials redirects to home
**Mode:** playwright-script
**Duration:** 5.2s
- [PASS] TC-01: Login with valid credentials redirects to home

### TC-02: Login with invalid credentials shows error and stays on login page
**Mode:** playwright-script
**Duration:** 7.2s
- [PASS] TC-02: Login with invalid credentials shows error and stays on login page

### TC-03: Inbox loads with pending leave applications
**Mode:** playwright-script
**Duration:** 11.7s
- [PASS] TC-03: Inbox loads with pending leave applications

### TC-04: Selecting the submitted application opens its leave detail
**Mode:** playwright-script
**Duration:** 13.1s
- [PASS] TC-04: Selecting the submitted application opens its leave detail

### TC-05: Leave application detail shows leave balance and taken days summary
**Mode:** playwright-script
**Duration:** 13.1s
- [PASS] TC-05: Leave application detail shows leave balance and taken days summary

### TC-06: 'Approve with Full Pay' action becomes available after acknowledgement
**Mode:** playwright-script
**Duration:** 16.9s
- [PASS] TC-06: 'Approve with Full Pay' action becomes available after acknowledgement

### TC-07: Backdated comment dialog accepts free text input
**Mode:** playwright-script
**Duration:** 0.3s
- [SKIP] TC-07: Backdated comment dialog accepts free text input

### TC-08: Approve with Full Pay processes the submitted application and returns to the Inbox
**Mode:** playwright-script
**Duration:** 0.3s
- [SKIP] TC-08: Approve with Full Pay processes the submitted application and returns to the Inbox
