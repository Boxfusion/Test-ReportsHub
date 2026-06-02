# Test Plan: ELEAVE-RECOMMEND — Recommend Leave Application

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
| ADO Plan | [#79625](https://dev.azure.com/boxfusion/pd-Hcm/_testPlans/define?planId=79625&suiteId=86537) |
| ADO Suite | #86537 — eleave-wf-recommendleaveapplication-details |

## Objective
> Validate the **Recommend Leave Application** workflow step of eLeave — viewing captured details, downloading supporting documents, declaration enforcement, and the Recommend / Not Recommend / Refer Back / Close actions with their routing.

## Preconditions
- [ ] App is reachable at https://pd-hcm-adminportal-qa.azurewebsites.net/
- [ ] Admin credentials are valid (admin / P@ssw0rd)
- [ ] At least one leave application exists and is routed to the **Recommend Leave Application** step (for the action/verification cases)
- [ ] The acting user has the role required to perform the Recommend Leave Application step

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

### TC-02 — User cannot action the item without checking the declaration checkbox (ADO #86539)

*The system should not allow a user to action the item without checking the declaration checkbox*

- **Type:** Negative
- **Steps:**
  1. NAVIGATE Navigate to the eleave-wf-recommendleaveapplication-details view
  2. SNAPSHOT — confirm the target element for: Attempt to action the item without checking the declaration checkbox
  3. CLICK Attempt to action the item without checking the declaration checkbox
- **Expected result:** The system does not allow the user to action the item unless the declaration checkbox is checked
- **Assertions:**
  - [x] ASSERT (BLOCKING) The system does not allow the user to action the item unless the declaration checkbox is checked

---

### TC-03 — When a user clicks on the 'Recommend' button, the system should route the item to the next step (ADO #86541)

*When a user clicks on the 'Recommend' button, the system should route the item to the next step and redirect the user to the Home page*

- **Type:** Happy path
- **Steps:**
  1. NAVIGATE Navigate to the 'eleave-wf-recommendleaveapplication-details' view
  2. SNAPSHOT Locate the 'Recommend' button
  3. SNAPSHOT — confirm the target element for: Click on the 'Recommend' button
  4. CLICK Click on the 'Recommend' button
- **Expected result:** The item is routed to the next step in the workflow
- **Assertions:**
  - [x] ASSERT (BLOCKING) The item is routed to the next step in the workflow

---

### TC-04 — When a user clicks on the 'Recommend' button, the system should redirect the user to the Home page (ADO #86542)

*When a user clicks on the 'Recommend' button, the system should route the item to the next step and redirect the user to the Home page*

- **Type:** Happy path
- **Steps:**
  1. NAVIGATE Navigate to the 'eleave-wf-recommendleaveapplication-details' view
  2. SNAPSHOT Locate the 'Recommend' button
  3. SNAPSHOT — confirm the target element for: Click on the 'Recommend' button
  4. CLICK Click on the 'Recommend' button
- **Expected result:** The user is redirected to the Home page
- **Assertions:**
  - [x] ASSERT (BLOCKING) The user is redirected to the Home page

---

### TC-05 — When a user clicks on the 'Not Recommend' button, the system should display a 'Not Recommend' dialog (ADO #86544)

*When a user clicks on the 'Not Recommend' button, the system should display a 'Not Recommend' dialog*

- **Type:** Happy path
- **Steps:**
  1. NAVIGATE Navigate to the eleave-wf-recommendleaveapplication-details view
  2. SNAPSHOT — confirm the target element for: Click on the 'Not Recommend' button
  3. CLICK Click on the 'Not Recommend' button
- **Expected result:** The system displays a 'Not Recommend' dialog
- **Assertions:**
  - [x] ASSERT (BLOCKING) The system displays a 'Not Recommend' dialog

---

### TC-06 — When a user clicks on the 'Refer Back' button, the system should display a 'Refer Back' dialog (ADO #86546)

*When a user clicks on the 'Refer Back' button, the system should display a 'Refer Back' dialog*

- **Type:** Happy path
- **Steps:**
  1. NAVIGATE Navigate to the eleave-wf-recommendleaveapplication-details view
  2. SNAPSHOT — confirm the target element for: Click on the 'Refer Back' button
  3. CLICK Click on the 'Refer Back' button
- **Expected result:** The 'Refer Back' dialog is displayed
- **Assertions:**
  - [x] ASSERT (BLOCKING) The 'Refer Back' dialog is displayed

---

### TC-07 — When a user clicks on the 'Close' button, the system should display a 'Close Leave Application' dialog (ADO #86548)

*When a user clicks on the 'Close' button, the system should display a 'Close Leave Application' dialog*

- **Type:** Happy path
- **Steps:**
  1. NAVIGATE Navigate to the eleave-wf-recommendleaveapplication-details view
  2. SNAPSHOT — confirm the target element for: Click on the 'Close' button
  3. CLICK Click on the 'Close' button
- **Expected result:** The system displays a 'Close Leave Application' dialog
- **Assertions:**
  - [x] ASSERT (BLOCKING) The system displays a 'Close Leave Application' dialog

---

### TC-08 — Ensure user cannot action leave application without downloading supporting documents if attached (ADO #86550)

*The system should not allow a user to action a leave application without downloading and reviewing the supporting documents if attached*

- **Type:** Negative
- **Steps:**
  1. NAVIGATE Navigate to the leave application page
  2. SNAPSHOT Attach supporting documents to the leave application
  3. SNAPSHOT — confirm the target element for: Attempt to action the leave application without downloading the attached documents
  4. CLICK Attempt to action the leave application without downloading the attached documents
- **Expected result:** The system prevents the user from actioning the leave application and prompts the user to download and review the attached supporting documents
- **Assertions:**
  - [x] ASSERT (BLOCKING) The system prevents the user from actioning the leave application and prompts the user to download and review the attached supporting documents

---

### TC-09 — User should be able to view captured leave application details (ADO #86552)

*A user should be able to view the captured leave application details and download supporting documents*

- **Type:** Happy path
- **Steps:**
  1. NAVIGATE Navigate to the eleave-wf-recommendleaveapplication-details view
  2. SNAPSHOT Verify the captured leave application details are visible
- **Expected result:** The captured leave application details are displayed on the screen
- **Assertions:**
  - [x] ASSERT (BLOCKING) The captured leave application details are displayed on the screen

---

### TC-10 — User should be able to download supporting documents (ADO #86553)

*A user should be able to view the captured leave application details and download supporting documents*

- **Type:** Happy path
- **Steps:**
  1. NAVIGATE Navigate to the eleave-wf-recommendleaveapplication-details view
  2. SNAPSHOT Locate the option to download supporting documents
  3. SNAPSHOT — confirm the target element for: Click the download option
  4. CLICK Click the download option
- **Expected result:** The supporting documents are downloaded successfully
- **Assertions:**
  - [x] ASSERT (BLOCKING) The supporting documents are downloaded successfully

---

## Teardown
- Log out of the admin portal after test completion (optional for automated runs).
