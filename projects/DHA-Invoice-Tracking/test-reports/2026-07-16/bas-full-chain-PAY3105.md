# Report: BAS — DHA Invoice Tracking (Full Chain to BAS Import)

**Date:** 2026-07-16 15:48 UTC
**Plan:** test-plans/invoice-process/bas.md
**App:** DHA SmartGov Invoice Tracking — https://dha-smartgov-adminportal-qa.shesha.app/ (QA)
**Execution Mode:** ai-driven (live MCP browser)
**Result:** ✅ PASSED — FULL CHAIN COMPLETE, invoice **Paid + Filed**
**Primary item:** PAY3105/2026 — Supplier VANG GROUP (MAAA0868598), Invoice DHA-INV-3105, R 18,750, **Payment Number 3105**

## Summary
| Area | Result |
|------|--------|
| Login (Admin + ThabisoM + Mutshutshut) | [PASS] |
| Register & Upload Invoice (create) | [PASS] |
| BAS approval chain (Assign BFA → Authorise Invoice Voucher) | [PASS] — 7 steps |
| Upload Captured Invoices Report From BAS (BAS report import) | [PASS] — Is Success=Yes, Payments Authorised=1 |
| Final Authorise Payment | [PASS] — auto-completed by the import |
| Attach Payment Stub (Payment Stub .txt import) | [PASS] — Is Success=Yes, Payments Confirmed=1 → Paid |
| Capture Filing | [PASS] — process ended, invoice Filed |

## Credentials confirmed
| Role | Username | Password |
|------|----------|----------|
| System Administrator (initiator / BAS & Payment Stub imports) | Admin | DHA@Admin_2026#xP4! |
| Finance Unit member (BFA/Certifier/Voucher/Verify/Authorise) | ThabisoM | 123qwe |

## Key finding — segregation of duties vs single login
Each assignment field ("Branch Finance Admin", "Official") names the **specific person who owns the next step**. Partial searches ("Thabiso"/"Maake") return a *different* top match, but typing the **full name "Thabiso Maake"** surfaces him — so he can self-assign every downstream Finance-Unit step. This keeps the whole chain on the one login we have. (An earlier item, PAY3092, was routed to ITUMELENG PRUDENCE MAAKE by mistake and is stranded at "Assign Responsible Person".)

## Step Results (PAY3105/2026 — audit trail)
### TC-01/02 — Register and Upload Invoice — **System Administrator**
- [PASS] Ref PAY3105/2026 assigned; Date Received auto = 16/07/2026
- [PASS] Supplier VANG GROUP selected via Select-Item modal (double-click)
- [PASS] Invoice row: 15/07/2026 / 15/07/2026 / DHA-INV-3105 / R18,750 / PDF attached; Total R18,750
- [PASS] Submit → routed to "Assign Branch Finance Admin To Assign Certifier" (Finance Unit)

### TC-03 — Assign Branch Finance Admin — **Thabiso Maake**
- [PASS] Branch Finance Admin = **Thabiso Maake** (self) → routed to "Assign Responsible Person"

### TC-04 — Assign Responsible Person to Certify Invoice — **Thabiso Maake**
- [PASS] Official = **Thabiso Maake** (self) → routed to "Certify Invoice"

### TC-05 — Certify Invoice — **Thabiso Maake**
- [PASS] "Goods and Service delivered satisfactory - Invoice should be paid" → routed to "Prepare Voucher"

### TC-07 — Prepare Voucher — **Thabiso Maake**
- [PASS] Outcome "Verification is complete"; all 4 Business-Unit-Response checklist items = Yes → routed to "Verify Voucher"

### TC-10 — Verify Voucher — **Thabiso Maake**
- [PASS] Batch Number BATCH-3105; confirm-review checkbox → routed to "Authorise Invoice Voucher"

### TC-11 — Authorise Invoice Voucher — **Thabiso Maake**
- [PASS] Confirm-approve checkbox → Submit. Status now **Approved**; routed to "Upload Captured Invoices Report From BAS"

