# Test Plan: ELEAVE-ACK-WITHOUT-PAY — Acknowledge Leave Approved Without Pay

> **Status:** Ready
> **Owner:** QA
> **Last Updated:** 2026-06-02
> **Estimated Duration:** 195s

## Metadata
| Field | Value |
|-------|-------|
| App URL | https://pd-hcm-adminportal-qa.azurewebsites.net/ |
| Environment | QA |
| Login As | admin / P@ssw0rd |
| ADO Plan | [#79625](https://dev.azure.com/boxfusion/pd-Hcm/_testPlans/define?planId=79625&suiteId=86472) |
| ADO Suite | #86472 — eleave-wf-acknowledgeleaveapprovedwithoutpay-details |

## Objective
> Validate the **Acknowledge Leave Approved Without Pay** workflow step of eLeave — viewing captured details and downloading documents, the supporting-document download/review enforcement, the declaration checkbox enforcement, the Override / Send Back to Approver / Refer Back / Close dialogs, and the Submit action routing with the 'Approved Without Full Pay' status change.

## Preconditions
- [ ] App is reachable at https://pd-hcm-adminportal-qa.azurewebsites.net/
- [ ] Admin credentials are valid (admin / P@ssw0rd)
- [ ] At least one leave application exists and is routed to the **Acknowledge Leave Approved Without Pay** step
- [ ] The acting user has the role required to perform the Acknowledge Leave Approved Without Pay step

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

### TC-02 — Route item to the next step when 'Submit' button is clicked (ADO #86474)

*When a user clicks on the 'Submit' button, the system should route the item to the next step - The status should change to 'Approved Without Full Pay'*

- **Type:** Happy path
- **Steps:**
  1. NAVIGATE Navigate to the eleave-wf-acknowledgeleaveapprovedwithoutpay-details view
  2. SNAPSHOT — confirm the target element for: Click on the 'Submit' button
  3. CLICK Click on the 'Submit' button
- **Expected result:** The item is routed to the next step
- **Assertions:**
  - [x] ASSERT (BLOCKING) The item is routed to the next step

---

### TC-03 — Change status to 'Approved Without Full Pay' when 'Submit' button is clicked (ADO #86475)

*When a user clicks on the 'Submit' button, the system should route the item to the next step - The status should change to 'Approved Without Full Pay'*

- **Type:** Happy path
- **Steps:**
  1. NAVIGATE Navigate to the eleave-wf-acknowledgeleaveapprovedwithoutpay-details view
  2. SNAPSHOT — confirm the target element for: Click on the 'Submit' button
  3. CLICK Click on the 'Submit' button
- **Expected result:** The status changes to 'Approved Without Full Pay'
- **Assertions:**
  - [x] ASSERT (BLOCKING) The status changes to 'Approved Without Full Pay'

---

### TC-04 — System should not allow a user to action an item without checking the declaration box (ADO #86477)

*The system should not allow a user to action an item without checking the declaration box*

- **Type:** Negative
- **Steps:**
  1. NAVIGATE Navigate to the eleave-wf-acknowledgeleaveapprovedwithoutpay-details view
  2. SNAPSHOT — confirm the target element for: Attempt to action an item without checking the declaration box
  3. CLICK Attempt to action an item without checking the declaration box
- **Expected result:** The system does not allow the item to be actioned and indicates the declaration box must be checked
- **Assertions:**
  - [x] ASSERT (BLOCKING) The system does not allow the item to be actioned and indicates the declaration box must be checked

---

### TC-05 — Display 'Override' dialog when 'Override' button is clicked (ADO #86479)

*When a user clicks on the 'Override' button, the system should display a 'Override' dialog*

- **Type:** Happy path
- **Steps:**
  1. NAVIGATE Navigate to the eleave-wf-acknowledgeleaveapprovedwithoutpay-details view
  2. SNAPSHOT — confirm the target element for: Click on the 'Override' button
  3. CLICK Click on the 'Override' button
- **Expected result:** The system displays an 'Override' dialog
- **Assertions:**
  - [x] ASSERT (BLOCKING) The system displays an 'Override' dialog

---

### TC-06 — Display 'Send Back to Approver' dialog when 'Send Back to Approver' button is clicked (ADO #86481)

*When a user clicks on the 'Send Back to Approver' button, the system should display a 'Send Back to Approver' dialog*

- **Type:** Happy path
- **Steps:**
  1. NAVIGATE Navigate to the eleave-wf-acknowledgeleaveapprovedwithoutpay-details view
  2. SNAPSHOT — confirm the target element for: Click on the 'Send Back to Approver' button
  3. CLICK Click on the 'Send Back to Approver' button
- **Expected result:** The 'Send Back to Approver' dialog is displayed
- **Assertions:**
  - [x] ASSERT (BLOCKING) The 'Send Back to Approver' dialog is displayed

---

### TC-07 — Display 'Refer Back' dialog when 'Refer Back' button is clicked (ADO #86483)

*When a user clicks on the 'Refer Back' button, the system should display a 'Refer Back' dialog*

- **Type:** Happy path
- **Steps:**
  1. NAVIGATE Navigate to the eleave-wf-acknowledgeleaveapprovedwithoutpay-details view
  2. SNAPSHOT — confirm the target element for: Click on the 'Refer Back' button
  3. CLICK Click on the 'Refer Back' button
- **Expected result:** The system displays a 'Refer Back' dialog
- **Assertions:**
  - [x] ASSERT (BLOCKING) The system displays a 'Refer Back' dialog

---

### TC-08 — Display 'Close Leave Application' dialog when 'Close' button is clicked (ADO #86485)

*When a user clicks on the 'Close' button, the system should display a 'Close Leave Application' dialog*

- **Type:** Happy path
- **Steps:**
  1. NAVIGATE Navigate to the eleave-wf-acknowledgeleaveapprovedwithoutpay-details view
  2. SNAPSHOT — confirm the target element for: Click on the 'Close' button
  3. CLICK Click on the 'Close' button
- **Expected result:** The system displays a 'Close Leave Application' dialog
- **Assertions:**
  - [x] ASSERT (BLOCKING) The system displays a 'Close Leave Application' dialog

---

### TC-09 — System should not allow action without downloading supporting documents (ADO #86487)

*The system should not allow a user to action a leave application without downloading and reviewing the supporting documents if attached*

- **Type:** Negative
- **Steps:**
  1. NAVIGATE Navigate to the leave application with supporting documents attached
  2. SNAPSHOT — confirm the target element for: Attempt to action the leave application without downloading the attached documents
  3. CLICK Attempt to action the leave application without downloading the attached documents
- **Expected result:** The system prevents the user from actioning the leave application until the supporting documents are downloaded
- **Assertions:**
  - [x] ASSERT (BLOCKING) The system prevents the user from actioning the leave application until the supporting documents are downloaded

---

### TC-10 — System should not allow action without reviewing supporting documents (ADO #86488)

*The system should not allow a user to action a leave application without downloading and reviewing the supporting documents if attached*

- **Type:** Negative
- **Steps:**
  1. NAVIGATE Navigate to the leave application with supporting documents attached
  2. SNAPSHOT — confirm the target element for: Download the attached documents
  3. CLICK Download the attached documents
  4. SNAPSHOT — confirm the target element for: Attempt to action the leave application without reviewing the downloaded documents
  5. CLICK Attempt to action the leave application without reviewing the downloaded documents
- **Expected result:** The system prevents the user from actioning the leave application until the supporting documents are reviewed
- **Assertions:**
  - [x] ASSERT (BLOCKING) The system prevents the user from actioning the leave application until the supporting documents are reviewed

---

### TC-11 — A user should be able to view the captured leave application details (ADO #86490)

*A user should be able to view the captured leave application details and download supporting documents*

- **Type:** Happy path
- **Steps:**
  1. NAVIGATE Navigate to the eleave-wf-acknowledgeleaveapprovedwithoutpay-details view
  2. SNAPSHOT — confirm the captured leave application details are displayed
- **Expected result:** The captured leave application details are displayed
- **Assertions:**
  - [x] ASSERT (BLOCKING) The captured leave application details are displayed

---

### TC-12 — A user should be able to download supporting documents (ADO #86491)

*A user should be able to view the captured leave application details and download supporting documents*

- **Type:** Happy path
- **Steps:**
  1. NAVIGATE Navigate to the eleave-wf-acknowledgeleaveapprovedwithoutpay-details view
  2. SNAPSHOT — confirm the target element for: Click on the download option
  3. CLICK Click on the download option
- **Expected result:** The supporting documents are downloaded successfully
- **Assertions:**
  - [x] ASSERT (BLOCKING) The supporting documents are downloaded successfully

---

## Teardown
- Log out of the admin portal after test completion (optional for automated runs).
