# Test Plan: ELEAVE-REASSIGN — Reassign Dialog

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
| ADO Plan | [#79625](https://dev.azure.com/boxfusion/pd-Hcm/_testPlans/define?planId=79625&suiteId=86554) |
| ADO Suite | #86554 — eleave-wf-reassign-dialog |

## Objective
> Validate the **Reassign** dialog of eLeave — reassigning an application to a selected step and assignee on OK, the OK button remaining inactive until all mandatory fields are populated, and the ability to select the step to reassign to.

## Preconditions
- [ ] App is reachable at https://pd-hcm-adminportal-qa.azurewebsites.net/
- [ ] Admin credentials are valid (admin / P@ssw0rd)
- [ ] At least one leave application exists that can be reassigned from the Leave Application Dashboard
- [ ] The acting user has the role required to reassign leave applications

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

### TC-02 — Reassign application to selected step when 'OK' button is clicked (ADO #86556)

*When a user clicks on the 'OK' button, the system should reassign the application to the selected step and selected assignee*

- **Type:** Happy path
- **Steps:**
  1. SNAPSHOT — confirm the target element for: Open the eleave-wf-reassign-dialog
  2. CLICK Open the eleave-wf-reassign-dialog
  3. SNAPSHOT — confirm the target element for: Select a step from the available options
  4. SELECT Select a step from the available options
  5. SNAPSHOT — confirm the target element for: Click the 'OK' button
  6. CLICK Click the 'OK' button
- **Expected result:** The application is reassigned to the selected step
- **Assertions:**
  - [x] ASSERT (BLOCKING) The application is reassigned to the selected step

---

### TC-03 — Reassign application to selected assignee when 'OK' button is clicked (ADO #86557)

*When a user clicks on the 'OK' button, the system should reassign the application to the selected step and selected assignee*

- **Type:** Happy path
- **Steps:**
  1. SNAPSHOT — confirm the target element for: Open the eleave-wf-reassign-dialog
  2. CLICK Open the eleave-wf-reassign-dialog
  3. SNAPSHOT — confirm the target element for: Select an assignee from the available options
  4. SELECT Select an assignee from the available options
  5. SNAPSHOT — confirm the target element for: Click the 'OK' button
  6. CLICK Click the 'OK' button
- **Expected result:** The application is reassigned to the selected assignee
- **Assertions:**
  - [x] ASSERT (BLOCKING) The application is reassigned to the selected assignee

---

### TC-04 — The 'Ok' button should remain inactive until a user populates all mandatory fields (ADO #86559)

*The 'Ok' button should remain inactive until a user populated all mandatory fields*

- **Type:** Negative
- **Steps:**
  1. SNAPSHOT — confirm the target element for: Open the eleave-wf-reassign-dialog
  2. CLICK Open the eleave-wf-reassign-dialog
  3. SNAPSHOT — confirm the 'Ok' button is inactive initially
  4. SNAPSHOT — confirm the target element for: Populate all mandatory fields in the dialog
  5. TYPE Populate all mandatory fields in the dialog
  6. SNAPSHOT — confirm the 'Ok' button becomes active after all mandatory fields are populated
- **Expected result:** The 'Ok' button is inactive until all mandatory fields are populated, at which point it becomes active
- **Assertions:**
  - [x] ASSERT (BLOCKING) The 'Ok' button is inactive until all mandatory fields are populated, at which point it becomes active

---

### TC-05 — The system should allow a user to select the step they wish to reassign an assignee to (ADO #86561)

*The system should allow a user to select the step they wish to reassign an assignee to*

- **Type:** Happy path
- **Steps:**
  1. SNAPSHOT — confirm the target element for: Open the eleave-wf-reassign-dialog
  2. CLICK Open the eleave-wf-reassign-dialog
  3. SNAPSHOT — confirm the user can select a step for reassignment
- **Expected result:** The user is able to select a step to which they wish to reassign an assignee
- **Assertions:**
  - [x] ASSERT (BLOCKING) The user is able to select a step to which they wish to reassign an assignee

---

## Teardown
- Log out of the admin portal after test completion (optional for automated runs).
