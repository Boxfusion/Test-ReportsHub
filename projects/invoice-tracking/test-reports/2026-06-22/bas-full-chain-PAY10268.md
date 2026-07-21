# Report: BAS — Full Chain incl. Business Related Query (PAY10268, our own invoice)

**Date:** 2026-06-22 11:46 UTC
**Plan:** test-plans/invoice-process/bas.md (TC-02 → TC-14, plus TC-08 business-query branch)
**Spec:** n/a — driven live via Playwright MCP (multi-role)
**Execution Mode:** ai-driven (live MCP)
**Result:** PASSED — invoice **Paid + Filed**
**Duration:** ~14 min

## Summary
A brand-new BAS invoice was **registered by us** and driven end-to-end, exercising the **Send for business related query** branch before completing to Paid + Filed.

- **Ref:** PAY10268/2026 — OMNI TECHNOLOGIES (EM583), **INV-OMNI-0623B**, R5200, attachment neg-invoice.
- **Payment Number 10268** assigned by the BAS report import.

## Step results
- [PASS] TC-02 Register & Upload (ThulileM): OMNI supplier, 02/06/2026 + 06/06/2026 + INV-OMNI-0623B + R5200 + attachment → Submit → Assign BFA
- [PASS] Assign Branch Finance Admin = Tania Smith → Assign Responsible Person = Tania Smith → Certify (opened directly)
- [PASS] TC-05 Certify = "delivered satisfactory – should be paid" → Prepare Voucher
- [PASS] **TC-08 Business related query:** Prepare Voucher → "Send for business related query" + BU checklist (all Yes) + query comment → Resolve Queries → confirm → back to Prepare Voucher
- [PASS] TC-07 Prepare Voucher = "Verification is complete" + checklist → Verify Voucher
- [PASS] TC-10 Verify Voucher (ThulileM): Batch BATCH-ITS-0268 + confirm → Authorise (opened directly)
- [PASS] TC-11 Authorise (ThulileM): confirm → Final Authorise Payment (Approved)
- [PASS] TC-12 BAS Report Import (Admin): `bas-report-PAY10268.xlsx` → History **Is Success=Yes, Payments Authorised=1**
- [PASS] TC-13 Payment Stub Import (Admin): `payment-stub-PAY10268.txt` → History **Is Success=Yes, Payments Confirmed=1**; status → **Paid**
- [PASS] (BLOCKING) TC-14 Capture Filing (GwenB): Batch BATCH-ITS-0268 + Box BOX-028 + File Range F2700-F2720 + confirm → Submit → process ends; workflow detail shows **Paid**, Payment Number **10268**

## Import file prep
- BAS report: based on `bas-report-PAY10087.xlsx` (forward-slash OOXML, proven), ZipArchive in-place edits — FUNC NO 10087→10268, dates 46192→46195 (22/06) ×3, 46191→46175 (02/06), AMOUNT 3200→5200; sharedStrings INV-MAAKE-019→INV-OMNI-0623B, Maake→OMNI TECHNOLOGIES, Maaa123→EM583. Saved `test-data/bas-report-PAY10268.xlsx`.
- Payment stub: based on `payment-stub-PAY10087.txt`, length-preserving — `INV-MAAKE-019 `→`INV-OMNI-0623B`, 10087→10268, 3,200.00→5,200.00 (byte length unchanged, 8766). Saved `test-data/payment-stub-PAY10268.txt`.

## Notes
- Business-query branch is a non-terminal loop back to Prepare Voucher; chain advances once "Verification is complete" is chosen.
- Complements PAY10259 (same chain via the supplier-query branch). Both confirm the BAS happy-path + query branches are repeatable on self-created invoices.
