# PMDS DDG Performance Agreement — Contracting, all 4 workflows completed

**Date:** 2026-08-17
**Cycle:** **Deputy Director General Performance Agreement**, FY2026/27 — **Contracting** stage
(cycle id `bd84d9b2-a30a-4605-aac3-19bb41f8c374`, 6 employees)
**App:** HCM Admin Portal (PMDS module) — https://pd-hcm-adminportal-qa.shesha.app/ (QA)
**Execution Mode:** hand-written Node/Playwright driver (`.tmp-ddg-positive.js`, `.tmp-ddg-neg1-thando.js`,
`.tmp-ddg-neg2-hennie.js`, extending the project's shared selector layer), one scenario per invocation,
driven live headed.
**Refs:** PA2026/7059 (Kabelo Mabalane) · PA2026/7055 (Gail Mabalane) · PA2026/7057 (Thando Zide) ·
PA2026/7049 (Hennie Kruger)
**Result:** PASSED — Contracting opened fresh (6/6 initiated), all 4 assigned workflows completed
end-to-end to Generate PERSAL Input

## Context

Site data had been reset since 2026-08-13: the cycle was confirmed `NOT STARTED` (6/6/0/0) before
opening. Admin opened Contracting (Submission `31/08/2026` / Closing `30/09/2026`, initiate immediately)
→ `6/0/6/0`. The same four named employees and scenario mix (2 positive, 2 negative) as the prior runs
were reused.

## Steps executed (live, headed)

1. **Admin — Open Contracting process.** `6 Total / 0 Not Started / 6 In progress` after opening.
2. **Kabelo Mabalane — Draft & Submit** (PA2026/7059). On **Confirm Details**, Default Mediator was
   **blank again** (Kabelo's supervisor is top-of-line) — reproduced the known 2026-08-11
   silent-validation observation (`observations/2026-08-11-ddg-draft-wizard-feedback.md`, Blocker 1).
   Applied the documented workaround: assigned **Alternative Mediator = Babalwa M** + a reason, which
   unblocked Next immediately. Draft continued → **Lerato SCHREIBER (`55435009`) Sign** → **SalesHR
   Verify** → **Generate PERSAL Input**. ✅
3. **Gail Mabalane — Draft & Submit** (PA2026/7055) → **Thando Zide Sign** → **SalesHR Verify** →
   **Generate PERSAL Input**. ✅ (Default Mediator was populated for Gail — no workaround needed.)
4. **Thando Zide — negative 1, resolved dispute** (PA2026/7057). Draft → **Kabelo Mabalane Refer for
   Dispute** → **Lerato SCHREIBER mediator "resolved"** + comment → **Thando Update with Outcomes** →
   **Kabelo Review Updated** → **SalesHR Verify** → **Generate PERSAL Input**. ✅
5. **Hennie Kruger — negative 2, escalated dispute** (PA2026/7049). Draft → **Babalwa M Refer for
   Dispute** → **Sampha Sampha mediator "not resolved"** (Comments + Attachments) → escalated to
   **Tania Smith (`Tester97`)** as *Mediator Supervisor Review* → **"resolved"** → **Approve** →
   **Hennie Update with Outcomes** → **Babalwa M Review Updated** → **SalesHR Verify** → **Generate
   PERSAL Input**. ✅

## Final cycle state

Contracting card: `6 Total · 0 Not Started · 2 In progress · **4 Completed**` — matching the four
genuine completions (Kabelo, Gail, Thando, Hennie), all at **Generate PERSAL Input**.

## Findings

### Kabelo's blank-mediator silent-validation issue reproduced again — confirmed by-design, workaround still effective
Unlike the 2026-08-13 rerun (where the underlying data condition happened not to reproduce), this run
hit the same blank-Default-Mediator condition on Kabelo documented on 2026-08-11 and downgraded from a
defect to an observation (the wizard gives no on-screen feedback that an Alternative Mediator is
required). Assigning **Babalwa M** as Alternative Mediator + a reason unblocked Next immediately, exactly
as the observation's workaround describes. No new defect — confirms the by-design behaviour and its
documented workaround both still hold; the absent on-screen feedback remains the only open point (per
the observation, a question for the test lead, not a defect claim).

### Everything else matches prior runs
Tier-2 escalation via Tania Smith with an **Approve** gate, the shared SMS Core Management Criteria
form, and `SalesHR` as the single HR verifier for this cycle (no split verifier as seen on CD/D) all
reproduced identically — not re-litigated here since nothing new was observed on those fronts.

## Environment

- All DDG logins use password `123qwe`. Hennie Kruger = `GOV016`; Lerato SCHREIBER = `55435009`.
- HR verification: `SalesHR` for all four employees.
- Cycle view: `dynamic/SaGov.Pmds/sagov-cycle-details-view?id=bd84d9b2-a30a-4605-aac3-19bb41f8c374`.
