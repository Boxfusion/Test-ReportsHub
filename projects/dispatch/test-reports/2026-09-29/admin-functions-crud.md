# Report: NC Dispatch — Administrative Functions Create/Edit (CRUD smoke)
**Date:** 2026-09-29 12:07 UTC
**Plan:** test-plans/administrative-functions/admin-functions-crud.md
**Spec:** test-plans/administrative-functions/admin-functions-crud.spec.ts
**Execution Mode:** playwright-script (failures pending AI-repair)
**Result:** FAILED
**Duration:** 1402.1s

## Summary
| Total Steps | Passed | Failed | Skipped |
|-------------|--------|--------|---------|
| 24 | 0 | 24 | 0 |

## Step Results
### TC-00: Log in to NC Dispatch
**Mode:** playwright-script
**Duration:** 36.3s
- [FAIL] TC-00: Log in to NC Dispatch

**Error:**
```
TimeoutError: page.waitForURL: Timeout 30000ms exceeded.
=========================== logs ===========================
waiting for navigation until "load"
============================================================

  28 |   await page.getByPlaceholder('Password').fill(ADMIN.password);
  29 |   await page.getByRole('button', { name: 'Sign In' }).click();
> 30 |   await page.waitForURL((url) => !url.href.includes('/login'), { timeout: 30000 });
     |              ^
  31 | }
  32 |
  33 | // Reach an entity grid directly by URL and wait on the table (collapsed sidebar flyouts don't open
    at login (C:\Users\Mishalia Pillay\Desktop\Test-ReportsHub\projects\dispatch\test-plans\administrative-functions\admin-functions-crud.spec.ts:30:14)
    at C:\Users\Mishalia Pillay\Desktop\Test-ReportsHub\projects\dispatch\test-plans\administrative-functions\admin-functions-crud.spec.ts:130:5
```
**Location:** C:\Users\Mishalia Pillay\Desktop\Test-ReportsHub\projects\dispatch\test-plans\administrative-functions\admin-functions-crud.spec.ts:30:14

### Add Incident Type
**Mode:** playwright-script
**Duration:** 34.0s
- [FAIL] Add Incident Type

**Error:**
```
TimeoutError: page.waitForURL: Timeout 30000ms exceeded.
=========================== logs ===========================
waiting for navigation until "load"
============================================================

  28 |   await page.getByPlaceholder('Password').fill(ADMIN.password);
  29 |   await page.getByRole('button', { name: 'Sign In' }).click();
> 30 |   await page.waitForURL((url) => !url.href.includes('/login'), { timeout: 30000 });
     |              ^
  31 | }
  32 |
  33 | // Reach an entity grid directly by URL and wait on the table (collapsed sidebar flyouts don't open
    at login (C:\Users\Mishalia Pillay\Desktop\Test-ReportsHub\projects\dispatch\test-plans\administrative-functions\admin-functions-crud.spec.ts:30:14)
    at C:\Users\Mishalia Pillay\Desktop\Test-ReportsHub\projects\dispatch\test-plans\administrative-functions\admin-functions-crud.spec.ts:139:9
```
**Location:** C:\Users\Mishalia Pillay\Desktop\Test-ReportsHub\projects\dispatch\test-plans\administrative-functions\admin-functions-crud.spec.ts:30:14

### Edit Incident Type
**Mode:** playwright-script
**Duration:** 33.6s
- [FAIL] Edit Incident Type

**Error:**
```
TimeoutError: page.waitForURL: Timeout 30000ms exceeded.
=========================== logs ===========================
waiting for navigation until "load"
============================================================

  28 |   await page.getByPlaceholder('Password').fill(ADMIN.password);
  29 |   await page.getByRole('button', { name: 'Sign In' }).click();
> 30 |   await page.waitForURL((url) => !url.href.includes('/login'), { timeout: 30000 });
     |              ^
  31 | }
  32 |
  33 | // Reach an entity grid directly by URL and wait on the table (collapsed sidebar flyouts don't open
    at login (C:\Users\Mishalia Pillay\Desktop\Test-ReportsHub\projects\dispatch\test-plans\administrative-functions\admin-functions-crud.spec.ts:30:14)
    at C:\Users\Mishalia Pillay\Desktop\Test-ReportsHub\projects\dispatch\test-plans\administrative-functions\admin-functions-crud.spec.ts:156:11
```
**Location:** C:\Users\Mishalia Pillay\Desktop\Test-ReportsHub\projects\dispatch\test-plans\administrative-functions\admin-functions-crud.spec.ts:30:14

