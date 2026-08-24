# Report: BID-SCM — Non-Compliant, BAC override, final-approval gap, authorisation (NEGATIVE)
**Date:** 2026-07-30 17:15 SAST
**Variants:** 90/10 (REF2026-0890) · 80/20 (REF2026-1053, REF2026-1110)
**Plan:** test-plans/tender-process/bid-supply-chain-management.md
**Cases:** TC-21, TC-22, TC-23, TC-24
**Spec:** not encoded — see *Automation*
**Execution Mode:** live via Playwright MCP
**Result:** PARTIAL — MIXED: 2 areas correct, **1 new High bug**, **1 design gap**, **1 existing blocker
downgraded**
**Tenders:** all **reused** — no new tenders created for this session

## Summary
| # | Area | Result |
|---|---|---|
| TC-24 | Non-assignee opens another actor's workflow-action URL | **PASS** — no escalation |
| TC-21 | Non-Compliant supplier at Verify Compliance | **PASS** — rule works end to end |
| — | 2026-07-29 "Finalise Compliance" **blocker** | **DOWNGRADED** — not reproducible as written |
| TC-22 | BAC **Change Recommendation** | 🔴 **3 defects — new High bug** |
| TC-23 | **Approve Recommendation from BAC** reject path | 🔴 **None exists — design gap** |
| — | Below-minimum functionality exclusion (single bidder) | **PASS** — proven incidentally |
| — | "Stage 3 flags rank-1 as Not Recommended?" (long-open question) | **CLEARED** — rank 1 reads RECOMMENDED |

Tenders reused, per instruction: **REF2026-0890** (Verify Compliance), **REF2026-1053** (BAC),
**REF2026-1110** (Review and Approve, borrowed read-only for the authorisation probe).

## TC-24 — Authorisation via direct workflow-action URL — PASS

Cheapest and highest-severity-if-broken item on the gap list, so it went first.

- [PASS] Signed in as **TumisangM**, opened **REF2026-1110**'s action URL — a task assigned to **MhlotiM**
- [PASS] The page showed **"Requested action is not available"** and fell back to the read-only
  `tender-wf-details-view v27`
- [PASS] **No Approve / Disapprove / Send Back / Submit** rendered. No privilege escalation.

**Open question (not a defect):** the non-assignee still sees the tender's content — name, evaluation
criteria, document tabs, response tables. If tender content is meant to be participant-only, that is wider
than it appears. The read-only view also renders a *"(press to upload)"* control for Procurement Plan;
whether it would accept an upload was **not** tested, as it would have altered parked retest data.

## TC-21 — Non-Compliant supplier at Verify Compliance — PASS (and it corrects an existing bug)

Driven on **REF2026-0890** (A & A 30 000, BOXFUSION 40 000, Telkom 50 000).

- [PASS] Telkom marked **Non Compliant** — TAX Clearance Cert left not-compliant with a per-row reason;
  persisted in the **Compliance Status** column
- [PASS] A & A and BOXFUSION assessed **Compliant**; both persisted
- [PASS] Page confirmation + **Submit** advanced the tender to **Calculate Specific Goal Points**
- [PASS] **The next stage lists only BOXFUSION and A & A Stationers — Telkom is correctly excluded**

### The existing blocker is not reproducible as written

The first attempt *did* reproduce the 2026-07-29 symptom — dialog stays open, nothing persists,
`Failed to execute action 'Checklist:Update'` + 5 × `Action name is mandatory`, no user-visible message.
The difference was that the five **Checklist** Yes/No/N/A questions were **left unanswered**. Answering them
made the very same dialog save successfully, for all three suppliers, including the Non-Compliant one.

Two things worth carrying forward:

1. **A 200 on the per-document `FlatResponseDocument/Crud/Update` PUTs proves nothing.** All five returned
   200 on the failing attempt, yet reopening the dialog showed **everything blank**.
2. **The residual defect is missing validation.** The Checklist is effectively required but carries no `*`
   and no message; leaving it unanswered fails **silently and destructively**, discarding all dialog work.

`bugs/2026-07-29-finalise-compliance-action-fails.md` has been updated with a dated retest section and
**downgraded from Blocker to Medium**. The lifecycle is *not* blocked at Verify Compliance.

## TC-22 — BAC "Change Recommendation" — 🔴 3 DEFECTS

Driven twice on **REF2026-1053** (the second pass deliberately restored the original recommendation).

**Working correctly:** the decision is inline rather than a dialog, with mandatory **New Recommended
Supplier** + **Motivation**, and the page's own Submit as the commit.

