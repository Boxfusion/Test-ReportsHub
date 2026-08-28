# Report: Test Plan: LEAD-2.2 — Land Bank Branch Manual Document Upload (all Client Types)
**Date:** 2026-08-20 11:16 UTC
**Plan:** test-plans/leads/branch-manual-document-upload.md
**Spec:** test-plans/leads/branch-manual-document-upload.spec.ts
**Execution Mode:** playwright-script (failures pending AI-repair)
**Result:** FAILED
**Duration:** 600.4s

## Summary
| Total Steps | Passed | Failed | Skipped |
|-------------|--------|--------|---------|
| 13 | 2 | 11 | 0 |

## Step Results
### TC-01: Log in as an RM and open the New Lead form on the Landbank Branch channel
**Mode:** playwright-script
**Duration:** 6.7s
- [PASS] TC-01: Log in as an RM and open the New Lead form on the Landbank Branch channel

### TC-02: The Client Type dropdown offers exactly the eight selectable types
**Mode:** playwright-script
**Duration:** 5.6s
- [FAIL] TC-02: The Client Type dropdown offers exactly the eight selectable types

**Error:**
```
Error: BUG-LB-007: Sole Proprietor (Individual) is filtered out of the New Lead Client Type dropdown although it remains in the ClientType reference list — regression since 2026-07-31

[2mexpect([22m[31mreceived[39m[2m).[22mtoContain[2m([22m[32mexpected[39m[2m) // indexOf[22m

Expected value: [32m"Sole Proprietor (Individual)"[39m
Received array: [31m["Individual (Individual)", "Close Corporation (Entity)", "Co-Operative (Entity)", "Listed Company (Entity)", "Trust", "NGO", "Partnership", "Private Company"][39m

  351 |           'dropdown although it remains in the ClientType reference list — regression since 2026-07-31'
  352 |       )
> 353 |       .toContain(SOLE_PROPRIETOR);
      |        ^
  354 |   });
  355 |
  356 |   test('TC-03: Individual — consent-only upload', async ({ page }) => {
    at /Users/Sanele/Downloads/Autotesting/Test-ReportsHub/projects/land-bank/test-plans/leads/branch-manual-document-upload.spec.ts:353:8
```
**Location:** /Users/Sanele/Downloads/Autotesting/Test-ReportsHub/projects/land-bank/test-plans/leads/branch-manual-document-upload.spec.ts:353:8

### TC-03: Individual — consent-only upload
**Mode:** playwright-script
**Duration:** 67.6s
- [FAIL] TC-03: Individual — consent-only upload

**Error:**
```
Error: firstName should be present

[2mexpect([22m[31mlocator[39m[2m).[22mtoHaveCount[2m([22m[32mexpected[39m[2m)[22m failed

Locator:  locator('.ant-modal-content').locator('.ant-form-item:has(> .ant-row > .ant-col.ant-form-item-label > label[for="firstName"])')
Expected: [32m1[39m
Received: [31m0[39m
Timeout:  60000ms

Call log:
[2m  - firstName should be present with timeout 60000ms[22m
[2m  - waiting for locator('.ant-modal-content').locator('.ant-form-item:has(> .ant-row > .ant-col.ant-form-item-label > label[for="firstName"])')[22m
[2m    123 × locator resolved to 0 elements[22m
[2m        - unexpected value "0"[22m


  186 | async function expectFieldShown(scope: Page | Locator, name: string) {
  187 |   const f = field(scope, name);
> 188 |   await expect(f, `${name} should be present`).toHaveCount(1, { timeout: LONG });
      |                                                ^
  189 |   await expect(f, `${name} should not be hidden`).not.toHaveClass(/ant-form-item-hidden/, { timeout: LONG });
  190 | }
  191 | async function expectFieldHidden(scope: Page | Locator, name: string) {
    at expectFieldShown (/Users/Sanele/Downloads/Autotesting/Test-ReportsHub/projects/land-bank/test-plans/leads/branch-manual-document-upload.spec.ts:188:48)
    at /Users/Sanele/Downloads/Autotesting/Test-ReportsHub/projects/land-bank/test-plans/leads/branch-manual-document-upload.spec.ts:418:11
```
**Location:** /Users/Sanele/Downloads/Autotesting/Test-ReportsHub/projects/land-bank/test-plans/leads/branch-manual-document-upload.spec.ts:188:48

### TC-03b: Sole Proprietor follows the identical consent-only process
**Mode:** playwright-script
**Duration:** 5.8s
- [FAIL] TC-03b: Sole Proprietor follows the identical consent-only process

### TC-04: Close Corporation (Entity) — resolution + consent upload
**Mode:** playwright-script
**Duration:** 68.0s
- [FAIL] TC-04: Close Corporation (Entity) — resolution + consent upload

