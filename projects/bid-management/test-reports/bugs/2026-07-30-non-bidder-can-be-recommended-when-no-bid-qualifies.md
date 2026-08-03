# ⚪ CLOSED — NOT A DEFECT: recommending a supplier that did not bid is BY DESIGN

> ## ⚠️ RETRACTED 2026-08-03 — ruling by the module test lead
>
> This bug was originally logged **Critical**: *"a company that never bid can be recommended AND AWARDED the
> tender, end to end"* (REF2026-1133 → `AWARDED` to **PHINGOSHE HOLDINGS**, a non-bidder, with all three real
> bidders below the functionality minimum).
>
> **The test lead for this module has ruled that this is intended behaviour.** When no bid qualifies, the BEC's
> *Recommend another Supplier* decision is **meant** to reach outside the tender's own respondents, and the
> downstream stages (BAC → approving authority → appointment letter → order) are **correct not to object**.
> **The award of REF2026-1133 to PHINGOSHE HOLDINGS was therefore correct behaviour, not a failure.**
>
> **What this retracts:** the Critical severity, the headline claim, and the "no stage objected" framing —
> there was nothing for a stage to object to.
>
> **What survives as real defects** (both narrower, and neither about who may be recommended) — see
> *Surviving defects* below:
> 1. every supplier row is duplicated **×10** in the picker;
> 2. selecting an **already-evaluated bidder** returns a raw silent **500** instead of a validation message.

| Field | Value |
|---|---|
| **Logged** | 2026-07-30 |
| **Retracted / re-scoped** | **2026-08-03**, per the module test lead |
| **Project** | PD Bid Management (`projects/bid-management`) |
| **App / Env** | Supply Chain Management Admin Portal — **QA** (`https://pd-supplychainmanagement-adminportal-qa.shesha.app`) |
| **Severity** | ~~Critical~~ → **Medium** (the two surviving defects; the award behaviour is by design) |
| **Status** | Headline **CLOSED — by design**. Two sub-defects **OPEN**. |
| **Stage / Form** | BEC: Finalise recommendation — `tender-wf-finaliserecommendation-details`, decision **Recommend another Supplier** |
| **Role** | BEC Secretariat — **ThabisoM / 123qwe** |
| **Tenders** | **REF2026-1133** (awarded to PHINGOSHE HOLDINGS — **correct**, then manually cancelled as cleanup). Picker behaviour also seen on **REF2026-1122**. Control: **REF2026-1128** (normal scores) |
| **Plan / TC** | `test-plans/tender-process/bid-supply-chain-management.md` — **TC-26** |

## ⚠️ For the test lead — the ADO test case for this exact step says the list should be scoped

**Not a challenge to the ruling — a documentation conflict that needs resolving one way or the other.**

This decision is *Recommend another Supplier* at **BEC: Finalise Recommendation**, which is **ADO #60835**.
Step 19 of that case reads, verbatim:

> "Click on **'New Recommended Supplier'** → New Recommended Supplier should be a dropdown list of **Suppliers
> that reached the Capture Functionality Score step**.
> N.B The Supplier that is previously recommended should not be part of this list."

**#60836** step 20 says the same for the BAC's *Change Recommendation*.

A supplier that submitted no response **never reaches the Capture Functionality Score step**, so as written the
test case does not permit a non-respondent in that list. That is the opposite of the 2026-08-03 ruling recorded
above.

**Both positions cannot stand.** Either:

1. **the ruling is right** → #60835 step 19 and #60836 step 20 are **stale and must be updated**, otherwise this
   comes back as a "bug" on every future regression pass (it already has, twice); or
2. **the test case is right** → the picker should be scoped to suppliers that reached functionality scoring, and
   the original finding was valid.

**Flagged for the test lead to decide.** No further testing of this behaviour until it is settled — and whichever
way it goes, the ADO case or this doc needs editing so they agree. The two **surviving defects below are
unaffected** either way: a ×10 duplicated list and a raw 500 are wrong under both readings.

## Surviving defects

### 1. 🔴 Every supplier is listed ten times (OPEN — Medium)

On a below-minimum tender the **New Recommended Supplier** picker returns **each supplier ×10**. Confirmed by
typed search on two tenders (2/2):

