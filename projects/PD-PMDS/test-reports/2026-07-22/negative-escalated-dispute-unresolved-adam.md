# PMDS SL 1-12 — Contracting Negative Workflow #3: Escalated Dispute, Unresolved at Both Levels (Adam Apple)

**Date:** 2026-07-22
**Cycle:** SL 1-12 Performance Agreement, FY2026/27
**App:** HCM Admin Portal (PMDS module) — https://pd-hcm-adminportal-qa.shesha.app/ (QA)
**Employee:** Adam Apple (`adam`, Intern 4 SL7), **PA2026/6227**
**Result:** PASSED (scenario driven end-to-end) — dispute **unresolved at both mediation levels**; PA terminates at Contracting Status **"Dispute Unresolved"**.

## Purpose / ADO coverage
Negative workflow #3 — the **fully unsuccessful** dispute: the mediator cannot resolve → escalates to the mediator's supervisor → **who also cannot resolve** → terminal. Sourced from ADO Test Plan **101517** suites:
- **101920** Employee Draft Performance Agreement
- **102065** Review Performance Agreement (negative) — Refer for Dispute
- **102112** Mediator Review Disagreement – Disagreement **Not Resolved** (Negative)
- **102115** Mediator Supervisor Review Disagreement – Disagreement **Not Resolved** (Negative)

## Steps executed (live, headed)
1. **Employee Draft & Submit** (`adam`/`123qwe`): 5-step wizard — 4 KRAs @25% (Total 100%), 4 GAFs, 8 key activities (Quarterly), 1 PDP. Supervisor = Lungile Nhleko, Mediator = Babalwa M (defaulted). Submit → **Draft → Review**.
2. **Supervisor Refer for Dispute** (`LungileN`): Review → **Refer for Dispute** (Yes gated by a Comments entry) → **Review → Under appeal**, routed to mediator Babalwa M.
3. **Mediator — NOT resolved → escalation** (`BabalwaM`): selected **"The disagreement has not been resolved"** → required **Comments\* + Attachments\*** (comment + `mediation-outcome.txt`) → Submit → **escalated to Tania Smith** (status stayed **Under appeal**).
4. **Mediator Supervisor — NOT resolved → terminal** (`Tania Smith`/`Tester97`, form `sagov-performanceagreement-wf-mediatorsupervisorreviewdisagreementandattemptoresolve v44`): escalation screen carried up Babalwa's comment + attachment (read-only). Selected **"The disagreement has not been resolved"** → same required **Comments\* + Attachments\*** → **Approve**. Appeal closed — **no further inbox task** appeared for any actor (Tania's inbox emptied to 0 items; nothing routed onward).
5. **Verification (admin):**
   - **Employee List → Contracting Status for Adam Apple = "Dispute Unresolved"** (Ref PA2026/6227). This is the true terminal outcome — a failed/unresolved dispute, **not** a successful agreement.
   - **Manage Process dashboard:** In progress **38 → 37**, Completed **3 → 4**. i.e. the "Completed" tile counts this terminal "Dispute Unresolved" PA as a *concluded* process even though the outcome is a failed dispute.

## Key findings
- **Both-levels-unresolved is a true terminal state.** After the mediator's supervisor also marks "not resolved", the workflow ends — no employee "Update with Outcomes" hand-back, no supervisor/HR task. The appeal is fully closed.
- **Terminal outcome label = "Dispute Unresolved"** on the Contracting Employee-List status column (distinct from the successful "Completed" and from the pre-terminal "Under appeal").
- **⚠️ Dashboard "Completed" tile is misleading for this path.** The Manage Process "Completed" count **incremented** for a *Dispute Unresolved* PA — so that tile really means "process concluded / no longer in progress", not "successfully agreed". This differs from the **Mid-Year** equivalent (2026-07-17 Adam), where the fully-unresolved terminal was **"NOT REQUIRED"** and **excluded** from the Completed rollup. Worth flagging to the dev/BA team: Contracting and Mid-Year classify the same fully-unsuccessful outcome differently, and the Contracting dashboard "Completed" number over-reports true completion.
- **"Not resolved" requires Comments\* + Attachments\* at both mediation levels** (gating the action); the mediator-supervisor screen's action button is **Approve**, the mediator's is **Submit**. Comment/attachment audit trail persists up the chain.

## Environment
- All actors pwd `123qwe` except the escalation authority **Tania Smith = `Tester97`**. Supervisor = `LungileN`; mediator = `BabalwaM`.
- Inbox: `dynamic/Shesha.Workflow/workflows-inbox`; tasks via `shesha/workflow-action?id=<paId>&todoid=<todoId>`. Employee-List status is authoritative for the real outcome; hard-refresh + search by surname ("Apple") to read a specific row.
