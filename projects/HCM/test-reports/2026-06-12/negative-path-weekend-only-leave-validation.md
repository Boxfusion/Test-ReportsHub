# Report: eLeave — Negative Path: Weekend-Only Leave Blocked at Capture

**Date:** 2026-06-12 13:21 UTC
**Plan:** test-plans/eLeave/capture-new-leave-application.md (Negative path — validation guard variant)
**Spec:** _none — live MCP-driven execution (no paired .spec.ts)_
**Execution Mode:** mcp-live
**Result:** PASSED (system correctly prevented submission)
**Duration:** ~4 min (13:17–13:21 UTC)
**Ref No:** LA2026/12973 (draft — never submitted)

## Scenario
Apply for **Annual Leave from Sat 20 June 2026 to Sun 21 June 2026** as **Thabo Musa Victor Mthembu (GOV003)** — a period that contains **only weekend days** (0 working days). Expected: the system must **not allow submission**. This targets the Apply (capture) step only — no approval chain.

| App | URL | Environment |
|-----|-----|-------------|
| HCM Admin Portal | https://pd-hcm-adminportal-qa.shesha.app/ | QA |

## Summary
| Total Steps | Passed | Failed | Skipped |
|-------------|--------|--------|---------|
| 1 | 1 | 0 | 0 |

## Step Results

### NEG-06: Weekend-only date range is blocked at capture (Thabo, GOV003)
**ADO suite:** _none — validation guard, no ADO test case_ · **Mode:** mcp-live
- [PASS] Login as GOV003 (Thabo); view mode → Latest; Create New → SaGov Leave Application (draft **LA2026/12973**)
- [PASS] Category = **Annual Leave** → Sub-Category = **Annual Leave** → Duration = **Days**
- [PASS] Start **20/06/2026** (Saturday) / End **21/06/2026** (Sunday) — pure weekend, 0 working days
- [PASS] **Inline validation error appeared immediately on date selection:** *"Please make sure that the days entered are working days. The selected period contains only weekends or public holidays."* (No "X day off" confirmation banner — unlike a valid range.)
- [PASS] Completed all other required fields (Address, Supporting document, certification checkbox) to give the form every chance to submit
- [PASS] **Submit was disabled until certification was ticked; after ticking it became clickable, but clicking Submit did NOT submit** — the form re-validated, surfaced the same error a second time at the **top of the form**, and stayed on the capture screen
- [PASS] **No workflow instance created/routed:** no Delegate dialog, no redirect to My Items, no Recommender/Approver routing. Draft LA2026/12973 remained unsubmitted.

## Expected vs Actual
| | |
|---|---|
| **Expected** | System rejects a leave whose entire range falls on weekends/public holidays; submission blocked. |
| **Actual** | ✅ Matches. Validation fires inline on date pick AND again on Submit; the application cannot be submitted. |

## Notes
- **Guard message:** "Please make sure that the days entered are working days. The selected period contains only weekends or public holidays." — fires for a range containing **only** non-working days.
- **Two enforcement points observed:** (1) inline field validation as soon as the weekend range is selected; (2) a top-of-form validation summary on Submit click. The Submit button itself is not permanently disabled once certification is ticked, but the click is intercepted by validation — submission never proceeds.
- **20 Jun 2026 = Saturday, 21 Jun 2026 = Sunday** (note: 16 Jun Youth Day is also a public holiday in this config, consistent with the "weekends or public holidays" wording).
- This is part of the broader **Negative path** suite (validation/business-rule guards). Complements the rejection-branch cases from 2026-06-11.
- No defects observed. Browser closed after the run.
