# Test Plan: Verify Send Back

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
| ADO Plan | [#100853](https://dev.azure.com/boxfusion/pd-approvals/_testPlans/define?planId=100853&suiteId=100854) |
| ADO Suite | #100854 |
| ADO Test Case | [#105862](https://dev.azure.com/boxfusion/pd-approvals/_workitems/edit/105862) — Verify Send Back |

> **Note (two-user flow, routing, and Recommend action edit):** Steps 1-17 reuse the proven initiator/recommender routing flow from [#104791](https://dev.azure.com/boxfusion/pd-approvals/_workitems/edit/104791) (Verify Recommend Memo) verbatim, up through Ian submitting the memo with Craig's routing entry set to Required Action "Recommend". Steps 18-19 (login as Craig, open the item from the Inbox) match [#105864](https://dev.azure.com/boxfusion/pd-approvals/_workitems/edit/105864), [#105855](https://dev.azure.com/boxfusion/pd-approvals/_workitems/edit/105855) and [#105860](https://dev.azure.com/boxfusion/pd-approvals/_workitems/edit/105860).
>
> **Note:** Confirmed live in the #105864 run — the memo review screen (reached by opening an Inbox item) exposes a `Send Back` button alongside `Recommend`/`Do not Recommend` radios, `Submit`, `Withdraw`, `Take Ownership`, `Send To Approver First` and a `Close` link.
>
> **Note:** The header's view-mode control opens a popover with three options (Live/Ready/Latest) — click the control to open the popover, then click "Latest" inside it, then assert the control's own badge label changes from "Live" to "Latest". A fresh login resets this back to "Live", so it must be repeated after logging in as Craig and again after logging in as Ian for the second time.
>
> **Note (confirmed live):** The "Send Back" dialog's "Select A User Task" control is a plain button (opening a role=menuitem list), not an Ant Select combobox like the Routing/Send-To-Approver-First fields — same button+menu pattern as "Create New". Once "Ian" is selected, the button's own accessible name changes away from "Select a User Task", so any locator scoped to that name stops matching post-selection.
>
> **Note (confirmed live):** Confirming "Send Back" does not navigate away to a list — it refreshes the same item detail page in place. Craig's action controls (Withdraw/Submit/Send Back/Send To Approver First) disappear since his part is done, leaving only Preview and Close.
>
> **Note (confirmed live — corrects ADO step 30's screen description):** When Ian reopens the item, the heading reads "Compile Draft: Test Subject" (not the generic "review step" ADO describes), with Preview In Pdf, **Cancel** (not Withdraw) and Submit buttons. The "Supporting Comments" textbox here has no placeholder text or associated label — it's simply the only textbox in the "Memo Action" tabpanel.

## Objective
> Validate that a recommender (Craig) can send a submitted item back to the initiator (Ian) via "Send Back": selecting the user task/user and populating Comments enables confirmation, sending back auto-refreshes the item and moves it to the previous step, and the initiator can then reopen it, add comments, and resubmit.

## Preconditions
- [ ] App is reachable at https://pd-approvals-adminportal-qa.azurewebsites.net/
- [ ] Initiator credentials are valid (Ian / 123qwe)
- [ ] Recommender credentials are valid (Craig / 123qwe)
- [ ] The initiator has permission to create a new Referral memo
- [ ] "Craig M" is available as a routing signatory option
- [ ] "Recommend" is an available Required Action option on the routing row
- [ ] "Ian" is available as a user-task target on the Send Back dialog

## Test Cases

### TC-01 — Verify Send Back (ADO #105862)

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
  20. CLICK the "Send Back" button
  21. CLICK the "Select A user task" dropdown
  22. SELECT "Ian" from the list
  23. POPULATE the Comments field
  24. CLICK the "Send Back" button on the dialog
  25. LOG OUT of Craig's session and LOG IN as Ian (initiator)
  26. NAVIGATE to Workflows → Inbox
  27. OPEN the item matching the recorded Ref No
  28. POPULATE the Comments field
  29. CLICK the Submit button
- **Expected result:** The memo is submitted successfully with Craig's routing entry set to Required Action "Recommend". Logged in as Craig, the submitted item is found in the Inbox. Clicking "Send Back" shows a dialog; selecting Ian and populating Comments enables sending; confirming auto-refreshes the item and routes it back to the previous step (Ian's Inbox). Logged in as Ian, the item is found in the Inbox and opens to a review step with Comments, Cancel and Submit controls. Populating Comments and clicking Submit submits the item successfully.
- **Assertions:**
  - [x] ASSERT (BLOCKING) Ian successfully logs into the system
  - [x] ASSERT (BLOCKING) App header switches from "Live" to "Latest" mode after selecting the "Latest" option
  - [x] ASSERT (BLOCKING) Craig M is added to the routing table as the signatory
  - [x] ASSERT (BLOCKING) The Edit icon puts the row's Required Action into an editable dropdown
  - [x] ASSERT (BLOCKING) Selecting "Recommend" updates the Required Action and Action Text
  - [x] ASSERT (BLOCKING) Submitting shows a success confirmation
  - [x] ASSERT (BLOCKING) Craig successfully logs into the system
  - [x] ASSERT (BLOCKING) The submitted item (matched by Ref No) is found in Craig's Inbox and opens to a review step
  - [x] ASSERT (BLOCKING) Clicking "Send Back" shows a dialog with a user-task/user dropdown
  - [x] ASSERT (BLOCKING) Selecting "Ian" displays it in the dialog
  - [x] ASSERT (BLOCKING) Confirming Send Back routes the item away, back toward Ian
  - [x] ASSERT (BLOCKING) Ian successfully logs back into the system
  - [x] ASSERT (BLOCKING) The item is found in Ian's Inbox and opens to a review step
  - [x] ASSERT (BLOCKING) Populating Comments and clicking Submit submits the item successfully

---

## Teardown
- Log out of the admin portal after test completion (optional for automated runs).
