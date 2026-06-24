# Report: LOGIS — Sub-branch Variants (send-backs, reject outcomes, payment-proceed No, validation)

**Date:** 2026-06-22 14:52 UTC
**Plan:** test-plans/invoice-process/logis.md (branch notes under TC-03/05/06/08/11/12) + registration validation
**Spec:** n/a — driven live via Playwright MCP (multi-role)
**Result:** PASSED — all targeted sub-branches exercised on our own invoices
**Duration:** ~30 min

## Summary
After completing all 30 formal ITS test cases, these plan **branch notes** (not standalone ADO cases) were driven live to close the remaining gaps.

| # | Branch | Invoice | Outcome |
|---|--------|---------|---------|
| 1 | Approve Invoice = "not delivered" → Review Invoice Rejection | PAY10292 (OR-122508) | routed to Review Invoice Rejection ✓ |
| 2 | Review Invoice Rejection → "Send for Invoice Verification" (send-back) | PAY10292 | routed **back to Approve Invoice** ✓ |
| 3 | Verify Invoice → "Reject Invoice" → Approve Rejection | PAY10292 | terminal **Rejected** ✓ |
| 4 | Capture & Link → "No" on Should-payment-proceed | PAY10288 (OR-121877) | revealed Verify Invoice / Send to Business Unit + comment; routed back to **Verify Invoice** ✓ |
| 5 | Pre-Authorise → "Send Back To Capturer" | PAY10288 | Step picker (Register / Certify) + comment; routed **back to Certify Invoice** ✓ |
| 6 | Registration validation guards | PAY10292 draft | required-field gating + over-commit motivation rule observed; typed future Date Received NOT blocked (minor) |

## Detail

### PAY10292 (OR-122508, GOVERNMENT PRINTING WORKS) — rejection variants
- Register (MoshadiM) → Certify (TaniaSmith, delivered) → **Approve Invoice (KamogeloS) = "not delivered/unacceptable"** → mandatory comment → routed to **Review Invoice Rejection** (audit Decision: InvoiceShouldNotBePaid).
- **Review Invoice Rejection (TaniaSmith) = "Send for Invoice Verification"** + mandatory "Send back to review rejection decision" comment → routed **back to Approve Invoice** (the send-back variant; audit Decision: ApproveInvoice). [branches 1 + 2]
- Re-approved delivered → Assign Responsible Official (SarahM, Official=Tania) → **Verify Invoice (TaniaSmith) = "Reject Invoice"** + 7-item checklist + reject comment → **Review Invoice Rejection** → **Approve Rejection** + comment → terminal **Rejected**. [branch 3]

### PAY10288 (OR-121877, ATLANTIS) — Capture&Link No + Pre-Auth send-back
(Reused our own invoice already parked at Verify Invoice from the earlier query tests.)
- Verify Invoice (TaniaSmith) = "Verification is complete" + checklist → **Capture and Link Invoice on LOGIS (MoshadiM)**.
- **Capture & Link → "No" on Should payment proceed** revealed two radios — **Verify Invoice** / **Send to Business Unit** — plus a mandatory Comments box. Chose "Verify Invoice" + comment + confirm checkbox → routed **back to Verify Invoice** (audit Decision: VerifyInvoice). [branch 4]
- Re-verified → Capture & Link again, this time **"Yes"** + Payment Number (PN-10288-LOGIS) + confirm → **Pre-Authorise Payment (MoshadiM)** (audit Decision: ProceedPayment).
- **Pre-Authorise → "Send Back To Capturer"** opened a generic Send Back dialog with a **Step** picker offering **Register and Upload Invoice / Certify Invoice** only + mandatory Comments. Chose **Certify Invoice** → audit Status: Sent Back → routed **back to Certify Invoice (Active)**. [branch 5]

### Validation guards (branch 6)
- **Required-field gating:** Submit stays disabled until Date Received + Order + invoice line + line-item are all present.
- **Over-commit → Motivation:** the Order Line Items panel shows an enforced info-alert — if total selected Invoice Amount > total Committed Amount, a Motivation upload is mandatory.
- **Future-date (minor finding):** the calendar picker blocks future dates, but a **typed** future Date Received (31/12/2026) was accepted into the field — typed entry bypasses the picker guard. Low severity; reset to today before registering.

## Notes
- Both rejection paths (Certify "not delivered", Approve "not delivered", Verify "Reject Invoice") converge on **Review Invoice Rejection**; Approve Rejection = terminal Rejected, Send for Invoice Verification = send-back to the prior approver/step.
- The Pre-Authorise send-back uses Shesha's generic `user-task-send-back` dialog (Step + Comments), restricting targets to Register/Certify — matching the plan note.
- All variants exercised on our own invoices (PAY10292 fresh; PAY10288 reused — our invoice parked from earlier query tests).
