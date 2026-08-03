# Report: BAS TC-06 — Reject Invoice / Review Rejected Invoice (negative path, QA)

**Date:** 2026-07-31 08:03 UTC
**Plan:** test-plans/invoice-process/bas.md — TC-06 (ADO #102378), reject branch off TC-07 Prepare Voucher
**Environment:** **QA** — https://dha-smartgov-adminportal-qa.shesha.app/ (view mode **Latest**)
**Execution Mode:** ai-driven (MCP browser)
**Result:** PASSED — both sub-branches covered
**Ref No:** **PAY3338/2026** — BAS, VANG GROUP (MAAA0868598), invoice `DHA-INV-3338`, **R2 000**
**Workflow instance:** `79b24238-8a3c-4a5a-a589-b69f39fd2607`

## Outcome

Both halves of the reject branch were exercised on a single invoice — first the **recovery** path, then
the **terminal** path — by rejecting, recovering, and rejecting again.

Final state: `Process/Details` → **`status: 3` (Completed), `subStatus: 13` (Rejected)**, no active
tasks, and the downstream payment steps (Verify Voucher, Authorise, both imports, Capture Filing)
**never activated** — correct for a terminal rejection.

## Setup
Registered as `Admin` and driven to *Prepare Voucher* using the self-assign technique
(Branch Finance Admin → Official → Certify, all `ThabisoM`, next step opening in place each time).
Register Submit went through on the **first attempt**, no 500.

## Sub-branch 1 — recovery (Send for Invoice Verification)

1. **Prepare Voucher** → selected **Reject Invoice**.
   - [PASS] Dialog `SAGovRequestForPayment-wf-RejectInvoice-dialog v6` opened **after** Submit with
     **Ok disabled until a comment was typed**.
2. **Review Rejected Invoice** (`…-BAS-wf-ReviewInvoiceRejection-Details v6`)
   - [PASS] **Self-assigned to Thabiso** — the step opened in place, no inbox round-trip, confirming
     this step is owned by the Finance Unit rather than a separate reviewer group.
   - [PASS] The rejection comment was carried through and displayed with its timestamp.
   - [PASS] Two outcomes offered: **Approve Rejection** / **Send for Invoice Verification**.
3. Selected **Send for Invoice Verification**.
   - [PASS] A **second, distinct** mandatory-comment dialog appeared —
     `…ReviewInvoiceRejection-SendBacktoReviewDecision-dialog v6` — also with Ok disabled until typed.
   - [PASS] (BLOCKING) Routed **back to Prepare Voucher**, opened in place. Decision logged as
     `Pay Invoice-Prepare Voucher`. Interim `subStatus: 7`.
   - [PASS] **The Outcome radio came back reset**, not pre-filled from the previous reject — so the
     preparer makes a genuine fresh decision after a send-back.

## Sub-branch 2 — terminal (Approve Rejection)

4. **Prepare Voucher** (2nd pass) → selected **Reject Invoice** again, new comment.
5. **Review Rejected Invoice** (2nd pass) → selected **Approve Rejection**.
   - [PASS] A **third distinct** dialog — `…ReviewInvoiceRejection-ApproveRejection-dialog v6` — again
     gated on a mandatory comment.
   - [PASS] (BLOCKING) Process **ended**: `status: 3`, `subStatus: 13` (**Rejected**), zero active
     tasks, payment steps never activated.

So each of the three negative decisions has its **own** dialog form, and all three enforce the comment.

## Final step trail
```
Register and Upload Invoice              :: done [Submit]
Assign Branch Finance Admin              :: done [Submit]
Assign Responsible Person to Certify     :: done [Submit]
Certify Invoice                          :: done [Pay Invoice]
Review Rejected Invoice                  :: done [Approve Rejection]
Prepare Voucher                          :: done [Reject Invoice]
Verify Voucher … Capture Filing          :: never activated
```

## Side finding — the checklist defect changes reject behaviour

`CLAUDE.md` records that the four *Business Unit Response* Yes/No questions on Prepare Voucher are
**mandatory for every outcome including reject**, and that submitting without them raises four inline
"Please select an option" errors.

That is no longer true. Because the checklist never renders
(`POST /api/services/Enterprise/CheckList/Initialise` → **404**), **both** reject submissions went
through with **no validation errors at all** — only the Outcome radio was set. This is the same
underlying defect, but it is worth recording that its blast radius includes the reject path, not just
the happy path: a rejection can now be recorded with no Business Unit Response captured.
→ [bugs/2026-07-31-prepare-voucher-checklist-initialise-404.md](../bugs/2026-07-31-prepare-voucher-checklist-initialise-404.md)

## App-text quirks (cosmetic)
- Certify's happy-path decision logs as **"Pay Invoice"**.
- The send-back decision logs as **"Pay Invoice-Prepare Voucher"**.
- Compare the previously recorded **"RjectInvoice"** and **"Sumbit"** typos — the decision labels
  generally read like internal identifiers rather than user-facing text.

## Not covered
- The two **query branches** (business / supplier) off Prepare Voucher — next up.
- Rejection reached from *Certify Invoice* (the "not delivered" outcome) rather than from Prepare
  Voucher; the plan notes it as an alternative entry point to the same review step.
