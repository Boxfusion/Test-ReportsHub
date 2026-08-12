# PMDS SL 1-12 — Mid-Year Negative #2 (MANAGER): Escalated Dispute, Resolved (Lungile Nhleko)

**Date:** 2026-07-23
**Cycle:** SL 1-12 Performance Agreement, FY2026/27
**App:** HCM Admin Portal (PMDS module) — https://pd-hcm-adminportal-qa.shesha.app/ (QA)
**Ref:** PR2026/7381 (Lungile Nhleko, HOD SALES — MANAGER)
**Result:** PASSED — manager escalated dispute escalated **one level above the mediator (to ThandoZide)**, was resolved there, and completed end-to-end to Awaiting PERSAL Sync.

## ⚠️ Correction to an earlier assumption
An initial read of this run (and the 2026-07-22 Lungile PR2026/7365 note) concluded the manager escalation "parks at Under appeal with no recipient" because the mediator (Tania) is top-of-line. **That was wrong.** The escalation **does** route onward — to **ThandoZide** (the level above Tania). The mistake was checking only Tania's inbox (empty, because she'd submitted) and reading the transient **"Under appeal"** status as terminal, without checking ThandoZide's inbox. Once ThandoZide resolved it, the dispute completed normally. **The 07-22 "manager no-recipient parking" finding is retracted** — the manager two-level escalation works.

## Chain (roles)
Employee **Lungile Nhleko** (`LungileN`) → supervisor **Babalwa M** (`BabalwaM`) → mediator **Tania** (`Tester97`) → **escalation recipient ThandoZide** (`ThandoZide`) → HR **Andrew** (`GOV005`).

## Steps executed (live, headed)
1. **Employee Self-Assessment** (`LungileN`, PR2026/7381) — 4 managerial KRAs, Own = 3 + comments → Submit.
2. **Supervisor Review + Refer** (`BabalwaM`) — disagreement on "Ensure effective stakeholder engagement and reporting" (activity "Compile and submit management reports" **Supervisor = 4 vs Own = 3**, Agreed = 4, comment + attachment); other KRAs Supervisor = 3 → **Refer for dispute** → mediator Tania.
3. **Mediator NOT resolved** (`Tester97` = Tania) — "not resolved" + Comments + Attachment → **Submit** → **escalated to ThandoZide** (status shows "Under appeal" while the escalation task sits with ThandoZide).
4. **Escalation recipient resolves** (`ThandoZide`) — inbox action **"Review disagreement and attempt to resolve"** → **"The disagreement has been resolved"** + comment → **Submit** → routed back to the employee.
5. **Employee Update with Outcomes** (`LungileN`) → Submit (first-click). → Review.
6. **Supervisor Review with Outcomes** (`BabalwaM`) → Submit. → HR Review.
7. **HR Verify** (`GOV005` = Andrew) → **Awaiting PERSAL Sync**.
8. **Verification (admin).** Mid Year Assessment dashboard: **In Progress 0 / Completed 5** (Simmy, Jabu, Sanele, Tony, Lungile).

## Key correction / mechanics
- **Manager escalation chain has a level above the mediator:** mediator **Tania** → escalation recipient **ThandoZide** (`ThandoZide`/`123qwe`). So a manager's not-resolved dispute escalates correctly and can be resolved (or presumably terminated) at ThandoZide's level — it does **not** dead-end.
- **"Under appeal" is the in-flight status while the escalation task is open**, not a terminal — always check the escalation recipient's inbox (here ThandoZide) before concluding a dispute is stuck.
- ThandoZide's screen is titled **"Review disagreement and attempt to resolve"** with the resolved / not-resolved radios and a **Submit** action.

## Environment
- `LungileN` (employee) / `BabalwaM` (supervisor) / `Tester97` (mediator, Tania) / **`ThandoZide` (escalation recipient)** / `GOV005` (HR); all pwd `123qwe`.
- Attachment used: `.playwright-mcp/mediation-outcome-escalated.txt`. Instance viewer: `/shesha/workflow?id=<instanceId>`.
