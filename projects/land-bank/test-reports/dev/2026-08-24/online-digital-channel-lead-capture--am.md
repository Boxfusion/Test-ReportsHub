# Report: Test Plan: LEAD-2.3 — Online Digital Channel Lead Capture (all Client Types) — am
**Date:** 2026-08-24 06:26 UTC
**Variant:** am
**Plan:** test-plans/leads/online-digital-channel-lead-capture.md
**Spec:** test-plans/leads/online-digital-channel-lead-capture.spec.ts
**Execution Mode:** playwright-script (failures pending AI-repair)
**Result:** PARTIAL
**Duration:** 191.9s

## Summary
| Total Steps | Passed | Failed | Skipped |
|-------------|--------|--------|---------|
| 13 | 10 | 3 | 0 |

## Step Results
### TC-01: Log in as an RM and open the New Lead form on the Online Digital Channel
**Mode:** playwright-script
**Duration:** 8.4s
- [PASS] TC-01: Log in as an RM and open the New Lead form on the Online Digital Channel

### TC-02: The Client Type dropdown offers exactly the eight selectable types
**Mode:** playwright-script
**Duration:** 9.3s
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

  307 |
  308 |     // ASSERT (BLOCKING): the dropdown offers exactly the eight recorded options
> 309 |     expect(options).toEqual([...SELECTABLE_CLIENT_TYPES]);
      |                     ^
  310 |
  311 |     // ASSERT: `Co-Applicant` is not offered (participant role, excluded by design)
  312 |     expect(options).not.toContain(CO_APPLICANT);
    at /Users/Sanele/Downloads/Autotesting/Test-ReportsHub/projects/land-bank/test-plans/leads/online-digital-channel-lead-capture.spec.ts:309:21
```
**Location:** /Users/Sanele/Downloads/Autotesting/Test-ReportsHub/projects/land-bank/test-plans/leads/online-digital-channel-lead-capture.spec.ts:309:21

### TC-03: Individual (Individual) — Entity Name not captured
**Mode:** playwright-script
**Duration:** 24.3s
- [FAIL] TC-03: Individual (Individual) — Entity Name not captured

**Error:**
```
TimeoutError: locator.click: Timeout 15000ms exceeded.
Call log:
[2m  - waiting for locator('.ant-select-dropdown:not(.ant-select-dropdown-hidden) .ant-select-item-option[title="Individual (Individual)"]')[22m


  198 | async function selectOption(scope: Page | Locator, page: Page, name: string, option: string) {
  199 |   await field(scope, name).locator('.ant-select-selector').click();
> 200 |   await openOption(page, option).click();
      |                                  ^
  201 | }
  202 |
  203 | /**
    at selectOption (/Users/Sanele/Downloads/Autotesting/Test-ReportsHub/projects/land-bank/test-plans/leads/online-digital-channel-lead-capture.spec.ts:200:34)
    at /Users/Sanele/Downloads/Autotesting/Test-ReportsHub/projects/land-bank/test-plans/leads/online-digital-channel-lead-capture.spec.ts:344:7
```
**Location:** /Users/Sanele/Downloads/Autotesting/Test-ReportsHub/projects/land-bank/test-plans/leads/online-digital-channel-lead-capture.spec.ts:200:34

### TC-04: Close Corporation (Entity) — Entity Name required
**Mode:** playwright-script
**Duration:** 13.0s
- [PASS] TC-04: Close Corporation (Entity) — Entity Name required

### TC-05: Co-Operative (Entity) — Entity Name required
**Mode:** playwright-script
**Duration:** 13.6s
- [PASS] TC-05: Co-Operative (Entity) — Entity Name required

### TC-06: Listed Company (Entity) — Entity Name required
**Mode:** playwright-script
**Duration:** 15.4s
- [PASS] TC-06: Listed Company (Entity) — Entity Name required

### TC-07: Trust — Entity Name optional
**Mode:** playwright-script
**Duration:** 14.6s
- [PASS] TC-07: Trust — Entity Name optional

### TC-08: NGO — Entity Name optional
**Mode:** playwright-script
**Duration:** 14.8s
- [PASS] TC-08: NGO — Entity Name optional

### TC-09: Partnership — Entity Name optional
**Mode:** playwright-script
**Duration:** 12.4s
- [PASS] TC-09: Partnership — Entity Name optional

### TC-10: Private Company — Entity Name optional
**Mode:** playwright-script
**Duration:** 15.3s
- [PASS] TC-10: Private Company — Entity Name optional

### TC-11: The field matrix holds across every client type, and Save is never gated
**Mode:** playwright-script
**Duration:** 24.7s
- [FAIL] TC-11: The field matrix holds across every client type, and Save is never gated

**Error:**
```
TimeoutError: locator.click: Timeout 15000ms exceeded.
Call log:
[2m  - waiting for locator('.ant-select-dropdown:not(.ant-select-dropdown-hidden) .ant-select-item-option[title="Individual (Individual)"]')[22m


  198 | async function selectOption(scope: Page | Locator, page: Page, name: string, option: string) {
  199 |   await field(scope, name).locator('.ant-select-selector').click();
> 200 |   await openOption(page, option).click();
      |                                  ^
  201 | }
  202 |
  203 | /**
    at selectOption (/Users/Sanele/Downloads/Autotesting/Test-ReportsHub/projects/land-bank/test-plans/leads/online-digital-channel-lead-capture.spec.ts:200:34)
    at /Users/Sanele/Downloads/Autotesting/Test-ReportsHub/projects/land-bank/test-plans/leads/online-digital-channel-lead-capture.spec.ts:462:7
```
**Location:** /Users/Sanele/Downloads/Autotesting/Test-ReportsHub/projects/land-bank/test-plans/leads/online-digital-channel-lead-capture.spec.ts:200:34

### TC-12: An online-captured lead leaves its consent stage outstanding in the workflow
**Mode:** playwright-script
**Duration:** 14.2s
- [PASS] TC-12: An online-captured lead leaves its consent stage outstanding in the workflow

### TC-13: Entity Name persists on the saved lead although the details page never shows it
**Mode:** playwright-script
**Duration:** 9.4s
- [PASS] TC-13: Entity Name persists on the saved lead although the details page never shows it
