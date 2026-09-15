# EPM — Component Actioner assignment — Stages 1 to 5 with correct action level

**ADO plan:** 108745 — *EPM-QA — Functional Test Plan v2.0 (2026-08-11 redesign baseline)*
**ADO suite:** *07 · EPM · Component Actioner assignment — Stages 1 to 5 with action level 20 to 60*
**Environment:** QA — `https://pd-epm-adminportal-qa-wf.shesha.app` (API `https://pd-epm-api-qa-wf.shesha.app`)
**Login:** admin.PrincessH / 123qwe (administrator)
**Navigation:** Manage Performance Reports → **Princess** → Build Tree → KPI node → Component Actioners tab

> This spec never had a paired canonical `.md` — this file backfills it. **ADO is canonical.**

## TC-108783 — Positive — Assign Component Actioners for Stages 1 to 5 with the correct action level

**ADO ID:** 108783 · **Priority:** 2 · **Tags:** EPM-Redesign-2026-08-11; Positive
**Coverage dimension:** Positive

### Preconditions (ADO literal)
- A KPI Component with an empty Component Actioners tab. The six real Person "actioner" records per
  stage already exist tenant-wide.

### Steps (ADO literal)

| # | Action (ADO literal) | Expected (ADO literal) |
|---|--------|----------|
| 1 | Navigate to the Component Actioners tab. | Empty. |
| 2 | Add five Component Actioner rows: Stage 1@20 through Stage 5@60. | Each row saves successfully. |
| 3 | Verify via `ComponentActioner/Crud/GetAll` filtered by componentId. | Exactly 5 rows persist with action levels 20/30/40/50/60; Stage 6 (70) absent. |

### Corrected mapping, 2026-08-31 — the "Actioner Level" dropdown labels ARE correct reference data

Earlier investigation (2026-08-18) typed the raw numbers (20/30/40/50/60) into the "Actioner Level"
select and found none matched, concluding the field was bound to the wrong reference data. **Per the case
owner, this was the test's own mistake, not an app defect** — the dropdown's labels are the correct picks,
one per stage:

| Stage | Actioner (Person) | Actioner Level label | Numeric `actionLevel` |
|---|---|---|---|
| 1 | Stage 1 Process Owner | `Outstanding` | 20 |
| 2 | Stage 2 Chief Director | `Awaiting Level One QA` | 30 |
| 3 | Stage 3 Branch Coordinator | `Awaiting Level Two QA` | 40 |
| 4 | Stage 4 Branch Manager | `Awaiting Level Three QA` | 50 |
| 5 | Stage 5 SPMR Unit | `Awaiting Level Four QA` | 60 |

Selecting the correct label per stage and saving should persist the corresponding numeric `actionLevel` —
confirming the label→integer mapping works correctly server-side.

### Precondition rebuilt 2026-08-31 — original target KPI's report is gone

The original target (KPI "Number of disaster awareness sessions conducted" on report "Nomfa") no longer
has an empty Component Actioners tab — it already has 5 rows from the earlier 2026-08-18 run (Stage 1
correctly shows `actionLevel: 20`; Stages 2-5 are `null`, from before this correction). "Nomfa" itself is
also now soft-deleted. Switched to the real, live **"Princess"** report's own KPI ("Percentage compliance
with statutory prescripts"), confirmed via GetAll to have zero existing `ComponentActioner` rows.

### Unique inputs
| Field | Value |
|---|---|
| Report | `Princess` (real, live) |
| KPI | `Percentage compliance with statutory prescripts` |

### Result — PASS, confirmed live 2026-08-31

Ran headed: all 5 stages selected their correct label and saved successfully. Verified via
`ComponentActioner/Crud/GetAll` — all 5 rows persisted with the exact correct numeric `actionLevel`:

```
Stage 1 Process Owner       -> actionLevel: 20
Stage 2 Chief Director      -> actionLevel: 30
Stage 3 Branch Coordinator  -> actionLevel: 40
Stage 4 Branch Manager      -> actionLevel: 50
Stage 5 SPMR Unit           -> actionLevel: 60
```

Stage 6 (level 70) correctly absent. Clean pass, no defect — the label→integer mapping works correctly.
(A tooling-only crash — an Allure screenshot-copy race, unrelated to the test's own assertions — obscured
the first run's real result; a second run's precondition check then correctly found the 5 rows already
persisted from that first run, confirming the same evidence.)

### Notes
- **Mutates a real, shared row** — adds 5 permanent `ComponentActioner` rows to Princess's KPI, matching
  this suite's own convention of leaving real linkage/config data in place. Not cleaned up. A future
  re-run of this exact spec will need a different, genuinely-empty KPI target, since Princess's KPI no
  longer starts empty.
- The "Manage Performance Reports" list is paginated — search by name before locating the report row.
- Script gotcha: the label is literally **"Actioner Level"**, not "Action Level" as ADO's title phrases
  it. Scope the Add-row locator to the Component Actioners grid panel specifically — the page also has an
  unrelated "Add Top Level Item" toolbar button matching a loose `/Add/i` filter.
