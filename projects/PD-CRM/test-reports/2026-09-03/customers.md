# Report: Test Plan: Customers
**Date:** 2026-09-03 18:14 UTC
**Plan:** test-plans/case-management/customers.md
**Spec:** test-plans/case-management/customers.spec.ts
**Execution Mode:** playwright-script (failures pending AI-repair)
**Result:** PARTIAL
**Duration:** 440.0s

## Summary
| Total Steps | Passed | Failed | Skipped |
|-------------|--------|--------|---------|
| 11 | 7 | 4 | 0 |

## Step Results
### TC-01 (#113348): Verify Customers Are Displayed in the Customers List
**Mode:** playwright-script
**Duration:** 19.3s
- [FAIL] TC-01 (#113348): Verify Customers Are Displayed in the Customers List

**Error:**
```
TimeoutError: locator.fill: Timeout 15000ms exceeded.
Call log:
[2m  - waiting for getByPlaceholder('Username')[22m


  42 | async function login(page: Page) {
  43 |   await page.goto(`${BASE}/login`, { waitUntil: 'domcontentloaded' });
> 44 |   await page.getByPlaceholder('Username').fill(ADMIN.user);
     |                                           ^
  45 |   await page.locator('input[type="password"]').first().fill(ADMIN.password);
  46 |   await page.locator('button:has-text("Sign In")').first().click();
  47 |   await page.waitForURL(/\/dynamic\//, { timeout: 60_000 });
    at login (C:\Users\NomfaneloNhleko\OneDrive\Test-ReportsHub\projects\PD-CRM\test-plans\case-management\customers.spec.ts:44:43)
    at C:\Users\NomfaneloNhleko\OneDrive\Test-ReportsHub\projects\PD-CRM\test-plans\case-management\customers.spec.ts:167:5
```
**Location:** C:\Users\NomfaneloNhleko\OneDrive\Test-ReportsHub\projects\PD-CRM\test-plans\case-management\customers.spec.ts:44:43

### TC-02 (#113349): Verify Customer Logged Cases Are Displayed
**Mode:** playwright-script
**Duration:** 33.4s
- [PASS] TC-02 (#113349): Verify Customer Logged Cases Are Displayed

### TC-03 (#113350): Verify Customer Case Can Be Accessed from Logged Cases
**Mode:** playwright-script
**Duration:** 42.4s
- [FAIL] TC-03 (#113350): Verify Customer Case Can Be Accessed from Logged Cases

**Error:**
```
Error: ADO #113350 step 6 expects the selected case to open the All Service Request landing page. The card is inert — no anchor, no click handler, and the datalist's "Open" button is hidden. See BUG-502

[2mexpect([22m[31mreceived[39m[2m).[22mtoBe[2m([22m[32mexpected[39m[2m) // Object.is equality[22m

Expected: [32mtrue[39m
Received: [31mfalse[39m

  271 |       `ADO #113350 step 6 expects the selected case to open the All Service Request landing page. `
  272 |       + `The card is inert — no anchor, no click handler, and the datalist's "Open" button is hidden. `
> 273 |       + `See BUG-502`).toBe(true);
      |                        ^
  274 |
  275 |     // STEP 7: VERIFY the selected case on the landing page — only reachable if the app navigated.
  276 |     if (navigated) {
    at C:\Users\NomfaneloNhleko\OneDrive\Test-ReportsHub\projects\PD-CRM\test-plans\case-management\customers.spec.ts:273:24
```
**Location:** C:\Users\NomfaneloNhleko\OneDrive\Test-ReportsHub\projects\PD-CRM\test-plans\case-management\customers.spec.ts:273:24

### TC-04 (#113351): Verify Customer Interactions Are Displayed
**Mode:** playwright-script
**Duration:** 40.1s
- [PASS] TC-04 (#113351): Verify Customer Interactions Are Displayed

### TC-05 (#113352): Verify Customer Details Can Be Edited
**Mode:** playwright-script
**Duration:** 64.0s
- [PASS] TC-05 (#113352): Verify Customer Details Can Be Edited

### TC-06 (#113353): Verify Customer Can Be Deleted
**Mode:** playwright-script
**Duration:** 48.2s
- [FAIL] TC-06 (#113353): Verify Customer Can Be Deleted

**Error:**
```
Error: ADO #113353 quotes the dialog as "Are you sure you want to delete this item?" — see BUG-501

[2mexpect([22m[31mreceived[39m[2m).[22mtoContain[2m([22m[32mexpected[39m[2m) // indexOf[22m

Expected substring: [32m"Are you sure you want to delete this item?"[39m
Received string:    [31m"Delete User are you sure you want to delete this user? no yes"[39m

  417 |     expect.soft(dialogText,
  418 |       'ADO #113353 quotes the dialog as "Are you sure you want to delete this item?" — see BUG-501')
> 419 |       .toContain('Are you sure you want to delete this item?');
      |        ^
  420 |
  421 |     // STEP 5: CLICK the affirmative control (the app labels it `yes`, not `OK` — BUG-501)
  422 |     const affirm = dialog.getByRole('button', { name: /^(yes|ok)$/i }).first();
    at C:\Users\NomfaneloNhleko\OneDrive\Test-ReportsHub\projects\PD-CRM\test-plans\case-management\customers.spec.ts:419:8
```
**Location:** C:\Users\NomfaneloNhleko\OneDrive\Test-ReportsHub\projects\PD-CRM\test-plans\case-management\customers.spec.ts:419:8

### TC-07 (#113354): Verify Customer Deletion Can Be Cancelled
**Mode:** playwright-script
**Duration:** 44.6s
- [FAIL] TC-07 (#113354): Verify Customer Deletion Can Be Cancelled

**Error:**
```
Error: ADO #113354 quotes the dialog as "Are you sure you want to delete this item?" — see BUG-501

[2mexpect([22m[31mreceived[39m[2m).[22mtoContain[2m([22m[32mexpected[39m[2m) // indexOf[22m

Expected substring: [32m"Are you sure you want to delete this item?"[39m
Received string:    [31m"Delete User are you sure you want to delete this user? no yes"[39m

  459 |     expect.soft(dialogText,
  460 |       'ADO #113354 quotes the dialog as "Are you sure you want to delete this item?" — see BUG-501')
> 461 |       .toContain('Are you sure you want to delete this item?');
      |        ^
  462 |
  463 |     // STEP 5: CLICK the dismiss control (the app labels it `no`, not `Cancel` — BUG-501)
  464 |     const dismiss = dialog.getByRole('button', { name: /^(no|cancel)$/i }).first();
    at C:\Users\NomfaneloNhleko\OneDrive\Test-ReportsHub\projects\PD-CRM\test-plans\case-management\customers.spec.ts:461:8
```
**Location:** C:\Users\NomfaneloNhleko\OneDrive\Test-ReportsHub\projects\PD-CRM\test-plans\case-management\customers.spec.ts:461:8

### TC-08 (#113355): Verify Customers Can Be Searched
**Mode:** playwright-script
**Duration:** 28.5s
- [PASS] TC-08 (#113355): Verify Customers Can Be Searched

### TC-09 (#113356): Verify Customers Can Be Filtered
**Mode:** playwright-script
**Duration:** 37.8s
- [PASS] TC-09 (#113356): Verify Customers Can Be Filtered

### TC-10 (#113357): Verify Customers Can Be Exported
**Mode:** playwright-script
**Duration:** 19.3s
- [PASS] TC-10 (#113357): Verify Customers Can Be Exported

### TC-11 (#113358): Verify Customer Search Returns No Results for Invalid Criteria
**Mode:** playwright-script
**Duration:** 24.4s
- [PASS] TC-11 (#113358): Verify Customer Search Returns No Results for Invalid Criteria
