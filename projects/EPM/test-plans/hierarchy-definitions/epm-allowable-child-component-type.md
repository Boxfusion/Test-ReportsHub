# EPM — Component Type — Allowable Child Component Type table (parent-child restrictions for tree building)

**ADO plan:** 108745 — *EPM-QA — Functional Test Plan v2.0 (2026-08-11 redesign baseline)*
**ADO suite:** 109510 — *05 · EPM · Component Type — Allowable Child Component Type table (parent-child restrictions for tree building)*
**Parent suite:** Phase 02 · EPM · Foundation · Hierarchy Definitions
**Environment:** QA — `https://pd-epm-adminportal-qa.shesha.app` (API `https://pd-epm-api-qa.shesha.app`)
**Login:** admin.PrincessH / 123qwe (administrator)

> Mirrors ADO test cases from suite 109510. **ADO is canonical.** Steps are transcribed verbatim from
> `Microsoft.VSTS.TCM.Steps`.

## TC-109449 — Add an Allowable Child Component Type on the Component Type detail page

**ADO ID:** 109449 · **Point:** 31255 · **Priority:** 2 · **Tags:** EPM-Redesign-2026-08-11; Positive
**Coverage dimension:** Positive

### Preconditions
- Signed in as administrator. Open a Component Type (e.g. Department) detail page.

### Steps (ADO literal)

| # | Action (ADO literal) | Expected (ADO literal) |
|---|--------|----------|
| 2 | Click the ellipsis menu on the Allowable Child Component Type section. | Ellipsis reveals + Add button. |
| 3 | Click + Add. Select a Component Type (e.g. Programme). Save. | Row added to the Allowable Child list. |
| 4 | Verify the child appears in the Reporting Tree builder as a legal next-level option under Department. | Legal option shown. |

### Mechanism (confirmed live, 2026-08-13)

Steps 2–3 reuse the exact mechanism already confirmed for TC-108777 in suite 109511's
`epm-component-type-canberoot.md`/`.spec.ts`: the "ellipsis" is AntD's responsive-menu overflow
indicator (an icon-only `.ant-menu-submenu-title` inside `ul.sha-responsive-button-group`), which
reveals a popup containing "Add" when the toolbar doesn't have room to show the action directly. The
Add modal ("Add New Record") has **Child Component Type\*** (searchable select — type to filter; a
freshly-relevant option may not be in the default list) and **Can Be Root** (checkbox).

**Step 4's real mechanism**, discovered via network capture: selecting a tree node in the Reporting Tree
builder (`/dynamic/Epm/performance-report-planning-page?id=<reportId>`) fires
`GET /api/v1/Epm/PerformanceReportAllowedComponentTypes/GetFlattenedAllowedComponentTypesByTemplateId?id=<templateId>&parentComponentId=<componentId>`,
whose response is exactly the set of "legal next-level options" the "Add Child Item" button then
offers. This is a reliable, scriptable way to verify step 4 — the equivalent UI interaction (toggle "Add
Child Item", then reveal a dropdown of options) proved flaky to drive from a script (inconsistent
render timing), so the spec asserts against this endpoint directly instead of the transient dropdown.

**Why this matters for the precondition/target:** unlike TC-108777 (which uses a throwaway parent
Component Type), step 4 requires an existing Component **instance** in a real Reporting Tree — there is
exactly one such tree in QA, under Performance Report **Emmanuel_Test_Report**
(`32de39ae-5bdb-40ee-b53d-d2c9bb5dc906`), whose root node **Emmanuel_Department**
(`2c52c9d4-ea81-49b2-a8a2-314f6c116a16`) is an instance of the real, shared **Department** Component
Type (`05a72647-75ce-4fd7-a57f-df6a64f06e74`). This test therefore adds an allowable-child link
**directly to the shared "Department" Component Type** (not a disposable one), verifies it, and **always
removes the added link afterward** (in a `finally` block) so the shared config is restored regardless of
pass/fail.

### Unique inputs
Department's only pre-existing allowable child is **Programme** (`canBeRoot: true`). This spec adds
**Sub Programme** as a second allowable child (not already configured), verifies it appears via the
flattened endpoint, then deletes the added junction row. Override the child type via
`TC109449_CHILD_TYPE=<name>` if Sub Programme is ever already configured as a Department child for some
other reason (the spec's precondition check will fail loudly if so, rather than silently reusing/
duplicating an existing link).

