# PMDS SL 1-12 — Mid-Year Assessment happy path (Lungile Nhleko)

**Date:** 2026-07-16
**Cycle:** SL 1-12 Performance Agreement, FY2026/27 — **Mid Year Assessment** stage
**Employee:** Lungile Nhleko (`LungileN`), **Ref PR2026/7331**
**Result:** PASSED — full Mid-Year happy-path chain completed; assessment now parks at **AWAITING PERSAL SYNC**.
**Purpose:** run Lungile's Mid-Year exactly like Simmy's (positive, no dispute) and observe the resulting stage status while it awaits PERSAL.

## Headline finding
After HR Verify, Lungile's Mid-Year assessment status = **AWAITING PERSAL SYNC** (workflow instance `05f1fe23…`, heading "Mid year Assessment Performance Review… for Lungile Nhleko"). This **matches Sanele's "awaiting persal"** status — so the happy-path (non-dispute) and the resolved-dispute path both correctly terminate at *Awaiting PERSAL Sync* after HR verification.

## Flow (3 participant steps, mirrors Simmy)
1. **Employee Self-Assessment** (`LungileN`, `sagov-employee-complete-self-assessment v37`): 4 managerial KRAs @25% (Lead & manage sales team / Ensure stakeholder engagement & reporting / Manage departmental budget & resources / Develop & mentor team members), 2 key activities each (8 total). Rated every activity **3** (comment only, per the 3=comment / 1·2·4=comment+attachment rule). Added page-level Employee Comments. Submit → **Not Started → Review** to supervisor.
2. **Supervisor Review** (`BabalwaM` — Lungile's supervisor is Babalwa M under the new hierarchy, `sagov-supervisor-review-performance-assessment v38`): set Supervisor Score **3** on all 8 activities (matching → auto-agree, no dispute). Added Supervisor Comments → **Sign** → **Review → HR Review**.
3. **HR Verify** (`GOV005` = Andrew Smith, `sagov-performancereview-verifyperformanceassessment v32`): Confirmation checkbox → **Verify** → task cleared → stage status **AWAITING PERSAL SYNC**.

## Dashboard reconciliation (Manage Process, Mid Year Assessment)
- Total 41 · Not Started 39 · In progress 0 · **Completed 2**.
- The **2 Completed = Lungile + Sanele** (both reached Awaiting PERSAL Sync today). **Simmy is NOT in the completed count** — consistent with the anomaly below.

## ⚠️ Employee-List status anomaly (confirmed live, Simmy only)
Read directly from the cycle **Employee List → "Mid Year Assessment Status"** column (as `admin`), stable across two reads 5 min apart:

| Person | Persal | Contracting | Mid Year Assessment Status |
|--------|--------|-------------|----------------------------|
| Lungile Nhleko | 25897642 | Completed | **Awaiting PERSAL sync** ✅ |
| Sanele Sithole | 63214530 | Completed | **Awaiting PERSAL sync** ✅ |
| Simmy Mthalane | 78456320 | Completed | **Not Started** ⚠️ |

- **Lungile is CORRECT on the employee list** (Awaiting PERSAL sync, matching Sanele). An earlier observation that Lungile showed "Not Started" was a **stale/pre-refresh view** — the list's Ref columns lazily load ("Loading…" for every row), and a snapshot taken before completion propagated shows the "Not Started" default. A hard refresh resolves it.
- **Simmy Mthalane is the genuine anomaly:** her Mid-Year completed & HR-verified earlier today (report `mid-year-assessment-simmy.md`, Ref PR2026/7335; the dashboard Completed count went 0→1 at the time) yet the employee list now shows **Not Started**, and she is excluded from the current Completed=2 rollup (which is Lungile + Sanele). So Simmy appears to have **regressed from a completed state**. Root cause is a dev/DB question — candidates: a status-rollup defect for the happy-path completion, or a QA-data touch on Simmy's record between the two runs. Not reproduced on Lungile (identical happy path completed today).

## Technical notes / gotchas
- **Score→% display quirk (repeat of Simmy):** with all activities at 3, the **Own Score overall column showed 100%** while **Supervisor/Agreed settled at the correct score-based value** once all 4 KRAs were scored. The Own-column % appears to mis-calculate; treat Agreed as authoritative.
- **KRA save can silently drop:** after scoring KRA 4 in the supervisor "Rate Key Activities" modal and clicking Save, the KRA-4 Supervisor Score came back **empty** in the table (Sign stayed disabled with no visible error). Re-opening the modal (values still showed 3/3), re-selecting and Save-ing again persisted it. Worth watching — a save race that fails silently.
- **Page-level comment fields need a real input event:** setting the Supervisor Comments value via a scripted property-setter did NOT satisfy the Sign enable-gate; a real click+type into the field did. (Modal per-activity comment dialogs accepted the scripted set fine — the difference is the page-level form's validation binding.)
- Heavy but non-fatal `executeScriptSync` console noise (40+) on the supervisor screen; stray "Test" banner as elsewhere.

## Environment
- Employee/supervisor pwd `123qwe`. Lungile's supervisor/mediator = **Babalwa M** (`BabalwaM`). Mid-Year HR = `GOV005` (Andrew) / `EMP001234` (Sarah).
- Evidence: `lungile-midyear-awaiting-persal.png` (AWAITING PERSAL SYNC badge).
