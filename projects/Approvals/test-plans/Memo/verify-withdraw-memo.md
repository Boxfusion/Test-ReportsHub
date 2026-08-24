# Test Plan: Verify Withdraw Memo

> **Status:** Ready
> **Owner:** QA
> **Last Updated:** 2026-07-15
> **Estimated Duration:** 150s

## Metadata
| Field | Value |
|-------|-------|
| App URL | https://pd-approvals-adminportal-qa.azurewebsites.net/ |
| Environment | QA |
| Login As (Initiator) | Ian / 123qwe |
| Login As (Recommender) | Craig / 123qwe |
| ADO Plan | [#100853](https://dev.azure.com/boxfusion/pd-approvals/_testPlans/define?planId=100853&suiteId=100854) |
| ADO Suite | #100854 |
| ADO Test Case | [#105855](https://dev.azure.com/boxfusion/pd-approvals/_workitems/edit/105855) — Verify Withdraw Memo |

> **Note (two-user flow, routing, and Recommend action edit):** Steps 1-17 reuse the proven initiator/recommender routing flow from [#104791](https://dev.azure.com/boxfusion/pd-approvals/_workitems/edit/104791) (Verify Recommend Memo) verbatim, up through Ian submitting the memo with Craig's routing entry set to Required Action "Recommend". Steps 18-19 (login as Craig, open the item from the Inbox) also match [#105864](https://dev.azure.com/boxfusion/pd-approvals/_workitems/edit/105864) (Verify Close Memo).
>
> **Note:** Confirmed live in the #105864 run — the memo review screen (reached by opening an Inbox item) exposes a `Withdraw` button alongside `Recommend`/`Do not Recommend` radios, `Submit`, `Take Ownership`, `Send To Approver First`, `Send Back` and a `Close` link. This plan uses that same `Withdraw` button rather than the Attachments-step Withdraw tested by the initiator in [#102660](https://dev.azure.com/boxfusion/pd-approvals/_workitems/edit/102660).
>
> **Note:** The header's view-mode control opens a popover with three options (Live/Ready/Latest) — click the control to open the popover, then click "Latest" inside it, then assert the control's own badge label changes from "Live" to "Latest". A fresh login resets this back to "Live", so it must be repeated after logging in as Craig.

## Objective
> Validate that a recommender (Craig) can withdraw a submitted item from the Inbox review screen: clicking Withdraw opens a Withdraw Memo dialog requiring Comments before OK is enabled, and confirming with OK auto-refreshes the item to a "Withdrawn" status.

## Preconditions
- [ ] App is reachable at https://pd-approvals-adminportal-qa.azurewebsites.net/
- [ ] Initiator credentials are valid (Ian / 123qwe)
- [ ] Recommender credentials are valid (Craig / 123qwe)
- [ ] The initiator has permission to create a new Referral memo
- [ ] "Craig M" is available as a routing signatory option
- [ ] "Recommend" is an available Required Action option on the routing row

## Test Cases

### TC-01 — Verify Withdraw Memo (ADO #105855)

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
  16. CLICK the Submit button
  17. LOG OUT of Ian's session and LOG IN as Craig (recommender)
  18. NAVIGATE to Workflows → Inbox
  19. OPEN the item matching the recorded Ref No
  20. CLICK the "Withdraw" button
  21. POPULATE the Comments field on the Withdraw Memo dialog
  22. CLICK the OK button
- **Expected result:** The memo is submitted successfully with Craig's routing entry set to Required Action "Recommend". Logged in as Craig, the submitted item is found in the Inbox and opens to a review step. Clicking Withdraw shows a Withdraw Memo dialog with Cancel and OK buttons; OK is disabled until Comments is populated. Clicking OK auto-refreshes the item and its status changes to "Withdrawn".
- **Assertions:**
  - [x] ASSERT (BLOCKING) Ian successfully logs into the system
  - [x] ASSERT (BLOCKING) App header switches from "Live" to "Latest" mode after selecting the "Latest" option
  - [x] ASSERT (BLOCKING) Craig M is added to the routing table as the signatory
  - [x] ASSERT (BLOCKING) The Edit icon puts the row's Required Action into an editable dropdown
  - [x] ASSERT (BLOCKING) Selecting "Recommend" updates the Required Action and Action Text
  - [x] ASSERT (BLOCKING) Submitting shows a success confirmation
  - [x] ASSERT (BLOCKING) Craig successfully logs into the system
  - [x] ASSERT (BLOCKING) The submitted item (matched by Ref No) is found in Craig's Inbox and opens to a review step
  - [x] ASSERT (BLOCKING) Clicking Withdraw shows the Withdraw Memo dialog with Cancel and OK buttons
  - [x] ASSERT (BLOCKING) OK is enabled once Comments is populated
  - [x] ASSERT (BLOCKING) Clicking OK changes the item's status to "Withdrawn"

---

## Teardown
- Log out of the admin portal after test completion (optional for automated runs).
