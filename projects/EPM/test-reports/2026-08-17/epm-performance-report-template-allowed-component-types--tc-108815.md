# Report: EPM — TC-108815 Edge — Allowed Component Type list rejects a duplicate Component Type entry

**Date:** 2026-08-17 07:39 UTC
**Plan:** test-plans/hierarchy-definitions/epm-performance-report-template-allowed-component-types.md
**Spec:** test-plans/hierarchy-definitions/epm-performance-report-template-allowed-component-types.spec.ts
**Cases:** TC-108815
**Execution Mode:** ai-driven (headed Chromium via Playwright, single test case only, `-g "TC-108815"`)
**Result:** PASSED
**Duration:** ~24.4s (`1 passed (27.1s)`)
**Verdict:** the Performance Report Template details view correctly rejects a duplicate Component Type
entry — attempting to add "Department" a second time to a template that already has it returns
`HTTP 400` from `PerformanceReportAllowedComponentType/Crud/Create`, no second junction row is persisted,
and the original row's `canBeRoot` value is untouched even though the rejected attempt used a different
value. No defect found.

**ADO:** org `boxfusion` · project **PD-Epm** · plan **108745** (*EPM-QA — Functional Test Plan v2.0*) ·
suite **109508** (*03 · EPM · Performance Report Template — allowed Component Type + canBeRoot invariants*) ·
case **108815**
**Environment:** QA — `https://pd-epm-adminportal-qa.shesha.app` · API `https://pd-epm-api-qa.shesha.app`
**Login:** admin.PrincessH / 123qwe (administrator)
**Navigation:** Epm › Adminstration › Performance Report Template → `/dynamic/Epm/perfomance-report-template`
→ **+ Add** (precondition setup) → the template's details view for STEPS 2–4

## Summary

| Total Assertions | Passed | Failed | Skipped |
|------------------|--------|--------|---------|
| 4 | 4 | 0 | 0 |

Only test case 108815 was executed.

## Precondition setup (not the graded claim, but load-bearing context)

ADO's precondition ("A Performance Report Template already has Department as an Allowed Component Type")
requires a template that already carries one row before the duplicate attempt can even be exercised.
Built live: created a disposable template via **+ Add**, then added a single Department row
(`canBeRoot=false`) via the details view's Allowed Component Types grid, reusing the mechanism already
proven correct in TC-108779/TC-108814.

## Step Results

### PRECONDITION
- [PASS] Created disposable template (id `f128ae6f-d56d-45fe-ab1e-be4ca581f2ce`)
- [PASS] Added first Department row, `canBeRoot=false` (junction id `e26dcf88-5f57-4d1c-9652-f9d8fb5cb962`)

### STEP 2 — Attempt to add Department a second time to the same template.
- Repeated the same Add flow, selecting Department again — this time with `canBeRoot=true` (deliberately
  flipped from the first row, so STEP 4 also proves the rejected attempt didn't clobber the original
  value)
- **[PASS] EXPECTED: the form rejects with a unique-constraint error on the PerformanceReportAllowedComponentType
  junction** — `POST .../PerformanceReportAllowedComponentType/Crud/Create` → **HTTP 400**, no junction id
  returned, modal remained open

### STEP 3 — Confirm via GetAll that only one junction row exists for Department.
- **[PASS] EXPECTED: row count for that junction is unchanged** — `PerformanceReportAllowedComponentType/Crud/GetAll`
  returned exactly 1 row for `{template: f128ae6f…, type: Department}` after the rejected attempt

### STEP 4 — Confirm the canBeRoot value on the existing row is untouched.
- **[PASS] EXPECTED: the pre-existing row is intact** — the surviving row's `canBeRoot` is still `false`,
  confirming the rejected duplicate (submitted with `canBeRoot=true`) had no side effect on the original row

## Test data left in QA

None. The disposable template and its one junction row were deleted in `finally` regardless of outcome.

| Field | Value | Fate |
|---|---|---|
| Template | `TC108815 Duplicate Reject 352427` (id `f128ae6f-d56d-45fe-ab1e-be4ca581f2ce`) | deleted (cleanup) |
| Junction | Department, canBeRoot=false (id `e26dcf88-5f57-4d1c-9652-f9d8fb5cb962`) | deleted (cleanup) |

## Reproduction

```bash
# from the hub root
HUB_PROJECT=EPM HEADED=1 PW_CHANNEL=chromium npx playwright test \
  projects/EPM/test-plans/hierarchy-definitions/epm-performance-report-template-allowed-component-types.spec.ts -g "TC-108815"
```

## Azure DevOps publication

Not attempted — the ADO PAT used for this project is deliberately read-only by design.
