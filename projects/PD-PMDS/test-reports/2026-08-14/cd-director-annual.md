# PMDS Chief Director/Director — Annual Assessment: 1 positive + 3 negative scenarios

**Date:** 2026-08-14
**Cycle:** Chief Director/Director Performance Agreement, FY2026/27 — **Annual Assessment**
(cycle id `5f250b11-b86c-4b5e-b239-a9246fc525d3`, 11 employees)
**App:** HCM Admin Portal (PMDS module) — https://pd-hcm-adminportal-qa.shesha.app/ (QA)
**Refs:** PR2026/3946 (Tania Smith) · PR2026/3954 (Sampha Sampha) · PR2026/3950 (Kavitha Naidoo) ·
PR2026/3948 (Babalwa M)
**Result:** PASSED — all 4 scenarios completed to their expected end states. **No blocking defects.**

## Context

Second Annual cycle run the same day, immediately after the SL 1-12 full suite. This exercised the
**SMS variant** of the Annual self-assessment/supervisor-rating forms for the first time (Core Management
Competencies rather than Generic Assessment Factors) — otherwise the entire mechanism discovered on
SL 1-12 (Confirm Agreed Score branch, hidden-checkbox confirmation screens, Outcome Letter sub-flow,
two-tier mediation) proved **fully population-agnostic**, carrying over unchanged.

Reused the four employees from the 2026-08-14 CD/Director Mid-Year run, whose supervisor/mediator chain
carries heavy role overlap: Sampha and Babalwa M each appear as an employee in their own case **and** as
a supervisor/mediator in someone else's, across the four scenarios below.

| Scenario | Employee | Ref | Outcome |
|---|---|---|---|
| Positive | Tania Smith (`Tester97`) | PR2026/3946 | ✅ Awaiting PERSAL sync |
| Negative 1 — resolved dispute | Sampha Sampha (`Sampha`) | PR2026/3954 | ✅ Awaiting PERSAL sync |
| Negative 2 — escalated, resolved at tier 2 | Kavitha Naidoo (`Gov012`) | PR2026/3950 | ✅ Awaiting PERSAL sync |
| Negative 3 — escalated, unresolved at both tiers | Babalwa M (`BabalwaM`) | PR2026/3948 | ✅ Terminal — status "Not Required", no downstream task |

## Chain used this run

- **Tania** (WF1 positive) — supervisor `ThandoZide`; deliberate disagreement on one KRA activity
  (Supervisor 4 vs Own 3) → Sign → **Confirm Agreed Score** appeared and was accepted → rejoined the
  shared org-wide tail (`SalesHR` → `KamoM` → `Tems` → `KabeloM` → `Tyla`).
- **Sampha** (WF2 resolved) — supervisor `Tester97` (Tania); mediator `ThandoZide` resolves at tier 1.
- **Kavitha** (WF3 escalated+resolved) — supervisor `GOV022` (Naledi Khumalo); mediator `BabalwaM` (tier
  1, not resolved) → escalates to `Sampha` (tier 2, resolves via Submit).
- **Babalwa** (WF4 escalated+unresolved, terminal) — supervisor `Sampha`; mediator `Tester97` (Tania,
  tier 1, not resolved) → escalates to `ThandoZide` (tier 2, also not resolved) → confirmed terminal.

Every one of the above employee/supervisor/mediator accounts is a **shared global login** already used
in a different role somewhere else in this same run (e.g. `Sampha` is both WF2's employee and WF3's tier-2
resolver; `BabalwaM` is both WF4's employee and WF3's tier-1 mediator). No cross-contamination observed —
each script's inbox lookup correctly scoped to the specific PR/task text rather than just the login.

## Findings

### 1. Annual's back-half approver roles are shared org-wide, not population-specific
Unlike Mid-Year/Contracting (where HR-verify routing differed per population — `MaletshaN` for this
cycle's Tania vs `SalesHR` elsewhere), **Annual's Confirm Assessment / Sign Assessment / Approve
Assessment / Draft Outcome Letter / Approve Outcome Letter steps all route to the same shared accounts
(`SalesHR`/`KamoM`/`Tems`/`KabeloM`/`Tyla`) regardless of population.** Confirmed by checking `MaletshaN`'s
inbox first (empty) before finding Tania's Confirm Assessment task sitting with `SalesHR` instead.

### 2. The known "Approve Outcome Letter" 500 bug remains fixed
All 4 CD/Director scenarios that reach the terminal approval step (WF1/2/3) passed through Tyla's Approve
Outcome Letter cleanly — no recurrence of the 2026-07-23 defect.

### 3. Same hidden-checkbox and stray-modal patterns as SL 1-12, unchanged
The Confirm/Sign/Approve Assessment checkbox-as-DOM-sibling pattern and the Draft-Outcome-Letter
stray-modal-before-Submit issue reproduced identically on the SMS form family — same fix, no new
adaptation needed.

## Environment
- All logins pwd `123qwe`. Employee-side: `Tester97` (Tania Smith), `Sampha`, `Gov012` (Kavitha Naidoo),
  `BabalwaM`. Supervisor/mediator: `ThandoZide`, `GOV022` (Naledi Khumalo), `Tester97`, `Sampha`.
- Shared org-wide back-half: `SalesHR`, `KamoM`, `Tems`, `KabeloM`, `Tyla` (identical accounts to SL 1-12).
- Cycle view: `dynamic/SaGov.Pmds/sagov-cycle-details-view?id=5f250b11-b86c-4b5e-b239-a9246fc525d3`.
