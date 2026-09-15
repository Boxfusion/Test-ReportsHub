# PMDS SL 1-12 — Contracting Resolved-Dispute Path (Jabu Hadebe) — BUG RETEST

**Date:** 2026-07-22
**Cycle:** SL 1-12 Performance Agreement, FY2026/27
**App:** HCM Admin Portal (PMDS module) — https://pd-hcm-adminportal-qa.shesha.app/ (QA)
**Employee:** Jabu Hadebe (`JabuH`, Intern 2 SL5), **PA2026/6241**
**Result:** PASSED — resolved-dispute path completed **end-to-end** to Generate PERSAL Input. **The previously-blocking "Update Performance Agreement with Outcomes" Submit bug is FIXED.**

## Purpose
Negative scenario #1 — a **successful resolution after a dispute**. This is the exact path that was blocked on 2026-07-16 by an app defect on the employee "Update with Outcomes" Submit (`sagov-performanceagreement-wf-updateperformanceagreement v43`: Submit did nothing, console threw `Action name is mandatory` ×8 + `Cannot read private member #L`). Data has since been cleared and the bug reported fixed; driven again with the **same employee (Jabu)** used to reproduce it.

## Steps executed (live, headed)
1. **Employee Draft & Submit** (`JabuH`/`123qwe`): 5-step wizard — 4 KRAs @25% (Service Standards/Access/Courtesy/Value for Money, **Total 100%**), 4 GAFs (Communication, Job Knowledge, Reliability, Initiative), 2 key activities per KRA (8 total, Quarterly), 1 PDP (Basic Project Management / Formal Course). Confirm-Details defaults correct: Supervisor = Lungile Nhleko, Mediator = **Babalwa M**. Submit → **Draft → Review**.
2. **Supervisor Refer for Dispute** (`LungileN`/`123qwe`): Review task → **Refer for Dispute** → confirm dialog "Are you sure you wish to refer this Performance Agreement for Mediation?" (Yes gated by a Comments entry; entered a dispute reason) → **Review → Under appeal**, routed to mediator Babalwa M.
3. **Mediator resolution** (`BabalwaM`/`123qwe`): inbox action **"Mediator Review Disagreement and attempt to resolve"** (Under appeal; supervisor's dispute comment carried in the thread). Selected **"The disagreement has been resolved"**, added a mediation comment + Save → **Submit**. Routed back to the **employee** as **"Update Performance Agreement with Outcomes"** (status Review). ✓
4. **🔑 Employee Update with Outcomes — BUG RETEST** (`JabuH`): opened the "Update Performance Agreement with Outcomes" task (mediator's comment visible in the audit thread). Visited all sub-tabs (Details/Scoring/Workplan/PDP) to hydrate, ticked the **Confirmation** checkbox ("…updated to reflect the outcomes of the dispute resolution process") → **Submit**. **✅ Submit PROCESSED** — navigated straight back to the inbox and the task **left the employee's inbox (0 items)**. On the Submit action the console errors dropped (the `Action name is mandatory` / `#L` POST error no longer fires). Routed to the supervisor.
5. **Supervisor Review Updated PA & Approve** (`LungileN`): inbox **"Review Updated Performance Agreement with Outcomes"** — approve via **Submit** (not "Sign"), gated by the Confirmation checkbox. Ticked → **Submit**. Status **Review → HR Review**.
6. **HR Verify** (`SalesHR`/`123qwe`): inbox "Verify Performance Agreement" (mediator resolution comment persisted in the thread). Ticked Confirmation → **Verify**. Status **HR Review → Generate PERSAL Input**.
7. **Verification (admin):** Contracting Manage Process dashboard now reads **41 Total / 0 Not Started / 39 In progress / 2 Completed** — Jabu's resolved-dispute PA joined Simmy's happy-path PA on the Completed rollup.

Full resolved-dispute chain proven end-to-end: employee Submit → supervisor **Refer for Dispute** → mediator **Resolved** → employee **Update with Outcomes / Submit** → supervisor **Review Updated & Submit** → HR **Verify** → **Generate PERSAL Input**.

## Bug status
- **`2026-07-16-update-pa-with-outcomes-submit-fails.md` — FIXED / cannot reproduce (2026-07-22).** The employee "Update Performance Agreement with Outcomes" Submit now processes on first click, advances the workflow, and clears the task from the inbox. The `Action name is mandatory` / `TypeError: Cannot read private member #L … Proxy.post` errors previously fired on the Submit action are gone.

## Observations / notes
- Comments thread (supervisor dispute reason → mediator resolution) persists across all downstream stages as an audit trail — visible on the employee Update, supervisor Review-Updated, and HR Verify screens.
- Usual non-fatal `executeScriptSync … reading 'cycle'/'tableData'` console noise and the stray "Test" info banner still present on the PA forms; neither blocks the flow.
- Contracting Refer-for-Dispute is a pure supervisor action on the Review screen (no scoring divergence needed, unlike Mid-Year).

## Environment
- Employee/supervisor/mediator pwd `123qwe`. Mediator **BabalwaM** (Chief Director SL13 = supervisor's supervisor). Contracting HR verify = **SalesHR**.
- Inbox: `dynamic/Shesha.Workflow/workflows-inbox`; tasks via `shesha/workflow-action?id=<paId>&todoid=<todoId>`.