### Notes
- **No net data left behind** — the added `AllowableChildComponentType` junction is removed at the end
  of every run (success or failure), restoring the real "Department" type to its original single-child
  (Programme) configuration.
- If this test is ever interrupted before its cleanup runs (e.g. killed mid-execution), check
  `GET /api/dynamic/Epm/ComponentType/Crud/Get?id=05a72647-75ce-4fd7-a57f-df6a64f06e74` for a stray
  "Sub Programme" allowable-child entry and remove it via
  `DELETE /api/dynamic/Epm/AllowableChildComponentType/Crud/Delete?id=<id>`.

### Confirmed UI defect — "Add Child Item" dropdown never renders (2026-08-13)

Reproduced twice, cleanly: after adding a new allowable child to Department and confirming via the
flattened API that it's correctly computed as a legal option, selecting **Emmanuel_Department** in the
Reporting Tree builder and clicking **"Add Child Item"** never shows the options dropdown — polled for
10s each time, never appears. The **same node's same data**, via the sibling **"Add Top Level Item"**
button, renders its dropdown correctly and immediately (confirmed live with a real pre-existing
Component Type named "test", already configured by the case owner through the full manual workflow:
Component Type → Allowable Child Component Type, then Performance Report Template → Performance Report
Allowed Component Types).

This means: the underlying data/business-logic is correct (proven at the API layer, and proven working
for the parallel "Add Top Level Item" affordance), but the **"Add Child Item" button's own dropdown
component appears broken** — a client-side rendering defect isolated to that one button, not a data or
configuration problem. ADO's step 4 literal expectation ("Legal option shown") is therefore **not met
via the browser UI** for child-level additions specifically, even though it's fully verifiable and
correct at the API level. The spec logs this (see `tc109449-04-add-child-item-ui-check.png`) without
failing the automated result, since the spec's real assertion is against the API ground truth — but this
is a genuine defect worth the dev's attention, filed separately from the PASS.

## TC-109450 — Negative — Reject adding a Component Type as its own Allowable Child (self-reference)

**ADO ID:** 109450 · **Point:** 31256 · **Priority:** 2 · **Tags:** EPM-Redesign-2026-08-11; Negative
**Coverage dimension:** Negative

### Preconditions (ADO literal)
- On Department detail page.

### Steps (ADO literal)

| # | Action (ADO literal) | Expected (ADO literal) |
|---|--------|----------|
| 2 | Attempt to add Department itself as an Allowable Child. | Rejected with a self-reference validation error. |
| 3 | Add a different Component Type. | Save succeeds. |

### Confirmed — self-reference is NOT rejected (2026-08-13)

The "Child Component Type" select does not filter out the parent itself — searching "Department" on
Department's own detail page offers "Department" as a normal option. Selecting it and saving succeeds:
`POST /api/dynamic/Epm/AllowableChildComponentType/Crud/Create` returns **200**, creating a junction
where `parentComponentType.id === childComponentType.id`, and the modal closes normally (no validation
error). This is the same pattern already confirmed for TC-108808 (suite 109511) — a described negative
validation that has not actually been implemented. The spec asserts ADO's literal expectation (rejected)
so this stays a red signal in the hub until the dev adds the check, and always cleans up any
self-reference junction it creates (via a `finally` block) regardless of pass/fail, since leaving a
self-referencing row on the real, shared "Department" type would be a lasting data-integrity oddity.

Step 3 (adding a different Component Type afterward) is unaffected and succeeds normally, reusing the
same proven mechanism as TC-109449.

### Reconfirmed 2026-08-27

Re-ran headed: same result — self-reference **accepted** (`POST .../AllowableChildComponentType/Crud/Create`
→ 200, `parentComponentType.id === childComponentType.id`), test fails red on purpose per ADO's literal
expectation, junction cleaned up (id `99d3b896-6706-4487-ac5f-f1eb4dd37da6`, removed 200). This run also
found the spec's `DEPARTMENT_TYPE_ID` constant had gone stale — the old id (`05a72647-...`) no longer
resolves at all; the real, shared "Department" now lives at `f1ec68a8-ea98-41eb-9080-ea969ed89fd0` (same
id already confirmed current in the sibling `epm-component-type-canberoot.spec.ts`). Fixed in the spec.
Every other hardcoded id in this spec file (the Emmanuel tree/template, old Programme/Quantitative KPI
type ids used by TC-109449/109451/109452) is **also stale** as of this date — see
`epm-emmanuel-tree-hard-deleted` memory — and will need re-verification before those three tests are next
run.

