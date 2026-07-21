# Report: Apply Annual Leave WITH Delegation — E2E Happy Path

Date: 2026-06-15
Plan: eLeave Annual Leave happy path + delegate-on-submit variation
Spec: none — live MCP-driven
Execution Mode: mcp-live
Result: PASS
Duration: ~8 min

Ref No: **LA2026/13036**
App: HCM SaGov Leave Application — https://pd-hcm-adminportal-qa.shesha.app/ (view mode: Latest)

## Summary

| Total | Passed | Failed | Skipped |
|-------|--------|--------|---------|
| 4     | 4      | 0      | 0       |

This run differs from the standard Annual Leave happy path in one way: on the **Delegate dialog** that appears on Submit, instead of clicking *Don't Delegate*, we actually configured a delegation (delegate to a colleague for the leave period), then carried the leave through the full approval chain.

## Delegation details

- **Delegate dialog** appears immediately on Submit (for non-admin applicant Thabo too).
- Fields: **Delegated to** (typeahead person-picker), **From date**, **To date**.
- **From/To dates were pre-filled to the leave period** (30/06/2026 → 30/06/2026) — no manual entry needed.
- Delegated to: **Andrew Smith** (selected via typeahead search "a").
- The **Delegate** button stays disabled until a person is chosen; once selected it enabled and the delegation was confirmed.
- After confirming, the leave was submitted normally and routed to the recommender (delegation did not alter the Recommender→Approver routing).

## Step Results

### TC-01: Apply for Annual Leave with delegation (Applicant — Thabo GOV003)
- [PASS] Logged in as Thabo Musa Victor Mthembu (GOV003); switched view Live → Latest
- [PASS] Workflows → My Items → + Create New → SaGov Leave Application (Ref LA2026/13036)
- [PASS] Myself; Category = Annual Leave; Sub-Category = Annual Leave; Duration = Days
- [PASS] Start 30/06/2026, End 30/06/2026 → "Great! You have selected to take 1 day off"
- [PASS] Address captured; supporting-doc.txt uploaded; certification checkbox ticked
- [PASS] Submit → **Delegate dialog** appeared
- [PASS] Delegated to Andrew Smith, From/To 30/06/2026 (pre-filled); clicked **Delegate**
- [PASS] Item submitted, lands at top of My Items, status In Progress

### TC-02: Recommend Leave (Recommender — Kavitha GOV012)
- [PASS] Logged in as Kavitha Naidoo; view Live → Latest; Workflows → Inbox
- [PASS] Opened LA2026/13036 (action Recommend Leave); details show 30/06/2026, 1 day, supporting doc
- [PASS] Downloaded attachment + ticked acknowledge → action buttons enabled
- [PASS] Clicked **Recommend** (no Backdated-Leave dialog — future leave); item left inbox

### TC-03: Approve Leave (Approver — Naledi GOV022)
- [PASS] Logged in as Naledi weeeee Khumalo; view Live → Latest; Workflows → Inbox
- [PASS] Opened LA2026/13036 (action Approve Leave)
- [PASS] Downloaded attachment + ticked acknowledge → action buttons enabled
- [PASS] Clicked **Approve with Full Pay** → "Successfully submitted the leave"; item left inbox

### TC-04: Outcome
- [PASS] On Approve with Full Pay the workflow auto-progresses to **Generate PERSAL Input** (no manual button — backend PERSAL push)

## Notes
- Category/Sub-Category render as "unknown" on the Recommend/Approve detail panes — known cosmetic display behaviour, not a defect.
- Delegation here delegates Thabo's account/workflow actions to Andrew Smith for the leave window; it is independent of the leave's recommend/approve routing.
- Browser closed after the final test case.
