# Report: BID-SCM — no supplier meets the functionality minimum (NEGATIVE, 80/20)
**Date:** 2026-07-30 18:05 SAST
**Variant:** 80/20
**Plan:** test-plans/tender-process/bid-supply-chain-management.md
**Cases:** TC-26
**Spec:** TC-01→TC-09 automated with the new `FUNC_SCORE_MODE=below` gate; TC-10→TC-12 driven live
**Result:** PARTIAL — ~~🔴 CRITICAL — a non-bidder was recommended and AWARDED the tender end to end~~ →
**RETRACTED 2026-08-03: the module test lead ruled that recommending a supplier which did not bid is BY DESIGN
when no bid qualifies.** Re-scoped to **🔴 2 defects** in that picker (each row ×10; already-evaluated bidder →
silent 500)
plus the separately-standing TC-26 defects. See the addendum and
`bugs/2026-07-30-non-bidder-can-be-recommended-when-no-bid-qualifies.md`.
**Tender:** **REF2026-1122** (purpose-built chain — the one new tender this session, unavoidable for this test)

## Summary
| Check | Result |
|---|---|
| Automated chain TC-01 → TC-09 with all scores below minimum | **9/9 passed, 6.7 min** |
| Functionality minimum is **60, inclusive** | **CONFIRMED** (60 = COMPLIANT, 59.5 = NON COMPLIANT) |
| `Above Minimum = No` computed for every below-minimum supplier | **PASS** |
| Final Evaluation table empty + no supplier pre-recommended | **PASS** — correctly filtered |
| TC-10 / TC-11 warn that nothing qualifies | 🔴 **FAIL** — no warning; both buttons enabled |
| **Bid is non-responsive** (the correct outcome) | 🔴 **DEAD** — same broken form as *Disapprove* |
| **Approve Recommendation** with a blank supplier | 🔴 **Submit becomes enabled** (not committed) |
| **Recommend another Supplier** options | 🔴 **A & A Stationers ×10** — a supplier that *failed* |

## Scores driven

Via a new **opt-in** `FUNC_SCORE_MODE=below` gate, so the documented happy-path scores in `EVALUATORS` are
untouched and the normal 16/16 chain is unaffected:

| Supplier | Nathi / Nelly / Maanda-awe / Thabitha | Average | Above Minimum |
|---|---|---|---|
| A & A Stationers | 50 / 52 / 51 / 48 | **50.25** | **No** |
| Telkom | 45 / 44 / 43 / 46 | **44.5** | **No** |
| BOXFUSION | 40 / 38 / 37 / 36 | **37.75** | **No** |

**The boundary question is settled as a by-product:** the minimum is **60 and inclusive** — an average of
exactly 60 read COMPLIANT on REF2026-0944, while 59.5 read NON COMPLIANT on REF2026-1053.

## What the app does

**What it gets right:** the exclusion arithmetic. `Above Minimum = No` is correct for all three, the Final
Evaluation table is legitimately **empty ("No Data")**, and **Recommended Supplier is blank** — no disqualified
bidder is smuggled through into the ranking.

**What it gets wrong:** everything after that.

1. 🔴 **No warning at TC-10 or TC-11.** *Begin Calibration* and *Finalise Scoring* are both enabled and advance
   normally. The secretariat clicks through two whole stages with nothing indicating that no bid qualified.
2. 🔴 **"Bid is non-responsive" is dead** — permanent loading spinner. The network trace is decisive:
   ```
   GetByName?name=tender-reason%20for%20disapproval  → 200
   Metadata/Get?container=Boxfusion.BidManagement.Domain.Tenders.Tender → 404
   ```
   **It reuses the exact form that breaks *Disapprove*.** One mis-bound form, two dead decisions on two
   different stages — so `bugs/2026-07-30-disapprove-hangs-metadata-404.md` has been **widened in scope**, and
   its impact is much worse than first filed: this is the *only correct outcome* for a non-responsive tender.
