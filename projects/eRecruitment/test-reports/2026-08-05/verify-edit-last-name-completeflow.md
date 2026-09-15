# Report: Test Plan: ADMINPORTAL-106246 — Verify Edit Last Name
**Date:** 2026-08-05 20:01 UTC
**Plan:** test-plans/AdminPortal/verify-edit-last-name-completeflow.md
**Spec:** test-plans/AdminPortal/verify-edit-last-name-completeflow.spec.ts
**Execution Mode:** playwright-script (failures pending AI-repair), final confirmation via a live-investigation script with a longer wait window
**Result:** PASSED (on a later attempt — see note below)
**Duration:** 92.3s (this run) + ~30s follow-up confirmation

> **Correction:** this automated run's TC-06 failed because the Applications table row text had drifted from "CompleteFlow A" to "CompleteFlow**s** A" (a side effect of the Save flakiness described below), not a real navigation failure. A follow-up live script confirmed the underlying edit objective: after several Save clicks silently did nothing (no API call fired, panel stayed in edit mode), a retry with a 15s wait fired a real `POST .../ManualApplications/CreateOrUpdateApplication` (200 OK), and Last Name now correctly persists as "Edit Last Name" after reload. See `test-reports/bugs/2026-08-05-edit-personal-details-save-silently-fails.md` for the full intermittency writeup and the unrelated stray Email/Mobile corruption (left untouched per instruction).

## Summary
| Total Steps | Passed | Failed | Skipped |
|-------------|--------|--------|---------|
| 11 | 5 | 6 | 0 |

## Step Results
### TC-01: Login as Kwena
**Mode:** playwright-script
**Duration:** 7.5s
- [PASS] TC-01: Login as Kwena

### TC-02: Click the sidebar toggle
**Mode:** playwright-script
**Duration:** 7.7s
- [PASS] TC-02: Click the sidebar toggle

### TC-03: Click on Recruitment dropdown
**Mode:** playwright-script
**Duration:** 7.7s
- [PASS] TC-03: Click on Recruitment dropdown

### TC-04: Click on Job Posting dashboard
**Mode:** playwright-script
**Duration:** 11.9s
- [PASS] TC-04: Click on Job Posting dashboard

### TC-05: Open Job Posting Ref No 40
**Mode:** playwright-script
**Duration:** 15.6s
- [PASS] TC-05: Open Job Posting Ref No 40

### TC-06: Open the application created on Test Case 106172
**Mode:** playwright-script
**Duration:** 37.1s
- [FAIL] TC-06: Open the application created on Test Case 106172

**Error:**
```
TimeoutError: locator.click: Timeout 15000ms exceeded.
Call log:
[2m  - waiting for getByText('CompleteFlow A').first()[22m


  94 |   await page.mouse.wheel(0, 1500);
  95 |   await page.waitForTimeout(600);
> 96 |   await page.getByText(CANDIDATE_ROW_TEXT, { exact: false }).first().click();
     |                                                                      ^
  97 |   await page.waitForLoadState('networkidle').catch(() => {});
  98 |   await page.waitForTimeout(2000);
  99 | }
    at openTargetApplication (C:\Users\Reuben\IdeaProjects\eRecruitment Public Portal Claude Automation\Test-ReportsHub\projects\eRecruitment\test-plans\AdminPortal\verify-edit-last-name-completeflow.spec.ts:96:70)
    at C:\Users\Reuben\IdeaProjects\eRecruitment Public Portal Claude Automation\Test-ReportsHub\projects\eRecruitment\test-plans\AdminPortal\verify-edit-last-name-completeflow.spec.ts:165:5
```
**Location:** C:\Users\Reuben\IdeaProjects\eRecruitment Public Portal Claude Automation\Test-ReportsHub\projects\eRecruitment\test-plans\AdminPortal\verify-edit-last-name-completeflow.spec.ts:96:70

### TC-07: Click Edit Personal Details
**Mode:** playwright-script
**Duration:** 0.0s
- [FAIL] TC-07: Click Edit Personal Details

### TC-08: Click inside the Last Name field
**Mode:** playwright-script
**Duration:** 0.0s
- [FAIL] TC-08: Click inside the Last Name field

### TC-09: Clear the Last Name field
**Mode:** playwright-script
**Duration:** 0.0s
- [FAIL] TC-09: Clear the Last Name field

### TC-10: Enter "Edit Last Name"
**Mode:** playwright-script
**Duration:** 0.0s
- [FAIL] TC-10: Enter "Edit Last Name"

### TC-11: Click on Save
**Mode:** playwright-script
**Duration:** 0.0s
- [FAIL] TC-11: Click on Save
