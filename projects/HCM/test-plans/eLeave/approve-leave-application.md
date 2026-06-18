# Test Plan: ELEAVE-APPROVE — Approve Leave Application

> **Status:** Ready
> **Owner:** QA
> **Last Updated:** 2026-06-02
> **Estimated Duration:** 270s

## Metadata
| Field | Value |
|-------|-------|
| App URL | https://pd-hcm-adminportal-qa.shesha.app/ |
| Environment | QA |
| Login As | admin / P@ssw0rd |
| ADO Plan | [#79625](https://dev.azure.com/boxfusion/pd-Hcm/_testPlans/define?planId=79625&suiteId=86492) |
| ADO Suite | #86492 — eleave-wf-approveleaveapplication-details |

## Objective
> Validate the **Approve Leave Application** workflow step of eLeave — declaration enforcement, Approve With Full Pay / Approve Without Pay behaviour, the conditional Attachments field, supporting-document review enforcement, and the Not Approve / Refer Back / Close actions.

## Preconditions
- [ ] App is reachable at https://pd-hcm-adminportal-qa.shesha.app/
- [ ] Admin credentials are valid (admin / P@ssw0rd)
- [ ] At least one leave application exists and is routed to the **Approve Leave Application** step (for the action/verification cases)
- [ ] The acting user has the role required to perform the Approve Leave Application step

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

### TC-02 — User cannot action the item without checking the declaration checkbox (ADO #86494)

*The system should not allow a user to action the item without checking the declaration checkbox*

- **Type:** Negative
- **Steps:**
  1. NAVIGATE Navigate to the eleave-wf-approveleaveapplication-details view
  2. SNAPSHOT — confirm the target element for: Attempt to action the item without checking the declaration checkbox
  3. CLICK Attempt to action the item without checking the declaration checkbox
- **Expected result:** The system does not allow the user to action the item if the declaration checkbox is not checked
- **Assertions:**
  - [x] ASSERT (BLOCKING) The system does not allow the user to action the item if the declaration checkbox is not checked

---

### TC-03 — Approve With Full Pay button should change status to 'Approved With Full Pay' (ADO #86496)

*When a user clicks on the 'Approve With Full Pay' button, the system should approve the leave application with full pay - The status should change to 'Approved With Full Pay'*

- **Type:** Happy path
- **Steps:**
  1. NAVIGATE Navigate to the leave application details view in the eleave-wf-approveleaveapplication-details.
  2. SNAPSHOT — confirm the target element for: Click on the 'Approve With Full Pay' button.
  3. CLICK Click on the 'Approve With Full Pay' button.
- **Expected result:** The status of the leave application changes to 'Approved With Full Pay'.
- **Assertions:**
  - [x] ASSERT (BLOCKING) The status of the leave application changes to 'Approved With Full Pay'.

---

### TC-04 — Display 'Approve Without Pay' dialog on button click (ADO #86498)

*When a user clicks on the 'Approve Without Pay' button, the system should display an 'Approve Without Pay' dialog*

- **Type:** Happy path
- **Steps:**
  1. NAVIGATE Navigate to the eleave-wf-approveleaveapplication-details view
  2. SNAPSHOT — confirm the target element for: Click on the 'Approve Without Pay' button
  3. CLICK Click on the 'Approve Without Pay' button
- **Expected result:** The 'Approve Without Pay' dialog is displayed
- **Assertions:**
  - [x] ASSERT (BLOCKING) The 'Approve Without Pay' dialog is displayed

---

### TC-05 — Display 'Not Approve' dialog when 'Not Approve' button is clicked (ADO #86500)

*When a user clicks on the 'Not Approve' button, the system should display a 'Not Approve' dialog*

- **Type:** Happy path
- **Steps:**
  1. NAVIGATE Navigate to the eleave-wf-approveleaveapplication-details view
  2. SNAPSHOT — confirm the target element for: Click on the 'Not Approve' button
  3. CLICK Click on the 'Not Approve' button
- **Expected result:** The system displays the 'Not Approve' dialog
- **Assertions:**
  - [x] ASSERT (BLOCKING) The system displays the 'Not Approve' dialog

---

### TC-06 — Display 'Approve With Full Pay' button when 'No' is selected for 'Approve without Pay' field (ADO #86502)

*'Approve without Pay' field When a user selects the 'No' option, the system should display the 'Approve With Full Pay' button*

- **Type:** Happy path
- **Steps:**
  1. NAVIGATE Navigate to the eleave-wf-approveleaveapplication-details view
  2. SNAPSHOT Locate the 'Approve without Pay' field
  3. SNAPSHOT — confirm the target element for: Select the 'No' option
  4. SELECT Select the 'No' option
  5. SNAPSHOT Verify the 'Approve With Full Pay' button is displayed
- **Expected result:** The 'Approve With Full Pay' button is displayed when 'No' is selected for the 'Approve without Pay' field
- **Assertions:**
  - [x] ASSERT (BLOCKING) The 'Approve With Full Pay' button is displayed when 'No' is selected for the 'Approve without Pay' field

---

### TC-07 — Display 'Attachments' field when 'Yes' is selected in 'Approve without Pay' (ADO #86504)

*'Approve without Pay' field When a user selects the 'Yes' option, the system should display the 'Attachments' field and the 'Approve Without Pay' button*

- **Type:** Happy path
- **Steps:**
  1. NAVIGATE Navigate to the eleave-wf-approveleaveapplication-details view
  2. SNAPSHOT — confirm the target element for: Select the 'Yes' option for the 'Approve without Pay' field
  3. SELECT Select the 'Yes' option for the 'Approve without Pay' field
- **Expected result:** The 'Attachments' field is displayed
- **Assertions:**
  - [x] ASSERT (BLOCKING) The 'Attachments' field is displayed

---

### TC-08 — Display 'Approve Without Pay' button when 'Yes' is selected in 'Approve without Pay' (ADO #86505)

*'Approve without Pay' field When a user selects the 'Yes' option, the system should display the 'Attachments' field and the 'Approve Without Pay' button*

- **Type:** Happy path
- **Steps:**
  1. NAVIGATE Navigate to the eleave-wf-approveleaveapplication-details view
  2. SNAPSHOT — confirm the target element for: Select the 'Yes' option for the 'Approve without Pay' field
  3. SELECT Select the 'Yes' option for the 'Approve without Pay' field
- **Expected result:** The 'Approve Without Pay' button is displayed
- **Assertions:**
  - [x] ASSERT (BLOCKING) The 'Approve Without Pay' button is displayed

---

### TC-09 — When a user clicks on the 'Refer Back' button, the system should display a 'Refer Back' dialog (ADO #86507)

*When a user clicks on the 'Refer Back' button, the system should display a 'Refer Back' dialog*

- **Type:** Happy path
- **Steps:**
  1. NAVIGATE Navigate to the 'eleave-wf-approveleaveapplication-details' view
  2. SNAPSHOT — confirm the target element for: Click on the 'Refer Back' button
  3. CLICK Click on the 'Refer Back' button
- **Expected result:** The system displays a 'Refer Back' dialog
- **Assertions:**
  - [x] ASSERT (BLOCKING) The system displays a 'Refer Back' dialog

---

### TC-10 — When a user clicks on the 'Close' button, the system should display a 'Close Leave Application' dialog (ADO #86509)

*When a user clicks on the 'Close' button, the system should display a 'Close Leave Application' dialog*

- **Type:** Happy path
- **Steps:**
  1. NAVIGATE Navigate to the eleave-wf-approveleaveapplication-details view
  2. SNAPSHOT — confirm the target element for: Click on the 'Close' button
  3. CLICK Click on the 'Close' button
- **Expected result:** The system displays a 'Close Leave Application' dialog
- **Assertions:**
  - [x] ASSERT (BLOCKING) The system displays a 'Close Leave Application' dialog

---

### TC-11 — The system should not allow a user to action a leave application without downloading supporting documents if attached (ADO #86511)

*The system should not allow a user to action a leave application without downloading and reviewing the supporting documents if attached*

- **Type:** Negative
- **Steps:**
  1. NAVIGATE Navigate to the leave application with attached supporting documents.
  2. SNAPSHOT — confirm the target element for: Attempt to action the leave application without downloading the supporting documents.
  3. CLICK Attempt to action the leave application without downloading the supporting documents.
- **Expected result:** The system prevents the user from actioning the leave application and displays a message indicating that supporting documents must be downloaded first.
- **Assertions:**
  - [x] ASSERT (BLOCKING) The system prevents the user from actioning the leave application and displays a message indicating that supporting documents must be downloaded first.

---

### TC-12 — The system should not allow a user to action a leave application without reviewing supporting documents if attached (ADO #86512)

*The system should not allow a user to action a leave application without downloading and reviewing the supporting documents if attached*

- **Type:** Negative
- **Steps:**
  1. NAVIGATE Navigate to the leave application with attached supporting documents.
  2. SNAPSHOT Download the supporting documents.
  3. SNAPSHOT — confirm the target element for: Attempt to action the leave application without reviewing the supporting documents.
  4. CLICK Attempt to action the leave application without reviewing the supporting documents.
- **Expected result:** The system prevents the user from actioning the leave application and displays a message indicating that supporting documents must be reviewed after downloading.
- **Assertions:**
  - [x] ASSERT (BLOCKING) The system prevents the user from actioning the leave application and displays a message indicating that supporting documents must be reviewed after downloading.

---

### TC-13 — A user should be able to view the captured leave application details (ADO #86514)

*A user should be able to view the captured leave application details and download supporting documents*

- **Type:** Happy path
- **Steps:**
  1. NAVIGATE Navigate to the 'eleave-wf-approveleaveapplication-details' view
  2. SNAPSHOT Verify that the captured leave application details are displayed
- **Expected result:** The captured leave application details are displayed to the user
- **Assertions:**
  - [x] ASSERT (BLOCKING) The captured leave application details are displayed to the user

---

### TC-14 — A user should be able to download supporting documents (ADO #86515)

*A user should be able to view the captured leave application details and download supporting documents*

- **Type:** Happy path
- **Steps:**
  1. NAVIGATE Navigate to the 'eleave-wf-approveleaveapplication-details' view
  2. SNAPSHOT Verify that there is an option to download supporting documents
  3. SNAPSHOT — confirm the target element for: Click on the download option
  4. CLICK Click on the download option
- **Expected result:** The supporting documents are downloaded successfully
- **Assertions:**
  - [x] ASSERT (BLOCKING) The supporting documents are downloaded successfully

---

## Teardown
- Log out of the admin portal after test completion (optional for automated runs).
