# Report: PMDS SL 1-12 — Contracting: 2 positive + 3 negative scenarios

**Date:** 2026-08-13 (rerun, ~18:52–20:50 UTC)
**Plan:** test-plans/contracting/sl1-12-contracting-scenarios.md
**Spec:** test-plans/contracting/sl1-12-contracting-scenarios.spec.ts
**Execution Mode:** playwright-script (headed) — TC-00 through TC-03 via the checked-in spec through the
hub's `scripts/run-plan.js`; the background process was killed by the harness partway through TC-04, so
TC-04 was resumed and TC-05/TC-06 completed via a hand-written Node/Playwright continuation script
(`.tmp-sl12-resume.js`) reusing the same `pmds.ts` selector layer, driven live headed.
**Result:** PASSED
**Cases:** TC-00 – TC-06

## Context

This supersedes the earlier same-day run recorded at 14:40 UTC. The test lead cleared the site data after
that run so the same five employees could be driven through Contracting again from a fresh population
(44 Total / 44 Not Started / 0 In progress / 0 Completed, confirmed live before opening the process).
PA reference numbers differ from the 14:40 UTC run since new agreements were created against the reset
population.

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
| Negative 2 — escalated, resolved at tier 2 | Sanele Sithole | PA2026/6887 | ✅ Generate PERSAL Input |
| Negative 3 — escalated, unresolved at both tiers | Adam Apple | PA2026/6831 | ✅ Terminal — *Under appeal / Dispute Unresolved*, no downstream task |

## Step Results

### TC-00 — Contracting is opened for the full population
**Mode:** playwright-script · **Duration:** 31.5s
- [PASS] Admin opened Contracting (Submission `31/08/2026` / Closing `30/09/2026`, initiate
  immediately) ahead of this run; TC-00 re-verified `IN PROGRESS`, `0 Not Started`, `44 = In progress + Completed`.

### TC-01 — Positive 1: Simmy Mthalane
**Mode:** playwright-script · **Duration:** 5.6m
- [PASS] Draft/Submit → `LungileN` Sign → `SalesHR` Verify — HR inbox cleared.

### TC-02 — Positive 2: Tony Dayimane
**Mode:** playwright-script · **Duration:** 5.3m
- [PASS] Same chain as TC-01, first-click throughout.

### TC-03 — Negative 1: Jabu Hadebe, resolved dispute
**Mode:** playwright-script · **Duration:** 8.5m
- [PASS] Draft/Submit → `LungileN` Refer for Dispute → `BabalwaM` mediator resolved → `JabuH` Update
  with Outcomes → `LungileN` Review Updated → `SalesHR` Verify.

### TC-04 — Negative 2: Sanele Sithole, escalated dispute resolved at tier 2
**Mode:** playwright-script, then hand-written continuation · **Duration:** ~9m across two runs
- The background process running TC-00–TC-04 was killed by the harness immediately after
  `LungileN` referred Sanele's PA for dispute. Live re-check found her PA parked cleanly at
  `BabalwaM`'s Mediator Review Disagreement task, status **Under appeal** — nothing corrupted, so the
  scenario resumed from that exact point rather than restarting.
- [PASS] `BabalwaM` selected *"has not been resolved"*; Comments + Attachments filled with
  `test-data/mediation-outcome.txt`; Submit first click.
- [PASS] `Sampha` (tier-2, Babalwa's own supervisor) held the escalated **Mediator Supervisor Review**
  task for Sanele — selected *"has been resolved"* — **Approve**.
- [PASS] `SaneleS` — Update with Outcomes — Submit.
- [PASS] `LungileN` — Review Updated — Approve.
- [PASS] `SalesHR` — Verify — HR inbox cleared.

### TC-05 — Negative 3: Adam Apple, escalated dispute unresolved at both tiers
**Mode:** hand-written continuation script · **Duration:** ~5m
- [PASS] Draft/Submit → `LungileN` Refer for Dispute → `BabalwaM` *"has not been resolved"* +
  comment/attachment → `Sampha` (tier 2) *"has not been resolved"* + comment/attachment → **Approve**.
- [PASS] Checked `adam`, `LungileN`, `SalesHR` inboxes for a task mentioning Adam — **none found in
  any of them** (BLOCKING assertion held).

### TC-06 — Final recount
**Mode:** hand-written continuation script · **Duration:** ~1m
- [PASS] `44 Total · 0 Not Started · 39 In progress · 5 Completed` — matches all 5 driven scenarios,
  including Adam's terminal *Dispute Unresolved*.

## Findings

### 1. A killed background process left the workflow in a resumable state, not a broken one
The harness stopped the Playwright process mid-run for reasons unrelated to the app (not investigated
here — no error was logged before the kill). Re-checking the live workflow state showed Sanele's PA had
already advanced cleanly to the mediator step and was waiting there normally; resuming from that point
worked without any cleanup or rollback. Worth remembering for any future long multi-actor chain: check
live state before assuming a kill means the data needs resetting again.

### 2. Confirms prior findings, reproduced on fresh data
Tier-2 escalation, the Approve-vs-Submit split between mediator and tier-2 screens, and the Completed
tile counting the Dispute-Unresolved terminal all reproduced identically to the 14:40 UTC run and the
2026-08-11 CD/D/DDG runs — see that report's Findings section for the full write-up; not re-litigated
here since nothing new was observed.

## Environment

- Admin `admin`/`P@ssw0rd`. Employees `Simmy`, `TonyD`, `JabuH`, `SaneleS`, `adam` — all `123qwe`.
- Supervisor `LungileN`; mediator `BabalwaM`; tier-2 escalation `Sampha`; HR `SalesHR` — all `123qwe`.
- Mediation evidence fixture: `test-data/mediation-outcome.txt`.
- Cycle view: `dynamic/SaGov.Pmds/sagov-cycle-details-view?id=7cf9054b-8c69-4313-ae5c-8039bf495c04`.
- Refs: PA2026/6887 Sanele · PA2026/6831 Adam. Simmy/Tony/Jabu refs were not captured in this run's
  console output (their tasks had already left every actor's inbox by the time refs were checked).