⚠️ **Retracted 2026-07-30:** this report originally added "the dropdown offers only functionality-compliant
suppliers excluding the current recommendation". **That was an over-reading of page 1 of a server-filtered
search** — the picker requires typing to filter, and I never did, so no exclusion rule is established. It needs
re-testing by searching. (BOXFUSION's exclusion from **Stage 3** is separately evidenced by the tables.)

**Defects (full write-up: `bugs/2026-07-30-bac-change-recommendation-silent-no-advance.md`):**

1. 🔴 **The first Submit saved the override but never completed the user task.** `RfxEvaluation/Crud/Update`
   and `Rfx/Crud/Update` → 200, but **no `Process/UserTaskComplete`**. The tender stayed in MoshadiM's inbox
   on the **same todoid** with the decision buttons reset and **no error, toast or validation**. Reopening it
   showed the recommendation *had* changed — data moved, workflow didn't. An identical second Submit fired
   `UserTaskComplete` → 200 and advanced it. **Intermittent and silent** — the same shape as the DHA ITS
   "Register Submit is intermittent, just click Submit again" issue.
2. 🔴 **The override overwrites the BEC's own field.** Afterwards the read-only *BEC Recommendation →
   Recommended Supplier* panel reads the BAC's pick, so what the BEC recommended is no longer recorded —
   and the BAC's decision is misattributed to the BEC.
3. 🔴 **The page contradicts itself.** Stage 3 still showed *A & A Stationers → Rank 1 RECOMMENDED* directly
   above a BEC Recommendation panel naming Telkom.

**Impact:** with no feedback that the commit failed, the adjudicator will naturally choose again — so the
recommendation can be overwritten repeatedly before the workflow moves, and combined with defect 2 there is
no reliable audit trail of BEC-recommended vs BAC-substituted.

## TC-23 — Approve Recommendation from BAC has NO reject path — 🔴 GAP

Inspected as **ThulileM** (view mode Latest, form `tender-wf-approverecommendationfrombac-details v21`).
Non-destructive — nothing was submitted.

Every action on the page: **Reply · Hide · View In PDF · Download Batch · Download Zip · Submit**, gated by
one confirmation checkbox. **No Disapprove/Reject/Decline. No Send Back. No refer-back-to-BAC.**

An approving authority who disagrees with the BAC can only **approve anyway or leave the tender parked
indefinitely** — at the last control point before the appointment letter and order. Every earlier stage has a
rework or rejection route, which makes this look like an omission. **Needs a BA ruling**; write-up in
`bugs/2026-07-30-approve-recommendation-from-bac-has-no-reject-path.md`.

## Two long-open questions answered for free

Both fell out of reading REF2026-1053's evaluation tables:

- **Below-minimum functionality exclusion works.** Stage 2: Telkom 74.25 COMPLIANT, A & A 90.25 COMPLIANT,
  **BOXFUSION 59.5 NON COMPLIANT** — and BOXFUSION is absent from Stage 3 and from the
  Change-Recommendation dropdown. (This is the *single* failing bidder case; **"no supplier meets the
  minimum" is still untested.**)
- **The "Stage 3 shows rank-1 as Not Recommended" worry is cleared.** Stage 3 reads *A & A Stationers →
  Rank 1 **RECOMMENDED***, *Telkom → Rank 2 NOT RECOMMENDED*. Correct on both the BAC and the approval pages.

## Corrections to earlier notes from today

- **"BAC stage has undocumented decisions (Hold In abeyance + duplicate Cancel Tender)" is NOT
  reproducible.** Re-inspected on the same stage and tender: exactly **five** buttons, no abeyance anywhere
  on the page, no duplicate. A whole-page text search for "abeyance" found nothing on either the BAC or the
  approval page. TC-19's note has been marked unconfirmed. A Live-vs-Latest form-version difference is the
  most plausible explanation but is **unproven** — the earlier observation's view mode wasn't recorded.

## Automation

**None of TC-21 → TC-24 is encoded in the spec yet.** TC-22 and TC-23 assert on defects/gaps and would be
permanently red; TC-21 and TC-24 are both good automation candidates once TC-21's fill order is captured
(per-document comments → Is Compliant? ticks → all 5 Checklist answers → status → comments → confirmation).

**Harness notes for whoever automates these:**
- The compliance dialog's document rows **re-render on every save**, so `nth()` clicking is unreliable —
  scope to the row and verify the AntD wrapper state after each interaction.
- The Manual/Electronic Responses tables are **div-based**: `document.querySelectorAll('table tbody tr')`
  returns nothing. Read them via the accessibility tree or `innerText`, not DOM row queries.
- The inbox magnifier link is **intercepted by the Workflows sidebar flyout** under MCP — read its `href`
  and navigate directly.

## Tender states after this session

| Tender | State | Note |
|---|---|---|
| **REF2026-0890** | Calculate Specific Goal Points | 2 suppliers (Telkom excluded as Non Compliant) |
| **REF2026-1053** | Approve Recommendation from BAC | recommendation **restored to A & A Stationers** |
| **REF2026-1110** | Review and Approve Tender Details | untouched — Disapprove retest data |
| **REF2026-1106** | Review and Approve Tender Details | untouched — Disapprove retest data |
| REF2026-2561 | Verify Compliance | free |
| REF2026-0944 / 2573 | Capture Order Details | free |
| REF2026-0999 | Consolidate Responses | free |

## Still not tested

- **No supplier meets the functionality minimum** (the whole-tender case) — needs a chain from TC-01 to TC-09
- **BAC Cancel Tender / Bid is Non-Responsive** — each is likely terminal, so each burns a stage-13 tender
  (~7 min of chain). Worth batching; **REF2026-1053 is now past the BAC**, so a fresh chain is required
- **Order-details negatives** (order value vs tender value / over-commitment) — REF2026-0944 and REF2026-2573
  are parked at Capture Order Details and ready
- **TC-01 validation negatives** (date order, required fields, score ranges) — untouched across the plan
- **Disapprove** at Review and Approve — still blocked by
  `bugs/2026-07-30-disapprove-hangs-metadata-404.md`
