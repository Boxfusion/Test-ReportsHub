# EPM — KPI/KPA identity tab — Method of Calculation text reclassification

**ADO plan:** 108745 — *EPM-QA — Functional Test Plan v2.0 (2026-08-11 redesign baseline)*
**ADO suite:** *10 · EPM · KPI/KPA identity tab — Method of Calculation, Reporting Cycle, Aggregation, Weighting*
**Environment:** QA — `https://pd-epm-adminportal-qa-wf.shesha.app` (API `https://pd-epm-api-qa-wf.shesha.app`)
**Login:** admin.PrincessH / 123qwe (administrator)
**Navigation:** Epm › **EPM Administration** › Component Definitions → **Add**

> This spec never had a paired canonical `.md` — this file backfills it from the spec's own ADO-derived
> comments and this session's live findings. **ADO is canonical.**

## TC-109459 — Edge — Method of Calculation text containing "Qualitative" should reclassify the KPI type

**ADO ID:** 109459 · **Priority:** 2 · **Tags:** EPM-Redesign-2026-08-11; Edge
**Coverage dimension:** Edge

### Preconditions (ADO literal)
- A Quantitative KPI Component Definition exists.

### Steps (ADO literal)

| # | Action (ADO literal) | Expected (ADO literal) |
|---|--------|----------|
| 1 | Set Method of Calculation to "Qualitative: measured by narrative report". Save. | Save succeeds. |
| 2 | Confirm the KPI reclassifies to Qualitative type. | Numeric target fields hide; an Achievements narrative field appears. |

### Confirmed live 2026-08-18 — no such behavior exists

Method of Calculation lives on the Component Definition (Calculation Details section), per
[[epm-kpi-kpa-identity-tab-fields-missing]] — it is a plain free-text field with no parsing or side
effects at all. Setting it to the exact ADO-specified trigger text and saving leaves `componentType`
unchanged (`"Quantitative KPI"`), confirmed both via `ComponentDefinition/Crud/GetAll` and in the UI after
a full page reload. `componentType` is its own independently-selected field, set once at creation — there
is no cross-field derivation logic reading Method of Calculation's text at all.

**This reads as a fictional/aspirational test case, not a real regression** — the rule it describes was
seemingly never built, same category as [[epm-canberoot-leaf-rejection-not-implemented]] and
[[epm-allowable-child-self-reference-not-rejected]]. The spec documents this via `expect.soft` (both the
persisted-data and UI non-reclassification checks) so it stays a visible signal without being conflated
with a genuine regression.

### Unique inputs
| Field | Value |
|---|---|
| Component Definition Name | `Reclass Test <token6>` |
| Component Type | `Quantitative KPI` |
| Trigger text | `Qualitative: measured by narrative report` |

### Notes
- **Writes then deletes 1 disposable Component Definition per run** — cleaned up via API `Delete` in a
  `finally` block regardless of pass/fail.
