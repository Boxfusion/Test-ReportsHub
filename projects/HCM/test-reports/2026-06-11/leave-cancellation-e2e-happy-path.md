# Report: eLeave — Leave Cancellation End-to-End Happy Path

**Date:** 2026-06-11 08:31 UTC
**Plan:** _ad-hoc — SaGov Leave Cancellation flow (no markdown plan yet)_
**Spec:** _none — live MCP-driven execution (no paired .spec.ts)_
**Execution Mode:** mcp-live
**Result:** PASSED
**Duration:** ~6 min (08:25–08:31 UTC)
**Cancellation Ref No:** LC:2026-19236
**Cancelled leave:** LA2026/12814 (1-day Family Responsibility (Death), Thu 18 Jun 2026, Thabo Musa Victor Mthembu GOV003)

## Scenario
Cancel one of Thabo's existing leaves — **LA2026/12814** (Family Responsibility (Death), future-dated 18 Jun 2026, previously at *Generate PERSALinput*) — and carry the cancellation through its full approval chain. Cancellation is a **separate workflow** (`SaGov Leave Cancellation`) spawned from the leave item's **Cancel Leave** action, with its own Recommend → Approve chain.

| App | URL | Environment |
|-----|-----|-------------|
| HCM Admin Portal | https://pd-hcm-adminportal-qa.shesha.app/ | QA |

## Summary
| Total Steps | Passed | Failed | Skipped |
|-------------|--------|--------|---------|
| 3 | 3 | 0 | 0 |

## Step Results

### TC-01: Initiate Cancellation (Thabo Musa Victor Mthembu, GOV003 — applicant)
**Mode:** mcp-live
- [PASS] Login as GOV003 (view mode → Latest); My Items → opened LA2026/12814 (status *Generate PERSALinput*)
- [PASS] Clicked **Cancel Leave** → **Cancel Leave** dialog (`sagov-cancel-leave-dialogue v32`) → entered cancellation comments → **OK**
- [PASS] Original leave LA2026/12814 status flipped to **Cancelled**; a new **SaGov Leave Cancellation** workflow **LC:2026-19236** was spawned (status *In Progress*); calendar marked the 18th **"(cancellation pending)"**
- [PASS] Cancellation did NOT route to the applicant's own inbox — went straight to the recommender

### TC-02: Recommend Cancellation (Kavitha Naidoo, GOV012 — Infra Manager)
**Mode:** mcp-live
- [PASS] Login as GOV012 (view mode → Latest); Inbox → LC:2026-19236, Action Required = **Recommends Cancellation**
- [PASS] Recommend form (`sagov-recommend-leave-cancellation v50`) — **no attachment-download / acknowledge-checkbox gating** (buttons enabled immediately); options: Decline Cancellation / **Recommend Cancellation**
- [PASS] **Recommend Cancellation** → item left Kavitha's inbox, routed to the approver

### TC-03: Approve Cancellation (Naledi weeeee Khumalo, GOV022 — HOD Infrastructure)
**Mode:** mcp-live
- [PASS] Login as GOV022 (view mode → Latest); Inbox → LC:2026-19236, Action Required = **Approve Leave Cancellation**
- [PASS] Approve form (`sagov-approve-leave-cancellation v52`); options: Decline Cancellation / **Approve Cancellation** (no gating)
- [PASS] **Approve Cancellation** → cancellation workflow reached status **Cancellation Completed** (3/3); the Family Responsibility (Death) entry was **removed from the calendar** on 18 Jun (no longer "cancellation pending")

## Notes
- **Cancellation is a distinct workflow, not a status flip.** The leave item's **Cancel Leave** button spawns a separate `SaGov Leave Cancellation` instance (own Ref **LC:2026-19236**, prefix `LC:`) that runs **Initiate → Recommends Cancellation → Approve Leave Cancellation**. The original `SaGov Leave Application` (LA2026/12814) shows **Cancelled** immediately on initiation, but the cancellation is only finalised when the LC workflow reaches **Cancellation Completed**.
- **Routing chain mirrors the leave-application chain:** Applicant Thabo (GOV003) → Recommender Kavitha (GOV012) → Approver Naledi (GOV022).
- **No attachment/acknowledge gating** on the Recommend/Approve cancellation forms (unlike the leave-application Recommend/Approve, which require downloading the attachment + ticking "I acknowledge…" before the action buttons enable). Cancellation action buttons are enabled on load.
- **Decline Cancellation** is the negative path at both Recommend and Approve steps (not exercised here).
- Calendar uses a transient **"(cancellation pending)"** label while the LC workflow is in progress; the leave entry disappears entirely once Cancellation Completed.
- No defects observed. Browser closed after the run.
