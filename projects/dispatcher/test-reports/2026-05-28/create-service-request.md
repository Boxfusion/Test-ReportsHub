# Report: Test Plan: Create Service Request
**Date:** 2026-05-28 11:54 UTC
**Plan:** test-plans/service-requests/create-service-request.md
**Spec:** test-plans/service-requests/create-service-request.spec.ts
**Execution Mode:** playwright-script (failures pending AI-repair)
**Result:** PARTIAL
**Duration:** 90.6s

## Summary
| Total Steps | Passed | Failed | Skipped |
|-------------|--------|--------|---------|
| 3 | 2 | 1 | 0 |

## Step Results
### TC-01: Login as Admin
**Mode:** playwright-script
**Duration:** 11.0s
- [PASS] TC-01: Login as Admin

### TC-02: Navigate to Service Requests
**Mode:** playwright-script
**Duration:** 6.5s
- [PASS] TC-02: Navigate to Service Requests

### TC-03: Create a Service Request
**Mode:** playwright-script
**Duration:** 24.7s
- [FAIL] TC-03: Create a Service Request

**Error:**
```
TimeoutError: locator.click: Timeout 15000ms exceeded.
Call log:
[2m  - waiting for getByRole('dialog').first().locator('.ant-form-item').filter({ hasText: 'Channel' }).first().locator('.ant-select')[22m


  90 |     // Channel — Call Centre (Ant Design select)
  91 |     // TODO[selector]: confirm Channel field exists on Dispatcher portal
> 92 |     await dialog.locator('.ant-form-item').filter({ hasText: 'Channel' }).first().locator('.ant-select').click();
     |                                                                                                          ^
  93 |     await page.locator('.ant-select-item-option').filter({ hasText: 'Call Centre' }).first().click();
  94 |
  95 |     // Mobile Number
    at C:\Users\Mishalia Pillay\Desktop\Test-ReportsHub\projects\dispatcher\test-plans\service-requests\create-service-request.spec.ts:92:106
```
**Location:** C:\Users\Mishalia Pillay\Desktop\Test-ReportsHub\projects\dispatcher\test-plans\service-requests\create-service-request.spec.ts:92:106