**Error:**
```
Error: [2mexpect([22m[31mlocator[39m[2m).[22mtoHaveValue[2m([22m[32mexpected[39m[2m)[22m failed

Locator: locator('.ant-modal-content').locator('.ant-form-item:has(> .ant-row > .ant-col.ant-form-item-label > label[for="organisation"])').locator('input.ant-input')
Expected: [32m"BOXFUSION (PTY)LTD"[39m
Timeout: 60000ms
Error: element(s) not found

Call log:
[2m  - Expect "toHaveValue" with timeout 60000ms[22m
[2m  - waiting for locator('.ant-modal-content').locator('.ant-form-item:has(> .ant-row > .ant-col.ant-form-item-label > label[for="organisation"])').locator('input.ant-input')[22m
[2m    6 × locator resolved to <input value="" type="text" maxlength="200" class="ant-input css-1lo1l9k"/>[22m
[2m      - unexpected value ""[22m


  573 |       // STEP 10: WAIT for the CIPC lookup to auto-populate the entity details
  574 |       // ASSERT: the CIPC lookup auto-populates **Entity Name** from the Company Registration Number
> 575 |       await expect(textInput(modal(page), 'organisation')).toHaveValue(CIPC_ENTITY_NAME, { timeout: LONG });
      |                                                            ^
  576 |
  577 |       // ASSERT: the Company Registration Number is normalised to its `K`-prefixed form
  578 |       await expect(textInput(modal(page), 'companyRegistrationNumber'))
    at /Users/Sanele/Downloads/Autotesting/Test-ReportsHub/projects/land-bank/test-plans/leads/branch-manual-document-upload.spec.ts:575:60
```
**Location:** /Users/Sanele/Downloads/Autotesting/Test-ReportsHub/projects/land-bank/test-plans/leads/branch-manual-document-upload.spec.ts:575:60

### TC-05: Listed Company (Entity) — resolution + consent upload
**Mode:** playwright-script
**Duration:** 67.8s
- [FAIL] TC-05: Listed Company (Entity) — resolution + consent upload

**Error:**
```
Error: [2mexpect([22m[31mlocator[39m[2m).[22mtoHaveValue[2m([22m[32mexpected[39m[2m)[22m failed

Locator: locator('.ant-modal-content').locator('.ant-form-item:has(> .ant-row > .ant-col.ant-form-item-label > label[for="organisation"])').locator('input.ant-input')
Expected: [32m"BOXFUSION (PTY)LTD"[39m
Timeout: 60000ms
Error: element(s) not found

Call log:
[2m  - Expect "toHaveValue" with timeout 60000ms[22m
[2m  - waiting for locator('.ant-modal-content').locator('.ant-form-item:has(> .ant-row > .ant-col.ant-form-item-label > label[for="organisation"])').locator('input.ant-input')[22m
[2m    4 × locator resolved to <input value="" type="text" maxlength="200" class="ant-input css-1lo1l9k"/>[22m
[2m      - unexpected value ""[22m


  573 |       // STEP 10: WAIT for the CIPC lookup to auto-populate the entity details
  574 |       // ASSERT: the CIPC lookup auto-populates **Entity Name** from the Company Registration Number
> 575 |       await expect(textInput(modal(page), 'organisation')).toHaveValue(CIPC_ENTITY_NAME, { timeout: LONG });
      |                                                            ^
  576 |
  577 |       // ASSERT: the Company Registration Number is normalised to its `K`-prefixed form
  578 |       await expect(textInput(modal(page), 'companyRegistrationNumber'))
    at /Users/Sanele/Downloads/Autotesting/Test-ReportsHub/projects/land-bank/test-plans/leads/branch-manual-document-upload.spec.ts:575:60
```
**Location:** /Users/Sanele/Downloads/Autotesting/Test-ReportsHub/projects/land-bank/test-plans/leads/branch-manual-document-upload.spec.ts:575:60

### TC-06: Co-Operative (Entity) — resolution + consent upload
**Mode:** playwright-script
**Duration:** 68.1s
- [FAIL] TC-06: Co-Operative (Entity) — resolution + consent upload

