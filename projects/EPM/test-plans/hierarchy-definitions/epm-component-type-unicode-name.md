# EPM — Component Type Name accepts full Unicode range (South African language characters)

**ADO plan:** 108745 — *EPM-QA — Functional Test Plan v2.0 (2026-08-11 redesign baseline)*
**ADO suite:** 109511 — *04 · EPM · Component Type management — create / edit / delete + canBeRoot rule*
**Parent suite:** Phase 02 · EPM · Foundation · Hierarchy Definitions
**Environment:** QA — `https://pd-epm-adminportal-qa.shesha.app` (API `https://pd-epm-api-qa.shesha.app`)
**Login:** admin.PrincessH / 123qwe (administrator)
**Navigation:** Epm › **Adminstration** › Component Type → `/dynamic/Epm/component-types`

> Mirrors a single ADO test case from suite 109511. **ADO is canonical.** Steps are transcribed verbatim
> from `Microsoft.VSTS.TCM.Steps`, fetched directly from the ADO REST API 2026-08-27.

## TC-108809 — Edge — Component Type name accepts full Unicode range including South African language characters

**ADO ID:** 108809 · **Coverage dimension:** Edge (per ADO's own Description field)

### Preconditions (ADO literal)
- Signed in as administrator. Component Type list loaded.

### Steps (ADO literal)

| # | Action (ADO literal) | Expected (ADO literal) |
|---|--------|----------|
| 2 | Create a Component Type with Name containing isiZulu, isiXhosa, and Sepedi characters (for example "Uhlelo lwezomnotho ǀ ǀǀ"). | The form accepts the name without encoding warnings. |
| 3 | Save the record. | The name persists correctly. Reload and confirm the special characters render without mojibake. |
| 4 | Verify via ComponentType Crud GetAll that the byte-for-byte name is stored as expected. | The stored value equals the entered value. No character was silently transliterated. |

### Deviation — corrected: "Type" is a Component Type's own field, not the display Name; unused Type values are still creatable (confirmed live, 2026-08-27)

TC-108777 (same suite, same day) confirmed the **DUPLICATE_COMPONENT_TYPE** guard fires when the create
form's `Type` select reuses an *already-instantiated* value — QA's 7 existing Component Types
(`Department`, `Programme`, `Sub Programme`, `Quantitative KPI`, `Qualitative KPI`, `Outcome`, `Output`)
each own one Type value. An earlier draft of this case incorrectly generalised that to "no new Component
Type can ever be created" and worked around it with a rename-then-revert of a real record. **Corrected
per the user**: the `Type` reflist has more values than are currently instantiated — `Districts` is
confirmed live (via `ComponentType/Crud/GetAll`) to be a valid, **unused** Type. Selecting an unused Type
value creates a genuine new, disposable Component Type without touching any existing record, exactly as
ADO's own literal steps describe. The spec creates a disposable Component Type with `Type = Districts`
and `Name` set to ADO's literal Unicode test string.

### Unique inputs
| Field | Value |
|---|---|
| Name | `Uhlelo lwezomnotho ǀ ǀǀ` (ADO's own literal example — isiZulu/isiXhosa click consonants ǀ/ǁ) |
| Type | `Districts` (confirmed unused as of 2026-08-27 — re-check via `ComponentType/Crud/GetAll` if this ever collides) |
| Based On Definition | `Always` |

Per the user's earlier general instruction (2026-08-27): all six **Flags & Visibility** checkboxes (Is
Indicator, Show In Admin Tree, Progress Reporting Required, Is Folder, Show In Viewer Tree, Progress
Reviewing Required) are ticked, matching the convention already applied to TC-108777/TC-108808's
disposable Component Types in this same suite.

### Notes
- **Writes 1 disposable Component Type per run** (`Type = Districts`) — no teardown, matching this
  suite's own convention for TC-108808 (ADO's steps specify none, and Districts has no other reference
  data depending on it).
