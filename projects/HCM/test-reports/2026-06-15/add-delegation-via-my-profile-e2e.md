# Report: Add Delegation via My Profile — E2E

Date: 2026-06-15
Plan: eLeave delegation — 2nd method (My Profile → Delegation Appointments)
Spec: none — live MCP-driven
Execution Mode: mcp-live
Result: PASS
Duration: ~3 min

App: HCM My Profile — `https://pd-hcm-adminportal-qa.shesha.app/dynamic/Boxfusion.SAGov/sagovemployee-profile` (view mode: Latest)
User: Thabo Musa Victor Mthembu (GOV003)

## Context

There are **two ways** to add a delegation in HCM eLeave:
1. **On Submit** of a leave application — the Delegate dialog (done earlier today, LA2026/13036).
2. **Via My Profile → Delegation Appointments → Add Delegation** — this run.

Both write to the same **Delegation Appointments** list shown on My Profile. The Submit-dialog delegation from earlier (Andrew Smith, 30/06/2026) was visible in this list, confirming they share one store.

## Summary

| Total | Passed | Failed | Skipped |
|-------|--------|--------|---------|
| 1     | 1      | 0      | 0       |

## Step Results

### TC-01: Add a delegation from My Profile
- [PASS] Logged in as Thabo (GOV003); view Latest
- [PASS] User menu → **My Profile** → opens `sagovemployee-profile`
- [PASS] Scrolled to **Delegation Appointments** section (existing rows listed, incl. the earlier Andrew Smith Submit-dialog delegation)
- [PASS] Clicked **Add Delegation** → "Add Delegation" dialog
- [PASS] **Position** pre-filled = "Thabo Musa Victor Mthembu - Infra Intern - Permanent"
- [PASS] **Person** (required) — opened the **ellipsis (…) entity picker** → "Select Item" dialog (searchable person table, "Double click an item to select") → double-clicked **Ayanda Nkosi** (98763257)
- [PASS] **Appointment Start Date** = 01/07/2026 (type dd/mm/yyyy + click day cell)
- [PASS] **Appointment End Date** = 03/07/2026
- [PASS] Clicked **Save** → toast "**Successfully created delegation appointment.**"
- [PASS] New row appears in the table: Ayanda Nkosi · 01/07/2026 00:00 → 03/07/2026 22:00 · created by Thabo (GOV00003), list count 6 → 7

## Field/UX notes (My Profile delegation)
- **Add Delegation** dialog fields: Position (read-only, pre-filled), **Person*** , **Appointment Start Date***, **Appointment End Date***.
- The **Person** field is NOT a free-text typeahead — its input is readonly; use the **ellipsis (…) button** to open the **Select Item** person-picker, then **double-click** the person row to select.
- This dialog requires manual date entry (unlike the Submit-dialog, which pre-fills the dates to the leave period).
- Saved end time rendered as **22:00** (date-only entry; same pattern seen on other My-Profile-created rows) vs the Submit-dialog row which stored 23:59 — cosmetic/time-default difference.
- Each row has **search** (view) and **delete** actions; columns include Appointment, Delegated To, Start/End Date, Created Date/By/Persal/Post Name.
- A transient "Failed to fetch" toast appeared on initial profile load — did not block the flow.
- Browser closed after the test case.
