# PMDS SL 1-12 — Mid-Year Negative Workflow #3 (Escalated Dispute, Unresolved / Terminal) — Lungile Nhleko

**Date:** 2026-07-22
**Cycle:** SL 1-12 Performance Agreement, FY2026/27 — **Mid Year Assessment** stage
**App:** HCM Admin Portal (PMDS module) — https://pd-hcm-adminportal-qa.shesha.app/ (QA)
**Ref:** PR2026/7365 (employee **Lungile Nhleko — a MANAGER**, HOD SALES SL10)
**Result:** PASSED — with finding: dispute ends **unresolved**; assessment parks at **"Under appeal"** with **no onward actionable task** (see finding).

## Purpose
Replicate Contracting negative workflow #3 (fully unsuccessful — both mediation levels *not resolved* → terminal) on the Mid-Year stage. The two remaining Mid-Year users were Sanele (intern → neg-2) and **Lungile (manager → neg-3)**. Lungile's reporting chain is one level higher than the interns': **supervisor = Babalwa M**, **mediator = Tania Smith (MEC)** — i.e. the mediator is the top of the hierarchy.

## The chain (live, headed)
1. **Employee Self-Assessment** (`LungileN`/`123qwe`): 4 managerial KRAs (Ensure courteous stakeholder engagement / Manage the branch budget & resources / Manage & develop the sales team / Lead sales operations & service delivery), Own Score = 3 on each activity (comment via the `wechat` dialog), Employee Comments (real type) → **Submit** → Draft → Review (to Babalwa M).
2. **Supervisor Review — Refer for dispute** (`BabalwaM`/`123qwe`): on KRA1 "Ensure courteous stakeholder engagement" set **Supervisor = 4** vs Own 3, **Agreed = 4**; KRAs 2-4 scored 3/3 (matched). Supervisor Comments (real type) → **Refer for dispute** (comment-gated Ok) → routed to mediator.
3. **Mediator (level 1) — NOT resolved** (`Tester97` = Tania Smith / `123qwe`, mediator = Babalwa's supervisor): "Review disagreement and attempt to resolve" → **"The disagreement has not been resolved"** → mandatory **Comments\*** + **Attachments\*** filled (uploaded `mediation-outcome-lungile-l1.txt`) → **Submit** → status stays **Under appeal**, escalation attempted to the mediator supervisor.

## FINDING — manager chain has no mediator supervisor above the MEC
After Tania (the mediator, who is the **top-level MEC**) marked *not resolved*, the assessment stayed at **"Under appeal"** but **no onward actionable task was created for any reachable reviewer**:
- **Tania's** inbox (the mediator) — 0 items after her submit (re-checked twice).
- **Babalwa M's** inbox — 0 items.
- **admin** inbox — only 2 unrelated items (different entities).
- Employee-List (admin) confirms Lungile's **Mid Year Assessment Status = "Under appeal"**, Ref **PR2026/7365** — NOT a terminal label ("NOT REQUIRED" / "Dispute Unresolved") and NOT completed.

**Interpretation:** the "not resolved → escalate to the mediator's supervisor" mechanic requires a person above the mediator. For an **intern** (mediator = Babalwa, mediator-supervisor = Tania) this works — see the Sanele neg-2 run, where Tania received and actioned the escalated task. For a **manager** whose mediator is already the top of the hierarchy (Tania/MEC), the escalation has **no valid recipient**, so the assessment parks at "Under appeal" indefinitely with no onward task. The dispute is therefore effectively **terminal / unresolved** (the neg-3 outcome), but it is reached by hitting the hierarchy ceiling rather than by a clean two-level escalation ending in a terminal status.

**Recommendation:** the app should either (a) apply a terminal status ("Dispute Unresolved" / "NOT REQUIRED") when the mediator has no supervisor to escalate to, or (b) route the top-level escalation to a defined fallback (e.g. HR/admin). As-is, a top-tier manager's unresolved dispute is silently stuck at "Under appeal" with no visible next actor. Worth raising with dev.

## Notes
- This reconciles with the earlier (2026-07-15) observation that a *not-resolved* outcome could leave a PA "parked Under appeal with no active inbox task" — that occurs specifically when the escalation has no valid recipient (top of hierarchy), not in general.
- Contrast: the **intern** two-level escalation is fully functional (Sanele neg-2 completed via Tania resolving at the mediator-supervisor level).

## Environment
- All employees/supervisors pwd `123qwe`; Tania Smith login `Tester97`/`123qwe`. Manager (Lungile) supervisor = `BabalwaM`, mediator = Tania. Inbox `dynamic/Shesha.Workflow/workflows-inbox`; cycle Employee-List via `dynamic/SaGov.Pmds/sagov-cycle-details-view` (search "Nhleko").
