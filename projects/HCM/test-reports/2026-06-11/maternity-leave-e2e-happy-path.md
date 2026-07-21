# Report: eLeave — Maternity Leave End-to-End Happy Path

**Date:** 2026-06-11 07:09 UTC
**Plan:** test-plans/eLeave/capture-new-leave-application.md (+ Recommend/Approve chain — Maternity Leave variant)
**Spec:** _none — live MCP-driven execution (no paired .spec.ts)_
**Execution Mode:** mcp-live
**Result:** PASSED
**Duration:** ~8 min (07:01–07:09 UTC)
**Ref No:** LA2026/12874
**ADO Plan:** eLeave Smoke test (#101528) — suites: Application for leave (#101941), Recommend Leave (#101970), Approve leave (#101991)

## Scenario
Apply for **Maternity Leave** starting **Tue 01 September 2026** as **Priya Maharaj (username `12345678`)**, and carry it through the full approval chain. Maternity uses a single Start Date; the **End Date auto-calculates** a fixed ~4-month block (01/09/2026 → 31/12/2026 = **122 days**). Future-dated → **no backdated comments dialogs** expected. This run also resolved yesterday's Maternity blocker (see Notes).

| App | URL | Environment |
|-----|-----|-------------|
| HCM Admin Portal | https://pd-hcm-adminportal-qa.shesha.app/ | QA |

## Summary
| Total Steps | Passed | Failed | Skipped |
|-------------|--------|--------|---------|
| 3 | 3 | 0 | 0 |

## Step Results

### TC-01: Apply — Capture Maternity Leave (Priya Maharaj, `12345678`)
**ADO suite:** Application for leave (#101941) · **Mode:** mcp-live
- [PASS] Login as `12345678` (Priya Maharaj). _Note: this account's header (v14) has no Live→Latest view-mode toggle — proceeded against published config._
- [PASS] Workflows → My Items → Create New → SaGov Leave Application (Ref No **LA2026/12874**)
- [PASS] Category = **Maternity Leave** → **Sub-Category** appeared (required) = **Maternity Leave** (single option)
- [PASS] Start **01/09/2026** → End **31/12/2026** auto-calculated & read-only → app confirmed **"You have selected to take 122 day off"**; no Days/Hours duration radio, no certification checkbox
- [PASS] Informational warning shown: **"Available days: … 0 day(s) left for this particular leave type"** — non-blocking (see Notes)
- [PASS] Address captured; Supporting documents — `supporting-doc.txt` (122 B) attached
- [PASS] **Submit** → **Delegate** modal → Don't Delegate → status **In Progress** (no backdated dialog — future date)

### TC-02: Recommend (Kavitha Naidoo, GOV012 — Infra Manager)
**ADO suite:** Recommend Leave (#101970) · **Mode:** mcp-live
- [PASS] Item routed **straight to the recommender** (no applicant Verify Attachments step — unlike Adoption Leave). Confirmed applicant's own Inbox held no maternity task.
- [PASS] Login as GOV012 (view mode → Latest); Inbox → opened LA2026/12874 (Action: Recommend Leave)
- [PASS] Downloaded attachment + ticked "I acknowledge…" → **Recommend** enabled
- [PASS] **Recommend** → item left Kavitha's inbox (no backdated dialog — future date)

### TC-03: Approve with Full Pay (Naledi weeeee Khumalo, GOV022 — HOD Infrastructure)
**ADO suite:** Approve leave (#101991) · **Mode:** mcp-live
- [PASS] Login as GOV022 (view mode → Latest); Inbox → opened LA2026/12874 (Action: Approve Leave; received from Kavitha)
- [PASS] Offered Not Approve / Approve without Pay / Approve with Full Pay; gated until attachment downloaded + acknowledge ticked
- [PASS] **Approve with Full Pay** → item left Naledi's inbox (no backdated dialog — future date)
- ℹ️ **Generate PERSAL Input (system step — NOT a verified test case):** on approval the system auto-created the PERSAL transaction (`Create Transaction | 55/ 550 | 01/09/2026 00:00 → 31/12/2026 00:00`, no errors) and moved the item to status **Generate PERSALinput**. No DevOps test case for this step in plan #101528 — reported as information only.

## Notes
- **Routing chain for Priya Maharaj:** Recommender **Kavitha Naidoo (GOV012)** → Approver **Naledi Khumalo (GOV022)** — same chain as the standard infrastructure flow (read off the on-form routing preview).
- **Maternity-specific form behaviour:** single Start Date; **End Date auto-calculated & read-only** as a fixed ~122-day (~4-month) block; **Sub-Category = Maternity Leave** (single option, required); **no Days/Hours radio; no certification checkbox** (Submit gates on the standard required fields only).
- **Maternity PERSAL code = `55/ 550`** (Annual Leave used `50/500`, Sick `57/571`) — type-specific transaction code.
- **0-balance is NOT a hard gate.** The form showed "0 day(s) left" / "0 day(s) available out of the maximum 0", yet Apply, Recommend, and Approve all completed and a PERSAL transaction was created. The balance warning is **informational only** for Maternity.
- **Yesterday's Maternity blocker resolved.** On 2026-06-10 Kavitha's maternity Submit silently failed (stayed Draft). Two candidate causes were open: (1) 0 maternity balance, (2) Kavitha's in-progress Change-of-Supervisor workflow. This run **disambiguates**: Priya *also* has 0 maternity balance but submitted successfully → the 0-balance was **not** the cause. Corroboration: Kavitha's "Old Approve Request to Change Supervisor" (Change of Supervisor Workflow) was observed still sitting in Naledi's inbox from 17/04/2026 — a competing active workflow is the likely cause of Kavitha's silent Submit failure.
- **No gender enforcement** (consistent with prior observation) — Maternity is gated by neither gender nor balance in the published config.
- No defects observed. Browser closed after the run.
