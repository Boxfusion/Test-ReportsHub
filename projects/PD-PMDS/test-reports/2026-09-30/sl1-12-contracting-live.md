# Report: PMDS SL 1-12 — Contracting: 2 positive + 3 negative scenarios
**Date:** 2026-09-30
**Plan:** test-plans/contracting/sl1-12-contracting-scenarios.md
**Execution Mode:** hybrid
**Result:** PASSED — all 5 scenarios driven to their expected end state (4 at Generate PERSAL Input, Adam terminal at Dispute Unresolved)
**Refs:** PA2026/8448 (Simmy Mthalane) · PA2026/8436 (Tony Dayimane) · PA2026/8402 (Jabu Hadebe) · PA2026/8446 (Sanele Sithole) · PA2026/8384 (Adam Apple)

## Context

Site data had been reset: Contracting was **NOT STARTED** (47 / 47 / 0 / 0). Admin opened it live
(Submission 30/09/2026, Closing 31/10/2026, initiate immediately) → `47 Total / 0 Not Started / 47 In progress`.
The first open attempt timed out waiting for the Open-process modal's Submission Date field; after the
environment fix it opened first time. Driven live, **headed**, via the hand-written Node/Playwright drivers on
the shared selector layer. The three cycles initially ran in parallel; the runner was killed by host memory
pressure mid-run (not an app failure) and the remaining steps were resumed one scenario at a time from the
current inbox task.

## Summary
| Scenario | Employee | Chain | Status reached |
|---|---|---|---|
| Positive 1 | Simmy Mthalane | Draft → LungileN Sign → SalesHR Verify | **Generate PERSAL Input** ✅ |
| Positive 2 | Tony Dayimane | Draft → LungileN Sign → SalesHR Verify | **Generate PERSAL Input** ✅ |
| Negative 1 | Jabu Hadebe | Refer for Dispute → BabalwaM resolved → Update with Outcomes → LungileN Review Updated → SalesHR Verify | **Generate PERSAL Input** ✅ |
| Negative 2 | Sanele Sithole | Refer → BabalwaM not resolved (comment + attachment) → Sampha tier-2 resolved → Update → Review Updated → SalesHR Verify | **Generate PERSAL Input** ✅ (resumed after memory kill) |
| Negative 3 | Adam Apple | Refer → BabalwaM not resolved → Sampha tier-2 not resolved | **Terminal — Dispute Unresolved** ✅ |

## Step Results
- [PASS] TC-00 Contracting opened: IN PROGRESS, 47 Total / 0 Not Started / 47 In progress
- [PASS] TC-01 Simmy — task left employee, supervisor and HR inboxes in turn
- [PASS] TC-02 Tony — same
- [PASS] TC-03 Jabu — resolved-dispute branch routed Update → Review Updated → Verify Performance Agreement (HR Review) → verified
- [PASS] TC-04 Sanele — tier-2 *Mediator Supervisor Review* task appeared for Sampha; resolved and verified
- [PASS] TC-05 Adam — no downstream task for Adam in `adam`, `LungileN` or `SalesHR` inboxes (terminal confirmed)
- [PASS] TC-06 Final recount: `47 Total / 0 Not Started / 42 In progress / 5 Completed`

## Observations
- No functional defects. The only interruption was the host running out of memory with three headed Chrome
  sessions in parallel — an environment limit, not an application failure; the resumed runs were serial.

## Environment
- Supervisor `LungileN`, mediator `BabalwaM`, tier-2 `Sampha`, HR `SalesHR`; all passwords `123qwe`.
- Attachment fixture: `test-data/mediation-outcome.txt`.
