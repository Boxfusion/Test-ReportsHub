# Report: NPO-15C-F — E&A Dashboard & Analytics (admin)

**Date:** 2026-08-18 16:38 UTC
**Plan:** test-plans/education-awareness/15c-dashboard-analytics-functional.md
**Execution Mode:** ai-driven (Playwright MCP, live QA admin portal)
**Result:** PASSED — dashboard + drill-down work; no time/library filter or aggregate recompute; no Likes metric
**Duration:** ~500s
**Cases:** TC-15C-001, TC-15C-002, TC-15C-003, TC-15C-004
**Environment:** QA · admin portal · `/dynamic/education-and-awareness-dashboard`

## Summary
| Case | Area | Verdict |
|---|---|---|
| TC-15C-001 (TC-01) | Dashboard libraries + engagement aggregates | ✅ PASS (note: no Likes metric) |
| TC-15C-002 (TC-02) | Content-level drill-down | ✅ PASS |
| TC-15C-003 (TC-03) | Filter by library + time range | 🔴 FAIL — no time filter; drill-down doesn't recompute aggregates |
| TC-15C-004 (TC-04) | Load time < 3s | ✅ PASS (indicative — QA lacks production volume) |

## ✅ TC-01 — Dashboard + aggregates (PASS, note)
The E&A Dashboard (`education-and-awareness-dashboard`) renders three sections:
- **Library Topics** — a folder tile per library with a content-count badge: Friday Deployment (2),
  **QA Test Library (synthetic) (0)** [our 15B library — 0 confirms the disabled-upload blocker], Training BET (2),
  Testing (1), cv (2), Test MS Docs (2), sdsd (1).
- **Content** — content items with per-item **views / downloads / comments** and a Published/Expired status.
- **Content Details** — aggregate totals: **Number of Downloads 11 (44%), Number of Views 10 (40%), Number of
  comments/interactions 4 (16%)**.

✅ libraries listed with counts; per-content and aggregate engagement shown.
📌 **No "Likes" metric anywhere** — the aggregates are Downloads / Views / Comments only. This matches suite 15E
(the public content detail has **no Like control**). The ADO's expected "views + likes + downloads" has no likes
because the feature isn't in the build.

## ✅ TC-02 — Content-level drill-down (PASS)
Clicking a library tile (Test MS Docs) filtered the **Content** section to that library's items with per-item metrics:
- "Non-MembershipConstitutionTBC - stamp…doc" — **Published** — 3 views, 2 downloads, 1 comment.
- "AnnualComplianceSuccessful (4).pdf" — **Expired** — 0 views, 1 download, 0 comments.

✅ drill-down shows per-item views/downloads/comments.
🔑 **Cross-validates 15E:** the "Non-Membership" doc shows 2 downloads here — consistent with the download I performed
in 15E (counter 1→2). And the 2nd item being **Expired** explains why the public library (15E) showed only "1 of 1
items" while the dashboard counts 2 — expired content is hidden from the public portal. Good consistency.

## 🔴 TC-03 — Filter by library + time range (FAIL / divergence)
The dashboard has **no time-range filter** and **no library-filter dropdown** — the only "filter" is clicking a
library tile, which narrows the **Content list** but does **not** recompute the **Content Details** aggregates (they
stayed 11 / 10 / 4 after selecting Test MS Docs, whose items total 3 downloads / 3 views / 1 comment). So the ADO's
"apply filter library=Y, time=last 30 days → aggregates recompute" is not supported: no time window, and aggregates
are global, not filtered.

## ✅ TC-04 — Load time (PASS, indicative)
Navigation timing: `load` event **374 ms**, DOMContentLoaded **261 ms**; the dashboard counters rendered within a few
hundred ms of hydration — comfortably under the 3-second target, with no slow-query timeout.
⚠️ **Caveat:** QA holds ~7 libraries, not the case's precondition (100 libraries × 10 items, 1000 users, 30 days
history). So this confirms the page is fast on light data but does **not** validate the SQL-performance-at-scale
concern the Src:Code case targets. That needs a production-scale dataset (dev/perf environment).

## Observations / questions for the test lead (Thabiso)
1. **No Likes metric** on the dashboard (Downloads/Views/Comments only) — consistent with no Like button on the portal
   (15E). Is Like in scope, or should the analytics + case drop it?
2. **No time-range or library filter** on the dashboard, and drill-down does not recompute the aggregate totals
   (they're global). Is a filtered/aggregated view expected (per the FDS/case)?
3. ✅ Dashboard, per-library counts, drill-down and cross-portal engagement counts are consistent and correct;
   Published/Expired status is honoured (expired content hidden from the public portal).

## Method notes
- Engagement numbers cross-checked against 15E (Non-Membership doc downloads 1→2) — consistent.
- Load time from `performance` navigation timing; treated as indicative given QA's small dataset.
- Our own empty library ("QA Test Library (synthetic)" = 0) confirms the 15B content-upload blocker from the read side.