| Search term | Result on REF2026-1133 / REF2026-1122 |
|---|---|
| `Stationers` | A & A Stationers **×10** |
| `Telkom` | Telkom **×10** |
| `BOXFUSION` | BOXFUSION **×10** |
| `HOLDINGS` | PHINGOSHE HOLDINGS **×10** |

The test lead has separately confirmed the duplication **is** a bug. ×10 matches the page size, so the true
duplication factor may be higher. This looks like a **join multiplying rows** in the picker's datasource —
worth checking the datasource expression on the *New Recommended Supplier* component of
`tender-wf-finaliserecommendation-details` for a missing `distinct` / a one-to-many join.

**Expected:** each supplier appears exactly once.

### 2. 🔴 An already-evaluated bidder gives a silent 500, not a validation message (OPEN — Medium)

Selecting **A & A Stationers** — a supplier that already has a response/evaluation row on the tender — and
submitting produced:

```
PUT /api/dynamic/Shesha.SupplyChainManagement/RfxEvaluation/Crud/Update → 500  "could not execute batch command"
```

No message reached the screen. The write appears to hit a DB constraint because an evaluation row already
exists for that supplier on that tender.

**Expected:** if re-recommending an already-evaluated bidder is invalid, say so in a validation message; never
surface it as a raw 500. (If it is *valid*, the constraint needs fixing.)

## Observation retained for the record — the picker is scoped differently on the two tender types

The evidence below is unchanged; only its interpretation is. Both tenders are 80/20 with the same three bidders;
the only difference is the functionality scores. **The search term was typed in each case** — the picker is a
server-filtered search, so its unsearched list is only page 1 and proves nothing.

| Search term | **REF2026-1128** — normal scores | **REF2026-1133** — all below minimum |
|---|---|---|
| `Stationers` (A & A) | **0 results** — it is the current recommendation | A & A Stationers ×10 |
| `Telkom` | **1 result** — qualifying, not currently recommended | Telkom ×10 |
| `BOXFUSION` | **0 results** — below the minimum (59.5) | BOXFUSION ×10 |
| `HOLDINGS` | **0 results** — not a bidder on this tender | PHINGOSHE HOLDINGS ×10 |

So the picker offers **the tender's own qualifying bidders** on a normal tender, and **the whole supplier
master** on a below-minimum one. Under the ruling that reaching outside the respondents is legitimate, this is not
read as a scoping failure. The only open item is the **documented conflict** with #60835 step 19 recorded above —
which is a disagreement between two sources of truth, not an interpretation.

## Also retained — what the BAC page shows on such a tender

On REF2026-1133 at *Capture outcome from the BAC* (verified live as MoshadiM):

- **Stage 3 – Price and Specific Goal Points: "No Data"** — no ranked bidders
- **BEC Recommendation → Recommended Supplier: PHINGOSHE HOLDINGS**, Motivation displayed

Under the ruling this is the expected picture — there are no qualifying bidders to rank, and nothing documents a
requirement for the page to explain why. **Recorded as an observation; not raised as an issue.**

## Test data left behind

| Tender | State | Note |
|---|---|---|
| **REF2026-1133** | Reached `AWARDED` (**correct**, per the ruling), then **manually cancelled by the test lead** | No longer a live example |
| **REF2026-1122** | *Capture outcome from the BAC* | Blank recommendation (via *Approve Recommendation*) |
| **REF2026-1128** | *BEC: Finalise recommendation* | Normal scores — the control for picker scoping |

## History

- **2026-07-30** — logged Critical after driving REF2026-1133 from *Recommend another Supplier* to `AWARDED`
  (TC-13 → TC-16, 4/4). Found only after the test lead corrected two earlier mistakes: the picker is a
  **search** (reading its rendered list proves nothing), and re-recommending an already-evaluated bidder is not
  a sensible input.
- **2026-08-03** — **test lead ruled the award behaviour is by design.** Headline closed; severity dropped from
  Critical to Medium; the ×10 duplication and the silent 500 kept as the surviving defects; the scoping
  difference and the "No Data" presentation reduced to observations — neither is documented as a requirement, so
  neither is raised as an issue.
