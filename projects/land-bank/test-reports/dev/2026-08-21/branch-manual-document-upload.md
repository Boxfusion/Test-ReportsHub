# Report: Test Plan: LEAD-2.2 — Land Bank Branch Manual Document Upload (all Client Types)
**Date:** 2026-08-21 12:01 UTC
**Plan:** test-plans/leads/branch-manual-document-upload.md
**Spec:** test-plans/leads/branch-manual-document-upload.spec.ts
**Execution Mode:** playwright-script (failures pending AI-repair)
**Result:** PARTIAL
**Duration:** 152.1s

## Summary
| Total Steps | Passed | Failed | Skipped |
|-------------|--------|--------|---------|
| 13 | 11 | 2 | 0 |

## Step Results
### TC-01: Log in as an RM and open the New Lead form on the Landbank Branch channel
**Mode:** playwright-script
**Duration:** 6.8s
- [PASS] TC-01: Log in as an RM and open the New Lead form on the Landbank Branch channel

### TC-02: The Client Type dropdown offers exactly the eight selectable types
**Mode:** playwright-script
**Duration:** 6.7s
- [FAIL] TC-02: The Client Type dropdown offers exactly the eight selectable types

**Error:**
```
Error: BUG-LB-007: Sole Proprietor (Individual) is filtered out of the New Lead Client Type dropdown although it remains in the ClientType reference list — regression since 2026-07-31

[2mexpect([22m[31mreceived[39m[2m).[22mtoContain[2m([22m[32mexpected[39m[2m) // indexOf[22m

Expected value: [32m"Sole Proprietor (Individual)"[39m
Received array: [31m["Individual (Individual)", "Close Corporation (Entity)", "Co-Operative (Entity)", "Listed Company (Entity)", "Trust", "NGO", "Partnership", "Private Company"][39m

  367 |           'dropdown although it remains in the ClientType reference list — regression since 2026-07-31'
  368 |       )
> 369 |       .toContain(SOLE_PROPRIETOR);
      |        ^
  370 |   });
  371 |
  372 |   test('TC-03: Individual — consent-only upload', async ({ page }) => {
    at /Users/Sanele/Downloads/Autotesting/Test-ReportsHub/projects/land-bank/test-plans/leads/branch-manual-document-upload.spec.ts:369:8
```
**Location:** /Users/Sanele/Downloads/Autotesting/Test-ReportsHub/projects/land-bank/test-plans/leads/branch-manual-document-upload.spec.ts:369:8

### TC-03: Individual — consent-only upload
**Mode:** playwright-script
**Duration:** 11.7s
- [PASS] TC-03: Individual — consent-only upload

### TC-03b: Sole Proprietor follows the identical consent-only process
**Mode:** playwright-script
**Duration:** 7.4s
- [FAIL] TC-03b: Sole Proprietor follows the identical consent-only process

### TC-04: Close Corporation (Entity) — resolution + consent upload
**Mode:** playwright-script
**Duration:** 10.9s
- [PASS] TC-04: Close Corporation (Entity) — resolution + consent upload

### TC-05: Listed Company (Entity) — resolution + consent upload
**Mode:** playwright-script
**Duration:** 11.6s
- [PASS] TC-05: Listed Company (Entity) — resolution + consent upload

### TC-06: Co-Operative (Entity) — resolution + consent upload
**Mode:** playwright-script
**Duration:** 10.9s
- [PASS] TC-06: Co-Operative (Entity) — resolution + consent upload

### TC-07: Private Company — resolution + consent upload
**Mode:** playwright-script
**Duration:** 10.8s
- [PASS] TC-07: Private Company — resolution + consent upload

### TC-08: Trust — resolution + consent upload
**Mode:** playwright-script
**Duration:** 11.5s
- [PASS] TC-08: Trust — resolution + consent upload

### TC-09: Partnership — resolution + consent upload
**Mode:** playwright-script
**Duration:** 11.5s
- [PASS] TC-09: Partnership — resolution + consent upload

### TC-10: NGO — resolution + consent upload
**Mode:** playwright-script
**Duration:** 10.9s
- [PASS] TC-10: NGO — resolution + consent upload

### TC-11: Save is gated on the uploads for every client type
**Mode:** playwright-script
**Duration:** 29.1s
- [PASS] TC-11: Save is gated on the uploads for every client type

### TC-12: A branch-captured lead arrives with its consent already satisfied
**Mode:** playwright-script
**Duration:** 10.8s
- [PASS] TC-12: A branch-captured lead arrives with its consent already satisfied
