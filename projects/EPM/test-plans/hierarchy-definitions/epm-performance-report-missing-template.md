# EPM — Performance Report creation — reject save with an empty Template

**ADO plan:** 108745 — *EPM-QA — Functional Test Plan v2.0 (2026-08-11 redesign baseline)*
**ADO suite:** 109507 — *08 · EPM · Performance Report creation — planning shell*
**Parent suite:** Phase 01 · EPM · Foundation · Reference Data
**Environment:** QA — `https://pd-epm-adminportal-qa-wf.shesha.app` (API `https://pd-epm-api-qa-wf.shesha.app`)
**Login:** admin.PrincessH / 123qwe (administrator)
**Navigation:** Epm › **EPM Administration** › Manage Performance Reports → `/dynamic/Epm/perfomance-report-v2` → **+ Add**

> This suite's 4 test cases (TC-108780, TC-108817, TC-108818, TC-108819) were built and run this
> engagement as standalone specs without ever getting a paired canonical `.md` — this file backfills
> TC-108817's own documentation from its spec's ADO-derived comments and this session's live findings.
> **ADO is canonical.**

## TC-108817 — Negative — Reject Performance Report save when Template dropdown is empty

**ADO ID:** 108817 · **Priority:** 2 · **Tags:** EPM-Redesign-2026-08-11; Negative
**Coverage dimension:** Negative

### Preconditions (ADO literal)
- Signed in as administrator. Performance Report create form loaded.

### Steps (ADO literal)

| # | Action (ADO literal) | Expected (ADO literal) |
|---|--------|----------|
| 1 | Enter Name but leave Template dropdown empty. Save. | The form rejects with a validation error citing the missing Template field. |
| 2 | Confirm no PerformanceReport record was persisted. | GetAll count is unchanged / no matching row in the list. |
| 3 | Select a template and re-save. | The retry succeeds; the record persists with status Planning. |

### Route and form (confirmed live 2026-08-17)

The real route is `/dynamic/Epm/perfomance-report-v2` (misspelled "perfomance"), reached via EPM ›
**EPM Administration** › **Manage Performance Reports** (see `epm-nav-restructured-epm-administration-flyout`
memory). The real "Add New Performance Report" modal has **four** mandatory fields ADO doesn't fully
enumerate: **Name**, **Short Name**, **Period Covered** (a Period reference select), and **Template**. Short
Name and Period Covered are filled with valid values in this spec (neither is under test) so that Template
is isolated as the only missing field — otherwise a rejection could be attributed to the wrong cause.

### Confirmed live 2026-08-17 — no client-side guard on Template; server rejects instead

This form has **no client-side required-field validation on Template** — the Create button stays enabled
with Template empty, and clicking it does send the request. The **server** rejects it instead, with a
non-2xx response whose body cites "template". This matches the same custom-AppService-quirk pattern
already found on this same form for the Period/template-cycle mismatch (see
`epm-performance-report-create-period-cycle-mismatch` memory) — the "validation error" ADO's step 1
describes is server-returned, not an inline per-field antd error.

The create modal **closes unconditionally after any Create click, success or rejection alike** (confirmed
elsewhere in this suite) — so step 3's retry reopens a fresh "Add" modal and refills every field, rather
than assuming the original modal survived the rejected attempt.

### Stale reference found and fixed, 2026-08-28

The spec originally hardcoded `PERIOD_NAME = 'Financial Year 2026/27'` as the Period Covered value (a
plain, clean catalog-looking period). Confirmed live this no longer exists in QA at all — of the 11
Financial-Year-type periods now present, every one is a disposable, test-token-suffixed leftover from
other specs (e.g. `FY 2026-27 TC441-...`, `FY2026-27 TC443-...`), too fragile for this spec to depend on.
Fixed by having the spec build its own disposable Financial Year period (with one Quarter child, matching
the "Standard Annual Performance Plan" template's `periodTypeCovered=1`/`progressReportingCycle=4`
requirement, confirmed still correctly configured) via direct API calls as setup, and cleaning both up
afterward regardless of pass/fail.

### Unique inputs
| Field | Value |
|---|---|
| Report Name | `Missing Template Test <token6>` |
| Report Short Name | `MT<token6>` |
| Period Covered | `TC108817 FY <token6>` (disposable, built by this run — Financial Year type, with one Quarter child) |
| Template (step 3 retry only) | `Standard Annual Performance Plan` (stable, non-disposable catalog template) |

### Notes
- **Writes then deletes 1 disposable Financial Year period, 1 disposable Quarter child period, and 1
  disposable Performance Report per run** — all cleaned up via API `Delete` in `finally` blocks regardless
  of pass/fail. The stable "Standard Annual Performance Plan" template is only ever read, never modified.