**Error:**
```
Error: [2mexpect([22m[31mlocator[39m[2m).[22mtoHaveValue[2m([22m[32mexpected[39m[2m)[22m failed

Locator: locator('.ant-modal-content').locator('.ant-form-item:has(> .ant-row > .ant-col.ant-form-item-label > label[for="organisation"])').locator('input.ant-input')
Expected: [32m"BOXFUSION (PTY)LTD"[39m
Timeout: 60000ms
Error: element(s) not found

Call log:
[2m  - Expect "toHaveValue" with timeout 60000ms[22m
[2m  - waiting for locator('.ant-modal-content').locator('.ant-form-item:has(> .ant-row > .ant-col.ant-form-item-label > label[for="organisation"])').locator('input.ant-input')[22m
[2m    6 × locator resolved to <input value="" type="text" maxlength="200" class="ant-input css-1lo1l9k"/>[22m
[2m      - unexpected value ""[22m


  573 |       // STEP 10: WAIT for the CIPC lookup to auto-populate the entity details
  574 |       // ASSERT: the CIPC lookup auto-populates **Entity Name** from the Company Registration Number
> 575 |       await expect(textInput(modal(page), 'organisation')).toHaveValue(CIPC_ENTITY_NAME, { timeout: LONG });
      |                                                            ^
  576 |
  577 |       // ASSERT: the Company Registration Number is normalised to its `K`-prefixed form
  578 |       await expect(textInput(modal(page), 'companyRegistrationNumber'))
    at /Users/Sanele/Downloads/Autotesting/Test-ReportsHub/projects/land-bank/test-plans/leads/branch-manual-document-upload.spec.ts:575:60
```
**Location:** /Users/Sanele/Downloads/Autotesting/Test-ReportsHub/projects/land-bank/test-plans/leads/branch-manual-document-upload.spec.ts:575:60

### TC-07: Private Company — resolution + consent upload
**Mode:** playwright-script
**Duration:** 67.1s
- [FAIL] TC-07: Private Company — resolution + consent upload

**Error:**
```
Error: [2mexpect([22m[31mlocator[39m[2m).[22mtoHaveValue[2m([22m[32mexpected[39m[2m)[22m failed

Locator: locator('.ant-modal-content').locator('.ant-form-item:has(> .ant-row > .ant-col.ant-form-item-label > label[for="organisation"])').locator('input.ant-input')
Expected: [32m"BOXFUSION (PTY)LTD"[39m
Timeout: 60000ms
Error: element(s) not found

Call log:
[2m  - Expect "toHaveValue" with timeout 60000ms[22m
[2m  - waiting for locator('.ant-modal-content').locator('.ant-form-item:has(> .ant-row > .ant-col.ant-form-item-label > label[for="organisation"])').locator('input.ant-input')[22m
[2m    4 × locator resolved to <input value="" type="text" maxlength="200" class="ant-input css-1lo1l9k"/>[22m
[2m      - unexpected value ""[22m


  573 |       // STEP 10: WAIT for the CIPC lookup to auto-populate the entity details
  574 |       // ASSERT: the CIPC lookup auto-populates **Entity Name** from the Company Registration Number
> 575 |       await expect(textInput(modal(page), 'organisation')).toHaveValue(CIPC_ENTITY_NAME, { timeout: LONG });
      |                                                            ^
  576 |
  577 |       // ASSERT: the Company Registration Number is normalised to its `K`-prefixed form
  578 |       await expect(textInput(modal(page), 'companyRegistrationNumber'))
    at /Users/Sanele/Downloads/Autotesting/Test-ReportsHub/projects/land-bank/test-plans/leads/branch-manual-document-upload.spec.ts:575:60
```
**Location:** /Users/Sanele/Downloads/Autotesting/Test-ReportsHub/projects/land-bank/test-plans/leads/branch-manual-document-upload.spec.ts:575:60

### TC-08: Trust — resolution + consent upload
**Mode:** playwright-script
**Duration:** 67.8s
- [FAIL] TC-08: Trust — resolution + consent upload

**Error:**
```
Error: [2mexpect([22m[31mlocator[39m[2m).[22mtoHaveValue[2m([22m[32mexpected[39m[2m)[22m failed

Locator: locator('.ant-modal-content').locator('.ant-form-item:has(> .ant-row > .ant-col.ant-form-item-label > label[for="organisation"])').locator('input.ant-input')
Expected: [32m"BOXFUSION (PTY)LTD"[39m
Timeout: 60000ms
Error: element(s) not found

Call log:
[2m  - Expect "toHaveValue" with timeout 60000ms[22m
[2m  - waiting for locator('.ant-modal-content').locator('.ant-form-item:has(> .ant-row > .ant-col.ant-form-item-label > label[for="organisation"])').locator('input.ant-input')[22m
[2m    2 × locator resolved to <input value="" type="text" maxlength="200" class="ant-input css-1lo1l9k"/>[22m
[2m      - unexpected value ""[22m


  573 |       // STEP 10: WAIT for the CIPC lookup to auto-populate the entity details
  574 |       // ASSERT: the CIPC lookup auto-populates **Entity Name** from the Company Registration Number
> 575 |       await expect(textInput(modal(page), 'organisation')).toHaveValue(CIPC_ENTITY_NAME, { timeout: LONG });
      |                                                            ^
  576 |
  577 |       // ASSERT: the Company Registration Number is normalised to its `K`-prefixed form
  578 |       await expect(textInput(modal(page), 'companyRegistrationNumber'))
    at /Users/Sanele/Downloads/Autotesting/Test-ReportsHub/projects/land-bank/test-plans/leads/branch-manual-document-upload.spec.ts:575:60
```
**Location:** /Users/Sanele/Downloads/Autotesting/Test-ReportsHub/projects/land-bank/test-plans/leads/branch-manual-document-upload.spec.ts:575:60

