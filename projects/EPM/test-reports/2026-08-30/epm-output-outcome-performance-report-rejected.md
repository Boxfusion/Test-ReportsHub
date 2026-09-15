# Report: EPM — Output and Outcome linkage — planning-only invariant
**Date:** 2026-08-30 18:22 UTC
**Plan:** test-plans/hierarchy-definitions/epm-output-outcome-performance-report-rejected.md
**Spec:** test-plans/hierarchy-definitions/epm-output-outcome-performance-report-rejected.spec.ts
**Execution Mode:** playwright-script (failures pending AI-repair)
**Result:** FAILED
**Duration:** 20.5s

## Summary
| Total Steps | Passed | Failed | Skipped |
|-------------|--------|--------|---------|
| 1 | 0 | 1 | 0 |

## Step Results
### TC-108823 Negative — reject Output/Outcome Component creation with performanceReportId set
**Mode:** playwright-script
**Duration:** 18.5s
- [FAIL] TC-108823 Negative — reject Output/Outcome Component creation with performanceReportId set

**Error:**
```
Error: STEP 2 EXPECTED (per ADO): the server should reject an Output/Outcome Component created with performanceReportId set — CONFIRMED DEFECT if accepted: no server-side check enforces the planning-only invariant

[2mexpect([22m[31mreceived[39m[2m).[22mtoBe[2m([22m[32mexpected[39m[2m) // Object.is equality[22m

Expected: [32mtrue[39m
Received: [31mfalse[39m

  103 |       if (!bypassRejected) probeId = bypassBody?.result?.id ?? null;
  104 |       console.log(`STEP 2 ACTUAL — creating an Output Component with performanceReportId set was ${bypassRejected ? 'REJECTED' : 'ACCEPTED (Component created, id ' + probeId + ')'}; ADO EXPECTED: "Rejected".`);
> 105 |       expect(bypassRejected, 'STEP 2 EXPECTED (per ADO): the server should reject an Output/Outcome Component created with performanceReportId set — CONFIRMED DEFECT if accepted: no server-side check enforces the planning-only invariant').toBe(true);
      |                                                                                                                                                                                                                                                ^
  106 |     } finally {
  107 |       if (probeId) {
  108 |         const cleanup = await page.request.delete(`${COMPONENT_CRUD}/Delete?id=${probeId}`, { headers: auth }).catch(() => null);
    at C:\Users\Boxfusion\Test-ReportsHub\projects\EPM\test-plans\hierarchy-definitions\epm-output-outcome-performance-report-r
```
**Location:** C:\Users\Boxfusion\Test-ReportsHub\projects\EPM\test-plans\hierarchy-definitions\epm-output-outcome-performance-report-rejected.spec.ts:105:240
