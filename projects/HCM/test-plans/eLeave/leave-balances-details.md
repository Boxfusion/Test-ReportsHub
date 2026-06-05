# Test Plan: ELEAVE-BALANCES-DETAILS — Leave Balances Details

> **Status:** Ready
> **Owner:** QA
> **Last Updated:** 2026-06-02
> **Estimated Duration:** 120s

## Metadata
| Field | Value |
|-------|-------|
| App URL | https://pd-hcm-adminportal-qa.shesha.app/ |
| Environment | QA |
| Login As | admin / P@ssw0rd |
| ADO Plan | [#79625](https://dev.azure.com/boxfusion/pd-Hcm/_testPlans/define?planId=79625&suiteId=86444) |
| ADO Suite | #86444 — eleave-wf-leavebalances-details |

## Objective
> Validate the **Leave Balances Details** view of eLeave — the Delete confirmation dialog, the navigation links (leave request, employee, leave type) and the Back button routing back to the dashboard.

## Preconditions
- [ ] App is reachable at https://pd-hcm-adminportal-qa.shesha.app/
- [ ] Admin credentials are valid (admin / P@ssw0rd)
- [ ] At least one leave balance record exists with linked leave request, employee and leave type
- [ ] The acting user has the role required to view the Leave Balances Details

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

### TC-02 — Display delete confirmation dialog when 'Delete' icon is clicked (ADO #86446)

*When a user clicks on the 'Delete' icon, the system should display the delete confirmation dialog*

- **Type:** Happy path
- **Steps:**
  1. NAVIGATE Navigate to the eleave-wf-leavebalances-details view
  2. SNAPSHOT — confirm the target element for: Click on the 'Delete' icon
  3. CLICK Click on the 'Delete' icon
- **Expected result:** The system displays the delete confirmation dialog
- **Assertions:**
  - [x] ASSERT (BLOCKING) The system displays the delete confirmation dialog

---

### TC-03 — Redirect user to leave application details when leave request link is clicked (ADO #86448)

*When a user clicks on the leave request link, the system should redirect the user to the leave application details*

- **Type:** Happy path
- **Steps:**
  1. NAVIGATE Navigate to the eleave-wf-leavebalances-details view
  2. SNAPSHOT — confirm the target element for: Click on the leave request link
  3. CLICK Click on the leave request link
- **Expected result:** The system redirects the user to the leave application details page
- **Assertions:**
  - [x] ASSERT (BLOCKING) The system redirects the user to the leave application details page

---

### TC-04 — Redirect user to employee details upon clicking the employee link (ADO #86450)

*When a user clicks on the employee link, the system should redirect the user to the employee details*

- **Type:** Happy path
- **Steps:**
  1. NAVIGATE Navigate to the eleave-wf-leavebalances-details view
  2. SNAPSHOT — confirm the target element for: Click on the employee link
  3. CLICK Click on the employee link
- **Expected result:** The system redirects the user to the employee details page
- **Assertions:**
  - [x] ASSERT (BLOCKING) The system redirects the user to the employee details page

---

### TC-05 — Redirect user to leave type details when the leave type link is clicked (ADO #86452)

*When a user clicks on the leave type link, the system should redirect the user to the leave type details*

- **Type:** Happy path
- **Steps:**
  1. NAVIGATE Navigate to the eleave-wf-leavebalances-details view
  2. SNAPSHOT — confirm the target element for: Click on the leave type link
  3. CLICK Click on the leave type link
- **Expected result:** The system redirects the user to the leave type details page
- **Assertions:**
  - [x] ASSERT (BLOCKING) The system redirects the user to the leave type details page

---

### TC-06 — Redirect user to dashboard when 'Back' button is clicked (ADO #86454)

*When a user clicks on the 'Back' button, the system should redirect the user to the dashboard*

- **Type:** Happy path
- **Steps:**
  1. NAVIGATE Navigate to the eleave-wf-leavebalances-details view
  2. SNAPSHOT — confirm the target element for: Click on the 'Back' button
  3. CLICK Click on the 'Back' button
- **Expected result:** The system redirects the user to the dashboard
- **Assertions:**
  - [x] ASSERT (BLOCKING) The system redirects the user to the dashboard

---

## Teardown
- Log out of the admin portal after test completion (optional for automated runs).
