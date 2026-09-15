# Report: EPM — Stage 1 POE upload
**Date:** 2026-09-01 08:39 UTC
**Plan:** test-plans/qa-chain/epm-stage1-poe-upload.md
**Spec:** test-plans/qa-chain/epm-stage1-poe-upload.spec.ts
**Execution Mode:** playwright-script (failures pending AI-repair)
**Result:** PARTIAL
**Duration:** 57.4s

## Summary
| Total Steps | Passed | Failed | Skipped |
|-------------|--------|--------|---------|
| 2 | 1 | 1 | 0 |

## Step Results
### TC-108790 Positive — upload a Portfolio of Evidence attachment
**Mode:** playwright-script
**Duration:** 33.0s
- [PASS] TC-108790 Positive — upload a Portfolio of Evidence attachment

### TC-108847 Negative — reject an unsupported file type (.exe)
**Mode:** playwright-script
**Duration:** 23.0s
- [FAIL] TC-108847 Negative — reject an unsupported file type (.exe)

**Error:**
```
Error: STEP EXPECTED (per ADO): an unsupported file type (.exe) should be rejected — CONFIRMED GAP: StoredFile/Upload accepts it with 200 and zero type validation, no rejection message shown

[2mexpect([22m[31mreceived[39m[2m).[22mtoBeTruthy[2m()[22m

Received: [31mfalse[39m

  135 |     const uploadAccepted = uploadResponses.some((r) => r.startsWith('2'));
  136 |     const rejected = clientRejectionText || !uploadAccepted;
> 137 |     expect.soft(rejected, 'STEP EXPECTED (per ADO): an unsupported file type (.exe) should be rejected — CONFIRMED GAP: StoredFile/Upload accepts it with 200 and zero type validation, no rejection message shown').toBeTruthy();
      |                                                                                                                                                                                                                      ^
  138 |
  139 |     const saveBtn = page.getByRole('button', { name: 'Save', exact: true }).first();
  140 |     await saveBtn.click();
    at C:\Users\Boxfusion\Test-ReportsHub\projects\EPM\test-plans\qa-chain\epm-stage1-poe-upload.spec.ts:137:214
```
**Location:** C:\Users\Boxfusion\Test-ReportsHub\projects\EPM\test-plans\qa-chain\epm-stage1-poe-upload.spec.ts:137:214
