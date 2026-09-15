# EPM — Stage 1 Save as Draft — remainder (TC-108844/845/846)

**ADO plan:** 108745 — *EPM-QA — Functional Test Plan v2.0 (2026-08-11 redesign baseline)*
**ADO suite:** *109523 · EPM · Stage 1 — Save as Draft and resume*
**Environment:** `https://pd-epm-adminportal-qa-wf.shesha.app` (UI) +
`https://pd-epm-api-qa-wf.shesha.app` (API verification)
**Login:** admin.PrincessH / 123qwe (administrator); then stage1 / 123qwe

> Re-opened 2026-08-31 after TC-108789's "Save fails" finding was reversed (fixture artifact, missing
> `componentDefinition` link — see [[epm-disposable-fixture-hierarchy-convention]]). Reuses two real,
> properly-configured tenant KPIs on report "ProperHier 99402236" rather than a fresh disposable
> fixture — see [[epm-stage1-capture-form]] for how they were set up.

## TC-108844 — Negative — Reject Save as Draft with a missing mandatory field

**ADO ID:** 108844 · **Coverage dimension:** Negative

### Confirmed live 2026-08-31 — CONFIRMED DEFECT: Save has zero field-level validation

Used the real Qualitative KPI ("Report on unqualified audit opinion with no material findings").
Clicked Save with the form completely untouched — no Actual value, no Executive Summary, nothing.
Save succeeded (HTTP 200), no rejection of any kind. This contrasts with Submit, which is
over-strict (permanently blocked even when genuinely filled — see
[[epm-stage1-submit-permanently-blocked]]): Save has the opposite problem, accepting a fully blank
form with no validation gate at all.

## TC-108845 — Edge — Draft survives session logout and login

**ADO ID:** 108845 · **Coverage dimension:** Edge

### Confirmed live 2026-08-31 — clean pass

Used the real Quantitative KPI ("Number of Provinces and Metros supported to complete Phase 1..."),
which already held a genuine Saved draft (`indicatorActual: 45`) from the TC-108789 retest. Logged out
and back in fresh as `stage1`, reopened the same real inbox item — the value 45 genuinely persisted,
confirmed both in the UI form (found at a different field index than before, since the earlier Save had
triggered extra variance-related fields that shifted the form layout — not itself a defect) and via a
direct API `Get`.

## TC-108846 — Integration — Draft state does not appear in Sent items view

**ADO ID:** 108846 · **Coverage dimension:** Integration

### Re-confirmed live 2026-09-01 — CONFIRMED DEFECT: real "Sent Items" and "Drafts" views exist, but Drafts is permanently empty

SUPERSEDES the 2026-08-31 "BLOCKED, no Sent Items view exists" finding — that was wrong. The real
routes are direct page routes, not reachable from any visible tab/nav link on the Incoming Items page
(no "Sent"/"Drafts" tab or sidebar entry renders, which is why the 2026-08-31 pass missed them):
`Shesha.Workflow/workflows-sent` ("Sent Items") and `Shesha.Workflow/workflows-drafts` ("Drafts").

Used the real item `CPR2026/1071` ("Percentage compliance with statutory prescripts - Q3"), already
sitting in the Stage 1 Incoming Items list with `Status: Draft` from a prior Save. Opened it via
`/shesha/workflow-action?id=<workflowInstanceId>&todoid=<todoId>`, filled a valid **Actual Target**
value (62), clicked **Save** — `200`, genuinely persisted (`indicatorActual: 62`).

- **Sent Items**, searched `CPR2026/1071` → **0 items found** — correctly absent (matches ADO's
  expectation; item hasn't been Submitted). Sent Items itself is real and populated (7 genuine items
  with `Status: Received`/`Completed` for other refs), so this is a clean, meaningful pass.
- **Drafts**, searched `CPR2026/1071` → **No Data** — same result with the search box cleared: the
  Drafts view is unconditionally empty, 0 items, regardless of filter. Cross-checked via the Incoming
  Items page's own Status column filter (`Filter by → Status → contains "Draft"`), which correctly
  found 3 items including `CPR2026/1071` — so the record genuinely carries `Status: Draft` server-side,
  it just never gets surfaced into the dedicated Drafts view that's supposed to list it.

**CONFIRMED DEFECT:** Saving a Progress Report only flips its `Status` column value to `Draft` inside
the single "Incoming Items" grid; it does not get written into whatever data source backs the
`workflows-drafts` view, so that view stays permanently empty and a user cannot find their own drafts
through the page ADO's test case says should list them.

### Unique inputs
| Field | Value |
|---|---|
| Quantitative KPI | "Number of Provinces and Metros supported to complete Phase 1..." (real `refNo` `QKPI_10`) |
| Qualitative KPI | "Report on unqualified audit opinion with no material findings" (real `refNo` `QLKPI_1`) |
| Report | "ProperHier 99402236" |

### Notes
- Reuses real, already-configured tenant KPIs rather than building fresh disposable fixtures — see
  [[epm-disposable-fixture-hierarchy-convention]] for why raw-API-created fixtures were unreliable for
  this suite specifically.
- `todoId` fetched fresh in the same session immediately before each navigation (per-fetch volatile).
