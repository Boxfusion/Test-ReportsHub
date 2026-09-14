# Report: LOGIS Request for Payment — Full Chain E2E (PAY10093/2026)

- **Date:** 2026-06-19
- **Plan:** projects/invoice-tracking/test-plans/invoice-process/logis.md
- **Spec:** none — live MCP-driven
- **Execution Mode:** mcp-live
- **Result:** PASS — invoice driven end-to-end to **Paid + Filed**
- **Duration:** ~ full chain (registered 08:26, filed 13:31)

## Item under test
| Field | Value |
|---|---|
| Ref No | **PAY10093/2026** |
| Type | LOGIS Request For Payment |
| Order | KZ-016642 (ADMIN FEE TRANSACTION FEE) |
| Supplier | ATLANTIS CORPORATE TRAVEL (KL772) |
| Invoice No | INV-ATL-019 |
| Invoice Amount | R 1 630 |
| Payment Number (manual, LOGIS) | **10093** |
| Final status | **Paid** (process ended) |

## Summary
| Total | Passed | Failed | Skipped |
|---|---|---|---|
| 11 steps | 11 | 0 | 0 |

> Steps 1–4 (Register → Certify → Approve → Assign Responsible Official) were already completed before this session began. This session drove **Verify Invoice → … → Capture Filing** live. All steps verified via the workflow Audit Trail.

## Role map (LOGIS)
| Step | Role group | Actor | Login |
|---|---|---|---|
| Register & Upload | SCM | Moshadi Mothiba | MoshadiM |
| Certify Invoice | Business Unit | Tania Smith | TaniaSmith |
| Approve Invoice | Approver | Kamogelo Shabangu | (pre-done) |
| Assign Responsible Official | SCM Supervisor | Sarah Mohlala | (pre-done) |
| Verify Invoice | Business Unit | Tania Smith | TaniaSmith |
| Capture & Link Invoice on LOGIS | SCM | Moshadi Mothiba | MoshadiM |
| Pre-Authorise Payment | SCM | Moshadi Mothiba | MoshadiM |
| Verify Voucher | **Internal Control** | **Gwen Simbeni** | **GwenB** |
| Final Authorise Payment | Finance Unit | Lerato Bale (via BAS import) | Admin |
| Attach Payment Stub | Finance Unit | system (via stub import) | Admin |
| Capture Filing | Internal Control | Gwen Simbeni | GwenB |

## Step Results

### TC-08: Verify Invoice (TaniaSmith)
- [PASS] Order Matching Outcome = "Verification is complete"; Business Unit Response checklist (7 items) all answered **Yes**; Submit → routed to Capture and Link Invoice on LOGIS. Audit: completed by Tania Smith 12:54, decision `VerificationComplete`.

### TC-11: Capture and Link Invoice on LOGIS (MoshadiM)
- [PASS] Entered **Payment Number = 10093** + Save; "Should payment proceed?" = **Yes**; confirmation checkbox; Submit → routed to Pre-Authorise Payment. Audit: completed by Moshadi Mothiba 12:58, decision `ProceedPayment`.

### TC-12: Pre-Authorise Payment (MoshadiM)
- [PASS] Authoriser Checklist pre-filled (read-only, all Yes); confirmation checkbox enabled Submit and disabled "Send Back To Capturer"; Submit → routed to Verify Voucher. Audit: completed by Moshadi Mothiba 12:58, decision `AuthorisePayment`.

### TC-13: Verify Voucher (GwenB)
- [PASS] Single confirmation checkbox ("I confirm that I have reviewed the payment and supporting information.") → Submit → routed to Final Authorise Payment. Audit: received by Internal Control, completed by Gwen Simbeni 13:14. (No Batch Number field on LOGIS Verify Voucher — unlike BAS.)

### TC-14: Final Authorise Payment — BAS Report Import (Admin)
- [PASS] Built `test-data/bas-report-PAY10093.xlsx` (copy of PAY10087 template, in-place ZipArchive edit): FUNC NO=10093, AMOUNT=1630, SOURCE DOC NUMBER=INV-ATL-019, PAYEE NAME=ATLANTIS CORPORATE TRAVEL, ENT NUMBER=KL772, **SOURCE DOC TYPE=INV** (LOGIS). Import History: `Is Success=Yes, Payments Authorised=1`. Item status → Authorized, routed to Attach Payment Stub. Audit step completed (Finance Unit / Lerato Bale 13:18).

### TC-15: Attach Payment Stub — Payment Stub Import (Admin)
- [PASS, after fix] First import (`payment-stub-PAY10093.txt`, payment no 10093) returned `Is Success=Yes, Payments Confirmed=0` — no match. **Root cause:** LOGIS payment stub matching keys on the **Purchase Order Number**, not the payment number (BAS uses payment number). Re-edited line 21 PO column from `NOT APPLIC` → `KZ-016642` (length-preserving). Re-import: `Is Success=Yes, Payments Confirmed=1`. Item status → Paid, routed to Capture Filing. Audit: Attach Payment Stub completed by system 13:28.
  - The manual "Attach Payment Stub" workflow action is view-only (no Submit); the bulk Payment Stub import is what advances the step.

### TC-16: Capture Filing (GwenB)
- [PASS] Filled Batch Number=`BATCH-LOG-10093`, Box Number=`BOX-LOG-001`, File Range=`FILE-001-010` (all three editable + required on LOGIS), confirmation checkbox → Submit. Process ended; status **Paid**, item Filed. Audit: received by Internal Control, completed by Gwen Simbeni 13:31.

## Key findings
1. **LOGIS payment-stub match key = Purchase Order Number** (KZ-016642), not the payment number used for BAS. A stub with `NOT APPLIC` in the PO column will import successfully but confirm 0 payments for a LOGIS item.
2. **BAS report Source Doc Type for LOGIS = "INV"** (BAS uses "Sundry").
3. The bulk Payment Stub import (not the manual Attach Payment Stub workflow action) is what advances the Attach Payment Stub step; the manual action form has no Submit.
4. **New role logins confirmed:** GwenB = Verify Voucher (Internal Control) **and** Capture Filing for LOGIS. Approve Invoice = Kamogelo Shabangu; Assign Responsible Official = Sarah Mohlala (SCM Supervisor).

## Reusable artifacts
- `test-data/bas-report-PAY10093.xlsx` (LOGIS BAS report, Source Doc Type=INV)
- `test-data/payment-stub-PAY10093.txt` (LOGIS stub, PO=KZ-016642 in line 21)
