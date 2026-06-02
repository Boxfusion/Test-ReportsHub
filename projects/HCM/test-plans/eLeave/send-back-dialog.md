# Test Plan: ELEAVE-SEND-BACK — Send Back Dialog

> **Status:** Ready
> **Owner:** QA
> **Last Updated:** 2026-06-02
> **Estimated Duration:** 90s

## Metadata
| Field | Value |
|-------|-------|
| App URL | https://pd-hcm-adminportal-qa.azurewebsites.net/ |
| Environment | QA |
| Login As | admin / P@ssw0rd |
| ADO Plan | [#79625](https://dev.azure.com/boxfusion/pd-Hcm/_testPlans/define?planId=79625&suiteId=86588) |
| ADO Suite | #86588 — eleave-wf-sendback-dialogbox |

## Objective
> Validate the **Send Back** dialog of eLeave — the OK action (sends the leave application back to the selected step), the mandatory-comments enforcement, and the Close action (dismisses the dialog and re-displays the leave application details).

## Preconditions
- [ ] App is reachable at https://pd-hcm-adminportal-qa.azurewebsites.net/
- [ ] Admin credentials are valid (admin / P@ssw0rd)
- [ ] At least one leave application exists and is routed to a step that offers the Send Back action
- [ ] The acting user has the role required to send back a leave application

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

### TC-02 — The 'Ok' button sends the leave application back to the selected step (ADO #86590)

*When a user clicks on the 'Ok' button, the system should send the leave application back to the selected step*

- **Type:** Happy path
- **Steps:**
  1. SNAPSHOT — confirm the target element for: Open the eleave-wf-sendback-dialogbox
  2. CLICK Open the eleave-wf-sendback-dialogbox
  3. SNAPSHOT — confirm the target element for: Click on the 'Ok' button
  4. CLICK Click on the 'Ok' button
- **Expected result:** The system sends the leave application back to the selected step
- **Assertions:**
  - [x] ASSERT (BLOCKING) The system sends the leave application back to the selected step

---

### TC-03 — System should not allow sending back a leave application without comments (ADO #86592)

*The system should not allow a user to send back a leave application without populating comments*

- **Type:** Negative
- **Steps:**
  1. SNAPSHOT — confirm the target element for: Open the eleave-wf-sendback-dialogbox
  2. CLICK Open the eleave-wf-sendback-dialogbox
  3. SNAPSHOT — confirm the target element for: Attempt to send back without entering any comments
  4. CLICK Attempt to send back without entering any comments
- **Expected result:** The system prevents the leave application from being sent back and indicates that comments are required
- **Assertions:**
  - [x] ASSERT (BLOCKING) The system prevents the leave application from being sent back and indicates that comments are required

---

### TC-04 — Close the dialog when the 'Close' button is clicked (ADO #86594)

*When a user clicks on the 'Close' button, the system should close the dialog and display the leave application details*

- **Type:** Happy path
- **Steps:**
  1. SNAPSHOT — confirm the target element for: Open the eleave-wf-sendback-dialogbox
  2. CLICK Open the eleave-wf-sendback-dialogbox
  3. SNAPSHOT — confirm the target element for: Click on the 'Close' button
  4. CLICK Click on the 'Close' button
- **Expected result:** The dialog is closed
- **Assertions:**
  - [x] ASSERT (BLOCKING) The dialog is closed

---

### TC-05 — Display leave application details when the 'Close' button is clicked (ADO #86595)

*When a user clicks on the 'Close' button, the system should close the dialog and display the leave application details*

- **Type:** Happy path
- **Steps:**
  1. SNAPSHOT — confirm the target element for: Open the eleave-wf-sendback-dialogbox
  2. CLICK Open the eleave-wf-sendback-dialogbox
  3. SNAPSHOT — confirm the target element for: Click on the 'Close' button
  4. CLICK Click on the 'Close' button
- **Expected result:** The leave application details are displayed
- **Assertions:**
  - [x] ASSERT (BLOCKING) The leave application details are displayed

---

## Teardown
- Log out of the admin portal after test completion (optional for automated runs).
