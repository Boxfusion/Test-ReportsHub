# Report: Test Plan: ADMINPORTAL-106240 — Edit First Name
**Date:** 2026-08-05 19:34 UTC
**Plan:** test-plans/AdminPortal/verify-edit-first-name.md
**Spec:** test-plans/AdminPortal/verify-edit-first-name.spec.ts
**Execution Mode:** playwright-script
**Result:** FAILED (corrected 2026-08-05 — see below)
**Duration:** 203.3s

> **⚠️ CORRECTION (2026-08-05, discovered while automating ADMINPORTAL-106246):** this report originally said PASSED. That was a **false positive** caused by a flawed TC-11 assertion — `getByText('Test', { exact: false })` matches ANY text containing "Test" as a substring, including the untouched original value "AutoTest". A fresh page load confirms First Name is still **"AutoTest"** — the Save never actually persisted. Root cause confirmed live: the app's "Editing details" Save handler logs (and submits) a stale cached `applicantProfileJson` snapshot captured before the field edit, not the live edited form value — the Personal Details panel never even exits edit mode after clicking Save (confirmed via force-click retries and network monitoring: **zero** API calls fire on Save for this specific application). See `test-reports/bugs/2026-08-05-edit-personal-details-save-silently-fails.md`.

## Summary
| Total Steps | Passed | Failed | Skipped |
|-------------|--------|--------|---------|
| 11 | 10 | 1 | 0 |

## Step Results
### TC-01: Login as Kwena
**Mode:** playwright-script
**Duration:** 7.9s
- [PASS] TC-01: Login as Kwena

### TC-02: Click the sidebar toggle
**Mode:** playwright-script
**Duration:** 7.4s
- [PASS] TC-02: Click the sidebar toggle

### TC-03: Click on Recruitment dropdown
**Mode:** playwright-script
**Duration:** 8.1s
- [PASS] TC-03: Click on Recruitment dropdown

### TC-04: Click on Job Posting dashboard
**Mode:** playwright-script
**Duration:** 10.2s
- [PASS] TC-04: Click on Job Posting dashboard

### TC-05: Open Job Posting Ref No 40
**Mode:** playwright-script
**Duration:** 14.6s
- [PASS] TC-05: Open Job Posting Ref No 40

### TC-06: Open the application created on Test Case 106172
**Mode:** playwright-script
**Duration:** 20.6s
- [PASS] TC-06: Open the application created on Test Case 106172

### TC-07: Click Edit Personal Details
**Mode:** playwright-script
**Duration:** 22.9s
- [PASS] TC-07: Click Edit Personal Details

### TC-08: Click inside the First Name field
**Mode:** playwright-script
**Duration:** 25.7s
- [PASS] TC-08: Click inside the First Name field

### TC-09: Clear the First Name field
**Mode:** playwright-script
**Duration:** 26.9s
- [PASS] TC-09: Clear the First Name field

### TC-10: Enter "Test"
**Mode:** playwright-script
**Duration:** 22.1s
- [PASS] TC-10: Enter "Test"

### TC-11: Click on Save
**Mode:** playwright-script
**Duration:** 33.4s
- [FAIL] TC-11: Click on Save — Save click did not persist the edit (see correction note above); First Name remains "AutoTest"
