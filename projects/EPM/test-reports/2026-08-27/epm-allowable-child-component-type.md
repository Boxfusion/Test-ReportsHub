# Report: EPM — Component Type — Allowable Child Component Type table (parent-child restrictions for tree building)
**Date:** 2026-08-27 19:26 UTC
**Plan:** test-plans/hierarchy-definitions/epm-allowable-child-component-type.md
**Spec:** test-plans/hierarchy-definitions/epm-allowable-child-component-type.spec.ts
**Execution Mode:** playwright-script (failures pending AI-repair)
**Result:** FAILED
**Duration:** 80.4s

## Summary
| Total Steps | Passed | Failed | Skipped |
|-------------|--------|--------|---------|
| 1 | 0 | 1 | 0 |

## Step Results
### TC-109452 Integration — Allowable Child Component Type list drives the Reporting Tree builder allowed operations
**Mode:** playwright-script
**Duration:** 78.6s
- [FAIL] TC-109452 Integration — Allowable Child Component Type list drives the Reporting Tree builder allowed operations

**Error:**
```
Error: setup: disposable parent Component Type should have been created

[2mexpect([22m[31mreceived[39m[2m).[22mtoBeTruthy[2m()[22m

Received: [31mnull[39m

  464 |       }
  465 |       await expect(createModal).toBeHidden({ timeout: 90_000 });
> 466 |       expect(parentTypeId, 'setup: disposable parent Component Type should have been created').toBeTruthy();
      |                                                                                                ^
  467 |       console.log(`Setup — created disposable parent Component Type "${parentTypeName}" (id ${parentTypeId})`);
  468 |
  469 |       // Add exactly 3 allowable children directly via the API (setup, not a graded step).
    at C:\Users\Boxfusion\Test-ReportsHub\projects\EPM\test-plans\hierarchy-definitions\epm-allowable-child-component-type.spec.ts:466:96
```
**Location:** C:\Users\Boxfusion\Test-ReportsHub\projects\EPM\test-plans\hierarchy-definitions\epm-allowable-child-component-type.spec.ts:466:96
