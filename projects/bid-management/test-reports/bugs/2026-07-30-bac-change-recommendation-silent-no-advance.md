# BUG: BAC "Change Recommendation" — first Submit saves the override but does NOT advance the workflow; the override also overwrites the BEC's own recommendation

| Field | Value |
|---|---|
| **Logged** | 2026-07-30 |
| **Project** | PD Bid Management (`projects/bid-management`) |
| **App / Env** | Supply Chain Management Admin Portal — **QA** (`https://pd-supplychainmanagement-adminportal-qa.shesha.app`) |
| **Severity** | **High** — 3 distinct defects on one decision, one of which silently loses a workflow transition |
| **Reproducibility** | Defect A: 1 of 2 attempts (**intermittent**). Defects B & C: **2/2 — consistent** |
| **Stage / Form** | Capture outcome from the BAC — `tender-wf-captureoutcomeofthebac-finalrecommendation` |
| **Role** | BAC adjudicator — **MoshadiM / 123qwe** (view mode: Latest) |
| **Tender** | **REF2026-1053** (80/20) |
| **Plan / TC** | `test-plans/tender-process/bid-supply-chain-management.md` — **TC-22** |

## Summary

The BAC's **Change Recommendation** decision lets the adjudicator override the BEC's recommended supplier.
Functionally the override does save — but three things are wrong:

- **A. The first Submit persisted the change without completing the user task** (no `UserTaskComplete` fired,
  no error shown). The tender stayed in the BAC's inbox on the *same* todoid with the decision reset, so it
  looks like nothing happened — while the recommendation had in fact already been changed underneath. A
  second, identical Submit completed the task normally.
- **B. The override is written into the BEC's own field.** After the change, the read-only **"BEC
  Recommendation → Recommended Supplier"** panel reads **Telkom** — the BAC's pick. The BEC actually
  recommended A & A Stationers. That record is overwritten in place, so the page no longer shows what the
  BEC recommended, and the BAC's decision is misattributed to the BEC.
- **C. The page contradicts itself.** With the override in place, **Stage 3** still shows
  *A & A Stationers → Rank 1, RECOMMENDED* and *Telkom → Rank 2, NOT RECOMMENDED*, directly above a BEC
  Recommendation panel naming Telkom.

## Steps to reproduce

1. Sign in as **MoshadiM / 123qwe**; open a tender at **Capture outcome from the BAC**.
2. Note the **BEC Recommendation → Recommended Supplier** (here: *A & A Stationers*) and the **Stage 3**
   ranking table.
3. Click **Change Recommendation** → two mandatory inline fields appear: **New Recommended Supplier** and
   **Motivation** (this decision has no dialog; the page's own **Submit** is the commit).
4. Pick the other supplier, type a Motivation, click **Submit**.

### Expected
The override is recorded **as the BAC's decision** (leaving the BEC's recommendation intact and visible for
the audit trail), Stage 3's Recommendation Status is updated to match, and the tender advances to
**Approve Recommendation from BAC**.

### Actual
- **Attempt 1 (A & A → Telkom):** `RfxEvaluation/Crud/Update` and `Rfx/Crud/Update` both returned **200**,
  but **no `Process/UserTaskComplete` was sent**. The tender remained in MoshadiM's inbox at *Capture outcome
  from the BAC* under the **same todoid** (`f96a7a67…`), with the decision buttons reset to their initial
  state and **no error, toast or validation message**. Reopening the item showed the recommendation had
  nonetheless changed to **Telkom** — i.e. the data moved but the workflow did not.
- **Attempt 2 (Telkom → A & A, to restore the tender):** identical steps, and this time
  `Process/UserTaskComplete` → **200** and the app redirected to My Items. The tender advanced to
  **Approve Recommendation from BAC** (new todoid `04c018ac…`, in ThulileM's inbox).

## Impact

The adjudicator gets no feedback that the decision failed to commit, so the natural response is to re-open
the item and choose again — meaning **the recommendation can be changed more than once, with each pass
overwriting the BEC's field**, before the workflow finally moves. Combined with defect B, there is no
reliable record of what the BEC originally recommended versus what the BAC substituted, which is exactly the
audit trail an adjudication decision needs.

This is the same failure *shape* as the DHA Invoice Tracking "Register Submit is intermittent — UI silent,
click Submit again" issue: a silent, retry-to-fix submit.

## Notes / related

- The **Motivation** captured on the override was not surfaced anywhere on the page afterwards. Whether it
  is stored (the `Rfx` model does expose `finalRecommendationMotivation`) and simply not displayed, or lost,
  needs a DB check.
- ~~**Supplier options behave correctly.** The dropdown offers only functionality-compliant suppliers,
  excluding the current recommendation…~~
  **⚠️ RETRACTED 2026-07-30.** That was an over-reading. The picker is a **server-filtered search** and I only
  ever saw **page 1** of it — one entry each time (Telkom on the first pass, A & A Stationers on the second).
  **No exclusion rule can be inferred from that**: I never typed to filter, so I do not know whether BOXFUSION
  (or any other supplier) would have been offered on searching.
  **What is still solid:** BOXFUSION scored **59.5 → NON COMPLIANT** at Stage 2 and is genuinely absent from
  the **Stage 3** table — that comes from the tables themselves, not from the dropdown.
  **To settle it:** reopen the decision and **type** supplier names (e.g. `BOXFUSION`, `Telkom`) to see what the
  search actually returns.
- **Tender state now:** REF2026-1053 was restored to *A & A Stationers* and left at **Approve
  Recommendation from BAC**. Verified there: Stage 3 reads *A & A Stationers → Rank 1, RECOMMENDED*.
