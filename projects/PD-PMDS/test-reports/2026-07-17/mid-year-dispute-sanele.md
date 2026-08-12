# PMDS SL 1-12 — Mid-Year Assessment negative/dispute path (Sanele Sithole)

**Date:** 2026-07-17
**Cycle:** SL 1-12 Performance Agreement, FY2026/27 — **Mid Year Assessment** stage
**Employee:** Sanele Sithole (`SaneleS`), **Ref PR2026/7345**
**Result:** PASSED — full Mid-Year **resolved-dispute** chain completed to **Completed**. No Update-Submit bug encountered (as expected on Mid-Year).
**App:** HCM Admin Portal (PMDS module), https://pd-hcm-adminportal-qa.shesha.app/ (QA)

## Purpose
Re-run the Mid-Year **negative (dispute)** scenario — deliberately create a supervisor/employee score disagreement and drive it through mediation and the resolved-dispute tail — to re-confirm the Mid-Year "Update … with Outcomes" **Submit** works (unlike Contracting's, which is bugged).

## Headline finding
**The Mid-Year dispute path again does NOT have the Contracting Update-Submit bug.** Both "Update with Outcomes" (employee) and "Review with Outcomes" (supervisor) Submits worked on the **first click** (enabled by the single confirmation checkbox alone). The broken Submit remains specific to Contracting's `sagov-performanceagreement-wf-updateperformanceagreement v43` form.

## Steps executed (live, headed)
1. **Employee Self-Assessment** (`SaneleS`, `sagov-employee-complete-self-assessment v37`): 4 KRAs (Deliver value for money / Provide timely & reliable customer service / Handle client queries with courtesy & professionalism / Ensure accessible & consistent service delivery), all 8 key activities rated **3** + comment each → Own overall (all-3s). Page-level Employee Comments → **Submit** → **Draft → Review**.
2. **Supervisor Review — create disagreement** (`LungileN`, `sagov-supervisor-review-performance-assessment v38`): on **KRA "Deliver value for money" / activity "Minimise waste and reuse resources in daily operations"** set **Supervisor Score = 2** vs Sanele's Own = 3. When Supervisor ≠ Own an inline **Agreed Score** dropdown appeared and was **required** → set to 2. Score 2 also required a **comment + attachment** (`mediation-outcome.txt`, uploaded via the row-level Attachment upload → real file-chooser, `browser_file_upload`). The KRA's second activity + all other KRAs scored 3 (auto-agree). Page-level Supervisor Comments added, then **Refer for dispute** (comment-gated confirm dialog: "You are about to refer for dispute. Please provide comments." → Ok) → routed to **Babalwa M** (mediator), status **Under appeal**.
3. **Mediator — resolved** (`BabalwaM`, `sagov-performancereview-mediatorreviewdisagreement`): "Review disagreement and attempt to resolve" screen with radios → **"The disagreement has been resolved"** → **Submit** → routed **back to the employee** as an "Update" task.
4. **Employee "Update Performance Assessment with Outcomes"** (`SaneleS`, `sagov-performancereview-update-performance-assessment v33`): single **Confirmation checkbox** enabled **Submit** → clicked once → **processed and cleared** ✅. (This is the exact analog of the broken Contracting step — here it works first try.)
5. **Supervisor "Review Performance Assessment with Outcomes"** (`LungileN`, `sagov-performancereview-supervisor-update-performanceassessment v30`): one confirmation checkbox gated Submit → ticked → **Submit** first try → routed to HR.
6. **HR Verify** (`GOV005` = **Andrew Smith**, `sagov-performancereview-verifyperformanceassessment`): Confirmation checkbox → **Verify** → task cleared → **Completed**.

## Key findings
- **No Update-Submit bug on Mid-Year** — contrast with `test-reports/bugs/2026-07-16-update-pa-with-outcomes-submit-fails.md` (Contracting). The defect is form-config-specific to the Contracting update form, not systemic to the dispute workflow.
- **Score-disagreement handling:** an inline required **Agreed Score** dropdown surfaces on any activity where Supervisor ≠ Own; matching activities auto-agree. A rating of **2** requires comment + attachment (same rule as the employee side). The **row-level Attachment upload uses a native file chooser** and binds correctly via `browser_file_upload` (unlike hidden-input injection) — attachment `mediation-outcome.txt (169 B)` registered.
- **KRA-level rollup vs activity-level:** the disputed KRA (activity scores 2 and 3) rolled up to a KRA-level display of 3/3, but the **activity-level Supervisor≠Own disagreement was correctly recorded** and was enough to enable "Refer for dispute" (after the page-level supervisor comment).
- **Resolved-dispute routing:** mediator-resolved → employee **Update with Outcomes** → supervisor **Review with Outcomes** → **HR Verify** → **Completed**.
- Score→% display quirk and non-fatal `executeScriptSync` console noise + stray "Test" banner as elsewhere.

## Dashboard reconciliation (Manage Process, Mid Year Assessment, end of run)
- Total 41 · Not Started 36 · In progress 3 · **Completed 2** (Sanele resolved-dispute + Simmy happy-path).

## Environment
- Employee/supervisor/mediator pwd `123qwe`. Supervisor = `LungileN`, Mediator = `BabalwaM`. Mid-Year HR = `GOV005` (Andrew) / `EMP001234` (Sarah).
- Inbox `dynamic/Shesha.Workflow/workflows-inbox`; tasks via `shesha/workflow-action?id=<id>&todoid=<todoId>`.
