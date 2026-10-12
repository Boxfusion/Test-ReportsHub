# Report: Test Plan: ELEAVE-CLOSE — Close Leave Application
**Date:** 2026-10-08 13:48 UTC
**Plan:** test-plans/HCM/eLeave/close-leave-application.md
**Spec:** test-plans/HCM/eLeave/close-leave-application.spec.ts
**Execution Mode:** playwright-script (failures pending AI-repair)
**Result:** PARTIAL
**Duration:** 134.3s

## Summary
| Total Steps | Passed | Failed | Skipped |
|-------------|--------|--------|---------|
| 5 | 3 | 2 | 0 |

## Step Results
### TC-01: Login as Leave Applicant (GOV003)
**Mode:** playwright-script
**Duration:** 12.3s
- [PASS] TC-01: Login as Leave Applicant (GOV003)

### TC-02: System should close the leave application when 'Ok' button is clicked
**Mode:** playwright-script
**Duration:** 28.4s
- [FAIL] TC-02: System should close the leave application when 'Ok' button is clicked

**Error:**
```
Error: [2mexpect([22m[31mlocator[39m[2m).[22mtoBeHidden[2m([22m[2m)[22m failed

Locator:  getByRole('dialog', { name: 'Close Leave Application' })
Expected: hidden
Received: visible
Timeout:  15000ms

Call log:
[2m  - Expect "toBeHidden" getByRole('dialog', { name: 'Close Leave Application' }) with timeout 15000ms[22m
[2m  - waiting for getByRole('dialog', { name: 'Close Leave Application' })[22m
[2m    33 × locator resolved to <div role="dialog" aria-modal="true" aria-labelledby=":r4m:" class="ant-modal css-1lo1l9k">…</div>[22m
[2m       - unexpected value "visible"[22m


  89 |
  90 |     // ASSERT (BLOCKING): The leave application is closed — the 'Close Leave Application' dialog disappears and the user leaves the draft page
> 91 |     await expect(closeDialog(page)).toBeHidden({ timeout: 15000 });
     |                                     ^
  92 |     await expect(page).not.toHaveURL(/sagov-leave-application-draft/, { timeout: NAV_TIMEOUT });
  93 |   });
  94 |
    at C:\Users\tiyim\OneDrive\Desktop\HCM\pd-Hcm\test-plans\HCM\eLeave\close-leave-application.spec.ts:91:37
```
**Location:** C:\Users\tiyim\OneDrive\Desktop\HCM\pd-Hcm\test-plans\HCM\eLeave\close-leave-application.spec.ts:91:37

### TC-03: System should redirect the user to the Home page when 'Ok' button is clicked
**Mode:** playwright-script
**Duration:** 44.1s
- [FAIL] TC-03: System should redirect the user to the Home page when 'Ok' button is clicked

**Error:**
```
Error: [2mexpect([22m[31mpage[39m[2m).not.[22mtoHaveURL[2m([22m[32mexpected[39m[2m)[22m failed

Expected pattern: not [32m/sagov-leave-application-draft/[39m
Received string: [31m"https://pd-hcm-adminportal-qa.shesha.app/dynamic/SaGov.Leave/[7msagov-leave-application-draft[27m?mode=edit"[39m
Timeout: 30000ms

Call log:
[2m  - Expect "not toHaveURL" with timeout 30000ms[22m
[2m    61 × locator resolved to <html lang="en" class="nprogress-busy">…</html>[22m
[2m       - unexpected value "https://pd-hcm-adminportal-qa.shesha.app/dynamic/SaGov.Leave/sagov-leave-application-draft?mode=edit"[22m


  103 |
  104 |     // ASSERT (BLOCKING): The user is redirected to the Home page (URL no longer contains `sagov-leave-application-draft`)
> 105 |     await expect(page).not.toHaveURL(/sagov-leave-application-draft/, { timeout: NAV_TIMEOUT });
      |                            ^
  106 |     await expect(closeDialog(page)).toBeHidden();
  107 |   });
  108 |
    at C:\Users\tiyim\OneDrive\Desktop\HCM\pd-Hcm\test-plans\HCM\eLeave\close-leave-application.spec.ts:105:28
```
**Location:** C:\Users\tiyim\OneDrive\Desktop\HCM\pd-Hcm\test-plans\HCM\eLeave\close-leave-application.spec.ts:105:28

### TC-04: Clicking the 'Cancel' button should close the dialog
**Mode:** playwright-script
**Duration:** 13.3s
- [PASS] TC-04: Clicking the 'Cancel' button should close the dialog

### TC-05: Clicking the 'Cancel' button should display the 'New Leave Application' page
**Mode:** playwright-script
**Duration:** 14.6s
- [PASS] TC-05: Clicking the 'Cancel' button should display the 'New Leave Application' page
