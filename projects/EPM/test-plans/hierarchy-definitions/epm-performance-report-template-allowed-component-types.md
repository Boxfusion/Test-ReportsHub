# EPM — Performance Report Template — allowed Component Type + canBeRoot invariants

**ADO plan:** 108745 — *EPM-QA — Functional Test Plan v2.0 (2026-08-11 redesign baseline)*
**ADO suite:** 109508 — *03 · EPM · Performance Report Template — allowed Component Type + canBeRoot invariants*
**Parent suite:** Phase 01 · EPM · Foundation · Reference Data
**Environment:** QA — `https://pd-epm-adminportal-qa.shesha.app` (API `https://pd-epm-api-qa.shesha.app`)
**Login:** admin.PrincessH / 123qwe (administrator)
**Navigation:** Epm › **Adminstration** › Performance Report Template

> Mirrors a single ADO test case from suite 109508. **ADO is canonical.** Steps are transcribed verbatim
> from `Microsoft.VSTS.TCM.Steps`.

## TC-108779 — Positive — Configure Performance Report Template with allowed Component Type and canBeRoot invariants

**ADO ID:** 108779 · **Point:** (suite 109508) · **Priority:** 2 · **Tags:** EPM-Redesign-2026-08-11; Positive
**Coverage dimension:** Positive

### Preconditions (ADO literal)
- Signed in as administrator. At least one Component Type exists per hierarchy level (Department /
  Programme / Sub-Programme / Quantitative KPI / Qualitative KPI). Confirmed true live — all five exist.

### A stray ADO history comment (not acted on)

`System.History` on this case carries an unrelated auto-logged failure note ("DHS PRT \"DHS APP
2026-27\" must be present after Create... Expected: true Received: false") from a prior, unrelated run —
same pattern as a similar stray comment noted on TC-108778. Not something this session's testing can
explain or reproduce; noted here for context only.

### Steps (ADO literal)

| # | Action (ADO literal) | Expected (ADO literal) |
|---|--------|----------|
| 2 | Navigate to /dynamic/Epm/PerformanceReportTemplate/. Create a new template named "Standard Annual Performance Plan". | The template is saved. The Allowed Component Types grid is visible. |
| 3 | Add Department, Programme, and Sub-Programme with canBeRoot equals Yes. Add Quantitative KPI and Qualitative KPI with canBeRoot equals No. | Five Allowed Component Type rows are visible with the correct canBeRoot values. |
| 4 | Reload the template and verify the persisted rows via the PerformanceReportAllowedComponentType API GetAll for the new template identifier. | The API returns exactly five rows with the expected canBeRoot values. |

### Route and form (confirmed live, 2026-08-14)

ADO's literal path `/dynamic/Epm/PerformanceReportTemplate/` is not real — the real one, matching the
`epm-performance-report-tree-navigation` memory's prediction, is
`/dynamic/Epm/perfomance-report-template` (misspelled "perfomance"). The "Add New Template" modal has:
**Name\*** (input), Short Name, Description (Progress Report Template Details section), and **Period Type
Covered\*** / **Progress Reporting Cycle\*** (both required selects, under Reporting Details — ADO
specifies no value for either, so the spec picks whichever option is first). After Create, the "Allowed
Component Types grid" ADO's step 2 expects lives on the template's own **details view**
(`/dynamic/Epm/perfomance-report-template-details?id=<id>`), titled "Performance Report Allowed Component
Types", with `ComponentType` / `Can be Root` columns.

**The grid's own Add action is hidden behind a responsive overflow menu.** A plain "Add" button visible
elsewhere on the details page is an unrelated page-builder toolbar control — clicking it (even forced)
does nothing. The real functional Add action is behind
`ul[class*="sha-responsive-button-gr"] .ant-menu-submenu-title`, opening an "Add New Performance Report
Allowed Component Type" modal with exactly two fields: **Component Type\*** (searchable/paginated select)
and **Can Be Root** (checkbox).

**The Component Type select is searchable/paginated** — its default option list only shows a handful of
items alphabetically (cutting off before reaching later types like "Sub Programme"), so the spec types
the exact type name to filter before selecting, rather than scanning the unfiltered default list.

