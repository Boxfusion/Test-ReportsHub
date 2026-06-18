# Test Plan: ELEAVE-VERIFY — Verify Leave Application

> **Status:** Ready
> **Owner:** QA
> **Last Updated:** 2026-06-02
> **Estimated Duration:** 150s

## Metadata
| Field | Value |
|-------|-------|
| App URL | https://pd-hcm-adminportal-qa.shesha.app/ |
| Environment | QA |
| Login As | admin / P@ssw0rd |
| ADO Plan | [#79625](https://dev.azure.com/boxfusion/pd-Hcm/_testPlans/define?planId=79625&suiteId=86523) |
| ADO Suite | #86523 — eleave-wf-verifyleaveapplication-details |

## Objective
> Validate the **Verify Leave Application** workflow step of eLeave — viewing captured details, downloading/reviewing supporting documents enforcement, and the Verify / Refer Back / Close actions with their routing.

## Preconditions
- [ ] App is reachable at https://pd-hcm-adminportal-qa.shesha.app/
- [ ] Admin credentials are valid (admin / P@ssw0rd)
- [ ] At least one leave application exists and is routed to the **Verify Leave Application** step (for the action/verification cases)
- [ ] The acting user has the role required to perform the Verify Leave Application step

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

### TC-02 — Verify clicking the 'Verify' button routes the item to the next step (ADO #86525)

*When a user clicks on the 'Verify' button, the system should route the item to the next step and redirect the user to the Home page*

- **Type:** Happy path
- **Steps:**
  1. NAVIGATE Navigate to the eleave-wf-verifyleaveapplication-details view
  2. SNAPSHOT — confirm the target element for: Click on the 'Verify' button
  3. CLICK Click on the 'Verify' button
- **Expected result:** The item is routed to the next step
- **Assertions:**
  - [x] ASSERT (BLOCKING) The item is routed to the next step

---

### TC-03 — Verify clicking the 'Verify' button redirects the user to the Home page (ADO #86526)

*When a user clicks on the 'Verify' button, the system should route the item to the next step and redirect the user to the Home page*

- **Type:** Happy path
- **Steps:**
  1. NAVIGATE Navigate to the eleave-wf-verifyleaveapplication-details view
  2. SNAPSHOT — confirm the target element for: Click on the 'Verify' button
  3. CLICK Click on the 'Verify' button
- **Expected result:** The user is redirected to the Home page
- **Assertions:**
  - [x] ASSERT (BLOCKING) The user is redirected to the Home page

---

### TC-04 — Display 'Refer Back' dialog when 'Refer Back' button is clicked (ADO #86528)

*When a user clicks on the 'Refer Back' button, the system should display a 'Refer Back' dialog*

- **Type:** Happy path
- **Steps:**
  1. NAVIGATE Navigate to the eleave-wf-verifyleaveapplication-details view
  2. SNAPSHOT — confirm the target element for: Click on the 'Refer Back' button
  3. CLICK Click on the 'Refer Back' button
- **Expected result:** The 'Refer Back' dialog is displayed
- **Assertions:**
  - [x] ASSERT (BLOCKING) The 'Refer Back' dialog is displayed

---

### TC-05 — Display 'Close Leave Application' dialog upon clicking 'Close' button (ADO #86530)

*When a user clicks on the 'Close' button, the system should display a 'Close Leave Application' dialog*

- **Type:** Happy path
- **Steps:**
  1. NAVIGATE Navigate to the eleave-wf-verifyleaveapplication-details view
  2. SNAPSHOT — confirm the target element for: Click on the 'Close' button
  3. CLICK Click on the 'Close' button
- **Expected result:** The system displays a 'Close Leave Application' dialog
- **Assertions:**
  - [x] ASSERT (BLOCKING) The system displays a 'Close Leave Application' dialog

---

### TC-06 — System should not allow user to verify leave application without downloading supporting documents if attached (ADO #86532)

*The system should not allow a user to verify a leave application without downloading and reviewing the supporting documents if attached*

- **Type:** Negative
- **Steps:**
  1. NAVIGATE Navigate to the leave application verification page.
  2. SNAPSHOT Ensure there are supporting documents attached to the leave application.
  3. SNAPSHOT — confirm the target element for: Attempt to verify the leave application without downloading the supporting documents.
  4. CLICK Attempt to verify the leave application without downloading the supporting documents.
- **Expected result:** The system prevents the user from verifying the leave application when supporting documents are attached but not downloaded.
- **Assertions:**
  - [x] ASSERT (BLOCKING) The system prevents the user from verifying the leave application when supporting documents are attached but not downloaded.

---

### TC-07 — System should not allow user to verify leave application without reviewing supporting documents if attached (ADO #86533)

*The system should not allow a user to verify a leave application without downloading and reviewing the supporting documents if attached*

- **Type:** Negative
- **Steps:**
  1. NAVIGATE Navigate to the leave application verification page.
  2. SNAPSHOT Ensure there are supporting documents attached to the leave application.
  3. SNAPSHOT Download the supporting documents.
  4. SNAPSHOT — confirm the target element for: Attempt to verify the leave application without reviewing the supporting documents.
  5. CLICK Attempt to verify the leave application without reviewing the supporting documents.
- **Expected result:** The system prevents the user from verifying the leave application when supporting documents are attached but not reviewed.
- **Assertions:**
  - [x] ASSERT (BLOCKING) The system prevents the user from verifying the leave application when supporting documents are attached but not reviewed.

---

### TC-08 — User should be able to view the captured leave application details (ADO #86535)

*A user should be able to view the captured leave application details and download the attached documents.*

- **Type:** Happy path
- **Steps:**
  1. NAVIGATE Navigate to the eleave-wf-verifyleaveapplication-details view
  2. SNAPSHOT Verify that the captured leave application details are displayed
- **Expected result:** The captured leave application details are displayed to the user
- **Assertions:**
  - [x] ASSERT (BLOCKING) The captured leave application details are displayed to the user

---

### TC-09 — User should be able to download the attached documents (ADO #86536)

*A user should be able to view the captured leave application details and download the attached documents.*

- **Type:** Happy path
- **Steps:**
  1. NAVIGATE Navigate to the eleave-wf-verifyleaveapplication-details view
  2. SNAPSHOT Verify that there is an option to download the attached documents
  3. SNAPSHOT — confirm the target element for: Click on the download option
  4. CLICK Click on the download option
- **Expected result:** The attached documents are downloaded successfully
- **Assertions:**
  - [x] ASSERT (BLOCKING) The attached documents are downloaded successfully

---

## Teardown
- Log out of the admin portal after test completion (optional for automated runs).
