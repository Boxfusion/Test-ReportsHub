# PMDS SL 1-12 — Mid-Year Assessment Happy Path (Simmy Mthalane)

**Date:** 2026-07-23
**Cycle:** SL 1-12 Performance Agreement, FY2026/27
**App:** HCM Admin Portal (PMDS module) — https://pd-hcm-adminportal-qa.shesha.app/ (QA)
**Ref:** PR2026/7389 (Simmy Mthalane, Intern 1)
**Result:** PASSED — Mid-Year happy path completed end-to-end to Awaiting PERSAL Sync

## Context
With Contracting's PERSAL input generated, closed Contracting and opened the Mid-Year Assessment stage, then drove the positive workflow for one user (Simmy). Mid-Year 3-step chain: employee **self-assessment** → supervisor **review/rate + Sign** → **HR Verify** (Andrew `GOV005`). Ref prefix is **PR** (vs PA for Contracting).

## Steps executed (live, headed)

1. **Admin — Close Contracting.** Manage Process → Contracting card → **Close process** → confirm **Yes**. Contracting → **Completed** (card now shows "Re-open process"). This gate is required before Mid-Year can open.
2. **Admin — Open Mid-Year.** Mid Year Assessment card → **Open process** → Submission 2026-07-31 / Closing 2026-08-31 / **Initiate immediately** → **Open Process**. Mid-Year → **In Progress**, **6 initiated** (the 6 employees who genuinely completed Contracting — Simmy, Jabu, Adam, Sanele, Lungile, Tony; **Thato excluded** since his Contracting ended Dispute-Unresolved, i.e. the Completed-tile over-count did NOT produce a Mid-Year assessment for him).
3. **Employee Self-Assessment** (`Simmy`/`123qwe`, PR2026/7389, action "Complete Self-Assessment"). For each of the 4 KRAs, opened the **Key Activity eye icon → "Rate Key Activities"** modal and set **Own Score = 3** for both key activities, adding a **Comment** to each (rule: a rating of 3 needs a comment; 1/2/4 need comment **and** attachment). Own **Overall Score = 100%**. Filled Employee Comments → **Submit**. Routed to supervisor.
4. **Supervisor Review & Sign** (`LungileN`). Action "Review Performance Assessment" — **Sign disabled until the supervisor rates every KRA**. For each KRA, opened the eye modal (`sagov-rate-key-activities-supervisor`) and set **Supervisor Score = 3** per activity with a comment (supervisor comment sub-modal has **no Submit button — it binds live and is closed via its X**, unlike the employee comment sub-modal which had Submit). Filled Supervisor Comments → **Sign**. Routed to HR.
5. **HR Verify** (`GOV005` = Andrew — Mid-Year HR verifier, NOT SalesHR which is Contracting-only). Action "Verify Performance Assessment" — ticked the single enabled **Confirmation** checkbox (the other 10 checkboxes are read-only GAF flags) → **Verify**.
6. **Verification (admin).** Mid Year Assessment dashboard: **In Progress 5 / Completed 1** — Simmy at Awaiting PERSAL Sync.

Full Mid-Year happy chain proven: admin Close Contracting → Open Mid-Year → employee Self-Assessment → supervisor Rate/Sign → HR Verify → Awaiting PERSAL Sync (Completed=1).

## Mid-Year form mechanics (new/confirmed)
- **Rating scale 1–4 per key activity**, entered via the **eye icon** in the "Key Activity" column of each KRA (opens a "Rate Key Activities" modal). The KRA-level rows have no inline inputs.
- **Comment/attachment rule:** rating **3 → comment only**; ratings **1, 2 or 4 → comment AND attachment**. Comment entered via the **chat (wechat) icon** per activity; attachment via the **file-add icon**.
- **Employee vs supervisor comment sub-modal differ:** employee's has Close + **Submit**; supervisor's has only the **X close** (binds live, no Submit).
- The "Rate Key Activities" **Save** sometimes needs a second click to commit and close.
- **Supervisor Sign is gated** on all KRAs being rated (+ supervisor comment); **HR Verify is gated** on the Confirmation checkbox.
- HR verifier = **Andrew `GOV005`** (`123qwe`); Sarah `EMP001234` is the alternate. SalesHR is Contracting-only.

## Environment
- Employee default password `123qwe`. Supervisor `LungileN`; HR `GOV005`.
- Inbox `dynamic/Shesha.Workflow/workflows-inbox`; tasks via `shesha/workflow-action?id=<paId>&todoid=<todoId>`.
