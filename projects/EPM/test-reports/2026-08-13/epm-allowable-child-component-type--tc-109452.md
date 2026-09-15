# Report: EPM — TC-109452 Integration — Allowable Child Component Type list drives the Reporting Tree builder allowed operations

**Date:** 2026-08-14 09:41 UTC
**Plan:** test-plans/hierarchy-definitions/epm-allowable-child-component-type.md
**Spec:** test-plans/hierarchy-definitions/epm-allowable-child-component-type.spec.ts
**Cases:** TC-109452
**Execution Mode:** ai-driven (headed Chromium via Playwright, single test case only, `-g "TC-109452"`)
**Result:** FAILED at step 3 (functionality not implemented — confirmed bug); step 2 PASSED
**Duration:** ~3.1m (`1 failed`)
**Verdict:** the Allowable Child Component Type list correctly and exactly drives what the Reporting
Tree builder considers legal (step 2 passes cleanly). But the server does **not** enforce that list when
bypassed directly via API — creating a Component with a type that isn't one of the parent's allowed
children **succeeds** rather than being rejected. Same pattern as TC-108808 and TC-109450.

**ADO:** org `boxfusion` · project **PD-Epm** · plan **108745** (*EPM-QA — Functional Test Plan v2.0*) ·
suite **109510** (*05 · EPM · Component Type — Allowable Child Component Type table*) · case **109452** ·
point **31258**
**Environment:** QA — `https://pd-epm-adminportal-qa.shesha.app` · API `https://pd-epm-api-qa.shesha.app`
**Login:** admin.PrincessH / 123qwe (administrator)

## Summary

| Total Assertions | Passed | Failed | Skipped |
|------------------|--------|--------|---------|
| ~10 | ~9 | 1 | 0 |

Only test case 109452 was executed.

## Investigation detour — why this test uses an isolated, disposable parent

An initial attempt against the real "Department" type (giving it a temporary 3rd allowable child)
returned only 2 of 3 configured legal options via the flattened API. Investigation (via direct API
calls, faster than repeated browser runs) traced this to **"Programme" currently being absent from
Emmanuel_template's own `PerformanceReportAllowedComponentType` list** — present at the very start of
this session, gone by the time this test was built. Confirmed reproducible even against a completely
independent, brand-new, childless Component Type unrelated to Department — ruling out any
"already-instantiated" theory. This is a live-data fact about the shared environment (likely a side
effect of separate manual testing happening in parallel), not something this session's automation
removed or should silently "fix." The test was redesigned around a fresh, disposable parent and 3 child
types confirmed currently registered (Sub Programme, Qualitative KPI, Department) to avoid depending on
that entry's state.

## Step Results

### Setup (not graded)
- [PASS] Created disposable parent Component Type
- [PASS] Added exactly 3 allowable children: Sub Programme, Qualitative KPI, Department
- [PASS] Created a fresh, childless top-level Component instance of the disposable type in the one real
  Performance Report (`Emmanuel_Test_Report`)

### STEP 2 — Open the Reporting Tree builder
- Verified via `GET .../PerformanceReportAllowedComponentTypes/GetFlattenedAllowedComponentTypesByTemplateId`
  (the endpoint that actually powers the tree builder's Add actions — the literal "Add Child Item"
  dialog is separately confirmed non-rendering, see `epm-add-child-item-dropdown-defect` memory; the
  tree builder UI was not touched at all here to avoid a separately-confirmed risk of silently creating
  orphan Components — see `epm-tree-builder-force-click-creates-orphans` memory)
- **[PASS] EXPECTED: exactly those 3 child types listed** — response contained exactly `Department`,
  `Sub Programme`, `Qualitative KPI` — no more, no less

### STEP 3 — Attempt to bypass by API POST with a disallowed type
- **ACTUAL:** `POST 200 https://pd-epm-api-qa.shesha.app/api/dynamic/Epm/Component/Crud/Create` with
  `componentType: Quantitative KPI` (not one of the 3 allowed types) as a child of the fresh parent
  **succeeded** — the Component was created
- **[FAIL] ADO EXPECTED:** "Server-side validation rejects" — no rejection occurred

## Test data left in QA

None. The bypass-created Component, the fresh top-level Component, and all 3 temporary
`AllowableChildComponentType` junctions were removed at the end of the run via a `finally` block. The
disposable parent Component Type itself was left in place, per this project's convention for created
Component Types.

## Reproduction

```bash
# from the hub root
HUB_PROJECT=EPM HEADED=1 PW_CHANNEL=chromium npx playwright test \
  projects/EPM/test-plans/hierarchy-definitions/epm-allowable-child-component-type.spec.ts -g "TC-109452"
```

## Azure DevOps publication

Not attempted — the ADO PAT used for this project is deliberately read-only by design. Point **31258**
is left untouched.
