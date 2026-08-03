# BUG: Cancel Tender leaves the tender `DECLINED` instead of cancelled (violates ADO #60836 step 33)

| Field | Value |
|---|---|
| **Logged** | 2026-08-03 |
| **Project** | PD Bid Management (`projects/bid-management`) |
| **App / Env** | Supply Chain Management Admin Portal — **QA** (`https://pd-supplychainmanagement-adminportal-qa.shesha.app`) |
| **Severity** | **Medium–High** — audit/reporting defect on a terminal state, and a **documented** expectation |
| **Reproducibility** | 1/1 (terminal decision — each test consumes a tender) |
| **Stage / Form** | Capture outcome from the BAC — `tender-wf-captureoutcomeofthebac-finalrecommendation v27`, dialog `tender-reason for disapproval v8` |
| **Role** | BAC adjudicator — **MoshadiM / 123qwe**, view mode **Latest** |
| **Tender** | **REF2026-2395** (consumed) |
| **ADO** | **#60836** *Capture Outcome of the BAC*, **step 33** |
| **Plan / TC** | **TC-33** |

## The documented expectation

ADO #60836 step 33, verbatim:

> "Click the **Submit** button on the Cancel tender dialog → The system should end the workflow and **mark the
> item as cancelled** and also sent a notification to the initiator with disapproval message"

## What happens

The decision **works** — `POST /api/services/SupplyChainManagement/Tender/CaptureCancellationOutcome` → **200**,
then `POST …/Process/UserTaskComplete` → **200**, the item leaves the inbox and the app redirects to My Items.

**But the terminal status reads `DECLINED`, not cancelled.**

**Re-verified 2026-08-03 across two independent views** (deliberately, because the first reading came only from the
workflow page header and could have been a workflow-level status rather than the tender's):

| View | REF2026-2395 (Cancel Tender) | REF2026-0872 (non-responsive) |
|---|---|---|
| Workflow page header chip | **DECLINED** | — |
| **My Items list** status column | **Declined** | **Cancelled** |

Both views agree, and the contrast with a non-responsive termination is visible in the same column of the same
list. So this is what a user and any status-filtered report will see.

## Why it matters — measured across all three terminal decisions

| Decision | Stage | Status observed | Spec | Verdict |
|---|---|---|---|---|
| Bid is non-responsive | BEC: Finalise recommendation | `CANCELLED` | #60835 step 16 → *"mark the item as cancelled"* | ✅ correct |
| **Cancel Tender** | Capture outcome from the BAC | **`DECLINED`** | #60836 step 33 → *"mark the item as cancelled"* | 🔴 **violation** |
| Disapprove | Review and Approve | `DECLINED` | no ADO case | — |

So the decision literally named **Cancel Tender** is the only one of the three that does **not** reach a cancelled
state, and it instead collides with Disapprove. Anyone filtering or reporting on cancelled tenders will miss every
BAC cancellation, and will instead find them mixed in with reviewer disapprovals.

**Both cancellation-family decisions call the same endpoint** (`CaptureCancellationOutcome`) yet land on different
statuses — so the status is being selected somewhere downstream of a shared operation. That is the place to look.

## Expected

Cancel Tender must leave the tender in a cancelled state, per step 33.

> **Note on scope.** This bug is **only** about Cancel Tender failing to reach the status its own case requires.
> Whether the three outcomes ought to be separately identifiable is **not** an issue: #60835 step 16 and #60836
> steps 29/33 deliberately route them all to "cancelled", so the current design is the required one.

## Secondary — the same reason form behaves inconsistently across the two decisions

#60836 steps 27/31 and #60835 step 24 all say: *"The submit button should be **inactive** until the reason has
been captured."* **Neither invocation of the form does that**, and they fail in opposite directions — both observed
directly on 2026-08-03, on the same form version `tender-reason for disapproval v8`:

| Invocation | Dialog title | With an empty reason | Verdict |
|---|---|---|---|
| **Cancel Tender** (BAC, REF2026-2395) | "Cancel Tender" | **No Submit button rendered at all** — buttons are icon, icon, *Cancel*. It appears only once text is entered | Enforced, but by an absent control rather than a disabled one, with nothing explaining the absence |
| **Bid is non-responsive** (BEC, REF2026-1128) | "Reason for Non-responsiveness" | **Submit rendered, 76 × 32, NOT disabled**, and the third button is *Close* rather than *Cancel* | 🔴 **not enforced at all** |

So one shared form yields two different button sets and two different enforcement behaviours depending on which
decision opened it. The BEC side is the outright violation and is tracked in
`2026-08-03-bid-non-responsive-unenforced-and-indistinguishable-from-cancel.md`; it was re-confirmed
non-destructively on REF2026-1128 (dialog inspected, then closed without submitting).

## Observed, not raised as an issue

The mandatory reason is **unretrievable afterwards** — on the terminated tender's view there is no "Reason" label,
no tab for it, and the reason typed at submission appears nowhere. **#60836 step 32 requires only that the reason
be displayed *in the dialog*, which it is**, so the app meets the documented expectation. Recorded here as an
observation only; not raised as a defect or a ruling request.

## Latent controls on this page (not user-visible)

Measured with `getBoundingClientRect()`: **"Hold In abeyance pending further due dilligence"** and a **second
"Cancel Tender"** are both present in the DOM at **0 × 0 px**. A user sees exactly **5** decisions. Dead markup
rather than a functional defect — and note the typo *"dilligence"*. Same pattern as TC-26's orphaned hidden
*Motivation* textarea.

## Also reconfirmed

`GET /api/services/app/Metadata/Get?container=Boxfusion.BidManagement.Domain.Tenders.Tender` → **404** fires on
this page too, during a **fully successful** commit. Third independent confirmation that this stale-namespace 404
is a real wart but **not** the cause of the old Disapprove hang.

## Reproduction

1. Sign in as **MoshadiM**, view mode **Latest**; open a tender at *Capture outcome from the BAC*
2. Click **Cancel Tender** → note there is no Submit button until a reason is typed
3. Type a reason, click **Submit** → `CaptureCancellationOutcome` 200 → `UserTaskComplete` 200
4. Open the tender's view page → the status reads **`DECLINED`**

⚠️ Terminal — consumes a tender. Confirm the Ref No on the page header before acting: the inbox table is
div-based, so magnifier links have to be mapped positionally to rows.
