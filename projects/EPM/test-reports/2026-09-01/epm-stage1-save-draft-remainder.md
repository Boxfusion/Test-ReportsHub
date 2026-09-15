# Report: EPM — Stage 1 Save as Draft — remainder (TC-108844/845/846)
**Date:** 2026-09-01 08:03 UTC
**Plan:** test-plans/qa-chain/epm-stage1-save-draft-remainder.md
**Spec:** test-plans/qa-chain/epm-stage1-save-draft-remainder.spec.ts
**Execution Mode:** playwright-script (failures pending AI-repair)
**Result:** FAILED
**Duration:** 84.6s

## Summary
| Total Steps | Passed | Failed | Skipped |
|-------------|--------|--------|---------|
| 3 | 1 | 2 | 0 |

## Step Results
### TC-108844 Negative — reject Save as Draft with a missing mandatory field
**Mode:** playwright-script
**Duration:** 20.8s
- [FAIL] TC-108844 Negative — reject Save as Draft with a missing mandatory field

**Error:**
```
Error: STEP EXPECTED (per ADO): Save should reject a completely blank form, citing a missing mandatory field — CONFIRMED GAP if it succeeds: Save has no field-level validation at all

[2mexpect([22m[31mreceived[39m[2m).[22mtoBeTruthy[2m()[22m

Received: [31mfalse[39m

  79 |     console.log(`STEP ACTUAL — Save response(s) on blank form: ${JSON.stringify(saveResponses)}.`);
  80 |     const wasRejected = !saveEnabled || saveResponses.some((r) => r.startsWith('4') || r.startsWith('5'));
> 81 |     expect.soft(wasRejected, 'STEP EXPECTED (per ADO): Save should reject a completely blank form, citing a missing mandatory field — CONFIRMED GAP if it succeeds: Save has no field-level validation at all').toBeTruthy();
     |                                                                                                                                                                                                                 ^
  82 |
  83 |     const cprAfter = await (await page.request.get(`${WF_API}/api/dynamic/Epm/ComponentProgressReport/Crud/Get?id=${QUAL_CPR_ID}`, { headers: stage1Auth })).json();
  84 |     console.log(`STEP ACTUAL — CPR after blank-Save attempt: indicatorActualText=${cprAfter?.result?.indicatorActualText}.`);
    at C:\Users\Boxfusion\Test-ReportsHub\projects\EPM\test-plans\qa-chain\epm-stage1-save-draft-remainder.spec.ts:81:209
```
**Location:** C:\Users\Boxfusion\Test-ReportsHub\projects\EPM\test-plans\qa-chain\epm-stage1-save-draft-remainder.spec.ts:81:209

### TC-108845 Edge — Draft survives session logout and login
**Mode:** playwright-script
**Duration:** 25.5s
- [PASS] TC-108845 Edge — Draft survives session logout and login

### TC-108846 Integration — Draft state does not appear in Sent items view
**Mode:** playwright-script
**Duration:** 34.8s
- [FAIL] TC-108846 Integration — Draft state does not appear in Sent items view

**Error:**
```
Error: STEP EXPECTED (per ADO): a Saved-but-not-Submitted draft should appear in Drafts — CONFIRMED GAP: Drafts view is permanently empty, the Status:Draft value never gets surfaced there

[2mexpect([22m[31mreceived[39m[2m).[22mtoBeTruthy[2m()[22m

Received: [31mfalse[39m

  160 |     const inDrafts = draftsBody.includes(REF_NO);
  161 |     console.log(`STEP ACTUAL — ${REF_NO} appears in Drafts: ${inDrafts}.`);
> 162 |     expect.soft(inDrafts, 'STEP EXPECTED (per ADO): a Saved-but-not-Submitted draft should appear in Drafts — CONFIRMED GAP: Drafts view is permanently empty, the Status:Draft value never gets surfaced there').toBeTruthy();
      |                                                                                                                                                                                                                   ^
  163 |
  164 |     const cprAfter = await (await page.request.get(`${WF_API}/api/dynamic/Shesha.Workflow/WorkflowInboxItem/Crud/GetAll?maxResultCount=100`, { headers: stage1Auth })).json();
  165 |     const item = (cprAfter?.result?.items ?? []).find((i: any) => i.refNumber === REF_NO);
    at C:\Users\Boxfusion\Test-ReportsHub\projects\EPM\test-plans\qa-chain\epm-stage1-save-draft-remainder.spec.ts:162:211
```
**Location:** C:\Users\Boxfusion\Test-ReportsHub\projects\EPM\test-plans\qa-chain\epm-stage1-save-draft-remainder.spec.ts:162:211
