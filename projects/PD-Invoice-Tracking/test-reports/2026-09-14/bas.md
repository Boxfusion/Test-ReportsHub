# Report: BAS — Invoice Tracking Process
**Date:** 2026-09-14 08:04 UTC
**Plan:** test-plans/invoice-process/bas.md
**Spec:** test-plans/invoice-process/bas.spec.ts
**Execution Mode:** playwright-script (failures pending AI-repair)
**Result:** PARTIAL
**Duration:** 77.6s

## Summary
| Total Steps | Passed | Failed | Skipped |
|-------------|--------|--------|---------|
| 14 | 2 | 1 | 11 |

## Step Results
### TC-01: Login (ThulileM)
**Mode:** playwright-script
**Duration:** 2.8s
- [PASS] TC-01: Login (ThulileM)

### TC-02: Register and Upload Invoice (ADO #102362)
**Mode:** playwright-script
**Duration:** 13.3s
- [PASS] TC-02: Register and Upload Invoice (ADO #102362)

### TC-03: Assign Branch Finance Admin to Assign Certifier (ADO #102369)
**Mode:** playwright-script
**Duration:** 30.4s
- [FAIL] TC-03: Assign Branch Finance Admin to Assign Certifier (ADO #102369)

**Error:**
```
Error: [2mexpect([22m[31mlocator[39m[2m).[22mtoBeVisible[2m([22m[2m)[22m failed

Locator: getByText('Assign Responsible Person to Certify Invoice').first()
Expected: visible
Timeout: 15000ms
Error: element(s) not found

Call log:
[2m  - Expect "toBeVisible" with timeout 15000ms[22m
[2m  - waiting for getByText('Assign Responsible Person to Certify Invoice').first()[22m


  227 |     await page.waitForURL('**/workflows-my-items', { timeout: 15000 });
  228 |     await expect(page.getByText('Assign Responsible Person to Certify Invoice', { exact: false }).first())
> 229 |       .toBeVisible({ timeout: 15000 });
      |        ^
  230 |   });
  231 |
  232 |   test('TC-04: Assign Responsible Person to Certify Invoices (ADO #102370)', async () => {
    at C:\Users\NomfaneloNhleko\OneDrive\Test-ReportsHub\projects\PD-Invoice-Tracking\test-plans\invoice-process\bas.spec.ts:229:8
```
**Location:** C:\Users\NomfaneloNhleko\OneDrive\Test-ReportsHub\projects\PD-Invoice-Tracking\test-plans\invoice-process\bas.spec.ts:229:8

### TC-04: Assign Responsible Person to Certify Invoices (ADO #102370)
**Mode:** playwright-script
**Duration:** 0.0s
- [SKIP] TC-04: Assign Responsible Person to Certify Invoices (ADO #102370)

### TC-05: Certify Invoice (ADO #102372)
**Mode:** playwright-script
**Duration:** 0.0s
- [SKIP] TC-05: Certify Invoice (ADO #102372)

### TC-06: Review Invoice Rejection (ADO #102378)
**Mode:** playwright-script
**Duration:** 0.0s
- [SKIP] TC-06: Review Invoice Rejection (ADO #102378)

### TC-07: Prepare Voucher (ADO #102361)
**Mode:** playwright-script
**Duration:** 0.0s
- [SKIP] TC-07: Prepare Voucher (ADO #102361)

### TC-08: Respond to Queries / Business Related Query (ADO #102398)
**Mode:** playwright-script
**Duration:** 0.0s
- [SKIP] TC-08: Respond to Queries / Business Related Query (ADO #102398)

### TC-09: Manage Supplier related Queries (ADO #102399)
**Mode:** playwright-script
**Duration:** 0.0s
- [SKIP] TC-09: Manage Supplier related Queries (ADO #102399)

### TC-10: Verify Voucher (ADO #102380)
**Mode:** playwright-script
**Duration:** 0.0s
- [SKIP] TC-10: Verify Voucher (ADO #102380)

### TC-11: Authorise Invoice Voucher (ADO #102383)
**Mode:** playwright-script
**Duration:** 0.0s
- [SKIP] TC-11: Authorise Invoice Voucher (ADO #102383)

### TC-12: Upload Captured Invoices Report / Final Authorise Payment (ADO #102360)
**Mode:** playwright-script
**Duration:** 0.0s
- [SKIP] TC-12: Upload Captured Invoices Report / Final Authorise Payment (ADO #102360)

### TC-13: Attach Payment Stub (ADO #102359)
**Mode:** playwright-script
**Duration:** 0.0s
- [SKIP] TC-13: Attach Payment Stub (ADO #102359)

### TC-14: Capture Filing (ADO #102358)
**Mode:** playwright-script
**Duration:** 0.0s
- [SKIP] TC-14: Capture Filing (ADO #102358)
