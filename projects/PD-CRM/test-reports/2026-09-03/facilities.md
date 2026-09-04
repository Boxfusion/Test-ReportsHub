# Report: Test Plan: Facilities
**Date:** 2026-09-03 17:21 UTC
**Plan:** test-plans/case-management/facilities.md
**Spec:** test-plans/case-management/facilities.spec.ts
**Execution Mode:** playwright-script (failures pending AI-repair)
**Result:** PARTIAL
**Duration:** 611.1s

## Summary
| Total Steps | Passed | Failed | Skipped |
|-------------|--------|--------|---------|
| 8 | 5 | 3 | 0 |

## Step Results
### TC-01 (#113291): Verify Site Can Be Created
**Mode:** playwright-script
**Duration:** 52.0s
- [FAIL (attempt 1, retried)] TC-01 (#113291): Verify Site Can Be Created

**Error:**
```
Error: ADO #113291 step 5 expects Geo/GIS to retrieve matching locations — see BUG-401

[2mexpect([22m[31mreceived[39m[2m).[22mtoBeGreaterThan[2m([22m[32mexpected[39m[2m)[22m

Expected: > [32m0[39m
Received:   [31m0[39m

  230 |     expect.soft(suggestions,
  231 |       'ADO #113291 step 5 expects Geo/GIS to retrieve matching locations — see BUG-401')
> 232 |       .toBeGreaterThan(0);
      |        ^
  233 |
  234 |     if (suggestions > 0) {
  235 |       await page.locator('div.suggestion').first().click();
    at C:\Users\NomfaneloNhleko\OneDrive\Test-ReportsHub\projects\PD-CRM\test-plans\case-management\facilities.spec.ts:232:8
```
**Location:** C:\Users\NomfaneloNhleko\OneDrive\Test-ReportsHub\projects\PD-CRM\test-plans\case-management\facilities.spec.ts:232:8

### TC-01 (#113291): Verify Site Can Be Created — attempt 2
**Mode:** playwright-script
**Duration:** 56.3s
- [FAIL] TC-01 (#113291): Verify Site Can Be Created

**Error:**
```
Error: ADO #113291 step 5 expects Geo/GIS to retrieve matching locations — see BUG-401

[2mexpect([22m[31mreceived[39m[2m).[22mtoBeGreaterThan[2m([22m[32mexpected[39m[2m)[22m

Expected: > [32m0[39m
Received:   [31m0[39m

  230 |     expect.soft(suggestions,
  231 |       'ADO #113291 step 5 expects Geo/GIS to retrieve matching locations — see BUG-401')
> 232 |       .toBeGreaterThan(0);
      |        ^
  233 |
  234 |     if (suggestions > 0) {
  235 |       await page.locator('div.suggestion').first().click();
    at C:\Users\NomfaneloNhleko\OneDrive\Test-ReportsHub\projects\PD-CRM\test-plans\case-management\facilities.spec.ts:232:8
```
**Location:** C:\Users\NomfaneloNhleko\OneDrive\Test-ReportsHub\projects\PD-CRM\test-plans\case-management\facilities.spec.ts:232:8

### TC-02 (#113292): Verify Site Creation Can Be Cancelled
**Mode:** playwright-script
**Duration:** 40.2s
- [PASS] TC-02 (#113292): Verify Site Creation Can Be Cancelled

### TC-03 (#113293): Verify Mandatory Site Fields Are Validated
**Mode:** playwright-script
**Duration:** 28.9s
- [PASS] TC-03 (#113293): Verify Mandatory Site Fields Are Validated

### TC-04 (#113294): Verify Site Type Can Be Selected
**Mode:** playwright-script
**Duration:** 43.8s
- [PASS] TC-04 (#113294): Verify Site Type Can Be Selected

### TC-05 (#113295): Verify Region Can Be Selected
**Mode:** playwright-script
**Duration:** 45.1s
- [FAIL (attempt 1, retried)] TC-05 (#113295): Verify Region Can Be Selected

**Error:**
```
Error: ADO #113295 requires a valid Region, but none is offered — got ["(Obsolete) Dassenhoek","(Obsolete) Merebank","(Obsolete) Welbedaght (SW)","1"]. See BUG-402

[2mexpect([22m[31mreceived[39m[2m).[22mnot[2m.[22mtoHaveLength[2m([22m[32mexpected[39m[2m)[22m

Expected length: not [32m0[39m
Received array:      [31m[][39m

  375 |     expect.soft(valid,
  376 |       `ADO #113295 requires a valid Region, but none is offered — got ${JSON.stringify(regions)}. See BUG-402`)
> 377 |       .not.toHaveLength(0);
      |            ^
  378 |
  379 |     // STEP 4: SELECT a valid region — ASSERT it is displayed in the field
  380 |     const chosen = await pickAnyRegion(page, modal);
    at C:\Users\NomfaneloNhleko\OneDrive\Test-ReportsHub\projects\PD-CRM\test-plans\case-management\facilities.spec.ts:377:12
```
**Location:** C:\Users\NomfaneloNhleko\OneDrive\Test-ReportsHub\projects\PD-CRM\test-plans\case-management\facilities.spec.ts:377:12

### TC-05 (#113295): Verify Region Can Be Selected — attempt 2
**Mode:** playwright-script
**Duration:** 47.0s
- [FAIL] TC-05 (#113295): Verify Region Can Be Selected

**Error:**
```
Error: ADO #113295 requires a valid Region, but none is offered — got ["(Obsolete) Dassenhoek","(Obsolete) Merebank","(Obsolete) Welbedaght (SW)","1"]. See BUG-402

[2mexpect([22m[31mreceived[39m[2m).[22mnot[2m.[22mtoHaveLength[2m([22m[32mexpected[39m[2m)[22m

Expected length: not [32m0[39m
Received array:      [31m[][39m

  375 |     expect.soft(valid,
  376 |       `ADO #113295 requires a valid Region, but none is offered — got ${JSON.stringify(regions)}. See BUG-402`)
> 377 |       .not.toHaveLength(0);
      |            ^
  378 |
  379 |     // STEP 4: SELECT a valid region — ASSERT it is displayed in the field
  380 |     const chosen = await pickAnyRegion(page, modal);
    at C:\Users\NomfaneloNhleko\OneDrive\Test-ReportsHub\projects\PD-CRM\test-plans\case-management\facilities.spec.ts:377:12
```
**Location:** C:\Users\NomfaneloNhleko\OneDrive\Test-ReportsHub\projects\PD-CRM\test-plans\case-management\facilities.spec.ts:377:12

### TC-06 (#113296): Verify Site Contact Number and Email Address Accept Valid Formats
**Mode:** playwright-script
**Duration:** 49.2s
- [PASS] TC-06 (#113296): Verify Site Contact Number and Email Address Accept Valid Formats

### TC-07 (#113297): Verify Site Contact Number and Email Address Reject Invalid Formats
**Mode:** playwright-script
**Duration:** 51.3s
- [FAIL (attempt 1, retried)] TC-07 (#113297): Verify Site Contact Number and Email Address Reject Invalid Formats

**Error:**
```
Error: ADO #113297 step 4 expects the Geo/GIS results to populate the address — see BUG-401

[2mexpect([22m[31mreceived[39m[2m).[22mtoBeGreaterThan[2m([22m[32mexpected[39m[2m)[22m

Expected: > [32m0[39m
Received:   [31m0[39m

  439 |     expect.soft(suggestions,
  440 |       'ADO #113297 step 4 expects the Geo/GIS results to populate the address — see BUG-401')
> 441 |       .toBeGreaterThan(0);
      |        ^
  442 |     if (suggestions > 0) {
  443 |       await page.locator('div.suggestion').first().click();
  444 |       await page.waitForTimeout(3_000);
    at C:\Users\NomfaneloNhleko\OneDrive\Test-ReportsHub\projects\PD-CRM\test-plans\case-management\facilities.spec.ts:441:8
```
**Location:** C:\Users\NomfaneloNhleko\OneDrive\Test-ReportsHub\projects\PD-CRM\test-plans\case-management\facilities.spec.ts:441:8

### TC-07 (#113297): Verify Site Contact Number and Email Address Reject Invalid Formats — attempt 2
**Mode:** playwright-script
**Duration:** 52.3s
- [FAIL] TC-07 (#113297): Verify Site Contact Number and Email Address Reject Invalid Formats

**Error:**
```
Error: ADO #113297 step 4 expects the Geo/GIS results to populate the address — see BUG-401

[2mexpect([22m[31mreceived[39m[2m).[22mtoBeGreaterThan[2m([22m[32mexpected[39m[2m)[22m

Expected: > [32m0[39m
Received:   [31m0[39m

  439 |     expect.soft(suggestions,
  440 |       'ADO #113297 step 4 expects the Geo/GIS results to populate the address — see BUG-401')
> 441 |       .toBeGreaterThan(0);
      |        ^
  442 |     if (suggestions > 0) {
  443 |       await page.locator('div.suggestion').first().click();
  444 |       await page.waitForTimeout(3_000);
    at C:\Users\NomfaneloNhleko\OneDrive\Test-ReportsHub\projects\PD-CRM\test-plans\case-management\facilities.spec.ts:441:8
```
**Location:** C:\Users\NomfaneloNhleko\OneDrive\Test-ReportsHub\projects\PD-CRM\test-plans\case-management\facilities.spec.ts:441:8

### TC-08 (#113298): Verify Site Details Can Be Viewed
**Mode:** playwright-script
**Duration:** 49.3s
- [PASS] TC-08 (#113298): Verify Site Details Can Be Viewed
