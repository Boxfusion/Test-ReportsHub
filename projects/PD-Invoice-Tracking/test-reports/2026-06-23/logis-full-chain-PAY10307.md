# Report: LOGIS Request for Payment — Full Chain E2E (PAY10307/2026, our own invoice)

**Date:** 2026-06-23 08:52 UTC
**Plan:** test-plans/invoice-process/logis.md (TC-01 → TC-16, happy path)
**Spec:** n/a — driven live via Playwright MCP (multi-role)
**Execution Mode:** ai-driven (live MCP)
**Result:** PASSED — invoice **Paid + Filed**
**Duration:** ~19 min

## Summary
A brand-new LOGIS (order-driven) invoice was **registered by us** and driven through the complete lifecycle to Paid + Filed across all nine role hand-offs and both file-import steps.

- **Ref:** PAY10307/2026 — Order **MP-008176** (FEES SERVICE), Supplier **ATLANTIS CORPORATE TRAVEL (KL772)**, Invoice **INV-ATL-0623L**, **R92** (line item 1: FEES SERVICE, qty 4 × R23, within committed — no motivation needed), End-user Tania Smith.
- **Payment Number 10307** captured manually at Capture & Link.
- **Batch:** BATCH-LOG-10307 · **Box:** BOX-LOG-007 · **File Range:** FILE-007-016.

## Role map (login → step)
| Step | Role group | Login |
|---|---|---|
| TC-02 Register & Upload | SCM (Invoice Capturer) | MoshadiM |
| TC-03 Certify Invoice | Business Unit | TaniaSmith |
| TC-05 Approve Invoice | Approver | KamogeloS |
| TC-07 Assign Responsible Official | SCM Supervisor | SarahM |
| TC-08 Verify Invoice | Verifier (Business Unit) | TaniaSmith |
| TC-11 Capture & Link on LOGIS | SCM | MoshadiM |
| TC-12 Pre-Authorise Payment | SCM | MoshadiM |
| TC-13 Verify Voucher | Internal Control | GwenB |
| TC-14 Final Authorise (BAS import) | Finance / Payments | GwenB* |
| TC-15 Attach Payment Stub (import) | Finance / Payments | GwenB* |
| TC-16 Capture Filing | Internal Control | GwenB |

\* The BAS Report / Payment Stub imports auto-authorise by FUNC NO / Purchase Order match regardless of importing user; GwenB (who has the import menus) ran them — no need to switch to Admin.

## Step results
- [PASS] TC-02 Register (MoshadiM): Order MP-008176 (fresh, R0 paid), invoice INV-ATL-0623L 20/06/2026 + attachment, line item 1 selected (R92 ≤ committed R92), Business Unit = Tania Smith → Submit → Certify Invoice
- [PASS] TC-03 Certify (TaniaSmith): "delivered satisfactory – should be paid" → Approve Invoice
- [PASS] TC-05 Approve (KamogeloS): Supervisor Response "delivered satisfactory" → Assign Responsible Official
- [PASS] TC-07 Assign Responsible Official (SarahM): Official = Tania Smith → Verify Invoice
- [PASS] TC-08 Verify Invoice (TaniaSmith): Order Matching Outcome = "Verification is complete" + Business Unit Response checklist (all 7 = Yes) → Capture and Link Invoice on LOGIS
- [PASS] TC-11 Capture & Link (MoshadiM): Payment Number **10307** + Should payment proceed = Yes + confirm → Pre-Authorise Payment (opened directly)
- [PASS] TC-12 Pre-Authorise (MoshadiM): Authoriser checklist pre-filled (read-only), confirm checkbox → Verify Voucher
- [PASS] TC-13 Verify Voucher (GwenB): single confirmation checkbox (no batch field on LOGIS) → Final Authorise Payment
- [PASS] TC-14 BAS Report Import (GwenB): `bas-report-PAY10307.xlsx` (Source Doc Type=INV) → History **Is Success=Yes, Payments Authorised=1**
- [PASS] TC-15 Payment Stub Import (GwenB): `payment-stub-PAY10307.txt` (PO=MP-008176 in line 21) → History **Is Success=Yes, Rows Affected=4, Payments Confirmed=1** (PO-match worked first try); status → **Paid**
- [PASS] (BLOCKING) TC-16 Capture Filing (GwenB): Batch BATCH-LOG-10307 + Box BOX-LOG-007 + File Range FILE-007-016 + confirm → Submit → process ends; invoice **Paid + Filed**, Payment Number **10307**

## Import file prep
- **BAS report:** based on `bas-report-PAY10093.xlsx` (proven LOGIS template, Source Doc Type already = **INV**), in-place ZipArchive edit — FUNC NO 10093→**10307**, AMOUNT 1630→**92**, INV DATE 46191→**46193** (20/06), INV RECDTE/CAPTURE/AUTH 46192→**46196** (23/06), SOURCE DOC NUMBER `INV-ATL-019`→`INV-ATL-0623L`. Supplier ATLANTIS CORPORATE TRAVEL / KL772 unchanged. Saved `test-data/bas-report-PAY10307.xlsx`.
- **Payment stub:** based on `payment-stub-PAY10093.txt`, fixed-width line 21 rebuilt preserving column offsets (invoice@2 w34, PO@36 w34, payment@70 w11, amount right-aligned ending@128) — INV-ATL-0623L / PO **MP-008176** / payment **10307** / **92.00**; byte length unchanged (8766). Saved `test-data/payment-stub-PAY10307.txt`.

## Notes
- LOGIS is order-driven: Order MP-008176 auto-filled supplier/order details; the Order Line Item must be selected (line 1 FEES SERVICE) and Business Unit set manually. Invoice amount R92 = committed line amount, so no motivation upload was required.
- **LOGIS payment-stub match key = Purchase Order Number** (MP-008176), not the payment number — confirmed again (Payments Confirmed=1 on first import, no PO-column fix needed unlike the PAY10093 run).
- **BAS report Source Doc Type for LOGIS = INV** (BAS uses "Sundry").
- Confirms the LOGIS happy path is repeatable end-to-end on a self-created invoice; complements PAY10093.
