# PMDS DDG Performance Agreement — Contracting rerun, all 4 workflows completed

**Date:** 2026-08-13
**Cycle:** **Deputy Director General Performance Agreement**, FY2026/27 — **Contracting** stage
(cycle id `bd84d9b2-a30a-4605-aac3-19bb41f8c374`, 6 employees)
**App:** HCM Admin Portal (PMDS module) — https://pd-hcm-adminportal-qa.shesha.app/ (QA)
**Execution Mode:** hand-written Node/Playwright driver (`.tmp-ddg-full.js`, extending `pmds.ts`'s
selector layer), one scenario per invocation, driven live headed.
**Refs:** PA2026/6911 (Kabelo Mabalane) · PA2026/6907 (Gail Mabalane) · PA2026/6909 (Thando Zide) ·
PA2026/6901 (Hennie Kruger)
**Result:** PASSED — Contracting opened (6/6 initiated), all 4 assigned workflows completed end-to-end
to Generate PERSAL Input

## Context

Rerun of the 2026-08-11 DDG cycle after the test lead cleared the site data, using the same four
employees and the same scenario assignments (2 positive, 2 negative) as that run. Driven headed
immediately after the SL 1-12 and CD/Director reruns on the same date, against the same freshly-reset
population (6 Total / 6 Not Started / 0 In progress / 0 Completed confirmed live before opening).

## Steps executed (live, headed)

1. **Admin — Open Contracting process.** Submission **31/08/2026** / Closing **30/09/2026**, initiate
   immediately → **6 Total / 0 Not Started / 6 In progress**.
2. **Kabelo Mabalane — Draft & Submit** (PA2026/6911). Default Supervisor read as **Lerato SCHREIBER**;
   Default Mediator read as **"Position"** (not blank this time — unlike 2026-08-11, where it was blank
   and needed an Alternative Mediator assignment to unblock Confirm Details). Draft/Submit proceeded
   without the workaround → **Lerato SCHREIBER (`55435009`) Sign** → **SalesHR Verify** → **Generate
   PERSAL Input**. ✅
3. **Gail Mabalane — Draft & Submit** (PA2026/6907) → **Thando Zide Sign** → **SalesHR Verify** →
   **Generate PERSAL Input**. ✅
4. **Thando Zide — negative 1, resolved dispute** (PA2026/6909). Draft → **Kabelo Mabalane Refer for
   Dispute** → **Lerato SCHREIBER mediator "resolved"** + comment → **Thando Update with Outcomes** →
   **Kabelo Review Updated** → **SalesHR Verify** → **Generate PERSAL Input**. ✅
5. **Hennie Kruger — negative 2, escalated dispute** (PA2026/6901). Draft → **Babalwa M Refer for
   Dispute** → **Sampha Sampha mediator "not resolved"** (Comments + Attachments) → escalated to
   **Tania Smith (`Tester97`)** as *Mediator Supervisor Review* → **"resolved"** → **Approve** →
   **Hennie Update with Outcomes** → **Babalwa M Review Updated** → **SalesHR Verify** → **Generate
   PERSAL Input**. ✅

## Final cycle state

Contracting card: `6 Total · 0 Not Started · 2 In progress · **4 Completed**` — matching the four
genuine completions (Kabelo, Gail, Thando, Hennie), all at **Generate PERSAL Input**.

## Findings

### Kabelo's blank-mediator defect did not reproduce on this population
The 2026-08-11 run documented a defect where Kabelo's default mediator was blank, silently blocking
Confirm Details until an Alternative Mediator was assigned (`bugs/2026-08-11-ddg-silent-validation-blocks-draft-wizard.md`,
defect 1). On this rerun, against the newly-seeded population, his Default Mediator read as
**"Position"** rather than blank, and the draft proceeded past Confirm Details without needing the
workaround. This looks like the underlying data condition (a position with no mediator configured)
rather than the application logic — worth flagging to the test lead as a data-seeding difference
between populations rather than treating it as a fix, since the other two silent-validation defects in
that same bug report (PDP pre-seeded row, mandatory user-added PDP) were not re-tested for regression
on this run.

### Everything else matches the 2026-08-11 run
Tier-2 escalation via Tania Smith with an **Approve** gate, the shared SMS Core Management Criteria
form, and `SalesHR` as the single HR verifier for this cycle (no split verifier as seen on CD/D) all
reproduced identically — not re-litigated here since nothing new was observed on those fronts.

## Environment

- All DDG logins use password `123qwe`. Hennie Kruger = `GOV016`; Lerato SCHREIBER = `55435009`.
- HR verification: `SalesHR` for all four employees.
- Cycle view: `dynamic/SaGov.Pmds/sagov-cycle-details-view?id=bd84d9b2-a30a-4605-aac3-19bb41f8c374`.