3. 🔴 **"Approve Recommendation" would approve nobody.** With the BEC Report filled, **Submit Recommendation
   becomes enabled while Recommended Supplier is blank.** *Not committed* — proven only to the point of the
   button enabling, since committing would have consumed the tender (see limitations).
4. ⚠️ **"Recommend another Supplier" — one real bug, one wrong conclusion (corrected).** The picker showed
   **"A & A Stationers" ×10** with identical option text *and* key: **the duplication is a genuine bug.**
   But I then concluded it was "the only option offered" — **wrong.** The picker is a **server-filtered
   search** and what I read was only **page 1**; you must type to find other suppliers. No conclusion about
   which suppliers are offered is supportable from that observation.
   My submit also used **A & A Stationers, a bidder already evaluated on this tender** — not a sensible use of
   the decision. It returned `RfxEvaluation/Crud/Update` → **500** `could not execute batch command` with **no
   message at all**. So the decision itself is **untested**; what stands is that **invalid input produces a raw,
   silent 500 instead of a validation message.**

**Net effect — all three decisions have now been driven to a conclusion (2026-07-30 evening):**

| Decision | Outcome |
|---|---|
| **Bid is non-responsive** (correct) | 🔴 **DEAD** — spinner, metadata 404, shared broken form with *Disapprove* |
| **Recommend another Supplier** | ⚠️ **Not validly tested** — invalid input (an already-evaluated bidder); returned a **silent 500**. See the correction below |
| **Approve Recommendation** | ⚠️ **COMMITS** — advances a **blank** recommendation to the BAC |

REF2026-1122 is therefore **not** trapped and **not** orphaned. The defect is the reverse of a dead end: **the
only working route is the wrong one, and the app takes it silently.** The BAC now sees **Stage 3 "No Data"** and
a **blank Recommended Supplier** — asked to adjudicate a recommendation of nobody on a tender where every bid
failed functionality, with nothing on the page saying so.

An earlier draft of this report said "stuck with no legitimate route forward". That overstated the evidence at
the time; it has been corrected, and the decisions have since been tested to completion.

Logged: `bugs/2026-07-30-no-qualifying-bid-has-no-working-outcome.md`.

## Additional defects surfaced on the same page

- **A second stale namespace 404s on page load:**
  `Metadata/Get?container=Boxfusion.BidManagement.Domain.Domain.TenderEvaluations.EvaluationPanelMember` —
  note the **doubled `.Domain.Domain.`**, malformed independently of any rename. Worth grepping all form
  configurations for both this and the `Boxfusion.BidManagement.Domain.*` prefix.
- **The page's scripts don't expect an empty evaluation set:** `Cannot read properties of undefined` for
  **`technicalEvaluation` ×14, `tableData` ×11, `some` ×9, `columns` ×1**. Not user-visible, but it explains
  how fragile this state is.
- **Switching decisions leaves the previous decision's fields mounted.** After *Recommend another Supplier* →
  *Bid is non-responsive*, a **hidden zero-size "Motivation" textarea** stayed in the form. Same family as the
  known stale button-enable issue, and it makes "why is Submit disabled?" undiagnosable from the UI.

## Automation

`FUNC_SCORE_MODE=below` is **opt-in and resolved at read time** (`scoresFor(evaluator)`), so `EVALUATORS`
remains the documented happy-path data and the demo-ready 16/16 chain is untouched. Reproduce the data with:

```
FUNC_SCORE_MODE=below EVAL_CRITERIA=80/20 HEADED=1 node scripts/run-plan.js \
  projects/bid-management/test-plans/tender-process/bid-supply-chain-management.md --grep "TC-0[1-9]"
```

TC-26 itself is **not** encoded as a spec case — its assertions are all failures right now.

## Limitations — be explicit about these

