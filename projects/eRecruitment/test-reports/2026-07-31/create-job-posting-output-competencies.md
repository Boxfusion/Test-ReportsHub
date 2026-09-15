# Report: Test Plan: ADMINPORTAL-102822 — Create Job Post (Valid) — Output and Competencies
**Date:** 2026-07-31 00:22 UTC
**Plan:** test-plans/AdminPortal/create-job-posting-output-competencies.md
**Spec:** test-plans/AdminPortal/create-job-posting-output-competencies.spec.ts
**Execution Mode:** playwright-script (failures pending AI-repair)
**Result:** FAILED
**Duration:** 14.7s

## Summary
| Total Steps | Passed | Failed | Skipped |
|-------------|--------|--------|---------|
| 16 | 0 | 16 | 0 |

## Step Results
### TC-01: Login as kamogelos
**Mode:** playwright-script
**Duration:** 6.1s
- [FAIL] TC-01: Login as kamogelos

**Error:**
```
Error: page.goto: net::ERR_NAME_NOT_RESOLVED at https://pd-recruitment-adminportal-1-qa.shesha.app/login
Call log:
[2m  - navigating to "https://pd-recruitment-adminportal-1-qa.shesha.app/login", waiting until "load"[22m


  33 |
  34 | async function loginAsAdmin(page: Page) {
> 35 |   await page.goto(`${APP_URL}login`);
     |              ^
  36 |   await page.locator('input[type="text"]').first().fill(ADMIN.user);
  37 |   await page.locator('input[type="password"]').first().fill(ADMIN.password);
  38 |   await page.getByRole('button', { name: /sign in/i }).click();
    at loginAsAdmin (C:\Users\Reuben\IdeaProjects\eRecruitment Public Portal Claude Automation\Test-ReportsHub\projects\eRecruitment\test-plans\AdminPortal\create-job-posting-output-competencies.spec.ts:35:14)
    at C:\Users\Reuben\IdeaProjects\eRecruitment Public Portal Claude Automation\Test-ReportsHub\projects\eRecruitment\test-plans\AdminPortal\create-job-posting-output-competencies.spec.ts:292:11
```
**Location:** C:\Users\Reuben\IdeaProjects\eRecruitment Public Portal Claude Automation\Test-ReportsHub\projects\eRecruitment\test-plans\AdminPortal\create-job-posting-output-competencies.spec.ts:35:14

### TC-02: Expand the Workflows menu
**Mode:** playwright-script
**Duration:** 0.0s
- [FAIL] TC-02: Expand the Workflows menu

### TC-03: Navigate to My Items submenu
**Mode:** playwright-script
**Duration:** 0.0s
- [FAIL] TC-03: Navigate to My Items submenu

### TC-04: Click the Create New button
**Mode:** playwright-script
**Duration:** 0.0s
- [FAIL] TC-04: Click the Create New button

### TC-05: Click the Job posting item
**Mode:** playwright-script
**Duration:** 0.0s
- [FAIL] TC-05: Click the Job posting item

### TC-06: Click the Name and Surname dropdown
**Mode:** playwright-script
**Duration:** 0.0s
- [FAIL] TC-06: Click the Name and Surname dropdown

### TC-07: Select a valid option from Name and Surname
**Mode:** playwright-script
**Duration:** 0.0s
- [FAIL] TC-07: Select a valid option from Name and Surname

### TC-08: Fill Job Reference Number, Province/Branch, Post Name
**Mode:** playwright-script
**Duration:** 0.0s
- [FAIL] TC-08: Fill Job Reference Number, Province/Branch, Post Name

### TC-09: Select Centre/Office Name, Salary Level, Salary Range
**Mode:** playwright-script
**Duration:** 0.0s
- [FAIL] TC-09: Select Centre/Office Name, Salary Level, Salary Range

### TC-10: Pick a valid future Closing Date
**Mode:** playwright-script
**Duration:** 0.0s
- [FAIL] TC-10: Pick a valid future Closing Date

### TC-11: Click the Next button (to step 2)
**Mode:** playwright-script
**Duration:** 0.0s
- [FAIL] TC-11: Click the Next button (to step 2)

### TC-12: Type into the Requirements text area
**Mode:** playwright-script
**Duration:** 0.0s
- [FAIL] TC-12: Type into the Requirements text area

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
