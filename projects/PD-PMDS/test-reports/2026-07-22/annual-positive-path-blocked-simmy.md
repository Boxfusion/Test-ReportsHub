# PMDS SL 1-12 — Annual Assessment Positive Path (Simmy Mthalane) — BLOCKED

**Date:** 2026-07-22
**Cycle:** SL 1-12 Performance Agreement, FY2026/27 — **Annual Assessment** stage
**App:** HCM Admin Portal (PMDS module) — https://pd-hcm-adminportal-qa.shesha.app/ (QA)
**Intended user:** Simmy Mthalane (`Simmy`) — Annual Ref **PR2026/3692**
**Result:** BLOCKED — at step 1: the app did not generate the employee's self-assessment task. See bug `bugs/2026-07-22-annual-self-assessment-task-not-generated.md`.

## Goal
Run a positive Annual Assessment workflow for one user (self-assessment → supervisor review/Sign → HR Verify), mirroring the Mid-Year happy path.

## Setup completed (admin)
- **Gating confirmed:** Annual "Open process" is hidden until **Mid-Year is Closed** (same pattern as Mid-Year gated behind Contracting).
- Closed Mid-Year (admin → Close process → Yes) → Mid-Year **Completed** (kept its 3: Simmy, Sanele, Jabu). Annual **"Open process"** then appeared.
- Opened Annual (Submission 2026-07-31, Closing 2026-08-31, **initiate immediately**). Annual tile → **IN PROGRESS · 41 Total · 37 Not Started · 4 In progress · 0 Completed**.
  - **Note:** 4 initiated, though only 3 completed Mid-Year — the 4th is likely Lungile (was "Under appeal" at Mid-Year close). Worth confirming who the 4th is and why (Mid-Year completion vs. Annual eligibility rule).
- **Ref prefix:** Annual also uses **PR** (PR2026/3692), same as Mid-Year (vs PA for Contracting).

## Blocker
Logged in as **Simmy** — her **Incoming Items inbox is empty (0 items)**; no "Complete Self-Assessment" task. The Annual assessment exists as **Draft** (Employee-List + My Items, PR2026/3692) but there is no actionable task and no edit/complete action on any linked page. Verified systemic (Jabu employee + LungileN supervisor inboxes also empty) and not an async delay (waited ~8+ min, reloaded). Full detail + ruled-out causes in the bug file.

## Outcome
The positive Annual workflow **could not be started** — this is an application defect, not a test-harness issue. No employee can begin their Annual self-assessment in the current state.

## Suggested next steps
- Raise the bug with dev (self-assessment task not generated on Annual initiation).
- Once fixed, re-run this positive path for Simmy (self-assessment all-3s → supervisor Sign → HR Verify) and then the negative Annual workflows.

## Environment
- admin `admin`/`P@ssw0rd`; Simmy `Simmy`/`123qwe`. Cycle Manage Process / Employee-List: `dynamic/SaGov.Pmds/sagov-cycle-details-view?id=7cf9054b-8c69-4313-ae5c-8039bf495c04`. Annual details: `dynamic/SaGov.Pmds/sagov-annual-assessment-details?id=<id>`.
