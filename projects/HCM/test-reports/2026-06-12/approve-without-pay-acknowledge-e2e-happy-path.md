# Report: eLeave — Approve Without Pay → Acknowledge Leave Without Pay End-to-End

**Date:** 2026-06-12 10:01 UTC
**Plan:** test-plans/eLeave/capture-new-leave-application.md (+ Recommend / Approve-without-Pay / Acknowledge chain — Approve Without Pay variant)
**Spec:** _none — live MCP-driven execution (no paired .spec.ts)_
**Execution Mode:** mcp-live
**Result:** PASSED
**Duration:** ~11 min (09:50–10:01 UTC)
**Ref No:** LA2026/12949
**ADO Plan:** eLeave Smoke test (#101528) — suites: Application for leave (#101941), Recommend Leave (#101970), Approve leave (#101991). _Acknowledge Leave Without Pay has no DevOps test case in #101528 — reported as an observed workflow step._

## Scenario
Apply for **1 day Annual Leave on Fri 19 June 2026** as **Thabo Musa Victor Mthembu (GOV003)** and carry it through the full chain, with the approver choosing **Approve without Pay** instead of Approve with Full Pay. The goal was to confirm that **Approve without Pay triggers an "Acknowledge Leave without pay" step**, identify who it routes to, and carry it to completion. Future-dated → no backdated-comments dialogs expected.

| App | URL | Environment |
|-----|-----|-------------|
| HCM Admin Portal | https://pd-hcm-adminportal-qa.shesha.app/ | QA |

## Summary
| Total Steps | Passed | Failed | Skipped |
|-------------|--------|--------|---------|
| 4 | 4 | 0 | 0 |V

## Step Results

### TC-01: Apply — Capture Annual Leave (Thabo, GOV003)
**ADO suite:** Application for leave (#101941) · **Mode:** mcp-live
- [PASS] Login as GOV003 (Thabo); view mode → Latest
- [PASS] Workflows → My Items → Create New → SaGov Leave Application (Ref No **LA2026/12949**)
- [PASS] Category = **Annual Leave** → Sub-Category = **Annual Leave** → Duration = **Days**
- [PASS] Start **19/06/2026** / End **19/06/2026** (AntD calendar pick) → app confirmed **"You have selected to take 1 day off"**
- [PASS] Address captured; Supporting documents — `supporting-doc.txt` (122 B) attached; certification checkbox ticked → **Submit**
- [PASS] **Delegate** modal → Don't Delegate → status **In Progress** (no backdated dialog — future date). Routing preview: Recommender Kavitha Naidoo → Approver Naledi Khumalo.

### TC-02: Recommend (Kavitha Naidoo, GOV012 — Infra Manager)
**ADO suite:** Recommend Leave (#101970) · **Mode:** mcp-live
- [PASS] Login as GOV012 (view mode → Latest); Inbox → opened LA2026/12949 (Action: Recommend Leave)
- [PASS] Downloaded attachment + ticked "I acknowledge…" → **Recommend** enabled
- [PASS] **Recommend** → item left Kavitha's inbox, routed to approver (no backdated dialog — future date)

### TC-03: Approve WITHOUT Pay (Naledi weeeee Khumalo, GOV022 — HOD Infrastructure)
**ADO suite:** Approve leave (#101991) · **Mode:** mcp-live
- [PASS] Login as GOV022 (view mode → Latest); Inbox → opened LA2026/12949 (Action: Approve Leave; received from Kavitha)
- [PASS] Approve buttons offered: Not Approve / **Approve without Pay** / Approve with Full Pay — all gated until attachment downloaded + acknowledge ticked
- [PASS] Clicked **Approve without Pay** → a dedicated **"Approve Without Pay"** dialog appeared requiring **Comments** (OK gated until comment entered)
- [PASS] Entered comment → OK → status moved to **Approved Without Pay**; item left Naledi's inbox
- ✅ **Approve without Pay triggers a new "Acknowledge Leave without pay" step** (confirmed via Audit Trail; see TC-04).

### TC-04: Acknowledge Leave Without Pay (Human Resources — Andrew Smith, GOV005)
**ADO suite:** _none in #101528 — observed workflow step_ · **Mode:** mcp-live
- [PASS] The Acknowledge step routed to the **Human Resources** role — NOT to the applicant. It did not appear in Thabo's inbox; it landed in HR user **Andrew Smith (GOV005)**'s inbox (Action: Acknowledge Leave without pay; status Approved Without Pay).
- [PASS] Login as GOV005 (view mode → Latest); opened the item. Confirmation checkbox text differs: **"I confirm that I have communicated with the applicant and the leave request may proceed for processing."**
- [PASS] Downloaded attachment + ticked confirm → **Submit** enabled → Submit → Decision **Acknowledged**
- [PASS] On acknowledge the leave was **reclassified to Sub-Category = Unpaid Leave Authorized**, then advanced to the automatic **Generate PERSAL Input** step (Active).

## Final State (Audit Trail — LA2026/12949)
1. New Leave Application — **Submit** — Thabo Musa Victor Mthembu ✓
2. Recommend Leave — **Recommended** — Kavitha Naidoo ✓
3. Approve Leave — **Approved without pay** — Naledi Khumalo ✓ (with comments)
4. Acknowledge Leave without pay — **Acknowledged** — received by Human Resources, completed by **Andrew Smith** ✓
5. Generate PERSAL Input — **Active** (automatic system step)

## Notes
- **Approve without Pay → Acknowledge Leave without pay → Generate PERSAL Input.** This is the key finding: the without-pay branch inserts an extra **Acknowledge Leave without pay** activity (form `SaGov.Leave/sagov-acknowledge-without-pay v50`) between Approve and Generate PERSAL Input. The Full-Pay path goes straight from Approve to Generate PERSAL Input with no acknowledge step.
- **Acknowledge step assignee = Human Resources (role), not the applicant.** That's why it never appeared in Thabo's inbox. On QA, HR resolves to **Andrew Smith (GOV005)** (also Sarah Johnson EMP001234 per the COS flow). The acknowledge confirmation is a communication attestation ("I confirm that I have communicated with the applicant…"), distinct from the reviewer/approver "I acknowledge I have reviewed…" wording.
- **Approve-without-Pay comments are mandatory.** The "Approve Without Pay" dialog's OK button stays disabled until a comment is supplied (same pattern as the decline dialogs).
- **Leave reclassified to "Unpaid Leave Authorized".** After acknowledge, the application's Sub-Category flipped from **Annual Leave → Unpaid Leave Authorized**; the calendar entry for the 19th relabels to "Unpaid Leave Authorized", and the balance panel switches to the unpaid-leave allowance (**15 of 15 days available for 2026**). The **Annual Leave balance was NOT debited** (still ~51.6 days) — the day is charged to authorised unpaid leave instead.
- **PERSAL transaction created with the unpaid code.** PERSAL Transactions table shows `Create Transaction | 3/ 26 | 19/06/2026 00:00 → 19/06/2026 00:00 | (no errors)`. Compare: Annual full-pay = `50/500`, Maternity = `55/550`, Sick = `57/571`; **Unpaid Leave Authorized = `3/26`**.
- **Approve-step gating (re-confirmed):** Not Approve / Approve without Pay / Approve with Full Pay are all disabled until the attachment is downloaded AND the acknowledge checkbox is ticked. Send Back is free. (Consistent with the negative-path gating-asymmetry observation.)
- **Per-run rituals honoured:** view mode switched Live→Latest after each login (Thabo, Kavitha, Naledi, Andrew); browser closed after the run.
- **`<TMV applicant load timing>` (not a bug):** on the Approve and Acknowledge screens the Applicant/Category/Sub-Category fields briefly render "unknown" before the data resolves on the Latest config — a load-timing artifact, values populated correctly within a second. No defects observed.
