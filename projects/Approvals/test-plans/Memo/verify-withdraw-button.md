# Test Plan: Verify Withdraw Button Functionality

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
| ADO Test Case | [#102660](https://dev.azure.com/boxfusion/pd-approvals/_workitems/edit/102660) — Verify Withdraw button functionality |

> **Note:** ADO specifies logging in "as Initiator (Craig)". This run uses the credentials supplied for this session (Ian / 123qwe) against the same login page instead.
>
> **Note:** The header's view-mode control opens a popover with three options (Live/Ready/Latest) rather than toggling directly — clicking the control alone does not change the mode. The correct sequence is: click the control to open the popover, then click the "Latest" option inside it, then assert the control's own badge label changes from "Live" to "Latest".
>
> **Note:** This QA environment can sit on an "Initializing..." splash screen for well over the default 15s action timeout before the login form mounts — the login helper uses a generous timeout to tolerate this rather than treating it as a script failure.
>
> **Note:** ADO's field-population step lists Purpose, Background, Discussion, Financial Implications and Recommendation, but omits **Risks** — which [#102637](https://dev.azure.com/boxfusion/pd-approvals/_workitems/edit/102637) already established is also mandatory on this same Compose step. This plan populates Risks as well so Next genuinely navigates to Attachments.
>
> **Note:** Reuses the proven flow from [#102653](https://dev.azure.com/boxfusion/pd-approvals/_workitems/edit/102653) (Live/Latest switch, CC signatory selection via keyboard, per-tab population with retry, and the corrected "Back button appears" check for Next navigation) up through reaching the Attachments step.

## Objective
> Validate that a Withdraw action on the Attachments step can be cancelled (leaving the memo in Draft), and that confirming a Withdraw with comments removes the memo from the active wizard and reflects a "Withdrawn" status in the My Items list.

## Preconditions
- [ ] App is reachable at https://pd-approvals-adminportal-qa.azurewebsites.net/
- [ ] User credentials are valid (Ian / 123qwe)
- [ ] The acting user has permission to create a new Referral memo

## Test Cases

### TC-01 — Verify Withdraw button functionality (ADO #102660)

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
  11. CLICK the Next button
  12. RECORD the memo's Ref No for later verification
  13. CLICK the Withdraw button
  14. CLICK the Cancel button on the Withdraw Memo dialog
  15. CLICK the Withdraw button again
  16. POPULATE comments on the Withdraw Memo dialog
  17. CLICK the OK button
  18. NAVIGATE to My Items and locate the memo by its recorded Ref No
- **Expected result:** Clicking Withdraw shows a Withdraw Memo dialog. Cancel closes it without withdrawing. Withdrawing again with comments populated enables OK; clicking OK withdraws the memo, which then appears in My Items with a "Withdrawn" status.
- **Assertions:**
  - [x] ASSERT (BLOCKING) User successfully logs into the system
  - [x] ASSERT (BLOCKING) App header switches from "Live" to "Latest" mode after selecting the "Latest" option
  - [x] ASSERT (BLOCKING) Clicking Next navigates the wizard to the Attachments step
  - [x] ASSERT (BLOCKING) Clicking Withdraw shows the Withdraw Memo dialog
  - [x] ASSERT (BLOCKING) Clicking Cancel closes the dialog and the Compose/Attachments wizard remains open
  - [x] ASSERT (BLOCKING) Clicking Withdraw again re-opens the dialog
  - [x] ASSERT (BLOCKING) The OK button is enabled once comments are populated
  - [x] ASSERT (BLOCKING) After clicking OK, the memo no longer shows the active wizard (it is withdrawn)
  - [x] ASSERT (BLOCKING) The memo is displayed in the My Items list with a "Withdrawn" status

---

## Teardown
- Log out of the admin portal after test completion (optional for automated runs).
