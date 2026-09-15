# Report: EPM — KPI/KPA identity tab — Method of Calculation text reclassification
**Date:** 2026-08-30 17:49 UTC
**Plan:** test-plans/hierarchy-definitions/epm-kpi-method-of-calculation-reclassification.md
**Spec:** test-plans/hierarchy-definitions/epm-kpi-method-of-calculation-reclassification.spec.ts
**Execution Mode:** playwright-script (failures pending AI-repair)
**Result:** FAILED
**Duration:** 35.0s

## Summary
| Total Steps | Passed | Failed | Skipped |
|-------------|--------|--------|---------|
| 1 | 0 | 1 | 0 |

## Step Results
### TC-109459 Edge — Method of Calculation containing "Qualitative" should reclassify the KPI type
**Mode:** playwright-script
**Duration:** 32.9s
- [FAIL] TC-109459 Edge — Method of Calculation containing "Qualitative" should reclassify the KPI type

**Error:**
```
Error: STEP 2 EXPECTED (per ADO): the Component Type should reclassify from "Quantitative KPI" to "Qualitative KPI" based on the text content of Method of Calculation — CONFIRMED NON-EXISTENT FEATURE if this stays "Quantitative KPI": the componentType field is independently selected, not derived from Method of Calculation text

[2mexpect([22m[31mreceived[39m[2m).[22mtoBe[2m([22m[32mexpected[39m[2m) // Object.is equality[22m

Expected: [32m"Qua[7ml[27mitative KPI"[39m
Received: [31m"Qua[7mnt[27mitative KPI"[39m

  158 |       console.log(`STEP 2 ACTUAL — persisted record: ${JSON.stringify(record)}`);
  159 |       console.log(`STEP 2 ACTUAL — componentType after save: "${record?.componentType?._displayName}".`);
> 160 |       expect.soft(record?.componentType?._displayName, 'STEP 2 EXPECTED (per ADO): the Component Type should reclassify from "Quantitative KPI" to "Qualitative KPI" based on the text content of Method of Calculation — CONFIRMED NON-EXISTENT FEATURE if this stays "Quantitative KPI": the componentType field is independently selected, not derived from Method of Calculation text').toBe('Qualitative KPI');
      |                                                                                                                                                                                                                                                                                                                                                   
```
**Location:** C:\Users\Boxfusion\Test-ReportsHub\projects\EPM\test-plans\hierarchy-definitions\epm-kpi-method-of-calculation-reclassification.spec.ts:160:381
