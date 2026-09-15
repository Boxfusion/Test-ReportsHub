# EPM — Component Actioner assignment — server-side actionLevel validation

**ADO plan:** 108745 — *EPM-QA — Functional Test Plan v2.0 (2026-08-11 redesign baseline)*
**ADO suite:** *07 · EPM · Component Actioner assignment — Stages 1 to 5 with action level 20 to 60*
**Environment:** API only — `https://pd-epm-api-qa-wf.shesha.app` (pure REST test, no UI navigation)
**Login:** admin.PrincessH / 123qwe (administrator, bearer token via UI login)

> This spec never had a paired canonical `.md` — this file backfills it. **ADO is canonical.**

## TC-108826 — Negative — Reject actionLevel not in the reflist (20/30/40/50/60)

**ADO ID:** 108826 · **Priority:** 2 · **Tags:** EPM-Redesign-2026-08-11; Negative
**Coverage dimension:** Negative

### Steps (ADO literal)

| # | Action (ADO literal) | Expected (ADO literal) |
|---|--------|----------|
| 1 | `POST ComponentActioner/Crud/Create` with `actionLevel: 100` (not in the reflist). | Rejected with a validation error citing an invalid reflist value. |
| 2 | Confirm via GetAll no record was persisted. | Count unchanged. |
| 3 | Retry with `actionLevel: 20`. | Succeeds, created for Stage 1 Process Owner. |

### Relationship to TC-108783 (corrected 2026-08-31)

TC-108783 confirmed the "Actioner Level" UI select's workflow-status-looking labels (Outstanding,
Awaiting Level One/Two/Three/Four QA) ARE the correct reference data — each maps to a specific numeric
`actionLevel` (20/30/40/50/60). This TC is the negative complement, purely at the API level: does the
server reject an `actionLevel` value that's genuinely outside that set (e.g. 100)?

### Confirmed live 2026-08-18 — no server-side validation exists at all

- `POST ... {actionLevel: 100}` → **200**, persisted verbatim. No error, no rejection.
- Count for the KPI went from N to N+1 — the invalid row really was persisted.
- `POST ... {actionLevel: 20}` → also 200, persisted verbatim, correct actioner. This half of ADO's
  expectation (valid retry succeeding) is genuinely true.

This is a real, standalone finding independent of TC-108783's correction: even though 20/30/40/50/60 are
the correct intended values (confirmed reachable and meaningful via the UI), the server itself applies
**zero range/reflist validation** on a raw API write — any integer, in or out of the intended set, is
accepted without complaint.

### Unique inputs
| Field | Value |
|---|---|
| KPI (`component`) | "Number of disaster awareness sessions conducted" (`d6cc6bf9-...`) |
| Actioner | "Stage 1 Process Owner" (`0df05401-...`) |
| Invalid actionLevel | `100` |
| Valid actionLevel | `20` |

### Notes
- **Pure API test** — no UI navigation, matching ADO's own HTTP-only steps.
- **Writes then deletes** both the (unexpectedly-persisted) invalid row and the valid row, via API
  `Delete`, regardless of pass/fail.
