# PMDS SL 1-12 — Mid-Year Assessment happy path (Simmy Mthalane)

**Date:** 2026-07-17
**Cycle:** SL 1-12 Performance Agreement, FY2026/27 — **Mid Year Assessment** stage
**Employee:** Simmy Mthalane (`Simmy`), **Ref PR2026/7347**
**Result:** ✅ PASS — full Mid-Year happy-path chain completed; assessment terminates at **AWAITING PERSAL SYNC** (Completed rollup).
**App:** HCM Admin Portal (PMDS module), https://pd-hcm-adminportal-qa.shesha.app/ (QA)

## Context
The Mid-Year Assessment stage was **closed/reset** at the start of this run (all 41 Not Started, "Open process" available — a first open, not a re-open). The 6 Contracting-completed users from 2026-07-16 were still intact (Contracting Completed = 6), so the Mid-Year population existed. As `admin` I **opened the Mid-Year process** (Submission 2026-07-31, Closing 2026-08-31, *Initiate immediately*) → each Contracting-completed employee received a self-assessment task. Drove Simmy's end-to-end.

## Flow (3 participant steps)
1. **Employee Self-Assessment** (`Simmy`, form `SaGov.Pmds/sagov-employee-complete-self-assessment v37`): the 4 Contracting KRAs pre-loaded (Provide timely & reliable customer service / Deliver value for money in daily tasks / Ensure accessible & consistent service delivery / Handle client queries with courtesy & professionalism — each weight 25, 2 key activities = 8 total). Per activity: **eye icon → "Rate Key Activities" → Own Score = 3** (comment only, per the 3=comment / 1·2·4=comment+attachment rule) + a per-activity comment via the `wechat` icon. Page-level **Employee Comments** (required) added → **Submit** → status **Draft → Review** (to supervisor). GAFs read-only (inherited); Performance Improvement Plan upload optional.
2. **Supervisor Review** (`LungileN`, form `sagov-supervisor-review-performance-assessment v38`): set **Supervisor Score = 3** on all 8 activities (matching → auto-agree, no dispute; supervisor per-activity comment optional, score alone enables Save). Page-level **Supervisor Comments** added → **Sign** → status **Review → HR Review**. Agreed auto-calculated.
3. **HR Verify** (`GOV005` = **Andrew Smith**, form `sagov-performancereview-verifyperformanceassessment`): read-only assessment + comment threads; a **Confirmation** checkbox gated **Verify**. Ticked + **Verify** → task cleared → **Completed / Awaiting PERSAL Sync**. Mid-Year dashboard Completed 0 → included in the final **2**.

## Dashboard reconciliation (Manage Process, Mid Year Assessment, end of run)
- Total 41 · Not Started 36 · In progress 3 · **Completed 2** (Simmy happy-path + Sanele resolved-dispute).

## Key findings / gotchas
- **Ref prefix PR** (Contracting = PA); **Mid-Year HR verifier = Andrew `GOV005` / Sarah `EMP001234`** (routes to both), NOT SalesHR.
- **Score→% display quirk (repeat):** with all activities at 3, the **Own overall column showed 100%** while the score-based value is 75%; the Supervisor/Agreed settle at the correct value once all KRAs are scored — treat Agreed as authoritative.
- Supervisor Rate-dialog Save persisted all 4 KRAs cleanly this run (no silent-drop observed — but it remains a known intermittent risk; each KRA was verified after Save).
- Page-level comment fields require a **real click + keystrokes** to satisfy the Submit/Sign enable-gate (a scripted value-setter does not register); the modal per-activity comment dialogs accept a scripted set fine.
- Same non-fatal `executeScriptSync` console noise + stray "Test" banner as elsewhere.

## Environment
- Employee/supervisor pwd `123qwe`. Simmy's supervisor = `LungileN`. Mid-Year HR = `GOV005` (Andrew) / `EMP001234` (Sarah), pwd `123qwe`.
- Inbox `dynamic/Shesha.Workflow/workflows-inbox`; tasks via `shesha/workflow-action?id=<id>&todoid=<todoId>`.
