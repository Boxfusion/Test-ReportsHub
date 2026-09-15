# Test Plan: Successful Take Ownership

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
| ADO Test Case | [#102699](https://dev.azure.com/boxfusion/pd-approvals/_workitems/edit/102699) — Successful Take Ownership |

> **Note (two-user flow):** ADO's steps 13–22 require logging in as a second "approver" user, distinct from the initiator, to receive the submitted memo in their Inbox and act on it. An initial attempt to have Ian select **himself** as the routing signatory (to avoid needing a second account) was tried and found not viable: the system deterministically rejects an initiator adding themselves as their own approver — the "Add" click leaves the approver field populated but never adds a row to the routing table (confirmed via 2 identical repro runs, not a flake). A second account (Craig / 123qwe) was then supplied, so this plan logs in as Ian to create and submit the memo assigning **Craig** ("Craig M: Sales Director") as the routing approver, then logs out and logs back in as Craig (same page/session, not a separate browser context) to complete the Inbox and Take Ownership steps.
>
> **Note:** The header's view-mode control opens a popover with three options (Live/Ready/Latest) rather than toggling directly — clicking the control alone does not change the mode. The correct sequence is: click the control to open the popover, then click the "Latest" option inside it, then assert the control's own badge label changes from "Live" to "Latest". This is done once as Ian; whether it needs repeating after logging in as Craig is confirmed live.
>
> **Note:** This QA environment can sit on an "Initializing..." splash screen for well over the default 15s action timeout before the login form mounts — the login helper uses a generous timeout to tolerate this rather than treating it as a script failure.
>
> **Note:** ADO's field-population step says "Populate all mandatory and action the item until Routing step" without listing individual fields, but [#102637](https://dev.azure.com/boxfusion/pd-approvals/_workitems/edit/102637) already established that Subject, Recommendation, Financial Implications, Risks, Background and Discussion are the actual mandatory Compose fields. This plan populates all of them.
>
> **Note:** Reuses the proven flow from [#102653](https://dev.azure.com/boxfusion/pd-approvals/_workitems/edit/102653)/[#102661](https://dev.azure.com/boxfusion/pd-approvals/_workitems/edit/102661)/[#102664](https://dev.azure.com/boxfusion/pd-approvals/_workitems/edit/102664)/[#102669](https://dev.azure.com/boxfusion/pd-approvals/_workitems/edit/102669)/[#102670](https://dev.azure.com/boxfusion/pd-approvals/_workitems/edit/102670) (Live/Latest switch, per-tab population, genuine-navigation checks, keyboard-based approver selection, and role-based row/cell targeting for the custom Routing table) up through reaching the Routing step.
>
> **Note:** The submit-time validation "The CC recipient must be one of the routing approvers" is real and confirmed live — the CC field must select the same person (Craig) who is later added as the routing signatory, not an arbitrary first option.
>
> **Note:** ADO's step 16 ("CLICK the Memo Actions button") does not match this build — there is no separate "Memo Actions" button to click. The Approve step screen (tab labelled "Memo Action") already shows the full action bar — including "Take Ownership" — directly, with no extra click required.
>
> **Note:** ADO's expected result states that confirming Take Ownership ("OK") causes the system to "refresh and reopen the memo in draft mode with Craig as initiator." This was not observed — the header still reads "Created by: Ian Houvet" and the screen remains the Approve step. The genuine, verifiable post-condition in this build is that the "Take Ownership" button itself becomes disabled once ownership is taken (and remains enabled if Cancel is clicked instead), which is what this plan asserts on.

## Objective
> Validate that after a memo is submitted for approval, the assigned signatory (a different user from the initiator) can find it in their Inbox, view the Approve step, and successfully take ownership of the item (with the ability to cancel the take-ownership confirmation before committing to it).

## Preconditions
- [ ] App is reachable at https://pd-approvals-adminportal-qa.azurewebsites.net/
- [ ] Initiator credentials are valid (Ian / 123qwe)
- [ ] Approver credentials are valid (Craig / 123qwe)
- [ ] The initiator has permission to create a new Referral memo
- [ ] "Craig M" is available as a routing signatory option

## Test Cases

### TC-01 — Successful Take Ownership (ADO #102699)

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
  19. CLICK the Cancel button on the Take Ownership popup
  20. CLICK the Take Ownership button again
  21. CLICK the OK button on the Take Ownership popup
- **Expected result:** The memo is submitted successfully with a confirmation message showing Memo Number, Subject, Date, Initiator and Signatories to follow. Logged in as Craig, the submitted item appears in the Inbox and opens to an Approve step with Approve/Decline options. The action bar shows a Take Ownership button (no separate "Memo Actions" click is needed in this build). Clicking Take Ownership then Cancel leaves the item unchanged and the button enabled. Clicking Take Ownership then OK disables the Take Ownership button, confirming ownership was taken.
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
  - [x] ASSERT (BLOCKING) Clicking Cancel closes the popup without taking ownership (button stays enabled)
  - [x] ASSERT (BLOCKING) Clicking Take Ownership then OK disables the Take Ownership button

---

## Teardown
- Log out of the admin portal after test completion (optional for automated runs).
