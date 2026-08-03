# Report: TC-26 — "Bid is non-responsive" committed on a no-qualifying-bid tender
**Date:** 2026-08-03 12:26 UTC
**Variant:** 80/20, `FUNC_SCORE_MODE=below`
**Plan:** test-plans/tender-process/bid-supply-chain-management.md (TC-26)
**Spec:** chain built by the spec (TC-01 → TC-11); the decision itself driven live via Playwright MCP
**Execution Mode:** hybrid (playwright-script chain + ai-driven decision)
**Result:** PARTIAL — the decision **works**; 3 defects in how it works
**Duration:** 7.3m chain + ~2m live
**Tender:** REF2026-0872 — "TC-01 Automated Draft Tender run-msd70bsb - 80/20 Compulsory Hybrid"
**Role:** BEC Secretariat — ThabisoM / 123qwe, view mode **Latest**

## Summary
| Total Steps | Passed | Failed | Skipped |
|-------------|--------------|--------|---------|
| 8 | 5 | 3 | 0 |

**This closes the oldest open question in TC-26.** The decision had previously only ever been *inspected* —
first it hung (a transient, since retracted), then on 2026-08-03 the dialog was confirmed to open but was
deliberately not committed to preserve a parked tender. This run committed it on a purpose-built tender.

**Headline: "Bid is non-responsive" DOES terminate a no-qualifying-bid tender.** The "dead end" framing is
retired. But the terminal state is wrong, and neither of the two justification fields is enforced.

## Chain setup (TC-01 → TC-11, all passed)

`FUNC_SCORE_MODE=below EVAL_CRITERIA=80/20 RETRIES=2 MAX_FAILURES=0` — 9 passed in 6.7m, then TC-10 and TC-11
via `--grep "TC-1[01]"` (deliberately excluding TC-12, which would have committed *Approve Recommendation* and
advanced the tender past the stage under test), 2 passed in 35.9s.

| Supplier | Thabitha / Nathi / Nelly / Maand-awe | Average | Above Minimum |
|---|---|---|---|
| A & A Stationers | 48 / 50 / 52 / 51 | **50.25** | **No** |
| Telkom | 46 / 45 / 44 / 43 | **44.5** | **No** |
| BOXFUSION | 36 / 40 / 38 / 37 | **37.75** | **No** |

## Step Results

- [PASS] Chain reaches **BEC: Finalise recommendation** with every bidder below the minimum
- [PASS] **Above Minimum = No** computed correctly for all three suppliers
- [PASS] **Final Evaluation table = "No Data"** and **Recommended Supplier = blank** — both correct for this state
- [PASS] All three decisions offered: Approve Recommendation / Recommend another Supplier / Bid is non-responsive
- [PASS] (BLOCKING) **Bid is non-responsive commits and terminates the tender** —
  `POST Tender/CaptureCancellationOutcome` → 200, `POST Process/UserTaskComplete` → 200, item leaves the Inbox
- [FAIL] 🔴 **The terminal status does not distinguish non-responsiveness from cancellation** — status is
  **`CANCELLED`**, exactly what Cancel Tender produces. Disapprove, by contrast, has its own `Declined`.
- [FAIL] 🔴 **The reason is not enforced** — Submit was clicked with the reason field **completely empty** and it
  committed. The same form under Disapprove *hides* Submit until text is entered.
- [FAIL] 🔴 **The mandatory BEC Report (`*`) is bypassed** — the page's Submit Recommendation stayed disabled
  because BEC Report was never filled, yet the dialog's Submit committed the whole decision anyway.

Full write-up:
[`bugs/2026-08-03-bid-non-responsive-unenforced-and-indistinguishable-from-cancel.md`](../bugs/2026-08-03-bid-non-responsive-unenforced-and-indistinguishable-from-cancel.md)

## Why the status matters

"No bidder met the functionality minimum" and "we cancelled this tender" are different procurement outcomes with
different consequences — the first is a defensible reason to re-advertise. Both now read `CANCELLED`, and with
the reason field also unenforced, a terminated tender can carry **no record at all** of why. Findings 1 and 2
compound each other.

## Incidental observations

1. **Copy defect:** the non-responsiveness dialog says *"…with the **disapproval** message attached"* — wrong
   word, a consequence of reusing `tender-reason for disapproval v8`.
2. **A request to the API root that redirects into Swagger** during the commit:
   `GET …-api-qa.shesha.app/?id=…&todoid=…&properties=id` → **302** → `/swagger` → `/swagger/index.html` 200.
   A configured action with a **blank endpoint path**; some intended call never happened.
3. Both known stale-namespace 404s still fire: `…Domain.Tenders.Tender` and
   `…Domain.Domain.TenderEvaluations.EvaluationPanelMember` (doubled `.Domain.`).
4. **Negative relative time in the Inbox** — the row read *"-119 minute(s) ago"* for a tender created minutes
   before. Timezone/offset display bug; the manual tester has a "Testing timezone" tender, so likely known.

## Still open in TC-26

⚠️ **Superseded later the same day (2026-08-03).** This section originally read: *"the Critical finding that a
non-bidder can be recommended and driven to `AWARDED` stands unaffected."* **The module test lead has ruled that
behaviour is BY DESIGN** — when no bid qualifies, *Recommend another Supplier* is meant to reach beyond the
tender's respondents, so the PHINGOSHE HOLDINGS award on REF2026-1133 was correct. **The Critical finding is
withdrawn.**

What remains open in TC-26 is narrower: the three defects in *how* this decision commits (documented above and
in `bugs/2026-08-03-bid-non-responsive-unenforced-and-indistinguishable-from-cancel.md`), plus two in the
*Recommend another Supplier* picker — every match listed **×10**, and an **already-evaluated** bidder returning
a raw silent **500** instead of a validation message.

## Tender status

**REF2026-0872 — CONSUMED**, now `CANCELLED`. Each test of this decision consumes one tender, since it
terminates the workflow.
Still parked: **REF2026-1110** (Review and Approve), **REF2026-1128** (BEC: Finalise recommendation, untouched).