### Add Vehicle Type
**Mode:** playwright-script
**Duration:** 33.8s
- [FAIL] Add Vehicle Type

**Error:**
```
TimeoutError: page.waitForURL: Timeout 30000ms exceeded.
=========================== logs ===========================
waiting for navigation until "load"
============================================================

  28 |   await page.getByPlaceholder('Password').fill(ADMIN.password);
  29 |   await page.getByRole('button', { name: 'Sign In' }).click();
> 30 |   await page.waitForURL((url) => !url.href.includes('/login'), { timeout: 30000 });
     |              ^
  31 | }
  32 |
  33 | // Reach an entity grid directly by URL and wait on the table (collapsed sidebar flyouts don't open
    at login (C:\Users\Mishalia Pillay\Desktop\Test-ReportsHub\projects\dispatch\test-plans\administrative-functions\admin-functions-crud.spec.ts:30:14)
    at C:\Users\Mishalia Pillay\Desktop\Test-ReportsHub\projects\dispatch\test-plans\administrative-functions\admin-functions-crud.spec.ts:139:9
```
**Location:** C:\Users\Mishalia Pillay\Desktop\Test-ReportsHub\projects\dispatch\test-plans\administrative-functions\admin-functions-crud.spec.ts:30:14

### Edit Vehicle Type
**Mode:** playwright-script
**Duration:** 33.8s
- [FAIL] Edit Vehicle Type

**Error:**
```
TimeoutError: page.waitForURL: Timeout 30000ms exceeded.
=========================== logs ===========================
waiting for navigation until "load"
============================================================

  28 |   await page.getByPlaceholder('Password').fill(ADMIN.password);
  29 |   await page.getByRole('button', { name: 'Sign In' }).click();
> 30 |   await page.waitForURL((url) => !url.href.includes('/login'), { timeout: 30000 });
     |              ^
  31 | }
  32 |
  33 | // Reach an entity grid directly by URL and wait on the table (collapsed sidebar flyouts don't open
    at login (C:\Users\Mishalia Pillay\Desktop\Test-ReportsHub\projects\dispatch\test-plans\administrative-functions\admin-functions-crud.spec.ts:30:14)
    at C:\Users\Mishalia Pillay\Desktop\Test-ReportsHub\projects\dispatch\test-plans\administrative-functions\admin-functions-crud.spec.ts:156:11
```
**Location:** C:\Users\Mishalia Pillay\Desktop\Test-ReportsHub\projects\dispatch\test-plans\administrative-functions\admin-functions-crud.spec.ts:30:14

### Add Device
**Mode:** playwright-script
**Duration:** 245.8s
- [FAIL] Add Device

**Error:**
```
TimeoutError: page.waitForURL: Timeout 30000ms exceeded.
=========================== logs ===========================
waiting for navigation until "load"
============================================================

  28 |   await page.getByPlaceholder('Password').fill(ADMIN.password);
  29 |   await page.getByRole('button', { name: 'Sign In' }).click();
> 30 |   await page.waitForURL((url) => !url.href.includes('/login'), { timeout: 30000 });
     |              ^
  31 | }
  32 |
  33 | // Reach an entity grid directly by URL and wait on the table (collapsed sidebar flyouts don't open
    at login (C:\Users\Mishalia Pillay\Desktop\Test-ReportsHub\projects\dispatch\test-plans\administrative-functions\admin-functions-crud.spec.ts:30:14)
    at C:\Users\Mishalia Pillay\Desktop\Test-ReportsHub\projects\dispatch\test-plans\administrative-functions\admin-functions-crud.spec.ts:139:9
```
**Location:** C:\Users\Mishalia Pillay\Desktop\Test-ReportsHub\projects\dispatch\test-plans\administrative-functions\admin-functions-crud.spec.ts:30:14

### Edit Device
**Mode:** playwright-script
**Duration:** 290.7s
- [FAIL] Edit Device

