# EPM — Stage 2 Support Review

**ADO plan:** 108745 — *EPM-QA — Functional Test Plan v2.0 (2026-08-11 redesign baseline)*
**ADO suite:** *109529 · EPM · Stage 2 Support Review*
**Environment:** `https://pd-epm-adminportal-qa-wf.shesha.app` (UI) +
`https://pd-epm-api-qa-wf.shesha.app` (API verification)
**Login:** stage2 / 123qwe; stage3 / 123qwe (to verify hand-off)

> This spec never had a paired canonical `.md` — this file backfills it. **ADO is canonical.**
> Previously `unverified` — "no stable live Stage 2 item existed long enough to automate; likely sound
> by analogy to Stages 3–6" (see [[epm-stage3-qa-review-confirmed-working]] and onward). Now unblocked:
> the Submit-gate fix ([[epm-stage1-submit-permanently-blocked]]) lets Stage 1 items reach Stage 2
> reliably, giving multiple real live Stage 2 items to test against directly.

## TC-108792 — Positive — Stage 2 review advances status 30 to 40

**ADO ID:** 108792 · **Coverage dimension:** Positive

### Confirmed live 2026-09-02 — clean pass

Used the real item `CPR2026/1101` (already at Stage 2, `progressReportStatus: 30`, delivered there by
Submit during [[epm-tc108852-notification-not-triggered]]'s testing). Fetched a fresh `todoId` and
opened `/shesha/workflow-action?id=<workflowInstanceId>&todoid=<todoId>` as `stage2`.

Real form: `Epm/progressreporting-wf-supportprogressreport v10`. It's a read-mostly review form (Actual
Target etc. are pre-filled and not editable at this stage) with one required interactive element: the
**Declaration Statement** checkbox (*"I hereby confirm that I have reviewed the quarterly KPI report
progress and acknowledge the performance outcomes as presented"*). The real advance button is
**"Support Report"** (not a generic "Support" or "Approve" — another ADO-label-vs-real-button gap,
same pattern as "Approve KPI"/"Complete KPI" at later stages). A "Send Back" button also exists
alongside Save/Support Report.

Checked the Declaration checkbox, clicked **Support Report** — `UserTaskComplete` → `200`.
`ComponentProgressReport.progressReportStatus` genuinely advanced `30 → 40`. Verified via the `stage3`
account: a real `WorkflowInboxItem` now exists, `actionText: "Quality Assure and Consolidate Progress
Report"`, `statusFinalText: "Received"` — Stage 3 genuinely received it. Item left Stage 2's "My Items"
list entirely (0 items) afterward.

**CONFIRMED PASS — matches ADO's literal claim exactly.** This also confirms the "by analogy" prediction
from [[epm-stage3-qa-review-confirmed-working]] onward: the whole Stage 2→6 mechanism is uniformly
sound, Stage 2 included.

### Unique inputs
| Field | Value |
|---|---|
| Item | `CPR2026/1101` (workflowInstanceId `6c611f48-1a9f-48bc-b800-dbf9cc3adaed`) |
| ComponentProgressReport id | `8f5de1d9-d910-4d5f-99e8-888f324f87a7` |

## TC-108853 — Negative — Reject action from an unassigned Person

**ADO ID:** 108853 · **Coverage dimension:** Negative

### Confirmed live 2026-09-02 — clean pass

Used a different live Stage 2 item, `CPR2026/1099`. Logged in as `JohnDoe`/123qwe (an unassigned
Person) and navigated to the exact same `workflow-action` URL (same `workflowInstanceId` + `todoId` as
the real Stage 2 actioner's). Got redirected to the read-only `Epm/sent-items-details` view — *"Requested
action is not available"* — with no "Support Report" button anywhere on the page.

**CONFIRMED PASS.** Same genuine, working RBAC read-only gate confirmed at every other stage this
engagement (Stage 1: [[epm-stage1-form-access-unauthorized-person]]; Stage 3-6:
[[epm-stage3-qa-review-confirmed-working]] through [[epm-stage6-finalise-confirmed-working]]) — the
mechanism is uniform across the whole chain.

### Notes
- `todoId` is per-fetch volatile — re-fetch immediately before navigating.
- The Stage 2 form's Declaration checkbox text is unique to this stage (reviewed/acknowledged
  performance, not "verified and found accurate" like Stage 1's) — don't assume identical wording
  across stages when locating it by text.
- An unassigned Person accessing another stage's `todoId` lands on `Epm/sent-items-details`
  (read-only), same route family used across every stage's RBAC gate.

## TC-108854 — Edge — Comment field accepts maximum character length

**ADO ID:** 108854 · **Coverage dimension:** Edge

### Per case owner, 2026-09-02 — UNBUILT: no maximum character length is configured

Used a live Stage 2 item, `CPR2026/1099`. The Comments field has no `maxlength` attribute client-side.
Typed a 5,000-character comment and saved it — `POST /api/services/app/Note/Create` → `200`, genuinely
persisted. Confirmed via a direct API read immediately after: the stored `noteText` is exactly 5,000
characters, byte-for-byte, no truncation anywhere client- or server-side.

ADO's precondition names "the maximum character length" as something to test at the boundary — since no
such limit exists, there's nothing to test against. Classified `unbuilt`, same missing-feature pattern
as [[epm-poe-max-file-size-unbuilt]] (TC-108848) and TC-108808/109450/109459/109460 — see
[[epm-known-gap-vs-pass-classification]] for the general convention.

## TC-108855 — Integration — Inbox re-count after multi-item batch approval

**ADO ID:** 108855 · **Coverage dimension:** Integration

### Confirmed live 2026-09-02 — clean pass (adapted to 3 live items)

Baseline `stage2` inbox had exactly 5 live "Support Progress Report" items (`CPR2026/1099`,
`CPR2026/1059`, `CPR2026/1103`, `CPR2026/1065`, `CPR2026/1097`) — ADO's literal 5-item precondition
happened to already be met. Batch-approved 3 of them in sequence (fresh `todoId` fetched immediately
before each navigation, Declaration checked, "Support Report" clicked) — all 3 returned `200`.

**Re-fetched the inbox count afterward: exactly 2 items remained** (`CPR2026/1065`, `CPR2026/1097` —
precisely the two *not* touched). The recount is exact, not off-by-one or stale. **CONFIRMED PASS.**

### Notes
- Adapted from ADO's literal wording ("batch approval") to sequential individual approvals, since no
  bulk-select UI exists on this inbox grid (see [[epm-phase12-button-coverage-by-extension]] /
  TC-109770, "Bulk-action buttons work at page and Select-All level" — untested, no such UI observed
  anywhere this session). The recount claim itself (inbox count decrements correctly per completed
  item) is what's verified here, independent of whether the UI offers a true multi-select bulk action.
