# Test Plan: ELEAVE-EDIT-CREDITS — Edit Leave Credits Dialog

> **Status:** Ready
> **Owner:** QA
> **Last Updated:** 2026-06-02
> **Estimated Duration:** 75s

## Metadata
| Field | Value |
|-------|-------|
| App URL | https://pd-hcm-adminportal-qa.azurewebsites.net/ |
| Environment | QA |
| Login As | admin / P@ssw0rd |
| ADO Plan | [#79625](https://dev.azure.com/boxfusion/pd-Hcm/_testPlans/define?planId=79625&suiteId=86632) |
| ADO Suite | #86632 — eleave-wf-leavebalancesadmimistration-edit-dialog |

## Objective
> Validate the **Edit Leave Credits** dialog of eLeave — the OK action (saves the updated information and redirects to the Leave Balances dashboard) and the Close action (dismisses the dialog).

## Preconditions
- [ ] App is reachable at https://pd-hcm-adminportal-qa.azurewebsites.net/
- [ ] Admin credentials are valid (admin / P@ssw0rd)
- [ ] At least one leave balance record exists that can be edited from the Leave Balances Administration table
- [ ] The acting user has the role required to administer leave balances

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

### TC-02 — System should save the updated information when 'OK' button is clicked (ADO #86634)

*When a user clicks on the 'OK' button, the system should save the updated information and redirect the user to the Leave Balances dashboard*

- **Type:** Happy path
- **Steps:**
  1. SNAPSHOT — confirm the target element for: Open the eleave-wf-leavebalancesadmimistration-edit-dialog
  2. CLICK Open the eleave-wf-leavebalancesadmimistration-edit-dialog
  3. SNAPSHOT — confirm the target element for: Update information in the form
  4. TYPE Update information in the form
  5. SNAPSHOT — confirm the target element for: Click the 'OK' button
  6. CLICK Click the 'OK' button
- **Expected result:** The system saves the updated information
- **Assertions:**
  - [x] ASSERT (BLOCKING) The system saves the updated information

---

### TC-03 — System should redirect the user to the Leave Balances dashboard when 'OK' button is clicked (ADO #86635)

*When a user clicks on the 'OK' button, the system should save the updated information and redirect the user to the Leave Balances dashboard*

- **Type:** Happy path
- **Steps:**
  1. SNAPSHOT — confirm the target element for: Open the eleave-wf-leavebalancesadmimistration-edit-dialog
  2. CLICK Open the eleave-wf-leavebalancesadmimistration-edit-dialog
  3. SNAPSHOT — confirm the target element for: Click the 'OK' button
  4. CLICK Click the 'OK' button
- **Expected result:** The user is redirected to the Leave Balances dashboard
- **Assertions:**
  - [x] ASSERT (BLOCKING) The user is redirected to the Leave Balances dashboard

---

### TC-04 — When a user clicks on the 'Close' button, the system should close the dialog (ADO #86637)

*When a user clicks on the 'Close' button, the system should close the dialog*

- **Type:** Happy path
- **Steps:**
  1. SNAPSHOT — confirm the target element for: Open the eleave-wf-leavebalancesadmimistration-edit-dialog
  2. CLICK Open the eleave-wf-leavebalancesadmimistration-edit-dialog
  3. SNAPSHOT — confirm the target element for: Click on the 'Close' button
  4. CLICK Click on the 'Close' button
- **Expected result:** The dialog closes
- **Assertions:**
  - [x] ASSERT (BLOCKING) The dialog closes

---

## Teardown
- Log out of the admin portal after test completion (optional for automated runs).