**Error:**
```
TimeoutError: page.waitForURL: Timeout 30000ms exceeded.
=========================== logs ===========================
waiting for navigation until "load"
============================================================

  28 |   await page.getByPlaceholder('Password').fill(ADMIN.password);
  29 |   await page.getByRole('button', { name: 'Sign In' }).click();
> 30 |   await page.waitForURL((url) => !url.href.includes('/login'), { timeout: 30000 });
     |              ^
  31 | }
  32 |
  33 | // Reach an entity grid directly by URL and wait on the table (collapsed sidebar flyouts don't open
    at login (C:\Users\Mishalia Pillay\Desktop\Test-ReportsHub\projects\dispatch\test-plans\administrative-functions\admin-functions-crud.spec.ts:30:14)
    at C:\Users\Mishalia Pillay\Desktop\Test-ReportsHub\projects\dispatch\test-plans\administrative-functions\admin-functions-crud.spec.ts:156:11
```
**Location:** C:\Users\Mishalia Pillay\Desktop\Test-ReportsHub\projects\dispatch\test-plans\administrative-functions\admin-functions-crud.spec.ts:30:14

### Add Vehicle
**Mode:** playwright-script
**Duration:** 39.3s
- [FAIL] Add Vehicle

**Error:**
```
TimeoutError: page.waitForURL: Timeout 30000ms exceeded.
=========================== logs ===========================
waiting for navigation until "load"
============================================================

  28 |   await page.getByPlaceholder('Password').fill(ADMIN.password);
  29 |   await page.getByRole('button', { name: 'Sign In' }).click();
> 30 |   await page.waitForURL((url) => !url.href.includes('/login'), { timeout: 30000 });
     |              ^
  31 | }
  32 |
  33 | // Reach an entity grid directly by URL and wait on the table (collapsed sidebar flyouts don't open
    at login (C:\Users\Mishalia Pillay\Desktop\Test-ReportsHub\projects\dispatch\test-plans\administrative-functions\admin-functions-crud.spec.ts:30:14)
    at C:\Users\Mishalia Pillay\Desktop\Test-ReportsHub\projects\dispatch\test-plans\administrative-functions\admin-functions-crud.spec.ts:139:9
```
**Location:** C:\Users\Mishalia Pillay\Desktop\Test-ReportsHub\projects\dispatch\test-plans\administrative-functions\admin-functions-crud.spec.ts:30:14

### Edit Vehicle
**Mode:** playwright-script
**Duration:** 38.0s
- [FAIL] Edit Vehicle

**Error:**
```
TimeoutError: page.waitForURL: Timeout 30000ms exceeded.
=========================== logs ===========================
waiting for navigation until "load"
============================================================

  28 |   await page.getByPlaceholder('Password').fill(ADMIN.password);
  29 |   await page.getByRole('button', { name: 'Sign In' }).click();
> 30 |   await page.waitForURL((url) => !url.href.includes('/login'), { timeout: 30000 });
     |              ^
  31 | }
  32 |
  33 | // Reach an entity grid directly by URL and wait on the table (collapsed sidebar flyouts don't open
    at login (C:\Users\Mishalia Pillay\Desktop\Test-ReportsHub\projects\dispatch\test-plans\administrative-functions\admin-functions-crud.spec.ts:30:14)
    at C:\Users\Mishalia Pillay\Desktop\Test-ReportsHub\projects\dispatch\test-plans\administrative-functions\admin-functions-crud.spec.ts:156:11
```
**Location:** C:\Users\Mishalia Pillay\Desktop\Test-ReportsHub\projects\dispatch\test-plans\administrative-functions\admin-functions-crud.spec.ts:30:14

### Add Agent
**Mode:** playwright-script
**Duration:** 33.7s
- [FAIL] Add Agent

**Error:**
```
TimeoutError: page.waitForURL: Timeout 30000ms exceeded.
=========================== logs ===========================
waiting for navigation until "load"
============================================================

  28 |   await page.getByPlaceholder('Password').fill(ADMIN.password);
  29 |   await page.getByRole('button', { name: 'Sign In' }).click();
> 30 |   await page.waitForURL((url) => !url.href.includes('/login'), { timeout: 30000 });
     |              ^
  31 | }
  32 |
  33 | // Reach an entity grid directly by URL and wait on the table (collapsed sidebar flyouts don't open
    at login (C:\Users\Mishalia Pillay\Desktop\Test-ReportsHub\projects\dispatch\test-plans\administrative-functions\admin-functions-crud.spec.ts:30:14)
    at C:\Users\Mishalia Pillay\Desktop\Test-ReportsHub\projects\dispatch\test-plans\administrative-functions\admin-functions-crud.spec.ts:139:9
```
**Location:** C:\Users\Mishalia Pillay\Desktop\Test-ReportsHub\projects\dispatch\test-plans\administrative-functions\admin-functions-crud.spec.ts:30:14

