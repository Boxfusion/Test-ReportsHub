# BUG: Re-opening a PMDS process stage resets COMPLETED employees back to "Not Started"

**Date:** 2026-07-16
**Cycle:** SL 1-12 Performance Agreement, FY2026/27 — **Mid Year Assessment** stage
**Severity:** High — silent data/state loss on completed performance assessments
**Status:** Confirmed live; escalated (test lead engaging the dev)

## Summary
When the Mid-Year Assessment process is **closed and then re-opened** on the cycle's Manage Process tab, employees who had already **completed** their Mid-Year assessment (status **"Awaiting PERSAL sync"**) are **reset to "Not Started"**. Their completed assessment state is lost from the Employee-List status column and they drop out of the "Completed" rollup.

## Evidence / timeline (2026-07-16)
1. Drove three employees' Mid-Year to completion (HR-verified → **Awaiting PERSAL sync**):
   - Simmy Mthalane (PR2026/7335) — happy path (completed earliest)
   - Sanele Sithole (PR2026/7333) — resolved-dispute path
   - Lungile Nhleko (PR2026/7331) — happy path (completed last)
2. Observed on the cycle **Employee List → "Mid Year Assessment Status"** (read as `admin`, stable across repeated reads):
   - **Before this re-open:** Lungile = *Awaiting PERSAL sync*, Sanele = *Awaiting PERSAL sync*, **Simmy = Not Started** (Simmy already anomalous — consistent with an *earlier* close/re-open having caught only her).
3. Team then **closed and re-opened the Mid-Year process**.
4. **After the re-open:** **all three** (Simmy, Lungile, Sanele) now show **"Not Started"** — the completed/Awaiting-PERSAL-sync state was wiped for everyone.

## Expected vs actual
- **Expected:** Re-opening a process should (re-)initiate it for employees who have NOT completed, while **preserving** the state of employees already completed (Awaiting PERSAL sync / Completed) — or at minimum not silently discard completed assessments.
- **Actual:** Re-open blanket-resets **all** employees in the stage to "Not Started", including completed ones, losing their Awaiting-PERSAL-sync state.

## Impact
- Completed Mid-Year assessments (incl. HR-verified, dispute-resolved) are silently reverted, so PERSAL sync can be missed and employees would have to redo the whole chain.
- The "Completed" rollup on Manage Process under-reports true completion after any re-open.

## Notes
- Distinct from the Contracting "Update Performance Agreement with Outcomes" Submit bug (`2026-07-16-update-pa-with-outcomes-submit-fails.md`).
- The Employee-List Ref columns lazy-load ("Loading…" on every row); the Status column shows a "Not Started" default pre-refresh, so always hard-refresh before reading — but the post-re-open reset here was stable and reproduced across all three completed employees, not a stale-view artifact.
- Reports for the completed runs: `mid-year-assessment-simmy.md`, `mid-year-dispute-sanele.md`, `mid-year-assessment-lungile.md`.
