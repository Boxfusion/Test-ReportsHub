# Report: PMDS SL 1-12 — Contracting Lifecycle (positive and negative)

**Date:** 2026-08-02 21:05 UTC
**Plan:** test-plans/contracting/contracting-lifecycle.md
**Spec:** test-plans/contracting/contracting-lifecycle.spec.ts
**Execution Mode:** playwright-script (headed; run in 4 staged passes — see *Execution note*)
**Result:** PASSED
**Duration:** ~26m across the four passes

## Summary

| Total Steps | Passed | Failed | Skipped |
|-------------|--------|--------|---------|
| 27 | 27 | 0 | 0 |

**Cycle:** SL 1-12 Performance Agreement, FY2026/27 — Contracting stage
**App:** HCM Admin Portal, PMDS module — https://pd-hcm-adminportal-qa.shesha.app/

Every branch the Contracting workflow can take was driven end-to-end on live QA data, together
with the validation that guards each one:

| Branch | Employee | Outcome |
|---|---|---|
| Happy path | Simmy Mthalane | ✅ Generate PERSAL Input |
| Send back → re-submit | Sanele Sithole | ✅ Generate PERSAL Input |
| Dispute → **resolved** | Jabu Hadebe | ✅ Generate PERSAL Input |
| Dispute → **not resolved** | Adam Apple | ✅ parks at *Under appeal*, no downstream task |

Contracting dashboard at the end of the run: **Total 43 · Not Started 0 · In Progress 40 · Completed 3.**

## Execution note

The Contracting chain is **one-shot per employee per cycle** — once an agreement is submitted its
task no longer exists, so the 27 cases cannot all re-run against the same population. The spec was
therefore executed in four staged passes on 2026-08-02, each pass green before the next:

| Pass | Cases | Result |
|---|---|---|
| 1 | TC-01 – TC-10 | 10 passed (3.8m) |
| 2 | TC-11 – TC-15 | 5 passed (4.3m) |
| 3 | TC-16 – TC-22 | 7 passed (13.0m) |
| 4 | TC-23 – TC-27 | 5 passed (2.2m + 4.9m + earlier partials) |

Setup for the run: the data had been re-seeded (Contracting NOT STARTED, 43/43 Not Started), so
the process was opened first as `admin` — Submission Date to HR **31/08/2026**, Closing Date
**30/09/2026**, *Initiate the workflows immediately* → **43/43 In Progress**.

## Step Results

### TC-01 — Contracting stage is open with the full employee population in progress
**Mode:** playwright-script · **Duration:** 17.7s
- [PASS] Contracting status = `IN PROGRESS`; Total 43 · Not Started **0** · In Progress 43 · Completed 0

