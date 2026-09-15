# Test Plan: Verify Add Referral Functionality

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
| Login As (Recommender) | Craig / 123qwe |
| ADO Plan | [#100853](https://dev.azure.com/boxfusion/pd-approvals/_testPlans/define?planId=100853&suiteId=100854) |
| ADO Suite | #100854 |
| ADO Test Case | [#102676](https://dev.azure.com/boxfusion/pd-approvals/_workitems/edit/102676) — Verify Add referral functionality |

> **Note (two-user flow + Required Action=Recommend):** Reuses the exact submission flow proven in [#104791](https://dev.azure.com/boxfusion/pd-approvals/_workitems/edit/104791) through opening the item in Craig's Inbox (Ian submits with Craig's routing Required Action set to "Recommend" via the edit-row pattern from [#102670](https://dev.azure.com/boxfusion/pd-approvals/_workitems/edit/102670)), including the Craig-side Live→Latest re-switch (view mode resets on fresh login).
>
> **Note:** Unlike #104791, this test does **not** select the Recommend/Do-not-Recommend radio or submit the main review — it instead uses the **Referrals** panel's own "Add" button to refer the item to a different signatory (e.g. "Bonolo"), independent of the main Approve/Recommend action.
>
> **Note:** ADO's expected result gives a literal example date string "Waiting for Response since 08-07-2026 (due 14-07-2026)" — the "since" date is today's date (session date), not a fixed value; the plan/spec assert on the pattern (`Waiting for Response since <today> (due <future date>)`) rather than a hardcoded date.
>
> **Note:** Confirmed live — the "Add Referral" popup has three fields: Person (a combobox, resolved via the same keyboard-traversal helper used for approver/CC dropdowns; e.g. "Bonolo Bona"), Due Date (a text input that opens an Ant Design calendar), and Comments (a plain `<textarea>` with a visible "Comments *" label but **no** placeholder text or accessible label association — must be targeted directly via `textarea`, not `getByPlaceholder`/`getByLabel`).

## Objective
> Validate that from the Referrals panel on an in-progress memo, a user can add a referral to another signatory — selecting a person, a future due date, and comments — and that the referral then appears under the panel showing "Waiting for Response since <date> (due <date>)".

## Preconditions
- [ ] App is reachable at https://pd-approvals-adminportal-qa.azurewebsites.net/
- [ ] Initiator credentials are valid (Ian / 123qwe)
- [ ] Recommender credentials are valid (Craig / 123qwe)
- [ ] The initiator has permission to create a new Referral memo
- [ ] "Craig M" is available as a routing signatory option
- [ ] "Bonolo" (or another signatory) is available in the referral Person dropdown

## Test Cases

### TC-01 — Verify Add Referral Functionality (ADO #102676)

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
  12. CLICK the Edit icon on Craig's routing row, set Required Action to "Recommend", CLICK Save
  13. CLICK the Submit button
  14. LOG OUT of Ian's session and LOG IN as Craig (recommender)
  15. NAVIGATE to Workflows → Inbox
  16. OPEN the item matching the recorded Ref No
  17. NAVIGATE to the Referrals panel and CLICK the Add button
  18. CLICK the Person Dropdown
  19. SELECT a signatory from the list (e.g. Bonolo)
  20. CLICK the Due Date datepicker
  21. SELECT a future date
  22. POPULATE Comments (e.g. "Referral comments")
  23. CLICK the Add button
- **Expected result:** The "Add Referral" popup appears with a Person dropdown, Due Date datepicker, and Comments field. After selecting a signatory, a future due date, and comments, and clicking Add, the selected signatory is displayed under the Referrals panel with "Waiting for Response since <today's date> (due <selected future date>)" shown next to their name.
- **Assertions:**
  - [x] ASSERT (BLOCKING) Ian successfully logs into the system
  - [x] ASSERT (BLOCKING) App header switches from "Live" to "Latest" mode after selecting the "Latest" option
  - [x] ASSERT (BLOCKING) Craig M is added to the routing table as the signatory with Required Action "Recommend"
  - [x] ASSERT (BLOCKING) Submitting shows a success confirmation
  - [x] ASSERT (BLOCKING) Craig successfully logs into the system
  - [x] ASSERT (BLOCKING) The submitted item (matched by Ref No) is found in Craig's Inbox and opens successfully
  - [x] ASSERT (BLOCKING) Clicking the Referrals panel's Add button shows an Add Referral popup with a Person dropdown
  - [x] ASSERT (BLOCKING) Selecting a signatory populates the Person field
  - [x] ASSERT (BLOCKING) Selecting a future date populates the Due Date field
  - [x] ASSERT (BLOCKING) After clicking Add, the signatory appears under the Referrals panel with a "Waiting for Response since ... (due ...)" label

---

## Teardown
- Log out of the admin portal after test completion (optional for automated runs).
