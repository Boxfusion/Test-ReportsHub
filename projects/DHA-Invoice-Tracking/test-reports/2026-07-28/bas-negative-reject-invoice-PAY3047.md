# Report: BAS Negative — Reject Invoice / Review Rejected Invoice (TEST)

**Date:** 2026-07-28 17:56 UTC
**Plan:** test-plans/invoice-process/bas.md
**App:** DHA SmartGov Invoice Tracking — https://dha-smartgov-adminportal-test.shesha.app/ (**TEST**)
**Execution Mode:** ai-driven (live MCP browser)
**Result:** ✅ PASSED — reject raised at Prepare Voucher → Review Rejected Invoice → send-back to Prepare Voucher → re-rejected → **Approve Rejection** → terminal **REJECTED**
**Duration:** ~12 min
**Primary item:** PAY3047/2026 — Supplier ATLANTIS CORPORATE TRAVEL (KL772), Invoice DHA-INV-3047, R 3,500
**Covers:** TC-06 (Review Invoice Rejection), TC-07 (Prepare Voucher — Reject outcome)
**Workflow instance:** `60d5cc6d-853f-4192-94e0-5dbca37b16f5`

## Summary
| Area | Result |
|------|--------|
| Register + drive to Prepare Voucher | [PASS] |
| Prepare Voucher → Outcome **Reject Invoice** (mandatory comment dialog) | [PASS] |
| Routing to **Review Rejected Invoice** | [PASS] — 4 candidate assignees |
| Review → **Send for Invoice Verification** (send-back sub-branch) | [PASS] — item returns to Prepare Voucher |
| Re-reject from Prepare Voucher | [PASS] |
| Review → **Approve Rejection** (terminal sub-branch) | [PASS] |
| Terminal state | [PASS] — badge **REJECTED**, workflow Completed, no onward task |

> **Difference vs the QA run of 2026-07-16.** On QA the rejection was *overturned* — "Send for Invoice
> Verification" → back to Prepare Voucher → completed to Paid + Filed. This run exercises the same
> send-back **plus** the previously-uncovered **Approve Rejection** terminal path, so both outcomes of
> Review Rejected Invoice are now proven on TEST.

## Steps as executed

Registered by `Admin`, driven by `ThabisoM` (self-assign at each Finance-Unit hand-off).

| # | Step | Action | API |
|---|---|---|---|
| 1 | Register and Upload Invoice | supplier KL772, invoice row R3 500, attachment | 200 → RECEIVED |
| 2 | Assign Branch Finance Admin To Assign Certifier | = Thabiso Maake | 200 |
| 3 | Assign Responsible Person to Certify Invoice | Official = Thabiso Maake | 200 |
| 4 | Certify Invoice | "delivered satisfactory" | 200 → CERTIFIED |
| 5 | Prepare Voucher | Outcome **Reject Invoice** + 4 × Yes checklist | 200 |
| 5a | *Reject Invoice* dialog | `…-wf-RejectInvoice-dialog v6` — comment **mandatory** | 200 |
| 6 | Review Rejected Invoice | Outcome **Send for Invoice Verification** | 200 |
| 6a | *Send back to review rejection decision* dialog | comment **mandatory** | 200 |
| 7 | **Item back at Prepare Voucher** | send-back loop confirmed | — |
| 8 | Prepare Voucher | Outcome **Reject Invoice** again + checklist | 200 |
| 9 | Review Rejected Invoice | Outcome **Approve Rejection** | 200 |
| 9a | *Approve payment rejection* dialog | comment **mandatory** | 200 |

## Final state (verified via API)

```
Process/Details  → status: 3 (Completed), subStatus: 13, activeTodoItems: []
Header badge     → REJECTED
Process/Progress → Register ✓ · Assign BFA ✓ · Assign Responsible ✓ · Certify ✓ ·
                   Review Rejected Invoice ✓ · Prepare Voucher ✓   (all by Thabiso Maake)
```

Correct terminal behaviour: no onward task is created, and the invoice is not payable.

## Observations

- Every negative outcome opens **its own modal with a mandatory comment**; `Ok` stays disabled until
  text is entered. The modal appears *after* Submit, and while it is open the underlying Submit sits in
  `ant-btn-loading` and the modal mask intercepts clicks.
- The four *Business Unit Response* Yes/No questions on Prepare Voucher are **mandatory for the reject
  branch too**. Submit is not disabled — clicking it raises four inline "Please select an option" errors.
- The send-back returns the item to **Prepare Voucher** (not to Certify or to the initiator), and
  Prepare Voucher re-opens in place for the same user.
