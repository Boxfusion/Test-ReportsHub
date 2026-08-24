# FINDING (design gap): "Approve Recommendation from BAC" offers the approving authority NO way to reject

| Field | Value |
|---|---|
| **Logged** | 2026-07-30 |
| **Project** | PD Bid Management (`projects/bid-management`) |
| **App / Env** | Supply Chain Management Admin Portal — **QA** (`https://pd-supplychainmanagement-adminportal-qa.shesha.app`) |
| **Type** | Workflow / design gap — **needs a BA ruling**, not necessarily a code bug |
| **Severity** | ~~Medium-High~~ → ⚪ **observation, not a defect** (2026-08-03). **ADO #60843 documents only the approve path** (steps 19–21: confirmation checkbox → Submit → route to Compile and Upload Appointment Letter). It never asks for a reject option, so its absence is not a documented failure |
| **Stage / Form** | Approve Recommendation from BAC — `tender-wf-approverecommendationfrombac-details v21` |
| **Role** | Approving authority — **ThulileM / 123qwe** (view mode: **Latest**) |
| **Tender** | **REF2026-1053** (80/20), todoid `04c018ac…` |
| **Plan / TC** | `test-plans/tender-process/bid-supply-chain-management.md` — **TC-23** |

## Finding

The final approval stage is **approve-only**. Every button on the page is:

```
Reply · Hide · View In PDF · Download Batch · Download Zip · Submit
```

plus a single confirmation checkbox — *"I confirm I have reviewed all the provided information and approve
the recommmendation from the Bid Adjudication Commitee"* — which gates **Submit**.

There is:
- **no Disapprove / Reject / Decline / Not Approve**
- **no Send Back** (consistent with the stage mapping in TC-18 — the footer Send Back exists only on the
  pre-evaluation stages)
- **no "refer back to the BAC"** of any kind

So an approving authority who disagrees with the BAC's recommendation has exactly two options: **approve it
anyway, or leave the tender parked in their inbox indefinitely.** There is no modelled path for a refusal at
the final gate.

## Why this matters

This is the last control point before the appointment letter is issued (TC-15) and the order is captured
(TC-16). Every earlier stage has a rework or rejection route — the pre-evaluation stages have footer
**Send Back** (7 loops proven, TC-18), and the BAC itself has **Send back for re-evaluation** (TC-19),
**Change Recommendation**, **Bid is Non-Responsive** and **Cancel Tender**. The final approval having no
counterpart looks like an omission rather than an intent.

Compare **eLeave**, where the approve step has explicit terminal *Not Approve* and *Send Back* branches.

## Question for the BA / test lead

Is approve-only deliberate here — i.e. the BAC's decision is final and the approving authority merely
countersigns — or is a reject/refer-back branch missing? If it is deliberate, the "approval" framing is
misleading and the stage would be better described as an acknowledgement.

## Also observed on this page

- **Copy defects in the confirmation label:** "the **recommmendation**" (three m's) and "Bid Adjudication
  **Commitee**" (one t). Same family as the lowercase-`l` "*l confirm*" defects recorded in TC-18 → worth
  folding into one copy review.
- The Stage 2 / Stage 3 tables render correctly here: *A & A Stationers 90.25 COMPLIANT → Rank 1
  RECOMMENDED*, *Telkom 74.25 COMPLIANT → Rank 2 NOT RECOMMENDED*, *BOXFUSION 59.5 **NON COMPLIANT*** (and
  correctly absent from Stage 3). **This also clears the long-standing "does Stage 3 flag the rank-1 supplier
  as Not Recommended?" question — it does not; rank 1 reads RECOMMENDED.**

## Not tested

Whether the approving authority can achieve a refusal by any indirect route (e.g. an admin reassigning or
terminating the workflow instance). Only the stage's own UI was assessed.
