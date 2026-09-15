# EPM — Progress Reporting Periods — per-quarter Budget dashboard rollup

**ADO plan:** 108745 — *EPM-QA — Functional Test Plan v2.0 (2026-08-11 redesign baseline)*
**ADO suite:** *11 · EPM · Progress Reporting Periods configuration tab*
**Environment:** QA — `https://pd-epm-adminportal-qa-wf.shesha.app`
**Login:** admin.PrincessH / 123qwe (administrator)
**Navigation:** EPM › EPM Administration › **Dashboard** (submenu) › **Dashboard Analytics**

## TC-109464 — Edge — Per-quarter Budget rolls up to the dashboard

**ADO ID:** 109464 · **Priority:** 2 · **Tags:** EPM-Redesign-2026-08-11; Edge
**Coverage dimension:** Edge

### Preconditions (ADO literal)
- Multiple quarters have Budget values set.

### Steps (ADO literal)

| # | Action (ADO literal) | Expected (ADO literal) |
|---|--------|----------|
| 1 | Open the Performance Dashboard for a report. | Dashboard loads. |
| 2 | Confirm the per-quarter Budget figures roll up (e.g. an Annual Budget total). | A Budget rollup is shown. |

### Precondition corrected 2026-08-30 — a real dashboard exists, just not the one previously checked

Previously ledgered `blocked` on the finding that no Performance Dashboard page exists at all (see
`epm-performance-dashboard-page-does-not-exist` memory, suite 109537). That finding is **stale for this
case specifically**: the plain "Dashboard" nav entry is indeed still inert (clicking it lands on
`workflows-inbox`), but it's actually a **submenu header** — hovering/expanding it reveals a second,
previously-untried entry, **"Dashboard Analytics"**, which opens a real, working page: **"CPR Status
Dashboard"** at `/dynamic/Epm/component-progress-report`. It has genuine live data: Progress Report
Status / Achievement Status distribution pie charts, status tiles (Outstanding/Draft/In Progress/
Complete), and a KPI-by-quarter status table (531 real rows across all reports; 12 for a single selected
report in the run below).

### Result — CONFIRMED UNBUILT: no Budget content anywhere on the real dashboard

Checked the page both with no report selected (default, all-reports view) and with a real report selected
("Alex Report") — **zero mentions of "Budget" or "Annual" anywhere** on the page, in either state. The
dashboard tracks only status/achievement distributions and a plain KPI-by-quarter status table; there is
no tile, column, or summary section for Budget at all. This isn't a broken/partial rollup — the feature
described in ADO's case (a per-quarter Budget figure surfacing anywhere on this dashboard) was never built
on this page at all, same category as [[epm-kpi-method-of-calculation-text-reclassification-not-implemented]]
and [[epm-aggregation-type-periods-dead-code]].

### Unique inputs
| Field | Value |
|---|---|
| Dashboard route | `/dynamic/Epm/component-progress-report` ("Dashboard Analytics" / "CPR Status Dashboard") |
| Report tested | First available option in the "Performance report" selector (confirmed live: "Alex Report") |

### Notes
- **Read-only** — no data created or mutated by this spec.
- The plain "Dashboard" nav entry (as opposed to "Dashboard Analytics") remains inert, matching the
  original 2026-08-19 finding — that part of the old memory is still current, only the "no dashboard
  exists anywhere at all" framing was too broad.
