# Test Plan: Verify Reassign Function

> **Status:** Passing
> **Owner:** QA
> **Last Updated:** 2026-07-17
> **Estimated Duration:** 35s

## Metadata
| Field | Value |
|-------|-------|
| App URL | https://pd-approvals-adminportal-qa.azurewebsites.net/ |
| Environment | QA |
| Login As (Initiator) | Ian / 123qwe |
| Login As (Reassign target) | Craig / 123qwe |
| ADO Plan | [#100853](https://dev.azure.com/boxfusion/pd-approvals/_testPlans/define?planId=100853&suiteId=100854) |
| ADO Suite | #100854 |
| ADO Test Case | [#106169](https://dev.azure.com/boxfusion/pd-approvals/_workitems/edit/106169) — Verify Reassign function |

> **Note (navigation):** Confirmed live — the sidebar has a top-level **Memos** item, distinct from **Workflows** (which every other sibling plan in this suite uses, e.g. [verify-retract-functionality.md](verify-retract-functionality.md)). Memos → Dashboard opens the **Memos Dashboard** grid, a global, all-users report (not scoped to the initiator's own submissions) with columns including "Active Step" and "Current Assignee(s)" — matching ADO's own step-13 expected-result wording exactly.
>
> **Note (no setup needed):** Unlike the sibling Retract/Recommend/Send Back plans, this plan does **not** need to create a new memo first — the Memos Dashboard already lists many existing "In Progress" items system-wide (confirmed live: 999 total items). The test picks the first "In Progress" row whose current assignee isn't already Craig M, so the reassignment is a genuine, observable change.
>
> **Note (highlight-not-open):** ADO's step 7 is explicit: "only click on top of the item e.g. on the ref number to highlight the item" (not open its detail view) for the Reassign button to appear above the table. This is the same interaction pattern documented for the My Items **Retract** toolbar button in [#105186](https://dev.azure.com/boxfusion/pd-approvals/_workitems/edit/105186) — selecting/highlighting a row reveals row-scoped action buttons, distinct from opening the item.
>
> **Note (known risk):** [A logged bug](../../test-reports/bugs/2026-07-09-retract-from-myitems-toolbar-fails-500.md) found that the My Items grid-toolbar **Retract** action fails server-side (HTTP 500) despite the dialog appearing to close successfully. Reassign is a different backend action, but this run explicitly verifies the assignee column actually updates rather than trusting dialog-close alone, in case the same class of issue applies here.
>
> **Note (Reassign dialog structure — confirmed live):** The dialog has two visually similar but differently-implemented fields, easy to conflate: **Step** ("Select a User Task") is a plain button that opens a `role=menuitem` list — it is *not* an Ant Select. **Assignee** is the dialog's only genuine Ant Select combobox (virtualized, same keyboard-traversal pattern as every other Ant Select in this app). A read-only **"Text field1"** input separately mirrors the item's real current step (e.g. "Approve") as soon as the dialog opens, independent of the Step button. Confirming this took several live iterations — an initial guess that Step was a combobox actually opened the Assignee list instead (visually verified via screenshot: the focused/highlighted box showed a name list, not step names).

## Objective
> Validate that from the Memos Dashboard, highlighting an "In Progress" item reveals a Reassign button; clicking it opens a Reassign dialog where the current active step is shown, a different assignee can be selected, comments can be populated, and confirming with OK updates the item's Current Assignee(s) column to the newly selected user.

## Preconditions
- [ ] App is reachable at https://pd-approvals-adminportal-qa.azurewebsites.net/
- [ ] Initiator credentials are valid (Ian / 123qwe)
- [ ] The Memos Dashboard has at least one "In Progress" item whose current assignee is not already Craig M
- [ ] A second user ("Craig M") is available as a reassignment target and is not the currently logged-in user

## Test Cases

### TC-01 — Verify Reassign Function (ADO #106169)

- **Type:** Happy path
- **Steps:**
  1. NAVIGATE to https://pd-approvals-adminportal-qa.azurewebsites.net/login and log in as Ian (initiator)
  2. CLICK the view-mode control, then CLICK "Latest" in the popover
  3. CLICK the sidebar toggle
  4. CLICK on the Memos dropdown
  5. CLICK the Dashboard menu item — the Memos Dashboard index table opens
  6. CLICK on an item from the index table with "In Progress" status, only on top of the item (e.g. the ref number cell) to highlight it — do not open its detail view
  7. CLICK the Reassign button that appears above the table
  8. CLICK the Step dropdown in the Reassign dialog and select the current active step
  9. CLICK the Assignee dropdown and select a user other than the current logged-in user (Craig M)
  10. POPULATE the Comments field
  11. CLICK the OK button
- **Expected result:** Ian is authenticated. The Memos Dashboard opens via Memos → Dashboard. Highlighting an "In Progress" item (by its ref number) surfaces a Reassign button above the table. Clicking it opens a Reassign dialog showing the current active step and a selectable list of assignees. Selecting a different assignee and populating comments enables OK; clicking OK updates the item's Current Assignee(s) column to show the newly selected user.
- **Assertions:**
  - [x] ASSERT (BLOCKING) Ian successfully logs into the system
  - [x] ASSERT (BLOCKING) App header switches from "Live" to "Latest" mode after selecting the "Latest" option
  - [x] ASSERT (BLOCKING) The Memos Dashboard index table opens via Memos → Dashboard
  - [x] ASSERT (BLOCKING) Highlighting an "In Progress" item's ref number reveals a visible Reassign button
  - [x] ASSERT (BLOCKING) Clicking Reassign opens a Reassign dialog
  - [x] ASSERT (BLOCKING) The current active step is displayed in the dialog
  - [x] ASSERT (BLOCKING) The Assignee dropdown lists selectable users
  - [x] ASSERT (BLOCKING) Comments can be populated
  - [x] ASSERT (BLOCKING) Clicking OK updates the Current Assignee(s) column to the newly selected user

---

## Teardown
- Log out of the admin portal after test completion (optional for automated runs).
