# Test Plan: Verify Recommend Memo

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
| ADO Test Case | [#104791](https://dev.azure.com/boxfusion/pd-approvals/_workitems/edit/104791) — Verify Recommend Memo |

> **Note (two-user flow):** Reuses the initiator/approver flow proven in [#102699](https://dev.azure.com/boxfusion/pd-approvals/_workitems/edit/102699) — Ian submits, then logs out so Craig can log in and act on it.
>
> **Note (Required Action edit):** Reuses the routing-row edit pattern proven in [#102670](https://dev.azure.com/boxfusion/pd-approvals/_workitems/edit/102670): click the row's Edit icon, then click the `.ant-select-selection-item` span (not the search input directly, which is intercepted) to open the Required Action dropdown, then click the plain-text "Recommend" option (this dropdown's options are not `role=option`). Confirmed in #102670 that "Recommend" is one of the available Required Action values (Approve/Recommend/Support/Action/Review/Referral/Consult/Concur/...).
>
> **Note:** The submit-time validation "The CC recipient must be one of the routing approvers" (confirmed in #102699) means CC must select Craig, the same person added as the routing signatory.
>
> **Note:** The header's view-mode control opens a popover with three options (Live/Ready/Latest) — click the control to open the popover, then click "Latest" inside it, then assert the control's own badge label changes from "Live" to "Latest".
>
> **Note:** Confirmed live — when Required Action is "Recommend", Craig's review screen shows two radios: "Recommend" and "Do not Recommend". A loose `/recommend/i` name match is ambiguous (matches both) and throws a Playwright strict-mode violation; the exact label "Recommend" must be used.
>
> **Note:** A fresh login resets the view-mode control back to "Live" — the Live→Latest switch must be repeated after logging in as Craig, not just once as Ian (this was an open question in [#102699](https://dev.azure.com/boxfusion/pd-approvals/_workitems/edit/102699)'s notes; confirmed here that it does need repeating).
>
> **Note:** The Recommend review screen has a mandatory "Supporting Comments" text field (placeholder "Start typing…") that does not exist on the plain Approve/Decline screen — it must be populated before Submit, otherwise the click hangs/the Submit button cannot be resolved reliably. Confirmed live.
>
> **Note:** Confirmed live — there is no toast/dialog "success" message after the final Submit. The page instead navigates directly to the completed item view: the header badge changes to "COMPLETED" and the Memo Actions timeline shows an entry "Craig M: Sales Director: Recommend — Approved completed just now" with the submitted comment beneath it. This plan asserts on that genuine post-condition instead of a generic "success" text match.

## Objective
> Validate that when a routing signatory's Required Action is set to "Recommend" instead of the default "Approve", the assigned user sees a "Recommend" option (instead of/alongside Approve/Decline) on the review screen, and submitting it with "Recommend" selected succeeds and moves the item to the next step.

## Preconditions
- [ ] App is reachable at https://pd-approvals-adminportal-qa.azurewebsites.net/
- [ ] Initiator credentials are valid (Ian / 123qwe)
- [ ] Recommender credentials are valid (Craig / 123qwe)
- [ ] The initiator has permission to create a new Referral memo
- [ ] "Craig M" is available as a routing signatory option
- [ ] "Recommend" is an available Required Action option on the routing row

## Test Cases

### TC-01 — Verify Recommend Memo (ADO #104791)

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
  20. CLICK the "Recommend" radio button
  21. POPULATE the mandatory Supporting Comments field
  22. CLICK the Submit button
- **Expected result:** The memo is submitted successfully with Craig's routing entry set to Required Action "Recommend". Logged in as Craig, the item appears in the Inbox and opens to a review step showing "Recommend"/"Do not Recommend" options and a mandatory Supporting Comments field. Selecting "Recommend", filling comments, and clicking Submit moves the item to a "COMPLETED" state with a timeline entry showing "Craig M: Sales Director: Recommend" and the submitted comment (no separate success toast is shown).
- **Assertions:**
  - [x] ASSERT (BLOCKING) Ian successfully logs into the system
  - [x] ASSERT (BLOCKING) App header switches from "Live" to "Latest" mode after selecting the "Latest" option
  - [x] ASSERT (BLOCKING) Craig M is added to the routing table as the signatory
  - [x] ASSERT (BLOCKING) The Edit icon puts the row's Required Action into an editable dropdown
  - [x] ASSERT (BLOCKING) Selecting "Recommend" updates the Required Action and Action Text
  - [x] ASSERT (BLOCKING) Submitting shows a success confirmation
  - [x] ASSERT (BLOCKING) Craig successfully logs into the system
  - [x] ASSERT (BLOCKING) The submitted item (matched by Ref No) is found in Craig's Inbox
  - [x] ASSERT (BLOCKING) Opening the item shows exact "Recommend" and "Do not Recommend" radio options
  - [x] ASSERT (BLOCKING) Selecting "Recommend", filling comments, and submitting moves the item to "COMPLETED" with a matching timeline entry and comment

---

## Teardown
- Log out of the admin portal after test completion (optional for automated runs).
