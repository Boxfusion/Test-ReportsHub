# PMDS SL 1-12 Performance Agreement — Contracting Negative Workflow #1: Resolved Dispute (Adam Apple)

**Date:** 2026-07-23
**Cycle:** SL 1-12 Performance Agreement, FY2026/27
**App:** HCM Admin Portal (PMDS module) — https://pd-hcm-adminportal-qa.shesha.app/ (QA)
**Ref:** PA2026/6313 (Adam Apple, Intern 4, SL7)
**Result:** PASSED — full resolved-dispute chain completed end-to-end to Generate PERSAL Input

## Context
Negative workflow #1 = **dispute referred to mediation → mediator resolves → employee updates PA with outcomes → supervisor approves → HR verifies**. Run against the fresh data set (Contracting opened earlier today, 41 In progress). Roles: employee **Adam Apple** (`adam`) → supervisor **Lungile Nhleko** (`LungileN`, HOD SALES SL10) → mediator **Babalwa M** (`BabalwaM`, Chief Director SL13) → HR **Sales HR** (`SalesHR`). This also served as a **retest of the previously-flagged BUG #1** (Update-with-Outcomes Submit failure).

## Steps executed (live, headed)

1. **Employee Draft & Submit** (`adam`/`123qwe`, PA2026/6313). 5-step wizard: Confirm Details (Supervisor = Lungile Nhleko, Mediator = Babalwa M, both defaulted) → Scoring 4 KRAs @ 25% (Total 100%) + 4 GAFs (Job Knowledge, Initiative, Management Of Financial Resources, Management Of Human Resources) → Workplan 2 key activities/KRA (8 total, Quarterly, target 2026-09-30) → 1 PDP (Basic Project Management / Formal Course / 2026-08-03) → 2 attestations → **Submit**. Status **Draft → Review**.
2. **Supervisor Refer for Dispute** (`LungileN`). Review task → **Refer for Dispute** → confirm dialog "Are you sure you wish to refer this Performance Agreement for Mediation?" with a mandatory Comments box (comment entered) → **Yes**. Status **Review → Under appeal**, routed to mediator.
3. **Mediator resolves** (`BabalwaM`). Inbox action **"Mediator Review Disagreement and attempt to resolve"**. Selected **"The disagreement has been resolved"** (resolved path — no mandatory attachment, unlike the not-resolved path) + comment → **Submit**. Routed back to the employee.
4. **Employee Update with Outcomes** (`adam`). Inbox action **"Update Performance Agreement with Outcomes"** — read-through tabs (Details/Scoring/Workplan/PDP/Supporting Docs), all prior data intact + editable. Ticked the **Confirmation** checkbox ("...updated to reflect the outcomes of the dispute resolution process") → **Submit PROCESSED first clean click**. Status → Review (to supervisor).
5. **Supervisor Review Updated PA** (`LungileN`). Inbox action **"Review Updated Performance Agreement with Outcomes"** — approved via **Submit** (not "Sign"), gated by the same Confirmation checkbox. Status → HR Review.
6. **HR Verify** (`SalesHR`). Inbox action **"Verify Performance Agreement"** — ticked Confirmation → **Verify**. Status **HR Review → Generate PERSAL Input**.
7. **Verification (admin).** Contracting Manage Process dashboard: **41 Total / 0 Not Started / 38 In progress / 3 Completed** — Adam's resolved-dispute PA correctly counted in the Completed rollup (Simmy + Jabu + Adam).

Full resolved-dispute chain proven: Draft → Refer for Dispute → Mediator Resolved → employee Update-with-Outcomes → supervisor Review-Updated/Approve → HR Verify → Generate PERSAL Input.

## BUG #1 retest — NOT reproducible on a clean run
The **Update-with-Outcomes Submit** processed on the first clean click. **Verdict: cannot reproduce — the fix holds.**

⚠️ **Important false-alarm note (harness artifact, not an app bug).** On my *first* attempt at the Update-with-Outcomes step I mis-targeted the confirmation control: `document.querySelector('input[type=checkbox]')` returns the **first GAF** checkbox from the Scoring subform, **not** the Confirmation (the Confirmation is the **last** of 11 checkboxes = 10 GAFs + 1 Confirmation). My toggling inadvertently dropped the GAF selection to 3 (below the min-4 rule). Submitting in that corrupted state produced a genuine-looking server error — `400` on `SheshaWorkflow/Process/UserTaskComplete`, `Failed to execute action 'workflows:User Task Complete': Your request is not valid! … 'SaGovPerformanceAgreementWorkflow'`, and `TypeError: Cannot read private member #L … at Proxy.post` (the same signature as the old BUG #1). **Reloading the task fresh, leaving the 4 GAFs untouched, and ticking only the Confirmation → Submit succeeded immediately.** So the error was self-inflicted client-side validation corruption, not a workflow regression. Per [[verify-before-claiming-app-bug]], this was ruled out before reporting.

## Observations / notes
- **Confirmation checkbox is the LAST checkbox** on the Update-with-Outcomes and Review-Updated screens (after the 10 Scoring-subform GAF checkboxes). Always target `cbs[cbs.length-1]`, never `querySelector('input[type=checkbox]')`.
- **Mediator login = `BabalwaM`/`123qwe`** (Babalwa M, Chief Director SL13) — she is the defaulted mediator for these interns (supervisor's supervisor). Earlier runs had Tania Smith as mediator; the current org data defaults to Babalwa M.
- Resolved path shows **no mandatory attachment** (radio + optional comment only); the not-resolved path adds mandatory Comments + Attachments and escalates.
- Submit on the Update/Review screens stays disabled until all tabs load and the min-4-GAF + 100%-weight validation passes (console logs a live `=== START VALIDATION ===` trace).
- Non-fatal `...reading 'cycle'` console noise and the stray "Test" banner persist (cosmetic).

## Environment
- Employee default password `123qwe`. `SalesHR` = Contracting HR-verify role.
- Inbox `dynamic/Shesha.Workflow/workflows-inbox`; tasks via `shesha/workflow-action?id=<paId>&todoid=<todoId>`.