### Edit Agent
**Mode:** playwright-script
**Duration:** 47.2s
- [FAIL] Edit Agent

**Error:**
```
TimeoutError: page.waitForURL: Timeout 30000ms exceeded.
=========================== logs ===========================
waiting for navigation until "load"
============================================================

  28 |   await page.getByPlaceholder('Password').fill(ADMIN.password);
  29 |   await page.getByRole('button', { name: 'Sign In' }).click();
> 30 |   await page.waitForURL((url) => !url.href.includes('/login'), { timeout: 30000 });
     |              ^
  31 | }
  32 |
  33 | // Reach an entity grid directly by URL and wait on the table (collapsed sidebar flyouts don't open
    at login (C:\Users\Mishalia Pillay\Desktop\Test-ReportsHub\projects\dispatch\test-plans\administrative-functions\admin-functions-crud.spec.ts:30:14)
    at C:\Users\Mishalia Pillay\Desktop\Test-ReportsHub\projects\dispatch\test-plans\administrative-functions\admin-functions-crud.spec.ts:156:11
```
**Location:** C:\Users\Mishalia Pillay\Desktop\Test-ReportsHub\projects\dispatch\test-plans\administrative-functions\admin-functions-crud.spec.ts:30:14

### Add Resource
**Mode:** playwright-script
**Duration:** 38.8s
- [FAIL] Add Resource

**Error:**
```
TimeoutError: page.waitForURL: Timeout 30000ms exceeded.
=========================== logs ===========================
waiting for navigation until "load"
============================================================

  28 |   await page.getByPlaceholder('Password').fill(ADMIN.password);
  29 |   await page.getByRole('button', { name: 'Sign In' }).click();
> 30 |   await page.waitForURL((url) => !url.href.includes('/login'), { timeout: 30000 });
     |              ^
  31 | }
  32 |
  33 | // Reach an entity grid directly by URL and wait on the table (collapsed sidebar flyouts don't open
    at login (C:\Users\Mishalia Pillay\Desktop\Test-ReportsHub\projects\dispatch\test-plans\administrative-functions\admin-functions-crud.spec.ts:30:14)
    at C:\Users\Mishalia Pillay\Desktop\Test-ReportsHub\projects\dispatch\test-plans\administrative-functions\admin-functions-crud.spec.ts:139:9
```
**Location:** C:\Users\Mishalia Pillay\Desktop\Test-ReportsHub\projects\dispatch\test-plans\administrative-functions\admin-functions-crud.spec.ts:30:14

### Edit Resource
**Mode:** playwright-script
**Duration:** 39.8s
- [FAIL] Edit Resource

**Error:**
```
TimeoutError: page.waitForURL: Timeout 30000ms exceeded.
=========================== logs ===========================
waiting for navigation until "load"
============================================================

  28 |   await page.getByPlaceholder('Password').fill(ADMIN.password);
  29 |   await page.getByRole('button', { name: 'Sign In' }).click();
> 30 |   await page.waitForURL((url) => !url.href.includes('/login'), { timeout: 30000 });
     |              ^
  31 | }
  32 |
  33 | // Reach an entity grid directly by URL and wait on the table (collapsed sidebar flyouts don't open
    at login (C:\Users\Mishalia Pillay\Desktop\Test-ReportsHub\projects\dispatch\test-plans\administrative-functions\admin-functions-crud.spec.ts:30:14)
    at C:\Users\Mishalia Pillay\Desktop\Test-ReportsHub\projects\dispatch\test-plans\administrative-functions\admin-functions-crud.spec.ts:156:11
```
**Location:** C:\Users\Mishalia Pillay\Desktop\Test-ReportsHub\projects\dispatch\test-plans\administrative-functions\admin-functions-crud.spec.ts:30:14

### Add Station
**Mode:** playwright-script
**Duration:** 39.8s
- [FAIL] Add Station

