# PMDS SL 1-12 — Contracting positive batch (6 users) to build a Mid-Year population

**Date:** 2026-07-16
**Cycle:** SL 1-12 Performance Agreement, FY2026/27 — **Contracting** stage
**Result:** PASSED — all six users driven end-to-end to **Completed** (Generate PERSAL Input). Contracting dashboard Completed **0 → 6**.
**Purpose:** after another data clear, rebuild a set of Contracting-complete employees so the team has more users to test Mid-Year on. Positive (no-dispute) scenarios only — the dispute/resolved path is avoided because the Contracting "Update Performance Agreement with Outcomes" Submit is broken (see `bugs/2026-07-16-update-pa-with-outcomes-submit-fails.md`).

## Setup
Admin **Open Process** for Contracting: Submission Date to HR 2026-07-31, Closing 2026-08-31, **Initiate immediately** → 41/41 In Progress.

## Users completed (all happy path, Draft → Supervisor Sign → HR Verify)
| Employee | Login | PA Ref | Supervisor (Sign) | HR (Verify) |
|----------|-------|--------|-------------------|-------------|
| Simmy Mthalane | Simmy | PA2026/6111 | LungileN | SalesHR |
| Jabu Hadebe | JabuH | PA2026/6069 | LungileN | SalesHR |
| Adam Apple | adam | PA2026/6055 | LungileN | SalesHR |
| Sanele Sithole | SaneleS | PA2026/6109 | LungileN | SalesHR |
| Thato Mali | ThatoMali | PA2026/6073 | LungileN | SalesHR |
| Lungile Nhleko | LungileN | PA2026/6065 | **BabalwaM** (her supervisor) | SalesHR |

All pwd `123qwe`. Interns' supervisor = Lungile; Lungile's supervisor = Babalwa M (new hierarchy).

## Draft content used (each PA)
- **Scoring:** 4 KRAs @ 25% (= 100%) with Batho Pele principles (Service Standards / Access / Courtesy / Value for Money; Lungile's set is managerial with Consultation). 4 GAFs checked (min 4).
- **Workplan:** 2 key activities per KRA (8 total), each with Target, Timeframe = Quarterly, Target Date, Resource Required, Enabling Condition, Source of Evidence.
- **PDP:** 1 entry (Development Area = Basic/Advanced Project Management, Intervention = Formal Course, Commencement Date set).
- **Summary:** both attestation checkboxes ticked → Submit.

## Chain executed (batched by role to minimise logins)
1. Submitted all 6 drafts (as each employee).
2. **LungileN** signed the 5 interns' PAs; **BabalwaM** signed Lungile's PA. (Supervisor **Sign** was enabled without a mandatory comment; a positive comment was added on the first, optional on the rest.)
3. **SalesHR** verified all 6 (Confirmation checkbox → Verify) → each **Generate PERSAL Input**.

## Result
- Contracting dashboard: Total 41 · Not Started 0 · In progress 35 · **Completed 6**.
- These 6 are now Contracting-complete and will be eligible for Mid-Year once the team **closes Contracting and opens Mid-Year**. **Handed back at this point per scope (Contracting only).**

## Notes
- Same slow, feedback-less **Next** transitions (Confirm→Scoring etc.) and non-fatal `executeScriptSync` console noise / stray "Test" banner as before; none blocked completion.
- Efficiency: KRA add-row and Add-Key-Activity/PDP modals accept a scripted native-setter value + `input` event (they register); page-level supervisor comment needs a real click+type (not required for Sign here).
- ⚠️ Reminder for the team: re-opening a stage **resets completed employees to Not Started** (`bugs/2026-07-16-reopen-process-resets-completed-status.md`) — so avoid re-opening Contracting after this, and expect Mid-Year completions to be at risk if Mid-Year is re-opened.
