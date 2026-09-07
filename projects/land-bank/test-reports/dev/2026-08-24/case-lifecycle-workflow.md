# Report: Test Plan: DEV-COMP-2.1 — Compliance Case Lifecycle Workflow (Dev)
**Date:** 2026-08-24 12:35 UTC
**Plan:** test-plans/dev/compliance/case-lifecycle-workflow.md
**Spec:** test-plans/dev/compliance/case-lifecycle-workflow.spec.ts
**Execution Mode:** playwright-script (failures pending AI-repair)
**Result:** PARTIAL
**Duration:** 140.1s

## Summary
| Total Steps | Passed | Failed | Skipped |
|-------------|--------|--------|---------|
| 10 | 9 | 1 | 0 |

## Step Results
### TC-01: A case received from the RM is waiting for compliance
**Mode:** playwright-script
**Duration:** 6.5s
- [PASS] TC-01: A case received from the RM is waiting for compliance

### TC-02: The audit log shows the case was created when the RM finalised verification
**Mode:** playwright-script
**Duration:** 9.7s
- [PASS] TC-02: The audit log shows the case was created when the RM finalised verification

### TC-03: Picking up a case from the Cases listing
**Mode:** playwright-script
**Duration:** 12.0s
- [PASS] TC-03: Picking up a case from the Cases listing

### TC-04: Opening the picked-up case
**Mode:** playwright-script
**Duration:** 6.0s
- [PASS] TC-04: Opening the picked-up case

### TC-05: Adjudicating a flagged case on the Risk Assessment tab
**Mode:** playwright-script
**Duration:** 7.1s
- [PASS] TC-05: Adjudicating a flagged case on the Risk Assessment tab

### TC-06: Escalating a case to governance
**Mode:** playwright-script
**Duration:** 15.8s
- [PASS] TC-06: Escalating a case to governance

### TC-07: De-escalating the case releases it from hold
**Mode:** playwright-script
**Duration:** 12.6s
- [PASS] TC-07: De-escalating the case releases it from hold

### TC-08: The audit log records the escalation and de-escalation
**Mode:** playwright-script
**Duration:** 2.7s
- [PASS] TC-08: The audit log records the escalation and de-escalation

### TC-09: Finalising a case by signing it off
**Mode:** playwright-script
**Duration:** 17.0s
- [PASS] TC-09: Finalising a case by signing it off

### TC-10: Sending a case back to frontline
**Mode:** playwright-script
**Duration:** 23.9s
- [FAIL] TC-10: Sending a case back to frontline

**Error:**
```
TimeoutError: locator.click: Timeout 15000ms exceeded.
Call log:
[2m  - waiting for locator('[role="dialog"]').filter({ hasText: /Send back to frontline/ }).first().locator('.ant-select-selector').first()[22m
[2m    - locator resolved to <div class="ant-select-selector">…</div>[22m
[2m  - attempting click action[22m
[2m    2 × waiting for element to be visible, enabled and stable[22m
[2m      - element is not visible[22m
[2m    - retrying click action[22m
[2m    - waiting 20ms[22m
[2m    2 × waiting for element to be visible, enabled and stable[22m
[2m      - element is not visible[22m
[2m    - retrying click action[22m
[2m      - waiting 100ms[22m
[2m    29 × waiting for element to be visible, enabled and stable[22m
[2m       - element is not visible[22m
[2m     - retrying click action[22m
[2m       - waiting 500ms[22m


  207 | // portal at document level, NOT inside the dialog, so the option locator is page-scoped.
  208 | async function pickFirstSelectOption(page: Page, dialog: ReturnType<typeof dialogWith>, nth = 0) {
> 209 |   await dialog.locator('.ant-select-selector').nth(nth).click();
      |                                                         ^
  210 |   const option = page.locator('.ant-select-dropdown:visible .ant-select-item-option').first();
  211 |   await expect(option, 'the select should offer at least one option').toBeVisible({ timeout: 20000 });
  212 |   const label = (await option.innerText()).trim();
    at pickFirstSel
```
**Location:** /Users/Sanele/Downloads/Autotesting/Test-ReportsHub/projects/land-bank/test-plans/dev/compliance/case-lifecycle-workflow.spec.ts:209:57