**Error:**
```
TimeoutError: page.waitForURL: Timeout 30000ms exceeded.
=========================== logs ===========================
waiting for navigation until "load"
============================================================

  28 |   await page.getByPlaceholder('Password').fill(ADMIN.password);
  29 |   await page.getByRole('button', { name: 'Sign In' }).click();
> 30 |   await page.waitForURL((url) => !url.href.includes('/login'), { timeout: 30000 });
     |              ^
  31 | }
  32 |
  33 | // Reach an entity grid directly by URL and wait on the table (collapsed sidebar flyouts don't open
    at login (C:\Users\Mishalia Pillay\Desktop\Test-ReportsHub\projects\dispatch\test-plans\administrative-functions\admin-functions-crud.spec.ts:30:14)
    at C:\Users\Mishalia Pillay\Desktop\Test-ReportsHub\projects\dispatch\test-plans\administrative-functions\admin-functions-crud.spec.ts:139:9
```
**Location:** C:\Users\Mishalia Pillay\Desktop\Test-ReportsHub\projects\dispatch\test-plans\administrative-functions\admin-functions-crud.spec.ts:30:14

### Edit Station
**Mode:** playwright-script
**Duration:** 37.1s
- [FAIL] Edit Station

**Error:**
```
TimeoutError: page.waitForURL: Timeout 30000ms exceeded.
=========================== logs ===========================
waiting for navigation until "load"
============================================================

  28 |   await page.getByPlaceholder('Password').fill(ADMIN.password);
  29 |   await page.getByRole('button', { name: 'Sign In' }).click();
> 30 |   await page.waitForURL((url) => !url.href.includes('/login'), { timeout: 30000 });
     |              ^
  31 | }
  32 |
  33 | // Reach an entity grid directly by URL and wait on the table (collapsed sidebar flyouts don't open
    at login (C:\Users\Mishalia Pillay\Desktop\Test-ReportsHub\projects\dispatch\test-plans\administrative-functions\admin-functions-crud.spec.ts:30:14)
    at C:\Users\Mishalia Pillay\Desktop\Test-ReportsHub\projects\dispatch\test-plans\administrative-functions\admin-functions-crud.spec.ts:156:11
```
**Location:** C:\Users\Mishalia Pillay\Desktop\Test-ReportsHub\projects\dispatch\test-plans\administrative-functions\admin-functions-crud.spec.ts:30:14

### Add Crew
**Mode:** playwright-script
**Duration:** 36.9s
- [FAIL] Add Crew

**Error:**
```
TimeoutError: page.waitForURL: Timeout 30000ms exceeded.
=========================== logs ===========================
waiting for navigation until "load"
============================================================

  28 |   await page.getByPlaceholder('Password').fill(ADMIN.password);
  29 |   await page.getByRole('button', { name: 'Sign In' }).click();
> 30 |   await page.waitForURL((url) => !url.href.includes('/login'), { timeout: 30000 });
     |              ^
  31 | }
  32 |
  33 | // Reach an entity grid directly by URL and wait on the table (collapsed sidebar flyouts don't open
    at login (C:\Users\Mishalia Pillay\Desktop\Test-ReportsHub\projects\dispatch\test-plans\administrative-functions\admin-functions-crud.spec.ts:30:14)
    at C:\Users\Mishalia Pillay\Desktop\Test-ReportsHub\projects\dispatch\test-plans\administrative-functions\admin-functions-crud.spec.ts:139:9
```
**Location:** C:\Users\Mishalia Pillay\Desktop\Test-ReportsHub\projects\dispatch\test-plans\administrative-functions\admin-functions-crud.spec.ts:30:14

### Add Shift
**Mode:** playwright-script
**Duration:** 37.2s
- [FAIL] Add Shift

**Error:**
```
TimeoutError: page.waitForURL: Timeout 30000ms exceeded.
=========================== logs ===========================
waiting for navigation until "load"
============================================================

  28 |   await page.getByPlaceholder('Password').fill(ADMIN.password);
  29 |   await page.getByRole('button', { name: 'Sign In' }).click();
> 30 |   await page.waitForURL((url) => !url.href.includes('/login'), { timeout: 30000 });
     |              ^
  31 | }
  32 |
  33 | // Reach an entity grid directly by URL and wait on the table (collapsed sidebar flyouts don't open
    at login (C:\Users\Mishalia Pillay\Desktop\Test-ReportsHub\projects\dispatch\test-plans\administrative-functions\admin-functions-crud.spec.ts:30:14)
    at C:\Users\Mishalia Pillay\Desktop\Test-ReportsHub\projects\dispatch\test-plans\administrative-functions\admin-functions-crud.spec.ts:139:9
```
**Location:** C:\Users\Mishalia Pillay\Desktop\Test-ReportsHub\projects\dispatch\test-plans\administrative-functions\admin-functions-crud.spec.ts:30:14

