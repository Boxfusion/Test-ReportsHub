# Report: EPM — Progress Reporting Periods — skip toggle clears dependent fields
**Date:** 2026-08-30 18:03 UTC
**Plan:** test-plans/hierarchy-definitions/epm-kpi-progress-reporting-period-skip-clears-fields.md
**Spec:** test-plans/hierarchy-definitions/epm-kpi-progress-reporting-period-skip-clears-fields.spec.ts
**Execution Mode:** playwright-script (failures pending AI-repair)
**Result:** FAILED
**Duration:** 54.3s

## Summary
| Total Steps | Passed | Failed | Skipped |
|-------------|--------|--------|---------|
| 1 | 0 | 1 | 0 |

## Step Results
### TC-109463 Edge — toggling skipReportingThisPeriod clears indicatorTarget and resets poeRequired
**Mode:** playwright-script
**Duration:** 52.0s
- [FAIL] TC-109463 Edge — toggling skipReportingThisPeriod clears indicatorTarget and resets poeRequired

**Error:**
```
Error: STEP 2 EXPECTED (per ADO): indicatorTarget should clear to null once skip is toggled true — CONFIRMED DEFECT if not null: the field was not auto-cleared

[2mexpect([22m[31mreceived[39m[2m).[22mtoBeNull[2m()[22m

Received: [31m10[39m

  168 |
  169 |     expect(q1CprRow?.skipReportingThisPeriod, 'STEP 2 EXPECTED: skipReportingThisPeriod should persist as true').toBe(true);
> 170 |     expect.soft(q1CprRow?.indicatorTarget, 'STEP 2 EXPECTED (per ADO): indicatorTarget should clear to null once skip is toggled true — CONFIRMED DEFECT if not null: the field was not auto-cleared').toBeNull();
      |                                                                                                                                                                                                        ^
  171 |     expect.soft(q1CprRow?.poeRequired, 'STEP 2 EXPECTED (per ADO): poeRequired should reset to false once skip is toggled true — CONFIRMED DEFECT if not false: the field was not auto-reset').toBe(false);
  172 |
  173 |     console.log(`STEP 2 ACTUAL — workflow-related fields: workflowComponentProgressReportStatus=${q1CprRow?.workflowComponentProgressReportStatus}, isWorkflow=${q1CprRow?.isWorkflow}, currentQALevel=${q1CprRow?.currentQALevel}.`);
    at C:\Users\Boxfusion\Test-ReportsHub\projects\EPM\test-plans\hierarchy-definitions\epm-kpi-progress-reporting-period-skip-clears-fields.spec.ts:170:200
```
**Location:** C:\Users\Boxfusion\Test-ReportsHub\projects\EPM\test-plans\hierarchy-definitions\epm-kpi-progress-reporting-period-skip-clears-fields.spec.ts:170:200
