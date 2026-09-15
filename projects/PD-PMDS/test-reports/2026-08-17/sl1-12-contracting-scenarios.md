# Report: PMDS SL 1-12 — Contracting: 2 positive + 3 negative scenarios

**Date:** 2026-08-17
**Plan:** test-plans/contracting/sl1-12-contracting-scenarios.md
**Spec:** test-plans/contracting/sl1-12-contracting-scenarios.spec.ts
**Execution Mode:** playwright-script (headed) — TC-00 through TC-03 via the checked-in spec through the
hub's `scripts/run-plan.js`; the background process was killed by the harness partway through TC-04
(Sanele), so TC-04 was resumed and TC-05 (Adam)/TC-06 were completed via hand-written Node/Playwright
continuation scripts reusing the same shared selector layer, driven live headed.
**Result:** PASSED
**Cases:** TC-00 – TC-06

## Context

Site data had been reset since the 2026-08-13 run: Contracting was confirmed `NOT STARTED` (44/44/0/0)
before this run. Admin opened Contracting (Submission `31/08/2026` / Closing `30/09/2026`, initiate
immediately) → `44 Total / 0 Not Started / 44 In progress`. The same five named employees and scenario
mix as the 2026-08-13 run were reused (Simmy, Tony, Jabu, Sanele, Adam).

## Summary

| Total Steps | Passed | Failed | Skipped |
|-------------|--------|--------|---------|
| 7 | 7 | 0 | 0 |

**Cycle:** SL 1-12 Performance Agreement, FY2026/27 — Contracting stage (cycle id
`7cf9054b-8c69-4313-ae5c-8039bf495c04`, 44 employees)

| Scenario | Employee | Ref | Outcome |
|---|---|---|---|
| Positive 1 | Simmy Mthalane | not captured this run | ✅ Generate PERSAL Input |
| Positive 2 | Tony Dayimane | not captured this run | ✅ Generate PERSAL Input |
| Negative 1 — resolved dispute | Jabu Hadebe | not captured this run | ✅ Generate PERSAL Input |
| Negative 2 — escalated, resolved at tier 2 | Sanele Sithole | PA2026/7013 | ✅ Generate PERSAL Input |
| Negative 3 — escalated, unresolved at both tiers | Adam Apple | PA2026/6957 | ✅ Terminal — *Under appeal / Dispute Unresolved*, no downstream task |

## Step Results

### TC-00 — Contracting is opened for the full population
**Mode:** playwright-script · **Duration:** 27.9s
- [PASS] Admin opened Contracting ahead of this run; TC-00 re-verified `IN PROGRESS`, `0 Not Started`,
  `44 = In progress + Completed`.

### TC-01 — Positive 1: Simmy Mthalane
**Mode:** playwright-script · **Duration:** 5.2m
- [PASS] Draft/Submit → `LungileN` Sign → `SalesHR` Verify — HR inbox cleared.

### TC-02 — Positive 2: Tony Dayimane
**Mode:** playwright-script · **Duration:** 5.1m
- [PASS] Same chain as TC-01, first-click throughout.

### TC-03 — Negative 1: Jabu Hadebe, resolved dispute
**Mode:** playwright-script · **Duration:** 9.8m
- [PASS] Draft/Submit → `LungileN` Refer for Dispute → `BabalwaM` mediator resolved → `JabuH` Update
  with Outcomes → `LungileN` Review Updated → `SalesHR` Verify.

### TC-04 — Negative 2: Sanele Sithole, escalated dispute resolved at tier 2
**Mode:** playwright-script, then hand-written continuation · **Duration:** ~9m across two runs
- The background process running the full plan was killed by the harness partway through this test —
  the driving Node process died without warning or logged error while TC-04 was in flight. Live
  re-check found the mediator + tier-2 + employee-update steps had already been actioned server-side and
  the PA was parked cleanly at `LungileN`'s **Review Updated Performance Agreement with Outcomes** task
  — nothing corrupted, so the scenario resumed from that exact point rather than restarting.
- [PASS] `BabalwaM` selected *"has not been resolved"*; Comments + Attachments filled with
  `test-data/mediation-outcome.txt`; Submit first click.
- [PASS] `Sampha` (tier-2, Babalwa's own supervisor) held the escalated **Mediator Supervisor Review**
  task for Sanele — selected *"has been resolved"* — **Approve**.
- [PASS] `SaneleS` — Update with Outcomes — Submit.
- [PASS] `LungileN` — Review Updated — Approve (resumed).
- [PASS] `SalesHR` — Verify — HR inbox cleared (resumed).

### TC-05 — Negative 3: Adam Apple, escalated dispute unresolved at both tiers
**Mode:** hand-written continuation script · **Duration:** ~8m across two attempts
- First attempt was killed by the same background-process issue while Adam's draft was still being
  filled — live re-check found Adam's task still sitting unsubmitted at his own **Initiate Performance
  Agreement** step, so the scenario was simply re-run from the start (nothing had been committed
  server-side yet).
- [PASS] Draft → Submit → `LungileN` Refer for Dispute → `BabalwaM` *"has not been resolved"* +
  comment/attachment → `Sampha` (tier 2) *"has not been resolved"* + comment/attachment → **Approve**.
- [PASS] Checked `adam`, `LungileN`, `SalesHR` inboxes for a task mentioning Adam — **none found in
  any of them** (BLOCKING assertion held).

### TC-06 — Final recount
**Mode:** hand-written continuation script · **Duration:** ~1m
- [PASS] `44 Total · 0 Not Started · 39 In progress · 5 Completed` — matches all 5 driven scenarios,
  including Adam's terminal *Dispute Unresolved*.

## Findings

### Background-process kills mid-chain, twice, did not corrupt workflow state
Two separate scenarios (TC-04 Sanele, TC-05 Adam) were interrupted by the driving Node/Playwright
process being killed by something outside the app — no timeout, no error logged, and the two kills hit
different points in their respective chains (one after several steps had already committed
server-side, one before the first Submit). In both cases the live workflow state matched exactly what
the last completed HTTP action implied — never partial, never duplicated. This reproduces the identical
finding from the 2026-08-13 run of this same plan; see that report's Findings section. Splitting the
continuation work into one-scenario-per-invocation scripts kept the lost work per kill to a few minutes.

### Confirms prior findings, reproduced on fresh data
Tier-2 escalation, the Approve-vs-Submit split between mediator and tier-2 screens, and the Completed
tile counting the Dispute-Unresolved terminal all reproduced identically to the 2026-08-13 run — not
re-litigated here since nothing new was observed.

## Environment

- Admin `admin`/`P@ssw0rd`. Employees `Simmy`, `TonyD`, `JabuH`, `SaneleS`, `adam` — all `123qwe`.
- Supervisor `LungileN`; mediator `BabalwaM`; tier-2 escalation `Sampha`; HR `SalesHR` — all `123qwe`.
- Mediation evidence fixture: `test-data/mediation-outcome.txt`.
- Cycle view: `dynamic/SaGov.Pmds/sagov-cycle-details-view?id=7cf9054b-8c69-4313-ae5c-8039bf495c04`.
- Refs: PA2026/7013 Sanele · PA2026/6957 Adam. Simmy/Tony/Jabu refs were not captured in this run's
  console output (the checked-in spec's Playwright reporter did not surface per-test console.log lines).
