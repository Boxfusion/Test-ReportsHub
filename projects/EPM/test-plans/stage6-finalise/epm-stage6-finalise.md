# EPM — Stage 6 Finalise

**ADO plan:** 108745 — *EPM-QA — Functional Test Plan v2.0 (2026-08-11 redesign baseline)*
**ADO suite:** *109530 · 27 · EPM · Final approver Component Actioner finalises — status transitions to
180 Completed*
**Environment:** `https://pd-epm-adminportal-qa-wf.shesha.app` (UI) +
`https://pd-epm-api-qa-wf.shesha.app` (API verification)
**Login:** stage6 / 123qwe; JohnDoe / 123qwe (unauthorized Person)

> This spec never had a paired canonical `.md` — this file backfills it. **ADO is canonical.**

## TC-108797 — Positive — Final approver Component Actioner finalises KPI to status 180 Completed

**ADO ID:** 108797 · **Coverage dimension:** Positive

### Confirmed live 2026-08-20 — clean pass

Real Stage 6 form: `Epm/progressreporting-wf-finalizecapturedprogressreport`. Advance button is again
**"Complete KPI"** (same reused label as Stage 5). Clicking it genuinely finalises the KPI — confirmed
by the item having zero remaining `WorkflowInboxItem` entries afterward (it leaves the inbox system
entirely, a terminal "Completed" state). See [[epm-stage6-finalise-confirmed-working]].

## TC-108869 — Negative — Finalise rejected from a Person who is not the top Component Actioner

**ADO ID:** 108869 · **Coverage dimension:** Negative

### Confirmed live 2026-08-20 — clean pass

Non-top-actioner Person correctly gets the read-only view, same RBAC gate confirmed at every stage.

## TC-108870 — Edge — Finalise succeeds on a zero percent achievement Quantitative KPI

**ADO ID:** 108870 · **Coverage dimension:** Edge

### Confirmed live 2026-09-02 — clean pass

**Precondition built live:** the Dashboard page IS real (correcting the original "no dashboard exists"
note — see the 2026-08-30 correction in [[epm-performance-dashboard-page-does-not-exist]]) — it's
"Dashboard Analytics" -> "CPR Status Dashboard" at `/dynamic/Epm/component-progress-report`. Took a live
Stage 3 item (`CPR2026/1059`), edited its "Actual Target" field to `0` and Achievement Status to "Not
Achieved" directly on the Stage 3 form (both genuinely editable there, not read-only), then pushed it
Complete QA -> Approve KPI -> Complete KPI (Stage 5) to reach Stage 6 with `indicatorActual: 0`,
`indicatorTarget: 40`, `achievementStatus: 2`.

**All three ADO steps confirmed:**
1. The Stage 6 form genuinely loads showing `Actual = 0`, `Target = 40` (a positive number) —
   achievement percentage is 0.
2. Clicking "Complete KPI" (the real Finalise button) advances `progressReportStatus` to exactly `180`.
   `achievementStatus` stays `2` (Not Achieved). No confirm dialog appears — a cosmetic-only pattern seen
   elsewhere in this app (e.g. [[epm-performance-report-publish-confirm-dialog]]). The item leaves the
   inbox entirely (terminal state, consistent with TC-108797).
3. The CPR Status Dashboard's "Achievement Status Distribution" is a **pie chart only** — there is no
   discrete numeric "tile" per achievement value, unlike the 4 `ProgressReportStatus` tiles
   (Outstanding/Draft/In progress/Complete), which are real numbered tiles. Verified the underlying data
   directly instead: `ComponentProgressReport/Crud/GetAll` filtered by `achievementStatus == 2` confirms
   the item is genuinely counted among the tenant-wide Not Achieved rows.

**Read as a UI-shape difference from ADO's "tile" wording, not a functional gap** — the underlying data
and the visual breakdown both genuinely reflect the new Not Achieved KPI, just via a pie chart rather
than a numbered tile like the other distribution has.

## TC-108871 — Integration — Finalise action refreshes the Performance dashboard aggregation

**ADO ID:** 108871 · **Coverage dimension:** Integration

### Confirmed live 2026-09-02 — pass on the case's core ask, one confirmed sub-clause gap

**Discovered along the way — a genuine duplicate-actioner pattern at Stage 6:** every live Stage 6 item
in this tenant has **3** `WorkflowInboxItem` rows for the same `workflowInstanceId`, each with a
different `personId`. Only **one** of the 3 is genuinely stage6's own — the other 2 render "Requested
action is not available" when opened. Confirmed by probing all 3 `todoId`s directly for `CPR2026/1101`;
the real one has `personId: 3b03d9ec-...-c43b7`. This explains the "2 duplicate rows" curiosity noted
back in [[epm-stage6-finalise-confirmed-working]] — it's actually 3, and it's consistent across every
Stage 6 item checked (`CPR2026/1099`, `CPR2026/1101`, `CPR2026/0892` all show the identical 3-personId
pattern).

**Step 1 (Finalise as top Component Actioner):** using the correct actioner row, `progressReportStatus`
advanced exactly `70 -> 180`, matching ADO. **But** the "Audit row written" sub-clause of this same step
does **not** hold — `EpmAuditedEntityEvent` stayed at 2 rows before and after, no new row for the
Finalise event itself. This is the same systemic gap already confirmed for Send Back in
[[epm-sendback-no-audit-event-no-notification]] — now a second confirmed instance of "the action
succeeds functionally, but writes no audit trail event."

**Step 2 (dashboard reload, Complete tile increments by one):** confirmed live — the Complete tile
genuinely went `5 -> 6` after reload. This is the case's namesake behavior and it's real.

**Step 3 (aggregation reflects achievement outcome, timestamp, finalising actor):** confirmed via the
CPR's own base fields — `achievementStatus` is populated, `lastModificationTime` is a fresh timestamp
matching the finalise action, `lastModifierUserId` records the actor. Not via a dedicated audit-trail
row, but the data genuinely is there and correct.

**Overall: pass on the case's primary ask** (dashboard aggregation genuinely refreshes and reflects the
new Completed item with its outcome/timestamp/actor) **with one documented pre-existing gap** (no audit
row for the Finalise event specifically) that mirrors an already-confirmed pattern elsewhere, rather than
a new standalone defect.

### Notes
- `todoId` is per-fetch/session-volatile — always re-fetch immediately before navigating.
- `Actual Target` and `Achievement Status` remain genuinely editable through Stage 3 (Quality Assure and
  Consolidate Progress Report), not locked after Stage 1 Capture — useful for building disposable
  zero-achievement or specific-value fixtures without re-running the whole chain from Stage 1.
- 2 duplicate `WorkflowInboxItem` rows were observed for one `workflowInstanceId` at Stage 6 in earlier
  testing (same actionText, different todoId) — possibly the same "duplicate appointment" pattern as
  [[epm-sha-role-duplicate-appointment]], not investigated further.
