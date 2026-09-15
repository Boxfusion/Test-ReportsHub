# EPM — Open Progress Report inbox count

**ADO plan:** 108745 — *EPM-QA — Functional Test Plan v2.0 (2026-08-11 redesign baseline)*
**ADO suite:** *109519 · EPM · Open Progress Report — per-stage inbox spawn verification*
**Environment:** `https://pd-epm-adminportal-qa-wf.shesha.app` (UI action) +
`https://pd-epm-api-qa-wf.shesha.app` (API verification)
**Login:** admin.PrincessH / 123qwe (administrator); then stage1 / 123qwe

> This spec never had a paired canonical `.md` — this file backfills it. **ADO is canonical.**
> Anchor: `ProgressReportsAppService.PublishProgressReportAsync:67-103`.

## TC-108787 — Positive — Open Progress Report for Q1, verify Stage 1 inbox count

**ADO ID:** 108787 · **Priority:** 1 · **Tags:** EPM-Redesign-2026-08-11; positive
**Coverage dimension:** Positive

### Steps (ADO literal)

| # | Action (ADO literal) | Expected (ADO literal) |
|---|--------|----------|
| 0 (precondition) | A Performance Report is Published with N active KPIs for Quarter 1. | True. |
| 1 | Open the Progress Report for Quarter 1 via the "Open Progress Report" UI action. | Confirmation dialog, then status → Open. |
| 2 | Sign in as a Stage 1 Person and check the workflow inbox count. | Count matches N. |
| 3 | Verify via `WorkflowInstance` GetAll. | N rows exist, each pointing at a Stage 1 actioner. |

### CORRECTED 2026-08-31 — the action genuinely works; the "defect" was a testing artifact

See [[epm-open-progress-report-inert]] for the full writeup. The "Open Progress Report" menu item is
inside a **hover-triggered** rc-menu overflow popup (the grid's "..." next to "Total N items"), and
antd renders a HIDDEN measurement placeholder for it with the identical text, styled
`opacity:0; pointer-events:none; aria-hidden:true`. Every prior automated attempt's selector matched
that hidden placeholder, not the real popup item, and clicked it anyway via `force: true` — producing
zero network requests on every single run, consistently, without ever exercising the real button. A
real confirmation dialog does appear ("Are you sure you want to open progress report for reporting?").
Clicking the popup's genuine item (found via steady mouse-hover retries + raw coordinate click, then
confirming the dialog) fires 4 real API calls, transitions the period to Open, and spawns real
`WorkflowInstance` rows matching active KPIs. Confirmed clean end-to-end on a fresh disposable report:
3 KPIs → 3 `WorkflowInstance` rows, Stage 1 inbox genuinely populated.

**This was the root blocker cited for ~25+ downstream `blocked`/`unverified` cases across suites
109519–109530 and 109758 ("Reporting Cycle Lifecycle").** Since the real feature works, those cases are
very likely re-testable now using the corrected interaction pattern — this needs a deliberate re-test
pass, not an automatic bulk reclassification.

### Unique inputs
| Field | Value |
|---|---|
| Template | "Standard Annual Performance Plan" (`77a75071-...`) |
| Period | "Financial Year 2026/27" (`8062531f-...`) |
| Fresh disposable report | 1 Department root + 3 KPIs, each with Stage 1-5 actioners |

### Notes
- Builds and publishes its own fresh, disposable Performance Report each run (real Annual Targets,
  correct Stage 1-5 actioners) rather than reusing a fixed one, since prior fixed test reports have
  repeatedly gone stale/soft-deleted across this engagement.
- **Interaction pattern (critical):** the overflow popup is hover-triggered and genuinely flaky — hover
  the trigger with retries until the real (non-hidden) popup item is visible, read its bounding box,
  then click via raw `page.mouse` coordinates rather than a fresh locator click (a locator-based click
  re-hovers via its own path and the popup auto-closes before the click lands). Never trust a
  text-based `getByText(...)` selector alone for this menu item — antd renders a hidden
  measurement-placeholder copy with identical text.
- Leaves the disposable report Published with Q1 genuinely Open and real `WorkflowInstance` rows
  spawned (harmless, matches how every other test report is left in this engagement).
