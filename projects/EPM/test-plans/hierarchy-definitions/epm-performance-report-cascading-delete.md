# EPM — Performance Report creation — cascading delete of child Components/Progress Reports

**ADO plan:** 108745 — *EPM-QA — Functional Test Plan v2.0 (2026-08-11 redesign baseline)*
**ADO suite:** 109507 — *08 · EPM · Performance Report creation — planning shell*
**Parent suite:** Phase 01 · EPM · Foundation · Reference Data
**Environment:** QA — `https://pd-epm-adminportal-qa-wf.shesha.app` (API `https://pd-epm-api-qa-wf.shesha.app`)
**Login:** admin.PrincessH / 123qwe (administrator)
**Navigation:** Epm › **EPM Administration** › Manage Performance Reports → `/dynamic/Epm/perfomance-report-v2`

> This suite's 4 test cases (TC-108780, TC-108817, TC-108818, TC-108819) were built and run this
> engagement as standalone specs without ever getting a paired canonical `.md` — this file backfills
> TC-108819's own documentation from its spec's ADO-derived comments and this session's live findings, the
> same way TC-108817/TC-108818's were backfilled. **ADO is canonical.**

## TC-108819 — Integration — Cascading delete of a Performance Report removes all child Components and Progress Reports

**ADO ID:** 108819 · **Priority:** 2 · **Tags:** EPM-Redesign-2026-08-11; integration
**Coverage dimension:** Integration

### Preconditions (ADO literal)
- Signed in as administrator. A Performance Report exists with a Reporting Tree of 10 Components and 4
  Progress Reports.

### Steps (ADO literal)

| # | Action (ADO literal) | Expected (ADO literal) |
|---|--------|----------|
| 1 | Delete the Performance Report via the list Delete action. | A cascade-warning dialog appears, citing counts of child Components (10) and Progress Reports (4). |
| 2 | Confirm the delete. | The report and every child record are removed. |
| 3 | Verify via `Component`/`ProgressReport` GetAll that no records remain for the deleted identifier. | Both return zero for that identifier. |

### Precondition partially unbuildable — confirmed live 2026-08-17, 7 exploration rounds

The "10 Components" half of the precondition **cannot be built at all** against a freshly-created
Performance Report: `Component/Crud/Create`'s own foreign-key existence check can never find a
`PerformanceReport` created via the custom `CreatePerformanceReport` AppService, even though the exact
same id resolves fine via `PerformanceReport/Crud/Get` moments earlier. Tried nested `performanceReport:
{id}`, flat `performanceReportId`, and both API hosts — all fail identically. A componentType-only
Component create with no `performanceReport` link succeeds fine, isolating the failure specifically to
that FK reference. This looks like the custom AppService's write path populates a data context that
Component's generic dynamic-entity FK validator doesn't query. The spec attempts the seed anyway (documenting
whether the blocker still reproduces each run via `expect.soft`) and, when blocked as expected, proceeds
with 0 Components rather than skipping the case — still exercising the delete/cascade flow on the 4
Progress Reports, which **do** auto-generate correctly (the template's Quarter reporting cycle creates
exactly Q1–Q4 rows with no manual seeding needed).

### Confirmed genuine defects (live 2026-08-17, reconfirmed across runs)

1. **No cascade-warning dialog at all.** The delete confirmation is a generic antd Popconfirm reading only
   "Are you sure want to delete this item?" — no child-record counts, regardless of how many actually
   exist.
2. **The report itself IS correctly soft-deleted** (`isDeleted:true` confirmed via `Crud/Get` after
   confirming) — this part works.
3. **Progress Reports do NOT cascade.** All 4 auto-generated `ProgressReport` rows remain `isDeleted:false`
   — fully live and orphaned, directly contradicting ADO's "every child record removed"/"GetAll ...
   returns zero" steps.

