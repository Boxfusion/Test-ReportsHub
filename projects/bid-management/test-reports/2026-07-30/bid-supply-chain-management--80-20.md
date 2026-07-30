# Report: Test Plan: BID-SCM — BID: Supply Chain Management — 80/20
**Date:** 2026-07-30 11:34 UTC
**Variant:** 80/20
**Plan:** test-plans/tender-process/bid-supply-chain-management.md
**Spec:** test-plans/tender-process/bid-supply-chain-management.spec.ts
**Execution Mode:** playwright-script
**Result:** PASSED
**Duration:** 453.2s

## Summary
| Total Steps | Passed | Failed | Skipped |
|-------------|--------|--------|---------|
| 16 | 16 | 0 | 0 |

## Step Results
### TC-01: Draft Tender
**Mode:** playwright-script
**Duration:** 44.1s
- [PASS] TC-01: Draft Tender

### TC-02: Review and Approve
**Mode:** playwright-script
**Duration:** 22.2s
- [PASS] TC-02: Review and Approve

### TC-03: Publish Tender
**Mode:** playwright-script
**Duration:** 13.5s
- [PASS] TC-03: Publish Tender

### TC-04: Consolidate Supplier Responses
**Mode:** playwright-script
**Duration:** 121.9s
- [PASS] TC-04: Consolidate Supplier Responses

### TC-05: Review Compliance
**Mode:** playwright-script
**Duration:** 42.4s
- [PASS] TC-05: Review Compliance

### TC-06: Capture Pricing and Specific Goals
**Mode:** playwright-script
**Duration:** 19.5s
- [PASS] TC-06: Capture Pricing and Specific Goals

### TC-07: Invite BEC Members
**Mode:** playwright-script
**Duration:** 22.1s
- [PASS] TC-07: Invite BEC Members

### TC-08: Confirm Attendance & Open Evaluation
**Mode:** playwright-script
**Duration:** 24.5s
- [PASS] TC-08: Confirm Attendance & Open Evaluation

### TC-09: Capture Functionality Score
**Mode:** playwright-script
**Duration:** 46.6s
- [PASS] TC-09: Capture Functionality Score

### TC-10: BEC Secretariat: Monitor Evaluation and Begin Calibration
**Mode:** playwright-script
**Duration:** 11.6s
- [PASS] TC-10: BEC Secretariat: Monitor Evaluation and Begin Calibration

### TC-11: BEC Secretariat: Monitor Calibration and Finalise Scoring
**Mode:** playwright-script
**Duration:** 12.8s
- [PASS] TC-11: BEC Secretariat: Monitor Calibration and Finalise Scoring

### TC-12: BEC: Finalise Recommendation
**Mode:** playwright-script
**Duration:** 13.3s
- [PASS] TC-12: BEC: Finalise Recommendation

### TC-13: Capture Outcome of the BAC
**Mode:** playwright-script
**Duration:** 12.0s
- [PASS] TC-13: Capture Outcome of the BAC

### TC-14: Approve Recommendation From BAC
**Mode:** playwright-script
**Duration:** 11.7s
- [PASS] TC-14: Approve Recommendation From BAC

### TC-15: Compile and Upload Appointment Letter
**Mode:** playwright-script
**Duration:** 15.1s
- [PASS] TC-15: Compile and Upload Appointment Letter

### TC-16: Capture Order Details
**Mode:** playwright-script
**Duration:** 13.2s
- [PASS] TC-16: Capture Order Details

---

## Run context

**Tender under test:** **REF2026-1014** — `TC-01 Automated Draft Tender run-<tag> - 80/20 Compulsory Hybrid`
(the per-run tag isn't captured in this run's logs: the `[CHAIN]` line prints the name *before* it is
assigned, so it logged empty — fixed in the spec for subsequent runs).
Driven from draft to **completed lifecycle** in one invocation: Draft → Review & Approve → Publish
(Advertised) → Consolidate 3 supplier responses → Verify Compliance → Calculate Specific Goal Points →
Invite BEC → Confirm Attendance & Open Evaluation → 3 evaluators × 3 functionality scores → Begin
Calibration → Finalise Scoring → BEC Recommendation → BAC Outcome → Approve from BAC → Appointment
Letter (**Awarded**) → Capture Order Details (item leaves the inbox).

This is the **first 16/16 on the 80/20 variant**, and the first clean full-chain pass since the suite was
revived on 2026-07-29 (previous best: 11/12 and 11/13 on partial 90/10 resumes).

## Earlier invocation the same day — 14/16, and why that number was WRONG

