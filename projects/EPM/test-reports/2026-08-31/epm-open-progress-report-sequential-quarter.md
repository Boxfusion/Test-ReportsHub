# Report: EPM — Open Progress Report sequential-quarter discipline
**Date:** 2026-08-31 12:41 UTC
**Plan:** test-plans/hierarchy-definitions/epm-open-progress-report-sequential-quarter.md
**Spec:** test-plans/hierarchy-definitions/epm-open-progress-report-sequential-quarter.spec.ts
**Execution Mode:** playwright-script (failures pending AI-repair)
**Result:** FAILED
**Duration:** 32.0s

## Summary
| Total Steps | Passed | Failed | Skipped |
|-------------|--------|--------|---------|
| 1 | 0 | 1 | 0 |

## Step Results
### TC-108838 Negative — Quarter 2 should not open while Quarter 1 is still Open
**Mode:** playwright-script
**Duration:** 30.3s
- [FAIL] TC-108838 Negative — Quarter 2 should not open while Quarter 1 is still Open

**Error:**
```
Error: STEP 1/2 EXPECTED (per ADO): opening Quarter 2 while Quarter 1 is Open should be rejected, citing sequential-quarter discipline — CONFIRMED DEFECT if Q2 genuinely opens via the real UI action too

[2mexpect([22m[31mreceived[39m[2m).[22mtoBeTruthy[2m()[22m

Received: [31mfalse[39m

  173 |     console.log(`STEP 1/2 ACTUAL — Q2 status after the attempt: ${q2AfterAttempt?.result?.status} (started at ${q2.status}).`);
  174 |     const rejected = !q2Attempt.dialogAppeared || q2AfterAttempt?.result?.status === q2.status;
> 175 |     expect.soft(rejected, 'STEP 1/2 EXPECTED (per ADO): opening Quarter 2 while Quarter 1 is Open should be rejected, citing sequential-quarter discipline — CONFIRMED DEFECT if Q2 genuinely opens via the real UI action too').toBeTruthy();
      |                                                                                                                                                                                                                                  ^
  176 |
  177 |     // STEP 3 (ADO): Close Quarter 1 first, then retry Quarter 2 — expect it opens successfully. No
  178 |     // dedicated, confirmed-working "Close Progress Report" UI action exists yet — reset via raw status
    at C:\Users\Boxfusion\Test-ReportsHub\projects\EPM\test-plans\hierarchy-definitions\epm-open-progress-report-sequential-quarter.spec.ts:175:226
```
**Location:** C:\Users\Boxfusion\Test-ReportsHub\projects\EPM\test-plans\hierarchy-definitions\epm-open-progress-report-sequential-quarter.spec.ts:175:226
