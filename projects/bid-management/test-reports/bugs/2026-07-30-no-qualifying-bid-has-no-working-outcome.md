# BUG: When NO supplier meets the functionality minimum, the only procedurally correct outcome ("Bid is non-responsive") is dead

> **Scope correction 2026-07-30, then FULLY RESOLVED the same evening.** An earlier version said the tender was
> "stuck with no working way out". **That overstated it** — and all three decisions have now been driven to a
> conclusion. Final position:
>
> | Decision | Verified outcome |
> |---|---|
> | **Bid is non-responsive** (correct outcome) | 🔴 **DEAD** — permanent spinner, metadata 404, same broken form as *Disapprove* |
> | **Recommend another Supplier** | ⚠️ **Not validly tested** — the supplier chosen was already an evaluated bidder (invalid input). Returned a **silent 500**; needs a proper retest with a *searched* supplier |
> | **Approve Recommendation** | ⚠️ **COMMITS** — `UserTaskComplete` 200, advances an **empty recommendation** to the BAC |
>
> **So the tender is NOT trapped** — but the only route that works carries a **blank Recommended Supplier and
> an empty Stage 3 ranking** into the adjudication stage. That is arguably worse than a dead end: the BAC is
> asked to adjudicate a recommendation of nobody, silently, on a tender where every bid failed functionality.

| Field | Value |
|---|---|
| **Logged** | 2026-07-30 |
| **Project** | PD Bid Management (`projects/bid-management`) |
| **App / Env** | Supply Chain Management Admin Portal — **QA** (`https://pd-supplychainmanagement-adminportal-qa.shesha.app`) |
| **Severity** | **High** — the appropriate outcome for a non-responsive tender cannot be taken; the remaining routes are improper ones |
| **Reproducibility** | 1 chain, driven end to end (TC-01 → TC-12 stage) |
| **Stage / Form** | BEC: Finalise recommendation — `tender-wf-finaliserecommendation-details` |
| **Role** | BEC Secretariat — **ThabisoM / 123qwe** |
| **Tender** | **REF2026-1122** (80/20) — **left stuck at BEC: Finalise recommendation** |
| **Plan / TC** | `test-plans/tender-process/bid-supply-chain-management.md` — **TC-26** |

## Scenario

A purpose-built chain where **every** bidder fails the technical/functionality threshold. Driven with the
new `FUNC_SCORE_MODE=below` gate, all four evaluators scoring every supplier under the minimum:

| Supplier | Scores (Nathi / Nelly / Maanda-awe / Thabitha) | Average | Above Minimum |
|---|---|---|---|
| A & A Stationers | 50 / 52 / 51 / 48 | **50.25** | **No** |
| Telkom | 45 / 44 / 43 / 46 | **44.5** | **No** |
| BOXFUSION | 40 / 38 / 37 / 36 | **37.75** | **No** |

**The minimum is 60 and inclusive** — established from existing data, where an average of exactly 60 read
COMPLIANT (REF2026-0944) and 59.5 read NON COMPLIANT (REF2026-1053).

## What happens

1. **TC-10 Monitor Evaluation Progress** — **Begin Calibration is enabled, with no warning** that no bid
   qualifies. It advances normally.
2. **TC-11 Monitor calibration and finalise scoring** — the Evaluator Scores table correctly flags
   **Above Minimum = No for all three** suppliers. **Finalise Scoring is still enabled, with no warning.**
   It advances normally.
3. **TC-12 BEC: Finalise recommendation** — the **Final Evaluation table is empty ("No Data")** and
   **Recommended Supplier is blank**. Correct, as far as it goes: all bidders were properly filtered out.
   But now none of the three decisions works:

