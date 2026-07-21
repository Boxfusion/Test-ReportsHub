# Report: BAS Negative — Reject Invoice / Review Invoice Rejection (PAY3173/2026)

**Date:** 2026-07-16 21:12 UTC
**Plan:** test-plans/invoice-process/bas.md (TC-07 reject branch → Review Invoice Rejection)
**App:** DHA SmartGov Invoice Tracking — https://dha-smartgov-adminportal-qa.shesha.app/ (QA)
**Execution Mode:** ai-driven (live MCP browser)
**Result:** ✅ PASSED — reject raised at Prepare Voucher, routed to Review Rejected Invoice; rejection overturned ("Send for Invoice Verification") → back to Prepare Voucher → completed to **Paid + Filed**
**Item:** PAY3173/2026 — Supplier VANG GROUP (MAAA0868598), Invoice DHA-INV-3173, R 5,300, Payment No **3173**

## Scenario
Verify the **"Reject Invoice"** branch from **Prepare Voucher**: it must capture a mandatory rejection reason and route to a **"Review Rejected Invoice"** step that offers two outcomes — **Approve Rejection** (terminal) or **Send for Invoice Verification** (recovery back into the payment flow). Per standing instruction to complete the invoice through all steps, the recovery outcome was taken and the invoice driven to Paid + Filed.

## Steps & result
| # | Step | Login | Outcome |
|---|------|-------|---------|
| 1 | Register & Upload Invoice | Admin | PAY3173 created (VANG GROUP, DHA-INV-3173, R5,300) |
| 2 | Assign Branch Finance Admin = Thabiso Maake | Thabiso Maake | → Assign Responsible Person |
| 3 | Assign Responsible Person = Thabiso Maake | Thabiso Maake | → Certify Invoice |
| 4 | Certify Invoice (delivered satisfactory) | Thabiso Maake | → Prepare Voucher |
| 5 | Prepare Voucher — 4-item checklist = Yes, then Outcome = **Reject Invoice** | Thabiso Maake | [PASS] Reject Invoice dialog appeared |
| 6 | Reject dialog — **mandatory comment** enforced (Ok disabled until text): amount/doc mismatch | Thabiso Maake | [PASS] → routed to **Review Rejected Invoice** (Finance Unit) |
| 7 | Review Rejected Invoice — Verification Outcome = **Send for Invoice Verification** (recovery) + mandatory "send back" comment | Thabiso Maake | [PASS] → routed **back to Prepare Voucher** |
| 8 | Prepare Voucher — checklist = Yes + Outcome = **Verification is complete** | Thabiso Maake | [PASS] → Verify Voucher |
| 9 | Verify Voucher (Batch BATCH-3173) | Thabiso Maake | [PASS] → Authorise Invoice Voucher |
| 10 | Authorise Invoice Voucher (confirm) | Thabiso Maake | [PASS] → BAS import step |
| 11 | Upload Captured Invoices Report From BAS — **BAS report import** | Admin | [PASS] Is Success=Yes, **Payments Authorised 1** (DHA-INV-3173 / MAAA0868598 / 5300 / SUNDRY / FUNC NO 3173 → Payment No 3173) |
| 12 | Attach Payment Stub — **Payment Stub import** | Admin | [PASS] Is Success=Yes, **Payments Confirmed 1** (payment no 3173, PO NOT APPLIC, 5,300.00) → **Paid** |
| 13 | Capture Filing (Batch/Box/File Range = 3173) | Mutshutshut | [PASS] process ended → **Filed** |

## Key findings
- **"Reject Invoice"** at Prepare Voucher opens a dialog (`SAGovRequestForPayment-wf-RejectInvoice-dialog`) with a **mandatory Comments field** (Ok disabled until text), then routes to a **"Review Rejected Invoice"** step (`...ReviewInvoiceRejection-Details`), received by the **Finance Unit** group. It self-assigned to Thabiso (message "from Thabiso Maake to Thabiso Maake").
- The Review step offers two outcomes under **"Verification Outcome"**:
  - **Approve Rejection** — the terminal path (would finalise the invoice as rejected). *Documented, not taken.*
  - **Send for Invoice Verification** — recovery path; opens a second mandatory-comment dialog (`...SendBacktoReviewDecision-dialog`) and routes the invoice **back to Prepare Voucher** so it can be re-processed.
- Prepare Voucher still requires the **4-item Business Unit Response checklist = Yes** for the reject outcome. The gotcha (Outcome radio resets to "Verification is complete" after the checklist re-renders) was handled by setting the checklist **first**, then selecting **Reject Invoice** **last** before Submit.
- App text quirk: the audit-trail Decision for the reject reads **"RjectInvoice"** (missing an "e").

## Audit trail (0 active steps — process ended)
Register → Assign BFA → Assign Responsible Person → Certify → Prepare Voucher (**RjectInvoice**) → **Review Rejected Invoice** (Decision **PrepareVoucher** = Send for Invoice Verification) → Prepare Voucher (**VerificationComplete**) → Verify Voucher → Authorise → Upload BAS Report (auto) → Final Authorise (auto) → Attach Payment Stub (auto) → Capture Filing. **PAY3173 = Paid + Filed.**

## Roles / logins used
- **Admin** / DHA@Admin_2026#xP4! — register + BAS report & payment stub imports (import identity MIRRIAM NELLY OTTO)
- **ThabisoM** / 123qwe — Finance Unit: BFA/Certify/Prepare Voucher/**Review Rejected Invoice**/Verify/Authorise
- **Mutshutshut** / 123qwe — Internal Control: Capture Filing

## Artifacts
- `test-data/bas-report-PAY3173.xlsx` (edited BAS report, SUNDRY)
- `test-data/payment-stub-PAY3173.txt` (edited stub, PO NOT APPLIC)

## Status of BAS negative scenarios
All three BAS negative branches now covered on DHA: **Business Related Query (PAY3159)**, **Supplier Related Query (PAY3167)**, **Reject Invoice / Review Invoice Rejection (PAY3173)** — each demonstrated and then completed to Paid + Filed via the recovery/positive path.
