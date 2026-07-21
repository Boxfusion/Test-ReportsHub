# Report: NC Dispatch — Administrative Functions Create/Edit (CRUD smoke)
**Date:** 2026-06-24 15:28 UTC
**Plan:** test-plans/administrative-functions/admin-functions-crud.md
**Spec:** test-plans/administrative-functions/admin-functions-crud.spec.ts
**Execution Mode:** playwright-script (failures pending AI-repair)
**Result:** PARTIAL
**Duration:** 390.9s

## Summary
| Total Steps | Passed | Failed | Skipped |
|-------------|--------|--------|---------|
| 24 | 23 | 1 | 0 |

## Step Results
### TC-00: Log in to NC Dispatch
**Mode:** playwright-script
**Duration:** 5.9s
- [PASS] TC-00: Log in to NC Dispatch

### Add Incident Type
**Mode:** playwright-script
**Duration:** 13.2s
- [PASS] Add Incident Type

### Edit Incident Type
**Mode:** playwright-script
**Duration:** 12.0s
- [PASS] Edit Incident Type

### Add Vehicle Type
**Mode:** playwright-script
**Duration:** 14.2s
- [PASS] Add Vehicle Type

### Edit Vehicle Type
**Mode:** playwright-script
**Duration:** 15.5s
- [PASS] Edit Vehicle Type

### Add Device
**Mode:** playwright-script
**Duration:** 16.8s
- [PASS] Add Device

### Edit Device
**Mode:** playwright-script
**Duration:** 15.7s
- [PASS] Edit Device

### Add Vehicle
**Mode:** playwright-script
**Duration:** 14.2s
- [PASS] Add Vehicle

### Edit Vehicle
**Mode:** playwright-script
**Duration:** 14.1s
- [PASS] Edit Vehicle

### Add Agent
**Mode:** playwright-script
**Duration:** 38.9s
- [FAIL] Add Agent

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
    at C:\Users\nomfa\Test-ReportsHub\projects\dispatch\test-plans\administrative-functions\admin-functions-crud.spec.ts:95:15
```
**Location:** C:\Users\nomfa\Test-ReportsHub\projects\dispatch\test-plans\administrative-functions\admin-functions-crud.spec.ts:49:68

### Edit Agent
**Mode:** playwright-script
**Duration:** 19.6s
- [PASS] Edit Agent

### Add Resource
**Mode:** playwright-script
**Duration:** 19.5s
- [PASS] Add Resource

### Edit Resource
**Mode:** playwright-script
**Duration:** 28.5s
- [PASS] Edit Resource

### Add Station
**Mode:** playwright-script
**Duration:** 15.9s
- [PASS] Add Station

### Edit Station
**Mode:** playwright-script
**Duration:** 13.8s
- [PASS] Edit Station

### Add Crew
**Mode:** playwright-script
**Duration:** 13.7s
- [PASS] Add Crew

### Add Shift
**Mode:** playwright-script
**Duration:** 15.4s
- [PASS] Add Shift

### Edit Shift
**Mode:** playwright-script
**Duration:** 14.0s
- [PASS] Edit Shift

### Add Shift Assignment
**Mode:** playwright-script
**Duration:** 12.5s
- [PASS] Add Shift Assignment

### Edit Shift Assignment
**Mode:** playwright-script
**Duration:** 12.7s
- [PASS] Edit Shift Assignment

### Add Site Type
**Mode:** playwright-script
**Duration:** 13.4s
- [PASS] Add Site Type

### Edit Site Type
**Mode:** playwright-script
**Duration:** 13.8s
- [PASS] Edit Site Type

### Add Point of Interest
**Mode:** playwright-script
**Duration:** 13.2s
- [PASS] Add Point of Interest

### Edit Point of Interest
**Mode:** playwright-script
**Duration:** 15.8s
- [PASS] Edit Point of Interest
