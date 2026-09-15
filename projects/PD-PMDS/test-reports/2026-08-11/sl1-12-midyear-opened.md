# PMDS SL 1-12 — Contracting closed, Mid-Year Assessment opened (43/43 initiated)

**Date:** 2026-08-11
**Cycle:** SL 1-12 Performance Agreement, FY2026/27 — **Contracting → Mid Year Assessment**
**App:** HCM Admin Portal (PMDS module) — https://pd-hcm-adminportal-qa.shesha.app/ (QA)
**Result:** PASSED — Contracting closed cleanly with all 43 completions preserved; Mid-Year opened and initiated 43/43. No assessments driven yet.

## Context

Run after the team confirmed PERSAL input was generated. The whole SL 1-12 population had reached
**43/43 Completed** on Contracting (up from the 8 completed at the point of this morning's run — the
team finished the remaining 35), so closing Contracting excluded nobody.

## Steps executed (live, headed)

1. **Checked Contracting state first.** `43 Total · 0 Not Started · 0 In progress · 43 Completed` —
   confirmed nothing was mid-flight that closing would strand.
2. **Closed Contracting.** Admin → Manage Process → **Close process** → confirm dialog
   *"Are you sure that you want to close the Process?"* → **Yes**. Contracting → **COMPLETED**, and
   **all 43 completions were preserved** (no reset).
3. **Gating re-confirmed.** Only after the close did the Mid Year Assessment card expose its
   **Open process** button. Contracting simultaneously gained **Re-open process** and **Re-Open Process
   per location** — both deliberately avoided (re-opening a stage has historically reset completed
   employees, bug `2026-07-16-reopen-process-resets-completed-status.md`). The correct Mid-Year button
   was identified by walking each button up to its owning card before clicking, not by text match —
   "Re-open process" contains the substring "open process" and a naive selector hits the wrong card.
4. **Opened Mid-Year.** Submission Date to HR **2026-08-31**, Closing Date **2026-09-30**, initiate
   **immediately**. Settled at **43 Total · 0 Not Started · 43 In progress · 0 Completed**.
5. **Verified initiation.** All seven of our tracked employees show Mid Year Assessment status **Draft**:
   Simmy, Jabu, Adam, Sanele, Lungile, Tony and Thato.

## Observation — Thato's Contracting status changed since this morning

This morning Thato Mali (PA2026/6557) terminated at **"Dispute Unresolved"**, and that was the evidence
for the Completed-tile over-count bug. His Contracting status now reads **Completed**, and Mid-Year
initiated for him along with everyone else.

The team evidently resolved or re-drove his agreement between the two runs. This does not invalidate the
morning's observation — it was verified live at the time (tile 8 vs 7 genuine completions) and matches an
independent 2026-07-23 sighting — but it does mean **the discrepancy is no longer reproducible from the
current data set**. The bug file has been annotated so whoever retests knows to drive a fresh
both-levels-unresolved agreement rather than looking for Thato.

It also means the usual signal — that a Dispute-Unresolved Contracting PA does *not* generate a Mid-Year
task — could not be re-tested this run, since no such terminal remained in the population.

## State at pause

Mid-Year is open with **43 self-assessments waiting at Draft**. No assessment steps have been driven yet;
the scenario spread (which employees get happy path vs the dispute variants) has not been decided.

## Environment

- Employee default password `123qwe`. Mid-Year HR verification historically routes to **`GOV005`**
  (Andrew) / **`EMP001234`** (Sarah) rather than `SalesHR` — to be confirmed on the first run.
