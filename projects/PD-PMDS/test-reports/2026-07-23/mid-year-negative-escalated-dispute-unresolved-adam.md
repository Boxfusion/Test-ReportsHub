# PMDS SL 1-12 — Mid-Year Negative #3: Escalated Dispute, Fully Unresolved (Adam Apple)

**Date:** 2026-07-23
**Cycle:** SL 1-12 Performance Agreement, FY2026/27
**App:** HCM Admin Portal (PMDS module) — https://pd-hcm-adminportal-qa.shesha.app/ (QA)
**Ref:** PR2026/7379 (Adam Apple, Intern 4)
**Result:** PASSED (negative path) — dispute marked NOT resolved at both levels → terminal **"Not Required"**

## Context
Mid-Year negative scenario #3 = **disagreement → Refer for dispute → mediator marks NOT resolved → escalates → mediator's supervisor ALSO marks NOT resolved → terminal**. Used an **intern** (Adam) so the escalation has a valid two-level chain (mediator **Babalwa M** → mediator's supervisor **Tania** `Tester97`), unlike the manager case (Lungile) where the mediator is already top-of-line and the escalation parks with no recipient. Roles: employee **Adam Apple** (`adam`) → supervisor **Lungile Nhleko** (`LungileN`) → mediator **BabalwaM** → **Tania**.

## Steps executed (live, headed)
1. **Employee Self-Assessment** (`adam`, PR2026/7379) — all 4 KRAs Own = 3 + comments → Submit.
2. **Supervisor Review + Refer** (`LungileN`) — disagreement on "Maintain accurate records…" (activity "Conduct monthly file audits" **Supervisor = 4 vs Own = 3**, Agreed = 4, comment + attachment); other KRAs Supervisor = 3. Verified all 4 KRAs saved (no silent-drop this run) → Supervisor Comments → **Refer for dispute** (Ok) → mediator.
3. **Mediator marks NOT resolved** (`BabalwaM`) — "not resolved" + Comments + Attachment (post-upload wait) → **Submit** → escalated to Tania.
4. **Mediator-supervisor ALSO marks NOT resolved** (`Tester97` = Tania) — "Mediator Supervisor Review" → "not resolved" + Comments + Attachment → **Submit**. ✅ **Terminal.**
5. **Terminal confirmed** — Tania's inbox = **0 items**; nothing routes onward to employee/supervisor/HR.
6. **Status verification (admin):**
   - **Employee List → Mid Year Assessment Status = "Not Required"** for Adam (Ref PR2026/7379).
   - **✅ Manage Process "Completed" tile did NOT increment** — stayed at **3** (Simmy + Jabu + Sanele). In Progress dropped 3 → 2, and the Not-Required PA fell into the Not-Started bucket (37).

## Key contrast with Contracting (correct behaviour on Mid-Year)
- **Mid-Year EXCLUDES the "Not Required" terminal from the Completed rollup** — the true completion count (3) is preserved.
- This is the **opposite of the Contracting over-count bug**, where a "Dispute Unresolved" terminal wrongly INCREMENTED the Contracting "Completed" tile. So the over-count defect is **Contracting-specific**; Mid-Year handles the terminal correctly.
- Terminal **labels differ by stage:** Contracting = **"Dispute Unresolved"**; Mid-Year = **"Not Required"**.

## Notes
- Escalation recipient = **Tania** (`Tester97`); her Mid-Year screen resolves/rejects via **Submit** (Contracting used "Approve").
- Mediator/Tania not-resolved both need **Comments + Attachment**; the post-upload ~3s wait guard held (no 500 on any escalation Submit).
- Supervisor KRA ratings all saved on the first pass this run (the silent-drop gotcha is intermittent — still verify per-KRA before referring).

## Environment
- Employee default password `123qwe`. Supervisor `LungileN`; mediator `BabalwaM`; escalation recipient `Tester97` (Tania); HR (not reached) `GOV005`.
- Attachment used: `.playwright-mcp/mediation-outcome-escalated.txt`.
