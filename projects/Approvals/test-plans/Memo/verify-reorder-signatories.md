# Test Plan: Verify User Can Reorder Signatories

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
| ADO Test Case | [#102669](https://dev.azure.com/boxfusion/pd-approvals/_workitems/edit/102669) — Verify user can reorder signatories |

> **Note:** ADO specifies logging in "as Initiator (Craig)". This run uses the credentials supplied for this session (Ian / 123qwe) against the same login page instead.
>
> **Note:** The header's view-mode control opens a popover with three options (Live/Ready/Latest) rather than toggling directly — clicking the control alone does not change the mode. The correct sequence is: click the control to open the popover, then click the "Latest" option inside it, then assert the control's own badge label changes from "Live" to "Latest".
>
> **Note:** This QA environment can sit on an "Initializing..." splash screen for well over the default 15s action timeout before the login form mounts — the login helper uses a generous timeout to tolerate this rather than treating it as a script failure.
>
> **Note:** ADO's field-population step lists Purpose, Background, Discussion, Financial Implications and Recommendation, but omits **Risks** — which [#102637](https://dev.azure.com/boxfusion/pd-approvals/_workitems/edit/102637) already established is also mandatory on this same Compose step. This plan populates Risks as well so Next genuinely navigates past Compose.
>
> **Note:** Reuses the proven flow from [#102653](https://dev.azure.com/boxfusion/pd-approvals/_workitems/edit/102653)/[#102661](https://dev.azure.com/boxfusion/pd-approvals/_workitems/edit/102661)/[#102664](https://dev.azure.com/boxfusion/pd-approvals/_workitems/edit/102664) (Live/Latest switch, per-tab population, genuine-navigation checks, and combobox-based approver selection with "Add") up through adding the first routing signatory.
>
> **Note (UI implementation details found while scripting):**
> - Selecting an approver by typing a search filter and pressing ArrowDown/Enter (the pattern that works for the CC field) misfired here: the search input ended up showing the literal text "unknown" and Enter re-selected the already-added approver, which the app correctly rejected with "Duplicates are restricted. Add a different approver."
> - Clicking a specific option by role/text is also unreliable: the dropdown is virtualized (`rc-virtual-list`), and the *first* rendered "option" node is sometimes an off-screen measurement placeholder that nonetheless carries the real first item's `aria-label` — clicking it (even with `force: true`) fails with "Element is outside of the viewport" because it genuinely isn't on screen.
> - The reliable approach that this spec uses: pure keyboard traversal — read the currently highlighted option via `aria-activedescendant`, step forward with ArrowDown until its `aria-label` matches the target name, then press Enter. This never depends on any option's visibility or bounding box.
> - The Routing table is a **custom Shesha component, not a standard Ant Design `<Table>`** — neither `table tbody tr` nor `.ant-table-row` match anything. It does expose proper table semantics (`role="row"`/`"rowgroup"`/`"cell"`), so role-based locators scoped to the data rowgroup work reliably.
> - Each row's accessible name is "more `<name>` `<title>` Approve Approve `<Can Edit>` edit delete" — the "more" (⋮) icon in the first cell is the drag handle.
> - Reordering isn't native HTML5 drag-and-drop — `Locator.dragTo()` did not need to be attempted since a manual `mouse.down()` → several intermediate `mouse.move()` steps → `mouse.up()` sequence (dragging from the ⋮ handle cell of the row to be moved to just above the target row's handle cell) worked on the first attempt that used correct row/cell locators.

## Objective
> Validate that two signatories added to the Routing table can be reordered via drag-and-drop, moving the second-added signatory into the first row.

## Preconditions
- [ ] App is reachable at https://pd-approvals-adminportal-qa.azurewebsites.net/
- [ ] User credentials are valid (Ian / 123qwe)
- [ ] The acting user has permission to create a new Referral memo
- [ ] "Admire" and "Kopano" are both available as routing signatory options

## Test Cases

### TC-01 — Verify user can reorder signatories (ADO #102669)

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
  15. CLICK the Select Signatory dropdown and SELECT "Kopano"
  16. CLICK the Add button
  17. DRAG the last signatory (Kopano, row 2) into the first row of the routing table
- **Expected result:** Both Admire and Kopano are added to the routing table in the order added (Admire first, Kopano second). After dragging Kopano into the first row, the routing table reflects the new order (Kopano first, Admire second).
- **Assertions:**
  - [x] ASSERT (BLOCKING) User successfully logs into the system
  - [x] ASSERT (BLOCKING) App header switches from "Live" to "Latest" mode after selecting the "Latest" option
  - [x] ASSERT (BLOCKING) The Routing step is reached
  - [x] ASSERT (BLOCKING) Admire is added to the routing table as the first row
  - [x] ASSERT (BLOCKING) Kopano is added to the routing table as the second row
  - [x] ASSERT (BLOCKING) After dragging, Kopano appears before Admire in the routing table

---

## Teardown
- Log out of the admin portal after test completion (optional for automated runs).
