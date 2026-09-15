# EPM — Unit of Measure management

**ADO plan:** 108745 — *EPM-QA — Functional Test Plan v2.0 (2026-08-11 redesign baseline)*
**ADO suite:** 109506 — *01 · EPM · Unit of Measure management — reference data feeding Component Definition Calculation Details*
**Parent suite:** Phase 01 · EPM · Foundation · Reference Data
**Environment:** QA — `https://pd-epm-adminportal-qa.shesha.app` (API `https://pd-epm-api-qa.shesha.app`)
**Login:** admin.PrincessH / 123qwe (administrator)
**Navigation:** Epm › **Adminstration** › Unit of Measure → `/dynamic/Epm/unit-of-measure`

> This plan mirrors the Azure DevOps test cases in suite 109506. **ADO is canonical** — edit the test
> cases there, then re-mirror here. Steps below are transcribed verbatim from the ADO
> `Microsoft.VSTS.TCM.Steps` field.

## TC-109437 — Create Unit of Measure with Name, Description, Prefix, Suffix (all 3+ chars)

**ADO ID:** 109437 · **Point:** 31271 · **Priority:** 2 · **Tags:** EPM-Redesign-2026-08-11; Positive
**Coverage dimension:** Positive

### Preconditions
- Signed in as administrator.
- Unit of Measure list at `/dynamic/Epm/unit-of-measure`.

### Steps

| # | Action | Expected |
|---|--------|----------|
| 1 | Click **+ Add** and fill Name equals `"Hours"`, Description, Prefix, Suffix (each ≥ 3 chars). | Modal **Create** button enabled. |
| 2 | Click **Create**. | Success toast. Row visible in list. |
| 3 | Verify via **UnitOfMeasure Crud GetAll**. | Record persists with the 4 fields. |

### Data used
| Field | Value |
|---|---|
| Name | `Hours` |
| Description | `Hours unit of measure` |
| Unit Prefix | `HRS` |
| Unit Suffix | `hrs` |

> **This run seeds the `"Hours"` fixture** that TC-109439 depends on — see
> [epm-unit-of-measure-duplicate-name.md](epm-unit-of-measure-duplicate-name.md).

## Sibling cases in the same suite

| ADO ID | Point | Title | Where |
|---|---|---|---|
| 109439 | 31273 | Duplicate Unit of Measure Name is rejected by unique constraint | [epm-unit-of-measure-duplicate-name.md](epm-unit-of-measure-duplicate-name.md) — own plan/spec pair |
| 109440 | 31274 | Unit of Measure appears in Component Definition Calculation Details dropdown | not yet mirrored |
