# Report: BAS — Full Chain End-to-End (PAY10301, our own invoice)

**Date:** 2026-06-23 08:29 UTC
**Plan:** test-plans/invoice-process/bas.md (TC-01 → TC-14, happy path)
**Spec:** n/a — driven live via Playwright MCP (multi-role)
**Execution Mode:** ai-driven (live MCP)
**Result:** PASSED — invoice **Paid + Filed**
**Duration:** ~15 min

## Summary
A brand-new BAS invoice was **registered by us** and driven through the complete lifecycle to Paid + Filed, exercising every role hand-off and both file-import steps.

- **Ref:** PAY10301/2026 — OMNI TECHNOLOGIES (EM583), **INV-OMNI-0623E**, R4800, attachment neg-invoice + supporting pdf-test.pdf.
- **Payment Number 10301** assigned by the BAS report import.
- **Batch:** BATCH-ITS-0301 · **Box:** BOX-0301 · **File Range:** F3010-F3030.

## Role chain
| Step | Role / login |
|---|---|
| TC-02 Register & Upload | ThulileM |
| TC-03 Assign Branch Finance Admin | ThulileM → BFA = Tania Smith |
| TC-04 Assign Responsible Person | TaniaSmith → Official = Tania Smith |
| TC-05 Certify | TaniaSmith |
| TC-07 Prepare Voucher | TaniaSmith |
| TC-10 Verify Voucher | ThulileM |
| TC-11 Authorise Invoice Voucher | ThulileM |
| TC-12 BAS Report Import | Admin |
| TC-13 Payment Stub Import | Admin |
| TC-14 Capture Filing | GwenB |

## Step results
- [PASS] TC-01 Login (ThulileM) → homepage
- [PASS] TC-02 Register & Upload: OMNI supplier, Date Received 23/06/2026 (auto), Invoice 20/06/2026 + Service Delivery 20/06/2026 + INV-OMNI-0623E + R4800 + invoice attachment + supporting doc → Submit → routed to Assign Branch Finance Admin
- [PASS] TC-03 Assign Branch Finance Admin = Tania Smith → Assign Responsible Person
- [PASS] TC-04 Assign Responsible Person = Tania Smith (TaniaSmith login) → Certify (opened directly)
- [PASS] TC-05 Certify = "Goods and Service delivered satisfactory – Invoice should be paid" → Prepare Voucher (opened directly)
- [PASS] TC-07 Prepare Voucher = "Verification is complete" + Business Unit Response checklist (all 4 = Yes) → Verify Voucher
- [PASS] TC-10 Verify Voucher (ThulileM): Batch BATCH-ITS-0301 + confirm checkbox → Authorise (opened directly)
- [PASS] TC-11 Authorise Invoice Voucher (ThulileM): confirm checkbox → Final Authorise Payment (status Approved)
- [PASS] TC-12 BAS Report Import (Admin): `bas-report-PAY10301.xlsx` → History **Is Success=Yes, Payments Authorised=1**; Payment Number 10301 assigned
- [PASS] TC-13 Payment Stub Import (Admin): `payment-stub-PAY10301.txt` → History **Is Success=Yes, Rows Affected=4, Payments Confirmed=1**; status → **Paid**
- [PASS] (BLOCKING) TC-14 Capture Filing (GwenB): Batch BATCH-ITS-0301 + Box BOX-0301 + File Range F3010-F3030 + confirm → Submit → process ends; invoice **Paid + Filed**, Payment Number **10301**

## Import file prep
- **BAS report:** based on `bas-report-PAY10268.xlsx` (proven OOXML), in-place ZipArchive edit of `xl/worksheets/sheet1.xml` + `xl/sharedStrings.xml` — FUNC NO 10268→**10301**, AMOUNT 5200→**4800**, INV DATE 46175→**46193** (20/06/2026), INV RECDTE/CAPTURE/AUTH 46195→**46196** (23/06/2026), SOURCE DOC NUMBER `INV-OMNI-0623B`→`INV-OMNI-0623E`. Supplier OMNI TECHNOLOGIES / EM583 unchanged. Saved `test-data/bas-report-PAY10301.xlsx`.
- **Payment stub:** based on `payment-stub-PAY10268.txt`, length-preserving binary edit — `INV-OMNI-0623B`→`INV-OMNI-0623E`, `10268`→`10301`, `5,200.00`→`4,800.00` (byte length unchanged, 8766). Saved `test-data/payment-stub-PAY10301.txt`.

## Notes
- The pure happy path (no query/reject branches) is repeatable end-to-end on a self-created invoice. Complements PAY10259 (supplier-query branch) and PAY10268 (business-query branch).
- Submit on each step auto-opened the next step when the same user held the next role (Assign RP→Certify→Prepare for Tania; Verify→Authorise→Final Authorise for Thulile); cross-role hand-offs were picked up from the Inbox after re-login.
- The uploaded .txt invoice attachment was auto-converted to `neg-invoice.pdf` by the system.