A first 80/20 attempt (REF2026-0999, 11:09 UTC) reported 14 passed / 2 failed. **That result is not
trustworthy and is superseded by this run.** TC-04 failed, and Playwright then **recycled the worker
process** — which re-imported the spec module and wiped the in-memory `RUN_REF`. `tenderMatch()` fell back
to the generic name `'TC-01 Automated Draft Tender'`, so TC-05 → TC-16 each opened whatever unrelated
LEFTOVER tender happened to sit at their stage and "passed" against it. Proof: TC-08's failure snapshot
shows **Tender Number REF2026-0901, Evaluation Criteria 90/10** on a page offering *Begin Calibration*,
while our own REF2026-0999 sat untouched at *Consolidate Responses* (verified in the Inbox afterwards).
REF2026-0901 — yesterday's part-filled 90/10 tender — was advanced to completion as a side effect.

## Fixes made before this run (all in the spec + plan)

1. **TC-04 — the Add-Response Supplier dropdown is PAGED.** It renders only the first 10 suppliers
   alphabetically (A & A Stationers → PHINGOSHE HOLDINGS). **Telkom is not on page 1**, so the option
   click timed out after 15 s once the supplier master data grew past 10 entries. Now the spec **types
   the name to filter server-side** (searching the longest word — `Stationers`, not `A & A `).
2. **TC-04 — the idempotence guard raced the table.** The "already captured?" check had no timeout and
   fired before the Manual Responses table hydrated, so a resumed run re-added an existing supplier. It
   now waits for the table body/placeholder first. *(App behaviour worth noting: submitting a duplicate
   supplier response leaves the dialog open with **no error message at all** — see below.)*
3. **TC-08 — "Is Present?" is now MANDATORY to add an attendee** (confirmed by the test lead, and by this
   run passing). `addBecEvaluator(..., markPresent)` ticks it in the add-row before committing. The step
   is a hard blocking assertion again.
4. **Chain pinning now survives a worker restart.** TC-01 persists its REF to
   `test-results/chain-ref.json` (cleared at TC-01 start, so a failed TC-01 can't leave a stale pin), and
   an unpinned chain now **throws** instead of silently matching any tender. `ALLOW_ANY_TENDER=1` opts
   back into the old generic-name behaviour for exploratory single-TC runs.

## Findings raised by this session

- **RESOLVED — "backup evaluator won't commit" (TC-08) was never a defect.** An attendee can only be
  added at Confirm Attendance if *Is Present?* is ticked; the plan step that added the backup as *absent*
  was stale. Finding #4 in
  [bugs/2026-07-29-finalise-compliance-action-fails.md](../bugs/2026-07-29-finalise-compliance-action-fails.md)
  is closed, and the 2026-07-29 soft-failure workaround has been removed.
- **NEW (app, needs dev confirmation) — every "Add New Response" dialog *open* creates TWO
  `RfxResponse` records.** From the TC-04 network trace: each dialog open fires
  `RfxResponse/Crud/Create` twice with two distinct `responseId`s, and both then receive
  `CreateResponseDocumentAsync` calls — including for a dialog that was **abandoned without submitting**.
  This is a plausible source of the long-standing "one supplier ×N" duplication. Not visible in the
  Manual Responses table, so it needs a DB/API-side check.
- **NEW (app, minor) — a duplicate supplier response fails silently.** Re-submitting a supplier that
  already has a response on the tender leaves the Add-Response dialog open with the fields still
  populated and **no validation message**. The spec now reports this explicitly instead of timing out on
  a bare `toBeHidden`.
- **Carried, still unverified — Stage 3 "Not Recommended" on the rank-1 supplier.** TC-13/14/15/16 note
  this suspected inverted flag; this run did not add evidence either way (the automated steps don't read
  the Recommendation Status column). Worth a manual look before the demo.

## Environment note

App URL is `https://pd-supplychainmanagement-adminportal-qa.shesha.app/login` (migrated 2026-07-29 from
the dead `linux-supplychainmanagement-adminportal-qa.azurewebsites.net`).

## Not ours

**REF2026-0996** ("TENDER2 negative scenario", the manual tester's) was **not touched** by any run today:
no TC matched its name, TC-04 was pinned to REF2026-0999 by REF (confirmed in the trace), and after the
runs it still sat at *Consolidate Responses / Advertised*. Its four responses are A & A Stationers
R10 000, BOXFUSION R5 000, Abathembu Event Management R20 000, ME General Trading R30 000 — none of which
match this suite's fixed prices (A & A **30000**, BOXFUSION **40000**, Telkom **50000**).
