# EPM — Component QA Config — level count integration

**ADO plan:** 108745 — *EPM-QA — Functional Test Plan v2.0 (2026-08-11 redesign baseline)*
**ADO suite:** *08 · EPM · Component QA Config — Service Level Agreement per Quality Assurance level*
**Environment:** API only — `https://pd-epm-api-qa-wf.shesha.app` (pure REST test, no UI navigation)
**Login:** admin.PrincessH / 123qwe (administrator, bearer token via UI login)

> This spec never had a paired canonical `.md` — this file backfills it. **ADO is canonical.**

## TC-108831 — Integration — numProgressQALevelsRequired aligns with 4 QA Config rows

**ADO ID:** 108831 · **Priority:** 2 · **Tags:** EPM-Redesign-2026-08-11; integration
**Coverage dimension:** Integration

### Steps (ADO literal)

| # | Action (ADO literal) | Expected (ADO literal) |
|---|--------|----------|
| 0 (precondition) | A KPI Component Type has `numProgressQALevelsRequired = 4`. | True. |
| 1 | Verify every KPI of that type has exactly 4 `ComponentQAConfig` rows (levels 1-4). | True for every live KPI. |
| 2 | Change `numProgressQALevelsRequired` to 5. | Saves and persists. |
| 3 | Confirm the workflow now requires an additional level-5 row before Publish succeeds. | `ValidateReadyToPublishAsync` reports the missing row. |

### Confirmed live 2026-08-18 — two gaps found

See [[epm-qa-config-level-count-integration-gaps]]. Step 1 fails for every real KPI: all 6 live
"Quantitative KPI" Components have 0 `ComponentQAConfig` rows each — a direct consequence of
[[epm-component-qa-config-no-ui]] (nothing in the admin UI can create these rows, so nobody ever has in
ordinary use). Step 2 works cleanly (`numProgressQALevelsRequired` 4→5→4 verified via Update/Get).
Step 3's gate doesn't exist at all: every discoverable Publish/ValidateReadyToPublish endpoint variant
for `ComponentType` returns 404 — unlike `PerformanceReport`/`PerformanceReportTemplate`, which do have
real Publish endpoints.

### Unique inputs
| Field | Value |
|---|---|
| Component Type | "Quantitative KPI" (`60e8340a-...`) |

### Notes
- **Pure API test** — no UI navigation; `ComponentQAConfig` and `ComponentType` Publish concepts have
  no admin UI at all.
- **Reverts** `numProgressQALevelsRequired` back to 4 in a `finally` block regardless of pass/fail.
