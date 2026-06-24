# Report: BAS — Certify Invoice

**Date:** 2026-06-18 09:03 UTC
**Plan:** test-plans/invoice-process/bas.md (TC-05)
**Spec:** test-plans/invoice-process/bas.spec.ts
**Execution Mode:** ai-repair (live MCP-driven, headed)
**Result:** PASSED
**Item:** PAY9991/2026 (OMNI TECHNOLOGIES)
**Actioned by:** TaniaSmith (Tania Smith)

## Summary
| Total Steps | Passed | Failed | Skipped |
|-------------|--------|--------|---------|
| TC-05 | 1 TC | 0 | 0 |

## Step Results

### TC-05 — Certify Invoice (ADO #102372)
- [PASS] Logged in as **TaniaSmith**; opened PAY9991/2026 from Inbox (Action Required = "Certify Invoice").
- [PASS] **Business Unit Responses** → selected **"Goods and Service has been delivered satisfactory - Invoice should be paid"** (happy path); Submit button appeared/enabled.
- [PASS (BLOCKING)] Submit → status changed to **CERTIFIED** and item routed to **Prepare Voucher**. Matches ADO #102372 expected outcome.

## Notes
- The **Submit** button on the Certify form only renders after a Business Unit Response is selected.
- Negative branch (not run): selecting "...not been delivered... should not be paid" routes to **Review Invoice Rejection** (TC-06).
- Item is now at **Prepare Voucher** in Tania's queue → drives TC-07.
