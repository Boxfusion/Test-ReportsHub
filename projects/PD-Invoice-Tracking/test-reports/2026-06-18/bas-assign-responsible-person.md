# Report: BAS — Assign Responsible Person to Certify Invoices

**Date:** 2026-06-18 09:01 UTC
**Plan:** test-plans/invoice-process/bas.md (TC-04)
**Spec:** test-plans/invoice-process/bas.spec.ts
**Execution Mode:** ai-repair (live MCP-driven, headed)
**Result:** PASSED
**Item:** PAY9991/2026 (OMNI TECHNOLOGIES)
**Actioned by:** TaniaSmith (Tania Smith)

## Summary
| Total Steps | Passed | Failed | Skipped |
|-------------|--------|--------|---------|
| TC-04 | 1 TC | 0 | 0 |

## Step Results

### TC-04 — Assign Responsible Person to Certify Invoices (ADO #102370)
- [PASS] Logged in as **TaniaSmith / 123qwe** → header confirms Tania Smith.
- [PASS] Item found in **Inbox** (Action Required = "Assign Responsible Person to Certify Invoice", initiator Thulile Matekanya). Inbox row link opens the action form directly (no menu needed, unlike My Items).
- [PASS] **Official** combobox → typed "Tania" → selected **Tania Smith** (self-assign per session decision); Submit enabled.
- [PASS (BLOCKING)] Submit → item routed to **Certify Invoice** (RECEIVED, "from Tania Smith"). Matches ADO #102370 expected outcome.

## Notes
- **Inbox vs My Items:** items routed *to* a user appear in their **Inbox** (`/dynamic/Shesha.Workflow/workflows-inbox`) and the row link opens the action form directly. Items a user *initiated* appear in **My Items**, where the row link opens a read-only view and the action is reached via the item **menu**.
- Because the Official was set to Tania Smith, the next **Certify Invoice** step (ADO #102372) is now in Tania's queue — actionable with the same TaniaSmith login.
