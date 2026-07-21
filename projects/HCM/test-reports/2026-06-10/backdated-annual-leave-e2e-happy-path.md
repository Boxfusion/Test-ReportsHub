# Report: eLeave — Backdated Annual Leave End-to-End Happy Path

**Date:** 2026-06-10 07:01 UTC
**Plan:** test-plans/eLeave/capture-new-leave-application.md (+ Recommend/Approve chain)
**Spec:** _none — live MCP-driven execution (no paired .spec.ts)_
**Execution Mode:** mcp-live (headed)
**Result:** PASSED
**Duration:** ~12 min (06:39–07:01 UTC)
**Ref No:** LA2026/12731
**ADO Plan:** eLeave Smoke test (#101528) — suites: Application for leave (#101941), Recommend Leave (#101970), Approve leave (#101991)

## Scenario
Apply for a **backdated 1-day Annual Leave** for **3 June 2026** (today is 10 June, so the date is in the past) and carry it through the full approval chain. Because the leave is backdated, each commit step is expected to prompt a **Backdated Leave** comments dialog.

| App | URL | Environment |
|-----|-----|-------------|
| HCM Admin Portal | https://pd-hcm-adminportal-qa.shesha.app/ | QA |

## Summary
| Total Steps | Passed | Failed | Skipped |
|-------------|--------|--------|---------|
| 3 | 3 | 0 | 0 |

## Step Results

### TC-01: Apply — Capture Backdated Annual Leave (Thabo Musa Victor Mthembu, GOV003)
**ADO suite:** Application for leave (#101941) · **Mode:** mcp-live
- [PASS] Workflows → My Items → Create New → SaGov Leave Application (Ref No LA2026/12731)
- [PASS] Category = Annual Leave, Sub-Category = Annual Leave, Duration = Days
- [PASS] Start 03/06/2026, End 03/06/2026 → app confirmed **"Great!: You have selected to take 1 day off"** (55 days available)
- [PASS] Address captured, supporting document (`supporting-doc.txt`) attached
- [PASS] Certification ticked → Submit → **Backdated Leave Application** dialog → provided comments → OK
- [PASS] Delegate modal → Don't Delegate → toast "Successfully submitted the leave" → status **In Progress**

### TC-02: Recommend (Kavitha Naidoo, GOV012 — Infra Manager)
**ADO suite:** Recommend Leave (#101970) · **Mode:** mcp-live
- [PASS] Workflows → Inbox → opened LA2026/12731 (Action Required: Recommend Leave)
- [PASS] Downloaded attachment + ticked "I acknowledge…" (action buttons gated until both done)
- [PASS] Recommend page confirmed **"…has taken 1 day off"**, 54 days left, applicant comment + doc visible
- [PASS] **Recommend** → **BackDated Leave** comments dialog → provided comments → OK → item left Kavitha's inbox

### TC-03: Approve with Full Pay (Naledi Khumalo, GOV022 — HOD Infrastructure)
**ADO suite:** Approve leave (#101991) · **Mode:** mcp-live
- [PASS] Inbox → opened LA2026/12731 (Action Required: Approve Leave; received from Kavitha)
- [PASS] Downloaded attachment + ticked acknowledge; applicant + recommender comments visible
- [PASS] **Approve with Full Pay** → **Backdated Leave Comments** dialog → provided comments → OK → item left Naledi's inbox
- ℹ️ **Generate PERSAL Input (system step — NOT a verified test case):** on approval the system auto-created the PERSAL transaction (`Create Transaction | 50/500 | 03/06/2026 00:00 → 03/06/2026 00:00 | no errors`) and moved the item to status **GENERATE PERSALINPUT** (3/4 progress). There is **no DevOps test case for this step in plan #101528**; the actual Completed transition is a backend PERSAL push. Reported as information only — not counted as a passed step.

## Notes
- Duration shown correctly as **1 day** at every stage (single working day, Wed 03 Jun 26).
- **Backdated handling verified:** a dedicated comments dialog appeared at each commit step (Apply, Recommend, Approve) — the distinguishing behaviour of past-dated applications vs the standard happy path.
- Routing matched the form preview: Recommender Kavitha Naidoo → Approver Naledi Khumalo.
- All three comment sets (Applicant / Recommender / Approver) persisted on the final Leave Application Details view.
- "Generate PERSAL Input" exists in ADO only as separate, non-happy-path cases (#102194/#102185 [TC-006], #102195 [TC-007], #102196 [TC-008 Awaiting PERSAL Output]) — not part of the eLeave Smoke test happy-path suite.
- No defects observed. Run executed headed throughout.
