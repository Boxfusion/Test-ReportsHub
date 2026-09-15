# EPM — Progress Reporting Periods — skip toggle clears dependent fields

**ADO plan:** 108745 — *EPM-QA — Functional Test Plan v2.0 (2026-08-11 redesign baseline)*
**ADO suite:** *11 · EPM · Progress Reporting Periods configuration tab*
**Environment:** QA — `https://pd-epm-adminportal-qa-wf.shesha.app` (API `https://pd-epm-api-qa-wf.shesha.app`)
**Login:** admin.PrincessH / 123qwe (administrator)
**Navigation:** Manage Performance Reports → **Princess** → Build Tree → KPI node → **Progress Reporting Periods** tab

> This spec never had a paired canonical `.md` — this file backfills it from the spec's own ADO-derived
> comments and this session's live findings. **ADO is canonical.**

## TC-109463 — Edge — Toggling skipReportingThisPeriod clears indicatorTarget and resets poeRequired

**ADO ID:** 109463 · **Priority:** 2 · **Tags:** EPM-Redesign-2026-08-11; Edge
**Coverage dimension:** Edge

### Preconditions (ADO literal)
- A Reporting Period (ADO says "Q2") has an active target set.

### Steps (ADO literal)

| # | Action (ADO literal) | Expected (ADO literal) |
|---|--------|----------|
| 1 | Toggle "Skip Reporting This Period" to true on the period. Save. | Save succeeds. |
| 2 | Confirm via `ComponentProgressReport/Crud/GetAll`. | `indicatorTarget` clears to null; `poeRequired` resets to false. |

### Precondition adapted — Q1, not Q2 (per case owner, 2026-08-18)

The real report used across this suite ("Princess") only has a **Q1** Progress Reporting Period row, not
Q2 — per the case owner's direction, this spec targets Q1 instead (see
`epm-kpi-progress-reporting-periods-tab` memory).

### Confirmed live 2026-08-18 — no clearing/reset behavior exists

After checking "Skip Reporting This Period" and saving: `skipReportingThisPeriod` persists correctly as
`true`, but `indicatorTarget` and `poeRequired` are **unchanged** — ADO expects them to auto-clear/reset as
a side effect, and they don't. Confirmed genuine missing side-effect, not flaky — asserted via
`expect.soft` (the hard assertion on `skipReportingThisPeriod` itself passes).

**Script gotcha:** checking "Skip Reporting This Period" makes **"Skip Reason" required (min 20
characters)** — if left empty, the modal silently refuses to close/submit (no network request at all on
the outer Save). Fill Skip Reason (≥20 chars) whenever toggling skip to true.

### Precondition rebuilt 2026-08-30 — Princess's tree was rebuilt earlier this session

Princess's Reporting Tree was rebuilt from scratch in an earlier session on 2026-08-28 (the original KPI
node was lost along with the rest of the old tree — see `epm-princess-tree-rebuilt-real-hierarchy`
memory). A KPI node ("Percentage compliance with statutory prescripts") and its Q1
`ComponentProgressReport` row now exist again (created by later TC-109461/TC-109462 runs), but its
`indicatorTarget`/`poeRequired` had reset to `null`/`false` — reseeded directly via API
(`indicatorTarget: 10, poeRequired: true`) immediately before this run, to restore the "active target"
precondition ADO's case actually needs.

### Notes
- **Mutates a real, shared row** (Princess's Q1 `ComponentProgressReport` for its one real KPI) — no
  disposable fixture, matching TC-109461/TC-109462's own convention for this suite. Not cleaned up/reset
  afterward, since `skipReportingThisPeriod: true` is itself a legitimate state for this shared row to be
  left in (same as other Progress Reporting Periods specs in this suite).