**The grid's own data fetch after a page reload is noticeably slower than the page's own loading
spinner clearing.** A fixed short wait can catch the grid mid-load (showing fewer rows than actually
persisted) even though the underlying data is already correct — confirmed via a direct API diagnostic
immediately after adding all 5 rows, which always showed the correct 5, while the UI grid sometimes
lagged behind by several seconds. Neither `[role="row"]` nor the standard AntD
`.ant-table-tbody`/`.ant-table-row` classes match this grid's actual DOM at all (both returned a 0 count
even after a 60s poll, despite a screenshot at that exact moment showing all 5 rows correctly rendered) —
this is a custom Shesha grid component with different internals. The spec checks each Component Type's
exact visible text directly instead of guessing table/row class names.

### Unique inputs
| Field | Value |
|---|---|
| Template name | `Standard Annual Performance Plan <token6>` (ADO's literal name is not unique-safe across reruns) |
| Allowed Component Types | Department (canBeRoot=Yes), Programme (canBeRoot=Yes), Sub Programme (canBeRoot=Yes), Quantitative KPI (canBeRoot=No), Qualitative KPI (canBeRoot=No) |

### Notes
- **Disposable template + junctions, cleaned up in `finally`** — unlike some catalog-row cases in this
  project, this test creates a whole configuration entity (a template) plus 5
  `PerformanceReportAllowedComponentType` junction rows, so all 6 records are deleted after the run
  regardless of pass/fail, matching the disposable-config convention established in TC-109452.
  `Emmanuel_template` (the one real, in-use template) is never touched.

## TC-108814 — Negative — Reject Performance Report Template save with no Allowed Component Type rows

**ADO ID:** 108814 · **Point:** (suite 109508) · **Priority:** 2 · **Tags:** EPM-Redesign-2026-08-11; Negative
**Coverage dimension:** Negative

### Preconditions (ADO literal)
- Signed in as administrator. New Performance Report Template create form loaded with no Allowed rows
  added.

### Precondition mismatch, confirmed live (from TC-108779's own build)

ADO's precondition implies the create form itself has an "Allowed rows" concept that can be left empty
before saving. **Confirmed false** — per TC-108779's own build, the "Add New Template" modal (Name,
Short Name, Description, Period Type Covered, Progress Reporting Cycle) has **no Allowed Component Type
concept at all**. That grid only exists on the template's own **details view**, reachable only *after* the
template is already saved. There is no way to "have the create form loaded with no Allowed rows added" as
a distinct precondition state — every template, by construction, is created with zero rows first and rows
are added afterward as a separate action.

### Steps (ADO literal)

| # | Action (ADO literal) | Expected (ADO literal) |
|---|--------|----------|
| 2 | Enter Name and Period Type. Save. | The form rejects with a validation error citing at least one Allowed Component Type row is required. |
| 3 | Confirm no PerformanceReportTemplate record was persisted. | GetAll count is unchanged. |
| 4 | Retry save after adding one row. Confirm success. | The template persists with the single Allowed Component Type row. |

### Confirmed genuine defect — no such validation exists

Filling only Name + Period Type Covered + Progress Reporting Cycle (the only fields the create form
actually has) and clicking Create **succeeds immediately** — the same behavior already proven correct
and expected in TC-108779, where the template saves successfully before any Allowed Component Type row
exists. There is no server-side or client-side validation requiring at least one row at save time. This
is a genuine missing business-rule validation, not a test artifact — asserted per ADO's literal
expectation (fails/turns red by design), matching this session's established handling of confirmed
defects (same pattern as [[epm-canberoot-leaf-rejection-not-implemented]] and
[[epm-allowable-child-self-reference-not-rejected]]).

Steps 3 and 4, as ADO literally describes them, don't fit the real flow either: step 3 assumes step 2's
save failed (so nothing should persist) — since it actually succeeds, a record clearly exists after step
2. Step 4's "retry save after adding one row" doesn't map onto the real UI either (you can't add an
Allowed Component Type row without a saved template id to attach it to — the grid lives on the details
view, only reachable post-save). The spec instead: confirms the save from step 2 unexpectedly persisted
(documenting the defect precisely), then — as a genuinely useful follow-up given the app's real two-phase
flow — adds one Allowed Component Type row to that same template afterward and confirms it persists
correctly (this part passes, since it's just TC-108779's own already-proven mechanism used once).

### Unique inputs
| Field | Value |
|---|---|
| Template name | `TC108814 Reject No Rows <token6>` |
| Follow-up Allowed Component Type | Department (canBeRoot=No) |

### Notes
- **Disposable template + junction, cleaned up in `finally`**, matching TC-108779's convention.

