# Report: LOGIS Negative Scenarios (DHA Invoice Tracking)

**Date:** 2026-07-16 20:40 UTC
**Plan:** test-plans/invoice-process/logis.md (negative branches)
**App:** DHA SmartGov Invoice Tracking — https://dha-smartgov-adminportal-qa.shesha.app/ (QA)
**Execution Mode:** ai-driven (live MCP browser)
**Result:** ✅ ALL THREE PASSED — Business Related Query, Supplier Related Query, and Reject Invoice each demonstrated and then completed to **Paid + Filed**

## Where the LOGIS negative branches live
Unlike BAS (where query/reject originate at **Prepare Voucher**), the LOGIS query/reject branches originate at the **Verify Invoice** step (form `SAGovRequestForPayment-wf-MatchtoOrderandVerifyInvoice-Details`) under **"Order Matching Outcome"**, which offers four options: **Send for business related query / Send for supplier related query / Verification is complete / Reject Invoice**, alongside a **7-item Business Unit Response checklist** (all must be Yes). To reach Verify Invoice the invoice is driven: Register (Admin) → Certify (Thabiso) → Approve (Melissa) → Assign Responsible Official (Monicca; Official = Thabiso) → **Verify Invoice** (Thabiso).

## Items & routing summary
| Ref | Scenario | Order / Supplier / Amount | Branch routing | Outcome |
|-----|----------|---------------------------|----------------|---------|
| **PAY3179/2026** | Business Related Query | OR-124953 / ATLANTIS CORPORATE TRAVEL (KL772) / R1,500 | Verify Invoice → **Resolve/Manage Business queries → Business Unit group (Mutshutshut)** → back to Verify Invoice | **Paid + Filed** |
| **PAY3185/2026** | Supplier Related Query | OR-124953 / ATLANTIS (KL772) / R1,800 | Verify Invoice → **"Manage Supplier Related Queries" (status Awaiting Supplier Response) — self-assigns to the verifier (Thabiso)** → back to Verify Invoice | **Paid + Filed** |
| **PAY3191/2026** | Reject Invoice | OR-124953 / ATLANTIS (KL772) / R2,100 | Verify Invoice → **"Review Invoice Rejection" step owned by a dedicated group (login = Monicca H18433740)** → "Send for Invoice Verification" (recovery) → back to Verify Invoice | **Paid + Filed** |

## Key findings (LOGIS vs BAS)
- **Origin differs:** LOGIS query/reject fire at **Verify Invoice / Order Matching Outcome** (BAS uses Prepare Voucher). Same four outcome options and mandatory-comment dialogs.
- **Business Related Query** routes to a Business-Unit "resolve queries" step → resolved by **Mutshutshut** (same Business-Unit responder as BAS) → returns to Verify Invoice.
- **Supplier Related Query** opens **"Manage Supplier Related Queries"** with workflow status **"Awaiting Supplier Response"**, and (unlike BAS, where it went to the Business Unit) it **self-assigns back to the verifier (Thabiso)** who resolves it → returns to Verify Invoice.
- **Reject Invoice** opens a mandatory-comment dialog (`...RejectInvoice-dialog`) → routes to a dedicated **"Review Invoice Rejection"** step (NOT the rejecter's inbox; owned by a distinct group — the available login is **Monicca H18433740**). The review offers **Approve Rejection** (terminal) or **Send for Invoice Verification** (recovery → 2nd mandatory-comment dialog → back to Verify Invoice). App logs the reject decision as **RejectInvoice**.
- After each branch returns to Verify Invoice, completing on **Verification is complete** runs the rest of the LOGIS chain: Capture & Link (manual Payment No) → Pre-Authorise (Monicca) → Verify Voucher (Tshianeo H19234198) → Final Authorise = **BAS report import** (Source Doc Type **INV**, match Invoice+Supplier KL772+Amount) → Attach Payment Stub (**matches on PO number OR-124953**) → Capture Filing (Susanna H10226923) → **Paid + Filed**.

## Roles / logins used (all 123qwe except Admin)
- **Admin** / DHA@Admin_2026#xP4! — Register + BAS/stub imports (identity MIRRIAM NELLY OTTO)
- **ThabisoM** — Certify / Verify Invoice / query self-resolve (supplier) / Capture & Link
- **00000000** Melissa Ndlovu — Approve
- **H18433740** Monicca J Kabini — Assign Responsible Official / Pre-Authorise / **Review Invoice Rejection**
- **H19234198** Tshianeo Moirah Maboya — Verify Voucher
- **H10226923** Susanna Maria Erasmus — Capture Filing
- **Mutshutshut** Mutshutshu Tshithukhe — Business Unit query resolver

## Artifacts (per invoice: edited BAS report INV + payment stub PO)
- `test-data/bas-report-PAY3179-LOGIS.xlsx` + `payment-stub-PAY3179-LOGIS.txt`
- `test-data/bas-report-PAY3185-LOGIS.xlsx` + `payment-stub-PAY3185-LOGIS.txt`
- `test-data/bas-report-PAY3191-LOGIS.xlsx` + `payment-stub-PAY3191-LOGIS.txt`

All three orders reused OR-124953 sequentially (each fully Paid before the next started, so the PO-based stub match was unambiguous).
