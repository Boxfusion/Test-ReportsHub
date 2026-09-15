# EPM — Create a new Component Type with canBeRoot set for a non-leaf hierarchy level

**ADO plan:** 108745 — *EPM-QA — Functional Test Plan v2.0 (2026-08-11 redesign baseline)*
**ADO suite:** 109511 — *04 · EPM · Component Type management — create / edit / delete + canBeRoot rule*
**Parent suite:** Phase 02 · EPM · Foundation · Hierarchy Definitions
**Environment:** QA — `https://pd-epm-adminportal-qa.shesha.app` (API `https://pd-epm-api-qa.shesha.app`)
**Login:** admin.PrincessH / 123qwe (administrator)
**Navigation:** Epm › **Adminstration** › Component Type → `/dynamic/Epm/component-types` → **Add**

> Mirrors a single ADO test case from suite 109511. **ADO is canonical.** Steps are transcribed verbatim
> from `Microsoft.VSTS.TCM.Steps`.

## TC-108777 — Positive — Mark an Allowable Child Component Type as Root for a non-leaf hierarchy level

**ADO ID:** 108777 · **Point:** 31259 · **Priority:** 2 · **Tags:** EPM-Redesign-2026-08-11; Positive
**Coverage dimension:** Positive

> **2026-08-13 rewrite:** the original ADO wording (below, superseded) asked to set `canBeRoot` while
> creating a Component Type. That field does not exist anywhere in this app (confirmed live) — "Can be
> root" is a property of the `AllowableChildComponentType` junction (a parent Component Type → child
> Component Type pairing), set via **Adminstration › Component Type › open a Component Type ›
> Allowable Child Component Type grid › 3-dot menu › Add › Child Component Type: Programme › Can Be
> Root › OK**. ADO's case content has been updated to match (see the memory `epm-component-type-form-
> fields` for the discovery trail); the steps below are the corrected, confirmed-live version.

### Preconditions
- Signed in as administrator. Component Type list page loaded.
- ADO's literal path `/dynamic/Epm/ComponentType/` **404s** ("Form 'Epm/ComponentType' not found"). The
  real route, found via the Epm ›  Adminstration flyout, is `/dynamic/Epm/component-types`.

### Steps (re-scoped 2026-08-27 — see Deviation below; originally corrected 2026-08-13)

| # | Action | Expected |
|---|--------|----------|
| 1 | Navigate to Epm > Adminstration > Component Type and open the real, existing `Department` Component Type (creating a disposable one is no longer possible — see Deviation). | The Component Type detail view loads (`/dynamic/Epm/component-type-details-view?id=...`), showing the Allowable Child Component Type grid. |
| 2 | **If** `Programme` is already listed as an Allowable Child, verify its format (Can be Root = Yes). **Else** add it via the 3-dot menu → Add → Child Component Type: Programme → tick Can be root → OK. | The grid shows a row: Child Component Type = Programme, Can be Root = Yes — either pre-existing or freshly added. |
| 3 | Verify via the network response body from the `ComponentType` Crud GetAll endpoint (not the junction — the parent's own `allowableChildrenSummary`/`allowableChildComponentTypes` fields are the reliable read). | The parent's `allowableChildrenSummary` reads `"Programme - Root"` and `allowableChildComponentTypes` is populated. |

### Deviation — creating a new Component Type is not possible by design; verify-or-create against the real "Department" record instead (confirmed live, 2026-08-27)

The original approach (a disposable `Department`-type parent, to avoid mutating shared reference data)
stopped working: clicking **Create** on the "Add New Component Type" form fires no network request and
shows no visible validation error — the modal just stays open. Root-caused via a browser console-error
listener: the form's client-side pre-save script throws `Error: DUPLICATE_COMPONENT_TYPE`. **This is
correct, intended behaviour, not a bug** — per the user: QA's 7 Component Types (`Department`,
`Programme`, `Sub Programme`, `Quantitative KPI`, `Qualitative KPI`, `Outcome`, `Output`) are a **closed,
singleton set by design** — each `Type` reflist value backs exactly one `ComponentType` record, and the
app is correctly rejecting a second record that reuses `Type = Department`. (The one rough edge: the
rejection surfaces only in the browser console, with no toast or inline message — a minor UX polish
item, not a functional defect.)

Per the user's general guidance: when a case's target may already exist as a singleton, **check whether
it's already configured correctly first, and only create if it's genuinely missing** — don't assume
creation is always the right path. The case now opens the **real** `Department` Component Type —
already has `Programme` as an Allowable Child at `Can Be Root = Yes` — and checks the format if it
already exists, or adds it if it doesn't. This is idempotent against either app state and touches no
create-only code path.

### Superseded ADO wording (original, pre-2026-08-13)

| # | Action (ADO literal) | Expected (ADO literal) |
|---|--------|----------|
| 2 | Navigate to /dynamic/Epm/ComponentType/ and click the primary Create button on the Component Type list toolbar. | The Component Type create form loads. Every mandatory field is highlighted. |
| 3 | Enter Name equals "Programme (test)", short code, and set canBeRoot to true. Save the form. | A confirmation toast appears. The list refreshes and the new Component Type row shows canBeRoot equals Yes. |
| 4 | Open the newly created row and verify the record via the network response body from ComponentTypesAppService. | Response contains the new Component Type identifier, canBeRoot equals true, and the reflist-backed Type value matches the selection. |

### Deviation — "canBeRoot" and "short code" do not exist on the Component Type create form (confirmed live, 2026-08-12)

The "Add New Component Type" modal (`Epm/component-type-create-form v2`) has exactly these fields —
confirmed by opening it live:

| Section | Fields |
|---|---|
| Component Details | Name\*, Description, Icon, Type\* (select), Based On Definition\* (select: Always / Never / Optional), Admin Tree Create Form |
| Flags & Visibility | Is Indicator, Show In Admin Tree, Progress Reporting Required, Is Folder, Show In Viewer Tree, Progress Reviewing Required |

There is **no `canBeRoot` checkbox and no "short code" field** — not in this form, and not in the
`ComponentType` entity returned by `GET /api/dynamic/Epm/ComponentType/Crud/GetAll`.

"Root" **does** exist elsewhere: `AllowableChildComponentType` (suite 109510's "Allowable Child
Component Type table") records a parent→child pairing and whether it **can be root** (e.g. Department's
allowable child "Programme" has `allowableChildrenSummary: "Programme - Root"`). This is now the basis
of the corrected steps above.

### Unique inputs
No longer applicable to TC-108777 — it targets the real `Department` Component Type by its fixed name,
not a token-stamped disposable one. `TC108777_TOKEN` still exists (kept for log-correlation) but no
longer drives any created record.

| Field | Value |
|---|---|
| Parent | `Department` (real, existing) |
| Child Component Type | `Programme` (existing reflist entity) |

Per user instruction (2026-08-27): all six **Flags & Visibility** checkboxes (Is Indicator, Show In
Admin Tree, Progress Reporting Required, Is Folder, Show In Viewer Tree, Progress Reviewing Required)
are ticked on every Component Type *created* by this suite — now only TC-108808's disposable leaf type,
since TC-108777 no longer creates a Component Type at all.

### Notes
- **Writes nothing when "Programme" is already an Allowable Child of "Department"** (the case this
  session — verify-only). **Writes 1 AllowableChildComponentType junction row against the real
  "Department" record only if it's ever missing** — no
  teardown.
- The 3-dot trigger renders as AntD's responsive-menu overflow indicator (an icon-only
  `.ant-menu-submenu-title` inside `ul.sha-responsive-button-group`), not a plain dropdown — it only
  appears when the toolbar doesn't have room to show "Add" directly (viewport-dependent).

## TC-108808 — Negative — Reject creation of a leaf Component Type with canBeRoot set to true

**ADO ID:** 108808 · **Point:** 31260 · **Priority:** 2 · **Tags:** EPM-Redesign-2026-08-11; Negative
**Coverage dimension:** Negative

> **Premise not yet corrected in ADO** (2026-08-13): unlike TC-108777, this case's ADO steps have
> deliberately been left as-is pending a decision on how the leaf-rejection rule should actually be
> tested (see `epm-qa-credentials-and-ado-pat-scope`/conversation history) — its request to "set
> canBeRoot to true" while creating a Component Type is run here literally, using only the fields that
> actually exist on the create form, to observe and document what really happens.

### Preconditions (ADO literal)
- Signed in as administrator. Component Type list loaded. Existing Performance Report Template treats
  Quantitative KPI as a leaf.

### Steps (ADO literal)

| # | Action (ADO literal) | Expected (ADO literal) |
|---|--------|----------|
| 2 | Navigate to /dynamic/Epm/ComponentType/ and click Create. Enter Name equals "Quantitative KPI (invalid)" and set canBeRoot equal to true. | The form loads and accepts the input during entry. |
| 3 | Attempt to Save. | The form rejects with a validation error citing that a leaf Component Type must have canBeRoot equal to false per PerformanceReportAllowedComponentType invariants. |
| 4 | Confirm no ComponentType row was persisted via GetAll count before and after. | The count is unchanged. |

### Deviation — same root cause as TC-108777: no `canBeRoot` field exists on this form

Step 2's "set canBeRoot equal to true" cannot be performed literally — the field does not exist on the
Component Type create form (see TC-108777's Deviation note above). The spec instead fills only the
fields that exist (Name, Type = Quantitative KPI, Based On Definition), attempts Save, and asserts
nothing about a canBeRoot-driven rejection — it logs the actual outcome instead, since there is no
`canBeRoot`-based validation path to trigger at Component Type creation in this build. Whether "a leaf
Component Type must have canBeRoot equal to false" is enforced *anywhere* (e.g. as a constraint on the
`AllowableChildComponentType` junction when the child is a leaf/indicator type) is unconfirmed and out of
scope for this run.

### Unique inputs
Every run stamps a token so the Name is unique. Override with `TC108808_TOKEN=<value>`.

| Field | Value |
|---|---|
| Name | `Quantitative KPI (invalid) <token6>` |
| Type | `Quantitative KPI` |
| Based On Definition | `Always` |

### Notes
- **Writes 1 Component Type per run** (expected to succeed, not be rejected, per the deviation above) —
  no teardown.

## TC-108810 — Integration — Deleting a Component Type referenced by a Performance Report Template junction is blocked

**ADO ID:** 108810 · **Point:** 31262 · **Priority:** 2 · **Tags:** EPM-Redesign-2026-08-11; integration
**Coverage dimension:** Integration

> **Retargeted per case owner (2026-08-13):** rather than building fresh precondition data (a Component
> Type linked into a Performance Report Template's Allowed Component Types), this run targets an
> existing Component Type already referenced with **Can be Root = Yes** — originally the disposable
> `Department (test) 714718` created by an earlier TC-108777 run, which is the parent of "Programme" in
> the `AllowableChildComponentType` junction. This tests the same "can't delete something referenced
> elsewhere" family of behaviour via a different (but related) junction than ADO's literal wording names.
>
> **Re-targeted again 2026-08-27** (per the user, and per this suite's own [[epm-check-existing-before-
> create-pattern]]): the one-shot disposable target no longer exists (TC-108777 no longer creates
> disposable parents at all — see its own DEVIATION note), so this now targets the **real, shared
> `Department`** Component Type directly. Confirmed low-risk: the delete-blocked protection was already
> proven working on 2026-08-13 against an equivalently-configured target, and this run re-confirms it —
> `Department` survives fully intact. Override with `TC108810_TARGET=<name>` to point at a different
> existing row.

### Preconditions (ADO literal)
- Signed in as administrator. A Component Type is referenced in the PerformanceReportAllowedComponentType
  junction of at least one template.

### Steps (ADO literal, mechanism retargeted as above)

| # | Action (ADO literal) | Expected (ADO literal) |
|---|--------|----------|
| 2 | On the Component Type list, click Delete on the referenced row. | A confirmation dialog appears. |
| 3 | Confirm the delete. | The delete is rejected with a foreign-key constraint message referencing the junction table. |
| 4 | Verify via GetAll that both the Component Type and every junction row are intact. | No records were deleted. |

### Result — CONFIRMED DEFECT: ADO's literal claim doesn't hold; a different reference path is protected instead

**ADO's own precondition/steps name a specific relationship**: a Component Type referenced in the
`PerformanceReportAllowedComponentType` junction (a Performance Report Template's Allowed Component
Types list). That validation belongs on the `ComponentType/Crud/Delete` endpoint — the Component Type
side, since that's the only place a delete-attempt can be intercepted — and **it is not implemented
there**. Confirmed 2026-08-13: linking a disposable Component Type into the real shared template
`Emmanuel_template`, then deleting it, **succeeds** (`DELETE ... 200`). The junction row is not
cascade-deleted either — it's left dangling, pointing at a `componentType.id` that no longer exists. See
`epm-component-type-delete-protection-mixed` memory for the isolation trail (disposable data only —
`Emmanuel_template`'s 5 real Allowed Component Types were never touched directly).

**What this run's steps actually exercise instead is a different, unrelated reference path** —
`AllowableChildComponentType` (the parent/child hierarchy link, e.g. Department is the parent of
Programme) — which genuinely is protected on the same endpoint: `DELETE
/api/dynamic/Epm/ComponentType/Crud/Delete` returned **HTTP 500** on the original 2026-08-13 run with:

```json
{"success":false,"error":{"message":"Cannot delete \"Department (test) 714718\": it is still in use by 1 allowable child-type link(s). Remove these first."}}
```

**Re-confirmed 2026-08-27 against the real `Department` record**: same HTTP 500, confirmation dialog
text `"Are you sure you want to delete this component type? You are about to delete Department component
type"`, and `Department` verified fully intact afterward via `GetAll`.

