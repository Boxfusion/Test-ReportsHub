# Test Plan: Verify User Can Edit and Delete a Signatory

> **Status:** Ready
> **Owner:** QA
> **Last Updated:** 2026-07-08
> **Estimated Duration:** 90s

## Metadata
| Field | Value |
|-------|-------|
| App URL | https://pd-approvals-adminportal-qa.azurewebsites.net/ |
| Environment | QA |
| Login As | Ian / 123qwe |
| ADO Plan | [#100853](https://dev.azure.com/boxfusion/pd-approvals/_testPlans/define?planId=100853&suiteId=100854) |
| ADO Suite | #100854 |
| ADO Test Case | [#102670](https://dev.azure.com/boxfusion/pd-approvals/_workitems/edit/102670) — Verify user can edit and delete a signatory |

> **Note:** ADO specifies logging in "as Initiator (Craig)". This run uses the credentials supplied for this session (Ian / 123qwe) against the same login page instead.
>
> **Note:** The header's view-mode control opens a popover with three options (Live/Ready/Latest) rather than toggling directly — clicking the control alone does not change the mode. The correct sequence is: click the control to open the popover, then click the "Latest" option inside it, then assert the control's own badge label changes from "Live" to "Latest".
>
> **Note:** This QA environment can sit on an "Initializing..." splash screen for well over the default 15s action timeout before the login form mounts — the login helper uses a generous timeout to tolerate this rather than treating it as a script failure.
>
> **Note:** ADO's field-population step lists Purpose, Background, Discussion, Financial Implications and Recommendation, but omits **Risks** — which [#102637](https://dev.azure.com/boxfusion/pd-approvals/_workitems/edit/102637) already established is also mandatory on this same Compose step. This plan populates Risks as well so Next genuinely navigates past Compose.
>
> **Note:** Reuses the proven flow from [#102653](https://dev.azure.com/boxfusion/pd-approvals/_workitems/edit/102653)/[#102661](https://dev.azure.com/boxfusion/pd-approvals/_workitems/edit/102661)/[#102664](https://dev.azure.com/boxfusion/pd-approvals/_workitems/edit/102664)/[#102669](https://dev.azure.com/boxfusion/pd-approvals/_workitems/edit/102669) (Live/Latest switch, per-tab population, genuine-navigation checks, keyboard-based approver selection, and role-based row/cell targeting for the custom Routing table) up through adding a routing signatory.
>
> **Note (UI implementation details found while scripting):**
> - Clicking Edit turns the row's "Required Action" cell into an Ant Design Select and "Action Text" into a plain textbox; the row's trailing icons change from edit/delete to **save/cancel**. The Required Action dropdown's options (Recommend, Support, Action, Review, Referral, Consult, Concur, ...) are short and fully rendered — but they are **not** `role="option"` (unlike the CC/approver dropdowns), so they had to be matched by plain visible text instead.
> - Clicking the Required Action field's search input directly is intercepted by its own sibling `.ant-select-selection-item` span (same quirk as the CC and approver fields) — click that visible span instead.
> - After changing Required Action, the row stays in edit mode. **Delete is not available again until the change is saved** (clicking the save icon) — attempting to click Delete while still in edit mode times out because that button doesn't exist yet in that state.
> - Deleting genuinely worked as ADO describes: Delete → Cancel leaves the row intact; Delete → OK removes it, leaving the "No Approvers" empty state (which itself has two matching text nodes — a heading and a paragraph — so assertions on it need `.first()`).

## Objective
> Validate that a signatory added to the Routing table can have its Required Action edited (with Action Text updating accordingly), and can be deleted — with the delete action cancellable before it is confirmed.

## Preconditions
- [ ] App is reachable at https://pd-approvals-adminportal-qa.azurewebsites.net/
- [ ] User credentials are valid (Ian / 123qwe)
- [ ] The acting user has permission to create a new Referral memo
- [ ] "Admire" is available as a routing signatory option

## Test Cases

### TC-01 — Verify user can edit and delete a signatory (ADO #102670)

- **Type:** Happy path
- **Steps:**
  1. NAVIGATE to https://pd-approvals-adminportal-qa.azurewebsites.net/login and log in with valid credentials
  2. CLICK the "Click to change view mode" control in the header to open the Live/Ready/Latest popover, then CLICK the "Latest" option in that popover
  3. CLICK the sidebar Toggle in the top-left corner
  4. CLICK the Workflows dropdown
  5. CLICK the My Items menu item
  6. CLICK the Create New button
  7. CLICK the New Referrals subtype
  8. CLICK the CC field and SELECT a signatory
  9. CLICK the Subject field and populate it with test input
  10. CLICK each of the Purpose, Background, Discussion, Financial Implications, Risks and Recommendation tabs individually and populate each with test input
  11. CLICK the Next button (Compose → Attachments)
  12. CLICK the Next button (Attachments → Routing)
  13. CLICK the Select Signatory dropdown and SELECT "Admire"
  14. CLICK the Add button
  15. CLICK the Edit icon from the routing table row
  16. CHANGE the Required Action to a different value
  17. CLICK the Delete button
  18. CLICK the Cancel button on the delete confirmation popup
  19. CLICK the Delete button again
  20. CLICK the OK button on the delete confirmation popup
- **Expected result:** Admire is added to the routing table. Clicking Edit opens the Required Action (and Can Edit access) in edit mode; changing Required Action updates Action Text accordingly. Clicking Delete then Cancel leaves the signatory intact. Clicking Delete then OK removes the signatory from the routing table.
- **Assertions:**
  - [x] ASSERT (BLOCKING) User successfully logs into the system
  - [x] ASSERT (BLOCKING) App header switches from "Live" to "Latest" mode after selecting the "Latest" option
  - [x] ASSERT (BLOCKING) The Routing step is reached
  - [x] ASSERT (BLOCKING) Admire is added to the routing table
  - [x] ASSERT (BLOCKING) Clicking Edit puts the Required Action field into an editable state
  - [x] ASSERT (BLOCKING) Changing Required Action updates Action Text accordingly
  - [x] ASSERT (BLOCKING) Clicking Delete shows a confirmation popup with Cancel and OK
  - [x] ASSERT (BLOCKING) Clicking Cancel closes the popup and the signatory remains in the table
  - [x] ASSERT (BLOCKING) Clicking Delete then OK removes the signatory from the routing table

---

## Teardown
- Log out of the admin portal after test completion (optional for automated runs).
