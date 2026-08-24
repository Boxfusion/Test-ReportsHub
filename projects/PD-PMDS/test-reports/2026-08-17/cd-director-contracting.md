# PMDS Chief Director/Director Performance Agreement — Contracting, all 4 workflows completed

**Date:** 2026-08-17
**Cycle:** **Chief Director/Director Performance Agreement**, FY2026/27 — **Contracting** stage
(cycle id `5f250b11-b86c-4b5e-b239-a9246fc525d3`, 11 employees)
**App:** HCM Admin Portal (PMDS module) — https://pd-hcm-adminportal-qa.shesha.app/ (QA)
**Execution Mode:** hand-written Node/Playwright driver (`.tmp-cdd-positive.js`, `.tmp-cdd-neg1-sampha.js`,
`.tmp-cdd-neg2-kavitha.js`, extending the project's `pmds.ts`/`.tmp-pmds-lib.js` selector layer), one
scenario per invocation, driven live headed.
**Refs:** PA2026/7029 (Tania Smith) · PA2026/7031 (Babalwa M) · PA2026/7037 (Sampha Sampha) ·
PA2026/7033 (Kavitha Naidoo)
**Result:** PASSED — Contracting opened fresh (11/11 initiated), all 4 assigned workflows completed
end-to-end to Generate PERSAL Input

## Context

The site data had been reset since the last recorded run (2026-08-13): the cycle was confirmed live at
`0/11/0/0` (Not Started/In progress/Completed) before opening. Admin opened Contracting (Submission
`31/08/2026` / Closing `30/09/2026`, initiate immediately) → `11/0/11/0`. The same four named employees
and scenario mix (2 positive, 2 negative) as the prior 2026-08-11/2026-08-13 runs were reused.

Two of the four scenarios (Positive 1 and Negative 1) completed first-attempt, uninterrupted. The other
two (Positive 2 completed cleanly; Negative 2 — Kavitha) were interrupted mid-chain by a background
process kill unrelated to the app (see Findings) and resumed live from the exact point of interruption.

## Scenarios and steps executed (live, headed)

1. **Positive 1 — Tania Smith** (PA2026/7029). Draft → Submit → **Thando Zide (`ThandoZide`) Sign** →
   **Maletsha Nkepana (`MaletshaN`) Verify** → **Generate PERSAL Input**. ✅ (Tania's Chief Directorate
   is blank, routing HR verification to `MaletshaN` rather than `SalesHR` — consistent with prior runs.)
2. **Positive 2 — Babalwa M** (PA2026/7031). Draft → Submit → **Sampha Sampha (`Sampha`) Sign** →
   **SalesHR Verify** → **Generate PERSAL Input**. ✅
3. **Negative 1 — Sampha Sampha, resolved dispute** (PA2026/7037). Draft → **Tania Smith (`Tester97`)
   Refer for Dispute** → **Thando Zide mediator "resolved"** + comment → **Sampha Update with
   Outcomes** → **Tania Review Updated** → **SalesHR Verify** → **Generate PERSAL Input**. ✅
4. **Negative 2 — Kavitha Naidoo, escalated dispute** (PA2026/7033). Draft → **Naledi (`GOV022`) Refer
   for Dispute** → **Babalwa M mediator "not resolved"** (Comments + Attachments) → escalated to
   **Sampha Sampha** as *Mediator Supervisor Review* → **"resolved"** → **Approve** → **Kavitha Update
   with Outcomes** → **Naledi Review Updated** → **SalesHR Verify — task found directly in her inbox,
   no reassignment needed** → **Generate PERSAL Input**. ✅

## Final cycle state

Contracting card: `11 Total · 0 Not Started · 7 In progress · **4 Completed**` — matching the four
genuine completions (Tania, Babalwa, Sampha, Kavitha), all at **Generate PERSAL Input**.

## Findings

### Background-process kills mid-chain did not corrupt workflow state (reproduces 2026-08-13 finding)
Kavitha's scenario was interrupted twice by the driving Node process being killed by something outside
the app (not a timeout, no error logged) — once immediately after Naledi's Refer-for-Dispute action,
once again after Naledi's Review-Updated-with-Outcomes action. Both times, live inbox/state checks
showed the workflow had either advanced cleanly past the point of interruption or was parked, unactioned,
exactly where the script left off — never corrupted or duplicated. Both interruptions were resolved by
resuming from the live state rather than restarting the scenario, consistent with the same finding
recorded on 2026-08-13 (see that date's `sl1-12-contracting-scenarios.md`).

### Kavitha's HR-verify assignee gap remains fixed
As on 2026-08-13, Kavitha's HR-verify task appeared directly in `SalesHR`'s inbox with no manual
reassignment needed — the 2026-08-11 ownerless-step defect has not regressed on this fresh population.

### Everything else matches prior runs
HR-verifier split (`SalesHR` vs `MaletshaN`), tier-2 escalation via Sampha with an **Approve** gate, and
the SMS Core Management Criteria form shared with DDG all reproduced identically — not re-litigated here.

## Environment

- All CD/D logins use password `123qwe`. Tania Smith = `Tester97`; Thando Zide (CD/D mediator) =
  `ThandoZide`; Kavitha Naidoo = `Gov012`; Naledi weeeee Khumalo = `GOV022`.
- HR verification: `SalesHR` for Babalwa, Sampha, and Kavitha; `MaletshaN` for Tania.
- Cycle view: `dynamic/SaGov.Pmds/sagov-cycle-details-view?id=5f250b11-b86c-4b5e-b239-a9246fc525d3`.
