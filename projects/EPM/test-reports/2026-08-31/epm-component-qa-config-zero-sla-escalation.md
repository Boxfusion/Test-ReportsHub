# Report: EPM — Component QA Config — zero-day SLA escalation
**Date:** 2026-08-31 07:19 UTC
**Plan:** test-plans/hierarchy-definitions/epm-component-qa-config-zero-sla-escalation.md
**Spec:** test-plans/hierarchy-definitions/epm-component-qa-config-zero-sla-escalation.spec.ts
**Execution Mode:** playwright-script (failures pending AI-repair)
**Result:** FAILED
**Duration:** 17.2s

## Summary
| Total Steps | Passed | Failed | Skipped |
|-------------|--------|--------|---------|
| 1 | 0 | 1 | 0 |

## Step Results
### TC-108830 Edge — SLA of zero should trigger an immediate escalation reminder
**Mode:** playwright-script
**Duration:** 16.1s
- [FAIL] TC-108830 Edge — SLA of zero should trigger an immediate escalation reminder

**Error:**
```
Error: STEP 2 EXPECTED (per ADO): a new notification record should appear in the queue for this immediate escalation — CONFIRMED GAP if unchanged: no reminder/escalation job is wired up at all

[2mexpect([22m[31mreceived[39m[2m).[22mtoBeGreaterThan[2m([22m[32mexpected[39m[2m)[22m

Expected: > [32m0[39m
Received:   [31m0[39m

  112 |       const nmCountAfter = nmAfter?.result?.totalCount ?? 0;
  113 |       console.log(`STEP 2 ACTUAL — NotificationMessage total after trigger: ${nmCountAfter} (baseline was ${nmCountBefore}).`);
> 114 |       expect.soft(nmCountAfter, 'STEP 2 EXPECTED (per ADO): a new notification record should appear in the queue for this immediate escalation — CONFIRMED GAP if unchanged: no reminder/escalation job is wired up at all').toBeGreaterThan(nmCountBefore);
      |                                                                                                                                                                                                                              ^
  115 |
  116 |       // STEP 3 (ADO): Confirm the audit trail records the escalation event via an
  117 |       // EpmAuditedEntityEvent row for this ComponentProgressReport.
    at C:\Users\Boxfusion\Test-ReportsHub\projects\EPM\test-plans\hierarchy-definitions\epm-component-qa-config-zero-sla-escalation.spec.ts:114:222
```
**Location:** C:\Users\Boxfusion\Test-ReportsHub\projects\EPM\test-plans\hierarchy-definitions\epm-component-qa-config-zero-sla-escalation.spec.ts:114:222
