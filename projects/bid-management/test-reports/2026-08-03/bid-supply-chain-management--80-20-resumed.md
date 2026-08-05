# Report: Test Plan: BID-SCM — BID: Supply Chain Management — 80/20 (resumed chain)
**Date:** 2026-08-03 08:39 UTC
**Variant:** 80/20
**Plan:** test-plans/tender-process/bid-supply-chain-management.md
**Spec:** test-plans/tender-process/bid-supply-chain-management.spec.ts
**Execution Mode:** playwright-script (chain resumed across 4 invocations; one spec repair)
**Result:** PASSED
**Duration:** 1766.4s total across all invocations
**Tender:** REF2026-0811 — "TC-01 Automated Draft Tender run-mscxw8dm - 80/20 Compulsory Hybrid"

> **Why this report exists alongside `bid-supply-chain-management--80-20.md`.** That report is the honest
> record of the *first* invocation, which halted at TC-09 under `STRICT_CHAIN=1`. The chain was then
> resumed on the same tender rather than rebuilt, so no single runner invocation covers TC-01 → TC-16.
> This report consolidates the four invocations. **It is hand-written, not runner-generated.**

## Summary
| Total Steps | Passed | Failed | Skipped |
|-------------|--------|--------|---------|
| 16 | 16 | 0 | 1 (TC-17, by design) |

**REF2026-0811 completed the full 80/20 lifecycle** — draft → approved → published → 3 supplier responses
consolidated → compliance verified → specific-goal points → BEC invited / attendance confirmed / scored →
calibration → BEC recommendation → BAC outcome → approval → appointment letter → **AWARDED, purchase order
captured, item left the inbox.**

## Invocations
| # | Time (UTC) | Scope | Outcome |
|---|---|---|---|
| 1 | 08:00–08:10 | full plan, `STRICT_CHAIN=1` | TC-01→TC-08 pass (TC-08 flaky ×1); **TC-09 failed ×2 → run halted**, TC-10→TC-17 skipped |
| 2 | 08:14–08:24 | `--grep TC-09` | **failed ×3 — regression in a newly added guard** (see below). No data written. |
| 3 | 08:29–08:32 | `--grep TC-09` | **passed** (96s) after the guard was corrected |
| 4 | 08:33–08:39 | `--grep TC-1` | TC-10→TC-16 pass (TC-14 flaky ×1); TC-17 skipped |

## Step Results
| TC | Result | Duration | Note |
|---|---|---|---|
| TC-01 Draft Tender | PASS | 31.1s | |
| TC-02 Review and Approve | PASS | 21.8s | |
| TC-03 Publish Tender | PASS | 12.3s | |
| TC-04 Consolidate Supplier Responses | PASS | 122.5s | |
| TC-05 Review Compliance | PASS | 45.7s | |
| TC-06 Capture Pricing and Specific Goals | PASS | 18.8s | |
| TC-07 Invite BEC Members | PASS | 20.9s | |
| TC-08 Confirm Attendance & Open Evaluation | PASS | 77.6s | flaky ×1 — attendee picker option not found in 8s |
| TC-09 Capture Functionality Score | PASS | 96.0s | passed only after the spec repair below |
| TC-10 Monitor Evaluation / Begin Calibration | PASS | 12.8s | |
| TC-11 Monitor Calibration / Finalise Scoring | PASS | 13.9s | |
| TC-12 BEC: Finalise Recommendation | PASS | 15.7s | |
| TC-13 Capture Outcome of the BAC | PASS | 13.1s | |
| TC-14 Approve Recommendation From BAC | PASS | 16.0s | flaky ×1 — `page.goto(/login)` timed out at 30s |
| TC-15 Compile and Upload Appointment Letter | PASS | 51.9s | |
| TC-16 Capture Order Details | PASS | 26.3s | |
| TC-17 Send Back for rework (negative) | SKIP | — | by design: TC-02 consumes the Review-and-Approve stage |

## Spec repair — `scoreSupplier()` idempotence guard