### Edit Shift
**Mode:** playwright-script
**Duration:** 36.5s
- [FAIL] Edit Shift

**Error:**
```
TimeoutError: page.waitForURL: Timeout 30000ms exceeded.
=========================== logs ===========================
waiting for navigation until "load"
============================================================

  28 |   await page.getByPlaceholder('Password').fill(ADMIN.password);
  29 |   await page.getByRole('button', { name: 'Sign In' }).click();
> 30 |   await page.waitForURL((url) => !url.href.includes('/login'), { timeout: 30000 });
     |              ^
  31 | }
  32 |
  33 | // Reach an entity grid directly by URL and wait on the table (collapsed sidebar flyouts don't open
    at login (C:\Users\Mishalia Pillay\Desktop\Test-ReportsHub\projects\dispatch\test-plans\administrative-functions\admin-functions-crud.spec.ts:30:14)
    at C:\Users\Mishalia Pillay\Desktop\Test-ReportsHub\projects\dispatch\test-plans\administrative-functions\admin-functions-crud.spec.ts:156:11
```
**Location:** C:\Users\Mishalia Pillay\Desktop\Test-ReportsHub\projects\dispatch\test-plans\administrative-functions\admin-functions-crud.spec.ts:30:14

### Add Shift Assignment
**Mode:** playwright-script
**Duration:** 37.0s
- [FAIL] Add Shift Assignment

**Error:**
```
TimeoutError: page.waitForURL: Timeout 30000ms exceeded.
=========================== logs ===========================
waiting for navigation until "load"
============================================================

  28 |   await page.getByPlaceholder('Password').fill(ADMIN.password);
  29 |   await page.getByRole('button', { name: 'Sign In' }).click();
> 30 |   await page.waitForURL((url) => !url.href.includes('/login'), { timeout: 30000 });
     |              ^
  31 | }
  32 |
  33 | // Reach an entity grid directly by URL and wait on the table (collapsed sidebar flyouts don't open
    at login (C:\Users\Mishalia Pillay\Desktop\Test-ReportsHub\projects\dispatch\test-plans\administrative-functions\admin-functions-crud.spec.ts:30:14)
    at C:\Users\Mishalia Pillay\Desktop\Test-ReportsHub\projects\dispatch\test-plans\administrative-functions\admin-functions-crud.spec.ts:139:9
```
**Location:** C:\Users\Mishalia Pillay\Desktop\Test-ReportsHub\projects\dispatch\test-plans\administrative-functions\admin-functions-crud.spec.ts:30:14

### Edit Shift Assignment
**Mode:** playwright-script
**Duration:** 37.0s
- [FAIL] Edit Shift Assignment

**Error:**
```
TimeoutError: page.waitForURL: Timeout 30000ms exceeded.
=========================== logs ===========================
waiting for navigation until "load"
============================================================

  28 |   await page.getByPlaceholder('Password').fill(ADMIN.password);
  29 |   await page.getByRole('button', { name: 'Sign In' }).click();
> 30 |   await page.waitForURL((url) => !url.href.includes('/login'), { timeout: 30000 });
     |              ^
  31 | }
  32 |
  33 | // Reach an entity grid directly by URL and wait on the table (collapsed sidebar flyouts don't open
    at login (C:\Users\Mishalia Pillay\Desktop\Test-ReportsHub\projects\dispatch\test-plans\administrative-functions\admin-functions-crud.spec.ts:30:14)
    at C:\Users\Mishalia Pillay\Desktop\Test-ReportsHub\projects\dispatch\test-plans\administrative-functions\admin-functions-crud.spec.ts:156:11
```
**Location:** C:\Users\Mishalia Pillay\Desktop\Test-ReportsHub\projects\dispatch\test-plans\administrative-functions\admin-functions-crud.spec.ts:30:14

### Add Site Type
**Mode:** playwright-script
**Duration:** 36.7s
- [FAIL] Add Site Type

