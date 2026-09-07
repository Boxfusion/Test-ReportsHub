# Report: Test Plan: WF-4.1 — Loan Application Workflow Stages (Inbox → Consent → Verification → Onboarding → Complete) — am
**Date:** 2026-08-24 06:43 UTC
**Variant:** am
**Plan:** test-plans/workflow/loan-application-workflow-stages.md
**Spec:** test-plans/workflow/loan-application-workflow-stages.spec.ts
**Execution Mode:** playwright-script (failures pending AI-repair)
**Result:** FAILED
**Duration:** 250.1s

## Summary
| Total Steps | Passed | Failed | Skipped |
|-------------|--------|--------|---------|
| 12 | 2 | 10 | 0 |

## Step Results
### TC-01: Log in as an RM and open the Inbox
**Mode:** playwright-script
**Duration:** 7.6s
- [PASS] TC-01: Log in as an RM and open the Inbox

### TC-02: A newly initiated application appears at the top of the Inbox with the correct Action Required
**Mode:** playwright-script
**Duration:** 9.7s
- [PASS] TC-02: A newly initiated application appears at the top of the Inbox with the correct Action Required

### TC-03: Application status corresponds to the outstanding workflow action
**Mode:** playwright-script
**Duration:** 9.9s
- [FAIL] TC-03: Application status corresponds to the outstanding workflow action

**Error:**
```
Error: outstanding action "Complete Onboarding Checklist" implies one of [Pre-Onboarding], but the grid shows only [Draft]

[2mexpect([22m[31mreceived[39m[2m).[22mtoBe[2m([22m[32mexpected[39m[2m) // Object.is equality[22m

Expected: [32mtrue[39m
Received: [31mfalse[39m

  649 |             `but the grid shows only [${[...presentStatuses].join(', ')}]`
  650 |         )
> 651 |         .toBe(true);
      |          ^
  652 |     }
  653 |
  654 |     // ASSERT: an application with no outstanding Inbox action is terminal or pre-initiation
    at /Users/Sanele/Downloads/Autotesting/Test-ReportsHub/projects/land-bank/test-plans/workflow/loan-application-workflow-stages.spec.ts:651:10
```
**Location:** /Users/Sanele/Downloads/Autotesting/Test-ReportsHub/projects/land-bank/test-plans/workflow/loan-application-workflow-stages.spec.ts:651:10

### TC-04: Upload Entity Consent via the manual upload route
**Mode:** playwright-script
**Duration:** 12.0s
- [FAIL] TC-04: Upload Entity Consent via the manual upload route

**Error:**
```
Error: [2mexpect([22m[31mlocator[39m[2m).not.[22mtoHaveClass[2m([22m[32mexpected[39m[2m)[22m failed

Locator: locator('.ant-form-item:has(> .ant-row > .ant-col.ant-form-item-label > label[for="blankApproval"])')
Expected pattern: not [32m/ant-form-item-hidden/[39m
Error: strict mode violation: locator('.ant-form-item:has(> .ant-row > .ant-col.ant-form-item-label > label[for="blankApproval"])') resolved to 8 elements:
    1) <div class="ant-form-item css-var-r0 ant-form-css-var css-1lo1l9k">…</div> aka locator('div').filter({ hasText: /^Download Entity Consent Document$/ }).first()
    2) <div class="ant-form-item css-var-r0 ant-form-css-var css-1lo1l9k">…</div> aka locator('div:nth-child(4) > div > div > div > .ant-collapse > .ant-collapse-item > .ant-collapse-content > .ant-collapse-content-box > div > div > .ant-form-item.sha-datalist-component > div > div > div > div > .sha-form-container > div:nth-child(2) > .ant-spin-nested-loading > .ant-spin-container > .sha-datalist-component-body > div > div > .sha-datalist-component-item > div > div > .sha-datalist-cell > div > div > div > div > .sha-components-container.vertical > div > div:nth-child(3)').first()
    3) <div class="ant-form-item css-var-r0 ant-form-css-var css-1lo1l9k">…</div> aka locator('div:nth-child(2) > .sha-datalist-component-item > div > div > .sha-datalist-cell > div > div > div > div > .sha-components-container.vertical > div > div:nth-child(3)').first()
    4) <div class="ant-form-item css-v
```
**Location:** /Users/Sanele/Downloads/Autotesting/Test-ReportsHub/projects/land-bank/test-plans/workflow/loan-application-workflow-stages.spec.ts:254:40

### TC-05: Consent satisfied entirely electronically advances without a Submit
**Mode:** playwright-script
**Duration:** 0.1s
- [FAIL] TC-05: Consent satisfied entirely electronically advances without a Submit

