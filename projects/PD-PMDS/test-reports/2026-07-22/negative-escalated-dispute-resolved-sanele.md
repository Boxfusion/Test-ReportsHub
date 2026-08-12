# PMDS SL 1-12 — Contracting Negative Workflow #2: Escalated Dispute, Resolved by Mediator's Supervisor (Sanele Sithole)

**Date:** 2026-07-22
**Cycle:** SL 1-12 Performance Agreement, FY2026/27
**App:** HCM Admin Portal (PMDS module) — https://pd-hcm-adminportal-qa.shesha.app/ (QA)
**Employee:** Sanele Sithole (`SaneleS`, Intern 5 SL7), **PA2026/6281**
**Result:** PASSED — escalated dispute completed **end-to-end** to Generate PERSAL Input.

## Purpose / ADO coverage
Negative workflow #2 — a dispute the **mediator cannot resolve**, which **escalates to the mediator's supervisor**, who **resolves** it, after which the normal update/review/verify tail completes. Sourced from ADO Test Plan **101517** suites:
- **101920** Employee Draft Performance Agreement
- **102065** Review Performance Agreement (negative) — Refer for Dispute
- **102112** Mediator Review Disagreement – Disagreement **Not Resolved** (Negative)
- **102090** Mediator Supervisor Review Disagreement – Disagreement **Resolved** (Negative)
- **102091** Update Performance Agreement with Outcome (Negative)
- **102094** Review Updated Performance Agreement with Outcomes (Negative)
- **102051** Verify Performance Agreement

## Steps executed (live, headed)
1. **Employee Draft & Submit** (`SaneleS`/`123qwe`): 5-step wizard — 4 KRAs @25% (Service Standards/Access/Courtesy/Value for Money, **Total 100%**), 4 GAFs, 8 key activities (Quarterly), 1 PDP. Confirm-Details defaults correct: Supervisor = Lungile Nhleko, Mediator = **Babalwa M**. Submit → **Draft → Review**.
2. **Supervisor Refer for Dispute** (`LungileN`): Review task → **Refer for Dispute** → confirm dialog (Yes gated by a Comments entry) → **Review → Under appeal**, routed to mediator **Babalwa M**.
3. **Mediator — NOT resolved → escalation** (`BabalwaM`, form `sagov-performanceagreement-wf-mediatorreviewdisagreementandattemptoresolve v46`): selected **"The disagreement has not been resolved"**. This revealed the **"Mediator Dispute Resolution Outcome"** sub-form with **Comments\*** AND **Attachments\*** (both mandatory) — entered a comment and uploaded `mediation-outcome.txt` (native file chooser). Submit → **escalated to the mediator's supervisor, Tania Smith**; status stayed **Under appeal**.
4. **Mediator Supervisor — RESOLVED** (`Tania Smith`/`Tester97`, form `sagov-performanceagreement-wf-mediatorsupervisorreviewdisagreementandattemptoresolve v44`): the escalation screen carried up Babalwa's comment + attachment (read-only). Selected **"The disagreement has been resolved"**, added a determination comment + Save → **Approve** (this step's action button is **Approve**, not Submit). Routed back to the **employee** as **"Update Performance Agreement with Outcomes"** (status Review).
5. **Employee Update with Outcomes** (`SaneleS`): opened the Update task (all sub-tabs editable, prior data intact), visited each tab to hydrate, ticked the **Confirmation** checkbox → **Submit** → routed to supervisor. (Submit processed on first click — consistent with the bug fix verified earlier today.)
6. **Supervisor Review Updated & Approve** (`LungileN`): **"Review Updated Performance Agreement with Outcomes"** → Confirmation checkbox → **Submit** → **Review → HR Review**.
7. **HR Verify** (`SalesHR`): "Verify Performance Agreement" (full escalation/resolution comment thread persisted) → Confirmation → **Verify** → **HR Review → Generate PERSAL Input**.
8. **Verification (admin):** Contracting Manage Process dashboard now reads **41 Total / 0 Not Started / 38 In progress / 3 Completed** — Sanele's escalated-then-resolved PA joined Simmy (happy path) and Jabu (mediator-resolved dispute) on the Completed rollup.

Full escalated-dispute chain proven: employee Submit → supervisor **Refer for Dispute** → **Mediator: NOT resolved (comment + attachment) → escalate** → **Mediator's Supervisor: RESOLVED / Approve** → employee **Update with Outcomes / Submit** → supervisor **Review Updated / Submit** → HR **Verify** → **Generate PERSAL Input**.

## Key findings / notes
- **Escalation path is distinct from the terminal path.** When the mediator marks "not resolved", the task escalates one level up the hierarchy (Babalwa M → **Tania Smith**), keeping status **Under appeal**. Here the mediator's supervisor **resolved** it (contrast the 2026-07-17 Mid-Year Adam case where the top authority *also* marked it unresolved → terminal **NOT REQUIRED**). So: escalation can end either way; when the higher authority resolves, the workflow re-enters the standard update/review/verify tail and completes normally.
- **"Not resolved" requires Comments\* + Attachments\*** (both mandatory, gating Submit); the "resolved" option needs neither. The mediator-supervisor screen uses an **Approve** button (mediator uses **Submit**).
- Comment/attachment audit trail persists across all downstream stages (mediator → mediator-supervisor → employee update → supervisor review → HR verify).
- Usual non-fatal `executeScriptSync … reading 'cycle'/'tableData'` console noise + stray "Test" info banner on the PA forms; none blocked the flow.

## Environment
- All actors pwd `123qwe` **except** the escalation authority: **Tania Smith = `Tester97`** (mediator's supervisor / top-of-line). Supervisor = `LungileN`; mediator = `BabalwaM`; Contracting HR verify = `SalesHR`.
- Inbox: `dynamic/Shesha.Workflow/workflows-inbox`; tasks via `shesha/workflow-action?id=<paId>&todoid=<todoId>`. Attachment uploaded from within the project root (MCP file-upload sandbox restricts paths to the repo).
