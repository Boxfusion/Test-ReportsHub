# Report: BAS — FULL CHAIN COMPLETE (PAY10051/2026, supplier Maake)

**Date:** 2026-06-18 11:08 UTC
**Plan:** test-plans/invoice-process/bas.md (TC-02 … TC-14, all happy-path steps)
**Execution Mode:** live MCP-driven, headed
**Result:** ✅ PASSED end-to-end — invoice **Paid** and **Filed**
**Item:** PAY10051/2026 — supplier **Maake** (Maaa123), INV-MAAKE-001, R2,500.00, Payment Number **10051**

## End-to-end chain (all steps PASSED)
| # | Step (ADO) | Login | Outcome |
|---|-----------|-------|---------|
| TC-02 | Register & Upload Invoice (#102362) | ThulileM | → Assign Branch Finance Admin |
| TC-03 | Assign Branch Finance Admin = Tania Smith (#102369) | ThulileM | → Assign Responsible Person |
| TC-04 | Assign Responsible Person = Tania Smith (#102370) | TaniaSmith | → Certify Invoice |
| TC-05 | Certify Invoice — delivered satisfactory (#102372) | TaniaSmith | → Prepare Voucher |
| TC-07 | Prepare Voucher — Verification complete + checklist (#102361) | TaniaSmith | → Verify Voucher |
| TC-10 | Verify Voucher — Batch BATCH-MAAKE-001 (#102380) | ThulileM | → Authorise Invoice Voucher |
| TC-11 | Authorise Invoice Voucher (#102383) | ThulileM | → Final Authorise Payment (Approved) |
| TC-12 | Final Authorise Payment — **BAS Report import** (#102360) | Admin | Payments Authorised 1 → Attach Payment Stub |
| TC-13 | Attach Payment Stub — **Payment Stub import** (#102359) | Admin | Payments Confirmed 1 → **Paid** → Capture Filing |
| TC-14 | Capture Filing — Box BOX-001, File Range FILE-001-010 (#102358) | GwenB (Gwen Simbeni) | ✅ Process ended, invoice filed |

## The two file-import steps (previously blocked)
- **BAS Report import (TC-12):** edited the downloaded working .xlsx **in place** — copied the original, then via PowerShell `System.IO.Compression.ZipFile.Open(...,'Update')` rewrote ONLY `xl/sharedStrings.xml` + `xl/worksheets/sheet1.xml` (row 10 = PAY10051: FUNC NO 10051, ENT Maaa123, Capture ID 15987634, INV-MAAKE-001, Sundry, dates, 2500). Import = **Success, Payments Authorised 1**. (The earlier failure was caused by `ZipFile.CreateFromDirectory` rebuilding the package — fixed by in-place edit.)
- **Payment Stub import (TC-13):** the stub is a **fixed-width .txt** (RP007BS). Edited one transaction row preserving exact column offsets (SOURCE DOC@2, PO@36, PAYMENT NUMBER@70, FUNC AREA@81, USER@93, AMOUNT right-edge@128): INV-MAAKE-001 / NOT APPLIC / 10051 / CL / 15987634 / 2,500.00. Import = **Success, Payments Confirmed 1**, invoice → **Paid**.

## Roles confirmed (all password 123qwe)
- **ThulileM** (Thulile Matekanya) — Invoice Capturer + Verifier + Authoriser
- **TaniaSmith** (Tania Smith) — Branch Finance Admin + Responsible Person + Voucher Preparer
- **Admin** (System Administrator) — BAS Report & Payment Stub imports
- **GwenB** (Gwen Simbeni) — Capture Filing

## Key learnings
- Payment Number is **assigned by the BAS report import** (FUNC NO → Payment Number); there is no manual Payment-Number field anywhere in the workflow.
- BAS report column → field mapping confirmed (see memory its-bas-report-field-mapping).
- Edit import files **preserving the original package/format**; never rebuild via CreateFromDirectory.

## Artifacts
- `test-data/bas-report-PAY10051.xlsx`, `test-data/payment-stub-PAY10051.txt`
- Also completed earlier: PAY9991/2026 BAS import (by user) — that item is at Attach Payment Stub.