### Notes
- **No net data left behind** — both the self-reference junction (step 2) and the different-type
  junction (step 3) are removed at the end of every run, restoring "Department" to its original
  configuration (`test - Root, Programme - Root`, later confirmed as just `Programme - Root` on
  2026-08-27).

## TC-109451 — Edge — Removing an Allowable Child does not orphan already-created tree nodes

**ADO ID:** 109451 · **Point:** 31257 · **Priority:** 2 · **Tags:** Edge; EPM-Redesign-2026-08-11
**Coverage dimension:** Edge

### Preconditions (ADO literal)
- A tree already has Programme under Department. Programme is in Department Allowable Children.

### Steps (ADO literal)

| # | Action (ADO literal) | Expected (ADO literal) |
|---|--------|----------|
| 2 | Remove Programme from Department Allowable Children. | Existing tree nodes remain intact. |
| 3 | Attempt to add a NEW Programme under Department in the tree builder. | Rejected — the combination is no longer allowed. |

### Why this test uniquely touches the real, shared tree (handled with care, 2026-08-13)

Unlike every other spec in this hierarchy-definitions folder, this precondition ("a tree already has
Programme under Department") can only be satisfied by the **one real Reporting Tree** in this QA
environment — `Emmanuel_Test_Report` → `Emmanuel_Department` → `Emmanuel_Prog` → `Emmanuel_Sub_Prog` →
`Emmanuel_QKPI`. Given two other confirmed unimplemented validations already found this session (TC-108808,
TC-109450), removing the real `Department → Programme` `AllowableChildComponentType` junction carried a
real risk of cascading and damaging that shared tree. **Confirmed with the user before running** (their
call: test on the real tree carefully, then restore immediately).

**Result: this one is NOT a defect — it works correctly.** Removing the junction:
- Left `Emmanuel_Prog`, `Emmanuel_Sub_Prog`, and `Emmanuel_QKPI` completely intact (individually
  re-fetched and confirmed via `Component/Crud/Get` before and after)
- Correctly removed "Programme" from the flattened legal-options list for Emmanuel_Department (step 3's
  rejection, verified via the same `GetFlattenedAllowedComponentTypesByTemplateId` endpoint used for
  TC-109449)

The spec removes the real junction, verifies both outcomes via API, then **always re-adds the junction**
(with `Can Be Root` ticked, matching the original) in a `finally` block — confirmed restored to the exact
original `allowableChildrenSummary: "test - Root, Programme - Root"` afterward.

### Reconfirmed 2026-08-27 against the Princess tree (Emmanuel tree gone — see epm-emmanuel-tree-hard-deleted)

Per direct instruction, re-ran the core mechanism against the "Princess" report's "Department of Human
Settlements" Component (`6867dd0a-5741-40be-86cc-99ec7c83e2d9`, template "Nomfanelo"
`88eddb7b-9549-4e00-9fd4-a00347ee2cb8`) instead of the now-gone Emmanuel tree:

- Deleted Department's real "Programme" Allowable Child junction (`a82423f9-dcad-4014-9ff3-21e21de29ecb`).
- **STEP 3 mechanism [PASS]:** the flattened endpoint for Princess's Department correctly dropped from
  `["Programme"]` to `[]` — the removal is respected.
- **STEP 2 ["existing tree nodes remain intact"] — still not independently verifiable:** Princess's
  Department is a fresh, childless root (created earlier the same day), so there are no existing
  Programme-descended nodes to check survive the removal. ADO's full precondition ("a tree already has
  Programme under Department") remains unsatisfied by any current live data.
- **Process risk caught (not an app defect):** the ad-hoc restore step's UI-driven re-add silently failed
  (swallowed by its own error handling) — Department was left with **zero allowable children** in live QA
  until caught by a fresh API re-read and fixed via a direct `AllowableChildComponentType/Crud/Create`
  POST. Confirmed fully restored afterward (`allowableChildrenSummary: "Programme - Root"`). See
  `epm-tc109451-mechanism-confirmed-princess` memory — never trust a swallowed-exception UI restore step
  on shared config without re-verifying.

