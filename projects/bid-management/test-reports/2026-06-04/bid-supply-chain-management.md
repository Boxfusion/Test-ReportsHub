# Report: Test Plan: BID-SCM — BID: Supply Chain Management
**Date:** 2026-06-04 12:57 UTC
**Plan:** test-plans/tender-process/bid-supply-chain-management.md
**Spec:** test-plans/tender-process/bid-supply-chain-management.spec.ts
**Execution Mode:** playwright-script (failures pending AI-repair)
**Result:** PARTIAL
**Duration:** 215.3s

## Summary
| Total Steps | Passed | Failed | Skipped |
|-------------|--------|--------|---------|
| 6 | 3 | 3 | 0 |

## Step Results
### TC-01: LogIn to the system
**Mode:** playwright-script
**Duration:** 1.6s
- [FAIL] TC-01: LogIn to the system

### TC-02: Draft Tender
**Mode:** playwright-script
**Duration:** 34.3s
- [PASS] TC-02: Draft Tender

### TC-03: Review and Approve
**Mode:** playwright-script
**Duration:** 28.3s
- [PASS] TC-03: Review and Approve

### TC-04: Publish Tender
**Mode:** playwright-script
**Duration:** 23.8s
- [PASS] TC-04: Publish Tender

### TC-05: Consolidate Supplier Responses
**Mode:** playwright-script
**Duration:** 67.9s
- [FAIL] TC-05: Consolidate Supplier Responses

**Error:**
```
Error: [2mexpect([22m[31mlocator[39m[2m).[22mtoBeVisible[2m([22m[2m)[22m failed

Locator: getByText('Telkom').first()
Expected: visible
Timeout: 10000ms
Error: element(s) not found

Call log:
[2m  - Expect "toBeVisible" with timeout 10000ms[22m
[2m  - waiting for getByText('Telkom').first()[22m


  593 |     await expect(page.getByText('A & A Stationers').first()).toBeVisible({ timeout: 15000 });
  594 |     await expect(page.getByText('BOXFUSION').first()).toBeVisible();
> 595 |     await expect(page.getByText('Telkom').first()).toBeVisible();
      |                                                    ^
  596 |
  597 |     // STEP: confirm the responses are consolidated, then submit
  598 |     await page.locator('div')
    at C:\Users\nomfa\Test-ReportsHub\projects\bid-management\test-plans\tender-process\bid-supply-chain-management.spec.ts:595:52
```
**Location:** C:\Users\nomfa\Test-ReportsHub\projects\bid-management\test-plans\tender-process\bid-supply-chain-management.spec.ts:595:52

### TC-05: Consolidate Supplier Responses
**Mode:** playwright-script
**Duration:** 45.7s
- [FAIL] TC-05: Consolidate Supplier Responses

**Error:**
```
TimeoutError: page.waitForEvent: Timeout 15000ms exceeded while waiting for event "filechooser"
=========================== logs ===========================
waiting for event "filechooser"
============================================================

  70 | // fails to register the file). Then wait for the upload to surface before continuing.
  71 | async function uploadFile(page: Page, trigger: Locator, file: string) {
> 72 |   const chooserPromise = page.waitForEvent('filechooser');
     |                               ^
  73 |   await trigger.click();
  74 |   (await chooserPromise).setFiles(file);
  75 | }
    at uploadFile (C:\Users\nomfa\Test-ReportsHub\projects\bid-management\test-plans\tender-process\bid-supply-chain-management.spec.ts:72:31)
    at addSupplierResponse (C:\Users\nomfa\Test-ReportsHub\projects\bid-management\test-plans\tender-process\bid-supply-chain-management.spec.ts:173:11)
    at C:\Users\nomfa\Test-ReportsHub\projects\bid-management\test-plans\tender-process\bid-supply-chain-management.spec.ts:590:5
```
**Location:** C:\Users\nomfa\Test-ReportsHub\projects\bid-management\test-plans\tender-process\bid-supply-chain-management.spec.ts:72:31
