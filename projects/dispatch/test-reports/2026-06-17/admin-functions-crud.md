# Report: NC Dispatch — Administrative Functions Create/Edit (CRUD smoke)
**Date:** 2026-06-17 14:02 UTC
**Plan:** test-plans/administrative-functions/admin-functions-crud.md
**Spec:** test-plans/administrative-functions/admin-functions-crud.spec.ts
**Execution Mode:** playwright-script (failures pending AI-repair)
**Result:** PARTIAL
**Duration:** 361.3s

## Summary
| Total Steps | Passed | Failed | Skipped |
|-------------|--------|--------|---------|
| 25 | 24 | 1 | 0 |

## Step Results
### TC-00: Log in to NC Dispatch
**Mode:** playwright-script
**Duration:** 6.8s
- [PASS] TC-00: Log in to NC Dispatch

### Add Incident Type
**Mode:** playwright-script
**Duration:** 18.4s
- [FAIL] Add Incident Type

**Error:**
```
TimeoutError: locator.fill: Timeout 15000ms exceeded.
Call log:
[2m  - waiting for getByPlaceholder('Username')[22m


  21 | async function login(page: Page) {
  22 |   await page.goto(APP_URL);
> 23 |   await page.getByPlaceholder('Username').fill(ADMIN.user);
     |                                           ^
  24 |   await page.getByPlaceholder('Password').fill(ADMIN.password);
  25 |   await page.getByRole('button', { name: 'Sign In' }).click();
  26 |   await page.waitForURL((url) => !url.href.includes('/login'), { timeout: 30000 });
    at login (C:\Users\nomfa\Test-ReportsHub\projects\dispatch\test-plans\administrative-functions\admin-functions-crud.spec.ts:23:43)
    at C:\Users\nomfa\Test-ReportsHub\projects\dispatch\test-plans\administrative-functions\admin-functions-crud.spec.ts:91:9
```
**Location:** C:\Users\nomfa\Test-ReportsHub\projects\dispatch\test-plans\administrative-functions\admin-functions-crud.spec.ts:23:43

### Add Incident Type
**Mode:** playwright-script
**Duration:** 12.5s
- [PASS] Add Incident Type

### Edit Incident Type
**Mode:** playwright-script
**Duration:** 12.5s
- [PASS] Edit Incident Type

### Add Vehicle Type
**Mode:** playwright-script
**Duration:** 13.7s
- [PASS] Add Vehicle Type

### Edit Vehicle Type
**Mode:** playwright-script
**Duration:** 12.1s
- [PASS] Edit Vehicle Type

### Add Device
**Mode:** playwright-script
**Duration:** 14.5s
- [PASS] Add Device

### Edit Device
**Mode:** playwright-script
**Duration:** 17.5s
- [PASS] Edit Device

### Add Vehicle
**Mode:** playwright-script
**Duration:** 13.1s
- [PASS] Add Vehicle

### Edit Vehicle
**Mode:** playwright-script
**Duration:** 15.1s
- [PASS] Edit Vehicle

### Add Agent
**Mode:** playwright-script
**Duration:** 26.3s
- [PASS] Add Agent

### Edit Agent
**Mode:** playwright-script
**Duration:** 14.6s
- [PASS] Edit Agent

### Add Resource
**Mode:** playwright-script
**Duration:** 13.4s
- [PASS] Add Resource

### Edit Resource
**Mode:** playwright-script
**Duration:** 18.1s
- [PASS] Edit Resource

### Add Station
**Mode:** playwright-script
**Duration:** 14.4s
- [PASS] Add Station

### Edit Station
**Mode:** playwright-script
**Duration:** 12.3s
- [PASS] Edit Station

### Add Crew
**Mode:** playwright-script
**Duration:** 14.6s
- [PASS] Add Crew

### Add Shift
**Mode:** playwright-script
**Duration:** 11.4s
- [PASS] Add Shift

### Edit Shift
**Mode:** playwright-script
**Duration:** 13.6s
- [PASS] Edit Shift

### Add Shift Assignment
**Mode:** playwright-script
**Duration:** 14.2s
- [PASS] Add Shift Assignment

### Edit Shift Assignment
**Mode:** playwright-script
**Duration:** 13.1s
- [PASS] Edit Shift Assignment

### Add Site Type
**Mode:** playwright-script
**Duration:** 13.0s
- [PASS] Add Site Type

### Edit Site Type
**Mode:** playwright-script
**Duration:** 12.6s
- [PASS] Edit Site Type

### Add Point of Interest
**Mode:** playwright-script
**Duration:** 12.8s
- [PASS] Add Point of Interest

### Edit Point of Interest
**Mode:** playwright-script
**Duration:** 14.2s
- [PASS] Edit Point of Interest
