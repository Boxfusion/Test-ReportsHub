# Test Plan: Verify Send To Approver First

> **Status:** Ready
> **Owner:** QA
> **Last Updated:** 2026-07-15
> **Estimated Duration:** 180s

## Metadata
| Field | Value |
|-------|-------|
| App URL | https://pd-approvals-adminportal-qa.azurewebsites.net/ |
| Environment | QA |
| Login As (Initiator) | Ian / 123qwe |
| Login As (Recommender) | Craig / 123qwe |
| Login As (Second Approver) | Admire / 123qwe |
| ADO Plan | [#100853](https://dev.azure.com/boxfusion/pd-approvals/_testPlans/define?planId=100853&suiteId=100854) |
| ADO Suite | #100854 |
| ADO Test Case | [#105860](https://dev.azure.com/boxfusion/pd-approvals/_workitems/edit/105860) — Verify Send To Approver First |

> **Note (three-user flow):** Steps 1-17 reuse the proven initiator/recommender routing flow from [#104791](https://dev.azure.com/boxfusion/pd-approvals/_workitems/edit/104791) (Verify Recommend Memo) verbatim, up through Ian submitting the memo with Craig's routing entry set to Required Action "Recommend". Steps 18-19 (login as Craig, open the item from the Inbox) match [#105864](https://dev.azure.com/boxfusion/pd-approvals/_workitems/edit/105864) and [#105855](https://dev.azure.com/boxfusion/pd-approvals/_workitems/edit/105855). This test then introduces a third user, Admire, who receives the item via "Send To Approver First" and completes it.
>
> **Note:** Confirmed live in the #105864 run — the memo review screen (reached by opening an Inbox item) exposes a `Send To Approver First` button alongside `Recommend`/`Do not Recommend` radios, `Submit`, `Withdraw`, `Take Ownership`, `Send Back` and a `Close` link.
>
> **Note:** The header's view-mode control opens a popover with three options (Live/Ready/Latest) — click the control to open the popover, then click "Latest" inside it, then assert the control's own badge label changes from "Live" to "Latest". A fresh login resets this back to "Live", so it must be repeated after logging in as Craig and again after logging in as Admire.
>
> **Note (confirmed live — corrects ADO steps 31-32):** "Send To Approver First" forwards the *same* action type to the new approver rather than switching to a generic "Complete Action"/"Decline Action" screen. Since Craig's routing entry Required Action was "Recommend", Admire's review screen shows the identical "Recommend"/"Do not Recommend" radios (plus a mandatory Supporting Comments field) that Craig saw — not "Complete Action"/"Decline Action" as ADO #105860 describes. This plan documents the confirmed live screen instead of the ADO wording.

## Objective
> Validate that a recommender (Craig) can forward a submitted item to another approver (Admire) via "Send To Approver First": selecting an approver and populating Comments enables OK, confirming routes the item to Admire's Inbox, and Admire can complete the action, moving the item to the next signatory.

## Preconditions
- [ ] App is reachable at https://pd-approvals-adminportal-qa.azurewebsites.net/
- [ ] Initiator credentials are valid (Ian / 123qwe)
- [ ] Recommender credentials are valid (Craig / 123qwe)
- [ ] Second approver credentials are valid (Admire / 123qwe)
- [ ] The initiator has permission to create a new Referral memo
- [ ] "Craig M" is available as a routing signatory option
- [ ] "Recommend" is an available Required Action option on the routing row
- [ ] "Admire" is available as an approver option on the Send To Approver First dialog

## Test Cases

### TC-01 — Verify Send To Approver First (ADO #105860)

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
  20. CLICK the "Send To Approver First" button
  21. CLICK the "Select the approver to send the memo to" dropdown
  22. SELECT "Admire" from the list of approvers
  23. POPULATE the Comments field
  24. CLICK the OK button
  25. LOG OUT of Craig's session and LOG IN as Admire (second approver)
  26. CLICK the "Click to change view mode" control, then CLICK "Latest"
  27. CLICK the sidebar Toggle
  28. CLICK the Workflows dropdown
  29. CLICK the Inbox menu item
  30. OPEN the item matching the recorded Ref No
  31. SELECT the "Recommend" radio button (confirmed live equivalent of ADO's "Complete Action" — see note above) and POPULATE the mandatory Supporting Comments field
  32. CLICK the Submit button
- **Expected result:** The memo is submitted successfully with Craig's routing entry set to Required Action "Recommend". Logged in as Craig, the submitted item is found in the Inbox. Clicking "Send To Approver First" shows a dialog; selecting Admire and populating Comments enables OK; confirming routes the item to Admire's Inbox. Logged in as Admire, the item opens to a review step showing the same "Recommend"/"Do not Recommend" radio options and mandatory Supporting Comments field Craig saw (confirmed live; ADO's "Complete Action"/"Decline Action" wording does not match this Recommend-typed routing entry). Selecting "Recommend", filling comments, and clicking Submit moves the item forward.
- **Assertions:**
  - [x] ASSERT (BLOCKING) Ian successfully logs into the system
  - [x] ASSERT (BLOCKING) App header switches from "Live" to "Latest" mode after selecting the "Latest" option
  - [x] ASSERT (BLOCKING) Craig M is added to the routing table as the signatory
  - [x] ASSERT (BLOCKING) The Edit icon puts the row's Required Action into an editable dropdown
  - [x] ASSERT (BLOCKING) Selecting "Recommend" updates the Required Action and Action Text
  - [x] ASSERT (BLOCKING) Submitting shows a success confirmation
  - [x] ASSERT (BLOCKING) Craig successfully logs into the system
  - [x] ASSERT (BLOCKING) The submitted item (matched by Ref No) is found in Craig's Inbox and opens to a review step
  - [x] ASSERT (BLOCKING) Clicking "Send To Approver First" shows a dialog with an approver dropdown
  - [x] ASSERT (BLOCKING) Selecting "Admire" displays it in the dialog
  - [x] ASSERT (BLOCKING) OK is enabled once Comments is populated
  - [x] ASSERT (BLOCKING) Clicking OK routes the item away and back to incoming items
  - [x] ASSERT (BLOCKING) Admire successfully logs into the system
  - [x] ASSERT (BLOCKING) The item is found in Admire's Inbox and opens to a review step showing "Recommend"/"Do not Recommend" radio options (confirmed live — same action type Craig saw)
  - [x] ASSERT (BLOCKING) Selecting "Recommend", filling comments, and clicking Submit moves the item forward

---

## Teardown
- Log out of the admin portal after test completion (optional for automated runs).
