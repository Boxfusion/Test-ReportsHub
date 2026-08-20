# PMDS DDG — Mid-Year Assessment: 1 positive + 3 negative scenarios

**Date:** 2026-08-14
**Cycle:** Deputy Director General Performance Agreement, FY2026/27 — **Mid Year Assessment**
(cycle id `bd84d9b2-a30a-4605-aac3-19bb41f8c374`, 6 employees)
**App:** HCM Admin Portal (PMDS module) — https://pd-hcm-adminportal-qa.shesha.app/ (QA)
**Refs:** PR2026/7636 (Kabelo Mabalane) · PR2026/7634 (Thando Zide) · PR2026/7626 (Hennie Kruger) ·
PR2026/7632 (Gail Mabalane)
**Result:** PASSED — all 4 scenarios completed to their expected end states

## Context

Last of the three cycles run this session. Scenario mix requested: 1 positive + negative 1/2/3,
reusing the four employees from the 2026-08-13 Contracting rerun. Since Contracting only exercised
2 positive + negative 1/2 for this cohort, Gail — previously the second positive — was repurposed as
the neg-3/terminal case, per the same instruction applied to CD/Director's Babalwa.

| Scenario | Employee | Ref | Outcome |
|---|---|---|---|
| Positive | Kabelo Mabalane | PR2026/7636 | ✅ Awaiting PERSAL sync |
| Negative 1 — resolved dispute | Thando Zide | PR2026/7634 | ✅ Awaiting PERSAL sync |
| Negative 2 — escalated, resolved at tier 2 | Hennie Kruger | PR2026/7626 | ✅ Awaiting PERSAL sync |
| Negative 3 — escalated, unresolved at both tiers | Gail Mabalane | PR2026/7632 | ✅ Terminal — no downstream task |

## Steps executed (live, headed)

1. **Kabelo — positive.** Self-assessment (SMS form) → **Lerato SCHREIBER (`55435009`)** supervisor
   sign → **SalesHR** Verify. Unlike the 2026-08-11 Contracting run, no blank-default-mediator quirk
   was hit on this Mid-Year self-assessment — that issue was specific to the Contracting draft
   wizard's Confirm Details step, which Mid-Year's self-assessment form does not have.
2. **Thando — negative 1, resolved dispute.** **KabeloM** (Thando's supervisor) refers for dispute →
   **Lerato SCHREIBER** mediator resolves "has been resolved" → **Thando** Update with Outcomes →
   **KabeloM** Review Updated → **SalesHR** Verify.
3. **Hennie — negative 2, escalated dispute resolved at tier 2.** **BabalwaM** (Hennie's supervisor)
   refers for dispute → **Sampha** mediator selects "has not been resolved" → escalated to **Tania
   (`Tester97`)** (tier 2) who resolves "has been resolved" via Submit → **Hennie** Update with
   Outcomes → **BabalwaM** Review Updated → **SalesHR** Verify.
4. **Gail — negative 3, terminal.** **ThandoZide** (Gail's supervisor) refers for dispute →
   **KabeloM** mediator selects "has not been resolved" → escalated to **Lerato SCHREIBER**
   (tier 2, Kabelo's supervisor) who also selects "has not been resolved" → confirmed terminal: no
   task for Gail in her own, ThandoZide's, `SalesHR`'s, or `MaletshaN`'s inbox.

## Findings

### DDG's Contracting-stage blank-mediator defect did not reproduce on Mid-Year
The 2026-08-11 Contracting report documented a defect where Kabelo's default mediator was blank,
silently blocking the draft wizard's Confirm Details step. Mid-Year's self-assessment form has no
Confirm Details step at all (it goes straight to Key Result Areas), so the defect's specific trigger
condition doesn't exist here. Not a fix — a different form without that step.

### Every other structural finding matches SL1-12 and CD/Director
Tier-2 escalation via Submit, the SMS form's internally-consistent all-3s scoring (100/100/100), and
`SalesHR` as the sole HR verifier for this cycle (no split verifier, consistent with DDG Contracting)
all reproduced identically — not re-litigated here since nothing new was observed.

## Final state across all three cycles (this session's Mid-Year work)

| Cycle | Scenarios run | Final tile |
|---|---|---|
| SL 1-12 | Simmy (pos), Jabu (neg1), Sanele (neg2), Adam (neg3) | 44 Total · 1 Not Started · 40 In progress · **3 Completed** |
| CD/Director | Tania (pos), Sampha (neg1), Kavitha (neg2), Babalwa (neg3) | 11 Total · 1 Not Started · 7 In progress · **3 Completed** |
| DDG | Kabelo (pos), Thando (neg1), Hennie (neg2), Gail (neg3) | 6 Total · 1 Not Started · 2 In progress · **3 Completed** |

In each cycle, the terminal (fully-unresolved) case lands in the "Not Started" bucket rather than
counting toward Completed — consistent with the pre-existing finding that Mid-Year's tile logic
(unlike Contracting's) excludes the Dispute-Unresolved terminal from the Completed count.

## Environment

- All DDG logins use password `123qwe`. Hennie Kruger = `GOV016`; Lerato SCHREIBER = `55435009`.
- HR verification: `SalesHR` for all four employees.
- Cycle view: `dynamic/SaGov.Pmds/sagov-cycle-details-view?id=bd84d9b2-a30a-4605-aac3-19bb41f8c374`.
