# EPM — Send-back / Reject Flow

**ADO plan:** 108745 — *EPM-QA — Functional Test Plan v2.0 (2026-08-11 redesign baseline)*
**ADO suite:** *109525 · EPM · Send-back / Reject Flow*
**Environment:** `https://pd-epm-adminportal-qa-wf.shesha.app` (UI) +
`https://pd-epm-api-qa-wf.shesha.app` (API verification)
**Login:** stage3 / 123qwe; stage1 / 123qwe

> This spec never had a paired canonical `.md` — this file backfills it. **ADO is canonical.**

## TC-108867 — Edge — Send Back comment is mandatory

**ADO ID:** 108867 · **Coverage dimension:** Edge

### Confirmed live 2026-08-20 — clean pass

Real Send Back modal is a custom dialog (`Epm/send-back-dialog`) with a required "Step" field and a
required "Comments" textarea. Clicking OK with both fields empty does **not** send the item back —
re-checked via `WorkflowInboxItem/Crud/GetAll` immediately after, the item was still at Stage 3
("Quality Assure and Consolidate Progress Report"), unchanged. A genuine validation gate.

## TC-108796 — Positive — Full Send Back reverts status and returns item to Stage 1

**ADO ID:** 108796 · **Coverage dimension:** Positive

### Confirmed live 2026-09-02 — clean pass

The dialog's "Step" field is **not** a standard antd Select — it's a custom button
(`.user-task-select-button`, an `ant-dropdown-trigger`) that opens a custom panel of clickable task
cards (e.g. "Capture Progress Report / Completed by Stage 1 Process Owner / Assigned to: Stage 1
Process Owner"). The "Comments" textarea has a genuine client-side rule requiring **50+ characters**
(visible red validation message below that length) — this itself satisfies the spirit of TC-108867's
mandatory-comment claim from a second angle.

With a valid Step selection and a 60+ character comment, `POST
/api/services/SheshaWorkflow/Process/SendBackUserTask` returns `200` and the item genuinely reappears
in Stage 1's inbox (`actionText: "Capture Progress Report"`, status "Received"). Confirmed on two
separate live items (`CPR2026/1065`, `CPR2026/1059`).

**Status code discrepancy (not a functional failure):** the resulting status is `2` on both
`ComponentProgressReport.progressReportStatus` and `WorkflowInstance.status`/`subStatus` — not literally
`15` as the ADO case text describes. Read as a naming/enum mismatch against ADO's expectation, not a
functional failure: the item unambiguously returns to Stage 1 and is actionable there.

**Where the comment text actually persists (investigated in depth):** it does **not** appear in
`ComponentProgressReport.reasonForSendBack` (empty string, confirmed twice) and is **not** written to
the generic `Note` entity either (checked via `Note/GetAll?ownerId=<cprId>`). It **is** genuinely
persisted and rendered — found on the receiving Stage 1 form's own **"History" tab**, as a
task-transition log entry: *"Stage 3 Branch Coordinator to Capture Progress Report / \<timestamp> /
\<comment text>"*. So the comment is real and visible to the next actor, just stored in the workflow
engine's own task-history log rather than any `ComponentProgressReport`/`Note` field a naive entity
search would check.

## TC-108865 — Negative — Reject Send Back action from a stage that is not Level 2 QA or higher

**ADO ID:** 108865 · **Coverage dimension:** Negative

### Confirmed live 2026-09-02 — pass (documents actual build behaviour, per the case's own framing)

ADO's own case text frames this as engagement-dependent: *"Behaviour depends on business rule: some
engagements allow send-back from any QA level, others restrict to Level 2+ per the framework... Confirm
the transition behaviour matches the current build."* The ask is to observe and document real,
deterministic behavior — not to force a single universal expected outcome.

**Observed on `CPR2026/1097` (Stage 2 Support, status 30):** the "Send Back" button is present and
enabled on the Stage 2 form — not hidden or gated. Using the same custom-dialog technique as TC-108796
(click `.user-task-select-button`, select the "Capture Progress Report" card, fill a 60+ char comment),
`POST /api/services/SheshaWorkflow/Process/SendBackUserTask` returned `200` and the item moved straight
out of Stage 2's inbox into Stage 1's — identical mechanism to the Stage 3 case. The item did **not**
remain at status 30 (the case's "if reject" branch).

**Conclusion:** Send Back is genuinely **unrestricted** in this build — available and fully functional
from Stage 2, not gated to "Level 2 QA or higher". This is deterministic and reproducible, matching the
case's actual ask ("confirm the transition behaviour matches the current build"). Documented as a real
finding for stakeholders to compare against their intended business rule, not a functional defect.

## TC-108868 — Integration — Send Back cascades notification and preserves audit chain

**ADO ID:** 108868 · **Coverage dimension:** Integration

### Confirmed live 2026-09-02 — DEFECT (2 of 3 sub-checks fail)

Did a real Send Back from Stage 3 to Stage 1 on `CPR2026/0932` (`cprId
fefb4943-0a90-49fe-a539-c0485972e8d7`) using the mechanics proven in TC-108796/TC-108865.
`SendBackUserTask` returned `200` as expected — the Send Back itself works.

**Sub-check 1 — audit event written (ADO's code anchor: `AuditEntityEventAction.ItemSentBack`): FAILS.**
Checked `EpmAuditedEntityEvent` (`filter entity == cprId`) before and after: exactly 2 rows both times
("Item was received by actioner", "Item was opened by actioner") — **zero new rows were written for the
Send Back itself**. Sanity-checked tenant-wide too: none of the 10 most recent audit rows across the
entire tenant mention a send-back. The `ItemSentBack` audit event ADO's case cites is never actually
raised.

**Sub-check 2 — notification targets Stage 1 Process Owner with the comment: FAILS.**
`Shesha/NotificationMessage` stayed at `0` tenant-wide, before and after. Consistent with the
already-confirmed systemic gap in [[epm-tc108852-notification-not-triggered]] — Submit doesn't notify
either. No notification mechanism fires on this event (or apparently any workflow-action event tested so
far).

**Sub-check 3 — audit chain preserved, no prior rows deleted: PASSES.**
Both pre-existing audit rows were still present afterward, by id. (A low bar, since nothing else
happened to them, but it's a genuine, verified pass — the write path isn't corrupting prior history even
though it also isn't adding to it here.)

**Overall: DEFECT.** The Send Back mechanism itself is functionally sound (per TC-108796/TC-108865), but
neither of the two "cascading" effects this case tests for — an audit trail event, a notification — 
actually occurs.

### Notes
- `todoId` is per-fetch/session-volatile — always re-fetch immediately before navigating.
- The "Step" picker (`.user-task-select-button`) and the 50-char Comments minimum are both real,
  working client-side gates — not the usual "no validation" pattern seen elsewhere in this app.
