# Report: Test Plan: ADMINPORTAL-103649 — Verify Close button
**Date:** 2026-08-04 21:41 UTC
**Plan:** test-plans/AdminPortal/verify-close-button-authoriser.md
**Spec:** test-plans/AdminPortal/verify-close-button-authoriser.spec.ts
**Execution Mode:** playwright-script (failures pending AI-repair)
**Result:** PARTIAL
**Duration:** 248.9s

## Summary
| Total Steps | Passed | Failed | Skipped |
|-------------|--------|--------|---------|
| 5 | 4 | 1 | 0 |

## Step Results
### TC-01: Login as Mphoh
**Mode:** playwright-script
**Duration:** 6.5s
- [PASS] TC-01: Login as Mphoh

### TC-02: Expand the Workflows menu
**Mode:** playwright-script
**Duration:** 6.4s
- [PASS] TC-02: Expand the Workflows menu

### TC-03: Navigate to Inbox submenu
**Mode:** playwright-script
**Duration:** 9.6s
- [PASS] TC-03: Navigate to Inbox submenu

### TC-04: Open any Job with Authorize Job as action required
**Mode:** playwright-script
**Duration:** 10.9s
- [PASS] TC-04: Open any Job with Authorize Job as action required

### TC-05: Click on Close button
**Mode:** playwright-script
**Duration:** 213.0s
- [FAIL] TC-05: Click on Close button

**Error:**
```
Error: [2mexpect([22m[31mlocator[39m[2m).[22mtoBeVisible[2m([22m[2m)[22m failed

Locator: getByText('Incoming Items', { exact: true })
Expected: visible
Timeout: 15000ms
Error: element(s) not found

Call log:
[2m  - Expect "toBeVisible" with timeout 15000ms[22m
[2m  - waiting for getByText('Incoming Items', { exact: true })[22m


  133 |     // even though the navigation had actually succeeded. "Incoming Items" is
  134 |     // the Inbox page's own heading and does not appear on the details view.
> 135 |     await expect(page.getByText('Incoming Items', { exact: true })).toBeVisible({ timeout: 15_000 });
      |                                                                     ^
  136 |     await expect(page.getByRole('button', { name: 'Authorise', exact: true })).toHaveCount(0);
  137 |   });
  138 | });
    at C:\Users\Reuben\IdeaProjects\eRecruitment Public Portal Claude Automation\Test-ReportsHub\projects\eRecruitment\test-plans\AdminPortal\verify-close-button-authoriser.spec.ts:135:69
```
**Location:** C:\Users\Reuben\IdeaProjects\eRecruitment Public Portal Claude Automation\Test-ReportsHub\projects\eRecruitment\test-plans\AdminPortal\verify-close-button-authoriser.spec.ts:135:69
