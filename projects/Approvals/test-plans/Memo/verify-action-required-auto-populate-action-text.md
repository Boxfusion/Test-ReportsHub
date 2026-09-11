# Test Plan: Verify Action Required Auto Populate Action Text

> **Status:** Ready
> **Owner:** QA
> **Last Updated:** 2026-07-15
> **Estimated Duration:** 90s

## Metadata
| Field | Value |
|-------|-------|
| App URL | https://pd-approvals-adminportal-qa.azurewebsites.net/ |
| Environment | QA |
| Login As (Initiator) | Ian / 123qwe |
| ADO Plan | [#100853](https://dev.azure.com/boxfusion/pd-approvals/_testPlans/define?planId=100853&suiteId=100854) |
| ADO Suite | #100854 |
| ADO Test Case | [#105889](https://dev.azure.com/boxfusion/pd-approvals/_workitems/edit/105889) — Verify Action Required Auto Populate Action Text |

> **Note (single-user, routing-only flow):** This test only reaches the Routing step and saves a routing row's Required Action — it never submits, and no second user (Craig) is needed to act on the item. Steps 1-12 reuse the proven Compose/Attachments/Routing flow from [#104791](https://dev.azure.com/boxfusion/pd-approvals/_workitems/edit/104791) (Verify Recommend Memo) verbatim up through adding Craig M as the routing signatory.
>
> **Note:** Confirmed live in [#104791](https://dev.azure.com/boxfusion/pd-approvals/_workitems/edit/104791) and reused here — the Required Action dropdown's search `<input>` is intercepted by its own sibling `.ant-select-selection-item` span showing the current value; click that visible span instead to open the dropdown. This dropdown's options are not `role=option` — fall back to plain text matching.
>
> **Note:** The header's view-mode control opens a popover with three options (Live/Ready/Latest) — click the control to open the popover, then click "Latest" inside it, then assert the control's own badge label changes from "Live" to "Latest".

## Objective
> Validate that selecting "Recommend" as the Required Action on a routing row auto-populates the row's Action Text field to match, and that Save persists the change.

## Preconditions
- [ ] App is reachable at https://pd-approvals-adminportal-qa.azurewebsites.net/
- [ ] Initiator credentials are valid (Ian / 123qwe)
- [ ] The initiator has permission to create a new Referral memo
- [ ] "Craig M" is available as a routing signatory option
- [ ] "Recommend" is an available Required Action option on the routing row

## Test Cases

### TC-01 — Verify Action Required Auto Populate Action Text (ADO #105889)

- **Type:** Happy path
- **Steps:**
  1. NAVIGATE to https://pd-approvals-adminportal-qa.azurewebsites.net/login and log in as Ian (initiator)
  2. CLICK the "Click to change view mode" control in the header to open the Live/Ready/Latest popover, then CLICK the "Latest" option in that popover
  3. CLICK the sidebar Toggle in the top-left corner
  4. CLICK the Workflows dropdown
  5. CLICK the My Items menu item
  6. CLICK the Create New button
  7. CLICK the New Referrals subtype
  8. POPULATE all mandatory Compose fields and ACTION the item through Next (Compose → Attachments) and Next (Attachments → Routing)
  9. RECORD the memo's Ref No for later verification
  10. CLICK the Select Signatory dropdown and SELECT "Craig M"
  11. CLICK the Add button
  12. CLICK the Edit icon on Craig's routing row
  13. CLICK the Required Action dropdown
  14. SELECT the "Recommend" option
  15. CLICK the Save button
- **Expected result:** Craig M is added to the routing table as the signatory. Clicking the Edit icon puts the row's Required Action into an editable dropdown. Selecting "Recommend" auto-populates the row's Action Text to match ("Recommend"). Clicking Save persists the change — the row exits edit mode with the saved Required Action and Action Text intact.
- **Assertions:**
  - [x] ASSERT (BLOCKING) Ian successfully logs into the system
  - [x] ASSERT (BLOCKING) App header switches from "Live" to "Latest" mode after selecting the "Latest" option
  - [x] ASSERT (BLOCKING) Craig M is added to the routing table as the signatory
  - [x] ASSERT (BLOCKING) The Edit icon puts the row's Required Action into an editable dropdown
  - [x] ASSERT (BLOCKING) Selecting "Recommend" updates the Required Action and auto-populates the Action Text field to match
  - [x] ASSERT (BLOCKING) Clicking Save persists the change and the row exits edit mode

---

## Teardown
- Log out of the admin portal after test completion (optional for automated runs).
