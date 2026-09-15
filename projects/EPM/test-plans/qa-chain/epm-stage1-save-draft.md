# EPM — Stage 1 Save as Draft

**ADO plan:** 108745 — *EPM-QA — Functional Test Plan v2.0 (2026-08-11 redesign baseline)*
**ADO suite:** *109523 · EPM · Stage 1 — Save as Draft and resume*
**Environment:** `https://pd-epm-adminportal-qa-wf.shesha.app` (UI) +
`https://pd-epm-api-qa-wf.shesha.app` (API verification)
**Login:** admin.PrincessH / 123qwe (administrator); then stage1 / 123qwe

> This spec never had a paired canonical `.md` — this file backfills it. **ADO is canonical.**

## TC-108789 — Positive — Save a KPI progress entry as Draft, resume later

**ADO ID:** 108789 · **Priority:** 1 · **Coverage dimension:** Positive

### Steps (ADO literal)

| # | Action (ADO literal) | Expected (ADO literal) |
|---|--------|----------|
| 0 (precondition) | A Stage 1 Person has an open form on a Q1 KPI. | True. |
| 1 | Enter a partial Actual value, click Save (not Submit). | Form stays open, `progressReportStatus` unchanged at 20. |
| 2 | Navigate away and back. | The partial value persisted. |
| 3 | Verify via `ComponentProgressReport/Crud/GetAll`. | Value present in the record. |

### Confirmed live 2026-08-31 — CONFIRMED DEFECT: Save fails with a 404

Previously blocked (see [[epm-stage1-save-draft-unverifiable]]) because no live Stage 1 item could ever
be originated — root cause was [[epm-open-progress-report-inert]], reversed the same day. Once
unblocked, this reveals a genuine, reproducible defect: clicking "Save" (not Submit) on a freshly-opened
Stage 1 capture form fails with a real HTTP 404. The frontend's own request body sends
`{"id":"00000000-0000-0000-0000-000000000000", "indicatorActualText":"45"}` to
`ComponentProgressReport/Crud/Update` — an empty GUID — and the backend correctly rejects it ("There is
no entity ComponentProgressReport with id = 00000000-0000-0000-0000-000000000000!"). Reproduced twice,
including with a 15-second wait before interacting (ruling out a load-timing race). The typed value
never persists. Note: when a save DOES succeed elsewhere, the form correctly writes into
`indicatorActualText` (a text-mirror field, not the numeric `indicatorActual`) — same pattern already
confirmed for Annual Target in TC-109456 — this spec's assertions check the correct field name.

**Independently reconfirmed under the corrected fixture setup** — see
[[epm-disposable-fixture-hierarchy-convention]]: rebuilt with the full Department > Programme > Sub
Programme > KPI hierarchy and `poeRequired`/`useSimplifiedReporting` both set `true` before Publish/
Open. Save still fails identically (same 404, same empty GUID), ruling out the originally-flattened
hierarchy as the cause.

### Unique inputs
| Field | Value |
|---|---|
| Template | "Standard Annual Performance Plan" (`77a75071-...`) |
| Period | "Financial Year 2026/27" (`8062531f-...`) |

### Notes
- **Interaction pattern:** uses the corrected hover-retry + raw-mouse-coordinate click for Open
  Progress Report — see [[epm-open-progress-report-inert]].
- `todoId` must be fetched fresh in the same session immediately before navigating to the
  `workflow-action` route.
- KPI names include the run's timestamp suffix — without it, a stale item from a prior run can be
  found first by the inbox lookup, producing a false result (discovered mid-development of this spec).
