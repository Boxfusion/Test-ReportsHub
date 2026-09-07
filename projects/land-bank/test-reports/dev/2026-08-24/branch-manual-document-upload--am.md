# Report: Test Plan: LEAD-2.2 — Land Bank Branch Manual Document Upload (all Client Types) — am
**Date:** 2026-08-24 06:10 UTC
**Variant:** am
**Plan:** test-plans/leads/branch-manual-document-upload.md
**Spec:** test-plans/leads/branch-manual-document-upload.spec.ts
**Execution Mode:** playwright-script (failures pending AI-repair)
**Result:** PARTIAL
**Duration:** 207.8s

## Summary
| Total Steps | Passed | Failed | Skipped |
|-------------|--------|--------|---------|
| 13 | 9 | 4 | 0 |

## Step Results
### TC-01: Log in as an RM and open the New Lead form on the Landbank Branch channel
**Mode:** playwright-script
**Duration:** 11.5s
- [PASS] TC-01: Log in as an RM and open the New Lead form on the Landbank Branch channel

### TC-02: The Client Type dropdown offers exactly the eight selectable types
**Mode:** playwright-script
**Duration:** 8.5s
- [FAIL] TC-02: The Client Type dropdown offers exactly the eight selectable types

**Error:**
```
Error: [2mexpect([22m[31mreceived[39m[2m).[22mtoEqual[2m([22m[32mexpected[39m[2m) // deep equality[22m

[32m- Expected  - 1[39m
[31m+ Received  + 3[39m

[2m  Array [[22m
[32m-   "Individual (Individual)",[39m
[31m+   "Individual / Sole Proprietor",[39m
[2m    "Close Corporation (Entity)",[22m
[2m    "Co-Operative (Entity)",[22m
[2m    "Listed Company (Entity)",[22m
[2m    "Trust",[22m
[2m    "NGO",[22m
[2m    "Partnership",[22m
[2m    "Private Company",[22m
[31m+   "NPO",[39m
[31m+   "Unlisted Company (Entity)",[39m
[2m  ][22m

  353 |
  354 |     // ASSERT (BLOCKING): the dropdown offers exactly the eight recorded options
> 355 |     expect(options).toEqual([...SELECTABLE_CLIENT_TYPES]);
      |                     ^
  356 |
  357 |     // ASSERT: `Co-Applicant` is not offered (participant role, excluded by design)
  358 |     expect(options).not.toContain(CO_APPLICANT);
    at /Users/Sanele/Downloads/Autotesting/Test-ReportsHub/projects/land-bank/test-plans/leads/branch-manual-document-upload.spec.ts:355:21
```
**Location:** /Users/Sanele/Downloads/Autotesting/Test-ReportsHub/projects/land-bank/test-plans/leads/branch-manual-document-upload.spec.ts:355:21

### TC-03: Individual — consent-only upload
**Mode:** playwright-script
**Duration:** 22.8s
- [FAIL] TC-03: Individual — consent-only upload

**Error:**
```
TimeoutError: locator.click: Timeout 15000ms exceeded.
Call log:
[2m  - waiting for locator('.ant-select-dropdown:not(.ant-select-dropdown-hidden) .ant-select-item-option[title="Individual (Individual)"]')[22m


  235 | async function selectOption(scope: Page | Locator, page: Page, name: string, option: string) {
  236 |   await field(scope, name).locator('.ant-select-selector').click();
> 237 |   await openOption(page, option).click();
      |                                  ^
  238 | }
  239 |
  240 | /**
    at selectOption (/Users/Sanele/Downloads/Autotesting/Test-ReportsHub/projects/land-bank/test-plans/leads/branch-manual-document-upload.spec.ts:237:34)
    at /Users/Sanele/Downloads/Autotesting/Test-ReportsHub/projects/land-bank/test-plans/leads/branch-manual-document-upload.spec.ts:377:5
```
**Location:** /Users/Sanele/Downloads/Autotesting/Test-ReportsHub/projects/land-bank/test-plans/leads/branch-manual-document-upload.spec.ts:237:34

### TC-03b: Sole Proprietor follows the identical consent-only process
**Mode:** playwright-script
**Duration:** 8.8s
- [FAIL] TC-03b: Sole Proprietor follows the identical consent-only process

### TC-04: Close Corporation (Entity) — resolution + consent upload
**Mode:** playwright-script
**Duration:** 17.1s
- [PASS] TC-04: Close Corporation (Entity) — resolution + consent upload

### TC-05: Listed Company (Entity) — resolution + consent upload
**Mode:** playwright-script
**Duration:** 16.9s
- [PASS] TC-05: Listed Company (Entity) — resolution + consent upload

### TC-06: Co-Operative (Entity) — resolution + consent upload
**Mode:** playwright-script
**Duration:** 14.8s
- [PASS] TC-06: Co-Operative (Entity) — resolution + consent upload

### TC-07: Private Company — resolution + consent upload
**Mode:** playwright-script
**Duration:** 17.2s
- [PASS] TC-07: Private Company — resolution + consent upload

### TC-08: Trust — resolution + consent upload
**Mode:** playwright-script
**Duration:** 15.3s
- [PASS] TC-08: Trust — resolution + consent upload

### TC-09: Partnership — resolution + consent upload
**Mode:** playwright-script
**Duration:** 15.3s
- [PASS] TC-09: Partnership — resolution + consent upload

### TC-10: NGO — resolution + consent upload
**Mode:** playwright-script
**Duration:** 14.4s
- [PASS] TC-10: NGO — resolution + consent upload

### TC-11: Save is gated on the uploads for every client type
**Mode:** playwright-script
**Duration:** 25.8s
- [FAIL] TC-11: Save is gated on the uploads for every client type

**Error:**
```
TimeoutError: locator.click: Timeout 15000ms exceeded.
Call log:
[2m  - waiting for locator('.ant-select-dropdown:not(.ant-select-dropdown-hidden) .ant-select-item-option[title="Individual (Individual)"]')[22m


  235 | async function selectOption(scope: Page | Locator, page: Page, name: string, option: string) {
  236 |   await field(scope, name).locator('.ant-select-selector').click();
> 237 |   await openOption(page, option).click();
      |                                  ^
  238 | }
  239 |
  240 | /**
    at selectOption (/Users/Sanele/Downloads/Autotesting/Test-ReportsHub/projects/land-bank/test-plans/leads/branch-manual-document-upload.spec.ts:237:34)
    at /Users/Sanele/Downloads/Autotesting/Test-ReportsHub/projects/land-bank/test-plans/leads/branch-manual-document-upload.spec.ts:722:7
```
**Location:** /Users/Sanele/Downloads/Autotesting/Test-ReportsHub/projects/land-bank/test-plans/leads/branch-manual-document-upload.spec.ts:237:34

### TC-12: A branch-captured lead arrives with its consent already satisfied
**Mode:** playwright-script
**Duration:** 16.9s
- [PASS] TC-12: A branch-captured lead arrives with its consent already satisfied