- **The cause of the `RfxEvaluation/Crud/Update` 500 is unknown.** The request body was well-formed
  (`{ id, evaluationReport, recommendedSupplierId, recommendationSupportingComments }`), so
  `could not execute batch command.[SQL: SQL not available]` points at a **DB constraint** — plausibly because
  the chosen supplier has no qualifying evaluation row. **Needs a dev look at the server log.**
- **Untested:** whether *Recommend another Supplier* also 500s when the chosen supplier **passed** functionality
  — i.e. is the fault the below-minimum data or the decision path itself? One run on a normal chain would settle
  it, and it matters for how the bug gets prioritised.
- **One new tender was created** (REF2026-1122). Unavoidable: this scenario requires below-minimum scores from
  TC-09, and no parked tender had them.
- The **exact-boundary** case (60.0) was inferred from two pre-existing tenders rather than driven
  deliberately; the inference is solid (COMPLIANT at 60, NON COMPLIANT at 59.5) but it was not a purpose-built
  test.

## 🔴 ADDENDUM (same evening) — retested properly, and it is far worse than a dead end

The test lead corrected two errors above: the supplier picker is a **server-filtered search** (reading its
rendered list proves nothing), and recommending an already-evaluated bidder is not sensible input. Re-running
on a **fresh below-minimum chain (REF2026-1133)** with a **typed search**, against **REF2026-1128** (normal
scores) as a control:

| Search | REF2026-1128 (normal) | REF2026-1133 (all below minimum) |
|---|---|---|
| `Stationers` | 0 — is the current recommendation | **A & A ×10** |
| `Telkom` | **1** — qualifying, not recommended | **Telkom ×10** |
| `BOXFUSION` | 0 — below minimum | **BOXFUSION ×10** |
| `HOLDINGS` | 0 — not a bidder | 🔴 **PHINGOSHE HOLDINGS ×10** |

**On a normal tender the picker offers only this tender's qualifying bidders. On a below-minimum tender it
returns the entire supplier master, every row ×10** — failed bidders and non-respondents alike.

Selecting PHINGOSHE HOLDINGS committed cleanly (`RfxEvaluation/Crud/Update` 200, `UserTaskComplete` 200). The
tender was then driven to the end — **automated TC-13 → TC-16, 4/4 passed in 1.2 min** — through BAC approval,
approving-authority approval, appointment letter and order capture, reaching `AWARDED`.

> **⚠️ Correction, 2026-08-03 — test lead ruling.** This report originally called that award Critical. **It is
> intended behaviour:** when no bid qualifies, *Recommend another Supplier* is *meant* to reach beyond the
> tender's respondents, and the downstream stages were **correct not to object**. The claim *"not one stage
> objected"* is withdrawn — there was nothing to object to.
>
> **What remains a defect in this picker:** every match appears **×10**, and selecting an **already-evaluated**
> bidder returns a raw silent **500** (`could not execute batch command`) instead of a validation message —
> A & A **has** an evaluation row on the tender so the write hits a constraint.
>
> **Open for the BA:** why is a non-respondent selectable only in the no-qualifier state and not on a normal
> tender, and should the fallback be the whole master or a category/panel shortlist?

Bug doc (re-scoped): `bugs/2026-07-30-non-bidder-can-be-recommended-when-no-bid-qualifies.md`.

## Tender state

| Tender | State | Keep for |
|---|---|---|
| **REF2026-1133** | **AWARDED to PHINGOSHE HOLDINGS** — a supplier that did not bid, which per the 2026-08-03 ruling is **correct**. Manually cancelled afterwards by the test lead | no longer a live example |
| **REF2026-1122** | *Capture outcome from the BAC*, **blank** Recommended Supplier, empty Stage 3 | retest fixture for the `tender-reason for disapproval` fix (its BAC stage still offers *Bid is Non-Responsive*) |
| **REF2026-1128** | *BEC: Finalise recommendation*, normal scores | the **control** proving the picker is scoped correctly when a bidder qualifies |
