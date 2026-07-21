# Report: eLeave — Backdated Annual Leave End-to-End Happy Path

**Date:** 2026-06-12 13:05 UTC
**Plan:** test-plans/eLeave/capture-new-leave-application.md (+ Recommend/Approve chain — Backdated Leave variant)
**Spec:** _none — live MCP-driven execution (no paired .spec.ts)_
**Execution Mode:** mcp-live
**Result:** PASSED
**Duration:** ~8 min (12:57–13:05 UTC)
**Ref No:** LA2026/12959
**ADO Plan:** eLeave Smoke test (#101528) — suites: Application for leave (#101941), Recommend Leave (#101970), Approve leave (#101991)

## Scenario
Apply for **1 day Annual Leave on Fri 05 June 2026** as **Thabo Musa Victor Mthembu (GOV003)** — a **backdated** application (captured 12 June for leave dated 05 June) — and carry it through the full approval chain with **Approve with Full Pay**. Goal: exercise and capture the **Backdated Leave comments dialogs** that fire at each user step on a past-dated leave. Approver chose Full Pay (standard happy path).

| App | URL | Environment |
|-----|-----|-------------|
| HCM Admin Portal | https://pd-hcm-adminportal-qa.shesha.app/ | QA |

## Summary
| Total Steps | Passed | Failed | Skipped |
|-------------|--------|--------|---------|
| 3 | 3 | 0 | 0 |

## Step Results

### TC-01: Apply — Capture Backdated Annual Leave (Thabo, GOV003)
**ADO suite:** Application for leave (#101941) · **Mode:** mcp-live
- [PASS] Login as GOV003 (Thabo); view mode → Latest
- [PASS] Workflows → My Items → Create New → SaGov Leave Application (Ref No **LA2026/12959**)
- [PASS] Category = **Annual Leave** → Sub-Category = **Annual Leave** → Duration = **Days**
- [PASS] Start **05/06/2026** / End **05/06/2026** → app confirmed **"You have selected to take 1 day off"**; balance 51.6 days
- [PASS] Address captured; Supporting documents — `supporting-doc.txt` (122 B) attached; certification ticked → **Submit**
- [PASS] **Backdated Leave Application dialog fired at Submit** (form `draft-backdated-comments v11`): "You are about to submit a backdated leave application. Please provide comments." → entered comment → OK
- [PASS] **Delegate** modal → Don't Delegate → status **In Progress**

### TC-02: Recommend (Kavitha Naidoo, GOV012 — Infra Manager)
**ADO suite:** Recommend Leave (#101970) · **Mode:** mcp-live
- [PASS] Login as GOV012 (view mode → Latest); Inbox → opened LA2026/12959 (Action: Recommend Leave)
- [PASS] Recommend screen showed the applicant's backdated comment under **"Applicant Comment(s)"**
- [PASS] Downloaded attachment + ticked "I acknowledge…" → **Recommend** enabled → Recommend
- [PASS] **BackDated Leave dialog fired at Recommend** (form `backdated-comments v22`): "You are about to recommend a backdated leave. Please provide comments" (OK gated until comment entered) → entered comment → OK → item routed to approver

### TC-03: Approve with Full Pay (Naledi weeeee Khumalo, GOV022 — HOD Infrastructure)
**ADO suite:** Approve leave (#101991) · **Mode:** mcp-live
- [PASS] Login as GOV022 (view mode → Latest); Inbox → opened LA2026/12959 (Action: Approve Leave; received from Kavitha)
- [PASS] Approve screen showed both **Applicant Comments** and **Recommender Comments**
- [PASS] Offered Not Approve / Approve without Pay / Approve with Full Pay — gated until attachment downloaded + acknowledge ticked
- [PASS] **Approve with Full Pay** → **Backdated Leave Comments dialog fired at Approve** (OK gated until comment entered) → entered comment → OK
- [PASS] Status → **Generate PERSALinput**; item left Naledi's inbox
- ℹ️ **Generate PERSAL Input (system step — NOT a verified test case):** on approval the item moved to status **Generate PERSALinput** (auto). No DevOps test case for this step in plan #101528 — reported as information only.

## Final State (Audit Trail — LA2026/12959)
1. New Leave Application — **Submit** — Thabo Musa Victor Mthembu ✓
2. Recommend Leave — **Recommended** — Kavitha Naidoo ✓
3. Approve Leave — **Approved With Full Pay** — Naledi Khumalo ✓
4. Generate PERSAL Input — **Active** (automatic system step)

## Notes
- **Backdated-leave comments fire at EVERY user step**, each with its own form: Apply = `draft-backdated-comments v11` ("submit a backdated leave application"), Recommend = `backdated-comments v22` ("recommend a backdated leave"), Approve = same "Backdated Leave Comments" prompt. At Apply the OK was enabled immediately; at Recommend and Approve the OK was **gated until a comment was entered**. (The Approve dialog reuses the "recommend a backdated leave" wording — minor copy bug, not blocking.)
- **Comments propagate down the chain:** the applicant's backdated comment shows to the recommender as "Applicant Comment(s)"; both applicant + recommender comments show to the approver. All are recorded in the Audit Trail.
- **No functional difference in the outcome** vs a future-dated Annual Leave: full-pay path ends at **Generate PERSALinput**; the only behavioural delta is the extra backdated-comment dialog at each step.
- **5 June 2026 is a working day (Friday)** → counted as 1 day; the date being in the past did not block any step.
- **Per-run rituals honoured:** view mode switched Live→Latest after each login (Thabo, Kavitha, Naledi); browser closed after the run.
- No defects observed.
