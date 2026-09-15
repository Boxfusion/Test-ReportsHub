# EPM — Output and Outcome linkage — KPI dropdown reflects new catalog entries

**ADO plan:** 108745 — *EPM-QA — Functional Test Plan v2.0 (2026-08-11 redesign baseline)*
**ADO suite:** *06 · EPM · Output and Outcome linkage — planning-only Components without Performance Report identifier*
**Environment:** QA — `https://pd-epm-adminportal-qa-wf.shesha.app` (API `https://pd-epm-api-qa-wf.shesha.app`)
**Login:** admin.PrincessH / 123qwe (administrator)
**Navigation:** EPM › EPM Administration › **Outputs & Outcomes** (create) → Manage Performance Reports → **Princess** → Build Tree → KPI node → KPI/KPA tab (verify)

> This spec never had a paired canonical `.md` — this file backfills it. **ADO is canonical.**

## TC-108824 — Edge — A newly-created Outcome appears in the KPI's Outcome dropdown

**ADO ID:** 108824 · **Priority:** 2 · **Tags:** EPM-Redesign-2026-08-11; Edge
**Coverage dimension:** Edge

### Steps (adapted, per case owner's clarification 2026-08-30)

| # | Action | Expected |
|---|--------|----------|
| 1 | Create a new Outcome on the "Outputs & Outcomes" catalog page. | Save succeeds. |
| 2 | Open a KPI's Outcome dropdown (KPI/KPA tab) and search for the new Outcome's name. | The new Outcome is selectable. |

### Corrected framing, 2026-08-30

Per the case owner: "the link comes from output&outcome. i created an outcome called checkout & went to
the kpi dropdown & it showed. that what the tc is about." Earlier framing of this case chased a
`ComponentOutputOutcome` junction tab/row as the mechanism (see
[[epm-component-output-outcome-junction-not-used]], kept as a separate, real but different finding — that
entity genuinely is unused anywhere in the app). **That was the wrong mechanism.** The actual claim is
much simpler: the KPI's Outcome dropdown reads live from the Outputs & Outcomes catalog, so a newly
created entry there should immediately become selectable.

### Result — PASS, confirmed live 2026-08-30

Created a disposable Outcome ("TC108824 Verify \<token\>") via the Outputs & Outcomes "Add" form, then
opened Princess's KPI ("Percentage compliance with statutory prescripts") and searched its Outcome
dropdown for that exact name — **it appeared immediately as a selectable option.** Matches the case
owner's own manual verification (creating an Outcome named "checkout" and seeing it show up the same way).
No defect — this is the app working correctly as designed.

### Unique inputs
| Field | Value |
|---|---|
| Report/KPI used for verification | `Princess` → `Percentage compliance with statutory prescripts` |
| Disposable Outcome name | `TC108824 Verify <token6>` |

### Notes
- **Writes then deletes 1 disposable Outcome Component per run** — cleaned up via API `Delete` in a
  `finally` block regardless of pass/fail. Princess's KPI itself is not modified (the Outcome is never
  actually selected/saved on it, only confirmed present in the dropdown's option list).