## TC-108815 — Edge — Allowed Component Type list rejects a duplicate Component Type entry

**ADO ID:** 108815 · **Point:** (suite 109508) · **Priority:** 2 · **Tags:** EPM-Redesign-2026-08-11; Edge
**Coverage dimension:** Edge

### Preconditions (ADO literal)
- Signed in as administrator. A Performance Report Template already has Department as an Allowed
  Component Type. Built live: a disposable template with a single Department row (`canBeRoot=false`),
  via the same details-view mechanism proven correct in TC-108779/TC-108814.

### Steps (ADO literal)

| # | Action (ADO literal) | Expected (ADO literal) |
|---|--------|----------|
| 2 | Attempt to add Department a second time to the same template. | The form rejects with a unique-constraint error on the PerformanceReportAllowedComponentType junction. |
| 3 | Confirm via GetAll that only one junction row exists for Department. | Row count for that junction is unchanged. |
| 4 | Confirm the canBeRoot value on the existing row is untouched. | The pre-existing row is intact. |

### Confirmed live, 2026-08-17 — behaves as ADO expects, no defect

Repeating the details view's Add flow for a Component Type already present on the template produces
`HTTP 400` on `POST .../PerformanceReportAllowedComponentType/Crud/Create` — a genuine server-side
unique-constraint rejection, not just a client-side filter. The spec's second attempt deliberately used a
different `canBeRoot` value (`true`, vs. the original row's `false`) specifically to prove the rejected
write has no side effect on the surviving row — confirmed: the original row's `canBeRoot` stayed `false`
after the rejected duplicate attempt.

### Unique inputs
| Field | Value |
|---|---|
| Template name | `TC108815 Duplicate Reject <token6>` |
| Precondition row | Department (canBeRoot=No) |
| Duplicate attempt | Department (canBeRoot=Yes) — deliberately different, to test for cross-contamination |

### Notes
- **Disposable template + junction, cleaned up in `finally`**, matching TC-108779/TC-108814's convention.

### Reconfirmed 2026-08-28 — same PASS result, one flaky test-detection gap fixed

Re-ran headed: duplicate Department entry correctly blocked again (row count stayed at 1, original row's
`canBeRoot` untouched). Along the way, hit and fixed a genuine gap in the spec's own detection logic, not
an app regression: the spec only recognized "rejected" via a client-filtered dropdown or an observed HTTP
4xx on the duplicate POST — this run hit neither within its wait window (no POST observed at all within
5s, and Department wasn't filtered from the picker either), even though the app had in fact correctly
blocked the duplicate. Fixed by adding a ground-truth `PerformanceReportAllowedComponentType/Crud/GetAll`
fallback check (the same check STEP 3 already performs independently) instead of inferring the outcome
from network timing alone.

## TC-108816 — Integration — Publishing a Performance Report using a template with wrong canBeRoot flags fails validation

**ADO ID:** 108816 · **Point:** (suite 109508) · **Priority:** 2 · **Tags:** EPM-Redesign-2026-08-11; integration
**Coverage dimension:** Integration

### Preconditions (ADO literal)
- A Performance Report Template has Department set with canBeRoot equal to false. Reporting Tree is
  seeded with Department as the root. **Confirmed unreachable via the UI at all** — see below.

### Steps (ADO literal)

| # | Action (ADO literal) | Expected (ADO literal) |
|---|--------|----------|
| 2 | Attempt to Publish the Performance Report via the User Interface Publish action. | The publish is rejected by ValidateReadyToPublishAsync with an error citing canBeRoot invariants. |
| 3 | Fix the template so Department has canBeRoot equal to true. | The correction is saved. |
| 4 | Retry Publish. | Publish succeeds and the audit trail records the correction and the successful publish. |

### Precondition mismatch, confirmed live 2026-08-17 — the UI itself blocks building this state

The Reporting Tree builder's **"Add Top Level Item"** action only offers component types whose Allowed
Component Type row on the template has `canBeRoot=true`. With Department at `canBeRoot=false` (exactly
what this precondition needs), clicking it does nothing at all — no dropdown, no modal, no error, and
(confirmed via a `Component/Crud/GetAll` diff) no orphan record either. A control run against an
otherwise-identical template with Department at `canBeRoot=true` added it immediately with no picker
(only one eligible type existed). So the client silently enforces canBeRoot on the way into the tree —
there is no way to reach "tree seeded with a canBeRoot=false root" through the app itself. The whole
precondition (template, two Allowed Component Type rows, disposable report, root Component, child KPI
Component, one ComponentActioner row) was built directly via the API instead — the only way to reach it.

Two further gates were discovered and had to be satisfied along the way (both correctly enforced, not
defects): Publish rejects a tree with no KPI descendant ("no reportable KPIs"), and rejects a KPI with no
assigned actioner ("N KPI(s) have no assigned Process Owner"). Real endpoint confirmed live:
`PUT /api/v1/Epm/PerformanceReports/PublishPerformanceReport?id=<id>` (not a generic Crud action); the
disposable report itself is created via `POST /api/v1/Epm/PerformanceReports/CreatePerformanceReport`
with a flat body (`{name, shortName, templateId, periodCoveredId}` — GUIDs, not nested `{id}` objects).

### Confirmed genuine defect — canBeRoot is never validated at publish time

Once the two gates above are satisfied, clicking **Publish Performance Report** on a report whose tree
root has `canBeRoot=false` on its template **succeeds immediately** — `HTTP 200`, no error, status flips
PLANNING → REPORTING IN PROGRESS, the action flips to "Unpublish Performance Report". No canBeRoot
validation exists in this path at all. This is a genuine missing business-rule check, matching the same
pattern as [[epm-canberoot-leaf-rejection-not-implemented]] and
[[epm-allowable-child-self-reference-not-rejected]] — asserted per ADO's literal expectation (fails/turns
red by design).

STEP 4 ("Retry Publish") is unreachable as ADO literally describes it, as a direct consequence: the
report is already published by STEP 2, so there is no "Publish" button left to retry. The spec instead
confirms the "Unpublish Performance Report" action is now visible, proving STEP 2's success was a real
state change and not a no-op.

**A transient false lead, not reproducible:** early manual API probing of this precondition (both via raw
`curl` with no session and via an authenticated Playwright request) repeatedly hit `HTTP 500` —
`"Evaluation failure on value(Shesha.Enterprise.Session.ClaimsEnterpriseSession).GetUserId()"` — regardless
of the actioner's identity or canBeRoot's value. The final clean automated run (real browser click, fresh
disposable data) published successfully with no crash, twice in a row. Noted so a future session doesn't
re-chase it as a confirmed bug.

**Cross-checked on a second real environment, same day:** verified again on
`pd-epm-adminportal-qa-wf.shesha.app` (login `admin.PrincessH`) — the host ADO's own case Description
actually names — against the real, pre-existing "DHS APP 2026-27" report rather than disposable data.
Its tree was initially incomplete (one bare Programme root, no KPI; Department was `canBeRoot=true`
there too). With the user's explicit go-ahead, temporarily flipped Department to `canBeRoot=false` on
that real template and added a real Department root + KPI + Process Owner, then published for real:
identical result — `HTTP 200`, "Successfully published report.", no canBeRoot rejection. Reverted
afterward (unpublished, deleted the added rows, canBeRoot restored to `true`) except one residual: the
report's `publicationDate` field still carries this test's timestamp — the app's own Unpublish action
doesn't null it back out, and it was left alone rather than hand-edited via a raw API write.

### Unique inputs
| Field | Value |
|---|---|
| Template name | `TC108816 CanBeRoot <token6>` |
| Allowed Component Types | Department (canBeRoot=false → fixed to true in STEP 3), Quantitative KPI (canBeRoot=false, child-only) |
| Report | `TC108816 Report <token6>`, Period Covered = Financial Year 2026/2027 |
| Reporting Tree | Department (root, via API) → Quantitative KPI (child, via API) |
| Process Owner | Princess Hlazo, ComponentActioner level 20 |

### Notes
- **Disposable template + 2 junctions + report + 2 components + 1 actioner row, cleaned up in `finally`**
  — swept and confirmed empty across all five touched entities after the run.
- Period Type Covered = Financial Year and Progress Reporting Cycle = Quarter must be picked (not just
  "first option") — the report's Period Covered ("Financial Year 2026/2027") only has Quarter-type
  children, and `CreatePerformanceReport` rejects with "Period ... has no child periods matching the
  template's reporting cycle" on any mismatch.
- The Template select in "Add New Performance Report" is a searchable/paginated picker like others in
  this suite — search by the full unique template name, not a shared prefix, or the disposable template
  can be missing from the (capped) result list entirely.
