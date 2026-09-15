# PMDS SL 1-12 — Mid-Year Negative #1: Resolved Dispute (Jabu Hadebe)

**Date:** 2026-07-23
**Cycle:** SL 1-12 Performance Agreement, FY2026/27
**App:** HCM Admin Portal (PMDS module) — https://pd-hcm-adminportal-qa.shesha.app/ (QA)
**Ref:** PR2026/7383 (Jabu Hadebe, Intern 2)
**Result:** PASSED — Mid-Year single-level dispute resolved and completed to Awaiting PERSAL Sync

## Context
Mid-Year negative scenario #1 = **disagreement → Refer for dispute → mediator resolves → employee updates with outcomes → supervisor review with outcomes → HR verify**. Roles: employee **Jabu Hadebe** (`JabuH`) → supervisor **Lungile Nhleko** (`LungileN`) → mediator **Babalwa M** (`BabalwaM`) → HR **Andrew** (`GOV005`).

## Steps executed (live, headed)

1. **Employee Self-Assessment** (`JabuH`, PR2026/7383). All 4 KRAs, both key activities each **Own = 3** + comment; Employee Comments → **Submit**. → Review (supervisor).
2. **Supervisor Review + Refer for Dispute** (`LungileN`). Rated all 4 KRAs; created a **disagreement** on the "Coordinate stakeholder…" KRA by setting **Supervisor = 4 vs Own = 3** on the "Process incoming correspondence" activity. Effects observed:
   - Supervisor ≠ Own **surfaces an inline "Agreed Score" dropdown** on that activity (set to 4).
   - Rating **4 requires comment + attachment** (added both; attachment via the per-activity upload with a ~3s post-upload wait). The other activity and the 3 other KRAs were rated **Supervisor = 3** (agreement, comment only).
   - With all KRAs rated + Supervisor Comments, **"Refer for dispute"** enabled → clicked → confirm dialog (comment-gated) → **Ok**. Status → routed to mediator.
3. **Mediator resolves** (`BabalwaM`). Action "Mediator Review Disagreement" → **"The disagreement has been resolved"** + comment → **Submit**. Routed back to the employee.
4. **Employee Update with Outcomes** (`JabuH`). Action "Update Performance Assessment with Outcomes" → single enabled **Confirmation** checkbox (the 10 GAF checkboxes are read-only) → **Submit processed first-click**. → Review.
5. **Supervisor Review with Outcomes** (`LungileN`). Approved via **Submit** (Confirmation-gated). → HR Review.
6. **HR Verify** (`GOV005` = Andrew). Confirmation → **Verify** → **Awaiting PERSAL Sync**.
7. **Verification (admin).** Mid Year Assessment dashboard: **In Progress 4 / Completed 2** (Simmy + Jabu).

Full Mid-Year resolved-dispute chain proven: Self-Assessment → supervisor Rate (disagreement) → Refer for dispute → Mediator Resolved → employee Update-with-Outcomes → supervisor Review-with-Outcomes → HR Verify → Awaiting PERSAL Sync.

## Mid-Year dispute mechanics (confirmed)
- **Disagreement trigger:** on the supervisor Rate Key Activities modal, setting **Supervisor Score ≠ Own Score** reveals an inline **Agreed Score** dropdown for that activity.
- **Comment/attachment rule applies to supervisor ratings too:** score 3 → comment only; scores 1/2/4 → comment **and** attachment (the disagreement at 4 needed the attachment).
- **"Refer for dispute"** is a supervisor page-level action (enabled once all KRAs are rated); its confirm dialog is **comment-gated (Cancel/Ok)**.
- **No Update-Submit bug on Mid-Year** — both "…with Outcomes" Submits (employee + supervisor) processed on the first click, gated only by the Confirmation checkbox. (The broken Submit was specific to the Contracting update form; Mid-Year is unaffected.)
- Mediator resolved-path radio needs only a comment (no attachment), consistent with earlier.

## Environment
- Employee default password `123qwe`. Supervisor `LungileN`; mediator `BabalwaM`; HR `GOV005` (Andrew).
- Inbox `dynamic/Shesha.Workflow/workflows-inbox`; tasks via `shesha/workflow-action?id=<paId>&todoid=<todoId>`.
- Attachment used: `.playwright-mcp/mediation-outcome-escalated.txt`.
