# EPM — Open Progress Report sequential-quarter discipline

**ADO plan:** 108745 — *EPM-QA — Functional Test Plan v2.0 (2026-08-11 redesign baseline)*
**ADO suite:** *109519 · EPM · Open Progress Report — per-stage inbox spawn verification*
**Environment:** API only — `https://pd-epm-api-qa-wf.shesha.app` (pure REST test, no UI navigation)
**Login:** admin.PrincessH / 123qwe (administrator, bearer token via UI login)

> This spec never had a paired canonical `.md` — this file backfills it. **ADO is canonical.**
> Anchor: `ProgressReportsAppService.PublishProgressReportAsync:67-103`.

## TC-108838 — Negative — Reject Open Q2 while Q1 is still Open

**ADO ID:** 108838 · **Priority:** 2 · **Tags:** EPM-Redesign-2026-08-11; negative
**Coverage dimension:** Negative

### Steps (ADO literal)

| # | Action (ADO literal) | Expected (ADO literal) |
|---|--------|----------|
| 0 (precondition) | Quarter 1 Progress Report is at status Open. | True. |
| 1 | Attempt to open Quarter 2. | Rejected, citing sequential-quarter discipline. |
| 2 | Confirm Quarter 2's status. | Remains NotDue (unchanged). |
| 3 | Close Quarter 1, then retry opening Quarter 2. | Succeeds. |

### Confirmed live 2026-08-31 (via the REAL UI action) — no sequential-quarter validation exists at all

See [[epm-progress-report-sequential-quarter-not-validated]] and [[epm-open-progress-report-inert]].
The original 2026-08-19 test used a raw `ProgressReport.status` PUT as a proxy, reasoning that the real
"Open Progress Report" UI action was completely inert — that belief was wrong, corrected 2026-08-31.
Re-tested via the real corrected interaction and the real `PublishProgressReportAsync` endpoint: opened
Q1 (real confirm dialog, 4 real API calls, status → Open), then attempted Q2 the same way **while Q1
was still Open** — the same real endpoint fired again and Q2 also transitioned to Open, no rejection of
any kind. This reaffirms the defect with stronger evidence than the original raw-field test.

### Unique inputs
| Field | Value |
|---|---|
| Template | "Standard Annual Performance Plan" (`77a75071-...`) |
| Period | "Financial Year 2026/27" (`8062531f-...`) |
| Fresh disposable report | minimal — no tree/KPIs needed, this is a status-field-only check |

### Notes
- **Pure API test** — the real UI action is inert regardless of precondition (see
  [[epm-open-progress-report-inert]]), so this targets the `ProgressReport.status` state machine
  directly, matching the state transition ADO's own steps care about.
- Builds a minimal fresh disposable report each run (no Components/actioners needed).
