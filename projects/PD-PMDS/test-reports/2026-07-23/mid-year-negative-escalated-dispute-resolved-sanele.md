# PMDS SL 1-12 — Mid-Year Negative #2: Escalated Dispute, Resolved (Sanele Sithole)

**Date:** 2026-07-23
**Cycle:** SL 1-12 Performance Agreement, FY2026/27
**App:** HCM Admin Portal (PMDS module) — https://pd-hcm-adminportal-qa.shesha.app/ (QA)
**Ref:** PR2026/7387 (Sanele Sithole, Intern 5)
**Result:** PASSED — escalated dispute resolved at the mediator-supervisor level, completed to Awaiting PERSAL Sync

## Context
Mid-Year negative scenario #2 = **disagreement → Refer for dispute → mediator marks NOT resolved → escalates to the mediator's supervisor → who resolves → employee updates with outcomes → supervisor review with outcomes → HR verify**. Roles: employee **Sanele Sithole** (`SaneleS`) → supervisor **Lungile Nhleko** (`LungileN`) → mediator **Babalwa M** (`BabalwaM`) → mediator's supervisor **Tania** (`Tester97`) → HR **Andrew** (`GOV005`).

## Steps executed (live, headed)

1. **Employee Self-Assessment** (`SaneleS`, PR2026/7387) — all 4 KRAs, both activities **Own = 3** + comment → Employee Comments → **Submit**.
2. **Supervisor Review + Refer for Dispute** (`LungileN`) — created a **disagreement** on "Provide effective administrative support services" (activity "Schedule and coordinate meetings…" **Supervisor = 4 vs Own = 3** → inline **Agreed = 4**, comment + attachment); other activity + 3 other KRAs = **Supervisor 3** (agreement). Supervisor Comments → **Refer for dispute** (comment-gated Ok) → mediator.
3. **Mediator marks NOT resolved** (`BabalwaM`) — "The disagreement has not been resolved" + mandatory Comments + Attachment (post-upload ~3s wait) → **Submit** → escalated to the mediator's supervisor.
4. **Mediator-supervisor resolves** (`Tester97` = Tania) — "Mediator Supervisor Review Disagreement" → "The disagreement has been resolved" + comment → **Submit** (Mid-Year escalation screen uses **Submit**, not "Approve" as Contracting does) → routed back to the employee.
5. **Employee Update with Outcomes** (`SaneleS`) — single enabled Confirmation checkbox → **Submit first-click**.
6. **Supervisor Review with Outcomes** (`LungileN`) — approved via **Submit** (Confirmation-gated).
7. **HR Verify** (`GOV005` = Andrew) → **Awaiting PERSAL Sync**.
8. **Verification (admin).** Mid Year Assessment dashboard: **In Progress 3 / Completed 3** (Simmy + Jabu + Sanele).

Full escalated-resolved chain proven: Self-Assessment → supervisor Rate (disagreement) → Refer for dispute → Mediator NOT-resolved → **escalate** → Mediator-Supervisor Resolved → employee Update-with-Outcomes → supervisor Review-with-Outcomes → HR Verify → Awaiting PERSAL Sync.

## Notes / mechanics
- **Escalation recipient = Tania** (`Tester97`) — the mediator's supervisor; her screen action button is **Submit** (Mid-Year), whereas the Contracting escalation used **Approve**.
- **Mediator not-resolved 500 did NOT recur** — the ~3s post-upload wait guard held (consistent with all today's escalation runs).
- **Supervisor "silent KRA drop on Save" DID recur this run:** after the first pass, two KRAs (Deliver, Maintain) came back with blank Supervisor/Agreed scores and "Refer for dispute" stayed disabled. Re-opening each KRA, re-selecting Supervisor = 3, and re-Saving fixed it. **Always re-read each KRA row's Own/Supervisor/Agreed columns after rating; re-do any that show blanks before referring/signing.** (Matches the known Mid-Year gotcha.)
- Page-level Supervisor Comments must be filled to enable Refer/Sign.
- No Update-Submit bug on Mid-Year — both "…with Outcomes" Submits processed first-click.

## Post-run verification (data integrity confirmed)
Because the supervisor silent-KRA-drop hit this run, the final saved record was re-checked via the completed workflow instance (`/shesha/workflow?id=<instanceId>`, status **Awaiting PERSAL Sync**). All four KRAs persisted their Supervisor and Agreed scores correctly — **no blanks / no data loss**:
- Provide effective administrative support services (disputed): Own 3 / Supervisor 4 / **Agreed 4** (mediation outcome preserved)
- Coordinate stakeholder consultation and engagement: 3 / 3 / 3
- Deliver quality outputs and value for money: 3 / 3 / 3
- Maintain accurate records and filing systems: 3 / 3 / 3
- Overall Score: Own 100%, Supervisor/Agreed **108%** (agreed is authoritative).

Conclusion: the silent-drop is a data-entry-time UX defect (scores can silently revert on Save with no error, blocking Refer/Sign), but once re-entered and saved, the committed data is complete and accurate. Verify per-KRA scores before referring/signing.

## Environment
- Employee default password `123qwe`. Supervisor `LungileN`; mediator `BabalwaM`; escalation recipient `Tester97` (Tania); HR `GOV005` (Andrew).
- Attachment used: `.playwright-mcp/mediation-outcome-escalated.txt`.
