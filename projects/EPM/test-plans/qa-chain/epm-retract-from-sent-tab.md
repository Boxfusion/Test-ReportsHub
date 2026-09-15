# EPM — Retract from Sent Tab

**ADO plan:** 108745 — *EPM-QA — Functional Test Plan v2.0 (2026-08-11 redesign baseline)*
**ADO suite:** *109758 · 26b · EPM · Retract from Sent tab — Stage 1 to 5 self-service withdrawal*
**Environment:** `https://pd-epm-adminportal-qa-wf.shesha.app` (UI) +
`https://pd-epm-api-qa-wf.shesha.app` (API verification)
**Login:** stage1 / 123qwe

> This spec never had a paired canonical `.md`/`.spec.ts` — this file backfills both. **ADO is
> canonical.** Supersedes the "not independently verified" framing in
> [[epm-close-reopen-retract-not-independently-verified]] for TC-109764 specifically.

## TC-109764 — Positive — Stage 1 Process Owner retracts a submitted CPR from the Sent tab

**ADO ID:** 109764 · **Coverage dimension:** Positive

### Confirmed live 2026-09-02 — clean pass, exact match with ADO's expected outcome

**Precondition gap resolved live:** ADO wants "at least one Q1 Component Progress Report already
Submitted from Stage 1 to Stage 2 (progressReportStatus = 30)" present in stage1's own Sent tab. No such
item existed live at the time (tenant-wide, only one CPR was genuinely at status 30, and it wasn't a Q1
item reachable from this stage1 account). Built the precondition directly instead of leaving it blocked:
submitted `CPR2026/1059` — a real, already fully-populated Q1 fixture (Quarter Target 40, Actual Target
40, Achievement Status Achieved, Portfolio of Evidence attached, Executive Summary filled — left over
from earlier Send Back testing in this session) — from Stage 1 to Stage 2. `progressReportStatus` went
`20 -> 30` cleanly on the first Submit attempt (no flakiness retries needed, consistent with the
Submit-gate fix confirmed elsewhere this session).

**Then, the actual test steps, all confirmed:**
1. Opened `/dynamic/Shesha.Workflow/workflows-sent` as stage1 — the Sent tab genuinely lists the
   `CPR2026/1059` (Q1) row.
2. The "sha-link" is a real DOM element: `<a class="sha-link" href="/shesha/workflow?id=<workflowInstanceId>">`
   wrapping a search-icon (`anticon-search`). Clicking it opens `/shesha/workflow?id=...` — a read view of
   the workflow instance (not the `/shesha/workflow-action` capture form) — with **Retract** genuinely
   visible on the action toolbar alongside Close.
3. Clicked Retract, confirmed the dialog. The item genuinely left the Sent tab and reappeared in the
   Stage 1 Inbox tab (confirmed via `WorkflowInboxItem/Crud/GetAll` — a fresh entry exists for the same
   `workflowInstanceId`).
4. Verified via `GET .../ComponentProgressReport/Crud/Get?id=<cprId>`: `progressReportStatus` reverted
   from `30` to exactly **`20`** — matching ADO's literal expected value precisely (contrast the Send
   Back suite, where the real status landed on `2` instead of ADO's claimed `15` — no such mismatch
   here).

**CONFIRMED PASS**, no caveats. This is also the first hard evidence that Retract's underlying mechanism
is real and correct, beyond the earlier "a button was observed present" inference in
[[epm-close-reopen-retract-not-independently-verified]].

## TC-109765 — Negative — Retract not offered to the receiving stage

**ADO ID:** 109765 · **Coverage dimension:** Negative

### Confirmed live 2026-09-02 — clean pass, exact match with ADO's expected outcome

Precondition rebuilt the same way as TC-109764: resubmitted `CPR2026/1059` from Stage 1 to Stage 2
(`progressReportStatus` `20 -> 30` cleanly, first attempt).

**All three steps confirmed:**
1. Signed in as stage2, opened `/dynamic/Shesha.Workflow/workflows-inbox` — the row for `CPR2026/1059`
   genuinely lists there, awaiting Stage 2 Support review.
2. Opened the item via its sha-link. The action toolbar visible to stage2 shows **Send Back** and
   **Support Report** (plus Save) — but genuinely **no Retract button anywhere**.
3. Signed back in as stage1, opened `/dynamic/Shesha.Workflow/workflows-sent`, opened the same item via
   its sha-link — **Retract is visible** on stage1's own view of the identical item.

