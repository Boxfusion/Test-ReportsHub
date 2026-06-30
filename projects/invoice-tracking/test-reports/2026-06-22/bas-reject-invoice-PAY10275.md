# Report: BAS — Prepare-Voucher "Reject Invoice" → terminal Rejected (PAY10275, our own invoice)

**Date:** 2026-06-22 11:58 UTC
**Plan:** test-plans/invoice-process/bas.md (TC-02→05, TC-07 "Reject Invoice" branch, TC-06 Approve Rejection)
**Spec:** n/a — driven live via Playwright MCP (multi-role)
**Execution Mode:** ai-driven (live MCP)
**Result:** PASSED — workflow terminal **Rejected**
**Duration:** ~10 min

## Summary
A brand-new BAS invoice was **registered by us** and driven to exercise the 4th Prepare-Voucher outcome — **Reject Invoice** — through Review Invoice Rejection to the terminal **Rejected** state.

- **Ref:** PAY10275/2026 — OMNI TECHNOLOGIES (EM583), **INV-OMNI-0624C**, R3100.

## Step results
- [PASS] TC-02 Register & Upload (ThulileM): OMNI, 03/06/2026 + 07/06/2026 + INV-OMNI-0624C + R3100 + attachment → Submit → Assign BFA
- [PASS] Assign BFA = Tania Smith → Assign Responsible Person = Tania Smith → Certify (opened directly)
- [PASS] TC-05 Certify = "delivered satisfactory – should be paid" → Prepare Voucher
- [PASS] **TC-07 "Reject Invoice" outcome:** Prepare Voucher → select **Reject Invoice**; the **BU Response checklist is still mandatory** (raised "Please select an option" until all 4 answered) → comment in the Reject-Invoice dialog → routed to **Review Invoice Rejection** (ThulileM)
- [PASS] **TC-06 Review Invoice Rejection:** Verification Outcome = **Approve Rejection** + comment in Approve-payment-rejection dialog → Submit
- [PASS] (BLOCKING) Workflow detail shows status **Rejected** (terminal) — invoice not paid

## Notes
- The Prepare-Voucher "Reject Invoice" outcome routes to the **same** Review Invoice Rejection step as a Certify-stage rejection; from there Approve Rejection ends the workflow (Rejected) and Send for Invoice Verification would send it back. This was the one BAS branch not previously exercised.
- Reject Invoice requires the BU Response checklist (4 × Yes/No) before the reject dialog appears — same gating as the other Prepare-Voucher outcomes.
- No imports/filing — the workflow is terminal at Approve Rejection.

## BAS branch coverage now complete (all on our own invoices)
- PAY10259 — supplier related query → Paid + Filed
- PAY10268 — business related query → Paid + Filed
- PAY10275 — **Reject Invoice → Rejected** (this run)
- (PAY9908 earlier — Certify-stage reject: send-back + Approve Rejection)