### TC-02 — Confirm Details defaults the supervisor and mediator from the reporting line
**Mode:** playwright-script · **Duration:** 5.2s
- [PASS] Wizard opens on Confirm Details
- [PASS] Default Supervisor = **Lungile Nhleko**
- [PASS] Default Mediator = **Babalwa M** (the supervisor's supervisor — hint text confirmed)

### TC-03 — NEGATIVE: Next stays disabled while the KRA weights total less than 100%
**Mode:** playwright-script · **Duration:** 15.2s
- [PASS] Next disabled with an empty KRA table
- [PASS] Running total after 3 KRAs @ 25% = **75**
- [PASS] Next still disabled at 75%

### TC-04 — NEGATIVE: Next stays disabled at 100% until the minimum 4 GAFs are checked
**Mode:** playwright-script · **Duration:** 5.4s
- [PASS] KRA weight total = **100**
- [PASS] GAFs checked = **0**; Next still disabled

### TC-05 — Scoring completes once 4 KRAs total 100% and 4 GAFs are checked
**Mode:** playwright-script · **Duration:** 11.6s
- [PASS] GAFs ticked: Management Of Financial Resources, Planning And Execution, Team Work, Management Of Human Resources
- [PASS] Next becomes enabled; wizard advances to Workplan Agreement

### TC-06 — NEGATIVE: the workplan cannot be left with fewer than 2 key activities per KRA
**Mode:** playwright-script · **Duration:** 14.7s
- [PASS] Workplan renders 4 KRA sections
- [PASS] With 1 key activity on KRA 1, Next does not advance — wizard stays on Workplan Agreement
- [PASS] Feedback recorded: **NONE — the block is silent** (no toast, no inline error, no banner). See *Findings*.

### TC-07 — Workplan advances once every KRA has 2 key activities
**Mode:** playwright-script · **Duration:** 1.3m
- [PASS] 2 key activities per KRA, **8 total**; wizard advances to Personal Development Plan

### TC-08 — A development area can be added to the Personal Development Plan
**Mode:** playwright-script · **Duration:** 18.1s
- [PASS] PDP row created: `Compulsory Induction Programme / Formal Course / 30/09/2026`

### TC-09 — NEGATIVE: Submit is disabled until both attestations are confirmed
**Mode:** playwright-script · **Duration:** 1.7s
- [PASS] 2 attestation checkboxes present
- [PASS] Submit disabled with 0 ticked, and still disabled with 1 of 2 ticked

### TC-10 — The employee submits the performance agreement for supervisor review
**Mode:** playwright-script · **Duration:** 25.5s
- [PASS] Submit enabled with both attestations; agreement submitted
- [PASS] Employee inbox empty afterwards

### TC-11 — NEGATIVE: Refer for Dispute cannot be confirmed without a reason
**Mode:** playwright-script · **Duration:** 35.8s
- [PASS] Supervisor screen offers **Sign**, **Send back**, **Refer for Dispute** (plus Close / View In PDF)
- [PASS] Dialog reads *"Are you sure you wish to refer this Performance Agreement for Mediation?"*
- [PASS] **Yes** disabled with no comment; enabled once a reason is typed

### TC-12 — The supervisor sends the agreement back to the employee
**Mode:** playwright-script · **Duration:** 33.2s
- [PASS] Send Back dialog offers the completed user task **"Initiate Performance Agreement"**; comment mandatory
- [PASS] Agreement leaves the supervisor's inbox

### TC-13 — The employee receives the returned agreement and re-submits it
**Mode:** playwright-script · **Duration:** 1.3m
- [PASS] PA2026/6463 back in Sanele's inbox as *Initiate Performance Agreement*, status **Review**
- [PASS] Re-submitted; employee inbox clear

### TC-14 — The supervisor signs the re-submitted agreement
**Mode:** playwright-script · **Duration:** 54.0s
- [PASS] Review comment saved, **Sign** actioned, task routed to HR

### TC-15 — NEGATIVE: HR cannot verify until the confirmation is ticked
**Mode:** playwright-script · **Duration:** 54.9s
- [PASS] HR screen has 1 confirmation checkbox and a **Verify** button
- [PASS] Verify **disabled** before the checkbox is ticked, enabled after
- [PASS] Verified → task cleared from the HR inbox (send-back branch complete)

### TC-16 — The employee drafts and submits the performance agreement
**Mode:** playwright-script · **Duration:** 2.3m
- [PASS] Reporting-line defaults correct; full agreement captured and submitted (Simmy)

### TC-17 — The supervisor signs the agreement without changes
**Mode:** playwright-script · **Duration:** 54.1s
- [PASS] Signed; routed onwards from the supervisor inbox

### TC-18 — HR verifies the agreement and it reaches Generate PERSAL Input
**Mode:** playwright-script · **Duration:** 54.9s
- [PASS] Verified; HR inbox cleared (happy path complete)

### TC-19 — Jabu submits an agreement the supervisor will dispute
**Mode:** playwright-script · **Duration:** 3.3m
- [PASS] Draft completed and submitted

### TC-20 — The supervisor refers Jabu's agreement for mediation
**Mode:** playwright-script · **Duration:** 58.5s
- [PASS] Referred with a reason; left the supervisor's inbox

### TC-21 — Adam submits and his agreement is also referred for mediation
**Mode:** playwright-script · **Duration:** 4.2m
- [PASS] Draft completed, submitted and referred for mediation

### TC-22 — Both disputes are routed to the mediator
**Mode:** playwright-script · **Duration:** 19.0s
- [PASS] `BabalwaM` inbox holds *Mediator Review Disagreement and attempt to resolve* for
  **PA2026/6407 (Adam Apple)** and **PA2026/6421 (Jabu Hadebe)**, both status **Under appeal**

### TC-23 — The mediator records the disagreement as resolved
**Mode:** playwright-script · **Duration:** 45.1s
- [PASS] Both outcome options offered (*has been resolved* / *has not been resolved*)
- [PASS] Resolved outcome + mediation note submitted; mediation task cleared

### TC-24 — The employee updates the agreement with the dispute outcome and it completes
**Mode:** playwright-script · **Duration:** 3.1m
- [PASS] Routed back to Jabu as **"Update Performance Agreement with Outcomes"** (status Review)
- [PASS] Tabs visited, confirmation ticked, **Submit processed** — task left the inbox
- [PASS] Supervisor received **"Review Updated Performance Agreement with Outcomes"** and approved
- [PASS] HR verified → resolved-dispute branch complete

### TC-25 — NEGATIVE: an unresolved mediation requires both a comment and an attachment
**Mode:** playwright-script · **Duration:** 1.1m
- [PASS] Selecting *has not been resolved* reveals the **Mediator Dispute Resolution Outcome** sub-form
- [PASS] **Submit disabled** with the outcome Comments and Attachments empty
- [PASS] Comment + `test-data/mediation-outcome.txt` attached → Submit enabled and actioned

### TC-26 — An unresolved dispute parks the agreement with no downstream task
**Mode:** playwright-script · **Duration:** 45.8s
- [PASS] Mediator inbox holds nothing further for Adam
- [PASS] Employee inbox empty
- [PASS] HR has no verification task for that agreement — the agreement rests at **Under appeal**

### TC-27 — The Contracting dashboard counts the agreements driven to completion
**Mode:** playwright-script · **Duration:** 17.7s
- [PASS] Total 43 · Not Started 0 · In Progress 40 · **Completed 3**

## Findings

### 1. Workplan validation is silent (UX defect)
On the Workplan Agreement step, clicking **Next** with fewer than 2 key activities on a KRA does
nothing at all — no toast, no inline error, no banner, no spinner. The block itself is correct, but
the user gets no reason for it. This is a **regression against 2026-07-16**, when the same condition
raised a visible banner (*"KRA '…' must have at least 2 Key Activities"*) — see
`test-reports/2026-07-16/refer-for-dispute-jabu.md`. Logged as
`test-reports/bugs/2026-08-02-workplan-min-activities-blocks-silently.md`.

### 2. The July "Update Performance Agreement with Outcomes" blocker no longer reproduces
`test-reports/bugs/2026-07-16-update-pa-with-outcomes-submit-fails.md` recorded that Submit on this
step did nothing, leaving the resolved-dispute branch unreachable. On this run TC-24 drove that exact
step to completion first time — Submit processed, the task left the employee's inbox and the
supervisor received *"Review Updated Performance Agreement with Outcomes"*. The bug file has been
annotated as verified-resolved.

### 3. Guard rails are enforced by disabling controls, not by messages
Scoring (weights ≠ 100%, fewer than 4 GAFs), the Summary attestations, HR's confirmation and the
mediator's unresolved-outcome evidence all gate their action button rather than showing validation
text. That is consistent and safe, but combined with finding 1 it means a user who does not know the
rule gets no explanation anywhere in the wizard. Worth raising with the product team.

### 4. The GAF grid is paged and unordered
The Generic Assessment Factors table shows 10 factors at a time out of a larger set, and the visible
names differ between loads (e.g. *Flexibility / Technical Skills / Reliability* on one load,
*Leadership / Job Knowledge / Communication / Initiative* on the next). Automation therefore ticks by
row position, not by name. Whether the ordering is intentionally randomised is worth confirming.

### 5. Reporting hierarchy is intact
Every draft defaulted Supervisor = **Lungile Nhleko** and Mediator = **Babalwa M**, matching the
intern → LungileN → BabalwaM → Tania chain, and the mediator routing followed it.

## Environment

| Key | Value |
|---|---|
| Admin | `admin` / `P@ssw0rd` |
| Employees | `Simmy`, `SaneleS`, `JabuH`, `adam` — all `123qwe` |
| Supervisor / Mediator / HR | `LungileN` / `BabalwaM` / `SalesHR` — all `123qwe` |
| Inbox | `dynamic/Shesha.Workflow/workflows-inbox`; tasks via `shesha/workflow-action?id=<paId>&todoid=<todoId>` |
| Draft form | `SaGov.Pmds/sagov-performanceagreement-wf-draftperformanceagreement v52` |
| Mediator form | `SaGov.Pmds/sagov-performanceagreement-wf-mediatorreviewdisagreementandattemptoresolve v46` |
| Send Back dialog | `Shesha.Workflow/user-task-send-back v2` |

Non-fatal `executeScriptSync ... reading 'cycle'/'tableData'` console noise and slow, feedback-less
**Next** transitions persist from earlier runs; neither blocked completion.
