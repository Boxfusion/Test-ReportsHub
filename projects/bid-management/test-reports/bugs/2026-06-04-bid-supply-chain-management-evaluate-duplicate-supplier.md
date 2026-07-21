# Bug: Evaluate Tenders duplicates a single supplier on the functionality-scores table

- **Date:** 2026-06-04
- **Status:** ❌ NOT AN APP BUG — **test-harness-induced**. Resolved by a spec fix (2026-06-05). See Resolution below.
- **Module:** BID: Supply Chain Management (Bid Management) — ADO project `PD-SupplyChainManagement`
- **Environment:** QA — https://linux-supplychainmanagement-adminportal-qa.azurewebsites.net
- **Plan:** `projects/bid-management/test-plans/tender-process/bid-supply-chain-management.md`
- **Failing TC:** TC-10 — Capture Functionality Score (ADO #60821)
- **Page / form:** Evaluate Tenders → Capture Functionality Scores (`tender-wf-capturefunctionalityscores`), "My Score" table
- **Severity:** ~~Medium~~ → **Invalid (test artifact)**; residual app hardening note only (Open Evaluation not idempotent)
- **Category:** test-harness defect (our spec), NOT app business-logic

## RESOLUTION (2026-06-05) — controlled experiment: it was our test script

A controlled A/B against two freshly-created tenders settled it:

| Tender | How the chain clicked workflow buttons | `RfxResponseEvaluation` records for one evaluator |
|---|---|---|
| **REF2026-2271** | retry-click-until-advance loops (clicked **Open Evaluation** repeatedly on the slow app) | **totalCount 60** — all "Telkom", A&A/BOXFUSION absent → the "one supplier ×N" symptom |
| **REF2026-2324** | **single click** per action (loops removed) | **totalCount 3** — BOXFUSION, A & A Stationers, Telkom (one each) — **clean** |

The duplication was created by the **test harness**, not the app: nine TCs used an `expect(async () => { …click…; throw }).toPass()` pattern that **re-clicked** a workflow button every poll until the page navigated. On the slow QA site the first click's server action was still in flight, so the button got clicked many times; for **Open Evaluation** that created dozens of duplicate `RfxResponseEvaluation` rows. A human (and the user's manual tenders REF2026-2234 / REF2026-2241) clicks once → clean. Evidence screenshots: `projects/bid-management/REF2026-2271-functionality-scores-telkom-x10.png` (broken) vs `…/REF2026-2324-functionality-scores-3-distinct-clean.png` (fixed).

**Fix applied:** added a `clickOnceAndAwait()` helper (click once, then wait for navigation — never re-click) and routed all 9 retry-click loops (TC-07, 08, 09, 12, 14, 15, 16, 17, 18) through it. Re-run of TC-02→TC-09 single-click produced the clean 3-supplier result above.

**Residual (app hardening, low priority, NOT this bug):** "Open Evaluation" is not idempotent — repeated calls create duplicate evaluation records instead of being a no-op. Worth a server-side guard, but no real user hits it by clicking once.

**Separate, still-open app defect (unrelated to the above):** the Add-Response Supplier dropdown does not exclude already-captured suppliers (named tender REF2026-1172). Guarded by an opt-in TC-05 check (`CHECK_SUPPLIER_DEDUPE=1`).

---

_The sections below are the original 2026-06-04 investigation, retained for history. Their "app race-condition / row-generation" theories are **superseded** by the Resolution above._

## Update (2026-06-05, superseded) — REPRODUCED on a cleanly-consolidated tender; original theory stands

> **Correction:** an earlier 2026-06-05 note here claimed the duplication was caused by a missing
> dropdown-uniqueness guard / double-submit at the *consolidation* step. Fresh evidence below
> **disproves that as the cause of this symptom** — the duplication appears even when consolidation
> is provably clean. The original "row-generation" theory (Summary below) is the correct one.

Reproduced end-to-end on **REF2026-2271** (90/10), created and advanced entirely by the automated chain (TC-02 → TC-09):

- TC-05 consolidated **exactly three suppliers, one automated add each** (A & A Stationers, BOXFUSION, Telkom) — no multi-clicking, idempotency-guarded. The Consolidate Responses Manual-Responses table held **three distinct rows** (verified).
- Yet, logged in as evaluator **Nathi (Nkosinathi Sibiya)**, REF2026-2271's **Capture Functionality Scores → "My Score"** table renders **Telkom ×10** — **no A & A Stationers, no BOXFUSION**. Screenshot: `projects/bid-management/REF2026-2271-functionality-scores-telkom-x10.png`.
- Because consolidation was demonstrably clean (single adds, three distinct rows) and the duplication still appears, the defect is **in generating/displaying the per-supplier functionality-score rows**, *not* at supplier capture. This confirms the original Summary, and the "which supplier is duplicated varies per tender" tell (REF2026-2172 Telkom, REF2026-2187 A&A, now REF2026-2271 Telkom).

