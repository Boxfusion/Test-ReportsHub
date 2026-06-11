# Report: eLeave — Backdated Sick Leave End-to-End Happy Path

**Date:** 2026-06-10 10:04 UTC
**Plan:** test-plans/eLeave/capture-new-leave-application.md (+ Recommend/Approve chain — Sick Leave variant)
**Spec:** _none — live MCP-driven execution (no paired .spec.ts)_
**Execution Mode:** mcp-live (headed)
**Result:** PASSED
**Duration:** ~16 min (09:48–10:04 UTC)
**Ref No:** LA2026/12790
**ADO Plan:** eLeave Smoke test (#101528) — suites: Application for leave (#101941), Recommend Leave (#101970), Approve leave (#101991)

## Scenario
Apply for a **1-day Sick Leave** for **8 June 2026** as **Thabo Musa Victor Mthembu (GOV003)** and carry it through the full approval chain. Today is 10 June, so the date is in the past → a **backdated** application; each commit step (Apply, Recommend, Approve) is expected to prompt a Backdated Leave comments dialog.

> Date note: originally captured the 4th, then corrected mid-run to the **8th** per the user's instruction.

| App | URL | Environment |
|-----|-----|-------------|
| HCM Admin Portal | https://pd-hcm-adminportal-qa.shesha.app/ | QA |

## Summary
| Total Steps | Passed | Failed | Skipped |
|-------------|--------|--------|---------|
| 3 | 3 | 0 | 0 |

## Step Results

### TC-01: Apply — Capture Backdated Sick Leave (Thabo Musa Victor Mthembu, GOV003)
**ADO suite:** Application for leave (#101941) · **Mode:** mcp-live
- [PASS] Login as GOV003; switched view mode **Live → Latest** immediately after login
- [PASS] Workflows → My Items → Create New → SaGov Leave Application (Ref No **LA2026/12790**)
- [PASS] Category = **Sick Leave** → Sub-Category = **Sick Leave** (auto, single option)
- [PASS] Sick-leave sub-form (`Shesha.Leave/sick-leave-form v21`) → **Type of illness = Medical Conditions** (single option)
- [PASS] Start 08/06/2026, End 08/06/2026 → app confirmed **"Great!: You have selected to take 1 day off"** (23 days available)
- [PASS] Address captured; supporting document (`supporting-doc.txt`, 122 B) attached
- [PASS] Submit → **Backdated Leave Application** dialog → provided comments → OK
- [PASS] **Delegate** modal → Don't Delegate → returned to My Items; status **In Progress**

### TC-02: Recommend (Kavitha Naidoo, GOV012 — Infra Manager)
**ADO suite:** Recommend Leave (#101970) · **Mode:** mcp-live
- [PASS] Login as GOV012 (view mode already Latest); Workflows → Inbox → opened LA2026/12790 (Action Required: Recommend Leave)
- [PASS] Recommend page (`SaGov.Leave/sagov-recommend-leave-application v62`) confirmed **"…has taken 1 day off"**, 22 days left
- [PASS] Action buttons gated until attachment downloaded **and** "I acknowledge…" ticked — downloaded `supporting-doc.txt`, ticked acknowledge → **Recommend** enabled
- [PASS] **Recommend** → **BackDated Leave** comments dialog → provided comments → Ok → item left Kavitha's inbox

### TC-03: Approve with Full Pay (Naledi weeeee Khumalo, GOV022 — HOD Infrastructure)
**ADO suite:** Approve leave (#101991) · **Mode:** mcp-live
- [PASS] Login as GOV022 (view mode Latest); Inbox → opened LA2026/12790 (Action Required: Approve Leave; received from Kavitha)
- [PASS] Approve page offered **Not Approve / Approve without Pay / Approve with Full Pay**; buttons gated until attachment downloaded + acknowledge ticked
- [PASS] Downloaded attachment + ticked acknowledge → **Approve with Full Pay** enabled
- [PASS] **Approve with Full Pay** → **Backdated Leave Comments** dialog → provided comments → Ok → item left Naledi's inbox
- ℹ️ **Generate PERSAL Input (system step — NOT a verified test case):** on approval the system auto-created the PERSAL transaction (`Create Transaction | 08/06/2026 00:00 → 08/06/2026 00:00`) and moved the item to status **GENERATE PERSALINPUT** (3/4 progress). No DevOps test case for this step in plan #101528 — reported as information only, not counted as a passed step.

## Notes
- **No Duration (Days/Hours) radio for Sick Leave** — unlike Annual Leave, capture is date-range driven only, so the [Duration=Hours Submit-hidden bug](../bugs/2026-06-10-eleave-hours-submit-button-hidden.md) does not apply to this leave type.
- Sick Leave surfaces type-specific fields not present on Annual Leave: **Type of illness** (required), plus conditional **Type Of Verification / OTP / Consent Form / Attach a memo** (not required for the Myself + Medical Conditions path used here).
- Duration shown correctly as **1 day** at every stage (single working day, Mon 08 Jun 26).
- **Backdated handling verified:** a comments dialog appeared at each commit step (Apply → "Backdated Leave Application"; Recommend → "BackDated Leave"; Approve → "Backdated Leave Comments") — the distinguishing behaviour of past-dated applications.
- Routing matched the form preview: Recommender **Kavitha Naidoo** → Approver **Naledi Khumalo**.
- All three comment sets (Applicant / Recommender / Approver) persisted on the final Leave Application Details view.
- Recommend/Approve action buttons stay disabled until the attachment is downloaded **and** the acknowledge checkbox is ticked — gating verified at both steps.
- No defects observed. Run executed headed throughout; browser closed after the run.
