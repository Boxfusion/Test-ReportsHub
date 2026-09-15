# EPM — Component Definition management — canonical refNo sequence per Component Type

**ADO plan:** 108745 — *EPM-QA — Functional Test Plan v2.0 (2026-08-11 redesign baseline)*
**ADO suite:** 109509 — *02 · EPM · Component Definition management — canonical refNo sequence per Component Type*
**Parent suite:** Phase 01 · EPM · Foundation · Reference Data
**Environment:** QA — `https://pd-epm-adminportal-qa.shesha.app` (API `https://pd-epm-api-qa.shesha.app`)
**Login:** admin.PrincessH / 123qwe (administrator)
**Navigation:** Epm › **Adminstration** › Component Definition → `/dynamic/Epm/component-definition-table` → **+ Add**

> Mirrors a single ADO test case from suite 109509. **ADO is canonical.** Steps are transcribed verbatim
> from `Microsoft.VSTS.TCM.Steps`.

## TC-108778 — Positive — Create Component Definition and confirm canonical refNo sequence per Component Type

**ADO ID:** 108778 · **Point:** 31249 · **Priority:** 2 · **Tags:** EPM-Redesign-2026-08-11; Positive
**Coverage dimension:** Positive

### Preconditions (ADO literal)
- Signed in as administrator. Component Type Department exists with existing count of definitions equal
  to zero.

### Deviation — the zero-count precondition does not hold, and refNo is a real gap-permitting sequence (confirmed live, 2026-08-14)

`GET /api/dynamic/Epm/ComponentDefinition/Crud/GetAll` shows **5** existing Component Definitions,
including one for **Department**: `Emmanuel_Department`, refNo `DEPT_1` (seeded 2026-08-06, before this
session). ADO's precondition ("existing count of definitions equal to zero") is therefore false as
written — a fresh Department Component Definition will **not** get `DEPT_1` as ADO's literal step 4 says.

