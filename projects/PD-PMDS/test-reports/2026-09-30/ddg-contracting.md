# PMDS DDG Performance Agreement — Contracting, 2 positive + 2 negative

**Date:** 2026-09-30
**Cycle:** Deputy Director General Performance Agreement, FY2026/27 — **Contracting** stage
**App:** HCM Admin Portal (PMDS module) — https://pd-hcm-adminportal-qa.shesha.app/ (QA)
**Execution Mode:** hybrid
**Refs:** PA2026/8472 (Kabelo Mabalane) · PA2026/8468 (Gail Mabalane) · PA2026/8470 (Thando Zide) · PA2026/8460 (Hennie Kruger)
**Result:** PASSED — all 4 workflows completed end-to-end to Generate PERSAL Input

## Context

Contracting was **NOT STARTED** (7 / 7 / 0 / 0) after a site data reset; admin opened it live (Submission
30/09/2026, Closing 31/10/2026, initiate immediately) → `7 Total / 0 Not Started / 7 In progress`. HR verifier
for this run, as specified by the test lead: **`NaleliM`** (`123qwe`). Driven live, **headed**.

| Employee | Login | Workflow | Status reached |
|---|---|---|---|
| Kabelo Mabalane | `KabeloM` | Positive 1 — Lerato SCHREIBER (`55435009`) Sign → NaleliM Verify | **Generate PERSAL Input** ✅ |
| Gail Mabalane | `Gail` | Positive 2 — Thando Zide Sign → NaleliM Verify | **Generate PERSAL Input** ✅ |
| Thando Zide | `ThandoZide` | Negative 1 — Kabelo Refer → Lerato SCHREIBER resolved → Update → Kabelo Review Updated → NaleliM Verify | **Generate PERSAL Input** ✅ |
| Hennie Kruger | `GOV016` | Negative 2 — Babalwa Refer → Sampha not resolved (comment + attachment) → Tania Smith tier-2 resolved → Update → Babalwa Review Updated → NaleliM Verify | **Generate PERSAL Input** ✅ (resumed after memory kill) |

## Final cycle state
`7 Total · 0 Not Started · 3 In progress · 4 Completed`, matching the four completions.

## Observations
- All four HR-verify tasks landed directly in NaleliM's inbox; no ownerless-task recurrence on DDG.
- Kabelo's Default Mediator was populated (the blank-mediator condition did not reproduce).
- Hennie's run was interrupted by a host out-of-memory kill during Update with Outcomes; resuming from the
  inbox found the task still pending and the chain completed normally. Environment interruption, not a defect.
