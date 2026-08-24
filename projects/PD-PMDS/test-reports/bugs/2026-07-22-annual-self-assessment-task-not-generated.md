# BUG — Annual Assessment: self-assessment task not generated on "initiate immediately" (positive workflow blocked)

**Date:** 2026-07-22
**Module:** PMDS — SL 1-12 Performance Agreement, FY2026/27 — **Annual Assessment** stage
**App:** HCM Admin Portal — https://pd-hcm-adminportal-qa.shesha.app/ (QA)
**Severity:** High — blocks the entire Annual Assessment stage (no employee can start their self-assessment)
**Status: ✅ RESOLVED 2026-07-23** — on a fresh Annual open, the "Complete Self-Assessment" inbox task now generates correctly (Simmy PR2026/3717); self-assessment + supervisor sign both work. See `2026-07-23/annual-happy-path-simmy-in-progress.md`. (Cannot reproduce; the task-generation defect is gone.)
**Status:** OPEN (found this session)

## Summary
Opening the **Annual Assessment** process with **"Initiate the workflows immediately"** creates each eligible employee's Annual Assessment **entity in `Draft`** (it appears in the cycle Employee-List and in the employee's **My Items**), but it **does not generate the actionable "Complete Self-Assessment" inbox task**. The employee's *Incoming Items* inbox is empty, and the only links available (My Items / Employee-List) open **read-only** views. Result: employees have **no way to start** their Annual self-assessment, so the Annual positive workflow cannot begin.

## Environment / setup
- Contracting = Completed; Mid-Year closed (→ Completed, kept its 3 completed: Simmy, Sanele, Jabu).
- Admin → cycle **Manage Process** → Annual **"Open process"** (Submission 2026-07-31, Closing 2026-08-31, **Initiate the workflows immediately**).
- After open + refresh, Annual tile = **IN PROGRESS · 41 Total · 37 Not Started · 4 In progress · 0 Completed** — i.e. 4 employees were initiated.

## Steps to reproduce
1. As **admin**, open the Annual Assessment process for the SL 1-12 cycle with **initiate immediately**.
2. Log in as an initiated employee (e.g. **Simmy** `Simmy`/`123qwe`).
3. Open **Workflows → Incoming Items** (`dynamic/Shesha.Workflow/workflows-inbox`).

## Expected
An actionable **"Complete Self-Assessment"** task for the Annual Assessment appears in the employee's inbox (exactly as Mid-Year does — proven earlier the same day, where "initiate immediately" produced the self-assessment tasks).

## Actual
- **Incoming Items inbox = "0 items found"** — no Annual task. (Re-checked after ~8 min + reload.)
- The Annual assessment **does exist** — cycle Employee-List shows **Annual Assessment Status = "Draft"**, Ref **PR2026/3692** for Simmy (id `5d514bc4-1d97-4b0f-9449-a7781ea793c3`); it also appears in the employee's **My Items** (`workflows-my-items`) as type **"SaGov Annual Assessment"**, status **Draft**.
- The only links from My Items / Employee-List go to **read-only** pages: `sagov-annual-assessment-details` and `/shesha/workflow?id=...` (workflow instance view) — both show only **Close / View in PDF**, no edit/complete action.
- Navigating to `/shesha/workflow-action?id=5d514bc4...` **without a todoid** renders a blank page (no form). A valid `todoid` only comes from an inbox item, which does not exist.

## Scope — systemic, not per-user (verified)
| User | Role | Annual entity (My Items) | Inbox task |
|---|---|---|---|
| Simmy Mthalane (`Simmy`) | employee | Draft — PR2026/3692 | none (0 items) |
| Jabu Hadebe (`JabuH`) | employee | present (Annual instance) | none (0 items) |
| Sanele Sithole (`SaneleS`) | employee | Draft — PR2026/3690 (id `c3dc8082`) | none (0 items) |
| Lungile Nhleko (`LungileN`) | supervisor | — | none (0 items) — rules out supervisor-first routing |

**3 of the 4 initiated employees checked (Simmy, Jabu, Sanele) all show the same pattern** — Annual entity in `Draft`, empty inbox, no self-assessment task. Confirms the defect is not user-specific.

## Ruled out (per "verify before claiming app bug")
- **Async delay:** waited ~8+ minutes, reloaded inbox and used the reload button — still 0 items.
- **Wrong list:** checked Incoming Items, My Items, assessment-details, and workflow-instance views.
- **Wrong recipient:** the assessment is `Draft` (employee's turn) and the supervisor (LungileN) inbox is also empty.
- **Not initiated:** the entity was created (Draft) and the tile counts 4 In progress, so initiation partially ran — only the todo/inbox task is missing.
- **Harness:** no automation involved in the failing step — a human user would equally have no task to click.

## Contrast (works on Mid-Year)
Earlier the same day, opening **Mid-Year** with "initiate immediately" correctly generated **"Complete Self-Assessment"** inbox tasks that employees actioned end-to-end (e.g. Simmy PR2026/7371). So the defect is specific to the **Annual Assessment** workflow's task generation.

## Impact
The Annual Assessment stage is **non-functional** from the employee's entry point — no positive or negative Annual workflow can be exercised until the self-assessment task is generated.

## Recommendation
Investigate the Annual Assessment workflow's initiation step — the assessment entity is created but the first human task ("Complete Self-Assessment") is not assigned to the employee's inbox. Confirm the workflow definition's start transition creates and routes the todo (as Mid-Year's does).
