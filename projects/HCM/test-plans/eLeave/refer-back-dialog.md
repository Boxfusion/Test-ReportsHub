# Test Plan: ELEAVE-REFER-BACK — Refer Back Dialog

> **Status:** Ready
> **Owner:** QA
> **Last Updated:** 2026-06-02
> **Estimated Duration:** 120s

## Metadata
| Field | Value |
|-------|-------|
| App URL | https://pd-hcm-adminportal-qa.azurewebsites.net/ |
| Environment | QA |
| Login As | admin / P@ssw0rd |
| ADO Plan | [#79625](https://dev.azure.com/boxfusion/pd-Hcm/_testPlans/define?planId=79625&suiteId=86578) |
| ADO Suite | #86578 — eleave-wf-referback-dialogbox |

## Objective
> Validate the **Refer Back** dialog of eLeave — the OK action (refers the application back to the initiator, redirects to Home and sets the status to 'Draft'), the mandatory-comments enforcement, and the Close action (dismisses the dialog and re-displays the leave application details).

## Preconditions
- [ ] App is reachable at https://pd-hcm-adminportal-qa.azurewebsites.net/
- [ ] Admin credentials are valid (admin / P@ssw0rd)
- [ ] At least one leave application exists and is routed to a step that offers the Refer Back action
- [ ] The acting user has the role required to refer back a leave application

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

### TC-02 — The system should refer the leave application back to the initiator when the 'Ok' button is clicked (ADO #86580)

*When a user clicks on the 'Ok' button, the system should refer the leave application back to the initiator and redirect a user to the Home page - The status should change to 'Draft'*

- **Type:** Happy path
- **Steps:**
  1. SNAPSHOT — confirm the target element for: Open the eleave-wf-referback-dialogbox
  2. CLICK Open the eleave-wf-referback-dialogbox
  3. SNAPSHOT — confirm the target element for: Click on the 'Ok' button
  4. CLICK Click on the 'Ok' button
- **Expected result:** The leave application is referred back to the initiator
- **Assertions:**
  - [x] ASSERT (BLOCKING) The leave application is referred back to the initiator

---

### TC-03 — The system should redirect the user to the Home page when the 'Ok' button is clicked (ADO #86581)

*When a user clicks on the 'Ok' button, the system should refer the leave application back to the initiator and redirect a user to the Home page - The status should change to 'Draft'*

- **Type:** Happy path
- **Steps:**
  1. SNAPSHOT — confirm the target element for: Open the eleave-wf-referback-dialogbox
  2. CLICK Open the eleave-wf-referback-dialogbox
  3. SNAPSHOT — confirm the target element for: Click on the 'Ok' button
  4. CLICK Click on the 'Ok' button
- **Expected result:** The user is redirected to the Home page
- **Assertions:**
  - [x] ASSERT (BLOCKING) The user is redirected to the Home page

---

### TC-04 — The status should change to 'Draft' when the 'Ok' button is clicked (ADO #86582)

*When a user clicks on the 'Ok' button, the system should refer the leave application back to the initiator and redirect a user to the Home page - The status should change to 'Draft'*

- **Type:** Happy path
- **Steps:**
  1. SNAPSHOT — confirm the target element for: Open the eleave-wf-referback-dialogbox
  2. CLICK Open the eleave-wf-referback-dialogbox
  3. SNAPSHOT — confirm the target element for: Click on the 'Ok' button
  4. CLICK Click on the 'Ok' button
- **Expected result:** The status of the leave application changes to 'Draft'
- **Assertions:**
  - [x] ASSERT (BLOCKING) The status of the leave application changes to 'Draft'

---

### TC-05 — The system should not allow a user to refer back a leave application without populating comments (ADO #86584)

*The system should not allow a user to refer back a leave application without populating comments*

- **Type:** Negative
- **Steps:**
  1. SNAPSHOT — confirm the target element for: Open the eleave-wf-referback-dialogbox
  2. CLICK Open the eleave-wf-referback-dialogbox
  3. SNAPSHOT — confirm the target element for: Attempt to refer back without entering any comments
  4. CLICK Attempt to refer back without entering any comments
- **Expected result:** The system does not allow the leave application to be referred back and prompts the user to populate comments
- **Assertions:**
  - [x] ASSERT (BLOCKING) The system does not allow the leave application to be referred back and prompts the user to populate comments

---

### TC-06 — Close dialog when the 'Close' button is clicked (ADO #86586)

*When a user clicks on the 'Close' button, the system should close the dialog and display the leave application details*

- **Type:** Happy path
- **Steps:**
  1. SNAPSHOT — confirm the target element for: Open the eleave-wf-referback-dialogbox
  2. CLICK Open the eleave-wf-referback-dialogbox
  3. SNAPSHOT — confirm the target element for: Click on the 'Close' button
  4. CLICK Click on the 'Close' button
- **Expected result:** The dialog is closed
- **Assertions:**
  - [x] ASSERT (BLOCKING) The dialog is closed

---

### TC-07 — Display leave application details when the 'Close' button is clicked (ADO #86587)

*When a user clicks on the 'Close' button, the system should close the dialog and display the leave application details*

- **Type:** Happy path
- **Steps:**
  1. SNAPSHOT — confirm the target element for: Open the eleave-wf-referback-dialogbox
  2. CLICK Open the eleave-wf-referback-dialogbox
  3. SNAPSHOT — confirm the target element for: Click on the 'Close' button
  4. CLICK Click on the 'Close' button
- **Expected result:** The leave application details are displayed
- **Assertions:**
  - [x] ASSERT (BLOCKING) The leave application details are displayed

---

## Teardown
- Log out of the admin portal after test completion (optional for automated runs).
