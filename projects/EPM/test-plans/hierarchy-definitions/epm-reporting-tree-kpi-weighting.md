# EPM — Reporting Tree seeding — KPI Weighting field via Add Child Item

**ADO plan:** 108745 — *EPM-QA — Functional Test Plan v2.0 (2026-08-11 redesign baseline)*
**ADO suite:** *09 · EPM · Reporting Tree seeding — Build Tree action + Add Top Level Item / Add Child Item + KPI Weighting field*
**Environment:** QA — `https://pd-epm-adminportal-qa-wf.shesha.app` (API `https://pd-epm-api-qa-wf.shesha.app`)
**Login:** admin.PrincessH / 123qwe (administrator)
**Navigation:** Manage Performance Reports → **Princess** → Build Tree

> This spec never had a paired canonical `.md` — this file backfills it from the spec's own ADO-derived
> comments and this session's live findings. **ADO is canonical.**

## TC-109456 — Integration — KPI Weighting field persists alongside Annual Target

**ADO ID:** 109456 · **Priority:** 2 · **Tags:** EPM-Redesign-2026-08-11; integration
**Coverage dimension:** Integration

### Preconditions (ADO literal)
- A Reporting Tree exists with Department > Programme > Sub-Programme seeded.

### Steps (ADO literal)

| # | Action (ADO literal) | Expected (ADO literal) |
|---|--------|----------|
| 1 | Add a KPI node under Sub-Programme via Add Child Item. Fill Annual Target and Weighting. | Fields accept input. |
| 2 | Save the node. | Save succeeds. |
| 3 | Verify via `Component/Crud/GetAll` that the Weighting field is populated. | `perfIndexWeight` is populated on the persisted record. |

### Re-targeted 2026-08-28 to use the real "Princess" tree

Per the case owner's direction ("Add child item on e.g Princess & follow the test case"), this spec
targets the real **"Princess"** report's own permanent tree — **Department of Human Settlements →
Administration (Programme) → Executive Support (Sub Programme)** — kept permanently since 2026-08-28
specifically so tests like this one can reuse it (see `epm-princess-tree-rebuilt-real-hierarchy` memory),
instead of building a disposable Department/Programme/Sub-Programme chain from scratch every run. Only the
newly-added KPI Component is disposable and cleaned up afterward — Princess's own three nodes are never
touched.

### Mechanism — "Add Child Item" is genuinely used at this one level

Per the case owner's earlier note (see `epm-reporting-tree-refno-not-propagated` memory): unlike
Department/Programme/Sub-Programme additions (which all go through "Add Top Level Item" repeatedly with
the parent node selected), a KPI under Sub-Programme is the one level actually added via **"Add Child
Item"**, offering Quantitative KPI / Qualitative KPI. This is notable given "Add Child Item"'s dropdown is
separately documented as broken in the Reporting Tree Seeding folder's other specs (see
`epm-add-child-item-dropdown-defect` memory) — this case tests whether that holds here too, or whether
this specific parent/child combination behaves differently.

### Unique inputs
| Field | Value |
|---|---|
| Target report | `Princess` (`bc34f55d-bb32-4629-bd74-3e03250e4784`), real permanent tree |
| Parent node | `Executive Support` (Sub Programme) |
| KPI Ref No | `QKPI_1` — "Percentage compliance with statutory prescripts" (real, confirmed live 2026-08-28) |
| Annual Target | `100` |
| Weighting | `100` |

### Result — PASS, reconfirmed with hard value checks

First run only logged that Annual Target/Weighting "accepted input" without asserting the values actually
held right before Save — caught by the user. Re-ran with explicit `toHaveValue()` checks immediately after
each fill and again right before clicking Save: both genuinely held `100` throughout, no silent clearing.
The persisted record confirms `perfIndexWeight: 100` and `finalIndicatorTargetText: "100"` — **Annual
Target lands in the text-mirror field, not the numeric `finalIndicatorTarget` field**, which is how this
KPI form actually stores it, not a sign the fill failed. STEP 3 now hard-asserts against whichever field
holds the value instead of only logging it.

**Notable nuance:** "Add Child Item"'s dropdown rendered correctly here (Sub Programme → KPI), contradicting
the `epm-add-child-item-dropdown-defect` finding from the Department level — that defect appears to be
level-specific, not universal (see the memory's 2026-08-28 correction).

### Notes
- **Writes then deletes only the disposable KPI Component** per run — Princess's Department/
  Administration/Executive Support nodes are permanent fixtures, never deleted here.