| Decision | Result | Committed? |
|---|---|---|
| **Bid is non-responsive** — the correct outcome | 🔴 **DEAD.** Permanent loading spinner, same defect as *Disapprove* — see below | Attempted; cannot commit |
| **Recommend another Supplier** | ⚠️ **Test invalid — see the correction below.** The supplier I chose (A & A Stationers) was **already an evaluated bidder**, which is not a meaningful use of this decision. The submit returned **`PUT /RfxEvaluation/Crud/Update` → 500** `could not execute batch command.[SQL: SQL not available]` with **no message of any kind**. The 500 is most likely the app rejecting invalid input; **the defect that stands is that it does so silently.** | **Retest required** |
| **Approve Recommendation** | ⚠️ Commits: `Process/UserTaskComplete` → **200**, redirect to My Items, tender advances to **Capture outcome from the BAC** (new todoid) — carrying a **blank Recommended Supplier** | **Yes — succeeds** |

### What the BAC then receives

Confirmed live as **MoshadiM** on the resulting task:

- **Stage 3 – Price and Specific Goal Points: "No Data"** — no ranked suppliers at all
- **BEC Recommendation → Recommended Supplier: blank**
- BEC Report: present
- All five BAC decisions enabled as normal

So the adjudication committee is asked to adjudicate **a recommendation of nobody, on an empty ranking table**,
for a tender in which every bid failed the functionality threshold — with nothing anywhere on the page saying
so.

**Net effect, stated precisely:** the tender is **not** trapped, and it is **not** orphaned. The problem is the
opposite of a dead end — the **only working route is the wrong one**, and the app takes it silently. The
procedurally correct outcome (non-responsive) is dead, and the one that would at least name a bidder fails with
a server 500.

There is also **no footer Send Back at this stage** (established in TC-18), so there is no route *backwards*
either — the only exits are the three decisions above.

## Root cause of the dead "Bid is non-responsive" — the SAME broken form as Disapprove

The network trace on the click is conclusive:

```
[GET] /FormConfiguration/GetByName?name=tender-reason%20for%20disapproval
        &module=Shesha.SupplyChainManagement                                  → 200 OK
[GET] /Metadata/Get?container=Boxfusion.BidManagement.Domain.Tenders.Tender   → 404 Not Found
```

**`Bid is non-responsive` reuses the very form that breaks `Disapprove`**
(`bugs/2026-07-30-disapprove-hangs-metadata-404.md`). That bug is therefore **broader than filed**: one
mis-bound form kills **at least two** decisions on two different stages. Fixing the entity binding on
`tender-reason for disapproval` should fix both — and both need retesting together.

### A second stale namespace on this page

```
[GET] /Metadata/Get?container=Boxfusion.BidManagement.Domain.Domain.TenderEvaluations.EvaluationPanelMember → 404
```

Note the **doubled `.Domain.Domain.`** — malformed independently of the rename. This one fires on page load of
`tender-wf-finaliserecommendation-details`. Worth grepping every form configuration for both
`Boxfusion.BidManagement.Domain.*` and the doubled-`Domain` typo.

### Client-side errors from the empty table

The below-minimum page also throws a cluster of script errors, all `Cannot read properties of undefined`:
**`technicalEvaluation` ×14, `tableData` ×11, `some` ×9, `columns` ×1**. The page's scripts clearly do not
expect an empty Final Evaluation set. Not user-visible, but it explains the fragile behaviour here.

## Expected

Two things, for the BA and dev respectively:

1. **A tender where no bid qualifies should be terminable via the correct decision** — "Bid is non-responsive"
   must work. Arguably the app should also *say something* at TC-10/TC-11 rather than letting the secretariat
   click Begin Calibration and Finalise Scoring with no indication that nothing qualified.
2. **The other two decisions should not be offered in this state.** "Approve Recommendation" must not enable
   Submit with a blank Recommended Supplier, and "Recommend another Supplier" must not offer suppliers that
   failed functionality (nor list any supplier ten times).

## Limitations — what this report does and does not establish

