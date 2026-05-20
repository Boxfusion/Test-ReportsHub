# Report: Test Plan: Create Service Request (v2)
**Date:** 2026-05-19 05:31 UTC
**Plan:** test-plans/service-requests/create-service-request-v2.md
**Spec:** test-plans/service-requests/create-service-request-v2.spec.ts
**Execution Mode:** playwright-script (failures pending AI-repair)
**Result:** FAILED
**Duration:** 58.2s

## Summary
| Total Steps | Passed | Failed | Skipped |
|-------------|--------|--------|---------|
| 3 | 0 | 3 | 0 |

## Step Results
### TC-01: Login as Admin
**Mode:** playwright-script
**Duration:** 20.3s
- [FAIL] TC-01: Login as Admin

**Error:**
```
TimeoutError: locator.fill: Timeout 15000ms exceeded.
Call log:
[2m  - waiting for getByLabel(/username|email/i)[22m


  29 |     // STEP 3: TYPE username field with `admin`
  30 |     // TODO[selector]: username field
> 31 |     await page.getByLabel(/username|email/i).fill(ADMIN.user);
     |                                              ^
  32 |
  33 |     // STEP 4: TYPE password field with `123qwe`
  34 |     // TODO[selector]: password field
    at C:\Projects\Dep\test-plans\service-requests\create-service-request-v2.spec.ts:31:46
```
**Location:** C:\Projects\Dep\test-plans\service-requests\create-service-request-v2.spec.ts:31:46

### TC-02: Navigate to Service Requests
**Mode:** playwright-script
**Duration:** 17.2s
- [FAIL] TC-02: Navigate to Service Requests

**Error:**
```
TimeoutError: locator.fill: Timeout 15000ms exceeded.
Call log:
[2m  - waiting for getByLabel(/username|email/i)[22m


  11 |   await page.goto(APP_URL);
  12 |   // TODO[selector]: username field
> 13 |   await page.getByLabel(/username|email/i).fill(ADMIN.user);
     |                                            ^
  14 |   // TODO[selector]: password field
  15 |   await page.getByLabel(/password/i).fill(ADMIN.password);
  16 |   // TODO[selector]: sign-in button
    at loginAsAdmin (C:\Projects\Dep\test-plans\service-requests\create-service-request-v2.spec.ts:13:44)
    at C:\Projects\Dep\test-plans\service-requests\create-service-request-v2.spec.ts:50:5
```
**Location:** C:\Projects\Dep\test-plans\service-requests\create-service-request-v2.spec.ts:13:44

### TC-03: Create a Service Request
**Mode:** playwright-script
**Duration:** 17.1s
- [FAIL] TC-03: Create a Service Request

**Error:**
```
TimeoutError: locator.fill: Timeout 15000ms exceeded.
Call log:
[2m  - waiting for getByLabel(/username|email/i)[22m


  11 |   await page.goto(APP_URL);
  12 |   // TODO[selector]: username field
> 13 |   await page.getByLabel(/username|email/i).fill(ADMIN.user);
     |                                            ^
  14 |   // TODO[selector]: password field
  15 |   await page.getByLabel(/password/i).fill(ADMIN.password);
  16 |   // TODO[selector]: sign-in button
    at loginAsAdmin (C:\Projects\Dep\test-plans\service-requests\create-service-request-v2.spec.ts:13:44)
    at C:\Projects\Dep\test-plans\service-requests\create-service-request-v2.spec.ts:71:5
```
**Location:** C:\Projects\Dep\test-plans\service-requests\create-service-request-v2.spec.ts:13:44
