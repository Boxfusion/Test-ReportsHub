# Test Plan: ELEAVE-APPROVE-CANCELLATION — Approve Leave Cancellation

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
| ADO Plan | [#79625](https://dev.azure.com/boxfusion/pd-Hcm/_testPlans/define?planId=79625&suiteId=86659) |
| ADO Suite | #86659 — eleave-wf-approveleavecancellation-details |

## Objective
> Validate the **Approve Leave Cancellation** workflow step of eLeave — viewing the captured leave application content, the Approve Cancellation action (and its routing back to the Home page when the application has not been sent to PERSAL), and the Decline Cancellation dialog.

## Preconditions
- [ ] App is reachable at https://pd-hcm-adminportal-qa.shesha.app/
- [ ] Admin credentials are valid (admin / P@ssw0rd)
- [ ] At least one leave application exists and is routed to the **Approve Leave Cancellation** step
- [ ] The acting user has the approver role required to perform the Approve Leave Cancellation step

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

### TC-02 — System should approve the cancellation when 'Approve Cancellation' button is clicked (ADO #86661)

*When a user clicks on the 'Approve Cancellation' button, the system should approve the cancellation and redirect the user to the Home page, if the leave application being canceled was not sent to PERSAL*

- **Type:** Happy path
- **Steps:**
  1. NAVIGATE Navigate to the eleave-wf-approveleavecancellation-details view (leave application not sent to PERSAL)
  2. SNAPSHOT — confirm the target element for: Click on the 'Approve Cancellation' button
  3. CLICK Click on the 'Approve Cancellation' button
- **Expected result:** The system approves the cancellation of the leave application
- **Assertions:**
  - [x] ASSERT (BLOCKING) The system approves the cancellation of the leave application

---

### TC-03 — System should redirect to Home page when 'Approve Cancellation' button is clicked (ADO #86662)

*When a user clicks on the 'Approve Cancellation' button, the system should approve the cancellation and redirect the user to the Home page, if the leave application being canceled was not sent to PERSAL*

- **Type:** Happy path
- **Steps:**
  1. NAVIGATE Navigate to the eleave-wf-approveleavecancellation-details view (leave application not sent to PERSAL)
  2. SNAPSHOT — confirm the target element for: Click on the 'Approve Cancellation' button
  3. CLICK Click on the 'Approve Cancellation' button
- **Expected result:** The system redirects the user to the Home page
- **Assertions:**
  - [x] ASSERT (BLOCKING) The system redirects the user to the Home page

---

### TC-04 — Display 'Decline Leave Cancellation' dialog when 'Decline Cancellation' button is clicked (ADO #86664)

*When a user clicks on the 'Decline Cancellation' button, the system should display a 'Decline Leave Cancellation' dialog*

- **Type:** Happy path
- **Steps:**
  1. NAVIGATE Navigate to the eleave-wf-approveleavecancellation-details view
  2. SNAPSHOT — confirm the target element for: Click on the 'Decline Cancellation' button
  3. CLICK Click on the 'Decline Cancellation' button
- **Expected result:** The system displays the 'Decline Leave Cancellation' dialog
- **Assertions:**
  - [x] ASSERT (BLOCKING) The system displays the 'Decline Leave Cancellation' dialog

---

### TC-05 — Approver should be able to view the leave application content (ADO #86666)

*An approver should be able to view the leave application content that was captured when a user submitted a leave request*

- **Type:** Happy path
- **Steps:**
  1. NAVIGATE Navigate to the eleave-wf-approveleavecancellation-details view
  2. SNAPSHOT — confirm the target element for: Open a leave request submitted by a user
  3. CLICK Open a leave request submitted by a user
  4. SNAPSHOT — confirm the captured leave application content is visible
- **Expected result:** The leave application content captured during the user's leave request submission is displayed to the approver
- **Assertions:**
  - [x] ASSERT (BLOCKING) The leave application content captured during the user's leave request submission is displayed to the approver

---

## Teardown
- Log out of the admin portal after test completion (optional for automated runs).
