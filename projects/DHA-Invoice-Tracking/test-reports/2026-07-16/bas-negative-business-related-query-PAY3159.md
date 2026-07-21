# Report: BAS Negative — Business Related Query (PAY3159/2026)

**Date:** 2026-07-16 18:16 UTC
**Plan:** test-plans/invoice-process/bas.md (TC-07 query branch → TC-08 Respond to Queries)
**App:** DHA SmartGov Invoice Tracking — https://dha-smartgov-adminportal-qa.shesha.app/ (QA)
**Execution Mode:** ai-driven (live MCP browser)
**Result:** ✅ PASSED — query raised at Prepare Voucher, resolved by Business Unit, routed back to Prepare Voucher
**Item:** PAY3159/2026 — Supplier VANG GROUP (MAAA0868598), Invoice DHA-INV-3159, R 9,200

## Scenario
Verify the **"Send for business related query"** branch from **Prepare Voucher**: it must capture a mandatory query, route to a Business Unit responder ("Resolve Queries"), and on resolution route the item **back to Prepare Voucher**.

## Steps & result
| # | Step | Login | Outcome |
|---|------|-------|---------|
| 1 | Register & Upload Invoice | Admin | PAY3159 created (VANG GROUP, DHA-INV-3159, R9,200) |
| 2 | Assign Branch Finance Admin = Thabiso Maake | Thabiso Maake | → Assign Responsible Person |
| 3 | Assign Responsible Person = Thabiso Maake | Thabiso Maake | → Certify Invoice |
| 4 | Certify Invoice (delivered satisfactory) | Thabiso Maake | → Prepare Voucher |
| 5 | Prepare Voucher — Outcome = **Send for business related query** (+ 4-item Business Unit Response checklist = Yes, all required) | Thabiso Maake | [PASS] query dialog appeared |
| 6 | Query dialog — **mandatory comment** enforced (Ok disabled until text): *"Please confirm the cost centre and budget allocation…"* | Thabiso Maake | [PASS] → routed to **Resolve Queries** (Business Unit group) |
| 7 | Resolve Queries — reviewed query message, ticked "I confirm that all queries have been resolved…" | **Mutshutshut** (Mutshutshu Tshithukhe) | [PASS] Submit |
| 8 | Routing verification (audit trail) | — | [PASS] **Resolve Queries completed → Prepare Voucher Active (Thabiso Maake)** — round-trip back to origin |

## Key findings
- **Prepare Voucher requires the 4-item Business Unit Response checklist** (all "Please select an option") even when the outcome is a query, not just for "Verification is complete".
- Selecting "Send for business related query" opens a **"Send for business related query" dialog** with a mandatory Comments field (Ok stays disabled until text is entered) — form `SAGovRequestForPayment-wf-MatchtoOrderandVerifyInvoice-BusinessRelatedQuery-dialog`.
- The query routes to a **"Resolve Queries"** step owned by the **Business Unit** group. The audit message reads *"Message from Thabiso Maake to <responder>: …"*.
- On resolution (confirm checkbox → Submit) the item **routes back to Prepare Voucher** (the originating step), with status still **Certified**.

## Role note
The Business Unit / "Resolve Queries" group had no usable QA login among the standard set (the intended user *Hlekanei* isn't on `123qwe`). The test lead **added Mutshutshu (Mutshutshut / 123qwe) to the Business Unit role** so the query could be resolved. Record for future BAS query tests: **Business Related Query responder = Mutshutshut**.

## Continuation — completed to Paid + Filed (positive path)
After the query resolved and routed back to Prepare Voucher, the invoice was driven through the rest of the BAS chain on the **"Verification is complete"** outcome (per instruction to complete all steps):
- Prepare Voucher (Verification complete + checklist) → Verify Voucher (Batch BATCH-3159) → Authorise Invoice Voucher — all **Thabiso Maake**
- Final Authorise Payment — **BAS report import** (Admin): edited row Invoice DHA-INV-3159 / Supplier MAAA0868598 / Amount 9200 / Source Doc Type **SUNDRY** / FUNC NO 3159 → Is Success=Yes, **Payments Authorised 1**
- Attach Payment Stub — **Payment Stub import** (Admin): payment no 3159, PO **NOT APPLIC** (BAS), amount 9,200.00 → Is Success=Yes, **Payments Confirmed 1** → **Paid**
- Capture Filing — **Mutshutshut**: Batch BATCH-3159, Box BOX-3159, File Range FILE-3159-001-010 → process ended, **Filed**

Audit trail (0 active steps) records the full path incl. the query round-trip: Register → Assign BFA → Assign Responsible Person → Certify → Prepare Voucher → **Resolve Queries** → Prepare Voucher → Verify Voucher → Authorise → Upload BAS Report → Final Authorise → Attach Payment Stub → Capture Filing. **PAY3159 = Paid + Filed.** Artifacts: `test-data/bas-report-PAY3159.xlsx`, `test-data/payment-stub-PAY3159.txt`.

## Remaining negative scenarios (per plan)
- Supplier Related Query (Prepare Voucher → "Send for supplier related query")
- Reject Invoice / Review Invoice Rejection (Prepare Voucher → "Reject Invoice"; Certify → not-delivered)
