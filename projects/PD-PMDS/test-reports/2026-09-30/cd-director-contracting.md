# PMDS Chief Director/Director Performance Agreement — Contracting, 2 positive + 2 negative

**Date:** 2026-09-30
**Cycle:** Chief Director/Director Performance Agreement, FY2026/27 — **Contracting** stage
**App:** HCM Admin Portal (PMDS module) — https://pd-hcm-adminportal-qa.shesha.app/ (QA)
**Execution Mode:** hybrid
**Refs:** PA2026/8478 (Tania Smith) · PA2026/8480 (Babalwa M) · PA2026/8488 (Sampha Sampha) · PA2026/8482 (Kavitha Naidoo)
**Result:** PARTIAL — 3 of 4 completed to Generate PERSAL Input; Tania Smith BLOCKED at HR Verify (ownerless task, recurring)

## Context

Contracting was **NOT STARTED** (16 / 16 / 0 / 0) after a site data reset; admin opened it live (Submission
30/09/2026, Closing 31/10/2026, initiate immediately) → `16 Total / 0 Not Started / 16 In progress`. HR verifier
for this run, as specified by the test lead: **`KaraboM`** (`123qwe`). Driven live, **headed**.

| Employee | Login | Workflow | Status reached |
|---|---|---|---|
| Tania Smith | `Tester97` | Positive 1 — Thando Zide Sign → KaraboM Verify | **HR Review — BLOCKED** 🚧 |
| Babalwa M | `BabalwaM` | Positive 2 — Sampha Sign → KaraboM Verify | **Generate PERSAL Input** ✅ |
| Sampha Sampha | `Sampha` | Negative 1 — Tania Refer → Thando Zide resolved → Update → Tania Review Updated → KaraboM Verify | **Generate PERSAL Input** ✅ |
| Kavitha Naidoo | `Gov012` | Negative 2 — Naledi Khumalo (`GOV022`) Refer → Babalwa not resolved (comment + attachment) → Sampha tier-2 resolved → Update → Naledi Review Updated → KaraboM Verify | **Generate PERSAL Input** ✅ (resumed after memory kill) |

## Final cycle state
`16 Total · 0 Not Started · 13 In progress · 3 Completed`.

## 🚧 Recurring defect — ownerless HR-verify task on Tania Smith's agreement
After Thando Zide signed PA2026/8478, no *Verify Performance Agreement* task appeared for KaraboM within
90s, and a re-check at the end of the run (well after the Sign) still found none in the KaraboM, SalesHR or
NaleliM inboxes. This is the **second consecutive run** (2026-09-28: PA2026/8149) where Tania Smith's CD/D
agreement, and only hers, lands ownerless at HR Review while the other three CD/D records route to KaraboM
correctly — pointing to a data/assignment condition tied to this employee record rather than intermittent
routing. No admin-UI path exists to reassign another user's task; needs workflow-owner intervention on PA2026/8478.

## Observations
- Kavitha's run was interrupted by a host out-of-memory kill after tier-2 resolution; resuming from the inbox
  completed the chain normally. Environment interruption, not a defect.
