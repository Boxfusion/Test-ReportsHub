# PMDS SL 1-12 Performance Agreement — Contracting Happy Path, MANAGER (Lungile Nhleko)

**Date:** 2026-07-23
**Cycle:** SL 1-12 Performance Agreement, FY2026/27
**App:** HCM Admin Portal (PMDS module) — https://pd-hcm-adminportal-qa.shesha.app/ (QA)
**Ref:** PA2026/6323 (Lungile Nhleko, HOD SALES, SL10)
**Result:** PASSED — manager happy-path completed end-to-end to Generate PERSAL Input

## Context
Positive Contracting workflow for a **manager** (as opposed to the interns run earlier today). Lungile Nhleko is herself the supervisor for the intern cohort, so her own PA runs one level up: **Supervisor = Babalwa M** (Chief Director, SL13), **Mediator = Tania Smith** (MEC). Chain: employee Lungile → supervisor **BabalwaM** Sign → HR **SalesHR** Verify → Generate PERSAL Input.

## Steps executed (live, headed)

1. **Employee Draft & Submit** (`LungileN`/`123qwe`, PA2026/6323). Confirm Details showed **Supervisor = Babalwa M** and **Mediator = Tania Smith (MEC)** — both defaulted (manager chain, one level up from interns). 5-step wizard with managerial content:
   - **Scoring** — 4 KRAs @ 25% (Total 100%): Lead & manage the sales unit (Service Standards), Manage HR & staff performance (Consultation), Manage the unit budget & VFM (Value for Money), Stakeholder engagement & reporting (Information). 4 GAFs ticked incl. the managerial **Management Of Financial Resources** (+ Communication, Delegation And Empowerment, Job Knowledge).
   - **Workplan** — 2 key activities per KRA (8 total), managerial activities (target/monitor unit targets, staff reviews, budget management, VFM procurement review, stakeholder sessions, management reports); Quarterly, target 2026-09-30.
   - **PDP** — 1 PDP: Advanced Project Management for the Public Service / Formal Course / commencement 2026-08-03.
   - **Completed Summary** — both attestations → **Submit**. Draft → Review.
2. **Supervisor Sign** (`BabalwaM`/`123qwe`, Babalwa M). Inbox "Review Performance Agreement" → **Sign** (no mandatory comment). Review → HR Review. Babalwa M is also the interns' mediator, but here acts as Lungile's line supervisor.
3. **HR Verify** (`SalesHR`). "Verify Performance Agreement" → Confirmation checkbox → **Verify**. HR Review → **Generate PERSAL Input**.
4. **Verification (admin).** Contracting Manage Process dashboard: **Completed 5 → 6**. (Note: Total moved 41 → 42 with 1 Not Started — a newly-created employee added to the cycle, unrelated to this run.)

Full manager happy-path proven: Draft/Submit → supervisor (BabalwaM) Review/Sign → HR Verify → Generate PERSAL Input.

## Observations / notes
- **Manager GAF set** includes managerial factors (Management Of Financial Resources present); the intern GAF lists earlier today varied per employee. Pick from the live list.
- **BabalwaM plays two roles** in this cycle: interns' **mediator** and Lungile's **supervisor**. On Lungile's PA she gets a **Sign** action (supervisor), not a mediator action.
- Wizard transitions and all Submits (draft, Sign, Verify) processed first-click; no 500s on this positive run.
- Non-fatal `...reading 'cycle'` console noise and the stray "Test" banner persist (cosmetic).

## Contracting cohort status after this run (Completed = 6)
Genuine completions to Generate PERSAL Input: **Simmy, Jabu, Adam, Sanele, Lungile** (5). Plus **Thato** counted in the tile as a Dispute-Unresolved terminal (the known Completed-tile over-count) → tile shows 6.

## Environment
- Employee default password `123qwe`. Lungile supervisor = `BabalwaM`; HR verify = `SalesHR`.
- Inbox `dynamic/Shesha.Workflow/workflows-inbox`; tasks via `shesha/workflow-action?id=<paId>&todoid=<todoId>`.