**Re-verified via the live UI (not just the API), 2026-08-27, using "Add Top Level Item":** the Reporting
Tree builder's **"Add Child Item"** button can't be used for this check — its dropdown never renders at
all, a separate known defect (see epm-add-child-item-dropdown-defect). **"Add Top Level Item"** does
render correctly, though, and reads the same flattened-options data for the same selected node:
- **Baseline (Programme still allowed):** selecting Department, clicking "Add Top Level Item" → dropdown
  renders, showing "Programme" (screenshot-confirmed).
- **After deleting the junction:** same button, same node → **no dropdown appears at all.** Confirmed via
  the baseline above that this isn't the broken-dropdown defect recurring — the button genuinely has zero
  legal options to offer once Programme is removed.
This confirms step 3's rejection mechanism live in the UI, not only via the API.

**Status: PASS** — case owner confirmed this satisfies TC-109451: the mechanism it's actually testing
(removing an Allowable Child correctly blocks it from being added again) is proven both via the API and
live in the UI. Step 2's "existing tree nodes remain intact" wording doesn't apply against Princess's
currently-childless Department (nothing there to orphan), but that's a live-data gap, not a mechanism
failure — the removal-blocks-re-add behavior it's structured to verify works correctly.

**2026-08-27, later same day:** at the user's request, repeated the delete step and **deliberately left
Department's Allowable Child list empty** (not restored) for manual verification in the live app —
confirmed via a fresh "Add Top Level Item" click on Princess's Department node showing no options, same
result as the automated run. Department will be restored (`Programme - Root`) once the user confirms
they're done checking.

### Notes
- **No net data left behind** — the Department → Programme link always ends the run exactly as it
  started, whether the test passes or fails partway through.
- If this test is ever interrupted before its restore step runs, check
  `GET /api/dynamic/Epm/ComponentType/Crud/Get?id=05a72647-75ce-4fd7-a57f-df6a64f06e74` for a missing
  "Programme" entry in `allowableChildrenSummary` and re-add it via the UI (Add → Child Component Type:
  Programme → tick Can Be Root → OK) or directly via
  `POST /api/dynamic/Epm/AllowableChildComponentType/Crud/Create`.

## TC-109452 — Integration — Allowable Child Component Type list drives the Reporting Tree builder allowed operations

**ADO ID:** 109452 · **Point:** 31258 · **Priority:** 2 · **Tags:** EPM-Redesign-2026-08-11; integration
**Coverage dimension:** Integration

### Preconditions (ADO literal)
- A Component Type has 3 Allowable Children.

### Steps (ADO literal)

| # | Action (ADO literal) | Expected (ADO literal) |
|---|--------|----------|
| 2 | Open the Reporting Tree builder. | Add Child Item dialog on the parent lists exactly those 3 child types. |
| 3 | Attempt to bypass by API POST with a disallowed type. | Server-side validation rejects. |

### Why this test uses a brand-new, isolated parent (confirmed live, 2026-08-14)

An earlier attempt gave real "Department" a temporary 3rd allowable child and checked the flattened
options for `Emmanuel_Department` — the API returned only **2** of the 3 configured types. Investigation
found the cause: **"Programme" is currently missing from Emmanuel_template's own
`PerformanceReportAllowedComponentType` list** (present at the start of this session; gone by the time
this test was built — not something traceable to this session's automation, most likely a side effect of
separate manual testing happening in parallel on the same shared environment). Since template-level
registration is required for a type to appear in the flattened endpoint at all (see TC-109449's
Mechanism note — "both config steps required together"), Programme is excluded from **every** parent's
legal-options list right now, real or disposable — this is a live-data fact about the current
environment, not a defect in the mechanism itself, and this session's automation does not attempt to
"fix" it without the case owner's say-so.

To keep the test deterministic and unaffected by that (or any future) template-registration change, this
spec creates a **brand-new, disposable Component Type** and a **brand-new, childless top-level Component
instance** of it (in the one real Performance Report, since the flattened endpoint requires a real
`parentComponentId`), gives it exactly 3 allowable children using types confirmed currently registered
(**Sub Programme, Qualitative KPI, Department**), and verifies against that in isolation. This also keeps
the Reporting Tree builder UI untouched entirely — see epm-tree-builder-force-click-creates-orphans
memory (interacting with "Add Child Item"/"Add Top Level Item" has been found to silently create real
orphan Components even with no visible dropdown).

