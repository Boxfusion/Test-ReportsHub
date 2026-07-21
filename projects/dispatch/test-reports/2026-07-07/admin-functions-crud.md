# Report: NC Dispatch — Administrative Functions Create/Edit (CRUD smoke)
**Date:** 2026-07-07 11:25 UTC
**Plan:** test-plans/administrative-functions/admin-functions-crud.md
**Spec:** test-plans/administrative-functions/admin-functions-crud.spec.ts
**Execution Mode:** playwright-script (failures pending AI-repair)
**Result:** PARTIAL
**Duration:** 356.3s

## Summary
| Total Steps | Passed | Failed | Skipped |
|-------------|--------|--------|---------|
| 24 | 22 | 2 | 0 |

## Step Results
### TC-00: Log in to NC Dispatch
**Mode:** playwright-script
**Duration:** 4.9s
- [PASS] TC-00: Log in to NC Dispatch

### Add Incident Type
**Mode:** playwright-script
**Duration:** 11.2s
- [PASS] Add Incident Type

### Edit Incident Type
**Mode:** playwright-script
**Duration:** 10.6s
- [PASS] Edit Incident Type

### Add Vehicle Type
**Mode:** playwright-script
**Duration:** 10.3s
- [PASS] Add Vehicle Type

### Edit Vehicle Type
**Mode:** playwright-script
**Duration:** 10.1s
- [PASS] Edit Vehicle Type

### Add Device
**Mode:** playwright-script
**Duration:** 9.5s
- [PASS] Add Device

### Edit Device
**Mode:** playwright-script
**Duration:** 10.3s
- [PASS] Edit Device

### Add Vehicle
**Mode:** playwright-script
**Duration:** 14.2s
- [PASS] Add Vehicle

### Edit Vehicle
**Mode:** playwright-script
**Duration:** 10.1s
- [PASS] Edit Vehicle

### Add Agent
**Mode:** playwright-script
**Duration:** 30.6s
- [PASS] Add Agent

### Edit Agent
**Mode:** playwright-script
**Duration:** 32.1s
- [PASS] Edit Agent

### Add Resource
**Mode:** playwright-script
**Duration:** 11.2s
- [PASS] Add Resource

### Edit Resource
**Mode:** playwright-script
**Duration:** 24.4s
- [PASS] Edit Resource

### Add Station
**Mode:** playwright-script
**Duration:** 9.7s
- [PASS] Add Station

### Edit Station
**Mode:** playwright-script
**Duration:** 9.9s
- [PASS] Edit Station

### Add Crew
**Mode:** playwright-script
**Duration:** 36.0s
- [FAIL] Add Crew

**Error:**
```
Error: [2mexpect([22m[31mlocator[39m[2m).[22mtoBeVisible[2m([22m[2m)[22m failed

Locator: getByRole('cell', { name: 'AutoTestCrew 003' }).first()
Expected: visible
Timeout: 25000ms
Error: element(s) not found

Call log:
[2m  - Expect "toBeVisible" with timeout 25000ms[22m
[2m  - waiting for getByRole('cell', { name: 'AutoTestCrew 003' }).first()[22m


  51 |
  52 | async function expectRow(page: Page, cellText: string) {
> 53 |   await expect(page.getByRole('cell', { name: cellText }).first()).toBeVisible({ timeout: 25000 });
     |                                                                    ^
  54 | }
  55 |
  56 | // Open an AntD select (click the selector, not the readonly input that intercepts) and pick an option
    at expectRow (C:\Users\nomfa\Test-ReportsHub\projects\dispatch\test-plans\administrative-functions\admin-functions-crud.spec.ts:53:68)
    at C:\Users\nomfa\Test-ReportsHub\projects\dispatch\test-plans\administrative-functions\admin-functions-crud.spec.ts:148:15
```
**Location:** C:\Users\nomfa\Test-ReportsHub\projects\dispatch\test-plans\administrative-functions\admin-functions-crud.spec.ts:53:68

### Add Shift
**Mode:** playwright-script
**Duration:** 9.3s
- [PASS] Add Shift

### Edit Shift
**Mode:** playwright-script
**Duration:** 9.4s
- [PASS] Edit Shift

### Add Shift Assignment
**Mode:** playwright-script
**Duration:** 9.0s
- [PASS] Add Shift Assignment

### Edit Shift Assignment
**Mode:** playwright-script
**Duration:** 35.6s
- [FAIL] Edit Shift Assignment

**Error:**
```
Error: [2mexpect([22m[31mlocator[39m[2m).[22mtoBeVisible[2m([22m[2m)[22m failed

Locator: getByRole('cell', { name: 'Auto Test Shift' }).first()
Expected: visible
Timeout: 25000ms
Error: element(s) not found

Call log:
[2m  - Expect "toBeVisible" with timeout 25000ms[22m
[2m  - waiting for getByRole('cell', { name: 'Auto Test Shift' }).first()[22m


  51 |
  52 | async function expectRow(page: Page, cellText: string) {
> 53 |   await expect(page.getByRole('cell', { name: cellText }).first()).toBeVisible({ timeout: 25000 });
     |                                                                    ^
  54 | }
  55 |
  56 | // Open an AntD select (click the selector, not the readonly input that intercepts) and pick an option
    at expectRow (C:\Users\nomfa\Test-ReportsHub\projects\dispatch\test-plans\administrative-functions\admin-functions-crud.spec.ts:53:68)
    at C:\Users\nomfa\Test-ReportsHub\projects\dispatch\test-plans\administrative-functions\admin-functions-crud.spec.ts:158:17
```
**Location:** C:\Users\nomfa\Test-ReportsHub\projects\dispatch\test-plans\administrative-functions\admin-functions-crud.spec.ts:53:68

### Add Site Type
**Mode:** playwright-script
**Duration:** 10.8s
- [PASS] Add Site Type

### Edit Site Type
**Mode:** playwright-script
**Duration:** 9.9s
- [PASS] Edit Site Type

### Add Point of Interest
**Mode:** playwright-script
**Duration:** 10.7s
- [PASS] Add Point of Interest

### Edit Point of Interest
**Mode:** playwright-script
**Duration:** 10.5s
- [PASS] Edit Point of Interest
