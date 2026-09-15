# Report: EPM — Component QA Config — level count integration
**Date:** 2026-08-31 07:22 UTC
**Plan:** test-plans/hierarchy-definitions/epm-component-qa-config-level-count-integration.md
**Spec:** test-plans/hierarchy-definitions/epm-component-qa-config-level-count-integration.spec.ts
**Execution Mode:** playwright-script (failures pending AI-repair)
**Result:** FAILED
**Duration:** 8.3s

## Summary
| Total Steps | Passed | Failed | Skipped |
|-------------|--------|--------|---------|
| 1 | 0 | 1 | 0 |

## Step Results
### TC-108831 Integration — numProgressQALevelsRequired should align with four ComponentQAConfig rows per KPI
**Mode:** playwright-script
**Duration:** 6.3s
- [FAIL] TC-108831 Integration — numProgressQALevelsRequired should align with four ComponentQAConfig rows per KPI

**Error:**
```
Error: STEP 1 EXPECTED (per ADO): KPI "undefined" should have exactly 4 ComponentQAConfig rows (levels 1-4) — CONFIRMED GAP if 0: ComponentQAConfig is never populated in ordinary use, since it has no UI surface at all

[2mexpect([22m[31mreceived[39m[2m).[22mtoBe[2m([22m[32mexpected[39m[2m) // Object.is equality[22m

Expected: [32m4[39m
Received: [31m0[39m

  82 |       console.log(`STEP 1 ACTUAL — ComponentQAConfig row counts per KPI: ${JSON.stringify(kpiCounts)}`);
  83 |       for (const { name, qaConfigCount } of kpiCounts) {
> 84 |         expect.soft(qaConfigCount, `STEP 1 EXPECTED (per ADO): KPI "${name}" should have exactly 4 ComponentQAConfig rows (levels 1-4) — CONFIRMED GAP if 0: ComponentQAConfig is never populated in ordinary use, since it has no UI surface at all`).toBe(4);
     |                                                                                                                                                                                                                                                        ^
  85 |       }
  86 |
  87 |       // STEP 2 (ADO): Change numProgressQALevelsRequired on the Component Type to 5.
    at C:\Users\Boxfusion\Test-ReportsHub\projects\EPM\test-plans\hierarchy-definitions\epm-component-qa-config-level-count-integration.spec.ts:84:248
```
**Location:** C:\Users\Boxfusion\Test-ReportsHub\projects\EPM\test-plans\hierarchy-definitions\epm-component-qa-config-level-count-integration.spec.ts:84:248
