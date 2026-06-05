# Report: Test Plan: ELEAVE-SMOKE-RECOMMEND — Recommend Leave
**Date:** 2026-06-04 11:19 UTC
**Plan:** test-plans/eLeaveSmokeTest/recommend-leave.md
**Spec:** test-plans/eLeaveSmokeTest/recommend-leave.spec.ts
**Execution Mode:** playwright-script
**Result:** PASSED
**Duration:** 79.1s

## Summary
| Total Steps | Passed | Failed | Skipped |
|-------------|--------|--------|---------|
| 13 | 11 | 0 | 2 |

## Step Results
### TC-01: Login with valid credentials redirects to home
**Mode:** playwright-script
**Duration:** 6.0s
- [PASS] TC-01: Login with valid credentials redirects to home

### TC-02: Login with invalid credentials shows error and stays on login page
**Mode:** playwright-script
**Duration:** 5.2s
- [PASS] TC-02: Login with invalid credentials shows error and stays on login page

### TC-03: Inbox loads with pending leave applications
**Mode:** playwright-script
**Duration:** 12.2s
- [PASS] TC-03: Inbox loads with pending leave applications

### TC-04: Selecting an inbox item opens the leave application detail
**Mode:** playwright-script
**Duration:** 7.9s
- [PASS] TC-04: Selecting an inbox item opens the leave application detail

### TC-05: Leave application detail shows leave balance and taken days summary
**Mode:** playwright-script
**Duration:** 8.4s
- [PASS] TC-05: Leave application detail shows leave balance and taken days summary

### TC-06: 'Recommend' action button is visible and clickable on backdated leave
**Mode:** playwright-script
**Duration:** 7.8s
- [PASS] TC-06: 'Recommend' action button is visible and clickable on backdated leave

### TC-07: Supervisor comment dialog accepts free text input
**Mode:** playwright-script
**Duration:** 8.0s
- [PASS] TC-07: Supervisor comment dialog accepts free text input

### TC-08: Clicking 'Ok' on recommend dialog submits and returns to Inbox
**Mode:** playwright-script
**Duration:** 0.3s
- [SKIP] TC-08: Clicking 'Ok' on recommend dialog submits and returns to Inbox

### TC-10: Backdated leave enforces mandatory supervisor comment
**Mode:** playwright-script
**Duration:** 8.5s
- [PASS] TC-10: Backdated leave enforces mandatory supervisor comment

### TC-11: Unauthenticated access to Inbox is blocked
**Mode:** playwright-script
**Duration:** 2.5s
- [PASS] TC-11: Unauthenticated access to Inbox is blocked

### TC-12: Inbox renders rows for both SaGov and standard Leave Application types
**Mode:** playwright-script
**Duration:** 5.4s
- [PASS] TC-12: Inbox renders rows for both SaGov and standard Leave Application types

### TC-13: Show Dialog action failure surfaces a user-facing error
**Mode:** playwright-script
**Duration:** 0.2s
- [SKIP] TC-13: Show Dialog action failure surfaces a user-facing error

### TC-14: Overdue items in Inbox are visually distinguished
**Mode:** playwright-script
**Duration:** 5.1s
- [PASS] TC-14: Overdue items in Inbox are visually distinguished