### TC-06: Upload Individual Consent via the manual upload route (PERSONAL application)
**Mode:** playwright-script
**Duration:** 7.5s
- [FAIL] TC-06: Upload Individual Consent via the manual upload route (PERSONAL application)

**Error:**
```
Error: no Inbox row with Action Required "Upload Individual Consent"

[2mexpect([22m[31mreceived[39m[2m).[22mtoBeTruthy[2m()[22m

Received: [31mundefined[39m

  486 |   const rows = await readGrid(page);
  487 |   const row = rows.find((r) => r[INBOX.action] === stage);
> 488 |   expect(row, `no Inbox row with Action Required "${stage}"`).toBeTruthy();
      |                                                               ^
  489 |
  490 |   const refNo = row![INBOX.refNo];
  491 |   expect(refNo).toMatch(REF_NO_PATTERN);
    at openStage (/Users/Sanele/Downloads/Autotesting/Test-ReportsHub/projects/land-bank/test-plans/workflow/loan-application-workflow-stages.spec.ts:488:63)
    at /Users/Sanele/Downloads/Autotesting/Test-ReportsHub/projects/land-bank/test-plans/workflow/loan-application-workflow-stages.spec.ts:794:19
```
**Location:** /Users/Sanele/Downloads/Autotesting/Test-ReportsHub/projects/land-bank/test-plans/workflow/loan-application-workflow-stages.spec.ts:488:63

### TC-07: Upload Resolution (entity applications without an upfront resolution)
**Mode:** playwright-script
**Duration:** 69.7s
- [FAIL] TC-07: Upload Resolution (entity applications without an upfront resolution)

**Error:**
```
Error: [2mexpect([22m[31mlocator[39m[2m).not.[22mtoHaveClass[2m([22m[32mexpected[39m[2m)[22m failed

Locator: locator('.ant-form-item:has(> .ant-row > .ant-col.ant-form-item-label > label[for="manualApproval"])')
Expected pattern: not [32m/ant-form-item-hidden/[39m
Timeout: 60000ms
Error: element(s) not found

Call log:
[2m  - Expect "not toHaveClass" with timeout 60000ms[22m
[2m  - waiting for locator('.ant-form-item:has(> .ant-row > .ant-col.ant-form-item-label > label[for="manualApproval"])')[22m


  252 |
  253 | async function expectFieldShown(scope: Page | Locator, name: string) {
> 254 |   await expect(field(scope, name)).not.toHaveClass(/ant-form-item-hidden/, { timeout: LONG });
      |                                        ^
  255 | }
  256 | async function expectFieldHidden(scope: Page | Locator, name: string) {
  257 |   await expect(field(scope, name)).toHaveClass(/ant-form-item-hidden/, { timeout: LONG });
    at expectFieldShown (/Users/Sanele/Downloads/Autotesting/Test-ReportsHub/projects/land-bank/test-plans/workflow/loan-application-workflow-stages.spec.ts:254:40)
    at /Users/Sanele/Downloads/Autotesting/Test-ReportsHub/projects/land-bank/test-plans/workflow/loan-application-workflow-stages.spec.ts:888:11
```
**Location:** /Users/Sanele/Downloads/Autotesting/Test-ReportsHub/projects/land-bank/test-plans/workflow/loan-application-workflow-stages.spec.ts:254:40

### TC-08: Confirm verification outcomes lists every captured party and reviews the entity
**Mode:** playwright-script
**Duration:** 70.7s
- [FAIL] TC-08: Confirm verification outcomes lists every captured party and reviews the entity

**Error:**
```
Error: [2mexpect([22m[31mlocator[39m[2m).[22mtoBeVisible[2m([22m[2m)[22m failed

Locator: getByText('Signatories')
Expected: visible
Timeout: 60000ms
Error: element(s) not found

Call log:
[2m  - Expect "toBeVisible" with timeout 60000ms[22m
[2m  - waiting for getByText('Signatories')[22m


  912 |
  913 |     // STEP 5: EXTRACT the party names listed in the Signatories, Directors and Shareholders datalists
> 914 |     await expect(page.getByText('Signatories')).toBeVisible({ timeout: LONG });
      |                                                 ^
  915 |     await expect(page.getByText('Directors')).toBeVisible();
  916 |     const verificationPageText = (await page.locator('body').textContent()) ?? '';
  917 |
    at /Users/Sanele/Downloads/Autotesting/Test-ReportsHub/projects/land-bank/test-plans/workflow/loan-application-workflow-stages.spec.ts:914:49
```
**Location:** /Users/Sanele/Downloads/Autotesting/Test-ReportsHub/projects/land-bank/test-plans/workflow/loan-application-workflow-stages.spec.ts:914:49