**Problem it solves.** `scoreSupplier()` had no already-scored guard. A supplier whose score is finalised no
longer offers an **Evaluate** button — the row shows the score and a **View** link. So when a transient
failure hit mid-loop, the retry restarted at evaluator 1 / supplier 1, met an already-finalised supplier and
could never pass. That is how invocation 1's recoverable blip (the `TEC-01` edit pencil not appearing inside
the evaluation dialog) became a permanent chain-halting failure. `addSupplierResponse()` in TC-04 has had
this guard for a while, which is why TC-04 survives its flakes and TC-09 did not.

**The first version of the guard was wrong** and is recorded here because the failure mode is a trap in this
app. It used `filter({ hasText: 'View' })` to detect an already-scored row, then tested `isVisible()` on the
**row**. `hasText` is a case-insensitive substring match over `textContent` and therefore **matches hidden
text**, and this form family leaves conditionally-hidden controls mounted (cf. the latent duplicate
*Cancel Tender* in TC-19 and the orphaned hidden *Motivation* textarea in TC-26). An unscored row still
carries a mounted-but-invisible *View* link, so every supplier was reported "already finalised" and
**nothing was scored** — 3/3 attempts, while Thabitha's BOXFUSION row plainly showed *Evaluate*.

**Corrected guard** decides on the visibility of the row's own controls: skip only when *Evaluate* is **not
visible** and *View* **is visible**. Verified by the `[SCORE]` log in invocation 3 — A & A Stationers and
Telkom skipped as already finalised, BOXFUSION scored, then the backup evaluator scored fresh.

> **Generalisable rule:** in this app, never infer whether a control exists from what `filter({ hasText })`
> matches. Check `isVisible()` on the control itself. Same conclusion as the 2026-07-30 retraction of the
> "the picker only offers X" claims, reached by a different mechanism.

## Environment — connectivity degraded during this run

Four flakes today, all "not found after a server round-trip", and one of them is unambiguous:

| TC | Symptom |
|---|---|
| TC-04 (90/10 run) | `Telkom` absent from the supplier search |
| TC-08 | attendee picker option absent |
| TC-09 attempt 1 | `TEC-01` criterion edit pencil absent inside the dialog |
| TC-14 | **`page.goto` to `/login` timed out after 30s**, retried 70s, failed |

TC-14 could not load the login page at all — that is network, not application. The office connection was
reported as unreliable during this session, and these results are consistent with it. **None of the four is
being logged as an application defect.** Runs on a degraded link should use `RETRIES=2 MAX_FAILURES=0`
rather than `STRICT_CHAIN=1`.

## Incidental findings (not causes of any failure above)

1. **`RfxResponseEvaluation/Crud/GetAll` → 400 on the Capture-Functionality-Scores page.** The My Score
   table's data query fires before the page resolves its own ids, sending empty strings for both:
   ```
   filter={"and":[{"==":[{"var":"evaluatorPanelMember.member.user.id"},""]},
                  {"==":[{"var":"response.rfx"},""]}, ...]}
   ```
   A correct 200 follows once the ids resolve, so the page self-heals and a user would not normally notice —
   but it is a load-order race, and on a slow link it is the kind of thing that widens into a visibly empty
   table. Evidence: Playwright trace, invocation 2, retry 2.
2. **`Metadata/Get?container=Boxfusion.BidManagement.Domain.Tenders.Tender` → 404, three times**, on the
   Capture-Functionality-Scores page. This is the same stale pre-rename namespace behind the dead
   *Disapprove* (TC-20) and *Bid is non-responsive* (TC-26) buttons — so the mis-binding is reached from more
   pages than those two forms. Harmless here (the page renders), but it widens the scope of that defect.

## Notes
- `RUN_REF=REF2026-0811` pinned every resumed invocation, so no stage could drift onto a leftover tender
  (the trap recorded in `playwright-worker-restart-resets-chain-state`).
- Invocations 2–4 ran with `--no-report`, so the runner-generated `--80-20.md` report was left untouched.
- **A clean single-invocation 80/20 run is still wanted** for a runner-generated, publishable report and a
  matching Allure artefact; this resumed chain proves the app path but cannot produce one.
