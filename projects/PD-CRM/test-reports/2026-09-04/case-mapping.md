# Report: Case Mapping — ADO suite 113658
**Date:** 2026-09-04 07:55 UTC
**Plan:** test-plans/case-management/case-mapping.md
**Spec:** test-plans/case-management/case-mapping.spec.ts
**Execution Mode:** playwright-script (failures pending AI-repair)
**Result:** PARTIAL
**Duration:** 232.5s

## Summary
| Total Steps | Passed | Failed | Skipped |
|-------------|--------|--------|---------|
| 8 | 7 | 1 | 0 |

## Step Results
### TC-01 (#113659): Verify Logged Cases Are Displayed on the Map
**Mode:** playwright-script
**Duration:** 22.1s
- [PASS] TC-01 (#113659): Verify Logged Cases Are Displayed on the Map

### TC-02 (#113660): Verify Cases Can Be Filtered by Channel
**Mode:** playwright-script
**Duration:** 24.6s
- [PASS] TC-02 (#113660): Verify Cases Can Be Filtered by Channel

### TC-03 (#113661): Verify Cases Can Be Filtered by Status
**Mode:** playwright-script
**Duration:** 23.9s
- [PASS] TC-03 (#113661): Verify Cases Can Be Filtered by Status

### TC-04 (#113662): Verify Cases Can Be Filtered by Priority
**Mode:** playwright-script
**Duration:** 24.6s
- [PASS] TC-04 (#113662): Verify Cases Can Be Filtered by Priority

### TC-05 (#113663): Verify Cases Can Be Filtered by Category and Case Type
**Mode:** playwright-script
**Duration:** 33.5s
- [FAIL] TC-05 (#113663): Verify Cases Can Be Filtered by Category and Case Type

**Error:**
```
Error: BUG-701: Case Type options should be populated based on the selected Category

[2mexpect([22m[31mreceived[39m[2m).[22mnot[2m.[22mtoEqual[2m([22m[32mexpected[39m[2m) // deep equality[22m

Expected: not [32m["Air Pollution Complaint", "Area Power Failure", "Burst Pipe", "Complete Water Outage", "Damaged Road Surface", "Fire Hazard Inspection Request", "Food Premises Hygiene Complaint", "Landing Books", "Low Water Pressure", "Street Light Not Working"][39m


  222 |     // choice. This is an application defect, not a script fault — the whole option list is read.
  223 |     expect(after, 'BUG-701: Case Type options should be populated based on the selected Category')
> 224 |       .not.toEqual(before);
      |            ^
  225 |
  226 |     // STEP 5-6: a Case Type can still be chosen and applied
  227 |     const clause2 = await filterClauseFrom(page, () => pickOpenOption(page, after[0]));
    at C:\Users\NomfaneloNhleko\OneDrive\Test-ReportsHub\projects\PD-CRM\test-plans\case-management\case-mapping.spec.ts:224:12
```
**Location:** C:\Users\NomfaneloNhleko\OneDrive\Test-ReportsHub\projects\PD-CRM\test-plans\case-management\case-mapping.spec.ts:224:12

### TC-06 (#113664): Verify Cases Can Be Filtered by Reported Date
**Mode:** playwright-script
**Duration:** 31.0s
- [PASS] TC-06 (#113664): Verify Cases Can Be Filtered by Reported Date

### TC-07 (#113665): Verify Multiple Case Mapping Filters Can Be Applied
**Mode:** playwright-script
**Duration:** 46.5s
- [PASS] TC-07 (#113665): Verify Multiple Case Mapping Filters Can Be Applied

### TC-08 (#113666): Verify Case Details Are Displayed When a Case Location Is Hovered Over
**Mode:** playwright-script
**Duration:** 21.2s
- [PASS] TC-08 (#113666): Verify Case Details Are Displayed When a Case Location Is Hovered Over
