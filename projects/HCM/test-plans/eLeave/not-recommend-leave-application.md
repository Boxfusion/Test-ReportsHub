# Test Plan: ELEAVE-NOT-RECOMMEND — Not Recommend Leave Application Dialog

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
| ADO Plan | [#79625](https://dev.azure.com/boxfusion/pd-Hcm/_testPlans/define?planId=79625&suiteId=86606) |
| ADO Suite | #86606 — eleave-wf-notrecommendleaveapplication-dialogbox |

## Objective
> Validate the **Not Recommend Leave Application** dialog of eLeave — the OK action (declines the leave application, sets the status to 'Declined' and redirects to Home), the mandatory-comments enforcement, and the Close action (dismisses the dialog and re-displays the leave application details).

## Preconditions
- [ ] App is reachable at https://pd-hcm-adminportal-qa.azurewebsites.net/
- [ ] Admin credentials are valid (admin / P@ssw0rd)
- [ ] At least one leave application exists and is routed to the **Recommend Leave Application** step
- [ ] The acting user has the role required to not recommend a leave application

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

### TC-02 — System should decline the leave application when 'Ok' button is clicked (ADO #86608)

*When a user clicks on the 'Ok' button, the system should decline the leave application and redirect a user to the Home page - The status should change to 'Declined'*

- **Type:** Happy path
- **Steps:**
  1. SNAPSHOT — confirm the target element for: Open the eleave-wf-notrecommendleaveapplication-dialogbox
  2. CLICK Open the eleave-wf-notrecommendleaveapplication-dialogbox
  3. SNAPSHOT — confirm the target element for: Click on the 'Ok' button
  4. CLICK Click on the 'Ok' button
- **Expected result:** The leave application status changes to 'Declined'
- **Assertions:**
  - [x] ASSERT (BLOCKING) The leave application status changes to 'Declined'

---

### TC-03 — System should redirect to Home page when 'Ok' button is clicked (ADO #86609)

*When a user clicks on the 'Ok' button, the system should decline the leave application and redirect a user to the Home page - The status should change to 'Declined'*

- **Type:** Happy path
- **Steps:**
  1. SNAPSHOT — confirm the target element for: Open the eleave-wf-notrecommendleaveapplication-dialogbox
  2. CLICK Open the eleave-wf-notrecommendleaveapplication-dialogbox
  3. SNAPSHOT — confirm the target element for: Click on the 'Ok' button
  4. CLICK Click on the 'Ok' button
- **Expected result:** The user is redirected to the Home page
- **Assertions:**
  - [x] ASSERT (BLOCKING) The user is redirected to the Home page

---

### TC-04 — System closes the dialog when the 'Close' button is clicked (ADO #86611)

*When a user clicks on the 'Close' button, the system should close the dialog and display the leave application details*

- **Type:** Happy path
- **Steps:**
  1. SNAPSHOT — confirm the target element for: Open the eleave-wf-notrecommendleaveapplication-dialogbox
  2. CLICK Open the eleave-wf-notrecommendleaveapplication-dialogbox
  3. SNAPSHOT — confirm the target element for: Click on the 'Close' button
  4. CLICK Click on the 'Close' button
- **Expected result:** The dialog is closed
- **Assertions:**
  - [x] ASSERT (BLOCKING) The dialog is closed

---

### TC-05 — System displays leave application details when the 'Close' button is clicked (ADO #86612)

*When a user clicks on the 'Close' button, the system should close the dialog and display the leave application details*

- **Type:** Happy path
- **Steps:**
  1. SNAPSHOT — confirm the target element for: Open the eleave-wf-notrecommendleaveapplication-dialogbox
  2. CLICK Open the eleave-wf-notrecommendleaveapplication-dialogbox
  3. SNAPSHOT — confirm the target element for: Click on the 'Close' button
  4. CLICK Click on the 'Close' button
- **Expected result:** The leave application details are displayed
- **Assertions:**
  - [x] ASSERT (BLOCKING) The leave application details are displayed

---

### TC-06 — The system should not allow a user to not recommend a leave application without populating comments (ADO #86614)

*The system should not allow a user to not recommend a leave application without populating comments*

- **Type:** Negative
- **Steps:**
  1. SNAPSHOT — confirm the target element for: Open the eleave-wf-notrecommendleaveapplication-dialogbox
  2. CLICK Open the eleave-wf-notrecommendleaveapplication-dialogbox
  3. SNAPSHOT — confirm the target element for: Attempt to not recommend without entering any comments
  4. CLICK Attempt to not recommend without entering any comments
- **Expected result:** The system prevents the user from not recommending the leave application and prompts for comments
- **Assertions:**
  - [x] ASSERT (BLOCKING) The system prevents the user from not recommending the leave application and prompts for comments

---

## Teardown
- Log out of the admin portal after test completion (optional for automated runs).
