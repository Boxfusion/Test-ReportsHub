# Test Plan: Verify Can Edit Enabled Shows Edit Button

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
| ADO Test Case | [#105897](https://dev.azure.com/boxfusion/pd-approvals/_workitems/edit/105897) — Verify Can Edit Enabled Shows Edit Button |

> **Note (two-user flow, routing, and Recommend action edit):** Steps 1-16 reuse the proven initiator routing flow from [#104791](https://dev.azure.com/boxfusion/pd-approvals/_workitems/edit/104791) (Verify Recommend Memo) verbatim, through adding Craig M as routing signatory, setting Required Action to "Recommend", and saving.
>
> **Note:** ADO's step numbering (steps 17-18, 20-21 absent from the exported list) indicates edited/removed steps in the source test case; this plan follows the remaining steps 19, 22-32 as exported.
>
> **Note:** The routing row's Edit icon opens THREE fields simultaneously: Required Action, Action Text, and Can Edit (confirmed by ADO step 13's expected result). This test edits Required Action and saves first (steps 13-16), then reopens edit (step 19) to set the separate "Can Edit" dropdown to "Can Edit Contents" (steps 22-24) and saves again — modeling two independent edit/save cycles on the same row, as ADO's step sequence implies.
>
> **Note:** The header's view-mode control opens a popover with three options (Live/Ready/Latest) — click the control to open the popover, then click "Latest" inside it, then assert the control's own badge label changes from "Live" to "Latest". A fresh login resets this back to "Live", so it must be repeated after logging in as Craig.

## Objective
> Validate that enabling "Can Edit Contents" on a routing signatory's row allows that signatory (Craig), once the item reaches their Inbox, to edit the memo's content directly via an Edit button on the Memo Contents tab — and that the edit saves successfully.

## Preconditions
- [ ] App is reachable at https://pd-approvals-adminportal-qa.azurewebsites.net/
- [ ] Initiator credentials are valid (Ian / 123qwe)
- [ ] Recommender credentials are valid (Craig / 123qwe)
- [ ] The initiator has permission to create a new Referral memo
- [ ] "Craig M" is available as a routing signatory option
- [ ] "Recommend" is an available Required Action option on the routing row
- [ ] "Can Edit Contents" is an available Can Edit option on the routing row

## Test Cases

### TC-01 — Verify Can Edit Enabled Shows Edit Button (ADO #105897)

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
  16. CLICK the Edit icon on Craig's routing row again
  17. CLICK the Can Edit dropdown
  18. SELECT the "Can Edit Contents" option
  19. CLICK the Save button
  20. CLICK the Submit button
  21. LOG OUT of Ian's session and LOG IN as Craig (recommender)
  22. NAVIGATE to Workflows → Inbox
  23. OPEN the item matching the recorded Ref No
  24. CLICK the "Memo Contents" tab
  25. CLICK the Edit button next to the audit trail — Purpose field only (each content field has its own Edit/audit pair; this test only ever touches Purpose's)
  26. CLICK the Save button for the Purpose field
- **Expected result:** Craig M is added to the routing table as the signatory. The Edit icon opens Required Action, Action Text and Can Edit fields in edit mode. Setting Required Action to "Recommend" and saving persists it. Reopening edit, setting Can Edit to "Can Edit Contents" and saving persists that too. Submitting shows a success confirmation. Logged in as Craig, the item is found in the Inbox; opening it and switching to the Memo Contents tab shows an Edit button next to the audit trail on the Purpose row. Clicking that Edit button makes the Purpose content area editable; typing "Edited Text" and clicking Save persists the change. Only the Purpose field is touched — Background, Discussion, Financial Implications, Risks and Recommendation are left untouched.
>
> **Note (confirmed live — corrects an earlier misread):** A top-level "edit" icon also sits inside the Memo Contents tabpanel (Shesha's low-code component-designer overlay, for editing the form's schema/config) — its plain accessible name "edit" also matches a loose /edit/i role query and appears before Purpose's own "edit Edit" business button in DOM order. Clicking that dev-tools icon triggers an unrelated "Create New Version" (schema) dialog with no bearing on this feature. Scoping explicitly to Purpose's own row (locating the "Purpose" label, then its nearest ancestor containing an "Edit" button) avoids that icon and clicks the real business Edit button directly — no version dialog involved.
- **Assertions:**
  - [x] ASSERT (BLOCKING) Ian successfully logs into the system
  - [x] ASSERT (BLOCKING) App header switches from "Live" to "Latest" mode after selecting the "Latest" option
  - [x] ASSERT (BLOCKING) Craig M is added to the routing table as the signatory
  - [x] ASSERT (BLOCKING) The Edit icon puts Required Action, Action Text and Can Edit into edit mode
  - [x] ASSERT (BLOCKING) Selecting "Recommend" updates the Required Action and Action Text; Save persists it
  - [x] ASSERT (BLOCKING) Selecting "Can Edit Contents" updates the Can Edit field; Save persists it
  - [x] ASSERT (BLOCKING) Submitting shows a success confirmation
  - [x] ASSERT (BLOCKING) Craig successfully logs into the system
  - [x] ASSERT (BLOCKING) The submitted item (matched by Ref No) is found in Craig's Inbox
  - [x] ASSERT (BLOCKING) The Memo Contents tab shows an Edit button next to the audit trail
  - [x] ASSERT (BLOCKING) Clicking Edit makes the content area editable, and Save persists the change

---

## Teardown
- Log out of the admin portal after test completion (optional for automated runs).
