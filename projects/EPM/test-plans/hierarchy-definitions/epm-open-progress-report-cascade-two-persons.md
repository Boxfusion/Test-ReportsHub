# EPM — Open Progress Report cascade to two Stage 1 Persons

**ADO plan:** 108745 — *EPM-QA — Functional Test Plan v2.0 (2026-08-11 redesign baseline)*
**ADO suite:** *109519 · EPM · Open Progress Report — per-stage inbox spawn verification*
**Environment:** `https://pd-epm-adminportal-qa-wf.shesha.app` (UI action) +
`https://pd-epm-api-qa-wf.shesha.app` (API verification)
**Login:** admin.PrincessH / 123qwe (administrator); then stage1 / 123qwe

> This spec never had a paired canonical `.md` — this file backfills it. **ADO is canonical.**
> Anchor: `ProgressReportsAppService.PublishProgressReportAsync:67-103`.

## TC-108840 — Integration — Cascade populates every Stage 1 Person's inbox

**ADO ID:** 108840 · **Priority:** 2 · **Tags:** EPM-Redesign-2026-08-11; integration
**Coverage dimension:** Integration

### Steps (ADO literal)

| # | Action (ADO literal) | Expected (ADO literal) |
|---|--------|----------|
| 0 (precondition) | Two Stage 1 Persons, each assigned actionLevel 20 on a distinct set of KPIs. | True. |
| 1 | Open the Progress Report for Quarter 1. | Succeeds. |
| 2 | Sign in as Stage 1 Person A. | Inbox count matches Person A's own assignments, no cross-contamination. |
| 3 | Verify Person B's assignments. | Inbox/WorkflowInstance count matches Person B's own assignments. |

### Corrected 2026-08-31 — root blocker reversed; this case is now testable

Previously blocked 3x by [[epm-open-progress-report-inert]] (TC-108787), reconfirmed as a testing
artifact on 2026-08-31 — the real action works. Also found: `PERSON_B_ID` originally used
("Bonolo Nthejane") had gone soft-deleted since 2026-08-17; updated to her current live Person record.
See [[epm-open-progress-report-cascade-two-persons]] for the pre-existing finding that no second
"Stage 1"-designated Person exists tenant-wide — Bonolo Nthejane is reused as "Person B" for this test
only, consistent with this session's actioner-reuse convention.

### Unique inputs
| Field | Value |
|---|---|
| Template | "Standard Annual Performance Plan" (`77a75071-...`) |
| Period | "Financial Year 2026/27" (`8062531f-...`) |
| Person A | "Stage 1 Process Owner" (`0df05401-...`) — 2 KPIs |
| Person B | "Bonolo Nthejane" (`4e74ee74-...`) — 1 KPI |

### Notes
- **Interaction pattern:** uses the corrected hover-retry + raw-mouse-coordinate click for the Open
  Progress Report action — see [[epm-open-progress-report-inert]] for the full technique.
- Person B is checked via API (`WorkflowInstance` GetAll), not a real login, since she's a reused
  existing account without known test credentials for this purpose.
- Leaves the disposable report Published.
