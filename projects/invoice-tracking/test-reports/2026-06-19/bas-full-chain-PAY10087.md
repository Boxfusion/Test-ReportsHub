# Report: BAS — Invoice Tracking Process (Full Chain, end-to-end)

**Date:** 2026-06-19 06:20 UTC
**Plan:** test-plans/invoice-process/bas.md
**Execution Mode:** ai-driven (live MCP browser, multi-role)
**Result:** PASSED
**Item:** PAY10087/2026 — Supplier **Maake** (Maaa123), Invoice **INV-MAAKE-019**, **R 3 200**, Payment Number **10087**
**Duration:** ~24 min (07:57–08:20 local)

## Summary
| Total TCs | Passed | Failed | Skipped |
|-----------|--------|--------|---------|
| 12 | 12 | 0 | 0 |

A brand-new BAS Request for Payment was registered and driven through every step of the
multi-role workflow to **Paid → Filed**. Each role hand-off was actioned under the correct
login. Both file-import steps (BAS Report `.xlsx`, Payment Stub `.txt`) were prepared by
editing the previously-working PAY10051 files **in place** (ZipArchive Update for the xlsx;
byte-length-preserving edit for the fixed-width stub) so the package/layout stayed intact —
no import errors.

## Roles used (all password `123qwe`)
| Login | Person | Steps actioned |
|-------|--------|----------------|
| ThulileM | Thulile Matekanya | Register & Upload, Assign Branch Finance Admin, Verify Voucher, Authorise Voucher |
| TaniaSmith | Tania Smith | Assign Responsible Person, Certify Invoice, Prepare Voucher |
| Admin | System Administrator | BAS Report import, Payment Stub import |
| GwenB | Gwen Simbeni | Capture Filing |

## Step Results
### TC-02 — Register and Upload Invoice (ThulileM)
- [PASS] Created draft **PAY10087/2026**; Date Received auto-filled 19/06/2026
- [PASS] Supplier picked via ellipsis → Select Item dialog (double-click Maake); Supplier Details populated (Maaa123)
- [PASS] Invoice line: Invoice Date 18/06/2026, Service Delivery 18/06/2026, INV-MAAKE-019, R3200, attachment uploaded
- [PASS] plus-circle committed the row (Total R3200); Submit routed to **Assign Branch Finance Admin**

### TC-03 — Assign Branch Finance Admin (ThulileM)
- [PASS] Branch Finance Admin combobox → **Tania Smith**; Submit → Assign Responsible Person

### TC-04 — Assign Responsible Person (TaniaSmith, Inbox)
- [PASS] Official combobox → **Tania Smith**; Submit → Certify Invoice (opened directly, same user)

### TC-05 — Certify Invoice (TaniaSmith)
- [PASS] "Goods and Service delivered satisfactory – Invoice should be paid"; Submit → Prepare Voucher

### TC-07 — Prepare Voucher (TaniaSmith)
- [PASS] Outcome "Verification is complete" + all 4 Business Unit Response items = Yes; Submit → Verify Voucher

### TC-10 — Verify Voucher (ThulileM, Inbox)
- [PASS] Batch Number **BATCH-ITS-019** + confirm checkbox; Submit → Authorise Invoice Voucher (opened directly)

### TC-11 — Authorise Invoice Voucher (ThulileM)
- [PASS] Confirm-and-approve checkbox; Submit → status **Approved**, routed to Upload Captured Invoices Report From BAS

### TC-12 — Final Authorise Payment / BAS Report Import (Admin)
- [PASS] Edited `bas-report-PAY10087.xlsx` in place (FUNC NO 10087, INV-MAAKE-019, R3200, dates 19/06 & 18/06, Capture ID 15987634, Source Doc Type Sundry)
- [PASS] BAS Report → BAS Report Import → Import; **Is Success = Yes, Payments Authorised = 1, 0 skipped**
- Payment Number **10087** assigned to the invoice by the import

### TC-13 — Attach Payment Stub (Admin)
- [PASS] Edited `payment-stub-PAY10087.txt` (fixed-width, columns preserved: 10087 / INV-MAAKE-019 / 3,200.00)
- [PASS] Payment Stubs Import → Import Payment Stub → Import; **Is Success = Yes, Payments Confirmed = 1, Rows Affected 4**
- Invoice status → **Paid**, routed to Capture Filing

### TC-14 — Capture Filing (GwenB, Inbox)
- [PASS] Filing Details: Batch **BATCH-ITS-019**, Box **BOX-019**, File Range **FILE 001-010** + confirm checkbox
- [PASS] (BLOCKING) Submit ended the process; PAY10087/2026 left the Capture Filing queue → **Filed**

## Notes
- The whole chain ran on **Live** form versions.
- BAS report import correctness was verified via the Import **History** tab (Is Success / Payments Authorised), not just absence of error.
- Working import files saved for reuse: `test-data/bas-report-PAY10087.xlsx`, `test-data/payment-stub-PAY10087.txt`.
