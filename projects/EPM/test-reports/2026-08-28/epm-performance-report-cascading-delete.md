# Report: EPM — Performance Report creation — cascading delete of child Components/Progress Reports
**Date:** 2026-08-28 10:25 UTC
**Plan:** test-plans/hierarchy-definitions/epm-performance-report-cascading-delete.md
**Spec:** test-plans/hierarchy-definitions/epm-performance-report-cascading-delete.spec.ts
**Execution Mode:** playwright-script (failures pending AI-repair)
**Result:** FAILED
**Duration:** 46.9s

## Summary
| Total Steps | Passed | Failed | Skipped |
|-------------|--------|--------|---------|
| 1 | 0 | 1 | 0 |

## Step Results
### TC-108819 Integration — Cascading delete of Performance Report removes all child Components and Progress Reports
**Mode:** playwright-script
**Duration:** 42.1s
- [FAIL] TC-108819 Integration — Cascading delete of Performance Report removes all child Components and Progress Reports

**Error:**
```
Error: STEP 1 EXPECTED (confirmed defect): the delete confirmation should cite counts of child Components (10) and Progress Reports (4) — got: "Are you sure want to delete this item?
CancelOK"

[2mexpect([22m[31mreceived[39m[2m).[22mtoBe[2m([22m[32mexpected[39m[2m) // Object.is equality[22m

Expected: [32mtrue[39m
Received: [31mfalse[39m

  197 |         /\b10\b/.test(confirmText) && /\b4\b/.test(confirmText),
  198 |         `STEP 1 EXPECTED (confirmed defect): the delete confirmation should cite counts of child Components (10) and Progress Reports (4) — got: "${confirmText}"`,
> 199 |       ).toBe(true);
      |         ^
  200 |
  201 |       // STEP 2: Confirm the delete.
  202 |       const okBtn = page.getByRole('button', { name: /^OK$/ }).first();
    at C:\Users\Boxfusion\Test-ReportsHub\projects\EPM\test-plans\hierarchy-definitions\epm-performance-report-cascading-delete.spec.ts:199:9
```
**Location:** C:\Users\Boxfusion\Test-ReportsHub\projects\EPM\test-plans\hierarchy-definitions\epm-performance-report-cascading-delete.spec.ts:199:9
