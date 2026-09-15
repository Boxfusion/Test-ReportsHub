# EPM — POE carries through the QA chain to Stage 6

**ADO plan:** 108745 — *EPM-QA — Functional Test Plan v2.0 (2026-08-11 redesign baseline)*
**ADO suite:** *109522 · EPM · Stage 1 POE attachment upload*
**Environment:** `https://pd-epm-adminportal-qa-wf.shesha.app` (UI) +
`https://pd-epm-api-qa-wf.shesha.app` (API verification)
**Login:** admin.PrincessH / 123qwe (verification); stage1 / stage3 / stage4 / stage5 / stage6, all /
123qwe (per-stage actioners)

> This spec never had a paired canonical `.md` — this file backfills it. **ADO is canonical.**

## TC-108849 — Integration — POE attachment carries through the QA chain to Stage 6

**ADO ID:** 108849 · **Coverage dimension:** Integration

### Confirmed live 2026-09-01 — clean pass, full Stage 1→6 chain completed end-to-end

Used the real item `CPR2026/1071` ("Percentage compliance with statutory prescripts - Q3"), already at
Stage 1 with a real Portfolio of Evidence attachment (`pdf-test (2).pdf`, `StoredFile` id
`bc6a7e92-d6e5-4341-92ab-73b9719e368e`) from [[epm-stage1-poe-upload-confirmed-working]].

**Submit worked.** Checked the Declaration Statement checkbox (previous sessions' attempts against a
*different* form configuration had this checked too and still failed — see the important caveat below)
— the "Submit" button genuinely became enabled and, on click, `Process/UserTaskComplete` returned `200`.
`progressReportStatus` went `20 → 40`Progress Report Status jumped straight to Stage 3's level (40),
**skipping the Stage 2 Support Review step entirely** — worth a separate look at suite 109529, not
pursued further here since it's outside this TC's scope.

Drove the item through the rest of the chain using the already-established per-stage mechanism
([[epm-stage3-qa-review-confirmed-working]] → [[epm-stage4-approve-confirmed-working]] →
[[epm-stage5-verify-confirmed-working]] → [[epm-stage6-finalise-confirmed-working]]), checking the
`ComponentProgressReport.portfolioOfEvidence` field via direct API `Get` after every single stage:

| Stage | Actioner | Button | Result | `progressReportStatus` | `portfolioOfEvidence.id` |
|---|---|---|---|---|---|
| 1→3 | stage1 | Submit | 200 | 40 | `bc6a7e92-...` (unchanged) |
| 3 | stage3 | Complete QA | 200 | 50 | `bc6a7e92-...` (unchanged) |
| 4 | stage4 | Approve KPI | 200 | 60 | `bc6a7e92-...` (unchanged) |
| 5 | stage5 | Complete KPI | 200 | 70 | `bc6a7e92-...` (unchanged) |
| 6 | stage6 | Complete KPI | 200 | **180 (Completed)** | `bc6a7e92-...` (unchanged) |

The exact same `StoredFile` reference survived every single stage transition unchanged. After Stage 6,
the item left the inbox system entirely (Stage 6's "My Items" list showed 0 items), consistent with
reaching a genuine terminal state.

**CONFIRMED PASS — matches ADO's expected result exactly.**

### Important caveat — does NOT reverse [[epm-stage1-submit-permanently-blocked]]

This item uses `useSimplifiedReporting: true` — a POE-focused form with **no Executive Summary field at
all**. The original Submit defect was reproduced on a *different* form configuration
(`useSimplifiedReporting: false`, a real tenant KPI with a genuine Executive Summary textarea), where
Submit stayed disabled citing the Executive Summary even with the field demonstrably filled and the
Declaration checkbox checked. That specific scenario was **not** re-attempted this session. Don't assume
Submit is now fixed everywhere — only confirmed working on the simplified/POE-only form path. The
standard/Executive-Summary form path needs its own dedicated re-test before that defect finding is
revisited.

### Unique inputs
| Field | Value |
|---|---|
| Item | `CPR2026/1071` (workflowInstanceId `101765e8-4e95-40b2-a575-5a9a245e1cdd`) |
| ComponentProgressReport id | `de37dfec-1793-4cdf-aaeb-c8a4e3556f60` |

### Notes
- `todoId` is per-fetch volatile — re-fetched via `WorkflowInboxItem/Crud/GetAll` immediately before
  each stage's navigation.
- This is a one-shot, item-consuming test: `CPR2026/1071` is now in a terminal `Completed` state and
  can't be re-driven through this same chain again — a future re-run of this suite needs a fresh Stage 1
  item.
- Observed but out of scope for this TC: Stage 2 (Support Review) appears to have been skipped entirely
  (status went `20 → 40` directly on Submit, never stopping at `30`) — worth investigating separately
  under suite 109529, previously `unverified`.
