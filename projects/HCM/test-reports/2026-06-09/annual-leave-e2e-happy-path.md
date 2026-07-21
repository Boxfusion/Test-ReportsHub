# Report: eLeave — Annual Leave End-to-End Happy Path

**Date:** 2026-06-09 12:41 UTC
**Plan:** test-plans/eLeave/capture-new-leave-application.md (+ Recommend/Approve chain)
**Spec:** _none — live MCP-driven execution (no paired .spec.ts)_
**Execution Mode:** mcp-live (headed)
**Result:** PASSED
**Duration:** ~10 min (12:30–12:41 UTC)
**Ref No:** LA2026/12721
**ADO Plan:** eLeave Smoke test (#101528) — suites: Application for leave (#101941), Recommend Leave (#101970), Approve leave (#101991)

## Scenario
Apply for Annual Leave for **12 June 2026 → 15 June 2026** (range spanning a weekend; expected to count as **2 working days**) and carry it through the approval chain.

| App | URL | Environment |
|-----|-----|-------------|
| HCM Admin Portal | https://pd-hcm-adminportal-qa.shesha.app/ | QA |

## Summary
| Total Steps | Passed | Failed | Skipped |
|-------------|--------|--------|---------|
| 3 | 3 | 0 | 0 |

## Step Results

### TC-01: Apply — Capture Annual Leave (Thabo Musa Victor Mthembu, GOV003)
**ADO suite:** Application for leave (#101941) · **Mode:** mcp-live
- [PASS] Workflows → My Items → Create New → SaGov Leave Application
- [PASS] Category = Annual Leave, Sub-Category = Annual Leave, Duration = Days
- [PASS] Start 12/06/2026, End 15/06/2026 → app confirmed **"Great! You have selected to take 2 day off"** (weekend excluded)
- [PASS] Address captured, supporting document attached
- [PASS] Certification ticked → Submit → Delegate modal → Don't Delegate → status **In Progress**

### TC-02: Recommend (Kavitha Naidoo, GOV012 — Infra Manager)
**ADO suite:** Recommend Leave (#101970) · **Mode:** mcp-live
- [PASS] Workflows → Inbox → opened LA2026/12721 (Action Required: Recommend Leave)
- [PASS] Downloaded attachment + ticked "I acknowledge…" (action buttons gated until both done)
- [PASS] **Recommend** → item left Kavitha's inbox

### TC-03: Approve with Full Pay (Naledi Khumalo, GOV022 — HOD Infrastructure)
**ADO suite:** Approve leave (#101991) · **Mode:** mcp-live
- [PASS] Inbox → opened LA2026/12721 (Action Required: Approve Leave; received from Kavitha)
- [PASS] Downloaded attachment + ticked acknowledge
- [PASS] **Approve with Full Pay** → item left Naledi's inbox
- ℹ️ **Generate PERSAL Input (system step — NOT a verified test case):** on approval the system auto-created the PERSAL transaction (`Create Transaction | 50/500 | 12/06→15/06 | no errors`) and moved the item to status **GENERATE PERSALINPUT**. There is **no DevOps test case for this step in plan #101528**; the actual Completed transition is a backend PERSAL push. Reported as information only — not counted as a passed step.

## Notes
- Duration shown correctly as **2 days** at every stage (Fri 12 + Mon 15; Sat/Sun excluded).
- Routing matched the form preview: Recommender Kavitha Naidoo → Approver Naledi Khumalo.
- "Generate PERSAL Input" exists in ADO only as separate, non-happy-path cases (#102194/#102185 [TC-006], #102195 [TC-007], #102196 [TC-008 Awaiting PERSAL Output]) — not part of the eLeave Smoke test happy-path suite.
- No defects observed. Run executed headed throughout.
- Allure report: `projects/HCM/allure-report--annual-leave-e2e/index.html` (3 TCs).
