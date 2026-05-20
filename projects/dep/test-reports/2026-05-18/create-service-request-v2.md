# Report: Test Plan: Create Service Request (v2)
**Date:** 2026-05-18 17:18 UTC
**Plan:** test-plans/service-requests/create-service-request-v2.md
**Spec:** test-plans/service-requests/create-service-request-v2.spec.ts
**Execution Mode:** playwright-script (failures pending AI-repair)
**Result:** FAILED
**Duration:** 133.1s

## Summary
| Total Steps | Passed | Failed | Skipped |
|-------------|--------|--------|---------|
| 3 | 0 | 3 | 0 |

## Step Results
### TC-01: Login as Admin
**Mode:** playwright-script
**Duration:** 44.0s
- [FAIL] TC-01: Login as Admin

**Error:**
```
TimeoutError: page.goto: Timeout 30000ms exceeded.
Call log:
[2m  - navigating to "https://linux-dep-adminportal-test.azurewebsites.net/", waiting until "load"[22m


  22 |   test('TC-01: Login as Admin', async ({ page }) => {
  23 |     // STEP 1: NAVIGATE to https://linux-dep-adminportal-test.azurewebsites.net/
> 24 |     await page.goto(APP_URL);
     |                ^
  25 |
  26 |     // STEP 2: SNAPSHOT — confirm login form is visible
  27 |     // SNAPSHOT: login form is visible
    at C:\Projects\Dep\test-plans\service-requests\create-service-request-v2.spec.ts:24:16
```
**Location:** C:\Projects\Dep\test-plans\service-requests\create-service-request-v2.spec.ts:24:16

### TC-02: Navigate to Service Requests
**Mode:** playwright-script
**Duration:** 42.7s
- [FAIL] TC-02: Navigate to Service Requests

**Error:**
```
TimeoutError: page.goto: Timeout 30000ms exceeded.
Call log:
[2m  - navigating to "https://linux-dep-adminportal-test.azurewebsites.net/", waiting until "load"[22m


   9 |
  10 | async function loginAsAdmin(page: Page) {
> 11 |   await page.goto(APP_URL);
     |              ^
  12 |   // TODO[selector]: username field
  13 |   await page.getByLabel(/username|email/i).fill(ADMIN.user);
  14 |   // TODO[selector]: password field
    at loginAsAdmin (C:\Projects\Dep\test-plans\service-requests\create-service-request-v2.spec.ts:11:14)
    at C:\Projects\Dep\test-plans\service-requests\create-service-request-v2.spec.ts:50:11
```
**Location:** C:\Projects\Dep\test-plans\service-requests\create-service-request-v2.spec.ts:11:14

### TC-03: Create a Service Request
**Mode:** playwright-script
**Duration:** 42.9s
- [FAIL] TC-03: Create a Service Request

**Error:**
```
TimeoutError: page.goto: Timeout 30000ms exceeded.
Call log:
[2m  - navigating to "https://linux-dep-adminportal-test.azurewebsites.net/", waiting until "load"[22m


   9 |
  10 | async function loginAsAdmin(page: Page) {
> 11 |   await page.goto(APP_URL);
     |              ^
  12 |   // TODO[selector]: username field
  13 |   await page.getByLabel(/username|email/i).fill(ADMIN.user);
  14 |   // TODO[selector]: password field
    at loginAsAdmin (C:\Projects\Dep\test-plans\service-requests\create-service-request-v2.spec.ts:11:14)
    at C:\Projects\Dep\test-plans\service-requests\create-service-request-v2.spec.ts:71:11
```
**Location:** C:\Projects\Dep\test-plans\service-requests\create-service-request-v2.spec.ts:11:14
