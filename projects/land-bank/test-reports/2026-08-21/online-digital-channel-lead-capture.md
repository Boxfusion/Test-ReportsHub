# Report: Test Plan: LEAD-2.3 — Online Digital Channel Lead Capture (all Client Types)
**Date:** 2026-08-21 12:03 UTC
**Plan:** test-plans/leads/online-digital-channel-lead-capture.md
**Spec:** test-plans/leads/online-digital-channel-lead-capture.spec.ts
**Execution Mode:** playwright-script (failures pending AI-repair)
**Result:** PARTIAL
**Duration:** 126.2s

## Summary
| Total Steps | Passed | Failed | Skipped |
|-------------|--------|--------|---------|
| 13 | 12 | 1 | 0 |

## Step Results
### TC-01: Log in as an RM and open the New Lead form on the Online Digital Channel
**Mode:** playwright-script
**Duration:** 6.1s
- [PASS] TC-01: Log in as an RM and open the New Lead form on the Online Digital Channel

### TC-02: The Client Type dropdown offers exactly the eight selectable types
**Mode:** playwright-script
**Duration:** 6.4s
- [FAIL] TC-02: The Client Type dropdown offers exactly the eight selectable types

**Error:**
```
Error: BUG-LB-007: Sole Proprietor (Individual) is filtered out of the New Lead Client Type dropdown although it remains in the ClientType reference list

[2mexpect([22m[31mreceived[39m[2m).[22mtoContain[2m([22m[32mexpected[39m[2m) // indexOf[22m

Expected value: [32m"Sole Proprietor (Individual)"[39m
Received array: [31m["Individual (Individual)", "Close Corporation (Entity)", "Co-Operative (Entity)", "Listed Company (Entity)", "Trust", "NGO", "Partnership", "Private Company"][39m

  325 |           'dropdown although it remains in the ClientType reference list'
  326 |       )
> 327 |       .toContain(SOLE_PROPRIETOR);
      |        ^
  328 |   });
  329 |
  330 |   // -------------------------------------------------------------------------
    at /Users/Sanele/Downloads/Autotesting/Test-ReportsHub/projects/land-bank/test-plans/leads/online-digital-channel-lead-capture.spec.ts:327:8
```
**Location:** /Users/Sanele/Downloads/Autotesting/Test-ReportsHub/projects/land-bank/test-plans/leads/online-digital-channel-lead-capture.spec.ts:327:8

### TC-03: Individual (Individual) — Entity Name not captured
**Mode:** playwright-script
**Duration:** 9.4s
- [PASS] TC-03: Individual (Individual) — Entity Name not captured

### TC-04: Close Corporation (Entity) — Entity Name required
**Mode:** playwright-script
**Duration:** 10.2s
- [PASS] TC-04: Close Corporation (Entity) — Entity Name required

### TC-05: Co-Operative (Entity) — Entity Name required
**Mode:** playwright-script
**Duration:** 10.0s
- [PASS] TC-05: Co-Operative (Entity) — Entity Name required

### TC-06: Listed Company (Entity) — Entity Name required
**Mode:** playwright-script
**Duration:** 9.1s
- [PASS] TC-06: Listed Company (Entity) — Entity Name required

### TC-07: Trust — Entity Name optional
**Mode:** playwright-script
**Duration:** 10.4s
- [PASS] TC-07: Trust — Entity Name optional

### TC-08: NGO — Entity Name optional
**Mode:** playwright-script
**Duration:** 9.4s
- [PASS] TC-08: NGO — Entity Name optional

### TC-09: Partnership — Entity Name optional
**Mode:** playwright-script
**Duration:** 9.9s
- [PASS] TC-09: Partnership — Entity Name optional

### TC-10: Private Company — Entity Name optional
**Mode:** playwright-script
**Duration:** 11.5s
- [PASS] TC-10: Private Company — Entity Name optional

### TC-11: The field matrix holds across every client type, and Save is never gated
**Mode:** playwright-script
**Duration:** 14.5s
- [PASS] TC-11: The field matrix holds across every client type, and Save is never gated

### TC-12: An online-captured lead leaves its consent stage outstanding in the workflow
**Mode:** playwright-script
**Duration:** 12.2s
- [PASS] TC-12: An online-captured lead leaves its consent stage outstanding in the workflow

### TC-13: Entity Name persists on the saved lead although the details page never shows it
**Mode:** playwright-script
**Duration:** 5.8s
- [PASS] TC-13: Entity Name persists on the saved lead although the details page never shows it
