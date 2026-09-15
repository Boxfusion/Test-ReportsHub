# EPM — Recursive Period hierarchy (MTSF → Financial Year → Quarter → Month)

**ADO plan:** 108745 — *EPM-QA — Functional Test Plan v2.0 (2026-08-11 redesign baseline)*
**ADO suite:** 109505 — *02 · EPM · Period management*
**Environment:** QA — `https://pd-epm-adminportal-qa.shesha.app` (API `https://pd-epm-api-qa.shesha.app`)
**Login:** admin.PrincessH / 123qwe (administrator)
**Navigation:** Epm › **Adminstration** › Period → `/dynamic/Shesha.Enterprise/period`

> Mirrors a single ADO test case from suite 109505. **ADO is canonical.** Steps are transcribed verbatim
> from `Microsoft.VSTS.TCM.Steps`.

## TC-109443 — Recursive Period hierarchy is fully supported

**ADO ID:** 109443 · **Point:** 31269 · **Priority:** 2 · **Tags:** Edge; EPM-Redesign-2026-08-11
**Coverage dimension:** Edge

### Preconditions
- Signed in as administrator.

### Steps

| # | Action | Expected |
|---|--------|----------|
| 1 | Create an MTSF Period with 5 child Financial Years, each with 4 Quarters, each with 3 Months. | All nested rows persist. |
| 2 | Navigate the tree. | Each level renders correctly. |

## Execution strategy — hybrid, agreed before the run

The shape the case demands is **86 records**: 1 MTSF + 5 Financial Years + 20 Quarters + 60 Months. On this
app a UI create costs ~8–10s, so creating all 86 through the Add form is 45–75 minutes of browser time with
86 sequential chances to flake. The agreed approach splits it:

| Phase | Route | Records | Purpose |
|---|---|---|---|
| A | **UI, headed** | 6 — MTSF → FY1 → FY1-Q1 → 3 Months | Proves the **create path works at every depth of the recursion**, which is the claim under test |
| B | API read-back | — | Learns the `periodType` enum from the UI-created records instead of guessing, and asserts the parent chain |
| C | **API** `Period/Crud/Create` | 80 — FY2–FY5, 19 Quarters, 57 Months | Bulk-fills the remaining siblings to reach the full 5×4×3 shape |
| D | API read-back | — | **STEP 1 expectation:** all 86 nested rows persist, every parent link correct |
| E | **UI, headed** | — | **STEP 2:** navigate MTSF → FY → Quarter → Month and assert each level renders |

Every record is created by one of the two documented routes and the report states which. No level of the
hierarchy is created *only* by API: MTSF, Financial Year, Quarter and Month each have at least one member
created through the UI.

### API contract (recorded live)
`/api/dynamic/Shesha.Enterprise/Period/Crud/{GetAll,Get,Create,Delete}`

```json
{ "name": "...", "shortName": "...",
  "periodStart": "2026-04-01T00:00:00", "periodEnd": "2026-06-30T00:00:00",
  "periodType": 4, "parentPeriod": { "id": "<guid>" } }
```

`periodType` is an integer. **Financial Year = 1** and **Quarter = 4** were observed in existing data;
MTSF and Month are resolved at runtime from the UI-created records, so the spec never hard-codes a guess.
`Crud/Delete?id=` returns 200, so this data is removable.

### Shape and dates

| Level | Count | Span |
|---|---|---|
| MTSF | 1 | 2026-04-01 → 2031-03-31 |
| Financial Year | 5 | FY*n*: 01/04/(2025+*n*) → 31/03/(2026+*n*) |
| Quarter | 4 per FY | Q1 Apr–Jun · Q2 Jul–Sep · Q3 Oct–Dec · Q4 Jan–Mar |
| Month | 3 per Quarter | the quarter's calendar months, ending on each month's real last day |

February is computed, not assumed — FY2 contains Feb 2028, a leap year (29 days).

### Notes
- **Names carry a `TC443-<token>` stamp** so a run's 86 records are identifiable and so repeat runs never
  collide. Override with `TC443_TOKEN=<value>`.
- **Writes 86 records and does not tear down** — the ADO case specifies none. They are deletable via
  `Crud/Delete?id=`, and the spec prints the MTSF root id to make cleanup a subtree walk.
- The **Child Periods grid on the detail form has no row-link column** (unlike the main Period list, whose
  first cell holds `a.sha-link`). Descending a level therefore navigates to
  `/dynamic/Shesha.Enterprise/period-details?id=<guid>` directly, using ids read back from the API.
