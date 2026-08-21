# Test Plan: NPO-15C-F — E&A Dashboard & Analytics (admin, functional)

> **Status:** Imported from Azure DevOps 2026-08-18 — 4 admin cases (ADO suite 107354). Read-only analytics over the
> E&A libraries; cross-validates the engagement counters seen on the public suite 15E. UI-only.
> **Owner:** QA
> **Last Updated:** 2026-08-18
> **Estimated Duration:** 600s

## Metadata
| Field | Value |
|-------|-------|
| App URL | Admin: https://dsd-npo-adminportal-qa.shesha.app/login (Dashboards → Education & Awareness) |
| Environment | QA |
| Login As | mpenduloizwelinuk@gmail.com / 123qwe (broad admin) |
| Lead tester | **Thabiso Kegakwile** |
| ADO Suite | 107354 — *15C E&A Dashboard & Analytics (Admin)* (4 cases) |

## Objective
> Verify the E&A dashboard: per-library engagement aggregates (views/likes/downloads), content-level drill-down,
> library + time-range filters, and a rough page-load time.

## 🔑 Context
- 15E showed content detail counters **Downloads / Views / Comment** (no Like control). The dashboard's "likes"
  aggregate is a useful cross-check — RECORD whether a likes metric exists at all given no Like button on the portal.
- ⚠️ QA has ~6-7 libraries, not the production volume TC-04 assumes — treat the perf check as an approximation.

## Test Cases

### TC-01 — Dashboard shows libraries + engagement aggregates (ADO #107384 · TC-15C-001)
*P2 · Src:FDS · Admin.* ✅ Runnable (observation).
- **Steps:** 1. Open the E&A Dashboard.
- **Assertions:** [ ] libraries listed · [ ] per-library **views + likes + downloads** aggregates shown · [ ] RECORD
  whether a likes metric exists (portal has no Like button — see 15E).

### TC-02 — Content-level drill-down (ADO #107385 · TC-15C-002)
*P2 · Src:FDS · Admin.* ✅ Runnable.
- **Steps:** 1. Click a library on the dashboard.
- **Assertions:** [ ] drill-down lists content items with per-item views/likes/downloads.

### TC-03 — Filter by library + time range (ADO #107386 · TC-15C-003)
*P2 · Src:FDS · Admin.* ✅ Runnable.
- **Steps:** 1. Apply filter library=Y, time=last 30 days.
- **Assertions:** [ ] aggregates recompute to the matching content + window · [ ] RECORD available filter controls.

### TC-04 — Dashboard load time (ADO #107387 · TC-15C-004)
*P2 · Src:Code · Admin.* ⚠️ Approximation (QA lacks production volume).
- **Steps:** 1. Open Dashboard; time first paint / counters populated.
- **Assertions:** [ ] RECORD load time · [ ] no slow-query timeout. **NB:** precondition (100 libraries × 10 items,
  1000 users, 30 days history) is not met on QA — record as indicative only.

## Coverage against ADO
| Plan case | ADO | TC id | Runnable? |
|---|---|---|---|
| TC-01 | #107384 | TC-15C-001 | ✅ |
| TC-02 | #107385 | TC-15C-002 | ✅ |
| TC-03 | #107386 | TC-15C-003 | ✅ |
| TC-04 | #107387 | TC-15C-004 | ⚠️ approx |

**4 cases owned.**

## ADO anchors (machine-read — do not delete)
- ADO #107384 · TC-15C-001
- ADO #107385 · TC-15C-002
- ADO #107386 · TC-15C-003
- ADO #107387 · TC-15C-004

---

## ✅ Executed 2026-08-18 — dashboard + drill-down PASS; no time/library filter; no Likes metric
Report: `test-reports/2026-08-18/15c-dashboard-analytics-functional--admin.md`

| Case | Verdict | Note |
|---|---|---|
| TC-01 (TC-15C-001) | ✅ PASS (note) | libraries+counts, per-content views/downloads/comments, aggregates 11/10/4. **No Likes metric** |
| TC-02 (TC-15C-002) | ✅ PASS | tile drill-down → per-item views/downloads/comments; cross-validates 15E; Expired items hidden publicly |
| TC-03 (TC-15C-003) | 🔴 FAIL | **no time-range/library filter**; drill-down doesn't recompute the (global) aggregates |
| TC-04 (TC-15C-004) | ✅ PASS (indic.) | load ~374ms, well under 3s — but QA lacks production volume; scale not validated |

🔑 Dashboard URL `/dynamic/education-and-awareness-dashboard`. Cross-checks: our "QA Test Library (synthetic)"=0
(confirms 15B upload blocker); Non-Membership doc downloads=2 (matches 15E); **no Likes** anywhere (matches no Like
button). Divergences: no filter/time controls + aggregates are global not filtered.
