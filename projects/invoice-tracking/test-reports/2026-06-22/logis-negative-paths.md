# Report: LOGIS — Negative Paths (Rejection + Business/Supplier Queries)

**Date:** 2026-06-22 14:11 UTC
**Plan:** test-plans/invoice-process/logis.md (TC-06 Review Invoice Rejection, TC-09 Business Related Query, TC-10 Supplier Related Query)
**Spec:** n/a — driven live via Playwright MCP (multi-role)
**Execution Mode:** ai-driven (live MCP)
**Result:** PASSED — all three LOGIS negative branches exercised on our own invoices
**Duration:** ~17 min

## Summary
Two brand-new **LOGIS** Request For Payment invoices were **registered by us** and driven to exercise the three previously-skipped LOGIS negative branches.

| Branch | Ref | Order | Outcome |
|---|---|---|---|
| **TC-06** Review Invoice Rejection | PAY10285/2026 | OR-121884 (SULLEIMAN OLIFANT) | terminal **Rejected** |
| **TC-09** Business Related Query | PAY10288/2026 | OR-121877 (NIGEL HOLMES) | non-terminal loop → back to Verify Invoice |
| **TC-10** Supplier Related Query | PAY10288/2026 | OR-121877 (NIGEL HOLMES) | non-terminal loop → back to Verify Invoice |

## Role map (all pwd 123qwe)
MoshadiM = SCM Capturer (Register) · TaniaSmith = Business Unit (Certify / Verify Invoice / query responder / rejection reviewer) · **KamogeloS = Kamogelo Shabangu (Approve Invoice)** · **SarahM = Sarah Mohlala, SCM Supervisor (Assign Responsible Official)**.

## TC-06 — Rejection path → Rejected (PAY10285/2026)
- [PASS] Register & Upload (MoshadiM): Order OR-121884, INV-OLI-0622REJ, line item ADMIN FEE R23; Business Unit set to Tania Smith → Submit → Received
- [PASS] Certify Invoice (TaniaSmith): Business Unit Response = **"Goods or Service has not been delivered or delivered to an unacceptable standard - Invoice should not be paid"** → Submit → **Reject Invoice** dialog (mandatory comment) → Ok → routed to Review Invoice Rejection
- [PASS] Review Invoice Rejection (TaniaSmith): Verification Outcome = **Approve Rejection** → Submit → **Approve payment rejection** dialog (mandatory comment) → Ok
- [PASS] (BLOCKING) Workflow detail shows terminal status **Rejected** (audit decision: WrongPerson n/a; Certify decision routed to rejection, Approve Rejection ended it)

## TC-09 + TC-10 — Query branches (PAY10288/2026)
Full chain driven to the Verify Invoice step, then both query branches exercised:
- [PASS] Register (MoshadiM, OR-121877, INV-NH-0622QRY, ADMIN FEE R132, BU=Tania Smith) → Received
- [PASS] Certify Invoice (TaniaSmith) = delivered satisfactory → **Approve Invoice**
- [PASS] Approve Invoice (**Kamogelo Shabangu / KamogeloS**) = delivered satisfactory → **Assign Responsible Official**
- [PASS] Assign Responsible Official (**Sarah Mohlala / SarahM**): Official = Tania Smith → **Verify Invoice**
- [PASS] **TC-09 Business query:** Verify Invoice → "Send for business related query" + 7-item Business Unit Response checklist (all Yes) + query comment → **Respond to Queries** step (received by Business Unit) → confirm resolved checkbox → Submit → looped back to **Verify Invoice**
- [PASS] **TC-10 Supplier query:** Verify Invoice → "Send for supplier related query" + checklist (all Yes) + query comment → **Manage Supplier Related Queries** step (status "Awaiting Supplier Response") → confirm resolved checkbox → Submit → looped back to **Verify Invoice**
- Invoice parked at Verify Invoice (Active) — query branches are non-terminal; scope was the negative branches, not a full run to Paid.

## Notes / discoveries
- **LOGIS approver login discovered: `KamogeloS` / 123qwe (Kamogelo Shabangu)** — needed for the Approve Invoice step. Previously only the name was known.
- The LOGIS **Verify Invoice** step (form `SAGovRequestForPayment-wf-MatchtoOrderandVerifyInvoice`) is where the query/reject branches live, with 4 Order Matching Outcomes: business query / supplier query / Verification is complete / Reject Invoice. A **7-item Business Unit Response checklist** must be answered on submit for the query branches (mirrors BAS's mandatory checklist).
- Each query branch routes to its own response step (Respond to Queries for business; Manage Supplier Related Queries for supplier) and loops back to Verify Invoice on confirm — neither is terminal.
- The rejection branch is reachable from **Certify Invoice** ("not delivered") directly into the Reject Invoice dialog → Review Invoice Rejection → Approve Rejection = terminal Rejected. (Also reachable from Approve Invoice and from Verify Invoice's "Reject Invoice" outcome.)
- ⚠️ **Order line-item capacity:** an order's line items show **Max: 0** (un-selectable) once consumed by a prior in-flight invoice — KZ-016642 was exhausted by PAY10280, so PAY10285/10288 used fresh orders (OR-121884, OR-121877). Pick an order whose line items still show available Max ≥ 1.
- Changing the Order on the register form resets the Business Unit and clears the invoice line; re-set BU (typeahead + keyboard ArrowDown+Enter commits the selection reliably) and re-add the invoice row.

## LOGIS coverage now
- Happy path (TC-01→03,05,07,08,11→16) — previously passed (PAY10093 → Paid + Filed)
- TC-04 Re-route to Correct Business Unit — passed (PAY10280, this date)
- **TC-06 Rejection — passed (PAY10285, this run)**
- **TC-09 Business query — passed (PAY10288, this run)**
- **TC-10 Supplier query — passed (PAY10288, this run)**
