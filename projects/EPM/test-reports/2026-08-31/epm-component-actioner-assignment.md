# Report: EPM — Component Actioner assignment — Stages 1 to 5 with correct action level
**Date:** 2026-08-31 06:41 UTC
**Plan:** test-plans/hierarchy-definitions/epm-component-actioner-assignment.md
**Spec:** test-plans/hierarchy-definitions/epm-component-actioner-assignment.spec.ts
**Execution Mode:** playwright-script (failures pending AI-repair)
**Result:** FAILED
**Duration:** 68.3s

## Summary
| Total Steps | Passed | Failed | Skipped |
|-------------|--------|--------|---------|
| 1 | 0 | 1 | 0 |

## Step Results
### TC-108783 Positive — Assign Component Actioners for Stages 1 to 5 with the correct action level
**Mode:** playwright-script
**Duration:** 4.6s
- [FAIL] TC-108783 Positive — Assign Component Actioners for Stages 1 to 5 with the correct action level

**Error:**
```
Error: PRECONDITION EXPECTED: the Component Actioners tab should start empty

[2mexpect([22m[31mreceived[39m[2m).[22mtoBe[2m([22m[32mexpected[39m[2m) // Object.is equality[22m

Expected: [32m0[39m
Received: [31m5[39m

  80 |     const existingForKpi = caItemsBefore.filter((r: any) => r?.component?.id === KPI_ID);
  81 |     console.log(`PRECONDITION ACTUAL — existing ComponentActioner rows for this KPI: ${existingForKpi.length}.`);
> 82 |     expect(existingForKpi.length, 'PRECONDITION EXPECTED: the Component Actioners tab should start empty').toBe(0);
     |                                                                                                            ^
  83 |
  84 |     const epmItem = page.locator('.ant-menu').getByText('EPM', { exact: true }).locator('visible=true').first();
  85 |     await expect(epmItem).toBeVisible({ timeout: SLOW });
    at C:\Users\Boxfusion\Test-ReportsHub\projects\EPM\test-plans\hierarchy-definitions\epm-component-actioner-assignment.spec.ts:82:108
```
**Location:** C:\Users\Boxfusion\Test-ReportsHub\projects\EPM\test-plans\hierarchy-definitions\epm-component-actioner-assignment.spec.ts:82:108
