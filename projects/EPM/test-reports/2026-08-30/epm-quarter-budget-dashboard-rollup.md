# Report: EPM — Progress Reporting Periods — per-quarter Budget dashboard rollup
**Date:** 2026-08-30 18:14 UTC
**Plan:** test-plans/dashboards/epm-quarter-budget-dashboard-rollup.md
**Spec:** test-plans/dashboards/epm-quarter-budget-dashboard-rollup.spec.ts
**Execution Mode:** playwright-script (failures pending AI-repair)
**Result:** FAILED
**Duration:** 23.1s

## Summary
| Total Steps | Passed | Failed | Skipped |
|-------------|--------|--------|---------|
| 1 | 0 | 1 | 0 |

## Step Results
### TC-109464 Edge — per-quarter Budget rolls up to the dashboard
**Mode:** playwright-script
**Duration:** 21.4s
- [FAIL] TC-109464 Edge — per-quarter Budget rolls up to the dashboard

**Error:**
```
Error: STEP 2 EXPECTED (per ADO): a per-quarter Budget figure should roll up somewhere on the dashboard (a tile, column, or "Annual Budget" summary) — CONFIRMED UNBUILT if absent: this dashboard tracks only Progress Report Status / Achievement Status distributions and a plain KPI-by-quarter status table, with no Budget-related content anywhere

[2mexpect([22m[31mreceived[39m[2m).[22mtoBeTruthy[2m()[22m

Received: [31mfalse[39m

  74 |     console.log(`STEP 2 ACTUAL — dashboard (report "${reportName}" selected) mentions "Budget": ${hasBudget}; mentions "Annual": ${hasAnnual}.`);
  75 |     console.log(`STEP 2 ACTUAL — full dashboard text: ${bodyTextAfter.replace(/\s+/g, ' ').slice(0, 2000)}`);
> 76 |     expect(hasBudget || hasAnnual, 'STEP 2 EXPECTED (per ADO): a per-quarter Budget figure should roll up somewhere on the dashboard (a tile, column, or "Annual Budget" summary) — CONFIRMED UNBUILT if absent: this dashboard tracks only Progress Report Status / Achievement Status distributions and a plain KPI-by-quarter status table, with no Budget-related content anywhere').toBeTruthy();
     |                                                                                                                                                                                                                                                                                                                                                                                          ^
  77
```
**Location:** C:\Users\Boxfusion\Test-ReportsHub\projects\EPM\test-plans\dashboards\epm-quarter-budget-dashboard-rollup.spec.ts:76:378