**Established:** the exclusion arithmetic is correct; TC-10/TC-11 give no warning; *Bid is non-responsive*
hangs on a metadata 404 and shares its broken form with *Disapprove*; the *Recommend another Supplier*
dropdown offers a failed supplier ten times; *Approve Recommendation* enables Submit with a blank supplier.

## ⚠️ CORRECTION 2026-07-30 (from the test lead) — two claims in this report were wrong

1. **"A & A Stationers is the only option" is WRONG.** The **New Recommended Supplier** picker is a
   **server-filtered search** — what I read was only the **first page** of results, not the available set.
   *(This is the documented behaviour of every supplier picker in this app: the list is paged ~10 and you must
   type to filter. I failed to apply it.)*
   **What still stands:** the ×10 **duplication** of the same supplier (identical option text *and* key) is a
   real bug. **What does not stand:** any claim about which suppliers are or are not offered — including that a
   below-minimum supplier is the only choice.
2. **The test input was invalid.** I recommended **A & A Stationers — a bidder that had already been
   evaluated**, which is not a sensible use of "Recommend another Supplier". So the 500 is very likely the app
   refusing nonsense input rather than a broken decision path.
   **The defect that survives is narrower but real: it fails with a raw 500 and tells the user nothing.**
   Invalid input should produce a validation message, not a silent server error.

**✅ RETEST DONE the same evening on a fresh below-minimum chain (REF2026-1133) — and it found something worse.**
Typing to search revealed that when no bidder qualifies, the picker **falls back to the entire supplier master
list** (every row ×10): `Telkom`, `BOXFUSION` **and** `HOLDINGS` → *PHINGOSHE HOLDINGS*, a company that never
bid, all offered. Selecting the non-bidder **committed successfully** (`RfxEvaluation/Crud/Update` 200,
`UserTaskComplete` 200) and advanced the tender to the BAC recommending it.
**Logged separately as Critical:**
[`bugs/2026-07-30-non-bidder-can-be-recommended-when-no-bid-qualifies.md`](2026-07-30-non-bidder-can-be-recommended-when-no-bid-qualifies.md).
That also explains the 500 here: A & A **has** an evaluation row on the tender so the write hit a constraint,
whereas a non-bidder has none and goes through — **backwards from what it should be.**

**Established (2026-07-30 evening):** *Approve Recommendation* commits and advances a blank recommendation to
the BAC; *Bid is non-responsive* is dead on the metadata 404.

**Still not established:**
- Whether an admin could terminate or reassign the workflow instance by another means.
- **Whether *Recommend another Supplier* works at all when used correctly** — i.e. with a supplier **not**
  already evaluated on the tender, found by typing to search. My attempt used an already-evaluated bidder, so
  this decision remains **effectively untested**.
- The **cause** of the 500 on `RfxEvaluation/Crud/Update`. The request body was well-formed —
  `{ id, evaluationReport, recommendedSupplierId: "0ba45287-…", recommendationSupportingComments }` — and
  `could not execute batch command` points at a **DB-level constraint**, consistent with the supplier already
  having an evaluation row. Worth a dev glance at the server log, but the **actionable defect is the missing
  validation**, not the 500 itself.

- **Superseded note:** the "Approve Recommendation with nobody" path was initially left uncommitted;
  it has since been committed and the result is recorded above. It was proven only as far as *Submit
  Recommendation becoming enabled* with a blank supplier; whether the server would accept it is **untested**,
  because committing it would have consumed the only below-minimum tender. Worth closing on the next
  below-minimum chain — re-create one with
  `FUNC_SCORE_MODE=below EVAL_CRITERIA=80/20 node scripts/run-plan.js … --grep "TC-0[1-9]"`.
- **Switching decisions leaves the previous decision's fields mounted.** After clicking *Recommend another
  Supplier* and then *Bid is non-responsive*, a **hidden zero-size "Motivation" textarea** remained in the
  form. Same family as the known stale button-enable issue; it makes "why is Submit disabled?" undiagnosable
  from the UI.
