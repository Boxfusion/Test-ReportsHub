# EPM — Period appears in Performance Report Template "Period Type Covered" dropdown

**ADO plan:** 108745 — *EPM-QA — Functional Test Plan v2.0 (2026-08-11 redesign baseline)*
**ADO suite:** 109505 — *02 · EPM · Period management*
**Environment:** QA — `https://pd-epm-adminportal-qa.shesha.app` (API `https://pd-epm-api-qa.shesha.app`)
**Login:** admin.PrincessH / 123qwe (administrator)
**Navigation:** Epm › **Adminstration** › Performance Report Template → `/dynamic/Epm/perfomance-report-template` → **+ Add**

> Mirrors a single ADO test case from suite 109505. **ADO is canonical.** Steps are transcribed verbatim
> from `Microsoft.VSTS.TCM.Steps`.

## TC-109444 — Period appears in Performance Report Template Period Type Covered dropdown

**ADO ID:** 109444 · **Point:** 31270 · **Priority:** 2 · **Tags:** EPM-Redesign-2026-08-11; integration
**Coverage dimension:** Integration

### Preconditions
- A Period `"Financial Year 2026-27"` exists.

### Steps

| # | Action | Expected |
|---|--------|----------|
| 1 | Open PRT create form. | Period Type Covered dropdown lists Period Types. |
| 2 | Confirm the created Financial Year is selectable. | Selectable option. |

## Interpretation — the dropdown is type-based, not record-based

Step 2's phrase *"the created Financial Year"* reads as though the dropdown should list the **Period record**
created earlier in the suite. It does not, and the case's own Step 1 expectation is the accurate one: the
field lists **Period Types**. Recorded live, the dropdown offers exactly four options —
`Financial Year`, `MTSF`, `Month`, `Quarter` — which are the same four values the Period form's own
*Period Type* selector offers. The list grid corroborates this: its column is headed **`PeriodType Covered`**
and the one existing template shows `Financial Year` in it.

So **Step 2 is satisfied by the `Financial Year` *type* option being selectable**, not by a
`Financial Year 2026-27` row appearing. This is asserted as such, and the wording mismatch is called out in
the report rather than silently reinterpreted.

### Consequence for the precondition
Because the dropdown is type-based, **no Period record can affect its contents**, so nothing is seeded for
this case. The precondition is instead asserted in substance — at least one Period of type *Financial Year*
must exist — and the exact-literal mismatch is reported:

| Precondition literal | Present in QA? |
|---|---|
| `Financial Year 2026-27` | ✗ not exactly |
| `Financial Year 2026/2027` | ✓ pre-existing (slash, not hyphen) |
| `FY 2026-27 TC441-…`, `FY2026-27 TC443-…` | ✓ from TC-109441 / TC-109443 runs |

Seeding a redundant `Financial Year 2026-27` would add a row to shared QA that cannot change any assertion,
so it is deliberately not done.

## Form facts recorded live
- **Create form** — modal titled **"Add New Template"**, sections *Progress Report Template Details* and
  *Reporting Details*.
- **Fields** — Name\*, Short Name, Description, **Period Type Covered\***, Progress Reporting Cycle\*.
- **Buttons** — **Cancel** / **Create** (note: *Create*, unlike the Period form's *OK*).

## Notes
- **Writes nothing.** The case only opens a form and inspects a dropdown, so the spec selects the option to
  prove it is selectable and then **cancels** — no Performance Report Template is created.
- Options render in an antd portal (`.ant-select-dropdown`) attached to `body`, outside the modal, and the
  panel becomes visible *before* its options populate — enumerate only after the first option appears.
