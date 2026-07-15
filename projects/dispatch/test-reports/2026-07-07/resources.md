# Report: Test Plan: ADMIN-2.12 — Resources
**Date:** 2026-07-07 11:41 UTC
**Plan:** test-plans/administrative-functions/resources.md
**Spec:** test-plans/administrative-functions/resources.spec.ts
**Execution Mode:** playwright-script (failures pending AI-repair)
**Result:** PARTIAL
**Duration:** 181.7s

## Summary
| Total Steps | Passed | Failed | Skipped |
|-------------|--------|--------|---------|
| 13 | 12 | 1 | 0 |

## Step Results
### TC-01: Log in to NC Dispatch
**Mode:** playwright-script
**Duration:** 5.4s
- [PASS] TC-01: Log in to NC Dispatch

### TC-02: Search for a resource
**Mode:** playwright-script
**Duration:** 11.8s
- [PASS] TC-02: Search for a resource

### TC-03: Open Add Resource dialog
**Mode:** playwright-script
**Duration:** 8.4s
- [PASS] TC-03: Open Add Resource dialog

### TC-04: Export resources
**Mode:** playwright-script
**Duration:** 11.2s
- [PASS] TC-04: Export resources

### TC-05: View resource details
**Mode:** playwright-script
**Duration:** 9.5s
- [PASS] TC-05: View resource details

### TC-06: Navigate back from details
**Mode:** playwright-script
**Duration:** 16.8s
- [PASS] TC-06: Navigate back from details

### TC-07: Edit resource from details view
**Mode:** playwright-script
**Duration:** 12.8s
- [PASS] TC-07: Edit resource from details view

### TC-08: Cancel edit in details view
**Mode:** playwright-script
**Duration:** 17.6s
- [PASS] TC-08: Cancel edit in details view

### TC-09: Save edit in details view
**Mode:** playwright-script
**Duration:** 14.2s
- [PASS] TC-09: Save edit in details view

### TC-10: Upload facial photo
**Mode:** playwright-script
**Duration:** 25.6s
- [FAIL] TC-10: Upload facial photo

**Error:**
```
TimeoutError: page.waitForEvent: Timeout 15000ms exceeded while waiting for event "filechooser"
=========================== logs ===========================
waiting for event "filechooser"
============================================================

  172 |     // STEP: CLICK Upload in the User Facial Photos panel → pick an image (file chooser)
  173 |     const [chooser] = await Promise.all([
> 174 |       page.waitForEvent('filechooser'),
      |            ^
  175 |       detailView(page).getByRole('button', { name: 'Upload' }).click(),
  176 |     ]);
  177 |     await chooser.setFiles(FACE_IMG);
    at C:\Users\nomfa\Test-ReportsHub\projects\dispatch\test-plans\administrative-functions\resources.spec.ts:174:12
```
**Location:** C:\Users\nomfa\Test-ReportsHub\projects\dispatch\test-plans\administrative-functions\resources.spec.ts:174:12

### TC-11: Edit resource from index
**Mode:** playwright-script
**Duration:** 11.3s
- [PASS] TC-11: Edit resource from index

### TC-12: Save edit from index edit view
**Mode:** playwright-script
**Duration:** 16.7s
- [PASS] TC-12: Save edit from index edit view

### TC-13: Cancel edit from index edit view
**Mode:** playwright-script
**Duration:** 14.6s
- [PASS] TC-13: Cancel edit from index edit view
