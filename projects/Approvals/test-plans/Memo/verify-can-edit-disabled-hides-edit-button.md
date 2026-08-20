# Test Plan: Verify Can Edit Disabled Hides Edit Button

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
| ADO Test Case | [#105899](https://dev.azure.com/boxfusion/pd-approvals/_workitems/edit/105899) — Verify Can Edit Disabled Hides Edit Button |

> **Note (negative counterpart of #105897):** This is the negative case of [#105897](https://dev.azure.com/boxfusion/pd-approvals/_workitems/edit/105897) (Verify Can Edit Enabled Shows Edit Button). Steps 1-17 reuse the proven initiator routing flow verbatim — Craig M added as routing signatory, Required Action set to "Recommend", saved, submitted — but the "Can Edit" field is deliberately left at its default (never set to "Can Edit Contents").
>
> **Note (confirmed live — corrects the step wording):** ADO's expected result for the final step says the Edit button "should not be enabled" (implying disabled-but-present), but live behavior matches the test case's own TITLE more precisely: the "edit Edit" button is absent from the row entirely, leaving only its "field-time audit" sibling. This plan asserts on absence, not a disabled state.
>
> **Note:** Confirmed live in #105897 — a top-level "edit" icon also exists in the Memo Contents tabpanel (Shesha's low-code component-designer overlay, unrelated to this feature) and can be mismatched by a loose `/edit/i` role query. This plan scopes explicitly to the Purpose row's own Edit button (anchored on the stable "audit" button, since the Edit button's own state is exactly what's under test).
>
> **Note:** The header's view-mode control opens a popover with three options (Live/Ready/Latest) — click the control to open the popover, then click "Latest" inside it, then assert the control's own badge label changes from "Live" to "Latest".

## Objective
> Validate that when a routing signatory's "Can Edit" permission is left unset (not "Can Edit Contents"), that signatory (Craig) sees the Memo Contents tab's per-field Edit button in a disabled state, preventing them from editing the memo's content.

## Preconditions
- [ ] App is reachable at https://pd-approvals-adminportal-qa.azurewebsites.net/
- [ ] Initiator credentials are valid (Ian / 123qwe)
- [ ] Recommender credentials are valid (Craig / 123qwe)
- [ ] The initiator has permission to create a new Referral memo
- [ ] "Craig M" is available as a routing signatory option
- [ ] "Recommend" is an available Required Action option on the routing row

## Test Cases

### TC-01 — Verify Can Edit Disabled Hides Edit Button (ADO #105899)

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
  15. CLICK the Save button (leaving Can Edit unset)
  16. CLICK the Submit button
  17. LOG OUT of Ian's session and LOG IN as Craig (recommender)
  18. NAVIGATE to Workflows → Inbox
  19. OPEN the item matching the recorded Ref No
  20. CLICK the "Memo Contents" tab
- **Expected result:** Craig M is added to the routing table as the signatory. The Edit icon opens Required Action, Action Text and Can Edit fields in edit mode. Setting Required Action to "Recommend" and saving persists it (Can Edit remains unset). Submitting shows a success confirmation. Logged in as Craig, the item is found in the Inbox; opening it and switching to the Memo Contents tab shows the Purpose field's Edit button hidden entirely — only its "audit" button remains — since Can Edit was never granted.
- **Assertions:**
  - [x] ASSERT (BLOCKING) Ian successfully logs into the system
  - [x] ASSERT (BLOCKING) App header switches from "Live" to "Latest" mode after selecting the "Latest" option
  - [x] ASSERT (BLOCKING) Craig M is added to the routing table as the signatory
  - [x] ASSERT (BLOCKING) The Edit icon puts Required Action, Action Text and Can Edit into edit mode
  - [x] ASSERT (BLOCKING) Selecting "Recommend" updates the Required Action and Action Text; Save persists it
  - [x] ASSERT (BLOCKING) Submitting shows a success confirmation
  - [x] ASSERT (BLOCKING) Craig successfully logs into the system
  - [x] ASSERT (BLOCKING) The submitted item (matched by Ref No) is found in Craig's Inbox
  - [x] ASSERT (BLOCKING) The Memo Contents tab's Purpose field Edit button is absent entirely (audit button still present)

---

## Teardown
- Log out of the admin portal after test completion (optional for automated runs).
