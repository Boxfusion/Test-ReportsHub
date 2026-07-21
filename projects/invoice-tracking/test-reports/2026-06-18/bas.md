# Report: BAS — Invoice Tracking Process

**Date:** 2026-06-18 08:31 UTC
**Plan:** test-plans/invoice-process/bas.md
**Spec:** test-plans/invoice-process/bas.spec.ts
**Execution Mode:** ai-repair (live MCP-driven recording walk-through, headed)
**Result:** PASSED (TC-01, TC-02)
**Duration:** ~3 min

## Summary
| Total Steps (run) | Passed | Failed | Skipped |
|-------------------|--------|--------|---------|
| TC-01 + TC-02 | 2 TCs | 0 | TC-03…TC-14 (12, pending role accounts) |

## Step Results

### TC-01 — Login (ThulileM)
**Mode:** live MCP
- [PASS] Navigated to QA login, signed in as `ThulileM`, redirected to Homepage (Workflows menu visible). Logged-in user: **Thulile Matekanya**.

### TC-02 — Register and Upload Invoice (ADO #102362)
**Mode:** live MCP
**Ref No created:** **PAY9991/2026**
- [PASS] Workflows → My Items reached (sidebar flyout collapses under automation → navigated directly to `/dynamic/Shesha.Workflow/workflows-my-items`). Create New + Export buttons present.
- [PASS] Create New → process list showed **BAS Request For Payment** and **Request For Payment**.
- [PASS] Selected **BAS Request For Payment** → Register and Upload Invoice form opened; **Date Received auto-populated with today (18/06/2026)**.
- [PASS] Supplier Name ellipsis → "Select Item" dialog (349 suppliers, "Double click an item to select"); double-clicked **OMNI TECHNOLOGIES** → Supplier Details populated read-only (Supplier No **EM583**).
- [PASS] Invoice line item: Invoice Date 17/06/2026, Service Delivery 17/06/2026, Invoice No **INV-ITS-001**, Amount **1500**, attachment **pdf-test.pdf** (20.6 kB).
- [PASS] Add (plus-circle) committed the row → **Total Amount R 1500**; Submit button enabled.
- [PASS (BLOCKING)] Submit → item routed to **"Assign Branch Finance Admin To Assign Certifier"**, status **RECEIVED** (matches ADO #102362 expected outcome).

## Notes
- This was a live, headed MCP-driven run validating the new `invoice-tracking` project end-to-end (login + first BAS step). The paired `bas.spec.ts` was recorded from these selectors and is ready for a Playwright headed re-run.
- **TC-03 … TC-14 are stubbed (`test.skip`)** — they are downstream multi-role steps (Branch Finance Admin → Certifier → Voucher → Verify → Authorise → Payment → Filing) and need role logins beyond `ThulileM`. Run blocked pending those usernames (user sourcing them 2026-06-18).
- Test artifact created on QA: invoice **PAY9991/2026** (OMNI TECHNOLOGIES) now sitting at the *Assign Branch Finance Admin* step — usable as the seed item to drive TC-03 onward once role accounts are available.
