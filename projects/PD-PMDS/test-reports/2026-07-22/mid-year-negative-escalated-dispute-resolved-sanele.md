# PMDS SL 1-12 — Mid-Year Negative Workflow #2 (Escalated Dispute, Resolved by Mediator Supervisor) — Sanele Sithole

**Date:** 2026-07-22
**Cycle:** SL 1-12 Performance Agreement, FY2026/27 — **Mid Year Assessment** stage
**App:** HCM Admin Portal (PMDS module) — https://pd-hcm-adminportal-qa.shesha.app/ (QA)
**Ref:** PR2026/7369 (employee Sanele Sithole, intern chain)
**Result:** PASSED — full escalated-dispute chain completed to **Awaiting PERSAL Sync** after the mediator supervisor resolved.

## Purpose
Replicate Contracting negative workflow #2 on the Mid-Year stage: a disagreement that the first-level **mediator cannot resolve**, escalates to the **mediator supervisor**, who **resolves** it, and the assessment then completes normally. Sanele is an intern (supervisor = Lungile Nhleko), so the chain has a full two-level mediation path.

## The chain (live, headed)
1. **Employee Self-Assessment** (`SaneleS`/`123qwe`, form `sagov-employee-complete-self-assessment v37`): 4 KRAs, Own Score = 3 on each of the 2 key activities per KRA (comment via the `wechat` dialog — this dialog has a proper **Submit**). Employee Comments (real type) → **Submit** → Draft → Review.
2. **Supervisor Review — Refer for dispute** (`LungileN`/`123qwe`, form `sagov-supervisor-review-performance-assessment v38`): on KRA1 "Optimise value for money in operations" set **Supervisor Score = 4** vs Own 3 → inline **Agreed Score** dropdown appeared, set **Agreed = 4** (+ per-activity comment); KRAs 2-4 scored 3/3 (matched Own, no disagreement). Page-level **Supervisor Comments** (real type) enabled the action buttons. Clicked **Refer for dispute** → comment-gated dialog (Ok enables on comment) → routed to mediator.
3. **Mediator — NOT resolved** (`BabalwaM`/`123qwe`, mediator = supervisor's supervisor): "Review disagreement and attempt to resolve" screen, selected **"The disagreement has not been resolved"** → revealed mandatory **Comments\*** + **Attachments\*** sub-form (both gate Submit). Filled comment + uploaded `mediation-outcome-sanele.txt` → **Submit** → status stays **Under appeal**, **escalated to the mediator supervisor**.
4. **Mediator Supervisor — RESOLVED** (`Tester97` = Tania Smith / `123qwe`, MEC — mediator's supervisor): same screen carries up the mediator's comment/attachment (read-only) + **Download Zip**; selected **"The disagreement has been resolved"** (no mandatory comment/attachment on the resolved branch) → **Submit** → routed back to employee.
5. **Employee — Update Performance Assessment with Outcomes** (`SaneleS`): tabs editable, ticked the **Confirmation** checkbox (the last of 11 checkboxes — the first 10 are read-only GAFs) → **Submit** processed first click → routed to supervisor.
6. **Supervisor — Review with Outcomes** (`LungileN`): "Review Performance Assessment with Outcomes", ticked Confirmation → **Submit** → HR Review.
7. **HR Verify** (`GOV005` = Andrew Smith / `123qwe` — Mid-Year HR verifier, NOT SalesHR): Confirmation checkbox → **Verify** → status **HR Review → Awaiting PERSAL Sync**.

## Verification
- Each step's task cleared from the acting user's inbox after the action; the next actor's inbox received the task.
- Employee-List (admin) — Sanele reached the completed Mid-Year state (Awaiting PERSAL Sync) via the resolved escalation.

## Notes / gotchas
- **Escalation mechanics (confirmed, matches Contracting neg-2):** mediator **NOT resolved** does not just park — it **escalates to the mediator's supervisor** as a real task (form ...`mediatorsupervisorreviewdisagreement...`), status stays **Under appeal**; if that supervisor **resolves**, it routes back to the employee "Update with Outcomes" and completes.
- **Mid-Year "…with Outcomes" Submit works first click** (Confirmation checkbox alone enables it) — the Contracting Update-Submit bug does not affect Mid-Year.
- The **self-assessment** per-activity comment dialog HAS a Submit button; the **supervisor review** per-activity comment field persists via input event (no Submit). Page-level Employee/Supervisor Comments require a **real click + type**.

## Environment
- All employees/supervisors pwd `123qwe`; mediator supervisor Tania Smith login `Tester97`/`123qwe`; Mid-Year HR verify `GOV005`/`123qwe`. Inbox `dynamic/Shesha.Workflow/workflows-inbox`; actions via `shesha/workflow-action?id=<id>&todoid=<todoId>`.