### TC-09: Partnership — resolution + consent upload
**Mode:** playwright-script
**Duration:** 67.9s
- [FAIL] TC-09: Partnership — resolution + consent upload

**Error:**
```
Error: [2mexpect([22m[31mlocator[39m[2m).[22mtoHaveValue[2m([22m[32mexpected[39m[2m)[22m failed

Locator: locator('.ant-modal-content').locator('.ant-form-item:has(> .ant-row > .ant-col.ant-form-item-label > label[for="organisation"])').locator('input.ant-input')
Expected: [32m"BOXFUSION (PTY)LTD"[39m
Timeout: 60000ms
Error: element(s) not found

Call log:
[2m  - Expect "toHaveValue" with timeout 60000ms[22m
[2m  - waiting for locator('.ant-modal-content').locator('.ant-form-item:has(> .ant-row > .ant-col.ant-form-item-label > label[for="organisation"])').locator('input.ant-input')[22m
[2m    3 × locator resolved to <input value="" type="text" maxlength="200" class="ant-input css-1lo1l9k"/>[22m
[2m      - unexpected value ""[22m


  573 |       // STEP 10: WAIT for the CIPC lookup to auto-populate the entity details
  574 |       // ASSERT: the CIPC lookup auto-populates **Entity Name** from the Company Registration Number
> 575 |       await expect(textInput(modal(page), 'organisation')).toHaveValue(CIPC_ENTITY_NAME, { timeout: LONG });
      |                                                            ^
  576 |
  577 |       // ASSERT: the Company Registration Number is normalised to its `K`-prefixed form
  578 |       await expect(textInput(modal(page), 'companyRegistrationNumber'))
    at /Users/Sanele/Downloads/Autotesting/Test-ReportsHub/projects/land-bank/test-plans/leads/branch-manual-document-upload.spec.ts:575:60
```
**Location:** /Users/Sanele/Downloads/Autotesting/Test-ReportsHub/projects/land-bank/test-plans/leads/branch-manual-document-upload.spec.ts:575:60

### TC-10: NGO — resolution + consent upload
**Mode:** playwright-script
**Duration:** 68.4s
- [FAIL] TC-10: NGO — resolution + consent upload

**Error:**
```
Error: [2mexpect([22m[31mlocator[39m[2m).[22mtoHaveValue[2m([22m[32mexpected[39m[2m)[22m failed

Locator: locator('.ant-modal-content').locator('.ant-form-item:has(> .ant-row > .ant-col.ant-form-item-label > label[for="organisation"])').locator('input.ant-input')
Expected: [32m"BOXFUSION (PTY)LTD"[39m
Timeout: 60000ms
Error: element(s) not found

Call log:
[2m  - Expect "toHaveValue" with timeout 60000ms[22m
[2m  - waiting for locator('.ant-modal-content').locator('.ant-form-item:has(> .ant-row > .ant-col.ant-form-item-label > label[for="organisation"])').locator('input.ant-input')[22m
[2m    4 × locator resolved to <input value="" type="text" maxlength="200" class="ant-input css-1lo1l9k"/>[22m
[2m      - unexpected value ""[22m


  573 |       // STEP 10: WAIT for the CIPC lookup to auto-populate the entity details
  574 |       // ASSERT: the CIPC lookup auto-populates **Entity Name** from the Company Registration Number
> 575 |       await expect(textInput(modal(page), 'organisation')).toHaveValue(CIPC_ENTITY_NAME, { timeout: LONG });
      |                                                            ^
  576 |
  577 |       // ASSERT: the Company Registration Number is normalised to its `K`-prefixed form
  578 |       await expect(textInput(modal(page), 'companyRegistrationNumber'))
    at /Users/Sanele/Downloads/Autotesting/Test-ReportsHub/projects/land-bank/test-plans/leads/branch-manual-document-upload.spec.ts:575:60
```
**Location:** /Users/Sanele/Downloads/Autotesting/Test-ReportsHub/projects/land-bank/test-plans/leads/branch-manual-document-upload.spec.ts:575:60

### TC-11: Save is gated on the uploads for every client type
**Mode:** playwright-script
**Duration:** 26.6s
- [PASS] TC-11: Save is gated on the uploads for every client type

### TC-12: A branch-captured lead arrives with its consent already satisfied
**Mode:** playwright-script
**Duration:** 4.5s
- [FAIL] TC-12: A branch-captured lead arrives with its consent already satisfied
