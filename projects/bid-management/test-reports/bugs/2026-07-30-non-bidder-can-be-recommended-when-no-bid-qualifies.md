# BUG: A company that never bid can be recommended AND AWARDED the tender, end to end

> **🔴 CONFIRMED END-TO-END 2026-07-30.** REF2026-1133 was driven all the way from this recommendation to
> **AWARDED** — BAC approval, approving-authority approval, appointment letter and order capture (TC-13 → TC-16)
> **all passed without a single guard intervening.** The tender's three actual bidders had every one failed the
> functionality minimum; the awarded party, **PHINGOSHE HOLDINGS, submitted no response at all.**
> **Final status on the tender header: `AWARDED`.**

| Field | Value |
|---|---|
| **Logged** | 2026-07-30 |
| **Project** | PD Bid Management (`projects/bid-management`) |
| **App / Env** | Supply Chain Management Admin Portal — **QA** (`https://pd-supplychainmanagement-adminportal-qa.shesha.app`) |
| **Severity** | **Critical** — a supplier that submitted no bid can be **awarded the tender**, with no stage in the workflow objecting |
| **Reproducibility** | Picker fallback + ×10 duplication: **2/2** below-minimum tenders. Non-bidder commit: **1/1** |
| **Stage / Form** | BEC: Finalise recommendation — `tender-wf-finaliserecommendation-details`, decision **Recommend another Supplier** |
| **Role** | BEC Secretariat — **ThabisoM / 123qwe** |
| **Tenders** | **REF2026-1133** (80/20, all bidders below minimum) — now at *Capture outcome from the BAC* recommending a non-bidder. Picker behaviour also reproduced on **REF2026-1122**. Control: **REF2026-1128** (normal scores) |
| **Plan / TC** | `test-plans/tender-process/bid-supply-chain-management.md` — **TC-26** |

## Summary

The **New Recommended Supplier** picker on *Recommend another Supplier* is correctly scoped **only when at
least one bidder qualified**. On a tender where **no bidder met the functionality minimum**, it falls back to
querying the **entire supplier master list**, with **every row duplicated ×10**. A supplier that never
submitted a response can then be selected — and the submission **succeeds**, advancing the tender to the BAC
with that non-bidder as the recommended supplier.

## Evidence — the picker is scoped correctly on a normal tender, and not at all on a below-minimum one

Both tenders are 80/20 with the same three bidders (A & A Stationers, BOXFUSION, Telkom). The only difference
is the functionality scores. **The search term was typed in each case** (the picker is a server-filtered
search; the unsearched list is only page 1).

| Search term | **REF2026-1128** — normal scores | **REF2026-1133** — all below minimum |
|---|---|---|
| *(unsearched, page 1)* | — | **A & A Stationers ×10** |
| `Stationers` (A & A) | **0 results** — it is the current recommendation | **A & A Stationers ×10** |
| `Telkom` | **1 result** — qualifying, not currently recommended | **Telkom ×10** |
| `BOXFUSION` | **0 results** — below the minimum (59.5) | **BOXFUSION ×10** |
| `HOLDINGS` | **0 results** — not a bidder on this tender | 🔴 **PHINGOSHE HOLDINGS ×10** |

So on REF2026-1128 the rule is sensible: *qualifying bidders on this tender, excluding the one already
recommended.* On REF2026-1133 that scoping is gone entirely — **failed bidders and complete non-bidders are
all offered**, each ten times over.

## The non-bidder commits

On REF2026-1133, selecting **PHINGOSHE HOLDINGS** (no response submitted to this tender), filling the mandatory
**Motivation** and **BEC Report**, and clicking **Submit Recommendation**:

```
PUT  /api/dynamic/Shesha.SupplyChainManagement/RfxEvaluation/Crud/Update  → 200 OK
POST /api/services/SheshaWorkflow/Process/UserTaskComplete                 → 200 OK
```

