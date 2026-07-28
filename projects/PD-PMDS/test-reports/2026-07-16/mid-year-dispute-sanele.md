# PMDS SL 1-12 — Mid-Year Assessment RESOLVED-DISPUTE path (Sanele Sithole)

**Date:** 2026-07-16
**Cycle:** SL 1-12 Performance Agreement, FY2026/27 — **Mid Year Assessment** stage
**Employee:** Sanele Sithole (`SaneleS`), **Ref PR2026/7333**
**Result:** ✅ PASS — full Mid-Year **resolved-dispute** chain completed to **Completed**.
**Purpose:** deliberately create a supervisor/employee score disagreement on the Mid-Year assessment to check whether the resolved-dispute "Update … with Outcomes" **Submit** breaks the way Contracting's does.

## Headline finding
**The Mid-Year dispute path does NOT have the Contracting Update-Submit bug.** Every "Update/Review with Outcomes" Submit worked on the first click. The broken Submit is **specific to Contracting's `sagov-performanceagreement-wf-updateperformanceagreement (v43)` form** — the Mid-Year equivalents submit fine.

## Steps executed (live, headed)
1. **Employee Self-Assessment** (`SaneleS`): rated all 8 key activities **3** (+ comment each) → Own overall 75%; page-level Employee Comments; Submit → Review.
2. **Supervisor Review — create disagreement** (`LungileN`, `sagov-supervisor-review-performance-assessment`): on **KRA 1 / "Provide weekly progress updates"** set **Supervisor Score = 2** vs Sanele's Own = 3. When Supervisor ≠ Own, an inline **Agreed Score** dropdown appears and is **required** → set to 2. A score of **2** also required a **comment + attachment** (`mediation-outcome.txt`) — same rule as the employee side. Other activities scored 3 (auto-agree). Added page-level Supervisor Comments, then **Refer for dispute** (comment-gated confirm) → routed to **Babalwa M** (mediator), status **Under appeal**.
3. **Mediator — resolved** (`BabalwaM`, `sagov-performancereview-mediatorreviewdisagreement v31`): "Review disagreement and attempt to resolve" → **"The disagreement has been resolved"** → Submit → routed **back to the employee** as an "Update" task.
4. **Employee "Update Performance Assessment with Outcomes"** (`SaneleS`, `sagov-performancereview-update-performance-assessment v33`): **Submit ENABLED immediately** after ticking the single Confirmation checkbox (no sub-tab cycling needed). Clicked once → **processed and cleared from inbox**. ✅ (This is the exact analog of the broken Contracting step — here it works.)
5. **Supervisor "Review Performance Assessment with Outcomes"** (`LungileN`, `sagov-performancereview-supervisor-update-performanceassessment v30`): one enabled Confirmation checkbox gated Submit; ticked → **Submit** worked → routed to HR.
6. **HR Verify** (`GOV005` = **Andrew Smith**, `sagov-performancereview-verifyperformanceassessment v32`): Confirmation checkbox → **Verify** → task cleared → **Completed**.

## Key findings
- **No Update-Submit bug on Mid-Year.** Contrast with `projects/PMDS/test-reports/bugs/2026-07-16-update-pa-with-outcomes-submit-fails.md` (Contracting). Useful dev signal: the defect is form-config-specific to the Contracting update form, not systemic to the dispute workflow.
- **Score-disagreement handling on Mid-Year:** an inline required **Agreed Score** dropdown surfaces on any activity where Supervisor ≠ Own; matching activities auto-agree. A **"Refer for dispute"** button is also available (enabled after the supervisor comment).
- **Resolved-dispute routing (Mid-Year):** mediator-resolved → employee **Update with Outcomes** → supervisor **Review with Outcomes** → **HR Verify** → Completed. (Contracting's resolved tail is blocked at the employee Update step by the v43 bug.)
- Scoring rules unchanged: rating 1/2/4 needs comment + attachment; 3 needs comment only.
- Same non-fatal `executeScriptSync` console noise + stray "Test" banner as elsewhere.

## Environment
- Employee/supervisor/mediator pwd `123qwe`. Mediator = `BabalwaM`. Mid-Year HR = `GOV005` (Andrew) / `EMP001234` (Sarah), pwd `123qwe`.
- Inbox `dynamic/Shesha.Workflow/workflows-inbox`; tasks via `shesha/workflow-action?id=<id>&todoid=<todoId>`.
