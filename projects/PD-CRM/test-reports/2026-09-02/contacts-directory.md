# Report: Test Plan: Contacts Directory
**Date:** 2026-09-02 14:23 UTC
**Plan:** test-plans/case-management/contacts-directory.md
**Spec:** test-plans/case-management/contacts-directory.spec.ts
**Execution Mode:** playwright-script (failures pending AI-repair)
**Result:** PARTIAL
**Duration:** 369.3s

## Summary
| Total Steps | Passed | Failed | Skipped |
|-------------|--------|--------|---------|
| 14 | 9 | 1 | 4 |

## Step Results
### TC-01 (#113275): Verify Contact Can Be Created
**Mode:** playwright-script
**Duration:** 32.7s
- [PASS] TC-01 (#113275): Verify Contact Can Be Created

### TC-02 (#113276): Verify Contacts Are Displayed in the Contacts Directory
**Mode:** playwright-script
**Duration:** 22.1s
- [PASS] TC-02 (#113276): Verify Contacts Are Displayed in the Contacts Directory

### TC-03 (#113277): Verify Contact Can Be Searched
**Mode:** playwright-script
**Duration:** 21.9s
- [PASS] TC-03 (#113277): Verify Contact Can Be Searched

### TC-04 (#113278): Verify Contacts Can Be Filtered
**Mode:** playwright-script
**Duration:** 40.6s
- [PASS] TC-04 (#113278): Verify Contacts Can Be Filtered

### TC-05 (#113279): Verify Contact Details Can Be Viewed
**Mode:** playwright-script
**Duration:** 21.7s
- [PASS] TC-05 (#113279): Verify Contact Details Can Be Viewed

### TC-06 (#113280): Verify Contact Details Can Be Edited
**Mode:** playwright-script
**Duration:** 83.6s
- [FAIL] TC-06 (#113280): Verify Contact Details Can Be Edited

**Error:**
```
Error: the directory should show the updated value — see BUG-303

[2mexpect([22m[31mlocator[39m[2m).[22mtoContainText[2m([22m[32mexpected[39m[2m)[22m failed

Locator: locator('div.tr.tr-body').filter({ hasText: 'QAContact799056' }).first()
Expected substring: [32m"AfterEditA820987"[39m
Received string:    [31m"QAContact799056 Directory99Before Edit AQA contact QAContact799056"[39m
Timeout: 30000ms

Call log:
[2m  - the directory should show the updated value — see BUG-303 with timeout 30000ms[22m
[2m  - waiting for locator('div.tr.tr-body').filter({ hasText: 'QAContact799056' }).first()[22m
[2m    62 × locator resolved to <div role="row" class="tr tr-body tr-odd">…</div>[22m
[2m       - unexpected value "QAContact799056 Directory99Before Edit AQA contact QAContact799056"[22m


  368 |     row = await findContactRow(page, nameA);
  369 |     await expect(row, 'the directory should show the updated value — see BUG-303')
> 370 |       .toContainText(updatedA, { timeout: 30_000 });
      |        ^
  371 |
  372 |     // STEP 7: it is retained on the details screen
  373 |     await rowIcon(row, 'search').click();
    at C:\Users\NomfaneloNhleko\OneDrive\Test-ReportsHub\projects\PD-CRM\test-plans\case-management\contacts-directory.spec.ts:370:8
```
**Location:** C:\Users\NomfaneloNhleko\OneDrive\Test-ReportsHub\projects\PD-CRM\test-plans\case-management\contacts-directory.spec.ts:370:8

### TC-07 (#113281): Verify Contact Can Be Deleted
**Mode:** playwright-script
**Duration:** 53.6s
- [PASS] TC-07 (#113281): Verify Contact Can Be Deleted

### TC-08 (#113282): Verify Contact Deletion Can Be Cancelled
**Mode:** playwright-script
**Duration:** 49.6s
- [PASS] TC-08 (#113282): Verify Contact Deletion Can Be Cancelled

### TC-09 (#113283): Verify Contacts Can Be Exported
**Mode:** playwright-script
**Duration:** 16.5s
- [PASS] TC-09 (#113283): Verify Contacts Can Be Exported

### TC-10 (#113284): Verify Mandatory Contact Fields Are Validated
**Mode:** playwright-script
**Duration:** 23.7s
- [PASS] TC-10 (#113284): Verify Mandatory Contact Fields Are Validated

### TC-11 (#113285): Verify Phone Number and Office Number Accept Exactly 10 Digits
**Mode:** playwright-script
**Duration:** 0.0s
- [SKIP] TC-11 (#113285): Verify Phone Number and Office Number Accept Exactly 10 Digits

### TC-12 (#113286): Verify Phone Number and Office Number Reject Invalid Digit Length
**Mode:** playwright-script
**Duration:** 0.0s
- [SKIP] TC-12 (#113286): Verify Phone Number and Office Number Reject Invalid Digit Length

### TC-13 (#113287): Verify Email Address Format Validation
**Mode:** playwright-script
**Duration:** 0.0s
- [SKIP] TC-13 (#113287): Verify Email Address Format Validation

### TC-14 (#113288): Verify Invalid Email Address Format Is Rejected
**Mode:** playwright-script
**Duration:** 0.0s
- [SKIP] TC-14 (#113288): Verify Invalid Email Address Format Is Rejected
