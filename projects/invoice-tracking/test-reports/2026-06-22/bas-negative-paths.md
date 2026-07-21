# Report: BAS — Negative Paths (Rejection + Queries)

**Date:** 2026-06-22 09:56 UTC
**Plan:** test-plans/invoice-process/bas.md (TC-05 neg, TC-06, TC-08, TC-09)
**Spec:** n/a — driven live via Playwright MCP (multi-role workflow)
**Execution Mode:** ai-driven (live MCP)
**Result:** PASSED
**Duration:** ~30 min (incl. role switches)

## Summary
| Total Steps | Passed | Failed | Skipped |
|-------------|--------|--------|---------|
| 12 | 12 | 0 | 0 |

Two seed items were driven through every BAS negative branch, live, switching role logins as each step handed off:

- **PAY9908/2026** — OMNI TECHNOLOGIES, INV-3625550, R5000 — rejection branches (Neg-A + Neg-B)
- **PAY9814/2026** — OMNI TECHNOLOGIES, IKL-4567, R99000 — Prepare-Voucher query branches (Neg-C)

**Role map confirmed (all pwd 123qwe):** ThulileM = Invoice Capturer + assigns Branch Finance Admin + **Review Invoice Rejection reviewer**; TaniaSmith = Branch Finance Admin + Responsible Person + Certifier + Voucher Preparer + **Business/Supplier Query responder** (the query steps route to the preparer in this config — message shows "from Tania Smith to Tania Smith").

## Step Results

### Neg-A + Neg-B — TC-06 Review Invoice Rejection (PAY9908)
**Mode:** ai-driven (live MCP). Actors: ThulileM (assign BFA, review), TaniaSmith (assign RP, certify).
- [PASS] Assign Branch Finance Admin = Tania Smith → routed to Assign Responsible Person
- [PASS] Assign Responsible Person = Tania Smith → Certify Invoice opened directly (same actor)
- [PASS] Certify with **"Goods/Service NOT delivered – invoice should not be paid"** + reject comment → routed to **Review Invoice Rejection** (lands in ThulileM's Inbox → BAS reviewer = ThulileM)
- [PASS] **Neg-B (send-back):** Verification Outcome = **"Send for Invoice Verification"** + comment → item returned to **Certify Invoice** (Tania's queue)
- [PASS] Re-certify as rejected again → returns to Review Invoice Rejection
- [PASS] **Neg-A (terminal):** Verification Outcome = **"Approve Rejection"** + comment in the Approve-payment-rejection dialog → Submit
- [PASS] (BLOCKING) Workflow detail shows status **Rejected**; Rejection panel records Payment Type = BAS and the terminal comment

### Neg-C — TC-08 Business Related Query (PAY9814)
**Mode:** ai-driven (live MCP). Actor: TaniaSmith (preparer). Preceded by Assign BFA (ThulileM) → Assign RP + Certify-PASS (Tania).
- [PASS] Certify-PASS ("delivered satisfactory – should be paid") → routed to **Prepare Voucher**
- [PASS] Prepare Voucher outcome = **"Send for business related query"**; Business Unit Response checklist (4 items) all answered **Yes** (checklist is mandatory even for the query branch)
- [PASS] Query text entered in the Business-related-query dialog + Ok → routed to **Resolve Queries**
- [PASS] (BLOCKING) Confirm "all queries resolved" checkbox + Submit → item **routed back to Prepare Voucher**

### Neg-C — TC-09 Supplier Related Query (PAY9814)
**Mode:** ai-driven (live MCP). Actor: TaniaSmith (preparer).
- [PASS] Back at Prepare Voucher, outcome = **"Send for supplier related query"**; BU Response checklist all **Yes**
- [PASS] Query text entered in the Supplier-related-query dialog + Ok → routed to **Manage Supplier Related Queries** (status **Awaiting Supplier Response**)
- [PASS] (BLOCKING) Confirm "all supplier related queries resolved" checkbox + Submit → item **routed back to Prepare Voucher**

## Notes / observations
- **Send-back is non-terminal:** "Send for Invoice Verification" from Review Invoice Rejection returns the item to the Certify Invoice step (not to the applicant), letting the certifier change or maintain the rejection.
- **Approve Rejection is terminal:** the workflow ends with status **Rejected** — no payment, no further steps.
- **Query branches are non-terminal loops:** both the business and supplier query outcomes hand the item to a resolve/manage step that, once confirmed, routes the item straight **back to Prepare Voucher** so the voucher can be completed or re-queried.
- **BU Response checklist is mandatory on every Prepare-Voucher submit**, including the query branches — leaving it blank raises "Please select an option" on all four items.
- **Reject Invoice** (4th Prepare-Voucher outcome) was not separately exercised here — it routes to Review Invoice Rejection, the same terminal/​send-back logic already covered by Neg-A/Neg-B from the Certify step.
- PAY9814 is left parked at **Prepare Voucher** (both query branches exercised); PAY9908 is **Rejected** (terminal).

## Outstanding
- Discover the dedicated role logins (if any) for Review Invoice Rejection / Query responders in a production-style config — here they resolved to ThulileM (review) and TaniaSmith (queries), i.e. the same accounts already in the chain.
