# Test Report — Employee Draft Performance Agreement (PMDS)

**Date:** 2026-07-14
**App:** HCM Admin Portal — PMDS module (QA) — https://pd-hcm-adminportal-qa.shesha.app/
**Cycle:** SL 1-12 Performance Agreement — FY2026/27
**Employee:** Lungile Nhleko (`LungileN`) — Position HOD SALES, Salary Level 10, PERSAL 25897642
**Workflow ref:** PA2026/5901 — *SaGov Performance Agreement Workflow Definition*
**ADO source:** Plan #101517 / Suite #101920 — "Employee Draft Performance Agreement"
**Result:** PASSED — drafted and submitted end-to-end; status moved Draft → **Review** (14/07/2026 14:33)

## Preconditions
- Contracting process for the SL 1-12 cycle was opened by admin earlier the same day with "Initiate the workflows immediately", so Lungile's Draft Performance Agreement task was waiting in her Workflows → Inbox.

## Steps executed

### TC-01 — Login as Employee ✅
Logged in as `LungileN` / `123qwe`. Regular-user account (no Live/Latest view-mode toggle).

### TC-02 — Confirm Details ✅
Opened Workflows → Inbox → PA2026/5901 ("Initiate Performance Agreement"). Reviewed employee details (pre-populated). 
- **Validation found:** "A mediator is required. Please assign an alternate mediator." — Lungile's default supervisor is Tania Smith (MEC, level 13), top of the reporting line, so there is no supervisor-of-supervisor to default as mediator.
- **Resolution:** assigned **Adam Apple** as Alternate Mediator with a reason. Proceeded to Scoring.

### TC-03 — Scoring (KRAs + GAFs) ✅
Added 4 KRAs at 25% each (**total = 100%**), each with a Batho Pele Principle:
1. Achieve annual sales revenue targets — Service Standards
2. Develop and manage sales team performance — Access
3. Customer relationship management and retention — Courtesy
4. Sales strategy execution and market expansion — Information

Ticked 4 Generic Assessment Factors (Development Required): Quality of Work, Team Work, Planning & Execution, Interpersonal Relationships.

### TC-04 — Workplan Agreement ✅
Captured 2 Key Activities per KRA (8 total). Each activity had: Key Activity, Target, Timeframe (Quarterly/Monthly/Bi-Annually), Target Date, Resource Required, Enabling Condition, Source of Evidence.

### TC-05 — Personal Development Plan ✅
Added one PDP under "Areas of Development and Formal Training": Development Area = *Managing of Performance in the Public Service*, Intervention = *Formal Course*, Commencement Date = 31/07/2026.

### TC-06 — Completed Summary ✅
Reviewed the summary (Details / Scoring / Workplan / PDP / Supporting Documents tabs), ticked both attestation checkboxes ("information is correct" + "discussed with my manager"), and clicked **Submit**.

## Outcome
- Draft submitted; the task left Lungile's Inbox and appears in **Sent Items** with status **Review**, now routed to the supervisor (Tania Smith).
- Screenshots: `pmds-pa-completed-summary.png`, `pmds-pa-submitted-review.png`.

## Notes / observations
- The Add Key Activity dialog re-generates all internal element refs on each open; field order is stable (Key Activity, Target, Timeframe, Target Date, Resource Required, Enabling Condition, Source of Evidence).
- Weight options are fixed 10/15/20/25/30%. Timeframe options: Daily, Weekly, Monthly, Quarterly, Bi-Annually.
- "Development Area" and "Types of intervention" are dropdowns (not free text) in the PDP dialog.
