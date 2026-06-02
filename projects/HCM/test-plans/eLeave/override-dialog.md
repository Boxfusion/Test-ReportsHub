# Test Plan: ELEAVE-OVERRIDE — Override Dialog

> **Status:** Ready
> **Owner:** QA
> **Last Updated:** 2026-06-02
> **Estimated Duration:** 105s

## Metadata
| Field | Value |
|-------|-------|
| App URL | https://pd-hcm-adminportal-qa.azurewebsites.net/ |
| Environment | QA |
| Login As | admin / P@ssw0rd |
| ADO Plan | [#79625](https://dev.azure.com/boxfusion/pd-Hcm/_testPlans/define?planId=79625&suiteId=86596) |
| ADO Suite | #86596 — eleave-wf-override-dialogbox |

## Objective
> Validate the **Override** dialog of eLeave — the OK action (overrides the approver's decision to approve without pay, changes the status to 'Approved With Full Pay' and redirects to Home) and the Close action (dismisses the dialog and re-displays the leave application details).

## Preconditions
- [ ] App is reachable at https://pd-hcm-adminportal-qa.azurewebsites.net/
- [ ] Admin credentials are valid (admin / P@ssw0rd)
- [ ] At least one leave application exists that was approved without pay and is available to override
- [ ] The acting user has the role required to override the approver's decision

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

### TC-02 — System should override the decision to approve without pay when 'Ok' button is clicked (ADO #86598)

*When a user clicks on the 'Ok' button, the system should override the decision taken by the approver to approve without pay and redirect the user to the Home page - The status should change to 'Approved With Full Pay'*

- **Type:** Happy path
- **Steps:**
  1. SNAPSHOT — confirm the target element for: Open the eleave-wf-override-dialogbox
  2. CLICK Open the eleave-wf-override-dialogbox
  3. SNAPSHOT — confirm the target element for: Click on the 'Ok' button
  4. CLICK Click on the 'Ok' button
- **Expected result:** The system overrides the decision taken by the approver to approve without pay
- **Assertions:**
  - [x] ASSERT (BLOCKING) The system overrides the decision taken by the approver to approve without pay

---

### TC-03 — Status should change to 'Approved With Full Pay' when 'Ok' button is clicked (ADO #86599)

*When a user clicks on the 'Ok' button, the system should override the decision taken by the approver to approve without pay and redirect the user to the Home page - The status should change to 'Approved With Full Pay'*

- **Type:** Happy path
- **Steps:**
  1. SNAPSHOT — confirm the target element for: Open the eleave-wf-override-dialogbox
  2. CLICK Open the eleave-wf-override-dialogbox
  3. SNAPSHOT — confirm the target element for: Click on the 'Ok' button
  4. CLICK Click on the 'Ok' button
- **Expected result:** The status changes to 'Approved With Full Pay'
- **Assertions:**
  - [x] ASSERT (BLOCKING) The status changes to 'Approved With Full Pay'

---

### TC-04 — User should be redirected to the Home page when 'Ok' button is clicked (ADO #86600)

*When a user clicks on the 'Ok' button, the system should override the decision taken by the approver to approve without pay and redirect the user to the Home page - The status should change to 'Approved With Full Pay'*

- **Type:** Happy path
- **Steps:**
  1. SNAPSHOT — confirm the target element for: Open the eleave-wf-override-dialogbox
  2. CLICK Open the eleave-wf-override-dialogbox
  3. SNAPSHOT — confirm the target element for: Click on the 'Ok' button
  4. CLICK Click on the 'Ok' button
- **Expected result:** The user is redirected to the Home page
- **Assertions:**
  - [x] ASSERT (BLOCKING) The user is redirected to the Home page

---

### TC-05 — When a user clicks on the 'Close' button, the system should close the dialog (ADO #86602)

*When a user clicks on the 'Close' button, the system should close the dialog and display the leave application details*

- **Type:** Happy path
- **Steps:**
  1. SNAPSHOT — confirm the target element for: Open the eleave-wf-override-dialogbox
  2. CLICK Open the eleave-wf-override-dialogbox
  3. SNAPSHOT — confirm the target element for: Click on the 'Close' button
  4. CLICK Click on the 'Close' button
- **Expected result:** The dialog closes
- **Assertions:**
  - [x] ASSERT (BLOCKING) The dialog closes

---

### TC-06 — When a user clicks on the 'Close' button, the system should display the leave application details (ADO #86603)

*When a user clicks on the 'Close' button, the system should close the dialog and display the leave application details*

- **Type:** Happy path
- **Steps:**
  1. SNAPSHOT — confirm the target element for: Open the eleave-wf-override-dialogbox
  2. CLICK Open the eleave-wf-override-dialogbox
  3. SNAPSHOT — confirm the target element for: Click on the 'Close' button
  4. CLICK Click on the 'Close' button
- **Expected result:** The leave application details are displayed
- **Assertions:**
  - [x] ASSERT (BLOCKING) The leave application details are displayed

---

## Teardown
- Log out of the admin portal after test completion (optional for automated runs).