The tender advanced to **Capture outcome from the BAC**. Verified live as **MoshadiM**:

- **Stage 3 – Price and Specific Goal Points: "No Data"** — no ranked bidders at all
- **BEC Recommendation → Recommended Supplier: PHINGOSHE HOLDINGS**
- The Motivation text is displayed

**The adjudication committee is now being asked to approve an award to a company that never bid**, on a tender
with an empty ranking table, with nothing on the page flagging either fact.

### …and the award completed

The remaining stages were then driven on the same tender (automated TC-13 → TC-16, **4/4 passed in 1.2 min**):

| Stage | Actor | Result |
|---|---|---|
| TC-13 Capture Outcome of the BAC | MoshadiM | **Approved** — no objection to a non-bidder or an empty Stage 3 |
| TC-14 Approve Recommendation from BAC | ThulileM | **Approved** |
| TC-15 Compile and Upload Appointment Letter | TumisangM | **Uploaded** |
| TC-16 Capture Order Details | TumisangM | **Captured** |

**Final state: REF2026-1133 header reads `AWARDED`.** No stage in the workflow — not compliance, not
functionality, not adjudication, not final approval — prevented a tender from being awarded to a company that
never submitted a bid, on a tender where every real bidder had failed.

## This also explains the earlier 500

An earlier attempt on REF2026-1122 selected **A & A Stationers** from this same broken list and got
`RfxEvaluation/Crud/Update` → **500** `could not execute batch command`. That now makes sense: A & A **has** a
response/evaluation row on the tender, so the write hit a constraint; PHINGOSHE HOLDINGS has none, so the write
succeeded.

**The behaviour is therefore exactly backwards:** recommending an actual (if failed) bidder is rejected — with
a silent 500 rather than a validation message — while recommending a company with no bid at all is accepted.

## Expected

1. When no bidder qualifies, *Recommend another Supplier* should offer **nothing** (and ideally be unavailable),
   leaving *Bid is non-responsive* as the outcome — which is itself currently dead, see
   `bugs/2026-07-30-disapprove-hangs-metadata-404.md`.
2. The picker must **always** be scoped to the tender's own responses. A supplier with no response on the
   tender must never be selectable, and the server must reject it regardless of what the UI offers.
3. Each supplier should appear **once**.
4. An invalid selection should produce a **validation message**, not a raw 500.

## Suggested fix (for dev)

The picker's datasource appears to have **no tender filter and no de-duplication** in the
no-qualifying-bidder case — as though the filter expression evaluates to empty and the query degrades to
"all suppliers", with a join multiplying each row (×10 matches the page size, so the true duplication factor
may be higher than 10). Worth checking the datasource expression on the **New Recommended Supplier** component
of `tender-wf-finaliserecommendation-details`, and adding a server-side guard on
`RfxEvaluation.recommendedSupplierId` that it references a response **on this tender**.

## Test data left behind

| Tender | State | Note |
|---|---|---|
| **REF2026-1133** | Reached 🔴 **AWARDED**, then **manually cancelled by the test lead** (2026-07-30, after this test) | The award to PHINGOSHE HOLDINGS **did complete** — the header read `AWARDED` — and was then cancelled as cleanup. **The finding is unaffected; the tender is no longer a live example**, so reproduce with a fresh below-minimum chain (`FUNC_SCORE_MODE=below`) |
| **REF2026-1122** | *Capture outcome from the BAC* | Blank recommendation (via *Approve Recommendation*) |
| **REF2026-1128** | *BEC: Finalise recommendation* | Normal scores — the **control** showing correct picker scoping |

## Credit / how this was found

The test lead corrected two earlier mistakes of mine that were masking this: (1) the picker is a **search** —
reading its rendered list proves nothing, and (2) recommending an already-evaluated bidder is not a sensible
input. Re-running with a typed search on a purpose-built below-minimum chain is what exposed the master-list
fallback.
