# Report: eLeave / Workflows — Negative Path (Workflow Rejections)

**Date:** 2026-06-11 12:50 UTC
**Plan:** _ad-hoc — Negative path (workflow rejection branches)_
**Spec:** _none — live MCP-driven execution (no paired .spec.ts)_
**Execution Mode:** mcp-live
**Result:** PASSED (all rejection branches behaved as expected)
**Duration:** ~40 min (12:11–12:50 UTC)

## Scenario
Exercise the **rejection/decline branches** of the HCM workflows (the "Negative path") — every place a workflow can say *no* — and record where each one routes and the resulting terminal status. Applicant **Thabo (GOV003)** for leave; **Nthabiseng (NthabisengM)** for Change of Supervisor. Future-dated to avoid backdated dialogs.

| App | URL | Environment |
|-----|-----|-------------|
| HCM Admin Portal | https://pd-hcm-adminportal-qa.shesha.app/ | QA |

## Summary
| Total Cases | Passed | Failed | Skipped |
|-------------|--------|--------|---------|
| 5 | 5 | 0 | 0 |

## Case Results

### NEG-01: Not Recommend (Recommender) — Annual Leave
**Ref:** LA2026/12925 · **Actor:** Kavitha (GOV012) · **Mode:** mcp-live
- [PASS] Thabo submitted a 1-day Annual Leave (19 Jun 2026); Kavitha opened the Recommend step.
- [PASS] **Not Recommend** required a **comments** dialog (`notRecommend-leave-application-dialogue v20`).
- [PASS] **Key behaviour — advisory, NOT a stop:** after Not Recommend, the item **still routed to the Approver (Naledi)** and sat **Active** at "Approve Leave". The Audit Trail records the Recommend step as **Decision: Not Recommended** with the comments, but the workflow continues. (Confirmed via Audit Trail.)
- [PASS] Gating nuance: at the Recommend step, **Not Recommend** and **Send Back** are enabled immediately — only the positive **Recommend** is gated behind download-attachment + acknowledge.

### NEG-02: Not Approve (Approver) — Annual Leave
**Ref:** LA2026/12925 (continued) · **Actor:** Naledi (GOV022) · **Mode:** mcp-live
- [PASS] Reused the same item (now Active at Approve after the Not-Recommend). Naledi opened the Approve step.
- [PASS] At the **Approve** step, **Not Approve is gated** — disabled until the attachment is downloaded **and** the acknowledge checkbox is ticked (only Send Back is free). Downloaded + acknowledged → Not Approve enabled.
- [PASS] **Not Approve** → comments dialog (`sagov-recommend-leave-dialogue v34`, "decline the leave") → Ok.
- [PASS] **Terminal status → "Declined".** The leave is fully rejected.

### NEG-03: Send Back (Recommender → applicant) — Annual Leave
**Ref:** LA2026/12931 · **Actor:** Kavitha (GOV012) → Thabo · **Mode:** mcp-live
- [PASS] Thabo submitted a fresh 1-day Annual Leave (22 Jun 2026); Kavitha opened the Recommend step.
- [PASS] **Send Back** dialog is richer than the others: requires choosing a **target Step** (a "Select a User Task" dropdown — only option was **New Leave Application**, assigned to Thabo) **plus Comments**.
- [PASS] **Returns to the applicant.** Verified the item appears in **Thabo's own inbox** with **Action Required = "New Leave Application"**, status **In Progress** — i.e., the applicant can reopen, correct, and re-submit (re-enters Recommend → Approve). Not terminal.

### NEG-04: Decline Cancellation — Leave Cancellation
**Cancellation Ref:** LC:2026-19286 (against leave **LA2026/12806**, Adoption) · **Actor:** Kavitha (GOV012) · **Mode:** mcp-live
- [PASS] Thabo initiated **Cancel Leave** on an approved leave (LA2026/12806) → spawned the SaGov Leave Cancellation workflow, routed to "Recommends Cancellation".
- [PASS] Kavitha clicked **Decline Cancellation** → comments dialog (`sagov-decline-cancellation-dialogue v31`) → Ok. (Decline/Recommend buttons enabled immediately — no gating on this form.)
- [PASS] **Cancellation workflow → "Declined" (terminal); the original leave stays active** — LA2026/12806 reads **"Approved With Full Pay"** (the cancellation did not take effect). The decline correctly *protects* the original approved leave.

### NEG-05: Change of Supervisor — Not Approved
**Ref:** SC2026/09293 · **Actor:** Kavitha (GOV012, Old Supervisor) · **Mode:** mcp-live
- [PASS] Nthabiseng raised a Change of Supervisor request (proposed supervisor Naledi). Routed to the **Old Supervisor** step (= current supervisor Kavitha).
- [PASS] Kavitha clicked **Not Approved** → "Decline Change of Supervisor" comments dialog → Ok.
- [PASS] **Terminal status → "Declined"** at the first (Old Supervisor) approval — the request does not proceed to New Supervisor / HR. Nthabiseng's reporting line is unchanged.

## Notes / Findings
- **"Not Recommend" is advisory, not terminal.** Unlike "Not Approve", a recommender's Not-Recommend **does not stop** the leave — it still goes to the approver (who can then approve or not-approve). This is the single most important negative-path finding and is easy to misread as a bug; the Audit Trail makes the recommender's negative decision explicit. *Worth confirming with the product owner whether routing a not-recommended leave onward to the approver is intended.*
- **Terminal rejections all surface as status "Declined":** Not Approve (leave), Decline Cancellation (cancellation workflow), and COS Not Approved all land on **Declined**.
- **Gating asymmetry between steps:** Recommend step → negative buttons (Not Recommend / Send Back) open immediately; Approve step → **Not Approve is gated** behind download + acknowledge (only Send Back free). Cancellation & COS decline forms have **no gating**.
- **Send Back** is the only "return to sender" path — it requires picking the target user-task step + comments and lands the item back in the applicant's inbox (re-editable), verified in Thabo's inbox.
- **Decline Cancellation preserves the original leave** (stays Approved) — the negative outcome here is *protective*, not destructive.
- All negative dialogs require **comments** before their OK/confirm enables (except where noted).
- No defects observed (the Not-Recommend routing is flagged as a design question, not a defect). Browser closed after the run.