**Further confirmed live:** the refNo counter is a real monotonic sequence per Component Type, not a
"COUNT(existing rows) + 1" calculation — it advances the moment **Component Type** is selected on the
create form, even if the record is never saved. Evidence: with only `DEPT_1` existing, a prior aborted
attempt (bad field values, later deleted) consumed `DEPT_2`; a separate dry-run diagnostic that only
selected Component Type = Department without saving *also* advanced the counter; the next real save
landed on `DEPT_3`, not the naive `DEPT_2` "highest + 1" prediction. **Gaps from dry runs/aborted
attempts are normal sequence behaviour, not a defect** — this matches how real DB sequence objects work
(they don't roll back on an uncommitted preview). The spec therefore asserts refNo is well-formed
(`DEPT_<n>`), strictly greater than every previously-seen suffix, and not a duplicate — not that it
equals a specific predicted value.

### Steps (ADO literal)

| # | Action (ADO literal) | Expected (ADO literal) |
|---|--------|----------|
| 2 | Navigate to /dynamic/Epm/ComponentDefinition/. Click Create and select Component Type equals Department. | The Component Definition create form loads. The refNo field is disabled and populated on save. |
| 3 | Enter Name equals "Department (test)" and Save. | A confirmation toast appears. The list refreshes. |
| 4 | Verify the newly created record shows refNo equal to DEPT_1 (or the next value in the canonical sequence per ComponentDefinitionChangedEventHandler). | The refNo is sequential from 1 for the Component Type, matching the canonical convention. |

### Route and form (confirmed live, 2026-08-14 — same form already documented for TC-109440)

ADO's literal path `/dynamic/Epm/ComponentDefinition/` is not the real route — the real one, reached via
Epm › Adminstration › Component Definition, is `/dynamic/Epm/component-definition-table` (see
`epm-component-definition-uom-dropdown.md`, TC-109440, same suite/plan area). The "Add New Record" modal
has three collapsible sections:

| Section | Fields |
|---|---|
| Component Definition Details | **Ref No\*** (disabled — no visible input, populated on save), **Name\***, **Component Type\*** (select), **Description\*** |
| Calculation Details | Unit Of Measure, Variance Calculation Type, Calculation Type, Method Of Calculation |
| Additional Information | Purpose, Means Of Verification, What Measured |

Only Name, Component Type, and Description are actually fillable/required for a minimal Create — Ref No
confirmed disabled (renders with no bordered input box, unlike the other fields), matching ADO's step 2
expectation. `Description` is required here even though ADO's step 3 only mentions Name — the spec fills
a minimal placeholder value since ADO doesn't specify content for it.

### Unique inputs
Every run stamps a token so the Name is unique (ADO's literal `"Department (test)"` is not reusable
across runs). Override with `TC108778_TOKEN=<value>`.

| Field | Value |
|---|---|
| Name | `Department (test) <token6>` |
| Component Type | `Department` |
| Description | `TC-108778 refNo sequence check` |

### Notes
- **Writes 1 Component Definition per run** — no teardown, ADO's steps specify none, and unlike the
  hierarchy-definitions suites this doesn't touch shared parent/child config, only adds a new catalog
  row.
- A stray ADO comment on this case (`System.History`, dated before this session) references an
  unrelated prior failure ("DHS Department CD must be present after Create") — not something this
  session's testing can explain or reproduce; noted here for context only, not acted on.

## TC-108811 — Negative — Reject Component Definition creation when the required Component Type is missing

**ADO ID:** 108811 · **Point:** 31250 · **Priority:** 2 · **Tags:** EPM-Redesign-2026-08-11; Negative
**Coverage dimension:** Negative

### Preconditions (ADO literal)
- Signed in as administrator. Component Definition create form loaded.

### Steps (ADO literal)

| # | Action (ADO literal) | Expected (ADO literal) |
|---|--------|----------|
| 2 | Leave Component Type empty. Enter Name equals "Programme (invalid)". Save. | The form rejects with a validation error citing the missing Component Type field. |
| 3 | Confirm no ComponentDefinition record was created. | GetAll count is unchanged. |
| 4 | Confirm no refNo was consumed from the Component Type sequence counter. | The next successful Component Definition creation uses the same refNo the sequence would have produced before the failed attempt. |

### Mechanism — this case exists because of TC-108778's own discovery

TC-108778 confirmed the refNo counter is a real monotonic sequence per Component Type that advances the
moment **Component Type is selected** on the create form — even without saving. TC-108811 tests the
converse: if Component Type is *never* selected at all (left empty, per ADO's step 2), the sequence
should not advance. The spec:

1. Records the current highest `DEPT_n` suffix.
2. Fills Name (and Description, also required on this form) but deliberately never touches the
   Component Type select, then attempts Save — expects a validation error naming Component Type and no
   POST/record created.
3. Confirms the Component Definition count is unchanged.
4. Performs a **real** follow-up creation (Component Type = Department) immediately after, and asserts
   its refNo is **exactly** the next value after the pre-recorded highest suffix — not skipped. Unlike
   TC-108778 (where gaps from unrelated activity are expected and accepted), an exact match is the
   correct check here, since this case's whole point is proving the failed attempt consumed nothing.

### Unique inputs
| Field | Value |
|---|---|
| Invalid attempt Name | `Programme (invalid) <token6>` (no Component Type selected) |
| Follow-up Name | `Department (TC108811 followup) <token6>` |
| Follow-up Component Type | `Department` |

### Notes
- **Writes 1 Component Definition per run** (the follow-up creation, needed to verify step 4) — no
  teardown, matching TC-108778's own convention for this suite.

## TC-108812 — Edge — RefNo counter is monotonically increasing and NOT decremented on delete (framework gap TG-006)

**ADO ID:** 108812 · **Point:** 31251 · **Priority:** 2 · **Tags:** EPM-Redesign-2026-08-11; Edge
**Coverage dimension:** Edge

### Preconditions (ADO literal)
- Signed in as administrator. A Component Type has three Component Definitions with refNos PROG_1,
  PROG_2, PROG_3.

### Deviation — the precondition does not hold live; reconstructed with disposable data instead of touching real tree data (confirmed live, 2026-08-14)

`GET /api/dynamic/Epm/ComponentDefinition/Crud/GetAll` shows only **one** Programme Component Definition
live: `Emmanuel_Prog`, refNo `PROG_1` — real, in-use tree data (the same record referenced by the
hierarchy-definitions suite). `PROG_2` and `PROG_3` do not exist; per the user, `PROG_2` was likely
deleted manually at some point and `PROG_3` appears to have never existed. ADO's precondition
("PROG_1, PROG_2, PROG_3 all exist") is therefore false as written, and the literal step 2 ("Delete
PROG_2") has nothing to act on.

Rather than manufacture the exact `PROG_1/2/3` state by touching `Emmanuel_Prog` (real tree data,
out of scope for this suite), the spec reconstructs an equivalent disposable 3-in-a-row scenario of its
own: create three fresh Programme Component Definitions back-to-back (standing in for PROG_1/2/3),
delete the middle one, then create a fourth and confirm it continues forward from the highest surviving
suffix rather than backfilling the deleted one's freed value. This exercises the exact same underlying
claim — delete does not decrement/backfill the counter — without depending on which specific numbers
happen to be free live, and ties directly into TC-108778's own finding (refNo is a real per-Component-Type
sequence, not a COUNT-based calculation) by testing its converse on delete rather than create.

### Steps (ADO literal)

| # | Action (ADO literal) | Expected (ADO literal) |
|---|--------|----------|
| 2 | Delete PROG_2 via the Component Definition list Delete action. Confirm. | PROG_2 is deleted. PROG_1 and PROG_3 remain. |
| 3 | Create a new Programme Component Definition. | The new record is assigned PROG_4, not PROG_2 — confirming the counter is monotonic and not backfilled. |
| 4 | Note the framework-gap register (TG-006) documents this behaviour and includes the canonical refNos workaround. | Behaviour matches the register. Any downstream test that depends on canonical sequential refNos should re-run Phase 4b of the baseline seed. |

### Step 4 — not independently verified

TG-006 is an external framework-gap register this session has no API/document access to — step 4 is
logged as informational (the in-app behaviour it describes is exactly what steps 2-3 prove), not
independently checked against the register itself.

### Unique inputs
| Field | Value |
|---|---|
| A/B/C/D Names | `Programme (TC108812 <A\|B\|C\|D>) <token6>` |
| Component Type | `Programme` |

### Notes
- **Writes then deletes 4 Component Definitions per run** (A, C, D persist through the test; B is
  deleted mid-test as the case's own subject) — all cleaned up via API `Delete` in a `finally` block
  regardless of pass/fail, matching this session's established safety convention for disposable data.
  `Emmanuel_Prog` (`PROG_1`, the real tree record) is never touched.

## TC-108813 — Integration — Component Definition change triggers ComponentDefinitionChangedEventHandler and Component refNo sync

**ADO ID:** 108813 · **Point:** 31252 · **Priority:** 2 · **Tags:** EPM-Redesign-2026-08-11; integration
**Coverage dimension:** Integration

### Preconditions (ADO literal)
- Signed in as administrator. A Component references a Component Definition. Component.refNo equals
  ComponentDefinition.refNo.

### Setup — reconstructed with disposable data instead of real tree data (confirmed live, 2026-08-14)

The precondition is true live for real tree data (e.g. `Emmanuel_Prog`'s Component and its
ComponentDefinition are both `PROG_1`), but reconstructing this test on that data would mean renaming a
real shared node. Instead the spec builds a disposable Component Definition + linked Component pair
directly via API:
1. `POST ComponentDefinition/Crud/Create` (Programme type) — server generates its own `refNo`.
2. `POST Component/Crud/Create` with `componentDefinition: { id }` **and explicit matching `name`/`refNo`**.

**Confirmed live via a probe:** a Component created with only a `componentDefinition` link (no explicit
`name`/`refNo`) comes back with both fields `null` — there is no automatic copy-on-create sync. A
Component's own `name`/`refNo` are plain client-settable fields on this entity (unlike
ComponentDefinition's own `refNo`, which is server-generated — see
[[epm-componentdefinition-refno-monotonic-sequence]]), so the precondition's "equals" state has to be set
explicitly at creation.

### Steps (ADO literal)

| # | Action (ADO literal) | Expected (ADO literal) |
|---|--------|----------|
| 2 | Open the Component Definition and update the name to "Programme (renamed)". | Save succeeds. ComponentDefinitionChangedEventHandler fires per the source repository. |
| 3 | Reload the linked Component via GetAll. | The Component.name is updated. The refNo remains unchanged. |
| 4 | Confirm the ComponentRefNoEventHandler side effect propagated any refNo update if the definition refNo was PATCHed. | The Component.refNo matches the Component Definition.refNo per seed-time invariant. |

### Step 4 is conditional in ADO's own wording

"...if the definition refNo was PATCHed" — this run never PATCHes the Component Definition's own `refNo`
(confirmed disabled/not user-editable on this form in TC-108778), so there's no refNo change for
`ComponentRefNoEventHandler` to propagate here. Step 4 is treated as re-confirming the
Component.refNo == ComponentDefinition.refNo invariant survived the STEP 2 rename intact, not as a
separate refNo-change exercise.

### Unique inputs
| Field | Value |
|---|---|
| Initial Component Definition name | `TC108813 CD <token6>` |
| Renamed name | `Programme (renamed)` (ADO's literal wording — no token suffix needed, since this record is disposable and looked up by id, not by name search) |
| Component Type | `Programme` |

### Route and form (confirmed live, 2026-08-14)

The list grid's row has **no dedicated Edit icon** — only a "search" link (opens
`/dynamic/Epm/component-definition-details-view?id=...`) and a "delete" icon. Editing happens on the
details view itself, which is **not a modal** (unlike the list's "Add" flow): an **Edit** button toggles
the whole page in-place into an editable form (buttons become "Cancel Form Edit" / "Save"; fields become
plain textboxes). This view also renders fields differently from the Add modal — confirmed only **one**
`<textarea>` exists on this page at all (vs. the Add modal's Name/Ref No/Description trio) — so **Name is
a plain `<input>` here**, not a textarea. A "next textarea after the Name label" locator (reused from the
Add-modal convention) landed on an unrelated, empty textarea. **Fix:** scan every `textbox`-role element
(covers both `<input>` and `<textarea>`) for whichever one currently holds the CD's own name value,
rather than relying on DOM position relative to its label.

**Unit Of Measure is required on this view** (marked `*`) but was left blank at setup (out of scope for
this test's own claim) — Save silently does nothing (no PUT fires) if it's left empty, so the spec fills
it with any available option before saving.

### A note on an unauthenticated-API probe (informational, not part of the graded result)

Before building the UI-driven spec, a quick unauthenticated `curl` probe called
`PUT ComponentDefinition/Crud/Update` directly (no session cookies) and found the linked Component's
`name` did **not** update afterward, even after a 5s wait. The actual browser-driven test — same endpoint,
but through a real authenticated session — **did** show the correct propagation. This suggests the
`ComponentDefinitionChangedEventHandler` side effect may depend on request/session context an
unauthenticated direct API call doesn't provide (or fails silently under this app's ABP-style
current-user/tenant context). Not investigated further since it isn't the graded claim — ADO's steps
specify the authenticated UI path, which is what's tested here and confirmed working correctly.

### A separate, intermittent app defect found while running this case repeatedly (confirmed live, 2026-08-14)

Browsing the Component Definition list → search → details-view flow occasionally (not every run)
creates a **completely blank** ComponentDefinition record (every field null) as a silent side effect,
unrelated to this test's own claim. Found and cleaned up 5 accumulated instances across repeated runs of
this case during this session; isolated via a disposable probe spec to be a genuine intermittent race
condition in that flow (not reliably reproducible from one specific click — see
[[epm-component-definition-orphan-blank-record]] for the full isolation trail). The spec now
snapshots blank-name ComponentDefinition ids before each run and sweeps away any new ones in `finally`,
regardless of whether this affects the current run or not.

### Notes
- **Writes then deletes 1 Component Definition and 1 Component per run** — both disposable, cleaned up
  via API `Delete` in a `finally` block regardless of pass/fail. Real tree data (`Emmanuel_Prog` etc.) is
  never touched. The `finally` block also defensively sweeps for and deletes any unrelated blank
  ComponentDefinition orphans that may have appeared during the run (see above).

## TC-109453 — Positive — Component Definition Calculation Details persist (Unit of Measure, Variance Calculation Type, Calculation Type, Method of Calculation)

**ADO ID:** 109453 · **Point:** 31253 · **Priority:** 2 · **Tags:** EPM-Redesign-2026-08-11; Positive
**Coverage dimension:** Positive

### Preconditions (ADO literal)
- Component Definition create form open with Component Type selected.

### Steps (ADO literal)

| # | Action (ADO literal) | Expected (ADO literal) |
|---|--------|----------|
| 2 | Fill Calculation Details section: Unit of Measure "Percentage", Variance Calculation Type, Calculation Type, Method of Calculation text. | Fields accept the input. |
| 3 | Save. | Record persists with all four Calculation Details fields. |
| 4 | Reload and verify via GetAll. | All four fields return the entered values. |

### Mechanism

ADO only specifies a concrete value for **Unit of Measure** ("Percentage" — seeded via
`UnitOfMeasure/Crud/Create` if absent, same fixture as TC-109440/`epm-component-definition-uom-dropdown.md`).
**Variance Calculation Type** and **Calculation Type** render as plain enum-backed selects with no
ADO-specified value — the spec picks whichever option is first in each dropdown and records its text for
the STEP 4 comparison, rather than hardcoding a guessed option name. **Method Of Calculation** is a plain
free-text `<input>` (confirmed live in TC-108778 — a stray locator accidentally landed on it while
targeting a different field) — filled with a literal placeholder string.

Uses the same `Department` Component Type + create-form flow as TC-108778 (Component Type select → wait
for computed refNo → fill Name/Description), then additionally opens the **Calculation Details**
collapsible section to fill its four fields before Save.

### Unique inputs
| Field | Value |
|---|---|
| Name | `Department (TC109453) <token6>` |
| Component Type | `Department` |
| Unit Of Measure | `Percentage` |
| Variance Calculation Type | first available dropdown option (recorded per run) |
| Calculation Type | first available dropdown option (recorded per run) |
| Method Of Calculation | `TC-109453 method of calculation text` |

### Notes
- **Writes 1 Component Definition per run** — no teardown, matching this suite's established convention
  (ADO's steps specify none, and this doesn't touch shared parent/child config, only adds a new catalog
  row). The `finally` block still runs the same defensive blank-orphan sweep as TC-108813 (see
  [[epm-component-definition-orphan-blank-record]]), since this run also browses the same list/details
  flow area.

## TC-109454 — Integration — Component Definition Additional Information persists and feeds the reporting form

**ADO ID:** 109454 · **Point:** 31254 · **Priority:** 2 · **Tags:** EPM-Redesign-2026-08-11; integration
**Coverage dimension:** Integration

### Preconditions (ADO literal)
- Component Definition create form open.

### Steps (ADO literal)

| # | Action (ADO literal) | Expected (ADO literal) |
|---|--------|----------|
| 2 | Fill Additional Information section: Purpose, Means of Verification, What Measured with narrative text. | Fields accept input. |
| 3 | Save the record. Reload. | *(ADO's own step/expected text is transposed here — "Reload" appears as this step's expected text rather than its own action; transcribed verbatim, treated as "save, then reload" for step 4.)* |
| 4 | Fields display persisted values. | Confirm the three narratives render on the KPI reporting form under the corresponding sections. |

### Two-part verification

Step 4's claim has two distinct halves: (a) the three fields persist and reload correctly via the
Component Definition's own data (verified the same way as TC-109453, via `GetAll`), and (b) — the more
demanding "Integration" half — that those same narratives actually **render on the KPI reporting form**,
a separate UI surface (the Reporting Tree node editor's tabs, per
[[epm-performance-report-tree-navigation]]), not just persisted in the catalog table. Part (b) is tested
by additionally creating a disposable top-level Component (Quantitative KPI type — chosen since ADO calls
it "the KPI reporting form" — linked to the new Component Definition, in the one real Performance Report)
directly via API (bypassing the tree-builder UI entirely, since Component/Crud/Create has no server-side
allowable-child check — see [[epm-component-create-no-server-side-allowable-child-check]] — so a top-level
node of any type can be created without needing a legal parent), then opening that node in the tree editor
(`/dynamic/Epm/performance-report-planning-page?id=<reportId>`) and checking whether Purpose/Means Of
Verification/What Measured render anywhere across its tabs (KPI/KPA · Progress Reporting Periods ·
Component Actioners).

### Unique inputs
| Field | Value |
|---|---|
| Name | `Department (TC109454) <token6>` |
| Component Type | `Department` (for the Component Definition itself — Additional Information isn't type-specific) |
| Purpose | `TC-109454 purpose narrative text` |
| Means Of Verification | `TC-109454 means of verification narrative text` |
| What Measured | `TC-109454 what measured narrative text` |
| Disposable linked Component | `TC109454 KPI <token6>` (Quantitative KPI type, top-level, real Performance Report) |

### RESOLVED — Means Of Verification now persists correctly (was a confirmed bug 2026-08-14, re-checked 2026-08-26/27)

**Original finding (2026-08-14):** Means Of Verification was silently dropped from the outgoing request
— logged POST body never included a `meansOfVerification` key at all, though Purpose/What Measured
persisted fine. Filed as a genuine client-side serialization bug against the **Create** flow that existed
at the time (the Add modal then had Calculation Details/Additional Information inline).

**Since superseded:** the Add modal paradigm changed (see
[[epm-component-definition-details-view-edit-pattern]]) — it now only has Component Definition Details
fields; Additional Information is filled afterward on the record's own details view and saved via an
**Update** (PUT), not the original Create POST. On this current Update path, Means Of Verification is
present in the outgoing body and persists correctly — reconfirmed on 3 independent disposable records
(2 runs 2026-08-26, 1 run 2026-08-27), plus the user's own manual UI edit of a real record (`PROG_1`).
The spec's `expect.soft` on this field now passes; kept soft defensively in case of regression. See
[[epm-component-definition-additional-information-gaps]] (memory update pending) — the bug was real for
the Create-time flow that no longer exists, not a currently-reproducible defect.

**Corrected finding — the reporting form correctly persists the Component Definition reference (not raw
narrative text).** An initial pass checked whether the raw Purpose/Means Of Verification/What Measured
*text* rendered verbatim anywhere on a disposable Quantitative KPI Component's Reporting Tree tabs, found
nothing, and logged that as a tentative second gap. **The user corrected this**: the actual claim is only
that the linked Component Definition itself persists and is correctly retrievable from the reporting
form — confirmed true on both the real `Emmanuel_Department` node's "Department Details" panel and the
disposable KPI node's "KPI/KPA" tab (both correctly show a "Component Definition" field naming the exact
linked catalog record). STEP 4b now checks for that reference, not raw text, and passes. See
[[epm-component-definition-additional-information-gaps]] for the full correction.

### Notes
- **Writes 1 Component Definition per run, no teardown** (matches TC-109453's own convention for this
  suite — ADO's steps specify none for the catalog row itself).
- **The disposable linked Component (created only to test step 4's UI-rendering half) IS cleaned up** via
  API `Delete` in a `finally` block, since it's a real node injected into the shared report tree, unlike
  the Component Definition catalog row above.
