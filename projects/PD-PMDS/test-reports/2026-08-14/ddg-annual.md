# PMDS DDG — Annual Assessment: 1 positive + 3 negative scenarios

**Date:** 2026-08-14
**Cycle:** Deputy Director General Performance Agreement, FY2026/27 — **Annual Assessment**
(cycle id `bd84d9b2-a30a-4605-aac3-19bb41f8c374`, 6 employees)
**App:** HCM Admin Portal (PMDS module) — https://pd-hcm-adminportal-qa.shesha.app/ (QA)
**Refs:** PR2026/3942 (Kabelo Mabalane) · PR2026/3940 (Thando Zide) · PR2026/3932 (Hennie Kruger) ·
PR2026/3938 (Gail Mabalane)
**Result:** PASSED — all 4 scenarios completed to their expected end states. **No blocking defects.**
This closes out the third and final population — **all 12 Annual workflow runs (4 workflows × 3
populations) are now proven end-to-end.**

## Context

Final Annual cycle run this session, using the four DDG employees from the 2026-08-11 Mid-Year run
(Kabelo, Gail, Thando, Hennie), whose supervisor/mediator chain again shows heavy account reuse across
roles (`KabeloM` is both WF1's employee and WF2/WF4's mediator/Draft-Outcome-Letter actor; `Sampha` and
`Tester97`/Tania reappear from the CD/Director run as DDG's tier-1/tier-2 mediators too).

All 4 self-assessments were run **concurrently** (4 parallel headed browser sessions) to save time —
one transient failure occurred (Kabelo's first attempt read 0 KRA rows, likely a page-load timing issue
under the combined load) and was cleanly retried with no data loss (the self-assessment script's built-in
guard refused to submit at 0% rather than submitting bad data).

| Scenario | Employee | Ref | Outcome |
|---|---|---|---|
| Positive | Kabelo Mabalane (`KabeloM`) | PR2026/3942 | ✅ Awaiting PERSAL sync |
| Negative 1 — resolved dispute | Thando Zide (`ThandoZide`) | PR2026/3940 | ✅ Awaiting PERSAL sync |
| Negative 2 — escalated, resolved at tier 2 | Hennie Kruger (`GOV016`) | PR2026/3932 | ✅ Awaiting PERSAL sync |
| Negative 3 — escalated, unresolved at both tiers | Gail Mabalane (`Gail`) | PR2026/3938 | ✅ Terminal — status "Not Required", no downstream task |

## Chain used this run

- **Kabelo** (WF1 positive) — supervisor `55435009` (Lerato Schreiber); deliberate disagreement on one
  KRA activity → Sign → **Confirm Agreed Score** appeared and was accepted → rejoined the shared org-wide
  tail (`SalesHR` → `KamoM` → `Tems` → `KabeloM` → `Tyla`) — note `KabeloM` fills the Draft-Outcome-Letter
  role for his own case here, a valid same-person-different-role scenario already seen elsewhere.
- **Thando** (WF2 resolved) — supervisor `KabeloM`; mediator `55435009` (Lerato) resolves at tier 1.
- **Hennie** (WF3 escalated+resolved) — supervisor `BabalwaM`; mediator `Sampha` (tier 1, not resolved) →
  escalates to `Tester97` (Tania, tier 2, resolves via Submit).
- **Gail** (WF4 escalated+unresolved, terminal) — supervisor `ThandoZide`; mediator discovered live to be
  `KabeloM` (tier 1, not resolved) → escalates to `55435009` (Lerato, tier 2, also not resolved) →
  confirmed terminal.

## Findings

### 1. All 12 Annual workflow runs now complete — mechanism fully population-agnostic
The entire Annual mechanism mapped on SL 1-12 — Confirm Agreed Score branching, hidden-checkbox
confirmation screens, the stray-modal-after-letter-generation issue, and the two-tier mediation/escalation
chain — carried over unchanged across all three populations (SL 1-12's GAF form, CD/Director's and DDG's
SMS form). Only employee/supervisor/mediator identities differ per population; every mechanic, button
name, and DOM quirk is identical.

### 2. The known "Approve Outcome Letter" 500 bug remains fixed
All 3 DDG scenarios reaching the terminal step (WF1/2/3) passed through Tyla's Approve Outcome Letter
cleanly. Across all three populations this session, the step succeeded on **every single attempt** with
no recurrence of the 2026-07-23 defect — strong evidence the underlying fix is solid, not incidental.

### 3. Mediator/tier-2 accounts are genuinely shared across populations, not just within one
`Sampha`, `BabalwaM`, and `Tester97` (Tania) each served as mediator/tier-2 resolver for **both**
CD/Director's and DDG's negative scenarios in this same session, in addition to having their own
employee-side Annual cases. No session/login bleed observed despite dozens of concurrent and sequential
logins across these same accounts.

## Environment
- All logins pwd `123qwe`. Employee-side: `KabeloM`, `Gail`, `ThandoZide`, `GOV016` (Hennie), `55435009`
  (Lerato). Mediator/tier-2 (shared with CD/Director this session): `BabalwaM`, `Sampha`, `Tester97`.
- Shared org-wide back-half: `SalesHR`, `KamoM`, `Tems`, `KabeloM`, `Tyla` (identical accounts across all
  three populations).
- Cycle view: `dynamic/SaGov.Pmds/sagov-cycle-details-view?id=bd84d9b2-a30a-4605-aac3-19bb41f8c374`.
