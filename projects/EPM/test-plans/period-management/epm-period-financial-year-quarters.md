# EPM — Create top-level Financial Year Period with child Quarter Periods

**ADO plan:** 108745 — *EPM-QA — Functional Test Plan v2.0 (2026-08-11 redesign baseline)*
**ADO suite:** 109505 — *02 · EPM · Period management — Medium Term Strategic Framework / Financial Year / Quarter / Month recursion referenced by Performance Report Template and Performance Report*
**Parent suite:** Phase 01 · EPM · Foundation · Reference Data
**Environment:** QA — `https://pd-epm-adminportal-qa.shesha.app` (API `https://pd-epm-api-qa.shesha.app`)
**Login:** admin.PrincessH / 123qwe (administrator)
**Navigation:** Epm › **Adminstration** › Period → `/dynamic/Shesha.Enterprise/period` → **+ Add**

> Mirrors a single ADO test case from suite 109505. **ADO is canonical** — edit the test case there, then
> re-mirror here. Steps are transcribed verbatim from `Microsoft.VSTS.TCM.Steps`.
>
> One case per plan/spec pair: the hub derives the spec as `<plan>.md → <plan>.spec.ts`.

## TC-109441 — Create top-level Financial Year Period with child Quarter Periods

**ADO ID:** 109441 · **Point:** 31267 · **Priority:** 2 · **Tags:** EPM-Redesign-2026-08-11; Positive
**Coverage dimension:** Positive

### Preconditions
- Period list at `/dynamic/Shesha.Enterprise/period`.

### Steps

| # | Action | Expected |
|---|--------|----------|
| 1 | Click **+ Add**. Fill Name "FY 2026-27", Short Name, Start 2026-04-01, End 2027-03-31, Period Type "Financial Year". Click **OK**. | Row appears in list. |
| 2 | Open the row via search icon. Click Child Periods **+ Add**. Fill Q1 details with Parent auto-populated. | Q1 row appears in Child Periods table. |
| 3 | Repeat for Q2, Q3, Q4. | Four Quarter Periods are children of FY 2026-27. |

### Unique inputs — the ADO literals already exist
The case names `"FY 2026-27"`, but QA already holds **`Financial Year 2026/2027`** / short name
**`FY 2026/27`** (id `bb939bfa-f516-4f6b-af46-21da4c275ae5`) *with Q1–Q4 children already attached*. Re-using
those literals would collide with, or be indistinguishable from, that record — so every run stamps a unique
token `TC441-<epoch>` into the Name and Short Name. **Dates are left exactly as the case specifies**, since
they carry the business meaning under test and are not unique keys.

| Record | Name | Short Name | Period Type | Start | End |
|---|---|---|---|---|---|
| Parent | `FY 2026-27 TC441-<token>` | `FY<token6>` | Financial Year | 2026-04-01 | 2027-03-31 |
| Child 1 | `Q1 TC441-<token>` | `Q1-<token6>` | Quarter | 2026-04-01 | 2026-06-30 |
| Child 2 | `Q2 TC441-<token>` | `Q2-<token6>` | Quarter | 2026-07-01 | 2026-09-30 |
| Child 3 | `Q3 TC441-<token>` | `Q3-<token6>` | Quarter | 2026-10-01 | 2026-12-31 |
| Child 4 | `Q4 TC441-<token>` | `Q4-<token6>` | Quarter | 2027-01-01 | 2027-03-31 |

Override the token with `TC441_TOKEN=<value>` to reproduce a specific run's data.

### Form facts recorded live
- **Create modal** — title *Add New Period*; fields **Name\***, **Short Name**, **Period Start\***,
  **Period End\***, **Period Type\***; buttons **Cancel** / **OK** (the case's "Click OK").
- **Period Type options** — `Financial Year`, `MTSF`, `Month`, `Quarter`.
- **Dates** are antd pickers with placeholder *Pick date*, accepting typed **`dd/MM/yyyy`** committed with
  Enter. The list renders them back as `dd/MM/yyyy 00:00`.
- **Grid is div-based** — `.sha-table` › `.tr.tr-body` › `.td`, with no `<table>`/`<th>`. The "search icon"
  in step 2 is the row link `a.sha-link` in the first cell, pointing at
  `/dynamic/Shesha.Enterprise/period-details?id=<guid>`. It is **not** the toolbar search box, which also
  renders an `.anticon-search`.
- **Detail view** — heading *Period: <name>*, sections *Period Details* and *Child Periods*; the Child
  Periods grid has columns Name, Short Name, Period Type, Period Start, Period End, **Parent Period**.

### Notes
- **Writes 5 records per run** (1 Financial Year + 4 Quarters) and there is no teardown, because the ADO
  case specifies none. Each run's records are identifiable by their `TC441-<token>` stamp.
- *Parent auto-populated* is verified from the resulting Child Periods rows, whose **Parent Period** column
  must read the parent's name — and, when the child form exposes a parent field, from that field's value
  before saving.
- Observation: **Short Name is optional in the create modal but mandatory on the detail form**
  (`Short Name *`). The spec always supplies one, so it does not depend on which rule wins.
