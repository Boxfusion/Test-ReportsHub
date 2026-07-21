# Report: BAS — Full Chain incl. Supplier Query (PAY10259, our own invoice)

**Date:** 2026-06-22 11:27 UTC
**Plan:** test-plans/invoice-process/bas.md (TC-02 → TC-14, plus TC-09 supplier-query branch ×2)
**Spec:** n/a — driven live via Playwright MCP (multi-role)
**Execution Mode:** ai-driven (live MCP)
**Result:** PASSED — invoice **Paid + Filed**
**Duration:** ~35 min (incl. role switches + file-import prep)

## Summary
A brand-new BAS invoice was **registered by us** (not an existing/other-person item, per the always-create-our-own rule) and driven end-to-end, exercising the **Send for supplier related query** branch twice before completing to Paid + Filed.

- **Ref:** PAY10259/2026 — OMNI TECHNOLOGIES (EM583), **INV-OMNI-0622A**, R4500, attachment neg-invoice.
- **Payment Number 10259** assigned by the BAS report import.

## Role map (all pwd 123qwe)
ThulileM = Capturer + Assign BFA + Verifier + Authoriser · TaniaSmith = Branch Finance Admin + Responsible Person + Certifier + Voucher Preparer + supplier-query responder · Admin = BAS report + Payment stub imports · GwenB = Capture Filing.

## Step results
- [PASS] TC-02 Register & Upload (ThulileM): supplier via ellipsis picker (OMNI), invoice line 01/06/2026 + 05/06/2026 + INV-OMNI-0622A + R4500 + attachment, plus-circle Add, Submit → Assign BFA
- [PASS] Assign Branch Finance Admin = Tania Smith → Assign Responsible Person
- [PASS] Assign Responsible Person = Tania Smith → Certify (opened directly)
- [PASS] TC-05 Certify = "delivered satisfactory – should be paid" → Prepare Voucher
- [PASS] **TC-09 Supplier query (round 1):** Prepare Voucher → "Send for supplier related query" + checklist + query → Manage Supplier Related Queries → confirm resolved → back to Prepare Voucher
- [PASS] **TC-09 Supplier query (round 2):** same branch again → resolved → back to Prepare Voucher
- [PASS] TC-07 Prepare Voucher = "Verification is complete" + BU checklist (all Yes) → Verify Voucher
- [PASS] TC-10 Verify Voucher (ThulileM): Batch Number BATCH-ITS-0259 + confirm → Authorise (opened directly)
- [PASS] TC-11 Authorise Invoice Voucher (ThulileM): confirm → Final Authorise Payment (status Approved)
- [PASS] TC-12 BAS Report Import (Admin): `bas-report-PAY10259.xlsx` → History **Is Success=Yes, Payments Authorised=1** → routed to Attach Payment Stub
- [PASS] TC-13 Payment Stub Import (Admin): `payment-stub-PAY10259.txt` → History **Is Success=Yes, Payments Confirmed=1**; invoice status → **Paid** → routed to Capture Filing
- [PASS] (BLOCKING) TC-14 Capture Filing (GwenB): Batch BATCH-ITS-0259 + Box BOX-027 + File Range F2600-F2620 + confirm → Submit → process ends; workflow detail shows **Paid**, Payment Number **10259** on the invoice line

## Import file prep (proven method)
- **BAS report:** copied known-good `bas-report-PAY10087.xlsx` (forward-slash OOXML entries, proven to import), edited in place via `System.IO.Compression.ZipArchive` Update — sheet1.xml: FUNC NO 10087→10259, dates 46192→46195 (22/06) ×3, 46191→46174 (01/06), AMOUNT 3200→4500; sharedStrings.xml: INV-MAAKE-019→INV-OMNI-0622A, Maake→OMNI TECHNOLOGIES, Maaa123→EM583. (Avoided PAY9991 template — its zip entries use backslash separators and previously null-reffed the importer.) Saved as `test-data/bas-report-PAY10259.xlsx`.
- **Payment stub:** copied `payment-stub-PAY10087.txt`, length-preserving edits on the single data line — `INV-MAAKE-019 `→`INV-OMNI-0622A` (14→14), 10087→10259, 3,200.00→4,500.00; total byte length unchanged (8766). Saved as `test-data/payment-stub-PAY10259.txt`.

## Notes
- Supplier-query branch is a non-terminal loop back to Prepare Voucher (exercised twice here); the chain only advances once "Verification is complete" is chosen.
- Confirms the full BAS happy-path + supplier-query branch is repeatable on a self-created invoice. Reusable edited import files now in `test-data/` (PAY10259).
