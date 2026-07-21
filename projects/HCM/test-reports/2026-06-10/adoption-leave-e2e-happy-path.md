# Report: eLeave — Adoption Leave End-to-End Happy Path

**Date:** 2026-06-10 11:04 UTC
**Plan:** test-plans/eLeave/capture-new-leave-application.md (+ Verify/Recommend/Approve chain — Adoption Leave variant)
**Spec:** _none — live MCP-driven execution (no paired .spec.ts)_
**Execution Mode:** mcp-live (headed)
**Result:** PASSED
**Duration:** ~25 min (10:38–11:04 UTC)
**Ref No:** LA2026/12806
**ADO Plan:** eLeave Smoke test (#101528) — suites: Application for leave (#101941), Recommend Leave (#101970), Approve leave (#101991)

## Scenario
Apply for a **1-day Adoption Leave** for **Wed 17 June 2026** as **Thabo Musa Victor Mthembu (GOV003)** and carry it through the full chain. The 17th is in the future, so **no backdated comments dialogs** are expected at any commit step.

> **Workflow difference discovered:** Adoption Leave inserts an extra **Verify Attachments** step that routes **back to the applicant (Thabo)** between Apply and Recommend — so after submit the item does NOT go straight to the recommender's inbox; it returns to the applicant's own inbox first.

| App | URL | Environment |
|-----|-----|-------------|
| HCM Admin Portal | https://pd-hcm-adminportal-qa.shesha.app/ | QA |

## Summary
| Total Steps | Passed | Failed | Skipped |
|-------------|--------|--------|---------|
| 4 | 4 | 0 | 0 |

## Step Results

### TC-01: Apply — Capture Adoption Leave (Thabo Musa Victor Mthembu, GOV003)
**ADO suite:** Application for leave (#101941) · **Mode:** mcp-live
- [PASS] Login as GOV003; view mode Latest
- [PASS] Workflows → My Items → Create New → SaGov Leave Application (Ref No **LA2026/12806**)
- [PASS] Category = **Adoption Leave** → Sub-Category = **Adoption Leave** (auto, single option); no Days/Hours duration radio
- [PASS] Start 17/06/2026, End 17/06/2026 → app confirmed **"You have selected to take 1 day off"** (100 days available)
- [PASS] Address captured; supporting document (`supporting-doc.txt`, 122 B) attached (no certification checkbox on capture for this type)
- [PASS] Submit → **Delegate** modal → Don't Delegate → status **In Progress** (no backdated dialog — future date)

### TC-02: Verify Attachments (Thabo Musa Victor Mthembu, GOV003 — applicant self-verify)
**ADO suite:** _none in plan #101528 — Adoption-Leave-specific workflow step_ · **Mode:** mcp-live
- [PASS] Item routed **back to the applicant's own** Workflows → Inbox as action **Verify Attachments** (NOT to the recommender)
- [PASS] Downloaded attachment (`supporting-doc.txt`) → **Verify** button enabled (no acknowledge checkbox on this step)
- [PASS] **Verify** → item routed onward to the Recommender (Kavitha)

### TC-03: Recommend (Kavitha Naidoo, GOV012 — Infra Manager)
**ADO suite:** Recommend Leave (#101970) · **Mode:** mcp-live
- [PASS] Login as GOV012 (view mode Latest); Inbox → opened LA2026/12806 (Action: Recommend Leave)
- [PASS] Downloaded attachment + ticked "I acknowledge…" → **Recommend** enabled
- [PASS] **Recommend** → item left Kavitha's inbox (no backdated dialog — future date)

### TC-04: Approve with Full Pay (Naledi weeeee Khumalo, GOV022 — HOD Infrastructure)
**ADO suite:** Approve leave (#101991) · **Mode:** mcp-live
- [PASS] Login as GOV022 (view mode Latest); Inbox → opened LA2026/12806 (Action: Approve Leave; received from Kavitha)
- [PASS] Offered Not Approve / Approve without Pay / Approve with Full Pay; gated until attachment downloaded + acknowledge ticked
- [PASS] **Approve with Full Pay** → item left Naledi's inbox (no backdated dialog — future date)
- ℹ️ **Generate PERSAL Input (system step — NOT a verified test case):** on approval the system auto-created the PERSAL transaction (`Create Transaction | 56/163 | 17/06/2026 → 17/06/2026`) and moved the item to status **GENERATE PERSALINPUT** (3/4). No DevOps test case for this step in plan #101528 — reported as information only.

## Notes
- **Adoption Leave has an extra applicant-side "Verify Attachments" step** between Apply and Recommend — the item returns to the applicant's own inbox after submit rather than going straight to the recommender. (Initially looked like an un-routed/stuck item until the applicant inbox was checked.) The Verify step gates on attachment download only (no acknowledge checkbox).
- **No Days/Hours duration radio** for Adoption Leave (date-range only); Sub-Category auto-fills; conditional Consent Form / Type Of Verification / OTP / Attach a memo fields present but not required for the Myself path.
- **Future-dated → no backdated comments dialogs** at any commit step (Apply, Verify, Recommend, Approve all committed straight through) — confirms the backdated dialog is triggered only by past/same-day dates.
- Routing matched the standard chain: Recommender **Kavitha Naidoo** → Approver **Naledi Khumalo**.
- Recommend/Approve action buttons stay disabled until attachment download + acknowledge tick — gating verified at both steps.
- No defects observed. Run executed headed throughout; browser closed after the run.