### TC-12 — Upload Captured Invoices Report From BAS — **PASS** (Admin / BAS Report Import Administrator)
- Downloaded a known-good DHA BAS report from History (`...3 (14).xlsx`) as a package-valid template; edited **in place** (ZipArchive Update, rewrote only `xl/sharedStrings.xml` + `xl/worksheets/sheet1.xml`, 22 entries preserved) row 10 to match PAY3105: FUNC NO 76898→**3105**, AMOUNT 90000→**18750**, INV DATE serial→46218 (15/07/2026); strings IKL-6754→**DHA-INV-3105**, SEITLHAMO SPORTS DEVELOPMENT→**VANG GROUP**, MAAA1082564→**MAAA0868598**; SOURCE DOC TYPE stayed **SUNDRY** (BAS).
- Imported via Invoice Tracking → BAS Report → BAS Report Import. History: **Is Success=Yes, Rows Affected 0, Rows Skipped 0, Payments Authorised 1**.
- Invoice **Payment Number = 3105** assigned (from FUNC NO). Item auto-advanced:
  - "Upload Captured Invoices Report From BAS" → completed ("Automatically completed: Invoices captured in BAS Payment Register import")
  - "Final Authorise Payment" → completed ("Automatically completed: Invoices authorised in BAS report import")
- Status now **Authorized**; current step **Attach Payment Stub** (Active).
- Reusable artifacts: `test-data/bas-report-PAY3105.xlsx` (edited), `test-data/dha-bas-template-known-good.xlsx` (DHA template base).

### TC-13 — Attach Payment Stub — **PASS** (Admin / Upload Payment Stub)
- Downloaded a known-good DHA payment stub from History (`23 Nov 2025-Payment Stub (3)`, RP007BS fixed-width .txt) as template. Edited **line 21 only, length-preserving** (byte-exact, ASCII, 128-char line, 102 lines): Payment No `76898`→**3105**, Amount `90,000.00`→**18,750.00**, Invoice `IKL-6754`→**DHA-INV-3105**, PO stays **NOT APPLIC** (BAS).
- Imported via Invoice Tracking → Payment Stubs Import → Import Payment Stub. History: **Is Success=Yes, Rows Affected 4, Payments Confirmed 1**.
- Item auto-completed "Attach Payment Stub" ("All 1 invoices confirmed paid via payment stub import"), status → **Paid**, routed to Capture Filing.
- Reusable: `test-data/payment-stub-PAY3105.txt`, `test-data/dha-payment-stub-template-known-good.txt`.

### TC-14 — Capture Filing — **PASS** (Mutshutshut / Mutshutshu Tshithukhe, Internal Control)
- Batch Number **BATCH-3105**, Box Number **BOX-3105**, File Range **FILE-3105-001-010**, confirm checkbox → Submit.
- Audit trail: Capture Filing completed 18:13; **0 active steps remain** → process ended, invoice **Filed**. Final status **Paid**.

## Roles confirmed (all password 123qwe except Admin)
- **Admin** / DHA@Admin_2026#xP4! — System Administrator: initiator + BAS Report & Payment Stub imports (import identity = MIRRIAM NELLY OTTO).
- **ThabisoM** / 123qwe — Thabiso Maake, Finance Unit: self-assigned BFA → Certify → Prepare → Verify → Authorise.
- **Mutshutshut** / 123qwe — Mutshutshu Tshithukhe, Internal Control: Capture Filing.

## Notes / observations
- DHA behaves identically to PD Invoice Tracking (form schema, supplier picker, invoice grid, submit routing, workflow steps).
- Consecutive same-role steps re-open directly (URL changes todoid, no inbox round-trip) when self-assigned.
- Steps "received by Finance Unit" (group) can be actioned by any Finance Unit member; Thabiso qualifies.

## Next steps
1. Finish PAY3105: as Admin, run "Upload Captured Invoices Report From BAS" (BAS report import) → Attach Payment Stub → Capture Filing → Paid + Filed.
2. Optionally recover PAY3092 (stranded with ITUMELENG PRUDENCE MAAKE at "Assign Responsible Person").
