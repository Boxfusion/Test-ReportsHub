# PMDS SL 1-12 Performance Agreement — Contracting Happy Path (Simmy Mthalane)

**Date:** 2026-07-16
**Cycle:** SL 1-12 Performance Agreement, FY2026/27
**App:** HCM Admin Portal (PMDS module) — https://pd-hcm-adminportal-qa.shesha.app/
**Ref:** PA2026/6029
**Result:** PASSED — full happy-path chain completed end-to-end

## Context — new reporting hierarchy
The PMDS data was reset/re-seeded before this run (Contracting started at 41 Not Started / 0 In Progress). The org reporting chain was changed to insert a layer between the interns and Tania:

- Interns → **Lungile Nhleko** (LungileN, HOD SALES, SL 10) — unchanged
- **Lungile Nhleko → Babalwa M** (Chief Director, SL 13) — NEW
- **Babalwa M → Tania**

**Key verification:** on the Draft PA wizard's Confirm Details step, the **Default Mediator now resolves to Babalwa M** (previously Tania Smith on 2026-07-15). This matches the rule stated in the form hint — "the mediator is defaulted to your supervisor's supervisor" — confirming the new hierarchy is correctly reflected. Babalwa M carried through as mediator on the Review (supervisor) and Verify (HR) screens too.

## Steps executed (live, headed)

1. **Admin — Open Contracting Process.** Logged in `admin`/`P@ssw0rd` → SaGov.Pmds cycle views → SL 1-12 Performance Agreement → Manage Process → **Open process**. Submission Date to HR 2026-07-31, Closing Date 2026-08-31, initiate = **immediately**. Result: Contracting → In Progress, **41/41 In Progress**.
2. **Employee Draft & Submit** (`Simmy`/`123qwe`, Simmy Mthalane, Intern 1 SL6, PERSAL 78456320). Inbox task "Initiate Performance Agreement" (PA2026/6029, Draft), opened via `Shesha.Workflow/workflows-inbox` → `shesha/workflow-action`. 5-step wizard:
   - **Confirm Details** — Supervisor = Lungile Nhleko, Mediator = **Babalwa M** (both defaulted; no alternates assigned).
   - **Scoring** — 4 KRAs @ 25% each (total 100%), each with a Batho Pele Principle (Service Standards / Access / Courtesy / Value for Money); 4 GAFs ticked (Job Knowledge, Reliability, Communication, Initiative).
   - **Workplan Agreement** — 2 Key Activities per KRA (8 total), each with Target, Timeframe, Target Date (2026-07-31), Resource Required, Enabling Condition, Source of Evidence.
   - **Personal Development Plan** — 1 PDP under Areas of Development & Formal Training (Basic Project Management for the Public Service / Formal Course / 2026-07-31).
   - **Completed Summary** — both attestation checkboxes ticked → **Submit**. Status **Draft → Review**; Simmy's inbox cleared (0 items).
3. **Supervisor Sign** (`LungileN`/`123qwe`). Inbox "Review Performance Agreement" (Review). Added a review comment + Save → **Sign**. Status **Review → HR Review**; task cleared from LungileN's inbox (only her own draft PA2026/5983 remained).
4. **HR Verify** (`SalesHR`/`123qwe` = "Sales HR"). Inbox "Verify Performance Agreement" (HR Review; received from Lungile, supervisor comment persisted in the thread). Ticked the Confirmation checkbox (gates Verify) → **Verify**. Status **HR Review → Generate PERSAL Input**; task cleared from HR's inbox.

Full chain proven: admin Open Process → employee Draft/Submit → supervisor Review/Sign → HR Verify → Generate PERSAL Input.

## Observations / notes
- **Slow, feedback-less step transition (Confirm Details → Scoring).** On the first PA opened this session (Simmy), clicking **Next** on Confirm Details did not advance the wizard for several attempts and gave no spinner/feedback; the transition eventually persisted (on reload the wizard was on Scoring). A second employee (JabuH) advanced on the first click. Not a functional blocker — the wizard completes — but the silent, laggy transition is a UX concern worth flagging to the dev team.
- **Noisy console errors (non-fatal).** Throughout the Draft wizard the console logged repeated `executeScriptSync error: TypeError: Cannot read properties of undefined (reading 'cycle')` (and `...'tableData'`), originating from configurable visibility/boolean-expression scripts (`executeBooleanExpression`). They do not block the flow but add noise and may be masking the slow-transition behaviour above.
- **Stray "Test" info banner** appears at the top of the Draft/Review/Verify forms (form `sagov-performanceagreement-wf-draftperformanceagreement v52`), suggesting a recent config edit was left in place.

## Environment
- Employee login default password: `123qwe`. `SalesHR` = HR-verify role user (NOT a test employee).
- Inbox reached by direct URL `dynamic/Shesha.Workflow/workflows-inbox` (sidebar module flyouts don't open under automation); individual tasks via `shesha/workflow-action?id=<paId>&todoid=<todoId>`.
