# EPM — Open Progress Report skipped KPI

**ADO plan:** 108745 — *EPM-QA — Functional Test Plan v2.0 (2026-08-11 redesign baseline)*
**ADO suite:** *109519 · EPM · Open Progress Report — per-stage inbox spawn verification*
**Environment:** `https://pd-epm-adminportal-qa-wf.shesha.app` (UI action) +
`https://pd-epm-api-qa-wf.shesha.app` (API verification)
**Login:** admin.PrincessH / 123qwe (administrator); then stage1 / 123qwe

> This spec never had a paired canonical `.md` — this file backfills it. **ADO is canonical.**
> Anchor: `ProgressReportsAppService.PublishProgressReportAsync:67-103`.

## TC-108839 — Edge — Skipped KPI doesn't spawn a Workflow Instance

**ADO ID:** 108839 · **Priority:** 2 · **Tags:** EPM-Redesign-2026-08-11; edge
**Coverage dimension:** Edge

### Steps (ADO literal)

| # | Action (ADO literal) | Expected (ADO literal) |
|---|--------|----------|
| 0 (precondition) | A KPI's Q1 `ComponentProgressReport` has `skipReportingThisPeriod = true`. | True. |
| 1 | Open the Progress Report for Q1. | Succeeds. |
| 2 | Verify `WorkflowInstance` count. | Equals active-KPI count, excluding the skipped one. |
| 3 | Sign in as Stage 1 Process Owner. | Skipped item absent from the inbox. |

### Confirmed live 2026-08-19 — blocked by the root TC-108787 defect; assertions trivially true

See [[epm-open-progress-report-skipped-kpi-unverifiable]] and [[epm-open-progress-report-inert]]. Built
a real precondition (an "Active KPI" and a "Skipped KPI" in a fresh disposable Published report,
skipped one marked `skipReportingThisPeriod: true`), then re-drove "Open Progress Report" — still zero
API requests fire (the already-confirmed root defect). ADO's literal assertions technically hold
(skipped KPI: 0 `WorkflowInstance` rows, absent from inbox), **but so does the active KPI** — 0 rows,
also absent from the inbox — because nothing spawns for ANY KPI right now. This means the "skipped
KPI excluded" claim can't be distinguished from "everything is broken." The spec captures both halves:
hard `expect` on the skipped-KPI side (holds, trivially) and `expect.soft` on the active-KPI contrast
(fails, confirming the ambiguity).

### Unique inputs
| Field | Value |
|---|---|
| Template | "Standard Annual Performance Plan" (`77a75071-...`) |
| Period | "Financial Year 2026/27" (`8062531f-...`) |
| Fresh disposable report | 1 Department root + "Active KPI" + "Skipped KPI", each with Stage 1-5 actioners |

### Notes
- **Ledgered as `blocked`, not `pass`**, despite the literal hard assertions succeeding — the case's
  real differentiator (skip-filtering logic) cannot be meaningfully exercised until
  [[epm-open-progress-report-inert]] is fixed. Do not re-report this as a clean positive without that
  caveat.
- Leaves the disposable report Published (harmless, matches this engagement's convention).
