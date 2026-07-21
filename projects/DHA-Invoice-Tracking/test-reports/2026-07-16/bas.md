# Report: BAS — Invoice Tracking Process
**Date:** 2026-07-16 20:53 UTC
**Plan:** test-plans/invoice-process/bas.md
**Spec:** test-plans/invoice-process/bas.spec.ts
**Execution Mode:** playwright-script (failures pending AI-repair)
**Result:** FAILED
**Duration:** 59.1s

## Summary
| Total Steps | Passed | Failed | Skipped |
|-------------|--------|--------|---------|
| 14 | 1 | 13 | 0 |

## Step Results
### TC-01: Login (Admin)
**Mode:** playwright-script
**Duration:** 10.3s
- [PASS] TC-01: Login (Admin)

### TC-02: Register and Upload Invoice (ADO #102362)
**Mode:** playwright-script
**Duration:** 40.4s
- [FAIL] TC-02: Register and Upload Invoice (ADO #102362)

**Error:**
```
Error: [2mexpect([22m[31mlocator[39m[2m).[22mtoBeEnabled[2m([22m[2m)[22m failed

Locator:  getByRole('button', { name: 'Submit' })
Expected: enabled
Received: disabled
Timeout:  10000ms

Call log:
[2m  - Expect "toBeEnabled" with timeout 10000ms[22m
[2m  - waiting for getByRole('button', { name: 'Submit' })[22m
[2m    23 × locator resolved to <button disabled type="button" class="ant-btn css-1lo1l9k css-var-r0 ant-btn-primary ant-btn-lg sha-toolbar-btn sha-toolbar-btn-configurable">…</button>[22m
[2m       - unexpected value "disabled"[22m


  110 |     // ASSERT the row committed — the attachment moves into the committed invoices table row
  111 |     await expect(page.getByText('pdf-test.pdf', { exact: false }).first()).toBeVisible({ timeout: 10000 });
> 112 |     await expect(page.getByRole('button', { name: 'Submit' })).toBeEnabled();
      |                                                                ^
  113 |     await page.getByRole('button', { name: 'Submit' }).click();
  114 |
  115 |     // ASSERT (BLOCKING) routed out (to Assign Branch Finance Admin, received by Finance Unit)
    at C:\Users\nomfa\Test-ReportsHub\projects\DHA-Invoice-Tracking\test-plans\invoice-process\bas.spec.ts:112:64
```
**Location:** C:\Users\nomfa\Test-ReportsHub\projects\DHA-Invoice-Tracking\test-plans\invoice-process\bas.spec.ts:112:64

### TC-03: Assign Branch Finance Admin to Assign Certifier (ADO #102369)
**Mode:** playwright-script
**Duration:** 0.8s
- [FAIL] TC-03: Assign Branch Finance Admin to Assign Certifier (ADO #102369)

### TC-04: Assign Responsible Person to Certify Invoice (ADO #102370)
**Mode:** playwright-script
**Duration:** 0.5s
- [FAIL] TC-04: Assign Responsible Person to Certify Invoice (ADO #102370)

### TC-05: Certify Invoice (ADO #102372)
**Mode:** playwright-script
**Duration:** 0.5s
- [FAIL] TC-05: Certify Invoice (ADO #102372)

### TC-06: Review Invoice Rejection (ADO #102378) — driven live via MCP
**Mode:** playwright-script
**Duration:** 0.0s
- [FAIL] TC-06: Review Invoice Rejection (ADO #102378) — driven live via MCP

### TC-07: Prepare Voucher (ADO #102361)
**Mode:** playwright-script
**Duration:** 0.6s
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
**Duration:** 0.5s
- [FAIL] TC-10: Verify Voucher (ADO #102380)

### TC-11: Authorise Invoice Voucher (ADO #102383)
**Mode:** playwright-script
**Duration:** 0.5s
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
