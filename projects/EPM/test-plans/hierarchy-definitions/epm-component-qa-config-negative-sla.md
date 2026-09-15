# EPM — Component QA Config — negative SLA rejection

**ADO plan:** 108745 — *EPM-QA — Functional Test Plan v2.0 (2026-08-11 redesign baseline)*
**ADO suite:** *08 · EPM · Component QA Config — Service Level Agreement per Quality Assurance level*
**Environment:** API only — `https://pd-epm-api-qa-wf.shesha.app` (pure REST test, no UI navigation)
**Login:** admin.PrincessH / 123qwe (administrator, bearer token via UI login)

> This spec never had a paired canonical `.md` — this file backfills it. **ADO is canonical.**

## TC-108829 — Negative — Reject QA Config save with negative SLA value

**ADO ID:** 108829 · **Priority:** 2 · **Tags:** EPM-Redesign-2026-08-11; negative
**Coverage dimension:** Negative

### Steps (ADO literal)

| # | Action (ADO literal) | Expected (ADO literal) |
|---|--------|----------|
| 1 | Enter `slaDays = -5` (working days) on a `ComponentQAConfig` row and save. | Rejected with a validation error citing the field must be positive. |
| 2 | Confirm via GetAll. | No `ComponentQAConfig` record was persisted. |
| 3 | Retry with `slaDays = 3`. | Save succeeds. |

### Confirmed live 2026-08-18 — accepted with zero rejection

`POST ComponentQAConfig/Crud/Create` with `slaDays: -5` succeeded (`200`), persisted verbatim
(`"slaDays":-5`). No error, no rejection. Count for this KPI went from 0 → 1. Retry with `slaDays: 3`
also succeeded (`200`), persisted verbatim — the valid-retry half of ADO's expectation is genuinely
true. See [[epm-component-qa-config-negative-sla-no-validation]] — same "zero server-side validation on
this entity family" theme as [[epm-component-actioner-level-no-server-validation]].

### Unique inputs
| Field | Value |
|---|---|
| Target KPI | "Number of disaster awareness sessions conducted" (`d6cc6bf9-...`) |
| Responsible Person | "Stage 2 Chief Director" (`d3480a89-...`) |
| Level | 1 |

### Notes
- **Pure API test** — no UI navigation, matching ADO's own HTTP-only steps; also consistent with
  [[epm-component-qa-config-no-ui]] (zero UI surface exists anywhere for `ComponentQAConfig`).
- **Writes then deletes** both the negative and valid `ComponentQAConfig` rows via API `Delete` in a
  `finally` block, regardless of pass/fail.
