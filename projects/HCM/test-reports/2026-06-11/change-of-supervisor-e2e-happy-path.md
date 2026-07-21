# Report: SaGov Change of Supervisor End-to-End Happy Path

**Date:** 2026-06-11 09:11 UTC
**Plan:** _ad-hoc — SaGov Change of Supervisor Workflow (no markdown plan yet)_
**Spec:** _none — live MCP-driven execution (no paired .spec.ts)_
**Execution Mode:** mcp-live
**Result:** PASSED
**Duration:** ~13 min (08:58–09:11 UTC)
**Ref No:** SC2026/09274

## Scenario
Change **Nthabiseng Magoma's** supervisor from her current supervisor **Naledi Khumalo (HOD Infrastructure)** to **Kavitha Naidoo (Infra Manager)**, and carry the request through its full multi-party approval chain to completion.

| App | URL | Environment |
|-----|-----|-------------|
| HCM Admin Portal | https://pd-hcm-adminportal-qa.shesha.app/ | QA |

## Summary
| Total Steps | Passed | Failed | Skipped |
|-------------|--------|--------|---------|
| 5 | 5 | 0 | 0 |

## Step Results

### TC-01: Initiate Request (Nthabiseng Magoma, NthabisengM — applicant)
**Mode:** mcp-live
- [PASS] Login as NthabisengM (account header v14 — no Live→Latest toggle; ran against published config)
- [PASS] My Items → Create New → **SaGov Change of Supervisor Workflow** (Ref No **SC2026/09274**; form `sagov-change-of-supervisor-draft v33`)
- [PASS] Applying for = **Myself**; PERSAL 78787878; **Proposed Supervisor = Infra Manager-1-(Kavitha Naidoo)** (typeahead search "Kavitha"); Organisation Unit auto-filled **Infrastructure**
- [PASS] Attached `supporting-doc.txt` (optional — no asterisk); **Submit** → request **In Progress** (no Delegate dialog for this workflow)
- [PASS] Routing preview: Original = Supervisor Naledi Khumalo; Proposed = Supervisor Kavitha Naidoo / Org Unit Infrastructure

### TC-02: Old Supervisor Approval (Naledi weeeee Khumalo, GOV022)
**Mode:** mcp-live
- [PASS] Routed first to the **Old Supervisor** (current supervisor); login GOV022 (view mode → Latest); Inbox → SC2026/09274, Action = **Old Supervisor**
- [PASS] Approve form (`sagov-change-of-supervisor-approve v31`); options **Not Approved / Approved** (no attachment/acknowledge gating)
- [PASS] **Approved** → routed to the new/proposed supervisor

### TC-03: New Supervisor Approval (Kavitha Naidoo, GOV012)
**Mode:** mcp-live
- [PASS] Login GOV012 (view mode → Latest); Inbox → SC2026/09274, Action = **New Supervisor**
- [PASS] Approve form (`sagov-change-of-supervisor2-approve v29`); options **Not Approve / Approve**
- [PASS] **Approve** → routed to HR

### TC-04: HR Approve (Andrew Smith, GOV005 — HR)
**Mode:** mcp-live
- [PASS] HR Approve step assigned to **Andrew Smith / Sarah Johnson**; login GOV005 (Andrew Smith) (view mode → Latest); Inbox → SC2026/09274, Action = **HR Approve**
- [PASS] Approve form (`sagov-change-of-supervisor-hr-approve v29`); options **Not Approve / Approve**
- [PASS] **Approve** → routed back to the applicant for the final update step

### TC-05: Update Supervisor / Routing Updated (Nthabiseng Magoma — applicant)
**Mode:** mcp-live
- [PASS] Final step **Update Supervisor** routed **back to the applicant**; login NthabisengM; Inbox → SC2026/09274, Action = **Update Supervisor**
- [PASS] Form `sagov-change-of-supervisor-update v30`, single action **Routing Updated**
- [PASS] **Routing Updated** → request status **Completed** (5/5). Nthabiseng's reporting line now: Supervisor = **Kavitha Naidoo**, Org Unit = Infrastructure

## Notes
- **5-party approval chain:** Initiate (applicant) → **Old Supervisor** (current = Naledi) → **New Supervisor** (proposed = Kavitha) → **HR Approve** (Andrew Smith / Sarah Johnson) → **Update Supervisor** (back to applicant, "Routing Updated") → **Completed**. Distinct sub-forms per step (`-draft` → `-approve` → `2-approve` → `-hr-approve` → `-update`).
- **No Delegate dialog** on submit (unlike SaGov Leave Application), and **no attachment-download / acknowledge-checkbox gating** on any approval step — action buttons are enabled on load.
- **Proposed Supervisor** field is a typeahead (search by name); selecting it auto-populates the **Organisation Unit** (Infrastructure).
- Ref prefix for this workflow = **`SC`** (e.g. SC2026/09274); leave apps use `LA`, leave cancellations `LC:`.
- Each step had a 2-business-day SLA / 15/06/2026 target. Hovering a progress dot reveals the step name + current assignee + received/target dates.
- No defects observed. Browser closed after the run.
