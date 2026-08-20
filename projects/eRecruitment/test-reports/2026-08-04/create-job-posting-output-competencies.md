# Report: Test Plan: ADMINPORTAL-102822 — Create Job Post (Valid) — Output and Competencies
**Date:** 2026-08-04 14:08 UTC
**Plan:** test-plans/AdminPortal/create-job-posting-output-competencies.md
**Spec:** test-plans/AdminPortal/create-job-posting-output-competencies.spec.ts
**Execution Mode:** playwright-script (failures pending AI-repair)
**Result:** PARTIAL
**Duration:** 470.6s

## Summary
| Total Steps | Passed | Failed | Skipped |
|-------------|--------|--------|---------|
| 16 | 11 | 5 | 0 |

## Step Results
### TC-01: Login as kamogelos
**Mode:** playwright-script
**Duration:** 7.8s
- [PASS] TC-01: Login as kamogelos

### TC-02: Expand the Workflows menu
**Mode:** playwright-script
**Duration:** 6.8s
- [PASS] TC-02: Expand the Workflows menu

### TC-03: Navigate to My Items submenu
**Mode:** playwright-script
**Duration:** 10.0s
- [PASS] TC-03: Navigate to My Items submenu

### TC-04: Click the Create New button
**Mode:** playwright-script
**Duration:** 9.5s
- [PASS] TC-04: Click the Create New button

### TC-05: Click the Job posting item
**Mode:** playwright-script
**Duration:** 15.1s
- [PASS] TC-05: Click the Job posting item

### TC-06: Click the Name and Surname dropdown
**Mode:** playwright-script
**Duration:** 12.0s
- [PASS] TC-06: Click the Name and Surname dropdown

### TC-07: Select a valid option from Name and Surname
**Mode:** playwright-script
**Duration:** 13.0s
- [PASS] TC-07: Select a valid option from Name and Surname

### TC-08: Fill Job Reference Number, Province/Branch, Centre/Office Name (ascending DOM order, column 1)
**Mode:** playwright-script
**Duration:** 31.6s
- [PASS] TC-08: Fill Job Reference Number, Province/Branch, Centre/Office Name (ascending DOM order, column 1)

### TC-09: Fill Post Name, Salary Level, Salary Range (ascending DOM order, column 2)
**Mode:** playwright-script
**Duration:** 56.9s
- [PASS] TC-09: Fill Post Name, Salary Level, Salary Range (ascending DOM order, column 2)

### TC-10: Pick a valid future Closing Date
**Mode:** playwright-script
**Duration:** 57.5s
- [PASS] TC-10: Pick a valid future Closing Date

### TC-11: Click the Next button (to step 2)
**Mode:** playwright-script
**Duration:** 59.8s
- [PASS] TC-11: Click the Next button (to step 2)

### TC-12: Type into the Requirements text area
**Mode:** playwright-script
**Duration:** 184.5s
- [FAIL] TC-12: Type into the Requirements text area

**Error:**
```
[31mTest timeout of 180000ms exceeded.[39m
```

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
