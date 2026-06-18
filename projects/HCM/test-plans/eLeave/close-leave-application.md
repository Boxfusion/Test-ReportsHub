# Test Plan: ELEAVE-CLOSE — Close Leave Application

> **Status:** Ready
> **Owner:** QA
> **Last Updated:** 2026-06-02
> **Estimated Duration:** 90s

## Metadata
| Field | Value |
|-------|-------|
| App URL | https://pd-hcm-adminportal-qa.shesha.app/ |
| Environment | QA |
| Login As | admin / P@ssw0rd |
| ADO Plan | [#79625](https://dev.azure.com/boxfusion/pd-Hcm/_testPlans/define?planId=79625&suiteId=86516) |
| ADO Suite | #86516 — eleave-wf-closeleaveapplication-dialogbox |

## Objective
> Validate the **Close Leave Application** dialog of eLeave — the OK action (closes the application and redirects to Home) and the Cancel action (dismisses the dialog and returns to the New Leave Application page).

## Preconditions
- [ ] App is reachable at https://pd-hcm-adminportal-qa.shesha.app/
- [ ] Admin credentials are valid (admin / P@ssw0rd)
- [ ] At least one leave application exists and is routed to the **Close Leave Application** step (for the action/verification cases)
- [ ] The acting user has the role required to perform the Close Leave Application step

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

### TC-02 — System should close the leave application when 'Ok' button is clicked (ADO #86518)

*When a user clciks on the 'Ok' button, the system should close the leave application and redirect the user to the Home page*

- **Type:** Happy path
- **Steps:**
  1. SNAPSHOT — confirm the target element for: Open the leave application dialog box
  2. CLICK Open the leave application dialog box
  3. SNAPSHOT — confirm the target element for: Click on the 'Ok' button
  4. CLICK Click on the 'Ok' button
- **Expected result:** The leave application is closed
- **Assertions:**
  - [x] ASSERT (BLOCKING) The leave application is closed

---

### TC-03 — System should redirect the user to the Home page when 'Ok' button is clicked (ADO #86519)

*When a user clciks on the 'Ok' button, the system should close the leave application and redirect the user to the Home page*

- **Type:** Happy path
- **Steps:**
  1. SNAPSHOT — confirm the target element for: Open the leave application dialog box
  2. CLICK Open the leave application dialog box
  3. SNAPSHOT — confirm the target element for: Click on the 'Ok' button
  4. CLICK Click on the 'Ok' button
- **Expected result:** The user is redirected to the Home page
- **Assertions:**
  - [x] ASSERT (BLOCKING) The user is redirected to the Home page

---

### TC-04 — Clicking the 'Cancel' button should close the dialog (ADO #86521)

*When a user clicks on the 'Cancel' button, the system should close the dialog and display the 'New Leave Application' page*

- **Type:** Happy path
- **Steps:**
  1. SNAPSHOT — confirm the target element for: Open the 'eleave-wf-closeleaveapplication-dialogbox' dialog
  2. CLICK Open the 'eleave-wf-closeleaveapplication-dialogbox' dialog
  3. SNAPSHOT — confirm the target element for: Click on the 'Cancel' button
  4. CLICK Click on the 'Cancel' button
- **Expected result:** The dialog closes
- **Assertions:**
  - [x] ASSERT (BLOCKING) The dialog closes

---

### TC-05 — Clicking the 'Cancel' button should display the 'New Leave Application' page (ADO #86522)

*When a user clicks on the 'Cancel' button, the system should close the dialog and display the 'New Leave Application' page*

- **Type:** Happy path
- **Steps:**
  1. SNAPSHOT — confirm the target element for: Open the 'eleave-wf-closeleaveapplication-dialogbox' dialog
  2. CLICK Open the 'eleave-wf-closeleaveapplication-dialogbox' dialog
  3. SNAPSHOT — confirm the target element for: Click on the 'Cancel' button
  4. CLICK Click on the 'Cancel' button
- **Expected result:** The 'New Leave Application' page is displayed
- **Assertions:**
  - [x] ASSERT (BLOCKING) The 'New Leave Application' page is displayed

---

## Teardown
- Log out of the admin portal after test completion (optional for automated runs).
