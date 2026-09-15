# Report: EPM — Component Actioner assignment — server-side actionLevel validation
**Date:** 2026-08-31 06:49 UTC
**Plan:** test-plans/hierarchy-definitions/epm-component-actioner-invalid-level.md
**Spec:** test-plans/hierarchy-definitions/epm-component-actioner-invalid-level.spec.ts
**Execution Mode:** playwright-script (failures pending AI-repair)
**Result:** FAILED
**Duration:** 7.5s

## Summary
| Total Steps | Passed | Failed | Skipped |
|-------------|--------|--------|---------|
| 1 | 0 | 1 | 0 |

## Step Results
### TC-108826 Negative — actionLevel not in the reflist should be rejected on Create
**Mode:** playwright-script
**Duration:** 6.2s
- [FAIL] TC-108826 Negative — actionLevel not in the reflist should be rejected on Create

**Error:**
```
Error: STEP 1 EXPECTED (per ADO): Create with actionLevel=100 should return a validation error citing an invalid reflist value — CONFIRMED DEFECT if 2xx: the field accepts an out-of-reflist integer with no validation at all

[2mexpect([22m[31mreceived[39m[2m).[22mtoBeTruthy[2m()[22m

Received: [31mfalse[39m

  68 |     console.log(`STEP 1 ACTUAL — Create with actionLevel=100: ${badCreateResp.status()}. Body: ${JSON.stringify(badBody)}`);
  69 |     const rejected = badCreateResp.status() >= 400;
> 70 |     expect.soft(rejected, 'STEP 1 EXPECTED (per ADO): Create with actionLevel=100 should return a validation error citing an invalid reflist value — CONFIRMED DEFECT if 2xx: the field accepts an out-of-reflist integer with no validation at all').toBeTruthy();
     |                                                                                                                                                                                                                                                       ^
  71 |
  72 |     // STEP 2 (ADO): Confirm no ComponentActioner record was persisted.
  73 |     const getAllAfterBad = await (await page.request.get(`${WF_API}/api/dynamic/Epm/ComponentActioner/Crud/GetAll?maxResultCount=2000`, { headers: auth })).json();
    at C:\Users\Boxfusion\Test-ReportsHub\projects\EPM\test-plans\hierarchy-definitions\epm-component-actioner-invalid-level.spec.ts:70:247
```
**Location:** C:\Users\Boxfusion\Test-ReportsHub\projects\EPM\test-plans\hierarchy-definitions\epm-component-actioner-invalid-level.spec.ts:70:247
