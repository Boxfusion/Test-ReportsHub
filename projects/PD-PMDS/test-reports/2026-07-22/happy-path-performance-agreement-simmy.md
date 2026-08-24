# PMDS SL 1-12 Performance Agreement — Contracting Happy Path (Simmy Mthalane)

**Date:** 2026-07-22
**Cycle:** SL 1-12 Performance Agreement, FY2026/27
**App:** HCM Admin Portal (PMDS module) — https://pd-hcm-adminportal-qa.shesha.app/ (QA)
**Ref:** PA2026/6283
**Result:** PASSED — full happy-path chain completed end-to-end

## Context
PMDS data was cleared and the two open High bugs (Contracting resolved-dispute "Update-with-Outcomes" Submit; process re-open resetting completed employees) were reported fixed. This run is the first positive workflow against the fresh data set — a single-user Contracting happy path (admin Open Process → employee Draft → supervisor Sign → HR Verify). Reporting hierarchy unchanged: interns → **Lungile Nhleko** (HOD SALES, SL10) → **Babalwa M** (Chief Director, SL13) → Tania.

## Steps executed (live, headed)

1. **Admin — Open Contracting Process** (`admin`/`P@ssw0rd`). SaGov.Pmds cycle views → SL 1-12 Performance Agreement → Manage Process. Confirmed clean slate: Contracting **41/41 Not Started, 0 In progress, 0 Completed**. Clicked **Open process** — Submission Date to HR 2026-07-31, Closing Date 2026-08-31, **Initiate immediately**. Result: workflows initiated live, Contracting → **In Progress (41/41)**.
2. **Employee Draft & Submit** (`Simmy`/`123qwe`, Simmy Mthalane, Intern 1 SL6, PERSAL 78456320). Inbox task "Initiate Performance Agreement" (PA2026/6283, Draft). 5-step wizard:
   - **Confirm Details** — Supervisor = **Lungile Nhleko** and Mediator = **Babalwa M** both defaulted correctly (mediator = supervisor's supervisor). No alternates assigned.
   - **Scoring** — 4 KRAs @ 25% each (**Total 100%**): Improve service delivery standards (Service Standards), Enhance stakeholder access to services (Access), Strengthen courteous client engagement (Courtesy), Optimise value for money in operations (Value for Money). 4 GAFs ticked (Communication, Job Knowledge, Reliability, Initiative).
   - **Workplan Agreement** — 2 Key Activities per KRA (**8 total**), each with Target, Timeframe (Quarterly), Target Date, Resource Required, Enabling Condition, Source of Evidence.
   - **Personal Development Plan** — 1 PDP under Areas of Development & Formal Training (Basic Project Management for the Public Service / Formal Course / commencement 2026-07-31).
   - **Completed Summary** — both attestation checkboxes ticked → **Submit**. Status **Draft → Review**; Simmy's inbox cleared (0 items).
3. **Supervisor Sign** (`LungileN`/`123qwe`). Inbox "Review Performance Agreement" (Review). Added a positive review comment + Save → **Sign**. Status **Review → HR Review**; task cleared from LungileN's inbox (only her own draft PA2026/6237 remained).
4. **HR Verify** (`SalesHR`/`123qwe` = "Sales HR"). Inbox "Verify Performance Agreement" (HR Review); the supervisor's comment persisted in the thread. Ticked the Confirmation checkbox (gates Verify) → **Verify**. Status **HR Review → Generate PERSAL Input**; task cleared from HR's inbox.
5. **Verification (admin).** Re-read the cycle Manage Process dashboard: Contracting **41 Total / 0 Not Started / 40 In progress / 1 Completed** — Simmy's PA correctly counted in the Completed rollup.

Full chain proven on fresh data: admin Open Process → employee Draft/Submit → supervisor Review/Sign → HR Verify → Generate PERSAL Input → dashboard Completed=1.

## Observations / notes
- **Wizard transitions were responsive this run** — Confirm Details → Scoring advanced on the first Next click (no repeat of the earlier slow/feedback-less transition seen on the first PA of a session).
- **Non-fatal console noise persists.** Repeated `executeScriptSync error: TypeError: Cannot read properties of undefined (reading 'cycle')` from configurable visibility scripts throughout the Draft wizard — does not block the flow.
- **Stray "Test" info banner** still appears at the top of the Draft/Review forms (`sagov-performanceagreement-wf-draftperformanceagreement v52`), indicating a leftover config edit.
- Bug retests (Contracting resolved-dispute Submit; re-open reset) were **not** exercised in this run — scope was a positive workflow for one user. They remain the next candidates.

## Environment
- Employee login default password: `123qwe`. `SalesHR` = HR-verify role for Contracting (Mid-Year HR verify differs — Andrew GOV005 / Sarah EMP001234).
- Inbox reached by direct URL `dynamic/Shesha.Workflow/workflows-inbox`; individual tasks via `shesha/workflow-action?id=<paId>&todoid=<todoId>`.
