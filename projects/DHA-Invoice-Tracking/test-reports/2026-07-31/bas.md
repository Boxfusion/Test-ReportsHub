# Report: BAS — Invoice Tracking Process
**Date:** 2026-07-31 05:47 UTC
**Plan:** test-plans/invoice-process/bas.md
**Spec:** test-plans/invoice-process/bas.spec.ts
**Execution Mode:** playwright-script (failures pending AI-repair)
**Result:** FAILED
**Duration:** 75.8s

## Summary
| Total Steps | Passed | Failed | Skipped |
|-------------|--------|--------|---------|
| 14 | 1 | 13 | 0 |

## Step Results
### TC-01: Login (Admin)
**Mode:** playwright-script
**Duration:** 7.8s
- [PASS] TC-01: Login (Admin)

### TC-02: Register and Upload Invoice (ADO #102362)
**Mode:** playwright-script
**Duration:** 45.5s
- [FAIL] TC-02: Register and Upload Invoice (ADO #102362)

**Error:**
```
TimeoutError: page.waitForURL: Timeout 20000ms exceeded.
=========================== logs ===========================
waiting for navigation to "**/workflows-my-items" until "load"
  navigated to "https://dha-smartgov-adminportal-qa.shesha.app/shesha/workflow?id=2153eeab-a404-4394-8557-3e7c609ca6cc"
============================================================

  123 |
  124 |     // ASSERT (BLOCKING) routed out (to Assign Branch Finance Admin, received by Finance Unit)
> 125 |     await page.waitForURL('**/workflows-my-items', { timeout: 20000 });
      |                ^
  126 |   });
  127 |
  128 |   test('TC-03: Assign Branch Finance Admin to Assign Certifier (ADO #102369)', async ({ page }) => {
    at C:\Users\nomfa\Test-ReportsHub\projects\DHA-Invoice-Tracking\test-plans\invoice-process\bas.spec.ts:125:16
```
**Location:** C:\Users\nomfa\Test-ReportsHub\projects\DHA-Invoice-Tracking\test-plans\invoice-process\bas.spec.ts:125:16

### TC-03: Assign Branch Finance Admin to Assign Certifier (ADO #102369)
**Mode:** playwright-script
**Duration:** 0.7s
- [FAIL] TC-03: Assign Branch Finance Admin to Assign Certifier (ADO #102369)

### TC-04: Assign Responsible Person to Certify Invoice (ADO #102370)
**Mode:** playwright-script
**Duration:** 0.4s
- [FAIL] TC-04: Assign Responsible Person to Certify Invoice (ADO #102370)

### TC-05: Certify Invoice (ADO #102372)
**Mode:** playwright-script
**Duration:** 0.4s
- [FAIL] TC-05: Certify Invoice (ADO #102372)

### TC-06: Review Invoice Rejection (ADO #102378) — driven live via MCP
**Mode:** playwright-script
**Duration:** 0.0s
- [FAIL] TC-06: Review Invoice Rejection (ADO #102378) — driven live via MCP

### TC-07: Prepare Voucher (ADO #102361)
**Mode:** playwright-script
**Duration:** 0.4s
- [FAIL] TC-07: Prepare Voucher (ADO #102361)

### TC-08: Respond to Queries / Business Related Query (ADO #102398) — driven live via MCP
**Mode:** playwright-script
**Duration:** 0.0s
- [FAIL] TC-08: Respond to Queries / Business Related Query (ADO #102398) — driven live via MCP

### TC-09: Manage Supplier related Queries (ADO #102399) — driven live via MCP
**Mode:** playwright-script
**Duration:** 0.0s
- [FAIL] TC-09: Manage Supplier related Queries (ADO #102399) — driven live via MCP

### TC-10: Verify Voucher (ADO #102380)
**Mode:** playwright-script
**Duration:** 0.4s
- [FAIL] TC-10: Verify Voucher (ADO #102380)

### TC-11: Authorise Invoice Voucher (ADO #102383)
**Mode:** playwright-script
**Duration:** 0.4s
- [FAIL] TC-11: Authorise Invoice Voucher (ADO #102383)

### TC-12: Upload Captured Invoices Report / Final Authorise Payment (ADO #102360) — BAS import via MCP
**Mode:** playwright-script
**Duration:** 0.0s
- [FAIL] TC-12: Upload Captured Invoices Report / Final Authorise Payment (ADO #102360) — BAS import via MCP

### TC-13: Attach Payment Stub (ADO #102359) — stub import via MCP
**Mode:** playwright-script
**Duration:** 0.0s
- [FAIL] TC-13: Attach Payment Stub (ADO #102359) — stub import via MCP

### TC-14: Capture Filing (ADO #102358) — driven live via MCP
**Mode:** playwright-script
**Duration:** 0.0s
- [FAIL] TC-14: Capture Filing (ADO #102358) — driven live via MCP