**CONFIRMED PASS.** Retract is genuinely sender-only: the receiving stage (Stage 2) has no access to it
regardless of the fact that both views are rendering the same underlying workflow instance — only the
`Sent` view (i.e., the original sender's perspective) exposes the button. No caveats.

## TC-109766 — Edge — Retracting a Stage 5-verified item withdraws Stage 6

**ADO ID:** 109766 · **Coverage dimension:** Edge

### Confirmed live 2026-09-02 — DEFECT: server rejects the Retract with a real 403, UI never warns

**Precondition built live:** used the one live Stage 5 Verify item, `CPR2026/1099`. Checked Declaration,
clicked "Complete KPI" — `progressReportStatus` genuinely advanced `60 -> 70`, delivering the item to
Stage 6's inbox (`actionText: "Finalise Captured Progress Report"`), exactly as ADO's precondition
describes.

**Then the actual test, run twice for certainty:**
1. Signed in as stage5, opened `workflows-sent` — the item is listed, Retract is visible via its
   sha-link on the workflow view, exactly like the Stage 1 case.
2. Clicked Retract, confirmed the dialog ("Are you sure you want to retract this KPI? You are about to
   retract this KPI to your step.", red "Retract" confirm button in a real `.ant-modal`).
3. **First run:** nothing changed afterward — `progressReportStatus` stayed `70`, Stage 6 still had 3
   inbox entries for the item, it never reappeared in Stage 5's inbox. Looked like the click silently
   no-op'd.
4. **Second run, with response logging on the confirm click:** the real network call fired —
   `POST /api/v1/Epm/ComponentProgressReports/RetractWorkflowTask` — and came back **`403`**:
   `{"success":false,"error":{"message":"You are not authorized to perform this action"},
   "unAuthorizedRequest":true}`.
5. **Contrast check, same endpoint, Stage 1 sender:** retracting a Stage 1->2 submission (the TC-109764
   scenario) through the identical UI flow hits the same `RetractWorkflowTask` endpoint and returns a
   clean **`200`**.

**CONFIRMED DEFECT.** The Retract button and confirmation dialog render identically regardless of which
stage the sender is retracting from — nothing in the UI disables the button, shows a permission warning,
or surfaces the 403 to the user. For at least Stage 5 (SPMR Unit) retracting a Stage 5->6 transition, the
server silently rejects the action with a real authorization error while the UI presents it as having
worked. None of ADO's expected cascading effects (Stage 6 inbox loses the row, item returns to Stage 5,
`progressReportStatus` reverts to 60) occur, because the underlying call never succeeds.

**Open question, not investigated further this pass:** whether this 403 is a genuine intentional
business rule (e.g., "you can't retract a QA-verified item") that's simply missing its own UI-level
guard, or an unintended authorization-config gap that should allow Stage 5 retraction like Stage 1 does.
Either way, the current UI/API mismatch (button always shown, dialog always completes, failure silent) is
a real defect regardless of which direction the intended fix goes.

## TC-109767 — Integration — Retract preserves audit trail, restores prior status without data loss

**ADO ID:** 109767 · **Coverage dimension:** Integration

### Confirmed live 2026-09-02 — clean pass, all three sub-checks succeed

**Precondition built live:** pushed `CPR2026/1059` through Stage 1 -> 2 -> 3 (Submit, Support Report,
Complete QA) to genuinely reach `progressReportStatus = 50`, sent by stage3, with a real captured
Portfolio of Evidence attachment and Executive Summary narrative already in place from earlier fixture
use — exactly matching ADO's precondition.

**Sub-check 1 — status reverts, item returns (PASSES):** signed in as stage3, opened `workflows-sent`,
found the row, opened via sha-link, clicked Retract, confirmed the dialog. The real
`POST .../RetractWorkflowTask` call returned a clean **`200`** this time (contrast with TC-109766's
Stage 5 `403`). `progressReportStatus` reverted from `50` to exactly **`40`** — precise match with ADO.
The item genuinely reappeared in stage3's own Inbox.

**Sub-check 2 — captured fields survive (PASSES):** re-fetched the CPR after Retract. The Portfolio of
Evidence attachment (`StoredFile` reference) is unchanged, byte-for-byte the same file reference as
before. The Executive Summary text field is unchanged, verbatim. Nothing was cleared by the Retract.

**Sub-check 3 — audit trail records the event, no prior rows lost (PASSES):** checked
`EpmAuditedEntityEvent` before and after. Before: 5 rows. After: **6 rows** — a genuine new row was
written: `actor: "Stage 3 Branch Coordinator"` (exactly the stage3 Person), a fresh `creationTime`
matching the retract, `action: "Item status was changed to AwaitingLevelTwoQA"` (the real enum label for
the resulting status, not the literal "50 to 40" phrasing ADO uses, but the same underlying event). All
5 pre-existing rows are still present by id — nothing deleted.

**CONFIRMED PASS, no caveats.** This directly contrasts with two other findings from adjacent suites
this session: [[epm-sendback-no-audit-event-no-notification]] (Send Back writes ZERO audit rows) and
[[epm-retract-stage5-403-defect]] (Retract from Stage 5 is silently rejected with a 403). Retract from
Stage 3 is genuinely solid on all three fronts: mechanism, data integrity, and audit trail.

### Notes
- `todoId` is per-fetch/session-volatile — always re-fetch immediately before navigating.
- The Sent tab's rows are `role="row"` `div`s (antd virtual table), not real `<tr>` elements — locate via
  `page.getByRole('row', { name: /<refNumber>/ })`, not `tr` selectors.
- The sha-link's target (`/shesha/workflow?id=...`) is a distinct route from the capture form
  (`/shesha/workflow-action?id=...&todoid=...`) — it's a read/action view keyed only by
  `workflowInstanceId`, no `todoid` needed.
