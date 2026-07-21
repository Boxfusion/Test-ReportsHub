# PMDS SL 1-12 — Mid-Year Assessment happy path (Simmy Mthalane)

**Date:** 2026-07-16
**Cycle:** SL 1-12 Performance Agreement, FY2026/27 — **Mid Year Assessment** stage
**Employee:** Simmy Mthalane (`Simmy`), **Ref PR2026/7335**
**Result:** ✅ PASS — full Mid-Year chain completed to **Completed**.

## Context
The team **closed Contracting** and **opened the Mid-Year Assessment** stage (so the Open Process step was already done — like Contracting, but pre-opened). Each employee who completed Contracting received a Mid-Year **self-assessment** task. Drove Simmy's end-to-end, mirroring the Contracting employee chain.

## Flow (3 participant steps)
1. **Employee Self-Assessment** (`Simmy`, form `SaGov.Pmds/sagov-employee-complete-self-assessment`): the 4 Contracting KRAs pre-load. For each KRA, open **"Rate Key Activities"** (eye icon) and set an **Own Score 1–4** per key activity.
   - **Rule:** a rating of **1, 2 or 4 requires a comment AND attachment**; a rating of **3 requires a comment only**. Used **3 + comment** on all 8 activities → system auto-calculated **Own overall = 75%**.
   - **Employee Comments** (page-level) are **required** to enable Submit. Submit → status **Draft → Review** (to supervisor). GAFs are read-only (inherited from Contracting); a Performance Improvement Plan upload is optional.
2. **Supervisor Review** (`LungileN`, form `sagov-supervisor-review-performance-assessment`): sees the employee's scores + comment; sets a **Supervisor Score 1–4** per activity (eye icon → Rate Key Activities; supervisor per-activity comment is optional, score alone enables Save). Added page-level Supervisor Comments → **Sign**. **Agreed overall auto-calculated = 75%.** Status **Review → HR Review**.
3. **HR Verify** (`GOV005` = **Andrew Smith**, form `sagov-performancereview-verifyperformanceassessment`): read-only assessment (Own/Supervisor/Agreed all 3s) + both comment threads; a **Confirmation** checkbox gates **Verify**. Ticked + **Verify** → status **HR Review → Completed**. Mid Year dashboard Completed 0 → **1**.

## Key findings vs Contracting
- **Ref prefix PR** (Contracting = PA).
- **HR verifier = Andrew (`GOV005`) / Sarah (`EMP001234`)** — the SaGov HR reviewers (the process routes to both) — NOT `SalesHR`. (After the supervisor Sign the task appears in Andrew's & Sarah's inboxes, not the employee/supervisor/SalesHR.)
- Score→% mapping: all-3 ratings = **75%** (Own/Supervisor/Agreed). (A per-KRA "100%" figure shows transiently in one column on the working screens; the verified Agreed overall settled at the score-based value.)
- Buttons on supervisor screen: Close / Send Back / Refer for dispute / View in PDF / **Sign** (dispute available on Mid-Year too).
- Same non-fatal `executeScriptSync` console noise and stray "Test" banner as Contracting.

## Environment
- Employee/supervisor pwd `123qwe`. **Mid-Year HR: `GOV005` (Andrew) / `EMP001234` (Sarah), pwd `123qwe`.**
- Inbox `dynamic/Shesha.Workflow/workflows-inbox`; tasks via `shesha/workflow-action?id=<id>&todoid=<todoId>`.
