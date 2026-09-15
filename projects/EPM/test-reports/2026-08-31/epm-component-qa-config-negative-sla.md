# Report: EPM — Component QA Config — negative SLA rejection
**Date:** 2026-08-31 07:11 UTC
**Plan:** test-plans/hierarchy-definitions/epm-component-qa-config-negative-sla.md
**Spec:** test-plans/hierarchy-definitions/epm-component-qa-config-negative-sla.spec.ts
**Execution Mode:** playwright-script (failures pending AI-repair)
**Result:** FAILED
**Duration:** 7.3s

## Summary
| Total Steps | Passed | Failed | Skipped |
|-------------|--------|--------|---------|
| 1 | 0 | 1 | 0 |

## Step Results
### TC-108829 Negative — negative slaDays should be rejected on Create
**Mode:** playwright-script
**Duration:** 5.5s
- [FAIL] TC-108829 Negative — negative slaDays should be rejected on Create

**Error:**
```
Error: STEP 1 EXPECTED (per ADO): saving with slaDays=-5 should be rejected with a validation error citing the field must be positive — CONFIRMED DEFECT if 2xx: no validation exists on this field

[2mexpect([22m[31mreceived[39m[2m).[22mtoBeTruthy[2m()[22m

Received: [31mfalse[39m

  64 |       console.log(`STEP 1 ACTUAL — Create with slaDays=-5: ${badResp.status()}. Body: ${JSON.stringify(badBody)}`);
  65 |       const rejected = badResp.status() >= 400;
> 66 |       expect.soft(rejected, 'STEP 1 EXPECTED (per ADO): saving with slaDays=-5 should be rejected with a validation error citing the field must be positive — CONFIRMED DEFECT if 2xx: no validation exists on this field').toBeTruthy();
     |                                                                                                                                                                                                                             ^
  67 |       if (!rejected && badBody?.result?.id) createdIds.push(badBody.result.id);
  68 |
  69 |       // STEP 2 (ADO): Confirm no ComponentQAConfig record was persisted.
    at C:\Users\Boxfusion\Test-ReportsHub\projects\EPM\test-plans\hierarchy-definitions\epm-component-qa-config-negative-sla.spec.ts:66:221
```
**Location:** C:\Users\Boxfusion\Test-ReportsHub\projects\EPM\test-plans\hierarchy-definitions\epm-component-qa-config-negative-sla.spec.ts:66:221
