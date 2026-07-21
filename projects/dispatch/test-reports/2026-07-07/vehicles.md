# Report: Test Plan: ADMIN-2.4 — Vehicles
**Date:** 2026-07-07 12:32 UTC
**Plan:** test-plans/administrative-functions/vehicles.md
**Spec:** test-plans/administrative-functions/vehicles.spec.ts
**Execution Mode:** playwright-script (failures pending AI-repair)
**Result:** PARTIAL
**Duration:** 204.8s

## Summary
| Total Steps | Passed | Failed | Skipped |
|-------------|--------|--------|---------|
| 11 | 10 | 1 | 0 |

## Step Results
### TC-01: Log in to NC Dispatch
**Mode:** playwright-script
**Duration:** 19.8s
- [PASS] TC-01: Log in to NC Dispatch

### TC-02: Search for a vehicle by registration number
**Mode:** playwright-script
**Duration:** 55.9s
- [FAIL] TC-02: Search for a vehicle by registration number

**Error:**
```
Error: [2mexpect([22m[31mlocator[39m[2m).[22mtoBeVisible[2m([22m[2m)[22m failed

Locator: getByRole('cell', { name: /NC/ }).first()
Expected: visible
Timeout: 15000ms
Error: element(s) not found

Call log:
[2m  - Expect "toBeVisible" with timeout 15000ms[22m
[2m  - waiting for getByRole('cell', { name: /NC/ }).first()[22m


  94 |     await expect(page.getByRole('table')).toBeVisible();
  95 |     await searchGrid(page, 'NC');
> 96 |     await expect(page.getByRole('cell', { name: /NC/ }).first()).toBeVisible({ timeout: 15000 });
     |                                                                  ^
  97 |   });
  98 |
  99 |   // ADO Test Case #65740: https://dev.azure.com/boxfusion/pd-dispatcher-V2/_workitems/edit/65740
    at C:\Users\nomfa\Test-ReportsHub\projects\dispatch\test-plans\administrative-functions\vehicles.spec.ts:96:66
```
**Location:** C:\Users\nomfa\Test-ReportsHub\projects\dispatch\test-plans\administrative-functions\vehicles.spec.ts:96:66

### TC-03: Search by vehicle type or station
**Mode:** playwright-script
**Duration:** 19.8s
- [PASS] TC-03: Search by vehicle type or station

### TC-04: Click on 'Add New' button
**Mode:** playwright-script
**Duration:** 10.3s
- [PASS] TC-04: Click on 'Add New' button

### TC-05: Add new vehicle with valid data
**Mode:** playwright-script
**Duration:** 17.5s
- [PASS] TC-05: Add new vehicle with valid data

### TC-06: View vehicle details
**Mode:** playwright-script
**Duration:** 12.5s
- [PASS] TC-06: View vehicle details

### TC-07: Return to vehicle list from details view
**Mode:** playwright-script
**Duration:** 13.5s
- [PASS] TC-07: Return to vehicle list from details view

### TC-08: Edit vehicle from details view
**Mode:** playwright-script
**Duration:** 13.4s
- [PASS] TC-08: Edit vehicle from details view

### TC-09: Cancel vehicle edit
**Mode:** playwright-script
**Duration:** 12.3s
- [PASS] TC-09: Cancel vehicle edit

### TC-10: Save vehicle edit
**Mode:** playwright-script
**Duration:** 11.3s
- [PASS] TC-10: Save vehicle edit

### TC-11: Edit vehicle using edit icon
**Mode:** playwright-script
**Duration:** 11.6s
- [PASS] TC-11: Edit vehicle using edit icon
