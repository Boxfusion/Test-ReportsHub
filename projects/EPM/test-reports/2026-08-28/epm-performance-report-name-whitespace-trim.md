# Report: EPM — Performance Report creation — Name whitespace trimming
**Date:** 2026-08-28 09:28 UTC
**Plan:** test-plans/hierarchy-definitions/epm-performance-report-name-whitespace-trim.md
**Spec:** test-plans/hierarchy-definitions/epm-performance-report-name-whitespace-trim.spec.ts
**Execution Mode:** playwright-script (failures pending AI-repair)
**Result:** FAILED
**Duration:** 34.1s

## Summary
| Total Steps | Passed | Failed | Skipped |
|-------------|--------|--------|---------|
| 1 | 0 | 1 | 0 |

## Step Results
### TC-108818 Edge — Performance Report Name preserves leading and trailing whitespace as trimmed
**Mode:** playwright-script
**Duration:** 25.6s
- [FAIL] TC-108818 Edge — Performance Report Name preserves leading and trailing whitespace as trimmed

**Error:**
```
Error: STEP 2 EXPECTED (confirmed defect): the persisted Name should equal the trimmed value "Test Report 248980" with no surrounding whitespace — got "  Test Report 248980  "

[2mexpect([22m[31mreceived[39m[2m).[22mtoBe[2m([22m[32mexpected[39m[2m) // Object.is equality[22m

Expected: [32m"Test Report 248980"[39m
Received: [31m"[7m  [27mTest Report 248980[7m  [27m"[39m

  162 |         record?.name,
  163 |         `STEP 2 EXPECTED (confirmed defect): the persisted Name should equal the trimmed value "${TRIMMED_NAME}" with no surrounding whitespace — got ${JSON.stringify(record?.name)}`,
> 164 |       ).toBe(TRIMMED_NAME);
      |         ^
  165 |
  166 |       // STEP 3: Attempt to create a second record with the same name (untrimmed). Still meaningful
  167 |       // even given STEP 2's defect: an exact-string duplicate should collide regardless of whether the
    at C:\Users\Boxfusion\Test-ReportsHub\projects\EPM\test-plans\hierarchy-definitions\epm-performance-report-name-whitespace-trim.spec.ts:164:9
```
**Location:** C:\Users\Boxfusion\Test-ReportsHub\projects\EPM\test-plans\hierarchy-definitions\epm-performance-report-name-whitespace-trim.spec.ts:164:9
