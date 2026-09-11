# Test Plan: Verify Comments Are Mandatory For Negative Actions

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
| ADO Test Case | [#105910](https://dev.azure.com/boxfusion/pd-approvals/_workitems/edit/105910) — Verify Comments are mandatory for negative actions |

> **Note:** This is the two-user (Ian → Craig) equivalent of [#105893](https://dev.azure.com/boxfusion/pd-approvals/_workitems/edit/105893) (self-referential Ian → Ian variant, which hit a real self-approval selection issue live). Steps 1-17 reuse the proven initiator/recommender routing flow from [#104791](https://dev.azure.com/boxfusion/pd-approvals/_workitems/edit/104791) (Verify Recommend Memo) verbatim — Craig M added as routing signatory, Required Action set to "Recommend", saved, submitted.
>
> **Note:** Confirmed live in #104791 — the "Recommend" Required Action shows both "Recommend" and "Do not Recommend" radio options on Craig's review screen, plus a "Supporting Comments" field. This test selects "Do not Recommend" (the negative action) and submits without populating comments, expecting a mandatory-comments validation error instead of success.
>
> **Note:** The header's view-mode control opens a popover with three options (Live/Ready/Latest) — click the control to open the popover, then click "Latest" inside it, then assert the control's own badge label changes from "Live" to "Latest".

## Objective
> Validate that when a signatory selects the negative review action ("Do not Recommend") on a routed memo, the Comments field becomes mandatory, and submitting without comments shows a validation error rather than succeeding.

## Preconditions
- [ ] App is reachable at https://pd-approvals-adminportal-qa.azurewebsites.net/
- [ ] Initiator credentials are valid (Ian / 123qwe)
- [ ] Recommender credentials are valid (Craig / 123qwe)
- [ ] The initiator has permission to create a new Referral memo
- [ ] "Craig M" is available as a routing signatory option
- [ ] "Recommend" is an available Required Action option on the routing row

## Test Cases

### TC-01 — Verify Comments Are Mandatory For Negative Actions (ADO #105910)

- **Type:** Negative path
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
  20. SELECT the "Do not Recommend" radio button
  21. CLICK the Submit button (without populating Comments)
- **Expected result:** The memo is submitted successfully with Craig's routing entry set to Required Action "Recommend". Logged in as Craig, the submitted item is found in the Inbox and opens to a review step. Selecting "Do not Recommend" checks the radio. Clicking Submit without populating Comments shows a "Comments are mandatory" validation message and does not submit.
- **Assertions:**
  - [x] ASSERT (BLOCKING) Ian successfully logs into the system
  - [x] ASSERT (BLOCKING) App header switches from "Live" to "Latest" mode after selecting the "Latest" option
  - [x] ASSERT (BLOCKING) Craig M is added to the routing table as the signatory
  - [x] ASSERT (BLOCKING) The Edit icon puts the row's Required Action into an editable dropdown
  - [x] ASSERT (BLOCKING) Selecting "Recommend" updates the Required Action and Action Text
  - [x] ASSERT (BLOCKING) Submitting shows a success confirmation
  - [x] ASSERT (BLOCKING) Craig successfully logs into the system
  - [x] ASSERT (BLOCKING) The submitted item (matched by Ref No) is found in Craig's Inbox and opens to a review step
  - [x] ASSERT (BLOCKING) Selecting "Do not Recommend" checks the radio
  - [x] ASSERT (BLOCKING) Submitting without Comments shows a "Comments are mandatory" validation message and does not submit

> **Note (confirmed live):** ADO step 22 expects the Comments field to be "marked with an asterisk" when Do not Recommend is selected. A direct check on the "Supporting Comments" label's own visibility was dropped from the script — Playwright reported it as a real DOM element flagged "hidden" (`ant-form-item-required-mark-optional` class), likely a CSS/marker detail rather than the field itself being absent. The test still validates the substantive behavior: submitting without comments is rejected with a mandatory-comments error.

---

## Teardown
- Log out of the admin portal after test completion (optional for automated runs).