See [[epm-performance-report-cascade-delete-broken]] memory for the full evidence trail, including a
2026-08-27 corroboration at scale: 14 of 37 real `Department`-typed `Component` rows in QA were found
referencing a deleted (nonexistent) report — the same defect class accumulating silently across this
whole engagement's wild data, not just this controlled run.

### Stale references found and fixed, 2026-08-28

- **API host mismatch**: `QA_API` was missing `-wf` (pointed at the wrong host that doesn't reflect the
  UI's actual writes) — fixed.
- **`PERIOD_ID`** (hardcoded "Financial Year 2026/27", id `8062531f-...`) resolves but is **soft-deleted**
  (`isDeleted:true`, deleted 2026-08-26) — see `epm-performance-report-period-covered-stale` memory. Fixed
  by building a fresh disposable Financial Year + Quarter period pair via API per run, same as
  TC-108817/TC-108818.
- **`DEPARTMENT_TYPE_ID`/`QKPI_TYPE_ID`** were the same stale ids already found dead earlier this engagement
  (see `epm-emmanuel-tree-hard-deleted` memory) — updated to the current real ids so the Component-seeding
  attempt fails (or succeeds) for the actual documented reason, not an unrelated bad-FK error.

### Unique inputs
| Field | Value |
|---|---|
| Report Name | `Cascade Delete Test <token6>` |
| Report Short Name | `CD<token6>` |
| Period Covered | `TC108819 FY <token6>` (disposable, built by this run) |
| Template | `Standard Annual Performance Plan` (stable, non-disposable catalog template, id `77a75071-...`) |
| Attempted Components | 1 Department root + 9 Quantitative KPI children (blocked from ever seeding — see above) |

### Notes
- **Writes then deletes**: 1 disposable Financial Year period, 4 disposable Quarter child periods, 1
  disposable Performance Report, and (now that seeding works — see below) 10 disposable Components per
  run — all cleaned up via API `Delete` in a `finally` block regardless of pass/fail. The 4 auto-generated
  Progress Reports are expected to survive the report's own delete (the confirmed defect) and are cleaned
  up directly in the same `finally` block since they don't self-cascade.
- Known nav flake (~1/3 of runs): the EPM Administration flyout occasionally lands on the workflows-inbox
  page instead of Manage Performance Reports — a plain re-run is the accepted fix (see
  `epm-performance-report-modal-and-nav-quirks` memory).
- The "Manage Performance Reports" list is paginated (29 items, 10/page, not sorted newest-first) — search
  by name before locating the disposable report's row, don't assume it's on page 1.
- A disposable Financial Year period needs **all 4 Quarter children**, not just one — the report's
  auto-generated Progress Reports mirror the Period Covered's own child periods one-for-one.

### MAJOR CORRECTION, 2026-08-28 — the "Components can never attach to a fresh report" blocker is stale

Reconfirmed live, twice, end-to-end: with the stale `DEPARTMENT_TYPE_ID`/`QKPI_TYPE_ID` ids swapped for
their current real equivalents (the 2026-08-17 run's ids no longer exist at all — see
`epm-emmanuel-tree-hard-deleted` memory), **`Component/Crud/Create` against a `CreatePerformanceReport`-made
report succeeded both times**, seeding a full 10-Component tree (1 root + 9 KPI) with no FK rejection.
Whether this reflects a genuine app-side fix since 2026-08-17 or was partly an artifact of that
investigation's own conditions is unclear, but **the precondition is buildable now** — see
`epm-performance-report-cascade-delete-broken` memory for the full correction. Any future test needing a
populated tree on a fresh report should try building it directly rather than assuming this old blocker
still applies.

**This also directly confirms (not just via wild-data inference) that Components fail to cascade-delete,
exactly like Progress Reports:** all 10 seeded Components remained `isDeleted:false` after the parent
report's delete, reproduced twice. Final status for this case is unchanged (`defect`) — the underlying
cascade-delete gap is real and now proven under full experimental control for both entity types ADO's
case names.