**Separate, related defect (do NOT conflate):** the Add-Response Supplier dropdown does *not* exclude already-captured suppliers (seen live on REF2026-2218; named tender **REF2026-1172 — "System allows the same supplier to be added more than once"**). That lets a *user* add duplicates by hand, but it is **not** what produced the REF2026-2271 symptom (which was consolidated cleanly by automation). It deserves its own fix (exclude added suppliers / reject duplicate on submit + disable button while saving), and TC-05 now carries a non-blocking regression guard for it.

**Fix direction (app side, this bug):** make the functionality-score "My Score" rows derive one row per *distinct* consolidated supplier response (de-dupe / fix the join that fans a single supplier into N rows).

## Summary
On the **Capture Functionality Scores** page, the **"My Score"** supplier table renders **one supplier repeated ~10 times** instead of the three distinct consolidated suppliers. Which supplier gets duplicated **varies between tenders** (classic race-condition tell). The upstream **consolidated Responses are correct** (all three suppliers present), so the duplication is introduced when the evaluation/score rows are generated or displayed — not in the consolidate data.

## Expected
The "My Score" table lists the **3 distinct suppliers** that were consolidated: **A & A Stationers, BOXFUSION, Telkom** — one row each, each with an **Evaluate** action.

## Actual
The table lists **one supplier repeated ~10 times**:
- **REF2026-2172** → **Telkom ×10** (no A&A, no BOXFUSION)
- **REF2026-2187** → **A & A Stationers ×10** (1 row scored "90 / View" + ~10 "Evaluate" rows; no BOXFUSION, no Telkom)
- **REF2026-2271** → **Telkom ×10** (no A&A, no BOXFUSION) — observed live 2026-06-05 as evaluator Nathi; consolidation was clean (3 distinct rows)

Because the other suppliers are absent, the evaluator cannot score them and the workflow is blocked at functionality scoring.

## Reproduction
- **Reproduces** on tenders consolidated by the automated chain — TC-05 adds A&A, BOXFUSION, Telkom (one clean add each, three distinct rows), evaluation is opened (TC-09), then the evaluator opens Evaluate Tenders → Capture Functionality Scores. Confirmed again 2026-06-05 on **REF2026-2271**.
- The 2026-06-04 note "does NOT reproduce manually (human pacing)" is unconfirmed against this row-generation defect — REF2026-2271 was consolidated cleanly (not rapid-fire; idempotency-guarded single adds) and **still** duplicated, so timing/pacing is not clearly the trigger. Needs a deliberate manual repro to settle whether it's evaluator/criteria-specific rather than pacing.
- Affected tenders observed: **REF2026-2172**, **REF2026-2187**, **REF2026-2271**.

## Evidence
- Screenshot (2026-06-05): `projects/bid-management/REF2026-2271-functionality-scores-telkom-x10.png` (REF2026-2271 — Telkom ×10 on the "My Score" table; consolidation was clean)
- Screenshot: `projects/bid-management/test-results/artifacts/projects-bid-management-te-ef063-Capture-Functionality-Score-chromium/test-failed-1.png` (REF2026-2187 — A&A ×10)
- Accessibility snapshot: `…/projects-bid-management-te-ef063-Capture-Functionality-Score-chromium/error-context.md` (shows `row "A & A Stationers Evaluate"` repeated ~10×)
- Playwright error: `expect(getByRole('cell', { name: 'A & A Stationers' })).toBeVisible()` / Telkom "Evaluate" button not found — the missing suppliers are genuinely absent from the table.

## Suspected cause
The query/join that builds the **functionality-score "My Score" rows** fans a *single* supplier across N rows instead of producing one row per distinct consolidated supplier response. The consolidated data is correct (REF2026-2271 had three distinct rows), so the fault is in row generation/display at the Capture Functionality Scores stage — not at supplier capture. Earlier framed as a timing race; the REF2026-2271 repro (clean, non-rapid consolidation) means it may instead be a deterministic join/grouping bug. Open question: why the duplicated supplier varies per tender (Telkom vs A&A) — points at an ordering/grouping key that isn't the supplier id.

## Impact — what happens if an evaluator proceeds anyway (observed 2026-06-05, REF2026-2271, evaluator Nathi)
Drove the broken "My Score" table live: clicked **Evaluate** on the first Telkom row, scored TEC-01 = **80**, saved, and clicked **Finalise Score**. Result:
- Row 1 now reads **Telkom 80** (with a View link); rows 2–10 stay **Telkom 0**, each still independently **Evaluate**. The 10 rows are **independent score records** — finalising one does **not** populate the others.
- **A & A Stationers and BOXFUSION never appear**, so they **cannot be scored at all** by this evaluator.
- Consequence: functionality scoring for this tender is unsound — one supplier can be scored up to 10 conflicting times while two legitimate suppliers are silently excluded. Any downstream BEC aggregation / ranking / recommendation built on this would be wrong (missing suppliers, ambiguous duplicate scores). Screenshot: `projects/bid-management/REF2026-2271-scored-one-telkom-others-zero.png`.

## Notes
- Distinct from the known/reported **"Not Recommended"** status bug on the BAC pages.
- The automated chain TC-02→TC-09 passes cleanly; the chain is blocked here by this app behaviour, not by the test.
