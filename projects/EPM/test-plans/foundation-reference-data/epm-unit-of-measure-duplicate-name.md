# EPM — Unit of Measure duplicate name (unique constraint)

**ADO plan:** 108745 — *EPM-QA — Functional Test Plan v2.0 (2026-08-11 redesign baseline)*
**ADO suite:** 109506 — *01 · EPM · Unit of Measure management — reference data feeding Component Definition Calculation Details*
**Parent suite:** Phase 01 · EPM · Foundation · Reference Data
**Environment:** QA — `https://pd-epm-adminportal-qa.shesha.app` (API `https://pd-epm-api-qa.shesha.app`)
**Login:** admin.PrincessH / 123qwe (administrator)
**Navigation:** Epm › **Adminstration** › Unit of Measure → `/dynamic/Epm/unit-of-measure`

> This plan mirrors a single Azure DevOps test case from suite 109506. **ADO is canonical** — edit the
> test case there, then re-mirror here. Steps are transcribed verbatim from the ADO
> `Microsoft.VSTS.TCM.Steps` field.
>
> Split into its own plan/spec pair (rather than living alongside TC-109437) because the hub pairs
> exactly one spec to one plan: `run-plan.js` derives the spec as `<plan>.md → <plan>.spec.ts`. One case
> per pair keeps each flow independently runnable and independently reportable on the dashboard.
> The positive create case is [epm-unit-of-measure.md](epm-unit-of-measure.md).

## TC-109439 — Duplicate Unit of Measure Name is rejected by unique constraint

**ADO ID:** 109439 · **Point:** 31273 · **Priority:** 2 · **Tags:** Edge; EPM-Redesign-2026-08-11
**Coverage dimension:** Edge

### Preconditions
- Unit `"Hours"` already exists.
  **TC-109437 seeds it** — see [epm-unit-of-measure.md](epm-unit-of-measure.md). The spec asserts this
  against `UnitOfMeasure/Crud/GetAll` before touching the UI, so a missing fixture fails as a
  precondition rather than masquerading as "the duplicate was allowed".

### Steps

| # | Action | Expected |
|---|--------|----------|
| 1 | Attempt Create another `"Hours"`. | Response returns unique-constraint error. |
| 2 | Confirm no duplicate row. | List still has one `"Hours"` row. |

### Data used
| Field | Value |
|---|---|
| Name | `Hours` — **must collide; do not randomise.** Override only via `TC_UOM_DUP_NAME`. A unique name makes the test vacuous. |
| Description | `Duplicate attempt — TC-109439` |
| Unit Prefix | `DUP` |
| Unit Suffix | `dup` |

The non-name fields deliberately differ from TC-109437's so that any row which *did* get written would be
unambiguously identifiable as this case's.

### Notes
- **Writes nothing when it passes** — the create is rejected, so this case is safe to re-run repeatedly
  and leaves the QA record count unchanged.
- The uniqueness check is **server-side**: the modal's `Create` button is enabled, and the rejection
  arrives as an ABP validation error (`HTTP 400`, `validationErrors[].members: ["name"]`).
