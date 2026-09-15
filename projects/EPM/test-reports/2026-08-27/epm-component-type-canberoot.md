# Report: EPM — Create a new Component Type with canBeRoot set for a non-leaf hierarchy level
**Date:** 2026-08-27 17:17 UTC
**Plan:** test-plans/hierarchy-definitions/epm-component-type-canberoot.md
**Spec:** test-plans/hierarchy-definitions/epm-component-type-canberoot.spec.ts
**Execution Mode:** playwright-script
**Result:** PASSED
**Duration:** 142.2s

## Summary
| Total Steps | Passed | Failed | Skipped |
|-------------|--------|--------|---------|
| 3 | 3 | 0 | 0 |

## Step Results
### TC-108777 Positive — Mark an Allowable Child Component Type as Root for a non-leaf hierarchy level
**Mode:** playwright-script
**Duration:** 21.1s
- [PASS] TC-108777 Positive — Mark an Allowable Child Component Type as Root for a non-leaf hierarchy level

### TC-108808 Negative — Reject creation of a leaf Component Type with canBeRoot set to true
**Mode:** playwright-script
**Duration:** 79.9s
- [PASS] TC-108808 Negative — Reject creation of a leaf Component Type with canBeRoot set to true

### TC-108810 Integration — Deleting a Component Type referenced by an Allowable Child Component Type junction is blocked
**Mode:** playwright-script
**Duration:** 39.5s
- [PASS] TC-108810 Integration — Deleting a Component Type referenced by an Allowable Child Component Type junction is blocked
