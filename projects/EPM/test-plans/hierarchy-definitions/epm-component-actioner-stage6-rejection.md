# EPM — Component Actioner assignment — Stage 6 rejection

**ADO plan:** 108745 — *EPM-QA — Functional Test Plan v2.0 (2026-08-11 redesign baseline)*
**ADO suite:** *07 · EPM · Component Actioner assignment — Stages 1 to 5 with action level 20 to 60*
**Environment:** API only — `https://pd-epm-api-qa-wf.shesha.app` (pure REST test, no UI navigation)
**Login:** admin.PrincessH / 123qwe (administrator, bearer token via UI login)

> This spec never had a paired canonical `.md` — this file backfills it. **ADO is canonical.**

## TC-108828 — Integration — Assigning Stage 6 as a Component Actioner is rejected

**ADO ID:** 108828 · **Priority:** 2 · **Tags:** EPM-Redesign-2026-08-11; integration
**Coverage dimension:** Integration

### Steps (ADO literal)

| # | Action (ADO literal) | Expected (ADO literal) |
|---|--------|----------|
| 1 | Attempt to add the Stage 6 Person as a Component Actioner (actionLevel 70). | Rejected — this suite is scoped to Stages 1-5. |
| 2 | Confirm via GetAll. | Only the 5 Stage 1-5 rows exist; no Stage 6 row. |

Per the case's own authoring standard: **either** the app rejects this (preferred), **or** the record is
created and step 4 explicitly calls for filing an ADO Bug against the current build. This spec does not
file that Bug automatically — it documents the outcome and reports back to the case owner.

### Confirmed live 2026-08-18 — accepted with zero rejection

"Stage 6 SPMR Director" (Person) exists and is genuinely appointed via `ShaRoleAppointedPerson` (role
"SPMR Director"), matching the stated precondition. Seeded a clean Stages 1-5 baseline (5 rows) on a
Component with zero prior rows, then `POST ComponentActioner/Crud/Create` with the Stage 6 Person at
`actionLevel: 70` — **succeeded (200)**, persisted verbatim. `GetAll` returned 6 rows including Stage 6.
No rejection of any kind. Consistent with the already-confirmed total absence of server-side validation
on this entity (see [[epm-component-actioner-level-no-server-validation]]).

### Precondition rebuilt 2026-08-31 — original targets no longer usable

The originally hardcoded target Component is now soft-deleted. Princess's real KPI ("Percentage
compliance with statutory prescripts") no longer starts empty either — TC-108783 added 5 real Stage 1-5
rows to it on 2026-08-31. Rebuilt the precondition by creating a fresh, disposable Quantitative KPI
Component under Princess's real Executive Support node, guaranteed to start with zero actioner rows.

### Unique inputs
| Field | Value |
|---|---|
| Disposable KPI parent | Princess → Executive Support (`fe2ac1c3-...`) |
| Stage 1-5 actioners | Same real Person ids confirmed current via TC-108783 (Stage 1 Process Owner … Stage 5 SPMR Unit) |
| Stage 6 actioner | "Stage 6 SPMR Director" (`3b03d9ec-...`) |

### Notes
- **Pure API test** — no UI navigation, matching ADO's own HTTP-only steps.
- **Writes then deletes** the disposable KPI Component and all 5-6 `ComponentActioner` rows created on
  it, via API `Delete` in a `finally` block, regardless of pass/fail.
- **This ADO case explicitly calls for filing an ADO Bug** if Stage 6 is accepted — not done
  automatically; flag to the case owner for their explicit go-ahead.
