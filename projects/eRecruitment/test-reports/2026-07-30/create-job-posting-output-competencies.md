# Report: Test Plan: ADMINPORTAL-102822 — Create Job Post (Valid) — Output and Competencies
**Date:** 2026-07-30 21:53 UTC
**Plan:** test-plans/AdminPortal/create-job-posting-output-competencies.md
**Spec:** test-plans/AdminPortal/create-job-posting-output-competencies.spec.ts
**Execution Mode:** playwright-script (failures pending AI-repair)
**Result:** PARTIAL
**Duration:** 434.0s

## Summary
| Total Steps | Passed | Failed | Skipped |
|-------------|--------|--------|---------|
| 16 | 11 | 5 | 0 |

## Step Results
### TC-01: Login as kamogelos
**Mode:** playwright-script
**Duration:** 7.6s
- [PASS] TC-01: Login as kamogelos

### TC-02: Expand the Workflows menu
**Mode:** playwright-script
**Duration:** 10.2s
- [PASS] TC-02: Expand the Workflows menu

### TC-03: Navigate to My Items submenu
**Mode:** playwright-script
**Duration:** 16.7s
- [PASS] TC-03: Navigate to My Items submenu

### TC-04: Click the Create New button
**Mode:** playwright-script
**Duration:** 18.6s
- [PASS] TC-04: Click the Create New button

### TC-05: Click the Job posting item
**Mode:** playwright-script
**Duration:** 34.7s
- [PASS] TC-05: Click the Job posting item

### TC-06: Click the Name and Surname dropdown
**Mode:** playwright-script
**Duration:** 40.7s
- [PASS] TC-06: Click the Name and Surname dropdown

### TC-07: Select a valid option from Name and Surname
**Mode:** playwright-script
**Duration:** 22.4s
- [PASS] TC-07: Select a valid option from Name and Surname

### TC-08: Fill Job Reference Number, Province/Branch, Post Name
**Mode:** playwright-script
**Duration:** 16.2s
- [PASS] TC-08: Fill Job Reference Number, Province/Branch, Post Name

### TC-09: Select Centre/Office Name, Salary Level, Salary Range
**Mode:** playwright-script
**Duration:** 24.1s
- [PASS] TC-09: Select Centre/Office Name, Salary Level, Salary Range

### TC-10: Pick a valid future Closing Date
**Mode:** playwright-script
**Duration:** 30.3s
- [PASS] TC-10: Pick a valid future Closing Date

### TC-11: Click the Next button (to step 2)
**Mode:** playwright-script
**Duration:** 30.5s
- [PASS] TC-11: Click the Next button (to step 2)

### TC-12: Type into the Requirements text area
**Mode:** playwright-script
**Duration:** 172.6s
- [FAIL] TC-12: Type into the Requirements text area

**Error:**
```
Error: clickNextWhenEnabled: Next button never stayed enabled long enough to click

  197 |       return;
  198 |     } catch {
> 199 |       if (attempt === maxAttempts) throw new Error('clickNextWhenEnabled: Next button never stayed enabled long enough to click');
      |                                          ^
  200 |       await page.locator('.sha-page-heading').first().click({ force: true }).catch(() => {});
  201 |       await page.waitForTimeout(2500);
  202 |       // Occasionally reload to clear a possibly stuck validation cache —
    at clickNextWhenEnabled (C:\Users\Reuben\IdeaProjects\eRecruitment Public Portal Claude Automation\Test-ReportsHub\projects\eRecruitment\test-plans\AdminPortal\create-job-posting-output-competencies.spec.ts:199:42)
    at advanceToStep2 (C:\Users\Reuben\IdeaProjects\eRecruitment Public Portal Claude Automation\Test-ReportsHub\projects\eRecruitment\test-plans\AdminPortal\create-job-posting-output-competencies.spec.ts:226:3)
    at fillFormThroughStep (C:\Users\Reuben\IdeaProjects\eRecruitment Public Portal Claude Automation\Test-ReportsHub\projects\eRecruitment\test-plans\AdminPortal\create-job-posting-output-competencies.spec.ts:257:3)
    at C:\Users\Reuben\IdeaProjects\eRecruitment Public Portal Claude Automation\Test-ReportsHub\projects\eRecruitment\test-plans\AdminPortal\create-job-posting-output-competencies.spec.ts:343:5
```
**Location:** C:\Users\Reuben\IdeaProjects\eRecruitment Public Portal Claude Automation\Test-ReportsHub\projects\eRecruitment\test-plans\AdminPortal\create-job-posting-output-competencies.spec.ts:199:42

### TC-13: Type into the Required Skills and Competencies text area
**Mode:** playwright-script
**Duration:** 0.0s
- [FAIL] TC-13: Type into the Required Skills and Competencies text area

### TC-14: Type into the Duties text area
**Mode:** playwright-script
**Duration:** 0.0s
- [FAIL] TC-14: Type into the Duties text area

### TC-15: Assert the Next button becomes enabled
**Mode:** playwright-script
**Duration:** 0.0s
- [FAIL] TC-15: Assert the Next button becomes enabled

### TC-16: Click the newly enabled Next button
**Mode:** playwright-script
**Duration:** 0.0s
- [FAIL] TC-16: Click the newly enabled Next button
