# Report: NC Dispatch — Administrative Functions Create/Edit (CRUD smoke)
**Date:** 2026-06-23 08:45 UTC
**Plan:** test-plans/administrative-functions/admin-functions-crud.md
**Spec:** test-plans/administrative-functions/admin-functions-crud.spec.ts
**Execution Mode:** playwright-script (failures pending AI-repair)
**Result:** PARTIAL
**Duration:** 425.6s

## Summary
| Total Steps | Passed | Failed | Skipped |
|-------------|--------|--------|---------|
| 24 | 23 | 1 | 0 |

## Step Results
### TC-00: Log in to NC Dispatch
**Mode:** playwright-script
**Duration:** 11.3s
- [PASS] TC-00: Log in to NC Dispatch

### Add Incident Type
**Mode:** playwright-script
**Duration:** 13.3s
- [PASS] Add Incident Type

### Edit Incident Type
**Mode:** playwright-script
**Duration:** 11.1s
- [PASS] Edit Incident Type

### Add Vehicle Type
**Mode:** playwright-script
**Duration:** 12.3s
- [PASS] Add Vehicle Type

### Edit Vehicle Type
**Mode:** playwright-script
**Duration:** 14.4s
- [PASS] Edit Vehicle Type

### Add Device
**Mode:** playwright-script
**Duration:** 12.1s
- [PASS] Add Device

### Edit Device
**Mode:** playwright-script
**Duration:** 20.4s
- [PASS] Edit Device

### Add Vehicle
**Mode:** playwright-script
**Duration:** 18.7s
- [PASS] Add Vehicle

### Edit Vehicle
**Mode:** playwright-script
**Duration:** 33.5s
- [PASS] Edit Vehicle

### Add Agent
**Mode:** playwright-script
**Duration:** 35.3s
- [PASS] Add Agent

### Edit Agent
**Mode:** playwright-script
**Duration:** 39.0s
- [FAIL] Edit Agent

**Error:**
```
Error: [2mexpect([22m[31mlocator[39m[2m).[22mtoBeVisible[2m([22m[2m)[22m failed

Locator: getByRole('cell', { name: 'autotestagent' }).first()
Expected: visible
Timeout: 25000ms
Error: element(s) not found

Call log:
[2m  - Expect "toBeVisible" with timeout 25000ms[22m
[2m  - waiting for getByRole('cell', { name: 'autotestagent' }).first()[22m


  47 |
  48 | async function expectRow(page: Page, cellText: string) {
> 49 |   await expect(page.getByRole('cell', { name: cellText }).first()).toBeVisible({ timeout: 25000 });
     |                                                                    ^
  50 | }
  51 |
  52 | interface Entity {
    at expectRow (C:\Users\nomfa\Test-ReportsHub\projects\dispatch\test-plans\administrative-functions\admin-functions-crud.spec.ts:49:68)
    at C:\Users\nomfa\Test-ReportsHub\projects\dispatch\test-plans\administrative-functions\admin-functions-crud.spec.ts:105:17
```
**Location:** C:\Users\nomfa\Test-ReportsHub\projects\dispatch\test-plans\administrative-functions\admin-functions-crud.spec.ts:49:68

### Add Resource
**Mode:** playwright-script
**Duration:** 17.0s
- [PASS] Add Resource

### Edit Resource
**Mode:** playwright-script
**Duration:** 24.1s
- [PASS] Edit Resource

### Add Station
**Mode:** playwright-script
**Duration:** 11.5s
- [PASS] Add Station

### Edit Station
**Mode:** playwright-script
**Duration:** 11.4s
- [PASS] Edit Station

### Add Crew
**Mode:** playwright-script
**Duration:** 17.3s
- [PASS] Add Crew

### Add Shift
**Mode:** playwright-script
**Duration:** 12.6s
- [PASS] Add Shift

### Edit Shift
**Mode:** playwright-script
**Duration:** 14.3s
- [PASS] Edit Shift

### Add Shift Assignment
**Mode:** playwright-script
**Duration:** 19.0s
- [PASS] Add Shift Assignment

### Edit Shift Assignment
**Mode:** playwright-script
**Duration:** 13.2s
- [PASS] Edit Shift Assignment

### Add Site Type
**Mode:** playwright-script
**Duration:** 12.7s
- [PASS] Add Site Type

### Edit Site Type
**Mode:** playwright-script
**Duration:** 12.6s
- [PASS] Edit Site Type

### Add Point of Interest
**Mode:** playwright-script
**Duration:** 16.6s
- [PASS] Add Point of Interest

### Edit Point of Interest
**Mode:** playwright-script
**Duration:** 16.1s
- [PASS] Edit Point of Interest
