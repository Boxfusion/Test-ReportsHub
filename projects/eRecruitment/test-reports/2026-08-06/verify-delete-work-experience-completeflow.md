# Report: Test Plan: ADMINPORTAL-106306 — Verify Delete Work Experience
**Date:** 2026-08-06 07:54 UTC
**Plan:** test-plans/AdminPortal/verify-delete-work-experience-completeflow.md
**Spec:** test-plans/AdminPortal/verify-delete-work-experience-completeflow.spec.ts
**Execution Mode:** playwright-script (failures pending AI-repair)
**Result:** FAILED
**Duration:** 113.1s

> **Marked FAILED, not PARTIAL:** TC-07 is the step this test case is actually about (clicking the Work Experience row's Delete icon) — it fails because the control does not exist in the app, which blocks every remaining step (TC-08–10). This re-confirms the identical defect already logged for ADMINPORTAL-106551 (same test case content, different candidate). See test-reports/bugs/2026-08-05-work-experience-delete-icon-does-not-exist.md.

## Summary
| Total Steps | Passed | Failed | Skipped |
|-------------|--------|--------|---------|
| 10 | 6 | 4 | 0 |

## Step Results
### TC-01: Login as Kwena
**Mode:** playwright-script
**Duration:** 9.7s
- [PASS] TC-01: Login as Kwena

### TC-02: Click the sidebar toggle
**Mode:** playwright-script
**Duration:** 9.3s
- [PASS] TC-02: Click the sidebar toggle

### TC-03: Click on Recruitment dropdown
**Mode:** playwright-script
**Duration:** 9.3s
- [PASS] TC-03: Click on Recruitment dropdown

### TC-04: Click on Job Posting dashboard
**Mode:** playwright-script
**Duration:** 10.0s
- [PASS] TC-04: Click on Job Posting dashboard

### TC-05: Open Job Posting Ref No 40
**Mode:** playwright-script
**Duration:** 15.9s
- [PASS] TC-05: Open Job Posting Ref No 40

### TC-06: Open the target application
**Mode:** playwright-script
**Duration:** 18.5s
- [PASS] TC-06: Open the target application

### TC-07: Navigate to Work Experience panel and attempt to click the Delete icon
**Mode:** playwright-script
**Duration:** 34.5s
- [FAIL] TC-07: Navigate to Work Experience panel and attempt to click the Delete icon

**Error:**
```
Error: [2mexpect([22m[31mlocator[39m[2m).[22mtoHaveCount[2m([22m[32mexpected[39m[2m)[22m failed

Locator:  locator('div[role="row"]').nth(5).locator('.anticon-delete')
Expected: [32m1[39m
Received: [31m0[39m
Timeout:  10000ms

Call log:
[2m  - Expect "toHaveCount" with timeout 10000ms[22m
[2m  - waiting for locator('div[role="row"]').nth(5).locator('.anticon-delete')[22m
[2m    23 × locator resolved to 0 elements[22m
[2m       - unexpected value "0"[22m


  164 |     // view mode or inline-edit mode. This assertion is expected to FAIL,
  165 |     // re-confirming the defect on this candidate's row.
> 166 |     await expect(page.locator('div[role="row"]').nth(index).locator('.anticon-delete')).toHaveCount(1);
      |                                                                                         ^
  167 |   });
  168 |
  169 |   test.skip('TC-08: Click on Cancel button — blocked, no Delete icon exists', async () => {});
    at C:\Users\Reuben\IdeaProjects\eRecruitment Public Portal Claude Automation\Test-ReportsHub\projects\eRecruitment\test-plans\AdminPortal\verify-delete-work-experience-completeflow.spec.ts:166:89
```
**Location:** C:\Users\Reuben\IdeaProjects\eRecruitment Public Portal Claude Automation\Test-ReportsHub\projects\eRecruitment\test-plans\AdminPortal\verify-delete-work-experience-completeflow.spec.ts:166:89

### TC-08: Click on Cancel button — blocked, no Delete icon exists
**Mode:** playwright-script
**Duration:** 0.0s
- [FAIL] TC-08: Click on Cancel button — blocked, no Delete icon exists

### TC-09: Click on Delete button — blocked, no Delete icon exists
**Mode:** playwright-script
**Duration:** 0.0s
- [FAIL] TC-09: Click on Delete button — blocked, no Delete icon exists

### TC-10: Click on OK button — blocked, no Delete icon exists
**Mode:** playwright-script
**Duration:** 0.0s
- [FAIL] TC-10: Click on OK button — blocked, no Delete icon exists
