# Report: NPO-13-F — Voluntary Deregistration (submitter wizard)

**Date:** 2026-08-18 12:55 UTC
**Plan:** test-plans/deregistration/13-voluntary-deregistration-functional.md
**Execution Mode:** ai-repair
**Result:** PASSED — 3 of 3 runnable submitter cases pass (1 with a note); admin cases deferred to protect our test NPO
**Duration:** ~500s
**Cases:** TC-13-003, TC-13-004, TC-13-006
**Assessed-not-executed:** TC-13-009, TC-13-011, TC-13-012, TC-13-013
**Environment:** QA · public portal · registered NPO **333-019** (`4be65ab5-…`)

## Summary
| Runnable now | Passed | Deferred/Blocked |
|---|---|---|
| 3 | 3 | 4 |

| Case | Title | Verdict |
|---|---|---|
| TC-13-003 | Severance type options present | ✅ PASS |
| TC-13-004 | OB search restricted to this NPO | ✅ PASS |
| TC-13-006 | Effective-date validation | ✅ PASS (note: no future cap) |
| TC-13-009 | Admin detail view | ⏸ deferred — needs a submitted dereg |
| TC-13-011 | Insufficient docs → notice + 30-day clock | ⏸ deferred — needs a submitted dereg |
| TC-13-012 | No resubmission in 30 days → denied | ⛔ blocked — 30-day clock |
| TC-13-013 | Resubmitted still insufficient → denied + investigation | ⏸ deferred — resubmission cycle |

## ✅ TC-13-003 — Severance type options
The Voluntary Deregistration wizard (3 steps: Guideline → Deregistration Details → Declaration and Documents) exposes a
**"Type of severance"** radio with **"Voluntary Deregistration"** and **"Dissolution Winding Up"**. Both required
options present. 📌 Label variance: the build reads *"Dissolution Winding Up"* where the case says
*"Dissolution/Winding-up"* (no slash) — cosmetic.

## ✅ TC-13-004 — OB search scoped to this NPO
The **Office Bearer** picker on 333-019 lists only its own three OBs — **Ryno Koen, Sipho Ndlovu, Thandi Mokoena**.
Searching **"Threemember"** (an office bearer of a *different* NPO, the 08-18 fresh app APPL26-01482) returns **"No
data"**. So the search is correctly restricted to this NPO's office bearers; OBs of other NPOs are not searchable.
Both assertions met.

## ✅ TC-13-006 — Effective-date validation (with a note)
The **Effective date** picker **disables all past dates** — on Aug 2026, days 1–17 are disabled and 18 (today) onward
are enabled. So a past effective date cannot be chosen. 🔴 **But there is no far-future limit:** navigating to Aug 2028
shows **0 disabled cells** — any future date is accepted. The case anticipates validation for dates "far in the future"
too; that upper bound is not enforced. ▶ **BA question:** is a maximum future effective date intended?

## ⏸/⛔ Deferred & blocked (with reasons)
- **TC-13-009** (admin detail view) and **TC-13-011** (insufficient → notice + 30-day clock) need a **submitted**
  deregistration. Submitting one runs the deregistration workflow on **333-019**, our main test NPO (used by the
  annual-compliance, change-request and linking suites), so it was **not submitted** to avoid disrupting those. The
  wizard was left as an un-submitted draft. ▶ Re-run on a disposable registered NPO.
- **TC-13-012** — ⛔ 30-day clock; needs system-clock control.
- **TC-13-013** — needs a full resubmission cycle after an insufficient outcome; chains off TC-13-011.

## Observations for the test lead
1. **No upper bound on the deregistration effective date** (past is blocked, future is unlimited) — confirm intended.
2. Label: *"Dissolution Winding Up"* vs the FDS *"Dissolution/Winding-up"*.
3. To finish 13A (admin) we need a **disposable registered NPO** to submit a deregistration against, plus (for 012)
   clock control.

## Method notes
- 🔑 Deregistration entry: registered-NPO landing → **Voluntary Deregistration** → `portal-deregistration-table` →
  **Initiate Voluntary Deregistration** → 3-step wizard.
- 🔑 OB-scoping proven by searching an OB known to belong to a *different* NPO and getting "No data".
- 🔑 Left the wizard as an un-submitted draft to protect 333-019; no deregistration was submitted.
