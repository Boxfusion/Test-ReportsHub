# Test Plan: Verify Approve Memo

> **Status:** Ready
> **Owner:** QA
> **Last Updated:** 2026-07-08
> **Estimated Duration:** 210s

## Metadata
| Field | Value |
|-------|-------|
| App URL | https://pd-approvals-adminportal-qa.azurewebsites.net/ |
| Environment | QA |
| Login As (Initiator) | Ian / 123qwe |
| Login As (Recommender) | Craig / 123qwe |
| Login As (Approver) | Bonolob / 123qwe |
| ADO Plan | [#100853](https://dev.azure.com/boxfusion/pd-approvals/_testPlans/define?planId=100853&suiteId=100854) |
| ADO Suite | #100854 |
| ADO Test Case | [#104789](https://dev.azure.com/boxfusion/pd-approvals/_workitems/edit/104789) — Verify Approve Memo |

> **Note (three-user flow):** This is a multi-signatory chain: Ian (initiator) submits a memo routed to **two** signatories — Craig M (Required Action = "Recommend") and Bonolo (Required Action = "Approve"). Craig logs in first and recommends; the item then remains "IN PROGRESS" (not completed) because Bonolo still needs to act. Only after Bonolo logs in and approves does the item reach "COMPLETED". Reuses the two-user flow and Required-Action-edit pattern proven in [#104791](https://dev.azure.com/boxfusion/pd-approvals/_workitems/edit/104791) for the Craig leg, extended with a second signatory and a third login.
>
> **Note:** Login credentials for the third user (the "Approver") were supplied as username `Bonolob`, password `123qwe`, matching ADO step 30's literal wording ("Login as Bonolob (Approver)") even though the display name shown in the UI is "Bonolo" (e.g. "Bonolo Bona" as seen in [#102676](https://dev.azure.com/boxfusion/pd-approvals/_workitems/edit/102676)'s referral dropdown).
>
> **Note:** The submit-time validation "The CC recipient must be one of the routing approvers" (confirmed in #102699) is satisfied here by setting CC to Craig, one of the two routing approvers.
>
> **Note:** A fresh login resets the view-mode control back to "Live" — the Live→Latest switch must be repeated after each of Craig's and Bonolo's logins (confirmed in #104791).
>
> **Note:** Confirmed in #104791 — the Recommend review screen has a mandatory "Supporting Comments" `<textarea>` (no placeholder/label association) that must be filled before Submit. Whether the plain Approve screen (Bonolo's leg) has the same mandatory field, or behaves like the plain Approve/Decline screen seen in [#102699](https://dev.azure.com/boxfusion/pd-approvals/_workitems/edit/102699) (no mandatory comments), is confirmed live during this run.
>
> **Note:** Confirmed live — "Approve" is already the routing row's **default** Required Action (unlike "Recommend", which must be explicitly selected). Because the row's own closed-select display already reads "Approve" before you even open the dropdown, an unscoped page-wide text match for the "Approve" option is ambiguous (matches both the closed display and the dropdown option) and throws a Playwright strict-mode violation — the option click must be scoped to the open `.ant-select-dropdown` panel specifically.
>
> **Note (confirmed discrepancy):** "Approve" is not actually a selectable item in the Required Action dropdown at all — opening it shows only Recommend/Support/Action/Review/Referral/Consult/Concur. Since a newly added signatory already defaults to "Approve" server-side, ADO's scripted steps 19-22 ("click dropdown, select Approve option") cannot literally be performed as written when the target is Approve — the dropdown has nothing to click. This plan verifies the row already reads "Approve" and clicks Save directly, skipping the impossible re-selection, for any signatory whose target Required Action is "Approve".

## Objective
> Validate a full multi-signatory memo approval chain: after Ian submits a memo routed to Craig (Recommend) and Bonolo (Approve), Craig's recommendation leaves the item "IN PROGRESS", and Bonolo's subsequent approval moves the item to "COMPLETED".

## Preconditions
- [ ] App is reachable at https://pd-approvals-adminportal-qa.azurewebsites.net/
- [ ] Initiator credentials are valid (Ian / 123qwe)
- [ ] Recommender credentials are valid (Craig / 123qwe)
- [ ] Approver credentials are valid (Bonolob / 123qwe)
- [ ] "Craig M" and "Bonolo" are both available as routing signatory options

## Test Cases

### TC-01 — Verify Approve Memo (ADO #104789)

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
  10. CLICK the Select Signatory dropdown and SELECT "Craig M", then CLICK Add
  11. CLICK the Edit icon on Craig's routing row, set Required Action to "Recommend", CLICK Save
  12. CLICK the Select Signatory dropdown and SELECT "Bonolo", then CLICK Add
  13. CLICK the Edit icon on Bonolo's routing row, set Required Action to "Approve", CLICK Save
  14. CLICK the Submit button
  15. LOG OUT of Ian's session and LOG IN as Craig (recommender)
  16. NAVIGATE to Workflows → Inbox
  17. OPEN the item matching the recorded Ref No
  18. CLICK the "Recommend" radio button, populate Supporting Comments, CLICK Submit
  19. LOG OUT of Craig's session and LOG IN as Bonolob (approver)
  20. NAVIGATE to Workflows → Inbox
  21. OPEN the item matching the recorded Ref No
  22. CLICK the "Approve" radio button
  23. CLICK the Submit button
- **Expected result:** The memo is submitted successfully to both Craig and Bonolo. After Craig recommends, the item moves to the next step but remains "IN PROGRESS" (Bonolo still pending). After Bonolo approves, a success message is shown and the item status changes to "COMPLETED".
- **Assertions:**
  - [x] ASSERT (BLOCKING) Ian successfully logs into the system
  - [x] ASSERT (BLOCKING) App header switches from "Live" to "Latest" mode after selecting the "Latest" option
  - [x] ASSERT (BLOCKING) Craig M is added to the routing table with Required Action "Recommend"
  - [x] ASSERT (BLOCKING) Bonolo is added to the routing table with Required Action "Approve"
  - [x] ASSERT (BLOCKING) Submitting shows a success confirmation
  - [x] ASSERT (BLOCKING) Craig successfully logs into the system and finds the item in his Inbox
  - [x] ASSERT (BLOCKING) After Craig recommends and submits, the item is "IN PROGRESS" (not completed)
  - [x] ASSERT (BLOCKING) Bonolob successfully logs into the system and finds the item in his Inbox
  - [x] ASSERT (BLOCKING) Opening the item shows an "Approve" radio option
  - [x] ASSERT (BLOCKING) After Bonolo approves and submits, the item status changes to "COMPLETED"

---

## Teardown
- Log out of the admin portal after test completion (optional for automated runs).