**The delete-check is actually broader than "just AllowableChildComponentType"** — asked directly in the
live app (not just via this spec, which only captures status + survival) the real rejection message
reads:

```
Cannot delete "Department": it is still in use by 23 component(s), 19 definition(s), 1 allowable
child-type link(s). Remove these first.
```

So `ComponentType/Crud/Delete` genuinely checks **three** reference types before allowing a delete:
- `Component` — individual tree nodes typed `Department`, one per Performance Report that has one (37 in
  QA as of 2026-08-27 — the count keeps growing; this is a shared, live tenant).
- `ComponentDefinition` — catalog rows typed `Department` (19 in QA, following the `DEPT_1`...`DEPT_22`
  refNo sequence — many are this session's own disposable fixtures from TC-108778/108811/109453/109454).
- `AllowableChildComponentType` — the parent/child hierarchy link (1: Department → Programme, Root).

**Only `PerformanceReportAllowedComponentType` — the one relationship ADO's own case names — is
missing** from an otherwise fairly thorough check.

**Verdict**: don't read this as "TC-108810 passes." The specific validation ADO asks for
(`PerformanceReportAllowedComponentType`-aware delete blocking) is a confirmed, unimplemented gap,
narrowly — not "the delete-check barely does anything." It's one missing reference type among four the
endpoint should logically guard against, and it happens to be the one this case is about. Also worth
flagging to the dev independent of the missing check: the working protection returns a bare **500** for
what is a business-rule rejection, which would conventionally be **400/409**.

### Safety note
The template's real Allowed Component Types (`Emmanuel_template` → Qualitative KPI, Quantitative KPI,
Programme, Sub Programme, Department) are all pre-existing shared reference data used across the QA
environment. Earlier exploration confirmed deleting a Component Type referenced there is **not**
blocked (same root cause as TC-108808 — no cascade or FK protection on that junction), so testing
against one of those 5 directly would have destroyed shared data. That exploration created a disposable
Component Type, linked it into `Emmanuel_template`, deleted it, found the resulting orphaned junction
row, and cleaned that row up immediately afterward — see the memory
`epm-component-type-delete-protection-mixed` for the full trail.
