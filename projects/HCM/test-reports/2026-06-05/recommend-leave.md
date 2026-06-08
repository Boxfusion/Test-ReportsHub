# Report: Test Plan: ELEAVE-SMOKE-RECOMMEND — Recommend Leave
**Date:** 2026-06-05 08:43 UTC
**Plan:** test-plans/eLeaveSmokeTest/recommend-leave.md
**Spec:** test-plans/eLeaveSmokeTest/recommend-leave.spec.ts
**Execution Mode:** playwright-script
**Result:** PASSED
**Duration:** 89.3s

## Summary
| Total Steps | Passed | Failed | Skipped |
|-------------|--------|--------|---------|
| 13 | 9 | 0 | 4 |

## Step Results
### TC-01: Login with valid credentials redirects to home
**Mode:** playwright-script
**Duration:** 5.5s
- [PASS] TC-01: Login with valid credentials redirects to home

### TC-02: Login with invalid credentials shows error and stays on login page
**Mode:** playwright-script
**Duration:** 6.9s
- [PASS] TC-02: Login with invalid credentials shows error and stays on login page

### TC-03: Inbox loads with pending leave applications
**Mode:** playwright-script
**Duration:** 8.8s
- [PASS] TC-03: Inbox loads with pending leave applications

### TC-04: Selecting the submitted application opens its leave detail
**Mode:** playwright-script
**Duration:** 12.5s
- [PASS] TC-04: Selecting the submitted application opens its leave detail

### TC-05: Leave application detail shows leave balance and taken days summary
**Mode:** playwright-script
**Duration:** 11.9s
- [PASS] TC-05: Leave application detail shows leave balance and taken days summary

### TC-06: 'Recommend' action becomes available after acknowledgement
**Mode:** playwright-script
**Duration:** 14.2s
- [PASS] TC-06: 'Recommend' action becomes available after acknowledgement

### TC-07: Backdated comment dialog accepts free text input
**Mode:** playwright-script
**Duration:** 0.3s
- [SKIP] TC-07: Backdated comment dialog accepts free text input

### TC-08: Recommend processes the submitted application and returns to the Inbox
**Mode:** playwright-script
**Duration:** 0.4s
- [SKIP] TC-08: Recommend processes the submitted application and returns to the Inbox

### TC-10: Backdated leave enforces mandatory supervisor comment
**Mode:** playwright-script
**Duration:** 0.2s
- [SKIP] TC-10: Backdated leave enforces mandatory supervisor comment

### TC-11: Unauthenticated access to Inbox is blocked
**Mode:** playwright-script
**Duration:** 6.0s
- [PASS] TC-11: Unauthenticated access to Inbox is blocked

### TC-12: Inbox renders rows for both SaGov and standard Leave Application types
**Mode:** playwright-script
**Duration:** 10.4s
- [PASS] TC-12: Inbox renders rows for both SaGov and standard Leave Application types

### TC-13: Show Dialog action failure surfaces a user-facing error
**Mode:** playwright-script
**Duration:** 0.2s
- [SKIP] TC-13: Show Dialog action failure surfaces a user-facing error

### TC-14: Overdue items in Inbox are visually distinguished
**Mode:** playwright-script
**Duration:** 10.8s
- [PASS] TC-14: Overdue items in Inbox are visually distinguished
