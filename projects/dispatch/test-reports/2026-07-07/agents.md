# Report: Test Plan: ADMIN-2.14 — Agents
**Date:** 2026-07-07 11:29 UTC
**Plan:** test-plans/administrative-functions/agents.md
**Spec:** test-plans/administrative-functions/agents.spec.ts
**Execution Mode:** playwright-script (failures pending AI-repair)
**Result:** PARTIAL
**Duration:** 216.2s

## Summary
| Total Steps | Passed | Failed | Skipped |
|-------------|--------|--------|---------|
| 11 | 10 | 1 | 0 |

## Step Results
### TC-01: Log in to NC Dispatch
**Mode:** playwright-script
**Duration:** 5.3s
- [PASS] TC-01: Log in to NC Dispatch

### TC-02: Search for an agent
**Mode:** playwright-script
**Duration:** 47.0s
- [FAIL] TC-02: Search for an agent

**Error:**
```
Error: [2mexpect([22m[31mlocator[39m[2m).[22mtoBeVisible[2m([22m[2m)[22m failed

Locator: getByRole('cell', { name: /Auto/ }).first()
Expected: visible
Timeout: 15000ms
Error: element(s) not found

Call log:
[2m  - Expect "toBeVisible" with timeout 15000ms[22m
[2m  - waiting for getByRole('cell', { name: /Auto/ }).first()[22m


  76 |     await expect(page.getByRole('table')).toBeVisible();
  77 |     await searchGrid(page, 'Auto');
> 78 |     await expect(page.getByRole('cell', { name: /Auto/ }).first()).toBeVisible({ timeout: 15000 });
     |                                                                    ^
  79 |   });
  80 |
  81 |   // ADO Test Case #65899: https://dev.azure.com/boxfusion/pd-dispatcher-V2/_workitems/edit/65899
    at C:\Users\nomfa\Test-ReportsHub\projects\dispatch\test-plans\administrative-functions\agents.spec.ts:78:68
```
**Location:** C:\Users\nomfa\Test-ReportsHub\projects\dispatch\test-plans\administrative-functions\agents.spec.ts:78:68

### TC-03: Open Add Agent dialog
**Mode:** playwright-script
**Duration:** 20.4s
- [PASS] TC-03: Open Add Agent dialog

### TC-04: Export agents
**Mode:** playwright-script
**Duration:** 30.4s
- [PASS] TC-04: Export agents

### TC-05: View agent details
**Mode:** playwright-script
**Duration:** 18.2s
- [PASS] TC-05: View agent details

### TC-06: Edit agent from details view
**Mode:** playwright-script
**Duration:** 16.0s
- [PASS] TC-06: Edit agent from details view

### TC-07: Cancel edit in details view
**Mode:** playwright-script
**Duration:** 17.6s
- [PASS] TC-07: Cancel edit in details view

### TC-08: Save edit in details view
**Mode:** playwright-script
**Duration:** 14.0s
- [PASS] TC-08: Save edit in details view

### TC-09: Edit agent from index
**Mode:** playwright-script
**Duration:** 13.4s
- [PASS] TC-09: Edit agent from index

### TC-10: Save edit from index edit view
**Mode:** playwright-script
**Duration:** 16.1s
- [PASS] TC-10: Save edit from index edit view

### TC-11: Cancel edit from index edit view
**Mode:** playwright-script
**Duration:** 13.9s
- [PASS] TC-11: Cancel edit from index edit view
