# Report: BAS Negative — Supplier Related Query (PAY3167/2026)

**Date:** 2026-07-16 20:55 UTC
**Plan:** test-plans/invoice-process/bas.md (TC-07 query branch → Manage Supplier Related Queries)
**App:** DHA SmartGov Invoice Tracking — https://dha-smartgov-adminportal-qa.shesha.app/ (QA)
**Execution Mode:** ai-driven (live MCP browser)
**Result:** ✅ PASSED — supplier query raised at Prepare Voucher, resolved by Business Unit, routed back to Prepare Voucher, then completed to **Paid + Filed**
**Item:** PAY3167/2026 — Supplier VANG GROUP (MAAA0868598), Invoice DHA-INV-3167, R 7,400, Payment No **3167**

## Scenario
Verify the **"Send for supplier related query"** branch from **Prepare Voucher**: it must capture a mandatory query, route to a supplier-query handler, and on resolution route the item **back to Prepare Voucher**. Then (per standing instruction) complete the invoice via "Verification is complete".

## Steps & result
| # | Step | Login | Outcome |
|---|------|-------|---------|
| 1 | Register & Upload Invoice | Admin | PAY3167 created (VANG GROUP, DHA-INV-3167, R7,400) |
| 2 | Assign Branch Finance Admin = Thabiso Maake | Thabiso Maake | → Assign Responsible Person |
| 3 | Assign Responsible Person = Thabiso Maake | Thabiso Maake | → Certify Invoice |
| 4 | Certify Invoice (delivered satisfactory) | Thabiso Maake | → Prepare Voucher |
| 5 | Prepare Voucher — 4-item checklist = Yes, then Outcome = **Send for supplier related query** | Thabiso Maake | [PASS] supplier query dialog appeared |
| 6 | Query dialog — **mandatory comment** enforced (Ok disabled until text): banking-details mismatch query | Thabiso Maake | [PASS] → routed to **Manage Supplier Related Queries** (Business Unit group); status **Awaiting Supplier Response** |
| 7 | Manage Supplier Related Queries — reviewed query, ticked "I confirm that all supplier related queries have been resolved…" | **Mutshutshut** (Mutshutshu Tshithukhe) | [PASS] Submit → routed back to **Prepare Voucher** |
| 8 | Prepare Voucher — 4-item checklist = Yes + Outcome = **Verification is complete** | Thabiso Maake | [PASS] → Verify Voucher |
| 9 | Verify Voucher (Batch BATCH-3167) | Thabiso Maake | [PASS] → Authorise Invoice Voucher |
| 10 | Authorise Invoice Voucher (confirm) | Thabiso Maake | [PASS] → BAS import step |
| 11 | Upload Captured Invoices Report From BAS — **BAS report import** | Admin | [PASS] Is Success=Yes, **Payments Authorised 1** (Invoice DHA-INV-3167 / Supplier MAAA0868598 / Amount 7400 / Source Doc Type **SUNDRY** / FUNC NO 3167 → Payment No 3167) |
| 12 | Attach Payment Stub — **Payment Stub import** | Admin | [PASS] Is Success=Yes, **Payments Confirmed 1** (payment no 3167, PO **NOT APPLIC**, 7,400.00) → **Paid** |
| 13 | Capture Filing (Batch/Box/File Range = 3167) | Mutshutshut | [PASS] process ended → **Filed** |

## Key findings
- **Supplier Related Query routes to a distinct step "Manage Supplier Related Queries"** (form `SAGovRequestForPayment-BAS-wf-ManageSupplierRelatedQueries-Details`), and the overall workflow status shows **"Awaiting Supplier Response"** while it is open — different labelling from the Business Related Query (which uses "Resolve Queries"), but both are **received by the Business Unit group**.
- The query dialog is `SAGovRequestForPayment-wf-MatchtoOrderandVerifyInvoice-SupplierRelatedQuery-dialog` with a **mandatory Comments field** (Ok stays disabled until text is entered).
- Prepare Voucher still requires the **4-item Business Unit Response checklist = Yes** even when the outcome is a supplier query.
- **Gotcha handled:** the Outcome radio resets to "Verification is complete" after the checklist re-renders — so the checklist Yes radios were set **first**, then the query outcome selected **last**, right before Submit. This correctly produced the supplier-query branch.
- On resolution (confirm checkbox → Submit) the item **routes back to Prepare Voucher** (originating step), status still **Certified**.

## Role note
As with the Business Related Query, the "Manage Supplier Related Queries" step is owned by the **Business Unit** group; the intended user *Hlekanei* isn't on `123qwe`, so the test lead's earlier addition of **Mutshutshu (Mutshutshut / 123qwe) to the Business Unit role** was used to resolve. **Supplier Related Query responder = Mutshutshut.**

## Audit trail (0 active steps — process ended)
Register → Assign BFA → Assign Responsible Person → Certify → Prepare Voucher (**SendForSupplierRelatedQueries**) → **Manage Supplier Related Queries** (Business Unit / Mutshutshu) → Prepare Voucher (**VerificationComplete**) → Verify Voucher → Authorise → Upload BAS Report (auto) → Final Authorise (auto) → Attach Payment Stub (auto) → Capture Filing. **PAY3167 = Paid + Filed.**

## Artifacts
- `test-data/bas-report-PAY3167.xlsx` (edited BAS report, SUNDRY)
- `test-data/payment-stub-PAY3167.txt` (edited stub, PO NOT APPLIC)

## Remaining negative scenario (per plan)
- Reject Invoice / Review Invoice Rejection (Prepare Voucher → "Reject Invoice"; Certify → not-delivered)