### TC-09: Per-person ID Verification is decided in the verification dialog
**Mode:** playwright-script
**Duration:** 26.5s
- [FAIL] TC-09: Per-person ID Verification is decided in the verification dialog

**Error:**
```
Error: [2mexpect([22m[31mlocator[39m[2m).[22mtoContainText[2m([22m[32mexpected[39m[2m)[22m failed

Locator: locator('.ant-modal-content').locator('.ant-form-item:has(> .ant-row > .ant-col.ant-form-item-label > label[for="idVerification_nameMatchStatus"])')
Expected substring: [32m"FAILED"[39m
Received string:    [31m"Name Match Failed"[39m
Timeout: 10000ms

Call log:
[2m  - Expect "toContainText" with timeout 10000ms[22m
[2m  - waiting for locator('.ant-modal-content').locator('.ant-form-item:has(> .ant-row > .ant-col.ant-form-item-label > label[for="idVerification_nameMatchStatus"])')[22m
[2m    3 × locator resolved to <div class="ant-form-item css-var-r0 ant-form-css-var css-1lo1l9k">…</div>[22m
[2m      - unexpected value "Name Match "[22m
[2m    20 × locator resolved to <div class="ant-form-item css-var-r0 ant-form-css-var css-1lo1l9k">…</div>[22m
[2m       - unexpected value "Name Match Failed"[22m


  1051 |     // ASSERT: a captured name differing from the Home Affairs record yields Name Match FAILED while
  1052 |     //         ID Match and Death Check still PASSED (recorded live on LA2026/14623)
> 1053 |     await expect(field(modal(page), 'idVerification_nameMatchStatus')).toContainText('FAILED');
       |                                                                        ^
  1054 |     await expect(field(modal(page), 'idVerification_idNumberMatchStatus')).toContainText('PASSED');
  1055 |     await expect(field(modal(page), 'idVerif
```
**Location:** /Users/Sanele/Downloads/Autotesting/Test-ReportsHub/projects/land-bank/test-plans/workflow/loan-application-workflow-stages.spec.ts:1053:72

### TC-10: Complete Onboarding Checklist, including its conditional question
**Mode:** playwright-script
**Duration:** 21.0s
- [FAIL] TC-10: Complete Onboarding Checklist, including its conditional question

**Error:**
```
Error: [2mexpect([22m[31mlocator[39m[2m).[22mtoBeChecked[2m([22m[2m)[22m failed

Locator:  locator('.ant-form-item:has(> .ant-row > .ant-col.ant-form-item-label > label[for="subForm1_requiresWaterRightsSupport"])').locator('input[type="checkbox"]')
Expected: checked
Received: unchecked
Timeout:  10000ms

Call log:
[2m  - Expect "toBeChecked" with timeout 10000ms[22m
[2m  - waiting for locator('.ant-form-item:has(> .ant-row > .ant-col.ant-form-item-label > label[for="subForm1_requiresWaterRightsSupport"])').locator('input[type="checkbox"]')[22m
[2m    23 × locator resolved to <input type="checkbox" class="ant-checkbox-input"/>[22m
[2m       - unexpected value "unchecked"[22m


  1175 |     await expect(
  1176 |       field(page, CHECKLIST.requiresWaterRightsSupport.field).locator('input[type="checkbox"]')
> 1177 |     ).toBeChecked();
       |       ^
  1178 |
  1179 |     // STEP 6: CLICK the parent checkbox again to untick it
  1180 |     await field(page, CHECKLIST.requiresWaterUseRights.field).locator('.ant-checkbox-wrapper').click();
    at /Users/Sanele/Downloads/Autotesting/Test-ReportsHub/projects/land-bank/test-plans/workflow/loan-application-workflow-stages.spec.ts:1177:7
```
**Location:** /Users/Sanele/Downloads/Autotesting/Test-ReportsHub/projects/land-bank/test-plans/workflow/loan-application-workflow-stages.spec.ts:1177:7

### TC-11: Submitting the onboarding checklist completes the process
**Mode:** playwright-script
**Duration:** 0.1s
- [FAIL] TC-11: Submitting the onboarding checklist completes the process

### TC-12: An unsigned / un-uploaded consent terminates the application
**Mode:** playwright-script
**Duration:** 9.2s
- [FAIL] TC-12: An unsigned / un-uploaded consent terminates the application
