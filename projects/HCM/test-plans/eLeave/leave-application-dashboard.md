# Test Plan: ELEAVE-DASHBOARD — Leave Application Dashboard Table

> **Status:** Ready
> **Owner:** QA
> **Last Updated:** 2026-06-02
> **Estimated Duration:** 180s

## Metadata
| Field | Value |
|-------|-------|
| App URL | https://pd-hcm-adminportal-qa.azurewebsites.net/ |
| Environment | QA |
| Login As | admin / P@ssw0rd |
| ADO Plan | [#79625](https://dev.azure.com/boxfusion/pd-Hcm/_testPlans/define?planId=79625&suiteId=86426) |
| ADO Suite | #86426 — eleave-wf-leaveapplicationdashboard-table |

## Objective
> Validate the **Leave Application Dashboard** table of eLeave — bulk selection behaviour (Reassign / Cancel Leave buttons hiding when more than one row is selected), the magnifying-glass drill-down, the View in Z1 as PDF and Print Bulk Z1 actions, the Cancel Leave and Reassign dialogs, and the Export to Excel action.

## Preconditions
- [ ] App is reachable at https://pd-hcm-adminportal-qa.azurewebsites.net/
- [ ] Admin credentials are valid (admin / P@ssw0rd)
- [ ] At least two leave applications exist on the Leave Application Dashboard table
- [ ] The acting user has the role required to view and action the Leave Application Dashboard

## Test Cases

### TC-01 — Login as Admin

- **Type:** Happy path
- **Steps:**
  1. NAVIGATE to https://pd-hcm-adminportal-qa.azurewebsites.net/
  2. SNAPSHOT — confirm login page is visible
  3. TYPE Username field with `admin`
  4. TYPE Password field with `P@ssw0rd`
  5. CLICK the Sign In button
  6. WAIT for the home page / workflow inbox to load
- **Expected result:** User is logged in and the eLeave workflow inbox is reachable
- **Assertions:**
  - [x] ASSERT (BLOCKING) URL no longer contains `/login` and the authenticated home page is visible

---

### TC-02 — 'Reassign' button should disappear when more than one leave application is selected (ADO #86428)

*The system should not allow a user to reassign or cancel leave applications if more than 1 leave application is selected - The 'Reassign' and 'Cancel Leave' buttons should disappear when more than 1 leave application is selected*

- **Type:** Negative
- **Steps:**
  1. NAVIGATE Navigate to the eleave-wf-leaveapplicationdashboard-table view
  2. SNAPSHOT — confirm the target element for: Select more than one leave application
  3. CLICK Select more than one leave application
  4. SNAPSHOT — confirm whether the 'Reassign' button is visible
- **Expected result:** The 'Reassign' button is not visible when more than one leave application is selected
- **Assertions:**
  - [x] ASSERT (BLOCKING) The 'Reassign' button is not visible when more than one leave application is selected

---

### TC-03 — 'Cancel Leave' button should disappear when more than one leave application is selected (ADO #86429)

*The system should not allow a user to reassign or cancel leave applications if more than 1 leave application is selected - The 'Reassign' and 'Cancel Leave' buttons should disappear when more than 1 leave application is selected*

- **Type:** Negative
- **Steps:**
  1. NAVIGATE Navigate to the eleave-wf-leaveapplicationdashboard-table view
  2. SNAPSHOT — confirm the target element for: Select more than one leave application
  3. CLICK Select more than one leave application
  4. SNAPSHOT — confirm whether the 'Cancel Leave' button is visible
- **Expected result:** The 'Cancel Leave' button is not visible when more than one leave application is selected
- **Assertions:**
  - [x] ASSERT (BLOCKING) The 'Cancel Leave' button is not visible when more than one leave application is selected

---

### TC-04 — The system should allow a user to select more than one leave application (ADO #86431)

*The system should allow a user to select more than one leave application*

- **Type:** Happy path
- **Steps:**
  1. NAVIGATE Navigate to the eleave-wf-leaveapplicationdashboard-table view
  2. SNAPSHOT — confirm the target element for: Attempt to select multiple leave applications
  3. CLICK Attempt to select multiple leave applications
- **Expected result:** The system allows the user to select more than one leave application
- **Assertions:**
  - [x] ASSERT (BLOCKING) The system allows the user to select more than one leave application

---

### TC-05 — Redirect to leave application details view when 'Magnifying glass' icon is clicked (ADO #86433)

*When a user clicks on the 'Magnifying glass' icon, the system should redirect the user to the leave application details view*

- **Type:** Happy path
- **Steps:**
  1. NAVIGATE Navigate to the eleave-wf-leaveapplicationdashboard-table view
  2. SNAPSHOT — confirm the target element for: Click on the 'Magnifying glass' icon
  3. CLICK Click on the 'Magnifying glass' icon
- **Expected result:** The system redirects the user to the leave application details view
- **Assertions:**
  - [x] ASSERT (BLOCKING) The system redirects the user to the leave application details view

---

### TC-06 — User clicks on 'View in Z1 as PDF' button (ADO #86435)

*When a user clicks on the 'View in Z1 as PDF' button, the system should display the leave application in a Z1 form as a PDF format*

- **Type:** Happy path
- **Steps:**
  1. NAVIGATE Navigate to the eleave-wf-leaveapplicationdashboard-table view
  2. SNAPSHOT — confirm the target element for: Click on the 'View in Z1 as PDF' button
  3. CLICK Click on the 'View in Z1 as PDF' button
- **Expected result:** The system displays the leave application in a Z1 form as a PDF format
- **Assertions:**
  - [x] ASSERT (BLOCKING) The system displays the leave application in a Z1 form as a PDF format

---

### TC-07 — 'Print Bulk Z1' dialog is displayed when 'Print Bulk Z1' button is clicked (ADO #86437)

*When a user clicks on the 'Print Bulk Z1' button, the system should display the 'Print Bulk Z1' dialog*

- **Type:** Happy path
- **Steps:**
  1. NAVIGATE Navigate to the eleave-wf-leaveapplicationdashboard-table view
  2. SNAPSHOT — confirm the target element for: Click on the 'Print Bulk Z1' button
  3. CLICK Click on the 'Print Bulk Z1' button
- **Expected result:** The 'Print Bulk Z1' dialog is displayed
- **Assertions:**
  - [x] ASSERT (BLOCKING) The 'Print Bulk Z1' dialog is displayed

---

### TC-08 — 'Cancel Leave' dialog is displayed when 'Cancel Leave' button is clicked (ADO #86439)

*When a user clicks on the 'Cancel Leave' button, the system should display the 'Cancel Leave' dialog*

- **Type:** Happy path
- **Steps:**
  1. NAVIGATE Navigate to the eleave-wf-leaveapplicationdashboard-table view
  2. SNAPSHOT — confirm the target element for: Click on the 'Cancel Leave' button
  3. CLICK Click on the 'Cancel Leave' button
- **Expected result:** The 'Cancel Leave' dialog is displayed
- **Assertions:**
  - [x] ASSERT (BLOCKING) The 'Cancel Leave' dialog is displayed

---

### TC-09 — 'Reassign' dialog is displayed when 'Reassign' button is clicked (ADO #86441)

*When a user clicks on the 'Reassign' button, the system should display the 'Reassign' dialog*

- **Type:** Happy path
- **Steps:**
  1. NAVIGATE Navigate to the eleave-wf-leaveapplicationdashboard-table view
  2. SNAPSHOT — confirm the target element for: Click on the 'Reassign' button
  3. CLICK Click on the 'Reassign' button
- **Expected result:** The 'Reassign' dialog is displayed
- **Assertions:**
  - [x] ASSERT (BLOCKING) The 'Reassign' dialog is displayed

---

### TC-10 — Export button downloads all leave applications into an Excel sheet (ADO #86443)

*When a user clicks on the 'Export' button, the system should download all the leave applications into an Excel sheet*

- **Type:** Happy path
- **Steps:**
  1. NAVIGATE Navigate to the eleave-wf-leaveapplicationdashboard-table view
  2. SNAPSHOT — confirm the target element for: Click on the 'Export' button
  3. CLICK Click on the 'Export' button
- **Expected result:** The system downloads all leave applications into an Excel sheet
- **Assertions:**
  - [x] ASSERT (BLOCKING) The system downloads all leave applications into an Excel sheet

---

## Teardown
- Log out of the admin portal after test completion (optional for automated runs).
