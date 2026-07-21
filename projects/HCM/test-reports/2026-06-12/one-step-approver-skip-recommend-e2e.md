# Report: eLeave — One-Step Approver (Skip Recommend) End-to-End

**Date:** 2026-06-12 14:07 UTC
**Plan:** test-plans/eLeave/capture-new-leave-application.md (One-Step Approver routing variant)
**Spec:** _none — live MCP-driven execution (no paired .spec.ts)_
**Execution Mode:** mcp-live
**Result:** PASSED (business rule works — Recommend step skipped)
**Duration:** ~6 min (14:00–14:07 UTC)
**Ref No:** LA2026/12991

## Scenario
Verify a new business rule: leave applications from users in the **one-step approver** role must **skip the Recommend step and go straight to Approve**. Applicant = **Martha Doe (gov002)**; one-step approver = **Tania Smith (Tester97)**. Applied 1-day Annual Leave on **Wed 24 June 2026** (future working day) and carried it through.

| App | URL | Environment |
|-----|-----|-------------|
| HCM Admin Portal | https://pd-hcm-adminportal-qa.shesha.app/ | QA |

## Summary
| Total Steps | Passed | Failed | Skipped |
|-------------|--------|--------|---------|
| 2 | 2 | 0 | 0 |

## Step Results

### TC-01: Apply — Capture Annual Leave (Martha Doe, gov002)
**Mode:** mcp-live
- [PASS] Login as gov002 (Martha Doe, HOD - Service Delivery); view mode Latest
- [PASS] Create New → SaGov Leave Application (Ref No **LA2026/12991**)
- [PASS] Category = Annual Leave → Sub-Category = Annual Leave → Duration = Days
- [PASS] Start **24/06/2026** / End **24/06/2026** → "1 day off"; balance 35 days
- [PASS] Address + supporting doc + certification → **Submit** → Delegate modal → Don't Delegate → status In Progress
- ⚠️ **On-form routing preview discrepancy (cosmetic):** the "Your leave will be routed as follows" block listed BOTH `Recommender: MEC-1-(Tania Smith)-OFFICE OF THE MINISTER` AND `Approver: MEC-1-(Tania Smith)-OFFICE OF THE MINISTER`. Despite the preview naming a Recommender, the actual workflow skipped the Recommend step (see TC-02 / Audit Trail). The preview text is misleading and should be raised with the product owner.

### TC-02: Approve direct (Tania Smith, Tester97 — one-step approver)
**Mode:** mcp-live
- [PASS] **The application routed straight to the Approve step — no Recommend.** It appeared in **Tania Smith's inbox** with Action Required = **Approve Leave** (not "Recommend Leave"); Martha's leave was never queued for a recommender.
- [PASS] Login as Tester97 (Tania Smith); view mode Latest; opened LA2026/12991 (Approve Leave; received from Martha Doe)
- [PASS] Downloaded attachment + ticked acknowledge → **Approve with Full Pay**
- [PASS] Status → **Generate PERSALinput**

## Final State (Audit Trail — LA2026/12991)
1. New Leave Application — **Submit** — Martha Doe ✓
2. Approve Leave — **Approved With Full Pay** — Tania Smith ✓ **(no Recommend Leave step in the trail)**
3. Generate PERSAL Input — **Active**

## Expected vs Actual
| | |
|---|---|
| **Expected** | Leave from a one-step-approver-role user skips Recommend → goes directly to Approve (Tania). |
| **Actual** | ✅ Matches. Audit Trail shows New Leave Application → **Approve Leave (Tania Smith)** → Generate PERSAL Input — the Recommend step is absent. |

## Notes
- **Business rule confirmed working:** the Recommend step is skipped for this role; the application is created and immediately becomes an Approve task assigned to the one-step approver (Tania Smith).
- **Open cosmetic issue:** the capture form's routing-preview still renders a `Recommender:` line (= the same person, Tania Smith). The displayed preview does not reflect the actual one-step routing. Recommend raising with the product owner — functional routing is correct, only the preview label is wrong.
- **Martha's capture form differs from a standard employee's:** no "Who are you requesting the leave for? (Myself/Someone else)" radio and no inline PERSAL field on the form (she is an HOD-level account; PERSAL 67746578 shows on the approver view).
- **Accounts:** Martha Doe = `gov002` (applicant, one-step-approver role, HOD - Service Delivery); Tania Smith = `Tester97` (one-step approver, MEC / Office of the Minister). Both password `123qwe`.
- 24 Jun 2026 is a Wednesday (working day) → future-dated, so no backdated/weekend dialogs.
- No defects observed (aside from the cosmetic routing-preview note). Browser closed after the run.
