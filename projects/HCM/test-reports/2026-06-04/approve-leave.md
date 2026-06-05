# Report: Test Plan: ELEAVE-SMOKE-APPROVE — Approve Leave
**Date:** 2026-06-04 11:24 UTC
**Plan:** test-plans/eLeaveSmokeTest/approve-leave.md
**Spec:** test-plans/eLeaveSmokeTest/approve-leave.spec.ts
**Execution Mode:** playwright-script
**Result:** PASSED
**Duration:** 40.8s

## Summary
| Total Steps | Passed | Failed | Skipped |
|-------------|--------|--------|---------|
| 8 | 5 | 0 | 3 |

## Step Results
### TC-01: Login with valid credentials redirects to home
**Mode:** playwright-script
**Duration:** 3.2s
- [PASS] TC-01: Login with valid credentials redirects to home

### TC-02: Login with invalid credentials shows error and stays on login page
**Mode:** playwright-script
**Duration:** 5.6s
- [PASS] TC-02: Login with invalid credentials shows error and stays on login page

### TC-03: Inbox loads with pending leave applications
**Mode:** playwright-script
**Duration:** 6.1s
- [PASS] TC-03: Inbox loads with pending leave applications

### TC-04: Selecting an inbox item opens the leave application detail
**Mode:** playwright-script
**Duration:** 7.7s
- [PASS] TC-04: Selecting an inbox item opens the leave application detail

### TC-05: Leave application detail shows leave balance and taken days summary
**Mode:** playwright-script
**Duration:** 7.3s
- [PASS] TC-05: Leave application detail shows leave balance and taken days summary

### TC-06: 'Approve with full Pay' action button is visible and clickable on backdated leave
**Mode:** playwright-script
**Duration:** 8.9s
- [SKIP] TC-06: 'Approve with full Pay' action button is visible and clickable on backdated leave

### TC-07: Supervisor comment dialog accepts free text input
**Mode:** playwright-script
**Duration:** 0.2s
- [SKIP] TC-07: Supervisor comment dialog accepts free text input

### TC-08: Clicking 'Ok' on Approve dialog submits and returns to Inbox
**Mode:** playwright-script
**Duration:** 0.2s
- [SKIP] TC-08: Clicking 'Ok' on Approve dialog submits and returns to Inbox
