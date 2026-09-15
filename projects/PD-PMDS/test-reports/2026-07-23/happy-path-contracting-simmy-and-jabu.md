# PMDS SL 1-12 Performance Agreement — Contracting Happy Path (Simmy Mthalane & Jabu Hadebe)

**Date:** 2026-07-23
**Cycle:** SL 1-12 Performance Agreement, FY2026/27
**App:** HCM Admin Portal (PMDS module) — https://pd-hcm-adminportal-qa.shesha.app/ (QA)
**Refs:** PA2026/6369 (Simmy Mthalane), PA2026/6327 (Jabu Hadebe)
**Result:** PASSED — both users completed the full Contracting happy-path chain end-to-end

## Context
PMDS data was cleared again (Contracting reset to 41/41 Not Started). This run re-establishes a Contracting population by driving the positive happy path for **two employees** — admin Open Process → employee Draft → supervisor Sign → HR Verify → Generate PERSAL Input. Reporting hierarchy unchanged: interns → **Lungile Nhleko** (HOD SALES, SL10) → **Babalwa M** (Chief Director, SL13, mediator) → Tania.

## Steps executed (live, headed)

### 1. Admin — Open Contracting Process (`admin`/`P@ssw0rd`)
SaGov.Pmds cycle views → SL 1-12 Performance Agreement → Manage Process. Confirmed clean slate: Contracting **41/41 Not Started, 0 In progress, 0 Completed**. Clicked **Open process** — Submission Date to HR 2026-07-31, Closing Date 2026-08-31, **Initiate immediately**. Workflows initiated live (observed staged 12 Not Started / 29 In progress → then 41 In progress). Result: Contracting → **In Progress (41/41)**.

### 2. Employee Drafts & Submit (both `123qwe`)
Both drafts built with the identical structure:
- **Confirm Details** — Supervisor = **Lungile Nhleko** and Mediator = **Babalwa M** both defaulted correctly (mediator = supervisor's supervisor). No alternates assigned.
- **Scoring** — 4 KRAs @ 25% each (**Total 100%**): Provide effective administrative support services (Service Standards), Maintain accurate records and filing systems (Information), Coordinate stakeholder consultation and engagement (Consultation), Deliver quality outputs and value for money (Value for Money). 4 GAFs ticked.
- **Workplan Agreement** — 2 Key Activities per KRA (**8 total**), each with Target, Timeframe (Quarterly), Target Date (2026-09-30), Resource Required, Enabling Condition, Source of Evidence. Verified per-KRA count = 2 before advancing.
- **Personal Development Plan** — 1 PDP under Areas of Development & Formal Training (Basic Project Management for the Public Service / Formal Course / commencement 2026-08-03).
- **Completed Summary** — both attestation checkboxes ticked → **Submit**. Status **Draft → Review**; each employee's inbox cleared.

| Employee | Login | Position | PERSAL | Ref | GAFs ticked |
|---|---|---|---|---|---|
| Simmy Mthalane | `Simmy` | Intern 1, SL6 | 78456320 | PA2026/6369 | Job Knowledge, Communication, Initiative, Quality Of Work |
| Jabu Hadebe | `JabuH` | Intern 2, SL5 | 35789564 | PA2026/6327 | Job Knowledge, Communication, Reliability, Quality Of Work |

### 3. Supervisor Sign (`LungileN`/`123qwe`)
Both PAs landed in LungileN's inbox as "Review Performance Agreement" (Review). Opened each and clicked **Sign** (no mandatory comment). Status **Review → HR Review** for both; tasks cleared (only her own draft PA remained in the inbox).

### 4. HR Verify (`SalesHR`/`123qwe` = "Sales HR")
Both PAs landed in HR's inbox as "Verify Performance Agreement" (HR Review). Ticked the Confirmation checkbox (gates Verify) → **Verify** on each. Status **HR Review → Generate PERSAL Input** for both.

### 5. Verification (admin)
Re-read the cycle Manage Process dashboard: Contracting **41 Total / 0 Not Started / 39 In progress / 2 Completed** — both PAs correctly counted in the Completed rollup.

Full chain proven on fresh data for two users: admin Open Process → employee Draft/Submit → supervisor Review/Sign → HR Verify → Generate PERSAL Input → dashboard **Completed=2**.

## Observations / notes
- **GAF list differs per employee.** Simmy's Scoring GAF table offered {Delegation And Empowerment, Job Knowledge, Technical Skills, Flexibility, Leadership, Management Of Human Resources, Communication, Initiative, Team Work, Quality Of Work}; Jabu's offered a different set including Management Of Financial Resources, Reliability, and Planning And Execution but **no** Initiative/Technical Skills/Team Work. GAF options appear position/role-driven — pick from the live list rather than a fixed set of labels.
- **Next stayed briefly disabled** on the Scoring step for Jabu immediately after ticking the 4th GAF (~0.5s), then enabled without further action — a re-render lag, not a blocker.
- **Non-fatal console noise persists** — repeated `executeScriptSync error: TypeError: Cannot read properties of undefined (reading 'cycle')` from configurable-visibility scripts throughout the Draft wizard; does not block the flow.
- **Stray "Test" info banner** still appears at the top of the Draft/Review forms (`sagov-performanceagreement-wf-draftperformanceagreement v52`), a leftover config edit.
- Scope was positive-only for two users. The two previously-flagged High bugs (Contracting resolved-dispute Update-with-Outcomes Submit; process re-open reset) were **not** exercised this run.

## Environment
- Employee login default password: `123qwe`. `SalesHR` = HR-verify role for Contracting (Mid-Year HR verify differs — Andrew GOV005 / Sarah EMP001234).
- Inbox reached by direct URL `dynamic/Shesha.Workflow/workflows-inbox`; individual tasks via `shesha/workflow-action?id=<paId>&todoid=<todoId>`.
- Wizard fully automatable via `browser_evaluate` (AntD tables render as ARIA-role divs, not native `<tr>` — query `[role=row]`; native-setter + input event for text/textarea; `mousedown` on `.ant-select-selector` then click `.ant-select-item-option`; date via calendar cell `td[title="YYYY-MM-DD"]`).