**Error:**
```
TimeoutError: page.waitForURL: Timeout 30000ms exceeded.
=========================== logs ===========================
waiting for navigation until "load"
============================================================

  28 |   await page.getByPlaceholder('Password').fill(ADMIN.password);
  29 |   await page.getByRole('button', { name: 'Sign In' }).click();
> 30 |   await page.waitForURL((url) => !url.href.includes('/login'), { timeout: 30000 });
     |              ^
  31 | }
  32 |
  33 | // Reach an entity grid directly by URL and wait on the table (collapsed sidebar flyouts don't open
    at login (C:\Users\Mishalia Pillay\Desktop\Test-ReportsHub\projects\dispatch\test-plans\administrative-functions\admin-functions-crud.spec.ts:30:14)
    at C:\Users\Mishalia Pillay\Desktop\Test-ReportsHub\projects\dispatch\test-plans\administrative-functions\admin-functions-crud.spec.ts:139:9
```
**Location:** C:\Users\Mishalia Pillay\Desktop\Test-ReportsHub\projects\dispatch\test-plans\administrative-functions\admin-functions-crud.spec.ts:30:14

### Edit Site Type
**Mode:** playwright-script
**Duration:** 36.7s
- [FAIL] Edit Site Type

**Error:**
```
TimeoutError: page.waitForURL: Timeout 30000ms exceeded.
=========================== logs ===========================
waiting for navigation until "load"
============================================================

  28 |   await page.getByPlaceholder('Password').fill(ADMIN.password);
  29 |   await page.getByRole('button', { name: 'Sign In' }).click();
> 30 |   await page.waitForURL((url) => !url.href.includes('/login'), { timeout: 30000 });
     |              ^
  31 | }
  32 |
  33 | // Reach an entity grid directly by URL and wait on the table (collapsed sidebar flyouts don't open
    at login (C:\Users\Mishalia Pillay\Desktop\Test-ReportsHub\projects\dispatch\test-plans\administrative-functions\admin-functions-crud.spec.ts:30:14)
    at C:\Users\Mishalia Pillay\Desktop\Test-ReportsHub\projects\dispatch\test-plans\administrative-functions\admin-functions-crud.spec.ts:156:11
```
**Location:** C:\Users\Mishalia Pillay\Desktop\Test-ReportsHub\projects\dispatch\test-plans\administrative-functions\admin-functions-crud.spec.ts:30:14

### Add Point of Interest
**Mode:** playwright-script
**Duration:** 36.8s
- [FAIL] Add Point of Interest

**Error:**
```
TimeoutError: page.waitForURL: Timeout 30000ms exceeded.
=========================== logs ===========================
waiting for navigation until "load"
============================================================

  28 |   await page.getByPlaceholder('Password').fill(ADMIN.password);
  29 |   await page.getByRole('button', { name: 'Sign In' }).click();
> 30 |   await page.waitForURL((url) => !url.href.includes('/login'), { timeout: 30000 });
     |              ^
  31 | }
  32 |
  33 | // Reach an entity grid directly by URL and wait on the table (collapsed sidebar flyouts don't open
    at login (C:\Users\Mishalia Pillay\Desktop\Test-ReportsHub\projects\dispatch\test-plans\administrative-functions\admin-functions-crud.spec.ts:30:14)
    at C:\Users\Mishalia Pillay\Desktop\Test-ReportsHub\projects\dispatch\test-plans\administrative-functions\admin-functions-crud.spec.ts:139:9
```
**Location:** C:\Users\Mishalia Pillay\Desktop\Test-ReportsHub\projects\dispatch\test-plans\administrative-functions\admin-functions-crud.spec.ts:30:14

### Edit Point of Interest
**Mode:** playwright-script
**Duration:** 36.6s
- [FAIL] Edit Point of Interest

**Error:**
```
TimeoutError: page.waitForURL: Timeout 30000ms exceeded.
=========================== logs ===========================
waiting for navigation until "load"
============================================================

  28 |   await page.getByPlaceholder('Password').fill(ADMIN.password);
  29 |   await page.getByRole('button', { name: 'Sign In' }).click();
> 30 |   await page.waitForURL((url) => !url.href.includes('/login'), { timeout: 30000 });
     |              ^
  31 | }
  32 |
  33 | // Reach an entity grid directly by URL and wait on the table (collapsed sidebar flyouts don't open
    at login (C:\Users\Mishalia Pillay\Desktop\Test-ReportsHub\projects\dispatch\test-plans\administrative-functions\admin-functions-crud.spec.ts:30:14)
    at C:\Users\Mishalia Pillay\Desktop\Test-ReportsHub\projects\dispatch\test-plans\administrative-functions\admin-functions-crud.spec.ts:156:11
```
**Location:** C:\Users\Mishalia Pillay\Desktop\Test-ReportsHub\projects\dispatch\test-plans\administrative-functions\admin-functions-crud.spec.ts:30:14
