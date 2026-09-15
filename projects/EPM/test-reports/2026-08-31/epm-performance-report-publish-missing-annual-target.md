# Report: EPM — Performance Report Publish — missing Annual Target validation
**Date:** 2026-08-31 18:49 UTC
**Plan:** test-plans/hierarchy-definitions/epm-performance-report-publish-missing-annual-target.md
**Spec:** test-plans/hierarchy-definitions/epm-performance-report-publish-missing-annual-target.spec.ts
**Execution Mode:** playwright-script (failures pending AI-repair)
**Result:** FAILED
**Duration:** 20.6s

## Summary
| Total Steps | Passed | Failed | Skipped |
|-------------|--------|--------|---------|
| 1 | 0 | 1 | 0 |

## Step Results
### TC-108835 Negative — Publish should be rejected when a KPI has no Annual Target
**Mode:** playwright-script
**Duration:** 18.6s
- [FAIL] TC-108835 Negative — Publish should be rejected when a KPI has no Annual Target

**Error:**
```
Error: STEP 1 EXPECTED (per ADO): ValidateReadyToPublishAsync should reject Publish, citing the KPI missing an Annual Target — CONFIRMED DEFECT if it succeeds instead: the Annual Target gate is not enforced at all

[2mexpect([22m[31mreceived[39m[2m).[22mtoBeTruthy[2m()[22m

Received: [31mfalse[39m

  128 |     const wasRejected = /failed|cannot publish|error/i.test(toastText);
  129 |     console.log(`STEP 1 ACTUAL — Publish was rejected: ${wasRejected}.`);
> 130 |     expect.soft(wasRejected, 'STEP 1 EXPECTED (per ADO): ValidateReadyToPublishAsync should reject Publish, citing the KPI missing an Annual Target — CONFIRMED DEFECT if it succeeds instead: the Annual Target gate is not enforced at all').toBeTruthy();
      |                                                                                                                                                                                                                                                ^
  131 |
  132 |     // STEP 2 (ADO): Confirm status remains Planning, no ReportPublished audit event. If STEP 1's
  133 |     // rejection didn't happen (confirmed defect), this documents the real consequence: the report
    at C:\Users\Boxfusion\Test-ReportsHub\projects\EPM\test-plans\hierarchy-definitions\epm-performance-report-publish-missing-annual-target.spec.ts:130:240
```
**Location:** C:\Users\Boxfusion\Test-ReportsHub\projects\EPM\test-plans\hierarchy-definitions\epm-performance-report-publish-missing-annual-target.spec.ts:130:240
