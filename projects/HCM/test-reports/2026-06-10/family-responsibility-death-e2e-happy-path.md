# Report: eLeave — Family Responsibility (Death) End-to-End Happy Path

**Date:** 2026-06-10 11:39 UTC
**Plan:** test-plans/eLeave/capture-new-leave-application.md (+ Recommend/Approve chain — Family Responsibility variant)
**Spec:** _none — live MCP-driven execution (no paired .spec.ts)_
**Execution Mode:** mcp-live (headed)
**Result:** PASSED
**Duration:** ~8 min (11:31–11:39 UTC)
**Ref No:** LA2026/12814
**ADO Plan:** eLeave Smoke test (#101528) — suites: Application for leave (#101941), Recommend Leave (#101970), Approve leave (#101991)

## Scenario
Apply for a **1-day Family Responsibility leave** for **Thu 18 June 2026** as **Thabo Musa Victor Mthembu (GOV003)**, with **Sub-Category = Family Responsibility (Death)** and **Family Relationship = Grandparents and in-laws** ("Death of Grandparents and in-laws"), and carry it through the full chain. The 18th is in the future → **no backdated comments dialogs** expected.

| App | URL | Environment |
|-----|-----|-------------|
| HCM Admin Portal | https://pd-hcm-adminportal-qa.shesha.app/ | QA |

## Summary
| Total Steps | Passed | Failed | Skipped |
|-------------|--------|--------|---------|
| 3 | 3 | 0 | 0 |

## Step Results

### TC-01: Apply — Capture Family Responsibility (Death) Leave (Thabo Musa Victor Mthembu, GOV003)
**ADO suite:** Application for leave (#101941) · **Mode:** mcp-live
- [PASS] Login as GOV003; view mode Latest
- [PASS] Workflows → My Items → Create New → SaGov Leave Application (Ref No **LA2026/12814**)
- [PASS] Category = **Family Rsponsibility** (app spelling) → Sub-Category = **Family Responsibility (Death)** (other options: Children with Special Needs, Sick)
- [PASS] **Family Relationship** dropdown appeared (required) → selected **Grandparents and in-laws** (options: Spouse, Children, Siblings, Parents and in-laws, Grandparents and in-laws, Adoptive parents, Step parents)
- [PASS] Start 18/06/2026, End 18/06/2026 → app confirmed **"You have selected to take 1 day off"** (99 days available); no Days/Hours duration radio
- [PASS] Address captured; **Supporting documents (required\*)** — `supporting-doc.txt` (122 B) attached
- [PASS] Certification checkbox ticked (gated Submit) → Submit → **Delegate** modal → Don't Delegate → status **In Progress** (no backdated dialog — future date)

### TC-02: Recommend (Kavitha Naidoo, GOV012 — Infra Manager)
**ADO suite:** Recommend Leave (#101970) · **Mode:** mcp-live
- [PASS] Item routed **straight to the recommender** (no applicant Verify Attachments step — unlike Adoption Leave)
- [PASS] Login as GOV012 (view mode Latest); Inbox → opened LA2026/12814 (Action: Recommend Leave)
- [PASS] Downloaded attachment + ticked "I acknowledge…" → **Recommend** enabled
- [PASS] **Recommend** → item left Kavitha's inbox (no backdated dialog — future date)

### TC-03: Approve with Full Pay (Naledi weeeee Khumalo, GOV022 — HOD Infrastructure)
**ADO suite:** Approve leave (#101991) · **Mode:** mcp-live
- [PASS] Login as GOV022 (view mode Latest); Inbox → opened LA2026/12814 (Action: Approve Leave; received from Kavitha)
- [PASS] Offered Not Approve / Approve without Pay / Approve with Full Pay; gated until attachment downloaded + acknowledge ticked
- [PASS] **Approve with Full Pay** → item left Naledi's inbox (no backdated dialog — future date)
- ℹ️ **Generate PERSAL Input (system step — NOT a verified test case):** on approval the system auto-created the PERSAL transaction (`Create Transaction | 57/571 | 18/06/2026 → 18/06/2026`) and moved the item to status **GENERATE PERSALINPUT** (3/4). No DevOps test case for this step in plan #101528 — reported as information only.

## Notes
- **Three-level cascade for Family Responsibility:** Category → Sub-Category (Death / Sick / Children with Special Needs) → **Family Relationship** (Spouse, Children, Siblings, Parents and in-laws, Grandparents and in-laws, Adoptive parents, Step parents). "Death of Grandparents and in-laws" = Sub-Category *Death* + Relationship *Grandparents and in-laws*.
- **Supporting documents is REQUIRED** for this type (asterisk), plus a **certification checkbox gates Submit** (like Annual Leave) — neither was required for Adoption/Sick capture.
- **No applicant Verify Attachments step** — routes straight to the recommender (unlike Adoption Leave, which inserts an applicant self-verify step).
- **No Days/Hours duration radio**; future-dated → no backdated comments dialogs at any commit step.
- Routing matched the standard chain: Recommender **Kavitha Naidoo** → Approver **Naledi Khumalo**.
- No defects observed. Run executed headed throughout; browser closed after the run.
