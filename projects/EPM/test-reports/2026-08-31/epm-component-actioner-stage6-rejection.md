# Report: EPM — Component Actioner assignment — Stage 6 rejection
**Date:** 2026-08-31 06:57 UTC
**Plan:** test-plans/hierarchy-definitions/epm-component-actioner-stage6-rejection.md
**Spec:** test-plans/hierarchy-definitions/epm-component-actioner-stage6-rejection.spec.ts
**Execution Mode:** playwright-script (failures pending AI-repair)
**Result:** FAILED
**Duration:** 9.6s

## Summary
| Total Steps | Passed | Failed | Skipped |
|-------------|--------|--------|---------|
| 1 | 0 | 1 | 0 |

## Step Results
### TC-108828 Integration — assigning Stage 6 as a Component Actioner should be rejected
**Mode:** playwright-script
**Duration:** 8.4s
- [FAIL] TC-108828 Integration — assigning Stage 6 as a Component Actioner should be rejected

**Error:**
```
Error: STEP 1 EXPECTED (per ADO, preferred outcome): assigning the Stage 6 Person as a Component Actioner should be rejected — if false, per the case's own authoring standard this must be surfaced as a defect (ADO step 4 explicitly calls for filing a Bug against the current build; NOT done automatically here — reported back to the case owner instead)

[2mexpect([22m[31mreceived[39m[2m).[22mtoBeTruthy[2m()[22m

Received: [31mfalse[39m

  105 |       const rejected = stage6Resp.status() >= 400;
  106 |
> 107 |       expect.soft(rejected, 'STEP 1 EXPECTED (per ADO, preferred outcome): assigning the Stage 6 Person as a Component Actioner should be rejected — if false, per the case\'s own authoring standard this must be surfaced as a defect (ADO step 4 explicitly calls for filing a Bug against the current build; NOT done automatically here — reported back to the case owner instead)').toBeTruthy();
      |                                                                                                                                                                                                                                                                                                                                                                                           ^
  108 |
  109 |       if (!rejected && stage6Body?.result?.id) {
  110 |         createdIds.push(stage6Body.result.id);
    at C:\Users\Boxfusion\Test-ReportsHub\projects\EPM\test-plans\hierarchy-
```
**Location:** C:\Users\Boxfusion\Test-ReportsHub\projects\EPM\test-plans\hierarchy-definitions\epm-component-actioner-stage6-rejection.spec.ts:107:379
