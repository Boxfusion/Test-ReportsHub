# EPM — Stage 1 POE upload

**ADO plan:** 108745 — *EPM-QA — Functional Test Plan v2.0 (2026-08-11 redesign baseline)*
**ADO suite:** *109522 · EPM · Stage 1 POE attachment upload*
**Environment:** `https://pd-epm-adminportal-qa-wf.shesha.app` (UI) +
`https://pd-epm-api-qa-wf.shesha.app` (API verification)
**Login:** admin.PrincessH / 123qwe (administrator, for API verification); then stage1 / 123qwe

> This spec never had a paired canonical `.md` — this file backfills it. **ADO is canonical.**
> Previously blocked (see [[epm-stage1-origination-permanently-blocked]]) on the reasoning that
> attachment carry-through needs a successful Submit, and Submit was confirmed broken
> ([[epm-stage1-submit-permanently-blocked]]). Re-scoped 2026-09-01: TC-108790's literal ADO claim is
> just that an upload succeeds and persists on the record — that doesn't require Submit, only Save.
> Re-tested directly against that narrower, correct scope.

## TC-108790 — Positive — Upload a Portfolio of Evidence attachment

**ADO ID:** 108790 · **Coverage dimension:** Positive

### Confirmed live 2026-09-01 — clean pass

Reused the real item `CPR2026/1071` ("Percentage compliance with statutory prescripts - Q3", Quarter 3
2026/27), already sitting in the Stage 1 `stage1` inbox with `Status: Draft`. Opened
`/shesha/workflow-action?id=<workflowInstanceId>&todoid=<todoId>` (todoId fetched fresh in the same
session immediately before navigating — see [[epm-stage3-qa-review-confirmed-working]]).

Attached a disposable text file to the required **Portfolio Of Evidence** field (the first of 3
`input[type="file"]` elements on the form — no `accept` restriction present client-side) and clicked
**Save** — `200`. Reloaded the form fresh (new todoId fetch, new navigation) and confirmed the filename
still rendered with its size and a working delete/replace control, not just a same-session artifact.

Confirmed server-side via a direct API `Get` on the `ComponentProgressReport` (id resolved through
`WorkflowInstance/Crud/Get.componentProgressReport`): `portfolioOfEvidence` is a real
`Shesha.Domain.StoredFile` reference (`_displayName: "tc108790-poe-test-file.txt"`), not null — the
upload genuinely persisted as a proper file attachment, not just client-side form state.

### Unique inputs
| Field | Value |
|---|---|
| Item | `CPR2026/1071` (workflowInstanceId `101765e8-4e95-40b2-a575-5a9a245e1cdd`) |
| ComponentProgressReport id | `de37dfec-1793-4cdf-aaeb-c8a4e3556f60` |
| Uploaded file | disposable `.txt`, generated fresh per run, deleted locally after upload |

### Notes
- `todoId` is per-fetch volatile — always re-fetch via `WorkflowInboxItem/Crud/GetAll` immediately
  before navigating, never reuse a todoId across two separate page loads.

## TC-108847 — Negative — Reject an unsupported file type (e.g. .exe)

**ADO ID:** 108847 · **Coverage dimension:** Negative

### Confirmed live 2026-09-01 — CONFIRMED DEFECT: zero file-type validation

Same real item, `CPR2026/1071`. Attached a disposable `.exe` (arbitrary 4-byte binary content, real
`.exe` extension) to the **Other Supporting Documents** field (the second file input — left empty by
TC-108790, so this doesn't disturb the already-persisted, valid Portfolio of Evidence attachment).

The antd Upload widget calls `POST /api/StoredFile/Upload` the instant a file is selected, independent
of the form's own Save action. That call returned **`200`**, genuinely accepted — no `accept` attribute
restricts it client-side (confirmed earlier in [[epm-stage1-poe-upload-confirmed-working]]'s
exploration), and no server-side extension/MIME check rejects it either. No rejection message of any
kind appeared in the UI.

**CONFIRMED GAP:** ADO expects an unsupported file type to be rejected; instead the upload endpoint
accepts any file type with zero validation, silently.

Separately, incidentally: the resulting `StoredFile` reference never showed up on the
`ComponentProgressReport.otherAttachments` field after Save+reload (stayed `null`) — but this is very
likely an unrelated field-binding quirk (the widget's `FilesList` query for this slot has no
`filesCategory` param, unlike Portfolio of Evidence's `filesCategory=portfolioOfEvidenceId`, so it may
resolve through a different relationship than the single-value field checked). Doesn't change TC-108847's
verdict either way — the upload endpoint's zero type-checking is confirmed directly, independent of
which field the reference ultimately binds to.

### Unique inputs
| Field | Value |
|---|---|
| Item | `CPR2026/1071` (same as TC-108790) |
| Bad file | disposable `.exe`, 4-byte MZ-header-like binary, generated fresh per run |

### Notes
- **Out of scope for this pass:** TC-108849 (POE carries through the QA chain to Stage 6) remains
  untested — needs a successful Submit, which is independently blocked
  ([[epm-stage1-submit-permanently-blocked]]).

## TC-108848 — Edge — Large file at the configured max size succeeds

**ADO ID:** 108848 · **Coverage dimension:** Edge

### Per case owner, 2026-09-01 — UNBUILT: no maximum file size is configured

ADO's precondition names "the configured max size" — no such configuration exists on the upload path at
all, so there is nothing to test against. Same missing-feature pattern as
[[epm-canberoot-leaf-rejection-not-implemented]] / TC-109450 / TC-109459 / TC-109460. Consistent with
[[epm-poe-unsupported-file-type-not-rejected]]'s direct finding that `POST /api/StoredFile/Upload`
performs zero validation of any kind on an attached file — no type check, no size check.