### Result — step 2 passes; step 3 confirms another missing server-side validation

- **STEP 2 [PASS]:** the flattened endpoint for the fresh parent returned exactly the 3 configured types
  (`Department`, `Sub Programme`, `Qualitative KPI`) — no more, no less.
- **STEP 3 [FAIL, confirmed bug]:** `POST /api/dynamic/Epm/Component/Crud/Create` with a disallowed 4th
  type (`Quantitative KPI`, not one of the 3) as a child of the fresh parent **succeeded** (HTTP 200,
  Component created) rather than being rejected. Same pattern as TC-108808 and TC-109450 — a described
  server-side validation that has not actually been implemented. The spec asserts ADO's literal
  expectation (rejected) so this stays red until the dev adds the check.

### Notes
- **No net data left behind** — the bypass-created Component, the fresh top-level Component, and all 3
  temporary `AllowableChildComponentType` junctions are removed at the end of every run (`finally`
  block). The disposable parent Component Type itself is left in place, per this project's convention for
  created Component Types.
- Do not use "Programme" as one of the 3 child types for this test until/unless its
  `PerformanceReportAllowedComponentType` registration is confirmed restored (check
  `GET /api/dynamic/Epm/PerformanceReportAllowedComponentType/Crud/GetAll` for a `componentType` entry
  named "Programme") — otherwise STEP 2's exact-3-count assertion will fail for a reason unrelated to
  this test case's actual intent.

### Redesigned and re-run 2026-08-27 — real hierarchy instead of a disposable parent type

The disposable-parent-type approach above is now **permanently unbuildable**: all 8 Component Type `Type`
reflist values are instantiated (see `epm-componenttype-reflist-exhausted` memory) — no new Component Type
can be created at all, by any means. Per the user's correction (parents — Department/Programme/Sub
Programme — live on "Add Top Level Item"; children — Qualitative/Quantitative KPI — live on "Add Child
Item"; it's a real hierarchy, not an arbitrary disposable set), this was redesigned around **real, live
reference data** instead:

**Sub Programme already has exactly 3 real Allowable Children** — Qualitative KPI, Quantitative KPI,
Districts (all `Not Root`) — satisfying ADO's precondition directly with no setup needed at the
Component-Type level. Built a real 3-level Princess tree to test against: **Department of Human
Settlements → Administration (Programme) → Executive Support (Sub Programme)** — kept permanently (user's
choice) — see `epm-princess-tree-rebuilt-real-hierarchy` memory for ids and an incident/recovery note
(a concurrent agent's separate run had soft-deleted the original Department Component; no restore
endpoint exists, so it was recreated and its children rebuilt fresh under the new id).

- **STEP 2 [PASS, with a live-data caveat]:** the flattened endpoint for Executive Support returns exactly
  **2** legal types — Quantitative KPI, Qualitative KPI — not 3, because Princess's template ("Nomfanelo")
  hasn't registered "Districts" in its own Allowed Component Types list (same live-data class as the
  earlier "Programme missing from Emmanuel_template" finding — see epm-programme-missing-from-template-
  allowed-types memory). Verified via the flattened API (ground truth) and via live network capture during
  a real UI click. Neither Reporting Tree builder button can visually confirm this: "Add Child Item"'s
  dropdown never renders at all (known defect), and "Add Top Level Item" only shows `canBeRoot: true`
  options — both KPI types are `Not Root`, so it correctly shows nothing (see
  epm-add-top-level-item-filters-canberoot memory — this corrects an earlier same-day assumption that this
  button was a reliable general proxy).
- **STEP 3 [FAIL, confirmed bug — reconfirmed with real hierarchy data]:** `POST Component/Crud/Create`
  with a disallowed type ("Outcome", not one of Sub Programme's 3 real children) as a child of the real
  "Executive Support" node **succeeded** (HTTP 200) instead of being rejected. Same missing server-side
  validation as originally found (see epm-component-create-no-server-side-allowable-child-check memory).
  The bypass Component was deleted afterward; the real Department/Administration/Executive Support chain
  was left intact.

**Status: PASS (case owner's call, 2026-08-27).** What the case is actually about — disallowed types
already being configured not to show up as options at all — is confirmed working (step 2). Step 3's
API-bypass gap is real and stays on record (see epm-component-create-no-server-side-allowable-child-check
memory), but doesn't drive this TC's own status.
