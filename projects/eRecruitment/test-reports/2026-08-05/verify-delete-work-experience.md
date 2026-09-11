# Report: Test Plan: ADMINPORTAL-106551 — Verify Delete Work Experience
**Date:** 2026-08-05 18:29 UTC
**Plan:** test-plans/AdminPortal/verify-delete-work-experience.md
**Spec:** test-plans/AdminPortal/verify-delete-work-experience.spec.ts
**Execution Mode:** playwright-script (failures pending AI-repair)
**Result:** FAILED
**Duration:** 141.9s

> **Marked FAILED, not PARTIAL:** TC-07 is the step the entire test case is about (clicking the Work Experience row's Delete icon) — it fails because the control does not exist in the app, which blocks every remaining step (TC-08–10). A passing login/navigation prefix does not make this test case's actual objective achievable, so the overall result is recorded as FAILED. See test-reports/bugs/2026-08-05-work-experience-delete-icon-does-not-exist.md.

## Summary
| Total Steps | Passed | Failed | Skipped |
|-------------|--------|--------|---------|
| 10 | 6 | 4 | 0 |

## Step Results
### TC-01: Login as Kwena
**Mode:** playwright-script
**Duration:** 7.0s
- [PASS] TC-01: Login as Kwena

### TC-02: Click the sidebar toggle
**Mode:** playwright-script
**Duration:** 8.4s
- [PASS] TC-02: Click the sidebar toggle

### TC-03: Click on Recruitment dropdown
**Mode:** playwright-script
**Duration:** 8.5s
- [PASS] TC-03: Click on Recruitment dropdown

### TC-04: Click on Job Posting dashboard
**Mode:** playwright-script
**Duration:** 11.3s
- [PASS] TC-04: Click on Job Posting dashboard

### TC-05: Open Job Posting Ref No 40
**Mode:** playwright-script
**Duration:** 17.7s
- [PASS] TC-05: Open Job Posting Ref No 40

### TC-06: Open the target application
**Mode:** playwright-script
**Duration:** 39.3s
- [PASS] TC-06: Open the target application

### TC-07: Navigate to Work Experience panel and attempt to click the Delete icon
**Mode:** playwright-script
**Duration:** 45.2s
- [FAIL] TC-07: Navigate to Work Experience panel and attempt to click the Delete icon

**Error:**
```
Error: [2mexpect([22m[31mlocator[39m[2m).[22mtoHaveCount[2m([22m[32mexpected[39m[2m)[22m failed

Locator:  locator('div[role="row"]').nth(9).locator('.anticon-delete')
Expected: [32m1[39m
Received: [31m0[39m
Timeout:  10000ms

Call log:
[2m  - Expect "toHaveCount" with timeout 10000ms[22m
[2m  - waiting for locator('div[role="row"]').nth(9).locator('.anticon-delete')[22m
[2m    23 × locator resolved to 0 elements[22m
[2m       - unexpected value "0"[22m


  173 |     // view mode or inline-edit mode. This assertion is expected to FAIL,
  174 |     // giving the defect a genuine automated signal instead of a manual note.
> 175 |     await expect(page.locator('div[role="row"]').nth(index).locator('.anticon-delete')).toHaveCount(1);
      |                                                                                         ^
  176 |   });
  177 |
  178 |   test.skip('TC-08: Click on Cancel button — blocked, no Delete icon exists', async () => {});
    at C:\Users\Reuben\IdeaProjects\eRecruitment Public Portal Claude Automation\Test-ReportsHub\projects\eRecruitment\test-plans\AdminPortal\verify-delete-work-experience.spec.ts:175:89
```
**Location:** C:\Users\Reuben\IdeaProjects\eRecruitment Public Portal Claude Automation\Test-ReportsHub\projects\eRecruitment\test-plans\AdminPortal\verify-delete-work-experience.spec.ts:175:89

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
