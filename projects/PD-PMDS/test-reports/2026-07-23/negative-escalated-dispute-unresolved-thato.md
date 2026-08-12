# PMDS SL 1-12 Performance Agreement — Contracting Negative Workflow #3: Escalated Dispute, Fully Unresolved (Thato Mali)

**Date:** 2026-07-23
**Cycle:** SL 1-12 Performance Agreement, FY2026/27
**App:** HCM Admin Portal (PMDS module) — https://pd-hcm-adminportal-qa.shesha.app/ (QA)
**Ref:** PA2026/6331 (Thato Mali, Intern 3, SL4)
**Result:** PASSED (negative path) — dispute escalated and marked NOT resolved at both levels → terminal **"Dispute Unresolved"**

## Context
Negative workflow #3 = **dispute referred → mediator marks NOT resolved → escalates → mediator's supervisor ALSO marks NOT resolved → terminal (dispute closed, nothing routes onward)**. Roles: employee **Thato Mali** (`ThatoMali`) → supervisor **Lungile Nhleko** (`LungileN`) → mediator **Babalwa M** (`BabalwaM`) → mediator's supervisor **Tania** (`Tester97`).

## Steps executed (live, headed)

1. **Employee Draft & Submit** (`ThatoMali`, PA2026/6331). 4 KRAs @ 25% (100%) + 4 GAFs (Reliability, Management Of Financial Resources, Delegation And Empowerment, Technical Skills) + 8 key activities + 1 PDP + 2 attestations → **Submit**. Draft → Review. ✅
2. **Supervisor Refer for Dispute** (`LungileN`). Review → **Refer for Dispute** + comment → **Yes**. Review → Under appeal → mediator. ✅
3. **Mediator marks NOT resolved** (`BabalwaM`). "Mediator Review Disagreement…" → **"The disagreement has not been resolved"** + Comments\* + Attachment\* → **Submit**. Escalated to the mediator's supervisor. ✅
4. **Mediator-supervisor ALSO marks NOT resolved** (`Tester97` = Tania). "Mediator Supervisor Review Disagreement…" → **"The disagreement has not been resolved"** + Comments\* + Attachment\* → **Approve**. ✅ **Terminal.**
5. **Terminal confirmed.** After Approve, Tania's inbox = **0 items** — nothing routes onward to any party (no employee update, no HR verify). The appeal is fully closed.
6. **Status verification (admin).**
   - **Employee List → Contracting Status = "Dispute Unresolved"** for Thato Mali (Ref PA2026/6331). This is the Contracting terminal label (Mid-Year's equivalent terminal is labelled "Not Required").
   - **⚠️ Manage Process "Completed" tile over-counts:** it incremented **4 → 5** (In progress 37 → 36) when this Dispute-Unresolved PA reached its terminal. Only **4** employees genuinely completed (Simmy, Jabu, Adam, Sanele → Generate PERSAL Input); Thato's failed-dispute terminal is wrongly rolled into "Completed". Read true completion from the Employee-List status column, not the dashboard tile.

Full fully-unresolved chain proven: Draft → Refer for Dispute → Mediator NOT-resolved → escalate → Mediator-Supervisor NOT-resolved/Approve → **terminal "Dispute Unresolved"** (no onward task).

## Known issue re-confirmed — Completed-tile over-count
Consistent with the 2026-07-22 finding (Adam PA2026/6227): Contracting's "Completed" tile treats the Dispute-Unresolved terminal as "concluded" and over-reports true completion, unlike Mid-Year which excludes its "Not Required" terminal. Not re-logged as a new bug — same behaviour, flagged here.

## Automation note — mediator not-resolved Submit (the 07-23 timing 500)
Both not-resolved Submits (mediator step 3 and, via **Approve**, escalation step 4) went through cleanly this run **after adding a ~3s wait between the attachment's `StoredFile/Upload` (200) and the Submit/Approve click**. This confirms the earlier 500 seen on Sanele's run was a **timing/automation artifact** (Submit firing before the just-uploaded file fully committed), not a workflow bug. Guard adopted: after upload returns 200, wait and re-verify before submitting.

## Escalation mechanics (re-confirmed)
- Both not-resolved screens require **Comments\* + Attachments\*** (the resolved path needs neither).
- Escalation recipient = mediator's supervisor **Tania** (`Tester97`); her screen is "Mediator Supervisor Review Disagreement and attempt to resolve", action button **Approve**.
- If the mediator-supervisor also marks not-resolved → **terminal**, appeal fully closed, no onward task (verified: Tania inbox empty afterwards).

## Environment
- Employee default password `123qwe`. Mediator `BabalwaM`; escalation recipient `Tester97` (Tania).
- Inbox `dynamic/Shesha.Workflow/workflows-inbox`; tasks via `shesha/workflow-action?id=<paId>&todoid=<todoId>`.
- Attachment: `.playwright-mcp/mediation-outcome-escalated.txt` (reused for both not-resolved uploads).
