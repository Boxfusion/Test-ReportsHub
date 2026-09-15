# EPM — Sum Aggregation across Sub-Programmes

**ADO plan:** 108745 — *EPM-QA — Functional Test Plan v2.0 (2026-08-11 redesign baseline)*
**ADO suite:** 109536 — *33 · Achievement percentage calculation*
**Environment:** QA — `https://pd-epm-api-qa-wf.shesha.app` (API-level, read-only)
**Login:** admin.PrincessH / 123qwe

## TC-108889 — Integration — Sum Aggregation across multiple Sub-Programmes

**ADO ID:** 108889 · **Coverage dimension:** Integration

### Preconditions (ADO literal)
- 3 Sub-Programme sub-KPIs with values that sum to 30 at the parent level.

### Steps (ADO literal)

| # | Action (ADO literal) | Expected (ADO literal) |
|---|--------|----------|
| 1 | Configure Sum Aggregation on a parent KPI with 3 sub-KPI children. | Parent value = sum of children (30). |

### Result — CONFIRMED UNBUILT, ruled out at the data layer

Checked whether the feature could exist in principle before attempting a live fixture:

- `Epm.CalculationType` (the only real calculation-type reflist on `ComponentDefinition`) has exactly 2
  values: `Cummulative` / `Non Cummulative` — no "Sum Aggregation" or per-entity rollup value exists at
  all. This reflist governs cumulative-across-Periods behavior (the same dead-code path already
  confirmed for TC-109460, see [[epm-aggregation-type-periods-dead-code]]), not summing sibling KPIs.
- `Epm.VarianceCalculationType` (`Curry Over` / `Non Curry Over`) is unrelated.
- Of 58 real `ComponentDefinition` records in the tenant, only 2 have any `calculationType` set
  (both `Cummulative`) — zero use anything Sum/rollup-like.
- 3 plausible route names for a sum-aggregation calculation endpoint all return genuine `404`.

No reflist value, no real KPI configuration, and no backend endpoint represents "Sum Aggregation across
Sub-Programme sub-KPIs" anywhere in this build.

### Unique inputs
| Field | Value |
|---|---|
| Reflist checked | `Epm.CalculationType` |
| ComponentDefinition records surveyed | 58 (all real, live tenant data) |

### Notes
- Read-only — no data created or mutated.
- Closes out suite 109536: TC-108803/887/888 confirmed defects, TC-108889 confirmed unbuilt.
