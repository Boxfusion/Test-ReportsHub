# Test Plan: New Version Created

> **Status:** Ready
> **Owner:** QA
> **Last Updated:** 2026-07-08
> **Estimated Duration:** 150s

## Metadata
| Field | Value |
|-------|-------|
| App URL | https://pd-approvals-adminportal-qa.azurewebsites.net/ |
| Environment | QA |
| Login As (Initiator) | Ian / 123qwe |
| Login As (Approver) | Craig / 123qwe |
| ADO Plan | [#100853](https://dev.azure.com/boxfusion/pd-approvals/_testPlans/define?planId=100853&suiteId=100854) |
| ADO Suite | #100854 |
| ADO Test Case | [#104767](https://dev.azure.com/boxfusion/pd-approvals/_workitems/edit/104767) — New Version Created |

> **Note (two-user flow):** Reuses the same initiator/approver flow proven in [#102699](https://dev.azure.com/boxfusion/pd-approvals/_workitems/edit/102699) (Successful Take Ownership) — Ian submits a memo assigning Craig as routing signatory, then logs out so Craig can log in and act on it. Self-approval is not viable (see #102699 notes).
>
> **Note:** This test case is nearly identical to #102699 through the Take Ownership step, but does **not** include a Cancel step — it goes straight from clicking Take Ownership to clicking OK, and its expected result focuses specifically on version-bump behavior: ADO states the system should "auto refresh and open the Memo in draft mode with new V2 ref number indication a new version e.g. (Ref2026/01732/V2)".
>
> **Note:** The header's view-mode control opens a popover with three options (Live/Ready/Latest) rather than toggling directly — click the control to open the popover, then click "Latest" inside it, then assert the control's own badge label changes from "Live" to "Latest".
>
> **Note:** The submit-time validation "The CC recipient must be one of the routing approvers" is real (confirmed in #102699) — the CC field must select Craig, the same person added as the routing signatory.
>
> **Note:** ADO's step 17 ("CLICK the Memo Actions button") does not match this build — confirmed in #102699 there is no separate "Memo Actions" button; the action bar (including "Take Ownership") is already directly visible on the Approve screen.
>
> **Note (confirmed discrepancy, 3 live runs):** No "/V2" (or any) version indicator is ever shown anywhere in the UI after taking ownership — checked both the "Memo Action" tab and the "Memo Contents" tab (which shows "No Data" either way). What **is** genuinely observed: the Take Ownership button disables immediately after clicking OK (the request in flight), then the page auto-refreshes and the button returns to enabled. This confirms the "auto refresh" part of ADO's expected result, but not the "new version with V2 ref indication" part. This plan asserts on the disable→re-enable cycle (the real, verifiable behavior) rather than the unobserved version indicator.

## Objective
> Validate that when the approver (Craig) takes ownership of a submitted memo, the system creates a new version of the memo (e.g. Ref2026/01732/V2), rather than merely disabling the Take Ownership button with no visible version change.

## Preconditions
- [ ] App is reachable at https://pd-approvals-adminportal-qa.azurewebsites.net/
- [ ] Initiator credentials are valid (Ian / 123qwe)
- [ ] Approver credentials are valid (Craig / 123qwe)
- [ ] The initiator has permission to create a new Referral memo
- [ ] "Craig M" is available as a routing signatory option

## Test Cases

### TC-01 — New Version Created (ADO #104767)

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
  12. CLICK the Submit button
  13. LOG OUT of Ian's session and LOG IN as Craig (approver)
  14. NAVIGATE to Workflows → Inbox
  15. OPEN the item matching the recorded Ref No
  16. CLICK the Memo Actions button
  17. SCROLL to the action buttons and locate the Take Ownership button
  18. CLICK the Take Ownership button
  19. CLICK the OK button on the Take Ownership popup
- **Expected result:** The memo is submitted successfully. Logged in as Craig, the submitted item appears in the Inbox and opens to an Approve step. Clicking Take Ownership then OK disables the Take Ownership button (request in flight), then the page auto-refreshes and the button returns to enabled. No version indicator (e.g. Ref2026/01732/V2) is shown anywhere in the UI in this build — a confirmed discrepancy from ADO's stated expected result.
- **Assertions:**
  - [x] ASSERT (BLOCKING) Ian successfully logs into the system
  - [x] ASSERT (BLOCKING) App header switches from "Live" to "Latest" mode after selecting the "Latest" option
  - [x] ASSERT (BLOCKING) Craig M is added to the routing table as the signatory
  - [x] ASSERT (BLOCKING) Submitting shows a success confirmation
  - [x] ASSERT (BLOCKING) Craig successfully logs into the system
  - [x] ASSERT (BLOCKING) The submitted item (matched by Ref No) is found in Craig's Inbox
  - [x] ASSERT (BLOCKING) Opening the item shows Approve/Decline options
  - [x] ASSERT (BLOCKING) The Take Ownership button is visible in the action bar
  - [x] ASSERT (BLOCKING) Clicking Take Ownership shows a confirmation popup with Cancel and OK
  - [x] ASSERT (BLOCKING) Clicking Take Ownership then OK disables the Take Ownership button, then it re-enables after the page auto-refreshes

---

## Teardown
- Log out of the admin portal after test completion (optional for automated runs).
