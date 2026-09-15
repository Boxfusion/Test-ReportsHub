# EPM — Unit of Measure appears in Component Definition Calculation Details dropdown

**ADO plan:** 108745 — *EPM-QA — Functional Test Plan v2.0 (2026-08-11 redesign baseline)*
**ADO suite:** 109506 — *01 · EPM · Unit of Measure management — reference data feeding Component Definition Calculation Details*
**Parent suite:** Phase 01 · EPM · Foundation · Reference Data
**Environment:** QA — `https://pd-epm-adminportal-qa.shesha.app` (API `https://pd-epm-api-qa.shesha.app`)
**Login:** admin.PrincessH / 123qwe (administrator)
**Navigation:** Epm › **Adminstration** › Component Definition → `/dynamic/Epm/component-definition-table` → **+ Add**

> Mirrors a single ADO test case from suite 109506. **ADO is canonical** — edit the test case there, then
> re-mirror here. Steps are transcribed verbatim from `Microsoft.VSTS.TCM.Steps`.
>
> One case per plan/spec pair: the hub derives the spec as `<plan>.md → <plan>.spec.ts`, so a separate
> pair keeps this flow independently runnable and reportable. Siblings:
> [epm-unit-of-measure.md](epm-unit-of-measure.md) (TC-109437) and
> [epm-unit-of-measure-duplicate-name.md](epm-unit-of-measure-duplicate-name.md) (TC-109439).

## TC-109440 — Unit of Measure appears in Component Definition Calculation Details dropdown

**ADO ID:** 109440 · **Point:** 31274 · **Priority:** 2 · **Tags:** EPM-Redesign-2026-08-11; integration
**Coverage dimension:** Integration

### Preconditions
- A Unit of Measure `"Percentage"` exists.
  **It did not exist in QA on 2026-08-12** — QA held `Emmanuel`, `Princess`, `Hours` and two `Hours-*`
  rows. The spec therefore **seeds `"Percentage"` via `UnitOfMeasure/Crud/Create` if absent** and logs
  whether it was pre-existing or seeded. Seeding is fixture setup, not part of the assertions.

### Steps

| # | Action | Expected |
|---|--------|----------|
| 1 | Open a Component Definition create form. | Calculation Details section is visible. |
| 2 | Open the Unit of Measure dropdown. | `"Percentage"` appears as a selectable option. |

### Form under test — `Add New Record` modal
Three collapsible sections; the dropdown under test lives in the middle one:

| Section | Fields |
|---|---|
| Component Definition Details | Ref No\*, Name\*, Component Type\*, Description\* |
| **Calculation Details** | **Unit Of Measure**, Variance Calculation Type, Calculation Type, Method Of Calculation |
| Additional Information | Purpose, Means Of Verification, What Measured |

Note the app labels it **"Unit Of Measure"** (capital *Of*), while the ADO case says "Unit of Measure".

### Fixture data (seeded only if missing)
| Field | Value |
|---|---|
| Name | `Percentage` |
| Description | `Percentage unit of measure` |
| Unit Prefix | `PCT` |
| Unit Suffix | `pct` |

### Notes
- **Creates no Component Definition.** The case only inspects the dropdown, so the spec selects
  `"Percentage"` to prove it is genuinely selectable and then **cancels** the modal.
- Options render in an antd portal (`.ant-select-dropdown`) attached to `body`, **outside** the modal —
  they must be queried at page level, not scoped to `.ant-modal-content`.
