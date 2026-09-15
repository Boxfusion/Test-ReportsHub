# EPM — Output and Outcome linkage — planning-only invariant

**ADO plan:** 108745 — *EPM-QA — Functional Test Plan v2.0 (2026-08-11 redesign baseline)*
**ADO suite:** *06 · EPM · Output and Outcome linkage — planning-only Components without Performance Report identifier*
**Environment:** QA — `https://pd-epm-adminportal-qa-wf.shesha.app` (API `https://pd-epm-api-qa-wf.shesha.app`)
**Login:** admin.PrincessH / 123qwe (administrator)
**Navigation:** Epm › EPM Administration › **Outputs & Outcomes**

> This spec never had a paired canonical `.md` — this file backfills it from live findings.
> **ADO is canonical.**

## TC-108823 — Negative — Reject Output Component creation with performanceReportId set

**ADO ID:** 108823 · **Priority:** 2 · **Tags:** EPM-Redesign-2026-08-11; Negative
**Coverage dimension:** Negative

### Preconditions (ADO literal)
- Output/Outcome Components are meant to be planning-only (no Performance Report link).

### Steps (ADO literal)

| # | Action (ADO literal) | Expected (ADO literal) |
|---|--------|----------|
| 1 | Attempt to create an Output Component with a `performanceReportId` set. | Rejected — Output/Outcome Components must remain planning-only. |

### Mechanism

Per [[epm-output-outcome-linkage]] (TC-108782): Output/Outcome Components are created via a dedicated
"Outputs & Outcomes" page (`/dynamic/Epm/components`), whose "Add New Outcome or Output" modal has fields
Ref No, Description, Name, Select component type, Weighting — **no Performance Report field at all**. All
28 real catalog entries confirmed `performanceReport: null`. Since the UI never exposes a way to set this
field, a UI-only check can't prove the server actually enforces the invariant — this spec checks both:
(1) the create form genuinely has no Performance Report field, and (2) a raw API bypass attempting to set
`performanceReport` directly on `Component/Crud/Create`.

### Confirmed live 2026-08-30 — genuine defect: no server-side enforcement

STEP 1 passes (no Performance Report field exists on the create form). STEP 2 (the real graded claim):
`POST Component/Crud/Create` with `componentType: Output` and `performanceReport: {id: <a real report>}`
explicitly set **succeeded** (HTTP 200, Component created and linked to a real report) — the server does
not reject this at all. Same missing-server-side-validation pattern as
[[epm-component-create-no-server-side-allowable-child-check]] (TC-109452) — a described invariant with no
enforcement anywhere in the write path.

### Unique inputs
| Field | Value |
|---|---|
| Bypass Component Type | `Output` (id `27646442-6003-4356-a47d-2d5ea163b69a`) |
| Bypass performanceReport | `Princess` (id `bc34f55d-bb32-4629-bd74-3e03250e4784`) |

### Notes
- **Writes then deletes 1 disposable bypass Component per run** — cleaned up via API `Delete` in a
  `finally` block regardless of pass/fail. The real Output/Outcome catalog (28 entries) is never touched.
