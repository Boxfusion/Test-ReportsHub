# Test Plan: ELEAVE-BALANCES-ADMIN — Leave Balances Administration Table

> **Status:** Ready
> **Owner:** QA
> **Last Updated:** 2026-06-02
> **Estimated Duration:** 165s

## Metadata
| Field | Value |
|-------|-------|
| App URL | https://pd-hcm-adminportal-qa.shesha.app/ |
| Environment | QA |
| Login As | admin / P@ssw0rd |
| ADO Plan | [#79625](https://dev.azure.com/boxfusion/pd-Hcm/_testPlans/define?planId=79625&suiteId=86455) |
| ADO Suite | #86455 — eleave-wf-leavebalancesadmimistration-table |

## Objective
> Validate the **Leave Balances Administration** table of eLeave — the Delete confirmation, Edit Leave Credits dialog, magnifying-glass drill-down, Recalculate Family Leave Balances confirmation, View Audit routing, Add Shared/Personal Credit dialogs and Export to Excel.

## Preconditions
- [ ] App is reachable at https://pd-hcm-adminportal-qa.shesha.app/
- [ ] Admin credentials are valid (admin / P@ssw0rd)
- [ ] At least one leave balance record exists on the Leave Balances Administration table
- [ ] The acting user has the role required to administer leave balances

## Test Cases

### TC-01 — Login as Admin

- **Type:** Happy path
- **Steps:**
  1. NAVIGATE to https://pd-hcm-adminportal-qa.shesha.app/
  2. SNAPSHOT — confirm login page is visible
  3. TYPE Username field with `admin`
  4. TYPE Password field with `P@ssw0rd`
  5. CLICK the Sign In button
  6. WAIT for the home page / workflow inbox to load
- **Expected result:** User is logged in and the eLeave workflow inbox is reachable
- **Assertions:**
  - [x] ASSERT (BLOCKING) URL no longer contains `/login` and the authenticated home page is visible

---

### TC-02 — Display delete confirmation dialog when 'Delete' icon is clicked (ADO #86457)

*When a user clicks on the 'Delete' icon, the system should display the delete confirmation dialog*

- **Type:** Happy path
- **Steps:**
  1. NAVIGATE Navigate to the eleave-wf-leavebalancesadmimistration-table view
  2. SNAPSHOT — confirm the target element for: Click on the 'Delete' icon
  3. CLICK Click on the 'Delete' icon
- **Expected result:** The system displays the delete confirmation dialog
- **Assertions:**
  - [x] ASSERT (BLOCKING) The system displays the delete confirmation dialog

---

### TC-03 — Display 'Edit Leave Credits' dialog when 'Edit' icon is clicked (ADO #86459)

*When a user clicks on the 'Edit' icon, the system should display the 'Edit Leave Credits' dialog*

- **Type:** Happy path
- **Steps:**
  1. NAVIGATE Navigate to the eleave-wf-leavebalancesadmimistration-table view
  2. SNAPSHOT — confirm the target element for: Click on the 'Edit' icon
  3. CLICK Click on the 'Edit' icon
- **Expected result:** The 'Edit Leave Credits' dialog is displayed
- **Assertions:**
  - [x] ASSERT (BLOCKING) The 'Edit Leave Credits' dialog is displayed

---

### TC-04 — Redirect to leave balance details view when 'Magnifying glass' icon is clicked (ADO #86461)

*When a user clicks on the 'Magnifying glass' icon, the system should redirect the user to the leave balance details view*

- **Type:** Happy path
- **Steps:**
  1. NAVIGATE Navigate to the eleave-wf-leavebalancesadmimistration-table view
  2. SNAPSHOT — confirm the target element for: Click on the 'Magnifying glass' icon
  3. CLICK Click on the 'Magnifying glass' icon
- **Expected result:** The system redirects the user to the leave balance details view
- **Assertions:**
  - [x] ASSERT (BLOCKING) The system redirects the user to the leave balance details view

---

### TC-05 — Display confirmation dialog when 'Recalculate Family Leave Balances' button is clicked (ADO #86463)

*When a user clicks on the 'Recalculate Family Leave Balances' button, the system should display the confirmation dialog*

- **Type:** Happy path
- **Steps:**
  1. NAVIGATE Navigate to the eleave-wf-leavebalancesadmimistration-table view
  2. SNAPSHOT — confirm the target element for: Click on the 'Recalculate Family Leave Balances' button
  3. CLICK Click on the 'Recalculate Family Leave Balances' button
- **Expected result:** The system displays the confirmation dialog
- **Assertions:**
  - [x] ASSERT (BLOCKING) The system displays the confirmation dialog

---

### TC-06 — Redirect user to 'Leave Credits Audit Trail' page on 'View Audit' button click (ADO #86465)

*When a user clicks on the 'View Audit' button, the system should redirect the user to the 'Leave Credits Audit Trail' page*

- **Type:** Happy path
- **Steps:**
  1. NAVIGATE Navigate to the eleave-wf-leavebalancesadmimistration-table view
  2. SNAPSHOT — confirm the target element for: Click on the 'View Audit' button
  3. CLICK Click on the 'View Audit' button
- **Expected result:** The system redirects the user to the 'Leave Credits Audit Trail' page
- **Assertions:**
  - [x] ASSERT (BLOCKING) The system redirects the user to the 'Leave Credits Audit Trail' page

---

### TC-07 — Display 'Add a New Shared Leave Balance' dialog on 'Add Shared Credit' button click (ADO #86467)

*When a user clicks on the 'Add Shared Credit' button, the system should display the 'Add a New Shared Leave Balance' dialog*

- **Type:** Happy path
- **Steps:**
  1. NAVIGATE Navigate to the eleave-wf-leavebalancesadmimistration-table view
  2. SNAPSHOT — confirm the target element for: Click on the 'Add Shared Credit' button
  3. CLICK Click on the 'Add Shared Credit' button
- **Expected result:** The 'Add a New Shared Leave Balance' dialog is displayed
- **Assertions:**
  - [x] ASSERT (BLOCKING) The 'Add a New Shared Leave Balance' dialog is displayed

---

### TC-08 — Display 'Add a New Personal Leave Balance' dialog on 'Add Personal Credit' button click (ADO #86469)

*When a user clicks on the 'Add Personal Credit' button, the system should display the 'Add a New Personal Leave Balance' dialog*

- **Type:** Happy path
- **Steps:**
  1. NAVIGATE Navigate to the eleave-wf-leavebalancesadmimistration-table view
  2. SNAPSHOT — confirm the target element for: Click on the 'Add Personal Credit' button
  3. CLICK Click on the 'Add Personal Credit' button
- **Expected result:** The 'Add a New Personal Leave Balance' dialog is displayed
- **Assertions:**
  - [x] ASSERT (BLOCKING) The 'Add a New Personal Leave Balance' dialog is displayed

---

### TC-09 — Export button downloads all leave balances into an Excel sheet (ADO #86471)

*When a user clicks on the 'Export' button, the system should download all the leave balances into an Excel sheet*

- **Type:** Happy path
- **Steps:**
  1. NAVIGATE Navigate to the eleave-wf-leavebalancesadmimistration-table view
  2. SNAPSHOT — confirm the target element for: Click on the 'Export' button
  3. CLICK Click on the 'Export' button
- **Expected result:** The system downloads all the leave balances into an Excel sheet
- **Assertions:**
  - [x] ASSERT (BLOCKING) The system downloads all the leave balances into an Excel sheet

---

## Teardown
- Log out of the admin portal after test completion (optional for automated runs).
