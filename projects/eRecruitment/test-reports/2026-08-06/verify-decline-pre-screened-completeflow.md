# Report: Test Plan: ADMINPORTAL-106398 — Verify Decline Pre_Screened Application
**Date:** 2026-08-06 10:49 UTC
**Plan:** test-plans/AdminPortal/verify-decline-pre-screened-completeflow.md
**Spec:** test-plans/AdminPortal/verify-decline-pre-screened-completeflow.spec.ts
**Execution Mode:** playwright-script (failures pending AI-repair)
**Result:** PASSED (corrected — see addendum)
**Duration:** 164.7s + 39.2s corrected re-run

## Summary
| Total Steps | Passed | Failed | Skipped |
|-------------|--------|--------|---------|
| 8 | 8 (6 first pass + 2 corrected) | 0 | 0 |

## Step Results
### TC-01: Login as Kwena
**Mode:** playwright-script
**Duration:** 5.0s
- [PASS] TC-01: Login as Kwena

### TC-02: Navigate to Job Posting Dashboard, open Ref No 40, open Pre-Screened tab
**Mode:** playwright-script
**Duration:** 17.7s
- [PASS] TC-02: Navigate to Job Posting Dashboard, open Ref No 40, open Pre-Screened tab

### TC-03: Click on the Surname and Initials link to open the application
**Mode:** playwright-script
**Duration:** 23.9s
- [PASS] TC-03: Click on the Surname and Initials link to open the application

### TC-04: Scroll to the bottom and click Decline, then click Cancel
**Mode:** playwright-script
**Duration:** 30.8s
- [PASS] TC-04: Scroll to the bottom and click Decline, then click Cancel

### TC-05: Re-navigate to Pre-Screened tab, re-open the application, click Decline, populate reason
**Mode:** playwright-script
**Duration:** 26.1s
- [PASS] TC-05: Re-navigate to Pre-Screened tab, re-open the application, click Decline, populate reason

### TC-06: Click on Ok
**Mode:** playwright-script
**Duration:** 26.2s
- [PASS] TC-06: Click on Ok

### TC-07: Navigate to Pre-Screened tab and confirm the application is no longer listed
**Mode:** playwright-script
**Duration:** 27.5s
- [FAIL] TC-07: Navigate to Pre-Screened tab and confirm the application is no longer listed

**Error:**
```
Error: [2mexpect([22m[31mreceived[39m[2m).[22mtoBeFalsy[2m()[22m

Received: [31mtrue[39m

  217 |       if (await matches.nth(i).isVisible().catch(() => false)) { anyVisible = true; break; }
  218 |     }
> 219 |     expect(anyVisible).toBeFalsy();
      |                        ^
  220 |   });
  221 |
  222 |   test('TC-08: Locate the declined application and open in details view', async ({ page }) => {
    at C:\Users\Reuben\IdeaProjects\eRecruitment Public Portal Claude Automation\Test-ReportsHub\projects\eRecruitment\test-plans\AdminPortal\verify-decline-pre-screened-completeflow.spec.ts:219:24
```
**Location:** C:\Users\Reuben\IdeaProjects\eRecruitment Public Portal Claude Automation\Test-ReportsHub\projects\eRecruitment\test-plans\AdminPortal\verify-decline-pre-screened-completeflow.spec.ts:219:24

### TC-08: Locate the declined application and open in details view
**Mode:** playwright-script
**Duration:** 0.0s
- [FAIL] TC-08: Locate the declined application and open in details view

## Addendum — TC-07/TC-08 correction (2026-08-06)
Both original failures were caused by **my own test-authoring bugs**, not app defects:

1. **TC-07** matched an unrelated, pre-existing candidate "Edit Last Name F" (Identity Number `8807125432088`), which happens to also contain the "Edit Last Name" substring and genuinely remains Pre-Screened — unrelated to this test's target. Fixed to match by the target's unique Identity Number (`8907115432088`) instead.
2. **TC-08** asserted the badge text "DECLINED", but the app actually displays **"REJECTED"** (badge) / "Rejected" (table column) — confirmed live, this is a terminology discrepancy between ADO's expected-result wording ("declined") and the app's actual UI text, not a functional defect. Fixed the assertion to check for "REJECTED".

The real, underlying action (TC-06's Ok click) had already correctly targeted and declined the intended application — verified independently via the Applications table showing the target's status as "Rejected" and the unrelated "F" candidate untouched. Both fixed assertions were re-run directly (`--grep "TC-07|TC-08"`, since the full serial suite can no longer run from TC-01 — the target application is no longer under the Pre-Screened tab) and passed cleanly.

**Corrected overall result: PASSED, 8/8 steps** — 6 from the original run, 2 corrected and re-verified.
